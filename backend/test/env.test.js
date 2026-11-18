import test from "node:test";
import assert from "node:assert/strict";
import { readConfig } from "../src/config/env.js";

test("defaults suit local development and keep everything optional off", () => {
  assert.deepEqual(readConfig({}), { port: 4000, databaseUrl: null, frontendOrigin: "http://localhost:5173", adminApiKey: null });
});

test("values are read from the environment", () => {
  const c = readConfig({ PORT: "8080", DATABASE_URL: "postgres://x", FRONTEND_ORIGIN: "https://shop.example", ADMIN_API_KEY: "k" });
  assert.deepEqual(c, { port: 8080, databaseUrl: "postgres://x", frontendOrigin: "https://shop.example", adminApiKey: "k" });
});

test("an invalid port stops startup", () => {
  for (const PORT of ["abc", "0", "70000", "1.5", "-1"]) assert.throws(() => readConfig({ PORT }), /PORT/, PORT);
});
