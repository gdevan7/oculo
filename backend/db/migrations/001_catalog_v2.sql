-- Upgrades a database created by the 3-frame version (columns frame_color and model_url on
-- glasses, ids white / tortoiseshell / black). Does nothing on a fresh database. Safe to repeat.
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS subtitle    TEXT NOT NULL DEFAULT '';
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS price       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS sort_order  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE glasses DROP COLUMN IF EXISTS frame_color;
ALTER TABLE glasses DROP COLUMN IF EXISTS model_url;

-- The old demo rows have no colors and are replaced by `npm run db:seed`.
DELETE FROM glasses
 WHERE id IN ('white', 'tortoiseshell', 'black')
   AND NOT EXISTS (SELECT 1 FROM glasses_colors c WHERE c.glasses_id = glasses.id);
