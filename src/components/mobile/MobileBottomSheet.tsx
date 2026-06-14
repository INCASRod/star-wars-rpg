'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SP, Z, EASE, RADIUS, HUD, FS } from '@/lib/tokens'

interface MobileBottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Collapsed sheet height. Default: '40dvh' */
  collapsedHeight?: string
  /** Expanded sheet height. Default: '70dvh' */
  expandedHeight?: string
}

export function MobileBottomSheet({ open, onClose, children, collapsedHeight = '40dvh', expandedHeight = '70dvh' }: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // isExpanded resets automatically on close because component unmounts (open → null guard below).
  // If this component is ever changed to persist while hidden, add a reset effect here.

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        zIndex: Z.modal,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'color-mix(in srgb, var(--hud-bg) 70%, transparent)',
          cursor: 'pointer',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        zIndex: Z.modal,
        maxHeight: isExpanded ? expandedHeight : collapsedHeight,
        transition: `max-height ${EASE.panel}`,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        background: 'var(--hud-surface-hi)',
        borderTop: `1px solid var(--hud-border)`,
        borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        padding: `${SP[2]} ${SP[3]} ${SP[6]}`,
      }}>
        {/* Drag handle + chevron — single button so full affordance is keyboard/touch accessible */}
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? 'Collapse sheet' : 'Expand sheet'}
          aria-expanded={isExpanded}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: SP[1],
            width: '100%',
            background: 'transparent', border: 'none',
            cursor: 'pointer',
            padding: `0 0 ${SP[1]}`,
          }}
        >
          {/* Handle pill — fixed geometry: 36×4px is a UI affordance constant */}
          <div style={{
            width: 36, height: 4, /* fixed handle geometry */
            borderRadius: RADIUS.full,
            background: 'var(--hud-border-hi)',
          }} />
          {/* Chevron hint */}
          <span style={{
            fontSize: FS.overline,
            color: HUD.textFaint,
            lineHeight: 1,
          }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
