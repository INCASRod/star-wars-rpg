-- 127_market_merchants.sql
-- Single active merchant per campaign for the GM Market rail panel.
--
-- Merchants are ephemeral: no history table, no persistence beyond "the one
-- active row per campaign" — long-term storage is a downloadable JSON
-- snapshot (src/lib/marketSnapshot.ts), not this table. ALL TRANSACTIONS ARE
-- MANUAL: price is a display-only, GM-editable number. Nothing here computes,
-- deducts, or validates credits, and nothing here writes to any character_*
-- table.
--
-- stock jsonb shape, one element per line:
-- { item_table: 'weapon'|'armor'|'gear', ref_key: string, name: string,
--   base_rarity: number, modified_rarity: number, price: number,
--   restricted: boolean, tier: 'open'|'back_room'|'under_counter',
--   revealed: boolean }
--
-- Single-active-row enforcement follows 097_atomic_set_active_map.sql exactly:
-- a partial unique index as the hard guarantee, plus a SECURITY DEFINER
-- function so activation is one transaction (not two client-side UPDATEs,
-- which — per 097's own comment — leaves a real committed zero-active gap
-- visible to every Realtime subscriber).

CREATE TABLE IF NOT EXISTS market_merchants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  location_modifier     integer NOT NULL DEFAULT 0,
  archetype             text NOT NULL,
  scale                 text NOT NULL,
  legality              text NOT NULL,
  is_active             boolean NOT NULL DEFAULT false,
  is_open_to_players    boolean NOT NULL DEFAULT false,
  stock                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by            text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_merchants_campaign
  ON market_merchants (campaign_id);

-- One active merchant per campaign, hard guarantee.
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_merchants_one_active
  ON market_merchants (campaign_id) WHERE is_active = true;

-- ── updated_at trigger ───────────────────────────────────────────────────────
-- update_updated_at_column() already exists (005_combat_encounters.sql).
CREATE TRIGGER update_market_merchants_updated_at
  BEFORE UPDATE ON market_merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Atomic activation ────────────────────────────────────────────────────────
-- Mirrors set_active_map() (097_atomic_set_active_map.sql): wraps clear-then-
-- set in one transaction so Realtime subscribers never observe a committed
-- zero-active gap.
CREATE OR REPLACE FUNCTION set_active_merchant(p_campaign_id uuid, p_merchant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE market_merchants SET is_active = false WHERE campaign_id = p_campaign_id AND is_active = true;
  UPDATE market_merchants SET is_active = true  WHERE id = p_merchant_id AND campaign_id = p_campaign_id;
END;
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- This project defaults new tables to RLS-ENABLED, and the failure mode is
-- silent: privileged SQL sees every row while the browser's anon client sees
-- an empty array. Enable it explicitly and attach permissive policies,
-- matching the established pattern (003_rls_policies.sql, 117_pending_actions.sql).
-- Deliberately permissive: this application has no GM/player auth split today,
-- so an auth.uid()-based policy would lock out every row.
ALTER TABLE market_merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market_merchants"   ON market_merchants;
DROP POLICY IF EXISTS "Public insert market_merchants" ON market_merchants;
DROP POLICY IF EXISTS "Public update market_merchants" ON market_merchants;
DROP POLICY IF EXISTS "Public delete market_merchants" ON market_merchants;

CREATE POLICY "Public read market_merchants"
  ON market_merchants FOR SELECT USING (true);
CREATE POLICY "Public insert market_merchants"
  ON market_merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update market_merchants"
  ON market_merchants FOR UPDATE USING (true);
CREATE POLICY "Public delete market_merchants"
  ON market_merchants FOR DELETE USING (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- REPLICA IDENTITY FULL so UPDATE/DELETE payloads carry the full row, which
-- is what a campaign_id-filtered subscription needs (same reason
-- pending_actions and map_tokens set it).
ALTER TABLE market_merchants REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'market_merchants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE market_merchants;
  END IF;
END $$;
