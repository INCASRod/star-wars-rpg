-- 139 — Enable RLS on ref_motivations / ref_specific_motivations
--
-- Found via Supabase security advisor: both tables had RLS disabled,
-- fully exposed to anon/authenticated roles with no policy at all.
-- Unrelated to migration 138 (Console) — flagged during that work's
-- post-apply check and fixed separately on user confirmation.
--
-- Policy matches the existing ref_* read-only convention (see
-- "Public read ref_skills" / "Public read ref_species").

ALTER TABLE public.ref_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ref_specific_motivations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ref_motivations" ON public.ref_motivations;
CREATE POLICY "Public read ref_motivations" ON public.ref_motivations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ref_specific_motivations" ON public.ref_specific_motivations;
CREATE POLICY "Public read ref_specific_motivations" ON public.ref_specific_motivations
  FOR SELECT USING (true);
