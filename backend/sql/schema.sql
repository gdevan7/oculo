CREATE TABLE IF NOT EXISTS glasses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  frame_color TEXT NOT NULL DEFAULT '#202124',
  style TEXT NOT NULL DEFAULT 'classic',
  model_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO glasses (id,name,description,frame_color,style,model_url) VALUES
 ('classic-black','Classic Black','Bold acetate, everyday style.','#202124','classic',NULL),
 ('round-titanium','Round Titanium','Lightweight round frame.','#9CA3AF','round',NULL),
 ('modern-amber','Modern Amber','Warm contemporary frame.','#9A5B35','amber',NULL),
 ('bold-black','Bold Black','Thick black acetate, full 3D model.','#111111','classic','/models/black-acetate.glb')
ON CONFLICT (id) DO NOTHING;
