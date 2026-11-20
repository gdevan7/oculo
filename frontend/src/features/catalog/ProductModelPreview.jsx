import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { straightenedX } from "../../lib/straightenArms.js";
import { DEFAULT_WIDTH_MM, modelFolder, uprightPreset } from "../../lib/modelPresets.js";

// Moves the flared temple arms (Evergreen) in line with the frame. Works in the model's own units.
function straightenModelArms(model, frontZ, unit) {
  model.updateMatrixWorld(true);
  const parts = [];
  const points = [];
  const v = new THREE.Vector3();
  model.traverse((object) => {
    const attr = object.isMesh && object.geometry?.attributes?.position;
    if (!attr) return;
    const start = points.length;
    for (let i = 0; i < attr.count; i++) {
      v.fromBufferAttribute(attr, i).applyMatrix4(object.matrixWorld);
      points.push({ x: v.x, y: v.y, z: v.z });
    }
    parts.push({ attr, inverse: object.matrixWorld.clone().invert(), start });
  });
  const xs = straightenedX(points, frontZ, unit);
  parts.forEach(({ attr, inverse, start }) => {
    for (let i = 0; i < attr.count; i++) {
      const p = points[start + i];
      v.set(xs[start + i], p.y, p.z).applyMatrix4(inverse);
      attr.setXYZ(i, v.x, v.y, v.z);
    }
    attr.needsUpdate = true;
  });
}

const PRESETS = {
  "model_0_black.glb": new THREE.Matrix4().set(
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0,
    0, 0, 0, 1
  ),
  "model_1_tortoiseshell.glb": new THREE.Matrix4(),
  "model_2_black.glb": new THREE.Matrix4().makeRotationY(-Math.PI / 2),
};

export default function ProductModelPreview({ item }) {
  const hostRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !item?.model_url) return undefined;

    setFailed(false);
    let disposed = false;
    let model = null;
    let renderer = null;
    let observer = null;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-100, 100, 71.4, -71.4, 0.1, 1200);
    camera.position.set(0, 24, 420);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x77716a, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(-100, 160, 260);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdce8ff, 1.1);
    fill.position.set(140, 30, 100);
    scene.add(fill);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      host.appendChild(renderer.domElement);
    } catch (error) {
      setFailed(true);
      return undefined;
    }

    const resize = () => {
      if (disposed || !renderer) return;
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      const halfHeight = 71.4;
      const halfWidth = halfHeight * (width / height);
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const modelPath = item.model_url.split("?")[0];
    const filename = modelPath.split("/").pop();
    const folder = modelFolder(modelPath);
    const upright = uprightPreset(folder);
    const rotation = folder === "model-0" ? PRESETS["model_0_black.glb"]
      : folder === "model-1" ? PRESETS["model_1_tortoiseshell.glb"]
      : folder === "model-2" ? PRESETS["model_2_black.glb"]
      : upright ? new THREE.Matrix4()
      : PRESETS[filename];
    const targetWidthMm = upright?.widthMm ?? DEFAULT_WIDTH_MM;
    if (!rotation) {
      setFailed(true);
      return () => {
        disposed = true;
        observer?.disconnect();
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    }

    new GLTFLoader().load(
      item.model_url,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            if (!object.isMesh) return;
            object.geometry?.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              if (!material) return;
              Object.values(material).forEach((value) => value?.isTexture && value.dispose());
              material.dispose();
            });
          });
          return;
        }

        model = gltf.scene;
        model.applyMatrix4(rotation);
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        if (bounds.isEmpty()) {
          setFailed(true);
          return;
        }
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        bounds.getSize(size);
        bounds.getCenter(center);
        if (!Number.isFinite(size.x) || size.x <= 0) {
          setFailed(true);
          return;
        }

        // Evergreen's temple arms flare outward; line them up with the frame like the other models.
        if (folder === "model-6") straightenModelArms(model, bounds.max.z, size.x / targetWidthMm);

        const normalized = new THREE.Group();
        model.position.set(-center.x, -center.y, -bounds.max.z);
        normalized.add(model);
        normalized.scale.setScalar(targetWidthMm / size.x);
        normalized.rotation.set(0, 0, 0);
        scene.add(normalized);
        resize();
      },
      undefined,
      (error) => {
        console.error("Product model preview failed:", item.model_url, error);
        if (!disposed) setFailed(true);
      }
    );

    return () => {
      disposed = true;
      observer?.disconnect();
      if (model) {
        model.traverse((object) => {
          if (!object.isMesh) return;
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (!material) return;
            Object.values(material).forEach((value) => value?.isTexture && value.dispose());
            material.dispose();
          });
        });
      }
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [item?.id, item?.model_url]);

  return (
    <div className="product-model-preview" ref={hostRef} aria-label={item.name + " 3D model preview"}>
      {failed && <div className="model-preview-fallback"><span>3D preview unavailable</span></div>}
    </div>
  );
}
