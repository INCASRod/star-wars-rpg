// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Derived Stats Engine
//
// Computes a character's effective stats from their talents, armor, and item
// attachments. All computation is client-side at render time — nothing is
// written back to the database. Derived values are a pure function of the
// character data passed in.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Character,
  CharacterTalent,
  CharacterArmor,
  CharacterGear,
  CharacterWeapon,
  RefTalent,
  RefArmor,
  RefGear,
  RefWeapon,
  RefWeaponQuality,
  RefItemAttachment,
  RefCyberneticEffect,
  AttachmentModEntry,
  WeaponQuality,
  SpeciesAbility,
} from './types'

// ── Owned-rank derivation ──────────────────────────────────────────────────────

/**
 * Sum of ranks matching a predicate across a set of purchase records
 * (character_talents, character_force_abilities, etc.) — shared so every call
 * site deriving an owned rank/count total (Force Rating, purchase-notification
 * labels, rank pips) filters the same way instead of re-implementing
 * filter+reduce inline. Defaults to counting matching rows (ranksOf → 1) for
 * record types with no per-row `ranks` column.
 */
export function countOwnedRanks<T>(
  records: T[],
  matches: (record: T) => boolean,
  ranksOf: (record: T) => number = () => 1,
): number {
  return records.reduce((sum, r) => matches(r) ? sum + ranksOf(r) : sum, 0)
}

// ── Weapon attachment helpers ─────────────────────────────────────────────────

function isAttModArray(v: unknown): v is AttachmentModEntry[] {
  return Array.isArray(v)
}

export interface EffectiveWeaponStats {
  /** Flat damage value (after attachment DAMADD/DAMSUB; not brawn-based) */
  damage: number
  /** damage_add for brawn-based weapons (Melee/Brawl/Lightsaber) */
  damage_add: number | null
  /** Crit rating after attachment CRITADD/CRITSUB */
  crit: number
  /** Merged quality array: base weapon + attachment quality mods */
  qualities: WeaponQuality[]
}

/**
 * Compute effective weapon stats by merging attachment base_mods
 * (and any installed added_mods) into the weapon's base values.
 *
 * @param refWeapon        - Base weapon ref row
 * @param attachments      - Attachment refs to apply (in order)
 * @param installedAddedModIndicesByKey - Map of attKey → array of added-mod indices installed
 */
export function computeEffectiveWeaponStats(
  refWeapon: RefWeapon,
  attachments: RefItemAttachment[],
  installedAddedModIndicesByKey: Record<string, number[]> = {},
): EffectiveWeaponStats {
  let damage     = refWeapon.damage ?? 0
  let damage_add = refWeapon.damage_add ?? null
  let crit       = refWeapon.crit ?? 4

  // Build a mutable quality map keyed by quality key
  const qualMap: Record<string, number> = {}
  if (Array.isArray(refWeapon.qualities)) {
    for (const q of refWeapon.qualities) {
      qualMap[q.key] = (qualMap[q.key] ?? 0) + (q.count ?? 1)
    }
  }

  const applyMod = (entry: AttachmentModEntry) => {
    if (!entry.key) return
    const n = entry.count ?? 1
    switch (entry.key) {
      case 'DAMADD':   damage += n;              break
      case 'DAMSUB':   damage -= n;              break
      case 'DAMSET':   damage = n;               break
      case 'CRITADD':  crit   += n;              break
      case 'CRITSUB':  crit   = Math.max(1, crit - n); break
      case 'CRITSET':  crit   = n;               break
      default:
        // Assume any other non-null key with count > 0 is a quality mod
        if (n > 0) qualMap[entry.key] = (qualMap[entry.key] ?? 0) + n
    }
  }

  for (const att of attachments) {
    if (isAttModArray(att.base_mods)) {
      for (const entry of att.base_mods) applyMod(entry)
    }
    const installedIndices = installedAddedModIndicesByKey[att.key] ?? []
    if (isAttModArray(att.added_mods)) {
      for (const idx of installedIndices) {
        const entry = att.added_mods[idx]
        if (entry) applyMod(entry)
      }
    }
  }

  const qualities: WeaponQuality[] = Object.entries(qualMap)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, count }))

  return { damage, damage_add, crit, qualities }
}

// ── Public types ─────────────────────────────────────────────────────────────

export interface SkillDiceModifier {
  /** Additional boost dice from talents / gear */
  boostAdd: number
  /** Setback dice removed by talents / gear */
  setbackRemove: number
  /** Talent / gear names that contribute (for tooltip display) */
  sources: string[]
}

export interface CharacterModifiers {
  soakBonus: number
  defenseMelee: number
  defenseRanged: number
  woundThresholdBonus: number
  strainThresholdBonus: number
  forceRatingBonus: number
  /** keyed by skill key (e.g. 'COOL', 'LEAD', 'STEAL') */
  skillModifiers: Record<string, SkillDiceModifier>
}

export interface EffectiveStats {
  /** brawn + armor soak + talent bonuses */
  soak: number
  /** armor melee def + talent bonuses */
  defenseMelee: number
  /** armor ranged def + talent bonuses */
  defenseRanged: number
  /** base + talent bonuses */
  woundThreshold: number
  /** base + talent bonuses */
  strainThreshold: number
  /** base (career + FORCERAT) + talent bonuses */
  forceRating: number
}

/** One line of a per-stat breakdown tooltip */
export interface StatSource {
  label: string
  value: number
  /** Optional origin tag, set at push sites — additive, does not affect any computed value. */
  kind?: 'item' | 'attachment' | 'talent' | 'species' | 'base'
}

/**
 * One characteristic's or skill's render-time layering: the value stored on
 * the character row, plus whatever installed cybernetics add on top.
 *
 * `base` is ALREADY fully resolved through XP purchase and Dedication — both
 * of those write straight to `characters.<field>` at purchase time. The
 * cybernetic layer is the one that is NEVER written back: it is recomputed
 * every render from the installed implants.
 */
