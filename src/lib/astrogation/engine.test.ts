/** npx tsx --test src/lib/astrogation/engine.test.ts */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CONFIG, LY_PER_PX, buildGalaxy, difficulty, formatTravelTime, plan, route, travelBand, travelTime } from './index'
import type { Graph, GraphNode, RouteResult } from './types'

const node = (id: string, x: number, y: number, region: string | null = 'Core Worlds', sector: string | null = null, on_lane = true): GraphNode =>
  ({ id, name: id, x, y, region, sector, on_lane })

const g = (nodes: GraphNode[], edges: [string, string, 'major' | 'minor', number?][]): Graph => ({
  meta: { ly_per_px: 10 },
  nodes,
  edges: edges.map(([a, b, c, len]) => {
    const A = nodes.find(n => n.id === a)!
    const B = nodes.find(n => n.id === b)!
    return { a, b, route: `${a}-${b}`, class: c, length_px: len ?? Math.hypot(A.x - B.x, A.y - B.y) }
  }),
})

const fake = (share: RouteResult['share'], uncharted = false, region = 'Core Worlds', sector: string | null = null, b?: { region: string | null; sector: string | null }): RouteResult => ({
  found: true,
  stops: [
    { id: 'a', name: 'a', x: 0, y: 0, region, sector, uncharted },
    { id: 'b', name: 'b', x: 1, y: 1, region: b ? b.region : region, sector: b ? b.sector : sector, uncharted: false },
  ],
  legs: [], routesUsed: [], lengthPx: 1, lengthLy: 10, hours: 1, density: 0, share, uncharted,
})

describe('route: lanes first', () => {
  it('takes a long all-lane path over a short off-lane shortcut', () => {
    // A and B are 10 px apart, but the only lane goes round via C (about 200 px)
    const graph = g([node('A', 0, 0), node('B', 10, 0), node('C', 5, 100)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    const r = route(graph, { id: 'A' }, { id: 'B' })
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'C', 'B'])
    assert.equal(r.share.off, 0)
  })

  it('prefers a longer all-major path over a shorter all-minor one only through time (a major lane is faster than a minor one)', () => {
    const graph = g([node('A', 0, 0), node('B', 100, 0), node('C', 50, 60)], [['A', 'B', 'minor'], ['A', 'C', 'major'], ['C', 'B', 'major']])
    const r = route(graph, { id: 'A' }, { id: 'B' })
    // direct minor costs 3 x 100 = 300; via C costs 2 x 78.1 = 156
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'C', 'B'])
    assert.equal(r.share.major, 1)
  })

  it('crosses between lane networks with the shortest off-lane leg', () => {
    const graph = g(
      [node('A', 0, 0), node('B', 50, 0), node('C', 90, 0), node('D', 140, 0)],
      [['A', 'B', 'major'], ['C', 'D', 'major']],
    )
    const r = route(graph, { id: 'A' }, { id: 'D' })
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'B', 'C', 'D'])
    assert.deepEqual(r.legs.map(l => l.kind), ['lane', 'off', 'lane'])
    assert.ok(Math.abs(r.legs[1].lengthPx - 40) < 1e-6)
    assert.ok(Math.abs(r.share.off - 40 / 140) < 1e-9)
  })

  it('an endpoint on no lane drops off the nearest point of a lane edge, not the nearest lane planet', () => {
    const graph = g(
      [node('A', 0, 0), node('B', 100, 0), node('X', 90, 30, 'Core Worlds', null, false)],
      [['A', 'B', 'major']],
    )
    const r = route(graph, { id: 'A' }, { id: 'X' })
    assert.deepEqual(r.stops.map(s => s.name), ['A', 'A-B near B', 'X'])
    assert.equal(r.stops[1].dropoff, true)
    assert.deepEqual(r.legs.map(l => l.kind), ['lane', 'off'])
    assert.ok(Math.abs(r.legs[0].lengthPx - 90) < 1e-9)
    assert.ok(Math.abs(r.legs[1].lengthPx - 30) < 1e-9)
    assert.ok(Math.abs(r.share.major - 0.75) < 1e-9)
  })

  it('splitting an edge keeps route and class on both halves, and never mutates the graph', () => {
    const graph = g(
      [node('A', 0, 0), node('B', 100, 0), node('X', 50, 20, 'Core Worlds', null, false), node('Y', 60, -20, 'Core Worlds', null, false)],
      [['A', 'B', 'minor']],
    )
    const before = JSON.stringify(graph)
    const r = route(graph, { id: 'X' }, { id: 'A' })
    assert.deepEqual(r.legs.map(l => [l.kind, l.route ?? null, l.class ?? null]), [['off', null, null], ['lane', 'A-B', 'minor']])
    assert.equal(JSON.stringify(graph), before)
    const both = route(graph, { id: 'X' }, { id: 'Y' })
    assert.equal(both.found, true)
    assert.equal(JSON.stringify(graph), before)
  })

  it('a pin works the same way and is flagged uncharted', () => {
    const graph = g([node('A', 0, 0), node('B', 100, 0)], [['A', 'B', 'minor']])
    const r = route(graph, { id: 'A' }, { pin: { x: 150, y: 0 } })
    assert.equal(r.uncharted, true)
    assert.equal(r.stops[r.stops.length - 1].uncharted, true)
    assert.ok(r.share.off > 0)
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'B', 'pin:1'])
  })

  it('shares sum to 1, length_ly uses ly_per_px, routes are listed once each in order', () => {
    const graph = g([node('A', 0, 0), node('B', 50, 0), node('C', 90, 0)], [['A', 'B', 'major'], ['B', 'C', 'minor']])
    const r = route(graph, { id: 'A' }, { id: 'C' })
    assert.ok(Math.abs(r.share.major + r.share.minor + r.share.off - 1) < 1e-9)
    assert.ok(Math.abs(r.lengthLy - r.lengthPx * 10) < 1e-9)
    assert.deepEqual(r.routesUsed, ['A-B', 'B-C'])
  })

  it('the same planet is a zero-length trip', () => {
    const graph = g([node('A', 0, 0)], [])
    const r = route(graph, { id: 'A' }, { id: 'A' })
    assert.equal(r.found, true)
    assert.equal(r.lengthPx, 0)
  })
})

