# Group Storage Design

**Date:** 2026-06-12  
**Status:** Approved  

---

## Overview

Group Assets (starships, vehicles, safe houses) can be flagged as **Group Storage**. When flagged, any item a player stows to that asset becomes visible to all players through a "View Storage" modal on the Group Assets panel. Any player can take items from Group Storage — this is the primary mechanism for player-to-player item trading.

The existing stow system is unchanged. Items stowed to a Group Storage asset stay in their owner's character inventory as `equip_state = 'stowed'` (they don't count against encumbrance and the owner can reclaim them at any time). The Group Storage view is simply a cross-character query on the existing stow tags.

---

## Data Model

### Migration 081 — `is_group_storage` column

```sql
ALTER TABLE group_assets
  ADD COLUMN is_group_storage boolean NOT NULL DEFAULT false;
```

No new tables. The existing `stow_location_id` on `character_weapons`, `character_armor`, and `character_gear` already references `group_assets.id`. The Group Storage view queries across these tables filtered by `stow_location_id`.

### View Storage query (per asset)

For each of the three item tables, select rows where:
- `stow_location_id = $assetId`
- `equip_state = 'stowed'`
- `is_dropped IS NOT TRUE`

Join to `characters` to get `name` (displayed as "Stowed by [character]").

Results are returned as a unified list typed as `GroupStorageItem[]` (weapon | armor | gear with a `itemType` discriminator and `ownerName` field).

### Take operation

**Weapons and armor (always full transfer):**
```sql
UPDATE character_[table]
SET character_id      = $takerId,
    equip_state       = 'carrying',
    stow_location_id   = null,
    stow_location_name = null,
    stow_location_type = null
WHERE id = $itemId
```

**Gear — full stack (`takeQty = totalQty`):** same UPDATE as above.

**Gear — partial stack (`takeQty < totalQty`):**
1. `UPDATE character_gear SET qty = qty - $takeQty WHERE id = $itemId` (decrement original)
2. `INSERT INTO character_gear` cloning all fields from the original row except `id`, `character_id`, `qty`, and stow fields — set `character_id = $takerId`, `qty = $takeQty`, `equip_state = 'carrying'`, stow fields null.

All take operations run in a Supabase transaction (RPC) to avoid race conditions on partial qty splits.

---

## Changes to Existing Components

### `AddAssetModal` (in `GroupSheet.tsx`)

For stowable asset types only (`vehicle`, `starship`, `safe_house`):
- Add a **"Group Storage"** checkbox below the description field.
- Label: "Enable Group Storage — players can view and take items stowed here."
- Defaults to unchecked.
- Passes `is_group_storage` to the insert.

### `AssetCard` / `AssetViewModal` (in `GroupSheet.tsx`)

Two additions:

1. **GM toggle** (GM-unlocked only): a small toggle/checkbox on the asset view that flips `is_group_storage` on an existing asset. This is how the current campaign starship gets enabled without recreating it.

2. **VIEW STORAGE button** (all players): visible only when `asset.is_group_storage = true`. Opens `GroupStorageModal` for that asset. Shown on the asset card itself (not gated behind the GM view).

### `StowLocationModal` (`src/components/player-hud/stow-location-modal.tsx`)

Group Storage assets get a `📦 Shared` pill next to their name in the stow location picker. This signals to the player that items stowed here are visible and takeable by the whole group. No behavioural change — it's a visual hint only.

### `useStowLocations` (`src/hooks/useStowLocations.ts`)

Include `is_group_storage` in the `group_assets` select so the stow modal can render the badge.

---

## New Components

### `useGroupStorage(assetId: string | null)`

**Location:** `src/hooks/useGroupStorage.ts`

**Responsibilities:**
- Fetch all items stowed to `assetId` across `character_weapons`, `character_armor`, `character_gear` (joined to `characters` for owner name).
- Maintain a realtime subscription on all three item tables filtered by `stow_location_id`.
- Expose `takeItem(itemId, itemType, characterId, qty?)` handler that executes the take operation.
- Expose `loading`, `items: GroupStorageItem[]`, and `taking: Set<string>` (IDs currently in-flight).

**Type:**
```ts
interface GroupStorageItem {
  id: string
  itemType: 'weapon' | 'armor' | 'gear'
  name: string
  encumbrance: number
  qty?: number           // gear only
  ownerCharacterId: string
  ownerName: string
  // stat summary fields for display
  damage?: number        // weapon
  crit?: number          // weapon
  range?: string         // weapon
  soak?: number          // armor
  defense?: number       // armor
  rarity: number
  description?: string | null
  item_image_url?: string | null
  // ref key for item detail popup
  itemKey: string
  itemTypeForRef: 'weapon' | 'armor' | 'gear'
}
```

### `GroupStorageModal` (`src/components/group/GroupStorageModal.tsx`)

**Trigger:** "VIEW STORAGE" button on an asset card.

**Header:** asset type icon + asset name + live item count badge (e.g. "Marauder Corvette — 4 items").

**Item list:**

Each row contains:
- Type icon (⚔ weapon / ◈ armor / ◆ gear)
- Item name + compact stat summary (damage+crit for weapons, soak/def for armor, enc for gear)
- Encumbrance value
- "Stowed by [character name]" — subtle dim label
- `VIEW` button — opens the existing item detail popup (read-only, no action buttons), same component used by the QM
- `TAKE` button

**Gear qty > 1 — take flow:**
Clicking `TAKE` on a gear item with `qty > 1` expands an inline quantity selector:
`[−] [1] [+] of 5 → [CONFIRM] [CANCEL]`
Defaults to 1. `CONFIRM` executes the take. Weapons and armor (and single-qty gear) take immediately on click with no confirmation step.

**Empty state:** "Nothing stored here yet."

**Footer:** `CLOSE` button.

**Visual style:** consistent with `QuartermasterModal` — same dark panel, header treatment, item row density, and button styles.

---

## Enabling on the Existing Starship

The GM opens the existing starship asset in the Group Assets panel, unlocks GM mode, and toggles "Group Storage" on. This sets `is_group_storage = true` on that row. No data migration or recreation needed.

---

## Realtime

`useGroupStorage` subscribes to `INSERT`, `UPDATE`, `DELETE` on `character_weapons`, `character_armor`, and `character_gear`. On each change event the hook re-fetches the storage list (or filters client-side) to keep the view live — items appear as soon as someone stows them and disappear as soon as they're taken. The exact subscription strategy (per-table channels vs a single campaign-scoped channel) is left to implementation.

---

## Out of Scope

- Personal storage locations (base of operations, non-Group-Storage assets) remain private — no cross-character visibility.
- No GM-only restriction on taking — any player may take from any Group Storage asset.
- No "request to take" / approval flow — takes are immediate.
- No audit log of who took what (may be a future addition).
