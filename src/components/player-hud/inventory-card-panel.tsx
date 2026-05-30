'use client'
import React, { useState } from 'react'
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'
import { ItemThumbGrid } from './item-thumb-grid'
import { ItemDetailPanel, type SelectedItem } from './item-detail-panel'
import type {
  WpnDisplay, ArmDisplay, GearRow,
  EquipState, RefWeaponQuality, StowLocation, StowableAsset,
} from '@/lib/types'

interface InventoryCardPanelProps {
  weapons:               WpnDisplay[]
  armorItems:            ArmDisplay[]
  gearItems:             GearRow[]
  encumbranceCurrent:    number
  encumbranceThreshold:  number
  refWeaponQualityMap:   Record<string, RefWeaponQuality>
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:        (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:      (id: string, note?: string) => void
  onDiscardArmor?:       (id: string, note?: string) => void
  onDiscardGear?:        (id: string, note?: string) => void
  isGmMode?:             boolean
  characterName?:        string
}

function resolveSelected(
  id: string,
  weapons: WpnDisplay[],
  armorItems: ArmDisplay[],
  gearItems: GearRow[],
): SelectedItem | null {
  const w = weapons.find(x => x.id === id)
  if (w) return { kind: 'weapon', item: w }
  const a = armorItems.find(x => x.id === id)
  if (a) return { kind: 'armor', item: a }
  const g = gearItems.find(x => x.id === id)
  if (g) return { kind: 'gear', item: g }
  return null
}

function defaultId(weapons: WpnDisplay[], armorItems: ArmDisplay[], gearItems: GearRow[]): string | null {
  return weapons[0]?.id ?? armorItems[0]?.id ?? gearItems[0]?.id ?? null
}

function EncBar({ current, threshold }: { current: number; threshold: number }) {
  const pct     = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  const overenc = current > threshold
  return (
    <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--hud-border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hud-text-dim)' }}>
          Encumbrance
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: overenc ? 'var(--hud-vital-wounds)' : 'var(--hud-gold)', fontWeight: 700 }}>
          {current} / {threshold}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: overenc
            ? `linear-gradient(90deg, var(--hud-vital-wounds), color-mix(in srgb, var(--hud-vital-wounds) 80%, white))`
            : `linear-gradient(90deg, color-mix(in srgb, var(--hud-gold) 53%, transparent), var(--hud-gold))`,
          transition: 'width var(--ease-smooth)',
          borderRadius: RADIUS.sm,
        }} />
      </div>
    </div>
  )
}

export function InventoryCardPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold,
  refWeaponQualityMap, stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: InventoryCardPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    defaultId(weapons, armorItems, gearItems)
  )

  const allIds = new Set([...weapons, ...armorItems, ...gearItems].map(x => x.id))
  const activeId = selectedId && allIds.has(selectedId)
    ? selectedId
    : defaultId(weapons, armorItems, gearItems)

  const selected = activeId ? resolveSelected(activeId, weapons, armorItems, gearItems) : null
  const isEmpty  = weapons.length === 0 && armorItems.length === 0 && gearItems.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <EncBar current={encumbranceCurrent} threshold={encumbranceThreshold} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ItemThumbGrid
          weapons={weapons} armorItems={armorItems} gearItems={gearItems}
          selectedId={activeId} onSelect={setSelectedId}
        />
        {isEmpty ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)',
            fontStyle: 'italic',
          }}>
            No items in inventory
          </div>
        ) : selected ? (
          <ItemDetailPanel
            selected={selected}
            refWeaponQualityMap={refWeaponQualityMap}
            stowableAssets={stowableAssets}
            baseOfOperationsName={baseOfOperationsName}
            onSetWeaponState={onSetWeaponState}
            onSetArmorState={onSetArmorState}
            onSetGearState={onSetGearState}
            onDiscardWeapon={onDiscardWeapon}
            onDiscardArmor={onDiscardArmor}
            onDiscardGear={onDiscardGear}
            isGmMode={isGmMode}
            characterName={characterName}
          />
        ) : null}
      </div>
    </div>
  )
}
