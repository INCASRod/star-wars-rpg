'use client'

import { useState } from 'react'
import { useStowLocations } from '@/hooks/useStowLocations'
import type { StowLocation } from '@/lib/types'
import { MobileBottomSheet } from './MobileBottomSheet'

/**
 * Combined stow-location + quantity flow (one sheet, not two chained ones —
 * per spec). Also reused for Drop, where the location step is skipped and
 * only the quantity-then-confirm step shows.
 *
 * Desktop has no partial-quantity stow/drop write path (confirmed in Step 0 —
 * `character_gear.quantity` is a single column with zero split/increment
 * logic anywhere in `useCharacterData.ts`). This sheet therefore only ever
 * asks "how many" as information for the confirm copy — it always acts on
 * the WHOLE stack via the same whole-row `onSetEquipState`/`onDrop` desktop
 * already uses, never a partial-quantity write that doesn't exist on
 * desktop to match against.
 */
export interface MobileStowSheetProps {
  open: boolean
  onClose: () => void
  mode: 'stow' | 'drop'
  itemName: string
  quantity: number
  campaignId: string | null
  onConfirmStow: (location: StowLocation) => void
  onConfirmDrop: () => void
}

export function MobileStowSheet({ open, onClose, mode, itemName, quantity, campaignId, onConfirmStow, onConfirmDrop }: MobileStowSheetProps) {
  const { stowableAssets, baseOfOperationsName } = useStowLocations(campaignId)
  const [confirmingDrop, setConfirmingDrop] = useState(false)

  function handleClose() {
    setConfirmingDrop(false)
    onClose()
  }

  const locations: StowLocation[] = [
    ...(baseOfOperationsName ? [{ id: null, name: baseOfOperationsName, type: 'base_of_operations' as const }] : []),
    ...stowableAssets.map(a => ({ id: a.id, name: a.name, type: a.type })),
  ]

  return (
    <MobileBottomSheet open={open} onClose={handleClose} collapsedHeight="55dvh" expandedHeight="70dvh">
      {mode === 'stow' ? (
        <>
          <div className="m-deck-group-label">Stow {itemName}{quantity > 1 ? ` (×${quantity})` : ''}</div>
          {locations.length === 0 ? (
            <div className="m-weapon-stats">No stow locations available in this campaign yet.</div>
          ) : (
            locations.map(loc => (
              <button
                key={loc.id ?? 'boo'}
                type="button"
                className="m-location-row"
                onClick={() => { onConfirmStow(loc); handleClose() }}
              >
                {loc.name} <span className="m-item-state-tag m-location-row-type">{loc.type === 'base_of_operations' ? 'Base' : loc.type}</span>
              </button>
            ))
          )}
        </>
      ) : (
        <>
          <div className="m-deck-group-label">Drop {itemName}{quantity > 1 ? ` (×${quantity})` : ''}</div>
          <div className="m-weapon-stats">
            {quantity > 1
              ? `This drops the entire stack of ${quantity}. Partial drops aren't supported yet.`
              : 'This removes the item from your inventory.'}
          </div>
          {!confirmingDrop ? (
            <button type="button" className="m-sheet-btn is-primary m-stow-drop-btn" onClick={() => setConfirmingDrop(true)}>
              Drop
            </button>
          ) : (
            <div className="m-cr-actions m-stow-confirm-row">
              <button type="button" className="m-sheet-btn" onClick={() => setConfirmingDrop(false)}>Cancel</button>
              <button type="button" className="m-sheet-btn is-primary" onClick={() => { onConfirmDrop(); handleClose() }}>Confirm Drop</button>
            </div>
          )}
        </>
      )}
    </MobileBottomSheet>
  )
}
