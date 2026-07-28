-- 104_strip_respec_force_power_name_suffix.sql
-- Player-facing force power names should just be the power's name (e.g.
-- "Heal/Harm"), not the internal reSpecialized source/version tag (e.g.
-- "Heal/Harm (reSpecialized) 1.0"). Strip the " (reSpecialized) X.Y" suffix
-- from respec-dataset ref_force_powers.name. Scoped to dataset_source =
-- 'respec' only, per standing house rule (never touch oggdude ref rows
-- unless explicitly asked).
UPDATE ref_force_powers
SET name = regexp_replace(name, '\s*\(reSpecialized\)\s*[\d.]+\s*$', '')
WHERE dataset_source = 'respec'
  AND name ~ '\(reSpecialized\)';
