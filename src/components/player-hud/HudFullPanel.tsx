'use client'

import { useRef, useLayoutEffect } from 'react'
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
  const rootRef = useRef<HTMLDivElement>(null)

  // Set data-ticker-pass="true" on the root div whenever the panel opens.
  // useLayoutEffect fires synchronously after DOM mutations and *before* any
  // useEffect in child components, so TickerText's gate check (in useEffect)
  // will always find the attribute on the initial-open render cycle.
  // The attribute is removed after 600ms — longer than the maximum stagger
  // delay — so text that mounts later (e.g. inside accordions that open after
  // the panel is already open) never sees the gate and renders settled.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || !open) return
    el.dataset.tickerPass = 'true'
    const t = setTimeout(() => {
      if (rootRef.current) delete rootRef.current.dataset.tickerPass
    }, 600)
    return () => clearTimeout(t)
  }, [open])

  return (
    <div
      ref={rootRef}
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
