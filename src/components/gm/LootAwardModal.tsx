'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Character, CharacterWeapon, CharacterArmor, CharacterGear, RefWeaponQuality } from '@/lib/types'
import type { RefWeapon, RefArmor, RefGear } from '@/lib/types'
import { computeEncumbranceStats } from '@/lib/derivedStats'
import type { SupabaseClient } from '@supabase/supabase-js'
import { QualityBadge } from '@/components/character/QualityBadge'
import { HUD, FONT_BODY, FONT_MONO, RADIUS, EASE, FS } from '@/lib/tokens'

// ─── Tokens ──────────────────────────────────────────────────────────────────
// Pre-approved exceptions kept:
//   - rgba(0,0,0,*) overlay backgrounds
//   - Rarity / item-type identity colours remain as CSS state tokens
//   - #060D09 checkmark contrast colour (single use, dark bg fg)
// Mapped:
//   RED  (#E05050) → var(--state-failure)    weapon type indicator
//   BLUE (#5AAAE0) → var(--die-force)        armor type indicator
//   WARN (#E07855) → var(--state-threat)     encumbrance over-limit warning
const RED  = 'var(--state-failure)'
const BLUE = 'var(--die-force)'
const WARN = 'var(--state-threat)'

const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-body-sm)'

export interface AwardableItem {
  key:         string
  name:        string
  type:        'weapon' | 'armor' | 'gear'
  encumbrance: number
  qualities?:  { key: string; count?: number | null }[]
}

interface CharInventory {
  weapons: CharacterWeapon[]
  armor:   CharacterArmor[]
  gear:    CharacterGear[]
}

interface LootAwardModalProps {
  item:        AwardableItem
  characters:  Character[]
  campaignId:  string | null
  supabase:    SupabaseClient
  onClose:     () => void
  /** Called after successful award with names and ids of awarded characters */
  onAwardComplete: (charNames: string[], charIds: string[]) => void
  /** Send realtime broadcast to a character */
  sendToChar: (charId: string, payload: Record<string, unknown>) => void
  /** Pre-select a character when the modal opens */
  preSelectedCharId?: string
  /** Lock quantity at 1 (for awarding a single dropped item) */
  fixedQuantity?: boolean
  /** When provided, overrides the default DB-insert award flow */
  onCustomAward?: (charIds: string[], charNames: string[], equipChoices: Record<string, EquipChoice>, quantity: number) => Promise<void>
}

type EquipChoice = 'carrying' | 'stowed'

