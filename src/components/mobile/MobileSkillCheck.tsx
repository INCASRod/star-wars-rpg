'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { rollPool, getSkillPool, applyModifiers, EMPTY_ADJUSTMENTS, type ManualAdjustments } from '@/components/player-hud/dice-engine'
import { totalPoolDice } from '@/lib/combatCheckUtils'
import { logRoll } from '@/lib/logRoll'
import type { HudSkill } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { DiceType } from '@/lib/tokens'
import { CHAR_FULL } from '@/lib/tokens'
import { MobilePoolStep } from './MobilePoolStep'
import { MobileCombatResult, type MobileCritInfo } from './MobileCombatResult'
import { EMPTY_DECK_EXTRAS, type ModifierDeckExtras } from './MobileModifierDeck'

const DIFF_LABELS = ['Simple', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable'] as const

export interface MobileSkillCheckProps {
  open: boolean
  onClose: () => void
  hudSkills: HudSkill[]
  skillModifiers: Record<string, SkillDiceModifier>
  campaignId: string | null
  characterId: string
  characterName: string
  initialSkillKey?: string | null
}

export function MobileSkillCheck({
  open, onClose, hudSkills, skillModifiers, campaignId, characterId, characterName, initialSkillKey,
}: MobileSkillCheckProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialSkillKey ?? null)
  const [baseDifficulty, setBaseDifficulty] = useState(2)
  const [adjustments, setAdjustments] = useState<ManualAdjustments>(EMPTY_ADJUSTMENTS)
  const [deckExtras, setDeckExtras] = useState<ModifierDeckExtras>(EMPTY_DECK_EXTRAS)
  const [deckExpanded, setDeckExpanded] = useState(false)
  const [rollResult, setRollResult] = useState<ReturnType<typeof rollPool> | null>(null)

  // This panel is mounted once for the life of MobileShell (toggled via
  // `open`, never unmounted/remounted) — `useState(initialSkillKey ?? null)`
  // above only seeds `selectedKey` on that one-time mount, so it never
  // re-syncs to a NEW `initialSkillKey` on a later open. Root cause of a
  // real bug: tapping skill A then skill B opened B's panel still showing
  // A's selection, and Roll → Skill Check opened with whatever skill was
  // last viewed instead of the picker. Explicitly re-seeding here on every
  // open (not every render — closing over `open` alone, not `initialSkillKey`,
  // so a mid-session pick from the picker list isn't overwritten while the
  // panel stays open) fixes the actual defect instead of masking it.
  useEffect(() => {
    if (open) setSelectedKey(initialSkillKey ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const skill = hudSkills.find(s => s.key === selectedKey) ?? null

  function resetForClose() {
    setSelectedKey(null)
    setBaseDifficulty(2)
    setAdjustments(EMPTY_ADJUSTMENTS)
    setDeckExtras(EMPTY_DECK_EXTRAS)
    setDeckExpanded(false)
    setRollResult(null)
  }

  function handleClose() {
    resetForClose()
    onClose()
  }

  function selectRung(v: number) {
    setBaseDifficulty(v)
    setAdjustments(a => ({ ...a, difficultyAdd: 0 }))
  }

  const talentMod = skill ? skillModifiers[skill.key] : undefined
  const talentBoost = talentMod?.boostAdd ?? 0
  const talentSetbackRemove = talentMod?.setbackRemove ?? 0

  const basePool = useMemo(() => {
    if (!skill) return { proficiency: 0, ability: 0, difficulty: 0, challenge: 0 }
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    return { proficiency, ability, difficulty: Math.max(0, baseDifficulty), challenge: 0 }
  }, [skill, baseDifficulty])

  const modifiedPool = useMemo(
    () => applyModifiers(basePool, adjustments, { talentBoost, talentSetbackRemove }),
    [basePool, adjustments, talentBoost, talentSetbackRemove],
  )

  const finalPool: Record<DiceType, number> = {
    ...modifiedPool,
    ability: modifiedPool.ability + deckExtras.abilityAdd,
    proficiency: modifiedPool.proficiency + deckExtras.proficiencyAdd,
  }

  const sheetBasePool: Record<DiceType, number> = {
    proficiency: basePool.proficiency, ability: basePool.ability, boost: talentBoost, setback: 0,
    challenge: basePool.challenge, difficulty: basePool.difficulty, force: 0,
  }

  const totalDice = totalPoolDice(finalPool)
  const canRoll = skill !== null && totalDice > 0

  function handleRoll() {
    if (!skill) return
    const result = rollPool(finalPool as Parameters<typeof rollPool>[0])
    setRollResult(result)
    // Replicates HudSkillQuickList's exact write path: onRoll?.(result, label,
    // pool) with no `meta` — the parent's logRoll call therefore carries no
    // roll_type/weapon_name/etc, same as desktop. No combat_log, no
    // pending_damage.
    if (campaignId) {
      logRoll({ campaignId, characterId, characterName, label: `${skill.name} Check`, pool: finalPool, result })
    }
  }

  function handleRollAgain() {
    setRollResult(null)
    setAdjustments(EMPTY_ADJUSTMENTS)
    setDeckExtras(EMPTY_DECK_EXTRAS)
  }

  function handleNewAttack() {
    resetForClose()
  }

  if (!open) return null

  return createPortal(
    <div className="m-combat-root" data-mobile-shell="">
      <div className="m-combat-header">
        <span className="m-combat-title">{rollResult ? 'Check Result' : 'Skill Check'}</span>
        <button type="button" className="m-icon-btn" onClick={handleClose} aria-label="Close">✕</button>
      </div>

      <div className="m-combat-body">
        {rollResult && skill ? (
          <MobileCombatResult
            result={rollResult}
            weaponName={skill.name}
            netDamageEstimate={null}
            crit={null as MobileCritInfo | null}
            onRollAgain={handleRollAgain}
            onNewAttack={handleNewAttack}
          />
        ) : !skill ? (
          <div>
            {hudSkills.map(s => (
              <div key={s.key} className="m-weapon-row" onClick={() => setSelectedKey(s.key)} role="button" tabIndex={0}>
                <span className="m-weapon-name">{s.name}{s.isCareer ? ' ★' : ''}</span>
                <span className="m-weapon-stats">{CHAR_FULL[s.charKey]} {s.charVal} · Rank {s.rank}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="m-skill-header">
              <span className="m-skill-header-name">{skill.name}</span>
              <span className="m-skill-header-sub">
                {CHAR_FULL[skill.charKey]} {skill.charVal} · Rank {skill.rank}{skill.isCareer ? ' · Career' : ''}
              </span>
            </div>

            <div className="m-ladder-grid">
              {DIFF_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`m-range-cell${baseDifficulty === idx ? ' is-selected' : ''}`}
                  onClick={() => selectRung(idx)}
                >
                  <span className="m-range-cell-label">{label}</span>
                </button>
              ))}
            </div>

            <div className="m-range-derivation">
              <span>
                {DIFF_LABELS[baseDifficulty]} {adjustments.difficultyAdd !== 0 ? `${adjustments.difficultyAdd > 0 ? '+' : ''}${adjustments.difficultyAdd}` : ''} → {Math.max(0, baseDifficulty + adjustments.difficultyAdd)} difficulty
              </span>
              <span className="m-delta-stepper">
                <button
                  type="button" className="m-delta-btn"
                  onClick={() => setAdjustments(a => ({ ...a, difficultyAdd: Math.max(-baseDifficulty, a.difficultyAdd - 1) }))}
                  disabled={baseDifficulty + adjustments.difficultyAdd <= 0}
                >−</button>
                <span className="m-delta-value">{adjustments.difficultyAdd}</span>
                <button type="button" className="m-delta-btn" onClick={() => setAdjustments(a => ({ ...a, difficultyAdd: a.difficultyAdd + 1 }))}>+</button>
              </span>
            </div>

            <MobilePoolStep
              finalPool={finalPool}
              sheetBasePool={sheetBasePool}
              basePool={basePool}
              adjustments={adjustments}
              onAdjustmentsChange={setAdjustments}
              extras={deckExtras}
              onExtrasChange={setDeckExtras}
              difficultyFloor={-baseDifficulty}
              deckExpanded={deckExpanded}
              onDeckExpandedChange={setDeckExpanded}
              onReset={() => { setAdjustments(a => ({ ...EMPTY_ADJUSTMENTS, difficultyAdd: a.difficultyAdd })); setDeckExtras(EMPTY_DECK_EXTRAS) }}
            />
          </div>
        )}
      </div>

      {!rollResult && skill && (
        <div className="m-combat-footer">
          <button type="button" className="m-sheet-btn" onClick={() => setSelectedKey(null)}>Back</button>
          <div className="m-combat-footer-sub">{totalDice === 0 ? 'Pool is empty' : 'Ready to roll'}</div>
          <button type="button" className="m-sheet-btn is-primary" disabled={!canRoll} onClick={handleRoll}>Roll Dice</button>
        </div>
      )}
    </div>,
    document.body,
  )
}
