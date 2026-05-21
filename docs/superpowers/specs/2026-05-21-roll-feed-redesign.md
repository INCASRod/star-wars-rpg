# Roll Feed Redesign — Design Spec

**Date:** 2026-05-21
**Status:** Approved
**Scope:** Rewrite `RollFeedPanel` — new card layout (Design B), Approach A feed structure, collapse/expand interaction

---

## Overview

The live roll feed is cluttered: every roll renders at equal visual weight with decorative chrome (corner brackets) that adds noise, and there is no distinction between recent and historical rolls. This redesign makes the feed scannable at a glance — the 2 most recent meaningful rolls are shown in full; everything older collapses to a compact history list.

---

## Scope

**One file rewritten:** `src/components/player-hud/RollFeedPanel.tsx`

No parent components change. `HudRightColumn`, `GmShell`, and `MobileSessionCompanion` all pass the same props they do today (`rolls`, `ownCharacterId`, `isGm`). `useRollFeed` is untouched.

`RollFeedMini` (exported but not imported anywhere) is removed.

---

## Token Compliance

The rewrite imports directly from `@/lib/tokens`:

```ts
import { FONT_BODY, RADIUS, COLOR, FS, SP, Z } from '@/lib/tokens'
```

No inline colour literals. No `panelBase` spread (that is for HUD panels with `backdrop-filter`, not feed cards). No legacy shim imports.

---

## Alignment Colour System

Unchanged from current implementation:

| Context | Colour |
|---|---|
| Own roll | `COLOR.gold` (`#C8AA50`) |
| GM roll | `#9060D0` (purple) |
| Enemy | `#8B3025` |
| Allied | `#2D6B3A` |
| Other player / neutral | `#6A5840` |
| Force card | `#1A78A0` (force blue) |

`alignColor(roll, isOwn)` and `nameColor(roll, isOwn)` helper functions are preserved verbatim.

---

## Card Design — Design B (Tinted Header Band)

Every full card (skill, combat, force) has two zones.

### Header Band

A tinted strip anchoring character identity. Tint colour is the alignment colour at ~7% opacity; bottom border at ~15% opacity.

```
┌─────────────────────────────────────────────┐
│ ● Kira Voss      Perception          just now│  ← band
├─────────────────────────────────────────────┤
│ SUCCESS   ✦✦ ▲                               │  ← body
│ ■■■ ■■ ■ ■■                                  │  ← dice pips
└─────────────────────────────────────────────┘
```

Band contents (left to right):
- 5 px alignment dot (solid, with glow matching alignment colour)
- Character name — 9 px, uppercase, weight 700, alignment colour
- Roll type label — 9 px, italic, dimmed (`--hud-text-faint`) — centred/flex-1 between name and time
- Relative time — 8 px, faint (`--hud-text-faint`), right-aligned

### Card Body

- Background: `#0D0E12` (same as `C.panelBg`)
- Own-roll body: `var(--hud-surface-mid)` (slightly lifted)
- Padding: `7px 9px 6px`

Body layout (top to bottom):
1. Outcome word — large (14 px), weight 900, coloured by result:
   - SUCCESS → `COLOR.gold`
   - FAILURE → `#C04040`
   - WASH → `--hud-text-faint`
2. Result symbols — 11 px, same row as outcome word (flex, gap 8)
3. Type-specific extras (see below)
4. Dice pips row — 10 px squares, faint opacity, bottom

### Hidden Roll Rendering

- **Players:** band still shows (character name + type replaced with `[Hidden Roll]`); body shows `[Hidden]` italic label only — no outcome, no dice
- **GM view:** band renders normally; body prepends `[HIDDEN FROM PLAYERS]` in purple italic before the outcome

---

## Card Types

### Skill Card

Band label: roll label (e.g. "Perception", "Deception")

Body extras: none beyond outcome + symbols + dice pips.

### Combat Card

Band label: `⚔ WeaponName → TargetName · RangeBand`

If no target: `⚔ WeaponName`

Body extras (between symbols and dice pips):
- Damage line if `weaponDamage != null` and `netSuccess > 0`:
  - Ranged: `Dmg: {base}+{netSuc} = {total}`
  - Melee (with Brawn): `Dmg: {base}+{brawn}+{netSuc} = {total}`
  - Melee (with damageAdd): `Dmg: {base}+{brawn}+{damageAdd}+{netSuc} = {total}`
  - Text: 10 px, `COLOR.gold`
