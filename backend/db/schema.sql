-- Catalog schema. Safe to run more than once. Existing databases from the 3-frame version are
-- upgraded by db/migrations/, which `npm run db:migrate` runs right after this file.

CREATE TABLE IF NOT EXISTS glasses (
  id          TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  style       TEXT NOT NULL DEFAULT 'classic',
  price       INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),  -- rupiah
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per color of a frame. The first color (lowest sort_order) is the default one.
CREATE TABLE IF NOT EXISTS glasses_colors (
  glasses_id TEXT NOT NULL REFERENCES glasses(id) ON DELETE CASCADE,
  id         TEXT NOT NULL CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       TEXT NOT NULL,
  hex        TEXT NOT NULL CHECK (hex ~ '^#[0-9A-Fa-f]{6}$'),
  model_url  TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (glasses_id, id)
);
