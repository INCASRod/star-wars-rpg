'use client'

import { useEffect, useState, useCallback, useMemo, useRef, type Dispatch, type SetStateAction } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { randomUUID } from '@/lib/utils'
import { logPurchaseNotification } from '@/lib/logRoll'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { getRefData } from '@/lib/refDataCache'
import { useCharacterSigAbilities } from '@/hooks/useCharacterSigAbilities'
import { isDroid, isClone, isEligibleForForceRating } from '@/lib/forceEligibility'
import { computeDerivedStats, countOwnedRanks } from '@/lib/derivedStats'
import { computeCareerSkillKeys, persistCareerSkills } from '@/lib/characters'
import {
  RANGE_LABELS, ACTIVATION_LABELS, CHARACTERISTIC_ABBR,
} from '@/lib/types'
import type {
  Character, CharacterSkill, CharacterTalent, CharacterWeapon, CharacterArmor,
  CharacterGear, CharacterCriticalInjury, CharacterSpecialization,
  RefSkill, RefTalent, RefWeapon, RefArmor, RefGear, RefCriticalInjury, RefSpecialization,
  RefItemDescriptor, RefCareer, RefSpecies,
  RefForcePower, RefForceAbility, CharacterForceAbility,
  RefWeaponQuality, RefItemAttachment, EquipState,
  RefObligationType, RefDutyType,
  SpeciesAbility, HudSkill, HudTalent, WpnDisplay, ArmDisplay, GearRow, ItemCondition, StowLocationType,
} from '@/lib/types'

// ═══════════════════════════════════════════════════════════════════════════
// SHARED MUTATION LOGIC — extracted to standalone functions (Prompt 7a) so the
// lean useTalentSurfaceData hook can reuse the exact same purchase/XP-race-safe
// logic instead of duplicating it (duplicated purchase logic is how the XP-race
// bug happened in the first place). useCharacterData's own handlers below are
// now thin closures that supply their own state/setters via a deps bag; every
// existing consumer (PlayerHUDDesktop, etc.) is unaffected — same call
// signatures, same behaviour, same return values.
// ═══════════════════════════════════════════════════════════════════════════

/** Pure — no closure over hook state. Both useCharacterData and useTalentSurfaceData call this identically. */
export function applyTalentModifiers(
  character: Character,
  refTalentMap: Record<string, RefTalent>,
  talentKey: string,
  direction: 1 | -1,
): Record<string, number> {
  const ref = refTalentMap[talentKey]
  if (!ref?.modifiers) return {}
  const mods = ref.modifiers
  const updates: Record<string, number> = {}
  if (mods.wound_threshold) updates.wound_threshold = character.wound_threshold + mods.wound_threshold * direction
  if (mods.strain_threshold) updates.strain_threshold = character.strain_threshold + mods.strain_threshold * direction
  if (mods.soak) updates.soak = character.soak + mods.soak * direction
  if (mods.defense_ranged) updates.defense_ranged = character.defense_ranged + mods.defense_ranged * direction
  if (mods.defense_melee) updates.defense_melee = character.defense_melee + mods.defense_melee * direction
  return updates
}

export interface TalentMutationDeps {
  character: Character
  talents: CharacterTalent[]
  refTalentMap: Record<string, RefTalent>
  supabase: SupabaseClient
  setCharacter: (c: Character) => void
  setTalents: Dispatch<SetStateAction<CharacterTalent[]>>
}

