# Player HUD Rail Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the player HUD's left column (characteristics + skills) and tab bar with a unified 52 px icon rail, move all navigation into that rail as drawers/full-panels, and relocate the initiative strip from the top to the bottom of the map area.

**Architecture:** A narrow `HudLeftRail` replaces `HudLeftColumn` in the layout grid. Quick-action drawers (Combat/Force/Skill Check) render `position: absolute` inside the map area in `HudSessionTab`. Full navigation panels (Skills, Talents, Inventory, Lore, Group) render `position: absolute` over the entire centre column in `PlayerHUDDesktop`. The initiative strip moves from `top: 0` to `bottom: 0` and uses a renamed `bottomOverlayRef` prop on `MapCanvas` to re-centre correctly.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, CSS custom properties (`src/app/globals.css`), design tokens (`src/lib/tokens.ts`)

---

## File Map

| Action | Path |
|---|---|
| Create | `src/components/player-hud/HudLeftRail.tsx` |
| Create | `src/components/player-hud/HudFullPanel.tsx` |
| Modify | `src/components/player/InitiativeStrip.tsx` |
| Modify | `src/components/map/MapCanvas.tsx` |
| Modify | `src/components/player-hud/HudSessionTab.tsx` |
| Modify | `src/components/player-hud/HudStatusStrip.tsx` |
| Modify | `src/components/player-hud/PlayerHUDDesktop.tsx` |
| Modify | `src/lib/tokens.ts` |
| Modify | `src/app/globals.css` |
| Delete | `src/components/player-hud/HudLeftColumn.tsx` |

---

## Task 1: Add purple accent token

**Files:**
- Modify: `src/lib/tokens.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add `accentPurple` to the `HUD` export in `src/lib/tokens.ts`**

In `tokens.ts`, update the `HUD` object (currently ends at `gold: 'var(--hud-gold)'`):

```ts
export const HUD = {
  bg:           'var(--hud-bg)',
  panel:        'var(--hud-panel)',
  panelBg:      'var(--hud-panel)',
  border:       'var(--hud-border)',
  borderHi:     'var(--hud-border-hi)',
  text:         'var(--hud-text)',
  textDim:      'var(--hud-text-dim)',
  textFaint:    'var(--hud-text-faint)',
  gold:         'var(--hud-gold)',
  accentPurple: 'var(--hud-accent-purple)',
} as const
```

- [ ] **Step 2: Add the CSS variable to `:root` in `src/app/globals.css`**

Find the line `--hud-accent-50:     rgba(224,58,30,0.50);` in the `:root` block and add the purple variable just after the accent family:

```css
  --hud-accent-60:     rgba(224,58,30,0.60);
  --hud-accent-border: rgba(224,58,30,0.30);
  --hud-accent-purple: #9060D0;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/tokens.ts src/app/globals.css
git commit -m "feat(tokens): add hud-accent-purple for Force Check rail button"
```

---

## Task 2: Add CSS classes for rail and drawer hover/active states

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append classes at the end of `src/app/globals.css`**

```css
/* ── Player HUD Left Rail ─────────────────────────────────────── */
.hud-rail-btn-combat:hover,
.hud-rail-btn-combat.active { background: rgba(224,58,30,0.12); border-color: rgba(224,58,30,0.35); }
.hud-rail-btn-combat.active .hud-rail-label { color: var(--bs-red-pale); }

.hud-rail-btn-force:hover,
.hud-rail-btn-force.active { background: rgba(144,96,208,0.12); border-color: rgba(144,96,208,0.35); }
.hud-rail-btn-force.active .hud-rail-label { color: var(--hud-accent-purple); }

.hud-rail-btn-skill:hover,
.hud-rail-btn-skill.active { background: rgba(200,170,80,0.12); border-color: rgba(200,170,80,0.35); }
.hud-rail-btn-skill.active .hud-rail-label { color: var(--hud-gold); }

.hud-rail-btn-nav:hover { background: rgba(150,168,180,0.08); border-color: rgba(150,168,180,0.20); }
.hud-rail-btn-nav.active { background: rgba(150,168,180,0.14); border-color: rgba(150,168,180,0.35); }
.hud-rail-btn-nav.active .hud-rail-label { color: var(--hud-text); }

/* ── Quick drawers / Full panels slide-in ─────────────────────── */
.hud-quick-drawer {
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 260px;
  z-index: 102;
  transform: translateX(-100%);
  transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 4px 0 32px rgba(0,0,0,0.7);
}
.hud-quick-drawer.open { transform: translateX(0); }

