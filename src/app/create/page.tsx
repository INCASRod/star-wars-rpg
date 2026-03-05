'use client'

import { Suspense, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HudCard } from '@/components/ui/HudCard'
import type { RefSpecies, RefCareer, RefSpecialization, RefSkill, RefTalent } from '@/lib/types'

const STEPS = ['Species', 'Career', 'Specialization', 'Skills & Talents', 'Details', 'Confirm']
const ROW_COSTS = [5, 10, 15, 20, 25]

interface CharacterDraft {
  name: string
  playerName: string
  species: RefSpecies | null
  career: RefCareer | null
  specialization: RefSpecialization | null
  gender: string
  // Characteristics after species bonus
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  // Free skill ranks
  freeCareerPicks: string[]
  freeSpecPicks: string[]
  // XP-purchased extra skill ranks (beyond free)
  skillRanks: Record<string, number>
  // XP-purchased talents
  talentPicks: { key: string; specKey: string; row: number; col: number; cost: number }[]
}

const CHAR_KEYS = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const

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

function CreateWizard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Ref data
  const [species, setSpecies] = useState<RefSpecies[]>([])
  const [careers, setCareers] = useState<RefCareer[]>([])
  const [specializations, setSpecializations] = useState<RefSpecialization[]>([])
  const [refSkills, setRefSkills] = useState<RefSkill[]>([])
  const [refTalents, setRefTalents] = useState<RefTalent[]>([])

  // Draft
  const [draft, setDraft] = useState<CharacterDraft>({
    name: '', playerName: '', species: null, career: null, specialization: null, gender: '',
    brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2,
    freeCareerPicks: [], freeSpecPicks: [], skillRanks: {}, talentPicks: [],
  })

  useEffect(() => {
    async function load() {
      const [spRes, carRes, specRes, skRes, talRes] = await Promise.all([
        supabase.from('ref_species').select('*').order('name'),
        supabase.from('ref_careers').select('*').order('name'),
        supabase.from('ref_specializations').select('*').order('name'),
        supabase.from('ref_skills').select('*').order('name'),
        supabase.from('ref_talents').select('*').order('name'),
      ])
      setSpecies((spRes.data as RefSpecies[]) || [])
      setCareers((carRes.data as RefCareer[]) || [])
      setSpecializations((specRes.data as RefSpecialization[]) || [])
      setRefSkills((skRes.data as RefSkill[]) || [])
      setRefTalents((talRes.data as RefTalent[]) || [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Skill + talent maps
  const skillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])), [refSkills])
  const talentMap = useMemo(() => Object.fromEntries(refTalents.map(t => [t.key, t])), [refTalents])

  // XP tracking — characteristics
  const startingXp = draft.species?.starting_xp || 0
  const xpSpentOnChars = CHAR_KEYS.reduce((sum, key) => {
    const base = draft.species ? draft.species[key] : 2
    const current = draft[key]
    let cost = 0
    for (let i = base + 1; i <= current; i++) cost += i * 10
    return sum + cost
  }, 0)

  // XP tracking — skills
  const xpSpentOnSkills = useMemo(() => {
    let total = 0
    const careerKeys = new Set<string>()
    if (draft.career) draft.career.career_skill_keys?.forEach(k => careerKeys.add(k))
    if (draft.specialization) draft.specialization.career_skill_keys?.forEach(k => careerKeys.add(k))

    for (const [skillKey, purchasedRanks] of Object.entries(draft.skillRanks)) {
      if (purchasedRanks <= 0) continue
      const freeRanks = (draft.freeCareerPicks.includes(skillKey) ? 1 : 0) +
                         (draft.freeSpecPicks.includes(skillKey) ? 1 : 0)
      const isCareer = careerKeys.has(skillKey)
      for (let r = freeRanks + 1; r <= freeRanks + purchasedRanks; r++) {
        total += isCareer ? r * 5 : (r * 5) + 5
      }
    }
    return total
  }, [draft.skillRanks, draft.freeCareerPicks, draft.freeSpecPicks, draft.career, draft.specialization])

  // XP tracking — talents
  const xpSpentOnTalents = useMemo(() =>
    draft.talentPicks.reduce((sum, t) => sum + t.cost, 0),
    [draft.talentPicks]
  )

  const xpSpent = xpSpentOnChars + xpSpentOnSkills + xpSpentOnTalents
  const xpRemaining = startingXp - xpSpent

  // Career skills (union of career + specialization skills)
  const careerSkillKeys = useMemo(() => {
    const keys = new Set<string>()
    if (draft.career) draft.career.career_skill_keys?.forEach(k => keys.add(k))
    if (draft.specialization) draft.specialization.career_skill_keys?.forEach(k => keys.add(k))
    return keys
  }, [draft.career, draft.specialization])

  const handleSelectSpecies = (sp: RefSpecies) => {
    setDraft(prev => ({
      ...prev,
      species: sp,
      brawn: sp.brawn, agility: sp.agility, intellect: sp.intellect,
      cunning: sp.cunning, willpower: sp.willpower, presence: sp.presence,
    }))
    setSearch('')
  }

  const handleCharChange = (key: typeof CHAR_KEYS[number], delta: number) => {
    const base = draft.species ? draft.species[key] : 2
    setDraft(prev => {
      const newVal = prev[key] + delta
      if (newVal < base || newVal > 6) return prev
      return { ...prev, [key]: newVal }
    })
  }

  const handleCreate = async () => {
    if (!campaignId || !draft.species || !draft.career || !draft.specialization || !draft.name) return
    setSaving(true)

    try {
      // Create or find player
      let playerId: string
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('display_name', draft.playerName || 'Player')
        .single()

      if (existingPlayer) {
        playerId = existingPlayer.id
      } else {
        const { data: newPlayer, error: plErr } = await supabase
          .from('players')
          .insert({ campaign_id: campaignId, display_name: draft.playerName || 'Player', is_gm: false })
          .select('id')
          .single()
        if (plErr) throw plErr
        playerId = newPlayer.id
      }

      // Compute final skill ranks (free + purchased)
      const finalSkillRanks: Record<string, number> = {}
      for (const sk of draft.freeCareerPicks) {
        finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + 1
      }
      for (const sk of draft.freeSpecPicks) {
        finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + 1
      }
      for (const [sk, ranks] of Object.entries(draft.skillRanks)) {
        if (ranks > 0) finalSkillRanks[sk] = (finalSkillRanks[sk] || 0) + ranks
      }

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
          brawn: draft.brawn,
          agility: draft.agility,
          intellect: draft.intellect,
          cunning: draft.cunning,
          willpower: draft.willpower,
          presence: draft.presence,
          wound_threshold: draft.species.wound_threshold + draft.brawn,
          wound_current: 0,
          strain_threshold: draft.species.strain_threshold + draft.willpower,
          strain_current: 0,
          soak: draft.brawn,
          defense_ranged: 0,
          defense_melee: 0,
          xp_total: startingXp,
          xp_available: xpRemaining,
          credits: 500,
          encumbrance_threshold: 5 + draft.brawn,
          morality_value: 50,
          backstory: '',
          notes: '',
        })
        .select('id')
        .single()

      if (charErr) throw charErr

      // Create specialization entry
      await supabase.from('character_specializations').insert({
        character_id: char.id,
        specialization_key: draft.specialization.key,
        is_starting: true,
        purchase_order: 0,
      })

      // Create skill entries with actual ranks
      const skillInserts = refSkills.map(sk => ({
        character_id: char.id,
        skill_key: sk.key,
        rank: finalSkillRanks[sk.key] || 0,
        is_career: careerSkillKeys.has(sk.key),
      }))
      await supabase.from('character_skills').insert(skillInserts)

      // Insert purchased talents
      if (draft.talentPicks.length > 0) {
        const talentInserts = draft.talentPicks.map(t => ({
          character_id: char.id,
          talent_key: t.key,
          specialization_key: t.specKey,
          tree_row: t.row,
          tree_col: t.col,
          ranks: 1,
          xp_cost: t.cost,
        }))
        await supabase.from('character_talents').insert(talentInserts)
      }

      // Log XP transactions
      const xpReasons: string[] = []
      if (xpSpentOnChars > 0) xpReasons.push(`Characteristics: ${xpSpentOnChars} XP`)
      if (xpSpentOnSkills > 0) xpReasons.push(`Skills: ${xpSpentOnSkills} XP`)
      if (xpSpentOnTalents > 0) xpReasons.push(`Talents: ${xpSpentOnTalents} XP`)
      if (xpReasons.length > 0) {
        await supabase.from('xp_transactions').insert({
          character_id: char.id,
          amount: -xpSpent,
          reason: `Character creation: ${xpReasons.join(', ')}`,
        })
      }

      router.push(`/character/${char.id}`)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
      setSaving(false)
    }
  }

  if (!campaignId) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 'var(--font-md)' }}>
        Missing campaign ID. Go back to the lobby.
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

  // ── Shared styles ──
  const pageStyle: React.CSSProperties = {
    width: '100vw', height: '100vh', overflow: 'auto',
    background: 'var(--sand)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 'var(--sp-xl) var(--sp-lg) calc(var(--sp-xl) * 3)',
    gap: 'var(--sp-lg)',
  }

  const searchStyle: React.CSSProperties = {
    width: '100%', maxWidth: '28rem', padding: 'var(--sp-sm) var(--sp-md)',
    border: '1px solid var(--bdr-l)', background: 'var(--white)',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
    letterSpacing: '0.05rem',
  }

  return (
    <div style={pageStyle}>
      {/* Radial bg */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `radial-gradient(circle at 30% 40%, rgba(200,162,78,.06) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(43,93,174,.04) 0%, transparent 50%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontWeight: 900,
          fontSize: 'var(--font-hero)', letterSpacing: '0.4rem',
          color: 'var(--gold-d)', textShadow: '0 0 60px var(--gold-glow-s)',
        }}>
          NEW CHARACTER
        </div>
        {/* Step indicator */}
        <div style={{
          display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center',
          marginTop: 'var(--sp-md)', flexWrap: 'wrap',
        }}>
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                if (i < step) { setStep(i); setSearch('') }
              }}
              style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                fontWeight: i === step ? 700 : 500,
                letterSpacing: '0.1rem',
                color: i === step ? 'var(--gold-d)' : i < step ? 'var(--txt2)' : 'var(--txt3)',
                background: 'none', border: 'none',
                borderBottom: i === step ? '2px solid var(--gold)' : '2px solid transparent',
                padding: '0.2rem 0.4rem',
                cursor: i < step ? 'pointer' : 'default',
                transition: '.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '36rem' }}>

        {/* STEP 0: Species */}
        {step === 0 && (
          <SpeciesSelector
            species={species}
            selected={draft.species}
            onSelect={handleSelectSpecies}
            onConfirm={() => { if (draft.species) { setStep(1); setSearch('') } }}
          />
        )}

        {/* STEP 1: Career */}
        {step === 1 && (
          <CareerSelector
            careers={careers}
            refSkills={refSkills}
            selected={draft.career}
            onSelect={(car) => setDraft(prev => ({ ...prev, career: car, specialization: null }))}
            onConfirm={() => { if (draft.career) { setStep(2); setSearch('') } }}
          />
        )}

        {/* STEP 2: Specialization */}
        {step === 2 && (
          <SpecializationSelector
            specializations={specializations}
            refSkills={refSkills}
            careerKey={draft.career?.key || ''}
            selected={draft.specialization}
            onSelect={(spec) => setDraft(prev => ({
              ...prev,
              specialization: spec,
              freeSpecPicks: [],
              skillRanks: {},
              talentPicks: [],
            }))}
            onConfirm={() => {
              if (draft.specialization) { setStep(3); setSearch('') }
            }}
          />
        )}

        {/* STEP 3: Skills & Talents */}
        {step === 3 && draft.career && draft.specialization && (
          <SkillsTalentsStep
            draft={draft}
            setDraft={setDraft}
            refSkills={refSkills}
            talentMap={talentMap}
            careerSkillKeys={careerSkillKeys}
            xpRemaining={xpRemaining}
            xpSpentOnSkills={xpSpentOnSkills}
            xpSpentOnTalents={xpSpentOnTalents}
            onContinue={() => setStep(4)}
          />
        )}

        {/* STEP 4: Details — Name, Gender, Spend XP on Characteristics */}
        {step === 4 && (
          <HudCard title="Character Details" animClass="au d1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', display: 'block', marginBottom: '0.2rem' }}>
                  CHARACTER NAME
                </label>
                <input
                  value={draft.name}
                  onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name..."
                  style={{ ...searchStyle, maxWidth: '100%' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', display: 'block', marginBottom: '0.2rem' }}>
                  PLAYER NAME
                </label>
                <input
                  value={draft.playerName}
                  onChange={e => setDraft(prev => ({ ...prev, playerName: e.target.value }))}
                  placeholder="Your name..."
                  style={{ ...searchStyle, maxWidth: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', display: 'block', marginBottom: '0.2rem' }}>
                  GENDER
                </label>
                <select
                  value={draft.gender}
                  onChange={e => setDraft(prev => ({ ...prev, gender: e.target.value }))}
                  style={{ ...searchStyle, maxWidth: '100%', cursor: 'pointer' }}
                >
                  <option value="">— Select —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Characteristics */}
              <div>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-sm)' }}>
                  CHARACTERISTICS — {xpRemaining} XP remaining
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)' }}>
                  {CHAR_KEYS.map(key => {
                    const base = draft.species ? draft.species[key] : 2
                    const val = draft[key]
                    const nextCost = (val + 1) * 10
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                        padding: '0.3rem 0.5rem',
                        background: 'rgba(255,255,255,.5)',
                        border: '1px solid var(--bdr-l)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                          fontWeight: 600, color: 'var(--txt2)', width: '4.5rem',
                          textTransform: 'uppercase', letterSpacing: '0.05rem',
                        }}>
                          {key}
                        </span>
                        <button
                          onClick={() => handleCharChange(key, -1)}
                          disabled={val <= base}
                          style={{
                            width: '1.3rem', height: '1.3rem', border: '1px solid var(--bdr-l)',
                            background: 'none', cursor: val > base ? 'pointer' : 'default',
                            fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--txt3)',
                            opacity: val > base ? 1 : 0.3,
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)',
                          fontWeight: 800, color: 'var(--ink)', width: '1.5rem', textAlign: 'center',
                        }}>
                          {val}
                        </span>
                        <button
                          onClick={() => handleCharChange(key, 1)}
                          disabled={val >= 6 || xpRemaining < nextCost}
                          style={{
                            width: '1.3rem', height: '1.3rem', border: '1px solid var(--bdr-l)',
                            background: 'none', cursor: (val < 6 && xpRemaining >= nextCost) ? 'pointer' : 'default',
                            fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--gold-d)',
                            opacity: (val < 6 && xpRemaining >= nextCost) ? 1 : 0.3,
                          }}
                        >
                          +
                        </button>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)',
                          color: 'var(--txt3)', marginLeft: 'auto',
                        }}>
                          {val < 6 ? `next: ${nextCost}` : 'MAX'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep(5)}
                disabled={!draft.name}
                style={{
                  background: draft.name ? 'var(--gold)' : 'var(--txt3)',
                  border: 'none', padding: 'var(--sp-sm) var(--sp-lg)',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                  fontWeight: 700, color: 'var(--white)', cursor: draft.name ? 'pointer' : 'default',
                  letterSpacing: '0.15rem', transition: '.2s',
                  marginTop: 'var(--sp-sm)',
                }}
              >
                CONTINUE TO SUMMARY
              </button>
            </div>
          </HudCard>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && (
          <HudCard title="Confirm Character" animClass="au d1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: '0.3rem 0.8rem', fontSize: 'var(--font-md)' }}>
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.1rem' }}>NAME</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{draft.name}</span>

                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.1rem' }}>PLAYER</span>
                <span style={{ color: 'var(--txt2)' }}>{draft.playerName || 'Player'}</span>

                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.1rem' }}>SPECIES</span>
                <span style={{ color: 'var(--txt2)' }}>{draft.species?.name}</span>

                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.1rem' }}>CAREER</span>
                <span style={{ color: 'var(--txt2)' }}>{draft.career?.name}</span>

                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.1rem' }}>SPEC</span>
                <span style={{ color: 'var(--txt2)' }}>{draft.specialization?.name}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)', marginTop: 'var(--sp-xs)' }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-xs)' }}>
                  CHARACTERISTICS
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-md)', flexWrap: 'wrap' }}>
                  {CHAR_KEYS.map(key => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--ink)' }}>
                        {draft[key]}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)', textTransform: 'uppercase' }}>
                        {key.slice(0, 3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free ranks summary */}
              {(draft.freeCareerPicks.length > 0 || draft.freeSpecPicks.length > 0) && (
                <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-xs)' }}>
                    FREE SKILL RANKS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {[...draft.freeCareerPicks, ...draft.freeSpecPicks].map((sk, i) => (
                      <span key={`${sk}-${i}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                        color: '#d64d8a', background: 'rgba(214,77,138,.08)',
                        border: '1px solid rgba(214,77,138,.3)',
                        padding: '0.08rem 0.35rem',
                      }}>
                        {skillMap[sk]?.name || sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* XP skill purchases summary */}
              {Object.entries(draft.skillRanks).some(([, r]) => r > 0) && (
                <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-xs)' }}>
                    XP SKILL PURCHASES ({xpSpentOnSkills} XP)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {Object.entries(draft.skillRanks).filter(([, r]) => r > 0).map(([sk, r]) => (
                      <span key={sk} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                        color: 'var(--gold-d)', background: 'rgba(200,162,78,.08)',
                        border: '1px solid rgba(200,162,78,.3)',
                        padding: '0.08rem 0.35rem',
                      }}>
                        {skillMap[sk]?.name || sk} +{r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Talent purchases summary */}
              {draft.talentPicks.length > 0 && (
                <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-xs)' }}>
                    TALENTS ({xpSpentOnTalents} XP)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {draft.talentPicks.map(t => (
                      <span key={`${t.key}-${t.row}-${t.col}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                        color: 'var(--blue)', background: 'rgba(43,93,174,.08)',
                        border: '1px solid rgba(43,93,174,.3)',
                        padding: '0.08rem 0.35rem',
                      }}>
                        {talentMap[t.key]?.name || t.key} ({t.cost} XP)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* XP breakdown boxes */}
              <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)', marginTop: 'var(--sp-xs)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  <div style={{
                    background: 'rgba(200,162,78,.1)', border: '1px solid rgba(200,162,78,.4)',
                    padding: '0.25rem 0.5rem', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)' }}>
                      {startingXp}
                    </div>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>
                      TOTAL XP
                    </div>
                  </div>
                  {[
                    { val: xpSpentOnChars, label: 'CHARS', color: 'var(--ink)' },
                    { val: xpSpentOnSkills, label: 'SKILLS', color: '#d64d8a' },
                    { val: xpSpentOnTalents, label: 'TALENTS', color: 'var(--blue)' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'rgba(0,0,0,.03)', border: '1px solid var(--bdr-l)',
                      padding: '0.25rem 0.5rem', textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: item.color }}>
                        {item.val}
                      </div>
                      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                  <div style={{
                    background: xpRemaining > 0 ? 'rgba(43,93,174,.08)' : 'rgba(0,0,0,.03)',
                    border: `1px solid ${xpRemaining > 0 ? 'rgba(43,93,174,.3)' : 'var(--bdr-l)'}`,
                    padding: '0.25rem 0.5rem', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: xpRemaining > 0 ? 'var(--blue)' : 'var(--txt3)' }}>
                      {xpRemaining}
                    </div>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.08rem', color: 'var(--txt3)' }}>
                      REMAINING
                    </div>
                  </div>
                </div>
              </div>

              {/* Career skills badges */}
              <div style={{ borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)' }}>
                <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)', marginBottom: 'var(--sp-xs)' }}>
                  CAREER SKILLS ({careerSkillKeys.size})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                  {[...careerSkillKeys].map(k => {
                    const isFromCareer = draft.career?.career_skill_keys?.includes(k)
                    return (
                      <span key={k} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                        color: isFromCareer ? '#d64d8a' : 'var(--txt3)',
                        background: isFromCareer ? 'rgba(214,77,138,.08)' : 'rgba(0,0,0,.04)',
                        border: `1px solid ${isFromCareer ? 'rgba(214,77,138,.3)' : 'var(--bdr-l)'}`,
                        padding: '0.08rem 0.35rem', whiteSpace: 'nowrap',
                      }}>
                        {skillMap[k]?.name || k}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-md)' }}>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,.5)',
                    border: '1px solid var(--bdr-l)', padding: 'var(--sp-sm)',
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                    fontWeight: 600, color: 'var(--txt2)', cursor: 'pointer',
                    letterSpacing: '0.1rem',
                  }}
                >
                  BACK
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  style={{
                    flex: 2, background: 'var(--gold)',
                    border: 'none', padding: 'var(--sp-sm)',
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                    fontWeight: 700, color: 'var(--white)', cursor: saving ? 'wait' : 'pointer',
                    letterSpacing: '0.15rem', transition: '.2s',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'CREATING...' : 'CREATE CHARACTER'}
                </button>
              </div>
            </div>
          </HudCard>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  SPECIES SELECTOR — searchable dropdown */
/* ═══════════════════════════════════════ */

function SpeciesSelector({
  species,
  selected,
  onSelect,
  onConfirm,
}: {
  species: RefSpecies[]
  selected: RefSpecies | null
  onSelect: (sp: RefSpecies) => void
  onConfirm: () => void
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Dropdown combobox */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`,
            padding: '0.45rem 0.7rem', cursor: 'text',
            transition: 'border-color .2s',
          }}
        >
          <input
            ref={inputRef}
            value={open ? query : (selected?.name || '')}
            onChange={e => { setQuery(e.target.value); if (!open) setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : 'Search species...'}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
              letterSpacing: '0.05rem', color: 'var(--ink)',
            }}
          />
          <button
            onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--font-sm)', color: 'var(--txt3)', padding: '0 0.2rem',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform .2s',
            }}
          >
            ▼
          </button>
        </div>

        {/* Dropdown list */}
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 20, maxHeight: '22rem', overflowY: 'auto',
            background: 'var(--white)', border: '1px solid var(--bdr-l)',
            borderTop: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,.1)',
          }}>
            {filtered.length === 0 ? (
              <div style={{
                padding: '0.8rem', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)',
              }}>
                No species found
              </div>
            ) : filtered.map(sp => {
              const isSelected = selected?.key === sp.key
              return (
                <button
                  key={sp.key}
                  onClick={() => { onSelect(sp); setQuery(''); setOpen(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.5rem 0.7rem',
                    background: isSelected ? 'var(--gold-glow)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--bdr-l)',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
                    fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem',
                  }}>
                    {sp.name}
                  </div>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.15rem', marginTop: '0.15rem',
                  }}>
                    {[
                      { label: 'Br', value: sp.brawn },
                      { label: 'Ag', value: sp.agility },
                      { label: 'Int', value: sp.intellect },
                      { label: 'Cun', value: sp.cunning },
                      { label: 'Wil', value: sp.willpower },
                      { label: 'Pr', value: sp.presence },
                    ].map(s => (
                      <span key={s.label} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 600,
                        letterSpacing: '0.04rem', color: s.value >= 3 ? '#d64d8a' : 'var(--txt2)',
                        background: s.value >= 3 ? 'rgba(214,77,138,.08)' : 'rgba(0,0,0,.04)',
                        border: `1px solid ${s.value >= 3 ? 'rgba(214,77,138,.3)' : 'var(--bdr-l)'}`,
                        padding: '0.04rem 0.25rem', whiteSpace: 'nowrap',
                      }}>
                        {s.label} {s.value}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected species card */}
      {selected && (
        <div style={{
          background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)',
          border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
            fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem',
            marginBottom: 'var(--sp-sm)',
          }}>
            {selected.name}
          </div>

          {/* Stat hexes */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'var(--sp-xs)', marginBottom: 'var(--sp-sm)',
          }}>
            {CHAR_KEYS.map(key => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)',
                  fontWeight: 800, color: 'var(--ink)',
                }}>
                  {selected[key]}
                </div>
                <div style={{
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
                  fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)',
                  textTransform: 'uppercase',
                }}>
                  {key.slice(0, 3)}
                </div>
              </div>
            ))}
          </div>

          {/* Thresholds + XP */}
          <div style={{
            display: 'flex', gap: 'var(--sp-lg)',
            borderTop: '1px solid var(--bdr-l)', paddingTop: 'var(--sp-sm)',
          }}>
            <StatPill label="WOUND TH" value={`${selected.wound_threshold} + Br`} />
            <StatPill label="STRAIN TH" value={`${selected.strain_threshold} + Wil`} />
            <StatPill label="START XP" value={String(selected.starting_xp)} highlight />
          </div>

          {selected.description && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
              fontWeight: 400, color: 'var(--txt2)', marginTop: 'var(--sp-sm)',
              lineHeight: 1.6,
            }}
              dangerouslySetInnerHTML={{
                __html: selected.description
                  .replace(/\[H4\]([\s\S]*?)\[h4\]/g, '<strong style="display:block;margin-top:0.5rem;font-weight:700;color:var(--ink)">$1</strong>')
                  .replace(/\[B\]([\s\S]*?)\[b\]/g, '<strong>$1</strong>')
                  .replace(/\[P\]/g, '<br/><br/>')
                  .replace(/\[I\]([\s\S]*?)\[i\]/g, '<em>$1</em>')
                  .replace(/\[BR\]/gi, '<br/>')
              }}
            />
          )}

          <button
            onClick={onConfirm}
            style={{
              marginTop: 'var(--sp-md)', width: '100%',
              background: 'var(--gold)', border: 'none',
              padding: 'var(--sp-sm) var(--sp-lg)',
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
              fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
              letterSpacing: '0.15rem', transition: '.2s',
            }}
          >
            CONFIRM SPECIES
          </button>
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
        fontWeight: 600, letterSpacing: '0.08rem',
        color: 'var(--txt3)',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
        fontWeight: 700, color: highlight ? 'var(--gold-d)' : 'var(--ink)',
      }}>
        {value}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  CAREER SELECTOR — searchable dropdown  */
