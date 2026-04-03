'use client'

import { useState } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_LABEL, FS_SM, FS_H3 } from './design-tokens'
import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import { DiceText } from '@/components/dice/DiceText'

// ── Force colour ──────────────────────────────────────────────────────────────
const FORCE_BLUE      = '#7EC8E3'
const FORCE_BLUE_DIM  = 'rgba(126,200,227,0.35)'
const FORCE_BLUE_GLOW = 'rgba(126,200,227,0.18)'
const DARK_PURPLE     = '#8B2BE2'
const DARK_PURPLE_DIM = 'rgba(139,43,226,0.35)'
const DARK_PURPLE_GLOW = 'rgba(139,43,226,0.18)'

// ── Dark side fallen pulse animation ─────────────────────────────────────────
const FALLEN_PULSE_STYLE = `
@keyframes fallenPulse {
  0%, 100% { box-shadow: 0 0 14px rgba(139,43,226,0.12); }
  50%       { box-shadow: 0 0 22px rgba(139,43,226,0.28); }
}
.force-rating-fallen { animation: fallenPulse 3s ease-in-out infinite; }
`

// ── Exported Types ────────────────────────────────────────────────────────────

/** @deprecated prefer ForcePowerDisplay */
export interface ForcePowerSummary {
  powerKey:       string
  powerName:      string
  purchasedCount: number
  totalCount:     number
}

export interface ForceAbilityDisplay {
  key:            string
  name:           string
  description?:   string
  purchasedRanks: number   // 0 = not purchased; >0 = number of ranks bought
  totalRanks:     number   // how many times this ability appears in the tree
  cost:           number   // XP cost per rank (first occurrence)
}

export interface ForcePowerDisplay {
  powerKey:        string
  powerName:       string
  description?:    string
  purchasedCount:  number
  totalCount:      number
  abilities:       ForceAbilityDisplay[]
  treeNodes:       ForceTreeNode[]
  treeConnections: ForceTreeConnection[]
}

export interface ConflictEntry {
  id:            string
  description?:  string
  session_label?: string
  is_resolved:   boolean
  created_at:    string
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ForcePanelProps {
  forceRating:         number
  committedForce?:     number
  moralityValue:       number
  moralityStrength:    string
  moralityWeakness:    string
  moralityConfigured?: boolean
  forcePowers:         ForcePowerDisplay[]
  conflicts?:          ConflictEntry[]
  xpAvailable?:        number
  onPurchasePower?:    (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => void
  onViewPower:         (powerKey: string) => void
  onAdd:               () => void
  isFallen?:           boolean
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CornerBrackets({ color = C.gold }: { color?: string }) {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

function ForceRatingCard({
  forceRating,
  committedForce,
  isFallen = false,
}: {
  forceRating: number
  committedForce: number
  isFallen?: boolean
}) {
  const available = Math.max(0, forceRating - committedForce)
  const accent     = isFallen ? DARK_PURPLE      : FORCE_BLUE
  const accentDim  = isFallen ? DARK_PURPLE_DIM  : FORCE_BLUE_DIM
  const accentGlow = isFallen ? DARK_PURPLE_GLOW : FORCE_BLUE_GLOW

  return (
    <>
      {isFallen && <style>{FALLEN_PULSE_STYLE}</style>}
      <div
        className={isFallen ? 'force-rating-fallen' : undefined}
        style={{
          ...panelBase,
          padding: '14px 12px',
          textAlign: 'center',
          border: `1px solid ${accentDim}`,
          boxShadow: `0 0 18px ${accentGlow}`,
        }}
      >
        <CornerBrackets color={accent} />

        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: accent, marginBottom: 4, opacity: 0.8,
        }}>
          Force Rating
        </div>

        <div style={{
          fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700,
          color: accent, lineHeight: 1,
          textShadow: `0 0 20px ${accentGlow}`,
        }}>
          {forceRating}
        </div>

        {/* Dark Side badge for fallen characters */}
        {isFallen && (
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            marginTop: 6, padding: '2px 8px',
            background: 'rgba(139,43,226,0.1)',
            border: '1px solid rgba(139,43,226,0.35)',
            borderRadius: 4,
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono','Courier New',monospace",
              fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'rgba(139,43,226,0.7)',
            }}>
              ☠ DARK SIDE USER
            </span>
          </div>
        )}

        {/* Pip row */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 8, marginBottom: 10 }}>
          {Array.from({ length: Math.max(forceRating, 1) }).map((_, i) => {
            const isCommitted = i >= available
            const isFilled    = i < forceRating
            return (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: !isFilled
                  ? 'transparent'
                  : isCommitted
                  ? `${accent}40`
                  : accent,
                border: `1px solid ${isFilled ? accent : C.border}`,
                boxShadow: isFilled && !isCommitted ? `0 0 5px ${accentGlow}` : 'none',
              }} />
            )
          })}
        </div>

        {committedForce > 0 && (
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
            color: `${accent}90`, marginBottom: 8,
          }}>
            {available} available · {committedForce} committed
          </div>
        )}

        {/* Light / Dark legend */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8E8FF', boxShadow: '0 0 4px #E8E8FF' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: 'rgba(232,232,255,0.6)' }}>Light</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a2e', border: '1px solid #6060A0' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: 'rgba(96,96,160,0.8)' }}>Dark</span>
          </div>
        </div>
      </div>
    </>
  )
}

