# Character Sheet Themes & Skin Switcher — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three switchable colour themes (Binary Sunset, Rebel Operative, Kyber Archive) to the character sheet, with per-player persistence via the existing `character_sessions` table.

**Architecture:** CSS custom property overrides on a `[data-theme]` attribute applied to `PlayerHUDDesktop`'s wrapper div. No component logic changes needed for theming — it's all CSS. Theme state lives in `PlayerHUDDesktop`, loaded from Supabase on mount and written back on change. Three swatch buttons in `HudTopBar` trigger the switch. Before the CSS override mechanism can work, hardcoded hex values in five component files must be replaced with their CSS var equivalents.

**Tech Stack:** Next.js 14 (App Router, client components), Supabase JS client, TypeScript, CSS custom properties, Tailwind CSS

---

### Task 1: DB Migration — add `ui_theme` column

**Files:**
- Create: `supabase/migrations/053_ui_theme.sql`

- [ ] **Step 1: Write the migration file**

```sql
alter table character_sessions
  add column if not exists ui_theme text not null default 'binary-sunset'
  check (ui_theme in ('binary-sunset', 'operative', 'kyber'));
```

Save to `supabase/migrations/053_ui_theme.sql`.

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push`

Expected output includes: `Applying migration 053_ui_theme.sql...` with no errors.

- [ ] **Step 3: Verify column exists**

Run: `npx supabase db diff`

Expected: empty diff (no pending changes).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/053_ui_theme.sql
git commit -m "feat(db): add ui_theme column to character_sessions"
```

---

### Task 2: CSS Theme Blocks — `globals.css`

**Files:**
- Modify: `src/app/globals.css`

Append both `[data-theme]` override blocks immediately before the `@layer base` block at the end of the file (line 908).

- [ ] **Step 1: Append the Rebel Operative theme block**

Add before `@layer base {`:

```css
/* ═══════════════════════════════════════════════════════════════ */
/*  THEME: Rebel Operative — dark warm-charcoal / rebel orange    */
/* ═══════════════════════════════════════════════════════════════ */
[data-theme="operative"] {
  --hud-bg:            #141210;
  --hud-panel:         #1E1A16;
  --hud-surface-lo:    #262018;
  --hud-surface-mid:   #2A2218;
  --hud-surface-hi:    #2E281E;

  --hud-border:        rgba(210,185,150,.13);
  --hud-border-hi:     rgba(210,185,150,.22);
  --hud-border-strong: rgba(210,185,150,.30);

  --hud-text:          #B0A490;
  --hud-text-dim:      #726050;
  --hud-text-faint:    #4C4038;

  --hud-gold:          #D4681A;
  --hud-accent-10:     rgba(212,104,26,.10);
  --hud-accent-20:     rgba(212,104,26,.20);
  --hud-accent-25:     rgba(212,104,26,.25);
  --hud-accent-35:     rgba(212,104,26,.35);
  --hud-accent-40:     rgba(212,104,26,.40);
  --hud-accent-45:     rgba(212,104,26,.45);
  --hud-accent-50:     rgba(212,104,26,.50);
  --hud-accent-60:     rgba(212,104,26,.60);
  --hud-accent-border: rgba(212,104,26,.28);

  --hud-gold-subtle:   rgba(200,148,56,.15);
  --hud-gold-border:   rgba(200,148,56,.25);
  --hud-gold-40:       rgba(200,148,56,.40);

  --hud-vital-bg:      #180C06;
  --hud-vital-border:  #0E0602;
  --hud-vital-text:    #E8C888;
  --hud-vital-text-dim:rgba(232,200,136,.60);
  --hud-vital-sep:     rgba(232,200,136,.18);
  --hud-vital-wounds:  #CC4020;
  --hud-vital-strain:  #C07818;

  --bs-sky:            #141210;
  --bs-panel:          #1E1A16;
  --bs-surface:        #262018;
  --bs-card:           #2E281E;
  --bs-card-hi:        #362E24;
  --bs-red-sun:        #D4681A;
  --bs-red-pale:       #E07840;
  --bs-red-hi:         #B85016;
  --bs-red-mid:        #904010;
  --bs-red-dim:        #602808;
  --bs-red-mute:       #301404;
  --bs-ink:            #E8DED0;
  --bs-txt:            #B0A490;
  --bs-txt2:           #726050;
  --bs-txt3:           #4C4038;
  --bs-on-red:         #FFF0E0;
  --bs-bdr-strong:     rgba(210,185,150,.30);
  --bs-bdr-mid:        rgba(210,185,150,.20);
  --bs-bdr-subtle:     rgba(210,185,150,.13);
  --bs-red-glow:       rgba(212,104,26,.12);
  --bs-red-glow-s:     rgba(212,104,26,.28);
}

[data-theme="operative"] .combat-check-btn {
  background: rgba(212,104,26,.10);
  border: 1px solid rgba(212,104,26,.35);
  color: #E8C888;
}
[data-theme="operative"] .combat-check-btn:hover {
  background: rgba(212,104,26,.20);
  border-color: rgba(212,104,26,.55);
  box-shadow: 0 0 10px rgba(212,104,26,.12);
}
@keyframes combatPulseOperative {
  0%, 100% { border-color: rgba(212,104,26,.25); box-shadow: none; }
  50%       { border-color: rgba(212,104,26,.55); box-shadow: 0 0 10px rgba(212,104,26,.14); }
}
[data-theme="operative"] .combat-check-btn-pulse {
  animation: combatPulseOperative 2s ease-in-out infinite;
}
```

