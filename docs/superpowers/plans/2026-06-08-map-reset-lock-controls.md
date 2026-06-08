# Map Reset + Lock Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fit-to-screen initial zoom (both views), a Reset button (returns map to scale 1.0 centred), and a Lock toggle (disables pan/zoom; token drag unaffected) — rendered as a small transparent button pair in the top-right corner of the map canvas.

**Architecture:** All logic lives in `MapCanvas.tsx`. `isLockedRef` (module-level ref, created inside the component) is threaded into `setupPan` and `setupZoom` so their closures can check it without re-mounting. `resetView` resets the Pixi stage to `scale=1, x=0, y=0` (the natural fit-to-screen origin). Buttons are an HTML overlay div positioned absolutely over the Pixi canvas. CSS hover/focus states live in `globals.css` as `.map-ctrl-btn`. The player view's `initialScale={0.85}` is removed so both views start at the fit-to-screen scale=1.0 state.

**Tech Stack:** React (`useState`, `useRef`, `useCallback`), Pixi.js v7, TypeScript, `@/lib/tokens`, `src/app/globals.css`

---

## Files

| Action | Path | Change |
|---|---|---|
| Modify | `src/components/map/MapCanvas.tsx` | Lock state + ref, resetView, setupPan/setupZoom guards, token imports, JSX wrapper + overlay |
| Modify | `src/components/player-hud/HudSessionTab.tsx` | Remove `initialScale={0.85}` |
| Modify | `src/app/globals.css` | Add `.map-ctrl-btn` and `.map-ctrl-btn--locked` CSS classes |

---

## Task 1: globals.css — Add button CSS classes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1.1: Add .map-ctrl-btn classes**

Open `src/app/globals.css` and append these classes at the end of the file (after all existing rules):

```css
/* ── Map control overlay buttons ─────────────────────────────── */
.map-ctrl-btn {
  font-family: var(--font-body), 'JetBrains Mono', monospace;
  font-size: var(--text-label);
  color: var(--hud-text-faint);
  background: color-mix(in srgb, var(--hud-accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--hud-accent) 15%, transparent);
  border-radius: 4px;
  padding: 2px var(--space-2);
  cursor: pointer;
  transition: all var(--ease-quick);
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;
}
.map-ctrl-btn:hover {
  color: var(--hud-text);
  border-color: color-mix(in srgb, var(--hud-accent) 40%, transparent);
  background: color-mix(in srgb, var(--hud-accent) 14%, transparent);
}
.map-ctrl-btn:focus-visible {
  outline: 1px solid var(--hud-accent);
  outline-offset: 1px;
}
.map-ctrl-btn--locked {
  color: var(--hud-accent);
  background: color-mix(in srgb, var(--hud-accent) 18%, transparent);
  border-color: color-mix(in srgb, var(--hud-accent) 40%, transparent);
}
.map-ctrl-btn--locked:hover {
  background: color-mix(in srgb, var(--hud-accent) 24%, transparent);
}
```

- [ ] **Step 1.2: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/app/globals.css && git commit -m "feat(map): add .map-ctrl-btn CSS classes for map overlay control buttons"
```

---

## Task 2: HudSessionTab.tsx — Remove initialScale

**Files:**
- Modify: `src/components/player-hud/HudSessionTab.tsx`

Background: `rebuildMap` inside `MapCanvas` already scales the map sprite to fit the canvas using `Math.min(cw/textureW, ch/textureH)`. At stage scale=1.0 (the Pixi default), the map is already fitted to the screen. Passing `initialScale={0.85}` zoomed the stage *out* from that fit-to-screen state. Removing it restores fit-to-screen for both views.

- [ ] **Step 2.1: Remove the initialScale prop**

Find the `<MapCanvas` usage in `src/components/player-hud/HudSessionTab.tsx` (around line 353) and remove the `initialScale={0.85}` line:

```tsx
// Before
<MapCanvas
  mapImageUrl={visibleMap.image_url}
  tokens={visibleMapTokens}
  isGM={false}
  currentCharacterId={character.id}
  onTokenMove={onTokenMove}
  gridEnabled={visibleMap.grid_enabled}
  gridSize={visibleMap.grid_size ?? 50}
  tokenScale={visibleMap.token_scale ?? 1}
  initialScale={0.85}
  bottomOverlayRef={initiativeBarRef}
  onTokenHover={(id, x, y) => setTokenHoverInfo({ tokenId: id, x, y })}
  onTokenHoverEnd={() => setTokenHoverInfo(null)}
/>

