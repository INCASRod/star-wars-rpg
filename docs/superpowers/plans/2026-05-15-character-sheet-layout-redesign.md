# Character Sheet Layout Redesign + Theming Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the player HUD with a dual-row top bar, always-visible vitals strip, compact skill list in the left column, full roll feed in the right column, and CSS theming infrastructure for future skin switching.

**Architecture:** New `HudStatusStrip` component extracts vitals and action buttons from `HudLeftColumn`/`HudRightColumn` into a full-width grid row 2. Left column becomes characteristics 3×2 grid + scrollable `SkillsPanel`. Right column becomes the full `RollFeedPanel`. Theming uses a `[data-theme]` attribute on `<html>`, set from `localStorage` on boot, with all HUD accent colours expressed as semantic CSS custom properties in `globals.css`.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, CSS custom properties, `localStorage` for theme persistence.

---

### Task 1: CSS theming infrastructure

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/lib/theme.ts`
- Create: `src/components/ThemeInit.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1.1: Add semantic accent CSS vars to `globals.css`**

Find the line `--hud-gold: #E03A1E;` (around line 240) and insert directly below it:

```css
  --hud-accent-10:     rgba(224,58,30,0.10);
  --hud-accent-20:     rgba(224,58,30,0.20);
  --hud-accent-25:     rgba(224,58,30,0.25);
  --hud-accent-35:     rgba(224,58,30,0.35);
  --hud-accent-40:     rgba(224,58,30,0.40);
  --hud-accent-45:     rgba(224,58,30,0.45);
  --hud-accent-50:     rgba(224,58,30,0.50);
  --hud-accent-60:     rgba(224,58,30,0.60);
  --hud-accent-border: rgba(224,58,30,0.30);
  --hud-gold-subtle:   rgba(200,170,80,0.15);
  --hud-gold-border:   rgba(200,170,80,0.25);
  --hud-gold-40:       rgba(200,170,80,0.40);
```

- [ ] **Step 1.2: Create `src/lib/theme.ts`**

```ts
export type ThemeId = 'binary-sunset'

const STORAGE_KEY = 'holocron_theme'
const DEFAULT: ThemeId = 'binary-sunset'

export function getTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? DEFAULT
}

export function setTheme(id: ThemeId) {
  localStorage.setItem(STORAGE_KEY, id)
  document.documentElement.dataset.theme = id
}

export function initTheme() {
  document.documentElement.dataset.theme = getTheme()
}
```

- [ ] **Step 1.3: Create `src/components/ThemeInit.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { initTheme } from '@/lib/theme'

export function ThemeInit() {
  useEffect(() => { initTheme() }, [])
  return null
}
```

- [ ] **Step 1.4: Add `ThemeInit` to `src/app/layout.tsx`**

Add the import at the top:
```tsx
import { ThemeInit } from '@/components/ThemeInit'
```

Inside `<body>`, insert `<ThemeInit />` before `{children}`:
```tsx
<body className="antialiased">
  <ThemeInit />
  {children}
  <Toaster position="top-center" richColors />
</body>
```

- [ ] **Step 1.5: Verify in the browser**

Run: `npm run dev`

Open browser DevTools → Elements → `<html>`. Confirm `data-theme="binary-sunset"` is present after page load. No visual change expected.

- [ ] **Step 1.6: Commit**

```bash
git add src/app/globals.css src/lib/theme.ts src/components/ThemeInit.tsx src/app/layout.tsx
git commit -m "feat: add CSS accent vars and theme.ts infrastructure"
```

---

### Task 2: HudTabBar — remove Feed tab + colour cleanup

**Files:**
- Modify: `src/components/player-hud/HudTabBar.tsx`

- [ ] **Step 2.1: Remove `'Feed'` from the `TabName` union (line 6)**

```ts
// Before
export type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Feed' | 'Session' | 'Group'

// After
export type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Session' | 'Group'
```

