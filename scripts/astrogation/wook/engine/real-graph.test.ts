/** Rodrigo's expected trips on the real graph.json. npx tsx --test scripts/astrogation/wook/engine/real-graph.test.ts */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { travelTime } from '../../../../src/lib/astrogation'
import { TRIPS, loadGraph, loadHazards, runTrip, type evaluate } from './trips'

// ---- Rodrigo's expected trips on the real graph. Expected values are tests; where the data differs, the test FAILS and the actual is reported.
describe('expected trips (real graph)', () => {
  const graph = loadGraph()
  const hazards = loadHazards()
  const by = (n: number) => runTrip(graph, hazards, TRIPS.find(t => t.n === n)!)
  const names = (n: number) => by(n).primary.route.stops.map(s => s.name).join(' > ')

  it('1. Coruscant - Corellia: all major, within region, Average (2 purple, 0 red: Core density +1), 34 hours, no hop route', () => {
    const x = by(1)
    assert.equal(x.primary.route.share.major, 1)
    assert.equal(x.primary.bandName, 'within a region')
    assert.equal(x.primary.difficulty.difficulty, 'Average')
    assert.deepEqual(x.primary.difficulty.pool, { purple: 2, red: 0 })
    assert.equal(x.primary.travel.text, '34 hours')
    assert.equal(x.shortcut, null)
  })
  it('2. Coruscant - Fedalle: the lanes route is unchanged (via Corellia) AND a hop route is offered', () => {
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
  it('12. Coruscant - Aargau: Aargau is on the minor Agricultural Circuit (accepted C4 data): all minor, no off-lane leg', () => {
    const x = by(12)
    const r = x.primary.route
    console.log(`  [12] Aargau on_lane=${graph.nodes.find(n => n.name === 'Aargau')!.on_lane}; ${names(12)}; major ${Math.round(r.share.major * 100)}% off ${Math.round(r.share.off * 100)}%`)
    assert.equal(r.share.major, 0)
    assert.equal(r.share.off, 0)
    assert.ok(r.stops.length <= 4, names(12))
  })
  it('12b. Coruscant - Aargau = Hard (3 purple, 0 red), accepted by Rodrigo (C5 ruling 4)', () => {
    const d = by(12).primary.difficulty
    assert.equal(d.difficulty, 'Hard')
    assert.deepEqual(d.pool, { purple: 3, red: 0 })
  })
})

// ---- C5: travel time, density, hop route. Class 1 hyperdrive. Values from mockup-galaxy-v3.html (the reference implementation).
describe('C5 trip table (real graph)', () => {
  const graph = loadGraph()
  const hazards = loadHazards()
  const trip = (from: string, to: string) => runTrip(graph, hazards, { n: 0, label: `${from} - ${to}`, from, to })
  const row = (x: ReturnType<typeof evaluate>) => [x.travel.text, x.difficulty.difficulty, x.difficulty.pool.purple, x.difficulty.pool.red]
  const cases: [string, string, (string | number)[], (string | number)[] | null][] = [
    ['Kubindi', 'Formos', ['24 hours', 'Easy', 1, 0], null],
    ['Coruscant', 'Corellia', ['34 hours', 'Average', 2, 0], null],
    ['Coruscant', 'Aargau', ['24 hours', 'Hard', 3, 0], ['15 hours', 'Hard', 2, 1]],
    ['Ryloth', 'Tatooine', ['41 hours', 'Easy', 1, 0], null],
    ['Formos', 'Esseles', ['13 days, 15 hours', 'Hard', 3, 0], ['12 days, 21 hours', 'Hard', 2, 1]],
    ['Coruscant', 'Fedalle', ['4 days', 'Average', 2, 0], ['2 days, 4 hours', 'Hard', 2, 1]],
    ['Coruscant', 'Alderaan', ['10 days, 6 hours', 'Average', 2, 0], ['45 hours', 'Hard', 2, 1]],
    ['Kessel', 'Formos', ['25 hours', 'Average', 1, 1], null],
  ]
  for (const [a, b, lane, hop] of cases) {
    it(`${a} - ${b}: lane ${lane[0]} ${lane[1]} (${lane[2]}, ${lane[3]})${hop ? `; hop ${hop[0]} ${hop[1]} (${hop[2]}, ${hop[3]})` : '; no hop route'}`, () => {
      const x = trip(a, b)
      assert.deepEqual(row(x.primary), lane)
      if (hop) {
        assert.ok(x.shortcut, 'a hop route is offered')
        assert.deepEqual(row(x.shortcut!), hop)
      } else assert.equal(x.shortcut, null)
    })
  }
  it('Formos - Esseles hop route leaves the lanes near Esseles via Thokos', () => {
    const names = trip('Formos', 'Esseles').shortcut!.route.stops.map(s => s.name)
    assert.ok(names.includes('Thokos'), names.join(' > '))
  })
  it('hyperdrive class 2 doubles every time, class 0.5 halves it', () => {
    const x = trip('Coruscant', 'Corellia').primary
    assert.equal(travelTime(x.route, 2).text, '2 days, 20 hours')
    assert.equal(travelTime(x.route, 0.5).text, '17 hours')
    assert.equal(travelTime(trip('Formos', 'Esseles').primary.route, 2).text, '27 days, 7 hours')
  })
})
