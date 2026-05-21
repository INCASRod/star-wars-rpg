# Conflict Mechanism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GM-initiated manual conflict assignment — Force tab "Add Conflict" button + modal, DB-backed player notification modal, and GM active-conflicts list.

**Architecture:** A new boolean column `player_acknowledged` on `character_conflicts` is the delivery mechanism. The GM inserts a row via `AddConflictModal`; the player's HUD detects unacknowledged rows on load and surfaces them one at a time. The GM Force tab gains a live active-conflicts list via a new `useGmCampaignConflicts` hook.

**Tech Stack:** Next.js 16, TypeScript, Supabase (postgres_changes realtime), React hooks, shared `Modal` component from `src/components/ui/Modal.tsx`.

**Spec:** `docs/superpowers/specs/2026-05-21-conflict-mechanism-design.md`

---

## File Map

| File | Action |
|------|--------|
| `supabase/migrations/054_conflict_player_ack.sql` | Create |
| `src/components/player-hud/ForcePanel.tsx` | Modify — extend `ConflictEntry` type |
| `src/hooks/useCharacterConflicts.ts` | Modify — update SELECT, add `pendingConflicts` |
| `src/hooks/useGmCampaignConflicts.ts` | Create |
| `src/components/gm/AddConflictModal.tsx` | Create |
| `src/app/gm/panels/GmToolsPanel.tsx` | Modify — restructure Force tab |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | Modify — wire conflict queue + modal |
| `docs/architecture.md` | Modify — document new hook, component, migration |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/054_conflict_player_ack.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- 054: conflict player acknowledgment + narrative field
-- Adds player_acknowledged (delivery flag) and narrative (longer description body)
-- to character_conflicts. Backfills existing rows so pre-feature data is silent.

ALTER TABLE character_conflicts
  ADD COLUMN player_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN narrative TEXT;

UPDATE character_conflicts SET player_acknowledged = TRUE;

ALTER TABLE character_conflicts ALTER COLUMN player_acknowledged SET DEFAULT FALSE;
```

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tool:
```
mcp__supabase__apply_migration
  name: "054_conflict_player_ack"
  query: <contents of the SQL file above>
```

Or via Supabase CLI if available locally:
```bash
supabase db push
```

- [ ] **Step 3: Verify schema**

Use Supabase MCP `list_tables` or the Supabase dashboard to confirm `character_conflicts` now has `player_acknowledged` (boolean, default false) and `narrative` (text, nullable).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/054_conflict_player_ack.sql
git commit -m "feat(db): add player_acknowledged + narrative to character_conflicts"
```

---

## Task 2: Extend ConflictEntry Type

**Files:**
- Modify: `src/components/player-hud/ForcePanel.tsx:55-61`

- [ ] **Step 1: Open `src/components/player-hud/ForcePanel.tsx` and locate the `ConflictEntry` interface (around line 55)**

It currently reads:
```ts
export interface ConflictEntry {
  id:            string
  description?:  string
  session_label?: string
  is_resolved:   boolean
  created_at:    string
}
```

- [ ] **Step 2: Add the two new optional fields**

Replace the interface with:
```ts
export interface ConflictEntry {
  id:                   string
  description?:         string
  narrative?:           string
  session_label?:       string
  is_resolved:          boolean
  player_acknowledged?: boolean
  created_at:           string
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no new errors introduced by this change.

- [ ] **Step 4: Commit**

```bash
git add src/components/player-hud/ForcePanel.tsx
git commit -m "feat(types): extend ConflictEntry with narrative and player_acknowledged"
```

---

## Task 3: Extend `useCharacterConflicts`

**Files:**
- Modify: `src/hooks/useCharacterConflicts.ts`

- [ ] **Step 1: Open `src/hooks/useCharacterConflicts.ts`**

It currently reads:
```ts
'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'

