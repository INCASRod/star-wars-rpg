/**
 * parseSymbols — parses human-readable shortcode markup into typed segments.
 *
 * Supported shortcodes:
 *   Result symbols : [success] [failure] [advantage] [threat] [triumph] [despair]
 *   Force pips     : [light] [dark]
 *   Dice faces     : [boost] [ability] [proficiency] [setback] [difficulty] [challenge] [force]
 *
 * Repeat count is optional: [difficulty:2] renders the symbol twice.
 * Matching is case-insensitive: [Advantage], [THREAT:2] both work.
 * Unknown shortcodes (e.g. [banana]) are emitted as literal text, not dropped.
 *
 * This is a pure data utility — no React dependency.
 */

export type TextSegment   = { type: 'text';   value: string }
export type SymbolSegment = { type: 'symbol'; key: string; count: number }
export type ParsedSegment = TextSegment | SymbolSegment

const KNOWN_KEYS = new Set([
  // Result symbols (rendered via ffi-swrpg-* CSS classes)
  'success', 'failure', 'advantage', 'threat', 'triumph', 'despair',
  // Force pips (rendered via ffi-swrpg-force with colour override)
  'light', 'dark',
  // Dice faces (rendered via DiceFace SVG component)
  'boost', 'ability', 'proficiency', 'setback', 'difficulty', 'challenge', 'force',
])

// OggDude XML export shorthand → canonical key
// e.g. [BO] in an imported adversary description → 'boost'
const OGGDUDE_ALIASES: Record<string, string> = {
  'bo': 'boost',
  'se': 'setback',
  'di': 'difficulty',
  'ch': 'challenge',
  'fo': 'force',
  'su': 'success',
  'ad': 'advantage',
  'th': 'threat',
  'tr': 'triumph',
  'de': 'despair',
  'fp': 'light',   // force pip → light-side pip icon
}

// Colon-style codes (:success:, :average:, etc.) used in adversaries.json
// Difficulty names expand to the right number of dice via [difficulty:N] syntax.
// An empty string means "render nothing" (e.g. :simple: = no check required).
const COLON_ALIASES: Record<string, string> = {
  // Force pips
  'lightside':  'light',
  'darkside':   'dark',
  'forcepip':   'light',
  // Difficulty levels → N difficulty dice
  'simple':     '(-)',           // no dice required — render as literal
  'easy':       'difficulty',    // 1 difficulty die
  'average':    'difficulty:2',
  'hard':       'difficulty:3',
  'daunting':   'difficulty:4',
  'formidable': 'difficulty:5',
}

/**
 * Convert :colon_code: notation to [bracket] shortcodes before the main parse.
 * Unknown colon codes fall through unchanged so they appear as literal text.
 */
function expandColonCodes(text: string): string {
  return text.replace(/:([a-z_]+):/g, (match, key) => {
    const lower = key.toLowerCase()
    if (lower in COLON_ALIASES) {
      const mapped = COLON_ALIASES[lower]
      // Shortcode bodies (e.g. 'difficulty:2') get wrapped; literals (e.g. '(-)') pass through
      return /^[a-z]/.test(mapped) ? `[${mapped}]` : mapped
    }
    // Might already be a known canonical key (e.g. :success:, :boost:)
    if (KNOWN_KEYS.has(lower)) return `[${lower}]`
    return match  // preserve unknown as-is
  })
}

// [word]  or  [word:digits]  — case-insensitive
const SHORTCODE_RE = /\[([a-z]+)(?::(\d+))?\]/gi

export function parseSymbols(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Normalise :colon: codes before bracket parsing
  const normalised = expandColonCodes(text)

  // Reset lastIndex in case the regex was previously used (module-level safety)
  SHORTCODE_RE.lastIndex = 0

  while ((match = SHORTCODE_RE.exec(normalised)) !== null) {
    // Emit any plain text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: normalised.slice(lastIndex, match.index) })
    }

    const raw   = match[1].toLowerCase()
    const key   = OGGDUDE_ALIASES[raw] ?? raw
    const count = match[2] ? Math.max(1, parseInt(match[2], 10)) : 1

    if (KNOWN_KEYS.has(key)) {
      segments.push({ type: 'symbol', key, count })
    } else {
      // Unknown shortcode — preserve as literal text
      segments.push({ type: 'text', value: match[0] })
    }

    lastIndex = SHORTCODE_RE.lastIndex
  }

  // Remaining text after the last match
  if (lastIndex < normalised.length) {
    segments.push({ type: 'text', value: normalised.slice(lastIndex) })
  }

  return segments
}
