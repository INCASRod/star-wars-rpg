/**
 * Wireframe design token shortcuts.
 * References CSS custom properties defined in globals.css — all values
 * are fluid clamp() ranges, never hardcoded px.
 *
 * Font scale (fluid — design-rules.md):
 *   overline  →  9–11px
 *   caption   → 10–12px
 *   label     → 11–13px
 *   sm        → 12–14px   (alias for --text-body-sm)
 *   body      → 15–18px
 *   bodyLg    → 16–20px
 *   h4        → 16–22px
 *   h3        → 18–28px
 *
 * Spacing scale (fluid — design-rules.md):
 *   sp1  →  4–8px
 *   sp2  →  8–16px
 *   sp3  → 12–24px
 *   sp4  → 16–32px
 *   sp6  → 24–48px
 */

export const WT = {
  // ── Font sizes ──────────────────────────────────────────────
  overline: 'var(--text-overline)' as const,
  caption:  'var(--text-caption)'  as const,
  label:    'var(--text-label)'    as const,
  sm:       'var(--text-sm)'       as const,   // alias → --text-body-sm
  body:     'var(--text-body)'     as const,
  bodyLg:   'var(--text-body-lg)'  as const,
  h4:       'var(--text-h4)'       as const,
  h3:       'var(--text-h3)'       as const,

  // ── Spacing ──────────────────────────────────────────────────
  sp1: 'var(--space-1)' as const,
  sp2: 'var(--space-2)' as const,
  sp3: 'var(--space-3)' as const,
  sp4: 'var(--space-4)' as const,
  sp6: 'var(--space-6)' as const,
} as const