- [ ] **Step 2: Append the Kyber Archive theme block**

Add immediately after the operative block, still before `@layer base {`:

```css
/* ═══════════════════════════════════════════════════════════════ */
/*  THEME: Kyber Archive — midnight indigo / kyber-crystal cyan   */
/* ═══════════════════════════════════════════════════════════════ */
[data-theme="kyber"] {
  --hud-bg:            #0C0E1A;
  --hud-panel:         #111326;
  --hud-surface-lo:    #161830;
  --hud-surface-mid:   #1A1C34;
  --hud-surface-hi:    #1C1E38;

  --hud-border:        rgba(91,188,216,.16);
  --hud-border-hi:     rgba(91,188,216,.28);
  --hud-border-strong: rgba(91,188,216,.38);

  --hud-text:          #B0B8D0;
  --hud-text-dim:      #707898;
  --hud-text-faint:    #485070;

  --hud-gold:          #5BBCD8;
  --hud-accent-10:     rgba(91,188,216,.10);
  --hud-accent-20:     rgba(91,188,216,.20);
  --hud-accent-25:     rgba(91,188,216,.25);
  --hud-accent-35:     rgba(91,188,216,.35);
  --hud-accent-40:     rgba(91,188,216,.40);
  --hud-accent-45:     rgba(91,188,216,.45);
  --hud-accent-50:     rgba(91,188,216,.50);
  --hud-accent-60:     rgba(91,188,216,.60);
  --hud-accent-border: rgba(91,188,216,.25);

  --hud-gold-subtle:   rgba(200,162,78,.15);
  --hud-gold-border:   rgba(200,162,78,.25);
  --hud-gold-40:       rgba(200,162,78,.40);

  --hud-vital-bg:      #081220;
  --hud-vital-border:  #050C18;
  --hud-vital-text:    #80CCE8;
  --hud-vital-text-dim:rgba(128,204,232,.60);
  --hud-vital-sep:     rgba(128,204,232,.18);
  --hud-vital-wounds:  #D84030;
  --hud-vital-strain:  #C89830;

  --bs-sky:            #0C0E1A;
  --bs-panel:          #111326;
  --bs-surface:        #161830;
  --bs-card:           #1C1E38;
  --bs-card-hi:        #202240;
  --bs-red-sun:        #5BBCD8;
  --bs-red-pale:       #80D4EC;
  --bs-red-hi:         #3A9CBD;
  --bs-red-mid:        #2A7898;
  --bs-red-dim:        #1A5070;
  --bs-red-mute:       #0C2840;
  --bs-ink:            #EEF0F8;
  --bs-txt:            #B0B8D0;
  --bs-txt2:           #707898;
  --bs-txt3:           #485070;
  --bs-on-red:         #040814;
  --bs-bdr-strong:     rgba(91,188,216,.38);
  --bs-bdr-mid:        rgba(91,188,216,.26);
  --bs-bdr-subtle:     rgba(91,188,216,.16);
  --bs-red-glow:       rgba(91,188,216,.12);
  --bs-red-glow-s:     rgba(91,188,216,.28);
}

[data-theme="kyber"] .combat-check-btn {
  background: rgba(91,188,216,.10);
  border: 1px solid rgba(91,188,216,.35);
  color: #80CCE8;
}
[data-theme="kyber"] .combat-check-btn:hover {
  background: rgba(91,188,216,.18);
  border-color: rgba(91,188,216,.55);
  box-shadow: 0 0 10px rgba(91,188,216,.12);
}
@keyframes combatPulseKyber {
  0%, 100% { border-color: rgba(91,188,216,.25); box-shadow: none; }
  50%       { border-color: rgba(91,188,216,.55); box-shadow: 0 0 10px rgba(91,188,216,.14); }
}
[data-theme="kyber"] .combat-check-btn-pulse {
  animation: combatPulseKyber 2s ease-in-out infinite;
}
```

