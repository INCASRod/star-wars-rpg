'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useMapPlanets, type MapPlanet } from '@/hooks/useMapPlanets'
import type { ActiveMap, CrawlContent } from '@/hooks/useActiveMap'
import { HUD, FONT_BODY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const FC        = FONT_BODY
const FR        = FONT_BODY
const DIM       = HUD.textFaint
const TEXT      = HUD.text
const GREEN     = 'var(--state-success)'
const BLUE      = 'var(--state-wounds)'
const RED       = 'var(--state-failure)'
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi

const darkInput: React.CSSProperties = {
  background: 'var(--hud-surface-lo)',
  border: `1px solid ${BORDER_HI}`,
  borderRadius: RADIUS.md,
  color: TEXT,
  fontFamily: FR,
  fontSize: FS.label,
  padding: `7px 10px`,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
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
  const { planets, setPlanets } = useMapPlanets(campaignId)
  const [expandedId,          setExpandedId]          = useState<string | 'all' | 'unassigned' | null>(null)
  const [planetSearch,        setPlanetSearch]        = useState('')
  const [newPlanetOpen,       setNewPlanetOpen]       = useState(false)
  const [newPlanetName,       setNewPlanetName]       = useState('')
  const [planetBusy,          setPlanetBusy]          = useState(false)
  const [deletePlanetConfirm, setDeletePlanetConfirm] = useState<string | null>(null)

  // Opening Crawl state
  const [crawlMapId,      setCrawlMapId]      = useState<string | null>(null)
  const [crawlHeading,    setCrawlHeading]    = useState('')
  const [crawlSubheading, setCrawlSubheading] = useState('')
  const [crawlBody,       setCrawlBody]       = useState('')
  const [crawlBusy,       setCrawlBusy]       = useState(false)
  const [previousMapId,   setPreviousMapId]   = useState<string | null>(null)
  const crawlEnsuredRef = useRef(false)

  // Derive active map and crawl-active state from allMaps
  const activeMap    = allMaps.find(m => m.is_active) ?? null
  const isCrawlActive = activeMap?.map_type === 'crawl'

  // On mount: ensure the crawl map row exists and load its content
  useEffect(() => {
    if (!campaignId || crawlEnsuredRef.current) return
    crawlEnsuredRef.current = true
    let cancelled = false

    async function ensureCrawlRow() {
      const { data: rows } = await supabase
        .from('maps')
        .select('id, crawl_content')
        .eq('campaign_id', campaignId)
        .eq('map_type', 'crawl')
        .limit(1)

      if (cancelled) return

      if (rows && rows.length > 0) {
        const row = rows[0]
        setCrawlMapId(row.id as string)
        const content = row.crawl_content as CrawlContent | null
        if (content) {
          setCrawlHeading(content.heading ?? '')
          setCrawlSubheading(content.subheading ?? '')
          setCrawlBody(content.body ?? '')
        }
      } else {
        const { data: inserted } = await supabase
          .from('maps')
          .insert({
            campaign_id:           campaignId,
            name:                  'Opening Crawl',
            image_url:             '',
            grid_enabled:          false,
            grid_size:             50,
            is_active:             false,
            is_visible_to_players: false,
            map_type:              'crawl',
            crawl_content:         { heading: '', subheading: '', body: '' },
          })
          .select('id')
          .single()
        if (!cancelled && inserted) setCrawlMapId(inserted.id as string)
      }
    }

    void ensureCrawlRow()
    return () => { cancelled = true }
  }, [campaignId, supabase])

  // Crawl handlers
  async function handleSaveCrawl() {
    if (!crawlMapId || crawlBusy) return
    setCrawlBusy(true)
    await supabase
      .from('maps')
      .update({ crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody } })
      .eq('id', crawlMapId)
    setCrawlBusy(false)
  }

  async function handlePlayCrawl() {
    if (!crawlMapId || crawlBusy) return
    setCrawlBusy(true)
    // Save content first
    await supabase
      .from('maps')
      .update({ crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody } })
      .eq('id', crawlMapId)
    // Remember what was active before
    setPreviousMapId(activeMap?.id ?? null)
    // Activate crawl map (same two-query sequence as handleSetActive)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    await supabase.from('maps').update({ is_active: true, is_visible_to_players: true }).eq('id', crawlMapId)
    setCrawlBusy(false)
  }

  async function handleStopCrawl() {
    if (!crawlMapId || crawlBusy) return
    setCrawlBusy(true)
    // Hide from players
    await supabase.from('maps').update({ is_visible_to_players: false }).eq('id', crawlMapId)
    // Clear all active
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    // Restore previous map if there was one
    if (previousMapId) {
      await supabase.from('maps').update({ is_active: true }).eq('id', previousMapId)
    }
    setPreviousMapId(null)
    setCrawlBusy(false)
  }

  // Exclude the system crawl row from the regular map library
  const standardMaps = useMemo(() =>
    allMaps.filter(m => (m.map_type ?? 'standard') !== 'crawl'),
    [allMaps],
  )

  // Maps grouped by planet (crawl row excluded)
  const { mapsByPlanetId, unassignedMaps } = useMemo(() => {
    const byId: Record<string, ActiveMap[]> = {}
    const unassigned: ActiveMap[] = []
    for (const map of standardMaps) {
      if (map.planet_id) {
        byId[map.planet_id] = [...(byId[map.planet_id] ?? []), map]
      } else {
        unassigned.push(map)
      }
    }
    return { mapsByPlanetId: byId, unassignedMaps: unassigned }
  }, [standardMaps])

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
          padding: `10px 14px 10px 22px`,
          borderBottom: `1px solid ${BORDER}`,
          background: map.is_active ? 'var(--hud-surface-lo)' : 'transparent',
        }}
      >
        {/* Row: thumbnail + name + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={map.image_url}
            alt={map.name}
            style={{
              width: 46, height: 32, objectFit: 'cover', borderRadius: RADIUS.sm, flexShrink: 0,
              border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FR, fontSize: FS.label, fontWeight: 700,
              color: map.is_active ? HUD.gold : TEXT,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {map.name}
              {map.is_active && (
                <span style={{ marginLeft: 6, fontFamily: FR, fontSize: FS.overline, color: HUD.gold }}>
                  ★ ACTIVE
                </span>
              )}
            </div>
            <div style={{ fontFamily: FR, fontSize: FS.overline, color: DIM, marginTop: 1 }}>
              {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
              {map.is_visible_to_players && (
                <span style={{ marginLeft: 6, color: GREEN }}>● Visible</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: SP[1], flexShrink: 0 }}>
            {!map.is_active && (
              <button
                onClick={() => void handleSetActive(map.id)}
                disabled={busy}
                style={{
                  background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER}`,
                  color: busy ? HUD.textFaint : HUD.gold,
                  fontFamily: FR, fontSize: FS.caption, padding: `3px 8px`,
                  borderRadius: RADIUS.sm, cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >Set Active</button>
            )}
            <button
              onClick={() => setDeleteConfirm(map.id)}
              title="Delete map"
              style={{
                background: 'rgba(224,80,80,0.07)', border: '1px solid rgba(224,80,80,0.22)',
                color: RED, fontFamily: FR, fontSize: FS.label,
                padding: `2px 8px`, borderRadius: RADIUS.sm, cursor: 'pointer', lineHeight: 1,
              }}
            >×</button>
          </div>
        </div>

        {/* Planet assignment */}
        <div style={{ marginTop: SP[1], display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: FR, fontSize: FS.caption, color: DIM, flexShrink: 0 }}>Planet:</span>
          <select
            value={map.planet_id ?? ''}
            onChange={e => void handleAssignPlanet(map.id, e.target.value || null)}
            style={{
              background: 'var(--hud-surface-hi)',
              border: `1px solid ${BORDER}`,
              borderRadius: RADIUS.sm,
              color: map.planet_id ? TEXT : DIM,
              fontFamily: FR,
              fontSize: FS.caption,
              padding: `2px 4px`,
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
              marginTop: 6, width: '100%', padding: `4px 0`, borderRadius: RADIUS.sm, border: 'none',
              background: map.is_visible_to_players ? 'rgba(78,200,122,0.12)' : 'var(--hud-surface-lo)',
              color: map.is_visible_to_players ? GREEN : DIM,
              fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              letterSpacing: '0.06em', cursor: 'pointer', transition: EASE.default,
            }}
          >
            {map.is_visible_to_players ? '◉ Visible to players' : '◯ Hidden from players'}
          </button>
        )}

        {/* Delete confirm */}
        {deleteConfirm === map.id && (
          <div style={{
            marginTop: SP[2], padding: `8px 10px`, borderRadius: RADIUS.md,
            background: 'rgba(224,80,80,0.08)', border: '1px solid rgba(224,80,80,0.3)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontFamily: FR, fontSize: FS.caption, color: RED }}>
              Delete &quot;{map.name}&quot;? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: `4px 0`, borderRadius: RADIUS.sm,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, fontFamily: FR, fontSize: FS.caption, cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={() => void handleDelete(map.id)}
                style={{
                  flex: 2, padding: `4px 0`, borderRadius: RADIUS.sm,
                  background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)',
                  color: RED, fontFamily: FR, fontSize: FS.caption, fontWeight: 700, cursor: 'pointer',
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

      {/* ── Opening Crawl ────────────────────────────────── */}
      <div style={{
        padding: `10px 14px`,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', gap: SP[2],
      }}>
        <div style={{
          fontFamily: FR, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: DIM,
        }}>
          Opening Crawl
        </div>

        {/* Compose form */}
        <input
          value={crawlHeading}
          onChange={e => setCrawlHeading(e.target.value)}
          placeholder="Heading (e.g. Episode IV)"
          style={darkInput}
        />
        <input
          value={crawlSubheading}
          onChange={e => setCrawlSubheading(e.target.value)}
          placeholder="Sub-heading (e.g. A NEW HOPE)"
          style={darkInput}
        />
        <textarea
          value={crawlBody}
          onChange={e => setCrawlBody(e.target.value)}
          placeholder="Crawl body text…"
          rows={5}
          style={{ ...darkInput, resize: 'vertical' }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: SP[2] }}>
          <button
            onClick={() => void handleSaveCrawl()}
            disabled={crawlBusy || !crawlMapId}
            style={{
              flex: 1, padding: `6px 0`, borderRadius: RADIUS.md,
              background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER_HI}`,
              color: TEXT, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              opacity: (crawlBusy || !crawlMapId) ? 0.45 : 1,
            }}
          >
            Save Crawl
          </button>
          {isCrawlActive ? (
            <button
              onClick={() => void handleStopCrawl()}
              disabled={crawlBusy}
              style={{
                flex: 1, padding: `6px 0`, borderRadius: RADIUS.md,
                background: `color-mix(in srgb, ${RED} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
                color: RED, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                opacity: crawlBusy ? 0.45 : 1,
              }}
            >
              Stop Crawl
            </button>
          ) : (
            <button
              onClick={() => void handlePlayCrawl()}
              disabled={crawlBusy || !crawlMapId || (!crawlHeading.trim() && !crawlSubheading.trim() && !crawlBody.trim())}
              style={{
                flex: 1, padding: `6px 0`, borderRadius: RADIUS.md,
                background: `color-mix(in srgb, ${GREEN} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${GREEN} 40%, transparent)`,
                color: GREEN, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                opacity: (crawlBusy || !crawlMapId || (!crawlHeading.trim() && !crawlSubheading.trim() && !crawlBody.trim())) ? 0.45 : 1,
              }}
            >
              Play Opening
            </button>
          )}
        </div>
      </div>

      {/* ── Top bar: search + new planet + upload ─────────── */}
      <div style={{
        padding: `10px 14px`,
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
          <div style={{ display: 'flex', gap: SP[1] }}>
            <input
              value={newPlanetName}
              onChange={e => setNewPlanetName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleCreatePlanet(); if (e.key === 'Escape') { setNewPlanetOpen(false); setNewPlanetName('') } }}
              placeholder="Planet name…"
              autoFocus
              style={{ ...darkInput, flex: 1, padding: `5px 8px` }}
            />
            <button
              onClick={() => void handleCreatePlanet()}
              disabled={planetBusy || !newPlanetName.trim()}
              style={{
                background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER_HI}`,
                color: HUD.gold, fontFamily: FR, fontSize: FS.sm, fontWeight: 700,
                padding: `0 10px`, borderRadius: RADIUS.md, cursor: 'pointer',
                opacity: (!newPlanetName.trim() || planetBusy) ? 0.45 : 1,
              }}
            >✓</button>
            <button
              onClick={() => { setNewPlanetOpen(false); setNewPlanetName('') }}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: DIM, fontFamily: FR, fontSize: FS.sm,
                padding: `0 8px`, borderRadius: RADIUS.md, cursor: 'pointer',
              }}
            >×</button>
          </div>
        ) : (
          /* Action buttons */
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setNewPlanetOpen(true)}
              style={{
                flex: 1, padding: `6px 0`, borderRadius: RADIUS.md,
                background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)', border: `1px solid var(--hud-accent-border)`,
                color: BLUE, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >⊕ New Planet</button>
            <button
              onClick={() => setUploadOpen(true)}
              style={{
                flex: 1, padding: `6px 0`, borderRadius: RADIUS.md,
                background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER}`,
                color: HUD.gold, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >↑ Upload Map</button>
          </div>
        )}
      </div>

      {/* ── All Maps folder ───────────────────────────────── */}
      <FolderRow
        label="All Maps"
        count={standardMaps.length}
        expanded={expandedId === 'all'}
        onToggle={() => toggleExpand('all')}
      />
      {expandedId === 'all' && (
        standardMaps.length === 0
          ? <FolderEmpty label="No maps uploaded yet." />
          : renderMaps(standardMaps)
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
              padding: `8px 14px`,
              background: 'rgba(224,80,80,0.06)',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ fontFamily: FR, fontSize: FS.caption, color: RED, marginBottom: 6 }}>
                Delete &quot;{planet.name}&quot;? Maps will become unassigned.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setDeletePlanetConfirm(null)}
                  style={{
                    flex: 1, padding: `4px 0`, borderRadius: RADIUS.sm,
                    background: 'transparent', border: `1px solid ${BORDER}`,
                    color: DIM, fontFamily: FR, fontSize: FS.caption, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={() => void handleDeletePlanet(planet.id)}
                  style={{
                    flex: 2, padding: `4px 0`, borderRadius: RADIUS.sm,
                    background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)',
                    color: RED, fontFamily: FR, fontSize: FS.caption, fontWeight: 700, cursor: 'pointer',
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
        <div style={{ padding: `12px 14px`, fontFamily: FR, fontSize: FS.caption, color: DIM }}>
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
        display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `9px 14px`,
        borderBottom: `1px solid ${HUD.border}`,
        background: expanded ? 'var(--hud-surface-lo)' : hovered ? 'var(--hud-surface-lo)' : 'transparent',
        cursor: 'pointer',
        transition: `background ${EASE.default}`,
        userSelect: 'none',
      }}
    >
      <span style={{ color: expanded ? HUD.gold : HUD.textFaint, fontSize: 9, flexShrink: 0, lineHeight: 1 }}>
        {expanded ? '▾' : '▶'}
      </span>
      <span style={{
        fontFamily: FC, fontSize: FS.caption, fontWeight: 700,
        color: expanded ? HUD.gold : HUD.text,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint, flexShrink: 0 }}>
        {count}
      </span>
      {onDelete && (hovered || expanded) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title={`Delete ${label}`}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(224,80,80,0.55)', fontSize: 15, lineHeight: 1,
            padding: `0 2px`, flexShrink: 0, marginLeft: 2,
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
      padding: `12px 22px`,
      fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint,
      borderBottom: `1px solid ${HUD.border}`,
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
        position: 'fixed', inset: 0, zIndex: Z.tooltip,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--hud-surface-hi)', border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.lg,
          padding: SP[6], width: '100%', maxWidth: 440,
          display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FC, fontSize: FS.h4, color: HUD.gold }}>Upload New Map</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: HUD.textFaint, fontSize: FS.h4, lineHeight: 1 }}>×</button>
        </div>

        {/* Map name */}
        <div>
          <div style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Map Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tatooine Cantina"
            style={darkInput}
          />
        </div>

        {/* Planet assignment */}
        <div>
          <div style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Planet (optional)</div>
          <select
            value={planetId}
            onChange={e => setPlanetId(e.target.value)}
            style={{
              ...darkInput,
              cursor: 'pointer',
              color: planetId ? HUD.text : HUD.textFaint,
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
          <div style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Image (JPG / PNG / WebP, max 10 MB)</div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            style={{ ...darkInput, padding: `5px 8px` }}
          />
          {file && (
            <div style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint, marginTop: SP[1] }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: SP[2], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={e => setGridEnabled(e.target.checked)}
              style={{ accentColor: HUD.gold }}
            />
            <span style={{ fontFamily: FR, fontSize: FS.label, color: HUD.text }}>Grid overlay</span>
          </label>
          {gridEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ fontFamily: FR, fontSize: FS.caption, color: HUD.textFaint }}>Cell size (px)</span>
              <input
                type="number"
                value={gridSize}
                onChange={e => setGridSize(Math.max(10, Number(e.target.value)))}
                style={{ ...darkInput, width: 64, textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        {err && <div style={{ fontFamily: FR, fontSize: FS.caption, color: RED }}>{err}</div>}

        <div style={{ display: 'flex', gap: SP[2], justifyContent: 'flex-end', marginTop: SP[1] }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${HUD.border}`,
              color: HUD.textFaint, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              padding: `6px 14px`, borderRadius: RADIUS.md, cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={() => void handleSave()}
            disabled={busy}
            style={{
              background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
              color: HUD.gold, fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              padding: `6px 14px`, borderRadius: RADIUS.md,
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
