import { useEffect, useRef } from "react";
import * as THREE from "three";
import { loadGlbFrame, disposeGlbCache } from "./glbFrame.js";
import { createGlassesRig, faceEuler } from "./glassesRig.js";
import { Lead, isPredictionEnabled } from "../../lib/lead.js";
import { facePose } from "../../lib/facePose.js";
import { OneEuro, isFilterEnabled } from "../../lib/oneEuro.js";

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
    const rig = createGlassesRig();
    const { scene, camera, pivot } = rig;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    let model = null, curKey = "", raf = 0, first = true, loadToken = 0, dead = false;
    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      rig.setViewport(w, h);
    };
    const obs = new ResizeObserver(resize); obs.observe(el); resize();
    const disposeModel = () => {
      rig.clearModel();
      model = null;
    };

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
          model = loaded; rig.setModel(loaded);
        }).catch((error) => {
          if (!dead && mine === loadToken) console.error(`[Virtual Try-On] Failed to load GLB: ${glasses.model_url}`, error);
        });
      }
      const ok = Boolean(enabled && model && t?.lm?.[33] && t?.lm?.[263] && t?.lm?.[10] && t?.lm?.[152]);
      if (!ok) { first = true; resetLeads(); lastSample = null; }
      pivot.visible = ok;
      if (ok) {
        const w = el.clientWidth, h = el.clientHeight;

        // MediaPipe landmarks are measured in the unmirrored source video. facePose() maps them
        // onto the stage with the same object-fit: cover crop as the video and builds the glasses
        // axes from the eye line and the face's vertical axis (see lib/facePose.js).
        const pose = facePose(t.lm, { sourceW: t.videoWidth || w, sourceH: t.videoHeight || h, viewW: w, viewH: h });
        const { x, y, scale: s, basisValid } = pose;
        if (basisValid) {
          faceEuler(pose, eul);
          tq.setFromEuler(eul);
        }

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
      rig.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [trackRef]);
  return <div ref={host} className="glasses-scene" />;
}
