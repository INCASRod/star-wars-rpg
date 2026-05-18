# Character Sheet Themes & Skin Switcher — Design Spec

**Date:** 2026-05-18
**Scope:** Character sheet only (`/character/[id]` → `PlayerHUDDesktop`). GM view untouched.
**Status:** Approved for implementation.

---

## Overview

Three interchangeable colour skins for the character sheet, selectable per player, persisted server-side via the existing `character_sessions` table. The default (Binary Sunset) is the current look. Players switch themes via three swatch buttons in the TopBar.

---

## Goals

- Players can choose one of three visual skins at any time.
- Their choice persists in Supabase and is restored on every subsequent load (same-browser identity via `session_key` in `localStorage`).
- No new auth infrastructure required.
- Theme switching must not require any component logic changes — all theming flows through CSS custom properties.
- Dice colours and symbol colours are **not changed** by any theme.

---

## The Three Themes

### Theme 1 — Binary Sunset *(default)*

**Setting:** Tatooine / desert warmth. Warm parchment backgrounds, red as action-only accent, antique gold for values and stats.

| Role | Variable | Value |
|---|---|---|
| Page bg | `--hud-bg` | `#E8DDD0` (existing) |
| Primary accent | `--hud-gold` | `#E03A1E` |
| Secondary / values | `--hud-gold-*` vars | warm gold `#C8AA50` range |
| Vital strip bg | `--hud-vital-bg` | `#6A1A0A` |
| Text (body) | `--hud-text` | `#5A2818` |

This is the existing `:root` definition. No `[data-theme]` block is needed — Binary Sunset is the CSS baseline.

**Key design rules for this theme:**
- Red (`#E03A1E`) is used **only** for primary action states (active tab, pressed buttons, CTA borders). Never decorative.
- Gold (`#C8AA50`) is used for all stat values, XP numbers, and important data.
- Untrained skill rows fade to 50% opacity.

---

### Theme 2 — Rebel Operative

**Setting:** Ferrix / Andor underground cell. Very dark warm-charcoal backgrounds (oxidised iron, carbon scoring), rebel orange as the primary accent, warm amber for values.

**`[data-theme="operative"]` overrides:**

```css
/* Backgrounds */
--hud-bg:            #141210;
--hud-panel:         #1E1A16;
--hud-surface-lo:    #262018;
--hud-surface-mid:   #2A2218;
--hud-surface-hi:    #2E281E;

/* Borders */
--hud-border:        rgba(210,185,150,.13);
--hud-border-hi:     rgba(210,185,150,.22);
--hud-border-strong: rgba(210,185,150,.30);

/* Text */
--hud-text:          #B0A490;
--hud-text-dim:      #726050;
--hud-text-faint:    #4C4038;

/* Primary accent — Rebel orange */
--hud-gold:          #D4681A;
--hud-accent-10:     rgba(212,104,26,.10);
--hud-accent-20:     rgba(212,104,26,.20);
--hud-accent-25:     rgba(212,104,26,.25);
--hud-accent-35:     rgba(212,104,26,.35);
--hud-accent-40:     rgba(212,104,26,.40);
--hud-accent-45:     rgba(212,104,26,.45);
--hud-accent-50:     rgba(212,104,26,.50);
--hud-accent-60:     rgba(212,104,26,.60);
--hud-accent-border: rgba(212,104,26,.28);

/* Secondary / values — warm amber */
--hud-gold-subtle:   rgba(200,148,56,.15);
--hud-gold-border:   rgba(200,148,56,.25);
--hud-gold-40:       rgba(200,148,56,.40);

/* Vital strip */
--hud-vital-bg:      #180C06;
--hud-vital-border:  #0E0602;
--hud-vital-text:    #E8C888;
--hud-vital-text-dim:rgba(232,200,136,.60);
--hud-vital-sep:     rgba(232,200,136,.18);
--hud-vital-wounds:  #CC4020;
--hud-vital-strain:  #C07818;

/* BS alias overrides — used by components that import from design-tokens.ts */
--bs-sky:            #141210;
--bs-panel:          #1E1A16;
--bs-surface:        #262018;
--bs-card:           #2E281E;
--bs-card-hi:        #362E24;
--bs-red-sun:        #D4681A;
--bs-red-pale:       #E07840;
--bs-red-hi:         #B85016;
--bs-red-mid:        #904010;
--bs-red-dim:        #602808;
--bs-red-mute:       #301404;
--bs-ink:            #E8DED0;
--bs-txt:            #B0A490;
--bs-txt2:           #726050;
--bs-txt3:           #4C4038;
--bs-on-red:         #FFF0E0;
--bs-bdr-strong:     rgba(210,185,150,.30);
--bs-bdr-mid:        rgba(210,185,150,.20);
--bs-bdr-subtle:     rgba(210,185,150,.13);
--bs-red-glow:       rgba(212,104,26,.12);
--bs-red-glow-s:     rgba(212,104,26,.28);
```

