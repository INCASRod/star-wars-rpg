'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { Adversary } from '@/lib/adversaries'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import { toast } from 'sonner'
import { AdversaryDetailPanel } from './AdversaryDetailPanel'
import { AdversaryEditor } from './AdversaryEditor'
import { HUD, FONT_BODY, EASE } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'

/* ── Design tokens ─────────────────────────────────────── */
const RAISED   = 'rgba(14,26,18,0.9)'
const INPUT_BG = 'rgba(0,0,0,0.35)'
const TEXT     = HUD.text
const DIM      = HUD.textDim
const BORDER   = HUD.border
const BORDER_HI = HUD.borderHi
const GREEN    = 'var(--state-success)'
const RED      = 'var(--state-failure)'
const BLUE     = 'var(--die-force)'

const FS_CAPTION  = 'var(--text-caption)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

const TYPE_COLORS: Record<string, string> = {
  minion:  HUD.textDim,
  rival:   'var(--die-force)',
  nemesis: HUD.gold,
}

/* ── Types ─────────────────────────────────────────────── */
type TypeFilter   = 'all' | 'minion' | 'rival' | 'nemesis'
type SourceFilter = 'all' | 'oggdude' | 'custom'


interface AddCombatState {
  adversary:  Adversary & { _isCustom?: boolean }
  alignment:  'enemy' | 'allied_npc'
  groupSize:  number
}

/* ── DB row → Adversary ────────────────────────────────── */
function dbRowToAdversary(row: Record<string, unknown>): Adversary & { _isCustom: true; _dbId: string } {
  const skillRanks = (row.skill_ranks as Record<string, number>) ?? {}
  const characteristicOverrides = (row.characteristic_overrides as Record<string, string> | undefined) ?? undefined
  return {
    id:          String(row.id),
    name:        String(row.name),
    type:        (row.type as 'minion' | 'rival' | 'nemesis'),
    brawn:       Number(row.brawn ?? 2),
    agility:     Number(row.agility ?? 2),
    intellect:   Number(row.intellect ?? 2),
    cunning:     Number(row.cunning ?? 2),
    willpower:   Number(row.willpower ?? 2),
    presence:    Number(row.presence ?? 2),
    soak:        Number(row.soak ?? 2),
    wound:       Number(row.wound_threshold ?? 10),
    strain:      row.strain_threshold != null ? Number(row.strain_threshold) : undefined,
    defense:     [Number(row.defense_melee ?? 0), Number(row.defense_ranged ?? 0)],
    skills:      Object.keys(skillRanks),
    skillRanks,
    characteristicOverrides: characteristicOverrides && Object.keys(characteristicOverrides).length > 0
      ? characteristicOverrides
      : undefined,
    talents:     (row.talents as Adversary['talents']) ?? [],
    abilities:   (row.abilities as Adversary['abilities']) ?? [],
    weapons:     (row.weapons as Adversary['weapons']) ?? [],
    gear:        (row.gear as Adversary['gear']) ?? [],
    description: row.description ? String(row.description) : undefined,
    _isCustom:   true,
    _dbId:       String(row.id),
  } as Adversary & { _isCustom: true; _dbId: string }
}

