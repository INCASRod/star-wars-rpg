'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'
import type { MapToken } from '@/hooks/useMapTokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { OpeningCrawlCanvas } from '@/components/map/OpeningCrawlCanvas'
import { useMapTokens } from '@/hooks/useMapTokens'
import { useMapPlanets } from '@/hooks/useMapPlanets'
import type { MapPlanet } from '@/hooks/useMapPlanets'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { AdversaryInstance } from '@/lib/adversaries'
import { fetchVehicles } from '@/lib/vehicles'
import type { Vehicle } from '@/lib/vehicles'
import { HUD, FONT_BODY, EASE, RADIUS } from '@/lib/tokens'
import { MapToolsRadial } from '@/app/gm/MapToolsRadial'
import { EncounterDeck } from '@/components/gm/EncounterDeck'

/* ── Design tokens ─────────────────────────────────────── */
const BG  = 'var(--hud-bg)'
const DIM  = 'var(--hud-text-dim)'
const TEXT = 'var(--hud-text)'
const GREEN = 'var(--state-success)'
const PANEL_BG  = 'var(--hud-panel)'
const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'color-mix(in srgb, var(--hud-accent) 35%, transparent)'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

const btnTool: React.CSSProperties = {
  background: 'var(--hud-panel)',
  border: `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`,
  color: HUD.gold,
  fontFamily: FONT_BODY,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0.375rem 0.8125rem',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  whiteSpace: 'nowrap',
}

const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.10)',
  border: `1px solid rgba(224,80,80,0.35)`,
  color: 'var(--state-failure)',
  fontFamily: FONT_BODY,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  padding: '0.25rem 0.5625rem',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
  flexShrink: 0,
}

