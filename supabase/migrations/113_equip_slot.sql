-- Add equip_slot (body anchor) to character_weapons, character_armor, character_gear.
-- Distinct from stow_location_* (where a STOWED item physically lives) — equip_slot
-- records which body anchor an EQUIPPED item is attached to. No CHECK constraint,
-- matching equip_state's own precedent (007_equip_state.sql) of enforcing its value
-- set in TypeScript only. Null means "no anchor assigned".

ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS equip_slot TEXT;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS equip_slot TEXT;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS equip_slot TEXT;
