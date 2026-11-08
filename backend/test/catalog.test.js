import test from "node:test";
import assert from "node:assert/strict";
import { seed, validate } from "../src/catalog.js";
test("three seeded styles exist",()=>assert.ok(seed.length>=3));
test("hex frame color accepted",()=>assert.deepEqual(validate({name:"Frame",frame_color:"#123ABC"}),[]));
test("invalid color rejected",()=>assert.ok(validate({name:"Frame",frame_color:"blue"}).length));
test("unknown field rejected",()=>assert.ok(validate({name:"Frame",admin:true}).length));
test("model_url accepts local path, https URL and null",()=>{
  assert.deepEqual(validate({name:"Frame",model_url:"/models/a.glb"}),[]);
  assert.deepEqual(validate({name:"Frame",model_url:"https://cdn.example.com/a.glb"}),[]);
  assert.deepEqual(validate({name:"Frame",model_url:null}),[]);
});
test("model_url rejects other schemes and protocol-relative URLs",()=>{
  for(const u of ["http://x/a.glb","javascript:alert(1)","//evil.example/a.glb","a.glb",42])
    assert.ok(validate({name:"Frame",model_url:u}).length,String(u));
});
test("seeded GLB frame points at a bundled model",()=>assert.ok(seed.some(g=>g.model_url==="/models/black-acetate.glb")));
