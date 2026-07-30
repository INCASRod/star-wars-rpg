import type { SupabaseClient } from '@supabase/supabase-js'
import type { Character, ForceCommitment } from '@/lib/types'

/**
 * Returns true if the character has a Force Rating of 1 or more.
 * Uses the computed force_rating stored on the character record, or falls
 * back to the live computed value if provided.
 */
export function isForceUserSensitive(character: Character, computedForceRating?: number): boolean {
  const rating = computedForceRating ?? character.force_rating ?? 0
  return rating >= 1
}

/**
 * Returns how many Force dice are available (not committed).
 */
export function getAvailableForceRating(character: Character, computedForceRating?: number): number {
  const total     = computedForceRating ?? character.force_rating ?? 0
  const committed = character.force_rating_committed ?? 0
  return Math.max(0, total - committed)
}

/**
 * Returns true if the GM has declared this character fallen to the Dark Side.
 * When true, dark pips are free and light pips carry the consequence cost.
 */
export function isDarkSideFallen(character: Character): boolean {
  return character.is_dark_side_fallen === true
}

/**
 * Returns which alignment pips are free for this character:
 * - Dathomiri: 'both' (all pips free)
 * - Dark side fallen: 'dark' (dark pips free, light costly)
 * - Standard Force user: 'light' (light pips free, dark costly)
 */
export function getFreeForceAlignment(
  character: Character,
): 'light' | 'dark' | 'both' {
  if (character.species_key &&
      ['DATHOMIRIAN', 'NIGHTSISTER', 'DATHOMIRI'].includes(
        character.species_key.toUpperCase()
      )) {
    return 'both'
  }
  return isDarkSideFallen(character) ? 'dark' : 'light'
}

// `ref_force_abilities` has no structured ongoing/commit column in either
// dataset — commit behavior only exists as prose inside `description`
// (confirmed against the respec dataset: 69 abilities match, all
// co-occurring with the "[FO]" Force-die bracket token, no false positives
// from an unrelated English use of "commit"). This is a client-side parse
// of that prose, not a stand-in for a real data column.
//
// This answers ONLY "can this ability be committed" — it does NOT return a
// reliable dice count. Some descriptions have a fixed, bracket-countable
// count ("[FO][FO][FO]"), but others are variable ("commit one or more
// [FO]") or formula-based ("commit [FO] per Duration upgrade purchased") —
// counting is out of scope here; the UI is expected to use a manual
// stepper instead of trusting a parsed number.
export function isForceCommitCapable(description: string): boolean {
  return /commit/i.test(description) && description.includes('[FO]')
}

// A handful of abilities match the commit+[FO] pattern above but are NOT
// self-declaring a commit — confirmed by manually reading each match's full
// description (see the F-prompt investigation this exclusion list came
// from):
//   - SUPPRESSMASTERY, SUPMASTERYRE: these UNCOMMIT an opponent's dice —
//     inverse of the mechanic, not something the player themselves commits.
//   - STILLNESS (SUPPRESS): reads a pre-existing commitment STATE ("while
//     the user has committed all of their [FO]") rather than declaring its
//     own commit action.
//   - PROTECTIVEINSTINCTS (SENSE), DURATIONIMPPSYCH (PSYCHOMETRY):
//     conditional bonuses gated on a SIBLING ability's commitment ("while
//     committing [FO] to Threat Sense" / "while committing to Duration") —
//     cross-references another ability's row, not this one's own.
// If this list ever needs to grow, that's a signal the regex-on-prose
// approach has reached its limit and commit-capability should move to a
// real data column instead of silently patching more exceptions here.
const EXCLUDED_FORCE_COMMIT_KEYS = new Set<string>([
  'SUPPRESSMASTERY',
  'SUPMASTERYRE',
  'STILLNESS',
  'PROTECTIVEINSTINCTS',
  'DURATIONIMPPSYCH',
])

/** `isForceCommitCapable` plus the hardcoded exclusion set above, keyed by
 * `ref_force_abilities.key`. Prefer this over the bare description check
 * when the ability's key is available. */
export function isForceCommitCapableForAbility(key: string, description: string): boolean {
  if (EXCLUDED_FORCE_COMMIT_KEYS.has(key)) return false
  return isForceCommitCapable(description)
}

/** Race-safe fresh-fetch for a commit/release read-modify-write:
 * re-reads force_rating_committed + force_commitments right before the
 * caller derives its update, instead of trusting a possibly-stale local
 * character prop. Shared by desktop (HudForceTab.tsx) and mobile
 * (MobileHudLayout.tsx) — previously duplicated per call site, which is
 * exactly how the two diverged. */
export async function fetchFreshCommitState(
  supabase: SupabaseClient,
  characterId: string,
  fallback: { committed: number; commitments: ForceCommitment[] },
): Promise<{ committed: number; commitments: ForceCommitment[] }> {
  const { data } = await supabase
    .from('characters')
    .select('force_rating_committed, force_commitments')
    .eq('id', characterId)
    .single()
  return {
    committed: data?.force_rating_committed ?? fallback.committed,
    commitments: (data?.force_commitments as ForceCommitment[] | null) ?? fallback.commitments,
  }
}

export type BalancePointState = 'neutral' | 'light' | 'dark'

/** Pure guard for a Force Presence Balance Point flip — validates the
 * transition and computes the resulting counts, clamped to the
 * characters_balance_points_check invariant (light+dark<=10, migration 095).
 * Returns null for an invalid transition (dark→light is never valid — a Dark
 * pip only ever offers Neutral). Shared by the player's own flip
 * (useCharacterData.ts's handleFlipBalancePoint) and the GM's correction-path
 * flip (useGmCharacterActions.ts) — extracted here (Prompt C) rather than
 * duplicated, since ForcePresenceCard.tsx exports no reusable sub-logic of
 * its own (only the top-level component + its props type). */
export function computeBalancePointFlip(
  fromState: BalancePointState,
  toState: BalancePointState,
  currentLight: number,
  currentDark: number,
): { light: number; dark: number } | null {
  let light = currentLight
  let dark = currentDark
  if (fromState === 'neutral' && toState === 'light')        light += 1
  else if (fromState === 'neutral' && toState === 'dark')    dark  += 1
  else if (fromState === 'light'   && toState === 'neutral') light -= 1
  else if (fromState === 'light'   && toState === 'dark')  { light -= 1; dark += 1 }
  else if (fromState === 'dark'    && toState === 'neutral') dark  -= 1
  else return null

  light = Math.max(0, light)
  dark  = Math.max(0, dark)
  if (light + dark > 10) return null
  return { light, dark }
}

/** Race-safe fresh-fetch for a Balance Point read-modify-write — re-reads
 * light_points/dark_points immediately before the caller derives its update.
 * Shared by the player's own flip and the GM's correction-path flip. */
export async function fetchFreshBalancePoints(
  supabase: SupabaseClient,
  characterId: string,
  fallback: { light: number; dark: number },
): Promise<{ light: number; dark: number }> {
  const { data } = await supabase
    .from('characters')
    .select('light_points, dark_points')
    .eq('id', characterId)
    .single()
  return {
    light: data?.light_points ?? fallback.light,
    dark:  data?.dark_points  ?? fallback.dark,
  }
}
