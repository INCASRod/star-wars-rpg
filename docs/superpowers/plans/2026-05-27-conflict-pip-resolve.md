# Conflict Pip Resolve Action Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline resolve action to `GmConflictPip` that mirrors the `CriticalInjuryPip` heal flow — click the pip to open a custom popup with conflict details and a "✓ Resolve Conflict" button that enters a confirm step before marking the conflict resolved.

**Architecture:** Four sequential tasks. `useGmCampaignConflicts` exposes `setConflicts` for optimistic updates. A new `resolveConflict` action in `useGmCharacterActions` (parallel to `healCritInjury`) handles the DB write, optimistic removal, and player toast. `GmConflictPip` is rewritten from a passive `<Tooltip>` wrapper into a self-contained interactive popup component (matching `CriticalInjuryPip`'s pattern) with purple accent colors. The new prop threads from `GmShell` → `GmPartyPanel` → `GmPartyMiniCard` → `GmConflictPip`.

**Tech Stack:** React/Next.js, TypeScript, Supabase, project tokens (`@/lib/tokens`), no new dependencies.

---

## File Map

| Status | File | What changes |
|--------|------|--------------|
| Modify | `src/hooks/useGmCampaignConflicts.ts` | Expose `setConflicts` in return value |
| Modify | `src/hooks/useGmCharacterActions.ts` | Add `conflicts`/`setConflicts` params; add `resolveConflict` action |
| Rewrite | `src/components/gm/GmConflictPip.tsx` | Replace `<Tooltip>` with interactive custom popup; add `onResolve` prop |
| Modify | `src/app/gm/panels/GmPartyMiniCard.tsx` | Add `onResolveConflict?` prop; pass to `GmConflictPip` |
| Modify | `src/app/gm/panels/GmPartyPanel.tsx` | Add `onResolveConflict` prop; pass down |
| Modify | `src/app/gm/GmShell.tsx` | Destructure `setConflicts`; wire `conflicts`/`setConflicts` into charActions; pass `resolveConflict` to `GmPartyPanel` |

---

## Task 1: Expose `setConflicts` from `useGmCampaignConflicts`

**Files:**
- Modify: `src/hooks/useGmCampaignConflicts.ts`

Currently `useGmCampaignConflicts` returns only `{ conflicts }`. The `resolveConflict` action (Task 2) needs to remove a resolved entry optimistically, so the setter must be exposed.

- [ ] **Step 1: Update the return statement**

In `src/hooks/useGmCampaignConflicts.ts`, find the return statement (line 56):

```ts
return { conflicts }
```

Change to:

```ts
return { conflicts, setConflicts }
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: one error in `GmShell.tsx` where `setConflicts` is not yet destructured — that's expected and will be fixed in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGmCampaignConflicts.ts
git commit -m "feat(gm): expose setConflicts from useGmCampaignConflicts"
```

---

## Task 2: Add `resolveConflict` to `useGmCharacterActions`

**Files:**
- Modify: `src/hooks/useGmCharacterActions.ts`

Adds a `resolveConflict(conflictId)` action parallel to `healCritInjury`. It scans the `conflicts` array to find `character_id`, writes `is_resolved = true` to Supabase, removes the entry from state, and sends a player toast.

- [ ] **Step 1: Add `GmConflictRow` import**

At the top of `src/hooks/useGmCharacterActions.ts`, add to the imports:

```ts
import type { GmConflictRow } from './useGmCampaignConflicts'
```

The existing imports at lines 1–8 will look like:

```ts
'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { archiveCharacter, restoreCharacter } from '@/lib/characters'
import type { Character, CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'
import type { RefMorality } from './useGmData'
import type { GmConflictRow } from './useGmCampaignConflicts'
```

- [ ] **Step 2: Add `resolveConflict` to `UseGmCharacterActionsReturn`**

In the `UseGmCharacterActionsReturn` interface (starting at line 16), add after `healCritInjury`:

```ts
resolveConflict: (conflictId: string) => Promise<void>
```

- [ ] **Step 3: Add `conflicts` and `setConflicts` to the params type**

In the `useGmCharacterActions(params: {...})` signature (around line 92), add after `setCharCrits`:

```ts
conflicts:    GmConflictRow[]
setConflicts: React.Dispatch<React.SetStateAction<GmConflictRow[]>>
```

- [ ] **Step 4: Destructure the new params**

In the destructure block inside the function body (around line 112), add `conflicts, setConflicts,` after `charCrits, setCharCrits,`:

```ts
const {
  campaignId, characters, activeChars, setCharacters,
  charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
  charCrits, setCharCrits,
  conflicts, setConflicts,
  activeSessions, setActiveSessions,
  moralityStrengths, moralityWeaknesses,
  notify, sendToChar, flash, flashError,
} = params
```

- [ ] **Step 5: Implement `resolveConflict`**

Find `healCritInjury` (around line 358). Add `resolveConflict` immediately after it (before `selectAddCritRef`):

```ts
const resolveConflict = useCallback(async (conflictId: string) => {
  let foundCharId: string | undefined
  for (const c of conflicts) {
    if (c.id === conflictId) { foundCharId = c.character_id; break }
  }
  if (!foundCharId) return
  const charId = foundCharId
  const { error } = await supabase
    .from('character_conflicts')
    .update({ is_resolved: true })
    .eq('id', conflictId)
  if (error) { flashError('Failed to resolve conflict: ' + error.message); return }
  setConflicts(prev => prev.filter(c => c.id !== conflictId))
  notify(charId, 'toast', 'Conflict resolved')
}, [conflicts, setConflicts, supabase, notify, flashError])
```

- [ ] **Step 6: Add `resolveConflict` to the return statement**

Find the return object at the bottom of `useGmCharacterActions`. Add `resolveConflict` alongside `healCritInjury`:

```ts
sendCritRequest, confirmCritResult, cancelCritResult, overrideCritResult, healCrit, healCritInjury, resolveConflict,
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors in `GmShell.tsx` about missing `conflicts`/`setConflicts` in charActions params — these will be fixed in Task 4.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useGmCharacterActions.ts
git commit -m "feat(gm): add resolveConflict action to useGmCharacterActions"
```

---

## Task 3: Rewrite `GmConflictPip` with interactive popup

**Files:**
- Rewrite: `src/components/gm/GmConflictPip.tsx`

Replaces the passive `<Tooltip>` wrapper with a self-contained interactive popup component. Mirrors `CriticalInjuryPip` exactly — position:fixed popup with click-away backdrop, close button, and a two-step resolve flow — but uses purple accent colors throughout.

- [ ] **Step 1: Replace the full file content**

Write `src/components/gm/GmConflictPip.tsx` with:

```tsx
'use client'

import React, { useRef, useState } from 'react'
import { FONT_BODY as FONT } from '@/lib/tokens'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'

const TOOLTIP_W = 240

interface TooltipPos {
  left:    number
  openUp:  boolean
  anchorY: number
  vh:      number
}

interface GmConflictPipProps {
  conflict:   GmConflictRow
  onResolve?: (id: string) => void
}

export function GmConflictPip({ conflict, onResolve }: GmConflictPipProps) {
  const [tooltipOpen, setTooltipOpen]           = useState(false)
  const [tipPos, setTipPos]                     = useState<TooltipPos>({ left: 0, openUp: true, anchorY: 0, vh: 0 })
  const [confirmingResolve, setConfirmingResolve] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    if (tooltipOpen) { setTooltipOpen(false); setConfirmingResolve(false); return }
    if (btnRef.current) {
      const r   = btnRef.current.getBoundingClientRect()
      const vw  = window.innerWidth
      const vh  = window.innerHeight
      const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8))
      const openUp = r.top >= 220
      setTipPos({ left, openUp, anchorY: openUp ? r.top : r.bottom, vh })
    }
    setTooltipOpen(true)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Purple circle pip */}
      <div
        ref={btnRef}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleToggle()}
        aria-label={conflict.description ?? 'Conflict'}
        style={{
          width:        10,
          height:       10,
          borderRadius: '50%',
          background:   'rgba(144,96,208,0.8)',
          border:       '1px solid rgba(144,96,208,0.4)',
          cursor:       'pointer',
          flexShrink:   0,
        }}
      />

      {tooltipOpen && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
            onClick={() => { setTooltipOpen(false); setConfirmingResolve(false) }}
          />
          <div style={{
            position:            'fixed',
            left:                tipPos.left,
            ...(tipPos.openUp
              ? { bottom: tipPos.vh - tipPos.anchorY + 10 }
              : { top: tipPos.anchorY + 10 }),
            zIndex:              210,
            width:               TOOLTIP_W,
            background:          'var(--hud-surface-hi)',
            backdropFilter:      'blur(14px)',
            WebkitBackdropFilter:'blur(14px)',
            border:              '1px solid rgba(144,96,208,0.35)',
            borderRadius:        8,
            padding:             '10px 12px',
            boxShadow:           '0 8px 24px rgba(0,0,0,0.8)',
          }}>
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setTooltipOpen(false); setConfirmingResolve(false) }}
              style={{
                position:   'absolute', top: 6, right: 6,
                background: 'none', border: 'none', padding: '2px 4px',
                cursor:     'pointer', lineHeight: 1,
                fontFamily: FONT, fontSize: '0.7rem',
                color:      'rgba(144,96,208,0.5)',
              }}
              aria-label="Close"
            >✕</button>

            {/* Category label */}
            <div style={{
              fontFamily:    FONT,
              fontSize:      'clamp(0.55rem, 0.85vw, 0.62rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color:         'rgba(144,96,208,0.8)',
              marginBottom:  3,
            }}>
              Conflict
            </div>

            {/* Description (title) */}
            <div style={{
              fontFamily:   FONT,
              fontSize:     'clamp(0.82rem, 1.3vw, 0.95rem)',
              color:        '#9060D0',
              fontWeight:   700,
              marginBottom: 6,
            }}>
              {conflict.description ?? 'Conflict'}
            </div>

            <div style={{ height: 1, background: 'rgba(144,96,208,0.2)', marginBottom: 6 }} />

            {/* Narrative */}
            {conflict.narrative && (
              <div style={{
                fontFamily:   FONT,
                fontSize:     'clamp(0.78rem, 1.2vw, 0.9rem)',
                color:        'var(--hud-text)',
                lineHeight:   1.5,
                marginBottom: 6,
              }}>
                {conflict.narrative}
              </div>
            )}

            {/* Session label */}
            {conflict.session_label && (
              <>
                <div style={{ height: 1, background: 'rgba(144,96,208,0.15)', marginBottom: 6 }} />
                <div style={{
                  fontFamily: FONT,
                  fontSize:   'clamp(0.52rem, 0.82vw, 0.6rem)',
                  color:      'var(--hud-text-faint)',
                }}>
                  {conflict.session_label}
                </div>
              </>
            )}

            {/* Resolve button — initial state */}
            {onResolve && !confirmingResolve && (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmingResolve(true) }}
                style={{
                  marginTop:     8,
                  width:         '100%',
                  background:    'rgba(144,96,208,0.1)',
                  border:        '1px solid rgba(144,96,208,0.3)',
                  borderRadius:  4,
                  padding:       '4px 0',
                  fontFamily:    FONT,
                  fontSize:      'clamp(0.7rem, 1.1vw, 0.8rem)',
                  fontWeight:    700,
                  letterSpacing: '0.08em',
                  color:         '#9060D0',
                  cursor:        'pointer',
                }}
              >
                ✓ Resolve Conflict
              </button>
            )}

            {/* Resolve button — confirm state */}
            {onResolve && confirmingResolve && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  fontFamily:   FONT,
                  fontSize:     'clamp(0.78rem, 1.2vw, 0.88rem)',
                  color:        'var(--hud-text)',
                  textAlign:    'center',
                  marginBottom: 6,
                }}>
                  Resolve <strong style={{ color: '#9060D0' }}>{conflict.description ?? 'this conflict'}</strong>?
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onResolve(conflict.id)
                      setTooltipOpen(false)
                      setConfirmingResolve(false)
                    }}
                    style={{
                      flex:         1,
                      padding:      '4px 0',
                      background:   'rgba(144,96,208,0.12)',
                      border:       '1px solid rgba(144,96,208,0.4)',
                      borderRadius: 3,
                      fontFamily:   FONT,
                      fontSize:     'clamp(0.7rem, 1.1vw, 0.78rem)',
                      fontWeight:   700,
                      color:        '#9060D0',
                      cursor:       'pointer',
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmingResolve(false) }}
                    style={{
                      flex:         1,
                      padding:      '4px 0',
                      background:   'transparent',
                      border:       '1px solid rgba(150,168,180,0.2)',
                      borderRadius: 3,
                      fontFamily:   FONT,
                      fontSize:     'clamp(0.7rem, 1.1vw, 0.78rem)',
                      fontWeight:   700,
                      color:        'rgba(150,168,180,0.5)',
                      cursor:       'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only in `GmShell.tsx` and `GmPartyMiniCard.tsx` about missing `onResolveConflict`/`resolveConflict` props — those are fixed in Task 4. No errors in `GmConflictPip.tsx` itself.

- [ ] **Step 3: Commit**

```bash
git add src/components/gm/GmConflictPip.tsx
git commit -m "feat(gm): rewrite GmConflictPip with interactive resolve popup"
```

---

## Task 4: Wire `resolveConflict` through GmPartyMiniCard, GmPartyPanel, and GmShell

**Files:**
- Modify: `src/app/gm/panels/GmPartyMiniCard.tsx`
- Modify: `src/app/gm/panels/GmPartyPanel.tsx`
- Modify: `src/app/gm/GmShell.tsx`

Threads the new prop from `GmShell` (where `resolveConflict` lives on `charActions`) down through the component tree to each `GmConflictPip`.

### GmPartyMiniCard

- [ ] **Step 1: Add `onResolveConflict` to Props**

In `src/app/gm/panels/GmPartyMiniCard.tsx`, find the `Props` interface and add after `onHealCrit?`:

```ts
interface Props {
  character:          Character
  onAddWound:         (id: string) => void
  onHealWound:        (id: string) => void
  onAddStrain:        (id: string) => void
  onHealStrain:       (id: string) => void
  onClick:            () => void
  crits?:             CharacterCriticalInjury[]
  conflicts?:         GmConflictRow[]
  onHealCrit?:        (id: string) => void
  onResolveConflict?: (id: string) => void
}
```

- [ ] **Step 2: Destructure and pass to GmConflictPip**

Update the function signature to destructure `onResolveConflict`:

```ts
export function GmPartyMiniCard({ character: c, onAddWound, onHealWound, onAddStrain, onHealStrain, onClick, crits, conflicts, onHealCrit, onResolveConflict }: Props) {
```

In the conflict pips section of the pip row (the `conflicts?.slice(0, 3).map(...)` block), pass the resolve handler:

```tsx
{conflicts?.slice(0, 3).map(con => (
  <GmConflictPip key={con.id} conflict={con} onResolve={onResolveConflict} />
))}
```

### GmPartyPanel

- [ ] **Step 3: Add `onResolveConflict` to GmPartyPanelProps**

In `src/app/gm/panels/GmPartyPanel.tsx`, add to `GmPartyPanelProps` after `onHealCrit`:

```ts
onResolveConflict: (id: string) => void
```

- [ ] **Step 4: Destructure and pass to GmPartyMiniCard**

Update the function signature:

```ts
export function GmPartyPanel({ campaignId, characters, charCrits, charConflicts, onHealCrit, onResolveConflict, ...cardCallbacks }: GmPartyPanelProps) {
```

Pass to each `GmPartyMiniCard`:

```tsx
<GmPartyMiniCard
  key={c.id}
  character={c}
  onAddWound={cardCallbacks.onAddWound}
  onHealWound={cardCallbacks.onHealWounds}
  onAddStrain={cardCallbacks.onAddStrain}
  onHealStrain={cardCallbacks.onHealStrain}
  crits={charCrits[c.id] ?? []}
  conflicts={charConflicts[c.id] ?? []}
  onHealCrit={onHealCrit}
  onResolveConflict={onResolveConflict}
  onClick={() => setSelectedId(c.id)}
/>
```

### GmShell

- [ ] **Step 5: Destructure `setConflicts` from `useGmCampaignConflicts`**

In `src/app/gm/GmShell.tsx`, find the hook call (around line 90):

```ts
const { conflicts } = useGmCampaignConflicts(campaignId ?? '', forceSensitiveCharIds)
```

Change to:

```ts
const { conflicts, setConflicts } = useGmCampaignConflicts(campaignId ?? '', forceSensitiveCharIds)
```

- [ ] **Step 6: Pass `conflicts` and `setConflicts` to `useGmCharacterActions`**

Find `useGmCharacterActions` call (around line 131) and add the two new params:

```ts
const charActions = useGmCharacterActions({
  campaignId, characters, activeChars, setCharacters,
  charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
  charCrits, setCharCrits,
  conflicts, setConflicts,
  activeSessions, setActiveSessions,
  moralityStrengths, moralityWeaknesses,
  notify, sendToChar, flash, flashError,
})
```

- [ ] **Step 7: Destructure `resolveConflict` from `charActions`**

Find the charActions destructure block (around line 238). Add `resolveConflict` to it:

```ts
const {
  addWound, healWounds, addStrain, healStrain,
  adjustObligation, adjustDuty, adjustMorality,
  openMoralitySetup,
  moralitySetup, setMoralitySetup, moralityBusy, handleMoralitySave,
  fallenConfirm, setFallenConfirm, fallenBusy, handleFallenToggle,
  archiveConfirm, setArchiveConfirm, archiveBusy,
  handleArchive,
  critReqOpenFor, setCritReqOpenFor,
  critReqVicious, setCritReqVicious,
  critReqLethal, setCritReqLethal,
  critReqGm, setCritReqGm,
  critReqBusy,
  sendCritRequest,
  addCritOpenFor,
  addCritRefId, addCritName, setAddCritName,
  addCritDesc, setAddCritDesc,
  addCritSeverity, addCritBusy,
  selectAddCritRef, closeAddCrit, addCriticalInjury,
  healCritInjury,
  resolveConflict,
} = charActions
```

- [ ] **Step 8: Pass `onResolveConflict` to `GmPartyPanel`**

Find the `GmPartyPanel` JSX (around line 349) and add:

```tsx
onResolveConflict={resolveConflict}
```

- [ ] **Step 9: Type-check the whole project**

```bash
npx tsc --noEmit
```

Expected: zero TypeScript errors.

- [ ] **Step 10: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000` and navigate to the GM view → Party panel. Verify:
1. Clicking a purple conflict pip opens a popup with purple border, conflict description, narrative (if any), session label (if any)
2. "✓ Resolve Conflict" button appears (only when handler provided)
3. Clicking it swaps to confirm view: "Resolve [description]?" + Confirm/Cancel buttons (purple)
4. Cancel restores the initial popup view
5. Confirm marks the conflict resolved — the pip disappears immediately (optimistic)
6. The player receives a toast notification: "Conflict resolved"
7. Characters with zero conflicts show no conflict pips (existing guard still works)
8. The injury pip popup is unchanged

- [ ] **Step 11: Commit**

```bash
git add src/app/gm/panels/GmPartyMiniCard.tsx src/app/gm/panels/GmPartyPanel.tsx src/app/gm/GmShell.tsx
git commit -m "feat(gm): wire resolveConflict through GmPartyPanel to GmConflictPip"
```

---

## Self-Review

**Spec coverage:**
- ✅ Same hover tooltip pattern as injury pips (custom position:fixed popup, click-away backdrop, close button)
- ✅ Purple matching border (`rgba(144,96,208,0.35)` on popup)
- ✅ "✓ Resolve Conflict" button — initial state
- ✅ Confirm step with "Resolve [description]?" and Confirm/Cancel
- ✅ Cancel restores initial view (`setConfirmingResolve(false)`)
- ✅ Confirm calls `onResolve(conflict.id)`, closes popup
- ✅ Optimistic removal from `conflicts` state via `setConflicts`
- ✅ Player toast via `notify(charId, 'toast', 'Conflict resolved')`
- ✅ Error case handled with `flashError`
- ✅ Data flows GmShell → GmPartyPanel → GmPartyMiniCard → GmConflictPip

**Type consistency:**
- `onResolve: (id: string) => void` in `GmConflictPip` props
- `onResolveConflict?: (id: string) => void` in `GmPartyMiniCard` props
- `onResolveConflict: (id: string) => void` in `GmPartyPanelProps`
- `resolveConflict: (conflictId: string) => Promise<void>` in `UseGmCharacterActionsReturn`
- All `string` IDs — consistent throughout

**No placeholders:** All steps contain exact code.
