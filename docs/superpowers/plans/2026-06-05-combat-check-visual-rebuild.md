# Combat Check Overlay — Visual Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild CombatCheckOverlay and its three step components (WeaponSelectStep, RangeBandStep, DicePoolReviewStep) with the accordion layout, compact header, compact pills, and full token compliance matching the approved mockup.

**Architecture:** Four visual accordion steps (Weapon+Target, Range, Dice Pool, Roll) are rendered simultaneously in the body with active/done/locked treatment. The internal `currentStep` flow (1→2→3→4→5) is preserved unchanged; visual steps 1, 2, 3 map to `currentStep` 2+3, 4, 5 respectively. Visual step 4 (Roll button) is rendered by the overlay using a pool emitted from DicePoolReviewStep via `onPoolChange`. The compact header replaces the multi-line header + progress bar.

**Tech Stack:** React, TypeScript, Shinkei design tokens (`SP`, `EASE`, `RADIUS`, `FS`, `HUD`, `FONT_BODY` from `@/lib/tokens`)

---

## Step 0 Audit — Already Completed

**Key findings that inform this plan:**
- `getMeleeDifficulty` **never returns null** — "not found" signal = `result.isDefault === true`
- `handleUpgradeCheck` / `handleDowngradeCheck` do **not** exist in DicePoolReviewStep — must add
- `SP`, `EASE`, `RADIUS` are **not** imported in any combat-check file — must add everywhere
- `GOLD_BAR = 'rgba(224,58,30,0.6)'` in CombatCheckOverlay is a **token violation**
- `ORANGE = '#FF9800'` in WeaponSelectStep is a **token violation**
- `PURPLE = '#9060D0'` in RangeBandStep is declared but unused — remove
- All four step files use `fontFamily: "var(--font-body)"` string literals instead of `FONT_BODY` constant

---

## Files Modified

| File | What changes |
|---|---|
| `src/components/combat-check/CombatCheckOverlay.tsx` | Compact header, accordion body, target pills inline, Roll button step 4, pool state, token fixes |
| `src/components/combat-check/steps/WeaponSelectStep.tsx` | Compact weapon pills (replaces full cards), compact dual-wield button, token fixes |
| `src/components/combat-check/steps/RangeBandStep.tsx` | Compact range pills (replaces BandCard buttons), melee opposed box + fallback, token fixes |
| `src/components/combat-check/steps/DicePoolReviewStep.tsx` | Add `challengeAdd` to ManualAdjustments, upgrade/downgrade buttons, adj floor fix, `onPoolChange` prop (removes Roll button), token fixes |

**Do not touch:** `AttackTypeStep.tsx`, `TargetSelectStep.tsx`, `DualWieldReviewStep.tsx`, `RollResultStep.tsx`, `combatCheckUtils.ts`, `tokens.ts`, `globals.css`

---

## Architectural Decisions

### Accordion mapping
Visual step 1 (Weapon+Target) is **active** when `currentStep === 2 || currentStep === 3`. At `currentStep === 2`: renders `WeaponSelectStep`. At `currentStep === 3`: renders inline target pills (not TargetSelectStep — that component is unchanged). Visual step 1 is **done** when `currentStep >= 4`. Done summary: `"{weaponName} → {targetName}"`.

### Roll button location
Moved from DicePoolReviewStep to CombatCheckOverlay's visual step 4. DicePoolReviewStep gains `onPoolChange?: (pool: Record<string,number>) => void` and calls it via `useEffect` when the computed pool changes. CombatCheckOverlay stores pool in `poolForRoll` state and renders the Roll button in visual step 4.

### challengeAdd field
`ManualAdjustments` gains `challengeAdd: number` (default `0`) for the upgrade/downgrade buttons to directly add/remove challenge dice. The existing `EMPTY_ADJUSTMENTS` export is updated. CombatCheckOverlay's state initialisation uses `EMPTY_ADJUSTMENTS` so the new field propagates automatically.

### getMeleeDifficulty fallback condition
`result.isDefault === true` (not null-check). Show the manual ± fallback box when `isDefault` is true.

---

## Task 1: DicePoolReviewStep — ManualAdjustments + Upgrade/Downgrade + Pool Emit + Roll Button Removal

**Files:**
- Modify: `src/components/combat-check/steps/DicePoolReviewStep.tsx`

- [ ] **Step 1: Add SP, EASE, RADIUS to the token import (line 14)**

Replace:
```ts
import { HUD, FS, FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'
```
With:
```ts
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'
```

- [ ] **Step 2: Add `challengeAdd` to `ManualAdjustments` and `EMPTY_ADJUSTMENTS`**

Replace (lines 23–34):
```ts
export interface ManualAdjustments {
  boostAdd:          number
  setbackAdd:        number
  difficultyAdd:     number
  abilityUpgrades:   number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0,
  abilityUpgrades: 0, difficultyUpgrades: 0,
}
```
With:
```ts
export interface ManualAdjustments {
  boostAdd:           number
  setbackAdd:         number
  difficultyAdd:      number
  challengeAdd:       number  // direct challenge-die adjustments (upgrade/downgrade buttons)
  abilityUpgrades:    number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0, challengeAdd: 0,
  abilityUpgrades: 0, difficultyUpgrades: 0,
}
```

- [ ] **Step 3: Update `DicePoolReviewStepProps` — swap `onRoll` for `onPoolChange`**

Replace (lines 53–54):
```ts
  onAdjustChange:  (adj: ManualAdjustments) => void
  onRoll:          (pool: Record<string, number>) => void
```
With:
```ts
  onAdjustChange:  (adj: ManualAdjustments) => void
  onPoolChange?:   (pool: Record<string, number>) => void
```

- [ ] **Step 4: Update function signature to receive `onPoolChange` instead of `onRoll`**

Replace (line 152):
```ts
  dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName,
}: DicePoolReviewStepProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false)
```
With:
```ts
  dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName,
  onPoolChange,
}: DicePoolReviewStepProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false)
```

- [ ] **Step 5: Include `challengeAdd` in `finalPool` and add `useEffect` to emit pool changes**

Find the `finalPool` object (lines 284–293). Replace it and add the useEffect immediately after:
```ts
  const finalPool = {
    proficiency: finalPro,
    ability:     finalAbl,
    boost:       talentBoost + adjustments.boostAdd,
    difficulty:  finalDiff,
    challenge:   finalChal + adjustments.challengeAdd,
    setback:     netSetback,
    force:       0,
  }

  // Emit pool to parent (CombatCheckOverlay renders the Roll button)
  const { proficiency, ability, boost, difficulty, challenge, setback } = finalPool
  useEffect(() => {
    onPoolChange?.({ proficiency, ability, boost, difficulty, challenge, setback, force: 0 })
  }, [onPoolChange, proficiency, ability, boost, difficulty, challenge, setback])
```

- [ ] **Step 6: Fix `adj()` to support negative values (floor = negative of base count)**

