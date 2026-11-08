import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Memuat bingkai kacamata dari file GLB dan menormalkannya ke ruang yang sama
// dengan frameModel.js: milimeter, +X kanan, +Y atas, +Z ke arah kamera, dan
// bidang depan bingkai berada di z = 0.
//
// Setiap file GLB punya orientasi dan skala sendiri, jadi tiap file butuh satu
// entri preset di bawah. Nilainya diukur dari mesh (bukan ditebak):
//   modelWidth  lebar bingkai di sumbu lebarnya (satuan model)
//   widthMm     lebar bingkai depan sebenarnya (mm), menentukan ukuran di wajah
//   rotY        putaran sumbu Y agar bagian depan menghadap +Z
//   frontPlane  posisi bidang depan sepanjang sumbu depan model (satuan model)
//   yOffsetMm   geser vertikal (mm); positif = kacamata naik
const PRESETS = {
  // Model asli: lebar di sumbu Z (1.0), depan di +X, gagang ke -X, atas di +Y.
  "black-acetate.glb": {
    modelWidth: 1.0,
    widthMm: 145,
    rotY: -Math.PI / 2,
    frontPlane: 0.35,
    yOffsetMm: 0,
  },
};
const DEFAULT_PRESET = PRESETS["black-acetate.glb"];

const loader = new GLTFLoader();
const cache = new Map(); // url -> Promise<THREE.Group> (scene asli, dibagi oleh semua klon)

// Hanya path di origin yang sama atau URL https. Frame kamera tidak pernah dikirim ke mana pun.
export function isSafeModelUrl(url) {
  if (typeof url !== "string" || !url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const u = new URL(url, window.location.href);
    return u.origin === window.location.origin || u.protocol === "https:";
  } catch {
    return false;
  }
}

function load(url) {
  if (!cache.has(url)) {
    const p = loader
      .loadAsync(url)
      .then((gltf) => {
        gltf.scene.traverse((o) => {
          if (!o.isMesh) return;
          o.frustumCulled = false;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            // Hasil ekspor memakai roughness 0.9 (terlalu kusam untuk asetat).
            if ("roughness" in m) m.roughness = Math.min(m.roughness, 0.45);
            if ("metalness" in m) m.metalness = 0;
            if (m.map) m.map.anisotropy = 4;
          }
        });
        return gltf.scene;
      })
      .catch((e) => {
        cache.delete(url);
        throw e;
      });
    cache.set(url, p);
  }
  return cache.get(url);
}

export async function loadGlbFrame(url) {
  if (!isSafeModelUrl(url)) throw new Error("Unsupported model URL");
  const scene = await load(url);
  const file = url.split("?")[0].split("/").pop();
  const preset = PRESETS[file] || DEFAULT_PRESET;
  const s = preset.widthMm / preset.modelWidth;

  const inner = scene.clone(true); // geometri dan material dibagi, bukan disalin
  inner.rotation.y = preset.rotY;
  inner.position.set(0, preset.yOffsetMm / s, -preset.frontPlane);

  const group = new THREE.Group();
  group.add(inner);
  group.scale.setScalar(s);
  group.userData.sharedAssets = true; // jangan di-dispose per instance
  return group;
}

// Panggil saat scene dilepas: membebaskan geometri, material, dan tekstur yang di-cache.
export function disposeGlbCache() {
  for (const p of cache.values()) {
    p.then((scene) =>
      scene.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          m.map?.dispose();
          m.dispose();
        }
      })
    ).catch(() => {});
  }
  cache.clear();
}
