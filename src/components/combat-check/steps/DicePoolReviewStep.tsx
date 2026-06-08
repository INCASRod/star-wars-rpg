'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, SpeciesAbility } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { RangeBand } from '@/lib/combatCheckUtils'
import {
  getRangedDifficulty, getMeleeDifficulty, RANGE_BAND_LABELS,
  RANGE_VALUE_MAP, CHAR_FIELD_MAP, isRangedSkill,
} from '@/lib/combatCheckUtils'
import { useState, useEffect, type ReactNode } from 'react'
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM  = 'var(--hud-text-faint)'
const GOLD_BD   = 'var(--hud-border)'
const TEXT_DIM  = 'var(--hud-text-dim)'


export interface ManualAdjustments {
  boostAdd:           number
  setbackAdd:         number
  difficultyAdd:      number
  challengeAdd:       number  // direct challenge-die adjustments (upgrade/downgrade buttons)
  abilityUpgrades:    number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0, challengeAdd: 0,
  abilityUpgrades: 0, difficultyUpgrades: 0,
}

export interface DualWieldState {
  enabled:         boolean
  primaryWeapon:   CharacterWeapon
  secondaryWeapon: CharacterWeapon
}

interface DicePoolReviewStepProps {
  attackType:      'ranged' | 'melee'
  character:       Character
  weapon:          CharacterWeapon | null
  refWeapon:       RefWeapon | null
  refSkill:        RefSkill | null
  charSkills:      CharacterSkill[]
  targets:         AdversaryInstance[]
  rangeBand:       RangeBand | null
  skillModifiers:  Record<string, SkillDiceModifier>
  adjustments:     ManualAdjustments
  onAdjustChange:  (adj: ManualAdjustments) => void
  onPoolChange?:   (pool: Record<string, number>) => void
  /** When set, overrides standard pool calculation with dual wield rules */
  dualWield?:      DualWieldState | null
  refWeaponMap?:   Record<string, RefWeapon>
  refSkillMap?:    Record<string, RefSkill>
  speciesAbilities?: SpeciesAbility[]
  speciesName?:    string
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily:    FONT_BODY,
      fontSize:      FS.overline,
      fontWeight:    700,
      color:         GOLD_DIM,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      margin:        `${SP[2]} 0 ${SP[1]}`,
      borderBottom:  `1px solid ${GOLD_BD}`,
      paddingBottom: SP[1],
    }}>
      {text}
    </div>
  )
}

function DiceRow({ label, types }: { label: string; types: { type: string; count: number }[] }) {
  const total = types.reduce((s, t) => s + t.count, 0)
  if (total === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[1] }}>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize:   FS.overline,
        color:      TEXT_DIM,
        width:      80,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {types.flatMap(({ type, count }) =>
          Array.from({ length: count }).map((_, i) => (
            <DiceFace key={`${type}-${i}`} type={type as 'proficiency'} size={22} />
          ))
        )}
      </div>
    </div>
  )
}