// After
<MapCanvas
  mapImageUrl={visibleMap.image_url}
  tokens={visibleMapTokens}
  isGM={false}
  currentCharacterId={character.id}
  onTokenMove={onTokenMove}
  gridEnabled={visibleMap.grid_enabled}
  gridSize={visibleMap.grid_size ?? 50}
  tokenScale={visibleMap.token_scale ?? 1}
  bottomOverlayRef={initiativeBarRef}
  onTokenHover={(id, x, y) => setTokenHoverInfo({ tokenId: id, x, y })}
  onTokenHoverEnd={() => setTokenHoverInfo(null)}
/>
```

- [ ] **Step 2.2: Build check**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -10
```

Expected: exit 0.

- [ ] **Step 2.3: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/components/player-hud/HudSessionTab.tsx && git commit -m "feat(map): remove initialScale 0.85 override — map now starts at fit-to-screen (scale 1.0)"
```

---

## Task 3: MapCanvas.tsx — Lock state, resetView, pan/zoom guards, overlay

**Files:**
- Modify: `src/components/map/MapCanvas.tsx`

This task makes five targeted changes to one file. Apply them in order.

### Edit A: Add useState to the React import

Find line 3:
```ts
import { useEffect, useRef, useCallback, memo } from 'react'
```

Replace with:
```ts
import { useEffect, useRef, useCallback, memo, useState } from 'react'
```

### Edit B: Add token import

After the React import (line 3), add a new import line:

```ts
import { SP, FS, HUD, FONT_BODY, RADIUS, Z, EASE } from '@/lib/tokens'
```

### Edit C: Add isLockedRef, isLocked state, toggleLock, resetView inside the component

Find this block inside `MapCanvas` (around line 51–54, after the `const containerRef = ...` declaration and before `const appRef = ...`):

```ts
  const containerRef       = useRef<HTMLDivElement>(null)
  const appRef             = useRef<InstanceType<typeof import('pixi.js').Application> | null>(null)
```

Replace with:

```ts
  const containerRef       = useRef<HTMLDivElement>(null)
  const appRef             = useRef<InstanceType<typeof import('pixi.js').Application> | null>(null)

  const [isLocked, setIsLocked] = useState(false)
  const isLockedRef = useRef(false)

  const toggleLock = useCallback(() => {
    isLockedRef.current = !isLockedRef.current
    setIsLocked(isLockedRef.current)
  }, [])

  const resetView = useCallback(() => {
    const app = appRef.current
    if (!app) return
    app.stage.scale.set(1)
    app.stage.x = 0
    app.stage.y = 0
  }, [])
```

### Edit D: Thread isLockedRef into setupPan and setupZoom call sites

Find these two lines inside the bootstrap `useEffect` (around line 100–101):

```ts
      setupPan(app)
      setupZoom(app, containerRef.current)
```

Replace with:

```ts
      setupPan(app, isLockedRef)
      setupZoom(app, containerRef.current, isLockedRef)
