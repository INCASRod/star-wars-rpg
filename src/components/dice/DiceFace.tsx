'use client'

import type { DiceType } from '@/components/player-hud/design-tokens'

export const DICE_COLORS: Record<DiceType, string> = {
  proficiency: '#F5C518',
  ability:     '#4CAF50',
  boost:       '#29B6F6',
  challenge:   '#C62828',
  difficulty:  '#7B1FA2',
  setback:     '#455A64',
  force:       '#FFFFFF',
}

// Rounded octagon for Proficiency / Challenge (physical d12 shape)
const OCTAGON_PATH =
  'M 18.1 4.9 Q 20.6 4.9 22.4 6.7 L 25.3 9.6 Q 27.1 11.4 27.1 13.9 ' +
  'L 27.1 18.1 Q 27.1 20.6 25.3 22.4 L 22.4 25.3 Q 20.6 27.1 18.1 27.1 ' +
  'L 13.9 27.1 Q 11.4 27.1 9.6 25.3 L 6.7 22.4 Q 4.9 20.6 4.9 18.1 ' +
  'L 4.9 13.9 Q 4.9 11.4 6.7 9.6 L 9.6 6.7 Q 11.4 4.9 13.9 4.9 Z'

interface DiceFaceProps {
  type: DiceType
  /** CSS size in px. Default 32. */
  size?: number
  /** When false, stroke and fill are muted (unselected / outline state). Default true. */
  active?: boolean
  /** Reduce overall opacity to ~30% (zero-rank indicator). */
  dimmed?: boolean
  /** Extra CSS applied to the SVG element — use for inline-block positioning in text flow. */
  style?: React.CSSProperties
}

export function DiceFace({ type, size = 32, active = true, dimmed = false, style }: DiceFaceProps) {
  const color  = DICE_COLORS[type]
  const fill   = active ? `${color}28` : `${color}0E`
  const stroke = active ? color        : `${color}70`
  const sw     = size < 16 ? 1 : 1.5

  let shape: React.ReactNode

  if (type === 'proficiency' || type === 'challenge' || type === 'force') {
    shape = <path d={OCTAGON_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
  } else if (type === 'ability' || type === 'difficulty') {
    shape = (
      <polygon
        points="16,2 30,16 16,30 2,16"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    )
  } else {
    // boost / setback — rounded square
    shape = (
      <rect
        x="3" y="3" width="26" height="26" rx="5"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ flexShrink: 0, display: 'block', opacity: dimmed ? 0.3 : 1, ...style }}
    >
      {shape}
    </svg>
  )
}
