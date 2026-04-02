'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import { SYM, DICE_META, type DiceType, type SymbolKey } from '@/components/player-hud/design-tokens'
import type { RollResult, DieResult } from '@/components/player-hud/dice-engine'
import type { CharacterWeapon, RefWeapon } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { RangeBand } from '@/lib/combatCheckUtils'
import { RANGE_BAND_LABELS, isRangedSkill } from '@/lib/combatCheckUtils'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.5)'
const FONT_C   = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Share Tech Mono', 'Courier New', monospace"

interface RollResultStepProps {
  result:      RollResult
  attackType:  'ranged' | 'melee'
  weapon:      CharacterWeapon | null
  refWeapon:   RefWeapon | null
  targets:     AdversaryInstance[]
  rangeBand:   RangeBand | null
  characterBrawn: number
  onRollAgain: () => void
  onNewAttack: () => void
}

function DieChip({ die }: { die: DieResult }) {
  const label = die.symbols.length === 0 ? '—' : die.symbols.map(s => SYM[s as SymbolKey]?.icon ?? s).join('')
  return (
    <div style={{
      position: 'relative', width: 36, height: 36, flexShrink: 0,
    }}>
      <DiceFace type={die.type as DiceType} size={36} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, pointerEvents: 'none',
      }}>
        {label}
      </div>
    </div>
  )
}

function NetPill({ count, symKey }: { count: number; symKey: SymbolKey }) {
  if (count === 0) return null
  const { icon, color } = SYM[symKey]
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 4,
      background: `${color}18`, border: `1px solid ${color}50`,
      fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)', fontWeight: 700, color,
    }}>
      <span>{icon}</span>
      {Math.abs(count)} {symKey === 'S' ? (count > 0 ? 'Success' : 'Failure') :
                         symKey === 'A' ? (count > 0 ? 'Advantage' : 'Threat') :
                         symKey === 'T' ? 'Triumph' : 'Despair'}
    </div>
  )
}

export function RollResultStep({
  result, attackType, weapon, refWeapon, targets, rangeBand,
  characterBrawn, onRollAgain, onNewAttack,
}: RollResultStepProps) {
  const net = result.net
  const succeeded = net.success > 0

  const isUnarmed = weapon?.id === '__unarmed__'
  const skillKey = isUnarmed ? 'BRAWL' : (refWeapon?.skill_key ?? '')
  const isMelee = !isRangedSkill(skillKey)

  // Damage calculation (only if succeeded)
  const baseDmg = isUnarmed ? 0 : (isMelee ? (refWeapon?.damage_add ?? 0) : (refWeapon?.damage ?? 0))
  const brawnBonus = isMelee ? characterBrawn : 0
  const totalDmg = baseDmg + brawnBonus + (succeeded ? net.success : 0)

  const weaponName = isUnarmed ? 'Unarmed (Brawl)' : (weapon?.custom_name || refWeapon?.name || 'Weapon')
  const targetName = targets.length === 1 ? targets[0].name : targets.length > 1 ? `${targets.length} targets` : null

  return (
    <div>
      {/* Success / Failure banner */}
      <div style={{
        padding: '14px 16px',
        background: succeeded ? 'rgba(76,175,80,0.08)' : 'rgba(224,80,80,0.08)',
        border: `1px solid ${succeeded ? 'rgba(76,175,80,0.3)' : 'rgba(224,80,80,0.3)'}`,
        borderRadius: 10,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: FONT_C,
          fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
          fontWeight: 700,
          color: succeeded ? '#4CAF50' : '#e05252',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          {succeeded ? 'Hit!' : 'Miss'}
        </div>
        {succeeded && (
          <div style={{
            fontFamily: FONT_M,
            fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
            color: TEXT,
          }}>
            Damage: <strong style={{ color: '#E07855' }}>{totalDmg}</strong>
            <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: TEXT_DIM, marginLeft: 6 }}>
              ({isMelee ? `${baseDmg >= 0 ? '+' : ''}${baseDmg}+${characterBrawn} Brawn` : String(baseDmg)} + {net.success} success)
            </span>
          </div>
        )}
      </div>

      {/* Net results */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {net.success !== 0 && (
          <NetPill count={net.success} symKey={net.success > 0 ? 'S' : 'F'} />
        )}
        {net.advantage !== 0 && (
          <NetPill count={net.advantage} symKey={net.advantage > 0 ? 'A' : 'H'} />
        )}
        {net.triumph > 0 && <NetPill count={net.triumph} symKey="T" />}
        {net.despair > 0 && <NetPill count={net.despair} symKey="D" />}
      </div>

      {/* Context */}
      <div style={{
        fontFamily: FONT_M,
        fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
        color: GOLD_DIM,
        marginBottom: 12,
      }}>
        {weaponName}
        {targetName && <> → {targetName}</>}
        {rangeBand && <> · {RANGE_BAND_LABELS[rangeBand]}</>}
      </div>

      {/* Individual dice */}
      <div style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
        color: GOLD_DIM,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 8,
      }}>
        Dice rolled
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {result.dice.map((die, i) => (
          <DieChip key={i} die={die} />
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onRollAgain}
          style={{
            width: '100%', height: 44,
            background: 'rgba(200,170,80,0.1)',
            border: `1px solid ${GOLD_DIM}`,
            borderRadius: 8, cursor: 'pointer',
            fontFamily: FONT_C,
            fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
            color: GOLD,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}
        >
          Roll Again
        </button>
        <button
          onClick={onNewAttack}
          style={{
            width: '100%', height: 44,
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 8, cursor: 'pointer',
            fontFamily: FONT_R,
            fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
            color: TEXT_DIM,
          }}
        >
          New Attack
        </button>
      </div>
    </div>
  )
}
