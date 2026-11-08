-- Migration 160: temporary XP spending freeze
--
-- campaign_settings.xp_spending_frozen = true halts every player XP purchase
-- (talents, force abilities, specializations, skill ranks, Force Rating,
-- signature ability nodes). Earning XP is unaffected. Enforced client-side at
-- each purchase entry point via src/lib/xpSpendingFreeze.ts; the GM toggles it
-- in /gm/settings. Rollback: set the column to false (or drop it).

ALTER TABLE campaign_settings
  ADD COLUMN xp_spending_frozen boolean NOT NULL DEFAULT false;

-- campaign_settings had a public-read policy only (095); the GM toggle needs a write path.
CREATE POLICY "GM update campaign_settings" ON campaign_settings
  FOR UPDATE TO authenticated USING (public.is_gm()) WITH CHECK (public.is_gm());
