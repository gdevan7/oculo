CREATE TABLE IF NOT EXISTS glasses (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  frame_color TEXT NOT NULL DEFAULT '#202124', style TEXT NOT NULL DEFAULT 'classic',
  model_url TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DELETE FROM glasses WHERE id NOT IN ('blue', 'tortoiseshell', 'black');

INSERT INTO glasses (id,name,description,frame_color,style,model_url,active) VALUES
 ('blue','Blue','Blue frame with translucent blue lenses.','#1A4FD1','classic','/models/model_0_blue.glb',TRUE),
 ('tortoiseshell','Tortoiseshell','Classic brown tortoiseshell frame with smoke lenses.','#663A22','classic','/models/model_1_tortoiseshell.glb',TRUE),
 ('black','Matte Black','Minimal matte black frame with smoke lenses.','#111111','classic','/models/model_2_black.glb',TRUE)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description,
 frame_color=EXCLUDED.frame_color, style=EXCLUDED.style, model_url=EXCLUDED.model_url,
 active=EXCLUDED.active, updated_at=NOW();
