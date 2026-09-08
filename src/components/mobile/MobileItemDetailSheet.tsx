'use client'

import { useState } from 'react'
import { RichText } from '@/components/ui/RichText'
import type { EquipState, EquipSlot, StowLocation, RefWeaponQuality } from '@/lib/types'
import type { EncumbranceStats, EncumbranceSuppressReason } from '@/lib/derivedStats'
import { MobileBottomSheet } from './MobileBottomSheet'
import { MobileQualityChips } from './MobileWeaponStep'
import { MobileStowSheet } from './MobileStowSheet'

export interface GearItem {
  id: string
  type: 'weapon' | 'armor' | 'gear'
  refKey: string
  name: string
  iconUrl: string | null
  itemImageUrl: string | null
  equipState: EquipState
  equipSlot: EquipSlot | null
  stowLocation: StowLocation | null
  qty: number
  /** Actual encumbrance this item contributes right now (0 if stowed) — from `EncumbranceStats.perItem[id].cost`. */
  enc: number
  /** Unmodified ref encumbrance (pre worn-reduction), for showing "worn vs carried" when they differ. */
  baseEnc: number
  rarity: number
  price: number
  hardPoints: number
  attachmentsCount: number
  description?: string | null
  effectText?: string | null
  loreText?: string | null
  wornAnchor: string | null
  weaponStats?: { damage: string; crit: number; range: string; skillName: string; qualities: { key: string; count?: number | null }[] }
  armorStats?: { soak: number; defense: number }
}

const STATE_ORDER: EquipState[] = ['equipped', 'carrying', 'stowed']
const STATE_LABEL: Record<EquipState, string> = { equipped: 'Equipped', carrying: 'Carried', stowed: 'Stowed' }

/** Verbatim from item-detail-panel.tsx's reasonNote() — same wording, not a
 *  new invention, since this describes the same real rule. */
function reasonNote(reason: EncumbranceSuppressReason): string {
  return reason === 'anchor_occupied_armor'
    ? 'Another suit is already worn on this anchor — full encumbrance charged, no worn reduction.'
    : 'Another item already occupies this anchor — no threshold bonus granted while it stays there.'
}

export interface MobileItemDetailSheetProps {
  item: GearItem | null
  onClose: () => void
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  encumbranceStats: EncumbranceStats | null
  campaignId: string | null
  onSetEquipState: (id: string, type: 'weapon' | 'armor' | 'gear', state: EquipState, location?: StowLocation | null, equipSlot?: EquipSlot | null) => void
  onDropWeapon: (id: string) => void
  onDropEquipment: (id: string, type: 'armor' | 'gear') => void
}

