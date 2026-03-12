'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { randomUUID } from '@/lib/utils'
import type {
  Character, CharacterSkill, CharacterTalent, CharacterWeapon, CharacterArmor,
  CharacterGear, CharacterCriticalInjury, CharacterSpecialization,
  RefSkill, RefTalent, RefWeapon, RefArmor, RefGear, RefCriticalInjury, RefSpecialization,
  RefItemDescriptor, RefCareer, RefSpecies,
  RefForcePower, RefForceAbility, CharacterForceAbility,
} from '@/lib/types'

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
  const [playerName, setPlayerName] = useState('Player')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadCharacter = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
        refSkRes, refTalRes, refWpnRes, refArmRes, refGearRes, refCritRes, refSpecRes, refDescRes,
        refCareerRes, refSpeciesRes, forceAbilRes, refFpRes, refFaRes] = await Promise.all([
        supabase.from('characters').select('*').eq('id', characterId).single(),
        supabase.from('character_skills').select('*').eq('character_id', characterId),
        supabase.from('character_talents').select('*').eq('character_id', characterId),
        supabase.from('character_weapons').select('*').eq('character_id', characterId),
        supabase.from('character_armor').select('*').eq('character_id', characterId),
        supabase.from('character_gear').select('*').eq('character_id', characterId),
        supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
        supabase.from('character_specializations').select('*').eq('character_id', characterId),
        supabase.from('ref_skills').select('*'),
        supabase.from('ref_talents').select('*'),
        supabase.from('ref_weapons').select('*'),
        supabase.from('ref_armor').select('*'),
        supabase.from('ref_gear').select('*'),
        supabase.from('ref_critical_injuries').select('*').order('roll_min'),
        supabase.from('ref_specializations').select('*'),
        supabase.from('ref_item_descriptors').select('*'),
        supabase.from('ref_careers').select('*'),
        supabase.from('ref_species').select('*'),
        supabase.from('character_force_abilities').select('*').eq('character_id', characterId),
        supabase.from('ref_force_powers').select('*'),
        supabase.from('ref_force_abilities').select('*'),
      ])

      if (charRes.error) throw new Error(charRes.error.message)

      setCharacter(charRes.data as Character)
      setSkills((skillsRes.data as CharacterSkill[]) || [])
      setTalents((talentsRes.data as CharacterTalent[]) || [])
      setWeapons((weaponsRes.data as CharacterWeapon[]) || [])
      setArmor((armorRes.data as CharacterArmor[]) || [])
      setGear((gearRes.data as CharacterGear[]) || [])
      setCrits((critsRes.data as CharacterCriticalInjury[]) || [])
      setCharSpecs((specsRes.data as CharacterSpecialization[]) || [])
      setRefSkills((refSkRes.data as RefSkill[]) || [])
      setRefTalents((refTalRes.data as RefTalent[]) || [])
      setRefWeapons((refWpnRes.data as RefWeapon[]) || [])
      setRefArmor((refArmRes.data as RefArmor[]) || [])
      setRefGear((refGearRes.data as RefGear[]) || [])
      setRefCrits((refCritRes.data as RefCriticalInjury[]) || [])
      setRefSpecs((refSpecRes.data as RefSpecialization[]) || [])
      setRefDescriptors((refDescRes.data as RefItemDescriptor[]) || [])
      setRefCareers((refCareerRes.data as RefCareer[]) || [])
      setRefSpeciesAll((refSpeciesRes.data as RefSpecies[]) || [])
      setCharForceAbilities((forceAbilRes.data as CharacterForceAbility[]) || [])
      setRefForcePowers((refFpRes.data as RefForcePower[]) || [])
      setRefForceAbilities((refFaRes.data as RefForceAbility[]) || [])

      if (charRes.data?.player_id) {
        const { data: p } = await supabase.from('players').select('display_name').eq('id', charRes.data.player_id).single()
        if (p) setPlayerName(p.display_name)
      }
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

  // ── Derive force rating from FORCERAT talents ──
  const forceRating = useMemo(() => {
    const careerBase = refCareers.find(c => c.key === character?.career_key)?.force_rating ?? 0
    const talentBonus = talents.filter(t => t.talent_key === 'FORCERAT').reduce((sum, t) => sum + (t.ranks || 1), 0)
    return careerBase + talentBonus
  }, [talents, refCareers, character?.career_key])

  // ── Apply talent stat modifiers to character (positive or negative delta) ──
  const applyTalentModifiers = (talentKey: string, direction: 1 | -1) => {
    const ref = refTalentMap[talentKey]
    if (!ref?.modifiers || !character) return {}
    const mods = ref.modifiers
    const updates: Record<string, number> = {}
    if (mods.wound_threshold) updates.wound_threshold = character.wound_threshold + mods.wound_threshold * direction
    if (mods.strain_threshold) updates.strain_threshold = character.strain_threshold + mods.strain_threshold * direction
    if (mods.soak) updates.soak = character.soak + mods.soak * direction
    if (mods.defense_ranged) updates.defense_ranged = character.defense_ranged + mods.defense_ranged * direction
    if (mods.defense_melee) updates.defense_melee = character.defense_melee + mods.defense_melee * direction
    return updates
  }

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

  const handleRemoveWeapon = async (id: string) => {
    markSelf()
    setWeapons(prev => prev.filter(w => w.id !== id))
    await supabase.from('character_weapons').delete().eq('id', id)
  }

  const handleRemoveEquipment = async (id: string, type: 'armor' | 'gear') => {
    markSelf()
    if (type === 'armor') {
      setArmor(prev => prev.filter(a => a.id !== id))
      await supabase.from('character_armor').delete().eq('id', id)
    } else {
      setGear(prev => prev.filter(g => g.id !== id))
      await supabase.from('character_gear').delete().eq('id', id)
    }
  }

  const handleRemoveTalent = async (talentId: string, xpCost: number) => {
    if (!character) return
    markSelf()
    const ct = talents.find(t => t.talent_key === talentId)
    if (!ct) return
    const statUpdates = applyTalentModifiers(talentId, -1)
    const newXp = character.xp_available + xpCost
    setCharacter({ ...character, xp_available: newXp, ...statUpdates })
    setTalents(prev => prev.filter(t => t.id !== ct.id))
    await Promise.all([
      supabase.from('character_talents').delete().eq('id', ct.id),
      supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: xpCost, reason: `GM refund: removed talent ${talentId}` }),
    ])
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
    const cost = (row + 1) * 5
    if (character.xp_available < cost) return

    const statUpdates = applyTalentModifiers(talentKey, 1)
    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp, ...statUpdates })
    setTalents(prev => [...prev, {
      id: randomUUID(), character_id: character.id, talent_key: talentKey,
      specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
    }])

    await Promise.all([
      supabase.from('character_talents').insert({
        character_id: character.id, talent_key: talentKey,
        specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
      }),
      supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought talent: ${talentKey} (row ${row})` }),
    ])
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
    markSelf()

    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp })
    setCharForceAbilities(prev => [...prev, {
      id: randomUUID(), character_id: character.id,
      force_power_key: activeForcePowerKey, force_ability_key: abilityKey,
      tree_row: row, tree_col: col, xp_cost: cost,
    }])

    await Promise.all([
      supabase.from('character_force_abilities').insert({
        character_id: character.id, force_power_key: activeForcePowerKey,
        force_ability_key: abilityKey, tree_row: row, tree_col: col, xp_cost: cost,
      }),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought force ability: ${abilityKey}` }),
    ])
  }

  const handleBuySpecialization = async (specKey: string, setActiveSpecKey: (key: string) => void) => {
    if (!character) return
    markSelf()
    const isCareer = refSpecs.find(s => s.key === specKey)?.career_key === character.career_key
    const existingCount = charSpecs.length
    const cost = isCareer ? existingCount * 10 : (existingCount + 1) * 10
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
    toast.success(`Purchased ${refSpecMap[specKey]?.name || specKey}!`)
  }

  return {
    // State
    character, skills, talents, weapons, armor, gear, crits, charSpecs,
    charForceAbilities, playerName, loading, error,
    // Ref data
    refSkills, refTalents, refWeapons, refArmor, refGear, refCrits, refSpecs,
    refDescriptors, refCareers, refSpeciesAll, refForcePowers, refForceAbilities,
    // Ref maps
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap,
    refSpecMap, refDescriptorMap, refForcePowerMap, refForceAbilityMap,
    // Derived
    forceRating,
    // Supabase client (for broadcast listener in page)
    supabase,
    // Mutations
    handleVitalChange,
    handleBuySkill,
    handleToggleWeaponEquipped,
    handleToggleEquippedById,
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
    handleBackstoryChange,
    handleNotesChange,
    handlePurchaseForceAbility,
    handleBuySpecialization,
  }
}
