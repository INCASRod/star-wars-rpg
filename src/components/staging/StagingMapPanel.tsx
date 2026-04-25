'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'

/* ── Design tokens ────────────────────────────────────────── */
const FC        = "var(--font-cinzel), 'Cinzel', serif"
const FR        = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD      = '#C8AA50'
const DIM       = '#6A8070'
const TEXT      = '#C8D8C0'
const GREEN     = '#4EC87A'
const BLUE      = '#7AB4E0'
const RED       = '#E05050'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const PANEL_BG  = 'rgba(8,16,10,0.95)'
const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

const darkInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER_HI}`,
  borderRadius: 4,
  color: TEXT,
  fontFamily: FR,
  fontSize: FS_LABEL,
  padding: '7px 10px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

/* ── Types ────────────────────────────────────────────────── */
export interface MapPlanet {
  id: string
  campaign_id: string
  name: string
  created_at: string
}

/* ── Props ────────────────────────────────────────────────── */
export interface StagingMapPanelProps {
  campaignId:  string
  allMaps:     ActiveMap[]
  onDeleteMap: (mapId: string) => void
}

/* ── Main panel ───────────────────────────────────────────── */
export function StagingMapPanel({ campaignId, allMaps, onDeleteMap }: StagingMapPanelProps) {
  const supabase = useMemo(() => createClient(), [])

  // Map actions
  const [busy,          setBusy]          = useState(false)
  const [uploadOpen,    setUploadOpen]     = useState(false)
  const [deleteConfirm, setDeleteConfirm]  = useState<string | null>(null)

  // Planet state
  const [planets,             setPlanets]             = useState<MapPlanet[]>([])
  const [expandedId,          setExpandedId]          = useState<string | 'all' | 'unassigned' | null>(null)
  const [planetSearch,        setPlanetSearch]        = useState('')
  const [newPlanetOpen,       setNewPlanetOpen]       = useState(false)
  const [newPlanetName,       setNewPlanetName]       = useState('')
  const [planetBusy,          setPlanetBusy]          = useState(false)
  const [deletePlanetConfirm, setDeletePlanetConfirm] = useState<string | null>(null)

  // Load planets + realtime
  useEffect(() => {
    supabase.from('map_planets').select('*').eq('campaign_id', campaignId).order('name')
      .then(({ data }) => { if (data) setPlanets(data as MapPlanet[]) })

    const ch = supabase.channel(`map-planets-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'map_planets',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlanets(prev => [...prev, payload.new as MapPlanet].sort((a, b) => a.name.localeCompare(b.name)))
        } else if (payload.eventType === 'UPDATE') {
          setPlanets(prev => prev.map(p => p.id === (payload.new as MapPlanet).id ? payload.new as MapPlanet : p))
        } else if (payload.eventType === 'DELETE') {
          setPlanets(prev => prev.filter(p => p.id !== (payload.old as MapPlanet).id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Maps grouped by planet
  const { mapsByPlanetId, unassignedMaps } = useMemo(() => {
    const byId: Record<string, ActiveMap[]> = {}
    const unassigned: ActiveMap[] = []
    for (const map of allMaps) {
      if (map.planet_id) {
        byId[map.planet_id] = [...(byId[map.planet_id] ?? []), map]
      } else {
        unassigned.push(map)
      }
    }
    return { mapsByPlanetId: byId, unassignedMaps: unassigned }
  }, [allMaps])

  // Planet search filter (only filters named planet rows; All / Unassigned always shown)
  const filteredPlanets = useMemo(() =>
    planetSearch.trim()
      ? planets.filter(p => p.name.toLowerCase().includes(planetSearch.toLowerCase()))
      : planets,
    [planets, planetSearch],
  )

  // ── Planet CRUD ──────────────────────────────────────────
  async function handleCreatePlanet() {
    if (!newPlanetName.trim() || planetBusy) return
    setPlanetBusy(true)
    await supabase.from('map_planets').insert({ campaign_id: campaignId, name: newPlanetName.trim() })
    setNewPlanetName('')
    setNewPlanetOpen(false)
    setPlanetBusy(false)
  }

  async function handleDeletePlanet(planetId: string) {
    await supabase.from('map_planets').delete().eq('id', planetId)
    setDeletePlanetConfirm(null)
    if (expandedId === planetId) setExpandedId(null)
  }

  async function handleAssignPlanet(mapId: string, planetId: string | null) {
    await supabase.from('maps').update({ planet_id: planetId }).eq('id', mapId)
  }

  // ── Map CRUD ─────────────────────────────────────────────
  async function handleSetActive(mapId: string) {
    if (busy) return
    setBusy(true)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    await supabase.from('maps').update({ is_active: true }).eq('id', mapId)
    setBusy(false)
  }

  async function handleToggleVisible(map: ActiveMap) {
    await supabase.from('maps').update({ is_visible_to_players: !map.is_visible_to_players }).eq('id', map.id)
  }

  async function handleDelete(mapId: string) {
    const { error } = await supabase.from('maps').delete().eq('id', mapId)
    if (!error) { onDeleteMap(mapId); setDeleteConfirm(null) }
  }

  function toggleExpand(id: string | 'all' | 'unassigned') {
    setExpandedId(prev => prev === id ? null : id)
  }

  // ── Shared map row ────────────────────────────────────────
  function renderMaps(maps: ActiveMap[]) {
    return maps.map(map => (
      <div
        key={map.id}
        style={{
          padding: '10px 14px 10px 22px',
          borderBottom: `1px solid ${BORDER}`,
          background: map.is_active ? 'rgba(200,170,80,0.04)' : 'transparent',
        }}
      >
        {/* Row: thumbnail + name + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={map.image_url}
            alt={map.name}
            style={{
              width: 46, height: 32, objectFit: 'cover', borderRadius: 3, flexShrink: 0,
              border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700,
              color: map.is_active ? GOLD : TEXT,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {map.name}
              {map.is_active && (
                <span style={{ marginLeft: 6, fontFamily: FR, fontSize: FS_OVERLINE, color: GOLD }}>
                  ★ ACTIVE
                </span>
              )}
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, marginTop: 1 }}>
              {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
              {map.is_visible_to_players && (
                <span style={{ marginLeft: 6, color: GREEN }}>● Visible</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {!map.is_active && (
              <button
                onClick={() => void handleSetActive(map.id)}
                disabled={busy}
                style={{
                  background: 'rgba(200,170,80,0.08)', border: `1px solid rgba(200,170,80,0.25)`,
                  color: busy ? 'rgba(200,170,80,0.3)' : GOLD,
                  fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 8px',
                  borderRadius: 3, cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >Set Active</button>
            )}
            <button
              onClick={() => setDeleteConfirm(map.id)}
              title="Delete map"
              style={{
                background: 'rgba(224,80,80,0.07)', border: '1px solid rgba(224,80,80,0.22)',
                color: RED, fontFamily: FR, fontSize: FS_LABEL,
                padding: '2px 8px', borderRadius: 3, cursor: 'pointer', lineHeight: 1,
              }}
            >×</button>
          </div>
        </div>

        {/* Planet assignment */}
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Planet:</span>
          <select
            value={map.planet_id ?? ''}
            onChange={e => void handleAssignPlanet(map.id, e.target.value || null)}
            style={{
              background: 'rgba(6,13,9,0.8)',
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              color: map.planet_id ? TEXT : DIM,
              fontFamily: FR,
              fontSize: FS_CAPTION,
              padding: '2px 4px',
              flex: 1,
              minWidth: 0,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">— none —</option>
            {planets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Visibility toggle (active map only) */}
        {map.is_active && (
          <button
            onClick={() => void handleToggleVisible(map)}
            style={{
              marginTop: 6, width: '100%', padding: '4px 0', borderRadius: 3, border: 'none',
              background: map.is_visible_to_players ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)',
              color: map.is_visible_to_players ? GREEN : DIM,
              fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
              letterSpacing: '0.06em', cursor: 'pointer', transition: '.15s',
            }}
          >
            {map.is_visible_to_players ? '◉ Visible to players' : '◯ Hidden from players'}
          </button>
        )}

        {/* Delete confirm */}
        {deleteConfirm === map.id && (
          <div style={{
            marginTop: 8, padding: '8px 10px', borderRadius: 4,
            background: 'rgba(224,80,80,0.08)', border: '1px solid rgba(224,80,80,0.3)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: RED }}>
              Delete &quot;{map.name}&quot;? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '4px 0', borderRadius: 3,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={() => void handleDelete(map.id)}
                style={{
                  flex: 2, padding: '4px 0', borderRadius: 3,
                  background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)',
                  color: RED, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, cursor: 'pointer',
                }}
              >✕ Delete</button>
            </div>
          </div>
        )}
      </div>
    ))
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar: search + new planet + upload ─────────── */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        <input
          value={planetSearch}
          onChange={e => setPlanetSearch(e.target.value)}
          placeholder="Search planets…"
          style={darkInput}
        />

        {newPlanetOpen ? (
          /* Inline create form */
          <div style={{ display: 'flex', gap: 5 }}>
            <input
              value={newPlanetName}
              onChange={e => setNewPlanetName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleCreatePlanet(); if (e.key === 'Escape') { setNewPlanetOpen(false); setNewPlanetName('') } }}
              placeholder="Planet name…"
              autoFocus
              style={{ ...darkInput, flex: 1, padding: '5px 8px' }}
            />
            <button
              onClick={() => void handleCreatePlanet()}
              disabled={planetBusy || !newPlanetName.trim()}
              style={{
                background: 'rgba(200,170,80,0.1)', border: `1px solid rgba(200,170,80,0.35)`,
                color: GOLD, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
                padding: '0 10px', borderRadius: 4, cursor: 'pointer',
                opacity: (!newPlanetName.trim() || planetBusy) ? 0.45 : 1,
              }}
            >✓</button>
            <button
              onClick={() => { setNewPlanetOpen(false); setNewPlanetName('') }}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: DIM, fontFamily: FR, fontSize: FS_SM,
                padding: '0 8px', borderRadius: 4, cursor: 'pointer',
              }}
            >×</button>
          </div>
        ) : (
          /* Action buttons */
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setNewPlanetOpen(true)}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 4,
                background: 'rgba(90,140,200,0.07)', border: `1px solid rgba(90,140,200,0.25)`,
                color: BLUE, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >⊕ New Planet</button>
            <button
              onClick={() => setUploadOpen(true)}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 4,
                background: 'rgba(200,170,80,0.08)', border: `1px solid rgba(200,170,80,0.3)`,
                color: GOLD, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >↑ Upload Map</button>
          </div>
        )}
      </div>

      {/* ── All Maps folder ───────────────────────────────── */}
      <FolderRow
        label="All Maps"
        count={allMaps.length}
        expanded={expandedId === 'all'}
        onToggle={() => toggleExpand('all')}
      />
      {expandedId === 'all' && (
        allMaps.length === 0
          ? <FolderEmpty label="No maps uploaded yet." />
          : renderMaps(allMaps)
      )}

      {/* ── Named planet folders ──────────────────────────── */}
      {filteredPlanets.map(planet => (
        <div key={planet.id}>
          <FolderRow
            label={planet.name}
            count={mapsByPlanetId[planet.id]?.length ?? 0}
            expanded={expandedId === planet.id}
            onToggle={() => toggleExpand(planet.id)}
            onDelete={() => setDeletePlanetConfirm(planet.id)}
          />

          {/* Delete planet confirm */}
          {deletePlanetConfirm === planet.id && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(224,80,80,0.06)',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: RED, marginBottom: 6 }}>
                Delete &quot;{planet.name}&quot;? Maps will become unassigned.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setDeletePlanetConfirm(null)}
                  style={{
                    flex: 1, padding: '4px 0', borderRadius: 3,
                    background: 'transparent', border: `1px solid ${BORDER}`,
                    color: DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={() => void handleDeletePlanet(planet.id)}
                  style={{
                    flex: 2, padding: '4px 0', borderRadius: 3,
                    background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)',
                    color: RED, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, cursor: 'pointer',
                  }}
                >✕ Delete Planet</button>
              </div>
            </div>
          )}

          {expandedId === planet.id && (
            (mapsByPlanetId[planet.id]?.length ?? 0) === 0
              ? <FolderEmpty label="No maps in this planet yet." />
              : renderMaps(mapsByPlanetId[planet.id] ?? [])
          )}
        </div>
      ))}

      {/* No search results */}
      {planetSearch.trim() && filteredPlanets.length === 0 && (
        <div style={{ padding: '12px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
          No planets match &quot;{planetSearch}&quot;.
        </div>
      )}

      {/* ── Unassigned folder ─────────────────────────────── */}
      <FolderRow
        label="Unassigned"
        count={unassignedMaps.length}
        expanded={expandedId === 'unassigned'}
        onToggle={() => toggleExpand('unassigned')}
      />
      {expandedId === 'unassigned' && (
        unassignedMaps.length === 0
          ? <FolderEmpty label="All maps are assigned to a planet." />
          : renderMaps(unassignedMaps)
      )}

      {uploadOpen && (
        <MapUploadModal
          campaignId={campaignId}
          planets={planets}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  )
}

/* ── Folder row ───────────────────────────────────────────── */
interface FolderRowProps {
  label:    string
  count:    number
  expanded: boolean
  onToggle: () => void
  onDelete?: () => void
}

function FolderRow({ label, count, expanded, onToggle, onDelete }: FolderRowProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px',
        borderBottom: `1px solid ${BORDER}`,
        background: expanded ? 'rgba(200,170,80,0.05)' : hovered ? 'rgba(200,170,80,0.02)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
    >
      <span style={{ color: expanded ? GOLD : DIM, fontSize: 9, flexShrink: 0, lineHeight: 1 }}>
        {expanded ? '▾' : '▶'}
      </span>
      <span style={{
        fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
        color: expanded ? GOLD : TEXT,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>
        {count}
      </span>
      {onDelete && (hovered || expanded) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title={`Delete ${label}`}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(224,80,80,0.55)', fontSize: 15, lineHeight: 1,
            padding: '0 2px', flexShrink: 0, marginLeft: 2,
          }}
        >×</button>
      )}
    </div>
  )
}

/* ── Empty folder message ─────────────────────────────────── */
function FolderEmpty({ label }: { label: string }) {
  return (
    <div style={{
      padding: '12px 22px',
      fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {label}
    </div>
  )
}

/* ── Upload modal ─────────────────────────────────────────── */
interface MapUploadModalProps {
  campaignId: string
  planets:    MapPlanet[]
  onClose:    () => void
}

function MapUploadModal({ campaignId, planets, onClose }: MapUploadModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const [name,        setName]        = useState('')
  const [planetId,    setPlanetId]    = useState<string>('')
  const [file,        setFile]        = useState<File | null>(null)
  const [gridEnabled, setGridEnabled] = useState(false)
  const [gridSize,    setGridSize]    = useState(50)
  const [busy,        setBusy]        = useState(false)
  const [err,         setErr]         = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim() || !file) { setErr('Name and image are required.'); return }
    if (file.size > 10 * 1024 * 1024) { setErr('Image must be under 10 MB.'); return }
    setBusy(true); setErr(null)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${campaignId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('maps').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('maps').getPublicUrl(path)
      await supabase.from('maps').insert({
        campaign_id:           campaignId,
        name:                  name.trim(),
        image_url:             urlData.publicUrl,
        grid_enabled:          gridEnabled,
        grid_size:             gridSize,
        is_active:             false,
        is_visible_to_players: false,
        planet_id:             planetId || null,
      })
      onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally { setBusy(false) }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderRadius: 8,
          padding: 24, width: '100%', maxWidth: 440,
          display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD }}>Upload New Map</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_H4, lineHeight: 1 }}>×</button>
        </div>

        {/* Map name */}
        <div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 4 }}>Map Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tatooine Cantina"
            style={darkInput}
          />
        </div>

        {/* Planet assignment */}
        <div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 4 }}>Planet (optional)</div>
          <select
            value={planetId}
            onChange={e => setPlanetId(e.target.value)}
            style={{
              ...darkInput,
              cursor: 'pointer',
              color: planetId ? TEXT : DIM,
            }}
          >
            <option value="">— none —</option>
            {planets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Image */}
        <div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 4 }}>Image (JPG / PNG / WebP, max 10 MB)</div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            style={{ ...darkInput, padding: '5px 8px' }}
          />
          {file && (
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 4 }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={e => setGridEnabled(e.target.checked)}
              style={{ accentColor: GOLD }}
            />
            <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT }}>Grid overlay</span>
          </label>
          {gridEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>Cell size (px)</span>
              <input
                type="number"
                value={gridSize}
                onChange={e => setGridSize(Math.max(10, Number(e.target.value)))}
                style={{ ...darkInput, width: 64, textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        {err && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: RED }}>{err}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: DIM, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
              padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={() => void handleSave()}
            disabled={busy}
            style={{
              background: 'rgba(200,170,80,0.1)', border: `1px solid rgba(200,170,80,0.35)`,
              color: GOLD, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
              padding: '6px 14px', borderRadius: 4,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >{busy ? 'Uploading…' : '↑ Upload Map'}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
