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
  /** travel time of this leg at hyperdrive class 1 */
  hours: number
  /** region that sets this leg's density: its start planet, else its end planet; null when neither end is a charted planet (a pin) */
  region: string | null
}

export interface RouteResult {
  found: boolean
  stops: Stop[]
  legs: Leg[]
  /** lane names used, in order, each once */
  routesUsed: string[]
  lengthPx: number
  lengthLy: number
  /** travel time at hyperdrive class 1 (x the class for another ship) */
  hours: number
  /** length-weighted mean density of the legs, rounded (Core +1, Rim -1) */
  density: number
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
  /** max(0, distance + density) + minor lane, before the Formidable cap */
  raw: number
  minorTerm: number
  distanceTerm: number
  /** length-weighted mean density of the route */
  densityTerm: number
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

/**
 * The lane route (off-lane distance first, then time) and, when it pays, the hop route: lanes plus short off-lane hops, fastest by time.
 * The hop route is offered when it uses some off-lane AND saves >= CONFIG.hopSaveHours or >= CONFIG.hopSaveShare of the lane time.
 * Only when no route exists at all is the primary a straight jump.
 */
export interface Plan {
  primary: RouteResult
  shortcut?: RouteResult
  /** lane route length / straight-line distance between the two endpoints (information only) */
  ratio: number
}
