import { CONFIG, type Config } from './config'
import type { Endpoint, Graph, GraphNode, Leg, Plan, RouteResult, Stop } from './types'

const EPS = 1e-9

/** 'lanes': minimise off-lane distance first, then time. 'hops': minimise time, off-lane hops allowed. */
export type RouteMode = 'lanes' | 'hops'

interface Arc {
  to: number
  kind: 'lane' | 'off'
  route?: string
  class?: 'major' | 'minor'
  lengthPx: number
  hours: number
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

/** Binary min-heap on a caller-supplied order. */
class Heap<T> {
  private a: T[] = []
  constructor(private less: (x: T, y: T) => boolean) {}
  get size() {
    return this.a.length
  }
  push(v: T) {
    const a = this.a
    a.push(v)
    for (let i = a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1
      if (!this.less(a[i], a[p])) break
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }
  pop(): T | undefined {
    const a = this.a
    if (a.length === 0) return undefined
    const top = a[0]
    const last = a.pop() as T
    if (a.length > 0) {
      a[0] = last
      for (let i = 0; ; ) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && this.less(a[l], a[m])) m = l
        if (r < a.length && this.less(a[r], a[m])) m = r
        if (m === i) break
        ;[a[i], a[m]] = [a[m], a[i]]
        i = m
      }
    }
    return top
  }
}

/** Pairs of planets at most `hopMaxPx` apart (grid-bucketed), per graph and radius. The graph is never mutated. */
const hopCache = new WeakMap<Graph, { max: number; adj: { to: number; d: number }[][] }>()
function hopAdjacency(graph: Graph, max: number): { to: number; d: number }[][] {
  const hit = hopCache.get(graph)
  if (hit && hit.max === max) return hit.adj
  const nodes = graph.nodes
  const adj: { to: number; d: number }[][] = nodes.map(() => [])
  const cell = (v: number) => Math.floor(v / max)
  const grid = new Map<string, number[]>()
  nodes.forEach((n, i) => {
    const k = `${cell(n.x)},${cell(n.y)}`
    const g = grid.get(k)
    if (g) g.push(i)
    else grid.set(k, [i])
  })
  nodes.forEach((n, i) => {
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (const j of grid.get(`${cell(n.x) + dx},${cell(n.y) + dy}`) ?? []) {
          if (j <= i) continue
          const d = Math.hypot(n.x - nodes[j].x, n.y - nodes[j].y)
          if (d <= max) {
            adj[i].push({ to: j, d })
            adj[j].push({ to: i, d })
          }
        }
  })
  hopCache.set(graph, { max, adj })
  return adj
}

/**
 * Two kinds of route, same graph.
 *  - 'lanes' (the primary): minimises off-lane distance first, then TIME. An all-lane path always wins when one exists, however long; off-lane
 *    hops (planets <= hopMaxPx apart) and endpoint drop-offs only bridge what the lanes cannot.
 *  - 'hops' (the risky alternative): minimises TIME, lanes and short off-lane hops mixed.
 * An endpoint on no lane (planet or pin) drops off the K nearest lane edges: a temporary node at the closest point of each edge splits it (both
 * halves keep route and class). In 'hops' mode every endpoint may drop off, also one on a lane. The graph is never mutated; nodes exist for
 * this query only. Time = length x CONFIG.hoursPerPx[kind], at hyperdrive class 1.
 */
