// src/lib/itemCategories.ts
//
// The Archive — MOD / CYBERNETIC item categories (migration 134).
//
// Category in this app is a TWO-PART thing and always has been:
//   1. the TABLE an item lives in (`ref_weapons` / `ref_armor` / `ref_gear`),
//      surfaced as the lowercase discriminator 'weapon' | 'armor' | 'gear';
//   2. the freeform `categories TEXT[]` tag column every ref table carries.
//
// MOD and CYBERNETIC are part (2) — derived tag readings over ordinary
// `ref_gear` rows, NOT new tables and NOT new discriminator values. This file
// is the single place those tag strings are spelled, so a rename is one edit.
// Everything that filters, labels, or routes a mod goes through here.
//
// See supabase/migrations/134_mod_cybernetic_categories.sql for the seed that
// produces the 'Mod' / 'Mod:<Target>' tags, and docs/architecture.md.

/** Tag marking a ref_gear row as a loose, installable modification. */
export const TAG_MOD = 'Mod'

/**
 * Tag marking a ref_gear row as a cybernetic implant. NOTE the plural — this
 * is pre-existing live data (backfilled from Gear.xml's <Type>Cybernetics),
 * not something migration 134 introduced. Do not "correct" it to 'Cybernetic'.
 */
export const TAG_CYBERNETIC = 'Cybernetics'

/** What kind of item a mod can be installed into. */
export type ModSubtype = 'weapon' | 'lightsaber' | 'armor'

/** Subtype tag spellings, matching migration 134's seed exactly. */
export const MOD_SUBTYPE_TAG: Record<ModSubtype, string> = {
  weapon:     'Mod:Weapon',
  lightsaber: 'Mod:Lightsaber',
  armor:      'Mod:Armor',
}

/** Player-facing category label, uppercase, as shown on chips and list rows. */
export type ItemCategoryLabel = 'WEAPON' | 'ARMOR' | 'GEAR' | 'MOD' | 'CYBERNETIC'

function has(categories: string[] | null | undefined, tag: string): boolean {
  return Array.isArray(categories) && categories.includes(tag)
}

export function isModItem(categories: string[] | null | undefined): boolean {
  return has(categories, TAG_MOD)
}

export function isCyberneticItem(categories: string[] | null | undefined): boolean {
  return has(categories, TAG_CYBERNETIC)
}

/** The install target a mod is for, or null if the row isn't a mod. */
export function modSubtype(categories: string[] | null | undefined): ModSubtype | null {
  if (!isModItem(categories)) return null
  if (has(categories, MOD_SUBTYPE_TAG.lightsaber)) return 'lightsaber'
  if (has(categories, MOD_SUBTYPE_TAG.armor))      return 'armor'
  if (has(categories, MOD_SUBTYPE_TAG.weapon))     return 'weapon'
  return null
}

/**
 * Whether a mod of `subtype` fits the item currently being viewed.
 * `skillKey` is the target weapon's ref_weapons.skill_key — 'LTSABER' is the
 * only signal that distinguishes a lightsaber from any other weapon (there is
 * no type/category column on ref_weapons). Mirrors install_mod()'s server-side
 * check exactly; the RPC is still the authority, this is only for filtering
 * the "available from inventory" list.
 */
export function modFitsTarget(
  subtype: ModSubtype | null,
  targetKind: 'weapon' | 'armor',
  skillKey?: string | null,
): boolean {
  if (!subtype) return false
  if (subtype === 'armor')      return targetKind === 'armor'
  if (subtype === 'lightsaber') return targetKind === 'weapon' && skillKey === 'LTSABER'
  return targetKind === 'weapon' && skillKey !== 'LTSABER'
}

/**
 * Category label for display. MOD and CYBERNETIC win over the plain table
 * discriminator — a mod is a `ref_gear` row, but calling it "GEAR" in a
 * catalogue list is exactly the confusion this label exists to prevent.
 */
export function itemCategoryLabel(
  table: 'weapon' | 'armor' | 'gear',
  categories: string[] | null | undefined,
): ItemCategoryLabel {
  if (isModItem(categories))        return 'MOD'
  if (isCyberneticItem(categories)) return 'CYBERNETIC'
  return table === 'weapon' ? 'WEAPON' : table === 'armor' ? 'ARMOR' : 'GEAR'
}

// ── Installed-attachment entry shape (character_weapons/armor.attachments) ───
// jsonb array element, written only by install_mod()/uninstall_mod(). The
// `key` field predates this work and is all derivedStats.ts reads;
// `instance_id` was added by migration 134 so two copies of the same mod on
// one item stay independently removable.
export interface InstalledAttachmentEntry {
  key: string
  instance_id?: string
}

