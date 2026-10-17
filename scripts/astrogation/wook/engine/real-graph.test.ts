/** Rodrigo's expected trips on the real graph.json. npx tsx --test scripts/astrogation/wook/engine/real-graph.test.ts */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TRIPS, loadGraph, loadHazards, runTrip } from './trips'

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
  it('12. Coruscant - Aargau: Aargau is on the minor Agricultural Circuit (accepted C4 data): all minor, no off-lane leg', () => {
    const x = by(12)
    const r = x.primary.route
    console.log(`  [12] Aargau on_lane=${graph.nodes.find(n => n.name === 'Aargau')!.on_lane}; ${names(12)}; major ${Math.round(r.share.major * 100)}% off ${Math.round(r.share.off * 100)}%`)
    assert.equal(r.share.major, 0)
    assert.equal(r.share.off, 0)
    assert.ok(r.stops.length <= 4, names(12))
  })
  it('12b. Coruscant - Aargau = Average', () => {
    const d = by(12).primary.difficulty
    assert.equal(d.difficulty, 'Average')
    console.log('  [12b]', JSON.stringify(d.pool))
  })
})
