'use client'

import { parseSymbols } from '@/lib/parseSymbols'
import { DiceFace } from '@/components/dice/DiceFace'
import type { DiceType } from '@/components/player-hud/design-tokens'

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
        nodes.push(
          <i key={ik} className={`ffi ${CSS_ICON[key]}`} aria-hidden="true" title={label} style={INLINE} />
        )
        continue
      }

      if (key === 'fp') {
        // Neutral Force pip (◑) — left half dark, right half light
        nodes.push(
          <i key={ik} className="ffi ffi-swrpg-force" aria-hidden="true" title={label}
            style={{
              ...INLINE,
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
            style={{ ...INLINE, color: FORCE_PIP_COLOR[key] }} />
        )
        continue
      }

      if (DICE_FACE_KEYS.has(key)) {
        nodes.push(
          <span key={ik} aria-hidden="true" title={label} style={{ ...INLINE, display: 'inline-block' }}>
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
