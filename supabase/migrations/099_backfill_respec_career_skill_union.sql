-- Backfill character_skills.is_career to the rulebook invariant: a character's
-- career skills are the union of career_skill_keys across their career AND
-- EVERY owned specialization (not just the starting one). is_career is a
-- stored column that was only ever written correctly at character creation;
-- handleBuySpecialization (spec purchases) and the GM refund flow did not
-- resync it when the owned-spec set changed afterward. Runtime paths are
-- fixed separately (persistCareerSkills in src/lib/characters.ts, wired into
-- both mutation sites) — this migration corrects existing drifted rows.
--
-- Scoped to ref_careers / ref_specializations rows where dataset_source =
-- 'respec' per the reSpec-only dataset rule (CLAUDE.md).
--
-- Safety: a character is skipped entirely (RAISE NOTICE, zero rows touched)
-- if ANY of their owned specialization_keys has no respec-dataset row in
-- ref_specializations. One such case exists today (NIGHTSISTER — respec has
-- no row for it, oggdude-only) and recomputing against an incomplete union
-- would incorrectly revoke that character's currently-correct career skills.
-- That is a separate respec-dataset seeding gap, not this bug, and is left
-- untouched here.

DO $$
DECLARE
  char_rec RECORD;
  union_keys TEXT[];
  owned_count INT;
  resolvable_count INT;
  changed_count INT;
  chars_scanned INT := 0;
  chars_skipped INT := 0;
  chars_changed INT := 0;
BEGIN
  FOR char_rec IN
    SELECT DISTINCT c.id, c.name, c.career_key
    FROM characters c
    JOIN character_specializations csp ON csp.character_id = c.id
  LOOP
    chars_scanned := chars_scanned + 1;

    SELECT count(csp.specialization_key), count(rs.key)
    INTO owned_count, resolvable_count
    FROM character_specializations csp
    LEFT JOIN ref_specializations rs
      ON rs.key = csp.specialization_key AND rs.dataset_source = 'respec'
    WHERE csp.character_id = char_rec.id;

    IF owned_count != resolvable_count THEN
      chars_skipped := chars_skipped + 1;
      RAISE NOTICE 'character % (%): skipped — % of % owned spec(s) unresolved in respec dataset',
        char_rec.name, char_rec.id, owned_count - resolvable_count, owned_count;
      CONTINUE;
    END IF;

    SELECT ARRAY(
      SELECT DISTINCT k FROM (
        SELECT unnest(rc.career_skill_keys) AS k
        FROM ref_careers rc
        WHERE rc.key = char_rec.career_key AND rc.dataset_source = 'respec'
        UNION
        SELECT unnest(rs.career_skill_keys) AS k
        FROM ref_specializations rs
        JOIN character_specializations csp ON csp.specialization_key = rs.key
        WHERE csp.character_id = char_rec.id AND rs.dataset_source = 'respec'
      ) u
    ) INTO union_keys;

    UPDATE character_skills
    SET is_career = (skill_key = ANY(union_keys))
    WHERE character_id = char_rec.id
      AND is_career IS DISTINCT FROM (skill_key = ANY(union_keys));

    GET DIAGNOSTICS changed_count = ROW_COUNT;
    IF changed_count > 0 THEN
      chars_changed := chars_changed + 1;
      RAISE NOTICE 'character % (%): % skill(s) corrected', char_rec.name, char_rec.id, changed_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % character(s) scanned, % corrected, % skipped (unresolved spec data)',
    chars_scanned, chars_changed, chars_skipped;
END $$;
