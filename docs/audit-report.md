# Holocron — Codebase Audit Report

> Generated 2026-04-27. Last status check 2026-04-29. Principles audited: YAGNI, SOLID, DRY, KISS.  
> No code was changed — this is a findings-only report.

---

## Severity Key

| Severity | Meaning |
|---|---|
| 🔴 Critical | Actively hurts maintainability; fix next sprint |
| 🟠 High | Significant code bloat or architectural smell |
| 🟡 Medium | Worth addressing in a refactor pass |
| 🟢 Low | Nice-to-have; fix when touching the file anyway |

## Status Key

| Badge | Meaning |
|---|---|
| ✅ Fixed | Fully resolved |
| 🔄 Partial | Meaningful progress; work remains |
| ❌ Open | Not yet addressed |
| ⬆️ Regressed | Condition is now worse than when audited |

---

## YAGNI Violations (You Aren't Gonna Need It)

### ✅ `PlayerHUDDesktop.tsx` — God Component
**Status: Fixed** — Was 2,667 lines. Now **600 lines** (target hit). Extracted into 13 component files and 3 hooks across 3 passes:
- Pass 1 components: `HudDecorations.tsx`, `HudVitalBar.tsx`, `HudTabBar.tsx`, `BuySpecButton.tsx`, `DedicationModal.tsx`
- Pass 1 hooks: `useCriticalInjuryRequest.ts`, `usePlayerBroadcast.ts`, `useCharacterConflicts.ts`
- Pass 2 components: `HudTopBar.tsx`, `HudLeftColumn.tsx`, `HudTalentDrawer.tsx`, `HudAdversaryDrawer.tsx`
- Pass 3 components: `HudTalentTreeModal.tsx`, `HudForcePowerTreeModal.tsx`, `HudSpendCreditsModal.tsx`, `HudSessionTab.tsx`

### ✅ `DEBUG_BOXES = true` in `characterSheetPDF.ts`
**Status: Fixed** — Flag and conditional block removed. No longer present in the file.

### ❌ 179+ inline style objects recreated each render
**Status: Open** — Still widespread. At least 8 components still define inline modal backdrop objects; `fontFamily`/`Rajdhani` strings appear in 133 files.
- **Fix**: Hoist static style objects to module scope (`const ROW_STYLE = { ... }` outside the component)

### 🟡 Unused/dead prop drilling chains
**Status: Open** — Not investigated.
- **Fix**: Identify props that skip levels and either collapse the hierarchy or introduce a context for that narrow domain

---

## SOLID Violations

### ✅ Single Responsibility — `CombatPanel.tsx` (~3,647 lines)
**Status: Fixed** — File deleted. Combat concerns split into 13 focused staging components:
`StagingLayout`, `CombatFeedPanel`, `EncounterAdversaryPanel`, `EncounterVehiclePanel`, `StagingLeftDrawer`, `StagingLeftRail`, `StagingMapPanel`, `StagingRightDrawer`, `StagingRightRail`, `StagingTokenPanel`, `StagingTopBar`, `StagingDrawer`, `StagingFloatingToolbar`. The `gm/combat/page.tsx` route was also deleted.

### ✅ Single Responsibility — `gm/page.tsx`
**Status: Fixed** — Was 3,395 lines / 70 useState. Now **962 lines / 4 useState**. Major extraction completed: each concern is now a dedicated hook or sub-component.

### ⬆️ Dependency Inversion — Direct Supabase calls in components
**Status: Regressed** — Was 28 files. Now **34 files** call `supabase.from(...)` directly in component scope.  
Known offenders: `GroupSheet.tsx`, `ItemDatabaseTab.tsx`, `LootAwardModal.tsx`, `AdversaryEditor.tsx`, `AdversaryLibrary.tsx`, `VehicleEditor.tsx`, `VehicleLibrary.tsx`, `DestinyGeneratePanel.tsx`, `GmDiceRollerFAB.tsx`, `GmMapView.tsx`, `SessionRollSimulator.tsx`, `TalentDatabaseTab.tsx`, `DutyObligationTab.tsx`, `ForceNotificationCard.tsx`, `LootAwardModal.tsx`, `InitiativeRollModal.tsx`, `VendorPurchaseDialog.tsx`, staging panels (`CombatFeedPanel`, `EncounterAdversaryPanel`, `EncounterVehiclePanel`, `StagingFloatingToolbar`, `StagingMapPanel`, `StagingTokenPanel`), `CriticalInjuryModal.tsx`, `CombatCheckOverlay.tsx`, `DestinyRollModal.tsx`, `DestinySpendConfirmModal.tsx`, `ForceCheckOverlay.tsx`, `ForceTargetStep.tsx`, `create/page.tsx`, `gm/mapforge/page.tsx`, `page.tsx`.
- **Fix**: All Supabase access belongs in hooks. Components receive data and callbacks as props only.

### 🔄 Open/Closed — `CombatCheckOverlayProps`
**Status: Partial** — Was 18 flat props. GM-specific fields have been grouped into a `gmOverrides` sub-object (`isGmMode`, `gmTargets`, `gmAlignment`, `gmHiddenFromPlayers`). Interface is still large but now extensible via `gmOverrides`.
- **Remaining fix**: Consider grouping `weaponContext` and `diceContext` sub-objects for the remaining weapon/skill reference maps.