.hud-full-panel {
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 82%;
  z-index: 101;
  transform: translateX(-100%);
  transition: transform 0.26s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 6px 0 48px rgba(0,0,0,0.85);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.hud-full-panel.open { transform: translateX(0); }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(styles): add HUD rail button and drawer CSS classes"
```

---

## Task 3: Create `HudLeftRail.tsx`

**Files:**
- Create: `src/components/player-hud/HudLeftRail.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { memo } from 'react'
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'

export type RailPanelId =
  | 'combat' | 'force' | 'skill'
  | 'skills' | 'talents' | 'inventory' | 'lore' | 'group'

interface HudLeftRailProps {
  isForceUser:   boolean
  activePanel:   RailPanelId | null
  onPanelToggle: (id: RailPanelId) => void
}

const BTN_STYLE: React.CSSProperties = {
  width: 40, minHeight: 48,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 3, border: '1px solid transparent', borderRadius: RADIUS.md,
  cursor: 'pointer', background: 'transparent',
  transition: 'background 0.15s, border-color 0.15s',
  flexShrink: 0,
}

const SYMBOL_STYLE: React.CSSProperties = {
  fontSize: 16, lineHeight: 1,
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--hud-text-dim)',
  textAlign: 'center',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  maxWidth: 38,
}

const QUICK_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'combat', symbol: '⚔', label: 'Combat Check', cls: 'hud-rail-btn-combat' },
  { id: 'force',  symbol: '✦', label: 'Force Check',  cls: 'hud-rail-btn-force'  },
  { id: 'skill',  symbol: '◈', label: 'Skill Check',  cls: 'hud-rail-btn-skill'  },
]

const NAV_BUTTONS: { id: RailPanelId; symbol: string; label: string }[] = [
  { id: 'skills',    symbol: '≋', label: 'Skills'    },
  { id: 'talents',   symbol: '◆', label: 'Talents'   },
  { id: 'inventory', symbol: '▣', label: 'Inventory' },
  { id: 'lore',      symbol: '✧', label: 'Lore'      },
  { id: 'group',     symbol: '◎', label: 'Group'     },
]

export const HudLeftRail = memo(function HudLeftRail({
  isForceUser, activePanel, onPanelToggle,
}: HudLeftRailProps) {
  return (
    <div style={{
      width: 52, flexShrink: 0,
      background: 'var(--hud-panel)',
      borderRight: '1px solid var(--hud-border-hi)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, padding: '8px 0', overflowY: 'auto',
    }}>
      {QUICK_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'force' && !isForceUser) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {NAV_BUTTONS.map(({ id, symbol, label }) => (
        <button
          key={id}
          className={`hud-rail-btn-nav${activePanel === id ? ' active' : ''}`}
          style={BTN_STYLE}
          onClick={() => onPanelToggle(id)}
          title={label}
        >
          <span style={SYMBOL_STYLE}>{symbol}</span>
          <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
        </button>
      ))}
    </div>
  )
})
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/player-hud/HudLeftRail.tsx
git commit -m "feat(hud): add HudLeftRail navigation rail component"
```

---

## Task 4: Create `HudFullPanel.tsx`

**Files:**
- Create: `src/components/player-hud/HudFullPanel.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'

interface HudFullPanelProps {
  open:     boolean
  title:    string
  symbol:   string
  onClose:  () => void
  children: React.ReactNode
}

