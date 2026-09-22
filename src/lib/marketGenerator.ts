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
import { TAG_MOD, TAG_CYBERNETIC, MOD_SUBTYPE_TAG } from './itemCategories'

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
  /**
   * Target rarity the skewed selection curve centers on for this scale — NOT
   * a hard ceiling. Every rarity is reachable at every scale; this only
   * shifts where the curve's "ceiling" sits (see `weight()` below). Field
   * name kept as `cap` (values unchanged: 5/7/9) because GmMarketPanel.tsx
   * reads it for its "rarity ceiling" display string and this task does not
   * touch that file.
   */
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
}
interface ArchetypeCategoryConfig {
  mix?:        undefined
  categories:  string[]
  junk?:       undefined
}
type ArchetypeConfig = ArchetypeMixConfig | ArchetypeCategoryConfig

export const ARCHETYPES: Record<MarketArchetype, ArchetypeConfig> = {
  general:  { mix: { weapon: 0.20, armor: 0.15, gear: 0.65 } },
  weapons:  { mix: { weapon: 0.75, armor: 0.15, gear: 0.10 } },
  armor:    { mix: { weapon: 0.10, armor: 0.70, gear: 0.20 } },
  // TAG_CYBERNETIC / TAG_MOD come from itemCategories.ts rather than being
  // respelled here — those two tag strings are declared in exactly one place
  // so a rename stays a single edit (see migration 134's seed).
  //
  // Mods and cybernetics were unreachable in EVERY archetype before this:
  // the 212 'Mod'-tagged ref_gear rows migration 134 seeded matched no
  // archetype's category list, and 'Cybernetics' appeared only in `medical`.
  // A cyberware clinic is a medical business, but a mod is a tech-shop good,
  // and cyberware is plausibly stocked by both — so `tech` now carries mods
  // and cybernetics, and `medical` keeps cybernetics.
  // TAG_MOD / TAG_CYBERNETIC removed from these allowlists — mods and
  // cybernetics now enter medical/tech exclusively via the bounded sub-draw
  // below (SUB_DRAW_ARCHETYPES), never the main category draw, so a mod row
  // can never be picked twice.
  medical:  { categories: ['Medical', 'Drugs and Consumables', 'Poisons'] },
  tech:     { categories: ['Tools/Electronics', 'Droids', 'Communications', 'Detection/Surveillance Devices', 'Security/Espionage', 'Remotes'] },
  black:    { mix: { weapon: 0.35, armor: 0.15, gear: 0.50 } },
  junk:     { mix: { weapon: 0.25, armor: 0.20, gear: 0.55 }, junk: true },
}

// ── Mod / cybernetic sub-draw ───────────────────────────────────────────────
// A second, bounded draw run after an archetype's normal stock draw, so
// weapons/armor (mix-mode) and tech/medical (category-mode) can each carry a
// small amount of mod/cybernetic stock without their existing draw logic or
// ratios changing. Mod:Lightsaber is excluded everywhere — lightsaber mods
// (incl. crystals) are Quartermaster-catalogue-search-only, never merchant
// stock.
const SUB_DRAW_SHARE = 0.20

/** Category tags an archetype's sub-draw pool is filtered to. Archetypes not
 *  listed here (general/black/junk) get no sub-draw at all. */
export const SUB_DRAW_ARCHETYPES: Partial<Record<MarketArchetype, string[]>> = {
  weapons: [MOD_SUBTYPE_TAG.weapon],
  armor:   [MOD_SUBTYPE_TAG.armor],
  tech:    [MOD_SUBTYPE_TAG.weapon, MOD_SUBTYPE_TAG.armor, TAG_CYBERNETIC],
  medical: [TAG_CYBERNETIC],
}

