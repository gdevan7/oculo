import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { glassesSeed } from "../src/modules/glasses/glasses.seed.js";
import { validateGlasses } from "../src/modules/glasses/glasses.validation.js";

const publicDir = fileURLToPath(new URL("../../frontend/public", import.meta.url));

test("the seed has the frames shown in the app, in display order", () => {
  assert.deepEqual(glassesSeed.map((g) => g.id), [
    "cloud", "frankie", "monroe", "noir", "browline", "heritage", "evergreen",
    "maverick", "lola", "archer", "orbit", "sorbet", "navigator", "rebel", "apex",
  ]);
  assert.deepEqual(glassesSeed.map((g) => g.sort_order), glassesSeed.map((_, i) => i));
});

test("every seeded frame passes the same validation as the API", () => {
  for (const g of glassesSeed) assert.deepEqual(validateGlasses(g), [], g.id);
});

test("frame ids are unique and every frame offers two to four colors", () => {
  assert.equal(new Set(glassesSeed.map((g) => g.id)).size, glassesSeed.length);
  for (const g of glassesSeed) assert.ok(g.colors.length >= 2 && g.colors.length <= 4, `${g.id}: ${g.colors.length} colors`);
});

test("every color points at a GLB file that exists in frontend/public", () => {
  for (const g of glassesSeed) {
    for (const c of g.colors) assert.ok(existsSync(publicDir + c.model_url), `${g.id}/${c.id}: ${c.model_url}`);
  }
});
