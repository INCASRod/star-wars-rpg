'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { randomUUID } from '@/lib/utils'
import { logPurchaseNotification } from '@/lib/logRoll'
import { fetchActiveDataset } from '@/lib/activeDataset'
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

  const supabase = createClient()

  const loadCharacter = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const ds = await fetchActiveDataset(supabase)
      const [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
        refSkRes, refTalRes, refTalCustomRes, refWpnRes, refArmRes, refGearRes, refCritRes, refSpecRes, refDescRes,
        refCareerRes, refSpeciesRes, forceAbilRes, refFpRes, refFaRes, refWqRes, refAttRes,
        refOblTypesRes, refDutyTypesRes] = await Promise.all([
        supabase.from('characters').select('*').eq('id', characterId).single(),
        supabase.from('character_skills').select('*').eq('character_id', characterId),
        supabase.from('character_talents').select('*').eq('character_id', characterId),
        supabase.from('character_weapons').select('*').eq('character_id', characterId).eq('is_dropped', false),
        supabase.from('character_armor').select('*').eq('character_id', characterId).eq('is_dropped', false),
        supabase.from('character_gear').select('*').eq('character_id', characterId).eq('is_dropped', false),
        supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
        supabase.from('character_specializations').select('*').eq('character_id', characterId),
        supabase.from('ref_skills').select('*'),
        supabase.from('ref_talents').select('*').eq('dataset_source', ds).eq('is_retired', false),
        supabase.from('ref_talents').select('*').eq('is_custom', true),
        supabase.from('ref_weapons').select('*'),
        supabase.from('ref_armor').select('*'),
        supabase.from('ref_gear').select('*'),
        supabase.from('ref_critical_injuries').select('*').order('roll_min'),
        supabase.from('ref_specializations').select('*').eq('dataset_source', ds).eq('is_retired', false),
        supabase.from('ref_item_descriptors').select('*'),
        supabase.from('ref_careers').select('*').eq('dataset_source', ds).eq('is_retired', false),
        supabase.from('ref_species').select('*'),
        supabase.from('character_force_abilities').select('*').eq('character_id', characterId),
        supabase.from('ref_force_powers').select('*'),
        supabase.from('ref_force_abilities').select('*').eq('dataset_source', ds).eq('is_retired', false),
        supabase.from('ref_weapon_qualities').select('*'),
        supabase.from('ref_item_attachments').select('*'),
        supabase.from('ref_obligation_types').select('key, name'),
        supabase.from('ref_duty_types').select('key, name'),
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
      const stdTalents  = (refTalRes.data as RefTalent[]) || []
      const custTalents = (refTalCustomRes.data as RefTalent[]) || []
      const stdKeys     = new Set(stdTalents.map(t => t.key))
      setRefTalents([...stdTalents, ...custTalents.filter(t => !stdKeys.has(t.key))])
      setRefWeapons((refWpnRes.data as RefWeapon[]) || [])
      setRefArmor((refArmRes.data as RefArmor[]) || [])
      setRefGear((refGearRes.data as RefGear[]) || [])
      setRefCrits((refCritRes.data as RefCriticalInjury[]) || [])

      // Supplement active-dataset specs with any cross-dataset specs the character
      // actually owns (e.g. oggdude specs on a respec campaign).
      let mergedRefSpecs = (refSpecRes.data as RefSpecialization[]) || []
      const loadedSpecKeys = new Set(mergedRefSpecs.map(s => s.key))
      const charSpecKeys = ((specsRes.data as CharacterSpecialization[]) || []).map(cs => cs.specialization_key)
      const missingSpecKeys = charSpecKeys.filter(k => !loadedSpecKeys.has(k))
      if (missingSpecKeys.length > 0) {
        const { data: fallbackSpecs } = await supabase
          .from('ref_specializations')
          .select('*')
          .in('key', missingSpecKeys)
          .eq('is_retired', false)
        if (fallbackSpecs) mergedRefSpecs = [...mergedRefSpecs, ...(fallbackSpecs as RefSpecialization[])]
      }
      setRefSpecs(mergedRefSpecs)
      setRefDescriptors((refDescRes.data as RefItemDescriptor[]) || [])
      setRefCareers((refCareerRes.data as RefCareer[]) || [])
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

  // ── Derive force rating from career, FORCERAT talents, and Force-sensitive specs ──
  const forceRating = useMemo(() => {
    const careerBase  = refCareers.find(c => c.key === character?.career_key)?.force_rating ?? 0
    const talentBonus = talents.filter(t => t.talent_key === 'FORCERAT').reduce((sum, t) => sum + (t.ranks || 1), 0)
    // Any Force-sensitive specialisation (e.g. FORCESENSITIVEEMERGENT) grants FR 1 at minimum
    const hasForceSpec = charSpecs.some(cs => refSpecMap[cs.specialization_key]?.is_force_sensitive)
    const base = careerBase + talentBonus
    return hasForceSpec ? Math.max(base, 1) : base
  }, [talents, refCareers, character?.career_key, charSpecs, refSpecMap])

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
    const newId = randomUUID()
    setCharacter({ ...character, xp_available: newXp, ...statUpdates })
    setTalents(prev => [...prev, {
      id: newId, character_id: character.id, talent_key: talentKey,
      specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
    }])

    await Promise.all([
      supabase.from('character_talents').insert({
        id: newId,
        character_id: character.id, talent_key: talentKey,
        specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
      }),
      supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought talent: ${talentKey} (row ${row})` }),
    ])

    const existingRankCount = talents.filter(t => t.talent_key === talentKey).length
    const talentRank        = existingRankCount + 1
    const talentName        = refTalentMap[talentKey]?.name ?? talentKey
    const label             = talentRank > 1 ? `${talentName} (Rank ${talentRank})` : talentName

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
    const current = (character[charKey as keyof typeof character] as number) ?? 2
    const newVal = Math.min(current + 1, 6)
    setCharacter({ ...character, [charKey]: newVal })
    setTalents(prev => prev.map(t => t.id === talentId ? { ...t, dedication_characteristic: charKey as CharacterTalent['dedication_characteristic'] } : t))
    await Promise.all([
      supabase.from('character_talents').update({ dedication_characteristic: charKey }).eq('id', talentId),
      supabase.from('characters').update({ [charKey]: newVal }).eq('id', character.id),
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

    const newId = randomUUID()
    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp })
    setCharForceAbilities(prev => [...prev, {
      id: newId, character_id: character.id,
      force_power_key: activeForcePowerKey, force_ability_key: abilityKey,
      tree_row: row, tree_col: col, xp_cost: cost,
    }])

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

    const existingCount = charForceAbilities.filter(
      a => a.force_ability_key === abilityKey && a.force_power_key === activeForcePowerKey
    ).length
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

  // ── HUD transforms ──────────────────────────────────────────────────────────

  const speciesAbilities = useMemo((): SpeciesAbility[] => {
    const sp = refSpeciesAll.find(s => s.key === character?.species_key)
    return (sp?.special_abilities ?? []) as SpeciesAbility[]
  }, [refSpeciesAll, character?.species_key])

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

  const encumbranceBonus = useMemo(() =>
    gear.reduce((s, g) => {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      const ref = refGearMap[g.gear_key]
      return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
    }, 0)
  , [gear, refGearMap])

  // ── End HUD transforms ───────────────────────────────────────────────────────

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
  }

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
    handleCreditSpend,
    handleBackstoryChange,
    handleNotesChange,
    handlePurchaseForceAbility,
    handleBuySpecialization,
  }
}