Replace (lines 294–296):
```ts
  function adj(key: keyof ManualAdjustments, delta: number) {
    onAdjustChange({ ...adjustments, [key]: Math.max(0, adjustments[key] + delta) })
  }
```
With:
```ts
  const adjFloors: Record<keyof ManualAdjustments, number> = {
    boostAdd:           -talentBoost,
    setbackAdd:         0,
    difficultyAdd:      -(baseDiff),
    challengeAdd:       -(baseChal),
    abilityUpgrades:    0,
    difficultyUpgrades: 0,
  }
  function adj(key: keyof ManualAdjustments, delta: number) {
    const floor = adjFloors[key] ?? 0
    onAdjustChange({ ...adjustments, [key]: Math.max(floor, adjustments[key] + delta) })
  }
```

- [ ] **Step 7: Add `handleUpgradeCheck` and `handleDowngradeCheck` immediately after `adj()`**

```ts
  function handleUpgradeCheck() {
    if (finalDiff + finalChal + adjustments.challengeAdd >= 5) return
    if (finalDiff > 0) {
      onAdjustChange({ ...adjustments, difficultyAdd: adjustments.difficultyAdd - 1, challengeAdd: adjustments.challengeAdd + 1 })
    } else {
      onAdjustChange({ ...adjustments, challengeAdd: adjustments.challengeAdd + 1 })
    }
  }

  function handleDowngradeCheck() {
    const totalDC = finalDiff + finalChal + adjustments.challengeAdd
    if (totalDC === 0) return
    if (adjustments.challengeAdd > 0) {
      onAdjustChange({ ...adjustments, challengeAdd: adjustments.challengeAdd - 1 })
    } else if (adjustments.difficultyUpgrades > 0) {
      onAdjustChange({ ...adjustments, difficultyUpgrades: adjustments.difficultyUpgrades - 1 })
    } else if (finalDiff > 0) {
      onAdjustChange({ ...adjustments, difficultyAdd: adjustments.difficultyAdd - 1 })
    } else {
      onAdjustChange({ ...adjustments, challengeAdd: adjustments.challengeAdd - 1 })
    }
  }
```

- [ ] **Step 8: Add Upgrade/Downgrade button row in the JSX, placed AFTER the dual-wield breakdown and species notes, BEFORE Manual Adjustments section label**

Find the line `{/* Manual adjustments */}` (around line 506) and insert BEFORE it:

```tsx
      {/* Upgrade / Downgrade row */}
      <div style={{ display: 'flex', gap: SP[1], marginTop: SP[2], marginBottom: SP[3] }}>
        <button
          onClick={handleUpgradeCheck}
          disabled={finalDiff + finalChal + adjustments.challengeAdd >= 5}
          style={{
            flex: 1,
            padding: `2px ${SP[2]}`,
            fontSize: FS.overline,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            borderRadius: RADIUS.sm,
            cursor: finalDiff + finalChal + adjustments.challengeAdd >= 5 ? 'not-allowed' : 'pointer',
            opacity: finalDiff + finalChal + adjustments.challengeAdd >= 5 ? 0.4 : 1,
            border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
            background: `color-mix(in srgb, var(--hud-accent) 10%, transparent)`,
            color: `color-mix(in srgb, var(--hud-accent) 80%, transparent)`,
            transition: `opacity ${EASE.quick}`,
            fontFamily: FONT_BODY,
          }}
        >
          ↑ Upgrade Check
        </button>
        <button
          onClick={handleDowngradeCheck}
          disabled={finalDiff + finalChal + adjustments.challengeAdd === 0}
          style={{
            flex: 1,
            padding: `2px ${SP[2]}`,
            fontSize: FS.overline,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            borderRadius: RADIUS.sm,
            cursor: finalDiff + finalChal + adjustments.challengeAdd === 0 ? 'not-allowed' : 'pointer',
            opacity: finalDiff + finalChal + adjustments.challengeAdd === 0 ? 0.4 : 1,
            /* pre-approved die-identity exception — purple difficulty */
            border: 'rgba(123,31,162,0.45)',
            background: 'rgba(123,31,162,0.1)',
            color: 'rgba(206,147,216,0.8)',
            transition: `opacity ${EASE.quick}`,
            fontFamily: FONT_BODY,
          }}
        >
          ↓ Downgrade Check
        </button>
      </div>
```

Note: the border for the Downgrade button must be `1px solid rgba(123,31,162,0.45)` (not just the rgba string). Correct it:
```tsx
            border: `1px solid rgba(123,31,162,0.45)`,
```

- [ ] **Step 9: Fix AdjustControl to show negative values in accent colour**

Replace the value `<span>` inside `AdjustControl` (the one that shows `{value}`, around line 131):
```tsx
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: value < 0 ? 'var(--hud-accent)' : HUD.gold, width: 20, textAlign: 'center' as const }}>
          {value > 0 ? `+${value}` : value === 0 ? '0' : `${value}`}
        </span>
```

- [ ] **Step 10: Fix AdjustControl token violations**

In `AdjustControl`, replace all inline style violations:
- `borderRadius: 4` → `borderRadius: RADIUS.sm`
- `width: 22, height: 22` → keep as is (these are explicit touch-target sizes — add comment `/* 22px touch target */`)
- `background: 'rgba(224,58,30,0.1)'` → `background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)'`
- `fontFamily: "var(--font-body)"` → `fontFamily: FONT_BODY`

- [ ] **Step 11: Remove the Roll button from `DicePoolReviewStep`**

Find and delete the entire `{/* Roll button */}` section (around lines 540–556):
```tsx
      {/* Roll button */}
      <button
        onClick={() => onRoll(finalPool)}
        style={{
          width: '100%', height: 48,
          background: 'linear-gradient(135deg, #E03A1E, #A02010)',
          ...
        }}
      >
        {isDualWield ? 'Roll Dual Wield Attack' : 'Roll Attack'}
      </button>
```

Also remove the `<div style={{ height: 16 }} />` spacer immediately above it.

- [ ] **Step 12: Fix remaining token violations in DicePoolReviewStep**

