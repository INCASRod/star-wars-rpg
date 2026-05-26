# GM: Add Critical Injury Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "＋ Add Injury" button next to the existing crit roll button in the GM character card, letting the GM directly apply a critical injury (chosen from the ref table, with editable name/description) to a character and notify the player via a dialog modal.

**Architecture:** New state and action in `useGmCharacterActions` drives the GM form; a new `crit-injury-added` broadcast type flows to `usePlayerBroadcast` → `PlayerHUDDesktop` → `HudModalsOverlay` for the player dialog. Props thread down through `GmShell` → `GmPartyPanel` → `GmCharacterModal` (spread, no changes) → `GmCharacterCard`.

**Tech Stack:** Next.js 14, React, TypeScript, Supabase realtime broadcast, Sonner toasts.

**Spec:** `docs/superpowers/specs/2026-05-26-gm-add-critical-injury-design.md`

---

## File Map

| File | Change |
|---|---|
| `src/hooks/useGmCharacterActions.ts` | Add add-crit state, `selectAddCritRef`, `closeAddCrit`, `addCriticalInjury` |
| `src/hooks/usePlayerBroadcast.ts` | Add `crit-injury-added` handler + `gmCritInjuryDialog` state |
| `src/components/player-hud/HudModalsOverlay.tsx` | Add `gmCritInjuryDialog` props + render injury dialog |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | Destructure `gmCritInjuryDialog`/`setGmCritInjuryDialog` from broadcast, pass to overlay |
| `src/components/gm/GmCharacterCard.tsx` | Add new props to interface, two-button layout, add-injury inline form |
| `src/app/gm/panels/GmPartyPanel.tsx` | Extend `CardCallbacks` with new props |
| `src/app/gm/GmShell.tsx` | Destructure new charActions fields, create `handleAddCritOpen`, pass all to `GmPartyPanel` |

`GmCharacterModal.tsx` — **no changes needed** (uses `...cardProps` spread; new props flow through automatically).

---

## Task 1: Add add-crit state and action to `useGmCharacterActions`

**Files:**
- Modify: `src/hooks/useGmCharacterActions.ts`

- [ ] **Step 1: Add new fields to `UseGmCharacterActionsReturn` interface**

In `UseGmCharacterActionsReturn` (after the last crit injury line, around line 33), add:

```typescript
  // Add critical injury (direct apply)
  addCritOpenFor:    string | null
  setAddCritOpenFor: React.Dispatch<React.SetStateAction<string | null>>
  addCritRefId:      number | null
  addCritName:       string
  setAddCritName:    React.Dispatch<React.SetStateAction<string>>
  addCritDesc:       string
  setAddCritDesc:    React.Dispatch<React.SetStateAction<string>>
  addCritSeverity:   string
  addCritBusy:       boolean
  selectAddCritRef:  (refId: number) => void
  closeAddCrit:      () => void
  addCriticalInjury: (charId: string) => Promise<void>
```

- [ ] **Step 2: Add state variables**

After the existing `const [critCustomNames, setCritCustomNames]` line (around line 111), add:

```typescript
  const [addCritOpenFor,  setAddCritOpenFor]  = useState<string | null>(null)
  const [addCritRefId,    setAddCritRefId]    = useState<number | null>(null)
  const [addCritName,     setAddCritName]     = useState('')
  const [addCritDesc,     setAddCritDesc]     = useState('')
  const [addCritSeverity, setAddCritSeverity] = useState('')
  const [addCritBusy,     setAddCritBusy]     = useState(false)
```

- [ ] **Step 3: Add `selectAddCritRef` and `closeAddCrit` helpers**

After `const healCrit = ...` (around line 333), add:

```typescript
  const selectAddCritRef = useCallback((refId: number) => {
    const ref = refCritsDb.find(r => r.id === refId)
    if (!ref) return
    setAddCritRefId(refId)
    setAddCritName(ref.name)
    setAddCritDesc(ref.description ?? '')
    setAddCritSeverity(ref.severity)
  }, [refCritsDb])

  const closeAddCrit = useCallback(() => {
    setAddCritOpenFor(null)
    setAddCritRefId(null)
    setAddCritName('')
    setAddCritDesc('')
    setAddCritSeverity('')
  }, [])
```

