-- Auth B1: GM role from login. is_gm() is true when the signed-in user is bound (players.user_id) to a players
-- row flagged is_gm. With p_campaign_id NULL it means "GM of any campaign" (one campaign today); pass a campaign id
-- to scope it. SECURITY DEFINER with a fixed search_path so it can read players regardless of later RLS on that table.
-- Executable by signed-in users only: anon has no auth.uid() and must never be told anything.
CREATE OR REPLACE FUNCTION public.is_gm(p_campaign_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.user_id = auth.uid()
      AND p.is_gm = true
      AND (p_campaign_id IS NULL OR p.campaign_id = p_campaign_id)
  );
$$;

REVOKE ALL ON FUNCTION public.is_gm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_gm(uuid) TO authenticated;
