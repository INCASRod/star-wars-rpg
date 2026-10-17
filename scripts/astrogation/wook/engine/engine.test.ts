/** npx tsx --test scripts/astrogation/wook/engine/engine.test.ts */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CONFIG, difficulty, plan, route, travelBand } from './index'
import type { Graph, GraphNode, RouteResult } from './types'
import { TRIPS, loadGraph, loadHazards, runTrip } from './trips'

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
  legs: [], routesUsed: [], lengthPx: 1, lengthLy: 10, share, uncharted,
})

describe('route: lanes first', () => {
  it('takes a long all-lane path over a short off-lane shortcut', () => {
    // A and B are 10 px apart, but the only lane goes round via C (about 200 px)
    const graph = g([node('A', 0, 0), node('B', 10, 0), node('C', 5, 100)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    const r = route(graph, { id: 'A' }, { id: 'B' })
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'C', 'B'])
    assert.equal(r.share.off, 0)
  })

  it('prefers a longer all-major path over a shorter all-minor one only through the weights (1:3)', () => {
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

describe('plan: risky shortcut', () => {
  it('lanes at least 3x the straight line also offer a direct off-lane jump', () => {
    const graph = g([node('A', 0, 0), node('B', 10, 0), node('C', 5, 100)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    const p = plan(graph, { id: 'A' }, { id: 'B' })
    assert.ok(p.ratio >= CONFIG.shortcutRatio)
    assert.ok(p.shortcut)
    assert.equal(p.shortcut!.share.off, 1)
    assert.ok(Math.abs(p.shortcut!.lengthPx - 10) < 1e-9)
    assert.deepEqual(p.primary.stops.map(s => s.id), ['A', 'C', 'B'])
  })
  it('lanes under 3x the straight line offer no shortcut', () => {
    const graph = g([node('A', 0, 0), node('B', 100, 0), node('C', 50, 30)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    const p = plan(graph, { id: 'A' }, { id: 'B' })
    assert.ok(p.ratio < CONFIG.shortcutRatio)
    assert.equal(p.shortcut, undefined)
  })
  it('the trigger ratio comes from CONFIG', () => {
    const graph = g([node('A', 0, 0), node('B', 100, 0), node('C', 50, 30)], [['A', 'C', 'minor'], ['C', 'B', 'minor']])
    assert.ok(plan(graph, { id: 'A' }, { id: 'B' }, { ...CONFIG, shortcutRatio: 1.1 }).shortcut)
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

// ---- Rodrigo's expected trips on the real graph. Expected values are tests; where the data differs, the test FAILS and the actual is reported.
describe('expected trips (real graph)', () => {
  const graph = loadGraph()
  const hazards = loadHazards()
  const by = (n: number) => runTrip(graph, hazards, TRIPS.find(t => t.n === n)!)
  const names = (n: number) => by(n).primary.route.stops.map(s => s.name).join(' > ')

  it('1. Coruscant - Corellia: all major, within region, Easy (1 purple, 0 red), no shortcut offered', () => {
    const x = by(1)
    assert.equal(x.primary.route.share.major, 1)
    assert.equal(x.primary.bandName, 'within a region')
    assert.equal(x.primary.difficulty.difficulty, 'Easy')
    assert.deepEqual(x.primary.difficulty.pool, { purple: 1, red: 0 })
    assert.equal(x.shortcut, null)
  })
  it('2. Coruscant - Fedalle: the lanes route is unchanged (via Corellia) AND a shortcut is offered', () => {
    const x = by(2)
    assert.equal(x.primary.route.share.off, 0)
    assert.ok(x.primary.route.stops.some(s => s.name === 'Corellia'))
    assert.ok(x.shortcut)
    console.log(`  [2] primary ${x.primary.difficulty.difficulty} ${JSON.stringify(x.primary.difficulty.pool)}; shortcut ${x.shortcut!.difficulty.difficulty} ${JSON.stringify(x.shortcut!.difficulty.pool)} (${Math.round(x.shortcut!.route.lengthPx)} px vs ${Math.round(x.primary.route.lengthPx)} px)`)
  })
  it('3. Coruscant - Ord Mantell: lanes only', () => {
    assert.equal(by(3).primary.route.share.off, 0)
  })
  it('4. Kessel - Formos: minor, +2 hazard upgrades, Kessel Run (may continue via Oba Diah)', () => {
    const x = by(4)
    assert.ok(x.primary.route.routesUsed.includes('Kessel Run'))
    assert.equal(x.primary.route.share.minor, 1)
    assert.equal(x.primary.difficulty.hazardUpgrades, 2)
  })
  it('5. Ryloth - Tatooine: Corellian Skip Run, minor', () => {
    const x = by(5)
    assert.deepEqual(x.primary.route.routesUsed, ['Corellian Skip Run'])
    assert.equal(x.primary.route.share.minor, 1)
  })
  it('6. Ryloth - Arkanis: mostly major, may go via Christophsis', () => {
    const x = by(6)
    assert.ok(x.primary.route.routesUsed.includes('Corellian Run'))
    assert.ok(x.primary.route.share.major >= 0.5, `major ${x.primary.route.share.major}`)
  })
  it('7-9. Brentaal - Corsin, Bandomeer - Daiyu, Corellia - Nal Hutta: a route is found (report only)', () => {
    for (const n of [7, 8, 9]) assert.equal(by(n).primary.route.found, true)
  })
  it('10. Coruscant - pin in the Unknown Regions: uncharted, across, red dice from off-lane + uncharted', () => {
    const x = by(10)
    const d = x.primary.difficulty
    assert.equal(x.primary.route.uncharted, true)
    assert.equal(x.primary.bandName, 'across the galaxy')
    assert.ok(d.offUpgrades >= 1)
    assert.equal(d.unchartedUpgrades, 1)
    assert.ok(d.pool.red >= 2, `red ${d.pool.red}`)
  })
  it('11. Vardos (no lane) - Coruscant: short off-lane drop onto the lane beside it, not the 12-stop trek', () => {
    const x = by(11)
    const r = x.primary.route
    assert.equal(graph.nodes.find(n => n.name === 'Vardos')!.on_lane, false)
    const offs = r.legs.filter(l => l.kind === 'off')
    assert.equal(offs.length, 1)
    assert.ok(r.share.off < 0.1, `off ${r.share.off}`)
    assert.ok(r.stops.length <= 5, names(11))
    assert.ok(r.stops.some(s => s.dropoff))
    console.log(`  [11] ${Math.round(r.lengthPx)} px, off ${Math.round(r.share.off * 1000) / 10}%: ${names(11)}`)
  })
  it('12. Coruscant - Aargau: >= 80% major, a short off-lane leg, no trek via other planets', () => {
    const x = by(12)
    const r = x.primary.route
    console.log(`  [12] Aargau on_lane=${graph.nodes.find(n => n.name === 'Aargau')!.on_lane}; ${names(12)}; major ${Math.round(r.share.major * 100)}% off ${Math.round(r.share.off * 100)}%`)
    assert.ok(r.share.major >= 0.8, `major ${r.share.major}`)
    assert.ok(r.share.off > 0 && r.share.off < 0.25, `off ${r.share.off}`)
    assert.ok(r.stops.length <= 4, names(12))
  })
  it('12b. Coruscant - Aargau = Easy (1 purple, 0 red)', () => {
    const d = by(12).primary.difficulty
    assert.equal(d.difficulty, 'Easy')
    assert.deepEqual(d.pool, { purple: 1, red: 0 })
  })
})