describe('time (hours per px by kind of leg, x hyperdrive class)', () => {
  const graph = g([node('A', 0, 0), node('B', 100, 0), node('C', 200, 0)], [['A', 'B', 'major'], ['B', 'C', 'minor']])
  it('a leg takes length x the rate of its kind (major 0.0909, minor 0.3, off 0.763 h/px)', () => {
    const r = route(graph, { id: 'A' }, { id: 'C' })
    assert.ok(Math.abs(r.hours - (100 * CONFIG.hoursPerPx.major + 100 * CONFIG.hoursPerPx.minor)) < 1e-9)
    assert.ok(Math.abs(r.legs[0].hours - 100 * 0.0909) < 1e-9)
  })
  it('an off-lane hop is the slowest kind of travel', () => {
    const r = route(g([node('A', 0, 0), node('B', 100, 0)], []), { id: 'A' }, { id: 'B' })
    assert.equal(r.legs[0].kind, 'off')
    assert.ok(Math.abs(r.hours - 100 * 0.763) < 1e-9)
  })
  it('the hyperdrive class multiplies the time (class 2 doubles it, 0.5 halves it)', () => {
    const r = route(graph, { id: 'A' }, { id: 'C' })
    assert.ok(Math.abs(travelTime(r, 2).hours - 2 * r.hours) < 1e-9)
    assert.ok(Math.abs(travelTime(r, 0.5).hours - r.hours / 2) < 1e-9)
    assert.equal(travelTime(r).text, formatTravelTime(r.hours))
  })
  it('travelTime carries the Table 7-14 band as a sanity check', () => {
    const r = route(graph, { id: 'A' }, { id: 'C' })
    assert.equal(travelTime(r).bandCheck, 'within a region: 10 to 72 hours')
  })
  it('formatTravelTime: whole hours, under 48 "N hours", else "D days, H hours"', () => {
    assert.equal(formatTravelTime(1), '1 hour')
    assert.equal(formatTravelTime(0.2), '1 hour')
    assert.equal(formatTravelTime(47), '47 hours')
    assert.equal(formatTravelTime(47.6), '2 days')
    assert.equal(formatTravelTime(48), '2 days')
    assert.equal(formatTravelTime(49), '2 days, 1 hour')
    assert.equal(formatTravelTime(60), '2 days, 12 hours')
    assert.equal(formatTravelTime(24 * 10 + 4), '10 days, 4 hours')
  })
})

