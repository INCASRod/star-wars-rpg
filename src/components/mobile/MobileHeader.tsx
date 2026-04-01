'use client'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL  = 'rgba(6,13,9,0.95)'
const BORDER = 'rgba(200,170,80,0.2)'
const GOLD   = '#C8AA50'
const FONT_C = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

interface MobileHeaderProps {
  characterName: string
  onOpenDiceRoller: () => void
}

export function MobileHeader({ characterName, onOpenDiceRoller }: MobileHeaderProps) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      height: 56,
      background: PANEL,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${BORDER}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.85rem, 3vw, 1rem)',
        fontWeight: 700,
        color: GOLD,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {characterName}
      </span>

      <button
        onClick={onOpenDiceRoller}
        aria-label="Open dice roller"
        style={{
          width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(200,170,80,0.08)',
          border: `1px solid rgba(200,170,80,0.25)`,
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 20,
          lineHeight: 1,
          fontFamily: FONT_R,
          color: GOLD,
          transition: 'background 0.15s',
        }}
      >
        🎲
      </button>
    </div>
  )
}
