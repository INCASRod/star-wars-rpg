import type { Character } from '@/lib/types'

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
