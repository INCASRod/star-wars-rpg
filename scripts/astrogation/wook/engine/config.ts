/**
 * Every tunable number of the Astrogation engine, in ONE object (Rodrigo may tune these).
 * Pure data: no imports, no app code, so the engine can move into `src/` later.
 */
export const CONFIG = {
  /** Lane cost per pixel of edge length. Lanes first: this only matters after off-lane distance is minimised. */
  laneWeight: { major: 1, minor: 3 },

  /** Drop-off: an endpoint on no lane leaves the nearest K lane edges at the closest point on each (Dijkstra picks one). */
  dropoffEdges: 3,

  /** When the lanes-only route is at least this many times the straight-line distance, a direct (risky) jump is also offered. */
  shortcutRatio: 3,

  /**
   * Route sets DIFFICULTY (purple), risk sets UPGRADES (red). Difficulty = base + minorLane + distance; off-lane legs add no difficulty.
   * An upgrade turns a purple die red; with no purple die left it adds one instead (AoE "Upgrading More Dice Than Available").
   */
  difficulty: {
    base: 0,
    /** +1 if any leg is on a minor lane */
    minorLane: 1,
    /** +0 within sector, +1 within region, +2 between regions, +3 across the galaxy */
    distance: [0, 1, 2, 3],
    /** off-lane share of route length: any up to offQuarter, up to offTwoThirds, above that */
    offQuarter: 0.25,
    offTwoThirds: 2 / 3,
    offUpgrades: { underQuarter: 1, quarterToTwoThirds: 2, overTwoThirds: 3 },
    /** an endpoint that is a pin (uncharted) */
    unchartedUpgrades: 1,
    /** difficulty above this count becomes upgrades instead (no cap) */
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
