'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import { SYM, SYM_COLOR, type SymbolKey, type DiceType } from '@/lib/tokens'
import type { RollEntry } from '@/hooks/useRollFeed'

// Destiny light/dark identity — sealed exception, same hex DestinyPoolDisplay.tsx
// (desktop) uses, so a light/dark token reads identically everywhere in the app.
const DESTINY_LIGHT = '#0EA5E9'
const DESTINY_DARK  = '#A845F5'

export interface MobilePartyDestinationProps {
  characterId: string
  destinyPool: Array<'light' | 'dark'>
  pendingSpend: number | null
  onSpendDestiny: (idx: number) => void
  rolls: RollEntry[]
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function outcomeWord(netSuccess: number): { label: string; cls: string } {
  if (netSuccess > 0) return { label: 'Success', cls: 'is-success' }
  if (netSuccess < 0) return { label: 'Failure', cls: 'is-failure' }
  return { label: 'Wash', cls: '' }
}

function NetPills({ result }: { result: RollEntry['result'] }) {
  const entries: [SymbolKey, number][] = [
    ['S', result.netSuccess], ['A', result.netAdvantage], ['T', result.triumph], ['D', result.despair],
  ]
  return (
    <>
      {entries.map(([key, count]) => {
        if (count === 0) return null
        const sym = SYM[key]
        const label = key === 'S' ? (count > 0 ? 'Success' : 'Failure')
          : key === 'A' ? (count > 0 ? 'Advantage' : 'Threat')
          : key === 'T' ? 'Triumph' : 'Despair'
        return (
          <span key={key} className="m-cr-pill" style={{ color: sym.color, borderColor: sym.color /* symbol-identity colour — sealed namespace */ }}>
            {Math.abs(count)} {label}
          </span>
        )
      })}
    </>
  )
}

function DicePoolRow({ pool }: { pool: RollEntry['pool'] }) {
  const order: DiceType[] = ['proficiency', 'ability', 'boost', 'difficulty', 'challenge', 'setback']
  const dice = order.flatMap(type => Array.from({ length: pool[type] ?? 0 }).map((_, i) => (
    <DiceFace key={`${type}-${i}`} type={type} size={20} />
  )))
  if (dice.length === 0) return null
  return <div className="m-feed-dice-row">{dice}</div>
}

interface ForceRollMeta {
  power_name?: string
  activated_upgrades?: { name: string; fp_cost?: number; is_dark?: boolean }[]
  dark_pips_used?: number
  strain_cost?: number
  dice_results?: { light: number; dark: number }[]
}

function ForceFeedCard({ roll, isOwn }: { roll: RollEntry; isOwn: boolean }) {
  const meta = (roll.roll_meta ?? null) as ForceRollMeta | null
  const powerName = meta?.power_name ?? roll.weapon_name ?? roll.roll_label ?? 'Force Power'
  const activated = meta?.activated_upgrades ?? []
  // Hand-mapped fields from desktop's write path — read the same way desktop's
  // ForceCard does (roll_meta, not result.netAdvantage/netSuccess) so the
  // known write-side quirk (netAdvantage carrying totalDark) never surfaces here.
  const darkUsed = meta?.dark_pips_used ?? roll.result.triumph
  const strainCost = meta?.strain_cost ?? (darkUsed > 0 ? darkUsed : 0)
  const diceResults = meta?.dice_results ?? []

  return (
    <div className={`m-feed-card${isOwn ? ' is-own' : ''}`}>
      <div className="m-feed-head">
        <span className="m-feed-name">{roll.character_name}</span>
        <span className="m-feed-time">{relativeTime(roll.rolled_at)}</span>
      </div>
      <div className="m-feed-body">
        <div className="m-feed-label">{powerName}</div>
        <div className="m-feed-dice-row">
          {diceResults.map((d, i) => (
            <span key={i} className="m-feed-force-die">
              {d.light === 0 && d.dark === 0 && '—'}
              {d.light > 0 && <span style={{ color: SYM_COLOR.lightPip /* Force light pip — sealed dice-identity colour */ }}>{'✦'.repeat(d.light)}</span>}
              {d.dark > 0 && <span style={{ color: SYM_COLOR.darkPip /* Force dark pip — sealed dice-identity colour */ }}>{'✧'.repeat(d.dark)}</span>}
            </span>
          ))}
        </div>
        {activated.length > 0 && (
          <div className="m-weapon-qualities" style={{ marginTop: 4 }}>
            {activated.map((u, i) => <span key={i} className="m-quality-chip">{u.name}</span>)}
          </div>
        )}
        {darkUsed > 0 && strainCost > 0 && (
          <div className="m-force-dark-warning">⚠ {strainCost} strain suffered · Destiny Point flipped</div>
        )}
      </div>
    </div>
  )
}

function StandardFeedCard({ roll, isOwn }: { roll: RollEntry; isOwn: boolean }) {
  const outcome = outcomeWord(roll.result.netSuccess)
  return (
    <div className={`m-feed-card${isOwn ? ' is-own' : ''}`}>
      <div className="m-feed-head">
        <span className="m-feed-name">{roll.character_name}</span>
        <span className="m-feed-time">{relativeTime(roll.rolled_at)}</span>
      </div>
      <div className="m-feed-body">
        {roll.roll_label && <div className="m-feed-label">{roll.roll_label}</div>}
        <div className="m-feed-outcome-row">
          <span className={`m-feed-outcome ${outcome.cls}`}>{outcome.label}</span>
          <NetPills result={roll.result} />
        </div>
        <DicePoolRow pool={roll.pool} />
      </div>
    </div>
  )
}

function classify(entry: RollEntry): 'force' | 'initiative' | 'system' | 'standard' {
  if (entry.roll_type === 'force') return 'force'
  if (entry.roll_type === 'initiative') return 'initiative'
  if (entry.roll_type === 'system' || entry.roll_type === 'Item Award' || entry.roll_type === 'XP Purchase' || entry.alignment === 'system') return 'system'
  const nonForce = (Object.entries(entry.pool) as [DiceType, number][]).reduce((s, [t, n]) => t === 'force' ? s : s + (n ?? 0), 0)
  if ((entry.pool.force ?? 0) > 0 && nonForce === 0) return 'force'
  return 'standard'
}

export function MobilePartyDestination({ characterId, destinyPool, pendingSpend, onSpendDestiny, rolls }: MobilePartyDestinationProps) {
  // Newest first, hidden rolls stripped — the exact rule RollFeedPanel.tsx
  // applies for a non-GM viewer (`!isGm ? ... .filter(r => !r.hidden)`).
  // Mobile is always the player's own device, so this filter is unconditional.
  const visible = [...rolls].reverse().filter(r => !r.hidden)

  const lightCount = destinyPool.filter(t => t === 'light').length
  const darkCount = destinyPool.filter(t => t === 'dark').length

  return (
    <div className="m-abilities">
      <div className="m-destiny-bar">
        <span className="m-destiny-label">Destiny</span>
        {destinyPool.length === 0 ? (
          <span className="m-destiny-empty">No destiny pool this session</span>
        ) : (
          <>
            <span className="m-destiny-group">
              {destinyPool.map((t, i) => t === 'light' && (
                <button
                  key={i}
                  type="button"
                  className={`m-destiny-pip${pendingSpend === i ? ' is-armed' : ''}`}
                  style={{ background: `color-mix(in srgb, ${DESTINY_LIGHT} 20%, transparent)`, color: DESTINY_LIGHT /* destiny light identity — sealed */ }}
                  onClick={() => onSpendDestiny(i)}
                  aria-label={pendingSpend === i ? 'Confirm spend light destiny point' : 'Spend light destiny point'}
                >
                  ○
                </button>
              ))}
            </span>
            <span className="m-destiny-group">
              {destinyPool.map((t, i) => t === 'dark' && (
                <button
                  key={i}
                  type="button"
                  className={`m-destiny-pip${pendingSpend === i ? ' is-armed' : ''}`}
                  style={{ background: `color-mix(in srgb, ${DESTINY_DARK} 20%, transparent)`, color: DESTINY_DARK /* destiny dark identity — sealed */ }}
                  onClick={() => onSpendDestiny(i)}
                  aria-label={pendingSpend === i ? 'Confirm spend dark destiny point' : 'Spend dark destiny point'}
                >
                  ●
                </button>
              ))}
            </span>
            <span className="m-weapon-stats">{lightCount} Light · {darkCount} Dark</span>
          </>
        )}
      </div>

      <div className="m-deck-group-label">Roll Feed</div>
      <div className="m-feed-list">
        {visible.length === 0 ? (
          <div className="m-placeholder">
            <div className="m-placeholder-title">No rolls yet</div>
            <div className="m-placeholder-body">Rolls from you and your party will appear here.</div>
          </div>
        ) : (
          visible.map(roll => {
            const category = classify(roll)
            const isOwn = roll.character_id === characterId
            if (category === 'initiative') {
              return (
                <div key={roll.id} className="m-feed-init-row">
                  ⚙ Initiative Rolled · {roll.character_name} · {relativeTime(roll.rolled_at)}
                </div>
              )
            }
            if (category === 'system') {
              return (
                <div key={roll.id} className="m-feed-system-row">
                  ⚙ {roll.roll_label ?? 'System'} · {relativeTime(roll.rolled_at)}
                </div>
              )
            }
            if (category === 'force') return <ForceFeedCard key={roll.id} roll={roll} isOwn={isOwn} />
            return <StandardFeedCard key={roll.id} roll={roll} isOwn={isOwn} />
          })
        )}
      </div>
    </div>
  )
}
