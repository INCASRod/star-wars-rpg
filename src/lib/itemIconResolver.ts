/**
 * itemIconResolver.ts
 *
 * Single source of truth for "what image represents this catalogue item"
 * across weapons, armor, and gear. Replaces two prior independent paths:
 *   - useCharacterData.ts's inline `/images/equipment/${table}-${key}.png`
 *     template literals (no existence check, no fallback ladder at all)
 *   - EquipmentImage.tsx's manifest.json lookup + category->generic-SVG
 *     fallback (src/lib/equipment-icons.ts, now deleted)
 *
 * Resolution ladder (strict order, stop at first hit):
 *   1. override         -- GM-pinned image via item_icon_overrides (migration 123)
 *   2. exact             -- {table}-{key}.png exists in the converted set
 *   3. category-pair     -- another item in the same table shares this item's
 *                           two most-specific categories and has its own image
 *   4. single-category   -- another item shares this item's second-most-specific
 *                           category (not the first -- see below) and has an image
 *   4b. only-category    -- item has exactly ONE (non-top-level) category
 *                           (flat-taxonomy tables, e.g. gear's <Type>-derived
 *                           backfill has zero rows with 2+ categories); rungs
 *                           3/4 are structurally unreachable for these, so this
 *                           rung donor-matches on that single category directly
 *   4c. broad-category   -- deep-hierarchy items (4+ categories) where rungs
 *                           3 and 4 both failed (their categories were specific
 *                           enough to be near-singletons); retries progressively
 *                           broader, from categories[2] onward, stopping at the
 *                           first donor found
 *   5. fallback          -- per-table generic glyph
 *
 * "Most specific" categories: the reSpec/OggDude <Categories> array is
 * authored most-specific-first, broadest-last (verified against Weapons.xml:
 * e.g. ["Blaster", "Blaster Pistol", "Pistol", "Ranged"] -- "Ranged" always
 * trails as the broad bucket). Rung 3 takes categories[0]+categories[1] as
 * the pair. Rung 4 deliberately uses categories[1] alone (the second entry),
 * not categories[0] -- if the top-2-together pair (rung 3) already failed to
 * find a donor, retrying on the single MOST specific category alone is
 * unlikely to succeed either (it's the rarest term in the list, same value
 * that was already half of the failed pair); the second entry is one level
 * broader/more common and gives single-category matching a wider net than
 * repeating rung 3's most-specific term alone would. Rung 4b covers the
 * length-1 case those two rungs can't reach at all. Rung 4c covers the
 * opposite failure -- length 4+ items whose top two entries are BOTH so
 * specific that neither found a donor -- by walking every remaining
 * non-top-level entry (index 2 onward) until one succeeds; this is a
 * deliberate, approved loosening (a wrong-silhouette donor within the same
 * table beats a generic fallback glyph, and the GM override rung exists to
 * correct any resulting bad match).
 *
 * TOP_LEVEL_CATEGORIES ('Ranged', 'Melee') are stripped from the categories
 * array before either specificity rung runs, and never considered "second
 * most specific" either -- matching on them alone would pair a thrown knife
 * with a heavy blaster pistol (both 'Ranged'), which is never acceptable.
 * 'Melee' does not actually occur as a literal category value in the current
 * reSpec Weapons.xml (melee weapons use more specific terms like "Cutting
 * Edge Melee", "Bludgeoning Melee") but is excluded defensively since the
 * prompt names it explicitly as an equivalent broad bucket.
 *
 * Files under public/images/equipment/photographic/ are never eligible --
 * manifest.json only lists resolvable (converted or fallback) images; the
 * quarantine move already excludes them (see scripts/convert-equipment-images.py
 * and scripts/process-images.ts --manifest-only).
 *
 * Determinism: when multiple donors match a category rung, the candidate
 * key set is sorted lexicographically and the first is chosen -- same input
 * data always picks the same donor, independent of object/Map iteration
 * order, process, or machine.
 */

import manifest from '../../public/images/manifest.json'

export type ItemTable = 'weapon' | 'armor' | 'gear'
export type IconRung = 'override' | 'exact' | 'category-pair' | 'single-category' | 'only-category' | 'broad-category' | 'fallback'

export interface IconResolution {
  path: string
  rung: IconRung
}

const TOP_LEVEL_CATEGORIES = new Set(['Ranged', 'Melee'])

const MANIFEST_SECTION: Record<ItemTable, keyof typeof manifest> = {
  weapon: 'weapons',
  armor: 'armor',
  gear: 'gear',
}

const FALLBACK_PATH: Record<ItemTable, string> = {
  weapon: '/images/equipment/_fallback-weapon.png',
  armor:  '/images/equipment/_fallback-armor.png',
  gear:   '/images/equipment/_fallback-gear.png',
}

function specificCategories(categories: string[] | null | undefined): string[] {
  if (!categories || categories.length === 0) return []
  return categories.filter(c => !TOP_LEVEL_CATEGORIES.has(c))
}

function hasOwnImage(table: ItemTable, key: string): boolean {
  const section = manifest[MANIFEST_SECTION[table]] as Record<string, string | null>
  return !!section[key]
}

function ownImagePath(table: ItemTable, key: string): string | null {
  const section = manifest[MANIFEST_SECTION[table]] as Record<string, string | null>
  return section[key] ?? null
}

