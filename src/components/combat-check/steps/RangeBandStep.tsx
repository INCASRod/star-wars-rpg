'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import type { RefWeapon } from '@/lib/types'
import {
  type RangeBand,
  RANGE_BAND_ORDER,
  RANGE_BAND_LABELS,
  RANGE_VALUE_MAP,
  getRangedDifficulty,
  bandIndex,
} from '@/lib/combatCheckUtils'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const CARD_BG   = 'rgba(255,255,255,0.03)'
const RED_SOFT  = '#e05252'
const PURPLE    = '#9060D0'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

interface RangeBandStepProps {
  attackType:       'ranged' | 'melee'
  weapon:           { skillKey: string; refWeapon: RefWeapon | null } | null
  selectedBand:     RangeBand | null
  onSelect:         (band: RangeBand) => void
}

function DifficultyDice({ count, challenge = 0 }: { count: number; challenge?: number }) {
  if (count === 0 && challenge === 0) {
    return <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: TEXT_DIM }}>Simple (—)</span>
  }
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <DiceFace key={`d${i}`} type="difficulty" size={16} />
      ))}
      {Array.from({ length: challenge }).map((_, i) => (
        <DiceFace key={`c${i}`} type="challenge" size={16} />
      ))}
    </div>
  )
}

export function RangeBandStep({ attackType, weapon, selectedBand, onSelect }: RangeBandStepProps) {
  // For melee, simplified view
  if (attackType === 'melee') {
    const refW = weapon?.refWeapon
    const maxRange = refW?.range_value ? (RANGE_VALUE_MAP[refW.range_value] ?? 'engaged') : 'engaged'
    const canReachShort = bandIndex(maxRange) >= bandIndex('short')

    // If melee weapon can only reach engaged — auto-select and show static
    if (!canReachShort && selectedBand !== 'engaged') {
      onSelect('engaged')
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BandCard
          band="engaged"
          label="Engaged"
          difficultyDice={0}
          challengeDice={0}
          notes={['Melee attacks require Engaged range']}
          blocked={false}
          selected={selectedBand === 'engaged' || !canReachShort}
          dimmed={false}
          onSelect={onSelect}
          isOnly={!canReachShort}
        />
        {canReachShort && (
          <BandCard
            band="short"
            label="Short"
            difficultyDice={0}
            challengeDice={0}
            notes={['Extended reach — opposed check difficulty unchanged']}
            blocked={false}
            selected={selectedBand === 'short'}
            dimmed={false}
            onSelect={onSelect}
          />
        )}
      </div>
    )
  }

  // Ranged
  const refW = weapon?.refWeapon
  const skillKey = weapon?.skillKey ?? 'RANGLT'
  const maxRange = refW?.range_value ? (RANGE_VALUE_MAP[refW.range_value] ?? 'extreme') : 'extreme'

  const DIFF_LABELS = ['—', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {RANGE_BAND_ORDER.map(band => {
        const result  = getRangedDifficulty(band, skillKey, maxRange)
        const blocked = result.blocked
        const label   = RANGE_BAND_LABELS[band]
        const diffLabel = blocked ? 'Out of range' : (DIFF_LABELS[result.difficultyDice] ?? `${result.difficultyDice} Diff`)

        return (
          <BandCard
            key={band}
            band={band}
            label={label}
            difficultyDice={result.difficultyDice}
            challengeDice={result.challengeDice}
            notes={result.notes}
            blocked={blocked}
            selected={selectedBand === band}
            dimmed={blocked}
            onSelect={onSelect}
            diffLabel={diffLabel}
          />
        )
      })}

      <div style={{
        marginTop: 8,
        fontFamily: FONT_R,
        fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
        color: TEXT_DIM,
        lineHeight: 1.4,
        padding: '8px 10px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 6,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        Max range: <strong style={{ color: GOLD }}>{RANGE_BAND_LABELS[maxRange]}</strong>.
        Difficulty dice represent the check&apos;s inherent challenge.
      </div>
    </div>
  )
}

function BandCard({
  band, label, difficultyDice, challengeDice, notes, blocked, selected, dimmed, onSelect, diffLabel, isOnly,
}: {
  band: RangeBand
  label: string
  difficultyDice: number
  challengeDice: number
  notes: string[]
  blocked: boolean
  selected: boolean
  dimmed: boolean
  onSelect: (b: RangeBand) => void
  diffLabel?: string
  isOnly?: boolean
}) {
  return (
    <button
      onClick={() => !blocked && onSelect(band)}
      disabled={blocked}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: selected ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)',
        border: `${selected ? 2 : 1}px solid ${selected ? GOLD : 'rgba(200,170,80,0.12)'}`,
        borderRadius: 8,
        cursor: blocked ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: dimmed ? 0.35 : 1,
        transition: 'border-color 120ms, background 120ms',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
          fontWeight: 700,
          color: blocked ? TEXT_DIM : selected ? GOLD : TEXT,
          marginBottom: notes.length > 0 ? 4 : 0,
        }}>
          {label}
          {isOnly && <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)', color: GOLD_DIM, marginLeft: 8 }}>AUTO-SELECTED</span>}
        </div>
        {notes.length > 0 && (
          <div style={{
            fontFamily: FONT_R,
            fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
            color: blocked ? '#e05252' : GOLD_DIM,
            lineHeight: 1.3,
          }}>
            {notes.join(' · ')}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {!blocked && <DifficultyDice count={difficultyDice} challenge={challengeDice} />}
        {blocked && (
          <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.58rem, 0.88vw, 0.68rem)', color: '#e05252' }}>
            {diffLabel ?? 'Blocked'}
          </span>
        )}
        {!blocked && diffLabel && (
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)', color: TEXT_DIM, marginTop: 2 }}>
            {diffLabel}
          </div>
        )}
      </div>
    </button>
  )
}
