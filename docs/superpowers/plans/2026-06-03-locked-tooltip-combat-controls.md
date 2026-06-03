# Locked Tooltip Combat Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 2-second hover-lock mechanic to the GM map token tooltip that reveals interactive wound/strain/group/vehicle controls, writing through the existing `saveEncounter()` path.

**Architecture:** Extract the five combat adjustment functions out of their respective panel components into a shared `useEncounterCombatControls` hook. Add a hover-lock timer in `MapCanvas` (per-token closure ref) that fires an `onTokenHoverLock` callback, managed in `GmMapView` with `lockedTokenId` state. Extend `TokenTooltip` (a `memo` component in GmMapView.tsx) with optional locked-state UI: pulse→glow CSS animations, `pointerEvents: auto`, and a controls section rendered only when locked.

**Tech Stack:** React 18 (hooks, memo, createPortal), TypeScript, Pixi.js (pointer events inside token closures), Supabase (existing write paths unchanged), CSS keyframe animations via `animations.css`.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| **Create** | `src/hooks/useEncounterCombatControls.ts` | Shared hook: 5 combat adjustment functions |
| **Modify** | `src/components/staging/EncounterAdversaryPanel.tsx` | Consume hook; remove 3 inlined functions |
| **Modify** | `src/components/staging/EncounterVehiclePanel.tsx` | Consume hook; remove 2 inlined functions |
| **Modify** | `src/components/map/MapCanvas.tsx` | Add `onTokenHoverLock` prop + per-token hover timer |
| **Modify** | `src/styles/animations.css` | Add `tooltipLockPulse` / `tooltipLockedGlow` keyframes |
| **Modify** | `src/components/gm/GmMapView.tsx` | Lock state, saveEncounter, vehicle tooltipProps, TokenTooltip extension |

---

## Task 1 — Create `useEncounterCombatControls` hook

**Files:**
- Create: `src/hooks/useEncounterCombatControls.ts`

- [ ] **Step 1.1 — Write the hook file**

```ts
'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyDamageToAdversary } from '@/lib/damageEngine'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'

type SupabaseClientType = ReturnType<typeof createClient>

interface UseEncounterCombatControlsOptions {
  onDefeat?:       (msg: string) => void
  onDisbandSquad?: (instanceId: string) => Promise<void>
}

interface UseEncounterCombatControlsParams {
  encounter:     CombatEncounter | null
  saveEncounter: (partial: Partial<CombatEncounter>) => Promise<void>
  supabase:      SupabaseClientType
  campaignId:    string
  options?:      UseEncounterCombatControlsOptions
}

export function useEncounterCombatControls({
  encounter,
  saveEncounter,
  supabase,
  campaignId,
  options,
}: UseEncounterCombatControlsParams) {

  const adjustAdversaryWounds = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter) return
    const currentWounds = adv.woundsCurrent ?? 0
    const clampedDelta  = delta < 0 ? Math.max(delta, -currentWounds) : delta
    if (clampedDelta === 0 && delta < 0) return

    const wasDefeated = adv.type === 'minion'
      ? adv.groupRemaining === 0
      : currentWounds >= adv.woundThreshold

    const result = applyDamageToAdversary({
      type: adv.type, name: adv.name,
      woundThreshold: adv.woundThreshold,
      groupSize: adv.groupSize, groupRemaining: adv.groupRemaining,
      woundsCurrent: currentWounds,
    }, clampedDelta)

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const pct = adv.type === 'minion'
        ? 1 - (result.groupRemaining / Math.max(1, adv.groupSize))
        : Math.min(1, result.woundsCurrent / Math.max(1, adv.woundThreshold))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', advSlot.id)
        .eq('campaign_id', campaignId)
    }

    if (!wasDefeated && result.isDefeated && encounter.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
      options?.onDefeat?.(msg)
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   encounter.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: msg,
        is_visible_to_players: true,
      })
      if (adv.squad_active) await options?.onDisbandSquad?.(adv.instanceId)
    }
  }, [encounter, campaignId, saveEncounter, supabase, options]) // eslint-disable-line react-hooks/exhaustive-deps

  const adjustAdversaryStrain = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'nemesis') return
    const strainMax = adv.strainThreshold ?? 0
    const current   = adv.strainCurrent ?? 0
    const next      = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))
    const updated   = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: next }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  const adjustGroupSize = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'minion') return
    const newGroupSize = Math.max(1, adv.groupSize + delta)
    if (newGroupSize === adv.groupSize) return

    let newGroupRemaining: number
    let newWoundsCurrent: number
    if (delta > 0) {
      newGroupRemaining = adv.groupRemaining + 1
      newWoundsCurrent  = adv.woundsCurrent ?? 0
    } else {
      newGroupRemaining = Math.min(adv.groupRemaining, newGroupSize)
      newWoundsCurrent  = Math.min(adv.woundsCurrent ?? 0, adv.woundThreshold * newGroupSize)
    }

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, groupSize: newGroupSize, groupRemaining: newGroupRemaining, woundsCurrent: newWoundsCurrent }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const pct = 1 - (newGroupRemaining / Math.max(1, newGroupSize))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', advSlot.id)
        .eq('campaign_id', campaignId)
    }
  }, [encounter, campaignId, saveEncounter, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const adjustHullTrauma = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.hullTraumaThreshold, vehicle.hullTraumaCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: next }
    )
    await saveEncounter({ vehicles: updated })

    const vSlot = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
    if (vSlot) {
      const pct = Math.min(1, next / Math.max(1, vehicle.hullTraumaThreshold))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', vSlot.id)
        .eq('campaign_id', campaignId)
    }

    const wasDisabled = vehicle.hullTraumaCurrent >= vehicle.hullTraumaThreshold
    if (!wasDisabled && next >= vehicle.hullTraumaThreshold && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   encounter.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: `${vehicle.name} — DISABLED (Hull Trauma ${next}/${vehicle.hullTraumaThreshold})`,
        is_visible_to_players: true,
      })
    }
  }, [encounter, campaignId, saveEncounter, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const adjustSystemStrain = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.systemStrainThreshold, vehicle.systemStrainCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: next }
    )
    await saveEncounter({ vehicles: updated })
  }, [encounter, saveEncounter])

  return { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain }
}
```

