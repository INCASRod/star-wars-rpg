# GM Screen Rework — Design Spec

**Date:** 2026-05-19  
**Status:** Approved for implementation planning  

---

## Overview

The current GM screen is a god component (`src/app/gm/page.tsx`, ~3 000 lines) with a tab-based layout where Staging is one tab among many. This rework makes Staging the permanent default view and moves all GM controls behind a consistent left-rail navigation pattern. A dedicated GM-only theme (Star Destroyer Slate) ships alongside the layout change.

---

## 1. Layout

### Shell structure

```
┌─ TopBar (38px) ─────────────────────────────────────────────────────────┐
│ HOLOCRON [GM] · Campaign name        [Mode] [Destiny] [← Lobby]        │
├─────┬─────────────────────────────────────────────────────┬─────────────┤
│Rail │  MAP (always background)                            │ Roll Feed   │
│52px │  ┌─ Left panel (slides in) ─────────────────────┐  │ 195px fixed │
│     │  │ Active panel content                         │  │             │
│     │  └──────────────────────────────────────────────┘  │             │
│     │                                                     │             │
└─────┴─────────────────────────────────────────────────────┴─────────────┘
```

- **Map** is always rendered in the background — never replaced by another view
- **Roll Feed** is a permanent right rail, always visible, identical to the player HUD panel (`RollFeedPanel`, `isGm={true}`)
- **Left rail** is a permanent 52px strip — the only top-level navigation

### Left rail buttons

| Button | Accent | Panel width |
|--------|--------|-------------|
| 🗺 Map | Gold | 240px |
| 🔧 Tools | Blue | 260px |
| 👤 Party | Teal | 210px |
| ⚔ Combat | Red | 250px |
| *(divider)* | | |
| 🎲 Dice | — | (existing GmDiceRollerFAB behaviour) |
| 📋 Screen | — | (existing GmReferenceDrawer behaviour) |

- Clicking an active button (or the ✕ in the panel header) dismisses the panel
- Only one panel open at a time
- Combat button is always visible regardless of encounter mode

---

## 2. Map Panel

Opens a **240px left panel** containing all current `StagingFloatingToolbar` controls, reorganised into sections.

### Sections

**Map**
- Map Library (opens map picker)
- Visible to Players toggle (currently "👁 Visible to Players")

**Tokens**
- Add Player Token — places an existing party member's token (current workflow)
- Add Adversary Token — searches the adversary database; placing the token also registers the adversary in the Combat panel
- Add Vehicle Token — searches the vehicle database; placing the token also registers the vehicle in the Combat panel
- Remove All Tokens
- **Pointer Tokens** — three small pill buttons: Green · Red · Orange (the existing coloured pointer tokens)

**Token Scale**
- − / value / + controls (existing behaviour)

**Grid**
- Toggle Grid
- Snap to Grid

### Token flow

Token placement is the single point of entry for the encounter. Searching for and placing an adversary/vehicle token automatically adds it to the Combat panel's live list. Removing the token removes it from Combat. The Combat panel has no manual add/remove controls of its own.

---

## 3. Tools Panel

Opens a **260px left panel** with the existing GM management tabs. The Adversaries and Vehicles tabs change from search/library views to **creation-only** forms.

### Tabs

| Tab | Content |
|-----|---------|
| XP | Existing award flow (group / individual) |
| Credits | Existing award flow |
| Duty/Obl | Existing |
| D&O | Existing |
| Loot | Existing |
| Items | Existing |
| Talents | Existing |
| New Adversary | Creation form (see below) |
| New Vehicle | Creation form (see below) |
| Force | Existing |

### New Adversary form fields
Name · Type (Minion / Rival / Nemesis) · Soak · Wound Threshold · Strain Threshold · Characteristics (Br/Ag/Int/Cun/Wil/Pre) · Skills (comma-separated) · Talents / Abilities · Save to Database button

### New Vehicle form fields
Name · Class · Silhouette · Hull Threshold · System Strain Threshold · Armour · Weapons (summary) · Save to Database button

**Rationale:** Adversary/vehicle search is no longer needed in Tools because the search happens at token-placement time via the Map panel. Tools retains creation so GMs can build new stat blocks during session prep.

---

## 4. Party Panel

Opens a **210px left panel** with a vertically scrolling list of mini character cards.

### Mini card contents (per character)
- Name (truncated if needed)
- Species · Career (small, uppercase)
- Wounds: progress bar + current value + − / + buttons
- Strain: progress bar + current value + − / + buttons
- Soak: small number, right-aligned

Cards with wounds above threshold get a red left border. The selected card (last tapped) gets an accent-coloured border (chrome white in Star Destroyer Slate).

### Click → Character Modal

Clicking a mini card opens a **full-screen modal** centred on the map. The Party panel stays visible behind it, dimmed.

**Modal contents** (using existing `GmCharacterCard` data):
1. Portrait · Name · Species·Career·Specialisation · Player name
2. Dark Side badge (conditional)
3. Wounds: current / threshold + progress bar + W+1 / W−1 buttons
4. Strain: current / threshold + progress bar + S+1 / S−1 buttons
5. Soak value
6. Obligation row (if present): type + ±1 + value
7. Duty row (if present): type + ±1 + value
8. Morality row (if present): value + ±1 + gradient bar + Edit
9. XP · Credits footer line
10. Request Crit Injury Roll button
11. Fallen to the Dark Side / Redemption button (force-sensitive only)
12. Archive button
13. Footer: ✕ Close · Open Full Sheet → (navigates to `/character/[id]?gm=1&campaign=[id]`)

