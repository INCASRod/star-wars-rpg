'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface MobileBottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Collapsed sheet height. Default: '40dvh' */
  collapsedHeight?: string
  /** Expanded sheet height. Default: '70dvh' */
  expandedHeight?: string
  /**
   * Optional fixed footer, rendered outside the scrollable body — e.g. a
   * close control + a (possibly disabled) primary action. When present,
   * `children` scrolls in `.m-sheet-body` and the footer never moves.
   */
  footer?: React.ReactNode
}

export function MobileBottomSheet({
  open, onClose, children, collapsedHeight = '40dvh', expandedHeight = '70dvh', footer,
}: MobileBottomSheetProps) {
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
    // `data-mobile-shell` is re-declared here (not just on the shell root)
    // because this portals to document.body, outside the shell's own DOM
    // subtree — the [data-mobile-shell] CSS custom properties otherwise
    // wouldn't inherit into a sibling-of-body portal.
    <div role="dialog" aria-modal="true" className="m-sheet-root" data-mobile-shell="">
      <div className="m-sheet-backdrop" onClick={onClose} />

      <div
        className="m-sheet-panel"
        // max-height is a live prop value ('40dvh'/'85dvh'/etc) — no
        // CSS-class equivalent, documented inline style exception. `position`
        // is never set here — it lives on `.m-sheet-panel` in
        // mobile-shell.css, per the standing rule against inline `position`
        // on drawer/overlay wrappers.
        style={{ maxHeight: isExpanded ? expandedHeight : collapsedHeight }}
      >
        {/* Drag handle + chevron — single button so full affordance is keyboard/touch accessible */}
        <button
          type="button"
          className="m-sheet-handle-btn"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? 'Collapse sheet' : 'Expand sheet'}
          aria-expanded={isExpanded}
        >
          <span className="m-sheet-handle-pip" />
          <span className="m-sheet-handle-chevron">{isExpanded ? '▲' : '▼'}</span>
        </button>

        <div className="m-sheet-body">{children}</div>

        {footer && <div className="m-sheet-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
