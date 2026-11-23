import test from "node:test";
import assert from "node:assert/strict";
import { EYE_MM, facePose, headYawDegrees } from "../../src/lib/facePose.js";

// Sparse landmark array with only the four points the pose needs (indexes used by MediaPipe).
function landmarks({ left, right, top, chin }) {
  const lm = [];
  lm[33] = left; lm[263] = right; lm[10] = top; lm[152] = chin;
  return lm;
}
const frontal = () => landmarks({
  left: { x: 0.45, y: 0.5, z: 0 }, right: { x: 0.55, y: 0.5, z: 0 },
  top: { x: 0.5, y: 0.3, z: 0 }, chin: { x: 0.5, y: 0.7, z: 0 },
});
const size = { sourceW: 1280, sourceH: 720, viewW: 1280, viewH: 720 };
const near = (actual, expected, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
const nearAll = (actual, expected, tolerance) => expected.forEach((value, i) => near(actual[i], value, tolerance));

test("a face looking straight at the camera gives the identity axes", () => {
  const pose = facePose(frontal(), size);
  assert.equal(pose.basisValid, true);
  nearAll(pose.right, [1, 0, 0]);
  nearAll(pose.up, [0, 1, 0]);
  nearAll(pose.forward, [0, 0, 1]);
  near(headYawDegrees(pose), 0);
});

test("the frame is centred on the eye midpoint and scaled by the eye distance", () => {
  const pose = facePose(frontal(), size);
  near(pose.x, 0);
  near(pose.y, 0);
  near(pose.scale, (0.1 * 1280) / EYE_MM); // eyes are 128 px apart
});

test("moving the face right and up moves the pose right (+x) and up (+y)", () => {
  const lm = landmarks({
    left: { x: 0.55, y: 0.4, z: 0 }, right: { x: 0.65, y: 0.4, z: 0 },
    top: { x: 0.6, y: 0.2, z: 0 }, chin: { x: 0.6, y: 0.6, z: 0 },
  });
  const pose = facePose(lm, size);
  near(pose.x, 0.6 * 1280 - 640);
  near(pose.y, 360 - 0.4 * 720);
});

test("the object-fit: cover crop of the view is applied to position and scale", () => {
  const lm = landmarks({
    left: { x: 0.55, y: 0.5, z: 0 }, right: { x: 0.65, y: 0.5, z: 0 },
    top: { x: 0.6, y: 0.3, z: 0 }, chin: { x: 0.6, y: 0.7, z: 0 },
  });
  const pose = facePose(lm, { sourceW: 1280, sourceH: 720, viewW: 600, viewH: 600 });
  const coverScale = 600 / 720; // the 16:9 source is scaled to fill the square view
  near(pose.x, 0.6 * 1280 * coverScale - (1280 * coverScale - 600) / 2 - 300);
  near(pose.scale, (0.1 * 1280 * coverScale) / EYE_MM);
});

test("a head turned about 45 degrees is reported as such", () => {
  const lm = landmarks({
    left: { x: 0.45, y: 0.5, z: 0.05 }, right: { x: 0.55, y: 0.5, z: -0.05 },
    top: { x: 0.5, y: 0.3, z: 0 }, chin: { x: 0.5, y: 0.7, z: 0 },
  });
  const pose = facePose(lm, size);
  assert.equal(pose.basisValid, true);
  near(headYawDegrees(pose), 45, 0.01);
});

test("the three axes are unit length and perpendicular for a tilted face", () => {
  const lm = landmarks({
    left: { x: 0.44, y: 0.46, z: 0.01 }, right: { x: 0.56, y: 0.54, z: -0.02 },
    top: { x: 0.52, y: 0.28, z: 0.02 }, chin: { x: 0.48, y: 0.72, z: -0.01 },
  });
  const { right, up, forward } = facePose(lm, size);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  near(dot(right, right), 1); near(dot(up, up), 1); near(dot(forward, forward), 1);
  near(dot(right, up), 0); near(dot(right, forward), 0); near(dot(up, forward), 0);
});

test("identical eye points give an invalid basis instead of NaN", () => {
  const lm = landmarks({
    left: { x: 0.5, y: 0.5, z: 0 }, right: { x: 0.5, y: 0.5, z: 0 },
    top: { x: 0.5, y: 0.3, z: 0 }, chin: { x: 0.5, y: 0.7, z: 0 },
  });
  const pose = facePose(lm, size);
  assert.equal(pose.basisValid, false);
  assert.equal(headYawDegrees(pose), 0);
  assert.ok(Number.isFinite(pose.x) && Number.isFinite(pose.y));
});

test("missing landmarks give no pose", () => {
  assert.equal(facePose(undefined, size), null);
  assert.equal(facePose([], size), null);
  const lm = frontal();
  delete lm[152];
  assert.equal(facePose(lm, size), null);
});
