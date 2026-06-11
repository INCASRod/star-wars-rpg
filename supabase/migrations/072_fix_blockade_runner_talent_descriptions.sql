-- 072_fix_blockade_runner_talent_descriptions.sql
-- Correct descriptions for the three custom Blockade Runner talents,
-- using exact wording from the reSpecialized v1.11 PDF.

UPDATE ref_talents SET
  description = 'Once per round while piloting a starship or vehicle, make an opposed Piloting vs. Piloting check against starship or vehicle within close range. On success, starship or vehicle suffers system strain equal to the character''s Cunning plus [AD]. Spend [AD][AD] to inflict the same amount of system strain on an additional craft within close range.',
  activation  = 'taAction'
WHERE key = 'MUSP' AND dataset_source = 'respec';

UPDATE ref_talents SET
  description = 'Once per session, make the Wretched Hive action; may make a [B]Hard ([DI][DI][DI])[b] Astrogation or Knowledge (Underworld) check to identify the path to the nearest Shadowport. Upgrade all checks the character makes to travel to and interact with the Shadowport this session, including astrogation, piloting, and social checks.',
  activation  = 'taAction'
WHERE key = 'WRHI' AND dataset_source = 'respec';

UPDATE ref_talents SET
  description = 'Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Skulduggery check to dump the ship''s cargo. Foes within short range equal to [AD] must drop to speed 1 or suffer a major collision. Spend [AD][AD] or [TR] to trigger any additional effects, based on the nature of the cargo dropped, and Game Master determination.',
  activation  = 'taAction'
WHERE key = 'CADR' AND dataset_source = 'respec';

-- Fly Casual appears in the v1.11 tree (row 4, col 4) — insert it so it's available.
INSERT INTO ref_talents
  (key, name, description, activation, is_ranked, is_force_talent, dataset_source, is_retired)
VALUES (
  'FLYCAS',
  'Fly Casual',
  'Once per encounter while piloting or aboard a familiar craft, spend a Destiny Point to add [BO] equal to the character''s Cunning to a check made to identify, scan or investigate the craft or its contents.',
  'taIncidental', false, false, 'respec', false
)
ON CONFLICT (key, dataset_source) DO NOTHING;
