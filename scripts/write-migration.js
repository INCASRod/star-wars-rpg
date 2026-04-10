// Writes supabase/migrations/031_attachments.sql
const fs = require('fs')
const path = require('path')

const rows = fs.readFileSync(path.join(__dirname, 'attachment_seed_rows.txt'), 'utf8').trimEnd()
// Remove trailing comma from last row if present
const seedRows = rows.endsWith(',') ? rows.slice(0, -1) : rows

const sql = `-- Migration 031: ref_item_attachments full schema + seed, character attachment tables
-- Extends ref_item_attachments with type/hp_required/price/rarity/category_limits/source.
-- Re-seeds with all Weapon and Armor entries from ItemAttachments.xml.
-- base_mods / added_mods stored as jsonb ARRAY of {key,count,misc_desc} objects.
-- Creates character_weapon_attachments and character_armor_attachments.

-- ── Extend ref_item_attachments schema ───────────────────────────────────────
ALTER TABLE ref_item_attachments
  ADD COLUMN IF NOT EXISTS type             text    NOT NULL DEFAULT 'Weapon',
  ADD COLUMN IF NOT EXISTS hp_required      integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS price            integer,
  ADD COLUMN IF NOT EXISTS rarity           integer,
  ADD COLUMN IF NOT EXISTS category_limits  text[],
  ADD COLUMN IF NOT EXISTS source           text;

-- Remove old placeholder rows (they used flat-object base_mods format)
DELETE FROM ref_item_attachments WHERE key IN ('REINFORCEDPLATING','CUSTOMGRIP','ENERGYDISSIPATORS');

-- ── Seed all Weapon + Armor attachments from ItemAttachments.xml ─────────────
-- base_mods / added_mods: [{key, count, misc_desc}] array format
INSERT INTO ref_item_attachments
  (key, name, description, type, hp_required, price, rarity, category_limits, base_mods, added_mods, source)
VALUES
${seedRows}
ON CONFLICT (key) DO UPDATE SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  type             = EXCLUDED.type,
  hp_required      = EXCLUDED.hp_required,
  price            = EXCLUDED.price,
  rarity           = EXCLUDED.rarity,
  category_limits  = EXCLUDED.category_limits,
  base_mods        = EXCLUDED.base_mods,
  added_mods       = EXCLUDED.added_mods,
  source           = EXCLUDED.source;

-- ── character_weapon_attachments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_weapon_attachments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id        uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character_weapon_id uuid REFERENCES character_weapons(id) ON DELETE CASCADE,
  attachment_key      text NOT NULL REFERENCES ref_item_attachments(key),
  added_mods          jsonb NOT NULL DEFAULT '[]',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cwa_character_id ON character_weapon_attachments(character_id);
CREATE INDEX IF NOT EXISTS idx_cwa_weapon_id    ON character_weapon_attachments(character_weapon_id);

ALTER TABLE character_weapon_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_weapon_attachments' AND policyname='anon read character_weapon_attachments') THEN
    CREATE POLICY "anon read character_weapon_attachments" ON character_weapon_attachments FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_weapon_attachments' AND policyname='auth read character_weapon_attachments') THEN
    CREATE POLICY "auth read character_weapon_attachments" ON character_weapon_attachments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_weapon_attachments' AND policyname='auth write character_weapon_attachments') THEN
    CREATE POLICY "auth write character_weapon_attachments" ON character_weapon_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── character_armor_attachments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_armor_attachments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id       uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character_armor_id uuid REFERENCES character_armor(id) ON DELETE CASCADE,
  attachment_key     text NOT NULL REFERENCES ref_item_attachments(key),
  added_mods         jsonb NOT NULL DEFAULT '[]',
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_caa_character_id ON character_armor_attachments(character_id);
CREATE INDEX IF NOT EXISTS idx_caa_armor_id     ON character_armor_attachments(character_armor_id);

ALTER TABLE character_armor_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_armor_attachments' AND policyname='anon read character_armor_attachments') THEN
    CREATE POLICY "anon read character_armor_attachments" ON character_armor_attachments FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_armor_attachments' AND policyname='auth read character_armor_attachments') THEN
    CREATE POLICY "auth read character_armor_attachments" ON character_armor_attachments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='character_armor_attachments' AND policyname='auth write character_armor_attachments') THEN
    CREATE POLICY "auth write character_armor_attachments" ON character_armor_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── RLS on ref_item_attachments ───────────────────────────────────────────────
ALTER TABLE ref_item_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ref_item_attachments' AND policyname='anon read ref_item_attachments') THEN
    CREATE POLICY "anon read ref_item_attachments" ON ref_item_attachments FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ref_item_attachments' AND policyname='auth read ref_item_attachments') THEN
    CREATE POLICY "auth read ref_item_attachments" ON ref_item_attachments FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
`

const outPath = path.join(__dirname, '../supabase/migrations/031_attachments.sql')
fs.writeFileSync(outPath, sql)
console.log('Written to', outPath, '—', sql.length, 'chars')
