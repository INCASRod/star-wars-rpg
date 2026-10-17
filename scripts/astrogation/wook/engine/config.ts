/**
 * Every tunable number of the Astrogation engine, in ONE object (Rodrigo may tune these).
 * Pure data: no imports, no app code, so the engine can move into `src/` later.
 */
export const CONFIG = {
  /** Lane cost per pixel of edge length. Lanes first: this only matters after off-lane distance is minimised. */
  laneWeight: { major: 1, minor: 3 },

  /** Difficulty (brief, update 2). Raw = base + lane term + distance term + uncharted term. */
  difficulty: {
    base: 0,
    lane: {
      allMajor: 0,
      anyMinor: 1,
      offUnderQuarter: 2,
      offQuarterToTwoThirds: 3,
      offOverTwoThirds: 4,
    },
    /** off-lane share thresholds (of route length) */
    offQuarter: 0.25,
    offTwoThirds: 2 / 3,
    /** +0 within sector, +1 within region, +2 between regions, +3 across the galaxy */
    distance: [0, 1, 2, 3],
    /** an endpoint that is a pin (uncharted) */
    uncharted: 2,
    /** raw 0..5 name the difficulty; above this, the excess becomes upgrades (no cap) */
    formidableAt: 5,
    names: ['Simple', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable'],
  },

  /** AoE Core Table 7-14 (hours / days / weeks, class 1 hyperdrive; other classes multiply it). */
  bands: [
    { name: 'within a sector', time: '10 to 24 hours' },
    { name: 'within a region', time: '10 to 72 hours' },
    { name: 'between regions', time: '3 days to 1 week' },
    { name: 'across the galaxy', time: '1 to 3 weeks' },
  ],
  /** The table does not define "across the galaxy": regions at least this many rings apart count (CC choice, from prompt B). */
  acrossRingGap: 5,
  rings: {
    'Deep Core': 0,
    'Core Worlds': 1,
    Colonies: 2,
    'Inner Rim': 3,
    'Expansion Region': 4,
    'Mid Rim': 5,
    'Outer Rim Territories': 6,
  } as Record<string, number>,
}

export type Config = typeof CONFIG
