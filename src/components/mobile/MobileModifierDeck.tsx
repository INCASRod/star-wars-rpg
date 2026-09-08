'use client'

import { upgradeAbility, upgradeDifficulty, type ManualAdjustments } from '@/components/player-hud/dice-engine'
import { DICE_META, type DiceType } from '@/lib/tokens'

/**
 * Reusable modifier-deck component — built once here, hosted again by the
 * skill and Force check panels in Prompt 3b. Every value it shows is either
 * a direct field of `adjustments`/`extras` or derived by calling
 * `upgradeAbility`/`upgradeDifficulty` (the same pure functions
 * `applyModifiers` itself calls) against `basePool` — never a value computed
 * ad hoc in this file.
 *
 * `ManualAdjustments` (dice-engine.ts) has no field for a raw Ability or
 * Proficiency die add — only `applyModifiers`'s named adjustments exist
 * there, and that file is out of scope to edit. The "Rarely needed: Ability,
 * Proficiency" steppers the spec asks for are implemented as a SEPARATE
 * `extras` object the caller adds to the pool `applyModifiers` returns
 * (`finalPool.ability += extras.abilityAdd`, etc) — a flat post-modifier
 * addition, the same category of operation `boostAdd`/`forceAdd` already
 * are inside `applyModifiers`, never a reimplementation of any upgrade or
 * difficulty maths.
 */
export interface ModifierDeckBasePool {
  proficiency: number
  ability:     number
  difficulty:  number
  challenge:   number
}

export interface ModifierDeckExtras {
  abilityAdd:     number
  proficiencyAdd: number
}

export const EMPTY_DECK_EXTRAS: ModifierDeckExtras = { abilityAdd: 0, proficiencyAdd: 0 }

export interface ModifierDeckProps {
  adjustments: ManualAdjustments
  onChange:    (adj: ManualAdjustments) => void
  extras:      ModifierDeckExtras
  onExtrasChange: (extras: ModifierDeckExtras) => void
  /** Pre-modifier base pool — the deck derives its upgrade result lines from
      this, never from the stepper counts themselves. */
  basePool: ModifierDeckBasePool
  /** Floor for difficultyAdd, e.g. -basePool.difficulty so it can't remove
      more difficulty than the check actually has. Defaults to 0 (melee: the
      player builds difficulty up from nothing, so removing below 0 is meaningless). */
  difficultyFloor?: number
  /** Controlled — "stays open once opened, for the duration of the check"
      means the owning screen keeps this in state, not the deck itself. */
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  onReset: () => void
}

interface StepperDef {
  key:     keyof ManualAdjustments | keyof ModifierDeckExtras
  source:  'adjustments' | 'extras'
  label:   string
  sub?:    string
  dieType: DiceType
  isUpgrade?: boolean
  downgradeLabel?: string
}

const PRIMARY_STEPPERS: StepperDef[] = [
  { key: 'difficultyAdd', source: 'adjustments', label: 'Difficulty', sub: 'Add / remove', dieType: 'difficulty' },
  { key: 'boostAdd',      source: 'adjustments', label: 'Boost',                            dieType: 'boost' },
  { key: 'setbackAdd',    source: 'adjustments', label: 'Setback',                          dieType: 'setback' },
  { key: 'challengeAdd',  source: 'adjustments', label: 'Challenge', sub: 'Add / remove',   dieType: 'challenge' },
]

const UPGRADE_STEPPERS: StepperDef[] = [
  { key: 'abilityUpgrades',    source: 'adjustments', label: 'Upgrade Ability',    sub: 'Ability → Proficiency',  dieType: 'proficiency', isUpgrade: true, downgradeLabel: 'Undo' },
  { key: 'difficultyUpgrades', source: 'adjustments', label: 'Upgrade Difficulty', sub: 'Difficulty → Challenge', dieType: 'challenge',   isUpgrade: true, downgradeLabel: 'Undo' },
]

const RARE_STEPPERS: StepperDef[] = [
  { key: 'abilityAdd',     source: 'extras',      label: 'Ability',     dieType: 'ability' },
  { key: 'proficiencyAdd', source: 'extras',      label: 'Proficiency', dieType: 'proficiency' },
  { key: 'forceAdd',       source: 'adjustments', label: 'Force',       dieType: 'force' },
]