/* ── Props ─────────────────────────────────────────────── */
export interface AdversaryLibraryProps {
  campaignId:   string
  sessionMode:  'exploration' | 'combat'
  /** When provided, switches "Add to Combat" to "Add Token" mode with a simplified alignment picker. */
  onAddToken?:  (adv: Adversary & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => void
  /** When provided, passed to AdversaryDetailPanel so token uploads also patch existing map_tokens rows. */
  mapId?:       string | null
}

/* ── Helpers ───────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? HUD.textDim
  return (
    <span style={{
      fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, flexShrink: 0,
      color, border: `1px solid ${color}`, borderRadius: 2,
      padding: '1px 6px', letterSpacing: '0.08em',
      background: `color-mix(in srgb, ${color} 9%, transparent)`,
    }}>
      {type.toUpperCase()}
    </span>
  )
}

function PillBtn({
  active, onClick, children, color,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: string
}) {
  const c = color ?? HUD.gold
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        padding: '0.25rem 0.75rem', borderRadius: 12, border: `1px solid ${active ? c : BORDER}`,
        background: active ? `${c}20` : 'transparent',
        color: active ? c : DIM,
        cursor: 'pointer', transition: EASE.quick,
      }}
    >
      {children}
    </button>
  )
}

function TokenCircle({
  adversary, tokenUrl,
}: { adversary: Adversary; tokenUrl?: string }) {
  const color = TYPE_COLORS[adversary.type] ?? HUD.textDim
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: RAISED, border: `2px solid ${color}`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {tokenUrl ? (
        <img src={tokenUrl} alt={adversary.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color, fontWeight: 700 }}>
          {adversary.name.charAt(0)}
        </span>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export function AdversaryLibrary({ campaignId, sessionMode, onAddToken, mapId }: AdversaryLibraryProps) {
  const supabase = createClient()

  /* ── Data state ──────────────────────────────────────── */
  const [oggdude,       setOggdude]       = useState<Adversary[]>([])
  const [custom,        setCustom]        = useState<(Adversary & { _isCustom: true; _dbId: string })[]>([])
  const { tokenImages, setTokenImages }   = useAdversaryTokenImages()
  const [loading,       setLoading]       = useState(true)

  /* ── Filter state ────────────────────────────────────── */
  const [search,       setSearch]        = useState('')
  const [typeFilter,   setTypeFilter]    = useState<TypeFilter>('all')
  const [sourceFilter, setSourceFilter]  = useState<SourceFilter>('all')

  /* ── UI state ────────────────────────────────────────── */
  const [selectedAdversary, setSelectedAdversary] = useState<(Adversary & { _isCustom?: boolean }) | null>(null)
  const [showEditor,        setShowEditor]         = useState(false)
  const [editorTemplate,    setEditorTemplate]     = useState<(Adversary & { _isCustom?: boolean }) | undefined>(undefined)
  const [editorEditId,      setEditorEditId]       = useState<string | undefined>(undefined)
  const [addConfirm,        setAddConfirm]         = useState<AddCombatState | null>(null)
  const [addBusy,           setAddBusy]            = useState(false)
  const [addTokenPending,   setAddTokenPending]    = useState<(Adversary & { _isCustom?: boolean }) | null>(null)

