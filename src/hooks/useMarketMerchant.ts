// src/hooks/useMarketMerchant.ts
//
// Load/save/subscribe the campaign's single active Market merchant
// (127_market_merchants.sql + 129's `seed` column). Follows the project's
// standing realtime convention: catch-up SELECT, then
// .channel().on('postgres_changes', ...).subscribe(), with removeChannel
// cleanup (see usePendingActions.ts / useCriticalInjuryRequest.ts).
//
// Writes are read-fresh-then-write, serialized through a per-hook promise
// chain (`queueWrite`) — React state is not a synchronous mutex, so N rapid
// clicks (Reveal, Tier cycle, price edit) each wait for the previous queued
// write to land, then re-read the row fresh before mutating just their own
// line, so none of them can clobber a sibling change made a few ms earlier.
//
// `is_active` is only ever set true by the set_active_merchant RPC — this
// hook never writes it directly. In this design a campaign has at most one
// merchant row ever: the first "Roll Stock" INSERTs + activates via the RPC;
// every subsequent "Roll Stock" regenerates the SAME row's fields in place.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MarketItemTable, MarketTier } from '@/lib/marketSnapshot'
import { parseMarketSnapshot, serializeMerchantSnapshot, type MarketMerchantSnapshot } from '@/lib/marketSnapshot'
import type { GeneratedStockLine, MarketArchetype, MarketLegality, MarketScale } from '@/lib/marketGenerator'

export interface DbStockLine {
  item_table:      MarketItemTable
  ref_key:         string
  name:            string
  base_rarity:     number
  modified_rarity: number
  price:           number
  restricted:      boolean
  tier:            MarketTier
  revealed:        boolean
}

export interface MarketMerchant {
  id:                  string
  campaign_id:         string
  name:                string
  location_modifier:   number
  archetype:           string
  scale:               string
  legality:            string
  is_active:           boolean
  is_open_to_players:  boolean
  stock:               DbStockLine[]
  seed:                number | null
  created_by:          string | null
  created_at:          string
  updated_at:          string
}

function toDbLine(line: GeneratedStockLine): DbStockLine {
  return {
    item_table:      line.itemTable,
    ref_key:         line.refKey,
    name:            line.name,
    base_rarity:     line.baseRarity,
    modified_rarity: line.modifiedRarity,
    price:           line.price,
    restricted:      line.restricted,
    tier:            line.tier,
    revealed:        line.revealed,
  }
}

export interface RollStockFields {
  name:             string
  locationModifier: number
  archetype:        MarketArchetype
  scale:            MarketScale
  legality:         MarketLegality
  seed:             number
  stock:            GeneratedStockLine[]
  createdBy?:       string | null
}