- [ ] **Step 2.2: Remove `'Feed'` from the `allTabs` array (line 12)**

```ts
// Before
const allTabs: TabName[] = ['Session', 'Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Group']

// After
const allTabs: TabName[] = ['Session', 'Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Group']
```

- [ ] **Step 2.3: Replace accent `rgba` literals**

In the `sessionDim` line (~line 29):
```ts
// Before
const sessionDim = isCombatActive ? 'rgba(224,58,30,0.45)' : 'rgba(232,96,80,0.45)'

// After
const sessionDim = isCombatActive ? 'var(--hud-accent-45)' : 'rgba(232,96,80,0.45)'
```

In the `textShadow` ternary inside the button styles (~line 54):
```ts
// Before
: isSessionTab && active === tab
  ? (isCombatActive ? '0 0 10px rgba(224,58,30,0.4)' : '0 0 8px rgba(232,96,80,0.3)')
  : 'none',

// After
: isSessionTab && active === tab
  ? (isCombatActive ? '0 0 10px var(--hud-accent-40)' : '0 0 8px rgba(232,96,80,0.3)')
  : 'none',
```

- [ ] **Step 2.4: Verify**

Start dev server. Confirm: no Feed tab visible. Session, Skills, Talents, Inventory, Force (if force user), Lore, Group tabs all render and switch correctly.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/player-hud/HudTabBar.tsx
git commit -m "feat(tab-bar): remove Feed tab; replace accent rgba literals with CSS vars"
```

---

### Task 3: HudTopBar — portrait chip + colour cleanup

**Files:**
- Modify: `src/components/player-hud/HudTopBar.tsx`

- [ ] **Step 3.1: Add portrait chip between the HOLOCRON divider and the character name block**

Locate lines 55–57 (the first vertical divider followed by the character identity `<div>`):

```tsx
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Character identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
```

Replace with:

```tsx
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Portrait chip */}
      {character.portrait_url ? (
        <img
          src={character.portrait_url}
          alt=""
          style={{
            width: 30, height: 30, borderRadius: '50%',
            objectFit: 'cover', flexShrink: 0,
            border: '1.5px solid var(--hud-gold-40)',
          }}
        />
      ) : (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--hud-surface-hi)',
          border: '1.5px solid var(--hud-gold-40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
          color: C.gold, letterSpacing: '0.05em',
        }}>
          {character.name.split(/\s+/).map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()}
        </div>
      )}
      {/* Character identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
```

- [ ] **Step 3.2: Replace all `rgba(224,58,30,...)` literals in the file**

Use the following mapping for every occurrence. Run `grep -n 'rgba(224' src/components/player-hud/HudTopBar.tsx` to find each one:

| Old value | Replacement |
|---|---|
| `rgba(224,58,30,0.35)` | `var(--hud-accent-35)` |
| `rgba(224,58,30,0.4)` | `var(--hud-accent-40)` |
| `rgba(224,58,30,0.1)` | `var(--hud-accent-10)` |
| `rgba(224,58,30,0.2)` | `var(--hud-accent-20)` |
| `rgba(224,58,30,0.3)` | `var(--hud-accent-border)` |
| `rgba(224,58,30,0.6)` | `var(--hud-accent-60)` |
| `rgba(224,58,30,0.5)` | `var(--hud-accent-50)` |
| `rgba(224,58,30,0.25)` | `var(--hud-accent-25)` |
| `rgba(224,58,30,0.18)` | `var(--hud-accent-20)` |

After replacing, verify no `rgba(224` remains:

```bash
grep -n 'rgba(224' src/components/player-hud/HudTopBar.tsx
```

Expected: empty output.

- [ ] **Step 3.3: Verify in the browser**

Open a character sheet. Confirm:
- Portrait image shown between HOLOCRON and character name when `portrait_url` is set
- Two-letter initials shown in a circle when no portrait
- All top bar elements still render correctly (destiny, XP, credits, print, logout)

- [ ] **Step 3.4: Commit**

```bash
git add src/components/player-hud/HudTopBar.tsx
git commit -m "feat(top-bar): add portrait chip; replace accent rgba literals with CSS vars"
```

---

### Task 4: HudStatusStrip — new component

**Files:**
- Create: `src/components/player-hud/HudStatusStrip.tsx`

- [ ] **Step 4.1: Create `src/components/player-hud/HudStatusStrip.tsx`**

Full file content:

```tsx
'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI, FS_OVERLINE } from './design-tokens'
import { CombatCheckButton } from '@/components/character/CombatCheckButton'
import { ForceCheckButton } from '@/components/character/ForceCheckButton'
import { CriticalInjuryPips, type CritPip } from '@/components/character/CriticalInjuryPip'
import { EncumbranceBar } from '@/components/character/EncumbranceBar'
import { isForceUserSensitive } from '@/lib/forceUtils'
import type { Character } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'

interface HudStatusStripProps {
  character: Character
  effectiveStats: EffectiveStats | undefined
  engineBreakdown: { woundThreshold: { label: string; value: number }[]; strainThreshold: { label: string; value: number }[] } | undefined
  woundBonus: number
  encumbranceCurrent: number
  encumbranceBonus: number
  crits: Array<{ id: string; severity: string; custom_name?: string | null; description?: string | null; roll_result?: number | null; session_label?: string | null }>
  forceRating: number
  isCombat: boolean
  onVitalAdjust: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
  onHealCrit: (id: string) => void
  onOpenCombatCheck: () => void
  onOpenForceCheck: () => void
}

function groupSources(sources: { label: string; value: number }[]): { label: string; value: number }[] {
  const map = new Map<string, number>()
  for (const s of sources) map.set(s.label, (map.get(s.label) ?? 0) + s.value)
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

const CTRL_BTN: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--hud-border)',
  borderRadius: 4, width: 20, height: 20,
  cursor: 'pointer', color: 'var(--hud-text-dim)',
  fontFamily: "'Share Tech Mono','Courier New',monospace",
  fontSize: 'clamp(0.7rem, 1.1vw, 0.82rem)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

const LABEL_S: React.CSSProperties = {
  fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--hud-text-faint)', whiteSpace: 'nowrap',
}

const NUM_S: React.CSSProperties = {
  fontFamily: "'Share Tech Mono','Courier New',monospace",
  fontSize: 'clamp(0.68rem, 1vw, 0.80rem)',
  color: 'var(--hud-text-dim)', userSelect: 'none',
  minWidth: 32, textAlign: 'center',
}

const DIVIDER: React.CSSProperties = {
  width: 1, background: 'var(--hud-border)', alignSelf: 'stretch', flexShrink: 0,
}

export function HudStatusStrip({
  character, effectiveStats, engineBreakdown, woundBonus,
  encumbranceCurrent, encumbranceBonus, crits,
  forceRating, isCombat,
  onVitalAdjust, onHealCrit, onOpenCombatCheck, onOpenForceCheck,
}: HudStatusStripProps) {
  const [woundTipPos,  setWoundTipPos]  = useState<{ top: number; left: number } | null>(null)
  const [strainTipPos, setStrainTipPos] = useState<{ top: number; left: number } | null>(null)

  const wThreshold = effectiveStats?.woundThreshold ?? character.wound_threshold
  const sThreshold = effectiveStats?.strainThreshold ?? character.strain_threshold
  const wCurrent   = character.wound_current
  const sCurrent   = character.strain_current
  const wPct = wThreshold > 0 ? Math.min((wCurrent / (wThreshold + woundBonus)) * 100, 100) : 0
  const sPct = sThreshold > 0 ? Math.min((sCurrent / sThreshold) * 100, 100) : 0
  const wOver = wCurrent >= wThreshold + woundBonus
  const sOver = sCurrent >= sThreshold
  const encThreshold = character.encumbrance_threshold + encumbranceBonus
  const isForceUser  = isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)

  const woundBreakdown  = groupSources(engineBreakdown?.woundThreshold  ?? [])
  const strainBreakdown = groupSources(engineBreakdown?.strainThreshold ?? [])

  function VitalTooltip({ breakdown, top, left }: { breakdown: { label: string; value: number }[]; top: number; left: number }) {
    return createPortal(
      <div style={{
        position: 'fixed', top, left, zIndex: 9999,
        background: 'var(--hud-surface-hi)', border: '1px solid var(--hud-border-hi)',
        borderRadius: 8, padding: '8px 12px', minWidth: 140,
        pointerEvents: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
      }}>
        {breakdown.map(({ label, value }, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', gap: 16,
            fontFamily: "'Share Tech Mono','Courier New',monospace",
            fontSize: '0.72rem',
            color: i === 0 ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
            marginBottom: i < breakdown.length - 1 ? 3 : 0,
          }}>
            <span>{label}</span>
            <span style={{ color: i === 0 ? 'var(--hud-text-dim)' : C.gold }}>
              {i === 0 ? value : `+${value}`}
            </span>
          </div>
        ))}
      </div>,
      document.body,
    )
  }

  const critPips: CritPip[] = crits.map(c => ({
    id: c.id, severity: c.severity, name: c.custom_name || 'Injury',
    description: c.description ?? undefined, rollResult: c.roll_result ?? undefined,
    sessionLabel: c.session_label ?? undefined,
  }))

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: isCombat ? 'var(--hud-surface-hi)' : 'var(--hud-surface-mid)',
      borderBottom: isCombat ? '1px solid var(--hud-accent-35)' : `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
      padding: '5px var(--space-3)', flexShrink: 0,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* WOUNDS */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, position: 'relative' }}
        onMouseEnter={e => {
          const r = e.currentTarget.getBoundingClientRect()
          setWoundTipPos({ top: r.bottom + 6, left: r.left })
        }}
        onMouseLeave={() => setWoundTipPos(null)}
      >
        {woundTipPos && woundBreakdown.length > 0 && (
          <VitalTooltip breakdown={woundBreakdown} top={woundTipPos.top} left={woundTipPos.left} />
        )}
        <span style={LABEL_S}>Wounds</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', -1)}>−</button>
        <div style={{ width: 56, height: 7, background: 'var(--hud-border)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${wPct}%`,
            background: wOver ? 'var(--bs-red-mute)' : 'var(--bs-red-sun)',
            borderRadius: 4, transition: 'width 300ms ease, background 300ms ease',
          }} />
        </div>
        <span style={NUM_S}>
          {wCurrent}/{wThreshold}
          {woundBonus > 0 && <span style={{ color: C.gold, marginLeft: 2 }}>+{woundBonus}</span>}
        </span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', 1)}>+</button>
      </div>

      <div style={DIVIDER} />

      {/* STRAIN */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, position: 'relative' }}
        onMouseEnter={e => {
          const r = e.currentTarget.getBoundingClientRect()
          setStrainTipPos({ top: r.bottom + 6, left: r.left })
        }}
        onMouseLeave={() => setStrainTipPos(null)}
      >
        {strainTipPos && strainBreakdown.length > 0 && (
          <VitalTooltip breakdown={strainBreakdown} top={strainTipPos.top} left={strainTipPos.left} />
        )}
        <span style={LABEL_S}>Strain</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', -1)}>−</button>
        <div style={{ width: 56, height: 7, background: 'var(--hud-border)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${sPct}%`,
            background: sOver ? 'var(--bs-red-mute)' : 'var(--bs-red-mid)',
            borderRadius: 4, transition: 'width 300ms ease, background 300ms ease',
          }} />
        </div>
        <span style={NUM_S}>{sCurrent}/{sThreshold}</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', 1)}>+</button>
      </div>

      <div style={DIVIDER} />

      {/* ENC — compact inline display */}
      <EncumbranceBar
        current={encumbranceCurrent}
        threshold={encThreshold}
        brawn={character.brawn}
        compact
      />

      <div style={DIVIDER} />

      {/* CRITS — blood-drop pips, null when empty */}
      <CriticalInjuryPips crits={critPips} onHeal={onHealCrit} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <CombatCheckButton onOpen={onOpenCombatCheck} isInCombat={isCombat} />
      {isForceUser && <ForceCheckButton onOpen={onOpenForceCheck} />}
    </div>
  )
}
```

- [ ] **Step 4.2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors in `HudStatusStrip.tsx`. (It is not yet rendered — errors in `PlayerHUDDesktop.tsx` for other tasks are expected.)

- [ ] **Step 4.3: Commit**

```bash
git add src/components/player-hud/HudStatusStrip.tsx
git commit -m "feat(hud): add HudStatusStrip component"
```

---

### Task 5: HudLeftColumn — rewrite

**Files:**
- Modify: `src/components/player-hud/HudLeftColumn.tsx` (full rewrite)

- [ ] **Step 5.1: Replace the entire file content**

```tsx
'use client'

