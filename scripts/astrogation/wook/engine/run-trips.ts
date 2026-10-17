/** npx tsx scripts/astrogation/wook/engine/run-trips.ts  ->  data/astrogation/wook/trips.json (and a table on stdout) */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { TRIPS, loadGraph, loadHazards, runTrip, type evaluate } from './trips'

const graph = loadGraph()
const hazards = loadHazards()
const pct = (v: number) => Math.round(v * 1000) / 10

function summary(x: ReturnType<typeof evaluate>) {
  const r = x.route
  const d = x.difficulty
  return {
    found: r.found,
    stops: r.stops.map(s => s.name),
    stop_ids: r.stops.map(s => s.id),
    stop_xy: r.stops.map(s => [Math.round(s.x * 10) / 10, Math.round(s.y * 10) / 10]),
    dropoffs: r.stops.filter(s => s.dropoff).map(s => s.id),
    legs: r.legs.map(l => ({ from: l.from, to: l.to, kind: l.kind, route: l.route ?? null, class: l.class ?? null, length_px: Math.round(l.lengthPx * 10) / 10 })),
    routes_used: r.routesUsed,
    length_px: Math.round(r.lengthPx * 10) / 10,
    length_ly: Math.round(r.lengthLy),
    share_pct: { major: pct(r.share.major), minor: pct(r.share.minor), off_lane: pct(r.share.off) },
    uncharted: r.uncharted,
    band: x.bandName,
    time_class1: x.time,
    raw: d.raw,
    terms: { minor: d.minorTerm, distance: d.distanceTerm },
    upgrades: { off_lane: d.offUpgrades, uncharted: d.unchartedUpgrades, excess: d.excessUpgrades, hazard: d.hazardUpgrades, total: d.totalUpgrades },
    pool: d.pool,
    difficulty: d.difficulty,
    hazards: d.hazards.map(h => ({ system: h.system, upgrades: h.upgrades, note: h.note ?? null })),
  }
}

const out = TRIPS.map(t => {
  const x = runTrip(graph, hazards, t)
  return { n: t.n, trip: t.label, ratio: Number.isFinite(x.ratio) ? Math.round(x.ratio * 100) / 100 : null, primary: summary(x.primary), shortcut: x.shortcut ? summary(x.shortcut) : null }
})
const file = path.resolve(__dirname, '..', '..', '..', '..', 'data', 'astrogation', 'wook', 'trips.json')
fs.writeFileSync(file, JSON.stringify({ meta: { engine: 'scripts/astrogation/wook/engine', graph: 'data/astrogation/wook/graph.json', hyperdrive_class: 1 }, trips: out }, null, 1))
const line = (label: string, p: ReturnType<typeof summary>) =>
  `   ${label}: ${p.length_px} px, major ${p.share_pct.major}% minor ${p.share_pct.minor}% off ${p.share_pct.off_lane}%, ${p.band}, ${p.difficulty} (${p.pool.purple} purple, ${p.pool.red} red; upgrades ${p.upgrades.total}); ${p.routes_used.join(', ') || '-'}`
for (const t of out) {
  console.log(`${t.n}. ${t.trip} (lanes/straight ${t.ratio ?? 'inf'})`)
  console.log(line('primary ', t.primary))
  console.log(`     ${t.primary.stops.join(' > ')}`)
  if (t.shortcut) console.log(line('shortcut', t.shortcut))
}
