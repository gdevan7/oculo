import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PHOTO_SIDE, MAX_UPLOAD_BYTES, PhotoError, fitWithin, photoErrorMessage, validateImageFile,
} from "../../src/lib/photoInput.js";

test("a photo within the limit keeps its size", () => {
  assert.deepEqual(fitWithin(1280, 720), { width: 1280, height: 720 });
  assert.deepEqual(fitWithin(MAX_PHOTO_SIDE, 100), { width: MAX_PHOTO_SIDE, height: 100 });
});

test("a large photo is shrunk to the limit and keeps its aspect ratio", () => {
  assert.deepEqual(fitWithin(4000, 3000), { width: 2048, height: 1536 });
  assert.deepEqual(fitWithin(3000, 4000), { width: 1536, height: 2048 });
  assert.deepEqual(fitWithin(8000, 1000, 1000), { width: 1000, height: 125 });
});

test("invalid sizes give an empty result and a thin image never rounds to zero", () => {
  assert.deepEqual(fitWithin(0, 0), { width: 0, height: 0 });
  assert.deepEqual(fitWithin(NaN, 10), { width: 0, height: 0 });
  assert.equal(fitWithin(100000, 1, 100).height, 1);
});

test("image files within the size limit are accepted", () => {
  validateImageFile({ type: "image/jpeg", size: 1024 });
  validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES });
});

test("non-images, empty and oversized files are refused with a readable message", () => {
  for (const file of [undefined, null, {}, { type: "application/pdf", size: 10 }, { type: "image/png", size: 0 }, { type: "image/png", size: MAX_UPLOAD_BYTES + 1 }]) {
    assert.throws(() => validateImageFile(file), (error) => error instanceof PhotoError && error.message.length > 10);
  }
});

test("only PhotoError messages are shown as they are", () => {
  assert.equal(photoErrorMessage(new PhotoError("No face found.")), "No face found.");
  const generic = photoErrorMessage(new TypeError("Cannot read properties of undefined"));
  assert.ok(!generic.includes("undefined"));
  assert.ok(generic.length > 10);
});
