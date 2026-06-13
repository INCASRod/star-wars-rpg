'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  FONT_DISPLAY, FONT_BODY,
  FS, SP, RADIUS, EASE,
  HUD, COLOR,
} from '@/lib/tokens'
import {
  rollPool,
  rollForceDice,
  getSkillPool,
} from '@/components/player-hud/dice-engine'
import type { RollResult, ForceRollResult } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { logRoll } from '@/lib/logRoll'
import type { HudSkill } from '@/lib/types'

// ── Sealed colour exceptions ─────────────────────────────────────────
const FORCE_LIGHT = '#0EA5E9'   /* force light side — sealed exception */
const FORCE_DARK  = '#A845F5'   /* force dark side — sealed exception */
const DANGER_COLOR = '#E85A2A'  /* wounds/danger — sealed exception */

// ── Stepper button geometry (constant — avoids recreating per render) ─
const stepBtnStyle: React.CSSProperties = {
  width:  28,  /* fixed stepper geometry */
  height: 28,  /* fixed stepper geometry */
  borderRadius: RADIUS.sm,
  background: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  border: `1px solid var(--hud-border)`,
  cursor: 'pointer',
  fontFamily: FONT_DISPLAY,
  fontSize: FS.sm,
  fontWeight: 700,
  color: HUD.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: EASE.quick,
}

// ── Types ─────────────────────────────────────────────────────────────
interface RegularPool {
  proficiency: number
  ability:     number
  boost:       number
  difficulty:  number
  challenge:   number
  setback:     number
}

// ── Constants ─────────────────────────────────────────────────────────
const COMBAT_SKILL_KEYS = new Set([
  'brawl', 'melee', 'ranged-light', 'ranged-heavy', 'gunnery', 'lightsaber',
])

const STEPPER_CONFIG: Array<{
  key:   keyof RegularPool
  type:  DiceType
  label: string
}> = [
  { key: 'proficiency', type: 'proficiency', label: 'Prof'  },
  { key: 'ability',     type: 'ability',     label: 'Abil'  },
  { key: 'boost',       type: 'boost',       label: 'Boost' },
  { key: 'difficulty',  type: 'difficulty',  label: 'Diff'  },
  { key: 'challenge',   type: 'challenge',   label: 'Chal'  },
  { key: 'setback',     type: 'setback',     label: 'Setbk' },
]

// ── Sub-components ────────────────────────────────────────────────────
function ResultCard({ result }: { result: RollResult }) {
  const { net } = result
  const succeeded = net.success > 0
  return (
    <div style={{
      margin:       SP[2],
      background:   succeeded
        ? `color-mix(in srgb, var(--hud-gold) 8%, transparent)`
        : `color-mix(in srgb, var(--hud-border) 20%, transparent)`,
      border:       `1px solid ${succeeded
        ? `color-mix(in srgb, var(--hud-gold) 30%, transparent)`
        : `color-mix(in srgb, var(--hud-border) 50%, transparent)`}`,
      borderRadius: RADIUS.md,
      padding:      SP[2],
    }}>
      <div style={{
        fontFamily: FONT_DISPLAY,
        fontSize:   FS.h3,
        fontWeight: 700,
        color:      succeeded ? HUD.gold : (net.success < 0 ? DANGER_COLOR : HUD.textFaint),
      }}>
        {succeeded
          ? `✓ ${net.success} ${net.success === 1 ? 'Success' : 'Successes'}`
          : net.success < 0
            ? `✗ ${Math.abs(net.success)} ${Math.abs(net.success) === 1 ? 'Failure' : 'Failures'}`
            : 'Wash'}
      </div>

      {net.advantage !== 0 && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.sm,
          color:      net.advantage > 0 ? COLOR.blue : HUD.gold,
          marginTop:  '2px', /* compact row gap */
        }}>
          {net.advantage > 0
            ? `+ ${net.advantage} Advantage`
            : `– ${Math.abs(net.advantage)} Threat`}
        </div>
      )}

      {net.triumph > 0 && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.sm,
          color:      HUD.gold,
          marginTop:  '2px', /* compact row gap */
        }}>
          ⊕ {net.triumph} Triumph
        </div>
      )}

      {net.despair > 0 && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.sm,
          color:      DANGER_COLOR, /* wounds/danger — sealed exception */
          marginTop:  '2px', /* compact row gap */
        }}>
          ⊗ {net.despair} Despair
        </div>
      )}
    </div>
  )
}

