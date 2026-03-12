// ═══════════════════════════════════════
// HOLOCRON Dice Engine — Pure Functions
// FFG/Genesys narrative dice system
// ═══════════════════════════════════════

import type { DiceType, SymbolKey } from './design-tokens'

// Each face is a string of concatenated symbol codes
// S=success F=failure A=advantage H=threat T=triumph D=despair
const RAW_FACES: Record<DiceType, string[]> = {
  proficiency: ['', 'S', 'S', 'SS', 'SS', 'A', 'SA', 'SA', 'SA', 'AA', 'AA', 'T'],
  ability:     ['', 'S', 'S', 'SS', 'A', 'A', 'SA', 'AA'],
  boost:       ['', '', 'S', 'SA', 'AA', 'A'],
  challenge:   ['', 'F', 'F', 'FF', 'FF', 'H', 'H', 'FH', 'FH', 'HH', 'HH', 'D'],
  difficulty:  ['', 'F', 'FF', 'H', 'H', 'H', 'HH', 'FH'],
  setback:     ['', '', 'F', 'F', 'H', 'H'],
}

export interface DieResult {
  type:    DiceType
  symbols: SymbolKey[]
  faceStr: string
}

export interface NetResult {
  success:   number  // net (success - failure), triumph adds 1
  advantage: number  // net (advantage - threat)
  triumph:   number
  despair:   number
}

export interface RollResult {
  dice: DieResult[]
  net:  NetResult
}

function rollOneDie(type: DiceType): DieResult {
  const faces = RAW_FACES[type]
  const faceStr = faces[Math.floor(Math.random() * faces.length)]
  const symbols = faceStr.split('') as SymbolKey[]
  return { type, symbols, faceStr }
}

export function rollPool(pool: Record<DiceType, number>): RollResult {
  const dice: DieResult[] = []
  for (const [type, count] of Object.entries(pool) as [DiceType, number][]) {
    for (let i = 0; i < count; i++) {
      dice.push(rollOneDie(type))
    }
  }

  let S = 0, F = 0, A = 0, H = 0, T = 0, D = 0
  for (const die of dice) {
    for (const sym of die.symbols) {
      if      (sym === 'S') S++
      else if (sym === 'F') F++
      else if (sym === 'A') A++
      else if (sym === 'H') H++
      else if (sym === 'T') T++
      else if (sym === 'D') D++
    }
  }

  // Triumph counts as 1 success, Despair counts as 1 failure
  return {
    dice,
    net: {
      success:   S + T - F - D,
      advantage: A - H,
      triumph:   T,
      despair:   D,
    },
  }
}

/** Calculate dice pool from a characteristic value and skill rank */
export function getSkillPool(charVal: number, rank: number): { proficiency: number; ability: number } {
  const proficiency = Math.min(charVal, rank)
  const ability     = Math.abs(charVal - rank)
  return { proficiency, ability }
}

/** Total dice count in a pool */
export function poolSize(pool: Record<DiceType, number>): number {
  return Object.values(pool).reduce((a, b) => a + b, 0)
}

// ── Force Dice ──────────────────────────────────────────────────
// Official FFG Force Die (d12): L = light side ○, K = dark side ●
// Blank: 1 face | 1-dark: 6 faces | 2-dark: 2 faces | 1-light: 2 faces | 2-light: 1 face
const FORCE_FACES = ['', 'K', 'K', 'K', 'K', 'K', 'K', 'KK', 'KK', 'L', 'L', 'LL']

export interface ForceDie {
  light: number
  dark:  number
}

export interface ForceRollResult {
  dice:       ForceDie[]
  totalLight: number
  totalDark:  number
}

export function rollForceDice(count: number): ForceRollResult {
  const dice: ForceDie[] = []
  let totalLight = 0, totalDark = 0
  for (let i = 0; i < count; i++) {
    const face = FORCE_FACES[Math.floor(Math.random() * FORCE_FACES.length)]
    const light = (face.match(/L/g) ?? []).length
    const dark  = (face.match(/K/g) ?? []).length
    dice.push({ light, dark })
    totalLight += light
    totalDark  += dark
  }
  return { dice, totalLight, totalDark }
}