function MoralityCard({
  moralityValue,
  moralityStrength,
  moralityWeakness,
  isFallen = false,
}: {
  moralityValue: number
  moralityStrength: string
  moralityWeakness: string
  isFallen?: boolean
}) {
  const scoreColor = isFallen ? DARK_PURPLE : C.gold

  return (
    <div style={{ ...panelBase, padding: '14px 12px', textAlign: 'center' }}>
      <CornerBrackets />

      <div style={{
        fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: C.textDim, marginBottom: 4,
      }}>
        Morality
      </div>

      <div style={{
        fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700,
        color: scoreColor, lineHeight: 1, marginBottom: 8,
        textShadow: isFallen ? '0 0 12px rgba(139,43,226,0.4)' : 'none',
      }}>
        {moralityValue}
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: 6, background: C.textFaint, borderRadius: 3, marginBottom: 6 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3,
          width: `${Math.min(100, Math.max(0, moralityValue))}%`,
          background: 'linear-gradient(90deg, #E05050 0%, #C8AA50 45%, #4EC87A 70%, #7EC8E3 100%)',
          transition: 'width .3s ease',
        }} />
        <div style={{
          position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
          left: `${Math.min(100, Math.max(0, moralityValue))}%`,
          width: 10, height: 10, borderRadius: '50%',
          background: C.gold, border: `2px solid ${C.bg}`,
          boxShadow: `0 0 6px ${C.gold}`,
          transition: 'left .3s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          color: '#E05050', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {moralityWeakness || 'Weakness'}
        </span>
        <span style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          color: FORCE_BLUE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {moralityStrength || 'Strength'}
        </span>
      </div>
    </div>
  )
}

function ConflictPips({ conflicts, isFallen = false }: { conflicts: ConflictEntry[]; isFallen?: boolean }) {
  const activeConflicts   = conflicts.filter(c => !c.is_resolved)
  const resolvedConflicts = conflicts.filter(c => c.is_resolved)
  const total = conflicts.length
  if (total === 0) return null

  const labelText  = isFallen ? 'Light Side Conflict' : 'Conflict'
  const labelColor = isFallen ? 'rgba(220,230,240,0.45)' : C.textDim

  return (
    <div style={{ ...panelBase, padding: '12px 14px' }}>
      <CornerBrackets />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: labelColor,
        }}>
          {labelText}
        </div>
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          color: activeConflicts.length > 0 ? '#E07050' : C.textDim,
        }}>
          {activeConflicts.length} unresolved
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {conflicts.map((c, i) => {
          const baseDesc = c.description ?? `Conflict ${i + 1}${c.session_label ? ` — ${c.session_label}` : ''}`
          const tooltip  = isFallen && !c.is_resolved
            ? `Light Side Conflict\n─────────────────────\n${baseDesc}`
            : baseDesc
          return (
            <div
              key={c.id}
              title={tooltip}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: c.is_resolved
                  ? 'transparent'
                  : isFallen
                    ? 'rgba(220,230,240,0.85)'
                    : 'rgba(224,112,80,0.9)',
                border: c.is_resolved
                  ? `1px solid ${C.border}`
                  : isFallen
                    ? '1px solid rgba(200,215,230,0.9)'
                    : '1px solid #E07050',
                boxShadow: c.is_resolved
                  ? 'none'
                  : isFallen
                    ? '0 0 4px rgba(220,230,240,0.5)'
                    : '0 0 4px rgba(224,112,80,0.5)',
                cursor: 'default',
              }}
            />
          )
        })}
        {resolvedConflicts.length > 0 && activeConflicts.length > 0 && (
          <span style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
            color: C.textFaint, alignSelf: 'center', marginLeft: 2,
          }}>
            ({resolvedConflicts.length} resolved)
          </span>
        )}
      </div>
    </div>
  )
}

