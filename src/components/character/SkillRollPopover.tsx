'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  C, CHAR_ABBR3, FONT_CINZEL, FONT_RAJDHANI,
  type DiceType,
} from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool, rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import type { HudSkill } from '@/components/player-hud/SkillsPanel'

// ─── Local tokens ─────────────────────────────────────────────────────────────
const FONT_MONO = "'Share Tech Mono', 'Courier New', monospace"
const POP_BG    = 'rgba(6,13,9,0.97)'
const BORDER    = 'rgba(200,170,80,0.35)'
const SEC_LABEL = 'rgba(200,170,80,0.45)'
const GOLD      = '#C8AA50'
const DIM       = 'rgba(255,255,255,0.12)'

// ─── Difficulty presets ────────────────────────────────────────────────────────
const DIFF_PRESETS = [
  { label: 'Simple',    dif: 0 },
  { label: 'Easy',      dif: 1 },
  { label: 'Average',   dif: 2 },
  { label: 'Hard',      dif: 3 },
  { label: 'Daunting',  dif: 4 },
  { label: 'Formidable', dif: 5 },
]

// ─── Adjustable dice (display order: 2×2 grid) ────────────────────────────────
const ADJ_DICE: { key: DiceType; label: string; color: string }[] = [
  { key: 'difficulty', label: 'DIF', color: '#7B1FA2' },
  { key: 'challenge',  label: 'CHL', color: '#C62828' },
  { key: 'boost',      label: 'BST', color: '#29B6F6' },
  { key: 'setback',    label: 'SET', color: '#455A64' },
]

// ─── ± button ─────────────────────────────────────────────────────────────────
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
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered && !disabled ? 'rgba(200,170,80,0.4)' : DIM}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
        fontSize: 15,
        lineHeight: 1,
        opacity: disabled ? 0.4 : 1,
        transition: 'border-color 0.12s',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SkillRollPopoverProps {
  skill: HudSkill
  anchor: DOMRect
  onRoll: (result: RollResult, label: string, pool: Record<DiceType, number>) => void
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SkillRollPopover({ skill, anchor, onRoll, onClose }: SkillRollPopoverProps) {
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
        zIndex: 200,
        width: 'clamp(280px, 30vw, 360px)',
        background: POP_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        padding: 16,
        visibility: pos ? 'visible' : 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
        <span style={{
          fontFamily: FONT_CINZEL,
          fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
          fontWeight: 700,
          color: GOLD,
        }}>
          {skill.name}
        </span>
        <span style={{ color: 'rgba(200,170,80,0.4)', fontFamily: FONT_MONO, fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)' }}>·</span>
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          color: 'rgba(200,170,80,0.5)',
        }}>
          {CHAR_ABBR3[skill.charKey]}
        </span>
      </div>

      {/* ── Your Dice ───────────────────────────────────────── */}
      <SectionLabel text="Your Dice" />
      <div style={{ marginBottom: 10 }}>
        {proficiency === 0 && ability === 0 ? (
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)',
            color: C.textFaint,
            fontStyle: 'italic',
          }}>
            No dice — characteristic is 0
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
                <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.58rem, 1vw, 0.68rem)', color: 'rgba(245,197,24,0.65)' }}>
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
                <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.58rem, 1vw, 0.68rem)', color: 'rgba(76,175,80,0.65)' }}>
                  ABL
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Difficulty shortcuts ─────────────────────────────── */}
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
                background: active ? 'rgba(123,31,162,0.3)' : 'rgba(123,31,162,0.12)',
                border: `1px solid ${active ? 'rgba(123,31,162,0.9)' : 'rgba(123,31,162,0.4)'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: FONT_RAJDHANI,
                fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: active ? '#CE93D8' : 'rgba(200,170,80,0.55)',
                transition: 'border-color 0.12s, background 0.12s',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* ── Add Dice ─────────────────────────────────────────── */}
      <SectionLabel text="Add Dice" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 14 }}>
        {ADJ_DICE.map(({ key, label, color }) => {
          const [count, setCount] = getAdj(key)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                fontFamily: FONT_RAJDHANI,
                fontSize: 'clamp(0.6rem, 1vw, 0.7rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color,
                minWidth: 28,
              }}>
                {label}
              </span>
              <AdjBtn label="−" disabled={count <= 0} onClick={() => setCount(Math.max(0, count - 1))} />
              <span style={{
                fontFamily: FONT_MONO,
                fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)',
                color: GOLD,
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

      {/* ── Divider ──────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', marginBottom: 12 }} />

      {/* ── Roll button ──────────────────────────────────────── */}
      <button
        onClick={handleRoll}
        style={{
          width: '100%',
          height: 40,
          background: 'linear-gradient(135deg, #C8AA50 0%, #8B7430 100%)',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: FONT_CINZEL,
          fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#060D09',
        }}
      >
        Roll
      </button>
    </div>
  )

  return createPortal(popover, document.body)
}

// ─── Shared section label ─────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI,
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