Scan the full file for:
- `fontFamily: "var(--font-body)"` → replace with `fontFamily: FONT_BODY`
- `borderRadius: 6` or `borderRadius: 8` → replace with `RADIUS.lg`
- `borderRadius: 4` → replace with `RADIUS.sm`
- `padding: '8px 12px'` → replace with `padding: \`${SP[2]} ${SP[3]}\``
- `padding: '8px 10px'` → replace with `padding: \`${SP[2]} ${SP[2]}\``
- `padding: '6px 10px'` → replace with `padding: \`${SP[1]} ${SP[2]}\``
- `padding: '6px 0'` → replace with `padding: \`${SP[1]} 0\``
- `marginBottom: 10` → replace with `marginBottom: SP[2]`
- `marginBottom: 8` or `marginBottom: 6` → replace with `marginBottom: SP[1]`
- `gap: 10` → replace with `gap: SP[2]`
- `gap: 8` → replace with `gap: SP[2]`
- `margin: '16px 0 8px'` in `SectionLabel` → replace with `margin: \`${SP[2]} 0 ${SP[1]}\``
- `paddingBottom: 6` in `SectionLabel` → replace with `paddingBottom: SP[1]`
- `lineHeight: 1.8` is OK (unitless)
- `rgba(41,182,246,0.7)` → replace with `color-mix(in srgb, var(--hud-accent) 70%, transparent)` with comment `/* talent bonus accent */`
- `rgba(255,152,0,0.7)` → replace with `color-mix(in srgb, var(--state-caution, #FF9800) 70%, transparent)` with comment `/* dual wield penalty / species warning */`
- `rgba(255,152,0,0.04)` → replace with `color-mix(in srgb, var(--state-caution, #FF9800) 4%, transparent)`
- `rgba(255,152,0,0.18)` → replace with `color-mix(in srgb, var(--state-caution, #FF9800) 18%, transparent)`
- `rgba(255,152,0,0.5)` → replace with `color-mix(in srgb, var(--state-caution, #FF9800) 50%, transparent)`

- [ ] **Step 13: TypeScript check**

```
npx tsc --noEmit
```
Expected: zero errors. If `useEffect` dependencies cause issues, ensure the destructured `{ proficiency, ability, ... }` from `finalPool` are listed in the deps array.

- [ ] **Step 14: Build check**

```
npm run build
```
Expected: clean.

- [ ] **Step 15: Commit**

```bash
git add src/components/combat-check/steps/DicePoolReviewStep.tsx
git commit -m "feat(combat-check): dice pool step — upgrade/downgrade buttons, pool emit, adj floor, token fixes"
```

---

## Task 2: CombatCheckOverlay — Compact Header + Accordion + Roll Step 4 + Token Fixes

**Files:**
- Modify: `src/components/combat-check/CombatCheckOverlay.tsx`

Context: This file currently uses one-at-a-time conditional rendering (`{!isResult && state.currentStep === N && ...}`). We convert the body to an accordion showing all visual steps simultaneously. The goNext/goBack flow is **not changed**. The footer Next button is kept for steps 2–4.

- [ ] **Step 1: Update token import and add `useState` for pool**

Replace line 3:
```ts
import { useState, useEffect, useCallback } from 'react'
```
With (no change needed — `useRef` is not required):
```ts
import { useState, useEffect, useCallback } from 'react'
```

Replace line 19:
```ts
import { HUD, FS, FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'
```
With:
```ts
import { HUD, FS, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'
```
Note: `FONT_DISPLAY` is removed (header uses `FONT_BODY` per spec). If it's still needed elsewhere in the file, add it back.

Also add `RANGE_BAND_LABELS` to the combatCheckUtils import (line 7):
```ts
import { formatResultSummary, type RangeBand, RANGE_VALUE_MAP, RANGE_BAND_LABELS, MELEE_SKILL_KEYS } from '@/lib/combatCheckUtils'
```

- [ ] **Step 2: Remove `GOLD_BAR` constant, add `poolForRoll` state**

Remove line 25: `const GOLD_BAR = 'rgba(224,58,30,0.6)'`

Inside the component function, after the existing state declarations, add:
```ts
  const [poolForRoll, setPoolForRoll] = useState<Record<string, number>>({})
```

- [ ] **Step 3: Add local `StepContainer` component above the `CombatCheckOverlay` function export**

Insert after the `STEP_LABELS` constant (around line 36), before the `CombatCheckState` interface:

```tsx
// ── Accordion step container ──────────────────────────────────────────────────
function StepContainer({
  number, label,
  isActive, isDone, isLocked,
  doneSummary, children,
}: {
  number:       number
  label:        string
  isActive:     boolean
  isDone:       boolean
  isLocked:     boolean
  doneSummary?: string | null
  children?:    React.ReactNode   // JSX children — Next.js auto-import handles React namespace
}) {
  return (
    <div
      style={{
        padding:     isActive ? `${SP[2]} ${SP[2]}` : `${SP[1]} ${SP[2]}`,
        borderLeft:  isActive
          ? `2px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`
          : '2px solid transparent',
        background:  isActive
          ? `color-mix(in srgb, var(--hud-gold) 4%, transparent)`
          : 'transparent',
        opacity:     isDone ? 0.6 : isLocked ? 0.3 : 1,
        pointerEvents: isLocked ? 'none' as const : undefined,
        marginBottom: SP[1],
        borderRadius: RADIUS.sm,
        transition: `opacity ${EASE.quick}`,
      }}
    >
      <div style={{
        fontFamily:      FONT_BODY,
        fontSize:        FS.overline,
        fontWeight:      700,
        letterSpacing:   '0.12em',
        textTransform:   'uppercase' as const,
        color:           isActive ? 'var(--hud-gold)' : isDone ? HUD.textDim : HUD.textFaint,
        marginBottom:    (isActive || (isDone && doneSummary)) ? SP[1] : 0,
      }}>
        {number}. {label}{isDone ? ' ✓' : ''}
      </div>
      {isDone && doneSummary && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.overline,
          color:      HUD.textDim,
          fontStyle:  'italic',
        }}>
          {doneSummary}
        </div>
      )}
      {isActive && children}
    </div>
  )
}
```

- [ ] **Step 4: Replace the entire `return (...)` with the new JSX**

The full return statement for `CombatCheckOverlay` becomes:

```tsx
  // ── Derived summaries for accordion done states ──────────────────────────
  const weaponDisplayName = state.selectedWeapon?.id === '__unarmed__'
    ? 'Unarmed'
    : (state.selectedWeapon?.custom_name || refWeapon?.name || null)
  const targetDisplayName = state.selectedTargets.length === 1
    ? state.selectedTargets[0].name
    : state.selectedTargets.length > 1
    ? `${state.selectedTargets.length} targets`
    : null
  const step1DoneSummary = [weaponDisplayName, targetDisplayName].filter(Boolean).join(' → ')

  const step2DoneSummary = state.selectedBand
    ? state.attackType === 'melee'
      ? `✓ Opposed · ${state.selectedTargets[0]?.name ?? 'Target'}`
      : `✓ ${RANGE_BAND_LABELS[state.selectedBand]}`
    : undefined

  // Current visual accordion step (1–4) for dot indicator
  const visualStep =
    state.currentStep <= 3 ? 1 :
    state.currentStep === 4 ? 2 :
    3 // step 5 = visual steps 3+4

  const totalDiceForRoll = Object.values(poolForRoll).reduce((s, n) => s + Math.max(0, n), 0)

  return (
    <div
      className={`hud-quick-drawer${open ? ' open' : ''}`}
      style={{
        background:          'var(--hud-surface-hi)',
        backdropFilter:      'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderRight:         '1px solid var(--hud-border)',
        display:             'flex',
        flexDirection:       'column',
      }}
    >

      {/* ── Compact header strip ────────────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          SP[2],
        padding:      `${SP[2]} ${SP[3]}`,
        borderBottom: '1px solid var(--hud-border)',
        background:   'var(--hud-panel)',
        flexShrink:   0,
      }}>
        <span style={{ color: 'var(--hud-text-faint)', fontSize: FS.sm, lineHeight: 1 }}>⌖</span>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.label,
          fontWeight:    700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color:         'var(--hud-text)',
          flex:          1,
        }}>
          {isResult ? 'Attack Result' : state.dualWield?.enabled ? 'Dual Wield Attack' : 'Combat Check'}
        </span>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      'var(--hud-text-faint)',
            fontSize:   FS.sm,
            padding:    `0 ${SP[1]}`,
            lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        {/* Roll result */}
        {isResult && state.rollResult && (
          <div style={{ padding: `${SP[3]} ${SP[3]}` }}>
            <RollResultStep
              result={state.rollResult}
              attackType={state.attackType ?? 'ranged'}
              weapon={state.selectedWeapon}
              refWeapon={refWeapon}
              targets={state.selectedTargets}
              rangeBand={state.selectedBand}
              characterBrawn={character.brawn}
              critEligibility={critEligibility}
              onRollAgain={handleRollAgain}
              onNewAttack={handleNewAttack}
              dualWield={state.dualWield}
              dualWieldSecondaryRef={secondaryRefWeapon}
            />
          </div>
        )}

        {/* Dual wield review (step 2b) */}
        {!isResult && state.dualWieldReview && state.dualWield && (
          <div style={{ padding: `${SP[3]} ${SP[3]}` }}>
            <DualWieldReviewStep
              primaryWeapon={state.dualWield.primaryWeapon}
              secondaryWeapon={state.dualWield.secondaryWeapon}
              primaryRef={refWeapon}
              secondaryRef={secondaryRefWeapon}
              onSwap={handleDualWieldSwap}
            />
          </div>
        )}

        {/* Accordion steps */}
        {!isResult && !state.dualWieldReview && (
          <div style={{ padding: `${SP[2]} ${SP[2]}` }}>

            {/* Attack Type (only when not preset) */}
            {!initialAttackType && (
              <StepContainer
                number={0}
                label="Attack Type"
                isActive={state.currentStep === 1}
                isDone={state.currentStep > 1}
                isLocked={false}
                doneSummary={state.attackType
                  ? (state.attackType === 'ranged' ? '✓ Ranged' : '✓ Melee')
                  : undefined}
              >
                <AttackTypeStep onSelect={handleAttackType} />
              </StepContainer>
            )}

            {/* Visual Step 1 — Weapon + Target */}
            <StepContainer
              number={1}
              label="Weapon & Target"
              isActive={state.currentStep === 2 || state.currentStep === 3}
              isDone={state.currentStep >= 4}
              isLocked={state.currentStep < 2}
              doneSummary={step1DoneSummary || undefined}
            >
              {state.currentStep === 2 && (
                <WeaponSelectStep
                  attackType={state.attackType ?? 'ranged'}
                  character={character}
                  weapons={weapons}
                  refWeaponMap={refWeaponMap}
                  refSkillMap={refSkillMap}
                  refWeaponQualityMap={refWeaponQualityMap}
                  charSkills={charSkills}
                  selectedWeapon={state.selectedWeapon}
                  onSelect={handleWeaponSelect}
                  onNext={goNext}
                  isGmMode={isGmMode}
                  onEquipWeapon={handleEquipWeapon}
                  onDualWieldSelect={handleDualWieldSelect}
                />
              )}
              {state.currentStep === 3 && (
                /* Inline target pills — same styling as weapon pills */
                <div>
                  <div style={{
                    fontSize:      FS.overline,
                    fontWeight:    700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase' as const,
                    color:         'var(--hud-text-faint)',
                    marginBottom:  SP[1],
                    fontFamily:    FONT_BODY,
                  }}>
                    Target (optional)
                  </div>
                  {(encounterEnemies ?? []).length === 0 && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
                      No enemies in encounter — skip to continue.
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: SP[1] }}>
                    {(encounterEnemies ?? []).map(enemy => {
                      const selected = state.selectedTargets.some(t => t.instanceId === enemy.instanceId)
                      return (
                        <button
                          key={enemy.instanceId}
                          onClick={() => handleTargetSelect(
                            selected
                              ? state.selectedTargets.filter(t => t.instanceId !== enemy.instanceId)
                              : [...state.selectedTargets, enemy]
                          )}
                          style={{
                            border:       selected
                              ? `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`
                              : `1px solid var(--hud-border)`,
                            background:   selected
                              ? `color-mix(in srgb, var(--hud-accent) 10%, transparent)`
                              : 'transparent',
                            color:        selected ? 'var(--hud-text)' : 'var(--hud-text-dim)',
                            padding:      `2px ${SP[2]}`,
                            fontSize:     FS.overline,
                            fontWeight:   700,
                            borderRadius: RADIUS.sm,
                            cursor:       'pointer',
                            fontFamily:   FONT_BODY,
                            transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
                          }}
                        >
                          {enemy.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </StepContainer>

            {/* Visual Step 2 — Range */}
            <StepContainer
              number={2}
              label={state.attackType === 'melee' ? 'Melee' : 'Range Band'}
              isActive={state.currentStep === 4}
              isDone={state.currentStep >= 5}
              isLocked={state.currentStep < 4}
              doneSummary={step2DoneSummary}
            >
              {state.currentStep === 4 && state.attackType && (
                <RangeBandStep
                  attackType={state.attackType}
                  weapon={refWeapon ? { skillKey: refWeapon.skill_key ?? '', refWeapon } : null}
                  selectedBand={state.selectedBand}
                  targets={state.selectedTargets}
                  onSelect={handleBandSelect}
                />
              )}
            </StepContainer>

            {/* Visual Step 3 — Dice Pool */}
            <StepContainer
              number={3}
              label="Dice Pool"
              isActive={state.currentStep === 5}
              isDone={false}
              isLocked={state.currentStep < 5}
            >
              {state.currentStep === 5 && (
                <DicePoolReviewStep
                  attackType={state.attackType ?? 'ranged'}
                  character={character}
                  weapon={state.selectedWeapon}
                  refWeapon={refWeapon}
                  refSkill={refSkill}
                  charSkills={charSkills}
                  targets={state.selectedTargets}
                  rangeBand={state.selectedBand}
                  skillModifiers={skillModifiers}
                  adjustments={state.adjustments}
                  onAdjustChange={handleAdjustChange}
                  onPoolChange={setPoolForRoll}
                  dualWield={state.dualWield}
                  refWeaponMap={refWeaponMap}
                  refSkillMap={refSkillMap}
                  speciesAbilities={speciesAbilities}
                  speciesName={speciesName}
                />
              )}
            </StepContainer>

            {/* Visual Step 4 — Roll */}
            <StepContainer
              number={4}
              label="Roll"
              isActive={state.currentStep === 5}
              isDone={false}
              isLocked={state.currentStep < 5}
            >
              {state.currentStep === 5 && (
                <button
                  onClick={() => handleRoll(poolForRoll)}
                  disabled={totalDiceForRoll === 0}
                  style={{
                    width:         '100%',
                    padding:       `${SP[2]} 0`,
                    background:    `color-mix(in srgb, var(--hud-accent) 18%, transparent)`,
                    border:        `1px solid color-mix(in srgb, var(--hud-accent) 45%, transparent)`,
                    borderRadius:  RADIUS.md,
                    cursor:        totalDiceForRoll === 0 ? 'not-allowed' : 'pointer',
                    opacity:       totalDiceForRoll === 0 ? 0.4 : 1,
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.sm,
                    fontWeight:    700,
                    color:         'var(--hud-text)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    transition:    `opacity ${EASE.quick}`,
                  }}
                >
                  Roll {totalDiceForRoll} Dice
                </button>
              )}
            </StepContainer>

            {/* Dot progress indicator */}
            <div style={{
              display:        'flex',
              justifyContent: 'center',
              gap:            SP[1],
              padding:        `${SP[2]} 0`,
            }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{
                  width:        6,
                  height:       6,
                  borderRadius: RADIUS.full,
                  background:   visualStep >= n ? 'var(--hud-gold)' : 'var(--hud-border)',
                  opacity:      visualStep > n ? 0.5 : visualStep === n ? 1 : 0.3,
                  transition:   `background ${EASE.quick}, opacity ${EASE.quick}`,
                }} />
              ))}
            </div>

          </div>
        )}
      </div>

      {/* ── Footer — Next button (steps 2–4 and step 2b) ─────────────────────── */}
      {!isResult && (state.dualWieldReview || (state.currentStep >= 2 && state.currentStep <= 4)) && (
        <div style={{
          padding:    `${SP[2]} ${SP[3]}`,
          borderTop:  '1px solid var(--hud-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            style={{
              width:         '100%',
              padding:       `${SP[2]} 0`,
              borderRadius:  RADIUS.md,
              border:        `1px solid color-mix(in srgb, var(--hud-accent) ${canAdvance() ? 45 : 20}%, transparent)`,
              cursor:        canAdvance() ? 'pointer' : 'not-allowed',
              fontFamily:    FONT_BODY,
              fontSize:      FS.label,
              fontWeight:    700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              background:    canAdvance()
                ? `color-mix(in srgb, var(--hud-accent) 18%, transparent)`
                : `color-mix(in srgb, var(--hud-accent) 6%, transparent)`,
              color:         canAdvance() ? 'var(--hud-text)' : 'var(--hud-text-faint)',
              transition:    `background ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            {state.dualWieldReview
              ? 'Continue →'
              : state.currentStep === 3 && state.selectedTargets.length === 0
              ? 'Skip / Next'
              : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
```

Note: Remove any remaining uses of `FONT_DISPLAY` in the file (the header now uses `FONT_BODY`). If `FONT_DISPLAY` appears in `RollResultStep` or other imported components, those are untouched — but within CombatCheckOverlay.tsx itself, `FONT_DISPLAY` is no longer used.

Also note: `RangeBandStep` receives a new `targets` prop in the accordion (used for the melee opposed box). Add `targets?: AdversaryInstance[]` to `RangeBandStepProps` in Task 3, then pass `targets={state.selectedTargets}` here.

- [ ] **Step 5: TypeScript check**

```
npx tsc --noEmit
```
Expected: zero errors. Common issues to fix: `FONT_DISPLAY` import unused (remove it), `poolForRoll` type narrowing, `handleRoll` called with `Record<string,number>` instead of the typed pool parameter (cast if needed: `handleRoll(poolForRoll as Parameters<typeof handleRoll>[0])`).

- [ ] **Step 6: Build check**

```
npm run build
```
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/combat-check/CombatCheckOverlay.tsx
git commit -m "feat(combat-check): accordion layout + compact header + roll step 4"
```

---

## Task 3: WeaponSelectStep — Compact Pills + Dual Wield Button + Token Fixes

**Files:**
- Modify: `src/components/combat-check/steps/WeaponSelectStep.tsx`

This step converts the full weapon cards to compact pill buttons. The stowed weapon equipping logic (maneuver warning) is preserved — the warning expands inline when a stowed pill is clicked.

- [ ] **Step 1: Update token import and remove `ORANGE` constant**

Replace line 11:
```ts
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SYM_COLOR, DICE_COLOR } from '@/lib/tokens'
```
With:
```ts
import { HUD, FS, FONT_BODY, SP, EASE, RADIUS, SYM_COLOR, DICE_COLOR } from '@/lib/tokens'
```

Remove line 19: `const ORANGE = '#FF9800'`

Replace all uses of `ORANGE` in the file with `'color-mix(in srgb, var(--state-caution, #FF9800) 100%, transparent)'` — or more cleanly, define a local variable:
```ts
const CAUTION = 'color-mix(in srgb, var(--state-caution, #FF9800) 100%, transparent)'
```

- [ ] **Step 2: Replace `SectionLabel` component with a token-compliant version**

Replace the existing `SectionLabel` function:
```tsx
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily:    FONT_BODY,
      fontSize:      FS.overline,
      fontWeight:    700,
      color:         'var(--hud-text-faint)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.18em',
      marginBottom:  SP[1],
    }}>
      {text}
    </div>
  )
}
```

- [ ] **Step 3: Replace `renderWeaponCard` with compact pill rendering**

Replace the entire `function renderWeaponCard(...)` (lines 153–341) with this compact implementation:

```tsx
  function renderWeaponPill(w: CharacterWeapon, isStowed = false) {
    const isUnarmed  = (w as typeof UNARMED_WEAPON)._isUnarmed
    const ref        = isUnarmed ? null : refWeaponMap[w.weapon_key]
    const name       = isUnarmed ? 'Unarmed / Brawl' : (w.custom_name || ref?.name || 'Weapon')
    const isSelected = selectedWeapon?.id === w.id
    const showWarning = maneuverWarningFor === w.id

    return (
      <div key={w.id}>
        <button
          onClick={() => {
            if (isStowed && !showWarning) { setManeuverWarningFor(w.id); return }
            if (!isStowed) onSelect(isSelected ? null : w)
          }}
          style={{
            border:       isSelected
              ? `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`
              : `1px solid var(--hud-border)`,
            background:   isSelected
              ? `color-mix(in srgb, var(--hud-accent) 10%, transparent)`
              : 'transparent',
            color:        isSelected ? 'var(--hud-text)' : 'var(--hud-text-dim)',
            padding:      `2px ${SP[2]}`,
            fontSize:     FS.overline,
            fontWeight:   700,
            borderRadius: RADIUS.sm,
            cursor:       'pointer',
            fontFamily:   FONT_BODY,
            opacity:      isStowed ? 0.65 : 1,
            transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
          }}
        >
          {name}{isStowed ? ' (stowed)' : ''}
        </button>

        {/* Stowed equip warning — inline expansion */}
        {showWarning && (
          <div style={{
            background:   `color-mix(in srgb, var(--state-caution, #FF9800) 6%, transparent)`,
            border:       `1px solid color-mix(in srgb, var(--state-caution, #FF9800) 50%, transparent)`,
            borderRadius: RADIUS.md,
            padding:      `${SP[2]} ${SP[2]}`,
            marginTop:    SP[1],
          }}>
            <div style={{
              fontFamily:  FONT_BODY,
              fontSize:    FS.overline,
              color:       `color-mix(in srgb, var(--state-caution, #FF9800) 100%, transparent)`,
              marginBottom: SP[1],
              fontWeight:  700,
            }}>
              ⚠ Equipping costs a Maneuver
            </div>
            <div style={{
              fontFamily:  FONT_BODY,
              fontSize:    FS.overline,
              color:       'var(--hud-text-dim)',
              marginBottom: SP[2],
              lineHeight:  1.4,
            }}>
              Equipping <strong style={{ color: 'var(--hud-text)' }}>{name}</strong> will use one of your maneuvers this turn.
            </div>
            <div style={{ display: 'flex', gap: SP[1] }}>
              <button
                onClick={() => setManeuverWarningFor(null)}
                style={{
                  flex:         1,
                  padding:      `2px ${SP[2]}`,
                  background:   'transparent',
                  border:       '1px solid var(--hud-border)',
                  borderRadius: RADIUS.sm,
                  cursor:       'pointer',
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-text-dim)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => equipWeapon(w)}
                disabled={equipping}
                style={{
                  flex:         2,
                  padding:      `2px ${SP[2]}`,
                  background:   `color-mix(in srgb, var(--hud-gold) 10%, transparent)`,
                  border:       `1px solid color-mix(in srgb, var(--hud-gold) 38%, transparent)`,
                  borderRadius: RADIUS.sm,
                  cursor:       equipping ? 'wait' : 'pointer',
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-gold)',
                }}
              >
                {equipping ? 'Equipping…' : 'Equip & Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
```

- [ ] **Step 4: Update the JSX return to use `renderWeaponPill` and use a flex-wrap pill layout**

Replace all calls to `renderWeaponCard(w, ...)` with `renderWeaponPill(w, ...)` in the return JSX.

Also wrap the equipped and stowed pill lists in a flex-wrap container:
```tsx
      {equipped.length > 0 && (
        <>
          <SectionLabel text="Equipped" />
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: SP[1], marginBottom: SP[2] }}>
            {equipped.map(w => renderWeaponPill(w, false))}
          </div>
        </>
      )}
      {stowed.length > 0 && (
        <>
          <SectionLabel text="Stowed" />
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: SP[1], marginBottom: SP[2] }}>
            {stowed.map(w => renderWeaponPill(w, true))}
          </div>
        </>
      )}
