import test from "node:test";
import assert from "node:assert/strict";
import { coverCrop } from "../src/lib/coverCrop.js";

test("same aspect ratio: scaled, no crop", () => {
  const c = coverCrop(1280, 720, 640, 360);
  assert.equal(c.coverScale, 0.5);
  assert.deepEqual([c.renderedW, c.renderedH, c.cropX, c.cropY], [640, 360, 0, 0]);
});

test("taller stage crops the sides", () => {
  const c = coverCrop(1280, 720, 360, 640);
  assert.ok(Math.abs(c.coverScale - 640 / 720) < 1e-12);
  assert.ok(c.cropX > 0);
  assert.ok(Math.abs(c.cropY) < 1e-9);
});

test("wider stage crops top and bottom", () => {
  const c = coverCrop(720, 1280, 640, 360);
  assert.ok(c.cropY > 0);
  assert.ok(Math.abs(c.cropX) < 1e-9);
});

test("the video centre always lands on the stage centre", () => {
  for (const [w, h] of [[640, 360], [360, 640], [500, 500], [1000, 300]]) {
    const c = coverCrop(1280, 720, w, h);
    assert.ok(Math.abs(0.5 * c.renderedW - c.cropX - w / 2) < 1e-9);
    assert.ok(Math.abs(0.5 * c.renderedH - c.cropY - h / 2) < 1e-9);
  }
});

test("the stage is always fully covered", () => {
  for (const [w, h] of [[640, 360], [360, 640], [500, 500], [1000, 300]]) {
    const c = coverCrop(1280, 720, w, h);
    assert.ok(c.renderedW >= w - 1e-9 && c.renderedH >= h - 1e-9);
  }
});
