'use client'

import { useState } from 'react'
import { DICE_META, SYM, EMPTY_POOL, type DiceType } from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { rollPool, rollForceDice, poolSize, type RollResult, type ForceRollResult } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import { HUD } from '@/lib/tokens'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM  = 'var(--hud-text-dim)'
const TEXT      = 'var(--hud-text)'
const TEXT_DIM  = 'var(--hud-text-dim)'
const BORDER    = 'var(--hud-border)'
const FONT_C    = 'var(--font-body)'
const FONT_M    = 'var(--font-body)'
const LIGHT_COL = '#E8E870'
const DARK_COL  = '#8070D8'

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

type Mode = 'pool' | 'force'

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
              border: `1px solid ${BORDER}`,
              borderRadius: '8px 0 0 8px',
              cursor: count > 0 ? 'pointer' : 'not-allowed',
              fontFamily: FONT_C,
              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
              color: count > 0 ? HUD.gold : 'var(--hud-text-faint)',
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
            border: `1px solid ${BORDER}`,
            borderLeft: 'none', borderRight: 'none',
          }}>
            {count}
          </div>
          <button
            onClick={onAdd}
            style={{
              width: 44, height: 44,
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              fontFamily: FONT_C,
              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
              color: HUD.gold,
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
              <i className="ffi ffi-swrpg-triumph" />{' TRIUMPH ×'}{triumph}
            </span>
          )}
          {despair > 0 && (
            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)', color: '#FF6060' }}>
              <i className="ffi ffi-swrpg-despair" />{' DESPAIR ×'}{despair}
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
                  SYM[sym]?.icon
                    ? <i key={j} className={`ffi ffi-${SYM[sym]!.icon}`} style={{ fontSize: 12, color: SYM[sym]!.color, filter: `drop-shadow(0 0 3px ${SYM[sym]!.color}60)` }} />
                    : <span key={j} style={{ fontSize: 12, color: TEXT }}>{sym}</span>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Force result display ─────────────────────────────────────────────────────
function ForceResult({ result }: { result: ForceRollResult }) {
  const { dice, totalLight, totalDark } = result
  return (
    <div style={{
      marginTop: 16,
      padding: '12px 16px',
      background: 'rgba(0,0,0,0.2)',
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 700, color: LIGHT_COL, lineHeight: 1 }}>
            {totalLight}
          </div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: TEXT_DIM, marginTop: 2 }}>
            LIGHT
          </div>
        </div>
        <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 700, color: DARK_COL, lineHeight: 1 }}>
            {totalDark}
          </div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: TEXT_DIM, marginTop: 2 }}>
            DARK
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {dice.map((die, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <DiceFace type="force" size={28} />
            <div style={{ display: 'flex', gap: 3, minHeight: 8 }}>
              {Array.from({ length: die.light }).map((_, j) => (
                <div key={`l${j}`} style={{ width: 7, height: 7, borderRadius: '50%', background: LIGHT_COL }} />
              ))}
              {Array.from({ length: die.dark }).map((_, j) => (
                <div key={`k${j}`} style={{ width: 7, height: 7, borderRadius: '50%', background: DARK_COL }} />
              ))}
              {die.light === 0 && die.dark === 0 && (
                <span style={{ fontFamily: FONT_M, fontSize: 9, color: TEXT_DIM }}>—</span>
              )}
            </div>
          </div>
        ))}
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

  const [mode,        setMode]        = useState<Mode>('pool')
  const [pool,        setPool]        = useState<Record<DiceType, number>>(initPool)
  const [result,      setResult]      = useState<RollResult | null>(null)
  const [forceCount,  setForceCount]  = useState(1)
  const [forceResult, setForceResult] = useState<ForceRollResult | null>(null)

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

  const handleRollForce = () => {
    setForceResult(rollForceDice(forceCount))
  }

  const isEmpty = poolSize(pool) === 0

  return (
    <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Mode tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
        {(['pool', 'force'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${mode === m ? HUD.gold : 'transparent'}`,
              cursor: 'pointer',
              fontFamily: FONT_M,
              fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: mode === m ? HUD.gold : GOLD_DIM,
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {m === 'pool' ? 'Dice Pool' : 'Force Dice'}
          </button>
        ))}
      </div>

      {mode === 'pool' ? (
        <>
          {/* Skill header */}
          {prePopSkill ? (
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)', fontWeight: 700, color: HUD.gold }}>
                {prePopSkill.name}
              </div>
              <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: GOLD_DIM, marginTop: 2 }}>
                {prePopSkill.charAbbr}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', fontWeight: 700, color: HUD.gold, textAlign: 'center', marginBottom: 4 }}>
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
          <div style={{ height: 1, background: BORDER }} />

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
                ? 'var(--hud-surface-lo)'
                : 'linear-gradient(135deg, #C8AA50, #8B7430)',
              border: 'none',
              borderRadius: 10,
              cursor: isEmpty ? 'not-allowed' : 'pointer',
              fontFamily: FONT_C,
              fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: isEmpty ? 'var(--hud-text-faint)' : 'var(--hud-text)',
              marginTop: 4,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {isEmpty ? 'Add Dice to Roll' : `Roll ${poolSize(pool)} Dice`}
          </button>

          {result && <ResultDisplay result={result} />}
        </>
      ) : (
        <>
          {/* Force die + stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <DiceFace type="force" size={40} active />

            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <button
                onClick={() => setForceCount(c => Math.max(1, c - 1))}
                disabled={forceCount <= 1}
                style={{
                  width: 44, height: 44,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '8px 0 0 8px',
                  cursor: forceCount > 1 ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_C,
                  fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                  color: forceCount > 1 ? HUD.gold : 'var(--hud-text-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <div style={{
                minWidth: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_C,
                fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                fontWeight: 700,
                color: TEXT,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BORDER}`,
                borderLeft: 'none', borderRight: 'none',
              }}>
                {forceCount}
              </div>
              <button
                onClick={() => setForceCount(c => Math.min(8, c + 1))}
                disabled={forceCount >= 8}
                style={{
                  width: 44, height: 44,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '0 8px 8px 0',
                  cursor: forceCount < 8 ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_C,
                  fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                  color: forceCount < 8 ? HUD.gold : 'var(--hud-text-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>

            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: GOLD_DIM }}>
              {forceCount === 1 ? '1 die' : `${forceCount} dice`}
            </span>
          </div>

          {/* Roll Force button */}
          <button
            onClick={handleRollForce}
            style={{
              width: '100%',
              height: 52,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: FONT_C,
              fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: TEXT,
              marginTop: 4,
            }}
          >
            Roll Force
          </button>

          {forceResult && <ForceResult result={forceResult} />}
        </>
      )}
    </div>
  )
}
