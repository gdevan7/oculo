import test from "node:test";
import assert from "node:assert/strict";
import { OneEuro, isFilterEnabled } from "../../src/lib/oneEuro.js";

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) - 0.5;
const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length);

test("first sample passes through", () => {
  assert.equal(new OneEuro(1, 1).filter(42, 0), 42);
});

test("a constant signal stays constant", () => {
  const f = new OneEuro(1, 1);
  let v;
  for (let i = 0; i < 50; i++) v = f.filter(3, i * 33);
  assert.equal(v, 3);
});

test("noise on a still signal is reduced", () => {
  const f = new OneEuro(1, 0.2);
  const raw = [], out = [];
  for (let i = 0; i < 300; i++) {
    const n = rnd() * 2;
    raw.push(n);
    out.push(f.filter(n, i * 33));
  }
  assert.ok(rms(out.slice(30)) < rms(raw.slice(30)) / 2);
});

test("fast motion is followed more closely than slow motion", () => {
  const lagAt = (speed) => {
    const f = new OneEuro(1, 5);
    let v = 0, last = 0;
    for (let i = 0; i < 150; i++) { last = speed * (i * 0.033); v = f.filter(last, i * 33); }
    return (last - v) / speed; // lag in seconds
  };
  assert.ok(lagAt(10) < lagAt(0.5));
});

test("repeated or backwards timestamps are ignored", () => {
  const f = new OneEuro(1, 1);
  f.filter(0, 100);
  assert.equal(f.filter(5, 100), 0);
  assert.equal(f.filter(5, 50), 0);
});

test("reset forgets the history", () => {
  const f = new OneEuro(1, 1);
  f.filter(0, 0); f.filter(10, 33);
  f.reset();
  assert.equal(f.filter(99, 5000), 99);
});

test("isFilterEnabled reads the nofilter flag", () => {
  assert.equal(isFilterEnabled(""), true);
  assert.equal(isFilterEnabled("?debug&nopredict"), true);
  assert.equal(isFilterEnabled("?nofilter"), false);
  assert.equal(isFilterEnabled(), true);
});
