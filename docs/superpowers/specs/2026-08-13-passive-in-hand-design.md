# Passive talents: place in hand + focus view

## Problem

Passive talents currently live only in the passive-deck grid (`HandOverlay.tsx`'s
`CardGridOverlay`, `showPassives`). They're structurally excluded from the fan
(`ownedCards` is built from `activeTalentCards + forceCards` only — passives are
filtered out by `ht.activation === 'Passive'`) and grid cards have no click
handler at all — clicking a passive-pile card, or a discard-pile card, does
nothing. Fan cards, by contrast, open `TalentFocusView`/`ForcePowerFocusView` on
a no-movement click.

Two gaps to close:
1. A player can't voluntarily place a passive talent into the fan.
2. Passive-pile (and, incidentally, discard-pile) cards can't be focused.

## Data model

New column on `character_hand_state` (migration, next free number):

```sql
ALTER TABLE character_hand_state
  ADD COLUMN IF NOT EXISTS hand_placed_keys TEXT[] NOT NULL DEFAULT '{}';
```

Same shape and defaulting as `discarded_keys` (migration 118) — a character
with no row is valid default state (nothing placed), matching the existing
convention documented in `useHandState.ts`.

## `useHandState.ts` changes

Add a fourth piece of state, `handPlacedKeys`, following the exact
optimistic-write-then-queued-persist pattern already used by
`discardedKeys`/`commitDiscardedKeys`:

- `handPlacedRef` (ref, mirrors `discardedRef`)
- `commitHandPlacedKeys(mutate)` — same shape as `commitDiscardedKeys`
- `placeCard(key)` — adds key (no-op if already present)
- `unplaceCard(key)` — removes key
- Initial `select` widens to `is_tucked, discarded_keys, card_order, hand_placed_keys`

Returned from the hook alongside the existing fields.

## `HandOverlay.tsx` changes

**Card shape.** `HandCard` gains `isPlacedPassive: boolean` (false for every
existing card kind). Set only in `buildTalentCard`'s passive branch, once a
card is confirmed placed.

**Membership.**
```
ownedCards = activeTalentCards + forceCards + placedPassiveCards
```
where `placedPassiveCards = passiveCards.filter(c => handPlacedKeys.includes(c.key))`,
each mapped through `buildTalentCard` with `isPlacedPassive: true`. Everything
downstream (`fanCards`, `discardedSet` filtering, `orderedFanCards`, drag/reorder)
is unchanged — a placed passive is just another member of `ownedCards` and
behaves identically to any other fan card for rendering, ordering, hover, and
click-to-focus.

**Passive grid contents.** `passiveCards` (the grid's own list) additionally
excludes anything in `handPlacedKeys`, mirroring how `discardedCards` already
excludes anything back in the fan — a card is in exactly one of {passive grid,
fan, discard pile} at a time.

**Drop-target branch (un-placing).** In `handleCardPointerUp`, the existing
discard-drop branch (`drag.moved && overPile && pile`) currently always calls
`discardCard(key)`. It now branches on the dropped card's `isPlacedPassive`:
- `true` → `unplaceCard(key)` (same shrink-into-pile GSAP animation; returns to
  the passive grid, `discardedKeys` untouched)
- `false` → `discardCard(key)` (unchanged)

**Placing.** `CardGridOverlay` gains a generalized action prop, replacing the
single-purpose `onReturn`:
```ts
actionLabel?: string
onAction?: (key: string) => void
```
- Discard grid: `actionLabel="↑ Return to hand"`, `onAction={returnCard}`
  (unchanged behavior, renamed prop)
- Passive grid: `actionLabel="→ Place in Hand"`, `onAction={placeCard}`

**Focus-on-click, both grids.** `CardGridOverlay`'s per-card `<div>` gains an
`onClick` using the same kind-branch already in `handleCardPointerUp`'s
click-path (Force → `setFocusPowerKey`, talent → `setFocusTalentKey`) —
extracted into a small shared helper (e.g. `openFocusFor(card)`) called from
both the fan's pointerup handler and the grid's onClick, so there's one
implementation instead of two. This applies uniformly to both the passive grid
and the discard grid, since they share `CardGridOverlay`.

## Out of scope

- No hand-size limit on placed passives.
- No special handling in `card_order`/`orderedFanCards` — a freshly placed
  passive is an "unknown key" to the existing order-merge logic and simply
  appends at the end, exactly like a freshly returned discard already does.
- Discard semantics for non-passive cards are unchanged.
- No change to `ForcePowerFocusView`'s upgrade-lattice display.

## Testing

- Place a passive from the grid → appears in fan, disappears from grid,
  persists across reload.
- Drag a placed-passive fan card to the discard corner → returns to passive
  grid, does not appear in the discard pile, persists across reload.
- Click a passive-grid card (not yet placed) → opens `TalentFocusView`.
- Click a discard-grid card → opens `TalentFocusView`/`ForcePowerFocusView`.
- Ordinary active-talent/Force-card discard/return flow unchanged (regression
  check against H3's existing behavior).
