'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_CINZEL, FONT_RAJDHANI } from './design-tokens'
import { DiceRollerSheet } from '@/components/mobile/overlays/DiceRollerSheet'

// ─── Constants ────────────────────────────────────────────────────────────────
const FAB_SIZE   = 52
const FAB_BOTTOM = 28
const FAB_LEFT   = 28
const PANEL_W    = 320

interface FloatingDiceRollerFABProps {
  characterId:   string | null
  characterName: string
  campaignId:    string | null | undefined
}

// ─── Dice SVG icon ────────────────────────────────────────────────────────────
function DiceIcon({ size = 24 }: { size?: number }) {
  // Simple pentagon outline (proficiency die shape)
  const r = size * 0.46
  const cx = size / 2
  const cy = size / 2
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180)
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
      <polygon points={pts} fill="none" stroke="#C8AA50" strokeWidth={1.5} />
      <polygon points={pts} fill="rgba(200,170,80,0.12)" />
    </svg>
  )
}

// ─── FAB + Panel ──────────────────────────────────────────────────────────────
export function FloatingDiceRollerFAB({ characterId, characterName, campaignId }: FloatingDiceRollerFABProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click-outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // Delay to avoid the FAB click itself closing the panel
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler) }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return createPortal(
    <>
      {/* ── Panel ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position:   'fixed',
            bottom:     FAB_BOTTOM + FAB_SIZE + 10,
            left:       FAB_LEFT,
            width:      PANEL_W,
            zIndex:     190,
            background: 'rgba(6,13,9,0.97)',
            border:     `1px solid rgba(200,170,80,0.35)`,
            borderRadius: 12,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:  '0 8px 40px rgba(0,0,0,0.7)',
            maxHeight:  'calc(100vh - 120px)',
            overflowY:  'auto',
            animation:  'fabPanelIn 150ms ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            padding:      '12px 16px 10px',
            borderBottom: `1px solid rgba(200,170,80,0.15)`,
            position:     'sticky',
            top:          0,
            background:   'rgba(6,13,9,0.97)',
            zIndex:       1,
          }}>
            <span style={{
              fontFamily:    FONT_CINZEL,
              fontSize:      13,
              fontWeight:    700,
              color:         '#C8AA50',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Dice Roller
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background:  'transparent',
                border:      `1px solid ${C.border}`,
                borderRadius: 4,
                width:       26,
                height:      26,
                cursor:      'pointer',
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                color:       C.textDim,
                fontFamily:  FONT_RAJDHANI,
                fontSize:    16,
                lineHeight:  1,
              }}
            >
              ×
            </button>
          </div>

          {/* Roller body */}
          <DiceRollerSheet
            prePopSkill={null}
            characterId={characterId}
            characterName={characterName}
            campaignId={campaignId}
          />
        </div>
      )}

      {/* ── FAB button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Dice Roller"
        style={{
          position:    'fixed',
          bottom:      FAB_BOTTOM,
          left:        FAB_LEFT,
          width:       FAB_SIZE,
          height:      FAB_SIZE,
          zIndex:      190,
          borderRadius: '50%',
          background:  open
            ? 'rgba(200,170,80,0.2)'
            : 'rgba(6,13,9,0.92)',
          border:      `1.5px solid ${open ? '#C8AA50' : 'rgba(200,170,80,0.45)'}`,
          boxShadow:   open
            ? '0 0 16px rgba(200,170,80,0.35), 0 4px 20px rgba(0,0,0,0.6)'
            : '0 4px 20px rgba(0,0,0,0.6)',
          cursor:      'pointer',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          transition:  'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        }}
      >
        <DiceIcon size={26} />
      </button>

      <style>{`
        @keyframes fabPanelIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </>,
    document.body,
  )
}
