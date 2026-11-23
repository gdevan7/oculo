import * as THREE from "three";
import { DEFAULT_FACE_FRONT_MM } from "../../lib/modelPresets.js";

// The 3D scene around the glasses (lights, invisible head occluders, the holder the model hangs in).
// The live camera view and the still-photo try-on both build it here, so the two look the same.

export const GLASSES_Z = 20;
// Share of the head's up/down tilt that the glasses follow (0..1). A head tilted
// down lifts the temple arms above the frame corners as thin spikes; following
// only part of the tilt keeps them pointing straight back. Yaw and roll stay 1:1.
export const PITCH_FOLLOW = 0.3;
// How far back (mm, measured from the front of the frame) the temple arms stay
// visible. A real arm disappears behind the ear about 80 mm behind the hinge;
// without this cut the full 150 mm arm sticks out past the head when it turns.
const ARM_VISIBLE_MM = 85;
// Half-width (mm) of the invisible face block just behind the lenses. It must stay
// narrower than the temple arms (narrowest is about 68 mm from the centre) so the
// near arm is never hidden, but wide enough that a turned face hides the far arm.
const FACE_HALF_MM = 60;
// The block's front face sits DEFAULT_FACE_FRONT_MM behind the glasses' front plane (z = GLASSES_Z = 20),
// i.e. at z = -1. Wrap-around frames such as Noir (model-3) curve back about 19 mm at the lens edges, so
// the front face has to sit behind that curve or the block cuts jagged holes in the rim. Frames that
// curve back further can set their own depth (faceFrontMm) in lib/modelPresets.js.
const faceBlockZ = (frontMm) => GLASSES_Z - frontMm - 50; // box is 100 deep, so its centre is 50 further back

const depthOnly = () => new THREE.MeshBasicMaterial({ colorWrite: false });

export function createGlassesRig() {
  const scene = new THREE.Scene();
  // Pixel units: the camera is sized to the drawing surface with setViewport().
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -3000, 3000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(60, 120, 300);
  scene.add(key);

  const pivot = new THREE.Group();
  scene.add(pivot);
  const occluder = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), depthOnly());
  occluder.scale.set(72, 95, 90);
  occluder.position.set(0, -10, -85);
  occluder.renderOrder = -1;
  pivot.add(occluder);
  // Invisible block behind the ear point: it only writes depth, so anything inside it
  // (the rear of the temple arms) is hidden from every viewing angle, like an ear/hair.
  const armCut = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), depthOnly());
  armCut.scale.set(240, 240, 200);
  armCut.position.set(0, 0, GLASSES_Z - ARM_VISIBLE_MM - 100);
  armCut.renderOrder = -1;
  pivot.add(armCut);
  // Invisible face block (depth only) from just behind the lenses (z = +5) back to z = -100.
  // When the head turns, the far temple arm is hidden behind it instead of showing through the lens.
  const faceBlock = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), depthOnly());
  faceBlock.scale.set(FACE_HALF_MM * 2, 180, 100);
  faceBlock.position.set(0, 0, faceBlockZ(DEFAULT_FACE_FRONT_MM));
  faceBlock.renderOrder = -1;
  pivot.add(faceBlock);
  const holder = new THREE.Group();
  holder.position.set(0, 0, GLASSES_Z);
  pivot.add(holder);

  let model = null;
  const clearModel = () => {
    if (model) holder.remove(model);
    model = null;
    faceBlock.position.z = faceBlockZ(DEFAULT_FACE_FRONT_MM);
  };

  return {
    scene,
    camera,
    pivot,
    setViewport(width, height) {
      camera.left = -width / 2; camera.right = width / 2; camera.top = height / 2; camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    },
    setModel(next) {
      clearModel();
      model = next;
      holder.add(next);
      faceBlock.position.z = faceBlockZ(next.userData.faceFrontMm ?? DEFAULT_FACE_FRONT_MM);
    },
    // Only takes the model out of the scene: the loaded GLB assets are shared and cached (glbFrame.js).
    clearModel,
    // Frees what the rig itself created (not the shared model assets).
    dispose() {
      clearModel();
      for (const mesh of [occluder, armCut, faceBlock]) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    },
  };
}

const basis = new THREE.Matrix4();
const axisX = new THREE.Vector3(), axisY = new THREE.Vector3(), axisZ = new THREE.Vector3();
const rotation = new THREE.Quaternion();

// Head rotation for the glasses (YXZ Euler angles) from a facePose() result with a valid basis.
// The up/down tilt is only partly followed (PITCH_FOLLOW); yaw and roll are 1:1.
export function faceEuler(pose, target = new THREE.Euler()) {
  basis.makeBasis(axisX.fromArray(pose.right), axisY.fromArray(pose.up), axisZ.fromArray(pose.forward));
  rotation.setFromRotationMatrix(basis);
  target.setFromQuaternion(rotation, "YXZ");
  target.x *= PITCH_FOLLOW;
  return target;
}