- [ ] **Step 1.2 — Verify TypeScript**

```
cd C:\Projects\Holocron\star-wars-rpg && npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 1.3 — Commit**

```
git add src/hooks/useEncounterCombatControls.ts
git commit -m "feat: extract combat adjustment functions into useEncounterCombatControls hook"
```

---

## Task 2 — Update `EncounterAdversaryPanel.tsx` to consume the hook

**Files:**
- Modify: `src/components/staging/EncounterAdversaryPanel.tsx`

**Context:** The panel defines `adjustAdversaryWounds` (lines 148–192), `adjustAdversaryStrain` (195–204), and `adjustGroupSize` (207–234) locally. `handleDisbandSquad` is defined at line 321. `setDefeatNotif` is local state at line 137. The hook call must come **after** `handleDisbandSquad` so we can pass it directly.

- [ ] **Step 2.1 — Add import**

At the top of `EncounterAdversaryPanel.tsx`, add after the existing imports:

```ts
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
```

- [ ] **Step 2.2 — Delete the three inlined functions**

Remove lines 148–234 in their entirety (the three `useCallback` blocks for `adjustAdversaryWounds`, `adjustAdversaryStrain`, and `adjustGroupSize`, including their JSDoc comment headers).

- [ ] **Step 2.3 — Add hook call after `handleDisbandSquad`**

`handleDisbandSquad` ends at approximately the line that has `}, [encounter, campaignId, saveEncounter])` after the squad logic. Immediately after that closing line, insert:

```ts
  /* ── shared combat controls hook ────────────────────────── */
  const { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize } =
    useEncounterCombatControls({
      encounter,
      saveEncounter,
      supabase,
      campaignId,
      options: {
        onDefeat: (msg) => {
          setDefeatNotif({ message: msg })
          setTimeout(() => setDefeatNotif(null), 5000)
        },
        onDisbandSquad: handleDisbandSquad,
      },
    })
```

- [ ] **Step 2.4 — Verify TypeScript and build**

```
npx tsc --noEmit && npm run build
```
Expected: zero errors, clean build.

- [ ] **Step 2.5 — Commit**

```
git add src/components/staging/EncounterAdversaryPanel.tsx
git commit -m "refactor(EncounterAdversaryPanel): consume useEncounterCombatControls hook"
```

---

## Task 3 — Update `EncounterVehiclePanel.tsx` to consume the hook

**Files:**
- Modify: `src/components/staging/EncounterVehiclePanel.tsx`

**Context:** The panel defines `adjustHullTrauma` (lines 43–66) and `adjustSystemStrain` (68–75) locally. Both are standalone and have no local-state dependencies.

- [ ] **Step 3.1 — Add import**

```ts
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
```

- [ ] **Step 3.2 — Delete the two inlined functions**

Remove lines 43–75 (the two `useCallback` blocks for `adjustHullTrauma` and `adjustSystemStrain`).

- [ ] **Step 3.3 — Add hook call after `saveEncounter`**

Immediately after the `saveEncounter` `useCallback` (the `}, [encounter?.id])` closing line), insert:

```ts
  const { adjustHullTrauma, adjustSystemStrain } = useEncounterCombatControls({
    encounter,
    saveEncounter,
    supabase,
    campaignId,
  })
