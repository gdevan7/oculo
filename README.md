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

1. Start the API: `cd backend && cp .env.example .env && npm install && npm run dev`
2. In another terminal, start the frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
3. Open the Vite URL, normally `http://localhost:5173`.
4. Choose a frame, press **Try on**, accept the camera notice and start the camera.

The frontend works without the API: with no `VITE_API_BASE_URL`, or when the API is unreachable, it shows the offline catalog in `frontend/src/data/glasses.js`. Camera access requires localhost or HTTPS, and the first run needs internet access to download the MediaPipe runtime/model.

## Project structure
```
backend/
  db/               schema.sql and migrations/ (PostgreSQL)
  src/
    config/         environment variables
    http/           Express app, error handler, admin API-key check
    modules/glasses/  catalog: validation, service, repositories (memory + PostgreSQL), routes, seed
    shared/         error types
    db/             pool, `db:migrate` and `db:seed` scripts
    server.js       wires the pieces together
  test/             backend unit tests
frontend/
  public/           Static files: 3D models (models/) and images
  src/
    pages/          Home and Catalog screens
    components/     Shared UI: Header, Footer, LoginDialog
    features/
      catalog/      Product card and 3D product preview
      tryon/        Camera, face tracking scene, consent dialog, try-on window
    lib/            Pure logic with no React/Three.js: filters, crop math, storage, API calls
    data/           Offline copy of the catalog, used when the API is unreachable
    services/       API client
    styles/         CSS files, imported in order by styles/index.css
  test/lib/         Unit tests that mirror src/lib/
docs/               Product requirements and implementation plan
```

## Tests
Run everything from the repository root with `npm test`, or per app with `npm test` inside `backend/` or `frontend/`. Tests use Node's built-in runner (`node --test`), so they need no extra packages. Code that depends on React, Three.js or MediaPipe is not covered by unit tests; keep new logic in `frontend/src/lib/` so it can be tested.

## Catalog data
The catalog (frames, prices, colors and the GLB file of each color) belongs to the backend. The 3D files themselves stay in `frontend/public/models/`; the database stores their paths.

- **Without a database** (`DATABASE_URL` empty): the API starts from the seed in `backend/src/modules/glasses/glasses.seed.js` and keeps changes in memory.
- **With PostgreSQL:** `docker compose up -d db`, set `DATABASE_URL` in `backend/.env`, then `cd backend && npm run db:migrate && npm run db:seed`. `db:migrate` also upgrades a database created by the older 3-frame version (it removes the old demo rows); run `db:seed` afterwards.
- Add or change a frame through the API (below) or edit the seed. If you change the seed, update `frontend/src/data/glasses.js` too: `npm test` fails when the two differ.

## API
- `GET /api/health`
- `GET /api/glasses`: active frames in display order, each with `colors[]`
- `GET /api/glasses/:id`
- `POST /api/glasses`, `PATCH /api/glasses/:id`, `DELETE /api/glasses/:id`: need `Authorization: Bearer <ADMIN_API_KEY>`. If `ADMIN_API_KEY` is not set these answer 403, so writes are off by default.

A frame is `{ id, name, subtitle, description, style, price, sort_order, active, colors: [{ id, name, hex, model_url }] }`; the first color is the default. Responses also include `frame_color`, `model_url` and `color_id` for that default color. Never commit secrets.

## 3D models
The GLB models and their attribution/license notes are documented in `frontend/public/models/ATTRIBUTION.md`. Confirm the models' license/usage terms before public deployment.