- [ ] **Step 3: Verify the CSS parses cleanly**

Run: `npx next build 2>&1 | head -40`

Expected: no CSS parse errors. (A full build passing is ideal but TypeScript errors from un-wired components are expected at this stage — CSS errors are not.)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(themes): add operative and kyber CSS theme blocks"
```

---

### Task 3: Hardcoded Hex Audit — `SkillsPanel.tsx`

**Files:**
- Modify: `src/components/player-hud/SkillsPanel.tsx`

Two sites to fix: the `UpgradeButton` component's hover handlers and default styles (~line 218–227), and the mode badge (~line 585–586).

- [ ] **Step 1: Fix UpgradeButton `onMouseEnter` hover background**

At line 218, replace:
```tsx
          if (canAfford) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(224,58,30,0.2)'
```
With:
```tsx
          if (canAfford) (e.currentTarget as HTMLButtonElement).style.background = 'var(--hud-accent-20)'
```

- [ ] **Step 2: Fix UpgradeButton `onMouseLeave` background reset**

At line 222, replace:
```tsx
          ;(e.currentTarget as HTMLButtonElement).style.background = canAfford ? 'rgba(224,58,30,0.1)' : 'var(--hud-surface-lo)'
```
With:
```tsx
          ;(e.currentTarget as HTMLButtonElement).style.background = canAfford ? 'var(--hud-accent-10)' : 'var(--hud-surface-lo)'
```

- [ ] **Step 3: Fix UpgradeButton default `background` style**

At line 226, replace:
```tsx
          background: canAfford ? 'rgba(224,58,30,0.1)' : 'var(--hud-surface-lo)',
```
With:
```tsx
          background: canAfford ? 'var(--hud-accent-10)' : 'var(--hud-surface-lo)',
```

- [ ] **Step 4: Fix UpgradeButton `border` style**

At line 227, replace:
```tsx
          border: `1px solid ${canAfford ? 'rgba(224,58,30,0.35)' : 'var(--hud-border)'}`,
```
With:
```tsx
          border: `1px solid ${canAfford ? 'var(--hud-accent-35)' : 'var(--hud-border)'}`,
```

- [ ] **Step 5: Fix mode badge `color`**

At line 585, replace:
```tsx
            color: isCombat ? '#E03A1E' : C.gold,
```
With:
```tsx
            color: C.gold,
```

(Both states resolve to the primary accent — `C.gold` = `var(--hud-gold)` — so the conditional is not needed.)

- [ ] **Step 6: Fix mode badge `border`**

At line 586, replace:
```tsx
            border: `1px solid ${isCombat ? 'rgba(224,58,30,0.4)' : `${C.gold}44`}`,
```
With:
```tsx
            border: '1px solid var(--hud-accent-40)',
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: no new errors from these files.

- [ ] **Step 8: Commit**

```bash
git add src/components/player-hud/SkillsPanel.tsx
git commit -m "fix(themes): replace hardcoded hex in SkillsPanel with CSS vars"
```

---

