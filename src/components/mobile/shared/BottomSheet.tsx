'use client'

import { useRef, useEffect } from 'react'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL   = 'rgba(8,18,12,0.97)'
const BORDER  = 'rgba(200,170,80,0.3)'
const SCRIM   = 'rgba(0,0,0,0.6)'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxHeight?: string
}

export function BottomSheet({ open, onClose, children, maxHeight = '85dvh' }: BottomSheetProps) {
  const startYRef = useRef(0)

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - startYRef.current
    if (delta > 80) onClose()
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: SCRIM,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: PANEL,
          borderTop: `1px solid ${BORDER}`,
          borderRadius: '16px 16px 0 0',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms ease-out',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 4,
            background: 'rgba(200,170,80,0.3)',
            borderRadius: 2,
          }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  )
}
