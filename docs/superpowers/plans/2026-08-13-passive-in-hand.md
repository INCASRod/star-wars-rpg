# Passive-in-Hand + Grid Focus View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a player voluntarily place a passive talent from the passive-deck grid into the hand fan, and let cards in the passive/discard grids open their focus view on click, same as fan cards.

**Architecture:** New persisted `hand_placed_keys` column on `character_hand_state`, wired through `useHandState.ts` with the exact same optimistic-write/queued-persist pattern already used for `discarded_keys`. `HandOverlay.tsx`'s `ownedCards` (currently active talents + Force base powers) gains a third source — passive talents whose key is in `hand_placed_keys` — so a placed passive is a completely normal fan card downstream (rendering, ordering, click-to-focus, drag). Dragging a placed-passive card to the discard corner branches to `unplaceCard` instead of `discardCard`. `CardGridOverlay` gets a generalized action button (used by both the passive grid's "Place in Hand" and the discard grid's existing "Return to hand") and a click-to-focus handler shared with the fan's own.

**Tech Stack:** Next.js 16 / React / TypeScript, Supabase (Postgres), no unit-test framework in this repo — verification is `tsc --noEmit`, `next build`, and live Playwright/direct-SQL checks against the dev server, matching this project's existing convention (see `docs/architecture.md`'s H-series entries).

## Global Constraints

- All design tokens from `src/lib/tokens.ts` / CSS custom properties — no raw hex/px/z-index literals in any new JSX (project-wide rule, `CLAUDE.md`).
- No inline `style={{ }}` objects beyond the project's existing exceptions — new markup in this plan reuses existing CSS module classes, no new styling needed.
- `docs/architecture.md` must be updated if this changes a hook's return shape or a component's props (it does — `useHandState.ts` and `HandOverlay.tsx` both change).
- Never write to `discarded_keys` for a placed-passive card, and never write to `hand_placed_keys` for a non-passive card — the two buckets are disjoint by construction.

---

## File Map

- Modify: `supabase/migrations/` — new file `120_hand_placed_keys.sql`
- Modify: `src/hooks/useHandState.ts` — add `handPlacedKeys` state + `placeCard`/`unplaceCard`
- Modify: `src/components/player-hud/HandOverlay.tsx` — `HandCard.isPlacedPassive`, `ownedCards`/`passiveCards` membership, drop-branch, grid click-to-focus, prop threading
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx` — thread the two new fields/functions from `useHandState` into `HandOverlay`
- Modify: `docs/architecture.md` — update the `useHandState`/`HandOverlay` entries

---

### Task 1: Migration — `hand_placed_keys` column

**Files:**
- Create: `supabase/migrations/120_hand_placed_keys.sql`

**Interfaces:**
- Produces: `character_hand_state.hand_placed_keys` (`text[]`, `not null default '{}'`)

- [ ] **Step 1: Write the migration**

```sql
-- Add hand_placed_keys to character_hand_state: passive talents the player
-- has voluntarily placed into the fan (disjoint from discarded_keys).
ALTER TABLE character_hand_state
  ADD COLUMN IF NOT EXISTS hand_placed_keys TEXT[] NOT NULL DEFAULT '{}';
```

- [ ] **Step 2: Apply the migration**

Use the `mcp__supabase__apply_migration` tool with `name: "hand_placed_keys"` and the SQL above (or run it directly against the project's Supabase instance if that tool isn't available in your session). Confirm success by re-running:

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'character_hand_state' and column_name = 'hand_placed_keys';
```

Expected: one row, `data_type = ARRAY`, `column_default = '{}'::text[]`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/120_hand_placed_keys.sql
git commit -m "feat(db): add character_hand_state.hand_placed_keys column"
```

---

### Task 2: `useHandState.ts` — placed-passive state

**Files:**
- Modify: `src/hooks/useHandState.ts`

**Interfaces:**
- Consumes: `character_hand_state` row (now includes `hand_placed_keys`, from Task 1)
- Produces: hook return gains `handPlacedKeys: string[]`, `placeCard: (key: string) => void`, `unplaceCard: (key: string) => void`

- [ ] **Step 1: Add state + ref, mirroring `discardedKeys`/`discardedRef`**

In `src/hooks/useHandState.ts`, right after the existing `discardedRef`/`orderRef` declarations (currently lines 41-42):

```ts
  const [handPlacedKeys, setHandPlacedKeysState] = useState<string[]>([])
  const handPlacedRef = useRef<string[]>([])
