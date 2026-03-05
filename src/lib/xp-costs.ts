/**
 * XP cost calculations for the FFG Star Wars RPG system.
 */

/** Cost to buy a skill rank (career vs non-career) */
export function skillRankCost(newRank: number, isCareer: boolean): number {
  const base = newRank * 5
  return isCareer ? base : base + 5
}

/** Cost to buy a characteristic during creation (rank × 10) */
export function characteristicCost(newRank: number): number {
  return newRank * 10
}

/** Talent cost is determined by row in the talent tree */
export function talentCost(row: number): number {
  return (row + 1) * 5 // row 0 = 5, row 1 = 10, row 2 = 15, row 3 = 20, row 4 = 25
}

/** Cost to buy an additional specialization */
export function specializationCost(purchaseOrder: number, isInCareer: boolean): number {
  const base = isInCareer ? 10 : 20
  return base + (purchaseOrder - 1) * 10
}

/** Validate if character has enough XP for a purchase */
export function canAfford(availableXP: number, cost: number): boolean {
  return availableXP >= cost
}
