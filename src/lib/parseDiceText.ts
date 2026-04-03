import type { DiceType } from '@/components/player-hud/design-tokens'

export type TextSegment =
  | { type: 'text';   content: string }
  | { type: 'dice';   diceType: DiceType }
  | { type: 'symbol'; cls: string; color: string }

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

// OggDude result-symbol tags → sw-rpg-icons class + colour
const SYMBOL_TAG_MAP: Record<string, { cls: string; color: string }> = {
  SU: { cls: 'ffi-swrpg-success',   color: '#4CAF50' }, // Success
  AD: { cls: 'ffi-swrpg-advantage', color: '#4CAF50' }, // Advantage
  TH: { cls: 'ffi-swrpg-threat',    color: '#f44336' }, // Threat
  FA: { cls: 'ffi-swrpg-failure',   color: '#f44336' }, // Failure
  TR: { cls: 'ffi-swrpg-triumph',   color: '#F5C518' }, // Triumph
  DE: { cls: 'ffi-swrpg-despair',   color: '#C62828' }, // Despair
  FP: { cls: 'ffi-swrpg-force',     color: '#FFFFFF' }, // Force pip / Force point
  FO: { cls: 'ffi-swrpg-force',     color: '#FFFFFF' }, // Force die symbol in descriptions
  // DA (Damage), LI (Light side pip) — strip silently
}

/**
 * Parses OggDude markup text into an array of text, dice, and symbol segments.
 * - Known dice tags ([BO], [SE], [DI], [CH], [FO] etc.) become dice segments.
 * - Result symbol tags ([SU], [AD], [TH], [FA], [TR], [DE]) become symbol segments.
 * - All other [TAG] patterns (formatting, unknown) are silently dropped.
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
    } else {
      const sym = SYMBOL_TAG_MAP[tag]
      if (sym) {
        segments.push({ type: 'symbol', cls: sym.cls, color: sym.color })
      }
      // Unknown / formatting tags dropped silently
    }

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