export interface StatLayer {
  /** characters.<field> / character_skills.rank as stored. */
  base: number
  /** Amount installed cybernetics actually add, already clamped. */
  cyberneticBonus: number
  /** base + cyberneticBonus. */
  effective: number
  /** Ready-made attribution copy, e.g. "base 6 + cybernetic +1 = 7". */
  label: string
}

export interface DerivedStatsResult {
  effectiveStats: EffectiveStats
  modifiers: CharacterModifiers
  /** Per-stat source arrays, used by tooltip breakdowns */
  breakdown: {
    soak: StatSource[]
    defenseMelee: StatSource[]
    defenseRanged: StatSource[]
    woundThreshold: StatSource[]
    strainThreshold: StatSource[]
    forceRating: StatSource[]
  }
  /** Installed-implant roster, cap/usage counters and raw bonus maps. */
  cybernetics: CyberneticsResult
  /** Keyed BRAWN/AGILITY/INTELLECT/CUNNING/WILLPOWER/PRESENCE. */
  characteristics: Record<string, StatLayer>
  /** Keyed by ref_skills.key — only skills an implant touches get an entry. */
  skillLayers: Record<string, StatLayer>
}

/** Compose one StatLayer. The clamp already happened in
 *  computeCyberneticEffects — this only adds, deliberately, so the ceiling
 *  lives in exactly one place. */
function statLayer(base: number, cyberneticBonus: number): StatLayer {
  const effective = base + cyberneticBonus
  return {
    base, cyberneticBonus, effective,
    label: cyberneticBonus > 0
      ? `base ${base} + cybernetic +${cyberneticBonus} = ${effective}`
      : `base ${base}`,
  }
}

// ── Cybernetics (migration 135) ──────────────────────────────────────────────

/**
 * The `character_gear.equip_slot` value marking an implant as surgically
 * INSTALLED, and the `ref_gear.worn_anchor` value marking a catalogue row as
 * an implant. Deliberately the same string in both places — see migration
 * 135's header for why `equip_slot` was reused instead of a new column.
 */
export const CYBERNETIC_ANCHOR = 'cybernetics'

/** RAW ceilings. A cybernetic bonus can never push a stat past these. */
export const CHARACTERISTIC_MAX = 7
export const SKILL_MAX = 6

/** Implant cap for a droid, which does not use Brawn (EotE CRB p.173). */
const DROID_IMPLANT_CAP = 6

/** The only two implant-cap modifiers in the game. See migration 135's header. */
const BIOFEEDBACK_REGULATOR_KEY = 'BIOFEEDREG'
const MORE_MACHINE_TALENT_KEY   = 'MOREMACH'

/**
 * Installed = equipped, not dropped, and sitting in the cybernetics slot.
 * Dropping and selling are SOFT deletes in this schema (the row survives with
 * is_dropped = true and its old equip_state intact), so the is_dropped check
 * is load-bearing, not defensive — without it a sold implant keeps applying.
 */
export function isInstalledCybernetic(
  gear: Pick<CharacterGear, 'equip_state' | 'is_equipped' | 'equip_slot'> & { is_dropped?: boolean },
  ref: Pick<RefGear, 'worn_anchor'> | undefined,
): boolean {
  if (!ref || ref.worn_anchor !== CYBERNETIC_ANCHOR) return false
  if (isDropped(gear)) return false
  if (itemState(gear) !== 'equipped') return false
  return gear.equip_slot === CYBERNETIC_ANCHOR
}

export interface InstalledCybernetic {
  /** character_gear.id */
  id: string
  gearKey: string
  label: string
  countsTowardCap: boolean
}

export interface CyberneticsResult {
  installed: InstalledCybernetic[]
  /** (droid ? 6 : Brawn) + Biofeedback Regulator + More Machine Than Man ranks */
  implantCap: number
  /** Count of installed implants whose effects are counts_toward_cap. */
  implantsUsed: number
  /** True when implantsUsed exceeds implantCap — a WARNING, never a block. */
  overCap: boolean
  /** Keyed by characteristic key (BRAWN, AGILITY, …), already clamped to CHARACTERISTIC_MAX. */
  characteristicBonuses: Record<string, number>
  /** Keyed by ref_skills.key, already clamped to SKILL_MAX. */
  skillBonuses: Record<string, number>
  /** Talent ranks granted by implants, keyed by ref_talents.key. */
  talentGrants: Record<string, number>
  soakBonus: number
  defenseBonus: number
  woundThresholdBonus: number
  strainThresholdBonus: number
  /** needs_review / narrative effects, for rules-text display only. */
  textEffects: { gearKey: string; label: string; notes: string | null }[]
  /** Per-stat attribution lines, same shape the stat tooltips already consume. */
  sources: StatSource[]
}

/**
 * Apply every installed implant's structured effects.
 *
 * Clamping: bonuses are clamped against the character's CURRENT value, so the
 * returned characteristic/skill bonus is the amount that actually lands, not
 * the amount RAW would grant — a Brawn 7 character installing Mod II
 * cyberlegs gets +0, not +1 with the overflow hidden downstream.
 *
 * Stacking: effects sharing a `stack_group` apply ONCE no matter how many
 * copies are installed (RAW: "the modifiers from both arms do not stack";
 * cyberlegs are bought as a pair for a single bonus).
 *
 * Pure: no Supabase calls, no React, no hooks.
 */
