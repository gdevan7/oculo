import test from "node:test";
import assert from "node:assert/strict";
import { straightenedX } from "../src/lib/straightenArms.js";

// Right arm drifting outward 0.1 mm per mm of depth behind the hinge (z = -12), mirrored on the left.
const arm = (side) => [-15, -30, -60, -100, -140].map((z) => ({ x: side * (73 + 0.1 * (-12 - z)), y: 10, z }));

test("an arm that flares outward ends up parallel to the frame", () => {
  const pts = [...arm(1), ...arm(-1)];
  const xs = straightenedX(pts, 0);
  const right = xs.slice(0, 5), left = xs.slice(5);
  assert.ok(Math.max(...right) - Math.min(...right) < 0.6);
  assert.ok(Math.max(...left.map(Math.abs)) - Math.min(...left.map(Math.abs)) < 0.6);
  assert.ok(right.every((x) => x > 0) && left.every((x) => x < 0));
});

test("the front frame is not touched", () => {
  const front = [{ x: 60, y: 0, z: -3 }, { x: -60, y: 5, z: 0 }, { x: 0, y: 0, z: -8 }];
  assert.deepEqual(straightenedX(front, 0), [60, -60, 0]);
});

test("an arm that is already straight stays where it is", () => {
  const straight = [-20, -60, -120].map((z) => ({ x: 74, y: 8, z }));
  assert.deepEqual(straightenedX(straight, 0), [74, 74, 74]);
});

test("thickness within a slice is kept", () => {
  const pts = [{ x: 80, y: 0, z: -50 }, { x: 82, y: 0, z: -50 }, { x: 74, y: 0, z: -20 }];
  const xs = straightenedX(pts, 0);
  assert.ok(Math.abs(xs[1] - xs[0] - 2) < 1e-9);
});

test("unit scales the hinge distance and slice depth", () => {
  // with unit 0.2 the hinge is 2.4 units behind the front, so both points below are in the arm
  const xs = straightenedX([{ x: 74, y: 0, z: -3 }, { x: 80, y: 0, z: -24 }], 0, 0.2);
  assert.ok(xs[1] < 80);
});
