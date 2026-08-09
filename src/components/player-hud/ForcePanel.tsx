'use client'

import { useState, useRef, Fragment } from 'react'
import gsap from 'gsap'
import { C, panelBase } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, EASE, SP, FS, RADIUS, Z } from '@/lib/tokens'
import type { ForceCommitment } from '@/lib/types'
import { isForceCommitCapableForAbility } from '@/lib/forceUtils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { parseSymbols } from '@/lib/parseSymbols'
import type { ForceTreeNode, ForceTreeConnection } from '@/components/character/ForcePowerTree'
import { RichText } from '@/components/ui/RichText'
import { Tooltip } from '@/components/ui/Tooltip'
import { ForcePresenceCard } from './ForcePresenceCard'
import type { MoralitySystem } from '@/lib/moralitySystem'

// ── Force colour ──────────────────────────────────────────────────────────────
const FORCE_BLUE      = 'var(--die-force)'
const FORCE_BLUE_DIM  = 'color-mix(in srgb, var(--die-force) 35%, transparent)'
const FORCE_BLUE_GLOW = 'color-mix(in srgb, var(--die-force) 18%, transparent)'
const DARK_PURPLE     = 'var(--state-activated)'
const DARK_PURPLE_DIM = 'color-mix(in srgb, var(--state-activated) 35%, transparent)'
const DARK_PURPLE_GLOW = 'color-mix(in srgb, var(--state-activated) 18%, transparent)'
// No dedicated "warning" token exists in tokens.ts/state-tokens.css (checked) —
// var(--state-failure) is the established "something's off" red used
// site-wide (e.g. "Cannot Afford" chips) and is the closest existing fit for
// an over-committed-dice warning; not inventing a new colour.
const WARNING_COLOR = 'var(--state-failure)'

const JEDI_EMBLEM = '/images/factions/jedi.webp'

// ── Dark side fallen pulse animation ─────────────────────────────────────────
const FALLEN_PULSE_STYLE = `
@keyframes fallenPulse {
  0%, 100% { box-shadow: 0 0 14px color-mix(in srgb, var(--state-activated) 12%, transparent); }
  50%       { box-shadow: 0 0 22px color-mix(in srgb, var(--state-activated) 28%, transparent); }
}
.force-rating-fallen { animation: fallenPulse 3s ease-in-out infinite; }
`

// Ambient glow behind the Force Rating hero glyphs — pure CSS keyframe
// (same precedent as FALLEN_PULSE_STYLE above), so it's browser-compositor
// driven with zero per-frame JS, not a canvas/rAF particle system. Subtle
// opacity breathing only, never recalculated from an unbounded loop.
const FORCE_HERO_GLOW_STYLE = `
@keyframes forceHeroGlow {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 1; }
}
.force-hero-glow { animation: forceHeroGlow 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .force-hero-glow { animation: none; opacity: 0.8; }
  .force-rating-fallen { animation: none; }
}
`

