-- Add condition and item_image_url to all three character item tables.
-- condition defaults to 'undamaged' so existing rows need no backfill.
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;
