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

type AssetItem = { id: string; name: string; previewUrl: string; url: string | null }

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
  // isEditMode = navigated here from map library to edit a saved map
  const isEditMode   = !!editMapId
  const supabase     = createClient()

  const STORE_KEY = `mapforge_draft_${campaignId ?? 'default'}`

  // ── State ────────────────────────────────────────────────
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

  // Fresh-gen reference assets (visual anchor / style reference)
  const [freshAssets,   setFreshAssets]   = useState<AssetItem[]>([])
  const [freshUploading, setFreshUploading] = useState(false)
  const freshAssetInputRef = useRef<HTMLInputElement>(null)

  // In-page edit mode — set after generation or when isEditMode is true
  const [inEditMode, setInEditMode] = useState(false)
  // editModeActive covers both URL-based edit (from library) and in-page edit
  const editModeActive = inEditMode || isEditMode

  // Edit reference images (subjects to incorporate: ships, props, etc.)
  const [editRefs,   setEditRefs]   = useState<AssetItem[]>([])
  const [editRefUploading, setEditRefUploading] = useState(false)
  const editRefInputRef = useRef<HTMLInputElement>(null)

  const promptRef  = useRef<HTMLTextAreaElement>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const dialogOpen = busy || saving

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => { setPromptHistory(loadHistory()) }, [])

  useEffect(() => {
    if (editImageUrl) {
      setImageUrl(decodeURIComponent(editImageUrl))
      setMapName(editMapName ? decodeURIComponent(editMapName) : '')
      setInEditMode(true)
      clearDraft()
    } else {
      try {
        const raw   = localStorage.getItem(STORE_KEY)
        const draft = raw ? JSON.parse(raw) : {}
        if (draft.mapName) setMapName(draft.mapName)
        if (draft.prompt)  setPrompt(draft.prompt)
      } catch { /* ignore corrupt storage */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORE_KEY])

  useEffect(() => {
    if (isEditMode || editModeActive) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ mapName, prompt }))
    } catch { /* storage full */ }
  }, [mapName, prompt, STORE_KEY, isEditMode, editModeActive])

  function clearDraft() {
    try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
  }

  // ── Asset helpers ─────────────────────────────────────────
  async function addAsset(
    file: File,
    list: AssetItem[],
    setList: React.Dispatch<React.SetStateAction<AssetItem[]>>,
    setUploading: React.Dispatch<React.SetStateAction<boolean>>,
  ) {
    if (!file) return
    const id         = Math.random().toString(36).slice(2, 9)
    const previewUrl = URL.createObjectURL(file)
    setList(prev => [...prev, { id, name: file.name, previewUrl, url: null }])
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'png'
      const path = `assets/${campaignId ?? 'shared'}/${id}.${ext}`
      const { error: upErr } = await supabase.storage.from('maps').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('maps').getPublicUrl(path)
      setList(prev => prev.map(a => a.id === id ? { ...a, url: data.publicUrl } : a))
    } catch {
      setList(prev => prev.filter(a => a.id !== id))
      URL.revokeObjectURL(previewUrl)
    } finally {
      setUploading(false)
    }
  }

  function removeAsset(
    id: string,
    setList: React.Dispatch<React.SetStateAction<AssetItem[]>>,
  ) {
    setList(prev => {
      const a = prev.find(x => x.id === id)
      if (a) URL.revokeObjectURL(a.previewUrl)
      return prev.filter(x => x.id !== id)
    })
  }

  // ── Download ──────────────────────────────────────────────
  async function downloadImage() {
    if (!imageUrl) return
    const filename = `${(mapName || 'map').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a'); a.href = imageUrl; a.download = filename; a.click()
    } else {
      const blob = await fetch(imageUrl).then(r => r.blob())
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = objectUrl; a.download = filename; a.click()
      URL.revokeObjectURL(objectUrl)
    }
  }

  // ── Timer ─────────────────────────────────────────────────
  function startTimer() {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }
  function pushLog(msg: string) { setLog(prev => [...prev, msg]) }

  useEffect(() => () => stopTimer(), [])

  // ── Enter edit mode ───────────────────────────────────────
  function enterEditMode() {
    setInEditMode(true)
    setPrompt('')
    setEditRefs([])
  }

  // ── Generate / Apply Edit ─────────────────────────────────
  async function generate() {
    if (!prompt.trim() || busy) return
    const primaryAsset = freshAssets.find(a => a.url !== null)
    saveToHistory(prompt)
    setPromptHistory(loadHistory())
    setLog([]); setBusy(true); setError(null); setSavedMsg(null)
    // Keep current image visible during edits; clear only on fresh gen
    if (!editModeActive) { setImageUrl(null); clearDraft() }
    startTimer()

    try {
      setStepIdx(0)

      if (editModeActive && imageUrl) {
        // ── Edit mode: scene is base[0], reference images follow ──
        const refUrls = editRefs.filter(r => r.url).map(r => r.url!)
        pushLog(`Sending edit instruction to gpt-image-2${refUrls.length ? ` with ${refUrls.length} reference image(s)` : ''}…`)
        const url = await editMapImage(imageUrl, prompt, refUrls)
        pushLog('Edit applied.')
        setImageUrl(url)

      } else if (primaryAsset) {
        // ── Asset-guided fresh gen ──
        pushLog(`Using reference asset "${primaryAsset.name}" as visual anchor…`)
        const url = await generateMapWithAsset(primaryAsset.url!, prompt)
        pushLog('Asset-guided image received.')
        setImageUrl(url)
        setMapName(prompt.trim().slice(0, 48))

      } else {
        // ── Plain fresh gen ──
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

  // ── Save to library ───────────────────────────────────────
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
      setInEditMode(false)
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

  // ── Asset thumbnail row ───────────────────────────────────
  function AssetThumbs({ list, setList, primaryLabel }: {
    list: AssetItem[]
    setList: React.Dispatch<React.SetStateAction<AssetItem[]>>
    primaryLabel?: string
  }) {
    if (list.length === 0) return null
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {list.map((a, i) => (
          <div key={a.id} style={{ position: 'relative', width: 72, height: 72, borderRadius: 4, overflow: 'hidden', border: `1px solid ${i === 0 && primaryLabel ? 'rgba(200,170,80,0.55)' : BORDER}`, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.previewUrl} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: a.url ? 1 : 0.45 }} />
            {!a.url && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite' }} />
              </div>
            )}
            {i === 0 && primaryLabel && a.url && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(200,170,80,0.75)', fontFamily: FR, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BG, textAlign: 'center', padding: '2px 0' }}>
                {primaryLabel}
              </div>
            )}
            <button
              onClick={() => removeAsset(a.id, setList)}
              title="Remove"
              style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer', color: TEXT, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >✕</button>
          </div>
        ))}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: BG, display: 'flex', flexDirection: 'column', color: TEXT }}>
      <style>{`
        @keyframes mf-spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>

      {/* ── Header bar ──────────────────────────────────────── */}
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', background: PANEL_BG, borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)' }}>
        <button onClick={() => router.push(`/gm?campaign=${campaignId}&tab=staging`)} style={btnDim}>
          ← Back to Staging
        </button>
        <div style={{ width: 1, height: 22, background: BORDER }} />
        <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>
          Map Forge
        </span>
        {editModeActive && (
          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            · Edit Mode
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {imageUrl && (
            <button onClick={downloadImage} title="Download as PNG" style={btnDim}>↓ Download PNG</button>
          )}
          {campaignId && (
            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>Campaign: {campaignId.slice(0, 8)}…</span>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left panel ──────────────────────────────────── */}
        <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORDER}`, background: PANEL_BG, overflowY: 'auto' }}>

          {editModeActive ? (
            /* ═══════════════ EDIT MODE PANEL ═══════════════ */
            <>
              {/* Edit instruction */}
              <div style={{ padding: '20px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 10 }}>
                  Edit Instruction
                </div>
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate() }}
                  placeholder="Describe what to add or change… e.g. Place the ship from the reference image onto the central landing pad"
                  disabled={busy}
                  rows={5}
                  style={{ ...darkInput, resize: 'none', opacity: busy ? 0.5 : 1 }}
                />
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 5 }}>Ctrl + Enter to apply</div>
              </div>

              {/* Reference images to incorporate */}
              <div style={{ padding: '14px 18px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 8 }}>
                  Reference Images
                </div>
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 10, lineHeight: 1.5 }}>
                  Upload images of subjects to incorporate — ships, structures, characters. The model will place them into the scene based on your instruction.
                </div>

                <AssetThumbs list={editRefs} setList={setEditRefs} />

                <input
                  ref={editRefInputRef}
                  type="file" accept="image/*" multiple hidden
                  onChange={e => { Array.from(e.target.files ?? []).forEach(f => addAsset(f, editRefs, setEditRefs, setEditRefUploading)); e.target.value = '' }}
                />
                <button
                  onClick={() => editRefInputRef.current?.click()}
                  disabled={editRefUploading || busy}
                  style={{ width: '100%', padding: '10px', border: `1px dashed ${editRefUploading ? BORDER : BORDER_HI}`, borderRadius: 4, background: 'transparent', cursor: editRefUploading ? 'wait' : 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: editRefUploading ? DIM : TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {editRefUploading
                    ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite' }} />Uploading…</>
                    : <>↑ Add Reference Image{editRefs.length > 0 ? 's' : ''}</>
                  }
                </button>
              </div>

              {/* Apply Edit button */}
              <div style={{ padding: '16px 18px' }}>
                <button
                  onClick={generate}
                  disabled={busy || !prompt.trim() || !imageUrl}
                  style={{ ...btnGold, width: '100%', textAlign: 'center', opacity: (busy || !prompt.trim() || !imageUrl) ? 0.45 : 1 }}
                >
                  {busy ? 'Applying Edit…' : '◈ Apply Edit'}
                </button>
              </div>

              {/* Exit edit mode (only when not URL-based) */}
              {!isEditMode && (
                <div style={{ padding: '0 18px 16px' }}>
                  <button
                    onClick={() => { setInEditMode(false); setPrompt(''); setEditRefs([]) }}
                    style={{ ...btnDim, width: '100%', textAlign: 'center' }}
                  >
                    ← Back to Fresh Generate
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ═══════════════ FRESH GEN PANEL ═══════════════ */
            <>
              {/* Mission Brief */}
              <div style={{ padding: '20px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 10 }}>
                  Mission Brief
                </div>
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate() }}
                  placeholder="Describe the location… e.g. Imperial hangar bay with a crashed shuttle and crates scattered around"
                  disabled={busy}
                  rows={5}
                  style={{ ...darkInput, resize: 'none', opacity: busy ? 0.5 : 1 }}
                />
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 5 }}>Ctrl + Enter to generate</div>
              </div>

              {/* Last 5 Prompts */}
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 8 }}>
                  Last 5 Prompts
                </div>
                {promptHistory.length === 0 ? (
                  <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, fontStyle: 'italic' }}>No prompts yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {promptHistory.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setPrompt(p); promptRef.current?.focus() }}
                        disabled={busy}
                        title={p}
                        style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '5px 10px', borderRadius: 3, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER_HI; (e.currentTarget as HTMLElement).style.color = TEXT }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = DIM }}
                      >{p}</button>
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
                  {busy && stepIdx < 2 ? `${STEPS[stepIdx]}…` : '◈ Generate Map'}
                </button>
              </div>

              {/* Reference Assets (visual anchor / style reference for fresh gen) */}
              <div style={{ padding: '14px 18px 18px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 8 }}>
                  Reference Assets
                </div>
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 10, lineHeight: 1.5 }}>
                  Upload an image to use as a visual anchor — the generator will build the scene around its style and composition.
                </div>

                <AssetThumbs list={freshAssets} setList={setFreshAssets} primaryLabel="Anchor" />

                <input
                  ref={freshAssetInputRef}
                  type="file" accept="image/*" multiple hidden
                  onChange={e => { Array.from(e.target.files ?? []).forEach(f => addAsset(f, freshAssets, setFreshAssets, setFreshUploading)); e.target.value = '' }}
                />
                <button
                  onClick={() => freshAssetInputRef.current?.click()}
                  disabled={freshUploading || busy}
                  style={{ width: '100%', padding: '10px', border: `1px dashed ${freshUploading ? BORDER : BORDER_HI}`, borderRadius: 4, background: 'transparent', cursor: freshUploading ? 'wait' : 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: freshUploading ? DIM : TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onMouseEnter={e => { if (!freshUploading) (e.currentTarget as HTMLElement).style.borderColor = GOLD }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = freshUploading ? BORDER : BORDER_HI }}
                >
                  {freshUploading
                    ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite' }} />Uploading…</>
                    : <>↑ Add Reference Image{freshAssets.length > 0 ? 's' : ''}</>
                  }
                </button>
                {freshAssets.length > 0 && (
                  <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 6, textAlign: 'center' }}>
                    First image used as visual anchor
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Main canvas area ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Progress dialog ──────────────────────────── */}
          {dialogOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 360, background: 'rgba(8,16,11,0.98)', border: `1px solid ${BORDER_HI}`, borderRadius: 8, boxShadow: '0 24px 64px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'mf-spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD }}>
                    {saving ? 'Saving Map' : editModeActive ? 'Applying Edit' : 'Generating Map'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, fontVariantNumeric: 'tabular-nums' }}>{elapsed}s</span>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STEPS.map((s, i) => {
                    const done = i < stepIdx, active = i === stepIdx
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: done ? GOLD : active ? '#4EC87A' : 'transparent', border: `1.5px solid ${done ? GOLD : active ? '#4EC87A' : DIM}`, boxShadow: active ? '0 0 8px #4EC87A88' : 'none', animation: active ? 'mf-pulse 1.2s ease-in-out infinite' : 'none' }} />
                        <span style={{ fontFamily: FR, fontSize: FS_SM, color: done ? TEXT : active ? '#4EC87A' : DIM }}>{s}</span>
                        {done && <span style={{ marginLeft: 'auto', fontFamily: FR, fontSize: FS_CAPTION, color: GOLD }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
                {log.length > 0 && (
                  <div style={{ margin: '0 14px 14px', padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORDER}`, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {log.map((entry, i) => (
                      <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: entry.startsWith('Error') ? '#E05050' : i === log.length - 1 ? TEXT : DIM, animation: i === log.length - 1 ? 'mf-pulse 1.2s ease-in-out 2' : 'none' }}>
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
              <button onClick={() => router.push(`/gm?campaign=${campaignId}&tab=staging`)} style={{ ...btnDim, marginLeft: 'auto' }}>← Back to Staging</button>
            </div>
          )}

          {/* Image / empty state */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt="Generated map" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            ) : (
              <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontFamily: FC, fontSize: FS_H3, color: 'rgba(200,170,80,0.12)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>Map Forge</div>
                <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>Enter a mission brief and hit Generate</div>
              </div>
            )}
            {/* Dim overlay while editing so the image feels "locked" */}
            {editModeActive && imageUrl && busy && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,8,0.55)', backdropFilter: 'blur(2px)' }} />
            )}
          </div>

          {/* Save / action bar */}
          {imageUrl && !busy && (
            <div style={{ flexShrink: 0, padding: '12px 20px', borderTop: `1px solid ${BORDER}`, background: PANEL_BG, display: 'flex', alignItems: 'center', gap: 10 }}>
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

              {/* Edit Map — only in fresh gen mode */}
              {!editModeActive && (
                <button onClick={enterEditMode} style={btnDim}>
                  ✏ Edit Map
                </button>
              )}

              {/* Regenerate — only in fresh gen mode */}
              {!editModeActive && (
                <button onClick={generate} disabled={busy} style={btnDim}>
                  Regenerate
                </button>
              )}
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
