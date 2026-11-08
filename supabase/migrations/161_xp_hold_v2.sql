-- Migration 161: XP hold v2
--
-- Builds on 160 (campaign_settings.xp_spending_frozen stays the flag).
-- 1. Optional GM reason + start time, shown to players.
-- 2. campaign_settings joins the realtime publication so players see the hold change live.
-- 3. The database enforces the hold: while frozen, a non-GM cannot DECREASE characters.xp_available.
--    Increases (GM awards, refunds) always pass. Character creation is exempt because it only INSERTs
--    (this is a BEFORE UPDATE trigger).

ALTER TABLE campaign_settings
  ADD COLUMN IF NOT EXISTS xp_hold_reason text NULL,
  ADD COLUMN IF NOT EXISTS xp_hold_started_at timestamptz NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'campaign_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_settings;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_xp_hold()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.xp_available < OLD.xp_available
     AND NOT public.is_gm()
     AND EXISTS (SELECT 1 FROM public.campaign_settings WHERE xp_spending_frozen) THEN
    RAISE EXCEPTION 'XP_HOLD: XP spending is paused by the GM' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS characters_enforce_xp_hold ON public.characters;
CREATE TRIGGER characters_enforce_xp_hold
  BEFORE UPDATE OF xp_available ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.enforce_xp_hold();
