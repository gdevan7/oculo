import test from "node:test";
import assert from "node:assert/strict";
import { createRequireAdmin, isAuthorized } from "../src/http/adminAuth.js";
import { ForbiddenError, UnauthorizedError } from "../src/shared/errors.js";

const run = (apiKey, header) => {
  let received;
  createRequireAdmin(apiKey)({ get: (name) => (name === "authorization" ? header : undefined) }, {}, (e) => { received = e; });
  return received;
};

test("isAuthorized accepts only the exact bearer key", () => {
  assert.equal(isAuthorized("Bearer secret", "secret"), true);
  for (const h of ["Bearer wrong", "secret", "Basic secret", "Bearer ", "", undefined, "bearer secret"]) {
    assert.equal(isAuthorized(h, "secret"), false, String(h));
  }
});

test("a missing server key never authorizes anything", () => {
  assert.equal(isAuthorized("Bearer ", undefined), false);
  assert.equal(isAuthorized("Bearer x", ""), false);
});

test("middleware lets a correct key through", () => assert.equal(run("secret", "Bearer secret"), undefined));
test("middleware answers 401 for a wrong or missing key", () => {
  assert.ok(run("secret", "Bearer nope") instanceof UnauthorizedError);
  assert.ok(run("secret", undefined) instanceof UnauthorizedError);
});
test("with no ADMIN_API_KEY configured, writes are disabled (403)", () => {
  const error = run(null, "Bearer anything");
  assert.ok(error instanceof ForbiddenError);
  assert.match(error.message, /ADMIN_API_KEY/);
});
