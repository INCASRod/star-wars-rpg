import { CONFIG, type Config } from './config'
import type { Endpoint, Graph, GraphNode, Leg, Plan, RouteResult, Stop } from './types'

const EPS = 1e-9

interface Arc {
  to: number
  kind: 'lane' | 'off'
  route?: string
  class?: 'major' | 'minor'
  lengthPx: number
  /** lane cost: length x class weight (0 for an off-lane arc) */
  cost: number
}

function nodeToStop(n: GraphNode): Stop {
  return { id: n.id, name: n.name, x: n.x, y: n.y, region: n.region, sector: n.sector, uncharted: false }
}

/** Closest point to (px, py) on segment a-b: parameter t in [0, 1] (0 at a) and the distance. */
function project(px: number, py: number, a: GraphNode, b: GraphNode): { t: number; dist: number } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2)) : 0
  return { t, dist: Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy)) }
}

/**
 * Lanes first (Rodrigo's rule). The trip minimises, in this order:
 *   1. off-lane distance (so an all-lane path always wins when one exists, however long),
 *   2. weighted lane length (major 1, minor 3).
 * Off-lane legs are straight lines between any two points; they are only taken when no all-lane path exists (an endpoint is not on a
 * lane, a pin, or the lanes do not connect), and then the total off-lane distance is the shortest that makes the trip possible.
 * An endpoint on no lane (planet or pin) drops off the K nearest lane edges: a temporary node at the closest point of each edge splits it
 * (both halves keep route and class). The graph is never mutated; the nodes exist for this query only.
 * Dense Dijkstra on the lexicographic cost (about 700 nodes, so O(V^2) is fine).
 */