// Two-column top row (Force Rating hero / Presence) — narrow fixed hero
// column so the numeral fills it, collapsing to one column on narrow
// viewports. Inline styles can't express a media query, hence a scoped
// class + <style> tag, same precedent as FORCE_HERO_GLOW_STYLE above.
const FORCE_TOP_ROW_STYLE = `
.force-top-row { display: grid; grid-template-columns: 360px 1fr; gap: var(--space-4); }
@media (max-width: 1000px) { .force-top-row { grid-template-columns: 1fr; } }
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
  pip_cost:       number   // Force pip activation cost
}

export interface ForcePowerDisplay {
  powerKey:        string
  powerName:       string
  description?:    string
  purchasedCount:  number
  totalCount:      number
  abilities:       ForceAbilityDisplay[]
  // Still populated by useForcePowers.ts and read by other consumers
  // (ForceCheckOverlay) — this panel no longer
  // renders an inline <ForcePowerTree> (Prompt: quick-glance hub, purchases
  // now happen exclusively via the full-screen route), but the type shape
  // itself is unchanged so it stays valid everywhere else it's used.
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
  /** Retained on the prop interface for the shared type contract (also used
   * by MobileForceScreen.tsx's own separate component) — no longer called
   * from this panel now that purchasing is exclusively via the full-screen
   * power tree route (see onAdd). */
  onPurchasePower?:    (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => Promise<string | undefined> | void
  onViewPower:         (powerKey: string) => void
  /** Navigates to the full-screen Force power tree route. This is the ONLY
   * existing navigation mechanism into that route (confirmed: no query-param
   * support exists for deep-linking to a specific power or auto-opening
   * browse/purchase mode) — reused as-is for both "Buy New Force Power" and
   * every per-card "Open in Power Tree" action, rather than inventing one. */
  onAdd:               () => void
  isFallen?:           boolean
  commitments?:        ForceCommitment[]
  onCancelCommit?:     (powerKey: string, effectName: string) => void
  /** Result of forceUtils.ts's getAvailableForceRating(character, forceRating)
   * — computed by the caller (needs the full Character object, which this
   * panel doesn't receive) and passed down. Optional so MobileSessionCompanion.tsx's
   * existing <ForcePanel> call site (which doesn't pass it) keeps working —
   * falls back to the same max(0, forceRating - committedForce) formula
   * inline when absent. */
  availableForceRating?: number
  /** New in this prompt — creates a commitment (power_key/power_name/
   * effect_name=ability name/ability_key/dice_count). No capacity guard:
   * committing beyond Force Rating must succeed. */
  onCommit?:           (powerKey: string, powerName: string, abilityKey: string, abilityName: string, diceCount: number) => Promise<void>
  /** Eligible for Force Rating 1, currently at 0, not yet purchased — shows the buy CTA and locks power browsing. */
  canGainForceRating?: boolean
  onPurchaseForceRating?: () => void
  /** Force Presence (Prompt B) — swap-point branch lives here, not inside
   * PresenceCard. Undefined/null (MobileSessionCompanion.tsx's existing
   * call site doesn't pass these) falls back to vanilla PresenceCard,
   * byte-identical to before. */
  moralitySystem?: MoralitySystem | null
  /** Set only on a real fetch failure — per moralitySystem.ts's log-and-throw
   * contract, this must render as a visible error, never silently fall back
   * to either system. */
  moralitySystemError?: string | null
  lightPoints?: number
  darkPoints?: number
  sessionConflict?: number
  sessionTranquility?: number
  onFlipBalancePoint?: (fromState: 'neutral' | 'light' | 'dark', toState: 'neutral' | 'light' | 'dark') => Promise<void>
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

/** One jedi.webp emblem, tinted to an exact token colour via CSS mask
 * (background-color clipped to the asset's alpha shape) rather than
 * .hud-fi-jedi's filter — that filter is tuned specifically for the left
 * rail's dark chrome and renders the glyph a muddy rust-brown against the
 * hero card / commit sockets, effectively invisible there. No existing
 * mask-to-token-colour utility exists elsewhere in the codebase (checked),
 * so this is inline to these two call sites only, per instruction — NOT a
 * change to .hud-fi-jedi itself, which the left rail still depends on. */
function JediEmblem({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <span
      role="img"
      aria-hidden
      style={{
        display: 'inline-block', width: size, height: size, flexShrink: 0,
        backgroundColor: color,
        WebkitMaskImage: `url(${JEDI_EMBLEM})`, maskImage: `url(${JEDI_EMBLEM})`,
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        ...style,
      }}
    />
  )
}

// ── Force Rating — hero treatment ───────────────────────────────────────────

function ForceRatingHero({
  forceRating,
  committedForce,
  isFallen = false,
}: {
  forceRating: number
  committedForce: number
  isFallen?: boolean
}) {
  const accent     = isFallen ? DARK_PURPLE      : FORCE_BLUE
  const accentDim  = isFallen ? DARK_PURPLE_DIM  : FORCE_BLUE_DIM
  const accentGlow = isFallen ? DARK_PURPLE_GLOW : FORCE_BLUE_GLOW

  return (
    <>
      {isFallen && <style>{FALLEN_PULSE_STYLE}</style>}
      <style>{FORCE_HERO_GLOW_STYLE}</style>
      <div
        className={isFallen ? 'force-rating-fallen' : undefined}
        style={{
          ...panelBase,
          position: 'relative',
          overflow: 'hidden',
          padding: '1.25rem var(--space-4) 1.5rem',
          textAlign: 'center',
          border: `1px solid ${accentDim}`,
          boxShadow: `0 0 32px ${accentGlow}`,
        }}
      >
        <CornerBrackets color={accent} />

        {/* Ambient glow layer — CSS keyframe only, see FORCE_HERO_GLOW_STYLE */}
        <div
          className="force-hero-glow"
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 38%, color-mix(in srgb, ${accent} 18%, transparent) 0%, transparent 68%)`,
          }}
        />

        <div style={{ position: 'relative' }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: accent, opacity: 0.85, marginBottom: SP[2],
          }}>
            Force Rating
          </div>

          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.hero, fontWeight: 700,
            color: accent, lineHeight: 0.9,
            textShadow: `0 0 28px ${accentGlow}`,
          }}>
            {forceRating}
          </div>

          {isFallen && (
            <div className="inline-flex items-center" style={{
              marginTop: SP[2], padding: `${SP[1]} var(--space-2)`,
              background: 'color-mix(in srgb, var(--state-activated) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--state-activated) 35%, transparent)',
              borderRadius: RADIUS.md,
            }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'color-mix(in srgb, var(--state-activated) 70%, transparent)',
              }}>
                ☠ DARK SIDE USER
              </span>
            </div>
          )}

          {forceRating > 0 ? (
            <div className="flex justify-center flex-wrap" style={{ gap: SP[2], marginTop: SP[3] }}>
              {Array.from({ length: forceRating }, (_, i) => (
                <JediEmblem
                  key={i} size={22} color={accent}
                  style={{ filter: `drop-shadow(0 0 10px ${accentGlow})` }}
                />
              ))}
            </div>
          ) : (
            <div style={{
              marginTop: SP[2], fontFamily: FONT_BODY, fontSize: FS.overline,
              color: C.textFaint, fontStyle: 'italic',
            }}>
              No Force Rating purchased
            </div>
          )}

          {committedForce > 0 && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: `color-mix(in srgb, ${accent} 56%, transparent)`, marginTop: SP[2],
            }}>
              {Math.max(0, forceRating - committedForce)} available · {committedForce} committed
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Presence module (Morality/Conflict) — isolated card ─────────────────────
//
// FUTURE SWAP POINT: this card is the placeholder for the eventual Force
// Presence system. Kept structurally and visually self-contained from the
// Force Rating hero above and the Powers/Committed sections below so it can
// be replaced wholesale later without touching anything else in this file.
// The redesigned track/slider here is explicitly a light pass, not a final
// design — don't over-invest further until Force Presence lands.

