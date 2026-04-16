'use client'

/**
 * StagingDrawer — canonical slide-in drawer for all Staging overlays.
 *
 * ┌──────────┬──────────────────────────────────────────────┐
 * │  60px    │  drawer (clamp 380–520px)                    │
 * │  rail    │                                              │
 * │  strip   │  slides in/out beside the strip, not behind  │
 * └──────────┴──────────────────────────────────────────────┘
 *
 * The drawer is offset from the viewport edge by `railWidth` so it always
 * appears next to the button strip — never underneath it.  When closed it
 * is fully off-screen in its origin direction via translateX(±100%).
 *
 * Animation: identical to GmReferenceDrawer
 *   transform  0.26s cubic-bezier(0.22, 1, 0.36, 1)
 *
 * z-index stack (same layer as GmReferenceDrawer):
 *   backdrop   8999   – click-outside-to-close; only in DOM while open
 *   panel      9000   – always mounted for smooth animation
 *   rail strip 9001+  – always above, always clickable
 *
 * Usage:
 *   <StagingDrawer open={…} onClose={…} title="Adversaries" direction="left">
 *     …content…
 *   </StagingDrawer>
 */

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* ── Design tokens ────────────────────────────────────────── */
const FC        = "var(--font-cinzel), 'Cinzel', serif"
const FR        = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const BG        = 'rgba(6,10,8,0.97)'
const PANEL     = 'rgba(10,18,12,0.92)'
const GOLD      = '#C8AA50'
const DIM       = '#6A8070'
const TEXT      = '#C8D8C0'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'

const DRAWER_WIDTH  = 'clamp(380px, 34vw, 520px)'
const DEFAULT_RAIL  = 60   // must match the rail strip width

/* ── Props ────────────────────────────────────────────────── */
export interface StagingDrawerProps {
  open:       boolean
  onClose:    () => void
  title:      string
  /** 'left'  → slides in from the left, sits right of the left rail strip.
   *  'right' → slides in from the right, sits left of the right rail strip. */
  direction:  'left' | 'right'
  /** Pixel width of the sibling rail strip.  The drawer's fixed edge is
   *  offset by this amount so the drawer never overlaps the buttons.
   *  Defaults to 60 (the standard rail width). */
  railWidth?: number
  children?:  ReactNode
}

export function StagingDrawer({
  open,
  onClose,
  title,
  direction,
  railWidth = DEFAULT_RAIL,
  children,
}: StagingDrawerProps) {
  /* SSR guard — createPortal needs document */
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isLeft = direction === 'left'

  /*
   * Positioning: the drawer's fixed edge is inset by `railWidth`.
   *   left  drawer: left  = railWidth  (drawer left edge flush with strip right edge)
   *   right drawer: right = railWidth  (drawer right edge flush with strip left edge)
   *
   * Closed transform:
   *   left  drawer: translateX(-100%)  →  left  edge at  railWidth - drawerWidth  (off-screen)
   *   right drawer: translateX(+100%)  →  right edge at  viewportW - railWidth + drawerWidth  (off-screen)
   */
  const edgeProp:  React.CSSProperties = isLeft ? { left: railWidth }  : { right: railWidth }
  const transform: string              = open    ? 'translateX(0)'     : isLeft ? 'translateX(-100%)' : 'translateX(100%)'

  /* Border on the canvas-facing edge */
  const border: React.CSSProperties = isLeft
    ? { borderRight: `1px solid ${open ? BORDER_HI : 'transparent'}` }
    : { borderLeft:  `1px solid ${open ? BORDER_HI : 'transparent'}` }

  /* Shadow towards the canvas */
  const boxShadow = open
    ? (isLeft ? '8px 0 40px rgba(0,0,0,0.6)' : '-8px 0 40px rgba(0,0,0,0.6)')
    : 'none'

  return createPortal(
    <>
      {/* ── Backdrop ────────────────────────────────────────── */}
      {/* Only in the DOM while open — click anywhere outside to close.
          z-index 8999: below the panel (9000) and rail strip (9001+),
          so rail buttons remain clickable while backdrop is visible.  */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(0,0,0,0.35)',
            zIndex:     8999,
          }}
        />
      )}

      {/* ── Panel ───────────────────────────────────────────── */}
      {/* Always mounted so close animation plays smoothly.
          pointerEvents:none when closed prevents phantom click targets. */}
      <div
        style={{
          position:      'fixed',
          top:           0,
          bottom:        0,
          width:         DRAWER_WIDTH,
          zIndex:        9000,
          display:       'flex',
          flexDirection: 'column',
          background:    BG,
          boxShadow,
          transform,
          transition:    'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.2s',
          pointerEvents: open ? 'auto' : 'none',
          ...edgeProp,
          ...border,
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink:   0,
            display:      'flex',
            alignItems:   'center',
            padding:      '0 16px',
            height:       50,
            borderBottom: `1px solid ${BORDER}`,
            background:   PANEL,
            /* Title centred; close button on the canvas-facing end */
            flexDirection: isLeft ? 'row' : 'row-reverse',
            gap:           8,
          }}
        >
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              color:       DIM,
              fontSize:    18,
              lineHeight:  1,
              padding:     '4px 6px',
              borderRadius: 4,
              transition:  'color 0.15s',
              fontFamily:  FR,
              flexShrink:  0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM }}
          >
            ✕
          </button>

          <span
            style={{
              fontFamily:    FC,
              fontSize:      'var(--text-label)',
              fontWeight:    700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color:         GOLD,
              flex:          1,
              /* Title aligns away from close button */
              textAlign:     isLeft ? 'right' : 'left',
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
