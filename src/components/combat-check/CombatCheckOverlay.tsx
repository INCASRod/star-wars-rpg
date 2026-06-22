'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import { type RollMeta } from '@/lib/logRoll'
import { formatResultSummary, isRangedSkill, getMeleeDifficulty, type RangeBand, RANGE_VALUE_MAP, RANGE_BAND_LABELS, MELEE_SKILL_KEYS } from '@/lib/combatCheckUtils'
import { checkCriticalEligibility, type CriticalEligibility } from '@/lib/criticalUtils'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality, SpeciesAbility } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { AdversaryInstance } from '@/lib/adversaries'
import { WeaponSelectStep, type WeaponManeuvers } from './steps/WeaponSelectStep'
import { RangeBandStep } from './steps/RangeBandStep'
import { DicePoolReviewStep, type ManualAdjustments, EMPTY_ADJUSTMENTS, type DualWieldState } from './steps/DicePoolReviewStep'
import { DualWieldReviewStep } from './steps/DualWieldReviewStep'
import { RollResultStep } from './steps/RollResultStep'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, SP, EASE, RADIUS, Z, DICE_META, DICE_COLOR } from '@/lib/tokens'

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
function FlatSection({ number, label, children }: { number: number; label: string; children?: ReactNode }) {
  return (
    <div style={{ marginBottom: SP[2] }}>
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           SP[1],
        marginBottom:  SP[1],
        paddingBottom: SP[1],
        borderBottom:  '1px solid var(--hud-border)',
      }}>
        <div style={{
          width:          18,
          height:         18,
          borderRadius:   RADIUS.full,
          border:         `1px solid color-mix(in srgb, var(--hud-accent) 60%, transparent)`,
          background:     `color-mix(in srgb, var(--hud-accent) 12%, transparent)`,
          color:          'var(--hud-accent)',
          fontFamily:     FONT_DISPLAY,
          fontSize:       FS.overline,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          lineHeight:     1,
        }}>
          {number}
        </div>
        <div style={{
          fontFamily:    FONT_DISPLAY,
          fontSize:      FS.overline,
          fontWeight:    700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase' as const,
          color:         'var(--hud-text)',
        }}>
          {label}
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Modifier toggle button ─────────────────────────────────────────────────────
function ModToggle({
  label, effect, active, disabled = false, polarity = 'positive', onToggle,
}: {
  label:     string
  effect:    string
  active:    boolean
  disabled?: boolean
  polarity?: 'positive' | 'negative'
  onToggle:  () => void
}) {
  const barColor = polarity === 'positive' ? 'var(--hud-gold)' : 'var(--state-failure)'
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="cc-mod-toggle"
      style={{
        display:       'flex',
        flexDirection: 'column' as const,
        gap:           2,
        padding:       `${SP[1]} ${SP[2]}`,
        borderLeft:    active
          ? `2px solid ${barColor}`
          : `2px solid color-mix(in srgb, var(--hud-border) 70%, transparent)`,
        borderTop:     '1px solid var(--hud-border)',
        borderRight:   '1px solid var(--hud-border)',
        borderBottom:  '1px solid var(--hud-border)',
        background:    active
          ? polarity === 'positive'
            ? `color-mix(in srgb, var(--hud-gold) 8%, transparent)`
            : `color-mix(in srgb, var(--state-failure) 8%, transparent)`
          : `color-mix(in srgb, var(--hud-surface-lo) 40%, transparent)`,
        borderRadius:  RADIUS.sm,
        cursor:        disabled ? 'not-allowed' as const : 'pointer' as const,
        opacity:       disabled ? 0.3 : 1,
        textAlign:     'left' as const,
        transition:    `border-color ${EASE.quick}, background ${EASE.quick}`,
        width:         '100%',
      }}
    >
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, color: 'var(--hud-text)' }}>
        {label}
      </span>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize:   FS.overline,
        color:      active ? barColor : 'var(--hud-text-dim)',
        opacity:    active ? 1 : 0.6,
      }}>
        {effect}
      </span>
    </button>
  )
}

// ── DSS Stepper — Dice Selection Stage control (− val +) ─────────────────────
const CLIP_OCT = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
const CLIP_DIA = 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'

