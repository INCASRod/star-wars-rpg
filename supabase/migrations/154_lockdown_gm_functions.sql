-- Auth B4: SECURITY DEFINER functions that do GM work. set_active_map / set_active_merchant now refuse non-GMs;
-- rls_auto_enable (event-trigger helper) is not callable over REST at all.
CREATE OR REPLACE FUNCTION public.set_active_map(p_campaign_id uuid, p_map_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_gm(p_campaign_id) THEN RAISE EXCEPTION 'gm_only' USING ERRCODE = '42501'; END IF;
  UPDATE maps SET is_active = false WHERE campaign_id = p_campaign_id AND is_active = true;
  UPDATE maps SET is_active = true  WHERE id = p_map_id AND campaign_id = p_campaign_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_active_merchant(p_campaign_id uuid, p_merchant_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_gm(p_campaign_id) THEN RAISE EXCEPTION 'gm_only' USING ERRCODE = '42501'; END IF;
  UPDATE market_merchants SET is_active = false WHERE campaign_id = p_campaign_id AND is_active = true;
  UPDATE market_merchants SET is_active = true  WHERE id = p_merchant_id AND campaign_id = p_campaign_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_active_map(uuid, uuid)      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_active_merchant(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_active_map(uuid, uuid)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_active_merchant(uuid, uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