**Combat Check button overrides** (in the same `[data-theme="operative"]` block):
```css
/* Overrides .combat-check-btn colour — orange-tinted on dark */
```
The `.combat-check-btn` CSS class also needs `[data-theme="operative"] .combat-check-btn` overrides for background, border, and colour to use the orange accent family.

---

### Theme 3 — Kyber Archive

**Setting:** Jedi Temple / Force nexus. Midnight indigo backgrounds, kyber-crystal cyan as primary accent, ancient gold for values.

**`[data-theme="kyber"]` overrides:**

```css
/* Backgrounds */
--hud-bg:            #0C0E1A;
--hud-panel:         #111326;
--hud-surface-lo:    #161830;
--hud-surface-mid:   #1A1C34;
--hud-surface-hi:    #1C1E38;

/* Borders */
--hud-border:        rgba(91,188,216,.16);
--hud-border-hi:     rgba(91,188,216,.28);
--hud-border-strong: rgba(91,188,216,.38);

/* Text */
--hud-text:          #B0B8D0;
--hud-text-dim:      #707898;
--hud-text-faint:    #485070;

/* Primary accent — kyber cyan */
--hud-gold:          #5BBCD8;
--hud-accent-10:     rgba(91,188,216,.10);
--hud-accent-20:     rgba(91,188,216,.20);
--hud-accent-25:     rgba(91,188,216,.25);
--hud-accent-35:     rgba(91,188,216,.35);
--hud-accent-40:     rgba(91,188,216,.40);
--hud-accent-45:     rgba(91,188,216,.45);
--hud-accent-50:     rgba(91,188,216,.50);
--hud-accent-60:     rgba(91,188,216,.60);
--hud-accent-border: rgba(91,188,216,.25);

/* Secondary / values — ancient gold (same as BS) */
--hud-gold-subtle:   rgba(200,162,78,.15);
--hud-gold-border:   rgba(200,162,78,.25);
--hud-gold-40:       rgba(200,162,78,.40);

/* Vital strip */
--hud-vital-bg:      #081220;
--hud-vital-border:  #050C18;
--hud-vital-text:    #80CCE8;
--hud-vital-text-dim:rgba(128,204,232,.60);
--hud-vital-sep:     rgba(128,204,232,.18);
--hud-vital-wounds:  #D84030;
--hud-vital-strain:  #C89830;

/* BS alias overrides */
--bs-sky:            #0C0E1A;
--bs-panel:          #111326;
--bs-surface:        #161830;
--bs-card:           #1C1E38;
--bs-card-hi:        #202240;
--bs-red-sun:        #5BBCD8;
--bs-red-pale:       #80D4EC;
--bs-red-hi:         #3A9CBD;
--bs-red-mid:        #2A7898;
--bs-red-dim:        #1A5070;
--bs-red-mute:       #0C2840;
--bs-ink:            #EEF0F8;
--bs-txt:            #B0B8D0;
--bs-txt2:           #707898;
--bs-txt3:           #485070;
--bs-on-red:         #040814;
--bs-bdr-strong:     rgba(91,188,216,.38);
--bs-bdr-mid:        rgba(91,188,216,.26);
--bs-bdr-subtle:     rgba(91,188,216,.16);
--bs-red-glow:       rgba(91,188,216,.12);
--bs-red-glow-s:     rgba(91,188,216,.28);
```

