/**
 * Converts OggDude XML markup codes to HTML.
 * See HOLOCRON-Project-Brief.md Section 11 for reference.
 */

const MARKUP_MAP: Record<string, string> = {
  // ── Formatting ──────────────────────────────────────────────────
  '[H4]': '<h4>',
  '[h4]': '</h4>',
  '[H3]': '<h3>',
  '[h3]': '</h3>',
  '[B]':  '<strong>',
  '[b]':  '</strong>',
  '[I]':  '<em>',
  '[i]':  '</em>',
  '[P]':  '<br><br>',
  '[BR]': '<br>',
  // ── Dice types (what you add to your pool) ──────────────────────
  '[BO]': '<span class="die boost">Boost</span>',
  '[SE]': '<span class="die setback">Setback</span>',
  '[DI]': '<span class="die difficulty">Difficulty</span>',
  '[CH]': '<span class="die challenge">Challenge</span>',
  '[FO]': '<span class="die force">Force</span>',
  // ── Result symbols (narrative outcomes) ─────────────────────────
  '[SU]': '<span class="die success">✓</span>',
  '[AD]': '<span class="die advantage">◆</span>',
  '[TH]': '<span class="die threat">✕</span>',
  '[TR]': '<span class="die triumph">★</span>',
  '[DE]': '<span class="die despair">✸</span>',
  // ── Force ────────────────────────────────────────────────────────
  '[FP]': '<span class="die forcepip">◈ FP</span>',
}

export function parseOggDudeMarkup(text: string | null | undefined): string {
  if (!text) return ''

  let result = text
  for (const [code, replacement] of Object.entries(MARKUP_MAP)) {
    result = result.replaceAll(code, replacement)
  }

  return result
}
