-- 062_respec_schema_prep.sql
-- Prepares ref tables for multi-dataset coexistence.
-- Changes PKs from (key) to (key, dataset_source), drops conflicting FKs,
-- adds is_retired flags, and creates campaign_settings.

-- ── 1. Drop FK constraints that reference the soon-to-change PKs ──────────
ALTER TABLE character_talents
  DROP CONSTRAINT IF EXISTS character_talents_talent_key_fkey;

ALTER TABLE character_specializations
  DROP CONSTRAINT IF EXISTS character_specializations_specialization_key_fkey;

ALTER TABLE characters
  DROP CONSTRAINT IF EXISTS characters_career_key_fkey;

ALTER TABLE ref_specializations
  DROP CONSTRAINT IF EXISTS ref_specializations_career_key_fkey;

-- ── 2. ref_talents ────────────────────────────────────────────────────────
ALTER TABLE ref_talents
  ADD COLUMN IF NOT EXISTS dataset_source TEXT NOT NULL DEFAULT 'oggdude',
  ADD COLUMN IF NOT EXISTS is_retired     BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ref_talents DROP CONSTRAINT IF EXISTS ref_talents_pkey;
ALTER TABLE ref_talents ADD PRIMARY KEY (key, dataset_source);

UPDATE ref_talents SET dataset_source = 'oggdude', is_retired = false;

-- ── 3. ref_force_abilities ────────────────────────────────────────────────
ALTER TABLE ref_force_abilities
  ADD COLUMN IF NOT EXISTS dataset_source TEXT NOT NULL DEFAULT 'oggdude',
  ADD COLUMN IF NOT EXISTS is_retired     BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ref_force_abilities DROP CONSTRAINT IF EXISTS ref_force_abilities_pkey;
ALTER TABLE ref_force_abilities ADD PRIMARY KEY (key, dataset_source);

UPDATE ref_force_abilities SET dataset_source = 'oggdude', is_retired = false;

-- ── 4. ref_specializations ───────────────────────────────────────────────
ALTER TABLE ref_specializations
  ADD COLUMN IF NOT EXISTS dataset_source TEXT NOT NULL DEFAULT 'oggdude',
  ADD COLUMN IF NOT EXISTS is_retired     BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ref_specializations DROP CONSTRAINT IF EXISTS ref_specializations_pkey;
ALTER TABLE ref_specializations ADD PRIMARY KEY (key, dataset_source);

UPDATE ref_specializations SET dataset_source = 'oggdude', is_retired = false;

-- ── 5. ref_careers ───────────────────────────────────────────────────────
ALTER TABLE ref_careers
  ADD COLUMN IF NOT EXISTS dataset_source TEXT NOT NULL DEFAULT 'oggdude',
  ADD COLUMN IF NOT EXISTS is_retired     BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ref_careers DROP CONSTRAINT IF EXISTS ref_careers_pkey;
ALTER TABLE ref_careers ADD PRIMARY KEY (key, dataset_source);

UPDATE ref_careers SET dataset_source = 'oggdude', is_retired = false;

-- ── 6. campaign_settings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_settings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID,
  active_dataset TEXT        NOT NULL DEFAULT 'oggdude',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO campaign_settings (active_dataset)
SELECT 'oggdude'
WHERE NOT EXISTS (SELECT 1 FROM campaign_settings);
