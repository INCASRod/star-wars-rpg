'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { getRefData } from '@/lib/refDataCache'
import { useCharacterSigAbilities } from '@/hooks/useCharacterSigAbilities'
import { useForcePowers } from '@/hooks/useForcePowers'
import { countOwnedRanks } from '@/lib/derivedStats'
import {
  purchaseTalent, removeTalent, resolveDedication, cancelDedication, buySpecialization,
  purchaseForceAbility,
  type TalentMutationDeps, type ForceAbilityMutationDeps,
} from '@/hooks/useCharacterData'
import type {
  Character, CharacterTalent, CharacterSpecialization,
  RefSkill, RefTalent, RefSpecialization, RefCareer,
  CharacterForceAbility, RefForcePower, RefForceAbility,
} from '@/lib/types'

/**
 * Lean data hook for /character/[id]/talents (Prompt 7a) — fetches only what
 * TalentSurface and the route's header/rail actually render, instead of
 * mounting the full useCharacterData (26 queries, ~3.8MB, ~68% of it
 * weapons/armor/gear/species/crits/etc. this surface never touches).
 *
 * Purchase/XP logic is NOT duplicated here — every mutation below delegates
 * to the same standalone functions useCharacterData itself now calls
 * (exported from useCharacterData.ts), so the XP-race-safe fresh-read
 * pattern lives in exactly one place.
 *
 * Two independent fetch batches, fired in parallel (not one-after-the-other),
 * so the route can paint progressively:
 *   - shell: character, character_specializations, ref_specializations,
 *     ref_careers, ref_skills — everything the header/rail need.
 *   - tree: character_talents, ref_talents (+ custom) — everything
 *     buildCharacterTalentTree needs.
 * Each batch flips its own ready flag independently — shellReady does not
 * wait on treeReady or vice versa.
 *
 * Signature-ability data is owned entirely by useCharacterSigAbilities,
 * unchanged — it starts as soon as career_key (part of the shell batch)
 * resolves, no longer gated behind the old 26-query batch.
 */