export async function purchaseTalent(
  deps: TalentMutationDeps,
  talentKey: string, row: number, col: number, activeSpecKey: string,
): Promise<string | undefined> {
  const { character, talents, refTalentMap, supabase, setCharacter, setTalents } = deps
  const cost = (row + 1) * 5
  if (character.xp_available < cost) return

  const statUpdates = applyTalentModifiers(character, refTalentMap, talentKey, 1)
  const optimisticXp = character.xp_available - cost
  const newId = randomUUID()
  const talentRow = {
    id: newId, character_id: character.id, talent_key: talentKey,
    specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
  }
  setCharacter({ ...character, xp_available: optimisticXp, ...statUpdates })
  setTalents(prev => [...prev, talentRow])

  // XP-race fix: re-read xp_available immediately before persisting — same
  // fresh-read pattern as lockInAbility/purchaseNode (useCharacterSigAbilities.ts)
  // — so two near-simultaneous editors (GM + player) can't both spend the
  // same XP. If the fresh value can no longer afford it, roll back the
  // optimistic update instead of persisting an overspend.
  const { data: charRow } = await supabase.from('characters').select('xp_available').eq('id', character.id).single()
  const freshXp = charRow?.xp_available ?? character.xp_available
  if (freshXp < cost) {
    setCharacter({ ...character, xp_available: freshXp })
    setTalents(prev => prev.filter(t => t.id !== newId))
    toast.error(`Not enough XP — need ${cost}, have ${freshXp}`)
    return
  }
  const newXp = freshXp - cost

  await Promise.all([
    supabase.from('character_talents').insert(talentRow),
    supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought talent: ${talentKey} (row ${row})` }),
  ])

  const existingRankCount = countOwnedRanks(talents, t => t.talent_key === talentKey)
  const talentRank        = existingRankCount + 1
  const talentName        = refTalentMap[talentKey]?.name ?? talentKey
  const label              = talentRank > 1 ? `${talentName} (Rank ${talentRank})` : talentName

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label,
    meta: {
      purchase_type: 'talent',
      xp_cost:       cost,
      refunded:      false,
      talent_id:     newId,
      talent_key:    talentKey,
      stat_delta:    (() => {
        const ref  = refTalentMap[talentKey]
        const mods = ref?.modifiers as Record<string, number> | undefined ?? {}
        const raw: Record<string, number> = {}
        for (const key of ['wound_threshold', 'strain_threshold', 'soak', 'defense_ranged', 'defense_melee'] as const) {
          if (mods[key]) raw[key] = mods[key]
        }
        return raw
      })(),
    },
  })

  return newId
}

export async function removeTalent(deps: TalentMutationDeps, talentId: string, xpCost: number): Promise<void> {
  const { character, talents, refTalentMap, supabase, setCharacter, setTalents } = deps
  const ct = talents.find(t => t.talent_key === talentId)
  if (!ct) return
  const statUpdates = applyTalentModifiers(character, refTalentMap, talentId, -1)
  const newXp = character.xp_available + xpCost
  setCharacter({ ...character, xp_available: newXp, ...statUpdates })
  setTalents(prev => prev.filter(t => t.id !== ct.id))
  await Promise.all([
    supabase.from('character_talents').delete().eq('id', ct.id),
    supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: xpCost, reason: `GM refund: removed talent ${talentId}` }),
  ])
}

/** Save the characteristic chosen for a Dedication purchase and apply the +1. */
export async function resolveDedication(deps: TalentMutationDeps, talentId: string, charKey: string): Promise<void> {
  const { character, supabase, setCharacter, setTalents } = deps
  const current = (character[charKey as keyof typeof character] as number) ?? 2
  const newVal = Math.min(current + 1, 6)
  setCharacter({ ...character, [charKey]: newVal })
  setTalents(prev => prev.map(t => t.id === talentId ? { ...t, dedication_characteristic: charKey as CharacterTalent['dedication_characteristic'] } : t))
  await Promise.all([
    supabase.from('character_talents').update({ dedication_characteristic: charKey }).eq('id', talentId),
    supabase.from('characters').update({ [charKey]: newVal }).eq('id', character.id),
  ])
}

/**
 * Cancelling the Dedication characteristic-choice prompt reverts the purchase
 * entirely — the choice is mandatory at time of purchase, so there is no
 * "resolve it later" state a Dedication row can be left in. Removes the
 * talent row by its exact id (not by talent_key — Dedication is rankable,
 * so a character can have more than one row) and refunds the XP.
 */
export async function cancelDedication(deps: TalentMutationDeps, talentId: string, xpCost: number): Promise<void> {
  const { character, supabase, setCharacter, setTalents } = deps
  const newXp = character.xp_available + xpCost
  setCharacter({ ...character, xp_available: newXp })
  setTalents(prev => prev.filter(t => t.id !== talentId))
  await Promise.all([
    supabase.from('character_talents').delete().eq('id', talentId),
    supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: xpCost, reason: 'Dedication cancelled: no characteristic chosen' }),
  ])
}

export interface BuySpecializationDeps {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refCareers: RefCareer[]
  refSkills: RefSkill[]
  careerSpecKeys: Set<string>
  forceRating: number
  supabase: SupabaseClient
  setCharacter: (c: Character) => void
  setCharSpecs: Dispatch<SetStateAction<CharacterSpecialization[]>>
  setPendingForceRatingOffer: (b: boolean) => void
  /** Optional — useCharacterData keeps its local `skills` (character_skills) state in sync for HUD display; useTalentSurfaceData doesn't track that table at all (never rendered on the talents route) and omits this. The DB write (persistCareerSkills) always happens regardless. */
  setSkills?: Dispatch<SetStateAction<CharacterSkill[]>>
}

export interface SpecPurchaseResult {
  specKey: string
  specName: string
  /** Skill keys newly granted as career skills by this purchase — the set
      difference established in the career-skill-union prompt: any skill that
      was ALREADY a career skill (starting spec, or a previously purchased
      one) is excluded, even if this new spec also claims it. Caller maps
      these to display names (this function has no refSkillMap need beyond
      the keys already required for persistCareerSkills). */
  newlyGrantedSkillKeys: string[]
}

export async function buySpecialization(
  deps: BuySpecializationDeps,
  specKey: string,
  setActiveSpecKey: (key: string) => void,
): Promise<SpecPurchaseResult | undefined> {
  const {
    character, charSpecs, refSpecMap, refCareers, refSkills, careerSpecKeys, forceRating,
    supabase, setCharacter, setCharSpecs, setPendingForceRatingOffer, setSkills,
  } = deps
  const targetSpec = refSpecMap[specKey]
  if (targetSpec?.is_force_sensitive && (isDroid(character) || isClone(character))) {
    toast.error(`${isDroid(character) ? 'Droids' : 'Clones'} cannot become Force sensitive`)
    return
  }
  const isCareer = careerSpecKeys.has(specKey)
  const existingCount = charSpecs.length
  const cost = specPurchaseCost(existingCount, isCareer)
  if (character.xp_available < cost) {
    toast.error(`Not enough XP — need ${cost}, have ${character.xp_available}`)
    return
  }

  const newXp = character.xp_available - cost
  setCharacter({ ...character, xp_available: newXp })
  const newSpec: CharacterSpecialization = {
    id: randomUUID(), character_id: character.id,
    specialization_key: specKey, is_starting: false, purchase_order: existingCount,
  }
  setCharSpecs(prev => [...prev, newSpec])
  setActiveSpecKey(specKey)

  await Promise.all([
    supabase.from('character_specializations').insert({
      character_id: character.id, specialization_key: specKey,
      is_starting: false, purchase_order: existingCount,
    }),
    supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought specialization: ${specKey}` }),
  ])

  // Resync career-skill status: this spec's career_skill_keys now count as
  // career skills for the character, unioned with every other owned spec.
  const careerRef = refCareers.find(c => c.key === character.career_key)
  const ownedSpecRefs = [...charSpecs, newSpec]
    .map(s => refSpecMap[s.specialization_key])
    .filter((s): s is RefSpecialization => !!s)

  // Career-skill diff (Prompt 9's spec celebration) — computed purely/locally,
  // no extra DB round-trip: "before" is the union WITHOUT the new spec,
  // "after" is the union WITH it. Both calls are the exact same pure function
  // persistCareerSkills already uses internally, just called here directly so
  // the diff doesn't have to wait on (or duplicate) the DB write below.
  const beforeSpecRefs = charSpecs.map(s => refSpecMap[s.specialization_key]).filter((s): s is RefSpecialization => !!s)
  const beforeUnion = computeCareerSkillKeys(careerRef?.career_skill_keys, beforeSpecRefs)
  const afterUnion = computeCareerSkillKeys(careerRef?.career_skill_keys, ownedSpecRefs)
  const newlyGrantedSkillKeys = [...afterUnion].filter(k => !beforeUnion.has(k))

  const unionKeys = await persistCareerSkills(
    character.id, careerRef?.career_skill_keys, ownedSpecRefs, refSkills.map(s => s.key),
  )
  setSkills?.(prev => prev.map(s => ({ ...s, is_career: unionKeys.has(s.skill_key) })))

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label:         `${refSpecMap[specKey]?.name ?? specKey} Specialization`,
    meta: {
      purchase_type:      'specialization',
      xp_cost:            cost,
      refunded:           false,
      specialization_key: specKey,
    },
  })
  toast.success(`Purchased ${refSpecMap[specKey]?.name || specKey}!`)

  // Offer the deliberate Force Rating purchase if this spec just made the
  // character eligible and they haven't already gained/bought it.
  if (targetSpec?.is_force_sensitive && forceRating === 0 && !character.force_rating_purchased) {
    setPendingForceRatingOffer(true)
  }

  return { specKey, specName: refSpecMap[specKey]?.name ?? specKey, newlyGrantedSkillKeys }
}

/**
 * reSpecialized / FFG specialization purchase cost:
 * 10 × (spec count AFTER this purchase), +10 if not in-career.
 * `specsOwnedBeforePurchase` must NOT include the specialization being bought.
 */
export function specPurchaseCost(specsOwnedBeforePurchase: number, isCareer: boolean): number {
  return 10 * (specsOwnedBeforePurchase + 1) + (isCareer ? 0 : 10)
}

