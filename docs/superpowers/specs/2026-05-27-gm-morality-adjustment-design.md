# GM Morality Adjustment — Design Spec

**Date:** 2026-05-27
**Status:** Approved
**Scope:** New "Morality" section in the GM Force tab; no new component file; no DB migration

---

## Overview

The GM currently has no dedicated way to adjust a force-sensitive character's morality from the Force tab. Morality ±1 buttons exist on `GmCharacterCard` in the party panel, but that context is for per-character management, not Force-specific session work. This spec adds a compact "Morality" section directly above the existing "Add Conflict" button in the Force tab, giving the GM a at-a-glance morality overview and quick adjustment controls for all force-sensitive characters in the campaign.

---

## What Is Not Changing

- No new database migration — `morality_value` already exists on `characters`.
- No new hook — `adjustMorality(charId, delta)` in `useGmCharacterActions` is already implemented and wired through `GmShell` → `GmPartyPanel` → `GmCharacterCard`. The Force tab receives `adjustMorality` via the same prop chain.
- No new component file — the section is inline JSX in the `force` tab block of `GmToolsPanel.tsx`.
- The existing ±1 buttons on `GmCharacterCard` are not removed.

---

## UI Design

### Placement

Inside `src/app/gm/panels/GmToolsPanel.tsx`, in the `activeTab === 'force'` block, **above** the "Add Conflict" button.

### Section structure

```
MORALITY                        ← eyebrow label (matches "Force Notifications" style)

Kira Voss   [▓▓▓▓▓▓▓░░░]  72   [−] [+]
Dash Rendar [▓▓▓░░░░░░░]  38   [−] [+]
```

- One row per force-sensitive character (`force_rating > 0`).
- **Gradient bar** — same red→gold→green→blue gradient as `MoralityCard` in `ForcePanel`. Width 64 px, height 5 px. A white 2 px vertical marker is positioned at `(morality_value / 100) * 100%`.
- **Numeric value** — 22 px wide, right-aligned, `font-weight: 700`. Color: `COLOR.blue` (`#5AAAE0`) when `morality_value >= 50`, `COLOR.red` (`#E05050`) when `< 50`.
- **− button** — 20×20 px, red tint (`rgba(224,80,80,0.10)` bg / `rgba(224,80,80,0.4)` border / `#E05050` text). Calls `adjustMorality(char.id, -1)`.
- **+ button** — 20×20 px, blue tint (`rgba(90,170,224,0.10)` bg / `rgba(90,170,224,0.4)` border / `#5AAAE0` text). Calls `adjustMorality(char.id, +1)`.
- **Character name** — `flex: 1`, `font-size: var(--text-sm)`, truncated with `text-overflow: ellipsis`.

### Visibility guard

The entire section (including the eyebrow label) is rendered only when `hasForceSensitive` is true — the same boolean already used to disable the "Add Conflict" button. No separate state needed.

### Spacing

Section gap matches the existing 16 px column gap used throughout the Force tab.

---

## Data Flow

```
GmShell
  └─ charActions (ReturnType<typeof useGmCharacterActions>)
       └─ passed to GmToolsPanel as prop
            └─ adjustMorality destructured from charActions inside GmToolsPanel
```

`GmToolsPanel` receives `charActions` as a prop and currently destructures only OD-related handlers from it. The implementation adds `adjustMorality` to that destructure — no new prop threading needed.

Force-sensitive characters are derived inline: `activeChars.filter(c => (c.force_rating ?? 0) > 0)`. The existing `forceSensitiveCharIds` memo in scope covers the same filter but returns IDs only; the morality rows need full `Character` objects so a separate filtered array is used (or `activeChars` is filtered inline in the JSX).

---

## Tokens

All values must use tokens from `@/lib/tokens`:

| Value | Token |
|---|---|
| Red button color | `COLOR.red` |
| Blue button color | `COLOR.blue` |
| Border radius | `RADIUS.sm` (2 px) |
| Font family | `FONT` (Palanquin) |
| Font size (numeric value) | `var(--text-caption)` |
| Font size (name) | `var(--text-sm)` |

No inline hex colors, no inline `fontFamily` strings.

---

## Behaviour

- Clicking − when `morality_value === 0` is a no-op (clamped in `adjustMorality`).
- Clicking + when `morality_value === 100` is a no-op (clamped in `adjustMorality`).
- The player receives a toast notification on their HUD when morality changes (handled by the existing `notify` call inside `adjustMorality`).
- Real-time: `activeChars` is sourced from `GmShell` state which subscribes to Supabase realtime, so the bar and value update live if another session also modifies the character.

---

## Out of Scope

- End-of-session morality roll / conflict resolution flow (separate future feature).
- Bulk morality adjustment across all characters.
- Setting morality to an arbitrary value directly (the existing "Morality Setup" modal covers initial configuration).
- Removing morality controls from `GmCharacterCard`.
