'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  type DiceType,
} from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { RichText } from '@/components/ui/RichText'
import { getSkillPool, rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import type { HudSkill } from '@/components/player-hud/SkillsPanel'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP, Z, EASE, CHAR_FULL } from '@/lib/tokens'
import type { Character } from '@/lib/types'

// ── Local tokens ──────────────────────────────────────────────────────────────
const POP_BG    = 'var(--hud-surface-hi)'
const BORDER    = 'var(--hud-border-hi)'
const SEC_LABEL = HUD.textDim
const DIM       = HUD.border

// ── Difficulty presets ────────────────────────────────────────────────────────
const DIFF_PRESETS = [
  { label: 'Simple',     dif: 0 },
  { label: 'Easy',       dif: 1 },
  { label: 'Average',    dif: 2 },
  { label: 'Hard',       dif: 3 },
  { label: 'Daunting',   dif: 4 },
  { label: 'Formidable', dif: 5 },
]

// ── Difficulty pill colour gradient ───────────────────────────────────────────
// difficulty gradient — game-mechanic colour progression, pre-approved exception
const DIFF_COLORS = [
  // Simple — neutral dim
  {
    border:       'rgba(120,100,140,0.25)',
    bg:           'rgba(120,100,140,0.05)',
    color:        'rgba(180,160,200,0.45)',
    activeBorder: 'rgba(160,140,180,0.6)',
    activeBg:     'rgba(120,100,140,0.15)',
    activeColor:  'rgba(200,180,220,0.85)',
  },
  // Easy — same as Simple
  {
    border:       'rgba(120,100,140,0.25)',
    bg:           'rgba(120,100,140,0.05)',
    color:        'rgba(180,160,200,0.45)',
    activeBorder: 'rgba(160,140,180,0.6)',
    activeBg:     'rgba(120,100,140,0.15)',
    activeColor:  'rgba(200,180,220,0.85)',
  },
  // Average — difficulty purple (pre-approved die-identity exception)
  {
    border:       'rgba(123,31,162,0.45)',
    bg:           'rgba(123,31,162,0.1)',
    color:        'rgba(206,147,216,0.7)',
    activeBorder: 'rgba(123,31,162,0.9)',
    activeBg:     'rgba(123,31,162,0.25)',
    activeColor:  '#CE93D8',
  },
  // Hard — purple-red
  {
    border:       'rgba(150,30,120,0.45)',
    bg:           'rgba(150,30,120,0.1)',
    color:        'rgba(210,100,180,0.7)',
    activeBorder: 'rgba(150,30,120,0.85)',
    activeBg:     'rgba(150,30,120,0.22)',
    activeColor:  'rgba(230,130,200,0.95)',
  },
  // Daunting — red-purple
  {
    border:       'rgba(170,30,80,0.45)',
    bg:           'rgba(170,30,80,0.1)',
    color:        'rgba(220,80,130,0.75)',
    activeBorder: 'rgba(170,30,80,0.85)',
    activeBg:     'rgba(170,30,80,0.22)',
    activeColor:  'rgba(240,110,160,0.95)',
  },
  // Formidable — full accent red (theme-responsive)
  {
    border:       'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
    bg:           'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
    color:        'color-mix(in srgb, var(--hud-accent) 70%, transparent)',
    activeBorder: 'var(--hud-accent)',
    activeBg:     'color-mix(in srgb, var(--hud-accent) 22%, transparent)',
    activeColor:  'var(--hud-text)',
  },
]

// ── Adjustable dice (display order: 2×2 grid) ─────────────────────────────────
const ADJ_DICE: { key: DiceType }[] = [
  { key: 'difficulty' },
  { key: 'challenge'  },
  { key: 'boost'      },
  { key: 'setback'    },
]