### Task 4: Hardcoded Hex Audit — `DiceRoller.tsx`, `ForcePanel.tsx`, `RollFeedPanel.tsx`

**Files:**
- Modify: `src/components/player-hud/DiceRoller.tsx`
- Modify: `src/components/player-hud/ForcePanel.tsx`
- Modify: `src/components/player-hud/RollFeedPanel.tsx`

- [ ] **Step 1: DiceRoller — fix weapon card background and border (~line 256–257)**

Replace:
```tsx
                      background: isSelected ? 'rgba(224,120,85,0.15)' : 'rgba(224,58,30,0.05)',
                      border: `1px solid ${isSelected ? 'rgba(224,120,85,0.55)' : C.border}`,
```
With:
```tsx
                      background: isSelected ? 'var(--hud-accent-20)' : 'var(--hud-accent-10)',
                      border: `1px solid ${isSelected ? 'var(--hud-accent-50)' : C.border}`,
```

- [ ] **Step 2: DiceRoller — fix weapon name color (~line 262)**

Replace:
```tsx
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: 12, fontWeight: 700, color: isSelected ? '#E07855' : C.text }}>
```
With:
```tsx
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: 12, fontWeight: 700, color: isSelected ? 'var(--hud-gold)' : C.text }}>
```

- [ ] **Step 3: DiceRoller — fix DMG value color (~line 267)**

Replace:
```tsx
                        <span style={{ color: '#E07855' }}>DMG {wpn.damage}</span>
```
With:
```tsx
                        <span style={{ color: 'var(--bs-red-pale)' }}>DMG {wpn.damage}</span>
```

(`#E05050` on the CRIT label at line 268 is a game-semantic danger/damage indicator — leave it hardcoded.)

- [ ] **Step 4: DiceRoller — fix roll button gradient (~line 496)**

Replace:
```tsx
              background: isEmpty ? C.textFaint : selectedWeapon ? 'linear-gradient(135deg, #E07855, #A04030)' : 'linear-gradient(135deg, #E03A1E, #A02010)',
```
With:
```tsx
              background: isEmpty ? C.textFaint : selectedWeapon ? 'linear-gradient(135deg, var(--bs-red-pale), var(--bs-red-hi))' : 'linear-gradient(135deg, var(--hud-gold), var(--bs-red-hi))',
```

- [ ] **Step 5: ForcePanel — fix Force Powers section add-button (~lines 527–528)**

Replace:
```tsx
              background: 'rgba(224,58,30,0.08)',
              border: `1px solid rgba(224,58,30,0.3)`,
```
With:
```tsx
              background: 'var(--hud-accent-10)',
              border: '1px solid var(--hud-accent-border)',
```

- [ ] **Step 6: RollFeedPanel — fix CRIT ELIGIBLE badge (~lines 304–306)**

Replace:
```tsx
              background: 'rgba(224,58,30,0.1)', border: '1px solid rgba(224,58,30,0.35)',
              fontFamily: FONT_MONO, fontSize: 'clamp(0.58rem, 0.88vw, 0.68rem)',
              color: '#E03A1E', fontWeight: 700, letterSpacing: '0.05em',
```
With:
```tsx
              background: 'var(--hud-accent-10)', border: '1px solid var(--hud-accent-35)',
              fontFamily: FONT_MONO, fontSize: 'clamp(0.58rem, 0.88vw, 0.68rem)',
              color: 'var(--hud-gold)', fontWeight: 700, letterSpacing: '0.05em',
```

- [ ] **Step 7: SkillRollPopover — fix button border colour (~line 53)**

Replace:
```tsx
        border: `1px solid ${hovered && !disabled ? 'rgba(224,58,30,0.4)' : DIM}`,
```
With:
```tsx
        border: `1px solid ${hovered && !disabled ? 'var(--hud-accent-40)' : DIM}`,
```

- [ ] **Step 8: SkillRollPopover — fix header separator dot colour (~line 198)**

Replace:
```tsx
        <span style={{ color: 'rgba(224,58,30,0.4)', fontFamily: FONT_MONO, fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)' }}>&middot;</span>
```
With:
```tsx
        <span style={{ color: 'var(--hud-accent-40)', fontFamily: FONT_MONO, fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)' }}>&middot;</span>
```

