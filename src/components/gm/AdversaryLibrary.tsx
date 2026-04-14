'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { Adversary } from '@/lib/adversaries'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import { toast } from 'sonner'
import { AdversaryDetailPanel } from './AdversaryDetailPanel'
import { AdversaryEditor } from './AdversaryEditor'

/* ── Design tokens ─────────────────────────────────────── */
const FC       = "var(--font-cinzel), 'Cinzel', serif"
const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FM       = "'Share Tech Mono','Courier New',monospace"
const PANEL_BG = 'rgba(8,16,10,0.88)'
const RAISED   = 'rgba(14,26,18,0.9)'
const INPUT_BG = 'rgba(0,0,0,0.35)'
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const TEXT     = '#C8D8C0'
const DIM      = '#6A8070'
const BORDER   = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const GREEN    = '#4EC87A'
const RED      = '#E05050'
const BLUE     = '#5AAAE0'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

const TYPE_COLORS: Record<string, string> = {
  minion:  DIM,
  rival:   BLUE,
  nemesis: GOLD,
}

/* ── Types ─────────────────────────────────────────────── */
type TypeFilter   = 'all' | 'minion' | 'rival' | 'nemesis'
type SourceFilter = 'all' | 'oggdude' | 'custom'

interface AdversaryTokenMap { [name: string]: string }

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
  campaignId:  string
  sessionMode: 'exploration' | 'combat'
}

