'use client'
import { useMemo, useState } from 'react'
import { COLOR, EASE, FONT_BODY, FONT_DISPLAY, FS, HUD, RADIUS, SP } from '@/lib/tokens'
import type { HudTalent } from '@/lib/types'

interface MobileTalentsScreenProps {
  hudTalents: HudTalent[]
}

// ── Filter definitions ─────────────────────────────────────────────────────

type FilterKey = 'all' | 'passive' | 'active' | 'incidental' | 'oot'

interface FilterDef {
  key: FilterKey
  label: string
}

const FILTERS: FilterDef[] = [
  { key: 'all',        label: 'All'        },
  { key: 'passive',    label: 'Passive'    },
  { key: 'active',     label: 'Active'     },
  { key: 'incidental', label: 'Incidental' },
  { key: 'oot',        label: 'OOT'        },
]

function matchesFilter(t: HudTalent, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':        return true
    case 'passive':    return t.activation === 'taPassive'
    case 'active':     return t.activation === 'taAction' || t.activation === 'taManeuver'
    case 'incidental': return t.activation === 'taIncidental'
    case 'oot':        return t.activation === 'taIncidentalOOT'
  }
}

// ── Sort order ─────────────────────────────────────────────────────────────

const SORT_ORDER: Record<string, number> = {
  taIncidentalOOT: 0,
  taAction:        1,
  taManeuver:      2,
  taIncidental:    3,
  taPassive:       4,
}

// ── Type styling ───────────────────────────────────────────────────────────

interface TalentTypeStyle {
  borderColor: string
  labelColor: string
  labelText: string
}

function getTalentTypeStyle(activation: string): TalentTypeStyle {
  switch (activation) {
    case 'taPassive':
      return {
        borderColor: 'color-mix(in srgb, var(--blue) 40%, transparent)',
        labelColor:  COLOR.blue,
        labelText:   'Passive',
      }
    case 'taAction':
      return {
        borderColor: 'color-mix(in srgb, var(--hud-accent) 40%, transparent)',
        labelColor:  'var(--hud-accent)',
        labelText:   'Action',
      }
    case 'taManeuver':
      return {
        borderColor: 'color-mix(in srgb, var(--hud-gold) 40%, transparent)',
        labelColor:  HUD.gold,
        labelText:   'Maneuver',
      }
    case 'taIncidental':
      return {
        borderColor: 'color-mix(in srgb, var(--hud-border-hi) 80%, transparent)',
        labelColor:  HUD.textFaint,
        labelText:   'Incidental',
      }
    case 'taIncidentalOOT':
      return {
        borderColor: 'color-mix(in srgb, var(--die-difficulty) 40%, transparent)',
        labelColor:  'var(--die-difficulty)',
        labelText:   'Out of Turn',
      }
    default:
      return {
        borderColor: 'color-mix(in srgb, var(--hud-border) 40%, transparent)',
        labelColor:  HUD.textFaint,
        labelText:   activation,
      }
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function MobileTalentsScreen({ hudTalents }: MobileTalentsScreenProps) {
  const [filter, setFilter]     = useState<FilterKey>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const sorted = useMemo(() => {
    return [...hudTalents]
      .filter(t => matchesFilter(t, filter))
      .sort((a, b) => {
        const ao = SORT_ORDER[a.activation] ?? 99
        const bo = SORT_ORDER[b.activation] ?? 99
        if (ao !== bo) return ao - bo
        return a.name.localeCompare(b.name)
      })
  }, [hudTalents, filter])

  function toggleExpanded(key: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Filter strip ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: SP[1],
        padding: `${SP[1]} ${SP[2]}`,
        overflowX: 'auto',
        flexShrink: 0,
        borderBottom: `1px solid ${HUD.border}`,
      }}>
        {FILTERS.map(f => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                fontFamily:    FONT_BODY,
                fontSize:      FS.overline,
                color:         active ? HUD.text : HUD.textFaint,
                background:    active
                  ? 'color-mix(in srgb, var(--hud-accent) 20%, transparent)'
                  : 'transparent',
                border:        active
                  ? `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`
                  : `1px solid ${HUD.border}`,
                borderRadius:  RADIUS.full,
                padding:       `2px ${SP[2]}`, /* 2px — minimum touch geometry */
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                flexShrink:    0,
                transition:    EASE.quick,
              }}
            >
              {f.label}
            </button>
          )
        })}

        {/* Talent count */}
        <div style={{
          marginLeft:    'auto',
          flexShrink:    0,
          fontFamily:    FONT_BODY,
          fontSize:      FS.overline,
          color:         HUD.textFaint,
          whiteSpace:    'nowrap',
        }}>
          {sorted.length} talent{sorted.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Talent list ── */}
      <div style={{
        flex:           1,
        overflowY:      'auto',
        display:        'flex',
        flexDirection:  'column',
        gap:            SP[1],
        padding:        `${SP[1]} ${SP[2]}`,
      }}>
        {sorted.length === 0 ? (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize:   FS.sm,
            color:      HUD.textFaint,
            textAlign:  'center',
            paddingTop: SP[4],
          }}>
            No talents in this category.
          </div>
        ) : (
          sorted.map(talent => {
            const typeStyle  = getTalentTypeStyle(talent.activation)
            const isExpanded = expanded.has(talent.key)
            const showRank   = talent.rank > 1

            return (
              <button
                key={talent.key}
                onClick={() => toggleExpanded(talent.key)}
                style={{
                  display:         'flex',
                  flexDirection:   'column',
                  gap:             SP[1],
                  padding:         `${SP[1]} ${SP[2]}`,
                  background:      'color-mix(in srgb, var(--hud-panel) 80%, transparent)',
                  border:          `1px solid ${HUD.border}`,
                  borderLeft:      `3px solid ${typeStyle.borderColor}`,
                  borderRadius:    RADIUS.md,
                  cursor:          'pointer',
                  textAlign:       'left',
                  transition:      EASE.quick,
                }}
              >
                {/* Header row */}
                <div style={{
                  display:        'flex',
                  flexDirection:  'row',
                  alignItems:     'center',
                  gap:            SP[1],
                  minWidth:       0,
                }}>
                  {/* Talent name */}
                  <span style={{
                    fontFamily:  FONT_DISPLAY,
                    fontSize:    FS.sm,
                    fontWeight:  700,
                    color:       HUD.text,
                    flex:        1,
                    minWidth:    0,
                    overflow:    'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:  'nowrap',
                  }}>
                    {talent.name}
                    {showRank && (
                      <span style={{
                        marginLeft: SP[1],
                        fontFamily: FONT_BODY,
                        fontSize:   FS.overline,
                        color:      HUD.gold,
                        fontWeight: 400,
                      }}>
                        ×{talent.rank}
                      </span>
                    )}
                  </span>

                  {/* Type badge */}
                  <span style={{
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.overline,
                    color:         typeStyle.labelColor,
                    flexShrink:    0,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {typeStyle.labelText}
                  </span>
                </div>

                {/* Description — shown when expanded */}
                {isExpanded && talent.description && (
                  <div style={{
                    fontFamily:  FONT_BODY,
                    fontSize:    FS.sm,
                    color:       HUD.textDim,
                    lineHeight:  1.5,
                    textAlign:   'left',
                  }}>
                    {talent.description}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
