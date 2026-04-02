'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import { type RollMeta } from '@/lib/logRoll'
import { formatResultSummary, type RangeBand, RANGE_VALUE_MAP, MELEE_SKILL_KEYS } from '@/lib/combatCheckUtils'
import { checkCriticalEligibility, type CriticalEligibility } from '@/lib/criticalUtils'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { AdversaryInstance } from '@/lib/adversaries'
import { AttackTypeStep } from './steps/AttackTypeStep'
import { WeaponSelectStep } from './steps/WeaponSelectStep'
import { TargetSelectStep } from './steps/TargetSelectStep'
import { RangeBandStep } from './steps/RangeBandStep'
import { DicePoolReviewStep, type ManualAdjustments, EMPTY_ADJUSTMENTS } from './steps/DicePoolReviewStep'
import { RollResultStep } from './steps/RollResultStep'

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG       = 'rgba(6,13,9,0.97)'
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.45)'
const GOLD_BD  = 'rgba(200,170,80,0.15)'
const GOLD_BAR = 'rgba(200,170,80,0.6)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.5)'
const FONT_C   = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Share Tech Mono', 'Courier New', monospace"

// ── Step labels ───────────────────────────────────────────────────────────────
const STEP_LABELS: Record<number, string> = {
  1: 'Attack Type',
  2: 'Weapon',
  3: 'Target',
  4: 'Range',
  5: 'Dice Pool',
}

// ── State ─────────────────────────────────────────────────────────────────────
interface CombatCheckState {
  currentStep:     number
  attackType:      'ranged' | 'melee' | null
  selectedWeapon:  CharacterWeapon | null
  selectedTargets: AdversaryInstance[]
  selectedBand:    RangeBand | null
  adjustments:     ManualAdjustments
  rollResult:      RollResult | null
  encounterId:     string | null
}

