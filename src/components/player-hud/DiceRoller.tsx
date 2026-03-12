'use client'

import { useState } from 'react'
import {
  C, DICE_META, SYM, FONT_CINZEL, FONT_RAJDHANI, panelBase,
  EMPTY_POOL, type DiceType,
} from './design-tokens'
import { rollPool, getSkillPool, poolSize, type RollResult } from './dice-engine'
import type { CharKey } from './design-tokens'
import { CHAR_COLOR } from './design-tokens'

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
  trainedSkills: QuickRollSkill[]
  equippedWeapons: QuickWeapon[]
  onRoll: (result: RollResult, skillName?: string) => void
}

// Range band → difficulty count (for ranged attacks)
const RANGE_BANDS: { label: string; sub: string; count: number }[] = [
  { label: 'Engaged', sub: 'Easy',     count: 1 },
  { label: 'Short',   sub: 'Easy',     count: 1 },
  { label: 'Medium',  sub: 'Average',  count: 2 },
  { label: 'Long',    sub: 'Hard',     count: 3 },
  { label: 'Extreme', sub: 'Daunting', count: 4 },
]

const POSITIVE: DiceType[] = ['proficiency', 'ability', 'boost']
const NEGATIVE: DiceType[] = ['challenge', 'difficulty', 'setback']