- [ ] **Step 4: Add `addCriticalInjury` action**

Directly after `closeAddCrit`, add:

```typescript
  const addCriticalInjury = useCallback(async (charId: string) => {
    if (!addCritName.trim()) return
    setAddCritBusy(true)
    try {
      const { error } = await supabase.from('character_critical_injuries').insert({
        character_id: charId,
        injury_id:    addCritRefId ?? undefined,
        custom_name:  addCritName.trim(),
        severity:     addCritSeverity || 'Average',
        description:  addCritDesc.trim() || undefined,
        is_healed:    false,
        received_at:  new Date().toISOString(),
      })
      if (error) throw error
      setCharActiveCritCounts(prev => ({ ...prev, [charId]: (prev[charId] ?? 0) + 1 }))
      sendToChar(charId, {
        type:        'crit-injury-added',
        name:        addCritName.trim(),
        severity:    addCritSeverity || 'Average',
        description: addCritDesc.trim(),
      })
      flash('Critical injury applied!')
      closeAddCrit()
    } catch (err: unknown) {
      flashError('Failed to apply injury: ' + (err instanceof Error ? err.message : String(err)))
    }
    setAddCritBusy(false)
  }, [addCritName, addCritRefId, addCritSeverity, addCritDesc, sendToChar, flash, flashError, supabase, setCharActiveCritCounts, closeAddCrit])
```

- [ ] **Step 5: Add new fields to the `return` object**

In the `return { ... }` block at the bottom, after `healCrit,` add:

```typescript
    addCritOpenFor, setAddCritOpenFor,
    addCritRefId, addCritName, setAddCritName,
    addCritDesc, setAddCritDesc,
    addCritSeverity, addCritBusy,
    selectAddCritRef, closeAddCrit, addCriticalInjury,
```

- [ ] **Step 6: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no new errors relating to `useGmCharacterActions.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useGmCharacterActions.ts
git commit -m "feat(gm): add addCriticalInjury state and action to useGmCharacterActions"
```

---

## Task 2: Handle `crit-injury-added` in `usePlayerBroadcast`

**Files:**
- Modify: `src/hooks/usePlayerBroadcast.ts`

- [ ] **Step 1: Add `gmCritInjuryDialog` state**

After `const [gmDialog, setGmDialog]` (line 43), add:

```typescript
  const [gmCritInjuryDialog, setGmCritInjuryDialog] = useState<{ name: string; severity: string; description: string } | null>(null)
```

- [ ] **Step 2: Add `crit-injury-added` case in the broadcast handler**

In the `if/else if` chain inside `.on('broadcast', ...)`, add a new branch before the final `else` block (which sets `gmDialog`). The final `else` is at line 105–107. Insert before it:

```typescript
        } else if (payload.type === 'crit-injury-added') {
          setGmCritInjuryDialog({
            name:        payload.name        as string,
            severity:    payload.severity    as string,
            description: payload.description as string,
          })
```

- [ ] **Step 3: Export the new state**

In the `return { ... }` block (around line 114), after `gmDialog, setGmDialog,` add:

```typescript
    gmCritInjuryDialog, setGmCritInjuryDialog,
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePlayerBroadcast.ts
git commit -m "feat(player): handle crit-injury-added broadcast event"
```

---

## Task 3: Add injury dialog to `HudModalsOverlay`

**Files:**
- Modify: `src/components/player-hud/HudModalsOverlay.tsx`

- [ ] **Step 1: Add props to `HudModalsOverlayProps`**

In the `HudModalsOverlayProps` interface (around line 66, after `setGmDialog`), add:

```typescript
  gmCritInjuryDialog:    { name: string; severity: string; description: string } | null
  setGmCritInjuryDialog: (d: { name: string; severity: string; description: string } | null) => void
```

- [ ] **Step 2: Destructure the new props in the function signature**

