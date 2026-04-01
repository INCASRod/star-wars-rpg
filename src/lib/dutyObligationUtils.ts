import type { Character, RefDutyType, RefObligationType } from './types'

/**
 * Resolve the display name for a character's Duty type.
 * Priority: custom_name > ref table name > raw key > '—'
 */
export function resolveDutyName(
  character: Character,
  dutyTypes: RefDutyType[],
): string {
  if (character.duty_custom_name) return character.duty_custom_name
  const ref = dutyTypes.find(d => d.key === character.duty_type)
  if (ref) return ref.name
  return character.duty_type ?? '—'
}

/**
 * Resolve the display name for a character's Obligation type.
 * Priority: custom_name > ref table name > raw key > '—'
 */
export function resolveObligationName(
  character: Character,
  obligationTypes: RefObligationType[],
): string {
  if (character.obligation_custom_name) return character.obligation_custom_name
  const ref = obligationTypes.find(o => o.key === character.obligation_type)
  if (ref) return ref.name
  return character.obligation_type ?? '—'
}