```

- [ ] **Step 3.4 — Verify TypeScript and build**

```
npx tsc --noEmit && npm run build
```
Expected: zero errors, clean build.

- [ ] **Step 3.5 — Commit**

```
git add src/components/staging/EncounterVehiclePanel.tsx
git commit -m "refactor(EncounterVehiclePanel): consume useEncounterCombatControls hook"
```

---

## Task 4 — Add `onTokenHoverLock` to `MapCanvas.tsx`

**Files:**
- Modify: `src/components/map/MapCanvas.tsx`

**Context:** The file has a `MapCanvasProps` interface (line ~26–42). Tokens are built in a `buildToken` function (line ~420+). Each token's event handlers are attached via Pixi `.on()` calls. The hover timer lives in a **per-token closure variable** (not a React ref) so each token owns its own timer.

- [ ] **Step 4.1 — Add prop to `MapCanvasProps`**

In the `MapCanvasProps` interface, after `onTokenDragEnd?`, add:

```ts
  onTokenHoverLock?: (tokenId: string) => void
```

- [ ] **Step 4.2 — Add to destructuring and ref**

In the `MapCanvas` function destructuring (line ~47–48), add `onTokenHoverLock` to the param list.

After the `onTokenDragEndRef` ref lines (~73–74), add:

```ts
  const onTokenHoverLockRef = useRef(onTokenHoverLock)
  onTokenHoverLockRef.current = onTokenHoverLock
```

Pass `onTokenHoverLockRef` into the `buildToken` call's params list (the same place `onHoverRef`, `onDragStartRef` etc. are passed — around line 123 and line 476).

- [ ] **Step 4.3 — Add `onHoverLockRef` to `buildToken` signature**

In the `buildToken` function signature (line ~423–428), add:

```ts
  onHoverLockRef: React.MutableRefObject<((id: string) => void) | undefined>,
```

- [ ] **Step 4.4 — Add hover timer inside `buildToken` and wire to pointer events**

Inside `buildToken`, just before the first `.on('pointerover', ...)` attachment, add the timer variable and clear helper:

```ts
  let hoverLockTimer: ReturnType<typeof setTimeout> | null = null
  const clearHoverLockTimer = () => {
    if (hoverLockTimer) { clearTimeout(hoverLockTimer); hoverLockTimer = null }
  }
```

In the existing `pointerover` handler (line ~752–758), add at the **top** of the callback body (before the existing `onTokenPointerOver` call):

```ts
    clearHoverLockTimer()
    hoverLockTimer = setTimeout(() => {
      hoverLockTimer = null
      onHoverLockRef.current?.(token.id)
    }, 2000)
```

In the existing `pointerout` handler (line ~760–763), add at the **top** of the callback body:

```ts
    clearHoverLockTimer()
```

After `pointerout`, **before** the `if (!canDrag) return c` guard, add a general pointerdown timer-cancel (fires for ALL tokens, not just draggable):

```ts
  ;(c as any).on('pointerdown', clearHoverLockTimer)
```

- [ ] **Step 4.5 — Verify TypeScript and build**

```
npx tsc --noEmit && npm run build
```
Expected: zero errors. The prop is optional so the player map view (`HudSessionTab.tsx`) is unaffected — it never passes `onTokenHoverLock`.

- [ ] **Step 4.6 — Commit**

```
git add src/components/map/MapCanvas.tsx
git commit -m "feat(MapCanvas): add onTokenHoverLock prop with 2s per-token hover timer"
```

---

## Task 5 — Add CSS animations to `animations.css`

**Files:**
- Modify: `src/styles/animations.css`

**Context:** The file already has `charCardGlow` keyframe and `.char-card--glow` class (lines ~247–269) using `var(--hud-accent)`. The new keyframes follow the same pattern. `--hud-accent` is theme-aware: cyan for Kyber Archive, red for Ember Tatooine.

- [ ] **Step 5.1 — Add keyframes and classes**

After the char-card section (after the `.char-card-hint-arrow` rule, around line 311), insert:

```css
/* ── Tooltip lock animations ─────────────────────────────── */
@keyframes tooltipLockPulse {
  0%   { box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 0   color-mix(in srgb, var(--hud-accent)  0%, transparent); }
  50%  { box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 2px var(--hud-accent), 0 0 20px color-mix(in srgb, var(--hud-accent) 45%, transparent); }
  100% { box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px color-mix(in srgb, var(--hud-accent) 30%, transparent), 0 0 10px color-mix(in srgb, var(--hud-accent) 20%, transparent); }
}

@keyframes tooltipLockedGlow {
  0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px color-mix(in srgb, var(--hud-accent) 25%, transparent), 0 0  8px color-mix(in srgb, var(--hud-accent) 15%, transparent); }
  50%       { box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px color-mix(in srgb, var(--hud-accent) 50%, transparent), 0 0 16px color-mix(in srgb, var(--hud-accent) 30%, transparent); }
}

.tooltip-lock-pulse {
  animation: tooltipLockPulse 600ms ease-out forwards;
}

