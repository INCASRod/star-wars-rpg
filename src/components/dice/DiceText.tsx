'use client'

import { parseDiceText } from '@/lib/parseDiceText'
import { DiceFace } from './DiceFace'

interface DiceTextProps {
  text?: string | null
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders OggDude markup text as inline React, replacing known dice tags
 * ([BO], [SE], [DI], [CH], etc.) with shape-only DiceFace components.
 * All other [TAG] patterns (formatting, result symbols, unknown) are stripped.
 */
export function DiceText({ text, className, style }: DiceTextProps) {
  if (!text) return null
  const segments = parseDiceText(text)

  return (
    <span className={className} style={{ display: 'inline', lineHeight: 'inherit', ...style }}>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.content}</span>
        ) : (
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
      )}
    </span>
  )
}
