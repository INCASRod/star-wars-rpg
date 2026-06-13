'use client'
import { useEffect }    from 'react'
import { createPortal } from 'react-dom'
import { SP, Z, EASE, RADIUS } from '@/lib/tokens'

interface MobileBottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Sheet max height as CSS value. Default: '80dvh' */
  maxHeight?: string
}

export function MobileBottomSheet({ open, onClose, children, maxHeight = '80dvh' }: MobileBottomSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
        maxHeight,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        background: 'var(--hud-surface-hi)',
        borderTop: `1px solid var(--hud-border)`,
        borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        padding: `${SP[2]} ${SP[3]} ${SP[6]}`,
      }}>
        {/* Drag handle — fixed geometry: 36×4px is a UI affordance constant, not a spacing token */}
        <div style={{
          width: 36, height: 4, /* fixed handle geometry */
          borderRadius: RADIUS.full,
          background: 'var(--hud-border-hi)',
          margin: `0 auto ${SP[2]}`,
        }} />
        {children}
      </div>
    </div>,
    document.body,
  )
}
