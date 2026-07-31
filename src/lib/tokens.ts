/*
 * tokens.ts — HOLOCRON typed token references
 *
 * This file is a thin re-export layer.
 * CSS custom properties in src/styles/holo-tokens.css
 * and src/styles/state-tokens.css are the source of
 * truth for all values.
 *
 * This file holds typed JS references to those CSS vars
 * for use in inline styles and canvas/Pixi contexts.
 *
 * RULE: never hardcode a hex value here unless it is
 * in a canvas-only export (see sealed exports below).
 *
 * SEALED — never modify without explicit instruction:
 *   DICE_COLOR   — hardcoded hex, Pixi canvas context
 *   SYM_COLOR    — hardcoded hex, Pixi canvas context
 *   CHAR_COLOR   — hardcoded hex, Pixi canvas context
 *   ASSET_COLOR  — hardcoded hex, Pixi canvas context
 *   FONT_ICONS   — sw-rpg-icons font var, never reassign
 *   DICE_META    — die metadata, not a visual token
 *   SYM          — symbol metadata, not a visual token
 *   EMPTY_POOL   — zero-filled pool, not a visual token
 */

// ═══════════════════════════════════════════════════════════════
// HOLOCRON — Single Source of Truth: Design Tokens
//
// RULES (enforced by CLAUDE.md):
//   1. No inline style={{ }} objects in components.
//      Use CSS classes (Tailwind utilities or globals.css classes).
//   2. Only two fonts: Space Grotesk (display) + JetBrains Mono (body) + sw-rpg-icons (icons).
//   3. All colors, sizes, spacing, z-index, radius come from this file.
//   4. CSS custom properties (var(--*)) are the CSS side of this file.
// ═══════════════════════════════════════════════════════════════

import type React from 'react'

// ── Fonts ────────────────────────────────────────────────────────
// Two UI fonts + one icon font. Do not add more.
//   FONT_DISPLAY → Space Grotesk  — logos, stat numerics, display headings
//   FONT_BODY    → JetBrains Mono — all other UI text: labels, body, HUD, buttons
//   FONT_ICONS   → sw-rpg-icons   — dice/result symbol icon font only
//   FONT         → alias for FONT_BODY (backward compat — existing refs unchanged)
export const FONT_DISPLAY = "var(--font-display), 'Space Grotesk', sans-serif"
export const FONT_BODY    = "var(--font-body), 'Space Grotesk', sans-serif"
export const FONT_MONO    = "var(--font-mono), 'JetBrains Mono', monospace"
export const FONT         = FONT_BODY
export const FONT_ICONS   = 'var(--font-sw-rpg-icons)'

// ── Typography scale ─────────────────────────────────────────────
// All values reference CSS custom properties defined in globals.css.
// Never use hardcoded px or rem in components — use these constants.
export const FS = {
  // --text-hero existed in holo-tokens.css but was dead (defined, zero
  // consumers, sized 22→32px — nowhere near hero-numeral scale). Reused its
  // name/redefined its value rather than adding a differently-named token,
  // since nothing was reading the old value. Every other step is untouched.
  hero:    'var(--text-hero)',     // 64→96px — display/hero stat numerals only
  display: 'var(--text-display)',  // 36→80px
  h1:      'var(--text-h1)',       // 28→56px
  h2:      'var(--text-h2)',       // 22→40px
  h3:      'var(--text-h3)',       // 18→28px
  h4:      'var(--text-h4)',       // 16→22px
  body:    'var(--text-body)',     // 15→18px
  bodyLg:  'var(--text-body-lg)', // 16→20px
  sm:      'var(--text-body-sm)', // 12→14px
  label:   'var(--text-label)',   // 11→13px
  caption: 'var(--text-caption)', // 10→12px
  overline:'var(--text-overline)',//  9→11px
} as const

