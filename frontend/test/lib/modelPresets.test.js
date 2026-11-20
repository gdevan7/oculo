import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_FACE_FRONT_MM,
  DEFAULT_WIDTH_MM,
  modelFolder,
  uprightPreset,
} from "../../src/lib/modelPresets.js";
import { fallbackCatalog } from "../../src/data/glasses.js";

const publicDir = fileURLToPath(new URL("../../public", import.meta.url));

test("modelFolder reads the folder from a model URL", () => {
  assert.equal(modelFolder("/models/model-7/model_7_gold.glb"), "model-7");
  assert.equal(modelFolder("/models/model-12/model_12_black.glb?v=2"), "model-12");
  assert.equal(modelFolder("https://cdn.example.com/models/model-3/a.glb"), "model-3");
  assert.equal(modelFolder(""), "");
  assert.equal(modelFolder(undefined), "");
});

test("upright models get the default width and face block unless they override it", () => {
  assert.deepEqual(uprightPreset("model-3"), { widthMm: DEFAULT_WIDTH_MM, faceFrontMm: DEFAULT_FACE_FRONT_MM });
  assert.deepEqual(uprightPreset("model-9"), { widthMm: DEFAULT_WIDTH_MM, faceFrontMm: DEFAULT_FACE_FRONT_MM });
  assert.equal(uprightPreset("model-6").widthMm, 175);
});

test("rotated legacy folders and unknown folders have no upright preset", () => {
  for (const folder of ["model-0", "model-1", "model-2", "model-99", "models", "", "toString", "__proto__"]) {
    assert.equal(uprightPreset(folder), null, folder);
  }
});

// A model added to the catalog without a fitting preset would fail to load in the try-on window.
test("every model in the offline catalog has a fitting preset and a file", () => {
  const rotated = new Set(["model-0", "model-1", "model-2"]);
  for (const frame of fallbackCatalog) {
    for (const color of frame.colors) {
      const folder = modelFolder(color.model_url);
      assert.ok(rotated.has(folder) || uprightPreset(folder), `${frame.id}/${color.id}: no preset for ${folder}`);
      assert.ok(existsSync(publicDir + color.model_url), `${frame.id}/${color.id}: missing ${color.model_url}`);
    }
  }
});
