-- 051_stow_location.sql
-- Track where a stowed item has been placed (vehicle, starship, safe house, or base of operations).
-- id is the group_asset.id for named assets, NULL for Base of Operations.
-- Name is denormalised so the display never breaks if an asset is renamed.

ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS stow_location_id   text,
  ADD COLUMN IF NOT EXISTS stow_location_name text,
  ADD COLUMN IF NOT EXISTS stow_location_type text;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS stow_location_id   text,
  ADD COLUMN IF NOT EXISTS stow_location_name text,
  ADD COLUMN IF NOT EXISTS stow_location_type text;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS stow_location_id   text,
  ADD COLUMN IF NOT EXISTS stow_location_name text,
  ADD COLUMN IF NOT EXISTS stow_location_type text;