Find the function signature starting at line 106. After `gmDialog, setGmDialog,` add:

```typescript
  gmCritInjuryDialog, setGmCritInjuryDialog,
```

- [ ] **Step 3: Add the dialog JSX**

Find the existing `{gmDialog && ( ... )}` block. After its closing `)}`, add:

```tsx
      {gmCritInjuryDialog && (
        <div
          onClick={() => setGmCritInjuryDialog(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 410,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--sand)',
              border: '2px solid rgba(220,20,60,0.55)',
              boxShadow: '0 0 40px rgba(220,20,60,0.2), 0 8px 48px rgba(0,0,0,.4)',
              padding: '28px 24px 20px',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)',
              fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(220,20,60,0.8)', marginBottom: '8px',
            }}>
              ⚠ Critical Injury Received
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '10px',
            }}>
              {gmCritInjuryDialog.name}
            </div>
            {gmCritInjuryDialog.severity && (
              <div style={{
                display: 'inline-block', marginBottom: '14px',
                background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.35)',
                padding: '2px 8px',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(220,20,60,0.85)',
              }}>
                {gmCritInjuryDialog.severity}
              </div>
            )}
            {gmCritInjuryDialog.description && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                color: 'var(--ink)', lineHeight: 1.65, marginBottom: '20px',
                borderLeft: '2px solid rgba(220,20,60,0.3)', paddingLeft: '10px',
              }}>
                {gmCritInjuryDialog.description}
              </div>
            )}
            <button
              onClick={() => setGmCritInjuryDialog(null)}
              style={{
                width: '100%',
                background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.4)',
                padding: '10px 0',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-label)',
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(220,20,60,0.9)', cursor: 'pointer',
              }}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: TypeScript errors for `HudModalsOverlay` callers that don't yet pass the new props. Those are fixed in Task 4.

- [ ] **Step 5: Commit**

```bash
git add src/components/player-hud/HudModalsOverlay.tsx
git commit -m "feat(player): add critical injury notification dialog to HudModalsOverlay"
```

---

## Task 4: Thread `gmCritInjuryDialog` through `PlayerHUDDesktop`

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

- [ ] **Step 1: Destructure `gmCritInjuryDialog` from the broadcast hook**

Find the destructuring of `usePlayerBroadcast` (around line 156). It currently reads:

```typescript
  const {
    broadcastSession, broadcastTransition,
    gmDialog, setGmDialog,
    lootReveal, setLootReveal,
    vendorOffer, setVendorOffer,
    initRoll, setInitRoll,
  } = usePlayerBroadcast({ ... })
```

Add `gmCritInjuryDialog, setGmCritInjuryDialog,` after `gmDialog, setGmDialog,`:

```typescript
  const {
    broadcastSession, broadcastTransition,
    gmDialog, setGmDialog,
    gmCritInjuryDialog, setGmCritInjuryDialog,
    lootReveal, setLootReveal,
    vendorOffer, setVendorOffer,
    initRoll, setInitRoll,
  } = usePlayerBroadcast({ ... })
```

- [ ] **Step 2: Pass the new props to `HudModalsOverlay`**

Find the `<HudModalsOverlay` JSX block (around line 712). After the `gmDialog={gmDialog}` / `setGmDialog={setGmDialog}` lines, add:

```tsx
        gmCritInjuryDialog={gmCritInjuryDialog}
        setGmCritInjuryDialog={setGmCritInjuryDialog}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(player): thread gmCritInjuryDialog to HudModalsOverlay"
