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
  CharacterWeapon,
  RefTalent,
  RefArmor,
  RefWeapon,
  RefWeaponQuality,
  RefItemAttachment,
} from './types'

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
  const woundSources: StatSource[]   = [{ label: 'Base', value: character.wound_threshold }]
  const strainSources: StatSource[]  = [{ label: 'Base', value: character.strain_threshold }]
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
      const m = ref.base_mods
      if (m.soakAdd)            { mods.soakBonus           += m.soakAdd;            soakSources.push({ label: ref.name, value: m.soakAdd }) }
      if (m.defenseMeleeAdd)    { mods.defenseMelee         += m.defenseMeleeAdd;    defMSources.push({ label: ref.name, value: m.defenseMeleeAdd }) }
      if (m.defenseRangedAdd)   { mods.defenseRanged        += m.defenseRangedAdd;   defRSources.push({ label: ref.name, value: m.defenseRangedAdd }) }
      if (m.woundThresholdAdd)  { mods.woundThresholdBonus  += m.woundThresholdAdd;  woundSources.push({ label: ref.name, value: m.woundThresholdAdd }) }
      if (m.strainThresholdAdd) { mods.strainThresholdBonus += m.strainThresholdAdd; strainSources.push({ label: ref.name, value: m.strainThresholdAdd }) }
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

  // ── Step 5: Assemble effective stats ─────────────────────────────────────
  const effectiveStats: EffectiveStats = {
    soak:            character.brawn + mods.soakBonus,
    defenseMelee:    mods.defenseMelee,
    defenseRanged:   mods.defenseRanged,
    woundThreshold:  character.wound_threshold  + mods.woundThresholdBonus,
    strainThreshold: character.strain_threshold + mods.strainThresholdBonus,
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
