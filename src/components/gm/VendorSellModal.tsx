'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Character } from '@/lib/types'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const RED       = '#E05050'
const BLUE      = '#5AAAE0'
const PANEL_BG  = 'rgba(8,16,10,0.97)'
const FONT_C    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'

const TYPE_COLOR: Record<string, string> = { weapon: RED, armor: BLUE, gear: GOLD_DIM }

export interface VendorItem {
  key: string
  name: string
  type: 'weapon' | 'armor' | 'gear'
  rarity?: number
  encumbrance?: number
  skill_key?: string
  damage?: number
  damage_add?: number | null
  crit?: number
  range_value?: string
  qualities?: { key: string; count?: number | null }[]
  soak?: number
  soak_bonus?: number
  defense?: number
  encumbrance_bonus?: number | null
  description?: string
  price?: number
}

interface VendorSellModalProps {
  item:       VendorItem
  characters: Character[]
  campaignId: string
  onSend:     (charId: string, price: number, quantity: number) => void
  onClose:    () => void
}

export function VendorSellModal({ item, characters, campaignId: _cid, onSend, onClose }: VendorSellModalProps) {
  const [selectedId, setSelectedId] = useState(characters.length === 1 ? characters[0].id : '')
  const [price,      setPrice]      = useState(String(item.price ?? 0))
  const [quantity,   setQuantity]   = useState(1)

  const parsedPrice = Math.max(0, parseInt(price, 10) || 0)
  const canSend = !!selectedId && parsedPrice >= 0

  const handleSend = () => {
    if (!canSend) return
    onSend(selectedId, parsedPrice, quantity)
  }

  const typeColor = TYPE_COLOR[item.type] ?? DIM

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: 24, maxWidth: '30rem', width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 16px 60px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, textTransform: 'uppercase', letterSpacing: '0.18em', color: GOLD, marginBottom: 4 }}>
              Vendor Offer
            </div>
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
              {item.name}
            </div>
            <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
              {item.type}
              {item.type === 'weapon' && item.damage != null && ` · DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit}`}
              {item.type === 'armor'  && item.soak  != null && ` · SOAK+${item.soak} · DEF ${item.defense ?? 0}`}
              {item.type === 'gear'   && item.encumbrance != null && ` · ENC ${item.encumbrance}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontSize: FS_SM, fontFamily: FONT_C }}>✕</button>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 14 }}>
          <div style={fieldLabel}>Sale Price (credits)</div>
          <input
            type="number" min={0}
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{ ...darkInput, width: '100%' }}
            autoFocus
          />
          {item.price != null && item.price > 0 && (
            <div style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM, marginTop: 4 }}>
              List price: {item.price.toLocaleString()} cr
            </div>
          )}
        </div>

        {/* Quantity (gear only) */}
        {item.type === 'gear' && (
          <div style={{ marginBottom: 14 }}>
            <div style={fieldLabel}>Quantity</div>
            <input
              type="number" min={1} max={99}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ ...darkInput, width: 80 }}
            />
          </div>
        )}

        {/* Character selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={fieldLabel}>Send offer to</div>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...darkInput, width: '100%' }}>
            <option value="">Select character…</option>
            {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{ ...btnPrimary, opacity: canSend ? 1 : 0.4 }}
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_C, fontSize: FS_OVER, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: GOLD_DIM, marginBottom: 6,
}

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${GOLD_BD}`,
  color: TEXT, fontFamily: FONT_C, fontSize: FS_LABEL,
  padding: '6px 10px', borderRadius: 3, outline: 'none',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid ${GOLD_BD}`,
  color: GOLD, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  padding: '8px 18px', borderRadius: 3, cursor: 'pointer',
}

const btnSecondary: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER}`,
  color: DIM, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '8px 14px', borderRadius: 3, cursor: 'pointer',
}
