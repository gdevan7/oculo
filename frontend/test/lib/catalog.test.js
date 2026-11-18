import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCatalog } from "../../src/lib/catalog.js";

const color = (over = {}) => ({ id: "black", name: "Classic Black", hex: "#17191D", model_url: "/models/a.glb", ...over });
const row = (over = {}) => ({ id: "cloud", name: "Cloud", price: 300000, colors: [color()], ...over });

test("anything that is not a list gives an empty catalog", () => {
  for (const v of [undefined, null, {}, "x", 5]) assert.deepEqual(normalizeCatalog(v), []);
});

test("a complete row is kept and keeps its order", () => {
  const out = normalizeCatalog([row({ id: "a" }), row({ id: "b" })]);
  assert.deepEqual(out.map((g) => g.id), ["a", "b"]);
});

test("missing optional fields are filled from the default color", () => {
  const [g] = normalizeCatalog([row()]);
  assert.equal(g.color_id, "black");
  assert.equal(g.model_url, "/models/a.glb");
  assert.equal(g.frame_color, "#17191D");
  assert.equal(g.subtitle, "");
});

test("values the API provided are not overwritten", () => {
  const [g] = normalizeCatalog([row({ subtitle: "Everyday", color_id: "rose", model_url: "/models/b.glb" })]);
  assert.deepEqual([g.subtitle, g.color_id, g.model_url], ["Everyday", "rose", "/models/b.glb"]);
});

test("a missing or bad price becomes 0", () => {
  assert.equal(normalizeCatalog([row({ price: undefined })])[0].price, 0);
  assert.equal(normalizeCatalog([row({ price: "300" })])[0].price, 0);
});

test("incomplete rows are skipped without dropping the good ones", () => {
  const out = normalizeCatalog([
    row({ id: "ok" }),
    row({ id: "nocolors", colors: [] }),
    row({ id: "badhex", colors: [color({ hex: "red" })] }),
    row({ id: "nourl", colors: [color({ model_url: "" })] }),
    { name: "no id", colors: [color()] },
    null,
  ]);
  assert.deepEqual(out.map((g) => g.id), ["ok"]);
});
