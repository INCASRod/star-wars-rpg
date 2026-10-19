-- Auth B2: GM-issued one-time invite links that bind a signed-in account to a character's `players` row.
-- Tokens are random, shown to the GM once, and stored only as a sha256 hash. All RPCs are SECURITY DEFINER with a
-- fixed search_path; GM checks use is_gm() (migration 148). Anon policies elsewhere are untouched.

-- One account per `players` row per campaign: a player owns at most ONE character per campaign.
CREATE UNIQUE INDEX IF NOT EXISTS players_one_user_per_campaign
  ON public.players (campaign_id, user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.campaign_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  player_id   uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  created_by  uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  used_at     timestamptz,
  used_by     uuid,
  revoked_at  timestamptz
);
CREATE INDEX IF NOT EXISTS campaign_invites_player_idx ON public.campaign_invites (player_id);

ALTER TABLE public.campaign_invites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.campaign_invites FROM anon, PUBLIC;
DROP POLICY IF EXISTS campaign_invites_gm_select ON public.campaign_invites;
DROP POLICY IF EXISTS campaign_invites_gm_insert ON public.campaign_invites;
DROP POLICY IF EXISTS campaign_invites_gm_update ON public.campaign_invites;
CREATE POLICY campaign_invites_gm_select ON public.campaign_invites FOR SELECT TO authenticated USING (public.is_gm(campaign_id));
CREATE POLICY campaign_invites_gm_insert ON public.campaign_invites FOR INSERT TO authenticated WITH CHECK (public.is_gm(campaign_id));
CREATE POLICY campaign_invites_gm_update ON public.campaign_invites FOR UPDATE TO authenticated USING (public.is_gm(campaign_id)) WITH CHECK (public.is_gm(campaign_id));

-- ── create_invite ───────────────────────────────────────────────────────────────
-- Returns the plain token ONCE. Revokes any other open invite for the same player.
CREATE OR REPLACE FUNCTION public.create_invite(p_player_id uuid, p_expires_hours int DEFAULT 168)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_player public.players%ROWTYPE;
  v_token  text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_signed_in'; END IF;
  SELECT * INTO v_player FROM public.players WHERE id = p_player_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;
  IF NOT public.is_gm(v_player.campaign_id) THEN RAISE EXCEPTION 'not_gm'; END IF;
  -- Never a GM row (includes "Test GM (CC)"), and only a player who owns a live (non-archived) character.
  IF v_player.is_gm THEN RAISE EXCEPTION 'player_not_invitable'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.characters c WHERE c.player_id = v_player.id AND NOT c.is_archived) THEN
    RAISE EXCEPTION 'player_not_invitable';
  END IF;
  IF v_player.user_id IS NOT NULL THEN RAISE EXCEPTION 'player_already_bound'; END IF;

  UPDATE public.campaign_invites SET revoked_at = now()
    WHERE player_id = v_player.id AND used_at IS NULL AND revoked_at IS NULL;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  INSERT INTO public.campaign_invites (campaign_id, player_id, token_hash, expires_at, created_by)
  VALUES (v_player.campaign_id, v_player.id, encode(extensions.digest(v_token, 'sha256'), 'hex'),
          now() + make_interval(hours => GREATEST(1, LEAST(COALESCE(p_expires_hours, 168), 720))), auth.uid());
  RETURN v_token;
END $$;