import { C, FONT_RAJDHANI } from './design-tokens'
import { SkillsPanel } from './SkillsPanel'
import { getSkillPool, rollPool } from './dice-engine'
import type { Character, HudSkill, SpeciesAbility } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { RollResult } from './dice-engine'
import type { RollMeta } from '@/lib/logRoll'

interface HudLeftColumnProps {
  character: Character
  hudSkills: HudSkill[]
  isCombat: boolean
  skillModifiers: Record<string, SkillDiceModifier>
  speciesAbilities: SpeciesAbility[]
  bonusSkillKeys: Set<string>
  onRoll: (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => void
  onBuySkill: (key: string, rank: number, isCareer: boolean) => void
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
}

export function HudLeftColumn({
  character, hudSkills, isCombat, skillModifiers, speciesAbilities, bonusSkillKeys,
  onRoll, onBuySkill, onOpenPopover,
}: HudLeftColumnProps) {
  function handleSkillRoll(skill: HudSkill) {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    const pool = { proficiency, ability, boost: 0, challenge: 0, difficulty: 2, setback: 0, force: 0 }
    onRoll(rollPool(pool), skill.name, pool as Record<string, number>)
  }

  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Characteristics 3×2 grid ── */}
      <div style={{ padding: 'var(--space-2)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
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
              background: 'var(--hud-surface-lo)',
              border: '1px solid var(--hud-border)',
              borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Share Tech Mono','Courier New',monospace",
                fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                fontWeight: 700, color: C.gold, lineHeight: 1,
              }}>
                {ch.value}
              </div>
              <div style={{
                fontFamily: FONT_RAJDHANI,
                fontSize: 'clamp(0.48rem, 0.72vw, 0.58rem)',
                fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--hud-text-faint)', marginTop: 3,
                textTransform: 'uppercase',
              }}>
                {ch.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--hud-border)', flexShrink: 0 }} />

      {/* ── Compact scrollable skill list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-1) var(--space-2)' }}>
        <SkillsPanel
          skills={hudSkills}
          onRoll={handleSkillRoll}
          onUpgrade={skill => onBuySkill(skill.key, skill.rank, skill.isCareer)}
          isCombat={isCombat}
          xpAvailable={character.xp_available}
          onOpenPopover={onOpenPopover}
          characterId={character.id}
          skillModifiers={skillModifiers}
          speciesAbilities={speciesAbilities}
          bonusSkillKeys={bonusSkillKeys}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors in `HudLeftColumn.tsx`. Errors in `PlayerHUDDesktop.tsx` about mismatched props are expected — fixed in Task 8.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/player-hud/HudLeftColumn.tsx
git commit -m "feat(hud): rewrite HudLeftColumn — characteristics + compact skill list"
```

---

### Task 6: HudRightColumn — rewrite

**Files:**
- Modify: `src/components/player-hud/HudRightColumn.tsx` (full rewrite)

- [ ] **Step 6.1: Replace the entire file content**

```tsx
'use client'

import { C, FONT_RAJDHANI, FS_OVERLINE } from './design-tokens'
import { RollFeedPanel } from './RollFeedPanel'
import type { RollEntry } from '@/hooks/useRollFeed'

interface HudRightColumnProps {
  rolls: RollEntry[]
  ownCharacterId: string
  isGm: boolean
}

export function HudRightColumn({ rolls, ownCharacterId, isGm }: HudRightColumnProps) {
  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderLeft: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '6px var(--space-2)',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--hud-text-faint)',
        }}>
          Roll Feed
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <RollFeedPanel rolls={rolls} ownCharacterId={ownCharacterId} isGm={isGm} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6.2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors in `HudRightColumn.tsx`.

- [ ] **Step 6.3: Commit**

```bash
git add src/components/player-hud/HudRightColumn.tsx
git commit -m "feat(hud): rewrite HudRightColumn — full RollFeedPanel"
```

---

### Task 7: HudLoreTab — add CharacterAvatar

**Files:**
- Modify: `src/components/player-hud/HudLoreTab.tsx`

- [ ] **Step 7.1: Replace the entire file content**

```tsx
'use client'
import { LoreContent } from '@/components/character/LoreContent'
import { CharacterAvatar } from './CharacterAvatar'
import type { Character, RefSpecies } from '@/lib/types'

interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

export function HudLoreTab({
  character, careerName, speciesName,
  refSpeciesAll, refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={speciesName}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
      />
      <LoreContent
        characterName={character.name}
        careerName={careerName}
        speciesName={speciesName}
        gender={character.gender}
        backstory={character.backstory || ''}
        notes={character.notes || ''}
        speciesRef={refSpeciesAll.find(s => s.key === character.species_key)}
        motivationType={character.motivation_type || character.obligation_type || character.duty_type}
        motivationSpecific={character.motivation_specific}
        motivationDesc={character.motivation_description || character.obligation_notes || character.duty_notes}
        motivationConfigured={character.motivation_configured}
        dutyType={character.duty_type}
        dutyValue={character.duty_value}
        dutyLore={character.duty_lore}
        dutyCustomName={character.duty_custom_name}
        dutyResolvedType={refDutyTypes.find(d => d.key === character.duty_type)?.name}
        obligationType={character.obligation_type}
        obligationValue={character.obligation_value}
        obligationLore={character.obligation_lore}
        obligationCustomName={character.obligation_custom_name}
        obligationResolvedType={refObligationTypes.find(o => o.key === character.obligation_type)?.name}
        dutyObligationConfigured={character.duty_obligation_configured}
        onBackstoryChange={onBackstoryChange}
        onNotesChange={onNotesChange}
      />
    </div>
  )
}
```

- [ ] **Step 7.2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors in `HudLoreTab.tsx`. `PlayerHUDDesktop.tsx` will still error on the missing `onPortraitUpload`/`onPortraitDelete` — fixed in Task 8.

- [ ] **Step 7.3: Commit**

```bash
git add src/components/player-hud/HudLoreTab.tsx
git commit -m "feat(lore-tab): add CharacterAvatar at top; add portrait upload/delete props"
```

---

### Task 8: PlayerHUDDesktop — wire everything together

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

- [ ] **Step 8.1: Update imports**

Add `HudStatusStrip` import (after the existing `HudRightColumn` import line):
```tsx
import { HudStatusStrip } from './HudStatusStrip'
```

Remove the now-unused direct `RollFeedPanel` import (line 31):
```tsx
// Remove this line:
import { RollFeedPanel } from './RollFeedPanel'
```

- [ ] **Step 8.2: Update the main grid template (around line 337)**

Find:
```tsx
        gridTemplateColumns: 'clamp(220px, 18vw, 320px) 1fr clamp(260px, 20vw, 360px)',
        gridTemplateRows: 'clamp(48px, 4vh, 64px) 1fr',
```

Replace with:
```tsx
        gridTemplateColumns: 'clamp(200px,22%,260px) 1fr clamp(200px,20%,240px)',
        gridTemplateRows: 'auto auto 1fr',
```

- [ ] **Step 8.3: Insert `HudStatusStrip` after the closing `/>` of `HudTopBar`**

After `</HudTopBar>` (or the self-closing `/>` of `HudTopBar`, around line 359), add:

```tsx
        <HudStatusStrip
          character={character}
          effectiveStats={effectiveStats}
          engineBreakdown={engineBreakdown}
          woundBonus={woundBonus}
          encumbranceCurrent={encumbranceCurrent}
          encumbranceBonus={encumbranceBonus}
          crits={crits}
          forceRating={forceRating}
          isCombat={isCombat}
          onVitalAdjust={handleVitalAdjust}
          onHealCrit={handleHealCrit}
          onOpenCombatCheck={() => setCombatCheckOpen(true)}
          onOpenForceCheck={() => setForceCheckOpen(true)}
        />
```

- [ ] **Step 8.4: Replace the `HudLeftColumn` call**

Find the full `<HudLeftColumn ... />` block (around lines 362–376) and replace with:

```tsx
        <HudLeftColumn
          character={character}
          hudSkills={hudSkills}
          isCombat={isCombat}
          skillModifiers={skillModifiers}
          speciesAbilities={speciesAbilities}
          bonusSkillKeys={bonusSkillKeys}
          onRoll={handleRoll}
          onBuySkill={handleBuySkill}
          onOpenPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
        />
```

- [ ] **Step 8.5: Replace the `HudRightColumn` call**

Find the `<HudRightColumn ... />` block (around lines 526–535) and replace with:

```tsx
        <HudRightColumn
          rolls={rolls}
          ownCharacterId={character.id}
          isGm={isGmMode}
        />
```

- [ ] **Step 8.6: Update the `HudLoreTab` call — add portrait handlers**

Find the `{activeTab === 'Lore' && (` block and add the two new props:

```tsx
              {activeTab === 'Lore' && (
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
              )}
```

- [ ] **Step 8.7: Remove the Feed tab branch**

Find and delete the entire block (around lines 502–508):
```tsx
              {activeTab === 'Feed' && (
                <RollFeedPanel
                  rolls={rolls}
                  ownCharacterId={character.id}
                  isGm={false}
                />
              )}
```

Also verify: no remaining references to `'Feed'` string in this file. Run:
```bash
grep -n "'Feed'" src/components/player-hud/PlayerHUDDesktop.tsx
```
Expected: empty output.

- [ ] **Step 8.8: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. Common issues to check:
- `HudStatusStrip` not imported → add the import from Step 8.1
- `RollFeedPanel` still referenced → ensure the Feed tab branch was removed
- `EffectiveStats` type mismatch → `effectiveStats` from `useDerivedStats` is typed as `EffectiveStats | undefined`, which matches `HudStatusStrip`'s prop

- [ ] **Step 8.9: Verify full layout in the browser**

Start dev server: `npm run dev`

Open a character sheet. Verify each success criterion:

| Check | Expected |
|---|---|
| Top bar row 1 | HOLOCRON · portrait chip · name/career · destiny · XP · credits · print · logout |
| Top bar row 2 | Wounds −N/M+ · Strain −N/M+ · ENC N/M · crit pips · ⚔ COMBAT CHECK |
| Left column top | 3×2 characteristics grid (Brawn, Agility, Intellect, Cunning, Willpower, Presence) |
| Left column body | Scrollable skill list with search; clicking a skill opens dice pool popover |
| Center default | Session tab active; map visible |
| Tab bar | Session, Skills, Talents, Inventory, Force (if force user), Lore, Group — no Feed |
| Right column | Full roll feed visible; rich roll cards |
| Lore tab | CharacterAvatar at top with upload/delete; lore content below |
| Wounds/Strain −/+ | Clicking adjusts value in real-time |
| Combat Check button | Opens CombatCheckOverlay |
| Force Check button | Only visible for force-sensitive characters |

- [ ] **Step 8.10: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(hud): wire HudStatusStrip, new grid, remove Feed tab, update column props"
```

---

### Task 9: Update `docs/architecture.md`

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 9.1: Update the player-hud component entries**

In the component map section for `src/components/player-hud/`, apply these changes:

| Entry | Update |
|---|---|
| `HudTopBar` | Add: "portrait chip between HOLOCRON and name; accent rgba literals → CSS vars" |
| `HudTabBar` | Update: "Feed removed from TabName and allTabs; TabName = Session\|Skills\|Talents\|Inventory\|Force\|Lore\|Group" |
| `HudLeftColumn` | Update description: "characteristics 3×2 grid + compact scrollable SkillsPanel; vitals moved to HudStatusStrip; portrait moved to HudLoreTab" |
| `HudRightColumn` | Update description: "full-height RollFeedPanel with Roll Feed header; action buttons moved to HudStatusStrip" |
| `HudLoreTab` | Update: "CharacterAvatar at top (upload/delete); props now include onPortraitUpload, onPortraitDelete" |
| `HudStatusStrip` *(new)* | Add: "full-width strip spanning grid row 2 (`gridColumn: 1/-1`); Wounds +/-, Strain +/-, EncumbranceBar (compact), CriticalInjuryPips, CombatCheckButton, ForceCheckButton (force-sensitive only)" |

In the utilities/lib section, add:

| Entry | Description |
|---|---|
| `src/lib/theme.ts` *(new)* | "ThemeId type; getTheme/setTheme/initTheme; persists selection in localStorage; sets `data-theme` on `<html>`" |
| `src/components/ThemeInit.tsx` *(new)* | "Client component; calls initTheme() on mount to apply stored theme; rendered in root layout" |

In the CSS section, note:

`globals.css`: added `--hud-accent-10/20/25/35/40/45/50/60/border` and `--hud-gold-subtle/border/40` semantic vars under `:root` — enables future theme switching via `[data-theme="..."]` block overrides.

- [ ] **Step 9.2: Commit**

```bash
git add docs/architecture.md
git commit -m "docs(architecture): update component map for layout redesign + theming"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task covering it |
|---|---|
| §2.1 Grid structure change | Task 8.2 |
| §2.2 Portrait chip in top bar | Task 3.1 |
| §2.3 HudStatusStrip (wounds/strain/enc/crits/buttons) | Task 4 |
| §2.4 HudLeftColumn rewrite (characteristics + skills) | Task 5 |
| §2.5 Remove Feed from tab bar | Task 2 |
| §2.6 CharacterAvatar in Lore tab | Task 7 |
| §2.7 HudRightColumn → full RollFeedPanel | Task 6 |
| §3.2 CSS vars in globals.css | Task 1.1 |
| §3.3 Colour cleanup in HudTopBar | Task 3.2 |
| §3.3 Colour cleanup in HudTabBar | Task 2.3 |
| §3.3 HudStatusStrip written clean | Task 4 (CSS vars only) |
| §3.3 HudLeftColumn written clean | Task 5 (CSS vars only) |
| §3.3 HudRightColumn written clean | Task 6 (CSS vars only) |
| §3.4 Theme switching stub (theme.ts + initTheme) | Task 1.2–1.4 |
| Architecture doc update | Task 9 |

All spec sections covered. No gaps.
