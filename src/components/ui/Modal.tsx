'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Z, RADIUS, HUD, MODAL, SP } from '@/lib/tokens'

export interface ModalProps {
  open:               boolean
  /** Omit to make the modal non-dismissible (forced-submit pattern). */
  onClose?:           () => void
  children:           React.ReactNode
  /** Max width of the panel. Default 480. */
  maxWidth?:          number | string
  /** Override the default Z.modal (410) stacking. */
  zIndex?:            number
  /** Full CSS color for the panel border. Defaults to HUD.borderHi (gold). */
  borderColor?:       string
  /** Override the panel box-shadow. Use for themed glow effects. */
  shadow?:            string
  /** Override the scrim background. Default: MODAL.backdrop. */
  backdrop?:          string
  /** Override the panel background. Default: HUD.panel. */
  panelBackground?:   string
}

// Module-scope — never recreated on render.
const BACKDROP: React.CSSProperties = {
  position:             'fixed',
  inset:                0,
  display:              'flex',
  alignItems:           'center',
  justifyContent:       'center',
  background:           MODAL.backdrop,
  backdropFilter:       'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  padding:              SP[4],
}

export function Modal({
  open,
  onClose,
  children,
  maxWidth = '30rem',
  zIndex = Z.modal,
  borderColor,
  shadow,
  backdrop,
  panelBackground,
}: ModalProps) {
  useEffect(() => {
    if (!open || !onClose) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div style={{ ...BACKDROP, zIndex, background: backdrop ?? MODAL.backdrop }} onClick={onClose}>
      <div
        style={{
          width:        '100%',
          maxWidth,
          maxHeight:    '90vh',
          overflowY:    'auto',
          background:   panelBackground ?? HUD.panel,
          border:       `1px solid ${borderColor ?? HUD.borderHi}`,
          borderRadius: RADIUS.xl,
          boxShadow:    shadow ?? MODAL.shadow,
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
