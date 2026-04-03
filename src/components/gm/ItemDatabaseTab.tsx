'use client'

import { useState, useEffect, useCallback } from 'react'
import { ItemEditor, type EditableItem, type ItemType } from './ItemEditor'
import { LootAwardModal, type AwardableItem } from './LootAwardModal'
import type { Character } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const RED       = '#E05050'
const BLUE      = '#5AAAE0'
const PANEL_BG  = 'rgba(8,16,10,0.7)'
const FONT_C    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'

const LS_EXPANDED = 'holocron_gm_toolbar_expanded'

interface ItemDatabaseTabProps {
  campaignId: string | null
  supabase: SupabaseClient
  characters?: Character[]
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
}

type FilterType = 'all' | ItemType
type FilterScope = 'global' | 'custom'
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

export function ItemDatabaseTab({ campaignId, supabase, characters = [], sendToChar }: ItemDatabaseTabProps) {
  // ── Items tab state ──
  const [items,       setItems]       = useState<DbItem[]>([])
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
  const [destroyConfirm,  setDestroyConfirm]  = useState<string | null>(null) // rowId

  const toggleExpanded = () =>
    setExpanded(prev => {
      const next = !prev
      window.localStorage.setItem(LS_EXPANDED, String(next))
      return next
    })

  // ── Items tab load ──
  const loadItems = useCallback(async () => {
    if (!campaignId) return
    setLoading(true)

    const scopeFilter = filterScope === 'custom' ? { is_custom: true } : { is_custom: false }

    const queries = [
      supabase.from('ref_weapons').select('key,name,price,rarity,encumbrance,skill_key,damage,damage_add,crit,range_value,hard_points,description,is_custom,custom_notes,campaign_id')
        .match(scopeFilter)
        .then(r => (r.data || []).map((d: Record<string, unknown>) => ({ ...d, type: 'weapon', _table: 'ref_weapons' as const }))),
      supabase.from('ref_armor').select('key,name,price,rarity,encumbrance,defense,soak,soak_bonus,description,is_custom,custom_notes,campaign_id')
        .match(scopeFilter)
        .then(r => (r.data || []).map((d: Record<string, unknown>) => ({ ...d, type: 'armor', _table: 'ref_armor' as const }))),
      supabase.from('ref_gear').select('key,name,price,rarity,encumbrance,encumbrance_bonus,description,is_custom,custom_notes,campaign_id')
        .match(scopeFilter)
        .then(r => (r.data || []).map((d: Record<string, unknown>) => ({ ...d, type: 'gear', _table: 'ref_gear' as const }))),
    ]

    const results = await Promise.all(queries)
    let all = results.flat() as DbItem[]

    if (filterScope === 'custom') all = all.filter(i => i.campaign_id === campaignId)
    if (filterType !== 'all') all = all.filter(i => i.type === filterType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      all = all.filter(i => i.name.toLowerCase().includes(q))
    }
    all.sort((a, b) => a.name.localeCompare(b.name))
    setItems(all)
    setLoading(false)
  }, [supabase, campaignId, filterType, filterScope, search])

  useEffect(() => { if (activeView === 'items') loadItems() }, [loadItems, activeView])

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: activeView === 'items' && expanded ? 'calc(100% - 32px)' : '100%',
      transition: 'all 200ms ease',
    }}>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>

        {/* View switcher: Items / Dropped */}
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER_HI}`, borderRadius: 3, overflow: 'hidden' }}>
          {(['items', 'dropped'] as ActiveView[]).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', padding: '4px 12px', border: 'none', cursor: 'pointer',
                background: activeView === v ? 'rgba(200,170,80,0.15)' : 'transparent',
                color: activeView === v ? GOLD : DIM,
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
                  fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '5px 12px', borderRadius: 3,
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
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER_HI}`, borderRadius: 3, overflow: 'hidden' }}>
              {(['custom', 'global'] as FilterScope[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterScope(s)}
                  style={{
                    fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', padding: '4px 12px', border: 'none', cursor: 'pointer',
                    background: filterScope === s ? 'rgba(200,170,80,0.15)' : 'transparent',
                    color: filterScope === s ? GOLD : DIM,
                  }}
                >
                  {s === 'custom' ? 'Campaign' : 'System'}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
              {(['all', 'weapon', 'armor', 'gear'] as FilterType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', padding: '4px 10px', border: 'none', cursor: 'pointer',
                    background: filterType === t ? 'rgba(200,170,80,0.12)' : 'transparent',
                    color: filterType === t ? GOLD : DIM,
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
                color: TEXT, fontFamily: FONT_C, fontSize: FS_LABEL,
                padding: '4px 10px', borderRadius: 3, outline: 'none', width: 140,
              }}
            />

            {/* Expand / collapse toggle */}
            <button
              onClick={toggleExpanded}
              style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                textTransform: 'uppercase',
                border: '1px solid rgba(200,170,80,0.25)',
                color: expanded ? GOLD : 'rgba(200,170,80,0.5)',
                borderRadius: 5,
                padding: '4px 10px',
                background: expanded ? 'rgba(200,170,80,0.08)' : 'transparent',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: 'color 150ms, background 150ms',
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; (e.currentTarget as HTMLElement).style.borderColor = GOLD_BD }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = expanded ? GOLD : 'rgba(200,170,80,0.5)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,170,80,0.25)'
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
                fontFamily: FONT_M, fontSize: FS_CAP, textTransform: 'uppercase',
                border: `1px solid ${BORDER}`, color: DIM, borderRadius: 3,
                padding: '4px 10px', background: 'transparent', cursor: 'pointer',
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
          transition: 'max-height 200ms ease',
        }}>
          {loading ? (
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 24 }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 24 }}>
              {filterScope === 'custom'
                ? 'No custom items for this campaign yet. Use the + buttons above to create one.'
                : 'No system items match your filters.'}
            </div>
          ) : expanded ? (
            /* ── Grid layout (expanded) ── */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 6,
            }}>
              {items.map(item => (
                <div
                  key={`${item._table}-${item.key}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '10px 12px',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                  }}
                >
                  {/* Top row: type badge + rarity + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: FONT_C, fontSize: FS_OVER, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                      color: TYPE_COLOR[item.type],
                    }}>
                      {item.type}
                    </span>
                    <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, flex: 1 }}>R{item.rarity}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(item)} style={actionBtn(item.is_custom ? GOLD : DIM)}>
                        {item.is_custom ? '✎' : '⊕'}
                      </button>
                      {item.is_custom && item.campaign_id === campaignId && (
                        <button onClick={() => handleDelete(item)} style={actionBtn(RED)}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, fontWeight: 600, lineHeight: 1.2 }}>
                    {item.name}
                  </div>

                  {/* Stats */}
                  <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM }}>
                    {item.type === 'weapon' && `DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit} · ENC ${item.encumbrance}`}
                    {item.type === 'armor'  && `SOAK+${item.soak} · DEF ${item.defense} · ENC ${item.encumbrance}`}
                    {item.type === 'gear'   && `ENC ${item.encumbrance}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── List layout (collapsed) ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(item => (
                <div
                  key={`${item._table}-${item.key}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 3,
                  }}
                >
                  {/* Type badge */}
                  <span style={{
                    fontFamily: FONT_C, fontSize: FS_OVER, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: TYPE_COLOR[item.type], width: 52, flexShrink: 0,
                  }}>
                    {item.type}
                  </span>

                  {/* Name */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>
                    {item.name}
                  </span>

                  {/* Stats summary */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM }}>
                    {item.type === 'weapon' && `DMG ${item.damage_add != null ? `Brawn+${item.damage_add}` : item.damage} · CRIT ${item.crit}`}
                    {item.type === 'armor'  && `SOAK+${item.soak} · DEF ${item.defense}`}
                    {item.type === 'gear'   && `ENC ${item.encumbrance}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`}
                  </span>

                  {/* Rarity */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, minWidth: 28 }}>
                    R{item.rarity}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(item)} style={actionBtn(item.is_custom ? GOLD : DIM)}>
                      {item.is_custom ? '✎ Edit' : '⊕ Copy'}
                    </button>
                    {item.is_custom && item.campaign_id === campaignId && (
                      <button onClick={() => handleDelete(item)} style={actionBtn(RED)}>✕</button>
                    )}
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
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 24 }}>Loading…</div>
          ) : droppedItems.length === 0 ? (
            <div style={{ fontFamily: FONT_C, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 32, lineHeight: 1.6 }}>
              No dropped items. Items discarded by players or removed by the GM will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {droppedItems.map(d => (
                <div
                  key={d.rowId}
                  title={d.droppedNote ?? undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 3,
                  }}
                >
                  {/* Type badge */}
                  <span style={{
                    fontFamily: FONT_M, fontSize: FS_OVER, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: TYPE_COLOR[d.itemType],
                    border: `1px solid ${TYPE_COLOR[d.itemType]}40`,
                    borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                  }}>
                    {d.itemType}
                  </span>

                  {/* Item name */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: GOLD, fontWeight: 600, flex: 1, minWidth: 0 }}>
                    {d.itemName}
                    {d.droppedNote && (
                      <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, marginLeft: 6 }}>†</span>
                    )}
                  </span>

                  {/* Owner / source */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, flexShrink: 0 }}>
                    {d.droppedBy === 'gm' ? `removed by GM · ${d.characterName}` : `dropped by ${d.characterName}`}
                  </span>

                  {/* Time */}
                  <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: `${DIM}99`, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>
                    {relativeTime(d.droppedAt)}
                  </span>

                  {/* Actions */}
                  {destroyConfirm === d.rowId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: RED }}>
                        Permanently destroy?
                      </span>
                      <button onClick={() => setDestroyConfirm(null)} style={actionBtn(DIM)}>Cancel</button>
                      <button onClick={() => handleDestroy(d)} style={actionBtn(RED)}>Destroy</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {characters.length > 0 && (
                        <button onClick={() => setAwardingDropped(d)} style={actionBtn(GOLD)}>Award</button>
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
    </div>
  )
}

function actionBtn(color: string): React.CSSProperties {
  return {
    fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '3px 8px', borderRadius: 3, cursor: 'pointer',
    border: `1px solid ${color}44`, color, background: `${color}10`,
  }
}