```

---

## Task 5: Add new props and UI to `GmCharacterCard`

**Files:**
- Modify: `src/components/gm/GmCharacterCard.tsx`

- [ ] **Step 1: Add `RefCriticalInjury` to the import**

At line 6, change:

```typescript
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
```

to:

```typescript
import type { Character, RefCriticalInjury, RefDutyType, RefObligationType } from '@/lib/types'
```

- [ ] **Step 2: Add new props to `GmCharacterCardProps`**

In the `GmCharacterCardProps` interface (around line 73), after `onSendCritRequest`:

```typescript
  refCritsDb:         RefCriticalInjury[]
  addCritOpenFor:     string | null
  addCritRefId:       number | null
  addCritName:        string
  addCritDesc:        string
  addCritSeverity:    string
  addCritBusy:        boolean
  onAddCritOpen:      (charId: string) => void
  onAddCritClose:     () => void
  onSelectAddCritRef: (refId: number) => void
  onSetAddCritName:   React.Dispatch<React.SetStateAction<string>>
  onSetAddCritDesc:   React.Dispatch<React.SetStateAction<string>>
  onAddCritApply:     (charId: string) => Promise<void>
```

- [ ] **Step 3: Destructure new props in the function signature**

In `export function GmCharacterCard({ ... })` (around line 103), add after `onSendCritRequest,`:

```typescript
  refCritsDb,
  addCritOpenFor, addCritRefId, addCritName, addCritDesc, addCritSeverity, addCritBusy,
  onAddCritOpen, onAddCritClose, onSelectAddCritRef,
  onSetAddCritName, onSetAddCritDesc, onAddCritApply,
