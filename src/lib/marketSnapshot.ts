// src/lib/marketSnapshot.ts
//
// Pure serialise/parse for a Market merchant snapshot — the only persistence
// mechanism for merchants (127_market_merchants.sql keeps just the single
// active row per campaign; nothing here is a history table). A snapshot is
// downloaded/uploaded as a plain JSON file via a browser file picker, so its
// contents are untrusted input: parse() validates every field and never
// spreads unvalidated data into state.
//
// No React, no Supabase, no DOM — must stay unit-testable in isolation.

export const MARKET_SNAPSHOT_VERSION = 1 as const

export type MarketItemTable = 'weapon' | 'armor' | 'gear'
export type MarketTier = 'open' | 'back_room' | 'under_counter'

export interface MarketStockLine {
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

export interface MarketMerchantSnapshot {
  version:           typeof MARKET_SNAPSHOT_VERSION
  name:              string
  locationModifier:  number
  archetype:         string
  scale:             string
  legality:          string
  isOpenToPlayers:   boolean
  stock:             MarketStockLine[]
}

/** Merchant shape this module knows how to serialise — mirrors market_merchants columns. */
export interface MarketMerchantForSnapshot {
  name:              string
  location_modifier: number
  archetype:         string
  scale:             string
  legality:          string
  is_open_to_players: boolean
  stock: {
    item_table:      MarketItemTable
    ref_key:         string
    name:            string
    base_rarity:     number
    modified_rarity: number
    price:           number
    restricted:      boolean
    tier:            MarketTier
    revealed:        boolean
  }[]
}

const ITEM_TABLES: readonly MarketItemTable[] = ['weapon', 'armor', 'gear']
const TIERS: readonly MarketTier[] = ['open', 'back_room', 'under_counter']

export function serializeMerchantSnapshot(merchant: MarketMerchantForSnapshot): MarketMerchantSnapshot {
  return {
    version: MARKET_SNAPSHOT_VERSION,
    name: merchant.name,
    locationModifier: merchant.location_modifier,
    archetype: merchant.archetype,
    scale: merchant.scale,
    legality: merchant.legality,
    isOpenToPlayers: merchant.is_open_to_players,
    stock: merchant.stock.map(line => ({
      itemTable: line.item_table,
      refKey: line.ref_key,
      name: line.name,
      baseRarity: line.base_rarity,
      modifiedRarity: line.modified_rarity,
      price: line.price,
      restricted: line.restricted,
      tier: line.tier,
      revealed: line.revealed,
    })),
  }
}

export interface MarketSnapshotParseResult {
  ok: true
  snapshot: MarketMerchantSnapshot
  /** Ref keys present in the snapshot that could not be resolved against the supplied catalogue. Empty when no catalogue is supplied or every key resolves. */
  unresolvedRefKeys: string[]
}

export interface MarketSnapshotParseError {
  ok: false
  error: string
}

/**
 * Parse an untrusted JSON string into a MarketMerchantSnapshot.
 *
 * `knownRefKeys`, when supplied, is a set of ref keys that currently exist in
 * the catalogue (per item table). Ref keys in the snapshot that aren't in
 * this set are reported in `unresolvedRefKeys` rather than silently dropped
 * — merchants are long-lived JSON files and retired/renamed keys are a real,
 * already-observed case (see docs/architecture.md, legacy item renames).
 */
export function parseMarketSnapshot(
  raw: string,
  knownRefKeys?: Partial<Record<MarketItemTable, ReadonlySet<string>>>,
): MarketSnapshotParseResult | MarketSnapshotParseError {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Not valid JSON.' }
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Snapshot must be a JSON object.' }
  }
  const obj = data as Record<string, unknown>

