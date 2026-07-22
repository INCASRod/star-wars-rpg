-- Migration 095: Force Presence system groundwork
--
-- Introduces the reSpecialized "Force Presence" system as an ALTERNATIVE to
-- the existing Morality system, selectable per deployment via
-- campaign_settings.morality_system. The Morality system (morality_value,
-- morality_strength_key, morality_weakness_key, morality_configured,
-- is_dark_side_fallen, dark_side_fallen_at, redeemed_at, ref_moralities,
-- character_conflicts) is NOT touched by this migration and remains fully
-- functional as the default system for any deployment that does not opt in.

-- ── campaign_settings: system selector ─────────────────────────────────────

ALTER TABLE campaign_settings
  ADD COLUMN morality_system text NOT NULL DEFAULT 'vanilla'
    CHECK (morality_system IN ('vanilla', 'force_presence'));

-- This campaign opts into Force Presence; the column default ('vanilla')
-- keeps every other deployment on the existing Morality system unchanged.
UPDATE campaign_settings SET morality_system = 'force_presence';

-- campaign_settings has had RLS enabled with zero policies since it was
-- created (062_respec_schema_prep.sql), meaning a restricted client's SELECT
-- may be silently denied. This is a pre-existing latent bug, corrected here
-- by adding the same public-read policy convention used everywhere else in
-- this schema (see "Public read ref_moralities" etc. in 003_rls_policies.sql).
CREATE POLICY "Public read campaign_settings" ON campaign_settings FOR SELECT USING (true);

-- ── characters: Force Presence Balance Points + session counters ──────────

-- 10 Balance Points total per character, tracked as light/dark counts only;
-- Neutral is derived at read time as (10 - light_points - dark_points) and
-- is never stored. Defaulting both to 0 correctly represents "all 10 points
-- Neutral", the intended starting state for every existing character — no
-- backfill is needed.
ALTER TABLE characters
  ADD COLUMN light_points integer NOT NULL DEFAULT 0,
  ADD COLUMN dark_points integer NOT NULL DEFAULT 0,
  ADD COLUMN session_conflict integer NOT NULL DEFAULT 0,
  ADD COLUMN session_tranquility integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT characters_balance_points_check
    CHECK (light_points >= 0 AND dark_points >= 0 AND light_points + dark_points <= 10);
