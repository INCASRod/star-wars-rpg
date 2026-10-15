-- 144: repair custom items whose Effect text was folded into Description.
--
-- ItemDatabaseTab's list selects omitted effect_text/lore_text, so re-opening a
-- custom item in ItemEditor loaded the whole joined `description` (lore[P]effect)
-- into Description with Effect empty; the next save wrote effect_text = NULL and
-- lore_text = "lore[P]effect". The code is fixed alongside this migration.
--
-- Repairs exactly the three affected rows found on 2026-10-15 (explicit keys, so
-- legitimate multi-paragraph lore elsewhere is never touched): the effect is the
-- text after the LAST [P], the lore is everything before it. `description` is
-- left as-is - it already equals lore[P]effect, the composeDescription form.
-- Guarded by effect_text IS NULL so re-running is a no-op.

-- (SET expressions read the pre-update row, so both halves split the original text.)
UPDATE ref_gear SET
  lore_text   = btrim(left(lore_text, length(lore_text) - strpos(reverse(lore_text), reverse('[P]')) - 2), E' \n\r\t'),
  effect_text = btrim(right(lore_text, strpos(reverse(lore_text), reverse('[P]')) - 1), E' \n\r\t')
WHERE key = 'custom_6ba1c2c4_1788305173143'
  AND is_custom AND effect_text IS NULL AND lore_text LIKE '%[P]%';

UPDATE ref_armor SET
  lore_text   = btrim(left(lore_text, length(lore_text) - strpos(reverse(lore_text), reverse('[P]')) - 2), E' \n\r\t'),
  effect_text = btrim(right(lore_text, strpos(reverse(lore_text), reverse('[P]')) - 1), E' \n\r\t')
WHERE key IN ('custom_6ba1c2c4_1791942305522', 'custom_copy_CARGOCL_6ba1c2c4')
  AND is_custom AND effect_text IS NULL AND lore_text LIKE '%[P]%';
