import type { DiceType } from '@/components/player-hud/design-tokens'

export type TextSegment =
  | { type: 'text'; content: string }
  | { type: 'dice'; diceType: DiceType }

// Actual OggDude bracket codes that map to our DiceType system
const DICE_TAG_MAP: Record<string, DiceType> = {
  BO:  'boost',
  BST: 'boost',
  SE:  'setback',
  SET: 'setback',
  BL:  'setback',
  DI:  'difficulty',
  DIF: 'difficulty',
  CH:  'challenge',
  CHL: 'challenge',
  PR:  'proficiency',
  PRO: 'proficiency',
  AB:  'ability',
  ABL: 'ability',
}

/**
 * Parses OggDude markup text into an array of text and dice segments.
 * Known dice tags ([BO], [SE], [DI], [CH], etc.) become dice segments.
 * All other [TAG] patterns (formatting, result symbols, unknown) are silently
 * dropped — the surrounding text is preserved.
 */
export function parseDiceText(raw: string): TextSegment[] {
  const segments: TextSegment[] = []
  const pattern = /\[([A-Za-z0-9]{1,5})\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: raw.slice(lastIndex, match.index) })
    }

    const tag = match[1].toUpperCase()
    const diceType = DICE_TAG_MAP[tag]
    if (diceType) {
      segments.push({ type: 'dice', diceType })
    }
    // Unknown / formatting tags dropped silently

    lastIndex = match.index + match[0].length
  }

  const tail = raw.slice(lastIndex)
  if (tail) segments.push({ type: 'text', content: tail })

  // Collapse runs of whitespace inside text segments
  return segments.map(seg =>
    seg.type === 'text'
      ? { ...seg, content: seg.content.replace(/\s+/g, ' ') }
      : seg
  )
}
