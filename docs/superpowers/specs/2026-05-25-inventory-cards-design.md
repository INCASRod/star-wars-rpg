# Inventory Card System — Design Spec

**Date:** 2026-05-25  
**Status:** Approved, awaiting implementation plan  
**Scope:** Player-side inventory card panel only. GM controls for condition and image upload are out of scope and will be specced separately.

---

## Overview

Replace the existing `InventoryPanel.tsx` (780-line single-file component) with a Master/Detail card system that presents each item as a rich, inspectable card. The goal is a video-game-style inventory — closer to Destiny 2 or The Witcher 3 than a spreadsheet.

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

`HudInventoryTab`, `useCharacterData`, and `useStowLocations` are **unchanged**. `InventoryCardPanel` is a drop-in replacement — same props interface as the current `InventoryPanel`.

---

## Layout

### Left pane — Thumbnail list

- Fixed width: `148px`
- Background: slightly darker than the detail panel (`#07090e`)
- Scrollable (`overflow-y: auto`)
- Section headers (`WEAPONS` / `ARMOUR` / `GEAR`) are sticky (`position: sticky; top: 0`) with a subtle gold-tinted background so they stay visible while scrolling
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
- Background: subtle gold radial gradient on dark
- **Equip-state dot** — top-right corner, 5×5px circle:
  - Gold (`#C8AA50`) = Equipped
  - Green (`#4EC87A`) = Carried
  - Grey (`#7878a0`) = Stowed
- **Condition strip** — 3px bar along the bottom edge of the image area:
  - Green = Undamaged or Minor
  - Amber (`#FF9800`) = Moderate
  - Red (`#E05252`) = Major
  - Dark grey (`#555`) = Destroyed
- **Destroyed overlay** — when condition is `destroyed`, a semi-transparent `✕` overlays the entire image area and the tile is desaturated

**Name label (below image):**
- `font-size: 8px`, truncated with ellipsis
- Default colour: `#7a7060`
- Active (selected): `#C8AA50`
- Minor/moderate damage: `#9a7040`
- Major damage: `#9a4040`

**Active state:** Gold border (`border-color: #C8AA50`), subtle gold background tint.

---

## Detail Panel

### Hero Banner (`ItemDetailHero`)

**Default (icon-only):**
- Dark gradient background (`linear-gradient(110deg, ...)`) with a faint gold shimmer on the right
- Top-right corner bracket accent (CSS `::before` pseudo-element)
- Left side: 58×58px framed icon box with radial gold glow, `font-size: 28px`
- Right side (stacked, vertically centred):
  - **Type tag** — e.g. `Ranged · Light` (8px, `#C8AA50` at 50% opacity, Cinzel, letter-spaced)
  - **Item name** — 16px Cinzel, `#e8dfc0`
  - **Hard points** — e.g. `Hard Points  3 / 4 used` (9px, dim gold)

**Full-art mode** (when `item_image_url` is non-null):
- Image fills the full banner area (`object-fit: cover`)
- Gradient overlay from bottom (dark → transparent) keeps the name readable
- Type tag and item name rendered over the overlay at the bottom-left

### Stats Row

Displayed as a row of `sbox` stat boxes immediately below the hero banner (not part of the scroll area):

| Item type | Stats shown |
|---|---|
| Weapon | Damage (orange), Crit (red), Range (cyan), Enc (grey), HP (purple) |
| Armour | Soak (green), Defence (blue), Enc (grey), HP (purple) |
| Gear | Qty (gold), Enc (grey) |

HP = hard points total (not used count — used count is in the hero sub-line).

### Description

Full description text. `font-size: 11px`, `color: #7a7060`, `line-height: 1.65`. Scrolls with the panel body.

### Special Qualities

Section header: `SPECIAL QUALITIES` (Cinzel, 8px, gold, underlined with a faint border).

Each quality is always expanded — no collapse needed in the detail view. Each row:
- **Name** (11px, bold, `#e8dfc0`) + optional **rank** number (10px Cinzel, gold) inline
- **Description** (10px, `#4a4030`, line-height 1.5) below

If an item has no qualities, this section is omitted entirely.

### Condition Track (`ItemConditionTrack`)

Five equal-width segments, labelled below:

```
[ Undamaged ] [ Minor ] [ Moderate ] [ Major ] [ Destroyed ]
```

Segment fill rules (segments fill cumulatively left to right up to the active state):
- Undamaged: segment 1 green
- Minor: segments 1–2 green
- Moderate: segments 1–2 green, 3 amber
- Major: segments 1–2 green, 3 amber, 4 red
- Destroyed: all five filled, grey

Label below the track highlights the active state name in the matching colour.

**Mechanical penalty note** (below labels, italic, 9px):
- Undamaged: `No penalty to use.`
- Minor: `Minor damage — adds 1 Setback die to all checks.`
- Moderate: `Moderate damage — adds 1 Setback die to all checks.`
- Major: `Major damage — item is unusable until repaired.` (red)
- Destroyed: `Destroyed — this item is gone.` (grey)

The entire section is **read-only** for players. No interaction affordance.

### Equip State

Three full-width buttons: **Stow / Carry / Equipped**. Active button has a gold border and gold text with a subtle gold background tint.

- Clicking **Stow** triggers the existing `StowLocationModal` (unchanged)
- Clicking **Carry** or **Equipped** updates state immediately via the existing mutation hook
- When condition is `major` or `destroyed`, the **Equipped** button is visually disabled (reduced opacity, `cursor: not-allowed`) and non-interactive
- When stowed, a `StowPill` renders below the buttons showing the location name (existing component, unchanged)

---

## Data Model Changes

### New migration

A single migration adds two nullable columns to all item tables (weapons, armour, gear — exact table names to be confirmed against schema during implementation):

```sql
ALTER TABLE <item_table> ADD COLUMN condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));

ALTER TABLE <item_table> ADD COLUMN item_image_url TEXT;
```

### TypeScript

New shared type:

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
condition: ItemCondition;
item_image_url: string | null;
```

`useCharacterData` passes these fields through from the Supabase query — no logic changes required, just query and type updates.

---

## Design Token Usage

All values must come from `@/lib/tokens`. No hardcoded colours, sizes, or spacing in component files.

Key tokens in use:
- `COLOR.gold` / `HUD.gold` — equipped dot, active borders, section headers
- `COLOR.green` (`#4EC87A`) — carried dot, undamaged/minor condition
- `COLOR.orange` (`#FF9800`) — moderate condition, damage stat
- `COLOR.red` (`#E05252`) — major condition, crit stat
- `COLOR.cyan` (`#40C4D4`) — range stat
- `Z`, `RADIUS`, `SP`, `FS` — all layout and spacing values
- `FONT_BODY` (Palanquin) — all UI text
- `FONT_DISPLAY` (Signika) — item names, stat numerals, section headers

---

## What Is Not In This Spec

- **GM condition controls** — how the GM sets item condition from their HUD. Separate spec.
- **GM image upload** — the UI for uploading `item_image_url`. Separate spec.
- **Oggdude icon mapping** — resolving which icon file corresponds to each item. Implementation detail; the `ItemThumb` and `ItemDetailHero` components receive an `iconUrl` prop and render whatever they're given.
- **Item editing / deletion** — the trash-button / discard flow is preserved as-is from `InventoryPanel`.
