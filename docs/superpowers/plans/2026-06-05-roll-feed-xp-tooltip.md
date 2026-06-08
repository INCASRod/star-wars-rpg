# Roll Feed XP Purchase Tooltip — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the XP Purchase row in the GM Roll Feed with the existing `Tooltip` component so hovering anywhere on the row reveals the full purchase label, character name, and XP cost in a portal-rendered popup.

**Architecture:** Single-file change in `RollFeedPanel.tsx`. Import `Tooltip` and `TipBody` from the existing `@/components/ui/Tooltip`. Wrap the XP Purchase outer `<div>` with `<Tooltip content={...}>`. No new files, no schema changes.

**Tech Stack:** React, TypeScript, existing `Tooltip` component (`src/components/ui/Tooltip.tsx`), Tailwind, Shinkei design tokens

---

### Task 1: Step 0 Audit + Implementation

**Files:**
- Modify: `src/components/player-hud/RollFeedPanel.tsx` (XP Purchase branch of `SystemRow`, ~lines 460–517)

- [ ] **Step 1: Confirm build is clean**

Run:
```
npm run build
```
Expected: zero errors and zero warnings. If there are pre-existing errors, note them — do not fix them as part of this task.

- [ ] **Step 2: Audit the target section for existing violations**

Read `src/components/player-hud/RollFeedPanel.tsx` lines 460–517. Confirm:
- No hardcoded hex/rgb colours will be introduced by this change
- No hardcoded z-index, spacing, or font values will be introduced
- The existing `Tooltip` component (already token-compliant) will handle all visual styling

Report: "Step 0 audit — PASS" before continuing.

- [ ] **Step 3: Add Tooltip and TipBody to the import**

In `src/components/player-hud/RollFeedPanel.tsx`, find the existing import from `@/components/ui/Tooltip` (if any) or add a new one. The file currently imports from several `@/components/ui/*` paths.

Add or extend the import so it reads:

```ts
import { Tooltip, TipBody } from '@/components/ui/Tooltip'
```

If that import already exists, just add `Tooltip` and `TipBody` to the destructured list.

- [ ] **Step 4: Build the tooltip content node**

In the `XP Purchase` branch of `SystemRow` (starts at `if (roll.roll_type === 'XP Purchase') {`), add a `tooltipContent` variable immediately after the existing `const isRefunded = ...` line:

```tsx
const tooltipContent = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
    <TipBody>{label}</TipBody>
    <TipBody>
      <span style={{ color: HUD.textFaint }}>
        {roll.character_name}
        {meta?.xp_cost != null ? ` · ${meta.xp_cost} XP` : ''}
        {isRefunded ? ' · REFUNDED' : ''}
      </span>
    </TipBody>
  </div>
)
```

`label` is already declared at the top of `SystemRow` as `roll.roll_label ?? 'System Message'`. `HUD` is already imported. The file uses `var(--space-*)` CSS variable strings for spacing throughout — do not import `SP`.

- [ ] **Step 5: Wrap the XP Purchase row div with Tooltip**

The XP Purchase branch currently returns:

```tsx
return (
  <div
    className="flex items-center"
    style={{ ... }}
  >
    ...
  </div>
)
```

Wrap it so it becomes:

```tsx
return (
  <Tooltip content={tooltipContent} placement="top" maxWidth={320}>
    <div
      className="flex items-center"
      style={{ ... }}
    >
      ...
    </div>
  </Tooltip>
)
```

Everything inside the `<div>` (the icon span, character name, "purchased" text, truncated label, XP cost, refund button) stays exactly as-is. Only add the `<Tooltip>` wrapper outside.

- [ ] **Step 6: Verify TypeScript compiles**

Run:
```
npx tsc --noEmit
```
Expected: zero errors. The `Tooltip` component accepts `React.ReactElement` as its child — a `<div>` satisfies this. If you see a ref-forwarding error, it means the child div needs `React.forwardRef`; in practice this is not required since `React.cloneElement` attaches the ref directly.

- [ ] **Step 7: Run the build**

Run:
```
npm run build
```
Expected: clean build, zero errors.

- [ ] **Step 8: Visual verification**

Start the dev server:
```
npm run dev
```

Open the GM view. Trigger an XP purchase from a player session (or find an existing one in the roll feed). Verify:

1. The XP Purchase row renders identically to before — no layout shift, no extra whitespace
2. Hovering the row for ~300 ms reveals a tooltip popup above (or below if near top of viewport)
3. The tooltip shows:
   - Full talent/skill name (untruncated, even if it was clipped in the row)
   - Character name + XP cost on a second line in faint text
   - If refunded: "· REFUNDED" appended to the second line
4. Moving the cursor off the row dismisses the tooltip
5. The refund button (↺) still works when clicked — it should not be blocked by the tooltip
6. The tooltip does not get clipped by the roll feed's `overflow: hidden` container (it renders in a portal on `document.body`)
7. The tooltip renders correctly under all three themes: Kyber Archive (cyan), Ember Tatooine (red), neutral

- [ ] **Step 9: Token compliance self-audit**

Scan the changed lines in `RollFeedPanel.tsx` and confirm:
- [ ] Zero raw px/rem font sizes in new inline styles
- [ ] Zero raw hex/rgb colours — `HUD.textFaint` is a token reference, not a raw value ✓
- [ ] Zero hardcoded z-index numbers — tooltip z-index is inside `Tooltip.tsx` using `Z.tooltip` ✓
- [ ] Zero hardcoded transition timing values
- [ ] Spacing uses `var(--space-1)` CSS variable (matches the pattern used throughout this file) ✓
- [ ] No `onMouseEnter`/`onMouseLeave` style mutations in the changed code

Report: "Token compliance — PASS"

- [ ] **Step 10: Commit**

```bash
git add src/components/player-hud/RollFeedPanel.tsx
git commit -m "feat(roll-feed): hover tooltip on XP purchase rows shows full label and cost"
```
