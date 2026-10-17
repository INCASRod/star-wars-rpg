import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchAllRows } from '../fetchAllRows'
import type { Graph, Hazard } from './types'

/** Light-years per DK map pixel (calibrated from the DK grid; data/astrogation/wook/graph.json meta). */
export const LY_PER_PX = 34.3441

export interface RefSystemRow {
  id: string
  name: string
  x: number
  y: number
  region: string | null
  sector: string | null
  on_lane: boolean
}

export interface RefHyperlaneRow {
  a: string
  b: string
  route_name: string
  lane_class: 'major' | 'minor'
  length_px: number
}

export interface RefNavHazardRow {
  system_id: string
  upgrades: number
  note: string | null
}

export interface Galaxy {
  graph: Graph
  hazards: Hazard[]
}

/** Rows -> the engine's graph. Pure: this is what `loadGalaxy` does after the three reads. */
export function buildGalaxy(systems: RefSystemRow[], lanes: RefHyperlaneRow[], hazards: RefNavHazardRow[]): Galaxy {
  return {
    graph: {
      meta: { ly_per_px: LY_PER_PX },
      nodes: systems.map(s => ({ id: s.id, name: s.name, x: s.x, y: s.y, region: s.region, sector: s.sector, on_lane: s.on_lane })),
      edges: lanes.map(l => ({ a: l.a, b: l.b, route: l.route_name, class: l.lane_class, length_px: l.length_px })),
    },
    hazards: hazards.map(h => ({ system: h.system_id, upgrades: h.upgrades, ...(h.note ? { note: h.note } : {}) })),
  }
}

let cached: Promise<Galaxy> | null = null

/** Reads ref_systems, ref_hyperlanes and ref_nav_hazards once per session and caches the built graph. A failed load is not cached. */
export function loadGalaxy(supabase: SupabaseClient): Promise<Galaxy> {
  if (!cached) {
    cached = (async () => {
      const [systems, lanes, hazards] = await Promise.all([
        fetchAllRows<RefSystemRow>((from, to) => supabase.from('ref_systems').select('id,name,x,y,region,sector,on_lane').order('id').range(from, to)),
        fetchAllRows<RefHyperlaneRow>((from, to) => supabase.from('ref_hyperlanes').select('a,b,route_name,lane_class,length_px').order('id').range(from, to)),
        fetchAllRows<RefNavHazardRow>((from, to) => supabase.from('ref_nav_hazards').select('system_id,upgrades,note').order('system_id').range(from, to)),
      ])
      if (systems.length === 0) throw new Error('ref_systems is empty or could not be read')
      return buildGalaxy(systems, lanes, hazards)
    })().catch(err => {
      cached = null
      throw err
    })
  }
  return cached
}
