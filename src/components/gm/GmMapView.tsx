'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'
import type { MapToken } from '@/hooks/useMapTokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { useMapTokens } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { AdversaryInstance } from '@/lib/adversaries'

/* ── Design tokens ─────────────────────────────────────── */
const FR  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FC  = "var(--font-cinzel), 'Cinzel', serif"
const BG  = '#060D09'
const GOLD = '#C8AA50'
const DIM  = '#6A8070'
const TEXT = '#C8D8C0'
const GREEN = '#4EC87A'
const PANEL_BG  = 'rgba(6,13,9,0.97)'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

const btnTool: React.CSSProperties = {
  background: 'rgba(6,13,9,0.92)',
  border: `1px solid rgba(200,170,80,0.35)`,
  color: GOLD,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 13px',
  borderRadius: 4,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  whiteSpace: 'nowrap',
}

const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.10)',
  border: `1px solid rgba(224,80,80,0.35)`,
  color: '#E05050',
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  padding: '4px 9px',
  borderRadius: 3,
  cursor: 'pointer',
  flexShrink: 0,
}

const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)',
  border: `1px solid rgba(200,170,80,0.3)`,
  color: GOLD,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '3px 9px',
  borderRadius: 3,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${BORDER_HI}`,
  color: TEXT,
  fontFamily: FR,
  padding: '6px 10px',
  borderRadius: 3,
  outline: 'none',
  fontSize: FS_SM,
  width: '100%',
  boxSizing: 'border-box',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FR,
  fontSize: FS_OVERLINE,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(200,170,80,0.5)',
  marginBottom: 4,
}

/* ── Types ─────────────────────────────────────────────── */
interface NpcDrawerSlot {
  slotId: string
  adversaryInstanceId: string
  name: string
  adversaryType: 'minion' | 'rival' | 'nemesis'
}

interface VehicleDrawerSlot {
  slotId:            string
  vehicleInstanceId: string
  name:              string
  alignment:         'enemy' | 'allied_npc'
  token_image_url:   string | null
}

interface EncounterRow {
  id: string
  is_active: boolean
  initiative_slots: Array<{
    id: string
    type: 'pc' | 'npc'
    name: string
    adversaryInstanceId?: string
    vehicleInstanceId?: string
  }>
  adversaries: Array<{
    instanceId: string
    type: 'minion' | 'rival' | 'nemesis'
    name?: string
    characteristics?: { brawn: number; agility: number; intellect: number; cunning: number; willpower: number; presence: number }
    soak?: number
    defense?: { melee: number; ranged: number }
    woundThreshold?: number
    woundsCurrent?: number
    strainThreshold?: number
    strainCurrent?: number
    groupSize?: number
    groupRemaining?: number
  }>
  vehicles: Array<{
    instanceId: string
    name: string
    alignment: 'enemy' | 'allied_npc'
    token_image_url?: string | null
  }>
}

interface AdversaryTokenImage {
  adversary_key: string
  token_image_url: string
}

interface ContextMenuState {
  tokenId:   string
  x:         number
  y:         number
  isVisible: boolean
}

interface TooltipState {
  tokenId: string
  x:       number
  y:       number
}

interface MapPlanet {
  id: string
  campaign_id: string
  name: string
  created_at: string
}

/* ── Upload modal ──────────────────────────────────────── */
function UploadModal({ campaignId, planets, onClose, onSaved }: { campaignId: string; planets: MapPlanet[]; onClose: () => void; onSaved: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName]               = useState('')
  const [planetId, setPlanetId]       = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [gridEnabled, setGridEnabled] = useState(false)
  const [gridSize, setGridSize]       = useState(50)
  const [busy, setBusy]               = useState(false)
  const [err, setErr]                 = useState<string | null>(null)

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
      onSaved(); onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally { setBusy(false) }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderRadius: 8, padding: 24, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD }}>Upload New Map</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_H4 }}>×</button>
        </div>
        <div>
          <div style={fieldLabel}>Map Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tatooine Cantina" style={darkInput} />
        </div>
        {planets.length > 0 && (
          <div>
            <div style={fieldLabel}>Planet (optional)</div>
            <select
              value={planetId}
              onChange={e => setPlanetId(e.target.value)}
              style={{ ...darkInput, cursor: 'pointer', color: planetId ? TEXT : DIM }}
            >
              <option value="">— none —</option>
              {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <div style={fieldLabel}>Image (JPG / PNG / WebP, max 10 MB)</div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ ...darkInput, padding: '5px 8px' }} />
          {file && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 4 }}>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={gridEnabled} onChange={e => setGridEnabled(e.target.checked)} style={{ accentColor: GOLD }} />
            <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT }}>Grid overlay</span>
          </label>
          {gridEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>Cell size (px)</span>
              <input type="number" value={gridSize} onChange={e => setGridSize(Math.max(10, Number(e.target.value)))} style={{ ...darkInput, width: 64, textAlign: 'center' }} />
            </div>
          )}
        </div>
        {err && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050' }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={{ ...btnTool, color: DIM, border: `1px solid ${BORDER}` }}>Cancel</button>
          <button onClick={handleSave} disabled={busy} style={{ ...btnTool, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Uploading…' : '↑ Upload Map'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── Main view ─────────────────────────────────────────── */
export interface GmMapViewProps {
  campaignId:          string | null
  characters:          Character[]
  allMaps:             ActiveMap[]
  activeMap:           ActiveMap | null
  onDeleteMap:         (mapId: string) => void
  /** When true, hides the internal floating toolbar (Maps/Upload/Tokens buttons).
   *  The staging tab provides its own pill toolbar instead. */
  isStagingTab?:            boolean
  /** When isStagingTab is true, controls the map library drawer from outside. */
  stagingLibraryOpen?:      boolean
  /** Called when the close button inside the library drawer is clicked (staging only). */
  onStagingLibraryClose?:   () => void
  /** Shared token state lifted to page level — avoids dual hook instances causing stale canvas. */
  stagingTokens?:              MapToken[]
  onStagingMoveToken?:         (id: string, x: number, y: number) => Promise<void>
  onStagingToggleVisibility?:  (id: string, visible: boolean) => Promise<void>
  onStagingRemoveToken?:       (id: string) => Promise<void>
  onStagingAddToken?:          (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
}

export function GmMapView({ campaignId, characters, allMaps, activeMap, onDeleteMap, isStagingTab, stagingLibraryOpen, onStagingLibraryClose, stagingTokens, onStagingMoveToken, onStagingToggleVisibility, onStagingRemoveToken, onStagingAddToken }: GmMapViewProps) {
  const supabase = useMemo(() => createClient(), [])

  const router = useRouter()

  const [mounted,          setMounted]          = useState(false)
  const [uploadOpen,       setUploadOpen]       = useState(false)
  const [libraryOpen,      setLibraryOpen]      = useState(false)

  // Planet state
  const [planets,             setPlanets]             = useState<MapPlanet[]>([])
  const [expandedPlanet,      setExpandedPlanet]      = useState<string | 'all' | 'unassigned' | null>(null)
  const [planetSearch,        setPlanetSearch]        = useState('')
  const [newPlanetOpen,       setNewPlanetOpen]       = useState(false)
  const [newPlanetName,       setNewPlanetName]       = useState('')
  const [planetBusy,          setPlanetBusy]          = useState(false)
  const [deletePlanetConfirm, setDeletePlanetConfirm] = useState<string | null>(null)
  const [tokenDrawerOpen,  setTokenDrawerOpen]  = useState(false)
  const [contextMenu,      setContextMenu]      = useState<ContextMenuState | null>(null)
  const [tooltipState,     setTooltipState]     = useState<TooltipState | null>(null)
  const isDraggingRef = useRef(false)
  const [encounter,        setEncounter]        = useState<EncounterRow | null>(null)
  const [previewMap,       setPreviewMap]       = useState<ActiveMap | null>(null)
  const [advTokens,        setAdvTokens]        = useState<AdversaryTokenImage[]>([])
  const [busy,             setBusy]             = useState(false)
  const [advTokenBusy,     setAdvTokenBusy]     = useState<string | null>(null)
  const [advStatCache,     setAdvStatCache]     = useState<Map<string, AdversaryInstance>>(new Map())
  // token_scale lives on the maps row; realtime propagates it to all clients automatically
  const tokenScale = activeMap?.token_scale ?? 1.0

  const adjustTokenScale = useCallback((delta: number) => {
    if (!activeMap) return
    const next = Math.round(Math.max(0.25, Math.min(3.0, (activeMap.token_scale ?? 1) + delta)) * 100) / 100
    supabase.from('maps').update({ token_scale: next }).eq('id', activeMap.id)
      .then(({ error }) => { if (error) console.warn('[token scale]', error.message) })
  }, [activeMap, supabase])

  // When staging tab passes its own token state, use it — avoids dual subscriptions causing stale canvas
  const { tokens: hookTokens, moveToken: hookMoveToken, toggleVisibility: hookToggleVisibility, removeToken: hookRemoveToken, addToken: hookAddToken } = useMapTokens(isStagingTab ? null : (activeMap?.id ?? null))
  const tokens          = isStagingTab ? (stagingTokens ?? [])           : hookTokens
  const moveToken       = isStagingTab ? (onStagingMoveToken       ?? hookMoveToken)       : hookMoveToken
  const toggleVisibility = isStagingTab ? (onStagingToggleVisibility ?? hookToggleVisibility) : hookToggleVisibility
  const removeToken     = isStagingTab ? (onStagingRemoveToken     ?? hookRemoveToken)     : hookRemoveToken
  const addToken        = isStagingTab ? (onStagingAddToken        ?? hookAddToken)        : hookAddToken

  useEffect(() => { setMounted(true) }, [])

  // Load planets + realtime
  useEffect(() => {
    if (!campaignId) return
    supabase.from('map_planets').select('*').eq('campaign_id', campaignId).order('name')
      .then(({ data }) => { if (data) setPlanets(data as MapPlanet[]) })
    const ch = supabase.channel(`map-planets-gmview-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_planets', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlanets(prev => [...prev, payload.new as MapPlanet].sort((a, b) => a.name.localeCompare(b.name)))
        else if (payload.eventType === 'UPDATE') setPlanets(prev => prev.map(p => p.id === (payload.new as MapPlanet).id ? payload.new as MapPlanet : p))
        else if (payload.eventType === 'DELETE') setPlanets(prev => prev.filter(p => p.id !== (payload.old as MapPlanet).id))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load active combat encounter (adversaries live here, not in combat_participants)
  useEffect(() => {
    if (!campaignId) return

    supabase
      .from('combat_encounters')
      .select('id, is_active, initiative_slots, adversaries, vehicles')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => { setEncounter(data as EncounterRow | null) })

    const ch = supabase
      .channel(`map-encounter-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combat_encounters', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const { eventType, new: n } = payload
          if (eventType === 'DELETE') { setEncounter(null); return }
          const row = n as EncounterRow
          setEncounter(row.is_active ? row : null)
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load adversary token images
  useEffect(() => {
    supabase.from('adversary_token_images').select('*')
      .then(({ data }) => { if (data) setAdvTokens(data as AdversaryTokenImage[]) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-load base adversary stats for all adversary tokens on the map (keyed by name).
  // Used by the hover tooltip when tokens aren't linked to a combat encounter slot.
  useEffect(() => {
    const names = [...new Set(
      tokens.filter(t => t.participant_type === 'adversary' && t.label).map(t => t.label!),
    )]
    if (names.length === 0) return
    ;(async () => {
      const [{ data: globalData }, { data: customData }, staticAdvs] = await Promise.all([
        supabase.from('ref_adversaries').select('*').in('name', names).is('campaign_id', null),
        campaignId
          ? supabase.from('ref_adversaries').select('*').in('name', names).eq('campaign_id', campaignId)
          : Promise.resolve({ data: [] as unknown[] }),
        fetchAdversaries(),
      ])
      type AdvRow = Parameters<typeof adversaryToInstance>[0]
      const advMap = new Map<string, AdvRow>()
      for (const a of staticAdvs) if (names.includes(a.name)) advMap.set(a.name, a)
      for (const row of [...(globalData ?? []), ...(customData ?? [])]) advMap.set((row as AdvRow).name, row as AdvRow)
      const cache = new Map<string, AdversaryInstance>()
      for (const [name, adv] of advMap) cache.set(name, adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1))
      setAdvStatCache(cache)
    })()
  }, [tokens]) // eslint-disable-line react-hooks/exhaustive-deps

  // Which characters/slots are already on the current map
  const onMapCharIds  = useMemo(() => new Set(tokens.map(t => t.character_id).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])
  const onMapSlotKeys = useMemo(() => new Set(tokens.map(t => t.slot_key).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])

  // O(1) lookup maps — avoids Array.find inside render loops
  const advTokensByKey = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of advTokens) m.set(a.adversary_key, a.token_image_url)
    return m
  }, [advTokens])
  const tokensById = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) m.set(t.id, t)
    return m
  }, [tokens])
  const tokensBySlotKey = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) { if (t.slot_key) m.set(t.slot_key, t) }
    return m
  }, [tokens])
  const tokensByCharId = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) { if (t.character_id) m.set(t.character_id, t) }
    return m
  }, [tokens])

  // All active (non-archived) characters for the player section
  const activeCharacters = useMemo(
    () => characters.filter(c => !c.is_archived),
    [characters]
  )

  // Available PCs for "Add All Players" — those not yet on the map
  const availablePcs = useMemo(
    () => activeCharacters.filter(c => !onMapCharIds.has(c.id)),
    [activeCharacters, onMapCharIds]
  )

  const tooltipProps = useMemo(() => {
    if (!tooltipState) return null
    const token = tokensById.get(tooltipState.tokenId)
    if (!token) return null

    if (token.participant_type === 'pc' && token.character_id) {
      const char = characters.find(c => c.id === token.character_id)
      if (char) return {
        x: tooltipState.x, y: tooltipState.y,
        name: char.name, typeLabel: 'PC', typeColor: GOLD,
        characteristics: { brawn: char.brawn, agility: char.agility, intellect: char.intellect, cunning: char.cunning, willpower: char.willpower, presence: char.presence },
        soak: char.soak,
        defMelee: char.defense_melee,
        defRanged: char.defense_ranged,
        wounds: { current: char.wound_current, max: char.wound_threshold },
        strain: { current: char.strain_current, max: char.strain_threshold },
      }
    }

    if (token.slot_key && encounter) {
      const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
      if (slot?.adversaryInstanceId) {
        const adv = encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
        if (adv) {
          const color = adv.type === 'minion' ? '#E05252' : adv.type === 'nemesis' ? '#9060D0' : '#FF9800'
          const woundsMax = adv.type === 'minion' && adv.groupSize
            ? (adv.woundThreshold ?? 0) * adv.groupSize
            : adv.woundThreshold
          return {
            x: tooltipState.x, y: tooltipState.y,
            name: adv.name ?? token.label ?? '?',
            typeLabel: adv.type.charAt(0).toUpperCase() + adv.type.slice(1),
            typeColor: color,
            characteristics: adv.characteristics,
            soak: adv.soak,
            defMelee: adv.defense?.melee,
            defRanged: adv.defense?.ranged,
            wounds: (adv.woundThreshold && woundsMax) ? { current: adv.woundsCurrent ?? 0, max: woundsMax } : undefined,
            strain: adv.type !== 'minion' && adv.strainThreshold ? { current: adv.strainCurrent ?? 0, max: adv.strainThreshold } : undefined,
            minionGroup: adv.type === 'minion' && adv.groupSize != null
              ? { alive: adv.groupRemaining ?? 0, total: adv.groupSize }
              : undefined,
          }
        }
      }
      if (slot?.vehicleInstanceId) {
        const veh = encounter.vehicles.find(v => v.instanceId === slot.vehicleInstanceId)
        if (veh) return {
          x: tooltipState.x, y: tooltipState.y,
          name: veh.name,
          typeLabel: 'Vehicle',
          typeColor: veh.alignment === 'allied_npc' ? '#4EC87A' : '#E05252',
        }
      }
    }

    // Fallback: look up base stats by name from the pre-loaded adversary cache.
    // This covers pre-combat tokens that have no slot_key / no active encounter.
    if (token.participant_type === 'adversary' && token.label) {
      const cached = advStatCache.get(token.label)
      if (cached) {
        const color = cached.type === 'minion' ? '#E05252' : cached.type === 'nemesis' ? '#9060D0' : '#FF9800'
        return {
          x: tooltipState.x, y: tooltipState.y,
          name: token.label,
          typeLabel: cached.type.charAt(0).toUpperCase() + cached.type.slice(1),
          typeColor: color,
          characteristics: cached.characteristics,
          soak: cached.soak,
          defMelee: cached.defense?.melee,
          defRanged: cached.defense?.ranged,
          wounds: cached.woundThreshold ? { current: 0, max: cached.woundThreshold } : undefined,
          strain: cached.type !== 'minion' && cached.strainThreshold ? { current: 0, max: cached.strainThreshold } : undefined,
        }
      }
    }

    return {
      x: tooltipState.x, y: tooltipState.y,
      name: token.label ?? '?',
      typeLabel: token.alignment ?? 'token',
      typeColor: GOLD,
    }
  }, [tooltipState, tokensById, characters, encounter, advStatCache])

  // NPC slots from active encounter — adversaries live in combat_encounters JSONB, not combat_participants
  const npcSlots = useMemo<NpcDrawerSlot[]>(() => {
    if (!encounter) return []
    return encounter.initiative_slots
      .filter(s => s.type === 'npc' && s.adversaryInstanceId)
      .map(s => {
        const adv = encounter.adversaries.find(a => a.instanceId === s.adversaryInstanceId)
        return {
          slotId:              s.id,
          adversaryInstanceId: s.adversaryInstanceId!,
          name:                s.name,
          adversaryType:       adv?.type ?? 'rival',
        }
      })
  }, [encounter])

  // Vehicle slots from active encounter
  const vehicleSlots = useMemo<VehicleDrawerSlot[]>(() => {
    if (!encounter) return []
    return encounter.initiative_slots
      .filter(s => s.type === 'npc' && s.vehicleInstanceId)
      .map(s => {
        const veh = encounter.vehicles.find(v => v.instanceId === s.vehicleInstanceId)
        return {
          slotId:            s.id,
          vehicleInstanceId: s.vehicleInstanceId!,
          name:              s.name,
          alignment:         veh?.alignment ?? 'enemy',
          token_image_url:   veh?.token_image_url ?? null,
        }
      })
  }, [encounter])

  // ── Map actions ────────────────────────────────────────
  async function setActive(mapId: string) {
    if (!campaignId || busy) return
    setBusy(true)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    await supabase.from('maps').update({ is_active: true }).eq('id', mapId)
    setBusy(false)
  }

  async function toggleVisibleToPlayers() {
    if (!activeMap) return
    await supabase.from('maps').update({ is_visible_to_players: !activeMap.is_visible_to_players }).eq('id', activeMap.id)
  }

  async function deleteMap(mapId: string) {
    const { error } = await supabase.from('maps').delete().eq('id', mapId)
    if (!error) onDeleteMap(mapId)
  }

  // ── Planet helpers ──────────────────────────────────────
  async function handleCreatePlanet() {
    if (!newPlanetName.trim() || !campaignId || planetBusy) return
    setPlanetBusy(true)
    const { data } = await supabase
      .from('map_planets')
      .insert({ campaign_id: campaignId, name: newPlanetName.trim() })
      .select()
      .single()
    if (data) {
      setPlanets(prev => [...prev, data as MapPlanet].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setNewPlanetName('')
    setNewPlanetOpen(false)
    setPlanetBusy(false)
  }

  async function handleDeletePlanet(planetId: string) {
    const { error } = await supabase.from('map_planets').delete().eq('id', planetId)
    if (!error) {
      setPlanets(prev => prev.filter(p => p.id !== planetId))
    }
    setDeletePlanetConfirm(null)
    if (expandedPlanet === planetId) setExpandedPlanet(null)
  }

  async function handleAssignPlanet(mapId: string, planetId: string | null) {
    await supabase.from('maps').update({ planet_id: planetId }).eq('id', mapId)
  }

  function togglePlanet(id: string | 'all' | 'unassigned') {
    setExpandedPlanet(prev => prev === id ? null : id)
  }

  // Maps grouped by planet
  const mapsByPlanetId = useMemo(() => {
    const byId: Record<string, ActiveMap[]> = {}
    const unassigned: ActiveMap[] = []
    for (const map of allMaps) {
      if (map.planet_id) {
        byId[map.planet_id] = [...(byId[map.planet_id] ?? []), map]
      } else {
        unassigned.push(map)
      }
    }
    return { byId, unassigned }
  }, [allMaps])

  const filteredPlanets = useMemo(() =>
    planetSearch.trim()
      ? planets.filter(p => p.name.toLowerCase().includes(planetSearch.toLowerCase()))
      : planets,
    [planets, planetSearch],
  )

  // ── Token helpers (stable refs so TokenDrawer memo is effective) ──
  const addCharacterToken = useCallback(async (character: Character, x = 0.5, y = 0.5) => {
    if (!activeMap || !campaignId) return
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: 'pc',
      character_id:     character.id,
      participant_id:   null,
      slot_key:         null,
      label:            character.name,
      alignment:        'pc',
      x, y,
      is_visible:       true,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  character.portrait_url ?? null,
      token_shape:      'circle',
    })
  }, [activeMap, campaignId, addToken])

  const addAdversaryToken = useCallback(async (slot: NpcDrawerSlot, x = 0.5, y = 0.5) => {
    if (!activeMap || !campaignId) return
    const advImg = advTokensByKey.get(slot.name) ?? null
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: 'adversary',
      character_id:     null,
      participant_id:   null,
      slot_key:         slot.slotId,
      label:            slot.name,
      alignment:        slot.adversaryType,
      x, y,
      is_visible:       false,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  advImg,
      token_shape:      'circle',
    })
  }, [activeMap, campaignId, addToken, advTokensByKey])

  const addVehicleToken = useCallback(async (slot: VehicleDrawerSlot, x = 0.5, y = 0.5) => {
    if (!activeMap || !campaignId) return
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: 'adversary',
      character_id:     null,
      participant_id:   null,
      slot_key:         slot.slotId,
      label:            slot.name,
      alignment:        slot.alignment,
      x, y,
      is_visible:       false,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  slot.token_image_url,
      token_shape:      'rectangle',
    })
  }, [activeMap, campaignId, addToken])

  const addAllPlayers = useCallback(async () => {
    if (!activeMap || !campaignId) return
    const count = availablePcs.length
    if (count === 0) return
    for (let i = 0; i < count; i++) {
      const c = availablePcs[i]
      await addToken({
        map_id: activeMap.id, campaign_id: campaignId,
        participant_type: 'pc', character_id: c.id, participant_id: null, slot_key: null,
        label: c.name, alignment: 'pc', x: 0.5 + (i - count / 2) * 0.05, y: 0.5,
        is_visible: true, token_size: 1.0, wound_pct: null,
        token_image_url: c.portrait_url ?? null, token_shape: 'circle',
      })
    }
  }, [activeMap, campaignId, availablePcs, addToken])

  const handleAdvTokenUpload = useCallback(async (adversaryKey: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) return
    setAdvTokenBusy(adversaryKey)
    const ext  = file.name.split('.').pop() ?? 'png'
    const path = `${adversaryKey}.${ext}`
    const { error } = await supabase.storage.from('tokens').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      await supabase.from('adversary_token_images').upsert({ adversary_key: adversaryKey, token_image_url: data.publicUrl })
      setAdvTokens(prev => {
        const next = prev.filter(a => a.adversary_key !== adversaryKey)
        return [...next, { adversary_key: adversaryKey, token_image_url: data.publicUrl }]
      })
    }
    setAdvTokenBusy(null)
  }, [supabase])

  const clearAdvToken = useCallback(async (adversaryKey: string) => {
    await supabase.from('adversary_token_images').delete().eq('adversary_key', adversaryKey)
    setAdvTokens(prev => prev.filter(a => a.adversary_key !== adversaryKey))
  }, [supabase])

  const handleTokenContextMenu = useCallback((tokenId: string, e: MouseEvent) => {
    e.preventDefault()
    const token = tokensById.get(tokenId)
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true })
  }, [tokensById])

  const closeTokenDrawer = useCallback(() => setTokenDrawerOpen(false), [])
  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const handleTokenHover = useCallback((tokenId: string, screenX: number, screenY: number) => {
    if (isDraggingRef.current) return
    setTooltipState({ tokenId, x: screenX, y: screenY })
  }, [])

  const handleTokenHoverEnd = useCallback(() => {
    setTooltipState(null)
  }, [])

  const handleTokenDragStart = useCallback((_tokenId: string) => {
    isDraggingRef.current = true
    setTooltipState(null)
  }, [])

  const handleTokenDragEnd = useCallback((_tokenId: string) => {
    isDraggingRef.current = false
  }, [])

  // Close token drawer on Escape
  useEffect(() => {
    if (!tokenDrawerOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setTokenDrawerOpen(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [tokenDrawerOpen])

  // ── Render ─────────────────────────────────────────────
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', background: BG, overflow: 'hidden' }}
      onClick={() => setContextMenu(null)}
    >

      {/* ══ MAP AREA (flex: 1, shrinks when drawer open) ══ */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

        {/* ── Canvas ── */}
        {(previewMap ?? activeMap) ? (
          <>
            <MapCanvas
              mapImageUrl={(previewMap ?? activeMap)!.image_url}
              tokens={tokens}
              isGM={true}
              currentCharacterId={null}
              onTokenMove={moveToken}
              gridEnabled={(previewMap ?? activeMap)!.grid_enabled}
              gridSize={(previewMap ?? activeMap)!.grid_size ?? 50}
              onTokenContextMenu={handleTokenContextMenu}
              tokenScale={tokenScale}
              onTokenHover={handleTokenHover}
              onTokenHoverEnd={handleTokenHoverEnd}
              onTokenDragStart={handleTokenDragStart}
              onTokenDragEnd={handleTokenDragEnd}
            />
            {previewMap && (
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                zIndex: 50, display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(6,13,9,0.92)', border: `1px solid ${BORDER_HI}`,
                borderRadius: 20, padding: '4px 10px 4px 12px',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: GOLD }}>
                  Preview: {previewMap.name}
                </span>
                <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>· not live</span>
                <button
                  onClick={() => setPreviewMap(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: '0.9rem', lineHeight: 1, padding: '0 2px', marginLeft: 2 }}
                >
                  ✕
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD, letterSpacing: '0.1em' }}>No Active Map</div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>Upload a map and set it as active to get started.</div>
            {campaignId && (
              <button onClick={() => setUploadOpen(true)} style={{ ...btnTool, marginTop: 8 }}>↑ Upload Map</button>
            )}
          </div>
        )}

        {/* ── Floating toolbar (hidden on staging tab — pills toolbar takes over) ── */}
        {!isStagingTab && <div
          style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8, zIndex: 50, pointerEvents: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Left: library toggle + upload */}
          <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
            <button
              onClick={() => setLibraryOpen(o => !o)}
              style={{
                ...btnTool,
                borderColor: libraryOpen ? 'rgba(200,170,80,0.65)' : 'rgba(200,170,80,0.35)',
                color: libraryOpen ? GOLD : DIM,
              }}
            >
              ≡ Maps{allMaps.length > 0 ? ` (${allMaps.length})` : ''}
            </button>
            {campaignId && (
              <button onClick={() => setUploadOpen(true)} style={btnTool}>↑ Upload</button>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Right: active-map actions */}
          {activeMap && (
            <div style={{ display: 'flex', gap: 8, pointerEvents: 'all', alignItems: 'center' }}>
              {/* Token scale control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(6,13,9,0.92)', border: '1px solid rgba(200,170,80,0.35)', borderRadius: 4 }}>
                <button
                  onClick={() => adjustTokenScale(-0.25)}
                  disabled={tokenScale <= 0.25}
                  style={{ background: 'transparent', border: 'none', color: tokenScale <= 0.25 ? 'rgba(200,170,80,0.25)' : GOLD, fontFamily: "'Share Tech Mono', monospace", fontSize: FS_CAPTION, padding: '6px 10px', cursor: tokenScale <= 0.25 ? 'default' : 'pointer', lineHeight: 1 }}
                >
                  −
                </button>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: FS_CAPTION, color: GOLD, minWidth: 42, textAlign: 'center', letterSpacing: '0.04em' }}>
                  {tokenScale.toFixed(2)}×
                </span>
                <button
                  onClick={() => adjustTokenScale(0.25)}
                  disabled={tokenScale >= 3.0}
                  style={{ background: 'transparent', border: 'none', color: tokenScale >= 3.0 ? 'rgba(200,170,80,0.25)' : GOLD, fontFamily: "'Share Tech Mono', monospace", fontSize: FS_CAPTION, padding: '6px 10px', cursor: tokenScale >= 3.0 ? 'default' : 'pointer', lineHeight: 1 }}
                >
                  +
                </button>
              </div>

              {/* Map visibility to players */}
              <button
                onClick={toggleVisibleToPlayers}
                style={{
                  ...btnTool,
                  color: activeMap.is_visible_to_players ? GREEN : DIM,
                  borderColor: activeMap.is_visible_to_players ? 'rgba(78,200,122,0.45)' : 'rgba(200,170,80,0.35)',
                }}
              >
                {activeMap.is_visible_to_players ? '◉ Visible' : '◯ Hidden'}
              </button>

              {/* Token Staging Drawer toggle */}
              <button
                onClick={() => setTokenDrawerOpen(o => !o)}
                style={{
                  ...btnTool,
                  color: tokenDrawerOpen ? '#52C8A0' : DIM,
                  borderColor: tokenDrawerOpen ? 'rgba(82,200,160,0.45)' : 'rgba(200,170,80,0.35)',
                  background: tokenDrawerOpen ? 'rgba(82,200,160,0.1)' : 'rgba(6,13,9,0.92)',
                }}
              >
                ◈ Tokens
              </button>
            </div>
          )}
        </div>}

        {/* ── Map library drawer — rendered via portal so it escapes overflow:hidden ── */}
        {mounted && (() => {
          const isOpen = isStagingTab ? (stagingLibraryOpen ?? false) : libraryOpen
          const closeDrawer = () => isStagingTab ? onStagingLibraryClose?.() : setLibraryOpen(false)
          return createPortal(
            <>
              {/* Backdrop */}
              {isOpen && (
                <div
                  onClick={closeDrawer}
                  style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    zIndex: 8999,
                  }}
                />
              )}

              {/* Drawer */}
              <div
                style={{
                  position:      'fixed',
                  top:           0,
                  left:          0,
                  bottom:        0,
                  width:         'clamp(300px, 28vw, 420px)',
                  zIndex:        9000,
                  display:       'flex',
                  flexDirection: 'column',
                  background:    PANEL_BG,
                  borderRight:   `1px solid ${isOpen ? BORDER_HI : 'transparent'}`,
                  boxShadow:     isOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
                  transform:     isOpen ? 'translateX(0)' : 'translateX(-100%)',
                  transition:    'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.2s',
                  pointerEvents: isOpen ? 'auto' : 'none',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 16px', height: 50,
                  borderBottom: `1px solid ${BORDER}`,
                  background: 'rgba(10,18,12,0.92)',
                }}>
                  <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>
                    Map Library
                  </span>
                  <button
                    onClick={closeDrawer}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: '1.1rem', lineHeight: 1, padding: '4px 6px' }}
                  >
                    ✕
                  </button>
                </div>

                {/* ── Planet search + new planet ── */}
                <div style={{ flexShrink: 0, borderBottom: `1px solid ${BORDER}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <input
                    value={planetSearch}
                    onChange={e => setPlanetSearch(e.target.value)}
                    placeholder="Search planets…"
                    style={darkInput}
                  />
                  {newPlanetOpen ? (
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
                        style={{ ...btnSmall, opacity: (!newPlanetName.trim() || planetBusy) ? 0.45 : 1, padding: '0 10px' }}
                      >✓</button>
                      <button
                        onClick={() => { setNewPlanetOpen(false); setNewPlanetName('') }}
                        style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_SM, padding: '0 8px', borderRadius: 4, cursor: 'pointer' }}
                      >×</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setNewPlanetOpen(true)}
                        style={{ flex: 1, padding: '5px 0', borderRadius: 4, background: 'rgba(90,140,200,0.07)', border: '1px solid rgba(90,140,200,0.25)', color: '#7AB4E0', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                      >⊕ New Planet</button>
                      <button
                        onClick={() => { closeDrawer(); setUploadOpen(true) }}
                        disabled={!campaignId}
                        style={{ ...btnSmall, flex: 1, textAlign: 'center', padding: '5px 0' }}
                      >↑ Upload Map</button>
                    </div>
                  )}
                </div>

                {/* ── Planet folder list ── */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {/* All Maps folder */}
                  <LibFolderRow label="All Maps" count={allMaps.length} expanded={expandedPlanet === 'all'} onToggle={() => togglePlanet('all')} />
                  {expandedPlanet === 'all' && (
                    allMaps.length === 0
                      ? <LibFolderEmpty label="No maps uploaded yet." />
                      : allMaps.map(map => (
                        <LibMapRow key={map.id} map={map} planets={planets} busy={busy}
                          onLoad={() => { setPreviewMap(map); closeDrawer() }}
                          onEdit={() => router.push(`/gm/mapforge?campaign=${campaignId}&mapId=${map.id}&mapName=${encodeURIComponent(map.name)}&imageUrl=${encodeURIComponent(map.image_url)}`)}
                          onSetActive={() => void setActive(map.id)}
                          onDelete={() => void deleteMap(map.id)}
                          onAssignPlanet={(pid) => void handleAssignPlanet(map.id, pid)}
                        />
                      ))
                  )}

                  {/* Named planet folders */}
                  {filteredPlanets.map(planet => (
                    <div key={planet.id}>
                      <LibFolderRow
                        label={planet.name}
                        count={mapsByPlanetId.byId[planet.id]?.length ?? 0}
                        expanded={expandedPlanet === planet.id}
                        onToggle={() => togglePlanet(planet.id)}
                        onDelete={() => setDeletePlanetConfirm(planet.id)}
                      />
                      {deletePlanetConfirm === planet.id && (
                        <div style={{ padding: '8px 12px', background: 'rgba(224,80,80,0.06)', borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050', marginBottom: 6 }}>
                            Delete &quot;{planet.name}&quot;? Maps will become unassigned.
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setDeletePlanetConfirm(null)} style={{ flex: 1, padding: '4px 0', borderRadius: 3, background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => void handleDeletePlanet(planet.id)} style={{ flex: 2, padding: '4px 0', borderRadius: 3, background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)', color: '#E05050', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, cursor: 'pointer' }}>✕ Delete Planet</button>
                          </div>
                        </div>
                      )}
                      {expandedPlanet === planet.id && (
                        (mapsByPlanetId.byId[planet.id]?.length ?? 0) === 0
                          ? <LibFolderEmpty label="No maps in this planet yet." />
                          : (mapsByPlanetId.byId[planet.id] ?? []).map(map => (
                            <LibMapRow key={map.id} map={map} planets={planets} busy={busy}
                              onLoad={() => { setPreviewMap(map); closeDrawer() }}
                              onEdit={() => router.push(`/gm/mapforge?campaign=${campaignId}&mapId=${map.id}&mapName=${encodeURIComponent(map.name)}&imageUrl=${encodeURIComponent(map.image_url)}`)}
                              onSetActive={() => void setActive(map.id)}
                              onDelete={() => void deleteMap(map.id)}
                              onAssignPlanet={(pid) => void handleAssignPlanet(map.id, pid)}
                            />
                          ))
                      )}
                    </div>
                  ))}

                  {/* No search results */}
                  {planetSearch.trim() && filteredPlanets.length === 0 && (
                    <div style={{ padding: '12px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                      No planets match &quot;{planetSearch}&quot;.
                    </div>
                  )}

                  {/* Unassigned folder */}
                  <LibFolderRow label="Unassigned" count={mapsByPlanetId.unassigned.length} expanded={expandedPlanet === 'unassigned'} onToggle={() => togglePlanet('unassigned')} />
                  {expandedPlanet === 'unassigned' && (
                    mapsByPlanetId.unassigned.length === 0
                      ? <LibFolderEmpty label="All maps are assigned to a planet." />
                      : mapsByPlanetId.unassigned.map(map => (
                        <LibMapRow key={map.id} map={map} planets={planets} busy={busy}
                          onLoad={() => { setPreviewMap(map); closeDrawer() }}
                          onEdit={() => router.push(`/gm/mapforge?campaign=${campaignId}&mapId=${map.id}&mapName=${encodeURIComponent(map.name)}&imageUrl=${encodeURIComponent(map.image_url)}`)}
                          onSetActive={() => void setActive(map.id)}
                          onDelete={() => void deleteMap(map.id)}
                          onAssignPlanet={(pid) => void handleAssignPlanet(map.id, pid)}
                        />
                      ))
                  )}
                </div>

                {/* Map actions footer */}
                <div style={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => { closeDrawer(); setUploadOpen(true) }}
                    disabled={!campaignId}
                    style={{ ...btnSmall, width: '100%', textAlign: 'center' }}
                  >
                    ↑ Upload Map
                  </button>
                  <button
                    onClick={() => {
                      // Wipe any stale draft before navigating so MapForge always opens clean
                      try { localStorage.removeItem(`mapforge_draft_${campaignId}`) } catch { /* ignore */ }
                      router.push(`/gm/mapforge?campaign=${campaignId}`)
                    }}
                    disabled={!campaignId}
                    style={{ ...btnSmall, width: '100%', textAlign: 'center' }}
                  >
                    ◈ Generate Map
                  </button>
                </div>

                {/* Footer */}
                {activeMap && (
                  <div style={{ padding: '8px 14px', borderTop: `1px solid ${BORDER}`, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
                    {tokens.length} token{tokens.length !== 1 ? 's' : ''} on map · Scroll to zoom · Drag to pan
                  </div>
                )}
              </div>
            </>,
            document.body,
          )
        })()}

        {/* ── Token tooltip (hover) ── */}
        {mounted && tooltipState && tooltipProps && (
          <TokenTooltip {...tooltipProps} />
        )}

        {/* ── Token context menu (right-click on canvas token) ── */}
        {contextMenu && (
          <TokenContextMenu
            contextMenu={contextMenu}
            onToggleVisibility={toggleVisibility}
            onRemoveToken={removeToken}
            onClose={closeContextMenu}
          />
        )}
      </div>

      {/* ══ TOKEN STAGING DRAWER (right, 280px) ══ */}
      {tokenDrawerOpen && (
        <TokenDrawer
          npcSlots={npcSlots}
          vehicleSlots={vehicleSlots}
          activeCharacters={activeCharacters}
          availablePcs={availablePcs}
          activeMap={activeMap}
          advTokensByKey={advTokensByKey}
          tokensBySlotKey={tokensBySlotKey}
          tokensByCharId={tokensByCharId}
          onMapSlotKeys={onMapSlotKeys}
          onMapCharIds={onMapCharIds}
          advTokenBusy={advTokenBusy}
          onClose={closeTokenDrawer}
          onAddAdversaryToken={addAdversaryToken}
          onAddVehicleToken={addVehicleToken}
          onAddCharacterToken={addCharacterToken}
          onAddAllPlayers={addAllPlayers}
          onAdvTokenUpload={handleAdvTokenUpload}
          onClearAdvToken={clearAdvToken}
          onToggleVisibility={toggleVisibility}
          onRemoveToken={removeToken}
        />
      )}

      {/* ── Upload modal ── */}
      {uploadOpen && campaignId && (
        <UploadModal campaignId={campaignId} planets={planets} onClose={() => setUploadOpen(false)} onSaved={() => setUploadOpen(false)} />
      )}

    </div>
  )
}

/* ── TokenContextMenu ──────────────────────────────────────── */
interface TokenContextMenuProps {
  contextMenu:        ContextMenuState
  onToggleVisibility: (id: string, visible: boolean) => Promise<void>
  onRemoveToken:      (id: string) => Promise<void>
  onClose:            () => void
}

const TokenContextMenu = memo(function TokenContextMenu({ contextMenu, onToggleVisibility, onRemoveToken, onClose }: TokenContextMenuProps) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', left: contextMenu.x, top: contextMenu.y,
        zIndex: 900, background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
        borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        overflow: 'hidden', minWidth: 160,
      }}
    >
      <button
        onClick={async () => { await onToggleVisibility(contextMenu.tokenId, !contextMenu.isVisible); onClose() }}
        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '9px 14px', fontFamily: FR, fontSize: FS_LABEL, color: TEXT, borderBottom: `1px solid ${BORDER}` }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        {contextMenu.isVisible ? '◉ Hide from players' : '◉ Show to players'}
      </button>
      <button
        onClick={async () => { await onRemoveToken(contextMenu.tokenId); onClose() }}
        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '9px 14px', fontFamily: FR, fontSize: FS_LABEL, color: '#E05050' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        ✕ Remove from map
      </button>
    </div>
  )
})

