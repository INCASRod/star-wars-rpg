'use client'
import { HUD } from '@/lib/tokens'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL  = 'var(--hud-surface-hi)'
const BORDER = 'var(--hud-border)'
const FONT_C = 'var(--font-body)'
const FONT_R = 'var(--font-body)'

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
        color: HUD.gold,
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
          background: 'var(--hud-surface-lo)',
          border: `1px solid var(--hud-border)`,
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 20,
          lineHeight: 1,
          fontFamily: FONT_R,
          color: HUD.gold,
          transition: 'background 0.15s',
        }}
      >
        🎲
      </button>
    </div>
  )
}
