-- 066_respec_character_migration.sql
-- Updates Zid Hag: career THEACE→SMUG, spec PILOT→BLORUN (starting), career skills updated.
-- Updates Grevi: career SPY→EXPLORER, spec SCOUT unchanged, career skills updated.

DO $$
DECLARE
  zid_id   UUID := '93be969c-d011-43c7-b899-211db5f3fbdf';
  grevi_id UUID := 'e806c8a6-5f0d-44ca-bb60-c67fb27792b6';
BEGIN

  -- ── ZID HAG: THEACE/PILOT → SMUG/BLORUN ──────────────────────────────────

  -- Update career
  UPDATE characters SET career_key = 'SMUG' WHERE id = zid_id;

  -- Remove PILOT specialization
  DELETE FROM character_specializations
  WHERE character_id = zid_id AND specialization_key = 'PILOT';

  -- Add BLORUN (Blockade Runner) as starting spec
  INSERT INTO character_specializations (character_id, specialization_key, is_starting, purchase_order)
  VALUES (zid_id, 'BLORUN', true, 0)
  ON CONFLICT DO NOTHING;

  -- Shift DROIDTECH to purchase_order 1
  UPDATE character_specializations
  SET purchase_order = 1
  WHERE character_id = zid_id AND specialization_key = 'DROIDTECH';

  -- Reset career skill flags, then set Smuggler skills
  UPDATE character_skills SET is_career = false WHERE character_id = zid_id;
  UPDATE character_skills
  SET is_career = true
  WHERE character_id = zid_id
    AND skill_key IN ('COORD','DECEP','UND','PERC','PILOTSP','SKUL','SW','VIGIL');

  -- Audit record
  INSERT INTO xp_transactions (character_id, amount, reason)
  VALUES (zid_id, 0, 'reSpecialized migration: career/spec updated — THEACE/PILOT → SMUG/BLORUN');

  -- ── GREVI: SPY → EXPLORER; SCOUT unchanged ───────────────────────────────

  -- Update career
  UPDATE characters SET career_key = 'EXPLORER' WHERE id = grevi_id;

  -- Spec (SCOUT) remains — no insert/delete needed

  -- Reset career skill flags, then set Explorer skills
  UPDATE character_skills SET is_career = false WHERE character_id = grevi_id;
  UPDATE character_skills
  SET is_career = true
  WHERE character_id = grevi_id
    AND skill_key IN ('ASTRO','COOL','LORE','OUT','PERC','PILOTSP','SURV','XEN');

  -- Audit record
  INSERT INTO xp_transactions (character_id, amount, reason)
  VALUES (grevi_id, 0, 'reSpecialized migration: career/spec updated — SPY/SCOUT → EXPLORER/SCOUT');

END;
$$;
