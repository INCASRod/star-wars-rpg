'use client'

import { useId } from 'react'
import { DICE_COLOR, SYM_COLOR, GLYPH_SIZE, GLYPH_INLINE_EM, GLYPH_TILE, GLYPH_RIM, type DiceType, type GlyphSize } from '@/lib/tokens'

/*
 * The one place a die or a result symbol is drawn.
 *
 * Dice are solid: the sealed DICE_COLOR fill, a bevel derived from the die itself (white top-left to black
 * bottom-right) and a fixed two-tone rim. Symbols sit on one fixed tile. Nothing here reads the surface behind
 * the glyph: no currentColor, no theme variables, no alpha on the die fill. Sizes come from GLYPH_SIZE.
 */

// Rounded octagon for Proficiency / Challenge / Force (physical d12 shape)
const OCTAGON_PATH =
  'M 18.1 4.9 Q 20.6 4.9 22.4 6.7 L 25.3 9.6 Q 27.1 11.4 27.1 13.9 ' +
  'L 27.1 18.1 Q 27.1 20.6 25.3 22.4 L 22.4 25.3 Q 20.6 27.1 18.1 27.1 ' +
  'L 13.9 27.1 Q 11.4 27.1 9.6 25.3 L 6.7 22.4 Q 4.9 20.6 4.9 18.1 ' +
  'L 4.9 13.9 Q 4.9 11.4 6.7 9.6 L 9.6 6.7 Q 11.4 4.9 13.9 4.9 Z'

const SHAPE: Record<DiceType, 'octagon' | 'diamond' | 'rounded'> = {
  proficiency: 'octagon', challenge: 'octagon', force: 'octagon',
  ability: 'diamond', difficulty: 'diamond',
  boost: 'rounded', setback: 'rounded',
}

const DIE_LABEL: Record<DiceType, string> = {
  proficiency: 'Proficiency die', ability: 'Ability die', boost: 'Boost die',
  challenge: 'Challenge die', difficulty: 'Difficulty die', setback: 'Setback die', force: 'Force die',
}

export type SymbolKind = 'success' | 'failure' | 'advantage' | 'threat' | 'triumph' | 'despair' | 'lightPip' | 'darkPip' | 'forcePip'

const SYMBOL_CLASS: Record<SymbolKind, string> = {
  success: 'ffi-swrpg-success', failure: 'ffi-swrpg-failure', advantage: 'ffi-swrpg-advantage',
  threat: 'ffi-swrpg-threat', triumph: 'ffi-swrpg-triumph', despair: 'ffi-swrpg-despair',
  lightPip: 'ffi-swrpg-force', darkPip: 'ffi-swrpg-force', forcePip: 'ffi-swrpg-force',
}

const SYMBOL_LABEL: Record<SymbolKind, string> = {
  success: 'Success', failure: 'Failure', advantage: 'Advantage', threat: 'Threat', triumph: 'Triumph', despair: 'Despair',
  lightPip: 'Light side Force pip', darkPip: 'Dark side Force pip', forcePip: 'Force pip',
}

/** CSS length for a glyph step. `inline` follows the surrounding font-size. */
const edge = (size: GlyphSize) => (size === 'inline' ? `${GLYPH_INLINE_EM}em` : `${GLYPH_SIZE[size]}px`)

interface Common {
  size?: GlyphSize
  /** Hide from assistive tech (the surrounding text already says it). Default false: the glyph is a labelled image. */
  decorative?: boolean
  /** Extra CSS, e.g. an overlay position. Layout only: never colour. */
  style?: React.CSSProperties
}

export function Die({ type, size = 'md', decorative = false, style }: Common & { type: DiceType }) {
  const gid = useId()
  const shape = SHAPE[type]
  const heavy = GLYPH_RIM.heavy[type]
  const darkRim = heavy?.dark ?? GLYPH_RIM.dark
  const darkW = heavy?.darkWidth ?? GLYPH_RIM.darkWidth
  const lightRim = heavy?.light ?? GLYPH_RIM.light
  const lightW = heavy?.lightWidth ?? GLYPH_RIM.lightWidth

  // Drawn twice: the body (sealed colour + dark rim), then the bevel over it (light rim).
  const draw = (props: React.SVGProps<SVGPathElement & SVGPolygonElement & SVGRectElement>) =>
    shape === 'octagon' ? <path d={OCTAGON_PATH} {...props} />
    : shape === 'diamond' ? <polygon points="16,2 30,16 16,30 2,16" {...props} />
    : <rect x="3" y="3" width="26" height="26" rx="5" {...props} />

  return (
    <svg
      width={edge(size)}
      height={edge(size)}
      viewBox="0 0 32 32"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : DIE_LABEL[type]}
      aria-hidden={decorative || undefined}
      // layout only: inline verticals and no-shrink are runtime/size-dependent, the colours all come from tokens
      style={{ flexShrink: 0, display: size === 'inline' ? 'inline-block' : 'block', verticalAlign: size === 'inline' ? 'middle' : undefined, margin: size === 'inline' ? '0 1px' : undefined, ...style }}
    >
      <defs>
        <linearGradient id={`${gid}-bv`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity={GLYPH_RIM.bevelHi} />
          <stop offset="0.5" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity={GLYPH_RIM.bevelLo} />
        </linearGradient>
      </defs>
      {draw({ fill: DICE_COLOR[type], stroke: darkRim, strokeWidth: darkW })}
      {draw({ fill: `url(#${gid}-bv)`, stroke: lightRim, strokeWidth: lightW })}
    </svg>
  )
}

export function Symbol({ kind, size = 'md', decorative = false, style }: Common & { kind: SymbolKind }) {
  const tile = edge(size)
  // neutral Force pip: left half dark, right half light, both sealed
  const split = kind === 'forcePip'
  const colour = kind === 'lightPip' ? SYM_COLOR.lightPip : kind === 'darkPip' ? SYM_COLOR.darkPip : kind === 'forcePip' ? undefined : SYM_COLOR[kind]
  const base = GLYPH_TILE.base

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : SYMBOL_LABEL[kind]}
      aria-hidden={decorative || undefined}
      style={{
        display: size === 'inline' ? 'inline-grid' : 'grid',
        placeItems: 'center',
        width: tile,
        height: tile,
        flexShrink: 0,
        verticalAlign: size === 'inline' ? 'middle' : undefined,
        margin: size === 'inline' ? '0 1px' : undefined,
        borderRadius: `calc(${tile} * ${GLYPH_TILE.radius})`,
        background: `linear-gradient(160deg, color-mix(in srgb, ${base} 88%, white) 0%, ${base} 55%, color-mix(in srgb, ${base} 80%, black) 100%)`,
        boxShadow: `inset 0 1px 0 ${GLYPH_TILE.hi}, inset 0 -1px 0 ${GLYPH_TILE.lo}, 0 1px 2px ${GLYPH_TILE.shadow}`,
        ...style,
      }}
    >
      <i
        className={`ffi ${SYMBOL_CLASS[kind]}`}
        aria-hidden="true"
        style={{
          display: 'block',
          fontSize: `calc(${tile} * ${GLYPH_TILE.glyph})`,
          lineHeight: 1,
          ...(split
            ? {
                background: `linear-gradient(to right, ${SYM_COLOR.darkPip} 50%, ${SYM_COLOR.lightPip} 50%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }
            : { color: colour }),
        }}
      />
    </span>
  )
}
