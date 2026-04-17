-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 048: Correct species ability descriptions to use canonical
-- shortcodes ([boost], [setback], [threat], [advantage]) instead of the
-- legacy OggDude two-letter codes ([BO], [SE], [TH]) that were written by
-- migration 047.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── ARCONA — Mood Readers ────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'ARCONAOC2OP1'
    THEN jsonb_set(elem, '{description}', '"Arcona add [boost] to any Charm or Negotiation checks they make."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'ARCONA';

-- ── BITH — Sensitive Hearing ─────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'BITHOC1OP1'
    THEN jsonb_set(elem, '{description}', '"Bith add [boost] whenever they make a hearing-based Perception check."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'BITH';

-- ── DUROS — Intuitive Navigation ────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'DUROSCH1OP1'
    THEN jsonb_set(elem, '{description}', '"Duros may add [boost] to all Astrogation checks they make."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'DUROS';

-- ── GEONOSIAN — Industrious ──────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'GEONOSIANOC2OP1'
    THEN jsonb_set(elem, '{description}', '"A Geonosian who provides assistance adds [boost] to the check, in addition to the normal benefits of assistance, and the Geonosian heals 1 strain."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'GEONOSIAN';

-- ── IAKARU — Brachiation ─────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'IAKARUCH1OP1'
    THEN jsonb_set(elem, '{description}', '"Iakaru suffer no terrain penalties to movement through jungles or similar environments. They also add [boost] to Athletics and Coordination checks related to climbing, swinging, and balancing."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'IAKARU';

-- ── KAMINOAN — Expressionless (Kaminoans making Charm checks) ────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'KAMINOANOC1OP1'
    THEN jsonb_set(elem, '{description}', '"Kaminoans add [setback] to all Charm checks they make."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'KAMINOAN';

-- ── KAMINOAN — Expressionless (others making social checks against Kaminoans) ─
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'KAMINOANOC2OP1'
    THEN jsonb_set(elem, '{description}', '"Other characters add [setback] to all social skill checks made against Kaminoans."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'KAMINOAN';

-- ── MIKKIAN — Sensory Tendrils ───────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'MIKKIANAB1OP1'
    THEN jsonb_set(elem, '{description}', '"Mikkians add [boost] to all Perception checks."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'MIKKIAN';

-- ── PAU'AN — Sensitive Hearing ───────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'PAUANCH2OP1'
    THEN jsonb_set(elem, '{description}', '"Pau''ans add [boost] to all Perception and Vigilance checks while wearing ear protection. Without ear protection, they add [threat] to Perception and Vigilance checks instead."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'PAUAN';

-- ── QUARREN — Ink Spray ──────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'QUARRENOC2OP1'
    THEN jsonb_set(elem, '{description}', '"Can spray ink. Once per encounter, as an out-of-turn incidental, may suffer 2 strain to add [setback] to an enemy check within short range. Add [boost] when used underwater."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'QUARREN';

-- ── TOGNATHS — Primitive Nerves ──────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'TOGNATHSCH1OP1'
    THEN jsonb_set(elem, '{description}', '"Add [setback] to Coercion checks targeting Tognath characters."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'TOGNATHS';

-- ── UGNAUGHT — Exceptionally Hardy ───────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'UGNAUGHTSCH2OP1'
    THEN jsonb_set(elem, '{description}', '"Ugnaughts add [boost] to Resilience checks."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'UGNAUGHTS';

-- ── UMBARAN — Entrancing Gaze ────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'UMBARANAB1OP1'
    THEN jsonb_set(elem, '{description}', '"Umbarans add [boost] to all Charm, Deception, and Negotiation checks."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'UMBARAN';

-- ── VERPINE — Microvision ────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'VERPINECH1OP1'
    THEN jsonb_set(elem, '{description}', '"When closely examining an object, Verpine add [boost] to their Perception checks."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'VERPINE';

-- ── VURK — Cold Blooded ──────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'VURKAB2OP1'
    THEN jsonb_set(elem, '{description}', '"Vurk take an additional [setback] to all checks made in cold environments."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'VURK';

-- ── ZELTRON — Pheromones ─────────────────────────────────────────────────────
UPDATE ref_species
SET special_abilities = (
  SELECT jsonb_agg(
    CASE WHEN (elem->>'key') = 'ZELTRONCH2OP1'
    THEN jsonb_set(elem, '{description}', '"Zeltrons add [boost] to all Charm, Deception, and Negotiation skill checks."')
    ELSE elem END
  )
  FROM jsonb_array_elements(special_abilities::jsonb) AS elem
)
WHERE key = 'ZELTRON';
