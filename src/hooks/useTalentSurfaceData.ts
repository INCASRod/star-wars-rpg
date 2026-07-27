'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { getRefData } from '@/lib/refDataCache'
import { useCharacterSigAbilities } from '@/hooks/useCharacterSigAbilities'
import { countOwnedRanks } from '@/lib/derivedStats'
import {
  purchaseTalent, removeTalent, resolveDedication, cancelDedication, buySpecialization,
  type TalentMutationDeps,
} from '@/hooks/useCharacterData'
import type {
  Character, CharacterTalent, CharacterSpecialization,
  RefSkill, RefTalent, RefSpecialization, RefCareer,
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

  // Both batches fire together — neither awaits the other.
  useEffect(() => { loadShell(); loadTree() }, [loadShell, loadTree])

  // ── Realtime — only the tables this route actually renders. Weapons/armor/
  // gear/crits/force-abilities are deliberately not subscribed here; this
  // route never fetches or displays them (PlayerHUDDesktop's useCharacterData
  // still subscribes to those, unaffected by this hook).
  useEffect(() => {
    const channel = supabase
      .channel(`talent-surface-${characterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters', filter: `id=eq.${characterId}` }, () => loadShell())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents', filter: `character_id=eq.${characterId}` }, () => loadTree())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_specializations', filter: `character_id=eq.${characterId}` }, () => loadShell())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [characterId, supabase, loadShell, loadTree])

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
  }
}
