# HUD Panel Clarity — Design Spec

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** Visual layer only — CSS variables and component style props. No logic, layout, or data changes.

---

## Problem

The player HUD has five distinct functional zones (TopBar, StatusStrip, LeftColumn, CenterContent, RightColumn) but they all sit within the same warm beige colour family (`#CBBAA0`–`#E8DDD0`). This causes them to visually merge into one undifferentiated surface. Specifically:

1. **TopBar and StatusStrip share the exact same background** (`--hud-surface-mid` = `#CBBAA0`), making them read as a single 84px slab. The border between them (`#CDB8A4`) is only 6% darker — effectively invisible.
2. **Wounds and Strain are visually secondary.** They are the most critical character stats but are rendered with 7px bars and 9–11px labels on the same pale background as the identity/credits chrome above them.
3. **Column edges are imperceptible.** All borders use `--bs-bdr-subtle` (`#CDB8A4`) — barely distinguishable from the panel surface — so the eye cannot locate where one zone ends and another begins.
4. **Characteristic stat cells blend into their column.** They use `--hud-surface-lo` as both the cell background and the column background — no visual grouping.

---

## Design Decision

**Hybrid approach: Stepped Elevation + High-Contrast Vital Strip.**

- Keep the Binary Sunset warm-parchment palette intact.
- Step the TopBar surface slightly darker to give it a settled "header tier" feel.
- Give the StatusStrip a **deep red background** so Wounds/Strain are unmistakably a distinct, high-importance zone.
- Strengthen all column borders from 1px subtle to 2px strong.
- Add a faint red tint to characteristic stat cells to group them visually.

This creates three clearly readable horizontal tiers:  
`[parchment header] → [deep red vital zone] → [light body]`

---

## Colour Changes

### New CSS variables (add to `:root` in `globals.css`)

```css
/* StatusStrip vital zone */
--hud-vital-bg:      #6A1A0A;              /* deep red — between bs-red-dim and bs-red-mute */
--hud-vital-border:  #4A1006;              /* darker edge for the strip bottom */
--hud-vital-text:    var(--bs-on-red);     /* #FFF0E8 — readable on dark red */
--hud-vital-sep:     rgba(255,255,255,.2); /* vertical dividers inside the strip */
--hud-vital-text-dim: rgba(255,240,232,.65); /* muted labels/controls on the red strip */
--hud-vital-wounds:  #FF7050;             /* lighter red — pops on dark bg (was --bs-red-sun on light) */
--hud-vital-strain:  #FFB060;             /* warm amber — distinguishable from wounds on dark bg */

/* Stronger structural edge */
--hud-border-strong: #9A8068;             /* 2px column edges (was 1px --bs-bdr-subtle #CDB8A4) */
```

### Modified existing variable (in `:root`)

```css
/* TopBar surface — step slightly darker to separate from the page bg */
--hud-surface-mid: #C8B89A;  /* was #CBBAA0 (= --bs-card) */
```

---

## Component Changes

### `HudStatusStrip.tsx`

- Wrapper `div` background: change from `var(--hud-surface-mid)` / `var(--hud-surface-hi)` to `var(--hud-vital-bg)`.
- Wrapper `div` border-bottom: change from `1px solid ${C.border}` to `2px solid var(--hud-vital-border)`.
- `LABEL_S` style: change `color` from `var(--hud-text-faint)` to `var(--hud-vital-text-dim)`.
- `NUM_S` style: change `color` from `var(--hud-text-dim)` to `var(--hud-vital-text)`.
- `CTRL_BTN` style: change `color` from `var(--hud-text-dim)` to `var(--hud-vital-text-dim)`.
- `DIVIDER` style: change `background` from `var(--hud-border)` to `var(--hud-vital-sep)`.
- Wounds bar fill: change from `var(--bs-red-sun)` to `var(--hud-vital-wounds)`.
- Wounds bar overflow fill: change from `var(--bs-red-mute)` to `rgba(255,112,80,.4)` (desaturated, signals critical).
- Strain bar fill: change from `var(--bs-red-mid)` to `var(--hud-vital-strain)`.
- Bar track background: change from `var(--hud-border)` to `rgba(0,0,0,.35)` (darker ground for light fills).
- `VitalTooltip` continues to use `var(--hud-surface-hi)` — no change needed.
- `CombatCheckButton` and `ForceCheckButton`: these render their own styles; verify they remain readable against the new dark background. If they use `--hud-text` for text colour they will need to switch to `--hud-vital-text` or white equivalents. **Flag during implementation if button text goes invisible.**

### `HudTopBar.tsx`

- Wrapper `div` background: `var(--hud-surface-mid)` already used — value changes automatically via the CSS variable update above (no code change needed).
- Wrapper `div` border-bottom: change from `1px solid ${C.border}` to `2px solid var(--hud-border-strong)`.

### `HudLeftColumn.tsx`

- Column wrapper `borderRight`: change from `1px solid ${C.border}` to `2px solid var(--hud-border-strong)`.
- Characteristic stat `div` (per cell): add `background: 'rgba(224,58,30,0.06)'` and `border: '1px solid rgba(224,58,30,0.18)'`. Remove current `background: 'var(--hud-surface-lo)'` on cells (let tint override).

### `HudRightColumn.tsx`

- Column wrapper `borderLeft`: change from `1px solid ${C.border}` to `2px solid var(--hud-border-strong)`.

---

## What Does NOT Change

- All layout, grid structure, column widths, tab bar, and navigation remain identical.
- `HudTopBar` background colour changes automatically via the updated `--hud-surface-mid` variable — no JSX edits needed beyond the border.
- The `HudVitalBar` component (if used in other contexts) is unaffected — changes are scoped to `HudStatusStrip`.
- Roll feed, tab content areas, modals, and overlays are out of scope.
- Combat mode (`isCombat`) conditional backgrounds in the StatusStrip also use the new `--hud-vital-bg` — combat mode distinction can be preserved by using `var(--hud-vital-border)` as the combat-active background instead of `var(--hud-surface-hi)`, making combat mode slightly darker-red. This is optional; flag during implementation.

---

## Acceptance Criteria

1. TopBar and StatusStrip are visually distinct at a glance — they do not read as one merged block.
2. Wounds and Strain bars are immediately visible without scanning — the red zone draws the eye.
3. Left and right column edges are clearly legible as structural boundaries.
4. Characteristic stat cells read as a grouped block within the left column.
5. No existing logic, routing, or data flows are changed.
6. All new colour values come from the new CSS variables — no hardcoded hex in component files.
7. `CombatCheckButton` and `ForceCheckButton` remain readable against the new strip background.