- [ ] **Step 9: SkillRollPopover — fix subtitle accent colour (~line 202)**

Replace:
```tsx
          color: 'rgba(224,58,30,0.5)',
```
With:
```tsx
          color: 'var(--hud-accent-50)',
```

- [ ] **Step 10: SkillRollPopover — fix inactive upgrade button colour (~line 270)**

Replace:
```tsx
                color: active ? '#CE93D8' : 'rgba(224,58,30,0.55)',
```
With:
```tsx
                color: active ? '#CE93D8' : 'var(--hud-accent-50)',
```

(`#CE93D8` is Force-purple — game-semantic, leave it hardcoded. Only the red accent half changes.)

- [ ] **Step 11: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: no new errors from these files.

- [ ] **Step 12: Commit**

```bash
git add src/components/player-hud/DiceRoller.tsx src/components/player-hud/ForcePanel.tsx src/components/player-hud/RollFeedPanel.tsx src/components/character/SkillRollPopover.tsx
git commit -m "fix(themes): replace hardcoded hex in DiceRoller, ForcePanel, RollFeedPanel, SkillRollPopover"
```

---

### Task 5: `ThemeSwitcher` Component

**Files:**
- Create: `src/components/player-hud/ThemeSwitcher.tsx`

- [ ] **Step 1: Create the component file**

```tsx
'use client'

export type UiTheme = 'binary-sunset' | 'operative' | 'kyber'

interface ThemeSwitcherProps {
  current: UiTheme
  onChange: (theme: UiTheme) => void
}

const THEMES: { key: UiTheme; label: string; bg: string; accent: string }[] = [
  { key: 'binary-sunset', label: 'Binary Sunset',  bg: '#DCCFBC', accent: '#E03A1E' },
  { key: 'operative',     label: 'Rebel Operative', bg: '#1E1A16', accent: '#D4681A' },
  { key: 'kyber',         label: 'Kyber Archive',   bg: '#111326', accent: '#5BBCD8' },
]

export function ThemeSwitcher({ current, onChange }: ThemeSwitcherProps) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {THEMES.map(t => {
        const active = t.key === current
        return (
          <button
            key={t.key}
            title={t.label}
            onClick={() => onChange(t.key)}
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              cursor: 'pointer',
              background: `radial-gradient(circle at 35% 35%, ${t.accent} 0%, ${t.bg} 60%)`,
              border: active ? '2px solid var(--hud-gold)' : '2px solid transparent',
              outline: active ? '1px solid var(--hud-border-hi)' : 'none',
              outlineOffset: 1,
              padding: 0,
              flexShrink: 0,
              transition: 'border-color .15s',
            }}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: no errors from the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/player-hud/ThemeSwitcher.tsx
git commit -m "feat(themes): add ThemeSwitcher component"
```

---

### Task 6: Wire `PlayerHUDDesktop`

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

Four changes: (a) import type + component, (b) add `uiTheme` state + fetch effect, (c) `handleThemeChange`, (d) apply `data-theme` to wrapper div, (e) pass props to `HudTopBar`.

- [ ] **Step 1: Add import at the top of the imports section**

At the end of the existing import block (before the `interface PlayerHUDDesktopProps` declaration), add:

```tsx
import { ThemeSwitcher, type UiTheme } from './ThemeSwitcher'
```

- [ ] **Step 2: Add `uiTheme` state in the `// ── UI State ──` block (~line 174)**

After `const [activeTab, setActiveTab] = useState<TabName>('Session')`, add:

```tsx
  const [uiTheme, setUiTheme] = useState<UiTheme>('binary-sunset')
```

- [ ] **Step 3: Add the theme-fetch effect**

After the existing `useEffect` that prompts for unresolved Dedication purchases (~after line 207), add:

```tsx
  // ── Load persisted theme from character_sessions ──────────────────────────
  useEffect(() => {
    const sessionKey = localStorage.getItem('holocron_session_key')
    if (!sessionKey) return
    supabase
      .from('character_sessions')
      .select('ui_theme')
      .eq('character_id', characterId)
      .eq('session_key', sessionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.ui_theme) setUiTheme(data.ui_theme as UiTheme)
      })
  }, [characterId]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Add `handleThemeChange` function**

After `handleLogout` (~line 224), add:

```tsx
  // ── Theme switching ──
  function handleThemeChange(theme: UiTheme) {
    setUiTheme(theme)
    const sessionKey = localStorage.getItem('holocron_session_key')
    if (!sessionKey) return
    supabase
      .from('character_sessions')
      .update({ ui_theme: theme })
      .eq('character_id', characterId)
      .eq('session_key', sessionKey)
      .then(({ error }) => {
        if (error) console.warn('[theme save] failed:', error.message)
      })
  }
```

- [ ] **Step 5: Apply `data-theme` to the wrapper div (~line 274)**

Replace:
```tsx
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: C.bg }}>
```
With:
```tsx
    <div
      data-theme={uiTheme === 'binary-sunset' ? undefined : uiTheme}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: C.bg }}
    >
```

- [ ] **Step 6: Pass theme props to `HudTopBar` (~line 346)**

Replace the existing `<HudTopBar ... />` call:
```tsx
        <HudTopBar
          character={character}
          careerName={careerName}
          specNames={specNames}
          speciesName={speciesName}
          isCombat={isCombat}
          combatRound={combatRound}
          pdfGenerating={pdfGenerating}
          destinyPoolRecord={destinyPoolRecord}
          onSpendDestinyOpen={() => setDestinySpendOpen(true)}
          onSpendCreditsOpen={() => setSpendCreditsOpen(true)}
          onDownloadPDF={handleDownloadPDF}
          onLogout={handleLogout}
        />
```
With:
```tsx
        <HudTopBar
          character={character}
          careerName={careerName}
          specNames={specNames}
          speciesName={speciesName}
          isCombat={isCombat}
          combatRound={combatRound}
          pdfGenerating={pdfGenerating}
          destinyPoolRecord={destinyPoolRecord}
          onSpendDestinyOpen={() => setDestinySpendOpen(true)}
          onSpendCreditsOpen={() => setSpendCreditsOpen(true)}
          onDownloadPDF={handleDownloadPDF}
          onLogout={handleLogout}
          uiTheme={uiTheme}
          onThemeChange={handleThemeChange}
        />
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: only errors complaining that `HudTopBar` does not have `uiTheme`/`onThemeChange` props (fixed in Task 7). No unexpected errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(themes): wire uiTheme state, fetch, and data-theme to PlayerHUDDesktop"
```

---

### Task 7: Wire `HudTopBar`

**Files:**
- Modify: `src/components/player-hud/HudTopBar.tsx`

Add the two new props to the interface and render `ThemeSwitcher` between the Print Sheet button and the Logout button.

- [ ] **Step 1: Import `ThemeSwitcher` and `UiTheme`**

Add to the existing imports at the top of `HudTopBar.tsx`:

```tsx
import { ThemeSwitcher, type UiTheme } from './ThemeSwitcher'
```

- [ ] **Step 2: Add props to the interface**

In the `HudTopBarProps` interface, add after `onLogout`:
```tsx
  uiTheme:       UiTheme
  onThemeChange: (theme: UiTheme) => void
