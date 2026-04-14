-- Migration 040: Normalize knowledge skill keys in custom adversary skill_ranks
-- Renames short-form keys (e.g. "Lore") to canonical "Knowledge: X" form so
-- they match the OggDude adversaries and the updated editor dropdown.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT *
    FROM (VALUES
      ('Core Worlds',  'Knowledge: Core Worlds'),
      ('Education',    'Knowledge: Education'),
      ('Lore',         'Knowledge: Lore'),
      ('Outer Rim',    'Knowledge: Outer Rim'),
      ('Underworld',   'Knowledge: Underworld'),
      ('Warfare',      'Knowledge: Warfare'),
      ('Xenology',     'Knowledge: Xenology')
    ) AS t(old_key, new_key)
  LOOP
    UPDATE ref_adversaries
    SET skill_ranks = (skill_ranks - r.old_key)
                   || jsonb_build_object(r.new_key, skill_ranks->r.old_key)
    WHERE skill_ranks ? r.old_key;
  END LOOP;
END;
$$;