interface TokenDrawerProps {
  npcSlots:           NpcDrawerSlot[]
  vehicleSlots:       VehicleDrawerSlot[]
  activeCharacters:   Character[]
  availablePcs:       Character[]
  activeMap:          ActiveMap | null
  advTokensByKey:     Map<string, string>
  tokensBySlotKey:    Map<string, MapToken>
  tokensByCharId:     Map<string, MapToken>
  onMapSlotKeys:      Set<string>
  onMapCharIds:       Set<string>
  advTokenBusy:       string | null
  onClose:            () => void
  onAddAdversaryToken:(slot: NpcDrawerSlot) => void
  onAddVehicleToken:  (slot: VehicleDrawerSlot) => void
  onAddCharacterToken:(char: Character) => void
  onAddAllPlayers:    () => void
  onAdvTokenUpload:   (key: string, file: File) => void
  onClearAdvToken:    (key: string) => void
  onToggleVisibility: (id: string, visible: boolean) => Promise<void>
  onRemoveToken:      (id: string) => Promise<void>
}

/* ── TokenTooltip ──────────────────────────────────────────── */
interface TokenTooltipData {
  x:              number
  y:              number
  name:           string
  typeLabel:      string
  typeColor:      string
  characteristics?: { brawn: number; agility: number; intellect: number; cunning: number; willpower: number; presence: number }
  soak?:          number | null
  defMelee?:      number | null
  defRanged?:     number | null
  wounds?:        { current: number; max: number }
  strain?:        { current: number; max: number }
  minionGroup?:   { alive: number; total: number }
}

