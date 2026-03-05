/**
 * Converts OggDude XML markup codes to HTML.
 * See HOLOCRON-Project-Brief.md Section 11 for reference.
 */

const MARKUP_MAP: Record<string, { open: string; close?: string }> = {
  '[H4]': { open: '<h4>', close: '</h4>' },
  '[h4]': { open: '</h4>' },
  '[H3]': { open: '<h3>', close: '</h3>' },
  '[h3]': { open: '</h3>' },
  '[B]':  { open: '<strong>', close: '</strong>' },
  '[b]':  { open: '</strong>' },
  '[P]':  { open: '<p>' },
  '[BR]': { open: '<br>' },
  '[DI]': { open: '<span class="die difficulty">d</span>' },
  '[SU]': { open: '<span class="die success">s</span>' },
  '[AD]': { open: '<span class="die advantage">a</span>' },
  '[TH]': { open: '<span class="die threat">t</span>' },
  '[TR]': { open: '<span class="die triumph">x</span>' },
  '[DE]': { open: '<span class="die despair">y</span>' },
  '[FO]': { open: '<span class="die force">f</span>' },
  '[FP]': { open: '<span class="die forcepip">p</span>' },
  '[SE]': { open: '<span class="die setback">b</span>' },
  '[BO]': { open: '<span class="die boost">b</span>' },
  '[CH]': { open: '<span class="die challenge">c</span>' },
}

export function parseOggDudeMarkup(text: string | null | undefined): string {
  if (!text) return ''

  let result = text
  for (const [code, replacement] of Object.entries(MARKUP_MAP)) {
    result = result.replaceAll(code, replacement.open)
  }

  return result
}
