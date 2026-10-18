'use client'

import { RichText } from '@/components/ui/RichText'
import type { DifficultyResult, RouteResult } from '@/lib/astrogation'
import styles from './galaxy.module.css'

interface TravelTime { hours: number; text: string; bandCheck: string }

interface CardProps {
  title: string
  /** the hop route is the risky alternative */
  risky?: boolean
  route: RouteResult
  diff: DifficultyResult
  time: TravelTime
  selected: boolean
  onSelect: () => void
}

const pct = (n: number) => `${Math.round(n * 100)}%`
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/** The app's own dice glyphs, via the [difficulty:N][challenge:N] shortcodes RichText already renders. */
function poolText(p: { purple: number; red: number }): string {
  return `${p.purple > 0 ? `[difficulty:${p.purple}]` : ''}${p.red > 0 ? `[challenge:${p.red}]` : ''}`
}

export function RouteCard({ title, risky, route, diff, time, selected, onSelect }: CardProps) {
  const pool = poolText(diff.pool)
  const why: [string, string][] = [
    ['Distance band', signed(diff.distanceTerm)],
    ['Region density', signed(diff.densityTerm)],
  ]
  if (diff.minorTerm) why.push(['Minor lanes', signed(diff.minorTerm)])
  if (diff.offUpgrades) why.push(['Off-lane upgrades', signed(diff.offUpgrades)])
  if (diff.unchartedUpgrades) why.push(['Uncharted pin', signed(diff.unchartedUpgrades)])
  if (diff.excessUpgrades) why.push(['Above Formidable', signed(diff.excessUpgrades)])
  for (const h of diff.hazards) why.push([h.note ?? 'Hazard', `+${h.upgrades}`])

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.opt} ${risky ? styles.optRisky : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      data-testid={risky ? 'card-hop' : 'card-lane'}
    >
      <div className={styles.oh}>
        <span>{title}</span>
        <span>{Math.round(route.lengthLy).toLocaleString()} ly</span>
      </div>
      <div className={styles.eta}>
        <span className={styles.t}>{time.text}</span>
        <span className={styles.c}>GM shifts with Advantage / Threat</span>
      </div>
      <div className={styles.ob}>
        <div className={styles.diff}>
          <span className={styles.name}>{diff.difficulty}</span>
          {pool ? <RichText text={pool} /> : <span className={styles.none}>no dice</span>}
        </div>
        <div className={styles.share} aria-hidden="true">
          {/* widths are the route's measured shares, runtime data */}
          <i className={styles.shMaj} style={{ width: pct(route.share.major) }} />
          <i className={styles.shMin} style={{ width: pct(route.share.minor) }} />
          <i className={styles.shOff} style={{ width: pct(route.share.off) }} />
        </div>
        <dl className={styles.stats}>
          <div><dt>Major / minor</dt><dd>{pct(route.share.major)} / {pct(route.share.minor)}</dd></div>
          <div><dt>Off-lane</dt><dd>{pct(route.share.off)}</dd></div>
          <div><dt>Table 7-14</dt><dd>{time.bandCheck}</dd></div>
          <div><dt>Stops</dt><dd>{route.stops.filter(s => !s.dropoff).length}</dd></div>
        </dl>
        <ul className={styles.why}>
          {why.map(([k, v]) => (
            <li key={k}><span>{k}</span><em>{v}</em></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Stops of the selected route, joined by a rail coloured by the leg that arrives at each stop. */
export function StopList({ route, hop }: { route: RouteResult; hop: boolean }) {
  const arrive = new Map(route.legs.map(l => [l.to, l]))
  return (
    <div className={styles.stops}>
      <h2>Stops</h2>
      <ol>
        {route.stops.map((s, i) => {
          const leg = arrive.get(s.id)
          const cls = !leg ? '' : leg.kind === 'lane' ? (leg.class === 'major' ? styles.cMaj : styles.cMin) : hop ? styles.cHop : styles.cOff
          const end = i === 0 || i === route.stops.length - 1
          return (
            <li key={s.id + i} className={cls}>
              <span className={end ? styles.end : undefined}>{s.name}</span>
              {leg && <span className={styles.rt}>{leg.kind === 'lane' ? leg.route : hop ? 'hop' : 'off-lane'}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
