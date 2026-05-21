'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import { SYM, DICE_META, type DiceType, type SymbolKey } from '@/components/player-hud/design-tokens'
import type { RollResult, DieResult } from '@/components/player-hud/dice-engine'
import type { CharacterWeapon, RefWeapon } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { RangeBand } from '@/lib/combatCheckUtils'
import { RANGE_BAND_LABELS, isRangedSkill } from '@/lib/combatCheckUtils'
import type { CriticalEligibility } from '@/lib/criticalUtils'
import { checkCriticalEligibility } from '@/lib/criticalUtils'
import type { DualWieldState } from './DicePoolReviewStep'
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SYM_COLOR } from '@/lib/tokens'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM  = 'var(--hud-text-faint)'
const TEXT = 'var(--hud-text)'
const TEXT_DIM = 'var(--hud-text-dim)'


interface RollResultStepProps {
  result:      RollResult
  attackType:  'ranged' | 'melee'
  weapon:      CharacterWeapon | null
  refWeapon:   RefWeapon | null
  targets:     AdversaryInstance[]
  rangeBand:   RangeBand | null
  characterBrawn: number
  critEligibility?: CriticalEligibility | null
  onRollAgain: () => void
  onNewAttack: () => void
  /** Dual wield state — when set, shows secondary damage opportunity */
  dualWield?:                DualWieldState | null
  dualWieldSecondaryRef?:    RefWeapon | null
}

function DieChip({ die }: { die: DieResult }) {
  return (
    <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <DiceFace type={die.type as DiceType} size={36} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, pointerEvents: 'none',
      }}>
        {die.symbols.length === 0
          ? <span style={{ fontSize: 11 }}>—</span>
          : die.symbols.map((s, j) => {
              const sym = SYM[s as SymbolKey]
              return sym
                ? <i key={j} className={`ffi ffi-${sym.icon}`} style={{ fontSize: 11, color: sym.color }} />
                : <span key={j} style={{ fontSize: 11 }}>{s}</span>
            })
        }
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
      fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color,
    }}>
      <i className={`ffi ffi-${icon}`} />
      {Math.abs(count)} {symKey === 'S' ? (count > 0 ? 'Success' : 'Failure') :
                         symKey === 'A' ? (count > 0 ? 'Advantage' : 'Threat') :
                         symKey === 'T' ? 'Triumph' : 'Despair'}
    </div>
  )
}

function CritBlock({ label, eligibility, result }: {
  label: string
  eligibility: CriticalEligibility
  result: RollResult
}) {
  if (!eligibility.isEligible) return null
  return (
    <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.35)', borderRadius: 7 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.caption, fontWeight: 700, color: '#FF9800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'rgba(255,152,0,0.85)', lineHeight: 1.4 }}>
        {eligibility.triggeredByTriumph && eligibility.triggeredByAdvantage
          ? `Triumph + ${result.net.advantage} Advantages (≥ Crit ${eligibility.critRating})`
          : eligibility.triggeredByTriumph
          ? 'Triggered by Triumph — no advantage cost'
          : `${result.net.advantage} Advantages vs Crit Rating ${eligibility.critRating}`
        }
        {eligibility.totalCritModifier > 0 && (
          <span style={{ marginLeft: 8, color: '#FF9800', fontWeight: 600 }}>
            · Roll +{eligibility.totalCritModifier}
            {eligibility.viciousRating > 0 && ` (Vicious ${eligibility.viciousRating})`}
          </span>
        )}
      </div>
    </div>
  )
}