function DssStepper({
  dieColor, dieShape, label, sublabel, value, min = 0, onAdd, onRemove, polarity = 'positive',
}: {
  dieColor:   string
  dieShape:   'octagon' | 'diamond' | 'rounded'
  label:      string
  sublabel?:  string
  value:      number
  min?:       number
  onAdd:      () => void
  onRemove:   () => void
  polarity:   'positive' | 'negative'
}) {
  const isActive = value !== 0
  const barColor = polarity === 'positive' ? 'var(--hud-gold)' : 'var(--state-failure)'
  const sz = dieShape === 'diamond' ? 14 : 12
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        `${SP[1]} ${SP[1]} ${SP[1]} ${SP[2]}`,
      borderBottom:   '1px solid var(--hud-border)',
      borderLeft:     isActive ? `2px solid ${barColor}` : '2px solid transparent',
      background:     isActive && polarity === 'positive'
        ? 'color-mix(in srgb, var(--hud-gold) 6%, transparent)'
        : isActive && polarity === 'negative'
        ? 'color-mix(in srgb, var(--state-failure) 6%, transparent)'
        : 'transparent',
      transition:     `border-left-color ${EASE.quick}, background ${EASE.quick}`,
      minWidth:       0, /* grid child: allow shrink below content size */
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flex: 1, minWidth: 0 }}>
        <div style={{
          width:        sz,
          height:       sz,
          flexShrink:   0,
          background:   dieColor, /* die-identity hex — sealed namespace */
          borderRadius: dieShape === 'rounded' ? RADIUS.sm : undefined,
          clipPath:     dieShape === 'octagon' ? CLIP_OCT : dieShape === 'diamond' ? CLIP_DIA : undefined,
        }} />
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)', lineHeight: 1.2, whiteSpace: 'nowrap' as const }}>{label}</div>
          {sublabel && <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.7, lineHeight: 1 }}>{sublabel}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
        <button
          onClick={onRemove}
          disabled={value <= min}
          style={{
            width: '1.5rem', height: '1.5rem', flexShrink: 0,
            borderRadius: RADIUS.sm,
            cursor:       value <= min ? 'not-allowed' : 'pointer',
            background:   'transparent',
            border:       '1px solid var(--hud-border)',
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        value <= min ? 'var(--hud-border-hi)' : 'var(--hud-text-faint)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.caption,
          color:      value < 0 ? 'var(--hud-accent)' : HUD.gold,
          minWidth:   '1.25rem',
          textAlign:  'center' as const,
        }}>
          {value > 0 ? `+${value}` : value === 0 ? '0' : `${value}`}
        </span>
        <button
          onClick={onAdd}
          style={{
            width: '1.5rem', height: '1.5rem', flexShrink: 0,
            borderRadius: RADIUS.sm,
            cursor:       'pointer',
            background:   'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border:       '1px solid var(--hud-border)',
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        HUD.gold,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
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

  // ── Maneuver toggle state (separate from ManualAdjustments so DSS steppers stay independent) ──
  const [aimBoosts,    setAimBoosts]    = useState(0)    // 0, 1, or 2
  const [assistActive, setAssistActive] = useState(false)
  const [guardedActive, setGuardedActive] = useState(false)

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
    if (w && !derivedType) {
      if (w.id === '__unarmed__') {
        derivedType = 'melee'
      } else {
        const ref = refWeaponMap[w.weapon_key]
        derivedType = ref?.skill_key ? (isRangedSkill(ref.skill_key) ? 'ranged' : 'melee') : 'ranged'
      }
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
  const primaryTarget = (encounterEnemies ?? gmTargets ?? [])[0] ?? null
  const meleeResult   = state.attackType === 'melee' ? getMeleeDifficulty(primaryTarget) : null

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
      difficultyAdd:      -10,
      challengeAdd:       0,
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

      {/* ── Top-edge accent stripe ──────────────────────────────────────────── */}
      <div style={{
        height:     3, /* stripe height */
        background: 'linear-gradient(90deg, transparent, var(--hud-accent) 30%, var(--hud-gold) 70%, transparent)',
        flexShrink: 0,
      }} />

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

      {/* ── Persistent dice tray ─────────────────────────────────────────────── */}
      {(() => {
        const p = poolForRoll.proficiency ?? 0
        const a = poolForRoll.ability     ?? 0
        const b = poolForRoll.boost       ?? 0
        const d = poolForRoll.difficulty  ?? 0
        const c = poolForRoll.challenge   ?? 0
        const s = poolForRoll.setback     ?? 0
        const hasPlayerDice = p + a + b > 0
        const hasDiffDice   = d + c + s > 0
        const hasAny        = hasPlayerDice || hasDiffDice
        return (
          <div style={{
            padding:      `${SP[1]} ${SP[2]}`,
            background:   'color-mix(in srgb, black 25%, transparent)',
            borderBottom: '1px solid var(--hud-border)',
            flexShrink:   0,
          }}>
            <div style={{
              fontFamily:    FONT_DISPLAY,
              fontSize:      FS.overline,
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              color:         'var(--hud-text-faint)',
              opacity:       0.55,
              marginBottom:  SP[1],
            }}>
              Dice Pool
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' as const }}>
              {Array.from({ length: p }).map((_, i) => <DiceTrayDie key={`pro-${i}`} type="proficiency" />)}
              {Array.from({ length: a }).map((_, i) => <DiceTrayDie key={`abl-${i}`} type="ability" />)}
              {Array.from({ length: b }).map((_, i) => <DiceTrayDie key={`bst-${i}`} type="boost" />)}
              {hasPlayerDice && hasDiffDice && (
                <div style={{ width: 1, height: 28, background: 'color-mix(in srgb, white 10%, transparent)', margin: `0 ${SP[1]}`, flexShrink: 0 }} />
              )}
              {Array.from({ length: d }).map((_, i) => <DiceTrayDie key={`dif-${i}`} type="difficulty" />)}
              {Array.from({ length: c }).map((_, i) => <DiceTrayDie key={`chl-${i}`} type="challenge" />)}
              {Array.from({ length: s }).map((_, i) => <DiceTrayDie key={`set-${i}`} type="setback" />)}
              {!hasAny && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.4 }}>
                  — —
                </span>
              )}
            </div>
            {!hasAny && (
              <div style={{
                fontFamily:    FONT_BODY,
                fontSize:      FS.overline,
                color:         'var(--hud-text-faint)',
                opacity:       0.35,
                marginTop:     SP[1],
                letterSpacing: '0.06em',
              }}>
                Tap modifiers below to build pool
              </div>
            )}
          </div>
        )
      })()}

      {/* ── Body ────────────────────────────────────────────────────────────── */}
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

        {/* Dual wield review */}
        {!isResult && state.dualWieldReview && state.dualWield && (
          <div style={{ padding: `${SP[3]} ${SP[3]}` }}>
            <DualWieldReviewStep
              primaryWeapon={state.dualWield.primaryWeapon}
              secondaryWeapon={state.dualWield.secondaryWeapon}
              primaryRef={refWeapon}
              secondaryRef={secondaryRefWeapon}
              onSwap={handleDualWieldSwap}
            />
            <div style={{ paddingTop: SP[2] }}>
              <button
                onClick={handleDualWieldContinue}
                className="cc-roll-cta"
                style={{
                  width:         '100%',
                  padding:       `${SP[2]} 0`,
                  clipPath:      'polygon(8px 0%,calc(100% - 8px) 0%,100% 50%,calc(100% - 8px) 100%,8px 100%,0% 50%)',
                  background:    'var(--hud-accent)',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    FONT_DISPLAY,
                  fontSize:      FS.sm,
                  fontWeight:    700,
                  color:         'color-mix(in srgb, black 80%, transparent)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase' as const,
                }}
              >
                ⋄ Confirm
              </button>
            </div>
          </div>
        )}

        {/* ── Flat layout ─────────────────────────────────────────────────── */}
        {!isResult && !state.dualWieldReview && (
          <div style={{ padding: `${SP[2]} ${SP[2]}` }}>

            {/* ① Weapon — maneuver buttons render inside selected card */}
            <FlatSection number={1} label="Weapon">
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
            </FlatSection>

            {/* ② Opponent Resistance — melee only */}
            {state.attackType === 'melee' && (
              <FlatSection number={2} label="Opponent Resistance">
                {meleeResult?.fallbackReason ? (
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize:   FS.overline,
                    color:      'var(--hud-text-faint)',
                    fontStyle:  'italic',
                    lineHeight: 1.5,
                    padding:    `${SP[1]} 0`,
                  }}>
                    {meleeResult.fallbackReason}
                  </div>
                ) : meleeResult && primaryTarget ? (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SP[1] }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)', letterSpacing: '0.06em' }}>
                      <span style={{ color: 'var(--hud-text)', fontWeight: 700 }}>{primaryTarget.name}</span>
                      {' · '}
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.15em' }}>
                        MELEE {meleeResult.targetMeleeRank > 0 ? `rank ${meleeResult.targetMeleeRank}` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' as const }}>
                      {Array.from({ length: meleeResult.challengeDice }).map((_, i) => (
                        <div key={`chl-${i}`} style={{
                          width: 22, height: 22, flexShrink: 0,
                          background: DICE_COLOR.challenge, /* die-identity hex — sealed namespace */
                          clipPath: 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
                        }} />
                      ))}
                      {Array.from({ length: meleeResult.difficultyDice }).map((_, i) => (
                        <div key={`dif-${i}`} style={{
                          width: 20, height: 20, flexShrink: 0,
                          background: DICE_COLOR.difficulty, /* die-identity hex — sealed namespace */
                          clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
                        }} />
                      ))}
                      {meleeResult.challengeDice === 0 && meleeResult.difficultyDice === 0 && (
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.5 }}>—</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
                    No active encounter enemy
                  </div>
                )}
              </FlatSection>
            )}

            {/* ② Range — ranged attacks only */}
            {state.attackType === 'ranged' && (
              <FlatSection number={2} label="Range">
                <RangeBandStep
                  attackType="ranged"
                  weapon={refWeapon ? { skillKey: refWeapon.skill_key ?? '', refWeapon } : null}
                  selectedBand={state.selectedBand}
                  targets={state.selectedTargets}
                  onSelect={handleBandSelect}
                />
              </FlatSection>
            )}

            {/* ③ Dice Selection Stage — dims until weapon selected */}
            <FlatSection number={3} label="Dice Selection">
              <div style={{
                opacity:       state.selectedWeapon ? 1 : 0.30,
                pointerEvents: state.selectedWeapon ? 'auto' : 'none' as const,
                transition:    `opacity ${EASE.quick}`,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP[1] }}>
                  <DssStepper
                    dieColor={DICE_COLOR.boost}
                    dieShape="rounded"
                    label="Add Boost"
                    value={state.adjustments.boostAdd}
                    min={0}
                    onAdd={() => dssAdj('boostAdd', 1)}
                    onRemove={() => dssAdj('boostAdd', -1)}
                    polarity="positive"
                  />
                  <DssStepper
                    dieColor={DICE_COLOR.setback}
                    dieShape="rounded"
                    label="Add Setback"
                    value={state.adjustments.setbackAdd}
                    min={0}
                    onAdd={() => dssAdj('setbackAdd', 1)}
                    onRemove={() => dssAdj('setbackAdd', -1)}
                    polarity="negative"
                  />
                  <DssStepper
                    dieColor={DICE_COLOR.proficiency}
                    dieShape="octagon"
                    label="Upgrade Skill"
                    sublabel="Ability → Prof"
                    value={state.adjustments.abilityUpgrades}
                    min={0}
                    onAdd={() => dssAdj('abilityUpgrades', 1)}
                    onRemove={() => dssAdj('abilityUpgrades', -1)}
                    polarity="positive"
                  />
                  <DssStepper
                    dieColor={DICE_COLOR.challenge}
                    dieShape="octagon"
                    label="Upgrade Diff"
                    sublabel="Diff → Challenge"
                    value={state.adjustments.difficultyUpgrades}
                    min={0}
                    onAdd={() => dssAdj('difficultyUpgrades', 1)}
                    onRemove={() => dssAdj('difficultyUpgrades', -1)}
                    polarity="negative"
                  />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <DssStepper
                      dieColor={DICE_COLOR.difficulty}
                      dieShape="diamond"
                      label="Add Difficulty"
                      value={state.adjustments.difficultyAdd}
                      min={-10}
                      onAdd={() => dssAdj('difficultyAdd', 1)}
                      onRemove={() => dssAdj('difficultyAdd', -1)}
                      polarity="negative"
                    />
                  </div>
                </div>
              </div>
            </FlatSection>

            {/* Hidden pool calculator — always mounted, drives dice tray */}
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
        <div style={{
          padding:    `${SP[2]} ${SP[2]}`,
          borderTop:  '1px solid var(--hud-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => void handleRoll(poolForRoll)}
            disabled={!canRoll}
            className="cc-roll-cta"
            style={{
              width:         '100%',
              padding:       `${SP[2]} 0`,
              clipPath:      'polygon(8px 0%,calc(100% - 8px) 0%,100% 50%,calc(100% - 8px) 100%,8px 100%,0% 50%)',
              background:    canRoll ? 'var(--hud-accent)' : `color-mix(in srgb, var(--hud-surface-lo) 60%, transparent)`,
              border:        'none',
              cursor:        canRoll ? 'pointer' : 'not-allowed',
              opacity:       canRoll ? 1 : 0.4,
              fontFamily:    FONT_DISPLAY,
              fontSize:      FS.sm,
              fontWeight:    700,
              color:         canRoll ? 'color-mix(in srgb, black 80%, transparent)' : 'var(--hud-text-faint)',
              letterSpacing: '0.28em',
              textTransform: 'uppercase' as const,
              transition:    `background ${EASE.quick}, opacity ${EASE.quick}`,
            }}
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
  )
}
