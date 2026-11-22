// Where the face tracker's runtime (WASM) and model are loaded from, in the order they are tried.
// The local copy is created by `scripts/fetch-mediapipe.mjs` before `npm run dev` / `npm run build`,
// so at an event with weak internet each device downloads these from our own server instead of
// jsdelivr and Google. If the local copy is missing, the public CDNs are the fallback.
export const MEDIAPIPE_LOCAL = {
  wasm: "/mediapipe/wasm",
  model: "/mediapipe/face_landmarker.task",
};

export const MEDIAPIPE_CDN = {
  wasm: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm",
  model:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
};

export const MEDIAPIPE_SOURCES = [MEDIAPIPE_LOCAL, MEDIAPIPE_CDN];
