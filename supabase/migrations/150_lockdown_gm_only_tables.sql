-- Auth B4 (group A): GM-only tables. Only the signed-in GM of the campaign reads or writes them. No anon access.
-- Players never touch these: Galaxy (/gm/galaxy), GM Tools award log, GM Console lore (/gm/console).
-- Every existing policy on these tables (all open `true` policies per the census) is dropped, then re-created GM-only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['console_campaign_state','console_documents','console_records','campaign_nav_state','campaign_nav_pins','gm_award_log']
  LOOP
    EXECUTE (SELECT string_agg(format('DROP POLICY %I ON public.%I', policyname, tablename), '; ')
             FROM pg_policies WHERE schemaname='public' AND tablename=t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_gm(campaign_id))', t||'_gm_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_gm(campaign_id))', t||'_gm_insert', t);
    IF t <> 'gm_award_log' THEN  -- the award log was append-only before, keep it so
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_gm(campaign_id)) WITH CHECK (public.is_gm(campaign_id))', t||'_gm_update', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_gm(campaign_id))', t||'_gm_delete', t);
    END IF;
  END LOOP;
END $$;