function AdjustControl({
  label, value, onAdd, onRemove, min = 0,
}: { label: ReactNode; value: number; onAdd: () => void; onRemove: () => void; min?: number }) {
  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       `${SP[1]} 0`,
      borderBottom:  `1px solid var(--hud-border)`,
    }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_DIM, flex: 1 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
        <button
          onClick={onRemove}
          disabled={value <= min}
          style={{
            width: 22, height: 22, /* 22px touch target */
            borderRadius: RADIUS.sm,
            cursor:       value <= min ? 'not-allowed' : 'pointer',
            background:   'transparent',
            border:       `1px solid ${GOLD_BD}`,
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        value <= min ? 'var(--hud-border-hi)' : GOLD_DIM,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          −
        </button>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.caption,
          color:      value < 0 ? 'var(--hud-accent)' : HUD.gold,
          width:      20,
          textAlign:  'center' as const,
        }}>
          {value > 0 ? `+${value}` : value === 0 ? '0' : `${value}`}
        </span>
        <button
          onClick={onAdd}
          style={{
            width: 22, height: 22, /* 22px touch target */
            borderRadius: RADIUS.sm,
            cursor:       'pointer',
            background:   'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border:       `1px solid ${GOLD_BD}`,
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        HUD.gold,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function DicePoolReviewStep({
  attackType, character, weapon, refWeapon, refSkill, charSkills,
  targets, rangeBand, skillModifiers, adjustments, onAdjustChange,
  dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName,
  onPoolChange,
}: DicePoolReviewStepProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const isUnarmed = weapon?.id === '__unarmed__'
  const skillKey  = isUnarmed ? 'BRAWL' : (refWeapon?.skill_key ?? '')

  // ── Determine if dual wield mode is active ────────────────────────────────
  const isDualWield = dualWield?.enabled === true && refWeaponMap && refSkillMap

  // ── Standard pool (used when not dual wield) ──────────────────────────────
  const charKey  = refSkill?.characteristic_key
  const charVal  = charKey ? ((character[CHAR_FIELD_MAP[charKey] as keyof Character] as number) ?? 0) : (isUnarmed ? character.brawn : 0)
  const skillData = charSkills.find(s => s.skill_key === skillKey)
  const rank = skillData?.rank ?? 0
  let { proficiency: stdPro, ability: stdAbl } = getSkillPool(charVal, rank)

  // ── Dual wield pool calculation ───────────────────────────────────────────
  let dwPrimarySkillKey    = ''
  let dwSecondarySkillKey  = ''
  let dwUsedSkillRank      = 0
  let dwUsedChar           = 0
  let dwBaseDifficulty     = 0
  let dwPenaltyLabel       = ''
  let dwPrimarySkillLabel  = ''
  let dwSecondarySkillLabel = ''
  let dwPrimarySkillRank   = 0
  let dwSecondarySkillRank = 0
  let dwPrimaryCharVal     = 0
  let dwSecondaryCharVal   = 0

  if (isDualWield && dualWield && refWeaponMap && refSkillMap) {
    const primaryRef   = refWeaponMap[dualWield.primaryWeapon.weapon_key]
    const secondaryRef = refWeaponMap[dualWield.secondaryWeapon.weapon_key]

    dwPrimarySkillKey   = primaryRef?.skill_key ?? ''
    dwSecondarySkillKey = secondaryRef?.skill_key ?? ''

    const primarySkillRef   = refSkillMap[dwPrimarySkillKey]
    const secondarySkillRef = refSkillMap[dwSecondarySkillKey]

    const primaryCharKey   = primarySkillRef?.characteristic_key ?? ''
    const secondaryCharKey = secondarySkillRef?.characteristic_key ?? ''

    dwPrimaryCharVal   = primaryCharKey   ? ((character[CHAR_FIELD_MAP[primaryCharKey]   as keyof Character] as number) ?? 0) : 0
    dwSecondaryCharVal = secondaryCharKey ? ((character[CHAR_FIELD_MAP[secondaryCharKey] as keyof Character] as number) ?? 0) : 0

    dwPrimarySkillRank   = charSkills.find(s => s.skill_key === dwPrimarySkillKey)?.rank   ?? 0
    dwSecondarySkillRank = charSkills.find(s => s.skill_key === dwSecondarySkillKey)?.rank ?? 0

    dwUsedSkillRank = Math.min(dwPrimarySkillRank, dwSecondarySkillRank)
    dwUsedChar      = Math.min(dwPrimaryCharVal,   dwSecondaryCharVal)

    const primaryWeaponMaxRange   = primaryRef?.range_value   ? (RANGE_VALUE_MAP[primaryRef.range_value]   ?? 'extreme') : 'extreme'
    const secondaryWeaponMaxRange = secondaryRef?.range_value ? (RANGE_VALUE_MAP[secondaryRef.range_value] ?? 'extreme') : 'extreme'

    const primaryDiff   = rangeBand ? getRangedDifficulty(rangeBand, dwPrimarySkillKey,   primaryWeaponMaxRange)   : { difficultyDice: 0 }
    const secondaryDiff = rangeBand ? getRangedDifficulty(rangeBand, dwSecondarySkillKey, secondaryWeaponMaxRange) : { difficultyDice: 0 }
    dwBaseDifficulty = Math.max(primaryDiff.difficultyDice, secondaryDiff.difficultyDice)

    const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey
    dwPenaltyLabel  = sameSkill
      ? `+1 difficulty (same skill: ${primarySkillRef?.name ?? dwPrimarySkillKey})`
      : '+2 difficulty (different skills)'

    dwPrimarySkillLabel   = primarySkillRef?.name   ?? dwPrimarySkillKey
    dwSecondarySkillLabel = secondarySkillRef?.name ?? dwSecondarySkillKey
  }

  // ── Final pool values ─────────────────────────────────────────────────────
  let baseProf: number, baseAbl: number, baseDiff: number, baseChal: number

  if (isDualWield) {
    const { proficiency, ability } = getSkillPool(dwUsedChar, dwUsedSkillRank)
    const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey
    baseDiff = dwBaseDifficulty + (sameSkill ? 1 : 2) + adjustments.difficultyAdd
    baseChal = 0
    baseProf = proficiency
    baseAbl  = ability
  } else {
    baseProf = stdPro
    baseAbl  = stdAbl

    let difficultyDice = 0
    let challengeDice  = 0

    if (attackType === 'ranged' && rangeBand) {
      const result = getRangedDifficulty(rangeBand, skillKey, refWeapon?.range_value ? (RANGE_VALUE_MAP[refWeapon.range_value] ?? 'extreme') : 'extreme')
      difficultyDice = result.difficultyDice
      challengeDice  = result.challengeDice
    } else if (attackType === 'melee') {
      const primaryTarget = targets[0] ?? null
      if (primaryTarget) {
        const result = getMeleeDifficulty(primaryTarget)
        difficultyDice = result.difficultyDice
        challengeDice  = result.challengeDice
      } else {
        difficultyDice = 2
      }
    }
    baseDiff = difficultyDice
    baseChal = challengeDice
  }

  // Apply ability upgrades
  const upgrades = Math.min(adjustments.abilityUpgrades, baseAbl)
  const finalPro = baseProf + upgrades
  const finalAbl = baseAbl - upgrades

  // Talent bonuses (use primary skill key for dual wield)
  const activeSk       = isDualWield ? dwPrimarySkillKey : skillKey
  const talentMod: SkillDiceModifier | undefined = skillModifiers[activeSk]
  const talentBoost    = talentMod?.boostAdd ?? 0
  const talentSbRemove = talentMod?.setbackRemove ?? 0

  // Apply difficulty upgrades
  let finalDiff: number, finalChal: number
  if (isDualWield) {
    const diffUpgrades = Math.min(adjustments.difficultyUpgrades, baseDiff)
    finalDiff = baseDiff - diffUpgrades
    finalChal = diffUpgrades
  } else {
    const diffUpgrades = Math.min(adjustments.difficultyUpgrades, baseDiff)
    finalDiff = baseDiff - diffUpgrades + adjustments.difficultyAdd
    finalChal = baseChal + diffUpgrades
  }

  const netSetback = Math.max(0, adjustments.setbackAdd - talentSbRemove)

  const finalPool = {
    proficiency: finalPro,
    ability:     finalAbl,
    boost:       talentBoost + adjustments.boostAdd,
    difficulty:  finalDiff,
    challenge:   finalChal + adjustments.challengeAdd,
    setback:     netSetback,
    force:       0,
  }

  // Emit pool to parent (CombatCheckOverlay renders the Roll button)
  const { proficiency, ability, boost, difficulty, challenge, setback } = finalPool
  useEffect(() => {
    onPoolChange?.({ proficiency, ability, boost, difficulty, challenge, setback, force: 0 })
  }, [onPoolChange, proficiency, ability, boost, difficulty, challenge, setback])

  const adjFloors: Record<keyof ManualAdjustments, number> = {
    boostAdd:           -talentBoost,
    setbackAdd:         0,
    difficultyAdd:      -(baseDiff),
    challengeAdd:       -(baseChal),
    abilityUpgrades:    0,
    difficultyUpgrades: 0,
  }
  function adj(key: keyof ManualAdjustments, delta: number) {
    const floor = adjFloors[key] ?? 0
    onAdjustChange({ ...adjustments, [key]: Math.max(floor, adjustments[key] + delta) })
  }

  function handleUpgradeCheck() {
    if (finalDiff + finalChal + adjustments.challengeAdd >= 5) return
    if (finalDiff > 0) {
      onAdjustChange({ ...adjustments, difficultyAdd: adjustments.difficultyAdd - 1, challengeAdd: adjustments.challengeAdd + 1 })
    } else {
      onAdjustChange({ ...adjustments, difficultyAdd: adjustments.difficultyAdd + 1 })
    }
  }

  function handleDowngradeCheck() {
    if (adjustments.challengeAdd <= 0) return
    onAdjustChange({
      ...adjustments,
      challengeAdd:  adjustments.challengeAdd - 1,
      difficultyAdd: adjustments.difficultyAdd + 1,
    })
  }

  const weaponName = isDualWield && dualWield
    ? `${dualWield.primaryWeapon.custom_name || (refWeaponMap?.[dualWield.primaryWeapon.weapon_key]?.name) || 'Primary'} + ${dualWield.secondaryWeapon.custom_name || (refWeaponMap?.[dualWield.secondaryWeapon.weapon_key]?.name) || 'Secondary'}`
    : isUnarmed ? 'Unarmed (Brawl)' : (weapon?.custom_name || refWeapon?.name || 'Weapon')
  const targetName = targets.length === 1 ? targets[0].name : targets.length > 1 ? `${targets.length} targets` : undefined

  // ── Melee difficulty labels (standard mode only) ──────────────────────────
  let meleeDifficultyNote: string | undefined
  let meleeDiffDefault: string | undefined
  let meleeRankDefaulted = false
  if (!isDualWield && attackType === 'melee') {
    const primaryTarget = targets[0] ?? null
    if (primaryTarget) {
      const result = getMeleeDifficulty(primaryTarget)
      meleeDifficultyNote = `Opposed check vs ${primaryTarget.name}'s Melee`
      if (result.isDefault) {
        meleeDiffDefault = result.defaultNote
        meleeRankDefaulted = true
      }
    } else {
      meleeDifficultyNote = 'No target selected — using Average difficulty (2 difficulty dice)'
    }
  }

  return (
    <div>
      {/* Context summary */}
      <div style={{
        fontFamily:  FONT_BODY,
        fontSize:    FS.overline,
        color:       'var(--hud-text-faint)',
        display:     'flex',
        gap:         SP[1],
        alignItems:  'center',
        flexWrap:    'wrap' as const,
        marginBottom: SP[1],
      }}>
        <span>{weaponName}</span>
        {targetName && <><span style={{ color: 'var(--hud-text-faint)' }}>→</span><span>{targetName}</span></>}
        {rangeBand && <><span style={{ color: 'var(--hud-text-faint)' }}>→</span><span>{RANGE_BAND_LABELS[rangeBand]}</span></>}
      </div>

      {/* Dual wield header */}
      {isDualWield && dualWield && (
        <div style={{
          marginBottom: SP[2],
          padding:      `${SP[2]} ${SP[3]}`,
          background:   'var(--hud-surface-lo)',
          border:       '1px solid var(--hud-border)',
          borderRadius: RADIUS.lg,
          fontFamily:   FONT_BODY,
          fontSize:     FS.caption,
          color:        'var(--hud-text-dim)',
        }}>
          <span style={{ color: 'var(--hud-gold)', fontWeight: 700 }}>DUAL WIELD ATTACK</span>
          {'  '}Primary: {dualWield.primaryWeapon.custom_name || (refWeaponMap?.[dualWield.primaryWeapon.weapon_key]?.name) || 'Primary'} ({dwPrimarySkillLabel})
          {'  '}·{'  '}
          Secondary: {dualWield.secondaryWeapon.custom_name || (refWeaponMap?.[dualWield.secondaryWeapon.weapon_key]?.name) || 'Secondary'} ({dwSecondarySkillLabel})
        </div>
      )}

      {/* Attack pool */}
      <SectionLabel text="Your Dice" />
      <DiceRow label="Attack" types={[
        { type: 'proficiency', count: finalPro },
        { type: 'ability',     count: finalAbl },
      ]} />
      {(talentBoost + adjustments.boostAdd) > 0 && (
        <DiceRow label="Bonus" types={[{ type: 'boost', count: talentBoost + adjustments.boostAdd }]} />
      )}
      {talentMod?.sources && talentMod.sources.length > 0 && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.overline,
          color:        'color-mix(in srgb, var(--hud-accent) 70%, transparent)', /* talent bonus accent */
          marginBottom: SP[1],
        }}>
          Talent bonus: {talentMod.sources.join(', ')}
        </div>
      )}
      {talentSbRemove > 0 && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.overline,
          color:        'var(--hud-text-faint)',
          marginBottom: SP[1],
        }}>
          ⊘ {talentSbRemove} setback removed by talent
        </div>
      )}

      {/* Difficulty pool */}
      <SectionLabel text="Difficulty" />
      <DiceRow label="Difficulty" types={[
        { type: 'difficulty', count: finalDiff },
        { type: 'challenge',  count: finalChal + adjustments.challengeAdd },
      ]} />
      {isDualWield && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.overline,
          color:        'color-mix(in srgb, var(--state-caution, #FF9800) 70%, transparent)', /* dual wield penalty */
          marginBottom: SP[1],
        }}>
          {dwPenaltyLabel}
        </div>
      )}
      {netSetback > 0 && (
        <DiceRow label="Setback" types={[{ type: 'setback', count: netSetback }]} />
      )}
      {meleeDifficultyNote && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.overline,
          color:        TEXT_DIM,
          fontStyle:    'italic',
          lineHeight:   1.4,
          marginBottom: SP[1],
        }}>
          {meleeDifficultyNote}
        </div>
      )}
      {meleeDiffDefault && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.overline,
          color:        'color-mix(in srgb, var(--state-caution, #FF9800) 70%, transparent)', /* default melee rank warning */
          marginBottom: SP[1],
        }}>
          {meleeDiffDefault}
        </div>
      )}
      {meleeRankDefaulted && (
        <div style={{
          fontFamily:   FONT_BODY,
          fontSize:     FS.caption,
          color:        HUD.textFaint,
          fontStyle:    'italic',
          marginBottom: SP[1],
        }}>
          Melee: rank 0 (not listed — defaulting to Brawn)
        </div>
      )}

      {/* Dual wield collapsible breakdown */}
      {isDualWield && dualWield && (
        <div style={{ marginBottom: SP[2] }}>
          <button
            onClick={() => setBreakdownOpen(v => !v)}
            style={{
              background:     'transparent',
              border:         'none',
              cursor:         'pointer',
              padding:        0,
              fontFamily:     FONT_BODY,
              fontSize:       FS.caption,
              color:          'var(--hud-gold)',
              textDecoration: 'underline',
              marginBottom:   breakdownOpen ? SP[2] : 0,
            }}
          >
            {breakdownOpen ? '▼' : '▶'} Combined Check Breakdown
          </button>

          {breakdownOpen && (
            <div style={{
              fontFamily:   FONT_BODY,
              fontSize:     FS.overline,
              color:        TEXT_DIM,
              lineHeight:   1.8,
              padding:      `${SP[2]} ${SP[2]}`,
              background:   'transparent',
              border:       '1px solid var(--hud-border)',
              borderRadius: RADIUS.lg,
            }}>
              <div>Skill rank used: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{dwUsedSkillRank} (lower of {dwPrimarySkillRank} / {dwSecondarySkillRank})</div>
              <div>Characteristic used: &nbsp;&nbsp;&nbsp;{dwUsedChar} (lower of {dwPrimarySkillLabel} {dwPrimaryCharVal} / {dwSecondarySkillLabel} {dwSecondaryCharVal})</div>
              <div>Base difficulty: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{dwBaseDifficulty} ({rangeBand ? RANGE_BAND_LABELS[rangeBand] : '—'} range)</div>
              <div>
                {dwPrimarySkillKey === dwSecondarySkillKey
                  ? `Same-skill penalty: &nbsp;&nbsp;&nbsp;+1`
                  : `Diff-skill penalty: &nbsp;&nbsp;&nbsp;&nbsp;+2`}
              </div>
              <div style={{ borderTop: '1px solid var(--hud-border)', marginTop: SP[1], paddingTop: SP[1] }}>
                Final difficulty: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{finalDiff + finalChal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Species conditional ability note for this skill */}
      {speciesAbilities
        .filter(a => a.is_conditional && Array.isArray(a.affected_skills) && a.affected_skills.includes(activeSk))
        .map((a, i) => (
          <div key={i} style={{
            fontFamily:   FONT_BODY,
            fontSize:     FS.caption,
            color:        'color-mix(in srgb, var(--state-caution, #FF9800) 70%, transparent)', /* species warning */
            fontStyle:    'italic',
            lineHeight:   1.5,
            marginBottom: SP[2],
            padding:      `${SP[1]} ${SP[2]}`,
            background:   'color-mix(in srgb, var(--state-caution, #FF9800) 4%, transparent)',
            border:       `1px solid color-mix(in srgb, var(--state-caution, #FF9800) 18%, transparent)`,
            borderRadius: RADIUS.lg,
          }}>
            ⚠ {speciesName ? `${speciesName} — ` : ''}{a.name}: {a.description}
            <div style={{ marginTop: SP[1], fontStyle: 'normal', fontSize: FS.overline, color: 'color-mix(in srgb, var(--state-caution, #FF9800) 50%, transparent)' }}>
              Use manual adjustments above if this applies.
            </div>
          </div>
        ))
      }

      {/* Upgrade / Downgrade row */}
      <div style={{ display: 'flex', gap: SP[1], marginTop: SP[2], marginBottom: SP[3] }}>
        <button
          onClick={handleUpgradeCheck}
          disabled={finalDiff + finalChal + adjustments.challengeAdd >= 5}
          style={{
            flex:          1,
            padding:       `2px ${SP[2]}`,
            fontSize:      FS.overline,
            fontWeight:    700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            borderRadius:  RADIUS.sm,
            cursor:        finalDiff + finalChal + adjustments.challengeAdd >= 5 ? 'not-allowed' : 'pointer',
            opacity:       finalDiff + finalChal + adjustments.challengeAdd >= 5 ? 0.4 : 1,
            border:        `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
            background:    `color-mix(in srgb, var(--hud-accent) 10%, transparent)`,
            color:         `color-mix(in srgb, var(--hud-accent) 80%, transparent)`,
            transition:    `opacity ${EASE.quick}`,
            fontFamily:    FONT_BODY,
          }}
        >
          ↑ Upgrade Check
        </button>
        <button
          onClick={handleDowngradeCheck}
          disabled={adjustments.challengeAdd <= 0}
          style={{
            flex:          1,
            padding:       `2px ${SP[2]}`,
            fontSize:      FS.overline,
            fontWeight:    700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            borderRadius:  RADIUS.sm,
            cursor:        adjustments.challengeAdd <= 0 ? 'not-allowed' : 'pointer',
            opacity:       adjustments.challengeAdd <= 0 ? 0.4 : 1,
            /* pre-approved die-identity exception — purple difficulty */
            border:        `1px solid rgba(123,31,162,0.45)`,
            background:    `rgba(123,31,162,0.1)`,
            color:         `rgba(206,147,216,0.8)`,
            transition:    `opacity ${EASE.quick}`,
            fontFamily:    FONT_BODY,
          }}
        >
          ↓ Downgrade Check
        </button>
      </div>

      {/* Manual adjustments */}
      <SectionLabel text="Adjustments" />
      <AdjustControl
        label={<><DiceFace type="boost" size={13} style={{ verticalAlign: 'middle' }} />{' '}Boost</>}
        value={adjustments.boostAdd}
        min={adjFloors.boostAdd}
        onAdd={() => adj('boostAdd', 1)}
        onRemove={() => adj('boostAdd', -1)}
      />
      <AdjustControl
        label={<><DiceFace type="setback" size={13} style={{ verticalAlign: 'middle' }} />{' '}Setback</>}
        value={adjustments.setbackAdd}
        min={adjFloors.setbackAdd}
        onAdd={() => adj('setbackAdd', 1)}
        onRemove={() => adj('setbackAdd', -1)}
      />
      <AdjustControl
        label={<><DiceFace type="difficulty" size={13} style={{ verticalAlign: 'middle' }} />{' '}Difficulty</>}
        value={adjustments.difficultyAdd}
        min={adjFloors.difficultyAdd}
        onAdd={() => adj('difficultyAdd', 1)}
        onRemove={() => adj('difficultyAdd', -1)}
      />
    </div>
  )
}
