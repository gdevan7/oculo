import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_SOURCES } from "../../lib/mediapipeSources.js";

// Loads the face landmarker in video mode. Tries our own server first, then the public CDNs;
// within each source it uses the GPU and falls back to the CPU.
export async function createFaceTracker() {
  let lastError;
  for (const source of MEDIAPIPE_SOURCES) {
    try {
      const vision = await FilesetResolver.forVisionTasks(source.wasm);
      const make = (delegate) =>
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: source.model, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? Error("Face tracking model could not be loaded.");
}

// How many faces a still photo is searched for. The live view tracks one face; a photo can have several.
export const MAX_STILL_FACES = 5;

// Finds the faces in one still image (canvas, image or bitmap) and returns a list of landmark arrays
// (empty when there is no face). Up to MAX_STILL_FACES are returned, in the order MediaPipe gives them.
// The tracker is switched to still-image mode (and to MAX_STILL_FACES) for the call and back to video
// mode with one face afterwards, so the caller must not run live detection on the same tracker meanwhile.
export async function detectFacesInImage(tracker, image) {
  await tracker.setOptions({ runningMode: "IMAGE", numFaces: MAX_STILL_FACES });
  try {
    return tracker.detect(image).faceLandmarks ?? [];
  } finally {
    await tracker.setOptions({ runningMode: "VIDEO", numFaces: 1 });
  }
}
