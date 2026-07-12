'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { sortInitiative } from '@/lib/combat'
import { rollPool } from '@/components/player-hud/dice-engine'
import { randomUUID } from '@/lib/utils'
import type { InitiativeSlot, CombatEncounter, SlotAlignment } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { Character } from '@/lib/types'
import { HUD, FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, EASE, DICE_COLOR } from '@/lib/tokens'

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

function DiePip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 18, height: 18, borderRadius: RADIUS.sm,
      border: `1px solid ${color}`,
      background: `color-mix(in srgb, ${color} 18%, transparent)`,
      fontFamily: FB, fontSize: FS.caption, fontWeight: 700, color, marginRight: 2, flexShrink: 0,
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

const numInputStyle: React.CSSProperties = {
  width: 48, background: 'var(--hud-surface-mid)', border: `1px solid ${BORDER_HI}`,
  borderRadius: RADIUS.sm, padding: '4px 6px', color: TEXT,
  fontFamily: FB, fontSize: FS.sm, textAlign: 'center', outline: 'none',
}

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number" min={0} max={20} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={numInputStyle}
    />
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FD, fontSize: FS.caption, letterSpacing: '0.25em', textTransform: 'uppercase' as const,
      color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)`, marginBottom: SP[2],
    }}>
      {children}
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
  /** Pre-fetched Cool/Vigilance skill ranks per character — skips the character_skills SELECT when provided */
  charSkillRanks?: Record<string, { cool: number; vigilance: number }>
}

export function InitiativeSetupModal({ campaignId, characters, roster, vehicleRoster, sendToChar, onClose, onStart, charSkillRanks: propSkillRanks }: Props) {
  const [initType, setInitType] = useState<'cool' | 'vigilance'>('vigilance')

  // PC roll results — updated via broadcast from players
  const [pcResults, setPcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(characters.map(c => [c.id, { successes: 0, advantages: 0 }]))
  )

  // NPC roll results — entered/rolled by GM
  const [npcResults, setNpcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(roster.map(a => [a.instanceId, { successes: 0, advantages: 0 }]))
  )

  // NPC alignment — seeded from the disposition the GM assigned at token-add time
  // (AdversaryInstance.alignment, threaded through by openStagingCombatModal); falls
  // back to 'enemy' only for instances that predate that field. GM can still toggle per adversary.
  const [npcAlignments, setNpcAlignments] = useState<Record<string, 'enemy' | 'allied_npc'>>(() =>
    Object.fromEntries(roster.map(a => [a.instanceId, a.alignment ?? 'enemy']))
  )

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

  // PC skill ranks — prefer prop, fall back to DB fetch
  const [fetchedSkillRanks, setFetchedSkillRanks] = useState<Record<string, { cool: number; vigilance: number }>>({})
  const charSkillRanks = propSkillRanks ?? fetchedSkillRanks

  const [isStarting, setIsStarting] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // ── Subscribe to player initiative results ──
  useEffect(() => {
    const ch = supabase
      .channel(`initiative-${campaignId}`)
      .on('broadcast', { event: 'initiative-result' }, ({ payload }: { payload: Record<string, unknown> }) => {
        const charId = payload.characterId as string
        const suc    = payload.successes  as number
        const adv    = payload.advantages as number
        if (charId) {
          setPcResults(prev => ({ ...prev, [charId]: { successes: suc ?? 0, advantages: adv ?? 0 } }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Load PC Cool/Vigilance skill ranks from DB (only when not provided as prop) ──
  useEffect(() => {
    if (propSkillRanks || characters.length === 0) return
    supabase
      .from('character_skills')
      .select('character_id, skill_key, rank')
      .in('character_id', characters.map(c => c.id))
      .in('skill_key', ['COOL', 'VIGIL'])
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, { cool: number; vigilance: number }> = {}
        for (const r of data as { character_id: string; skill_key: string; rank: number }[]) {
          if (!map[r.character_id]) map[r.character_id] = { cool: 0, vigilance: 0 }
          if (r.skill_key === 'COOL')  map[r.character_id].cool = r.rank
          if (r.skill_key === 'VIGIL') map[r.character_id].vigilance = r.rank
        }
        setFetchedSkillRanks(map)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters, propSkillRanks])

  // ── Request player rolls via already-subscribed GM channels ──
  const handleRequestRolls = () => {
    setRequesting(true)
    if (sendToChar) {
      for (const c of characters) {
        sendToChar(c.id, { type: 'initiative-request', initiativeType: initType })
      }
    }
    setTimeout(() => setRequesting(false), 800)
  }

  // ── Roll adversary initiative ──
  const rollAdvInitiative = (a: AdversaryInstance, skillType: 'cool' | 'vigilance') => {
    const skillName = skillType === 'cool' ? 'Cool' : 'Vigilance'
    const charVal   = skillType === 'cool' ? a.characteristics.presence : a.characteristics.willpower
    const ranks     = (a.skillRanks ?? {}) as Record<string, number>
    const skillRank = ranks[skillName] ?? 0
    const { proficiency, ability } = buildDicePool(charVal, skillRank)
    const result = rollPool({ proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 })
    const suc = Math.max(0, result.net.success)
    const adv = result.net.advantage
    setNpcResults(prev => ({ ...prev, [a.instanceId]: { successes: suc, advantages: adv } }))
  }

  const updatePc = (id: string, field: 'successes' | 'advantages', value: number) => {
    setPcResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
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

  // Build the roll-driven order and sort them — unchanged mechanics (sortInitiative,
  // pending flags). This is now the seed for the board (see below), not the direct
  // source of finalSlots.
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
        pending: r.successes === 0 && r.advantages === 0,
      }
    })
    const npcSlots: Array<InitiativeSlot & { pending?: boolean }> = roster.map((a, i) => {
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
  }, [characters, roster, vehicleRoster, pcResults, npcResults, npcAlignments, vehicleResults, vehicleOwnSlot])

  // ── Step 4 board state ──────────────────────────────────────────────────────
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

  // Once touched, keep any newly-appearing source (e.g. GM adds a token mid-setup)
  // added to the board — idempotent, never disturbs manual order/duplicates/bench.
  useEffect(() => {
    if (!boardTouched) return
    const present = new Set([...board, ...reserve].map(it => `${it.kind}:${it.sourceId}`))
    const toAdd: BoardItem[] = []
    for (const c of characters) {
      const k = `pc:${c.id}`
      if (!present.has(k)) { toAdd.push({ boardId: randomUUID(), kind: 'pc', sourceId: c.id, ordinal: 1 }); present.add(k) }
    }
    for (const a of roster) {
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
  }, [boardTouched, characters, roster, vehicleRoster, vehicleOwnSlot])

  // A vehicle toggled OFF must not appear in initiative at all — drop it from
  // both board and reserve immediately, regardless of touched state.
  useEffect(() => {
    setBoard(prev => prev.filter(it => it.kind !== 'vehicle' || vehicleOwnSlot[it.sourceId]))
    setReserve(prev => prev.filter(it => it.kind !== 'vehicle' || vehicleOwnSlot[it.sourceId]))
  }, [vehicleOwnSlot])

  // Resolve a board/reserve item to its live display + roll data. Board never
  // re-owns roll values — it only reorders/excludes/duplicates references into
  // pcResults/npcResults/vehicleResults.
  function resolveBoardItem(item: BoardItem): ResolvedBoardItem | null {
    if (item.kind === 'pc') {
      const c = characters.find(ch => ch.id === item.sourceId)
      if (!c) return null
      const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
      const charVal   = initType === 'cool' ? c.presence : c.willpower
      const skillData = charSkillRanks[c.id] ?? { cool: 0, vigilance: 0 }
      const skillRank = initType === 'cool' ? skillData.cool : skillData.vigilance
      return {
        role: 'pc', slotType: 'pc', alignment: 'player',
        name: c.name,
        meta: `${initType === 'cool' ? 'Cool · Presence' : 'Vigilance · Willpower'} ${charVal}${skillRank > 0 ? ` · Rank ${skillRank}` : ''}`,
        successes: r.successes, advantages: r.advantages,
        pending: r.successes === 0 && r.advantages === 0,
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
        meta: `${a.type.toUpperCase()}${a.type === 'minion' ? ` ×${a.groupSize}` : ''} · PR ${a.characteristics.presence} / WIL ${a.characteristics.willpower}`,
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
  }

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
    await onStart(encounter)
    setIsStarting(false)
  }

  const hasAnyRoster = characters.length > 0 || roster.length > 0 || vehicleRoster.length > 0

  return (
    <Modal open onClose={onClose} maxWidth={760}>
        {/* Header */}
        <div style={{ padding: `${SP[3]} ${SP[4]}`, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: FD, fontSize: FS.caption, letterSpacing: '0.25em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)`, marginBottom: 4 }}>
              Initiative Setup
            </div>
            <div style={{ fontFamily: FD, fontSize: FS.h3, fontWeight: 700, color: HUD.gold }}>
              BEGIN COMBAT
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${BORDER_HI}`,
            borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`, cursor: 'pointer',
            fontFamily: FB, fontSize: FS.body, color: TEXT,
          }}>✕</button>
        </div>

        <div style={{ padding: `${SP[3]} ${SP[4]}`, display: 'flex', flexDirection: 'column', gap: SP[5] }}>

          {/* Step 1: Skill Select — symmetric segmented control */}
          <div>
            <SectionHeading>Step 1 — Initiative Skill</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
              {([
                { key: 'cool' as const,       title: 'COOL',       desc: 'Prepared · Springing an ambush',  sub: 'Presence + Cool ranks',      accent: 'var(--state-advantage)' },
                { key: 'vigilance' as const,  title: 'VIGILANCE',  desc: 'Unexpected · Being ambushed',     sub: 'Willpower + Vigilance ranks', accent: HUD.gold },
              ]).map((opt, i) => (
                <button
                  key={opt.key}
                  className="iset-seg-btn"
                  data-active={initType === opt.key}
                  onClick={() => setInitType(opt.key)}
                  style={{
                    ['--seg-accent' as string]: opt.accent,
                    padding: `${SP[3]} ${SP[3]}`, textAlign: 'left', cursor: 'pointer',
                    border: 'none', borderRight: i === 0 ? `1px solid ${BORDER_HI}` : 'none',
                  }}
                >
                  <div style={{ fontFamily: FD, fontSize: FS.body, fontWeight: 700, color: initType === opt.key ? opt.accent : TEXT_DIM, marginBottom: 2 }}>
                    {opt.title}
                  </div>
                  <div style={{ fontFamily: FB, fontSize: FS.sm, color: TEXT_MUTED }}>{opt.desc}</div>
                  <div style={{ fontFamily: FB, fontSize: FS.overline, color: opt.accent, marginTop: 3, opacity: 0.8 }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Player Rolls — restyle only, logic unchanged */}
          {characters.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SP[2] }}>
                <SectionHeading>Step 2 — Player Character Rolls</SectionHeading>
                <button
                  onClick={handleRequestRolls}
                  disabled={requesting || !sendToChar}
                  title={!sendToChar ? 'Open CombatPanel from GM dashboard to enable player requests' : undefined}
                  style={{
                    background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER_HI}`,
                    borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[3]}`, cursor: requesting || !sendToChar ? 'default' : 'pointer',
                    fontFamily: FB, fontSize: FS.label, fontWeight: 700,
                    letterSpacing: '0.1em', color: HUD.gold, textTransform: 'uppercase',
                    opacity: requesting || !sendToChar ? 0.5 : 1, transition: `opacity ${EASE.quick}`,
                  }}
                >
                  {requesting ? 'Sending…' : '📡 Request Player Rolls'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                {characters.map(c => {
                  const charVal   = initType === 'cool' ? c.presence : c.willpower
                  const skillData = charSkillRanks[c.id] ?? { cool: 0, vigilance: 0 }
                  const skillRank = initType === 'cool' ? skillData.cool : skillData.vigilance
                  const { proficiency, ability } = buildDicePool(charVal, skillRank)
                  const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
                  const hasResult = r.successes > 0 || r.advantages > 0
                  return (
                    <div key={c.id} className="iset-row" style={{
                      display: 'flex', alignItems: 'center', gap: SP[3],
                      padding: `${SP[2]} ${SP[3]}`,
                      background: 'var(--hud-surface-lo)',
                      border: `1px solid ${BORDER}`,
                      borderLeft: `3px solid ${ROLE_STYLE.pc.color}`,
                      clipPath: PLATE_CLIP,
                    }}>
                      <RoleTag role="pc" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontFamily: FB, fontSize: FS.caption, color: TEXT_MUTED, marginTop: 2 }}>
                          {initType === 'cool'
                            ? `Cool · Presence ${charVal}${skillRank > 0 ? ` · Rank ${skillRank}` : ''}`
                            : `Vigilance · Willpower ${charVal}${skillRank > 0 ? ` · Rank ${skillRank}` : ''}`}
                        </div>
                      </div>
                      <DicePoolPips proficiency={proficiency} ability={ability} />
                      <NumInput value={r.successes} onChange={v => updatePc(c.id, 'successes', v)} />
                      <NumInput value={r.advantages} onChange={v => updatePc(c.id, 'advantages', v)} />
                      <div style={{ width: 76, flexShrink: 0, textAlign: 'right' }}>
                        {hasResult
                          ? <span style={{ fontFamily: FB, fontSize: FS.caption, color: 'var(--state-success)' }}>✓ Received</span>
                          : <span style={{ fontFamily: FB, fontSize: FS.caption, color: 'var(--state-triumph)' }}>⏳ Pending</span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Adversary + Vehicle Rolls */}
          {(roster.length > 0 || vehicleRoster.length > 0) && (
            <div>
              <SectionHeading>Step 3 — Adversary &amp; Vehicle Initiative (GM Rolls)</SectionHeading>

              {roster.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginBottom: vehicleRoster.length > 0 ? SP[3] : 0 }}>
                  {roster.map(a => {
                    const ranks = (a.skillRanks ?? {}) as Record<string, number>
                    const coolRank = ranks['Cool'] ?? 0
                    const vigRank  = ranks['Vigilance'] ?? 0
                    const coolPool = buildDicePool(a.characteristics.presence, coolRank)
                    const vigPool  = buildDicePool(a.characteristics.willpower, vigRank)
                    const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
                    const hasResult = r.successes > 0 || r.advantages > 0
                    const isAlly = (npcAlignments[a.instanceId] ?? 'enemy') === 'allied_npc'
                    const role: PlateRole = isAlly ? 'friendly' : 'enemy'
                    return (
                      <div key={a.instanceId} className="iset-row" style={{
                        display: 'flex', alignItems: 'center', gap: SP[2], flexWrap: 'wrap',
                        padding: `${SP[2]} ${SP[3]}`,
                        background: 'var(--hud-surface-lo)',
                        border: `1px solid ${BORDER}`,
                        borderLeft: `3px solid ${ROLE_STYLE[role].color}`,
                        clipPath: PLATE_CLIP,
                      }}>
                        <div style={{ minWidth: 140, flex: 1 }}>
                          <div style={{ fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT }}>{a.name}</div>
                          <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, marginTop: 2 }}>
                            {a.type.toUpperCase()}{a.type === 'minion' ? ` ×${a.groupSize}` : ''} · PR {a.characteristics.presence} / WIL {a.characteristics.willpower}
                          </div>
                        </div>

                        <button
                          onClick={() => setNpcAlignments(prev => ({ ...prev, [a.instanceId]: isAlly ? 'enemy' : 'allied_npc' }))}
                          title="Toggle disposition"
                        >
                          <RoleTag role={role} longForm />
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button
                            onClick={() => rollAdvInitiative(a, 'cool')}
                            style={{
                              background: 'color-mix(in srgb, var(--state-advantage) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--state-advantage) 40%, transparent)',
                              borderRadius: RADIUS.sm, padding: `2px ${SP[2]}`, cursor: 'pointer',
                              fontFamily: FB, fontSize: FS.overline, color: 'var(--state-advantage)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                            }}
                          >🎲 Cool</button>
                          <button
                            onClick={() => rollAdvInitiative(a, 'vigilance')}
                            style={{
                              background: `color-mix(in srgb, ${HUD.gold} 10%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${HUD.gold} 40%, transparent)`,
                              borderRadius: RADIUS.sm, padding: `2px ${SP[2]}`, cursor: 'pointer',
                              fontFamily: FB, fontSize: FS.overline, color: HUD.gold, letterSpacing: '0.05em', whiteSpace: 'nowrap',
                            }}
                          >🎲 Vig</button>
                        </div>

                        <div>
                          <DicePoolPips proficiency={coolPool.proficiency} ability={coolPool.ability} />
                          {coolRank > 0 && <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>Cool Rk{coolRank}</div>}
                        </div>
                        <div>
                          <DicePoolPips proficiency={vigPool.proficiency} ability={vigPool.ability} />
                          {vigRank > 0 && <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED }}>Vig Rk{vigRank}</div>}
                        </div>

                        <NumInput value={r.successes} onChange={v => updateNpc(a.instanceId, 'successes', v)} />
                        <NumInput value={r.advantages} onChange={v => updateNpc(a.instanceId, 'advantages', v)} />

                        <div style={{ width: 20, flexShrink: 0, textAlign: 'center' }}>
                          {hasResult
                            ? <span style={{ fontFamily: FB, fontSize: FS.caption, color: 'var(--state-success)' }}>✓</span>
                            : <span style={{ fontFamily: FB, fontSize: FS.caption, color: 'var(--state-triumph)' }}>⏳</span>
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {vehicleRoster.length > 0 && (
                <div>
                  <div style={{ fontFamily: FB, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: SP[1] }}>
                    Vehicles — Hand-Entered
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                    {vehicleRoster.map(v => {
                      const r = vehicleResults[v.instanceId] ?? { successes: 0, advantages: 0 }
                      const hasOwnSlot = vehicleOwnSlot[v.instanceId] ?? false
                      return (
                        <div key={v.instanceId} className="iset-row" style={{
                          display: 'flex', alignItems: 'center', gap: SP[2],
                          padding: `${SP[2]} ${SP[3]}`,
                          background: 'var(--hud-surface-lo)',
                          border: `1px solid ${BORDER}`,
                          borderLeft: `3px solid ${ROLE_STYLE.vehicle.color}`,
                          clipPath: PLATE_CLIP,
                        }}>
                          <RoleTag role="vehicle" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: FB, fontSize: FS.sm, fontWeight: 600, color: TEXT }}>{v.name}</div>
                            <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, marginTop: 2 }}>
                              Sil {v.silhouette} · Hdl {v.handling >= 0 ? `+${v.handling}` : v.handling}
                            </div>
                          </div>
                          <NumInput value={r.successes} onChange={val => updateVehicle(v.instanceId, 'successes', val)} />
                          <NumInput value={r.advantages} onChange={val => updateVehicle(v.instanceId, 'advantages', val)} />
                          <button
                            onClick={() => toggleVehicleOwnSlot(v.instanceId)}
                            style={{
                              background: hasOwnSlot ? 'color-mix(in srgb, var(--state-success) 15%, transparent)' : 'transparent',
                              border: `1px solid ${hasOwnSlot ? 'color-mix(in srgb, var(--state-success) 50%, transparent)' : BORDER_HI}`,
                              borderRadius: RADIUS.sm, padding: `2px ${SP[2]}`, cursor: 'pointer',
                              fontFamily: FB, fontSize: FS.overline, fontWeight: 700,
                              color: hasOwnSlot ? 'var(--state-success)' : TEXT_MUTED,
                              whiteSpace: 'nowrap' as const,
                            }}
                          >
                            {hasOwnSlot ? '☑ Own Slot' : '☐ Own Slot'}
                          </button>
                          <div style={{ width: 70, flexShrink: 0, textAlign: 'right' }}>
                            {hasOwnSlot
                              ? <span style={{ fontFamily: FB, fontSize: FS.caption, color: 'var(--state-success)' }}>In Order</span>
                              : <span style={{ fontFamily: FB, fontSize: FS.caption, color: TEXT_MUTED }}>Reserve</span>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Initiative Order Board — dnd-kit sortable */}
          <div>
            <SectionHeading>{hasAnyRoster ? 'Step 4' : 'Step 4'} — Initiative Order Board</SectionHeading>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBoardDragEnd}>
              <SortableContext items={board.map(it => it.boardId)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                  {board.map((item, i) => {
                    const resolved = resolveBoardItem(item)
                    if (!resolved) return null
                    return (
                      <BoardPlate
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
                  {board.length === 0 && (
                    <div style={{
                      padding: SP[4], textAlign: 'center', fontFamily: FB, fontSize: FS.sm, color: TEXT_MUTED,
                      border: `1px dashed ${BORDER_HI}`, borderRadius: RADIUS.md,
                    }}>
                      No participants in the order. Add characters, adversaries, or vehicles above.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Reserve drawer */}
            <div style={{ marginTop: SP[3], border: `1px solid ${BORDER}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
              <button
                className="iset-reserve-header"
                onClick={() => setReserveOpen(o => !o)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: SP[2],
                  padding: `${SP[2]} ${SP[3]}`, background: 'var(--hud-surface-mid)', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: FB, fontSize: FS.caption, color: reserveOpen ? TEXT_DIM : TEXT_MUTED, transform: reserveOpen ? 'rotate(90deg)' : 'none', transition: `transform ${EASE.quick}`, display: 'inline-block' }}>▶</span>
                <span style={{ fontFamily: FD, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEXT_DIM, flex: 1, textAlign: 'left' }}>
                  Reserve
                </span>
                <span style={{
                  fontFamily: FB, fontSize: FS.overline, fontWeight: 700, color: TEXT_MUTED,
                  border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm, padding: '1px 7px',
                }}>
                  {reserve.length}
                </span>
              </button>
              {reserveOpen && (
                <div style={{ padding: reserve.length > 0 ? SP[2] : 0 }}>
                  {reserve.length === 0 ? (
                    <div style={{ padding: SP[3], textAlign: 'center', fontFamily: FB, fontSize: FS.caption, color: TEXT_MUTED }}>
                      Nothing benched.
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReserveDragEnd}>
                      <SortableContext items={reserve.map(it => it.boardId)} strategy={verticalListSortingStrategy}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                          {reserve.map(item => {
                            const resolved = resolveBoardItem(item)
                            if (!resolved) return null
                            return (
                              <ReservePlate
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
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lock & Start */}
          <button
            onClick={() => void handleStart()}
            disabled={isStarting || board.length === 0}
            style={{
              width: '100%', padding: `${SP[3]} 0`,
              background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER_HI}`,
              borderRadius: RADIUS.md, cursor: isStarting ? 'default' : 'pointer',
              fontFamily: FD, fontSize: FS.body, fontWeight: 700,
              letterSpacing: '0.15em', color: HUD.gold, textTransform: 'uppercase',
              opacity: isStarting || board.length === 0 ? 0.6 : 1, transition: `opacity ${EASE.quick}`,
            }}
          >
            {isStarting ? 'Starting…' : 'Lock Order & Start Combat →'}
          </button>
        </div>
    </Modal>
  )
}

// ── BoardPlate — Step 4 sortable plate (drag handle, duplicate, bench) ─────────
function BoardPlate({
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
        display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        background: isFirst ? `color-mix(in srgb, ${HUD.gold} 10%, var(--hud-surface-lo))` : 'var(--hud-surface-lo)',
        border: `1px solid ${isFirst ? `color-mix(in srgb, ${HUD.gold} 55%, transparent)` : BORDER}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: RADIUS.md,
        clipPath: PLATE_CLIP,
        boxShadow: isFirst ? `0 0 16px color-mix(in srgb, ${HUD.gold} 25%, transparent)` : 'none',
      }}
    >
      {/* Drag handle */}
      <span
        className="iset-drag-handle"
        {...attributes}
        {...listeners}
        style={{ fontSize: FS.body, lineHeight: 1, flexShrink: 0, touchAction: 'none' }}
        aria-label="Drag to reorder"
      >⣿</span>

      {/* Position number */}
      <span style={{
        fontFamily: FD, fontSize: FS.h4, fontWeight: 900,
        color: isFirst ? HUD.gold : TEXT_MUTED,
        minWidth: 22, textAlign: 'center', flexShrink: 0,
      }}>
        {index + 1}
      </span>

      <RoleTag role={resolved.role} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <span style={{
            fontFamily: FB, fontSize: FS.sm, fontWeight: 700, color: TEXT,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {resolved.name}
          </span>
          {item.ordinal > 1 && (
            <span style={{
              fontFamily: FB, fontSize: FS.overline, fontWeight: 700, color: HUD.gold,
              border: `1px solid color-mix(in srgb, ${HUD.gold} 45%, transparent)`,
              borderRadius: RADIUS.sm, padding: '0 4px', flexShrink: 0, whiteSpace: 'nowrap' as const,
            }}>
              ×{item.ordinal} · {ordinalSuffix(item.ordinal)} Action
            </span>
          )}
        </div>
        <div style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {resolved.meta}
        </div>
      </div>

      <span style={{ fontFamily: FB, fontSize: FS.label, color: resolved.pending ? 'var(--state-triumph)' : TEXT_DIM, flexShrink: 0, whiteSpace: 'nowrap' as const }}>
        {resolved.pending ? '⏳ awaiting…' : `${resolved.successes}s · ${resolved.advantages}a`}
      </span>

      {/* Hover-revealed actions */}
      <div className="iset-plate-actions" style={{ display: 'flex', gap: SP[1], flexShrink: 0 }}>
        <button
          className="iset-action-btn"
          onClick={onDuplicate}
          title="Duplicate — second action, no re-roll"
          style={{
            ['--act-accent' as string]: 'var(--hud-accent)',
            width: 24, height: 24, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            cursor: 'pointer', fontSize: FS.sm, color: TEXT_DIM, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >⧉</button>
        <button
          className="iset-action-btn"
          onClick={onBench}
          title="Bench — move to Reserve"
          style={{
            ['--act-accent' as string]: 'var(--state-failure)',
            width: 24, height: 24, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            cursor: 'pointer', fontSize: FS.sm, color: TEXT_DIM, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>
    </div>
  )
}

// ── ReservePlate — Step 4 Reserve drawer plate (drag handle, restore) ──────────
function ReservePlate({
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
        display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `${SP[1]} ${SP[2]}`,
        background: 'var(--hud-surface-mid)',
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${ROLE_STYLE[resolved.role].color}`,
        borderRadius: RADIUS.md,
        clipPath: PLATE_CLIP,
      }}
    >
      <span
        className="iset-drag-handle"
        {...attributes}
        {...listeners}
        style={{ fontSize: FS.sm, lineHeight: 1, flexShrink: 0, touchAction: 'none' }}
        aria-label="Drag to reorder within Reserve"
      >⣿</span>

      <RoleTag role={resolved.role} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: SP[1] }}>
        <span style={{ fontFamily: FB, fontSize: FS.caption, fontWeight: 600, color: TEXT_DIM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {resolved.name}
        </span>
        {item.ordinal > 1 && (
          <span style={{ fontFamily: FB, fontSize: FS.overline, color: TEXT_MUTED, flexShrink: 0 }}>
            ×{item.ordinal}
          </span>
        )}
      </div>

      <div className="iset-plate-actions" style={{ flexShrink: 0 }}>
        <button
          className="iset-action-btn"
          onClick={onRestore}
          title="Restore to board"
          style={{
            ['--act-accent' as string]: 'var(--state-success)',
            width: 24, height: 24, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            cursor: 'pointer', fontSize: FS.sm, color: TEXT_DIM, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >↥</button>
      </div>
    </div>
  )
}
