-- Migration 042: Add secondary_weapon_key to combat_participants
-- Enables the GM initiative tracker to look up dual-wield secondary weapon stats.
ALTER TABLE combat_participants
  ADD COLUMN IF NOT EXISTS secondary_weapon_key text;
