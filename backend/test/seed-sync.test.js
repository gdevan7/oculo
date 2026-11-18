import test from "node:test";
import assert from "node:assert/strict";
import { glassesSeed } from "../src/modules/glasses/glasses.seed.js";
import { toApi } from "../src/modules/glasses/glasses.model.js";
import { fallbackCatalog } from "../../frontend/src/data/glasses.js";

// The browser keeps an offline copy of the catalog (used when the API is unreachable).
// Both copies must describe the same frames, or the app would change when the API goes down.
test("the frontend's offline catalog matches the backend seed", () => {
  assert.deepEqual(fallbackCatalog.map((g) => g.id), glassesSeed.map((g) => g.id));
  for (const seed of glassesSeed) {
    const offline = fallbackCatalog.find((g) => g.id === seed.id);
    const api = toApi(seed);
    for (const key of ["name", "subtitle", "description", "style", "price", "frame_color", "model_url", "color_id", "colors"]) {
      assert.deepEqual(offline[key], api[key], `${seed.id}.${key}`);
    }
  }
});
