import { useState, useEffect, useRef, useCallback } from 'react'

export type TickerChar = { key: string; display: string; settled: boolean }

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const STAGGER_MS = 28
const CYCLE_INTERVAL_MS = 35
const CYCLE_COUNT = 4

function isScramblable(ch: string): boolean {
  return /[A-Za-z0-9]/.test(ch)
}

function randomGlyph(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

function buildSettledChars(text: string): TickerChar[] {
  return text.split('').map((ch, i) => ({
    key: `char-${i}`,
    display: ch,
    settled: true,
  }))
}

export function useTicker(
  text: string,
  isOpen: boolean,
  delayMs: number = 60,
  staggerMs: number = STAGGER_MS,
): { chars: TickerChar[] } {
  const [chars, setChars] = useState<TickerChar[]>(() => buildSettledChars(text))
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  const clearAllTimeouts = useCallback(() => {
    timeoutIds.current.forEach(id => clearTimeout(id))
    timeoutIds.current.clear()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      // Cancel any in-flight animation and reset to settled state immediately
      clearAllTimeouts()
      setChars(buildSettledChars(text))
      return
    }

    // isOpen just became true — start the scramble after the initial delay
    const startId = setTimeout(() => {
      timeoutIds.current.delete(startId)

      text.split('').forEach((finalChar, charIndex) => {
        if (!isScramblable(finalChar)) {
          // Spaces and special chars appear immediately at stagger time, settled
          const staggerId = setTimeout(() => {
            timeoutIds.current.delete(staggerId)
            setChars(prev => {
              const next = [...prev]
              next[charIndex] = { key: `char-${charIndex}`, display: finalChar, settled: true }
              return next
            })
          }, charIndex * staggerMs)
          timeoutIds.current.add(staggerId)
          return
        }

        const staggerOffset = charIndex * staggerMs

        // Show first random glyph at stagger offset
        const showId = setTimeout(() => {
          timeoutIds.current.delete(showId)
          setChars(prev => {
            const next = [...prev]
            next[charIndex] = { key: `char-${charIndex}`, display: randomGlyph(), settled: false }
            return next
          })

          // Cycle through random glyphs
          for (let cycle = 1; cycle < CYCLE_COUNT; cycle++) {
            const cycleId = setTimeout(() => {
              timeoutIds.current.delete(cycleId)
              setChars(prev => {
                const next = [...prev]
                next[charIndex] = { key: `char-${charIndex}`, display: randomGlyph(), settled: false }
                return next
              })
            }, cycle * CYCLE_INTERVAL_MS)
            timeoutIds.current.add(cycleId)
          }

          // Land on final character after all cycles
          const landId = setTimeout(() => {
            timeoutIds.current.delete(landId)
            setChars(prev => {
              const next = [...prev]
              next[charIndex] = {
                key: `char-${charIndex}`,
                display: finalChar,
                settled: true,
              }
              return next
            })
          }, CYCLE_COUNT * CYCLE_INTERVAL_MS)
          timeoutIds.current.add(landId)
        }, staggerOffset)
        timeoutIds.current.add(showId)
      })
    }, delayMs)
    timeoutIds.current.add(startId)

    return () => {
      clearAllTimeouts()
    }
  }, [isOpen, text, delayMs, staggerMs, clearAllTimeouts])

  return { chars }
}