function PresenceCard({
  moralityValue,
  moralityStrength,
  moralityWeakness,
  moralityConfigured,
  conflicts,
  isFallen = false,
}: {
  moralityValue?: number
  moralityStrength: string
  moralityWeakness: string
  moralityConfigured?: boolean
  conflicts: ConflictEntry[]
  isFallen?: boolean
}) {
  if (moralityConfigured === false || moralityValue === undefined) {
    return (
      <div className="flex flex-col items-center justify-center" style={{
        ...panelBase, padding: 'var(--space-3) var(--space-4)', gap: SP[1], opacity: 0.6,
      }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textDim,
          textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Morality not configured
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, textAlign: 'center' }}>
          GM setup required
        </div>
      </div>
    )
  }

  const scoreColor = isFallen ? DARK_PURPLE : C.gold
  const pct = Math.min(100, Math.max(0, moralityValue))
  const activeConflicts   = conflicts.filter(c => !c.is_resolved)
  const resolvedConflicts = conflicts.filter(c => c.is_resolved)

  return (
    <div style={{ ...panelBase, padding: 'var(--space-3) var(--space-4)' }}>
      <CornerBrackets />

      <div className="flex items-center justify-between" style={{ marginBottom: SP[2] }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim,
        }}>
          Presence
        </div>
        {conflicts.length > 0 && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: activeConflicts.length > 0 ? 'var(--hud-accent)' : C.textDim,
          }}>
            {activeConflicts.length} unresolved
          </div>
        )}
      </div>

      <div className="flex items-center" style={{ gap: SP[3] }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
          color: scoreColor, lineHeight: 1, flexShrink: 0,
          textShadow: isFallen ? '0 0 12px color-mix(in srgb, var(--state-activated) 40%, transparent)' : 'none',
        }}>
          {moralityValue}
        </div>

        <div style={{ flex: 1, minWidth: 0, maxWidth: 420 }}>
          {/* FIX 3: capped width — full-width previously pushed the two pole
              labels to opposite ends of the panel where they read as
              unrelated, instead of as one unit with the track. */}
          {/* Redesigned track: tick-segmented rail + gradient fill + glow dot,
              replacing the old plain gradient bar. Still a placeholder — see
              swap-point comment above. */}
          <div className="relative" style={{
            height: 8, borderRadius: RADIUS.sm, overflow: 'hidden',
            background: 'color-mix(in srgb, var(--hud-text-faint) 40%, transparent)',
          }}>
            <div className="absolute" style={{
              left: 0, top: 0, bottom: 0, borderRadius: RADIUS.sm,
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--hud-accent) 0%, var(--hud-gold) 45%, var(--state-success) 70%, var(--die-force) 100%)',
              transition: `width ${EASE.smooth}`,
            }} />
            {/* Tick marks every 10% */}
            <div className="absolute flex" style={{ inset: 0 }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${(i + 1) * 10}%`, top: 0, bottom: 0, width: 1,
                  background: 'color-mix(in srgb, var(--hud-bg) 35%, transparent)',
                }} />
              ))}
            </div>
          </div>
          <div className="relative" style={{ height: 0 }}>
            <div className="absolute" style={{
              top: -12, transform: 'translate(-50%, -50%)',
              left: `${pct}%`,
              width: 10, height: 10, borderRadius: '50%',
              background: C.gold, border: `2px solid ${C.bg}`,
              boxShadow: `0 0 6px ${C.gold}`,
              transition: `left ${EASE.smooth}`,
            }} />
          </div>
          <div className="flex justify-between" style={{ marginTop: SP[2] }}>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-accent)',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {moralityWeakness || 'Weakness'}
            </span>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--die-force)',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {moralityStrength || 'Strength'}
            </span>
          </div>
        </div>
      </div>

      {/* Conflict pips — folded into this card rather than a separate one */}
      {conflicts.length > 0 && (
        <div style={{ marginTop: SP[3], paddingTop: SP[2], borderTop: `1px solid ${C.border}` }}>
          <div className="flex" style={{ flexWrap: 'wrap', gap: SP[1] }}>
            {conflicts.map((cf, i) => {
              const baseDesc = cf.description ?? `Conflict ${i + 1}${cf.session_label ? ` — ${cf.session_label}` : ''}`
              const tipContent = (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: FS.caption, lineHeight: 1.4 }}>
                  {isFallen && !cf.is_resolved && (
                    <div style={{ color: 'rgba(220,230,240,0.55)', fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                      Light Side Conflict
                    </div>
                  )}
                  <strong>{baseDesc}</strong>
                  {cf.description && cf.session_label && <div style={{ color: 'var(--hud-text-dim)', fontSize: FS.overline, marginTop: SP[1] }}>{cf.session_label}</div>}
                </div>
              )
              return (
                <Tooltip key={cf.id} content={tipContent} placement="top" maxWidth={200}>
                  {/* rgba(220,230,240,*), rgba(200,215,230,*) — Light Side energy on fallen character; Force mechanic canonical colour, pre-approved exception */}
                  <div
                    style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: cf.is_resolved
                        ? 'transparent'
                        : isFallen
                          ? 'rgba(220,230,240,0.85)'
                          : 'color-mix(in srgb, var(--hud-accent) 90%, transparent)',
                      border: cf.is_resolved
                        ? `1px solid ${C.border}`
                        : isFallen
                          ? '1px solid rgba(200,215,230,0.9)'
                          : '1px solid var(--hud-accent)',
                      boxShadow: cf.is_resolved
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
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, alignSelf: 'center', marginLeft: SP[1] }}>
                ({resolvedConflicts.length} resolved)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Force Powers grid card ───────────────────────────────────────────────────

function SegmentedTickBar({ total, filled }: { total: number; filled: number }) {
  if (total <= 0) return null
  return (
    <div className="flex" style={{ gap: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: RADIUS.sm,
            background: i < filled ? FORCE_BLUE : 'color-mix(in srgb, var(--die-force) 14%, transparent)',
          }}
        />
      ))}
    </div>
  )
}

function ForcePowerCard({
  fp,
  isExpanded,
  onToggle,
}: {
  fp: ForcePowerDisplay
  isExpanded: boolean
  onToggle: () => void
}) {
  const [headerHovered, setHeaderHovered] = useState(false)

  // FIX 5: notched plaque clip-path, same idiom (--notch custom property,
  // corner-cut silhouette) as the talent plaque language in
  // TalentTree.module.css, sized down for a grid card. Only two opposite
  // corners are cut (matches the spec's lighter card treatment) rather than
  // all four — this is a smaller grid tile, not a full talent plaque.
  const notchStyle = {
    '--notch': '13px',
    clipPath: 'polygon(var(--notch) 0, 100% 0, 100% calc(100% - var(--notch)), calc(100% - var(--notch)) 100%, 0 100%, 0 var(--notch))',
  } as React.CSSProperties

  return (
    <div
      className="force-panel"
      style={{
        ...panelBase, ...notchStyle, padding: 0, overflow: 'hidden', cursor: 'pointer',
        borderColor: isExpanded ? 'color-mix(in srgb, var(--die-force) 55%, transparent)' : undefined,
        background: isExpanded ? 'color-mix(in srgb, var(--die-force) 7%, transparent)' : undefined,
      }}
      onClick={onToggle}
      onMouseEnter={() => setHeaderHovered(true)}
      onMouseLeave={() => setHeaderHovered(false)}
    >
      {/* Header — the card itself is the affordance (FIX 5: no ▶ disclosure
          triangle — hover/active state on the whole card communicates it).
          The drawer itself is no longer nested here — it's rendered as a
          full-width grid sibling by the parent (see PowerDrawer / ForcePanel). */}
      <div
        className="select-none"
        style={{
          padding: `${SP[2]} var(--space-3)`,
          background: headerHovered && !isExpanded ? 'color-mix(in srgb, var(--die-force) 7%, transparent)' : 'transparent',
          transition: `background ${EASE.default}`,
        }}
      >
        <div className="flex items-baseline" style={{ gap: SP[2], marginBottom: SP[1] }}>
          {/* FIX 6: name must ellipsis-truncate, count must never shrink.
              Ticker animation deliberately excluded from this specific
              label — its per-character <span> reveal fights a hard
              ellipsis cut mid-animation (chars settling then getting
              clipped), and unlike the mega-header's one-shot reveal this
              label re-renders on every data refresh. Plain text with CSS
              truncation is simpler and reliably correct; nothing else in
              the app currently truncates ticker text this way to compare
              against. */}
          <span style={{
            flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: FONT_DISPLAY, fontSize: FS.body, fontWeight: 700, color: C.text, letterSpacing: '0.02em',
          }}>
            {fp.powerName}
          </span>
          <span className="shrink-0" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: FORCE_BLUE }}>
            {fp.purchasedCount}/{fp.totalCount}
          </span>
        </div>

        {/* Segmented tick bar — one segment per total upgrade, filled = owned */}
        <SegmentedTickBar total={fp.totalCount} filled={fp.purchasedCount} />
      </div>
    </div>
  )
}

// Part 7 — converts shortcode markup to its RENDERED plain-text equivalent,
// using the same parser RichText.tsx renders from (parseSymbols.ts, a pure
// data utility with no React dependency) rather than a hand-rolled regex —
// this reflects what a player actually SEES, not the raw string. Dice/result
// symbols ([FP], [SU], etc.) contribute no text (they render as icon
// glyphs); [P]/[BR] become a single space so sentences don't run together;
// and critically, the TITLE TEXT inside a [H4]...[h4] (or [H3]...[h3])
// heading block is dropped entirely, not just the tag markers — a power's
// description is typically "[H4]Commune[h4]\nThe user can reach out..." and
// only that heading's own text ("Commune") needs excluding for the opening
// sentence to line up with the ability description at all.
function renderedPlainText(raw: string): string {
  const segments = parseSymbols(raw)
  let headingDepth = 0
  const parts: string[] = []
  for (const seg of segments) {
    if (seg.type === 'format') {
      if (seg.tag === 'h3-open' || seg.tag === 'h4-open') headingDepth++
      else if (seg.tag === 'h3-close' || seg.tag === 'h4-close') headingDepth = Math.max(0, headingDepth - 1)
      else if (seg.tag === 'paragraph' || seg.tag === 'linebreak') parts.push(' ')
      continue
    }
    if (seg.type === 'text' && headingDepth === 0) parts.push(seg.value)
  }
  return parts.join('')
}

// Normalizes RENDERED text for an exact (non-fuzzy) comparison — trims and
// collapses runs of whitespace, nothing more. Used by PowerDrawer to decide
// whether an owned upgrade's description merely repeats the power's own
// base description.
function normalizeDescription(s: string): string {
  return renderedPlainText(s).trim().replace(/\s+/g, ' ')
}

// ── Commit ceremony (Part 6) ─────────────────────────────────────────────
//
// Not pure, touches the DOM directly via gsap — same convention as
// buildTalentTree.ts's runEnergyTrace/runTreeEntrance (a raw DOM element,
// not React state/portal, since this is a purely transient visual that
// outlives no component render). The state write this accompanies is fired
// independently by the caller and never awaits this function — a failed or
// interrupted animation can never leave data inconsistent, because this
// function never touches data at all.
//
// Skipped entirely at the call site when prefers-reduced-motion is set —
// same usePrefersReducedMotion hook already used elsewhere in this file
// (FORCE_HERO_GLOW_STYLE) and across the app (buildTalentTree.ts's
// runTreeEntrance/runEnergyTrace, ForcePowerTree.tsx's energy trace).
function runCommitFlight(sourceEl: HTMLElement, targetEl: HTMLElement) {
  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  const size = 18

  const flyer = document.createElement('span')
  flyer.setAttribute('aria-hidden', 'true')
  Object.assign(flyer.style, {
    position: 'fixed',
    zIndex: String(Z.hudSupreme),
    left: `${sourceRect.left + sourceRect.width / 2 - size / 2}px`,
    top: `${sourceRect.top + sourceRect.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: 'none',
    backgroundColor: FORCE_BLUE,
    WebkitMaskImage: `url(${JEDI_EMBLEM})`,
    maskImage: `url(${JEDI_EMBLEM})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  } as Partial<CSSStyleDeclaration>)
  document.body.appendChild(flyer)

  const dx = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2)
  const dy = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2)

  // Ignite the real target socket on landing — clearProps guarantees the
  // touched element reverts to its normal (CSS/re-render-driven) state,
  // same clearProps-on-completion contract runEnergyTrace/runTreeEntrance
  // already establish elsewhere in this codebase.
  const ignite = () => {
    gsap.fromTo(
      targetEl,
      { filter: 'none' },
      {
        filter: `drop-shadow(0 0 12px ${FORCE_BLUE})`, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut',
        onComplete: () => gsap.set(targetEl, { clearProps: 'filter' }),
      },
    )
  }

  const tl = gsap.timeline({ onComplete: () => flyer.remove() })
  tl.fromTo(flyer, { scale: 0.6, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.1, ease: 'power2.out' })
  tl.to(flyer, { x: dx, y: dy, duration: 0.3, ease: 'power2.inOut', onComplete: ignite }, '<')
  tl.to(flyer, { opacity: 0, scale: 0.5, duration: 0.1, ease: 'power1.in' }, '-=0.08')
  // Total: ~0.3s flight (fade overlaps the tail end) + ~0.3s ignite ≈ 0.6s —
  // under the ~700ms budget.
}

/** Stepper + Commit button for one commit-capable owned upgrade row. Reads
 * the current forceRating/committedForce (via props, not local state) to
 * compute the flight's target socket index BEFORE the write lands — the
 * target socket already exists in the DOM right now (as an "empty" socket,
 * per CommittedDiceSection's indexed rendering), so no coordination with the
 * realtime-driven data refresh is needed for positioning; the socket's own
 * fill styling catches up naturally once the write's realtime echo arrives,
 * same as every other write in this app refreshes UI (Realtime subscription
 * on the characters table in useCharacterData.ts — no new refresh mechanism
 * added here). */
function CommitControl({
  powerKey, powerName, ability, forceRating, committedForce, commitRowRef, onCommit,
}: {
  powerKey: string
  powerName: string
  ability: ForceAbilityDisplay
  forceRating: number
  committedForce: number
  commitRowRef: React.RefObject<HTMLDivElement | null>
  onCommit: (powerKey: string, powerName: string, abilityKey: string, abilityName: string, diceCount: number) => Promise<void>
}) {
  const [diceCount, setDiceCount] = useState(1)
  const [busy, setBusy] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleCommit = () => {
    if (busy) return
    setBusy(true)

    // Cosmetic flight — independent of the write below; never gates it.
    // No target (already at/over capacity, or reduced motion) → skipped
    // entirely, not a fallback animation.
    if (!prefersReducedMotion && btnRef.current && committedForce < forceRating && commitRowRef.current) {
      const targetEl = commitRowRef.current.querySelector<HTMLElement>(`[data-socket-index="${committedForce}"]`)
      if (targetEl) runCommitFlight(btnRef.current, targetEl)
    }

    // The real write — fired here, not awaited by the animation above, and
    // its own completion doesn't wait on the animation either.
    onCommit(powerKey, powerName, ability.key, ability.name, diceCount).finally(() => setBusy(false))
  }

  return (
    <div className="flex items-center" style={{ gap: SP[1], marginTop: SP[1] }}>
      <div className="flex items-center" style={{ gap: 2 }}>
        <button
          onClick={() => setDiceCount(n => Math.max(1, n - 1))}
          className="cursor-pointer"
          style={{
            width: 18, height: 18, lineHeight: 1, padding: 0,
            background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`, borderRadius: RADIUS.sm,
            color: C.textDim, fontFamily: FONT_BODY, fontSize: FS.overline,
          }}
        >
          −
        </button>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.text, minWidth: 12, textAlign: 'center' }}>
          {diceCount}
        </span>
        <button
          onClick={() => setDiceCount(n => n + 1)}
          className="cursor-pointer"
          style={{
            width: 18, height: 18, lineHeight: 1, padding: 0,
            background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`, borderRadius: RADIUS.sm,
            color: C.textDim, fontFamily: FONT_BODY, fontSize: FS.overline,
          }}
        >
          +
        </button>
      </div>
      <button
        ref={btnRef}
        onClick={handleCommit}
        disabled={busy}
        className="cursor-pointer"
        style={{
          background: 'color-mix(in srgb, var(--die-force) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--die-force) 45%, transparent)',
          borderRadius: RADIUS.sm, padding: `2px ${SP[2]}`,
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: FORCE_BLUE,
          opacity: busy ? 0.5 : 1, cursor: busy ? 'not-allowed' : 'pointer',
          transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
        }}
      >
        Commit
      </button>
    </div>
  )
}

// Two-column drawer layout (description+action left, owned upgrades right),
// collapsing to one column under 900px — same media-query-via-scoped-class
// approach as FORCE_TOP_ROW_STYLE, matching the spec's own .drawer-in
// breakpoint.
const FORCE_DRAWER_STYLE = `
.force-drawer-in { display: grid; grid-template-columns: minmax(260px, 1fr) 1.4fr; gap: var(--space-6); }
@media (max-width: 900px) { .force-drawer-in { grid-template-columns: 1fr; } }
`

/** Full-width expanded detail for one power — rendered as a grid SIBLING of
 * the power cards (not nested inside one), spanning every grid column via
 * gridColumn:'1 / -1', directly beneath whichever card is expanded. Only
 * ForcePanel ever mounts one of these at a time. */
function PowerDrawer({
  fp,
  onOpenInTree,
  forceRating,
  committedForce,
  commitRowRef,
  onCommit,
}: {
  fp: ForcePowerDisplay
  onOpenInTree: () => void
  forceRating: number
  committedForce: number
  commitRowRef: React.RefObject<HTMLDivElement | null>
  onCommit?: (powerKey: string, powerName: string, abilityKey: string, abilityName: string, diceCount: number) => Promise<void>
}) {
  const description = fp.description ?? undefined
  const normalizedPowerDesc = normalizeDescription(description ?? '')
  const ownedAbilities = fp.abilities.filter(a => a.purchasedRanks > 0)

  return (
    <div style={{
      gridColumn: '1 / -1',
      ...panelBase,
      border: `1px solid color-mix(in srgb, var(--die-force) 30%, transparent)`,
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--die-force) 7%, transparent), transparent 45%), var(--hud-panel)',
    }}>
      <style>{FORCE_DRAWER_STYLE}</style>
      <div className="force-drawer-in" style={{ padding: 'var(--space-5)' }}>
        {/* Left — heading, description, Open in Power Tree */}
        <div>
          {/* Secondary Fix A: name as its own heading line, h3 scale, Force
              die colour — was previously running inline with the
              description text. */}
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
            color: FORCE_BLUE, letterSpacing: '0.02em', marginBottom: SP[3],
          }}>
            {fp.powerName}
          </div>
          {description && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: C.text, lineHeight: 1.6 }}>
              <RichText text={description} />
            </div>
          )}
          <button
            onClick={onOpenInTree}
            className="cursor-pointer"
            style={{
              marginTop: SP[4],
              background: 'color-mix(in srgb, var(--die-force) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--die-force) 45%, transparent)',
              borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[3]}`,
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: FORCE_BLUE,
              transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            Open in Power Tree
          </button>
        </div>

        {/* Right — owned upgrades */}
        <div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint,
            marginBottom: SP[2],
          }}>
            Owned Upgrades — {fp.purchasedCount}/{fp.totalCount}
          </div>
          {ownedAbilities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
              {ownedAbilities.map(a => {
                const commitCapable = isForceCommitCapableForAbility(a.key, a.description ?? '')
                // Secondary Fix B: suppress the description body when it's
                // an exact (whitespace-normalized) repeat of the power's own
                // base description — real reSpec data was checked directly
                // (all 25 respec powers) and no power/base-ability pair is
                // ever byte-identical even after normalization (the power
                // description always carries an [H4]...[h4] title prefix,
                // and often more/different narrative text) — they're
                // similar/overlapping, not identical strings. This
                // comparison is implemented exactly as specified (trimmed,
                // whitespace-normalized, no fuzzy matching) and is
                // defensively correct, but against today's real dataset it
                // will not suppress anything for any power. Flagged in the
                // prompt summary rather than silently loosening the match.
                const isDuplicateOfBase = !!a.description && normalizeDescription(a.description) === normalizedPowerDesc
                return (
                  <div key={a.key} style={{
                    borderLeft: `2px solid ${FORCE_BLUE_DIM}`, paddingLeft: SP[2],
                  }}>
                    <div className="flex items-center" style={{ gap: SP[1] }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: C.text }}>
                        {a.name}
                      </span>
                      {a.totalRanks > 1 && (
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint }}>
                          (rank {a.purchasedRanks}/{a.totalRanks})
                        </span>
                      )}
                      {commitCapable && (
                        <Tooltip content={<span>Can be committed for an ongoing effect</span>} placement="top" maxWidth={180}>
                          <span style={{ fontSize: FS.overline, color: 'color-mix(in srgb, var(--die-force) 70%, transparent)', cursor: 'default' }}>◈</span>
                        </Tooltip>
                      )}
                    </div>
                    {a.description && !isDuplicateOfBase && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: C.textDim, lineHeight: 1.4, marginTop: 2 }}>
                        <RichText text={a.description} />
                      </div>
                    )}
                    {commitCapable && onCommit && (
                      <CommitControl
                        powerKey={fp.powerKey}
                        powerName={fp.powerName}
                        ability={a}
                        forceRating={forceRating}
                        committedForce={committedForce}
                        commitRowRef={commitRowRef}
                        onCommit={onCommit}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, fontStyle: 'italic' }}>
              No upgrades purchased yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Committed Dice — skeleton, read-only ─────────────────────────────────────

