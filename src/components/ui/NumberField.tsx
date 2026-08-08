'use client'

import { forwardRef, useRef, useImperativeHandle, useCallback } from 'react'
import { FS, RADIUS } from '@/lib/tokens'

/**
 * `<input type="number">` with the native browser spinner suppressed and an
 * on-brand ▴/▾ chevron stack rendered in its place.
 *
 * **Drop-in.** Every prop except `type` passes straight through to the input,
 * including `style`, `className`, `value`, `min`, `max`, `step`, `onChange`
 * and any `data-*` attribute. The caller's `style` object is applied to the
 * input verbatim and the chevrons are absolutely positioned *inside* the
 * field — exactly where the native spinner sat — so a converted field keeps
 * its width, height and row layout with zero reflow. Value handling,
 * validation and clamping stay entirely with the caller.
 *
 * The chevrons drive the input through its own `stepUp()`/`stepDown()` and
 * then dispatch a native `input` event, so React's `onChange` fires with a
 * real event and the caller's existing handler runs unmodified (including any
 * clamping it does of its own). Native keyboard arrow-key stepping and free
 * typed entry are untouched.
 *
 * Hover/active/disabled states live in `globals.css` (`.numfield-*`).
 */
export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Style for the positioned wrapper. Rarely needed — the wrapper is shrink-to-fit by default. */
  wrapperStyle?: React.CSSProperties
}

// Sub-token metrics exception (UI gate §2): the chevron column is 11px wide with
// 1px insets so it sits inside the field's own border on rows as short as 20px.
// SP[1] (4→8px) would push the glyphs out of the smallest converted field.
const CHEV_COL_WIDTH = 11
const CHEV_INSET     = 1

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { wrapperStyle, className, style, ...inputProps },
  forwardedRef,
) {
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement)

  // Step through the DOM input so min/max/step are enforced by the browser,
  // then fire a native `input` event — React's onChange listens for that, so
  // the caller's handler receives an ordinary change event it can read
  // `e.target.value` from, exactly as with a bare input.
  const step = useCallback((direction: 1 | -1) => {
    const el = innerRef.current
    if (!el || el.disabled || el.readOnly) return
    try {
      if (direction === 1) el.stepUp()
      else el.stepDown()
    } catch {
      // stepUp/stepDown throw on an empty or non-numeric field — start from 0.
      el.value = String(direction)
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, [])

  // Bound detection for the disabled affordance only — it never gates the
  // value itself; the browser's own min/max clamping remains authoritative.
  const num = Number(inputProps.value)
  const min = inputProps.min !== undefined ? Number(inputProps.min) : undefined
  const max = inputProps.max !== undefined ? Number(inputProps.max) : undefined
  const atMin = min !== undefined && Number.isFinite(num) && num <= min
  const atMax = max !== undefined && Number.isFinite(num) && num >= max

  return (
    <span
      className="numfield"
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', ...wrapperStyle }}
    >
      <input
        {...inputProps}
        ref={innerRef}
        type="number"
        className={className ? `numfield-input ${className}` : 'numfield-input'}
        style={style}
      />
      <span
        className="numfield-chevrons"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: CHEV_INSET, bottom: CHEV_INSET, right: CHEV_INSET,
          width: CHEV_COL_WIDTH,
          display: 'flex', flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {([
          { dir:  1 as const, glyph: '▴', disabled: atMax },
          { dir: -1 as const, glyph: '▾', disabled: atMin },
        ]).map(({ dir, glyph, disabled }) => (
          <button
            key={dir}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => step(dir)}
            className="numfield-chev"
            style={{
              flex: 1, minHeight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, border: 'none', background: 'transparent',
              borderRadius: RADIUS.sm,
              fontSize: FS.overline, lineHeight: 1,
              pointerEvents: 'auto',
            }}
          >
            {glyph}
          </button>
        ))}
      </span>
    </span>
  )
})
