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
  force:       [],  // Force dice are handled separately via rollForceDice()
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
  /** Present only when the pool contained Force dice. Light/dark pips are not
   *  folded into `net` — they are a separate currency (AoE Core p.286). */
  force?: ForceRollResult
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
    // Force dice have their own face set and their own light/dark currency —
    // rolled below via rollForceDice(), never mixed into the S/F/A/H tally.
    if (type === 'force') continue
    for (let i = 0; i < count; i++) {
      dice.push(rollOneDie(type))
    }
  }

  const forceCount = pool.force ?? 0
  const force = forceCount > 0 ? rollForceDice(forceCount) : undefined

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
    ...(force ? { force } : {}),
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

export interface SkillCheckPoolParams {
  charVal:        number
  rank:           number
  upgradeSkill:   number  // ability->proficiency upgrades applied on top of rank
  boostAdd:       number
  setbackAdd:     number
  forceAdd:       number
  baseDifficulty: number
  diffUpgrades:   number  // difficulty->challenge upgrades
}

/**
 * Upgrade N ability dice into proficiency dice (AoE Core, "Upgrading More
 * Dice Than Available"). Each upgrade converts one ability die into a
 * proficiency die; if none remain, the upgrade instead ADDS an ability die
 * and is consumed doing so — only a SUBSEQUENT upgrade converts that newly
 * added die. Difficulty and non-integer counts are guarded to 0.
 */
export function upgradeAbility(
  proficiency: number, ability: number, upgrades: number,
): { proficiency: number; ability: number } {
  const n = Math.max(0, Math.floor(upgrades))
  for (let i = 0; i < n; i++) {
    if (ability > 0) { ability -= 1; proficiency += 1 }
    else               { ability += 1 }
  }
  return { proficiency, ability }
}

/**
 * Upgrade N difficulty dice into challenge dice. Same rule as
 * `upgradeAbility`, mirrored per GM ruling: each upgrade converts one
 * difficulty die into a challenge die; if none remain, the upgrade instead
 * ADDS a difficulty die and is consumed doing so.
 */
export function upgradeDifficulty(
  difficulty: number, challenge: number, upgrades: number,
): { difficulty: number; challenge: number } {
  const n = Math.max(0, Math.floor(upgrades))
  for (let i = 0; i < n; i++) {
    if (difficulty > 0) { difficulty -= 1; challenge += 1 }
    else                  { difficulty += 1 }
  }
  return { difficulty, challenge }
}

/** Shared manual-adjustment shape for both the Skill Check and Combat Check
 *  panels. Declared here (not in a component file) so both panels — and
 *  `applyModifiers` itself — import the same type. */
export interface ManualAdjustments {
  boostAdd:           number
  setbackAdd:         number
  difficultyAdd:      number
  challengeAdd:       number  // direct challenge-die adjustments (upgrade/downgrade buttons)
  forceAdd:           number  // Force dice added to the check (Force talents/powers)
  abilityUpgrades:    number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0, challengeAdd: 0, forceAdd: 0,
  abilityUpgrades: 0, difficultyUpgrades: 0,
}

/** Combat-only extras that don't apply to a bare skill check. */
export interface ApplyModifiersExtras {
  talentBoost?:        number
  talentSetbackRemove?: number
}

/**
 * Apply a ManualAdjustments delta to a derived base pool, in rulebook order:
 * add step (difficultyAdd on top of base difficulty) THEN upgrade step
 * (upgradeAbility / upgradeDifficulty), then flat boost/setback/challenge/
 * force additions. Never returns a negative count for any die type.
 */
export function applyModifiers(
  basePool: { proficiency: number; ability: number; difficulty: number; challenge: number },
  adjustments: ManualAdjustments,
  extras?: ApplyModifiersExtras,
): Record<DiceType, number> {
  const { proficiency: finalPro, ability: finalAbl } = upgradeAbility(
    basePool.proficiency, basePool.ability, adjustments.abilityUpgrades,
  )

  const availableDiff = Math.max(0, basePool.difficulty + adjustments.difficultyAdd)
  const { difficulty: finalDiff, challenge: finalChalFromUpgrade } = upgradeDifficulty(
    availableDiff, basePool.challenge, adjustments.difficultyUpgrades,
  )

  const talentBoost    = extras?.talentBoost ?? 0
  const talentSbRemove = extras?.talentSetbackRemove ?? 0
  const netSetback     = Math.max(0, adjustments.setbackAdd - talentSbRemove)

  return {
    proficiency: finalPro,
    ability:     finalAbl,
    boost:       Math.max(0, talentBoost + adjustments.boostAdd),
    difficulty:  finalDiff,
    challenge:   Math.max(0, finalChalFromUpgrade + adjustments.challengeAdd),
    setback:     netSetback,
    force:       Math.max(0, adjustments.forceAdd),
  } as Record<DiceType, number>
}

/** Full skill-check pool composition: proficiency/ability via getSkillPool
 *  on the TRUE rank, then applyModifiers() for adds/upgrades/boost/setback/
 *  force. Thin wrapper — `applyModifiers` does the actual work. */
export function buildSkillCheckPool(params: SkillCheckPoolParams): Record<DiceType, number> {
  const { charVal, rank, upgradeSkill, boostAdd, setbackAdd, forceAdd, baseDifficulty, diffUpgrades } = params
  const base = getSkillPool(charVal, rank)
  return applyModifiers(
    { proficiency: base.proficiency, ability: base.ability, difficulty: baseDifficulty, challenge: 0 },
    {
      ...EMPTY_ADJUSTMENTS,
      boostAdd, setbackAdd, forceAdd,
      abilityUpgrades: upgradeSkill,
      difficultyUpgrades: diffUpgrades,
    },
  )
}

/** Force dice available for a check: Force Rating minus dice already
 *  committed to ongoing effects, never negative. */
export function getAvailableForceDice(forceRating: number, committedForce: number): number {
  return Math.max(0, forceRating - committedForce)
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
