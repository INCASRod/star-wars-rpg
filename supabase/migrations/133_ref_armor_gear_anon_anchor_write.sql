-- Migration 133: replace dead auth.uid()-gated worn_anchor policy (132) with
-- a working anon-role policy
--
-- AMENDMENT (Prompt 10, Task 2 conversation): migration 132's policies
-- (`GM write worn_anchor ref_armor/ref_gear`) checked
-- `players.user_id = auth.uid() AND players.is_gm = true`. This app has NO
-- authentication anywhere -- grepped the whole src/ tree, zero calls to
-- supabase.auth.signIn*/signInAnonymously. Every client (GM and player
-- alike) uses the same anon key with no session, so auth.uid() is always
-- NULL for everyone. That condition can never pass -- confirmed live via
-- Playwright: toggling the anchor selector in the GM Items tab silently
-- no-op'd, DB unchanged. This mirrors a PRE-EXISTING dead policy already in
-- this schema ("GM write custom ref_armor/ref_gear", same auth.uid() shape)
-- -- see docs/architecture.md for that entry. Migration 132's policies are
-- dropped here rather than left alongside a second, equally dead layer.
--
-- REVISED approach (explicit user decision, real auth is separate future
-- work, out of scope here): GM-ness stays UI-routing only, same as every
-- other privileged action in this app (e.g. ItemEditor's custom-item writes
-- already work this way via the existing "Anon can update custom armor/gear"
-- policies, which have no auth dependency at all). This migration adds the
-- same shape of anon-role policy for the is_custom = false rows those
-- existing policies don't cover, since worn_anchor must be settable on
-- system/catalogue rows (migrations 125/131 anchored 119 such rows).
--
-- SCOPE ACTUALLY GRANTED (reported per instruction, not silently widened):
-- row-level only, matching the existing is_custom=true anon policies'
-- shape. NOT column-restricted to worn_anchor -- checked
-- information_schema.role_column_grants first: the `anon` role already
-- holds a table-wide UPDATE grant covering every column of ref_armor/
-- ref_gear (from prior migrations), so a column-level GRANT on worn_anchor
-- alone would grant nothing additional, and REVOKEing the existing
-- table-wide grant to narrow it would break other already-shipped anon
-- writes (ItemEditor's price/description/etc. edits on custom rows). This
-- policy's practical effect is therefore the same privilege surface as
-- every other write already possible through this table via the app's GM
-- Items tab -- not a new category of exposure, just extended to
-- is_custom = false rows.

DROP POLICY IF EXISTS "GM write worn_anchor ref_armor" ON ref_armor;
DROP POLICY IF EXISTS "GM write worn_anchor ref_gear" ON ref_gear;

CREATE POLICY "Anon write worn_anchor ref_armor" ON ref_armor
  FOR UPDATE
  TO anon
  USING (is_custom = false)
  WITH CHECK (is_custom = false);

CREATE POLICY "Anon write worn_anchor ref_gear" ON ref_gear
  FOR UPDATE
  TO anon
  USING (is_custom = false)
  WITH CHECK (is_custom = false);
