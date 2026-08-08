'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Modal } from '@/components/ui/Modal'
import { NumberField } from '@/components/ui/NumberField'
import { createClient } from '@/lib/supabase/client'
import { sortInitiative } from '@/lib/combat'
import { createPendingAction, cancelPendingActionsByType } from '@/hooks/useGmBroadcast'
import type { PendingAction } from '@/hooks/usePendingActions'
import { rollPool } from '@/components/player-hud/dice-engine'
import { randomUUID } from '@/lib/utils'
import { CHARACTERISTIC_ABBR } from '@/lib/types'
import type { InitiativeSlot, CombatEncounter, SlotAlignment } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { Character, CharacteristicKey } from '@/lib/types'
import type { MapToken } from '@/hooks/useMapTokens'
import { HUD, FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, EASE, Z, DICE_COLOR } from '@/lib/tokens'

// ── Layout tokens ─────────────────────────────────────────────────
const FD    = FONT_DISPLAY
const FB    = FONT_BODY
const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'
const TEXT       = HUD.text
const TEXT_DIM   = HUD.textDim
const TEXT_MUTED = HUD.textFaint

// Chamfered plate clip — echoes InitiativeStrip's Imperial-Dossier corner treatment
const PLATE_CLIP = 'polygon(7px 0%, calc(100% - 7px) 0%, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0% calc(100% - 7px), 0% 7px)'

// Sub-token spacing exception (UI gate §2 "Compact rows" / "Secondary buttons"):
// the dense order rail, inline chips and the ×N badge use literal 1–2px vertical
// padding and 1–2px gaps. SP[1] is the smallest spacing token (4→8px) and is
// taller than a single rail row is allowed to be. Every other padding, margin
// and gap in this file uses SP[N].

function buildDicePool(characteristic: number, skillRank: number) {
  const proficiency = Math.min(characteristic, skillRank)
  const ability = Math.max(characteristic, skillRank) - proficiency
  return { proficiency, ability }
}

function ordinalSuffix(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1:  return `${n}st`
    case 2:  return `${n}nd`
    case 3:  return `${n}rd`
    default: return `${n}th`
  }
}

// ── Role colour language — consistent with InitiativeStrip + CombatFeedPanel's TypeBadge ──
type PlateRole = 'pc' | 'enemy' | 'friendly' | 'vehicle'
const ROLE_STYLE: Record<PlateRole, { color: string; tag: string; longLabel: string }> = {
  pc:       { color: HUD.accentPurple,        tag: 'PC',       longLabel: 'Player Character' },
  enemy:    { color: 'var(--state-failure)',   tag: 'ENEMY',    longLabel: 'Enemy' },
  friendly: { color: 'var(--state-advantage)', tag: 'FRIENDLY', longLabel: 'Friendly NPC' },
  vehicle:  { color: HUD.gold,                 tag: 'VEH',      longLabel: 'Vehicle' },
}

// ── Skill catalog ─────────────────────────────────────────────────
// `ref_skills.type` is the authoritative category field — 'stCombat' is exactly
// the six combat skills (BRAWL, GUNN, LTSABER, MELEE, RANGHVY, RANGLT), so the
// non-combat filter is a data lookup, never a hardcoded name list.
interface SkillDef {
  key:  string
  name: string
  /** Full Character/AdversaryInstance.characteristics field name, e.g. 'willpower'. */
  charKey: CharacteristicKey
  type: string
}

const DEFAULT_SKILL_KEY: Record<'cool' | 'vigilance', string> = { cool: 'COOL', vigilance: 'VIGIL' }

function DiePip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 16, height: 16, borderRadius: RADIUS.sm,
      border: `1px solid ${color}`,
      background: `color-mix(in srgb, ${color} 18%, transparent)`,
      fontFamily: FB, fontSize: FS.overline, fontWeight: 700, color, marginRight: 2, flexShrink: 0,
    }}>{label}</span>
  )
}

function DicePoolPips({ proficiency, ability }: { proficiency: number; ability: number }) {
  if (proficiency === 0 && ability === 0) return <span style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>—</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: proficiency }).map((_, i) => <DiePip key={`p${i}`} color={DICE_COLOR.proficiency} label="P" />)}
      {Array.from({ length: ability }).map((_, i) => <DiePip key={`a${i}`} color={DICE_COLOR.ability} label="A" />)}
    </div>
  )
}

function RoleTag({ role, longForm = false }: { role: PlateRole; longForm?: boolean }) {
  const cfg = ROLE_STYLE[role]
  return (
    <span style={{
      fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
      color: cfg.color,
      border: `1px solid color-mix(in srgb, ${cfg.color} 50%, transparent)`,
      borderRadius: RADIUS.sm, padding: '1px 6px',
      background: `color-mix(in srgb, ${cfg.color} 14%, transparent)`,
      flexShrink: 0, whiteSpace: 'nowrap' as const, textTransform: 'uppercase' as const,
    }}>
      {longForm ? cfg.longLabel : cfg.tag}
    </span>
  )
}

/**
 * Successes/Advantages entry. `live` marks a value that arrived from the
 * player's own submission rather than being typed by the GM — the GM can
 * always type straight over it (which clears the live treatment).
 */
function NumInput({ value, onChange, live = false, label }: {
  value: number
  onChange: (v: number) => void
  live?: boolean
  label: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
      <span style={{ fontFamily: FB, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEXT_MUTED }}>
        {label}
      </span>
      <NumberField
        min={0} max={20} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="iset-num-input"
        data-live={live}
        style={{
          width: 44, background: 'var(--hud-surface-mid)',
          border: `1px solid ${live ? 'color-mix(in srgb, var(--state-success) 65%, transparent)' : BORDER_HI}`,
          borderRadius: RADIUS.sm, padding: `1px ${SP[1]}`,
          color: live ? 'var(--state-success)' : TEXT,
          fontFamily: FB, fontSize: FS.sm, fontWeight: live ? 700 : 400,
          textAlign: 'center', outline: 'none',
        }}
      />
    </label>
  )
}

