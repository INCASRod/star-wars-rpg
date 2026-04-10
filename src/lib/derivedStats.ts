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
  AttachmentModEntry,
  WeaponQuality,
} from './types'

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
}

// ── Encumbrance ──────────────────────────────────────────────────────────────

export interface EncumbranceStats {
  /** Total encumbrance from all carried/equipped items */
  current: number
  /** 5 + brawn base + storage container bonuses */
  threshold: number
}

/**
 * Compute encumbrance current + threshold for a character.
 * Rules:
 *   - Stowed items contribute 0 enc
 *   - Equipped armor reduces its enc by 3 (min 0) — wearing bonus
 *   - Storage containers (ref_gear.encumbrance_bonus) increase threshold
 */
export function computeEncumbranceStats(
  character: Pick<Character, 'encumbrance_threshold'>,
  armor:   CharacterArmor[],
  refArmorMap:  Record<string, Pick<RefArmor, 'encumbrance'>>,
  gear:    CharacterGear[],
  refGearMap:   Record<string, Pick<RefGear, 'encumbrance' | 'encumbrance_bonus'>>,
  weapons: CharacterWeapon[],
  refWeaponMap: Record<string, Pick<RefWeapon, 'encumbrance'>>,
): EncumbranceStats {
  let current = 0
  for (const a of armor) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((a as any).is_dropped) continue
    const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying')
    if (state === 'stowed') continue
    const enc = refArmorMap[a.armor_key]?.encumbrance || 0
    current += state === 'equipped' ? Math.max(0, enc - 3) : enc
  }
  for (const g of gear) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((g as any).is_dropped) continue
    const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
    if (state === 'stowed') continue
    current += (refGearMap[g.gear_key]?.encumbrance || 0) * (g.quantity || 1)
  }
  for (const w of weapons) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((w as any).is_dropped) continue
    const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying')
    if (state === 'stowed') continue
    current += refWeaponMap[w.weapon_key]?.encumbrance || 0
  }
  const bonus = gear.reduce((s, g) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((g as any).is_dropped) return s
    const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
    const ref = refGearMap[g.gear_key]
    return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
  }, 0)
  return { current, threshold: character.encumbrance_threshold + bonus }
}

// ── Engine ───────────────────────────────────────────────────────────────────

