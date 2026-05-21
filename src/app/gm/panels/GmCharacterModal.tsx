'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { GmCharacterCard, type GmCharacterCardProps } from '@/components/gm/GmCharacterCard'
import { useRouter } from 'next/navigation'

const FONT = 'var(--font-body)'

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
          zIndex:     9100,
        }}
      />

      {/* Modal */}
      <div style={{
        position:      'fixed',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        zIndex:        9101,
        width:         'clamp(340px, 44vw, 560px)',
        maxHeight:     '90vh',
        overflowY:     'auto',
        background:    'var(--hud-surface-lo)',
        border:        '1px solid var(--hud-border-hi)',
        borderRadius:  8,
        boxShadow:     '0 16px 64px rgba(0,0,0,0.7)',
        display:       'flex',
        flexDirection: 'column',
      }}>
        {/* Footer bar */}
        <div style={{
          flexShrink:    0,
          display:       'flex',
          alignItems:    'center',
          gap:           8,
          padding:       '10px 16px',
          borderTop:     '1px solid var(--hud-border)',
          background:    'var(--hud-panel)',
          order:         999,
        }}>
          <button
            onClick={onClose}
            style={{
              background:    'transparent',
              border:        '1px solid var(--hud-border-hi)',
              borderRadius:  4,
              padding:       '5px 16px',
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
              background:    'rgba(150,168,180,0.1)',
              border:        '1px solid rgba(150,168,180,0.35)',
              borderRadius:  4,
              padding:       '5px 16px',
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
        <div style={{ flex: 1, padding: 16 }}>
          <GmCharacterCard c={c} campaignId={campaignId} {...cardProps} />
        </div>
      </div>
    </>,
    document.body,
  )
}
