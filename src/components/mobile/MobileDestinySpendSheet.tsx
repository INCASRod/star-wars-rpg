'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MobileBottomSheet } from './MobileBottomSheet'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, COLOR, HUD } from '@/lib/tokens'

// Sealed colour exceptions — change only in sync with DestinySpendConfirmModal.tsx
const LIGHT_CLR = '#0EA5E9'   /* Alliance light side — sealed */
const DARK_CLR  = '#C62828'   /* FFG challenge die / dark side — sealed */

interface MobileDestinySpendSheetProps {
  isOpen: boolean
  onClose: () => void
  destinyPoolRecord: DestinyPoolRecord
  characterName: string
  characterId?: string | null
  campaignId: string
  supabase: SupabaseClient
}

export function MobileDestinySpendSheet({
  isOpen, onClose, destinyPoolRecord, characterName, characterId,
  campaignId, supabase,
}: MobileDestinySpendSheetProps) {
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Broadcast destiny_considering on open — matches DestinySpendConfirmModal pattern
  useEffect(() => {
    if (!isOpen) return
    supabase.channel(`destiny-${campaignId}`)
      .send({ type: 'broadcast', event: 'destiny_considering', payload: { characterName } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleClose = () => {
    supabase.channel(`destiny-${campaignId}`)
      .send({ type: 'broadcast', event: 'destiny_cancelled', payload: { characterName } })
    onClose()
  }

  const handleConfirm = async () => {
    if (destinyPoolRecord.light_count < 1) return
    setBusy(true)
    setError(null)
    try {
      const newLight = destinyPoolRecord.light_count - 1
      const newDark  = destinyPoolRecord.dark_count  + 1

      // Mirror DestinySpendConfirmModal exactly — same table, same columns
      const { error: upErr } = await supabase
        .from('destiny_pool')
        .update({ light_count: newLight, dark_count: newDark })
        .eq('id', destinyPoolRecord.id)
      if (upErr) throw upErr

      await supabase.from('destiny_spend_log').insert({
        campaign_id:  campaignId,
        pool_id:      destinyPoolRecord.id,
        spent_by:     characterName,
        spent_by_id:  characterId ?? null,
        side_spent:   'light',
      })

      // Same channel name and payload shape as DestinySpendConfirmModal
      supabase.channel(`destiny-${campaignId}`)
        .send({
          type: 'broadcast', event: 'destiny_spent',
          payload: { characterName, side: 'light', newLightCount: newLight, newDarkCount: newDark },
        })

      onClose()  // destiny_spent clears considering state on all receivers
    } catch {
      setError('Spend failed — try again')
    } finally {
      setBusy(false)
    }
  }

  const afterLight = destinyPoolRecord.light_count - 1
  const afterDark  = destinyPoolRecord.dark_count  + 1
  const canSpend   = destinyPoolRecord.light_count >= 1

  return (
    <MobileBottomSheet open={isOpen} onClose={handleClose} collapsedHeight="50dvh">
      {/* Title */}
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
        color: HUD.text, letterSpacing: '0.1em', textTransform: 'uppercase',
        textAlign: 'center', marginBottom: SP[3],
      }}>
        Spend Destiny
      </div>

      {/* Before → After preview */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: SP[4], marginBottom: SP[3],
      }}>
        {/* Before column */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: SP[1],
          }}>
            Before
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: LIGHT_CLR /* Alliance light side — sealed */ }}>
            {destinyPoolRecord.light_count}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>◈ Light</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: DARK_CLR /* FFG dark side — sealed */, marginTop: SP[1] }}>
            {destinyPoolRecord.dark_count}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>◆ Dark</div>
        </div>

        {/* Arrow */}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, color: HUD.textFaint }}>→</div>

        {/* After column */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: SP[1],
          }}>
            After
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: LIGHT_CLR /* Alliance light side — sealed */ }}>
            {afterLight}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>◈ Light</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: DARK_CLR /* FFG dark side — sealed */, marginTop: SP[1] }}>
            {afterDark}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>◆ Dark</div>
        </div>
      </div>

      {/* Spend description */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
        textAlign: 'center', marginBottom: SP[3],
      }}>
        Spend 1 Light Side token → converts to Dark Side
      </div>

      {/* Inline error — shown without closing sheet */}
      {error && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.caption, color: COLOR.red,
          textAlign: 'center', marginBottom: SP[2],
        }}>
          {error}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        <button
          type="button"
          onClick={handleClose}
          disabled={busy}
          style={{
            width: '100%', padding: `${SP[2]} ${SP[3]}`,
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'transparent', border: `1px solid var(--hud-border)`,
            color: HUD.textFaint, borderRadius: RADIUS.md,
            cursor: 'pointer', opacity: busy ? 0.5 : 1,
          }}
        >
          ✗ Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy || !canSpend}
          style={{
            width: '100%', padding: `${SP[2]} ${SP[3]}`,
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: canSpend ? 'var(--hud-accent)' : 'var(--hud-surface-lo)',
            border: `1px solid ${canSpend ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
            color: canSpend ? 'var(--hud-bg)' : HUD.textFaint,
            borderRadius: RADIUS.md,
            cursor: busy ? 'wait' : canSpend ? 'pointer' : 'not-allowed',
            opacity: busy || !canSpend ? 0.5 : 1,
          }}
        >
          {busy ? 'Spending…' : '✓ Spend Destiny Point'}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