/** Inline per-row skill override. Non-combat skills only. */
function SkillSelect({ value, skills, onChange, overridden }: {
  value: string
  skills: SkillDef[]
  onChange: (key: string) => void
  overridden: boolean
}) {
  return (
    <select
      className="iset-skill-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      title="Initiative skill for this row"
      style={{
        maxWidth: 128,
        background: 'var(--hud-surface-mid)',
        border: `1px solid ${overridden ? `color-mix(in srgb, ${HUD.gold} 60%, transparent)` : BORDER}`,
        borderRadius: RADIUS.sm, padding: `1px ${SP[1]}`,
        color: overridden ? HUD.gold : TEXT_DIM,
        fontFamily: FB, fontSize: FS.overline, outline: 'none', cursor: 'pointer',
      }}
    >
      {skills.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
    </select>
  )
}

function ColumnHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[2],
      padding: `${SP[1]} 0`, marginBottom: SP[1],
      borderBottom: `1px solid ${BORDER}`,
      position: 'sticky', top: 0, zIndex: Z.sticky,
      background: 'var(--hud-panel)',
    }}>
      <div style={{
        fontFamily: FD, fontSize: FS.overline, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
        color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)`,
      }}>
        {children}
      </div>
      {action}
    </div>
  )
}

// ── Board item — local-only identity distinct from any DB id (duplicates need unique keys) ──
interface BoardItem {
  boardId: string
  kind:    'pc' | 'npc' | 'vehicle'
  sourceId: string
  /** 1 = original; 2+ = duplicate, badge reads "×N · Nth Action" */
  ordinal: number
}

interface ResolvedBoardItem {
  role:        PlateRole
  slotType:    'pc' | 'npc'
  alignment:   SlotAlignment
  name:        string
  meta:        string
  successes:   number
  advantages:  number
  pending:     boolean
  characterId?: string
  adversaryInstanceId?: string
  vehicleInstanceId?: string
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  campaignId: string
  characters: Character[]
  roster: AdversaryInstance[]
  vehicleRoster: VehicleInstance[]
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
  onClose: () => void
  onStart: (encounter: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  /** Pre-fetched Cool/Vigilance skill ranks per character — used as a seed until
   *  the full per-character skill fetch lands. */
  charSkillRanks?: Record<string, { cool: number; vigilance: number }>
  /** Live map tokens for the active map — source of truth for on-map visibility
   *  and for the disposition the GM assigned, when the instance predates
   *  AdversaryInstance.alignment. */
  tokens?: MapToken[]
  /** The deck's persisted initiative slots — the only link from a token
   *  (`slot_key`) back to its adversary/vehicle instance id. */
  encounterSlots?: InitiativeSlot[]
}

export function InitiativeSetupModal({
  campaignId, characters, roster, vehicleRoster, sendToChar, onClose, onStart,
  charSkillRanks: propSkillRanks, tokens, encounterSlots,
}: Props) {
  const [initType, setInitType] = useState<'cool' | 'vigilance'>('vigilance')
  const defaultSkillKey = DEFAULT_SKILL_KEY[initType]

  // PC roll results — updated via broadcast from players
  const [pcResults, setPcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(characters.map(c => [c.id, { successes: 0, advantages: 0 }]))
  )
  /** Which PC values arrived live from the player (vs. typed by the GM). */
  const [pcLive, setPcLive] = useState<Record<string, boolean>>({})

  // NPC roll results — entered/rolled by GM
  const [npcResults, setNpcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(roster.map(a => [a.instanceId, { successes: 0, advantages: 0 }]))
  )

  // Explicit GM disposition overrides only. The effective alignment is resolved
  // below against the instance, the live map token and the deck's own slot —
  // the old seeded-state version silently read "enemy" for any instance that
  // predates AdversaryInstance.alignment (every roster handed in by the
  // Recheck-initiative call site).
  const [npcAlignOverride, setNpcAlignOverride] = useState<Record<string, 'enemy' | 'allied_npc'>>({})

  /** Adversaries the GM has excluded from this encounter — produce no slot. */
  const [excludedNpc, setExcludedNpc] = useState<Record<string, boolean>>({})

  // Vehicle roll results — always hand-entered by the GM (no rollable stat on vehicles).
  // Kept separate from npcResults/npcAlignments — vehicles are a distinct roster.
  const [vehicleResults, setVehicleResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(vehicleRoster.map(v => [v.instanceId, { successes: 0, advantages: 0 }]))
  )

  // Per-vehicle: does this vehicle get its own initiative slot, or stay off the order
  // (still added to combat_encounters.vehicles[], attachable later via Reserve)? Default OFF.
  const [vehicleOwnSlot, setVehicleOwnSlot] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(vehicleRoster.map(v => [v.instanceId, false]))
  )

  // ── Per-row skill assignment ──
  /** GM-chosen skill key per PC row — overrides both the default and the player's own pick. */
  const [pcSkillOverride, setPcSkillOverride] = useState<Record<string, string>>({})
  /** Skill the player actually rolled with, reported on the result broadcast. */
  const [pcPlayerSkill, setPcPlayerSkill] = useState<Record<string, { key: string; name: string }>>({})
  /** GM-chosen skill key per adversary row. */
  const [npcSkillOverride, setNpcSkillOverride] = useState<Record<string, string>>({})

  // ── Skill catalog + full per-character ranks ──
  const [refSkills, setRefSkills] = useState<SkillDef[]>([])
  /** charId → skillKey → rank */
  const [pcSkillRanks, setPcSkillRanks] = useState<Record<string, Record<string, number>>>({})

  const [isStarting, setIsStarting] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // ── Pending-action queue (migration 117) ────────────────────────────────────
  // Setup-session id: one per mount. GmShell only renders this modal while
  // `initiativeSetupOpen` is true, so it is naturally stable for a single setup
  // session and distinct across close-and-reopen — which is the intended
  // semantic, since one encounter can legitimately need initiative twice.
  // Deliberately NOT `stagingEncounter.id`: that is the same value across both
  // of those, and the recheck path has no encounter to hand.
  // This is the `source_ref` for every row the modal creates, and is never null.
  const setupSessionIdRef = useRef<string>(randomUUID())
  /** charId → this session's row status. The queue's answer to "has this PC rolled". */
  const [pcQueueStatus, setPcQueueStatus] = useState<Record<string, PendingAction['status']>>({})
  /** result_payload rows already folded into pcResults — prevents re-applying. */
  const appliedRowsRef = useRef<Set<string>>(new Set())

  const nonCombatSkills = useMemo(() => refSkills.filter(s => s.type !== 'stCombat'), [refSkills])
  const skillByKey = useMemo(() => Object.fromEntries(refSkills.map(s => [s.key, s])) as Record<string, SkillDef>, [refSkills])

  // ── Mount sweep: clear orphaned initiative rows ─────────────────────────────
  // A GM who reloads mid-setup mints a new setupSessionIdRef and can no longer
  // see the previous session's rows; they would sit `pending` until combat ends,
  // with the player still holding a roll modal that broadcasts into a channel
  // whose only subscriber is gone.
  //
  // Deliberately clears rather than adopts: submitted rolls from the dead
  // session are NOT recovered, no session id is persisted, and pcResults still
  // seeds to all-zero. The GM re-requests and reads any prior values off the
  // roll feed.
  //
  // Campaign-wide, because the modal cannot tell a dead session's rows from a
  // live one's — and at mount there is no live one yet. `cancelPendingActionsByType`
  // filters on `status = 'pending'`, so resolved rows are never touched.
  const sweepStartedRef = useRef(false)
  const [sweepDone, setSweepDone] = useState(false)

  useEffect(() => {
    if (!campaignId) { setSweepDone(true); return }
    // Idempotent under StrictMode's double-invoke and any re-render.
    if (sweepStartedRef.current) return
    sweepStartedRef.current = true

    for (const c of characters) sendToChar?.(c.id, { type: 'initiative-cancel' })
    void cancelPendingActionsByType(campaignId, 'initiative')
      .finally(() => setSweepDone(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Subscribe to player initiative results ──
  useEffect(() => {
    const ch = supabase
      .channel(`initiative-${campaignId}`)
      .on('broadcast', { event: 'initiative-result' }, ({ payload }: { payload: Record<string, unknown> }) => {
        const charId = payload.characterId as string
        const suc    = payload.successes  as number
        const adv    = payload.advantages as number
        const sKey   = payload.skillKey   as string | undefined
        const sName  = payload.skillName  as string | undefined
        if (charId) {
          setPcResults(prev => ({ ...prev, [charId]: { successes: suc ?? 0, advantages: adv ?? 0 } }))
          setPcLive(prev => ({ ...prev, [charId]: true }))
          if (sKey) {
            setPcPlayerSkill(prev => ({ ...prev, [charId]: { key: sKey, name: sName ?? sKey } }))
            // The player's pick is newer than any standing GM override — drop it
            // so the card shows what was actually rolled. The GM can re-override.
            setPcSkillOverride(prev => {
              if (!(charId in prev)) return prev
              const next = { ...prev }
              delete next[charId]
              return next
            })
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Track this session's pending_actions rows ───────────────────────────────
  // The durable counterpart to the broadcast subscription above. A result that
  // arrives here but never arrived over the socket (dropped while the player's
  // tab was suspended — the whole reason the queue exists) is folded into
  // pcResults exactly as the broadcast handler would have done.
  //
  // Realtime filters take a single column, so this subscribes on campaign_id and
  // narrows to this setup session client-side.
  useEffect(() => {
    if (!campaignId) return
    const sessionId = setupSessionIdRef.current

    const ingest = (row: PendingAction) => {
      if (row.action_type !== 'initiative') return
      if (row.source_ref !== sessionId) return
      setPcQueueStatus(prev => ({ ...prev, [row.character_id]: row.status }))

      if (row.status !== 'resolved' || !row.result_payload) return
      if (appliedRowsRef.current.has(row.id)) return
      appliedRowsRef.current.add(row.id)

      const rp = row.result_payload as {
        successes?: number; advantages?: number; skillKey?: string; skillName?: string
      }
      setPcResults(prev => ({
        ...prev,
        [row.character_id]: { successes: rp.successes ?? 0, advantages: rp.advantages ?? 0 },
      }))
      setPcLive(prev => ({ ...prev, [row.character_id]: true }))
      if (rp.skillKey) {
        setPcPlayerSkill(prev => ({
          ...prev,
          [row.character_id]: { key: rp.skillKey!, name: rp.skillName ?? rp.skillKey! },
        }))
        // Same rule as the broadcast path: the player's pick is newer than any
        // standing GM override.
        setPcSkillOverride(prev => {
          if (!(row.character_id in prev)) return prev
          const next = { ...prev }
          delete next[row.character_id]
          return next
        })
      }
    }

    void supabase
      .from('pending_actions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('action_type', 'initiative')
      .eq('source_ref', sessionId)
      .then(({ data }) => { for (const r of (data ?? []) as PendingAction[]) ingest(r) })

    const ch = supabase
      .channel(`init-pending-${campaignId}-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public',
        table: 'pending_actions',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        const row = payload.new as PendingAction | undefined
        if (row) ingest(row)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Load the skill catalog + every PC's ranks (all skills, not just Cool/Vigilance) ──
  useEffect(() => {
    void supabase
      .from('ref_skills')
      .select('key, name, characteristic_key, type')
      .then(({ data }) => {
        if (!data) return
        setRefSkills((data as { key: string; name: string; characteristic_key: string; type: string }[])
          .map(r => ({
            key: r.key, name: r.name, type: r.type,
            charKey: CHARACTERISTIC_ABBR[r.characteristic_key] ?? 'willpower',
          }))
          .sort((a, b) => a.name.localeCompare(b.name)))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (characters.length === 0) return
    void supabase
      .from('character_skills')
      .select('character_id, skill_key, rank')
      .in('character_id', characters.map(c => c.id))
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, Record<string, number>> = {}
        for (const r of data as { character_id: string; skill_key: string; rank: number }[]) {
          if (!map[r.character_id]) map[r.character_id] = {}
          map[r.character_id][r.skill_key] = r.rank
        }
        setPcSkillRanks(map)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters])

  // ── Token lookup: instance id → live map token ──────────────────────────────
  // Tokens carry no instance id of their own (`participant_id` is always null);
  // the deck's persisted slot rows are the only bridge — token.slot_key === slot.id
  // and the slot holds adversaryInstanceId/vehicleInstanceId. Label matching is a
  // fallback for tokens whose slot row has since been regenerated.
  const tokenFor = useMemo(() => {
    const slotToInstance = new Map<string, string>()
    for (const s of encounterSlots ?? []) {
      const iid = s.adversaryInstanceId ?? s.vehicleInstanceId
      if (iid) slotToInstance.set(s.id, iid)
    }
    const byInstance = new Map<string, MapToken>()
    const byLabel    = new Map<string, MapToken>()
    for (const t of tokens ?? []) {
      if (t.participant_type === 'pc') continue
      if (t.label) byLabel.set(t.label, t)
      const iid = t.slot_key ? slotToInstance.get(t.slot_key) : undefined
      if (iid) byInstance.set(iid, t)
    }
    return (instanceId: string, name: string): MapToken | undefined =>
      byInstance.get(instanceId) ?? byLabel.get(name)
  }, [tokens, encounterSlots])

  /**
   * Effective disposition. GM override wins, then the instance's own
   * add-time alignment, then the live token, then the deck's slot row.
   */
  const npcAlignments = useMemo(() => {
    const slotAlign = new Map<string, SlotAlignment>()
    for (const s of encounterSlots ?? []) {
      if (s.adversaryInstanceId && s.alignment) slotAlign.set(s.adversaryInstanceId, s.alignment)
    }
    const out: Record<string, 'enemy' | 'allied_npc'> = {}
    for (const a of roster) {
      const tok = tokenFor(a.instanceId, a.name)
      const fromToken = tok?.alignment === 'allied_npc' ? 'allied_npc' as const : tok ? 'enemy' as const : undefined
      const fromSlot  = slotAlign.get(a.instanceId) === 'allied_npc' ? 'allied_npc' as const
                      : slotAlign.has(a.instanceId) ? 'enemy' as const : undefined
      out[a.instanceId] = npcAlignOverride[a.instanceId] ?? a.alignment ?? fromToken ?? fromSlot ?? 'enemy'
    }
    return out
  }, [roster, npcAlignOverride, tokenFor, encounterSlots])

  /**
   * On-map visibility. A hidden token and an off-map (token-less) entry are
   * merged into the same "not in this fight yet" bucket — both are absent from
   * the roll list and counted in a single summary note.
   */
  const npcVisible = useMemo(() => {
    const out: Record<string, boolean> = {}
    for (const a of roster) {
      const tok = tokenFor(a.instanceId, a.name)
      out[a.instanceId] = !!tok && tok.is_visible
    }
    return out
  }, [roster, tokenFor])

  const visibleRoster = useMemo(() => roster.filter(a => npcVisible[a.instanceId]), [roster, npcVisible])
  const hiddenCount   = roster.length - visibleRoster.length

  // ── Dice pool resolution ────────────────────────────────────────────────────
  const pcSkillKeyFor = useCallback((charId: string) =>
    pcSkillOverride[charId] ?? pcPlayerSkill[charId]?.key ?? defaultSkillKey,
  [pcSkillOverride, pcPlayerSkill, defaultSkillKey])

  const pcPoolFor = useCallback((c: Character) => {
    const key = pcSkillKeyFor(c.id)
    const def = skillByKey[key]
    const seeded = propSkillRanks?.[c.id]
    const rank = pcSkillRanks[c.id]?.[key]
      ?? (key === 'COOL' ? seeded?.cool : key === 'VIGIL' ? seeded?.vigilance : undefined)
      ?? 0
    const charKey = def?.charKey ?? (key === 'COOL' ? 'presence' : 'willpower')
    const charVal = (c[charKey as keyof Character] as number) ?? 0
    return { ...buildDicePool(charVal, rank), charVal, rank, charKey, name: def?.name ?? key }
  }, [pcSkillKeyFor, skillByKey, pcSkillRanks, propSkillRanks])

  const npcSkillKeyFor = useCallback((instanceId: string) =>
    npcSkillOverride[instanceId] ?? defaultSkillKey,
  [npcSkillOverride, defaultSkillKey])

  const npcPoolFor = useCallback((a: AdversaryInstance) => {
    const key = npcSkillKeyFor(a.instanceId)
    const def = skillByKey[key]
    const charKey = def?.charKey ?? (key === 'COOL' ? 'presence' : 'willpower')
    const charVal = (a.characteristics[charKey as keyof AdversaryInstance['characteristics']] as number) ?? 0
    // Adversary skillRanks are keyed by display name, not by ref_skills key.
    const rank = ((a.skillRanks ?? {}) as Record<string, number>)[def?.name ?? ''] ?? 0
    return { ...buildDicePool(charVal, rank), charVal, rank, charKey, name: def?.name ?? key }
  }, [npcSkillKeyFor, skillByKey])

  // ── Request player rolls via already-subscribed GM channels ──
  // Two deliveries, one request: the broadcast is the fast path (instant for a
  // connected player), the pending_actions row is the durable one that survives
  // a suspended socket or a reload. Both fire; neither replaces the other.
  const requestRollFor = useCallback((charId: string) => {
    const skillKey = pcSkillKeyFor(charId)

    sendToChar?.(charId, {
      type: 'initiative-request',
      initiativeType: initType,
      skillKey,
    })

    if (!campaignId) return
    // Duplicate requests (Request Rolls, then a per-card re-ping) collapse onto
    // the existing row via the partial unique index — createPendingAction
    // absorbs the 23505 and reports duplicate:true rather than erroring.
    void createPendingAction({
      campaignId,
      characterId: charId,
      actionType:  'initiative',
      isBlocking:  true,
      sourceRef:   setupSessionIdRef.current,
      payload:     { initiativeType: initType, skillKey },
    }).then(res => {
      if (res.action) {
        setPcQueueStatus(prev => ({ ...prev, [charId]: res.action!.status }))
      }
    })
  }, [sendToChar, initType, pcSkillKeyFor, campaignId])

  const handleRequestRolls = () => {
    setRequesting(true)
    if (sendToChar) {
      for (const c of characters) requestRollFor(c.id)
    }
    setTimeout(() => setRequesting(false), 800)
  }

  /**
   * Invalidates every outstanding request from this setup session — the GM
   * abandoning setup, or locking the order past a player who never submitted.
   * Neither path notified the player before; an orphaned roll modal sat open
   * broadcasting into a channel whose only subscriber had unmounted.
   */
  const cancelOutstandingRequests = useCallback(() => {
    for (const c of characters) sendToChar?.(c.id, { type: 'initiative-cancel' })
    if (campaignId) {
      void cancelPendingActionsByType(campaignId, 'initiative', setupSessionIdRef.current)
    }
  }, [characters, sendToChar, campaignId])

  const handleClose = useCallback(() => {
    cancelOutstandingRequests()
    onClose()
  }, [cancelOutstandingRequests, onClose])

  // ── Roll adversary initiative ──
  const rollAdvInitiative = useCallback((a: AdversaryInstance) => {
    const { proficiency, ability } = npcPoolFor(a)
    const result = rollPool({ proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 })
    const suc = Math.max(0, result.net.success)
    const adv = result.net.advantage
    setNpcResults(prev => ({ ...prev, [a.instanceId]: { successes: suc, advantages: adv } }))
  }, [npcPoolFor])

  const rollAllVisible = () => {
    for (const a of visibleRoster) {
      if (excludedNpc[a.instanceId]) continue
      rollAdvInitiative(a)
    }
  }

  const updatePc = (id: string, field: 'successes' | 'advantages', value: number) => {
    setPcResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
    setPcLive(prev => (prev[id] ? { ...prev, [id]: false } : prev))
  }
  const updateNpc = (id: string, field: 'successes' | 'advantages', value: number) => {
    setNpcResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
  }
  const updateVehicle = (id: string, field: 'successes' | 'advantages', value: number) => {
    setVehicleResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
  }
  const toggleVehicleOwnSlot = (id: string) => {
    setVehicleOwnSlot(prev => ({ ...prev, [id]: !prev[id] }))
  }

  /**
   * Has this PC rolled yet?
   *
   * The queue row is authoritative: a row still `pending` means no submission,
   * `resolved` means one arrived. This is what lets a genuine 0 successes /
   * 0 advantages roll read as ROLLED — the old `successes === 0 && advantages === 0`
   * test could not tell a real zero from an unanswered request.
   *
   * Fallback to that heuristic when no row exists for this character in this
   * setup session: a request that predates the queue, or one the GM never sent.
   */
  const pcIsPending = useCallback((charId: string, r: { successes: number; advantages: number }) => {
    const status = pcQueueStatus[charId]
    if (status === 'resolved') return false
    if (status === 'pending')  return true
    return r.successes === 0 && r.advantages === 0
  }, [pcQueueStatus])

  // Build the roll-driven order and sort them — unchanged mechanics (sortInitiative,
  // pending flags). This is now the seed for the board (see below), not the direct
  // source of finalSlots. Hidden and excluded adversaries never enter it.
  const allSlots = useMemo((): Array<InitiativeSlot & { pending?: boolean }> => {
    const pcSlots: Array<InitiativeSlot & { pending?: boolean }> = characters.map((c, i) => {
      const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
      return {
        id: `pc-${c.id}`,
        type: 'pc' as const,
        alignment: 'player' as const,
        order: i,
        characterId: c.id,
        name: c.name,
        acted: false,
        current: false,
        successes: r.successes,
        advantages: r.advantages,
        pending: pcIsPending(c.id, r),
      }
    })
    const npcSlots: Array<InitiativeSlot & { pending?: boolean }> = visibleRoster
      .filter(a => !excludedNpc[a.instanceId])
      .map((a, i) => {
        const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
        return {
          id: `npc-${a.instanceId}`,
          type: 'npc' as const,
          alignment: (npcAlignments[a.instanceId] ?? 'enemy') as 'enemy' | 'allied_npc',
          order: i,
          adversaryInstanceId: a.instanceId,
          name: a.name,
          acted: false,
          current: false,
          successes: r.successes,
          advantages: r.advantages,
          pending: r.successes === 0 && r.advantages === 0,
        }
      })
    const vehicleSlots: Array<InitiativeSlot & { pending?: boolean }> = vehicleRoster
      .filter(v => vehicleOwnSlot[v.instanceId])
      .map((v, i) => {
        const r = vehicleResults[v.instanceId] ?? { successes: 0, advantages: 0 }
        return {
          id: `veh-${v.instanceId}`,
          type: 'npc' as const,
          alignment: v.alignment,
          order: i,
          vehicleInstanceId: v.instanceId,
          name: v.name,
          acted: false,
          current: false,
          successes: r.successes,
          advantages: r.advantages,
          pending: r.successes === 0 && r.advantages === 0,
        }
      })
    return sortInitiative([...pcSlots, ...npcSlots, ...vehicleSlots])
  }, [characters, visibleRoster, excludedNpc, vehicleRoster, pcResults, npcResults, npcAlignments, vehicleResults, vehicleOwnSlot, pcIsPending])

  // ── Order rail state ────────────────────────────────────────────────────────
  // Live GM-arranged order. Reserve is transient/local — resets fully on remount
  // (this component is unmounted/remounted every time "Begin Combat" is opened
  // fresh, since GmShell only renders it while initiativeSetupOpen is true).
  const [board, setBoard]     = useState<BoardItem[]>([])
  const [reserve, setReserve] = useState<BoardItem[]>([])
  const [reserveOpen, setReserveOpen] = useState(false)
  // Once the GM drags/duplicates/benches/restores anything, the board stops
  // auto-following allSlots and becomes GM-authoritative.
  const [boardTouched, setBoardTouched] = useState(false)

  // Auto-sync board from the roll-driven order until the GM manually touches it.
  useEffect(() => {
    if (boardTouched) return
    setBoard(allSlots.map(s => ({
      boardId:  s.id,
      kind:     s.type === 'pc' ? 'pc' as const : s.vehicleInstanceId ? 'vehicle' as const : 'npc' as const,
      sourceId: s.characterId ?? s.adversaryInstanceId ?? s.vehicleInstanceId ?? '',
      ordinal:  1,
    })))
    setReserve([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSlots, boardTouched])

  // Once touched, keep any newly-appearing source (e.g. GM reveals a token
  // mid-setup) added to the board — idempotent, never disturbs manual
  // order/duplicates/bench.
  useEffect(() => {
    if (!boardTouched) return
    const present = new Set([...board, ...reserve].map(it => `${it.kind}:${it.sourceId}`))
    const toAdd: BoardItem[] = []
    for (const c of characters) {
      const k = `pc:${c.id}`
      if (!present.has(k)) { toAdd.push({ boardId: randomUUID(), kind: 'pc', sourceId: c.id, ordinal: 1 }); present.add(k) }
    }
    for (const a of visibleRoster) {
      if (excludedNpc[a.instanceId]) continue
      const k = `npc:${a.instanceId}`
      if (!present.has(k)) { toAdd.push({ boardId: randomUUID(), kind: 'npc', sourceId: a.instanceId, ordinal: 1 }); present.add(k) }
    }
    for (const v of vehicleRoster) {
      if (!vehicleOwnSlot[v.instanceId]) continue
      const k = `vehicle:${v.instanceId}`
      if (!present.has(k)) { toAdd.push({ boardId: randomUUID(), kind: 'vehicle', sourceId: v.instanceId, ordinal: 1 }); present.add(k) }
    }
    if (toAdd.length) setBoard(prev => [...prev, ...toAdd])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardTouched, characters, visibleRoster, excludedNpc, vehicleRoster, vehicleOwnSlot])

  // A vehicle toggled OFF, or an adversary excluded/hidden, must not appear in
  // initiative at all — drop it from both board and reserve immediately,
  // regardless of touched state.
  useEffect(() => {
    const dropNpc = (it: BoardItem) =>
      it.kind === 'npc' && (excludedNpc[it.sourceId] || !npcVisible[it.sourceId])
    const dropVeh = (it: BoardItem) => it.kind === 'vehicle' && !vehicleOwnSlot[it.sourceId]
    setBoard(prev => prev.filter(it => !dropNpc(it) && !dropVeh(it)))
    setReserve(prev => prev.filter(it => !dropNpc(it) && !dropVeh(it)))
  }, [vehicleOwnSlot, excludedNpc, npcVisible])

  // Resolve a board/reserve item to its live display + roll data. The rail never
  // re-owns roll values — it only reorders/excludes/duplicates references into
  // pcResults/npcResults/vehicleResults.
  const resolveBoardItem = useCallback((item: BoardItem): ResolvedBoardItem | null => {
    if (item.kind === 'pc') {
      const c = characters.find(ch => ch.id === item.sourceId)
      if (!c) return null
      const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
      const pool = pcPoolFor(c)
      return {
        role: 'pc', slotType: 'pc', alignment: 'player',
        name: c.name,
        meta: `${pool.name} · ${pool.charVal}${pool.rank > 0 ? ` · Rank ${pool.rank}` : ''}`,
        successes: r.successes, advantages: r.advantages,
        pending: pcIsPending(c.id, r),
        characterId: c.id,
      }
    }
    if (item.kind === 'npc') {
      const a = roster.find(ad => ad.instanceId === item.sourceId)
      if (!a) return null
      const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
      const alignment = (npcAlignments[a.instanceId] ?? 'enemy') as 'enemy' | 'allied_npc'
      return {
        role: alignment === 'allied_npc' ? 'friendly' : 'enemy',
        slotType: 'npc', alignment,
        name: a.name,
        meta: `${a.type.toUpperCase()}${a.type === 'minion' ? ` ×${a.groupSize}` : ''} · ${npcPoolFor(a).name}`,
        successes: r.successes, advantages: r.advantages,
        pending: r.successes === 0 && r.advantages === 0,
        adversaryInstanceId: a.instanceId,
      }
    }
    const v = vehicleRoster.find(ve => ve.instanceId === item.sourceId)
    if (!v) return null
    const r = vehicleResults[v.instanceId] ?? { successes: 0, advantages: 0 }
    return {
      role: 'vehicle', slotType: 'npc', alignment: v.alignment,
      name: v.name,
      meta: `Sil ${v.silhouette} · Hdl ${v.handling >= 0 ? `+${v.handling}` : v.handling}`,
      successes: r.successes, advantages: r.advantages,
      pending: r.successes === 0 && r.advantages === 0,
      vehicleInstanceId: v.instanceId,
    }
  }, [characters, roster, vehicleRoster, pcResults, npcResults, vehicleResults, npcAlignments, pcPoolFor, npcPoolFor, pcIsPending])

  function handleDuplicate(boardId: string) {
    const src = board.find(it => it.boardId === boardId)
    if (!src) return
    const maxOrdinal = Math.max(
      1,
      ...board.filter(it => it.kind === src.kind && it.sourceId === src.sourceId).map(it => it.ordinal),
      ...reserve.filter(it => it.kind === src.kind && it.sourceId === src.sourceId).map(it => it.ordinal),
    )
    const dup: BoardItem = { boardId: randomUUID(), kind: src.kind, sourceId: src.sourceId, ordinal: maxOrdinal + 1 }
    setBoardTouched(true)
    setBoard(prev => {
      const idx = prev.findIndex(it => it.boardId === boardId)
      if (idx === -1) return prev
      const next = [...prev]
      next.splice(idx + 1, 0, dup)
      return next
    })
  }

  function handleBench(boardId: string) {
    const item = board.find(it => it.boardId === boardId)
    if (!item) return
    setBoardTouched(true)
    setBoard(prev => prev.filter(it => it.boardId !== boardId))
    setReserve(prev => [...prev, item])
  }

  function handleRestore(boardId: string) {
    const item = reserve.find(it => it.boardId === boardId)
    if (!item) return
    setBoardTouched(true)
    setReserve(prev => prev.filter(it => it.boardId !== boardId))
    setBoard(prev => [...prev, item])
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleBoardDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBoardTouched(true)
    setBoard(prev => {
      const oldIndex = prev.findIndex(it => it.boardId === active.id)
      const newIndex = prev.findIndex(it => it.boardId === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleReserveDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setReserve(prev => {
      const oldIndex = prev.findIndex(it => it.boardId === active.id)
      const newIndex = prev.findIndex(it => it.boardId === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const handleStart = async () => {
    setIsStarting(true)
    const finalSlots: InitiativeSlot[] = board
      .map((item, i): InitiativeSlot | null => {
        const resolved = resolveBoardItem(item)
        if (!resolved) return null
        return {
          id: item.boardId,
          type: resolved.slotType,
          alignment: resolved.alignment,
          order: i,
          characterId: resolved.characterId,
          adversaryInstanceId: resolved.adversaryInstanceId,
          vehicleInstanceId: resolved.vehicleInstanceId,
          name: resolved.name,
          acted: false,
          current: i === 0,
          successes: resolved.successes,
          advantages: resolved.advantages,
        }
      })
      .filter((s): s is InitiativeSlot => s !== null)

    const encounter: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'> = {
      campaign_id: campaignId,
      // The map binding is owned by the deck row itself (migration 115) —
      // handleStagingCombatStart overwrites this with the active map id.
      map_id: null,
      round: 1,
      is_active: true,
      current_slot_index: 0,
      initiative_type: initType,
      initiative_slots: finalSlots,
      adversaries: roster,
      vehicles: vehicleRoster,
      log_entries: [{
        id: randomUUID(),
        round: 1, slot: 1,
        actor: 'System',
        text: `Combat started — Round 1 · ${initType === 'cool' ? 'Cool' : 'Vigilance'} initiative`,
        dmOnly: false,
        timestamp: new Date().toISOString(),
      }],
    }
    // Anyone who has not submitted by lock can no longer be received — the
    // result channel's only subscriber is this modal, which is about to go away.
    cancelOutstandingRequests()

    await onStart(encounter)
    setIsStarting(false)
  }

  const colStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', minWidth: 0,
    overflowY: 'auto', padding: `0 ${SP[3]} ${SP[3]}`,
  }

  return (
    // GmTopBar and GmLeftRail sit on --z-hud-combat (9001), well above the
    // default modal layer — a full-screen panel has to clear the GM chrome or
    // the rail overlaps column 1 and the deck/FAB cover Lock Order & Start.
    <Modal open onClose={handleClose} fullScreen zIndex={Z.hudSupreme}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* ── Header bar ── */}
        <div style={{
          padding: `${SP[2]} ${SP[4]}`, borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', gap: SP[4], flexShrink: 0,
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontFamily: FD, fontSize: FS.overline, letterSpacing: '0.25em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)` }}>
              Initiative Setup
            </div>
            <div style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, color: HUD.gold }}>
              BEGIN COMBAT
            </div>
          </div>

          {/* Default skill — segmented control */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.md, overflow: 'hidden', flexShrink: 0 }}>
            {([
              { key: 'cool' as const,       title: 'COOL',       sub: 'Presence + Cool · prepared',        accent: 'var(--state-advantage)' },
              { key: 'vigilance' as const,  title: 'VIGILANCE',  sub: 'Willpower + Vigilance · ambushed',  accent: HUD.gold },
            ]).map((opt, i) => (
              <button
                key={opt.key}
                className="iset-seg-btn"
                data-active={initType === opt.key}
                onClick={() => setInitType(opt.key)}
                style={{
                  ['--seg-accent' as string]: opt.accent,
                  padding: `${SP[1]} ${SP[3]}`, textAlign: 'left', cursor: 'pointer',
                  border: 'none', borderRight: i === 0 ? `1px solid ${BORDER_HI}` : 'none',
                }}
              >
                <div style={{ fontFamily: FD, fontSize: FS.sm, fontWeight: 700, color: initType === opt.key ? opt.accent : TEXT_DIM }}>
                  {opt.title}
                </div>
                <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, flex: 1, minWidth: 0 }}>
            Default skill for every row — override per row below.
          </div>

          <button onClick={handleClose} style={{
            background: 'transparent', border: `1px solid ${BORDER_HI}`,
            borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`, cursor: 'pointer',
            fontFamily: FB, fontSize: FS.body, color: TEXT, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* ── Three columns ── */}
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(320px, 26rem)',
        }}>

          {/* ── Column 1 — Players ── */}
          <div style={{ ...colStyle, borderRight: `1px solid ${BORDER}` }}>
            <ColumnHeading action={
              <button
                onClick={handleRequestRolls}
                disabled={requesting || !sendToChar || !sweepDone}
                title={!sendToChar ? 'Open CombatPanel from GM dashboard to enable player requests' : 'Request a roll from every player'}
                className="iset-ghost-btn"
                style={{
                  borderRadius: RADIUS.md, padding: `1px ${SP[2]}`,
                  cursor: requesting || !sendToChar || !sweepDone ? 'default' : 'pointer',
                  fontFamily: FB, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.1em', color: HUD.gold, textTransform: 'uppercase',
                  opacity: requesting || !sendToChar || !sweepDone ? 0.5 : 1, transition: `opacity ${EASE.quick}`,
                }}
              >
                {requesting ? 'Sending…' : '📡 Request Rolls'}
              </button>
            }>
              Players · {characters.length}
            </ColumnHeading>

            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {characters.map(c => {
                const pool = pcPoolFor(c)
                const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
                const live = pcLive[c.id] ?? false
                const rolled = !pcIsPending(c.id, r)
                const skillKey = pcSkillKeyFor(c.id)
                const playerPicked = pcPlayerSkill[c.id]?.key
                const differsFromDefault = skillKey !== defaultSkillKey
                return (
                  <div key={c.id} className="iset-row" style={{
                    display: 'flex', flexDirection: 'column', gap: SP[1],
                    padding: `${SP[1]} ${SP[2]}`,
                    background: 'var(--hud-surface-lo)',
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${ROLE_STYLE.pc.color}`,
                    clipPath: PLATE_CLIP,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                      <RoleTag role="pc" />
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{c.name}</span>
                      <span style={{
                        fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', flexShrink: 0,
                        color: rolled ? 'var(--state-success)' : 'var(--state-triumph)',
                      }}>
                        {rolled ? '✓ Rolled' : '⏳ Pending'}
                      </span>
                      <button
                        onClick={() => requestRollFor(c.id)}
                        disabled={!sendToChar || !sweepDone}
                        className="iset-action-btn"
                        title={`Re-request a roll from ${c.name} only`}
                        style={{
                          ['--act-accent' as string]: HUD.gold,
                          width: 22, height: 22, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
                          cursor: sendToChar && sweepDone ? 'pointer' : 'default', fontSize: FS.caption, color: TEXT_DIM,
                          lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, opacity: sendToChar && sweepDone ? 1 : 0.4,
                        }}
                      >↻</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: SP[2], flexWrap: 'wrap' }}>
                      <SkillSelect
                        value={skillKey}
                        skills={nonCombatSkills}
                        overridden={differsFromDefault}
                        onChange={k => setPcSkillOverride(prev => ({ ...prev, [c.id]: k }))}
                      />
                      <DicePoolPips proficiency={pool.proficiency} ability={pool.ability} />
                      <span style={{ flex: 1, minWidth: 0 }} />
                      <NumInput label="Succ" value={r.successes}  live={live} onChange={v => updatePc(c.id, 'successes', v)} />
                      <NumInput label="Adv"  value={r.advantages} live={live} onChange={v => updatePc(c.id, 'advantages', v)} />
                    </div>

                    {playerPicked && playerPicked === skillKey && playerPicked !== defaultSkillKey && (
                      <div style={{ fontFamily: FB, fontSize: FS.overline, color: 'var(--state-advantage)' }}>
                        ⇄ Player rolled with {pcPlayerSkill[c.id]?.name} instead of the default
                      </div>
                    )}
                  </div>
                )
              })}
              {characters.length === 0 && <EmptyNote>No active player characters.</EmptyNote>}
            </div>
          </div>

          {/* ── Column 2 — Adversaries + Vehicles ── */}
          <div style={{ ...colStyle, borderRight: `1px solid ${BORDER}` }}>
            <ColumnHeading action={
              visibleRoster.length > 0 ? (
                <button
                  onClick={rollAllVisible}
                  className="iset-ghost-btn"
                  style={{
                    borderRadius: RADIUS.md, padding: `1px ${SP[2]}`, cursor: 'pointer',
                    fontFamily: FB, fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.1em', color: HUD.gold, textTransform: 'uppercase',
                  }}
                >🎲 Roll All Visible</button>
              ) : undefined
            }>
              Adversaries · {visibleRoster.length}
            </ColumnHeading>

            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {visibleRoster.map(a => {
                const pool = npcPoolFor(a)
                const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
                const isAlly = (npcAlignments[a.instanceId] ?? 'enemy') === 'allied_npc'
                const role: PlateRole = isAlly ? 'friendly' : 'enemy'
                const excluded = excludedNpc[a.instanceId] ?? false
                const skillKey = npcSkillKeyFor(a.instanceId)
                return (
                  <div key={a.instanceId} className="iset-row" style={{
                    display: 'flex', flexDirection: 'column', gap: SP[1],
                    padding: `${SP[1]} ${SP[2]}`,
                    background: 'var(--hud-surface-lo)',
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${ROLE_STYLE[role].color}`,
                    clipPath: PLATE_CLIP,
                    opacity: excluded ? 0.42 : 1,
                    filter: excluded ? 'grayscale(0.7)' : 'none',
                    transition: `opacity ${EASE.quick}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                      <button
                        onClick={() => setNpcAlignOverride(prev => ({ ...prev, [a.instanceId]: isAlly ? 'enemy' : 'allied_npc' }))}
                        title="Toggle disposition"
                        className="iset-bare-btn"
                        style={{ flexShrink: 0, cursor: 'pointer' }}
                      >
                        <RoleTag role={role} />
                      </button>
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{a.name}</span>
                      <span style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, flexShrink: 0 }}>
                        {a.type.toUpperCase()}{a.type === 'minion' ? ` ×${a.groupSize}` : ''}
                      </span>
                      <button
                        onClick={() => setExcludedNpc(prev => ({ ...prev, [a.instanceId]: !excluded }))}
                        className="iset-action-btn"
                        title={excluded ? 'Restore to the encounter' : 'Exclude — no initiative slot'}
                        style={{
                          ['--act-accent' as string]: excluded ? 'var(--state-success)' : 'var(--state-failure)',
                          width: 22, height: 22, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
                          cursor: 'pointer', fontSize: FS.caption, color: TEXT_DIM, lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >{excluded ? '↥' : '✕'}</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: SP[2], flexWrap: 'wrap' }}>
                      <SkillSelect
                        value={skillKey}
                        skills={nonCombatSkills}
                        overridden={skillKey !== defaultSkillKey}
                        onChange={k => setNpcSkillOverride(prev => ({ ...prev, [a.instanceId]: k }))}
                      />
                      <DicePoolPips proficiency={pool.proficiency} ability={pool.ability} />
                      <button
                        onClick={() => rollAdvInitiative(a)}
                        disabled={excluded}
                        className="iset-ghost-btn"
                        style={{
                          borderRadius: RADIUS.sm, padding: `1px ${SP[2]}`,
                          cursor: excluded ? 'default' : 'pointer',
                          fontFamily: FB, fontSize: FS.overline, color: HUD.gold,
                          letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}
                      >🎲 Roll</button>
                      <span style={{ flex: 1, minWidth: 0 }} />
                      <NumInput label="Succ" value={r.successes}  onChange={v => updateNpc(a.instanceId, 'successes', v)} />
                      <NumInput label="Adv"  value={r.advantages} onChange={v => updateNpc(a.instanceId, 'advantages', v)} />
                    </div>
                  </div>
                )
              })}

              {hiddenCount > 0 && (
                <div style={{
                  padding: `${SP[1]} ${SP[2]}`,
                  border: `1px dashed ${BORDER_HI}`, borderRadius: RADIUS.md,
                  fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED,
                }}>
                  ◌ {hiddenCount} hidden {hiddenCount === 1 ? 'token' : 'tokens'} — reveal on map to include
                </div>
              )}
              {roster.length === 0 && <EmptyNote>No adversaries on this map.</EmptyNote>}
            </div>

            {vehicleRoster.length > 0 && (
              <>
                <div style={{ height: SP[3] }} />
                <ColumnHeading>Vehicles · {vehicleRoster.length} · hand-entered</ColumnHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                  {vehicleRoster.map(v => {
                    const r = vehicleResults[v.instanceId] ?? { successes: 0, advantages: 0 }
                    const hasOwnSlot = vehicleOwnSlot[v.instanceId] ?? false
                    return (
                      <div key={v.instanceId} className="iset-row" style={{
                        display: 'flex', alignItems: 'flex-end', gap: SP[2], flexWrap: 'wrap',
                        padding: `${SP[1]} ${SP[2]}`,
                        background: 'var(--hud-surface-lo)',
                        border: `1px solid ${BORDER}`,
                        borderLeft: `3px solid ${ROLE_STYLE.vehicle.color}`,
                        clipPath: PLATE_CLIP,
                      }}>
                        <RoleTag role="vehicle" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                          <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>
                            Sil {v.silhouette} · Hdl {v.handling >= 0 ? `+${v.handling}` : v.handling}
                          </div>
                        </div>
                        <NumInput label="Succ" value={r.successes}  onChange={val => updateVehicle(v.instanceId, 'successes', val)} />
                        <NumInput label="Adv"  value={r.advantages} onChange={val => updateVehicle(v.instanceId, 'advantages', val)} />
                        <button
                          onClick={() => toggleVehicleOwnSlot(v.instanceId)}
                          style={{
                            background: hasOwnSlot ? 'color-mix(in srgb, var(--state-success) 15%, transparent)' : 'transparent',
                            border: `1px solid ${hasOwnSlot ? 'color-mix(in srgb, var(--state-success) 50%, transparent)' : BORDER_HI}`,
                            borderRadius: RADIUS.sm, padding: `1px ${SP[2]}`, cursor: 'pointer',
                            fontFamily: FB, fontSize: FS.overline, fontWeight: 700,
                            color: hasOwnSlot ? 'var(--state-success)' : TEXT_MUTED,
                            whiteSpace: 'nowrap' as const, flexShrink: 0,
                          }}
                        >
                          {hasOwnSlot ? '☑ Own Slot' : '☐ Own Slot'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Column 3 — Compact order rail ── */}
          <div style={{ ...colStyle, background: 'var(--hud-surface-mid)' }}>
            <ColumnHeading>Initiative Order · {board.length}</ColumnHeading>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBoardDragEnd}>
              <SortableContext items={board.map(it => it.boardId)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {board.map((item, i) => {
                    const resolved = resolveBoardItem(item)
                    if (!resolved) return null
                    return (
                      <RailSlot
                        key={item.boardId}
                        item={item}
                        resolved={resolved}
                        index={i}
                        isFirst={i === 0}
                        onDuplicate={() => handleDuplicate(item.boardId)}
                        onBench={() => handleBench(item.boardId)}
                      />
                    )
                  })}
                  {board.length === 0 && <EmptyNote>No participants in the order yet.</EmptyNote>}
                </div>
              </SortableContext>
            </DndContext>

            {/* Reserve — single collapsed row */}
            <div style={{ marginTop: SP[2], border: `1px solid ${BORDER}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
              <button
                className="iset-reserve-header"
                onClick={() => setReserveOpen(o => !o)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: SP[2],
                  padding: `2px ${SP[2]}`, background: 'var(--hud-surface-lo)', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: FB, fontSize: FS.overline, color: reserveOpen ? TEXT_DIM : TEXT_MUTED, transform: reserveOpen ? 'rotate(90deg)' : 'none', transition: `transform ${EASE.quick}`, display: 'inline-block' }}>▶</span>
                <span style={{ fontFamily: FD, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEXT_DIM, flex: 1, textAlign: 'left' }}>
                  Reserve
                </span>
                <span style={{
                  fontFamily: FB, fontSize: FS.overline, fontWeight: 700, color: TEXT_MUTED,
                  border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm, padding: '0 5px',
                }}>
                  {reserve.length}
                </span>
              </button>
              {reserveOpen && reserve.length > 0 && (
                <div style={{ padding: 2 }}>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReserveDragEnd}>
                    <SortableContext items={reserve.map(it => it.boardId)} strategy={verticalListSortingStrategy}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {reserve.map(item => {
                          const resolved = resolveBoardItem(item)
                          if (!resolved) return null
                          return (
                            <ReserveSlot
                              key={item.boardId}
                              item={item}
                              resolved={resolved}
                              onRestore={() => handleRestore(item.boardId)}
                            />
                          )
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              {reserveOpen && reserve.length === 0 && (
                <div style={{ padding: `${SP[1]} ${SP[2]}`, fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>
                  Nothing benched.
                </div>
              )}
            </div>

            <div style={{ flex: 1, minHeight: SP[2] }} />

            <button
              onClick={() => void handleStart()}
              disabled={isStarting || board.length === 0}
              style={{
                position: 'sticky', bottom: 0,
                width: '100%', padding: `${SP[2]} 0`, marginTop: SP[2],
                background: `color-mix(in srgb, ${HUD.gold} 12%, var(--hud-surface-lo))`,
                border: `1px solid ${BORDER_HI}`,
                borderRadius: RADIUS.md, cursor: isStarting ? 'default' : 'pointer',
                fontFamily: FD, fontSize: FS.sm, fontWeight: 700,
                letterSpacing: '0.15em', color: HUD.gold, textTransform: 'uppercase',
                opacity: isStarting || board.length === 0 ? 0.6 : 1, transition: `opacity ${EASE.quick}`,
              }}
            >
              {isStarting ? 'Starting…' : 'Lock Order & Start →'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: SP[3], textAlign: 'center', fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED,
      border: `1px dashed ${BORDER_HI}`, borderRadius: RADIUS.md,
    }}>
      {children}
    </div>
  )
}

// ── RailSlot — dense single-line sortable order entry ──────────────────────────
function RailSlot({
  item, resolved, index, isFirst, onDuplicate, onBench,
}: {
  item: BoardItem
  resolved: ResolvedBoardItem
  index: number
  isFirst: boolean
  onDuplicate: () => void
  onBench: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.boardId })
  const accent = isFirst ? HUD.gold : ROLE_STYLE[resolved.role].color

  return (
    <div
      ref={setNodeRef}
      className="iset-plate"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: SP[1],
        padding: `2px ${SP[1]}`,
        background: isFirst ? `color-mix(in srgb, ${HUD.gold} 10%, var(--hud-surface-lo))` : 'var(--hud-surface-lo)',
        border: `1px solid ${isFirst ? `color-mix(in srgb, ${HUD.gold} 55%, transparent)` : BORDER}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: RADIUS.sm,
      }}
    >
      <span
        className="iset-drag-handle"
        {...attributes}
        {...listeners}
        style={{ fontSize: FS.caption, lineHeight: 1, flexShrink: 0, touchAction: 'none' }}
        aria-label="Drag to reorder"
      >⣿</span>

      <span style={{
        fontFamily: FD, fontSize: FS.caption, fontWeight: 900,
        color: isFirst ? HUD.gold : TEXT_MUTED,
        minWidth: 16, textAlign: 'right', flexShrink: 0,
      }}>
        {index + 1}
      </span>

      {/* Role colour dot */}
      <span style={{
        width: 7, height: 7, borderRadius: RADIUS.full, flexShrink: 0,
        background: ROLE_STYLE[resolved.role].color,
      }} title={ROLE_STYLE[resolved.role].longLabel} />

      <span style={{
        flex: 1, minWidth: 0, fontFamily: FB, fontSize: FS.caption, fontWeight: isFirst ? 700 : 600,
        color: isFirst ? HUD.gold : TEXT,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {resolved.name}
      </span>

      {item.ordinal > 1 && (
        <span
          title={`${ordinalSuffix(item.ordinal)} action — no re-roll`}
          style={{
            fontFamily: FB, fontSize: FS.overline, fontWeight: 700, color: HUD.gold,
            border: `1px solid color-mix(in srgb, ${HUD.gold} 45%, transparent)`,
            borderRadius: RADIUS.sm, padding: '0 3px', flexShrink: 0, whiteSpace: 'nowrap' as const,
          }}
        >
          ×{item.ordinal}
        </span>
      )}

      <span style={{
        fontFamily: FB, fontSize: FS.overline,
        color: resolved.pending ? 'var(--state-triumph)' : TEXT_DIM,
        flexShrink: 0, whiteSpace: 'nowrap' as const, minWidth: 44, textAlign: 'right',
      }}>
        {resolved.pending ? '⏳' : `${resolved.successes}s·${resolved.advantages}a`}
      </span>

      <div className="iset-plate-actions" style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          className="iset-action-btn"
          onClick={onDuplicate}
          title="Duplicate — second action, no re-roll"
          style={{
            ['--act-accent' as string]: 'var(--hud-accent)',
            width: 18, height: 18, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            cursor: 'pointer', fontSize: FS.overline, color: TEXT_DIM, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >⧉</button>
        <button
          className="iset-action-btn"
          onClick={onBench}
          title="Bench — move to Reserve"
          style={{
            ['--act-accent' as string]: 'var(--state-failure)',
            width: 18, height: 18, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            cursor: 'pointer', fontSize: FS.overline, color: TEXT_DIM, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>
    </div>
  )
}

// ── ReserveSlot — benched entry inside the collapsed Reserve row ───────────────
function ReserveSlot({
  item, resolved, onRestore,
}: {
  item: BoardItem
  resolved: ResolvedBoardItem
  onRestore: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.boardId })

  return (
    <div
      ref={setNodeRef}
      className="iset-plate"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 0.7,
        display: 'flex', alignItems: 'center', gap: SP[1],
        padding: `2px ${SP[1]}`,
        background: 'var(--hud-surface-mid)',
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${ROLE_STYLE[resolved.role].color}`,
        borderRadius: RADIUS.sm,
      }}
    >
      <span
        className="iset-drag-handle"
        {...attributes}
        {...listeners}
        style={{ fontSize: FS.overline, lineHeight: 1, flexShrink: 0, touchAction: 'none' }}
        aria-label="Drag to reorder within Reserve"
      >⣿</span>

      <span style={{
        width: 7, height: 7, borderRadius: RADIUS.full, flexShrink: 0,
        background: ROLE_STYLE[resolved.role].color,
      }} />

      <span style={{
        flex: 1, minWidth: 0, fontFamily: FB, fontSize: FS.overline, fontWeight: 600, color: TEXT_DIM,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {resolved.name}
      </span>

      {item.ordinal > 1 && (
        <span style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, flexShrink: 0 }}>
          ×{item.ordinal}
        </span>
      )}

      <button
        className="iset-action-btn"
        onClick={onRestore}
        title="Restore to the order"
        style={{
          ['--act-accent' as string]: 'var(--state-success)',
          width: 18, height: 18, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
          cursor: 'pointer', fontSize: FS.overline, color: TEXT_DIM, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >↥</button>
    </div>
  )
}
