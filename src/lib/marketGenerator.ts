// src/lib/marketGenerator.ts
//
// Pure stock-rolling logic for The Archive's Market feature. No React, no
// Supabase, no DOM — unit-testable in isolation. Reference: AoR Table 5-2
// (location rarity modifiers) and the approved marketplace-rail-panel.html
// mockup's own `roll()`/`weight()`/tier-assignment algorithm, which this
// file reproduces exactly (not merely "inspired by") so GM-rolled stock
// matches the approved design byte-for-byte in distribution.
//
// DETERMINISM: uses mulberry32, a small pure-integer PRNG with no platform-
// dependent behaviour (no Math.random, no Date, no crypto) — same seed +
// same catalogue + same parameters always produces the same stock, on any
// machine. The catalogue is re-sorted by (table, key) before use so caller
// fetch-order (e.g. Supabase's unordered scan order) can never perturb the
// result.

import type { MarketItemTable, MarketTier } from './marketSnapshot'

// ── PRNG ─────────────────────────────────────────────────────────────────────

/** mulberry32 — deterministic, pure-integer, single 32-bit state. */
function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function () {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Catalogue ────────────────────────────────────────────────────────────────

export interface CatalogueItem {
  table:      MarketItemTable
  key:        string
  name:       string
  rarity:     number
  price:      number
  restricted: boolean
  categories: string[]
}

// ── Location (AoR Table 5-2) ─────────────────────────────────────────────────

export interface LocationOption {
  modifier: number
  label:    string
}

export const LOCATIONS: LocationOption[] = [
  { modifier: -2, label: 'Primary Core' },
  { modifier: -1, label: 'Core world / trade lane' },
  { modifier: 0,  label: 'Colony / Inner Rim' },
  { modifier: 1,  label: 'Mid Rim' },
  { modifier: 2,  label: 'Outer Rim / frontier' },
  { modifier: 3,  label: 'Wild Space' },
  { modifier: 4,  label: 'Uncivilized' },
]

// ── Scale ────────────────────────────────────────────────────────────────────

export type MarketScale = 'stall' | 'shop' | 'emporium'

export interface ScaleConfig {
  lines: number
  cap:   number
}

export const SCALES: Record<MarketScale, ScaleConfig> = {
  stall:    { lines: 7,  cap: 5 },
  shop:     { lines: 14, cap: 7 },
  emporium: { lines: 24, cap: 9 },
}

// ── Archetype ────────────────────────────────────────────────────────────────

export type MarketArchetype = 'general' | 'weapons' | 'armor' | 'medical' | 'tech' | 'black' | 'junk'

interface ArchetypeMixConfig {
  mix:            { weapon: number; armor: number; gear: number }
  categories?:    undefined
  junk?:          boolean
  restrictedBias?: boolean
}
interface ArchetypeCategoryConfig {
  mix?:        undefined
  categories:  string[]
  junk?:       undefined
  restrictedBias?: undefined
}
type ArchetypeConfig = ArchetypeMixConfig | ArchetypeCategoryConfig

export const ARCHETYPES: Record<MarketArchetype, ArchetypeConfig> = {
  general:  { mix: { weapon: 0.20, armor: 0.15, gear: 0.65 } },
  weapons:  { mix: { weapon: 0.75, armor: 0.15, gear: 0.10 } },
  armor:    { mix: { weapon: 0.10, armor: 0.70, gear: 0.20 } },
  medical:  { categories: ['Medical', 'Drugs and Consumables', 'Cybernetics', 'Poisons'] },
  tech:     { categories: ['Tools/Electronics', 'Droids', 'Communications', 'Detection/Surveillance Devices', 'Security/Espionage', 'Remotes'] },
  black:    { mix: { weapon: 0.35, armor: 0.15, gear: 0.50 }, restrictedBias: true },
  junk:     { mix: { weapon: 0.25, armor: 0.20, gear: 0.55 }, junk: true },
}

// ── Legality ─────────────────────────────────────────────────────────────────

export type MarketLegality = 'legit' | 'grey' | 'black'

// ── Difficulty ladder (rarity -> canonical tier label) ───────────────────────
// Returns a label for the canonical RichText `:label:` colon-shortcode path
// (parseSymbols.ts's TIER_BASE_DIFFICULTY) — never a hardcoded pip count.
// Bracket matches the approved mockup's own DIFF() function.

export type DifficultyLabel = 'simple' | 'easy' | 'average' | 'hard' | 'daunting' | 'formidable'

export function rarityToDifficultyLabel(rarity: number): DifficultyLabel {
  if (rarity <= 1) return 'simple'
  if (rarity <= 3) return 'easy'
  if (rarity <= 5) return 'average'
  if (rarity <= 7) return 'hard'
  if (rarity <= 9) return 'daunting'
  return 'formidable'
}

// ── Selection weight ─────────────────────────────────────────────────────────
// Common goods dominate, rare goods are genuinely rare: weight decays as
// 0.62^(rarity-1), hard-zeroed above the scale's rarity ceiling. `junk`
// re-biases toward low rarity (<=4) and away from high.

function weight(rarity: number, cap: number, junk: boolean): number {
  if (rarity > cap) return 0
  let w = Math.pow(0.62, Math.max(0, rarity - 1))
  if (junk) w *= rarity <= 4 ? 1.6 : 0.4
  return w
}

// ── Stock line ───────────────────────────────────────────────────────────────

export interface GeneratedStockLine {
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

export interface GenerateStockParams {
  catalogue:        CatalogueItem[]
  locationModifier: number
  archetype:        MarketArchetype
  scale:            MarketScale
  legality:         MarketLegality
  seed:             number
}

const MAX_ATTEMPTS = 4000

export function generateStock(params: GenerateStockParams): GeneratedStockLine[] {
  const { locationModifier, archetype, scale, legality, seed } = params
  const rand = mulberry32(seed)
  const scaleConfig = SCALES[scale]
  const archetypeConfig = ARCHETYPES[archetype]

  // Sort so fetch order (e.g. Supabase's unordered scan) can never perturb
  // the deterministic draw sequence below.
  const catalogue = [...params.catalogue].sort((a, b) =>
    a.table === b.table ? a.key.localeCompare(b.key) : a.table.localeCompare(b.table),
  )

  const categoryFilter = archetypeConfig.categories
  const candidates = catalogue.filter(item => {
    if (item.rarity > scaleConfig.cap) return false
    if (item.restricted && legality === 'legit') return false
    if (categoryFilter) return categoryFilter.some(c => item.categories.includes(c))
    return true
  })

  const bag: Record<MarketItemTable, CatalogueItem[]> = { weapon: [], armor: [], gear: [] }
  for (const item of candidates) bag[item.table].push(item)

  const mix = categoryFilter ? { weapon: 0, armor: 0, gear: 1 } : archetypeConfig.mix!
  const junk = 'junk' in archetypeConfig && !!archetypeConfig.junk
  const restrictedBias = 'restrictedBias' in archetypeConfig && !!archetypeConfig.restrictedBias

  const picked: CatalogueItem[] = []
  const seenKeys = new Set<string>()
  let attempts = 0

  while (picked.length < scaleConfig.lines && attempts++ < MAX_ATTEMPTS) {
    const r = rand()
    const table: MarketItemTable = r < mix.weapon ? 'weapon' : r < mix.weapon + mix.armor ? 'armor' : 'gear'
    const tableBag = bag[table]
    if (!tableBag.length) continue

    const candidate = tableBag[Math.floor(rand() * tableBag.length)]
    if (seenKeys.has(candidate.key)) continue
    if (rand() > weight(candidate.rarity, scaleConfig.cap, junk)) continue
    if (restrictedBias && !candidate.restricted && rand() < 0.35) continue

    seenKeys.add(candidate.key)
    picked.push(candidate)
  }

  return picked
    .map((item): GeneratedStockLine => {
      const modifiedRarity = item.rarity + locationModifier
      let tier: MarketTier
      if (item.restricted) {
        if (legality === 'black') {
          tier = rand() < 0.30 ? 'open' : rand() < 0.5 ? 'back_room' : 'under_counter'
        } else {
          // grey — 'legit' already excluded restricted items from the pool above
          tier = rand() < 0.35 ? 'back_room' : 'under_counter'
        }
      } else {
        tier = modifiedRarity >= 6 ? 'back_room' : 'open'
        if (archetype === 'black' && tier === 'open' && rand() < 0.25) tier = 'back_room'
      }
      return {
        itemTable:      item.table,
        refKey:         item.key,
        name:           item.name,
        baseRarity:     item.rarity,
        modifiedRarity,
        price:          item.price,
        restricted:     item.restricted,
        tier,
        revealed:       false,
      }
    })
    .sort((a, b) => a.modifiedRarity - b.modifiedRarity)
}
