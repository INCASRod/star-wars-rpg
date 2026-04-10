'use client'

import { Suspense, useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HudCard } from '@/components/ui/HudCard'
import { stripBBCode } from '@/lib/utils'
import { SpecSelectorList } from '@/components/shared/SpecSelectorList'
import { TalentTree } from '@/components/character/TalentTree'
import { buildTalentTree } from '@/lib/buildTalentTree'
import type {
  RefSpecies, RefCareer, RefSpecialization, RefSkill, RefTalent,
  RefMotivation, RefSpecificMotivation,
} from '@/lib/types'

// ── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  'Background', 'Obligation', 'Duty', 'Species',
  'Career', 'Specialisation', 'XP Investment', 'Motivation', 'Review',
]
const ROW_COSTS = [5, 10, 15, 20, 25]
const CHAR_KEYS = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
const CHAR_SHORT: Record<typeof CHAR_KEYS[number], string> = {
  brawn: 'Br', agility: 'Ag', intellect: 'Int', cunning: 'Cun', willpower: 'Wil', presence: 'Pr',
}

const CHAR_DESC: Record<typeof CHAR_KEYS[number], string> = {
  brawn:     'Raw physical power, toughness, and resilience. Determines your Soak Value and contributes to melee weapon damage. High Brawn makes you harder to injure and hit harder in close quarters.',
  agility:   'Coordination, reflexes, and fine motor control. Governs ranged combat and acrobatic feats. A high Agility makes you a deadly shot and difficult to pin down.',
  intellect: 'Intelligence, memory, and reasoning ability. Covers technical, medical, and knowledge-based skills. High Intellect characters excel at analysis, repair, and scholarly pursuits.',
  cunning:   'Practical cleverness, instinct, and resourcefulness. Governs deception, streetwise, and survival. Cunning characters think on their feet and exploit every advantage.',
  willpower: 'Mental discipline, grit, and inner resolve. Sets your Strain Threshold and governs Force-sensitive abilities. High Willpower lets you push through stress and resist coercion.',
  presence:  'Charisma, confidence, and force of personality. Covers social skills like Charm, Leadership, and Negotiation. A high Presence commands attention and inspires allies.',
}

// Obligation starting value by player count
function startingObligationByCount(count: number): number {
  if (count <= 2) return 20
  if (count === 3) return 15
  return 10
}

// Source → filter tab label
const SOURCE_TAB_MAP: Record<string, string> = {
  'Age of Rebellion Core Rulebook': 'AoR',
  'Edge of the Empire Core Rulebook': 'EotE',
  'Force and Destiny Core Rulebook': 'F&D',
}
function sourceToTab(source: string | null | undefined): string {
  if (!source) return 'Other'
  for (const [k, v] of Object.entries(SOURCE_TAB_MAP)) {
    if (source.includes(k.split(' ')[0]) && source.includes(k.split(' ')[source.split(' ').length - 1])) {
      // rough match
    }
  }
  if (source.includes('Age of Rebellion')) return 'AoR'
  if (source.includes('Edge of the Empire')) return 'EotE'
  if (source.includes('Force and Destiny')) return 'F&D'
  return 'Other'
}

// BBCode stripping for display
function parseBB(html: string): string {
  return html
    .replace(/\[H4\]([\s\S]*?)\[h4\]/g, '<strong style="display:block;margin-top:0.5rem;font-weight:700;color:var(--ink)">$1</strong>')
    .replace(/\[B\]([\s\S]*?)\[b\]/g, '<strong>$1</strong>')
    .replace(/\[P\]/g, '<br/><br/>')
    .replace(/\[I\]([\s\S]*?)\[i\]/g, '<em>$1</em>')
    .replace(/\[BR\]/gi, '<br/>')
}

// ── Draft types ───────────────────────────────────────────────────────────────
interface TalentPick { key: string; specKey: string; row: number; col: number; cost: number }

interface CharacterDraft {
  // Step 0: Background
  name: string
  playerName: string
  gender: string
  backstory: string
  // Step 1: Obligation
  obligationType: string
  obligationDesc: string
  oblXp5: boolean
  oblXp10: boolean
  oblCred1k: boolean
  oblCred2k5: boolean
  // Step 2: Duty
  dutyType: string
  dutyDesc: string
  // Step 3: Species
  species: RefSpecies | null
  speciesOptionKey: string
  // Step 4: Career
  career: RefCareer | null
  freeCareerPicks: string[]   // 4 picks from career skills
  // Step 5: Specialisation
  specialization: RefSpecialization | null
  freeSpecPicks: string[]     // 2 picks from spec bonus skills
  additionalSpecs: RefSpecialization[]
  // Step 6: XP Investment (characteristics from species base, modified here)
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  skillRanks: Record<string, number>  // XP-purchased ranks (beyond free)
  talentPicks: TalentPick[]
  // Step 7: Motivation
  motivationType: string
  motivationSpecific: string
  motivationDesc: string
}

const DEFAULT_DRAFT: CharacterDraft = {
  name: '', playerName: '', gender: '', backstory: '',
  obligationType: '', obligationDesc: '', oblXp5: false, oblXp10: false, oblCred1k: false, oblCred2k5: false,
  dutyType: '', dutyDesc: '',
  species: null, speciesOptionKey: '',
  career: null, freeCareerPicks: [],
  specialization: null, freeSpecPicks: [], additionalSpecs: [],
  brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2,
  skillRanks: {}, talentPicks: [],
  motivationType: '', motivationSpecific: '', motivationDesc: '',
}

// ── Shared style helpers ──────────────────────────────────────────────────────
const S = {
  labelXs: {
    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
    fontWeight: 700, letterSpacing: '0.12rem', color: 'var(--txt3)',
    display: 'block', marginBottom: '0.3rem',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: 'var(--sp-sm) var(--sp-md)',
    border: '1px solid var(--bdr-l)', background: 'var(--white)',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
    letterSpacing: '0.05rem', outline: 'none',
  } as React.CSSProperties,
  select: {
    width: '100%', padding: 'var(--sp-sm) var(--sp-md)',
    border: '1px solid var(--bdr-l)', background: 'var(--white)',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
    cursor: 'pointer',
  } as React.CSSProperties,
  goldBtn: {
    background: 'var(--creator-primary, var(--gold))', border: 'none',
    padding: 'var(--sp-sm) var(--sp-lg)',
    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
    fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
    letterSpacing: '0.15rem', transition: '.2s', width: '100%',
  } as React.CSSProperties,
  ghostBtn: {
    background: 'rgba(255,255,255,.5)', border: '1px solid var(--bdr-l)',
    padding: 'var(--sp-sm) var(--sp-lg)',
    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
    fontWeight: 600, color: 'var(--txt2)', cursor: 'pointer',
    letterSpacing: '0.1rem',
  } as React.CSSProperties,
  skillPill: (isCareer: boolean) => ({
    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
    letterSpacing: '0.04rem',
    color: isCareer ? '#d64d8a' : 'var(--txt2)',
    background: isCareer ? 'rgba(214,77,138,.08)' : 'rgba(0,0,0,.04)',
    border: `1px solid ${isCareer ? 'rgba(214,77,138,.3)' : 'var(--bdr-l)'}`,
    padding: '0.06rem 0.4rem', whiteSpace: 'nowrap' as const,
  }),
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT — Suspense wrapper
// ══════════════════════════════════════════════════════════════════════════════
export default function CreateCharacterPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-orbitron)', color: 'var(--gold-d)', fontSize: 'var(--font-xl)', letterSpacing: '0.3rem' }}>
        INITIALIZING...
      </div>
    }>
      <CreateWizard />
    </Suspense>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  WIZARD — main state + orchestration
