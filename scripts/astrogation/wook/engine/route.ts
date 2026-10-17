import { CONFIG, type Config } from './config'
import type { Endpoint, Graph, GraphNode, Leg, RouteResult, Stop } from './types'

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

/**
 * Lanes first (Rodrigo's rule). The trip minimises, in this order:
 *   1. off-lane distance (so an all-lane path always wins when one exists, however long),
 *   2. weighted lane length (major 1, minor 3).
 * Off-lane legs are straight lines between any two points; they are only taken when no all-lane path exists (an endpoint is not on a
 * lane, a pin, or the lanes do not connect), and then the total off-lane distance is the shortest that makes the trip possible.
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

  const N = nodes.length
  const lane: Arc[][] = Array.from({ length: N }, () => [])
  for (const e of graph.edges) {
    const a = index.get(e.a)
    const b = index.get(e.b)
    if (a === undefined || b === undefined) continue
    const cost = e.length_px * config.laneWeight[e.class]
    lane[a].push({ to: b, kind: 'lane', route: e.route, class: e.class, lengthPx: e.length_px, cost })
    lane[b].push({ to: a, kind: 'lane', route: e.route, class: e.class, lengthPx: e.length_px, cost })
  }

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

  const legs: Leg[] = arcs.map(a => ({
    from: nodes[a.from].id, to: nodes[a.to].id, kind: a.kind, route: a.route, class: a.class, lengthPx: a.lengthPx,
  }))
  const total = legs.reduce((s, l) => s + l.lengthPx, 0)
  const sum = (f: (l: Leg) => boolean) => legs.filter(f).reduce((s, l) => s + l.lengthPx, 0)
  const share = total > 0
    ? { major: sum(l => l.class === 'major') / total, minor: sum(l => l.class === 'minor') / total, off: sum(l => l.kind === 'off') / total }
    : { major: 0, minor: 0, off: 0 }
  const stops = path.map(i => ({ ...nodeToStop(nodes[i]), uncharted: pinIds.has(nodes[i].id) }))
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
