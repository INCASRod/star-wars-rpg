'use client'

import { useState, useMemo } from 'react'
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

/* ── Props ────────────────────────────────────────────────── */
export interface StagingMapPanelProps {
  campaignId: string
  allMaps:    ActiveMap[]
  onDeleteMap: (mapId: string) => void
}

export function StagingMapPanel({ campaignId, allMaps, onDeleteMap }: StagingMapPanelProps) {
  const supabase = useMemo(() => createClient(), [])
  const [busy,         setBusy]         = useState(false)
  const [uploadOpen,   setUploadOpen]   = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Upload button ────────────────────────────────── */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}` }}>
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 4,
            background: 'rgba(200,170,80,0.08)',
            border: `1px solid rgba(200,170,80,0.3)`,
            color: GOLD, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          ↑ Upload New Map
        </button>
      </div>

      {/* ── Map list ─────────────────────────────────────── */}
      {allMaps.length === 0 && (
        <div style={{ padding: '40px 16px', textAlign: 'center', fontFamily: FR, fontSize: FS_SM, color: DIM }}>
          No maps uploaded yet.
        </div>
      )}

      {allMaps.map(map => (
        <div
          key={map.id}
          style={{
            padding: '12px 14px',
            borderBottom: `1px solid ${BORDER}`,
            background: map.is_active ? 'rgba(200,170,80,0.04)' : 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={map.image_url}
              alt={map.name}
              style={{
                width: 50, height: 36, objectFit: 'cover', borderRadius: 3, flexShrink: 0,
                border: `1px solid ${map.is_active ? BORDER_HI : BORDER}`,
              }}
            />

            {/* Name + meta */}
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

            {/* Actions */}
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
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => setDeleteConfirm(map.id)}
                title="Delete map"
                style={{
                  background: 'rgba(224,80,80,0.07)', border: '1px solid rgba(224,80,80,0.22)',
                  color: '#E05050', fontFamily: FR, fontSize: FS_LABEL,
                  padding: '2px 8px', borderRadius: 3, cursor: 'pointer', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Visibility toggle (active map only) */}
          {map.is_active && (
            <button
              onClick={() => void handleToggleVisible(map)}
              style={{
                marginTop: 8, width: '100%', padding: '4px 0', borderRadius: 3, border: 'none',
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
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050' }}>
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
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete(map.id)}
                  style={{
                    flex: 2, padding: '4px 0', borderRadius: 3,
                    background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.5)',
                    color: '#E05050', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {uploadOpen && (
        <MapUploadModal
          campaignId={campaignId}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  )
}

/* ── Upload modal ─────────────────────────────────────────── */
function MapUploadModal({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [name,        setName]        = useState('')
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

        <div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 4 }}>Map Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tatooine Cantina"
            style={darkInput}
          />
        </div>

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

        {err && <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050' }}>{err}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: DIM, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
              padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
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
          >
            {busy ? 'Uploading…' : '↑ Upload Map'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
