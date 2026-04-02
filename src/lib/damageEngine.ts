// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Damage Engine
//
// Pure functions for applying damage to minion groups and individual
// rivals/nemeses.  No side effects — callers are responsible for persisting
// the returned values to Supabase.
// ═══════════════════════════════════════════════════════════════════════════

// ── Shared types ──────────────────────────────────────────────────────────────

/** Minimal shape needed from combat_participants for damage calculations */
export interface DamageTarget {
  id: string
  name: string
  campaign_id?: string
  is_minion_group: boolean
  // Minion group fields
  minion_count_initial?: number | null
  minion_count_current?: number | null
  minion_wound_individual?: number | null
  minion_wound_total?: number | null
  current_wounds: number
  // Rival/nemesis
  wound_threshold?: number | null
}

// ── Minion group ──────────────────────────────────────────────────────────────

export interface MinionDamageResult {
  /** New cumulative wounds in the group pool */
  newWounds:         number
  /** Minions still alive after this damage */
  minionsSurviving:  number
  /** How many were removed by this hit */
  minionsDefeated:   number
  /** Updated group pool ceiling (surviving × individual) */
  newGroupThreshold: number
  /** True when the last minion was just killed */
  groupDefeated:     boolean
  /** Human-readable defeat string, or null if no removals */
  defeatMessage:     string | null
}

/**
 * Calculate damage applied to a minion group using the Age of Rebellion
 * shared-pool rule: each multiple of the individual wound threshold that
 * cumulative wounds crosses removes one minion from the group.
 *
 * @param target        - Current participant state
 * @param damageApplied - Net damage after soak, already calculated by caller
 */
export function applyDamageToMinion(
  target: DamageTarget,
  damageApplied: number,
): MinionDamageResult {
  const individual = target.minion_wound_individual ?? 1
  const initial    = target.minion_count_initial    ?? 1
  const current    = target.minion_count_current    ?? initial

  const newWounds = target.current_wounds + damageApplied

  // Number of minions that should be alive after this damage:
  // each time wounds exceed a multiple of the individual threshold, one dies.
  const minionsSurviving = Math.max(
    0,
    initial - Math.floor(newWounds / individual),
  )
  const minionsDefeated  = Math.max(0, current - minionsSurviving)
  const newGroupThreshold = minionsSurviving * individual
  const groupDefeated    = minionsSurviving === 0

  let defeatMessage: string | null = null
  if (minionsDefeated > 0) {
    defeatMessage = groupDefeated
      ? `${target.name} — ALL DEFEATED`
      : `${minionsDefeated} ${target.name} defeated — ${minionsSurviving} remaining`
  }

  return {
    newWounds,
    minionsSurviving,
    minionsDefeated,
    newGroupThreshold,
    groupDefeated,
    defeatMessage,
  }
}

// ── Rival / Nemesis ───────────────────────────────────────────────────────────

export interface StandardDamageResult {
  /** New wound total */
  newWounds: number
  /** True when wounds reach or exceed wound threshold */
  defeated:  boolean
}

/**
 * Calculate damage applied to a rival or nemesis.
 * Simple accumulation — no group pool logic.
 */
export function applyDamageToRivalNemesis(
  target: DamageTarget,
  damageApplied: number,
): StandardDamageResult {
  const newWounds = target.current_wounds + damageApplied
  const defeated  = newWounds >= (target.wound_threshold ?? Infinity)
  return { newWounds, defeated }
}

// ── AdversaryInstance helpers (JSONB-based wound tracking) ───────────────────
// These work directly on the AdversaryInstance shape stored in
// combat_encounters.adversaries JSONB — no DB row needed.

export interface AdversaryDamageInput {
  type:           'minion' | 'rival' | 'nemesis'
  name:           string
  woundThreshold: number   // per-minion (minion) or individual (rival/nemesis)
  groupSize:      number   // initial group size (minion only)
  groupRemaining: number   // current alive (minion only)
  woundsCurrent:  number   // accumulated wounds
}

export interface AdversaryDamageResult {
  woundsCurrent:  number
  groupRemaining: number
  defeatMessage:  string | null
  isDefeated:     boolean
}

/**
 * Apply damage to an adversary stored as JSONB (no combat_participants row).
 * Returns the fields to merge back into the AdversaryInstance object.
 */
export function applyDamageToAdversary(
  adv: AdversaryDamageInput,
  damageApplied: number,
): AdversaryDamageResult {
  if (adv.type === 'minion') {
    const individual = adv.woundThreshold
    const initial    = adv.groupSize
    const newWounds  = adv.woundsCurrent + damageApplied

    const surviving  = Math.max(0, initial - Math.floor(newWounds / individual))
    const defeated   = surviving === 0
    const removed    = Math.max(0, adv.groupRemaining - surviving)

    let defeatMessage: string | null = null
    if (removed > 0) {
      defeatMessage = defeated
        ? `${adv.name} — ALL DEFEATED`
        : `${removed} ${adv.name} defeated — ${surviving} remaining`
    }

    return {
      woundsCurrent:  newWounds,
      groupRemaining: surviving,
      defeatMessage,
      isDefeated:     defeated,
    }
  }

  // Rival or Nemesis
  const newWounds = adv.woundsCurrent + damageApplied
  const defeated  = newWounds >= adv.woundThreshold
  return {
    woundsCurrent:  newWounds,
    groupRemaining: adv.groupRemaining,
    defeatMessage:  defeated ? `${adv.name} — DEFEATED` : null,
    isDefeated:     defeated,
  }
}