```

And for the unarmed option:
```tsx
      {attackType === 'melee' && (
        <>
          <SectionLabel text="Always Available" />
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: SP[1], marginBottom: SP[2] }}>
            {renderWeaponPill(UNARMED_WEAPON as unknown as CharacterWeapon)}
          </div>
        </>
      )}
```

- [ ] **Step 5: Replace the dual-wield offer card with a compact button**

Replace the entire IIFE that renders the dual-wield offer card (lines 391–465) with:

```tsx
      {/* Dual Wield compact button */}
      {(() => {
        if (!selectedWeapon || !onDualWieldSelect) return null
        const allEquipped = weapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
        const partner     = findDualWieldPartner(selectedWeapon, allEquipped, refWeaponMap)
        if (!partner) return null
        return (
          <div style={{ marginTop: SP[2] }}>
            <button
              onClick={() => onDualWieldSelect(selectedWeapon, partner)}
              style={{
                border:       `1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`,
                background:   `color-mix(in srgb, var(--hud-gold) 10%, transparent)`,
                color:        'var(--hud-gold)',
                padding:      `2px ${SP[2]}`,
                fontSize:     FS.overline,
                fontWeight:   700,
                borderRadius: RADIUS.sm,
                cursor:       'pointer',
                fontFamily:   FONT_BODY,
                transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
                width:        'fit-content',
              }}
            >
              ⚔ Dual Wield available
            </button>
          </div>
        )
      })()}
