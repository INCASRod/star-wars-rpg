-- 130_market_player_projection.sql
--
-- The Archive Market Prompt 3 (player storefront). market_merchants.stock is
-- one JSONB column holding both public (open/revealed) and secret
-- (unrevealed back-room/under-counter) lines, and RLS on this table is
-- permissive (USING(true), matching this app's no-auth-split convention
-- everywhere else) — RLS is row-level anyway and cannot redact keys inside a
-- JSON blob. A player subscribing to raw postgres_changes on this table
-- would receive the ENTIRE row, unrevealed lines included, in the WebSocket
-- frame itself, regardless of what client JS chooses to read from it. That
-- fails "a player inspecting the network tab must not be able to read the
-- back room's contents" at the transport layer, not the rendering layer, so
-- no amount of careful client code fixes it.
--
-- Fix: players never touch postgres_changes on market_merchants. Instead:
--   - Catch-up: get_player_market_view(campaign_id), an RPC — a plain HTTPS
--     POST through PostgREST, never part of the realtime WAL stream — that
--     computes and returns ONLY the safe projection.
--   - Live updates: an AFTER INSERT OR UPDATE trigger that computes the same
--     projection and calls realtime.send(..., private := false) on a
--     campaign-scoped broadcast topic. Players subscribe via
--     .on('broadcast', ...), never .on('postgres_changes', ...). The trigger
--     fires on every write regardless of which client code performed it
--     (reveal, tier cycle, roll, restore, open/close), so no application
--     code (useMarketMerchant.ts, GmMarketPanel.tsx's reveal handlers) needs
--     to know a player might be listening.
--
-- Both the RPC and the trigger call ONE shared projection function so the
-- catch-up read and the live broadcast can never drift out of sync with each
-- other. Locked tiers (back_room, under_counter) are ALWAYS present in the
-- payload with a computed difficulty, whether they hold zero lines or
-- twenty — item count is never exposed, so an empty locked tier and a
-- stocked one are byte-identical to a player. `visible_lines` is every line
-- with tier='open' OR revealed=true, regardless of which tier it's
-- currently assigned to (an individually-revealed back-room item becomes a
-- normal visible line, same as the mockup's own vis/hid split).

CREATE OR REPLACE FUNCTION market_player_projection(m market_merchants)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'campaign_id',        m.campaign_id,
    'is_active',           m.is_active,
    'is_open_to_players',  m.is_open_to_players,
    'name',                m.name,
    'location_modifier',   m.location_modifier,
    'visible_lines', COALESCE((
      SELECT jsonb_agg(line)
      FROM jsonb_array_elements(m.stock) AS line
      WHERE (line ->> 'tier') = 'open' OR (line ->> 'revealed')::boolean = true
    ), '[]'::jsonb),
    'locked_tiers', jsonb_build_array(
      jsonb_build_object(
        'tier', 'back_room',
        'difficulty_rarity', COALESCE((
          SELECT max((line ->> 'modified_rarity')::int)
          FROM jsonb_array_elements(m.stock) AS line
          WHERE (line ->> 'tier') = 'back_room'
        ), 6 + m.location_modifier)
      ),
      jsonb_build_object(
        'tier', 'under_counter',
        'difficulty_rarity', COALESCE((
          SELECT max((line ->> 'modified_rarity')::int)
          FROM jsonb_array_elements(m.stock) AS line
          WHERE (line ->> 'tier') = 'under_counter'
        ), 6 + m.location_modifier)
      )
    )
  )
$$;

-- ── Catch-up RPC ─────────────────────────────────────────────────────────────
-- Returns NULL when no active merchant exists for the campaign. Deliberately
-- does NOT filter on is_open_to_players here — the projection carries that
-- flag so the client can distinguish "closed" from "never existed" and hide
-- itself accordingly, matching the always-broadcast behavior below.
CREATE OR REPLACE FUNCTION get_player_market_view(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT market_player_projection(m)
  FROM market_merchants m
  WHERE m.campaign_id = p_campaign_id AND m.is_active = true
  LIMIT 1
$$;

-- ── Live broadcast ───────────────────────────────────────────────────────────
-- Fires on every INSERT/UPDATE regardless of which client code performed it.
-- Always sends (even when is_open_to_players just flipped to false) so a
-- toggle-off reaches connected players as a real event, not a silence they
-- have to infer.
CREATE OR REPLACE FUNCTION market_merchants_broadcast()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.send(
    market_player_projection(NEW),
    'market_update',
    'market:' || NEW.campaign_id::text,
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_market_merchants_broadcast ON market_merchants;
CREATE TRIGGER trg_market_merchants_broadcast
  AFTER INSERT OR UPDATE ON market_merchants
  FOR EACH ROW EXECUTE FUNCTION market_merchants_broadcast();
