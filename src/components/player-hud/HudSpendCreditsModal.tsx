'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI, FS_H4, FS_SM, FS_LABEL, FS_H3 } from './design-tokens'

interface HudSpendCreditsModalProps {
  open: boolean
  onClose: () => void
  credits: number
  onConfirm: (amount: number) => Promise<void>
}

export function HudSpendCreditsModal({ open, onClose, credits, onConfirm }: HudSpendCreditsModalProps) {
  const [spendAmount, setSpendAmount] = useState('')

  if (!open || typeof document === 'undefined') return null

  const handleClose = () => {
    setSpendAmount('')
    onClose()
  }

  const handleConfirm = async () => {
    const amt = parseInt(spendAmount, 10)
    if (!amt || amt <= 0 || amt > credits) return
    setSpendAmount('')
    await onConfirm(amt)
  }

  const amt = parseInt(spendAmount, 10)
  const valid = amt > 0 && amt <= credits

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={handleClose}
    >
      <div
        style={{ background: C.panelBg, border: `1px solid ${C.borderHi}`, borderTop: `3px solid #4EC87A`, padding: '24px 24px 20px', maxWidth: 340, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 700, color: '#4EC87A', letterSpacing: '0.15em', marginBottom: 4 }}>SPEND CREDITS</div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, marginBottom: 18 }}>
          Available: <span style={{ color: 'var(--hud-text)', fontWeight: 600 }}>{credits.toLocaleString()}</span>
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim, letterSpacing: '0.08em', marginBottom: 6 }}>HOW MUCH DO YOU WANT TO SPEND?</div>
        <input
          type="number"
          min={1}
          max={credits}
          value={spendAmount}
          onChange={e => setSpendAmount(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleClose() }}
          autoFocus
          placeholder="0"
          style={{ width: '100%', background: 'var(--hud-surface-lo)', border: `1px solid ${C.borderHi}`, color: 'var(--hud-text)', fontFamily: FONT_RAJDHANI, fontSize: FS_H3, fontWeight: 700, padding: '10px 14px', outline: 'none', boxSizing: 'border-box', marginBottom: 18 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleClose} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: `1px solid ${C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, letterSpacing: '0.1em', color: C.textDim, cursor: 'pointer' }}>
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid}
            style={{ flex: 2, padding: '10px 0', background: valid ? '#4EC87A' : 'rgba(78,200,122,0.15)', border: `1px solid ${valid ? '#4EC87A' : C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.12em', color: valid ? C.bg : C.textDim, cursor: valid ? 'pointer' : 'default', transition: 'background 0.15s' }}
          >
            {valid ? `SPEND ${amt.toLocaleString()} cr` : 'SPEND'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