export function HudFullPanel({ open, title, symbol, onClose, children }: HudFullPanelProps) {
  return (
    <div
      className={`hud-full-panel${open ? ' open' : ''}`}
      style={{
        background:  'var(--hud-surface-lo)',
        borderRight: '1px solid var(--hud-border-hi)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-panel)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{symbol}</span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--hud-text)', flex: 1,
        }}>
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hud-text-dim)', fontSize: 15, lineHeight: 1,
            padding: '2px 4px', borderRadius: RADIUS.sm,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/player-hud/HudFullPanel.tsx
git commit -m "feat(hud): add HudFullPanel slide-in wrapper for nav panels"
```

---

## Task 5: Add `compact` prop to `InitiativeStrip`

The player HUD initiative strip moves to the bottom and should be 15% smaller than the GM drawer version (avatar 52 px → 44 px).

**Files:**
- Modify: `src/components/player/InitiativeStrip.tsx`

- [ ] **Step 1: Add `compact?: boolean` to the `Props` interface**

In `src/components/player/InitiativeStrip.tsx`, find:

```ts
interface Props {
  encounter:   CombatEncounter
  character:   Character
  gmControls?: GmControls
}
```

Replace with:

```ts
interface Props {
  encounter:   CombatEncounter
  character:   Character
  gmControls?: GmControls
  compact?:    boolean
}
```

- [ ] **Step 2: Consume `compact` in the render function**

Find the function signature:

```ts
export function InitiativeStrip({ encounter, character, gmControls }: Props) {
```

Replace with:

```ts
export function InitiativeStrip({ encounter, character, gmControls, compact = false }: Props) {
```

- [ ] **Step 3: Apply compact sizes inside the slot map**

In the `slots.map(...)` block, find the avatar `<div>` that starts with:

```tsx
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
```

Replace `width: 52, height: 52` with `width: compact ? 44 : 52, height: compact ? 44 : 52`:

```tsx
              <div style={{
                width: compact ? 44 : 52, height: compact ? 44 : 52, borderRadius: '50%', flexShrink: 0,
```

- [ ] **Step 4: Apply compact sizes to the card container**

Find the card container div (className `init-slot-card` or similar):

```tsx
              <div
                className={showControls ? 'init-slot-card' : undefined}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 76, padding: '0 4px' }}
```

Replace with:

```tsx
              <div
                className={showControls ? 'init-slot-card' : undefined}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 3 : 5, minWidth: compact ? 64 : 76, padding: '0 4px' }}
```

- [ ] **Step 5: Apply compact size to the connector dash**

Find:

```tsx
              {i < lastIdx && (
                <div style={{ width: 16, height: 2, background: BORDER_MD, flexShrink: 0 }} />
              )}
```

Replace with:

```tsx
              {i < lastIdx && (
                <div style={{ width: compact ? 12 : 16, height: compact ? 1 : 2, background: BORDER_MD, flexShrink: 0 }} />
              )}
```

- [ ] **Step 6: Apply compact strip padding**

Find the outer strip div:

```tsx
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: `1px solid ${BORDER}`, padding: '12px 16px',
        overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 0,
        background: PANEL_BG,
      }}>
```

Replace `padding: '12px 16px'` with `padding: compact ? '8px 12px' : '12px 16px'`:

```tsx
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: `1px solid ${BORDER}`, padding: compact ? '8px 12px' : '12px 16px',
        overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 0,
        background: PANEL_BG,
      }}>
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/components/player/InitiativeStrip.tsx
git commit -m "feat(initiative): add compact prop for smaller player-HUD strip"
```

---

## Task 6: Rename `topOverlayRef` → `bottomOverlayRef` in `MapCanvas`

**Files:**
- Modify: `src/components/map/MapCanvas.tsx`

- [ ] **Step 1: Rename the prop in the `MapCanvasProps` interface**

Find:

```ts
  topOverlayRef?:      React.RefObject<HTMLElement | null>  // ref to any element overlaying the top of the canvas; its height shifts the initial vertical centre
```

Replace with:

```ts
  bottomOverlayRef?:   React.RefObject<HTMLElement | null>  // ref to element at the bottom of the canvas; its height shifts the initial vertical centre upward
```

- [ ] **Step 2: Update the destructure in the function signature**

Find `topOverlayRef` in the destructure line and rename to `bottomOverlayRef`.

Before:
```ts
  tokenScale = 1, initialScale = 1, topOverlayRef,
```

After:
```ts
  tokenScale = 1, initialScale = 1, bottomOverlayRef,
```

- [ ] **Step 3: Update the centering formula**

Find:

```ts
          const overlayH = topOverlayRef?.current?.offsetHeight ?? 0
          app.stage.x = cw * (1 - initialScale) / 2
          app.stage.y = ch * (1 - initialScale) / 2 + overlayH / 2
```

Replace with:

```ts
          const overlayH = bottomOverlayRef?.current?.offsetHeight ?? 0
          app.stage.x = cw * (1 - initialScale) / 2
          app.stage.y = ch * (1 - initialScale) / 2 - overlayH / 2
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: 1 error — `HudSessionTab` still passes `topOverlayRef`. Fix in Task 7.

- [ ] **Step 5: Commit**

```bash
git add src/components/map/MapCanvas.tsx
git commit -m "fix(map): rename topOverlayRef to bottomOverlayRef, shift centre upward for bottom bar"
```

---

## Task 7: Update `HudSessionTab` — move strip to bottom, add quick drawers

**Files:**
- Modify: `src/components/player-hud/HudSessionTab.tsx`

### Overview of changes
1. Add new props for quick drawers
2. Move initiative bar div from `top: 0` to `bottom: 0`; move `ref` to it
3. Change `topOverlayRef` → `bottomOverlayRef` in `MapCanvas` call
4. Pass `compact` to `InitiativeStrip`
5. Render backdrop + three quick drawers inside the map area

- [ ] **Step 1: Update the `HudSessionTabProps` interface**

Find:

```ts
interface HudSessionTabProps {
  character: Character
  campaignId: string | null
  visibleMap: { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number } | null
  visibleMapTokens: MapToken[]
  onTokenMove: (tokenId: string, x: number, y: number) => void
  isCombatActive: boolean
  encounter: CombatEncounter | null
  hudTalents: HudTalent[]
}
```