// Shape component for dice buttons
function DiceBtn({
  type, count, onAdd, onRemove,
}: { type: DiceType; count: number; onAdd: () => void; onRemove: () => void }) {
  const meta = DICE_META[type]
  const size = 40

  const shapeStyle: React.CSSProperties = {
    width: size, height: size,
    background: count > 0 ? `${meta.color}28` : `${meta.color}0E`,
    border: `1.5px solid ${count > 0 ? meta.color : `${meta.color}50`}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative',
    transition: '.15s', flexShrink: 0,
  }

  if (meta.shape === 'diamond') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <div
            style={{ ...shapeStyle, position: 'absolute', inset: 0, transform: 'rotate(45deg)', borderRadius: 4 }}
            onClick={onAdd}
          />
          {/* Label */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: meta.color,
            letterSpacing: '0.06em', pointerEvents: 'none',
          }}>
            {meta.label}
          </div>
          {/* Count badge */}
          {count > 0 && (
            <div style={{
              position: 'absolute', top: -5, right: -5, width: 16, height: 16,
              background: meta.color, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 700, color: C.bg,
              zIndex: 1, pointerEvents: 'none',
            }}>
              {count}
            </div>
          )}
        </div>
        {count > 0 && (
          <button onClick={onRemove} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 3, padding: '1px 10px', cursor: 'pointer',
            fontFamily: FONT_RAJDHANI, fontSize: 12, color: C.textDim,
          }}>−</button>
        )}
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, color: C.textDim, letterSpacing: '0.06em' }}>
          {meta.label}
        </div>
      </div>
    )
  }

  const borderRadius = meta.shape === 'circle' ? '50%' : 4

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ ...shapeStyle, borderRadius }} onClick={onAdd}>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: meta.color, letterSpacing: '0.06em' }}>
            {meta.label}
          </span>
        </div>
        {count > 0 && (
          <div style={{
            position: 'absolute', top: -5, right: -5, width: 16, height: 16,
            background: meta.color, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 700, color: C.bg,
            zIndex: 1, pointerEvents: 'none',
          }}>
            {count}
          </div>
        )}
      </div>
      {count > 0 && (
        <button onClick={onRemove} style={{
          background: 'transparent', border: `1px solid ${C.border}`,
          borderRadius: 3, padding: '1px 10px', cursor: 'pointer',
          fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textDim,
        }}>−</button>
      )}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textDim, letterSpacing: '0.06em' }}>
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
      fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 8, paddingBottom: 4,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  )
}

export function DiceRoller({ trainedSkills, equippedWeapons, onRoll }: DiceRollerProps) {
  const [pool, setPool]               = useState<Record<DiceType, number>>({ ...EMPTY_POOL })
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null)
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null)
  const [selectedRangeBand, setSelectedRangeBand] = useState<string | null>(null)

  const addDie    = (type: DiceType) => setPool(p => ({ ...p, [type]: p[type] + 1 }))
  const removeDie = (type: DiceType) => setPool(p => ({ ...p, [type]: Math.max(0, p[type] - 1) }))
  const clearPool = () => {
    setPool({ ...EMPTY_POOL })
    setSelectedWeaponId(null)
    setSelectedSkillKey(null)
    setSelectedRangeBand(null)
  }
  const isEmpty = poolSize(pool) === 0

  const selectedWeapon = selectedWeaponId ? equippedWeapons.find(w => w.id === selectedWeaponId) ?? null : null

  const loadWeapon = (wpn: QuickWeapon) => {
    const { proficiency, ability } = getSkillPool(wpn.charVal, wpn.rank)
    setSelectedWeaponId(wpn.id)
    setSelectedSkillKey(wpn.skillName)
    setPool(p => ({ ...p, proficiency, ability }))
  }

  const loadSkill = (skill: QuickRollSkill) => {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    setSelectedSkillKey(skill.name)
    setSelectedWeaponId(null)
    setPool(p => ({ ...p, proficiency, ability }))
  }

  const setRangeBand = (band: typeof RANGE_BANDS[number]) => {
    setSelectedRangeBand(band.label)
    setPool(p => ({ ...p, difficulty: band.count }))
  }

  const handleRoll = () => {
    if (isEmpty) return
    const label = selectedWeapon ? selectedWeapon.name : selectedSkillKey ?? `${poolSize(pool)} dice`
    onRoll(rollPool(pool), label)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Dice Pool Builder */}
      <div style={{ ...panelBase, padding: '12px 12px 10px' }}>
        <CornerBrackets />
        <SectionLabel text="Dice Pool" />

        {/* Weapon selector */}
        {equippedWeapons.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 6 }}>
              Weapon
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {equippedWeapons.map(wpn => {
                const isSelected = selectedWeaponId === wpn.id
                return (
                  <button
                    key={wpn.id}
                    onClick={() => isSelected ? (setSelectedWeaponId(null), setSelectedSkillKey(null), setPool(p => ({ ...p, proficiency: 0, ability: 0 }))) : loadWeapon(wpn)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 4, cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'rgba(224,120,85,0.15)' : 'rgba(200,170,80,0.05)',
                      border: `1px solid ${isSelected ? 'rgba(224,120,85,0.55)' : C.border}`,
                      transition: '.12s', width: '100%',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: 12, fontWeight: 700, color: isSelected ? '#E07855' : C.text }}>
                        {wpn.name}
                      </div>
                      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, color: C.textDim, marginTop: 2 }}>
                        {wpn.skillName && <span>{wpn.skillName} · </span>}
                        <span style={{ color: '#E07855' }}>DMG {wpn.damage}</span>
                        {wpn.crit > 0 && <span style={{ color: '#E05050' }}> · CRIT {wpn.crit}</span>}
                        {wpn.range && <span> · {wpn.range}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
                      {(() => {
                        const { proficiency, ability } = getSkillPool(wpn.charVal, wpn.rank)
                        return <>
                          {Array.from({ length: proficiency }).map((_, i) => (
                            <div key={`p${i}`} style={{ width: 8, height: 8, background: '#D4B840', transform: 'rotate(45deg)', flexShrink: 0 }} />
                          ))}
                          {Array.from({ length: ability }).map((_, i) => (
                            <div key={`a${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: '#4EC87A', flexShrink: 0 }} />
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

        {/* Check Type — trained skills */}
        {trainedSkills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 6 }}>
              Check Type
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {trainedSkills.map(skill => {
                const isSelected = selectedSkillKey === skill.name
                const color = CHAR_COLOR[skill.charKey]
                const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
                return (
                  <button
                    key={skill.key}
                    onClick={() => isSelected ? (setSelectedSkillKey(null), setPool(p => ({ ...p, proficiency: 0, ability: 0 }))) : loadSkill(skill)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '5px 8px', borderRadius: 3, cursor: 'pointer', textAlign: 'left',
                      borderLeft: `2px solid ${isSelected ? color : `${color}60`}`,
                      background: isSelected ? `${color}18` : 'transparent',
                      border: `1px solid ${isSelected ? `${color}50` : 'transparent'}`,
                      borderLeftColor: isSelected ? color : `${color}60`,
                      transition: '.12s', width: '100%',
                    }}
                  >
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: isSelected ? color : C.text }}>
                      {skill.name}
                    </div>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {Array.from({ length: proficiency }).map((_, i) => (
                        <div key={`p${i}`} style={{ width: 7, height: 7, background: '#D4B840', transform: 'rotate(45deg)', flexShrink: 0 }} />
                      ))}
                      {Array.from({ length: ability }).map((_, i) => (
                        <div key={`a${i}`} style={{ width: 7, height: 7, borderRadius: '50%', background: '#4EC87A', flexShrink: 0 }} />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Range Band */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: 6 }}>
            Range Band
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {RANGE_BANDS.map(band => {
              const isActive = selectedRangeBand === band.label
              return (
                <button
                  key={band.label}
                  onClick={() => setRangeBand(band)}
                  style={{
                    background: isActive ? 'rgba(144,96,208,0.22)' : 'transparent',
                    border: `1px solid ${isActive ? '#9060D0' : C.border}`,
                    borderRadius: 3, padding: '3px 8px', cursor: 'pointer',
                    fontFamily: FONT_RAJDHANI, fontWeight: 700, letterSpacing: '0.06em',
                    transition: '.12s', whiteSpace: 'nowrap', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  }}
                >
                  <span style={{ fontSize: 12, color: isActive ? '#9060D0' : C.text }}>{band.label}</span>
                  <span style={{ fontSize: 10, color: isActive ? '#9060D080' : C.textFaint }}>{band.sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Positive dice */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
          {POSITIVE.map(type => (
            <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
          ))}
        </div>

        <div style={{ height: 1, background: C.border, margin: '0 0 12px' }} />

        {/* Negative dice */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
          {NEGATIVE.map(type => (
            <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
          ))}
        </div>

        {/* Roll button */}
        <button
          onClick={handleRoll}
          disabled={isEmpty}
          style={{
            width: '100%', padding: '10px 0',
            background: isEmpty ? C.textFaint : selectedWeapon ? 'linear-gradient(135deg, #E07855, #A04030)' : 'linear-gradient(135deg, #C8AA50, #8E6E2A)',
            border: 'none', borderRadius: 4, cursor: isEmpty ? 'not-allowed' : 'pointer',
            fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.12em', color: isEmpty ? C.textDim : C.bg,
            transition: '.2s',
            boxShadow: isEmpty ? 'none' : `0 2px 12px ${selectedWeapon ? '#E0785540' : `${C.gold}40`}`,
          }}
        >
          {isEmpty ? 'ADD DICE TO ROLL' : selectedWeapon ? `ATTACK — ${selectedWeapon.name}` : `ROLL ${poolSize(pool)} DICE`}
        </button>

        {!isEmpty && (
          <button onClick={clearPool} style={{
            width: '100%', marginTop: 6, padding: '5px 0',
            background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 4, cursor: 'pointer',
            fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.08em', color: C.textDim, transition: '.15s',
          }}>
            Clear Pool
          </button>
        )}
      </div>

      {/* Symbol Legend */}
      <div style={{ ...panelBase, padding: '12px 12px 10px' }}>
        <CornerBrackets />
        <SectionLabel text="Symbol Legend" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          {(Object.entries(SYM) as [string, typeof SYM[keyof typeof SYM]][]).map(([, sym]) => (
            <div key={sym.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
              <span style={{ fontSize: 14, color: sym.color, width: 18, textAlign: 'center', flexShrink: 0, filter: `drop-shadow(0 0 4px ${sym.color}60)` }}>
                {sym.icon}
              </span>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: C.textDim }}>
                {sym.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
