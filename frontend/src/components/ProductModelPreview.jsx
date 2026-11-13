import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const PRESETS = {
  "model_0_white.glb": new THREE.Matrix4().set(
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

    const filename = item.model_url.split("?")[0].split("/").pop();
    const rotation = PRESETS[filename];
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

        const normalized = new THREE.Group();
        model.position.set(-center.x, -center.y, -bounds.max.z);
        normalized.add(model);
        normalized.scale.setScalar(140 / size.x);
        normalized.rotation.y = -0.1;
        normalized.rotation.x = 0.035;
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
