'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { createClient } from '@/lib/supabase/client'
import { rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import { type RollMeta } from '@/lib/logRoll'
import { formatResultSummary, isRangedSkill, getMeleeDifficulty, type RangeBand, RANGE_BAND_LABELS, MELEE_SKILL_KEYS } from '@/lib/combatCheckUtils'
import { checkCriticalEligibility } from '@/lib/criticalUtils'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality, SpeciesAbility } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { AdversaryInstance } from '@/lib/adversaries'
import { WeaponSelectStep, type WeaponManeuvers } from './steps/WeaponSelectStep'
import { RangeBandStep } from './steps/RangeBandStep'
import { DicePoolReviewStep, type ManualAdjustments, EMPTY_ADJUSTMENTS, type DualWieldState } from './steps/DicePoolReviewStep'
import { DualWieldReviewStep } from './steps/DualWieldReviewStep'
import { RollResultStep } from './steps/RollResultStep'
import { FS, FONT_BODY, SP, RADIUS, Z, MODAL, DICE_META, DICE_COLOR, DICE_OUTLINE } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'
import { igniteModalOpen, igniteModalClose, IGNITE_EXIT_MS } from '@/lib/utils'

// ── Dice tray constants ────────────────────────────────────────────────────────
const CLIP_OCTAGON = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
const CLIP_DIAMOND = 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'

function DiceTrayDie({ type }: { type: keyof typeof DICE_META }) {
  const meta = DICE_META[type]
  const sz = meta.shape === 'diamond' ? 30 : 34 /* die icon size */
  return (
    <div
      className="cc-die"
      style={{
        width:        sz,
        height:       sz,
        background:   meta.color, /* die-identity hex — sealed namespace, Pixi-canvas approved */
        clipPath:     meta.shape === 'octagon' ? CLIP_OCTAGON : meta.shape === 'diamond' ? CLIP_DIAMOND : undefined,
        borderRadius: meta.shape === 'rounded' ? RADIUS.sm : undefined,
      }}
    />
  )
}

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

// ── Flat section header (replaces accordion StepContainer) ───────────────────
// ── Focus-console dice stepper ───────────────────────────────────────────────
// One row of the Adjust Pool grid. On the two upgrade rows the minus is an
// explicit "undo the upgrade" rather than a generic decrement, and is disabled
// (a no-op) at zero.
function FcStepper({
  dieColor, dieEdge, dieShape, name, sub, value, onAdd, onRemove, canRemove,
  isUpgrade = false, downgradeLabel,
}: {
  dieColor:   string
  dieEdge?:   string
  dieShape:   'octagon' | 'diamond' | 'rounded'
  name:       string
  sub?:       string
  value:      number
  onAdd:      () => void
  onRemove:   () => void
  canRemove:  boolean
  isUpgrade?: boolean
  downgradeLabel?: string
}) {
  const sz = dieShape === 'diamond' ? 15 : 16 /* die glyph size — geometry, not spacing */
  return (
    <div className={`fc-dstep${isUpgrade ? ' is-upgrade' : ''}`}>
      <span style={{
        width:        sz,
        height:       sz,
        flexShrink:   0,
        background:   dieColor, /* die-identity hex — sealed namespace */
        border:       dieShape === 'rounded' && dieEdge ? `1px solid ${dieEdge}` : undefined,
        boxShadow:    dieShape !== 'rounded' && dieEdge ? `0 0 0 1px ${dieEdge}` : undefined,
        borderRadius: dieShape === 'rounded' ? RADIUS.sm : undefined,
        clipPath:     dieShape === 'octagon' ? CLIP_OCTAGON : dieShape === 'diamond' ? CLIP_DIAMOND : undefined,
      }} />
      <span className="fc-dstep-meta">
        <span className="fc-dstep-name">{name}</span>
        {sub && <span className="fc-dstep-sub">{sub}</span>}
      </span>
      <button
        type="button"
        className={`fc-stepbtn${downgradeLabel ? ' is-downgrade' : ''}`}
        onClick={onRemove}
        disabled={!canRemove}
        title={downgradeLabel ?? `Remove ${name}`}
      >
        {downgradeLabel ? `↓ ${downgradeLabel}` : '−'}
      </button>
      <span className="fc-dstep-count">{value}</span>
      <button
        type="button"
        className="fc-stepbtn is-add"
        onClick={onAdd}
        title={isUpgrade ? `Upgrade — ${name}` : `Add ${name}`}
      >
        {isUpgrade ? '↑' : '+'}
      </button>
    </div>
  )
}

