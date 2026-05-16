# HUD Panel Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the player HUD three visually distinct horizontal tiers by darkening the TopBar surface slightly, painting the StatusStrip deep red, and strengthening all column borders.

**Architecture:** Pure CSS/style changes — no logic, layout, or data model changes. New CSS custom properties land in `:root` in `globals.css`; components consume them via existing inline-style props. One component (`ForceCheckButton`) needs a text-colour fix because its current near-black colour becomes invisible on the new dark-red strip background.

**Tech Stack:** Next.js / React, TypeScript, CSS custom properties, Tailwind (not used in the changed files — inline styles only)

**Spec:** `docs/superpowers/specs/2026-05-16-hud-panel-clarity-design.md`

---

## File Map

| File | Change |
|---|---|
| `src/app/globals.css` | Add 7 new `--hud-vital-*` vars + `--hud-border-strong`; update `--hud-surface-mid` |
| `src/components/player-hud/HudStatusStrip.tsx` | Background, border, text colours, bar fills, dividers |
| `src/components/player-hud/HudTopBar.tsx` | Border-bottom weight/colour |
| `src/components/player-hud/HudLeftColumn.tsx` | Border-right weight; char-cell tint |
| `src/components/player-hud/HudRightColumn.tsx` | Border-left weight |
| `src/components/character/ForceCheckButton.tsx` | Text colour + border (near-black → force-blue on dark strip) |

---

## Task 1 — Add CSS variables to `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1.1 — Open `globals.css` and locate the HUD Binary Sunset theme block**

  Find the comment `/* ── HUD Binary Sunset Theme */` (around line 227). The existing block ends after `--hud-gold-40`. Add the new variables immediately after the existing HUD block, before the HUD Font Size Aliases comment.

- [ ] **Step 1.2 — Update `--hud-surface-mid`**

  Inside the existing `:root` block, find:
  ```css
  --hud-surface-mid:   var(--bs-card);         /* #CBBAA0                 */
  ```
  Change to:
  ```css
  --hud-surface-mid:   #C8B89A;                /* stepped darker than bs-card; was #CBBAA0 */
  ```

- [ ] **Step 1.3 — Add the new vital-strip and border-strong variables**

  After the line `--hud-gold-40: rgba(200,170,80,0.40);` add:
  ```css
  /* ── HUD vital strip (StatusStrip deep-red zone) ─────────────── */
  --hud-vital-bg:       #6A1A0A;               /* deep red strip background */
  --hud-vital-border:   #4A1006;               /* strip bottom edge */
  --hud-vital-text:     var(--bs-on-red);      /* #FFF0E8 — on-red readable */
  --hud-vital-text-dim: rgba(255,240,232,.65); /* muted labels/controls on strip */
  --hud-vital-sep:      rgba(255,255,255,.2);  /* vertical dividers inside strip */
  --hud-vital-wounds:   #FF7050;              /* wound fill — pops on dark bg */
  --hud-vital-strain:   #FFB060;              /* strain fill — warm amber on dark bg */

  /* ── Stronger structural column edges ────────────────────────── */
  --hud-border-strong:  #9A8068;              /* 2px column borders */
  ```

- [ ] **Step 1.4 — Start the dev server and load the character HUD**

  ```bash
  npm run dev
  ```
  Navigate to `/character/[any-id]`. The TopBar should appear very slightly darker than before (barely noticeable at this stage — the strip change in Task 2 is what makes the full effect visible). No other visual change yet.

- [ ] **Step 1.5 — Commit**

  ```bash
  git add src/app/globals.css
  git commit -m "feat(hud): add vital-strip and border-strong CSS variables"
  ```

---

## Task 2 — Restyle `HudStatusStrip.tsx`

**Files:**
- Modify: `src/components/player-hud/HudStatusStrip.tsx`

This is the most substantial change. All edits are to the four module-level style objects and two inline `background`/`borderBottom` props inside the JSX.

- [ ] **Step 2.1 — Update the four module-level style constants**

  Find these four constants near the top of the file (after the imports, before the component). Replace them entirely:

  ```tsx
  const CTRL_BTN: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--hud-vital-sep)',
    borderRadius: RADIUS.md, width: 20, height: 20,
    cursor: 'pointer', color: 'var(--hud-vital-text-dim)',
    fontFamily: FONT_BODY,
    fontSize: FS.caption,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }

  const LABEL_S: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'var(--hud-vital-text-dim)', whiteSpace: 'nowrap',
  }

  const NUM_S: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontSize: FS.caption,
    color: 'var(--hud-vital-text)', userSelect: 'none',
    minWidth: 32, textAlign: 'center',
  }

  const DIVIDER: React.CSSProperties = {
    width: 1, background: 'var(--hud-vital-sep)', alignSelf: 'stretch', flexShrink: 0,
  }
  ```

