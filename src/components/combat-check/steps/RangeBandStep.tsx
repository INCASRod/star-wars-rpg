'use client'

import { useEffect } from 'react'
import { DiceFace } from '@/components/dice/DiceFace'
import type { RefWeapon } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import {
  type RangeBand,
  RANGE_BAND_ORDER,
  RANGE_BAND_LABELS,
  RANGE_VALUE_MAP,
  getRangedDifficulty,
  getMeleeDifficulty,
  bandIndex,
} from '@/lib/combatCheckUtils'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, SP, EASE, RADIUS, DICE_COLOR } from '@/lib/tokens'

// die clip-path geometry — not spacing
const CLIP_OCT = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
const CLIP_DIA = 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'


interface RangeBandStepProps {
  attackType:   'ranged' | 'melee'
  weapon:       { skillKey: string; refWeapon: RefWeapon | null } | null
  selectedBand: RangeBand | null
  targets?:     AdversaryInstance[]
  onSelect:     (band: RangeBand) => void
}

function CompactBandPill({
  band, label, difficultyDice, challengeDice, notes,
  blocked, selected, atMaxRange, beyondMax, onSelect,
}: {
  band:           RangeBand
  label:          string
  difficultyDice: number
  challengeDice:  number
  notes:          string[]
  blocked:        boolean
  selected:       boolean
  atMaxRange?:    boolean
  beyondMax?:     boolean
  onSelect:       (b: RangeBand) => void
}) {
  const isHighlight = atMaxRange || beyondMax

  return (
    <button
      onClick={() => !blocked && onSelect(band)}
      disabled={blocked}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          SP[2],
        padding:      `2px ${SP[2]}`,
        borderRadius: RADIUS.sm,
        border:       selected
          ? `1px solid color-mix(in srgb, var(--check-highlight, var(--hud-gold)) 45%, transparent)`
          : isHighlight
          ? `1px solid color-mix(in srgb, var(--check-accent, var(--hud-accent)) 35%, transparent)`
          : '1px solid var(--hud-border)',
        background:   selected
          ? `color-mix(in srgb, var(--check-highlight, var(--hud-gold)) 8%, transparent)`
          : 'transparent',
        cursor:       blocked ? 'not-allowed' : 'pointer',
        opacity:      blocked ? 0.35 : 1,
        width:        '100%',
        overflow:     'hidden',
        textAlign:    'left' as const,
        fontFamily:   FONT_BODY,
        transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
        marginBottom: SP[1],
      }}
    >
      {/* Range name */}
      <span style={{
        fontSize:  FS.overline,
        fontWeight: 700,
        color:     blocked ? 'var(--hud-text-faint)' : selected ? 'var(--check-highlight, var(--hud-gold))' : 'var(--hud-text)',
        minWidth:  '3.5rem',
      }}>
        {label}
      </span>

      {/* Difficulty dice */}
      {!blocked && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
          {Array.from({ length: challengeDice }).map((_, i) => (
            <DiceFace key={`c${i}`} type="challenge" size={14} />
          ))}
          {Array.from({ length: difficultyDice }).map((_, i) => (
            <DiceFace key={`d${i}`} type="difficulty" size={14} />
          ))}
          {challengeDice === 0 && difficultyDice === 0 && (
            <span style={{ fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>Simple</span>
          )}
        </div>
      )}
      {blocked && (
        <span style={{ fontSize: FS.overline, color: 'var(--state-failure)', whiteSpace: 'nowrap' }}>Out of range</span>
      )}

      {/* Right-side note */}
      <span style={{
        marginLeft:   'auto',
        fontSize:     FS.overline,
        fontStyle:    'italic',
        overflow:     'hidden',
        whiteSpace:   'nowrap',
        textOverflow: 'ellipsis',
        minWidth:     0,
        paddingLeft:  SP[1],
      }}>
        {atMaxRange && (
          <span style={{ color: 'var(--check-highlight, var(--hud-gold))' }}>max range</span>
        )}
        {beyondMax && !atMaxRange && (
          <span style={{ color: 'var(--check-accent, var(--hud-accent))' }}>{notes[0]}</span>
        )}
        {!blocked && !atMaxRange && !beyondMax && notes.length > 0 && (
          <span style={{ color: 'var(--check-accent, var(--hud-accent))' }}>{notes.join(' · ')}</span>
        )}
      </span>
    </button>
  )
}