```

- [ ] **Step 3: Destructure the new props**

In the function parameters, add `uiTheme` and `onThemeChange` after `onLogout`:
```tsx
export function HudTopBar({
  character,
  careerName,
  specNames,
  speciesName,
  isCombat,
  combatRound,
  pdfGenerating,
  destinyPoolRecord,
  onSpendDestinyOpen,
  onSpendCreditsOpen,
  onDownloadPDF,
  onLogout,
  uiTheme,
  onThemeChange,
}: HudTopBarProps) {
```

- [ ] **Step 4: Render `ThemeSwitcher` between Print Sheet and Logout**

Replace the existing Print Sheet button block (the block ending at the Logout button) with:

```tsx
      {/* Print Sheet */}
      <button
        onClick={onDownloadPDF}
        disabled={pdfGenerating}
        title="Download printable character sheet PDF"
        style={{
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
          fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: pdfGenerating ? C.textFaint : printHovered ? C.gold : 'var(--hud-accent-60)',
          background: 'transparent',
          border: printHovered && !pdfGenerating ? '1px solid var(--hud-accent-50)' : '1px solid var(--hud-accent-25)',
          borderRadius: 4,
          padding: '3px 9px',
          cursor: pdfGenerating ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'color .15s, border-color .15s',
          flexShrink: 0,
        }}
        onMouseEnter={() => setPrintHovered(true)}
        onMouseLeave={() => setPrintHovered(false)}
      >
        {pdfGenerating ? 'Generating…' : '⬇ Print Sheet'}
      </button>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Theme switcher */}
      <ThemeSwitcher current={uiTheme} onChange={onThemeChange} />
      <div style={{ width: 1, height: 28, background: C.border }} />
      <button
        onClick={onLogout}
        style={{
          fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: logoutHovered ? 'var(--bs-red-sun)' : C.textDim, background: 'transparent',
          border: logoutHovered ? '1px solid var(--bs-red-sun)' : `1px solid ${C.border}`,
          borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
          transition: '.15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
      >⏻ LOGOUT</button>
```

This inserts a divider + `ThemeSwitcher` + divider between the Print Sheet button and Logout.

- [ ] **Step 5: Verify TypeScript compiles with no errors**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: clean (0 errors).

- [ ] **Step 6: Commit**

```bash
git add src/components/player-hud/HudTopBar.tsx
git commit -m "feat(themes): add ThemeSwitcher to HudTopBar"
```

---

### Task 8: Smoke Test

**Prerequisites:** Dev server running (`npx next dev`), Supabase migration applied, at least one character session exists in the database.

- [ ] **Step 1: Start dev server**

Run: `npx next dev`

Wait for `Ready in Xms` message.

- [ ] **Step 2: Open character sheet and verify Binary Sunset default**

Navigate to `/character/<any-id>`. The page should look identical to before this feature was added (warm parchment background, red accent). The TopBar should show three small circular swatches to the right of the Print Sheet button.

Expected: three swatches visible. Active swatch (Binary Sunset) has a gold ring. Background is `#E8DDD0`.

- [ ] **Step 3: Switch to Rebel Operative theme**

Click the middle swatch (dark charcoal / orange ring).

Expected:
- Background immediately darkens to `#141210`
- Accent colour shifts to rebel orange (`#D4681A`)
- Text colour shifts to warm off-white `#B0A490`
- Vital strip darkens to near-black `#180C06`
- Middle swatch gains the active gold ring; other swatches lose it

- [ ] **Step 4: Reload and verify Rebel Operative persists**

Refresh the page (`F5` or browser refresh).

Expected: page loads in Rebel Operative theme. The middle swatch has the active ring. The Supabase `character_sessions` row for this character has `ui_theme = 'operative'`.

Verify in DB: run `select session_key, ui_theme from character_sessions where character_id = '<id>';` in Supabase dashboard.

- [ ] **Step 5: Switch to Kyber Archive theme**

Click the right swatch (dark navy / cyan ring).

Expected:
- Background shifts to `#0C0E1A` (deep indigo)
- Accent shifts to kyber cyan `#5BBCD8`
- Text shifts to cool blue-grey `#B0B8D0`
- Right swatch has active ring

- [ ] **Step 6: Reload and verify Kyber persists**

Refresh the page.

Expected: page loads in Kyber Archive theme.

- [ ] **Step 7: Return to Binary Sunset and verify**

Click the left swatch (warm parchment / red ring).

Expected: page immediately returns to Binary Sunset. `data-theme` attribute is removed from the wrapper div (verify in browser DevTools → inspect the outermost `div` — no `data-theme` attribute).

Reload → Binary Sunset persists.

- [ ] **Step 8: Verify incognito / fresh browser shows Binary Sunset**

Open the character URL in a private/incognito window.

Expected: page loads with Binary Sunset (the default), because no `session_key` is in localStorage for that session.

- [ ] **Step 9: Update architecture doc**

Open `docs/architecture.md`. Add `ThemeSwitcher` to the component list and note that `character_sessions` now carries `ui_theme`.

- [ ] **Step 10: Final commit**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture for theme switcher and ui_theme column"
```
