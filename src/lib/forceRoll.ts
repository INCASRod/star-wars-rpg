/**
 * Force die rolling — thin re-export over dice-engine so overlay code
 * has a stable import path that does not depend on the HUD module tree.
 */
export type { ForceDie, ForceRollResult } from '@/components/player-hud/dice-engine'
export { rollForceDice } from '@/components/player-hud/dice-engine'
