import test from "node:test";
import assert from "node:assert/strict";
import { Lead, isPredictionEnabled, MAX_HORIZON_S } from "../src/lib/lead.js";

const D2R = Math.PI / 180;
// Feeds a value moving at `speed` units/s, one sample every `stepMs`, for `ms` milliseconds.
function run(lead, speed, ms, stepMs = 33, startMs = 1000, startValue = 0) {
  let t = startMs;
  let v = startValue;
  lead.push(v, t);
  for (let el = stepMs; el <= ms; el += stepMs) {
    t += stepMs;
    v += (speed * stepMs) / 1000;
    lead.push(v, t);
  }
  return { t, v };
}

test("no lead after a single sample", () => {
  const l = new Lead(0, 10);
  l.push(5, 100);
  assert.equal(l.at(100, 0.03), 5);
});

test("a still head gets no lead", () => {
  const l = new Lead(8 * D2R, 4 * D2R);
  const { t, v } = run(l, 0, 1000);
  assert.equal(l.at(t + 20, 0.03), v);
});

test("noise below the dead band is ignored", () => {
  const l = new Lead(8 * D2R, 4 * D2R);
  const { t, v } = run(l, 5 * D2R, 1000);
  assert.equal(l.at(t + 20, 0.03), v);
});

test("leads along the motion in both directions", () => {
  const up = new Lead(0, 100);
  const a = run(up, 30, 1000);
  assert.ok(up.at(a.t + 10, 0.03) > a.v);
  const down = new Lead(0, 100);
  const b = run(down, -30, 1000);
  assert.ok(down.at(b.t + 10, 0.03) < b.v);
});

test("lead is capped", () => {
  const l = new Lead(0, 0.5);
  const { t, v } = run(l, 1000, 1000);
  assert.ok(Math.abs(l.at(t, 0.03) - (v + 0.5)) < 1e-9);
});

test("dead band is subtracted from the speed", () => {
  const l = new Lead(10, 1000);
  l.vel = 30;
  l.push(0, 0);
  l.vel = 30;
  const h = 0.02 + 0.03; // no elapsed time + PREDICT_EXTRA_S + tau
  assert.ok(Math.abs(l.at(0, 0.03) - (0 + (30 - 10) * h)) < 1e-9);
});

test("prediction horizon never exceeds the maximum", () => {
  const l = new Lead(0, 1e9);
  l.push(0, 0);
  l.vel = 10;
  assert.ok(Math.abs(l.at(60_000, 0.03) - 10 * MAX_HORIZON_S) < 1e-9);
});

test("a long gap between samples restarts the velocity", () => {
  const l = new Lead(0, 100);
  const { t, v } = run(l, 50, 1000);
  assert.ok(l.vel > 0);
  l.push(v, t + 400);
  assert.equal(l.vel, 0);
});

test("reset clears the state", () => {
  const l = new Lead(0, 100);
  run(l, 50, 500);
  l.reset();
  assert.deepEqual([l.v, l.t, l.vel, l.has], [0, 0, 0, false]);
});

test("disabled returns the raw value", () => {
  const l = new Lead(0, 100, false);
  const { t, v } = run(l, 50, 1000);
  assert.equal(l.at(t + 20, 0.03), v);
});

test("releases speed faster than it picks it up", () => {
  const speedUp = new Lead(0, 100);
  run(speedUp, 100, 100);
  const slowDown = new Lead(0, 100);
  const { t, v } = run(slowDown, 100, 1000);
  const before = slowDown.vel;
  slowDown.push(v, t + 33); // stops
  const lost = (before - slowDown.vel) / before;
  assert.ok(lost > 0.2, `lost ${lost}`);
  assert.ok(speedUp.vel < before);
});

test("on a steady turn the prediction is closer to the true value than the raw one", () => {
  const speed = 60 * D2R; // 60°/s
  const latency = 0.08; // seconds between the real pose and the sample being drawn
  const l = new Lead(8 * D2R, 4 * D2R);
  const { t, v } = run(l, speed, 1500);
  const truth = v + speed * latency;
  const raw = Math.abs(truth - v);
  const predicted = Math.abs(truth - l.at(t + latency * 1000 - 20, 0.03));
  assert.ok(predicted < raw / 2, `raw ${raw}, predicted ${predicted}`);
});

test("isPredictionEnabled reads the nopredict flag", () => {
  assert.equal(isPredictionEnabled(""), true);
  assert.equal(isPredictionEnabled("?debug"), true);
  assert.equal(isPredictionEnabled("?nopredict"), false);
  assert.equal(isPredictionEnabled("?debug&nopredict"), false);
  assert.equal(isPredictionEnabled(), true);
});
