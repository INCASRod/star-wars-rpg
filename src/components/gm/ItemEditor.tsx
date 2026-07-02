'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  RefItemAttachment,
  InstalledAttachment,
  AttachmentModEntry,
  RefWeaponQuality,
  WeaponQuality,
} from '@/lib/types'
import { QualityBadge } from '@/components/character/QualityBadge'
import { RichText } from '@/components/ui/RichText'
import { HUD, FONT_BODY, EASE, RADIUS, Z } from '@/lib/tokens'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = HUD.text
const DIM       = HUD.textFaint
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const ORANGE    = 'var(--state-threat)'
const RED       = 'var(--state-failure)'
const BLUE      = 'var(--die-force)'
const GREEN     = 'var(--state-success)'
const FONT_C    = FONT_BODY
const FONT_M    = FONT_BODY
const FONT_CINZEL = FONT_BODY
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'

export type ItemType = 'weapon' | 'armor' | 'gear'

export interface EditableItem {
  key: string
  name: string
  type: ItemType
  is_custom: boolean
  custom_notes?: string
  campaign_id?: string | null
  // common
  price?: number
  rarity?: number
  encumbrance?: number
  description?: string
  // weapon
  skill_key?: string
  damage?: number
  damage_add?: number | null
  crit?: number
  range_value?: string
  hard_points?: number
  qualities?: WeaponQuality[]
  // armor
  defense?: number
  soak?: number
  soak_bonus?: number
  // gear
  encumbrance_bonus?: number | null
}

// Template search result — superset of EditableItem fields we care about
interface TemplateResult extends EditableItem {}

interface ItemEditorProps {
  item?: EditableItem
  defaultType?: ItemType
  campaignId: string
  supabase: SupabaseClient
  onClose: () => void
  onSaved: (item: EditableItem & { isNew: boolean }) => void
}

// ── Mod key → human-readable label ───────────────────────────────────────────
function modLabel(entry: AttachmentModEntry): string | null {
  if (!entry.key && entry.misc_desc) return entry.misc_desc
  const n = entry.count
  const abs = n !== null ? Math.abs(n) : null
  const sign = n !== null ? (n >= 0 ? '+' : '−') : '+'
  switch (entry.key) {
    case 'DAMADD':      return `Damage ${sign}${abs ?? 1}`
    case 'DAMSUB':      return `Damage −${abs ?? 1}`
    case 'DAMSET':      return `Set Damage to ${n ?? '?'}`
    case 'CRITADD':     return `Crit +${abs ?? 1}`
    case 'CRITSUB':     return `Crit −${abs ?? 1}`
    case 'CRITSET':     return `Set Crit to ${n ?? '?'}`
    case 'ACCURATE':    return `Accurate ${sign}${abs ?? 1}`
    case 'INACCURATE':  return `Inaccurate +${abs ?? 1}`
    case 'PIERCE':      return `Pierce +${abs ?? 1}`
    case 'VICIOUS':     return `Vicious +${abs ?? 1}`
    case 'BLAST':       return `Blast +${abs ?? 1}`
    case 'BURN':        return `Burn +${abs ?? 1}`
    case 'BREACH':      return `Breach +${abs ?? 1}`
    case 'DEFENSIVE':   return `Defensive +${abs ?? 1}`
    case 'DEFLECTION':  return `Deflection +${abs ?? 1}`
    case 'DISORIENT':   return `Disorient +${abs ?? 1}`
    case 'ENSNARE':     return `Ensnare +${abs ?? 1}`
    case 'KNOCKDOWN':   return 'Adds Knockdown'
    case 'STUN':        return `Stun +${abs ?? 1}`
    case 'STUNSETTING': return 'Adds Stun Setting'
    case 'STUNDAMAGE':  return 'Adds Stun Damage'
    case 'SUNDER':      return 'Adds Sunder'
    case 'SOAKADD':     return `Soak +${abs ?? 1}`
    case 'SOAKSET':     return `Set Soak to ${n ?? '?'}`
    case 'DEFADD':      return `Defense +${abs ?? 1}`
    case 'DEFSET':      return `Set Defense to ${n ?? '?'}`
    case 'STRAINADD':   return `Strain Threshold +${abs ?? 1}`
    case 'WOUNDADD':    return `Wound Threshold +${abs ?? 1}`
    case 'ENCSUB':      return `Encumbrance −${abs ?? 1}`
    case 'ENCADD':      return `Encumbrance +${abs ?? 1}`
    case 'CUMBERSOME':  return n !== null && n < 0 ? `Cumbersome −${abs}` : `Adds Cumbersome ${n ?? ''}`
    case 'RANGESUB':    return 'Reduce Range by 1'
    case 'RANGEADD':    return 'Increase Range by 1'
    case 'LIMITEDAMMO': return `Limited Ammo +${abs ?? 1}`
    default:
      if (entry.misc_desc) return entry.misc_desc
      if (entry.key) return entry.key + (n !== null ? ` ${sign}${abs}` : '')
      return null
  }
}

function isModArray(v: unknown): v is AttachmentModEntry[] {
  return Array.isArray(v)
}

const SKILL_OPTIONS = [
  { key: 'BRAWL',   label: 'Brawl (BR)' },
  { key: 'MELEE',   label: 'Melee (BR)' },
  { key: 'LTSABER', label: 'Lightsaber (BR)' },
  { key: 'RANLT',   label: 'Ranged: Light (AG)' },
  { key: 'RANHVY',  label: 'Ranged: Heavy (AG)' },
  { key: 'GUNNERY', label: 'Gunnery (AG)' },
]

const RANGE_OPTIONS = ['Engaged', 'Short', 'Medium', 'Long', 'Extreme']

const SKILL_SHORT: Record<string, string> = {
  BRAWL: 'Brawl', MELEE: 'Melee', LTSABER: 'Lightsaber',
  RANLT: 'Ranged (L)', RANHVY: 'Ranged (H)', GUNNERY: 'Gunnery',
  RANGLT: 'Ranged (L)', RANGHVY: 'Ranged (H)',
}

const TYPE_COLOR: Record<ItemType, string> = { weapon: RED, armor: BLUE, gear: GOLD_DIM }
const TYPE_BORDER: Record<ItemType, string> = {
  weapon: 'rgba(224,80,80,0.25)',
  armor:  'rgba(90,170,224,0.25)',
  gear:   'rgba(200,170,80,0.25)',
}

