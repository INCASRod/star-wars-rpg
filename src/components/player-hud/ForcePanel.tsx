'use client'

import { useState } from 'react'
import { C, panelBase } from './design-tokens'
import { FONT_BODY, EASE, SP, FS, RADIUS } from '@/lib/tokens'
import type { ForceCommitment } from '@/lib/types'
import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import { RichText } from '@/components/ui/RichText'
import { Tooltip } from '@/components/ui/Tooltip'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { TickerText } from '@/components/ui/TickerText'

// ── Force colour ──────────────────────────────────────────────────────────────
const FORCE_BLUE      = 'var(--die-force)'
const FORCE_BLUE_DIM  = 'color-mix(in srgb, var(--die-force) 35%, transparent)'
const FORCE_BLUE_GLOW = 'color-mix(in srgb, var(--die-force) 18%, transparent)'
const DARK_PURPLE     = 'var(--state-activated)'
const DARK_PURPLE_DIM = 'color-mix(in srgb, var(--state-activated) 35%, transparent)'
const DARK_PURPLE_GLOW = 'color-mix(in srgb, var(--state-activated) 18%, transparent)'

// ── Dark side fallen pulse animation ─────────────────────────────────────────
const FALLEN_PULSE_STYLE = `
@keyframes fallenPulse {
  0%, 100% { box-shadow: 0 0 14px color-mix(in srgb, var(--state-activated) 12%, transparent); }
  50%       { box-shadow: 0 0 22px color-mix(in srgb, var(--state-activated) 28%, transparent); }
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
  id:                   string
  description?:         string
  narrative?:           string
  session_label?:       string
  is_resolved:          boolean
  player_acknowledged?: boolean
  created_at:           string
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
  commitments?:        ForceCommitment[]
  onCancelCommit?:     (powerKey: string, effectName: string) => void
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
          padding: '0.875rem var(--space-3)',
          textAlign: 'center',
          border: `1px solid ${accentDim}`,
          boxShadow: `0 0 18px ${accentGlow}`,
        }}
      >
        <CornerBrackets color={accent} />

        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: accent, marginBottom: 'var(--space-1)', opacity: 0.8,
        }}>
          Force Rating
        </div>

        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.h3, fontWeight: 700,
          color: accent, lineHeight: 1,
          textShadow: `0 0 20px ${accentGlow}`,
        }}>
          {forceRating}
        </div>

        {/* Dark Side badge for fallen characters */}
        {isFallen && (
          <div className="inline-flex items-center" style={{
            marginTop: '0.375rem', padding: `${SP[1]} var(--space-2)`,
            background: 'color-mix(in srgb, var(--state-activated) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--state-activated) 35%, transparent)',
            borderRadius: 'var(--radius-md)',
          }}>
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'color-mix(in srgb, var(--state-activated) 70%, transparent)',
            }}>
              ☠ DARK SIDE USER
            </span>
          </div>
        )}

        {/* Pip row */}
        <div className="flex justify-center" style={{ gap: SP[1], marginTop: 'var(--space-2)', marginBottom: '0.625rem' }}>
          {Array.from({ length: Math.max(forceRating, 1) }).map((_, i) => {
            const isCommitted = i >= available
            const isFilled    = i < forceRating
            return (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: !isFilled
                  ? 'transparent'
                  : isCommitted
                  ? `color-mix(in srgb, ${accent} 25%, transparent)`
                  : accent,
                border: `1px solid ${isFilled ? accent : C.border}`,
                boxShadow: isFilled && !isCommitted ? `0 0 5px ${accentGlow}` : 'none',
              }} />
            )
          })}
        </div>

        {committedForce > 0 && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: `color-mix(in srgb, ${accent} 56%, transparent)`, marginBottom: 'var(--space-2)',
          }}>
            {available} available · {committedForce} committed
          </div>
        )}

        {/* Light / Dark legend */}
        <div className="flex justify-center" style={{ gap: SP[2], marginTop: 'var(--space-2)' }}>
          <div className="flex items-center" style={{ gap: SP[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--state-light-fp)', boxShadow: '0 0 4px var(--state-light-fp)' }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'color-mix(in srgb, var(--state-light-fp) 60%, transparent)' }}>Light</span>
          </div>
          {/* #1a1a2e, #6060A0, rgba(96,96,160,0.8) — Force mechanic canonical colour, pre-approved exception */}
          <div className="flex items-center" style={{ gap: SP[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a2e', border: '1px solid #6060A0' }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(96,96,160,0.8)' }}>Dark</span>
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
    <div style={{ ...panelBase, padding: '0.875rem var(--space-3)', textAlign: 'center' }}>
      <CornerBrackets />

      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: C.textDim, marginBottom: 'var(--space-1)',
      }}>
        Morality
      </div>

      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.h3, fontWeight: 700,
        color: scoreColor, lineHeight: 1, marginBottom: 'var(--space-2)',
        textShadow: isFallen ? '0 0 12px color-mix(in srgb, var(--state-activated) 40%, transparent)' : 'none',
      }}>
        {moralityValue}
      </div>

      {/* Track */}
      <div className="relative" style={{ height: 6, background: C.textFaint, borderRadius: 3, marginBottom: '0.375rem' }}>
        <div className="absolute" style={{
          left: 0, top: 0, bottom: 0, borderRadius: 3,
          width: `${Math.min(100, Math.max(0, moralityValue))}%`,
          background: 'linear-gradient(90deg, var(--hud-accent) 0%, var(--hud-gold) 45%, var(--state-success) 70%, var(--die-force) 100%)',
          transition: 'width var(--ease-smooth)',
        }} />
        <div className="absolute" style={{
          top: '50%', transform: 'translate(-50%, -50%)',
          left: `${Math.min(100, Math.max(0, moralityValue))}%`,
          width: 10, height: 10, borderRadius: '50%',
          background: C.gold, border: `2px solid ${C.bg}`,
          boxShadow: `0 0 6px ${C.gold}`,
          transition: 'left var(--ease-smooth)',
        }} />
      </div>

      <div className="flex justify-between">
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'var(--hud-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {moralityWeakness || 'Weakness'}
        </span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'var(--die-force)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
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
  // rgba(220,230,240,*) — Light Side energy on fallen character; Force mechanic canonical colour, pre-approved exception
  const labelColor = isFallen ? 'rgba(220,230,240,0.45)' : C.textDim

  return (
    <div style={{ ...panelBase, padding: 'var(--space-3) var(--space-4)' }}>
      <CornerBrackets />
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: labelColor,
        }}>
          {labelText}
        </div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: activeConflicts.length > 0 ? 'var(--hud-accent)' : C.textDim,
        }}>
          {activeConflicts.length} unresolved
        </div>
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: SP[1] }}>
        {conflicts.map((c, i) => {
          const baseDesc = c.description ?? `Conflict ${i + 1}${c.session_label ? ` — ${c.session_label}` : ''}`
          const tipContent = (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: FS.caption, lineHeight: 1.4 }}>
              {isFallen && !c.is_resolved && (
                <div style={{ color: 'rgba(220,230,240,0.55)', fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Light Side Conflict
                </div>
              )}
              <strong>{baseDesc}</strong>
              {c.description && c.session_label && <div style={{ color: 'var(--hud-text-dim)', fontSize: FS.overline, marginTop: SP[1] }}>{c.session_label}</div>}
            </div>
          )
          return (
            <Tooltip key={c.id} content={tipContent} placement="top" maxWidth={200}>
              {/* rgba(220,230,240,*), rgba(200,215,230,*) — Light Side energy on fallen character; Force mechanic canonical colour, pre-approved exception */}
              <div
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: c.is_resolved
                    ? 'transparent'
                    : isFallen
                      ? 'rgba(220,230,240,0.85)'
                      : 'color-mix(in srgb, var(--hud-accent) 90%, transparent)',
                  border: c.is_resolved
                    ? `1px solid ${C.border}`
                    : isFallen
                      ? '1px solid rgba(200,215,230,0.9)'
                      : '1px solid var(--hud-accent)',
                  boxShadow: c.is_resolved
                    ? 'none'
                    : isFallen
                      ? '0 0 4px rgba(220,230,240,0.5)'
                      : '0 0 4px color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                  cursor: 'default',
                }}
              />
            </Tooltip>
          )
        })}
        {resolvedConflicts.length > 0 && activeConflicts.length > 0 && (
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: C.textFaint, alignSelf: 'center', marginLeft: SP[1],
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
  const { isOpen } = useHudPanelContext()
  const [expanded, setExpanded] = useState(false)
  const [headerHovered, setHeaderHovered] = useState(false)
  const pct = fp.totalCount > 0 ? (fp.purchasedCount / fp.totalCount) * 100 : 0
  const description = fp.description ?? undefined

  return (
    <div
      className="force-panel"
      style={{
        ...panelBase,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header row — clickable toggle */}
      <div
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        className="cursor-pointer select-none"
        style={{
          padding: `${SP[2]} var(--space-3)`,
          background: headerHovered ? 'color-mix(in srgb, var(--die-force) 6%, transparent)' : 'transparent',
          transition: 'background var(--ease-default)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: SP[1] }}>
          <span className="shrink-0" style={{ color: C.textDim, fontSize: FS.overline }}>
            {expanded ? '▼' : '▶'}
          </span>
          <div className="flex-1" style={{
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600,
            color: C.text, minWidth: 0,
          }}>
            <TickerText text={fp.powerName} isOpen={isOpen} delayMs={120} />
          </div>
          <span className="shrink-0" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: FORCE_BLUE }}>
            {fp.purchasedCount}/{fp.totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="overflow-hidden" style={{ height: '0.1875rem', background: C.textFaint, borderRadius: RADIUS.sm }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, var(--die-force), var(--state-activated))`,
            borderRadius: RADIUS.sm, transition: 'width var(--ease-smooth)',
          }} />
        </div>
      </div>

      {/* Description + upgrade tree — only rendered when expanded */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${FORCE_BLUE_DIM}`,
          padding: 'var(--space-2) 0 0',
          background: 'color-mix(in srgb, var(--die-force) 4%, transparent)',
        }}>
          {description && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
              color: C.textDim, marginBottom: 'var(--space-2)', lineHeight: 1.45,
              padding: '0 var(--space-3)',
            }}>
              <RichText text={description} />
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
  commitments = [],
  onCancelCommit,
}: ForcePanelProps) {
  const [activeTab, setActiveTab] = useState<'powers' | 'committed'>('powers')

  const totalCommitted = commitments.reduce((sum, c) => sum + c.dice_count, 0)

  return (
    <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>

      {/* Top row: Force Rating + Morality side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
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
          <div className="flex flex-col items-center justify-center" style={{
            ...panelBase,
            padding: '0.875rem var(--space-3)',
            gap: 'var(--space-2)',
            opacity: 0.6,
          }}>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: C.textDim, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Morality not configured
            </div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: C.textFaint, textAlign: 'center',
            }}>
              GM setup required
            </div>
          </div>
        )}
      </div>

      {/* Conflict pips */}
      {conflicts.length > 0 && <ConflictPips conflicts={conflicts} isFallen={isFallen} />}

      {/* ── Tab bar: Powers / Committed ──────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        {(['powers', 'committed'] as const).map((tab, i) => {
          const isActive = activeTab === tab
          const label = tab === 'powers'
            ? 'Powers'
            : `Committed${commitments.length > 0 ? ` (${commitments.length})` : ''}`
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: `${SP[1]} ${SP[2]}`,
                fontFamily: FONT_BODY,
                fontSize: FS.overline,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                borderRight: i === 0 ? `1px solid ${C.border}` : 'none',
                borderBottom: isActive
                  ? '2px solid var(--die-force)'
                  : '2px solid transparent',
                color: isActive
                  ? 'color-mix(in srgb, var(--die-force) 80%, transparent)'
                  : C.textFaint,
                cursor: 'pointer',
                transition: `color ${EASE.quick}, border-bottom-color ${EASE.quick}`,
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Powers tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'powers' && (
        <div>
          <div className="flex items-center justify-between" style={{
            marginBottom: SP[2], paddingBottom: SP[1],
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: C.textDim,
            }}>
              Force Powers
            </div>
            <button
              onClick={onAdd}
              className="hov-gold-bg cursor-pointer"
              style={{
                background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                border: '1px solid var(--hud-accent-border)',
                borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                fontFamily: FONT_BODY, fontSize: FS.label,
                fontWeight: 700, letterSpacing: '0.1em',
                color: C.gold,
                transition: 'var(--ease-default)',
              }}
            >
              + Add
            </button>
          </div>

          {forcePowers.length > 0 ? (
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              {forcePowers.map((fp, idx) => (
                <div key={fp.powerKey} data-stagger={idx}>
                  <div className="panel-row-enter">
                    <ForcePowerCard
                      fp={fp}
                      xpAvailable={xpAvailable}
                      onPurchase={onPurchasePower
                        ? (abilityKey, row, col, cost) => onPurchasePower(abilityKey, row, col, cost, fp.powerKey)
                        : undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center" style={{ gap: 'var(--space-3)', padding: `${SP[4]} 0` }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: C.textFaint }}>
                No force powers purchased yet.
              </div>
              <button
                onClick={onAdd}
                className="cursor-pointer force-browse-btn"
                style={{
                  border: `1px solid ${FORCE_BLUE_DIM}`,
                  borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-5)',
                  fontFamily: FONT_BODY, fontSize: FS.label,
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: FORCE_BLUE,
                }}
              >
                Browse Force Powers
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Committed tab ────────────────────────────────────────────────────── */}
      {activeTab === 'committed' && (
        <div>
          {commitments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: `${SP[4]} 0`,
              fontFamily: FONT_BODY, fontSize: FS.caption,
              color: C.textFaint, fontStyle: 'italic',
              lineHeight: 1.5,
            }}>
              No Force dice committed.{'\n'}Activate ongoing effects during a Force Check to commit dice here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
              {commitments.map(commitment => (
                <div
                  key={`${commitment.power_key}-${commitment.effect_name}`}
                  style={{
                    background: 'rgba(139,43,226,0.05)', /* Force mechanic colour — pre-approved exception */
                    border: '1px solid rgba(139,43,226,0.2)', /* Force mechanic colour — pre-approved exception */
                    borderRadius: RADIUS.md,
                    padding: `${SP[2]} ${SP[3]}`,
                  }}
                >
                  {/* Row 1: power name · effect name */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: SP[2], marginBottom: SP[2] }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: C.text }}>
                      {commitment.power_name}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textDim }}>
                      {commitment.effect_name}
                    </span>
                  </div>

                  {/* Row 2: die icons + cancel */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[2] }}>
                    <div style={{ display: 'flex', gap: SP[1], alignItems: 'center' }}>
                      {Array.from({ length: commitment.dice_count }).map((_, i) => (
                        <div key={i} style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: 'rgba(139,43,226,0.7)', /* Force mechanic colour — pre-approved exception */
                          border: '1px solid rgba(139,43,226,0.9)', /* Force mechanic colour — pre-approved exception */
                        }} />
                      ))}
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(139,43,226,0.6)' /* Force mechanic colour — pre-approved exception */, marginLeft: SP[1] }}>
                        {commitment.dice_count} {commitment.dice_count === 1 ? 'die' : 'dice'}
                      </span>
                    </div>
                    {onCancelCommit && (
                      <button
                        onClick={() => onCancelCommit(commitment.power_key, commitment.effect_name)}
                        style={{
                          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                          padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                          background: 'color-mix(in srgb, var(--hud-accent) 8%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)',
                          color: 'color-mix(in srgb, var(--hud-accent) 70%, transparent)',
                          cursor: 'pointer',
                          transition: `background ${EASE.quick}`,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Summary note */}
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: C.textFaint, fontStyle: 'italic',
                marginTop: SP[1],
              }}>
                {totalCommitted} {totalCommitted === 1 ? 'die' : 'dice'} committed — Force Rating effectively {forceRating - totalCommitted} for checks.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