function ForcePowerCard({
  fp,
  xpAvailable,
  onPurchase,
}: {
  fp: ForcePowerDisplay
  xpAvailable?: number
  onPurchase?: (abilityKey: string, row: number, col: number, cost: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [headerHovered, setHeaderHovered] = useState(false)
  const pct = fp.totalCount > 0 ? (fp.purchasedCount / fp.totalCount) * 100 : 0
  const description = fp.description ?? undefined

  return (
    <div
      style={{
        ...panelBase,
        padding: 0,
        border: `1px solid ${FORCE_BLUE_DIM}`,
        overflow: 'hidden',
        transition: 'border-color .15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = FORCE_BLUE }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = FORCE_BLUE_DIM }}
    >
      {/* Header row — clickable toggle */}
      <div
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          background: headerHovered ? 'rgba(126,200,227,0.06)' : 'transparent',
          transition: 'background .15s',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: C.textDim, fontSize: 10, flexShrink: 0 }}>
            {expanded ? '▼' : '▶'}
          </span>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600,
            color: C.text, flex: 1, minWidth: 0,
          }}>
            {fp.powerName}
          </div>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: FORCE_BLUE, flexShrink: 0 }}>
            {fp.purchasedCount}/{fp.totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: C.textFaint, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${FORCE_BLUE}, #B070D8)`,
            borderRadius: 2, transition: 'width .4s ease',
          }} />
        </div>
      </div>

      {/* Description + upgrade tree — only rendered when expanded */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${FORCE_BLUE_DIM}`,
          padding: '8px 0 0',
          background: 'rgba(126,200,227,0.04)',
        }}>
          {description && (
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
              color: C.textDim, marginBottom: 8, lineHeight: 1.45,
              padding: '0 12px',
            }}>
              <DiceText text={description} />
            </div>
          )}

          {fp.treeNodes.length > 0 && (
            <ForcePowerTree
              powerName={fp.powerName}
              nodes={fp.treeNodes}
              connections={fp.treeConnections}
              purchasedCount={fp.purchasedCount}
              totalCount={fp.totalCount}
              xpAvailable={xpAvailable}
              onPurchase={onPurchase}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function ForcePanel({
  forceRating,
  committedForce = 0,
  moralityValue,
  moralityStrength,
  moralityWeakness,
  moralityConfigured,
  forcePowers,
  conflicts = [],
  xpAvailable,
  onPurchasePower,
  onViewPower,
  onAdd,
  isFallen = false,
}: ForcePanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top row: Force Rating + Morality side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ForceRatingCard
          forceRating={forceRating}
          committedForce={committedForce}
          isFallen={isFallen}
        />
        {moralityConfigured !== false && moralityValue !== undefined ? (
          <MoralityCard
            moralityValue={moralityValue}
            moralityStrength={moralityStrength}
            moralityWeakness={moralityWeakness}
            isFallen={isFallen}
          />
        ) : (
          <div style={{
            ...panelBase,
            padding: '14px 12px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: 0.6,
          }}>
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
              color: C.textDim, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Morality not configured
            </div>
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
              color: C.textFaint, textAlign: 'center',
            }}>
              GM setup required
            </div>
          </div>
        )}
      </div>

      {/* Conflict pips */}
      {conflicts.length > 0 && <ConflictPips conflicts={conflicts} isFallen={isFallen} />}

      {/* Force Powers */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, paddingBottom: 6,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDim,
          }}>
            Force Powers
          </div>
          <button
            onClick={onAdd}
            style={{
              background: 'rgba(200,170,80,0.08)',
              border: `1px solid rgba(200,170,80,0.3)`,
              borderRadius: 3, padding: '2px 10px',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
              fontWeight: 700, letterSpacing: '0.1em',
              color: C.gold, cursor: 'pointer',
              transition: '.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.16)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
          >
            + Add
          </button>
        </div>

        {forcePowers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {forcePowers.map(fp => (
              <ForcePowerCard
                key={fp.powerKey}
                fp={fp}
                xpAvailable={xpAvailable}
                onPurchase={onPurchasePower
                  ? (abilityKey, row, col, cost) => onPurchasePower(abilityKey, row, col, cost, fp.powerKey)
                  : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 12, padding: '28px 0',
          }}>
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint,
            }}>
              No force powers purchased yet.
            </div>
            <button
              onClick={onAdd}
              style={{
                background: FORCE_BLUE_GLOW,
                border: `1px solid ${FORCE_BLUE_DIM}`,
                borderRadius: 4, padding: '8px 20px',
                fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: FORCE_BLUE, cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(126,200,227,0.24)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = FORCE_BLUE_GLOW }}
            >
              Browse Force Powers
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
