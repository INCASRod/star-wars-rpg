'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Character, CharacterWeapon, CharacterArmor, CharacterGear, RefWeaponQuality } from '@/lib/types'
import type { RefWeapon, RefArmor, RefGear } from '@/lib/types'
import { computeEncumbranceStats } from '@/lib/derivedStats'
import type { SupabaseClient } from '@supabase/supabase-js'
import { QualityBadge } from '@/components/character/QualityBadge'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const BG        = 'rgba(0,0,0,0.7)'
const PANEL_BG  = 'rgba(8,16,10,0.97)'
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const RED       = '#E05050'
const BLUE      = '#5AAAE0'
const WARN      = '#E07855'
const FONT_C    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'

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
        supabase.from('ref_armor').select('key,encumbrance'),
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

  const itemTypeColor = item.type === 'weapon' ? RED : item.type === 'armor' ? BLUE : DIM

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 550, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${BORDER_HI}`,
          borderRadius: 6, padding: 24,
          maxWidth: '38rem', width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: TEXT, letterSpacing: '0.05em' }}>
              {item.name}
            </div>
            <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: itemTypeColor, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>
              Award {item.type} · ENC {item.encumbrance}
            </div>
            {item.qualities && item.qualities.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {item.qualities.map(q => (
                  <QualityBadge key={q.key} quality={q} refQualityMap={refQualityMap} variant="desktop" />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: DIM, cursor: 'pointer', fontFamily: FONT_C, fontSize: FS_SM }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM }}
          >✕</button>
        </div>

        {/* Quantity (gear only, not when quantity is fixed) */}
        {item.type === 'gear' && !fixedQuantity && (
          <div style={{ marginBottom: 16 }}>
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
        <div style={{ marginBottom: 18 }}>
          <div style={fieldLabel}>Award to</div>
          {loadingInv ? (
            <div style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: DIM, padding: '12px 0' }}>Loading inventories…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                      border: `1px solid ${isSelected ? BORDER_HI : BORDER}`,
                      borderRadius: 4, padding: '8px 12px',
                      cursor: 'pointer', transition: '.15s',
                    }}
                    onClick={() => toggleChar(c.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                        border: `1px solid ${isSelected ? GOLD : BORDER_HI}`,
                        background: isSelected ? GOLD : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <span style={{ fontSize: 10, color: '#060D09', fontWeight: 700 }}>✓</span>}
                      </div>

                      {/* Name */}
                      <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: isSelected ? TEXT : DIM, fontWeight: isSelected ? 700 : 400, flex: 1 }}>
                        {c.name}
                      </span>

                      {/* Encumbrance status */}
                      {enc && (
                        <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: afterOver ? WARN : currentOver ? WARN : 'rgba(200,170,80,0.5)' }}>
                          {currentOver && '⚠ '}ENC {enc.current}→{enc.afterCurrent}/{enc.threshold}
                          {afterOver && !currentOver && <span style={{ marginLeft: 4, color: WARN }}>OVER</span>}
                        </span>
                      )}

                      {/* Equip state (shown when row selected) */}
                      {isSelected && (
                        <select
                          value={getEquipChoice(c.id)}
                          onChange={e => { e.stopPropagation(); setEquipChoice(c.id, e.target.value as EquipChoice) }}
                          onClick={e => e.stopPropagation()}
                          style={{ ...inputStyle, padding: '2px 6px', fontSize: FS_CAP, minWidth: 90 }}
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
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
    </div>,
    document.body,
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_C, fontSize: FS_OVER, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: GOLD_DIM, marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${GOLD_BD}`,
  color: TEXT, fontFamily: FONT_C, fontSize: FS_LABEL,
  padding: '6px 10px', borderRadius: 3, outline: 'none',
}

const btnPrimaryStyle: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid ${GOLD_BD}`,
  color: GOLD, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  padding: '8px 18px', borderRadius: 3, cursor: 'pointer',
}

const btnSecondaryStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER}`,
  color: DIM, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '8px 14px', borderRadius: 3, cursor: 'pointer',
}
