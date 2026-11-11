# Virtual Glasses Try-On 3D

Capstone Design MVP: webcam-based virtual eyewear try-on with React, Three.js, MediaPipe Face Landmarker, Express, and an optional PostgreSQL catalog.

## Features
- Browser-based virtual try-on using MediaPipe Face Landmarker.
- GLB frame loading through Three.js, with per-model orientation presets and geometry-based size normalization.
- Procedural frames remain available as fallbacks for catalog items without a GLB.
- Express REST API for catalog CRUD.
- Optional PostgreSQL persistence.
- Screenshot download and camera stop control.

## Run locally
Requirements: Node.js 20+ and a modern browser. Docker/PostgreSQL are optional.

1. Start the API:
   `cd backend && npm install && npm run dev`
2. In another terminal, start the frontend:
   `cd frontend && npm install && npm run dev`
3. Open the Vite URL, normally `http://localhost:5173`.
4. Select **White · GLB 3D model** and start the camera.

If `DATABASE_URL` is unset, the API uses an in-memory catalog. No database setup is required for a local demo. Camera access requires localhost or HTTPS, and the first run needs internet access to download the MediaPipe runtime/model.

## Existing PostgreSQL database
The SQL seed now updates the `model_url` of existing catalog rows. Apply the updated `backend/sql/schema.sql` to the existing database, or run this targeted migration:

```sql
UPDATE glasses
SET model_url = '/models/model_2_black.glb', updated_at = NOW()
WHERE id = 'black';
```

Then restart the API and verify that `GET /api/glasses` returns `black` with that `model_url`.

## API
- GET /api/health
- GET /api/glasses
- GET /api/glasses/:id
- POST /api/glasses
- PATCH /api/glasses/:id
- DELETE /api/glasses/:id

Before exposing catalog write endpoints publicly, add authentication and rate limits. Never commit secrets.

## 3D models
The three supplied GLB models and their attribution/license notes are documented in `frontend/public/models/ATTRIBUTION.md`. All three models are connected to the White, Tortoiseshell, and Matte Black catalog items. Confirm the models' license/usage terms before public deployment.
