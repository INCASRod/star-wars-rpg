# Character Sheet Layout Redesign + Theming Architecture

**Date:** 2026-05-15  
**Status:** Approved — ready for implementation planning  
**Scope:** Two tightly coupled changes delivered in one PR

---

## 1. Problem Statement

The current character sheet HUD has two UX pain points and one technical debt problem:

1. **Empty right column.** 260–360px is reserved for two buttons (Combat Check, Force Check) and a 3-entry mini roll feed. The rest is dead space.
2. **Skills tab kills the map.** During a session, switching to the Skills tab replaces the map entirely. Players lose spatial context every time they need to build a dice pool.
3. **Inline colour leakage.** ~25% of HUD component styles use hardcoded `rgba(224,58,30,...)` values instead of CSS custom properties, making theme swapping impossible without a full file-by-file audit.

---

## 2. Layout Redesign

### 2.1 Grid Structure

**Current:**
```
gridTemplateColumns: 'clamp(220px,18vw,320px)  1fr  clamp(260px,20vw,360px)'
gridTemplateRows:    'clamp(48px,4vh,64px)  1fr'
```

**New:**
```
gridTemplateColumns: 'clamp(200px,22%,260px)  1fr  clamp(200px,20%,240px)'
gridTemplateRows:    'auto  auto  1fr'
```

The top bar becomes two rows. The left column narrows and changes content. The right column becomes the full roll feed.

---

### 2.2 Top Bar — Row 1 (Identity)

**Component:** `HudTopBar.tsx`

Left to right:
1. `HOLOCRON` logo (unchanged)
2. Vertical divider
3. **Portrait chip** — 30px circle, `objectFit: cover`, gold border, initials fallback
4. Character name + career/spec/species subtitle (unchanged layout)
5. Vertical divider
6. Destiny pool display (unchanged)
7. Vertical divider
8. XP pill + Credits pill (unchanged)
9. Vertical divider
10. Print Sheet button (unchanged)
11. Logout button (unchanged)

**Portrait chip spec:**
- Size: 30–32px circle (`border-radius: 50%`)
- Source: `character.portrait_url` (same field already in `HudTopBar` props via `character`)
- Fallback: first two initials of `character.name`, uppercase — reuse `getInitials()` from `CharacterAvatar.tsx`
- Border: `1.5px solid rgba(200,170,80,0.4)` — matches `GmCharacterCard` pattern
- No hover/edit state — display only

**Props change:** `HudTopBar` already receives the full `character` object, so `portrait_url` is available with no prop changes.

---

### 2.3 Top Bar — Row 2 (Status Strip)

A new `HudStatusStrip` component (extracted from `HudLeftColumn`). Spans all columns (`grid-column: 1 / -1`).

Left to right:
1. **Wounds** label + `−` button + progress bar + `N/M` counter + `+` button
2. Vertical divider
3. **Strain** label + `−` button + progress bar + `N/M` counter + `+` button
4. Vertical divider
5. **ENC** label + bar + `N/M` (read-only, no buttons)
6. Vertical divider
7. **Crits** label + pip dots (existing `CriticalInjuryPips` component)
8. `flex: 1` spacer
9. `⚔ COMBAT CHECK` button (moved from `HudRightColumn`)
10. `✦ FORCE CHECK` button (moved from `HudRightColumn`, force users only)

**Props:** Extract vital-adjust handlers from `HudLeftColumn` props — they move to `HudStatusStrip`. The strip needs:
```ts
character: Character
effectiveStats: EffectiveStats | undefined
woundBonus: number
encumbranceCurrent: number
encumbranceBonus: number
crits: CritPip[]
forceRating: number
isCombat: boolean
onVitalAdjust: (field, delta) => Promise<void>
onHealCrit: (id) => void
onOpenCombatCheck: () => void
onOpenForceCheck: () => void
```

The wound/strain breakdown tooltip (currently in `HudLeftColumn`) moves with the Wounds/Strain controls into `HudStatusStrip`. The portal target is still `document.body`.

---

### 2.4 Left Column — Characteristics + Skills

**Component:** New `HudLeftColumn.tsx` (replaces current version entirely)

Content, top to bottom:
1. **Characteristics strip** — 3×2 grid (Brawn, Agility, Intellect, Cunning, Willpower, Presence). Moved from `HudLeftColumn`; markup unchanged.
2. Horizontal divider
3. **"SKILLS" label**
4. **Scrollable skill list** — moved from `HudSkillsTab`. Shows all skills with dice pool chip row (the coloured square dice). Clicking a skill opens the existing `SkillRollPopover`. Ranked/career skills highlighted. Search/filter input at top (reuse `PanelSearchInput`).

