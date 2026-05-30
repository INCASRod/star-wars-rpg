# Inventory Card System — Design Spec

**Date:** 2026-05-25  
**Status:** Approved, awaiting implementation plan  
**Scope:** Player-side inventory card panel only. GM controls for condition and image upload are out of scope and will be specced separately.

---

## Overview

Replace the existing `InventoryPanel.tsx` (798-line single-file component) with a Master/Detail card system that presents each item as a rich, inspectable card. The goal is a video-game-style inventory — closer to Destiny 2 or The Witcher 3 than a spreadsheet.

The outer layout is a two-pane split: a scrollable 2-column thumbnail list on the left and a full item detail panel on the right. Selecting a thumbnail updates the detail panel.

---

## Component Tree

| Component | File (new) | Purpose |
|---|---|---|
| `InventoryCardPanel` | `inventory-card-panel.tsx` | Drop-in replacement for `InventoryPanel`. Owns `selectedItemId` state. Receives same props as current panel. |
| `ItemThumbGrid` | `item-thumb-grid.tsx` | Left pane. Renders section headers + 2-col grid of `ItemThumb` tiles for each category. |
| `ItemThumb` | `item-thumb.tsx` | One thumbnail cell. Displays item icon, equip-state dot, condition strip, truncated name. |
| `ItemDetailPanel` | `item-detail-panel.tsx` | Right pane. Receives selected item (weapon, armour, or gear union type). Renders hero, stats, description, qualities, condition, equip state. |
| `ItemDetailHero` | `item-detail-hero.tsx` | Banner at top of detail panel. Style B (icon left, text right) by default; full-art mode when `item_image_url` is set. |
| `ItemConditionTrack` | `item-condition-track.tsx` | Read-only 5-segment condition indicator with labels and a mechanical penalty note. |
| `ItemQualityList` | `item-quality-list.tsx` | Always-expanded list of quality rows (name, rank, description). |
| `StowLocationModal` | `stow-location-modal.tsx` | Extracted shared modal for stow location picking. Used by `ItemDetailPanel`. |

`HudInventoryTab`, `useCharacterData`, and `useStowLocations` are **unchanged**. `InventoryCardPanel` is a drop-in replacement — same props interface as the current `InventoryPanel`.

---

## Layout

### Left pane — Thumbnail list

- Fixed width: `148px`
- Background: `var(--hud-surface-hi)` (slightly darker than the detail panel)
- `border-right: 1px solid var(--hud-border)`
- Scrollable (`overflow-y: auto`)
- Section headers (`WEAPONS` / `ARMOUR` / `GEAR`) are sticky (`position: sticky; top: 0`) with `background: var(--hud-surface-hi)`, `border-bottom: 1px solid var(--hud-border)`, `color: var(--hud-gold)`
- Items within each section are laid out in a 2-column CSS grid (`grid-template-columns: 1fr 1fr; gap: 4px; padding: 5px`)

### Right pane — Detail panel

- `flex: 1`, `overflow-y: auto`
- Hero banner fixed at top (does not scroll with content)
- Stats row fixed below hero (does not scroll)
- Description, qualities, condition, and equip state scroll together in a padded body

---

## Thumbnail Tile (`ItemThumb`)

Each tile is ~66px wide, ~58px tall (image area + name label).

**Image area (44px tall):**
- Centres the item icon at `font-size: 20px`
- Background: `radial-gradient(ellipse at 50% 60%, var(--hud-accent-10) 0%, transparent 70%)`
- **Equip-state dot** — top-right corner, 5×5px circle:
  - `var(--hud-gold)` = Equipped
  - `var(--die-success)` = Carried
  - `var(--hud-text-faint)` = Stowed
- **Condition strip** — 3px bar along the bottom edge of the image area:
  - `var(--die-success)` = Undamaged or Minor
  - `var(--die-threat)` = Moderate
  - `var(--hud-vital-wounds)` = Major
  - `var(--hud-text-faint)` = Destroyed
- **Destroyed overlay** — when condition is `destroyed`, a semi-transparent `✕` overlays the entire image area and the tile is desaturated (`filter: grayscale(0.8)`)