const TOOLTIP_W = 230
const CHAR_ABBRS = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR'] as const
const CHAR_KEYS  = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const

const TokenTooltip = memo(function TokenTooltip(p: TokenTooltipData) {
  const vw   = typeof window !== 'undefined' ? window.innerWidth  : 1200
  const vh   = typeof window !== 'undefined' ? window.innerHeight : 800
  const left = Math.max(8, Math.min(p.x + 14, vw - TOOLTIP_W - 8))
  const top  = Math.max(8, Math.min(p.y - 12, vh - 300))

  return createPortal(
    <div style={{
      position: 'fixed', left, top, width: TOOLTIP_W, zIndex: 1100,
      background: 'rgba(6,13,9,0.97)',
      border: `1px solid ${p.typeColor}44`,
      borderRadius: 6,
      boxShadow: `0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px ${p.typeColor}18`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      padding: '10px 12px',
      pointerEvents: 'none',
    }}>
      {/* Name + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1, fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.typeColor, background: `${p.typeColor}18`, border: `1px solid ${p.typeColor}35`, borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>{p.typeLabel}</div>
      </div>

      {/* Characteristics grid */}
      {p.characteristics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, marginBottom: 8 }}>
          {CHAR_ABBRS.map((abbr, i) => (
            <div key={abbr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 2px' }}>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>{abbr}</div>
              <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: GOLD }}>{p.characteristics![CHAR_KEYS[i]]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Soak + Defense */}
      {(p.soak != null || p.defMelee != null || p.defRanged != null) && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {p.soak != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>SOAK</div>
              <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.soak}</div>
            </div>
          )}
          {p.defMelee != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF M</div>
              <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defMelee}</div>
            </div>
          )}
          {p.defRanged != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF R</div>
              <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defRanged}</div>
            </div>
          )}
        </div>
      )}

      {/* Minion group count */}
      {p.minionGroup && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Group</span>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: p.minionGroup.alive === 0 ? '#E05050' : TEXT }}>
              {p.minionGroup.alive}/{p.minionGroup.total} alive
            </span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: p.minionGroup.total }).map((_, i) => (
              <span key={i} style={{ fontSize: 9, color: i < p.minionGroup!.alive ? '#E05252' : 'rgba(255,255,255,0.15)' }}>
                {i < p.minionGroup!.alive ? '■' : '□'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wounds bar */}
      {p.wounds && (
        <div style={{ marginBottom: p.strain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wounds</span>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: p.wounds.current >= p.wounds.max ? '#E05050' : TEXT }}>{p.wounds.current}/{p.wounds.max}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.wounds.current / Math.max(p.wounds.max, 1)) * 100)}%`, background: p.wounds.current >= p.wounds.max ? '#E05050' : '#C8AA50', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Strain bar */}
      {p.strain && (
        <div style={{ marginTop: p.wounds ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Strain</span>
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: p.strain.current >= p.strain.max ? '#E05050' : TEXT }}>{p.strain.current}/{p.strain.max}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.strain.current / Math.max(p.strain.max, 1)) * 100)}%`, background: p.strain.current >= p.strain.max ? '#E05050' : '#4EC87A', borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
})

