'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Adversary, AdversaryWeapon, AdversaryTalent } from '@/lib/adversaries'

/* ── Design tokens ─────────────────────────────────────── */
const FC       = "var(--font-cinzel), 'Cinzel', serif"
const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const BG       = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.97)'
const RAISED   = 'rgba(14,26,18,0.92)'
const INPUT_BG = 'rgba(0,0,0,0.35)'
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const TEXT     = '#C8D8C0'
const DIM      = '#6A8070'
const BORDER   = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const RED      = '#E05050'
const GREEN    = '#4EC87A'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

/* ── Styles ────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 3,
  color: TEXT, fontFamily: FR, fontSize: FS_SM, padding: '6px 10px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}

const numInput: React.CSSProperties = {
  ...inputStyle, width: 60, textAlign: 'center',
}

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.12)', border: `1px solid ${GOLD_DIM}`,
  color: GOLD, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
  letterSpacing: '0.1em', padding: '8px 20px',
  borderRadius: 3, cursor: 'pointer',
}

const btnSmall: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER}`,
  color: DIM, fontFamily: FR, fontSize: FS_CAPTION,
  padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
}

const btnDanger: React.CSSProperties = {
  background: 'transparent', border: `1px solid rgba(224,80,80,0.3)`,
  color: RED, fontFamily: FR, fontSize: FS_CAPTION,
  padding: '4px 8px', borderRadius: 3, cursor: 'pointer',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  marginBottom: 4,
}

const sectionHead: React.CSSProperties = {
  fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
  color: GOLD_DIM, borderBottom: `1px solid ${BORDER}`,
  paddingBottom: 4, marginBottom: 12,
}

/* ── All SWRPG skill names ─────────────────────────────── */
const ALL_SKILLS = [
  'Astrogation','Athletics','Brawl','Charm','Coercion','Computers',
  'Cool','Coordination','Deception','Discipline','Driving','Education',
  'Gunnery','Leadership','Lightsaber','Lore','Mechanics','Medicine',
  'Melee','Negotiation','Operating','Perception','Piloting (Planetary)',
  'Piloting (Space)','Ranged (Heavy)','Ranged (Light)','Resilience',
  'Riding','Skulduggery','Stealth','Streetwise','Survival','Underworld',
  'Vigilance','Xenology',
]

/* ── DB row type ───────────────────────────────────────── */
interface CustomAdversaryRow {
  id?: string
  name: string
  type: 'minion' | 'rival' | 'nemesis'
  brawn: number; agility: number; intellect: number
  cunning: number; willpower: number; presence: number
  soak: number
  wound_threshold: number
  strain_threshold: number | null
  defense_melee: number; defense_ranged: number
  skill_ranks: Record<string, number>
  weapons: AdversaryWeapon[]
  talents: AdversaryTalent[]
  abilities: { name: string; description: string }[]
  gear: string[]
  description: string | null
  is_custom: true
  campaign_id: string | null
  custom_notes: string | null
}

/* ── Props ─────────────────────────────────────────────── */
export interface AdversaryEditorProps {
  /** When editing a custom adversary: pass the existing DB row id */
  editId?:      string
  /** Pre-populate from an existing adversary (OggDude or custom) */
  template?:    Adversary & { _isCustom?: boolean }
  campaignId:   string
  supabase:     SupabaseClient
  allAdversaries: Adversary[]
  onClose:      () => void
  onSaved:      (saved: Adversary & { _isCustom: true; _dbId: string }) => void
}

/* ── Skill entry ───────────────────────────────────────── */
interface SkillEntry { skill: string; rank: number }
interface WeaponEntry { name: string; skillCategory: string; damage: string; range: string; qualities: string }
interface TalentEntry { name: string; description: string }
interface AbilityEntry { name: string; description: string }

