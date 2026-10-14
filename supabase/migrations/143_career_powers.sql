-- Migration 143: Career Powers / Bonus Career Powers (reSpecialized Primer v2.1, pp. 3-5).
--
-- Primer rules this table feeds (logic lands in later changes, NOT here):
--   * At creation a Career grants a choice of one of its two Career Powers, and the
--     starting specialization a choice of one of its two Bonus Career Powers, each at
--     no XP cost for the Basic Power. Same power chosen twice -> one free accessible
--     upgrade.
--   * Every Career Power / Bonus Career Power the character has counts as having the
--     Mentor discount: -5 XP off that power's Basic Power. Bonus Career Powers from
--     specializations bought later are discount-only (no free pick).
--   * PADAWAN: any 1 Force Power (free Basic, or one non-Mastery upgrade if owned).
--     MASTER (bought as an additional spec): any 2, which also become Career Powers.
--     These are stored as power_key NULL + any_power_count.
--
-- One row per (scope, scope_key, power). scope = 'career' -> ref_careers.key,
-- 'specialization' -> ref_specializations.key. Rows are written only for respec
-- careers/specializations that currently exist in the DB; primer entries with no
-- seeded row (Lancer, Shaman, Reclaimer, Trickster, Champion, Slayer, Temple
-- Guardian, Wayseeker, ...) are skipped with a NOTICE, and a later migration adds
-- them once the spec exists. power_key values are ref_force_powers.key
-- (dataset_source = 'respec').

CREATE TABLE IF NOT EXISTS ref_career_powers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope            text NOT NULL CHECK (scope IN ('career', 'specialization')),
  scope_key        text NOT NULL,
  power_key        text,
  any_power_count  int  NOT NULL DEFAULT 0,
  note             text,
  dataset_source   text NOT NULL DEFAULT 'respec',
  CONSTRAINT ref_career_powers_shape CHECK (
    (power_key IS NOT NULL AND any_power_count = 0) OR
    (power_key IS NULL AND any_power_count > 0)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ref_career_powers_named_uq
  ON ref_career_powers (scope, scope_key, power_key, dataset_source)
  WHERE power_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ref_career_powers_any_uq
  ON ref_career_powers (scope, scope_key, dataset_source)
  WHERE power_key IS NULL;

ALTER TABLE ref_career_powers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read ref_career_powers" ON ref_career_powers;
CREATE POLICY "anon read ref_career_powers" ON ref_career_powers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "auth read ref_career_powers" ON ref_career_powers;
CREATE POLICY "auth read ref_career_powers" ON ref_career_powers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "GM write ref_career_powers" ON ref_career_powers;
CREATE POLICY "GM write ref_career_powers" ON ref_career_powers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.user_id = auth.uid() AND p.is_gm = true))
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.user_id = auth.uid() AND p.is_gm = true));

-- ── Seed ─────────────────────────────────────────────────────────────────────
-- Idempotent: clear the respec rows first so re-running does not duplicate.
DELETE FROM ref_career_powers WHERE dataset_source = 'respec';

DO $$
DECLARE
  skipped text;
  bad text;
