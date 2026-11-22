import test from "node:test";
import assert from "node:assert/strict";
import { MEDIAPIPE_CDN, MEDIAPIPE_LOCAL, MEDIAPIPE_SOURCES } from "../../src/lib/mediapipeSources.js";

test("the local copy is tried first and the CDN is the fallback", () => {
  assert.deepEqual(MEDIAPIPE_SOURCES, [MEDIAPIPE_LOCAL, MEDIAPIPE_CDN]);
});

test("local sources are same-origin paths, CDN sources are https", () => {
  for (const url of Object.values(MEDIAPIPE_LOCAL)) assert.ok(url.startsWith("/") && !url.startsWith("//"));
  for (const url of Object.values(MEDIAPIPE_CDN)) assert.ok(url.startsWith("https://"));
});

test("the WASM folder and the model path match what the fetch script writes", () => {
  assert.equal(MEDIAPIPE_LOCAL.wasm, "/mediapipe/wasm");
  assert.equal(MEDIAPIPE_LOCAL.model, "/mediapipe/face_landmarker.task");
});
