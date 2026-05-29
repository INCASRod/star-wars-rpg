'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  CHAR_ABBR3,
  type DiceType,
} from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { RichText } from '@/components/ui/RichText'
import { getSkillPool, rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import type { HudSkill } from '@/components/player-hud/SkillsPanel'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, RADIUS, Z, EASE } from '@/lib/tokens'

// ── Local tokens ──────────────────────────────────────────────────────────────
const POP_BG    = 'var(--hud-surface-hi)'
const BORDER    = 'var(--hud-border-hi)'
const SEC_LABEL = HUD.textDim
const DIM       = HUD.border

// ── Difficulty presets ────────────────────────────────────────────────────────
const DIFF_PRESETS = [
  { label: 'Simple',    dif: 0 },
  { label: 'Easy',      dif: 1 },
  { label: 'Average',   dif: 2 },
  { label: 'Hard',      dif: 3 },
  { label: 'Daunting',  dif: 4 },
  { label: 'Formidable', dif: 5 },
]

// ── Adjustable dice (display order: 2×2 grid) ─────────────────────────────────
const ADJ_DICE: { key: DiceType }[] = [
  { key: 'difficulty' },
  { key: 'challenge'  },
  { key: 'boost'      },
  { key: 'setback'    },
]

// ── ± button ──────────────────────────────────────────────────────────────────
function AdjBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--hud-surface-mid)',
        border: `1px solid ${hovered && !disabled ? 'color-mix(in srgb, var(--hud-accent) 40%, transparent)' : DIM}`,
        borderRadius: RADIUS.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? HUD.textFaint : HUD.text,
        fontSize: 15,
        lineHeight: 1,
        opacity: disabled ? 0.4 : 1,
        transition: `border-color ${EASE.default}`,
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
  talentHints?: TalentHint[]
  onRoll: (result: RollResult, label: string, pool: Record<DiceType, number>) => void
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SkillRollPopover({ skill, anchor, talentHints, onRoll, onClose }: SkillRollPopoverProps) {
  const [difficulty, setDifficulty] = useState(0)
  const [challenge,  setChallenge]  = useState(0)
  const [boost,      setBoost]      = useState(0)
  const [setback,    setSetback]    = useState(0)

  // Position state — null = not yet measured (render hidden first)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)

  // Measure after first paint, then position
  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = el.offsetWidth
    const MARGIN = 8

    const top = anchor.top > h + 16
      ? anchor.top - h - MARGIN          // above
      : anchor.bottom + MARGIN           // below

    const left = Math.min(
      Math.max(8, anchor.left),
      window.innerWidth - w - 16,
    )

    setPos({ top, left })
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

  const isActiveDiffPreset = (dif: number) => difficulty === dif && challenge === 0

  const popover = (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top:  pos?.top  ?? anchor.top,
        left: pos?.left ?? anchor.left,
        zIndex: Z.overlay,
        width: 'clamp(280px, 30vw, 360px)',
        background: POP_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.xl,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        // rgba(0,0,0,*) shadow overlay — pre-approved exception
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        padding: 16,
        visibility: pos ? 'visible' : 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
        <span style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
          fontWeight: 700,
          color: HUD.gold,
        }}>
          {skill.name}
        </span>
        <span style={{ color: 'color-mix(in srgb, var(--hud-accent) 40%, transparent)', fontFamily: FONT_BODY, fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)' }}>&middot;</span>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          color: 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
        }}>
          {CHAR_ABBR3[skill.charKey]}
        </span>
      </div>

      {/* ── Your Dice ─────────────────────────────────────────────────────── */}
      <SectionLabel text="Your Dice" />
      <div style={{ marginBottom: 10 }}>
        {proficiency === 0 && ability === 0 ? (
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)',
            color: HUD.textFaint,
            fontStyle: 'italic',
          }}>
            No dice &mdash; characteristic is 0
          </span>
        ) : (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {proficiency > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: proficiency }).map((_, i) => (
                    <DiceFace key={i} type="proficiency" size={10} />
                  ))}
                </div>
                {/* Proficiency die identity tint — pre-approved exception (die colour) */}
                <span style={{ fontFamily: FONT_BODY, fontSize: 'clamp(0.58rem, 1vw, 0.68rem)', color: 'rgba(245,197,24,0.65)' }}>
                  PRF
                </span>
              </div>
            )}
            {ability > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: ability }).map((_, i) => (
                    <DiceFace key={i} type="ability" size={10} />
                  ))}
                </div>
                {/* Ability die identity tint — pre-approved exception (die colour) */}
                <span style={{ fontFamily: FONT_BODY, fontSize: 'clamp(0.58rem, 1vw, 0.68rem)', color: 'rgba(76,175,80,0.65)' }}>
                  ABL
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Difficulty shortcuts ────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: 12, paddingBottom: 2 }}>
        {DIFF_PRESETS.map(p => {
          const active = isActiveDiffPreset(p.dif)
          return (
            <button
              key={p.label}
              onClick={() => { setDifficulty(p.dif); setChallenge(0) }}
              style={{
                display: 'inline-block',
                marginRight: 4,
                padding: '3px 7px',
                // Difficulty dice identity colour — pre-approved exception
                background: active ? 'rgba(123,31,162,0.3)' : 'rgba(123,31,162,0.12)',
                border: `1px solid ${active ? 'rgba(123,31,162,0.9)' : 'rgba(123,31,162,0.4)'}`,
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontFamily: FONT_BODY,
                fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                // Active tint tied to difficulty die identity — pre-approved exception
                color: active ? '#CE93D8' : 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                transition: `border-color ${EASE.default}, background ${EASE.default}`,
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* ── Add Dice ──────────────────────────────────────────────────────── */}
      <SectionLabel text="Add Dice" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 14 }}>
        {ADJ_DICE.map(({ key }) => {
          const [count, setCount] = getAdj(key)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <DiceFace type={key} size={20} />
              <AdjBtn label="-" disabled={count <= 0} onClick={() => setCount(Math.max(0, count - 1))} />
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)',
                color: HUD.gold,
                minWidth: 24,
                textAlign: 'center',
              }}>
                {count}
              </span>
              <AdjBtn label="+" disabled={false} onClick={() => setCount(count + 1)} />
            </div>
          )
        })}
      </div>

      {/* ── Relevant Talents ─────────────────────────────────────────────── */}
      {talentHints && talentHints.length > 0 && (
        <>
          <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />
          <SectionLabel text="Relevant Talents" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {talentHints.map((hint, i) => (
              <div key={i} style={{
                background: 'var(--hud-surface-lo)',
                border: `1px solid ${HUD.border}`,
                borderRadius: RADIUS.lg,
                padding: '6px 8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)',
                    fontWeight: 700,
                    color: HUD.gold,
                  }}>
                    {hint.name}
                  </span>
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(0.55rem, 0.9vw, 0.62rem)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: HUD.textFaint,
                    border: `1px solid ${HUD.border}`,
                    borderRadius: RADIUS.sm,
                    padding: '0 4px',
                  }}>
                    {ACTIVATION_SHORT[hint.activation] ?? hint.activation}
                  </span>
                  {hint.ranks > 1 && (
                    <span style={{
                      fontFamily: FONT_BODY,
                      fontSize: 'clamp(0.55rem, 0.9vw, 0.62rem)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: HUD.text,
                      background: 'var(--hud-surface-mid)',
                      border: `1px solid ${HUD.border}`,
                      borderRadius: RADIUS.sm,
                      padding: '0 5px',
                    }}>
                      Rank {hint.ranks}
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: 'clamp(0.55rem, 0.95vw, 0.65rem)',
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

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: HUD.border, marginBottom: 12 }} />

      {/* ── Roll button ──────────────────────────────────────────────────── */}
      <button
        onClick={handleRoll}
        style={{
          width: '100%',
          height: 40,
          background: `linear-gradient(135deg, ${HUD.gold} 0%, ${HUD.gold} 100%)`,
          border: 'none',
          borderRadius: RADIUS.lg,
          cursor: 'pointer',
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--hud-vital-text)',
        }}
      >
        Roll
      </button>
    </div>
  )

  return createPortal(popover, document.body)
}

// ── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_BODY,
      fontSize: 'clamp(0.55rem, 1vw, 0.65rem)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: SEC_LABEL,
      marginBottom: 6,
    }}>
      {text}
    </div>
  )
}
