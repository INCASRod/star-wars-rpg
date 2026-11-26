/**
 * Every tunable number of the Astrogation engine, in ONE object (Rodrigo may tune these).
 * Pure data: no imports, no app code, so the engine can move into `src/` later.
 */
export const CONFIG = {
  /**
   * Travel time. Hours per map pixel at hyperdrive class 1, by kind of leg. Major 0.0909 and off-lane 0.763 as calibrated before E8 (open-space base
   * 0.5085 h/px, major 82% faster, off-lane 50% slower). Minor = 2 x major (a minor lane is at most half as fast as a major one; E8, was 0.3).
   * Route hours = sum(length x rate), then clamped to the Table 7-14 band (`bands[].minHours` / `maxHours`, see `clampedHours`), then x hyperdrive class.
   */
  hoursPerPx: { major: 0.0909, minor: 0.1818, off: 0.763 },
  /** Hyperdrive classes a ship can have (a class multiplies the time). */
  hyperdriveClasses: [0.5, 1, 2, 3, 4],

  /** Off-lane hops exist between any two planets at most this far apart (map px). Lanes are tried first; hops only bridge when lanes cannot. */
  hopMaxPx: 150,
  /** Drop-off: an endpoint on no lane leaves the nearest K lane edges at the closest point on each (Dijkstra picks one). */
  dropoffEdges: 3,
  /** The hop route is offered when it uses some off-lane AND saves at least this many hours ... */
  hopSaveHours: 12,
  /** ... OR at least this share of the lane route's time. */
  hopSaveShare: 0.2,

  /** Density: Core is crowded (+ purple), the Rim is empty (- purple). By the region of the planet a leg starts from (or ends at, for drop-off legs). */
  density: {
    'Deep Core': 1,
    'Core Worlds': 1,
    Colonies: 0,
    'Inner Rim': 0,
    'Expansion Region': 0,
    'Mid Rim': -1,
    'Outer Rim Territories': -1,
    'Wild Space': -1,
    'Hutt Space': -1,
    'Unknown Regions': -1,
  } as Record<string, number>,
  /** A leg with no charted planet at either end (a pin) */
  densityUncharted: -1,

  /**
   * Route sets DIFFICULTY (purple), risk sets UPGRADES (red). Purple = max(0, distance + density) + minorLane; off-lane legs add no purple.
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

  /** AoE Core Table 7-14 (hours / days / weeks, class 1 hyperdrive; other classes multiply it). min/maxHours are the same range in hours; they clamp route time. */
  bands: [
    { name: 'within a sector', time: '10 to 24 hours', minHours: 10, maxHours: 24 },
    { name: 'within a region', time: '10 to 72 hours', minHours: 10, maxHours: 72 },
    { name: 'between regions', time: '3 days to 1 week', minHours: 72, maxHours: 168 },
    { name: 'across the galaxy', time: '1 to 3 weeks', minHours: 168, maxHours: 504 },
  ],
  /**
   * "Across the galaxy" = straight-line distance between the two ends is at least this share of the galaxy's width (Sebastian, 2026-11-26).
   * Width = widest span of the 1,220 plotted systems in map px (Imynusoph to Abo Dreth, 2955.0, rounded; data/astrogation/wook/graph.json).
   */
  acrossShare: 0.6,
  galaxyWidthPx: 2955,
}

export type Config = typeof CONFIG
