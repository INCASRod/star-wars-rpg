# Conflict Mechanism — Design Spec

**Date:** 2026-05-21  
**Status:** Approved  
**Scope:** GM-initiated manual conflict, player notification modal, GM active-conflict list

---

## Overview

Conflict is a core morality mechanic in the AoE Star Wars RPG. It is already added automatically when a force-sensitive character uses dark-side pips (via the existing `force_notifications` → `ForceNotificationCard` flow). This spec covers the **manual path**: a GM can assign conflict to any force-sensitive character for narrative reasons, with a persistent notification delivered to the player on their next login.

---

## Data Layer

### Migration

Two new columns on `character_conflicts`:

```sql
ALTER TABLE character_conflicts
  ADD COLUMN player_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN narrative TEXT;

-- Backfill existing rows so pre-feature conflicts don't surface as notifications
UPDATE character_conflicts SET player_acknowledged = TRUE;
ALTER TABLE character_conflicts ALTER COLUMN player_acknowledged SET DEFAULT FALSE;
```

`narrative` is nullable — the GM can omit it. New rows default `player_acknowledged` to `FALSE`; the player flips it to `TRUE` on dismiss.

### Table shape (relevant columns)

| Column                | Type        | Notes                                          |
|-----------------------|-------------|------------------------------------------------|
| `id`                  | uuid        | PK                                             |
| `character_id`        | uuid        | FK → characters                                |
| `campaign_id`         | uuid        | FK → campaigns                                 |
| `description`         | text        | Short type label ("Murder", "Coercion", etc.)  |
| `narrative`           | text        | **New** — optional longer narrative text       |
| `session_label`       | text        | Auto-set to ISO date string (YYYY-MM-DD)       |
| `is_resolved`         | boolean     | End-of-session morality resolution             |
| `player_acknowledged` | boolean     | **New** — false until player dismisses         |
| `created_at`          | timestamptz |                                                |

---

## New Hook — `useGmCampaignConflicts`

**File:** `src/hooks/useGmCampaignConflicts.ts`

```ts
useGmCampaignConflicts(campaignId: string, forceSensitiveCharIds: string[])
// Returns: { conflicts: GmConflictRow[] }
```

- Fetches all `character_conflicts` where `character_id IN (forceSensitiveCharIds)` and `is_resolved = false`, ordered `created_at DESC`.
- Realtime: subscribes to INSERT on `character_conflicts` filtered by `campaign_id` so the GM list updates live when a new conflict is added.
- Returns an empty array when `forceSensitiveCharIds` is empty (no query fired).

```ts
interface GmConflictRow {
  id:          string
  character_id: string
  description: string       // the "type" short label
  narrative?:  string       // optional longer description
  created_at:  string
}
```

---

## Extended — `useCharacterConflicts`

**File:** `src/hooks/useCharacterConflicts.ts` (existing)

Add derived value `pendingConflicts: ConflictEntry[]` — filtered to rows where `player_acknowledged = false`, ordered `created_at ASC` (oldest first, so the player clears them in order).

Update the SELECT to include the new columns:

```ts
.select('id, description, narrative, session_label, is_resolved, player_acknowledged, created_at')
```

Update `ConflictEntry` type (in `src/components/player-hud/ForcePanel.tsx`) to add:

```ts
narrative?:           string
player_acknowledged?: boolean
```

---

## GM Side — `AddConflictModal`

**File:** `src/components/gm/AddConflictModal.tsx`

Uses the shared `Modal` component. Renders when `open = true`.

### Props

```ts
interface AddConflictModalProps {
  open:        boolean
  onClose:     () => void
  campaignId:  string
  characters:  Character[]   // full list — filtered internally to is_force_sensitive
}
```

### Fields

| Field       | Control    | Required | Notes                              |
|-------------|------------|----------|------------------------------------|
| Character   | `<select>` | Yes      | Filtered to `is_force_sensitive === true` |
| Type        | `<input>`  | Yes      | Short freeform label (e.g. "Murder") |
| Description | `<textarea>`| No      | Optional narrative detail          |

Add button disabled until character + type are both filled.

### Submit behaviour

1. INSERT to `character_conflicts`:
   - `character_id` — selected character
   - `campaign_id` — passed prop
   - `description` — type field value
   - `narrative` — description field value (omitted if empty)
   - `session_label` — `new Date().toISOString().slice(0, 10)` (YYYY-MM-DD)
   - `is_resolved` — `false`
   - `player_acknowledged` — `false`
