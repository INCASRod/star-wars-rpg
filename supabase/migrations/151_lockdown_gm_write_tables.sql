-- Auth B4 (group B): players read, only the GM writes. SELECT stays open exactly as today; INSERT/UPDATE/DELETE move
-- to the signed-in GM. ref_*: the same, keeping each table's existing is_custom conditions and the existing
-- auth.uid() GM policies. campaigns: SELECT/UPDATE untouched (players write settings.destiny_pool); the unused anon
-- INSERT policy is dropped (no client inserts campaigns; seed scripts use DATABASE_URL).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['maps','map_planets','adversary_token_images','vehicle_token_images','item_icon_overrides','market_merchants']
  LOOP
    EXECUTE (SELECT string_agg(format('DROP POLICY %I ON public.%I', policyname, tablename), '; ')
             FROM pg_policies WHERE schemaname='public' AND tablename=t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)', t||'_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_gm())', t||'_gm_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_gm()) WITH CHECK (public.is_gm())', t||'_gm_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_gm())', t||'_gm_delete', t);
  END LOOP;
END $$;

DROP POLICY "Public insert campaigns" ON public.campaigns;

-- ref_*: drop every anon/authenticated write policy (keeping the "GM write ..." auth.uid() ones), then add is_gm() ones.
DROP POLICY "Anon can delete custom armor"                ON public.ref_armor;
DROP POLICY "Authenticated users can delete custom armor" ON public.ref_armor;
DROP POLICY "Anon can insert custom armor"                ON public.ref_armor;
DROP POLICY "Authenticated users can insert custom armor" ON public.ref_armor;
DROP POLICY "Anon can update custom armor"                ON public.ref_armor;
DROP POLICY "Anon write worn_anchor ref_armor"            ON public.ref_armor;
DROP POLICY "Authenticated users can update custom armor" ON public.ref_armor;
DROP POLICY "Anon can delete custom gear"                 ON public.ref_gear;
DROP POLICY "Authenticated users can delete custom gear"  ON public.ref_gear;
DROP POLICY "Anon can insert custom gear"                 ON public.ref_gear;
DROP POLICY "Authenticated users can insert custom gear"  ON public.ref_gear;
DROP POLICY "Anon can update custom gear"                 ON public.ref_gear;
DROP POLICY "Anon write worn_anchor ref_gear"             ON public.ref_gear;
DROP POLICY "Authenticated users can update custom gear"  ON public.ref_gear;
DROP POLICY "Anon can delete custom weapons"                ON public.ref_weapons;
DROP POLICY "Authenticated users can delete custom weapons" ON public.ref_weapons;
DROP POLICY "Anon can insert custom weapons"                ON public.ref_weapons;
DROP POLICY "Authenticated users can insert custom weapons" ON public.ref_weapons;
DROP POLICY "Anon can update custom weapons"                ON public.ref_weapons;
DROP POLICY "Authenticated users can update custom weapons" ON public.ref_weapons;
DROP POLICY "Anon can delete custom talents" ON public.ref_talents;
DROP POLICY "Anon can insert custom talents" ON public.ref_talents;
DROP POLICY "Anon can update custom talents" ON public.ref_talents;
DROP POLICY "Public delete custom vehicles"  ON public.ref_vehicles;
DROP POLICY "Public insert custom vehicles"  ON public.ref_vehicles;
DROP POLICY "Public update custom vehicles"  ON public.ref_vehicles;
DROP POLICY ref_adv_delete ON public.ref_adversaries;
DROP POLICY ref_adv_insert ON public.ref_adversaries;
DROP POLICY ref_adv_update ON public.ref_adversaries;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ref_armor','ref_gear','ref_weapons','ref_talents','ref_vehicles','ref_adversaries']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_gm() AND is_custom = true)', t||'_gm_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_gm() AND is_custom = true) WITH CHECK (public.is_gm() AND is_custom = true)', t||'_gm_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_gm() AND is_custom = true)', t||'_gm_delete', t);
  END LOOP;
END $$;
-- Catalogue worn_anchor edits (Item Database tab) were allowed on non-custom armor and gear rows; keep that, GM only.
CREATE POLICY ref_armor_gm_worn_anchor ON public.ref_armor FOR UPDATE TO authenticated USING (public.is_gm() AND is_custom = false) WITH CHECK (public.is_gm() AND is_custom = false);
CREATE POLICY ref_gear_gm_worn_anchor  ON public.ref_gear  FOR UPDATE TO authenticated USING (public.is_gm() AND is_custom = false) WITH CHECK (public.is_gm() AND is_custom = false);