**Name label (below image):**
- `font-size: FS.overline`, truncated with ellipsis
- Default colour: `var(--hud-text-dim)`
- Active (selected): `var(--hud-gold)`
- Major damage: `var(--hud-vital-wounds)`
- Destroyed: `var(--hud-text-faint)`

**Active state:** `var(--hud-gold)` border, `var(--hud-accent-10)` background tint. Implemented via CSS class `.inv-thumb-active` — no `onMouseEnter` style mutation.

---

## Detail Panel

### Hero Banner (`ItemDetailHero`)

**Default (icon-only):**
- Background: `linear-gradient(110deg, var(--hud-surface-hi) 0%, color-mix(in srgb, var(--hud-surface-hi) 80%, var(--hud-accent-10)) 100%)`
- `border-bottom: 1px solid var(--hud-border)`
- Top-right corner bracket accent (CSS `::before` or inline div), `var(--hud-gold)` at 35% opacity
- Left side: 58×58px framed icon box — `border: 1px solid var(--hud-gold)`, `border-radius: RADIUS.md`, `radial-gradient(ellipse at 50% 60%, var(--hud-accent-20) 0%, transparent 70%)` bg, `font-size: 28px`, `color: var(--hud-gold)`
- Right side (stacked, vertically centred):
  - **Type tag** — `FS.overline`, `var(--hud-gold)` at 60% opacity, `FONT_DISPLAY`, letter-spaced
  - **Item name** — `FS.h4`, `FONT_DISPLAY`, `var(--hud-text)`, `font-weight: 600`
  - **Hard points** — `FS.overline`, `var(--hud-text-faint)`

**Full-art mode** (when `item_image_url` is non-null):
- Image fills the full banner area (`object-fit: cover`)
- `linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)` overlay keeps the name readable
- Type tag and item name rendered over the overlay at the bottom-left

### Stats Row

Displayed as a row of stat boxes immediately below the hero banner (not part of the scroll area):

| Item type | Stats shown (label → token) |
|---|---|
| Weapon | Damage (`var(--die-threat)`), Crit (`var(--die-challenge)`), Range (`var(--die-advantage)`), Enc (`var(--hud-text-dim)`), HP (`var(--hud-accent-purple)`) |
| Armour | Soak (`var(--die-success)`), Defence (`var(--die-force)`), Enc (`var(--hud-text-dim)`), HP (`var(--hud-accent-purple)`) |
| Gear | Qty (`var(--hud-gold)`), Enc (`var(--hud-text-dim)`) |

HP = hard points total (not used count — used count is in the hero sub-line).

### Description

Full description text. `font-size: FS.label`, `color: var(--hud-text-faint)`, `line-height: 1.65`. Scrolls with the panel body.

### Special Qualities

Section header: `SPECIAL QUALITIES` — `FONT_DISPLAY`, `FS.overline`, `var(--hud-gold)`, underlined with `border-bottom: 1px solid var(--hud-border)`.

Each quality row:
- **Name** (`FS.label`, bold, `var(--hud-text)`) + optional **rank** number (`FS.caption`, `FONT_DISPLAY`, `var(--hud-gold)`) inline
- **Description** (`FS.caption`, `var(--hud-text-faint)`, line-height 1.5) below

If an item has no qualities, this section is omitted entirely.

### Condition Track (`ItemConditionTrack`)

Five equal-width segments, labelled below:

```
[ Undamaged ] [ Minor ] [ Moderate ] [ Major ] [ Destroyed ]
```

Segment fill rules (segments fill cumulatively left to right up to the active state):
- Undamaged: segment 1 `var(--die-success)`
- Minor: segments 1–2 `var(--die-success)`
- Moderate: segments 1–2 `var(--die-success)`, 3 `var(--die-threat)`
- Major: segments 1–2 `var(--die-success)`, 3 `var(--die-threat)`, 4 `var(--hud-vital-wounds)`
- Destroyed: all five filled `var(--hud-text-faint)`

Active segment has a subtle `box-shadow` glow in its fill colour.

Label below the track highlights the active state name in the matching colour. Inactive labels use `var(--hud-text-faint)`.

**Mechanical penalty note** (below labels, italic, `FS.overline`):
- Undamaged: `No penalty to use.` — `var(--hud-text-faint)`
- Minor: `Minor damage — adds 1 Setback die to all checks.` — `var(--hud-text-faint)`
- Moderate: `Moderate damage — adds 1 Setback die to all checks.` — `var(--hud-text-faint)`
- Major: `Major damage — item is unusable until repaired.` — `var(--hud-vital-wounds)`
- Destroyed: `Destroyed — this item is gone.` — `var(--hud-text-faint)`

