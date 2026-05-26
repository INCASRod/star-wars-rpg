# GM Morality Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Morality" section to the GM Force tab showing all force-sensitive characters with their morality bar, current value, and ±1 adjustment buttons.

**Architecture:** Single-file change to `GmToolsPanel.tsx` — add a new JSX block above the existing "Add Conflict" button. Calls the already-wired `adjustMorality(charId, delta)` from `charActions`. No new hooks, no DB migration, no new component files.

**Tech Stack:** React (Next.js), TypeScript, Supabase realtime (already subscribed), design tokens from `@/lib/tokens`

---

## Files

| File | Change |
|---|---|
| `src/app/gm/panels/GmToolsPanel.tsx` | Add `COLOR` + `RADIUS` to token import; destructure `adjustMorality` from `charActions`; add Morality JSX block |

---

### Task 1: Add the Morality section to GmToolsPanel

**Files:**
- Modify: `src/app/gm/panels/GmToolsPanel.tsx`

This is a UI-only change with no business logic to unit-test — the behaviour (`adjustMorality` clamping, toast, realtime) is already tested at the hook level. Verification is visual.

- [ ] **Step 1: Extend the tokens import**

In `src/app/gm/panels/GmToolsPanel.tsx`, line 14 currently reads:

```ts
import { HUD } from '@/lib/tokens'
```

Change it to:

```ts
import { HUD, COLOR, RADIUS } from '@/lib/tokens'
```

- [ ] **Step 2: Destructure `adjustMorality` from `charActions`**

The existing destructure at lines 119-122 is:

```ts
const {
  odMode, setOdMode, odType, setOdType, odAmount, setOdAmount, odTarget, setOdTarget, odBusy,
  handleBulkOD, handleIndividualOD,
} = charActions
```

Add `adjustMorality` to it:

```ts
const {
  odMode, setOdMode, odType, setOdType, odAmount, setOdAmount, odTarget, setOdTarget, odBusy,
  handleBulkOD, handleIndividualOD,
  adjustMorality,
} = charActions
```

- [ ] **Step 3: Add the Morality section JSX**

In the `activeTab === 'force'` block (around line 413), the content div currently opens like this:

```tsx
{activeTab === 'force' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* Add Conflict button */}
    <button
```

Insert the new section **between** the opening `<div>` and the `{/* Add Conflict button */}` comment:

```tsx
{activeTab === 'force' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* ── Morality ── */}
    {hasForceSensitive && (
      <div>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
          Morality
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeChars
            .filter(c => (c.force_rating ?? 0) > 0)
            .map(c => {
              const val = c.morality_value ?? 50
              const isLight = val >= 50
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Name */}
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </span>
                  {/* Gradient bar */}
                  <div style={{ position: 'relative', width: 64, height: 5, borderRadius: RADIUS.full, background: 'linear-gradient(to right, #E05050, #C8AA50 40%, #4CAF50 60%, #5AAAE0)', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: -4, left: `${val}%`, transform: 'translateX(-50%)', width: 2, height: 13, background: '#fff', borderRadius: 1, boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                  </div>
                  {/* Numeric value */}
                  <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', fontWeight: 700, color: isLight ? COLOR.blue : COLOR.red, width: 22, textAlign: 'right', flexShrink: 0 }}>
                    {val}
                  </span>
                  {/* − button */}
                  <button
                    onClick={() => adjustMorality(c.id, -1)}
                    style={{ width: 20, height: 20, borderRadius: RADIUS.sm, border: `1px solid rgba(224,80,80,0.4)`, background: 'rgba(224,80,80,0.10)', color: COLOR.red, fontSize: 15, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >−</button>
                  {/* + button */}
                  <button
                    onClick={() => adjustMorality(c.id, 1)}
                    style={{ width: 20, height: 20, borderRadius: RADIUS.sm, border: `1px solid rgba(90,170,224,0.4)`, background: 'rgba(90,170,224,0.10)', color: COLOR.blue, fontSize: 15, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >+</button>
                </div>
              )
            })}
        </div>
      </div>
    )}

    {/* Add Conflict button */}
    <button
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If you see `Property 'adjustMorality' does not exist`, double-check that Step 2 was applied to the correct `charActions` destructure.

- [ ] **Step 5: Visual check in the browser**

Start the dev server if not already running:

```bash
npm run dev
```

Open the GM view, navigate to a campaign that has at least one force-sensitive character (force_rating > 0), and open the **Force** tab in GM Tools. Confirm:

1. A "MORALITY" eyebrow label appears above the "Add Conflict" button.
2. One row per force-sensitive character, showing name · gradient bar with white marker · numeric value · − · + buttons.
3. Characters with morality ≥ 50 show the value in blue; < 50 in red.
4. Clicking + increases the value by 1 and the player receives a toast. Clicking − decreases by 1.
5. Clicking − on a character at 0 does nothing (clamped). Clicking + at 100 does nothing.
6. The section is absent from the Force tab when there are no force-sensitive characters in the campaign.

- [ ] **Step 6: Commit**

```bash
git add src/app/gm/panels/GmToolsPanel.tsx
git commit -m "feat(gm): add morality adjustment section to Force tab"
```
