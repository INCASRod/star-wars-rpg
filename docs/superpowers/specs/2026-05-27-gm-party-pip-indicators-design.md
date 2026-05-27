# GM Party Pip Indicators — Design Spec

**Date:** 2026-05-27
**Status:** Approved
**Scope:** At-a-glance critical injury and conflict indicators in GM party mini cards; heal confirm flow; conflict pip tooltip fix on player HUD

---

## Overview

The GM Party panel mini cards currently show only wounds, strain, and soak. This spec adds a pip row to each card showing critical injuries (red blood-drop icons) and active conflicts (purple circles), each with hover tooltips. Clicking a crit injury pip opens an inline heal confirm. The player-facing conflict pip tooltip (currently a browser `title` attribute) is upgraded to the project's custom `<Tooltip>` component.

---

## Visual Design

### Pip row placement

Sits between the strain progress bar and the soak footer in `GmPartyMiniCard`. Hidden entirely when the character has zero active injuries and zero unresolved conflicts.

### Layout

```
[🩸][🩸][🩸] +N          +N [●][●][●]
  injuries (left)    conflicts (right)
```

- **Injury pips** — left-aligned, blood-drop SVG (reused from `CriticalInjuryPip`), severity-shaded (minor → orange `#E08040`, moderate → red `#E05050`, serious → crimson `#C04040`, grievous → dark red `#9A2020`).
- **Conflict pips** — right-aligned, 10×10 px filled purple circles (`rgba(144,96,208,0.8)` fill, `rgba(144,96,208,0.4)` border).
- **Cap** — 3 pips per group. A `+N` badge (matching group color, `font-size: var(--text-caption)`, bold) appears when count > 3. Hovering `+N` shows a `<Tooltip>` listing the overflow items by name/description.
- **Spacing** — 5 px gap between pips within a group; `flex: 1` spacer between injury group and conflict group.

---

## Components

### New: `GmConflictPip` (`src/components/gm/GmConflictPip.tsx`)

~60 lines. Renders a single conflict pip circle wrapped in `<Tooltip>`.

**Props:**
```ts
interface GmConflictPipProps {
  conflict: ConflictEntry  // { id, description?, session_label?, is_resolved, created_at }
}
```

**Tooltip content:**
- Description (or "Conflict" fallback if none)
- Session label if present (requires `session_label` in `GmConflictRow` — see Data Layer)

No "Resolved/Unresolved" badge: `useGmCampaignConflicts` already filters to `is_resolved = false`, so all rendered pips are unresolved by definition.

No action on click — read-only.

---

### Modified: `CriticalInjuryPip` (`src/components/character/CriticalInjuryPip.tsx`)

Adds `confirmingHeal` boolean to local state. When `onHeal` is provided and the user clicks "✓ Heal Injury":
- `confirmingHeal` flips to `true`
- Tooltip content replaces with: "Heal **[name]**?" + Confirm button + Cancel button
- Cancel: `confirmingHeal → false` (restores original view)
- Confirm: calls `onHeal(pip.id)`, closes tooltip

No change to the component's public interface — `onHeal` remains optional.

---

### Modified: `GmPartyMiniCard` (`src/app/gm/panels/GmPartyMiniCard.tsx`)

**New props:**
```ts
crits:     CharacterCriticalInjury[]   // active (is_healed = false) injuries for this character
conflicts: ConflictEntry[]             // unresolved conflicts for this character
onHealCrit: (id: string) => void
```

**Pip row logic:**
```ts
const visibleCrits     = crits.slice(0, 3)
const overflowCrits    = crits.slice(3)
const visibleConflicts = conflicts.slice(0, 3)
const overflowConflicts = conflicts.slice(3)
const showRow = crits.length > 0 || conflicts.length > 0
```

Each `CriticalInjuryPip` receives `onHeal={onHealCrit}`.

Each overflow `+N` badge is wrapped in `<Tooltip>` listing remaining names (crits) or descriptions (conflicts), one per line.

---

### Modified: `GmPartyPanel` (`src/app/gm/panels/GmPartyPanel.tsx`)

Receives `charCrits`, `charConflicts`, and `onHealCrit` from `GmShell`. Passes `crits={charCrits[c.id] ?? []}`, `conflicts={charConflicts[c.id] ?? []}`, and `onHealCrit` to each `GmPartyMiniCard`.

---

## Data Layer

### `useGmData.ts` — extend crit injury loading

Current: queries `character_critical_injuries` and aggregates into a count map.

Change: return full rows alongside the count map.

```ts
// New addition to return value:
charCrits: Record<string, CharacterCriticalInjury[]>
// Existing (unchanged):
charActiveCritCounts: Record<string, number>
```

Query: `SELECT * FROM character_critical_injuries WHERE campaign_id = $1 AND is_healed = false ORDER BY received_at ASC`. Group by `character_id` into the map.

**`GmConflictRow` extension:** `useGmCampaignConflicts` must add `session_label` to its SELECT so the tooltip can display it. Update the type:
```ts
interface GmConflictRow {
  id:            string
  character_id:  string
  description:   string
  narrative?:    string
  session_label?: string   // add this
  created_at:    string
}
```

Realtime: subscribes to the same `character_critical_injuries` channel already used for the count — extend the handler to update both `charActiveCritCounts` and `charCrits` on INSERT/UPDATE/DELETE.

---

### `GmShell.tsx` — lift conflict data

Move `useGmCampaignConflicts(campaignId, forceSensitiveCharIds)` from `GmToolsPanel` to `GmShell`. Reshape result from `ConflictEntry[]` to `Record<string, ConflictEntry[]>`:

```ts
const charConflicts = useMemo(
  () => conflicts.reduce<Record<string, ConflictEntry[]>>((acc, c) => {
    ;(acc[c.character_id] ??= []).push(c)
    return acc
  }, {}),
  [conflicts]
)
```

`GmToolsPanel` continues to use the flat `conflicts` array for its existing Active Conflicts list — pass both down or keep the flat form in `GmToolsPanel` and the map form for `GmPartyPanel`.

---

### `useGmCharacterActions.ts` — add `healCritInjury`

```ts
healCritInjury: (injuryId: string) => Promise<void>
```

- `UPDATE character_critical_injuries SET is_healed = true WHERE id = $injuryId`
- Looks up `charId` internally by scanning `charCrits` for the entry matching `injuryId` (avoids adding a second parameter to the public interface)
- Optimistically removes entry from `charCrits` state and decrements `charActiveCritCounts[charId]`
- Calls `notify(charId, 'toast', 'Critical injury healed')` to push a toast to the player

---

## Player HUD Fix: `ForcePanel.tsx`

Replace the browser `title` attribute on conflict pips with `<Tooltip>` from `src/components/ui/Tooltip.tsx`.

**Current:**
```tsx
<div ... title={tooltip} />
```

**New:**
```tsx
<Tooltip content={<><strong>{description}</strong>{sessionLabel && <> · {sessionLabel}</>}</>} placement="top">
  <div ... />
</Tooltip>
```

Content: description (bold), session label if present. No resolved/unresolved badge needed here (player view shows their own conflicts).

---

## Out of Scope

- Resolving conflicts from the party panel (separate end-of-session flow)
- Adding new critical injuries from the pip row (use the existing GmCharacterCard flow)
- Sorting or filtering pips within the row
- Grievous injury pulse animation in the mini card (kept in full player HUD only)