BEGIN
  CREATE TEMP TABLE _cp (scope text, scope_key text, power_key text) ON COMMIT DROP;

  INSERT INTO _cp VALUES
    -- Careers
    ('career','CONSULAR','INFLUENCE'),   ('career','CONSULAR','MOVE'),
    ('career','GUARD','ENHANCE'),        ('career','GUARD','PROTUNL'),
    ('career','MYSTIC','FORSEE'),        ('career','MYSTIC','SENSE'),
    ('career','SEEKER','FARSIGHT'),      ('career','SEEKER','SEEK'),
    ('career','SENTINEL','MISDIRECT'),   ('career','SENTINEL','MOVE'),
    ('career','WAR','ENHANCE'),          ('career','WAR','SENSE'),
    ('career','JEDI','ENHANCE'),         ('career','JEDI','SENSE'),
    -- Consular
    ('specialization','ARBITER','BIND'),        ('specialization','ARBITER','INSIGHTRESPEC'),
    ('specialization','ARCHIVIST','MANIPULATE'),('specialization','ARCHIVIST','PSYCHOMETRY'),
    ('specialization','ASCETIC','EBBFLOW'),     ('specialization','ASCETIC','ENDURE'),
    ('specialization','HEALER','HEALHARM'),     ('specialization','HEALER','PROTUNL'),
    ('specialization','SAGE','FORSEE'),         ('specialization','SAGE','SENSE'),
    ('specialization','TEACHER','VALORHORRIFY'),('specialization','TEACHER','IMBUE'),
    -- Guardian
    ('specialization','ARMORER','MANIPULATE'),  ('specialization','ARMORER','ENDURE'),
    ('specialization','PEACE','BATMED'),        ('specialization','PEACE','INFLUENCE'),
    ('specialization','PROTECT','HEALHARM'),    ('specialization','PROTECT','MOVE'),
    ('specialization','WARDEN','BIND'),         ('specialization','WARDEN','VALORHORRIFY'),
    ('specialization','WARLEADER','ALTER'),     ('specialization','WARLEADER','FORSEE'),
    -- Mystic
    ('specialization','ADVISOR','IMBUE'),       ('specialization','ADVISOR','INFLUENCE'),
    ('specialization','ALCHEMIST','HEALHARM'),  ('specialization','ALCHEMIST','CONJURERE'),
    ('specialization','MAGUS','HEALHARM'),      ('specialization','MAGUS','PROTUNL'),
    ('specialization','PROPHET','INFLUENCE'),   ('specialization','PROPHET','VALORHORRIFY'),
    ('specialization','SEER','EBBFLOW'),        ('specialization','SEER','SEEK'),
    -- Seeker
    ('specialization','EXECUTIONER','BIND'),    ('specialization','EXECUTIONER','ENHANCE'),
    ('specialization','HERMIT','ALTER'),        ('specialization','HERMIT','COMMUNE'),
    ('specialization','HUNTER','ALTER'),        ('specialization','HUNTER','INSIGHTRESPEC'),
    ('specialization','NAVIGATOR','EBBFLOW'),   ('specialization','NAVIGATOR','FORSEE'),
    ('specialization','PATH','COMMUNE'),        ('specialization','PATH','ENDURE'),
    -- Sentinel
    ('specialization','ARTISAN','MANIPULATE'),  ('specialization','ARTISAN','PSYCHOMETRY'),
    ('specialization','INVESTIGATOR','PSYCHOMETRY'),('specialization','INVESTIGATOR','SENSE'),
    ('specialization','RACER','ENHANCE'),       ('specialization','RACER','FORSEE'),
    ('specialization','SENTRY','ENHANCE'),      ('specialization','SENTRY','INSIGHTRESPEC'),
    ('specialization','SHADOW','FARSIGHT'),     ('specialization','SHADOW','SUPPRESS'),
    -- Warrior
    ('specialization','AGGRES','ENDURE'),       ('specialization','AGGRES','VALORHORRIFY'),
    ('specialization','COLOSSUS','BIND'),       ('specialization','COLOSSUS','ENDURE'),
    ('specialization','STARACE','MANIPULATE'),  ('specialization','STARACE','SEEK'),
    ('specialization','STEELHANDADEPT','MOVE'), ('specialization','STEELHANDADEPT','SUPPRESS'),
    -- Duplicate respec rows that the Warrior career's specialization_keys point at
    -- (STEELHAND / JUYO); seeded alongside their *ADEPT / *BERSERKER twins so
    -- either row resolves.
    ('specialization','STEELHAND','MOVE'),      ('specialization','STEELHAND','SUPPRESS'),
    ('specialization','JUYO','ENHANCE'),        ('specialization','JUYO','VALORHORRIFY'),
    -- Jedi
    ('specialization','GENERAL','ENDURE'),      ('specialization','GENERAL','BATMED'),
    ('specialization','JEDIKNIGHT','INFLUENCE'),('specialization','JEDIKNIGHT','MOVE'),
    ('specialization','TEMPLEGUARDIAN','BIND'), ('specialization','TEMPLEGUARDIAN','SUPPRESS'),
    ('specialization','WAYSEEKER','EBBFLOW'),   ('specialization','WAYSEEKER','FORSEE'),
    -- Universal lightsaber forms
    ('specialization','ATARU','ENHANCE'),       ('specialization','ATARU','SEEK'),
    ('specialization','JUYOBERSERKER','ENHANCE'),('specialization','JUYOBERSERKER','VALORHORRIFY'),
    ('specialization','MAKASHI','INFLUENCE'),   ('specialization','MAKASHI','INSIGHTRESPEC'),
    ('specialization','NIMAN','MOVE'),          ('specialization','NIMAN','INFLUENCE'),
    ('specialization','SHIEN','MISDIRECT'),     ('specialization','SHIEN','SENSE'),
    ('specialization','SHIICHO','ENHANCE'),     ('specialization','SHIICHO','ENDURE'),
    ('specialization','SORESU','ENDURE'),       ('specialization','SORESU','SENSE');

  -- Every power key must be a real respec Force Power. Fail loudly on a typo.
  SELECT string_agg(DISTINCT c.power_key, ', ') INTO bad
  FROM _cp c
  WHERE NOT EXISTS (
    SELECT 1 FROM ref_force_powers p
    WHERE p.key = c.power_key AND p.dataset_source = 'respec' AND p.is_retired = false
  );
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'ref_career_powers: unknown power_key(s): %', bad;
  END IF;

  -- Report primer entries whose career/spec row does not exist yet.
  SELECT string_agg(DISTINCT c.scope_key, ', ') INTO skipped
  FROM _cp c
  WHERE NOT EXISTS (
    SELECT 1 FROM ref_careers r
    WHERE c.scope = 'career' AND r.key = c.scope_key AND r.dataset_source = 'respec'
  ) AND NOT EXISTS (
    SELECT 1 FROM ref_specializations s
    WHERE c.scope = 'specialization' AND s.key = c.scope_key AND s.dataset_source = 'respec'
  );
  IF skipped IS NOT NULL THEN
    RAISE NOTICE 'ref_career_powers: skipped (no respec row yet): %', skipped;
  END IF;

  INSERT INTO ref_career_powers (scope, scope_key, power_key)
  SELECT c.scope, c.scope_key, c.power_key
  FROM _cp c
  WHERE (c.scope = 'career' AND EXISTS (
          SELECT 1 FROM ref_careers r WHERE r.key = c.scope_key AND r.dataset_source = 'respec'))
     OR (c.scope = 'specialization' AND EXISTS (
          SELECT 1 FROM ref_specializations s WHERE s.key = c.scope_key AND s.dataset_source = 'respec'));
END $$;

-- Free-choice special cases (power_key NULL, any_power_count > 0).
INSERT INTO ref_career_powers (scope, scope_key, power_key, any_power_count, note)
SELECT 'specialization', v.k, NULL, v.n, v.note
FROM (VALUES
  ('PADAWAN', 1, 'Any 1 Force Power of choice: free Basic Power, or one non-Mastery upgrade if already owned.'),
  ('MASTER',  2, 'Bought as an additional specialization: any 2 Force Powers, which become Career Powers; free Basic Power each, or one non-Mastery upgrade if already owned.')
) AS v(k, n, note)
WHERE EXISTS (SELECT 1 FROM ref_specializations s WHERE s.key = v.k AND s.dataset_source = 'respec');