-- ── revoke_invite / unbind_player ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.revoke_invite(p_invite_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_campaign uuid;
BEGIN
  SELECT campaign_id INTO v_campaign FROM public.campaign_invites WHERE id = p_invite_id;
  IF v_campaign IS NULL THEN RAISE EXCEPTION 'invite_not_found'; END IF;
  IF NOT public.is_gm(v_campaign) THEN RAISE EXCEPTION 'not_gm'; END IF;
  UPDATE public.campaign_invites SET revoked_at = now()
    WHERE id = p_invite_id AND used_at IS NULL AND revoked_at IS NULL;
END $$;

CREATE OR REPLACE FUNCTION public.unbind_player(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_player public.players%ROWTYPE;
BEGIN
  SELECT * INTO v_player FROM public.players WHERE id = p_player_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;
  IF NOT public.is_gm(v_player.campaign_id) THEN RAISE EXCEPTION 'not_gm'; END IF;
  IF v_player.is_gm THEN RAISE EXCEPTION 'player_not_invitable'; END IF; -- a GM binding is only changed by make-gm
  UPDATE public.players SET user_id = NULL WHERE id = v_player.id;
END $$;

-- ── claim_invite ────────────────────────────────────────────────────────────────
-- Distinct error messages: invite_not_found, invite_revoked, invite_used, invite_expired, player_already_bound,
-- already_has_character (DETAIL = the character the caller already plays). Atomic.
CREATE OR REPLACE FUNCTION public.claim_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_inv    public.campaign_invites%ROWTYPE;
  v_player public.players%ROWTYPE;
  v_have   text;
  v_char   record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_signed_in'; END IF;
  SELECT * INTO v_inv FROM public.campaign_invites
    WHERE token_hash = encode(extensions.digest(COALESCE(p_token, ''), 'sha256'), 'hex') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invite_not_found'; END IF;
  IF v_inv.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'invite_revoked'; END IF;
  IF v_inv.used_at IS NOT NULL THEN RAISE EXCEPTION 'invite_used'; END IF;
  IF v_inv.expires_at <= now() THEN RAISE EXCEPTION 'invite_expired'; END IF;

  SELECT * INTO v_player FROM public.players WHERE id = v_inv.player_id FOR UPDATE;
  IF NOT FOUND OR v_player.is_gm OR v_player.user_id IS NOT NULL THEN RAISE EXCEPTION 'player_already_bound'; END IF;

  SELECT c.name INTO v_have
    FROM public.players p JOIN public.characters c ON c.player_id = p.id AND NOT c.is_archived
    WHERE p.campaign_id = v_inv.campaign_id AND p.user_id = auth.uid() LIMIT 1;
  IF v_have IS NOT NULL OR EXISTS (SELECT 1 FROM public.players p WHERE p.campaign_id = v_inv.campaign_id AND p.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'already_has_character' USING DETAIL = COALESCE(v_have, '');
  END IF;

  UPDATE public.players SET user_id = auth.uid() WHERE id = v_player.id;
  UPDATE public.campaign_invites SET used_at = now(), used_by = auth.uid() WHERE id = v_inv.id;

  SELECT c.id, c.name INTO v_char FROM public.characters c WHERE c.player_id = v_player.id AND NOT c.is_archived ORDER BY c.name LIMIT 1;
  RETURN jsonb_build_object('player_id', v_player.id, 'character_id', v_char.id, 'character_name', v_char.name);
END $$;

-- ── invite_preview (works signed out) ───────────────────────────────────────────
-- Only a status, and for a valid invite: character name, role line, portrait, expiry. Nothing else.
CREATE OR REPLACE FUNCTION public.invite_preview(p_token text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_inv  public.campaign_invites%ROWTYPE;
  v_char record;
  v_role text;
BEGIN
  SELECT * INTO v_inv FROM public.campaign_invites
    WHERE token_hash = encode(extensions.digest(COALESCE(p_token, ''), 'sha256'), 'hex');
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  IF v_inv.revoked_at IS NOT NULL THEN RETURN jsonb_build_object('status', 'revoked'); END IF;
  IF v_inv.used_at IS NOT NULL THEN RETURN jsonb_build_object('status', 'used'); END IF;
  IF v_inv.expires_at <= now() THEN RETURN jsonb_build_object('status', 'expired'); END IF;

  SELECT c.name, c.portrait_url, c.career_key, c.species_key INTO v_char
    FROM public.characters c WHERE c.player_id = v_inv.player_id AND NOT c.is_archived ORDER BY c.name LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  SELECT concat_ws(' · ',
    (SELECT name FROM public.ref_careers WHERE key = v_char.career_key ORDER BY (dataset_source = 'respec') DESC LIMIT 1),
    (SELECT name FROM public.ref_species WHERE key = v_char.species_key LIMIT 1)) INTO v_role;
  RETURN jsonb_build_object('status', 'valid', 'character_name', v_char.name, 'role_line', COALESCE(v_role, ''),
    'portrait_url', v_char.portrait_url, 'expires_at', v_inv.expires_at);
END $$;

-- ── list_player_invites (GM Settings table) ─────────────────────────────────────
-- Account names and providers live in auth.users, which the browser cannot read; this is the one GM-only window.
CREATE OR REPLACE FUNCTION public.list_player_invites(p_campaign_id uuid)
RETURNS TABLE (player_id uuid, player_name text, character_id uuid, character_name text, bound boolean,
               account_name text, account_provider text, invite_id uuid, invite_expires_at timestamptz, invite_state text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NOT public.is_gm(p_campaign_id) THEN RAISE EXCEPTION 'not_gm'; END IF;
  RETURN QUERY
  SELECT p.id, p.display_name, c.id, c.name, (p.user_id IS NOT NULL),
         COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
         u.raw_app_meta_data->>'provider',
         i.id, i.expires_at,
         CASE WHEN i.id IS NULL THEN NULL WHEN i.expires_at <= now() THEN 'expired' ELSE 'open' END
  FROM public.players p
  JOIN public.characters c ON c.player_id = p.id AND NOT c.is_archived
  LEFT JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN LATERAL (
    SELECT ci.id, ci.expires_at FROM public.campaign_invites ci
    WHERE ci.player_id = p.id AND ci.used_at IS NULL AND ci.revoked_at IS NULL
    ORDER BY ci.created_at DESC LIMIT 1
  ) i ON true
  WHERE p.campaign_id = p_campaign_id AND NOT p.is_gm
  ORDER BY c.name;
END $$;

-- Grants: signed-in users only, except the claim-page preview which must work signed out.
REVOKE ALL ON FUNCTION public.create_invite(uuid, int), public.revoke_invite(uuid), public.unbind_player(uuid),
  public.claim_invite(text), public.invite_preview(text), public.list_player_invites(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_invite(uuid, int), public.revoke_invite(uuid), public.unbind_player(uuid),
  public.claim_invite(text), public.list_player_invites(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_preview(text) TO anon, authenticated;