- CRITICAL ELIGIBLE badge if `meta.critEligible === true`:
  - Inline-flex badge, `background: var(--hud-accent-10)`, `border: 1px solid var(--hud-accent-35)`
  - Label: `⚠ CRITICAL ELIGIBLE` + optional `+{critModifier}` suffix

### Force Card

Band uses force-blue tint (`#1A78A0` at ~7% opacity).

Band label: `✦ PowerName · Force Power`

Body extras:
- Outcome word is `ACTIVATED` in force blue (`#1A78A0`) instead of SUCCESS/FAILURE
- Force pip row: light pips (blue dots, glow) then dark pips (purple dots), gap 4
- FP summary line: `{n} Light FP · {n} Dark FP ({n} used)` — light in force blue, dark in purple, used count in red
- Force dice pips row (white/grey force die icons, size 10)

### Initiative Entry

Always renders as a compact single-line notification. Non-expandable. Never occupies an expanded slot.

```
⚙ Initiative Rolled · Kira Voss                        1m ago
```

Or for a group:

```
⚙ Initiative Rolled · 3 participants                   1m ago
```

Styling: 9 px italic, `--hud-text-faint`. No background, no border. Left padding 4 px.

### System Entry

Compact single-line notification. Non-expandable unless message is long.

```
🎁 Medpac × 2  awarded to  Kira Voss                   2m ago
```

- Short messages (fits in one line): rendered as-is, no expand control
- Long messages: a `›` chevron appears at the right end; clicking toggles a second line with the full text

"Long" threshold: if `roll.roll_label` exceeds 60 characters.

Styling: 9 px, no background, no border. Item name in `COLOR.gold`, recipients in `--hud-text-dim`. Left padding 4 px.

---

## Feed Layout — Approach A

### Rendering Logic

The feed renders entries newest-first. State: `expandedIds: Set<string>` (starts empty).

Walk grouped entries in order (newest first), tracking `expandedSlots` (max 2):

```
for each entry in grouped (newest-first):
  if entry is initiative-group:
    → render InitiativeRow (compact, no slot consumed)
  else if entry is system:
    → render SystemRow (compact, no slot consumed)
  else if expandedSlots < 2:
    → render full FullCard; expandedSlots++
  else:
    → render CollapsedRow
```

The "Earlier this session" section label (`EARLIER THIS SESSION` — 8 px, uppercase, `--hud-text-faint`) appears immediately before the first `CollapsedRow`. If there are no collapsed rows, the label is omitted.

### Collapsed Row

```
● Kira Voss      Perception    SUC   6m
```

Layout (flex, gap 5, padding `3px 7px`):
- 4 px alignment dot
- Character name — 9 px, `#5A4A38`
- Roll type label — 8 px, `#3A3228`
- Outcome abbreviation — 8 px, weight 700, right-aligned; `SUC` gold, `FAIL` red, `—` faint
- Time — 8 px, `#2A2228`
- Background: `#0A0B0F`, border `1px solid #141318`, `RADIUS.sm`

Clicking a collapsed row adds its ID to `expandedIds` → renders as a full FullCard in place, pushing rows below it down. Clicking the card's header band while expanded removes the ID → collapses back.

The top-2 always-expanded cards are **not** togglable — they have no collapse affordance. Only cards that originated as collapsed rows (i.e. their ID is in `expandedIds`, or they are being rendered in the history section) can be collapsed.

### Zero State

```
No rolls yet this session.
```

Centred, 11 px, `--hud-text-faint`.

---

## Removed

- `CornerBrackets` component
- `RollFeedMini` export
- `FONT_CINZEL` / `FONT_MONO` / `FONT_RAJDHANI` local constants (replaced by `FONT_BODY` from tokens)
- All local `FS_*` fluid font size constants (replaced by `FS.*` from tokens)
- `panelBase` spread

---

## File Change Summary

| File | Change |
|---|---|
| `src/components/player-hud/RollFeedPanel.tsx` | Complete rewrite — Design B cards, Approach A feed layout |
| `docs/architecture.md` | Update `RollFeedPanel` entry to reflect new layout behaviour |
