'use client'

import { useState } from 'react'

const FONT_C = "var(--font-rajdhani), 'Cinzel', serif"

interface ForceCheckButtonProps {
  onOpen: () => void
  compact?: boolean
}

export function ForceCheckButton({ onOpen, compact = false }: ForceCheckButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const style: React.CSSProperties = {
    width: compact ? 'auto' : '100%',
    height: compact ? 22 : 48,
    padding: compact ? '0 8px' : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: compact ? 5 : 10,
    background: pressed
      ? 'rgba(126,200,227,0.14)'
      : hovered
      ? 'rgba(126,200,227,0.18)'
      : 'rgba(126,200,227,0.1)',
    border: `1px solid ${hovered ? 'rgba(58,12,4,0.55)' : 'rgba(58,12,4,0.32)'}`,
    borderRadius: compact ? 4 : 10,
    cursor: 'pointer',
    fontFamily: FONT_C,
    fontSize: compact ? '0.65rem' : 'clamp(0.85rem, 1.3vw, 1rem)',
    fontWeight: 700,
    color: '#3A0C04',
    letterSpacing: compact ? '0.06em' : '0.1em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxShadow: hovered ? '0 0 14px rgba(126,200,227,0.2)' : 'none',
    transform: hovered && !pressed ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'all 150ms ease',
  }

  return (
    <button
      className={!hovered ? 'force-check-btn-pulse' : undefined}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onOpen}
    >
      <span style={{ opacity: 0.85, fontSize: compact ? '11px' : 'clamp(13px, 1.1vw, 16px)' }}>✦</span>
      Force Check
    </button>
  )
}
