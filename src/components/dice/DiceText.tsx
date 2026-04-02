'use client'

import { parseDiceText } from '@/lib/parseDiceText'
import { DiceFace } from './DiceFace'

interface DiceTextProps {
  text?: string | null
  className?: string
  style?: React.CSSProperties
}

const SYMBOL_FONT = "'Share Tech Mono', 'Courier New', monospace"

/**
 * Renders OggDude markup text as inline React:
 * - Dice tags ([BO], [SE], [DI], [FO], etc.) → DiceFace SVG shapes
 * - Result symbols ([SU], [AD], [TH], [FA], [TR], [DE]) → coloured Unicode chars
 * - All other [TAG] patterns (formatting, unknown) are stripped silently
 */
export function DiceText({ text, className, style }: DiceTextProps) {
  if (!text) return null
  const segments = parseDiceText(text)

  return (
    <span className={className} style={{ display: 'inline', lineHeight: 'inherit', ...style }}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>
        }
        if (seg.type === 'symbol') {
          return (
            <span key={i} style={{
              fontFamily: SYMBOL_FONT,
              color: seg.color,
              display: 'inline-block',
              verticalAlign: 'middle',
              margin: '0 1px',
              position: 'relative',
              top: '-1px',
              fontSize: '0.9em',
            }}>
              {seg.content}
            </span>
          )
        }
        return (
          <DiceFace
            key={i}
            type={seg.diceType}
            size={16}
            active={false}
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              margin: '0 2px',
              position: 'relative',
              top: '-1px',
            }}
          />
        )
      })}
    </span>
  )
}
