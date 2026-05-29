'use client'

import { useTicker } from '@/hooks/useTicker'

interface TickerTextProps {
  text: string
  isOpen: boolean
  delayMs?: number
  className?: string
}

export function TickerText({ text, isOpen, delayMs, className }: TickerTextProps) {
  const { chars } = useTicker(text, isOpen, delayMs)

  return (
    <span className={`ticker-ready${className ? ` ${className}` : ''}`}>
      {chars.map(char => (
        <span
          key={char.key}
          className="ticker-char"
          style={{ opacity: char.settled ? 1 : 0.5 }}
          aria-hidden={!char.settled}
        >
          {char.display}
        </span>
      ))}
      {/* Visually hidden final text for screen readers */}
      <span className="sr-only">{text}</span>
    </span>
  )
}
