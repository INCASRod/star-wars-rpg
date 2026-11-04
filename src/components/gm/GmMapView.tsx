'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'
import type { MapToken, TokenGeometryPatch } from '@/hooks/useMapTokens'
import { MapCanvas, type MapCanvasHandle } from '@/components/map/MapCanvas'
import { OpeningCrawlCanvas } from '@/components/map/OpeningCrawlCanvas'
import { useMapTokens } from '@/hooks/useMapTokens'
import { useMapPlanets } from '@/hooks/useMapPlanets'
import type { MapPlanet } from '@/hooks/useMapPlanets'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { HUD, FONT_BODY, RADIUS } from '@/lib/tokens'
import { MapToolsRadial } from '@/app/gm/MapToolsRadial'
import { EncounterDeck, benchEntry, deployEntry, removeEntry } from '@/components/gm/EncounterDeck'
import { EncounterDossier } from '@/components/gm/EncounterDossier'
import { NumberField } from '@/components/ui/NumberField'
import { TokenGeometryInspector } from '@/components/gm/TokenGeometryInspector'

/* ── Design tokens ─────────────────────────────────────── */
const BG  = 'var(--hud-bg)'
const DIM  = 'var(--hud-text-dim)'
const TEXT = 'var(--hud-text)'
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

interface ContextMenuState {
  tokenId:   string
  x:         number
  y:         number
  isVisible: boolean
  /** Vehicle token (rectangle, not a pointer) — offers "Resize / rotate". */
  canResize: boolean
  /** Token footprint in page coordinates, for anchoring the inspector. */
  tokenRect: DOMRect
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
              <NumberField value={gridSize} onChange={e => setGridSize(Math.max(10, Number(e.target.value)))} style={{ ...darkInput, width: 64, textAlign: 'center' }} />
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
  onStagingUpdateGeometry?:    (id: string, geo: TokenGeometryPatch) => Promise<void>
  onStagingPreviewGeometry?:   (id: string, geo: TokenGeometryPatch | null) => void
  /** Fired on a genuine tap (not a drag) on a map token — used by the Encounter Deck to focus the corresponding card. */
  onTokenClick?:               (tokenId: string, sourceRect: DOMRect) => void
  /** Encounter Deck open/close state — lifted to GmShell so the left rail button can toggle it. */
  deckOpen?:                   boolean
  onDeckOpenChange?:           (open: boolean) => void
  /** Entity instanceId to highlight in the deck (set by GmShell's onTokenClick resolution). */
  focusedEntityId?:            string | null
  /** Reset/Lock handle + lock-state callback for the GM top bar (the map no longer draws them). */
  mapHandleRef?:               React.Ref<MapCanvasHandle>
  onMapLockChange?:            (locked: boolean) => void
  /** Optional controlled hover link (GmShell owns it so the initiative strip shares it). Falls back to internal state. */
  hoveredTokenId?:             string | null
  onHoveredTokenIdChange?:     (tokenId: string | null) => void
  /** Encounter Dossier state — lifted to GmShell, mirrors deckOpen/focusedEntityId. */
  dossierEntityId?:           string | null
  dossierSourceRect?:         DOMRect | null
  onOpenDossier?:              (entityId: string, rect: DOMRect) => void
  onCloseDossier?:             () => void
  setStagingEncounter?:        React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  saveStagingEncounter?:       (partial: Partial<CombatEncounter>) => Promise<void>
  updateTokenWoundPct?:        (id: string, wound_pct: number) => Promise<void>
  renameToken?:                (id: string, label: string) => Promise<void>
  markEncounterPending?:       (key: string) => void
  clearEncounterPending?:      (key: string) => void
  stagingAddToEncounter?:      (adv: import('@/lib/adversaries').Adversary, alignment: 'enemy' | 'allied_npc') => Promise<void>
}

