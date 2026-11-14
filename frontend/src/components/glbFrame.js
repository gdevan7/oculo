import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const PRESETS = {
  "model_0_white.glb": { widthMm: 160, rotation: new THREE.Matrix4().set(0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1) },
  "model_1_tortoiseshell.glb": { widthMm: 160, rotation: new THREE.Matrix4() },
  "model_2_black.glb": { widthMm: 160, rotation: new THREE.Matrix4().makeRotationY(-Math.PI / 2) }
};
const loader = new GLTFLoader();
const cache = new Map();

export function isSafeModelUrl(url) {
  if (typeof url !== "string" || !url.trim()) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin || parsed.protocol === "https:";
  } catch { return false; }
}

function disposeScene(scene) {
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
      material.dispose();
    }
  });
}

function load(url) {
  if (!cache.has(url)) {
    const promise = loader.loadAsync(url).then((gltf) => {
      gltf.scene.traverse((object) => { if (object.isMesh) object.frustumCulled = false; });
      return gltf.scene;
    }).catch((error) => { cache.delete(url); throw error; });
    cache.set(url, promise);
  }
  return cache.get(url);
}

export async function loadGlbFrame(url) {
  if (!isSafeModelUrl(url)) throw new Error(`Unsafe GLB model URL: ${url}`);
  const filename = url.split("?")[0].split("/").pop();
  const folder = url.split("?")[0].split("/").slice(-2, -1)[0];
  const preset = folder === "model-0" ? PRESETS["model_0_white.glb"]
    : folder === "model-1" ? PRESETS["model_1_tortoiseshell.glb"]
    : folder === "model-2" ? PRESETS["model_2_black.glb"]
    : PRESETS[filename];
  if (!preset) throw new Error(`No orientation preset configured for GLB: ${filename}`);

  const source = await load(url);
  const model = source.clone(true);
  model.applyMatrix4(preset.rotation);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  if (bounds.isEmpty()) throw new Error(`GLB contains no renderable geometry: ${filename}`);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  if (!Number.isFinite(size.x) || size.x <= 0) throw new Error(`GLB has invalid width: ${filename}`);

  const scale = preset.widthMm / size.x;
  model.position.set(-center.x, -center.y, -bounds.max.z);
  const normalized = new THREE.Group();
  normalized.add(model);
  normalized.scale.setScalar(scale);
  normalized.userData.sharedAssets = true;
  normalized.userData.sourceUrl = url;
  normalized.userData.physicalWidthMm = preset.widthMm;
  return normalized;
}

export function disposeGlbCache() {
  const pending = [...cache.values()];
  cache.clear();
  for (const promise of pending) promise.then(disposeScene).catch(() => {});
}