describe('plan: hop route (the risky alternative)', () => {
  // A and B are 120 px apart with no lane between them; the lanes go round via C
  const around = (cy: number) => g([node('A', 0, 0), node('B', 120, 0), node('C', 60, cy)], [['A', 'C', 'major'], ['C', 'B', 'major']])
  it('a long way round by lane also offers lanes plus off-lane hops when that is much faster', () => {
    const p = plan(around(1000), { id: 'A' }, { id: 'B' })
    assert.deepEqual(p.primary.stops.map(s => s.id), ['A', 'C', 'B'])
    assert.ok(p.shortcut)
    assert.equal(p.shortcut!.share.off, 1)
    assert.ok(Math.abs(p.shortcut!.hours - 120 * CONFIG.hoursPerPx.off) < 1e-9)
    assert.ok(p.primary.hours - p.shortcut!.hours >= CONFIG.hopSaveHours)
  })
  it('the lane route is the primary even when a hop is shorter: off-lane distance first', () => {
    assert.equal(plan(around(1000), { id: 'A' }, { id: 'B' }).primary.share.off, 0)
  })
  it('no hop route when it is not faster: lanes ARE faster than hops', () => {
    assert.equal(plan(around(40), { id: 'A' }, { id: 'B' }).shortcut, undefined)
  })
  it('a hop route that saves under 12 h and under 20% is not offered; both thresholds come from CONFIG', () => {
    // minor lanes 2 x 139.3 px x 0.3 = 83.6 h; hop 100 px x 0.763 = 76.3 h; saves 7.3 h (8.7%)
    const near = g([node('A', 0, 0), node('B', 100, 0), node('C', 50, 130)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    assert.equal(plan(near, { id: 'A' }, { id: 'B' }).shortcut, undefined)
    assert.ok(plan(near, { id: 'A' }, { id: 'B' }, { ...CONFIG, hopSaveHours: 5 }).shortcut)
    assert.ok(plan(near, { id: 'A' }, { id: 'B' }, { ...CONFIG, hopSaveShare: 0.05 }).shortcut)
  })
  it('hops are at most hopMaxPx long: beyond it, with no lane, the trip falls back to a straight jump and there is no hop route', () => {
    const graph = g([node('A', 0, 0), node('B', 300, 0)], [])
    const p = plan(graph, { id: 'A' }, { id: 'B' })
    assert.equal(p.primary.found, true)
    assert.deepEqual(p.primary.legs.map(l => l.kind), ['off'])
    assert.equal(p.shortcut, undefined)
    assert.equal(route(graph, { id: 'A' }, { id: 'B' }).found, false)
  })
  it('lanes that do not connect are bridged by a hop of <= hopMaxPx', () => {
    const graph = g([node('A', 0, 0), node('B', 50, 0), node('C', 90, 0), node('D', 140, 0)], [['A', 'B', 'major'], ['C', 'D', 'major']])
    assert.deepEqual(route(graph, { id: 'A' }, { id: 'D' }).legs.map(l => l.kind), ['lane', 'off', 'lane'])
  })
  it('the hop route can leave a lane at the closest point (drop-off) even from a planet that is on a lane', () => {
    const graph = g([node('A', 0, 0), node('B', 400, 0), node('T', 200, 60, 'Core Worlds', null, false)], [['A', 'B', 'minor']])
    const hop = route(graph, { id: 'A' }, { id: 'T' }, 'hops')
    assert.equal(hop.found, true)
    assert.equal(hop.stops.some(s => s.dropoff), true)
  })
})

describe('travelBand (Table 7-14)', () => {
  it('within a sector / within a region / between regions / across the galaxy / pin', () => {
    assert.equal(travelBand({ region: 'Core Worlds', sector: 'Corusca' }, { region: 'Core Worlds', sector: 'Corusca' }), 0)
    assert.equal(travelBand({ region: 'Core Worlds', sector: 'Corusca' }, { region: 'Core Worlds', sector: 'Corellian' }), 1)
    assert.equal(travelBand({ region: 'Core Worlds', sector: null }, { region: 'Mid Rim', sector: null }), 2)
    assert.equal(travelBand({ region: 'Core Worlds', sector: null }, { region: 'Outer Rim Territories', sector: null }), 3)
    assert.equal(travelBand({ region: 'Core Worlds', sector: null }, { region: 'Hutt Space', sector: null }), 2)
    assert.equal(travelBand({ region: 'Core Worlds', sector: null }, { region: null, sector: null, pin: true }), 3)
  })
})

describe('difficulty (route sets purple, risk sets red)', () => {
  const none: never[] = []
  const pool = (r: RouteResult, hz: Parameters<typeof difficulty>[1] = none) => difficulty(r, hz)
  it('all major + within a sector = Simple, no dice', () => {
    const d = pool(fake({ major: 1, minor: 0, off: 0 }, false, 'Core Worlds', 'S'))
    assert.equal(d.raw, 0)
    assert.equal(d.difficulty, 'Simple')
    assert.deepEqual(d.pool, { purple: 0, red: 0 })
  })
  it('all major + within a region = Easy (1 purple, 0 red)', () => {
    const d = pool(fake({ major: 1, minor: 0, off: 0 }, false, 'Core Worlds', 'S', { region: 'Core Worlds', sector: 'T' }))
    assert.equal(d.difficulty, 'Easy')
    assert.deepEqual(d.pool, { purple: 1, red: 0 })
  })
  it('any minor leg adds 1 difficulty', () => {
    assert.equal(pool(fake({ major: 0.5, minor: 0.5, off: 0 }, false, 'Core Worlds', 'S')).minorTerm, 1)
    assert.equal(pool(fake({ major: 1, minor: 0, off: 0 }, false, 'Core Worlds', 'S')).minorTerm, 0)
  })
  it('off-lane legs add NO difficulty, only upgrades: up to 1/4 +1, 1/4 to 2/3 +2, over 2/3 +3', () => {
    const o = (off: number) => pool(fake({ major: 1 - off, minor: 0, off }, false, 'Core Worlds', 'S'))
    for (const off of [0.1, 0.3, 0.8]) assert.equal(o(off).raw, 0)
    assert.equal(o(0).offUpgrades, 0)
    assert.equal(o(0.1).offUpgrades, 1)
    assert.equal(o(0.3).offUpgrades, 2)
    assert.equal(o(0.5).offUpgrades, 2)
    assert.equal(o(0.8).offUpgrades, 3)
  })
  it('an upgrade with no purple die adds one: Simple + 1 upgrade = Easy (1 purple, 0 red)', () => {
    const d = pool(fake({ major: 0.9, minor: 0, off: 0.1 }, false, 'Core Worlds', 'S'))
    assert.deepEqual(d.pool, { purple: 1, red: 0 })
    assert.equal(d.difficulty, 'Easy')
  })
  it('an upgrade on an existing purple die turns it red: Easy + 1 = 0 purple, 1 red', () => {
    const d = pool(fake({ major: 0.9, minor: 0, off: 0.1 }, false, 'Core Worlds', 'S', { region: 'Core Worlds', sector: 'T' }))
    assert.deepEqual(d.pool, { purple: 0, red: 1 })
  })
  it('uncharted pin endpoint = +1 upgrade, not difficulty', () => {
    const d = pool(fake({ major: 0.1, minor: 0, off: 0.9 }, true))
    // pin = across (3 purple); off > 2/3 = +3 upgrades; uncharted +1 = 4 upgrades: 3 purple -> red, then the 4th adds a purple
    assert.equal(d.raw, 3)
    assert.equal(d.offUpgrades, 3)
    assert.equal(d.unchartedUpgrades, 1)
    assert.deepEqual(d.pool, { purple: 1, red: 3 })
  })
  it('difficulty above Formidable converts the excess to upgrades, no cap', () => {
    const cfg = { ...CONFIG, difficulty: { ...CONFIG.difficulty, base: 4 } }
    const d = difficulty(fake({ major: 1, minor: 0, off: 0 }, true), none, cfg) // 4 + 3 (pin = across) = 7
    assert.equal(d.raw, 7)
    assert.equal(d.excessUpgrades, 2)
    assert.equal(d.difficulty, 'Formidable')
  })
  it('hazard upgrades are added on top and reported separately', () => {
    const r = fake({ major: 0, minor: 1, off: 0 })
    r.stops[1].id = 'kessel-t-10'
    const d = pool(r, [{ system: 'kessel-t-10', upgrades: 2, note: 'Kessel' }])
    assert.equal(d.offUpgrades, 0)
    assert.equal(d.hazardUpgrades, 2)
    assert.equal(d.totalUpgrades, 2)
  })
  it('every number comes from CONFIG (changing it changes the result)', () => {
    const base = difficulty(fake({ major: 1, minor: 0, off: 0 }), [])
    const cfg = { ...CONFIG, difficulty: { ...CONFIG.difficulty, base: 2 } }
    assert.equal(difficulty(fake({ major: 1, minor: 0, off: 0 }), [], cfg).raw, base.raw + 2)
  })
})

describe('density (Core crowded, Rim empty)', () => {
  const trip = (region: string) => {
    const graph = g([node('A', 0, 0, region, 'S'), node('B', 100, 0, region, 'S')], [['A', 'B', 'major']])
    const r = route(graph, { id: 'A' }, { id: 'B' })
    return { r, d: difficulty(r, []) }
  }
  it('Core and Deep Core +1, Colonies / Inner Rim / Expansion 0, Mid Rim / Outer Rim / Wild / Hutt / Unknown -1', () => {
    assert.equal(trip('Core Worlds').r.density, 1)
    assert.equal(trip('Deep Core').r.density, 1)
    for (const z of ['Colonies', 'Inner Rim', 'Expansion Region']) assert.equal(trip(z).r.density, 0)
    for (const z of ['Mid Rim', 'Outer Rim Territories', 'Wild Space', 'Hutt Space', 'Unknown Regions']) assert.equal(trip(z).r.density, -1)
  })
  it('purple = max(0, distance band + density) + minor lane: Core adds a die, the Rim never goes below none', () => {
    assert.equal(trip('Core Worlds').d.raw, 1) // within a sector 0 + density 1
    assert.equal(trip('Mid Rim').d.raw, 0) // 0 - 1 floored at 0
    assert.equal(trip('Core Worlds').d.densityTerm, 1)
  })
  it('the density of a mixed route is the length-weighted mean of its legs, rounded', () => {
    // 300 px in the Core (+1) then 100 px in the Rim (-1): (300 - 100) / 400 = 0.5 -> 1
    const graph = g(
      [node('A', 0, 0, 'Core Worlds', 'S'), node('B', 300, 0, 'Core Worlds', 'S'), node('C', 400, 0, 'Mid Rim', 'S')],
      [['A', 'B', 'major'], ['B', 'C', 'major']],
    )
    assert.equal(route(graph, { id: 'A' }, { id: 'C' }).density, 1)
  })
})

describe('buildGalaxy (the rows loadGalaxy reads)', () => {
  it('builds an engine graph from table-shaped rows and plan() runs on it', () => {
    const galaxy = buildGalaxy(
      [
        { id: 'a', name: 'A', x: 0, y: 0, region: 'Core Worlds', sector: 'S', on_lane: true },
        { id: 'b', name: 'B', x: 100, y: 0, region: 'Core Worlds', sector: 'S', on_lane: true },
        { id: 'k', name: 'K', x: 50, y: 60, region: 'Core Worlds', sector: 'S', on_lane: false },
      ],
      [{ a: 'a', b: 'b', route_name: 'Test Run', lane_class: 'major', length_px: 100 }],
      [{ system_id: 'b', upgrades: 2, note: 'Maw' }],
    )
    assert.equal(galaxy.graph.nodes.length, 3)
    assert.equal(galaxy.graph.meta.ly_per_px, LY_PER_PX)
    assert.deepEqual(galaxy.hazards, [{ system: 'b', upgrades: 2, note: 'Maw' }])
    const p = plan(galaxy.graph, { id: 'a' }, { id: 'k' })
    assert.deepEqual([p.primary.stops[0].name, p.primary.stops[p.primary.stops.length - 1].name], ['A', 'K'])
    assert.equal(p.primary.found, true)
    assert.ok(p.primary.legs.some(l => l.kind === 'off'))
    assert.equal(difficulty(p.primary, galaxy.hazards).hazardUpgrades, 0)
  })
})
