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
import { useState } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

export interface ManualAdjustments {
  boostAdd:          number
  setbackAdd:        number
  difficultyAdd:     number
  abilityUpgrades:   number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0,
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
  onRoll:          (pool: Record<string, number>) => void
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
      fontFamily: FONT_C,
      fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
      fontWeight: 700,
      color: GOLD_DIM,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      margin: '16px 0 8px',
      borderBottom: `1px solid ${GOLD_BD}`,
      paddingBottom: 6,
    }}>
      {text}
    </div>
  )
}

function DiceRow({ label, types }: { label: string; types: { type: string; count: number }[] }) {
  const total = types.reduce((s, t) => s + t.count, 0)
  if (total === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{
        fontFamily: FONT_M,
        fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
        color: TEXT_DIM,
        width: 80,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
}: { label: string; value: number; onAdd: () => void; onRemove: () => void; min?: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
    }}>
      <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: TEXT_DIM, flex: 1 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onRemove}
          disabled={value <= min}
          style={{
            width: 22, height: 22, borderRadius: 4, cursor: value <= min ? 'not-allowed' : 'pointer',
            background: 'transparent', border: `1px solid ${GOLD_BD}`,
            fontFamily: FONT_M, fontSize: 14, color: value <= min ? 'rgba(200,170,80,0.2)' : GOLD_DIM,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          −
        </button>
        <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: GOLD, width: 20, textAlign: 'center' }}>
          {value}
        </span>
        <button
          onClick={onAdd}
          style={{
            width: 22, height: 22, borderRadius: 4, cursor: 'pointer',
            background: 'rgba(200,170,80,0.1)', border: `1px solid ${GOLD_BD}`,
            fontFamily: FONT_M, fontSize: 14, color: GOLD,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
  targets, rangeBand, skillModifiers, adjustments, onAdjustChange, onRoll,
  dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName,
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
  let dwPrimarySkillKey   = ''
  let dwSecondarySkillKey = ''
  let dwUsedSkillRank     = 0
  let dwUsedChar          = 0
  let dwBaseDifficulty    = 0
  let dwPenaltyLabel      = ''
  let dwPrimarySkillLabel = ''
  let dwSecondarySkillLabel = ''
  let dwPrimarySkillRank  = 0
  let dwSecondarySkillRank = 0
  let dwPrimaryCharVal    = 0
  let dwSecondaryCharVal  = 0

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

    // Base difficulty: higher of two attacks
    const primaryWeaponMaxRange   = primaryRef?.range_value   ? (RANGE_VALUE_MAP[primaryRef.range_value]   ?? 'extreme') : 'extreme'
    const secondaryWeaponMaxRange = secondaryRef?.range_value ? (RANGE_VALUE_MAP[secondaryRef.range_value] ?? 'extreme') : 'extreme'

    const primaryDiff   = rangeBand ? getRangedDifficulty(rangeBand, dwPrimarySkillKey,   primaryWeaponMaxRange)   : { difficultyDice: 0 }
    const secondaryDiff = rangeBand ? getRangedDifficulty(rangeBand, dwSecondarySkillKey, secondaryWeaponMaxRange) : { difficultyDice: 0 }
    dwBaseDifficulty = Math.max(primaryDiff.difficultyDice, secondaryDiff.difficultyDice)

    // Penalty
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
  const upgrades  = Math.min(adjustments.abilityUpgrades, baseAbl)
  const finalPro  = baseProf + upgrades
  const finalAbl  = baseAbl - upgrades

  // Talent bonuses (use primary skill key for dual wield)
  const activeSk     = isDualWield ? dwPrimarySkillKey : skillKey
  const talentMod: SkillDiceModifier | undefined = skillModifiers[activeSk]
  const talentBoost    = talentMod?.boostAdd ?? 0
  const talentSbRemove = talentMod?.setbackRemove ?? 0

  // Apply difficulty upgrades (for standard non-dual mode)
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
    challenge:   finalChal,
    setback:     netSetback,
    force:       0,
  }

  function adj(key: keyof ManualAdjustments, delta: number) {
    onAdjustChange({ ...adjustments, [key]: Math.max(0, adjustments[key] + delta) })
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
        fontFamily: FONT_M,
        fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
        color: 'rgba(200,170,80,0.5)',
        display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        marginBottom: 4,
      }}>
        <span>{weaponName}</span>
        {targetName && <><span style={{ color: 'rgba(200,170,80,0.25)' }}>→</span><span>{targetName}</span></>}
        {rangeBand && <><span style={{ color: 'rgba(200,170,80,0.25)' }}>→</span><span>{RANGE_BAND_LABELS[rangeBand]}</span></>}
      </div>

      {/* Dual wield header */}
      {isDualWield && dualWield && (
        <div style={{
          marginBottom: 10,
          padding: '8px 12px',
          background: 'rgba(200,170,80,0.04)',
          border: '1px solid rgba(200,170,80,0.15)',
          borderRadius: 8,
          fontFamily: FONT_R,
          fontSize: 'clamp(0.68rem, 1.05vw, 0.8rem)',
          color: 'rgba(200,170,80,0.6)',
        }}>
          <span style={{ color: '#C8AA50', fontWeight: 700 }}>DUAL WIELD ATTACK</span>
          {'  '}Primary: {dualWield.primaryWeapon.custom_name || (refWeaponMap?.[dualWield.primaryWeapon.weapon_key]?.name) || 'Primary'} ({dwPrimarySkillLabel})
          {'  '}·{'  '}
          Secondary: {dualWield.secondaryWeapon.custom_name || (refWeaponMap?.[dualWield.secondaryWeapon.weapon_key]?.name) || 'Secondary'} ({dwSecondarySkillLabel})
        </div>
      )}

      {/* Attack pool */}
      <SectionLabel text="Your Dice" />
      <DiceRow label="Attack" types={[
        { type: 'proficiency', count: finalPro },
        { type: 'ability', count: finalAbl },
      ]} />
      {(talentBoost + adjustments.boostAdd) > 0 && (
        <DiceRow label="Bonus" types={[{ type: 'boost', count: talentBoost + adjustments.boostAdd }]} />
      )}
      {talentMod?.sources && talentMod.sources.length > 0 && (
        <div style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
          color: 'rgba(41,182,246,0.7)',
          marginBottom: 6,
        }}>
          Talent bonus: {talentMod.sources.join(', ')}
        </div>
      )}
      {talentSbRemove > 0 && (
        <div style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
          color: 'rgba(200,170,80,0.5)',
          marginBottom: 6,
        }}>
          ⊘ {talentSbRemove} setback removed by talent
        </div>
      )}

      {/* Difficulty pool */}
      <SectionLabel text="Difficulty" />
      <DiceRow label="Difficulty" types={[
        { type: 'difficulty', count: finalDiff },
        { type: 'challenge', count: finalChal },
      ]} />
      {isDualWield && (
        <div style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
          color: 'rgba(255,152,0,0.7)',
          marginBottom: 6,
        }}>
          {dwPenaltyLabel}
        </div>
      )}
      {netSetback > 0 && (
        <DiceRow label="Setback" types={[{ type: 'setback', count: netSetback }]} />
      )}
      {meleeDifficultyNote && (
        <div style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
          color: TEXT_DIM,
          fontStyle: 'italic',
          lineHeight: 1.4,
          marginBottom: 4,
        }}>
          {meleeDifficultyNote}
        </div>
      )}
      {meleeDiffDefault && (
        <div style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
          color: 'rgba(255,152,0,0.7)',
          marginBottom: 6,
        }}>
          {meleeDiffDefault}
        </div>
      )}
      {meleeRankDefaulted && (
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 'clamp(0.68rem, 1vw, 0.78rem)',
          color: 'rgba(232,223,200,0.4)',
          fontStyle: 'italic',
          marginBottom: 6,
        }}>
          Melee: rank 0 (not listed — defaulting to Brawn)
        </div>
      )}

      {/* Dual wield collapsible breakdown */}
      {isDualWield && dualWield && (
        <div style={{ marginBottom: 8 }}>
          <button
            onClick={() => setBreakdownOpen(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: FONT_R,
              fontSize: 'clamp(0.68rem, 1.05vw, 0.78rem)',
              color: 'rgba(200,170,80,0.55)',
              textDecoration: 'underline',
              marginBottom: breakdownOpen ? 8 : 0,
            }}
          >
            {breakdownOpen ? '▼' : '▶'} Combined Check Breakdown
          </button>

          {breakdownOpen && (
            <div style={{
              fontFamily: FONT_M,
              fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
              color: TEXT_DIM,
              lineHeight: 1.8,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(200,170,80,0.1)',
              borderRadius: 6,
            }}>
              <div>Skill rank used: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{dwUsedSkillRank} (lower of {dwPrimarySkillRank} / {dwSecondarySkillRank})</div>
              <div>Characteristic used: &nbsp;&nbsp;&nbsp;{dwUsedChar} (lower of {dwPrimarySkillLabel} {dwPrimaryCharVal} / {dwSecondarySkillLabel} {dwSecondaryCharVal})</div>
              <div>Base difficulty: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{dwBaseDifficulty} ({rangeBand ? RANGE_BAND_LABELS[rangeBand] : '—'} range)</div>
              <div>
                {dwPrimarySkillKey === dwSecondarySkillKey
                  ? `Same-skill penalty: &nbsp;&nbsp;&nbsp;+1`
                  : `Diff-skill penalty: &nbsp;&nbsp;&nbsp;&nbsp;+2`}
              </div>
              <div style={{ borderTop: '1px solid rgba(200,170,80,0.15)', marginTop: 4, paddingTop: 4 }}>
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
            fontFamily: FONT_R,
            fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
            color: 'rgba(255,152,0,0.7)',
            fontStyle: 'italic',
            lineHeight: 1.5,
            marginBottom: 8,
            padding: '6px 10px',
            background: 'rgba(255,152,0,0.04)',
            border: '1px solid rgba(255,152,0,0.18)',
            borderRadius: 6,
          }}>
            ⚠ {speciesName ? `${speciesName} — ` : ''}{a.name}: {a.description}
            <div style={{ marginTop: 4, fontStyle: 'normal', fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: 'rgba(255,152,0,0.5)' }}>
              Use manual adjustments above if this applies.
            </div>
          </div>
        ))
      }

      {/* Manual adjustments */}
      <SectionLabel text="Manual Adjustments (GM Discretion)" />
      <AdjustControl
        label="Additional Boost dice"
        value={adjustments.boostAdd}
        onAdd={() => adj('boostAdd', 1)}
        onRemove={() => adj('boostAdd', -1)}
      />
      <AdjustControl
        label="Additional Setback dice"
        value={adjustments.setbackAdd}
        onAdd={() => adj('setbackAdd', 1)}
        onRemove={() => adj('setbackAdd', -1)}
      />
      <AdjustControl
        label="Additional Difficulty dice"
        value={adjustments.difficultyAdd}
        onAdd={() => adj('difficultyAdd', 1)}
        onRemove={() => adj('difficultyAdd', -1)}
      />
      <AdjustControl
        label="Upgrade Ability → Proficiency"
        value={adjustments.abilityUpgrades}
        onAdd={() => adj('abilityUpgrades', 1)}
        onRemove={() => adj('abilityUpgrades', -1)}
      />
      <AdjustControl
        label="Upgrade Difficulty → Challenge"
        value={adjustments.difficultyUpgrades}
        onAdd={() => adj('difficultyUpgrades', 1)}
        onRemove={() => adj('difficultyUpgrades', -1)}
      />

      <div style={{ height: 16 }} />

      {/* Roll button */}
      <button
        onClick={() => onRoll(finalPool)}
        style={{
          width: '100%', height: 48,
          background: 'linear-gradient(135deg, #C8AA50, #8B7430)',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontFamily: FONT_C,
          fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
          fontWeight: 700, color: '#060D09',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          boxShadow: '0 2px 16px rgba(200,170,80,0.3)',
        }}
      >
        {isDualWield ? 'Roll Dual Wield Attack' : 'Roll Attack'}
      </button>
    </div>
  )
}