```

Note: The "Dual Wield active ✓" variant (shown when dual wield IS active) is handled by the DualWieldReviewStep, which is rendered by the overlay at `state.dualWieldReview`. The compact button here is the "offer" button only.

- [ ] **Step 6: Fix remaining token violations**

Scan for:
- `fontFamily: "var(--font-body)"` → `FONT_BODY`
- `fontFamily: FONT_DISPLAY` → `FONT_BODY` (spec uses FONT_BODY for all step labels)
- Any remaining raw rgba or hex colours → use `color-mix()` or CSS vars
- `borderRadius: 8` or `borderRadius: 10` → `RADIUS.lg` or `RADIUS.xl`
- `margin: '12px 0 6px'` → `margin: \`${SP[2]} 0 ${SP[1]}\``

Remove unused imports: `FONT_DISPLAY`, `SYM_COLOR`, `DICE_COLOR` (the compact pills don't show dice pool previews or quality badges).

- [ ] **Step 7: TypeScript check and build**

```
npx tsc --noEmit
npm run build
```
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/combat-check/steps/WeaponSelectStep.tsx
git commit -m "feat(combat-check): weapon select — compact pills + dual wield button"
```

---

## Task 4: RangeBandStep — Compact Pills + Melee Opposed Box + Fallback + Token Fixes

**Files:**
- Modify: `src/components/combat-check/steps/RangeBandStep.tsx`

Note: `RangeBandStep` receives a new `targets?: AdversaryInstance[]` prop (added in this task) for the melee opposed box. Import `AdversaryInstance` and `getMeleeDifficulty` (already imported via combatCheckUtils).

- [ ] **Step 1: Update token import and remove `PURPLE`**

Replace line 14:
```ts
import { HUD, FS, FONT_DISPLAY, FONT_BODY, SYM_COLOR } from '@/lib/tokens'
```
With:
```ts
import { HUD, FS, FONT_BODY, SP, EASE, RADIUS, SYM_COLOR } from '@/lib/tokens'
```

Remove the `PURPLE` constant (line 22). Add `getMeleeDifficulty` to the combatCheckUtils import:
```ts
import {
  type RangeBand,
  RANGE_BAND_ORDER,
  RANGE_BAND_LABELS,
  RANGE_VALUE_MAP,
  getRangedDifficulty,
  getMeleeDifficulty,
  bandIndex,
} from '@/lib/combatCheckUtils'
```

Add `AdversaryInstance` import:
```ts
import type { AdversaryInstance } from '@/lib/adversaries'
```

- [ ] **Step 2: Add `targets` prop to `RangeBandStepProps`**

Replace the interface:
```ts
interface RangeBandStepProps {
  attackType:   'ranged' | 'melee'
  weapon:       { skillKey: string; refWeapon: RefWeapon | null } | null
  selectedBand: RangeBand | null
  onSelect:     (band: RangeBand) => void
}
```
With:
```ts
interface RangeBandStepProps {
  attackType:   'ranged' | 'melee'
  weapon:       { skillKey: string; refWeapon: RefWeapon | null } | null
  selectedBand: RangeBand | null
  targets?:     AdversaryInstance[]
  onSelect:     (band: RangeBand) => void
}
```

Update the function signature to destructure `targets = []`:
```tsx
export function RangeBandStep({ attackType, weapon, selectedBand, targets = [], onSelect }: RangeBandStepProps) {
```

- [ ] **Step 3: Replace the melee view with the opposed box + compact pill**

Replace the melee branch (lines 67–98):

```tsx
  // For melee, show opposed roll box + range pill(s)
  if (attackType === 'melee') {
    const primaryTarget  = targets[0] ?? null
    const meleeResult    = primaryTarget ? getMeleeDifficulty(primaryTarget) : null
    const isDefaulted    = meleeResult?.isDefault === true

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        {/* Opposed roll box */}
        {primaryTarget ? (
          <div style={{
            background:   'var(--hud-surface-mid, var(--hud-surface-lo))',
            border:       '1px solid var(--hud-border)',
            borderRadius: RADIUS.sm,
            padding:      `${SP[2]} ${SP[2]}`,
          }}>
            {isDefaulted ? (
              /* Fallback: no Melee skill found */
              <>
                <div style={{
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-accent)',
                  marginBottom: SP[1],
                }}>
                  ⚠ {meleeResult?.defaultNote ?? 'Target Melee skill not found — using rank 0'}
                </div>
                <div style={{
                  fontFamily:  FONT_BODY,
                  fontSize:    FS.overline,
                  color:       'var(--hud-text-faint)',
                  fontStyle:   'italic',
                }}>
                  PRF→CHL · ABL→DIF
                </div>
              </>
            ) : (
              /* Normal path: target Melee found */
              <>
                <div style={{
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-text-faint)',
                  marginBottom: SP[1],
                }}>
                  {primaryTarget.name}&apos;s Melee → difficulty:
                </div>
                <div style={{
                  display:      'flex',
                  gap:          SP[1],
                  alignItems:   'center',
                  marginBottom: SP[1],
                }}>
                  {meleeResult && Array.from({ length: meleeResult.challengeDice }).map((_, i) => (
                    <DiceFace key={`chl${i}`} type="challenge" size={16} />
                  ))}
                  {meleeResult && Array.from({ length: meleeResult.difficultyDice }).map((_, i) => (
                    <DiceFace key={`dif${i}`} type="difficulty" size={16} />
                  ))}
                  <span style={{
                    fontFamily:  FONT_BODY,
                    fontSize:    FS.overline,
                    color:       'var(--hud-text-dim)',
                    marginLeft:  SP[1],
                  }}>
                    {meleeResult?.challengeDice ?? 0} CHL · {meleeResult?.difficultyDice ?? 0} DIF
                  </span>
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize:   FS.overline,
                  color:      'var(--hud-text-faint)',
                  fontStyle:  'italic',
                }}>
                  PRF→CHL · ABL→DIF
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize:   FS.overline,
            color:      'var(--hud-text-faint)',
            fontStyle:  'italic',
          }}>
            No target selected — difficulty set by target&apos;s Melee skill at roll time.
          </div>
        )}

        {/* Engaged pill (always shown for melee) */}
        <CompactBandPill
          band="engaged"
          label="Engaged"
          difficultyDice={0}
          challengeDice={0}
          notes={primaryTarget ? [] : ['Opposed check — target Melee sets difficulty']}
          blocked={false}
          selected={selectedBand === 'engaged' || !canReachShort}
          onSelect={onSelect}
        />
        {canReachShort && (
          <CompactBandPill
            band="short"
            label="Short"
            difficultyDice={0}
            challengeDice={0}
            notes={['Extended reach — opposed difficulty unchanged']}
            blocked={false}
            selected={selectedBand === 'short'}
            onSelect={onSelect}
          />
        )}
      </div>
    )
  }