function templateStatLine(t: TemplateResult): string {
  if (t.type === 'weapon') {
    const skill = SKILL_SHORT[t.skill_key ?? ''] ?? t.skill_key ?? '—'
    const dmg   = t.damage_add != null ? `Brawn+${t.damage_add}` : `${t.damage ?? 0} dmg`
    return `${skill} · ${dmg} · Crit ${t.crit ?? '—'}`
  }
  if (t.type === 'armor') return `Soak+${t.soak ?? 0} · Def ${t.defense ?? 0} · ENC ${t.encumbrance ?? 0}${t.encumbrance_bonus ? ` (+${t.encumbrance_bonus} thresh)` : ''}`
  return `ENC ${t.encumbrance ?? '—'}${t.encumbrance_bonus ? ` (+${t.encumbrance_bonus} thresh)` : ''}`
}

// ── HP progress bar ───────────────────────────────────────────────────────────
function HpBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(used / total, 1) : 0
  const over = used > total
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        flex: 1, height: '0.375rem', borderRadius: RADIUS.sm,
        background: 'rgba(200,170,80,0.1)', border: `1px solid ${BORDER}`,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: over ? RED : HUD.gold,
          borderRadius: RADIUS.sm,
          transition: `width ${EASE.quick}`,
        }} />
      </div>
      <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: over ? RED : TEXT, minWidth: '2.5rem', textAlign: 'right' }}>
        {used} / {total}
      </span>
    </div>
  )
}