- [ ] **Step 2.2 — Update the wrapper div background and border**

  Find the outer wrapper `<div style={{` that starts with `gridColumn: '1 / -1'`. Change the `background` and `borderBottom` props:

  ```tsx
  <div style={{
    gridColumn: '1 / -1',
    background: 'var(--hud-vital-bg)',
    backdropFilter: 'blur(8px)',
    borderBottom: `2px solid var(--hud-vital-border)`,
    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
    padding: '6px var(--space-3)', flexShrink: 0,
    transition: 'background 0.6s, border-color 0.6s',
  }}>
  ```

  Note: the `isCombat` conditional backgrounds are removed — the deep red strip is its own identity and doesn't need a separate combat state. The TopBar already signals combat mode via its own background shift and the COMBAT badge.

- [ ] **Step 2.3 — Update the wounds bar track and fill**

  Find the wounds progress bar (first bar track). Change both `background` values:

  ```tsx
  {/* wounds bar track */}
  <div style={{ width: 56, height: 7, background: 'rgba(0,0,0,.35)', borderRadius: RADIUS.md, overflow: 'hidden', flexShrink: 0 }}>
    <div style={{
      height: '100%', width: `${wPct}%`,
      background: wOver ? 'rgba(255,112,80,.45)' : 'var(--hud-vital-wounds)',
      borderRadius: RADIUS.md, transition: 'width 300ms ease, background 300ms ease',
    }} />
  </div>
  ```

- [ ] **Step 2.4 — Update the strain bar track and fill**

  Find the strain progress bar (second bar track). Change both `background` values:

  ```tsx
  {/* strain bar track */}
  <div style={{ width: 56, height: 7, background: 'rgba(0,0,0,.35)', borderRadius: RADIUS.md, overflow: 'hidden', flexShrink: 0 }}>
    <div style={{
      height: '100%', width: `${sPct}%`,
      background: sOver ? 'rgba(255,176,96,.45)' : 'var(--hud-vital-strain)',
      borderRadius: RADIUS.md, transition: 'width 300ms ease, background 300ms ease',
    }} />
  </div>
  ```

- [ ] **Step 2.5 — Verify in the browser**

  The StatusStrip should now appear as a deep red band below the parchment TopBar. Labels "WOUNDS", "STRAIN" should be legible in muted cream. Values (e.g. `0/12`) should be in brighter cream. The `+`/`−` buttons and their borders should be visible. The two bars should have a dark track with coloured fills.

  If the `EncumbranceBar` text is dark and hard to read against the red strip, note it — but do not fix it in this task (it is out of scope for this plan).

- [ ] **Step 2.6 — Commit**

  ```bash
  git add src/components/player-hud/HudStatusStrip.tsx
  git commit -m "feat(hud): deep-red vital strip for StatusStrip — wounds/strain now high-contrast"
  ```

---

## Task 3 — Strengthen `HudTopBar.tsx` border

**Files:**
- Modify: `src/components/player-hud/HudTopBar.tsx`

- [ ] **Step 3.1 — Update the wrapper border-bottom**

  Find the outer `<div style={{` (the one with `gridColumn: '1 / -1'`). Change the `borderBottom` value:

  ```tsx
  borderBottom: isCombat
    ? '2px solid var(--hud-accent-35)'
    : '2px solid var(--hud-border-strong)',
  ```

  The combat path keeps the accent-red colour but gains weight. The normal path switches to the new strong border.

- [ ] **Step 3.2 — Verify in the browser**

  The line between the TopBar and the StatusStrip (now deep red) should be a clearly visible 2px edge. The TopBar background (`--hud-surface-mid` = `#C8B89A`) should be distinguishable from the page background (`--hud-bg` = `#E8DDD0`) above/behind it.

- [ ] **Step 3.3 — Commit**

  ```bash
  git add src/components/player-hud/HudTopBar.tsx
  git commit -m "feat(hud): strengthen TopBar bottom border to 2px hud-border-strong"
  ```

---

## Task 4 — Strengthen `HudLeftColumn.tsx` border + char-cell tint

**Files:**
- Modify: `src/components/player-hud/HudLeftColumn.tsx`

- [ ] **Step 4.1 — Strengthen the column right border**

  Find the outer column wrapper `<div style={{`. Change `borderRight`:

  ```tsx
  borderRight: '2px solid var(--hud-border-strong)',
  ```