export function computeCyberneticEffects(
  character: Pick<Character, 'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence' | 'species_key'>,
  gear: CharacterGear[],
  refGearMap: Record<string, Pick<RefGear, 'name' | 'worn_anchor'>>,
  effects: RefCyberneticEffect[],
  characterTalents: Pick<CharacterTalent, 'talent_key' | 'ranks'>[] = [],
  skillRanks: Record<string, number> = {},
): CyberneticsResult {
  const effectsByKey = new Map<string, RefCyberneticEffect[]>()
  for (const e of effects) {
    effectsByKey.set(e.gear_key, [...(effectsByKey.get(e.gear_key) ?? []), e])
  }

  const installed: InstalledCybernetic[] = []
  for (const g of gear) {
    const ref = refGearMap[g.gear_key]
    if (!isInstalledCybernetic(g, ref)) continue
    const rows = effectsByKey.get(g.gear_key) ?? []
    installed.push({
      id: g.id,
      gearKey: g.gear_key,
      label: g.custom_name || ref?.name || g.gear_key,
      // An implant with no seeded effect rows at all still occupies a slot.
      countsTowardCap: rows.length === 0 || rows.some(r => r.counts_toward_cap),
    })
  }

  // ── Implant cap ───────────────────────────────────────────────────────────
  const isDroid = character.species_key === 'DROID'
  let implantCap = isDroid ? DROID_IMPLANT_CAP : character.brawn
  if (installed.some(i => i.gearKey === BIOFEEDBACK_REGULATOR_KEY)) {
    const bio = (effectsByKey.get(BIOFEEDBACK_REGULATOR_KEY) ?? []).find(e => e.value != null)
    implantCap += bio?.value ?? 2
  }
  implantCap += countOwnedRanks(
    characterTalents,
    t => t.talent_key === MORE_MACHINE_TALENT_KEY,
    t => t.ranks ?? 1,
  )

  const implantsUsed = installed.filter(i => i.countsTowardCap).length

  // ── Effects ───────────────────────────────────────────────────────────────
  const characteristicBonuses: Record<string, number> = {}
  const skillBonuses: Record<string, number> = {}
  const talentGrants: Record<string, number> = {}
  const textEffects: CyberneticsResult['textEffects'] = []
  const sources: StatSource[] = []
  let soakBonus = 0
  let defenseBonus = 0
  let woundThresholdBonus = 0
  let strainThresholdBonus = 0

  const baseCharacteristic: Record<string, number> = {
    BRAWN: character.brawn, AGILITY: character.agility, INTELLECT: character.intellect,
    CUNNING: character.cunning, WILLPOWER: character.willpower, PRESENCE: character.presence,
  }

  const spentStackGroups = new Set<string>()

  for (const item of installed) {
    for (const e of effectsByKey.get(item.gearKey) ?? []) {
      if (e.effect_type === 'text' || e.needs_review) {
        textEffects.push({ gearKey: item.gearKey, label: item.label, notes: e.notes })
        continue
      }
      if (e.stack_group) {
        if (spentStackGroups.has(e.stack_group)) continue
        spentStackGroups.add(e.stack_group)
      }
      const n = e.value ?? 0
      if (!n) continue

      switch (e.effect_type) {
        case 'characteristic': {
          if (!e.target) break
          const current = (baseCharacteristic[e.target] ?? 0) + (characteristicBonuses[e.target] ?? 0)
          const applied = Math.max(0, Math.min(n, CHARACTERISTIC_MAX - current))
          if (!applied) break
          characteristicBonuses[e.target] = (characteristicBonuses[e.target] ?? 0) + applied
          sources.push({ label: item.label, value: applied, kind: 'item' })
          break
        }
        case 'skill': {
          if (!e.target) break
          const current = (skillRanks[e.target] ?? 0) + (skillBonuses[e.target] ?? 0)
          const applied = Math.max(0, Math.min(n, SKILL_MAX - current))
          if (!applied) break
          skillBonuses[e.target] = (skillBonuses[e.target] ?? 0) + applied
          sources.push({ label: item.label, value: applied, kind: 'item' })
          break
        }
        case 'talent':
          if (!e.target) break
          talentGrants[e.target] = (talentGrants[e.target] ?? 0) + n
          break
        case 'soak':             soakBonus            += n; sources.push({ label: item.label, value: n, kind: 'item' }); break
        case 'defense':          defenseBonus         += n; sources.push({ label: item.label, value: n, kind: 'item' }); break
        case 'wound_threshold':  woundThresholdBonus  += n; sources.push({ label: item.label, value: n, kind: 'item' }); break
        case 'strain_threshold': strainThresholdBonus += n; sources.push({ label: item.label, value: n, kind: 'item' }); break
      }
    }
  }

  return {
    installed, implantCap, implantsUsed, overCap: implantsUsed > implantCap,
    characteristicBonuses, skillBonuses, talentGrants,
    soakBonus, defenseBonus, woundThresholdBonus, strainThresholdBonus,
    textEffects, sources,
  }
}

// ── Encumbrance ──────────────────────────────────────────────────────────────

/**
 * Machine-readable reason a per-item cost/gain was suppressed by the worn-
 * rules exclusivity checks (Prompt 2, Task 3). Display copy is composed by
 * the UI from this enum — never stored as text here.
 */
export type EncumbranceSuppressReason =
  | 'anchor_occupied_armor'    // a 2nd+ equipped armor suit on the same worn_anchor: pays full enc, no −3 reduction
  | 'anchor_occupied_capacity' // a 2nd+ equipped bonus item on the same worn_anchor: grants +0 threshold

export interface EncumbranceItemResult {
  /** Encumbrance this item actually contributes to load (0 if stowed). */
  cost: number
  /** Threshold bonus this item actually grants (0 if none, not equipped, or suppressed). */
  gain: number
  reason: EncumbranceSuppressReason | null
  suppressed: boolean
}

export interface EncumbranceSource {
  id: string
  label: string
  /** For a suppressed capacity source, the bonus that was DENIED (not counted in wornCapacity).
   *  For a suppressed load source, the full (undiscounted) cost actually charged. */
  value: number
  reason: EncumbranceSuppressReason | null
  suppressed: boolean
  /** Which character_* table this item's id belongs to — lets a UI re-run
   *  the simulation for exactly this item without a separate lookup. */
  type: 'weapon' | 'armor' | 'gear'
}

