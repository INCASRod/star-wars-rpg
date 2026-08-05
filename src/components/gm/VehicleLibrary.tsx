'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import { fetchVehicles, vehicleToInstance, dbRowToVehicle } from '@/lib/vehicles'
import { useRefLibraryRefresh } from '@/lib/refLibraryEvents'
import { ensureEncounterForMap } from '@/lib/encounters'
import type { Vehicle } from '@/lib/vehicles'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import { toast } from 'sonner'
import { VehicleDetailPanel } from './VehicleDetailPanel'
import { VehicleEditor } from './VehicleEditor'
import { HUD, FONT_BODY, EASE, FS } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'

/* ── Design tokens ─────────────────────────────────────── */
const RAISED   = 'rgba(14,26,18,0.9)'
const INPUT_BG = 'rgba(0,0,0,0.35)'
const TEXT     = HUD.text
const DIM      = HUD.textDim
const BORDER   = HUD.border
const BORDER_HI = HUD.borderHi
const GREEN    = 'var(--state-success)'
const RED      = 'var(--state-failure)'
const BLUE     = 'var(--die-force)'

const FS_CAPTION  = 'var(--text-caption)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

/* ── Types ─────────────────────────────────────────────── */
type CategoryFilter = 'all' | 'ground' | 'starship'
type SourceFilter   = 'all' | 'oggdude' | 'custom'


interface AddCombatState {
  vehicle:   Vehicle & { _isCustom?: boolean }
  alignment: 'enemy' | 'allied_npc'
}

