-- Migration 017: Add structured modifier fields to ref_talents
-- These fields are populated by parsing the OggDude Talents.xml export.
-- The engine in src/lib/derivedStats.ts reads these at render time to compute
-- effective stats and skill dice modifiers without writing back to the database.

ALTER TABLE ref_talents
  ADD COLUMN IF NOT EXISTS attributes        jsonb,
  ADD COLUMN IF NOT EXISTS die_modifiers     jsonb,
  ADD COLUMN IF NOT EXISTS requirements      jsonb;

COMMENT ON COLUMN ref_talents.attributes IS
  'Stat modifiers per rank: { soakValue, woundThreshold, strainThreshold, defenseMelee, defenseRanged, forceRating }';

COMMENT ON COLUMN ref_talents.die_modifiers IS
  'Array of { skillKey, boostCount, setbackCount } — per rank for ranked talents';

COMMENT ON COLUMN ref_talents.requirements IS
  'Conditions for attribute modifiers: { wearingArmor, soakAtLeast }';

-- ── Seed well-known talents ───────────────────────────────────────────────────
-- Only talents that have a known modifier effect are seeded here.
-- Remaining talents can be populated by running a full OggDude XML parse script.

-- Toughened (+2 wound threshold per rank)
UPDATE ref_talents SET attributes = '{"woundThreshold": 2}'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'TOUGHENED';

-- Grit (+1 strain threshold per rank)
UPDATE ref_talents SET attributes = '{"strainThreshold": 1}'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'GRIT';

-- Enduring (+1 soak per rank)
UPDATE ref_talents SET attributes = '{"soakValue": 1}'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'ENDURING';

-- Armor Master (+1 soak while wearing armor, not ranked)
UPDATE ref_talents SET attributes = '{"soakValue": 1}'::jsonb, requirements = '{"wearingArmor": true}'::jsonb
  WHERE key = 'ARMORMASTER';

-- Armor Master (Improved) (+1 melee and +1 ranged defense while wearing armor with soak >= 2)
UPDATE ref_talents SET attributes = '{"defenseMelee": 1, "defenseRanged": 1}'::jsonb, requirements = '{"wearingArmor": true, "soakAtLeast": 2}'::jsonb
  WHERE key = 'ARMORMASTERIMP';

-- Force Rating (+1 force rating per rank)
UPDATE ref_talents SET attributes = '{"forceRating": 1}'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'FORCERAT';

-- Commanding Presence (remove 1 setback per rank from Cool and Leadership)
UPDATE ref_talents SET die_modifiers = '[{"skillKey": "COOL", "setbackCount": 1}, {"skillKey": "LEAD", "setbackCount": 1}]'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'COMMANDINGPRESENCE';

-- Smooth Talker (add 1 boost per rank to Charm, Deception, Negotiation)
UPDATE ref_talents SET die_modifiers = '[{"skillKey": "CHARM", "boostCount": 1}, {"skillKey": "DECEP", "boostCount": 1}, {"skillKey": "NEG", "boostCount": 1}]'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'SMOOTHTALKER';

-- Savvy (add 1 boost per rank to Charm and Negotiation)
UPDATE ref_talents SET die_modifiers = '[{"skillKey": "CHARM", "boostCount": 1}, {"skillKey": "NEG", "boostCount": 1}]'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'SAVVY';

-- Codebreaker (remove 1 setback per rank from Computers and Skullduggery)
UPDATE ref_talents SET die_modifiers = '[{"skillKey": "COMP", "setbackCount": 1}, {"skillKey": "SKUL", "setbackCount": 1}]'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'CODEBREAKER';

-- Stalker (add 1 boost per rank to Coordination and Stealth)
UPDATE ref_talents SET die_modifiers = '[{"skillKey": "COORD", "boostCount": 1}, {"skillKey": "STEAL", "boostCount": 1}]'::jsonb, requirements = '{}'::jsonb
  WHERE key = 'STALKER';
