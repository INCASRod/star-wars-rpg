-- ═══════════════════════════════════════════════════════════════════
-- 029 — Custom item support for ref_weapons / ref_armor / ref_gear
--
-- Adds three nullable columns to each ref table:
--   is_custom    — true for GM-created items; false for OggDude imports
--   custom_notes — freeform GM notes (markdown)
--   campaign_id  — NULL = global item visible to all; UUID = campaign-private
--
-- RLS is updated so:
--   • All authenticated / anonymous users can still read global items
--   • Campaign-private items are readable only within that campaign
--   • GMs can INSERT / UPDATE / DELETE their campaign's custom items
-- ═══════════════════════════════════════════════════════════════════

-- ── ref_weapons ──────────────────────────────────────────────────────
ALTER TABLE ref_weapons
  ADD COLUMN IF NOT EXISTS is_custom    BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_notes TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE;

-- ── ref_armor ────────────────────────────────────────────────────────
ALTER TABLE ref_armor
  ADD COLUMN IF NOT EXISTS is_custom    BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_notes TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE;

-- ── ref_gear ─────────────────────────────────────────────────────────
ALTER TABLE ref_gear
  ADD COLUMN IF NOT EXISTS is_custom    BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_notes TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE;

-- ── Indexes for campaign-scoped lookups ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ref_weapons_campaign ON ref_weapons(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ref_armor_campaign   ON ref_armor(campaign_id)   WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ref_gear_campaign    ON ref_gear(campaign_id)    WHERE campaign_id IS NOT NULL;

-- ── Drop & recreate read policies to scope to global + user's campaigns ──

DROP POLICY IF EXISTS "Public read ref_weapons" ON ref_weapons;
CREATE POLICY "Public read ref_weapons" ON ref_weapons
  FOR SELECT USING (
    campaign_id IS NULL
    OR campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public read ref_armor" ON ref_armor;
CREATE POLICY "Public read ref_armor" ON ref_armor
  FOR SELECT USING (
    campaign_id IS NULL
    OR campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public read ref_gear" ON ref_gear;
CREATE POLICY "Public read ref_gear" ON ref_gear
  FOR SELECT USING (
    campaign_id IS NULL
    OR campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid()
    )
  );

-- ── GM write policies for custom items ───────────────────────────────

CREATE POLICY "GM write custom ref_weapons" ON ref_weapons
  FOR ALL USING (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  )
  WITH CHECK (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  );

CREATE POLICY "GM write custom ref_armor" ON ref_armor
  FOR ALL USING (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  )
  WITH CHECK (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  );

CREATE POLICY "GM write custom ref_gear" ON ref_gear
  FOR ALL USING (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  )
  WITH CHECK (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  );
