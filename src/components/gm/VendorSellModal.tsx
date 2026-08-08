'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Character } from '@/lib/types'
import { HUD, FONT_BODY, RADIUS } from '@/lib/tokens'
import { NumberField } from '@/components/ui/NumberField'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'var(--hud-text)'
const DIM       = 'var(--hud-text-dim)'
const BORDER    = 'rgba(200,170,80,0.14)'
const RED       = 'var(--state-failure)'
const BLUE      = 'var(--die-force)'
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-body-sm)'

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

  return (
    <Modal open onClose={onClose} maxWidth={480}>
      <div style={{ padding: '1.5rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVER, textTransform: 'uppercase', letterSpacing: '0.18em', color: HUD.gold, marginBottom: '0.25rem' }}>
              Vendor Offer
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
              {item.name}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.125rem' }}>
              {item.type}
              {item.type === 'weapon' && item.damage != null && ` · DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit}`}
              {item.type === 'armor'  && item.soak  != null && ` · SOAK+${item.soak} · DEF ${item.defense ?? 0}`}
              {item.type === 'gear'   && item.encumbrance != null && ` · ENC ${item.encumbrance}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontSize: FS_SM, fontFamily: FONT_BODY }}>✕</button>
        </div>

        {/* Price + Quantity row */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
          <div style={{ flex: 1 }}>
            <div style={fieldLabel}>Price per item (cr)</div>
            <NumberField
              min={0}
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ ...darkInput, width: '100%' }}
              autoFocus
            />
            {item.price != null && item.price > 0 && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: DIM, marginTop: '0.25rem' }}>
                List: {item.price.toLocaleString()} cr
              </div>
            )}
          </div>
          <div style={{ width: '4.5rem' }}>
            <div style={fieldLabel}>Qty</div>
            <NumberField
              min={1} max={99}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ ...darkInput, width: '100%' }}
            />
          </div>
        </div>

        {/* Total */}
        {quantity > 1 && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS_LABEL,
            color: HUD.gold, marginBottom: '0.875rem',
            padding: '0.375rem 0.625rem',
            background: 'rgba(200,170,80,0.06)',
            border: `1px solid rgba(200,170,80,0.2)`,
            borderRadius: RADIUS.sm,
          }}>
            Total: {(parsedPrice * quantity).toLocaleString()} cr
            <span style={{ color: DIM, marginLeft: '0.375rem', fontSize: FS_CAP }}>
              ({parsedPrice.toLocaleString()} × {quantity})
            </span>
          </div>
        )}

        {/* Character selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={fieldLabel}>Send offer to</div>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...darkInput, width: '100%' }}>
            <option value="">Select character…</option>
            {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
    </Modal>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_BODY, fontSize: FS_OVER, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: GOLD_DIM, marginBottom: '0.375rem',
}

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${GOLD_BD}`,
  color: TEXT, fontFamily: FONT_BODY, fontSize: FS_LABEL,
  padding: '0.375rem 0.625rem', borderRadius: RADIUS.sm, outline: 'none',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid ${GOLD_BD}`,
  color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  padding: '0.5rem 1.125rem', borderRadius: RADIUS.sm, cursor: 'pointer',
}

const btnSecondary: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER}`,
  color: DIM, fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '0.5rem 0.875rem', borderRadius: RADIUS.sm, cursor: 'pointer',
}
