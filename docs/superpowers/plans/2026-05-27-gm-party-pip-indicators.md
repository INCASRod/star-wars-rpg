# GM Party Pip Indicators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add at-a-glance critical injury and conflict pip indicators to each GM Party panel mini card, with hover tooltips and an inline heal confirm flow; upgrade the player-facing conflict pip tooltip from a browser `title` to the project's custom `<Tooltip>`.

**Architecture:** Eight sequential tasks, each touching one to two files. Data flows downward: `useGmData` and `useGmCampaignConflicts` feed `GmShell`, which passes shaped records to `GmPartyPanel` → `GmPartyMiniCard`. Confirmation state lives inside `CriticalInjuryPip`, keeping the heal flow self-contained.

**Tech Stack:** React/Next.js, TypeScript, Supabase (realtime), project tokens (`@/lib/tokens`), existing `<Tooltip>` component at `src/components/ui/Tooltip.tsx`.

---

## File Map

| Status | File | What changes |
|--------|------|------|
| Modify | `src/components/player-hud/ForcePanel.tsx` | Replace `title=` with `<Tooltip>` on conflict pips |
| Modify | `src/hooks/useGmData.ts` | Select full injury rows; add `charCrits` / `setCharCrits` |
| Modify | `src/hooks/useGmCampaignConflicts.ts` | Add `session_label` to type and query |
| Modify | `src/hooks/useGmCharacterActions.ts` | Add `healCritInjury`; accept `charCrits` / `setCharCrits` |
| Modify | `src/components/character/CriticalInjuryPip.tsx` | Add `confirmingHeal` state and confirm UI |
| **Create** | `src/components/gm/GmConflictPip.tsx` | New: purple pip with hover `<Tooltip>` |
| Modify | `src/app/gm/panels/GmPartyMiniCard.tsx` | Add pip row between strain bar and soak footer |
| Modify | `src/app/gm/panels/GmPartyPanel.tsx` | Thread `charCrits`, `charConflicts`, `onHealCrit` |
| Modify | `src/app/gm/panels/GmToolsPanel.tsx` | Accept `conflicts` prop; remove hook call |
| Modify | `src/app/gm/GmShell.tsx` | Lift conflicts hook; build charConflicts map; wire everything |

---

## Task 1: Upgrade conflict pip tooltip in ForcePanel

**Files:**
- Modify: `src/components/player-hud/ForcePanel.tsx`

The `ConflictPips` function (line ~276) renders each conflict pip with a `title={tooltip}` attribute. Replace with the `<Tooltip>` component.

- [ ] **Step 1: Add Tooltip import**

At the top of `src/components/player-hud/ForcePanel.tsx`, add after the existing imports:

```ts
import { Tooltip } from '@/components/ui/Tooltip'
```

- [ ] **Step 2: Replace title= with Tooltip wrapper**

Inside `ConflictPips`, replace the inner `conflicts.map(...)` block. The current code (around line 307–337):

```tsx
{conflicts.map((c, i) => {
  const baseDesc = c.description ?? `Conflict ${i + 1}${c.session_label ? ` — ${c.session_label}` : ''}`
  const tooltip  = isFallen && !c.is_resolved
    ? `Light Side Conflict\n─────────────────────\n${baseDesc}`
    : baseDesc
  return (
    <div
      key={c.id}
      title={tooltip}
      style={{
        width: 12, height: 12, borderRadius: '50%',
        background: c.is_resolved
          ? 'transparent'
          : isFallen
            ? 'rgba(220,230,240,0.85)'
            : 'rgba(224,58,30,0.9)',
        border: c.is_resolved
          ? `1px solid ${C.border}`
          : isFallen
            ? '1px solid rgba(200,215,230,0.9)'
            : '1px solid #E03A1E',
        boxShadow: c.is_resolved
          ? 'none'
          : isFallen
            ? '0 0 4px rgba(220,230,240,0.5)'
            : '0 0 4px rgba(224,58,30,0.5)',
        cursor: 'default',
      }}
    />
  )
})}
```

Replace with:

```tsx
{conflicts.map((c, i) => {
  const baseDesc = c.description ?? `Conflict ${i + 1}${c.session_label ? ` — ${c.session_label}` : ''}`
  const tipContent = (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.4 }}>
      {isFallen && !c.is_resolved && (
        <div style={{ color: 'rgba(220,230,240,0.55)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
          Light Side Conflict
        </div>
      )}
      <strong>{baseDesc}</strong>
      {c.session_label && <div style={{ color: 'var(--hud-text-dim)', fontSize: 10, marginTop: 2 }}>{c.session_label}</div>}
    </div>
  )
  return (
    <Tooltip key={c.id} content={tipContent} placement="top" maxWidth={200}>
      <div
        style={{
          width: 12, height: 12, borderRadius: '50%',
          background: c.is_resolved
            ? 'transparent'
            : isFallen
              ? 'rgba(220,230,240,0.85)'
              : 'rgba(224,58,30,0.9)',
          border: c.is_resolved
            ? `1px solid ${C.border}`
            : isFallen
              ? '1px solid rgba(200,215,230,0.9)'
              : '1px solid #E03A1E',
          boxShadow: c.is_resolved
            ? 'none'
            : isFallen
              ? '0 0 4px rgba(220,230,240,0.5)'
              : '0 0 4px rgba(224,58,30,0.5)',
          cursor: 'default',
        }}
      />
    </Tooltip>
  )
})}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors related to ForcePanel.

- [ ] **Step 4: Commit**

```bash
git add src/components/player-hud/ForcePanel.tsx
git commit -m "fix(hud): upgrade conflict pip tooltip from title= to Tooltip component"
```

---

## Task 2: Extend useGmData to load full crit injury rows

**Files:**
- Modify: `src/hooks/useGmData.ts`

Currently the query on line ~114 selects only `character_id`. We need full rows so we can pass them to the pip row.

- [ ] **Step 1: Add CharacterCriticalInjury import**

At the top of `src/hooks/useGmData.ts`, update the types import:

```ts
import type { Character, Campaign, RefDutyType, RefObligationType, CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'
```

- [ ] **Step 2: Add charCrits state**

After the `charActiveCritCounts` state declaration (around line 58), add:

```ts
const [charCrits, setCharCrits] = useState<Record<string, CharacterCriticalInjury[]>>({})
```

- [ ] **Step 3: Update UseGmDataReturn interface**

In the `UseGmDataReturn` interface (lines 15–41), add two new lines after `setCharActiveCritCounts`:

```ts
charCrits:               Record<string, CharacterCriticalInjury[]>
setCharCrits:            React.Dispatch<React.SetStateAction<Record<string, CharacterCriticalInjury[]>>>
```

- [ ] **Step 4: Update the crit injury query**

Find the crit injury query inside `loadData` (around line 114):

```ts
supabase.from('character_critical_injuries').select('character_id').in('character_id', chars.map(c => c.id)).eq('is_healed', false),
```

Change to:

```ts
supabase.from('character_critical_injuries').select('*').in('character_id', chars.map(c => c.id)).eq('is_healed', false).order('received_at', { ascending: true }),
```

- [ ] **Step 5: Update the aggregation loop**

Find the loop that sets `charActiveCritCounts` (around lines 124–129):

```ts
const critCounts: Record<string, number> = {}
for (const row of critsRes.data || []) {
  const r = row as { character_id: string }
  critCounts[r.character_id] = (critCounts[r.character_id] ?? 0) + 1
}
setCharActiveCritCounts(critCounts)
```

Replace with:

```ts
const critCounts: Record<string, number> = {}
const critMap: Record<string, CharacterCriticalInjury[]> = {}
for (const row of critsRes.data || []) {
  const r = row as CharacterCriticalInjury
  critCounts[r.character_id] = (critCounts[r.character_id] ?? 0) + 1
  ;(critMap[r.character_id] ??= []).push(r)
}
setCharActiveCritCounts(critCounts)
setCharCrits(critMap)
```

- [ ] **Step 6: Add charCrits / setCharCrits to the return statement**

At the bottom of `useGmData`, find the return object and add:

```ts
charCrits, setCharCrits,
```

alongside the existing `charActiveCritCounts, setCharActiveCritCounts,`.

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useGmData.ts
git commit -m "feat(gm): extend useGmData to return full charCrits map"
```

---

## Task 3: Add session_label to useGmCampaignConflicts

**Files:**
- Modify: `src/hooks/useGmCampaignConflicts.ts`

`GmConflictRow` is missing `session_label`, and the SELECT doesn't include it.

- [ ] **Step 1: Update GmConflictRow type**

Find the `GmConflictRow` interface (lines 6–12) and add `session_label`:

```ts
export interface GmConflictRow {
  id:            string
  character_id:  string
  description:   string
  narrative?:    string
  session_label?: string
  created_at:    string
}
```

- [ ] **Step 2: Update the SELECT query**

Find the query inside the `useEffect` (around line 31):

```ts
.select('id, character_id, description, narrative, created_at')
```

Change to:

```ts
.select('id, character_id, description, narrative, session_label, created_at')
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGmCampaignConflicts.ts
git commit -m "feat(gm): add session_label to GmConflictRow and conflict query"
```

---

## Task 4: Add healCritInjury to useGmCharacterActions

**Files:**
- Modify: `src/hooks/useGmCharacterActions.ts`

We need a `healCritInjury(injuryId)` action that finds the character internally from `charCrits`.

- [ ] **Step 1: Add CharacterCriticalInjury import**

At the top, add `CharacterCriticalInjury` to the types import:

```ts
import type { Character, CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'
```

- [ ] **Step 2: Add charCrits/setCharCrits to the params type**

In the `useGmCharacterActions` function signature's `params` object type (around line 91), add after `setCharActiveCritCounts`:

```ts
charCrits:    Record<string, CharacterCriticalInjury[]>
setCharCrits: React.Dispatch<React.SetStateAction<Record<string, CharacterCriticalInjury[]>>>
```

- [ ] **Step 3: Destructure the new params**

Inside the function body, find the destructure of `params` (around line 109):

```ts
const {
  campaignId, characters, activeChars, setCharacters,
  charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
  activeSessions, setActiveSessions,
  moralityStrengths, moralityWeaknesses,
  notify, sendToChar, flash, flashError,
} = params
```

Add `charCrits, setCharCrits,` to the destructure:

```ts
const {
  campaignId, characters, activeChars, setCharacters,
  charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
  charCrits, setCharCrits,
  activeSessions, setActiveSessions,
  moralityStrengths, moralityWeaknesses,
  notify, sendToChar, flash, flashError,
} = params
```

- [ ] **Step 4: Add healCritInjury to UseGmCharacterActionsReturn interface**

In the `UseGmCharacterActionsReturn` interface (around line 16), add after the `healCrit` line:

```ts
healCritInjury: (injuryId: string) => Promise<void>
```

- [ ] **Step 5: Implement healCritInjury**

In the "── Crit injury ──" section, just after the existing `healCrit` useCallback (around line 352), add:

```ts
const healCritInjury = useCallback(async (injuryId: string) => {
  let foundCharId: string | undefined
  for (const [cid, injuries] of Object.entries(charCrits)) {
    if (injuries.some(inj => inj.id === injuryId)) { foundCharId = cid; break }
  }
  if (!foundCharId) return
  const charId = foundCharId
  await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', injuryId)
  setCharCrits(prev => ({
    ...prev,
    [charId]: (prev[charId] ?? []).filter(inj => inj.id !== injuryId),
  }))
  setCharActiveCritCounts(prev => ({ ...prev, [charId]: Math.max(0, (prev[charId] ?? 1) - 1) }))
  notify(charId, 'toast', 'Critical injury healed')
}, [charCrits, setCharCrits, supabase, setCharActiveCritCounts, notify])
```

- [ ] **Step 6: Add healCritInjury to the return statement**

Find the return object at the bottom of the hook and add `healCritInjury` alongside `healCrit`:

```ts
sendCritRequest, confirmCritResult, cancelCritResult, overrideCritResult, healCrit, healCritInjury,
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors in `GmShell.tsx` about missing `charCrits`/`setCharCrits` — these will be fixed in Task 8.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useGmCharacterActions.ts
git commit -m "feat(gm): add healCritInjury action to useGmCharacterActions"
```

---

## Task 5: Add confirm step to CriticalInjuryPip

**Files:**
- Modify: `src/components/character/CriticalInjuryPip.tsx`

When `onHeal` is provided, clicking "✓ Heal Injury" should swap the tooltip content to a confirm prompt instead of immediately healing.

- [ ] **Step 1: Add confirmingHeal state**

Inside `CriticalInjuryPip` (after the existing `useState` calls around line 62), add:

```ts
const [confirmingHeal, setConfirmingHeal] = useState(false)
```

- [ ] **Step 2: Reset confirmingHeal when tooltip closes**

The close button's onClick (around line 130) currently is:
```tsx
onClick={(e) => { e.stopPropagation(); setTooltipOpen(false) }}
```

Change to:
```tsx
onClick={(e) => { e.stopPropagation(); setTooltipOpen(false); setConfirmingHeal(false) }}
```

The click-away backdrop's onClick (around line 109) currently is:
```tsx
onClick={() => setTooltipOpen(false)}
```

Change to:
```tsx
onClick={() => { setTooltipOpen(false); setConfirmingHeal(false) }}
```

- [ ] **Step 3: Replace the heal button with conditional confirm UI**

Find the heal button block (around lines 197–213):

```tsx
{onHeal && (
  <button
    onClick={(e) => { e.stopPropagation(); onHeal(pip.id); setTooltipOpen(false) }}
    style={{
      marginTop: 8, width: '100%',
      background: 'rgba(78,200,122,0.1)',
      border: '1px solid rgba(78,200,122,0.3)',
      borderRadius: 4, padding: '4px 0',
      fontFamily: FONT_R,
      fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
      fontWeight: 700, letterSpacing: '0.08em',
      color: '#4EC87A', cursor: 'pointer',
    }}
  >
    ✓ Heal Injury
  </button>
)}
```

Replace with:

```tsx
{onHeal && !confirmingHeal && (
  <button
    onClick={(e) => { e.stopPropagation(); setConfirmingHeal(true) }}
    style={{
      marginTop: 8, width: '100%',
      background: 'rgba(78,200,122,0.1)',
      border: '1px solid rgba(78,200,122,0.3)',
      borderRadius: 4, padding: '4px 0',
      fontFamily: FONT_R,
      fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
      fontWeight: 700, letterSpacing: '0.08em',
      color: '#4EC87A', cursor: 'pointer',
    }}
  >
    ✓ Heal Injury
  </button>
)}
{onHeal && confirmingHeal && (
  <div style={{ marginTop: 8 }}>
    <div style={{
      fontFamily: FONT_R,
      fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)',
      color: 'var(--hud-text)',
      textAlign: 'center',
      marginBottom: 6,
    }}>
      Heal <strong style={{ color: '#DC143C' }}>{pip.name}</strong>?
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onHeal(pip.id); setTooltipOpen(false); setConfirmingHeal(false) }}
        style={{
          flex: 1, padding: '4px 0',
          background: 'rgba(78,200,122,0.12)',
          border: '1px solid rgba(78,200,122,0.4)',
          borderRadius: 3,
          fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 1.1vw, 0.78rem)',
          fontWeight: 700, color: '#4EC87A', cursor: 'pointer',
        }}
      >
        Confirm
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setConfirmingHeal(false) }}
        style={{
          flex: 1, padding: '4px 0',
          background: 'transparent',
          border: '1px solid rgba(150,168,180,0.2)',
          borderRadius: 3,
          fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 1.1vw, 0.78rem)',
          fontWeight: 700, color: 'rgba(150,168,180,0.5)', cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors in CriticalInjuryPip.tsx.

- [ ] **Step 5: Commit**

```bash
git add src/components/character/CriticalInjuryPip.tsx
git commit -m "feat(gm): add inline heal confirm step to CriticalInjuryPip"
```

---

## Task 6: Create GmConflictPip component

**Files:**
- Create: `src/components/gm/GmConflictPip.tsx`

A read-only 10×10 purple circle wrapped in `<Tooltip>` showing description + session label.

- [ ] **Step 1: Create the file**

Create `src/components/gm/GmConflictPip.tsx` with:

```tsx
'use client'

import React from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import { FONT_BODY as FONT } from '@/lib/tokens'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'

interface GmConflictPipProps {
  conflict: GmConflictRow
}

export function GmConflictPip({ conflict }: GmConflictPipProps) {
  const tipContent = (
    <div style={{ fontFamily: FONT, fontSize: 11, lineHeight: 1.4 }}>
      <strong>{conflict.description ?? 'Conflict'}</strong>
      {conflict.session_label && (
        <div style={{ color: 'var(--hud-text-dim)', fontSize: 10, marginTop: 2 }}>
          {conflict.session_label}
        </div>
      )}
    </div>
  )

  return (
    <Tooltip content={tipContent} placement="top" maxWidth={180}>
      <div
        style={{
          width:       10,
          height:      10,
          borderRadius:'50%',
          background:  'rgba(144,96,208,0.8)',
          border:      '1px solid rgba(144,96,208,0.4)',
          cursor:      'default',
          flexShrink:  0,
        }}
      />
    </Tooltip>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors in GmConflictPip.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/components/gm/GmConflictPip.tsx
git commit -m "feat(gm): create GmConflictPip component"
```

---

## Task 7: Add pip row to GmPartyMiniCard

**Files:**
- Modify: `src/app/gm/panels/GmPartyMiniCard.tsx`

Add `crits`, `conflicts`, and `onHealCrit` props. Render a pip row between the strain section and soak footer.

- [ ] **Step 1: Update imports**

Replace the current imports at the top of `GmPartyMiniCard.tsx`:

```ts
'use client'

import type { Character, CharacterCriticalInjury } from '@/lib/types'
import { HUD, FONT_BODY as FONT } from '@/lib/tokens'
import { CriticalInjuryPip, normalizeSeverity, type CritPip } from '@/components/character/CriticalInjuryPip'
import { GmConflictPip } from '@/components/gm/GmConflictPip'
import { Tooltip } from '@/components/ui/Tooltip'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'
```

Remove the local `const FONT = 'var(--font-body)'` line — it is now imported from tokens.

- [ ] **Step 2: Update Props interface**

Replace the existing `interface Props` with:

```ts
interface Props {
  character:    Character
  onAddWound:   (id: string) => void
  onHealWound:  (id: string) => void
  onAddStrain:  (id: string) => void
  onHealStrain: (id: string) => void
  onClick:      () => void
  crits?:       CharacterCriticalInjury[]
  conflicts?:   GmConflictRow[]
  onHealCrit?:  (id: string) => void
}
```

- [ ] **Step 3: Update function signature**

```ts
export function GmPartyMiniCard({ character: c, onAddWound, onHealWound, onAddStrain, onHealStrain, onClick, crits, conflicts, onHealCrit }: Props) {
```

- [ ] **Step 4: Add OverflowBadge helper (before the main component)**

Insert before the `GmPartyMiniCard` function:

```tsx
function OverflowBadge({ color, count, items }: { color: string; count: number; items: string[] }) {
  return (
    <Tooltip
      content={
        <div style={{ fontFamily: FONT, fontSize: 10, lineHeight: 1.5 }}>
          {items.map((item, i) => <div key={i}>{item}</div>)}
        </div>
      }
      placement="top"
      maxWidth={180}
    >
      <span style={{
        fontFamily: FONT,
        fontSize: 'var(--text-caption)',
        color,
        fontWeight: 700,
        cursor: 'default',
        flexShrink: 0,
      }}>
        +{count}
      </span>
    </Tooltip>
  )
}
```

- [ ] **Step 5: Add the pip row between strain and soak sections**

Find the end of the strain section and the start of the soak section (currently):

```tsx
      {/* Soak */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
```

Insert the pip row JSX immediately before `{/* Soak */}`:

```tsx
      {/* Pip row: injuries left, conflicts right — hidden when both empty */}
      {((crits?.length ?? 0) > 0 || (conflicts?.length ?? 0) > 0) && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, marginTop: 4 }}
        >
          {/* Injury pips (max 3) */}
          {crits?.slice(0, 3).map(inj => {
            const pip: CritPip = {
              id:           inj.id,
              severity:     inj.severity,
              name:         inj.custom_name ?? 'Critical Injury',
              description:  inj.description,
              sessionLabel: inj.session_label ?? undefined,
              rollResult:   inj.roll_result,
            }
            return <CriticalInjuryPip key={inj.id} pip={pip} onHeal={onHealCrit} />
          })}
          {crits && crits.length > 3 && (
            <OverflowBadge
              color="#E05050"
              count={crits.length - 3}
              items={crits.slice(3).map(inj => inj.custom_name ?? 'Critical Injury')}
            />
          )}
          {/* Flex spacer */}
          <div style={{ flex: 1 }} />
          {/* Conflict pips (max 3) */}
          {conflicts?.slice(0, 3).map(con => (
            <GmConflictPip key={con.id} conflict={con} />
          ))}
          {conflicts && conflicts.length > 3 && (
            <OverflowBadge
              color="#9060D0"
              count={conflicts.length - 3}
              items={conflicts.slice(3).map(con => con.description ?? 'Conflict')}
            />
          )}
        </div>
      )}
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors in GmPartyMiniCard.tsx.

- [ ] **Step 7: Commit**

```bash
git add src/app/gm/panels/GmPartyMiniCard.tsx
git commit -m "feat(gm): add pip row to GmPartyMiniCard for injuries and conflicts"
```

---

## Task 8: Wire data through GmPartyPanel, GmToolsPanel, and GmShell

**Files:**
- Modify: `src/app/gm/panels/GmPartyPanel.tsx`
- Modify: `src/app/gm/panels/GmToolsPanel.tsx`
- Modify: `src/app/gm/GmShell.tsx`

This task threads `charCrits`, `charConflicts`, and `healCritInjury` from the data layer to the mini cards, and lifts the `useGmCampaignConflicts` hook from `GmToolsPanel` to `GmShell`.

### GmPartyPanel

- [ ] **Step 1: Add new props to GmPartyPanel**

In `src/app/gm/panels/GmPartyPanel.tsx`, add imports:

```ts
import type { CharacterCriticalInjury } from '@/lib/types'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'
```

Add to `GmPartyPanelProps` interface:

```ts
charCrits:    Record<string, CharacterCriticalInjury[]>
charConflicts: Record<string, GmConflictRow[]>
onHealCrit:   (id: string) => void
```

- [ ] **Step 2: Update GmPartyPanel function signature and mini card renders**

Add the new props to destructuring:

```ts
export function GmPartyPanel({ campaignId, characters, charCrits, charConflicts, onHealCrit, ...cardCallbacks }: GmPartyPanelProps) {
```

Pass them to each `GmPartyMiniCard`:

```tsx
{characters.map(c => (
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
    onClick={() => setSelectedId(c.id)}
  />
))}
```

### GmToolsPanel

- [ ] **Step 3: Remove useGmCampaignConflicts from GmToolsPanel**

In `src/app/gm/panels/GmToolsPanel.tsx`:

1. Remove the import: `import { useGmCampaignConflicts } from '@/hooks/useGmCampaignConflicts'`

2. Add import for the type: `import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'`

3. Add `conflicts: GmConflictRow[]` to `GmToolsPanelProps`:

```ts
export interface GmToolsPanelProps {
  campaignId:         string
  activeChars:        Character[]
  dutyTypes:          RefDutyType[]
  obligationTypes:    RefObligationType[]
  forceNotifications: unknown[]
  setForceNotifications: (fn: (prev: unknown[]) => unknown[]) => void
  handleCharacterUpdated: (id: string, updates: Partial<Character>) => void
  awards:      ReturnType<typeof useGmAwards>
  charActions: ReturnType<typeof useGmCharacterActions>
  loot:        ReturnType<typeof useGmLoot>
  sendToChar:  (charId: string, payload: Record<string, unknown>) => void
  conflicts:   GmConflictRow[]
}
```

4. Add `conflicts` to the function destructure:

```ts
export function GmToolsPanel({
  campaignId, activeChars, dutyTypes, obligationTypes,
  forceNotifications, setForceNotifications, handleCharacterUpdated,
  awards, charActions, loot, sendToChar, conflicts,
}: GmToolsPanelProps) {
```

5. Remove the two lines that called `useGmCampaignConflicts` and computed `forceSensitiveCharIds` for that purpose. Keep `forceSensitiveCharIds` for `hasForceSensitive`:

```ts
const forceSensitiveCharIds = useMemo(
  () => activeChars.filter(c => (c.force_rating ?? 0) > 0).map(c => c.id),
  [activeChars],
)
// (remove the useGmCampaignConflicts call — conflicts is now a prop)

const charNameMap = useMemo(
  () => Object.fromEntries(activeChars.map(c => [c.id, c.name])),
  [activeChars],
)

const hasForceSensitive = forceSensitiveCharIds.length > 0
```

6. Replace `campaignConflicts` references with `conflicts` throughout the file.

### GmShell

- [ ] **Step 4: Update useGmData destructure in GmShell**

In `src/app/gm/GmShell.tsx`, update the `useGmData` destructure (around line 70) to include:

```ts
charCrits, setCharCrits,
```

- [ ] **Step 5: Add imports**

Add at the top of `GmShell.tsx`:

```ts
import { useGmCampaignConflicts, type GmConflictRow } from '@/hooks/useGmCampaignConflicts'
```

- [ ] **Step 6: Add forceSensitiveCharIds and lift the conflicts hook**

After the `useGmBroadcast` call (around line 81), add:

```ts
const forceSensitiveCharIds = useMemo(
  () => activeChars.filter(c => (c.force_rating ?? 0) > 0).map(c => c.id),
  [activeChars],
)

const { conflicts } = useGmCampaignConflicts(campaignId ?? '', forceSensitiveCharIds)

const charConflicts = useMemo(
  () => conflicts.reduce<Record<string, GmConflictRow[]>>((acc, c) => {
    ;(acc[c.character_id] ??= []).push(c)
    return acc
  }, {}),
  [conflicts],
)
```

- [ ] **Step 7: Add charCrits / setCharCrits to useGmCharacterActions params**

Update the `useGmCharacterActions` call (around line 114):

```ts
const charActions = useGmCharacterActions({
  campaignId, characters, activeChars, setCharacters,
  charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
  charCrits, setCharCrits,
  activeSessions, setActiveSessions,
  moralityStrengths, moralityWeaknesses,
  notify, sendToChar, flash, flashError,
})
```

- [ ] **Step 8: Destructure healCritInjury from charActions**

In the charActions destructure (around line 238), add:

```ts
healCritInjury,
```

- [ ] **Step 9: Pass new props to GmPartyPanel**

In the `GmPartyPanel` JSX (around line 349), add:

```tsx
charCrits={charCrits}
charConflicts={charConflicts}
onHealCrit={healCritInjury}
```

- [ ] **Step 10: Pass conflicts prop to GmToolsPanel**

In the `GmToolsPanel` JSX (around line 334), add:

```tsx
conflicts={conflicts}
```

- [ ] **Step 11: Type-check the whole project**

```bash
npx tsc --noEmit
```

Expected: zero TypeScript errors.

- [ ] **Step 12: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000` and navigate to the GM view. Verify:
1. Party panel shows blood-drop pips for characters with active critical injuries
2. Hover over a crit pip shows tooltip with name, severity, description
3. Clicking a crit pip shows tooltip; clicking "✓ Heal Injury" swaps to confirm view; Cancel restores original; Confirm heals and pip disappears
4. Characters with conflicts show purple circle pips; hover shows tooltip with description and session label
5. A character with >3 injuries shows 3 pips + "+N" badge; hovering the badge lists overflow names
6. A character with >3 conflicts shows 3 pips + "+N" badge similarly
7. Characters with zero injuries and zero conflicts show no pip row
8. Player HUD Force tab: hovering conflict pips now shows the styled `<Tooltip>` instead of browser default tooltip

- [ ] **Step 13: Commit**

```bash
git add src/app/gm/panels/GmPartyPanel.tsx src/app/gm/panels/GmToolsPanel.tsx src/app/gm/GmShell.tsx
git commit -m "feat(gm): wire charCrits and charConflicts to GmPartyMiniCard pip row"
```

---

## Self-Review

**Spec coverage:**
- ✅ Pip row hidden when both crits and conflicts are zero (Task 7 `showRow` guard)
- ✅ Injury pips reuse `CriticalInjuryPip`, severity-shaded (Task 7)
- ✅ Conflict pips purple 10×10 circle (Task 6)
- ✅ Overflow cap at 3 + `+N` badge with tooltip (Task 7 `OverflowBadge`)
- ✅ Heal confirm inline in pip tooltip (Task 5)
- ✅ Cancel restores original view, Confirm calls `onHeal` (Task 5)
- ✅ `session_label` in conflict tooltip (Tasks 3, 6)
- ✅ `charCrits` and `charConflicts` flow from data layer to mini card (Tasks 2, 3, 8)
- ✅ `healCritInjury` optimistic update + player toast (Task 4)
- ✅ Player HUD conflict pip tooltip upgraded from `title=` (Task 1)

**Type consistency:** All tasks use `CharacterCriticalInjury` from `@/lib/types`, `GmConflictRow` from `@/hooks/useGmCampaignConflicts`, and `CritPip` from `@/components/character/CriticalInjuryPip`. `healCritInjury` is used everywhere `healCrit` would have been called from the mini card.

**No placeholders:** All steps include exact code.
