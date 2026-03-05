/**
 * FFG Star Wars dice pool calculator.
 *
 * Ability (green d8) = max(char, rank) - min(char, rank)
 * Proficiency (yellow d12) = min(char, rank)
 */

export interface DicePool {
  proficiency: number // yellow d12
  ability: number     // green d8
}

export function calculateDicePool(characteristic: number, rank: number): DicePool {
  const proficiency = Math.min(characteristic, rank)
  const ability = Math.max(characteristic, rank) - proficiency
  return { proficiency, ability }
}