const TokenDrawer = memo(function TokenDrawer({
  npcSlots, vehicleSlots, activeCharacters, availablePcs, activeMap,
  advTokensByKey, tokensBySlotKey, tokensByCharId, onMapSlotKeys, onMapCharIds,
  advTokenBusy, onClose, onAddAdversaryToken, onAddVehicleToken, onAddCharacterToken,
  onAddAllPlayers, onAdvTokenUpload, onClearAdvToken, onToggleVisibility, onRemoveToken,
}: TokenDrawerProps) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: 280, flexShrink: 0,
        background: PANEL_BG,
        borderLeft: '1px solid rgba(200,170,80,0.25)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 14px 10px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}>
          ◈ TOKENS
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: '1.1rem', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Section A: Adversaries ── */}
        {npcSlots.length > 0 && (
          <>
            <div style={{ padding: '10px 14px 6px', fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)', borderBottom: `1px solid ${BORDER}` }}>
              Adversaries
            </div>

            {npcSlots.map(p => {
              const advImg     = advTokensByKey.get(p.name) ?? null
              const tokenColor = p.adversaryType === 'minion' ? '#e05252' : p.adversaryType === 'nemesis' ? '#a852e0' : '#FF9800'
              const label      = p.name
              const badge      = p.adversaryType === 'minion' ? 'MINION' : p.adversaryType === 'nemesis' ? 'NEMESIS' : 'RIVAL'
              const isOnMap    = onMapSlotKeys.has(p.slotId)
              const mapToken   = tokensBySlotKey.get(p.slotId) ?? null

              return (
                <div key={p.slotId} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {advImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={advImg} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${tokenColor}60` }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `${tokenColor}20`, border: `2px solid ${tokenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 16, fontWeight: 700, color: tokenColor }}>
                        {label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                      <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>{badge}</div>
                    </div>
                    {activeMap && (
                      isOnMap
                        ? <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                        : <button onClick={() => void onAddAdversaryToken(p)} style={btnSmall}>+ Add</button>
                    )}
                  </div>

                  {!advImg && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, cursor: advTokenBusy === p.name ? 'wait' : 'pointer' }}>
                      <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void onAdvTokenUpload(p.name, f) }} />
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{advTokenBusy === p.name ? 'Uploading…' : '↑ Upload Image'}</span>
                      <span style={{ fontFamily: FR, fontStyle: 'italic', fontSize: FS_OVERLINE, color: 'rgba(200,170,80,0.3)' }}>· Used as token on the map</span>
                    </label>
                  )}

                  {advImg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void onAdvTokenUpload(p.name, f) }} />
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>↑ Replace image</span>
                      </label>
                      <span style={{ color: BORDER_HI }}>·</span>
                      <button onClick={() => void onClearAdvToken(p.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050', padding: 0 }}>Remove</button>
                    </div>
                  )}

                  {isOnMap && mapToken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                        style={{ flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3, padding: '4px 8px', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: '.15s' }}
                      >
                        {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                      </button>
                      <button onClick={() => void onRemoveToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ── Section B: Vehicles ── */}
        {vehicleSlots.length > 0 && (
          <>
            <div style={{ padding: '10px 14px 6px', fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)', borderBottom: `1px solid ${BORDER}`, borderTop: `1px solid ${BORDER}` }}>
              Vehicles
            </div>

            {vehicleSlots.map(p => {
              const isOnMap    = onMapSlotKeys.has(p.slotId)
              const mapToken   = tokensBySlotKey.get(p.slotId) ?? null
              const tokenColor = p.alignment === 'allied_npc' ? '#4EC87A' : '#e05252'

              return (
                <div key={p.slotId} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.token_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.token_image_url} alt="" style={{ width: 40, height: 28, borderRadius: 3, objectFit: 'cover', flexShrink: 0, border: `2px solid ${tokenColor}60` }} />
                    ) : (
                      <div style={{ width: 40, height: 28, borderRadius: 3, flexShrink: 0, background: `${tokenColor}20`, border: `2px solid ${tokenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 13, fontWeight: 700, color: tokenColor }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>{p.alignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'} · VEHICLE</div>
                    </div>
                    {activeMap && (
                      isOnMap
                        ? <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                        : <button onClick={() => void onAddVehicleToken(p)} style={btnSmall}>+ Add</button>
                    )}
                  </div>

                  {isOnMap && mapToken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                        style={{ flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3, padding: '4px 8px', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: '.15s' }}
                      >
                        {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                      </button>
                      <button onClick={() => void onRemoveToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ── Section C: Players ── */}
        <div style={{ padding: '10px 14px 6px', fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)', borderBottom: `1px solid ${BORDER}`, borderTop: (npcSlots.length > 0 || vehicleSlots.length > 0) ? `1px solid ${BORDER}` : 'none' }}>
          Players
        </div>

        {activeCharacters.length === 0 && (
          <div style={{ padding: '12px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>No active characters.</div>
        )}

        {activeCharacters.map(char => {
          const isOnMap  = onMapCharIds.has(char.id)
          const mapToken = tokensByCharId.get(char.id) ?? null

          return (
            <div key={char.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {char.portrait_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={char.portrait_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(200,170,80,0.4)' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'rgba(200,170,80,0.15)', border: '2px solid rgba(200,170,80,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 16, fontWeight: 700, color: GOLD }}>
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {char.name}
                </div>
                {activeMap && (
                  isOnMap
                    ? <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                    : <button onClick={() => void onAddCharacterToken(char)} style={btnSmall}>+ Add</button>
                )}
              </div>

              {isOnMap && mapToken && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                    style={{ flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3, padding: '4px 8px', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: '.15s' }}
                  >
                    {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                  </button>
                  <button onClick={() => void onRemoveToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Add All Players */}
        {activeMap && availablePcs.length > 0 && (
          <div style={{ padding: '10px 12px' }}>
            <button
              onClick={() => void onAddAllPlayers()}
              style={{ ...btnTool, width: '100%', justifyContent: 'center', display: 'flex' }}
            >
              ◉ Add All Players
            </button>
          </div>
        )}

      </div>
    </div>
  )
})

/* ── Map Library sub-components ─────────────────────────── */

interface LibFolderRowProps {
  label:    string
  count:    number
  expanded: boolean
  onToggle: () => void
  onDelete?: () => void
}

function LibFolderRow({ label, count, expanded, onToggle, onDelete }: LibFolderRowProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 12px',
        borderBottom: `1px solid ${BORDER}`,
        background: expanded ? 'rgba(200,170,80,0.05)' : hovered ? 'rgba(200,170,80,0.02)' : 'transparent',
        cursor: 'pointer', userSelect: 'none', transition: 'background 0.1s',
      }}
    >
      <span style={{ color: expanded ? GOLD : DIM, fontSize: 9, flexShrink: 0, lineHeight: 1 }}>
        {expanded ? '▾' : '▶'}
      </span>
      <span style={{
        fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: expanded ? GOLD : TEXT,
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>{count}</span>
      {onDelete && (hovered || expanded) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title={`Delete ${label}`}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(224,80,80,0.55)', fontSize: 15, lineHeight: 1, padding: '0 2px', flexShrink: 0, marginLeft: 2 }}
        >×</button>
      )}
    </div>
  )
}

function LibFolderEmpty({ label }: { label: string }) {
  return (
    <div style={{ padding: '10px 20px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, borderBottom: `1px solid ${BORDER}` }}>
      {label}
    </div>
  )
}

interface LibMapRowProps {
  map:            ActiveMap
  planets:        MapPlanet[]
  busy:           boolean
  onLoad:         () => void
  onEdit:         () => void
  onSetActive:    () => void
  onDelete:       () => void
  onAssignPlanet: (planetId: string | null) => void
}

function LibMapRow({ map, planets, busy, onLoad, onEdit, onSetActive, onDelete, onAssignPlanet }: LibMapRowProps) {
  return (
    <div style={{
      padding: '8px 12px 8px 20px',
      borderBottom: `1px solid ${BORDER}`,
      background: map.is_active ? 'rgba(200,170,80,0.05)' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={map.image_url} alt={map.name}
          style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 3, border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: map.is_active ? GOLD : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {map.name}
            {map.is_active && <span style={{ marginLeft: 6, fontSize: FS_OVERLINE, color: GOLD }}>★ ACTIVE</span>}
          </div>
          <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
            {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
            {map.is_visible_to_players && <span style={{ marginLeft: 6, color: GREEN }}>● Visible</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={onLoad} title="Load on GM canvas" style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 7px', borderRadius: 3, cursor: 'pointer' }}>Load</button>
          <button onClick={onEdit} title="Edit in Map Forge" style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 7px', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
          {!map.is_active && (
            <button onClick={onSetActive} disabled={busy} style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 7px', borderRadius: 3, cursor: 'pointer' }}>Set Active</button>
          )}
          <button onClick={onDelete} style={btnDanger} title="Delete map">×</button>
        </div>
      </div>
      {/* Planet assignment */}
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Planet:</span>
        <select
          value={map.planet_id ?? ''}
          onChange={e => onAssignPlanet(e.target.value || null)}
          style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORDER}`, borderRadius: 3, color: map.planet_id ? TEXT : DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '2px 4px', flex: 1, minWidth: 0, cursor: 'pointer', outline: 'none' }}
        >
          <option value="">— none —</option>
          {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
    </div>
  )
}