export function RollResultStep({
  result, attackType, weapon, refWeapon, targets, rangeBand,
  characterBrawn, critEligibility, onRollAgain, onNewAttack,
  dualWield, dualWieldSecondaryRef,
}: RollResultStepProps) {
  const net = result.net
  const succeeded = net.success > 0
  const isDualWield = dualWield?.enabled === true

  const isUnarmed = weapon?.id === '__unarmed__'
  const skillKey = isUnarmed ? 'BRAWL' : (refWeapon?.skill_key ?? '')
  const isMelee = !isRangedSkill(skillKey)

  // ── Primary damage ────────────────────────────────────────────────────────
  // hasBrawnScale: only true when damage_add is explicitly set (brawn-scaled melee).
  // Fixed-damage melee weapons (lightsabers etc.) have damage_add == null → use damage directly.
  const primaryRef      = isDualWield ? refWeapon : refWeapon
  const hasBrawnScale   = !isUnarmed && isMelee && primaryRef?.damage_add != null
  const baseDmg         = isUnarmed ? 0 : hasBrawnScale ? (primaryRef?.damage_add ?? 0) : (primaryRef?.damage ?? 0)
  const brawnBonus      = hasBrawnScale ? characterBrawn : 0
  const totalDmg        = baseDmg + brawnBonus + (succeeded ? net.success : 0)

  // ── Secondary damage (dual wield) ─────────────────────────────────────────
  const secRef          = dualWieldSecondaryRef ?? null
  const secIsMelee      = secRef ? !isRangedSkill(secRef.skill_key ?? '') : false
  const secHasBrawnScale = secRef != null && secIsMelee && secRef.damage_add != null
  const secBase         = secRef ? (secHasBrawnScale ? (secRef.damage_add ?? 0) : (secRef.damage ?? 0)) : 0
  const secBrawn        = secHasBrawnScale ? characterBrawn : 0
  const secTotalDmg  = secBase + secBrawn + (succeeded ? net.success : 0)

  // Secondary crit eligibility
  const secCritElig: CriticalEligibility | null = (isDualWield && secRef && succeeded)
    ? checkCriticalEligibility(result, secRef, Math.max(0, secTotalDmg - (targets[0]?.soak ?? 0)))
    : null

  const weaponName = isUnarmed ? 'Unarmed (Brawl)' : (weapon?.custom_name || refWeapon?.name || 'Weapon')
  const targetName = targets.length === 1 ? targets[0].name : targets.length > 1 ? `${targets.length} targets` : null
  const secWeaponName = dualWield?.secondaryWeapon
    ? (dualWield.secondaryWeapon.custom_name || secRef?.name || 'Secondary')
    : 'Secondary'

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
          fontFamily: FONT_DISPLAY,
          fontSize: FS.sm,
          fontWeight: 700,
          color: succeeded ? SYM_COLOR.success : SYM_COLOR.failure,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          {isDualWield ? (succeeded ? '✦ PRIMARY HIT' : 'Miss') : (succeeded ? 'Hit!' : 'Miss')}
          {isDualWield && succeeded && (
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, display: 'block', color: 'rgba(76,175,80,0.8)', textTransform: 'none', letterSpacing: 0, marginTop: 2 }}>
              {weaponName}
            </span>
          )}
        </div>
        {succeeded && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: FS.sm, color: TEXT }}>
            Damage: <strong style={{ color: HUD.gold }}>{totalDmg}</strong>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_DIM, marginLeft: 6 }}>
              ({hasBrawnScale ? `${baseDmg >= 0 ? '+' : ''}${baseDmg}+${characterBrawn} Brawn` : String(baseDmg)} + {net.success} success)
            </span>
          </div>
        )}
      </div>

      {/* Dual wield secondary opportunity */}
      {isDualWield && succeeded && secRef && (
        <div style={{
          marginBottom: 16,
          padding: '12px 14px',
          background: 'var(--hud-surface-lo)',
          border: '1px solid var(--hud-border)',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontSize: FS.caption,
            fontWeight: 700,
            color: HUD.gold,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            <i className="ffi ffi-swrpg-advantage" /><i className="ffi ffi-swrpg-advantage" /> available — secondary: {secWeaponName}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: FS.label, color: TEXT, marginBottom: 4 }}>
            Secondary damage if hit: <strong style={{ color: HUD.gold }}>{secTotalDmg}</strong>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_DIM, marginLeft: 6 }}>
              ({secBase >= 0 ? '' : ''}{secHasBrawnScale ? `+${secBase}+${characterBrawn} Brawn` : String(secBase)} + {net.success} success)
            </span>
          </div>
          <div style={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>
            Secondary hit requires <i className="ffi ffi-swrpg-advantage" /><i className="ffi ffi-swrpg-advantage" /> or <i className="ffi ffi-swrpg-triumph" /> — GM/player decides.
          </div>
        </div>
      )}

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
        fontFamily: "var(--font-body)",
        fontSize: FS.overline,
        color: GOLD_DIM,
        marginBottom: 12,
      }}>
        {weaponName}
        {targetName && <> → {targetName}</>}
        {rangeBand && <> · {RANGE_BAND_LABELS[rangeBand]}</>}
      </div>

      {/* Individual dice */}
      <div style={{
        fontFamily: FONT_DISPLAY,
        fontSize: FS.overline,
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

      {/* Critical hit notifications */}
      {isDualWield && succeeded ? (
        <div style={{ marginBottom: 16 }}>
          {critEligibility?.isEligible && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,152,0,0.08)',
              border: '1px solid rgba(255,152,0,0.45)',
              borderRadius: 8,
              marginBottom: 8,
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.caption, fontWeight: 700, color: '#FF9800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                ⚠ Critical Eligible
              </div>
              <CritBlock label={`Primary (${weaponName}) · Crit ${critEligibility.critRating}`} eligibility={critEligibility} result={result} />
              {secCritElig?.isEligible && (
                <CritBlock label={`Secondary (${secWeaponName}) · Crit ${secCritElig.critRating} (if secondary hits)`} eligibility={secCritElig} result={result} />
              )}
            </div>
          )}
        </div>
      ) : (
        critEligibility?.isEligible && (
          <div style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: 'rgba(255,152,0,0.08)',
            border: '1px solid rgba(255,152,0,0.45)',
            borderRadius: 8,
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: FS.caption,
              fontWeight: 700,
              color: '#FF9800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              ⚠ Critical Hit Available
            </div>
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: FS.caption,
              color: 'rgba(255,152,0,0.85)',
              lineHeight: 1.4,
            }}>
              {critEligibility.triggeredByTriumph && critEligibility.triggeredByAdvantage
                ? `Triumph + ${result.net.advantage} Advantages (≥ Crit ${critEligibility.critRating})`
                : critEligibility.triggeredByTriumph
                ? 'Triggered by Triumph — no advantage cost'
                : `${result.net.advantage} Advantages vs Crit Rating ${critEligibility.critRating}`
              }
              {critEligibility.totalCritModifier > 0 && (
                <span style={{ marginLeft: 8, color: '#FF9800', fontWeight: 600 }}>
                  · Roll +{critEligibility.totalCritModifier}
                  {critEligibility.viciousRating > 0 && ` (Vicious ${critEligibility.viciousRating})`}
                </span>
              )}
            </div>
          </div>
        )
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onRollAgain}
          style={{
            width: '100%', height: 44,
            background: 'rgba(224,58,30,0.1)',
            border: `1px solid ${GOLD_DIM}`,
            borderRadius: 8, cursor: 'pointer',
            fontFamily: FONT_DISPLAY,
            fontSize: FS.label,
            color: HUD.gold,
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
            border: `1px solid var(--hud-border)`,
            borderRadius: 8, cursor: 'pointer',
            fontFamily: FONT_BODY,
            fontSize: FS.label,
            color: TEXT_DIM,
          }}
        >
          New Attack
        </button>
      </div>
    </div>
  )
}

