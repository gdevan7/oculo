# 3D model attribution and license

Required by `AGENTS.md`: every bundled asset must have its source and usage rights documented.

## black-acetate.glb

| Field | Value |
| --- | --- |
| Used by | catalog item `bold-black` ("Bold Black") |
| Source | Supplied by the project author as `tripo_texture.glb`; the node names (`tripo_node_...`) show it was generated with Tripo (AI 3D generation) |
| License | **NOT CONFIRMED.** Usage rights for Tripo output depend on the plan and terms in force when the file was generated. The project author must check them and record the result here before this model is deployed or shared beyond the capstone review. |
| Trademark note | The frame shape resembles a well-known commercial design. Review this before any public release. The logo sticker that came with the original file has been removed (see below). |

### Modifications made to the original file

- Removed the logo sticker: a separate, thin mesh piece (about 19,900 triangles, roughly 10 x 18 mm) floating at the lower corner of one lens, carrying the script logo. Its texture area (used by no other triangle) was painted over with the atlas fill colour, so no logo remains in the file.
- Mesh then simplified from about 965,000 to 28,965 triangles with meshoptimizer (through glTF-Transform), so it can be rendered in real time next to MediaPipe. UVs and normals of the kept vertices are unchanged.
- Texture downscaled from 4096x4096 to 2048x2048 JPEG (quality 88).
- `EXT_meshopt_compression` and `KHR_mesh_quantization` removed, so the file loads with the plain `GLTFLoader` (no decoder needed).
- No other geometry edits. The original 5.7 MB file is not stored in this repository.

### Orientation and size (measured, see `frontend/src/components/glbFrame.js`)

Original axes: frame width on Z (1.0 unit), front faces +X, temples run toward -X, up is +Y. The loader rotates it by -90 degrees about Y so the front faces the camera, scales it so the front measures 145 mm, and places the front plane at z = 0. The 145 mm width is an assumption for a typical adult frame, not a measured product dimension; adjust `widthMm` if a different fit is wanted.

## Adding another model

1. Put the `.glb` in this folder and add a row to this file (source, license, changes).
2. Measure its axes and add a preset to `PRESETS` in `glbFrame.js` (`modelWidth`, `widthMm`, `rotY`, `frontPlane`, `yOffsetMm`). A file without a preset is treated with the `black-acetate.glb` preset, which is wrong for most models.
3. Add the catalog row with `model_url` set to `/models/<file>.glb` (`backend/src/catalog.js`, `backend/sql/schema.sql`, and the fallback list in `frontend/src/App.jsx`).
