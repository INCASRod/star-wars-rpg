'use client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { InventoryCardPanel } from './inventory-card-panel'
import type { WpnDisplay, ArmDisplay, GearRow, StowableAsset, StowLocation, EquipState } from '@/lib/types'
import type { EncumbranceStats } from '@/lib/derivedStats'

interface HudInventoryTabProps {
  hudWeapons:            WpnDisplay[]
  hudArmor:              ArmDisplay[]
  hudGear:               GearRow[]
  encumbranceCurrent:    number
  encThreshold:          number
  encumbranceStats:      EncumbranceStats | null
  brawn:                 number
  onSimulate:            (itemId: string, itemType: 'weapon' | 'armor' | 'gear', targetState: EquipState) => EncumbranceStats | null
  refWeaponQualityMap:   Record<string, any>
  isGmMode:              boolean
  characterName:         string
  characterId:           string
  stowableAssets:        StowableAsset[]
  baseOfOperationsName:  string | null
  effectiveCampaignId:   string | null
  supabase:              SupabaseClient
  onSetEquipState:       (id: string, type: 'weapon' | 'armor' | 'gear', state: EquipState, location?: StowLocation | null) => void
  onRemoveWeapon:        (id: string, mode: 'gm' | 'player', note?: string) => void
  onRemoveEquipment:     (id: string, type: 'armor' | 'gear', mode: 'gm' | 'player', note?: string) => void
}

export function HudInventoryTab({
  hudWeapons, hudArmor, hudGear,
  encumbranceCurrent, encThreshold,
  encumbranceStats, brawn, onSimulate,
  refWeaponQualityMap,
  isGmMode, characterName, characterId,
  stowableAssets, baseOfOperationsName,
  effectiveCampaignId, supabase,
  onSetEquipState, onRemoveWeapon, onRemoveEquipment,
}: HudInventoryTabProps) {
  function logItemDiscard(label: string) {
    if (!effectiveCampaignId) return
    supabase.from('roll_log').insert({
      campaign_id: effectiveCampaignId, character_id: characterId,
      character_name: characterName, roll_label: label, roll_type: 'Item Award',
      pool: { proficiency:0, ability:0, boost:0, challenge:0, difficulty:0, setback:0, force:0 },
      result: { netSuccess:0, netAdvantage:0, triumph:0, despair:0, succeeded:false },
      is_dm: !!isGmMode, hidden: false,
    }).then(({ error }) => { if (error) console.warn('[discard] log failed:', error.message) })
  }

  return (
    <InventoryCardPanel
      weapons={hudWeapons}
      armorItems={hudArmor}
      gearItems={hudGear}
      encumbranceCurrent={encumbranceCurrent}
      encumbranceThreshold={encThreshold}
      encumbranceStats={encumbranceStats}
      brawn={brawn}
      onSimulate={onSimulate}
      refWeaponQualityMap={refWeaponQualityMap}
      stowableAssets={stowableAssets}
      baseOfOperationsName={baseOfOperationsName}
      onSetWeaponState={(id, s, loc) => onSetEquipState(id, 'weapon', s, loc)}
      onSetArmorState={(id, s, loc)  => onSetEquipState(id, 'armor',  s, loc)}
      onSetGearState={(id, s, loc)   => onSetEquipState(id, 'gear',   s, loc)}
      onDiscardWeapon={(id, note) => {
        const name = hudWeapons.find(w => w.id === id)?.name ?? 'weapon'
        onRemoveWeapon(id, isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      onDiscardArmor={(id, note) => {
        const name = hudArmor.find(a => a.id === id)?.name ?? 'armor'
        onRemoveEquipment(id, 'armor', isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      onDiscardGear={(id, note) => {
        const name = hudGear.find(g => g.id === id)?.name ?? 'gear'
        onRemoveEquipment(id, 'gear', isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      isGmMode={isGmMode}
      characterName={characterName}
    />
  )
}
