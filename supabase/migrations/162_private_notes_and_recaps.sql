-- Migration 162: private notes + player-visible session recaps
--
-- 1. character_notes: typed notes (text/npc/story/location), OWNER ONLY. The GM cannot read or write them
--    (owns_character, not can_write_character / is_gm). Existing character_private.notes blobs are copied in as
--    one 'text' note per character. character_private.notes is left in place for rollback; the app stops using it.
-- 2. player_recaps: the GM's NEW session recaps, copied from console_records (kind 'sessions') by a trigger.
--    Players can read; no client can write. Sessions with n <= campaign_settings.recap_share_after_n are never shared.

-- ── Notes ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.character_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('text', 'npc', 'story', 'location')),
  title        text NOT NULL DEFAULT '',
  body         text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS character_notes_character_updated_idx
  ON public.character_notes (character_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.touch_character_note()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS character_notes_touch ON public.character_notes;
CREATE TRIGGER character_notes_touch
  BEFORE UPDATE ON public.character_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_character_note();

ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS character_notes_select ON public.character_notes;
DROP POLICY IF EXISTS character_notes_insert ON public.character_notes;
DROP POLICY IF EXISTS character_notes_update ON public.character_notes;
DROP POLICY IF EXISTS character_notes_delete ON public.character_notes;

CREATE POLICY character_notes_select ON public.character_notes FOR SELECT TO authenticated
  USING (public.owns_character(character_id));
CREATE POLICY character_notes_insert ON public.character_notes FOR INSERT TO authenticated
  WITH CHECK (public.owns_character(character_id));
CREATE POLICY character_notes_update ON public.character_notes FOR UPDATE TO authenticated
  USING (public.owns_character(character_id)) WITH CHECK (public.owns_character(character_id));
CREATE POLICY character_notes_delete ON public.character_notes FOR DELETE TO authenticated
  USING (public.owns_character(character_id));

REVOKE ALL ON public.character_notes FROM anon;

-- One 'text' note per character that has a non-empty blob. Guarded so a re-run never duplicates.
INSERT INTO public.character_notes (character_id, type, title, body, created_at, updated_at)
SELECT cp.character_id, 'text', 'My notes', cp.notes, cp.updated_at, cp.updated_at
FROM public.character_private cp
WHERE coalesce(cp.notes, '') <> ''
  AND NOT EXISTS (SELECT 1 FROM public.character_notes n WHERE n.character_id = cp.character_id AND n.title = 'My notes');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'character_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.character_notes;
  END IF;
END $$;

-- ── Recaps ───────────────────────────────────────────────────────────────────

ALTER TABLE public.campaign_settings
  ADD COLUMN IF NOT EXISTS recap_share_after_n integer NULL;

-- Baseline = highest session number that exists right now. Never moved down, never re-run over a set value.
UPDATE public.campaign_settings
SET recap_share_after_n = coalesce(
  (SELECT max((data->>'n')::int) FROM public.console_records
   WHERE kind = 'sessions' AND (data->>'n') ~ '^[0-9]+$'), 0)
WHERE recap_share_after_n IS NULL;

CREATE TABLE IF NOT EXISTS public.player_recaps (
  campaign_id  uuid NOT NULL,
  session_id   text NOT NULL,
  n            integer NOT NULL,
  title        text NOT NULL DEFAULT '',
  session_date text NOT NULL DEFAULT '',
  summary      text NOT NULL,
  shared_at    timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, session_id)
);

ALTER TABLE public.player_recaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS player_recaps_select ON public.player_recaps;
CREATE POLICY player_recaps_select ON public.player_recaps FOR SELECT TO authenticated
  USING (public.is_member(campaign_id) OR public.is_gm(campaign_id));

-- No insert/update/delete policy exists: only the SECURITY DEFINER trigger below writes. Revoke as a second lock.
REVOKE ALL ON public.player_recaps FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.player_recaps FROM authenticated;

CREATE OR REPLACE FUNCTION public.share_session_recap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_n        integer;
  v_summary  text;
  v_baseline integer;
BEGIN
  IF NEW.kind IS DISTINCT FROM 'sessions' THEN
    RETURN NEW;
  END IF;

  v_summary := coalesce(NEW.data->>'summary', '');

  -- Already shared: later edits refresh the text silently (shared_at untouched, so no new pop-up).
  IF EXISTS (SELECT 1 FROM public.player_recaps WHERE campaign_id = NEW.campaign_id AND session_id = NEW.id) THEN
    IF btrim(v_summary) <> '' THEN
      UPDATE public.player_recaps
      SET title = coalesce(NEW.data->>'title', ''),
          session_date = coalesce(NEW.data->>'date', ''),
          summary = v_summary,
          updated_at = now()
      WHERE campaign_id = NEW.campaign_id AND session_id = NEW.id;
    END IF;
    RETURN NEW;
  END IF;

  -- New recap: needs a numeric n above the baseline and a non-empty summary. Anything else is ignored.
  IF coalesce(NEW.data->>'n', '') !~ '^[0-9]+$' OR btrim(v_summary) = '' THEN
    RETURN NEW;
  END IF;
  v_n := (NEW.data->>'n')::int;

  SELECT recap_share_after_n INTO v_baseline FROM public.campaign_settings LIMIT 1;
  IF v_baseline IS NULL OR v_n <= v_baseline THEN   -- no baseline = fail closed, share nothing
    RETURN NEW;
  END IF;

  INSERT INTO public.player_recaps (campaign_id, session_id, n, title, session_date, summary)
  VALUES (NEW.campaign_id, NEW.id, v_n, coalesce(NEW.data->>'title', ''), coalesce(NEW.data->>'date', ''), v_summary)
  ON CONFLICT (campaign_id, session_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.share_session_recap() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS console_records_share_recap ON public.console_records;
CREATE TRIGGER console_records_share_recap
  AFTER INSERT OR UPDATE ON public.console_records
  FOR EACH ROW WHEN (NEW.kind = 'sessions')
  EXECUTE FUNCTION public.share_session_recap();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'player_recaps'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.player_recaps;
  END IF;
END $$;
