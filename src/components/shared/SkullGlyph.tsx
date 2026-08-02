'use client'

// Defeated-marker skull glyph (Prompt 19) — DOM renderer for the shared path
// data in `@/lib/skullGlyph`. Used at two scales: the full watermark over a
// defeated token/portrait, and the micro stamp on an individual dead minion
// pip. See skullGlyph.ts's header comment for why Pixi doesn't reuse this
// component directly.

import {
  SKULL_VIEWBOX, SKULL_DOME_PATH, SKULL_NOSE_PATH, SKULL_LEFT_EYE, SKULL_RIGHT_EYE,
} from '@/lib/skullGlyph'

export interface SkullGlyphProps {
  className?: string
  /** Bone silhouette color. Defaults to the HUD's body-text tone. */
  fill?: string
  /** Eye/nose cutout color. Defaults to the HUD background. */
  hole?: string
}

export function SkullGlyph({ className, fill = 'var(--hud-text)', hole = 'var(--hud-bg)' }: SkullGlyphProps) {
  return (
    <svg className={className} viewBox={SKULL_VIEWBOX} fill="none" aria-hidden="true">
      <path fill={fill} d={SKULL_DOME_PATH} />
      <ellipse cx={SKULL_LEFT_EYE.cx}  cy={SKULL_LEFT_EYE.cy}  rx={SKULL_LEFT_EYE.rx}  ry={SKULL_LEFT_EYE.ry}  fill={hole} />
      <ellipse cx={SKULL_RIGHT_EYE.cx} cy={SKULL_RIGHT_EYE.cy} rx={SKULL_RIGHT_EYE.rx} ry={SKULL_RIGHT_EYE.ry} fill={hole} />
      <path fill={hole} d={SKULL_NOSE_PATH} />
    </svg>
  )
}
