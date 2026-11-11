-- Notes B3: the GM sees THAT a player has notes (type + dates) but never what they say.
-- character_notes RLS stays owner-only (migration 162). This function is the only GM path and it never selects
-- title or body: no text, no lengths, no previews, no hashes.
CREATE OR REPLACE FUNCTION public.gm_character_note_meta(p_character_id uuid)
RETURNS TABLE (id uuid, type text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT n.id, n.type, n.created_at, n.updated_at
  FROM public.character_notes n
  WHERE n.character_id = p_character_id
    AND public.is_gm(public.character_campaign(p_character_id))
  ORDER BY n.updated_at DESC;
$$;

REVOKE ALL ON FUNCTION public.gm_character_note_meta(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gm_character_note_meta(uuid) TO authenticated;