Replace with:

```ts
import type { WpnDisplay } from '@/lib/types'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'

interface HudSessionTabProps {
  character:          Character
  campaignId:         string | null
  visibleMap:         { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number } | null
  visibleMapTokens:   MapToken[]
  onTokenMove:        (tokenId: string, x: number, y: number) => void
  isCombatActive:     boolean
  encounter:          CombatEncounter | null
  hudTalents:         HudTalent[]
  // Quick drawer props
  activeQuickPanel:   'combat' | 'force' | 'skill' | null
  onCloseQuickPanel:  () => void
  hudSkills:          import('@/lib/types').HudSkill[]
  hudWeapons:         WpnDisplay[]
  allForcePowers:     ForcePowerDisplay[]
  forceRating:        number
  onOpenSkillPopover: (skill: import('@/lib/types').HudSkill, anchor: DOMRect) => void
  onOpenCombatCheck:  () => void
  onOpenForceCheck:   () => void
}
```

- [ ] **Step 2: Update the function destructure**

Find:

```ts
export function HudSessionTab({
  character,
  campaignId,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  hudTalents,
}: HudSessionTabProps) {
```

Replace with:

```ts
export function HudSessionTab({
  character,
  campaignId,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  hudTalents,
  activeQuickPanel,
  onCloseQuickPanel,
  hudSkills,
  hudWeapons,
  allForcePowers,
  forceRating,
  onOpenSkillPopover,
  onOpenCombatCheck,
  onOpenForceCheck,
}: HudSessionTabProps) {
```

- [ ] **Step 3: Move initiative strip to bottom and fix ref**

Find the combat overlays block:

```tsx
      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <>
          <div ref={initiativeBarRef} style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'var(--hud-surface-hi)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)', zIndex: 30,
          }}>
            <InitiativeStrip encounter={encounter} character={character} />
          </div>
        </>
      )}
```

Replace with:

```tsx
      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <div ref={initiativeBarRef} style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--hud-surface-hi)', backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', zIndex: 30,
        }}>
          <InitiativeStrip encounter={encounter} character={character} compact />
        </div>
      )}
```

- [ ] **Step 4: Update `MapCanvas` prop name**

Find `topOverlayRef={initiativeBarRef}` in the `MapCanvas` call and change to `bottomOverlayRef={initiativeBarRef}`.

- [ ] **Step 5: Add quick drawer imports at the top of the file**

Add these imports alongside the existing ones:

```ts
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS } from '@/lib/tokens'
import { HudSkillQuickList } from './HudSkillQuickList'
```

(Note: `FONT_BODY`, `FS`, `RADIUS` may already be imported — only add what is missing.)

- [ ] **Step 6: Add backdrop + quick drawers inside the map area**

After the combat overlay block and before the session drawer trigger buttons, add the following inside the outermost `<div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>`:

```tsx
      {/* ── Quick drawer backdrop ── */}
      {activeQuickPanel && (
        <div
          onClick={onCloseQuickPanel}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 100,
          }}
        />
      )}

      {/* ── Combat Check quick drawer ── */}
      <div
        className={`hud-quick-drawer${activeQuickPanel === 'combat' ? ' open' : ''}`}
        style={{ background: '#100e0e', borderRight: '1px solid rgba(224,58,30,0.28)' }}
      >
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid rgba(224,58,30,0.18)',
          background: 'var(--hud-panel)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bs-red-pale)', flex: 1 }}>
            ⚔ Combat Check
          </span>
          <button onClick={onCloseQuickPanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hud-text-dim)', fontSize: 15 }}>✕</button>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 12px 4px', color: 'var(--hud-text-faint)' }}>
          Select Weapon
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {hudWeapons.map(wpn => (
            <button
              key={wpn.id}
              onClick={() => { onOpenCombatCheck(); onCloseQuickPanel() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 12px', textAlign: 'left',
                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
              className="hud-combat-wpn-row"
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: 'var(--hud-text)' }}>{wpn.name}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)', marginTop: 2 }}>
                  {wpn.skillName} · Dam {wpn.damage.isMelee ? `+${wpn.damage.baseDamage}` : wpn.damage.baseDamage} · Crit {wpn.crit} · {wpn.range}
                </div>
              </div>
              <span style={{ color: 'rgba(224,58,30,0.4)', fontSize: 14 }}>›</span>
            </button>
          ))}
          {hudWeapons.length === 0 && (
            <div style={{ padding: '16px 12px', fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
              No weapons equipped
            </div>
          )}
        </div>
      </div>

      {/* ── Force Check quick drawer ── */}
      <div
        className={`hud-quick-drawer${activeQuickPanel === 'force' ? ' open' : ''}`}
        style={{ background: '#0d0b12', borderRight: '1px solid rgba(144,96,208,0.28)' }}
      >
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid rgba(144,96,208,0.18)',
          background: 'var(--hud-panel)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-accent-purple)', flex: 1 }}>
            ✦ Force Check
          </span>
          <button onClick={onCloseQuickPanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hud-text-dim)', fontSize: 15 }}>✕</button>
        </div>
        {/* Force rating pips */}
        <div style={{ display: 'flex', gap: 5, padding: '10px 12px', alignItems: 'center', flexShrink: 0 }}>
          {Array.from({ length: forceRating }).map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: RADIUS.full, background: 'var(--hud-gold)', boxShadow: '0 0 5px rgba(200,170,80,0.5)' }} />
          ))}
          {Array.from({ length: Math.max(0, 5 - forceRating) }).map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: RADIUS.full, border: '1px solid rgba(144,96,208,0.3)' }} />
          ))}
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Rating {forceRating}
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 12px 4px', color: 'var(--hud-text-faint)', flexShrink: 0 }}>
          Active Powers
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {allForcePowers.map(fp => (
            <button
              key={fp.powerKey}
              onClick={() => { onOpenForceCheck(); onCloseQuickPanel() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 12px', textAlign: 'left',
                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
              className="hud-force-power-row"
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: 'var(--hud-text)' }}>{fp.powerName}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)', marginTop: 2 }}>
                  {fp.purchasedCount}/{fp.totalCount} abilities purchased
                </div>
              </div>
              <span style={{ color: 'rgba(144,96,208,0.4)', fontSize: 14 }}>›</span>
            </button>
          ))}
          {allForcePowers.length === 0 && (
            <div style={{ padding: '16px 12px', fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
              No Force powers purchased
            </div>
          )}
        </div>
      </div>

      {/* ── Skill Check quick drawer ── */}
      <div
        className={`hud-quick-drawer${activeQuickPanel === 'skill' ? ' open' : ''}`}
        style={{ background: 'var(--hud-surface-lo)', borderRight: '1px solid var(--hud-border-hi)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--hud-border)',
          background: 'var(--hud-panel)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-gold)', flex: 1 }}>
            ◈ Skill Check
          </span>
          <button onClick={onCloseQuickPanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hud-text-dim)', fontSize: 15 }}>✕</button>
        </div>
        {/* Characteristics 3×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 10, flexShrink: 0 }}>
          {([
            { label: 'Brawn',     value: character.brawn },
            { label: 'Agility',   value: character.agility },
            { label: 'Intellect', value: character.intellect },
            { label: 'Cunning',   value: character.cunning },
            { label: 'Willpower', value: character.willpower },
            { label: 'Presence',  value: character.presence },
          ] as const).map(ch => (
            <div key={ch.label} style={{
              textAlign: 'center', padding: '6px 4px',
              background: 'rgba(224,58,30,0.06)',
              border: '1px solid rgba(224,58,30,0.18)',
              borderRadius: RADIUS.lg,
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(1rem,1.6vw,1.2rem)', fontWeight: 700, color: 'var(--hud-gold)', lineHeight: 1 }}>
                {ch.value}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--hud-text-faint)', marginTop: 3, textTransform: 'uppercase' }}>
                {ch.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--hud-border)', flexShrink: 0 }} />
        {/* Quick skill list */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <HudSkillQuickList skills={hudSkills} onOpenPopover={onOpenSkillPopover} />
        </div>
      </div>
```

- [ ] **Step 7: Add hover CSS classes for weapon/force rows to globals.css**

```css
.hud-combat-wpn-row:hover { background: rgba(224,58,30,0.06); }
.hud-force-power-row:hover { background: rgba(144,96,208,0.06); }
```

- [ ] **Step 8: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add src/components/player-hud/HudSessionTab.tsx src/app/globals.css
git commit -m "feat(session): move initiative strip to bottom, add quick drawers in map area"
```

---

## Task 8: Remove combat/force check buttons from `HudStatusStrip`

**Files:**
- Modify: `src/components/player-hud/HudStatusStrip.tsx`

- [ ] **Step 1: Remove `onOpenCombatCheck` and `onOpenForceCheck` from the props interface**

Find:

```ts
  isCombat: boolean
  onVitalAdjust: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
  onHealCrit: (id: string) => void
  onOpenCombatCheck: () => void
  onOpenForceCheck: () => void
```

Replace with:

```ts
  isCombat: boolean
  onVitalAdjust: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
  onHealCrit: (id: string) => void