export function RangeBandStep({ attackType, weapon, selectedBand, targets = [], onSelect }: RangeBandStepProps) {
  // Derive melee range capability at top level (before any conditional returns)
  const meleeRefW     = weapon?.refWeapon
  const meleeMaxRange = meleeRefW?.range_value ? (RANGE_VALUE_MAP[meleeRefW.range_value] ?? 'engaged') : 'engaged'
  const canReachShort = bandIndex(meleeMaxRange) >= bandIndex('short')

  // Auto-select 'engaged' for melee weapons that can only reach engaged range.
  // Must be in useEffect — calling onSelect during render causes
  // "Cannot update a component while rendering a different component".
  useEffect(() => {
    if (attackType === 'melee' && !canReachShort && selectedBand !== 'engaged') {
      onSelect('engaged')
    }
  }, [attackType, canReachShort, selectedBand, onSelect])

  // For melee, show opposed roll box + range pill(s)
  if (attackType === 'melee') {
    const primaryTarget = targets[0] ?? null
    const meleeResult   = getMeleeDifficulty(primaryTarget)
    const isFallback    = !!meleeResult.fallbackReason

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        {/* Opposed roll box */}
        {primaryTarget ? (
          <div style={{
            background:   'var(--hud-surface-lo)',
            border:       '1px solid var(--hud-border)',
            borderRadius: RADIUS.sm,
            padding:      `${SP[2]} ${SP[2]}`,
          }}>
            {isFallback ? (
              <>
                <div style={{
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--check-accent, var(--hud-accent))',
                  marginBottom: SP[1],
                }}>
                  ⚠ {meleeResult.fallbackReason}
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize:   FS.overline,
                  color:      'var(--hud-text-faint)',
                  fontStyle:  'italic',
                }}>
                  Set difficulty manually
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-text-faint)',
                  marginBottom: SP[1],
                }}>
                  {primaryTarget.name}&apos;s Melee → difficulty:
                </div>
                <div style={{
                  display:      'flex',
                  gap:          SP[1],
                  alignItems:   'center',
                  marginBottom: SP[1],
                }}>
                  {meleeResult && Array.from({ length: meleeResult.challengeDice }).map((_, i) => (
                    <DiceFace key={`chl${i}`} type="challenge" size={16} />
                  ))}
                  {meleeResult && Array.from({ length: meleeResult.difficultyDice }).map((_, i) => (
                    <DiceFace key={`dif${i}`} type="difficulty" size={16} />
                  ))}
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize:   FS.overline,
                    color:      'var(--hud-text-dim)',
                    marginLeft: SP[1],
                  }}>
                    {meleeResult?.challengeDice ?? 0} CHL · {meleeResult?.difficultyDice ?? 0} DIF
                  </span>
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize:   FS.overline,
                  color:      'var(--hud-text-faint)',
                  fontStyle:  'italic',
                }}>
                  PRF→CHL · ABL→DIF
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize:   FS.overline,
            color:      'var(--hud-text-faint)',
            fontStyle:  'italic',
          }}>
            No target selected — difficulty set by target&apos;s Melee skill at roll time.
          </div>
        )}

        {/* Engaged pill (always shown for melee) */}
        <CompactBandPill
          band="engaged"
          label="Engaged"
          difficultyDice={0}
          challengeDice={0}
          notes={primaryTarget ? [] : ['Opposed check — target Melee sets difficulty']}
          blocked={false}
          selected={selectedBand === 'engaged' || !canReachShort}
          onSelect={onSelect}
        />
        {canReachShort && (
          <CompactBandPill
            band="short"
            label="Short"
            difficultyDice={0}
            challengeDice={0}
            notes={['Extended reach — opposed difficulty unchanged']}
            blocked={false}
            selected={selectedBand === 'short'}
            onSelect={onSelect}
          />
        )}
      </div>
    )
  }

  // Ranged — segmented track (focus-console redesign; logic unchanged)
  const refW     = weapon?.refWeapon
  const skillKey = weapon?.skillKey ?? 'RANGLT'
  const maxRange = refW?.range_value ? (RANGE_VALUE_MAP[refW.range_value] ?? 'extreme') : 'extreme'

  return (
    <div>
      <div className="fc-range-track">
        {RANGE_BAND_ORDER.map(band => {
          const result   = getRangedDifficulty(band, skillKey, maxRange)
          const blocked  = result.blocked
          const selected = selectedBand === band

          return (
            <button
              key={band}
              type="button"
              onClick={() => !blocked && onSelect(band)}
              disabled={blocked}
              className={`fc-range-opt${selected ? ' is-selected' : ''}`}
            >
              <span className="fc-range-name">{RANGE_BAND_LABELS[band]}</span>
              <span className="fc-range-pips">
                {blocked || (result.difficultyDice === 0 && result.challengeDice === 0) ? (
                  <span className="fc-range-dash">—</span>
                ) : (
                  <>
                    {Array.from({ length: result.challengeDice }).map((_, pi) => (
                      <i key={`c${pi}`} style={{
                        width: 7, height: 7, flexShrink: 0, /* die geometry, not spacing */
                        background: DICE_COLOR.challenge, /* die-identity hex — sealed namespace */
                        clipPath: CLIP_OCT,
                      }} />
                    ))}
                    {Array.from({ length: result.difficultyDice }).map((_, pi) => (
                      <i key={`d${pi}`} style={{
                        width: 7, height: 7, flexShrink: 0, /* die geometry, not spacing */
                        background: DICE_COLOR.difficulty, /* die-identity hex — sealed namespace */
                        clipPath: CLIP_DIA,
                      }} />
                    ))}
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
      <div className="fc-note">
        Max range: <b>{RANGE_BAND_LABELS[maxRange]}</b>.
      </div>
    </div>
  )
}
