'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { AwardableItem } from '@/components/gm/LootAwardModal'

export type LootItem = {
  key: string; name: string; type: 'weapon' | 'armor' | 'gear'
  price: number; rarity: number; encumbrance: number
  description?: string; categories?: string[]
  damage?: number; damage_add?: number; crit?: number
  range_value?: string; qualities?: { key: string; count?: number | null }[]
  skill_key?: string
  defense?: number; soak?: number
}

export interface UseGmLootReturn {
  lootType:        'all' | 'weapon' | 'armor' | 'gear'
  setLootType:     React.Dispatch<React.SetStateAction<'all' | 'weapon' | 'armor' | 'gear'>>
  lootRarityMin:   number
  setLootRarityMin: React.Dispatch<React.SetStateAction<number>>
  lootRarityMax:   number
  setLootRarityMax: React.Dispatch<React.SetStateAction<number>>
  lootSource:      'Vendor' | 'Searching' | 'Looted'
  setLootSource:   React.Dispatch<React.SetStateAction<'Vendor' | 'Searching' | 'Looted'>>
  lootSearchText:  string
  setLootSearchText: React.Dispatch<React.SetStateAction<string>>
  lootItems:       LootItem[]
  setLootItems:    React.Dispatch<React.SetStateAction<LootItem[]>>
  lootSelected:    LootItem | null
  setLootSelected: React.Dispatch<React.SetStateAction<LootItem | null>>
  revealItem:      LootItem | null
  setRevealItem:   React.Dispatch<React.SetStateAction<LootItem | null>>
  assignTarget:    string
  setAssignTarget: React.Dispatch<React.SetStateAction<string>>
  lootBusy:        boolean
  lootAwardItem:   AwardableItem | null
  setLootAwardItem: React.Dispatch<React.SetStateAction<AwardableItem | null>>
  handleLootBrowse:       () => Promise<void>
  handleLootRoll:         () => Promise<void>
  handleRevealToPlayers:  (item: LootItem) => void
  handleDismissReveal:    () => void
  handleAssignLoot:       () => Promise<void>
}

export function useGmLoot(params: {
  characters:    Character[]
  notify:        (charId: string, type: 'toast' | 'dialog', message: string) => void
  broadcastAll:  (payload: Record<string, unknown>, characters: Character[]) => void
  flash:         (msg: string) => void
}): UseGmLootReturn {
  const { characters, notify, broadcastAll, flash } = params
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  const [lootType,       setLootType]       = useState<'all' | 'weapon' | 'armor' | 'gear'>('all')
  const [lootRarityMin,  setLootRarityMin]  = useState(0)
  const [lootRarityMax,  setLootRarityMax]  = useState(10)
  const [lootSource,     setLootSource]     = useState<'Vendor' | 'Searching' | 'Looted'>('Looted')
  const [lootSearchText, setLootSearchText] = useState('')
  const [lootItems,      setLootItems]      = useState<LootItem[]>([])
  const [lootSelected,   setLootSelected]   = useState<LootItem | null>(null)
  const [revealItem,     setRevealItem]     = useState<LootItem | null>(null)
  const [assignTarget,   setAssignTarget]   = useState<string>('')
  const [lootBusy,       setLootBusy]       = useState(false)
  const [lootAwardItem,  setLootAwardItem]  = useState<AwardableItem | null>(null)

  const buildLootQuery = useCallback(async (limit: number) => {
    const queries: Promise<{ data: LootItem[] }>[] = []
    const nameFilter = lootSearchText.trim() ? `%${lootSearchText.trim()}%` : null

    const buildQ = async (table: string, type: 'weapon' | 'armor' | 'gear'): Promise<{ data: LootItem[] }> => {
      const baseCols = 'key, name, price, rarity, encumbrance, description'
      const cols = type === 'weapon'
        ? `${baseCols}, categories, damage, damage_add, crit, range_value, qualities, skill_key`
        : type === 'armor' ? `${baseCols}, defense, soak` : baseCols
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase.from(table) as any).select(cols)
        .gte('rarity', lootRarityMin).lte('rarity', lootRarityMax).limit(limit)
      if (nameFilter) q = q.ilike('name', nameFilter)
      const r = await q
      return { data: ((r.data || []) as Record<string, unknown>[]).map(d => ({ ...d, type })) as LootItem[] }
    }

    if (lootType === 'all' || lootType === 'weapon') queries.push(buildQ('ref_weapons', 'weapon'))
    if (lootType === 'all' || lootType === 'armor')  queries.push(buildQ('ref_armor',   'armor'))
    if (lootType === 'all' || lootType === 'gear')   queries.push(buildQ('ref_gear',    'gear'))

    const results = await Promise.all(queries)
    return results.flatMap(r => r.data)
  }, [supabase, lootType, lootRarityMin, lootRarityMax, lootSearchText])

  const handleLootBrowse = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(30)
    items.sort((a, b) => a.name.localeCompare(b.name))
    setLootItems(items)
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  const handleLootRoll = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(100)
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }
    const count = Math.min(items.length, 3 + Math.floor(Math.random() * 3))
    setLootItems(items.slice(0, count))
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  const handleRevealToPlayers = useCallback((item: LootItem) => {
    setRevealItem(item)
    broadcastAll({
      type: 'loot-reveal',
      item: {
        name: item.name, key: item.key, itemType: item.type, rarity: item.rarity,
        source: lootSource, description: item.description, categories: item.categories,
        damage: item.damage, damage_add: item.damage_add, crit: item.crit,
        range_value: item.range_value, qualities: item.qualities, skill_key: item.skill_key,
        defense: item.defense, soak: item.soak,
      },
    }, characters)
  }, [characters, lootSource, broadcastAll])

  const handleDismissReveal = useCallback(() => {
    setRevealItem(null)
    broadcastAll({ type: 'loot-dismiss' }, characters)
  }, [characters, broadcastAll])

  const handleAssignLoot = useCallback(async () => {
    if (!revealItem || !assignTarget) return
    setLootBusy(true)
    const notes = `Source: ${lootSource}`
    if (revealItem.type === 'weapon') {
      await supabase.from('character_weapons').insert({ character_id: assignTarget, weapon_key: revealItem.key, is_equipped: false, attachments: [], notes })
    } else if (revealItem.type === 'armor') {
      await supabase.from('character_armor').insert({ character_id: assignTarget, armor_key: revealItem.key, is_equipped: false, attachments: [], notes })
    } else {
      await supabase.from('character_gear').insert({ character_id: assignTarget, gear_key: revealItem.key, quantity: 1, is_equipped: false, notes })
    }
    const charName = characters.find(c => c.id === assignTarget)?.name || 'someone'
    notify(assignTarget, 'dialog', `You received ${revealItem.name} (${revealItem.type})!`)
    flash(`${revealItem.name} assigned to ${charName}`)
    handleDismissReveal()
    setRevealItem(null)
    setAssignTarget('')
    setLootBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealItem, assignTarget, lootSource, characters, notify, flash, handleDismissReveal])

  return {
    lootType, setLootType, lootRarityMin, setLootRarityMin,
    lootRarityMax, setLootRarityMax, lootSource, setLootSource,
    lootSearchText, setLootSearchText, lootItems, setLootItems,
    lootSelected, setLootSelected, revealItem, setRevealItem,
    assignTarget, setAssignTarget, lootBusy, lootAwardItem, setLootAwardItem,
    handleLootBrowse, handleLootRoll,
    handleRevealToPlayers, handleDismissReveal, handleAssignLoot,
  }
}
