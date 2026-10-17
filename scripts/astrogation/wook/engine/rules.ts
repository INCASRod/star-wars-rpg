import { CONFIG, type Config } from './config'
import type { DifficultyResult, Hazard, RouteResult, Stop } from './types'

/** Where a trip's two ends sit, for Table 7-14. A pin (uncharted) has neither sector nor region. */
export interface BandEnd {
  region: string | null
  sector: string | null
  pin?: boolean
}

/** AoE Core Table 7-14 band index: 0 within a sector, 1 within a region, 2 between regions, 3 across the galaxy. A pin counts as across. */
export function travelBand(a: BandEnd, b: BandEnd, config: Config = CONFIG): number {
  if (a.pin || b.pin || a.region === null || b.region === null) return 3
  if (a.sector !== null && a.sector === b.sector) return 0
  if (a.region === b.region) return 1
  const ra = config.rings[a.region]
  const rb = config.rings[b.region]
  if (ra !== undefined && rb !== undefined && Math.abs(ra - rb) >= config.acrossRingGap) return 3
  return 2
}

export function bandEnd(s: Stop): BandEnd {
  return { region: s.region, sector: s.sector, pin: s.uncharted }
}

export function bandOf(r: RouteResult, config: Config = CONFIG): number {
  if (!r.found || r.stops.length < 2) return 0
  return travelBand(bandEnd(r.stops[0]), bandEnd(r.stops[r.stops.length - 1]), config)
}

/**
 * Difficulty per brief update 2. Base Simple (0). Lane term from the route's composition, distance term from the band, +2 for an uncharted
 * endpoint. Raw above Formidable (5) = Formidable plus (raw - 5) upgrades, no cap. Hazard upgrades (a hazard system that is a stop, endpoints
 * included) are added on top and reported separately.
 */
export function difficulty(route: RouteResult, hazards: Hazard[], config: Config = CONFIG): DifficultyResult {
  const d = config.difficulty
  const s = route.share
  let laneTerm: number
  if (s.off <= 0) laneTerm = s.minor > 0 ? d.lane.anyMinor : d.lane.allMajor
  else if (s.off < d.offQuarter) laneTerm = d.lane.offUnderQuarter
  else if (s.off <= d.offTwoThirds) laneTerm = d.lane.offQuarterToTwoThirds
  else laneTerm = d.lane.offOverTwoThirds
  const distanceTerm = d.distance[bandOf(route, config)]
  const unchartedTerm = route.uncharted ? d.uncharted : 0
  const raw = d.base + laneTerm + distanceTerm + unchartedTerm
  const onRoute = new Set(route.stops.map(x => x.id))
  const hit = hazards.filter(h => onRoute.has(h.system))
  const hazardUpgrades = hit.reduce((t, h) => t + h.upgrades, 0)
  const upgrades = Math.max(0, raw - d.formidableAt)
  return {
    raw,
    laneTerm,
    distanceTerm,
    unchartedTerm,
    difficulty: d.names[Math.min(raw, d.formidableAt)],
    upgrades,
    hazardUpgrades,
    hazards: hit,
    totalUpgrades: upgrades + hazardUpgrades,
  }
}