export function GmMapView({
  campaignId, encounter: encounterProp, characters, allMaps, activeMap, onDeleteMap, isStagingTab,
  stagingTokens, onStagingMoveToken, onStagingToggleVisibility, onStagingRemoveToken, onStagingAddToken, onStagingUpdateGeometry, onStagingPreviewGeometry, onTokenClick,
  deckOpen, onDeckOpenChange, focusedEntityId, mapHandleRef, onMapLockChange, hoveredTokenId: hoveredTokenIdProp, onHoveredTokenIdChange, setStagingEncounter, saveStagingEncounter,
  updateTokenWoundPct, renameToken, markEncounterPending, clearEncounterPending, stagingAddToEncounter,
  dossierEntityId, dossierSourceRect, onOpenDossier, onCloseDossier,
}: GmMapViewProps) {
  const supabase = useMemo(() => createClient(), [])


  const [mounted,          setMounted]          = useState(false)
  const [uploadOpen,       setUploadOpen]       = useState(false)

  // Planet state — owned by useMapPlanets (fetch + realtime)
  const { planets }                        = useMapPlanets(campaignId ?? '')
  // Counter incremented whenever the map area's height changes (e.g. the
  // Encounter Deck's open/close animation completes) — passed to MapCanvas
  // as recentreSignal so it re-runs rebuildMap and recentres the map within
  // the new visible canvas area.
  const [recentreSignal, setRecentreSignal] = useState(0)
  const handleMapAreaResize = useCallback(() => setRecentreSignal(s => s + 1), [])
  const [contextMenu,      setContextMenu]      = useState<ContextMenuState | null>(null)
  const [tooltipState,     setTooltipState]     = useState<TooltipState | null>(null)
  const isDraggingRef = useRef(false)
  const lastTooltipPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [previewMap,       setPreviewMap]       = useState<ActiveMap | null>(null)
  const { tokenImages: advTokenImages, setTokenImages: setAdvTokenImages } = useAdversaryTokenImages()
  const { tokenImages: vehTokenImages, setTokenImages: setVehTokenImages } = useVehicleTokenImages()
  // token_scale lives on the maps row; realtime propagates it to all clients automatically
  const tokenScale = activeMap?.token_scale ?? 1.0

  const adjustTokenScale = useCallback((delta: number) => {
    if (!activeMap) return
    const next = Math.round(Math.max(0.25, Math.min(3.0, (activeMap.token_scale ?? 1) + delta)) * 100) / 100
    supabase.from('maps').update({ token_scale: next }).eq('id', activeMap.id)
      .then(({ error }) => { if (error) console.warn('[token scale]', error.message) })
  }, [activeMap, supabase])

  // When staging tab passes its own token state, use it — avoids dual subscriptions causing stale canvas
  const { tokens: hookTokens, moveToken: hookMoveToken, toggleVisibility: hookToggleVisibility, removeToken: hookRemoveToken, addToken: hookAddToken, updateTokenGeometry: hookUpdateGeometry, previewTokenGeometry: hookPreviewGeometry } = useMapTokens(isStagingTab ? null : (activeMap?.id ?? null))
  const tokens          = isStagingTab ? (stagingTokens ?? [])           : hookTokens
  const moveToken       = isStagingTab ? (onStagingMoveToken       ?? hookMoveToken)       : hookMoveToken
  const toggleVisibility = isStagingTab ? (onStagingToggleVisibility ?? hookToggleVisibility) : hookToggleVisibility
  const removeToken     = isStagingTab ? (onStagingRemoveToken     ?? hookRemoveToken)     : hookRemoveToken
  const addToken        = isStagingTab ? (onStagingAddToken        ?? hookAddToken)        : hookAddToken
  const updateGeometry  = isStagingTab ? (onStagingUpdateGeometry  ?? hookUpdateGeometry)  : hookUpdateGeometry
  const previewGeometry  = isStagingTab ? (onStagingPreviewGeometry ?? hookPreviewGeometry) : hookPreviewGeometry

  useEffect(() => { setMounted(true) }, [])


  const tokensById = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) m.set(t.id, t)
    return m
  }, [tokens])



  const activeTooltipState = tooltipState

  // NPC/vehicle tooltips removed (Prompt 11) — the Encounter Deck's cards and
  // the dossier already surface that information, so this hover glance is now
  // PC-only. PC content/styling below is unchanged from before this prompt.
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

    return null
  }, [activeTooltipState, tokensById, characters])


















  const handleTokenContextMenu = useCallback((tokenId: string, e: MouseEvent, tokenRect: DOMRect) => {
    e.preventDefault()
    const token = tokensById.get(tokenId)
    const canResize = !!token && token.token_shape === 'rectangle' && !token.token_type?.startsWith('pointer_')
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true, canResize, tokenRect })
  }, [tokensById])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  // Geometry inspector (vehicle tokens only) — opened from the token context menu.
  const [geometryTarget, setGeometryTarget] = useState<{ tokenId: string; rect: DOMRect } | null>(null)
  const closeGeometry = useCallback(() => setGeometryTarget(null), [])
  const geometryToken = geometryTarget ? tokensById.get(geometryTarget.tokenId) ?? null : null
  // On-canvas handles (MapCanvas `geometryEdit`) exist only while the inspector is open for this token.
  // A handle commit is forwarded to the inspector via `handleCommit` so its "last saved" stays correct.
  const [handleCommit, setHandleCommit] = useState<{ seq: number; geo: TokenGeometryPatch } | null>(null)
  const geometryTokenId = geometryToken?.id ?? null
  const geometryEdit = useMemo(() => geometryTokenId ? {
    tokenId:   geometryTokenId,
    onPreview: (geo: TokenGeometryPatch) => previewGeometry(geometryTokenId, geo),
    onCommit:  (geo: TokenGeometryPatch) => {
      void updateGeometry(geometryTokenId, geo)
      setHandleCommit(prev => ({ seq: (prev?.seq ?? 0) + 1, geo }))
    },
  } : null, [geometryTokenId, previewGeometry, updateGeometry])

  // Card ↔ token hover glow (Prompt 5). One shared signal, colocated here
  // since EncounterDeck and MapCanvas are both children of this component —
  // no need to lift further to GmShell. Card hover sets this directly
  // (EncounterDeck already resolves the correct map_tokens.id per card via
  // RosterEntry.tokenId); real token hover sets it too, reusing the
  // existing handleTokenHover/handleTokenHoverEnd tooltip callbacks rather
  // than adding a second Pixi-side hover path.
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null)
  const hoveredTokenId = hoveredTokenIdProp !== undefined ? hoveredTokenIdProp : internalHoveredId
  const hoveredIdRef = useRef(hoveredTokenId)
  useEffect(() => { hoveredIdRef.current = hoveredTokenId }, [hoveredTokenId])
  const setHoveredTokenId = useCallback((id: string | null) => {
    if (onHoveredTokenIdChange) onHoveredTokenIdChange(id)
    else setInternalHoveredId(id)
  }, [onHoveredTokenIdChange])

  const handleTokenHover = useCallback((tokenId: string, screenX: number, screenY: number) => {
    if (isDraggingRef.current) return
    lastTooltipPosRef.current = { x: screenX, y: screenY }
    setTooltipState({ tokenId, x: screenX, y: screenY })
    setHoveredTokenId(tokenId)
  }, [setHoveredTokenId])

  // tokenId is whichever token this "leaving" event is for — MapCanvas's 60ms
  // per-token debounce means this can arrive after the pointer has already
  // landed on a different token, so only clear state if it's still about
  // that same token; otherwise this is stale and would wipe out the NEW
  // token's tooltip/glow a moment after it appeared (Prompt 14).
  const handleTokenHoverEnd = useCallback((tokenId: string) => {
    setTooltipState(prev => (prev?.tokenId === tokenId ? null : prev))
    if (hoveredIdRef.current === tokenId) setHoveredTokenId(null)
  }, [setHoveredTokenId])

  const handleTokenClick = useCallback((tokenId: string, sourceRect: DOMRect) => {
    onTokenClick?.(tokenId, sourceRect)
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
              geometryEdit={geometryEdit}
              tokenScale={tokenScale}
              onTokenHover={handleTokenHover}
              onTokenClick={handleTokenClick}
              onTokenHoverEnd={handleTokenHoverEnd}
              highlightedTokenId={hoveredTokenId}
              onTokenDragStart={handleTokenDragStart}
              onTokenDragEnd={handleTokenDragEnd}
              recentreSignal={recentreSignal}
              handleRef={mapHandleRef}
              onLockChange={onMapLockChange}
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
            onResize={() => { setGeometryTarget({ tokenId: contextMenu.tokenId, rect: contextMenu.tokenRect }); closeContextMenu() }}
            onClose={closeContextMenu}
          />
        )}

        {/* ── Token geometry inspector (GM only, vehicle tokens) ── */}
        {mounted && geometryTarget && geometryToken && (
          <TokenGeometryInspector
            key={geometryTarget.tokenId}
            token={geometryToken}
            anchor={geometryTarget.rect}
            onPreview={previewGeometry}
            onCommit={updateGeometry}
            onClose={closeGeometry}
            externalCommit={handleCommit}
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

        {/* ── Encounter Deck (staging only) ── */}
        {isStagingTab && setStagingEncounter && saveStagingEncounter && updateTokenWoundPct
          && markEncounterPending && clearEncounterPending && stagingAddToEncounter && (
          <EncounterDeck
            campaignId={campaignId ?? ''}
            encounter={encounterProp}
            setEncounter={setStagingEncounter}
            saveEncounter={saveStagingEncounter}
            tokens={tokens}
            addToken={addToken}
            removeToken={removeToken}
            toggleVisibility={toggleVisibility}
            updateTokenWoundPct={updateTokenWoundPct}
            markPending={markEncounterPending}
            clearPending={clearEncounterPending}
            stagingAddToEncounter={stagingAddToEncounter}
            hoveredTokenId={hoveredTokenId}
            onHoverToken={setHoveredTokenId}
            open={deckOpen ?? false}
            onOpenChange={onDeckOpenChange ?? (() => {})}
            characters={characters}
            onMapAreaResize={handleMapAreaResize}
            focusedEntityId={focusedEntityId}
            activeMapId={activeMap?.id ?? null}
            onOpenDossier={onOpenDossier}
            advImages={advTokenImages}
            vehImages={vehTokenImages}
          />
        )}

        {/* ── Encounter Dossier (expanded card view, staging only) ── */}
        {isStagingTab && setStagingEncounter && saveStagingEncounter && updateTokenWoundPct && renameToken
          && markEncounterPending && clearEncounterPending && (
          <EncounterDossier
            entityId={dossierEntityId ?? null}
            sourceRect={dossierSourceRect ?? null}
            encounter={encounterProp}
            setEncounter={setStagingEncounter}
            saveEncounter={saveStagingEncounter}
            supabase={supabase}
            campaignId={campaignId ?? ''}
            tokens={tokens}
            updateTokenWoundPct={updateTokenWoundPct}
            renameToken={renameToken}
            markPending={markEncounterPending}
            clearPending={clearEncounterPending}
            activeMapId={activeMap?.id ?? null}
            advImages={advTokenImages}
            vehImages={vehTokenImages}
            setAdvImages={setAdvTokenImages}
            setVehImages={setVehTokenImages}
            onClose={() => onCloseDossier?.()}
            onToggleVisibility={toggleVisibility}
            onBenchDeploy={entry => {
              if (entry.isOnMap) {
                void benchEntry(entry, { encounter: encounterProp, tokens, removeToken })
              } else {
                void deployEntry(entry, { encounter: encounterProp, activeMapId: activeMap?.id ?? null, campaignId: campaignId ?? '', tokens, addToken })
              }
            }}
            onRemove={entry => {
              void removeEntry(entry, { encounter: encounterProp, tokens, saveEncounter: saveStagingEncounter, removeToken })
            }}
          />
        )}

        {/* Combat Check overlay mount removed here (Prompt 9) — the dossier's
            Combat Check tab rolls inline now, no more hand-off to
            CombatCheckOverlay. CombatCheckOverlay itself is untouched and
            still mounted by PlayerHUDDesktop.tsx for PC-side checks. */}
      </div>

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
  onResize:           () => void
  onClose:            () => void
}

const TokenContextMenu = memo(function TokenContextMenu({ contextMenu, onToggleVisibility, onRemoveToken, onResize, onClose }: TokenContextMenuProps) {
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
      {contextMenu.canResize && (
        <button
          onClick={onResize}
          className="hov-gold-bg"
          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5625rem 0.875rem', fontFamily: FONT_BODY, fontSize: FS_LABEL, color: TEXT, borderBottom: `1px solid ${BORDER}` }}
        >
          ⤢ Resize / rotate
        </button>
      )}
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

    </div>,
    document.body,
  )
})