The Skills tab in the center still exists for the full expanded view (with groupings, bonus indicators, etc.) — the left column version is a compact always-visible quick-reference.

**Portrait and avatar upload controls** move to `HudLoreTab` (see §2.6).

---

### 2.5 Center Column — Tabs

**Component:** `HudTabBar.tsx`

Remove `'Feed'` from `allTabs`. Updated tab list:
```ts
const allTabs: TabName[] = ['Session', 'Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Group']
```

Remove `'Feed'` from `TabName` union type. Update `PlayerHUDDesktop` to remove the Feed tab render branch.

The Skills tab remains — it shows the full grouped skill view (combat, general, knowledge). The left column compact view is the always-visible shortcut; the Skills tab is for deliberate browsing.

---

### 2.6 Portrait Moves to Lore Tab

**Component:** `HudLoreTab.tsx`

Add `CharacterAvatar` at the top of the Lore tab content, above the backstory/notes panels. Pass through the existing `onPortraitUpload` and `onPortraitDelete` handlers from `PlayerHUDDesktop`.

`CharacterAvatar` is unchanged — it already handles upload, delete, hover states, and the initials fallback.

---

### 2.7 Right Column — Full Roll Feed

**Component:** `HudRightColumn.tsx`

Replace the current content (Combat Check button + Force Check button + `RollFeedMini`) with the full `RollFeedPanel` component. The action buttons move to `HudStatusStrip` (§2.3).

```tsx
export function HudRightColumn({ rolls, ownCharacterId, isGm }) {
  return (
    <div style={{ /* column container */ }}>
      <div style={{ /* "ROLL FEED" header row with "All ↓" filter toggle */ }}>
        <span>Roll Feed</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <RollFeedPanel rolls={rolls} ownCharacterId={ownCharacterId} isGm={isGm} />
      </div>
    </div>
  )
}
```

`RollFeedPanel` already renders SkillCard, CombatCard, ForceCard, InitiativeGroupCard, SystemCard — no changes to it.

---

## 3. Theming Architecture

This is delivered in the same PR as the layout change. The layout work touches the exact components that have the most hardcoded colour leakage, so the cleanup is natural and scope-contained.

### 3.1 The Problem

HUD components mix three colour reference styles:

| Style | Example | Theme-switchable? |
|---|---|---|
| CSS custom property | `var(--hud-gold)` | ✅ Yes |
| JS constant | `C.gold` (resolves to `#C8AA50`) | ❌ No — baked at build time |
| Hardcoded string | `rgba(224,58,30,0.2)` | ❌ No |

To support skin switching, all colours used in rendered HTML/CSS must resolve through CSS custom properties at runtime. JS constants and hardcoded strings break this.

### 3.2 Target Architecture

**Single source of truth: `globals.css` with `[data-theme]` blocks.**

```css
/* Default theme — Binary Sunset (current look) */
:root,
[data-theme="binary-sunset"] {
  --hud-accent:           224, 58, 30;      /* rgb components only */
  --hud-accent-10:        rgba(224,58,30,0.10);
  --hud-accent-20:        rgba(224,58,30,0.20);
  --hud-accent-35:        rgba(224,58,30,0.35);
  --hud-accent-border:    rgba(224,58,30,0.30);
  --hud-gold:             #C8AA50;
  --hud-gold-subtle:      rgba(200,170,80,0.15);
  --hud-gold-border:      rgba(200,170,80,0.25);
  --hud-surface-lo:       /* existing value */;
  --hud-surface-mid:      /* existing value */;
  --hud-surface-hi:       /* existing value */;
  /* ... all existing --hud-* vars ... */
}

/* Future theme example — Imperial */
[data-theme="imperial"] {
  --hud-accent:           180, 40, 40;
  --hud-accent-10:        rgba(180,40,40,0.10);
  /* ... overrides only — inherits anything not listed ... */
}
```

**Why rgb components for accent?** Some values need arbitrary opacity: `rgba(var(--hud-accent), 0.35)` isn't valid CSS. Instead, pre-bake the common opacity stops as named vars (`--hud-accent-10`, `--hud-accent-20`, `--hud-accent-35`, `--hud-accent-border`). New themes override these vars. This is cleaner than the `rgba(224,58,30,...)` scatter currently in the code.

