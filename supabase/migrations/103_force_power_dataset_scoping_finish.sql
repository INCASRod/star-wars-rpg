-- 103_force_power_dataset_scoping_finish.sql
-- Stage 1 (post-step) of the ref_force_powers dataset-scoping fix. Must run
-- AFTER 102_respec_force_power_reseed.sql has inserted the respec-flavored
-- power rows (the composite FK below needs them to exist to validate).

-- 1. Nine ref_force_abilities rows are stale leftovers from a superseded
--    Conjure tree layout — their ability keys (CONJUREBASICPOWER etc.) do not
--    appear anywhere in the current "respec project data/Force Abilities.xml"
--    snapshot, confirmed by direct grep. They still point at the bare
--    CONJURE key, which after this fix is purely an oggdude-dataset row (no
--    respec counterpart — respec's live Conjure power is CONJURERE, sourced
--    from the only Conjure file in respec's source tree, since no plain
--    predecessor exists there). Redirect them to the live respec Conjure
--    power and retire them (not delete) so the FK below validates and no
--    stale content resurfaces. Confirmed zero characters own any of these.
UPDATE ref_force_abilities
SET power_key = 'CONJURERE', is_retired = true
WHERE dataset_source = 'respec'
  AND key IN (
    'CONJUREBASICPOWER', 'CONJURECONTROL', 'CONJUREDURATION1', 'CONJUREDURATION2',
    'CONJUREDURATION3', 'CONJUREMAGNITUDE1', 'CONJUREMAGNITUDE2', 'CONJURENUMBER1',
    'CONJURENUMBER2'
  );

-- 2. Retire the 19 orphaned rows left over from migrations 079/100's mangled
--    keys (USERFP1, IMBUERE, etc.) plus the old literal-slash "VALOR/HORRIFY"
--    key — the corrected generator in 102 no longer emits any of these, since
--    each concept now collapses to a single canonical row. Confirmed zero
--    ref_force_abilities rows (respec or oggdude) reference any of them, so
--    retiring is purely cosmetic/cleanup, not a behavior change. Not deleted,
--    per standing house style for cross-dataset "dead" rows.
UPDATE ref_force_powers
SET is_retired = true
WHERE dataset_source = 'oggdude'
  AND key IN (
    'USERFP1', 'BATTLEMEDRE', 'BINDRESPEC', 'EBBFLOWRESPEC', 'ENDURERE', 'ENHANCERE',
    'FARSIGHTRE', 'FORESEERE', 'HEALHARMRE', 'IMBUERE', 'INFLUENCERE',
    'MANIPULATERESPEC', 'MISDIRECTRE', 'MOVERESPEC', 'PROTECTUNLEASHRE', 'SEEKRE',
    'SENSERE', 'SUPRESPEC', 'VALOR/HORRIFY'
  );

-- 3. Add the FK back as composite (101 dropped the old single-column one to
--    free up the PK swap) now that every live (power_key, dataset_source)
--    pair referenced by ref_force_abilities has a matching ref_force_powers
--    row under the same dataset. NULL power_key rows (1 pre-existing,
--    unrelated to this fix) are unaffected — FKs never check NULL columns.
ALTER TABLE ref_force_abilities
  ADD CONSTRAINT ref_force_abilities_power_key_fkey
  FOREIGN KEY (power_key, dataset_source) REFERENCES ref_force_powers (key, dataset_source);