  /* ── Load data ───────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [advsResult, customResult] = await Promise.all([
          fetchAdversaries(),
          supabase.from('ref_adversaries').select('*').order('name'),
        ])

        if (cancelled) return

        setOggdude(advsResult)

        if (customResult.data) {
          setCustom(customResult.data.map(r => dbRowToAdversary(r as Record<string, unknown>)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Combined + filtered list ────────────────────────── */
  const allAdversaries = useMemo((): (Adversary & { _isCustom?: boolean })[] => {
    const base: (Adversary & { _isCustom?: boolean })[] = [
      ...oggdude,
      ...custom,
    ]
    return base
  }, [oggdude, custom])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allAdversaries
      .filter(a => {
        if (typeFilter !== 'all' && a.type !== typeFilter) return false
        if (sourceFilter === 'oggdude' && a._isCustom) return false
        if (sourceFilter === 'custom' && !a._isCustom) return false
        if (q && !a.name.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allAdversaries, search, typeFilter, sourceFilter])

  /* ── Token uploaded callback ─────────────────────────── */
  const handleTokenUploaded = useCallback((name: string, url: string) => {
    setTokenImages(prev => ({ ...prev, [name]: url }))
    // If the detail panel is open for this adversary, update tokenImages
    toast.success(`Token updated for ${name}`)
  }, [])

  /* ── Editor flow ─────────────────────────────────────── */
  const openNew = () => {
    setEditorTemplate(undefined)
    setEditorEditId(undefined)
    setShowEditor(true)
    setSelectedAdversary(null)
  }

  const openEdit = (adv: Adversary & { _isCustom?: boolean }) => {
    setEditorTemplate(adv)
    setEditorEditId(adv._isCustom ? (adv as Adversary & { _dbId?: string })._dbId : undefined)
    setShowEditor(true)
    setSelectedAdversary(null)
  }

  const handleSaved = (saved: Adversary & { _isCustom: true; _dbId: string }) => {
    setCustom(prev => {
      const idx = prev.findIndex(c => c._dbId === saved._dbId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
    setShowEditor(false)
    toast.success(`Adversary "${saved.name}" saved.`)
  }

  /* ── Add Token flow (staging / token mode) ──────────── */
  const requestAddToken = (adv: Adversary & { _isCustom?: boolean }) => {
    setAddTokenPending(adv)
    setSelectedAdversary(null)
  }

  const confirmAddToken = (alignment: 'enemy' | 'allied_npc') => {
    if (!addTokenPending || !onAddToken) return
    onAddToken({ ...addTokenPending, _tokenImageUrl: tokenImages[addTokenPending.name] ?? null }, alignment)
    setAddTokenPending(null)
  }

  /* ── Add to Combat flow ──────────────────────────────── */
  const requestAddToCombat = (adv: Adversary & { _isCustom?: boolean }) => {
    if (sessionMode !== 'combat') {
      toast.info('No active encounter. Start combat first, then add adversaries.')
      return
    }
    setAddConfirm({
      adversary: adv,
      alignment: 'enemy',
      groupSize: adv.type === 'minion' ? 4 : 1,
    })
    setSelectedAdversary(null)
  }

  const confirmAddToCombat = async () => {
    if (!addConfirm) return
    setAddBusy(true)
    try {
      // Load active encounter
      const { data: encounters } = await supabase
        .from('combat_encounters')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const enc = encounters?.[0] as CombatEncounter | undefined
      if (!enc) {
        toast.error('No active encounter found.')
        setAddConfirm(null)
        return
      }

      const instance = adversaryToInstance(addConfirm.adversary, addConfirm.groupSize)
      const newSlot: InitiativeSlot = {
        id:                  randomUUID(),
        type:                'npc',
        alignment:           addConfirm.alignment,
        order:               (enc.initiative_slots?.length ?? 0) + 1,
        name:                addConfirm.adversary.name,
        acted:               false,
        current:             false,
        successes:           0,
        advantages:          0,
        adversaryInstanceId: instance.instanceId,
      }

      await supabase.from('combat_encounters').update({
        adversaries:      [...(enc.adversaries ?? []), instance],
        initiative_slots: [...(enc.initiative_slots ?? []), newSlot],
        updated_at:       new Date().toISOString(),
      }).eq('id', enc.id)

      toast.success(`${addConfirm.adversary.name} added to combat.`)
      setAddConfirm(null)
    } catch (err) {
      console.error('Add to combat failed', err)
      toast.error('Failed to add adversary to encounter.')
    } finally {
      setAddBusy(false)
    }
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700,
          color: HUD.gold, letterSpacing: '0.08em',
        }}>
          Adversary Library
        </div>
        <button
          onClick={openNew}
          style={{
            background: 'rgba(200,170,80,0.08)', border: `1px solid ${HUD.borderHi}`,
            color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.1em', padding: '0.375rem 0.875rem', borderRadius: 3,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          + New Adversary
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search adversaries…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 4,
          color: TEXT, fontFamily: FONT_BODY, fontSize: FS_SM,
          padding: '0.5rem 0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {(['all', 'minion', 'rival', 'nemesis'] as TypeFilter[]).map(t => (
          <PillBtn
            key={t}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
            color={t === 'all' ? HUD.gold : TYPE_COLORS[t]}
          >
            {t === 'all' ? 'All' : t}
          </PillBtn>
        ))}
        <div style={{ width: 1, background: BORDER, margin: '0 0.25rem' }} />
        {([
          ['all',     'All Sources'],
          ['oggdude', 'OggDude'],
          ['custom',  'Custom'],
        ] as [SourceFilter, string][]).map(([s, label]) => (
          <PillBtn key={s} active={sourceFilter === s} onClick={() => setSourceFilter(s)}>
            {label}
          </PillBtn>
        ))}
      </div>

      {/* Count + List */}
      {!search.trim() && sourceFilter !== 'custom' ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
          Search for an adversary above, or select &ldquo;Custom&rdquo; to browse your adversaries.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
          Loading adversaries…
        </div>
      ) : (
        <>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM }}>
            {search.trim()
              ? <>Showing {filtered.length} adversar{filtered.length === 1 ? 'y' : 'ies'} matching &ldquo;{search}&rdquo;</>
              : <>Showing {filtered.length} custom adversar{filtered.length === 1 ? 'y' : 'ies'}</>
            }
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', fontFamily: FONT_BODY, fontSize: FS_SM, color: DIM }}>
              No adversaries found.
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 0,
              border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden',
            }}>
              {filtered.map((adv, idx) => {
                const tokenUrl = tokenImages[adv.name]
                const isLast = idx === filtered.length - 1
                return (
                  <AdversaryRow
                    key={adv.id}
                    adversary={adv}
                    tokenUrl={tokenUrl}
                    isLast={isLast}
                    onView={() => setSelectedAdversary(adv)}
                    onEdit={() => openEdit(adv)}
                    onAddToCombat={onAddToken ? () => requestAddToken(adv) : () => requestAddToCombat(adv)}
                    addLabel={onAddToken ? '◈ Token' : undefined}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selectedAdversary && (
        <AdversaryDetailPanel
          adversary={selectedAdversary}
          campaignId={campaignId}
          supabase={supabase}
          tokenUrl={tokenImages[selectedAdversary.name] ?? null}
          onClose={() => setSelectedAdversary(null)}
          onEdit={() => openEdit(selectedAdversary)}
          onAddToCombat={onAddToken
            ? () => requestAddToken(selectedAdversary)
            : () => requestAddToCombat(selectedAdversary)
          }
          onTokenUploaded={handleTokenUploaded}
          mapId={mapId}
          addButtonLabel={onAddToken ? '◈ Add Token' : undefined}
        />
      )}

      {/* Editor modal */}
      {showEditor && (
        <AdversaryEditor
          editId={editorEditId}
          template={editorTemplate}
          campaignId={campaignId}
          supabase={supabase}
          allAdversaries={allAdversaries}
          onClose={() => setShowEditor(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Add to Combat confirmation overlay */}
      {addConfirm && (
        <AddToCombatOverlay
          state={addConfirm}
          busy={addBusy}
          onChange={setAddConfirm}
          onConfirm={confirmAddToCombat}
          onCancel={() => setAddConfirm(null)}
        />
      )}

      {/* Add Token confirmation overlay (staging / token mode) */}
      {addTokenPending && (
        <AddTokenOverlay
          entityName={addTokenPending.name}
          onAdd={confirmAddToken}
          onCancel={() => setAddTokenPending(null)}
        />
      )}
    </div>
  )
}

/* ── Adversary list row ────────────────────────────────── */
function AdversaryRow({
  adversary, tokenUrl, isLast, onView, onEdit, onAddToCombat, addLabel,
}: {
  adversary: Adversary & { _isCustom?: boolean }
  tokenUrl?: string
  isLast: boolean
  onView: () => void
  onEdit: () => void
  onAddToCombat: () => void
  /** When provided, overrides the row action button label (default '⚔ Combat'). */
  addLabel?: string
}) {
  const color = TYPE_COLORS[adversary.type] ?? HUD.textDim

  const btnRowStyle: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${BORDER}`,
    color: DIM,
    fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '0.25rem 0.625rem', borderRadius: 3,
    cursor: 'pointer', flexShrink: 0, transition: EASE.quick,
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0.875rem',
      background: 'transparent',
      borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
      flexWrap: 'wrap',
    }}>
      {/* Token */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: RAISED, border: `2px solid ${color}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {tokenUrl ? (
          <img src={tokenUrl} alt={adversary.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color, fontWeight: 700 }}>
            {adversary.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
            fontWeight: 700, color: TEXT,
          }}>
            {adversary._isCustom && <span style={{ color: HUD.gold }}>★ </span>}
            {adversary.name}
          </span>
          <TypeBadge type={adversary.type} />
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
          Soak {adversary.soak + (adversary.gear ?? []).reduce((s, g) => s + (g.soak ?? 0), 0)} · WT {adversary.wound}
          {adversary.type === 'minion' && ' (per minion)'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
        <button onClick={onView} className="hov-gold" style={btnRowStyle}>
          View
        </button>
        <button onClick={onEdit} className="hov-gold" style={btnRowStyle}>
          Edit
        </button>
        <button
          onClick={onAddToCombat}
          className="hov-red-bg"
          style={{
            ...btnRowStyle,
            borderColor: 'rgba(224,80,80,0.3)', color: RED,
          }}
        >
          {addLabel ?? '⚔ Combat'}
        </button>
      </div>
    </div>
  )
}

/* ── Add to Combat overlay ─────────────────────────────── */
function AddToCombatOverlay({
  state, busy, onChange, onConfirm, onCancel,
}: {
  state:     AddCombatState
  busy:      boolean
  onChange:  (s: AddCombatState) => void
  onConfirm: () => void
  onCancel:  () => void
}) {
  const { adversary, alignment, groupSize } = state
  const color = TYPE_COLORS[adversary.type] ?? DIM

  return (
    <Modal
      open
      onClose={onCancel}
      zIndex={9050}
      maxWidth={400}
      backdrop="rgba(0,0,0,0.72)"
      borderColor={BORDER_HI}
      shadow="0 16px 48px rgba(0,0,0,0.8)"
      panelBackground="rgba(8,16,10,0.97)"
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700,
          color: HUD.gold, letterSpacing: '0.1em', marginBottom: '0.25rem',
        }}>
          Add to Combat
        </div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT, marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ color: color, fontWeight: 700 }}>{adversary.name}</span>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: FS_CAPTION, color, border: `1px solid ${color}`,
            borderRadius: 2, padding: '1px 6px', background: `${color}18`,
          }}>
            {adversary.type.toUpperCase()}
          </span>
        </div>

        {/* Alignment toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Alignment
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['enemy', 'allied_npc'] as const).map(al => {
              const alColor = al === 'enemy' ? RED : GREEN
              const active = alignment === al
              return (
                <button
                  key={al}
                  onClick={() => onChange({ ...state, alignment: al })}
                  style={{
                    flex: 1, padding: '0.5rem 0', borderRadius: 3,
                    fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
                    letterSpacing: '0.08em', cursor: 'pointer',
                    border: `1px solid ${active ? alColor : BORDER}`,
                    background: active ? `${alColor}15` : 'transparent',
                    color: active ? alColor : DIM,
                    transition: EASE.quick,
                  }}
                >
                  {al === 'enemy' ? '⚔ Enemy' : '🤝 Allied NPC'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Group size for minions */}
        {adversary.type === 'minion' && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Group Size
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <button
                onClick={() => onChange({ ...state, groupSize: Math.max(1, groupSize - 1) })}
                style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS_H4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                −
              </button>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: TEXT, minWidth: 32, textAlign: 'center' }}>
                {groupSize}
              </span>
              <button
                onClick={() => onChange({ ...state, groupSize: Math.min(20, groupSize + 1) })}
                style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS_H4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.5625rem 0', borderRadius: 3,
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: DIM, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{
              flex: 2, padding: '0.5625rem 0', borderRadius: 3,
              background: 'rgba(224,80,80,0.10)',
              border: `1px solid rgba(224,80,80,0.45)`,
              color: RED, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Adding…' : '⚔ Add to Combat'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Add Token overlay (staging / token mode) ──────────── */
function AddTokenOverlay({
  entityName, onAdd, onCancel,
}: {
  entityName: string
  onAdd:      (alignment: 'enemy' | 'allied_npc') => void
  onCancel:   () => void
}) {
  return (
    <Modal
      open
      onClose={onCancel}
      zIndex={9100}
      maxWidth={360}
      backdrop="rgba(0,0,0,0.72)"
      borderColor={BORDER_HI}
      shadow="0 16px 48px rgba(0,0,0,0.8)"
      panelBackground="rgba(8,16,10,0.97)"
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Add Token
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT, marginBottom: '1.25rem' }}>
          <span style={{ fontWeight: 700 }}>{entityName}</span>
          {' '}&mdash; choose alignment:
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => onAdd('enemy')}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 4,
              fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(224,80,80,0.12)',
              border: '1px solid rgba(224,80,80,0.5)',
              color: RED, transition: EASE.quick,
            }}
          >
            ⚔ Enemy
          </button>
          <button
            onClick={() => onAdd('allied_npc')}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 4,
              fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(78,200,122,0.12)',
              border: '1px solid rgba(78,200,122,0.5)',
              color: GREEN, transition: EASE.quick,
            }}
          >
            🤝 Friendly NPC
          </button>
        </div>
        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: '0.4375rem 0', borderRadius: 4,
            background: 'transparent', border: `1px solid ${BORDER}`,
            color: DIM, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}