function fromTemplate(t: Adversary): Partial<{
  name: string; type: 'minion' | 'rival' | 'nemesis'
  brawn: number; agility: number; intellect: number
  cunning: number; willpower: number; presence: number
  soak: number; wt: number; st: number | null
  defMelee: number; defRanged: number
  skills: SkillEntry[]; weapons: WeaponEntry[]
  talents: TalentEntry[]; abilities: AbilityEntry[]
  description: string
}> {
  return {
    name:        t.name,
    type:        t.type,
    brawn:       t.brawn, agility:    t.agility,
    intellect:   t.intellect, cunning: t.cunning,
    willpower:   t.willpower, presence: t.presence,
    soak:        t.soak,
    wt:          t.wound,
    st:          t.strain ?? null,
    defMelee:    Array.isArray(t.defense) ? (t.defense[0] ?? 0) : 0,
    defRanged:   Array.isArray(t.defense) ? (t.defense[1] ?? 0) : 0,
    skills:      Object.entries(t.skillRanks ?? {}).map(([skill, rank]) => ({ skill, rank })),
    weapons:     (t.weapons ?? []).map(w => ({
      name: w.name, skillCategory: w.skillCategory ?? '',
      damage: String(w.damage), range: w.range,
      qualities: (w.qualities ?? []).join(', '),
    })),
    talents:     (t.talents ?? []).map(ta => ({ name: ta.name, description: ta.description ?? '' })),
    abilities:   (t.abilities ?? []).map(a => ({ name: a.name, description: a.description })),
    description: t.description ?? '',
  }
}