```

- [ ] **Step 2: Widen the initial select and seed the new state**

Change the `.select(...)` call (currently `'is_tucked, discarded_keys, card_order'`) to:

```ts
      .select('is_tucked, discarded_keys, card_order, hand_placed_keys')
```

Immediately after the existing `orderRef.current = order; setCardOrderState(order)` lines inside the same `.then(({ data }) => { ... })` callback, add:

```ts
        const placed = Array.isArray(data?.hand_placed_keys) ? (data.hand_placed_keys as string[]) : []
        handPlacedRef.current = placed
        setHandPlacedKeysState(placed)
```

- [ ] **Step 3: Add `commitHandPlacedKeys`, `placeCard`, `unplaceCard`**

Directly below the existing `commitDiscardedKeys`/`discardCard`/`returnCard` block (after the current `returnCard` function), add:

```ts
  function commitHandPlacedKeys(mutate: (prev: string[]) => string[]) {
    if (!characterId) return
    const next = mutate(handPlacedRef.current)
    handPlacedRef.current = next
    setHandPlacedKeysState(next)

    queueRef.current = queueRef.current.then(async () => {
      await supabase
        .from('character_hand_state')
        .upsert(
          { character_id: characterId, hand_placed_keys: handPlacedRef.current, updated_at: new Date().toISOString() },
          { onConflict: 'character_id' },
        )
    })
  }

  function placeCard(key: string) {
    commitHandPlacedKeys(prev => (prev.includes(key) ? prev : [...prev, key]))
  }
  function unplaceCard(key: string) {
    commitHandPlacedKeys(prev => prev.filter(k => k !== key))
  }
```

This reuses the same `queueRef` the discard/order/tuck writes already share — a placed-card write and a discard write queued back-to-back still serialize correctly, same race-safety proof already established for the other three fields.

- [ ] **Step 4: Return the new fields**

Change the hook's final `return` statement to:

```ts
  return { tucked, discardedKeys, cardOrder, handPlacedKeys, loaded, discardCard, returnCard, toggleTucked, reorderCards, placeCard, unplaceCard }
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (this hook has no external consumers changed yet, so this only checks the file itself is self-consistent).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useHandState.ts
git commit -m "feat(hand): add placeCard/unplaceCard to useHandState"
```

---

### Task 3: `HandOverlay.tsx` — `isPlacedPassive` on `HandCard`, membership, drop-branch

**Files:**
- Modify: `src/components/player-hud/HandOverlay.tsx`

**Interfaces:**
- Consumes: `handPlacedKeys: string[]`, `placeCard: (key: string) => void`, `unplaceCard: (key: string) => void` (new `HandOverlayProps` fields, from Task 2's hook)
- Produces: `HandCard.isPlacedPassive?: boolean`; `ownedCards` now includes placed passives; `passiveCards` (the grid list) excludes placed passives

- [ ] **Step 1: Add `isPlacedPassive` to the `HandCard` interface**

In the `HandCard` interface (currently lines 78-94), add one optional field after `isRanked`:

```ts
  isRanked:        boolean
  /** True only for a passive talent the player has placed into the fan
      (hand_placed_keys). Optional/undefined everywhere else — PurchaseCeremony
      and TalentsRouteHandReveal construct HandCard objects directly and don't
      need to set this. Drives the discard-drop branch: dropping a placed
      passive on the discard corner un-places it instead of discarding it. */
  isPlacedPassive?: boolean
```

- [ ] **Step 2: Add the three new props to `HandOverlayProps`**

Right after the existing `cardOrder`/`reorderCards` props (currently lines 136-137), add:

```ts
  /** Passive talents currently placed into the fan by the player (this
      prompt) — disjoint from discardedKeys. */
  handPlacedKeys:  string[]
  placeCard:       (key: string) => void
  unplaceCard:     (key: string) => void