export function useCharacterData(characterId: string) {
  // Track self-initiated DB writes so we don't toast our own changes
  const selfMutatingRef = useRef(false)
  const markSelf = () => { selfMutatingRef.current = true; setTimeout(() => { selfMutatingRef.current = false }, 2000) }

  const [character, setCharacter] = useState<Character | null>(null)
  const [skills, setSkills] = useState<CharacterSkill[]>([])
  const [talents, setTalents] = useState<CharacterTalent[]>([])
  const [weapons, setWeapons] = useState<CharacterWeapon[]>([])
  const [armor, setArmor] = useState<CharacterArmor[]>([])
  const [gear, setGear] = useState<CharacterGear[]>([])
  const [crits, setCrits] = useState<CharacterCriticalInjury[]>([])
  const [charSpecs, setCharSpecs] = useState<CharacterSpecialization[]>([])
  const [refSkills, setRefSkills] = useState<RefSkill[]>([])
  const [refTalents, setRefTalents] = useState<RefTalent[]>([])
  const [refWeapons, setRefWeapons] = useState<RefWeapon[]>([])
  const [refArmor, setRefArmor] = useState<RefArmor[]>([])
  const [refGear, setRefGear] = useState<RefGear[]>([])
  const [refCrits, setRefCrits] = useState<RefCriticalInjury[]>([])
  const [refSpecs, setRefSpecs] = useState<RefSpecialization[]>([])
  const [refDescriptors, setRefDescriptors] = useState<RefItemDescriptor[]>([])
  const [refCareers, setRefCareers] = useState<RefCareer[]>([])
  const [refSpeciesAll, setRefSpeciesAll] = useState<RefSpecies[]>([])
  const [charForceAbilities, setCharForceAbilities] = useState<CharacterForceAbility[]>([])
  const [refForcePowers, setRefForcePowers] = useState<RefForcePower[]>([])
  const [refForceAbilities, setRefForceAbilities] = useState<RefForceAbility[]>([])
  const [refWeaponQualities, setRefWeaponQualities] = useState<RefWeaponQuality[]>([])
  const [refItemAttachments, setRefItemAttachments] = useState<RefItemAttachment[]>([])
  const [refObligationTypes, setRefObligationTypes] = useState<RefObligationType[]>([])
  const [refDutyTypes, setRefDutyTypes] = useState<RefDutyType[]>([])
  const [playerName, setPlayerName] = useState('Player')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Optional post-purchase prompt offering the deliberate Force Rating buy —
  // set right after a Force-sensitive specialization purchase completes.
  const [pendingForceRatingOffer, setPendingForceRatingOffer] = useState(false)

  const supabase = createClient()

  const loadCharacter = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const ds = await fetchActiveDataset(supabase)
      // ref_skills/ref_talents/ref_specializations/ref_careers are static per
      // dataset — shared cache (Prompt 7c) instead of re-fetching them on every
      // character mount. Fires alongside (not before/after) the character-specific
      // batch below, so cold-cache timing is unchanged; a warm cache resolves
      // this leg instantly and fires zero ref queries.
      const [refData, [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
        refWpnRes, refArmRes, refGearRes, refCritRes, refDescRes,
        refSpeciesRes, forceAbilRes, refFpRes, refFaRes, refWqRes, refAttRes,
        refOblTypesRes, refDutyTypesRes]] = await Promise.all([
        getRefData(ds),
        Promise.all([
          supabase.from('characters').select('*').eq('id', characterId).single(),
          supabase.from('character_skills').select('*').eq('character_id', characterId),
          supabase.from('character_talents').select('*').eq('character_id', characterId),
          supabase.from('character_weapons').select('*').eq('character_id', characterId).eq('is_dropped', false),
          supabase.from('character_armor').select('*').eq('character_id', characterId).eq('is_dropped', false),
          supabase.from('character_gear').select('*').eq('character_id', characterId).eq('is_dropped', false),
          supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
          supabase.from('character_specializations').select('*').eq('character_id', characterId),
          supabase.from('ref_weapons').select('*'),
          supabase.from('ref_armor').select('*'),
          supabase.from('ref_gear').select('*'),
          supabase.from('ref_critical_injuries').select('*').order('roll_min'),
          supabase.from('ref_item_descriptors').select('*'),
          supabase.from('ref_species').select('*'),
          supabase.from('character_force_abilities').select('*').eq('character_id', characterId),
          supabase.from('ref_force_powers').select('*'),
          supabase.from('ref_force_abilities').select('*').eq('dataset_source', ds).eq('is_retired', false),
          supabase.from('ref_weapon_qualities').select('*'),
          supabase.from('ref_item_attachments').select('*'),
          supabase.from('ref_obligation_types').select('key, name'),
          supabase.from('ref_duty_types').select('key, name'),
        ]),
      ])

      if (charRes.error) throw new Error(charRes.error.message)

      setCharacter(charRes.data as Character)
      setSkills((skillsRes.data as CharacterSkill[]) || [])
      setTalents((talentsRes.data as CharacterTalent[]) || [])
      setWeapons((weaponsRes.data as CharacterWeapon[]) || [])
      setArmor((armorRes.data as CharacterArmor[]) || [])
      setGear((gearRes.data as CharacterGear[]) || [])
      setCrits((critsRes.data as CharacterCriticalInjury[]) || [])
      // No ORDER BY on the query above — sort here so tab order (talents surface,
      // HudTalentsTab) is deterministic instead of whatever order Postgres returns.
      setCharSpecs(((specsRes.data as CharacterSpecialization[]) || []).slice().sort((a, b) => a.purchase_order - b.purchase_order))
      setRefSkills(refData.refSkills)
      setRefTalents(refData.refTalents)
      setRefWeapons((refWpnRes.data as RefWeapon[]) || [])
      setRefArmor((refArmRes.data as RefArmor[]) || [])
      setRefGear((refGearRes.data as RefGear[]) || [])
      setRefCrits((refCritRes.data as RefCriticalInjury[]) || [])

      // Supplement active-dataset specs with any cross-dataset specs the character
      // actually owns (e.g. oggdude specs on a respec campaign), OR any specs the
      // character owns that have since been retired. Retirement means "cannot be
      // newly selected" — it must never drop an owned spec out of refSpecMap, so
      // this fallback deliberately does NOT filter on is_retired. Character-specific,
      // so it stays outside the shared cache — see refDataCache.ts's header comment.
      let mergedRefSpecs = refData.refSpecializations
      const loadedSpecKeys = new Set(mergedRefSpecs.map(s => s.key))
      const charSpecKeys = ((specsRes.data as CharacterSpecialization[]) || []).map(cs => cs.specialization_key)
      const missingSpecKeys = charSpecKeys.filter(k => !loadedSpecKeys.has(k))
      if (missingSpecKeys.length > 0) {
        const { data: fallbackSpecs } = await supabase
          .from('ref_specializations')
          .select('*')
          .in('key', missingSpecKeys)
        if (fallbackSpecs) mergedRefSpecs = [...mergedRefSpecs, ...(fallbackSpecs as RefSpecialization[])]
      }
      setRefSpecs(mergedRefSpecs)
      setRefDescriptors((refDescRes.data as RefItemDescriptor[]) || [])
      setRefCareers(refData.refCareers)
      setRefSpeciesAll((refSpeciesRes.data as RefSpecies[]) || [])
      setCharForceAbilities((forceAbilRes.data as CharacterForceAbility[]) || [])
      setRefForcePowers((refFpRes.data as RefForcePower[]) || [])
      setRefForceAbilities((refFaRes.data as RefForceAbility[]) || [])
      setRefWeaponQualities((refWqRes.data as RefWeaponQuality[]) || [])
      setRefItemAttachments((refAttRes.data as RefItemAttachment[]) || [])
      setRefObligationTypes((refOblTypesRes.data as RefObligationType[]) || [])
      setRefDutyTypes((refDutyTypesRes.data as RefDutyType[]) || [])

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // Initial load
  useEffect(() => { loadCharacter() }, [loadCharacter])

  // ── Realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel(`character-${characterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters', filter: `id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Character sheet updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_critical_injuries', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Critical injuries updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_skills', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Skills updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Talents updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_weapons', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Weapons updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_armor', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Armor updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_gear', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Gear updated'); loadCharacter(true) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_force_abilities', filter: `character_id=eq.${characterId}` }, () => { if (!selfMutatingRef.current) toast('Force abilities updated'); loadCharacter(true) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // ── Ref data maps ──
  const refSkillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])), [refSkills])
  const refTalentMap = useMemo(() => Object.fromEntries(refTalents.map(t => [t.key, t])), [refTalents])
  const refWeaponMap = useMemo(() => Object.fromEntries(refWeapons.map(w => [w.key, w])), [refWeapons])
  const refArmorMap = useMemo(() => Object.fromEntries(refArmor.map(a => [a.key, a])), [refArmor])
  const refGearMap = useMemo(() => Object.fromEntries(refGear.map(g => [g.key, g])), [refGear])
  const refSpecMap = useMemo(() => Object.fromEntries(refSpecs.map(s => [s.key, s])), [refSpecs])
  const refDescriptorMap = useMemo(() => Object.fromEntries(refDescriptors.map(d => [d.key, d])), [refDescriptors])
  const refForcePowerMap = useMemo(() => Object.fromEntries(refForcePowers.map(fp => [fp.key, fp])), [refForcePowers])
  const refForceAbilityMap = useMemo(() => Object.fromEntries(refForceAbilities.map(fa => [fa.key, fa])), [refForceAbilities])
  const refWeaponQualityMap = useMemo(() => Object.fromEntries(refWeaponQualities.map(q => [q.key, q])), [refWeaponQualities])
  const refAttachmentMap = useMemo(() => Object.fromEntries(refItemAttachments.map(a => [a.key, a])), [refItemAttachments])

  // ── Derive force rating from career, FORCERAT talents, and a deliberate purchase ──
  // Under reSpec rules, owning a Force-sensitive specialization only makes a
  // character ELIGIBLE for Force Rating 1 (see isEligibleForForceRating) — it no
  // longer grants any Force Rating on its own. The player must spend 10 XP via
  // handlePurchaseForceRating, which sets force_rating_purchased.
  //
  // careerForceRatingBase is exposed separately (not folded straight into
  // forceRating) because computeDerivedStats needs it to gate
  // `force_rating_conditional` talents like WITCHCRAFT — those grant their
  // bonus only when the career itself doesn't already grant a free Force
  // Rating, and stack independently with FORCERAT talent ranks and the
  // deliberate purchase (both already counted in forceRating below).
  const careerForceRatingBase = useMemo(() =>
    refCareers.find(c => c.key === character?.career_key)?.force_rating ?? 0
  , [refCareers, character?.career_key])

  const forceRating = useMemo(() => {
    const talentBonus    = countOwnedRanks(talents, t => t.talent_key === 'FORCERAT', t => t.ranks || 1)
    const purchasedBonus = character?.force_rating_purchased ? 1 : 0
    return careerForceRatingBase + talentBonus + purchasedBonus
  }, [talents, careerForceRatingBase, character?.force_rating_purchased])

  // ── In-career specialization keys for the character's career ──
  // ref_specializations.career_key is always NULL for the respec dataset (migration 064) —
  // in-career association lives on ref_careers.specialization_keys instead. See
  // useCharacterSigAbilities.ts for the same pattern.
  const careerSpecKeys = useMemo(() => {
    const currentCareer = refCareers.find(c => c.key === character?.career_key)
    return new Set(currentCareer?.specialization_keys ?? [])
  }, [refCareers, character?.career_key])

  // Reverse lookup: spec key -> name of a career that claims it in
  // specialization_keys (first match wins if shared across careers). Used to
  // label non-owned specs in the spec selector; Universal specs (claimed by
  // no career) are simply absent from this map.
  const specKeyToCareerName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const career of refCareers) {
      for (const specKey of career.specialization_keys ?? []) {
        if (!(specKey in map)) map[specKey] = career.name
      }
    }
    return map
  }, [refCareers])

  // Mutation deps bag — passed to the shared standalone mutation functions
  // (defined at module scope above) so their logic runs identically here and
  // in useTalentSurfaceData, with no duplication.
  const talentMutationDeps = (): TalentMutationDeps => ({
    character: character!, talents, refTalentMap, supabase, setCharacter, setTalents,
  })

  // ═══════════════════════════════════════
  // MUTATION HANDLERS
  // ═══════════════════════════════════════

  const handleVitalChange = async (field: 'wound_current' | 'strain_current', delta: number) => {
    if (!character) return
    markSelf()
    const maxField = field === 'wound_current' ? 'wound_threshold' : 'strain_threshold'
    const newValue = Math.max(0, Math.min(character[field] + delta, character[maxField]))
    setCharacter({ ...character, [field]: newValue })
    await supabase.from('characters').update({ [field]: newValue }).eq('id', character.id)
  }

  /** Like handleVitalChange but with no upper cap — wounds/strain can exceed threshold. */
  const handleVitalAdjust = async (field: 'wound_current' | 'strain_current', delta: number) => {
    if (!character) return
    markSelf()
    const newValue = Math.max(0, character[field] + delta)
    setCharacter({ ...character, [field]: newValue })
    await supabase.from('characters').update({ [field]: newValue }).eq('id', character.id)
  }

  const handleBuySkill = async (skillKey: string, currentRank: number, isCareer: boolean) => {
    if (!character) return
    markSelf()
    const newRank = currentRank + 1
    if (newRank > 5) return
    const cost = newRank * 5 + (isCareer ? 0 : 5)
    if (character.xp_available < cost) return

    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp })
    setSkills(prev => prev.map(s => s.skill_key === skillKey ? { ...s, rank: newRank } : s))

    await Promise.all([
      supabase.from('character_skills').update({ rank: newRank }).eq('character_id', character.id).eq('skill_key', skillKey),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought skill rank: ${skillKey} ${newRank}` }),
    ])

    logPurchaseNotification({
      campaignId:    character.campaign_id,
      characterId:   character.id,
      characterName: character.name,
      label:         `Rank ${newRank} of ${refSkillMap[skillKey]?.name ?? skillKey}`,
      meta: {
        purchase_type: 'skill',
        xp_cost:       cost,
        refunded:      false,
        skill_key:     skillKey,
        prev_rank:     currentRank,
        new_rank:      newRank,
      },
    })
  }

  const cycleEquipState = (current: string): 'equipped' | 'carrying' | 'stowed' => {
    if (current === 'equipped') return 'carrying'
    if (current === 'carrying') return 'stowed'
    return 'equipped'
  }

  const handleToggleWeaponEquipped = async (id: string) => {
    const w = weapons.find(w => w.id === id)
    if (!w) return
    markSelf()
    const next = cycleEquipState(w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'))
    setWeapons(prev => prev.map(x => x.id === id ? { ...x, equip_state: next, is_equipped: next === 'equipped' } : x))
    await supabase.from('character_weapons').update({ equip_state: next, is_equipped: next === 'equipped' }).eq('id', id)
  }

  const handleSetEquipState = async (
    id: string,
    type: 'weapon' | 'armor' | 'gear',
    state: EquipState,
    location?: import('@/lib/types').StowLocation | null,
  ) => {
    markSelf()
    const locFields = state === 'stowed' && location
      ? { stow_location_id: location.id, stow_location_name: location.name, stow_location_type: location.type }
      : { stow_location_id: null, stow_location_name: null, stow_location_type: null }
    if (type === 'weapon') {
      setWeapons(prev => prev.map(x => x.id === id ? { ...x, equip_state: state, is_equipped: state === 'equipped', ...locFields } : x))
      await supabase.from('character_weapons').update({ equip_state: state, is_equipped: state === 'equipped', ...locFields }).eq('id', id)
    } else if (type === 'armor') {
      setArmor(prev => prev.map(x => x.id === id ? { ...x, equip_state: state, is_equipped: state === 'equipped', ...locFields } : x))
      await supabase.from('character_armor').update({ equip_state: state, is_equipped: state === 'equipped', ...locFields }).eq('id', id)
    } else {
      setGear(prev => prev.map(x => x.id === id ? { ...x, equip_state: state, is_equipped: state === 'equipped', ...locFields } : x))
      await supabase.from('character_gear').update({ equip_state: state, is_equipped: state === 'equipped', ...locFields }).eq('id', id)
    }
  }

  const handleToggleEquippedById = async (id: string, type: 'weapon' | 'armor' | 'gear') => {
    markSelf()
    if (type === 'weapon') {
      const w = weapons.find(w => w.id === id)
      if (!w) return
      const next = cycleEquipState(w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'))
      setWeapons(prev => prev.map(x => x.id === id ? { ...x, equip_state: next, is_equipped: next === 'equipped' } : x))
      await supabase.from('character_weapons').update({ equip_state: next, is_equipped: next === 'equipped' }).eq('id', id)
    } else if (type === 'armor') {
      const a = armor.find(a => a.id === id)
      if (!a) return
      const next = cycleEquipState(a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'))
      setArmor(prev => prev.map(x => x.id === id ? { ...x, equip_state: next, is_equipped: next === 'equipped' } : x))
      await supabase.from('character_armor').update({ equip_state: next, is_equipped: next === 'equipped' }).eq('id', id)
    } else {
      const g = gear.find(g => g.id === id)
      if (!g) return
      const next = cycleEquipState(g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'))
      setGear(prev => prev.map(x => x.id === id ? { ...x, equip_state: next, is_equipped: next === 'equipped' } : x))
      await supabase.from('character_gear').update({ equip_state: next, is_equipped: next === 'equipped' }).eq('id', id)
    }
  }

  const handleRollCrit = async () => {
    if (!character) return
    markSelf()
    const roll = Math.floor(Math.random() * 100) + 1
    const activeCrits = crits.filter(c => !c.is_healed).length
    const adjustedRoll = roll + (activeCrits * 10)
    const injury = refCrits.find(c => adjustedRoll >= c.roll_min && adjustedRoll <= c.roll_max) || refCrits[refCrits.length - 1]
    if (!injury) return

    const newCrit: CharacterCriticalInjury = {
      id: randomUUID(),
      character_id: character.id,
      injury_id: injury.id,
      custom_name: injury.name,
      severity: injury.severity,
      description: injury.description,
      is_healed: false,
      received_at: new Date().toISOString(),
    }
    setCrits(prev => [...prev, newCrit])
    await supabase.from('character_critical_injuries').insert({
      character_id: character.id, injury_id: injury.id,
      custom_name: injury.name, severity: injury.severity, description: injury.description, is_healed: false,
    })
    alert(`Rolled ${roll}${activeCrits > 0 ? ` + ${activeCrits * 10} (${activeCrits} existing)` : ''} = ${adjustedRoll}\n\n${injury.severity}: ${injury.name}\n${injury.description || ''}`)
  }

  const handleHealCrit = async (critId: string) => {
    markSelf()
    setCrits(prev => prev.filter(c => c.id !== critId))
    await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', critId)
  }

  const handlePortraitUpload = async (file: File) => {
    if (!character) return
    markSelf()
    const ext = file.name.split('.').pop() || 'png'
    const path = `${character.id}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('portraits')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      alert('Upload failed: ' + uploadErr.message)
      return
    }

    const { data: urlData } = supabase.storage.from('portraits').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + '?t=' + Date.now()

    await supabase.from('characters').update({ portrait_url: publicUrl }).eq('id', character.id)
    setCharacter({ ...character, portrait_url: publicUrl })
  }

  const handlePortraitDelete = async () => {
    if (!character) return
    markSelf()
    const url = character.portrait_url || ''
    const match = url.match(/portraits\/([^?]+)/)
    if (match) {
      await supabase.storage.from('portraits').remove([match[1]])
    }

    await supabase.from('characters').update({ portrait_url: null }).eq('id', character.id)
    setCharacter({ ...character, portrait_url: undefined })
  }

  const handleCharacteristicChange = async (field: string, delta: number) => {
    if (!character) return
    markSelf()
    const key = field as keyof Character
    const current = (character[key] as number) || 0
    const newValue = Math.max(0, Math.min(current + delta, 7))
    if (newValue === current) return
    setCharacter({ ...character, [key]: newValue })
    await supabase.from('characters').update({ [key]: newValue }).eq('id', character.id)
  }

  const handleSoakChange = async (delta: number) => {
    if (!character) return
    markSelf()
    const newValue = Math.max(0, character.soak + delta)
    setCharacter({ ...character, soak: newValue })
    await supabase.from('characters').update({ soak: newValue }).eq('id', character.id)
  }

  const handleDefenseChange = async (type: 'ranged' | 'melee', delta: number) => {
    if (!character) return
    markSelf()
    const field = type === 'ranged' ? 'defense_ranged' : 'defense_melee'
    const current = character[field]
    const newValue = Math.max(0, Math.min(current + delta, 5))
    if (newValue === current) return
    setCharacter({ ...character, [field]: newValue })
    await supabase.from('characters').update({ [field]: newValue }).eq('id', character.id)
  }

  const handleMoralityChange = async (delta: number) => {
    if (!character) return
    markSelf()
    const current = character.morality_value || 50
    const newValue = Math.max(0, Math.min(current + delta, 100))
    setCharacter({ ...character, morality_value: newValue })
    await supabase.from('characters').update({ morality_value: newValue }).eq('id', character.id)
  }

  const handleMoralityKeyChange = async (field: string, value: string) => {
    if (!character) return
    markSelf()
    const dbField = field === 'strength' ? 'morality_strength_key' : 'morality_weakness_key'
    setCharacter({ ...character, [dbField]: value })
    await supabase.from('characters').update({ [dbField]: value }).eq('id', character.id)
  }

  const handleObligationChange = async (field: 'type' | 'value', val: string | number) => {
    if (!character) return
    markSelf()
    const dbField = field === 'type' ? 'obligation_type' : 'obligation_value'
    setCharacter({ ...character, [dbField]: val })
    await supabase.from('characters').update({ [dbField]: val }).eq('id', character.id)
  }

  const handleDutyChange = async (field: 'type' | 'value', val: string | number) => {
    if (!character) return
    markSelf()
    const dbField = field === 'type' ? 'duty_type' : 'duty_value'
    setCharacter({ ...character, [dbField]: val })
    await supabase.from('characters').update({ [dbField]: val }).eq('id', character.id)
  }

  const handleRemoveWeapon = async (id: string, droppedBy: 'player' | 'gm' = 'player', droppedNote?: string) => {
    markSelf()
    setWeapons(prev => prev.filter(w => w.id !== id))
    await supabase.from('character_weapons').update({
      is_dropped: true,
      dropped_at: new Date().toISOString(),
      dropped_by: droppedBy,
      ...(droppedNote ? { dropped_note: droppedNote } : {}),
    }).eq('id', id)
  }

  const handleRemoveEquipment = async (id: string, type: 'armor' | 'gear', droppedBy: 'player' | 'gm' = 'player', droppedNote?: string) => {
    markSelf()
    if (type === 'armor') {
      setArmor(prev => prev.filter(a => a.id !== id))
      await supabase.from('character_armor').update({
        is_dropped: true,
        dropped_at: new Date().toISOString(),
        dropped_by: droppedBy,
        ...(droppedNote ? { dropped_note: droppedNote } : {}),
      }).eq('id', id)
    } else {
      setGear(prev => prev.filter(g => g.id !== id))
      await supabase.from('character_gear').update({
        is_dropped: true,
        dropped_at: new Date().toISOString(),
        dropped_by: droppedBy,
        ...(droppedNote ? { dropped_note: droppedNote } : {}),
      }).eq('id', id)
    }
  }

  const handleRemoveTalent = async (talentId: string, xpCost: number) => {
    if (!character) return
    markSelf()
    await removeTalent(talentMutationDeps(), talentId, xpCost)
  }

  const handleReduceSkill = async (skillKey: string, currentRank: number, isCareer: boolean) => {
    if (!character || currentRank <= 0) return
    markSelf()
    const refund = currentRank * 5 + (isCareer ? 0 : 5)
    const newRank = currentRank - 1
    const newXp = character.xp_available + refund
    setCharacter({ ...character, xp_available: newXp })
    setSkills(prev => prev.map(s => s.skill_key === skillKey ? { ...s, rank: newRank } : s))
    await Promise.all([
      supabase.from('character_skills').update({ rank: newRank }).eq('character_id', character.id).eq('skill_key', skillKey),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: refund, reason: `GM refund: reduced skill ${skillKey} ${currentRank} → ${newRank}` }),
    ])
  }

  const handlePurchaseTalent = async (talentKey: string, row: number, col: number, activeSpecKey: string) => {
    if (!character) return
    markSelf()
    return purchaseTalent(talentMutationDeps(), talentKey, row, col, activeSpecKey)
  }

  /** Deduct credits and log the spend to the roll feed. */
  const handleCreditSpend = async (amount: number, campaignId: string) => {
    if (!character) return
    markSelf()
    const newCredits = character.credits - amount
    setCharacter({ ...character, credits: newCredits })
    await Promise.all([
      supabase.from('characters').update({ credits: newCredits }).eq('id', character.id),
      supabase.from('roll_log').insert({
        campaign_id:           campaignId,
        character_id:          character.id,
        character_name:        character.name,
        roll_label:            `Spent ${amount.toLocaleString()} credits`,
        roll_type:             'Credit Spend',
        alignment:             'player',
        pool:                  { proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
        result:                { netSuccess: 0, netAdvantage: 0, triumph: 0, despair: 0, succeeded: false },
        is_dm:                 false,
        hidden:                false,
        is_visible_to_players: true,
      }),
    ])
  }

  /** Save the characteristic chosen for a Dedication purchase and apply the +1. */
  const handleResolveDedication = async (talentId: string, charKey: string) => {
    if (!character) return
    markSelf()
    await resolveDedication(talentMutationDeps(), talentId, charKey)
  }

  /**
   * Cancelling the Dedication characteristic-choice prompt reverts the purchase
   * entirely — the choice is mandatory at time of purchase, so there is no
   * "resolve it later" state a Dedication row can be left in. Removes the
   * talent row by its exact id (not by talent_key — Dedication is rankable,
   * so a character can have more than one row) and refunds the XP.
   */
  const handleCancelDedication = async (talentId: string, xpCost: number) => {
    if (!character) return
    markSelf()
    await cancelDedication(talentMutationDeps(), talentId, xpCost)
  }

  const handleBackstoryChange = async (newBackstory: string) => {
    if (!character) return
    markSelf()
    setCharacter({ ...character, backstory: newBackstory })
    await supabase.from('characters').update({ backstory: newBackstory }).eq('id', character.id)
  }

  const handleNotesChange = async (newNotes: string) => {
    if (!character) return
    markSelf()
    setCharacter({ ...character, notes: newNotes })
    await supabase.from('characters').update({ notes: newNotes }).eq('id', character.id)
  }

  const handlePurchaseForceAbility = async (abilityKey: string, row: number, col: number, cost: number, activeForcePowerKey: string) => {
    if (!character) return
    if (character.xp_available < cost) return
    // A character with Force Rating 0 cannot use or benefit from Force powers —
    // gained a Force-sensitive specialization only makes them eligible, it does
    // not grant a rating on its own. Enforced here (not just in the UI).
    if (forceRating < 1) { toast.error('Force Rating 1 required to purchase Force powers'); return }
    markSelf()

    const newId = randomUUID()
    const optimisticXp = character.xp_available - cost
    const forceAbilityRow = {
      id: newId, character_id: character.id,
      force_power_key: activeForcePowerKey, force_ability_key: abilityKey,
      tree_row: row, tree_col: col, xp_cost: cost,
    }
    setCharacter({ ...character, xp_available: optimisticXp })
    setCharForceAbilities(prev => [...prev, forceAbilityRow])

    // XP-race fix — same fresh-read-before-write pattern as handlePurchaseTalent.
    const { data: charRow } = await supabase.from('characters').select('xp_available').eq('id', character.id).single()
    const freshXp = charRow?.xp_available ?? character.xp_available
    if (freshXp < cost) {
      setCharacter({ ...character, xp_available: freshXp })
      setCharForceAbilities(prev => prev.filter(a => a.id !== newId))
      toast.error(`Not enough XP — need ${cost}, have ${freshXp}`)
      return
    }
    const newXp = freshXp - cost

    await Promise.all([
      supabase.from('character_force_abilities').insert({
        id:                newId,
        character_id:      character.id,
        force_power_key:   activeForcePowerKey,
        force_ability_key: abilityKey,
        tree_row:          row,
        tree_col:          col,
        xp_cost:           cost,
      }),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought force ability: ${abilityKey}` }),
    ])

    const existingCount = countOwnedRanks(
      charForceAbilities,
      a => a.force_ability_key === abilityKey && a.force_power_key === activeForcePowerKey,
    )
    const abilityRank = existingCount + 1
    const powerName   = refForcePowerMap[activeForcePowerKey]?.name ?? activeForcePowerKey
    const abilityName = refForceAbilityMap[abilityKey]?.name ?? abilityKey
    const label       = abilityRank > 1
      ? `${powerName} — ${abilityName} (Rank ${abilityRank})`
      : `${powerName} — ${abilityName}`

    logPurchaseNotification({
      campaignId:    character.campaign_id,
      characterId:   character.id,
      characterName: character.name,
      label,
      meta: {
        purchase_type:     'force',
        xp_cost:           cost,
        refunded:          false,
        force_ability_id:  newId,
        force_power_key:   activeForcePowerKey,
        force_ability_key: abilityKey,
      },
    })
  }

  /**
   * Deliberate 10 XP purchase of Force Rating 1, deferrable indefinitely.
   * Follows the same optimistic-update → DB write → xp_transactions log
   * pattern as handlePurchaseTalent / handleBuySpecialization.
   */
  const handlePurchaseForceRating = async () => {
    if (!character) return
    const cost = 10
    if (character.force_rating_purchased) return
    if (isDroid(character) || isClone(character)) return
    if (!isEligibleForForceRating(character, charSpecs, refSpecMap)) return
    if (character.xp_available < cost) {
      toast.error(`Not enough XP — need ${cost}, have ${character.xp_available}`)
      return
    }
    markSelf()
    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp, force_rating_purchased: true })

    await Promise.all([
      supabase.from('characters').update({ xp_available: newXp, force_rating_purchased: true }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: 'Gained Force Rating 1' }),
    ])

    toast.success('Force Rating 1 gained!')
  }

  // ── HUD transforms ──────────────────────────────────────────────────────────

  const speciesAbilities = useMemo((): SpeciesAbility[] => {
    const sp = refSpeciesAll.find(s => s.key === character?.species_key)
    return (sp?.special_abilities ?? []) as SpeciesAbility[]
  }, [refSpeciesAll, character?.species_key])

  // ── Fully-engine-adjusted force rating (career/talent/purchase base + talent
  // modifier bonuses, e.g. WITCHCRAFT's conditional bonus) — used only to keep
  // the characters.force_rating cache column in sync (see write-back effect
  // below). Reuses computeDerivedStats rather than re-deriving the same logic.
  const derivedForceRating = useMemo(() => {
    if (!character) return forceRating
    return computeDerivedStats(
      character, forceRating, careerForceRatingBase, talents, refTalentMap, armor, refArmorMap, refAttachmentMap,
      weapons, refWeaponMap, refWeaponQualityMap, speciesAbilities,
    ).effectiveStats.forceRating
  }, [character, forceRating, careerForceRatingBase, talents, refTalentMap, armor, refArmorMap, refAttachmentMap, weapons, refWeaponMap, refWeaponQualityMap, speciesAbilities])

  // ── Write-back force_rating to DB whenever the engine computes a different
  // value — lives here (not in a single UI component) so it fires regardless
  // of whether the character is viewed via desktop or mobile, keeping GM-side
  // consumers that read characters.force_rating directly from going stale.
  useEffect(() => {
    if (!character) return
    if (derivedForceRating === character.force_rating) return
    supabase
      .from('characters')
      .update({ force_rating: derivedForceRating })
      .eq('id', character.id)
      .then(({ error }) => {
        if (error) console.warn('[force_rating write-back] failed:', error.message)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedForceRating, character?.id])

  const hudSkills = useMemo((): HudSkill[] => {
    if (!character) return []
    const charSkillMap = Object.fromEntries(skills.map(s => [s.skill_key, s]))

    // Species-granted starting ranks: key → rank_start
    const speciesRankBonus: Record<string, number> = {}
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type !== 'skill_rank') continue
      for (const sk of (sa.affected_skills ?? [])) {
        speciesRankBonus[sk] = (speciesRankBonus[sk] ?? 0) + (sa.rank_start ?? 0)
      }
    }

    // Talent-granted career flags: set of skill keys promoted by purchased talents
    const talentCareerSkills = new Set<string>()
    for (const t of talents) {
      const mods = refTalentMap[t.talent_key]?.modifiers
      if (!mods?.career_skills) continue
      for (const sk of mods.career_skills) talentCareerSkills.add(sk)
    }

    return refSkills.map(rs => {
      const cs      = charSkillMap[rs.key]
      const charKey = CHARACTERISTIC_ABBR[rs.characteristic_key]
      const charVal = (character[charKey as keyof Character] as number) || 0
      return {
        key: rs.key, name: rs.name,
        charKey, charVal,
        rank:     (cs?.rank ?? 0) + (speciesRankBonus[rs.key] ?? 0),
        isCareer: (cs?.is_career ?? false) || talentCareerSkills.has(rs.key),
        type: rs.type,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [character, skills, refSkills, speciesAbilities, talents, refTalentMap])

  const hudTalents = useMemo((): HudTalent[] => {
    const map = new Map<string, HudTalent>()
    for (const t of talents) {
      const ref = refTalentMap[t.talent_key]
      const existing = map.get(t.talent_key)
      if (existing) {
        existing.rank = (existing.rank ?? 0) + (t.ranks ?? 1)
      } else {
        map.set(t.talent_key, {
          key:        t.talent_key,
          name:       ref?.name || t.talent_key,
          rank:       t.ranks ?? 1,
          activation: ref ? ACTIVATION_LABELS[ref.activation] || ref.activation : 'Passive',
          description: ref?.description,
        })
      }
    }
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue
      const ref = refTalentMap[sa.talent_key]
      if (!ref) continue
      const existing = map.get(sa.talent_key)
      if (existing) {
        existing.rank = (existing.rank ?? 0) + (sa.rank_add ?? 1)
      } else {
        map.set(sa.talent_key, {
          key:              `species_${sa.talent_key}`,
          name:             ref.name,
          rank:             sa.rank_add ?? 1,
          activation:       ACTIVATION_LABELS[ref.activation] || ref.activation,
          description:      ref.description,
          isSpeciesGranted: true,
        })
      }
    }
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type !== 'die_modifier') continue
      if (!Array.isArray(sa.affected_skills) || sa.affected_skills.length === 0) continue
      const cardKey = `species_die_${sa.key}`
      if (!map.has(cardKey)) {
        map.set(cardKey, {
          key:              cardKey,
          name:             sa.name,
          rank:             1,
          activation:       'Passive',
          description:      sa.description,
          isSpeciesGranted: true,
        })
      }
    }
    return Array.from(map.values())
  }, [talents, refTalentMap, speciesAbilities])

  const VALID_CONDITIONS = new Set<string>(['undamaged', 'minor', 'moderate', 'major', 'destroyed'])

  const hudWeapons = useMemo((): WpnDisplay[] =>
    weapons.map(w => {
      const ref           = w.weapon_key ? refWeaponMap[w.weapon_key] : null
      const isMeleeSkill  = ['MELEE', 'BRAWL', 'LTSABER'].includes(ref?.skill_key || '')
      const hasBrawnScale = isMeleeSkill && ref?.damage_add != null
      const baseDamage    = hasBrawnScale ? (ref.damage_add ?? 0) : (ref?.damage || 0)
      const quals         = Array.isArray(ref?.qualities)
        ? ref.qualities.map((q: { key: string; count?: number }) => ({ key: q.key, count: q.count }))
        : []
      return {
        id:          w.id,
        name:        w.custom_name || ref?.name || w.weapon_key || 'Unknown',
        damage:      { baseDamage, isMelee: hasBrawnScale, brawn: hasBrawnScale ? (character?.brawn ?? 0) : 0 },
        crit:        ref?.crit || 0,
        range:       ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : '',
        enc:         ref?.encumbrance || 0,
        hardPoints:  ref?.hard_points || 0,
        qualities:   quals,
        equipState:  w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
        skillName:   ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : '',
        description: ref?.description ?? null,
        condition:      (VALID_CONDITIONS.has(w.condition ?? '') ? w.condition : 'undamaged') as ItemCondition,
        item_image_url: w.item_image_url ?? null,
        iconUrl:        w.weapon_key ? `/images/equipment/weapon-${w.weapon_key}.png` : null,
        stowLocation:   w.equip_state === 'stowed' && w.stow_location_id && w.stow_location_type
          ? { id: w.stow_location_id, name: w.stow_location_name ?? '', type: w.stow_location_type }
          : null,
      }
    })
  , [weapons, refWeaponMap, refSkillMap, character?.brawn])

  const hudArmor = useMemo((): ArmDisplay[] =>
    armor.map(a => {
      const ref = a.armor_key ? refArmorMap[a.armor_key] : null
      return {
        id:          a.id,
        name:        a.custom_name || ref?.name || a.armor_key || 'Armor',
        soak:        ref?.soak || 0,
        defense:     ref?.defense || 0,
        enc:         ref?.encumbrance || 0,
        hardPoints:  ref?.hard_points || 0,
        rarity:      ref?.rarity || 0,
        equipState:  a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
        description: ref?.description ?? null,
        condition:      (VALID_CONDITIONS.has(a.condition ?? '') ? a.condition : 'undamaged') as ItemCondition,
        item_image_url: a.item_image_url ?? null,
        iconUrl:        a.armor_key ? `/images/equipment/armor-${a.armor_key}.png` : null,
        stowLocation:   a.equip_state === 'stowed' && a.stow_location_id && a.stow_location_type
          ? { id: a.stow_location_id, name: a.stow_location_name ?? '', type: a.stow_location_type }
          : null,
      }
    })
  , [armor, refArmorMap])

  const hudGear = useMemo((): GearRow[] =>
    gear.map(g => {
      const ref = g.gear_key ? refGearMap[g.gear_key] : null
      return {
        id:          g.id,
        name:        g.custom_name || ref?.name || g.gear_key || 'Gear',
        qty:         g.quantity,
        enc:         ref?.encumbrance || 0,
        equipState:  g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
        description: ref?.description ?? null,
        condition:      (VALID_CONDITIONS.has(g.condition ?? '') ? g.condition : 'undamaged') as ItemCondition,
        item_image_url: g.item_image_url ?? null,
        iconUrl:        g.gear_key ? `/images/equipment/gear-${g.gear_key}.png` : null,
        stowLocation:   g.equip_state === 'stowed' && g.stow_location_id && g.stow_location_type
          ? { id: g.stow_location_id, name: g.stow_location_name ?? '', type: g.stow_location_type }
          : null,
      }
    })
  , [gear, refGearMap])

  const encumbranceCurrent = useMemo(() => {
    let sum = 0
    for (const a of armor) {
      const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      const enc = refArmorMap[a.armor_key]?.encumbrance || 0
      sum += state === 'equipped' ? Math.max(0, enc - 3) : enc
    }
    for (const g of gear) {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refGearMap[g.gear_key]?.encumbrance || 0
    }
    for (const w of weapons) {
      const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refWeaponMap[w.weapon_key]?.encumbrance || 0
    }
    return sum
  }, [armor, gear, weapons, refArmorMap, refGearMap, refWeaponMap])

  const encumbranceBonus = useMemo(() => {
    const gearBonus = gear.reduce((s, g) => {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      const ref = refGearMap[g.gear_key]
      return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
    }, 0)
    const armorBonus = armor.reduce((s, a) => {
      const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying')
      const ref = refArmorMap[a.armor_key]
      return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
    }, 0)
    return gearBonus + armorBonus
  }, [gear, refGearMap, armor, refArmorMap])

  // ── End HUD transforms ───────────────────────────────────────────────────────

  const handleBuySpecialization = async (specKey: string, setActiveSpecKey: (key: string) => void) => {
    if (!character) return
    markSelf()
    return buySpecialization({
      character, charSpecs, refSpecMap, refCareers, refSkills, careerSpecKeys, forceRating,
      supabase, setCharacter, setCharSpecs, setPendingForceRatingOffer, setSkills,
    }, specKey, setActiveSpecKey)
  }

  const {
    availableSigAbilities: sigAbilities,
    lockedAbilities: lockedSigAbilities,
    purchasedNodes: purchasedSigNodes,
    hasUnlockedTier5,
    lockInAbility,
    purchaseNode: purchaseSigNode,
  } = useCharacterSigAbilities(characterId, character?.career_key ?? '')

  return {
    // State
    character, skills, talents, weapons, armor, gear, crits, charSpecs,
    charForceAbilities, playerName, loading, error,
    // Ref data
    refSkills, refTalents, refWeapons, refArmor, refGear, refCrits, refSpecs,
    refDescriptors, refCareers, refSpeciesAll, refForcePowers, refForceAbilities, refWeaponQualities,
    refObligationTypes, refDutyTypes,
    // Ref maps
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap,
    refSpecMap, refDescriptorMap, refForcePowerMap, refForceAbilityMap, refWeaponQualityMap,
    refAttachmentMap,
    // Derived
    forceRating,
    careerForceRatingBase,
    careerSpecKeys,
    specKeyToCareerName,
    pendingForceRatingOffer,
    setPendingForceRatingOffer,
    // HUD transforms
    speciesAbilities, hudSkills, hudTalents, hudWeapons, hudArmor, hudGear,
    encumbranceCurrent, encumbranceBonus,
    // Supabase client (for broadcast listener in page)
    supabase,
    // Mutations
    handleVitalChange,
    handleVitalAdjust,
    handleBuySkill,
    handleToggleWeaponEquipped,
    handleToggleEquippedById,
    handleSetEquipState,
    handleRollCrit,
    handleHealCrit,
    handlePortraitUpload,
    handlePortraitDelete,
    handleCharacteristicChange,
    handleSoakChange,
    handleDefenseChange,
    handleMoralityChange,
    handleMoralityKeyChange,
    handleObligationChange,
    handleDutyChange,
    handleRemoveWeapon,
    handleRemoveEquipment,
    handleRemoveTalent,
    handleReduceSkill,
    handlePurchaseTalent,
    handleResolveDedication,
    handleCancelDedication,
    handleCreditSpend,
    handleBackstoryChange,
    handleNotesChange,
    handlePurchaseForceAbility,
    handlePurchaseForceRating,
    handleBuySpecialization,
    // Signature abilities
    sigAbilities,
    lockedSigAbilities,
    purchasedSigNodes,
    hasUnlockedTier5,
    lockInAbility,
    purchaseSigNode,
  }
}