export function LootAwardModal({
  item, characters, campaignId,
  supabase, onClose, onAwardComplete, sendToChar,
  preSelectedCharId, fixedQuantity, onCustomAward,
}: LootAwardModalProps) {
  const [selected,     setSelected]     = useState<Set<string>>(preSelectedCharId ? new Set([preSelectedCharId]) : new Set())
  const [equipChoices, setEquipChoices] = useState<Record<string, EquipChoice>>({})
  const [quantity,     setQuantity]     = useState(1)
  const [busy,         setBusy]         = useState(false)
  const [loadingInv,   setLoadingInv]   = useState(true)

  const [inventories,    setInventories]    = useState<Record<string, CharInventory>>({})
  const [refWeaponMap,   setRefWeaponMap]   = useState<Record<string, RefWeapon>>({})
  const [refArmorMap,    setRefArmorMap]    = useState<Record<string, RefArmor>>({})
  const [refGearMap,     setRefGearMap]     = useState<Record<string, RefGear>>({})
  const [refQualityMap,  setRefQualityMap]  = useState<Record<string, RefWeaponQuality>>({})

  // Load inventories + ref maps on open
  useEffect(() => {
    if (characters.length === 0) { setLoadingInv(false); return }
    const ids = characters.map(c => c.id)

    const loadInventory = async () => {
      const [wRes, aRes, gRes] = await Promise.all([
        supabase.from('character_weapons').select('*').in('character_id', ids).eq('is_dropped', false),
        supabase.from('character_armor').select('*').in('character_id', ids).eq('is_dropped', false),
        supabase.from('character_gear').select('*').in('character_id', ids).eq('is_dropped', false),
      ])
      const invMap: Record<string, CharInventory> = {}
      for (const c of characters) {
        invMap[c.id] = {
          weapons: (wRes.data || []).filter((r: { character_id: string }) => r.character_id === c.id) as CharacterWeapon[],
          armor:   (aRes.data || []).filter((r: { character_id: string }) => r.character_id === c.id) as CharacterArmor[],
          gear:    (gRes.data || []).filter((r: { character_id: string }) => r.character_id === c.id) as CharacterGear[],
        }
      }
      setInventories(invMap)
    }

    const loadRefs = async () => {
      const [rw, ra, rg, rq] = await Promise.all([
        supabase.from('ref_weapons').select('key,encumbrance'),
        supabase.from('ref_armor').select('key,encumbrance,encumbrance_bonus'),
        supabase.from('ref_gear').select('key,encumbrance,encumbrance_bonus'),
        supabase.from('ref_weapon_qualities').select('key,name,description,is_ranked,stat_modifier'),
      ])
      const toMap = <T extends { key: string }>(rows: T[] | null): Record<string, T> =>
        Object.fromEntries((rows || []).map(r => [r.key, r]))
      setRefWeaponMap(toMap(rw.data as RefWeapon[] | null))
      setRefArmorMap(toMap(ra.data as RefArmor[] | null))
      setRefGearMap(toMap(rg.data as RefGear[] | null))
      setRefQualityMap(toMap(rq.data as RefWeaponQuality[] | null))
    }

    Promise.all([loadInventory(), loadRefs()]).finally(() => setLoadingInv(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleChar = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const getEquipChoice = (id: string): EquipChoice => equipChoices[id] ?? 'carrying'
  const setEquipChoice = (id: string, v: EquipChoice) =>
    setEquipChoices(prev => ({ ...prev, [id]: v }))

  const encByChar = useMemo(() => {
    if (loadingInv) return {}
    const map: Record<string, { current: number; threshold: number; afterCurrent: number }> = {}
    for (const c of characters) {
      const inv = inventories[c.id]
      if (!inv) continue
      const stats = computeEncumbranceStats(
        c, inv.armor, refArmorMap, inv.gear, refGearMap, inv.weapons, refWeaponMap,
      )
      const addedEnc = item.encumbrance * (item.type === 'gear' ? quantity : 1)
      map[c.id] = { ...stats, afterCurrent: stats.current + addedEnc }
    }
    return map
  }, [loadingInv, characters, inventories, refWeaponMap, refArmorMap, refGearMap, item, quantity])

  const handleAward = async () => {
    if (selected.size === 0) return
    setBusy(true)
    const charNames: string[] = []
    const charIds: string[] = []

    if (onCustomAward) {
      for (const charId of selected) {
        const char = characters.find(c => c.id === charId)
        if (!char) continue
        charIds.push(charId)
        charNames.push(char.name)
      }
      await onCustomAward(charIds, charNames, equipChoices, quantity)
      setBusy(false)
      onAwardComplete(charNames, charIds)
      return
    }

    for (const charId of selected) {
      const char = characters.find(c => c.id === charId)
      if (!char) continue
      const equip = getEquipChoice(charId)
      const isEquipped = equip === 'carrying'

      if (item.type === 'weapon') {
        await supabase.from('character_weapons').insert({
          character_id: charId, weapon_key: item.key,
          is_equipped: false, equip_state: equip, attachments: [], notes: 'Awarded by GM',
        })
      } else if (item.type === 'armor') {
        await supabase.from('character_armor').insert({
          character_id: charId, armor_key: item.key,
          is_equipped: false, equip_state: equip, attachments: [], notes: 'Awarded by GM',
        })
      } else {
        await supabase.from('character_gear').insert({
          character_id: charId, gear_key: item.key,
          quantity, is_equipped: isEquipped, equip_state: equip, notes: 'Awarded by GM',
        })
      }

      sendToChar(charId, {
        type: 'dialog',
        message: `You received ${quantity > 1 ? `${quantity}× ` : ''}${item.name}!`,
      })
      charIds.push(charId)
      charNames.push(char.name)
    }

    // Single combined feed entry for the award
    if (campaignId && charNames.length > 0) {
      const itemLabel = quantity > 1 ? `${item.name} ×${quantity}` : item.name
      supabase.from('roll_log').insert({
        campaign_id:           campaignId,
        character_id:          null,
        character_name:        'GM',
        roll_label:            `${itemLabel} awarded to ${charNames.join(', ')}`,
        roll_type:             'Item Award',
        alignment:             'system',
        pool:                  { proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
        result:                { netSuccess: 0, netAdvantage: 0, triumph: 0, despair: 0, succeeded: false },
        is_dm:                 false,
        hidden:                false,
        is_visible_to_players: true,
      }).then(({ error }) => { if (error) console.warn('[item award log]', error.message) })
    }

    setBusy(false)
    onAwardComplete(charNames, charIds)
  }

  const itemTypeColor = item.type === 'weapon' ? RED : item.type === 'armor' ? BLUE : HUD.textDim

  return (
    <Modal open onClose={onClose} maxWidth="38rem">
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.125rem' }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.text, letterSpacing: '0.05em' }}>
              {item.name}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: itemTypeColor, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.125rem' }}>
              Award {item.type} · ENC {item.encumbrance}
            </div>
            {item.qualities && item.qualities.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
                {item.qualities.map(q => (
                  <QualityBadge key={q.key} quality={q} refQualityMap={refQualityMap} variant="desktop" />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="hov-gold-text"
            style={{ background: 'transparent', border: 'none', color: HUD.textDim, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS_SM }}
          >✕</button>
        </div>

        {/* Quantity (gear only, not when quantity is fixed) */}
        {item.type === 'gear' && !fixedQuantity && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={fieldLabel}>Quantity</div>
            <input
              type="number" min={1} max={99}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={inputStyle}
            />
          </div>
        )}

        {/* Character list */}
        <div style={{ marginBottom: '1.125rem' }}>
          <div style={fieldLabel}>Award to</div>
          {loadingInv ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: HUD.textDim, padding: '0.75rem 0' }}>Loading inventories…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {characters.map(c => {
                const isSelected = selected.has(c.id)
                const enc = encByChar[c.id]
                const afterOver = enc ? enc.afterCurrent > enc.threshold : false
                const currentOver = enc ? enc.current > enc.threshold : false

                return (
                  <div
                    key={c.id}
                    style={{
                      background: isSelected ? 'rgba(200,170,80,0.07)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${isSelected ? HUD.borderHi : HUD.border}`,
                      borderRadius: RADIUS.md, padding: '0.5rem 0.75rem',
                      cursor: 'pointer', transition: EASE.quick,
                    }}
                    onClick={() => toggleChar(c.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      {/* Checkbox */}
                      <div style={{
                        width: '1rem', height: '1rem', borderRadius: RADIUS.sm, flexShrink: 0,
                        border: `1px solid ${isSelected ? HUD.gold : HUD.borderHi}`,
                        background: isSelected ? HUD.gold : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {/* Pre-approved: #060D09 is a near-black contrast colour for gold checkbox tick */}
                        {isSelected && <span style={{ fontSize: FS_OVER, color: '#060D09', fontWeight: 700 }}>✓</span>}
                      </div>

                      {/* Name */}
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: isSelected ? HUD.text : HUD.textDim, fontWeight: isSelected ? 700 : 400, flex: 1 }}>
                        {c.name}
                      </span>

                      {/* Encumbrance status */}
                      {enc && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAP, color: afterOver || currentOver ? WARN : 'rgba(200,170,80,0.5)' }}>
                          {currentOver && '⚠ '}ENC {enc.current}→{enc.afterCurrent}/{enc.threshold}
                          {afterOver && !currentOver && <span style={{ marginLeft: '0.25rem', color: WARN }}>OVER</span>}
                        </span>
                      )}

                      {/* Equip state (shown when row selected) */}
                      {isSelected && (
                        <select
                          value={getEquipChoice(c.id)}
                          onChange={e => { e.stopPropagation(); setEquipChoice(c.id, e.target.value as EquipChoice) }}
                          onClick={e => e.stopPropagation()}
                          style={{ ...inputStyle, padding: '0.125rem 0.375rem', fontSize: FS_CAP, minWidth: '5.625rem' }}
                        >
                          <option value="carrying">Carrying</option>
                          <option value="stowed">Stowed</option>
                        </select>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancel</button>
          <button
            onClick={handleAward}
            disabled={selected.size === 0 || busy || loadingInv}
            style={{ ...btnPrimaryStyle, opacity: selected.size === 0 || busy || loadingInv ? 0.4 : 1 }}
          >
            {busy ? 'Awarding…' : `Award to ${selected.size} character${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_BODY, fontSize: FS_OVER, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'rgba(200,170,80,0.5)', marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid rgba(200,170,80,0.3)`,
  color: HUD.text, fontFamily: FONT_BODY, fontSize: FS_LABEL,
  padding: '0.375rem 0.625rem', borderRadius: RADIUS.sm, outline: 'none',
}

const btnPrimaryStyle: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid rgba(200,170,80,0.3)`,
  color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  padding: '0.5rem 1.125rem', borderRadius: RADIUS.sm, cursor: 'pointer',
}

const btnSecondaryStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${HUD.border}`,
  color: HUD.textDim, fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '0.5rem 0.875rem', borderRadius: RADIUS.sm, cursor: 'pointer',
}
