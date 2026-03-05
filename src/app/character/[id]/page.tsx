'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { CharacterHud, CharacterHudData } from '@/components/character/CharacterHud'
import { EquipmentItem } from '@/components/character/EquipmentCard'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import { InventoryContent } from '@/components/character/InventoryContent'
import { TalentTree, TalentTreeNode, TalentTreeConnection } from '@/components/character/TalentTree'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type {
  Character, CharacterSkill, CharacterTalent, CharacterWeapon, CharacterArmor,
  CharacterGear, CharacterCriticalInjury, CharacterSpecialization,
  RefSkill, RefTalent, RefWeapon, RefArmor, RefGear, RefCriticalInjury, RefSpecialization,
  RefItemDescriptor, RefCareer, RefSpecies,
} from '@/lib/types'

const CHAR_ABBR: Record<string, string> = {
  BR: 'Br', AG: 'Ag', INT: 'Int', CUN: 'Cun', WIL: 'Wil', PR: 'Pr',
}

const CHAR_TO_FIELD: Record<string, keyof Character> = {
  BR: 'brawn', AG: 'agility', INT: 'intellect', CUN: 'cunning', WIL: 'willpower', PR: 'presence',
}

const RANGE_LABELS: Record<string, string> = {
  wrEngaged: 'Engaged', wrShort: 'Short', wrMedium: 'Medium', wrLong: 'Long', wrExtreme: 'Extreme',
}

const ACTIVATION_LABELS: Record<string, string> = {
  taPassive: 'Passive', taAction: 'Action', taManeuver: 'Maneuver',
  taIncidental: 'Incidental', taIncidentalOOT: 'Incidental (OOT)',
}