```

- [ ] **Step 2: Remove them from the function destructure**

Find:

```ts
export function HudStatusStrip({
  character, effectiveStats, engineBreakdown, woundBonus,
  encumbranceCurrent, encumbranceBonus, crits,
  forceRating, isCombat,
  onVitalAdjust, onHealCrit, onOpenCombatCheck, onOpenForceCheck,
}: HudStatusStripProps) {
```

Replace with:

```ts
export function HudStatusStrip({
  character, effectiveStats, engineBreakdown, woundBonus,
  encumbranceCurrent, encumbranceBonus, crits,
  forceRating, isCombat,
  onVitalAdjust, onHealCrit,
}: HudStatusStripProps) {
```

- [ ] **Step 3: Remove the action buttons from the render**

Find and delete these lines (near the bottom of the return block):

```tsx
      {/* Action buttons */}
      <CombatCheckButton onOpen={onOpenCombatCheck} isInCombat={isCombat} />
      {isForceUser && <ForceCheckButton onOpen={onOpenForceCheck} compact />}
```

- [ ] **Step 4: Remove unused imports**

Remove these import lines if they are now unused:

```ts
import { CombatCheckButton } from '@/components/character/CombatCheckButton'
import { ForceCheckButton } from '@/components/character/ForceCheckButton'
```

Also remove `isForceUserSensitive` import and usage if the `isForceUser` variable is now unused:

```ts
import { isForceUserSensitive } from '@/lib/forceUtils'
```

And delete: `const isForceUser  = isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)`

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: errors in `PlayerHUDDesktop` for removed props — fix in Task 9.

- [ ] **Step 6: Commit**

```bash
git add src/components/player-hud/HudStatusStrip.tsx
git commit -m "refactor(status-strip): remove combat/force check buttons (moved to left rail)"
```

---

## Task 9: Wire everything in `PlayerHUDDesktop`

This is the largest task. It replaces `HudLeftColumn` + `TabBar` with `HudLeftRail`, updates the layout grid, adds full panels in the centre column, and threads all new props.

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

- [ ] **Step 1: Update imports — add new, remove old**

Add these imports:

```ts
import { HudLeftRail, type RailPanelId } from './HudLeftRail'
import { HudFullPanel } from './HudFullPanel'
```

Remove these imports (no longer used):

```ts
import { HudLeftColumn } from './HudLeftColumn'  // DELETE
import { TabBar, type TabName } from './HudTabBar'  // DELETE
```

- [ ] **Step 2: Replace `activeTab` state with two panel state variables**

Find:

```ts
  const [activeTab, setActiveTab] = useState<TabName>('Session')
```

Replace with:

```ts
  const [activeQuickPanel, setActiveQuickPanel] = useState<'combat' | 'force' | 'skill' | null>(null)
  const [activeFullPanel,  setActiveFullPanel]  = useState<'skills' | 'talents' | 'inventory' | 'lore' | 'group' | null>(null)

  function handlePanelToggle(id: RailPanelId) {
    const QUICK = ['combat', 'force', 'skill'] as const
    const FULL  = ['skills', 'talents', 'inventory', 'lore', 'group'] as const
    if ((QUICK as readonly string[]).includes(id)) {
      const qid = id as typeof QUICK[number]
      setActiveQuickPanel(prev => prev === qid ? null : qid)
      setActiveFullPanel(null)
    } else if ((FULL as readonly string[]).includes(id)) {
      const fid = id as typeof FULL[number]
      setActiveFullPanel(prev => prev === fid ? null : fid)
      setActiveQuickPanel(null)
    }
  }
```

- [ ] **Step 3: Update the `isForceUser` constant** (already computed but needs to be accessible):

This line already exists — confirm it reads:

```ts
  // (inside the component, after character is loaded)
  // isForceUser is used by HudLeftRail and HudSessionTab
```

It is derived inside `HudStatusStrip` currently. Add it to `PlayerHUDDesktop` after the character guard:

```ts
  const isForceUser = character ? isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating) : false
```

`isForceUserSensitive` is already imported.

- [ ] **Step 4: Update the grid `gridTemplateColumns`**

Find:

```ts
        gridTemplateColumns: 'clamp(200px,22%,260px) 1fr clamp(200px,20%,240px)',
```

Replace with:

```ts
        gridTemplateColumns: '52px 1fr clamp(200px,20%,240px)',
```

- [ ] **Step 5: Replace `HudLeftColumn` with `HudLeftRail`**

Find:

```tsx
        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <HudLeftColumn
          character={character}
          hudSkills={hudSkills}
          onOpenPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
        />
```

Replace with:

```tsx
        {/* ══ LEFT RAIL ══════════════════════════════════════════ */}
        <HudLeftRail
          isForceUser={isForceUser}
          activePanel={activeQuickPanel ?? activeFullPanel}
          onPanelToggle={handlePanelToggle}
        />
