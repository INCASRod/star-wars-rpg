'use client'

import { useState } from 'react'
import {
  C, DICE_META, SYM, FONT_DISPLAY, FONT_BODY, panelBase,
  EMPTY_POOL, RADIUS, Z, EASE, type DiceType,
} from './design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { rollPool, rollForceDice, getSkillPool, poolSize, type RollResult, type ForceRollResult } from './dice-engine'
import type { CharKey } from './design-tokens'

export interface QuickRollSkill {
  key: string
  name: string
  charKey: CharKey
  charVal: number
  rank: number
}

export interface QuickWeapon {
  id: string
  name: string
  damage: string
  crit: number
  range: string
  skillName: string
  charVal: number
  rank: number
}

interface DiceRollerProps {
  trainedSkills?: QuickRollSkill[]
  equippedWeapons: QuickWeapon[]
  onRoll: (result: RollResult, skillName?: string) => void
  onCombatCheck?: (type: 'ranged' | 'melee') => void
  combatCheckOpen?: boolean
  onCombatCheckClose?: () => void
}

type CheckType = 'Ranged' | 'Melee' | 'Force'

const RANGE_BANDS: { label: string; sub: string; count: number }[] = [
  { label: 'Engaged', sub: 'Easy',     count: 1 },
  { label: 'Short',   sub: 'Easy',     count: 1 },
  { label: 'Medium',  sub: 'Average',  count: 2 },
  { label: 'Long',    sub: 'Hard',     count: 3 },
  { label: 'Extreme', sub: 'Daunting', count: 4 },
]

const DIFF_PRESETS: { label: string; count: number }[] = [
  { label: 'Easy',       count: 1 },
  { label: 'Average',    count: 2 },
  { label: 'Hard',       count: 3 },
  { label: 'Daunting',   count: 4 },
  { label: 'Formidable', count: 5 },
]

const POSITIVE: DiceType[] = ['proficiency', 'ability', 'boost']
const NEGATIVE: DiceType[] = ['challenge', 'difficulty', 'setback']

// Force-pip display colours — no exact token match; flagged deviations below.
// LIGHT_COL (#E8E870): yellowish light-side pip — nearest token is var(--state-triumph) [#FFD700] but hue differs; kept as CSS var approximation
// DARK_COL (#8070D8): bluish-purple dark-side pip — nearest token is var(--hud-accent-purple) [#9060D0]; slight hue shift acceptable
const LIGHT_COL = 'var(--state-triumph)'   // closest available: #FFD700 vs original #E8E870
const DARK_COL  = 'var(--hud-accent-purple)' // closest available: #9060D0 vs original #8070D8

/* ── Force result display ──────────────────────────────────── */
function ForceResult({ result }: { result: ForceRollResult }) {
  const { dice, totalLight, totalDark } = result
  return (
    <div style={{
      padding: `0.625rem 0.625rem var(--space-2)`, marginTop: 'var(--space-2)',
      background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg,
    }}>
      <div className="flex justify-center" style={{ gap: 'var(--space-5)', marginBottom: 'var(--space-2)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--text-h4)', color: LIGHT_COL }}>{totalLight}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-overline)', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Light</div>
        </div>
        <div style={{ width: 1, background: C.border, alignSelf: 'stretch' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--text-h4)', color: DARK_COL }}>{totalDark}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-overline)', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dark</div>
        </div>
      </div>
      <div className="flex justify-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
        {dice.map((die, i) => (
          <div key={i} className="flex flex-col items-center" style={{ gap: '0.1875rem' }}>
            <DiceFace type="force" size={28} />
            <div className="flex" style={{ gap: '0.125rem', minHeight: 8 }}>
              {Array.from({ length: die.light }).map((_, j) => (
                <div key={`l${j}`} style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: LIGHT_COL }} />
              ))}
              {Array.from({ length: die.dark }).map((_, j) => (
                <div key={`k${j}`} style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: DARK_COL }} />
              ))}
              {die.light === 0 && die.dark === 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-overline)', color: C.textDim }}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shape component for dice buttons
function DiceBtn({
  type, count, onAdd, onRemove,
}: { type: DiceType; count: number; onAdd: () => void; onRemove: () => void }) {
  const meta = DICE_META[type]
  const size = 40

  return (
    <div className="flex flex-col items-center" style={{ gap: 'var(--space-1)' }}>
      <div className="relative cursor-pointer" onClick={onAdd}>
        <DiceFace type={type} size={size} active={count > 0} />
        {/* Label overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{
          fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700, color: meta.color,
          letterSpacing: '0.06em',
        }}>
          {meta.label}
        </div>
        {/* Count badge */}
        {count > 0 && (
          <div className="absolute flex items-center justify-center pointer-events-none" style={{
            top: -5, right: -5, width: 16, height: 16,
            background: meta.color, borderRadius: RADIUS.full,
            fontFamily: FONT_BODY, fontSize: 'var(--text-label)', fontWeight: 700, color: C.bg,
            zIndex: Z.raised,
          }}>
            {count}
          </div>
        )}
      </div>
      {count > 0 && (
        <button onClick={onRemove} style={{
          background: 'transparent', border: `1px solid ${C.border}`,
          borderRadius: RADIUS.sm, padding: '1px 0.625rem', cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', color: C.textDim,
        }}>−</button>
      )}
      <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', color: C.textDim, letterSpacing: '0.06em' }}>
        {meta.label}
      </div>
    </div>
  )
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
    </>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-1)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  )
}