export function parseInstalledAttachments(raw: unknown): InstalledAttachmentEntry[] {
  if (!Array.isArray(raw)) return []
  const out: InstalledAttachmentEntry[] = []
  for (const e of raw) {
    const key = (e as { key?: unknown })?.key
    if (typeof key !== 'string' || !key) continue
    const instanceId = (e as { instance_id?: unknown })?.instance_id
    out.push({ key, instance_id: typeof instanceId === 'string' ? instanceId : undefined })
  }
  return out
}

// ── Unresolved mod-key warning (deduped) ─────────────────────────────────────
// ref_item_descriptors resolves most mod-effect keys to a name/description,
// but ~104 of them (ACCURATE, DAMADD, PIERCE, …) are an application-level
// mechanic vocabulary with no descriptor row. Those render as the raw key.
// One console.warn per key for the life of the page — never per render.
const warnedModKeys = new Set<string>()

export function warnUnresolvedModKey(key: string): void {
  if (warnedModKeys.has(key)) return
  warnedModKeys.add(key)
  console.warn(`[mods] no ref_item_descriptors entry for mod key "${key}" — rendering the raw key`)
}

// ── Mod-effect key labels ────────────────────────────────────────────────────
// The fallback tier between `ref_item_descriptors` and "print the raw key".
// Audited against the live data, not guessed: the full set of mod-effect keys
// appearing in ref_item_attachments.base_mods / added_mods with NO descriptor
// row is 38 keys, and every one of them is in this map. Three kinds:
//
//   1. skill keys      — the mod grants that many ranks / boost in a skill
//   2. characteristic  — 'BR' is Brawn (Strength Enhancing System: BR 1, BRA 2)
//   3. talent keys     — the mod grants ranks of that talent
//   4. quality verbs   — REMQUAL<X> removes quality X, SUBQUAL<X> reduces it
//
// Names for 1-3 were read out of ref_skills / ref_talents rather than
// invented, so they match what the rest of the app calls the same thing.
// A key NOT in this map still renders raw and still logs exactly once via
// warnUnresolvedModKey() above — this map does not replace that path.
export const MOD_KEY_LABEL: Record<string, string> = {
  // Characteristic
  BR: 'Brawn',
  // Skills
  ATHL: 'Athletics', BRA: 'Brawl', COOL: 'Cool', COORD: 'Coordination',
  PERC: 'Perception', RESIL: 'Resilience', STEAL: 'Stealth',
  SURV: 'Survival', VIGIL: 'Vigilance',
  // Talents
  BAR: 'Barrage', DEFSTA: 'Defensive Stance', DURA: 'Durable',
  INTIM: 'Intimidating', LETHALBL: 'Lethal Blows', MASSHAD: 'Master of Shadows',
  NATMAR: 'Natural Marksman', PARRY: 'Parry', PLANMAP: 'Planet Mapper',
  POINTBL: 'Point Blank', PRECAIM: 'Precise Aim', PRESSHOT: 'Prescient Shot',
  QUICKDR: 'Quick Draw', QUICKST: 'Quick Strike', RAPREC: 'Rapid Recovery',
  REFLECT: 'Reflect', SNIPSHOT: 'Sniper Shot', STALK: 'Stalker',
  TECHAPT: 'Technical Aptitude',
  // Quality verbs
  REMQUALBREACH: 'Removes Breach', REMQUALION: 'Removes Ion',
  REMQUALLIMITEDAMMO: 'Removes Limited Ammo',
  REMQUALSTUNSETTING: 'Removes Stun Setting',
  REMQUALSUNDER: 'Removes Sunder',
  SUBQUALCUMBERSOME: 'Reduces Cumbersome', SUBQUALINACCURATE: 'Reduces Inaccurate',
  SUBQUALUNWIELDY: 'Reduces Unwieldy', SUBQUALVICIOUS: 'Reduces Vicious',
}

/**
 * Resolve one mod-effect key to display copy. Tiers, in order:
 *   1. `ref_item_descriptors` (the authority — pass its name in as `descName`)
 *   2. MOD_KEY_LABEL above
 *   3. the raw key, plus ONE console.warn per key for the life of the page
 */
export function modKeyLabel(key: string, descName?: string | null): string {
  if (descName) return descName
  const mapped = MOD_KEY_LABEL[key]
  if (mapped) return mapped
  warnUnresolvedModKey(key)
  return key
}