```

- [ ] **Step 3: Destructure the new props in the component signature**

Change the `export function HandOverlay({ ... })` destructure (currently line 163-166) to include them:

```ts
export function HandOverlay({
  characterId, supabase, talents, hudTalents, refTalentMap, refSpecMap, allForcePowers, refForcePowerMap,
  activeCheckSkillKey = null,
  tucked, discardedKeys, discardCard, returnCard, cardOrder, reorderCards, mapPanelRef, onPlayPower,
  handPlacedKeys, placeCard, unplaceCard,
}: HandOverlayProps) {
```

- [ ] **Step 4: Compute placed-passive cards and fix up `passiveCards`/`ownedCards`**

The existing `passiveCards` memo (currently):

```ts
  const passiveCards = useMemo(
    () => hudTalents.filter(ht => ht.activation === 'Passive').map(buildTalentCard),
    [hudTalents, refTalentMap, talents, refSpecMap], // eslint-disable-line react-hooks/exhaustive-deps
  )
```

Replace with:

```ts
  const handPlacedSet = useMemo(() => new Set(handPlacedKeys), [handPlacedKeys])
  // All owned passives, regardless of placement — the single source both the
  // grid list and the placed-in-fan list below derive from, so a card is
  // never independently out of sync between the two.
  const allPassiveCards = useMemo(
    () => hudTalents.filter(ht => ht.activation === 'Passive').map(buildTalentCard),
    [hudTalents, refTalentMap, talents, refSpecMap], // eslint-disable-line react-hooks/exhaustive-deps
  )
  // Grid list: only passives NOT currently placed in the fan — mirrors how
  // discardedCards already excludes anything back in the fan (mutually
  // exclusive membership).
  const passiveCards = useMemo(
    () => allPassiveCards.filter(c => !handPlacedSet.has(c.key)),
    [allPassiveCards, handPlacedSet],
  )
  const placedPassiveCards = useMemo(
    () => allPassiveCards
      .filter(c => handPlacedSet.has(c.key))
      .map(c => ({ ...c, isPlacedPassive: true })),
    [allPassiveCards, handPlacedSet],
  )
```

Then change the existing `ownedCards` memo (currently `[...activeTalentCards, ...forceCards]`) to:

```ts
  const ownedCards = useMemo(
    () => [...activeTalentCards, ...forceCards, ...placedPassiveCards],
    [activeTalentCards, forceCards, placedPassiveCards],
  )
```

Everything downstream of `ownedCards` (`focusTalentCard`, `discardedSet`, `fanCards`, `discardedCards`, `orderedFanCards`, `forceCardKeys`) is unchanged — they all derive from `ownedCards`/`discardedKeys` already and need no edits.

- [ ] **Step 5: Branch the discard-drop handler on `isPlacedPassive`**

In `handleCardPointerUp` (currently around line 511), the discard-drop branch currently reads:

```ts
    if (drag.moved && overPile && pile) {
      gsap.to(el, {
        scale: 0.4, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => discardCard(key),
      })
      setDragOrderKeys(null)
```

Change the `onComplete` callback to branch:

```ts
    if (drag.moved && overPile && pile) {
      const droppedCard = ownedCards.find(c => c.key === key)
      gsap.to(el, {
        scale: 0.4, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => (droppedCard?.isPlacedPassive ? unplaceCard(key) : discardCard(key)),
      })
      setDragOrderKeys(null)
```

(`droppedCard` is looked up before the animation starts since `ownedCards` will have already re-rendered without this card's discarded/unplaced state by the time `onComplete` fires — same reasoning the existing code already relies on for `key` itself.)

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors ONLY in `PlayerHUDDesktop.tsx` (missing new required props `handPlacedKeys`/`placeCard`/`unplaceCard` on `<HandOverlay>`) — fixed in Task 5. No errors inside `HandOverlay.tsx` itself.

- [ ] **Step 7: Commit**

```bash
git add src/components/player-hud/HandOverlay.tsx
git commit -m "feat(hand): placed passives join the fan as normal HandCards"
```

---

### Task 4: `CardGridOverlay` — generalized action button + click-to-focus

**Files:**
- Modify: `src/components/player-hud/HandOverlay.tsx`

**Interfaces:**
- Consumes: nothing new beyond Task 3's state (`placeCard`, `handleCardPointerUp`'s click-branch logic, extracted below)
- Produces: `CardGridOverlay` accepts `actionLabel?: string`, `onAction?: (key: string) => void` (replacing `onReturn`); every grid card opens its focus view on click

- [ ] **Step 1: Extract the click-to-focus branch into a standalone function**

In `handleCardPointerUp`'s no-movement `else` branch (currently around line 557-567):

```ts
    } else {
      const card = ownedCards.find(c => c.key === key)
      if (card?.kind === 'force') {
        const powerKey = card.key.slice('force_'.length)
        setFocusPowerKey(powerKey)
      } else if (card?.kind === 'talent') {
        setFocusTalentKey(card.key)
      }
    }
```

Replace with a call to a new top-level function inside the component body (defined once, used both here and by the grid):

```ts
    } else {
      openFocusFor(key)
    }
```

Add `openFocusFor`, placed right before `handleCardPointerUp`'s own definition:

```ts
  // Shared click-to-focus resolver — used by the fan's own click-vs-drag
  // pointerup handler AND by CardGridOverlay's grid cards (passive + discard
  // piles), so there's exactly one place that knows how to open a card's
  // focus view.
  function openFocusFor(key: string) {
    const card = ownedCards.find(c => c.key === key) ?? allPassiveCards.find(c => c.key === key)
    if (card?.kind === 'force') {
      const powerKey = card.key.slice('force_'.length)
      setFocusPowerKey(powerKey)
    } else if (card?.kind === 'talent') {
      setFocusTalentKey(card.key)
    }
  }
```

(The `allPassiveCards` fallback matters here: a passive card still sitting in the grid, not yet placed, is NOT in `ownedCards` — `ownedCards` only contains placed passives. Without the fallback, clicking an unplaced passive-grid card would silently no-op.)

- [ ] **Step 2: Generalize `CardGridOverlay`'s action prop**

Replace the current `CardGridOverlay` signature and body (currently lines 746-779):

```ts
function CardGridOverlay({
  title, cards, emptyText, onClose, onReturn,
}: {
  title: string
  cards: HandCard[]
  emptyText: string
  onClose: () => void
  onReturn?: (key: string) => void
}) {
  return (
    <div className={styles.gridBackdrop} style={{ zIndex: Z.popover }} onClick={onClose}>
      <div className={styles.gridPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.gridTitle}>{title}</div>
        <button type="button" className={styles.gridClose} onClick={onClose}>✕ Close</button>
        {cards.length === 0 ? (
          <div className={styles.gridEmpty}>{emptyText}</div>
        ) : (
          <div className={styles.grid}>
            {cards.map(c => (
              <div key={c.key} className={`${styles.card} ${styles.gridCard} ${c.kind === 'force' ? styles.forceCard : ''}`}>
                <CardFace card={c} />
                {onReturn && (
                  <button type="button" className={styles.takeback} onClick={() => onReturn(c.key)}>
                    ↑ Return to hand
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

with:

```ts
function CardGridOverlay({
  title, cards, emptyText, onClose, actionLabel, onAction, onCardClick,
}: {
  title: string
  cards: HandCard[]
  emptyText: string
  onClose: () => void
  actionLabel?: string
  onAction?: (key: string) => void
  onCardClick: (key: string) => void
}) {
  return (
    <div className={styles.gridBackdrop} style={{ zIndex: Z.popover }} onClick={onClose}>
      <div className={styles.gridPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.gridTitle}>{title}</div>
        <button type="button" className={styles.gridClose} onClick={onClose}>✕ Close</button>
        {cards.length === 0 ? (
          <div className={styles.gridEmpty}>{emptyText}</div>
        ) : (
          <div className={styles.grid}>
            {cards.map(c => (
              <div
                key={c.key}
                className={`${styles.card} ${styles.gridCard} ${c.kind === 'force' ? styles.forceCard : ''}`}
                onClick={() => onCardClick(c.key)}
              >
                <CardFace card={c} />
                {onAction && actionLabel && (
                  <button
                    type="button"
                    className={styles.takeback}
                    onClick={e => { e.stopPropagation(); onAction(c.key) }}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

(`onCardClick` is required, not optional — every grid card is always focusable, unlike the action button which is grid-specific. The action button's own `onClick` now stops propagation so clicking "Place in Hand"/"Return to hand" doesn't ALSO open the focus view underneath it.)

- [ ] **Step 3: Update both `CardGridOverlay` call sites**

The passive-grid call (currently lines 672-679):

```ts
      {showPassives && (
        <CardGridOverlay
          title="Passive Talents"
          cards={passiveCards}
          emptyText="No passive talents owned."
          onClose={() => setShowPassives(false)}
        />
      )}
```

becomes:

```ts
      {showPassives && (
        <CardGridOverlay
          title="Passive Talents"
          cards={passiveCards}
          emptyText="No passive talents owned."
          onClose={() => setShowPassives(false)}
          actionLabel="→ Place in Hand"
          onAction={key => placeCard(key)}
          onCardClick={openFocusFor}
        />
      )}
```

The discard-grid call (currently lines 681-694):

```ts
      {showDiscard && (
        <CardGridOverlay
          title="Discarded — hover to take back"
          cards={discardedCards}
          emptyText="No talents discarded."
          onClose={() => setShowDiscard(false)}
          onReturn={key => returnCard(key)}
        />
      )}
```

becomes:

```ts
      {showDiscard && (
        <CardGridOverlay
          title="Discarded — hover to take back"
          cards={discardedCards}
          emptyText="No talents discarded."
          onClose={() => setShowDiscard(false)}
          actionLabel="↑ Return to hand"
          onAction={key => returnCard(key)}
          onCardClick={openFocusFor}
        />
      )}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: same as Task 3 Step 6 — only `PlayerHUDDesktop.tsx` errors remain (Task 5 fixes those).

- [ ] **Step 5: Commit**

```bash
git add src/components/player-hud/HandOverlay.tsx
git commit -m "feat(hand): grid cards open focus view on click, generalize grid action button"
```

---

### Task 5: `PlayerHUDDesktop.tsx` — thread the new hook fields through

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

**Interfaces:**
- Consumes: `useHandState`'s new `handPlacedKeys`/`placeCard`/`unplaceCard` (Task 2); `HandOverlay`'s new required props of the same names (Task 3)

- [ ] **Step 1: Destructure the new fields from `useHandState`**

Change (currently line 95):

```ts
  const { tucked: handTucked, discardedKeys, cardOrder, discardCard, returnCard, toggleTucked, reorderCards } = useHandState(characterId, supabase)
```

to:

```ts
  const { tucked: handTucked, discardedKeys, cardOrder, handPlacedKeys, discardCard, returnCard, toggleTucked, reorderCards, placeCard, unplaceCard } = useHandState(characterId, supabase)
```

- [ ] **Step 2: Pass them into `<HandOverlay>`**

In the `<HandOverlay ... />` call (currently lines 470-488), add after the existing `reorderCards={reorderCards}` line:

```tsx
          handPlacedKeys={handPlacedKeys}
          placeCard={placeCard}
          unplaceCard={unplaceCard}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors anywhere.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `Compiled successfully`, zero TypeScript errors during the build's own type pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(hand): wire placeCard/unplaceCard through PlayerHUDDesktop"
```

---

### Task 6: Live verification (Playwright + direct SQL)

**Files:** none (verification only — this project has no unit-test runner; live verification against the dev server is the established convention here, see `docs/architecture.md`'s H-series entries).

- [ ] **Step 1: Confirm the dev server is up**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000`
Expected: `200`. If not, start it: `npm run dev` (check for an existing lock/port conflict first — see the project's own note in `docs/architecture.md`/prior session memory about reusing an already-running `next dev`).

- [ ] **Step 2: Find a real character with an owned passive talent**

```sql
select c.id, c.name, ht.talent_key
from characters c
join character_talents ht on ht.character_id = c.id
join ref_talents rt on rt.key = ht.talent_key
where c.is_archived = true and rt.activation = 'Passive'
limit 5;
```

(Use an archived character per this project's established test convention — never a live PC.)

- [ ] **Step 3: Verify "Place in Hand" — script via Playwright (cached npx package, see this session's prior scripts for the exact `require()`-by-absolute-path pattern) against `http://localhost:3000/character/<id>`:**

1. Open the passive-deck grid (click the "Passive" deck-stack trigger).
2. Confirm the target talent's grid card shows a "→ Place in Hand" button.
3. Click it.
4. Confirm the card disappears from the passive grid (`cards.length` drop by one, or the specific key absent from the grid's rendered card list).
5. Close the grid; confirm the same card now renders in the fan (`div[class*="HandOverlay-module"][class*="__ranks"]`-style selector isn't needed here — just query for a fan `.card` whose header text matches the talent's name).
6. Reload the page fresh; confirm the card is STILL in the fan (persistence) and STILL absent from the passive grid.

- [ ] **Step 4: Verify un-placing via drag-to-discard**

1. With the placed card now in the fan, drag it onto the discard corner (mouse down on the card's center, move toward the discard corner's measured rect, mouse up — same drag choreography as this project's existing discard-drag Playwright scripts).
2. Confirm the card disappears from the fan.
3. Open the discard grid; confirm the card is **NOT** there (it was un-placed, not discarded).
4. Open the passive grid; confirm the card **IS** back there, with its "→ Place in Hand" button again.
5. Reload the page fresh; confirm this state persists (fan doesn't have it, discard grid doesn't have it, passive grid does).
6. Direct-SQL check: `select discarded_keys, hand_placed_keys from character_hand_state where character_id = '<id>';` — confirm the talent's key is present in neither array's final state (it was added then removed from `hand_placed_keys`, `discarded_keys` untouched throughout).

- [ ] **Step 5: Verify click-to-focus on grid cards**

1. Open the passive grid (with at least one still-unplaced passive in it). Click a card (not its action button).
2. Confirm `TalentFocusView` opens with that card's name/description.
3. Close it. Open the discard grid (discard a normal active talent first if the pile is empty). Click a discard-grid card.
4. Confirm its focus view opens too (talent → `TalentFocusView`, Force card → `ForcePowerFocusView`).
5. Confirm clicking the "Return to hand"/"Place in Hand" button does NOT also open the focus view (the `e.stopPropagation()` from Task 4 Step 2).

- [ ] **Step 6: Regression check — ordinary discard/return still works**

1. Discard a normal (non-placed) active talent from the fan via the existing drag gesture.
2. Confirm it lands in the discard grid, `discardedKeys` gets its key, `hand_placed_keys` is untouched.
3. Return it via the discard grid's button; confirm it's back in the fan.

- [ ] **Step 7: Report results**

Summarize pass/fail for each of Steps 3-6 in your final report — no code changes if all pass.

---

### Task 7: Update `docs/architecture.md`

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 1: Update the `useHandState` entry**

Find the paragraph documenting `useHandState.ts` (search for `character_hand_state` in the file). Add one sentence noting the new `hand_placed_keys` field, `placeCard`/`unplaceCard`, and that it follows the exact same commit/queue/ref pattern as `discarded_keys` — cite this plan's task numbers if useful, but keep it in the same terse prose style as the surrounding entries.

- [ ] **Step 2: Update the `HandOverlay` entry**

Find the `HandOverlay` entry (search for `H2` / `H3` near `src/components/player-hud/HandOverlay.tsx`). Add a short paragraph describing: passive talents can now be placed into the fan (`ownedCards` gains `placedPassiveCards`), un-placing via drag-to-discard branches on `isPlacedPassive`, and `CardGridOverlay` now opens the focus view on click for both the passive and discard grids, with a generalized `actionLabel`/`onAction` replacing the old single-purpose `onReturn`.

- [ ] **Step 3: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: document passive-in-hand + grid focus view"
```