```

- [ ] **Step 4: Replace the ranged view to use `CompactBandPill`**

Replace the ranged return (lines 108–148):

```tsx
  // Ranged
  const refW    = weapon?.refWeapon
  const skillKey = weapon?.skillKey ?? 'RANGLT'
  const maxRange = refW?.range_value ? (RANGE_VALUE_MAP[refW.range_value] ?? 'extreme') : 'extreme'

  const DIFF_LABELS = ['—', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
      {RANGE_BAND_ORDER.map(band => {
        const result    = getRangedDifficulty(band, skillKey, maxRange)
        const blocked   = result.blocked
        const label     = RANGE_BAND_LABELS[band]
        const atMaxRange  = !blocked && bandIndex(band) === bandIndex(maxRange)
        const beyondMax   = !blocked && bandIndex(band) > bandIndex(maxRange)

        return (
          <CompactBandPill
            key={band}
            band={band}
            label={label}
            difficultyDice={result.difficultyDice}
            challengeDice={result.challengeDice}
            notes={result.notes}
            blocked={blocked}
            selected={selectedBand === band}
            atMaxRange={atMaxRange}
            beyondMax={beyondMax}
            onSelect={onSelect}
          />
        )
      })}
      <div style={{
        fontFamily:   FONT_BODY,
        fontSize:     FS.overline,
        color:        'var(--hud-text-dim)',
        lineHeight:   1.4,
        padding:      `${SP[1]} ${SP[2]}`,
        background:   'var(--hud-surface-lo)',
        borderRadius: RADIUS.sm,
        border:       '1px solid var(--hud-border)',
        marginTop:    SP[1],
      }}>
        Max range: <strong style={{ color: HUD.gold }}>{RANGE_BAND_LABELS[maxRange]}</strong>.
      </div>
    </div>
  )