/* ═══════════════════════════════════════ */

function CareerSelector({
  careers,
  refSkills,
  selected,
  onSelect,
  onConfirm,
}: {
  careers: RefCareer[]
  refSkills: RefSkill[]
  selected: RefCareer | null
  onSelect: (car: RefCareer) => void
  onConfirm: () => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(!selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const skillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s.name])), [refSkills])

  const filtered = useMemo(() => {
    if (!query) return careers
    const q = query.toLowerCase()
    return careers.filter(c => c.name.toLowerCase().includes(q))
  }, [careers, query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Dropdown combobox */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`,
            padding: '0.45rem 0.7rem', cursor: 'text',
            transition: 'border-color .2s',
          }}
        >
          <input
            ref={inputRef}
            placeholder={selected ? selected.name : 'Search careers...'}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
              letterSpacing: '0.05rem', color: 'var(--ink)',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
            color: 'var(--txt3)', cursor: 'pointer', userSelect: 'none',
          }}
            onClick={e => { e.stopPropagation(); setOpen(!open) }}
          >
            {open ? '\u25B2' : '\u25BC'}
          </span>
        </div>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 20, maxHeight: '22rem', overflowY: 'auto',
            background: 'var(--white)', border: '1px solid var(--bdr-l)',
            borderTop: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,.1)',
          }}>
            {filtered.length === 0 ? (
              <div style={{
                padding: '0.8rem', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)',
              }}>
                No careers found
              </div>
            ) : filtered.map(car => {
              const isSelected = selected?.key === car.key
              return (
                <button
                  key={car.key}
                  onClick={() => { onSelect(car); setQuery(''); setOpen(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.5rem 0.7rem',
                    background: isSelected ? 'var(--gold-glow)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--bdr-l)',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
                    fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem',
                  }}>
                    {car.name}
                  </div>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.15rem', marginTop: '0.15rem',
                  }}>
                    {car.career_skill_keys?.map(k => (
                      <span key={k} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 600,
                        letterSpacing: '0.04rem', color: '#d64d8a',
                        background: 'rgba(214,77,138,.08)',
                        border: '1px solid rgba(214,77,138,.3)',
                        padding: '0.04rem 0.25rem', whiteSpace: 'nowrap',
                      }}>
                        {skillMap[k] || k}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected career card */}
      {selected && (
        <div style={{
          background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)',
          border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
            fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem',
            marginBottom: 'var(--sp-sm)',
          }}>
            {selected.name}
          </div>

          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
            fontWeight: 700, letterSpacing: '0.1rem', color: 'var(--txt3)',
            marginBottom: '0.3rem',
          }}>
            CAREER SKILLS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: 'var(--sp-sm)' }}>
            {selected.career_skill_keys?.map(k => (
              <span key={k} style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.04rem', color: '#d64d8a',
                background: 'rgba(214,77,138,.08)',
                border: '1px solid rgba(214,77,138,.3)',
                padding: '0.08rem 0.35rem', whiteSpace: 'nowrap',
              }}>
                {skillMap[k] || k}
              </span>
            ))}
          </div>

          {selected.description && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
              fontWeight: 400, color: 'var(--txt2)', lineHeight: 1.6,
            }}
              dangerouslySetInnerHTML={{
                __html: selected.description
                  .replace(/\[H4\]([\s\S]*?)\[h4\]/g, '<strong style="display:block;margin-top:0.5rem;font-weight:700;color:var(--ink)">$1</strong>')
                  .replace(/\[B\]([\s\S]*?)\[b\]/g, '<strong>$1</strong>')
                  .replace(/\[P\]/g, '<br/><br/>')
                  .replace(/\[I\]([\s\S]*?)\[i\]/g, '<em>$1</em>')
                  .replace(/\[BR\]/gi, '<br/>')
              }}
            />
          )}

          <button
            onClick={onConfirm}
            style={{
              marginTop: 'var(--sp-md)', width: '100%',
              background: 'var(--gold)', border: 'none',
              padding: 'var(--sp-sm) var(--sp-lg)',
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
              fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
              letterSpacing: '0.15rem', transition: '.2s',
            }}
          >
            CONFIRM CAREER
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/*  SPECIALIZATION SELECTOR — searchable dropdown  */
/* ═══════════════════════════════════════════════ */

function SpecializationSelector({
  specializations,
  refSkills,
  careerKey,
  selected,
  onSelect,
  onConfirm,
}: {
  specializations: RefSpecialization[]
  refSkills: RefSkill[]
  careerKey: string
  selected: RefSpecialization | null
  onSelect: (spec: RefSpecialization) => void
  onConfirm: () => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(!selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const skillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s.name])), [refSkills])

  // Career specs first, non-career after
  const sorted = useMemo(() => {
    const career = specializations.filter(s => s.career_key === careerKey)
    const other = specializations.filter(s => s.career_key !== careerKey)
    return { career, other }
  }, [specializations, careerKey])

  const filtered = useMemo(() => {
    if (!query) return { career: sorted.career, other: sorted.other }
    const q = query.toLowerCase()
    return {
      career: sorted.career.filter(s => s.name.toLowerCase().includes(q)),
      other: sorted.other.filter(s => s.name.toLowerCase().includes(q)),
    }
  }, [sorted, query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const renderItem = (spec: RefSpecialization, isCareer: boolean) => {
    const isSelected = selected?.key === spec.key
    return (
      <button
        key={spec.key}
        onClick={() => { onSelect(spec); setQuery(''); setOpen(false) }}
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '0.5rem 0.7rem',
          background: isSelected ? 'var(--gold-glow)' : 'transparent',
          border: 'none', borderBottom: '1px solid var(--bdr-l)',
          cursor: 'pointer', transition: 'background .12s',
          opacity: isCareer ? 1 : 0.6,
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
          fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.06rem',
        }}>
          {spec.name}
          {!isCareer && (
            <span style={{ fontSize: 'var(--font-2xs)', color: 'var(--txt3)', marginLeft: '0.4rem', fontWeight: 500 }}>
              ({spec.career_key})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem', marginTop: '0.15rem' }}>
          {spec.career_skill_keys?.map(k => (
            <span key={k} style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', fontWeight: 600,
              letterSpacing: '0.04rem', color: '#d64d8a',
              background: 'rgba(214,77,138,.08)',
              border: '1px solid rgba(214,77,138,.3)',
              padding: '0.04rem 0.25rem', whiteSpace: 'nowrap',
            }}>
              {skillMap[k] || k}
            </span>
          ))}
        </div>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Dropdown combobox */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--white)', border: `1px solid ${open ? 'var(--gold)' : 'var(--bdr-l)'}`,
            padding: '0.45rem 0.7rem', cursor: 'text',
            transition: 'border-color .2s',
          }}
        >
          <input
            ref={inputRef}
            placeholder={selected ? selected.name : 'Search specializations...'}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
              letterSpacing: '0.05rem', color: 'var(--ink)',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
            color: 'var(--txt3)', cursor: 'pointer', userSelect: 'none',
          }}
            onClick={e => { e.stopPropagation(); setOpen(!open) }}
          >
            {open ? '\u25B2' : '\u25BC'}
          </span>
        </div>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 20, maxHeight: '22rem', overflowY: 'auto',
            background: 'var(--white)', border: '1px solid var(--bdr-l)',
            borderTop: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,.1)',
          }}>
            {filtered.career.length === 0 && filtered.other.length === 0 ? (
              <div style={{
                padding: '0.8rem', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)',
              }}>
                No specializations found
              </div>
            ) : (
              <>
                {filtered.career.map(s => renderItem(s, true))}
                {filtered.other.length > 0 && filtered.career.length > 0 && (
                  <div style={{
                    padding: '0.3rem 0.7rem',
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
                    fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)',
                    background: 'rgba(0,0,0,.03)', borderBottom: '1px solid var(--bdr-l)',
                  }}>
                    OTHER CAREERS
                  </div>
                )}
                {filtered.other.map(s => renderItem(s, false))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected spec card */}
      {selected && (
        <div style={{
          background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)',
          border: '2px solid var(--gold)', padding: 'var(--sp-md) var(--sp-lg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
            fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.1rem',
            marginBottom: 'var(--sp-sm)',
          }}>
            {selected.name}
          </div>

          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
            fontWeight: 700, letterSpacing: '0.1rem', color: 'var(--txt3)',
            marginBottom: '0.3rem',
          }}>
            BONUS SKILLS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: 'var(--sp-sm)' }}>
            {selected.career_skill_keys?.map(k => (
              <span key={k} style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.04rem', color: '#d64d8a',
                background: 'rgba(214,77,138,.08)',
                border: '1px solid rgba(214,77,138,.3)',
                padding: '0.08rem 0.35rem', whiteSpace: 'nowrap',
              }}>
                {skillMap[k] || k}
              </span>
            ))}
          </div>

          {selected.description && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
              fontWeight: 400, color: 'var(--txt2)', lineHeight: 1.6,
            }}
              dangerouslySetInnerHTML={{
                __html: selected.description
                  .replace(/\[H4\]([\s\S]*?)\[h4\]/g, '<strong style="display:block;margin-top:0.5rem;font-weight:700;color:var(--ink)">$1</strong>')
                  .replace(/\[B\]([\s\S]*?)\[b\]/g, '<strong>$1</strong>')
                  .replace(/\[P\]/g, '<br/><br/>')
                  .replace(/\[I\]([\s\S]*?)\[i\]/g, '<em>$1</em>')
                  .replace(/\[BR\]/gi, '<br/>')
              }}
            />
          )}

          <button
            onClick={onConfirm}
            style={{
              marginTop: 'var(--sp-md)', width: '100%',
              background: 'var(--gold)', border: 'none',
              padding: 'var(--sp-sm) var(--sp-lg)',
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
              fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
              letterSpacing: '0.15rem', transition: '.2s',
            }}
          >
            CONFIRM SPECIALIZATION
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════ */
/*  SKILLS & TALENTS STEP — free ranks + XP purchases  */
/* ═══════════════════════════════════════════════════ */

function SkillsTalentsStep({
  draft,
  setDraft,
  refSkills,
  talentMap,
  careerSkillKeys,
  xpRemaining,
  xpSpentOnSkills,
  xpSpentOnTalents,
  onContinue,
}: {
  draft: CharacterDraft
  setDraft: React.Dispatch<React.SetStateAction<CharacterDraft>>
  refSkills: RefSkill[]
  talentMap: Record<string, RefTalent>
  careerSkillKeys: Set<string>
  xpRemaining: number
  xpSpentOnSkills: number
  xpSpentOnTalents: number
  onContinue: () => void
}) {
  const careerSkills = draft.career?.career_skill_keys || []
  const specSkills = draft.specialization?.career_skill_keys || []

  // Row 0 talents from the spec's talent tree
  const row0Talents = useMemo(() => {
    const tree = draft.specialization?.talent_tree
    if (!tree?.rows?.length) return []
    const row0 = tree.rows.find(r => r.index === 0)
    if (!row0) return []
    return row0.talents.map((tKey, col) => ({
      key: tKey,
      col,
      cost: row0.cost || ROW_COSTS[0],
      talent: talentMap[tKey],
    })).filter(t => t.talent)
  }, [draft.specialization, talentMap])

  const [careerPickWarning, setCareerPickWarning] = useState(false)

  const toggleFreeCareer = (skillKey: string) => {
    setDraft(prev => {
      const picks = [...prev.freeCareerPicks]
      const idx = picks.indexOf(skillKey)
      if (idx >= 0) {
        picks.splice(idx, 1)
        return { ...prev, freeCareerPicks: picks }
      } else {
        if (picks.length >= 2) {
          setCareerPickWarning(true)
          return prev
        }
        picks.push(skillKey)
        return { ...prev, freeCareerPicks: picks }
      }
    })
  }

  const toggleFreeSpec = (skillKey: string) => {
    setDraft(prev => {
      const picks = [...prev.freeSpecPicks]
      const idx = picks.indexOf(skillKey)
      if (idx >= 0) {
        picks.splice(idx, 1)
      } else {
        if (picks.length >= 2) return prev
        picks.push(skillKey)
      }
      return { ...prev, freeSpecPicks: picks }
    })
  }

  const [skillRankWarning, setSkillRankWarning] = useState(false)

  const changeSkillRank = (skillKey: string, delta: number) => {
    setDraft(prev => {
      const current = prev.skillRanks[skillKey] || 0
      const newRank = current + delta
      if (newRank < 0) return prev

      // Max 2 purchased ranks per skill during creation
      if (newRank > 2) {
        setSkillRankWarning(true)
        return prev
      }

      const freeRanks = (prev.freeCareerPicks.includes(skillKey) ? 1 : 0) +
                         (prev.freeSpecPicks.includes(skillKey) ? 1 : 0)

      // Check XP cost for this increment
      if (delta > 0) {
        const isCareer = careerSkillKeys.has(skillKey)
        const rankBeingBought = freeRanks + current + 1
        const cost = isCareer ? rankBeingBought * 5 : (rankBeingBought * 5) + 5
        if (cost > xpRemaining) return prev
      }

      const newRanks = { ...prev.skillRanks }
      if (newRank === 0) delete newRanks[skillKey]
      else newRanks[skillKey] = newRank
      return { ...prev, skillRanks: newRanks }
    })
  }

  const toggleTalent = (tKey: string, col: number, cost: number) => {
    setDraft(prev => {
      const existing = prev.talentPicks.findIndex(t => t.key === tKey && t.col === col)
      if (existing >= 0) {
        const newPicks = [...prev.talentPicks]
        newPicks.splice(existing, 1)
        return { ...prev, talentPicks: newPicks }
      }
      // Check XP
      if (cost > xpRemaining) return prev
      return {
        ...prev,
        talentPicks: [...prev.talentPicks, {
          key: tKey,
          specKey: draft.specialization?.key || '',
          row: 0,
          col,
          cost,
        }],
      }
    })
  }

  const skillName = (key: string) => {
    const sk = refSkills.find(s => s.key === key)
    return sk?.name || key
  }

  const badgeStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', fontWeight: 600,
    letterSpacing: '0.04rem',
    color: active ? '#d64d8a' : 'var(--txt3)',
    background: active ? 'rgba(214,77,138,.12)' : 'rgba(0,0,0,.04)',
    border: `1px solid ${active ? 'rgba(214,77,138,.4)' : 'var(--bdr-l)'}`,
    padding: '0.15rem 0.45rem',
    cursor: 'pointer', transition: '.15s', whiteSpace: 'nowrap',
  })

  const sectionHeader = (text: string): React.CSSProperties => ({
    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
    fontWeight: 700, letterSpacing: '0.12rem', color: 'var(--txt3)',
    marginBottom: 'var(--sp-xs)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
      {/* XP bar */}
      <div style={{
        background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--bdr-l)', padding: 'var(--sp-sm) var(--sp-md)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--gold-d)', letterSpacing: '0.1rem' }}>
          {xpRemaining} XP REMAINING
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>
          Skills: {xpSpentOnSkills} / Talents: {xpSpentOnTalents}
        </span>
      </div>

      {/* A) Free Career Skills */}
      <HudCard title="Free Career Skill Ranks" animClass="au d1">
        <div style={sectionHeader(`${draft.freeCareerPicks.length}/2 CAREER RANKS ALLOCATED`)}>
          {draft.freeCareerPicks.length}/2 CAREER RANKS ALLOCATED
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {careerSkills.map(sk => {
            const active = draft.freeCareerPicks.includes(sk)
            return (
              <button key={sk} onClick={() => toggleFreeCareer(sk)} style={badgeStyle(active)}>
                {skillName(sk)} {active ? '✓' : ''}
              </button>
            )
          })}
        </div>
      </HudCard>

      {/* Career pick limit warning dialog */}
      {careerPickWarning && (
        <div
          onClick={() => setCareerPickWarning(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--white)', border: '2px solid var(--gold)',
              padding: 'var(--sp-lg) var(--sp-xl)',
              maxWidth: '24rem', textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,.2)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
              fontWeight: 800, color: 'var(--gold-d)', letterSpacing: '0.12rem',
              marginBottom: 'var(--sp-sm)',
            }}>
              LIMIT REACHED
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
              color: 'var(--txt2)', lineHeight: 1.6, marginBottom: 'var(--sp-md)',
            }}>
              During character creation, you may only select up to 2 free career skill ranks. Deselect an existing pick to choose a different skill.
            </div>
            <button
              onClick={() => setCareerPickWarning(false)}
              style={{
                background: 'var(--gold)', border: 'none',
                padding: 'var(--sp-sm) var(--sp-lg)',
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
                letterSpacing: '0.12rem',
              }}
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

      {/* B) Free Spec Skills */}
      <HudCard title="Free Spec Bonus Skill Ranks" animClass="au d2">
        <div style={sectionHeader(`${draft.freeSpecPicks.length}/2 SPEC RANKS ALLOCATED`)}>
          {draft.freeSpecPicks.length}/2 SPEC RANKS ALLOCATED
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {specSkills.map(sk => {
            const active = draft.freeSpecPicks.includes(sk)
            const hasCareerPick = draft.freeCareerPicks.includes(sk)
            return (
              <button key={sk} onClick={() => toggleFreeSpec(sk)} style={{
                ...badgeStyle(active),
                position: 'relative',
              }}>
                {skillName(sk)} {active ? '✓' : ''}
                {hasCareerPick && (
                  <span style={{
                    fontSize: 'var(--font-2xs)', color: 'var(--gold-d)',
                    marginLeft: '0.2rem',
                  }}>
                    (+1)
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </HudCard>

      {/* C) XP Purchases — Skills */}
      <HudCard title="XP Skill Purchases" animClass="au d3">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)', marginBottom: 'var(--sp-sm)' }}>
          Career skills cost rank × 5 XP. Non-career: (rank × 5) + 5 XP.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '18rem', overflowY: 'auto' }}>
          {refSkills.map(sk => {
            const isCareer = careerSkillKeys.has(sk.key)
            const freeRanks = (draft.freeCareerPicks.includes(sk.key) ? 1 : 0) +
                               (draft.freeSpecPicks.includes(sk.key) ? 1 : 0)
            const purchased = draft.skillRanks[sk.key] || 0
            const totalRank = freeRanks + purchased
            const nextRank = totalRank + 1
            const nextCost = isCareer ? nextRank * 5 : (nextRank * 5) + 5

            // Only show skills that have ranks or are career skills
            if (!isCareer && totalRank === 0) return null

            return (
              <div key={sk.key} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                padding: '0.2rem 0.4rem',
                background: isCareer ? 'rgba(214,77,138,.03)' : 'rgba(0,0,0,.02)',
                border: '1px solid var(--bdr-l)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
                  fontWeight: 600, color: isCareer ? 'var(--ink)' : 'var(--txt2)',
                  flex: 1, minWidth: '8rem',
                }}>
                  {sk.name}
                  {freeRanks > 0 && (
                    <span style={{ fontSize: 'var(--font-2xs)', color: '#d64d8a', marginLeft: '0.3rem' }}>
                      {freeRanks} free
                    </span>
                  )}
                </span>
                <button
                  onClick={() => changeSkillRank(sk.key, -1)}
                  disabled={purchased <= 0}
                  style={{
                    width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)',
                    background: 'none', cursor: purchased > 0 ? 'pointer' : 'default',
                    fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--txt3)',
                    opacity: purchased > 0 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  -
                </button>
                <span style={{
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
                  fontWeight: 800, color: totalRank > 0 ? 'var(--ink)' : 'var(--txt3)',
                  width: '1.2rem', textAlign: 'center',
                }}>
                  {totalRank}
                </span>
                <button
                  onClick={() => changeSkillRank(sk.key, 1)}
                  disabled={purchased >= 2 || nextCost > xpRemaining}
                  style={{
                    width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)',
                    background: 'none',
                    cursor: (purchased < 2 && nextCost <= xpRemaining) ? 'pointer' : 'default',
                    fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--gold-d)',
                    opacity: (purchased < 2 && nextCost <= xpRemaining) ? 1 : 0.3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
                  color: 'var(--txt3)', width: '3.5rem', textAlign: 'right',
                }}>
                  {purchased >= 2 ? 'MAX' : `${nextCost} XP`}
                </span>
              </div>
            )
          })}
        </div>

        {/* Skill rank limit warning dialog */}
        {skillRankWarning && (
          <div
            onClick={() => setSkillRankWarning(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--white)', border: '2px solid var(--gold)',
                padding: 'var(--sp-lg) var(--sp-xl)',
                maxWidth: '24rem', textAlign: 'center',
                boxShadow: '0 12px 40px rgba(0,0,0,.2)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
                fontWeight: 800, color: 'var(--gold-d)', letterSpacing: '0.12rem',
                marginBottom: 'var(--sp-sm)',
              }}>
                LIMIT REACHED
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
                color: 'var(--txt2)', lineHeight: 1.6, marginBottom: 'var(--sp-md)',
              }}>
                During character creation, you may only purchase up to 2 ranks per skill with XP. Additional ranks can be acquired after creation through gameplay advancement.
              </div>
              <button
                onClick={() => setSkillRankWarning(false)}
                style={{
                  background: 'var(--gold)', border: 'none',
                  padding: 'var(--sp-sm) var(--sp-lg)',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                  fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
                  letterSpacing: '0.12rem',
                }}
              >
                UNDERSTOOD
              </button>
            </div>
          </div>
        )}

        {/* Show non-career skills button */}
        <NonCareerSkillExpander
          refSkills={refSkills}
          careerSkillKeys={careerSkillKeys}
          draft={draft}
          xpRemaining={xpRemaining}
          changeSkillRank={changeSkillRank}
        />
      </HudCard>

      {/* D) XP Purchases — Talents (Row 0) */}
      {row0Talents.length > 0 && (
        <HudCard title="Starting Talents (Row 1 — 5 XP each)" animClass="au d4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {row0Talents.map(t => {
              const purchased = draft.talentPicks.some(p => p.key === t.key && p.col === t.col)
              return (
                <button
                  key={`${t.key}-${t.col}`}
                  onClick={() => toggleTalent(t.key, t.col, t.cost)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                    padding: 'var(--sp-sm) var(--sp-md)',
                    background: purchased ? 'rgba(43,93,174,.08)' : 'rgba(255,255,255,.5)',
                    border: `1px solid ${purchased ? 'rgba(43,93,174,.4)' : 'var(--bdr-l)'}`,
                    cursor: (!purchased && t.cost > xpRemaining) ? 'default' : 'pointer',
                    textAlign: 'left', transition: '.15s', width: '100%',
                    opacity: (!purchased && t.cost > xpRemaining) ? 0.4 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                      fontWeight: 700, color: purchased ? 'var(--blue)' : 'var(--ink)',
                      letterSpacing: '0.06rem',
                    }}>
                      {t.talent.name} {purchased ? '✓' : ''}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
                      color: 'var(--txt3)', marginTop: '0.1rem',
                    }}>
                      {t.talent.activation === 'taPassive' ? 'Passive' :
                       t.talent.activation === 'taAction' ? 'Action' :
                       t.talent.activation === 'taManeuver' ? 'Maneuver' : 'Incidental'}
                      {t.talent.is_ranked ? ' • Ranked' : ''}
                    </div>
                    {t.talent.description && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
                        color: 'var(--txt2)', marginTop: '0.15rem', lineHeight: 1.4,
                      }}
                        dangerouslySetInnerHTML={{
                          __html: (t.talent.description.length > 150
                            ? t.talent.description.slice(0, 150) + '...'
                            : t.talent.description)
                            .replace(/\[B\]([\s\S]*?)\[b\]/g, '<strong>$1</strong>')
                            .replace(/\[I\]([\s\S]*?)\[i\]/g, '<em>$1</em>')
                        }}
                      />
                    )}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
                    fontWeight: 700, color: 'var(--gold-d)', whiteSpace: 'nowrap',
                  }}>
                    {t.cost} XP
                  </span>
                </button>
              )
            })}
          </div>
        </HudCard>
      )}

      {/* Continue */}
      <button
        onClick={onContinue}
        style={{
          background: 'var(--gold)', border: 'none',
          padding: 'var(--sp-sm) var(--sp-lg)',
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
          fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
          letterSpacing: '0.15rem', transition: '.2s',
        }}
      >
        CONTINUE TO DETAILS
      </button>
    </div>
  )
}

/* Non-career skills expandable section */
function NonCareerSkillExpander({
  refSkills,
  careerSkillKeys,
  draft,
  xpRemaining,
  changeSkillRank,
}: {
  refSkills: RefSkill[]
  careerSkillKeys: Set<string>
  draft: CharacterDraft
  xpRemaining: number
  changeSkillRank: (key: string, delta: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const nonCareerSkills = refSkills.filter(sk => {
    if (careerSkillKeys.has(sk.key)) return false
    // Already shown above if it has ranks
    const purchased = draft.skillRanks[sk.key] || 0
    const freeRanks = (draft.freeCareerPicks.includes(sk.key) ? 1 : 0) +
                       (draft.freeSpecPicks.includes(sk.key) ? 1 : 0)
    if (purchased > 0 || freeRanks > 0) return false
    return true
  })

  if (nonCareerSkills.length === 0) return null

  return (
    <div style={{ marginTop: 'var(--sp-sm)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', border: '1px solid var(--bdr-l)',
          padding: '0.3rem 0.6rem', cursor: 'pointer',
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
          fontWeight: 600, letterSpacing: '0.1rem', color: 'var(--txt3)',
          transition: '.2s', width: '100%',
        }}
      >
        {expanded ? '▲ HIDE' : '▼ SHOW'} NON-CAREER SKILLS ({nonCareerSkills.length})
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
          {nonCareerSkills.map(sk => {
            const purchased = draft.skillRanks[sk.key] || 0
            const totalRank = purchased
            const nextRank = totalRank + 1
            const nextCost = (nextRank * 5) + 5

            return (
              <div key={sk.key} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                padding: '0.2rem 0.4rem',
                background: 'rgba(0,0,0,.02)',
                border: '1px solid var(--bdr-l)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
                  fontWeight: 600, color: 'var(--txt2)', flex: 1, minWidth: '8rem',
                }}>
                  {sk.name}
                </span>
                <button
                  onClick={() => changeSkillRank(sk.key, -1)}
                  disabled={purchased <= 0}
                  style={{
                    width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)',
                    background: 'none', cursor: purchased > 0 ? 'pointer' : 'default',
                    fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--txt3)',
                    opacity: purchased > 0 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  -
                </button>
                <span style={{
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
                  fontWeight: 800, color: totalRank > 0 ? 'var(--ink)' : 'var(--txt3)',
                  width: '1.2rem', textAlign: 'center',
                }}>
                  {totalRank}
                </span>
                <button
                  onClick={() => changeSkillRank(sk.key, 1)}
                  disabled={purchased >= 2 || nextCost > xpRemaining}
                  style={{
                    width: '1.2rem', height: '1.2rem', border: '1px solid var(--bdr-l)',
                    background: 'none',
                    cursor: (purchased < 2 && nextCost <= xpRemaining) ? 'pointer' : 'default',
                    fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--gold-d)',
                    opacity: (purchased < 2 && nextCost <= xpRemaining) ? 1 : 0.3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
                  color: 'var(--txt3)', width: '3.5rem', textAlign: 'right',
                }}>
                  {purchased >= 2 ? 'MAX' : `${nextCost} XP`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
