// ═══════════════════════════════════════
// HOLOCRON Player HUD — Design Tokens
// Dark terminal aesthetic, tactical display
// ═══════════════════════════════════════

export const C = {
  bg: '#060D09',
  panelBg: 'rgba(8,16,10,0.82)',
  border: 'rgba(200,170,80,0.14)',
  borderHi: 'rgba(200,170,80,0.32)',
  text: '#C8D8C0',
  textDim: '#6A8070',
  textFaint: '#2A3A2E',
  gold: '#C8AA50',
  // Characteristic palette
  brawn: '#E07855',
  agility: '#4EC87A',
  intellect: '#5AAAE0',
  cunning: '#D4B840',
  willpower: '#B070D8',
  presence: '#D87060',
} as const

export type CharKey = 'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence'

export const CHAR_COLOR: Record<CharKey, string> = {
  brawn: C.brawn,
  agility: C.agility,
  intellect: C.intellect,
  cunning: C.cunning,
  willpower: C.willpower,
  presence: C.presence,
}

export const CHAR_ABBR3: Record<CharKey, string> = {
  brawn: 'BRN',
  agility: 'AGI',
  intellect: 'INT',
  cunning: 'CUN',
  willpower: 'WIL',
  presence: 'PRS',
}

// Maps 2-letter skill characteristic key → CharKey
export const CHAR_REF_MAP: Record<string, CharKey> = {
  BR: 'brawn',
  AG: 'agility',
  INT: 'intellect',
  CUN: 'cunning',
  WIL: 'willpower',
  PR: 'presence',
}

export type DiceType = 'proficiency' | 'ability' | 'boost' | 'challenge' | 'difficulty' | 'setback' | 'force'

export interface DiceMeta {
  color: string
  shape: 'octagon' | 'diamond' | 'rounded'
  label: string
  positive: boolean
}

export const DICE_META: Record<DiceType, DiceMeta> = {
  proficiency: { color: '#F5C518', shape: 'octagon',  label: 'PRO', positive: true },
  ability:     { color: '#4CAF50', shape: 'diamond',  label: 'ABL', positive: true },
  boost:       { color: '#29B6F6', shape: 'rounded',  label: 'BST', positive: true },
  challenge:   { color: '#C62828', shape: 'octagon',  label: 'CHL', positive: false },
  difficulty:  { color: '#7B1FA2', shape: 'diamond',  label: 'DIF', positive: false },
  setback:     { color: '#455A64', shape: 'rounded',  label: 'SET', positive: false },
  force:       { color: '#FFFFFF', shape: 'octagon',  label: 'FOR', positive: true },
}

export type SymbolKey = 'S' | 'F' | 'A' | 'H' | 'T' | 'D'

export interface SymbolMeta {
  icon: string
  color: string
  label: string
}

export const SYM: Record<SymbolKey, SymbolMeta> = {
  S: { icon: '✦', color: '#4EC87A', label: 'Success' },
  F: { icon: '✗', color: '#E05050', label: 'Failure' },
  A: { icon: '◇', color: '#70C8E8', label: 'Advantage' },
  H: { icon: '◆', color: '#B060D0', label: 'Threat' },
  T: { icon: '★', color: '#D4B840', label: 'Triumph' },
  D: { icon: '☠', color: '#FF6060', label: 'Despair' },
}

// Font strings for inline styles — Rajdhani for all roles
export const FONT_CINZEL = "var(--font-rajdhani), 'Rajdhani', sans-serif"
export const FONT_RAJDHANI = "var(--font-rajdhani), 'Rajdhani', sans-serif"

// Fluid font sizes — reference global CSS vars, not hardcoded px
// Matches the GM page's FS_* pattern for consistency
export const FS_OVERLINE = 'var(--hud-sz-overline)'  //  9→11px: tiny labels, ticks
export const FS_CAPTION = 'var(--hud-sz-caption)'   // 10→12px: captions, secondary info
export const FS_LABEL = 'var(--hud-sz-label)'     // 11→13px: labels, stat names
export const FS_SM = 'var(--hud-sz-sm)'        // 12→14px: small body, skill names
export const FS_H4 = 'var(--hud-sz-h4)'        // 16→22px: section headers
export const FS_H3 = 'var(--hud-sz-h3)'        // 18→28px: panel titles, big numbers

// Default empty dice pool
export const EMPTY_POOL: Record<DiceType, number> = {
  proficiency: 0,
  ability: 0,
  boost: 0,
  challenge: 0,
  difficulty: 0,
  setback: 0,
  force: 0,
}

// Shared panel style (object spread into inline style)
export const panelBase = {
  background: C.panelBg,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  position: 'relative' as const,
}