/**
 * Find a deterministic donor: the alphabetically-first other item (by key)
 * in `catalog` whose specific-category set contains every value in `need`,
 * and which has its own resolvable image.
 */
function findDonor(
  table: ItemTable,
  selfKey: string,
  need: string[],
  catalog: Record<string, string[] | null | undefined>,
): string | null {
  if (need.length === 0) return null
  const candidates: string[] = []
  for (const otherKey of Object.keys(catalog)) {
    if (otherKey === selfKey) continue
    if (!hasOwnImage(table, otherKey)) continue
    const otherSpecific = specificCategories(catalog[otherKey])
    if (need.every(n => otherSpecific.includes(n))) candidates.push(otherKey)
  }
  if (candidates.length === 0) return null
  candidates.sort()
  return candidates[0]
}

export interface IconResolverContext {
  /** key: `${table}:${itemKey}` -> image_key (from item_icon_overrides, already scoped to one campaign) */
  overrides: Map<string, string>
  /** All items in each table with their categories, for donor lookup. Pass the full ref map (key -> {categories}). */
  catalogs: Record<ItemTable, Record<string, string[] | null | undefined>>
  /** internal memoization cache -- do not populate manually */
  cache: Map<string, IconResolution>
}

export function createIconResolverContext(
  overrides: Map<string, string>,
  catalogs: Record<ItemTable, Record<string, string[] | null | undefined>>,
): IconResolverContext {
  return { overrides, catalogs, cache: new Map() }
}

/**
 * Resolve the image for one catalogue item. Memoized per (table, key) on
 * the given context -- callers should build one context per campaign/data
 * load (e.g. via useMemo keyed on the campaign id and ref maps) so the cache
 * is correctly invalidated when the underlying data changes.
 */
export function resolveItemIcon(
  ctx: IconResolverContext,
  table: ItemTable,
  key: string,
  categories: string[] | null | undefined,
): IconResolution {
  const cacheKey = `${table}:${key}`
  const cached = ctx.cache.get(cacheKey)
  if (cached) return cached

  const result = resolve(ctx, table, key, categories)
  ctx.cache.set(cacheKey, result)
  return result
}

function resolve(
  ctx: IconResolverContext,
  table: ItemTable,
  key: string,
  categories: string[] | null | undefined,
): IconResolution {
  // Rung 1: campaign override
  const overrideImageKey = ctx.overrides.get(`${table}:${key}`)
  if (overrideImageKey) {
    return { path: `/images/equipment/${table}-${overrideImageKey}.png`, rung: 'override' }
  }

  // Rung 2: exact per-item image
  const own = ownImagePath(table, key)
  if (own) {
    return { path: own, rung: 'exact' }
  }

  const specific = specificCategories(categories)
  const catalog = ctx.catalogs[table]

  // Rung 3: donor by most-specific category pair
  if (specific.length >= 2) {
    const pair = [specific[0], specific[1]]
    const donorKey = findDonor(table, key, pair, catalog)
    if (donorKey) {
      return { path: ownImagePath(table, donorKey)!, rung: 'category-pair' }
    }
  }

  // Rung 4: donor by second-most-specific single category
  if (specific.length >= 2) {
    const donorKey = findDonor(table, key, [specific[1]], catalog)
    if (donorKey) {
      return { path: ownImagePath(table, donorKey)!, rung: 'single-category' }
    }
  }

  // Rung 4b: donor by the item's ONLY category. Flat-taxonomy tables (gear's
  // <Type> backfill) have exactly one category per row -- rungs 3/4 above are
  // structurally unreachable for them (no pair, no "second" entry), so a
  // length-1 item would otherwise skip straight to fallback despite plenty of
  // same-category donors existing. Distinct label from rung 4 on purpose:
  // "matched on the item's only category" is a different confidence level
  // than "matched one level broader than most-specific", and Prompt 3's GM
  // picker/debugging needs to tell them apart.
  if (specific.length === 1) {
    const donorKey = findDonor(table, key, [specific[0]], catalog)
    if (donorKey) {
      return { path: ownImagePath(table, donorKey)!, rung: 'only-category' }
    }
  }

  // Rung 4c: broader retry for deep-hierarchy items where the pair (rung 3)
  // and second-most-specific single value (rung 4) both failed to find a
  // donor -- e.g. "Heavy Blaster Carbine" is specific enough to be a
  // singleton. Walk progressively broader from specific[2] onward (every
  // remaining non-top-level value), stopping at the first donor. A wrong-
  // silhouette weapon is better information than a generic glyph, and the GM
  // override rung (1) exists precisely to correct a bad broad match.
  // TOP_LEVEL_CATEGORIES are never in `specific` to begin with (stripped by
  // specificCategories() above), so this can never match on 'Ranged'/'Melee'.
  if (specific.length >= 3) {
    for (let i = 2; i < specific.length; i++) {
      const donorKey = findDonor(table, key, [specific[i]], catalog)
      if (donorKey) {
        return { path: ownImagePath(table, donorKey)!, rung: 'broad-category' }
      }
    }
  }

  // Rung 5: per-table fallback glyph
  return { path: FALLBACK_PATH[table], rung: 'fallback' }
}
