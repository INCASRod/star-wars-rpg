'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateMapImage, generateMapWithAsset, editMapImage } from '@/lib/mapgen/imageGen'

/* ── Design tokens (matches GM view) ─────────────────────── */
const FR   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FC   = "var(--font-cinzel), 'Cinzel', serif"
const GOLD = '#C8AA50'
const DIM  = '#6A8070'
const TEXT = '#C8D8C0'
const BG   = '#060D09'
const PANEL_BG  = 'rgba(6,13,9,0.97)'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H3       = 'var(--text-h3)'
const FS_H4       = 'var(--text-h4)'

const HISTORY_KEY = 'mapforge_prompt_history'
const HISTORY_MAX = 5

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_MAX) : []
  } catch { return [] }
}

function saveToHistory(prompt: string) {
  try {
    const trimmed = prompt.trim()
    if (!trimmed) return
    const prev = loadHistory()
    const next = [trimmed, ...prev.filter(p => p !== trimmed)].slice(0, HISTORY_MAX)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch { /* storage full */ }
}

const STEPS = ['Generating image', 'Saving map'] as const

/* ── Shared styles ────────────────────────────────────────── */
const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${BORDER_HI}`,
  color: TEXT,
  fontFamily: FR,
  padding: '8px 12px',
  borderRadius: 4,
  outline: 'none',
  fontSize: FS_SM,
  width: '100%',
  boxSizing: 'border-box',
}

const btnGold: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)',
  border: `1px solid rgba(200,170,80,0.4)`,
  color: GOLD,
  fontFamily: FR,
  fontSize: FS_LABEL,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '10px 20px',
  borderRadius: 4,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const btnDim: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${BORDER}`,
  color: DIM,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 4,
  cursor: 'pointer',
}

function MapForgeInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const campaignId   = searchParams.get('campaign')
  const editMapId    = searchParams.get('mapId')
  const editImageUrl = searchParams.get('imageUrl')
  const editMapName  = searchParams.get('mapName')
  const isEditMode   = !!editMapId
  const supabase     = createClient()

  const STORE_KEY = `mapforge_draft_${campaignId ?? 'default'}`

  const [prompt,        setPrompt]        = useState('')
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [busy,     setBusy]     = useState(false)
  const [stepIdx,  setStepIdx]  = useState(-1)
  const [error,    setError]    = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [mapName,  setMapName]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [log,      setLog]      = useState<string[]>([])
  const [elapsed,  setElapsed]  = useState(0)
  const [assets,   setAssets]   = useState<{ id: string; name: string; previewUrl: string; url: string | null }[]>([])
  const [assetUploading, setAssetUploading] = useState(false)

  const promptRef  = useRef<HTMLTextAreaElement>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const assetInputRef = useRef<HTMLInputElement>(null)

  const dialogOpen = busy || saving

  // Load prompt history once on mount
  useEffect(() => { setPromptHistory(loadHistory()) }, [])

  // Seed state on mount
  useEffect(() => {
    if (editImageUrl) {
      // Edit mode — state comes from URL params; wipe any stale draft
      setImageUrl(decodeURIComponent(editImageUrl))
      setMapName(editMapName ? decodeURIComponent(editMapName) : '')
      clearDraft()
    } else {
      // Fresh generate — only restore text fields, never a stale image
      try {
        const raw   = localStorage.getItem(STORE_KEY)
        const draft = raw ? JSON.parse(raw) : {}
        if (draft.mapName) setMapName(draft.mapName)
        if (draft.prompt)  setPrompt(draft.prompt)
      } catch { /* ignore corrupt storage */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORE_KEY])

  // Persist prompt + name only (not imageUrl — that must never bleed across sessions)
  useEffect(() => {
    if (isEditMode) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ mapName, prompt }))
    } catch { /* storage full — silent */ }
  }, [mapName, prompt, STORE_KEY, isEditMode])

  function clearDraft() {
    try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
  }

  async function addAsset(file: File) {
    if (assetUploading) return
    const id         = Math.random().toString(36).slice(2, 9)
    const previewUrl = URL.createObjectURL(file)
    setAssets(prev => [...prev, { id, name: file.name, previewUrl, url: null }])
    setAssetUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'png'
      const path = `assets/${campaignId ?? 'shared'}/${id}.${ext}`
      const { error: upErr } = await supabase.storage.from('maps').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('maps').getPublicUrl(path)
      setAssets(prev => prev.map(a => a.id === id ? { ...a, url: data.publicUrl } : a))
    } catch {
      setAssets(prev => prev.filter(a => a.id !== id))
      URL.revokeObjectURL(previewUrl)
    } finally {
      setAssetUploading(false)
    }
  }

  function removeAsset(id: string) {
    setAssets(prev => {
      const a = prev.find(x => x.id === id)
      if (a) URL.revokeObjectURL(a.previewUrl)
      return prev.filter(x => x.id !== id)
    })
  }

  async function downloadImage() {
    if (!imageUrl) return
    const filename = `${(mapName || 'map').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = filename
      a.click()
    } else {
      const blob = await fetch(imageUrl).then(r => r.blob())
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(objectUrl)
    }
  }

  function startTimer() {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }
  function pushLog(msg: string) {
    setLog(prev => [...prev, msg])
  }

  useEffect(() => () => stopTimer(), [])

  async function generate() {
    if (!prompt.trim() || busy) return
    const editBase    = isEditMode ? imageUrl : null
    const primaryAsset = assets.find(a => a.url !== null)
    saveToHistory(prompt)
    setPromptHistory(loadHistory())
    setLog([]); setBusy(true); setError(null); setImageUrl(null); setSavedMsg(null); clearDraft()
    startTimer()

    try {
      setStepIdx(0)
      if (editBase) {
        pushLog('Sending edit instruction to Flux img2img…')
        const url = await editMapImage(editBase, prompt)
        pushLog('Edited image received.')
        setImageUrl(url)
      } else if (primaryAsset) {
        pushLog(`Using reference asset "${primaryAsset.name}" as visual anchor…`)
        const url = await generateMapWithAsset(primaryAsset.url!, prompt)
        pushLog('Asset-guided image received.')
        setImageUrl(url)
        setMapName(prompt.trim().slice(0, 48))
      } else {
        pushLog('Sending prompt to gpt-image-2…')
        const url = await generateMapImage(prompt)
        pushLog('Image received.')
        setImageUrl(url)
        setMapName(prompt.trim().slice(0, 48))
      }
      setStepIdx(-1)
    } catch (e: unknown) {
      pushLog('Error: ' + (e instanceof Error ? e.message : 'Generation failed'))
      setError(e instanceof Error ? e.message : 'Generation failed')
      setStepIdx(-1)
    } finally {
      stopTimer()
      setBusy(false)
    }
  }

  async function saveToLibrary() {
    if (!imageUrl || !campaignId || saving) return
    setLog([]); setSaving(true); setError(null)
    startTimer()

    try {
      setStepIdx(1)
      pushLog('Fetching image data…')
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) throw new Error('Failed to fetch generated image')
      const blob = await imgRes.blob()

      pushLog('Uploading to map library…')
      const path = `${campaignId}/${Date.now()}.png`
      const { error: upErr } = await supabase.storage
        .from('maps')
        .upload(path, blob, { contentType: 'image/png', upsert: true })
      if (upErr) throw upErr

      pushLog('Saving map record…')
      const { data: urlData } = supabase.storage.from('maps').getPublicUrl(path)
      if (isEditMode && editMapId) {
        await supabase.from('maps').update({
          name:      mapName.trim() || 'Generated Map',
          image_url: urlData.publicUrl,
        }).eq('id', editMapId)
      } else {
        await supabase.from('maps').insert({
          campaign_id:           campaignId,
          name:                  mapName.trim() || 'Generated Map',
          image_url:             urlData.publicUrl,
          grid_enabled:          false,
          grid_size:             50,
          is_active:             false,
          is_visible_to_players: false,
        })
      }

      pushLog('Done.')
      clearDraft()
      setSavedMsg('Map saved to library')
      setImageUrl(null); setMapName(''); setPrompt('')
      setStepIdx(-1)
    } catch (e: unknown) {
      pushLog('Error: ' + (e instanceof Error ? e.message : 'Save failed'))
      setError(e instanceof Error ? e.message : 'Save failed')
      setStepIdx(-1)
    } finally {
      stopTimer()
      setSaving(false)
    }
  }

  return (
    <div style={{
      height: '100dvh',
      overflow: 'hidden',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      color: TEXT,
    }}>
      <style>{`
        @keyframes mf-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes mf-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      {/* ── Header bar ────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        background: PANEL_BG,
        borderBottom: `1px solid ${BORDER}`,
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => router.push(`/gm?campaign=${campaignId}&tab=staging`)}
          style={btnDim}
        >
← Back to Staging
        </button>
        <div style={{ width: 1, height: 22, background: BORDER }} />
        <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>
          {isEditMode ? 'Edit Map' : 'Map Forge'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {imageUrl && (
            <button
              onClick={downloadImage}
              title="Download as PNG"
              style={btnDim}
            >
              ↓ Download PNG
            </button>
          )}
          {campaignId && (
            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
              Campaign: {campaignId.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left panel: controls ──────────────────────── */}
        <div style={{
          width: 360,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${BORDER}`,
          background: PANEL_BG,
          overflowY: 'auto',
        }}>

          {/* Section: Mission Brief */}
          <div style={{ padding: '20px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 10 }}>
              Mission Brief
            </div>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate() }}
              placeholder={isEditMode ? "Describe what to change… e.g. Add more crates near the entrance" : "Describe the location… e.g. Imperial hangar bay with a crashed shuttle and crates scattered around"}
              disabled={busy}
              rows={5}
              style={{ ...darkInput, resize: 'none', opacity: busy ? 0.5 : 1 }}
            />
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 5 }}>
              Ctrl + Enter to generate
            </div>
          </div>

          {/* Section: Last 5 Prompts */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 8 }}>
              Last 5 Prompts
            </div>
            {promptHistory.length === 0 ? (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, fontStyle: 'italic' }}>
                No prompts yet — your history will appear here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {promptHistory.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setPrompt(p); promptRef.current?.focus() }}
                    disabled={busy}
                    title={p}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${BORDER}`,
                      color: DIM,
                      fontFamily: FR,
                      fontSize: FS_CAPTION,
                      padding: '5px 10px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s, color 0.15s',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER_HI; (e.currentTarget as HTMLElement).style.color = TEXT }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = DIM }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <div style={{ padding: '16px 18px' }}>
            <button
              onClick={generate}
              disabled={busy || !prompt.trim()}
              style={{ ...btnGold, width: '100%', textAlign: 'center', opacity: (busy || !prompt.trim()) ? 0.45 : 1 }}
            >
              {busy && stepIdx < 2 ? `${STEPS[stepIdx]}…` : isEditMode ? '◈ Apply Edit' : '◈ Generate Map'}
            </button>
          </div>

          {/* Section: Reference Assets */}
          <div style={{ padding: '14px 18px 18px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 8 }}>
              Reference Assets
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 10, lineHeight: 1.5 }}>
              Upload images (ships, structures, props) for the generator to incorporate into the map.
            </div>

            {/* Thumbnails */}
            {assets.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {assets.map((a, i) => (
                  <div key={a.id} style={{ position: 'relative', width: 72, height: 72, borderRadius: 4, overflow: 'hidden', border: `1px solid ${i === 0 ? 'rgba(200,170,80,0.55)' : BORDER}`, flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.previewUrl} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: a.url ? 1 : 0.45 }} />
                    {/* Uploading spinner */}
                    {!a.url && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite' }} />
                      </div>
                    )}
                    {/* Primary badge */}
                    {i === 0 && a.url && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(200,170,80,0.75)', fontFamily: FR, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BG, textAlign: 'center', padding: '2px 0' }}>
                        Primary
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={() => removeAsset(a.id)}
                      title="Remove asset"
                      style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer', color: TEXT, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <input
              ref={assetInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={e => { Array.from(e.target.files ?? []).forEach(addAsset); e.target.value = '' }}
            />
            <button
              onClick={() => assetInputRef.current?.click()}
              disabled={assetUploading || busy}
              style={{
                width: '100%', padding: '10px', border: `1px dashed ${assetUploading ? BORDER : BORDER_HI}`,
                borderRadius: 4, background: 'transparent', cursor: assetUploading ? 'wait' : 'pointer',
                fontFamily: FR, fontSize: FS_CAPTION, color: assetUploading ? DIM : TEXT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!assetUploading) (e.currentTarget as HTMLElement).style.borderColor = GOLD }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = assetUploading ? BORDER : BORDER_HI }}
            >
              {assetUploading ? (
                <><div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite' }} /> Uploading…</>
              ) : (
                <>↑ Add Reference Image{assets.length > 0 ? 's' : ''}</>
              )}
            </button>
            {assets.length > 0 && (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 6, textAlign: 'center' }}>
                First image is used as the visual anchor
              </div>
            )}
          </div>
        </div>

        {/* ── Main canvas area ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Progress dialog ──────────────────────────── */}
          {dialogOpen && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                width: 360,
                background: 'rgba(8,16,11,0.98)',
                border: `1px solid ${BORDER_HI}`,
                borderRadius: 8,
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}>
                {/* Dialog header */}
                <div style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${GOLD}`,
                    borderTopColor: 'transparent',
                    animation: 'mf-spin 0.8s linear infinite',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD }}>
                    {saving ? 'Saving Map' : 'Generating Map'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, fontVariantNumeric: 'tabular-nums' }}>
                    {elapsed}s
                  </span>
                </div>

                {/* Step list */}
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STEPS.map((s, i) => {
                    const done    = i < stepIdx
                    const active  = i === stepIdx
                    const pending = i > stepIdx
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: done ? GOLD : active ? '#4EC87A' : 'transparent',
                          border: `1.5px solid ${done ? GOLD : active ? '#4EC87A' : DIM}`,
                          boxShadow: active ? '0 0 8px #4EC87A88' : 'none',
                          animation: active ? 'mf-pulse 1.2s ease-in-out infinite' : 'none',
                          transition: 'background 0.3s, border-color 0.3s',
                        }} />
                        <span style={{
                          fontFamily: FR, fontSize: FS_SM,
                          color: done ? TEXT : active ? '#4EC87A' : DIM,
                          transition: 'color 0.3s',
                        }}>
                          {s}
                        </span>
                        {done && <span style={{ marginLeft: 'auto', fontFamily: FR, fontSize: FS_CAPTION, color: GOLD }}>✓</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Event log */}
                {log.length > 0 && (
                  <div style={{
                    margin: '0 14px 14px',
                    padding: '8px 10px',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    display: 'flex', flexDirection: 'column', gap: 3,
                  }}>
                    {log.map((entry, i) => (
                      <div key={i} style={{
                        fontFamily: 'monospace', fontSize: '0.7rem',
                        color: entry.startsWith('Error') ? '#E05050' : i === log.length - 1 ? TEXT : DIM,
                        animation: i === log.length - 1 ? 'mf-pulse 1.2s ease-in-out 2' : 'none',
                      }}>
                        {'> '}{entry}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ flexShrink: 0, padding: '10px 20px', background: 'rgba(224,80,80,0.08)', borderBottom: `1px solid rgba(224,80,80,0.2)`, fontFamily: FR, fontSize: FS_LABEL, color: '#E05050' }}>
              {error}
            </div>
          )}

          {/* Success toast */}
          {savedMsg && (
            <div style={{ flexShrink: 0, padding: '10px 20px', background: 'rgba(78,200,122,0.08)', borderBottom: `1px solid rgba(78,200,122,0.2)`, fontFamily: FR, fontSize: FS_LABEL, color: '#4EC87A', display: 'flex', alignItems: 'center', gap: 10 }}>
              ✓ {savedMsg}
              <button onClick={() => router.push(`/gm?campaign=${campaignId}&tab=staging`)} style={{ ...btnDim, marginLeft: 'auto' }}>
                ← Back to Staging
              </button>
            </div>
          )}

          {/* Generated image / empty state */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt="Generated map"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontFamily: FC, fontSize: FS_H3, color: 'rgba(200,170,80,0.12)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Map Forge
                </div>
                <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>
                  Enter a mission brief and hit Generate
                </div>
              </div>
            )}
          </div>

          {/* Save bar — visible after image is generated */}
          {imageUrl && !busy && (
            <div style={{
              flexShrink: 0,
              padding: '12px 20px',
              borderTop: `1px solid ${BORDER}`,
              background: PANEL_BG,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <input
                value={mapName}
                onChange={e => setMapName(e.target.value)}
                placeholder="Map name…"
                style={{ ...darkInput, maxWidth: 280 }}
              />
              <button
                onClick={saveToLibrary}
                disabled={saving || !campaignId}
                style={{ ...btnGold, opacity: (saving || !campaignId) ? 0.5 : 1 }}
              >
                {saving ? 'Saving…' : isEditMode ? '↑ Save Changes' : '↑ Save to Library'}
              </button>
              <button
                onClick={generate}
                disabled={busy}
                style={{ ...btnDim }}
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MapForgePage() {
  return (
    <Suspense>
      <MapForgeInner />
    </Suspense>
  )
}
