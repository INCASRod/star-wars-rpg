'use client'

import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { rollPool, getSkillPool, applyModifiers, EMPTY_ADJUSTMENTS, type ManualAdjustments, type RollResult } from '@/components/player-hud/dice-engine'
import {
  getRangedDifficulty, getDualWieldPool, formatResultSummary, totalPoolDice,
  isRangedSkill, MELEE_SKILL_KEYS, RANGE_VALUE_MAP, CHAR_FIELD_MAP, type RangeBand,
} from '@/lib/combatCheckUtils'
import { checkCriticalEligibility } from '@/lib/criticalUtils'
import { logRoll } from '@/lib/logRoll'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { DiceType } from '@/lib/tokens'
import { MobileWeaponStep } from './MobileWeaponStep'
import { MobileRangeStep } from './MobileRangeStep'
import { MobilePoolStep } from './MobilePoolStep'
import { MobileCombatResult, type MobileCritInfo } from './MobileCombatResult'
import { EMPTY_DECK_EXTRAS, type ModifierDeckExtras } from './MobileModifierDeck'

export interface DualWieldState {
  enabled: boolean
  primaryWeapon: CharacterWeapon
  secondaryWeapon: CharacterWeapon
}

export interface MobileCombatCheckProps {
  open: boolean
  onClose: () => void
  character: Character
  weapons: CharacterWeapon[]
  charSkills: CharacterSkill[]
  refWeaponMap: Record<string, RefWeapon>
  refSkillMap: Record<string, RefSkill>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  skillModifiers: Record<string, SkillDiceModifier>
  campaignId: string | null
  characterId: string
  encounterId: string | null
}

type Step = 'weapon' | 'range' | 'pool'

const EMPTY_POOL: Record<DiceType, number> = {
  proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0,
}