/**
 * Compute all derived stats for a character.
 *
 * @param character          - Raw character row
 * @param forceRatingBase    - Pre-computed base force rating (career + FORCERAT talent)
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
  characterTalents: CharacterTalent[],
  refTalentMap: Record<string, RefTalent>,
  equippedArmor: CharacterArmor[],
  refArmorMap: Record<string, RefArmor>,
  refAttachmentMap: Record<string, RefItemAttachment>,
  characterWeapons: CharacterWeapon[] = [],
  refWeaponMap: Record<string, RefWeapon> = {},
  refWeaponQualityMap: Record<string, RefWeaponQuality> = {},
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
  const soakSources: StatSource[]    = [{ label: 'Brawn', value: character.brawn }]
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
      soakSources.push({ label, value: soakB })
    }
    if (defM > 0) {
      mods.defenseMelee += defM
      defMSources.push({ label, value: defM })
    }
    if (defR > 0) {
      mods.defenseRanged += defR
      defRSources.push({ label, value: defR })
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
          if (entry.key === 'SOAKADD')    { mods.soakBonus           += n; soakSources.push({ label: ref.name, value: n }) }
          if (entry.key === 'DEFADD')     { mods.defenseMelee += n; mods.defenseRanged += n; defMSources.push({ label: ref.name, value: n }); defRSources.push({ label: ref.name, value: n }) }
          if (entry.key === 'STRAINADD')  { mods.strainThresholdBonus += n; strainSources.push({ label: ref.name, value: n }) }
          if (entry.key === 'WOUNDADD')   { mods.woundThresholdBonus  += n; woundSources.push({ label: ref.name, value: n }) }
        }
      } else {
        // Legacy flat-object format
        const m = ref.base_mods
        if (m.soakAdd)            { mods.soakBonus           += m.soakAdd;            soakSources.push({ label: ref.name, value: m.soakAdd }) }
        if (m.defenseMeleeAdd)    { mods.defenseMelee         += m.defenseMeleeAdd;    defMSources.push({ label: ref.name, value: m.defenseMeleeAdd }) }
        if (m.defenseRangedAdd)   { mods.defenseRanged        += m.defenseRangedAdd;   defRSources.push({ label: ref.name, value: m.defenseRangedAdd }) }
        if (m.woundThresholdAdd)  { mods.woundThresholdBonus  += m.woundThresholdAdd;  woundSources.push({ label: ref.name, value: m.woundThresholdAdd }) }
        if (m.strainThresholdAdd) { mods.strainThresholdBonus += m.strainThresholdAdd; strainSources.push({ label: ref.name, value: m.strainThresholdAdd }) }
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
        defMSources.push({ label: `${weaponLabel} (${refQ.name} ${count})`, value: val })
      }
      if (sm.defenseRanged) {
        const val = sm.defenseRanged * count
        mods.defenseRanged += val
        defRSources.push({ label: `${weaponLabel} (${refQ.name} ${count})`, value: val })
      }
    }
  }

  // ── Track soak after armor (needed for talent requirements) ───────────────
  const soakAfterArmor = character.brawn + mods.soakBonus

  // ── Step 4: Talent modifiers ──────────────────────────────────────────────
  for (const talent of characterTalents) {
    const ref = refTalentMap[talent.talent_key]
    if (!ref?.attributes && !ref?.die_modifiers) continue

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

      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal }) }
      if (forceVal)  { mods.forceRatingBonus     += forceVal;  forceSources.push({ label: ref.name + rankLabel, value: forceVal }) }
    } else if (ref.modifiers) {
      // Legacy modifiers shape (snake_case) — used by some OggDude-imported talents
      const m = ref.modifiers
      const soakVal   = (m.soak             ?? 0) * rank
      const defMVal   = (m.defense_melee    ?? 0) * rank
      const defRVal   = (m.defense_ranged   ?? 0) * rank
      const woundVal  = (m.wound_threshold  ?? 0) * rank
      const strainVal = (m.strain_threshold ?? 0) * rank
      const forceVal  = (m.force_rating     ?? 0) * rank

      if (soakVal)   { mods.soakBonus           += soakVal;   soakSources.push({ label: ref.name + rankLabel, value: soakVal }) }
      if (defMVal)   { mods.defenseMelee         += defMVal;   defMSources.push({ label: ref.name + rankLabel, value: defMVal }) }
      if (defRVal)   { mods.defenseRanged        += defRVal;   defRSources.push({ label: ref.name + rankLabel, value: defRVal }) }
      if (woundVal)  { mods.woundThresholdBonus  += woundVal;  woundSources.push({ label: ref.name + rankLabel, value: woundVal }) }
      if (strainVal) { mods.strainThresholdBonus += strainVal; strainSources.push({ label: ref.name + rankLabel, value: strainVal }) }
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

  // ── Prepend true Base entries now that talent bonuses are fully accumulated ─
  // character.wound_threshold stores the effective value (species base + GRIT/TOUGH bonuses).
  // Subtract accumulated bonuses to recover the original species/career base for the tooltip.
  const trueWoundBase  = character.wound_threshold  - mods.woundThresholdBonus
  const trueStrainBase = character.strain_threshold - mods.strainThresholdBonus
  woundSources.unshift({ label: 'Base', value: trueWoundBase })
  strainSources.unshift({ label: 'Base', value: trueStrainBase })

  // ── Step 5: Assemble effective stats ─────────────────────────────────────
  const effectiveStats: EffectiveStats = {
    soak:            character.brawn + mods.soakBonus,
    defenseMelee:    mods.defenseMelee,
    defenseRanged:   mods.defenseRanged,
    // wound/strain talent bonuses (GRIT, TOUGH) are stored directly on the character row
    // via applyTalentModifiers — do NOT add them again here to avoid double-counting.
    woundThreshold:  character.wound_threshold,
    strainThreshold: character.strain_threshold,
    forceRating:     forceRatingBase            + mods.forceRatingBonus,
  }

  return {
    effectiveStats,
    modifiers: mods,
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