- [ ] **Step 4.2 — Add red tint to characteristic stat cells**

  Find the `.map(ch => (` loop that renders the 3×2 characteristic grid. Each cell `<div key={ch.label} style={{...}}>` currently has:
  ```tsx
  background: 'var(--hud-surface-lo)',
  border: '1px solid var(--hud-border)',
  ```
  Change to:
  ```tsx
  background: 'rgba(224,58,30,0.06)',
  border: '1px solid rgba(224,58,30,0.18)',
  ```

- [ ] **Step 4.3 — Verify in the browser**

  The left column edge should be a clearly visible 2px dark-brown line. The six characteristic cells should have a very faint red tint that groups them visually without overpowering the gold numerals.

- [ ] **Step 4.4 — Commit**

  ```bash
  git add src/components/player-hud/HudLeftColumn.tsx
  git commit -m "feat(hud): strengthen left-column border; add red tint to char-stat cells"
  ```

---

## Task 5 — Strengthen `HudRightColumn.tsx` border

**Files:**
- Modify: `src/components/player-hud/HudRightColumn.tsx`

- [ ] **Step 5.1 — Strengthen the column left border**

  Find the outer column wrapper `<div style={{`. Change `borderLeft`:

  ```tsx
  borderLeft: '2px solid var(--hud-border-strong)',
  ```

- [ ] **Step 5.2 — Verify in the browser**

  The Roll Feed column should now have a matching 2px left edge, consistent with the left column.

- [ ] **Step 5.3 — Commit**

  ```bash
  git add src/components/player-hud/HudRightColumn.tsx
  git commit -m "feat(hud): strengthen right-column border to match left"
  ```

---

## Task 6 — Fix `ForceCheckButton` on the dark strip

**Files:**
- Modify: `src/components/character/ForceCheckButton.tsx`
- Modify: `src/app/globals.css` (forcePulse animation)

**Why:** `ForceCheckButton` uses `color: '#3A0C04'` (near-black dark-red). On the new `--hud-vital-bg` (`#6A1A0A`) strip this is effectively invisible — both are extremely dark. The fix is to use force-blue (`rgba(126,200,227,.9)`) which matches the button's existing glow theme and pops clearly on the dark strip.

- [ ] **Step 6.1 — Update `ForceCheckButton` text and border colours**

  Find the `style` object inside `ForceCheckButton`. Change the `color` and `border` lines:

  ```tsx
  border: `1px solid ${hovered ? 'rgba(126,200,227,.45)' : 'rgba(126,200,227,.22)'}`,
  color: 'rgba(126,200,227,.9)',
  ```

  Leave all other properties (`background`, `borderRadius`, `boxShadow`, etc.) unchanged.

- [ ] **Step 6.2 — Update the `forcePulse` animation in `globals.css`**

  The existing animation pulses a dark border that will be invisible on the new dark strip. Find:
  ```css
  @keyframes forcePulse {
    0%, 100% { border-color: rgba(58,12,4,0.28); }
    50%       { border-color: rgba(58,12,4,0.52); }
  }
  ```
  Replace with:
  ```css
  @keyframes forcePulse {
    0%, 100% { border-color: rgba(126,200,227,.22); }
    50%       { border-color: rgba(126,200,227,.52); box-shadow: 0 0 10px rgba(126,200,227,.18); }
  }
  ```

- [ ] **Step 6.3 — Verify both action buttons in the browser**

  With a Force-sensitive character loaded:
  - **ForceCheckButton** should show "✦ FORCE CHECK" in visible force-blue text, with a blue-tinted border that pulses.
  - **CombatCheckButton** should show "✕ COMBAT CHECK" in `--bs-red-sun` (`#E03A1E`). This is a bright red on a deep red background (~3:1 contrast) — acceptable for a compact action button in a game UI. If it looks too dim, the fallback is to change `.combat-check-btn { color: var(--hud-vital-text); }` in `globals.css`. Only make this change if the button is genuinely hard to read.

- [ ] **Step 6.4 — Commit**

  ```bash
  git add src/components/character/ForceCheckButton.tsx src/app/globals.css
  git commit -m "fix(hud): force-blue text on ForceCheckButton for dark vital strip"
  ```

---

## Acceptance Check

Run through this list in the browser with the character HUD open:

- [ ] TopBar and StatusStrip are visually distinct at a glance
- [ ] The red strip immediately draws the eye to Wounds/Strain
- [ ] Wounds and Strain bars are visible on the dark background
- [ ] Left and right column edges are clearly legible structural lines
- [ ] Characteristic stat cells have a grouped identity inside the left column
- [ ] "Combat Check" button text is readable on the red strip
- [ ] "Force Check" button text is readable on the red strip (Force-sensitive character only)
- [ ] No layout shifts, no missing borders, no broken modals
- [ ] Load the page in combat mode — TopBar gets its accent border, strip stays red
