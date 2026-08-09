'use client'

import { useEffect, useState } from 'react'
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
  /**
   * Full-screen panel: the scrim loses its padding and the panel fills the
   * viewport with no max-width, no rounded corners and no drop shadow.
   * Default false — every existing caller keeps the centred-card behaviour.
   */
  fullScreen?:        boolean

  // ── Animation hooks (all optional, all default-off) ──────────────────────
  // With none of these passed, Modal renders and unmounts exactly as before.
  // They exist so a caller can run an open/close timeline over the scrim and a
  // portal-hosted pulse element — see `igniteModalOpen`/`igniteModalClose` in
  // `src/lib/utils.ts` and the ignition convention in docs/architecture.md.

  /** Ref to the scrim element, so a caller can animate its opacity. */
  scrimRef?:          React.RefObject<HTMLDivElement | null>
  /** Extra class on the scrim (e.g. to start it transparent before a fade-in). */
  scrimClassName?:    string
  /**
   * Rendered inside the portal, as a sibling of the panel and above the scrim.
   * The ignition pulse lives here rather than being appended to document.body
   * on every open.
   */
  portalExtra?:       React.ReactNode
  /**
   * Defers UNMOUNT by this many ms when `open` flips false, so a close
   * animation can play out. It does NOT defer the caller's `onClose` — that
   * already fired to flip `open`. Omit (default 0) for the original
   * synchronous unmount.
   */
  exitMs?:            number
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
  fullScreen = false,
  scrimRef,
  scrimClassName,
  portalExtra,
  exitMs = 0,
}: ModalProps) {
  useEffect(() => {
    if (!open || !onClose) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Exit hold. `exitMs = 0` (the default) keeps `mounted === open` on the same
  // tick, so callers that pass nothing unmount synchronously exactly as before.
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) { setMounted(true); return }
    if (!exitMs) { setMounted(false); return }
    const t = setTimeout(() => setMounted(false), exitMs)
    return () => clearTimeout(t)
  }, [open, exitMs])

  // `exitMs = 0` (the default) makes this exactly `open`, evaluated in the same
  // render — so callers that pass nothing unmount synchronously, with no extra
  // frame, byte-identical to the pre-animation behaviour. Only an opted-in
  // caller keeps the DOM alive during its exit window.
  const shouldRender = open || (exitMs > 0 && mounted)
  if (!shouldRender) return null

  return createPortal(
    <div
      ref={scrimRef}
      className={scrimClassName}
      style={{ ...BACKDROP, zIndex, background: backdrop ?? MODAL.backdrop, padding: fullScreen ? 0 : BACKDROP.padding }}
      onClick={onClose}
    >
      {portalExtra}
      <div
        style={{
          width:        '100%',
          maxWidth:     fullScreen ? 'none' : maxWidth,
          height:       fullScreen ? '100%' : undefined,
          maxHeight:    fullScreen ? '100%' : '90vh',
          overflowY:    'auto',
          background:   panelBackground ?? HUD.panel,
          border:       fullScreen ? 'none' : `1px solid ${borderColor ?? HUD.borderHi}`,
          borderRadius: fullScreen ? 0 : RADIUS.xl,
          boxShadow:    fullScreen ? 'none' : (shadow ?? MODAL.shadow),
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
