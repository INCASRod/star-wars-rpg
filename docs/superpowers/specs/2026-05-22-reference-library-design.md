# GM Reference Library — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

---

## Overview

A searchable read-only reference panel accessible from the GM view left rail. Lets the GM look up any talent or force ability mid-session — name, activation type, ranked status, and description — without leaving the current view.

---

## Entry Point

A **Library** button is added to `GmLeftRail` in the utility section below the divider (alongside Dice and Screen).

- Icon: `⊟`, label: `Library`, accent: `#5AAAE0` (blue)
- Calls `onPanelToggle('library')` — same toggle mechanism used by the four main nav buttons
- `'library'` is added to the `GmPanelId` union type in `GmLeftRail.tsx`
- The button shows as active when `activePanel === 'library'`
- Opening Library closes any other active panel (Map/Tools/Party/Enemies); this is correct — they all share the same left-side panel slot

---

## Panel Integration (GmShell)

The library panel slots into the existing left-side sliding overlay in `GmShell`:

```tsx
{activePanel === 'library' && <GmReferenceLibraryPanel />}
```

**Panel width:** 420px. The existing width condition becomes:

```ts
width: activePanel === 'tools' ? 560 : activePanel === 'library' ? 420 : 360
```

No new state is added to `GmShell`. No props are passed to the panel — it owns all its data fetching internally.

---

## Component

**File:** `src/components/gm/GmReferenceLibraryPanel.tsx`

### Data loading

- Creates its own Supabase client internally via `useMemo(() => createClient(), [])`
- Data is fetched on **first keystroke**, not on mount — zero network cost until the GM types
- Once fetched, data is cached in component state for the panel's lifetime
- Three datasets: `ref_talents` (all rows), `ref_force_powers` (all rows), `ref_force_abilities` (all rows)
- Fetches for Talents tab and Force Powers tab are triggered independently on first search in each tab

### Layout

```
┌─────────────────────────────┐
│ REFERENCE LIBRARY        ✕  │  ← header (gold title, close noop — rail button closes)
├─────────────────────────────┤
│ Talents  │  Force Powers    │  ← tabs (blue / purple accent)
├─────────────────────────────┤
│ 🔍 Search…            [✕]  │  ← search input; ✕ clear appears when text present
├─────────────────────────────┤
│                             │
│  [empty state / results]    │  ← scrollable body
│                             │
└─────────────────────────────┘
```

### Empty state (on open, and when search is cleared)

Both tabs open with an empty body:

```
  ⊟
  Search to look up a talent
  Type any part of the name.
  Results appear instantly.
```

(Force Powers tab uses "a force power or ability" instead.)

### Search behaviour

- Case-insensitive substring match on `name`
- Filters client-side after data is loaded
- Results update on every keystroke (no debounce needed — client-side)
- Result count shown above results: `"4 results"` for talents; `"1 power · 3 abilities"` for force powers

---

## Talents Tab

**Data source:** `ref_talents` — all rows (including `is_custom = true` entries)

**Sort:** alphabetical by name

**Card layout:**

```
┌──────────────────────────────────────────────┐
│ Talent Name          [Activation]  [Ranked]  │
│ First two lines of description, truncated    │
│ to fit…                                      │
└──────────────────────────────────────────────┘
```

- **Name:** `rgba(232,223,200,0.87)`, 11px, weight 600
- **Activation badge:** colour-coded pill — Passive (grey), Action (gold), Maneuver (blue), Incidental (green), Incidental (OOT) (green)
- **Ranked indicator:** small dim-gold label, only shown when `is_ranked = true`
- **Description:** 2-line clamp, `rgba(106,128,112,0.85)`, 9px — no click required to read

---

## Force Powers Tab

**Data sources:** `ref_force_powers` + `ref_force_abilities` (loaded together on first search in this tab)

**Search matches:** power names AND ability names independently

### Result rendering

**Case 1 — Power name matches search term:**  
Render a Power card with all of that power's abilities nested beneath it as rows, regardless of whether the abilities' names also match.

```
┌──────────────────────────────────────┐
│ Power Name              FR 1+        │  ← purple-tinted header
│ Base power description, 2 lines…    │
├──────────────────────────────────────┤
│   Control — Power Name               │  ← ability rows, indented
│   Ability description, 2 lines…     │
├──────────────────────────────────────┤
│   Strength — Power Name              │
│   Ability description, 2 lines…     │
└──────────────────────────────────────┘
```

**Case 2 — Ability name matches but parent power name does not:**  
Render a standalone ability card labelled with the parent power name.

```
┌──────────────────────────────────────┐
│ Control — Bind         [Move] ref    │
│ Ability description, 2 lines…       │
└──────────────────────────────────────┘
```

**Result count format:** `"N power(s) · M abilities"`

### Power card styling

- Background: `rgba(144,96,208,0.06)`, border: `rgba(144,96,208,0.2)`, radius: 4px
- Header row: `rgba(144,96,208,0.08)` tint; power name purple-white `rgba(200,180,240,0.9)`, FR label `rgba(144,96,208,0.6)`
- Description: same 9px dim-green as talent cards
- Ability rows: `rgba(4,8,6,0.5)` background, separated by `rgba(144,96,208,0.1)` border

---

## Files Changed

| File | Change |
|---|---|
| `src/app/gm/GmLeftRail.tsx` | Add `'library'` to `GmPanelId`; add Library rail button |
| `src/app/gm/GmShell.tsx` | Add `GmReferenceLibraryPanel` to conditional render block; update panel width condition |
| `src/components/gm/GmReferenceLibraryPanel.tsx` | **New** — full panel component |
| `docs/architecture.md` | Update GM HUD sub-components section |

---

## Out of Scope

- Editing or assigning talents from this panel (that lives in GmToolsPanel → Talents tab)
- Filtering by specialization, career, or book source
- Showing force power trees visually (grid layout) — descriptions only
- Any player-facing version of this panel
