-- Auth B4: campaigns.gm_pin leaves REST and realtime payloads. A column REVOKE does nothing while a table-level SELECT
-- grant exists, so revoke the table grant and re-grant every other column. The column itself is not dropped.
-- A column added to campaigns later needs its own: GRANT SELECT (col) ON public.campaigns TO anon, authenticated.
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns WHERE table_schema='public' AND table_name='campaigns' AND column_name <> 'gm_pin';
  REVOKE SELECT ON public.campaigns FROM anon, authenticated;
  EXECUTE format('GRANT SELECT (%s) ON public.campaigns TO anon, authenticated', cols);
END $$;