/* ════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════ */
export function AdversaryEditor({
  editId, template, campaignId, supabase, allAdversaries,
  onClose, onSaved,
}: AdversaryEditorProps) {
  const [mounted, setMounted] = useState(false)

  /* ── Template search ────────────────────────────────── */
  const [tmplSearch, setTmplSearch] = useState('')
  const [tmplSelected, setTmplSelected] = useState<Adversary | null>(template ?? null)
  const tmplResults = useMemo(() => {
    if (!tmplSearch.trim()) return []
    const q = tmplSearch.toLowerCase()
    return allAdversaries.filter(a => a.name.toLowerCase().includes(q)).slice(0, 8)
  }, [allAdversaries, tmplSearch])

  /* ── Form state ──────────────────────────────────────── */
  const init = template ? fromTemplate(template) : {}

  const [name,       setName]       = useState(init.name ?? '')
  const [type,       setType]       = useState<'minion' | 'rival' | 'nemesis'>(init.type ?? 'rival')
  const [brawn,      setBrawn]      = useState(init.brawn      ?? 2)
  const [agility,    setAgility]    = useState(init.agility    ?? 2)
  const [intellect,  setIntellect]  = useState(init.intellect  ?? 2)
  const [cunning,    setCunning]    = useState(init.cunning    ?? 2)
  const [willpower,  setWillpower]  = useState(init.willpower  ?? 2)
  const [presence,   setPresence]   = useState(init.presence   ?? 2)
  const [wt,         setWt]         = useState(init.wt         ?? 10)
  const [st,         setSt]         = useState<number | ''>(init.st ?? '')
  const [defMelee,   setDefMelee]   = useState(init.defMelee   ?? 0)
  const [defRanged,  setDefRanged]  = useState(init.defRanged  ?? 0)
  const [skills,     setSkills]     = useState<SkillEntry[]>(init.skills  ?? [])
  const [weapons,    setWeapons]    = useState<WeaponEntry[]>(init.weapons ?? [])
  const [talents,    setTalents]    = useState<TalentEntry[]>(init.talents ?? [])
  const [abilities,  setAbilities]  = useState<AbilityEntry[]>(init.abilities ?? [])
  const [description, setDescription] = useState(init.description ?? '')
  const [customNotes, setCustomNotes] = useState('')

  /* ── Validation errors ───────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ── Busy / OggDude copy warning ─────────────────────── */
  const [saving, setSaving]  = useState(false)
  const isOggDudeCopy = !!template && !template._isCustom && !editId

  /* ── Apply template ──────────────────────────────────── */
  const applyTemplate = (adv: Adversary) => {
    const d = fromTemplate(adv)
    setName(d.name ?? ''); setType(d.type ?? 'rival')
    setBrawn(d.brawn ?? 2); setAgility(d.agility ?? 2)
    setIntellect(d.intellect ?? 2); setCunning(d.cunning ?? 2)
    setWillpower(d.willpower ?? 2); setPresence(d.presence ?? 2)
    setWt(d.wt ?? 10); setSt(d.st ?? '')
    setDefMelee(d.defMelee ?? 0); setDefRanged(d.defRanged ?? 0)
    setSkills(d.skills ?? [])
    setWeapons(d.weapons ?? [])
    setTalents(d.talents ?? [])
    setAbilities(d.abilities ?? [])
    setDescription(d.description ?? '')
    setTmplSelected(adv); setTmplSearch(''); setErrors({})
  }

  /* ── Mount guard for portal ─────────────────────────── */
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  /* ── Skill helpers ───────────────────────────────────── */
  const addSkill = () => setSkills(prev => [...prev, { skill: ALL_SKILLS[0], rank: 1 }])
  const removeSkill = (i: number) => setSkills(prev => prev.filter((_, j) => j !== i))
  const updateSkill = (i: number, patch: Partial<SkillEntry>) =>
    setSkills(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s))

  /* ── Weapon helpers ──────────────────────────────────── */
  const addWeapon = () => setWeapons(prev => [...prev, { name: '', skillCategory: '', damage: '0', range: 'Short', qualities: '' }])
  const removeWeapon = (i: number) => setWeapons(prev => prev.filter((_, j) => j !== i))
  const updateWeapon = (i: number, patch: Partial<WeaponEntry>) =>
    setWeapons(prev => prev.map((w, j) => j === i ? { ...w, ...patch } : w))

  /* ── Talent helpers ──────────────────────────────────── */
  const addTalent = () => setTalents(prev => [...prev, { name: '', description: '' }])
  const removeTalent = (i: number) => setTalents(prev => prev.filter((_, j) => j !== i))
  const updateTalent = (i: number, patch: Partial<TalentEntry>) =>
    setTalents(prev => prev.map((t, j) => j === i ? { ...t, ...patch } : t))

  /* ── Ability helpers ─────────────────────────────────── */
  const addAbility = () => setAbilities(prev => [...prev, { name: '', description: '' }])
  const removeAbility = (i: number) => setAbilities(prev => prev.filter((_, j) => j !== i))
  const updateAbility = (i: number, patch: Partial<AbilityEntry>) =>
    setAbilities(prev => prev.map((a, j) => j === i ? { ...a, ...patch } : a))

  /* ── Save ────────────────────────────────────────────── */
  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required.'
    if (!wt || wt < 1) errs.wt = 'Wound Threshold is required.'
    if (setErrors(errs), Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      const skillRanks: Record<string, number> = {}
      for (const s of skills) {
        if (s.skill && s.rank > 0) skillRanks[s.skill] = s.rank
      }

      const weaponsData: AdversaryWeapon[] = weapons
        .filter(w => w.name.trim())
        .map(w => ({
          name:          w.name.trim(),
          skillCategory: w.skillCategory || undefined,
          damage:        isNaN(Number(w.damage)) ? w.damage : Number(w.damage),
          range:         w.range,
          qualities:     w.qualities ? w.qualities.split(',').map(q => q.trim()).filter(Boolean) : undefined,
        }))

      const talentsData: AdversaryTalent[] = talents
        .filter(t => t.name.trim())
        .map(t => ({ name: t.name.trim(), description: t.description }))

      const abilitiesData = abilities
        .filter(a => a.name.trim())
        .map(a => ({ name: a.name.trim(), description: a.description }))

      const row: Omit<CustomAdversaryRow, 'id'> = {
        name: name.trim(), type,
        brawn, agility, intellect, cunning, willpower, presence,
        soak: brawn,  // soak = brawn + armor; store brawn as base
        wound_threshold: wt,
        strain_threshold: type === 'nemesis' && st !== '' ? Number(st) : null,
        defense_melee: defMelee, defense_ranged: defRanged,
        skill_ranks: skillRanks,
        weapons: weaponsData,
        talents: talentsData,
        abilities: abilitiesData,
        gear: [],
        description: description.trim() || null,
        is_custom: true,
        campaign_id: campaignId || null,
        custom_notes: customNotes.trim() || null,
      }

      let savedId: string

      if (editId) {
        const { error } = await supabase.from('ref_adversaries').update(row).eq('id', editId)
        if (error) throw error
        savedId = editId
      } else {
        const { data, error } = await supabase.from('ref_adversaries').insert(row).select('id').single()
        if (error) throw error
        savedId = (data as { id: string }).id
      }

      const saved: Adversary & { _isCustom: true; _dbId: string } = {
        id:         savedId,
        name:       row.name,
        type:       row.type,
        brawn, agility, intellect, cunning, willpower, presence,
        soak:       row.soak,
        wound:      row.wound_threshold,
        strain:     row.strain_threshold ?? undefined,
        defense:    [row.defense_melee, row.defense_ranged],
        skills:     Object.keys(skillRanks),
        skillRanks,
        talents:    talentsData,
        abilities:  abilitiesData,
        weapons:    weaponsData,
        gear:       [],
        description: description.trim() || undefined,
        _isCustom:  true,
        _dbId:      savedId,
      }

      onSaved(saved)
    } catch (err) {
      console.error('Save adversary failed', err)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  const isEdit = !!editId

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(16px, 3vh, 32px) 16px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640,
          background: PANEL_BG,
          border: `1px solid ${BORDER_HI}`,
          borderRadius: 8,
          boxShadow: '0 16px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, letterSpacing: '0.1em' }}>
            {isEdit ? 'Edit Adversary' : 'New Adversary'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontSize: FS_H4 }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '80vh', overflowY: 'auto' }}>

          {/* OggDude copy warning */}
          {isOggDudeCopy && (
            <div style={{
              background: 'rgba(224,120,85,0.08)', border: `1px solid rgba(224,120,85,0.3)`,
              borderRadius: 4, padding: '10px 14px',
              fontFamily: FR, fontSize: FS_CAPTION, color: '#E07855',
            }}>
              ✎ Based on OggDude data — all fields editable. Saves as a new custom adversary.
            </div>
          )}

          {/* Template search (only for new adversaries) */}
          {!isEdit && (
            <div>
              <div style={sectionHead}>Start from Existing (Optional)</div>
              {tmplSelected ? (
                <div style={{
                  background: RAISED, border: `1px solid ${BORDER}`, borderRadius: 4,
                  padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT }}>
                    Based on <strong style={{ color: GOLD }}>{tmplSelected.name}</strong>
                  </span>
                  <button
                    onClick={() => { setTmplSelected(null); setTmplSearch('') }}
                    style={btnSmall}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search adversaries…"
                    value={tmplSearch}
                    onChange={e => setTmplSearch(e.target.value)}
                    style={inputStyle}
                  />
                  {tmplResults.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
                      borderRadius: 4, maxHeight: 200, overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}>
                      {tmplResults.map(a => (
                        <button
                          key={a.id}
                          onClick={() => applyTemplate(a)}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            background: 'transparent', border: 'none',
                            padding: '8px 12px', cursor: 'pointer',
                            fontFamily: FR, fontSize: FS_SM, color: TEXT,
                            borderBottom: `1px solid ${BORDER}`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = RAISED)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {a.name}
                          <span style={{ marginLeft: 8, fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            [{a.type}]
                          </span>
                        </button>
                      ))}
                      <div style={{
                        padding: '6px 12px', borderTop: `1px solid ${BORDER}`,
                        fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
                        fontStyle: 'italic',
                      }}>
                        — or start from scratch —
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <div style={sectionHead}>Basic Info</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 2 }}>
                <div style={fieldLabel}>Name *</div>
                <input
                  type="text" placeholder="Adversary name…"
                  value={name} onChange={e => setName(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.name ? RED : BORDER }}
                />
                {errors.name && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: RED, marginTop: 3 }}>{errors.name}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>Type</div>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as 'minion' | 'rival' | 'nemesis')}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="minion">Minion</option>
                  <option value="rival">Rival</option>
                  <option value="nemesis">Nemesis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <div style={sectionHead}>Characteristics</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {([
                ['BR',  brawn,     setBrawn],
                ['AG',  agility,   setAgility],
                ['INT', intellect, setIntellect],
                ['CUN', cunning,   setCunning],
                ['WIL', willpower, setWillpower],
                ['PR',  presence,  setPresence],
              ] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 4 }}>{label}</div>
                  <input
                    type="number" min={1} max={6}
                    value={val}
                    onChange={e => setter(Math.min(6, Math.max(1, Number(e.target.value))))}
                    style={numInput}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Derived */}
          <div>
            <div style={sectionHead}>Derived Stats</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={fieldLabel}>Wound Threshold *</div>
                <input
                  type="number" min={1} value={wt}
                  onChange={e => setWt(Number(e.target.value))}
                  style={{ ...numInput, width: 80, borderColor: errors.wt ? RED : BORDER }}
                />
                {errors.wt && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: RED, marginTop: 3 }}>{errors.wt}</div>}
              </div>
              {type === 'nemesis' && (
                <div>
                  <div style={fieldLabel}>Strain Threshold</div>
                  <input
                    type="number" min={1}
                    value={st === '' ? '' : st}
                    onChange={e => setSt(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ ...numInput, width: 80 }}
                  />
                </div>
              )}
              <div>
                <div style={fieldLabel}>Def Melee</div>
                <input
                  type="number" min={0} max={4} value={defMelee}
                  onChange={e => setDefMelee(Number(e.target.value))}
                  style={{ ...numInput, width: 72 }}
                />
              </div>
              <div>
                <div style={fieldLabel}>Def Ranged</div>
                <input
                  type="number" min={0} max={4} value={defRanged}
                  onChange={e => setDefRanged(Number(e.target.value))}
                  style={{ ...numInput, width: 72 }}
                />
              </div>
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 6 }}>
              Soak = Brawn + armor (computed at runtime).
            </div>
          </div>

          {/* Skills */}
          <div>
            <div style={{ ...sectionHead, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', paddingBottom: 0 }}>
              <span style={sectionHead}>Skills</span>
              <button onClick={addSkill} style={btnSmall}>+ Add Skill</button>
            </div>
            <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 12 }} />
            {skills.length === 0 ? (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, padding: '4px 0' }}>No skills added.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {skills.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={s.skill}
                      onChange={e => updateSkill(i, { skill: e.target.value })}
                      style={{ ...inputStyle, flex: 1, appearance: 'none' }}
                    >
                      {ALL_SKILLS.map(sk => <option key={sk} value={sk}>{sk}</option>)}
                    </select>
                    <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, whiteSpace: 'nowrap' }}>Rank</div>
                    <input
                      type="number" min={1} max={5}
                      value={s.rank}
                      onChange={e => updateSkill(i, { rank: Math.min(5, Math.max(1, Number(e.target.value))) })}
                      style={{ ...numInput, width: 56 }}
                    />
                    <button onClick={() => removeSkill(i)} style={btnDanger}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weapons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={sectionHead}>Weapons</span>
              <button onClick={addWeapon} style={btnSmall}>+ Add Weapon</button>
            </div>
            <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 12 }} />
            {weapons.length === 0 ? (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, padding: '4px 0' }}>No weapons added.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weapons.map((w, i) => (
                  <div key={i} style={{
                    background: RAISED, border: `1px solid ${BORDER}`,
                    borderRadius: 4, padding: '10px 12px',
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text" placeholder="Weapon name…"
                        value={w.name}
                        onChange={e => updateWeapon(i, { name: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button onClick={() => removeWeapon(i)} style={btnDanger}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={fieldLabel}>Skill</div>
                        <input
                          type="text" placeholder="e.g. Ranged (Heavy)"
                          value={w.skillCategory}
                          onChange={e => updateWeapon(i, { skillCategory: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ width: 72 }}>
                        <div style={fieldLabel}>Damage</div>
                        <input
                          type="text" placeholder="8"
                          value={w.damage}
                          onChange={e => updateWeapon(i, { damage: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ width: 96 }}>
                        <div style={fieldLabel}>Range</div>
                        <select
                          value={w.range}
                          onChange={e => updateWeapon(i, { range: e.target.value })}
                          style={{ ...inputStyle, appearance: 'none' }}
                        >
                          {['Engaged','Short','Medium','Long','Extreme'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div style={fieldLabel}>Qualities (comma-separated)</div>
                      <input
                        type="text" placeholder="e.g. Stun Setting, Pierce 1"
                        value={w.qualities}
                        onChange={e => updateWeapon(i, { qualities: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Talents & Abilities */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={sectionHead}>Talents &amp; Abilities</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={addTalent} style={btnSmall}>+ Talent</button>
                <button onClick={addAbility} style={btnSmall}>+ Ability</button>
              </div>
            </div>
            <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 12 }} />
            {talents.length === 0 && abilities.length === 0 ? (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, padding: '4px 0' }}>None added.</div>
            ) : null}
            {talents.map((t, i) => (
              <div key={`t${i}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    type="text" placeholder="Talent name…"
                    value={t.name} onChange={e => updateTalent(i, { name: e.target.value })}
                    style={{ ...inputStyle, flex: '0 0 160px' }}
                  />
                  <input
                    type="text" placeholder="Description…"
                    value={t.description} onChange={e => updateTalent(i, { description: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <button onClick={() => removeTalent(i)} style={btnDanger}>×</button>
              </div>
            ))}
            {abilities.map((a, i) => (
              <div key={`a${i}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    type="text" placeholder="Ability name…"
                    value={a.name} onChange={e => updateAbility(i, { name: e.target.value })}
                    style={{ ...inputStyle, flex: '0 0 160px' }}
                  />
                  <input
                    type="text" placeholder="Description…"
                    value={a.description} onChange={e => updateAbility(i, { description: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <button onClick={() => removeAbility(i)} style={btnDanger}>×</button>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={sectionHead}>Description</div>
            <textarea
              placeholder="Flavour text…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical', fontFamily: FR,
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <button onClick={onClose} style={btnSmall}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Adversary'}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body,
  )
}
