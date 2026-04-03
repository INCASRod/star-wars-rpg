'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DestinyPoolRecord } from './DestinyPoolDisplay'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const GOLD      = '#C8AA50'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const LIGHT_CLR = '#7EC8E3'
const DARK_CLR  = '#8B2BE2'
const WARN      = 'rgba(255,152,0,0.85)'
const BG        = 'rgba(6,13,9,0.98)'
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'
const FS_H4     = 'var(--text-h4)'

interface DestinySpendConfirmModalProps {
  pool:          DestinyPoolRecord
  characterName: string
  campaignId:    string
  characterId:   string | null
  supabase:      SupabaseClient
  onClose:       () => void
  onConfirmed:   () => void
}

export function DestinySpendConfirmModal({
  pool, characterName, campaignId, characterId,
  supabase, onClose, onConfirmed,
}: DestinySpendConfirmModalProps) {
  const [busy, setBusy] = useState(false)

  // Broadcast "considering" when modal opens
  useEffect(() => {
    supabase.channel(`destiny-${campaignId}`)
      .send({
        type: 'broadcast',
        event: 'destiny_considering',
        payload: { characterName },
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = () => {
    supabase.channel(`destiny-${campaignId}`)
      .send({
        type: 'broadcast',
        event: 'destiny_cancelled',
        payload: { characterName },
      })
    onClose()
  }

  const handleConfirm = async () => {
    if (pool.light_count < 1) return
    setBusy(true)
    try {
      const newLight = pool.light_count - 1
      const newDark  = pool.dark_count  + 1

      // Update pool counts
      await supabase.from('destiny_pool').update({
        light_count: newLight,
        dark_count:  newDark,
      }).eq('id', pool.id)

      // Log the spend
      await supabase.from('destiny_spend_log').insert({
        campaign_id:  campaignId,
        pool_id:      pool.id,
        spent_by:     characterName,
        spent_by_id:  characterId,
        side_spent:   'light',
      })

      // Broadcast to all
      supabase.channel(`destiny-${campaignId}`)
        .send({
          type: 'broadcast',
          event: 'destiny_spent',
          payload: { characterName, side: 'light', newLightCount: newLight, newDarkCount: newDark },
        })

      onConfirmed()
    } finally {
      setBusy(false)
    }
  }

  const afterLight = pool.light_count - 1
  const afterDark  = pool.dark_count  + 1

  const TokenRow = ({ count, color, label }: { count: number; color: string; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: DIM, width: 80 }}>{label}</span>
      <div style={{ display: 'flex', gap: 3, flex: 1, flexWrap: 'wrap' }}>
        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: `${color}30`, border: `1.5px solid ${color}80`, display: 'inline-block' }} />
        ))}
        {count > 8 && <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color }}> +{count - 8}</span>}
        {count === 0 && <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM }}>—</span>}
      </div>
      <span style={{ fontFamily: FONT_M, fontSize: FS_SM, color, fontWeight: 700, minWidth: 20 }}>{count}</span>
    </div>
  )

  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9050,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: 'clamp(320px, 90vw, 500px)',
        background: BG,
        border: `2px solid rgba(126,200,227,0.4)`,
        borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: `1px solid ${BORDER}`,
          background: 'rgba(126,200,227,0.03)',
        }}>
          <div style={{ fontFamily: FONT_C, fontSize: FS_H4, fontWeight: 700, color: LIGHT_CLR, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ◈ Spend Destiny Point?
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: FONT_R, fontSize: FS_SM, color: TEXT }}>
            You are about to spend a Light Side Destiny Point.
          </div>

          {/* Warning */}
          <div style={{
            padding: '10px 14px', borderRadius: 6,
            background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.2)',
          }}>
            <div style={{ fontFamily: FONT_R, fontSize: FS_LABEL, color: WARN, fontStyle: 'italic', lineHeight: 1.5 }}>
              ⚠ This will give the GM a Dark Side Destiny Point to use against the party.
            </div>
          </div>

          {/* Before / After */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, border: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FONT_R, fontSize: FS_OVER, fontWeight: 700, color: GOLD, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
              After spending
            </div>
            <TokenRow count={afterLight} color={LIGHT_CLR} label="Light Side:" />
            <TokenRow count={afterDark}  color={DARK_CLR}  label="Dark Side:" />
          </div>

          <div style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: DIM, fontStyle: 'italic' }}>
            Other players can see this request.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px 20px',
          borderTop: `1px solid ${BORDER}`,
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleCancel}
            disabled={busy}
            style={{
              fontFamily: FONT_R, fontSize: FS_CAP, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: 'clamp(7px, 1.2vh, 10px) 16px', borderRadius: 5, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
            }}
          >
            Cancel — Keep It
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || pool.light_count < 1}
            style={{
              fontFamily: FONT_R, fontSize: FS_CAP, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: 'clamp(7px, 1.2vh, 10px) 20px', borderRadius: 5,
              cursor: busy ? 'wait' : 'pointer',
              background: 'rgba(200,170,80,0.18)',
              border: `1px solid ${GOLD_BD}`,
              color: GOLD,
              opacity: busy || pool.light_count < 1 ? 0.4 : 1,
              transition: '.15s',
            }}
          >
            {busy ? 'Spending…' : 'Spend Destiny Point'}
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(modal, document.body)
}
