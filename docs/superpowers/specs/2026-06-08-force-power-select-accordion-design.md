# Force Power Select — Accordion Expansion

**Date:** 2026-06-08
**Status:** Approved

## Problem

In `SelectPowerStep`, power descriptions are truncated to two lines via `-webkit-line-clamp: 2`, making them meaningless. Purchased upgrades are not visible at all during power selection, so the player has no way to review what they've unlocked before committing to a power.

## Solution

Convert the power list into an accordion. Each card shows only the power name by default. Clicking a card selects it and expands it to reveal the full description and a list of purchased upgrades. Only one card is expanded at a time.

## State

Add `expandedKey: string | null` as local state inside `SelectPowerStep`, initialized to `null`. This is separate from `selectedPowerKey` (which lives in the parent `ForceCheckOverlay` and is unchanged). Selection and expansion can diverge — a card can be selected but collapsed.

## Click Behavior

| User action | Result |
|---|---|
| Click an unselected card | Call `onSelect(key)`, set `expandedKey = key`, collapse any previously expanded card |
| Click the selected + expanded card | Set `expandedKey = null` (collapse only — selection/border stays) |
| Click the selected + collapsed card | Set `expandedKey = key` (re-expand, no selection change) |

## Card Structure

### Always visible — header row
- `✦` force icon (color: `var(--hud-accent)`, opacity 0.8)
- Power name (`FONT_DISPLAY`, `FS.sm`, weight 700, `HUD.text`)
- Chevron `▾` (rotates 180° when expanded, transition uses `EASE.default`)

### Expanded — body
Rendered below the header, separated by a faint divider (`color-mix(in srgb, var(--hud-accent) 12%, transparent)`).

1. **Description block** — full text, no line-clamp. `FONT_BODY`, `FS.label`, `HUD.textDim`, line-height 1.5. Strip BBCode via existing `stripBBCode` utility.

2. **Upgrades eyebrow** — "Purchased Upgrades" label. `FS.overline`, uppercase, letter-spacing 0.18em, `var(--hud-accent)`, opacity 0.7.

3. **Upgrade rows** — one row per ability where `purchasedRanks > 0`. Each row:
   - Small dot indicator (5×5 px, `border-radius: RADIUS.full`, `var(--hud-accent)`, opacity 0.7)
   - Upgrade name (`FS.label`, `HUD.text`, flex: 1, truncated)
   - Rank count (`FS.overline`, `var(--hud-accent)`, opacity 0.6) — always shown as `×N`
   - Wrapped in the existing `Tooltip` component with `placement="top"` and `maxWidth={300}`

4. **Tooltip content** — same pattern as `RollForceDiceStep`:
   ```tsx
   <>
     <TipLabel>{upgrade.name}</TipLabel>
     <TipBody>
       {upgrade.description
         ? <RichText text={upgrade.description.replace(/\[FO\]/g, '').trim()} />
         : <em>No description available.</em>}
     </TipBody>
   </>
   ```

5. **Empty state** — if no abilities have `purchasedRanks > 0`: faint italic "No upgrades purchased yet." (`FS.label`, `HUD.textFaint`, `font-style: italic`).

## Visual States

| State | Border | Background |
|---|---|---|
| Default (unselected, collapsed) | 1px `color-mix(in srgb, var(--hud-accent) 15%, transparent)` | `color-mix(in srgb, var(--hud-accent) 4%, transparent)` |
| Hovered (unselected) | 1px `color-mix(in srgb, var(--hud-accent) 35%, transparent)` | `color-mix(in srgb, var(--hud-accent) 7%, transparent)` |
| Selected (collapsed or expanded) | 2px `var(--hud-accent)` | `color-mix(in srgb, var(--hud-accent) 10%, transparent)` |

Chevron transition: `transform 0.2s EASE.default`.
Card border/background transition: `all EASE.default`.

## Token Compliance Fixes

The current `SelectPowerStep` has violations that must be fixed in the same change:

| Violation | Fix |
|---|---|
| `const FORCE_BLUE = '#7EC8E3'` | Replace with `var(--hud-accent)` / `color-mix()` |
| `const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'` | `color-mix(in srgb, var(--hud-accent) 15%, transparent)` |
| `const FORCE_BLUE_SEL = 'rgba(126,200,227,0.1)'` | `color-mix(in srgb, var(--hud-accent) 10%, transparent)` |
| `const TEXT = 'var(--hud-text)'` | Use `HUD.text` directly |
| `const TEXT_DIM = 'var(--hud-text-dim)'` | Use `HUD.textDim` directly |
| `fontFamily: "var(--font-body)"` | `fontFamily: FONT_BODY` |
| `fontSize: 11` | `fontSize: FS.overline` |
| `transition: 'all .15s'` | `transition: \`all ${EASE.default}\`` |
| `borderRadius: 10` | `borderRadius: RADIUS.lg` |
| `padding: '12px 14px'` | `padding: \`${SP[3]} ${SP[4]}\`` (12px vertical, 16px horizontal) |

## Files Changed

- `src/components/force-check/steps/SelectPowerStep.tsx` — primary change

No parent component changes required. No new files.

## Out of Scope

- Animation of expand/collapse height (CSS height transition) — not requested
- Changing the upgrade interaction (spending pips) — that stays in `RollForceDiceStep`
- Any changes to `ForceCheckOverlay` state shape
