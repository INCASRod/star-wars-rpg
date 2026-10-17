/** npx tsx --test scripts/astrogation/wook/engine/engine.test.ts */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CONFIG, difficulty, route, travelBand } from './index'
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

  it('an endpoint on no lane gets an off-lane leg to the NEAREST lane planet that makes the trip possible', () => {
    const graph = g(
      [node('A', 0, 0), node('B', 100, 0), node('X', 90, 30, 'Core Worlds', null, false)],
      [['A', 'B', 'major']],
    )
    const r = route(graph, { id: 'A' }, { id: 'X' })
    assert.deepEqual(r.stops.map(s => s.id), ['A', 'B', 'X'])
    assert.equal(r.legs[1].kind, 'off')
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

describe('difficulty (base Simple)', () => {
  const none: never[] = []
  it('all major + within a sector = Simple', () => {
    const d = difficulty(fake({ major: 1, minor: 0, off: 0 }, false, 'Core Worlds', 'S'), none)
    assert.equal(d.raw, 0)
    assert.equal(d.difficulty, 'Simple')
  })
  it('all major + within a region = Easy', () => {
    const d = difficulty(fake({ major: 1, minor: 0, off: 0 }, false, 'Core Worlds', 'S', { region: 'Core Worlds', sector: 'T' }), none)
    assert.equal(d.raw, 1)
    assert.equal(d.difficulty, 'Easy')
  })
  it('lane terms: any minor +1, off < 1/4 +2, 1/4 to 2/3 +3, over 2/3 +4', () => {
    const lane = (s: RouteResult['share']) => difficulty(fake(s, false, 'Core Worlds', 'S'), none).laneTerm
    assert.equal(lane({ major: 0.5, minor: 0.5, off: 0 }), 1)
    assert.equal(lane({ major: 0.8, minor: 0.1, off: 0.1 }), 2)
    assert.equal(lane({ major: 0.5, minor: 0.2, off: 0.3 }), 3)
    assert.equal(lane({ major: 0.5, minor: 0, off: 0.25 + 0.25 }), 3)
    assert.equal(lane({ major: 0, minor: 0.2, off: 0.8 }), 4)
  })
  it('uncharted +2; raw above 5 becomes upgrades with no cap', () => {
    const d = difficulty(fake({ major: 0, minor: 0.1, off: 0.9 }, true), none)
    // 0 + 4 (off > 2/3) + 3 (pin = across) + 2 (uncharted) = 9
    assert.equal(d.raw, 9)
    assert.equal(d.difficulty, 'Formidable')
    assert.equal(d.upgrades, 4)
  })
  it('hazard upgrades are added on top and reported separately', () => {
    const r = fake({ major: 0, minor: 1, off: 0 })
    r.stops[1].id = 'kessel-t-10'
    const d = difficulty(r, [{ system: 'kessel-t-10', upgrades: 2, note: 'Kessel' }])
    assert.equal(d.upgrades, 0)
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

  it('1. Coruscant - Corellia: all major, within region, Easy, 0 upgrades', () => {
    const x = by(1)
    assert.equal(x.route.share.major, 1)
    assert.equal(x.bandName, 'within a region')
    assert.equal(x.difficulty.difficulty, 'Easy')
    assert.equal(x.difficulty.totalUpgrades, 0)
  })
  it('2. Coruscant - Fedalle: lanes only, no detour via Corellia', () => {
    const x = by(2)
    assert.equal(x.route.share.off, 0)
    assert.ok(!x.route.stops.some(s => s.name === 'Corellia'), `route runs ${x.route.stops.map(s => s.name).join(' > ')}`)
  })
  it('3. Coruscant - Ord Mantell: lanes only', () => {
    assert.equal(by(3).route.share.off, 0)
  })
  it('4. Kessel - Formos: Kessel Run, minor, +2 hazard upgrades', () => {
    const x = by(4)
    assert.deepEqual(x.route.routesUsed, ['Kessel Run'])
    assert.equal(x.route.share.minor, 1)
    assert.equal(x.difficulty.hazardUpgrades, 2)
  })
  it('5. Ryloth - Tatooine: Corellian Skip Run, minor', () => {
    const x = by(5)
    assert.deepEqual(x.route.routesUsed, ['Corellian Skip Run'])
    assert.equal(x.route.share.minor, 1)
  })
  it('6. Ryloth - Arkanis: Corellian Run, all major', () => {
    const x = by(6)
    assert.deepEqual(x.route.routesUsed, ['Corellian Run'])
    assert.equal(x.route.share.major, 1)
  })
  it('7-9. Brentaal - Corsin, Bandomeer - Daiyu, Corellia - Nal Hutta: a route is found (report only)', () => {
    for (const n of [7, 8, 9]) assert.equal(by(n).route.found, true)
  })
  it('10. Coruscant - pin in the Unknown Regions: uncharted, across, upgrades', () => {
    const x = by(10)
    assert.equal(x.route.uncharted, true)
    assert.equal(x.bandName, 'across the galaxy')
    assert.ok(x.difficulty.raw > CONFIG.difficulty.formidableAt, `raw ${x.difficulty.raw}`)
  })
  it('11. a Core planet on no lane (Vardos) - Coruscant: off-lane leg to the nearest lane planet', () => {
    const x = by(11)
    assert.equal(graph.nodes.find(n => n.name === 'Vardos')!.on_lane, false)
    assert.ok(x.route.legs.some(l => l.kind === 'off'))
    assert.ok(x.route.share.off > 0)
  })
})
