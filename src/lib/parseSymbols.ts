/**
 * parseSymbols — parses human-readable shortcode markup into typed segments.
 *
 * Supported shortcodes:
 *   Result symbols : [success] [failure] [advantage] [threat] [triumph] [despair]
 *   Force pips     : [light] [dark]
 *   Dice faces     : [boost] [ability] [proficiency] [setback] [difficulty] [challenge] [force]
 *   Formatting     : [B]…[b]  [I]…[i]  [H3]…[h3]  [H4]…[h4]  [P]  [BR]
 *
 * Repeat count is optional: [difficulty:2] renders the symbol twice.
 * Matching is case-insensitive for symbol/dice tags.
 * Formatting tags are case-sensitive (uppercase = open, lowercase = close).
 * Unknown shortcodes (e.g. [banana]) are emitted as literal text, not dropped.
 *
 * This is a pure data utility — no React dependency.
 */

export type TextSegment   = { type: 'text';   value: string }
export type SymbolSegment = { type: 'symbol'; key: string; count: number }
export type FormatTag =
  | 'bold-open'   | 'bold-close'
  | 'italic-open' | 'italic-close'
  | 'h3-open'     | 'h3-close'
  | 'h4-open'     | 'h4-close'
  | 'paragraph'
  | 'linebreak'
export type FormatSegment = { type: 'format'; tag: FormatTag }
export type ParsedSegment = TextSegment | SymbolSegment | FormatSegment

const KNOWN_KEYS = new Set([
  // Result symbols (rendered via ffi-swrpg-* CSS classes)
  'success', 'failure', 'advantage', 'threat', 'triumph', 'despair',
  // Force pips (rendered via ffi-swrpg-force with colour override)
  'light', 'dark',
  // Dice faces (rendered via DiceFace SVG component)
  'boost', 'ability', 'proficiency', 'setback', 'difficulty', 'challenge', 'force',
])

// OggDude XML export shorthand → canonical key (case-insensitive lookup)
const OGGDUDE_ALIASES: Record<string, string> = {
  // Dice
  'bo':  'boost',       'bst': 'boost',
  'se':  'setback',     'set': 'setback',  'bl':  'setback',
  'di':  'difficulty',  'dif': 'difficulty',
  'ch':  'challenge',   'chl': 'challenge',
  'fo':  'force',
  'pr':  'proficiency', 'pro': 'proficiency',
  'ab':  'ability',     'abl': 'ability',
  // Result symbols
  'su':  'success',
  'fa':  'failure',
  'ad':  'advantage',
  'th':  'threat',
  'tr':  'triumph',
  'de':  'despair',
  // Force pips
  'fp':  'light',  // generic force pip
  'li':  'light',  // light side pip
  'da':  'dark',   // dark side pip (result)
  'dp':  'dark',   // dark side pip (spend)
}

// OggDude formatting tags — exact-case match (uppercase = open, lowercase = close)
const FORMAT_TAG_MAP: Record<string, FormatTag> = {
  'H4': 'h4-open',  'h4': 'h4-close',
  'H3': 'h3-open',  'h3': 'h3-close',
  'B':  'bold-open', 'b':  'bold-close',
  'I':  'italic-open', 'i': 'italic-close',
  'P':  'paragraph',
  'BR': 'linebreak',
}

// Colon-style codes (:success:, :average:, etc.) used in adversaries.json
const COLON_ALIASES: Record<string, string> = {
  'lightside':  'light',
  'darkside':   'dark',
  'forcepip':   'light',
  'simple':     '(-)',
  'easy':       'difficulty',
  'average':    'difficulty:2',
  'hard':       'difficulty:3',
  'daunting':   'difficulty:4',
  'formidable': 'difficulty:5',
}

function expandColonCodes(text: string): string {
  return text.replace(/:([a-z_]+):/g, (match, key) => {
    const lower = key.toLowerCase()
    if (lower in COLON_ALIASES) {
      const mapped = COLON_ALIASES[lower]
      return /^[a-z]/.test(mapped) ? `[${mapped}]` : mapped
    }
    if (KNOWN_KEYS.has(lower)) return `[${lower}]`
    return match
  })
}

// Matches [word], [word:digits], [H4], [h4], [BR], etc.
// Leading letter required; subsequent chars may be letters or digits.
const SHORTCODE_RE = /\[([a-z][a-z0-9]*)(?::(\d+))?\]/gi

export function parseSymbols(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const normalised = expandColonCodes(text)
  SHORTCODE_RE.lastIndex = 0

  while ((match = SHORTCODE_RE.exec(normalised)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: normalised.slice(lastIndex, match.index) })
    }

    const original = match[1]  // preserve case for format-tag detection

    // Formatting tags are case-sensitive (B ≠ b)
    const formatTag = FORMAT_TAG_MAP[original]
    if (formatTag !== undefined) {
      segments.push({ type: 'format', tag: formatTag })
    } else {
      const raw   = original.toLowerCase()
      const key   = OGGDUDE_ALIASES[raw] ?? raw
      const count = match[2] ? Math.max(1, parseInt(match[2], 10)) : 1

      if (KNOWN_KEYS.has(key)) {
        segments.push({ type: 'symbol', key, count })
      } else {
        segments.push({ type: 'text', value: match[0] })
      }
    }

    lastIndex = SHORTCODE_RE.lastIndex
  }

  if (lastIndex < normalised.length) {
    segments.push({ type: 'text', value: normalised.slice(lastIndex) })
  }

  return segments
}
