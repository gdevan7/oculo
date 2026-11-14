import { useEffect, useRef } from "react";
import * as THREE from "three";
import { loadGlbFrame, disposeGlbCache } from "./glbFrame.js";

const EYE_MM = 90;
const GLASSES_Z = 20;

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
    const holder = new THREE.Group();
    // Lower the frame slightly relative to the eye landmarks so its top rim
    // sits at/below the eyebrow line instead of riding above it.
    holder.position.set(0, -4, GLASSES_Z);
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

    const m = new THREE.Matrix4(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    const tq = new THREE.Quaternion(), eul = new THREE.Euler();

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
      const ok = Boolean(enabled && model && t?.lm && t?.matrix);
      if (!ok) first = true;
      pivot.visible = ok;
      if (ok) {
        const w = el.clientWidth, h = el.clientHeight, L = t.lm[33], R = t.lm[263];
        m.fromArray(t.matrix).decompose(p, tq, sc);
        eul.setFromQuaternion(tq, "YXZ");

        // Match MediaPipe source coordinates to the exact object-fit: cover crop
        // used by the camera video. Without this, a portrait-ish modal stage crops
        // the video while the AR overlay still assumes the full uncropped frame.
        const sourceW = t.videoWidth || w;
        const sourceH = t.videoHeight || h;
        const coverScale = Math.max(w / sourceW, h / sourceH);
        const renderedW = sourceW * coverScale;
        const renderedH = sourceH * coverScale;
        const cropX = (renderedW - w) / 2;
        const cropY = (renderedH - h) / 2;
        const lx = L.x * renderedW - cropX;
        const ly = L.y * renderedH - cropY;
        const rx = R.x * renderedW - cropX;
        const ry = R.y * renderedH - cropY;
        const eyePx = Math.hypot(rx - lx, ry - ly);
        const s = eyePx / (EYE_MM * Math.max(Math.cos(eul.y), 0.6));
        const x = (lx + rx) / 2 - w / 2;
        const y = h / 2 - (ly + ry) / 2;
        const a = first ? 1 : 0.6;
        pivot.position.x = THREE.MathUtils.lerp(pivot.position.x, x, a);
        pivot.position.y = THREE.MathUtils.lerp(pivot.position.y, y, a);
        pivot.scale.setScalar(THREE.MathUtils.lerp(pivot.scale.x || s, s, first ? 1 : 0.4));
        if (first) pivot.quaternion.copy(tq); else pivot.quaternion.slerp(tq, 0.5);
        first = false;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      dead = true; cancelAnimationFrame(raf); obs.disconnect(); disposeModel(); disposeGlbCache();
      occluder.geometry.dispose(); occluder.material.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [trackRef]);
  return <div ref={host} className="glasses-scene" />;
}