export function ItemEditor({ item, defaultType = 'weapon', campaignId, supabase, onClose, onSaved }: ItemEditorProps) {
  const isEdit    = !!item
  const isOggDude = isEdit && !item.is_custom
  const isNew     = !isEdit

  // ── Form state ──
  const [type,        setType]        = useState<ItemType>(item?.type ?? defaultType)
  const [name,        setName]        = useState(item?.name ?? '')
  const [price,       setPrice]       = useState(String(item?.price ?? 0))
  const [rarity,      setRarity]      = useState(String(item?.rarity ?? 0))
  const [encumbrance, setEncumbrance] = useState(String(item?.encumbrance ?? 1))
  const [description, setDescription] = useState(item?.description ?? '')
  const [descPreview, setDescPreview] = useState(false)
  const [customNotes, setCustomNotes] = useState(item?.custom_notes ?? '')
  // weapon
  const [skillKey,    setSkillKey]    = useState(item?.skill_key ?? 'MELEE')
  const [damage,      setDamage]      = useState(String(item?.damage ?? 0))
  const [damageAdd,   setDamageAdd]   = useState(String(item?.damage_add ?? ''))
  const [crit,        setCrit]        = useState(String(item?.crit ?? 3))
  const [rangeValue,  setRangeValue]  = useState(item?.range_value?.replace(/^wr/i, '') ?? 'Engaged')
  const [hardPoints,  setHardPoints]  = useState(String(item?.hard_points ?? 0))
  // armor
  const [defense,     setDefense]     = useState(String(item?.defense ?? 0))
  const [soak,        setSoak]        = useState(String(item?.soak ?? 0))
  // gear
  const [encBonus,    setEncBonus]    = useState(String(item?.encumbrance_bonus ?? ''))

  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  // ── Qualities state ──
  const [qualities,       setQualities]       = useState<WeaponQuality[]>(item?.qualities ?? [])
  const [allQualities,    setAllQualities]    = useState<RefWeaponQuality[]>([])
  const [qualSearch,      setQualSearch]      = useState('')
  const [qualOpen,        setQualOpen]        = useState(false)
  const qualContainerRef  = useRef<HTMLDivElement>(null)

  // ── Attachments state ──
  const [attachments,     setAttachments]     = useState<InstalledAttachment[]>([])
  const [allAttachments,  setAllAttachments]  = useState<RefItemAttachment[]>([])
  const [attSearch,       setAttSearch]       = useState('')
  const [attOpen,         setAttOpen]         = useState(false)
  const [expandedAtt,     setExpandedAtt]     = useState<string | null>(null)
  const [confirmRemoveAtt,setConfirmRemoveAtt]= useState<string | null>(null)
  const attContainerRef   = useRef<HTMLDivElement>(null)

  // ── Template search state (new items only) ──
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<TemplateResult[]>([])
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchBusy,    setSearchBusy]    = useState(false)
  const [template,      setTemplate]      = useState<TemplateResult | null>(null)
  const [typeMismatch,  setTypeMismatch]  = useState<ItemType | null>(null)
  const [clearConfirm,  setClearConfirm]  = useState(false)

  const nameInputRef       = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load ref data ──
  useEffect(() => {
    supabase.from('ref_weapon_qualities').select('key,name,description,is_ranked,stat_modifier')
      .order('name').then(({ data }) => { if (data) setAllQualities(data as RefWeaponQuality[]) })
  }, [supabase])

  useEffect(() => {
    if (type === 'gear') return
    const attType = type === 'weapon' ? 'Weapon' : 'Armor'
    supabase.from('ref_item_attachments')
      .select('key,name,description,type,hp_required,price,rarity,category_limits,base_mods,added_mods,source')
      .eq('type', attType)
      .order('name')
      .then(({ data }) => { if (data) setAllAttachments(data as RefItemAttachment[]) })
  }, [supabase, type])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (qualContainerRef.current && !qualContainerRef.current.contains(e.target as Node)) setQualOpen(false)
      if (attContainerRef.current && !attContainerRef.current.contains(e.target as Node)) setAttOpen(false)
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Template search ──
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return }
    setSearchBusy(true)
    const pattern = `%${q.trim()}%`
    const [wRes, aRes, gRes] = await Promise.all([
      supabase.from('ref_weapons').select('key,name,skill_key,damage,damage_add,crit,range_value,hard_points,price,rarity,encumbrance,description,is_custom,qualities').ilike('name', pattern).limit(10),
      supabase.from('ref_armor').select('key,name,defense,soak,soak_bonus,price,rarity,encumbrance,encumbrance_bonus,description,is_custom').ilike('name', pattern).limit(10),
      supabase.from('ref_gear').select('key,name,encumbrance_bonus,price,rarity,encumbrance,description,is_custom').ilike('name', pattern).limit(10),
    ])
    const weapons = ((wRes.data || []) as TemplateResult[]).map(r => ({ ...r, type: 'weapon' as ItemType }))
    const armors  = ((aRes.data || []) as TemplateResult[]).map(r => ({ ...r, type: 'armor' as ItemType }))
    const gears   = ((gRes.data || []) as TemplateResult[]).map(r => ({ ...r, type: 'gear' as ItemType }))
    const ordered: TemplateResult[] =
      defaultType === 'weapon' ? [...weapons, ...armors, ...gears]
      : defaultType === 'armor' ? [...armors, ...weapons, ...gears]
      : [...gears, ...weapons, ...armors]
    setSearchResults(ordered)
    setSearchOpen(ordered.length > 0)
    setSearchBusy(false)
  }, [supabase, defaultType])

  useEffect(() => {
    if (!isNew || template) return
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!searchQuery.trim()) { setSearchResults([]); setSearchOpen(false); return }
    searchDebounceRef.current = setTimeout(() => doSearch(searchQuery), 300)
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current) }
  }, [searchQuery, template, isNew, doSearch])

  const applyTemplateFields = (t: TemplateResult, targetType: ItemType) => {
    setName(t.name)
    setPrice(String(t.price ?? 0))
    setRarity(String(t.rarity ?? 0))
    setEncumbrance(String(t.encumbrance ?? 1))
    setDescription(t.description ?? '')
    setCustomNotes('')
    if (targetType === 'weapon') {
      setSkillKey(t.skill_key ?? 'MELEE')
      setDamage(String(t.damage ?? 0))
      setDamageAdd(t.damage_add != null ? String(t.damage_add) : '')
      setCrit(String(t.crit ?? 3))
      setRangeValue((t.range_value ?? 'wrEngaged').replace(/^wr/i, ''))
      setHardPoints(String(t.hard_points ?? 0))
      setQualities(Array.isArray(t.qualities) ? t.qualities : [])
    }
    if (targetType === 'armor') {
      setDefense(String(t.defense ?? 0))
      setSoak(String(t.soak ?? t.soak_bonus ?? 0))
      setEncBonus(t.encumbrance_bonus != null ? String(t.encumbrance_bonus) : '')
    }
    if (targetType === 'gear') {
      setEncBonus(t.encumbrance_bonus != null ? String(t.encumbrance_bonus) : '')
    }
  }

  const selectTemplate = (t: TemplateResult) => {
    setTemplate(t)
    setSearchQuery(t.name)
    setSearchOpen(false)
    setTypeMismatch(null)
    setClearConfirm(false)
    if (t.type !== type) {
      setName(t.name)
      setPrice(String(t.price ?? 0))
      setRarity(String(t.rarity ?? 0))
      setEncumbrance(String(t.encumbrance ?? 1))
      setDescription(t.description ?? '')
      setCustomNotes('')
      setTypeMismatch(t.type)
    } else {
      applyTemplateFields(t, type)
      setTimeout(() => nameInputRef.current?.focus(), 50)
    }
  }

  const clearTemplate = () => {
    if (template && name.trim() !== '' && name !== template.name) { setClearConfirm(true); return }
    doActualClear()
  }

  const doActualClear = () => {
    setTemplate(null); setSearchQuery(''); setTypeMismatch(null); setClearConfirm(false)
    setSearchResults([])
    setName(''); setPrice('0'); setRarity('0'); setEncumbrance('1'); setDescription(''); setCustomNotes('')
    setSkillKey('MELEE'); setDamage('0'); setDamageAdd(''); setCrit('3'); setRangeValue('Engaged'); setHardPoints('0')
    setDefense('0'); setSoak('0'); setEncBonus('')
    setQualities([]); setAttachments([])
  }

  const acceptTypeMismatch = (switchTo: ItemType) => {
    if (!template) return
    setType(switchTo)
    applyTemplateFields(template, switchTo)
    setTypeMismatch(null)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  // ── Qualities helpers ──
  const filteredQualities = allQualities.filter(q =>
    q.name.toLowerCase().includes(qualSearch.toLowerCase())
  )

  const addQuality = (refQ: RefWeaponQuality) => {
    setQualities(prev => {
      if (prev.find(q => q.key === refQ.key)) return prev
      return [...prev, { key: refQ.key, count: refQ.is_ranked ? 1 : 1 }]
    })
    setQualSearch('')
    setQualOpen(false)
  }

  const removeQuality = (key: string) => setQualities(prev => prev.filter(q => q.key !== key))

  const updateQualityCount = (key: string, count: number) =>
    setQualities(prev => prev.map(q => q.key === key ? { ...q, count } : q))

  // ── Attachments helpers ──
  const hpTotal     = parseInt(hardPoints) || 0
  const hpUsed      = attachments.reduce((sum, a) => {
    const ref = allAttachments.find(r => r.key === a.key)
    return sum + (ref?.hp_required ?? 0)
  }, 0)
  const hpRemaining = hpTotal - hpUsed

  const addAttachment = (ref: RefItemAttachment) => {
    setAttachments(prev => [...prev, { key: ref.key, installedAddedModIndices: [] }])
    setAttSearch('')
    setAttOpen(false)
  }

  const removeAttachment = (key: string) => {
    setAttachments(prev => prev.filter(a => a.key !== key))
    setConfirmRemoveAtt(null)
    if (expandedAtt === key) setExpandedAtt(null)
  }

  const toggleAddedMod = (attKey: string, modIdx: number) => {
    setAttachments(prev => prev.map(a => {
      if (a.key !== attKey) return a
      const existing = a.installedAddedModIndices
      const next = existing.includes(modIdx)
        ? existing.filter(i => i !== modIdx)
        : [...existing, modIdx]
      return { ...a, installedAddedModIndices: next }
    }))
  }

  // ── Effective stats preview ──
  interface EffPreview {
    damage: number
    damageSources: string[]
    qualities: Array<{ key: string; count: number; sources: string[] }>
  }

  const effectivePreview = useCallback((): EffPreview | null => {
    if (type !== 'weapon') return null
    const isBrawnBased = ['MELEE', 'BRAWL', 'LTSABER'].includes(skillKey)
    let dmg = isBrawnBased ? (parseInt(damageAdd) || 0) : (parseInt(damage) || 0)
    const dmgSources: string[] = [isBrawnBased ? `Brawn+${dmg}` : `Base ${dmg}`]
    const qualMap: Record<string, { count: number; sources: string[] }> = {}

    qualities.forEach(q => {
      qualMap[q.key] = { count: q.count ?? 1, sources: ['base'] }
    })

    attachments.forEach(att => {
      const ref = allAttachments.find(r => r.key === att.key)
      if (!ref) return
      const processEntry = (entry: AttachmentModEntry, src: string) => {
        if (!entry.key) return
        if (entry.key === 'DAMADD' && entry.count) {
          dmg += entry.count
          dmgSources.push(`${src} +${entry.count}`)
        } else if (entry.key === 'DAMSUB' && entry.count) {
          dmg -= entry.count
          dmgSources.push(`${src} −${entry.count}`)
        } else if (entry.key === 'DAMSET' && entry.count) {
          dmg = entry.count
          dmgSources.splice(0, dmgSources.length, `${src} sets ${entry.count}`)
        } else {
          // might be a quality key
          const qCount = entry.count ?? 1
          if (qCount > 0) {
            const existing = qualMap[entry.key]
            if (existing) {
              existing.count += qCount
              existing.sources.push(src)
            } else {
              qualMap[entry.key] = { count: qCount, sources: [src] }
            }
          }
        }
      }

      if (isModArray(ref.base_mods)) ref.base_mods.forEach(e => processEntry(e, ref.name))
      att.installedAddedModIndices.forEach(idx => {
        if (isModArray(ref.added_mods) && ref.added_mods[idx]) {
          processEntry(ref.added_mods[idx], `${ref.name} (mod)`)
        }
      })
    })

    const qualList = Object.entries(qualMap).map(([key, v]) => ({
      key, count: v.count, sources: v.sources,
    }))

    return { damage: dmg, damageSources: dmgSources, qualities: qualList }
  }, [type, skillKey, damage, damageAdd, qualities, attachments, allAttachments])

  // ── Save ──
  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setBusy(true); setError(null)

    const key = isNew
      ? `custom_${campaignId.slice(0, 8)}_${Date.now()}`
      : (isOggDude ? `custom_copy_${item!.key}_${campaignId.slice(0, 8)}` : item!.key)

    const common = {
      name:         name.trim(),
      price:        parseInt(price) || 0,
      rarity:       parseInt(rarity) || 0,
      encumbrance:  parseInt(encumbrance) || 0,
      description:  description || null,
      is_custom:    true,
      custom_notes: customNotes || null,
      campaign_id:  campaignId,
    }

    let result: { error: { message: string } | null } = { error: null }

    if (type === 'weapon') {
      const isBrawnBased = ['MELEE', 'BRAWL', 'LTSABER'].includes(skillKey)
      const payload = {
        key,
        ...common,
        skill_key:   skillKey,
        damage:      isBrawnBased ? 0 : (parseInt(damage) || 0),
        damage_add:  isBrawnBased ? (parseInt(damageAdd) || 0) : null,
        crit:        parseInt(crit) || 3,
        range_value: `wr${rangeValue}`,
        hard_points: parseInt(hardPoints) || 0,
        categories:  [],
        qualities:   qualities,
      }
      if (isEdit && !isOggDude) {
        result = await supabase.from('ref_weapons').update(payload).eq('key', item!.key).eq('campaign_id', campaignId)
      } else {
        result = await supabase.from('ref_weapons').insert(payload)
      }
    } else if (type === 'armor') {
      const payload = {
        key,
        ...common,
        defense:           parseInt(defense) || 0,
        soak:              parseInt(soak) || 0,
        soak_bonus:        parseInt(soak) || 0,
        hard_points:       0,
        defense_melee:     parseInt(defense) || 0,
        defense_ranged:    parseInt(defense) || 0,
        encumbrance_bonus: encBonus !== '' ? parseInt(encBonus) || 0 : null,
      }
      if (isEdit && !isOggDude) {
        result = await supabase.from('ref_armor').update(payload).eq('key', item!.key).eq('campaign_id', campaignId)
      } else {
        result = await supabase.from('ref_armor').insert(payload)
      }
    } else {
      const payload = {
        key,
        ...common,
        encumbrance_bonus: encBonus !== '' ? parseInt(encBonus) || 0 : null,
      }
      if (isEdit && !isOggDude) {
        result = await supabase.from('ref_gear').update(payload).eq('key', item!.key).eq('campaign_id', campaignId)
      } else {
        result = await supabase.from('ref_gear').insert(payload)
      }
    }

    if (result.error) { setError(result.error.message); setBusy(false); return }
    setBusy(false)
    onSaved({
      key, type,
      name:         common.name,
      price:        common.price,
      rarity:       common.rarity,
      encumbrance:  common.encumbrance,
      description:  common.description ?? undefined,
      is_custom:    true,
      custom_notes: common.custom_notes ?? undefined,
      campaign_id:  common.campaign_id,
      isNew:        isNew || isOggDude,
      ...(type === 'weapon' && {
        skill_key: skillKey,
        damage:    parseInt(damage) || 0,
        crit:      parseInt(crit) || 3,
        range_value: `wr${rangeValue}`,
        qualities,
      }),
      ...(type === 'armor'  && {
        defense: parseInt(defense) || 0,
        soak:    parseInt(soak) || 0,
        encumbrance_bonus: encBonus !== '' ? (parseInt(encBonus) || null) : null,
      }),
      ...(type === 'gear'   && { encumbrance_bonus: encBonus !== '' ? (parseInt(encBonus) || null) : null }),
    })
  }

  // ── Grouped search results ──
  const groupedResults = (() => {
    if (!searchResults.length) return []
    const order: ItemType[] =
      defaultType === 'weapon' ? ['weapon', 'armor', 'gear']
      : defaultType === 'armor' ? ['armor', 'weapon', 'gear']
      : ['gear', 'weapon', 'armor']
    type Group = { type: ItemType; items: TemplateResult[] }
    return order
      .map(t => ({ type: t, items: searchResults.filter(r => r.type === t) }))
      .filter(g => g.items.length > 0) as Group[]
  })()

  const preview = effectivePreview()

  // ── Portal ──
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: Z.modal,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Scrim */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: Z.base }}
        onClick={onClose}
      />

      {/* Modal box */}
      <div style={{
        position: 'relative', zIndex: Z.raised,
        width: 'clamp(520px, 60vw, 780px)',
        maxHeight: '90dvh',
        overflowY: 'auto',
        background: 'rgba(6,13,9,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${GOLD_BD}`,
        borderRadius: RADIUS.xl,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.96)',
        transition: `opacity ${EASE.default}, transform ${EASE.default}`,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', borderBottom: `1px solid ${BORDER}`,
          position: 'sticky', top: 0, background: 'rgba(6,13,9,0.98)', zIndex: Z.raised,
          borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        }}>
          <div style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: HUD.gold, letterSpacing: '0.08em' }}>
            {isNew ? 'New Custom Item' : isOggDude ? 'Create Custom Copy' : `Edit ${item!.name}`}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: DIM, cursor: 'pointer', fontFamily: FONT_C, fontSize: FS_SM }}>
            ✕
          </button>
        </div>

        {/* OggDude warning */}
        {isOggDude && (
          <div style={{ margin: '0.75rem 1.25rem 0', padding: '0.625rem', background: 'rgba(224,120,85,0.08)', border: `1px solid rgba(224,120,85,0.3)`, borderRadius: RADIUS.md }}>
            <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: ORANGE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>System Item</div>
            <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM }}>
              This item is from the system database and cannot be edited directly. A custom copy will be created for this campaign.
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>

          {/* ── Template search (new items only) ── */}
          {isNew && (
            <div ref={searchContainerRef} style={{ position: 'relative' }}>
              <div style={sectionLabel}>Start from existing item (optional)</div>
              {template ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(200,170,80,0.06)', border: `1px solid ${GOLD_BD}`,
                  borderRadius: RADIUS.sm, padding: '0.375rem 0.625rem',
                }}>
                  <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TYPE_COLOR[template.type], flexShrink: 0, border: `1px solid ${TYPE_BORDER[template.type]}`, borderRadius: RADIUS.sm, padding: '0.0625rem 0.3125rem' }}>
                    {template.type}
                  </span>
                  <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>{template.name}</span>
                  {template.is_custom && <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: GOLD_DIM }}>★</span>}
                  <button onClick={clearTemplate} title="Clear template" style={{ background: 'none', border: 'none', color: GOLD_DIM, cursor: 'pointer', fontSize: FS_SM, lineHeight: 1, padding: '0 0.125rem', flexShrink: 0 }}>×</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: FS_SM, color: DIM, pointerEvents: 'none' }}>🔍</span>
                  <input
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) setSearchOpen(true) }}
                    onFocus={() => { if (searchResults.length > 0) setSearchOpen(true) }}
                    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); if (searchOpen) setSearchOpen(false); else setSearchQuery('') } }}
                    placeholder="Search weapons, armor, gear…"
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 32 }}
                  />
                  {searchBusy && <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: FS_OVER, color: DIM }}>…</span>}
                </div>
              )}
              {searchOpen && groupedResults.length > 0 && !template && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: Z.overlay,
                  background: 'rgba(6,13,9,0.99)', border: `1px solid ${BORDER_HI}`,
                  borderRadius: RADIUS.md, maxHeight: '12.5rem', overflowY: 'auto',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
                }}>
                  {groupedResults.map((group, gi) => (
                    <div key={group.type}>
                      {gi > 0 && <div style={{ padding: '0.1875rem 0.625rem', fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, background: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>─── {group.type.toUpperCase()} ───</div>}
                      {group.items.map(r => (
                        <button
                          key={r.key}
                          onMouseDown={e => { e.preventDefault(); selectTemplate(r) }}
                          className="hov-gold-bg"
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4375rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${BORDER}` }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, fontWeight: 700, textTransform: 'uppercase', color: TYPE_COLOR[r.type], border: `1px solid ${TYPE_BORDER[r.type]}`, borderRadius: RADIUS.sm, padding: '0.0625rem 0.25rem', flexShrink: 0 }}>{r.type}</span>
                            <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>{r.name}</span>
                            {r.is_custom && <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: GOLD_DIM }}>★</span>}
                          </div>
                          <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, marginTop: '0.125rem' }}>{templateStatLine(r)}</div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {template && !typeMismatch && !clearConfirm && (
                <div style={{ fontFamily: FONT_C, fontStyle: 'italic', fontSize: FS_CAP, color: 'rgba(200,170,80,0.5)', marginTop: '0.375rem' }}>
                  Based on {template.name} — all fields are editable. This will save as a new custom item.
                </div>
              )}
              {typeMismatch && !clearConfirm && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(224,120,85,0.07)', border: `1px solid rgba(224,120,85,0.3)`, borderRadius: RADIUS.md, display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: ORANGE, flex: 1, minWidth: '12.5rem' }}>
                    This is a {typeMismatch} item. Switch item type to {typeMismatch}?
                  </span>
                  <button onClick={() => { setTypeMismatch(null); setTimeout(() => nameInputRef.current?.focus(), 50) }} style={btnSecondaryStyle}>Keep as {type}</button>
                  <button onClick={() => acceptTypeMismatch(typeMismatch)} style={{ ...btnPrimaryStyle, padding: '0.375rem 0.875rem' }}>Switch to {typeMismatch}</button>
                </div>
              )}
              {clearConfirm && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(200,170,80,0.04)', border: `1px solid ${GOLD_BD}`, borderRadius: RADIUS.md, display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: TEXT, flex: 1, minWidth: '12.5rem' }}>Clear template and reset all fields?</span>
                  <button onClick={() => setClearConfirm(false)} style={btnSecondaryStyle}>Cancel</button>
                  <button onClick={doActualClear} style={{ ...btnPrimaryStyle, padding: '0.375rem 0.875rem', color: RED, borderColor: 'rgba(224,80,80,0.4)' }}>Clear</button>
                </div>
              )}
              {!template && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ flex: 1, height: 1, background: BORDER }} />
                  <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>or start from scratch</span>
                  <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
              )}
            </div>
          )}

          {/* Type (new only) */}
          {isNew && (
            <div>
              <div style={fieldLabel}>Type</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['weapon', 'armor', 'gear'] as ItemType[]).map(t => (
                  <button key={t} onClick={() => setType(t)} style={{
                    fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '0.3125rem 0.875rem', borderRadius: RADIUS.sm, cursor: 'pointer', border: '1px solid',
                    color:       type === t ? (t === 'weapon' ? RED : t === 'armor' ? BLUE : HUD.gold) : DIM,
                    borderColor: type === t ? (t === 'weapon' ? 'rgba(224,80,80,0.5)' : t === 'armor' ? 'rgba(90,170,224,0.5)' : GOLD_BD) : BORDER,
                    background:  type === t ? (t === 'weapon' ? 'rgba(224,80,80,0.08)' : t === 'armor' ? 'rgba(90,170,224,0.08)' : 'rgba(200,170,80,0.08)') : 'transparent',
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <Field label="Name">
            <input ref={nameInputRef} value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, width: '100%' }} placeholder="Item name" />
          </Field>

          {/* Common fields */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <Field label="Price"><input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} style={{ ...inputStyle, width: '5rem' }} /></Field>
            <Field label="Rarity"><input type="number" min={0} max={10} value={rarity} onChange={e => setRarity(e.target.value)} style={{ ...inputStyle, width: '3.75rem' }} /></Field>
            <Field label="Encumbrance"><input type="number" min={0} value={encumbrance} onChange={e => setEncumbrance(e.target.value)} style={{ ...inputStyle, width: '3.75rem' }} /></Field>
          </div>

          {/* Weapon fields */}
          {type === 'weapon' && <>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <Field label="Skill">
                <select value={skillKey} onChange={e => setSkillKey(e.target.value)} style={{ ...inputStyle }}>
                  {SKILL_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Range">
                <select value={rangeValue} onChange={e => setRangeValue(e.target.value)} style={{ ...inputStyle }}>
                  {RANGE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {['MELEE', 'BRAWL', 'LTSABER'].includes(skillKey) ? (
                <Field label="Damage (Brawn+)"><input type="number" min={0} value={damageAdd} onChange={e => setDamageAdd(e.target.value)} style={{ ...inputStyle, width: '4.375rem' }} placeholder="0" /></Field>
              ) : (
                <Field label="Damage"><input type="number" min={0} value={damage} onChange={e => setDamage(e.target.value)} style={{ ...inputStyle, width: '4.375rem' }} /></Field>
              )}
              <Field label="Crit"><input type="number" min={1} value={crit} onChange={e => setCrit(e.target.value)} style={{ ...inputStyle, width: '3.75rem' }} /></Field>
              <Field label="Hard Points"><input type="number" min={0} value={hardPoints} onChange={e => setHardPoints(e.target.value)} style={{ ...inputStyle, width: '3.75rem' }} /></Field>
            </div>
          </>}

          {/* Armor fields */}
          {type === 'armor' && (
            <>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <Field label="Defense"><input type="number" min={0} value={defense} onChange={e => setDefense(e.target.value)} style={{ ...inputStyle, width: '4.375rem' }} /></Field>
                <Field label="Soak Bonus"><input type="number" min={0} value={soak} onChange={e => setSoak(e.target.value)} style={{ ...inputStyle, width: '4.375rem' }} /></Field>
              </div>
              <Field label="Bonus Encumbrance Threshold (when equipped)">
                <input type="number" min={0} value={encBonus} onChange={e => setEncBonus(e.target.value)} style={{ ...inputStyle, width: '5rem' }} placeholder="—" />
              </Field>
            </>
          )}

          {/* Gear fields */}
          {type === 'gear' && (
            <Field label="Bonus Encumbrance Threshold (storage container, when equipped)">
              <input type="number" min={0} value={encBonus} onChange={e => setEncBonus(e.target.value)} style={{ ...inputStyle, width: '5rem' }} placeholder="—" />
            </Field>
          )}

          {/* ── QUALITIES (weapon only) ── */}
          {(type === 'weapon') && (
            <div>
              <SectionDivider label="Qualities" />

              {/* Added qualities list */}
              {qualities.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {qualities.map(q => {
                    const refQ = allQualities.find(r => r.key === q.key)
                    return (
                      <QualityRow
                        key={q.key}
                        qualKey={q.key}
                        displayName={refQ?.name ?? q.key}
                        count={q.count ?? 1}
                        isRanked={refQ?.is_ranked ?? true}
                        onCountChange={c => updateQualityCount(q.key, c)}
                        onRemove={() => removeQuality(q.key)}
                      />
                    )
                  })}
                </div>
              )}

              {/* Add quality dropdown */}
              <div ref={qualContainerRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setQualOpen(o => !o)}
                  style={{
                    ...btnSecondaryStyle, padding: '0.3125rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}
                >
                  <span style={{ color: HUD.gold }}>+</span>
                  <span>Add Quality…</span>
                  <span style={{ marginLeft: 'auto', fontSize: FS_OVER, opacity: 0.6 }}>▾</span>
                </button>

                {qualOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: Z.dropdown,
                    width: '17.5rem', background: 'rgba(6,13,9,0.99)', border: `1px solid ${BORDER_HI}`,
                    borderRadius: RADIUS.md, boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
                  }}>
                    <div style={{ padding: '0.375rem 0.5rem', borderBottom: `1px solid ${BORDER}` }}>
                      <input
                        autoFocus
                        value={qualSearch}
                        onChange={e => setQualSearch(e.target.value)}
                        placeholder="Filter qualities…"
                        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontSize: FS_CAP }}
                      />
                    </div>
                    <div style={{ maxHeight: '13.75rem', overflowY: 'auto' }}>
                      {filteredQualities.map(q => {
                        const added = qualities.find(x => x.key === q.key)
                        return (
                          <button
                            key={q.key}
                            onMouseDown={e => { e.preventDefault(); added ? removeQuality(q.key) : addQuality(q) }}
                            className="hov-gold-bg"
                            style={{
                              display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem',
                              padding: '0.375rem 0.625rem', background: 'transparent', border: 'none',
                              cursor: 'pointer', borderBottom: `1px solid ${BORDER}`,
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ width: '0.875rem', flexShrink: 0, color: GREEN, fontSize: FS_SM }}>{added ? '✓' : ''}</span>
                            <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>{q.name}</span>
                            {q.is_ranked && <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM }}>ranked</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ATTACHMENTS (weapon + armor only) ── */}
          {(type === 'weapon' || type === 'armor') && (
            <div>
              <SectionDivider label="Attachments" />

              {/* HP bar */}
              {type === 'weapon' && (
                <div style={{ marginBottom: '0.625rem' }}>
                  {hpTotal === 0 ? (
                    <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, fontStyle: 'italic' }}>No hard points — set Hard Points above to add attachments</div>
                  ) : (
                    <>
                      <div style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: DIM, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>HARD POINTS</div>
                      <HpBar used={hpUsed} total={hpTotal} />
                    </>
                  )}
                </div>
              )}

              {/* Installed attachment cards */}
              {attachments.map(att => {
                const ref = allAttachments.find(r => r.key === att.key)
                if (!ref) return null
                const baseMods  = isModArray(ref.base_mods)  ? ref.base_mods  : []
                const addedMods = isModArray(ref.added_mods) ? ref.added_mods : []
                const isExpanded = expandedAtt === att.key

                return (
                  <div key={att.key} style={{
                    border: `1px solid ${BORDER_HI}`,
                    borderRadius: RADIUS.lg, marginBottom: '0.375rem',
                    background: 'rgba(200,170,80,0.03)',
                    overflow: 'hidden',
                  }}>
                    {/* Card header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      borderBottom: isExpanded ? `1px solid ${BORDER}` : 'none',
                    }}
                      onClick={() => setExpandedAtt(isExpanded ? null : att.key)}
                    >
                      <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: TEXT, flex: 1, fontWeight: 600 }}>
                        {ref.name}
                      </span>
                      {(ref.hp_required ?? 0) > 0 && (
                        <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM }}>HP: {ref.hp_required}</span>
                      )}
                      <span style={{ fontFamily: FONT_M, fontSize: FS_SM, color: DIM, userSelect: 'none' }}>{isExpanded ? '▲' : '▼'}</span>

                      {/* Remove button */}
                      {confirmRemoveAtt === att.key ? (
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: ORANGE }}>Remove?</span>
                          <button
                            onClick={() => removeAttachment(att.key)}
                            style={{ fontFamily: FONT_M, fontSize: FS_OVER, background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.4)', color: RED, borderRadius: RADIUS.sm, cursor: 'pointer', padding: '0.125rem 0.5rem' }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRemoveAtt(null)}
                            style={{ ...btnSecondaryStyle, padding: '0.125rem 0.5rem', fontSize: FS_OVER }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmRemoveAtt(att.key) }}
                          title={`Remove ${ref.name}`}
                          className="hov-danger"
                          style={{ background: 'none', border: 'none', color: 'rgba(224,80,80,0.5)', cursor: 'pointer', fontSize: FS_SM, lineHeight: 1, padding: '0 0.125rem' }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Expanded body */}
                    {isExpanded && (
                      <div style={{ padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                        {/* Base mods */}
                        {baseMods.length > 0 && (
                          <div>
                            <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Base Mods (automatic)</div>
                            {baseMods.map((entry, i) => {
                              const label = modLabel(entry)
                              if (!label) return null
                              return (
                                <div key={i} style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: TEXT, paddingLeft: 8 }}>
                                  • {label}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Optional mods */}
                        {addedMods.length > 0 && (
                          <div>
                            <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Optional Mods (via Mechanics)</div>
                            {addedMods.map((entry, i) => {
                              const label = modLabel(entry)
                              if (!label) return null
                              const isInstalled = att.installedAddedModIndices.includes(i)
                              return (
                                <div key={i} style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.1875rem 0.5rem', borderRadius: RADIUS.sm,
                                  background: isInstalled ? 'rgba(80,168,112,0.07)' : 'transparent',
                                }}>
                                  <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: isInstalled ? GREEN : TEXT, flex: 1 }}>
                                    {isInstalled ? '✓ ' : ''}
                                    {label}
                                    {entry.count != null && entry.count > 0 && entry.key && ['ACCURATE','PIERCE','VICIOUS','BLAST','BURN','BREACH','DAMADD'].includes(entry.key)
                                      ? ''
                                      : ''}
                                  </span>
                                  <button
                                    onClick={() => toggleAddedMod(att.key, i)}
                                    style={{
                                      fontFamily: FONT_M, fontSize: FS_OVER,
                                      background: isInstalled ? 'rgba(80,168,112,0.15)' : 'rgba(200,170,80,0.07)',
                                      border: `1px solid ${isInstalled ? 'rgba(80,168,112,0.4)' : BORDER}`,
                                      color: isInstalled ? GREEN : DIM,
                                      borderRadius: RADIUS.sm, cursor: 'pointer', padding: '0.125rem 0.5rem',
                                      textTransform: 'uppercase', letterSpacing: '0.08em',
                                    }}
                                  >
                                    {isInstalled ? 'Remove' : '+ Add'}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add attachment dropdown */}
              <div ref={attContainerRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setAttOpen(o => !o)}
                  disabled={type === 'weapon' && hpTotal === 0}
                  style={{
                    ...btnSecondaryStyle, padding: '0.3125rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    opacity: type === 'weapon' && hpTotal === 0 ? 0.4 : 1,
                    cursor: type === 'weapon' && hpTotal === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ color: HUD.gold }}>+</span>
                  <span>Add Attachment…</span>
                  <span style={{ marginLeft: 'auto', fontSize: FS_OVER, opacity: 0.6 }}>▾</span>
                </button>

                {attOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: Z.dropdown,
                    width: '22.5rem', background: 'rgba(6,13,9,0.99)', border: `1px solid ${BORDER_HI}`,
                    borderRadius: RADIUS.md, boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
                  }}>
                    <div style={{ padding: '0.375rem 0.5rem', borderBottom: `1px solid ${BORDER}` }}>
                      <input
                        autoFocus
                        value={attSearch}
                        onChange={e => setAttSearch(e.target.value)}
                        placeholder="Filter attachments…"
                        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontSize: FS_CAP }}
                      />
                    </div>
                    <div style={{ maxHeight: '18.75rem', overflowY: 'auto' }}>
                      {allAttachments
                        .filter(r => r.name.toLowerCase().includes(attSearch.toLowerCase()))
                        .filter(r => !attachments.find(a => a.key === r.key))
                        .map(r => {
                          const canFit = hpRemaining >= (r.hp_required ?? 0)
                          const baseMods = isModArray(r.base_mods) ? r.base_mods : []
                          const summary = baseMods
                            .map(e => modLabel(e))
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(', ')

                          return (
                            <button
                              key={r.key}
                              onMouseDown={e => { e.preventDefault(); if (canFit || type !== 'weapon') addAttachment(r) }}
                              className={canFit || type !== 'weapon' ? 'hov-gold-bg' : ''}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '0.5rem 0.625rem', background: 'transparent', border: 'none',
                                cursor: canFit || type !== 'weapon' ? 'pointer' : 'default',
                                borderBottom: `1px solid ${BORDER}`,
                                opacity: !canFit && type === 'weapon' ? 0.55 : 1,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>{r.name}</span>
                                <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, flexShrink: 0 }}>
                                  HP: {r.hp_required ?? 0}
                                  {r.price != null ? `  ·  ${r.price.toLocaleString()}cr` : ''}
                                </span>
                              </div>
                              {summary && (
                                <div style={{ fontFamily: FONT_C, fontStyle: 'italic', fontSize: FS_OVER, color: DIM, marginTop: '0.125rem' }}>
                                  <RichText text={summary} />
                                </div>
                              )}
                              {!canFit && type === 'weapon' && (
                                <div style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: 'rgba(224,120,85,0.7)', marginTop: '0.125rem' }}>
                                  Requires {r.hp_required} HP — only {hpRemaining} remaining
                                </div>
                              )}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EFFECTIVE STATS PREVIEW ── */}
          {preview && (attachments.length > 0) && (
            <div>
              <SectionDivider label="Effective Stats (with attachments)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* Damage */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', width: '5rem' }}>Damage</span>
                  <span style={{ fontFamily: FONT_M, fontSize: FS_LABEL, color: HUD.gold }}>
                    {['MELEE', 'BRAWL', 'LTSABER'].includes(skillKey) ? `Brawn+${preview.damage}` : preview.damage}
                  </span>
                  {preview.damageSources.length > 1 && (
                    <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: DIM, fontStyle: 'italic' }}>
                      ({preview.damageSources.join(' → ')})
                    </span>
                  )}
                </div>
                {/* Qualities */}
                {preview.qualities.length > 0 && (() => {
                  const refQualityMap = Object.fromEntries(allQualities.map(q => [q.key, q]))
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', width: '5rem', flexShrink: 0 }}>Qualities</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {preview.qualities.map(q => (
                          <QualityBadge
                            key={q.key}
                            quality={{ key: q.key, count: q.count }}
                            refQualityMap={refQualityMap}
                            variant="desktop"
                          />
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={fieldLabel}>Description</span>
              <button
                onClick={() => setDescPreview(p => !p)}
                style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: descPreview ? HUD.gold : DIM, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.125rem 0.375rem', letterSpacing: '0.05em' }}
              >
                {descPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {descPreview ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`,
                borderRadius: RADIUS.md, padding: '0.625rem 0.75rem',
                fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, lineHeight: 1.5, minHeight: '5rem',
              }}>
                {description.trim()
                  ? <RichText text={description} />
                  : <span style={{ color: DIM, fontStyle: 'italic' }}>No description.</span>
                }
              </div>
            ) : (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: FONT_C, fontSize: FS_LABEL }}
                placeholder="Flavor text / item description"
              />
            )}
            <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM, marginTop: '0.25rem' }}>
              Supports RichText markup: [advantage], [success], [triumph], [boost:N], etc.
            </div>
          </div>

          {/* GM Notes */}
          <Field label="GM Notes (private)">
            <textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)} rows={2} style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: FONT_C, fontSize: FS_LABEL }} placeholder="Internal GM notes" />
          </Field>

          {/* Error */}
          {error && <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: RED, padding: '0.375rem 0' }}>⚠ {error}</div>}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: `1px solid ${BORDER}`,
          display: 'flex', justifyContent: 'flex-end', gap: '0.625rem',
          position: 'sticky', bottom: 0, background: 'rgba(6,13,9,0.98)',
          borderRadius: `0 0 ${RADIUS.xl}px ${RADIUS.xl}px`,
        }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancel</button>
          <button onClick={handleSave} disabled={busy} style={{ ...btnPrimaryStyle, opacity: busy ? 0.5 : 1 }}>
            {busy ? 'Saving…' : isOggDude ? 'Create Copy' : isNew ? 'Create Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <span style={{
        fontFamily: FONT_M, fontSize: FS_OVER,
        color: GOLD_DIM, textTransform: 'uppercase', letterSpacing: '0.18em',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  )
}