function ForceResultCard({ result }: { result: ForceRollResult }) {
  return (
    <div style={{
      margin:       SP[2],
      background:   `color-mix(in srgb, var(--blue) 8%, transparent)`,
      border:       `1px solid color-mix(in srgb, var(--blue) 25%, transparent)`,
      borderRadius: RADIUS.md,
      padding:      SP[2],
      display:      'flex',
      gap:          SP[3],
      alignItems:   'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize:   FS.h3,
          fontWeight: 700,
          color:      FORCE_LIGHT, /* force light side — sealed exception */
        }}>
          {result.totalLight}
        </div>
        <div style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.overline,
          color:         HUD.textFaint,
          letterSpacing: '0.1em',
        }}>
          LIGHT
        </div>
      </div>

      <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>·</div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize:   FS.h3,
          fontWeight: 700,
          color:      FORCE_DARK, /* force dark side — sealed exception */
        }}>
          {result.totalDark}
        </div>
        <div style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.overline,
          color:         HUD.textFaint,
          letterSpacing: '0.1em',
        }}>
          DARK
        </div>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────
interface MobileDiceScreenProps {
  preSelectedSkill: string | null
  hudSkills:        HudSkill[]
  characterId:      string
  characterName:    string
  campaignId:       string | null
  forceRating:      number
}