export interface EncumbranceStats {
  /** 5 + Brawn */
  base: number
  /** Sum of granted (non-suppressed) encumbrance_bonus from equipped items */
  wornCapacity: number
  /** Sum of encumbrance actually contributed by carried/equipped items */
  load: number
  /** base + wornCapacity */
  threshold: number
  /** threshold + Brawn — encumbered by >= Brawn loses the free maneuver (RAW) */
  cliff: number
  /** Per-item result keyed by character_{weapons,armor,gear}.id */
  perItem: Record<string, EncumbranceItemResult>
  /** One entry per equipped item with a ref encumbrance_bonus, granted or suppressed */
  capacitySources: EncumbranceSource[]
  /** One entry per item contributing load (carried or equipped, cost > 0) */
  loadSources: EncumbranceSource[]
}

function itemState(x: { equip_state?: string; is_equipped: boolean }): string {
  return x.equip_state ?? (x.is_equipped ? 'equipped' : 'carrying')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDropped(x: any): boolean {
  return !!x?.is_dropped
}

/** Deterministic "first" within an anchor group — by item id (no equipped-at
 *  timestamp exists in the schema; ordering by id keeps the ledger stable
 *  across re-renders instead of flickering on array order). */
function sortById<T extends { id: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Compute encumbrance load/threshold/cliff for a character, with the two
 * worn-rules exclusivity checks (Prompt 2, Task 3):
 *   Rule A — equipped armor reduces its OWN encumbrance by 3 (floor 0), but
 *            only the first equipped suit per worn_anchor; a 2nd on the same
 *            anchor pays full cost (reason 'anchor_occupied_armor'). Armor
 *            with no worn_anchor always gets the reduction, no exclusivity.
 *   Rule B — encumbrance_bonus counts only when equipped AND first on its
 *            worn_anchor; duplicates grant +0 (reason 'anchor_occupied_capacity')
 *            and still cost their own encumbrance. Bonus items with no
 *            worn_anchor always count, no exclusivity.
 * Both rules WARN, never block — the item stays equipped either way.
 * Pure: no Supabase calls, no React, no hooks.
 */
export function computeEncumbranceStats(
  character: Pick<Character, 'brawn'>,
  armor:   CharacterArmor[],
  refArmorMap:  Record<string, Pick<RefArmor, 'name' | 'encumbrance' | 'encumbrance_bonus' | 'worn_anchor'>>,
  gear:    CharacterGear[],
  refGearMap:   Record<string, Pick<RefGear, 'name' | 'encumbrance' | 'encumbrance_bonus' | 'worn_anchor'>>,
  weapons: CharacterWeapon[],
  refWeaponMap: Record<string, Pick<RefWeapon, 'name' | 'encumbrance'>>,
): EncumbranceStats {
  const perItem: Record<string, EncumbranceItemResult> = {}
  const capacitySources: EncumbranceSource[] = []
  const loadSources: EncumbranceSource[] = []

  const liveArmor = armor.filter(a => !isDropped(a))
  const liveGear  = gear.filter(g => !isDropped(g))
  const liveWeapons = weapons.filter(w => !isDropped(w))

  // ── Rule A: first equipped armor suit per worn_anchor gets the −3 reduction ──
  const equippedArmorByAnchor = new Map<string, CharacterArmor[]>()
  for (const a of liveArmor) {
    if (itemState(a) !== 'equipped') continue
    const anchor = refArmorMap[a.armor_key]?.worn_anchor
    if (!anchor) continue
    equippedArmorByAnchor.set(anchor, [...(equippedArmorByAnchor.get(anchor) ?? []), a])
  }
  const armorReductionWinnerIds = new Set<string>()
  for (const group of equippedArmorByAnchor.values()) {
    armorReductionWinnerIds.add(sortById(group)[0].id)
  }

  // ── Rule B: first equipped bonus item per worn_anchor grants its bonus ──
  type BonusCarrier = { id: string; anchor: string }
  const equippedBonusByAnchor = new Map<string, BonusCarrier[]>()
  for (const a of liveArmor) {
    if (itemState(a) !== 'equipped') continue
    const ref = refArmorMap[a.armor_key]
    if (!ref?.encumbrance_bonus || !ref.worn_anchor) continue
    equippedBonusByAnchor.set(ref.worn_anchor, [...(equippedBonusByAnchor.get(ref.worn_anchor) ?? []), { id: a.id, anchor: ref.worn_anchor }])
  }
  for (const g of liveGear) {
    if (itemState(g) !== 'equipped') continue
    const ref = refGearMap[g.gear_key]
    if (!ref?.encumbrance_bonus || !ref.worn_anchor) continue
    equippedBonusByAnchor.set(ref.worn_anchor, [...(equippedBonusByAnchor.get(ref.worn_anchor) ?? []), { id: g.id, anchor: ref.worn_anchor }])
  }
  const bonusWinnerIds = new Set<string>()
  for (const group of equippedBonusByAnchor.values()) {
    bonusWinnerIds.add(sortById(group)[0].id)
  }

  let load = 0
  let wornCapacity = 0

  for (const a of liveArmor) {
    const state = itemState(a)
    const ref = refArmorMap[a.armor_key]
    const enc = ref?.encumbrance || 0
    const label = a.custom_name || ref?.name || a.armor_key

    let cost = 0
    let costReason: EncumbranceSuppressReason | null = null
    if (state !== 'stowed') {
      if (state === 'equipped') {
        const anchor = ref?.worn_anchor
        const getsReduction = !anchor || armorReductionWinnerIds.has(a.id)
        cost = getsReduction ? Math.max(0, enc - 3) : enc
        if (anchor && !getsReduction) costReason = 'anchor_occupied_armor'
      } else {
        cost = enc
      }
      load += cost
      loadSources.push({ id: a.id, label, value: cost, reason: costReason, suppressed: costReason !== null, type: 'armor' })
    }

    let gain = 0
    let gainReason: EncumbranceSuppressReason | null = null
    if (state === 'equipped' && ref?.encumbrance_bonus) {
      const winner = !ref.worn_anchor || bonusWinnerIds.has(a.id)
      gain = winner ? ref.encumbrance_bonus : 0
      if (!winner) gainReason = 'anchor_occupied_capacity'
      wornCapacity += gain
      capacitySources.push({ id: a.id, label, value: winner ? gain : ref.encumbrance_bonus, reason: gainReason, suppressed: !winner, type: 'armor' })
    }

    perItem[a.id] = { cost, gain, reason: costReason ?? gainReason, suppressed: costReason !== null || gainReason !== null }
  }

  for (const g of liveGear) {
    const state = itemState(g)
    const ref = refGearMap[g.gear_key]
    // NULL-encumbrance rule (migration 134): MOD and CYBERNETIC catalogue rows
    // are seeded with `encumbrance = NULL` — a loose mod weighs nothing. The
    // `|| 0` below is that rule, and this is the ONLY place it is applied.
    // Do NOT scatter `?? 0` fallbacks at call sites; every encumbrance number
    // the app shows comes out of this function.
    const enc = (ref?.encumbrance || 0) * (g.quantity || 1)
    const label = g.custom_name || ref?.name || g.gear_key

    // Installed cybernetics are inside the character, not carried on them —
    // they contribute no load and appear in no load source list. (Every
    // seeded Cybernetics row happens to be encumbrance 0 today, so this is
    // belt-and-braces against a future custom implant with a weight.)
    const installedCybernetic = isInstalledCybernetic(g, ref)

    let cost = 0
    if (state !== 'stowed' && !installedCybernetic) {
      cost = enc
      load += cost
      loadSources.push({ id: g.id, label, value: cost, reason: null, suppressed: false, type: 'gear' })
    }

    let gain = 0
    let gainReason: EncumbranceSuppressReason | null = null
    if (state === 'equipped' && ref?.encumbrance_bonus) {
      const winner = !ref.worn_anchor || bonusWinnerIds.has(g.id)
      gain = winner ? ref.encumbrance_bonus : 0
      if (!winner) gainReason = 'anchor_occupied_capacity'
      wornCapacity += gain
      capacitySources.push({ id: g.id, label, value: winner ? gain : ref.encumbrance_bonus, reason: gainReason, suppressed: !winner, type: 'gear' })
    }

    perItem[g.id] = { cost, gain, reason: gainReason, suppressed: gainReason !== null }
  }

  for (const w of liveWeapons) {
    const state = itemState(w)
    const ref = refWeaponMap[w.weapon_key]
    const label = w.custom_name || ref?.name || w.weapon_key
    let cost = 0
    if (state !== 'stowed') {
      cost = ref?.encumbrance || 0
      load += cost
      loadSources.push({ id: w.id, label, value: cost, reason: null, suppressed: false, type: 'weapon' })
    }
    perItem[w.id] = { cost, gain: 0, reason: null, suppressed: false }
  }

  const base = 5 + character.brawn
  const threshold = base + wornCapacity
  const cliff = threshold + character.brawn

  return { base, wornCapacity, load, threshold, cliff, perItem, capacitySources, loadSources }
}

// ── Engine ───────────────────────────────────────────────────────────────────

/**
 * Compute all derived stats for a character.
 *
 * @param character          - Raw character row
 * @param forceRatingBase    - Pre-computed base force rating (career + FORCERAT talent + deliberate purchase) — the additive starting point for effectiveStats.forceRating
 * @param careerForceRatingBase - Career-only force rating (excludes FORCERAT talent ranks and the deliberate purchase). Used only to gate `force_rating_conditional` talents (e.g. WITCHCRAFT) — those grant their bonus when the character's career doesn't already grant a free Force Rating, and stack independently with FORCERAT/purchased Force Rating.
 * @param characterTalents   - All talents owned by this character
 * @param refTalentMap       - ref_talents keyed by talent key
 * @param equippedArmor      - All armor items (the engine filters to equipped only)
 * @param refArmorMap        - ref_armor keyed by armor key
 * @param refAttachmentMap      - ref_item_attachments keyed by key (may be empty)
 * @param characterWeapons      - All weapons owned by this character
 * @param refWeaponMap          - ref_weapons keyed by weapon key
 * @param refWeaponQualityMap   - ref_weapon_qualities keyed by quality key
 */
export function computeDerivedStats(
  character: Character,
  forceRatingBase: number,
  careerForceRatingBase: number,
  characterTalents: CharacterTalent[],
  refTalentMap: Record<string, RefTalent>,
  equippedArmor: CharacterArmor[],
  refArmorMap: Record<string, RefArmor>,
  refAttachmentMap: Record<string, RefItemAttachment>,
  characterWeapons: CharacterWeapon[] = [],
  refWeaponMap: Record<string, RefWeapon> = {},
  refWeaponQualityMap: Record<string, RefWeaponQuality> = {},
  speciesAbilities: SpeciesAbility[] = [],
  moralitySystem: 'vanilla' | 'force_presence' = 'vanilla',
  // ── Cybernetics layer (migration 135/136) ───────────────────────────────
  // Optional so every existing call site keeps working unchanged: with no
  // gear/effects the layer computes an empty CyberneticsResult and adds zero
  // to everything.
  characterGear: CharacterGear[] = [],
  refGearMap: Record<string, RefGear> = {},
  cyberneticEffects: RefCyberneticEffect[] = [],
  skillRanks: Record<string, number> = {},
): DerivedStatsResult {

  const mods: CharacterModifiers = {
    soakBonus: 0,
    defenseMelee: 0,
    defenseRanged: 0,
    woundThresholdBonus: 0,
    strainThresholdBonus: 0,
    forceRatingBonus: 0,
    skillModifiers: {},
  }

  // ── Breakdown source arrays for tooltip display ───────────────────────────
  const soakSources: StatSource[]    = [{ label: 'Brawn', value: character.brawn, kind: 'base' }]
  const defMSources: StatSource[]    = []
  const defRSources: StatSource[]    = []
  // Base entries are deferred — talent loop adds to woundThresholdBonus / strainThresholdBonus,
  // so we prepend the true species/class base AFTER the loop to avoid an inflated Base value.
  const woundSources: StatSource[]   = []
  const strainSources: StatSource[]  = []
  const forceSources: StatSource[]   = forceRatingBase > 0
    ? [{ label: 'Career / Force talents', value: forceRatingBase }]
    : []

  // ── Step 2: Armor modifiers ───────────────────────────────────────────────
  const worn = equippedArmor.filter(a => a.equip_state === 'equipped' || a.is_equipped)

  for (const piece of worn) {
    const ref = refArmorMap[piece.armor_key]
    if (!ref) continue

    // Prefer migration-018 columns; fall back to legacy columns
    const soakB  = ref.soak_bonus    ?? ref.soak    ?? 0
    const defM   = ref.defense_melee ?? ref.defense  ?? 0
    const defR   = ref.defense_ranged ?? ref.defense  ?? 0
    const label  = piece.custom_name || ref.name

    if (soakB > 0) {
      mods.soakBonus += soakB
      soakSources.push({ label, value: soakB, kind: 'item' })
    }
    if (defM > 0) {
      mods.defenseMelee += defM
      defMSources.push({ label, value: defM, kind: 'item' })
    }
    if (defR > 0) {
      mods.defenseRanged += defR
      defRSources.push({ label, value: defR, kind: 'item' })
    }
  }

  // ── Step 3: Item attachment modifiers ─────────────────────────────────────
  // Attachments are stored inline as unknown[] on character_armor/gear rows.
  // We only process attachments whose ref entry has a key field we can look up.
  for (const piece of worn) {
    if (!Array.isArray(piece.attachments)) continue
    for (const att of piece.attachments) {
      const attKey = (att as { key?: string })?.key
      if (!attKey) continue
      const ref = refAttachmentMap[attKey]
      if (!ref?.base_mods) continue
      // Handle both legacy flat-object format and new array format
      if (isAttModArray(ref.base_mods)) {
        // New array format: derive armor stats from known keys
        for (const entry of ref.base_mods) {
          if (!entry.key || !entry.count) continue
          const n = entry.count
          if (entry.key === 'SOAKADD')    { mods.soakBonus           += n; soakSources.push({ label: ref.name, value: n, kind: 'attachment' }) }
          if (entry.key === 'DEFADD')     { mods.defenseMelee += n; mods.defenseRanged += n; defMSources.push({ label: ref.name, value: n, kind: 'attachment' }); defRSources.push({ label: ref.name, value: n, kind: 'attachment' }) }
          if (entry.key === 'STRAINADD')  { mods.strainThresholdBonus += n; strainSources.push({ label: ref.name, value: n, kind: 'attachment' }) }
          if (entry.key === 'WOUNDADD')   { mods.woundThresholdBonus  += n; woundSources.push({ label: ref.name, value: n, kind: 'attachment' }) }
        }
      } else {
        // Legacy flat-object format
        const m = ref.base_mods
        if (m.soakAdd)            { mods.soakBonus           += m.soakAdd;            soakSources.push({ label: ref.name, value: m.soakAdd, kind: 'attachment' }) }
        if (m.defenseMeleeAdd)    { mods.defenseMelee         += m.defenseMeleeAdd;    defMSources.push({ label: ref.name, value: m.defenseMeleeAdd, kind: 'attachment' }) }
        if (m.defenseRangedAdd)   { mods.defenseRanged        += m.defenseRangedAdd;   defRSources.push({ label: ref.name, value: m.defenseRangedAdd, kind: 'attachment' }) }
        if (m.woundThresholdAdd)  { mods.woundThresholdBonus  += m.woundThresholdAdd;  woundSources.push({ label: ref.name, value: m.woundThresholdAdd, kind: 'attachment' }) }
        if (m.strainThresholdAdd) { mods.strainThresholdBonus += m.strainThresholdAdd; strainSources.push({ label: ref.name, value: m.strainThresholdAdd, kind: 'attachment' }) }
      }
    }
  }

  // ── Step 2b: Equipped weapon quality modifiers ────────────────────────────
  const equippedWeapons = characterWeapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)

  for (const cw of equippedWeapons) {
    const refW = refWeaponMap[cw.weapon_key]
    if (!Array.isArray(refW?.qualities)) continue
    const weaponLabel = cw.custom_name || refW.name
    for (const q of refW.qualities) {
      const refQ = refWeaponQualityMap[q.key]
      if (!refQ?.stat_modifier) continue
      const count = q.count ?? 1
      const sm = refQ.stat_modifier
      if (sm.defenseMelee) {
        const val = sm.defenseMelee * count
        mods.defenseMelee += val
        defMSources.push({ label: `${weaponLabel} (${refQ.name} ${count})`, value: val, kind: 'item' })
      }
      if (sm.defenseRanged) {
        const val = sm.defenseRanged * count
        mods.defenseRanged += val
        defRSources.push({ label: `${weaponLabel} (${refQ.name} ${count})`, value: val, kind: 'item' })
      }
    }
  }

  // ── Track soak after armor (needed for talent requirements) ───────────────
  const soakAfterArmor = character.brawn + mods.soakBonus

  // ── Step 4: Talent modifiers ──────────────────────────────────────────────
  for (const talent of characterTalents) {
    // FORCERAT ranks are already folded into forceRatingBase (useCharacterData's
    // forceRating memo) — applying its modifiers.force_rating here again would
    // double-count it.
    if (talent.talent_key === 'FORCERAT') continue
    const ref = refTalentMap[talent.talent_key]
    if (!ref?.attributes && !ref?.die_modifiers && !ref?.modifiers) continue

    const rank = talent.ranks ?? 1

    // Requirement checks
    if (ref.requirements?.wearingArmor && worn.length === 0) continue
    if (ref.requirements?.soakAtLeast != null && soakAfterArmor < ref.requirements.soakAtLeast) continue

    // Stat attribute modifiers — prefer migration-017 `attributes` shape; fall back
    // to legacy `modifiers` for talents (e.g. WITCHCRAFT) not yet backfilled.
    const rankLabel = rank > 1 ? ` ×${rank}` : ''
    if (ref.attributes) {
      const a = ref.attributes
      const soakVal   = (a.soakValue        ?? 0) * rank
      const defMVal   = (a.defenseMelee     ?? 0) * rank
      const defRVal   = (a.defenseRanged    ?? 0) * rank
      const woundVal  = (a.woundThreshold   ?? 0) * rank
      const strainVal = (a.strainThreshold  ?? 0) * rank
      const forceVal  = (a.forceRating      ?? 0) * rank

      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal, kind: 'talent' }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal, kind: 'talent' }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal, kind: 'talent' }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal, kind: 'talent' }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal, kind: 'talent' }) }
      if (forceVal)  { mods.forceRatingBonus     += forceVal;  forceSources.push({ label: ref.name + rankLabel, value: forceVal }) }
    } else if (ref.modifiers) {
      // Legacy modifiers shape (snake_case) — used by some OggDude-imported talents
      const m = ref.modifiers
      const soakVal   = (m.soak             ?? 0) * rank
      const defMVal   = (m.defense_melee    ?? 0) * rank
      const defRVal   = (m.defense_ranged   ?? 0) * rank
      const woundVal  = (m.wound_threshold  ?? 0) * rank
      const strainVal = (m.strain_threshold ?? 0) * rank
      // Conditional FR talent (e.g. Witchcraft): only applies if the career doesn't
      // already grant a free Force Rating. Stacks independently with FORCERAT talent
      // ranks and the deliberate Force Rating purchase — checked against
      // careerForceRatingBase (career only), not forceRatingBase (which includes those).
      const rawForceVal = (m.force_rating ?? 0) * rank
      const forceVal = m.force_rating_conditional && careerForceRatingBase > 0 ? 0 : rawForceVal

      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal, kind: 'talent' }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal, kind: 'talent' }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal, kind: 'talent' }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal, kind: 'talent' }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal, kind: 'talent' }) }
      if (forceVal)  { mods.forceRatingBonus     += forceVal;  forceSources.push({ label: ref.name + rankLabel, value: forceVal }) }
    }

    // Dice modifier effects
    if (ref.die_modifiers) {
      for (const dm of ref.die_modifiers) {
        const existing = mods.skillModifiers[dm.skillKey] ?? { boostAdd: 0, setbackRemove: 0, sources: [] }
        const rankLabel = rank > 1 ? ` (Rank ${rank})` : ''
        existing.boostAdd      += (dm.boostCount   ?? 0) * rank
        existing.setbackRemove += (dm.setbackCount ?? 0) * rank
        existing.sources.push(ref.name + rankLabel)
        mods.skillModifiers[dm.skillKey] = existing
      }
    }
  }

  // ── Step 4b: Species talent_rank ability stat modifiers ──────────────────────
  // Species abilities that grant a free talent rank (e.g. Dathomirian → Outdoorsman,
  // Hutt → Enduring) apply that talent's stat modifiers as if it were purchased.
  for (const sa of speciesAbilities) {
    if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue
    // Same double-count guard as the owned-talent loop above.
    if (sa.talent_key === 'FORCERAT') continue
    const ref = refTalentMap[sa.talent_key]
    if (!ref?.modifiers && !ref?.attributes) continue
    const rank = sa.rank_add ?? 1
    const rankLabel = ` (Species)`
    if (ref.attributes) {
      const a = ref.attributes
      const soakVal   = (a.soakValue       ?? 0) * rank
      const defMVal   = (a.defenseMelee    ?? 0) * rank
      const defRVal   = (a.defenseRanged   ?? 0) * rank
      const woundVal  = (a.woundThreshold  ?? 0) * rank
      const strainVal = (a.strainThreshold ?? 0) * rank
      const forceVal  = (a.forceRating     ?? 0) * rank
      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal, kind: 'species' }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal, kind: 'species' }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal, kind: 'species' }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal, kind: 'species' }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal, kind: 'species' }) }
      if (forceVal)  { mods.forceRatingBonus     += forceVal;  forceSources.push({ label: ref.name + rankLabel, value: forceVal }) }
    } else if (ref.modifiers) {
      const m = ref.modifiers
      const soakVal   = (m.soak             ?? 0) * rank
      const defMVal   = (m.defense_melee    ?? 0) * rank
      const defRVal   = (m.defense_ranged   ?? 0) * rank
      const woundVal  = (m.wound_threshold  ?? 0) * rank
      const strainVal = (m.strain_threshold ?? 0) * rank
      const rawForceVal = (m.force_rating ?? 0) * rank
      const forceVal = m.force_rating_conditional && forceRatingBase > 0 ? 0 : rawForceVal
      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal, kind: 'species' }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal, kind: 'species' }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal, kind: 'species' }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal, kind: 'species' }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal, kind: 'species' }) }
      if (forceVal)  { mods.forceRatingBonus     += forceVal;  forceSources.push({ label: ref.name + rankLabel, value: forceVal }) }
    }
  }

  // ── Prepend true Base entries now that talent bonuses are fully accumulated ─
  // character.wound_threshold stores the effective value (species base + GRIT/TOUGH bonuses).
  // Subtract accumulated bonuses to recover the original species/career base for the tooltip.
  const trueWoundBase  = character.wound_threshold  - mods.woundThresholdBonus
  const trueStrainBase = character.strain_threshold - mods.strainThresholdBonus
  woundSources.unshift({ label: 'Base', value: trueWoundBase, kind: 'base' })
  strainSources.unshift({ label: 'Base', value: trueStrainBase, kind: 'base' })

  // ── Force Presence threshold modifiers (Prompt B) ─────────────────────────
  // Deliberately NOT folded into mods.woundThresholdBonus/strainThresholdBonus
  // above: those two accumulate bonuses that are permanently written back to
  // character.wound_threshold/strain_threshold by applyTalentModifiers
  // (useCharacterData.ts) — effectiveStats below reads those DB columns
  // directly, not `mods`, so anything added only to `mods` would never reach
  // effectiveStats at all (and would corrupt the trueWoundBase/trueStrainBase
  // subtraction above, which assumes `mods` mirrors exactly what's already
  // baked into the DB column). Force Presence bonuses are purely derived and
  // must never be written back, so they get their own additive term, applied
  // directly at the effectiveStats assembly below, with their own tooltip
  // source entries appended (not unshifted into "Base").
  //
  // 7+7 > 10 (characters_balance_points_check, migration 095) makes both
  // thresholds simultaneously impossible — no precedence logic needed.
  let forcePresenceWoundBonus = 0
  let forcePresenceStrainBonus = 0
  if (moralitySystem === 'force_presence') {
    const lightPoints = character.light_points ?? 0
    const darkPoints   = character.dark_points  ?? 0
    if (darkPoints >= 7) {
      forcePresenceWoundBonus  += 2
      forcePresenceStrainBonus -= 2
      woundSources.push({ label: 'Fallen to the Dark Side', value: 2 })
      strainSources.push({ label: 'Fallen to the Dark Side', value: -2 })
    }
    if (lightPoints >= 7) {
      forcePresenceStrainBonus += 2
      strainSources.push({ label: 'Light Side Paragon', value: 2 })
    }
  }

  // ── Step 4c: Cybernetics — RENDER-TIME ONLY ──────────────────────────────
  // computeCyberneticEffects() is passed the character's CURRENT (already
  // XP- and Dedication-resolved) characteristic values and skill ranks as the
  // base, and clamps each bonus against them (CHARACTERISTIC_MAX = 7,
  // SKILL_MAX = 6). Nothing here is ever written back to characters.* or
  // character_skills.* — unlike GRIT/TOUGH (applyTalentModifiers) and
  // Dedication (resolveDedication), which persist at purchase time. An
  // implant can be uninstalled, so its contribution has to be derived.
  const cybernetics = computeCyberneticEffects(
    character, characterGear, refGearMap, cyberneticEffects, characterTalents, skillRanks,
  )

  const characteristics: Record<string, StatLayer> = {
    BRAWN:     statLayer(character.brawn,     cybernetics.characteristicBonuses.BRAWN     ?? 0),
    AGILITY:   statLayer(character.agility,   cybernetics.characteristicBonuses.AGILITY   ?? 0),
    INTELLECT: statLayer(character.intellect, cybernetics.characteristicBonuses.INTELLECT ?? 0),
    CUNNING:   statLayer(character.cunning,   cybernetics.characteristicBonuses.CUNNING   ?? 0),
    WILLPOWER: statLayer(character.willpower, cybernetics.characteristicBonuses.WILLPOWER ?? 0),
    PRESENCE:  statLayer(character.presence,  cybernetics.characteristicBonuses.PRESENCE  ?? 0),
  }

  const skillLayers: Record<string, StatLayer> = {}
  for (const [skillKey, bonus] of Object.entries(cybernetics.skillBonuses)) {
    skillLayers[skillKey] = statLayer(skillRanks[skillKey] ?? 0, bonus)
  }

  // Implant soak/defense/threshold bonuses join the same accumulators the
  // armour and talent loops feed, with their own breakdown lines, so the
  // existing stat tooltips explain them without a second display path.
  // (cybernetics.sources carries the per-implant characteristic/skill
  // attribution lines; those are surfaced through characteristics/skillLayers
  // above, not through `mods`.)
  if (characteristics.BRAWN.cyberneticBonus) {
    soakSources.push({ label: 'Cybernetics (Brawn)', value: characteristics.BRAWN.cyberneticBonus, kind: 'item' })
  }
  if (cybernetics.soakBonus) {
    mods.soakBonus += cybernetics.soakBonus
    soakSources.push({ label: 'Cybernetics', value: cybernetics.soakBonus, kind: 'item' })
  }
  if (cybernetics.defenseBonus) {
    mods.defenseMelee  += cybernetics.defenseBonus
    mods.defenseRanged += cybernetics.defenseBonus
    defMSources.push({ label: 'Cybernetics', value: cybernetics.defenseBonus, kind: 'item' })
    defRSources.push({ label: 'Cybernetics', value: cybernetics.defenseBonus, kind: 'item' })
  }
  if (cybernetics.woundThresholdBonus)  woundSources.push({ label: 'Cybernetics', value: cybernetics.woundThresholdBonus, kind: 'item' })
  if (cybernetics.strainThresholdBonus) strainSources.push({ label: 'Cybernetics', value: cybernetics.strainThresholdBonus, kind: 'item' })

  // ── Step 5: Assemble effective stats ─────────────────────────────────────
  const effectiveStats: EffectiveStats = {
    // Soak is Brawn-derived, so a Brawn-raising implant raises soak too —
    // characteristics.BRAWN.effective, never the raw column.
    soak:            characteristics.BRAWN.effective + mods.soakBonus,
    defenseMelee:    mods.defenseMelee,
    defenseRanged:   mods.defenseRanged,
    // wound/strain talent bonuses (GRIT, TOUGH) are stored directly on the character row
    // via applyTalentModifiers — do NOT add them again here to avoid double-counting.
    // Force Presence bonuses are the one exception: purely derived, added here only.
    // Cybernetic threshold bonuses are purely derived (same reasoning as the
    // Force Presence terms directly above) and so are added here only, never
    // folded into mods.woundThresholdBonus/strainThresholdBonus — those two
    // mirror what applyTalentModifiers already baked into the DB column.
    woundThreshold:  character.wound_threshold  + forcePresenceWoundBonus  + cybernetics.woundThresholdBonus,
    strainThreshold: character.strain_threshold + forcePresenceStrainBonus + cybernetics.strainThresholdBonus,
    forceRating:     forceRatingBase            + mods.forceRatingBonus,
  }

  return {
    effectiveStats,
    modifiers: mods,
    cybernetics,
    characteristics,
    skillLayers,
    breakdown: {
      soak:            soakSources,
      defenseMelee:    defMSources,
      defenseRanged:   defRSources,
      woundThreshold:  woundSources,
      strainThreshold: strainSources,
      forceRating:     forceSources,
    },
  }
}
