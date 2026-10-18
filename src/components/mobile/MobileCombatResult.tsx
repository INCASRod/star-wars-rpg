'use client'

import { symbolKinds } from '@/components/dice/symbolKind'
import { RolledDie } from '@/components/dice/RolledDie'
import type { RollResult } from '@/components/player-hud/dice-engine'
import type { CriticalEligibility } from '@/lib/criticalUtils'
import { SYM, SYM_COLOR, type SymbolKey } from '@/lib/tokens'
import type { DiceType } from '@/lib/tokens'

function NetPill({ count, symKey }: { count: number; symKey: SymbolKey }) {
  if (count === 0) return null
  const label = symKey === 'S' ? (count > 0 ? 'Success' : 'Failure')
    : symKey === 'A' ? (count > 0 ? 'Advantage' : 'Threat')
    : symKey === 'T' ? 'Triumph' : 'Despair'
  return (
    <span className="m-cr-pill" style={{ color: SYM[symKey].color, borderColor: SYM[symKey].color /* die-identity/symbol colour — sealed namespace */ }}>
      {Math.abs(count)} {label}
    </span>
  )
}

export interface MobileCritInfo {
  label: string
  eligibility: CriticalEligibility
}

export interface MobileCombatResultProps {
  result: RollResult
  weaponName: string
  netDamageEstimate: number | null
  crit: MobileCritInfo | null
  secondary?: { weaponName: string; netDamageEstimate: number | null; crit: MobileCritInfo | null } | null
  onRollAgain: () => void
  onNewAttack: () => void
}

export function MobileCombatResult({ result, weaponName, netDamageEstimate, crit, secondary, onRollAgain, onNewAttack }: MobileCombatResultProps) {
  const succeeded = result.net.success > 0

  return (
    <div>
      <div className={`m-cr-banner ${succeeded ? 'is-success' : 'is-failure'}`}>
        <div className="m-cr-banner-title">{succeeded ? 'Success' : result.net.success < 0 ? 'Failure' : 'Wash'}</div>
        <div className="m-weapon-stats">{weaponName}{netDamageEstimate != null ? ` · ${netDamageEstimate} damage (before soak — no target selected)` : ''}</div>
      </div>

      <div className="m-cr-pills">
        <NetPill count={result.net.success} symKey="S" />
        <NetPill count={result.net.advantage} symKey="A" />
        <NetPill count={result.net.triumph} symKey="T" />
        <NetPill count={result.net.despair} symKey="D" />
      </div>

      <div className="m-deck-group-label">Dice rolled</div>
      <div className="m-cr-dice">
        {result.dice.map((die, i) => <RolledDie key={i} type={die.type as DiceType} symbols={symbolKinds(die.symbols)} size="xxl" />)}
      </div>

      {crit?.eligibility.isEligible && (
        <div className="m-cr-crit">
          <div className="m-cr-crit-label">{crit.label}</div>
          <div className="m-cr-crit-body">
            {crit.eligibility.triggeredByTriumph && crit.eligibility.triggeredByAdvantage
              ? `Triumph + ${result.net.advantage} Advantages (≥ Crit ${crit.eligibility.critRating})`
              : crit.eligibility.triggeredByTriumph
                ? 'Triggered by Triumph — no advantage cost'
                : `${result.net.advantage} Advantages vs Crit Rating ${crit.eligibility.critRating}`}
            {crit.eligibility.totalCritModifier > 0 && ` · Roll +${crit.eligibility.totalCritModifier}`}
          </div>
        </div>
      )}

      {secondary && (
        <>
          <div className="m-deck-group-label">Secondary — {secondary.weaponName}</div>
          <div className="m-weapon-stats">
            Hits by spending 2 Advantage or Triumph.
            {secondary.netDamageEstimate != null ? ` ${secondary.netDamageEstimate} damage (before soak).` : ''}
          </div>
          {secondary.crit?.eligibility.isEligible && (
            <div className="m-cr-crit">
              <div className="m-cr-crit-label">{secondary.crit.label}</div>
              <div className="m-cr-crit-body">
                {secondary.crit.eligibility.totalCritModifier > 0 ? `Roll +${secondary.crit.eligibility.totalCritModifier}` : 'Eligible'}
              </div>
            </div>
          )}
        </>
      )}

      <div className="m-cr-actions">
        <button type="button" className="m-sheet-btn" onClick={onRollAgain}>Roll Again</button>
        <button type="button" className="m-sheet-btn is-primary" onClick={onNewAttack}>New Attack</button>
      </div>
    </div>
  )
}