export function route(graph: Graph, origin: Endpoint, destination: Endpoint, mode: RouteMode = 'lanes', config: Config = CONFIG): RouteResult {
  const base = graph.nodes.length
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
  const hours = config.hoursPerPx

  // drop-off points: for each endpoint, the closest point on each of the K nearest lane edges
  const splits = new Map<number, { t: number; node: number }[]>()
  const dropIds = new Set<string>()
  const dropOwner: number[] = [] // node index of the drop -> endpoint it belongs to
  const edgeEnds = graph.edges.map(e => [index.get(e.a), index.get(e.b)] as const)
  for (const ep of new Set([from, to])) {
    if (mode === 'lanes' && ep < base && nodes[ep].on_lane) continue
    const near = edgeEnds
      .map(([a, b], k) => (a === undefined || b === undefined ? null : { k, a, b, ...project(nodes[ep].x, nodes[ep].y, nodes[a], nodes[b]) }))
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((p, q) => p.dist - q.dist)
      .slice(0, config.dropoffEdges)
    for (const c of near) {
      if (c.t <= 1e-6 || c.t >= 1 - 1e-6) continue // the closest point is a lane planet: the hop arcs / the planet itself already reach it
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
      dropOwner[nodes.length - 1] = ep
      splits.set(c.k, [...(splits.get(c.k) ?? []), { t: c.t, node: nodes.length - 1 }])
    }
  }

  const N = nodes.length
  const adj: Arc[][] = Array.from({ length: N }, () => [])
  const addLane = (a: number, b: number, routeName: string, cls: 'major' | 'minor', lengthPx: number) => {
    const h = lengthPx * hours[cls]
    adj[a].push({ to: b, kind: 'lane', route: routeName, class: cls, lengthPx, hours: h })
    adj[b].push({ to: a, kind: 'lane', route: routeName, class: cls, lengthPx, hours: h })
  }
  const addOff = (a: number, b: number, d: number) => {
    adj[a].push({ to: b, kind: 'off', lengthPx: d, hours: d * hours.off })
    adj[b].push({ to: a, kind: 'off', lengthPx: d, hours: d * hours.off })
  }
  graph.edges.forEach((e, k) => {
    const [a, b] = edgeEnds[k]
    if (a === undefined || b === undefined) return
    const chain = [{ t: 0, node: a }, ...(splits.get(k) ?? []).sort((p, q) => p.t - q.t), { t: 1, node: b }]
    for (let i = 0; i + 1 < chain.length; i++) addLane(chain[i].node, chain[i + 1].node, e.route, e.class, e.length_px * (chain[i + 1].t - chain[i].t))
  })
  // short off-lane hops between planets, and from a pin to the planets within reach
  hopAdjacency(graph, config.hopMaxPx).forEach((list, i) => list.forEach(({ to: j, d }) => j > i && addOff(i, j, d)))
  for (let i = base; i < N; i++) {
    if (dropIds.has(nodes[i].id)) {
      const ep = dropOwner[i]
      addOff(ep, i, Math.hypot(nodes[ep].x - nodes[i].x, nodes[ep].y - nodes[i].y))
    } else {
      for (let j = 0; j < base; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
        if (d <= config.hopMaxPx) addOff(i, j, d)
      }
    }
  }

  const off = new Float64Array(N).fill(Infinity)
  const tim = new Float64Array(N).fill(Infinity)
  const done = new Uint8Array(N)
  const prev: (Arc & { from: number })[] = new Array(N)
  const lex = mode === 'lanes'
  const better = (o: number, t: number, i: number) =>
    lex ? o < off[i] - EPS || (Math.abs(o - off[i]) <= EPS && t < tim[i] - EPS) : t < tim[i] - EPS
  type Entry = { o: number; t: number; n: number }
  const heap = new Heap<Entry>((x, y) => (lex ? x.o < y.o - EPS || (Math.abs(x.o - y.o) <= EPS && x.t < y.t) : x.t < y.t))
  off[from] = 0
  tim[from] = 0
  heap.push({ o: 0, t: 0, n: from })
  while (heap.size > 0) {
    const e = heap.pop() as Entry
    const u = e.n
    if (done[u]) continue
    done[u] = 1
    if (u === to) break
    for (const a of adj[u]) {
      if (done[a.to]) continue
      const o = off[u] + (a.kind === 'off' ? a.lengthPx : 0)
      const t = tim[u] + a.hours
      if (better(o, t, a.to)) {
        off[a.to] = o
        tim[a.to] = t
        prev[a.to] = { ...a, from: u }
        heap.push({ o, t, n: a.to })
      }
    }
  }

  const empty: RouteResult = {
    found: false, stops: [], legs: [], routesUsed: [], lengthPx: 0, lengthLy: 0, hours: 0, density: 0,
    share: { major: 0, minor: 0, off: 0 }, uncharted: pinIds.size > 0,
  }
  if (!done[to]) return empty

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
  const planet = (i: number) => i < base
  const regionOf = (a: Arc & { from: number }) => (planet(a.from) ? nodes[a.from].region : planet(a.to) ? nodes[a.to].region : null)
  const legs: Leg[] = []
  arcs.forEach((a, k) => {
    const last = legs[legs.length - 1]
    if (k > 0 && passes(k)) {
      last.to = nodes[a.to].id
      last.lengthPx += a.lengthPx
      last.hours += a.hours
    } else {
      legs.push({ from: nodes[a.from].id, to: nodes[a.to].id, kind: a.kind, route: a.route, class: a.class, lengthPx: a.lengthPx, hours: a.hours, region: regionOf(a) })
    }
  })
  const stops = path
    .filter((_, k) => k === 0 || k === path.length - 1 || !passes(k))
    .map(i => ({ ...nodeToStop(nodes[i]), uncharted: pinIds.has(nodes[i].id), ...(dropIds.has(nodes[i].id) ? { dropoff: true } : {}) }))
  return finish(graph, legs, stops, pinIds.size > 0, config)
}

