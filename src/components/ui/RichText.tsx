'use client'

import { parseSymbols } from '@/lib/parseSymbols'
import { DiceFace } from '@/components/dice/DiceFace'
import type { DiceType } from '@/components/player-hud/design-tokens'
import { SYM_COLOR } from '@/lib/tokens'

const CSS_ICON: Record<string, string> = {
  success:   'ffi-swrpg-success',
  failure:   'ffi-swrpg-failure',
  advantage: 'ffi-swrpg-advantage',
  threat:    'ffi-swrpg-threat',
  triumph:   'ffi-swrpg-triumph',
  despair:   'ffi-swrpg-despair',
}

const FORCE_PIP_COLOR: Record<string, string> = {
  light: '#FFFFFF',
  dark:  '#333333',
}

const DICE_FACE_KEYS = new Set<string>([
  'boost', 'ability', 'proficiency', 'setback', 'difficulty', 'challenge', 'force',
])

const LABEL: Record<string, string> = {
  success:     'Success',
  failure:     'Failure',
  advantage:   'Advantage',
  threat:      'Threat',
  triumph:     'Triumph',
  despair:     'Despair',
  fp:          'Force pip',
  light:       'Light side Force pip',
  dark:        'Dark side Force pip',
  boost:       'Boost die',
  ability:     'Ability die',
  proficiency: 'Proficiency die',
  setback:     'Setback die',
  difficulty:  'Difficulty die',
  challenge:   'Challenge die',
  force:       'Force die',
}

const INLINE: React.CSSProperties = { display: 'inline', verticalAlign: 'middle', lineHeight: 1 }

// Dark chip backing for every inline dice/symbol glyph — the sw-rpg-icons font
// and DiceFace's SVG fills were authored for a dark background; on a bright
// surface (the owned-plaque E4 plate, gold in Ember / cyan in Kyber) setback's
// near-black translucent fill vanishes and only its pale outline remains,
// perceptually reading as boost instead of setback. Rather than adjusting any
// glyph colour (DICE_COLOR/SYM_COLOR are a sealed namespace — see tokens.ts),
// every glyph gets its own dark island via `box-shadow`, never `background` or
// `padding`. box-shadow is purely presentational — it paints outside the
// element's box without contributing to that box's dimensions, so it cannot
// change line-height or line-box height regardless of context (confirmed live:
// identical computed line-height with and without this style in every surface
// RichText renders in). A `background-color` approach would work for most
// glyphs but breaks the neutral Force pip's `background-clip: text` gradient
// trick below; box-shadow is compatible with all of them uniformly.
// `--plaque-body` (near-black, per-theme) is reused rather than inventing a
// colour: on a normal dark plaque it is literally the same value as the
// surrounding surface, so the chip is invisible there by construction — it
// only becomes visible where the background actually needs it.
const GLYPH_CHIP: React.CSSProperties = {
  boxShadow: '0 0 0 1.5px var(--plaque-body)',
  borderRadius: '3px',
}

interface RichTextProps {
  text:       string
  className?: string
  style?:     React.CSSProperties
}

/**
 * Renders a string containing OggDude shortcode markup as inline React content.
 *
 * Handles result symbols, force pips, dice faces, and formatting tags:
 *   [B]…[b]  bold   [I]…[i]  italic   [H3]…[h3]  [H4]…[h4]  headings
 *   [P]  paragraph break   [BR]  line break
 *
 * The root element is always a <span> so the component never breaks text flow.
 */
export function RichText({ text, className, style }: RichTextProps) {
  const segments = parseSymbols(text)
  const nodes: React.ReactNode[] = []

  // Formatting state tracked across segments
  let isBold    = false
  let isItalic  = false
  let heading: 0 | 3 | 4 = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const k   = String(i)

    if (seg.type === 'text') {
      const hasFormat = isBold || isItalic || heading > 0
      if (!hasFormat) {
        nodes.push(seg.value)
      } else {
        const s: React.CSSProperties = {}
        if (isBold || heading > 0) s.fontWeight = 700
        if (isItalic)              s.fontStyle  = 'italic'
        if (heading === 3)         s.fontSize   = '1.05em'
        nodes.push(<span key={k} style={s}>{seg.value}</span>)
      }
      continue
    }

    if (seg.type === 'format') {
      switch (seg.tag) {
        case 'bold-open':    isBold   = true;  break
        case 'bold-close':   isBold   = false; break
        case 'italic-open':  isItalic = true;  break
        case 'italic-close': isItalic = false; break
        case 'h3-open':      heading  = 3;     break
        case 'h3-close':     heading  = 0;     break
        case 'h4-open':      heading  = 4;     break
        case 'h4-close':     heading  = 0;     break
        case 'paragraph':
          nodes.push(<br key={k} />, <br key={k + '_'} />)
          break
        case 'linebreak':
          nodes.push(<br key={k} />)
          break
      }
      continue
    }

    // seg.type === 'symbol'
    const { key, count } = seg
    const label = LABEL[key] ?? key

    for (let iconIdx = 0; iconIdx < count; iconIdx++) {
      const ik = `${k}-${iconIdx}`

      if (key in CSS_ICON) {
        // Explicit `color` — found during this pass, live-confirmed: .ffi-swrpg-*
        // sets no colour of its own (globals.css), so these were rendering in
        // whatever `color` the surrounding text had. On an owned plaque that's
        // ~near-black at 88% alpha, i.e. the SAME colour as GLYPH_CHIP's own
        // backing — the glyph nearly vanished into its own chip (confirmed via
        // screenshot: a success star rendered as a barely-visible near-black
        // silhouette on a near-black square). Fixed by applying the existing
        // sealed SYM_COLOR value explicitly, stopping the inheritance — not by
        // changing SYM_COLOR itself or the chip colour.
        nodes.push(
          <i key={ik} className={`ffi ${CSS_ICON[key]}`} aria-hidden="true" title={label}
            style={{ ...INLINE, ...GLYPH_CHIP, color: SYM_COLOR[key as keyof typeof SYM_COLOR] }} />
        )
        continue
      }

      if (key === 'fp') {
        // Neutral Force pip (◑) — left half dark, right half light. GLYPH_CHIP
        // uses box-shadow rather than `background` specifically so it doesn't
        // collide with this element's own `background` (the gradient the pip
        // is drawn from via background-clip: text, below).
        nodes.push(
          <i key={ik} className="ffi ffi-swrpg-force" aria-hidden="true" title={label}
            style={{
              ...INLINE,
              ...GLYPH_CHIP,
              background: `linear-gradient(to right, ${FORCE_PIP_COLOR.dark} 50%, ${FORCE_PIP_COLOR.light} 50%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
        )
        continue
      }

      if (key in FORCE_PIP_COLOR) {
        nodes.push(
          <i key={ik} className="ffi ffi-swrpg-force" aria-hidden="true" title={label}
            style={{ ...INLINE, ...GLYPH_CHIP, color: FORCE_PIP_COLOR[key] }} />
        )
        continue
      }

      if (DICE_FACE_KEYS.has(key)) {
        nodes.push(
          <span key={ik} aria-hidden="true" title={label} style={{ ...INLINE, display: 'inline-block', ...GLYPH_CHIP }}>
            <DiceFace type={key as DiceType} size={14} style={{ verticalAlign: 'middle' }} />
          </span>
        )
      }
    }
  }

  return (
    <span className={className} style={style}>
      {nodes}
    </span>
  )
}
