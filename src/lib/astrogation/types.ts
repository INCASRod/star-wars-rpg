export type LaneClass = 'major' | 'minor'

export interface GraphNode {
  id: string
  name: string
  /** DK map pixels (the unit of every length in the graph) */
  x: number
  y: number
  region: string | null
  sector: string | null
  on_lane: boolean
}

export interface GraphEdge {
  a: string
  b: string
  route: string
  class: LaneClass
  length_px: number
}

export interface Graph {
  meta: { ly_per_px: number }
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/** A charted planet, or a pin dropped anywhere (uncharted). */
export type Endpoint = { id: string } | { pin: { x: number; y: number }; name?: string }

export interface Stop {
  /** node id, or `pin:<n>` for a pin */
  id: string
  name: string
  x: number
  y: number
  region: string | null
  sector: string | null
  uncharted: boolean
  /** a temporary point on a lane edge where a ship leaves the lane for an off-lane planet (name: "<route> near <planet>") */
  dropoff?: boolean
}

export interface Leg {
  from: string
  to: string
  kind: 'lane' | 'off'
  route?: string
  class?: LaneClass
  lengthPx: number
}

export interface RouteResult {
  found: boolean
  stops: Stop[]
  legs: Leg[]
  /** lane names used, in order, each once */
  routesUsed: string[]
  lengthPx: number
  lengthLy: number
  /** shares of total length; major + minor + off = 1 (all 0 for a zero-length trip) */
  share: { major: number; minor: number; off: number }
  /** an endpoint is a pin */
  uncharted: boolean
}

export interface Hazard {
  system: string
  upgrades: number
  note?: string
}

export interface DifficultyResult {
  /** base + minor lane + distance, before the Formidable cap */
  raw: number
  minorTerm: number
  distanceTerm: number
  /** upgrades from off-lane share */
  offUpgrades: number
  /** upgrades from an uncharted (pin) endpoint */
  unchartedUpgrades: number
  /** upgrades from raw above Formidable */
  excessUpgrades: number
  /** upgrades from hazards, reported separately */
  hazardUpgrades: number
  hazards: Hazard[]
  /** every upgrade: off-lane + uncharted + excess + hazard */
  totalUpgrades: number
  /** final pool after applying the upgrades */
  pool: { purple: number; red: number }
  /** name for the dice count (purple + red) */
  difficulty: string
}

/** The lanes route plus, when the lanes are >= CONFIG.shortcutRatio x the straight line, a direct off-lane jump. */
export interface Plan {
  primary: RouteResult
  shortcut?: RouteResult
  /** lanes length / straight-line distance between the two endpoints */
  ratio: number
}
