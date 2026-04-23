'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'
import type { MapToken } from '@/hooks/useMapTokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { useMapTokens } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'

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

/* ── Upload modal ──────────────────────────────────────── */
function UploadModal({ campaignId, onClose, onSaved }: { campaignId: string; onClose: () => void; onSaved: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName]               = useState('')
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
  const [tokenDrawerOpen,  setTokenDrawerOpen]  = useState(false)
  const [contextMenu,      setContextMenu]      = useState<ContextMenuState | null>(null)
  const [encounter,        setEncounter]        = useState<EncounterRow | null>(null)
  const [previewMap,       setPreviewMap]       = useState<ActiveMap | null>(null)
  const [advTokens,        setAdvTokens]        = useState<AdversaryTokenImage[]>([])
  const [busy,             setBusy]             = useState(false)
  const [advTokenBusy,     setAdvTokenBusy]     = useState<string | null>(null)
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

  // Which characters/slots are already on the current map
  const onMapCharIds  = useMemo(() => new Set(tokens.map(t => t.character_id).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])
  const onMapSlotKeys = useMemo(() => new Set(tokens.map(t => t.slot_key).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])

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


  // ── Token helpers ──────────────────────────────────────
  // Tokens default hidden (is_visible: false) — GM reveals explicitly via drawer
  async function addCharacterToken(character: Character, x = 0.5, y = 0.5) {
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
  }

  async function addAdversaryToken(slot: NpcDrawerSlot, x = 0.5, y = 0.5) {
    if (!activeMap || !campaignId) return
    const advImg = advTokens.find(a => a.adversary_key === slot.name)?.token_image_url ?? null
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
  }

  async function addVehicleToken(slot: VehicleDrawerSlot, x = 0.5, y = 0.5) {
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
  }

  async function addAllPlayers() {
    if (!activeMap || !campaignId) return
    const count = availablePcs.length
    if (count === 0) return
    for (let i = 0; i < count; i++) {
      await addCharacterToken(availablePcs[i], 0.5 + (i - count / 2) * 0.05, 0.5)
    }
  }

  async function handleAdvTokenUpload(adversaryKey: string, file: File) {
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
  }

  async function clearAdvToken(adversaryKey: string) {
    await supabase.from('adversary_token_images').delete().eq('adversary_key', adversaryKey)
    setAdvTokens(prev => prev.filter(a => a.adversary_key !== adversaryKey))
  }

  function handleTokenContextMenu(tokenId: string, e: MouseEvent) {
    e.preventDefault()
    const token = tokens.find(t => t.id === tokenId)
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true })
  }

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

                {/* Map list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {allMaps.length === 0 && (
                    <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: '24px 0' }}>
                      No maps uploaded yet.
                    </div>
                  )}
                  {allMaps.map(map => (
                    <div
                      key={map.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                        background: map.is_active ? 'rgba(200,170,80,0.07)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`,
                        borderRadius: 6,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={map.image_url}
                        alt={map.name}
                        style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 3, border: `1px solid ${BORDER}`, flexShrink: 0 }}
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
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => { setPreviewMap(map); closeDrawer() }}
                          title="Load on GM canvas without going live"
                          style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 8px', borderRadius: 3, cursor: 'pointer' }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => router.push(`/gm/mapforge?campaign=${campaignId}&mapId=${map.id}&mapName=${encodeURIComponent(map.name)}&imageUrl=${encodeURIComponent(map.image_url)}`)}
                          title="Edit in Map Forge"
                          style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 8px', borderRadius: 3, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        {!map.is_active && (
                          <button
                            onClick={() => setActive(map.id)}
                            disabled={busy}
                            style={{ background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '3px 8px', borderRadius: 3, cursor: 'pointer' }}
                          >
                            Set Active
                          </button>
                        )}
                        <button onClick={() => deleteMap(map.id)} style={btnDanger} title="Delete map">×</button>
                      </div>
                    </div>
                  ))}
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

        {/* ── Token context menu (right-click on canvas token) ── */}
        {contextMenu && (
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
              onClick={async () => { await toggleVisibility(contextMenu.tokenId, !contextMenu.isVisible); setContextMenu(null) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '9px 14px', fontFamily: FR, fontSize: FS_LABEL, color: TEXT, borderBottom: `1px solid ${BORDER}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {contextMenu.isVisible ? '◉ Hide from players' : '◉ Show to players'}
            </button>
            <button
              onClick={async () => { await removeToken(contextMenu.tokenId); setContextMenu(null) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '9px 14px', fontFamily: FR, fontSize: FS_LABEL, color: '#E05050' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              ✕ Remove from map
            </button>
          </div>
        )}
      </div>

      {/* ══ TOKEN STAGING DRAWER (right, 280px) ══ */}
      {tokenDrawerOpen && (
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
              onClick={() => setTokenDrawerOpen(false)}
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
                  const advImg     = advTokens.find(a => a.adversary_key === p.name)?.token_image_url ?? null
                  const tokenColor = p.adversaryType === 'minion' ? '#e05252' : p.adversaryType === 'nemesis' ? '#a852e0' : '#FF9800'
                  const label      = p.name
                  const badge      = p.adversaryType === 'minion' ? 'MINION' : p.adversaryType === 'nemesis' ? 'NEMESIS' : 'RIVAL'
                  const isOnMap    = onMapSlotKeys.has(p.slotId)
                  const mapToken   = tokens.find(t => t.slot_key === p.slotId) ?? null

                  return (
                    <div key={p.slotId} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                      {/* Row: preview + info + add/on-map */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                        {/* Token preview (40×40) */}
                        {advImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={advImg} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${tokenColor}60` }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `${tokenColor}20`, border: `2px solid ${tokenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 16, fontWeight: 700, color: tokenColor }}>
                            {label.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name + badge */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {label}
                          </div>
                          <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>
                            {badge}
                          </div>
                        </div>

                        {/* Add / On map */}
                        {activeMap && (
                          isOnMap ? (
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                          ) : (
                            <button onClick={() => void addAdversaryToken(p)} style={btnSmall}>+ Add</button>
                          )
                        )}
                      </div>

                      {/* Token image upload (if no image yet) */}
                      {!advImg && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, cursor: advTokenBusy === p.name ? 'wait' : 'pointer' }}>
                          <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void handleAdvTokenUpload(p.name, f) }} />
                          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            {advTokenBusy === p.name ? 'Uploading…' : '↑ Upload Image'}
                          </span>
                          <span style={{ fontFamily: FR, fontStyle: 'italic', fontSize: FS_OVERLINE, color: 'rgba(200,170,80,0.3)' }}>
                            · Used as token on the map
                          </span>
                        </label>
                      )}

                      {/* Uploaded image controls (clear) */}
                      {advImg && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                            <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void handleAdvTokenUpload(p.name, f) }} />
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>↑ Replace image</span>
                          </label>
                          <span style={{ color: BORDER_HI }}>·</span>
                          <button onClick={() => clearAdvToken(p.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050', padding: 0 }}>Remove</button>
                        </div>
                      )}

                      {/* On-map controls: visibility toggle + remove from map */}
                      {isOnMap && mapToken && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <button
                            onClick={() => void toggleVisibility(mapToken.id, !mapToken.is_visible)}
                            style={{
                              flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                              letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                              padding: '4px 8px', border: 'none',
                              background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)',
                              color: mapToken.is_visible ? GREEN : DIM,
                              transition: '.15s',
                            }}
                          >
                            {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                          </button>
                          <button onClick={() => void removeToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
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
                  const isOnMap  = onMapSlotKeys.has(p.slotId)
                  const mapToken = tokens.find(t => t.slot_key === p.slotId) ?? null
                  const tokenColor = p.alignment === 'allied_npc' ? '#4EC87A' : '#e05252'

                  return (
                    <div key={p.slotId} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                        {/* Token preview (40×28 rectangle) */}
                        {p.token_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.token_image_url} alt="" style={{ width: 40, height: 28, borderRadius: 3, objectFit: 'cover', flexShrink: 0, border: `2px solid ${tokenColor}60` }} />
                        ) : (
                          <div style={{ width: 40, height: 28, borderRadius: 3, flexShrink: 0, background: `${tokenColor}20`, border: `2px solid ${tokenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 13, fontWeight: 700, color: tokenColor }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name + badge */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>
                            {p.alignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'} · VEHICLE
                          </div>
                        </div>

                        {/* Add / On map */}
                        {activeMap && (
                          isOnMap ? (
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                          ) : (
                            <button onClick={() => void addVehicleToken(p)} style={btnSmall}>+ Add</button>
                          )
                        )}
                      </div>

                      {/* On-map controls: visibility toggle + remove from map */}
                      {isOnMap && mapToken && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <button
                            onClick={() => void toggleVisibility(mapToken.id, !mapToken.is_visible)}
                            style={{
                              flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                              letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                              padding: '4px 8px', border: 'none',
                              background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)',
                              color: mapToken.is_visible ? GREEN : DIM,
                              transition: '.15s',
                            }}
                          >
                            {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                          </button>
                          <button onClick={() => void removeToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
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
              <div style={{ padding: '12px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                No active characters.
              </div>
            )}

            {activeCharacters.map(char => {
              const isOnMap  = onMapCharIds.has(char.id)
              const mapToken = tokens.find(t => t.character_id === char.id) ?? null

              return (
                <div key={char.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  {/* Row: portrait + name + add/on-map */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                    {/* Portrait (40×40) */}
                    {char.portrait_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={char.portrait_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(200,170,80,0.4)' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'rgba(200,170,80,0.15)', border: '2px solid rgba(200,170,80,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 16, fontWeight: 700, color: GOLD }}>
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name */}
                    <div style={{ flex: 1, fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {char.name}
                    </div>

                    {/* Add / On map */}
                    {activeMap && (
                      isOnMap ? (
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                      ) : (
                        <button onClick={() => void addCharacterToken(char)} style={btnSmall}>+ Add</button>
                      )
                    )}
                  </div>

                  {/* On-map controls: visibility toggle + remove from map */}
                  {isOnMap && mapToken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => void toggleVisibility(mapToken.id, !mapToken.is_visible)}
                        style={{
                          flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                          letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                          padding: '4px 8px', border: 'none',
                          background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)',
                          color: mapToken.is_visible ? GREEN : DIM,
                          transition: '.15s',
                        }}
                      >
                        {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                      </button>
                      <button onClick={() => void removeToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add All Players */}
            {activeMap && availablePcs.length > 0 && (
              <div style={{ padding: '10px 12px' }}>
                <button
                  onClick={() => void addAllPlayers()}
                  style={{ ...btnTool, width: '100%', justifyContent: 'center', display: 'flex' }}
                >
                  ◉ Add All Players
                </button>
              </div>
            )}

          </div>{/* end scrollable body */}
        </div>
      )}

      {/* ── Upload modal ── */}
      {uploadOpen && campaignId && (
        <UploadModal campaignId={campaignId} onClose={() => setUploadOpen(false)} onSaved={() => setUploadOpen(false)} />
      )}

    </div>
  )
}