// ── Stage header ─────────────────────────────────────────────────────────────
// Module scope on purpose: a component declared inside the panel body would be
// a new type on every render.
function StageHead({ n, name, summary, done, locked, openStage, onOpen }: {
  n: number; name: string; summary?: string; done: boolean; locked: boolean
  openStage: number; onOpen: (n: number) => void
}) {
  return (
    <button
      type="button"
      className="fc-stage-head"
      onClick={() => { if (!locked) onOpen(n) }}
    >
      <span className="fc-stage-num">{done ? '✓' : n}</span>
      <span className="fc-stage-name">{name}</span>
      {done && summary && openStage !== n && <span className="fc-stage-summary">{summary}</span>}
    </button>
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
  const { isGmMode, gmTargets, gmAlignment } = gmOverrides ?? {}
  const [state, setState] = useState<CombatCheckState>(() => makeInitialState(initialAttackType))
  const [poolForRoll, setPoolForRoll] = useState<Record<string, number>>({})

  // ── Maneuver toggle state (separate from ManualAdjustments so DSS steppers stay independent) ──
  const [aimBoosts,    setAimBoosts]    = useState(0)    // 0, 1, or 2
  const [assistActive, setAssistActive] = useState(false)
  const [guardedActive, setGuardedActive] = useState(false)

  // ── Presentational state (focus-console redesign) ──────────────────────
  // Which stage is visually expanded. Purely a view concern — `currentStep`
  // and every other CombatCheckState field keep their existing semantics.
  const [openStage, setOpenStage] = useState(1)
  const prefersReducedMotion = usePrefersReducedMotion()
  const trayRef  = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)
  const igniteTlRef = useRef<gsap.core.Timeline | null>(null)
  const s2Ref   = useRef<HTMLDivElement>(null)

  // Seed encounterId from prop so the combat_log write doesn't need a SELECT
  const seedEncounterId = propEncounterId ?? null

  // ── Reset state when overlay opens ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setState(makeInitialState(initialAttackType))
      setAimBoosts(0)
      setAssistActive(false)
      setGuardedActive(false)
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
    // Unarmed is always melee, even when a ranged weapon was selected first —
    // the picker now offers it under every attack type, so this can no longer
    // rely on `attackType` still being null.
    if (w && w.id === '__unarmed__') {
      derivedType = 'melee'
    } else if (w && !derivedType) {
      const ref = refWeaponMap[w.weapon_key]
      derivedType = ref?.skill_key ? (isRangedSkill(ref.skill_key) ? 'ranged' : 'melee') : 'ranged'
    }
    // Flat layout has no NEXT button — write to participant DB on weapon select
    if (w && w.id !== '__unarmed__') {
      const name = w.custom_name || refWeaponMap[w.weapon_key]?.name || null
      void writeWeaponToParticipant(name, null, w.weapon_key, null)
    } else if (!w) {
      void writeWeaponToParticipant(null, null, null, null)
    }
    setState(s => ({ ...s, selectedWeapon: w, attackType: w ? derivedType : initialAttackType, selectedBand: null, dualWield: null, dualWieldReview: false }))
    setAimBoosts(0); setAssistActive(false); setGuardedActive(false)
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
        // Attack rolls are never hidden rolls — visible on the feed regardless of
        // whether the acting adversary's token is revealed to players on the map.
        is_visible_to_players: true,
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
    setAimBoosts(0); setAssistActive(false); setGuardedActive(false)
  }

  // ── Dual wield confirm (flat layout — no accordion NEXT) ──────────────────
  const handleDualWieldContinue = () => {
    const dw = state.dualWield
    if (dw) {
      const primaryName   = dw.primaryWeapon.custom_name   || refWeaponMap[dw.primaryWeapon.weapon_key]?.name   || null
      const secondaryName = dw.secondaryWeapon.custom_name || refWeaponMap[dw.secondaryWeapon.weapon_key]?.name || null
      void writeWeaponToParticipant(primaryName, secondaryName, dw.primaryWeapon.weapon_key, dw.secondaryWeapon.weapon_key)
    }
    setState(s => ({ ...s, dualWieldReview: false }))
  }

  // ── Derived: secondary refWeapon (for dual wield result display) ──────────
  const secondaryRefWeapon: RefWeapon | null = (state.dualWield?.secondaryWeapon &&
    state.dualWield.secondaryWeapon.weapon_key !== '__unarmed__')
    ? (refWeaponMap[state.dualWield.secondaryWeapon.weapon_key] ?? null)
    : null

  // ── Maneuver handlers (drive separate local state; combined into effectiveAdjustments below) ──
  const toggleAim1   = () => setAimBoosts(v => v >= 1 ? 0 : 1)
  const toggleAim2   = () => { if (aimBoosts >= 1) setAimBoosts(v => v >= 2 ? 1 : 2) }
  const toggleAssist = () => setAssistActive(v => !v)
  const toggleGuarded = () => setGuardedActive(v => !v)

  // ── Effective adjustments: merge maneuver boosts/setbacks into ManualAdjustments ──
  const effectiveAdjustments: ManualAdjustments = {
    ...state.adjustments,
    boostAdd:   state.adjustments.boostAdd + aimBoosts + (assistActive ? 1 : 0),
    setbackAdd: state.adjustments.setbackAdd + (guardedActive ? 1 : 0),
  }

  // ── Melee opponent resistance (reads encounterEnemies, no target selection step) ──
  // Player-selected melee opponent wins; otherwise the encounter's first
  // enemy; otherwise null, which getMeleeDifficulty reports as the
  // "set difficulty manually" fallback.
  const primaryTarget = state.selectedTargets[0] ?? (encounterEnemies ?? gmTargets ?? [])[0] ?? null
  const meleeResult   = state.attackType === 'melee' ? getMeleeDifficulty(primaryTarget) : null

  // Enemy adversaries in the current encounter — the melee opponent choices.
  // Allied NPCs are never valid melee targets here.
  const meleeOpponents = (encounterEnemies ?? gmTargets ?? []).filter(
    a => (a.alignment ?? 'enemy') === 'enemy',
  )

  // ── Total dice and roll readiness ─────────────────────────────────────────
  const totalDiceForRoll = Object.values(poolForRoll).reduce((s, n) => s + Math.max(0, n), 0)
  const canRoll = state.selectedWeapon !== null &&
    (state.attackType !== 'ranged' || state.selectedBand !== null) &&
    totalDiceForRoll > 0

  // ── DSS stepper helpers (ManualAdjustments only — no maneuver offsets) ──────
  function dssAdj(key: keyof ManualAdjustments, delta: number) {
    const floors: Partial<Record<keyof ManualAdjustments, number>> = {
      boostAdd:           0,
      setbackAdd:         0,
      // Difficulty removal is bounded by the live pool at the call site
      // (see the "Adjust Difficulty" stepper's `min`), not by a magic number.
      difficultyAdd:      -99,
      challengeAdd:       0,
      forceAdd:           0,
      abilityUpgrades:    0,
      difficultyUpgrades: 0,
    }
    setState(s => ({
      ...s,
      adjustments: {
        ...s.adjustments,
        [key]: Math.max(floors[key] ?? 0, s.adjustments[key] + delta),
      },
    }))
  }

  // ── Stage rail (presentation only) ─────────────────────────────────────────
  // A view over the existing state — `currentStep` and every other field on
  // CombatCheckState keep their meaning and their writers untouched.
  const stage1Done = state.selectedWeapon !== null
  const stage2Done = state.attackType === 'ranged'
    ? state.selectedBand !== null
    : state.selectedTargets.length > 0 || meleeOpponents.length === 0
  const rangeApplies = state.attackType === 'ranged'

  // ── Modal ignition ────────────────────────────────────────────────────────
  // Canonical pattern (see docs/architecture.md): refs to inner wrappers, one
  // effect building a GSAP timeline, `() => tl.kill()` on cleanup, an early
  // `gsap.set` short-circuit for reduced motion, and `prefersReducedMotion` in
  // the dependency array because it is false on the first render.
  //
  // Decorative only. `open` has already flipped by the time this runs; `Modal`'s
  // `exitMs` merely holds the DOM long enough for the close to be seen.
  useEffect(() => {
    // Kill any in-flight timeline first, so spamming the trigger can never
    // leave the panel mid-scale or half-faded.
    igniteTlRef.current?.kill()

    const targets = {
      inner:  shellRef.current,
      scrim:  scrimRef.current,
      pulse:  pulseRef.current,
      // Origin is resolved at open time from the rail button's own class —
      // no ref threaded through HudLeftRail. Missing node ⇒ viewport centre.
      origin: typeof document !== 'undefined'
        ? document.querySelector('.hud-rail-btn-combat')
        : null,
      accent: 'var(--hud-accent)',
      glow:   'var(--hud-glow)',
      restShadow: MODAL.shadow,
      reducedMotion: prefersReducedMotion,
    }
    igniteTlRef.current = open ? igniteModalOpen(targets) : igniteModalClose(targets)

    return () => { igniteTlRef.current?.kill() }
  }, [open, prefersReducedMotion])

  // Tray pulse + flying die on any pool change. Decorative: the pool state has
  // already been written by the time this runs.
  const poolSignature = `${poolForRoll.proficiency ?? 0}-${poolForRoll.ability ?? 0}-${poolForRoll.boost ?? 0}-${poolForRoll.force ?? 0}-${poolForRoll.difficulty ?? 0}-${poolForRoll.challenge ?? 0}-${poolForRoll.setback ?? 0}`
  const prevSignature = useRef(poolSignature)
  useEffect(() => {
    if (prevSignature.current === poolSignature) return
    prevSignature.current = poolSignature
    if (prefersReducedMotion) return
    const tray = trayRef.current
    if (!tray) return
    tray.classList.remove('fc-tray-pulse')
    // Force reflow so the animation restarts on consecutive changes.
    void tray.offsetWidth
    tray.classList.add('fc-tray-pulse')
    // prefersReducedMotion is false on first render and flips in an effect, so
    // it has to be a dependency rather than a captured closure value.
  }, [poolSignature, prefersReducedMotion])

  // Column 2 rebuilds when the weapon type flips (Range track <-> Opponent
  // list). Stagger its children in so the swap reads as a deliberate change
  // rather than a flicker. Inner wrapper only; skipped under reduced motion.
  useEffect(() => {
    const el = s2Ref.current
    if (!el) return
    const kids = el.children
    if (!kids.length) return
    if (prefersReducedMotion) { gsap.set(kids, { opacity: 1, y: 0 }); return }
    const tw = gsap.fromTo(kids, { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.22, stagger: 0.04, ease: 'power2.out' })
    return () => { tw.kill() }
    // prefersReducedMotion is false on first render — must be a dependency.
  }, [rangeApplies, prefersReducedMotion])


  const weaponSummary = state.selectedWeapon
    ? (state.selectedWeapon.id === '__unarmed__'
        ? 'Unarmed / Brawl'
        : (state.selectedWeapon.custom_name || refWeapon?.name || 'Weapon'))
    : ''
  const rangeSummary = state.selectedBand ? RANGE_BAND_LABELS[state.selectedBand] : ''
  const adjustCount = state.adjustments.boostAdd + state.adjustments.setbackAdd +
    state.adjustments.forceAdd + state.adjustments.abilityUpgrades +
    state.adjustments.difficultyUpgrades + Math.abs(state.adjustments.difficultyAdd)
  const rollBlockedBy = !state.selectedWeapon
    ? 'Choose a weapon to arm the roll'
    : (rangeApplies && !state.selectedBand)
      ? 'Choose a range band to arm the roll'
      : totalDiceForRoll === 0
        ? 'Pool is empty'
        : 'Pool locked in — may the Force be with you'

  return (
    // Centred modal, portalled to document.body by `Modal`. The portal is
    // required, not cosmetic: the old `.hud-quick-drawer` root carried
    // `backdrop-filter`, which creates a containing block for `position: fixed`
    // descendants and would anchor the overlay to the drawer on Safari.
    // Reuses the app's shared Modal shell (scrim, Escape, scrim-click close,
    // z-index) rather than a bespoke one — note it has no focus trap or scroll
    // lock, matching every other modal in the app.
    <Modal
      open={open}
      onClose={handleClose}
      maxWidth="min(1180px, calc(100vw - 48px))"
      panelBackground="var(--hud-surface-hi)"
      scrimRef={scrimRef}
      scrimClassName="fc-scrim-ignite"
      portalExtra={<div ref={pulseRef} className="fc-pulse" aria-hidden />}
      exitMs={IGNITE_EXIT_MS}
    >
    <div className="cc-modal" ref={shellRef}>

      {/* ── Top-edge accent stripe ──────────────────────────────────────────── */}
      <div style={{
        height:     3, /* stripe height */
        /* Per-check accent identity — Combat is the baseline, so --check-accent
           and --check-accent-alt resolve to exactly the --hud-accent / --hud-gold
           this line named before. Same pixels, now on the shared mechanism. */
        background: 'linear-gradient(90deg, transparent, var(--check-accent) 30%, var(--check-accent-alt) 70%, transparent)',
        flexShrink: 0,
      }} />

      {/* ── Compact header strip ────────────────────────────────────────────── */}
      <div data-ignite-stagger style={{
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

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="fc-console-body" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        {/* ── Hero dice tray — sticky, above the stage rail ─────────────────── */}
        {!isResult && (() => {
          const p = poolForRoll.proficiency ?? 0
          const a = poolForRoll.ability     ?? 0
          const b = poolForRoll.boost       ?? 0
          const d = poolForRoll.difficulty  ?? 0
          const c = poolForRoll.challenge   ?? 0
          const s = poolForRoll.setback     ?? 0
          const f = poolForRoll.force       ?? 0
          const hasPos = p + a + b + f > 0
          const hasNeg = d + c + s > 0
          return (
            <div className="fc-tray fc-tray-strip" data-ignite-stagger ref={trayRef}>
              <div className="fc-tray-label">
                <span>Dice Pool</span>
                {refSkill?.name && <span className="fc-tray-skill">{refSkill.name}</span>}
              </div>
              <div className="fc-tray-dice">
                {Array.from({ length: p }).map((_, i) => <DiceTrayDie key={`pro-${i}`} type="proficiency" />)}
                {Array.from({ length: a }).map((_, i) => <DiceTrayDie key={`abl-${i}`} type="ability" />)}
                {Array.from({ length: b }).map((_, i) => <DiceTrayDie key={`bst-${i}`} type="boost" />)}
                {Array.from({ length: f }).map((_, i) => <DiceTrayDie key={`frc-${i}`} type="force" />)}
                {hasPos && hasNeg && <span className="fc-tray-divider" />}
                {Array.from({ length: d }).map((_, i) => <DiceTrayDie key={`dif-${i}`} type="difficulty" />)}
                {Array.from({ length: c }).map((_, i) => <DiceTrayDie key={`chl-${i}`} type="challenge" />)}
                {Array.from({ length: s }).map((_, i) => <DiceTrayDie key={`set-${i}`} type="setback" />)}
                {!hasPos && !hasNeg && (
                  <span className="fc-tray-empty">Select a weapon to begin</span>
                )}
              </div>
            </div>
          )
        })()}

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

        {/* ── Stage rail ───────────────────────────────────────────────────── */}
        {!isResult && (
          <div className="fc-cols">

            {/* ── 1 · Weapon ─────────────────────────────────────────────── */}
            <div data-ignite-stagger className={`fc-col${openStage === 1 ? ' is-active' : ''}${stage1Done ? ' is-done' : ''}`}>
              <StageHead openStage={openStage} onOpen={setOpenStage} n={1} name="Weapon" summary={weaponSummary} done={stage1Done} locked={false} />
              <div className="fc-col-body">
                  {/* Dual-wield review keeps its place in the flow — it just
                      renders inside stage 1 instead of replacing the panel. */}
                  {state.dualWieldReview && state.dualWield ? (
                    <>
                      <DualWieldReviewStep
                        primaryWeapon={state.dualWield.primaryWeapon}
                        secondaryWeapon={state.dualWield.secondaryWeapon}
                        primaryRef={refWeapon}
                        secondaryRef={secondaryRefWeapon}
                        onSwap={handleDualWieldSwap}
                      />
                      <button
                        type="button"
                        className="fc-roll-btn is-armed"
                        onClick={handleDualWieldContinue}
                        style={{ marginTop: SP[2] }}
                      >
                        ⋄ Confirm
                      </button>
                    </>
                  ) : (
                    <WeaponSelectStep
                      attackType={state.attackType}
                      character={character}
                      weapons={weapons}
                      refWeaponMap={refWeaponMap}
                      refSkillMap={refSkillMap}
                      refWeaponQualityMap={refWeaponQualityMap}
                      charSkills={charSkills}
                      selectedWeapon={state.selectedWeapon}
                      /* Composed at the call site so the auto-advance never
                         touches handleWeaponSelect itself. */
                      onSelect={w => {
                        handleWeaponSelect(w)
                        if (!w) { setOpenStage(1); return }
                        const wr = w.id === '__unarmed__' ? null : refWeaponMap[w.weapon_key]
                        const ranged = wr?.skill_key ? isRangedSkill(wr.skill_key) : false
                        setOpenStage(ranged ? 2 : 3)
                      }}
                      onNext={() => {}}
                      isGmMode={isGmMode}
                      onEquipWeapon={handleEquipWeapon}
                      onDualWieldSelect={handleDualWieldSelect}
                      maneuvers={{
                        aim1:    aimBoosts >= 1,
                        aim2:    aimBoosts >= 2,
                        assist:  assistActive,
                        guarded: guardedActive,
                        onToggleAim1:    toggleAim1,
                        onToggleAim2:    toggleAim2,
                        onToggleAssist:  toggleAssist,
                        onToggleGuarded: toggleGuarded,
                      } satisfies WeaponManeuvers}
                    />
                  )}
              </div>
            </div>

            {/* ── 2 · Range (ranged) / Opponent Resistance (melee) ───────── */}
            <div data-ignite-stagger className={`fc-col${openStage === 2 ? ' is-active' : ''}${stage1Done && stage2Done ? ' is-done' : ''}${!stage1Done ? ' is-locked' : ''}`}>
              <StageHead
                openStage={openStage}
                onOpen={setOpenStage}
                n={2}
                name={rangeApplies ? 'Range' : 'Opponent'}
                summary={rangeApplies ? rangeSummary : (primaryTarget?.name ?? 'Manual difficulty')}
                done={stage1Done && stage2Done}
                locked={!stage1Done}
              />
              <div className="fc-col-body" ref={s2Ref}>
                  {rangeApplies ? (
                    <RangeBandStep
                      attackType="ranged"
                      weapon={refWeapon ? { skillKey: refWeapon.skill_key ?? '', refWeapon } : null}
                      selectedBand={state.selectedBand}
                      targets={state.selectedTargets}
                      onSelect={b => { handleBandSelect(b); setOpenStage(3) }}
                    />
                  ) : meleeOpponents.length > 0 ? (
                    <>
                      {/* Enemy adversaries in this encounter. Allied NPCs are
                          never offered as melee targets. */}
                      <div className="fc-picker">
                        <div className="fc-picker-scroll">
                          {meleeOpponents.map(opp => (
                            <button
                              key={opp.instanceId}
                              type="button"
                              className={`fc-picker-row${primaryTarget?.instanceId === opp.instanceId ? ' is-selected' : ''}`}
                              onClick={() => handleTargetSelect([opp])}
                            >
                              <span className="fc-chip-icon">⌖</span>
                              <span className="fc-chip-meta">
                                <span className="fc-chip-name">{opp.name}</span>
                                <span className="fc-chip-stats">
                                  {opp.type?.toUpperCase() ?? 'ADVERSARY'}
                                  {` · Soak ${opp.soak ?? 0}`}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* An opponent with no Melee rank on record also needs a
                          hand-entered difficulty, not just an empty encounter. */}
                      {meleeResult?.fallbackReason ? (
                        <>
                          <div className="fc-note">{meleeResult.fallbackReason}</div>
                          <div className="fc-dice-grid">
                            <FcStepper
                              dieColor={DICE_COLOR.difficulty} dieShape="diamond"
                              name="Difficulty" sub="Set manually"
                              value={state.adjustments.difficultyAdd}
                              onAdd={() => dssAdj('difficultyAdd', 1)}
                              onRemove={() => dssAdj('difficultyAdd', -1)}
                              canRemove={(poolForRoll.difficulty ?? 0) > 0}
                            />
                          </div>
                        </>
                      ) : meleeResult && primaryTarget ? (
                        <div className="fc-note">
                          <b>{primaryTarget.name}</b>
                          {`Opposed: Melee ${meleeResult.targetMeleeRank} · Brawn ${meleeResult.targetBrawn}`}
                          {` → ${meleeResult.difficultyDice} difficulty`}
                          {meleeResult.challengeDice > 0 ? `, ${meleeResult.challengeDice} challenge` : ''}
                        </div>
                      ) : null}
                    </>
                  ) : meleeResult?.fallbackReason ? (
                    /* No enemy adversary in the encounter — enter the
                       difficulty by hand instead. */
                    <>
                      <div className="fc-note">{meleeResult.fallbackReason}</div>
                      <div className="fc-dice-grid">
                        <FcStepper
                          dieColor={DICE_COLOR.difficulty} dieShape="diamond"
                          name="Difficulty" sub="Set manually"
                          value={state.adjustments.difficultyAdd}
                          onAdd={() => dssAdj('difficultyAdd', 1)}
                          onRemove={() => dssAdj('difficultyAdd', -1)}
                          canRemove={(poolForRoll.difficulty ?? 0) > 0}
                        />
                      </div>
                    </>
                  ) : meleeResult && primaryTarget ? (
                    <div>
                      <div className="fc-dstep-name">
                        {primaryTarget.name}
                        {meleeResult.targetMeleeRank > 0 ? ` · Melee rank ${meleeResult.targetMeleeRank}` : ''}
                      </div>
                      <div className="fc-range-pips" style={{ justifyContent: 'flex-start' }}>
                        {Array.from({ length: meleeResult.challengeDice }).map((_, i) => (
                          <i key={`chl-${i}`} style={{
                            width: 18, height: 18, flexShrink: 0, /* die geometry, not spacing */
                            background: DICE_COLOR.challenge, /* die-identity hex — sealed namespace */
                            clipPath: CLIP_OCTAGON,
                          }} />
                        ))}
                        {Array.from({ length: meleeResult.difficultyDice }).map((_, i) => (
                          <i key={`dif-${i}`} style={{
                            width: 16, height: 16, flexShrink: 0, /* die geometry, not spacing */
                            background: DICE_COLOR.difficulty, /* die-identity hex — sealed namespace */
                            clipPath: CLIP_DIAMOND,
                          }} />
                        ))}
                        {meleeResult.challengeDice === 0 && meleeResult.difficultyDice === 0 && (
                          <span className="fc-range-dash">—</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="fc-note">No active encounter enemy</div>
                  )}
              </div>
            </div>

            {/* ── 3 · Adjust Pool ────────────────────────────────────────── */}
            <div data-ignite-stagger className={`fc-col${openStage === 3 ? ' is-active' : ''}${!stage1Done ? ' is-locked' : ''}`}>
              <StageHead
                openStage={openStage}
                onOpen={setOpenStage}
                n={3}
                name="Adjust Pool"
                summary={adjustCount > 0 ? `${adjustCount} adjustment${adjustCount === 1 ? '' : 's'}` : ''}
                done={adjustCount > 0}
                locked={!stage1Done}
              />
              <div className="fc-col-body">
                  <div className="fc-dice-grid">
                    <FcStepper
                      dieColor={DICE_COLOR.boost} dieShape="rounded"
                      name="Boost" value={state.adjustments.boostAdd}
                      onAdd={() => dssAdj('boostAdd', 1)} onRemove={() => dssAdj('boostAdd', -1)}
                      canRemove={state.adjustments.boostAdd > 0}
                    />
                    <FcStepper
                      dieColor={DICE_COLOR.setback} dieEdge={DICE_OUTLINE.setback} dieShape="rounded"
                      name="Setback" value={state.adjustments.setbackAdd}
                      onAdd={() => dssAdj('setbackAdd', 1)} onRemove={() => dssAdj('setbackAdd', -1)}
                      canRemove={state.adjustments.setbackAdd > 0}
                    />
                    <FcStepper
                      dieColor={DICE_COLOR.force} dieEdge={DICE_OUTLINE.force} dieShape="octagon"
                      name="Force" value={state.adjustments.forceAdd}
                      onAdd={() => dssAdj('forceAdd', 1)} onRemove={() => dssAdj('forceAdd', -1)}
                      canRemove={state.adjustments.forceAdd > 0}
                    />
                    <FcStepper
                      dieColor={DICE_COLOR.difficulty} dieShape="diamond"
                      name="Difficulty" sub="Add / remove"
                      value={state.adjustments.difficultyAdd}
                      onAdd={() => dssAdj('difficultyAdd', 1)} onRemove={() => dssAdj('difficultyAdd', -1)}
                      canRemove={(poolForRoll.difficulty ?? 0) > 0}
                    />
                    {/* Upgrade rows: the − is an explicit downgrade, labelled as
                        such, and is a no-op at zero via `canRemove`. */}
                    <FcStepper
                      dieColor={DICE_COLOR.proficiency} dieShape="octagon"
                      name="Upgrade Skill" sub="Ability → Prof"
                      value={state.adjustments.abilityUpgrades}
                      onAdd={() => dssAdj('abilityUpgrades', 1)} onRemove={() => dssAdj('abilityUpgrades', -1)}
                      canRemove={state.adjustments.abilityUpgrades > 0}
                      isUpgrade downgradeLabel="Undo"
                    />
                    <FcStepper
                      dieColor={DICE_COLOR.challenge} dieShape="octagon"
                      name="Upgrade Diff" sub="Diff → Challenge"
                      value={state.adjustments.difficultyUpgrades}
                      onAdd={() => dssAdj('difficultyUpgrades', 1)} onRemove={() => dssAdj('difficultyUpgrades', -1)}
                      canRemove={state.adjustments.difficultyUpgrades > 0}
                      isUpgrade downgradeLabel="Undo"
                    />
                  </div>
              </div>
            </div>

            {/* Headless pool calculator — drives the tray and the roll pool. */}
            <div style={{ display: 'none' }}>
              <DicePoolReviewStep
                attackType={state.attackType ?? 'ranged'}
                character={character}
                weapon={state.selectedWeapon}
                refWeapon={refWeapon}
                refSkill={refSkill}
                charSkills={charSkills}
                targets={primaryTarget ? [primaryTarget] : []}
                rangeBand={state.selectedBand}
                skillModifiers={skillModifiers}
                adjustments={effectiveAdjustments}
                onAdjustChange={handleAdjustChange}
                onPoolChange={setPoolForRoll}
                dualWield={state.dualWield}
                refWeaponMap={refWeaponMap}
                refSkillMap={refSkillMap}
                speciesAbilities={speciesAbilities}
                speciesName={speciesName}
              />
            </div>

          </div>
        )}
      </div>

      {/* ── Roll footer ─────────────────────────────────────────────────────── */}
      {!isResult && !state.dualWieldReview && (
        <div className="fc-roll-bar fc-roll-footer" data-ignite-stagger>
          <div className="fc-roll-sub">{rollBlockedBy}</div>
          <button
            type="button"
            onClick={() => void handleRoll(poolForRoll)}
            disabled={!canRoll}
            className={`fc-roll-btn${canRoll ? ' is-armed' : ''}`}
          >
            ⋄ Roll Dice
          </button>
        </div>
      )}

      {/* ── Scanline overlay ─────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          pointerEvents:   'none',
          zIndex:          Z.fab,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,color-mix(in srgb,black 3%,transparent) 2px,color-mix(in srgb,black 3%,transparent) 4px)',
        }}
      />
    </div>
    </Modal>
  )
}
