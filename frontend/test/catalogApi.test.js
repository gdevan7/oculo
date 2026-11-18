import test from "node:test";
import assert from "node:assert/strict";
import { fetchGlasses } from "../src/lib/catalogApi.js";

const ok = (body) => async () => ({ ok: true, json: async () => body });

test("without an API base the catalog is empty and nothing is fetched", async () => {
  let called = false;
  const f = async () => { called = true; };
  assert.deepEqual(await fetchGlasses(undefined, f), []);
  assert.deepEqual(await fetchGlasses("", f), []);
  assert.equal(called, false);
});

test("requests /api/glasses and strips a trailing slash", async () => {
  const urls = [];
  const f = async (u) => { urls.push(u); return { ok: true, json: async () => ({ data: [] }) }; };
  await fetchGlasses("https://api.example.com/", f);
  await fetchGlasses("https://api.example.com", f);
  assert.deepEqual(urls, ["https://api.example.com/api/glasses", "https://api.example.com/api/glasses"]);
});

test("returns the data array", async () => {
  const data = [{ id: 1 }, { id: 2 }];
  assert.deepEqual(await fetchGlasses("http://x", ok({ data })), data);
});

test("a missing or non-array data field gives an empty list", async () => {
  assert.deepEqual(await fetchGlasses("http://x", ok({})), []);
  assert.deepEqual(await fetchGlasses("http://x", ok({ data: "nope" })), []);
  assert.deepEqual(await fetchGlasses("http://x", ok({ data: null })), []);
});

test("a failed response rejects", async () => {
  const f = async () => ({ ok: false, json: async () => ({}) });
  await assert.rejects(fetchGlasses("http://x", f), { message: "Catalog unavailable" });
});

test("network errors propagate", async () => {
  const f = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(fetchGlasses("http://x", f), TypeError);
});