**JS constants (`C.*` in `tokens.ts`):** These remain for contexts where CSS vars cannot reach:
- Canvas rendering (Pixi.js tokens on the map)
- PDF generation (`characterSheetPDF.ts`)
- `DICE_COLOR` (used directly in canvas draw calls)

For all React component inline styles, migrate from `C.gold` → `'var(--hud-gold)'` and from hardcoded `rgba(224,58,30,...)` → `'var(--hud-accent-20)'` etc.

---

### 3.3 Cleanup Scope (this PR)

Target: all files touched by the layout change. Do not refactor untouched files.

**Files touched by layout + their cleanup:**

| File | Cleanup |
|---|---|
| `HudTopBar.tsx` | Replace all `rgba(224,58,30,...)` literals with `var(--hud-accent-*)` vars |
| `HudStatusStrip.tsx` *(new)* | Write clean from the start — CSS vars only |
| `HudLeftColumn.tsx` *(rewrite)* | Write clean from the start — CSS vars only |
| `HudRightColumn.tsx` *(rewrite)* | Write clean from the start — CSS vars only |
| `HudTabBar.tsx` | Replace hardcoded `rgba` accent literals with vars |
| `globals.css` | Add new semantic vars (`--hud-accent-10/20/35/border`, `--hud-gold-subtle`, `--hud-gold-border`) under `:root` |

**Do not touch** in this PR: `RollFeedPanel`, `SkillsCard`, `CharacteristicsCard`, `HudSessionTab`, etc. — their cleanup belongs in a dedicated CSS audit PR.

---

### 3.4 Theme Switching Infrastructure (stub only — no UI)

Wire the data-theme mechanism now so future work has nothing to plumb.

**`src/lib/theme.ts`** (new file):
```ts
export type ThemeId = 'binary-sunset' // | 'imperial' | 'light' — add as built

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

**`src/app/layout.tsx`** — call `initTheme()` in a client-side effect on app boot. Or inline the attribute via a `<script>` in `<head>` to avoid flash-of-unstyled-theme (FOUT).

**No settings UI in this PR.** The `setTheme()` function exists and can be called from a future settings panel. The only observable effect right now: `<html data-theme="binary-sunset">` is set on load, which matches the existing CSS vars exactly — no visual change.

---

## 4. Files Changed

| File | Change |
|---|---|
| `PlayerHUDDesktop.tsx` | Update grid template rows/cols; wire new components; remove Feed tab branch |
| `HudTopBar.tsx` | Add portrait chip; colour cleanup |
| `HudTabBar.tsx` | Remove `'Feed'` from allTabs + TabName; colour cleanup |
| `HudLeftColumn.tsx` | Full rewrite — characteristics + compact skill list only |
| `HudRightColumn.tsx` | Full rewrite — full RollFeedPanel only |
| `HudStatusStrip.tsx` | **New component** — vitals + crits + action buttons |
| `HudLoreTab.tsx` | Add `CharacterAvatar` at top |
| `CharacterAvatar.tsx` | No changes — reused as-is |
| `RollFeedPanel.tsx` | No changes — reused as-is |
| `src/lib/theme.ts` | **New file** — theme get/set/init |
| `src/app/layout.tsx` | Add `initTheme()` call |
| `src/app/globals.css` | Add semantic accent/gold vars under `:root` |
| `docs/architecture.md` | Update component map |

---

## 5. Out of Scope

- **Visual theme change** — Binary Sunset → new scheme. Separate PR. The infrastructure built here makes it a CSS-only change in `globals.css`.
- **Theme switcher UI** — settings panel / toggle. Separate PR. `setTheme()` is ready to call.
- **Full `C.*` → CSS var migration** across all HUD components. Separate CSS audit PR.
- **Mobile layout** — `MobileSessionCompanion` is unchanged.
- **`RollFeedMini`** — no longer rendered but not deleted (may be useful elsewhere).

---

## 6. Success Criteria

- [ ] Map is visible by default (Session tab) with no tab switch needed to see skills
- [ ] Wounds and Strain adjustable from the status strip without leaving any tab
- [ ] Portrait chip visible in top bar; clicking does nothing (display-only)
- [ ] Portrait upload/delete available in Lore tab
- [ ] Feed tab absent from tab bar; roll history visible in right column at all times
- [ ] `<html data-theme="binary-sunset">` set on page load
- [ ] No `rgba(224,58,30,...)` literals remaining in files listed in §4
- [ ] No visual regression on any other tab (Skills, Talents, Inventory, Force, Lore, Group)