export function useTalentSurfaceData(characterId: string) {
  const [character, setCharacter] = useState<Character | null>(null)
  const [charSpecs, setCharSpecs] = useState<CharacterSpecialization[]>([])
  const [refSpecs, setRefSpecs] = useState<RefSpecialization[]>([])
  const [refCareers, setRefCareers] = useState<RefCareer[]>([])
  const [refSkills, setRefSkills] = useState<RefSkill[]>([])
  const [shellReady, setShellReady] = useState(false)
  const [shellError, setShellError] = useState<string | null>(null)

  const [talents, setTalents] = useState<CharacterTalent[]>([])
  const [refTalents, setRefTalents] = useState<RefTalent[]>([])
  const [treeReady, setTreeReady] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)

  const [pendingForceRatingOffer, setPendingForceRatingOffer] = useState(false)

  // ── Force powers (Prompt F3) — independent third batch, same shape as sig:
  // never gates shellReady/treeReady, paints its own loading state. Scoped to
  // avoid the load-time regression a naive "fetch everything" would cause:
  // ref_force_powers/ref_force_abilities are NOT part of the shared
  // refDataCache (unlike specs/talents/careers/skills) because they're not
  // needed by every character — most characters on this route never open the
  // Force destination at all. `refForcePowersOwned`/`refForceAbilitiesOwned`
  // are scoped to just the powers this character actually owns (2-4 rows for
  // both real test characters, never all 25) — full ability_tree detail only
  // for those. `powerBrowseList` is a separate, deliberately lightweight
  // fetch (key/name/min_force_rating only, no ability_tree JSONB) covering
  // all 25 powers, for the "start a new Force power" affordance — the same
  // browse set the old HudForcePowerTreeModal's tab list drew from.
  const [charForceAbilities, setCharForceAbilities] = useState<CharacterForceAbility[]>([])
  const [refForcePowersOwned, setRefForcePowersOwned] = useState<RefForcePower[]>([])
  const [refForceAbilitiesOwned, setRefForceAbilitiesOwned] = useState<RefForceAbility[]>([])
  const [powerBrowseList, setPowerBrowseList] = useState<{ key: string; name: string; min_force_rating: number }[]>([])
  const [forceReady, setForceReady] = useState(false)
  const [forceError, setForceError] = useState<string | null>(null)
  // Powers explicitly opened from the "start a new Force power" browse list —
  // not yet owned, but the player has selected one and needs to see its base
  // power/cost to make the first purchase. Merged with the owned-key set on
  // every loadForce() call (below) so a later realtime refetch never drops it
  // back out mid-session.
  const [extraLoadedPowerKeys, setExtraLoadedPowerKeys] = useState<string[]>([])

  const supabase = useMemo(() => createClient(), [])

  const loadShell = useCallback(async () => {
    try {
      const ds = await fetchActiveDataset(supabase)
      // ref_specializations/ref_careers/ref_skills come from the shared cache
      // (Prompt 7c) — a warm cache (e.g. arriving from the sheet, which
      // fetches the same tables) means this leg resolves instantly with zero
      // network requests. Only `characters`/`character_specializations` are
      // real per-navigation queries now.
      const [refData, charRes, specsRes] = await Promise.all([
        getRefData(ds),
        supabase.from('characters').select('*').eq('id', characterId).single(),
        supabase.from('character_specializations').select('*').eq('character_id', characterId),
      ])
      if (charRes.error) throw new Error(charRes.error.message)

      // Same cross-dataset/retired-spec fallback as useCharacterData — an
      // owned spec must never drop out of refSpecMap even if it's retired or
      // from the inactive dataset. Character-specific, so it stays outside
      // the shared cache (see refDataCache.ts's header comment).
      let mergedRefSpecs = refData.refSpecializations
      const loadedSpecKeys = new Set(mergedRefSpecs.map(s => s.key))
      const charSpecKeys = ((specsRes.data as CharacterSpecialization[]) || []).map(cs => cs.specialization_key)
      const missingSpecKeys = charSpecKeys.filter(k => !loadedSpecKeys.has(k))
      if (missingSpecKeys.length > 0) {
        const { data: fallbackSpecs } = await supabase.from('ref_specializations').select('*').in('key', missingSpecKeys)
        if (fallbackSpecs) mergedRefSpecs = [...mergedRefSpecs, ...(fallbackSpecs as RefSpecialization[])]
      }

      setCharacter(charRes.data as Character)
      setCharSpecs(((specsRes.data as CharacterSpecialization[]) || []).slice().sort((a, b) => a.purchase_order - b.purchase_order))
      setRefSpecs(mergedRefSpecs)
      setRefCareers(refData.refCareers)
      setRefSkills(refData.refSkills)
    } catch (err: unknown) {
      setShellError(err instanceof Error ? err.message : String(err))
    }
    setShellReady(true)
  }, [characterId, supabase])

  const loadTree = useCallback(async () => {
    try {
      const ds = await fetchActiveDataset(supabase)
      // ref_talents comes from the shared cache — same in-flight promise as
      // loadShell's getRefData(ds) call when both fire together (module-level
      // de-dup, not a second request).
      const [refData, talentsRes] = await Promise.all([
        getRefData(ds),
        supabase.from('character_talents').select('*').eq('character_id', characterId),
      ])
      setTalents((talentsRes.data as CharacterTalent[]) || [])
      setRefTalents(refData.refTalents)
    } catch (err: unknown) {
      setTreeError(err instanceof Error ? err.message : String(err))
    }
    setTreeReady(true)
  }, [characterId, supabase])

  const loadForce = useCallback(async () => {
    try {
      const ds = await fetchActiveDataset(supabase)
      // character_force_abilities is cheap regardless (per-character rows) —
      // fetched first so the two ref queries below can be scoped to only the
      // power keys this character actually owns, never all 25.
      const forceAbilRes = await supabase.from('character_force_abilities').select('*').eq('character_id', characterId)
      const ownedAbilities = (forceAbilRes.data as CharacterForceAbility[]) || []
      // Merged with extraLoadedPowerKeys (browse-list selections not yet
      // owned) so this refetch — including the one the realtime subscription
      // below fires on every unrelated purchase — never drops a still-unowned
      // but explicitly-opened power back out of scope.
      const scopeKeys = [...new Set([...ownedAbilities.map(a => a.force_power_key), ...extraLoadedPowerKeys])]

      const [powersRes, abilitiesRes, browseRes] = await Promise.all([
        scopeKeys.length > 0
          ? supabase.from('ref_force_powers').select('*').eq('dataset_source', ds).eq('is_retired', false).in('key', scopeKeys)
          : Promise.resolve({ data: [] as RefForcePower[] }),
        scopeKeys.length > 0
          ? supabase.from('ref_force_abilities').select('*').eq('dataset_source', ds).eq('is_retired', false).in('power_key', scopeKeys)
          : Promise.resolve({ data: [] as RefForceAbility[] }),
        // Lightweight — no ability_tree column — for the "start a new Force
        // power" browse list, which legitimately needs all 25, not just owned.
        supabase.from('ref_force_powers').select('key,name,min_force_rating').eq('dataset_source', ds).eq('is_retired', false),
      ])

      setCharForceAbilities(ownedAbilities)
      setRefForcePowersOwned((powersRes.data as RefForcePower[]) || [])
      setRefForceAbilitiesOwned((abilitiesRes.data as RefForceAbility[]) || [])
      setPowerBrowseList(((browseRes.data as { key: string; name: string; min_force_rating: number }[]) || []).sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err: unknown) {
      setForceError(err instanceof Error ? err.message : String(err))
    }
    setForceReady(true)
  }, [characterId, supabase, extraLoadedPowerKeys])

  /** Called when the rail's "start a new Force power" list selects a power
   * that isn't owned yet — a no-op if it's already in scope (owned or
   * previously ensured), otherwise triggers one extra loadForce() re-fetch
   * scoped to include it. */
  const ensurePowerLoaded = useCallback((powerKey: string) => {
    setExtraLoadedPowerKeys(prev => prev.includes(powerKey) ? prev : [...prev, powerKey])
  }, [])

  // Three batches fire together on mount — none awaits the others (same
  // contract as shell/tree). Split into two effects (not one shared
  // dependency array) because loadForce's identity changes whenever
  // ensurePowerLoaded adds a browse-list selection — bundling shell/tree into
  // that same effect would needlessly re-fetch them every time a new Force
  // power is opened, not just once on mount.
  useEffect(() => { loadShell(); loadTree() }, [loadShell, loadTree])
  useEffect(() => { loadForce() }, [loadForce])

  // ── Realtime — only the tables this route actually renders. Weapons/armor/
  // gear/crits are deliberately not subscribed here; this route never fetches
  // or displays them (PlayerHUDDesktop's useCharacterData still subscribes to
  // those, unaffected by this hook). character_force_abilities IS subscribed
  // (Prompt F3) — this route now renders Force power trees too.
  useEffect(() => {
    const channel = supabase
      .channel(`talent-surface-${characterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters', filter: `id=eq.${characterId}` }, () => loadShell())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents', filter: `character_id=eq.${characterId}` }, () => loadTree())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_specializations', filter: `character_id=eq.${characterId}` }, () => loadShell())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_force_abilities', filter: `character_id=eq.${characterId}` }, () => loadForce())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [characterId, supabase, loadShell, loadTree, loadForce])

  const refSpecMap = useMemo(() => Object.fromEntries(refSpecs.map(s => [s.key, s])), [refSpecs])
  const refTalentMap = useMemo(() => Object.fromEntries(refTalents.map(t => [t.key, t])), [refTalents])
  const refSkillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])), [refSkills])

  const careerSpecKeys = useMemo(() => {
    const currentCareer = refCareers.find(c => c.key === character?.career_key)
    return new Set(currentCareer?.specialization_keys ?? [])
  }, [refCareers, character?.career_key])

  const specKeyToCareerName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const career of refCareers) {
      for (const specKey of career.specialization_keys ?? []) {
        if (!(specKey in map)) map[specKey] = career.name
      }
    }
    return map
  }, [refCareers])

  const careerForceRatingBase = useMemo(() =>
    refCareers.find(c => c.key === character?.career_key)?.force_rating ?? 0
  , [refCareers, character?.career_key])

  const forceRating = useMemo(() => {
    const talentBonus    = countOwnedRanks(talents, t => t.talent_key === 'FORCERAT', t => t.ranks || 1)
    const purchasedBonus = character?.force_rating_purchased ? 1 : 0
    return careerForceRatingBase + talentBonus + purchasedBonus
  }, [talents, careerForceRatingBase, character?.force_rating_purchased])

  const talentMutationDeps = (): TalentMutationDeps => ({
    character: character!, talents, refTalentMap, supabase, setCharacter, setTalents,
  })

  const handlePurchaseTalent = async (talentKey: string, row: number, col: number, activeSpecKey: string) => {
    if (!character) return
    return purchaseTalent(talentMutationDeps(), talentKey, row, col, activeSpecKey)
  }
  const handleRemoveTalent = async (talentId: string, xpCost: number) => {
    if (!character) return
    await removeTalent(talentMutationDeps(), talentId, xpCost)
  }
  const handleResolveDedication = async (talentId: string, charKey: string) => {
    if (!character) return
    await resolveDedication(talentMutationDeps(), talentId, charKey)
  }
  const handleCancelDedication = async (talentId: string, xpCost: number) => {
    if (!character) return
    await cancelDedication(talentMutationDeps(), talentId, xpCost)
  }
  const handleBuySpecialization = async (specKey: string, setActiveSpecKey: (key: string) => void) => {
    if (!character) return
    // No setSkills passed — this route never fetches character_skills, so
    // there is no local skills state to sync. The DB-side is_career resync
    // inside buySpecialization runs regardless (persistCareerSkills doesn't
    // read local state either).
    return buySpecialization({
      character, charSpecs, refSpecMap, refCareers, refSkills, careerSpecKeys, forceRating,
      supabase, setCharacter, setCharSpecs, setPendingForceRatingOffer,
    }, specKey, setActiveSpecKey)
  }

  // ── Force powers (Prompt F3) ──
  const refForcePowerMap = useMemo(() => Object.fromEntries(refForcePowersOwned.map(fp => [fp.key, fp])), [refForcePowersOwned])
  const refForceAbilityMap = useMemo(() => Object.fromEntries(refForceAbilitiesOwned.map(fa => [fa.key, fa])), [refForceAbilitiesOwned])
  // allForcePowers, scoped to refForcePowersOwned, naturally contains only the
  // powers this character owns — the exact same hook ForcePanel.tsx already
  // uses, not a reimplementation.
  const { allForcePowers, buildForcePowerTree } = useForcePowers({
    charForceAbilities, refForcePowers: refForcePowersOwned, refForceAbilityMap, refForcePowerMap,
  })

  const handlePurchaseForceAbility = async (abilityKey: string, row: number, col: number, cost: number, activeForcePowerKey: string) => {
    if (!character) return
    const deps: ForceAbilityMutationDeps = {
      character, charForceAbilities, forceRating, refForcePowerMap, refForceAbilityMap,
      supabase, setCharacter, setCharForceAbilities,
    }
    return purchaseForceAbility(deps, abilityKey, row, col, cost, activeForcePowerKey)
  }

  const {
    availableSigAbilities: sigAbilities,
    lockedAbilities: lockedSigAbilities,
    purchasedNodes: purchasedSigNodes,
    hasUnlockedTier5,
    lockInAbility,
    purchaseNode: purchaseSigNode,
    loading: sigLoading,
  } = useCharacterSigAbilities(characterId, character?.career_key ?? '')

  return {
    // Shell state
    character, charSpecs, shellReady, shellError,
    refSpecs, refSpecMap, refCareers, refSkillMap,
    careerSpecKeys, specKeyToCareerName,
    // Tree state
    talents, refTalentMap, treeReady, treeError,
    // Force rating (needed by handleBuySpecialization's pending-offer trigger)
    pendingForceRatingOffer, setPendingForceRatingOffer,
    // Supabase client (route reuses it for the ui_theme lookup)
    supabase,
    // Mutations — thin wrappers over the shared standalone functions
    handlePurchaseTalent, handleRemoveTalent, handleBuySpecialization,
    handleResolveDedication, handleCancelDedication,
    // Signature abilities
    sigAbilities, lockedSigAbilities, purchasedSigNodes, hasUnlockedTier5,
    lockInAbility, purchaseSigNode, sigLoading,
    // Force powers (Prompt F3) — forceRating is the SAME value
    // handleBuySpecialization above already uses; no second source of truth.
    forceRating, allForcePowers, buildForcePowerTree, refForcePowerMap,
    powerBrowseList, forceReady, forceError, handlePurchaseForceAbility, ensurePowerLoaded,
  }
}