// ── Spacing ──────────────────────────────────────────────────────
// Fluid clamp() ranges. Use for margin, padding, gap.
export const SP = {
  1:  'var(--space-1)',   //  4→8px
  2:  'var(--space-2)',   //  8→16px
  3:  'var(--space-3)',   // 12→24px
  4:  'var(--space-4)',   // 16→32px
  5:  'var(--space-5)',   // 20px fixed
  6:  'var(--space-6)',   // 24→48px
  8:  'var(--space-8)',   // 32→64px
  10: 'var(--space-10)',  // 40px fixed
  12: 'var(--space-12)',  // 48→96px
  16: 'var(--space-16)',  // 64→160px
} as const

// ── Border radius ────────────────────────────────────────────────
// Use these — do not hardcode 4, 8, 3 inline.
export const RADIUS = {
  sm:   2,      // tight: badges, chips
  md:   4,      // default: inputs, buttons, rows
  lg:   8,      // elevated: cards, modals
  xl:   12,     // large: panels
  full: '50%',  // circular: avatars, pips
} as const

// ── Z-index scale ────────────────────────────────────────────────
// All z-index values in the app must use this scale.
export const Z = {
  base:       0,
  raised:     1,
  sticky:     10,
  dropdown:   20,
  overlay:    100,
  backdrop:   400,
  modal:      410,
  popover:    420,
  fab:        500,
  deck:         520,   // Encounter Deck handle + collapsed body — above MapToolsRadial
  deckExpanded: 530,   // Encounter Deck expanded rail/search — above the deck's own handle
  dossier:      540,   // Encounter Dossier (expanded card view) — above the deck's own expanded layer
  toast:      800,
  dialog:     820,
  tooltip:    9999,
  // ── HUD high-stack layer (values from holo-tokens.css) ──────
  hudDrawer:  8999,   // --z-hud-drawer  — behind full overlay
  hudOverlay: 9000,   // --z-hud-overlay — full-screen overlays
  hudCombat:  9001,   // --z-hud-combat  — combat transition layer
  hudSupreme: 9999,   // --z-hud-supreme — tooltip on overlay
} as const

// ── Shadows ──────────────────────────────────────────────────────
export const SHADOW = {
  sm: 'var(--shadow-sm)',   // 0 1px 3px rgba(0,0,0,0.08)
  md: 'var(--shadow-md)',   // 0 4px 12px rgba(0,0,0,0.10)
  lg: 'var(--shadow-lg)',   // 0 8px 24px rgba(0,0,0,0.12)
  dossier: 'var(--shadow-dossier)', // 0 24px 80px rgba(0,0,0,0.7) — large expanded-panel depth (EncounterDossier)
  tooltip: 'var(--shadow-tooltip)', // 0 10px 26px rgba(0,0,0,0.7) — small floating card depth (PlayerTokenTooltip)
} as const

// ── Modal layer ──────────────────────────────────────────────────
// Shared values for the Modal component — import MODAL, not raw hex.
export const MODAL = {
  backdrop: 'rgba(0,0,0,0.78)',         // dark scrim behind all modals
  shadow:   '0 16px 48px rgba(0,0,0,0.64)', // base depth shadow (no glow)
} as const

// ── Transitions ──────────────────────────────────────────────────
export const EASE = {
  default: 'var(--ease-default)',   // 200ms ease
  quick:   'var(--ease-quick)',     // 120ms ease — micro-interactions
  spring:  'var(--ease-spring)',    // 300ms cubic-bezier spring
  panel:   'var(--ease-panel)',     // 260ms cubic-bezier — drawer/panel slides
  smooth:  'var(--ease-smooth)',    // 300ms ease — fills, backgrounds
} as const