function CommittedDiceSection({
  forceRating,
  availableForceRating,
  commitments,
  onCancelCommit,
  commitRowRef,
}: {
  forceRating: number
  availableForceRating?: number
  commitments: ForceCommitment[]
  onCancelCommit?: (powerKey: string, effectName: string) => void
  commitRowRef: React.RefObject<HTMLDivElement | null>
}) {
  const totalCommitted = commitments.reduce((sum, c) => sum + c.dice_count, 0)
  const excess = Math.max(0, totalCommitted - forceRating)
  const filledSockets = Math.min(totalCommitted, forceRating)
  // Part 4: prefers the real getAvailableForceRating(...) result computed by
  // the caller (HudForceTab.tsx, which has the full Character object this
  // panel doesn't) — falls back to the identical formula inline only for
  // MobileSessionCompanion.tsx's existing call site, which doesn't pass it.
  const available = availableForceRating ?? Math.max(0, forceRating - totalCommitted)

  return (
    <div style={{ ...panelBase, padding: 'var(--space-3) var(--space-4)' }}>
      <CornerBrackets />
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim,
        marginBottom: SP[2],
      }}>
        Committed Dice
      </div>

      {/* Socket row — one per point of current Force Rating, in ONE
          continuously-indexed loop (data-socket-index) rather than separate
          filled/empty arrays, so PowerDrawer's commit flight can look up
          "the Nth socket" as a real DOM target before the write completes —
          that socket already exists right now (as "empty"); its fill
          styling catches up naturally once the write's realtime echo
          arrives, same as every other write refreshes this panel (no new
          refresh mechanism). Excess (over Force Rating) renders as
          additional filled sockets in the warning colour, never hidden or
          clamped — no data-socket-index, they're never a flight target. */}
      <div ref={commitRowRef} className="flex flex-wrap items-center" style={{ gap: SP[1], marginBottom: SP[2] }}>
        {Array.from({ length: forceRating }, (_, i) => (
          <div key={`socket-${i}`} data-socket-index={i}>
            <JediEmblem
              size={18}
              color={i < filledSockets ? FORCE_BLUE : C.textFaint}
              style={i < filledSockets
                ? { filter: `drop-shadow(0 0 8px ${FORCE_BLUE_GLOW})` }
                : { opacity: 0.5 }}
            />
          </div>
        ))}
        {Array.from({ length: excess }, (_, i) => (
          <JediEmblem
            key={`excess-${i}`} size={18} color={WARNING_COLOR}
            style={{ filter: `drop-shadow(0 0 8px color-mix(in srgb, ${WARNING_COLOR} 50%, transparent))` }}
          />
        ))}
        {excess > 0 && (
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: WARNING_COLOR, marginLeft: SP[1] }}>
            {excess} over Force Rating
          </span>
        )}
      </div>

      {/* Readout is always live (Part 4) — the "No dice committed" prefix is
          the empty-state text and only shows when nothing is committed. */}
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, marginBottom: commitments.length > 0 ? SP[2] : 0 }}>
        {commitments.length === 0 ? 'No dice committed · ' : ''}{available} of {forceRating} Force dice available for ongoing effects
      </div>

      {commitments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          {commitments.map(commitment => (
            <div
              key={`${commitment.power_key}-${commitment.effect_name}`}
              style={{
                background: 'color-mix(in srgb, var(--die-force) 5%, transparent)',
                border: '1px solid color-mix(in srgb, var(--die-force) 20%, transparent)',
                borderRadius: RADIUS.md,
                padding: `${SP[2]} ${SP[3]}`,
              }}
            >
              <div className="flex items-center justify-between" style={{ gap: SP[2] }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: C.text }}>
                    {commitment.power_name}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textDim, marginLeft: SP[2] }}>
                    {commitment.effect_name} · {commitment.dice_count} {commitment.dice_count === 1 ? 'die' : 'dice'}
                  </span>
                </div>
                {onCancelCommit && (
                  <button
                    onClick={() => onCancelCommit(commitment.power_key, commitment.effect_name)}
                    style={{
                      flexShrink: 0,
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                      background: 'color-mix(in srgb, var(--hud-accent) 8%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)',
                      color: 'color-mix(in srgb, var(--hud-accent) 70%, transparent)',
                      cursor: 'pointer',
                      transition: `background ${EASE.quick}`,
                    }}
                  >
                    Release
                  </button>
                )}
              </div>
            </div>
          ))}
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
  onAdd,
  isFallen = false,
  commitments = [],
  onCancelCommit,
  availableForceRating,
  onCommit,
  canGainForceRating = false,
  onPurchaseForceRating,
  moralitySystem,
  moralitySystemError,
  lightPoints = 0,
  darkPoints = 0,
  sessionConflict = 0,
  sessionTranquility = 0,
  onFlipBalancePoint,
}: ForcePanelProps) {
  // Lifted out of the individual card component (Primary Fix) — a single
  // "which power is expanded" value, not per-card local state, so the
  // drawer can render as one full-width grid sibling instead of nested
  // inside whichever card's own column.
  const [expandedPowerKey, setExpandedPowerKey] = useState<string | null>(null)
  // Shared between PowerDrawer's commit flight (source→target) and
  // CommittedDiceSection's own indexed sockets — the flight looks up its
  // target via this ref rather than any new cross-component state.
  const commitRowRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col" style={{ gap: SP[4], padding: `${SP[5]} ${SP[5]} ${SP[6]}` }}>
      <style>{FORCE_TOP_ROW_STYLE}</style>

      {/* FIX 2: hero + presence side by side in a narrow-hero/wide-presence
          two-column row, collapsing to one column under 1000px. */}
      <div className="force-top-row">
        <ForceRatingHero
          forceRating={forceRating}
          committedForce={committedForce}
          isFallen={isFallen}
        />

        {/* Force Presence swap point — 'force_presence' fully replaces the
            Morality track/value/Conflict-pip row with ForcePresenceCard, it
            does not render alongside it. A fetch failure renders neither —
            moralitySystem.ts's contract is "surface visibly, never silently
            default to either system." */}
        {moralitySystemError ? (
          <div className="flex flex-col items-center justify-center" style={{ ...panelBase, padding: 'var(--space-3) var(--space-4)', gap: SP[1] }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: WARNING_COLOR, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Presence system unavailable
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, textAlign: 'center' }}>
              {moralitySystemError}
            </div>
          </div>
        ) : moralitySystem === 'force_presence' ? (
          <ForcePresenceCard
            lightPoints={lightPoints}
            darkPoints={darkPoints}
            sessionConflict={sessionConflict}
            sessionTranquility={sessionTranquility}
            onFlipBalancePoint={onFlipBalancePoint}
          />
        ) : (
          <PresenceCard
            moralityValue={moralityValue}
            moralityStrength={moralityStrength}
            moralityWeakness={moralityWeakness}
            moralityConfigured={moralityConfigured}
            conflicts={conflicts}
            isFallen={isFallen}
          />
        )}
      </div>

      {/* ── Force Powers ─────────────────────────────────────────────────── */}
      <div>
        {canGainForceRating ? (
          <div className="flex flex-col items-center justify-center" style={{ gap: SP[3], padding: `${SP[5]} 0`, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: C.textDim, lineHeight: 1.5 }}>
              You are Force sensitive, but have not yet gained a Force Rating.{'\n'}Force powers cannot be purchased until you do.
            </div>
            <button
              onClick={onPurchaseForceRating}
              disabled={(xpAvailable ?? 0) < 10}
              className="cursor-pointer force-browse-btn"
              style={{
                border: `1px solid ${FORCE_BLUE_DIM}`,
                borderRadius: RADIUS.md, padding: `${SP[2]} var(--space-5)`,
                fontFamily: FONT_BODY, fontSize: FS.label,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: FORCE_BLUE,
                opacity: (xpAvailable ?? 0) < 10 ? 0.4 : 1,
                cursor: (xpAvailable ?? 0) < 10 ? 'not-allowed' : 'pointer',
              }}
            >
              Gain Force Rating 1 — 10 XP
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: SP[2], paddingBottom: SP[1], borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim,
              }}>
                Force Powers
              </div>
              {/* Correction C: standard ghost pattern — was accent-red fill
                  with gold text (a token mismatch), now matches "Upgrade
                  Talents" (HudTalentsTab.tsx) exactly: transparent bg tint,
                  gold border, gold text. */}
              <button
                onClick={onAdd}
                className="hov-gold-bg cursor-pointer"
                style={{
                  background: 'color-mix(in srgb, var(--hud-gold) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)',
                  borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[3]}`,
                  fontFamily: FONT_BODY, fontSize: FS.label,
                  fontWeight: 700, letterSpacing: '0.1em',
                  color: C.gold,
                  transition: EASE.default,
                }}
              >
                Buy New Force Power
              </button>
            </div>

            {forcePowers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: SP[2] }}>
                {/* Primary Fix: the drawer for an expanded power renders as a
                    grid SIBLING right after its card (gridColumn:'1 / -1'
                    inside PowerDrawer spans every column), not nested inside
                    the card — a Fragment lets one .map() iteration emit both
                    the card and its (optional) full-width drawer as two
                    separate grid children in the same position. */}
                {forcePowers.map((fp, idx) => (
                  <Fragment key={fp.powerKey}>
                    <div data-stagger={idx}>
                      <div className="panel-row-enter">
                        <ForcePowerCard
                          fp={fp}
                          isExpanded={expandedPowerKey === fp.powerKey}
                          onToggle={() => setExpandedPowerKey(k => (k === fp.powerKey ? null : fp.powerKey))}
                        />
                      </div>
                    </div>
                    {expandedPowerKey === fp.powerKey && (
                      <PowerDrawer
                        fp={fp}
                        onOpenInTree={onAdd}
                        forceRating={forceRating}
                        committedForce={committedForce}
                        commitRowRef={commitRowRef}
                        onCommit={onCommit}
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ gap: SP[3], padding: `${SP[4]} 0` }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: C.textFaint }}>
                  No force powers purchased yet.
                </div>
                <button
                  onClick={onAdd}
                  className="cursor-pointer force-browse-btn"
                  style={{
                    border: `1px solid ${FORCE_BLUE_DIM}`,
                    borderRadius: RADIUS.md, padding: `${SP[2]} var(--space-5)`,
                    fontFamily: FONT_BODY, fontSize: FS.label,
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: FORCE_BLUE,
                  }}
                >
                  Browse Force Powers
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Committed Dice ───────────────────────────────────────────────── */}
      <CommittedDiceSection
        forceRating={forceRating}
        availableForceRating={availableForceRating}
        commitments={commitments}
        onCancelCommit={onCancelCommit}
        commitRowRef={commitRowRef}
      />
    </div>
  )
}
