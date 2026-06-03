'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { HUD, FONT_BODY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

const BG     = 'var(--hud-surface-hi)'
const PANEL  = 'var(--hud-surface-mid)'
const TEXT   = 'var(--hud-text)'
const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'

const DRAWER_WIDTH = 'clamp(380px, 36vw, 540px)'

export interface StagingRightDrawerProps {
  open:      boolean
  onClose:   () => void
  title:     string
  children?: ReactNode
}

/**
 * StagingRightDrawer — slides in from the right, mirroring StagingLeftDrawer.
 *
 * z-index stack:
 *   backdrop  8999
 *   panel     9000
 *   left rail 9001  (always above)
 *   top bar   9002
 *   right rail 9003 (always above)
 */
export function StagingRightDrawer({ open, onClose, title, children }: StagingRightDrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 8999,
          }}
        />
      )}

      <div
        style={{
          position:      'fixed',
          top:           0,
          right:         0,
          bottom:        0,
          width:         DRAWER_WIDTH,
          zIndex:        9000,
          display:       'flex',
          flexDirection: 'column',
          background:    BG,
          borderLeft:    `1px solid ${open ? BORDER_HI : 'transparent'}`,
          boxShadow:     open ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
          transform:     open ? 'translateX(0)' : 'translateX(100%)',
          transition:    `transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color ${EASE.default}`,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `0 ${SP[4]}`,
            height: '3.125rem',
            borderBottom: `1px solid ${BORDER}`,
            background: PANEL,
          }}
        >
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="staging-close-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: FS.body, lineHeight: 1,
              padding: '0.25rem 0.375rem', borderRadius: RADIUS.md,
              fontFamily: FONT_BODY,
            }}
          >
            ✕
          </button>
          <span
            style={{
              fontFamily: FONT_BODY, fontSize: 'var(--text-label)', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.gold,
            }}
          >
            {title}
          </span>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>,
    document.body,
  )
}