---

## 5. Combat Panel

Opens a **250px left panel** auto-populated from tokens currently on the map. No manual add/remove — all changes flow through the Map panel's token placement.

### Panel header actions

**▶ Start Combat** — always visible. Opens the existing `InitiativeSetupModal` multi-step flow (Cool vs Vigilance selection → PC dice pool rolls → adversary rolls → order preview → Lock & Start). This is the existing setup flow, now surfaced from the Combat panel rather than a FAB or separate tab.

**◉ Initiative Order** — visible only when `encounter.is_active = true`. Opens the Initiative Drawer (see below).

### Encounter Adversaries section

Per adversary row:
- Colour dot · Name · Type + Soak (small)
- W+ / W− buttons
- Status badge: **Alive** (green) / **Hurt** (amber, wounds > half threshold) / **Down** (grey, struck out)

### Encounter Vehicles section

Per vehicle row:
- Vehicle icon · Name · Class · Hull current/threshold · System strain current/threshold
- Status badge: **Active** / **Critical** / **Destroyed**

### Empty state

When no tokens are on the map: "Add tokens via 🗺 Map → Tokens" hint text. No add buttons in this panel.

---

## 5a. Initiative Drawer

A **bottom drawer** that slides up from the bottom edge of the map area when the GM taps "◉ Initiative Order" in the Combat panel. The left rail, Combat panel, and Roll Feed remain visible; only the map is partially obscured by the drawer.

### Contents

- **Round counter** — "Round 3" label, top-left
- **InitiativeStrip** — the existing horizontal strip component showing all slots in turn order: participant avatar/initial, name label, ▲ NOW indicator on the current slot, ✓ badge on acted slots. PCs in blue, adversaries in red (existing colour logic).
- **Advance Turn** button — moves `current_slot_index` forward; auto-wraps to next round when all slots have acted
- **End Combat** button — sets `encounter.is_active = false`, clears the strip
- **✕ Close** — dismisses the drawer without ending combat; state is preserved

### Behaviour

- Drawer is on-demand only — the GM opens it to check order or advance the turn, then closes it to restore full map view
- Does not auto-open when combat starts; GM opens it explicitly
- Coexists with an open Combat panel (both visible simultaneously)

---

## 6. Star Destroyer Slate Theme (GM-only)

Applied automatically to the GM view. Not available in the player `ThemeSwitcher`. Players keep their own theme choice.

### Palette

| Token | Value | Role |
|-------|-------|------|
| `--hud-bg` | `#0A0A0C` | Hull black |
| `--hud-panel` | `#101214` | Primary panel surface |
| `--hud-surface1` | `#171A1E` | Raised surfaces |
| `--hud-surface2` | `#1E2228` | Inputs, cards |
| `--hud-border` | `#2E3540` | Readable border |
| `--hud-border-faint` | `#181D22` | Faint border |
| `--hud-text` | `#C4CDD4` | Crisp cool-white readout text |
| `--hud-text-muted` | `#5E6870` | Muted |
| `--hud-text-faint` | `#2E3640` | Faint |
| `--hud-accent` | `#96A8B4` | Chrome grey — stormtrooper hull plate |
| `--hud-accent-light` | `#C8D8E0` | Near-white — armour catching light |
| `--hud-accent-dark` | `#4A5860` | Dark chrome |
| `--hud-danger` | `#C04040` | Wounds / danger (cooler red) |
| `--hud-ok` | `#3A7868` | Health / success (muted green) |

The "gold" role (secondary UI highlights, XP/credits labels) maps to `--hud-accent` (#96A8B4 chrome) rather than warm gold. Interactive active states use `--hud-accent-light` (#C8D8E0) instead of the player themes' gold.

### Implementation

- Add `[data-theme="star-destroyer-slate"]` block to `globals.css`
- Apply `data-theme="star-destroyer-slate"` on the GM page root element unconditionally — no user toggle
- `UiTheme` type in `ThemeSwitcher.tsx` does **not** include this value (GM-only, not player-selectable)

---

## 7. Component decomposition

The current `src/app/gm/page.tsx` (~3 000 lines) must be split as part of this work. Proposed new components:

| Component | Responsibility |
|-----------|---------------|
| `GmShell` | Top-level layout: rail + map + roll feed + panel slot |
| `GmLeftRail` | 52px rail with button state management |
| `GmMapPanel` | Map controls panel content |
| `GmToolsPanel` | Tools panel with tab routing |
| `GmPartyPanel` | Party mini-card list |
| `GmCombatPanel` | Encounter adversaries + vehicles live view |
| `GmCharacterModal` | Full character card modal (wraps existing `GmCharacterCard`) |
| `GmTokenControls` | Add Player / Adversary / Vehicle token flows |
| `GmInitiativeDrawer` | Bottom drawer wrapping existing `InitiativeStrip` + Advance Turn / End Combat controls |

Existing components retained as-is: `GmMapView`, `StagingTopBar`, `RollFeedPanel`, `GmCharacterCard`, `GmDiceRollerFAB`, `GmReferenceDrawer`, `InitiativeStrip`, `InitiativeSetupModal`.

---

## 8. Out of scope

- Adversary stat-block editing (creation only in this pass)
- Mobile / tablet GM view
- Multiplayer GM (single GM assumed)
