'use client'

import { useState } from 'react'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FORCE_BLUE = '#7EC8E3'

const FORCE_PULSE_STYLE = `
@keyframes forcePulse {
  0%, 100% { border-color: rgba(126,200,227,0.45); }
  50%       { border-color: rgba(126,200,227,0.75); }
}
.force-check-btn-pulse { animation: forcePulse 3s ease-in-out infinite; }
`

interface ForceCheckButtonProps {
  onOpen: () => void
}

export function ForceCheckButton({ onOpen }: ForceCheckButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const style: React.CSSProperties = {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: pressed
      ? 'rgba(126,200,227,0.14)'
      : hovered
      ? 'rgba(126,200,227,0.18)'
      : 'rgba(126,200,227,0.1)',
    border: `1px solid ${hovered ? 'rgba(126,200,227,0.7)' : 'rgba(126,200,227,0.45)'}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: FONT_C,
    fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
    fontWeight: 700,
    color: FORCE_BLUE,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    boxShadow: hovered ? '0 0 14px rgba(126,200,227,0.2)' : 'none',
    transform: hovered && !pressed ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'all 150ms ease',
  }

  return (
    <>
      <style>{FORCE_PULSE_STYLE}</style>
      <button
        className={!hovered ? 'force-check-btn-pulse' : undefined}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false) }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onClick={onOpen}
      >
        <span style={{ opacity: 0.85, fontSize: 'clamp(13px, 1.1vw, 16px)' }}>✦</span>
        Force Check
      </button>
    </>
  )
}
