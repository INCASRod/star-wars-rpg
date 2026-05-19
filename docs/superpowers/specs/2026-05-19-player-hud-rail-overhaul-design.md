# Player HUD Rail Overhaul — Design Spec

## Goal

Replace the existing left column (characteristics grid + quick-skill list) and centre tab bar with a unified narrow left rail that contains all navigation and quick-action buttons. Move the initiative strip from the top of the Session map view to the bottom. Maximise map real estate.

## Architecture

The player HUD layout stays a three-column grid (left rail · centre · right), but the left column shrinks from ~22% to a fixed 52 px wide rail — matching the GM view's `GmLeftRail`. The centre column loses its `TabBar` and gains a layered panel/drawer system overlaid on the map. The right column (roll feed) is unchanged.

All overlays (quick drawers and full panels) are rendered inside the map area container using `position: absolute`, so they never affect layout flow and the map always fills the available space.

## Design Tokens & Constraints

- All colours, font sizes, spacing, z-index, and border-radius must come from `@/lib/tokens`. No inline literals.
- No `onMouseEnter`/`onMouseLeave` style mutation — hover states via CSS classes in `globals.css`.
- Fonts: `FONT_BODY` (`var(--font-body)`) for all labels; `FONT_DISPLAY` for large numerics.
- The `panelBase` spread (backdrop-filter) may be used on drawer/panel surfaces that need blur.

---

## Section 1 — Left Rail

**File:** `src/components/player-hud/HudLeftRail.tsx` (new)

A 52 px wide column, matching `GmLeftRail` aesthetics:
- `background: var(--hud-panel)`, `border-right: 1px solid var(--hud-border-hi)`
- Buttons: 40 × 48 px, icon (16 px unicode symbol) above a 7 px label, `border-radius: RADIUS.md`

### Button groups

**Quick actions** (top group — open narrow drawers):

