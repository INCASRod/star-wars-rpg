'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { RichText } from '@/components/ui/RichText'
import type { Character } from '@/lib/types'
import { ACTIVATION_LABELS } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const RED       = '#E05050'
const GREEN     = '#4CAF50'
const PANEL_BG  = 'rgba(8,16,10,0.7)'
const EDITOR_BG = 'rgba(6,13,9,0.97)'
const FONT_C    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'

const ACTIVATION_COLOR: Record<string, string> = {
  taPassive:       'rgba(150,150,150,0.8)',
  taAction:        '#C8AA50',
  taManeuver:      '#4FC3F7',
  taIncidental:    '#81C784',
  taIncidentalOOT: '#81C784',
}

type ActivationKey = keyof typeof ACTIVATION_LABELS

interface CustomTalent {
  key:         string
  name:        string
  description: string | null
  activation:  string
  is_ranked:   boolean
  is_custom:   boolean
  campaign_id: string | null
}

interface TalentDatabaseTabProps {
  campaignId:  string | null
  supabase:    SupabaseClient
  characters?: Character[]
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
}

// ── Key generation ────────────────────────────────────────────────────────────
function generateTalentKey(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CUSTOM_${slug}_${rand}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActivationBadge({ activation }: { activation: string }) {
  const label = ACTIVATION_LABELS[activation] ?? activation
  const color = ACTIVATION_COLOR[activation] ?? 'rgba(150,150,150,0.8)'
  return (
    <span style={{
      fontFamily: FONT_M,
      fontSize: FS_OVER,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: 4,
      padding: '2px 6px',
      flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

// ── Assign Modal ──────────────────────────────────────────────────────────────

interface AssignModalProps {
  talent:     CustomTalent
  characters: Character[]
  supabase:   SupabaseClient
  onClose:    () => void
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
}

function AssignModal({ talent, characters, supabase, onClose, sendToChar }: AssignModalProps) {
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleAssign = async () => {
    if (!selectedId) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.from('character_talents').insert({
      character_id: selectedId,
      talent_key:   talent.key,
      ranks:        1,
    })
    if (err) {
      setError(err.message)
      setBusy(false)
      return
    }
    const char = characters.find(c => c.id === selectedId)
    if (char && sendToChar) {
      sendToChar(selectedId, {
        type:    'dialog',
        message: `You received the talent: ${talent.name}!`,
      })
    }
    setBusy(false)
    onClose()
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: EDITOR_BG, border: `1px solid ${BORDER_HI}`, borderRadius: 6, padding: 24, maxWidth: '28rem', width: '100%', backdropFilter: 'blur(12px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
          Assign: {talent.name}
        </div>
        <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, marginBottom: 18 }}>
          Select a character to receive this talent.
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={fieldLabel}>Character</div>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...darkInput, width: '100%' }}>
            <option value="">Select character…</option>
            {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {error && <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: RED, marginBottom: 8 }}>⚠ {error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || busy}
            style={{ ...btnPrimary, opacity: !selectedId || busy ? 0.4 : 1 }}
          >
            {busy ? 'Assigning…' : 'Assign Talent'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Talent Editor Panel ───────────────────────────────────────────────────────

interface EditorPanelProps {
  talent?:    CustomTalent
  campaignId: string
  supabase:   SupabaseClient
  onSaved:    (t: CustomTalent) => void
  onClose:    () => void
}

function EditorPanel({ talent, campaignId, supabase, onSaved, onClose }: EditorPanelProps) {
  const isNew = !talent

  const [name,        setName]        = useState(talent?.name ?? '')
  const [activation,  setActivation]  = useState<string>(talent?.activation ?? 'taPassive')
  const [isRanked,    setIsRanked]    = useState(talent?.is_ranked ?? false)
  const [description, setDescription] = useState(talent?.description ?? '')
  const [preview,     setPreview]     = useState(false)
  const [busy,        setBusy]        = useState(false)
  const [error,       setError]       = useState('')

  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return }
    setBusy(true)
    setError('')

    if (isNew) {
      const key = generateTalentKey(name.trim())
      const { data, error: err } = await supabase.from('ref_talents').insert({
        key,
        name:        name.trim(),
        activation,
        is_ranked:   isRanked,
        description: description.trim() || null,
        is_custom:   true,
        campaign_id: campaignId,
        is_force_talent: false,
      }).select().single()
      if (err) { setError(err.message); setBusy(false); return }
      onSaved(data as CustomTalent)
    } else {
      const { data, error: err } = await supabase.from('ref_talents').update({
        name:        name.trim(),
        activation,
        is_ranked:   isRanked,
        description: description.trim() || null,
      }).eq('key', talent!.key).select().single()
      if (err) { setError(err.message); setBusy(false); return }
      onSaved(data as CustomTalent)
    }
    setBusy(false)
  }

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 10050, background: 'rgba(0,0,0,0.45)', opacity: visible ? 1 : 0, transition: 'opacity 0.26s' }}
      />

      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 10060,
        width: 'clamp(320px, 38vw, 520px)',
        background: EDITOR_BG,
        borderLeft: `1px solid ${BORDER_HI}`,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isNew ? 'New Custom Talent' : 'Edit Talent'}
          </span>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontFamily: FONT_C, fontSize: FS_SM }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <div style={fieldLabel}>Name</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Talent name…"
              style={{ ...darkInput, width: '100%' }}
            />
          </div>

          {/* Activation */}
          <div style={{ marginBottom: 14 }}>
            <div style={fieldLabel}>Activation</div>
            <select value={activation} onChange={e => setActivation(e.target.value)} style={{ ...darkInput, width: '100%' }}>
              {(Object.entries(ACTIVATION_LABELS) as [ActivationKey, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Is Ranked */}
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsRanked(r => !r)}
              style={{
                width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isRanked ? GOLD : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: isRanked ? 18 : 2,
                width: 16, height: 16, borderRadius: 8,
                background: isRanked ? '#060D09' : 'rgba(255,255,255,0.5)',
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: isRanked ? TEXT : DIM }}>
              Ranked {isRanked && <span style={{ color: GOLD_DIM, fontSize: FS_CAP }}>(can be purchased multiple times)</span>}
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={fieldLabel}>Description</span>
              <button
                onClick={() => setPreview(p => !p)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: FONT_M, fontSize: FS_CAP,
                  color: preview ? GOLD : DIM,
                  padding: 0,
                }}
              >
                {preview ? '✎ Edit' : '👁 Preview'}
              </button>
            </div>

            {preview ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${BORDER}`,
                borderRadius: 4, padding: '10px 12px',
                fontFamily: FONT_C, fontSize: FS_LABEL,
                color: TEXT, lineHeight: 1.5, minHeight: 80,
              }}>
                {description.trim()
                  ? <RichText text={description} />
                  : <span style={{ color: DIM, fontStyle: 'italic' }}>No description.</span>
                }
              </div>
            ) : (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what the talent does. Use [advantage], [boost:2], [success] etc. for dice symbols."
                style={{ ...darkInput, width: '100%', resize: 'vertical', fontFamily: FONT_C, fontSize: FS_LABEL }}
              />
            )}
            <div style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM, marginTop: 4 }}>
              Supports RichText markup: [advantage], [success], [triumph], [boost:N], etc.
            </div>
          </div>

          {error && <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: RED, padding: '4px 0' }}>⚠ {error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSave} disabled={busy || !name.trim()} style={{ ...btnPrimary, opacity: busy || !name.trim() ? 0.4 : 1 }}>
            {busy ? 'Saving…' : isNew ? 'Create Talent' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TalentDatabaseTab({ campaignId, supabase, characters = [], sendToChar }: TalentDatabaseTabProps) {
  const [talents,     setTalents]     = useState<CustomTalent[]>([])
  const [loading,     setLoading]     = useState(false)
  const [editorOpen,  setEditorOpen]  = useState(false)
  const [editTarget,  setEditTarget]  = useState<CustomTalent | undefined>(undefined)
  const [assigning,   setAssigning]   = useState<CustomTalent | null>(null)
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadTalents = useCallback(async () => {
    if (!campaignId) return
    setLoading(true)
    const { data } = await supabase
      .from('ref_talents')
      .select('key,name,description,activation,is_ranked,is_custom,campaign_id')
      .eq('is_custom', true)
      .eq('campaign_id', campaignId)
      .order('name')
    setTalents((data as CustomTalent[]) ?? [])
    setLoading(false)
  }, [supabase, campaignId])

  useEffect(() => { loadTalents() }, [loadTalents])

  const openNew = () => {
    setEditTarget(undefined)
    setEditorOpen(true)
  }

  const openEdit = (t: CustomTalent) => {
    setEditTarget(t)
    setEditorOpen(true)
  }

  const handleSaved = (t: CustomTalent) => {
    setTalents(prev => {
      const idx = prev.findIndex(p => p.key === t.key)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = t
        return next
      }
      return [...prev, t].sort((a, b) => a.name.localeCompare(b.name))
    })
    setEditorOpen(false)
  }

  const handleDelete = async (key: string) => {
    await supabase.from('ref_talents').delete().eq('key', key)
    setTalents(prev => prev.filter(t => t.key !== key))
    setDeleteConfirm(null)
  }

  const toggleExpanded = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: FONT_C, fontSize: FS_SM, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Custom Talents
          </div>
          <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, marginTop: 2 }}>
            {talents.length} custom talent{talents.length !== 1 ? 's' : ''} for this campaign
          </div>
        </div>
        <button onClick={openNew} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '1.1em', lineHeight: 1 }}>+</span> New Talent
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: DIM, padding: '24px 0', textAlign: 'center' }}>
          Loading…
        </div>
      ) : talents.length === 0 ? (
        <div style={{
          fontFamily: FONT_C, fontSize: FS_LABEL, color: DIM,
          padding: '32px 0', textAlign: 'center',
          border: `1px dashed ${BORDER}`, borderRadius: 4,
        }}>
          No custom talents yet. Click <strong style={{ color: GOLD }}>+ New Talent</strong> to create one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {talents.map(t => {
            const isExp = !!expanded[t.key]
            const isDeleting = deleteConfirm === t.key
            return (
              <div
                key={t.key}
                style={{
                  background: PANEL_BG,
                  border: `1px solid ${isDeleting ? 'rgba(224,80,80,0.4)' : BORDER}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpanded(t.key)}
                    style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', padding: 0, fontSize: 10, flexShrink: 0 }}
                  >
                    {isExp ? '▼' : '▶'}
                  </button>

                  {/* Name */}
                  <span style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, fontWeight: 600, flex: 1 }}>
                    {t.name}
                    {t.is_ranked && (
                      <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: GOLD_DIM, marginLeft: 6 }}>Ranked</span>
                    )}
                  </span>

                  <ActivationBadge activation={t.activation} />

                  {/* Action buttons */}
                  {!isDeleting ? (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {characters.length > 0 && (
                        <button onClick={() => setAssigning(t)} style={actionBtn(GREEN)}>Assign</button>
                      )}
                      <button onClick={() => openEdit(t)} style={actionBtn(GOLD)}>✎ Edit</button>
                      <button onClick={() => setDeleteConfirm(t.key)} style={actionBtn(RED)}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: RED }}>Delete talent + all assignments?</span>
                      <button onClick={() => handleDelete(t.key)} style={actionBtn(RED)}>Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} style={actionBtn(DIM)}>Cancel</button>
                    </div>
                  )}
                </div>

                {/* Expanded description */}
                {isExp && (
                  <div style={{ padding: '0 12px 12px 32px', borderTop: `1px solid ${BORDER}` }}>
                    {t.description ? (
                      <div style={{ fontFamily: FONT_C, fontSize: FS_LABEL, color: TEXT, lineHeight: 1.5, paddingTop: 10 }}>
                        <RichText text={t.description} />
                      </div>
                    ) : (
                      <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, paddingTop: 10, fontStyle: 'italic' }}>
                        No description provided.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Editor panel */}
      {editorOpen && campaignId && (
        <EditorPanel
          talent={editTarget}
          campaignId={campaignId}
          supabase={supabase}
          onSaved={handleSaved}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Assign modal */}
      {assigning && (
        <AssignModal
          talent={assigning}
          characters={characters}
          supabase={supabase}
          onClose={() => setAssigning(null)}
          sendToChar={sendToChar}
        />
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_C, fontSize: FS_OVER, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: GOLD_DIM, marginBottom: 6,
}

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${GOLD_BD}`,
  color: TEXT, fontFamily: FONT_C, fontSize: FS_LABEL,
  padding: '6px 10px', borderRadius: 3, outline: 'none',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid ${GOLD_BD}`,
  color: GOLD, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  padding: '8px 16px', borderRadius: 3, cursor: 'pointer',
}

const btnSecondary: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER}`,
  color: DIM, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '8px 14px', borderRadius: 3, cursor: 'pointer',
}

function actionBtn(color: string): React.CSSProperties {
  return {
    background: `${color}14`, border: `1px solid ${color}40`,
    color, fontFamily: FONT_C, fontSize: FS_CAP, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
  }
}
