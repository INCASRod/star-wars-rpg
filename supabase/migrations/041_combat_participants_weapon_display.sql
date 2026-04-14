-- Migration 041: Add secondary_weapon_name to combat_participants
-- Enables the GM initiative tracker to show dual-wield weapon pairs.
-- active_weapon_name already exists for the primary/single weapon.
ALTER TABLE combat_participants
  ADD COLUMN IF NOT EXISTS secondary_weapon_name text;