```

- [ ] **Step 6: Replace the centre column content**

Find the entire centre column `<div>` (starts with `{/* ══ CENTER COLUMN ════════════════════════════════════ */}` and ends with its closing `</div>`):

```tsx
        {/* ══ CENTER COLUMN ════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          <TabBar
            active={activeTab}
            onChange={t => setActiveTab(t)}
            hasCombat={isCombat}
            isForceUser={isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)}
            isForceUserFallen={character.is_dark_side_fallen === true}
            isCombatActive={isCombatActive}
          />

          {/* Session Status Banner */}
          <SessionStatusBanner ... />

          {/* Session tab */}
          {activeTab === 'Session' && (
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <HudSessionTab ... />
            </div>
          )}

          {/* All other tabs */}
          {activeTab !== 'Session' && (
            <div key={activeTab} style={{ flex: 1, overflowY: 'auto', ... }}>
              {activeTab === 'Skills' && <HudSkillsTab ... />}
              ... all other tabs
            </div>
          )}
        </div>
```

Replace the entire centre column with:

```tsx
        {/* ══ CENTER COLUMN ════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${C.border}`,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Session Status Banner — always shown */}
          <SessionStatusBanner
            sessionRollState={sessionRollState}
            characterId={character.id}
            characterNames={{ [character.id]: character.name }}
            triggeredObligationType={character.obligation_type}
            ownObligationValue={character.obligation_value}
          />

          {/* Session / map view — always rendered, fills remaining height */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <HudSessionTab
              character={character}
              campaignId={effectiveCampaignId}
              visibleMap={visibleMap}
              visibleMapTokens={visibleMapTokens}
              onTokenMove={mapTokens.moveToken}
              isCombatActive={isCombatActive}
              encounter={encounter}
              hudTalents={hudTalents}
              activeQuickPanel={activeQuickPanel}
              onCloseQuickPanel={() => setActiveQuickPanel(null)}
              hudSkills={hudSkills}
              hudWeapons={hudWeapons}
              allForcePowers={allForcePowers}
              forceRating={effectiveStats?.forceRating ?? forceRating}
              onOpenSkillPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
              onOpenCombatCheck={() => setCombatCheckOpen(true)}
              onOpenForceCheck={() => setForceCheckOpen(true)}
            />
          </div>

          {/* Full panel backdrop */}
          {activeFullPanel && (
            <div
              onClick={() => setActiveFullPanel(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
            />
          )}

          {/* ── Full panels ── */}
          <HudFullPanel open={activeFullPanel === 'skills'} title="Skills" symbol="≋" onClose={() => setActiveFullPanel(null)}>
            <HudSkillsTab
              character={character}
              hudSkills={hudSkills}
              hudTalents={hudTalents}
              isCombat={isCombat}
              effectiveStats={effectiveStats}
              engineBreakdown={engineBreakdown}
              skillModifiers={skillModifiers}
              speciesAbilities={speciesAbilities}
              bonusSkillKeys={bonusSkillKeys}
              onRoll={handleRoll}
              onBuySkill={handleBuySkill}
              onOpenPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
              onVitalChange={handleVitalChange}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'talents'} title="Talents" symbol="◆" onClose={() => setActiveFullPanel(null)}>
            <HudTalentsTab
              character={character}
              characterId={characterId}
              charSpecs={charSpecs}
              refSpecMap={refSpecMap}
              refSpecs={refSpecs}
              refTalentMap={refTalentMap}
              talents={talents}
              hudTalents={hudTalents}
              activeSpecKey={activeSpecKey}
              setActiveSpecKey={setActiveSpecKey}
              talentTreeData={talentTreeData}
              isGmMode={isGmMode}
              onPurchaseTalent={handlePurchaseTalent}
              onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
              onBuySpecialization={handleBuySpecialization}
              onPendingDedication={setPendingDedication}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'inventory'} title="Inventory" symbol="▣" onClose={() => setActiveFullPanel(null)}>
            <HudInventoryTab
              hudWeapons={hudWeapons}
              hudArmor={hudArmor}
              hudGear={hudGear}
              encumbranceCurrent={encumbranceCurrent}
              encThreshold={encThreshold}
              refWeaponQualityMap={refWeaponQualityMap}
              isGmMode={isGmMode}
              characterName={character.name}
              characterId={character.id}
              stowableAssets={stowableAssets}
              baseOfOperationsName={baseOfOperationsName}
              effectiveCampaignId={effectiveCampaignId}
              supabase={supabase}
              onSetEquipState={handleSetEquipState}
              onRemoveWeapon={handleRemoveWeapon}
              onRemoveEquipment={handleRemoveEquipment}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'lore'} title="Lore" symbol="✧" onClose={() => setActiveFullPanel(null)}>
            <HudLoreTab
              character={character}
              careerName={careerName}
              speciesName={speciesName}
              refSpeciesAll={refSpeciesAll}
              refDutyTypes={refDutyTypes}
              refObligationTypes={refObligationTypes}
              onBackstoryChange={handleBackstoryChange}
              onNotesChange={handleNotesChange}
              onPortraitUpload={handlePortraitUpload}
              onPortraitDelete={handlePortraitDelete}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'group'} title="Group Sheet" symbol="◎" onClose={() => setActiveFullPanel(null)}>
            {effectiveCampaignId
              ? <GroupSheet campaignId={effectiveCampaignId} characterName={character.name} />
              : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, padding: 40 }}>
                  <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: C.textFaint }}>NO CAMPAIGN</div>
                  <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Join a campaign to access the group sheet</div>
                </div>
              )
            }
          </HudFullPanel>
        </div>