### 🟡 Duplicated state transforms in `PlayerHUDDesktop.tsx`
**Status: Open** — `hudWeapons`, `hudSkills`, `hudGear` are still re-derived in the component via useMemo rather than in `useCharacterData`.
- **Fix**: Move the HUD-display transforms into `useCharacterData` (or a thin `useCharacterHUD` wrapper).

---

## DRY Violations (Don't Repeat Yourself)

### 🔄 `#C8AA50` (gold) declared locally across files
**Status: Partial** — Was ~78 files. Now **17 files**. Significant progress made.
- **Remaining fix**: All remaining files should `import { COLOR } from '@/lib/tokens'` and use `COLOR.gold`. Add an ESLint `no-restricted-syntax` rule banning the literal hex.

### 🔄 Modal backdrop copied across files
**Status: Partial** — `src/components/ui/Modal.tsx` created with a centralized backdrop using tokens. At least **8 components** still contain inline `position: fixed; inset: 0` backdrop patterns (`ForcePowerTree`, `TalentTree`, `GmMapView`, `ItemEditor`, `TalentDatabaseTab`, `VehicleEditor`, `InventoryPanel`, `PlayerHUDDesktop`).
- **Remaining fix**: Migrate those 8 components to use `<Modal>`.

### 🔄 Font strings redefined across files
**Status: Partial** — `fontFamily: "'Rajdhani', sans-serif"` (or `'Rajdhani'` variant) still appears across **89 files** (down from 133).
- **Remaining fix**: Use `FONT` from `@/lib/tokens` everywhere; add a lint rule to ban the literal string.

### 🟠 `ASSET_COLORS` only in `GroupSheet.tsx`
**Status: Open** — Not investigated.
- **Fix**: Extract to `tokens.ts` or a dedicated `assetColors.ts` utility.

### 🟠 5000ms timeout magic number in 9 files
**Status: Open** — Not investigated.
- **Fix**: Define `const FLASH_DURATION_MS = 5000` in `tokens.ts` and import everywhere.

### 🟡 Supabase channel subscription boilerplate
**Status: Open** — Every hook still repeats the same setup/teardown pattern.
- **Fix**: Extract a `useSupabaseChannel(table, filter, handler)` hook.

---

## KISS Violations (Keep It Simple)

### 🔴 Three overlapping OggDude parsers
**Status: Open** — All three still coexist:
- `parseOggDudeMarkup` in `utils.ts` → HTML strings (for `dangerouslySetInnerHTML`)
- `parseDiceText` → typed segment arrays (for `<RichText>`)
- `parseSymbols` in `parseSymbols.ts` → canonical icon-font rendering
- **Fix**: Unify into one canonical parser that produces typed segments. Render to string only for legacy `dangerouslySetInnerHTML` callsites (which should themselves be eliminated).

### ✅ `gm/page.tsx` deeply nested ternaries
**Status: Fixed** — Page reduced to 962 lines / 4 useState. Nested ternary density resolved alongside the extraction work.

### ✅ 50+ useState in `gm/page.tsx` — should be a state machine
**Status: Fixed** — Was 70 useState. Now **4 useState**. Major extraction completed.

### 🟠 Inline `useEffect` data fetching in page components
**Status: Open** — Not investigated since initial audit.
- **Fix**: Migrate all fetching to hooks; remove the in-component useEffect fetches.

### 🔄 `PlayerHUDDesktop.tsx` memoizes too eagerly
**Status: Partial** — Was 16 useMemo. Now **8 useMemo**. Reduced but not profiled.
- **Remaining fix**: Profile which remaining memos are genuinely expensive. Remove memos on simple array maps over small arrays.

---

## File Size — Recommended Splits

| File | Audited Lines | Current Lines | Target | Status |
|---|---|---|---|---|
| `CombatPanel.tsx` | ~3,647 | **deleted** | — | ✅ Fixed — replaced by 13 staging components |
| `gm/page.tsx` | ~3,000+ | **962** | <800 | ✅ Fixed |
| `PlayerHUDDesktop.tsx` | ~2,700 | **600** | <600 | ✅ Fixed |
| `GroupSheet.tsx` | ~1,852 | **1,833** | <600 | ❌ Open |
| `useCharacterData.ts` | ~1,200 | **824** | ~800 | 🔄 Partial |
| `InventoryPanel.tsx` | ~820 | unknown | ~500 | ❌ Open |

---

## Priority Action List

| # | Action | Status |
|---|---|---|
| 1 | **Create `src/components/ui/Modal.tsx`** | ✅ Done |
| 2 | **Global GOLD import** — ESLint rule + codemod across 42 remaining files | ❌ Open |
| 3 | **Split `CombatPanel.tsx`** | ✅ Done — staging components |
| 4 | **Move Supabase calls out of components** — now 30 files | ⬆️ Regressed |
| 5 | **Unify OggDude parsers** | ❌ Open |
| 6 | **`gm/page.tsx` state machine** — `useReducer` for modal flags | ✅ Done — now 4 useState |
| 7 | **Hoist static style objects / migrate remaining components to `<Modal>`** — 20+ still use inline backdrop | 🔄 Partial |
| 8 | **Font string codemod** — ban `'Rajdhani'` literal; use `FONT` from tokens — 89 files remaining | 🔄 Partial |
