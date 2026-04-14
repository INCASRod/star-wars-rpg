'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Vehicle, VehicleAbility } from '@/lib/vehicles'

/* ── Design tokens ─────────────────────────────────────── */
const FC       = "var(--font-cinzel), 'Cinzel', serif"
const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
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

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

/* ── Styles ────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 3,
  color: TEXT, fontFamily: FR, fontSize: FS_SM, padding: '6px 10px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}
const numInput: React.CSSProperties   = { ...inputStyle, width: 70, textAlign: 'center' }
const fieldLabel: React.CSSProperties = {
  fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
  letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4,
}
const sectionHead: React.CSSProperties = {
  fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
  color: GOLD_DIM, borderBottom: `1px solid ${BORDER}`,
  paddingBottom: 4, marginBottom: 12,
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

const VEHICLE_TYPES = [
  'Landspeeder', 'Repulsorlift', 'Speeder Bike', 'Swoop',
  'Walker', 'Ground Vehicle', 'Light Assault Transport',
  'Starfighter', 'Light Freighter', 'Heavy Freighter',
  'Capital Ship', 'Corvette', 'Frigate', 'Cruiser',
  'Shuttle', 'Transport', 'Other',
]

interface AbilityEntry { name: string; description: string }
interface WeaponEntry  { weaponKey: string; count: number; turret: boolean; location: string; qualitiesText: string }

function fromVehicle(v: Vehicle) {
  return {
    name:        v.name,
    type:        v.type,
    isStarship:  v.isStarship,
    silhouette:  v.silhouette,
    speed:       v.speed,
    handling:    v.handling,
    defFore:     v.defFore,
    defAft:      v.defAft,
    defPort:     v.defPort,
    defStarboard:v.defStarboard,
    armor:       v.armor,
    hullTrauma:  v.hullTrauma,
    systemStrain:v.systemStrain,
    crew:        v.crew ?? '',
    passengers:  v.passengers ?? 0,
    encumbranceCapacity: v.encumbranceCapacity ?? 0,
    consumables: v.consumables ?? '',
    abilities:   (v.abilities ?? []).map(a => ({ name: a.name, description: a.description })),
    weapons:     v.weapons.map(w => ({
      weaponKey:    w.weaponKey,
      count:        w.count,
      turret:       w.turret,
      location:     w.location,
      qualitiesText: w.qualities.map(q => `${q.key}${q.count > 1 ? ' ' + q.count : ''}`).join(', '),
    })),
    description: v.description ?? '',
  }
}

/* ── Props ─────────────────────────────────────────────── */
export interface VehicleEditorProps {
  editId?:      string
  template?:    Vehicle & { _isCustom?: boolean }
  campaignId:   string
  supabase:     SupabaseClient
  allVehicles?: (Vehicle & { _isCustom?: boolean })[]
  onClose:      () => void
  onSaved:      (saved: Vehicle & { _isCustom: true; _dbId: string }) => void
}

