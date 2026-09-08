'use client'

import { useEffect, useRef, useState } from 'react'
import type { BalancePointState } from '@/lib/forceUtils'

// Same identity colours as ForcePresenceCard.tsx (desktop) — reused via the
// same CSS vars, not the raw hex it's built from, so this stays in sync with
// that component's own sealed choice without importing anything from it.
const DARK_VIOLET = 'var(--hud-accent-purple)'
const LIGHT_CYAN  = 'var(--die-force)'
// Raw --hud-accent-purple measures only ~3.3-3.9:1 as small text on this
// panel's background (computed) — under the 4.5:1 secondary-text floor.
// Text uses (button labels, the Conflict count) get this lightened variant;
// non-text uses (pip fill/border, aura, balance marker) keep the pure token.
const DARK_VIOLET_TEXT = 'color-mix(in srgb, var(--hud-accent-purple) 70%, white 30%)'

function optionsFor(fromState: BalancePointState): { toState: BalancePointState; label: string }[] {
  if (fromState === 'neutral') return [{ toState: 'light', label: 'Light' }, { toState: 'dark', label: 'Dark' }]
  if (fromState === 'light')   return [{ toState: 'neutral', label: 'Neutral' }, { toState: 'dark', label: 'Dark' }]
  return [{ toState: 'neutral', label: 'Neutral' }] // dark pip → Neutral only, same rule as desktop
}

export interface MobileForcePresenceEditorProps {
  lightPoints: number
  darkPoints: number
  sessionConflict: number
  sessionTranquility: number
  /**
   * Desktop's own mutator (`handleFlipBalancePoint`, useCharacterData.ts) —
   * same table (`characters`), same columns (`light_points`/`dark_points`),
   * same `.eq('id', character.id)` condition, same `computeBalancePointFlip`
   * validation, same synchronous `setCharacter` echo. Not reimplemented —
   * called through. Desktop's version already does read-fresh internally
   * (`fetchFreshBalancePoints`, forceUtils.ts) — the gap this component
   * closes is purely the missing queue (Step 0 FIX-prompt 3.3: no
   * serialization exists on desktop, so two rapid flips can race each
   * other exactly like the vitals adjuster did before Prompt 6's fix).
   */
  onFlipBalancePoint: (fromState: BalancePointState, toState: BalancePointState) => Promise<void>
}

/**
 * Mobile-local, touch-usable replacement for ForcePresenceCard's own pip
 * interaction on this destination. Not a fork of that component — it is not
 * reused here at all for the editable path (see FIX-prompt Step 0, 3.2/3.4):
 * its pips are a fixed 18x18px (measured in ForcePresenceCard.tsx, `width:
 * 18, height: 18` on `Pip`), and its `BalanceChooser` popup positions two
 * small text buttons anchored at the pip's exact center via
 * `getBoundingClientRect()` — at 18px pips spaced ~21px apart, adjacent
 * pips' popups collide, and the option buttons themselves (padding-only,
 * no min-height) are far under the 48px floor. Desktop is read-only per the
 * OUT-OF-SCOPE list, so this is a new, small, mobile-only control instead of
 * a fork — 10 real ≥48px buttons in a simple inline expand/collapse, no
 * floating popup, no positioning math to get wrong on a phone.
 */
export function MobileForcePresenceEditor({
  lightPoints, darkPoints, sessionConflict, sessionTranquility, onFlipBalancePoint,
}: MobileForcePresenceEditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Queue + latest-props refs — same pattern as MobileVitalAdjustSheet
  // (Prompt 6): serializes calls so rapid tapping can't race itself, and
  // always reads the LATEST confirmed light/dark points at execution time
  // rather than whatever was captured when a tap was queued.
  const queueRef = useRef<Promise<void>>(Promise.resolve())
  const pointsRef = useRef({ lightPoints, darkPoints })
  const onFlipRef = useRef(onFlipBalancePoint)
  useEffect(() => { pointsRef.current = { lightPoints, darkPoints } }, [lightPoints, darkPoints])
  useEffect(() => { onFlipRef.current = onFlipBalancePoint }, [onFlipBalancePoint])

  const pipStates: BalancePointState[] = Array.from({ length: 10 }, (_, i) =>
    i < darkPoints ? 'dark' : i >= 10 - lightPoints ? 'light' : 'neutral')

  function enqueueFlip(index: number, toState: BalancePointState) {
    setOpenIndex(null)
    queueRef.current = queueRef.current.then(async () => {
      const { lightPoints: l, darkPoints: d } = pointsRef.current
      const fromState: BalancePointState = index < d ? 'dark' : index >= 10 - l ? 'light' : 'neutral'
      await onFlipRef.current(fromState, toState)
    })
  }

  return (
    <div className="m-fp-panel">
      {/* Presentation-only aura layer — restyle, no interaction/queue/write-path change */}
      <div className="m-fp-aura" aria-hidden="true" />

      <div className="m-fp-lead">
        <span className="m-fp-lead-side is-light">Light <span className="m-fp-lead-count">{lightPoints}</span></span>
        <span className="m-fp-lead-side is-dark"><span className="m-fp-lead-count">{darkPoints}</span> Dark</span>
      </div>

      <div className="m-fp-pip-row">
        {pipStates.map((state, i) => (
          <button
            key={i}
            type="button"
            className={`m-fp-pip is-${state}`}
            onClick={() => setOpenIndex(v => v === i ? null : i)}
            aria-label={`Balance point ${i + 1}: ${state}`}
            aria-expanded={openIndex === i}
          />
        ))}
      </div>

      {/* Balance bar — presentation only, derived from the same lightPoints/
          darkPoints already driving the pips above, no new data. */}
      <div
        className="m-fp-balance-bar"
        // Live split percentage — no CSS-class equivalent, documented inline
        // style exception (same "live percentage" pattern as .m-ledger-track-fill).
        style={{ '--fp-split': `${(lightPoints / 10) * 100}%` } as React.CSSProperties}
      >
        <span className="m-fp-balance-marker" style={{ left: `${(lightPoints / 10) * 100}%` }} />
      </div>

      {openIndex !== null && (
        <div className="m-fp-chooser-row">
          {optionsFor(pipStates[openIndex]).map(opt => (
            <button
              key={opt.toState}
              type="button"
              className="m-fp-chooser-btn"
              // Light/Dark identity colour — sealed, same as ForcePresenceCard.tsx
              style={opt.toState !== 'neutral' ? { color: opt.toState === 'light' ? LIGHT_CYAN : DARK_VIOLET_TEXT } : undefined}
              onClick={() => enqueueFlip(openIndex, opt.toState)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="m-fp-caption">
        {/* Dark/light identity colour — sealed, same as ForcePresenceCard.tsx */}
        <span style={{ color: DARK_VIOLET_TEXT }}>{sessionConflict} Conflict</span>
        {' vs '}
        <span style={{ color: LIGHT_CYAN }}>{sessionTranquility} Tranquility</span>
        <div>Session tally — resolved by the GM at session&rsquo;s end.</div>
      </div>
    </div>
  )
}
