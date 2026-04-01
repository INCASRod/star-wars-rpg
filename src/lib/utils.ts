import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * UUID v4 generator that works in both secure (HTTPS/localhost) and
 * non-secure (HTTP over local network) contexts.
 * crypto.randomUUID() requires a secure context — fall back to Math.random()
 * when unavailable (e.g. accessed via 192.168.x.x over HTTP).
 */
const DICE_TAGS_RE = /\[(BO|BST|SE|SET|BL|DI|DIF|CH|CHL|PR|PRO|AB|ABL)\]/gi

/**
 * Strips OggDude BBCode markup while preserving known dice tags ([BO], [SE],
 * [DI], [CH], etc.) so they can be processed by parseDiceText / DiceText.
 */
export function stripBBCode(text: string): string {
  // Stash dice tags behind NUL placeholders so the catch-all strip misses them
  const stash: string[] = []
  const held = text.replace(DICE_TAGS_RE, (match) => {
    stash.push(match.toUpperCase())
    return `\x00${stash.length - 1}\x00`
  })
  const stripped = held.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
  return stripped.replace(/\x00(\d+)\x00/g, (_, i) => stash[parseInt(i, 10)])
}

/**
 * UUID v4 generator that works in both secure (HTTPS/localhost) and
 * non-secure (HTTP over local network) contexts.
 * crypto.randomUUID() requires a secure context — fall back to Math.random()
 * when unavailable (e.g. accessed via 192.168.x.x over HTTP).
 */
export function randomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