const btnSmall: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
  border: `1px solid var(--hud-border-hi)`,
  color: HUD.gold,
  fontFamily: FONT_BODY,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '0.1875rem 0.5625rem',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${BORDER_HI}`,
  color: TEXT,
  fontFamily: FONT_BODY,
  padding: '0.375rem 0.625rem',
  borderRadius: RADIUS.sm,
  outline: 'none',
  fontSize: FS_SM,
  width: '100%',
  boxSizing: 'border-box',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS_OVERLINE,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
  marginBottom: '0.25rem',
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
      style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-toast)' as unknown as number, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.lg, padding: '1.5rem', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '0.875rem', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, color: HUD.gold }}>Upload New Map</div>
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
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ ...darkInput, padding: '0.3125rem 0.5rem' }} />
          {file && <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, marginTop: '0.25rem' }}>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={gridEnabled} onChange={e => setGridEnabled(e.target.checked)} style={{ accentColor: HUD.gold }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: TEXT }}>Grid overlay</span>
          </label>
          {gridEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginLeft: 'auto' }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>Cell size (px)</span>
              <input type="number" value={gridSize} onChange={e => setGridSize(Math.max(10, Number(e.target.value)))} style={{ ...darkInput, width: 64, textAlign: 'center' }} />
            </div>
          )}
        </div>
        {err && <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: 'var(--state-failure)' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
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
  encounter:           CombatEncounter | null
  characters:          Character[]
  allMaps:             ActiveMap[]
  activeMap:           ActiveMap | null
  onDeleteMap:         (mapId: string) => void
  /** When true, hides the internal floating toolbar (Maps/Upload/Tokens buttons).
   *  The staging tab provides its own pill toolbar instead. */
  isStagingTab?:            boolean
  /** Shared token state lifted to page level — avoids dual hook instances causing stale canvas. */
  stagingTokens?:              MapToken[]
  onStagingMoveToken?:         (id: string, x: number, y: number) => Promise<void>
  onStagingToggleVisibility?:  (id: string, visible: boolean) => Promise<void>
  onStagingRemoveToken?:       (id: string) => Promise<void>
  onStagingAddToken?:          (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  /** Fired on a genuine tap (not a drag) on a map token — used by the Encounter Deck to focus the corresponding card. */
  onTokenClick?:               (tokenId: string) => void
}

export function GmMapView({ campaignId, encounter: encounterProp, characters, allMaps, activeMap, onDeleteMap, isStagingTab, stagingTokens, onStagingMoveToken, onStagingToggleVisibility, onStagingRemoveToken, onStagingAddToken, onTokenClick }: GmMapViewProps) {
  const supabase = useMemo(() => createClient(), [])

  const router = useRouter()

  const [mounted,          setMounted]          = useState(false)
  const [uploadOpen,       setUploadOpen]       = useState(false)
  const [libraryOpen,      setLibraryOpen]      = useState(false)

  // Planet state — owned by useMapPlanets (fetch + realtime)
  const { planets, setPlanets }                        = useMapPlanets(campaignId ?? '')
  const [expandedPlanet,      setExpandedPlanet]      = useState<string | 'all' | 'unassigned' | null>(null)
  const [planetSearch,        setPlanetSearch]        = useState('')
  const [newPlanetOpen,       setNewPlanetOpen]       = useState(false)
  const [newPlanetName,       setNewPlanetName]       = useState('')
  const [planetBusy,          setPlanetBusy]          = useState(false)
  const [deletePlanetConfirm, setDeletePlanetConfirm] = useState<string | null>(null)
  const [tokenDrawerOpen,  setTokenDrawerOpen]  = useState(false)
  // TEMPORARY — Task 9 standalone-verification stub only. Task 12 replaces this
  // with the real deck-open state threaded down from GmShell/useGmSession.
  const [deckOpenLocal, setDeckOpenLocal] = useState(false)
  const [contextMenu,      setContextMenu]      = useState<ContextMenuState | null>(null)
  const [tooltipState,     setTooltipState]     = useState<TooltipState | null>(null)
  const isDraggingRef = useRef(false)
  const lastTooltipPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const encounter = encounterProp as unknown as EncounterRow | null
  const [previewMap,       setPreviewMap]       = useState<ActiveMap | null>(null)
  const { tokenImages: advTokenImages, setTokenImages: setAdvTokenImages } = useAdversaryTokenImages()
  const [busy,             setBusy]             = useState(false)
  const [advTokenBusy,     setAdvTokenBusy]     = useState<string | null>(null)
  const [advStatCache,     setAdvStatCache]     = useState<Map<string, AdversaryInstance>>(new Map())
  const [vehStatCache,     setVehStatCache]     = useState<Map<string, Vehicle>>(new Map())
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

  // Pre-load static vehicle stats for rectangle tokens that have no encounter slot.
  useEffect(() => {
    const vehicleNames = [...new Set(
      tokens.filter(t => t.token_shape === 'rectangle' && t.label).map(t => t.label!),
    )]
    if (vehicleNames.length === 0) { setVehStatCache(new Map()); return }
    fetchVehicles().then(allVehicles => {
      const cache = new Map<string, Vehicle>()
      for (const v of allVehicles) {
        if (vehicleNames.includes(v.name)) cache.set(v.name, v)
      }
      setVehStatCache(cache)
    }).catch(console.warn)
  }, [tokens])

  // Which characters/slots are already on the current map
  const onMapCharIds  = useMemo(() => new Set(tokens.map(t => t.character_id).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])
  const onMapSlotKeys = useMemo(() => new Set(tokens.map(t => t.slot_key).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])

  // O(1) lookup maps — avoids Array.find inside render loops
  const advTokensByKey = useMemo(() => new Map(Object.entries(advTokenImages)), [advTokenImages])
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

  const activeTooltipState = tooltipState

  const tooltipProps = useMemo(() => {
    if (!activeTooltipState) return null
    const token = tokensById.get(activeTooltipState.tokenId)
    if (!token) return null

    if (token.participant_type === 'pc' && token.character_id) {
      const char = characters.find(c => c.id === token.character_id)
      if (char) return {
        x: activeTooltipState.x, y: activeTooltipState.y,
        name: char.name, typeLabel: 'PC', typeColor: HUD.gold,
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
            x: activeTooltipState.x, y: activeTooltipState.y,
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
        const veh = (encounterProp?.vehicles ?? []).find(v => v.instanceId === slot.vehicleInstanceId)
        if (veh) return {
          x: activeTooltipState.x, y: activeTooltipState.y,
          name: veh.name,
          typeLabel: 'Vehicle',
          typeColor: veh.alignment === 'allied_npc' ? '#4EC87A' : '#E05252',
          vehicleStats: { silhouette: veh.silhouette, speed: veh.speed, handling: veh.handling, armor: veh.armor, defense: veh.defense },
          hullTrauma:   { current: veh.hullTraumaCurrent,   max: veh.hullTraumaThreshold },
          systemStrain: { current: veh.systemStrainCurrent,  max: veh.systemStrainThreshold },
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
          x: activeTooltipState.x, y: activeTooltipState.y,
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

    // Vehicle fallback: rectangle tokens not linked to an encounter slot (pre-combat placement).
    if (token.token_shape === 'rectangle' && token.label) {
      const staticVeh = vehStatCache.get(token.label)
      if (staticVeh) return {
        x: activeTooltipState.x, y: activeTooltipState.y,
        name: token.label,
        typeLabel: 'Vehicle',
        typeColor: '#E05252',
        vehicleStats: { silhouette: staticVeh.silhouette, speed: staticVeh.speed, handling: staticVeh.handling, armor: staticVeh.armor, defense: { fore: staticVeh.defFore, aft: staticVeh.defAft, port: staticVeh.defPort, starboard: staticVeh.defStarboard } },
        hullTrauma:   { current: 0, max: staticVeh.hullTrauma },
        systemStrain: { current: 0, max: staticVeh.systemStrain },
      }
    }

    return {
      x: activeTooltipState.x, y: activeTooltipState.y,
      name: token.label ?? '?',
      typeLabel: token.alignment ?? 'token',
      typeColor: HUD.gold,
    }
  }, [activeTooltipState, tokensById, characters, encounter, advStatCache, vehStatCache])

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
      setAdvTokenImages(prev => ({ ...prev, [adversaryKey]: data.publicUrl }))
    }
    setAdvTokenBusy(null)
  }, [supabase, setAdvTokenImages])

  const clearAdvToken = useCallback(async (adversaryKey: string) => {
    await supabase.from('adversary_token_images').delete().eq('adversary_key', adversaryKey)
    setAdvTokenImages(prev => { const n = { ...prev }; delete n[adversaryKey]; return n })
  }, [supabase, setAdvTokenImages])

  const handleTokenContextMenu = useCallback((tokenId: string, e: MouseEvent) => {
    e.preventDefault()
    const token = tokensById.get(tokenId)
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true })
  }, [tokensById])

  const closeTokenDrawer = useCallback(() => setTokenDrawerOpen(false), [])
  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const handleTokenHover = useCallback((tokenId: string, screenX: number, screenY: number) => {
    if (isDraggingRef.current) return
    lastTooltipPosRef.current = { x: screenX, y: screenY }
    setTooltipState({ tokenId, x: screenX, y: screenY })
  }, [])

  const handleTokenHoverEnd = useCallback(() => {
    setTooltipState(null)
  }, [])

  const handleTokenClick = useCallback((tokenId: string) => {
    onTokenClick?.(tokenId)
  }, [onTokenClick])

  const handleRemoveToken = useCallback(async (id: string) => {
    // If this token is linked to an initiative slot, remove the adversary/vehicle
    // from the encounter so both map and Enemies/Vehicles panel stay in sync.
    if (encounterProp) {
      const token = tokensById.get(id)
      if (token?.slot_key) {
        const slot = encounterProp.initiative_slots.find(s => s.id === token.slot_key)
        if (slot) {
          const updatedSlots = encounterProp.initiative_slots.filter(s => s.id !== token.slot_key)
          const partial: Partial<CombatEncounter> = { initiative_slots: updatedSlots }
          if (slot.adversaryInstanceId)
            partial.adversaries = encounterProp.adversaries.filter(a => a.instanceId !== slot.adversaryInstanceId)
          if (slot.vehicleInstanceId)
            partial.vehicles = (encounterProp.vehicles ?? []).filter(v => v.instanceId !== slot.vehicleInstanceId)
          await supabase
            .from('combat_encounters')
            .update({ ...partial, updated_at: new Date().toISOString() })
            .eq('id', encounterProp.id)
        }
      }
    }
    await removeToken(id)
  }, [encounterProp, tokensById, supabase, removeToken])

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
        {!previewMap && activeMap?.map_type === 'crawl' ? (
          <OpeningCrawlCanvas
            heading={activeMap.crawl_content?.heading ?? ''}
            subheading={activeMap.crawl_content?.subheading ?? ''}
            body={activeMap.crawl_content?.body ?? ''}
          />
        ) : (previewMap ?? activeMap) ? (
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
              onTokenClick={handleTokenClick}
              onTokenHoverEnd={handleTokenHoverEnd}
              onTokenDragStart={handleTokenDragStart}
              onTokenDragEnd={handleTokenDragEnd}
            />
            {previewMap && (
              <div style={{
                position: 'absolute', top: '0.625rem', left: '50%', transform: 'translateX(-50%)',
                zIndex: 'var(--z-overlay)' as unknown as number, display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
                borderRadius: '1.25rem', padding: '0.25rem 0.625rem 0.25rem 0.75rem',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.gold }}>
                  Preview: {previewMap.name}
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>· not live</span>
                <button
                  onClick={() => setPreviewMap(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_SM, lineHeight: 1, padding: '0 0.125rem', marginLeft: '0.125rem' }}
                >
                  ✕
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, color: HUD.gold, letterSpacing: '0.1em' }}>No Active Map</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>Upload a map and set it as active to get started.</div>
            {campaignId && (
              <button onClick={() => setUploadOpen(true)} style={{ ...btnTool, marginTop: '0.5rem' }}>↑ Upload Map</button>
            )}
          </div>
        )}

        {/* ── Floating toolbar (hidden on staging tab — pills toolbar takes over) ── */}
        {!isStagingTab && <div
          style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 'var(--z-overlay)' as unknown as number, pointerEvents: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Left: library toggle + upload */}
          <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'all' }}>
            <button
              onClick={() => setLibraryOpen(o => !o)}
              style={{
                ...btnTool,
                borderColor: libraryOpen ? 'var(--hud-border-active)' : 'color-mix(in srgb, var(--hud-accent) 35%, transparent)',
                color: libraryOpen ? HUD.gold : DIM,
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
            <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'all', alignItems: 'center' }}>
              {/* Token scale control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: PANEL_BG, border: `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`, borderRadius: RADIUS.md }}>
                <button
                  onClick={() => adjustTokenScale(-0.25)}
                  disabled={tokenScale <= 0.25}
                  style={{ background: 'transparent', border: 'none', color: tokenScale <= 0.25 ? 'rgba(150,168,180,0.25)' : HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.375rem 0.625rem', cursor: tokenScale <= 0.25 ? 'default' : 'pointer', lineHeight: 1 }}
                >
                  −
                </button>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.gold, minWidth: '2.625rem', textAlign: 'center', letterSpacing: '0.04em' }}>
                  {tokenScale.toFixed(2)}×
                </span>
                <button
                  onClick={() => adjustTokenScale(0.25)}
                  disabled={tokenScale >= 3.0}
                  style={{ background: 'transparent', border: 'none', color: tokenScale >= 3.0 ? 'rgba(150,168,180,0.25)' : HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.375rem 0.625rem', cursor: tokenScale >= 3.0 ? 'default' : 'pointer', lineHeight: 1 }}
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
                  borderColor: activeMap.is_visible_to_players ? 'rgba(78,200,122,0.45)' : 'color-mix(in srgb, var(--hud-accent) 35%, transparent)',
                }}
              >
                {activeMap.is_visible_to_players ? '◉ Visible' : '◯ Hidden'}
              </button>

              {/* Token Staging Drawer toggle */}
              <button
                onClick={() => setTokenDrawerOpen(o => !o)}
                style={{
                  ...btnTool,
                  color: tokenDrawerOpen ? 'var(--hud-gold)' : DIM,
                  borderColor: tokenDrawerOpen ? 'var(--hud-border-active)' : 'color-mix(in srgb, var(--hud-accent) 35%, transparent)',
                  background: tokenDrawerOpen ? 'rgba(150,168,180,0.1)' : PANEL_BG,
                }}
              >
                ◈ Tokens
              </button>
            </div>
          )}
        </div>}

        {/* ── Map library drawer — rendered via portal so it escapes overflow:hidden ── */}
        {mounted && (() => {
          const isOpen = libraryOpen
          const closeDrawer = () => setLibraryOpen(false)
          return createPortal(
            <>
              {/* Backdrop */}
              {isOpen && (
                <div
                  onClick={closeDrawer}
                  style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    zIndex: 'var(--z-backdrop)' as unknown as number,
                  }}
                />
              )}

              {/* Drawer */}
              <div
                style={{
                  position:      'fixed',
                  top:           '2.75rem',
                  left:          '3.25rem',
                  bottom:        0,
                  width:         'clamp(300px, 28vw, 420px)',
                  zIndex:        'var(--z-modal)' as unknown as number,
                  display:       'flex',
                  flexDirection: 'column',
                  background:    PANEL_BG,
                  borderRight:   `1px solid ${isOpen ? BORDER_HI : 'transparent'}`,
                  boxShadow:     isOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
                  transform:     isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 3.25rem))',
                  transition:    `transform ${EASE.panel}, border-color ${EASE.quick}, box-shadow ${EASE.quick}`,
                  pointerEvents: isOpen ? 'auto' : 'none',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 1rem', height: '3.125rem',
                  borderBottom: `1px solid ${BORDER}`,
                  background: PANEL_BG,
                }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.gold }}>
                    Map Library
                  </span>
                  <button
                    onClick={closeDrawer}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_LABEL, lineHeight: 1, padding: '0.25rem 0.375rem' }}
                  >
                    ✕
                  </button>
                </div>

                {/* ── Planet search + new planet ── */}
                <div style={{ flexShrink: 0, borderBottom: `1px solid ${BORDER}`, padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                  <input
                    value={planetSearch}
                    onChange={e => setPlanetSearch(e.target.value)}
                    placeholder="Search planets…"
                    style={darkInput}
                  />
                  {newPlanetOpen ? (
                    <div style={{ display: 'flex', gap: '0.3125rem' }}>
                      <input
                        value={newPlanetName}
                        onChange={e => setNewPlanetName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') void handleCreatePlanet(); if (e.key === 'Escape') { setNewPlanetOpen(false); setNewPlanetName('') } }}
                        placeholder="Planet name…"
                        autoFocus
                        style={{ ...darkInput, flex: 1, padding: '0.3125rem 0.5rem' }}
                      />
                      <button
                        onClick={() => void handleCreatePlanet()}
                        disabled={planetBusy || !newPlanetName.trim()}
                        style={{ ...btnSmall, opacity: (!newPlanetName.trim() || planetBusy) ? 0.45 : 1, padding: '0 0.625rem' }}
                      >✓</button>
                      <button
                        onClick={() => { setNewPlanetOpen(false); setNewPlanetName('') }}
                        style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_SM, padding: '0 0.5rem', borderRadius: RADIUS.md, cursor: 'pointer' }}
                      >×</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => setNewPlanetOpen(true)}
                        style={{ flex: 1, padding: '0.3125rem 0', borderRadius: RADIUS.md, background: 'rgba(150,168,180,0.07)', border: '1px solid rgba(150,168,180,0.25)', color: 'var(--hud-gold)', fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                      >⊕ New Planet</button>
                      <button
                        onClick={() => { closeDrawer(); setUploadOpen(true) }}
                        disabled={!campaignId}
                        style={{ ...btnSmall, flex: 1, textAlign: 'center', padding: '0.3125rem 0' }}
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
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(224,80,80,0.06)', borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: 'var(--state-failure)', marginBottom: '0.375rem' }}>
                            Delete &quot;{planet.name}&quot;? Maps will become unassigned.
                          </div>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button onClick={() => setDeletePlanetConfirm(null)} style={{ flex: 1, padding: '0.25rem 0', borderRadius: RADIUS.sm, background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_CAPTION, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => void handleDeletePlanet(planet.id)} style={{ flex: 2, padding: '0.25rem 0', borderRadius: RADIUS.sm, background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)', color: 'var(--state-failure)', fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, cursor: 'pointer' }}>✕ Delete Planet</button>
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
                    <div style={{ padding: '0.75rem', fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>
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
                <div style={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
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
                  <div style={{ padding: '0.5rem 0.875rem', borderTop: `1px solid ${BORDER}`, fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM }}>
                    {tokens.length} token{tokens.length !== 1 ? 's' : ''} on map · Scroll to zoom · Drag to pan
                  </div>
                )}
              </div>
            </>,
            document.body,
          )
        })()}

        {/* ── Token tooltip (hover, read-only) ── */}
        {mounted && tooltipState && tooltipProps && (
          <TokenTooltip {...tooltipProps} />
        )}

        {/* ── Token context menu (right-click on canvas token) ── */}
        {contextMenu && (
          <TokenContextMenu
            contextMenu={contextMenu}
            onToggleVisibility={toggleVisibility}
            onRemoveToken={handleRemoveToken}
            onClose={closeContextMenu}
          />
        )}

        {/* ── MapToolsRadial floating widget (staging only) ── */}
        {isStagingTab && campaignId && (
          <MapToolsRadial
            campaignId={campaignId}
            allMaps={allMaps.filter(m => (m.map_type ?? 'standard') !== 'crawl')}
            activeMap={activeMap}
            onDeleteMap={onDeleteMap}
            tokenScale={tokenScale}
            adjustTokenScale={adjustTokenScale}
          />
        )}

        {/* ── Encounter Deck (staging only) ──
             TEMPORARY stub wiring for Task 9's standalone shell verification —
             no-op props stand in for the real encounter/token plumbing until
             Task 12 replaces this mount with the wired-up version. */}
        {isStagingTab && (
          <EncounterDeck
            campaignId={campaignId ?? ''}
            encounter={encounterProp}
            setEncounter={() => {}}
            saveEncounter={async () => {}}
            tokens={tokens}
            addToken={addToken}
            removeToken={removeToken}
            toggleVisibility={toggleVisibility}
            updateTokenWoundPct={async () => {}}
            markPending={() => {}}
            clearPending={() => {}}
            stagingAddToEncounter={async () => {}}
            open={deckOpenLocal}
            onOpenChange={setDeckOpenLocal}
            characters={characters}
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
          onRemoveToken={handleRemoveToken}
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
        zIndex: 'var(--z-dialog)' as unknown as number, background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
        borderRadius: RADIUS.lg, boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        overflow: 'hidden', minWidth: 160,
      }}
    >
      <button
        onClick={async () => { await onToggleVisibility(contextMenu.tokenId, !contextMenu.isVisible); onClose() }}
        className="hov-gold-bg"
        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5625rem 0.875rem', fontFamily: FONT_BODY, fontSize: FS_LABEL, color: TEXT, borderBottom: `1px solid ${BORDER}` }}
      >
        {contextMenu.isVisible ? '◉ Hide from players' : '◉ Show to players'}
      </button>
      <button
        onClick={async () => { await onRemoveToken(contextMenu.tokenId); onClose() }}
        className="hov-red-bg"
        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5625rem 0.875rem', fontFamily: FONT_BODY, fontSize: FS_LABEL, color: 'var(--state-failure)' }}
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
  soakLabel?:     string
  defMelee?:      number | null
  defRanged?:     number | null
  wounds?:        { current: number; max: number }
  strain?:        { current: number; max: number }
  minionGroup?:   { alive: number; total: number }
  // Vehicle stat block (replaces characteristics + soak/defense for vehicles)
  vehicleStats?:  { silhouette: number; speed: number; handling: number; armor: number; defense: { fore: number; aft: number; port: number; starboard: number } }
  // Vehicle health bars (read-only)
  hullTrauma?:    { current: number; max: number }
  systemStrain?:  { current: number; max: number }
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
    <div
      style={{
        position: 'fixed', left, top, width: TOOLTIP_W, zIndex: 'var(--z-tooltip)' as unknown as number,
        background: PANEL_BG,
        border: `1px solid ${p.typeColor}44`,
        borderRadius: RADIUS.lg,
        boxShadow: `0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px ${p.typeColor}18`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '0.625rem 0.75rem',
        pointerEvents: 'none',
      }}
    >
      {/* Name + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.typeColor, background: `${p.typeColor}18`, border: `1px solid ${p.typeColor}35`, borderRadius: RADIUS.sm, padding: '1px 0.3125rem', flexShrink: 0 }}>{p.typeLabel}</div>
      </div>

      {/* Characteristics grid */}
      {p.characteristics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.1875rem', marginBottom: '0.5rem' }}>
          {CHAR_ABBRS.map((abbr, i) => (
            <div key={abbr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem 0.125rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>{abbr}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.gold }}>{p.characteristics![CHAR_KEYS[i]]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle stat block: SIL / SPD / HDL / ARMOR + defense arcs */}
      {p.vehicleStats && (() => {
        const vs = p.vehicleStats!
        const hdlStr = vs.handling > 0 ? `+${vs.handling}` : String(vs.handling)
        const topRow = [{ l: 'SIL', v: vs.silhouette }, { l: 'SPD', v: vs.speed }, { l: 'HDL', v: hdlStr }, { l: 'ARMOR', v: vs.armor }]
        const arcRow = [{ l: 'DEF F', v: vs.defense.fore }, { l: 'DEF A', v: vs.defense.aft }, { l: 'DEF P', v: vs.defense.port }, { l: 'DEF S', v: vs.defense.starboard }]
        const cell = (l: string, v: string | number, gold = false) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem 0.125rem' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>{l}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: gold ? HUD.gold : TEXT }}>{v}</div>
          </div>
        )
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.1875rem', marginBottom: '0.25rem' }}>
              {topRow.map(({ l, v }) => cell(l, v, true))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.1875rem', marginBottom: '0.5rem' }}>
              {arcRow.map(({ l, v }) => cell(l, v))}
            </div>
          </>
        )
      })()}

      {/* Soak + Defense */}
      {(p.soak != null || p.defMelee != null || p.defRanged != null) && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {p.soak != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>{p.soakLabel ?? 'SOAK'}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.soak}</div>
            </div>
          )}
          {p.defMelee != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF M</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defMelee}</div>
            </div>
          )}
          {p.defRanged != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF R</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defRanged}</div>
            </div>
          )}
        </div>
      )}

      {/* Minion group count (hover read-only pips) */}
      {p.minionGroup && (
        <div style={{ marginBottom: '0.375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Group</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.minionGroup.alive === 0 ? 'var(--state-failure)' : TEXT }}>
              {p.minionGroup.alive}/{p.minionGroup.total} alive
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.1875rem' }}>
            {Array.from({ length: p.minionGroup.total }).map((_, i) => (
              <span key={i} style={{ fontSize: FS_OVERLINE, color: i < p.minionGroup!.alive ? p.typeColor : 'rgba(255,255,255,0.15)' }}>
                {i < p.minionGroup!.alive ? '■' : '□'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wounds bar */}
      {p.wounds && (
        <div style={{ marginBottom: p.strain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wounds</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.wounds.current >= p.wounds.max ? 'var(--state-failure)' : TEXT }}>{p.wounds.current}/{p.wounds.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.wounds.current / Math.max(p.wounds.max, 1)) * 100)}%`, background: p.wounds.current >= p.wounds.max ? 'var(--state-failure)' : 'var(--hud-gold)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}

      {/* Strain bar */}
      {p.strain && (
        <div style={{ marginTop: p.wounds ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Strain</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.strain.current >= p.strain.max ? 'var(--state-failure)' : TEXT }}>{p.strain.current}/{p.strain.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.strain.current / Math.max(p.strain.max, 1)) * 100)}%`, background: p.strain.current >= p.strain.max ? 'var(--state-failure)' : 'var(--state-success)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}

      {/* Vehicle health bars (read-only) */}
      {p.hullTrauma && (
        <div style={{ marginBottom: p.systemStrain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hull Trauma</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.hullTrauma.current >= p.hullTrauma.max ? 'var(--state-failure)' : TEXT }}>{p.hullTrauma.current}/{p.hullTrauma.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.hullTrauma.current / Math.max(p.hullTrauma.max, 1)) * 100)}%`, background: p.hullTrauma.current >= p.hullTrauma.max ? 'var(--state-failure)' : 'var(--hud-gold)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}
      {p.systemStrain && (
        <div style={{ marginTop: p.hullTrauma ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sys Strain</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.systemStrain.current >= p.systemStrain.max ? 'var(--state-failure)' : TEXT }}>{p.systemStrain.current}/{p.systemStrain.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.systemStrain.current / Math.max(p.systemStrain.max, 1)) * 100)}%`, background: p.systemStrain.current >= p.systemStrain.max ? 'var(--state-failure)' : 'var(--state-success)', borderRadius: RADIUS.sm }} />
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
        borderLeft: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.875rem 0.875rem 0.625rem',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.14em', color: HUD.gold }}>
          ◈ TOKENS
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_LABEL, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Section A: Adversaries ── */}
        {npcSlots.length > 0 && (
          <>
            <div style={{ padding: '0.625rem 0.875rem 0.375rem', fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', borderBottom: `1px solid ${BORDER}` }}>
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
                <div key={p.slotId} style={{ padding: '0.625rem 0.75rem', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {advImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={advImg} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid color-mix(in srgb, ${tokenColor} 38%, transparent)` }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `color-mix(in srgb, ${tokenColor} 12%, transparent)`, border: `2px solid color-mix(in srgb, ${tokenColor} 31%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: tokenColor }}>
                        {label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>{badge}</div>
                    </div>
                    {activeMap && (
                      isOnMap
                        ? <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                        : <button onClick={() => void onAddAdversaryToken(p)} style={btnSmall}>+ Add</button>
                    )}
                  </div>

                  {!advImg && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', cursor: advTokenBusy === p.name ? 'wait' : 'pointer' }}>
                      <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void onAdvTokenUpload(p.name, f) }} />
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>{advTokenBusy === p.name ? 'Uploading…' : '↑ Upload Image'}</span>
                      <span style={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: FS_OVERLINE, color: 'rgba(150,168,180,0.3)' }}>· Used as token on the map</span>
                    </label>
                  )}

                  {advImg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void onAdvTokenUpload(p.name, f) }} />
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>↑ Replace image</span>
                      </label>
                      <span style={{ color: BORDER_HI }}>·</span>
                      <button onClick={() => void onClearAdvToken(p.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: 'var(--state-failure)', padding: 0 }}>Remove</button>
                    </div>
                  )}

                  {isOnMap && mapToken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                        style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: RADIUS.sm, padding: '0.25rem 0.5rem', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: `background ${EASE.quick}` }}
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
            <div style={{ padding: '0.625rem 0.875rem 0.375rem', fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', borderBottom: `1px solid ${BORDER}`, borderTop: `1px solid ${BORDER}` }}>
              Vehicles
            </div>

            {vehicleSlots.map(p => {
              const isOnMap    = onMapSlotKeys.has(p.slotId)
              const mapToken   = tokensBySlotKey.get(p.slotId) ?? null
              const tokenColor = p.alignment === 'allied_npc' ? '#4EC87A' : '#e05252'

              return (
                <div key={p.slotId} style={{ padding: '0.625rem 0.75rem', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {p.token_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.token_image_url} alt="" style={{ width: 40, height: 28, borderRadius: RADIUS.sm, objectFit: 'cover', flexShrink: 0, border: `2px solid color-mix(in srgb, ${tokenColor} 38%, transparent)` }} />
                    ) : (
                      <div style={{ width: 40, height: 28, borderRadius: RADIUS.sm, flexShrink: 0, background: `color-mix(in srgb, ${tokenColor} 12%, transparent)`, border: `2px solid color-mix(in srgb, ${tokenColor} 31%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: tokenColor }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>{p.alignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'} · VEHICLE</div>
                    </div>
                    {activeMap && (
                      isOnMap
                        ? <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                        : <button onClick={() => void onAddVehicleToken(p)} style={btnSmall}>+ Add</button>
                    )}
                  </div>

                  {isOnMap && mapToken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                        style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: RADIUS.sm, padding: '0.25rem 0.5rem', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: `background ${EASE.quick}` }}
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
        <div style={{ padding: '0.625rem 0.875rem 0.375rem', fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', borderBottom: `1px solid ${BORDER}`, borderTop: (npcSlots.length > 0 || vehicleSlots.length > 0) ? `1px solid ${BORDER}` : 'none' }}>
          Players
        </div>

        {activeCharacters.length === 0 && (
          <div style={{ padding: '0.75rem 0.875rem', fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>No active characters.</div>
        )}

        {activeCharacters.map(char => {
          const isOnMap  = onMapCharIds.has(char.id)
          const mapToken = tokensByCharId.get(char.id) ?? null

          return (
            <div key={char.id} style={{ padding: '0.625rem 0.75rem', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                {char.portrait_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={char.portrait_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(150,168,180,0.4)' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'rgba(150,168,180,0.15)', border: '2px solid rgba(150,168,180,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold }}>
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {char.name}
                </div>
                {activeMap && (
                  isOnMap
                    ? <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                    : <button onClick={() => void onAddCharacterToken(char)} style={btnSmall}>+ Add</button>
                )}
              </div>

              {isOnMap && mapToken && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => void onToggleVisibility(mapToken.id, !mapToken.is_visible)}
                    style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: RADIUS.sm, padding: '0.25rem 0.5rem', border: 'none', background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)', color: mapToken.is_visible ? GREEN : DIM, transition: `background ${EASE.quick}` }}
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
          <div style={{ padding: '0.625rem 0.75rem' }}>
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
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5625rem 0.75rem',
        borderBottom: `1px solid ${BORDER}`,
        background: expanded ? 'rgba(150,168,180,0.05)' : hovered ? 'rgba(150,168,180,0.02)' : 'transparent',
        cursor: 'pointer', userSelect: 'none', transition: `background ${EASE.quick}`,
      }}
    >
      <span style={{ color: expanded ? HUD.gold : DIM, fontSize: FS_OVERLINE, flexShrink: 0, lineHeight: 1 }}>
        {expanded ? '▾' : '▶'}
      </span>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: expanded ? HUD.gold : TEXT,
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>{count}</span>
      {onDelete && (hovered || expanded) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title={`Delete ${label}`}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(224,80,80,0.55)', fontSize: FS_SM, lineHeight: 1, padding: '0 0.125rem', flexShrink: 0, marginLeft: '0.125rem' }}
        >×</button>
      )}
    </div>
  )
}

function LibFolderEmpty({ label }: { label: string }) {
  return (
    <div style={{ padding: '0.625rem 1.25rem', fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, borderBottom: `1px solid ${BORDER}` }}>
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
      padding: '0.5rem 0.75rem 0.5rem 1.25rem',
      borderBottom: `1px solid ${BORDER}`,
      background: map.is_active ? 'rgba(150,168,180,0.05)' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {map.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={map.image_url} alt={map.name}
            style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: RADIUS.sm, border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`, flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 36, height: 26, borderRadius: RADIUS.sm, border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`, flexShrink: 0, background: 'var(--hud-surface-lo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--hud-text-faint)' }}>✦</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700, color: map.is_active ? HUD.gold : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {map.name}
            {map.is_active && <span style={{ marginLeft: '0.375rem', fontSize: FS_OVERLINE, color: HUD.gold }}>★ ACTIVE</span>}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM }}>
            {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
            {map.is_visible_to_players && <span style={{ marginLeft: '0.375rem', color: GREEN }}>● Visible</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.1875rem', flexShrink: 0 }}>
          <button onClick={onLoad} title="Load on GM canvas" style={{ background: 'rgba(150,168,180,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.1875rem 0.4375rem', borderRadius: RADIUS.sm, cursor: 'pointer' }}>Load</button>
          <button onClick={onEdit} title="Edit in Map Forge" style={{ background: 'rgba(150,168,180,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.1875rem 0.4375rem', borderRadius: RADIUS.sm, cursor: 'pointer' }}>Edit</button>
          {!map.is_active && (
            <button onClick={onSetActive} disabled={busy} style={{ background: 'rgba(150,168,180,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.1875rem 0.4375rem', borderRadius: RADIUS.sm, cursor: 'pointer' }}>Set Active</button>
          )}
          <button onClick={onDelete} style={btnDanger} title="Delete map">×</button>
        </div>
      </div>
      {/* Planet assignment */}
      <div style={{ marginTop: '0.3125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Planet:</span>
        <select
          value={map.planet_id ?? ''}
          onChange={e => onAssignPlanet(e.target.value || null)}
          style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, color: map.planet_id ? TEXT : DIM, fontFamily: FONT_BODY, fontSize: FS_CAPTION, padding: '0.125rem 0.25rem', flex: 1, minWidth: 0, cursor: 'pointer', outline: 'none' }}
        >
          <option value="">— none —</option>
          {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
    </div>
  )
}