// ── Project palette colors ───────────────────────────────────────
// Reference CSS custom properties — use these, not raw hex, in any
// component that renders in the neutral/light contexts (character sheet, etc.)
export const COLOR = {
  // Backgrounds
  sand:      'var(--sand)',
  sandWarm:  'var(--sand-warm)',
  parch:     'var(--parch)',
  white:     'var(--white)',
  // Text
  ink:       'var(--ink)',
  txt:       'var(--txt)',
  txt2:      'var(--txt2)',
  txt3:      'var(--txt3)',
  // Borders
  bdr:       'var(--bdr)',
  bdrL:      'var(--bdr-l)',
  // Brand
  gold:      'var(--gold)',
  goldL:     'var(--gold-l)',
  goldD:     'var(--gold-d)',
  goldGlow:  'var(--gold-glow)',
  goldGlowS: 'var(--gold-glow-s)',
  // Semantic
  blue:      'var(--blue)',
  blueL:     'var(--blue-l)',
  bluePale:  'var(--blue-pale)',
  red:       'var(--red)',
  redL:      'var(--red-l)',
  redPale:   'var(--red-pale)',
  amber:     'var(--amber)',
  amberPale: 'var(--amber-pale)',
  green:     'var(--green)',
  greenPale: 'var(--green-pale)',

} as const

// ── HUD dark terminal theme ──────────────────────────────────────
// Used by PlayerHUD, CombatPanel, CombatTracker, wireframe panels.
// Reference CSS custom properties — do not hardcode HUD hex values.
export const HUD = {
  bg:           'var(--hud-bg)',
  panel:        'var(--hud-panel)',
  panelBg:      'var(--hud-panel)',  // alias — prefer .panel in new code
  surfaceLo:    'var(--hud-surface-lo)',
  surfaceMid:   'var(--hud-surface-mid)',
  surfaceHi:    'var(--hud-surface-hi)',
  border:       'var(--hud-border)',
  borderHi:     'var(--hud-border-hi)',
  borderStrong: 'var(--hud-border-strong)',
  text:         'var(--hud-text)',
  textDim:      'var(--hud-text-dim)',
  textFaint:    'var(--hud-text-faint)',
  gold:         'var(--hud-gold)',
  accent:       'var(--hud-accent)',
  accentHi:     'var(--hud-accent-hi)',
  accentPurple: 'var(--hud-accent-purple)',
} as const

// ── Talent tree — plaque, glow, link tokens ────────────────────────
// Reference CSS custom properties defined in state-tokens.css (both
// theme blocks). Used by the FFG-style talent/signature-ability tree
// renderer and its purchase-flow chrome.
export const PLAQUE = {
  body:       'var(--plaque-body)',
  edge:       'var(--plaque-edge)',
  edgeOwned:  'var(--plaque-edge-owned)',
  sheen:      'var(--plaque-sheen)',
  // Owned-plate treatment — gold family in Ember, cyan family in Kyber
  // (aliases --hud-gold per-theme); dark plate-text (aliases --plaque-body);
  // available-state accent (aliases --hud-accent), deliberately a different
  // hue from the plate so "owned" and "available" never look like the same
  // signal.
  plate:      'var(--plaque-plate)',
  plateText:  'var(--plaque-plate-text)',
  availAccent: 'var(--plaque-avail-accent)',
} as const

export const ACTIVATION_TOKEN = {
  active:            { bg: 'var(--activation-active)',      text: 'var(--activation-active-text)' },
  passive:           { bg: 'var(--activation-passive)',     text: 'var(--activation-passive-text)' },
  maneuver:          { bg: 'var(--activation-maneuver)',    text: 'var(--activation-maneuver-text)' },
  incidental:        { bg: 'var(--activation-incidental)',  text: 'var(--activation-incidental-text)' },
} as const

// Flat activation-label → colour lookup, shared by TalentTree, TalentsPanel,
// and TalentsCard. Keyed by the human labels from ACTIVATION_LABELS
// (src/lib/types.ts) — 'Incidental' and 'Incidental (OOT)' intentionally
// share one colour, matching how all three prior local maps treated them.
export const ACTIVATION_COLOR: Record<string, string> = {
  'Passive':          ACTIVATION_TOKEN.passive.bg,
  'Action':           ACTIVATION_TOKEN.active.bg,
  'Maneuver':         ACTIVATION_TOKEN.maneuver.bg,
  'Incidental':       ACTIVATION_TOKEN.incidental.bg,
  'Incidental (OOT)': ACTIVATION_TOKEN.incidental.bg,
} as const

export const GLOW = {
  hud:        'var(--hud-glow)',
  path:       'var(--path-glow)',
  forceSpark: 'var(--force-spark)',
} as const

