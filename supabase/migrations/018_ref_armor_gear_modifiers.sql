-- Migration 018: Add structured modifier columns to ref_armor; create ref_item_attachments
-- These columns are populated from OggDude Armor.xml / ItemAttachments.xml exports.
-- The derived stats engine reads these at render time.

-- ── ref_armor ────────────────────────────────────────────────────────────────
ALTER TABLE ref_armor
  ADD COLUMN IF NOT EXISTS soak_bonus      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS defense_melee   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS defense_ranged  integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN ref_armor.soak_bonus     IS 'Soak added when this armor is equipped (from <Soak> in Armor.xml)';
COMMENT ON COLUMN ref_armor.defense_melee  IS 'Melee defense added when equipped (from <DefenseMelee>)';
COMMENT ON COLUMN ref_armor.defense_ranged IS 'Ranged defense added when equipped (from <DefenseRanged>)';

-- Seed from existing columns where new columns are still at default 0.
-- ref_armor.soak  → soak_bonus
-- ref_armor.defense → both melee and ranged (FFG armor typically has equal defenses)
UPDATE ref_armor
  SET soak_bonus     = COALESCE(soak, 0),
      defense_melee  = COALESCE(defense, 0),
      defense_ranged = COALESCE(defense, 0)
  WHERE soak_bonus = 0 AND defense_melee = 0 AND defense_ranged = 0;

-- ── ref_item_attachments ─────────────────────────────────────────────────────
-- Stores parsed data from OggDude ItemAttachments.xml.
-- base_mods  = always-on modifiers (BaseMods block)
-- added_mods = bonus modifiers when the attachment has been upgraded (AddedMods block)
CREATE TABLE IF NOT EXISTS ref_item_attachments (
  key          text PRIMARY KEY,
  name         text NOT NULL,
  description  text,
  base_mods    jsonb,
  added_mods   jsonb
);

COMMENT ON TABLE  ref_item_attachments IS 'Item attachment definitions from OggDude ItemAttachments.xml';
COMMENT ON COLUMN ref_item_attachments.base_mods IS
  '{ soakAdd, defenseMeleeAdd, defenseRangedAdd, woundThresholdAdd, strainThresholdAdd }';
COMMENT ON COLUMN ref_item_attachments.added_mods IS
  'Same structure as base_mods — applied when attachment is fully upgraded';

-- Seed a handful of common attachments for testing purposes.
-- A full seed is performed by the OggDude import script.

INSERT INTO ref_item_attachments (key, name, description, base_mods, added_mods) VALUES
  ('REINFORCEDPLATING', 'Reinforced Plating', 'Adds protective plating to the armor',
   '{"soakAdd": 1}'::jsonb, NULL),
  ('CUSTOMGRIP', 'Custom Grip', 'Improves weapon handling',
   '{}'::jsonb, NULL),
  ('ENERGYDISSIPATORS', 'Energy Dissipators', 'Reduces energy damage',
   '{"soakAdd": 1}'::jsonb, NULL)
ON CONFLICT (key) DO NOTHING;

-- ── ref_careers: ensure force_rating column exists ───────────────────────────
-- This column is already seeded in earlier migrations but ALTER is idempotent.
ALTER TABLE ref_careers
  ADD COLUMN IF NOT EXISTS force_rating integer NOT NULL DEFAULT 0;
