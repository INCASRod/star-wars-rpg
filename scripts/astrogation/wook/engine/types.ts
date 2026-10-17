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
  raw: number
  laneTerm: number
  distanceTerm: number
  unchartedTerm: number
  /** name for min(raw, formidableAt) */
  difficulty: string
  /** upgrades from raw above Formidable */
  upgrades: number
  /** upgrades from hazards, reported separately */
  hazardUpgrades: number
  hazards: Hazard[]
  totalUpgrades: number
}
