import test from "node:test";
import assert from "node:assert/strict";
import { cameraErrorMessage } from "../src/lib/cameraError.js";

test("permission denied has its own message", () => {
  assert.equal(
    cameraErrorMessage({ name: "NotAllowedError", message: "x" }),
    "Camera permission denied. Allow access in browser settings."
  );
});

test("other errors show their message", () => {
  assert.equal(cameraErrorMessage(new Error("No camera found")), "No camera found");
});

test("falls back when there is no message or no error", () => {
  assert.equal(cameraErrorMessage({}), "Could not start camera.");
  assert.equal(cameraErrorMessage(undefined), "Could not start camera.");
  assert.equal(cameraErrorMessage(null), "Could not start camera.");
});