export function MobileCombatCheck({
  open, onClose, character, weapons, charSkills, refWeaponMap, refSkillMap, refWeaponQualityMap,
  skillModifiers, campaignId, characterId, encounterId: propEncounterId,
}: MobileCombatCheckProps) {
  const [attackType, setAttackType] = useState<'ranged' | 'melee' | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<CharacterWeapon | null>(null)
  const [dualWield, setDualWield] = useState<DualWieldState | null>(null)
  const [selectedBand, setSelectedBand] = useState<RangeBand | null>(null)
  const [adjustments, setAdjustments] = useState<ManualAdjustments>(EMPTY_ADJUSTMENTS)
  const [deckExtras, setDeckExtras] = useState<ModifierDeckExtras>(EMPTY_DECK_EXTRAS)
  const [deckExpanded, setDeckExpanded] = useState(false)
  const [step, setStep] = useState<Step>('weapon')
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [encounterId, setEncounterId] = useState<string | null>(null)

  const isUnarmed = selectedWeapon?.id === '__unarmed__'
  const refWeapon: RefWeapon | null = selectedWeapon && !isUnarmed ? (refWeaponMap[selectedWeapon.weapon_key] ?? null) : null
  const skillKey = isUnarmed ? 'BRAWL' : (refWeapon?.skill_key ?? '')
  const refSkill = refSkillMap[skillKey] ?? null

  const steps: Step[] = attackType === 'ranged' ? ['weapon', 'range', 'pool'] : ['weapon', 'pool']
  const stepIndex = steps.indexOf(step)
  const railCaption = attackType === 'ranged' ? 'Weapon · Range · Pool' : 'Weapon · Pool'

  function resetAll() {
    setAttackType(null); setSelectedWeapon(null); setDualWield(null); setSelectedBand(null)
    setAdjustments(EMPTY_ADJUSTMENTS); setDeckExtras(EMPTY_DECK_EXTRAS); setDeckExpanded(false)
    setStep('weapon'); setRollResult(null); setEncounterId(null)
  }

  // ── Writes — same table/columns/order as CombatCheckOverlay.tsx ─────────
  const writeWeaponToParticipant = useCallback(async (
    primaryName: string | null, secondaryName: string | null = null,
    primaryKey: string | null = null, secondaryKey: string | null = null,
  ) => {
    if (!campaignId) return
    const supabase = createClient()
    await supabase.from('combat_participants')
      .update({
        active_weapon_name: primaryName, active_weapon_key: primaryKey,
        secondary_weapon_name: secondaryName, secondary_weapon_key: secondaryKey,
      })
      .eq('campaign_id', campaignId).eq('character_id', characterId)
  }, [campaignId, characterId])

  const handleEquipWeapon = useCallback(async (weaponId: string, idsToUnequip: string[]) => {
    const supabase = createClient()
    for (const id of idsToUnequip) {
      await supabase.from('character_weapons').update({ is_equipped: false, equip_state: 'stowed' }).eq('id', id)
    }
    await supabase.from('character_weapons').update({ is_equipped: true, equip_state: 'equipped' }).eq('id', weaponId)
  }, [])

  function handleClose() {
    void writeWeaponToParticipant(null, null, null, null)
    resetAll()
    onClose()
  }

  function handleSelectWeapon(w: CharacterWeapon) {
    let derivedType = attackType
    if (w.id === '__unarmed__') {
      derivedType = 'melee'
    } else if (!derivedType) {
      const ref = refWeaponMap[w.weapon_key]
      derivedType = ref?.skill_key ? (isRangedSkill(ref.skill_key) ? 'ranged' : 'melee') : 'ranged'
    }
    if (w.id !== '__unarmed__') {
      const name = w.custom_name || refWeaponMap[w.weapon_key]?.name || null
      void writeWeaponToParticipant(name, null, w.weapon_key, null)
    }
    // Stay on the Weapon step — do NOT auto-advance. Dual wield lives on
    // this step (per spec), so the player needs the weapon step to remain
    // mounted after picking a weapon in order to reach the toggle; advancing
    // only happens via the explicit Back/Next footer.
    setSelectedWeapon(w)
    setAttackType(derivedType)
    setSelectedBand(null)
    setDualWield(null)
    setAdjustments(EMPTY_ADJUSTMENTS)
    setDeckExtras(EMPTY_DECK_EXTRAS)
  }

  function handleDualWieldChange(dw: DualWieldState | null) {
    setDualWield(dw)
    if (dw) {
      const primaryName = dw.primaryWeapon.custom_name || refWeaponMap[dw.primaryWeapon.weapon_key]?.name || null
      const secondaryName = dw.secondaryWeapon.custom_name || refWeaponMap[dw.secondaryWeapon.weapon_key]?.name || null
      void writeWeaponToParticipant(primaryName, secondaryName, dw.primaryWeapon.weapon_key, dw.secondaryWeapon.weapon_key)
    } else if (selectedWeapon) {
      const name = selectedWeapon.custom_name || refWeaponMap[selectedWeapon.weapon_key]?.name || null
      void writeWeaponToParticipant(name, null, selectedWeapon.weapon_key, null)
    }
  }

  // Selecting a different range band resets the difficulty DELTA only —
  // every other adjustment field (boost/setback/challenge/upgrades/force)
  // persists exactly as typed. (Desktop never resets difficultyAdd on band
  // change at all; this reset is a deliberate mobile-only UX improvement —
  // see docs/architecture.md — not a difference in the underlying maths,
  // which stays byte-identical via the same applyModifiers call either way.)
  function handleSelectBand(band: RangeBand) {
    setSelectedBand(band)
    setAdjustments(a => ({ ...a, difficultyAdd: 0 }))
    setStep('pool')
  }

  function handleRangeDelta(delta: number) {
    setAdjustments(a => ({ ...a, difficultyAdd: Math.max(0, a.difficultyAdd + delta) }))
  }

  function handleResetAdjustments() {
    setAdjustments(EMPTY_ADJUSTMENTS)
    setDeckExtras(EMPTY_DECK_EXTRAS)
  }

  // ── Pool derivation — every number comes from an imported pure function ──
  const charVal = (charKey: string) => (character[CHAR_FIELD_MAP[charKey] as keyof Character] as number) ?? 0

  const basePoolForApply = useMemo(() => {
    if (dualWield?.enabled) {
      const primaryRef = refWeaponMap[dualWield.primaryWeapon.weapon_key]
      const secondaryRef = refWeaponMap[dualWield.secondaryWeapon.weapon_key]
      if (!primaryRef || !secondaryRef) return { proficiency: 0, ability: 0, difficulty: 0, challenge: 0 }
      const primaryRank = charSkills.find(s => s.skill_key === primaryRef.skill_key)?.rank ?? 0
      const secondaryRank = charSkills.find(s => s.skill_key === secondaryRef.skill_key)?.rank ?? 0
      const primaryCharVal = refSkillMap[primaryRef.skill_key] ? charVal(refSkillMap[primaryRef.skill_key].characteristic_key) : 0
      const secondaryCharVal = refSkillMap[secondaryRef.skill_key] ? charVal(refSkillMap[secondaryRef.skill_key].characteristic_key) : 0
      const primaryMaxRange = primaryRef.range_value ? (RANGE_VALUE_MAP[primaryRef.range_value] ?? 'extreme') : 'extreme'
      const secondaryMaxRange = secondaryRef.range_value ? (RANGE_VALUE_MAP[secondaryRef.range_value] ?? 'extreme') : 'extreme'
      const dw = getDualWieldPool(
        primaryRef.skill_key, secondaryRef.skill_key, primaryCharVal, secondaryCharVal,
        primaryRank, secondaryRank, selectedBand, primaryMaxRange, secondaryMaxRange,
      )
      return { proficiency: dw.proficiency, ability: dw.ability, difficulty: dw.difficulty, challenge: 0 }
    }

    const rank = charSkills.find(s => s.skill_key === skillKey)?.rank ?? 0
    const cVal = refSkill ? charVal(refSkill.characteristic_key) : character.brawn
    const { proficiency, ability } = getSkillPool(cVal, rank)

    let difficulty = 0, challenge = 0
    if (attackType === 'ranged' && refWeapon && selectedBand) {
      const maxRange = refWeapon.range_value ? (RANGE_VALUE_MAP[refWeapon.range_value] ?? 'extreme') : 'extreme'
      const r = getRangedDifficulty(selectedBand, refWeapon.skill_key, maxRange)
      difficulty = r.difficultyDice
      challenge = r.challengeDice
    }
    // Melee: mobile has no opponent/target step this prompt — the player
    // builds difficulty up from 0 entirely via the Difficulty deck control.
    return { proficiency, ability, difficulty, challenge }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dualWield, selectedBand, charSkills, skillKey, refSkill, attackType, refWeapon, character.brawn, refWeaponMap, refSkillMap])

  const activeSkillKeyForTalents = dualWield?.enabled ? refWeaponMap[dualWield.primaryWeapon.weapon_key]?.skill_key : skillKey
  const talentMod = activeSkillKeyForTalents ? skillModifiers[activeSkillKeyForTalents] : undefined
  const talentBoost = talentMod?.boostAdd ?? 0
  const talentSetbackRemove = talentMod?.setbackRemove ?? 0

  const modifiedPool = useMemo(
    () => applyModifiers(basePoolForApply, adjustments, { talentBoost, talentSetbackRemove }),
    [basePoolForApply, adjustments, talentBoost, talentSetbackRemove],
  )

  // Rare Ability/Proficiency adds — a flat post-modifier addition on top of
  // what applyModifiers returns, never routed through it (see
  // MobileModifierDeck.tsx's own note on why ManualAdjustments has no field
  // for these).
  const finalPool: Record<DiceType, number> = {
    ...modifiedPool,
    ability: modifiedPool.ability + deckExtras.abilityAdd,
    proficiency: modifiedPool.proficiency + deckExtras.proficiencyAdd,
  }

  const sheetBasePool: Record<DiceType, number> = {
    ...EMPTY_POOL,
    proficiency: basePoolForApply.proficiency,
    ability: basePoolForApply.ability,
    difficulty: basePoolForApply.difficulty,
    challenge: basePoolForApply.challenge,
    boost: talentBoost,
  }

  const totalDice = totalPoolDice(finalPool)
  const canRoll = selectedWeapon !== null && (attackType !== 'ranged' || selectedBand !== null) && totalDice > 0

  // ── Roll execution — write sequence matches CombatCheckOverlay.tsx exactly ──
  const handleRoll = useCallback(async () => {
    const result = rollPool(finalPool as Parameters<typeof rollPool>[0])
    setRollResult(result)

    const isMelee = attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')
    const rawDmg = (refWeapon?.damage ?? 0) + (isMelee ? character.brawn : 0) + Math.max(0, result.net.success)
    const netDmg = Math.max(0, rawDmg) // no targets this prompt — minSoak is always 0, matching desktop's empty-target branch
    const critEligibility = checkCriticalEligibility(result, refWeapon, netDmg)

    const weaponName = isUnarmed ? 'Unarmed (Brawl)' : (selectedWeapon?.custom_name || refWeapon?.name || 'Attack')
    const label = `${attackType === 'ranged' ? 'Ranged' : 'Melee'} Attack — ${weaponName}`

    logRoll({
      campaignId: campaignId ?? '', characterId, characterName: character.name, label,
      pool: finalPool, result,
      meta: {
        rollType: 'combat', weaponName, rangeBand: selectedBand ?? undefined,
        weaponDamage: refWeapon?.damage ?? undefined, weaponDamageAdd: refWeapon?.damage_add ?? undefined,
        characterBrawn: character.brawn, attackType: attackType ?? 'ranged',
        critEligible: critEligibility.isEligible, critRating: critEligibility.critRating, critModifier: critEligibility.totalCritModifier,
      },
    })

    if (campaignId) {
      const supabase = createClient()
      let eid = encounterId ?? propEncounterId
      if (!eid) {
        const { data } = await supabase.from('combat_encounters').select('id').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single()
        eid = data?.id ?? null
        if (eid) setEncounterId(eid)
      }

      const summary = formatResultSummary(result, weaponName, undefined, selectedBand ?? undefined)
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: eid, participant_name: character.name,
        alignment: 'player', roll_type: `${attackType} attack`, weapon_name: weaponName,
        dice_pool: finalPool,
        result: { netSuccess: result.net.success, netAdvantage: result.net.advantage, triumph: result.net.triumph, despair: result.net.despair, succeeded: result.net.success > 0 },
        result_summary: summary,
        is_visible_to_players: true,
      })
      // No pending_damage insert — this prompt has no target-selection step
      // (per the prompt's own FLOW spec), so the same `selectedTargets.length > 0`
      // gate desktop uses is simply never satisfied here.
    }
  }, [finalPool, attackType, refWeapon, character.brawn, character.name, isUnarmed, selectedWeapon, campaignId, characterId, encounterId, propEncounterId, selectedBand])

  function handleRollAgain() {
    setRollResult(null)
    setAdjustments(EMPTY_ADJUSTMENTS)
    setDeckExtras(EMPTY_DECK_EXTRAS)
    setStep(attackType === 'ranged' ? 'range' : 'pool')
  }

  function handleNewAttack() {
    void writeWeaponToParticipant(null, null, null, null)
    resetAll()
  }

  if (!open) return null

  const primaryCrit: MobileCritInfo | null = rollResult
    ? { label: 'Critical Hit', eligibility: checkCriticalEligibility(rollResult, refWeapon, Math.max(0, (refWeapon?.damage ?? 0) + ((attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')) ? character.brawn : 0) + Math.max(0, rollResult.net.success))) }
    : null

  const netDamageEstimate = rollResult
    ? Math.max(0, (refWeapon?.damage ?? 0) + ((attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')) ? character.brawn : 0) + Math.max(0, rollResult.net.success))
    : null

  return createPortal(
    <div className="m-combat-root" data-mobile-shell="">
      <div className="m-combat-header">
        <span className="m-combat-title">{rollResult ? 'Attack Result' : 'Combat Check'}</span>
        <button type="button" className="m-icon-btn" onClick={handleClose} aria-label="Close">✕</button>
      </div>

      {!rollResult && (
        <div className="m-combat-rail">
          {steps.map((s, i) => (
            <span key={s} className={`m-combat-rail-step${i === stepIndex ? ' is-current' : i < stepIndex ? ' is-done' : ''}`}>
              {s === 'weapon' ? 'Weapon' : s === 'range' ? 'Range' : 'Pool'}{i < steps.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>
      )}

      <div className="m-combat-body">
        {rollResult ? (
          <MobileCombatResult
            result={rollResult}
            weaponName={isUnarmed ? 'Unarmed (Brawl)' : (selectedWeapon?.custom_name || refWeapon?.name || 'Attack')}
            netDamageEstimate={netDamageEstimate}
            crit={primaryCrit}
            onRollAgain={handleRollAgain}
            onNewAttack={handleNewAttack}
          />
        ) : step === 'weapon' ? (
          <MobileWeaponStep
            attackType={attackType}
            character={character}
            weapons={weapons}
            refWeaponMap={refWeaponMap}
            refSkillMap={refSkillMap}
            refWeaponQualityMap={refWeaponQualityMap}
            charSkills={charSkills}
            selectedWeapon={selectedWeapon}
            onSelect={handleSelectWeapon}
            dualWield={dualWield}
            onDualWieldChange={handleDualWieldChange}
            onEquipWeapon={handleEquipWeapon}
          />
        ) : step === 'range' && refWeapon ? (
          <MobileRangeStep
            skillKey={refWeapon.skill_key}
            maxRange={refWeapon.range_value ? (RANGE_VALUE_MAP[refWeapon.range_value] ?? 'extreme') : 'extreme'}
            selectedBand={selectedBand}
            onSelectBand={handleSelectBand}
            difficultyAdd={adjustments.difficultyAdd}
            onDeltaChange={handleRangeDelta}
          />
        ) : (
          <MobilePoolStep
            finalPool={finalPool}
            sheetBasePool={sheetBasePool}
            basePool={basePoolForApply}
            adjustments={adjustments}
            onAdjustmentsChange={setAdjustments}
            extras={deckExtras}
            onExtrasChange={setDeckExtras}
            difficultyFloor={-basePoolForApply.difficulty}
            deckExpanded={deckExpanded}
            onDeckExpandedChange={setDeckExpanded}
            onReset={handleResetAdjustments}
          />
        )}
      </div>

      {!rollResult && (
        <div className="m-combat-footer">
          {stepIndex > 0 && (
            <button
              type="button"
              className="m-sheet-btn"
              onClick={() => setStep(steps[stepIndex - 1])}
            >
              Back
            </button>
          )}
          <div className="m-combat-footer-sub">
            {!selectedWeapon ? 'Choose a weapon' : attackType === 'ranged' && !selectedBand ? 'Choose a range band' : totalDice === 0 ? 'Pool is empty' : railCaption}
          </div>
          {step !== 'pool' ? (
            <button
              type="button"
              className="m-sheet-btn is-primary"
              disabled={step === 'weapon' ? !selectedWeapon : !selectedBand}
              onClick={() => setStep(steps[stepIndex + 1])}
            >
              Next
            </button>
          ) : (
            <button type="button" className="m-sheet-btn is-primary" disabled={!canRoll} onClick={() => void handleRoll()}>
              Roll Dice
            </button>
          )}
        </div>
      )}
    </div>,
    document.body,
  )
}
