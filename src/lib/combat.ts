export type InitiativeType = 'cool' | 'vigilance'

export type SlotAlignment = 'player' | 'allied_npc' | 'enemy'

export interface InitiativeSlot {
  id: string
  type: 'pc' | 'npc'
  alignment?: SlotAlignment
  order: number
  characterId?: string
  adversaryInstanceId?: string
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
  round: number
  is_active: boolean
  current_slot_index: number
  initiative_type: InitiativeType
  initiative_slots: InitiativeSlot[]
  adversaries: import('./adversaries').AdversaryInstance[]
  log_entries: LogEntry[]
  created_at: string
  updated_at: string
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