export function route(graph: Graph, origin: Endpoint, destination: Endpoint, config: Config = CONFIG): RouteResult {
  const nodes: GraphNode[] = graph.nodes.slice()
  const index = new Map<string, number>()
  nodes.forEach((n, i) => index.set(n.id, i))
  let pins = 0
  const resolve = (e: Endpoint): number => {
    if ('id' in e) {
      const i = index.get(e.id)
      if (i === undefined) throw new Error(`unknown planet id ${e.id}`)
      return i
    }
    pins += 1
    const n: GraphNode = { id: `pin:${pins}`, name: e.name ?? `Pin ${pins}`, x: e.pin.x, y: e.pin.y, region: null, sector: null, on_lane: false }
    nodes.push(n)
    index.set(n.id, nodes.length - 1)
    return nodes.length - 1
  }
  const from = resolve(origin)
  const to = resolve(destination)
  const pinIds = new Set(nodes.filter(n => n.id.startsWith('pin:')).map(n => n.id))

  // drop-off points: for each endpoint on no lane, the closest point on each of the K nearest lane edges
  const splits = new Map<number, { t: number; node: number }[]>()
  const dropIds = new Set<string>()
  const baseCount = graph.nodes.length
  const edgeEnds = graph.edges.map(e => [index.get(e.a), index.get(e.b)] as const)
  for (const ep of new Set([from, to])) {
    if (ep < baseCount && nodes[ep].on_lane) continue
    const near = edgeEnds
      .map(([a, b], k) => (a === undefined || b === undefined ? null : { k, a, b, ...project(nodes[ep].x, nodes[ep].y, nodes[a], nodes[b]) }))
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((p, q) => p.dist - q.dist)
      .slice(0, config.dropoffEdges)
    for (const c of near) {
      if (c.t <= 1e-6 || c.t >= 1 - 1e-6) continue // the closest point is a lane planet: off arcs already reach it
      const A = nodes[c.a]
      const B = nodes[c.b]
      const anchor = c.t < 0.5 ? A : B
      const id = `drop:${dropIds.size + 1}`
      const n: GraphNode = {
        id, name: `${graph.edges[c.k].route} near ${anchor.name}`, x: A.x + c.t * (B.x - A.x), y: A.y + c.t * (B.y - A.y),
        region: anchor.region, sector: anchor.sector, on_lane: true,
      }
      nodes.push(n)
      index.set(id, nodes.length - 1)
      dropIds.add(id)
      splits.set(c.k, [...(splits.get(c.k) ?? []), { t: c.t, node: nodes.length - 1 }])
    }
  }

  const N = nodes.length
  const lane: Arc[][] = Array.from({ length: N }, () => [])
  const addLane = (a: number, b: number, route: string, cls: 'major' | 'minor', lengthPx: number) => {
    const cost = lengthPx * config.laneWeight[cls]
    lane[a].push({ to: b, kind: 'lane', route, class: cls, lengthPx, cost })
    lane[b].push({ to: a, kind: 'lane', route, class: cls, lengthPx, cost })
  }
  graph.edges.forEach((e, k) => {
    const [a, b] = edgeEnds[k]
    if (a === undefined || b === undefined) return
    const chain = [{ t: 0, node: a }, ...(splits.get(k) ?? []).sort((p, q) => p.t - q.t), { t: 1, node: b }]
    for (let i = 0; i + 1 < chain.length; i++) addLane(chain[i].node, chain[i + 1].node, e.route, e.class, e.length_px * (chain[i + 1].t - chain[i].t))
  })

  const off = new Float64Array(N).fill(Infinity)
  const lan = new Float64Array(N).fill(Infinity)
  const done = new Uint8Array(N)
  const prev: (Arc & { from: number } | null)[] = new Array(N).fill(null)
  off[from] = 0
  lan[from] = 0
  const better = (o: number, l: number, i: number) => o < off[i] - EPS || (Math.abs(o - off[i]) <= EPS && l < lan[i] - EPS)

  for (let step = 0; step < N; step++) {
    let u = -1
    for (let i = 0; i < N; i++) {
      if (done[i] || off[i] === Infinity) continue
      if (u < 0 || off[i] < off[u] - EPS || (Math.abs(off[i] - off[u]) <= EPS && lan[i] < lan[u])) u = i
    }
    if (u < 0 || u === to) break
    done[u] = 1
    for (const a of lane[u]) {
      if (!done[a.to] && better(off[u], lan[u] + a.cost, a.to)) {
        off[a.to] = off[u]
        lan[a.to] = lan[u] + a.cost
        prev[a.to] = { ...a, from: u }
      }
    }
    for (let v = 0; v < N; v++) {
      if (done[v] || v === u) continue
      const d = Math.hypot(nodes[u].x - nodes[v].x, nodes[u].y - nodes[v].y)
      if (better(off[u] + d, lan[u], v)) {
        off[v] = off[u] + d
        lan[v] = lan[u]
        prev[v] = { to: v, kind: 'off', lengthPx: d, cost: 0, from: u }
      }
    }
  }

  const empty: RouteResult = {
    found: false, stops: [], legs: [], routesUsed: [], lengthPx: 0, lengthLy: 0, share: { major: 0, minor: 0, off: 0 }, uncharted: pinIds.size > 0,
  }
  if (off[to] === Infinity) return empty

  const path: number[] = [to]
  const arcs: (Arc & { from: number })[] = []
  for (let x = to; x !== from; ) {
    const p = prev[x]
    if (!p) return empty
    arcs.push(p)
    x = p.from
    path.push(x)
  }
  path.reverse()
  arcs.reverse()

  // a drop-off point the ship merely passes along a lane is not a stop: fold its two halves back into one leg
  const passes = (k: number) => dropIds.has(nodes[path[k]].id) && arcs[k - 1].kind === 'lane' && arcs[k].kind === 'lane'
  const legs: Leg[] = []
  arcs.forEach((a, k) => {
    const last = legs[legs.length - 1]
    if (k > 0 && passes(k)) {
      last.to = nodes[a.to].id
      last.lengthPx += a.lengthPx
    } else {
      legs.push({ from: nodes[a.from].id, to: nodes[a.to].id, kind: a.kind, route: a.route, class: a.class, lengthPx: a.lengthPx })
    }
  })
  const total = legs.reduce((s, l) => s + l.lengthPx, 0)
  const sum = (f: (l: Leg) => boolean) => legs.filter(f).reduce((s, l) => s + l.lengthPx, 0)
  const share = total > 0
    ? { major: sum(l => l.class === 'major') / total, minor: sum(l => l.class === 'minor') / total, off: sum(l => l.kind === 'off') / total }
    : { major: 0, minor: 0, off: 0 }
  const stops = path.filter((_, k) => k === 0 || k === path.length - 1 || !passes(k)).map(i => ({ ...nodeToStop(nodes[i]), uncharted: pinIds.has(nodes[i].id), ...(dropIds.has(nodes[i].id) ? { dropoff: true } : {}) }))
  return {
    found: true,
    stops,
    legs,
    routesUsed: Array.from(new Set(legs.filter(l => l.route).map(l => l.route as string))),
    lengthPx: total,
    lengthLy: total * graph.meta.ly_per_px,
    share,
    uncharted: pinIds.size > 0,
  }
}

/**
 * The lanes route and, when it is at least `shortcutRatio` x the straight-line distance (or does not exist), a direct off-lane jump.
 * The jump is a plain two-stop route with one off-lane leg; the caller runs the same difficulty rules on it.
 */
export function plan(graph: Graph, origin: Endpoint, destination: Endpoint, config: Config = CONFIG): Plan {
  const primary = route(graph, origin, destination, config)
  let pins = 0
  const locate = (e: Endpoint): Stop => {
    if ('id' in e) {
      const n = graph.nodes.find(x => x.id === e.id)
      if (!n) throw new Error(`unknown planet id ${e.id}`)
      return nodeToStop(n)
    }
    pins += 1
    return { id: `pin:${pins}`, name: e.name ?? `Pin ${pins}`, x: e.pin.x, y: e.pin.y, region: null, sector: null, uncharted: true }
  }
  const a = locate(origin)
  const b = locate(destination)
  const straight = Math.hypot(a.x - b.x, a.y - b.y)
  const ratio = straight > 0 && primary.found ? primary.lengthPx / straight : straight > 0 ? Infinity : 1
  if (straight <= 0 || ratio < config.shortcutRatio) return { primary, ratio }
  const shortcut: RouteResult = {
    found: true,
    stops: [a, b],
    legs: [{ from: a.id, to: b.id, kind: 'off', lengthPx: straight }],
    routesUsed: [],
    lengthPx: straight,
    lengthLy: straight * graph.meta.ly_per_px,
    share: { major: 0, minor: 0, off: 1 },
    uncharted: pins > 0,
  }
  return { primary, shortcut, ratio }
}
