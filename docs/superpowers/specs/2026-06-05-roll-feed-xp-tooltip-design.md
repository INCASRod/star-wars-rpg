# Roll Feed XP Purchase Tooltip — Design Spec
_2026-06-05_

## Problem

The XP Purchase row in the GM Roll Feed is a single compact line. The talent/skill label uses `flex-1 overflow-hidden text-ellipsis whitespace-nowrap`, so long names are clipped. The GM cannot see the full purchase without navigating away from the feed.

## Solution

Wrap the XP Purchase row with the existing `Tooltip` component so hovering anywhere on the row reveals the full notification details in a portal-rendered popup.

## Scope

- **File changed:** `src/components/player-hud/RollFeedPanel.tsx` only
- **No new files, no schema changes, no architecture changes**
- Applies to XP Purchase rows only — Item Award and generic system rows are out of scope

## Tooltip behaviour

| Property | Value |
|---|---|
| Trigger | Hover anywhere on the XP Purchase row div |
| Placement | `top` (auto-flips to `bottom` if near viewport top) |
| Delay | 300 ms (default — keeps feed scannable) |
| maxWidth | 320 px |
| Renderer | Existing `Tooltip` + `TipBody` from `@/components/ui/Tooltip` |

## Tooltip content

Three variants based on row state:

**Standard:**
```
[Full roll_label]              ← TipBody, full untruncated name
[CharacterName] · [N] XP      ← smaller, HUD.textFaint
```

**Refunded:**
```
[Full roll_label]
[CharacterName] · [N] XP
[REFUNDED]                    ← italic, HUD.textFaint
```

**No cost metadata (edge case):**
```
[Full roll_label]
[CharacterName]
```

## Implementation

1. Add `Tooltip`, `TipBody` to the existing import from `@/components/ui/Tooltip` at the top of `RollFeedPanel.tsx`.
2. In the `XP Purchase` branch of `SystemRow`, wrap the outer `<div className="flex items-center">` with `<Tooltip content={tooltipContent} placement="top" maxWidth={320}>`.
3. Build `tooltipContent` as a React fragment using `TipBody`:
   - Primary line: `label` (the null-coalesced `roll.roll_label ?? 'System Message'` already declared at the top of `SystemRow`) — full, untruncated
   - Secondary line: `{roll.character_name}{meta?.xp_cost != null ? ` · ${meta.xp_cost} XP` : ''}`
   - If `meta?.refunded`: third line `[REFUNDED]` italic faint
4. No changes to the row's own layout — the existing truncation stays (it's intentional for the compact view).

## Token compliance

- No new colour literals — tooltip styling comes entirely from the existing `Tooltip` component
- No new z-index, spacing, or font values introduced in `RollFeedPanel`
- The `Tooltip` component itself is already compliant

## Out of scope

- Item Award rows
- Generic system message rows (already have an expand toggle)
- Collapsed roll rows (separate component, separate feature)
