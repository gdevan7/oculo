import { useEffect, useRef } from "react";
import * as THREE from "three";
import { loadGlbFrame, disposeGlbCache } from "./glbFrame.js";
import { Lead, isPredictionEnabled } from "../../lib/lead.js";
import { coverCrop } from "../../lib/coverCrop.js";
import { OneEuro, isFilterEnabled } from "../../lib/oneEuro.js";

const EYE_MM = 90;
const GLASSES_Z = 20;
// Share of the head's up/down tilt that the glasses follow (0..1). A head tilted
// down lifts the temple arms above the frame corners as thin spikes; following
// only part of the tilt keeps them pointing straight back. Yaw and roll stay 1:1.
const PITCH_FOLLOW = 0.3;
// How far back (mm, measured from the front of the frame) the temple arms stay
// visible. A real arm disappears behind the ear about 80 mm behind the hinge;
// without this cut the full 150 mm arm sticks out past the head when it turns.
const ARM_VISIBLE_MM = 85;
// Half-width (mm) of the invisible face block just behind the lenses. It must stay
// narrower than the temple arms (narrowest is about 68 mm from the centre) so the
// near arm is never hidden, but wide enough that a turned face hides the far arm.
const FACE_HALF_MM = 60;
// The block's front face (z, mm; the glasses' front plane is at GLASSES_Z = 20). Wrap-around
// frames such as Noir (model-3) curve back about 19 mm at the lens edges, so the front face
// has to sit behind that curve or the block cuts jagged holes in the rim.
const FACE_FRONT_Z = -1;

// Latency compensation. Detection runs on the main thread, so every pose is already a few
// frames old when it is drawn. Each channel keeps a smoothed velocity and is drawn slightly
// ahead along it. The lead is capped, and a dead band keeps a still head still.
// Add ?nopredict to the page URL to switch it off for an A/B comparison.
const PREDICT = typeof window === "undefined" || isPredictionEnabled(window.location.search);
// Landmark noise makes the frame shake. A One Euro filter smooths hard while the head is
// nearly still and opens up when it moves, so turns do not lag. ?nofilter turns it off.
const FILTER = typeof window === "undefined" || isFilterEnabled(window.location.search);
const TAU_POS = 0.012, TAU_ROT = 0.03, TAU_SCALE = 0.03; // render smoothing time constants (s)

