# Supplied 3D model assets

The three GLB files listed below were supplied by the project author for this Virtual Glasses Try-On project. They replace the previous demo/procedural frames.

| File | Catalog item | Description |
| --- | --- | --- |
| model-0-blue.glb | Blue | Blue frame with translucent blue lenses |
| model-1-tortoiseshell.glb | Tortoiseshell | Brown tortoiseshell frame with smoke-grey lenses |
| model-2-black.glb | Matte Black | Matte black frame with smoke-grey lenses |

## Source and usage rights

Source: supplied directly by the project author. Original creator, generation tool, and license/usage rights were not provided. Confirm permission to use and publicly distribute these assets before deployment.

## Model handling

The application preserves the GLB geometry, materials, and textures. Only root orientation and scale transforms are applied for face fitting. The initial normalization target is 140 mm frame width, an assumed adult-frame size rather than a measured product specification.

## Orientation

The three source files use different coordinate axes. Their orientation presets are configured in frontend/src/components/glbFrame.js. Verify all three in the browser from front and side views before release.