// ── Characteristics grid config ───────────────────────────────────────────────
const CHAR_GRID = [
  { key: 'brawn',     label: 'BRN' },
  { key: 'agility',   label: 'AGI' },
  { key: 'intellect', label: 'INT' },
  { key: 'cunning',   label: 'CUN' },
  { key: 'willpower', label: 'WIL' },
  { key: 'presence',  label: 'PRS' },
] as const

// ── ± button ──────────────────────────────────────────────────────────────────
function AdjBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="adj-btn-popover"
      style={{
        width: SP[4],
        height: SP[4],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--hud-surface-mid)',
        border: `1px solid ${DIM}`,
        borderRadius: RADIUS.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? HUD.textFaint : HUD.text,
        fontSize: FS.sm,
        lineHeight: 1,
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

// ── Talent hint ───────────────────────────────────────────────────────────────
export interface TalentHint {
  name: string
  activation: string
  description: string
  ranks: number
}

const ACTIVATION_SHORT: Record<string, string> = {
  taPassive:        'Passive',
  taAction:         'Action',
  taManeuver:       'Maneuver',
  taIncidental:     'Incidental',
  taIncidentalOOT:  'OOT Incidental',
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface SkillRollPopoverProps {
  skill: HudSkill
  anchor: DOMRect
  character: Character
  talentHints?: TalentHint[]
  onRoll: (result: RollResult, label: string, pool: Record<DiceType, number>) => void
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SkillRollPopover({ skill, anchor, character, talentHints, onRoll, onClose }: SkillRollPopoverProps) {
  const [difficulty, setDifficulty] = useState(0)
  const [challenge,  setChallenge]  = useState(0)
  const [boost,      setBoost]      = useState(0)
  const [setback,    setSetback]    = useState(0)

  const handleUpgradeCheck = () => {
    if (difficulty + challenge >= 5) return
    if (difficulty > 0) {
      setDifficulty(d => d - 1)
      setChallenge(c => c + 1)
    } else {
      setChallenge(c => c + 1)
    }
  }

  const handleDowngradeCheck = () => {
    if (challenge > 0) {
      setChallenge(c => c - 1)
      setDifficulty(d => d + 1)
    } else if (difficulty > 0) {
      setDifficulty(d => d - 1)
    }
  }

  // Position state — null = not yet measured (render hidden first)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const [maxH, setMaxH] = useState<number | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)

  // Measure after first paint, then position
  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h  = el.offsetHeight
    const w  = el.offsetWidth
    const MARGIN = 8
    const spaceAbove = anchor.top - MARGIN
    const spaceBelow = window.innerHeight
      - anchor.bottom - MARGIN

    const top = spaceAbove >= h
      ? anchor.top - h - MARGIN
      : spaceBelow >= h
        ? anchor.bottom + MARGIN
        : spaceAbove > spaceBelow
          ? Math.max(MARGIN, anchor.top - h - MARGIN)
          : anchor.bottom + MARGIN

    const availableHeight = spaceAbove >= h
      ? spaceAbove - MARGIN
      : Math.min(h, spaceBelow - MARGIN)

    const left = Math.min(
      Math.max(MARGIN, anchor.left),
      window.innerWidth - w - MARGIN * 2,
    )
    setPos({ top, left })
    setMaxH(availableHeight)
    requestAnimationFrame(() => setVisible(true))
  }, [anchor])

  // Click-outside and Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const handleRoll = () => {
    const pool: Record<DiceType, number> = {
      proficiency, ability,
      difficulty, challenge, boost, setback,
      force: 0,
    }
    onRoll(rollPool(pool), skill.name, pool)
  }

  // Map dice key → count + setter
  const getAdj = (key: DiceType): [number, (v: number) => void] => {
    if (key === 'difficulty') return [difficulty, setDifficulty]
    if (key === 'challenge')  return [challenge,  setChallenge]
    if (key === 'boost')      return [boost,      setBoost]
    return                           [setback,    setSetback]
  }

  const getAddDisabled = (key: DiceType): boolean => {
    if (key === 'difficulty' || key === 'challenge') return difficulty + challenge >= 5
    if (key === 'boost')   return boost >= 5
    return setback >= 5
  }

  const isActiveDiffPreset = (dif: number) => difficulty === dif && challenge === 0

  const totalDice = proficiency + ability + boost + difficulty + challenge + setback

  const popover = (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top:  pos?.top  ?? anchor.top,
        left: pos?.left ?? anchor.left,
        zIndex: Z.overlay,
        width: 'clamp(17rem, 22vw, 22rem)', /* popover width constraint — layout-derived, no SP token equivalent */
        maxHeight: maxH ? `${maxH}px` : '90vh', /* runtime-computed from offsetHeight — not a hardcoded constant */
        background: POP_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.xl,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        // rgba(0,0,0,*) shadow overlay — pre-approved exception
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        visibility: pos ? 'visible' : 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: `opacity ${EASE.quick}, transform ${EASE.quick}`,
      }}
    >

      {/* ── Header strip ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
        borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        flexShrink: 0,
      }}>
        {/* Skill name · Rank N · Char name — left */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'nowrap',
          gap: SP[1],
          flex: 1,
          minWidth: 0,
        }}>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: FS.sm,
            fontWeight: 700,
            color: 'var(--hud-gold)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {skill.name}
          </span>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: FS.overline,
            color: 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            · Rank {skill.rank}
          </span>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: FS.overline,
            color: 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            · {CHAR_FULL[skill.charKey]}
          </span>
        </div>

        {/* Close — right */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--hud-text-faint)',
            fontSize: FS.sm,
            padding: `0 ${SP[1]}`,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >✕</button>
      </div>

      {/* ── Padded body ─────────────────────────────────────────────────────── */}
      <div style={{ padding: `${SP[2]} ${SP[4]} ${SP[4]}`, overflowY: 'auto', flex: 1 }}>

        {/* ── 1. Characteristics Grid ───────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: SP[1],
          marginBottom: SP[3],
        }}>
          {CHAR_GRID.map(({ key, label }) => {
            const isLinked = skill.charKey === key
            return (
              <div key={key} style={{
                textAlign: 'center',
                padding: `2px ${SP[1]}`, /* 2px top/bottom — minimum to avoid text touching border, px intentional */
                background: isLinked
                  ? 'color-mix(in srgb, var(--hud-accent) 12%, transparent)'
                  : 'color-mix(in srgb, var(--hud-accent) 5%, transparent)',
                border: isLinked
                  ? '1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)'
                  : '1px solid color-mix(in srgb, var(--hud-accent) 15%, transparent)',
                borderRadius: RADIUS.md,
              }}>
                <div style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: FS.caption,
                  fontWeight: 700,
                  color: isLinked ? HUD.gold : HUD.text,
                  lineHeight: 1,
                }}>
                  {character[key as keyof Character] as number}
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: FS.overline,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isLinked ? HUD.textDim : HUD.textFaint,
                }}>
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 2. Your Dice ──────────────────────────────────────────────────── */}
        <SectionLabel text="Your Dice" />
        <div style={{ marginBottom: SP[3] }}>
          {proficiency === 0 && ability === 0 ? (
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: FS.caption,
              color: HUD.textFaint,
              fontStyle: 'italic',
            }}>
              No dice &mdash; characteristic is 0
            </span>
          ) : (
            <div style={{ display: 'flex', gap: SP[3], alignItems: 'center', flexWrap: 'wrap' }}>
              {proficiency > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 /* die-geometry gap — px intentional, no SP token maps to this scale */ }}>
                  <div style={{ display: 'flex', gap: 3 /* die-geometry gap — px intentional, no SP token maps to this scale */ }}>
                    {Array.from({ length: proficiency }).map((_, i) => (
                      <DiceFace key={i} type="proficiency" size={20} />
                    ))}
                  </div>
                  {/* Proficiency die identity tint — pre-approved exception (die colour) */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(245,197,24,0.65)' }}>
                    PRF
                  </span>
                </div>
              )}
              {ability > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 /* die-geometry gap — px intentional, no SP token maps to this scale */ }}>
                  <div style={{ display: 'flex', gap: 3 /* die-geometry gap — px intentional, no SP token maps to this scale */ }}>
                    {Array.from({ length: ability }).map((_, i) => (
                      <DiceFace key={i} type="ability" size={20} />
                    ))}
                  </div>
                  {/* Ability die identity tint — pre-approved exception (die colour) */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(76,175,80,0.65)' }}>
                    ABL
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 3. Difficulty ─────────────────────────────────────────────────── */}
        <SectionLabel text="Difficulty" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1], marginBottom: SP[2], justifyContent: 'flex-start' }}>
          {DIFF_PRESETS.map(({ label, dif }, idx) => {
            const active = isActiveDiffPreset(dif)
            const c = DIFF_COLORS[idx]
            return (
              <button
                key={label}
                onClick={() => { setDifficulty(dif); setChallenge(0) }}
                style={{
                  flex: '0 0 auto',
                  padding: `2px ${SP[2]}`, /* 2px vertical — px intentional, tightest readable pill height */
                  fontFamily: FONT_BODY,
                  fontSize: FS.overline,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: RADIUS.sm,
                  border: active ? `1px solid ${c.activeBorder}` : `1px solid ${c.border}`,
                  background: active ? c.activeBg : c.bg,
                  color: active ? c.activeColor : c.color,
                  cursor: 'pointer',
                  transition: `background ${EASE.quick}, border-color ${EASE.quick}, color ${EASE.quick}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: SP[1], alignItems: 'center', marginBottom: SP[1] }}>
          {Array.from({ length: difficulty }).map((_, i) => (
            <DiceFace key={i} type="difficulty" size={14} />
          ))}
          {Array.from({ length: challenge }).map((_, i) => (
            <DiceFace key={`c${i}`} type="challenge" size={14} />
          ))}
          {difficulty + challenge > 0 && (
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              color: HUD.textFaint,
              marginLeft: SP[1],
            }}>
              {difficulty + challenge} dice
            </span>
          )}
        </div>

        {/* ── Upgrade / Downgrade Check ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: SP[2], marginTop: SP[2], marginBottom: SP[3] }}>
          <button
            onClick={handleUpgradeCheck}
            disabled={difficulty + challenge >= 5}
            style={{
              flex: 1,
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: `2px ${SP[2]}`, /* 2px vertical — px intentional, tightest readable button height */
              borderRadius: RADIUS.sm,
              border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
              background: `color-mix(in srgb, var(--hud-accent) 10%, transparent)`,
              color: `color-mix(in srgb, var(--hud-accent) 80%, transparent)`,
              cursor: difficulty + challenge >= 5 ? 'not-allowed' : 'pointer',
              opacity: difficulty + challenge >= 5 ? 0.4 : 1,
              whiteSpace: 'nowrap',
              transition: `opacity ${EASE.quick}, background ${EASE.quick}`,
            }}
          >↑ Upgrade Check</button>

          <button
            onClick={handleDowngradeCheck}
            disabled={difficulty + challenge === 0}
            style={{
              flex: 1,
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: `2px ${SP[2]}`, /* 2px vertical — px intentional, tightest readable button height */
              borderRadius: RADIUS.sm,
              border: `1px solid color-mix(in srgb, var(--state-dark-fp) 45%, transparent)`,
              background: `color-mix(in srgb, var(--state-dark-fp) 8%, transparent)`,
              color: `color-mix(in srgb, var(--state-dark-fp) 80%, transparent)`,
              cursor: difficulty + challenge === 0 ? 'not-allowed' : 'pointer',
              opacity: difficulty + challenge === 0 ? 0.4 : 1,
              whiteSpace: 'nowrap',
              transition: `opacity ${EASE.quick}, background ${EASE.quick}`,
            }}
          >↓ Downgrade Check</button>
        </div>

        {/* ── 4. Add Dice ───────────────────────────────────────────────────── */}
        <SectionLabel text="Add Dice" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${SP[2]} ${SP[4]}`, marginBottom: SP[2] }}>
          {ADJ_DICE.map(({ key }) => {
            const [count, setCount] = getAdj(key)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 /* die-geometry gap — px intentional, no SP token maps to this scale */ }}>
                <DiceFace type={key} size={20} />
                <AdjBtn label="-" disabled={count <= 0} onClick={() => setCount(Math.max(0, count - 1))} />
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: FS.sm,
                  color: HUD.gold,
                  minWidth: SP[3],
                  textAlign: 'center',
                }}>
                  {count}
                </span>
                <AdjBtn label="+" disabled={getAddDisabled(key)} onClick={() => setCount(count + 1)} />
              </div>
            )
          })}
        </div>

        {/* ── 5. Relevant Talents ───────────────────────────────────────────── */}
        {talentHints && talentHints.length > 0 && (
          <>
            <div style={{ height: 1 /* 1px decorative divider — px intentional */, background: HUD.border, marginBottom: SP[2] }} />
            <SectionLabel text="Relevant Talents" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginBottom: SP[3] }}>
              {talentHints.map((hint, i) => (
                <div key={i} style={{
                  background: 'var(--hud-surface-lo)',
                  border: `1px solid ${HUD.border}`,
                  borderRadius: RADIUS.lg,
                  padding: `${SP[1]} ${SP[2]}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], marginBottom: SP[1] }}>
                    <span style={{
                      fontFamily: FONT_BODY,
                      fontSize: FS.caption,
                      fontWeight: 700,
                      color: HUD.gold,
                    }}>
                      {hint.name}
                    </span>
                    <span style={{
                      fontFamily: FONT_BODY,
                      fontSize: FS.overline,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: HUD.textFaint,
                      border: `1px solid ${HUD.border}`,
                      borderRadius: RADIUS.sm,
                      padding: `0 ${SP[1]}`,
                    }}>
                      {ACTIVATION_SHORT[hint.activation] ?? hint.activation}
                    </span>
                    {hint.ranks > 1 && (
                      <span style={{
                        fontFamily: FONT_BODY,
                        fontSize: FS.overline,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: HUD.text,
                        background: 'var(--hud-surface-mid)',
                        border: `1px solid ${HUD.border}`,
                        borderRadius: RADIUS.sm,
                        padding: `0 ${SP[1]}`,
                      }}>
                        Rank {hint.ranks}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: FS.overline,
                    color: HUD.textDim,
                    lineHeight: 1.45,
                  }}>
                    <RichText text={hint.description} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div style={{ height: 1 /* 1px decorative divider — px intentional */, background: HUD.border, marginBottom: SP[2] }} />

        {/* ── 6. Roll button ────────────────────────────────────────────────── */}
        <button
          onClick={handleRoll}
          disabled={totalDice === 0}
          style={{
            width: '100%',
            padding: `${SP[2]} 0`,
            background: totalDice === 0 ? 'var(--hud-surface-mid)' : 'var(--hud-gold)',
            color: totalDice === 0 ? HUD.textFaint : 'var(--hud-bg)',
            border: 'none',
            borderRadius: RADIUS.md,
            cursor: totalDice === 0 ? 'not-allowed' : 'pointer',
            opacity: totalDice === 0 ? 0.5 : 1,
            fontFamily: FONT_DISPLAY,
            fontSize: FS.sm,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {totalDice === 0
            ? 'Add Dice to Roll'
            : `Roll ${totalDice} ${totalDice === 1 ? 'Die' : 'Dice'}`}
        </button>

      </div>
    </div>
  )

  return createPortal(popover, document.body)
}

// ── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_BODY,
      fontSize: FS.overline,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: SEC_LABEL,
      marginBottom: SP[1],
    }}>
      {text}
    </div>
  )
}
