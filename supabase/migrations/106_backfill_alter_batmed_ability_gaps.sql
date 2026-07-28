-- 106_backfill_alter_batmed_ability_gaps.sql
-- Full-tree sweep (all 25 respec force powers, 332 distinct power/ability
-- tree positions) found 9 ability_tree references with no backing row in
-- ref_force_abilities at all — a migration-102 seeding gap, same class as
-- ALTERRE/FIRMEARTHDARK fixed in migration 105, but on nodes no character
-- currently owns (so zero character-row blast radius; character_force_abilities
-- is untouched by this migration).
--
-- ALTER (7 rows) — content transcribed from the reSpecialized Force Power:
-- Alter v1.00 reference sheet, user-supplied 2026-07-28.
-- BATMED (2 rows) — content transcribed from the reSpecialized Force Power:
-- Battle Meditation v1.02 reference sheet, user-supplied 2026-07-28.
--
-- pip_cost follows the established convention (count of spend/commit pip
-- symbols in the ability's own text, matching sibling rows already seeded).
-- STRENGTHIMPALTER has no spend/commit line of its own (passive rider on
-- Strength, like the already-seeded RANGEIMPALTERRE) — pip_cost defaulted to 1
-- by analogy, not read off an explicit symbol. COMMUNIONDISSENSION and
-- CALLTOACTIONRE likewise have no spend/commit line (passive modifiers of the
-- basic power's existing Unify/Isolate spend) — pip_cost set to 0.

INSERT INTO ref_force_abilities (key, name, description, power_key, dataset_source, is_retired, pip_cost)
VALUES
  -- ALTER
  ('EARTHANDSKY', 'Earth and Sky',
   'Spend [FP] to activate both effects from the basic power simultaneously.',
   'ALTER', 'respec', false, 1),

  ('FORBIDDENPATH', 'Forbidden Path',
   'Spend [FP] to make a small patch of terrain within the affected area impassable.',
   'ALTER', 'respec', false, 1),

  ('CHOKEDBREATH', 'Choked Breath',
   'Spend [FP][FP] to create a corrosive atmosphere in a small area within the affected area.',
   'ALTER', 'respec', false, 2),

  ('TRAILINGNEXUSRE', 'Trailing Nexus',
   'Commit [FO] after successfully activating the power to have the area of effect follow the Force User while they are in an appropriate environment.',
   'ALTER', 'respec', false, 1),

  ('STRENGTHIMPALTER', 'Improved Strength',
   'When activating Strength, instead exclude characters equal to twice the character''s Force Rating.',
   'ALTER', 'respec', false, 1),

  ('OPPRESSIVEFORCE', 'Oppressive Force',
   'Spend [FP][FP] to upgrade the difficulty of all checks made by opponents while in the power''s area of effect once.',
   'ALTER', 'respec', false, 2),

  ('FARNEXUS', 'Far Nexus',
   'Spend [FP][FP] to choose a character within medium range of the User to become the originator of the Force Power.',
   'ALTER', 'respec', false, 2),

  -- BATMED
  ('COMMUNIONDISSENSION', 'Communion/Dissension',
   '[B]Unify:[b] Affected allies may mentally communicate normally with one another for the duration of the power, and may offer assistance to one another regardless of distance.' || E'\r\n' ||
   '[P][B]Isolate:[b] Affected foes may not receive the [BO] granted by spending [FP], nor may they offer or receive assistance.',
   'BATMED', 'respec', false, 0),

  ('CALLTOACTIONRE', 'Rally/Rout',
   'Once per encounter when using Battle Meditation, may make a [B]Hard ([DI][DI][DI]) Leadership check[b] as part of the pool:' || E'\r\n' ||
   '[P][B]Unify:[b] On success and power activation, each affected ally recovers strain equal to Presence, minus 1 per [DA] spent.' || E'\r\n' ||
   '[P][B]Isolate:[b] On success and power activation, all affected minion groups remove half their members, rounded down.',
   'BATMED', 'respec', false, 0);

-- ROLLBACK:
-- DELETE FROM ref_force_abilities
--   WHERE dataset_source = 'respec'
--     AND key IN ('EARTHANDSKY','FORBIDDENPATH','CHOKEDBREATH','TRAILINGNEXUSRE',
--                 'STRENGTHIMPALTER','OPPRESSIVEFORCE','FARNEXUS',
--                 'COMMUNIONDISSENSION','CALLTOACTIONRE');
