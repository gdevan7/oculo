// Prepares public/mediapipe/ so the try-on can load MediaPipe from our own server.
// Runs automatically before `npm run dev` and `npm run build`. It never fails the build:
// if something cannot be copied or downloaded it only warns, and the app falls back to the CDN.
import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "mediapipe");
const wasmSource = join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

mkdirSync(outDir, { recursive: true });

if (existsSync(wasmSource)) {
  cpSync(wasmSource, join(outDir, "wasm"), { recursive: true });
  console.log("[mediapipe] copied WASM runtime to public/mediapipe/wasm");
} else {
  console.warn("[mediapipe] node_modules/@mediapipe/tasks-vision not found (run npm install). WASM will load from the CDN.");
}

const modelPath = join(outDir, "face_landmarker.task");
if (existsSync(modelPath) && statSync(modelPath).size > 0) {
  console.log("[mediapipe] face_landmarker.task already present");
} else {
  try {
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    writeFileSync(modelPath, Buffer.from(await response.arrayBuffer()));
    console.log("[mediapipe] downloaded face_landmarker.task");
  } catch (error) {
    console.warn(`[mediapipe] could not download the model (${error.message}). It will load from the CDN.`);
  }
}
