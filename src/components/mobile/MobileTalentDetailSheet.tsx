'use client'

import type { SigAbilityNode } from '@/lib/types'
import { RichText } from '@/components/ui/RichText'
import { MobileBottomSheet } from './MobileBottomSheet'

export interface TalentDetailData {
  key:            string
  name:           string
  description?:   string
  specName:       string
  row:            number
  state:          'owned' | 'available' | 'locked'
  cost:           number
  activation?:    string   // undefined for signature ability nodes
  isRanked:       boolean
  ownedRank:      number
  /** Plain-language sentences derived from real connection data — see
      buildUnlockText() in MobileAbilityTree.tsx. Never hand-written per node. */
  unlockedByText: string
  opensText:      string
  /**
   * Identifying data only (no handler closures) — lets the caller build a
   * `PendingPurchase.execute()` that calls the exact right desktop mutator
   * (purchaseTalent / lockInAbility / purchaseSigNode) with the exact right
   * arguments. Absent for the owned-search-row path (never purchasable).
   */
  purchaseTarget?:
    | { kind: 'talent'; row: number; col: number; activeSpecKey: string }
    | { kind: 'sig-base'; sigAbilityKey: string; specSlot: string }
    | { kind: 'sig-node'; sigAbilityKey: string; node: SigAbilityNode }
}

export interface MobileTalentDetailSheetProps {
  open: boolean
  onClose: () => void
  data: TalentDetailData | null
  /**
   * Computed live by the caller every render (never baked into `data` at
   * tap time) so affordability always reflects current XP — `undefined`
   * when this detail view isn't reachable from a purchasable context (the
   * owned-search-row path, always already-owned).
   */
  purchase?: {
    canBuy: boolean
    disabledReason?: string
    onBuy: () => void
  }
}

export function MobileTalentDetailSheet({ open, onClose, data, purchase }: MobileTalentDetailSheetProps) {
  if (!data) return null

  const disabled = !purchase || !purchase.canBuy

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      collapsedHeight="70dvh"
      expandedHeight="85dvh"
      footer={
        <>
          <button type="button" className="m-sheet-btn" onClick={onClose}>Close</button>
          <button
            type="button"
            className="m-sheet-btn is-primary"
            disabled={disabled}
            title={disabled ? (purchase?.disabledReason ?? 'Already owned') : undefined}
            onClick={() => purchase?.onBuy()}
          >
            Purchase
          </button>
        </>
      }
    >
      <div className="m-detail-eyebrow">Row {data.row + 1} · {data.state}</div>
      <div className="m-detail-name">{data.name}</div>
      <div className="m-detail-sub">
        {data.specName}{data.isRanked ? ' · Ranked' : ''}
      </div>

      {data.description && (
        <div className="m-detail-desc">
          <RichText text={data.description} />
        </div>
      )}

      <div className="m-detail-grid">
        <div className="m-detail-grid-item">
          <span className="m-detail-grid-label">XP Cost</span>
          <span className="m-detail-grid-value">{data.cost}</span>
        </div>
        {data.activation && (
          <div className="m-detail-grid-item">
            <span className="m-detail-grid-label">Activation</span>
            <span className="m-detail-grid-value">{data.activation}</span>
          </div>
        )}
        <div className="m-detail-grid-item">
          <span className="m-detail-grid-label">Ranked</span>
          <span className="m-detail-grid-value">{data.isRanked ? 'Yes' : 'No'}</span>
        </div>
        {data.isRanked && (
          <div className="m-detail-grid-item">
            <span className="m-detail-grid-label">Current Rank</span>
            <span className="m-detail-grid-value">{data.ownedRank}</span>
          </div>
        )}
      </div>

      <div className="m-detail-unlock">
        <RichText text={data.unlockedByText} />
        <br />
        <RichText text={data.opensText} />
      </div>

      {disabled && purchase?.disabledReason && (
        <div className="m-purchase-disabled-reason">{purchase.disabledReason}</div>
      )}
    </MobileBottomSheet>
  )
}