/* ════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════ */
export function VehicleEditor({
  editId, template, campaignId, supabase, allVehicles = [], onClose, onSaved,
}: VehicleEditorProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const isEdit = !!editId

  /* ── Template search ─────────────────────────────────── */
  const [tmplSearch,   setTmplSearch]   = useState('')
  const [tmplSelected, setTmplSelected] = useState<(Vehicle & { _isCustom?: boolean }) | null>(template ?? null)
  const tmplResults = useMemo(() => {
    if (!tmplSearch.trim()) return []
    const q = tmplSearch.toLowerCase()
    return allVehicles.filter(v => v.name.toLowerCase().includes(q)).slice(0, 8)
  }, [allVehicles, tmplSearch])

  const init: Partial<ReturnType<typeof fromVehicle>> = template ? fromVehicle(template) : {}

  /* ── Form state ─────────────────────────────────────── */
  const [name,         setName]         = useState(init.name        ?? '')
  const [type,         setType]         = useState(init.type        ?? 'Landspeeder')
  const [isStarship,   setIsStarship]   = useState(init.isStarship  ?? false)
  const [silhouette,   setSilhouette]   = useState(init.silhouette  ?? 3)
  const [speed,        setSpeed]        = useState(init.speed       ?? 2)
  const [handling,     setHandling]     = useState(init.handling    ?? 0)
  const [defFore,      setDefFore]      = useState(init.defFore     ?? 0)
  const [defAft,       setDefAft]       = useState(init.defAft      ?? 0)
  const [defPort,      setDefPort]      = useState(init.defPort     ?? 0)
  const [defStarboard, setDefStarboard] = useState(init.defStarboard ?? 0)
  const [armor,        setArmor]        = useState(init.armor       ?? 2)
  const [hullTrauma,   setHullTrauma]   = useState(init.hullTrauma  ?? 10)
  const [systemStrain, setSystemStrain] = useState(init.systemStrain ?? 8)
  const [crew,         setCrew]         = useState(init.crew        ?? '')
  const [passengers,   setPassengers]   = useState(init.passengers  ?? 0)
  const [encCap,       setEncCap]       = useState(init.encumbranceCapacity ?? 0)
  const [consumables,  setConsumables]  = useState(init.consumables ?? '')
  const [abilities,    setAbilities]    = useState<AbilityEntry[]>(init.abilities ?? [])
  const [weapons,      setWeapons]      = useState<WeaponEntry[]>(init.weapons ?? [])
  const [description,  setDescription]  = useState(init.description ?? '')

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ── Apply template ──────────────────────────────────── */
  const applyTemplate = (v: Vehicle & { _isCustom?: boolean }) => {
    const d = fromVehicle(v)
    setName(d.name ?? '')
    setType(d.type ?? 'Landspeeder')
    setIsStarship(d.isStarship ?? false)
    setSilhouette(d.silhouette ?? 3)
    setSpeed(d.speed ?? 2)
    setHandling(d.handling ?? 0)
    setDefFore(d.defFore ?? 0)
    setDefAft(d.defAft ?? 0)
    setDefPort(d.defPort ?? 0)
    setDefStarboard(d.defStarboard ?? 0)
    setArmor(d.armor ?? 2)
    setHullTrauma(d.hullTrauma ?? 10)
    setSystemStrain(d.systemStrain ?? 8)
    setCrew(d.crew ?? '')
    setPassengers(d.passengers ?? 0)
    setEncCap(d.encumbranceCapacity ?? 0)
    setConsumables(d.consumables ?? '')
    setAbilities(d.abilities ?? [])
    setWeapons(d.weapons ?? [])
    setDescription(d.description ?? '')
    setTmplSelected(v)
    setTmplSearch('')
  }

  const ni = (v: string, setter: (n: number) => void) =>
    setter(v === '' || v === '-' ? 0 : parseInt(v) || 0)

  /* ── Save ───────────────────────────────────────────── */
  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const parsedWeapons = weapons.map(w => ({
        weaponKey:  w.weaponKey,
        count:      w.count,
        turret:     w.turret,
        location:   w.location,
        firingArcs: { fore: true, aft: false, port: false, starboard: false, dorsal: false, ventral: false },
        qualities:  w.qualitiesText
          .split(',').map(s => s.trim()).filter(Boolean)
          .map(s => { const [key, ...rest] = s.split(' '); return { key, count: parseInt(rest[0] ?? '1') || 1 } }),
      }))

      const row = {
        name, type, is_starship: isStarship,
        categories: [isStarship ? 'Starship' : 'Ground Vehicle'],
        silhouette, speed, handling,
        def_fore: defFore, def_aft: defAft, def_port: defPort, def_starboard: defStarboard,
        armor, hull_trauma: hullTrauma, system_strain: systemStrain,
        crew: crew || null, passengers, encumbrance_capacity: encCap,
        consumables: consumables || null,
        weapons:     parsedWeapons,
        abilities,
        description: description || null,
        is_custom:   true,
        campaign_id: campaignId || null,
      }

      let savedId = editId
      if (editId) {
        const { error } = await supabase.from('ref_vehicles').update({ ...row, updated_at: new Date().toISOString() }).eq('id', editId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('ref_vehicles').insert(row).select('id').single()
        if (error) throw error
        savedId = (data as { id: string }).id
      }

      const saved: Vehicle & { _isCustom: true; _dbId: string } = {
        key: savedId!, name, type,
        categories: [isStarship ? 'Starship' : 'Ground Vehicle'],
        isStarship, silhouette, speed, handling,
        defFore, defAft, defPort, defStarboard,
        armor, hullTrauma, systemStrain,
        crew:      crew     || undefined,
        passengers: passengers || undefined,
        encumbranceCapacity: encCap || undefined,
        consumables: consumables || undefined,
        weapons:    parsedWeapons,
        abilities,
        description: description || undefined,
        _isCustom: true,
        _dbId:     savedId!,
      }
      onSaved(saved)
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Weapons helpers ─────────────────────────────────── */
  const addWeapon = () => setWeapons(prev => [...prev, { weaponKey: '', count: 1, turret: false, location: '', qualitiesText: '' }])
  const removeWeapon = (i: number) => setWeapons(prev => prev.filter((_, idx) => idx !== i))
  const updateWeapon = (i: number, field: keyof WeaponEntry, val: unknown) =>
    setWeapons(prev => prev.map((w, idx) => idx === i ? { ...w, [field]: val } : w))

  /* ── Abilities helpers ───────────────────────────────── */
  const addAbility    = () => setAbilities(prev => [...prev, { name: '', description: '' }])
  const removeAbility = (i: number) => setAbilities(prev => prev.filter((_, idx) => idx !== i))
  const updateAbility = (i: number, field: keyof AbilityEntry, val: string) =>
    setAbilities(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a))

  /* ── Modal portal ───────────────────────────────────── */
  const modal = (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 810, width: 'min(640px, 96vw)', maxHeight: '90vh',
          background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '16px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>
            {editId ? 'Edit Vehicle' : 'New Vehicle'}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: DIM, cursor: 'pointer', fontFamily: FR, fontSize: FS_H4, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Template search (only for new vehicles) */}
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
                    placeholder="🔍 Search vehicles…"
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
                      {tmplResults.map(v => (
                        <button
                          key={v.key}
                          onClick={() => applyTemplate(v)}
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
                          {v.name}
                          <span style={{ marginLeft: 8, fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            [{v.type}]
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

          {/* Identity */}
          <div>
            <div style={sectionHead}>Identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={fieldLabel}>Name {errors.name && <span style={{ color: RED }}>— {errors.name}</span>}</div>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Vehicle name" />
              </div>
              <div>
                <div style={fieldLabel}>Type</div>
                <select
                  value={type}
                  onChange={e => { setType(e.target.value); setIsStarship(['Starfighter','Light Freighter','Heavy Freighter','Capital Ship','Corvette','Frigate','Cruiser','Shuttle','Transport'].includes(e.target.value)) }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                <input
                  type="checkbox" id="isStarship" checked={isStarship}
                  onChange={e => setIsStarship(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isStarship" style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, cursor: 'pointer' }}>
                  Starship
                </label>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div>
            <div style={sectionHead}>Performance</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {([['Silhouette', silhouette, setSilhouette], ['Speed', speed, setSpeed], ['Handling', handling, setHandling]] as [string, number, (n: number) => void][]).map(([label, val, setter]) => (
                <div key={label}>
                  <div style={fieldLabel}>{label}</div>
                  <input type="number" value={val} onChange={e => ni(e.target.value, setter)} style={numInput} min={label === 'Handling' ? -5 : 0} max={label === 'Silhouette' ? 10 : 20} />
                </div>
              ))}
            </div>
          </div>

          {/* Combat Stats */}
          <div>
            <div style={sectionHead}>Combat Stats</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {([['Armor', armor, setArmor], ['Hull Trauma', hullTrauma, setHullTrauma], ['Sys. Strain', systemStrain, setSystemStrain]] as [string, number, (n: number) => void][]).map(([label, val, setter]) => (
                <div key={label}>
                  <div style={fieldLabel}>{label}</div>
                  <input type="number" value={val} onChange={e => ni(e.target.value, setter)} style={numInput} min={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Defense Arcs */}
          <div>
            <div style={sectionHead}>Defense Arcs</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {([['Fore', defFore, setDefFore], ['Aft', defAft, setDefAft], ['Port', defPort, setDefPort], ['Stbd', defStarboard, setDefStarboard]] as [string, number, (n: number) => void][]).map(([label, val, setter]) => (
                <div key={label}>
                  <div style={fieldLabel}>{label}</div>
                  <input type="number" value={val} onChange={e => ni(e.target.value, setter)} style={numInput} min={0} max={5} />
                </div>
              ))}
            </div>
          </div>

          {/* Crew & Cargo */}
          <div>
            <div style={sectionHead}>Crew &amp; Cargo</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={fieldLabel}>Crew</div>
                <input value={crew} onChange={e => setCrew(e.target.value)} style={inputStyle} placeholder="e.g. One pilot, one gunner" />
              </div>
              <div>
                <div style={fieldLabel}>Passengers</div>
                <input type="number" value={passengers} onChange={e => ni(e.target.value, setPassengers)} style={numInput} min={0} />
              </div>
              <div>
                <div style={fieldLabel}>Cargo (enc.)</div>
                <input type="number" value={encCap} onChange={e => ni(e.target.value, setEncCap)} style={numInput} min={0} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={fieldLabel}>Consumables</div>
                <input value={consumables} onChange={e => setConsumables(e.target.value)} style={inputStyle} placeholder="e.g. One month" />
              </div>
            </div>
          </div>

          {/* Weapons */}
          <div>
            <div style={sectionHead}>Weapons</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weapons.map((w, i) => (
                <div key={i} style={{ background: 'rgba(14,26,18,0.6)', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', gap: 8 }}>
                    <div>
                      <div style={fieldLabel}>Weapon Key</div>
                      <input value={w.weaponKey} onChange={e => updateWeapon(i, 'weaponKey', e.target.value)} style={inputStyle} placeholder="e.g. BLASTCANLT" />
                    </div>
                    <div>
                      <div style={fieldLabel}>Count</div>
                      <input type="number" value={w.count} onChange={e => updateWeapon(i, 'count', parseInt(e.target.value) || 1)} style={numInput} min={1} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <label style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <input type="checkbox" checked={w.turret} onChange={e => updateWeapon(i, 'turret', e.target.checked)} />
                        Turret
                      </label>
                    </div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Qualities (comma-separated, e.g. "LINKED 2, CUMBERSOME 3")</div>
                    <input value={w.qualitiesText} onChange={e => updateWeapon(i, 'qualitiesText', e.target.value)} style={inputStyle} placeholder="LINKED 2, LIMITEDAMMO 4" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => removeWeapon(i)} style={btnDanger}>✕ Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addWeapon} style={btnSmall}>+ Add Weapon</button>
            </div>
          </div>

          {/* Special Features / Abilities */}
          <div>
            <div style={sectionHead}>Special Features</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {abilities.map((a, i) => (
                <div key={i} style={{ background: 'rgba(14,26,18,0.6)', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={fieldLabel}>Name</div>
                    <input value={a.name} onChange={e => updateAbility(i, 'name', e.target.value)} style={inputStyle} placeholder="Feature name" />
                  </div>
                  <div>
                    <div style={fieldLabel}>Description</div>
                    <textarea value={a.description} onChange={e => updateAbility(i, 'description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => removeAbility(i)} style={btnDanger}>✕ Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addAbility} style={btnSmall}>+ Add Feature</button>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={sectionHead}>Description</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Background, lore, notes…"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '14px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_SM, fontWeight: 700, padding: '9px 0', borderRadius: 3, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, background: 'rgba(200,170,80,0.12)', border: `1px solid ${GOLD_DIM}`, color: GOLD, fontFamily: FR, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.1em', padding: '9px 0', borderRadius: 3, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : editId ? '✓ Save Changes' : '✓ Create Vehicle'}
          </button>
        </div>
      </div>
    </>
  )

  if (!mounted) return null
  return createPortal(modal, document.body)
}
