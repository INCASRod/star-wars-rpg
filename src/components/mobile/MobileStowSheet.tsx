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
 * Stow always acts on the WHOLE stack (no partial stow write path exists).
 * Drop asks "how many" and passes the count to `onConfirmDrop`; the caller
 * decides whether that item type supports a partial drop (weapons do, via
 * `handleRemoveWeapon`'s `count`; gear and armour still drop whole).
 */
export interface MobileStowSheetProps {
  open: boolean
  onClose: () => void
  mode: 'stow' | 'drop'
  itemName: string
  quantity: number
  campaignId: string | null
  onConfirmStow: (location: StowLocation) => void
  onConfirmDrop: (count: number) => void
  /** Whether the item type can drop part of a stack. Default false (whole stack). */
  partialDrop?: boolean
}

export function MobileStowSheet({ open, onClose, mode, itemName, quantity, campaignId, onConfirmStow, onConfirmDrop, partialDrop = false }: MobileStowSheetProps) {
  const { stowableAssets, baseOfOperationsName } = useStowLocations(campaignId)
  const [confirmingDrop, setConfirmingDrop] = useState(false)
  const [dropCount, setDropCount] = useState(1)
  const count = partialDrop ? Math.min(quantity, Math.max(1, dropCount)) : quantity

  function handleClose() {
    setConfirmingDrop(false)
    setDropCount(1)
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
            {quantity <= 1
              ? 'This removes the item from your inventory.'
              : partialDrop
                ? `How many of ${quantity} do you want to drop?`
                : `This drops the entire stack of ${quantity}.`}
          </div>
          {partialDrop && quantity > 1 && (
            <input
              type="number" inputMode="numeric" min={1} max={quantity} value={dropCount}
              onChange={e => setDropCount(Math.min(quantity, Math.max(1, parseInt(e.target.value) || 1)))}
              className="m-stow-qty-input"
              aria-label="How many to drop"
            />
          )}
          {!confirmingDrop ? (
            <button type="button" className="m-sheet-btn is-primary m-stow-drop-btn" onClick={() => setConfirmingDrop(true)}>
              Drop
            </button>
          ) : (
            <div className="m-cr-actions m-stow-confirm-row">
              <button type="button" className="m-sheet-btn" onClick={() => setConfirmingDrop(false)}>Cancel</button>
              <button type="button" className="m-sheet-btn is-primary" onClick={() => { onConfirmDrop(count); handleClose() }}>Confirm Drop{count > 1 ? ` ×${count}` : ''}</button>
            </div>
          )}
        </>
      )}
    </MobileBottomSheet>
  )
}
