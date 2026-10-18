'use client'

import { parseSymbols } from '@/lib/parseSymbols'
import { Die, Symbol as SymbolGlyph, type SymbolKind } from '@/components/dice/GameGlyph'
import type { DiceType } from '@/components/player-hud/design-tokens'

const RESULT_SYMBOL = new Set<string>(['success', 'failure', 'advantage', 'threat', 'triumph', 'despair'])

const DICE_FACE_KEYS = new Set<string>([
  'boost', 'ability', 'proficiency', 'setback', 'difficulty', 'challenge', 'force',
])

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

  // Buffers a run of consecutive dice/symbol icons (no text or formatting
  // segment interrupting them) so a multi-die expansion — [difficulty:3],
  // or a :tier+N: upgrade that splits into adjacent [difficulty:N][challenge:N]
  // segments — renders as one unbreakable unit instead of risking a line
  // wrap mid-group. A single icon is pushed unwrapped so unchanged existing
  // markup ([BO], [B]...[b], etc.) renders byte-identical to before.
  let iconGroup: React.ReactNode[] = []
  let groupKey: string | null = null

  function flushIconGroup() {
    if (iconGroup.length === 0) return
    if (iconGroup.length > 1) {
      nodes.push(<span key={`grp-${groupKey}`} className="richtext-dice-group">{iconGroup}</span>)
    } else {
      nodes.push(iconGroup[0])
    }
    iconGroup = []
    groupKey = null
  }

  // Formatting state tracked across segments
  let isBold    = false
  let isItalic  = false
  let heading: 0 | 3 | 4 = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const k   = String(i)

    if (seg.type === 'text') {
      flushIconGroup()
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

    if (seg.type === 'unknown') {
      flushIconGroup()
      nodes.push(
        <span key={k} className="richtext-unknown-chip" title={`Unrecognised shortcode: ${seg.raw}`}>
          {seg.raw}
        </span>
      )
      continue
    }

    if (seg.type === 'format') {
      flushIconGroup()
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
    if (groupKey === null) groupKey = k

    for (let iconIdx = 0; iconIdx < count; iconIdx++) {
      const ik = `${k}-${iconIdx}`

      // Every glyph is a fixed-finish Die / Symbol (components/dice/GameGlyph.tsx): nothing reads the surrounding surface.
      if (RESULT_SYMBOL.has(key)) {
        iconGroup.push(<SymbolGlyph key={ik} kind={key as SymbolKind} size="inline" />)
        continue
      }
      if (key === 'fp') {
        iconGroup.push(<SymbolGlyph key={ik} kind="forcePip" size="inline" />)
        continue
      }
      if (key === 'light' || key === 'dark') {
        iconGroup.push(<SymbolGlyph key={ik} kind={key === 'light' ? 'lightPip' : 'darkPip'} size="inline" />)
        continue
      }
      if (DICE_FACE_KEYS.has(key)) {
        iconGroup.push(<Die key={ik} type={key as DiceType} size="inline" />)
      }
    }
  }

  flushIconGroup()

  return (
    <span className={className} style={style}>
      {nodes}
    </span>
  )
}