export default function GlassesScene({ glasses, trackRef, enabled }) {
  const host = useRef(null);
  const props = useRef({ glasses, enabled });
  useEffect(() => { props.current = { glasses, enabled }; }, [glasses, enabled]);

  useEffect(() => {
    const el = host.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -3000, 3000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(60, 120, 300);
    scene.add(key);

    const pivot = new THREE.Group();
    scene.add(pivot);
    const occluder = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ colorWrite: false }));
    occluder.scale.set(72, 95, 90);
    occluder.position.set(0, -10, -85);
    occluder.renderOrder = -1;
    pivot.add(occluder);
    // Invisible block behind the ear point: it only writes depth, so anything inside it
    // (the rear of the temple arms) is hidden from every viewing angle, like an ear/hair.
    const armCut = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ colorWrite: false }));
    armCut.scale.set(240, 240, 200);
    armCut.position.set(0, 0, GLASSES_Z - ARM_VISIBLE_MM - 100);
    armCut.renderOrder = -1;
    pivot.add(armCut);
    // Invisible face block (depth only) from just behind the lenses (z = +5) back to z = -100.
    // When the head turns, the far temple arm is hidden behind it instead of showing through the lens.
    const faceBlock = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ colorWrite: false }));
    faceBlock.scale.set(FACE_HALF_MM * 2, 180, 100);
    faceBlock.position.set(0, 0, FACE_FRONT_Z - 50);
    faceBlock.renderOrder = -1;
    pivot.add(faceBlock);
    const holder = new THREE.Group();
    // Vertical fit relative to the eye landmarks (1 unit is roughly 1 mm).
    // -4 left the lenses too low on the eyes; 0 puts the eyes closer to the lens
    // centre while the top rim still stays below the eyebrow line.
    holder.position.set(0, 0, GLASSES_Z);
    pivot.add(holder);

    let model = null, curKey = "", raf = 0, first = true, loadToken = 0, dead = false;
    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    };
    const obs = new ResizeObserver(resize); obs.observe(el); resize();
    const disposeModel = () => { if (model) holder.remove(model); model = null; };

    const faceBasis = new THREE.Matrix4();
    const eyeLeft = new THREE.Vector3(), eyeRight = new THREE.Vector3();
    const faceTop = new THREE.Vector3(), faceChin = new THREE.Vector3();
    const rightAxis = new THREE.Vector3(), upAxis = new THREE.Vector3(), forwardAxis = new THREE.Vector3();
    const tq = new THREE.Quaternion(), eul = new THREE.Euler();
    const D2R = Math.PI / 180;
    // dead band / lead cap per channel: position in px, scale in ln(scale), angles in radians
    const leads = {
      x: new Lead(12, 12, PREDICT), y: new Lead(12, 12, PREDICT), s: new Lead(0.05, 0.03, PREDICT),
      yaw: new Lead(8 * D2R, 4 * D2R, PREDICT), pitch: new Lead(8 * D2R, 4 * D2R, PREDICT), roll: new Lead(8 * D2R, 4 * D2R, PREDICT),
    };
    // (minCutoff Hz, beta): position in px, scale in ln(scale), angles in radians
    const filters = {
      x: new OneEuro(0.8, 0.01), y: new OneEuro(0.8, 0.01), s: new OneEuro(0.6, 12),
      yaw: new OneEuro(0.4, 5), pitch: new OneEuro(0.4, 5), roll: new OneEuro(0.4, 5),
    };
    const smooth = (name, value, ts) => (FILTER ? filters[name].filter(value, ts) : value);
    const resetLeads = () => { Object.values(leads).forEach((l) => l.reset()); Object.values(filters).forEach((f) => f.reset()); };
    let lastSample = null, lastFrame = performance.now();

    const loop = () => {
      const { glasses, enabled } = props.current;
      const t = trackRef.current;
      const k = glasses?.model_url ? `${glasses.id}|${glasses.model_url}` : "";
      if (k !== curKey) {
        disposeModel(); curKey = k;
        const mine = ++loadToken;
        if (k) loadGlbFrame(glasses.model_url).then((loaded) => {
          if (dead || mine !== loadToken) return;
          model = loaded; holder.add(loaded);
        }).catch((error) => {
          if (!dead && mine === loadToken) console.error(`[Virtual Try-On] Failed to load GLB: ${glasses.model_url}`, error);
        });
      }
      const ok = Boolean(enabled && model && t?.lm?.[33] && t?.lm?.[263] && t?.lm?.[10] && t?.lm?.[152]);
      if (!ok) { first = true; resetLeads(); lastSample = null; }
      pivot.visible = ok;
      if (ok) {
        const w = el.clientWidth, h = el.clientHeight;
        const L = t.lm[33], R = t.lm[263];

        // MediaPipe landmarks are measured in the unmirrored source video.
        // Convert them into source-pixel 3D coordinates (including landmark z),
        // then build the glasses pose from the eye line and the face's vertical axis.
        // This keeps the frame plane turning with the head instead of relying on a
        // yaw angle extracted from the transformation matrix.
        const sourceW = t.videoWidth || w;
        const sourceH = t.videoHeight || h;
        const { coverScale, renderedW, renderedH, cropX, cropY } = coverCrop(sourceW, sourceH, w, h);

        const toFacePoint = (landmark, target) => target.set(
          landmark.x * sourceW,
          -landmark.y * sourceH,
          -landmark.z * sourceW
        );
        toFacePoint(L, eyeLeft);
        toFacePoint(R, eyeRight);
        toFacePoint(t.lm[10], faceTop);
        toFacePoint(t.lm[152], faceChin);

        rightAxis.subVectors(eyeRight, eyeLeft).normalize();
        upAxis.subVectors(faceTop, faceChin);
        upAxis.addScaledVector(rightAxis, -upAxis.dot(rightAxis)).normalize();
        forwardAxis.crossVectors(rightAxis, upAxis).normalize();

        // Guard against incomplete/degenerate landmark geometry during fast turns.
        const basisValid = Number.isFinite(forwardAxis.lengthSq()) &&
          rightAxis.lengthSq() > 0.5 && upAxis.lengthSq() > 0.5 && forwardAxis.lengthSq() > 0.5;
        if (basisValid) {
          faceBasis.makeBasis(rightAxis, upAxis, forwardAxis);
          tq.setFromRotationMatrix(faceBasis);
          eul.setFromQuaternion(tq, "YXZ");
          eul.x *= PITCH_FOLLOW;
          tq.setFromEuler(eul);
        }

        // Apply the same object-fit: cover crop to the eye midpoint as the video.
        const lx = L.x * renderedW - cropX;
        const ly = L.y * renderedH - cropY;
        const rx = R.x * renderedW - cropX;
        const ry = R.y * renderedH - cropY;
        const eyeSpan3D = eyeLeft.distanceTo(eyeRight) * coverScale;
        const s = eyeSpan3D / EYE_MM;
        const x = (lx + rx) / 2 - w / 2;
        const y = h / 2 - (ly + ry) / 2;
        const now = performance.now();
        if (t !== lastSample) {
          // New detection result: update the velocity estimates (timestamped when detection began).
          lastSample = t;
          const ts = t.t ?? now;
          leads.x.push(smooth("x", x, ts), ts); leads.y.push(smooth("y", y, ts), ts);
          leads.s.push(smooth("s", Math.log(s), ts), ts);
          if (basisValid) {
            leads.yaw.push(smooth("yaw", eul.y, ts), ts);
            leads.pitch.push(smooth("pitch", eul.x, ts), ts);
            leads.roll.push(smooth("roll", eul.z, ts), ts);
          }
        }
        // Time-based smoothing keeps the feel the same on 60 Hz and 120 Hz screens and when frames are dropped.
        const dt = Math.min(Math.max(now - lastFrame, 4), 100) / 1000;
        lastFrame = now;
        const aPos = first ? 1 : 1 - Math.exp(-dt / TAU_POS);
        const aRot = first ? 1 : 1 - Math.exp(-dt / TAU_ROT);
        const aScale = first ? 1 : 1 - Math.exp(-dt / TAU_SCALE);
        pivot.position.x = THREE.MathUtils.lerp(pivot.position.x, leads.x.at(now, TAU_POS), aPos);
        pivot.position.y = THREE.MathUtils.lerp(pivot.position.y, leads.y.at(now, TAU_POS), aPos);
        pivot.scale.setScalar(THREE.MathUtils.lerp(pivot.scale.x || s, Math.exp(leads.s.at(now, TAU_SCALE)), aScale));
        if (leads.yaw.has) {
          eul.set(leads.pitch.at(now, TAU_ROT), leads.yaw.at(now, TAU_ROT), leads.roll.at(now, TAU_ROT), "YXZ");
          tq.setFromEuler(eul);
          if (first) pivot.quaternion.copy(tq);
          else pivot.quaternion.slerp(tq, aRot);
        }
        first = false;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      dead = true; cancelAnimationFrame(raf); obs.disconnect(); disposeModel(); disposeGlbCache();
      occluder.geometry.dispose(); occluder.material.dispose();
      armCut.geometry.dispose(); armCut.material.dispose();
      faceBlock.geometry.dispose(); faceBlock.material.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [trackRef]);
  return <div ref={host} className="glasses-scene" />;
}