function DeckRow({
  def, value, onAdd, onRemove, canRemove,
}: { def: StepperDef; value: number; onAdd: () => void; onRemove: () => void; canRemove: boolean }) {
  return (
    <div className="m-deck-row">
      <span
        aria-hidden="true"
        style={{
          width: 14, height: 14, borderRadius: 3, flexShrink: 0, /* fixed die-glyph geometry */
          background: DICE_META[def.dieType].color, /* die-identity colour — sealed namespace */
        }}
      />
      <span className="m-deck-row-meta">
        <span className="m-deck-row-name">{def.label}</span>
        {def.sub && <span className="m-deck-row-sub">{def.sub}</span>}
      </span>
      <button
        type="button"
        className={`m-deck-btn${def.downgradeLabel ? ' is-downgrade' : ''}`}
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={def.downgradeLabel ? `${def.downgradeLabel} ${def.label}` : `Remove ${def.label}`}
      >
        {def.downgradeLabel ? '↓' : '−'}
      </button>
      <span className="m-deck-value">{value}</span>
      <button
        type="button"
        className="m-deck-btn"
        onClick={onAdd}
        aria-label={def.isUpgrade ? `Upgrade ${def.label}` : `Add ${def.label}`}
      >
        {def.isUpgrade ? '↑' : '+'}
      </button>
    </div>
  )
}

export function MobileModifierDeck({
  adjustments, onChange, extras, onExtrasChange, basePool, difficultyFloor = 0,
  expanded, onExpandedChange, onReset,
}: ModifierDeckProps) {
  const adj = adjustments as unknown as Record<string, number>
  const ext = extras as unknown as Record<string, number>

  function getValue(def: StepperDef): number {
    return def.source === 'extras' ? (ext[def.key] ?? 0) : (adj[def.key] ?? 0)
  }
  function setValue(def: StepperDef, delta: number, min = 0) {
    if (def.source === 'extras') {
      onExtrasChange({ ...extras, [def.key]: Math.max(min, getValue(def) + delta) } as ModifierDeckExtras)
    } else {
      onChange({ ...adjustments, [def.key]: Math.max(min, getValue(def) + delta) } as ManualAdjustments)
    }
  }

  // ── Derived result lines — computed via the SAME pure functions applyModifiers calls ──
  const abilityResult = upgradeAbility(basePool.proficiency, basePool.ability, adjustments.abilityUpgrades)
  const proficiencyGained = abilityResult.proficiency - basePool.proficiency
  const abilityAdded = (abilityResult.ability - basePool.ability) + proficiencyGained
  const abilityLine = adjustments.abilityUpgrades === 0 ? null
    : abilityAdded > 0
      ? `${adjustments.abilityUpgrades} upgrade${adjustments.abilityUpgrades === 1 ? '' : 's'}: ${proficiencyGained} ability → proficiency (${abilityAdded} added first — none available to convert)`
      : `${adjustments.abilityUpgrades} upgrade${adjustments.abilityUpgrades === 1 ? '' : 's'} converted ${proficiencyGained} ability → proficiency`

  const availableDiff = Math.max(0, basePool.difficulty + adjustments.difficultyAdd)
  const difficultyResult = upgradeDifficulty(availableDiff, basePool.challenge, adjustments.difficultyUpgrades)
  const challengeGained = difficultyResult.challenge - basePool.challenge
  const difficultyAdded = (difficultyResult.difficulty - availableDiff) + challengeGained
  const difficultyLine = adjustments.difficultyUpgrades === 0 ? null
    : difficultyAdded > 0
      ? `${adjustments.difficultyUpgrades} upgrade${adjustments.difficultyUpgrades === 1 ? '' : 's'}: ${challengeGained} difficulty → challenge (${difficultyAdded} added first — none available to convert)`
      : `${adjustments.difficultyUpgrades} upgrade${adjustments.difficultyUpgrades === 1 ? '' : 's'} converted ${challengeGained} difficulty → challenge`

  return (
    <div className="m-deck">
      {PRIMARY_STEPPERS.map(def => {
        const value = getValue(def)
        const min = def.key === 'difficultyAdd' ? difficultyFloor : 0
        return (
          <DeckRow
            key={def.key}
            def={def}
            value={value}
            onAdd={() => setValue(def, 1, min)}
            onRemove={() => setValue(def, -1, min)}
            canRemove={value > min}
          />
        )
      })}

      {!expanded ? (
        <button type="button" className="m-deck-expander-btn" onClick={() => onExpandedChange(true)}>
          More modifiers — Upgrades, Ability, Proficiency, Force
        </button>
      ) : (
        <>
          <div className="m-deck-group-label">Upgrades</div>
          {UPGRADE_STEPPERS.map(def => {
            const value = getValue(def)
            return <DeckRow key={def.key} def={def} value={value} onAdd={() => setValue(def, 1)} onRemove={() => setValue(def, -1)} canRemove={value > 0} />
          })}
          {abilityLine && <div className="m-deck-result-line">{abilityLine}</div>}
          {difficultyLine && <div className="m-deck-result-line">{difficultyLine}</div>}

          <div className="m-deck-group-label">Rarely needed</div>
          {RARE_STEPPERS.map(def => {
            const value = getValue(def)
            return <DeckRow key={def.key} def={def} value={value} onAdd={() => setValue(def, 1)} onRemove={() => setValue(def, -1)} canRemove={value > 0} />
          })}
        </>
      )}

      <button type="button" className="m-deck-reset-btn" onClick={onReset}>
        Reset my additions
      </button>
    </div>
  )
}
