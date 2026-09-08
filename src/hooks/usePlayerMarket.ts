'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MarketItemTable, MarketTier } from '@/lib/marketSnapshot'

// ── Player-safe projection (migration 130) ───────────────────────────────────
// Mirrors market_player_projection()'s jsonb shape exactly. This hook never
// reads market_merchants directly and never subscribes to postgres_changes on
// it — see 130_market_player_projection.sql's doc comment for why: RLS on
// that table is permissive and row-level, so it cannot redact unrevealed
// lines inside the stock jsonb column, and a raw postgres_changes payload
// would put the whole row (secrets included) on the wire regardless of what
// client code chooses to read. Catch-up goes through the get_player_market_view
// RPC (a plain HTTPS call, never part of the realtime WAL stream); live
// updates arrive as an already-filtered broadcast payload computed by the
// same SQL function server-side, on a campaign-scoped topic.

export interface PlayerMarketLine {
  itemTable:      MarketItemTable
  refKey:         string
  name:           string
  baseRarity:     number
  modifiedRarity: number
  price:          number
  restricted:     boolean
  tier:           MarketTier
  revealed:       boolean
}

export interface PlayerMarketLockedTier {
  tier:             Exclude<MarketTier, 'open'>
  difficultyRarity: number
}

export interface PlayerMarketView {
  campaignId:       string
  isActive:         boolean
  isOpenToPlayers:  boolean
  name:             string
  locationModifier: number
  visibleLines:     PlayerMarketLine[]
  lockedTiers:      PlayerMarketLockedTier[]
}

interface RawProjection {
  campaign_id:       string
  is_active:          boolean
  is_open_to_players: boolean
  name:               string
  location_modifier:  number
  visible_lines: {
    item_table: MarketItemTable; ref_key: string; name: string
    base_rarity: number; modified_rarity: number; price: number
    restricted: boolean; tier: MarketTier; revealed: boolean
  }[]
  locked_tiers: { tier: Exclude<MarketTier, 'open'>; difficulty_rarity: number }[]
}

function adapt(raw: RawProjection): PlayerMarketView {
  return {
    campaignId:       raw.campaign_id,
    isActive:         raw.is_active,
    isOpenToPlayers:  raw.is_open_to_players,
    name:             raw.name,
    locationModifier: raw.location_modifier,
    visibleLines: raw.visible_lines.map(l => ({
      itemTable:      l.item_table,
      refKey:         l.ref_key,
      name:           l.name,
      baseRarity:     l.base_rarity,
      modifiedRarity: l.modified_rarity,
      price:          l.price,
      restricted:     l.restricted,
      tier:           l.tier,
      revealed:       l.revealed,
    })),
    lockedTiers: raw.locked_tiers.map(t => ({
      tier:             t.tier,
      difficultyRarity: t.difficulty_rarity,
    })),
  }
}

/**
 * Read-only player subscription to the campaign's active Market merchant.
 * Catch-up RPC, then a broadcast subscription — NOT postgres_changes (see
 * file doc comment). `market` is null whenever there's nothing to show
 * (no active merchant, or the GM has closed it — `isOpenToPlayers`/`isActive`
 * both collapse to "hide the storefront" for the caller, it doesn't need to
 * inspect either flag itself).
 */
export function usePlayerMarket(campaignId: string | null): PlayerMarketView | null {
  const supabase = useMemo(() => createClient(), [])
  const [view, setView] = useState<PlayerMarketView | null>(null)

  useEffect(() => {
    if (!campaignId) { setView(null); return }
    let cancelled = false

    supabase.rpc('get_player_market_view', { p_campaign_id: campaignId }).then(({ data, error }) => {
      if (cancelled) return
      if (error) { console.warn('[usePlayerMarket] catch-up failed:', error.message); return }
      setView(data ? adapt(data as RawProjection) : null)
    })

    const channel = supabase
      .channel(`market:${campaignId}`)
      .on('broadcast', { event: 'market_update' }, ({ payload }: { payload: RawProjection }) => {
        setView(adapt(payload))
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [supabase, campaignId])

  if (!view || !view.isActive || !view.isOpenToPlayers) return null
  return view
}
