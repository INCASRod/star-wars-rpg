'use client'

import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI, FS_LABEL } from './design-tokens'
import { TalentQuickReference } from '@/components/player/TalentQuickReference'
import type { HudTalent } from './TalentsPanel'

interface HudTalentDrawerProps {
  open: boolean
  onClose: () => void
  hudTalents: HudTalent[]
}

export function HudTalentDrawer({ open, onClose, hudTalents }: HudTalentDrawerProps) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 8999,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.26s',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 320,
        zIndex: 9000,
        display: 'flex', flexDirection: 'column',
        background: 'var(--hud-surface-hi)',
        borderRight: `1px solid ${open ? 'var(--hud-border-hi)' : 'transparent'}`,
        boxShadow: open ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 50,
          borderBottom: `1px solid var(--hud-border)`,
          background: 'var(--hud-surface-hi)',
        }}>
          <span style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: C.gold, fontWeight: 700,
          }}>Talents</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--hud-text-faint)', fontSize: 18, lineHeight: 1,
              padding: '4px 6px', borderRadius: 4,
            }}
            aria-label="Close talents drawer"
          >✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <TalentQuickReference talents={hudTalents} />
        </div>
      </div>
    </>,
    document.body,
  )
}
