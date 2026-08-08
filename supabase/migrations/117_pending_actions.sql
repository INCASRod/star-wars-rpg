-- 117_pending_actions.sql
-- Durable pending-action queue for GM/system actions that require a player decision.
--
-- Today every player decision popup is delivered purely by Supabase Realtime
-- broadcast (usePlayerBroadcast.ts) with no persistence and no catch-up query:
-- if the socket is asleep or reconnecting when the GM fires the action, the
-- message is dropped and the player sees nothing at all. This table is the
-- durable substrate — the popup and the queue row are created together and
-- resolve as one.
--
-- critical_injury_requests stays authoritative for injury state. Rows with
-- action_type = 'critical_injury' carry that request's id in source_ref and act
-- as a pointer plus presentation layer only. Nothing is migrated out of it.

CREATE TABLE IF NOT EXISTS pending_actions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    uuid NOT NULL REFERENCES campaigns(id)  ON DELETE CASCADE,
  character_id   uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  action_type    text NOT NULL
                   CHECK (action_type IN (
                     'initiative',
                     'destiny_generate',
                     'critical_injury',
                     'conflict_ack',
                     'vendor_offer',
                     'loot_reveal',
                     'gm_dialog',
                     'force_rating_offer'
                   )),
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'resolved', 'cancelled')),
  is_blocking    boolean NOT NULL DEFAULT false,
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Carries the actual result, not merely a resolution flag. Initiative rolls
  -- currently live only in roll_log (append-only, display) and in
  -- InitiativeSetupModal's transient React state — a GM reload loses them.
  result_payload jsonb,
  -- Idempotency key + pointer to the originating row where one exists
  -- (e.g. destiny_pool.id, critical_injury_requests.id, an encounter round).
  source_ref     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  resolved_at    timestamptz
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Idempotency: re-firing the same request while one is still outstanding must
-- not create a second row. NULLs are distinct in a Postgres unique index, so
-- this only dedupes requests that actually supply a source_ref.
CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_actions_open
  ON pending_actions (character_id, action_type, source_ref)
  WHERE status = 'pending';

-- Player hook's primary query.
CREATE INDEX IF NOT EXISTS idx_pending_actions_character
  ON pending_actions (character_id, status);

-- Future GM-side visibility panel.
CREATE INDEX IF NOT EXISTS idx_pending_actions_campaign
  ON pending_actions (campaign_id, status);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- This project defaults new tables to RLS-ENABLED, and the failure mode is
-- silent: privileged SQL sees every row while the browser's anon client sees an
-- empty array. So enable it explicitly and attach permissive policies, matching
-- the established pattern (003_rls_policies.sql, 028_critical_injury_system.sql).
-- Deliberately permissive: this application has no GM/player auth split today,
-- so an auth.uid()-based policy would lock out every row.
ALTER TABLE pending_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read pending_actions"   ON pending_actions;
DROP POLICY IF EXISTS "Public insert pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "Public update pending_actions" ON pending_actions;

CREATE POLICY "Public read pending_actions"
  ON pending_actions FOR SELECT USING (true);
CREATE POLICY "Public insert pending_actions"
  ON pending_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update pending_actions"
  ON pending_actions FOR UPDATE USING (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- REPLICA IDENTITY FULL is required so UPDATE/DELETE payloads carry the full
-- row, which is what makes the hook's `character_id=eq.<id>` filter work on
-- those events (same reason map_tokens and characters set it).
ALTER TABLE pending_actions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pending_actions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pending_actions;
  END IF;
END $$;
