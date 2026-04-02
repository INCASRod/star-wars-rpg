'use client'

import { useState } from 'react'

const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.7)'
const FONT_C   = "var(--font-cinzel), 'Cinzel', serif"

interface CombatCheckButtonProps {
  onOpen:     () => void
  isInCombat: boolean
}

const PULSE_STYLE = `
@keyframes combatPulse {
  0%, 100% { border-color: rgba(200,170,80,0.45); box-shadow: none; }
  50%       { border-color: rgba(200,170,80,0.8);  box-shadow: 0 0 14px rgba(200,170,80,0.2); }
}
.combat-check-btn-pulse {
  animation: combatPulse 2s ease-in-out infinite;
}
.combat-check-btn {
  transition: all 150ms ease;
}
.combat-check-btn:hover {
  background: rgba(200,170,80,0.2) !important;
  border-color: rgba(200,170,80,0.7) !important;
  box-shadow: 0 0 12px rgba(200,170,80,0.15) !important;
  transform: translateY(-1px);
}
.combat-check-btn:active {
  transform: translateY(0) !important;
  box-shadow: 0 0 6px rgba(200,170,80,0.1) !important;
}
`

export function CombatCheckButton({ onOpen, isInCombat }: CombatCheckButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: pressed
      ? 'rgba(200,170,80,0.12)'
      : hovered
      ? 'rgba(200,170,80,0.2)'
      : 'linear-gradient(135deg, rgba(200,170,80,0.15), rgba(200,170,80,0.08))',
    border: `1px solid ${hovered ? 'rgba(200,170,80,0.7)' : 'rgba(200,170,80,0.45)'}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: FONT_C,
    fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
    fontWeight: 700,
    color: GOLD,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    boxShadow: pressed
      ? '0 0 6px rgba(200,170,80,0.1)'
      : hovered
      ? '0 0 12px rgba(200,170,80,0.15)'
      : 'none',
    transform: hovered && !pressed ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'all 150ms ease',
  }

  return (
    <>
      <style>{PULSE_STYLE}</style>
      <button
        className={isInCombat && !hovered ? 'combat-check-btn-pulse' : undefined}
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false) }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onClick={onOpen}
      >
        <svg
          width="clamp(14px, 1.2vw, 17px)"
          height="clamp(14px, 1.2vw, 17px)"
          viewBox="0 0 20 20"
          fill="none"
          style={{ flexShrink: 0, opacity: 0.85 }}
          aria-hidden="true"
        >
          {/* Crossed swords icon */}
          <line x1="3" y1="3" x2="17" y2="17" stroke={GOLD_DIM} strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke={GOLD_DIM} strokeWidth="2" strokeLinecap="round" />
          <circle cx="3"  cy="3"  r="1.5" fill={GOLD_DIM} />
          <circle cx="17" cy="3"  r="1.5" fill={GOLD_DIM} />
          <circle cx="3"  cy="17" r="1.5" fill={GOLD_DIM} />
          <circle cx="17" cy="17" r="1.5" fill={GOLD_DIM} />
          <circle cx="10" cy="10" r="1.5" fill={GOLD_DIM} />
        </svg>
        Combat Check
      </button>
    </>
  )
}
