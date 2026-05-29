'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HUD, FONT_BODY, FS, RADIUS, Z } from '@/lib/tokens'
import { DiceRollerSheet } from '@/components/mobile/overlays/DiceRollerSheet'

// ─── Constants ────────────────────────────────────────────────────────────────
const FAB_SIZE   = 52
const FAB_BOTTOM = 28
const FAB_LEFT   = 28
const PANEL_W    = 320

interface FloatingDiceRollerFABProps {
  characterId:    string | null
  characterName:  string
  campaignId:     string | null | undefined
  open?:          boolean
  onOpenChange?:  (open: boolean) => void
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
      <polygon points={pts} fill="none" stroke="var(--die-challenge)" strokeWidth={1.5} />
      <polygon points={pts} fill="rgba(224,58,30,0.12)" />
    </svg>
  )
}

// ─── FAB + Panel ──────────────────────────────────────────────────────────────
export function FloatingDiceRollerFAB({ characterId, characterName, campaignId, open: controlledOpen, onOpenChange }: FloatingDiceRollerFABProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open    = isControlled ? controlledOpen! : internalOpen
  const setOpen = (v: boolean) => { if (isControlled) onOpenChange?.(v); else setInternalOpen(v) }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            zIndex:     Z.overlay,
            background: 'var(--hud-surface-hi)',
            border:     `1px solid ${HUD.border}`,
            borderRadius: RADIUS.xl,
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
            borderBottom: `1px solid ${HUD.border}`,
            position:     'sticky',
            top:          0,
            background:   'var(--hud-surface-hi)',
            zIndex:       Z.raised,
          }}>
            <span style={{
              fontFamily:    FONT_BODY,
              fontSize:      FS.label,
              fontWeight:    700,
              color:         HUD.gold,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Dice Roller
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background:  'transparent',
                border:      `1px solid ${HUD.border}`,
                borderRadius: RADIUS.md,
                width:       26,
                height:      26,
                cursor:      'pointer',
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                color:       HUD.textDim,
                fontFamily:  FONT_BODY,
                fontSize:    FS.h4,
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

      {/* ── FAB button — hidden when controlled by the rail ── */}
      {!isControlled && <button
        onClick={() => setOpen(!open)}
        title="Dice Roller"
        style={{
          position:    'fixed',
          bottom:      FAB_BOTTOM,
          left:        FAB_LEFT,
          width:       FAB_SIZE,
          height:      FAB_SIZE,
          zIndex:      Z.overlay,
          borderRadius: RADIUS.full,
          background:  open
            ? 'rgba(224,58,30,0.2)'
            : 'var(--hud-surface-mid)',
          border:      `1.5px solid ${open ? HUD.gold : 'rgba(224,58,30,0.45)'}`,
          boxShadow:   open
            ? '0 0 16px rgba(224,58,30,0.35), 0 4px 20px rgba(0,0,0,0.6)'
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
      </button>}

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
