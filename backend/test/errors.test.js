import test from "node:test";
import assert from "node:assert/strict";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError, toHttpError } from "../src/shared/errors.js";

test("app errors keep their status and message", () => {
  assert.deepEqual(toHttpError(new NotFoundError("Glasses not found")), { status: 404, body: { error: "Glasses not found" } });
  assert.equal(toHttpError(new ConflictError()).status, 409);
  assert.equal(toHttpError(new UnauthorizedError()).status, 401);
  assert.equal(toHttpError(new ForbiddenError()).status, 403);
});

test("validation errors list the problems", () => {
  assert.deepEqual(toHttpError(new ValidationError(["a", "b"])), { status: 400, body: { error: "Invalid input", details: ["a", "b"] } });
});

test("unexpected errors become a generic 500 with no details", () => {
  const out = toHttpError(new Error('relation "glasses" does not exist'));
  assert.deepEqual(out, { status: 500, body: { error: "Internal server error" } });
});

test("client errors from the body parser pass through", () => {
  const error = Object.assign(new Error("Unexpected token } in JSON"), { status: 400, expose: true });
  assert.deepEqual(toHttpError(error), { status: 400, body: { error: "Unexpected token } in JSON" } });
});

test("an error with a 4xx status that is not exposable stays a 500", () => {
  assert.equal(toHttpError(Object.assign(new Error("x"), { status: 400 })).status, 500);
});