The entire section is **read-only** for players. No interaction affordance.

### Equip State

Three full-width buttons: **Stow / Carry / Equipped**. Active button has `var(--hud-gold)` border and `var(--hud-accent-10)` background tint.

- Clicking **Stow** opens the `StowLocationModal` (extracted shared component)
- Clicking **Carry** or **Equipped** updates state immediately via the existing mutation hook
- When condition is `major` or `destroyed`, the **Equipped** button is visually disabled (opacity: 0.4, `cursor: not-allowed`) and non-interactive
- When stowed, a `StowPill` renders below the buttons showing the location name (same visual as existing panel)

Hover states are implemented via CSS classes in `globals.css` — no `onMouseEnter` style mutation.

---

## Data Model Changes

### New migration (`supabase/migrations/055_item_condition.sql`)

```sql
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;
```

### TypeScript (`src/lib/types.ts`)

New shared type (add after `GearRow`):

```ts
export type ItemCondition =
  | 'undamaged'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'destroyed';
```

`WpnDisplay`, `ArmDisplay`, and `GearRow` each gain:

```ts
condition:      ItemCondition
item_image_url: string | null
```

`useCharacterData` passes these fields through from the Supabase query. The `hudWeapons`, `hudArmor`, and `hudGear` memos also populate `stowLocation` (previously omitted) so the new detail panel can render `StowPill` correctly.

---

## Design Token Usage

All values must come from `@/lib/tokens`. No hardcoded colours, sizes, or spacing in component files.

Key tokens in use:

| Token | Usage |
|---|---|
| `var(--hud-gold)` | Equipped dot, active borders, section headers, icon colour |
| `var(--hud-accent-10/20)` | Subtle tint backgrounds (image area, hero shimmer) |
| `var(--die-success)` | Carried dot, undamaged/minor condition |
| `var(--die-threat)` | Moderate condition, Damage stat colour |
| `var(--die-challenge)` | Crit stat colour |
| `var(--die-advantage)` | Range stat colour |
| `var(--die-force)` | Defence stat colour |
| `var(--hud-vital-wounds)` | Major condition, major-damage name tint |
| `var(--hud-text)` | Item name, quality name |
| `var(--hud-text-dim)` | Default name, Enc stat colour |
| `var(--hud-text-faint)` | Stowed dot, destroyed condition, description, penalty notes |
| `var(--hud-accent-purple)` | HP stat colour |
| `var(--hud-surface-hi)` | Left pane background, sticky section headers |
| `var(--hud-surface-lo)` | Right pane background |
| `var(--hud-border)` | All structural borders |
| `FONT_BODY` | All body text, labels, button text |
| `FONT_DISPLAY` | Item names, type tags, stat numerals, section headers |
| `FS.overline` | Small labels (8–9px equivalent) |
| `FS.caption` | Quality description, rank, penalty note |
| `FS.label` | Description body, quality name |
| `FS.h4` | Item name in hero |
| `Z`, `RADIUS`, `SP` | All structural layout values |

---

## globals.css Additions

```css
/* Inventory thumbnail hover/active states */
.inv-thumb:hover { border-color: var(--hud-border-hi) !important; background: var(--hud-accent-10) !important; }
.inv-thumb-active { border-color: var(--hud-gold) !important; background: var(--hud-accent-10) !important; }

/* Inventory equip state button hover */
.inv-equip-btn:hover:not(:disabled) { border-color: var(--hud-accent-border); color: var(--hud-text-dim); }
```

---

## What Is Not In This Spec

- **GM condition controls** — how the GM sets item condition from their HUD. Separate spec.
- **GM image upload** — the UI for uploading `item_image_url`. Separate spec.
- **Oggdude icon mapping** — resolving which icon file corresponds to each item. `ItemThumb` and `ItemDetailHero` use type-based unicode fallbacks (⚔ weapon, ◈ armour, ◆ gear) until mapped.
- **Item editing / deletion** — the trash-button / discard flow is preserved as-is from `InventoryPanel`.
