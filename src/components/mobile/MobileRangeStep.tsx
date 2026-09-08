'use client'

import { RANGE_BAND_ORDER, RANGE_BAND_LABELS, getRangedDifficulty, type RangeBand } from '@/lib/combatCheckUtils'
import { DiceFace } from '@/components/dice/DiceFace'

export interface MobileRangeStepProps {
  skillKey: string
  maxRange: RangeBand
  selectedBand: RangeBand | null
  onSelectBand: (band: RangeBand) => void
  difficultyAdd: number
  onDeltaChange: (delta: number) => void
}

export function MobileRangeStep({ skillKey, maxRange, selectedBand, onSelectBand, difficultyAdd, onDeltaChange }: MobileRangeStepProps) {
  const results = RANGE_BAND_ORDER.map(band => ({ band, result: getRangedDifficulty(band, skillKey, maxRange) }))
  const selected = selectedBand ? results.find(r => r.band === selectedBand) : null
  const baseDiff = selected?.result.difficultyDice ?? 0
  const total = Math.max(0, baseDiff + difficultyAdd)

  return (
    <div>
      <div className="m-range-grid">
        {results.map(({ band, result }) => (
          <button
            key={band}
            type="button"
            className={`m-range-cell${selectedBand === band ? ' is-selected' : ''}`}
            disabled={result.blocked}
            onClick={() => onSelectBand(band)}
          >
            <span className="m-range-cell-label">{RANGE_BAND_LABELS[band]}</span>
            <span className="m-range-cell-pips">
              {Array.from({ length: result.challengeDice }).map((_, i) => <DiceFace key={`c${i}`} type="challenge" size={14} />)}
              {Array.from({ length: result.difficultyDice }).map((_, i) => <DiceFace key={`d${i}`} type="difficulty" size={14} />)}
            </span>
            <span className="m-range-cell-note">{result.blocked ? 'Out of range' : (result.notes[0] ?? '')}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="m-range-derivation">
          <span>
            {RANGE_BAND_LABELS[selected.band]} → {baseDiff} difficulty {difficultyAdd !== 0 ? `${difficultyAdd > 0 ? '+' : ''}${difficultyAdd}` : ''} = {total}
          </span>
          <span className="m-delta-stepper">
            <button type="button" className="m-delta-btn" onClick={() => onDeltaChange(-1)} disabled={baseDiff + difficultyAdd <= 0}>−</button>
            <span className="m-delta-value">{difficultyAdd}</span>
            <button type="button" className="m-delta-btn" onClick={() => onDeltaChange(1)}>+</button>
          </span>
        </div>
      )}
    </div>
  )
}