function makeInitialState(initialAttackType: 'ranged' | 'melee' | null): CombatCheckState {
  return {
    currentStep:     initialAttackType ? 2 : 1,
    attackType:      initialAttackType,
    selectedWeapon:  null,
    selectedTargets: [],
    selectedBand:    null,
    adjustments:     EMPTY_ADJUSTMENTS,
    rollResult:      null,
    encounterId:     null,
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface CombatCheckOverlayProps {
  open:             boolean
  initialAttackType: 'ranged' | 'melee' | null
  onClose:          () => void

  character:          Character
  weapons:            CharacterWeapon[]
  charSkills:         CharacterSkill[]
  refWeaponMap:       Record<string, RefWeapon>
  refSkillMap:        Record<string, RefSkill>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  skillModifiers:     Record<string, SkillDiceModifier>
  campaignId:         string | null
  characterId:        string

  onRoll: (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => void

  /** GM mode: suppresses DB weapon equip/unequip writes and adjusts targeting */
  isGmMode?:   boolean
  /** Pre-built targets to show in TargetSelectStep instead of fetching from DB */
  gmTargets?:  AdversaryInstance[]
  /** Alignment override for combat_log writes (default: 'player') */
  gmAlignment?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CombatCheckOverlay({
  open, initialAttackType, onClose,
  character, weapons, charSkills,
  refWeaponMap, refSkillMap, refWeaponQualityMap,
  skillModifiers, campaignId, characterId, onRoll,
  isGmMode, gmTargets, gmAlignment,
}: CombatCheckOverlayProps) {
  const [state, setState] = useState<CombatCheckState>(() => makeInitialState(initialAttackType))
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // ── Slide animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setMounted(true)
      // Trigger animation after mount
      const t = requestAnimationFrame(() => { requestAnimationFrame(() => setVisible(true)) })
      return () => cancelAnimationFrame(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 260)
      return () => clearTimeout(t)
    }
  }, [open])

  // ── Reset state when overlay opens ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setState(makeInitialState(initialAttackType))
    }
  }, [open, initialAttackType])

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalSteps  = state.attackType || state.currentStep > 1 ? 5 : 5
  const initialStep = initialAttackType ? 2 : 1
  const isResult    = state.rollResult !== null

  const refWeapon: RefWeapon | null = state.selectedWeapon && state.selectedWeapon.id !== '__unarmed__'
    ? (refWeaponMap[state.selectedWeapon.weapon_key] ?? null)
    : null
  const refSkill: RefSkill | null = refWeapon?.skill_key ? (refSkillMap[refWeapon.skill_key] ?? null) : null

  // ── Derived crit eligibility (not state — pure function of existing state) ──
  const critEligibility = (() => {
    if (!state.rollResult) return null
    const isMelee  = state.attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')
    const rawDmg   = (refWeapon?.damage ?? 0) + (isMelee ? character.brawn : 0) + Math.max(0, state.rollResult.net.success)
    const minSoak  = state.selectedTargets.length > 0
      ? Math.min(...state.selectedTargets.map(t => t.soak ?? 0))
      : 0
    return checkCriticalEligibility(state.rollResult, refWeapon, Math.max(0, rawDmg - minSoak))
  })()

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = () => {
    if (state.currentStep <= initialStep) return
    setState(s => ({ ...s, currentStep: s.currentStep - 1, rollResult: null }))
  }

  const goNext = () => {
    setState(s => ({ ...s, currentStep: Math.min(s.currentStep + 1, totalSteps) }))
  }

  // ── Step change handlers ───────────────────────────────────────────────────
  const handleAttackType = (type: 'ranged' | 'melee') => {
    setState(s => ({ ...s, attackType: type, currentStep: 2 }))
  }

  const handleWeaponSelect = (w: CharacterWeapon | null) => {
    setState(s => ({ ...s, selectedWeapon: w, selectedBand: null }))
  }

  const handleTargetSelect = (targets: AdversaryInstance[]) => {
    setState(s => ({ ...s, selectedTargets: targets }))
  }

  const handleBandSelect = (band: RangeBand) => {
    setState(s => ({ ...s, selectedBand: band }))
  }

  const handleAdjustChange = (adj: ManualAdjustments) => {
    setState(s => ({ ...s, adjustments: adj }))
  }

  // ── Roll execution ─────────────────────────────────────────────────────────
  const handleRoll = useCallback(async (pool: Record<string, number>) => {
    const result = rollPool(pool as Parameters<typeof rollPool>[0])
    setState(s => ({ ...s, rollResult: result }))

    // ── Critical hit eligibility (for roll feed meta) ────────────────────────
    const isMeleeCheck = state.attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')
    const rawDmgCheck  = (refWeapon?.damage ?? 0) + (isMeleeCheck ? character.brawn : 0) + Math.max(0, result.net.success)
    const minSoak      = state.selectedTargets.length > 0
      ? Math.min(...state.selectedTargets.map(t => t.soak ?? 0))
      : 0
    const netDmgCheck    = Math.max(0, rawDmgCheck - minSoak)
    const critEligibility = checkCriticalEligibility(result, refWeapon, netDmgCheck)

    const weaponName = state.selectedWeapon?.id === '__unarmed__'
      ? 'Unarmed (Brawl)'
      : (state.selectedWeapon?.custom_name || refWeapon?.name || 'Attack')
    const targetName = state.selectedTargets.length === 1
      ? state.selectedTargets[0].name
      : state.selectedTargets.length > 1
      ? `${state.selectedTargets.length} targets`
      : undefined
    const label = `${state.attackType === 'ranged' ? 'Ranged' : 'Melee'} Attack — ${weaponName}${targetName ? ` vs ${targetName}` : ''}`

    // Fire to roll feed with combat-specific metadata for type-specific card rendering
    onRoll(result, label, pool, {
      rollType:       'combat',
      weaponName,
      targetName:     targetName ?? undefined,
      rangeBand:      state.selectedBand ?? undefined,
      weaponDamage:   refWeapon?.damage ?? undefined,
      characterBrawn: character.brawn,
      attackType:     state.attackType ?? 'ranged',
      critEligible:   critEligibility.isEligible,
      critRating:     critEligibility.critRating,
      critModifier:   critEligibility.totalCritModifier,
    })

    // Write to combat_log if in an encounter
    if (campaignId) {
      const supabase = createClient()
      // Get active encounter id if we don't have it yet
      let encounterId = state.encounterId
      if (!encounterId) {
        const { data } = await supabase
          .from('combat_encounters')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('is_active', true)
          .limit(1)
          .single()
        encounterId = data?.id ?? null
        if (encounterId) setState(s => ({ ...s, encounterId }))
      }

      const summary = formatResultSummary(result, weaponName, targetName, state.selectedBand ?? undefined)
      await supabase.from('combat_log').insert({
        campaign_id:           campaignId,
        encounter_id:          encounterId,
        participant_name:      character.name,
        alignment:             gmAlignment ?? 'player',
        roll_type:             `${state.attackType} attack`,
        weapon_name:           weaponName,
        dice_pool:             pool,
        result: {
          netSuccess:   result.net.success,
          netAdvantage: result.net.advantage,
          triumph:      result.net.triumph,
          despair:      result.net.despair,
          succeeded:    result.net.success > 0,
        },
        result_summary:        summary,
        is_visible_to_players: true,
      })

      // ── Pending damage: create one row per target on a successful hit ────────
      const netSuccesses = result.net.success
      if (netSuccesses > 0 && state.selectedTargets.length > 0 && encounterId) {
        const isMelee = state.attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')
        const baseDamage = refWeapon?.damage ?? 0
        const brawnBonus = isMelee ? character.brawn : 0

        const pendingRows = state.selectedTargets.map(target => {
          const rawDamage = baseDamage + brawnBonus + netSuccesses
          const soakValue = target.soak ?? 0
          const netDamage = Math.max(0, rawDamage - soakValue)
          const critPerTarget = checkCriticalEligibility(result, refWeapon, netDamage)
          return {
            campaign_id:               campaignId,
            encounter_id:              encounterId,
            target_instance_id:        target.instanceId,
            attacker_name:             character.name,
            target_name:               target.name,
            raw_damage:                rawDamage,
            soak_value:                soakValue,
            net_damage:                netDamage,
            status:                    'pending',
            weapon_name:               weaponName,
            attack_type:               state.attackType ?? 'ranged',
            range_band:                state.selectedBand ?? null,
            crit_eligible:             critPerTarget.isEligible,
            crit_rating:               critPerTarget.critRating,
            crit_modifier:             critPerTarget.totalCritModifier,
            crit_triggered_by_triumph: critPerTarget.triggeredByTriumph,
          }
        })
        await supabase.from('pending_damage').insert(pendingRows)
      }
    }
  }, [state, refWeapon, campaignId, character.name, character.brawn, onRoll])

  // ── Roll Again: reset to step 4, keep weapon/target ───────────────────────
  const handleRollAgain = () => {
    setState(s => ({
      ...s,
      currentStep: 4,
      adjustments: EMPTY_ADJUSTMENTS,
      rollResult: null,
    }))
  }

  // ── New Attack: reset everything ──────────────────────────────────────────
  const handleNewAttack = () => {
    setState(makeInitialState(initialAttackType))
  }

  // ── Can advance? ──────────────────────────────────────────────────────────
  function canAdvance(): boolean {
    switch (state.currentStep) {
      case 1: return state.attackType !== null
      case 2: return state.selectedWeapon !== null
      case 3: return true  // target is optional (skip allowed)
      case 4: return state.selectedBand !== null || state.attackType === 'melee'
      default: return false
    }
  }

  if (!mounted) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, height: '100dvh',
        width: 'clamp(380px, 35vw, 480px)',
        background: BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: `1px solid rgba(200,170,80,0.25)`,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        zIndex: 150,
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: visible
          ? 'transform 300ms cubic-bezier(0.16,1,0.3,1)'
          : 'transform 250ms ease-in',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${GOLD_BD}`,
        display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button */}
          <button
            onClick={goBack}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px',
              fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: GOLD_DIM,
              visibility: (!isResult && state.currentStep > initialStep) ? 'visible' : 'hidden',
            }}
          >
            ← Back
          </button>

          {/* Title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
              fontWeight: 700,
              color: GOLD,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {isResult
                ? 'Attack Result'
                : state.attackType === 'ranged' ? 'Ranged Attack'
                : state.attackType === 'melee'  ? 'Melee Attack'
                : 'Combat Check'}
            </div>
            {!isResult && (
              <div style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                color: GOLD_DIM,
                marginTop: 2,
              }}>
                Step {state.currentStep} of {totalSteps} — {STEP_LABELS[state.currentStep]}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px',
              fontFamily: FONT_M, fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', color: TEXT_DIM,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!isResult && (
        <div style={{ height: 4, background: 'rgba(200,170,80,0.1)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${(state.currentStep / totalSteps) * 100}%`,
            background: GOLD_BAR,
            transition: 'width 200ms ease',
          }} />
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', overscrollBehavior: 'contain' }}>
        {isResult && state.rollResult && (
          <RollResultStep
            result={state.rollResult}
            attackType={state.attackType ?? 'ranged'}
            weapon={state.selectedWeapon}
            refWeapon={refWeapon}
            targets={state.selectedTargets}
            rangeBand={state.selectedBand}
            characterBrawn={character.brawn}
            critEligibility={critEligibility}
            onRollAgain={handleRollAgain}
            onNewAttack={handleNewAttack}
          />
        )}

        {!isResult && state.currentStep === 1 && (
          <AttackTypeStep onSelect={handleAttackType} />
        )}

        {!isResult && state.currentStep === 2 && (
          <WeaponSelectStep
            attackType={state.attackType ?? 'ranged'}
            character={character}
            weapons={weapons}
            refWeaponMap={refWeaponMap}
            refSkillMap={refSkillMap}
            refWeaponQualityMap={refWeaponQualityMap}
            charSkills={charSkills}
            selectedWeapon={state.selectedWeapon}
            onSelect={handleWeaponSelect}
            onNext={goNext}
            isGmMode={isGmMode}
          />
        )}

        {!isResult && state.currentStep === 3 && (
          <TargetSelectStep
            campaignId={campaignId}
            attackType={state.attackType ?? 'ranged'}
            selectedTargets={state.selectedTargets}
            onSelect={handleTargetSelect}
            gmTargets={gmTargets}
          />
        )}

        {!isResult && state.currentStep === 4 && state.attackType && (
          <RangeBandStep
            attackType={state.attackType}
            weapon={refWeapon ? { skillKey: refWeapon.skill_key ?? '', refWeapon } : null}
            selectedBand={state.selectedBand}
            onSelect={handleBandSelect}
          />
        )}

        {!isResult && state.currentStep === 5 && (
          <DicePoolReviewStep
            attackType={state.attackType ?? 'ranged'}
            character={character}
            weapon={state.selectedWeapon}
            refWeapon={refWeapon}
            refSkill={refSkill}
            charSkills={charSkills}
            targets={state.selectedTargets}
            rangeBand={state.selectedBand}
            skillModifiers={skillModifiers}
            adjustments={state.adjustments}
            onAdjustChange={handleAdjustChange}
            onRoll={handleRoll}
          />
        )}
      </div>

      {/* ── Footer (Next button, steps 2-4 only) ── */}
      {!isResult && state.currentStep >= 2 && state.currentStep <= 4 && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${GOLD_BD}`, flexShrink: 0 }}>
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            style={{
              width: '100%', height: 48, borderRadius: 10,
              border: 'none', cursor: canAdvance() ? 'pointer' : 'not-allowed',
              fontFamily: FONT_C,
              fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: canAdvance()
                ? 'linear-gradient(135deg, #C8AA50, #8B7430)'
                : 'rgba(200,170,80,0.15)',
              color: canAdvance() ? '#060D09' : 'rgba(200,170,80,0.4)',
              transition: 'background 150ms',
            }}
          >
            {state.currentStep === 3 && state.selectedTargets.length === 0 ? 'Skip / Next' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
