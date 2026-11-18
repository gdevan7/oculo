import test from "node:test";
import assert from "node:assert/strict";
import { buildGlasses, toApi } from "../src/modules/glasses/glasses.model.js";

const colors = [
  { id: "black", name: "Classic Black", hex: "#17191D", model_url: "/models/a_black.glb" },
  { id: "rose", name: "Dusty Rose", hex: "#B98286", model_url: "/models/a_rose.glb" },
];

test("buildGlasses fills defaults and trims the name", () => {
  const g = buildGlasses({ id: "cloud", name: "  Cloud ", colors });
  assert.deepEqual(g, { id: "cloud", name: "Cloud", subtitle: "", description: "", style: "classic", price: 0, sort_order: 0, active: true, colors });
});

test("buildGlasses keeps given values and drops stray color fields", () => {
  const g = buildGlasses({ id: "a", name: "Aa", price: 5, active: false, colors: [{ ...colors[0], junk: 1 }] });
  assert.equal(g.price, 5);
  assert.equal(g.active, false);
  assert.deepEqual(g.colors[0], colors[0]);
});

test("toApi describes the default (first) color at the top level", () => {
  const api = toApi(buildGlasses({ id: "cloud", name: "Cloud", colors }));
  assert.equal(api.frame_color, "#17191D");
  assert.equal(api.model_url, "/models/a_black.glb");
  assert.equal(api.color_id, "black");
  assert.deepEqual(api.colors, colors);
});

test("toApi copies colors so callers cannot change the stored ones", () => {
  const g = buildGlasses({ id: "cloud", name: "Cloud", colors });
  toApi(g).colors[0].name = "changed";
  assert.equal(g.colors[0].name, "Classic Black");
});