export function MobileItemDetailSheet({
  item, onClose, refWeaponQualityMap, encumbranceStats, campaignId,
  onSetEquipState, onDropWeapon, onDropEquipment,
}: MobileItemDetailSheetProps) {
  const [actionSheet, setActionSheet] = useState<'stow' | 'drop' | null>(null)

  if (!item) return null

  const perItem = encumbranceStats?.perItem[item.id]
  const wornReduction = item.type === 'armor' && item.equipState === 'equipped' && item.enc < item.baseEnc
  const suppressed = perItem?.suppressed ? perItem.reason : null

  function handleSetState(state: EquipState) {
    if (!item) return
    if (state === 'stowed') { setActionSheet('stow'); return }
    onSetEquipState(item.id, item.type, state)
  }

  function handleConfirmStow(location: StowLocation) {
    if (!item) return
    onSetEquipState(item.id, item.type, 'stowed', location)
  }

  function handleConfirmDrop() {
    if (!item) return
    if (item.type === 'weapon') onDropWeapon(item.id)
    else onDropEquipment(item.id, item.type)
    onClose()
  }

  return (
    <MobileBottomSheet
      open={!!item}
      onClose={onClose}
      collapsedHeight="80dvh"
      expandedHeight="90dvh"
      footer={
        <div className="m-state-btn-row">
          {STATE_ORDER.map(state => (
            <button
              key={state}
              type="button"
              className={`m-state-btn${item.equipState === state ? ' is-current' : ''}`}
              onClick={() => handleSetState(state)}
            >
              {STATE_LABEL[state]}
            </button>
          ))}
        </div>
      }
    >
      <div className="m-detail-plate">
        {item.iconUrl ? (
          <img className="m-detail-plate-icon" src={item.iconUrl} alt="" />
        ) : (
          <span className="m-detail-plate-icon-fallback" aria-hidden="true">
            {item.type === 'weapon' ? '⌖' : item.type === 'armor' ? '⛨' : '◈'}
          </span>
        )}
        <span className="m-detail-plate-meta">
          <span className="m-detail-eyebrow">{item.type} · {STATE_LABEL[item.equipState]}</span>
          <span className="m-detail-name">{item.name}</span>
          {item.weaponStats && <span className="m-detail-sub">{item.weaponStats.skillName}</span>}
        </span>
      </div>

      <div className="m-stat-grid">
        {item.type === 'weapon' && item.weaponStats && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">DMG</span><span className="m-stat-value">{item.weaponStats.damage}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Crit</span><span className="m-stat-value">{item.weaponStats.crit}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Range</span><span className="m-stat-value">{item.weaponStats.range}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
          </>
        )}
        {item.type === 'armor' && item.armorStats && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">Soak</span><span className="m-stat-value">{item.armorStats.soak}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Defense</span><span className="m-stat-value">{item.armorStats.defense}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Hard Pts</span><span className="m-stat-value">{item.hardPoints}</span></div>
          </>
        )}
        {item.type === 'gear' && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">Qty</span><span className="m-stat-value">{item.qty}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
          </>
        )}
      </div>

      {item.weaponStats && item.weaponStats.qualities.length > 0 && (
        <MobileQualityChips qualities={item.weaponStats.qualities} refWeaponQualityMap={refWeaponQualityMap} idPrefix={`detail-${item.id}`} />
      )}

      <div className="m-detail-row">
        <span className="m-detail-row-label">Carried as</span>
        <span className="m-detail-row-value">{STATE_LABEL[item.equipState]}{item.equipState === 'equipped' && item.equipSlot ? ` · ${item.equipSlot}` : ''}</span>
      </div>
      {item.equipState === 'stowed' && item.stowLocation && (
        <div className="m-detail-row">
          <span className="m-detail-row-label">Location</span>
          <span className="m-detail-row-value">{item.stowLocation.name}</span>
        </div>
      )}
      <div className="m-detail-row">
        <span className="m-detail-row-label">Encumbrance</span>
        <span className="m-detail-row-value">
          {wornReduction ? `${item.enc} worn (${item.baseEnc} carried)` : `${item.enc}`}
        </span>
      </div>
      <div className="m-detail-row">
        <span className="m-detail-row-label">Rarity</span>
        <span className="m-detail-row-value">{item.rarity}</span>
      </div>
      <div className="m-detail-row">
        <span className="m-detail-row-label">Value</span>
        <span className="m-detail-row-value">₵{item.price.toLocaleString()}</span>
      </div>

      {(item.type === 'weapon' || item.type === 'armor') && (
        item.hardPoints > 0 ? (
          <div className="m-detail-row">
            <span className="m-detail-row-label">Attachments</span>
            <span className="m-detail-row-value">{item.attachmentsCount} / {item.hardPoints} hard points used</span>
          </div>
        ) : (
          <div className="m-attach-placeholder">No hard points. This item cannot take attachments.</div>
        )
      )}
      {(item.type === 'weapon' || item.type === 'armor') && item.hardPoints > 0 && (
        <div className="m-attach-placeholder">Attachment management isn&rsquo;t available on mobile yet — view only.</div>
      )}

      {item.wornAnchor && item.equipState === 'equipped' && (
        <div className="m-anchor-note">
          {suppressed
            ? `⚠ ${reasonNote(suppressed)}`
            : 'Only the first item worn on this anchor gets its full encumbrance benefit — a second item sharing it is charged in full or grants no threshold bonus.'}
        </div>
      )}

      {item.description && (
        <div className="m-detail-desc"><RichText text={item.description} /></div>
      )}
      {item.effectText && (
        <div className="m-detail-desc"><RichText text={item.effectText} /></div>
      )}

      <button type="button" className="m-drop-link" onClick={() => setActionSheet('drop')}>
        Drop this item
      </button>

      <MobileStowSheet
        open={actionSheet !== null}
        onClose={() => setActionSheet(null)}
        mode={actionSheet ?? 'stow'}
        itemName={item.name}
        quantity={item.qty}
        campaignId={campaignId}
        onConfirmStow={handleConfirmStow}
        onConfirmDrop={handleConfirmDrop}
      />
    </MobileBottomSheet>
  )
}
