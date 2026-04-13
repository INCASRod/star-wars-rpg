'use client'

import { parseSymbols } from '@/lib/parseSymbols'
import { DiceFace } from '@/components/dice/DiceFace'
import type { DiceType } from '@/components/player-hud/design-tokens'

// ── Result symbols ─────────────────────────────────────────────────────────
// Rendered as <i className="ffi ffi-swrpg-{cls}"> using the locally-loaded
// sw-rpg-icons font (declared in globals.css via --font-sw-rpg-icons).
const CSS_ICON: Record<string, string> = {
  success:   'ffi-swrpg-success',
  failure:   'ffi-swrpg-failure',
  advantage: 'ffi-swrpg-advantage',
  threat:    'ffi-swrpg-threat',
  triumph:   'ffi-swrpg-triumph',
  despair:   'ffi-swrpg-despair',
}

// ── Force pips ─────────────────────────────────────────────────────────────
// The package has no separate light/dark-pip glyph; we reuse ffi-swrpg-force
// with a colour override.  White = light side, near-black = dark side.
const FORCE_PIP_COLOR: Record<string, string> = {
  light: '#FFFFFF',
  dark:  '#333333',
}

// ── Dice faces ─────────────────────────────────────────────────────────────
// Rendered via the DiceFace SVG component (no sw-rpg-icons glyph exists for
// FFG custom polyhedra shapes).
const DICE_FACE_KEYS = new Set<string>([
  'boost', 'ability', 'proficiency', 'setback', 'difficulty', 'challenge', 'force',
])

// ── Human-readable labels for title / accessibility ────────────────────────
const LABEL: Record<string, string> = {
  success:     'Success',
  failure:     'Failure',
  advantage:   'Advantage',
  threat:      'Threat',
  triumph:     'Triumph',
  despair:     'Despair',
  light:       'Light side Force pip',
  dark:        'Dark side Force pip',
  boost:       'Boost die',
  ability:     'Ability die',
  proficiency: 'Proficiency die',
  setback:     'Setback die',
  difficulty:  'Difficulty die',
  challenge:   'Challenge die',
  force:       'Force die',
}

// ── Inline style applied to every symbol to keep it in the text flow ───────
const INLINE: React.CSSProperties = {
  display:       'inline',
  verticalAlign: 'middle',
  lineHeight:    1,
}

interface RichTextProps {
  text: string
  className?: string
}

/**
 * <RichText> renders a string containing shortcode markup as inline content.
 *
 * Usage:
 *   <RichText text="Roll [difficulty:2] and spend [advantage] to recover [success]." />
 *
 * The root element is a <span> so the component never breaks surrounding text flow.
 * Unknown shortcodes (e.g. [banana]) are preserved as literal text.
 */
export function RichText({ text, className }: RichTextProps) {
  const segments = parseSymbols(text)

  return (
    <span className={className}>
      {segments.map((seg, segIdx) => {
        if (seg.type === 'text') {
          return seg.value
        }

        const { key, count } = seg
        const label = LABEL[key] ?? key

        return Array.from({ length: count }, (_, iconIdx) => {
          const k = `${segIdx}-${iconIdx}`

          // ── CSS result-symbol icon ──
          if (key in CSS_ICON) {
            return (
              <i
                key={k}
                className={`ffi ${CSS_ICON[key]}`}
                aria-hidden="true"
                title={label}
                style={INLINE}
              />
            )
          }

          // ── Force pip (light / dark) — ffi-swrpg-force with colour override ──
          if (key in FORCE_PIP_COLOR) {
            return (
              <i
                key={k}
                className="ffi ffi-swrpg-force"
                aria-hidden="true"
                title={label}
                style={{ ...INLINE, color: FORCE_PIP_COLOR[key] }}
              />
            )
          }

          // ── Dice face SVG ──
          if (DICE_FACE_KEYS.has(key)) {
            return (
              <span
                key={k}
                aria-hidden="true"
                title={label}
                style={{ ...INLINE, display: 'inline-block' }}
              >
                <DiceFace
                  type={key as DiceType}
                  size={14}
                  style={{ verticalAlign: 'middle' }}
                />
              </span>
            )
          }

          return null
        })
      })}
    </span>
  )
}
