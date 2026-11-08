import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Preset menyimpan orientasi sumber dan lebar fisik bingkai.
// Setelah orientasi diterapkan, posisi dan skala dihitung dari bounding box aktual.
const PRESETS = {
  "black-acetate.glb": {
    widthMm: 145,
    rotY: -Math.PI / 2,
    yOffsetMm: 0,
  },
};

const loader = new GLTFLoader();
const cache = new Map();

export function isSafeModelUrl(url) {
  if (typeof url !== "string" || !url.trim()) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function load(url) {
  if (!cache.has(url)) {
    const promise = loader.loadAsync(url).then((gltf) => {
      const root = gltf.scene;
      root.traverse((object) => {
        if (!object.isMesh) return;
        object.frustumCulled = false;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          if ("roughness" in material) material.roughness = Math.min(material.roughness, 0.45);
          if ("metalness" in material) material.metalness = 0;
          if (material.map) material.map.anisotropy = 4;
          material.needsUpdate = true;
        }
      });
      return root;
    }).catch((error) => {
      cache.delete(url);
      throw error;
    });
    cache.set(url, promise);
  }
  return cache.get(url);
}

export async function loadGlbFrame(url) {
  if (!isSafeModelUrl(url)) throw new Error(`Unsafe GLB model URL: ${url}`);

  const source = await load(url);
  const filename = url.split("?")[0].split("/").pop();
  const preset = PRESETS[filename];
  if (!preset) throw new Error(`No orientation preset configured for GLB: ${filename}`);

  // Clone the hierarchy so each fitting-room instance can have its own transform.
  const model = source.clone(true);
  model.rotation.set(0, preset.rotY, 0);
  model.updateMatrixWorld(true);

  // Normalize using the real, rotated geometry bounds instead of assuming the
  // source file's dimensions are exact. This prevents off-center/oversized exports.
  const bounds = new THREE.Box3().setFromObject(model);
  if (bounds.isEmpty()) throw new Error(`GLB contains no renderable geometry: ${filename}`);

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  if (!Number.isFinite(size.x) || size.x <= 0) {
    throw new Error(`GLB has invalid width: ${filename}`);
  }

  const scale = preset.widthMm / size.x;
  model.position.set(
    -center.x,
    -center.y + preset.yOffsetMm / scale,
    -bounds.max.z
  );

  const normalized = new THREE.Group();
  normalized.add(model);
  normalized.scale.setScalar(scale);
  normalized.userData.sharedAssets = true;
  normalized.userData.sourceUrl = url;
  normalized.userData.physicalWidthMm = preset.widthMm;
  return normalized;
}

// Shared geometry/material/texture hanya dibebaskan saat scene pemilik cache dilepas.
export function disposeGlbCache() {
  const pending = [...cache.values()];
  cache.clear();
  for (const promise of pending) {
    promise.then((scene) => {
      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          material?.map?.dispose();
          material?.dispose();
        }
      });
    }).catch(() => {});
  }
}