// ══════════════════════════════════════════════════════════════════════════════
function CreateWizard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [playerCount, setPlayerCount] = useState(4)

  // ── Nemesis mode ────────────────────────────────────────────────────────────
  const [isNemesisMode,          setIsNemesisMode]          = useState(false)
  const [showNemesisPinModal,    setShowNemesisPinModal]    = useState(false)
  const [nemesisPinInput,        setNemesisPinInput]        = useState('')
  const [nemesisPinError,        setNemesisPinError]        = useState(false)
  const [nemesisPinShake,        setNemesisPinShake]        = useState(false)
  const [showNemesisCancelConfirm, setShowNemesisCancelConfirm] = useState(false)
  const [draft, setDraft] = useState<CharacterDraft>(DEFAULT_DRAFT)

  // Ref data
  const [species, setSpecies] = useState<RefSpecies[]>([])
  const [careers, setCareers] = useState<RefCareer[]>([])
  const [specializations, setSpecializations] = useState<RefSpecialization[]>([])
  const [refSkills, setRefSkills] = useState<RefSkill[]>([])
  const [refTalents, setRefTalents] = useState<RefTalent[]>([])
  const [obligationTypes, setObligationTypes] = useState<{ key: string; name: string; description?: string }[]>([])
  const [dutyTypes, setDutyTypes] = useState<{ key: string; name: string; description?: string }[]>([])
  const [motivations, setMotivations] = useState<RefMotivation[]>([])
  const [specificMotivations, setSpecificMotivations] = useState<RefSpecificMotivation[]>([])

  useEffect(() => {
    if (!campaignId) return
    async function load() {
      const [spRes, carRes, specRes, skRes, talRes, oblRes, dutRes, motRes, smRes, pcRes] = await Promise.all([
        supabase.from('ref_species').select('*').order('name'),
        supabase.from('ref_careers').select('*').order('name'),
        supabase.from('ref_specializations').select('*').order('name'),
        supabase.from('ref_skills').select('*').order('name'),
        supabase.from('ref_talents').select('*').order('name'),
        supabase.from('ref_obligation_types').select('key,name,description').order('name'),
        supabase.from('ref_duty_types').select('key,name,description').order('name'),
        supabase.from('ref_motivations').select('*').order('name'),
        supabase.from('ref_specific_motivations').select('*').order('name'),
        supabase.from('characters').select('id', { count: 'exact' }).eq('campaign_id', campaignId).eq('is_archived', false),
      ])
      setSpecies((spRes.data as RefSpecies[]) || [])
      setCareers((carRes.data as RefCareer[]) || [])
      setSpecializations((specRes.data as RefSpecialization[]) || [])
      setRefSkills((skRes.data as RefSkill[]) || [])
      setRefTalents((talRes.data as RefTalent[]) || [])
      setObligationTypes(oblRes.data || [])
      setDutyTypes(dutRes.data || [])
      setMotivations((motRes.data as RefMotivation[]) || [])
      setSpecificMotivations((smRes.data as RefSpecificMotivation[]) || [])
      const pc = pcRes.count || 4
      setPlayerCount(pc)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Auto-trigger nemesis mode from ?nemesis=1 param ──────────────────────
  const autoNemesis = searchParams.get('nemesis') === '1'
  useEffect(() => {
    if (autoNemesis) setShowNemesisPinModal(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNemesis])

  // ── Nemesis pin verification ──────────────────────────────────────────────
  const verifyNemesisPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!campaignId) return false
    const { data } = await supabase.from('campaigns').select('gm_pin').eq('id', campaignId).single()
    return data?.gm_pin === pin
  }, [campaignId, supabase])

  const handleNemesisPinSubmit = useCallback(async () => {
    const ok = await verifyNemesisPin(nemesisPinInput)
    if (ok) {
      setShowNemesisPinModal(false)
      setNemesisPinInput('')
      setNemesisPinError(false)
      setIsNemesisMode(true)
    } else {
      setNemesisPinError(true)
      setNemesisPinShake(true)
      setTimeout(() => setNemesisPinShake(false), 450)
    }
  }, [verifyNemesisPin, nemesisPinInput])

  const resetCreator = useCallback(() => {
    setIsNemesisMode(false)
    setStep(0)
    setDraft(DEFAULT_DRAFT)
    setShowNemesisCancelConfirm(false)
  }, [])

  // ── Computed maps ─────────────────────────────────────────────────────────
  const skillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])), [refSkills])
  const talentMap = useMemo(() => Object.fromEntries(refTalents.map(t => [t.key, t])), [refTalents])
  const specMap = useMemo(() => Object.fromEntries(specializations.map(s => [s.key, s])), [specializations])

  // ── All specs (first + additional) ───────────────────────────────────────
  const allSpecs = useMemo(() => {
    const list: RefSpecialization[] = []
    if (draft.specialization) list.push(draft.specialization)
    list.push(...draft.additionalSpecs)
    return list
  }, [draft.specialization, draft.additionalSpecs])

  // ── Career skill keys (career + all specs) ────────────────────────────────
  const careerSkillKeys = useMemo(() => {
    const keys = new Set<string>()
    draft.career?.career_skill_keys?.forEach(k => keys.add(k))
    allSpecs.forEach(s => s.career_skill_keys?.forEach(k => keys.add(k)))
    return keys
  }, [draft.career, allSpecs])

  // ── XP calculations ───────────────────────────────────────────────────────
  const baseXp = draft.species?.starting_xp || 0
  const oblXpBonus = (draft.oblXp5 ? 5 : 0) + (draft.oblXp10 ? 10 : 0)
  const xpTotal = baseXp + oblXpBonus

  const xpSpentOnChars = CHAR_KEYS.reduce((sum, key) => {
    const base = draft.species?.[key] ?? 2
    let cost = 0
    for (let i = base + 1; i <= draft[key]; i++) cost += i * 10
    return sum + cost
  }, 0)

  const xpSpentOnSkills = useMemo(() => {
    let total = 0
    for (const [skillKey, purchased] of Object.entries(draft.skillRanks)) {
      if (!purchased || purchased <= 0) continue
      const freeRanks = (draft.freeCareerPicks.includes(skillKey) ? 1 : 0) +
                        (draft.freeSpecPicks.includes(skillKey) ? 1 : 0)
      const isCareer = careerSkillKeys.has(skillKey)
      for (let r = freeRanks + 1; r <= freeRanks + purchased; r++) {
        total += isCareer ? r * 5 : (r * 5) + 5
      }
    }
    return total
  }, [draft.skillRanks, draft.freeCareerPicks, draft.freeSpecPicks, careerSkillKeys])

  const xpSpentOnTalents = useMemo(() =>
    draft.talentPicks.reduce((s, t) => s + t.cost, 0), [draft.talentPicks])

  const xpSpentOnAdditionalSpecs = useMemo(() => {
    let total = 0
    draft.additionalSpecs.forEach((spec, idx) => {
      const totalSpecsAfter = idx + 2 // first spec (free) + this one
      const isCareerSpec = spec.career_key === draft.career?.key
      total += isCareerSpec ? 10 * totalSpecsAfter : 10 * totalSpecsAfter + 10
    })
    return total
  }, [draft.additionalSpecs, draft.career])

  const xpSpent = xpSpentOnChars + xpSpentOnSkills + xpSpentOnTalents + xpSpentOnAdditionalSpecs
  const xpRemaining = xpTotal - xpSpent

  // ── Starting obligation magnitude ─────────────────────────────────────────
  const startingObligation = startingObligationByCount(playerCount)
  const oblBonus = (draft.oblXp5 ? 5 : 0) + (draft.oblXp10 ? 10 : 0) +
                   (draft.oblCred1k ? 5 : 0) + (draft.oblCred2k5 ? 10 : 0)
  const totalObligation = startingObligation + oblBonus
  const extraCredits = (draft.oblCred1k ? 1000 : 0) + (draft.oblCred2k5 ? 2500 : 0)

  // ── Species option choice skill (if any) ──────────────────────────────────
  const speciesOptionSkills = useMemo(() => {
    if (!draft.species?.option_choices || !draft.speciesOptionKey) return []
    const choices = draft.species.option_choices as {
      options?: { key: string; skill_modifiers?: { key: string }[] }[]
    }[]
    if (!Array.isArray(choices)) return []
    for (const choice of choices) {
      const opt = choice.options?.find(o => o.key === draft.speciesOptionKey)
      if (opt?.skill_modifiers) return opt.skill_modifiers.map(m => m.key)
    }
    return []
  }, [draft.species, draft.speciesOptionKey])

  // ── Species built-in skill modifiers ─────────────────────────────────────
  const speciesSkillMods = useMemo(() => {
    // Species skill mods derived from option choices (handled separately)
    // Special abilities currently don't grant automatic skill ranks beyond option choices
    return [] as { key: string; rank: number }[]
  }, [])

  // ── Character creation handler ────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!campaignId || !draft.species || !draft.career || !draft.specialization || !draft.name) return
    setSaving(true)
    try {
      // Create/find player
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('display_name', draft.playerName || 'Player')
        .single()

      let playerId: string
      if (existingPlayer) {
        playerId = existingPlayer.id
      } else {
        const { data: newPlayer, error: plErr } = await supabase
          .from('players')
          .insert({ campaign_id: campaignId, display_name: draft.playerName || 'Player', is_gm: false })
          .select('id').single()
        if (plErr) throw plErr
        playerId = newPlayer.id
      }

      // Final skill ranks: free career + free spec + species option + XP-purchased
      const finalSkillRanks: Record<string, number> = {}
      for (const sk of draft.freeCareerPicks) finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + 1
      for (const sk of draft.freeSpecPicks) finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + 1
      for (const sk of speciesOptionSkills) finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + 1
      for (const mod of speciesSkillMods) finalSkillRanks[mod.key] = (finalSkillRanks[mod.key] || 0) + mod.rank
      for (const [sk, ranks] of Object.entries(draft.skillRanks)) {
        if (ranks > 0) finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + ranks
      }

      const startingCredits = 500 + extraCredits

      // Create character
      const { data: char, error: charErr } = await supabase
        .from('characters')
        .insert({
          campaign_id: campaignId,
          player_id: playerId,
          name: draft.name,
          species_key: draft.species.key,
          career_key: draft.career.key,
          gender: draft.gender || null,
          brawn: draft.brawn, agility: draft.agility, intellect: draft.intellect,
          cunning: draft.cunning, willpower: draft.willpower, presence: draft.presence,
          wound_threshold: draft.species.wound_threshold + draft.brawn,
          wound_current: 0,
          strain_threshold: draft.species.strain_threshold + draft.willpower,
          strain_current: 0,
          soak: draft.brawn,
          defense_ranged: 0, defense_melee: 0,
          xp_total: xpTotal,
          xp_available: xpRemaining,
          credits: startingCredits,
          encumbrance_threshold: 5 + draft.brawn,
          morality_value: 50,
          backstory: draft.backstory || '',
          notes: '',
          // Obligation
          obligation_type: draft.obligationType || null,
          obligation_value: totalObligation,
          obligation_notes: draft.obligationDesc || null,
          obligation_configured: true,
          extra_xp_from_obligation: oblXpBonus,
          extra_credits_from_obligation: extraCredits,
          // Duty
          duty_type: draft.dutyType || null,
          duty_value: 10,
          duty_notes: draft.dutyDesc || null,
          duty_obligation_configured: !!(draft.obligationType || draft.dutyType),
          // Motivation
          motivation_type: draft.motivationType || null,
          motivation_specific: draft.motivationSpecific || null,
          motivation_description: draft.motivationDesc || null,
          motivation_configured: !!draft.motivationType,
          // Nemesis classification
          is_pc: !isNemesisMode,
          adversary_type: isNemesisMode ? 'nemesis' : null,
        })
        .select('id').single()
      if (charErr) throw charErr

      // All specs
      const specInserts = allSpecs.map((spec, idx) => ({
        character_id: char.id,
        specialization_key: spec.key,
        is_starting: idx === 0,
        purchase_order: idx,
      }))
      await supabase.from('character_specializations').insert(specInserts)

      // Skills
      const allCareerSkillKeys = new Set<string>()
      draft.career?.career_skill_keys?.forEach(k => allCareerSkillKeys.add(k))
      allSpecs.forEach(s => s.career_skill_keys?.forEach(k => allCareerSkillKeys.add(k)))
      const skillInserts = refSkills.map(sk => ({
        character_id: char.id,
        skill_key: sk.key,
        rank: finalSkillRanks[sk.key] || 0,
        is_career: allCareerSkillKeys.has(sk.key),
      }))
      await supabase.from('character_skills').insert(skillInserts)

      // Talents
      if (draft.talentPicks.length > 0) {
        await supabase.from('character_talents').insert(
          draft.talentPicks.map(t => ({
            character_id: char.id, talent_key: t.key,
            specialization_key: t.specKey, tree_row: t.row,
            tree_col: t.col, ranks: 1, xp_cost: t.cost,
          }))
        )
      }

      // XP transaction log
      const reasons: string[] = []
      if (xpSpentOnChars > 0) reasons.push(`Characteristics: ${xpSpentOnChars}`)
      if (xpSpentOnSkills > 0) reasons.push(`Skills: ${xpSpentOnSkills}`)
      if (xpSpentOnTalents > 0) reasons.push(`Talents: ${xpSpentOnTalents}`)
      if (xpSpentOnAdditionalSpecs > 0) reasons.push(`Extra Specs: ${xpSpentOnAdditionalSpecs}`)
      if (reasons.length > 0) {
        await supabase.from('xp_transactions').insert({
          character_id: char.id, amount: -xpSpent,
          reason: `Character creation — ${reasons.join(', ')} XP`,
        })
      }

      if (isNemesisMode) {
        router.push(`/gm?campaign=${campaignId}&view=nemeses`)
      } else {
        router.push(`/character/${char.id}`)
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
      setSaving(false)
    }
  }, [
    campaignId, draft, allSpecs, xpTotal, xpRemaining, xpSpent,
    xpSpentOnChars, xpSpentOnSkills, xpSpentOnTalents, xpSpentOnAdditionalSpecs,
    oblXpBonus, extraCredits, totalObligation,
    speciesOptionSkills, speciesSkillMods, refSkills,
    supabase, router, isNemesisMode,
  ])

  // ── Shared step nav helpers ───────────────────────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!campaignId) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 'var(--font-md)' }}>
        Missing campaign ID.
      </div>
    )
  }
  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-orbitron)', color: 'var(--gold-d)', fontSize: 'var(--font-xl)', letterSpacing: '0.3rem' }}>
        LOADING ARCHIVES...
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', overflow: 'auto',
      background: isNemesisMode ? '#040A07' : 'var(--sand)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: 'var(--sp-xl) var(--sp-lg) calc(var(--sp-xl) * 3)',
      gap: 'var(--sp-lg)',
      transition: 'background 0.4s ease',
      ['--creator-primary' as string]: isNemesisMode ? '#e05252' : 'var(--gold)',
    } as React.CSSProperties}>
      {/* Ambient bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle at 30% 40%, rgba(200,162,78,.06) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(43,93,174,.04) 0%, transparent 50%)`,
      }} />

      {/* Header + step bar */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '52rem', textAlign: 'center' }}>

        {/* ── Nemesis mode button (top-right) ── */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {!isNemesisMode ? (
            <button
              onClick={() => setShowNemesisPinModal(true)}
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'clamp(0.6rem, 0.85vw, 0.78rem)',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
                border: '1px solid rgba(224,82,82,0.5)',
                color: 'rgba(224,82,82,0.65)',
                background: 'rgba(224,82,82,0.07)',
                transition: 'color 150ms, background 150ms, border-color 150ms',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = '#e05252'
                el.style.background = 'rgba(224,82,82,0.12)'
                el.style.borderColor = 'rgba(224,82,82,0.7)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = 'rgba(224,82,82,0.65)'
                el.style.background = 'rgba(224,82,82,0.07)'
                el.style.borderColor = 'rgba(224,82,82,0.5)'
              }}
            >
              ⚡ CONVERT TO NEMESIS
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNemesisCancelConfirm(v => !v)}
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: 'clamp(0.6rem, 0.85vw, 0.78rem)',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
                  border: '1px solid rgba(200,170,80,0.5)',
                  color: 'rgba(200,170,80,0.65)',
                  background: 'rgba(200,170,80,0.07)',
                  transition: 'color 150ms, background 150ms, border-color 150ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = '#C8AA50'
                  el.style.background = 'rgba(200,170,80,0.12)'
                  el.style.borderColor = 'rgba(200,170,80,0.7)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = 'rgba(200,170,80,0.65)'
                  el.style.background = 'rgba(200,170,80,0.07)'
                  el.style.borderColor = 'rgba(200,170,80,0.5)'
                }}
              >
                ☠ CANCEL NEMESIS MODE
              </button>
              {showNemesisCancelConfirm && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: 'rgba(4,10,7,0.97)', border: '1px solid rgba(200,170,80,0.3)',
                  borderRadius: 6, padding: '12px 14px', minWidth: 220, zIndex: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.62rem, 0.88vw, 0.72rem)', color: 'rgba(232,223,200,0.7)', lineHeight: 1.5, marginBottom: 10 }}>
                    Reset the creator and exit Nemesis Mode?
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setShowNemesisCancelConfirm(false)}
                      style={{
                        flex: 1, padding: '5px 0', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.58rem, 0.82vw, 0.68rem)',
                        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: 'transparent', border: '1px solid rgba(200,170,80,0.3)', color: 'rgba(200,170,80,0.6)',
                      }}
                    >
                      Keep
                    </button>
                    <button
                      onClick={resetCreator}
                      style={{
                        flex: 1, padding: '5px 0', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.58rem, 0.82vw, 0.68rem)',
                        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: 'rgba(224,82,82,0.12)', border: '1px solid rgba(224,82,82,0.4)', color: '#e05252',
                      }}
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Title ── */}
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontWeight: 900,
          fontSize: 'var(--font-hero)', letterSpacing: '0.4rem',
          color: isNemesisMode ? '#e05252' : 'var(--gold-d)',
          textShadow: isNemesisMode ? '0 0 60px rgba(224,82,82,0.45)' : '0 0 60px var(--gold-glow-s)',
          transition: 'color 0.3s ease, text-shadow 0.3s ease',
        }}>
          {isNemesisMode ? 'NEMESIS CREATOR' : 'NEW CHARACTER'}
        </div>

        {/* ── Step tabs ── */}
        <div style={{ display: 'flex', gap: 'var(--sp-xs)', justifyContent: 'center', marginTop: 'var(--sp-md)', flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => { if (i < step) setStep(i) }}
              style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                fontWeight: i === step ? 700 : 500, letterSpacing: '0.1rem',
                color: i === step
                  ? (isNemesisMode ? '#e05252' : 'var(--gold-d)')
                  : i < step ? 'var(--txt2)' : 'var(--txt3)',
                background: 'none', border: 'none',
                borderBottom: i === step
                  ? `2px solid ${isNemesisMode ? '#e05252' : 'var(--gold)'}`
                  : '2px solid transparent',
                padding: '0.25rem 0.5rem',
                cursor: i < step ? 'pointer' : 'default', transition: '.2s',
              }}
            >
              {i < step ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '38rem' }}>

        {/* ═══ STEP 0: Background ═══════════════════════════════════════════ */}
        {step === 0 && (
          <HudCard title="Background & Concept" animClass="au d1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
                Who is your character? What drew them to this life? Give them a name, then optionally sketch a brief concept — you can expand the backstory on the character sheet later.
              </p>
              <div>
                <label style={S.labelXs}>CHARACTER NAME *</label>
                <input
                  autoFocus value={draft.name}
                  onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name..."
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.labelXs}>PLAYER NAME</label>
                <input
                  value={draft.playerName}
                  onChange={e => setDraft(p => ({ ...p, playerName: e.target.value }))}
                  placeholder="Your name..."
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.labelXs}>GENDER</label>
                <select
                  value={draft.gender}
                  onChange={e => setDraft(p => ({ ...p, gender: e.target.value }))}
                  style={S.select}
                >
                  <option value="">— Select —</option>
                  <option>Male</option><option>Female</option>
                  <option>Non-Binary</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={S.labelXs}>CONCEPT / BACKSTORY (optional)</label>
                <textarea
                  value={draft.backstory}
                  onChange={e => setDraft(p => ({ ...p, backstory: e.target.value }))}
                  placeholder="Brief character concept..."
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <button
                onClick={goNext} disabled={!draft.name}
                style={{ ...S.goldBtn, opacity: draft.name ? 1 : 0.4, cursor: draft.name ? 'pointer' : 'default' }}
              >
                CONTINUE → OBLIGATION
              </button>
            </div>
          </HudCard>
        )}

        {/* ═══ STEP 1: Obligation ═══════════════════════════════════════════ */}
        {step === 1 && (
          <HudCard title="Obligation" animClass="au d1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
                Every character on the fringe carries some form of debt, secret, or entanglement from their past. This Obligation can be triggered each session, imposing strain penalties on the group.
              </p>

              {/* Starting value callout */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                background: 'rgba(200,162,78,.08)', border: '1px solid rgba(200,162,78,.3)',
                padding: 'var(--sp-sm) var(--sp-md)',
              }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-hero)', fontWeight: 900, color: 'var(--gold-d)', lineHeight: 1 }}>
                  {startingObligation}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)' }}>
                  Starting Obligation<br />
                  <span style={{ color: 'var(--txt3)', fontSize: 'var(--font-xs)' }}>({playerCount} player{playerCount !== 1 ? 's' : ''} in campaign)</span>
                </div>
              </div>

              <div>
                <label style={S.labelXs}>OBLIGATION TYPE</label>
                <select
                  value={draft.obligationType}
                  onChange={e => setDraft(p => ({ ...p, obligationType: e.target.value }))}
                  style={S.select}
                >
                  <option value="">— Select type —</option>
                  {obligationTypes.map(o => (
                    <option key={o.key} value={o.key}>{o.name}</option>
                  ))}
                </select>
                {draft.obligationType && (() => {
                  const obl = obligationTypes.find(o => o.key === draft.obligationType)
                  return obl?.description ? (
                    <div style={{
                      marginTop: '0.5rem',
                      background: 'rgba(200,170,80,0.04)',
                      border: '1px solid rgba(200,170,80,0.15)',
                      borderRadius: 8,
                      padding: 12,
                      maxHeight: 120,
                      overflowY: 'auto',
                      fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                      fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                      color: 'var(--txt2)',
                      lineHeight: 1.5,
                    }}>
                      {stripBBCode(obl.description)}
                    </div>
                  ) : null
                })()}
              </div>

              <div>
                <label style={S.labelXs}>YOUR DESCRIPTION (optional)</label>
                <textarea
                  value={draft.obligationDesc}
                  onChange={e => setDraft(p => ({ ...p, obligationDesc: e.target.value }))}
                  placeholder="What is this obligation? Who do you owe? What happened?"
                  rows={2}
                  style={{ ...S.input, resize: 'vertical' }}
                />
              </div>

              {/* Optional extras */}
              <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-md)' }}>
                <div style={{ ...S.labelXs, marginBottom: 'var(--sp-sm)' }}>
                  OPTIONAL — INCREASE OBLIGATION FOR RESOURCES
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, letterSpacing: 0, color: 'var(--txt3)', marginLeft: '0.5rem' }}>
                    (each option once only; cannot exceed starting value)
                  </span>
                </div>
                {[
                  { key: 'oblXp5' as const, label: '+5 Obligation → +5 starting XP', mag: 5, limit: startingObligation },
                  { key: 'oblXp10' as const, label: '+10 Obligation → +10 starting XP', mag: 10, limit: startingObligation },
                  { key: 'oblCred1k' as const, label: '+5 Obligation → +1,000 starting credits', mag: 5, limit: startingObligation },
                  { key: 'oblCred2k5' as const, label: '+10 Obligation → +2,500 starting credits', mag: 10, limit: startingObligation },
                ].map(opt => {
                  const checked = draft[opt.key]
                  // cannot take if combined bonus would exceed starting value
                  const otherBonus = oblBonus - (checked ? opt.mag : 0)
                  const wouldExceed = !checked && (otherBonus + opt.mag > startingObligation)
                  return (
                    <label key={opt.key} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                      padding: 'var(--sp-sm) var(--sp-md)',
                      background: checked ? 'rgba(200,162,78,.08)' : 'rgba(0,0,0,.02)',
                      border: `1px solid ${checked ? 'rgba(200,162,78,.4)' : 'var(--bdr-l)'}`,
                      marginBottom: '0.25rem',
                      cursor: wouldExceed ? 'not-allowed' : 'pointer',
                      opacity: wouldExceed ? 0.4 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={wouldExceed}
                        onChange={() => setDraft(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)' }}>
                        {opt.label}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Running totals */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-sm)',
                background: 'rgba(0,0,0,.03)', border: '1px solid var(--bdr-l)', padding: 'var(--sp-sm)',
              }}>
                {[
                  { label: 'TOTAL OBLIGATION', val: totalObligation, color: 'var(--ink)' },
                  { label: 'EXTRA XP', val: `+${oblXpBonus}`, color: 'var(--gold-d)' },
                  { label: 'EXTRA CREDITS', val: `+${extraCredits.toLocaleString()}`, color: '#4EC87A' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: item.color }}>{item.val}</div>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                <button onClick={goPrev} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
                <button onClick={goNext} style={{ ...S.goldBtn, flex: 2 }}>CONTINUE → DUTY</button>
              </div>
              <button onClick={goNext} style={{ ...S.ghostBtn, width: '100%', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>
                Skip — No Obligation
              </button>
            </div>
          </HudCard>
        )}

        {/* ═══ STEP 2: Duty ════════════════════════════════════════════════ */}
        {step === 2 && (
          <HudCard title="Duty" animClass="au d1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
                As a Rebel, your Duty tracks your contribution and commitment to the Alliance cause. It activates periodically during play, granting benefits when fulfilled.
              </p>
              <div>
                <label style={S.labelXs}>DUTY TYPE</label>
                <select
                  value={draft.dutyType}
                  onChange={e => setDraft(p => ({ ...p, dutyType: e.target.value }))}
                  style={S.select}
                >
                  <option value="">— Select type —</option>
                  {dutyTypes.map(d => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
                {draft.dutyType && (() => {
                  const duty = dutyTypes.find(d => d.key === draft.dutyType)
                  return duty?.description ? (
                    <div style={{
                      marginTop: '0.5rem',
                      background: 'rgba(200,170,80,0.04)',
                      border: '1px solid rgba(200,170,80,0.15)',
                      borderRadius: 8,
                      padding: 12,
                      maxHeight: 120,
                      overflowY: 'auto',
                      fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                      fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                      color: 'var(--txt2)',
                      lineHeight: 1.5,
                    }}>
                      {stripBBCode(duty.description)}
                    </div>
                  ) : null
                })()}
              </div>
              <div>
                <label style={S.labelXs}>YOUR DESCRIPTION (optional)</label>
                <textarea
                  value={draft.dutyDesc}
                  onChange={e => setDraft(p => ({ ...p, dutyDesc: e.target.value }))}
                  placeholder="How does your character fulfill this duty? What motivates them?"
                  rows={2}
                  style={{ ...S.input, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                <button onClick={goPrev} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
                <button onClick={goNext} style={{ ...S.goldBtn, flex: 2 }}>CONTINUE → SPECIES</button>
              </div>
              <button onClick={goNext} style={{ ...S.ghostBtn, width: '100%', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>
                Skip — No Duty
              </button>
            </div>
          </HudCard>
        )}

        {/* ═══ STEP 3: Species ═════════════════════════════════════════════ */}
        {step === 3 && (
          <SpeciesStep
            species={species}
            selected={draft.species}
            optionKey={draft.speciesOptionKey}
            oblXpBonus={oblXpBonus}
            skillMap={skillMap}
            onSelect={sp => setDraft(p => ({
              ...p, species: sp, speciesOptionKey: '',
              brawn: sp.brawn, agility: sp.agility, intellect: sp.intellect,
              cunning: sp.cunning, willpower: sp.willpower, presence: sp.presence,
            }))}
            onOptionSelect={key => setDraft(p => ({ ...p, speciesOptionKey: key }))}
            onConfirm={goNext}
            onBack={goPrev}
          />
        )}

        {/* ═══ STEP 4: Career ══════════════════════════════════════════════ */}
        {step === 4 && (
          <CareerStep
            careers={careers}
            skillMap={skillMap}
            selected={draft.career}
            freeCareerPicks={draft.freeCareerPicks}
            onSelect={car => setDraft(p => ({ ...p, career: car, freeCareerPicks: [], specialization: null, freeSpecPicks: [], additionalSpecs: [] }))}
            onPickToggle={(skillKey) => setDraft(p => {
              const picks = [...p.freeCareerPicks]
              const idx = picks.indexOf(skillKey)
              if (idx >= 0) { picks.splice(idx, 1) }
              else if (picks.length < 4) picks.push(skillKey)
              return { ...p, freeCareerPicks: picks }
            })}
            onConfirm={goNext}
            onBack={goPrev}
          />
        )}

        {/* ═══ STEP 5: Specialisation ══════════════════════════════════════ */}
        {step === 5 && (
          <SpecStep
            specializations={specializations}
            skillMap={skillMap}
            careerKey={draft.career?.key || ''}
            selected={draft.specialization}
            freeSpecPicks={draft.freeSpecPicks}
            onSelect={spec => setDraft(p => ({ ...p, specialization: spec, freeSpecPicks: [], talentPicks: [] }))}
            onSpecPickToggle={(skillKey) => setDraft(p => {
              const picks = [...p.freeSpecPicks]
              const idx = picks.indexOf(skillKey)
              if (idx >= 0) { picks.splice(idx, 1) }
              else if (picks.length < 2) picks.push(skillKey)
              return { ...p, freeSpecPicks: picks }
            })}
            onConfirm={goNext}
            onBack={goPrev}
          />
        )}

        {/* ═══ STEP 6: XP Investment ═══════════════════════════════════════ */}
        {step === 6 && draft.career && draft.specialization && (
          <XpInvestmentStep
            draft={draft}
            setDraft={setDraft}
            refSkills={refSkills}
            talentMap={talentMap}
            careerSkillKeys={careerSkillKeys}
            allSpecs={allSpecs}
            specializations={specializations}
            skillMap={skillMap}
            xpTotal={xpTotal}
            baseXp={baseXp}
            oblXpBonus={oblXpBonus}
            xpSpent={xpSpent}
            xpRemaining={xpRemaining}
            xpSpentOnChars={xpSpentOnChars}
            xpSpentOnSkills={xpSpentOnSkills}
            xpSpentOnTalents={xpSpentOnTalents}
            xpSpentOnAdditionalSpecs={xpSpentOnAdditionalSpecs}
            onContinue={goNext}
            onBack={goPrev}
          />
        )}

        {/* ═══ STEP 7: Motivation ══════════════════════════════════════════ */}
        {step === 7 && (
          <MotivationStep
            motivations={motivations}
            specificMotivations={specificMotivations}
            selectedType={draft.motivationType}
            selectedSpecific={draft.motivationSpecific}
            motivationDesc={draft.motivationDesc}
            onTypeChange={t => setDraft(p => ({ ...p, motivationType: t, motivationSpecific: '', motivationDesc: '' }))}
            onSpecificChange={(key, desc) => setDraft(p => ({ ...p, motivationSpecific: key, motivationDesc: desc }))}
            onContinue={goNext}
            onBack={goPrev}
          />
        )}

        {/* ═══ STEP 8: Review / Confirm ════════════════════════════════════ */}
        {step === 8 && (
          <ReviewStep
            draft={draft}
            skillMap={skillMap}
            talentMap={talentMap}
            allSpecs={allSpecs}
            careerSkillKeys={careerSkillKeys}
            xpTotal={xpTotal}
            xpSpent={xpSpent}
            xpRemaining={xpRemaining}
            xpSpentOnChars={xpSpentOnChars}
            xpSpentOnSkills={xpSpentOnSkills}
            xpSpentOnTalents={xpSpentOnTalents}
            xpSpentOnAdditionalSpecs={xpSpentOnAdditionalSpecs}
            startingObligation={startingObligation}
            totalObligation={totalObligation}
            oblXpBonus={oblXpBonus}
            extraCredits={extraCredits}
            saving={saving}
            onBack={goPrev}
            onCreate={handleCreate}
          />
        )}
      </div>

      {/* ── Nemesis Protocol PIN Modal ── */}
      {showNemesisPinModal && typeof window !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}
          onClick={() => { setShowNemesisPinModal(false); setNemesisPinInput(''); setNemesisPinError(false) }}
        >
          <style>{`
            @keyframes nemesis-shake {
              0%, 100% { transform: translateX(0); }
              20%       { transform: translateX(-8px); }
              40%       { transform: translateX(8px); }
              60%       { transform: translateX(-6px); }
              80%       { transform: translateX(4px); }
            }
            .nemesis-pin-shake { animation: nemesis-shake 0.42s ease; }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(4,10,7,0.98)',
              border: '1px solid rgba(224,82,82,0.28)',
              borderRadius: 8, padding: '28px 28px 24px',
              maxWidth: 360, width: '100%',
              boxShadow: '0 0 60px rgba(224,82,82,0.12), 0 20px 60px rgba(0,0,0,0.8)',
              position: 'relative',
            }}
          >
            {/* Red tint overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(224,82,82,0.035)', pointerEvents: 'none' }} />

            {/* Title */}
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(1rem, 1.4vw, 1.25rem)', fontWeight: 900, color: '#e05252', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
              NEMESIS PROTOCOL
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.8rem, 1vw, 0.95rem)', color: 'rgba(232,223,200,0.45)', textAlign: 'center', marginBottom: 22, letterSpacing: '0.04em' }}>
              GM authorisation required.
            </div>

            {/* PIN input */}
            <div className={nemesisPinShake ? 'nemesis-pin-shake' : ''}>
              <input
                autoFocus
                type="password"
                value={nemesisPinInput}
                onChange={e => { setNemesisPinInput(e.target.value); setNemesisPinError(false) }}
                onKeyDown={e => { if (e.key === 'Enter') handleNemesisPinSubmit() }}
                placeholder="Enter GM PIN"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: 'var(--sp-sm) var(--sp-md)',
                  border: `1px solid ${nemesisPinError ? '#e05252' : 'rgba(224,82,82,0.35)'}`,
                  background: 'rgba(0,0,0,0.5)',
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
                  color: 'var(--txt1)', letterSpacing: '0.2em',
                  outline: 'none', borderRadius: 4,
                  transition: 'border-color 150ms',
                  textAlign: 'center',
                }}
              />
              {nemesisPinError && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.7rem, 0.9vw, 0.82rem)', color: '#e05252', textAlign: 'center', marginTop: 6 }}>
                  Incorrect code
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => { setShowNemesisPinModal(false); setNemesisPinInput(''); setNemesisPinError(false) }}
                style={{
                  flex: 1, padding: 'var(--sp-sm) 0', borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.62rem, 0.88vw, 0.72rem)',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid rgba(232,223,200,0.2)', color: 'rgba(232,223,200,0.45)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleNemesisPinSubmit}
                disabled={!nemesisPinInput}
                style={{
                  flex: 2, padding: 'var(--sp-sm) 0', borderRadius: 4, cursor: nemesisPinInput ? 'pointer' : 'default',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.62rem, 0.88vw, 0.72rem)',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.45)',
                  color: nemesisPinInput ? '#e05252' : 'rgba(224,82,82,0.35)',
                  transition: 'color 150ms, background 150ms',
                }}
              >
                Authorise
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 3: Species
// ══════════════════════════════════════════════════════════════════════════════
function SpeciesStep({
  species, selected, optionKey, oblXpBonus, skillMap,
  onSelect, onOptionSelect, onConfirm, onBack,
}: {
  species: RefSpecies[]
  selected: RefSpecies | null
  optionKey: string
  oblXpBonus: number
  skillMap: Record<string, RefSkill>
  onSelect: (sp: RefSpecies) => void
  onOptionSelect: (key: string) => void
  onConfirm: () => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(!selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query) return species
    const q = query.toLowerCase()
    return species.filter(s => s.name.toLowerCase().includes(q))
  }, [species, query])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Parse option_choices
  const parsedChoices = useMemo(() => {
    if (!selected?.option_choices) return []
    try {
      const oc = selected.option_choices as {
        key?: string
        options?: { key: string; name?: string; skill_modifiers?: { key: string; rank_start?: number }[] }[]
      }[]
      return Array.isArray(oc) ? oc : []
    } catch { return [] }
  }, [selected])

  const hasRequiredChoice = parsedChoices.length > 0 && !optionKey
  const canContinue = !!selected && !hasRequiredChoice

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Search combobox */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`,
            padding: '0.45rem 0.75rem', cursor: 'text', transition: 'border-color .2s',
          }}
        >
          <input
            ref={inputRef}
            value={open ? query : (selected?.name || '')}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : 'Search species...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)' }}
          />
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-sm)', color: 'var(--txt3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            ▼
          </button>
        </div>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, maxHeight: '22rem', overflowY: 'auto', background: 'var(--white)', border: '1px solid var(--bdr-l)', borderTop: 'none', boxShadow: '0 6px 24px rgba(0,0,0,.1)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)' }}>No species found</div>
            ) : filtered.map(sp => {
              const isSel = selected?.key === sp.key
              return (
                <button key={sp.key} onClick={() => { onSelect(sp); setQuery(''); setOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: isSel ? 'var(--gold-glow)' : 'transparent', border: 'none', borderBottom: '1px solid var(--bdr-l)', cursor: 'pointer' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem' }}>{sp.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                    {CHAR_KEYS.map(k => (
                      <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 600, color: sp[k] >= 3 ? '#d64d8a' : 'var(--txt2)', background: sp[k] >= 3 ? 'rgba(214,77,138,.08)' : 'rgba(0,0,0,.04)', border: `1px solid ${sp[k] >= 3 ? 'rgba(214,77,138,.3)' : 'var(--bdr-l)'}`, padding: '0.04rem 0.2rem' }}>
                        {CHAR_SHORT[k]} {sp[k]}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected species detail card */}
      {selected && (
        <div style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)', border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
          <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem' }}>
            {selected.name}
            {selected.source_book && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 400, color: 'var(--txt3)', marginLeft: '0.75rem' }}>
                {selected.source_book}
              </span>
            )}
          </div>

          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 'var(--sp-xs)' }}>
            {CHAR_KEYS.map(k => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--ink)' }}>{selected[k]}</div>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)', textTransform: 'uppercase' }}>{k.slice(0, 3)}</div>
              </div>
            ))}
          </div>

          {/* Thresholds + XP row */}
          <div style={{ display: 'flex', gap: 'var(--sp-lg)', borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)', flexWrap: 'wrap' }}>
            <StatPill label="WOUND TH" value={`${selected.wound_threshold} + Br`} />
            <StatPill label="STRAIN TH" value={`${selected.strain_threshold} + Wil`} />
            <StatPill label="START XP" value={String(selected.starting_xp)} highlight />
            {oblXpBonus > 0 && (
              <StatPill label="OBL BONUS" value={`+${oblXpBonus} XP`} highlight />
            )}
          </div>

          {/* Special abilities pills */}
          {selected.special_abilities && selected.special_abilities.length > 0 && (
            <div>
              <div style={{ ...S.labelXs, marginBottom: '0.4rem' }}>SPECIAL ABILITIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {selected.special_abilities.map((ab, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                    color: 'var(--gold-d)', background: 'rgba(200,162,78,.1)',
                    border: '1px solid rgba(200,162,78,.4)', padding: '0.12rem 0.5rem',
                    cursor: 'default',
                  }}
                    title={ab.description || ab.name}
                  >
                    {ab.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Option choices (radio buttons) */}
          {parsedChoices.length > 0 && (
            <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
              <div style={{ ...S.labelXs, color: 'var(--red)', marginBottom: '0.4rem' }}>
                REQUIRED CHOICE — select one starting skill:
              </div>
              {parsedChoices.map((choice, ci) => (
                <div key={ci} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {choice.options?.map(opt => (
                    <label key={opt.key} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: 'var(--sp-xs) var(--sp-sm)',
                      background: optionKey === opt.key ? 'rgba(200,162,78,.12)' : 'rgba(0,0,0,.03)',
                      border: `1px solid ${optionKey === opt.key ? 'var(--gold)' : 'var(--bdr-l)'}`,
                      cursor: 'pointer',
                    }}>
                      <input type="radio" name={`choice-${ci}`} value={opt.key}
                        checked={optionKey === opt.key}
                        onChange={() => onOptionSelect(opt.key)} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)' }}>
                        {opt.name || (opt.skill_modifiers?.[0] ? skillMap[opt.skill_modifiers[0].key]?.name || opt.key : opt.key)}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {selected.description && (
            <CollapsibleDesc html={parseBB(selected.description)} />
          )}

          <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)' }}>
            <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
            <button
              onClick={onConfirm}
              disabled={!canContinue}
              style={{ ...S.goldBtn, flex: 2, opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'default' }}
            >
              {hasRequiredChoice ? 'SELECT AN OPTION ABOVE' : 'CONFIRM SPECIES →'}
            </button>
          </div>
        </div>
      )}

      {!selected && (
        <button onClick={onBack} style={S.ghostBtn}>← BACK</button>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 4: Career
// ══════════════════════════════════════════════════════════════════════════════
function CareerStep({
  careers, skillMap, selected, freeCareerPicks,
  onSelect, onPickToggle, onConfirm, onBack,
}: {
  careers: RefCareer[]
  skillMap: Record<string, RefSkill>
  selected: RefCareer | null
  freeCareerPicks: string[]
  onSelect: (c: RefCareer) => void
  onPickToggle: (k: string) => void
  onConfirm: () => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const [sourceTab, setSourceTab] = useState<string>('All')
  const [open, setOpen] = useState(!selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hoveredCareer, setHoveredCareer] = useState<CreatorTipItem | null>(null)
  const [tipPos, setTipPos] = useState<CreatorTipPos>({ x: 0, y: 0 })

  const sourceTabs = useMemo(() => {
    const tabs = new Set<string>(['All'])
    careers.forEach(c => tabs.add(sourceToTab(c.source)))
    return Array.from(tabs)
  }, [careers])

  const filtered = useMemo(() => {
    let list = careers
    if (query) { const q = query.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q)) }
    if (sourceTab !== 'All') list = list.filter(c => sourceToTab(c.source) === sourceTab)
    return list
  }, [careers, query, sourceTab])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const canContinue = !!selected && freeCareerPicks.length === 4

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Source filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--sp-xs)', flexWrap: 'wrap' }}>
        {sourceTabs.map(tab => (
          <button key={tab}
            onClick={() => setSourceTab(tab)}
            style={{
              background: sourceTab === tab ? 'var(--gold)' : 'rgba(0,0,0,.04)',
              border: `1px solid ${sourceTab === tab ? 'var(--gold)' : 'var(--bdr-l)'}`,
              padding: '0.2rem 0.6rem',
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
              fontWeight: 600, letterSpacing: '0.1rem',
              color: sourceTab === tab ? 'var(--white)' : 'var(--txt3)',
              cursor: 'pointer',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Search + dropdown */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`,
            padding: '0.45rem 0.75rem', cursor: 'text', transition: 'border-color .2s',
          }}
        >
          <input ref={inputRef} placeholder={selected ? selected.name : 'Search careers...'}
            value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)' }} />
          <span onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            style={{ cursor: 'pointer', color: 'var(--txt3)', userSelect: 'none' }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, maxHeight: '22rem', overflowY: 'auto', background: 'var(--white)', border: '1px solid var(--bdr-l)', borderTop: 'none', boxShadow: '0 6px 24px rgba(0,0,0,.1)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)' }}>No careers found</div>
            ) : filtered.map(car => {
              const isSel = selected?.key === car.key
              return (
                <button key={car.key} onClick={() => { onSelect(car); setQuery(''); setOpen(false); setHoveredCareer(null) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: isSel ? 'var(--gold-glow)' : 'transparent', border: 'none', borderBottom: '1px solid var(--bdr-l)', cursor: 'pointer' }}
                  onMouseEnter={e => {
                    if (!isSel) e.currentTarget.style.background = 'rgba(200,162,78,.06)'
                    setHoveredCareer({ name: car.name, description: car.description, skillKeys: car.career_skill_keys ?? [], source: car.source, isForce: car.is_force_career })
                    setTipPos(calcCreatorTipPos(e.currentTarget.getBoundingClientRect()))
                  }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; setHoveredCareer(null) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem' }}>{car.name}</span>
                    {car.source && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', color: 'var(--txt3)' }}>{sourceToTab(car.source)}</span>}
                  </div>
                  {car.is_force_career && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 700, color: '#5AAAE0', background: 'rgba(90,170,224,.08)', border: '1px solid rgba(90,170,224,.3)', padding: '0.04rem 0.4rem', marginRight: '0.25rem' }}>FORCE</span>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                    {car.career_skill_keys?.map(k => (
                      <span key={k} style={S.skillPill(true)}>{skillMap[k]?.name || k}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected career + skill picker */}
      {selected && (
        <div style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)', border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem' }}>
              {selected.name}
            </div>
            {selected.source && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>{selected.source}</span>}
          </div>

          <div style={{ ...S.labelXs, color: freeCareerPicks.length === 4 ? '#4EC87A' : 'var(--txt3)' }}>
            SELECT 4 FREE CAREER SKILLS — {freeCareerPicks.length}/4 chosen
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.3rem' }}>
            {selected.career_skill_keys?.map(k => {
              const picked = freeCareerPicks.includes(k)
              const full = !picked && freeCareerPicks.length >= 4
              return (
                <label key={k} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: 'var(--sp-xs) var(--sp-sm)',
                  background: picked ? 'rgba(214,77,138,.1)' : 'rgba(0,0,0,.03)',
                  border: `1px solid ${picked ? 'rgba(214,77,138,.4)' : 'var(--bdr-l)'}`,
                  cursor: full ? 'not-allowed' : 'pointer',
                  opacity: full ? 0.4 : 1,
                }}>
                  <input type="checkbox" checked={picked} disabled={full}
                    onChange={() => onPickToggle(k)} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)' }}>
                    {skillMap[k]?.name || k}
                  </span>
                </label>
              )
            })}
          </div>

          {selected.description && (
            <CollapsibleDesc html={parseBB(selected.description)} />
          )}

          <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)' }}>
            <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
            <button onClick={onConfirm} disabled={!canContinue}
              style={{ ...S.goldBtn, flex: 2, opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'default' }}>
              {freeCareerPicks.length < 4 ? `PICK ${4 - freeCareerPicks.length} MORE SKILL${4 - freeCareerPicks.length !== 1 ? 'S' : ''}` : 'CONFIRM CAREER →'}
            </button>
          </div>
        </div>
      )}
      {!selected && <button onClick={onBack} style={S.ghostBtn}>← BACK</button>}

      {hoveredCareer && <CreatorItemTooltip item={hoveredCareer} pos={tipPos} skillMap={skillMap} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 5: Specialisation
// ══════════════════════════════════════════════════════════════════════════════
function SpecStep({
  specializations, skillMap, careerKey, selected, freeSpecPicks,
  onSelect, onSpecPickToggle, onConfirm, onBack,
}: {
  specializations: RefSpecialization[]
  skillMap: Record<string, RefSkill>
  careerKey: string
  selected: RefSpecialization | null
  freeSpecPicks: string[]
  onSelect: (s: RefSpecialization) => void
  onSpecPickToggle: (k: string) => void
  onConfirm: () => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(!selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hoveredSpec, setHoveredSpec] = useState<CreatorTipItem | null>(null)
  const [tipPos, setTipPos] = useState<CreatorTipPos>({ x: 0, y: 0 })

  const careerSpecs = useMemo(() => specializations.filter(s => s.career_key === careerKey), [specializations, careerKey])
  const otherSpecs = useMemo(() => specializations.filter(s => s.career_key !== careerKey), [specializations, careerKey])

  const filtered = useMemo(() => {
    if (!query) return { career: careerSpecs, other: otherSpecs }
    const q = query.toLowerCase()
    return {
      career: careerSpecs.filter(s => s.name.toLowerCase().includes(q)),
      other: otherSpecs.filter(s => s.name.toLowerCase().includes(q)),
    }
  }, [careerSpecs, otherSpecs, query])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const canContinue = !!selected && freeSpecPicks.length === 2

  const renderSpecItem = (spec: RefSpecialization, isCareer: boolean) => {
    const isSel = selected?.key === spec.key
    return (
      <button key={spec.key} onClick={() => { onSelect(spec); setQuery(''); setOpen(false); setHoveredSpec(null) }}
        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: isSel ? 'var(--gold-glow)' : 'transparent', border: 'none', borderBottom: '1px solid var(--bdr-l)', cursor: 'pointer', opacity: isCareer ? 1 : 0.7 }}
        onMouseEnter={e => {
          if (!isSel) e.currentTarget.style.background = 'rgba(200,162,78,.06)'
          setHoveredSpec({ name: spec.name, description: spec.description, skillKeys: spec.career_skill_keys ?? [], source: spec.source, isForce: spec.is_force_sensitive })
          setTipPos(calcCreatorTipPos(e.currentTarget.getBoundingClientRect()))
        }}
        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; setHoveredSpec(null) }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem' }}>{spec.name}</span>
          {spec.is_force_sensitive && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 700, color: '#5AAAE0', background: 'rgba(90,170,224,.08)', border: '1px solid rgba(90,170,224,.3)', padding: '0.04rem 0.35rem' }}>FORCE</span>
          )}
          {!isCareer && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', color: 'var(--txt3)' }}>({sourceToTab(spec.source)})</span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
          {spec.career_skill_keys?.map(k => (
            <span key={k} style={S.skillPill(true)}>{skillMap[k]?.name || k}</span>
          ))}
        </div>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
        Your <strong>first specialisation</strong> is free (must be from your career). It grants 4 bonus career skills — pick 2 for a free rank.
      </p>

      {/* First spec dropdown */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{ display: 'flex', alignItems: 'center', background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`, padding: '0.45rem 0.75rem', cursor: 'text', transition: 'border-color .2s' }}
        >
          <input ref={inputRef} placeholder={selected ? selected.name : 'Search career specialisations...'}
            value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)' }} />
          <span onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            style={{ cursor: 'pointer', color: 'var(--txt3)', userSelect: 'none' }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, maxHeight: '22rem', overflowY: 'auto', background: 'var(--white)', border: '1px solid var(--bdr-l)', borderTop: 'none', boxShadow: '0 6px 24px rgba(0,0,0,.1)' }}>
            {filtered.career.length === 0 && filtered.other.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)' }}>No specialisations found</div>
            ) : (
              <>
                {filtered.career.map(s => renderSpecItem(s, true))}
                {filtered.other.length > 0 && filtered.career.length > 0 && (
                  <div style={{ padding: '0.2rem 0.75rem', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', background: 'rgba(0,0,0,.03)', borderBottom: '1px solid var(--bdr-l)' }}>
                    OTHER CAREERS
                  </div>
                )}
                {filtered.other.map(s => renderSpecItem(s, false))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected first spec card */}
      {selected && (
        <div style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)', border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem' }}>{selected.name}</span>
            {selected.is_force_sensitive && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 700, color: '#5AAAE0', background: 'rgba(90,170,224,.08)', border: '1px solid rgba(90,170,224,.3)', padding: '0.04rem 0.4rem' }}>FORCE</span>
            )}
          </div>

          <div>
            <div style={{ ...S.labelXs, color: freeSpecPicks.length === 2 ? '#4EC87A' : 'var(--txt3)', marginBottom: '0.4rem' }}>
              BONUS CAREER SKILLS — pick 2 for free rank: {freeSpecPicks.length}/2
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {selected.career_skill_keys?.map(k => {
                const picked = freeSpecPicks.includes(k)
                const full = !picked && freeSpecPicks.length >= 2
                return (
                  <label key={k} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.2rem 0.6rem',
                    background: picked ? 'rgba(214,77,138,.12)' : 'rgba(0,0,0,.04)',
                    border: `1px solid ${picked ? 'rgba(214,77,138,.4)' : 'var(--bdr-l)'}`,
                    cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.4 : 1,
                  }}>
                    <input type="checkbox" checked={picked} disabled={full}
                      onChange={() => onSpecPickToggle(k)} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)' }}>
                      {skillMap[k]?.name || k}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {selected.description && <CollapsibleDesc html={parseBB(selected.description)} />}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)' }}>
        <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
        <button onClick={onConfirm} disabled={!canContinue}
          style={{ ...S.goldBtn, flex: 2, opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'default' }}>
          {!selected ? 'SELECT A SPECIALISATION' : freeSpecPicks.length < 2 ? `PICK ${2 - freeSpecPicks.length} MORE BONUS SKILL${freeSpecPicks.length === 1 ? '' : 'S'}` : 'CONTINUE → XP INVESTMENT'}
        </button>
      </div>

      {hoveredSpec && <CreatorItemTooltip item={hoveredSpec} pos={tipPos} skillMap={skillMap} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 6: XP Investment
// ══════════════════════════════════════════════════════════════════════════════
function XpInvestmentStep({
  draft, setDraft, refSkills, talentMap, careerSkillKeys, allSpecs,
  specializations, skillMap,
  xpTotal, baseXp, oblXpBonus, xpSpent, xpRemaining,
  xpSpentOnChars, xpSpentOnSkills, xpSpentOnTalents, xpSpentOnAdditionalSpecs,
  onContinue, onBack,
}: {
  draft: CharacterDraft
  setDraft: React.Dispatch<React.SetStateAction<CharacterDraft>>
  refSkills: RefSkill[]
  talentMap: Record<string, RefTalent>
  careerSkillKeys: Set<string>
  allSpecs: RefSpecialization[]
  specializations: RefSpecialization[]
  skillMap: Record<string, RefSkill>
  xpTotal: number
  baseXp: number
  oblXpBonus: number
  xpSpent: number
  xpRemaining: number
  xpSpentOnChars: number
  xpSpentOnSkills: number
  xpSpentOnTalents: number
  xpSpentOnAdditionalSpecs: number
  onContinue: () => void
  onBack: () => void
}) {
  const [section, setSection] = useState<'chars' | 'skills' | 'specs' | 'talents'>('chars')
  const [activeTalentSpecKey, setActiveTalentSpecKey] = useState<string | null>(null)
  const [hoveredChar, setHoveredChar] = useState<{ key: typeof CHAR_KEYS[number]; pos: CreatorTipPos } | null>(null)

  // Derived active talent spec (falls back to first if none selected or spec was removed)
  const activeTalentSpec = allSpecs.find(s => s.key === activeTalentSpecKey) ?? allSpecs[0] ?? null

  // Additional specs (for section D)
  const existingKeys = useMemo(() => {
    const s = new Set<string>()
    if (draft.specialization) s.add(draft.specialization.key)
    draft.additionalSpecs.forEach(a => s.add(a.key))
    return s
  }, [draft.specialization, draft.additionalSpecs])

  const xpColor = xpRemaining < 0 ? '#E05050' : xpRemaining < 20 ? '#E09050' : '#4EC87A'

  return (
    <HudCard title="XP Investment" animClass="au d1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>

        {/* Persistent XP header */}
        <div style={{
          position: 'sticky', top: 'var(--sp-sm)', zIndex: 10,
          background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--bdr-l)', padding: 'var(--sp-sm) var(--sp-md)',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--sp-xs)',
        }}>
          {[
            { label: 'TOTAL', val: xpTotal, hint: oblXpBonus > 0 ? `${baseXp}+${oblXpBonus}` : undefined, color: 'var(--gold-d)' },
            { label: 'CHARS', val: xpSpentOnChars, color: 'var(--ink)' },
            { label: 'SKILLS', val: xpSpentOnSkills, color: '#d64d8a' },
            { label: 'REMAINING', val: xpRemaining, color: xpColor },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                {item.val}
                {item.hint && <span style={{ fontSize: 'var(--font-2xs)', color: 'var(--txt3)', display: 'block', fontWeight: 400 }}>{item.hint}</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr-l)', gap: 0 }}>
          {(['chars', 'skills', 'specs', 'talents'] as const).map(s => (
            <button key={s} onClick={() => setSection(s)}
              style={{
                flex: 1, background: 'none', border: 'none',
                borderBottom: section === s ? '2px solid var(--gold)' : '2px solid transparent',
                padding: '0.4rem', cursor: 'pointer',
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
                fontWeight: section === s ? 700 : 500, letterSpacing: '0.08rem',
                color: section === s ? 'var(--gold-d)' : 'var(--txt3)',
                marginBottom: '-1px', transition: 'color .15s',
              }}
            >
              {s === 'chars' ? 'CHARS' : s === 'skills' ? 'SKILLS' : s === 'specs' ? 'MORE SPECS' : 'TALENTS'}
            </button>
          ))}
        </div>

        {/* SECTION A: Characteristics */}
        {section === 'chars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
            <div style={{
              background: 'rgba(224,80,80,.06)', border: '1px solid rgba(224,80,80,.25)',
              padding: 'var(--sp-sm) var(--sp-md)', display: 'flex', gap: 'var(--sp-sm)', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 'var(--font-lg)' }}>⚠</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: '#E05050', lineHeight: 1.5 }}>
                <strong>CREATION ONLY</strong> — Characteristics cannot be raised with XP after character creation ends. They can only increase later via the Dedication talent.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)' }}>
              {CHAR_KEYS.map(key => {
                const base = draft.species?.[key] ?? 2
                const val = draft[key]
                const nextCost = (val + 1) * 10
                const canUp = val < 5 && xpRemaining >= nextCost
                const canDown = val > base
                return (
                  <div key={key}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,.5)', border: '1px solid var(--bdr-l)', cursor: 'default' }}
                    onMouseEnter={e => setHoveredChar({ key, pos: calcCreatorTipPos(e.currentTarget.getBoundingClientRect()) })}
                    onMouseLeave={() => setHoveredChar(null)}
                  >
                    <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', width: '5rem', letterSpacing: '0.05rem', textTransform: 'uppercase' }}>{key}</span>
                    <button onClick={() => {
                      if (canDown) setDraft(p => ({ ...p, [key]: p[key] - 1 }))
                    }} disabled={!canDown}
                      style={{ width: '1.4rem', height: '1.4rem', border: '1px solid var(--bdr-l)', background: 'none', cursor: canDown ? 'pointer' : 'default', fontWeight: 700, color: 'var(--txt3)', opacity: canDown ? 1 : 0.3 }}>-</button>
                    <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--ink)', width: '1.5rem', textAlign: 'center' }}>{val}</span>
                    <button onClick={() => {
                      if (canUp) setDraft(p => ({ ...p, [key]: p[key] + 1 }))
                    }} disabled={!canUp}
                      style={{ width: '1.4rem', height: '1.4rem', border: '1px solid var(--bdr-l)', background: 'none', cursor: canUp ? 'pointer' : 'default', fontWeight: 700, color: 'var(--gold-d)', opacity: canUp ? 1 : 0.3 }}>+</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', marginLeft: 'auto' }}>
                      {val < 5 ? `next: ${nextCost}` : 'MAX'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {hoveredChar && createPortal(
          <div style={{
            position: 'fixed', left: hoveredChar.pos.x, top: hoveredChar.pos.y,
            zIndex: 9999, width: 280, pointerEvents: 'none',
            background: 'rgba(252,248,236,0.98)',
            border: '1px solid rgba(200,162,78,0.55)', borderLeft: '3px solid var(--gold)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
            padding: '10px 13px 12px',
          }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(0.72rem,1vw,0.84rem)', fontWeight: 800, letterSpacing: '0.07rem', color: 'var(--ink)', marginBottom: 7, textTransform: 'capitalize' }}>
              {hoveredChar.key}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,0.88vw,0.74rem)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
              {CHAR_DESC[hoveredChar.key]}
            </p>
          </div>,
          document.body,
        )}

        {/* SECTION B: Skills */}
        {section === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '28rem', overflowY: 'auto' }}>
            {refSkills.map(sk => {
              const isCareer = careerSkillKeys.has(sk.key)
              const freeRanks = (draft.freeCareerPicks.includes(sk.key) ? 1 : 0) +
                               (draft.freeSpecPicks.includes(sk.key) ? 1 : 0)
              const xpRanks = draft.skillRanks[sk.key] || 0
              const totalRanks = freeRanks + xpRanks
              const maxAllowed = 2 // max total rank 2 at creation
              const canUp = totalRanks < maxAllowed && (() => {
                const rankBeingBought = totalRanks + 1
                const cost = isCareer ? rankBeingBought * 5 : (rankBeingBought * 5) + 5
                return xpRemaining >= cost
              })()
              const canDown = xpRanks > 0

              const rankBeingBought = totalRanks + 1
              const nextCost = isCareer ? rankBeingBought * 5 : (rankBeingBought * 5) + 5

              return (
                <div key={sk.key} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                  padding: '0.3rem 0.5rem',
                  background: isCareer ? 'rgba(214,77,138,.04)' : 'rgba(0,0,0,.02)',
                  border: `1px solid ${isCareer ? 'rgba(214,77,138,.15)' : 'var(--bdr-l)'}`,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600, color: isCareer ? '#d64d8a' : 'var(--txt2)', flex: 1 }}>
                    {sk.name}
                  </span>
                  {/* Free rank pips */}
                  <div style={{ display: 'flex', gap: '0.15rem' }}>
                    {[0, 1].map(pip => (
                      <div key={pip} style={{
                        width: '0.6rem', height: '0.6rem', borderRadius: '50%',
                        background: pip < freeRanks ? '#d64d8a' : pip < totalRanks ? 'var(--gold-d)' : 'rgba(0,0,0,.15)',
                        border: `1px solid ${pip < freeRanks ? '#d64d8a' : pip < totalRanks ? 'var(--gold)' : 'var(--bdr-l)'}`,
                      }} />
                    ))}
                  </div>
                  <button onClick={() => {
                    if (canDown) setDraft(p => ({ ...p, skillRanks: { ...p.skillRanks, [sk.key]: (p.skillRanks[sk.key] || 0) - 1 } }))
                  }} disabled={!canDown}
                    style={{ width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)', background: 'none', cursor: canDown ? 'pointer' : 'default', fontSize: 'var(--font-xs)', color: 'var(--txt3)', opacity: canDown ? 1 : 0.3 }}>-</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--ink)', width: '0.8rem', textAlign: 'center' }}>{totalRanks}</span>
                  <button onClick={() => {
                    if (canUp) {
                      const cost = isCareer ? rankBeingBought * 5 : (rankBeingBought * 5) + 5
                      if (xpRemaining >= cost) setDraft(p => ({ ...p, skillRanks: { ...p.skillRanks, [sk.key]: (p.skillRanks[sk.key] || 0) + 1 } }))
                    }
                  }} disabled={!canUp}
                    style={{ width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)', background: 'none', cursor: canUp ? 'pointer' : 'default', fontSize: 'var(--font-xs)', color: 'var(--gold-d)', opacity: canUp ? 1 : 0.3 }}>+</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', width: '3.5rem', textAlign: 'right' }}>
                    {totalRanks < 2 ? `${nextCost} XP` : 'MAX'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* SECTION C: Additional Specs */}
        {section === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
              Purchase additional specialisations with starting XP. Only your first specialisation grants 2 free bonus skill ranks — additional specs add skills to your career list only.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>
              Next cost: {(draft.additionalSpecs.length + 2) * 10} XP (career) / {(draft.additionalSpecs.length + 2) * 10 + 10} XP (non-career)
            </div>

            {draft.additionalSpecs.map((spec, idx) => {
              const isCareerSpec = spec.career_key === draft.career?.key
              const cost = (idx + 2) * 10 + (isCareerSpec ? 0 : 10)
              return (
                <div key={spec.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-xs) var(--sp-sm)', background: 'rgba(0,0,0,.04)', border: '1px solid var(--bdr-l)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)' }}>
                    {spec.name} <span style={{ color: 'var(--txt3)', fontWeight: 400 }}>({cost} XP)</span>
                  </span>
                  <button onClick={() => setDraft(p => ({ ...p, additionalSpecs: p.additionalSpecs.filter(s => s.key !== spec.key), talentPicks: p.talentPicks.filter(t => t.specKey !== spec.key) }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--red)' }}>
                    Remove
                  </button>
                </div>
              )
            })}

            <div style={{ maxHeight: '18rem', display: 'flex', flexDirection: 'column', background: 'rgba(6,13,9,0.96)', border: '1px solid rgba(200,170,80,0.18)', borderRadius: 4, padding: '8px', overflow: 'hidden' }}>
              <SpecSelectorList
                refSpecs={specializations}
                ownedKeys={existingKeys}
                careerKey={draft.career?.key ?? ''}
                getSpecCost={spec => {
                  const isCareer = spec.career_key === draft.career?.key
                  return (draft.additionalSpecs.length + 2) * 10 + (isCareer ? 0 : 10)
                }}
                canAfford={spec => {
                  const isCareer = spec.career_key === draft.career?.key
                  const cost = (draft.additionalSpecs.length + 2) * 10 + (isCareer ? 0 : 10)
                  return xpRemaining >= cost
                }}
                onSelect={spec => setDraft(p => {
                  if (p.additionalSpecs.some(s => s.key === spec.key)) return p
                  return { ...p, additionalSpecs: [...p.additionalSpecs, spec] }
                })}
                searchPlaceholder="Search to add a specialisation…"
              />
            </div>
          </div>
        )}

        {/* SECTION D: Talents */}
        {section === 'talents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
            {/* Spec selector — only shown when there are multiple specs to choose from */}
            {allSpecs.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--sp-xs)', flexWrap: 'wrap' }}>
                {allSpecs.map(spec => (
                  <button
                    key={spec.key}
                    onClick={() => setActiveTalentSpecKey(spec.key)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      background: activeTalentSpec?.key === spec.key ? 'rgba(200,162,78,.15)' : 'rgba(0,0,0,.04)',
                      border: `1px solid ${activeTalentSpec?.key === spec.key ? 'var(--gold)' : 'var(--bdr-l)'}`,
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                      color: activeTalentSpec?.key === spec.key ? 'var(--gold-d)' : 'var(--txt2)',
                      cursor: 'pointer', transition: 'border-color .15s, color .15s',
                    }}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            )}

            {/* Full talent tree */}
            {activeTalentSpec ? (() => {
              const specKey = activeTalentSpec.key
              const purchasedSet = new Set(
                draft.talentPicks.filter(p => p.specKey === specKey).map(p => `${p.row}-${p.col}`)
              )
              const treeData = buildTalentTree(activeTalentSpec, talentMap, purchasedSet)
              if (!treeData) return null
              return (
                <TalentTree
                  specName={treeData.specName}
                  nodes={treeData.nodes}
                  connections={treeData.connections}
                  xpAvailable={xpRemaining}
                  isGmMode
                  onPurchase={(talentKey, row, col) => {
                    const cost = ROW_COSTS[row]
                    setDraft(p => {
                      if (p.talentPicks.some(t => t.specKey === specKey && t.row === row && t.col === col)) return p
                      if (xpRemaining < cost) return p
                      return { ...p, talentPicks: [...p.talentPicks, { key: talentKey, specKey, row, col, cost }] }
                    })
                  }}
                  onRemoveTalent={(talentKey) => {
                    setDraft(p => ({
                      ...p,
                      talentPicks: p.talentPicks.filter(t => !(t.key === talentKey && t.specKey === specKey)),
                    }))
                  }}
                />
              )
            })() : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)', textAlign: 'center', padding: 'var(--sp-lg)' }}>
                No specialisations selected.
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--sp-sm)', borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-md)' }}>
          <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
          <button onClick={onContinue}
            style={{ ...S.goldBtn, flex: 2, opacity: xpRemaining >= 0 ? 1 : 0.4, cursor: xpRemaining >= 0 ? 'pointer' : 'default' }}>
            {xpRemaining < 0 ? `OVER BY ${Math.abs(xpRemaining)} XP` : 'CONTINUE → MOTIVATION'}
          </button>
        </div>
      </div>
    </HudCard>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 7: Motivation
// ══════════════════════════════════════════════════════════════════════════════
function MotivationStep({
  motivations, specificMotivations, selectedType, selectedSpecific, motivationDesc,
  onTypeChange, onSpecificChange, onContinue, onBack,
}: {
  motivations: RefMotivation[]
  specificMotivations: RefSpecificMotivation[]
  selectedType: string
  selectedSpecific: string
  motivationDesc: string
  onTypeChange: (t: string) => void
  onSpecificChange: (key: string, desc: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  const [chooseMode, setChooseMode] = useState(false)

  const currentMotivation = motivations.find(m => m.key === selectedType)
  const eligibleSpecifics = useMemo(() => {
    if (!selectedType) return specificMotivations
    return specificMotivations.filter(sm => sm.motivation_key === selectedType)
  }, [selectedType, specificMotivations])

  const handleRoll = () => {
    if (eligibleSpecifics.length === 0) return
    const picked = eligibleSpecifics[Math.floor(Math.random() * eligibleSpecifics.length)]
    onSpecificChange(picked.key, picked.description || '')
    setChooseMode(false)
  }

  const currentSpecific = specificMotivations.find(sm => sm.key === selectedSpecific)

  return (
    <HudCard title="Motivation" animClass="au d1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>
          Every character is driven by something. Your Motivation provides story hooks and earns you bonus XP each session when you roleplay it authentically.
        </p>

        <div>
          <label style={S.labelXs}>PRIMARY TYPE</label>
          <select value={selectedType} onChange={e => { onTypeChange(e.target.value); setChooseMode(false) }} style={S.select}>
            <option value="">— Select type —</option>
            {motivations.map(m => (
              <option key={m.key} value={m.key}>{m.name}</option>
            ))}
          </select>
          {currentMotivation?.description && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              {currentMotivation.description.slice(0, 180)}...
            </p>
          )}
        </div>

        {selectedType && (
          <div>
            <label style={S.labelXs}>SPECIFIC MOTIVATION</label>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-sm)' }}>
              <button onClick={handleRoll}
                style={{ ...S.goldBtn, width: 'auto', padding: 'var(--sp-sm) var(--sp-md)', flex: 1 }}>
                🎲 ROLL d100
              </button>
              <button onClick={() => setChooseMode(c => !c)}
                style={{ ...S.ghostBtn, flex: 1 }}>
                {chooseMode ? 'CANCEL' : 'CHOOSE...'}
              </button>
            </div>
            {chooseMode && (
              <div style={{ maxHeight: '16rem', overflowY: 'auto', border: '1px solid var(--bdr-l)', background: 'var(--white)', marginBottom: 'var(--sp-sm)' }}>
                <div style={{ padding: '0.3rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', background: 'rgba(0,0,0,.03)', borderBottom: '1px solid var(--bdr-l)' }}>
                  Requires GM permission to choose directly
                </div>
                {eligibleSpecifics.map(sm => (
                  <button key={sm.key}
                    onClick={() => { onSpecificChange(sm.key, sm.description || ''); setChooseMode(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem', background: selectedSpecific === sm.key ? 'var(--gold-glow)' : 'transparent', border: 'none', borderBottom: '1px solid var(--bdr-l)', cursor: 'pointer' }}
                    onMouseEnter={e => { if (selectedSpecific !== sm.key) e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
                    onMouseLeave={e => { if (selectedSpecific !== sm.key) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--ink)' }}>{sm.name}</div>
                    {sm.description && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', marginTop: '0.1rem' }}>{sm.description.slice(0, 80)}...</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentSpecific && (
          <div style={{ background: 'rgba(200,162,78,.08)', border: '1px solid rgba(200,162,78,.3)', padding: 'var(--sp-sm) var(--sp-md)' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--gold-d)', letterSpacing: '0.08rem', marginBottom: '0.3rem' }}>
              {currentMotivation?.name} — {currentSpecific.name}
            </div>
            {currentSpecific.description && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', lineHeight: 1.6 }}>
                {currentSpecific.description}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
          <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
          <button onClick={onContinue} style={{ ...S.goldBtn, flex: 2 }}>CONTINUE → REVIEW</button>
        </div>
        <button onClick={onContinue} style={{ ...S.ghostBtn, width: '100%', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>
          Skip — Set Motivation Later
        </button>
      </div>
    </HudCard>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 8: Review / Confirm
// ══════════════════════════════════════════════════════════════════════════════
function ReviewStep({
  draft, skillMap, talentMap, allSpecs, careerSkillKeys,
  xpTotal, xpSpent, xpRemaining, xpSpentOnChars, xpSpentOnSkills, xpSpentOnTalents, xpSpentOnAdditionalSpecs,
  startingObligation, totalObligation, oblXpBonus, extraCredits,
  saving, onBack, onCreate,
}: {
  draft: CharacterDraft
  skillMap: Record<string, RefSkill>
  talentMap: Record<string, RefTalent>
  allSpecs: RefSpecialization[]
  careerSkillKeys: Set<string>
  xpTotal: number
  xpSpent: number
  xpRemaining: number
  xpSpentOnChars: number
  xpSpentOnSkills: number
  xpSpentOnTalents: number
  xpSpentOnAdditionalSpecs: number
  startingObligation: number
  totalObligation: number
  oblXpBonus: number
  extraCredits: number
  saving: boolean
  onBack: () => void
  onCreate: () => void
}) {
  const Row = ({ label, val }: { label: string; val: string }) => (
    <>
      <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--ink)', fontWeight: 600 }}>{val}</span>
    </>
  )

  return (
    <HudCard title="Review Character" animClass="au d1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>

        {/* Identity */}
        <div style={{ display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.25rem 0.75rem' }}>
          <Row label="NAME" val={draft.name} />
          <Row label="PLAYER" val={draft.playerName || 'Player'} />
          {draft.gender && <Row label="GENDER" val={draft.gender} />}
          <Row label="SPECIES" val={draft.species?.name || '—'} />
          <Row label="CAREER" val={draft.career?.name || '—'} />
          <Row label="SPEC" val={allSpecs.map(s => s.name).join(', ')} />
        </div>

        {/* Characteristics */}
        <div>
          <div style={{ ...S.labelXs, marginBottom: '0.4rem' }}>CHARACTERISTICS</div>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', flexWrap: 'wrap' }}>
            {CHAR_KEYS.map(k => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--ink)' }}>{draft[k]}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', textTransform: 'uppercase' }}>{CHAR_SHORT[k]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Derived stats */}
        <div style={{ display: 'flex', gap: 'var(--sp-md)', flexWrap: 'wrap', borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
          {draft.species && (
            <>
              <StatPill label="WOUNDS" value={String(draft.species.wound_threshold + draft.brawn)} />
              <StatPill label="STRAIN" value={String(draft.species.strain_threshold + draft.willpower)} />
              <StatPill label="SOAK" value={String(draft.brawn)} />
              <StatPill label="ENC TH" value={String(5 + draft.brawn)} />
            </>
          )}
        </div>

        {/* Free ranks */}
        {(draft.freeCareerPicks.length > 0 || draft.freeSpecPicks.length > 0) && (
          <div>
            <div style={{ ...S.labelXs, marginBottom: '0.4rem' }}>FREE SKILL RANKS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {[...draft.freeCareerPicks, ...draft.freeSpecPicks].map((sk, i) => (
                <span key={`${sk}-${i}`} style={S.skillPill(true)}>{skillMap[sk]?.name || sk}</span>
              ))}
            </div>
          </div>
        )}

        {/* XP breakdown */}
        <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
          <div style={{ ...S.labelXs, marginBottom: '0.4rem' }}>XP BREAKDOWN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {[
              { label: 'TOTAL', val: xpTotal, color: 'var(--gold-d)', bg: 'rgba(200,162,78,.1)', bdr: 'rgba(200,162,78,.4)' },
              { label: 'CHARS', val: xpSpentOnChars, color: 'var(--ink)', bg: 'rgba(0,0,0,.04)', bdr: 'var(--bdr-l)' },
              { label: 'SKILLS', val: xpSpentOnSkills, color: '#d64d8a', bg: 'rgba(214,77,138,.08)', bdr: 'rgba(214,77,138,.3)' },
              { label: 'TALENTS', val: xpSpentOnTalents, color: 'var(--blue)', bg: 'rgba(43,93,174,.08)', bdr: 'rgba(43,93,174,.3)' },
              { label: 'ADD SPECS', val: xpSpentOnAdditionalSpecs, color: 'var(--txt2)', bg: 'rgba(0,0,0,.04)', bdr: 'var(--bdr-l)' },
              { label: 'REMAINING', val: xpRemaining, color: xpRemaining >= 0 ? 'var(--blue)' : '#E05050', bg: 'rgba(43,93,174,.06)', bdr: 'rgba(43,93,174,.3)' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.bdr}`, padding: '0.25rem 0.5rem', textAlign: 'center', minWidth: '4rem' }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: item.color }}>{item.val}</div>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Obligation / Duty summary */}
        <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)', display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.25rem 0.75rem' }}>
          {draft.obligationType && <Row label="OBLIGATION" val={`${draft.obligationType} (${totalObligation})`} />}
          {draft.dutyType && <Row label="DUTY" val={draft.dutyType} />}
          {draft.motivationType && <Row label="MOTIVATION" val={`${draft.motivationType}${draft.motivationSpecific ? ` — ${draft.motivationSpecific}` : ''}`} />}
          {extraCredits > 0 && <Row label="STARTING CR" val={`500 + ${extraCredits.toLocaleString()} = ${(500 + extraCredits).toLocaleString()}`} />}
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)' }}>
          <button onClick={onBack} style={{ ...S.ghostBtn, flex: 1 }}>← BACK</button>
          <button
            onClick={onCreate} disabled={saving || xpRemaining < 0}
            style={{ ...S.goldBtn, flex: 2, opacity: (saving || xpRemaining < 0) ? 0.5 : 1, cursor: (saving || xpRemaining < 0) ? 'default' : 'pointer' }}
          >
            {saving ? 'CREATING...' : xpRemaining < 0 ? `OVER BY ${Math.abs(xpRemaining)} XP` : 'CREATE CHARACTER'}
          </button>
        </div>
      </div>
    </HudCard>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Shared sub-components
// ══════════════════════════════════════════════════════════════════════════════
function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)', fontWeight: 700, color: highlight ? 'var(--gold-d)' : 'var(--ink)' }}>{value}</div>
    </div>
  )
}

function CollapsibleDesc({ html }: { html: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-xs)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', padding: 0 }}>
        {open ? '▲ HIDE' : '▼ SHOW DESCRIPTION'}
      </button>
      {open && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', lineHeight: 1.6, marginTop: 'var(--sp-xs)' }}
          dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATOR ITEM TOOLTIP — shared hover tooltip for careers & specialisations
// ══════════════════════════════════════════════════════════════════════════════
const CREATOR_TIP_W = 320

interface CreatorTipItem {
  name:        string
  description?: string
  skillKeys:   string[]
  source?:     string | null
  isForce?:    boolean
}

interface CreatorTipPos {
  x:   number   // fixed left position
  y:   number   // fixed top position
}

function CreatorItemTooltip({
  item, pos,
}: {
  item:     CreatorTipItem
  pos:      CreatorTipPos
  skillMap: Record<string, RefSkill>
}) {
  const rawDesc = item.description ? stripBBCode(item.description) : ''
  // Take first paragraph only, then cut before the skills-list sentence
  const firstPara = rawDesc.split(/\n\s*\n/)[0]?.trim() ?? ''
  const skillsCutIdx = firstPara.search(/ starts? (off )?with /i)
  const desc = skillsCutIdx > 0 ? firstPara.slice(0, skillsCutIdx).trim() : firstPara
  if (!desc) return null

  return createPortal(
    <div
      style={{
        position:    'fixed',
        left:        pos.x,
        top:         pos.y,
        zIndex:      9999,
        width:       CREATOR_TIP_W,
        maxHeight:   'min(80vh, 600px)',
        overflowY:   'auto',
        pointerEvents: 'none',
        background:  'rgba(252,248,236,0.98)',
        border:      '1px solid rgba(200,162,78,0.55)',
        borderLeft:  '3px solid var(--gold)',
        boxShadow:   '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
        padding:     '10px 13px 12px',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-orbitron)',
        fontSize:   'clamp(0.72rem, 1vw, 0.84rem)',
        fontWeight: 800, letterSpacing: '0.07rem',
        color:      'var(--ink)',
        marginBottom: 7,
      }}>
        {item.name}
      </div>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize:   'clamp(0.65rem, 0.88vw, 0.74rem)',
        color:      'var(--txt2)',
        margin:     0, lineHeight: 1.6,
      }}>
        {desc}
      </p>
    </div>,
    document.body,
  )
}

/** Compute fixed-position coords for the creator tooltip, favouring right-side placement. */
function calcCreatorTipPos(rect: DOMRect): CreatorTipPos {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spaceRight = vw - rect.right - 12
  const x = spaceRight >= CREATOR_TIP_W
    ? rect.right + 12
    : Math.max(8, rect.left - CREATOR_TIP_W - 12)
  // Keep tooltip from starting too close to the bottom — max 80vh cap is handled by CSS
  const y = Math.min(rect.top, vh * 0.85)
  return { x, y }
}