**Combat Check button overrides** — cyan-tinted on dark navy.

---

## CSS Architecture

### Selector strategy

```
:root { }                    ← Binary Sunset (the baseline — all existing values)
[data-theme="operative"] { } ← Rebel Operative overrides
[data-theme="kyber"] { }     ← Kyber Archive overrides
```

The `data-theme` attribute is applied to the **outermost div of `PlayerHUDDesktop`**. Nothing outside that div (e.g., the GM view, modals rendered via portals to `document.body`) is affected.

> **Portal note:** Modals, popovers, and toasts rendered via `createPortal` to `document.body` will not be inside the `data-theme` element. These components already use `--hud-*` vars that resolve from `:root`. Their fallback to Binary Sunset is acceptable — the effort of propagating `data-theme` to portals is not worth it for V1.

### Applying the attribute

```tsx
// PlayerHUDDesktop.tsx
<div data-theme={uiTheme === 'binary-sunset' ? undefined : uiTheme} ...>
```

`'binary-sunset'` maps to no attribute → `:root` handles it. `'operative'` and `'kyber'` map to `data-theme="operative"` / `data-theme="kyber"`.

---

## Hardcoded Value Audit

Before theme switching can work reliably, hardcoded hex values in the following files must be replaced with their CSS var equivalents. This is the largest single piece of work.

**Files confirmed to contain theme-sensitive hardcoded hex:**

| File | Example hardcoded values | Replacement vars |
|---|---|---|
| `src/components/player-hud/SkillsPanel.tsx` | `#E03A1E`, `rgba(224,58,30,…)`, `#C82A10` | `--hud-gold`, `--hud-accent-*`, `var(--bs-red-hi)` |
| `src/components/player-hud/DiceRoller.tsx` | accent + text colours | `--hud-gold`, `--hud-text`, `--hud-accent-*` |
| `src/components/player-hud/ForcePanel.tsx` | accent colours | `--hud-gold`, `--hud-accent-*` |
| `src/components/player-hud/HudDecorations.tsx` | border + accent | `--hud-border-strong`, `--hud-gold` |
| `src/components/player-hud/RollFeedPanel.tsx` | text + accent | `--hud-text`, `--hud-gold` |
| `src/components/character/SkillRollPopover.tsx` | `HUD.gold`, inline rgba | already partially fixed — verify |
| `src/app/globals.css` | `.combat-check-btn` class | must add `[data-theme]` overrides |

**Values that must NOT be changed:**
- `CHAR_COLOR` in `tokens.ts` (brawn red, agility amber, etc.) — these are game-semantic, not decorative.
- `DICE_COLOR` and `DICE_META` — locked per game rules.
- `SYM_COLOR` — locked per game rules.

**Audit rule:** Any hex that is decorative/chrome (borders, backgrounds, text colour, accent highlights) must flow through a CSS var. Any hex that is game-semantic (characteristic colours, die faces, result symbols) stays hardcoded.

---

## Theme Switcher UI

### Location

Three small circular swatch buttons in **`HudTopBar`**, placed in the right section between the Print Sheet button and the Logout button, separated by the existing vertical `div` divider.

### Component: `ThemeSwitcher`

```tsx
// src/components/player-hud/ThemeSwitcher.tsx
type UiTheme = 'binary-sunset' | 'operative' | 'kyber'

interface ThemeSwitcherProps {
  current: UiTheme
  onChange: (theme: UiTheme) => void
}
```

Each swatch is a 16×16 circle (two-tone, showing the panel and accent colour of that theme). Active swatch has a 1px gold ring. Tooltip on hover shows the theme name.

**Swatch colours:**
| Theme | Inner (bg) | Outer ring (accent) |
|---|---|---|
| Binary Sunset | `#DCCFBC` | `#E03A1E` |
| Rebel Operative | `#1E1A16` | `#D4681A` |
| Kyber Archive | `#111326` | `#5BBCD8` |

No animation on switch — the CSS var transition is instant. Components that have `transition` already on their backgrounds will naturally ease (~200ms).