// ── Main component ────────────────────────────────────────────────────
export function MobileDiceScreen({
  preSelectedSkill,
  hudSkills,
  characterId,
  characterName,
  campaignId,
  forceRating,
}: MobileDiceScreenProps) {
  const [checkType, setCheckType] = useState<'skill' | 'combat' | 'force'>('skill')

  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(preSelectedSkill)

  const [pool, setPool] = useState<RegularPool>(() => {
    const base: RegularPool = { proficiency: 0, ability: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0 }
    if (preSelectedSkill) {
      const skill = hudSkills.find(s => s.key === preSelectedSkill)
      if (skill) {
        const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
        return { ...base, proficiency, ability }
      }
    }
    return base
  })

  const [forceDice, setForceDice] = useState(() => Math.max(1, forceRating))

  const [rollResult,  setRollResult]  = useState<RollResult      | null>(null)
  const [forceResult, setForceResult] = useState<ForceRollResult | null>(null)

  // ── Skill selection ──
  const selectSkill = useCallback((skill: HudSkill) => {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    setSelectedSkillKey(skill.key)
    setPool(prev => ({ ...prev, proficiency, ability }))
  }, []) // getSkillPool is a pure imported function — no deps needed

  // ── Pool stepper ──
  const stepPool = useCallback((key: keyof RegularPool, delta: number) => {
    setPool(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }))
  }, [])

  // ── Roll ──
  const handleRoll = useCallback(() => {
    setRollResult(null)
    setForceResult(null)

    if (checkType === 'force') {
      const result = rollForceDice(forceDice)
      setForceResult(result)
    } else {
      const fullPool: Record<DiceType, number> = { ...pool, force: 0 }
      const result = rollPool(fullPool)
      setRollResult(result)

      if (campaignId) {
        const selectedSkill = hudSkills.find(s => s.key === selectedSkillKey)
        logRoll({
          campaignId,
          characterId,
          characterName,
          label:  selectedSkill ? `${selectedSkill.name} Check` : 'Custom Check',
          pool:   fullPool,
          result,
          meta:   { rollType: checkType === 'combat' ? 'combat' : 'skill' },
        })
      }
    }
  }, [checkType, forceDice, pool, campaignId, hudSkills, selectedSkillKey, characterId, characterName])

  // ── Derived ──
  const totalPoolSize = Object.values(pool).reduce((a, b) => a + b, 0)
  const canRoll = checkType === 'force' ? forceDice > 0 : totalPoolSize > 0

  // Skills shown in each tab
  const visibleSkills = useMemo(() => {
    if (checkType === 'combat') return hudSkills.filter(s => COMBAT_SKILL_KEYS.has(s.key))
    return hudSkills
  }, [checkType, hudSkills])

  // ── Pool preview dice list (max 8 per type) ──
  const previewDice: DiceType[] = []
  for (const cfg of STEPPER_CONFIG) {
    const count = Math.min(pool[cfg.key], 8)
    for (let i = 0; i < count; i++) previewDice.push(cfg.type)
  }

  return (
    <div style={{
      flex:           1,
      display:        'flex',
      flexDirection:  'column',
      overflowY:      'auto',
      background:     HUD.bg,
    }}>

      {/* ── 1. Check type bar ── */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid var(--hud-border)`,
      }}>
        {(['skill', 'combat', 'force'] as const).map(tab => {
          const active = checkType === tab
          return (
            <button
              key={tab}
              onClick={() => {
                setCheckType(tab)
                setSelectedSkillKey(null)
                setRollResult(null)
                setForceResult(null)
              }}
              style={{
                flex:           1,
                padding:        `${SP[2]} 0`,
                fontFamily:     FONT_BODY,
                fontSize:       FS.overline,
                fontWeight:     active ? 700 : 400,
                letterSpacing:  '0.12em',
                textTransform:  'uppercase',
                color:          active ? HUD.text : HUD.textFaint,
                background:     active
                  ? `color-mix(in srgb, var(--hud-accent) 15%, transparent)`
                  : 'transparent',
                border:         'none',
                borderBottom:   active ? `2px solid var(--hud-accent)` : '2px solid transparent',
                cursor:         'pointer',
                transition:     EASE.quick,
              }}
            >
              {tab === 'skill' ? 'Skill' : tab === 'combat' ? 'Combat' : 'Force'}
            </button>
          )
        })}
      </div>

      {/* ── 2. Skill grid (skill + combat modes) ── */}
      {checkType !== 'force' && (
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            SP[1],
          padding:        SP[2],
          borderBottom:   `1px solid var(--hud-border)`,
        }}>
          {visibleSkills.map(skill => {
            const selected = skill.key === selectedSkillKey
            return (
              <button
                key={skill.key}
                onClick={() => selectSkill(skill)}
                style={{
                  padding:      `2px ${SP[2]}`, /* compact chip */
                  borderRadius: RADIUS.sm,
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  letterSpacing:'0.08em',
                  color:        selected ? HUD.text : HUD.textFaint,
                  background:   selected
                    ? `color-mix(in srgb, var(--hud-accent) 20%, transparent)`
                    : 'transparent',
                  border:       `1px solid ${selected ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
                  cursor:       'pointer',
                  transition:   EASE.quick,
                  whiteSpace:   'nowrap',
                }}
              >
                {skill.name}
              </button>
            )
          })}
        </div>
      )}

      {/* ── 3. Force dice stepper (force mode) ── */}
      {checkType === 'force' && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent:'center',
          gap:           SP[3],
          padding:       SP[4],
          borderBottom:  `1px solid var(--hud-border)`,
        }}>
          <DiceFace type="force" size={32} />
          <button
            style={stepBtnStyle}
            onClick={() => setForceDice(n => Math.max(1, n - 1))}
            aria-label="Decrease force dice"
          >
            −
          </button>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize:   FS.h3,
            fontWeight: 700,
            color:      HUD.text,
            minWidth:   '1.5ch',
            textAlign:  'center',
          }}>
            {forceDice}
          </span>
          <button
            style={stepBtnStyle}
            onClick={() => setForceDice(n => n + 1)}
            aria-label="Increase force dice"
          >
            +
          </button>
        </div>
      )}

      {/* ── 4. Pool steppers (skill + combat modes) ── */}
      {checkType !== 'force' && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 SP[1],
          padding:             SP[2],
          borderBottom:        `1px solid var(--hud-border)`,
        }}>
          {STEPPER_CONFIG.map(cfg => (
            <div
              key={cfg.key}
              style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           '2px', /* compact stepper cell */
                padding:       `${SP[1]} 0`,
              }}
            >
              {/* Die icon */}
              <DiceFace
                type={cfg.type}
                size={28}
                active={pool[cfg.key] > 0}
              />

              {/* Label */}
              <div style={{
                fontFamily:    FONT_BODY,
                fontSize:      FS.overline,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:         HUD.textFaint,
              }}>
                {cfg.label}
              </div>

              {/* Minus / count / plus */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' /* tight stepper row */ }}>
                <button
                  style={stepBtnStyle}
                  onClick={() => stepPool(cfg.key, -1)}
                  aria-label={`Decrease ${cfg.label}`}
                >
                  −
                </button>
                <span style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize:   FS.sm,
                  fontWeight: 700,
                  color:      HUD.text,
                  minWidth:   '1.2ch',
                  textAlign:  'center',
                }}>
                  {pool[cfg.key]}
                </span>
                <button
                  style={stepBtnStyle}
                  onClick={() => stepPool(cfg.key, 1)}
                  aria-label={`Increase ${cfg.label}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. Pool preview (skill + combat, when pool non-empty) ── */}
      {checkType !== 'force' && previewDice.length > 0 && (
        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          gap:        SP[1],
          padding:    `${SP[1]} ${SP[2]}`,
          borderBottom: `1px solid var(--hud-border)`,
          alignItems: 'center',
        }}>
          {previewDice.map((type, i) => (
            <DiceFace key={`${type}-${i}`} type={type} size={20} />
          ))}
        </div>
      )}

      {/* ── 6. Roll button ── */}
      <div style={{ padding: SP[2] }}>
        <button
          onClick={handleRoll}
          disabled={!canRoll}
          style={{
            width:        '100%',
            padding:      `${SP[2]} 0`,
            borderRadius: RADIUS.md,
            fontFamily:   FONT_DISPLAY,
            fontSize:     FS.sm,
            fontWeight:   700,
            letterSpacing:'0.15em',
            textTransform:'uppercase',
            color:        canRoll ? HUD.text : HUD.textFaint,
            background:   canRoll
              ? `color-mix(in srgb, var(--hud-accent) 70%, transparent)`
              : `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
            border:       `1px solid ${canRoll ? 'var(--hud-accent)' : 'transparent'}`,
            cursor:       canRoll ? 'pointer' : 'not-allowed',
            transition:   EASE.quick,
          }}
        >
          Roll Dice
        </button>
      </div>

      {/* ── 7. Result card ── */}
      {rollResult  && <ResultCard      result={rollResult}  />}
      {forceResult && <ForceResultCard result={forceResult} />}

    </div>
  )
}
