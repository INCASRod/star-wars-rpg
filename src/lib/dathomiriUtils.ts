import type { Character } from '@/lib/types'

/** Species keys that treat dark-side Force points freely (no strain / Destiny cost). */
const DATHOMIRIAN_SPECIES_KEYS = ['DATHOMIRIAN', 'NIGHTSISTER', 'DATHOMIRI']

export function isDathomiri(character: Character): boolean {
  return DATHOMIRIAN_SPECIES_KEYS.includes(
    (character.species_key ?? '').toUpperCase()
  )
}