.tooltip-locked-glow {
  animation: tooltipLockedGlow 2s ease-in-out infinite;
}
```

- [ ] **Step 5.2 — Verify build**

```
npm run build
```
Expected: clean build (CSS-only change).

- [ ] **Step 5.3 — Commit**

```
git add src/styles/animations.css
git commit -m "feat: add tooltipLockPulse and tooltipLockedGlow CSS animations"
```

---

## Task 6 — GmMapView.tsx: lock state, saveEncounter, mechanic, vehicle tooltipProps

**Files:**
- Modify: `src/components/gm/GmMapView.tsx`

This task covers everything in GmMapView **except** the `TokenTooltip` component changes (those are Task 7).

### 6a — Imports and new state/refs

- [ ] **Step 6a.1 — Add imports**

In the import block at the top of GmMapView.tsx:

```ts
// Add to the existing lib/adversaries import line — AdversaryInstance already imported, no change needed.
import type { VehicleInstance } from '@/lib/vehicles'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
// CombatEncounter is already imported — no change needed.
```

- [ ] **Step 6a.2 — Add new state and refs**

After `const isDraggingRef = useRef(false)` (line 304), insert:

```ts
  const [lockedTokenId, setLockedTokenId] = useState<string | null>(null)
  const [lockedPos,     setLockedPos]     = useState<{ x: number; y: number } | null>(null)
  const lastTooltipPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const tooltipRef        = useRef<HTMLDivElement | null>(null)
```

### 6b — saveEncounter and hook instantiation

- [ ] **Step 6b.1 — Add `saveEncounter` callback**

After the `tooltipRef` ref line (from step 6a.2), insert:

```ts
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    adjustAdversaryWounds,
    adjustAdversaryStrain,
    adjustGroupSize,
    adjustHullTrauma,
    adjustSystemStrain,
  } = useEncounterCombatControls({
    encounter,
    saveEncounter,
    supabase,
    campaignId: campaignId ?? '',
  })
```

### 6c — Modify hover handlers and add lock handler

- [ ] **Step 6c.1 — Modify `handleTokenHover`**

Replace the existing `handleTokenHover` (lines 688–691):

```ts
  const handleTokenHover = useCallback((tokenId: string, screenX: number, screenY: number) => {
    if (isDraggingRef.current) return
    if (lockedTokenId !== null) return
    lastTooltipPosRef.current = { x: screenX, y: screenY }
    setTooltipState({ tokenId, x: screenX, y: screenY })
  }, [lockedTokenId])
```

- [ ] **Step 6c.2 — Modify `handleTokenHoverEnd`**

Replace the existing `handleTokenHoverEnd` (lines 693–695):

```ts
  const handleTokenHoverEnd = useCallback(() => {
    if (lockedTokenId !== null) return
    setTooltipState(null)
  }, [lockedTokenId])
```

- [ ] **Step 6c.3 — Add `handleTokenHoverLock`**

After `handleTokenHoverEnd`, insert:

```ts
  const handleTokenHoverLock = useCallback((tokenId: string) => {
    setLockedTokenId(tokenId)
    setLockedPos({ x: lastTooltipPosRef.current.x, y: lastTooltipPosRef.current.y })
  }, [])
