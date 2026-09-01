'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createIconResolverContext, resolveItemIcon, type ItemTable, type IconResolution } from '@/lib/itemIconResolver'
import type { ItemIconOverride } from '@/lib/types'

/**
 * Shared icon-resolver wiring for the GM-facing surfaces (Quartermaster,
 * ItemDatabaseTab, ItemEditor, LootAwardModal) added in Prompt 3 -- these are
 * independent components/hooks that each need a full ref-table catalog
 * (key -> categories) for donor matching plus this campaign's
 * item_icon_overrides, and each needs to refetch overrides after a GM writes
 * one via the icon picker (Phase B). Extracted here instead of duplicating
 * the fetch+useMemo pattern useCharacterData.ts already has for the player
 * side, and instead of a new state library -- `refetch()` is a plain re-fetch
 * consumers call after a write, same shape as useQuartermaster's own
 * `loadItems` re-fetch-after-mutate convention.
 *
 * Only `key,categories` are fetched from each ref table -- cheap columns,
 * safe to pull the full catalog (not scoped to what a surface's own rows
 * happen to include) since donor matching needs the WHOLE table, not just
 * the subset a given surface is displaying.
 */
export interface IconCatalogEntry { key: string; name: string; categories?: string[] }

export interface UseItemIconContextReturn {
  resolveIcon: (table: ItemTable, key: string | null | undefined, categories?: string[] | null) => IconResolution | null
  overrides: Map<string, string>
  /** Full (key, name, categories) list for a table -- used by IconPicker to browse/search/filter. */
  catalogEntries: (table: ItemTable) => IconCatalogEntry[]
  refetch: () => Promise<void>
  loading: boolean
}

export function useItemIconContext(
  supabase: SupabaseClient,
  campaignId: string | null,
): UseItemIconContextReturn {
  const [catalogs, setCatalogs] = useState<Record<ItemTable, Record<string, string[] | null | undefined>>>({ weapon: {}, armor: {}, gear: {} })
  const [names, setNames] = useState<Record<ItemTable, Record<string, string>>>({ weapon: {}, armor: {}, gear: {} })
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [wRes, aRes, gRes, oRes] = await Promise.all([
      supabase.from('ref_weapons').select('key,name,categories'),
      supabase.from('ref_armor').select('key,name,categories'),
      supabase.from('ref_gear').select('key,name,categories'),
      campaignId
        ? supabase.from('item_icon_overrides').select('*').eq('campaign_id', campaignId)
        : Promise.resolve({ data: [] }),
    ])
    type Row = { key: string; name: string; categories: string[] | null }
    const wRows = (wRes.data ?? []) as Row[]
    const aRows = (aRes.data ?? []) as Row[]
    const gRows = (gRes.data ?? []) as Row[]
    setCatalogs({
      weapon: Object.fromEntries(wRows.map(r => [r.key, r.categories])),
      armor:  Object.fromEntries(aRows.map(r => [r.key, r.categories])),
      gear:   Object.fromEntries(gRows.map(r => [r.key, r.categories])),
    })
    setNames({
      weapon: Object.fromEntries(wRows.map(r => [r.key, r.name])),
      armor:  Object.fromEntries(aRows.map(r => [r.key, r.name])),
      gear:   Object.fromEntries(gRows.map(r => [r.key, r.name])),
    })
    const overrideMap = new Map<string, string>()
    for (const o of (oRes.data ?? []) as ItemIconOverride[]) {
      overrideMap.set(`${o.item_table}:${o.item_key}`, o.image_key)
    }
    setOverrides(overrideMap)
    setLoading(false)
  }, [supabase, campaignId])

  useEffect(() => { load() }, [load])

  const ctx = useMemo(() => createIconResolverContext(overrides, catalogs), [overrides, catalogs])

  const resolveIcon = useCallback((table: ItemTable, key: string | null | undefined, categories?: string[] | null): IconResolution | null => {
    if (!key) return null
    return resolveItemIcon(ctx, table, key, categories)
  }, [ctx])

  const catalogEntries = useCallback((table: ItemTable): IconCatalogEntry[] => {
    const cats = catalogs[table]
    const nm = names[table]
    return Object.keys(cats).map(key => ({ key, name: nm[key] ?? key, categories: cats[key] ?? undefined }))
  }, [catalogs, names])

  return { resolveIcon, overrides, catalogEntries, refetch: load, loading }
}
