'use client'

import { useEffect } from 'react'
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
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SYM_COLOR } from '@/lib/tokens'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM  = 'var(--hud-text-faint)'
const GOLD_BD   = 'var(--hud-border)'
const TEXT = 'var(--hud-text)'
const TEXT_DIM = 'var(--hud-text-dim)'
const CARD_BG   = 'var(--hud-surface-lo)'
const PURPLE    = '#9060D0'


interface RangeBandStepProps {
  attackType:       'ranged' | 'melee'
  weapon:           { skillKey: string; refWeapon: RefWeapon | null } | null
  selectedBand:     RangeBand | null
  onSelect:         (band: RangeBand) => void
}

function DifficultyDice({ count, challenge = 0, opposedLabel }: { count: number; challenge?: number; opposedLabel?: string }) {
  if (opposedLabel) {
    return <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: GOLD_DIM }}>{opposedLabel}</span>
  }
  if (count === 0 && challenge === 0) {
    return <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: TEXT_DIM }}>Simple (—)</span>
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
  // Derive melee range capability at top level (before any conditional returns)
  const meleeRefW      = weapon?.refWeapon
  const meleeMaxRange  = meleeRefW?.range_value ? (RANGE_VALUE_MAP[meleeRefW.range_value] ?? 'engaged') : 'engaged'
  const canReachShort  = bandIndex(meleeMaxRange) >= bandIndex('short')

  // Auto-select 'engaged' for melee weapons that can only reach engaged range.
  // Must be in useEffect — calling onSelect during render causes
  // "Cannot update a component while rendering a different component".
  useEffect(() => {
    if (attackType === 'melee' && !canReachShort && selectedBand !== 'engaged') {
      onSelect('engaged')
    }
  }, [attackType, canReachShort, selectedBand, onSelect])

  // For melee, simplified view
  if (attackType === 'melee') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BandCard
          band="engaged"
          label="Engaged"
          difficultyDice={0}
          challengeDice={0}
          notes={['Opposed check — difficulty set by target\'s Melee skill']}
          blocked={false}
          selected={selectedBand === 'engaged' || !canReachShort}
          dimmed={false}
          onSelect={onSelect}
          isOnly={!canReachShort}
          opposedLabel="vs. Melee Skill"
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
            opposedLabel="vs. Melee Skill"
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
        fontFamily: FONT_BODY,
        fontSize: FS.overline,
        color: TEXT_DIM,
        lineHeight: 1.4,
        padding: '8px 10px',
        background: 'var(--hud-surface-lo)',
        borderRadius: 6,
        border: `1px solid var(--hud-border)`,
      }}>
        Max range: <strong style={{ color: HUD.gold }}>{RANGE_BAND_LABELS[maxRange]}</strong>.
        Difficulty dice represent the check&apos;s inherent challenge.
      </div>
    </div>
  )
}

function BandCard({
  band, label, difficultyDice, challengeDice, notes, blocked, selected, dimmed, onSelect, diffLabel, isOnly, opposedLabel,
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
  opposedLabel?: string
}) {
  return (
    <button
      onClick={() => !blocked && onSelect(band)}
      disabled={blocked}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: selected ? 'rgba(224,58,30,0.06)' : 'rgba(224,58,30,0.01)',
        border: `${selected ? 2 : 1}px solid ${selected ? HUD.gold : 'rgba(224,58,30,0.12)'}`,
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
          fontFamily: FONT_DISPLAY,
          fontSize: FS.label,
          fontWeight: 700,
          color: blocked ? TEXT_DIM : selected ? HUD.gold : TEXT,
          marginBottom: notes.length > 0 ? 4 : 0,
        }}>
          {label}
          {isOnly && <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: GOLD_DIM, marginLeft: 8 }}>AUTO-SELECTED</span>}
        </div>
        {notes.length > 0 && (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.overline,
            color: blocked ? SYM_COLOR.failure : GOLD_DIM,
            lineHeight: 1.3,
          }}>
            {notes.join(' · ')}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {!blocked && <DifficultyDice count={difficultyDice} challenge={challengeDice} opposedLabel={opposedLabel} />}
        {blocked && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: SYM_COLOR.failure }}>
            {diffLabel ?? 'Blocked'}
          </span>
        )}
        {!blocked && diffLabel && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: TEXT_DIM, marginTop: 2 }}>
            {diffLabel}
          </div>
        )}
      </div>
    </button>
  )
}

