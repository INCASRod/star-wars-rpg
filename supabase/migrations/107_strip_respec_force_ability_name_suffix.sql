-- 107_strip_respec_force_ability_name_suffix.sql
-- Same cleanup as migration 104, but for ref_force_abilities.name instead of
-- ref_force_powers.name. 18 respec "basic power" ability rows still carry the
-- internal "(reSpecialized)" / "(Respec)" source tag in their player-facing
-- name — e.g. "Alter Basic Power (reSpecialized)", "Imbue Basic Power
-- (Respec)". Strips the tag (wherever it falls in the string — one row,
-- "Battle Meditation (reSpecialized) Basic Power", has it mid-string, not at
-- the end) and collapses the resulting double space. Scoped to
-- dataset_source = 'respec' only, per standing house rule.

UPDATE ref_force_abilities
SET name = trim(regexp_replace(regexp_replace(name, '\s*\((reSpecialized|Respec)\)\s*', ' ', 'gi'), '\s+', ' ', 'g'))
WHERE dataset_source = 'respec'
  AND name ~* '\((reSpecialized|Respec)\)';
