'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* ── Design tokens (mirrored from GmReferenceDrawer) ──────── */
const FC      = "var(--font-cinzel), 'Cinzel', serif"
const FR      = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const BG      = 'rgba(6,10,8,0.97)'
const PANEL   = 'rgba(10,18,12,0.92)'
const GOLD    = '#C8AA50'
const DIM     = '#6A8070'
const TEXT    = '#C8D8C0'
const BORDER     = 'rgba(200,170,80,0.14)'
const BORDER_HI  = 'rgba(200,170,80,0.36)'

const DRAWER_WIDTH = 'clamp(380px, 34vw, 520px)'

export interface StagingLeftDrawerProps {
  open:     boolean
  onClose:  () => void
  title:    string
  children?: ReactNode
}

/**
 * StagingLeftDrawer — slides in from the left, using the same animation
 * pattern as GmReferenceDrawer (which slides from the right).
 *
 * Rendered via createPortal to document.body so it escapes any parent
 * overflow or stacking context. Uses position:fixed throughout.
 *
 * z-index stack (matches GmReferenceDrawer):
 *   backdrop  8999
 *   drawer    9000
 *   rail      9001  (StagingLeftRail, always above)
 */
export function StagingLeftDrawer({ open, onClose, title, children }: StagingLeftDrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop — click outside to close, same as GmReferenceDrawer */}
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

      {/* Drawer panel — always mounted, animated via transform */}
      <div
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          bottom:        0,
          width:         DRAWER_WIDTH,
          zIndex:        9000,
          display:       'flex',
          flexDirection: 'column',
          background:    BG,
          borderRight:   `1px solid ${open ? BORDER_HI : 'transparent'}`,
          boxShadow:     open ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
          /* slides from left: closed = off-screen left, open = in view */
          transform:     open ? 'translateX(0)' : 'translateX(-100%)',
          transition:    'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px',
            height: 50,
            borderBottom: `1px solid ${BORDER}`,
            background: PANEL,
          }}
        >
          <span
            style={{
              fontFamily: FC, fontSize: 'var(--text-label)', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: DIM, fontSize: 18, lineHeight: 1,
              padding: '4px 6px', borderRadius: 4,
              transition: 'color 0.15s',
              fontFamily: FR,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM }}
          >
            ✕
          </button>
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
