'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import type { ActiveMap } from '@/hooks/useActiveMap'
import type { MapToken } from '@/hooks/useMapTokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { useMapTokens } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'

/* ── Design tokens ───────────────────────────────────────────── */
const FR   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FC   = "var(--font-cinzel), 'Cinzel', serif"
const BG   = '#060D09'
const GOLD = '#C8AA50'
const DIM  = '#6A8070'
const TEXT = '#C8D8C0'
const PANEL_BG   = 'rgba(8,16,10,0.95)'
const BORDER     = 'rgba(200,170,80,0.14)'
const BORDER_HI  = 'rgba(200,170,80,0.36)'

const FS_OVERLINE = 'var(--text-overline, clamp(0.5625rem, 0.4vw + 0.4rem, 0.6875rem))'
const FS_CAPTION  = 'var(--text-caption,  clamp(0.625rem,  0.3vw + 0.5rem, 0.75rem))'
const FS_LABEL    = 'var(--text-label,    clamp(0.6875rem, 0.3vw + 0.55rem, 0.8125rem))'
const FS_SM       = 'var(--text-sm,       clamp(0.75rem,   0.25vw + 0.6rem, 0.875rem))'
const FS_H4       = 'var(--text-h4,       clamp(1rem,      1vw + 0.5rem, 1.375rem))'

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

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.12)',
  border: `1px solid rgba(200,170,80,0.35)`,
  color: GOLD,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 3,
  cursor: 'pointer',
}

const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.10)',
  border: `1px solid rgba(224,80,80,0.35)`,
  color: '#E05050',
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  padding: '5px 10px',
  borderRadius: 3,
  cursor: 'pointer',
}

const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.06)',
  border: `1px solid ${BORDER}`,
  color: DIM,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  padding: '4px 9px',
  borderRadius: 3,
  cursor: 'pointer',
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

/* ── Types ────────────────────────────────────────────────────── */
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

interface MapManagementPanelProps {
  campaignId:  string | null
  characters:  Character[]
  allMaps:     ActiveMap[]
  activeMap:   ActiveMap | null
}

/* ── Map import guide (collapsible) ─────────────────────────── */
function ImportGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
          padding: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <span>{open ? '▼' : '▶'}</span> Tips for finding or making maps
      </button>
      {open && (
        <div style={{
          marginTop: 10,
          fontFamily: FR,
          fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)',
          color: 'rgba(232,223,200,0.55)',
          lineHeight: 1.65,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'rgba(232,223,200,0.75)' }}>
            Recommended free tools:
          </div>
          <div>• Inkarnate — sci-fi &amp; fantasy maps</div>
          <div>• DungeonDraft — tactical dungeon maps</div>
          <div>• Dungeon Fog — atmospheric maps</div>
          <div>• Canva — quick layouts for simple encounters</div>
          <div style={{ fontWeight: 700, marginTop: 10, marginBottom: 6, color: 'rgba(232,223,200,0.75)' }}>
            Export settings that work well with HOLOCRON:
          </div>
          <div>• Resolution: 2000–4000px on the longest side</div>
          <div>• Format: PNG (best quality) or JPG</div>
          <div>• If your map has a grid: note the pixel size of each cell and enter it in the Grid Cell Size field above so tokens align correctly</div>
        </div>
      )}
    </div>
  )
}

/* ── Upload modal ─────────────────────────────────────────────── */
interface UploadModalProps {
  campaignId: string
  onClose:    () => void
  onSaved:    () => void
}