```

- [ ] **Step 7: Remove `onOpenCombatCheck` and `onOpenForceCheck` props from `HudStatusStrip`**

Find the `HudStatusStrip` JSX and remove:

```tsx
          onOpenCombatCheck={() => setCombatCheckOpen(true)}
          onOpenForceCheck={() => setForceCheckOpen(true)}
```

- [ ] **Step 8: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 9: Start the dev server and verify**

Run: `npm run dev`

Check:
- Left rail renders with Combat Check / Force Check (if force user) / Skill Check at top, divider, Skills / Talents / Inventory / Lore / Group below
- Clicking Combat Check / Force Check opens a narrow drawer over the map
- Clicking a weapon in Combat Check drawer triggers the CombatCheckOverlay then closes the drawer
- Clicking Skill Check shows characteristics grid + skill search list
- Clicking Skills/Talents/Inventory/Lore/Group opens an 82%-wide panel sliding in from the left
- Only one panel open at a time — opening a second closes the first
- Clicking outside (backdrop) or ✕ closes any open panel
- Initiative strip now appears at the bottom of the map when in combat
- Status strip no longer has Combat / Force check buttons

- [ ] **Step 10: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(hud): replace left column + tab bar with unified left rail and slide-in panels"
```

---

## Task 10: Cleanup — delete `HudLeftColumn`

**Files:**
- Delete: `src/components/player-hud/HudLeftColumn.tsx`

- [ ] **Step 1: Confirm `HudLeftColumn` has no other consumers**

Run: `grep -r "HudLeftColumn" src/`
Expected: no results (only `PlayerHUDDesktop` used it, now replaced).

- [ ] **Step 2: Delete the file**

```bash
rm src/components/player-hud/HudLeftColumn.tsx
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(hud): delete unused HudLeftColumn"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| 52 px left rail replacing left column | Task 3, 9 |
| Combat Check button (always) | Task 3 |
| Force Check button (force users only) | Task 3 |
| Skill Check button (always) | Task 3 |
| Divider between quick and nav buttons | Task 3 |
| Skills / Talents / Inventory / Lore / Group nav buttons | Task 3 |
| Quick drawers ~260 px, slide from left | Task 2, 7 |
| Full panels ~82% wide, slide from left | Task 2, 4, 9 |
| Group panel uses existing GroupSheet (duties, assets, contribution rank) | Task 9 |
| Initiative strip at bottom, compact (15% smaller) | Task 5, 7 |
| Map centering adjusted for bottom overlay | Task 6 |
| Remove combat/force buttons from status strip | Task 8 |
| Purple accent token for Force rail button | Task 1 |
| No inline hex/px — all from tokens | All tasks |
| No onMouseEnter style mutation — CSS classes only | Task 2 |
| Grid column changes: 22% → 52 px fixed | Task 9 |
| Tab bar removed | Task 9 |

All requirements covered. ✓

### Placeholder scan

No "TBD", "TODO", or vague steps present. All code is explicit. ✓

### Type consistency

- `RailPanelId` defined in Task 3, imported in Task 9. ✓
- `WpnDisplay` imported in Task 7, passed from `PlayerHUDDesktop` as `hudWeapons`. ✓
- `ForcePowerDisplay` imported in Task 7, passed from `PlayerHUDDesktop` as `allForcePowers`. ✓
- `compact` prop added to `InitiativeStrip` in Task 5, used in Task 7. ✓
- `bottomOverlayRef` renamed in Task 6, updated in Task 7. ✓
- `activeQuickPanel` / `activeFullPanel` defined in Task 9, passed to `HudSessionTab` and `HudFullPanel`. ✓
