-- supabase/migrations/097_atomic_set_active_map.sql
--
-- Map switching did clear-all-then-set-new as two separate client-side
-- .update() calls, each its own auto-committed transaction. idx_maps_one_active
-- (migration 032) forbids two active maps at once, so the two calls can't be
-- reordered to avoid a gap — but the gap between them is a real committed
-- state: every other subscriber (including the GM's own useActiveMap realtime
-- channel) briefly sees zero active maps. GmMapView's active-map render
-- branch unmounts MapCanvas during that gap and remounts fresh once the new
-- map lands, which skips the "previous map existed" check that gates the
-- Pixi wipe transition (src/lib/mapWipe.ts) — the map just appears instead
-- of wiping in.
--
-- Wrapping both UPDATEs in one function call makes them one transaction:
-- Postgres realtime only ever delivers committed state, so the zero-active
-- gap no longer exists for any subscriber.
CREATE OR REPLACE FUNCTION set_active_map(p_campaign_id uuid, p_map_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE maps SET is_active = false WHERE campaign_id = p_campaign_id AND is_active = true;
  UPDATE maps SET is_active = true  WHERE id = p_map_id AND campaign_id = p_campaign_id;
END;
$$;
