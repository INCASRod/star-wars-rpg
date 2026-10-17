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
 * Route sets difficulty (purple dice), risk sets upgrades (red). Purple = max(0, distance band + density) + minor lane; off-lane legs add none.
 * Density (route.density) is the length-weighted mean of the legs: Core +1, Rim -1.
 * Upgrades: off-lane share of length, an uncharted pin endpoint, difficulty above Formidable, and hazards (reported separately).
 * Each upgrade turns a purple die red; with none left it adds a purple die instead (AoE "Upgrading More Dice Than Available").
 */
export function difficulty(route: RouteResult, hazards: Hazard[], config: Config = CONFIG): DifficultyResult {
  const d = config.difficulty
  const s = route.share
  const minorTerm = s.minor > 0 ? d.minorLane : 0
  const distanceTerm = d.distance[bandOf(route, config)]
  const densityTerm = route.density
  const raw = d.base + Math.max(0, distanceTerm + densityTerm) + minorTerm
  let offUpgrades = 0
  if (s.off > 0) {
    offUpgrades = s.off < d.offQuarter ? d.offUpgrades.underQuarter : s.off <= d.offTwoThirds ? d.offUpgrades.quarterToTwoThirds : d.offUpgrades.overTwoThirds
  }
  const unchartedUpgrades = route.uncharted ? d.unchartedUpgrades : 0
  const excessUpgrades = Math.max(0, raw - d.formidableAt)
  const onRoute = new Set(route.stops.map(x => x.id))
  const hit = hazards.filter(h => onRoute.has(h.system))
  const hazardUpgrades = hit.reduce((t, h) => t + h.upgrades, 0)
  const totalUpgrades = offUpgrades + unchartedUpgrades + excessUpgrades + hazardUpgrades
  let purple = Math.min(raw, d.formidableAt)
  let red = 0
  for (let i = 0; i < totalUpgrades; i++) {
    if (purple > 0) {
      purple -= 1
      red += 1
    } else {
      purple += 1
    }
  }
  return {
    raw,
    minorTerm,
    distanceTerm,
    densityTerm,
    offUpgrades,
    unchartedUpgrades,
    excessUpgrades,
    hazardUpgrades,
    hazards: hit,
    totalUpgrades,
    pool: { purple, red },
    difficulty: d.names[Math.min(purple + red, d.formidableAt)],
  }
}

/** Whole hours: under 48 "N hours", else "D days, H hours" (0 hours omitted). Rounds to the hour, at least 1. */
export function formatTravelTime(hours: number): string {
  const h = Math.max(1, Math.round(hours))
  const unit = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`
  if (h < 48) return unit(h, 'hour')
  const days = Math.floor(h / 24)
  const rest = h % 24
  return rest ? `${unit(days, 'day')}, ${unit(rest, 'hour')}` : unit(days, 'day')
}

/**
 * ONE definite travel time: leg lengths x CONFIG.hoursPerPx at class 1, x the ship's hyperdrive class (0.5, 1, 2, 3, 4). The GM shifts it with
 * Advantage / Threat. `bandCheck` is the Table 7-14 band for the two ends, shown only as a sanity check.
 */
export function travelTime(route: RouteResult, hyperdrive = 1, config: Config = CONFIG): { hours: number; text: string; bandCheck: string } {
  const hours = route.hours * hyperdrive
  const band = config.bands[bandOf(route, config)]
  return { hours, text: formatTravelTime(hours), bandCheck: `${band.name}: ${band.time}` }
}