function QualityRow({
  qualKey, displayName, count, isRanked, onCountChange, onRemove,
}: {
  qualKey: string
  displayName: string
  count: number
  isRanked: boolean
  onCountChange: (n: number) => void
  onRemove: () => void
}) {
  return (
    <div
      className="hov-gold-bg quality-row"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: RADIUS.sm }}
    >
      <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>
        {displayName}
      </span>
      {isRanked ? (
        <input
          type="number"
          min={1}
          max={6}
          value={count}
          onChange={e => onCountChange(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
          style={{
            width: '1.75rem', height: '1.75rem',
            textAlign: 'center',
            fontFamily: FONT_M,
            fontSize: FS_CAP,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid rgba(200,170,80,0.3)`,
            borderRadius: RADIUS.md,
            color: HUD.gold,
            padding: 0,
            outline: 'none',
          }}
        />
      ) : (
        <span style={{ width: '1.75rem', height: '1.75rem', display: 'inline-block' }} />
      )}
      <button
        onClick={onRemove}
        className="hov-danger"
        style={{
          background: 'none', border: 'none',
          color: 'transparent',
          cursor: 'pointer', fontSize: FS_SM, lineHeight: 1, padding: '0 0.125rem',
          transition: `color ${EASE.quick}`,
        }}
      >
        ×
      </button>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 'var(--text-overline)',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'rgba(200,170,80,0.5)',
  marginBottom: '0.375rem',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 'var(--text-overline)',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(200,170,80,0.5)',
  marginBottom: '0.3125rem',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid rgba(200,170,80,0.3)`,
  color: HUD.text,
  fontFamily: FONT_BODY,
  fontSize: 'var(--text-label)',
  padding: '0.375rem 0.625rem',
  borderRadius: RADIUS.sm,
  outline: 'none',
}

const btnPrimaryStyle: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)',
  border: `1px solid rgba(200,170,80,0.3)`,
  color: HUD.gold,
  fontFamily: FONT_BODY,
  fontSize: 'var(--text-caption)',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '0.5rem 1.125rem',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
}

const btnSecondaryStyle: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid rgba(200,170,80,0.14)`,
  color: HUD.textFaint,
  fontFamily: FONT_BODY,
  fontSize: 'var(--text-caption)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0.5rem 0.875rem',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
}
