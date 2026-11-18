import test from "node:test";
import assert from "node:assert/strict";
import { validateGlasses } from "../src/modules/glasses/glasses.validation.js";

const color = (over = {}) => ({ id: "black", name: "Classic Black", hex: "#17191D", model_url: "/models/a.glb", ...over });
const valid = (over = {}) => ({ id: "cloud", name: "Cloud", colors: [color()], ...over });

test("a minimal frame is valid", () => assert.deepEqual(validateGlasses(valid()), []));

test("a full frame is valid", () => {
  assert.deepEqual(
    validateGlasses(valid({ subtitle: "Everyday", description: "x", style: "tortoise", price: 250000, sort_order: 3, active: false })),
    []
  );
});

test("body must be an object", () => {
  for (const body of [null, undefined, "x", 5, []]) assert.ok(validateGlasses(body).length, String(body));
});

test("unknown fields are rejected, including the old frame_color and model_url", () => {
  assert.ok(validateGlasses(valid({ admin: true })).length);
  assert.ok(validateGlasses(valid({ frame_color: "#111111" })).length);
  assert.ok(validateGlasses(valid({ model_url: "/models/a.glb" })).length);
});

test("id must be a lowercase slug", () => {
  for (const id of ["Cloud", "my frame", "-a", "a-", "a--b", "", 5, "x".repeat(41)]) {
    assert.ok(validateGlasses(valid({ id })).length, String(id));
  }
  assert.deepEqual(validateGlasses(valid({ id: "model-3" })), []);
});

test("name needs 2-60 characters", () => {
  for (const name of ["", "a", " a ", "x".repeat(61), 7]) assert.ok(validateGlasses(valid({ name })).length, String(name));
});

test("price must be a whole non-negative number", () => {
  for (const price of [-1, 1.5, "100", NaN, 2_000_000_000]) assert.ok(validateGlasses(valid({ price })).length, String(price));
  assert.deepEqual(validateGlasses(valid({ price: 0 })), []);
});

test("active must be boolean and sort_order a whole number", () => {
  assert.ok(validateGlasses(valid({ active: "yes" })).length);
  assert.ok(validateGlasses(valid({ sort_order: 1.2 })).length);
});

test("colors: 1 to 12 entries, each fully valid", () => {
  assert.ok(validateGlasses(valid({ colors: [] })).length);
  assert.ok(validateGlasses(valid({ colors: "black" })).length);
  assert.ok(validateGlasses({ id: "cloud", name: "Cloud" }).length, "colors are required when creating");
  const many = Array.from({ length: 13 }, (_, i) => color({ id: `c${i}` }));
  assert.ok(validateGlasses(valid({ colors: many })).length);
});

test("color hex must be #rrggbb", () => {
  for (const hex of ["blue", "#12345", "#GGGGGG", "17191D", 5]) assert.ok(validateGlasses(valid({ colors: [color({ hex })] })).length, String(hex));
  assert.deepEqual(validateGlasses(valid({ colors: [color({ hex: "#abcdef" })] })), []);
});

test("color model_url accepts a local path or https, rejects everything else", () => {
  assert.deepEqual(validateGlasses(valid({ colors: [color({ model_url: "https://cdn.example.com/a.glb" })] })), []);
  for (const u of ["http://x/a.glb", "javascript:alert(1)", "//evil.example/a.glb", "a.glb", 42, null, "/a b.glb"]) {
    assert.ok(validateGlasses(valid({ colors: [color({ model_url: u })] })).length, String(u));
  }
});

test("color ids must be unique and colors cannot carry unknown fields", () => {
  assert.ok(validateGlasses(valid({ colors: [color(), color()] })).length);
  assert.ok(validateGlasses(valid({ colors: [color({ extra: 1 })] })).length);
  assert.ok(validateGlasses(valid({ colors: [null] })).length);
});

test("partial mode only checks the fields that are present", () => {
  assert.deepEqual(validateGlasses({}, { partial: true }), []);
  assert.deepEqual(validateGlasses({ price: 5 }, { partial: true }), []);
  assert.ok(validateGlasses({ price: -5 }, { partial: true }).length);
  assert.ok(validateGlasses({ colors: [] }, { partial: true }).length);
});
