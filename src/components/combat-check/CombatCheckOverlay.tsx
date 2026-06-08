'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import { type RollMeta } from '@/lib/logRoll'
import { formatResultSummary, isRangedSkill, type RangeBand, RANGE_VALUE_MAP, RANGE_BAND_LABELS, MELEE_SKILL_KEYS } from '@/lib/combatCheckUtils'
import { checkCriticalEligibility, type CriticalEligibility } from '@/lib/criticalUtils'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality, SpeciesAbility } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { AdversaryInstance } from '@/lib/adversaries'
import { WeaponSelectStep } from './steps/WeaponSelectStep'
import { RangeBandStep } from './steps/RangeBandStep'
import { DicePoolReviewStep, type ManualAdjustments, EMPTY_ADJUSTMENTS, type DualWieldState } from './steps/DicePoolReviewStep'
import { DualWieldReviewStep } from './steps/DualWieldReviewStep'
import { RollResultStep } from './steps/RollResultStep'
import { HUD, FS, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'

// ── State ─────────────────────────────────────────────────────────────────────
interface CombatCheckState {
  currentStep:      number
  attackType:       'ranged' | 'melee' | null
  selectedWeapon:   CharacterWeapon | null
  selectedTargets:  AdversaryInstance[]
  selectedBand:     RangeBand | null
  adjustments:      ManualAdjustments
  rollResult:       RollResult | null
  encounterId:      string | null
  // Dual wield
  dualWield:        DualWieldState | null
  dualWieldReview:  boolean  // when true: show Step 2b instead of advancing to 3
}

function makeInitialState(initialAttackType: 'ranged' | 'melee' | null): CombatCheckState {
  return {
    currentStep:     2,
    attackType:      initialAttackType,
    selectedWeapon:  null,
    selectedTargets: [],
    selectedBand:    null,
    adjustments:     EMPTY_ADJUSTMENTS,
    rollResult:      null,
    encounterId:     null,
    dualWield:       null,
    dualWieldReview: false,
  }
}

// ── Accordion step container ──────────────────────────────────────────────────
function StepContainer({
  number, label,
  isActive, isDone, isLocked,
  doneSummary, children,
}: {
  number:       number
  label:        string
  isActive:     boolean
  isDone:       boolean
  isLocked:     boolean
  doneSummary?: string | null
  children?:    ReactNode
}) {
  return (
    <div
      style={{
        padding:       isActive ? `${SP[2]} ${SP[2]}` : `${SP[1]} ${SP[2]}`,
        borderLeft:    isActive
          ? `2px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`
          : '2px solid transparent',
        background:    isActive
          ? `color-mix(in srgb, var(--hud-gold) 4%, transparent)`
          : 'transparent',
        opacity:       isDone ? 0.6 : isLocked ? 0.3 : 1,
        pointerEvents: isLocked ? 'none' as const : undefined,
        marginBottom:  SP[1],
        borderRadius:  RADIUS.sm,
        transition:    `opacity ${EASE.quick}`,
      }}
    >
      <div style={{
        fontFamily:    FONT_BODY,
        fontSize:      FS.overline,
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color:         isActive ? 'var(--hud-gold)' : isDone ? HUD.textDim : HUD.textFaint,
        marginBottom:  (isActive || (isDone && doneSummary)) ? SP[1] : 0,
      }}>
        {number}. {label}{isDone ? ' ✓' : ''}
      </div>
      {isDone && doneSummary && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.overline,
          color:      HUD.textDim,
          fontStyle:  'italic',
        }}>
          {doneSummary}
        </div>
      )}
      {isActive && children}
    </div>
  )
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

  /** Group all GM-specific overrides — extend this object rather than adding top-level props */
  gmOverrides?: {
    isGmMode?:          boolean
    gmTargets?:         AdversaryInstance[]
    gmAlignment?:       string
    gmHiddenFromPlayers?: boolean
  }
  speciesAbilities?: SpeciesAbility[]
  speciesName?: string
  /** Pre-fetched active encounter ID from the parent — skips the combat_encounters SELECT on roll */
  encounterId?: string | null
  /** Pre-fetched encounter adversaries from the parent — skips the combat_encounters SELECT on target step */
  encounterEnemies?: AdversaryInstance[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CombatCheckOverlay({
  open, initialAttackType, onClose,
  character, weapons, charSkills,
  refWeaponMap, refSkillMap, refWeaponQualityMap,
  skillModifiers, campaignId, characterId, onRoll,
  gmOverrides,
  speciesAbilities = [], speciesName,
  encounterId: propEncounterId,
  encounterEnemies,
}: CombatCheckOverlayProps) {
  const { isGmMode, gmTargets, gmAlignment, gmHiddenFromPlayers } = gmOverrides ?? {}
  const [state, setState] = useState<CombatCheckState>(() => makeInitialState(initialAttackType))
  const [poolForRoll, setPoolForRoll] = useState<Record<string, number>>({})

  // Seed encounterId from prop so the combat_log write doesn't need a SELECT
  const seedEncounterId = propEncounterId ?? null

  // ── Reset state when overlay opens ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setState(makeInitialState(initialAttackType))
    }
  }, [open, initialAttackType])

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalSteps  = 5
  const initialStep = 2
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
    if (state.dualWieldReview) {
      // Back from Step 2b → return to weapon select, clear dual wield
      setState(s => ({ ...s, dualWieldReview: false, dualWield: null }))
      return
    }
    if (state.currentStep <= initialStep) return
    // Step 3 is collapsed into step 2 — skip it when going back
    const prevStep = state.currentStep === 4 ? 2 : state.currentStep - 1
    setState(s => ({ ...s, currentStep: prevStep, rollResult: null }))
  }

  const goNext = () => {
    if (state.dualWieldReview) {
      // Leaving Step 2b (dual wield confirmed) → write to DB then advance to Target
      const dw = state.dualWield
      if (dw) {
        const primaryName   = dw.primaryWeapon.custom_name   || refWeaponMap[dw.primaryWeapon.weapon_key]?.name   || null
        const secondaryName = dw.secondaryWeapon.custom_name || refWeaponMap[dw.secondaryWeapon.weapon_key]?.name || null
        void writeWeaponToParticipant(primaryName, secondaryName, dw.primaryWeapon.weapon_key, dw.secondaryWeapon.weapon_key)
      }
      setState(s => ({ ...s, dualWieldReview: false, currentStep: 4 }))
      return
    }
    // Advancing past the weapon-select step → write to DB
    if (state.currentStep === 2 && state.selectedWeapon) {
      const w = state.selectedWeapon
      const name = w.custom_name || refWeaponMap[w.weapon_key]?.name || null
      void writeWeaponToParticipant(name, null, w.weapon_key, null)
    }
    // Step 3 is collapsed into step 2 — skip it when advancing
    setState(s => ({ ...s, currentStep: s.currentStep === 2 ? 4 : Math.min(s.currentStep + 1, totalSteps) }))
  }

  // ── Write active weapon to combat_participants (GM view picks this up in real-time) ──
  const writeWeaponToParticipant = useCallback(async (
    primaryName: string | null,
    secondaryName: string | null = null,
    primaryKey: string | null = null,
    secondaryKey: string | null = null,
  ) => {
    if (isGmMode || !campaignId) return
    const supabase = createClient()
    await supabase
      .from('combat_participants')
      .update({
        active_weapon_name:    primaryName,
        active_weapon_key:     primaryKey,
        secondary_weapon_name: secondaryName,
        secondary_weapon_key:  secondaryKey,
      })
      .eq('campaign_id', campaignId)
      .eq('character_id', characterId)
  }, [isGmMode, campaignId, characterId])

  const handleEquipWeapon = useCallback(async (weaponId: string, idsToUnequip: string[]) => {
    const supabase = createClient()
    for (const id of idsToUnequip) {
      await supabase.from('character_weapons').update({ is_equipped: false, equip_state: 'stowed' }).eq('id', id)
    }
    await supabase.from('character_weapons').update({ is_equipped: true, equip_state: 'equipped' }).eq('id', weaponId)
  }, [])

  // Clear selected weapon on close so the GM sees equipped baseline again
  const handleClose = () => {
    void writeWeaponToParticipant(null, null, null, null)
    onClose()
  }

  const handleWeaponSelect = (w: CharacterWeapon | null) => {
    let derivedType = state.attackType
    if (w && !derivedType) {
      if (w.id === '__unarmed__') {
        derivedType = 'melee'
      } else {
        const ref = refWeaponMap[w.weapon_key]
        derivedType = ref?.skill_key ? (isRangedSkill(ref.skill_key) ? 'ranged' : 'melee') : 'ranged'
      }
    }
    setState(s => ({ ...s, selectedWeapon: w, attackType: w ? derivedType : initialAttackType, selectedBand: null, dualWield: null, dualWieldReview: false }))
  }

  // ── Dual wield handlers ───────────────────────────────────────────────────
  const handleDualWieldSelect = (primary: CharacterWeapon, secondary: CharacterWeapon) => {
    setState(s => ({
      ...s,
      dualWield: { enabled: true, primaryWeapon: primary, secondaryWeapon: secondary },
      dualWieldReview: true,
    }))
  }

  const handleDualWieldSwap = () => {
    setState(s => {
      if (!s.dualWield) return s
      return {
        ...s,
        dualWield: {
          ...s.dualWield,
          primaryWeapon:   s.dualWield.secondaryWeapon,
          secondaryWeapon: s.dualWield.primaryWeapon,
        },
        selectedWeapon: s.dualWield.secondaryWeapon,
      }
    })
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

    onRoll(result, label, pool, {
      rollType:       'combat',
      weaponName,
      targetName:     targetName ?? undefined,
      rangeBand:      state.selectedBand ?? undefined,
      weaponDamage:    refWeapon?.damage ?? undefined,
      weaponDamageAdd: refWeapon?.damage_add ?? undefined,
      characterBrawn:  character.brawn,
      attackType:      state.attackType ?? 'ranged',
      critEligible:   critEligibility.isEligible,
      critRating:     critEligibility.critRating,
      critModifier:   critEligibility.totalCritModifier,
    })

    if (campaignId) {
      const supabase = createClient()
      let encounterId = state.encounterId ?? seedEncounterId
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
        is_visible_to_players: isGmMode ? !gmHiddenFromPlayers : true,
      })

      const netSuccesses = result.net.success
      if (netSuccesses > 0 && state.selectedTargets.length > 0 && encounterId) {
        const isMelee = state.attackType === 'melee' || MELEE_SKILL_KEYS.includes(refWeapon?.skill_key ?? '')
        const baseDamage = refWeapon?.damage ?? 0
        const damageAdd  = isMelee ? (refWeapon?.damage_add ?? 0) : 0
        const brawnBonus = isMelee ? character.brawn : 0

        const pendingRows: Record<string, unknown>[] = []

        const secRef = state.dualWield?.enabled && state.dualWield.secondaryWeapon.weapon_key !== '__unarmed__'
          ? (refWeaponMap[state.dualWield.secondaryWeapon.weapon_key] ?? null)
          : null
        const secIsMelee = secRef ? MELEE_SKILL_KEYS.includes(secRef.skill_key ?? '') : false
        const secBase    = secRef ? (secIsMelee ? (secRef.damage_add ?? 0) : (secRef.damage ?? 0)) : 0
        const secBrawn   = secIsMelee ? character.brawn : 0
        const secWeaponName = state.dualWield?.secondaryWeapon
          ? (state.dualWield.secondaryWeapon.custom_name || secRef?.name || 'Secondary Weapon')
          : null

        for (const target of state.selectedTargets) {
          const rawDamage = baseDamage + brawnBonus + damageAdd + netSuccesses
          const soakValue = target.soak ?? 0
          const netDamage = Math.max(0, rawDamage - soakValue)
          const critPerTarget = checkCriticalEligibility(result, refWeapon, netDamage)

          pendingRows.push({
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
          })

          if (state.dualWield?.enabled && secRef) {
            const secRaw    = secBase + secBrawn + netSuccesses
            const secNet    = Math.max(0, secRaw - soakValue)
            const secCrit   = checkCriticalEligibility(result, secRef, secNet)
            pendingRows.push({
              campaign_id:               campaignId,
              encounter_id:              encounterId,
              target_instance_id:        target.instanceId,
              attacker_name:             character.name,
              target_name:               target.name,
              raw_damage:                secRaw,
              soak_value:                soakValue,
              net_damage:                secNet,
              status:                    'pending_secondary',
              weapon_name:               secWeaponName,
              attack_type:               state.attackType ?? 'ranged',
              range_band:                state.selectedBand ?? null,
              crit_eligible:             secCrit.isEligible,
              crit_rating:               secCrit.critRating,
              crit_modifier:             secCrit.totalCritModifier,
              crit_triggered_by_triumph: secCrit.triggeredByTriumph,
            })
          }
        }

        await supabase.from('pending_damage').insert(pendingRows)
      }
    }
  }, [state, refWeapon, refWeaponMap, campaignId, character.name, character.brawn, onRoll, seedEncounterId])

  // ── Roll Again: reset to step 4, keep weapon/target/dual wield ───────────
  const handleRollAgain = () => {
    setState(s => ({
      ...s,
      currentStep:     4,
      adjustments:     EMPTY_ADJUSTMENTS,
      rollResult:      null,
      dualWieldReview: false,
    }))
  }

  // ── New Attack: reset everything and clear selected weapon from GM view ──────
  const handleNewAttack = () => {
    void writeWeaponToParticipant(null, null, null, null)
    setState(makeInitialState(initialAttackType))
  }

  // ── Can advance? ──────────────────────────────────────────────────────────
  function canAdvance(): boolean {
    if (state.dualWieldReview) return true
    switch (state.currentStep) {
      case 2: return state.selectedWeapon !== null && state.attackType !== null
      case 3: return true
      case 4: return state.selectedBand !== null || state.attackType === 'melee'
      default: return false
    }
  }

  // ── Derived: secondary refWeapon (for dual wield result display) ──────────
  const secondaryRefWeapon: RefWeapon | null = (state.dualWield?.secondaryWeapon &&
    state.dualWield.secondaryWeapon.weapon_key !== '__unarmed__')
    ? (refWeaponMap[state.dualWield.secondaryWeapon.weapon_key] ?? null)
    : null

  // ── Derived summaries for accordion done states ───────────────────────────
  const weaponDisplayName = state.selectedWeapon?.id === '__unarmed__'
    ? 'Unarmed'
    : (state.selectedWeapon?.custom_name || refWeapon?.name || null)
  const targetDisplayName = state.selectedTargets.length === 1
    ? state.selectedTargets[0].name
    : state.selectedTargets.length > 1
    ? `${state.selectedTargets.length} targets`
    : null
  const step1DoneSummary = [weaponDisplayName, targetDisplayName].filter(Boolean).join(' → ')

  const step2DoneSummary = state.selectedBand
    ? state.attackType === 'melee'
      ? `✓ Opposed · ${state.selectedTargets[0]?.name ?? 'Target'}`
      : `✓ ${RANGE_BAND_LABELS[state.selectedBand]}`
    : undefined

  const visualStep =
    state.currentStep <= 3 ? 1 :
    state.currentStep === 4 ? 2 :
    3

  const totalDiceForRoll = Object.values(poolForRoll).reduce((s, n) => s + Math.max(0, n), 0)

  return (
    <div
      className={`hud-quick-drawer${open ? ' open' : ''}`}
      style={{
        background:           'var(--hud-surface-hi)',
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight:          '1px solid var(--hud-border)',
        display:              'flex',
        flexDirection:        'column',
      }}
    >

      {/* ── Compact header strip ────────────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          SP[2],
        padding:      `${SP[2]} ${SP[3]}`,
        borderBottom: '1px solid var(--hud-border)',
        background:   'var(--hud-panel)',
        flexShrink:   0,
      }}>
        <span style={{ color: 'var(--hud-text-faint)', fontSize: FS.sm, lineHeight: 1 }}>⌖</span>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.label,
          fontWeight:    700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color:         'var(--hud-text)',
          flex:          1,
        }}>
          {isResult ? 'Attack Result' : state.dualWield?.enabled ? 'Dual Wield Attack' : 'Combat Check'}
        </span>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      'var(--hud-text-faint)',
            fontSize:   FS.sm,
            padding:    `0 ${SP[1]}`,
            lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        {/* Roll result */}
        {isResult && state.rollResult && (
          <div style={{ padding: `${SP[3]} ${SP[3]}` }}>
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
              dualWield={state.dualWield}
              dualWieldSecondaryRef={secondaryRefWeapon}
            />
          </div>
        )}

        {/* Dual wield review (step 2b) */}
        {!isResult && state.dualWieldReview && state.dualWield && (
          <div style={{ padding: `${SP[3]} ${SP[3]}` }}>
            <DualWieldReviewStep
              primaryWeapon={state.dualWield.primaryWeapon}
              secondaryWeapon={state.dualWield.secondaryWeapon}
              primaryRef={refWeapon}
              secondaryRef={secondaryRefWeapon}
              onSwap={handleDualWieldSwap}
            />
          </div>
        )}

        {/* Accordion steps */}
        {!isResult && !state.dualWieldReview && (
          <div style={{ padding: `${SP[2]} ${SP[2]}` }}>

            {/* Visual Step 1 — Weapon + Target */}
            <StepContainer
              number={1}
              label="Weapon & Target"
              isActive={state.currentStep === 2}
              isDone={state.currentStep >= 4}
              isLocked={state.currentStep < 2}
              doneSummary={step1DoneSummary || undefined}
            >
              {state.currentStep === 2 && (
                <>
                  <WeaponSelectStep
                    attackType={state.attackType}
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
                    onEquipWeapon={handleEquipWeapon}
                    onDualWieldSelect={handleDualWieldSelect}
                  />
                  {state.selectedWeapon && (
                    <div style={{ marginTop: SP[2] }}>
                      <div style={{
                        fontSize:      FS.overline,
                        fontWeight:    700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase' as const,
                        color:         'var(--hud-text-faint)',
                        marginBottom:  SP[1],
                        fontFamily:    FONT_BODY,
                      }}>
                        Target (optional)
                      </div>
                      {(encounterEnemies ?? []).length === 0 ? (
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
                          No enemies in encounter.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: SP[1] }}>
                          {(encounterEnemies ?? []).map(enemy => {
                            const selected = state.selectedTargets.some(t => t.instanceId === enemy.instanceId)
                            return (
                              <button
                                key={enemy.instanceId}
                                onClick={() => handleTargetSelect(
                                  selected
                                    ? state.selectedTargets.filter(t => t.instanceId !== enemy.instanceId)
                                    : [...state.selectedTargets, enemy]
                                )}
                                style={{
                                  border:       selected
                                    ? `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`
                                    : `1px solid var(--hud-border)`,
                                  background:   selected
                                    ? `color-mix(in srgb, var(--hud-accent) 10%, transparent)`
                                    : 'transparent',
                                  color:        selected ? 'var(--hud-text)' : 'var(--hud-text-dim)',
                                  padding:      `2px ${SP[2]}`,
                                  fontSize:     FS.overline,
                                  fontWeight:   700,
                                  borderRadius: RADIUS.sm,
                                  cursor:       'pointer',
                                  fontFamily:   FONT_BODY,
                                  transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
                                }}
                              >
                                {enemy.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </StepContainer>

            {/* Visual Step 2 — Range */}
            <StepContainer
              number={2}
              label={state.attackType === 'melee' ? 'Melee' : 'Range Band'}
              isActive={state.currentStep === 4}
              isDone={state.currentStep >= 5}
              isLocked={state.currentStep < 4}
              doneSummary={step2DoneSummary}
            >
              {state.currentStep === 4 && state.attackType && (
                <RangeBandStep
                  attackType={state.attackType}
                  weapon={refWeapon ? { skillKey: refWeapon.skill_key ?? '', refWeapon } : null}
                  selectedBand={state.selectedBand}
                  targets={state.selectedTargets}
                  onSelect={handleBandSelect}
                />
              )}
            </StepContainer>

            {/* Visual Step 3 — Dice Pool + Roll */}
            <StepContainer
              number={3}
              label="Dice Pool"
              isActive={state.currentStep === 5}
              isDone={false}
              isLocked={state.currentStep < 5}
            >
              {state.currentStep === 5 && (
                <>
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
                    onPoolChange={setPoolForRoll}
                    dualWield={state.dualWield}
                    refWeaponMap={refWeaponMap}
                    refSkillMap={refSkillMap}
                    speciesAbilities={speciesAbilities}
                    speciesName={speciesName}
                  />
                  <button
                    onClick={() => handleRoll(poolForRoll)}
                    disabled={totalDiceForRoll === 0}
                    style={{
                      width:         '100%',
                      marginTop:     SP[2],
                      padding:       `${SP[2]} 0`,
                      background:    `color-mix(in srgb, var(--hud-accent) 18%, transparent)`,
                      border:        `1px solid color-mix(in srgb, var(--hud-accent) 45%, transparent)`,
                      borderRadius:  RADIUS.md,
                      cursor:        totalDiceForRoll === 0 ? 'not-allowed' : 'pointer',
                      opacity:       totalDiceForRoll === 0 ? 0.4 : 1,
                      fontFamily:    FONT_BODY,
                      fontSize:      FS.sm,
                      fontWeight:    700,
                      color:         'var(--hud-text)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      transition:    `opacity ${EASE.quick}`,
                    }}
                  >
                    Roll {totalDiceForRoll} Dice
                  </button>
                </>
              )}
            </StepContainer>

            {/* Dot progress indicator */}
            <div style={{
              display:        'flex',
              justifyContent: 'center',
              gap:            SP[1],
              padding:        `${SP[2]} 0`,
            }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  width:        6,
                  height:       6,
                  borderRadius: RADIUS.full,
                  background:   visualStep >= n ? 'var(--hud-gold)' : 'var(--hud-border)',
                  opacity:      visualStep > n ? 0.5 : visualStep === n ? 1 : 0.3,
                  transition:   `background ${EASE.quick}, opacity ${EASE.quick}`,
                }} />
              ))}
            </div>

          </div>
        )}
      </div>

      {/* ── Footer — Next button (steps 2–4 and step 2b) ─────────────────────── */}
      {!isResult && (state.dualWieldReview || (state.currentStep >= 2 && state.currentStep <= 4)) && (
        <div style={{
          padding:    `${SP[2]} ${SP[3]}`,
          borderTop:  '1px solid var(--hud-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            style={{
              width:         '100%',
              padding:       `${SP[2]} 0`,
              borderRadius:  RADIUS.md,
              border:        `1px solid color-mix(in srgb, var(--hud-accent) ${canAdvance() ? 45 : 20}%, transparent)`,
              cursor:        canAdvance() ? 'pointer' : 'not-allowed',
              fontFamily:    FONT_BODY,
              fontSize:      FS.label,
              fontWeight:    700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              background:    canAdvance()
                ? `color-mix(in srgb, var(--hud-accent) 18%, transparent)`
                : `color-mix(in srgb, var(--hud-accent) 6%, transparent)`,
              color:         canAdvance() ? 'var(--hud-text)' : 'var(--hud-text-faint)',
              transition:    `background ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            {state.dualWieldReview ? 'Continue →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
