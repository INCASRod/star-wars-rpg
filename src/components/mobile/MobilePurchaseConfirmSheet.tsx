'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MobileBottomSheet } from './MobileBottomSheet'

export interface PendingPurchase {
  label: string
  cost: number
  /** Calls straight through to the existing desktop mutator (purchaseTalent,
   *  handleBuySkill, handlePurchaseForceAbility, lockInAbility, or
   *  purchaseSigNode) — never reimplemented here. */
  execute: () => Promise<unknown>
}

export interface MobilePurchaseConfirmSheetProps {
  pending: PendingPurchase | null
  onClose: () => void
  xpAvailable: number
  supabase: SupabaseClient
  characterId: string
}

/**
 * Shared confirmation step for every XP purchase type (talent node, skill
 * rank, Force upgrade, signature ability node). One tap on a type's own
 * "Purchase"/"Buy" control only ever sets `pending` — the actual write
 * happens here, after an explicit second tap on THIS sheet's own Confirm
 * control, which is deliberately placed near the TOP of the sheet body
 * (not the footer, where a thumb naturally rests right after the first
 * tap) — Cancel occupies that natural bottom position instead, so an
 * accidental repeat tap dismisses rather than spends.
 *
 * Queue + read-fresh: `queueRef` serializes calls so a double-tap on
 * Confirm can't fire twice (the `busy` guard below also disables the
 * control synchronously, before the queue even sees a second entry).
 * Every purchase re-reads `characters.xp_available` fresh immediately
 * before calling `execute()` — this is the ONLY fresh read that exists
 * for skill-rank purchases (`handleBuySkill`, useCharacterData.ts, has no
 * internal fresh-read) and the ONLY affordability check at all for
 * signature-ability nodes (`lockInAbility`/`purchaseNode`,
 * useCharacterSigAbilities.ts, have no XP-sufficiency guard whatsoever —
 * Step 0, 3.1.3). Talent and Force-upgrade purchases already re-read
 * internally too; this is a harmless, defensive second read for those,
 * not a duplicate validation decision — the actual purchase/prerequisite
 * decision is still made entirely inside the reused mutator.
 */
export function MobilePurchaseConfirmSheet({ pending, onClose, xpAvailable, supabase, characterId }: MobilePurchaseConfirmSheetProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queueRef = useRef<Promise<void>>(Promise.resolve())
  const pendingRef = useRef(pending)
  useEffect(() => { pendingRef.current = pending }, [pending])

  useEffect(() => {
    // Fresh `pending` object (a new purchase target) — clear any stale
    // error/busy state left over from a previous purchase attempt.
    setBusy(false)
    setError(null)
  }, [pending])

  if (!pending) return null

  function handleConfirm() {
    if (busy) return
    setBusy(true)
    setError(null)
    queueRef.current = queueRef.current.then(async () => {
      const p = pendingRef.current
      if (!p) return
      try {
        const { data } = await supabase.from('characters').select('xp_available').eq('id', characterId).single()
        const fresh = (data?.xp_available as number | undefined) ?? xpAvailable
        if (fresh < p.cost) {
          setError(`Not enough XP — need ${p.cost}, have ${fresh}.`)
          setBusy(false)
          return
        }
        await p.execute()
        onClose()
      } catch (err) {
        console.error('[MobilePurchaseConfirmSheet] purchase failed:', err)
        // Non-transactional write path (Step 0, 3.3) — a failure here could
        // mean XP was deducted with no acquisition record, or vice versa.
        // No safe client-side rollback exists (which half failed is
        // unknown), so this is reported honestly rather than assumed to
        // have either fully succeeded or fully not happened.
        setError('Purchase may not have completed — check with your GM before trying again.')
        setBusy(false)
      }
    })
  }

  const xpAfter = xpAvailable - pending.cost

  return (
    <MobileBottomSheet
      open={!!pending}
      onClose={busy ? () => {} : onClose}
      collapsedHeight="42dvh"
      expandedHeight="42dvh"
      footer={
        <button type="button" className="m-sheet-btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
      }
    >
      <div className="m-purchase-confirm-label">{pending.label}</div>
      <div className="m-purchase-confirm-cost">{pending.cost} XP</div>

      <button type="button" className="m-purchase-confirm-btn" onClick={handleConfirm} disabled={busy}>
        {busy ? 'Purchasing…' : 'Confirm Purchase'}
      </button>

      <div className="m-purchase-confirm-xp-row">
        <span>Available now</span>
        <span>{xpAvailable} XP</span>
      </div>
      <div className="m-purchase-confirm-xp-row">
        <span>Available after</span>
        <span>{xpAfter} XP</span>
      </div>

      {error && <div className="m-purchase-confirm-error">{error}</div>}
    </MobileBottomSheet>
  )
}
