'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HUD, FONT_BODY, FS, RADIUS, Z } from '@/lib/tokens'

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
      style={{ position: 'fixed', inset: 0, zIndex: Z.toast, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={handleClose}
    >
      <div
        style={{ background: HUD.panelBg, border: `1px solid ${HUD.borderHi}`, borderTop: `3px solid var(--state-success)`, padding: '24px 24px 20px', maxWidth: 340, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: 'var(--state-success)', letterSpacing: '0.15em', marginBottom: 4 }}>SPEND CREDITS</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, marginBottom: 18 }}>
          Available: <span style={{ color: HUD.text, fontWeight: 600 }}>{credits.toLocaleString()}</span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, letterSpacing: '0.08em', marginBottom: 6 }}>HOW MUCH DO YOU WANT TO SPEND?</div>
        <input
          type="number"
          min={1}
          max={credits}
          value={spendAmount}
          onChange={e => setSpendAmount(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleClose() }}
          autoFocus
          placeholder="0"
          style={{ width: '100%', background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`, color: HUD.text, fontFamily: FONT_BODY, fontSize: FS.h3, fontWeight: 700, padding: '10px 14px', outline: 'none', boxSizing: 'border-box', marginBottom: 18 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleClose} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md, fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, letterSpacing: '0.1em', color: HUD.textDim, cursor: 'pointer' }}>
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid}
            style={{
              flex: 2, padding: '10px 0', borderRadius: RADIUS.md,
              background: valid ? 'var(--state-success)' : 'color-mix(in srgb, var(--state-success) 15%, transparent)',
              border: `1px solid ${valid ? 'var(--state-success)' : HUD.border}`,
              fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.12em',
              color: valid ? HUD.bg : HUD.textDim,
              cursor: valid ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            {valid ? `SPEND ${amt.toLocaleString()} cr` : 'SPEND'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
