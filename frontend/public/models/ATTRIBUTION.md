# Supplied 3D model assets

The three GLB files listed below were supplied by the project author for this Virtual Glasses Try-On project. They replace the previous demo/procedural frames.

| File | Catalog item | Description |
| --- | --- | --- |
| model_0_white.glb | White | White frame with clear lenses |
| model_1_tortoiseshell.glb | Tortoiseshell | Brown tortoiseshell frame with smoke-grey lenses |
| model_2_black.glb | Matte Black | Matte black frame with smoke-grey lenses |

## Source and usage rights

Source: supplied directly by the project author. Original creator, generation tool, and license/usage rights were not provided. Confirm permission to use and publicly distribute these assets before deployment.

## Model handling

The application preserves the GLB geometry, materials, and textures. Only root orientation and scale transforms are applied for face fitting. The initial normalization target is 140 mm frame width, an assumed adult-frame size rather than a measured product specification.

## Orientation

The three source files use different coordinate axes. Their orientation presets are configured in frontend/src/components/glbFrame.js. Verify all three in the browser from front and side views before release.

## Models 7 to 16

Added to the repository by the project author, in folders `model-7` to `model-16` (one folder per frame, one GLB per color).

| Folder | Catalog item | Colors |
| --- | --- | --- |
| model-7 | Maverick (classic aviator) | Black, Gold, Rose Gold |
| model-8 | Lola (retro cat-eye) | Black, Emerald Green, Navy Blue |
| model-9 | Archer (slim rectangle) | Dark Brown, Antique Gold, Copper |
| model-10 | Orbit (round metal) | Black, Gold, Silver |
| model-11 | Sorbet (slim pastel) | Lavender, White, Aqua |
| model-12 | Navigator (square aviator) | Black, Gold, Silver |
| model-13 | Rebel (bold square) | Midnight Blue, Black Red Lens |
| model-14 | Apex (sport half-rim) | Metallic Green, Yellow |
| model-15 | Horizon (sport shield) | Black Blue Lens, Black Red Mirror, White Orange Lens |
| model-16 | Atlas (retro double bridge) | Amber Brown, Forest Green, Navy Blue |

Original creator, generation tool and license were not provided. Confirm permission to use and publicly distribute these assets before deployment.

These files are upright (frame width along x, up along y, lenses facing +z), so they need no rotation. Their export scales differ widely, so the loader normalizes every frame to a fixed width.
