'use client'

import { useMemo, useState } from 'react'
import type {
  CharacterWeapon, CharacterArmor, CharacterGear,
  RefWeapon, RefArmor, RefGear, RefWeaponQuality, RefSkill,
  EquipState, EquipSlot, StowLocation, StowLocationType,
} from '@/lib/types'
import type { EncumbranceStats } from '@/lib/derivedStats'
import { displayableQualities } from './MobileWeaponStep'
import { MobileItemDetailSheet, type GearItem } from './MobileItemDetailSheet'

const STATE_ORDER: EquipState[] = ['equipped', 'carrying', 'stowed']
const STATE_LABEL: Record<EquipState, string> = { equipped: 'Equipped', carrying: 'Carried', stowed: 'Stowed' }

export interface MobileGearDestinationProps {
  weapons: CharacterWeapon[]
  armor: CharacterArmor[]
  gear: CharacterGear[]
  refWeaponMap: Record<string, RefWeapon>
  refArmorMap: Record<string, RefArmor>
  refGearMap: Record<string, RefGear>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  refSkillMap: Record<string, RefSkill>
  iconUrlByItemId: Record<string, string | null>
  itemImageUrlByItemId: Record<string, string | null>
  encumbranceStats: EncumbranceStats | null
  credits: number
  brawn: number
  campaignId: string | null
  onSetEquipState: (id: string, type: 'weapon' | 'armor' | 'gear', state: EquipState, location?: StowLocation | null, equipSlot?: EquipSlot | null) => void
  onDropWeapon: (id: string) => void
  onDropEquipment: (id: string, type: 'armor' | 'gear') => void
}