  if (obj.version !== MARKET_SNAPSHOT_VERSION) {
    return { ok: false, error: `Unsupported snapshot version: ${String(obj.version)}. Expected ${MARKET_SNAPSHOT_VERSION}.` }
  }
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    return { ok: false, error: 'Missing or invalid "name".' }
  }
  if (typeof obj.locationModifier !== 'number' || !Number.isFinite(obj.locationModifier)) {
    return { ok: false, error: 'Missing or invalid "locationModifier".' }
  }
  if (typeof obj.archetype !== 'string' || !obj.archetype.trim()) {
    return { ok: false, error: 'Missing or invalid "archetype".' }
  }
  if (typeof obj.scale !== 'string' || !obj.scale.trim()) {
    return { ok: false, error: 'Missing or invalid "scale".' }
  }
  if (typeof obj.legality !== 'string' || !obj.legality.trim()) {
    return { ok: false, error: 'Missing or invalid "legality".' }
  }
  if (typeof obj.isOpenToPlayers !== 'boolean') {
    return { ok: false, error: 'Missing or invalid "isOpenToPlayers".' }
  }
  if (!Array.isArray(obj.stock)) {
    return { ok: false, error: 'Missing or invalid "stock" (expected an array).' }
  }

  const stock: MarketStockLine[] = []
  const unresolvedRefKeys: string[] = []

  for (let i = 0; i < obj.stock.length; i++) {
    const line = obj.stock[i]
    if (typeof line !== 'object' || line === null || Array.isArray(line)) {
      return { ok: false, error: `stock[${i}] is not an object.` }
    }
    const l = line as Record<string, unknown>

    if (typeof l.itemTable !== 'string' || !ITEM_TABLES.includes(l.itemTable as MarketItemTable)) {
      return { ok: false, error: `stock[${i}].itemTable is invalid: ${String(l.itemTable)}.` }
    }
    if (typeof l.refKey !== 'string' || !l.refKey.trim()) {
      return { ok: false, error: `stock[${i}].refKey is missing or invalid.` }
    }
    if (typeof l.name !== 'string' || !l.name.trim()) {
      return { ok: false, error: `stock[${i}].name is missing or invalid.` }
    }
    if (typeof l.baseRarity !== 'number' || !Number.isFinite(l.baseRarity)) {
      return { ok: false, error: `stock[${i}].baseRarity is missing or invalid.` }
    }
    if (typeof l.modifiedRarity !== 'number' || !Number.isFinite(l.modifiedRarity)) {
      return { ok: false, error: `stock[${i}].modifiedRarity is missing or invalid.` }
    }
    if (typeof l.price !== 'number' || !Number.isFinite(l.price)) {
      return { ok: false, error: `stock[${i}].price is missing or invalid.` }
    }
    if (typeof l.restricted !== 'boolean') {
      return { ok: false, error: `stock[${i}].restricted is missing or invalid.` }
    }
    if (typeof l.tier !== 'string' || !TIERS.includes(l.tier as MarketTier)) {
      return { ok: false, error: `stock[${i}].tier is invalid: ${String(l.tier)}.` }
    }
    if (typeof l.revealed !== 'boolean') {
      return { ok: false, error: `stock[${i}].revealed is missing or invalid.` }
    }

    const itemTable = l.itemTable as MarketItemTable
    const refKey = l.refKey as string
    const known = knownRefKeys?.[itemTable]
    if (known && !known.has(refKey)) {
      unresolvedRefKeys.push(refKey)
    }

    stock.push({
      itemTable,
      refKey,
      name: l.name as string,
      baseRarity: l.baseRarity as number,
      modifiedRarity: l.modifiedRarity as number,
      price: l.price as number,
      restricted: l.restricted as boolean,
      tier: l.tier as MarketTier,
      revealed: l.revealed as boolean,
    })
  }

  return {
    ok: true,
    snapshot: {
      version: MARKET_SNAPSHOT_VERSION,
      name: obj.name,
      locationModifier: obj.locationModifier,
      archetype: obj.archetype,
      scale: obj.scale,
      legality: obj.legality,
      isOpenToPlayers: obj.isOpenToPlayers,
      stock,
    },
    unresolvedRefKeys,
  }
}