function UploadModal({ campaignId, onClose, onSaved }: UploadModalProps) {
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
        campaign_id: campaignId,
        name: name.trim(),
        image_url: urlData.publicUrl,
        grid_enabled: gridEnabled,
        grid_size: gridSize,
        is_active: false,
        is_visible_to_players: false,
      })
      onSaved()
      onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
          borderRadius: 8, padding: '24px 24px 20px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD, letterSpacing: '0.08em' }}>
            Upload New Map
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_H4, lineHeight: 1 }}>×</button>
        </div>

        <div>
          <div style={fieldLabel}>Map Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tatooine Cantina"
            style={darkInput}
          />
        </div>

        <div>
          <div style={fieldLabel}>Image File (JPG / PNG / WebP, max 10 MB)</div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={e => setGridEnabled(e.target.checked)}
              style={{ accentColor: GOLD, width: 15, height: 15 }}
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
                min={10} max={200}
              />
            </div>
          )}
        </div>

        <ImportGuide />

        {err && (
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050' }}>{err}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={btnSmall}>Cancel</button>
          <button onClick={handleSave} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Uploading…' : '↑ Upload Map'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── Edit map modal ────────────────────────────────────────────── */
interface EditMapModalProps {
  map:     ActiveMap
  onClose: () => void
  onSaved: (updates: Partial<ActiveMap>) => Promise<void>
}

function EditMapModal({ map, onClose, onSaved }: EditMapModalProps) {
  const [name, setName]               = useState(map.name)
  const [gridEnabled, setGridEnabled] = useState(map.grid_enabled)
  const [gridSize, setGridSize]       = useState(map.grid_size ?? 50)
  const [busy, setBusy]               = useState(false)

  async function handleSave() {
    setBusy(true)
    await onSaved({ name: name.trim(), grid_enabled: gridEnabled, grid_size: gridSize })
    setBusy(false)
    onClose()
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: PANEL_BG, border: `1px solid ${BORDER_HI}`, borderRadius: 8, padding: '20px 22px', width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: FC, fontSize: FS_H4, color: GOLD }}>Edit Map</div>
        <div>
          <div style={fieldLabel}>Name</div>
          <input value={name} onChange={e => setName(e.target.value)} style={darkInput} />
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
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSmall}>Cancel</button>
          <button onClick={handleSave} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── Token context menu ────────────────────────────────────────── */
interface ContextMenuState {
  tokenId: string
  x: number
  y: number
  isVisible: boolean
}

/* ── Adversary token image section ────────────────────────────── */
interface AdversaryTokenSectionProps {
  adversaryKey:  string
  adversaryName: string
  currentUrl:    string | null
  onUploaded:    (url: string) => void
  onCleared:     () => void
}

function AdversaryTokenSection({ adversaryKey, adversaryName, currentUrl, onUploaded, onCleared }: AdversaryTokenSectionProps) {
  const supabase = useMemo(() => createClient(), [])
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    if (!file || file.size > 2 * 1024 * 1024) return
    setBusy(true)
    const ext  = file.name.split('.').pop() ?? 'png'
    const path = `${adversaryKey}.${ext}`
    const { error } = await supabase.storage.from('tokens').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      await supabase.from('adversary_token_images').upsert({ adversary_key: adversaryKey, token_image_url: data.publicUrl })
      onUploaded(data.publicUrl)
    }
    setBusy(false)
  }

  return (
    <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(200,170,80,0.04)', border: `1px solid ${BORDER}`, borderRadius: 6 }}>
      <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.45)', marginBottom: 8 }}>
        Token Image — {adversaryName}
      </div>
      {currentUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={currentUrl} alt="token" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid rgba(200,170,80,0.4)` }} />
          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUrl.split('/').pop()}
          </span>
          <button onClick={onCleared} style={btnDanger} title="Remove token image">×</button>
        </div>
      ) : (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, padding: '14px 12px',
          border: `1px dashed rgba(200,170,80,0.25)`, borderRadius: 6,
          cursor: busy ? 'wait' : 'pointer',
          background: 'rgba(200,170,80,0.04)',
        }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
            {busy ? 'Uploading…' : 'Drop image here or click to upload'}
          </span>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: 'rgba(200,170,80,0.35)' }}>
            Square images recommended, 256×256
          </span>
        </label>
      )}
    </div>
  )
}

/* ── Main panel ────────────────────────────────────────────────── */
export function MapManagementPanel({ campaignId, characters, allMaps, activeMap }: MapManagementPanelProps) {
  const supabase = useMemo(() => createClient(), [])

  const [uploadOpen,  setUploadOpen]  = useState(false)
  const [editMap,     setEditMap]     = useState<ActiveMap | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ActiveMap | null>(null)
  const [busy,        setBusy]        = useState(false)
  const [participants, setParticipants] = useState<CombatParticipant[]>([])
  const [advTokens,   setAdvTokens]   = useState<AdversaryTokenImage[]>([])
  const [contextMenu,   setContextMenu]   = useState<ContextMenuState | null>(null)
  const [previewMap,    setPreviewMap]    = useState<ActiveMap | null>(null)
  const [addTokenOpen,  setAddTokenOpen]  = useState(false)

  // Token management from the active map
  const activeMapId = activeMap?.id ?? null
  const { tokens, moveToken, toggleVisibility, removeToken, addToken } = useMapTokens(activeMapId)

  // Preview map — default to activeMap
  useEffect(() => {
    if (activeMap && !previewMap) setPreviewMap(activeMap)
  }, [activeMap]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load combat participants for token placement
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
    supabase.from('adversary_token_images').select('*').then(({ data }) => {
      if (data) setAdvTokens(data as AdversaryTokenImage[])
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map actions ──────────────────────────────────────────────
  async function setActive(mapId: string) {
    if (!campaignId || busy) return
    setBusy(true)
    // Clear active flag on all maps in campaign first
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    await supabase.from('maps').update({ is_active: true }).eq('id', mapId)
    setBusy(false)
  }

  async function toggleVisible(mapId: string, current: boolean) {
    await supabase.from('maps').update({ is_visible_to_players: !current }).eq('id', mapId)
  }

  async function deleteMap(map: ActiveMap) {
    await supabase.from('maps').delete().eq('id', map.id)
    setDeleteConfirm(null)
  }

  async function saveMapEdits(updates: Partial<ActiveMap>) {
    if (!editMap) return
    await supabase.from('maps').update(updates).eq('id', editMap.id)
  }

  // ── Token placement from encounter ──────────────────────────
  async function placeTokensFromEncounter() {
    if (!activeMap || !campaignId) return
    setBusy(true)

    const existingParticipantIds = new Set(tokens.map(t => t.participant_id).filter(Boolean))
    const pcParticipants  = participants.filter(p => p.slot_type !== 'adversary' && p.character_id && !existingParticipantIds.has(p.id))
    const advParticipants = participants.filter(p => p.slot_type === 'adversary' && !existingParticipantIds.has(p.id))

    const inserts: Omit<MapToken, 'id' | 'updated_at'>[] = []

    // PCs — left side x=0.15
    pcParticipants.forEach((p, i) => {
      const char = characters.find(c => c.id === p.character_id)
      const ySpacing = pcParticipants.length > 1 ? 0.7 / (pcParticipants.length - 1) : 0
      inserts.push({
        map_id: activeMap.id,
        campaign_id: campaignId,
        participant_type: 'pc',
        character_id: p.character_id,
        participant_id: p.id,
        label: char?.name ?? p.active_character_name ?? 'PC',
        alignment: 'pc',
        x: 0.15,
        y: pcParticipants.length === 1 ? 0.5 : 0.15 + i * ySpacing,
        is_visible: true,
        token_size: 1.0,
        wound_pct: null,
        token_image_url: char?.portrait_url ?? null,
      })
    })

    // Adversaries — right side x=0.85
    advParticipants.forEach((p, i) => {
      const advKey = p.adversary_type ?? p.active_character_name ?? 'adversary'
      const advImg = advTokens.find(a => a.adversary_key === advKey)?.token_image_url ?? null
      const ySpacing = advParticipants.length > 1 ? 0.7 / (advParticipants.length - 1) : 0
      const alignment = p.is_minion_group ? 'minion' : (p.adversary_type === 'nemesis' ? 'nemesis' : 'rival')
      inserts.push({
        map_id: activeMap.id,
        campaign_id: campaignId,
        participant_type: 'adversary',
        character_id: null,
        participant_id: p.id,
        label: p.active_character_name ?? p.adversary_type ?? 'Enemy',
        alignment,
        x: 0.85,
        y: advParticipants.length === 1 ? 0.5 : 0.15 + i * ySpacing,
        is_visible: true,
        token_size: 1.0,
        wound_pct: null,
        token_image_url: advImg,
      })
    })

    for (const insert of inserts) {
      await addToken(insert)
    }
    setBusy(false)
  }

  // ── Context menu handler ──────────────────────────────────────
  function handleTokenContextMenu(tokenId: string, e: MouseEvent) {
    e.preventDefault()
    const token = tokens.find(t => t.id === tokenId)
    setContextMenu({ tokenId, x: e.clientX, y: e.clientY, isVisible: token?.is_visible ?? true })
  }

  // ── Adversary token images helpers ───────────────────────────
  function updateAdvToken(key: string, url: string) {
    setAdvTokens(prev => {
      const exists = prev.find(a => a.adversary_key === key)
      if (exists) return prev.map(a => a.adversary_key === key ? { ...a, token_image_url: url } : a)
      return [...prev, { adversary_key: key, token_image_url: url }]
    })
  }

  async function clearAdvToken(key: string) {
    await supabase.from('adversary_token_images').delete().eq('adversary_key', key)
    setAdvTokens(prev => prev.filter(a => a.adversary_key !== key))
  }

  // Unique adversary types from participants
  const adversaryParticipants = participants.filter(p => p.slot_type === 'adversary')
  const uniqueAdvTypes = useMemo(() => {
    const seen = new Set<string>()
    return adversaryParticipants.filter(p => {
      const key = p.adversary_type ?? p.active_character_name ?? ''
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [adversaryParticipants])

  // Computed: participants not yet on the active map
  const onMapParticipantIds = useMemo(() => new Set(tokens.map(t => t.participant_id).filter(Boolean)), [tokens])
  const onMapCharIds        = useMemo(() => new Set(tokens.map(t => t.character_id).filter(Boolean)),   [tokens])
  const availablePcs = useMemo(
    () => participants.filter(p => p.slot_type !== 'adversary' && p.character_id && !onMapParticipantIds.has(p.id) && !onMapCharIds.has(p.character_id)),
    [participants, onMapParticipantIds, onMapCharIds]
  )
  const availableAdvs = useMemo(
    () => participants.filter(p => p.slot_type === 'adversary' && !onMapParticipantIds.has(p.id)),
    [participants, onMapParticipantIds]
  )

  // ── Add Token helpers ────────────────────────────────────────
  async function addSingleToken(participant: CombatParticipant, x = 0.5, y = 0.5) {
    if (!activeMap || !campaignId) return
    const isPc   = participant.slot_type !== 'adversary'
    const char   = isPc ? characters.find(c => c.id === participant.character_id) : null
    const advKey = participant.adversary_type ?? participant.active_character_name ?? 'adversary'
    const advImg = !isPc ? (advTokens.find(a => a.adversary_key === advKey)?.token_image_url ?? null) : null
    const alignment = isPc
      ? 'pc'
      : participant.is_minion_group
        ? 'minion'
        : participant.adversary_type === 'nemesis' ? 'nemesis' : 'rival'
    await addToken({
      map_id:           activeMap.id,
      campaign_id:      campaignId,
      participant_type: isPc ? 'pc' : 'adversary',
      character_id:     participant.character_id,
      participant_id:   participant.id,
      label:            char?.name ?? participant.active_character_name ?? (isPc ? 'PC' : 'Enemy'),
      alignment,
      x,
      y,
      is_visible:       true,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  isPc ? (char?.portrait_url ?? null) : advImg,
    })
  }

  async function addAllPlayers() {
    if (!activeMap || !campaignId) return
    const count = availablePcs.length
    if (count === 0) return
    for (let i = 0; i < count; i++) {
      const offsetX = (i - count / 2) * 0.05
      await addSingleToken(availablePcs[i], 0.5 + offsetX, 0.5)
    }
    setAddTokenOpen(false)
  }

  // Close Add Token dropdown on Escape
  useEffect(() => {
    if (!addTokenOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setAddTokenOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [addTokenOpen])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => { setContextMenu(null); setAddTokenOpen(false) }}>

      {/* ── Map library ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.45)' }}>
          Maps
        </div>
        <button onClick={() => setUploadOpen(true)} style={btnPrimary}>
          + Upload New Map
        </button>
      </div>

      {allMaps.length === 0 && (
        <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: '24px 0' }}>
          No maps uploaded yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {allMaps.map(map => (
          <div
            key={map.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              background: map.is_active ? 'rgba(200,170,80,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`,
              borderRadius: 6,
            }}
          >
            {/* Thumbnail */}
            <img
              src={map.image_url}
              alt={map.name}
              style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 3, border: `1px solid ${BORDER}`, flexShrink: 0, cursor: 'pointer' }}
              onClick={() => setPreviewMap(map)}
            />

            {/* Name + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: map.is_active ? GOLD : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {map.name}
                {map.is_active && (
                  <span style={{ marginLeft: 8, fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.12em', color: GOLD }}>
                    ★ ACTIVE
                  </span>
                )}
              </div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
                {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
                {map.is_visible_to_players && <span style={{ marginLeft: 6, color: '#4EC87A' }}>● Visible</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap' }}>
              {map.is_active ? (
                <button
                  onClick={() => toggleVisible(map.id, map.is_visible_to_players)}
                  style={{ ...btnSmall, color: map.is_visible_to_players ? '#4EC87A' : DIM }}
                >
                  {map.is_visible_to_players ? 'Hide from Players' : 'Show to Players'}
                </button>
              ) : (
                <button onClick={() => setActive(map.id)} disabled={busy} style={btnSmall}>
                  Set Active
                </button>
              )}
              <button onClick={() => setEditMap(map)} style={btnSmall}>✎</button>
              <button onClick={() => setDeleteConfirm(map)} style={btnDanger}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active map preview + token management ── */}
      {activeMap && (
        <>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.45)' }}>
                ◉ Active Map Canvas
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {participants.length > 0 && (
                  <button onClick={placeTokensFromEncounter} disabled={busy} style={btnPrimary}>
                    ◉ Place Tokens from Encounter
                  </button>
                )}

                {/* ── Add Token dropdown ── */}
                <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setAddTokenOpen(o => !o)}
                    style={btnPrimary}
                  >
                    + Add Token
                  </button>

                  {addTokenOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                      background: 'rgba(6,13,9,0.97)',
                      border: '1px solid rgba(200,170,80,0.3)',
                      borderRadius: 8,
                      zIndex: 100,
                      minWidth: 220,
                      maxHeight: 240,
                      overflowY: 'auto',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    }}>
                      {/* Add All Players */}
                      {availablePcs.length > 0 && (
                        <button
                          onClick={addAllPlayers}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            background: 'rgba(200,170,80,0.08)',
                            border: 'none', borderBottom: '1px solid rgba(200,170,80,0.2)',
                            cursor: 'pointer', padding: '8px 12px',
                            fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700,
                            color: GOLD, letterSpacing: '0.06em',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.15)' }}
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
                          {availablePcs.map(p => {
                            const char  = characters.find(c => c.id === p.character_id)
                            const label = char?.name ?? p.active_character_name ?? 'PC'
                            return (
                              <button
                                key={p.id}
                                onClick={async () => { await addSingleToken(p); setAddTokenOpen(false) }}
                                style={{
                                  display: 'block', width: '100%', textAlign: 'left',
                                  background: 'transparent', border: 'none',
                                  cursor: 'pointer', padding: '7px 12px',
                                  fontFamily: FR, fontSize: FS_LABEL, color: TEXT,
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                              >
                                ◈ {label}
                              </button>
                            )
                          })}
                        </>
                      )}

                      {/* Adversaries section */}
                      {availableAdvs.length > 0 && (
                        <>
                          <div style={{
                            padding: '5px 12px 3px',
                            borderTop: availablePcs.length > 0 ? '1px solid rgba(200,170,80,0.15)' : 'none',
                            fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
                            letterSpacing: '0.18em', textTransform: 'uppercase',
                            color: 'rgba(200,170,80,0.4)',
                          }}>
                            Adversaries
                          </div>
                          {availableAdvs.map(p => {
                            const label = p.active_character_name ?? p.adversary_type ?? 'Enemy'
                            return (
                              <button
                                key={p.id}
                                onClick={async () => { await addSingleToken(p); setAddTokenOpen(false) }}
                                style={{
                                  display: 'block', width: '100%', textAlign: 'left',
                                  background: 'transparent', border: 'none',
                                  cursor: 'pointer', padding: '7px 12px',
                                  fontFamily: FR, fontSize: FS_LABEL, color: TEXT,
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                              >
                                ✕ {label}
                              </button>
                            )
                          })}
                        </>
                      )}

                      {/* Empty state */}
                      {availablePcs.length === 0 && availableAdvs.length === 0 && (
                        <div style={{ padding: '12px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, textAlign: 'center' }}>
                          All participants are on the map
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div style={{ width: '100%', height: 420, borderRadius: 6, overflow: 'hidden', border: `1px solid ${BORDER_HI}`, position: 'relative' }}>
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
            </div>

            <div style={{ marginTop: 6, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>
              {tokens.length} token{tokens.length !== 1 ? 's' : ''} on map · Scroll to zoom · Drag background to pan
            </div>
          </div>
        </>
      )}

      {/* ── Adversary token images ── */}
      {uniqueAdvTypes.length > 0 && (
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
          <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.45)', marginBottom: 2 }}>
            Adversary Token Images
          </div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 10 }}>
            Images are reused across all sessions for the same adversary type.
          </div>
          {uniqueAdvTypes.map(p => {
            const key = p.adversary_type ?? p.active_character_name ?? 'unknown'
            const name = p.active_character_name ?? p.adversary_type ?? 'Unknown'
            const currentUrl = advTokens.find(a => a.adversary_key === key)?.token_image_url ?? null
            return (
              <AdversaryTokenSection
                key={key}
                adversaryKey={key}
                adversaryName={name}
                currentUrl={currentUrl}
                onUploaded={url => updateAdvToken(key, url)}
                onCleared={() => clearAdvToken(key)}
              />
            )
          })}
        </div>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: contextMenu.x, top: contextMenu.y,
            zIndex: 900,
            background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
            borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            overflow: 'hidden', minWidth: 160,
          }}
        >
          <button
            onClick={async () => {
              await toggleVisibility(contextMenu.tokenId, !contextMenu.isVisible)
              setContextMenu(null)
            }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '9px 14px',
              fontFamily: FR, fontSize: FS_LABEL, color: TEXT,
              borderBottom: `1px solid ${BORDER}`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {contextMenu.isVisible ? '◉ Hide from players' : '◉ Show to players'}
          </button>
          <button
            onClick={async () => {
              await removeToken(contextMenu.tokenId)
              setContextMenu(null)
            }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '9px 14px',
              fontFamily: FR, fontSize: FS_LABEL, color: '#E05050',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            ✕ Remove from map
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {uploadOpen && campaignId && (
        <UploadModal
          campaignId={campaignId}
          onClose={() => setUploadOpen(false)}
          onSaved={() => setUploadOpen(false)}
        />
      )}

      {editMap && (
        <EditMapModal
          map={editMap}
          onClose={() => setEditMap(null)}
          onSaved={saveMapEdits}
        />
      )}

      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: PANEL_BG, border: `1px solid rgba(224,80,80,0.4)`, borderRadius: 8, padding: '20px 24px', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: FC, fontSize: FS_H4, color: '#E05050' }}>Delete Map?</div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT }}>
              <strong>{deleteConfirm.name}</strong> and all its tokens will be permanently deleted.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={btnSmall}>Cancel</button>
              <button onClick={() => deleteMap(deleteConfirm)} style={btnDanger}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