```

### 6d — Outside-click dismiss effect

- [ ] **Step 6d.1 — Add the dismiss useEffect**

After the `handleTokenHoverLock` callback, insert:

```ts
  useEffect(() => {
    if (!lockedTokenId) return
    const handleOutsideClick = (e: PointerEvent) => {
      if (tooltipRef.current && tooltipRef.current.contains(e.target as Node)) return
      setLockedTokenId(null)
      setLockedPos(null)
      setTooltipState(null)
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [lockedTokenId])
```

### 6e — Wire `onTokenHoverLock` to MapCanvas

- [ ] **Step 6e.1 — Pass callback to MapCanvas**

In the `<MapCanvas>` JSX (around line 727–741), add after `onTokenDragEnd={handleTokenDragEnd}`:

```tsx
              onTokenHoverLock={handleTokenHoverLock}
```

### 6f — Derive `activeTooltipState` and extend `tooltipProps`

- [ ] **Step 6f.1 — Add `activeTooltipState` memo**

Find the `const tooltipProps = useMemo(...)` (line 390). Immediately **before** it, insert:

```ts
  const activeTooltipState = useMemo(() => {
    if (lockedTokenId && lockedPos) return { tokenId: lockedTokenId, x: lockedPos.x, y: lockedPos.y }
    return tooltipState
  }, [lockedTokenId, lockedPos, tooltipState])
```

- [ ] **Step 6f.2 — Update `tooltipProps` useMemo to use `activeTooltipState`**

Inside the `tooltipProps` useMemo body, replace every occurrence of `tooltipState` with `activeTooltipState`. There are four occurrences:
- `if (!tooltipState) return null` → `if (!activeTooltipState) return null`
- `const token = tokensById.get(tooltipState.tokenId)` → `tokensById.get(activeTooltipState.tokenId)`
- `x: tooltipState.x, y: tooltipState.y` (in the PC branch return) → `activeTooltipState.x, y: activeTooltipState.y`
- `x: tooltipState.x, y: tooltipState.y` (in the adversary branch return) → same replacement

Also update the useMemo dependency array: replace `tooltipState` with `activeTooltipState` in the dep array.

- [ ] **Step 6f.3 — Add `adversaryInstance: adv` to the adversary branch return**

In the adversary `return { ... }` block (currently ending after `minionGroup: ...`), add:

```ts
            adversaryInstance: adv,
```

- [ ] **Step 6f.4 — Extend the vehicle branch return**

Replace the vehicle branch return (currently lines 437–442):

```ts
        if (veh) return {
          x: activeTooltipState.x, y: activeTooltipState.y,
          name: veh.name,
          typeLabel: 'Vehicle',
          typeColor: veh.alignment === 'allied_npc' ? '#4EC87A' : '#E05252',
          hullTrauma:   { current: veh.hullTraumaCurrent,  max: veh.hullTraumaThreshold },
          systemStrain: { current: veh.systemStrainCurrent, max: veh.systemStrainThreshold },
          vehicleInstance: veh,
        }
```

- [ ] **Step 6f.5 — Add live adversary/vehicle memos for the locked tooltip**

After the `tooltipProps` useMemo, add:

```ts
  const lockedAdversary = useMemo<AdversaryInstance | null>(() => {
    if (!lockedTokenId || !encounter) return null
    const token = tokensById.get(lockedTokenId)
    if (!token?.slot_key) return null
    const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
    if (!slot?.adversaryInstanceId) return null
    return encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId) ?? null
  }, [lockedTokenId, encounter, tokensById])

  const lockedVehicle = useMemo<VehicleInstance | null>(() => {
    if (!lockedTokenId || !encounter) return null
    const token = tokensById.get(lockedTokenId)
    if (!token?.slot_key) return null
    const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
    if (!slot?.vehicleInstanceId) return null
    return (encounter.vehicles ?? []).find(v => v.instanceId === slot.vehicleInstanceId) ?? null
  }, [lockedTokenId, encounter, tokensById])
```

### 6g — Update TokenTooltip render site

- [ ] **Step 6g.1 — Update the render call**

Replace the existing tooltip render (lines 1063–1065):

```tsx
        {/* ── Token tooltip (hover + locked) ── */}
        {mounted && (tooltipState || lockedTokenId) && tooltipProps && (
          <TokenTooltip
            {...tooltipProps}
            isLocked={lockedTokenId !== null && lockedTokenId === activeTooltipState?.tokenId}
            tooltipRef={tooltipRef}
            adversaryInstance={lockedAdversary ?? undefined}
            vehicleInstance={lockedVehicle ?? undefined}
            onAdjustWounds={adjustAdversaryWounds}
            onAdjustStrain={adjustAdversaryStrain}
            onAdjustGroupSize={adjustGroupSize}
            onAdjustHullTrauma={adjustHullTrauma}
            onAdjustSystemStrain={adjustSystemStrain}
          />
        )}
```

- [ ] **Step 6g.2 — Verify TypeScript**

```
npx tsc --noEmit
```
Expected: TypeScript will error on `TokenTooltipData` not yet having the new fields — that's correct at this stage. Task 7 extends the interface.

- [ ] **Step 6g.3 — Commit (after Task 7 makes TS clean)**

Hold this commit until Task 7 completes and `npx tsc --noEmit` is clean.

---

## Task 7 — Extend `TokenTooltip` in GmMapView.tsx

**Files:**
- Modify: `src/components/gm/GmMapView.tsx` (continued — the `TokenTooltip` section, lines 1173–1299)

### 7a — Extend `TokenTooltipData` interface

- [ ] **Step 7a.1 — Extend the interface**

Replace the `TokenTooltipData` interface (lines 1174–1187) with:

```ts
interface TokenTooltipData {
  x:              number
  y:              number
  name:           string
  typeLabel:      string
  typeColor:      string
  characteristics?: { brawn: number; agility: number; intellect: number; cunning: number; willpower: number; presence: number }
  soak?:          number | null
  defMelee?:      number | null
  defRanged?:     number | null
  wounds?:        { current: number; max: number }
  strain?:        { current: number; max: number }
  minionGroup?:   { alive: number; total: number }
  // Vehicle health (for hover bars and locked controls)
  hullTrauma?:    { current: number; max: number }
  systemStrain?:  { current: number; max: number }
  // Live instances — present when locked, for writing controls
  adversaryInstance?:   AdversaryInstance
  vehicleInstance?:     VehicleInstance
  // Lock state
  isLocked?:            boolean
  tooltipRef?:          React.RefObject<HTMLDivElement | null>
  // Control callbacks — only invoked when isLocked
  onAdjustWounds?:       (adv: AdversaryInstance, delta: number) => void
  onAdjustStrain?:       (adv: AdversaryInstance, delta: number) => void
  onAdjustGroupSize?:    (adv: AdversaryInstance, delta: number) => void
  onAdjustHullTrauma?:   (veh: VehicleInstance, delta: number) => void
  onAdjustSystemStrain?: (veh: VehicleInstance, delta: number) => void
}
```

### 7b — Add `ControlRow` helper component

- [ ] **Step 7b.1 — Add `ControlRow` before `TokenTooltip`**

Immediately before `const TOOLTIP_W = 230`, insert:

```tsx
function ControlRow({
  label, current, max, onDecrement, onIncrement, decrementDisabled, incrementDisabled,
}: {
  label:               string
  current:             number
  max:                 number
  onDecrement:         () => void
  onIncrement:         () => void
  decrementDisabled:   boolean
  incrementDisabled:   boolean
}) {
  const btnBase: React.CSSProperties = {
    width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: RADIUS.sm,
    fontFamily: FONT_BODY, fontSize: FS_SM,
    color: TEXT, lineHeight: 1, padding: 0, userSelect: 'none',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: current >= max ? 'var(--state-failure)' : TEXT, minWidth: '2.5rem', textAlign: 'center' }}>
        {current}/{max}
      </span>
      <button
        onClick={onDecrement}
        disabled={decrementDisabled}
        style={{ ...btnBase, cursor: decrementDisabled ? 'not-allowed' : 'pointer', opacity: decrementDisabled ? 0.35 : 1 }}
      >−</button>
      <button
        onClick={onIncrement}
        disabled={incrementDisabled}
        style={{ ...btnBase, cursor: incrementDisabled ? 'not-allowed' : 'pointer', opacity: incrementDisabled ? 0.35 : 1 }}
      >+</button>
    </div>
  )
}
```

### 7c — Modify `TokenTooltip` component

- [ ] **Step 7c.1 — Add `useState` import**

`useState` is already imported in GmMapView.tsx — no change needed. ✓

- [ ] **Step 7c.2 — Replace the `TokenTooltip` component body**

Replace `const TokenTooltip = memo(function TokenTooltip(p: TokenTooltipData) {` through the closing `})` (lines 1193–1299) with:

```tsx
const TokenTooltip = memo(function TokenTooltip(p: TokenTooltipData) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (!p.isLocked) { setIsPulsing(false); return }
    setIsPulsing(true)
    const t = setTimeout(() => setIsPulsing(false), 600)
    return () => clearTimeout(t)
  }, [p.isLocked])

  const vw   = typeof window !== 'undefined' ? window.innerWidth  : 1200
  const vh   = typeof window !== 'undefined' ? window.innerHeight : 800
  const left = Math.max(8, Math.min(p.x + 14, vw - TOOLTIP_W - 8))
  const top  = Math.max(8, Math.min(p.y - 12, vh - 300))

  const animClass = p.isLocked
    ? (isPulsing ? 'tooltip-lock-pulse' : 'tooltip-locked-glow')
    : ''

  return createPortal(
    <div
      ref={p.tooltipRef}
      className={animClass}
      style={{
        position: 'fixed', left, top, width: TOOLTIP_W,
        zIndex: 'var(--z-tooltip)' as unknown as number,
        background: PANEL_BG,
        border: `1px solid ${p.typeColor}44`,
        borderRadius: RADIUS.lg,
        boxShadow: p.isLocked
          ? undefined
          : `0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px ${p.typeColor}18`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '0.625rem 0.75rem',
        pointerEvents: p.isLocked ? 'auto' : 'none',
      }}
    >
      {/* Name + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.typeColor, background: `${p.typeColor}18`, border: `1px solid ${p.typeColor}35`, borderRadius: RADIUS.sm, padding: '1px 0.3125rem', flexShrink: 0 }}>{p.typeLabel}</div>
      </div>

      {/* Characteristics grid */}
      {p.characteristics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.1875rem', marginBottom: '0.5rem' }}>
          {CHAR_ABBRS.map((abbr, i) => (
            <div key={abbr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem 0.125rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>{abbr}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.gold }}>{p.characteristics![CHAR_KEYS[i]]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Soak + Defense */}
      {(p.soak != null || p.defMelee != null || p.defRanged != null) && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {p.soak != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>SOAK</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.soak}</div>
            </div>
          )}
          {p.defMelee != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF M</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defMelee}</div>
            </div>
          )}
          {p.defRanged != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: '0.25rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.04em' }}>DEF R</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{p.defRanged}</div>
            </div>
          )}
        </div>
      )}

      {/* Minion group count (hover — read-only pips) */}
      {p.minionGroup && !p.isLocked && (
        <div style={{ marginBottom: '0.375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Group</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.minionGroup.alive === 0 ? 'var(--state-failure)' : TEXT }}>
              {p.minionGroup.alive}/{p.minionGroup.total} alive
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.1875rem' }}>
            {Array.from({ length: p.minionGroup.total }).map((_, i) => (
              <span key={i} style={{ fontSize: '0.5625rem', color: i < p.minionGroup!.alive ? p.typeColor : 'rgba(255,255,255,0.15)' }}>
                {i < p.minionGroup!.alive ? '■' : '□'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wounds bar */}
      {p.wounds && (
        <div style={{ marginBottom: p.strain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wounds</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.wounds.current >= p.wounds.max ? 'var(--state-failure)' : TEXT }}>{p.wounds.current}/{p.wounds.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.wounds.current / Math.max(p.wounds.max, 1)) * 100)}%`, background: p.wounds.current >= p.wounds.max ? 'var(--state-failure)' : 'var(--hud-gold)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}

      {/* Strain bar */}
      {p.strain && (
        <div style={{ marginTop: p.wounds ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Strain</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.strain.current >= p.strain.max ? 'var(--state-failure)' : TEXT }}>{p.strain.current}/{p.strain.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.strain.current / Math.max(p.strain.max, 1)) * 100)}%`, background: p.strain.current >= p.strain.max ? 'var(--state-failure)' : 'var(--state-success)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}

      {/* Vehicle health bars (hover — read-only) */}
      {p.hullTrauma && !p.isLocked && (
        <div style={{ marginBottom: p.systemStrain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hull Trauma</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.hullTrauma.current >= p.hullTrauma.max ? 'var(--state-failure)' : TEXT }}>{p.hullTrauma.current}/{p.hullTrauma.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.hullTrauma.current / Math.max(p.hullTrauma.max, 1)) * 100)}%`, background: p.hullTrauma.current >= p.hullTrauma.max ? 'var(--state-failure)' : 'var(--hud-gold)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}
      {p.systemStrain && !p.isLocked && (
        <div style={{ marginTop: p.hullTrauma ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1875rem' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sys Strain</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700, color: p.systemStrain.current >= p.systemStrain.max ? 'var(--state-failure)' : TEXT }}>{p.systemStrain.current}/{p.systemStrain.max}</span>
          </div>
          <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.systemStrain.current / Math.max(p.systemStrain.max, 1)) * 100)}%`, background: p.systemStrain.current >= p.systemStrain.max ? 'var(--state-failure)' : 'var(--state-success)', borderRadius: RADIUS.sm }} />
          </div>
        </div>
      )}

      {/* ── Locked combat controls ── */}
      {p.isLocked && (p.adversaryInstance || p.vehicleInstance) && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>

          {/* Adversary controls */}
          {p.adversaryInstance && (() => {
            const adv = p.adversaryInstance!
            const woundsCurrent = adv.woundsCurrent ?? 0
            const woundsMax = adv.type === 'minion' && adv.groupSize
              ? (adv.woundThreshold ?? 0) * adv.groupSize
              : (adv.woundThreshold ?? 0)
            return (
              <>
                <ControlRow
                  label="WOUNDS"
                  current={woundsCurrent}
                  max={woundsMax}
                  onDecrement={() => void p.onAdjustWounds?.(adv, -1)}
                  onIncrement={() => void p.onAdjustWounds?.(adv, +1)}
                  decrementDisabled={woundsCurrent <= 0}
                  incrementDisabled={woundsCurrent >= woundsMax}
                />
                {adv.type === 'nemesis' && (
                  <ControlRow
                    label="STRAIN"
                    current={adv.strainCurrent ?? 0}
                    max={adv.strainThreshold ?? 0}
                    onDecrement={() => void p.onAdjustStrain?.(adv, -1)}
                    onIncrement={() => void p.onAdjustStrain?.(adv, +1)}
                    decrementDisabled={(adv.strainCurrent ?? 0) <= 0}
                    incrementDisabled={(adv.strainCurrent ?? 0) >= (adv.strainThreshold ?? 0)}
                  />
                )}
                {adv.type === 'minion' && (
                  <>
                    <ControlRow
                      label="GROUP"
                      current={adv.groupRemaining ?? 0}
                      max={adv.groupSize ?? 0}
                      onDecrement={() => void p.onAdjustGroupSize?.(adv, -1)}
                      onIncrement={() => void p.onAdjustGroupSize?.(adv, +1)}
                      decrementDisabled={(adv.groupSize ?? 0) <= 1}
                      incrementDisabled={false}
                    />
                    <div style={{ display: 'flex', gap: '0.1875rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      {Array.from({ length: adv.groupSize ?? 0 }).map((_, i) => (
                        <span key={i} style={{
                          fontSize: '0.5625rem',
                          color: i < (adv.groupRemaining ?? 0) ? p.typeColor : 'var(--state-failure)',
                        }}>
                          {i < (adv.groupRemaining ?? 0) ? '■' : '×'}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </>
            )
          })()}

          {/* Vehicle controls */}
          {p.vehicleInstance && (() => {
            const veh = p.vehicleInstance!
            return (
              <>
                <ControlRow
                  label="HULL TRAUMA"
                  current={veh.hullTraumaCurrent}
                  max={veh.hullTraumaThreshold}
                  onDecrement={() => void p.onAdjustHullTrauma?.(veh, -1)}
                  onIncrement={() => void p.onAdjustHullTrauma?.(veh, +1)}
                  decrementDisabled={veh.hullTraumaCurrent <= 0}
                  incrementDisabled={veh.hullTraumaCurrent >= veh.hullTraumaThreshold}
                />
                <ControlRow
                  label="SYS STRAIN"
                  current={veh.systemStrainCurrent}
                  max={veh.systemStrainThreshold}
                  onDecrement={() => void p.onAdjustSystemStrain?.(veh, -1)}
                  onIncrement={() => void p.onAdjustSystemStrain?.(veh, +1)}
                  decrementDisabled={veh.systemStrainCurrent <= 0}
                  incrementDisabled={veh.systemStrainCurrent >= veh.systemStrainThreshold}
                />
              </>
            )
          })()}

        </div>
      )}
    </div>,
    document.body,
  )
})
```

### 7d — Final verification

- [ ] **Step 7d.1 — TypeScript check**

```
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 7d.2 — Production build**

```
npm run build
```
Expected: clean build, all 12 pages generated.

- [ ] **Step 7d.3 — Grep for the gift emoji (should be zero)**

```
grep -r "🎁" src/
```
Expected: no matches (unrelated to this feature, but confirms no regressions).

- [ ] **Step 7d.4 — Commit Tasks 6+7 together**

```
git add src/components/gm/GmMapView.tsx
git commit -m "feat(GmMapView): locked tooltip combat controls — 2s hover lock, pulse/glow, wounds/strain/group/vehicle controls"
```

---

## Acceptance Criteria Checklist

After all tasks complete, verify each criterion manually:

- [ ] **AC1** Hover a GM map token for 2s → tooltip border pulses once then glows continuously using `--hud-accent`
- [ ] **AC2** Moving mouse away from a locked token does NOT dismiss the tooltip
- [ ] **AC3** Clicking outside the locked tooltip dismisses it; normal hover resumes
- [ ] **AC4** Dragging a token (pointerdown) cancels the timer; drag never triggers lock
- [ ] **AC5** Only one tooltip locked at a time; hovering other tokens while one is locked shows no new tooltip
- [ ] **AC6** Locked Minion: wounds −/+, group −/+, pip row updates live with red × for dead slots
- [ ] **AC7** Locked Rival: wounds −/+ only
- [ ] **AC8** Locked Nemesis: wounds −/+ and strain −/+
- [ ] **AC9** Locked Vehicle: hull trauma −/+ and system strain −/+
- [ ] **AC10** All writes go through `saveEncounter()`; Enemies/Vehicles panels reflect changes live; players see updates via Realtime
- [ ] **AC11** Minion wound threshold logic (auto-decrement group, wound reset) identical to Enemies panel
- [ ] **AC12** `EncounterAdversaryPanel` and `EncounterVehiclePanel` behaviour unchanged
- [ ] **AC13** Player map view (`HudSessionTab`) completely unaffected
- [ ] **AC14** `pointerEvents` is `'auto'` on locked tooltip, `'none'` otherwise

---

## Self-Review Notes

**Spec coverage confirmed:**
- ✅ Constraint 1 (pointerEvents flip): Task 7c, `pointerEvents: p.isLocked ? 'auto' : 'none'`
- ✅ Constraint 2 (setDefeatNotif / handleDisbandSquad): Task 1 `options?` param; Task 2 passes them
- ✅ Constraint 3 (vehicle tooltipProps extension): Task 6f.4
- ✅ Constraint 4 (saveEncounter local): Task 6b.1 builds it in GmMapView
- ✅ Constraint 5 (tooltip ref): Task 7c, `ref={p.tooltipRef}`; Task 6a.2 `tooltipRef = useRef`
- ✅ Constraint 6 (MapCanvas onTokenHoverLock prop): Task 4
- ✅ Only one tooltip locked at a time: `handleTokenHover` early-returns when `lockedTokenId !== null`
- ✅ Drag cancels timer: Task 4.4 adds `c.on('pointerdown', clearHoverLockTimer)` before canDrag guard
- ✅ Player map unaffected: `onTokenHoverLock` is optional; HudSessionTab never passes it
- ✅ Realtime reactive: `tooltipProps` reads `encounter` prop; prop flows from useGmSession → GmShell → GmMapView; no new subscription needed (confirmed in audit)

**Potential issue — IIFE in JSX:** The `{p.adversaryInstance && (() => { ... })()}` IIFE pattern in JSX is valid React but unusual. If the linter complains, extract to a named `AdversaryControls` inner function defined before `TokenTooltip`. The plan uses IIFEs for compactness; swap to named functions if the project's ESLint config flags it.

**Potential issue — `options` object stability in hook:** The `options` object passed to `useEncounterCombatControls` in Task 2 contains an inline arrow function for `onDefeat`. This causes `adjustAdversaryWounds` to be recreated every render (options reference changes). This is benign — the function is only called asynchronously by user action, not in effects. The existing panels already suppress exhaustive-deps warnings.