---

## Persistence

### DB migration — `053_ui_theme.sql`

```sql
alter table character_sessions
  add column if not exists ui_theme text not null default 'binary-sunset'
  check (ui_theme in ('binary-sunset', 'operative', 'kyber'));
```

No RLS changes needed — the existing permissive policy covers reads and updates by session key.

### Read flow

`PlayerHUDDesktop` already reads `sessionKey` from `localStorage` on the client (line 131). The `ui_theme` fetch piggybacks on the same session query:

```ts
// Inside PlayerHUDDesktop, alongside the existing character_sessions query
const { data: session } = await supabase
  .from('character_sessions')
  .select('ui_theme')
  .eq('character_id', characterId)
  .eq('session_key', sessionKey)
  .single()

const initialTheme = (session?.ui_theme ?? 'binary-sunset') as UiTheme
```

This is an additive change to an existing client-side query — no server component involvement. If no session row exists (unauthenticated load), default to `'binary-sunset'`.

### Write flow

When the player changes theme via `ThemeSwitcher`:

```ts
await supabase
  .from('character_sessions')
  .update({ ui_theme: newTheme })
  .eq('character_id', characterId)
  .eq('session_key', sessionKey)
```

This is a fire-and-forget update (no loading state needed). The UI switches immediately via React state; the DB write confirms durability in the background. No optimistic rollback needed.

### State location

`ui_theme` lives in `PlayerHUDDesktop` as local React state, initialised from the server-loaded session prop. `ThemeSwitcher`'s `onChange` updates both the React state (triggering the `data-theme` re-render) and fires the Supabase write.

---

## New Files

| File | Purpose |
|---|---|
| `src/components/player-hud/ThemeSwitcher.tsx` | The three-swatch picker component |
| `supabase/migrations/053_ui_theme.sql` | Adds `ui_theme` column to `character_sessions` |

## Modified Files

| File | Change |
|---|---|
| `src/app/globals.css` | Add `[data-theme="operative"]` and `[data-theme="kyber"]` blocks; add per-theme `.combat-check-btn` overrides |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | Accept `initialTheme` prop, manage `uiTheme` state, apply `data-theme` to wrapper, pass theme + setter to `HudTopBar` |
| `src/components/player-hud/HudTopBar.tsx` | Accept `uiTheme` + `onThemeChange` props, render `ThemeSwitcher` |
| `src/app/character/[id]/page.tsx` | Include `ui_theme` in session select, pass as prop |
| `src/components/player-hud/SkillsPanel.tsx` | Audit: replace hardcoded hex with CSS vars |
| `src/components/player-hud/DiceRoller.tsx` | Audit: replace hardcoded hex with CSS vars |
| `src/components/player-hud/ForcePanel.tsx` | Audit: replace hardcoded hex with CSS vars |
| `src/components/player-hud/HudDecorations.tsx` | Audit: replace hardcoded hex with CSS vars |
| `src/components/player-hud/RollFeedPanel.tsx` | Audit: replace hardcoded hex with CSS vars |

---

## Out of Scope

- GM view — no theming, stays untouched.
- Mobile `MobileSessionCompanion` — not themed in V1.
- Portal-rendered modals (toasts, dice result overlays) — fallback to Binary Sunset acceptable.
- Cross-device persistence — requires Supabase Auth, specced separately if needed.
- Per-character theme (user requested per-player, not per-character).
- Custom theme editor or user-defined colours.

---

## Implementation Order

1. **Migration** — add `ui_theme` column (`053_ui_theme.sql`)
2. **CSS theme blocks** — add `[data-theme]` overrides to `globals.css`
3. **Hardcoded value audit** — grep and fix all theme-sensitive hex in the six component files
4. **`ThemeSwitcher` component** — the three swatch buttons
5. **Wire up `PlayerHUDDesktop`** — `data-theme` attribute, state, Supabase write
6. **Wire up `HudTopBar`** — render `ThemeSwitcher`
7. **Wire up character page** — include `ui_theme` in session fetch, pass prop
8. **Smoke test** — switch all three themes, reload page, verify preference restored