export function useCharacterConflicts(
  characterId: string | undefined,
  supabase: SupabaseClient,
) {
  const [conflicts, setConflicts] = useState<ConflictEntry[]>([])

  useEffect(() => {
    if (!characterId) return
    supabase
      .from('character_conflicts')
      .select('id, description, session_label, is_resolved, created_at')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as ConflictEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  return { conflicts, setConflicts }
}
```

- [ ] **Step 2: Replace the entire file**

```ts
'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'

export function useCharacterConflicts(
  characterId: string | undefined,
  supabase: SupabaseClient,
) {
  const [conflicts, setConflicts] = useState<ConflictEntry[]>([])

  useEffect(() => {
    if (!characterId) return
    supabase
      .from('character_conflicts')
      .select('id, description, narrative, session_label, is_resolved, player_acknowledged, created_at')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as ConflictEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  const pendingConflicts = conflicts
    .filter(c => c.player_acknowledged === false)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return { conflicts, setConflicts, pendingConflicts }
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. The new `pendingConflicts` return is additive; existing destructuring `const { conflicts } = useCharacterConflicts(...)` is unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCharacterConflicts.ts
git commit -m "feat(hook): extend useCharacterConflicts with pendingConflicts derived value"
```

---

## Task 4: New Hook — `useGmCampaignConflicts`

**Files:**
- Create: `src/hooks/useGmCampaignConflicts.ts`

- [ ] **Step 1: Create the file**

```ts
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GmConflictRow {
  id:           string
  character_id: string
  description:  string
  narrative?:   string
  created_at:   string
}

export function useGmCampaignConflicts(
  campaignId: string,
  forceSensitiveCharIds: string[],
) {
  const supabase = useMemo(() => createClient(), [])
  const [conflicts, setConflicts] = useState<GmConflictRow[]>([])

  const charIdsKey = forceSensitiveCharIds.join(',')

  useEffect(() => {
    if (!forceSensitiveCharIds.length) {
      setConflicts([])
      return
    }

    supabase
      .from('character_conflicts')
      .select('id, character_id, description, narrative, created_at')
      .in('character_id', forceSensitiveCharIds)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as GmConflictRow[]) })

    const channel = supabase
      .channel(`gm-campaign-conflicts-${campaignId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'character_conflicts', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as GmConflictRow
          if (forceSensitiveCharIds.includes(row.character_id)) {
            setConflicts(prev => [row, ...prev])
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, charIdsKey])

  return { conflicts }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGmCampaignConflicts.ts
git commit -m "feat(hook): add useGmCampaignConflicts for GM active-conflict list"
```

---

## Task 5: `AddConflictModal` Component

**Files:**
- Create: `src/components/gm/AddConflictModal.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import type { Character } from '@/lib/types'
import { FONT_BODY, RADIUS } from '@/lib/tokens'

const PURPLE    = '#9060D0'
const PURPLE_BG = 'rgba(144,96,208,0.12)'
const PURPLE_BD = 'rgba(144,96,208,0.4)'

const fieldLabel: React.CSSProperties = {
  fontFamily:    FONT_BODY,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'rgba(150,168,180,0.5)',
  marginBottom:  4,
}

const darkInput: React.CSSProperties = {
  background:   'rgba(0,0,0,0.4)',
  border:       '1px solid var(--hud-border-hi)',
  color:        'var(--hud-text)',
  fontFamily:   FONT_BODY,
  padding:      '6px 10px',
  borderRadius: RADIUS.sm,
  outline:      'none',
  fontSize:     'var(--text-sm)',
  width:        '100%',
  boxSizing:    'border-box' as const,
}

interface AddConflictModalProps {
  open:       boolean
  onClose:    () => void
  campaignId: string
  characters: Character[]
}

export function AddConflictModal({ open, onClose, campaignId, characters }: AddConflictModalProps) {
  const supabase      = useMemo(() => createClient(), [])
  const forceChars    = characters.filter(c => c.is_force_sensitive)

  const [charId,    setCharId]    = useState('')
  const [type,      setType]      = useState('')
  const [narrative, setNarrative] = useState('')
  const [busy,      setBusy]      = useState(false)

  function handleClose() {
    setCharId('')
    setType('')
    setNarrative('')
    onClose()
  }

  async function handleAdd() {
    if (!charId || !type || busy) return
    setBusy(true)
    const { error } = await supabase.from('character_conflicts').insert({
      character_id:        charId,
      campaign_id:         campaignId,
      description:         type,
      narrative:           narrative.trim() || null,
      session_label:       new Date().toISOString().slice(0, 10),
      is_resolved:         false,
      player_acknowledged: false,
    })
    setBusy(false)
    if (!error) handleClose()
  }

  const canAdd = !!charId && !!type.trim() && !busy

  return (
    <Modal open={open} onClose={handleClose} maxWidth={440} borderColor={PURPLE_BD}>
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: PURPLE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Add Conflict
        </div>

        <div>
          <div style={fieldLabel}>Character</div>
          <select value={charId} onChange={e => setCharId(e.target.value)} style={darkInput}>
            <option value="">Select character...</option>
            {forceChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <div style={fieldLabel}>Type</div>
          <input
            type="text"
            placeholder="e.g. Murder, Coercion, Betrayal"
            value={type}
            onChange={e => setType(e.target.value)}
            style={darkInput}
          />
        </div>

        <div>
          <div style={fieldLabel}>Description (optional)</div>
          <textarea
            placeholder="Narrative detail..."
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            rows={3}
            style={{ ...darkInput, resize: 'vertical' }}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          style={{
            height:        36,
            borderRadius:  RADIUS.sm,
            background:    canAdd ? PURPLE_BG : 'transparent',
            border:        `1px solid ${PURPLE_BD}`,
            fontFamily:    FONT_BODY,
            fontSize:      'var(--text-caption)',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         canAdd ? PURPLE : 'rgba(144,96,208,0.35)',
            cursor:        canAdd ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Adding...' : 'Add Conflict'}
        </button>

      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/gm/AddConflictModal.tsx
git commit -m "feat(gm): add AddConflictModal component"
```

---

## Task 6: Restructure GM Force Tab in `GmToolsPanel`

**Files:**
- Modify: `src/app/gm/panels/GmToolsPanel.tsx`

- [ ] **Step 1: Add imports at the top of the file**

After the existing import block (after line 17 `import type { useGmCharacterActions } from '@/hooks/useGmCharacterActions'`), add:

```ts
import { AddConflictModal } from '@/components/gm/AddConflictModal'
import { useGmCampaignConflicts } from '@/hooks/useGmCampaignConflicts'
```

> `useState` and `useMemo` are already imported at line 3 — do not duplicate them.

- [ ] **Step 2: Add `addConflictOpen` state and derived values inside `GmToolsPanel`**

After the existing `const [lootModalOpen, setLootModalOpen] = useState(false)` line (around line 128), add:

```ts
const [addConflictOpen, setAddConflictOpen] = useState(false)

const forceSensitiveCharIds = useMemo(
  () => activeChars.filter(c => c.is_force_sensitive).map(c => c.id),
  [activeChars],
)

const { conflicts: campaignConflicts } = useGmCampaignConflicts(campaignId, forceSensitiveCharIds)

const charNameMap = useMemo(
  () => Object.fromEntries(activeChars.map(c => [c.id, c.name])),
  [activeChars],
)

const hasForceSensitive = forceSensitiveCharIds.length > 0
```

- [ ] **Step 3: Replace the Force tab content block**

Find the existing force tab block (around line 396):
```tsx
{/* ── Force ── */}
{activeTab === 'force' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {pending.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No pending Force notifications.</div>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: PURPLE, marginTop: 4, opacity: 0.6 }}>Dark side use will appear here in real time.</div>
      </div>
    ) : (
      (forceNotifications as { id: string; character_id: string; status: string }[])
        .filter(n => n.status === 'pending')
        .map(n => (
          <ForceNotificationCard
            key={n.id}
            notification={n as never}
            isFallen={false}
            onAcknowledged={id => setForceNotifications(prev => (prev as { id: string }[]).filter(x => x.id !== id) as never)}
          />
        ))
    )}
  </div>
)}
```

Replace it with:
```tsx
{/* ── Force ── */}
{activeTab === 'force' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* Add Conflict button */}
    <button
      onClick={() => setAddConflictOpen(true)}
      disabled={!hasForceSensitive}
      title={hasForceSensitive ? undefined : 'No force-sensitive characters in this campaign'}
      style={{
        width:         '100%',
        height:        36,
        borderRadius:  3,
        background:    hasForceSensitive ? 'rgba(144,96,208,0.12)' : 'transparent',
        border:        '1px solid rgba(144,96,208,0.35)',
        fontFamily:    FONT,
        fontSize:      'var(--text-caption)',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         hasForceSensitive ? PURPLE : 'rgba(144,96,208,0.3)',
        cursor:        hasForceSensitive ? 'pointer' : 'not-allowed',
      }}
    >
      + Add Conflict
    </button>

    {/* Force notifications section */}
    <div>
      <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
        Force Notifications
      </div>
      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No pending Force notifications.</div>
          <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: PURPLE, marginTop: 4, opacity: 0.6 }}>Dark side use will appear here in real time.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(forceNotifications as { id: string; character_id: string; status: string }[])
            .filter(n => n.status === 'pending')
            .map(n => (
              <ForceNotificationCard
                key={n.id}
                notification={n as never}
                isFallen={false}
                onAcknowledged={id => setForceNotifications(prev => (prev as { id: string }[]).filter(x => x.id !== id) as never)}
              />
            ))}
        </div>
      )}
    </div>

    {/* Active conflicts section */}
    <div>
      <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
        Active Conflicts
      </div>
      {campaignConflicts.length === 0 ? (
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No active conflicts.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {campaignConflicts.map(c => (
            <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(144,96,208,0.06)', border: '1px solid rgba(144,96,208,0.2)', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)' }}>
                  {charNameMap[c.character_id] ?? 'Unknown'}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>
                  {c.created_at.slice(0, 10)}
                </span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: PURPLE }}>
                {c.description}
              </div>
              {c.narrative && (
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.narrative}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

  </div>
)}
```

- [ ] **Step 4: Add `AddConflictModal` render at the bottom of the component return**

Find the closing section near the end of the component (after the `LootAwardModal` closing tag, before the final `</div>` of the component):

```tsx
      {lootAwardItem && (
        <LootAwardModal
          ...
        />
      )}
    </div>  {/* ← closing div of the component */}
```

Add after the `LootAwardModal` block and before that final closing `</div>`:

```tsx
      <AddConflictModal
        open={addConflictOpen}
        onClose={() => setAddConflictOpen(false)}
        campaignId={campaignId}
        characters={activeChars}
      />
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/gm/panels/GmToolsPanel.tsx
git commit -m "feat(gm): restructure Force tab — Add Conflict button + active conflicts list"
```

---

## Task 7: Player Conflict Notification in `PlayerHUDDesktop`

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

- [ ] **Step 1: Add new imports**

At the top of the file, after the existing import block, add:

```ts
import { Modal } from '@/components/ui/Modal'
import { FONT_BODY, RADIUS, Z } from '@/lib/tokens'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'
```

- [ ] **Step 2: Update the `useCharacterConflicts` destructuring**

Find (around line 222):
```ts
const { conflicts } = useCharacterConflicts(character?.id, supabase)
```

Replace with:
```ts
const { conflicts, pendingConflicts } = useCharacterConflicts(character?.id, supabase)
```

- [ ] **Step 3: Add `conflictQueue` state and `ackBusy` flag**

After the `useCharacterConflicts` line, add:

```ts
const [conflictQueue, setConflictQueue] = useState<ConflictEntry[]>([])
const [ackBusy,       setAckBusy]       = useState(false)
const conflictSeeded                    = useRef(false)
```

> `useRef` is already imported (line 3). `useState` is already imported.

- [ ] **Step 4: Add effect to seed the conflict queue on first load**

After the existing `useEffect` that prompts for unresolved Dedication purchases (around line 228), add:

```ts
// Seed the conflict notification queue once on mount from unacknowledged DB rows
useEffect(() => {
  if (conflictSeeded.current || !pendingConflicts.length) return
  conflictSeeded.current = true
  setConflictQueue(pendingConflicts)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [pendingConflicts])
```

- [ ] **Step 5: Add the acknowledge handler**

After the `handleLogout` function (around line 260), add:

```ts
async function acknowledgeConflict(id: string) {
  setAckBusy(true)
  await supabase
    .from('character_conflicts')
    .update({ player_acknowledged: true })
    .eq('id', id)
  setAckBusy(false)
  setConflictQueue(prev => prev.filter(c => c.id !== id))
}
```

- [ ] **Step 6: Add the notification modal to the render output**

Find the Critical Injury modal block (around line 339):
```tsx
      {/* Critical Injury Roll Modal — shown when GM sends a crit request */}
      {pendingCritRequest && (
        <CriticalInjuryModal .../>
      )}
```

Immediately after this block, add:

```tsx
      {/* Conflict notification — shown for unacknowledged GM-assigned conflicts */}
      {conflictQueue.length > 0 && (
        <Modal
          open
          zIndex={Z.modal + 10}
          borderColor="rgba(144,96,208,0.5)"
          shadow="0 0 32px rgba(144,96,208,0.25)"
        >
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: '#9060D0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ⚠ Conflict Gained
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)', lineHeight: 1.3 }}>
              {conflictQueue[0].description}
            </div>
            {conflictQueue[0].narrative && (
              <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', color: 'var(--hud-text-dim)', lineHeight: 1.55 }}>
                {conflictQueue[0].narrative}
              </div>
            )}
            <button
              onClick={() => acknowledgeConflict(conflictQueue[0].id)}
              disabled={ackBusy}
              style={{
                height:        36,
                borderRadius:  RADIUS.sm,
                background:    ackBusy ? 'transparent' : 'rgba(144,96,208,0.12)',
                border:        '1px solid rgba(144,96,208,0.4)',
                fontFamily:    FONT_BODY,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         ackBusy ? 'rgba(144,96,208,0.35)' : '#9060D0',
                cursor:        ackBusy ? 'not-allowed' : 'pointer',
              }}
            >
              {ackBusy ? 'Saving...' : 'Acknowledge'}
            </button>
          </div>
        </Modal>
      )}
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(player): add conflict notification queue — modal on login for unacknowledged conflicts"
```

---

## Task 8: Update `docs/architecture.md`

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 1: Add `useGmCampaignConflicts` to the Custom Hooks section**

Find the `useCharacterConflicts` hook entry (around line 212) and add directly after it:

```markdown
### `useGmCampaignConflicts(campaignId, forceSensitiveCharIds)`
- Loads all unresolved (`is_resolved = false`) `character_conflicts` for a set of force-sensitive character IDs
- State: `conflicts: GmConflictRow[]` — each row has `id`, `character_id`, `description`, `narrative?`, `created_at`
- Realtime: subscribes to INSERT on `character_conflicts` filtered by `campaign_id`; prepends new rows live
- Returns empty array immediately when `forceSensitiveCharIds` is empty (no query fired)
- Returns: `{ conflicts }`
```

- [ ] **Step 2: Add `AddConflictModal` to the Tier 2 / Feature Panels section**

Find the GM HUD Sub-components entry (around line 353) and add `AddConflictModal` to the list of components in `src/components/gm/`:

```markdown
- `AddConflictModal` — GM modal for manual conflict entry; filters to force-sensitive characters only; inserts to `character_conflicts` with `player_acknowledged = false`
```

- [ ] **Step 3: Add migration 054 to the Migration History table**

Find the migration history table (around line 447) and add:

```markdown
| 054 | `character_conflicts` — `player_acknowledged` (delivery flag) + `narrative` (body text) |
```

- [ ] **Step 4: Update the `character_conflicts` table entry in the Data Layer section**

Find `character_conflicts` in the Supabase Tables section (around line 246):

```markdown
- `character_conflicts` — Force-user morality conflict log (description, session_label, is_resolved)
```

Replace with:

```markdown
- `character_conflicts` — Force-user morality conflict log; `description` = type label; `narrative` = optional body; `player_acknowledged` = false until player dismisses notification
```

- [ ] **Step 5: Commit**

```bash
git add docs/architecture.md
git commit -m "docs(arch): document conflict mechanism — hook, component, migration 054"
```

---

## Verification Checklist

After all tasks complete, manually verify these flows in the browser:

- [ ] **GM adds conflict:** Open GM Tools → Force tab → click "Add Conflict" → modal opens → select a force-sensitive character → fill in Type + optional Description → click "Add Conflict" → modal closes → new card appears in "Active Conflicts" list below
- [ ] **GM disabled state:** If no force-sensitive characters in campaign, "Add Conflict" button is visually disabled and shows tooltip
- [ ] **Player notification:** Log in as the affected character → conflict notification modal appears immediately → shows type prominently + description body if present → click "Acknowledge" → modal disappears (or advances to next if multiple pending)
- [ ] **Multiple conflicts:** GM adds two conflicts for same character → player sees modal 1, acknowledges → modal 2 surfaces → acknowledges → no more modals
- [ ] **Already-acknowledged:** Refresh the player page → no modal appears for previously acknowledged conflicts
- [ ] **Pre-existing data:** Existing conflict rows from before this feature (backfilled with `player_acknowledged = TRUE`) do not trigger the modal
