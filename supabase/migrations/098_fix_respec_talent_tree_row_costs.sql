-- Migration 098: Normalize ref_specializations.talent_tree row costs (reSpec).
--
-- 5 of 116 reSpec specializations (AMBASSADOR, CYBERTECH, INSTRUCTOR,
-- QUARTERMASTER, SHIPWRIGHT) had wrong `cost` values stored on one or more
-- talent_tree.rows entries — row 1's cost duplicated from row 0, and for
-- CYBERTECH/QUARTERMASTER cascading further down the tree. This was invisible
-- until now because TalentTree.tsx has always sourced row cost from a
-- hardcoded ROW_COSTS = [5,10,15,20,25] constant, never from this column.
--
-- Every reSpec specialization with a non-empty talent_tree.rows array has
-- exactly 5 rows (index 0-4), and the correct cost for every row across the
-- whole dataset is the standard AoE formula (index+1)*5 — confirmed by
-- querying all 115 populated respec specs before writing this migration.
-- This recomputes cost for every row of every respec spec unconditionally
-- (idempotent — already-correct rows are a no-op), rather than special-casing
-- only the 5 known-bad keys, so any other undetected drift is corrected too.
--
-- ADVISOR (talent_tree.rows = []) is untouched — a pre-existing empty-tree
-- data gap unrelated to this cost bug, out of scope here.

UPDATE ref_specializations spec
SET talent_tree = jsonb_set(
  spec.talent_tree,
  '{rows}',
  (
    SELECT jsonb_agg(
      jsonb_set(row_elem, '{cost}', to_jsonb(((row_elem->>'index')::int + 1) * 5))
      ORDER BY (row_elem->>'index')::int
    )
    FROM jsonb_array_elements(spec.talent_tree->'rows') AS row_elem
  )
)
WHERE spec.dataset_source = 'respec'
  AND jsonb_array_length(spec.talent_tree->'rows') > 0;