export default function CharacterPage() {
  const params = useParams()
  const characterId = params.id as string

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
  const [playerName, setPlayerName] = useState('Player')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTalentTree, setShowTalentTree] = useState(false)
  const [activeSpecKey, setActiveSpecKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Character')
  const [gmDialog, setGmDialog] = useState<string | null>(null)
  const [lootReveal, setLootReveal] = useState<{
    name: string; key: string; itemType: 'weapon' | 'armor' | 'gear'
    rarity: number; source: string; description?: string; categories?: string[]
  } | null>(null)

  const supabase = createClient()

  const loadCharacter = useCallback(async () => {
    setLoading(true)
    try {
      const [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
        refSkRes, refTalRes, refWpnRes, refArmRes, refGearRes, refCritRes, refSpecRes, refDescRes,
        refCareerRes, refSpeciesRes] = await Promise.all([
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

  useEffect(() => {
    loadCharacter()
  }, [loadCharacter])

  // ── Realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel(`character-${characterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters', filter: `id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_critical_injuries', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_skills', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_weapons', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_armor', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_gear', filter: `character_id=eq.${characterId}` }, () => loadCharacter())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // ── GM notification listener (Broadcast) ──
  useEffect(() => {
    const channel = supabase
      .channel(`gm-notify-${characterId}`)
      .on('broadcast', { event: 'gm-action' }, ({ payload }) => {
        if (payload.type === 'toast') {
          toast(payload.message)
        } else if (payload.type === 'loot-reveal') {
          setLootReveal(payload.item)
        } else if (payload.type === 'loot-dismiss') {
          setLootReveal(null)
        } else {
          setGmDialog(payload.message)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // ── Wound/Strain handlers ──
  const handleVitalChange = async (field: 'wound_current' | 'strain_current', delta: number) => {
    if (!character) return
    const maxField = field === 'wound_current' ? 'wound_threshold' : 'strain_threshold'
    const newValue = Math.max(0, Math.min(character[field] + delta, character[maxField]))
    setCharacter({ ...character, [field]: newValue })
    await supabase.from('characters').update({ [field]: newValue }).eq('id', character.id)
  }

  // ── Skill purchase handler ──
  const handleBuySkill = async (skillKey: string, currentRank: number, isCareer: boolean) => {
    if (!character) return
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

  // ── Weapon toggle handler ──
  const handleToggleWeaponEquipped = async (id: string) => {
    const w = weapons.find(w => w.id === id)
    if (!w) return
    const newEquipped = !w.is_equipped
    setWeapons(prev => prev.map(x => x.id === id ? { ...x, is_equipped: newEquipped } : x))
    await supabase.from('character_weapons').update({ is_equipped: newEquipped }).eq('id', id)
  }

  // ── Equipment toggle handler ──
  const handleToggleEquipped = async (item: EquipmentItem) => {
    const newEquipped = !item.equipped
    if (item.type === 'armor') {
      setArmor(prev => prev.map(a => a.id === item.id ? { ...a, is_equipped: newEquipped } : a))
      await supabase.from('character_armor').update({ is_equipped: newEquipped }).eq('id', item.id)
    } else {
      setGear(prev => prev.map(g => g.id === item.id ? { ...g, is_equipped: newEquipped } : g))
      await supabase.from('character_gear').update({ is_equipped: newEquipped }).eq('id', item.id)
    }
  }

  // ── Equipment toggle by ID (for inventory view — supports weapons too) ──
  const handleToggleEquippedById = async (id: string, type: 'weapon' | 'armor' | 'gear') => {
    if (type === 'weapon') {
      const w = weapons.find(w => w.id === id)
      if (!w) return
      const newEquipped = !w.is_equipped
      setWeapons(prev => prev.map(x => x.id === id ? { ...x, is_equipped: newEquipped } : x))
      await supabase.from('character_weapons').update({ is_equipped: newEquipped }).eq('id', id)
    } else if (type === 'armor') {
      const a = armor.find(a => a.id === id)
      if (!a) return
      const newEquipped = !a.is_equipped
      setArmor(prev => prev.map(x => x.id === id ? { ...x, is_equipped: newEquipped } : x))
      await supabase.from('character_armor').update({ is_equipped: newEquipped }).eq('id', id)
    } else {
      const g = gear.find(g => g.id === id)
      if (!g) return
      const newEquipped = !g.is_equipped
      setGear(prev => prev.map(x => x.id === id ? { ...x, is_equipped: newEquipped } : x))
      await supabase.from('character_gear').update({ is_equipped: newEquipped }).eq('id', id)
    }
  }

  // ── Critical injury: roll d100 ──
  const handleRollCrit = async () => {
    if (!character) return
    const roll = Math.floor(Math.random() * 100) + 1
    const activeCrits = crits.filter(c => !c.is_healed).length
    const adjustedRoll = roll + (activeCrits * 10)
    const injury = refCrits.find(c => adjustedRoll >= c.roll_min && adjustedRoll <= c.roll_max) || refCrits[refCrits.length - 1]
    if (!injury) return

    const newCrit: CharacterCriticalInjury = {
      id: crypto.randomUUID(),
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

  // ── Heal critical injury ──
  const handleHealCrit = async (critId: string) => {
    setCrits(prev => prev.filter(c => c.id !== critId))
    await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', critId)
  }

  // ── Portrait upload handler ──
  const handlePortraitUpload = async (file: File) => {
    if (!character) return
    const ext = file.name.split('.').pop() || 'png'
    const path = `${character.id}.${ext}`

    // Upload to Supabase Storage (overwrite if exists)
    const { error: uploadErr } = await supabase.storage
      .from('portraits')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      alert('Upload failed: ' + uploadErr.message)
      return
    }

    const { data: urlData } = supabase.storage.from('portraits').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + '?t=' + Date.now() // cache-bust

    await supabase.from('characters').update({ portrait_url: publicUrl }).eq('id', character.id)
    setCharacter({ ...character, portrait_url: publicUrl })
  }

  // ── Portrait delete handler ──
  const handlePortraitDelete = async () => {
    if (!character) return
    // Try to remove the file from storage (best-effort)
    const url = character.portrait_url || ''
    const match = url.match(/portraits\/([^?]+)/)
    if (match) {
      await supabase.storage.from('portraits').remove([match[1]])
    }

    await supabase.from('characters').update({ portrait_url: null }).eq('id', character.id)
    setCharacter({ ...character, portrait_url: undefined })
  }

  // ── Talent purchase handler (spec-aware) ──
  const handlePurchaseTalent = async (talentKey: string, row: number, col: number) => {
    if (!character || !activeSpecKey) return
    const cost = (row + 1) * 5
    if (character.xp_available < cost) return

    const newXp = character.xp_available - cost
    setCharacter({ ...character, xp_available: newXp })
    setTalents(prev => [...prev, {
      id: crypto.randomUUID(), character_id: character.id, talent_key: talentKey,
      specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
    }])

    await Promise.all([
      supabase.from('character_talents').insert({
        character_id: character.id, talent_key: talentKey,
        specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
      }),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
      supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought talent: ${talentKey} (row ${row})` }),
    ])
  }

  // ── Buy new specialization ──
  const handleBuySpecialization = async (specKey: string) => {
    if (!character) return
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
      id: crypto.randomUUID(), character_id: character.id,
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

  // ── Ref data maps ──
  const refSkillMap = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])), [refSkills])
  const refTalentMap = useMemo(() => Object.fromEntries(refTalents.map(t => [t.key, t])), [refTalents])
  const refWeaponMap = useMemo(() => Object.fromEntries(refWeapons.map(w => [w.key, w])), [refWeapons])
  const refArmorMap = useMemo(() => Object.fromEntries(refArmor.map(a => [a.key, a])), [refArmor])
  const refGearMap = useMemo(() => Object.fromEntries(refGear.map(g => [g.key, g])), [refGear])
  const refSpecMap = useMemo(() => Object.fromEntries(refSpecs.map(s => [s.key, s])), [refSpecs])
  const refDescriptorMap = useMemo(() => Object.fromEntries(refDescriptors.map(d => [d.key, d])), [refDescriptors])

  // ── Build talent tree data for active spec ──
  function buildTreeForSpec(specKey: string) {
    const refSpec = refSpecMap[specKey]
    if (!refSpec?.talent_tree?.rows) return null

    const purchasedSet = new Set(
      talents
        .filter(t => t.specialization_key === specKey)
        .map(t => `${t.tree_row}-${t.tree_col}`)
    )

    const nodes: TalentTreeNode[] = []
    const connections: TalentTreeConnection[] = []

    for (const row of refSpec.talent_tree.rows) {
      const rowTalents = row.talents || []
      const rowDirs = row.directions || []

      for (let col = 0; col < rowTalents.length; col++) {
        const tKey = rowTalents[col]
        const ref = refTalentMap[tKey]
        const isPurchased = purchasedSet.has(`${row.index}-${col}`)
        const dir = rowDirs[col] || {}

        let canPurchase = false
        if (!isPurchased) {
          if (row.index === 0) {
            canPurchase = true
          } else {
            if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
            if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
            if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
            if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
          }
        }

        nodes.push({
          talentKey: tKey, name: ref?.name || tKey, description: ref?.description,
          row: row.index, col, purchased: isPurchased,
          activation: ref ? (ACTIVATION_LABELS[ref.activation] || ref.activation) : 'Passive',
          isRanked: ref?.is_ranked || false, canPurchase,
        })

        if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
        if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
      }
    }

    return { specName: refSpec.name, nodes, connections }
  }

  const talentTreeData = useMemo(() => {
    if (!activeSpecKey) return null
    return buildTreeForSpec(activeSpecKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpecKey, charSpecs, refSpecs, refSpecMap, refTalentMap, talents])

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-orbitron)', color: 'var(--gold-d)', fontSize: 'var(--font-xl)', letterSpacing: '0.3rem' }}>
        LOADING HOLOCRON...
      </div>
    )
  }

  if (error || !character) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 'var(--font-md)' }}>
        {error || 'Character not found'}
      </div>
    )
  }

  // ── Build skill displays ──
  const charSkillMap = Object.fromEntries(skills.map(s => [s.skill_key, s]))

  function buildSkillDisplay(type: string) {
    return refSkills
      .filter(rs => rs.type === type)
      .map(rs => {
        const cs = charSkillMap[rs.key]
        const rank = cs?.rank || 0
        const isCareer = cs?.is_career || false
        const charKey = rs.characteristic_key
        const charVal = character![CHAR_TO_FIELD[charKey] as keyof Character] as number || 0
        return {
          name: rs.name,
          characteristic: CHAR_ABBR[charKey] || charKey,
          characteristicValue: charVal,
          rank,
          isCareer,
          skillKey: rs.key,
          onBuy: () => handleBuySkill(rs.key, rank, isCareer),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  // ── Build weapon displays ──
  const weaponDisplays = weapons.map(w => {
    const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null
    const name = w.custom_name || ref?.name || w.weapon_key || 'Unknown'
    const skill = ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : ''
    const range = ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : ''
    const qualStr = Array.isArray(ref?.qualities) ? ref.qualities.map((q: { key: string }) => q.key).join(', ') : ''
    return {
      id: w.id,
      name,
      meta: [skill, range, qualStr].filter(Boolean).join(' / '),
      skill: skill || undefined,
      range: range || undefined,
      qualities: qualStr || undefined,
      damage: ref?.damage || 0,
      crit: ref?.crit || 0,
      icon: skill.includes('Heavy') || skill.includes('Gunnery') ? '💥' : '🔫',
      itemKey: w.weapon_key || undefined,
      categories: ref?.categories,
      equipped: w.is_equipped,
      encumbrance: ref?.encumbrance || 0,
    }
  })

  if (weaponDisplays.length === 0 && weapons.length > 0) {
    weapons.forEach(w => {
      weaponDisplays.push({ id: w.id, name: w.custom_name || 'Weapon', meta: '', skill: undefined, range: undefined, qualities: undefined, damage: 0, crit: 0, icon: '🔫', itemKey: w.weapon_key || undefined, categories: undefined, equipped: w.is_equipped, encumbrance: 0 })
    })
  }

  // ── Build talent displays ──
  const talentDisplays = talents.map(t => {
    const ref = refTalentMap[t.talent_key]
    return {
      name: ref?.name || t.talent_key,
      rank: t.ranks,
      activation: ref ? ACTIVATION_LABELS[ref.activation] || ref.activation : 'Passive',
    }
  })

  // ── Build equipment displays with encumbrance ──
  const equipmentItems: EquipmentItem[] = [
    ...armor.map(a => {
      const ref = refArmorMap[a.armor_key]
      return {
        id: a.id,
        name: a.custom_name || ref?.name || a.armor_key || 'Armor',
        subtitle: ref ? `Soak ${ref.soak} / Def ${ref.defense}` : (a.is_equipped ? 'Equipped' : 'Stowed'),
        equipped: a.is_equipped,
        encumbrance: ref?.encumbrance || 0,
        type: 'armor' as const,
        itemKey: a.armor_key || undefined,
      }
    }),
    ...gear.map(g => {
      const ref = refGearMap[g.gear_key]
      return {
        id: g.id,
        name: g.custom_name || ref?.name || g.gear_key || 'Gear',
        subtitle: g.notes || `Qty: ${g.quantity}`,
        equipped: g.is_equipped,
        encumbrance: ref?.encumbrance || 0,
        type: 'gear' as const,
        itemKey: g.gear_key || undefined,
      }
    }),
  ]

  // Calculate encumbrance — only equipped items count
  const encumbranceCurrent = equipmentItems.reduce((sum, item) => {
    if (!item.equipped) return sum
    if (item.type === 'armor') return sum + Math.max(0, item.encumbrance - 3)
    return sum + item.encumbrance
  }, 0) + weapons.reduce((sum, w) => {
    if (!w.is_equipped) return sum
    const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null
    return sum + (ref?.encumbrance || 0)
  }, 0)

  // ── Build career/spec subtitle ──
  const specNames = charSpecs.map(cs => refSpecMap[cs.specialization_key]?.name || cs.specialization_key).join(' / ')
  const careerName = refCareers.find(c => c.key === character.career_key)?.name || character.career_key
  const speciesName = refSpeciesAll.find(s => s.key === character.species_key)?.name || character.species_key
  const subtitle = [careerName, specNames, speciesName].filter(Boolean).join(' / ')

  const hudData: CharacterHudData = {
    name: character.name,
    subtitle,
    portraitUrl: character.portrait_url || undefined,
    playerName,
    brawn: character.brawn, agility: character.agility, intellect: character.intellect,
    cunning: character.cunning, willpower: character.willpower, presence: character.presence,
    woundCurrent: character.wound_current, woundThreshold: character.wound_threshold,
    strainCurrent: character.strain_current, strainThreshold: character.strain_threshold,
    soak: character.soak, defenseRanged: character.defense_ranged, defenseMelee: character.defense_melee,
    credits: character.credits, xpTotal: character.xp_total, xpAvailable: character.xp_available,
    moralityValue: character.morality_value || 50,
    moralityStrength: character.morality_strength_key || '',
    moralityWeakness: character.morality_weakness_key || '',
    obligation: character.obligation_type ? { type: character.obligation_type, value: character.obligation_value || 0 } : undefined,
    duty: character.duty_type ? { type: character.duty_type, value: character.duty_value || 0 } : undefined,
    combatSkills: buildSkillDisplay('stCombat'),
    generalSkills: buildSkillDisplay('stGeneral'),
    knowledgeSkills: buildSkillDisplay('stKnowledge'),
    equipment: equipmentItems,
    encumbranceCurrent,
    encumbranceThreshold: character.encumbrance_threshold,
    weapons: weaponDisplays,
    talents: talentDisplays,
    criticalInjuries: crits.map(c => ({
      id: c.id,
      name: c.custom_name || 'Injury',
      severity: c.severity || '',
      description: c.description,
      isHealed: c.is_healed,
    })),
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'Talents') {
      setActiveTab('Character')
      if (charSpecs.length) {
        if (!activeSpecKey) setActiveSpecKey(charSpecs[0]?.specialization_key)
        setShowTalentTree(true)
      }
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <>
      <CharacterHud
          data={hudData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onWoundChange={(delta) => handleVitalChange('wound_current', delta)}
          onStrainChange={(delta) => handleVitalChange('strain_current', delta)}
          onToggleEquipped={handleToggleEquipped}
          onToggleWeaponEquipped={handleToggleWeaponEquipped}
          onRollCrit={handleRollCrit}
          onHealCrit={handleHealCrit}
          onOpenTalentTree={charSpecs.length ? () => {
            if (!activeSpecKey) setActiveSpecKey(charSpecs[0]?.specialization_key)
            setShowTalentTree(true)
          } : undefined}
          onPortraitUpload={handlePortraitUpload}
          onPortraitDelete={handlePortraitDelete}
          contentOverride={activeTab === 'Inventory' ? (
            <InventoryContent
              weapons={weapons}
              armor={armor}
              gear={gear}
              refWeaponMap={refWeaponMap}
              refArmorMap={refArmorMap}
              refGearMap={refGearMap}
              refSkillMap={refSkillMap}
              refDescriptorMap={refDescriptorMap}
              encumbranceThreshold={character.encumbrance_threshold}
              onToggleEquipped={handleToggleEquippedById}
            />
          ) : undefined}
        />

      {/* Loot Reveal Overlay */}
      {lootReveal && (() => {
        const r = lootReveal.rarity
        const color = r <= 2 ? 'var(--txt3)' : r <= 4 ? 'var(--green)' : r <= 6 ? 'var(--blue)' : r <= 8 ? '#7B3FA0' : 'var(--gold)'
        const label = r <= 2 ? 'Common' : r <= 4 ? 'Uncommon' : r <= 6 ? 'Rare' : r <= 8 ? 'Epic' : 'Legendary'
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 250,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}>
            <div style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--sand)',
              border: `3px solid ${color}`,
              boxShadow: `0 0 40px ${color}, 0 0 80px ${color}40, 0 8px 48px rgba(0,0,0,.4)`,
              padding: '32px 28px 28px',
              textAlign: 'center',
              animation: 'glowPulse 2s ease-in-out infinite',
              position: 'relative',
            }}>
              {/* Source badge */}
              <div style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-2xs)',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color,
                marginBottom: '16px',
                textTransform: 'uppercase',
              }}>
                {lootReveal.source}
              </div>

              {/* Equipment image */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <EquipmentImage
                  itemKey={lootReveal.key}
                  itemType={lootReveal.itemType}
                  categories={lootReveal.categories}
                  size="lg"
                  style={{ width: 120, height: 120 }}
                />
              </div>

              {/* Item name */}
              <div style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-lg)',
                fontWeight: 900,
                letterSpacing: '0.1em',
                color: 'var(--ink)',
                marginBottom: '8px',
                lineHeight: 1.2,
              }}>
                {lootReveal.name}
              </div>

              {/* Rarity */}
              <div style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                color,
                marginBottom: '6px',
                letterSpacing: '0.1em',
              }}>
                Rarity {r} &mdash; {label}
              </div>

              {/* Type badge */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: lootReveal.itemType === 'weapon' ? 'var(--red)' : lootReveal.itemType === 'armor' ? 'var(--blue)' : 'var(--txt3)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '12px',
              }}>
                {lootReveal.itemType}
              </div>

              {/* Description */}
              {lootReveal.description && (
                <div
                  style={{
                    fontFamily: 'var(--font-chakra)',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--txt2)',
                    lineHeight: 1.5,
                    marginTop: '8px',
                    borderTop: '1px solid var(--bdr-l)',
                    paddingTop: '10px',
                  }}
                  dangerouslySetInnerHTML={{ __html: parseOggDudeMarkup(lootReveal.description) }}
                />
              )}
            </div>
          </div>
        )
      })()}

      {/* GM Notification Dialog */}
      {gmDialog && (
        <div
          onClick={() => setGmDialog(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--sand)',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 40px var(--gold-glow-s), 0 8px 48px rgba(0,0,0,.3)',
              padding: '32px 28px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'var(--font-2xs)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--gold-d)',
              marginBottom: '16px',
            }}>
              INCOMING TRANSMISSION
            </div>
            <div style={{
              fontFamily: 'var(--font-chakra)',
              fontSize: 'var(--font-md)',
              color: 'var(--ink)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              {gmDialog}
            </div>
            <button
              onClick={() => setGmDialog(null)}
              style={{
                background: 'var(--gold)',
                border: 'none',
                padding: '10px 40px',
                fontFamily: 'var(--font-orbitron)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'var(--white)',
                cursor: 'pointer',
                transition: '.2s',
              }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Talent Tree Modal */}
      {showTalentTree && (
        <div
          onClick={() => setShowTalentTree(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '1200px', maxHeight: '95vh',
              overflowY: 'auto',
              background: 'var(--sand)',
              border: '1px solid var(--bdr)',
              boxShadow: '0 8px 48px rgba(0,0,0,.3)',
              padding: '16px',
            }}
          >
            {/* Specialization tabs */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '12px', flexWrap: 'wrap',
            }}>
              {charSpecs.map(cs => {
                const ref = refSpecMap[cs.specialization_key]
                const isActive = activeSpecKey === cs.specialization_key
                return (
                  <button
                    key={cs.id}
                    onClick={() => setActiveSpecKey(cs.specialization_key)}
                    style={{
                      background: isActive ? 'var(--gold-glow)' : 'rgba(255,255,255,.6)',
                      border: `1px solid ${isActive ? 'var(--gold)' : 'var(--bdr-l)'}`,
                      padding: '8px 16px', cursor: 'pointer',
                      fontFamily: 'var(--font-orbitron)', fontSize: '12px',
                      fontWeight: isActive ? 700 : 600,
                      letterSpacing: '0.08em',
                      color: isActive ? 'var(--gold-d)' : 'var(--txt2)',
                      transition: '.2s',
                    }}
                  >
                    {ref?.name || cs.specialization_key}
                    {cs.is_starting && (
                      <span style={{ fontSize: '9px', color: 'var(--txt3)', marginLeft: '6px' }}>START</span>
                    )}
                  </button>
                )
              })}
              <BuySpecButton
                character={character}
                charSpecs={charSpecs}
                refSpecs={refSpecs}
                refSpecMap={refSpecMap}
                onBuy={handleBuySpecialization}
              />
            </div>

            {talentTreeData ? (
              <TalentTree
                specName={talentTreeData.specName}
                nodes={talentTreeData.nodes}
                connections={talentTreeData.connections}
                onPurchase={handlePurchaseTalent}
                xpAvailable={character.xp_available}
              />
            ) : (
              <div style={{
                textAlign: 'center', padding: '48px',
                fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--txt3)',
              }}>
                No talent tree data available for this specialization.
              </div>
            )}

            <button
              onClick={() => setShowTalentTree(false)}
              style={{
                display: 'block', margin: '16px auto 0',
                background: 'rgba(255,255,255,.8)', border: '1px solid var(--bdr)',
                padding: '10px 32px',
                fontFamily: 'var(--font-orbitron)', fontSize: '13px',
                fontWeight: 600, letterSpacing: '0.15em',
                color: 'var(--txt2)', cursor: 'pointer',
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════ */
/*  BUY SPECIALIZATION BUTTON             */
/* ═══════════════════════════════════════ */

function BuySpecButton({
  character,
  charSpecs,
  refSpecs,
  refSpecMap,
  onBuy,
}: {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecs: RefSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  onBuy: (specKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const ownedKeys = new Set(charSpecs.map(s => s.specialization_key))

  // Career specs first, then others
  const available = refSpecs
    .filter(s => !ownedKeys.has(s.key) && s.talent_tree?.rows?.length)
    .sort((a, b) => {
      const aCareer = a.career_key === character.career_key ? 0 : 1
      const bCareer = b.career_key === character.career_key ? 0 : 1
      if (aCareer !== bCareer) return aCareer - bCareer
      return a.name.localeCompare(b.name)
    })

  const filtered = search
    ? available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : available

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(200,162,78,.08)', border: '1px dashed var(--gold)',
          padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'var(--font-orbitron)', fontSize: '11px',
          fontWeight: 700, letterSpacing: '0.1em',
          color: 'var(--gold-d)', transition: '.2s',
        }}
      >
        + NEW SPEC
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--sand)', border: '1px solid var(--bdr)',
          boxShadow: '0 8px 48px rgba(0,0,0,.3)',
          padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontSize: '14px',
          fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)',
          marginBottom: '12px',
        }}>
          BUY NEW SPECIALIZATION
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--txt2)', marginBottom: '12px', lineHeight: 1.5,
        }}>
          Career specs cost {charSpecs.length * 10} XP. Non-career specs cost {(charSpecs.length + 1) * 10} XP.
          You have <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{character.xp_available} XP</span>.
        </div>
        <input
          type="text"
          placeholder="Search specializations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', marginBottom: '12px',
            border: '1px solid var(--bdr-l)', background: 'var(--white)',
            fontFamily: 'var(--font-mono)', fontSize: '13px',
          }}
          autoFocus
        />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(spec => {
            const isCareer = spec.career_key === character.career_key
            const cost = isCareer ? charSpecs.length * 10 : (charSpecs.length + 1) * 10
            const canAfford = character.xp_available >= cost
            return (
              <button
                key={spec.key}
                onClick={() => { onBuy(spec.key); setOpen(false) }}
                disabled={!canAfford}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: '4px',
                  background: canAfford ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)',
                  border: `1px solid ${isCareer ? 'var(--gold-l)' : 'var(--bdr-l)'}`,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5,
                  transition: '.2s',
                }}
              >
                <div>
                  <div style={{
                    fontFamily: 'var(--font-orbitron)', fontSize: '12px',
                    fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.05em',
                  }}>
                    {spec.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    color: isCareer ? 'var(--gold-d)' : 'var(--txt3)', marginTop: '2px',
                  }}>
                    {isCareer ? 'CAREER' : spec.career_key}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-orbitron)', fontSize: '13px',
                  fontWeight: 700, color: canAfford ? 'var(--ink)' : 'var(--red)',
                }}>
                  {cost} XP
                </div>
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            marginTop: '12px', padding: '8px',
            background: 'rgba(255,255,255,.5)', border: '1px solid var(--bdr)',
            fontFamily: 'var(--font-orbitron)', fontSize: '12px',
            fontWeight: 600, letterSpacing: '0.1em',
            color: 'var(--txt2)', cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}
