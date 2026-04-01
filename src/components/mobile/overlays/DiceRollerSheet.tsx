'use client'

import { useState } from 'react'
import { DICE_META, SYM, EMPTY_POOL, type DiceType } from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { rollPool, poolSize, type RollResult } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.6)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.5)'
const FONT_C   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Courier New', monospace"

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MobilePrePopSkill {
  name: string
  charAbbr: string
  proficiency: number
  ability: number
}

interface DiceRollerSheetProps {
  prePopSkill: MobilePrePopSkill | null  // null = free roller from header
  characterId: string | null
  characterName: string
  campaignId: string | null | undefined
}

// ─── Dice types shown in the sheet ───────────────────────────────────────────
const ADJUSTABLE: DiceType[] = ['difficulty', 'challenge', 'boost', 'setback']

// ─── Small +/- stepper for a single dice type ────────────────────────────────
function DiceStepper({
  type, count, locked,
  onAdd, onRemove,
}: {
  type: DiceType
  count: number
  locked?: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  const meta = DICE_META[type]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Shape icon */}
      <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DiceFace type={type} size={24} />
      </div>

      <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: meta.color, width: 28 }}>
        {meta.label}
      </span>

      {locked ? (
        <span style={{
          fontFamily: FONT_C,
          fontSize: 'clamp(1rem, 4vw, 1.3rem)',
          fontWeight: 700,
          color: meta.color,
          minWidth: 32,
          textAlign: 'center',
        }}>
          {count}
        </span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <button
            onClick={onRemove}
            disabled={count <= 0}
            style={{
              width: 44, height: 44,
              background: 'transparent',
              border: `1px solid rgba(200,170,80,0.2)`,
              borderRadius: '8px 0 0 8px',
              cursor: count > 0 ? 'pointer' : 'not-allowed',
              fontFamily: FONT_C,
              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
              color: count > 0 ? GOLD : 'rgba(200,170,80,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            −
          </button>
          <div style={{
            minWidth: 36, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_C,
            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
            fontWeight: 700,
            color: meta.color,
            background: `${meta.color}0C`,
            border: `1px solid rgba(200,170,80,0.15)`,
            borderLeft: 'none', borderRight: 'none',
          }}>
            {count}
          </div>
          <button
            onClick={onAdd}
            style={{
              width: 44, height: 44,
              background: 'transparent',
              border: `1px solid rgba(200,170,80,0.2)`,
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              fontFamily: FONT_C,
              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
              color: GOLD,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Roll result display ──────────────────────────────────────────────────────
function ResultDisplay({ result }: { result: RollResult }) {
  const { success, advantage, triumph, despair } = result.net
  const succeeded = success > 0

  return (
    <div style={{
      marginTop: 16,
      padding: '12px 16px',
      background: succeeded ? 'rgba(78,200,122,0.08)' : 'rgba(224,80,80,0.08)',
      border: `1px solid ${succeeded ? 'rgba(78,200,122,0.3)' : 'rgba(224,80,80,0.3)'}`,
      borderRadius: 10,
    }}>
      {/* Main result */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: FONT_C,
            fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
            fontWeight: 700,
            color: succeeded ? '#4EC87A' : '#E05050',
            lineHeight: 1,
          }}>
            {succeeded ? `+${success}` : success}
          </div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: TEXT_DIM, marginTop: 2 }}>
            {succeeded ? 'SUCCESS' : 'FAILURE'}
          </div>
        </div>

        {advantage !== 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
              fontWeight: 700,
              color: advantage > 0 ? '#70C8E8' : '#B060D0',
              lineHeight: 1,
            }}>
              {advantage > 0 ? `+${advantage}` : advantage}
            </div>
            <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: TEXT_DIM, marginTop: 2 }}>
              {advantage > 0 ? 'ADV' : 'THREAT'}
            </div>
          </div>
        )}
      </div>

      {/* Triumph / Despair */}
      {(triumph > 0 || despair > 0) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {triumph > 0 && (
            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)', color: '#D4B840' }}>
              ★ TRIUMPH ×{triumph}
            </span>
          )}
          {despair > 0 && (
            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)', color: '#FF6060' }}>
              ☠ DESPAIR ×{despair}
            </span>
          )}
        </div>
      )}

      {/* Per-die symbols */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        justifyContent: 'center',
      }}>
        {result.dice.map((die, i) => {
          const meta = DICE_META[die.type]
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '2px 6px',
              background: `${meta.color}10`,
              border: `1px solid ${meta.color}30`,
              borderRadius: 6,
            }}>
              {die.symbols.length === 0 ? (
                <span style={{ fontFamily: FONT_M, fontSize: 10, color: TEXT_DIM }}>—</span>
              ) : (
                die.symbols.map((sym, j) => (
                  <span key={j} style={{ fontSize: 12, color: SYM[sym]?.color ?? TEXT, filter: `drop-shadow(0 0 3px ${SYM[sym]?.color ?? 'transparent'}60)` }}>
                    {SYM[sym]?.icon ?? sym}
                  </span>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DiceRollerSheet({ prePopSkill, characterId, characterName, campaignId }: DiceRollerSheetProps) {
  const initPool = (): Record<DiceType, number> => {
    if (!prePopSkill) return { ...EMPTY_POOL }
    return {
      ...EMPTY_POOL,
      proficiency: prePopSkill.proficiency,
      ability: prePopSkill.ability,
    }
  }

  const [pool, setPool] = useState<Record<DiceType, number>>(initPool)
  const [result, setResult] = useState<RollResult | null>(null)

  // Reset when skill changes
  const poolKey = prePopSkill ? `${prePopSkill.name}-${prePopSkill.proficiency}-${prePopSkill.ability}` : 'free'

  const addDie    = (type: DiceType) => setPool(p => ({ ...p, [type]: p[type] + 1 }))
  const removeDie = (type: DiceType) => setPool(p => ({ ...p, [type]: Math.max(0, p[type] - 1) }))

  const handleRoll = () => {
    const rolled = rollPool(pool)
    setResult(rolled)
    if (campaignId) {
      logRoll({
        campaignId,
        characterId,
        characterName,
        label: prePopSkill?.name,
        pool,
        result: rolled,
      })
    }
  }

  const isEmpty = poolSize(pool) === 0

  return (
    <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      {prePopSkill ? (
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)', fontWeight: 700, color: GOLD }}>
            {prePopSkill.name}
          </div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: GOLD_DIM, marginTop: 2 }}>
            {prePopSkill.charAbbr}
          </div>
        </div>
      ) : (
        <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', fontWeight: 700, color: GOLD, textAlign: 'center', marginBottom: 4 }}>
          Dice Roller
        </div>
      )}

      {/* Positive dice */}
      <div>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.68rem)', color: GOLD_DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Positive
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DiceStepper
            type="proficiency"
            count={pool.proficiency}
            locked={!!prePopSkill}
            onAdd={() => addDie('proficiency')}
            onRemove={() => removeDie('proficiency')}
          />
          <DiceStepper
            type="ability"
            count={pool.ability}
            locked={!!prePopSkill}
            onAdd={() => addDie('ability')}
            onRemove={() => removeDie('ability')}
          />
          <DiceStepper
            type="boost"
            count={pool.boost}
            onAdd={() => addDie('boost')}
            onRemove={() => removeDie('boost')}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(200,170,80,0.1)' }} />

      {/* Negative dice */}
      <div>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.68rem)', color: GOLD_DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Negative
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADJUSTABLE.filter(t => t !== 'boost').map(type => (
            <DiceStepper
              key={type}
              type={type}
              count={pool[type]}
              onAdd={() => addDie(type)}
              onRemove={() => removeDie(type)}
            />
          ))}
        </div>
      </div>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={isEmpty}
        style={{
          width: '100%',
          height: 52,
          background: isEmpty
            ? 'rgba(200,170,80,0.12)'
            : 'linear-gradient(135deg, #C8AA50, #8B7430)',
          border: 'none',
          borderRadius: 10,
          cursor: isEmpty ? 'not-allowed' : 'pointer',
          fontFamily: FONT_C,
          fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: isEmpty ? 'rgba(200,170,80,0.35)' : '#060D09',
          marginTop: 4,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {isEmpty ? 'Add Dice to Roll' : `Roll ${poolSize(pool)} Dice`}
      </button>

      {/* Results */}
      {result && <ResultDisplay result={result} />}
    </div>
  )
}
