-- ═══════════════════════════════════════════════════════════════════════════
-- 138 — Console phase 1a: data layer for the external campaign Console import
--
-- The Console is an external GM campaign tool whose data ships as a single
-- JSON export ("*.lor.json") with these collections: `campaign` (one object),
-- and arrays of `docs`, `arcs`, `threads`, `sessions`, `codex`, `planets`,
-- `links`, `tags`. This migration adds ONLY the storage for that data —
-- three tables, no RPCs, no policies beyond the permissive house convention.
-- No route, component, or hook touches these tables yet; a later prompt wires
-- up the UI. Read-only in this repo revision (nothing writes to these tables
-- except scripts/console-import.ts).
--
-- Scoping: every row is scoped to a `campaign_id` FK into the existing
-- `campaigns` table (migration 002), matching how every other campaign-scoped
-- table in this schema (e.g. `market_merchants`, `pending_actions`) is keyed.
--
-- RLS: this app has no GM/player auth split anywhere (documented repeatedly,
-- e.g. migrations 117, 127, 130) — every table's policies are permissive
-- `USING (true)` / `WITH CHECK (true)` for all four operations, matching
-- `pending_actions` (117) and `market_merchants` (127). Matched here exactly.
--
-- updated_at: reuses `update_updated_at_column()`, defined in
-- 005_combat_encounters.sql and already reused by 127_market_merchants.sql —
-- no new trigger function needed.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── console_campaign_state ──────────────────────────────────────────────────
-- One row per campaign: the Console's single `campaign` object, stored whole.
CREATE TABLE IF NOT EXISTS console_campaign_state (
  campaign_id  uuid PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE console_campaign_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "console_campaign_state select" ON console_campaign_state;
CREATE POLICY "console_campaign_state select" ON console_campaign_state
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "console_campaign_state insert" ON console_campaign_state;
CREATE POLICY "console_campaign_state insert" ON console_campaign_state
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "console_campaign_state update" ON console_campaign_state;
CREATE POLICY "console_campaign_state update" ON console_campaign_state
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "console_campaign_state delete" ON console_campaign_state;
CREATE POLICY "console_campaign_state delete" ON console_campaign_state
  FOR DELETE USING (true);

CREATE TRIGGER update_console_campaign_state_updated_at
  BEFORE UPDATE ON console_campaign_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── console_documents ────────────────────────────────────────────────────────
-- One row per Console `docs[]` entry. `title`/`folder`/`blocks` are promoted
-- to their own columns because they are read directly by future UI (list
-- view, folder tree, block renderer); everything else the source record
-- carries (except `body`, deliberately dropped — see console-import.ts) lands
-- in `data`.
CREATE TABLE IF NOT EXISTS console_documents (
  campaign_id  uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  id           text NOT NULL,
  title        text,
  folder       text,
  blocks       jsonb NOT NULL DEFAULT '[]'::jsonb,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, id)
);

ALTER TABLE console_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "console_documents select" ON console_documents;
CREATE POLICY "console_documents select" ON console_documents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "console_documents insert" ON console_documents;
CREATE POLICY "console_documents insert" ON console_documents
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "console_documents update" ON console_documents;
CREATE POLICY "console_documents update" ON console_documents
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "console_documents delete" ON console_documents;
CREATE POLICY "console_documents delete" ON console_documents
  FOR DELETE USING (true);

CREATE TRIGGER update_console_documents_updated_at
  BEFORE UPDATE ON console_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── console_records ──────────────────────────────────────────────────────────
-- One row per entry of the remaining seven Console arrays (`arcs`, `threads`,
-- `sessions`, `codex`, `planets`, `links`, `tags`). Unlike `docs`, none of
-- these need promoted columns yet, so the whole source record is stored in
-- `data` and disambiguated by `kind`.
CREATE TABLE IF NOT EXISTS console_records (
  campaign_id  uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN (
                 'arcs', 'threads', 'sessions', 'codex', 'planets', 'links', 'tags'
               )),
  id           text NOT NULL,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, kind, id)
);

CREATE INDEX IF NOT EXISTS console_records_campaign_kind_idx
  ON console_records (campaign_id, kind);

ALTER TABLE console_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "console_records select" ON console_records;
CREATE POLICY "console_records select" ON console_records
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "console_records insert" ON console_records;
CREATE POLICY "console_records insert" ON console_records
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "console_records update" ON console_records;
CREATE POLICY "console_records update" ON console_records
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "console_records delete" ON console_records;
CREATE POLICY "console_records delete" ON console_records
  FOR DELETE USING (true);

CREATE TRIGGER update_console_records_updated_at
  BEFORE UPDATE ON console_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
