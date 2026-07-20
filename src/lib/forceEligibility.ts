import type { Character, CharacterSpecialization, RefSpecialization } from '@/lib/types'

/** Species keys that can never gain a Force Rating under reSpec rules. */
const DROID_SPECIES_KEYS = ['DROID']
const CLONE_SPECIES_KEYS = ['CLONE']

export function isDroid(character: Pick<Character, 'species_key'>): boolean {
  return DROID_SPECIES_KEYS.includes((character.species_key ?? '').toUpperCase())
}

export function isClone(character: Pick<Character, 'species_key'>): boolean {
  return CLONE_SPECIES_KEYS.includes((character.species_key ?? '').toUpperCase())
}

/**
 * A character is eligible to purchase Force Rating 1 if they own at least one
 * Force-sensitive specialization and are not a droid or clone — species that
 * can never gain a Force Rating under reSpec rules.
 */
export function isEligibleForForceRating(
  character: Pick<Character, 'species_key'>,
  charSpecs: Pick<CharacterSpecialization, 'specialization_key'>[],
  refSpecMap: Record<string, Pick<RefSpecialization, 'is_force_sensitive'> | undefined>,
): boolean {
  if (isDroid(character) || isClone(character)) return false
  return charSpecs.some(cs => refSpecMap[cs.specialization_key]?.is_force_sensitive === true)
}
