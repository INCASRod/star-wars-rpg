'use client'

import { memo } from 'react'
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'

export type RailPanelId =
  | 'combat' | 'force' | 'skill'
  | 'skills' | 'talents' | 'inventory' | 'lore' | 'group'
  | 'dice' | 'adversaries'

interface HudLeftRailProps {
  isForceUser:      boolean
  activePanel:      RailPanelId | null
  onPanelToggle:    (id: RailPanelId) => void
  showAdversaries?: boolean
}

const BTN_STYLE: React.CSSProperties = {
  width: 52, minHeight: 48,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 3, border: '1px solid transparent', borderRadius: RADIUS.md,
  cursor: 'pointer', background: 'transparent',
  transition: 'background 0.15s, border-color 0.15s',
  flexShrink: 0,
}

const SYMBOL_STYLE: React.CSSProperties = {
  fontSize: 16, lineHeight: 1,
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: '7px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--hud-text-dim)',
  textAlign: 'center',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  wordBreak: 'normal',
  maxWidth: 50,
}

const QUICK_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'combat', symbol: '⚔', label: 'Combat Check', cls: 'hud-rail-btn-combat' },
  { id: 'force',  symbol: '✦', label: 'Force Check',  cls: 'hud-rail-btn-force'  },
  { id: 'skill',  symbol: '◈', label: 'Skill Check',  cls: 'hud-rail-btn-skill'  },
]

const NAV_BUTTONS: { id: RailPanelId; symbol: string; label: string }[] = [
  { id: 'skills',    symbol: '≋', label: 'Skills'    },
  { id: 'talents',   symbol: '◆', label: 'Talents'   },
  { id: 'inventory', symbol: '▣', label: 'Inventory' },
  { id: 'lore',      symbol: '✧', label: 'Lore'      },
  { id: 'group',     symbol: '◎', label: 'Group'     },
]

const UTILITY_BUTTONS: { id: RailPanelId; symbol: string; label: string }[] = [
  { id: 'dice',        symbol: '⬡', label: 'Dice'       },
  { id: 'adversaries', symbol: '⚠', label: 'Adversaries' },
]

export const HudLeftRail = memo(function HudLeftRail({
  isForceUser, activePanel, onPanelToggle, showAdversaries = false,
}: HudLeftRailProps) {
  return (
    <div style={{
      width: 64, flexShrink: 0,
      background: 'var(--hud-panel)',
      borderRight: '1px solid var(--hud-border-hi)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, padding: '8px 0', overflowY: 'auto',
    }}>
      {QUICK_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'force' && !isForceUser) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {NAV_BUTTONS.map(({ id, symbol, label }) => (
        <button
          key={id}
          className={`hud-rail-btn-nav${activePanel === id ? ' active' : ''}`}
          style={BTN_STYLE}
          onClick={() => onPanelToggle(id)}
          title={label}
        >
          <span style={SYMBOL_STYLE}>{symbol}</span>
          <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
        </button>
      ))}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {UTILITY_BUTTONS.map(({ id, symbol, label }) => {
        if (id === 'adversaries' && !showAdversaries) return null
        return (
          <button
            key={id}
            className={`hud-rail-btn-nav${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}
    </div>
  )
})