// ── Restricted share targeting ──────────────────────────────────────────────
// Restricted-goods PROPORTION is targeted directly rather than left to emerge
// from rejection sampling against the rarity curve (the old `restrictedBias`
// approach fought the curve, since restricted stock skews rarity 6+ and the
// curve suppresses high rarity — see docs/architecture.md). Rarity still
// decides WHICH restricted item appears (via the weighted draw within the
// restricted pool below); it no longer decides HOW MUCH restricted stock
// there is.
function restrictedShareTarget(archetype: MarketArchetype, legality: MarketLegality): number | null {
  if (legality === 'legit') return null   // restricted excluded from the pool entirely, unchanged
  if (archetype === 'black') return 0.70  // archetype dominates; does not stack with legality below
  if (legality === 'black') return 0.30
  return null                             // grey / non-black: restricted appears via normal selection only
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
// Scale-weighted skewed curve, centered on the scale's target rarity
// (`SCALES[scale].cap`: stall 5, shop 7, emporium 9 — the field is still
// named `cap` for GmMarketPanel.tsx's display string, which this task does
// not touch, but it is no longer a hard ceiling; it is the curve's center).
// No rarity is ever unreachable at any scale.
//
// Below the target the curve decays slowly (rate 0.85 per rarity step) so
// ordinary/common goods (low rarity) stay dominant at every scale while
// mid-range rarity remains reasonably attainable. Above the target it decays
// steeply (rate 0.35 per step) so the ceiling sits near the target and
// higher rarities are occasional, not never. The asymmetry (slow below,
// fast above) is what makes the curve "skewed" rather than a symmetric bell:
// it keeps common goods common everywhere while still visibly enriching
// higher scales (an emporium's target-9 weight is 0.85^9 ≈ 0.232 vs a
// stall's target-5 weight of 0.85^5 ≈ 0.444 decaying steeply straight past
// it — emporium rarity-9 weight ≈0.232 vs stall rarity-9 weight ≈0.0067,
// roughly a 35x richer high end without abandoning common stock).
//
// `junk` re-biases toward low rarity (<=4) and away from high, applied on
// top of the curve exactly as before.

const CURVE_BELOW_RATE = 0.85
const CURVE_ABOVE_RATE = 0.35

function weight(rarity: number, targetRarity: number, junk: boolean): number {
  const w = rarity <= targetRarity
    ? Math.pow(CURVE_BELOW_RATE, rarity)
    : Math.pow(CURVE_BELOW_RATE, targetRarity) * Math.pow(CURVE_ABOVE_RATE, rarity - targetRarity)
  return junk ? w * (rarity <= 4 ? 1.6 : 0.4) : w
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

/**
 * Shared pool-building logic used by both `generateStock` (whole-draw) and
 * `drawReplacementLine` (single-line GM Replace) — the one place an
 * archetype's eligible catalogue is computed, so Replace can never drift
 * from what a normal roll would have offered.
 */
function buildArchetypePools(catalogue: CatalogueItem[], archetype: MarketArchetype, legality: MarketLegality) {
  const archetypeConfig = ARCHETYPES[archetype]
  const categoryFilter = archetypeConfig.categories
  // Legality/restricted filter only — NOT the category filter — so the mod/
  // cybernetic sub-draw (which runs against a tag filter of its own,
  // independent of an archetype's main category allowlist) still has a pool
  // to draw from for category-mode archetypes (tech/medical).
  const baseCandidates = catalogue.filter(item => !(item.restricted && legality === 'legit'))
  const candidates = categoryFilter
    ? baseCandidates.filter(item => categoryFilter.some(c => item.categories.includes(c)))
    : baseCandidates
  const mix = categoryFilter ? { weapon: 0, armor: 0, gear: 1 } : archetypeConfig.mix!
  const junk = 'junk' in archetypeConfig && !!archetypeConfig.junk
  const subDrawTags = SUB_DRAW_ARCHETYPES[archetype]
  const subDrawPool = subDrawTags
    ? baseCandidates.filter(item => subDrawTags.some(t => item.categories.includes(t)))
    : []
  return { baseCandidates, candidates, mix, junk, subDrawTags, subDrawPool }
}

function buildBag(items: CatalogueItem[]): Record<MarketItemTable, CatalogueItem[]> {
  const bag: Record<MarketItemTable, CatalogueItem[]> = { weapon: [], armor: [], gear: [] }
  for (const item of items) bag[item.table].push(item)
  return bag
}

/**
 * Single weighted candidate pick — the one place every exclusion rule
 * (already-picked/excluded key, Mod:Lightsaber, main-draw mod/cyber ban,
 * bad-row price/rarity guard, rarity-curve weight) is applied. Both
 * `generateStock`'s `drawInto` (whole-draw, many picks) and
 * `drawReplacementLine` (GM Replace, one pick) call this — neither
 * re-implements the rule set.
 */
function pickCandidate(
  bag: Record<MarketItemTable, CatalogueItem[]>,
  drawMix: { weapon: number; armor: number; gear: number },
  rand: () => number,
  targetRarity: number,
  junk: boolean,
  allowModCyber: boolean,
  excludeKeys: Set<string>,
): CatalogueItem | null {
  let attempts = 0
  while (attempts++ < MAX_ATTEMPTS) {
    const r = rand()
    const table: MarketItemTable = r < drawMix.weapon ? 'weapon' : r < drawMix.weapon + drawMix.armor ? 'armor' : 'gear'
    const tableBag = bag[table]
    if (!tableBag.length) continue

    const candidate = tableBag[Math.floor(rand() * tableBag.length)]
    if (excludeKeys.has(candidate.key)) continue
    // Lightsaber-subtype mods (incl. crystals) never appear in merchant
    // stock for ANY archetype — Quartermaster catalogue search only. Single
    // exclusion point, checked at draw time rather than filtered out of
    // the bag up front, so bag order/indices for every other item stay
    // exactly what they were before this exclusion existed.
    if (candidate.categories.includes(MOD_SUBTYPE_TAG.lightsaber)) continue
    // MOD/CYBERNETIC candidates are excluded from every MAIN draw — they
    // only ever enter stock through the bounded sub-draw (or a Replace call
    // explicitly permitted to draw one), which passes allowModCyber=true.
    if (!allowModCyber && (candidate.categories.includes(TAG_MOD) || candidate.categories.includes(TAG_CYBERNETIC))) continue
    // Bad-row guard: a row with a missing (not zero — rarity 0/price 0 are
    // legitimate AoE values for trivial/narrative items) price or rarity is
    // malformed import data, never valid stock.
    if (candidate.price == null || candidate.rarity == null) continue
    if (rand() > weight(candidate.rarity, targetRarity, junk)) continue

    return candidate
  }
  return null
}

/** `max(1, round(SUB_DRAW_SHARE × SCALES.stall.lines))` — the sub-draw's own
 *  line count, and also the mod/cyber cap `drawReplacementLine` enforces. */
export const SUB_DRAW_CAP = Math.max(1, Math.round(SUB_DRAW_SHARE * SCALES.stall.lines))

export function generateStock(params: GenerateStockParams): GeneratedStockLine[] {
  const { locationModifier, archetype, scale, legality, seed } = params
  const rand = mulberry32(seed)
  const scaleConfig = SCALES[scale]

  // Sort so fetch order (e.g. Supabase's unordered scan) can never perturb
  // the deterministic draw sequence below.
  const catalogue = [...params.catalogue].sort((a, b) =>
    a.table === b.table ? a.key.localeCompare(b.key) : a.table.localeCompare(b.table),
  )

  const { baseCandidates, candidates, mix, junk, subDrawTags, subDrawPool: subDrawPoolAll } = buildArchetypePools(catalogue, archetype, legality)
  const targetRarity = scaleConfig.cap

  const picked: CatalogueItem[] = []
  const seenKeys = new Set<string>()

  // Draws up to `count` distinct lines from `bag` (partitioned by table),
  // respecting the archetype's table mix and the rarity curve, appending
  // into `picked`/`seenKeys`. Returns how many were actually added — a pool
  // can run dry (e.g. too few restricted candidates at stall scale).
  const drawInto = (
    bag: Record<MarketItemTable, CatalogueItem[]>,
    count: number,
    drawMix: { weapon: number; armor: number; gear: number } = mix,
    allowModCyber = false,
  ): number => {
    let added = 0
    while (added < count) {
      const candidate = pickCandidate(bag, drawMix, rand, targetRarity, junk, allowModCyber, seenKeys)
      if (!candidate) break
      seenKeys.add(candidate.key)
      picked.push(candidate)
      added++
    }
    return added
  }

  const restrictedTarget = restrictedShareTarget(archetype, legality)

  if (restrictedTarget !== null) {
    const restrictedBag = buildBag(candidates.filter(i => i.restricted))
    const nonRestrictedBag = buildBag(candidates.filter(i => !i.restricted))

    const restrictedWant = Math.round(scaleConfig.lines * restrictedTarget)
    const nonRestrictedWant = scaleConfig.lines - restrictedWant

    // Draw order (restricted pool first, then non-restricted) is fixed by
    // the params, so PRNG call order — and therefore the resulting stock —
    // stays deterministic for a given seed.
    const restrictedGot = drawInto(restrictedBag, restrictedWant)
    const nonRestrictedGot = drawInto(nonRestrictedBag, nonRestrictedWant)

    if (restrictedGot < restrictedWant) {
      console.warn(
        `[marketGenerator] restricted share target unmet: wanted ${restrictedWant} ` +
        `(${Math.round(restrictedTarget * 100)}% of ${scaleConfig.lines}), got ${restrictedGot} ` +
        `(scale=${scale}, archetype=${archetype}, legality=${legality}) — filling shortfall from the general pool`,
      )
    }

    const shortfall = scaleConfig.lines - picked.length
    if (shortfall > 0) {
      const filled = drawInto(buildBag(candidates), shortfall)
      if (filled < shortfall) {
        console.warn(
          `[marketGenerator] could not fill full stock: wanted ${scaleConfig.lines} lines, ` +
          `got ${picked.length} (scale=${scale}, archetype=${archetype}, legality=${legality}) — candidate pool exhausted`,
        )
      }
    }
  } else {
    drawInto(buildBag(candidates), scaleConfig.lines)
  }

  // Bounded mod/cybernetic sub-draw — runs after the archetype's normal draw
  // is done, drawing from a separate tag-filtered pool so it never displaces
  // the main draw's ratios/counts. All mod/cybernetic rows are `gear`-table,
  // so it always uses an all-gear mix regardless of the archetype's own mix.
  if (subDrawTags) {
    const subDrawPool = subDrawPoolAll.filter(item => !seenKeys.has(item.key))
    if (subDrawPool.length > 0) {
      drawInto(buildBag(subDrawPool), SUB_DRAW_CAP, { weapon: 0, armor: 0, gear: 1 }, true)
    }
  }

  return picked
    .map(item => toStockLine(item, locationModifier, archetype, legality, rand))
    .sort((a, b) => a.modifiedRarity - b.modifiedRarity)
}

/** Assigns modifiedRarity/tier and shapes a `CatalogueItem` into a
 *  `GeneratedStockLine` — shared by `generateStock` and `drawReplacementLine`
 *  so tier-assignment rules never drift between a whole roll and one swap. */
function toStockLine(
  item: CatalogueItem,
  locationModifier: number,
  archetype: MarketArchetype,
  legality: MarketLegality,
  rand: () => number,
): GeneratedStockLine {
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
}

// ── GM Replace — single-line swap ───────────────────────────────────────────

export interface DrawReplacementParams {
  catalogue:        CatalogueItem[]
  locationModifier: number
  archetype:        MarketArchetype
  scale:            MarketScale
  legality:         MarketLegality
  /** ref_keys already in the stall (including the line being replaced) —
   *  never re-offered. */
  excludeKeys:      string[]
  /** false when the stall's mod/cyber line count is already at `SUB_DRAW_CAP`
   *  and the line being replaced is not itself a mod/cyber line (i.e.
   *  replacing it would not free a slot). */
  allowModCyber:    boolean
  seed:             number
}

/**
 * Draws exactly one replacement line for a GM "Replace" action, from the
 * union of the archetype's main-draw pool and its mod/cyber sub-draw pool
 * (whichever categories that archetype could ever stock), applying the same
 * exclusions/weighting `generateStock` uses via `pickCandidate`/`toStockLine`
 * — no second copy of the selection rules. Returns `null` if no eligible
 * candidate exists (pool exhausted or all rejected).
 */
export function drawReplacementLine(params: DrawReplacementParams): GeneratedStockLine | null {
  const { locationModifier, archetype, scale, legality, excludeKeys, allowModCyber, seed } = params
  const rand = mulberry32(seed)
  const scaleConfig = SCALES[scale]
  const targetRarity = scaleConfig.cap

  const catalogue = [...params.catalogue].sort((a, b) =>
    a.table === b.table ? a.key.localeCompare(b.key) : a.table.localeCompare(b.table),
  )
  const { candidates, mix, junk, subDrawTags, subDrawPool } = buildArchetypePools(catalogue, archetype, legality)

  // Union of main-draw pool ∪ sub-draw pool, deduped by key (weapons/armor's
  // unfiltered gear mix can already contain mod-tagged rows that also appear
  // in their own sub-draw pool).
  const seen = new Set<string>()
  const pool: CatalogueItem[] = []
  for (const item of candidates) { if (!seen.has(item.key)) { seen.add(item.key); pool.push(item) } }
  if (subDrawTags) for (const item of subDrawPool) { if (!seen.has(item.key)) { seen.add(item.key); pool.push(item) } }

  const excludeSet = new Set(excludeKeys)
  const bag = buildBag(pool)
  const candidate = pickCandidate(bag, mix, rand, targetRarity, junk, allowModCyber, excludeSet)
  if (!candidate) return null

  return toStockLine(candidate, locationModifier, archetype, legality, rand)
}
