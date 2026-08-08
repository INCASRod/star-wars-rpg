'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ItemEditor, type EditableItem, type ItemType } from './ItemEditor'
import { LootAwardModal, type AwardableItem } from './LootAwardModal'
import { RichText } from '@/components/ui/RichText'
import { QualityBadge } from '@/components/character/QualityBadge'
import type { RefWeaponQuality } from '@/lib/types'
import { VendorSellModal, type VendorItem } from './VendorSellModal'
import type { Character } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { HUD, FONT_BODY, EASE, FS, RADIUS, SP, Z, SHADOW } from '@/lib/tokens'
import { useQuartermaster } from '@/hooks/useQuartermaster'
import type { QuartermasterItem } from '@/lib/types'
import { NumberField } from '@/components/ui/NumberField'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = HUD.text
const DIM       = HUD.textDim
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const RED       = 'var(--state-failure)'
const BLUE      = 'var(--die-force)'
const PANEL_BG  = HUD.panel

const LS_EXPANDED = 'holocron_gm_toolbar_expanded'

interface ItemDatabaseTabProps {
  campaignId: string | null
  supabase: SupabaseClient
  characters?: Character[]
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
  onGenerateLoot?: () => void
}

type FilterType = 'all' | ItemType
type FilterScope = 'global' | 'custom' | 'vendor'
type ActiveView = 'items' | 'dropped'

interface DbItem extends EditableItem {
  _table: 'ref_weapons' | 'ref_armor' | 'ref_gear'
}

interface DroppedItem {
  rowId:         string
  rowTable:      'character_weapons' | 'character_armor' | 'character_gear'
  itemKey:       string
  itemName:      string
  itemType:      'weapon' | 'armor' | 'gear'
  characterId:   string
  characterName: string
  droppedAt:     string | null
  droppedBy:     'player' | 'gm' | null
  droppedNote:   string | null
  encumbrance:   number
}

const TYPE_COLOR: Record<string, string> = {
  weapon: RED,
  armor:  BLUE,
  gear:   GOLD_DIM,
}