```

### Edit E: Update setupPan signature + add guard

Find the `setupPan` function definition (around line 229):

```ts
function setupPan(app: InstanceType<typeof import('pixi.js').Application>) {
  let panning    = false
  let panStart   = { x: 0, y: 0 }
  let stageStart = { x: 0, y: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stage = app.stage as any
  stage.eventMode = 'static'
  stage.hitArea   = new (PIXI!.Rectangle)(0, 0, app.screen.width, app.screen.height)

  stage.on('pointerdown', (e: { globalX: number; globalY: number; target: { name?: string } }) => {
    const tname = (e.target as { name?: string })?.name ?? ''
    if (tname === '' || tname === 'mapBg' || tname === 'grid') {
      panning    = true
      panStart   = { x: e.globalX, y: e.globalY }
      stageStart = { x: app.stage.x, y: app.stage.y }
    }
  })
```

Replace with:

```ts
function setupPan(app: InstanceType<typeof import('pixi.js').Application>, isLockedRef: React.MutableRefObject<boolean>) {
  let panning    = false
  let panStart   = { x: 0, y: 0 }
  let stageStart = { x: 0, y: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stage = app.stage as any
  stage.eventMode = 'static'
  stage.hitArea   = new (PIXI!.Rectangle)(0, 0, app.screen.width, app.screen.height)

  stage.on('pointerdown', (e: { globalX: number; globalY: number; target: { name?: string } }) => {
    if (isLockedRef.current) return
    const tname = (e.target as { name?: string })?.name ?? ''
    if (tname === '' || tname === 'mapBg' || tname === 'grid') {
      panning    = true
      panStart   = { x: e.globalX, y: e.globalY }
      stageStart = { x: app.stage.x, y: app.stage.y }
    }
  })
```

### Edit F: Update setupZoom signature + add guard

Find the `setupZoom` function definition (around line 258):

```ts
function setupZoom(
  app: InstanceType<typeof import('pixi.js').Application>,
  el: HTMLElement,
) {
  el.addEventListener('wheel', (e) => {
    e.preventDefault()
    const factor   = e.deltaY > 0 ? 0.9 : 1.1
```

Replace with:

```ts
function setupZoom(
  app: InstanceType<typeof import('pixi.js').Application>,
  el: HTMLElement,
  isLockedRef: React.MutableRefObject<boolean>,
) {
  el.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (isLockedRef.current) return
    const factor   = e.deltaY > 0 ? 0.9 : 1.1
```

### Edit G: Update the return JSX

Find the current return statement (around line 220):

```tsx
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: 'grab', overflow: 'hidden' }}
    />
  )
```

Replace with:

```tsx
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', cursor: isLocked ? 'default' : 'grab', overflow: 'hidden' }}
      />
      <div
        className="absolute flex"
        style={{ top: SP[2], right: SP[2], gap: SP[1], zIndex: Z.overlay, pointerEvents: 'none' }}
      >
        <button
          className="map-ctrl-btn"
          style={{ pointerEvents: 'auto' }}
          onClick={resetView}
          aria-label="Reset map view"
        >
          ↺ Reset
        </button>
        <button
          className={`map-ctrl-btn${isLocked ? ' map-ctrl-btn--locked' : ''}`}
          style={{ pointerEvents: 'auto' }}
          onClick={toggleLock}
          aria-label={isLocked ? 'Unlock map' : 'Lock map'}
        >
          {isLocked ? '🔒 Locked' : '🔓 Lock'}
        </button>
      </div>
    </div>
  )
```

- [ ] **Step 3.1: Apply Edit A — add useState import**
- [ ] **Step 3.2: Apply Edit B — add token import**
- [ ] **Step 3.3: Apply Edit C — add isLockedRef, state, toggleLock, resetView**
- [ ] **Step 3.4: Apply Edit D — thread isLockedRef into call sites**
- [ ] **Step 3.5: Apply Edit E — update setupPan signature + guard**
- [ ] **Step 3.6: Apply Edit F — update setupZoom signature + guard**
- [ ] **Step 3.7: Apply Edit G — update return JSX**

- [ ] **Step 3.8: Run build**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -15
```

Expected: exit 0. Fix any TypeScript errors before continuing.

- [ ] **Step 3.9: Token compliance self-audit**

Scan every inline style in the changed section of MapCanvas.tsx (the new return JSX and added state/callbacks):

- [ ] Font sizes — none used inline in the new code (all in .map-ctrl-btn CSS)
- [ ] Spacing — `SP[2]`, `SP[1]` used for top/right/gap ✓
- [ ] Colours — all via CSS class, no hex inline ✓
- [ ] Transitions — all via CSS class, no inline timing ✓
- [ ] Z-index — `Z.overlay` used ✓
- [ ] Border radius — in CSS class (4px maps to `RADIUS.md`), no inline ✓
- [ ] No `onMouseEnter`/`onMouseLeave` mutations ✓
- [ ] New token import is present ✓

- [ ] **Step 3.10: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/components/map/MapCanvas.tsx && git commit -m "feat(map): add Reset + Lock controls, fit-to-screen initial zoom, lock pan/zoom state"
```

---

## Task 4: Final Verification

- [ ] **Step 4.1: Final build**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -10
```

Expected: exit 0, zero errors.

- [ ] **Step 4.2: Confirm all 3 commits landed**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git log --oneline -5
```

Expected: 3 new commits visible (globals.css, HudSessionTab, MapCanvas).

- [ ] **Step 4.3: Manual verification checklist**

Open the app with both player and GM views and verify:

| Scenario | Expected |
|---|---|
| Player view page load | Map fills the screen at full zoom (not slightly zoomed out) |
| GM view page load | Map fills the screen at full zoom (unchanged from before) |
| Scroll wheel | Zooms in/out centred on mouse pointer |
| Click-drag on empty map | Pans freely |
| Reset button visible | Small, transparent button in top-right corner of map |
| Lock button visible | Small, transparent button in top-right corner of map |
| Click Reset | Map snaps back to scale=1.0, centred |
| Click Lock | Button turns accent-coloured (🔒 Locked), cursor changes to default |
| Locked + scroll wheel | Nothing happens (zoom blocked) |
| Locked + click-drag | Nothing happens (pan blocked) |
| Locked + token drag | Token still moves normally |
| Click Lock again (Unlock) | Button returns to faint (🔓 Lock), pan/zoom resume |
| Theme switch (Kyber/Ember/Neutral) | Button border and background shift with --hud-accent |