/* ── Helpers ───────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? DIM
  return (
    <span style={{
      fontFamily: FM, fontSize: FS_CAPTION, fontWeight: 700, flexShrink: 0,
      color, border: `1px solid ${color}`, borderRadius: 2,
      padding: '1px 6px', letterSpacing: '0.08em',
      background: `${color}18`,
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
  const c = color ?? GOLD
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        padding: '4px 12px', borderRadius: 12, border: `1px solid ${active ? c : BORDER}`,
        background: active ? `${c}20` : 'transparent',
        color: active ? c : DIM,
        cursor: 'pointer', transition: '.12s',
      }}
    >
      {children}
    </button>
  )
}

function TokenCircle({
  adversary, tokenUrl,
}: { adversary: Adversary; tokenUrl?: string }) {
  const color = TYPE_COLORS[adversary.type] ?? DIM
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: RAISED, border: `2px solid ${color}`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {tokenUrl ? (
        <img src={tokenUrl} alt={adversary.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color, fontWeight: 700 }}>
          {adversary.name.charAt(0)}
        </span>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export function AdversaryLibrary({ campaignId, sessionMode }: AdversaryLibraryProps) {
  const supabase = createClient()

  /* ── Data state ──────────────────────────────────────── */
  const [oggdude,       setOggdude]       = useState<Adversary[]>([])
  const [custom,        setCustom]        = useState<(Adversary & { _isCustom: true; _dbId: string })[]>([])
  const [tokenImages,   setTokenImages]   = useState<AdversaryTokenMap>({})
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

  /* ── Load data ───────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [advsResult, customResult, tokensResult] = await Promise.all([
          fetchAdversaries(),
          supabase.from('ref_adversaries').select('*').order('name'),
          supabase.from('adversary_token_images').select('adversary_key, token_image_url'),
        ])

        if (cancelled) return

        setOggdude(advsResult)

        if (customResult.data) {
          setCustom(customResult.data.map(r => dbRowToAdversary(r as Record<string, unknown>)))
        }

        if (tokensResult.data) {
          const map: AdversaryTokenMap = {}
          for (const row of tokensResult.data) {
            map[String(row.adversary_key)] = String(row.token_image_url)
          }
          setTokenImages(map)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{
          fontFamily: FC, fontSize: FS_H4, fontWeight: 700,
          color: GOLD, letterSpacing: '0.08em',
        }}>
          Adversary Library
        </div>
        <button
          onClick={openNew}
          style={{
            background: 'rgba(200,170,80,0.08)', border: `1px solid ${GOLD_DIM}`,
            color: GOLD, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 3,
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
          color: TEXT, fontFamily: FR, fontSize: FS_SM,
          padding: '8px 12px', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['all', 'minion', 'rival', 'nemesis'] as TypeFilter[]).map(t => (
          <PillBtn
            key={t}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
            color={t === 'all' ? GOLD : TYPE_COLORS[t]}
          >
            {t === 'all' ? 'All' : t}
          </PillBtn>
        ))}
        <div style={{ width: 1, background: BORDER, margin: '0 4px' }} />
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
        <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: FR, fontSize: FS_SM, color: DIM }}>
          Search for an adversary above, or select &ldquo;Custom&rdquo; to browse your adversaries.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: FR, fontSize: FS_SM, color: DIM }}>
          Loading adversaries…
        </div>
      ) : (
        <>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
            {search.trim()
              ? <>Showing {filtered.length} adversar{filtered.length === 1 ? 'y' : 'ies'} matching &ldquo;{search}&rdquo;</>
              : <>Showing {filtered.length} custom adversar{filtered.length === 1 ? 'y' : 'ies'}</>
            }
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: FR, fontSize: FS_SM, color: DIM }}>
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
                    onAddToCombat={() => requestAddToCombat(adv)}
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
          onAddToCombat={() => requestAddToCombat(selectedAdversary)}
          onTokenUploaded={handleTokenUploaded}
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
    </div>
  )
}

/* ── Adversary list row ────────────────────────────────── */
function AdversaryRow({
  adversary, tokenUrl, isLast, onView, onEdit, onAddToCombat,
}: {
  adversary: Adversary & { _isCustom?: boolean }
  tokenUrl?: string
  isLast: boolean
  onView: () => void
  onEdit: () => void
  onAddToCombat: () => void
}) {
  const color = TYPE_COLORS[adversary.type] ?? DIM

  const btnRowStyle: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${BORDER}`,
    color: DIM,
    fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '4px 10px', borderRadius: 3,
    cursor: 'pointer', flexShrink: 0, transition: '.12s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: 'transparent',
      borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
      flexWrap: 'wrap',
    }}>
      {/* Token */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(14,26,18,0.9)', border: `2px solid ${color}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {tokenUrl ? (
          <img src={tokenUrl} alt={adversary.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color, fontWeight: 700 }}>
            {adversary.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: FC,
            fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
            fontWeight: 700, color: TEXT,
          }}>
            {adversary._isCustom && <span style={{ color: GOLD }}>★ </span>}
            {adversary.name}
          </span>
          <TypeBadge type={adversary.type} />
        </div>
        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
          Soak {adversary.soak} · WT {adversary.wound}
          {adversary.type === 'minion' && ' (per minion)'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={onView} style={btnRowStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = DIM }}
        >
          View
        </button>
        <button onClick={onEdit} style={btnRowStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD_DIM; (e.currentTarget as HTMLElement).style.color = GOLD }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = DIM }}
        >
          Edit
        </button>
        <button
          onClick={onAddToCombat}
          style={{
            ...btnRowStyle,
            borderColor: 'rgba(224,80,80,0.3)', color: RED,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          ⚔ Combat
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
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 750,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(8,16,10,0.97)',
          border: `1px solid ${BORDER_HI}`,
          borderRadius: 8,
          padding: '20px 24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{
          fontFamily: FC, fontSize: FS_H4, fontWeight: 700,
          color: GOLD, letterSpacing: '0.1em', marginBottom: 4,
        }}>
          Add to Combat
        </div>
        <div style={{
          fontFamily: FR, fontSize: FS_SM, color: TEXT, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: color, fontWeight: 700 }}>{adversary.name}</span>
          <span style={{
            fontFamily: '"Share Tech Mono","Courier New",monospace',
            fontSize: FS_CAPTION, color, border: `1px solid ${color}`,
            borderRadius: 2, padding: '1px 6px', background: `${color}18`,
          }}>
            {adversary.type.toUpperCase()}
          </span>
        </div>

        {/* Alignment toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Alignment
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['enemy', 'allied_npc'] as const).map(al => {
              const alColor = al === 'enemy' ? RED : GREEN
              const active = alignment === al
              return (
                <button
                  key={al}
                  onClick={() => onChange({ ...state, alignment: al })}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 3,
                    fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
                    letterSpacing: '0.08em', cursor: 'pointer',
                    border: `1px solid ${active ? alColor : BORDER}`,
                    background: active ? `${alColor}15` : 'transparent',
                    color: active ? alColor : DIM,
                    transition: '.12s',
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Group Size
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => onChange({ ...state, groupSize: Math.max(1, groupSize - 1) })}
                style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, cursor: 'pointer', fontFamily: FR, fontSize: FS_H4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                −
              </button>
              <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT, minWidth: 32, textAlign: 'center' }}>
                {groupSize}
              </span>
              <button
                onClick={() => onChange({ ...state, groupSize: Math.min(20, groupSize + 1) })}
                style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM, cursor: 'pointer', fontFamily: FR, fontSize: FS_H4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 3,
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: DIM, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{
              flex: 2, padding: '9px 0', borderRadius: 3,
              background: 'rgba(224,80,80,0.10)',
              border: `1px solid rgba(224,80,80,0.45)`,
              color: RED, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Adding…' : '⚔ Add to Combat'}
          </button>
        </div>
      </div>
    </div>
  )
}