const WEAPON_SKILL_NAME: Record<string, string> = {
  BRAWL:   'Brawl',
  MELEE:   'Melee',
  LTSABER: 'Lightsaber',
  RANGLT:  'Ranged (Light)',
  RANGHVY: 'Ranged (Heavy)',
  GUNN:    'Gunnery',
  MECH:    'Mechanics',
  SKUL:    'Skulduggery',
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function ItemDatabaseTab({ campaignId, supabase, characters = [], sendToChar, onGenerateLoot }: ItemDatabaseTabProps) {
  // ── Items tab state ──
  const [allItems,    setAllItems]    = useState<DbItem[]>([])  // raw DB result, no client filters
  const [loading,     setLoading]     = useState(false)
  const [filterType,  setFilterType]  = useState<FilterType>('all')
  const [filterScope, setFilterScope] = useState<FilterScope>('custom')
  const [search,      setSearch]      = useState('')
  const [editorItem,  setEditorItem]  = useState<EditableItem | undefined>(undefined)
  const [editorOpen,  setEditorOpen]  = useState(false)
  const [defaultType, setDefaultType] = useState<ItemType>('weapon')
  const [expanded,    setExpanded]    = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(LS_EXPANDED) === 'true'
  })

  // ── Dropped tab state ──
  const [activeView,      setActiveView]      = useState<ActiveView>('items')
  const [droppedItems,    setDroppedItems]    = useState<DroppedItem[]>([])
  const [droppedLoading,  setDroppedLoading]  = useState(false)
  const [awardingDropped, setAwardingDropped] = useState<DroppedItem | null>(null)
  const [awardingItem,    setAwardingItem]    = useState<DbItem | null>(null)
  const [vendingItem,     setVendingItem]     = useState<DbItem | null>(null)
  const [viewingItem,     setViewingItem]     = useState<DbItem | null>(null)
  const [refQualityMap,   setRefQualityMap]   = useState<Record<string, RefWeaponQuality>>({})
  const [destroyConfirm,  setDestroyConfirm]  = useState<string | null>(null) // rowId

  // ── Quartermaster ──
  const { qm, toggleOpen, upsertItem, getQmEntry } = useQuartermaster(supabase, campaignId)
  const [qmPopoverItem, setQmPopoverItem] = useState<DbItem | null>(null)
  const [qmStockDraft,  setQmStockDraft]  = useState(1)
  const [qmPriceDraft,  setQmPriceDraft]  = useState(0)
  const qmPopoverRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = () =>
    setExpanded(prev => {
      const next = !prev
      window.localStorage.setItem(LS_EXPANDED, String(next))
      return next
    })

  // ── Items tab load — only reruns when scope/campaign changes, not on search/type ──
  const loadItems = useCallback(async () => {
    if (!campaignId) return
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyScope = (q: any) => {
      if (filterScope === 'custom') return q.eq('is_custom', true)
      if (filterScope === 'global') return q.eq('is_custom', false)
      return q  // vendor: all items
    }

    const queries = [
      applyScope(supabase.from('ref_weapons').select('key,name,price,rarity,encumbrance,skill_key,damage,damage_add,crit,range_value,hard_points,qualities,description,is_custom,custom_notes,campaign_id'))
        .then((r: { data: unknown[] | null }) => (r.data || []).map((d) => ({ ...(d as Record<string, unknown>), type: 'weapon', _table: 'ref_weapons' as const }))),
      applyScope(supabase.from('ref_armor').select('key,name,price,rarity,encumbrance,encumbrance_bonus,defense,soak,soak_bonus,description,is_custom,custom_notes,campaign_id'))
        .then((r: { data: unknown[] | null }) => (r.data || []).map((d) => ({ ...(d as Record<string, unknown>), type: 'armor', _table: 'ref_armor' as const }))),
      applyScope(supabase.from('ref_gear').select('key,name,price,rarity,encumbrance,encumbrance_bonus,description,is_custom,custom_notes,campaign_id'))
        .then((r: { data: unknown[] | null }) => (r.data || []).map((d) => ({ ...(d as Record<string, unknown>), type: 'gear', _table: 'ref_gear' as const }))),
    ]

    const results = await Promise.all(queries)
    let all = results.flat() as DbItem[]

    if (filterScope === 'custom') all = all.filter(i => i.campaign_id === campaignId)
    all.sort((a, b) => a.name.localeCompare(b.name))
    setAllItems(all)
    setLoading(false)
  }, [supabase, campaignId, filterScope])

  useEffect(() => { if (activeView === 'items') loadItems() }, [loadItems, activeView])

  useEffect(() => {
    supabase.from('ref_weapon_qualities').select('key,name,description,is_ranked,stat_modifier')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, RefWeaponQuality> = {}
        for (const q of data as RefWeaponQuality[]) map[q.key] = q
        setRefQualityMap(map)
      })
  }, [supabase])

  // ── Client-side filter — instant, no DB round-trip ──
  const items = useMemo(() => {
    let filtered = allItems
    if (filterType !== 'all') filtered = filtered.filter(i => i.type === filterType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q))
    }
    return filtered
  }, [allItems, filterType, search])

  // ── Dropped tab load ──
  const loadDropped = useCallback(async () => {
    if (!campaignId) return
    setDroppedLoading(true)

    // Use passed-in characters, or fetch if none provided
    let charList: { id: string; name: string; encumbrance_threshold: number }[] = characters.map(c => ({
      id: c.id, name: c.name, encumbrance_threshold: c.encumbrance_threshold,
    }))

    if (charList.length === 0) {
      const { data } = await supabase
        .from('characters')
        .select('id, name, encumbrance_threshold')
        .eq('campaign_id', campaignId)
      charList = (data || []) as typeof charList
    }

    const charIds = charList.map(c => c.id)
    const charNameMap: Record<string, string> = Object.fromEntries(charList.map(c => [c.id, c.name]))

    if (charIds.length === 0) {
      setDroppedItems([])
      setDroppedLoading(false)
      return
    }

    const [wRes, aRes, gRes, rwRes, raRes, rgRes] = await Promise.all([
      supabase.from('character_weapons').select('id,weapon_key,custom_name,dropped_at,dropped_by,dropped_note,character_id').eq('is_dropped', true).in('character_id', charIds),
      supabase.from('character_armor').select('id,armor_key,custom_name,dropped_at,dropped_by,dropped_note,character_id').eq('is_dropped', true).in('character_id', charIds),
      supabase.from('character_gear').select('id,gear_key,custom_name,dropped_at,dropped_by,dropped_note,character_id').eq('is_dropped', true).in('character_id', charIds),
      supabase.from('ref_weapons').select('key,name,encumbrance'),
      supabase.from('ref_armor').select('key,name,encumbrance'),
      supabase.from('ref_gear').select('key,name,encumbrance'),
    ])

    type RefRow = { key: string; name: string; encumbrance: number }
    const rwMap = Object.fromEntries(((rwRes.data || []) as RefRow[]).map(r => [r.key, r]))
    const raMap = Object.fromEntries(((raRes.data || []) as RefRow[]).map(r => [r.key, r]))
    const rgMap = Object.fromEntries(((rgRes.data || []) as RefRow[]).map(r => [r.key, r]))

    type WRow = { id: string; weapon_key: string; custom_name: string | null; dropped_at: string | null; dropped_by: string | null; dropped_note: string | null; character_id: string }
    type ARow = { id: string; armor_key: string; custom_name: string | null; dropped_at: string | null; dropped_by: string | null; dropped_note: string | null; character_id: string }
    type GRow = { id: string; gear_key: string; custom_name: string | null; dropped_at: string | null; dropped_by: string | null; dropped_note: string | null; character_id: string }

    const combined: DroppedItem[] = [
      ...((wRes.data || []) as WRow[]).map(r => ({
        rowId: r.id, rowTable: 'character_weapons' as const,
        itemKey: r.weapon_key, itemName: r.custom_name || rwMap[r.weapon_key]?.name || r.weapon_key,
        itemType: 'weapon' as const, characterId: r.character_id,
        characterName: charNameMap[r.character_id] || 'Unknown',
        droppedAt: r.dropped_at, droppedBy: r.dropped_by as 'player' | 'gm' | null,
        droppedNote: r.dropped_note, encumbrance: rwMap[r.weapon_key]?.encumbrance ?? 0,
      })),
      ...((aRes.data || []) as ARow[]).map(r => ({
        rowId: r.id, rowTable: 'character_armor' as const,
        itemKey: r.armor_key, itemName: r.custom_name || raMap[r.armor_key]?.name || r.armor_key,
        itemType: 'armor' as const, characterId: r.character_id,
        characterName: charNameMap[r.character_id] || 'Unknown',
        droppedAt: r.dropped_at, droppedBy: r.dropped_by as 'player' | 'gm' | null,
        droppedNote: r.dropped_note, encumbrance: raMap[r.armor_key]?.encumbrance ?? 0,
      })),
      ...((gRes.data || []) as GRow[]).map(r => ({
        rowId: r.id, rowTable: 'character_gear' as const,
        itemKey: r.gear_key, itemName: r.custom_name || rgMap[r.gear_key]?.name || r.gear_key,
        itemType: 'gear' as const, characterId: r.character_id,
        characterName: charNameMap[r.character_id] || 'Unknown',
        droppedAt: r.dropped_at, droppedBy: r.dropped_by as 'player' | 'gm' | null,
        droppedNote: r.dropped_note, encumbrance: rgMap[r.gear_key]?.encumbrance ?? 0,
      })),
    ]

    combined.sort((a, b) => {
      if (!a.droppedAt && !b.droppedAt) return 0
      if (!a.droppedAt) return 1
      if (!b.droppedAt) return -1
      return new Date(b.droppedAt).getTime() - new Date(a.droppedAt).getTime()
    })

    setDroppedItems(combined)
    setDroppedLoading(false)
  }, [supabase, campaignId, characters])

  useEffect(() => { if (activeView === 'dropped') loadDropped() }, [activeView, loadDropped])

  // ── Items tab handlers ──
  const openNew = (type: ItemType) => {
    setDefaultType(type)
    setEditorItem(undefined)
    setEditorOpen(true)
  }

  const openEdit = (item: DbItem) => {
    setEditorItem(item)
    setEditorOpen(true)
  }

  const handleDelete = async (item: DbItem) => {
    if (!item.is_custom || item.campaign_id !== campaignId) return
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    await supabase.from(item._table).delete().eq('key', item.key).eq('campaign_id', campaignId)
    loadItems()
  }

  // ── Dropped tab handlers ──
  const handleDestroy = async (item: DroppedItem) => {
    await supabase.from(item.rowTable).delete().eq('id', item.rowId)
    setDestroyConfirm(null)
    loadDropped()
  }

  const handleDroppedAward = async (
    charIds: string[],
    charNames: string[],
    equipChoices: Record<string, 'carrying' | 'stowed'>,
  ) => {
    if (!awardingDropped || !campaignId) return
    const d = awardingDropped
    const isSoleOriginalOwner = charIds.length === 1 && charIds[0] === d.characterId

    if (isSoleOriginalOwner) {
      // Restore the original row — no new insert
      await supabase.from(d.rowTable).update({
        is_dropped: false, dropped_at: null, dropped_by: null, dropped_note: null,
        equip_state: equipChoices[d.characterId] ?? 'carrying',
      }).eq('id', d.rowId)
    } else {
      // Award to new recipients — insert fresh rows
      for (const charId of charIds) {
        const equip = equipChoices[charId] ?? 'carrying'
        if (d.itemType === 'weapon') {
          await supabase.from('character_weapons').insert({
            character_id: charId, weapon_key: d.itemKey,
            is_equipped: false, equip_state: equip, attachments: [], notes: 'Awarded from dropped items',
          })
        } else if (d.itemType === 'armor') {
          await supabase.from('character_armor').insert({
            character_id: charId, armor_key: d.itemKey,
            is_equipped: false, equip_state: equip, attachments: [], notes: 'Awarded from dropped items',
          })
        } else {
          await supabase.from('character_gear').insert({
            character_id: charId, gear_key: d.itemKey,
            quantity: 1, is_equipped: false, equip_state: equip, notes: 'Awarded from dropped items',
          })
        }
      }
      // Keep the dropped record as audit trail (is_dropped stays true)
    }

    // Notify recipients
    for (const charId of charIds) {
      sendToChar?.(charId, { type: 'dialog', message: `You received ${d.itemName}!` })
    }

    // System log
    supabase.from('roll_log').insert({
      campaign_id: campaignId,
      character_id: null,
      character_name: 'GM',
      roll_label: `${d.itemName} awarded to ${charNames.join(', ')} from dropped items`,
      roll_type: 'system',
      pool: { proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
      result: { netSuccess: 0, netAdvantage: 0, triumph: 0, despair: 0, succeeded: false },
      is_dm: true,
      hidden: false,
    }).then(({ error }) => { if (error) console.warn('[dropped award log]', error.message) })

    setAwardingDropped(null)
    loadDropped()
  }

  const openQmPopover = (item: DbItem) => {
    const existing = getQmEntry(item.key, item.type)
    setQmStockDraft(existing?.stock ?? 1)
    setQmPriceDraft(existing?.price_override ?? item.price ?? 0)
    setQmPopoverItem(item)
  }

  useEffect(() => {
    if (!qmPopoverItem) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (qmPopoverRef.current && !qmPopoverRef.current.contains(e.target as Node)) {
        setQmPopoverItem(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [qmPopoverItem])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: activeView === 'items' && expanded ? 'calc(100% - 2rem)' : '100%',
      transition: `all ${EASE.default}`,
    }}>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.875rem' }}>

        {/* View switcher: Items / Dropped */}
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
          {(['items', 'dropped'] as ActiveView[]).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', padding: '0.25rem 0.75rem', border: 'none', cursor: 'pointer',
                background: activeView === v ? 'rgba(200,170,80,0.15)' : 'transparent',
                color: activeView === v ? HUD.gold : DIM,
              }}
            >
              {v === 'dropped' ? `Dropped${droppedItems.length > 0 ? ` (${droppedItems.length})` : ''}` : 'Items'}
            </button>
          ))}
        </div>

        {activeView === 'items' && (
          <>
            {/* New item buttons */}
            {(['weapon', 'armor', 'gear'] as ItemType[]).map(t => (
              <button
                key={t}
                onClick={() => openNew(t)}
                disabled={!campaignId}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '0.3125rem 0.75rem', borderRadius: RADIUS.sm,
                  cursor: campaignId ? 'pointer' : 'not-allowed',
                  border: `1px solid ${TYPE_COLOR[t]}44`,
                  color: TYPE_COLOR[t],
                  background: `${TYPE_COLOR[t]}10`,
                  opacity: campaignId ? 1 : 0.4,
                }}
              >
                + {t}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Scope toggle */}
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              {([['custom', 'Campaign'], ['global', 'System'], ['vendor', '🛒 Vendor']] as [FilterScope, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setFilterScope(s)}
                  style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', padding: '0.25rem 0.75rem', border: 'none', cursor: 'pointer',
                    background: filterScope === s
                      ? s === 'vendor' ? 'rgba(78,200,122,0.15)' : 'rgba(200,170,80,0.15)'
                      : 'transparent',
                    color: filterScope === s
                      ? s === 'vendor' ? 'var(--state-success)' : HUD.gold
                      : DIM,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Generate Loot */}
            {onGenerateLoot && (
              <button
                onClick={onGenerateLoot}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '0.25rem 0.75rem', borderRadius: RADIUS.sm, cursor: 'pointer',
                  border: `1px solid rgba(150,168,180,0.35)`,
                  color: HUD.gold,
                  background: 'rgba(150,168,180,0.10)',
                }}
              >
                🎲 Loot
              </button>
            )}

            {/* QM Open/Closed toggle */}
            {campaignId && (
              <button
                onClick={toggleOpen}
                className={qm?.is_open ? 'qm-toggle-btn-open' : 'qm-toggle-btn-closed'}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: SP[1],
                  border: qm?.is_open
                    ? `1px solid color-mix(in srgb, var(--state-success) 40%, transparent)`
                    : `1px solid color-mix(in srgb, var(--state-failure) 30%, transparent)`,
                  color: qm?.is_open ? 'var(--state-success)' : 'var(--state-failure)',
                  background: qm?.is_open
                    ? 'color-mix(in srgb, var(--state-success) 10%, transparent)'
                    : 'color-mix(in srgb, var(--state-failure) 08%, transparent)',
                  transition: EASE.quick,
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: RADIUS.full, flexShrink: 0,
                  background: qm?.is_open ? 'var(--state-success)' : 'var(--state-failure)',
                  opacity: qm?.is_open ? 1 : 0.5,
                }} />
                {qm?.is_open ? 'QM: OPEN' : 'QM: CLOSED'}
              </button>
            )}

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              {(['all', 'weapon', 'armor', 'gear'] as FilterType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', padding: '0.25rem 0.625rem', border: 'none', cursor: 'pointer',
                    background: filterType === t ? 'rgba(200,170,80,0.12)' : 'transparent',
                    color: filterType === t ? HUD.gold : DIM,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER}`,
                color: TEXT, fontFamily: FONT_BODY, fontSize: FS.label,
                padding: '0.25rem 0.625rem', borderRadius: RADIUS.sm, outline: 'none', width: '8.75rem',
              }}
            />

            {/* Expand / collapse toggle */}
            <button
              onClick={toggleExpanded}
              style={{
                fontFamily: FONT_BODY,
                fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                textTransform: 'uppercase',
                border: `1px solid ${GOLD_BD}`,
                color: expanded ? HUD.gold : GOLD_DIM,
                borderRadius: RADIUS.md,
                padding: '0.25rem 0.625rem',
                background: expanded ? 'rgba(200,170,80,0.08)' : 'transparent',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: `color ${EASE.quick}, background ${EASE.quick}`,
                flexShrink: 0,
              }}
            >
              {expanded ? '⬇ Collapse' : '⬆ Expand'}
            </button>
          </>
        )}

        {activeView === 'dropped' && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={loadDropped}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption, textTransform: 'uppercase',
                border: `1px solid ${BORDER}`, color: DIM, borderRadius: RADIUS.sm,
                padding: '0.25rem 0.625rem', background: 'transparent', cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >↻ Refresh</button>
          </>
        )}
      </div>

      {/* ── Items tab ── */}
      {activeView === 'items' && (
        <div style={{
          maxHeight: expanded ? '70vh' : '40vh',
          overflowY: 'auto',
          transition: `max-height ${EASE.default}`,
        }}>
          {loading ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, textAlign: 'center', padding: '1.5rem' }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, textAlign: 'center', padding: '1.5rem' }}>
              {filterScope === 'custom'
                ? 'No custom items for this campaign yet. Use the + buttons above to create one.'
                : filterScope === 'vendor'
                ? 'No items match your filters.'
                : 'No system items match your filters.'}
            </div>
          ) : expanded ? (
            /* ── Grid layout (expanded) ── */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.375rem',
            }}>
              {items.map(item => (
                <div
                  key={`${item._table}-${item.key}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.375rem',
                    padding: '0.625rem 0.75rem',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.md,
                  }}
                >
                  {/* Top row: type badge + rarity + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                      color: TYPE_COLOR[item.type],
                    }}>
                      {item.type}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM, flex: 1 }}>R{item.rarity}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {characters.length > 0 && filterScope === 'vendor' && (
                        <button onClick={() => setVendingItem(item)} style={actionBtn('var(--state-success)')}>🛒 Sell</button>
                      )}
                      {characters.length > 0 && filterScope !== 'vendor' && (
                        <button onClick={() => setAwardingItem(item)} style={actionBtn(HUD.gold)}>Award</button>
                      )}
                      <button onClick={() => setViewingItem(item)} style={actionBtn(DIM)}>View</button>
                      <button onClick={() => openEdit(item)} style={actionBtn(item.is_custom ? HUD.gold : DIM)}>
                        {item.is_custom ? '✎' : 'Copy'}
                      </button>
                      {item.is_custom && item.campaign_id === campaignId && (
                        <button onClick={() => handleDelete(item)} style={actionBtn(RED)}>✕</button>
                      )}
                      <QmItemButton item={item} getQmEntry={getQmEntry} openQmPopover={openQmPopover} />
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT, fontWeight: 600, lineHeight: 1.2 }}>
                    {item.name}
                  </div>

                  {/* Stats */}
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM }}>
                    {item.type === 'weapon' && `DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit} · ENC ${item.encumbrance}`}
                    {item.type === 'armor'  && `SOAK+${item.soak} · DEF ${item.defense} · ENC ${item.encumbrance}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`}
                    {item.type === 'gear'   && `ENC ${item.encumbrance}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── List layout (collapsed) ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {items.map(item => (
                <div
                  key={`${item._table}-${item.key}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.4375rem 0.625rem',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  {/* Type badge */}
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: TYPE_COLOR[item.type], width: '3.25rem', flexShrink: 0,
                  }}>
                    {item.type}
                  </span>

                  {/* Name */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT, flex: 1 }}>
                    {item.name}
                  </span>

                  {/* Stats summary */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM }}>
                    {item.type === 'weapon' && `DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit}`}
                    {item.type === 'armor'  && `SOAK+${item.soak} · DEF ${item.defense}`}
                    {item.type === 'gear'   && `ENC ${item.encumbrance}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`}
                  </span>

                  {/* Rarity */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM, minWidth: '1.75rem' }}>
                    R{item.rarity}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {characters.length > 0 && filterScope === 'vendor' && (
                      <button onClick={() => setVendingItem(item)} style={actionBtn('var(--state-success)')}>🛒 Sell</button>
                    )}
                    {characters.length > 0 && filterScope !== 'vendor' && (
                      <button onClick={() => setAwardingItem(item)} style={actionBtn(HUD.gold)}>Award</button>
                    )}
                    <button onClick={() => setViewingItem(item)} style={actionBtn(DIM)}>View</button>
                    <button onClick={() => openEdit(item)} style={actionBtn(item.is_custom ? HUD.gold : DIM)}>
                      {item.is_custom ? '✎ Edit' : 'Copy'}
                    </button>
                    {item.is_custom && item.campaign_id === campaignId && (
                      <button onClick={() => handleDelete(item)} style={actionBtn(RED)}>✕</button>
                    )}
                    <QmItemButton item={item} getQmEntry={getQmEntry} openQmPopover={openQmPopover} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Dropped tab ── */}
      {activeView === 'dropped' && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {droppedLoading ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, textAlign: 'center', padding: '1.5rem' }}>Loading…</div>
          ) : droppedItems.length === 0 ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, textAlign: 'center', padding: '2rem', lineHeight: 1.6 }}>
              No dropped items. Items discarded by players or removed by the GM will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem' }}>
              {droppedItems.map(d => (
                <div
                  key={d.rowId}
                  title={d.droppedNote ?? undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  {/* Type badge */}
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: TYPE_COLOR[d.itemType],
                    border: `1px solid ${TYPE_COLOR[d.itemType]}40`,
                    borderRadius: RADIUS.sm, padding: '0.0625rem 0.3125rem', flexShrink: 0,
                  }}>
                    {d.itemType}
                  </span>

                  {/* Item name */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.gold, fontWeight: 600, flex: 1, minWidth: 0 }}>
                    {d.itemName}
                    {d.droppedNote && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, marginLeft: '0.375rem' }}>†</span>
                    )}
                  </span>

                  {/* Owner / source */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM, flexShrink: 0 }}>
                    {d.droppedBy === 'gm' ? `removed by GM · ${d.characterName}` : `dropped by ${d.characterName}`}
                  </span>

                  {/* Time */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: `${DIM}99`, minWidth: '3.75rem', textAlign: 'right', flexShrink: 0 }}>
                    {relativeTime(d.droppedAt)}
                  </span>

                  {/* Actions */}
                  {destroyConfirm === d.rowId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: RED }}>
                        Permanently destroy?
                      </span>
                      <button onClick={() => setDestroyConfirm(null)} style={actionBtn(DIM)}>Cancel</button>
                      <button onClick={() => handleDestroy(d)} style={actionBtn(RED)}>Destroy</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      {characters.length > 0 && (
                        <button onClick={() => setAwardingDropped(d)} style={actionBtn(HUD.gold)}>Award</button>
                      )}
                      <button
                        onClick={() => setDestroyConfirm(d.rowId)}
                        style={actionBtn(RED)}
                        title={`Permanently destroy ${d.itemName}`}
                      >✕ Destroy</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Item editor modal ── */}
      {editorOpen && campaignId && (
        <ItemEditor
          item={editorItem}
          defaultType={defaultType}
          campaignId={campaignId}
          supabase={supabase}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); loadItems() }}
        />
      )}

      {/* ── Vendor sell modal ── */}
      {vendingItem && characters.length > 0 && campaignId && sendToChar && (
        <VendorSellModal
          item={vendingItem as VendorItem}
          characters={characters}
          campaignId={campaignId}
          onClose={() => setVendingItem(null)}
          onSend={(charId, price, quantity) => {
            sendToChar(charId, {
              type:       'vendor-purchase-offer',
              campaignId,
              price,
              quantity,
              item: {
                key:               vendingItem.key,
                name:              vendingItem.name,
                type:              vendingItem.type,
                rarity:            vendingItem.rarity,
                encumbrance:       vendingItem.encumbrance,
                skill_key:         vendingItem.skill_key,
                damage:            vendingItem.damage,
                damage_add:        vendingItem.damage_add,
                crit:              vendingItem.crit,
                range_value:       vendingItem.range_value,
                qualities:         vendingItem.qualities,
                soak:              vendingItem.soak,
                soak_bonus:        vendingItem.soak_bonus,
                defense:           vendingItem.defense,
                encumbrance_bonus: vendingItem.encumbrance_bonus,
                description:       vendingItem.description,
              },
            })
            setVendingItem(null)
          }}
        />
      )}

      {/* ── Award item directly modal ── */}
      {awardingItem && characters.length > 0 && (
        <LootAwardModal
          item={{
            key: awardingItem.key,
            name: awardingItem.name,
            type: awardingItem.type,
            encumbrance: awardingItem.encumbrance ?? 0,
            qualities: awardingItem.qualities,
          } as AwardableItem}
          characters={characters}
          campaignId={campaignId}
          supabase={supabase}
          onClose={() => setAwardingItem(null)}
          onAwardComplete={() => setAwardingItem(null)}
          sendToChar={sendToChar ?? (() => {})}
        />
      )}

      {/* ── Award from Dropped modal ── */}
      {awardingDropped && characters.length > 0 && (
        <LootAwardModal
          item={{
            key: awardingDropped.itemKey,
            name: awardingDropped.itemName,
            type: awardingDropped.itemType,
            encumbrance: awardingDropped.encumbrance,
          } as AwardableItem}
          characters={characters}
          campaignId={campaignId}
          supabase={supabase}
          preSelectedCharId={awardingDropped.characterId}
          fixedQuantity
          onClose={() => setAwardingDropped(null)}
          onAwardComplete={() => { /* handled by onCustomAward */ }}
          onCustomAward={(charIds, charNames, equipChoices) =>
            handleDroppedAward(charIds, charNames, equipChoices)
          }
          sendToChar={sendToChar ?? (() => {})}
        />
      )}

      {/* ── Item detail popup ────────────────────────────────────────────── */}
      {viewingItem && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: Z.modal,
            background: 'color-mix(in srgb, var(--hud-bg) 75%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setViewingItem(null)}
        >
          <div
            style={{
              background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
              borderRadius: RADIUS.lg, padding: SP[4],
              width: 'min(480px, 90vw)', maxHeight: '80vh', overflowY: 'auto',
              boxShadow: SHADOW.lg, display: 'flex', flexDirection: 'column', gap: SP[3],
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: TYPE_COLOR[viewingItem.type], flexShrink: 0,
              }}>
                {viewingItem.type}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text, flex: 1 }}>
                {viewingItem.name}
              </span>
              <button onClick={() => setViewingItem(null)} style={actionBtn(DIM)}>✕</button>
            </div>

            {/* ── Common stats ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
              paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
            }}>
              {[
                ['Price', `${viewingItem.price ?? '—'} cr`],
                ['Rarity', viewingItem.rarity ?? '—'],
                ['Encumbrance', viewingItem.encumbrance ?? '—'],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* ── Type-specific stats ── */}
            {viewingItem.type === 'weapon' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
                paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
              }}>
                {[
                  ['Skill', WEAPON_SKILL_NAME[viewingItem.skill_key ?? ''] ?? viewingItem.skill_key ?? '—'],
                  ['Damage', viewingItem.damage_add != null ? `Brawn+${viewingItem.damage_add}` : String(viewingItem.damage ?? '—')],
                  ['Crit', viewingItem.crit ?? '—'],
                  ['Range', (viewingItem.range_value ?? '—').replace(/^wr/i, '')],
                  ['Hard Points', viewingItem.hard_points ?? 0],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
            {viewingItem.type === 'armor' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
                paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
              }}>
                {[
                  ['Soak bonus', viewingItem.soak_bonus ?? 0],
                  ['Defense', viewingItem.defense ?? 0],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
            {(viewingItem.type === 'gear' || viewingItem.type === 'armor') && viewingItem.encumbrance_bonus && (
              <div style={{ paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encumbrance threshold bonus</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>+{viewingItem.encumbrance_bonus}</div>
              </div>
            )}

            {/* ── Qualities ── */}
            {viewingItem.qualities && viewingItem.qualities.length > 0 && (
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: SP[1] }}>Qualities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
                  {viewingItem.qualities.map(q => (
                    <QualityBadge key={q.key} quality={q} refQualityMap={refQualityMap} variant="desktop" />
                  ))}
                </div>
              </div>
            )}

            {/* ── Description ── */}
            {viewingItem.description ? (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, lineHeight: 1.6 }}>
                <RichText text={viewingItem.description} />
              </div>
            ) : (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, fontStyle: 'italic' }}>No description.</div>
            )}
          </div>
        </div>
      )}

      {/* ── QM item popover ─────────────────────────────────────────────── */}
      {qmPopoverItem && (
        <div
          ref={qmPopoverRef}
          style={{
            position: 'fixed', bottom: SP[4], right: SP[4], zIndex: Z.popover,
            background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
            borderRadius: RADIUS.lg, padding: SP[3],
            display: 'flex', flexDirection: 'column', gap: SP[2],
            minWidth: 260, boxShadow: SHADOW.lg,
          }}
        >
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {getQmEntry(qmPopoverItem.key, qmPopoverItem.type) ? 'Edit QM Entry' : 'Add to Quartermaster'}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text }}>{qmPopoverItem.name}</div>
          {getQmEntry(qmPopoverItem.key, qmPopoverItem.type) && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic' }}>
              Set stock to 0 to remove from QM
            </div>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stock qty</span>
            <NumberField
              min={0} value={qmStockDraft}
              onChange={e => setQmStockDraft(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, border: `1px solid ${HUD.border}`, background: 'var(--hud-surface-lo)', width: '100%' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Price per unit (cr)</span>
            <NumberField
              min={0} value={qmPriceDraft}
              onChange={e => setQmPriceDraft(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, border: `1px solid ${HUD.border}`, background: 'var(--hud-surface-lo)', width: '100%' }}
            />
          </label>
          <div style={{ display: 'flex', gap: SP[1], justifyContent: 'flex-end' }}>
            <button
              onClick={() => setQmPopoverItem(null)}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
                border: `1px solid ${HUD.border}`, color: HUD.textDim, background: 'transparent',
              }}
            >Cancel</button>
            <button
              className="qm-confirm-btn"
              onClick={async () => {
                await upsertItem(qmPopoverItem.key, qmPopoverItem.type, qmStockDraft, qmPriceDraft)
                setQmPopoverItem(null)
              }}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
                border: `1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)`,
                color: 'var(--hud-accent)',
                background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                transition: EASE.quick,
              }}
            >
              {getQmEntry(qmPopoverItem.key, qmPopoverItem.type) ? 'Save' : 'Add to QM'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── QM per-item button ────────────────────────────────────────────────────────
interface QmItemBtnProps {
  item: DbItem
  getQmEntry: (key: string, type: 'weapon' | 'armor' | 'gear') => QuartermasterItem | undefined
  openQmPopover: (item: DbItem) => void
}

function QmItemButton({ item, getQmEntry, openQmPopover }: QmItemBtnProps) {
  const entry = getQmEntry(item.key, item.type)
  return (
    <button
      onClick={() => openQmPopover(item)}
      className={entry ? 'qm-in-btn' : 'qm-add-btn'}
      style={{
        fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        padding: '0.1875rem 0.5rem', borderRadius: RADIUS.sm, cursor: 'pointer',
        border: entry
          ? `1px solid color-mix(in srgb, var(--state-success) 40%, transparent)`
          : `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`,
        color: entry ? 'var(--state-success)' : 'var(--hud-accent)',
        background: entry
          ? 'color-mix(in srgb, var(--state-success) 08%, transparent)'
          : 'color-mix(in srgb, var(--hud-accent) 06%, transparent)',
        transition: EASE.quick,
      }}
    >
      {entry ? `✓ QM ×${entry.stock}` : '+ QM'}
    </button>
  )
}

function actionBtn(color: string): React.CSSProperties {
  return {
    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '0.1875rem 0.5rem', borderRadius: RADIUS.sm, cursor: 'pointer',
    border: `1px solid ${color}44`, color, background: `${color}10`,
  }
}
