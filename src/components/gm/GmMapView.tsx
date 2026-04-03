'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
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
interface CombatParticipant {
  id: string
  campaign_id: string
  character_id: string | null
  slot_type: string
  is_minion_group: boolean
  adversary_type: string | null
  active_character_name: string | null
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
  campaignId: string | null
  characters: Character[]
  allMaps:    ActiveMap[]
  activeMap:  ActiveMap | null
}

export function GmMapView({ campaignId, characters, allMaps, activeMap }: GmMapViewProps) {
  const supabase = useMemo(() => createClient(), [])

  const [uploadOpen,    setUploadOpen]    = useState(false)
  const [libraryOpen,   setLibraryOpen]   = useState(false)
  const [addTokenOpen,  setAddTokenOpen]  = useState(false)
  const [contextMenu,   setContextMenu]   = useState<ContextMenuState | null>(null)
  const [participants,  setParticipants]  = useState<CombatParticipant[]>([])
  const [advTokens,     setAdvTokens]     = useState<AdversaryTokenImage[]>([])
  const [busy,          setBusy]          = useState(false)

  const { tokens, moveToken, toggleVisibility, removeToken, addToken } = useMapTokens(activeMap?.id ?? null)

  // Load combat participants (for adversary tokens)
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_participants')
      .select('id, campaign_id, character_id, slot_type, is_minion_group, adversary_type, active_character_name')
      .eq('campaign_id', campaignId)
      .then(({ data }) => { if (data) setParticipants(data as CombatParticipant[]) })
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load adversary token images
  useEffect(() => {
    supabase.from('adversary_token_images').select('*')
      .then(({ data }) => { if (data) setAdvTokens(data as AdversaryTokenImage[]) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Which participants/characters are already on the map
  const onMapCharIds        = useMemo(() => new Set(tokens.map(t => t.character_id).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])
  const onMapParticipantIds = useMemo(() => new Set(tokens.map(t => t.participant_id).filter(Boolean as unknown as (v: string | null) => v is string)), [tokens])

  // Available PCs — drawn from the characters prop directly (not combat_participants)
  // so the list is populated even when there's no active combat encounter.
  const availablePcs = useMemo(
    () => characters.filter(c => !c.archived_at && !onMapCharIds.has(c.id)),
    [characters, onMapCharIds]
  )

  // Available adversaries — from combat_participants only
  const availableAdvs = useMemo(
    () => participants.filter(p => p.slot_type === 'adversary' && !onMapParticipantIds.has(p.id)),
    [participants, onMapParticipantIds]
  )

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
    await supabase.from('maps').delete().eq('id', mapId)
  }

  // ── Token helpers ──────────────────────────────────────
  async function addCharacterToken(character: Character, x = 0.5, y = 0.5) {
    if (!activeMap || !campaignId) return
    const participant = participants.find(p => p.character_id === character.id)
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: 'pc',
      character_id:     character.id,
      participant_id:   participant?.id ?? null,
      label:            character.name,
      alignment:        'pc',
      x, y,
      is_visible:       true,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  character.portrait_url ?? null,
    })
  }

  async function addAdversaryToken(participant: CombatParticipant, x = 0.5, y = 0.5) {
    if (!activeMap || !campaignId) return
    const advKey = participant.adversary_type ?? participant.active_character_name ?? 'adversary'
    const advImg = advTokens.find(a => a.adversary_key === advKey)?.token_image_url ?? null
    const alignment = participant.is_minion_group
      ? 'minion'
      : participant.adversary_type === 'nemesis' ? 'nemesis' : 'rival'
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: 'adversary',
      character_id:     null,
      participant_id:   participant.id,
      label:            participant.active_character_name ?? participant.adversary_type ?? 'Enemy',
      alignment,
      x, y,
      is_visible:       true,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  advImg,
    })
  }

  async function addAllPlayers() {
    if (!activeMap || !campaignId) return
    const count = availablePcs.length
    if (count === 0) return
    for (let i = 0; i < count; i++) {
      await addCharacterToken(availablePcs[i], 0.5 + (i - count / 2) * 0.05, 0.5)
    }
    setAddTokenOpen(false)
  }

  function handleTokenContextMenu(tokenId: string, e: MouseEvent) {
    e.preventDefault()
    const token = tokens.find(t => t.id === tokenId)
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true })
  }

  // Close add-token dropdown on Escape
  useEffect(() => {
    if (!addTokenOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setAddTokenOpen(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [addTokenOpen])

  // ── Render ─────────────────────────────────────────────
  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', background: BG, overflow: 'hidden' }}
      onClick={() => { setContextMenu(null); setAddTokenOpen(false) }}
    >
      {/* ── Canvas ── */}
      {activeMap ? (
        <MapCanvas
          mapImageUrl={activeMap.image_url}
          tokens={tokens}
          isGM={true}
          currentCharacterId={null}
          onTokenMove={moveToken}
          gridEnabled={activeMap.grid_enabled}
          gridSize={activeMap.grid_size ?? 50}
          onTokenContextMenu={handleTokenContextMenu}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD, letterSpacing: '0.1em' }}>No Active Map</div>
          <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>Upload a map and set it as active to get started.</div>
          {campaignId && (
            <button onClick={() => setUploadOpen(true)} style={{ ...btnTool, marginTop: 8 }}>↑ Upload Map</button>
          )}
        </div>
      )}

      {/* ── Floating toolbar ── */}
      <div
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
          <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
            {/* Visibility toggle */}
            <button
              onClick={toggleVisibleToPlayers}
              style={{
                ...btnTool,
                color: activeMap.is_visible_to_players ? '#4EC87A' : DIM,
                borderColor: activeMap.is_visible_to_players ? 'rgba(78,200,122,0.45)' : 'rgba(200,170,80,0.35)',
              }}
            >
              {activeMap.is_visible_to_players ? '◉ Visible' : '◯ Hidden'}
            </button>

            {/* Add Token dropdown */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setAddTokenOpen(o => !o)} style={btnTool}>+ Add Token</button>

              {addTokenOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                  background: PANEL_BG,
                  border: '1px solid rgba(200,170,80,0.3)',
                  borderRadius: 8, zIndex: 100,
                  minWidth: 220, maxHeight: 260, overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
                }}>
                  {/* Add All Players */}
                  {availablePcs.length > 0 && (
                    <button
                      onClick={addAllPlayers}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'rgba(200,170,80,0.08)', border: 'none',
                        borderBottom: '1px solid rgba(200,170,80,0.2)',
                        cursor: 'pointer', padding: '8px 12px',
                        fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700,
                        color: GOLD, letterSpacing: '0.06em',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.16)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
                    >
                      ◉ Add All Players
                    </button>
                  )}

                  {/* Players section */}
                  {availablePcs.length > 0 && (
                    <>
                      <div style={{ padding: '5px 12px 3px', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)' }}>
                        Players
                      </div>
                      {availablePcs.map(char => (
                        <button
                          key={char.id}
                          onClick={async () => { await addCharacterToken(char); setAddTokenOpen(false) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '7px 12px', fontFamily: FR, fontSize: FS_LABEL, color: TEXT }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          ◈ {char.name}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Adversaries section */}
                  {availableAdvs.length > 0 && (
                    <>
                      <div style={{ padding: '5px 12px 3px', borderTop: availablePcs.length > 0 ? '1px solid rgba(200,170,80,0.15)' : 'none', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)' }}>
                        Adversaries
                      </div>
                      {availableAdvs.map(p => (
                        <button
                          key={p.id}
                          onClick={async () => { await addAdversaryToken(p); setAddTokenOpen(false) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '7px 12px', fontFamily: FR, fontSize: FS_LABEL, color: TEXT }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          ✕ {p.active_character_name ?? p.adversary_type ?? 'Enemy'}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Empty state */}
                  {availablePcs.length === 0 && availableAdvs.length === 0 && (
                    <div style={{ padding: '12px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, textAlign: 'center' }}>
                      All participants are on the map
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Map library drawer (left side) ── */}
      {libraryOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, zIndex: 40,
            background: PANEL_BG, borderRight: `1px solid ${BORDER_HI}`,
            display: 'flex', flexDirection: 'column',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Drawer header — padded top so it clears the floating toolbar */}
          <div style={{ padding: '52px 14px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.45)' }}>
              Map Library
            </div>
            <button
              onClick={() => setLibraryOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: '1.1rem', lineHeight: 1 }}
            >
              ×
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
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={map.image_url}
                  alt={map.name}
                  style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 3, border: `1px solid ${BORDER}`, flexShrink: 0 }}
                />
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: map.is_active ? GOLD : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {map.name}
                    {map.is_active && <span style={{ marginLeft: 6, fontSize: FS_OVERLINE, color: GOLD }}>★ ACTIVE</span>}
                  </div>
                  <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
                    {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
                    {map.is_visible_to_players && <span style={{ marginLeft: 6, color: '#4EC87A' }}>● Visible</span>}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
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

          {/* Footer: token count */}
          {activeMap && (
            <div style={{ padding: '8px 14px', borderTop: `1px solid ${BORDER}`, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
              {tokens.length} token{tokens.length !== 1 ? 's' : ''} on map · Scroll to zoom · Drag to pan
            </div>
          )}
        </div>
      )}

      {/* ── Token context menu ── */}
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

      {/* ── Upload modal ── */}
      {uploadOpen && campaignId && (
        <UploadModal campaignId={campaignId} onClose={() => setUploadOpen(false)} onSaved={() => setUploadOpen(false)} />
      )}
    </div>
  )
}
