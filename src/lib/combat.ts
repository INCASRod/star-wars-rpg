export type InitiativeType = 'cool' | 'vigilance'

export type SlotAlignment = 'player' | 'allied_npc' | 'enemy'

export interface InitiativeSlot {
  id: string
  type: 'pc' | 'npc'
  alignment?: SlotAlignment
  order: number
  characterId?: string
  adversaryInstanceId?: string
  vehicleInstanceId?: string      // set for vehicle slots; mutually exclusive with adversaryInstanceId
  name: string
  acted: boolean
  current: boolean
  successes: number
  advantages: number
  woundsCurrent?: number
  squad_suppressed?: boolean
  suppressed_by?: string          // instanceId of the squad leader
}

export interface LogEntry {
  id: string
  round: number
  slot: number
  actor: string
  text: string
  dmOnly: boolean
  timestamp: string
}

export interface CombatEncounter {
  id: string
  campaign_id: string
  /**
   * Map this encounter deck belongs to (migration 115). One persistent row per
   * (campaign_id, map_id), created lazily by `ensureEncounterForMap`. Nullable
   * only because pre-115 rows were campaign-wide; every row created now has it.
   */
  map_id: string | null
  round: number
  is_active: boolean
  current_slot_index: number
  initiative_type: InitiativeType
  initiative_slots: InitiativeSlot[]
  adversaries: import('./adversaries').AdversaryInstance[]
  vehicles: import('./vehicles').VehicleInstance[]
  log_entries: LogEntry[]
  created_at: string
  updated_at: string
}

/**
 * Is this slot's combatant defeated? Derived only — nothing is stored, nothing is written,
 * and the slot itself is never deleted: a healed or mis-clicked combatant simply stops being defeated.
 *
 * Matches the token skull, damageEngine and the player tooltip: reaching the threshold is defeated (>=).
 *  - PC: never.
 *  - Minion group: no one left (groupRemaining === 0).
 *  - Rival / Nemesis: wounds >= threshold, or (strain threshold set and strain >= it).
 *  - Vehicle: hull trauma >= threshold.
 * Missing data is never defeated.
 */
export function isSlotDefeated(
  slot: InitiativeSlot,
  encounter: Pick<CombatEncounter, 'adversaries' | 'vehicles'>,
): boolean {
  if (slot.type === 'pc') return false

  if (slot.adversaryInstanceId) {
    const a = (encounter.adversaries ?? []).find(x => x.instanceId === slot.adversaryInstanceId)
    if (!a) return false
    if (a.type === 'minion') return typeof a.groupRemaining === 'number' && a.groupRemaining === 0
    if (typeof a.woundsCurrent === 'number' && typeof a.woundThreshold === 'number' && a.woundsCurrent >= a.woundThreshold) return true
    if (typeof a.strainThreshold === 'number' && typeof a.strainCurrent === 'number' && a.strainCurrent >= a.strainThreshold) return true
    return false
  }

  if (slot.vehicleInstanceId) {
    const v = (encounter.vehicles ?? []).find(x => x.instanceId === slot.vehicleInstanceId)
    if (!v) return false
    return typeof v.hullTraumaCurrent === 'number' && typeof v.hullTraumaThreshold === 'number' && v.hullTraumaCurrent >= v.hullTraumaThreshold
  }

  return false
}

/** Sort initiative slots per AoE rulebook rules */
export function sortInitiative(
  slots: Array<InitiativeSlot & { pending?: boolean }>
): Array<InitiativeSlot & { pending?: boolean }> {
  return [...slots].sort((a, b) => {
    // 1. Most successes first
    if (b.successes !== a.successes) return b.successes - a.successes
    // 2. Tie → most advantages
    if (b.advantages !== a.advantages) return b.advantages - a.advantages
    // 3. PC wins ties against NPC
    if (a.type !== b.type) return a.type === 'pc' ? -1 : 1
    // 4. Maintain input order
    return a.order - b.order
  })
}

/** Advance current pointer to next unacted slot; increment round if all acted */
export function advanceInitiative(
  slots: InitiativeSlot[],
  currentIndex: number,
  round: number
): { slots: InitiativeSlot[]; currentIndex: number; round: number } {
  const updated = slots.map((s, i) =>
    i === currentIndex ? { ...s, acted: true, current: false } : s
  )
  const next = updated.findIndex((s, i) => i > currentIndex && !s.acted)
  if (next !== -1) {
    updated[next] = { ...updated[next], current: true }
    return { slots: updated, currentIndex: next, round }
  }
  // All acted — start new round
  const reset = updated.map(s => ({ ...s, acted: false, current: false }))
  if (reset.length > 0) reset[0] = { ...reset[0], current: true }
  return { slots: reset, currentIndex: 0, round: round + 1 }
}