```

- [ ] **Step 4: Replace the crit section JSX**

Find the `{/* Critical Injury Request */}` block (around line 372–443). Replace the entire block:

```tsx
      {/* Critical Injury Actions */}
      <div style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
        {critReqOpenFor === c.id ? (
          /* ── Existing roll request form (unchanged) ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              ⚡ Crit Injury Roll
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
              <span>Existing injuries</span>
              <span style={{ color: RED, fontWeight: 700 }}>+{(charActiveCritCounts[c.id] ?? 0) * 10}</span>
            </div>
            <div style={rowCritStat}>
              <span>Vicious (ranks)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritVicious(v => Math.max(0, v - 1))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqVicious > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqVicious}</span>
                <button onClick={() => onSetCritVicious(v => v + 1)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={rowCritStat}>
              <span>Lethal Blows (ranks)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritLethal(v => Math.max(0, v - 1))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqLethal > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqLethal}</span>
                <button onClick={() => onSetCritLethal(v => v + 1)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={rowCritStat}>
              <span>Additional mod</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritGm(v => Math.max(0, v - 10))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqGm > 0 ? RED : DIM, minWidth: 24, textAlign: 'center' }}>{critReqGm}</span>
                <button onClick={() => onSetCritGm(v => v + 10)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Share Tech Mono',monospace", fontSize: FS_CAPTION, color: RED, fontWeight: 700, borderTop: `1px solid rgba(220,20,60,0.15)`, paddingTop: 4 }}>
              <span>Total modifier</span>
              <span>+{(charActiveCritCounts[c.id] ?? 0) * 10 + critReqVicious * 10 + critReqLethal * 10 + critReqGm}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                onClick={onCritClose}
                style={{ flex: 1, background: 'transparent', border: `1px solid rgba(100,100,100,0.25)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}
              >
                Cancel
              </button>
              <button
                onClick={() => onSendCritRequest(c.id)}
                disabled={critReqBusy}
                style={{ flex: 2, background: 'rgba(220,20,60,0.12)', border: `1px solid rgba(220,20,60,0.4)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', color: RED }}
              >
                {critReqBusy ? '…' : 'Send Roll Request'}
              </button>
            </div>
          </div>
        ) : addCritOpenFor === c.id ? (
          /* ── Add Critical Injury form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              ＋ Add Critical Injury
            </div>
            {/* Reference injury selector */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Reference injury</div>
              <select
                value={addCritRefId ?? ''}
                onChange={e => { if (e.target.value) onSelectAddCritRef(Number(e.target.value)) }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box',
                }}
              >
                <option value="">— select from ref table —</option>
                {refCritsDb.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.severity}</option>
                ))}
              </select>
            </div>
            {/* Severity badge (read-only, from ref) */}
            {addCritSeverity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Severity</span>
                <span style={{ background: 'rgba(220,20,60,0.15)', border: `1px solid rgba(220,20,60,0.35)`, borderRadius: 3, padding: '2px 6px', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: RED }}>
                  {addCritSeverity}
                </span>
              </div>
            )}
            {/* Editable name */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Injury name</div>
              <input
                value={addCritName}
                onChange={e => onSetAddCritName(e.target.value)}
                placeholder="e.g. Crippled Arm"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Editable description */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Description</div>
              <textarea
                value={addCritDesc}
                onChange={e => onSetAddCritDesc(e.target.value)}
                placeholder="What does this injury entail?"
                rows={3}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box', resize: 'vertical',
                }}
              />
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                onClick={onAddCritClose}
                style={{ flex: 1, background: 'transparent', border: `1px solid rgba(100,100,100,0.25)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}
              >
                Cancel
              </button>
              <button
                onClick={() => { void onAddCritApply(c.id) }}
                disabled={!addCritName.trim() || addCritBusy}
                style={{
                  flex: 2, background: 'rgba(220,20,60,0.12)', border: `1px solid rgba(220,20,60,0.4)`,
                  borderRadius: 4, padding: '4px 0', cursor: 'pointer',
                  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em',
                  color: RED, opacity: !addCritName.trim() || addCritBusy ? 0.4 : 1,
                }}
              >
                {addCritBusy ? '…' : '✓ Apply Injury'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Default: two-button row ── */
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={() => onCritOpen(c.id)}
              style={{
                flex: 1,
                background: 'rgba(220,20,60,0.06)',
                border: `1px solid rgba(220,20,60,0.4)`,
                borderRadius: 8, padding: '5px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: FS_CAPTION,
                fontWeight: 700, letterSpacing: '0.06em',
                color: RED,
              }}
            >
              ⚡ Crit Roll
            </button>
            <button
              onClick={() => onAddCritOpen(c.id)}
              style={{
                flex: 1,
                background: 'rgba(220,20,60,0.06)',
                border: `1px solid rgba(220,20,60,0.4)`,
                borderRadius: 8, padding: '5px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: FS_CAPTION,
                fontWeight: 700, letterSpacing: '0.06em',
                color: RED,
              }}
            >
              ＋ Add Injury
            </button>
          </div>
        )}
      </div>
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: TypeScript errors for `GmPartyPanel` not passing the new props yet. Those are fixed in Task 6.

- [ ] **Step 6: Commit**

```bash
git add src/components/gm/GmCharacterCard.tsx
git commit -m "feat(gm): add direct critical injury form to GmCharacterCard"
```

---

## Task 6: Thread new props through `GmPartyPanel` and `GmShell`

**Files:**
- Modify: `src/app/gm/panels/GmPartyPanel.tsx`
- Modify: `src/app/gm/GmShell.tsx`

- [ ] **Step 1: Extend `CardCallbacks` in `GmPartyPanel`**

In `GmPartyPanel.tsx`, the `CardCallbacks` type (around lines 11–22) is a `Pick<GmCharacterCardProps, ...>`. Extend it to include the new props:

```typescript
type CardCallbacks = Pick<
  GmCharacterCardProps,
  | 'players' | 'obligationTypes' | 'dutyTypes'
  | 'charActiveCritCounts' | 'critReqOpenFor'
  | 'critReqVicious' | 'critReqLethal' | 'critReqGm' | 'critReqBusy'
  | 'onAddWound' | 'onHealWounds' | 'onAddStrain' | 'onHealStrain'
  | 'onAdjustObligation' | 'onAdjustDuty' | 'onAdjustMorality'
  | 'onMoralitySetup' | 'onFallenConfirm' | 'onArchiveConfirm'
  | 'onCritOpen' | 'onCritClose'
  | 'onSetCritVicious' | 'onSetCritLethal' | 'onSetCritGm'
  | 'onSendCritRequest'
  | 'refCritsDb'
  | 'addCritOpenFor' | 'addCritRefId'
  | 'addCritName' | 'addCritDesc' | 'addCritSeverity' | 'addCritBusy'
  | 'onAddCritOpen' | 'onAddCritClose' | 'onSelectAddCritRef'
  | 'onSetAddCritName' | 'onSetAddCritDesc' | 'onAddCritApply'
>
```

- [ ] **Step 2: Destructure new charActions fields in `GmShell`**

In `GmShell.tsx`, find the destructuring block starting `// ── Destructure charActions...` (around line 228). Add the new fields:

```typescript
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
    addCritOpenFor, setAddCritOpenFor,
    addCritRefId, addCritName, setAddCritName,
    addCritDesc, setAddCritDesc,
    addCritSeverity, addCritBusy,
    selectAddCritRef, closeAddCrit, addCriticalInjury,
  } = charActions
```

- [ ] **Step 3: Create `handleAddCritOpen` in `GmShell`**

After the destructuring block, add:

```typescript
  const handleAddCritOpen = useCallback((charId: string) => {
    setCritReqOpenFor(null)
    setCritReqVicious(0)
    setCritReqLethal(0)
    setCritReqGm(0)
    setAddCritOpenFor(charId)
  }, [setCritReqOpenFor, setCritReqVicious, setCritReqLethal, setCritReqGm, setAddCritOpenFor])
```

- [ ] **Step 4: Update `onCritOpen` to also close the add-crit panel**

Find the `onCritOpen={setCritReqOpenFor}` prop on `<GmPartyPanel>` (around line 357). Change it to:

```typescript
                onCritOpen={id => { closeAddCrit(); setCritReqOpenFor(id) }}
```

- [ ] **Step 5: Add the new props to `<GmPartyPanel>`**

After the existing `onSendCritRequest={sendCritRequest}` prop, add:

```tsx
                refCritsDb={refCritsDb}
                addCritOpenFor={addCritOpenFor}
                addCritRefId={addCritRefId}
                addCritName={addCritName}
                addCritDesc={addCritDesc}
                addCritSeverity={addCritSeverity}
                addCritBusy={addCritBusy}
                onAddCritOpen={handleAddCritOpen}
                onAddCritClose={closeAddCrit}
                onSelectAddCritRef={selectAddCritRef}
                onSetAddCritName={setAddCritName}
                onSetAddCritDesc={setAddCritDesc}
                onAddCritApply={addCriticalInjury}
```

- [ ] **Step 6: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/gm/panels/GmPartyPanel.tsx src/app/gm/GmShell.tsx
git commit -m "feat(gm): wire add-critical-injury props through GmPartyPanel and GmShell"
```

---

## Task 7: End-to-end verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

Open the GM view in one browser tab and a player view in another (or open two tabs — one at `/gm?campaign=...` and one at `/play?character=...&campaign=...`).

- [ ] **Step 2: Verify default two-button layout**

In the GM tab: open the Party panel, click a character card. Confirm the crit section now shows two side-by-side buttons: "⚡ Crit Roll" and "＋ Add Injury". Confirm they have equal width and red styling.

- [ ] **Step 3: Verify mutual exclusivity**

Click "⚡ Crit Roll" — confirm the existing roll form expands and "＋ Add Injury" disappears. Cancel. Click "＋ Add Injury" — confirm the new form expands. Cancel. Confirm the two buttons reappear.

- [ ] **Step 4: Verify ref table pre-population**

With the add-injury form open, select an injury from the dropdown. Confirm the name, severity badge, and description fields populate from the ref table. Edit the name and description — confirm the fields are writable.

- [ ] **Step 5: Verify apply with player notification**

With the player tab open, apply an injury in the GM tab. Confirm:
- GM sees a green toast: "Critical injury applied!"
- Player tab shows the injury dialog modal with the correct name, severity, and description
- Player can dismiss the dialog with "Acknowledge"

- [ ] **Step 6: Verify the injury appears in the character sheet**

After acknowledging, check the player's critical injuries section in their character sheet. The new injury should appear in the list.

- [ ] **Step 7: Verify disabled state**

Open the add-injury form and clear the injury name field. Confirm the "✓ Apply Injury" button is visually dimmed and unclickable.
