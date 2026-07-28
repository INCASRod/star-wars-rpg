-- 105_remap_stale_force_ability_keys.sql
-- Migration 102 replaced the ALTER/HEALHARM/INFLUENCE/SENSE respec ability_tree
-- content with correct reSpecialized abilities, renaming the ability keys at
-- several tree positions. useForcePowers.ts was patched (this session) to match
-- a character's owned abilities by tree position (tree_row/tree_col) rather than
-- by force_ability_key, so nothing is visibly broken today. But force_ability_key
-- itself is now stale on 9 rows across 2 characters (Bylethia Ford, Grevi
-- Unduli) — it still resolves to a real (but orphaned, pre-102) ability row,
-- which will silently mislead any future code that looks up ability identity by
-- key instead of position (e.g. the planned Force power dossier work).
--
-- This migration updates force_ability_key on exactly those 9 rows, by id, to
-- the key actually present at that row/col in the CURRENT ability_tree JSON.
-- tree_row, tree_col, xp_cost, force_power_key, character_id are untouched.
--
-- Two of the nine target keys (ALTERRE — "Alter Basic Power", FIRMEARTHDARK —
-- "Firm Earth, Dark Sky") do not exist yet in ref_force_abilities at all — a
-- separate, narrower gap in migration 102's ability seeding for ALTER only (its
-- other new-tree abilities — RANGEALTERRE, DURATIONALTERRE, SPEEDALTERRE,
-- ALTERREMASTER, RANGEIMPALTERRE, STRENGTHALTERRE — were seeded fine). Content
-- below transcribed directly from the reSpecialized Force Power: Alter v1.00
-- reference sheet (2026-07-05), user-supplied 2026-07-28. Note: ALTERRE's
-- content is very close to the pre-existing ALTERBASIC row's (missing only the
-- concealment-toggle clause) — both rows are kept per this migration's
-- explicit scope (character_force_abilities remap only + the 2 missing ability
-- rows needed to back it); deciding whether ALTERBASIC should be retired as a
-- superseded duplicate is a separate follow-up, not resolved here.

-- 1. Seed the two ability rows the corrected ALTER tree needs but never got.
INSERT INTO ref_force_abilities (key, name, description, power_key, dataset_source, is_retired, pip_cost)
VALUES
  ('ALTERRE', 'Alter Basic Power (reSpecialized)',
   'The Force user can tap into the living Force of their surroundings, manipulating the nearby environs:' || E'\r\n' ||
   '[P]The user may spend [FP] to make all terrain currently within short range their choice of normal or difficult terrain until the end of their next turn.' || E'\r\n' ||
   '[P]The user may spend [FP] to give concealment to or remove concealment from all characters within short range until the end of their next turn.',
   'ALTER', 'respec', false, 2),
  ('FIRMEARTHDARK', 'Firm Earth, Dark Sky',
   'The power can affect firm terrain, such as packed earth, stone, or ice. Concealment from this power adds [BO][BO] and [SE][SE].',
   'ALTER', 'respec', false, 2);

-- 2. Remap the 9 stale rows, targeted by id + old key as a belt-and-suspenders
--    guard (0 rows affected, rather than a silent wrong update, if anything
--    about these specific rows changed since the audit this migration is
--    based on).

-- Bylethia Ford (Wrath) — HEALHARM
UPDATE character_force_abilities SET force_ability_key = 'HEHARESPEC'
  WHERE id = '05882b11-08da-420c-a898-a976bda01730' AND force_ability_key = 'HEALHARMBASIC';
UPDATE character_force_abilities SET force_ability_key = 'HEALMAG'
  WHERE id = 'd51c8662-9379-4e5c-893d-4efe5dd196f6' AND force_ability_key = 'HEALHARMRANGE';
UPDATE character_force_abilities SET force_ability_key = 'SYMSPI'
  WHERE id = 'a78848b4-f727-422f-bd95-fd84177759e3' AND force_ability_key = 'HEALHARMMAGNITUDE';
UPDATE character_force_abilities SET force_ability_key = 'EMPMEDI'
  WHERE id = '7113b979-fe9d-476b-a36e-59e15a1df5fe' AND force_ability_key = 'HEALHARMRANGE';
UPDATE character_force_abilities SET force_ability_key = 'EMPMEDI'
  WHERE id = '6b5e9773-705c-486f-91d3-55828a85f42f' AND force_ability_key = 'HEALHARMMAGNITUDE';

-- Bylethia Ford (Wrath) — INFLUENCE, SENSE
UPDATE character_force_abilities SET force_ability_key = 'INFLUBPRE'
  WHERE id = 'd56444a5-1587-4f3c-bf7b-b2fd45191cc4' AND force_ability_key = 'INFLUENCEBASIC';
UPDATE character_force_abilities SET force_ability_key = 'SENSEBARE'
  WHERE id = '6d29ce9e-5071-4109-884f-70ac4406d003' AND force_ability_key = 'SENSEBASIC';

-- Grevi Unduli — ALTER
UPDATE character_force_abilities SET force_ability_key = 'ALTERRE'
  WHERE id = 'eb7565c7-f678-415e-9a43-ff01fe1e83bb' AND force_ability_key = 'ALTERBASIC';
UPDATE character_force_abilities SET force_ability_key = 'FIRMEARTHDARK'
  WHERE id = 'f276235f-4c02-4662-9fed-936de4308a9a' AND force_ability_key = 'ALTERCONTROL1';

-- ROLLBACK (restores the pre-migration stale keys + removes the 2 seeded rows):
--
-- UPDATE character_force_abilities SET force_ability_key = 'HEALHARMBASIC'    WHERE id = '05882b11-08da-420c-a898-a976bda01730';
-- UPDATE character_force_abilities SET force_ability_key = 'HEALHARMRANGE'    WHERE id = 'd51c8662-9379-4e5c-893d-4efe5dd196f6';
-- UPDATE character_force_abilities SET force_ability_key = 'HEALHARMMAGNITUDE' WHERE id = 'a78848b4-f727-422f-bd95-fd84177759e3';
-- UPDATE character_force_abilities SET force_ability_key = 'HEALHARMRANGE'    WHERE id = '7113b979-fe9d-476b-a36e-59e15a1df5fe';
-- UPDATE character_force_abilities SET force_ability_key = 'HEALHARMMAGNITUDE' WHERE id = '6b5e9773-705c-486f-91d3-55828a85f42f';
-- UPDATE character_force_abilities SET force_ability_key = 'INFLUENCEBASIC'   WHERE id = 'd56444a5-1587-4f3c-bf7b-b2fd45191cc4';
-- UPDATE character_force_abilities SET force_ability_key = 'SENSEBASIC'       WHERE id = '6d29ce9e-5071-4109-884f-70ac4406d003';
-- UPDATE character_force_abilities SET force_ability_key = 'ALTERBASIC'       WHERE id = 'eb7565c7-f678-415e-9a43-ff01fe1e83bb';
-- UPDATE character_force_abilities SET force_ability_key = 'ALTERCONTROL1'    WHERE id = 'f276235f-4c02-4662-9fed-936de4308a9a';
-- DELETE FROM ref_force_abilities WHERE key IN ('ALTERRE', 'FIRMEARTHDARK') AND dataset_source = 'respec';
