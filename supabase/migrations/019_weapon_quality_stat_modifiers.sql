-- Migration 019: Add stat_modifier to ref_weapon_qualities
-- Enables DEFENSIVE and DEFLECTION qualities to contribute to derived stats
-- at render time via the client-side derived stats engine.

ALTER TABLE ref_weapon_qualities
  ADD COLUMN IF NOT EXISTS stat_modifier jsonb;

-- DEFENSIVE: grants +1 melee defense per quality count/rank
UPDATE ref_weapon_qualities
  SET stat_modifier = '{"defenseMelee": 1}'::jsonb
  WHERE key = 'DEFENSIVE';

-- DEFLECTION: grants +1 ranged defense per quality count/rank
UPDATE ref_weapon_qualities
  SET stat_modifier = '{"defenseRanged": 1}'::jsonb
  WHERE key = 'DEFLECTION';
