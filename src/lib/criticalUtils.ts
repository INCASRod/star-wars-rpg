// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Critical Hit Eligibility Utility
//
// Determines whether a combat roll qualifies for a critical hit declaration,
// based on SWRPG rules: triumph (unconditional) or net advantages ≥ crit
// rating, as long as the attack dealt at least 1 wound after soak.
// ═══════════════════════════════════════════════════════════════════════════

import type { RollResult } from '@/components/player-hud/dice-engine'
import type { RefWeapon } from '@/lib/types'

export interface CriticalEligibility {
  isEligible:           boolean
  triggeredByTriumph:   boolean
  triggeredByAdvantage: boolean
  critRating:           number
  viciousRating:        number
  totalCritModifier:    number
}

/**
 * Check whether a roll qualifies for a critical hit declaration.
 *
 * Rules:
 * - netDamage must be > 0 (attack must pierce soak)
 * - triumph ≥ 1 → unconditional trigger (regardless of crit rating)
 * - netAdvantages ≥ critRating → advantage-triggered
 * - Both can be true simultaneously
 * - Vicious N quality adds +10N to the crit roll
 */
export function checkCriticalEligibility(
  rollResult: RollResult,
  refWeapon:  RefWeapon | null,
  netDamage:  number,
): CriticalEligibility {
  const critRating    = refWeapon?.crit ?? 4
  const netAdvantages = rollResult.net.advantage
  const triumph       = rollResult.net.triumph

  // Vicious quality: key is 'VICIOUS' (XML-derived)
  const viciousRating     = Array.isArray(refWeapon?.qualities)
    ? refWeapon!.qualities!.find(q => q.key?.toUpperCase() === 'VICIOUS')?.count ?? 0
    : 0
  const totalCritModifier = viciousRating * 10

  // Must deal at least 1 wound after soak
  if (netDamage <= 0) {
    return { isEligible: false, triggeredByTriumph: false, triggeredByAdvantage: false, critRating, viciousRating, totalCritModifier }
  }

  const triggeredByTriumph   = triumph > 0
  const triggeredByAdvantage = netAdvantages >= critRating
  const isEligible           = triggeredByTriumph || triggeredByAdvantage

  return { isEligible, triggeredByTriumph, triggeredByAdvantage, critRating, viciousRating, totalCritModifier }
}
