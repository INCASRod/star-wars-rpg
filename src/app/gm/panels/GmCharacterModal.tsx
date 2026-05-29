'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { GmCharacterCard, type GmCharacterCardProps } from '@/components/gm/GmCharacterCard'
import { useRouter } from 'next/navigation'
import { FONT_BODY, RADIUS } from '@/lib/tokens'

const FONT = FONT_BODY

type ModalCardProps = Omit<GmCharacterCardProps, never> & {
  isOpen:     boolean
  campaignId: string
  onClose:    () => void
}

export function GmCharacterModal({ isOpen, onClose, c, campaignId, ...cardProps }: ModalCardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          background: 'rgba(0,0,0,0.65)',
          zIndex:     'var(--z-hud-supreme)' as unknown as number,
        }}
      />

      {/* Modal */}
      <div style={{
        position:      'fixed',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        zIndex:        'var(--z-hud-supreme)' as unknown as number,
        width:         'clamp(21.25rem, 44vw, 35rem)',
        maxHeight:     '90vh',
        overflowY:     'auto',
        background:    'var(--hud-surface-lo)',
        border:        '1px solid var(--hud-border-hi)',
        borderRadius:  RADIUS.lg,
        boxShadow:     '0 16px 64px rgba(0,0,0,0.7)',
        display:       'flex',
        flexDirection: 'column',
      }}>
        {/* Footer bar */}
        <div style={{
          flexShrink:    0,
          display:       'flex',
          alignItems:    'center',
          gap:           '0.5rem',
          padding:       '0.625rem 1rem',
          borderTop:     '1px solid var(--hud-border)',
          background:    'var(--hud-panel)',
          order:         999,
        }}>
          <button
            onClick={onClose}
            style={{
              background:    'transparent',
              border:        '1px solid var(--hud-border-hi)',
              borderRadius:  RADIUS.md,
              padding:       '0.3125rem 1rem',
              cursor:        'pointer',
              fontFamily:    FONT,
              fontSize:      'var(--text-caption)',
              color:         'var(--hud-text-dim)',
            }}
          >
            ✕ Close
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => router.push(`/character/${c.id}?gm=1&campaign=${campaignId}`)}
            style={{
              background:    'var(--hud-surface-lo)',
              border:        '1px solid var(--hud-border-hi)',
              borderRadius:  RADIUS.md,
              padding:       '0.3125rem 1rem',
              cursor:        'pointer',
              fontFamily:    FONT,
              fontSize:      'var(--text-caption)',
              fontWeight:    700,
              letterSpacing: '0.08em',
              color:         'var(--hud-gold)',
            }}
          >
            Open Full Sheet →
          </button>
        </div>

        {/* Card content */}
        <div style={{ flex: 1, padding: '1rem' }}>
          <GmCharacterCard c={c} campaignId={campaignId} {...cardProps} />
        </div>
      </div>
    </>,
    document.body,
  )
}
