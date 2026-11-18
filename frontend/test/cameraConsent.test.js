import test from "node:test";
import assert from "node:assert/strict";
import {
  CAMERA_CONSENT_KEY,
  browserStorage,
  grantCameraConsent,
  hasCameraConsent,
} from "../src/lib/cameraConsent.js";

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    data,
  };
}
const throwing = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); },
};

test("key is versioned", () => {
  assert.equal(CAMERA_CONSENT_KEY, "frame-studio-camera-consent-v1");
});

test("no consent by default", () => {
  assert.equal(hasCameraConsent(memoryStorage()), false);
});

test("granting is remembered", () => {
  const s = memoryStorage();
  assert.equal(grantCameraConsent(s), true);
  assert.equal(s.data.get(CAMERA_CONSENT_KEY), "accepted");
  assert.equal(hasCameraConsent(s), true);
});

test("other stored values and the old key do not count", () => {
  assert.equal(hasCameraConsent(memoryStorage({ [CAMERA_CONSENT_KEY]: "yes" })), false);
  assert.equal(hasCameraConsent(memoryStorage({ "frame-studio-camera-consent": "accepted" })), false);
});

test("blocked or missing storage never throws", () => {
  assert.equal(hasCameraConsent(throwing), false);
  assert.equal(grantCameraConsent(throwing), false);
  assert.equal(hasCameraConsent(null), false);
  assert.equal(grantCameraConsent(null), false);
});

test("browserStorage returns null when there is no localStorage", () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  delete globalThis.localStorage;
  try {
    assert.equal(browserStorage(), null);
    assert.equal(hasCameraConsent(), false);
  } finally {
    if (saved) Object.defineProperty(globalThis, "localStorage", saved);
  }
});

test("browserStorage returns null when access throws", () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("denied"); } });
  try {
    assert.equal(browserStorage(), null);
  } finally {
    delete globalThis.localStorage;
    if (saved) Object.defineProperty(globalThis, "localStorage", saved);
  }
});