/* ── Helpers ───────────────────────────────────────────── */
function PillBtn({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  const c = color ?? HUD.gold
  return (
    <button onClick={onClick} style={{
      fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase' as const, padding: '0.25rem 0.75rem', borderRadius: 12,
      border: `1px solid ${active ? c : BORDER}`,
      background: active ? `${c}20` : 'transparent',
      color: active ? c : DIM, cursor: 'pointer', transition: EASE.quick,
    }}>
      {children}
    </button>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export interface VehicleLibraryProps {
  campaignId:   string
  sessionMode:  'exploration' | 'combat'
  /** When provided, switches "Add to Combat" to "Add Token" mode with a simplified alignment picker. */
  onAddToken?:  (vehicle: Vehicle & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => void
  /** When provided, passed to VehicleDetailPanel so token uploads also patch existing map_tokens rows. */
  mapId?:       string | null
}

export function VehicleLibrary({ campaignId, sessionMode, onAddToken, mapId }: VehicleLibraryProps) {
  const supabase = createClient()

  /* ── Data ────────────────────────────────────────────── */
  const [oggdude,     setOggdude]     = useState<Vehicle[]>([])
  const [custom,      setCustom]      = useState<(Vehicle & { _isCustom: true; _dbId: string })[]>([])
  const { tokenImages, setTokenImages } = useVehicleTokenImages()
  const [loading,     setLoading]     = useState(true)

  /* ── Filters ─────────────────────────────────────────── */
  const [search,         setSearch]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sourceFilter,   setSourceFilter]   = useState<SourceFilter>('all')

  /* ── UI ──────────────────────────────────────────────── */
  const [selected,      setSelected]      = useState<(Vehicle & { _isCustom?: boolean }) | null>(null)
  const [showEditor,    setShowEditor]    = useState(false)
  const [editorTemplate, setEditorTemplate] = useState<(Vehicle & { _isCustom?: boolean }) | undefined>()
  const [editorEditId,  setEditorEditId]  = useState<string | undefined>()
  const [addConfirm,      setAddConfirm]      = useState<AddCombatState | null>(null)
  const [addBusy,         setAddBusy]         = useState(false)
  const [addTokenPending, setAddTokenPending] = useState<(Vehicle & { _isCustom?: boolean }) | null>(null)

  /* ── Load ────────────────────────────────────────────── */
  // Re-runs when an editor anywhere saves a custom vehicle.
  const refLibraryTick = useRefLibraryRefresh('vehicle')
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [vehicles, customResult] = await Promise.all([
          fetchVehicles(),
          supabase.from('ref_vehicles').select('*').order('name'),
        ])
        if (cancelled) return
        setOggdude(vehicles)
        if (customResult.data) setCustom(customResult.data.map(r => dbRowToVehicle(r as Record<string, unknown>)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [refLibraryTick]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Combined list ───────────────────────────────────── */
  const allVehicles = useMemo((): (Vehicle & { _isCustom?: boolean })[] => [...oggdude, ...custom], [oggdude, custom])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allVehicles
      .filter(v => {
        if (categoryFilter === 'ground'   && v.isStarship)  return false
        if (categoryFilter === 'starship' && !v.isStarship) return false
        if (sourceFilter === 'oggdude' && v._isCustom)  return false
        if (sourceFilter === 'custom'  && !v._isCustom) return false
        if (q && !v.name.toLowerCase().includes(q) && !v.type.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allVehicles, search, categoryFilter, sourceFilter])

  /* ── Token callback ──────────────────────────────────── */
  const handleTokenUploaded = useCallback((key: string, url: string) => {
    setTokenImages(prev => ({ ...prev, [key]: url }))
    toast.success(`Token updated.`)
  }, [])

  /* ── Editor ──────────────────────────────────────────── */
  const openNew = () => {
    setEditorTemplate(undefined)
    setEditorEditId(undefined)
    setShowEditor(true)
    setSelected(null)
  }
  const openEdit = (v: Vehicle & { _isCustom?: boolean }) => {
    setEditorTemplate(v)
    setEditorEditId(v._isCustom ? (v as Vehicle & { _dbId?: string })._dbId : undefined)
    setShowEditor(true)
    setSelected(null)
  }
  const handleSaved = (saved: Vehicle & { _isCustom: true; _dbId: string }) => {
    setCustom(prev => {
      const idx = prev.findIndex(c => c._dbId === saved._dbId)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved]
    })
    setShowEditor(false)
    toast.success(`Vehicle "${saved.name}" saved.`)
  }

  /* ── Add Token flow (staging / token mode) ──────────── */
  const requestAddToken = (v: Vehicle & { _isCustom?: boolean }) => {
    setAddTokenPending(v)
    setSelected(null)
  }

  const confirmAddToken = (alignment: 'enemy' | 'allied_npc') => {
    if (!addTokenPending || !onAddToken) return
    onAddToken({ ...addTokenPending, _tokenImageUrl: tokenImages[addTokenPending.key] ?? null }, alignment)
    setAddTokenPending(null)
  }

  /* ── Add to Combat ───────────────────────────────────── */
  const requestAddToCombat = (v: Vehicle & { _isCustom?: boolean }) => {
    if (sessionMode !== 'combat') {
      toast.info('No active encounter. Start combat first, then add vehicles.')
      return
    }
    setAddConfirm({ vehicle: v, alignment: 'enemy' })
    setSelected(null)
  }

  const confirmAddToCombat = async () => {
    if (!addConfirm) return
    setAddBusy(true)
    try {
      // Per-map deck, created on demand (migration 115) — no longer requires
      // combat to be live.
      if (!mapId) { toast.error('No active map — open a map first.'); setAddConfirm(null); return }
      const enc = await ensureEncounterForMap(supabase, campaignId, mapId)
      if (!enc) { toast.error('Could not open the encounter for this map.'); setAddConfirm(null); return }

      const instance = vehicleToInstance(addConfirm.vehicle)
      const newSlot: InitiativeSlot = {
        id:                  randomUUID(),
        type:                'npc',
        alignment:           addConfirm.alignment,
        order:               (enc.initiative_slots?.length ?? 0) + 1,
        name:                addConfirm.vehicle.name,
        acted:               false,
        current:             false,
        successes:           0,
        advantages:          0,
        adversaryInstanceId: instance.instanceId,
      }

      await supabase.from('combat_encounters').update({
        adversaries:      [...(enc.adversaries ?? []), instance],
        initiative_slots: [...(enc.initiative_slots ?? []), newSlot],
        updated_at:       new Date().toISOString(),
      }).eq('id', enc.id)

      toast.success(`${addConfirm.vehicle.name} added to the encounter.`)
      setAddConfirm(null)
    } catch (err) {
      console.error('Add to combat failed', err)
      toast.error('Failed to add vehicle to encounter.')
    } finally {
      setAddBusy(false)
    }
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.08em' }}>
          Vehicle Library
        </div>
        <button
          onClick={openNew}
          style={{
            background: 'rgba(200,170,80,0.08)', border: `1px solid ${HUD.borderHi}`,
            color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.1em', padding: '0.375rem 0.875rem', borderRadius: 3, cursor: 'pointer', flexShrink: 0,
          }}
        >
          + New Vehicle
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search vehicles…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 4,
          color: TEXT, fontFamily: FONT_BODY, fontSize: FS_SM,
          padding: '0.5rem 0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {(['all', 'ground', 'starship'] as CategoryFilter[]).map(f => (
          <PillBtn key={f} active={categoryFilter === f} onClick={() => setCategoryFilter(f)}
            color={f === 'starship' ? BLUE : HUD.gold}
          >
            {f === 'all' ? 'All' : f === 'ground' ? 'Ground' : 'Starship'}
          </PillBtn>
        ))}
        <div style={{ width: 1, background: BORDER, margin: '0 0.25rem' }} />
        {([['all', 'All Sources'], ['oggdude', 'OggDude'], ['custom', 'Custom']] as [SourceFilter, string][]).map(([s, label]) => (
          <PillBtn key={s} active={sourceFilter === s} onClick={() => setSourceFilter(s)}>{label}</PillBtn>
        ))}
      </div>

      {/* Count + List */}
      {!search.trim() && sourceFilter !== 'custom' ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
          Search for a vehicle above, or select &ldquo;Custom&rdquo; to browse your vehicles.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
          Loading vehicles…
        </div>
      ) : (
        <>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>
            {search.trim()
              ? <>Showing {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} matching &ldquo;{search}&rdquo;</>
              : <>Showing {filtered.length} custom vehicle{filtered.length !== 1 ? 's' : ''}</>
            }
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
              No vehicles found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
              {filtered.map((v, idx) => (
                <VehicleRow
                  key={v.key}
                  vehicle={v}
                  tokenUrl={tokenImages[v.key]}
                  isLast={idx === filtered.length - 1}
                  onView={() => setSelected(v)}
                  onEdit={() => openEdit(v)}
                  onAddToCombat={onAddToken ? () => requestAddToken(v) : () => requestAddToCombat(v)}
                  addLabel={onAddToken ? '◈ Token' : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <VehicleDetailPanel
          vehicle={selected}
          campaignId={campaignId}
          supabase={supabase}
          tokenUrl={tokenImages[selected.key] ?? null}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
          onAddToCombat={onAddToken
            ? () => requestAddToken(selected)
            : () => requestAddToCombat(selected)
          }
          onTokenUploaded={handleTokenUploaded}
          mapId={mapId}
          addButtonLabel={onAddToken ? '◈ Add Token' : undefined}
        />
      )}

      {/* Editor */}
      {showEditor && (
        <VehicleEditor
          editId={editorEditId}
          template={editorTemplate}
          campaignId={campaignId}
          supabase={supabase}
          allVehicles={allVehicles}
          onClose={() => setShowEditor(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Add to Combat overlay */}
      {addConfirm && (
        <AddToCombatOverlay
          state={addConfirm}
          busy={addBusy}
          onChange={setAddConfirm}
          onConfirm={confirmAddToCombat}
          onCancel={() => setAddConfirm(null)}
        />
      )}

      {/* Add Token overlay (staging / token mode) */}
      {addTokenPending && (
        <AddTokenOverlay
          entityName={addTokenPending.name}
          onAdd={confirmAddToken}
          onCancel={() => setAddTokenPending(null)}
        />
      )}
    </div>
  )
}

/* ── Vehicle list row ──────────────────────────────────── */
function VehicleRow({ vehicle, tokenUrl, isLast, onView, onEdit, onAddToCombat, addLabel }: {
  vehicle: Vehicle & { _isCustom?: boolean }
  tokenUrl?: string
  isLast: boolean
  onView: () => void
  onEdit: () => void
  onAddToCombat: () => void
  /** When provided, overrides the row action button label (default '⚔ Combat'). */
  addLabel?: string
}) {
  const accentColor = vehicle.isStarship ? BLUE : HUD.gold
  const btnRowStyle: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
    fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.08em',
    padding: '0.25rem 0.625rem', borderRadius: 3, cursor: 'pointer', flexShrink: 0, transition: EASE.quick,
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem',
      background: 'transparent', borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
      flexWrap: 'wrap',
    }}>
      {/* Token */}
      <div style={{
        width: 36, height: 36, borderRadius: 4, flexShrink: 0,
        background: RAISED, border: `2px solid ${accentColor}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {tokenUrl ? (
          <img src={tokenUrl} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: FS.body }}>{vehicle.isStarship ? '🚀' : '🚗'}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 'clamp(0.82rem,1.3vw,0.95rem)', fontWeight: 700, color: TEXT }}>
            {vehicle._isCustom && <span style={{ color: HUD.gold }}>★ </span>}
            {vehicle.name}
          </span>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700,
            color: accentColor, border: `1px solid ${accentColor}`,
            borderRadius: 2, padding: '1px 5px', letterSpacing: '0.08em',
            background: `${accentColor}18`,
          }}>
            {vehicle.isStarship ? 'STARSHIP' : 'GROUND'}
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
          Sil {vehicle.silhouette} · Spd {vehicle.speed} · Armor {vehicle.armor} · Hull {vehicle.hullTrauma}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
        <button onClick={onView} className="hov-gold" style={btnRowStyle}>View</button>
        <button onClick={onEdit} className="hov-gold" style={btnRowStyle}>Edit</button>
        <button onClick={onAddToCombat} className="hov-red-bg" style={{ ...btnRowStyle, borderColor: 'rgba(224,80,80,0.3)', color: RED }}>{addLabel ?? '⚔ Combat'}</button>
      </div>
    </div>
  )
}

/* ── Add to Combat overlay ─────────────────────────────── */
function AddToCombatOverlay({ state, busy, onChange, onConfirm, onCancel }: {
  state:     AddCombatState
  busy:      boolean
  onChange:  (s: AddCombatState) => void
  onConfirm: () => void
  onCancel:  () => void
}) {
  const { vehicle, alignment } = state
  return (
    <Modal
      open
      onClose={onCancel}
      zIndex={9050}
      maxWidth={400}
      backdrop="rgba(0,0,0,0.72)"
      borderColor={BORDER_HI}
      shadow="0 16px 48px rgba(0,0,0,0.8)"
      panelBackground="rgba(8,16,10,0.97)"
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Add to Combat
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT, marginBottom: '1rem' }}>
          <span style={{ color: vehicle.isStarship ? BLUE : HUD.gold, fontWeight: 700 }}>{vehicle.name}</span>
          {' '}
          <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>
            Sil {vehicle.silhouette} · Armor {vehicle.armor} · Hull {vehicle.hullTrauma}
          </span>
        </div>

        {/* Alignment */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alignment</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['enemy', 'allied_npc'] as const).map(al => {
              const alColor = al === 'enemy' ? RED : GREEN
              const active = alignment === al
              return (
                <button key={al} onClick={() => onChange({ ...state, alignment: al })} style={{
                  flex: 1, padding: '0.5rem 0', borderRadius: 3,
                  fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.08em',
                  cursor: 'pointer', border: `1px solid ${active ? alColor : BORDER}`,
                  background: active ? `${alColor}15` : 'transparent', color: active ? alColor : DIM, transition: EASE.quick,
                }}>
                  {al === 'enemy' ? '⚔ Enemy' : '🤝 Allied NPC'}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '0.5625rem 0', borderRadius: 3, background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy} style={{ flex: 2, padding: '0.5625rem 0', borderRadius: 3, background: 'rgba(224,80,80,0.10)', border: `1px solid rgba(224,80,80,0.45)`, color: RED, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.1em', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Adding…' : '⚔ Add to Combat'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Add Token overlay (staging / token mode) ──────────── */
function AddTokenOverlay({
  entityName, onAdd, onCancel,
}: {
  entityName: string
  onAdd:      (alignment: 'enemy' | 'allied_npc') => void
  onCancel:   () => void
}) {
  return (
    <Modal
      open
      onClose={onCancel}
      zIndex={9100}
      maxWidth={360}
      backdrop="rgba(0,0,0,0.72)"
      borderColor={BORDER_HI}
      shadow="0 16px 48px rgba(0,0,0,0.8)"
      panelBackground="rgba(8,16,10,0.97)"
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Add Token
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT, marginBottom: '1.25rem' }}>
          <span style={{ fontWeight: 700 }}>{entityName}</span>
          {' '}&mdash; choose alignment:
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => onAdd('enemy')}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 4,
              fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(224,80,80,0.12)',
              border: '1px solid rgba(224,80,80,0.5)',
              color: RED, transition: EASE.quick,
            }}
          >
            ⚔ Enemy
          </button>
          <button
            onClick={() => onAdd('allied_npc')}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 4,
              fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(78,200,122,0.12)',
              border: '1px solid rgba(78,200,122,0.5)',
              color: GREEN, transition: EASE.quick,
            }}
          >
            🤝 Friendly NPC
          </button>
        </div>
        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: '0.4375rem 0', borderRadius: 4,
            background: 'transparent', border: `1px solid ${BORDER}`,
            color: DIM, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}
