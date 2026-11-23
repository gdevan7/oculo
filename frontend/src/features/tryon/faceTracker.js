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

// Finds the face in one still image (canvas, image or bitmap) and returns its landmarks, or null.
// The tracker is switched to still-image mode for the call and back to video mode afterwards, so the
// caller must not run live detection on the same tracker at the same time.
export async function detectFaceInImage(tracker, image) {
  await tracker.setOptions({ runningMode: "IMAGE" });
  try {
    return tracker.detect(image).faceLandmarks?.[0] ?? null;
  } finally {
    await tracker.setOptions({ runningMode: "VIDEO" });
  }
}
