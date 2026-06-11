'use client'

import { useRef, useState, useEffect } from 'react'
import { useTicker } from '@/hooks/useTicker'

interface TickerTextProps {
  text:       string
  isOpen:     boolean
  delayMs?:   number
  className?: string
  /** All characters animate simultaneously instead of left-to-right. Use for body copy. */
  parallel?:  boolean
  /** Allow the text to wrap across lines. Use for multi-line body copy. */
  wrap?:      boolean
}

export function TickerText({ text, isOpen, delayMs, className, parallel, wrap }: TickerTextProps) {
  const spanRef                    = useRef<HTMLSpanElement>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setShouldAnimate(false)
      return
    }
    // Gate check: only animate when a [data-ticker-pass="true"] ancestor is
    // present. HudFullPanel sets that attribute via useLayoutEffect (which
    // fires before children's useEffect), so it is guaranteed to be present
    // here when the panel has just opened. If the panel has been open for
    // longer than the gate window (600ms), the attribute is already gone and
    // the text renders settled — preventing re-animation inside already-open
    // panels when accordions or sub-panels open.
    const gated = !!spanRef.current?.closest('[data-ticker-pass="true"]')
    setShouldAnimate(gated)
  }, [isOpen])

  const { chars } = useTicker(text, isOpen && shouldAnimate, delayMs, parallel ? 0 : undefined)

  const rootClass = wrap ? 'ticker-ready-wrap' : 'ticker-ready'

  if (wrap) {
    // Group chars into word units (no-break) and whitespace (break points).
    // Each word becomes a single inline-flex flex item in the parent wrap
    // container, so the browser can only break at whitespace boundaries.
    type Group = { isWord: boolean; chars: typeof chars }
    const groups: Group[] = []
    let current: typeof chars = []

    chars.forEach((char, i) => {
      if (text[i] === ' ' || text[i] === '\n') {
        if (current.length) { groups.push({ isWord: true, chars: current }); current = [] }
        groups.push({ isWord: false, chars: [char] })
      } else {
        current.push(char)
      }
    })
    if (current.length) groups.push({ isWord: true, chars: current })

    return (
      <span ref={spanRef} className={`${rootClass}${className ? ` ${className}` : ''}`}>
        {groups.map((group, gi) =>
          group.isWord ? (
            <span key={gi} style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
              {group.chars.map(char => (
                <span key={char.key} className="ticker-char" style={{ opacity: char.settled ? 1 : 0.5 }} aria-hidden={!char.settled}>
                  {char.display}
                </span>
              ))}
            </span>
          ) : (
            group.chars.map(char => (
              <span key={char.key} className="ticker-char" style={{ opacity: char.settled ? 1 : 0.5 }} aria-hidden={!char.settled}>
                {char.display}
              </span>
            ))
          )
        )}
        <span className="sr-only">{text}</span>
      </span>
    )
  }

  return (
    <span ref={spanRef} className={`${rootClass}${className ? ` ${className}` : ''}`}>
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
