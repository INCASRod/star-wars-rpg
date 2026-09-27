-- Console phase 1b: add console_campaign_state, console_documents and
-- console_records to the supabase_realtime publication.
--
-- Step 0 audit (2026-09-25) confirmed none of the three tables were members
-- of `supabase_realtime`, so the parent-side bridge (src/lib/consoleBridge.ts)
-- cannot receive postgres_changes events for them until this is applied.
--
-- NOT APPLIED as part of this task per the CC prompt's instructions — written
-- only, for the user to review and apply themselves.

alter publication supabase_realtime add table public.console_campaign_state;
alter publication supabase_realtime add table public.console_documents;
alter publication supabase_realtime add table public.console_records;
