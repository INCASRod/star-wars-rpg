import * as fs from 'node:fs'
import * as path from 'node:path'
import { difficulty, plan, bandOf, CONFIG } from './index'
import type { Endpoint, Graph, Hazard, RouteResult } from './types'

const DATA = path.resolve(__dirname, '..', '..', '..', '..', 'data', 'astrogation')

export function loadGraph(): Graph {
  return JSON.parse(fs.readFileSync(path.join(DATA, 'wook', 'graph.json'), 'utf-8')) as Graph
}

/** hazards.json: `[{ system: <node id>, upgrades, note }]`, extensible */
export function loadHazards(): Hazard[] {
  return JSON.parse(fs.readFileSync(path.join(DATA, 'hazards.json'), 'utf-8')) as Hazard[]
}

export type TripEnd = string | { pin: { x: number; y: number }; name: string }

export interface Trip {
  n: number
  label: string
  from: TripEnd
  to: TripEnd
}

/** A pin in the black space west of the galaxy, by the "Unknown Regions" label (same point as prompt B). */
export const UNKNOWN_PIN: TripEnd = { pin: { x: 1100, y: 2100 }, name: 'Pin (Unknown Regions)' }

export const TRIPS: Trip[] = [
  { n: 1, label: 'Coruscant - Corellia', from: 'Coruscant', to: 'Corellia' },
  { n: 2, label: 'Coruscant - Fedalle', from: 'Coruscant', to: 'Fedalle' },
  { n: 3, label: 'Coruscant - Ord Mantell', from: 'Coruscant', to: 'Ord Mantell' },
  { n: 4, label: 'Kessel - Formos', from: 'Kessel', to: 'Formos' },
  { n: 5, label: 'Ryloth - Tatooine', from: 'Ryloth', to: 'Tatooine' },
  { n: 6, label: 'Ryloth - Arkanis', from: 'Ryloth', to: 'Arkanis' },
  { n: 7, label: 'Brentaal - Corsin', from: 'Brentaal', to: 'Corsin' },
  { n: 8, label: 'Bandomeer - Daiyu', from: 'Bandomeer', to: 'Daiyu' },
  { n: 9, label: 'Corellia - Nal Hutta', from: 'Corellia', to: 'Nal Hutta' },
  { n: 10, label: 'Coruscant - pin (Unknown Regions)', from: 'Coruscant', to: UNKNOWN_PIN },
  { n: 11, label: 'Vardos (no lane) - Coruscant', from: 'Vardos', to: 'Coruscant' },
  { n: 12, label: 'Coruscant - Aargau', from: 'Coruscant', to: 'Aargau' },
]

export function endpoint(graph: Graph, e: TripEnd): Endpoint {
  if (typeof e !== 'string') return { pin: e.pin, name: e.name }
  const hits = graph.nodes.filter(n => n.name === e)
  if (hits.length !== 1) throw new Error(`${e}: ${hits.length} planets with that name`)
  return { id: hits[0].id }
}

export function evaluate(r: RouteResult, hazards: Hazard[]) {
  const band = bandOf(r)
  return { route: r, difficulty: difficulty(r, hazards), band, bandName: CONFIG.bands[band].name, time: CONFIG.bands[band].time }
}

/** The lanes route and, at >= CONFIG.shortcutRatio x the straight line, the direct jump; both with their difficulty. */
export function runTrip(graph: Graph, hazards: Hazard[], t: Trip) {
  const p = plan(graph, endpoint(graph, t.from), endpoint(graph, t.to))
  return { trip: t, ratio: p.ratio, primary: evaluate(p.primary, hazards), shortcut: p.shortcut ? evaluate(p.shortcut, hazards) : null }
}