export function DiceRoller({ trainedSkills, equippedWeapons, onRoll, onCombatCheck, combatCheckOpen, onCombatCheckClose }: DiceRollerProps) {
  const [pool, setPool]               = useState<Record<DiceType, number>>({ ...EMPTY_POOL })
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null)
  const [checkType, setCheckType]     = useState<CheckType>('Ranged')
  const [rangeBandLabel, setRangeBandLabel] = useState('Medium')
  const [diffPreset, setDiffPreset]   = useState(2)
  const [forceCount,  setForceCount]  = useState(1)
  const [forceResult, setForceResult] = useState<ForceRollResult | null>(null)

  const addDie    = (type: DiceType) => setPool(p => ({ ...p, [type]: p[type] + 1 }))
  const removeDie = (type: DiceType) => setPool(p => ({ ...p, [type]: Math.max(0, p[type] - 1) }))
  const clearPool = () => {
    setPool({ ...EMPTY_POOL })
    setSelectedWeaponId(null)
    setCheckType('Ranged')
    setRangeBandLabel('Medium')
    setDiffPreset(2)
  }
  const isEmpty = poolSize(pool) === 0

  const selectedWeapon = selectedWeaponId ? equippedWeapons.find(w => w.id === selectedWeaponId) ?? null : null

  const loadWeapon = (wpn: QuickWeapon) => {
    const { proficiency, ability } = getSkillPool(wpn.charVal, wpn.rank)
    setSelectedWeaponId(wpn.id)
    setPool(p => ({ ...p, proficiency, ability }))
  }

  const handleCheckType = (type: CheckType) => {
    setCheckType(type)
    if (type === 'Ranged') {
      const band = RANGE_BANDS.find(b => b.label === rangeBandLabel) ?? RANGE_BANDS[2]
      setPool(p => ({ ...p, difficulty: band.count }))
    } else if (type === 'Force') {
      setPool(p => ({ ...p, difficulty: 0 }))
    } else {
      setPool(p => ({ ...p, difficulty: diffPreset }))
    }
  }

  const handleRangeBand = (band: typeof RANGE_BANDS[number]) => {
    setRangeBandLabel(band.label)
    if (checkType === 'Ranged') setPool(p => ({ ...p, difficulty: band.count }))
  }

  const handleDiffPreset = (count: number) => {
    setDiffPreset(count)
    if (checkType !== 'Ranged') setPool(p => ({ ...p, difficulty: count }))
  }

  const handleRoll = () => {
    if (isEmpty) return
    const label = selectedWeapon ? selectedWeapon.name : `${poolSize(pool)} dice`
    onRoll(rollPool(pool), label)
  }

  return (
    <div className="flex flex-col" style={{ gap: '0.875rem' }}>
      {/* Dice Pool Builder */}
      <div style={{ ...panelBase, padding: `var(--space-3) var(--space-3) 0.625rem` }}>
        <CornerBrackets />
        <SectionLabel text="Dice Pool" />

        {/* Weapon selector */}
        {!combatCheckOpen && equippedWeapons.length > 0 && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 'var(--space-1)' }}>
              Weapon
            </div>
            <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
              {equippedWeapons.map(wpn => {
                const isSelected = selectedWeaponId === wpn.id
                return (
                  <button
                    key={wpn.id}
                    onClick={() => isSelected ? (setSelectedWeaponId(null), setPool(p => ({ ...p, proficiency: 0, ability: 0 }))) : loadWeapon(wpn)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: `0.375rem 0.625rem`, borderRadius: RADIUS.md, cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'var(--hud-accent-20)' : 'var(--hud-accent-10)',
                      border: `1px solid ${isSelected ? 'var(--hud-accent-50)' : C.border}`,
                      transition: EASE.default, width: '100%',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--text-body-sm)', fontWeight: 700, color: isSelected ? 'var(--hud-gold)' : C.text }}>
                        {wpn.name}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-label)', color: C.textDim, marginTop: '0.125rem' }}>
                        {wpn.skillName && <span>{wpn.skillName} · </span>}
                        <span style={{ color: 'var(--hud-accent)' }}>DMG {wpn.damage}</span>
                        {wpn.crit > 0 && <span style={{ color: 'var(--die-challenge)' }}> · CRIT {wpn.crit}</span>}
                        {wpn.range && <span> · {wpn.range}</span>}
                      </div>
                    </div>
                    <div className="flex items-center shrink-0" style={{ gap: '0.125rem' }}>
                      {(() => {
                        const { proficiency, ability } = getSkillPool(wpn.charVal, wpn.rank)
                        return <>
                          {Array.from({ length: proficiency }).map((_, i) => (
                            <DiceFace key={`p${i}`} type="proficiency" size={9} />
                          ))}
                          {Array.from({ length: ability }).map((_, i) => (
                            <DiceFace key={`a${i}`} type="ability" size={9} />
                          ))}
                        </>
                      })()}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Check Type */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 'var(--space-1)' }}>
            Check Type
          </div>
          <div className="flex" style={{ gap: 'var(--space-1)' }}>
            {(['Ranged', 'Melee', 'Force'] as CheckType[]).map(type => {
              const isActive = checkType === type
              const isCombat = type === 'Ranged' || type === 'Melee'
              return (
                <button
                  key={type}
                  onClick={() => {
                    if (isCombat && onCombatCheck) {
                      setCheckType(type)
                      onCombatCheck(type.toLowerCase() as 'ranged' | 'melee')
                    } else {
                      handleCheckType(type)
                    }
                  }}
                  style={{
                    flex: 1, padding: '0.3125rem 0',
                    background: isActive ? `var(--hud-accent-20)` : 'transparent',
                    border: `1px solid ${isActive ? C.gold : C.border}`,
                    borderRadius: RADIUS.sm, cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: isActive ? C.gold : C.textDim,
                    transition: EASE.default,
                  }}
                >
                  {type}
                </button>
              )
            })}
          </div>
          {/* Combat check active placeholder */}
          {combatCheckOpen && checkType !== 'Force' && (
            <div style={{
              marginTop: 'var(--space-3)',
              padding: `var(--space-4) var(--space-3)`,
              background: 'var(--hud-surface-lo)',
              border: `1px solid var(--hud-border)`,
              borderRadius: RADIUS.lg,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 'var(--text-body-sm)', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: C.gold, marginBottom: 'var(--space-1)',
              }}>
                {checkType} Attack
              </div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', color: C.textDim, lineHeight: 1.5, marginBottom: 'var(--space-3)',
              }}>
                Guided combat check is open.
                <br />
                Follow the steps in the panel →
              </div>
              {onCombatCheckClose && (
                <button
                  onClick={onCombatCheckClose}
                  style={{
                    padding: `var(--space-1) 0.875rem`, borderRadius: RADIUS.md, cursor: 'pointer',
                    background: 'transparent', border: `1px solid ${C.border}`,
                    fontFamily: FONT_BODY, fontSize: 'var(--text-label)', color: C.textDim,
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Force dice UI */}
          {checkType === 'Force' && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: '0.625rem' }}>
                <DiceFace type="force" size={36} active />
                <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                  <button
                    onClick={() => setForceCount(c => Math.max(1, c - 1))}
                    style={{
                      width: 24, height: 24, background: 'transparent',
                      border: `1px solid ${C.border}`, borderRadius: RADIUS.sm,
                      cursor: 'pointer', color: C.textDim, fontFamily: FONT_BODY, fontSize: 'var(--text-h4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--text-h4)', color: C.text, minWidth: 20, textAlign: 'center' }}>
                    {forceCount}
                  </span>
                  <button
                    onClick={() => setForceCount(c => Math.min(8, c + 1))}
                    style={{
                      width: 24, height: 24, background: 'transparent',
                      border: `1px solid ${C.border}`, borderRadius: RADIUS.sm,
                      cursor: 'pointer', color: C.textDim, fontFamily: FONT_BODY, fontSize: 'var(--text-h4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
                <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-caption)', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {forceCount === 1 ? '1 die' : `${forceCount} dice`}
                </span>
              </div>
              <button
                onClick={() => setForceResult(rollForceDice(forceCount))}
                style={{
                  width: '100%', padding: `var(--space-2) 0`,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: RADIUS.md, cursor: 'pointer',
                  fontFamily: FONT_DISPLAY, fontSize: 'var(--text-body-sm)', fontWeight: 700,
                  letterSpacing: '0.1em', color: C.text,
                }}
              >
                ROLL FORCE
              </button>
              {forceResult && <ForceResult result={forceResult} />}
            </div>
          )}
        </div>

        {/* Pool builder — hidden when combat check overlay or Force is active */}
        {!combatCheckOpen && checkType !== 'Force' && (<>
          {/* Range Band */}
          <div style={{ marginBottom: 'var(--space-3)', opacity: checkType === 'Ranged' ? 1 : 0.4, transition: EASE.default }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 'var(--space-1)' }}>
              Range Band
            </div>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-1)' }}>
              {RANGE_BANDS.map(band => {
                const isActive = rangeBandLabel === band.label
                return (
                  <button
                    key={band.label}
                    onClick={() => handleRangeBand(band)}
                    style={{
                      background: isActive ? 'color-mix(in srgb, var(--state-activated) 22%, transparent)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--state-activated)' : C.border}`,
                      borderRadius: RADIUS.sm, padding: `0.1875rem var(--space-2)`, cursor: 'pointer',
                      fontFamily: FONT_BODY, fontWeight: 700, letterSpacing: '0.06em',
                      transition: EASE.default, whiteSpace: 'nowrap', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-body-sm)', color: isActive ? 'var(--state-activated)' : C.text }}>{band.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Difficulty Preset */}
          <div style={{ marginBottom: 'var(--space-3)', opacity: checkType !== 'Ranged' ? 1 : 0.4, transition: EASE.default }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-body-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 'var(--space-1)' }}>
              Difficulty Preset
            </div>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-1)' }}>
              {DIFF_PRESETS.map(preset => {
                const isActive = diffPreset === preset.count
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleDiffPreset(preset.count)}
                    style={{
                      background: isActive ? 'color-mix(in srgb, var(--state-activated) 22%, transparent)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--state-activated)' : C.border}`,
                      borderRadius: RADIUS.sm, padding: `0.1875rem var(--space-2)`, cursor: 'pointer',
                      fontFamily: FONT_BODY, fontWeight: 700, letterSpacing: '0.06em',
                      transition: EASE.default, whiteSpace: 'nowrap', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-body-sm)', color: isActive ? 'var(--state-activated)' : C.text }}>{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Positive dice */}
          <div className="flex justify-around" style={{ marginBottom: 'var(--space-3)' }}>
            {POSITIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          <div style={{ height: 1, background: C.border, margin: `0 0 var(--space-3)` }} />

          {/* Negative dice */}
          <div className="flex justify-around" style={{ marginBottom: 'var(--space-3)' }}>
            {NEGATIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          {/* Roll button */}
          <button
            onClick={handleRoll}
            disabled={isEmpty}
            style={{
              width: '100%', padding: `0.625rem 0`,
              background: isEmpty ? C.textFaint : selectedWeapon ? 'linear-gradient(135deg, var(--hud-accent), var(--hud-accent))' : 'linear-gradient(135deg, var(--hud-gold), var(--hud-accent))',
              border: 'none', borderRadius: RADIUS.md, cursor: isEmpty ? 'not-allowed' : 'pointer',
              fontFamily: FONT_DISPLAY, fontSize: 'var(--text-label)', fontWeight: 700,
              letterSpacing: '0.12em', color: isEmpty ? C.textDim : C.bg,
              transition: EASE.default,
              boxShadow: isEmpty ? 'none' : `0 2px 12px ${selectedWeapon ? 'var(--hud-accent-40)' : 'var(--hud-gold-40)'}`,
            }}
          >
            {isEmpty ? 'ADD DICE TO ROLL' : selectedWeapon ? `ATTACK — ${selectedWeapon.name}` : `ROLL ${poolSize(pool)} DICE`}
          </button>

          {!isEmpty && (
            <button onClick={clearPool} style={{
              width: '100%', marginTop: 'var(--space-1)', padding: `0.3125rem 0`,
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 'var(--text-caption)', fontWeight: 600,
              letterSpacing: '0.08em', color: C.textDim, transition: EASE.default,
            }}>
              Clear Pool
            </button>
          )}
        </>)}
      </div>

      {/* Symbol Legend */}
      <div style={{ ...panelBase, padding: `var(--space-3) var(--space-3) 0.625rem` }}>
        <CornerBrackets />
        <SectionLabel text="Symbol Legend" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `var(--space-1) var(--space-3)` }}>
          {(Object.entries(SYM) as [string, typeof SYM[keyof typeof SYM]][]).map(([, sym]) => (
            <div key={sym.label} className="flex items-center" style={{ gap: 'var(--space-1)', padding: '2px 0' }}>
              <span style={{ fontSize: 'var(--text-h4)', color: sym.color, width: 18, textAlign: 'center', flexShrink: 0, filter: `drop-shadow(0 0 4px ${sym.color}60)` }}>
                {sym.icon}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-label)', fontWeight: 600, color: C.textDim }}>
                {sym.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
