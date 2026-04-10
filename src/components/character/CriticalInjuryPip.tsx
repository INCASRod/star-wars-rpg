'use client'

import React, { useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type CritSeverity = 'minor' | 'moderate' | 'serious' | 'grievous'

/** Map any severity string (Easy/Average/Hard/Daunting/Deadly/minor/etc.) to the canonical 4 */
export function normalizeSeverity(sev: string): CritSeverity {
  const s = sev.toLowerCase()
  if (s === 'minor'   || s === 'easy')                       return 'minor'
  if (s === 'moderate'|| s === 'average')                    return 'moderate'
  if (s === 'serious' || s === 'hard')                       return 'serious'
  return 'grievous' // daunting, deadly, grievous
}

const SEV_COLOR: Record<CritSeverity, string> = {
  minor:   'rgba(255,152,0,0.7)',
  moderate:'rgba(224,82,82,0.8)',
  serious: '#DC143C',
  grievous:'rgba(139,0,0,0.9)',
}

const SEV_LABEL: Record<CritSeverity, string> = {
  minor:   'Minor',
  moderate:'Moderate',
  serious: 'Serious',
  grievous:'Grievous',
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono','Courier New',monospace"

// ── Pip data shape (matches what PlayerHUDDesktop maps from CharacterCriticalInjury) ──
export interface CritPip {
  id:           string
  severity:     string
  name:         string
  description?: string
  rollResult?:  number | null
  sessionLabel?:string | null
}

const TOOLTIP_W = 260

interface TooltipPos {
  left:    number
  openUp:  boolean
  anchorY: number  // rect.top when openUp, rect.bottom otherwise
  vh:      number  // snapshot of innerHeight for bottom calculation
}

// ── Single pip ────────────────────────────────────────────────────────────────
interface CriticalInjuryPipProps {
  pip:      CritPip
  onHeal?:  (id: string) => void
}

export function CriticalInjuryPip({ pip, onHeal }: CriticalInjuryPipProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tipPos, setTipPos] = useState<TooltipPos>({ left: 0, openUp: true, anchorY: 0, vh: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const sev   = normalizeSeverity(pip.severity)
  const color = SEV_COLOR[sev]
  const isGrievous = sev === 'grievous'

  const handleToggle = () => {
    if (tooltipOpen) { setTooltipOpen(false); return }
    if (btnRef.current) {
      const r  = btnRef.current.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Centre tooltip on pip, clamped so it never bleeds past viewport edges
      const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8))
      // Open upward if there's room (≥220 px above), otherwise downward
      const openUp = r.top >= 220
      setTipPos({ left, openUp, anchorY: openUp ? r.top : r.bottom, vh })
    }
    setTooltipOpen(true)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Blood-drop pip button */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label={`${pip.name} (${SEV_LABEL[sev]})`}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'block',
          animation: isGrievous ? 'critGrievousPulse 2s ease-in-out infinite' : undefined,
        }}
      >
        {/* Blood-drop SVG: circle with pointed top */}
        <svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M 8 2 C 8 2 14 8 14 11 A 6 6 0 0 1 2 11 C 2 8 8 2 8 2 Z" fill={color} />
        </svg>
      </button>

      {/* Tooltip — position: fixed so it's always relative to the viewport */}
      {tooltipOpen && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
            onClick={() => setTooltipOpen(false)}
          />
          <div style={{
            position: 'fixed',
            left: tipPos.left,
            // When opening upward, anchor bottom edge above the pip; downward, anchor top below it
            ...(tipPos.openUp
              ? { bottom: tipPos.vh - tipPos.anchorY + 10 }
              : { top: tipPos.anchorY + 10 }),
            zIndex: 210,
            width: TOOLTIP_W,
            background: 'rgba(6,13,9,0.97)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid rgba(220,20,60,0.35)`,
            borderRadius: 8,
            padding: '10px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
          }}>
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setTooltipOpen(false) }}
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'none', border: 'none', padding: '2px 4px',
                cursor: 'pointer', lineHeight: 1,
                fontFamily: FONT_M, fontSize: '0.7rem',
                color: 'rgba(220,20,60,0.5)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC143C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(220,20,60,0.5)' }}
              aria-label="Close"
            >✕</button>
            {/* Severity label */}
            <div style={{
              fontFamily: FONT_M,
              fontSize: 'clamp(0.55rem, 0.85vw, 0.62rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color,
              marginBottom: 3,
            }}>
              {SEV_LABEL[sev]} Critical Injury
            </div>

            {/* Injury name */}
            <div style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
              color: '#DC143C',
              fontWeight: 700,
              marginBottom: 6,
            }}>
              {pip.name}
            </div>

            <div style={{ height: 1, background: 'rgba(220,20,60,0.2)', marginBottom: 6 }} />

            {/* Description */}
            {pip.description && (
              <div style={{
                fontFamily: FONT_R,
                fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                color: 'rgba(232,223,200,0.8)',
                lineHeight: 1.5,
                marginBottom: 6,
              }}>
                {pip.description}
              </div>
            )}

            {/* Footer: session + roll */}
            {(pip.sessionLabel || pip.rollResult != null) && (
              <>
                <div style={{ height: 1, background: 'rgba(220,20,60,0.15)', marginBottom: 6 }} />
                <div style={{
                  fontFamily: FONT_M,
                  fontSize: 'clamp(0.52rem, 0.82vw, 0.6rem)',
                  color: 'rgba(200,170,80,0.5)',
                  display: 'flex', gap: 6, flexWrap: 'wrap',
                }}>
                  {pip.sessionLabel && <span>{pip.sessionLabel}</span>}
                  {pip.rollResult != null && <span>Roll: {pip.rollResult}</span>}
                </div>
              </>
            )}

            {/* Heal button (GM-facing — only shown if handler provided) */}
            {onHeal && (
              <button
                onClick={(e) => { e.stopPropagation(); onHeal(pip.id); setTooltipOpen(false) }}
                style={{
                  marginTop: 8, width: '100%',
                  background: 'rgba(78,200,122,0.1)',
                  border: '1px solid rgba(78,200,122,0.3)',
                  borderRadius: 4, padding: '4px 0',
                  fontFamily: FONT_R,
                  fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
                  fontWeight: 700, letterSpacing: '0.08em',
                  color: '#4EC87A', cursor: 'pointer',
                }}
              >
                ✓ Heal Injury
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Pip row ───────────────────────────────────────────────────────────────────
interface CriticalInjuryPipsProps {
  crits:   CritPip[]
  onHeal?: (id: string) => void
}

export function CriticalInjuryPips({ crits, onHeal }: CriticalInjuryPipsProps) {
  if (crits.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes critGrievousPulse {
          0%, 100% { opacity: 0.75; filter: brightness(1); }
          50%       { opacity: 1;   filter: brightness(1.5) drop-shadow(0 0 4px rgba(139,0,0,0.9)); }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {crits.map(pip => (
          <CriticalInjuryPip key={pip.id} pip={pip} onHeal={onHeal} />
        ))}
      </div>
    </>
  )
}
