import * as THREE from "three";
import { createGlassesRig, faceEuler } from "./glassesRig.js";
import { loadGlbFrame } from "./glbFrame.js";
import { detectFacesInImage } from "./faceTracker.js";
import { facePose, headYawDegrees } from "../../lib/facePose.js";
import { PhotoError, fitWithin, validateImageFile } from "../../lib/photoInput.js";

// Still-photo try-on: a picture (from the camera or a file) with the chosen 3D frame rendered on the face.
// Everything happens in this browser; the picture is never uploaded.

const newCanvas = (width, height) => Object.assign(document.createElement("canvas"), { width, height });

const toPngBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

// Freezes the current camera frame (call it right when the person presses the button).
export function canvasFromVideo(video) {
  const { width, height } = fitWithin(video.videoWidth, video.videoHeight);
  if (!width) throw new PhotoError("The camera picture is not ready yet. Please try again in a moment.");
  const canvas = newCanvas(width, height);
  canvas.getContext("2d").drawImage(video, 0, 0, width, height);
  return canvas;
}

// Decodes a picture file, applying its EXIF rotation so phone photos are not sideways.
export async function canvasFromFile(file) {
  validateImageFile(file);
  let bitmap;
  try {
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file); // older browsers reject the options object
    }
  } catch {
    throw new PhotoError("That picture could not be opened. Please try a JPG, PNG or WebP image.");
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = newCanvas(width, height);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    return canvas;
  } finally {
    bitmap.close?.();
  }
}

// source: a canvas from the functions above. Returns { blob, width, height, yaw } where blob is a PNG of the
// picture with the frame on it (not mirrored) and yaw is how far the head is turned, in degrees.
export async function createPhotoTryOn({ tracker, source, modelUrl }) {
  if (!modelUrl) throw new PhotoError("Choose a frame first.");
  const { width, height } = source;

  const faces = await detectFacesInImage(tracker, source);
  // Up to five faces are found now, but choosing which one gets the frame is not built yet:
  // for now the first one MediaPipe returns is used, as before.
  const landmarks = faces[0];
  if (!landmarks) {
    throw new PhotoError("No face was found in this picture. Face the camera in good light, or try another photo.");
  }
  // The picture is drawn 1:1, so there is no object-fit crop: the view is the picture itself.
  const pose = facePose(landmarks, { sourceW: width, sourceH: height, viewW: width, viewH: height });
  if (!pose?.basisValid) {
    throw new PhotoError("The face could not be measured well enough to place the frame. Please try another picture.");
  }

  let model;
  try {
    model = await loadGlbFrame(modelUrl);
  } catch {
    throw new PhotoError("The 3D frame could not be loaded. Check your connection and try again.");
  }

  const rig = createGlassesRig();
  let renderer;
  try {
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    } catch {
      throw new PhotoError("Your browser could not start 3D rendering. Close other tabs that use the camera or 3D and try again.");
    }
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height, false);
    rig.setViewport(width, height);
    rig.setModel(model);
    rig.pivot.position.set(pose.x, pose.y, 0);
    rig.pivot.scale.setScalar(pose.scale);
    rig.pivot.quaternion.setFromEuler(faceEuler(pose));
    renderer.render(rig.scene, rig.camera);

    const out = newCanvas(width, height);
    const ctx = out.getContext("2d");
    ctx.drawImage(source, 0, 0);
    ctx.drawImage(renderer.domElement, 0, 0);
    const blob = await toPngBlob(out);
    if (!blob) throw new PhotoError("The picture could not be saved. Please try again.");
    return { blob, width, height, yaw: headYawDegrees(pose) };
  } finally {
    // The GLB assets are shared with the live view through a cache, so only the rig and renderer are freed.
    rig.dispose();
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss(); // dispose() alone keeps the WebGL context alive until garbage collection
    }
  }
}
