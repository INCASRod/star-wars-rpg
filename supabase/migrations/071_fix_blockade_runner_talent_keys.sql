-- 071_fix_blockade_runner_talent_keys.sql
-- Fix four undefined talent keys in the Blockade Runner (BLORUN) reSpec specialisation.
--
-- Root cause: Blockade Runner.xml used STDI as a placeholder for GRIT.
-- MUSP/WRHI/CADR are custom reSpec talents with no prior ref_talents definitions.

-- 1. Replace the STDI placeholder with the real GRIT key in the talent_tree JSONB.
UPDATE ref_specializations
SET    talent_tree = replace(talent_tree::text, '"STDI"', '"GRIT"')::jsonb
WHERE  key            = 'BLORUN'
  AND  dataset_source = 'respec';

-- 2. Insert the three custom reSpec talents missing from ref_talents.
INSERT INTO ref_talents
  (key, name, description, activation, is_ranked, is_force_talent, dataset_source, is_retired)
VALUES
  (
    'MUSP',
    'Mustafar Special',
    'Once per round, make an opposed Piloting vs. Piloting check against a starship or vehicle within close range. On success, the target craft suffers system strain equal to Cunning plus [AD]. Spend [TH][TH] to affect an additional craft within close range.',
    'taAction', false, false, 'respec', false
  ),
  (
    'WRHI',
    'Wretched Hive',
    'Once per session, make a [B]Hard ([DI][DI][DI])[b] Astrogation or Knowledge (Underworld) check to identify the path to the nearest Shadowport. Upgrade all checks to travel to and interact with the Shadowport this session.',
    'taAction', false, false, 'respec', false
  ),
  (
    'CADR',
    'Cargo Drop',
    'Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Skulduggery check to dump the ship''s cargo. Foes within short range equal to [AD] must drop to speed 1 or suffer a major collision.',
    'taAction', false, false, 'respec', false
  )
ON CONFLICT (key, dataset_source) DO NOTHING;
