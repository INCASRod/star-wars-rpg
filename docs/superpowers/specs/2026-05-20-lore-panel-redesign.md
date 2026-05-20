# Lore Panel Redesign

**Date:** 2026-05-20  
**Status:** Approved  
**Scope:** `CharacterAvatar`, `HudLoreTab`, `LoreContent` — player-facing Lore panel only

---

## Problem

The `CharacterAvatar` component renders `width: 100%` with `aspectRatio: 3/4`, making it a very tall card that dominates the Lore panel and wastes space. The sidebar needs room for upcoming additions (Conflict, improved Motivation display).

---

## Chosen Approach: Horizontal Portrait Strip (Option C)

Convert `CharacterAvatar` from a tall full-width card into a compact horizontal strip at the top of the panel. The two-column layout below (backstory left, sidebar right) is unchanged. The sidebar gains a Conflict card and gets a logical reorder.

---

## Design

### 1. CharacterAvatar — horizontal strip

**Current:** `width: 100%`, `aspectRatio: 3/4` — fills the full panel width, very tall.

**New:** Horizontal flex row.

| Element | Spec |
|---|---|
| Portrait frame | Fixed `72px × 96px` (3∶4), `border: 1.5px solid rgba(gold, 0.35)`, `borderRadius: 5px`, `overflow: hidden` |
| Upload/delete | Same hover overlay as today, just smaller area |
| Right side | Name (gold, 16px, Signika), subtitle (career · species · gender, 9px overline, dim), summary chips row |
| Summary chips | Optional: Obligation value (red chip, if configured), Conflict total (red chip, Force-sensitive only), Motivation type (blue chip, if set) |
| Edit button | Top-right, same `✎ Edit Background` button as today |

The `CharacterAvatar` component currently has no layout variant prop — it always renders tall. Add a `variant?: 'horizontal'` prop (default keeps existing tall behaviour for any other usage), or simply change the layout unconditionally if the component is only used in `HudLoreTab`.

**Decision:** Change the layout unconditionally — `CharacterAvatar` is only used in `HudLoreTab`. Remove the tall layout entirely.

### 2. HudLoreTab — pass summary chip data

`HudLoreTab` already has `character`, `careerName`, `speciesName`. It needs to pass the following new props to `CharacterAvatar`:

- `obligationValue?: number` — shown in red chip if present
- `obligationConfigured?: boolean` — guards display
- `conflictTotal?: number` — sum of all active conflict entries (Force-sensitive only); if `undefined` or character is not Force-sensitive, chip is hidden
- `motivationType?: string` — shown in blue chip if present

These values are already available on `character` in `HudLoreTab`; no new data fetching needed.

### 3. LoreContent sidebar — reorder and add Conflict card

**Current order:** Intelligence File → Species → Duty → Obligation → Motivation  
**New order:** Intelligence File → Species → Conflict (conditional) → Motivation → Duty → Obligation

Rationale: narrative flow — identity → biology → active moral weight → drives → game obligations.

#### Conflict card (new)

- Conditionally rendered: only when `conflictEntries` prop is a non-empty array AND character is Force-sensitive.
- Read-only. GM manages entries from the Force tab (future work).
- Structure:

```
┌─ CONFLICT ─────────────────────────────────────────┐
│  4                              total active        │
│  ● Used dark side to coerce informant          2   │
│  ● Struck down unarmed enemy                   2   │
└────────────────────────────────────────────────────┘
```

- Total shown as a large red number top-left.
- Each entry: red pip (filled circle, glowing), label text, value right-aligned.
- Border tinted `rgba(224,80,80,0.2)` to visually flag moral weight.
- When no entries: card hidden entirely (not an empty state).

#### New props on LoreContent

```ts
conflictEntries?: { label: string; value: number }[]
isForceUser?: boolean
```

`conflictTotal` for the header chip is `conflictEntries.reduce((s,e) => s + e.value, 0)`.

`isForceUser` is derived in `HudLoreTab` as `character.force_rating > 0 || !!character.is_force_sensitive`.

### 4. What does NOT change

- Left column: Backstory panel + Field Notes textarea — completely unchanged.
- Intelligence File card — unchanged.
- Species card — unchanged.
- Duty card — unchanged.
- Obligation card — unchanged.
- Motivation card — unchanged.
- All token usage, CSS classes, font families — follow existing patterns in each file.

---

## Files to touch

| File | Change |
|---|---|
| `src/components/player-hud/CharacterAvatar.tsx` | Replace tall layout with horizontal strip; add summary chip props |
| `src/components/player-hud/HudLoreTab.tsx` | Pass new chip props to `CharacterAvatar`; pass `conflictEntries` + `isForceUser` to `LoreContent` |
| `src/components/character/LoreContent.tsx` | Add `conflictEntries` + `isForceUser` props; add Conflict card; reorder sidebar |

No migration, no new routes, no new DB tables — data model for Conflict entries is deferred to the GM Force tab feature.

---

## Token / style rules

- Portrait border uses `rgba(200,170,80,0.3)` (matches existing gold border in old component).
- Summary chips use `RADIUS.sm` border-radius, `FS.overline` font size, colors from `COLOR` tokens.
- Conflict pip: `width: 7px; height: 7px; borderRadius: RADIUS.full; background: COLOR.red`.
- Conflict total numeral: `FS.h4` size, `COLOR.red`.
- All new inline style values must use tokens from `@/lib/tokens`.

---

## Out of scope

- Editing Conflict entries from the player sheet.
- GM-side Conflict addition UI (future: GM Force tab).
- Notes section redesign beyond what already exists (Field Notes textarea is sufficient for now).
- Motivation editing UI (display-only redesign is sufficient for this pass).