2. Close modal on success.

### Edge case

If no force-sensitive characters exist in the campaign: the "Add Conflict" button in the Force tab is disabled (not hidden) with a `title` tooltip: "No force-sensitive characters in this campaign."

---

## GM Side — Force Tab Restructure (`GmToolsPanel`)

**File:** `src/app/gm/panels/GmToolsPanel.tsx`

The `force` tab content is restructured into three vertical sections:

### 1 — Add Conflict button

```
[ + Add Conflict ]
```

Purple-tinted button, full-width, at top of tab. Opens `AddConflictModal`. Disabled (with tooltip) if no force-sensitive characters.

### 2 — Pending Force Notifications

Existing content unchanged — `ForceNotificationCard` list for pending dark-side-use events. Section header: "FORCE NOTIFICATIONS" in overline style.

Zero state: "No pending Force notifications. Dark side use will appear here in real time."

### 3 — Active Conflicts

Section header: "ACTIVE CONFLICTS" in overline style. Powered by `useGmCampaignConflicts`.

Each row:

```
┌──────────────────────────────────────┐
│  Kira Voss              2026-05-20   │
│  Murder                              │
│  Executed the Imperial prisoner...   │
└──────────────────────────────────────┘
```

- Character name + date in a flex row (space-between)
- Type (`description`) in gold/purple accent
- Narrative (`narrative`) in dim body text, ellipsis overflow if long

Zero state (no active conflicts): single dim line "No active conflicts."

The hook is called with `forceSensitiveCharIds` derived from `activeChars.filter(c => c.is_force_sensitive).map(c => c.id)`.

---

## Player Side — Conflict Notification Modal

**Where:** `PlayerHUDDesktop` — follows the same pattern as loot reveal and vendor offer modals.

### State

```ts
const [conflictQueue, setConflictQueue] = useState<ConflictEntry[]>([])
```

Populated on mount from `pendingConflicts` (returned by the extended `useCharacterConflicts`). The first item in the queue is displayed. On acknowledge, it is removed from the queue; the next item surfaces automatically.

### Modal appearance

Uses the shared `Modal` component with `onClose` set to `undefined` (no backdrop dismiss, no ESC).

```
┌────────────────────────────────────────┐
│  ⚠  CONFLICT GAINED                    │  purple header
│                                        │
│  Murder                                │  type — prominent, gold/purple
│                                        │
│  "Executed the Imperial prisoner       │  narrative — dimmed body text
│   before Kira could intervene."        │  (omitted if empty)
│                                        │
│              [ Acknowledge ]           │  single action button
└────────────────────────────────────────┘
```

### Acknowledge action

1. `UPDATE character_conflicts SET player_acknowledged = true WHERE id = X`
2. Wait for DB confirmation (no optimistic update — prevents loss if tab closes mid-write)
3. Remove item from `conflictQueue` state
4. If queue is now empty, modal closes. If items remain, next one displays.

---

## Out of Scope

- **Resolve conflict** — flipping `is_resolved = true` is an end-of-session morality roll flow, not part of this spec.
- **Realtime broadcast on conflict add** — not needed; the DB-backed `player_acknowledged` flag is the delivery mechanism. The player sees it on next login.
- **Conflict amount/magnitude** — the rules carry different conflict costs per action type but the GM assigns this narratively, not numerically, in this implementation.
- **Conflict history view on player HUD** — the existing `ForcePanel` already renders the conflict log; this spec only adds the notification layer.

---

## File Change Summary

| File | Change |
|------|--------|
| `supabase/migrations/054_conflict_player_ack.sql` | New — adds `player_acknowledged` + `narrative` columns |
| `src/hooks/useGmCampaignConflicts.ts` | New — campaign-wide conflict loader for GM |
| `src/hooks/useCharacterConflicts.ts` | Extend — add `pendingConflicts` derived value, update SELECT |
| `src/components/gm/AddConflictModal.tsx` | New — GM modal for manual conflict entry |
| `src/app/gm/panels/GmToolsPanel.tsx` | Modify — add button, restructure Force tab, add active conflicts list |
| `src/components/player-hud/ForcePanel.tsx` | Modify — extend `ConflictEntry` type |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | Modify — wire `conflictQueue` state + notification modal |
| `docs/architecture.md` | Update — document new hook, migration, component |