/** Totals, shares, density and time of a leg list. */
function finish(graph: Graph, legs: Leg[], stops: Stop[], uncharted: boolean, config: Config): RouteResult {
  const total = legs.reduce((s, l) => s + l.lengthPx, 0)
  const sum = (f: (l: Leg) => boolean) => legs.filter(f).reduce((s, l) => s + l.lengthPx, 0)
  const share = total > 0
    ? { major: sum(l => l.class === 'major') / total, minor: sum(l => l.class === 'minor') / total, off: sum(l => l.kind === 'off') / total }
    : { major: 0, minor: 0, off: 0 }
  const dens = legs.reduce((s, l) => s + l.lengthPx * (l.region === null ? config.densityUncharted : (config.density[l.region] ?? 0)), 0)
  return {
    found: true,
    stops,
    legs,
    routesUsed: Array.from(new Set(legs.filter(l => l.route).map(l => l.route as string))),
    lengthPx: total,
    lengthLy: total * graph.meta.ly_per_px,
    hours: legs.reduce((s, l) => s + l.hours, 0),
    density: total > 0 ? Math.round(dens / total) : 0,
    share,
    uncharted,
  }
}

/** Straight jump: the fallback when no route exists at all. A plain two-stop route with one off-lane leg. */
function jump(graph: Graph, a: Stop, b: Stop, uncharted: boolean, config: Config): RouteResult {
  const d = Math.hypot(a.x - b.x, a.y - b.y)
  const region = a.uncharted ? (b.uncharted ? null : b.region) : a.region
  return finish(graph, [{ from: a.id, to: b.id, kind: 'off', lengthPx: d, hours: d * config.hoursPerPx.off, region }], [a, b], uncharted, config)
}

/**
 * The lane route and, when it pays, the hop route (lanes plus off-lane hops of <= hopMaxPx, fastest by time): offered when it uses some off-lane
 * AND saves >= hopSaveHours OR >= hopSaveShare of the lane time. Only when no lane route exists is the primary a straight jump.
 */
export function plan(graph: Graph, origin: Endpoint, destination: Endpoint, config: Config = CONFIG): Plan {
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
  let primary = route(graph, origin, destination, 'lanes', config)
  if (!primary.found && straight > 0) primary = jump(graph, a, b, pins > 0, config)
  const ratio = straight > 0 ? primary.lengthPx / straight : 1
  const hop = route(graph, origin, destination, 'hops', config)
  const pays = hop.found && hop.share.off > 0 && (primary.hours - hop.hours >= config.hopSaveHours || hop.hours <= primary.hours * (1 - config.hopSaveShare))
  return pays ? { primary, shortcut: hop, ratio } : { primary, ratio }
}