export const LINK_BAR = {
  rest:   'var(--link-bar)',
  active: 'var(--link-bar-active)',
} as const

// ── Characteristic colors ────────────────────────────────────────
// These are used in JS contexts (canvas, SVG, icon tinting) where
// CSS vars cannot be resolved — hardcoded hex is intentional here.
export const CHAR_COLOR = {
  brawn:     '#E03A1E',  // BS red-sun — raw force
  agility:   '#D4903A',  // warm amber — swift
  intellect: '#C8AA50',  // antique gold — knowledge
  cunning:   '#B07828',  // dark bronze — guile
  willpower: '#C82A10',  // BS red-hi — composed resolve
  presence:  '#E07050',  // warm coral — charisma
} as const

export type CharKey = 'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence'

export const CHAR_ABBR3: Record<CharKey, string> = {
  brawn: 'BRN', agility: 'AGI', intellect: 'INT',
  cunning: 'CUN', willpower: 'WIL', presence: 'PRS',
}

export const CHAR_FULL: Record<CharKey, string> = {
  brawn:     'Brawn',
  agility:   'Agility',
  intellect: 'Intellect',
  cunning:   'Cunning',
  willpower: 'Willpower',
  presence:  'Presence',
} as const

export const CHAR_REF_MAP: Record<string, CharKey> = {
  BR: 'brawn', AG: 'agility', INT: 'intellect',
  CUN: 'cunning', WIL: 'willpower', PR: 'presence',
}

// ── Dice pool colors ─────────────────────────────────────────────
// Used in JS/canvas contexts where CSS vars don't resolve.
export const DICE_COLOR = {
  proficiency: '#C8961A',
  ability:     '#4A7A30',
  boost:       '#1A78A0',
  challenge:   '#C62828',
  difficulty:  '#7B1FA2',
  setback:     '#455A64',
  force:       '#FFFFFF',
} as const

export type DiceType = 'proficiency' | 'ability' | 'boost' | 'challenge' | 'difficulty' | 'setback' | 'force'

export interface DiceMeta {
  color: string
  shape: 'octagon' | 'diamond' | 'rounded'
  label: string
  positive: boolean
}

export const DICE_META: Record<DiceType, DiceMeta> = {
  proficiency: { color: DICE_COLOR.proficiency, shape: 'octagon',  label: 'PRO', positive: true },
  ability:     { color: DICE_COLOR.ability,     shape: 'diamond',  label: 'ABL', positive: true },
  boost:       { color: DICE_COLOR.boost,       shape: 'rounded',  label: 'BST', positive: true },
  challenge:   { color: DICE_COLOR.challenge,   shape: 'octagon',  label: 'CHL', positive: false },
  difficulty:  { color: DICE_COLOR.difficulty,  shape: 'diamond',  label: 'DIF', positive: false },
  setback:     { color: DICE_COLOR.setback,     shape: 'rounded',  label: 'SET', positive: false },
  force:       { color: DICE_COLOR.force,       shape: 'octagon',  label: 'FOR', positive: true },
}

export const EMPTY_POOL: Record<DiceType, number> = {
  proficiency: 0, ability: 0, boost: 0,
  challenge: 0, difficulty: 0, setback: 0, force: 0,
}

// ── Result symbol colors ─────────────────────────────────────────
export const SYM_COLOR = {
  success:   '#4A7A30',
  failure:   '#E05050',
  advantage: '#1A78A0',
  threat:    '#B060D0',
  triumph:   '#D4B840',
  despair:   '#FF6060',
  lightPip:  '#FFFFFF',
  darkPip:   '#9966CC',
  forcePip:  '#C8D8C0',
} as const

export type SymbolKey = 'S' | 'F' | 'A' | 'H' | 'T' | 'D'

export interface SymbolMeta {
  icon: string
  color: string
  label: string
}

