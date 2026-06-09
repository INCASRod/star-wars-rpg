'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Quartermaster, QuartermasterItem, QmBuyRow } from '@/lib/types'

export interface UseQuartermasterReturn {
  qm: Quartermaster | null
  qmItems: QuartermasterItem[]
  buyRows: QmBuyRow[]
  loading: boolean
  toggleOpen: () => Promise<void>
  upsertItem: (itemKey: string, itemType: 'weapon' | 'armor' | 'gear', stock: number, priceOverride: number) => Promise<void>
  removeItem: (itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => Promise<void>
  getQmEntry: (itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => QuartermasterItem | undefined
  buyItem: (characterId: string, itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => Promise<void>
  sellItem: (characterId: string, rowId: string, rowTable: 'character_weapons' | 'character_armor' | 'character_gear', itemKey: string, marketValue: number) => Promise<void>
}

export function useQuartermaster(
  supabase: SupabaseClient,
  campaignId: string | null,
): UseQuartermasterReturn {
  const [qm,       setQm]       = useState<Quartermaster | null>(null)
  const [qmItems,  setQmItems]  = useState<QuartermasterItem[]>([])
  const [buyRows,  setBuyRows]  = useState<QmBuyRow[]>([])
  const [loading,  setLoading]  = useState(false)
  const qmRef = useRef<Quartermaster | null>(null)

  // keep ref in sync for use in callbacks that close over stale state
  useEffect(() => { qmRef.current = qm }, [qm])

  // ── Fetch QM items + join ref data ──────────────────────────────────────────
  const loadItems = useCallback(async (qmId: string) => {
    const { data: rows } = await supabase
      .from('quartermaster_items')
      .select('*')
      .eq('quartermaster_id', qmId)
      .order('item_type')
    const items = (rows ?? []) as QuartermasterItem[]
    setQmItems(items)

    const weaponKeys = items.filter(i => i.item_type === 'weapon').map(i => i.item_key)
    const armorKeys  = items.filter(i => i.item_type === 'armor').map(i => i.item_key)
    const gearKeys   = items.filter(i => i.item_type === 'gear').map(i => i.item_key)

    const [wRes, aRes, gRes] = await Promise.all([
      weaponKeys.length ? supabase.from('ref_weapons').select('key,name,rarity,encumbrance,price,damage,damage_add,crit').in('key', weaponKeys) : Promise.resolve({ data: [] }),
      armorKeys.length  ? supabase.from('ref_armor').select('key,name,rarity,encumbrance,price,soak,soak_bonus,defense').in('key', armorKeys)   : Promise.resolve({ data: [] }),
      gearKeys.length   ? supabase.from('ref_gear').select('key,name,rarity,encumbrance,price,encumbrance_bonus').in('key', gearKeys)            : Promise.resolve({ data: [] }),
    ])

    type WRow = { key: string; name: string; rarity: number; encumbrance: number; price: number; damage: number; damage_add: number | null; crit: number }
    type ARow = { key: string; name: string; rarity: number; encumbrance: number; price: number; soak: number; soak_bonus: number | null; defense: number }
    type GRow = { key: string; name: string; rarity: number; encumbrance: number; price: number; encumbrance_bonus: number | null }

    const wMap = Object.fromEntries(((wRes.data ?? []) as WRow[]).map(r => [r.key, r]))
    const aMap = Object.fromEntries(((aRes.data ?? []) as ARow[]).map(r => [r.key, r]))
    const gMap = Object.fromEntries(((gRes.data ?? []) as GRow[]).map(r => [r.key, r]))

    const buys: QmBuyRow[] = items.flatMap((qi): QmBuyRow[] => {
      if (qi.item_type === 'weapon') {
        const r = wMap[qi.item_key]
        return r ? [{ qmItem: qi, name: r.name, rarity: r.rarity, encumbrance: r.encumbrance, price: r.price, damage: r.damage, damage_add: r.damage_add, crit: r.crit }] : []
      }
      if (qi.item_type === 'armor') {
        const r = aMap[qi.item_key]
        return r ? [{ qmItem: qi, name: r.name, rarity: r.rarity, encumbrance: r.encumbrance, price: r.price, soak: r.soak, soak_bonus: r.soak_bonus, defense: r.defense }] : []
      }
      const r = gMap[qi.item_key]
      return r ? [{ qmItem: qi, name: r.name, rarity: r.rarity, encumbrance: r.encumbrance, price: r.price, encumbrance_bonus: r.encumbrance_bonus }] : []
    })

    setBuyRows(buys)
  }, [supabase])

  // ── Fetch QM row + items ────────────────────────────────────────────────────
  const loadQm = useCallback(async () => {
    if (!campaignId) { setQm(null); setQmItems([]); setBuyRows([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('quartermaster')
      .select('*')
      .eq('campaign_id', campaignId)
      .maybeSingle()
    const row = (data as Quartermaster | null) ?? null
    setQm(row)
    if (row) await loadItems(row.id)
    else { setQmItems([]); setBuyRows([]) }
    setLoading(false)
  }, [supabase, campaignId, loadItems])

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!campaignId) return
    loadQm()
    const ch = supabase
      .channel(`qm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quartermaster', filter: `campaign_id=eq.${campaignId}` },
        () => loadQm())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quartermaster_items' },
        () => { if (qmRef.current?.id) loadItems(qmRef.current.id) })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ensure QM row exists ────────────────────────────────────────────────────
  const ensureQm = useCallback(async (): Promise<Quartermaster> => {
    if (qmRef.current) return qmRef.current
    if (!campaignId) throw new Error('No campaign')
    const { data, error } = await supabase
      .from('quartermaster')
      .insert({ campaign_id: campaignId })
      .select()
      .single()
    if (error) throw error
    const created = data as Quartermaster
    setQm(created)
    return created
  }, [supabase, campaignId])

  // ── Toggle open/closed ──────────────────────────────────────────────────────
  const toggleOpen = useCallback(async () => {
    const row = await ensureQm()
    const nextOpen = !row.is_open
    await supabase
      .from('quartermaster')
      .update({ is_open: nextOpen, updated_at: new Date().toISOString() })
      .eq('id', row.id)
    setQm(prev => prev ? { ...prev, is_open: nextOpen } : prev)
  }, [ensureQm, supabase])

  // ── Upsert QM item ──────────────────────────────────────────────────────────
  const upsertItem = useCallback(async (
    itemKey: string,
    itemType: 'weapon' | 'armor' | 'gear',
    stock: number,
    priceOverride: number,
  ) => {
    const row = await ensureQm()
    const existing = qmItems.find(i => i.item_key === itemKey && i.item_type === itemType)
    if (existing) {
      if (stock === 0) {
        await supabase.from('quartermaster_items').delete().eq('id', existing.id)
      } else {
        await supabase.from('quartermaster_items')
          .update({ stock, price_override: priceOverride, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      }
    } else if (stock > 0) {
      await supabase.from('quartermaster_items').insert({
        quartermaster_id: row.id,
        item_key: itemKey,
        item_type: itemType,
        stock,
        price_override: priceOverride,
      })
    }
    await loadItems(row.id)
  }, [ensureQm, supabase, qmItems, loadItems])

  // ── Remove QM item ──────────────────────────────────────────────────────────
  const removeItem = useCallback(async (itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => {
    const existing = qmItems.find(i => i.item_key === itemKey && i.item_type === itemType)
    if (!existing) return
    await supabase.from('quartermaster_items').delete().eq('id', existing.id)
    const id = qmRef.current?.id
    if (id) await loadItems(id)
  }, [supabase, qmItems, loadItems])

  // ── Lookup helper ────────────────────────────────────────────────────────────
  const getQmEntry = useCallback((itemKey: string, itemType: 'weapon' | 'armor' | 'gear') =>
    qmItems.find(i => i.item_key === itemKey && i.item_type === itemType),
  [qmItems])

  // ── Buy item ────────────────────────────────────────────────────────────────
  const buyItem = useCallback(async (characterId: string, itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => {
    const entry = qmItems.find(i => i.item_key === itemKey && i.item_type === itemType)
    if (!entry || entry.stock <= 0) throw new Error('Out of stock')

    if (itemType === 'weapon') {
      await supabase.from('character_weapons').insert({
        character_id: characterId, weapon_key: itemKey,
        is_equipped: false, equip_state: 'carrying', attachments: [], notes: 'Purchased from Quartermaster',
      })
    } else if (itemType === 'armor') {
      await supabase.from('character_armor').insert({
        character_id: characterId, armor_key: itemKey,
        is_equipped: false, equip_state: 'carrying', attachments: [], notes: 'Purchased from Quartermaster',
      })
    } else {
      await supabase.from('character_gear').insert({
        character_id: characterId, gear_key: itemKey,
        quantity: 1, is_equipped: false, equip_state: 'carrying', notes: 'Purchased from Quartermaster',
      })
    }

    await supabase.from('quartermaster_items')
      .update({ stock: entry.stock - 1, updated_at: new Date().toISOString() })
      .eq('id', entry.id)

    const { data: charRow } = await supabase.from('characters').select('credits').eq('id', characterId).single()
    const currentCredits = (charRow as { credits: number } | null)?.credits ?? 0
    await supabase.from('characters')
      .update({ credits: Math.max(0, currentCredits - entry.price_override) })
      .eq('id', characterId)

    const id = qmRef.current?.id
    if (id) await loadItems(id)
  }, [supabase, qmItems, loadItems])

  // ── Sell item ────────────────────────────────────────────────────────────────
  const sellItem = useCallback(async (
    characterId: string,
    rowId: string,
    rowTable: 'character_weapons' | 'character_armor' | 'character_gear',
    _itemKey: string,
    marketValue: number,
  ) => {
    const sellPct = qmRef.current?.sell_pct ?? 25
    const offer = Math.floor(marketValue * sellPct / 100)

    await supabase.from(rowTable).update({
      is_dropped: true,
      dropped_at: new Date().toISOString(),
      dropped_by: 'player',
      dropped_note: 'Sold to Quartermaster',
    }).eq('id', rowId)

    const { data: charRow } = await supabase.from('characters').select('credits').eq('id', characterId).single()
    const currentCredits = (charRow as { credits: number } | null)?.credits ?? 0
    await supabase.from('characters')
      .update({ credits: currentCredits + offer })
      .eq('id', characterId)
  }, [supabase])

  return { qm, qmItems, buyRows, loading, toggleOpen, upsertItem, removeItem, getQmEntry, buyItem, sellItem }
}