| Symbol | Label | Colour accent | Condition |
|---|---|---|---|
| `⚔` | Combat Check | `var(--bs-red-pale)` / red tint | Always visible |
| `✦` | Force Check | `var(--hud-accent-purple)` (new token, #9060D0) | Only if `isForceUser === true` |
| `◈` | Skill Check | `var(--hud-gold)` | Always visible |

**Divider** — 30 px wide, 1 px `var(--hud-border-hi)` horizontal rule.

**Navigation** (bottom group — open full panels):

| Symbol | Label |
|---|---|
| `≋` | Skills |
| `◆` | Talents |
| `▣` | Inventory |
| `✧` | Lore |
| `◎` | Group |

Active state: light tinted background + coloured border (quick buttons use their accent colour; nav buttons use `var(--hud-border-hi)` tint). Implemented via CSS `.hud-rail-btn-active` classes, not inline style mutation.

### Props

```ts
interface HudLeftRailProps {
  isForceUser:    boolean
  activePanel:    string | null          // 'combat'|'force'|'skill'|'skills'|'talents'|'inventory'|'lore'|'group'|null
  onPanelToggle:  (id: string) => void
}
```

---

## Section 2 — Quick Drawers

**File:** `src/components/player-hud/HudQuickDrawer.tsx` (new)

A generic wrapper for the three quick-action drawers. Renders `position: absolute; top:0; left:0; bottom:0; width: 260px` inside the map container. Slides in with `translateX(-100%) → translateX(0)` in `0.22s cubic-bezier(0.22,1,0.36,1)`.

Each drawer has:
- A themed header (title + ✕ close button)
- Scrollable body
- A shared semi-transparent backdrop div at z-index 14 (click closes active panel)

### Combat Check drawer

Shows equipped weapons as selectable rows. Selecting a weapon calls `onOpenCombatCheck()` — which opens the existing `CombatCheckOverlay` pre-seeded with the chosen weapon. The drawer closes when the overlay opens.

### Force Check drawer

Shows Force rating pip display (light/dark/empty) + list of purchased Force powers. Selecting a power calls `onOpenForceCheck()` — opens existing `ForceCheckOverlay`. Only rendered when `isForceUser === true` (rail button also hidden).

### Skill Check drawer

Characteristics 3×2 grid (identical markup to current `HudLeftColumn`) + `HudSkillQuickList` (unchanged component). Clicking a skill opens the existing skill popover.

---

## Section 3 — Full Panels

**File:** `src/components/player-hud/HudFullPanel.tsx` (new)

A generic panel wrapper. Renders `position: absolute; top:0; left:0; bottom:0; width: 82%` inside the **centre column** of `PlayerHUDDesktop` (not inside `HudSessionTab`). This keeps all panel props flowing directly from `PlayerHUDDesktop` with no extra drilling through `HudSessionTab`. The centre column div gets `position: relative; overflow: hidden` so absolute children clip correctly.

Same slide animation as quick drawers. `background: var(--hud-surface-lo)`, `border-right: 1px solid var(--hud-border-hi)`, heavy box-shadow. The shared backdrop (also in the centre column) covers `HudSessionTab` at z-index 14.

The five nav buttons each pass their existing tab content into this wrapper unchanged:

| Rail ID | Existing content | Source |
|---|---|---|
| `skills` | `<HudSkillsTab>` | `src/components/player-hud/HudSkillsTab.tsx` |
| `talents` | `<HudTalentsTab>` | `src/components/player-hud/HudTalentsTab.tsx` |
| `inventory` | `<HudInventoryTab>` | `src/components/player-hud/HudInventoryTab.tsx` |
| `lore` | `<HudLoreTab>` | `src/components/player-hud/HudLoreTab.tsx` |
| `group` | `<GroupSheet>` | `src/components/group/GroupSheet.tsx` — duties, group assets, contribution rank, base of operations; content unchanged |

No changes to any of these components. The panel wrapper provides slide-in chrome (header with title + close button, scrollable body).

**Z-index layering** (all within the centre column):
- `HudSessionTab` (map + initiative): natural flow
- Backdrop: `Z.overlay` (100)
- Full panels: `Z.overlay + 1` (101)
- Quick drawers: `Z.overlay + 2` (102)

---

## Section 4 — Session Tab / Map Layout

**File:** `src/components/player-hud/HudSessionTab.tsx` (modify)

### Initiative strip — move to bottom

The `position: absolute; top: 0` initiative bar div moves to `bottom: 0`. The `topOverlayRef` prop on `MapCanvas` is removed and replaced with a `bottomOverlayRef` prop that shifts `stage.y` upward by `overlayH / 2` instead of downward.

Initiative strip avatars: reduce 15% (44 px → 38 px), connector dash 14 × 2 px → 12 × 1 px, strip height `clamp(60px, 10vh, 80px)`.

### Map centering

With the initiative bar at the bottom:
```ts
app.stage.x = cw * (1 - initialScale) / 2
app.stage.y = ch * (1 - initialScale) / 2 - overlayH / 2
```

### Quick drawers rendered inside map area

The quick drawers (Combat Check, Force Check, Skill Check) remain `position: absolute` inside the map area div in `HudSessionTab`. The backdrop for quick drawers is also inside the map area. Props needed: `activeQuickPanel`, `onCloseQuickPanel`, `onOpenCombatCheck`, `onOpenForceCheck`, `onOpenSkillPopover`, and the character/encounter data already available in `HudSessionTab`.

---

## Section 5 — PlayerHUDDesktop wiring

**File:** `src/components/player-hud/PlayerHUDDesktop.tsx` (modify)

### New token

Add to `src/lib/tokens.ts` under `HUD`:
```ts
accentPurple: 'var(--hud-accent-purple)',  // #9060D0 — Force check rail button
```
Add to `globals.css` `:root` and each theme block:
```css
--hud-accent-purple: #9060D0;
```

### State changes

```ts
// Two independent active-panel trackers — quick drawers live in HudSessionTab, full panels in PlayerHUDDesktop
const [activeQuickPanel, setActiveQuickPanel] = useState<'combat' | 'force' | 'skill' | null>(null)
const [activeFullPanel,  setActiveFullPanel]  = useState<'skills' | 'talents' | 'inventory' | 'lore' | 'group' | null>(null)

function handlePanelToggle(id: string) {
  const QUICK = ['combat', 'force', 'skill']
  const FULL  = ['skills', 'talents', 'inventory', 'lore', 'group']
  if (QUICK.includes(id)) {
    setActiveQuickPanel(prev => prev === id ? null : id as typeof prev)
    setActiveFullPanel(null)
  } else if (FULL.includes(id)) {
    setActiveFullPanel(prev => prev === id ? null : id as typeof prev)
    setActiveQuickPanel(null)
  }
}
```

### Layout changes

- Remove `HudLeftColumn` import and usage
- Remove `TabBar` import and usage
- Remove `activeTab` / `setActiveTab` state
- Add `HudLeftRail` in place of the left column
- Grid: `gridTemplateColumns` changes from `clamp(200px,22%,260px) 1fr clamp(200px,20%,240px)` to `52px 1fr clamp(200px,20%,240px)`
- The centre column no longer renders `<TabBar>` or the keyed tab content div
- `HudSessionTab` receives `activePanel` and `onPanelToggle` as props so it can render all drawers/panels inside the map area
- The `onOpenCombatCheck` and `onOpenForceCheck` callbacks (currently wired to `HudStatusStrip`) are now wired through the Combat Check and Force Check drawers respectively
- Remove `onOpenCombatCheck` and `onOpenForceCheck` from `HudStatusStrip` props (those buttons are removed from the status strip)

### isForceUser

```ts
const isForceUser = isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)
```

Already computed — pass to `HudLeftRail`.

---

## Section 6 — HudStatusStrip cleanup

**File:** `src/components/player-hud/HudStatusStrip.tsx` (modify)

Remove the `onOpenCombatCheck` and `onOpenForceCheck` props and the two buttons that call them. Everything else stays.

---

## Section 7 — MapCanvas prop update

**Files:** `src/components/map/MapCanvas.tsx` and `src/components/player-hud/HudSessionTab.tsx` (both modify)

Rename `topOverlayRef` → `bottomOverlayRef` in both files. Update centering formula:
```ts
const overlayH = bottomOverlayRef?.current?.offsetHeight ?? 0
app.stage.x = cw * (1 - initialScale) / 2
app.stage.y = ch * (1 - initialScale) / 2 - overlayH / 2
```
Move the `initiativeBarRef` attachment from the top initiative div to the bottom initiative div in `HudSessionTab`, and pass it as `bottomOverlayRef` to `MapCanvas`.

---

## Section 8 — globals.css additions

New CSS classes for the rail hover/active states and drawer transitions:

```css
.hud-rail-btn:hover { background: rgba(150,168,180,0.08); border-color: rgba(150,168,180,0.2); }
.hud-rail-btn-combat:hover,  .hud-rail-btn-combat.active  { background: rgba(224,58,30,0.12); border-color: rgba(224,58,30,0.35); }
.hud-rail-btn-force:hover,   .hud-rail-btn-force.active   { background: rgba(144,96,208,0.12); border-color: rgba(144,96,208,0.35); }
.hud-rail-btn-skill:hover,   .hud-rail-btn-skill.active   { background: rgba(200,170,80,0.12); border-color: rgba(200,170,80,0.35); }
.hud-rail-btn-nav:hover,     .hud-rail-btn-nav.active     { background: rgba(150,168,180,0.12); border-color: rgba(150,168,180,0.3); }
```

---

## Files Created

- `src/components/player-hud/HudLeftRail.tsx` (new)
- `src/components/player-hud/HudQuickDrawer.tsx` (new)
- `src/components/player-hud/HudFullPanel.tsx` (new)

## Files Modified

- `src/components/player-hud/PlayerHUDDesktop.tsx`
- `src/components/player-hud/HudSessionTab.tsx`
- `src/components/player-hud/HudStatusStrip.tsx`
- `src/components/map/MapCanvas.tsx`
- `src/app/globals.css`
- `src/lib/tokens.ts` (add `HUD.accentPurple`)

## Files Deleted

- `src/components/player-hud/HudLeftColumn.tsx`

---

## Out of Scope

- Changes to `HudSkillsTab`, `HudTalentsTab`, `HudInventoryTab`, `HudLoreTab`, `GroupSheet` — these components are used unchanged inside the full panel wrapper
- Changes to `CombatCheckOverlay` or `ForceCheckOverlay` — they continue to work as full-screen overlays triggered from the drawers
- Mobile / responsive layout