// ── Talent activation identity colors ────────────────────────────
// SEALED — fixed identity colors, theme-independent, same convention as
// DICE_COLOR above. Activation type is identity encoding (a Maneuver must
// read identically in Ember Tatooine and Kyber Archive), so unlike most of
// the app these five deliberately do NOT resolve to --hud-* theme tokens.
// Previously Passive/Action rode --hud-text-dim/--hud-gold (which vary per
// theme) while Incidental/Maneuver/OOT were hardcoded hex inline in
// wireframe/TalentsPanel.tsx — that inconsistency is what sealing these
// fixes. Values preserve the visual identity already established by that
// inline hex (Incidental/Maneuver/OOT) and approximate the neutral/default
// look of the formerly-tokenized pair (Passive/Action), not any one theme's
// current value. Distinct from the pre-existing ACTIVATION_TOKEN map above
// (theme-tokenized, 4 keys, no OOT) — that one belongs to the talents
// ROUTE's own TalentTree.tsx and is untouched by this namespace.
export const TALENT_ACTIVATION_COLOR = {
  passive:    '#8593A0',
  incidental: '#5AAAE0',
  maneuver:   '#4EC87A',
  action:     '#D8A544',
  oot:        '#D87060',
} as const

export type TalentActivationKey = keyof typeof TALENT_ACTIVATION_COLOR

export interface TalentActivationMeta {
  color: string
  label: string
}

export const TALENT_ACTIVATION_META: Record<TalentActivationKey, TalentActivationMeta> = {
  passive:    { color: TALENT_ACTIVATION_COLOR.passive,    label: 'Passive' },
  incidental: { color: TALENT_ACTIVATION_COLOR.incidental, label: 'Incidental' },
  maneuver:   { color: TALENT_ACTIVATION_COLOR.maneuver,   label: 'Maneuver' },
  action:     { color: TALENT_ACTIVATION_COLOR.action,     label: 'Action' },
  oot:        { color: TALENT_ACTIVATION_COLOR.oot,        label: 'Out of Turn' },
}

export const SYM: Record<SymbolKey, SymbolMeta> = {
  S: { icon: 'swrpg-success',   color: SYM_COLOR.success,   label: 'Success' },
  F: { icon: 'swrpg-failure',   color: SYM_COLOR.failure,   label: 'Failure' },
  A: { icon: 'swrpg-advantage', color: SYM_COLOR.advantage, label: 'Advantage' },
  H: { icon: 'swrpg-threat',    color: SYM_COLOR.threat,    label: 'Threat' },
  T: { icon: 'swrpg-triumph',   color: SYM_COLOR.triumph,   label: 'Triumph' },
  D: { icon: 'swrpg-despair',   color: SYM_COLOR.despair,   label: 'Despair' },
}

// ── Asset / stow location colors ─────────────────────────────────
export const ASSET_COLOR = {
  vehicle:            '#4EC87A',
  starship:           '#40C4D4',
  safe_house:         '#D4A84B',
  base_of_operations: '#9B59B6',
  strategic_asset:    '#5AAAE0',
  npc:                '#A0A0A0',
  other:              '#6A8070',
} as const

// ── Rarity helpers ────────────────────────────────────────────────
export function rarityColor(r: number): string {
  if (r <= 2) return COLOR.txt3
  if (r <= 4) return COLOR.green
  if (r <= 6) return COLOR.blue
  if (r <= 8) return '#7B3FA0'  // epic purple — no CSS var exists for this
  return COLOR.gold
}

export function rarityLabel(r: number): string {
  if (r <= 2) return 'Common'
  if (r <= 4) return 'Uncommon'
  if (r <= 6) return 'Rare'
  if (r <= 8) return 'Epic'
  return 'Legendary'
}

// ── HUD panel base style ─────────────────────────────────────────
// The ONE permitted shared style object. backdrop-filter cannot be
// expressed as a Tailwind utility, so this stays as a CSSProperties
// spread. All values reference tokens — no raw hex or px.
// Usage: <div style={panelBase}> or style={{ ...panelBase, ... }}
export const panelBase: React.CSSProperties = {
  background:           HUD.panel,
  backdropFilter:       'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border:               `1px solid ${HUD.border}`,
  borderRadius:         RADIUS.lg,
  position:             'relative',
}
