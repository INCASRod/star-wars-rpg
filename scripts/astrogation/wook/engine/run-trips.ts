/** npx tsx scripts/astrogation/wook/engine/run-trips.ts  ->  data/astrogation/wook/trips.json (and a table on stdout) */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { TRIPS, loadGraph, loadHazards, runTrip } from './trips'

const graph = loadGraph()
const hazards = loadHazards()
const out = TRIPS.map(t => {
  const x = runTrip(graph, hazards, t)
  const r = x.route
  const pct = (v: number) => Math.round(v * 1000) / 10
  return {
    n: t.n,
    trip: t.label,
    found: r.found,
    stops: r.stops.map(s => s.name),
    stop_ids: r.stops.map(s => s.id),
    stop_xy: r.stops.map(s => [Math.round(s.x * 10) / 10, Math.round(s.y * 10) / 10]),
    legs: r.legs.map(l => ({ from: l.from, to: l.to, kind: l.kind, route: l.route ?? null, class: l.class ?? null, length_px: Math.round(l.lengthPx * 10) / 10 })),
    routes_used: r.routesUsed,
    length_px: Math.round(r.lengthPx * 10) / 10,
    length_ly: Math.round(r.lengthLy),
    share_pct: { major: pct(r.share.major), minor: pct(r.share.minor), off_lane: pct(r.share.off) },
    uncharted: r.uncharted,
    band: x.bandName,
    time_class1: x.time,
    raw: x.difficulty.raw,
    terms: { lane: x.difficulty.laneTerm, distance: x.difficulty.distanceTerm, uncharted: x.difficulty.unchartedTerm },
    difficulty: x.difficulty.difficulty,
    upgrades: x.difficulty.upgrades,
    hazard_upgrades: x.difficulty.hazardUpgrades,
    hazards: x.difficulty.hazards.map(h => ({ system: h.system, upgrades: h.upgrades, note: h.note ?? null })),
    total_upgrades: x.difficulty.totalUpgrades,
  }
})
const file = path.resolve(__dirname, '..', '..', '..', '..', 'data', 'astrogation', 'wook', 'trips.json')
fs.writeFileSync(file, JSON.stringify({ meta: { engine: 'scripts/astrogation/wook/engine', graph: 'data/astrogation/wook/graph.json', hyperdrive_class: 1 }, trips: out }, null, 1))
for (const t of out) {
  console.log(`${t.n}. ${t.trip}: ${t.length_px} px, major ${t.share_pct.major}% minor ${t.share_pct.minor}% off ${t.share_pct.off_lane}%, ${t.band}, raw ${t.raw} ${t.difficulty} +${t.upgrades} (hazard +${t.hazard_upgrades}); ${t.routes_used.join(', ') || '-'}`)
  console.log(`     ${t.stops.join(' > ')}`)
}
