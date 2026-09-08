'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import type { DiceType } from '@/lib/tokens'
import type { ManualAdjustments } from '@/components/player-hud/dice-engine'
import { MobileModifierDeck, type ModifierDeckBasePool, type ModifierDeckExtras } from './MobileModifierDeck'

const DIE_ORDER: DiceType[] = ['proficiency', 'ability', 'boost', 'force', 'difficulty', 'challenge', 'setback']

export interface MobilePoolStepProps {
  finalPool: Record<DiceType, number>
  /** Base pool BEFORE any player modification, but including talent boost —
      i.e. what the character sheet + derivation alone would roll. Used only
      to tell "from the sheet" dice apart from "player added" dice in the
      readout; never used for any calculation. */
  sheetBasePool: Record<DiceType, number>
  basePool: ModifierDeckBasePool
  adjustments: ManualAdjustments
  onAdjustmentsChange: (adj: ManualAdjustments) => void
  extras: ModifierDeckExtras
  onExtrasChange: (extras: ModifierDeckExtras) => void
  difficultyFloor?: number
  deckExpanded: boolean
  onDeckExpandedChange: (expanded: boolean) => void
  onReset: () => void
}

export function MobilePoolStep({
  finalPool, sheetBasePool, basePool, adjustments, onAdjustmentsChange, extras, onExtrasChange,
  difficultyFloor, deckExpanded, onDeckExpandedChange, onReset,
}: MobilePoolStepProps) {
  return (
    <div>
      <div className="m-pool-readout">
        <div className="m-pool-dice">
          {DIE_ORDER.flatMap(type => {
            const total = finalPool[type] ?? 0
            const fromSheet = Math.min(total, sheetBasePool[type] ?? 0)
            const added = total - fromSheet
            const dice: React.ReactNode[] = []
            for (let i = 0; i < fromSheet; i++) {
              dice.push(<DiceFace key={`${type}-sheet-${i}`} type={type} size={32} />)
            }
            for (let i = 0; i < added; i++) {
              dice.push(
                <span key={`${type}-added-${i}`} className="m-pool-die-wrap">
                  <DiceFace type={type} size={32} />
                  <span className="m-pool-die-added-dot" aria-hidden="true" />
                </span>,
              )
            }
            return dice
          })}
          {finalPool && Object.values(finalPool).every(v => !v) && <span className="m-weapon-stats">No dice yet</span>}
        </div>
        <div className="m-pool-legend">
          <span className="m-pool-legend-item"><DiceFace type="ability" size={16} /> From sheet / derivation</span>
          <span className="m-pool-legend-item"><span className="m-pool-legend-dot" /> Added by you</span>
        </div>
      </div>

      <MobileModifierDeck
        adjustments={adjustments}
        onChange={onAdjustmentsChange}
        extras={extras}
        onExtrasChange={onExtrasChange}
        basePool={basePool}
        difficultyFloor={difficultyFloor}
        expanded={deckExpanded}
        onExpandedChange={onDeckExpandedChange}
        onReset={onReset}
      />
    </div>
  )
}
