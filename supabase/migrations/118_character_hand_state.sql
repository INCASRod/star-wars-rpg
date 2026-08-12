-- 118_character_hand_state.sql
-- Persisted state for the player-facing "hand of cards" (talents/Force powers
-- as physical cards floating over the HUD). Schema only — no hook, component,
-- or read/write logic yet (that's H2 onward). A character with no row here is
-- valid default state, not an error: the future read hook must treat a missing
-- row as { card_order: [], discarded_keys: [], is_tucked: false }, not throw.

CREATE TABLE IF NOT EXISTS character_hand_state (
  character_id    uuid PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  -- Ordered array of card keys (talent_key / force ability base-node key),
  -- player-rearranged. No FK — same convention as sig-ability/force-ability
  -- key columns elsewhere (dataset-keyed, not surrogate-id-keyed; see
  -- character_sig_ability_nodes's documented rationale).
  card_order      jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Owned talent/ability keys the player has shelved out of the active hand
  -- into the passive deck view.
  discarded_keys  jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_tucked       boolean NOT NULL DEFAULT false,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_hand_state_character
  ON character_hand_state (character_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- This project defaults new tables to RLS-ENABLED, and the failure mode is
-- silent: privileged SQL sees every row while the browser's anon client sees an
-- empty array. Matches the established pattern (003_rls_policies.sql,
-- 028_critical_injury_system.sql, 117_pending_actions.sql) — permissive on
-- purpose, since this application has no GM/player auth split; an
-- auth.uid()-based policy would lock out every row (session ownership is
-- enforced at the app layer via character_sessions.session_key, not RLS).
ALTER TABLE character_hand_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read character_hand_state"   ON character_hand_state;
DROP POLICY IF EXISTS "Public insert character_hand_state" ON character_hand_state;
DROP POLICY IF EXISTS "Public update character_hand_state" ON character_hand_state;

CREATE POLICY "Public read character_hand_state"
  ON character_hand_state FOR SELECT USING (true);
CREATE POLICY "Public insert character_hand_state"
  ON character_hand_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update character_hand_state"
  ON character_hand_state FOR UPDATE USING (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- REPLICA IDENTITY FULL so UPDATE payloads carry the full row — required for
-- any future `character_id=eq.<id>` realtime filter (same reason map_tokens,
-- characters, pending_actions set it).
ALTER TABLE character_hand_state REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'character_hand_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE character_hand_state;
  END IF;
END $$;
