'use client'

import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'
import { TickerText } from '@/components/ui/TickerText'
import { HudPanelContext } from '@/contexts/HudPanelContext'

interface HudFullPanelProps {
  open:     boolean
  title:    string
  symbol:   string
  onClose:  () => void
  children: React.ReactNode
}

export function HudFullPanel({ open, title, symbol, onClose, children }: HudFullPanelProps) {
  return (
    <div
      className={`hud-full-panel${open ? ' open' : ''}`}
      style={{
        background:  'var(--hud-surface-lo)',
        borderRight: '1px solid var(--hud-border-hi)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-panel)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{symbol}</span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--hud-text)', flex: 1,
        }}>
          <TickerText text={title} isOpen={open} delayMs={80} />
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hud-text-dim)', fontSize: 15, lineHeight: 1,
            padding: '2px 4px', borderRadius: RADIUS.sm,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <HudPanelContext.Provider value={{ isOpen: open }}>
          {children}
        </HudPanelContext.Provider>
      </div>
    </div>
  )
}
