import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryGlassesRepository } from "../src/modules/glasses/glasses.repository.memory.js";
import { ConflictError } from "../src/shared/errors.js";

const item = (id, sort_order, active = true) => ({
  id, name: id.toUpperCase(), subtitle: "", description: "", style: "classic", price: 0, sort_order, active,
  colors: [{ id: "c", name: "Color", hex: "#000000", model_url: "/m.glb" }],
});

test("list sorts by sort_order then name", async () => {
  const repo = createMemoryGlassesRepository([item("b", 2), item("a", 2), item("z", 1)]);
  assert.deepEqual((await repo.list()).map((g) => g.id), ["z", "a", "b"]);
});

test("list skips inactive frames unless asked", async () => {
  const repo = createMemoryGlassesRepository([item("a", 1), item("b", 2, false)]);
  assert.deepEqual((await repo.list()).map((g) => g.id), ["a"]);
  assert.deepEqual((await repo.list({ includeInactive: true })).map((g) => g.id), ["a", "b"]);
});

test("get returns null for unknown ids and a copy otherwise", async () => {
  const repo = createMemoryGlassesRepository([item("a", 1)]);
  assert.equal(await repo.get("x"), null);
  const copy = await repo.get("a");
  copy.name = "changed";
  copy.colors.push({});
  assert.equal((await repo.get("a")).name, "A");
  assert.equal((await repo.get("a")).colors.length, 1);
});

test("the initial data is copied, not shared", async () => {
  const initial = [item("a", 1)];
  const repo = createMemoryGlassesRepository(initial);
  initial[0].name = "changed";
  assert.equal((await repo.get("a")).name, "A");
});

test("insert rejects an existing id", async () => {
  const repo = createMemoryGlassesRepository([item("a", 1)]);
  await assert.rejects(repo.insert(item("a", 2)), ConflictError);
  await repo.insert(item("b", 2));
  assert.equal((await repo.list()).length, 2);
});

test("update replaces a frame and reports whether it existed", async () => {
  const repo = createMemoryGlassesRepository([item("a", 1)]);
  assert.equal(await repo.update({ ...item("a", 1), name: "New" }), true);
  assert.equal((await repo.get("a")).name, "New");
  assert.equal(await repo.update(item("nope", 1)), false);
});

test("remove reports whether anything was deleted", async () => {
  const repo = createMemoryGlassesRepository([item("a", 1)]);
  assert.equal(await repo.remove("a"), true);
  assert.equal(await repo.remove("a"), false);
});