```

- [ ] **Step 5: Replace `BandCard` with `CompactBandPill`**

Remove the entire `BandCard` component (lines 151–224). Replace with:

```tsx
function CompactBandPill({
  band, label, difficultyDice, challengeDice, notes,
  blocked, selected, atMaxRange, beyondMax, onSelect,
}: {
  band:            RangeBand
  label:           string
  difficultyDice:  number
  challengeDice:   number
  notes:           string[]
  blocked:         boolean
  selected:        boolean
  atMaxRange?:     boolean
  beyondMax?:      boolean
  onSelect:        (b: RangeBand) => void
}) {
  const isHighlight = atMaxRange || beyondMax

  return (
    <button
      onClick={() => !blocked && onSelect(band)}
      disabled={blocked}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          SP[2],
        padding:      `2px ${SP[2]}`,
        borderRadius: RADIUS.sm,
        border:       selected
          ? `1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`
          : isHighlight
          ? `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`
          : '1px solid var(--hud-border)',
        background:   selected
          ? `color-mix(in srgb, var(--hud-gold) 8%, transparent)`
          : 'transparent',
        cursor:       blocked ? 'not-allowed' : 'pointer',
        opacity:      blocked ? 0.35 : 1,
        width:        '100%',
        textAlign:    'left' as const,
        fontFamily:   FONT_BODY,
        transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
        marginBottom: SP[1],
      }}
    >
      {/* Range name */}
      <span style={{
        fontSize:  FS.overline,
        fontWeight: 700,
        color:     blocked ? 'var(--hud-text-faint)' : selected ? 'var(--hud-gold)' : 'var(--hud-text)',
        minWidth:  '3.5rem',
      }}>
        {label}
      </span>

      {/* Difficulty dice */}
      {!blocked && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
          {Array.from({ length: challengeDice }).map((_, i) => (
            <DiceFace key={`c${i}`} type="challenge" size={14} />
          ))}
          {Array.from({ length: difficultyDice }).map((_, i) => (
            <DiceFace key={`d${i}`} type="difficulty" size={14} />
          ))}
          {challengeDice === 0 && difficultyDice === 0 && (
            <span style={{ fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>Simple</span>
          )}
        </div>
      )}
      {blocked && (
        <span style={{ fontSize: FS.overline, color: SYM_COLOR.failure }}>Out of range</span>
      )}

      {/* Right-side note */}
      <span style={{ marginLeft: 'auto', fontSize: FS.overline, fontStyle: 'italic', color: 'var(--hud-accent)', flexShrink: 0 }}>
        {atMaxRange && 'max range'}
        {beyondMax && !atMaxRange && notes[0]}
        {!atMaxRange && !beyondMax && notes.length > 0 && (
          <span style={{ color: 'var(--hud-accent)' }}>{notes.join(' · ')}</span>
        )}
      </span>
    </button>
  )
}
```

Remove `DifficultyDice` helper (no longer used) and the old `BandCard` component entirely.

- [ ] **Step 6: Fix remaining token violations**

- `fontFamily: "var(--font-body)"` → `FONT_BODY`
- `borderRadius: 6` → `RADIUS.lg`
- `fontFamily: FONT_DISPLAY` → `FONT_BODY`
- Remove unused `FONT_DISPLAY` import

- [ ] **Step 7: TypeScript check and build**

```
npx tsc --noEmit
npm run build
```
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/combat-check/steps/RangeBandStep.tsx
git commit -m "feat(combat-check): range band step — compact pills + melee opposed box + fallback"
```

---

## Task 5: Final Verification

**Files:** All four modified files, plus running the dev server.

- [ ] **Step 1: Full TypeScript check**

```
npx tsc --noEmit
```
Expected: zero errors across all files.

- [ ] **Step 2: Full build**

```
npm run build
```
Expected: clean build, zero errors or warnings.

- [ ] **Step 3: Token compliance self-audit (all four files)**

For each file, confirm:
- [ ] Zero raw hex/rgb colours (exceptions: `rgba(123,31,162,*)` in Downgrade button — pre-approved die-identity exception with inline comment; state-caution fallback `#FF9800` in `var(--state-caution, #FF9800)` is a CSS fallback not a direct use)
- [ ] Zero hardcoded px/rem font sizes in inline styles
- [ ] Zero hardcoded z-index numbers
- [ ] Zero hardcoded transition timing (`150ms`, `120ms`, `200ms`) — all use `EASE.*`
- [ ] Zero hardcoded border-radius numbers — all use `RADIUS.*`
- [ ] Zero `onMouseEnter`/`onMouseLeave` style mutations
- [ ] No `var(--token)HH` hex-suffix opacity patterns
- [ ] Spacing uses `SP[N]` or `var(--space-N)`

Report: "Token compliance — PASS" or list violations found.

- [ ] **Step 4: Acceptance criteria walkthrough**

Start dev server:
```
npm run dev
```

Open the GM view, trigger a combat check. Walk through:

1. **Header**: Shows `⌖ Combat Check` + `✕` only — no Back button, no step counter subtitle, no progress bar. ✓/✗
2. **Accordion**: All four visual steps visible simultaneously (Weapon & Target, Range Band/Melee, Dice Pool, Roll). ✓/✗
3. **Active step**: Gold left border + faint gold tint background on current step. ✓/✗
4. **Done steps**: 0.6 opacity, label shows `✓`, done summary shows. ✓/✗
5. **Locked steps**: 0.3 opacity, no interaction. ✓/✗
6. **Weapon pills**: Compact pills for each weapon — accent border/bg when selected. ✓/✗
7. **Dual wield button**: `⚔ Dual Wield available` compact pill in gold when applicable. ✓/✗
8. **Target pills**: Inline in visual step 1 at `currentStep===3` — same pill styling. ✓/✗
9. **Range pills (ranged)**: Compact pills with difficulty dice icons, max range label, beyond-max notes. ✓/✗
10. **Range pills (melee)**: Opposed roll box (target's Melee pool) shown above Engaged/Short pills. ✓/✗
11. **Melee fallback**: If target has no Melee skill (`isDefault===true`), box shows ⚠ warning with rank 0 note. ✓/✗
12. **Upgrade/Downgrade buttons**: Visible in Dice Pool step above manual adjustments. Upgrade → accent; Downgrade → purple. ✓/✗
13. **Negative adj values**: Display in accent colour in AdjustControl. ✓/✗
14. **Roll button**: Shows `Roll N Dice` with live count in visual step 4. Fires and shows result. ✓/✗
15. **Footer Next button**: Visible for steps 2–4, token-compliant, no gradient. ✓/✗
16. **Dot progress indicator**: 4 dots at bottom, gold fill shows visual progress. ✓/✗
17. **Theme check**: Test under Ember Tatooine and neutral themes — no hardcoded accent colours bleed through. ✓/✗

- [ ] **Step 5: Report compliance gate**

```
Token compliance:  PASS
Layout compliance: PASS
Mockup fidelity:   PASS
Build:             ✓ clean
TypeScript:        ✓ zero errors
```

If any item is not PASS, fix before reporting done.

- [ ] **Step 6: Update docs/architecture.md**

No new routes, hooks, or tables were added. The following components were modified (update the component list in architecture.md if the file has one):
- `CombatCheckOverlay` — accordion layout, compact header, visual step 4 Roll button
- `WeaponSelectStep` — compact pill layout
- `RangeBandStep` — compact pill layout, melee opposed box, accepts `targets` prop
- `DicePoolReviewStep` — upgrade/downgrade buttons, `onPoolChange` prop replaces `onRoll`, `challengeAdd` in `ManualAdjustments`

- [ ] **Step 7: Final commit**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture.md for combat check visual rebuild"
```