export function useMarketMerchant(campaignId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [merchant, setMerchant] = useState<MarketMerchant | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // Serialized write queue — see file doc comment.
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve())
  function queueWrite(fn: () => Promise<void>): Promise<void> {
    const next = writeQueueRef.current.then(fn, fn)
    writeQueueRef.current = next.catch(err => {
      console.error('[useMarketMerchant] queued write failed', err)
    })
    return next
  }

  const refetch = useCallback(async () => {
    if (!campaignId) { setMerchant(null); setLoading(false); return }
    const { data, error: fetchError } = await supabase
      .from('market_merchants')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .maybeSingle()
    if (fetchError) { setError(fetchError.message); setLoading(false); return }
    setMerchant((data as MarketMerchant | null) ?? null)
    setLoading(false)
  }, [supabase, campaignId])

  // Catch-up SELECT, then subscribe.
  useEffect(() => {
    setLoading(true)
    void refetch()
    if (!campaignId) return

    const channel = supabase
      .channel(`market-merchants-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_merchants', filter: `campaign_id=eq.${campaignId}` },
        () => { void refetch() },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [supabase, campaignId, refetch])

  // ── Roll Stock — insert-once-then-update-in-place ───────────────────────────
  const rollStock = useCallback((fields: RollStockFields) => {
    if (!campaignId) return Promise.resolve()
    return queueWrite(async () => {
      const { data: existing } = await supabase
        .from('market_merchants')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .maybeSingle()

      const payload = {
        name:               fields.name,
        location_modifier:  fields.locationModifier,
        archetype:          fields.archetype,
        scale:              fields.scale,
        legality:           fields.legality,
        seed:               fields.seed,
        stock:              fields.stock.map(toDbLine),
      }

      if (existing?.id) {
        await supabase.from('market_merchants').update(payload).eq('id', existing.id)
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('market_merchants')
          .insert({ campaign_id: campaignId, is_open_to_players: false, created_by: fields.createdBy ?? null, ...payload })
          .select('id')
          .single()
        if (insertError || !inserted) throw insertError ?? new Error('insert returned no row')
        await supabase.rpc('set_active_merchant', { p_campaign_id: campaignId, p_merchant_id: inserted.id })
      }
      await refetch()
    })
  }, [supabase, campaignId, refetch])

  // ── Per-line mutation, read-fresh-then-write ─────────────────────────────────
  function mutateStock(mutator: (stock: DbStockLine[]) => DbStockLine[]) {
    return queueWrite(async () => {
      if (!campaignId) return
      const { data } = await supabase
        .from('market_merchants')
        .select('id, stock')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .maybeSingle()
      if (!data) return
      const updated = mutator((data.stock as DbStockLine[]) ?? [])
      await supabase.from('market_merchants').update({ stock: updated }).eq('id', data.id)
      await refetch()
    })
  }

  const toggleReveal = useCallback((refKey: string) =>
    mutateStock(stock => stock.map(l => l.ref_key === refKey ? { ...l, revealed: !l.revealed } : l)),
  [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const revealTier = useCallback((tier: MarketTier) =>
    mutateStock(stock => stock.map(l => l.tier === tier ? { ...l, revealed: true } : l)),
  [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const cycleTier = useCallback((refKey: string) =>
    mutateStock(stock => stock.map(l => {
      if (l.ref_key !== refKey) return l
      const next: MarketTier = l.tier === 'open' ? 'back_room' : l.tier === 'back_room' ? 'under_counter' : 'open'
      return { ...l, tier: next }
    })),
  [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const setLinePrice = useCallback((refKey: string, price: number) =>
    mutateStock(stock => stock.map(l => l.ref_key === refKey ? { ...l, price } : l)),
  [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const deleteLine = useCallback((refKey: string) =>
    mutateStock(stock => stock.filter(l => l.ref_key !== refKey)),
  [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const setOpenToPlayers = useCallback((open: boolean) => {
    return queueWrite(async () => {
      if (!campaignId) return
      const { data } = await supabase
        .from('market_merchants')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .maybeSingle()
      if (!data) return
      await supabase.from('market_merchants').update({ is_open_to_players: open }).eq('id', data.id)
      await refetch()
    })
  }, [supabase, campaignId, refetch])

  // ── Snapshot ↓ / ↑ ────────────────────────────────────────────────────────
  const downloadSnapshot = useCallback(() => {
    if (!merchant) return
    const snapshot = serializeMerchantSnapshot({
      name:               merchant.name,
      location_modifier:  merchant.location_modifier,
      archetype:          merchant.archetype,
      scale:              merchant.scale,
      legality:           merchant.legality,
      is_open_to_players: merchant.is_open_to_players,
      stock:              merchant.stock,
    })
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${merchant.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'merchant'}.market.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [merchant])

  /** Parses + validates, reporting unresolvable ref keys — does not write until the caller confirms. */
  const parseSnapshotFile = useCallback(async (
    file: File,
    knownRefKeys?: Partial<Record<MarketItemTable, ReadonlySet<string>>>,
  ) => {
    const text = await file.text()
    return parseMarketSnapshot(text, knownRefKeys)
  }, [])

  const restoreSnapshot = useCallback((snapshot: MarketMerchantSnapshot, createdBy?: string | null) => {
    if (!campaignId) return Promise.resolve()
    return queueWrite(async () => {
      const { data: existing } = await supabase
        .from('market_merchants')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .maybeSingle()

      const payload = {
        name:               snapshot.name,
        location_modifier:  snapshot.locationModifier,
        archetype:          snapshot.archetype,
        scale:              snapshot.scale,
        legality:           snapshot.legality,
        is_open_to_players: snapshot.isOpenToPlayers,
        seed:               null,
        stock: snapshot.stock.map((l): DbStockLine => ({
          item_table:      l.itemTable,
          ref_key:         l.refKey,
          name:            l.name,
          base_rarity:     l.baseRarity,
          modified_rarity: l.modifiedRarity,
          price:           l.price,
          restricted:      l.restricted,
          tier:            l.tier,
          revealed:        l.revealed,
        })),
      }

      if (existing?.id) {
        await supabase.from('market_merchants').update(payload).eq('id', existing.id)
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('market_merchants')
          .insert({ campaign_id: campaignId, created_by: createdBy ?? null, ...payload })
          .select('id')
          .single()
        if (insertError || !inserted) throw insertError ?? new Error('insert returned no row')
        await supabase.rpc('set_active_merchant', { p_campaign_id: campaignId, p_merchant_id: inserted.id })
      }
      await refetch()
    })
  }, [supabase, campaignId, refetch])

  return {
    merchant, loading, error,
    rollStock, toggleReveal, revealTier, cycleTier, setLinePrice, deleteLine, setOpenToPlayers,
    downloadSnapshot, parseSnapshotFile, restoreSnapshot,
  }
}
