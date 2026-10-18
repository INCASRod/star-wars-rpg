'use client'

import type { DiceType } from '@/components/player-hud/design-tokens'
import { Die } from '@/components/dice/GameGlyph'
import { GLYPH_SIZE, type GlyphSize } from '@/lib/tokens'

// Re-exported from the single source of truth in tokens.ts — this file used to
// carry its own copy of the palette, which is how setback drifted to a
// blue-grey that read as a second boost die.
export { DICE_COLOR as DICE_COLORS } from '@/lib/tokens'

const STEPS = Object.keys(GLYPH_SIZE) as (keyof typeof GLYPH_SIZE)[]

/** Nearest GLYPH_SIZE step for a legacy pixel size. A tie goes to the smaller step so a die never outgrows the box its caller laid out. */
function nearestStep(px: number): GlyphSize {
  let best = STEPS[0]
  for (const s of STEPS) if (Math.abs(GLYPH_SIZE[s] - px) < Math.abs(GLYPH_SIZE[best] - px)) best = s
  return best
}

interface DiceFaceProps {
  type: DiceType
  /** CSS size in px, snapped to the nearest GLYPH_SIZE step. Default 32. */
  size?: number
  /** @deprecated No such thing as an unselected die: dice always render solid. Ignored. */
  active?: boolean
  /** @deprecated Dice always render solid. Ignored. */
  dimmed?: boolean
  /** @deprecated Dice are always solid. Ignored. */
  solid?: boolean
  /** Extra CSS applied to the SVG element — use for inline-block positioning in text flow. */
  style?: React.CSSProperties
}

/** Kept for its ~49 callers; draws a `Die` (components/dice/GameGlyph.tsx). */
export function DiceFace({ type, size = 32, style }: DiceFaceProps) {
  return <Die type={type} size={nearestStep(size)} style={style} />
}
