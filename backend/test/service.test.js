import test from "node:test";
import assert from "node:assert/strict";
import { createGlassesService } from "../src/modules/glasses/glasses.service.js";
import { createMemoryGlassesRepository } from "../src/modules/glasses/glasses.repository.memory.js";
import { glassesSeed } from "../src/modules/glasses/glasses.seed.js";
import { ConflictError, NotFoundError, ValidationError } from "../src/shared/errors.js";

const color = { id: "black", name: "Classic Black", hex: "#17191D", model_url: "/models/x.glb" };
const fresh = () => createGlassesService(createMemoryGlassesRepository(glassesSeed));

test("list returns the seeded frames in display order", async () => {
  assert.deepEqual((await fresh().list()).map((g) => g.id), glassesSeed.map((g) => g.id));
});

test("list hides inactive frames; get answers 404 for them", async () => {
  const service = fresh();
  await service.update("noir", { active: false });
  assert.ok(!(await service.list()).some((g) => g.id === "noir"));
  await assert.rejects(service.get("noir"), NotFoundError);
});

test("get returns one frame and rejects unknown ids", async () => {
  const service = fresh();
  assert.equal((await service.get("cloud")).name, "Cloud");
  await assert.rejects(service.get("nope"), NotFoundError);
});

test("create stores a new frame and returns it with defaults", async () => {
  const service = fresh();
  const created = await service.create({ id: "willow", name: "Willow", colors: [color], price: 1000 });
  assert.equal(created.style, "classic");
  assert.equal((await service.get("willow")).price, 1000);
});

test("create rejects invalid input with the list of problems", async () => {
  await assert.rejects(fresh().create({ id: "Bad Id", name: "x" }), (e) => e instanceof ValidationError && e.details.length >= 2);
});

test("create rejects a duplicate id", async () => {
  await assert.rejects(fresh().create({ id: "cloud", name: "Another", colors: [color] }), ConflictError);
});

test("update changes only the given fields", async () => {
  const service = fresh();
  const before = await service.get("cloud");
  const after = await service.update("cloud", { price: 123000 });
  assert.equal(after.price, 123000);
  assert.deepEqual({ ...after, price: 0 }, { ...before, price: 0 });
});

test("update can replace the colors", async () => {
  const service = fresh();
  const after = await service.update("cloud", { colors: [color] });
  assert.deepEqual(after.colors, [color]);
});

test("update validates, forbids changing the id and 404s on unknown frames", async () => {
  const service = fresh();
  await assert.rejects(service.update("cloud", { price: -1 }), ValidationError);
  await assert.rejects(service.update("cloud", { id: "other" }), (e) => e instanceof ValidationError && /id cannot be changed/.test(e.details.join()));
  await assert.rejects(service.update("nope", { price: 1 }), NotFoundError);
  assert.equal((await service.get("cloud")).price, glassesSeed[0].price, "failed updates change nothing");
});

test("remove deletes once, then 404s", async () => {
  const service = fresh();
  await service.remove("cloud");
  await assert.rejects(service.get("cloud"), NotFoundError);
  await assert.rejects(service.remove("cloud"), NotFoundError);
});
