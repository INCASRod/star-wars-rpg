'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GroupStorageItem {
  id: string
  itemType: 'weapon' | 'armor' | 'gear'
  ownerCharacterId: string
  ownerName: string
  itemKey: string
  name: string
  encumbrance: number
  rarity: number
  qty?: number
  description?: string | null
  // weapon stats
  damage?: number
  damageAdd?: number | null
  crit?: number
  range?: string | null
  skillKey?: string | null
  hardPoints?: number
  // armor stats
  soakBonus?: number
  defense?: number
  // gear stats
  encumbranceBonus?: number | null
}

export function useGroupStorage(assetId: string | null) {
  const [items,   setItems]   = useState<GroupStorageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [taking,  setTaking]  = useState<Set<string>>(new Set())

  const loadedRef = useRef(false)

  const fetchItems = useCallback(async () => {
    if (!assetId) { setItems([]); return }
    // Spinner on the first load only: the 10s poll and realtime refetches must not flash it.
    if (!loadedRef.current) setLoading(true)
    const supabase = createClient()

    try {
      // Other players' inventory rows are private (migration 158), so the stowed list comes from a DEFINER function
      // that returns only what this sheet shows.
      const { data: stored, error: storedErr } = await supabase.rpc('group_storage_rows', { p_asset_id: assetId })
      if (storedErr) console.error('[GroupStorage] group_storage_rows failed:', storedErr.message)
      const wpnRes  = { data: (stored?.weapons ?? []) as any[] }
      const armRes  = { data: (stored?.armor ?? []) as any[] }
      const gearRes = { data: (stored?.gear ?? []) as any[] }

      const weaponRows = wpnRes.data  ?? []
      const armorRows  = armRes.data  ?? []
      const gearRows   = gearRes.data ?? []

      // Collect unique character IDs → fetch names
      const charIds = [...new Set([
        ...weaponRows.map((r: any) => r.character_id),
        ...armorRows.map((r: any)  => r.character_id),
        ...gearRows.map((r: any)   => r.character_id),
      ])]
      const charMap: Record<string, string> = {}
      if (charIds.length > 0) {
        const { data: chars } = await supabase
          .from('characters')
          .select('id, name')
          .in('id', charIds)
        chars?.forEach((c: any) => { charMap[c.id] = c.name })
      }

      // Fetch ref data in parallel
      const wpnKeys  = weaponRows.map((r: any) => r.weapon_key)
      const armKeys  = armorRows.map((r: any)  => r.armor_key)
      const gearKeys = gearRows.map((r: any)   => r.gear_key)

      const [refWpn, refArm, refGear] = await Promise.all([
        wpnKeys.length > 0
          ? supabase.from('ref_weapons').select('key, name, damage, damage_add, crit, range_value, encumbrance, skill_key, hard_points, description, rarity').in('key', wpnKeys)
          : Promise.resolve({ data: [] as any[], error: null }),
        armKeys.length > 0
          ? supabase.from('ref_armor').select('key, name, soak, defense, encumbrance, description, rarity').in('key', armKeys)
          : Promise.resolve({ data: [] as any[], error: null }),
        gearKeys.length > 0
          ? supabase.from('ref_gear').select('key, name, encumbrance, encumbrance_bonus, description, rarity').in('key', gearKeys)
          : Promise.resolve({ data: [] as any[], error: null }),
      ])

      if (refWpn.error)  console.error('[GroupStorage] ref_weapons lookup failed:', refWpn.error.message)
      if (refArm.error)  console.error('[GroupStorage] ref_armor lookup failed:', refArm.error.message)
      if (refGear.error) console.error('[GroupStorage] ref_gear lookup failed:', refGear.error.message)

      const wpnMap:  Record<string, any> = Object.fromEntries((refWpn.data  ?? []).map((r: any) => [r.key, r]))
      const armMap:  Record<string, any> = Object.fromEntries((refArm.data  ?? []).map((r: any) => [r.key, r]))
      const gearMap: Record<string, any> = Object.fromEntries((refGear.data ?? []).map((r: any) => [r.key, r]))

      const assembled: GroupStorageItem[] = [
        ...weaponRows.map((r: any) => {
          const ref = wpnMap[r.weapon_key] ?? {}
          return {
            id: r.id, itemType: 'weapon' as const,
            ownerCharacterId: r.character_id, ownerName: charMap[r.character_id] ?? 'Unknown',
            itemKey: r.weapon_key, name: r.custom_name || ref.name || r.weapon_key,
            encumbrance: ref.encumbrance ?? 0, rarity: ref.rarity ?? 0,
            damage: ref.damage, damageAdd: ref.damage_add, crit: ref.crit,
            range: ref.range_value, skillKey: ref.skill_key, hardPoints: ref.hard_points,
            description: ref.description ?? null,
          }
        }),
        ...armorRows.map((r: any) => {
          const ref = armMap[r.armor_key] ?? {}
          return {
            id: r.id, itemType: 'armor' as const,
            ownerCharacterId: r.character_id, ownerName: charMap[r.character_id] ?? 'Unknown',
            itemKey: r.armor_key, name: r.custom_name || ref.name || r.armor_key,
            encumbrance: ref.encumbrance ?? 0, rarity: ref.rarity ?? 0,
            soakBonus: ref.soak ?? 0, defense: ref.defense ?? 0,
            description: ref.description ?? null,
          }
        }),
        ...gearRows.map((r: any) => {
          const ref = gearMap[r.gear_key] ?? {}
          return {
            id: r.id, itemType: 'gear' as const,
            ownerCharacterId: r.character_id, ownerName: charMap[r.character_id] ?? 'Unknown',
            itemKey: r.gear_key, name: r.custom_name || ref.name || r.gear_key,
            encumbrance: ref.encumbrance ?? 0, rarity: ref.rarity ?? 0,
            qty: r.quantity,
            encumbranceBonus: ref.encumbrance_bonus ?? null,
            description: ref.description ?? null,
          }
        }),
      ]

      setItems(assembled)
      loadedRef.current = true
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    loadedRef.current = false
    fetchItems()
    if (!assetId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`group-storage-${assetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_weapons' }, fetchItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_armor'   }, fetchItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_gear'    }, fetchItems)
      .subscribe()

    // Realtime only reaches owners and the GM now; a short poll keeps every member's list current.
    const poll = setInterval(fetchItems, 10_000)

    return () => { clearInterval(poll); supabase.removeChannel(channel) }
  }, [assetId, fetchItems])

  const takeItem = useCallback(async (
    itemId:   string,
    itemType: 'weapon' | 'armor' | 'gear',
    takerId:  string,
    qty?:     number,
  ) => {
    setTaking(prev => new Set(prev).add(itemId))
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('take_group_storage_item', {
        p_item_id:   itemId,
        p_item_type: itemType,
        p_taker_id:  takerId,
        p_take_qty:  qty ?? null,
      })
      if (error) {
        console.error('[GroupStorage] take failed:', error.message)
        throw new Error(error.message)
      }
      await fetchItems()
    } finally {
      setTaking(prev => { const s = new Set(prev); s.delete(itemId); return s })
    }
  }, [fetchItems])

  return { items, loading, taking, takeItem }
}