export function MobileGearDestination({
  weapons, armor, gear, refWeaponMap, refArmorMap, refGearMap, refWeaponQualityMap, refSkillMap,
  iconUrlByItemId, itemImageUrlByItemId, encumbranceStats, credits, brawn, campaignId,
  onSetEquipState, onDropWeapon, onDropEquipment,
}: MobileGearDestinationProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<EquipState | 'all'>('all')
  const [ledgerExpanded, setLedgerExpanded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items: GearItem[] = useMemo(() => {
    const out: GearItem[] = []
    for (const w of weapons) {
      const ref = refWeaponMap[w.weapon_key]
      out.push({
        id: w.id, type: 'weapon', refKey: w.weapon_key,
        name: w.custom_name || ref?.name || w.weapon_key || 'Weapon',
        iconUrl: iconUrlByItemId[w.id] ?? null, itemImageUrl: itemImageUrlByItemId[w.id] ?? null,
        equipState: w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
        equipSlot: w.equip_slot ?? null,
        stowLocation: w.equip_state === 'stowed' && w.stow_location_id && w.stow_location_type
          ? { id: w.stow_location_id, name: w.stow_location_name ?? '', type: w.stow_location_type as StowLocationType } : null,
        qty: 1,
        enc: encumbranceStats?.perItem[w.id]?.cost ?? 0,
        baseEnc: ref?.encumbrance ?? 0,
        rarity: ref?.rarity ?? 0, price: ref?.price ?? 0, hardPoints: ref?.hard_points ?? 0,
        attachmentsCount: Array.isArray(w.attachments) ? w.attachments.length : 0,
        description: ref?.description ?? null, effectText: ref?.effect_text ?? null, loreText: ref?.lore_text ?? null,
        wornAnchor: null,
        weaponStats: ref ? {
          damage: ref.damage_add != null ? `+${ref.damage_add}` : `${ref.damage}`,
          crit: ref.crit, range: ref.range_value ?? '',
          skillName: refSkillMap[ref.skill_key]?.name ?? ref.skill_key,
          qualities: displayableQualities(ref, refWeaponQualityMap),
        } : undefined,
      })
    }
    for (const a of armor) {
      const ref = refArmorMap[a.armor_key]
      out.push({
        id: a.id, type: 'armor', refKey: a.armor_key,
        name: a.custom_name || ref?.name || a.armor_key || 'Armor',
        iconUrl: iconUrlByItemId[a.id] ?? null, itemImageUrl: itemImageUrlByItemId[a.id] ?? null,
        equipState: a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
        equipSlot: a.equip_slot ?? null,
        stowLocation: a.equip_state === 'stowed' && a.stow_location_id && a.stow_location_type
          ? { id: a.stow_location_id, name: a.stow_location_name ?? '', type: a.stow_location_type as StowLocationType } : null,
        qty: 1,
        enc: encumbranceStats?.perItem[a.id]?.cost ?? 0,
        baseEnc: ref?.encumbrance ?? 0,
        rarity: ref?.rarity ?? 0, price: ref?.price ?? 0, hardPoints: ref?.hard_points ?? 0,
        attachmentsCount: Array.isArray(a.attachments) ? a.attachments.length : 0,
        description: ref?.description ?? null, effectText: ref?.effect_text ?? null, loreText: ref?.lore_text ?? null,
        wornAnchor: ref?.worn_anchor ?? null,
        armorStats: ref ? { soak: ref.soak, defense: ref.defense } : undefined,
      })
    }
    for (const g of gear) {
      const ref = refGearMap[g.gear_key]
      out.push({
        id: g.id, type: 'gear', refKey: g.gear_key,
        name: g.custom_name || ref?.name || g.gear_key || 'Gear',
        iconUrl: iconUrlByItemId[g.id] ?? null, itemImageUrl: itemImageUrlByItemId[g.id] ?? null,
        equipState: g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
        equipSlot: g.equip_slot ?? null,
        stowLocation: g.equip_state === 'stowed' && g.stow_location_id && g.stow_location_type
          ? { id: g.stow_location_id, name: g.stow_location_name ?? '', type: g.stow_location_type as StowLocationType } : null,
        qty: g.quantity ?? 1,
        enc: encumbranceStats?.perItem[g.id]?.cost ?? 0,
        baseEnc: ref?.encumbrance ?? 0,
        rarity: ref?.rarity ?? 0, price: ref?.price ?? 0, hardPoints: 0,
        attachmentsCount: 0,
        description: ref?.description ?? null, effectText: ref?.effect_text ?? null, loreText: null,
        wornAnchor: ref?.worn_anchor ?? null,
      })
    }
    return out
  }, [weapons, armor, gear, refWeaponMap, refArmorMap, refGearMap, refWeaponQualityMap, refSkillMap, iconUrlByItemId, itemImageUrlByItemId, encumbranceStats])

  const q = query.trim().toLowerCase()
  const searchFiltered = q ? items.filter(i => i.name.toLowerCase().includes(q)) : items
  const counts: Record<EquipState | 'all', number> = {
    all: searchFiltered.length,
    equipped: searchFiltered.filter(i => i.equipState === 'equipped').length,
    carrying: searchFiltered.filter(i => i.equipState === 'carrying').length,
    stowed: searchFiltered.filter(i => i.equipState === 'stowed').length,
  }
  const visible = filter === 'all' ? searchFiltered : searchFiltered.filter(i => i.equipState === filter)
  const selected = items.find(i => i.id === selectedId) ?? null

  const es = encumbranceStats
  const current = es?.load ?? 0
  const threshold = es?.threshold ?? 0
  const cliff = es?.cliff ?? 0
  const over = current > threshold
  const overBy = current - threshold
  const losesManeuver = over && overBy >= brawn
  const pct = threshold > 0 ? Math.min(100, (current / threshold) * 100) : 0
  const markerPct = cliff > 0 ? Math.min(100, (threshold / cliff) * 100) : 0

  return (
    <div className="m-abilities">
      {/* ── Part A — Encumbrance ledger ─────────────────────────────────── */}
      <div className="m-ledger">
        <div className="m-ledger-top">
          <span>
            <span className={`m-ledger-current${over ? ' is-over' : ''}`}>{current}/{threshold}</span>
            <span className="m-ledger-current-label">Encumbrance</span>
          </span>
          <span className="m-ledger-credits">₵{credits.toLocaleString()}</span>
        </div>
        <div className="m-ledger-track">
          {/* width/left are live current/threshold/cliff percentages — no CSS-class equivalent, documented inline style exception */}
          <div className={`m-ledger-track-fill${over ? ' is-over' : ''}`} style={{ width: `${pct}%` }} />
          {cliff > 0 && <div className="m-ledger-track-marker" style={{ left: `${markerPct}%` }} aria-hidden="true" />}
        </div>
        {over && (
          <div className="m-ledger-penalty">
            Over threshold by {overBy}: add [setback:{overBy}] to all Brawn and Agility checks.
            {losesManeuver && ' No free maneuver each turn — each maneuver costs 2 strain.'}
          </div>
        )}
        <button type="button" className="m-ledger-expander" onClick={() => setLedgerExpanded(v => !v)}>
          {ledgerExpanded ? 'Hide derivation ▴' : 'Show derivation ▾'}
        </button>
        {ledgerExpanded && es && (
          <div className="m-ledger-rows">
            <div className="m-ledger-row"><span>Base</span><span>5</span></div>
            <div className="m-ledger-row"><span>Brawn</span><span>+{brawn}</span></div>
            {es.capacitySources.filter(s => !s.suppressed && s.value > 0).map(s => (
              <div key={s.id} className="m-ledger-row"><span>{s.label}</span><span>+{s.value}</span></div>
            ))}
            <div className="m-ledger-row is-total"><span>Threshold</span><span>{threshold}</span></div>
          </div>
        )}
      </div>

      {/* ── Part B — Item list ───────────────────────────────────────────── */}
      <div className="m-search-sticky">
        <input
          type="search" className="m-search-input" placeholder="Search gear…"
          value={query} onChange={e => setQuery(e.target.value)} aria-label="Search gear"
        />
        <div className="m-chip-row">
          {(['all', ...STATE_ORDER] as (EquipState | 'all')[]).map(f => (
            <button key={f} type="button" className={`m-chip${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : STATE_LABEL[f]} <span className="m-chip-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="m-result-list">
        {visible.length === 0 ? (
          <div className="m-placeholder">
            <div className="m-placeholder-title">{q ? 'No results' : 'Nothing here yet'}</div>
            <div className="m-placeholder-body">{q ? `Nothing matches "${query}".` : 'Items you carry will appear here.'}</div>
          </div>
        ) : (
          STATE_ORDER.map(state => {
            const rows = visible.filter(i => i.equipState === state)
            if (rows.length === 0) return null
            const subtotal = rows.reduce((s, i) => s + i.enc, 0)
            return (
              <div key={state}>
                <div className="m-group-label">
                  {STATE_LABEL[state]} ({rows.length}) <span className="m-group-subtotal">· {subtotal} enc</span>
                </div>
                {rows.map(item => (
                  <button key={item.id} type="button" className="m-item-row" onClick={() => setSelectedId(item.id)}>
                    {item.iconUrl ? (
                      <img className="m-item-icon" src={item.iconUrl} alt="" />
                    ) : (
                      <span className="m-item-icon-fallback" aria-hidden="true">
                        {item.type === 'weapon' ? '⌖' : item.type === 'armor' ? '⛨' : '◈'}
                      </span>
                    )}
                    <span className="m-item-meta">
                      <span className="m-item-name">{item.name}</span>
                      <span className="m-item-sub">
                        {item.type === 'weapon' && item.weaponStats ? `${item.weaponStats.skillName} · DMG ${item.weaponStats.damage} · CRIT ${item.weaponStats.crit}` : null}
                        {item.type === 'armor' && item.armorStats ? `Soak ${item.armorStats.soak} · Defense ${item.armorStats.defense}` : null}
                        {item.type === 'gear' ? `Qty ${item.qty}` : null}
                        {item.equipState === 'equipped' && item.equipSlot ? ` · ${item.equipSlot}` : ''}
                      </span>
                    </span>
                    <span className="m-item-right">
                      {item.qty > 1 && <span className="m-item-state-tag">×{item.qty}</span>}
                      <span className="m-item-enc">{item.enc} enc</span>
                    </span>
                  </button>
                ))}
              </div>
            )
          })
        )}
      </div>

      <MobileItemDetailSheet
        item={selected}
        onClose={() => setSelectedId(null)}
        refWeaponQualityMap={refWeaponQualityMap}
        encumbranceStats={encumbranceStats}
        campaignId={campaignId}
        onSetEquipState={onSetEquipState}
        onDropWeapon={onDropWeapon}
        onDropEquipment={onDropEquipment}
      />
    </div>
  )
}
