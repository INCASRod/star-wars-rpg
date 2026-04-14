-- Migration 043: Add characteristic_overrides column to ref_adversaries
-- Stores per-skill characteristic substitutions for custom adversaries.
-- Currently only meaningful for the Lightsaber skill (key = 'Lightsaber').
-- Example: { "Lightsaber": "INT" } means the adversary uses Intellect for Lightsaber.
-- OggDude seeded adversaries resolve overrides at load time from adversaries.json
-- (the "Lightsaber (Intellect)" key format) and never touch this column.

ALTER TABLE ref_adversaries
  ADD COLUMN IF NOT EXISTS characteristic_overrides jsonb NOT NULL DEFAULT '{}';

COMMENT ON COLUMN ref_adversaries.characteristic_overrides IS
  'Per-skill characteristic substitutions. Only "Lightsaber" key is currently used. '
  'Value is a short char key: BR | AGI | INT | CUN | WIL | PR. '
  'Example: {"Lightsaber": "INT"} = use Intellect for Lightsaber checks.';
