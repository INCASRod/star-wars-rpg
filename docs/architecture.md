# Holocron — Architecture, Routes & Hooks Reference

> Updated 2026-05-15. Read from codebase; update when structure changes.
> For full design token and color reference see **[docs/design-system.md](design-system.md)**.

---

## Route Map (`src/app/`)

| Route | File | Purpose |
|---|---|---|
| `/` | `page.tsx` | Landing / join page |
| `/create` | `page.tsx` | Character creator wizard — reads `?campaign=` query param |
| `/character/[id]` | `page.tsx` | Character sheet (tabbed view) — shell that mounts `PlayerHUDDesktop` |
| `/gm` | `page.tsx` | GM dashboard — reads `?campaign=` query param (~3,000+ lines — GOD COMPONENT) |
| `/gm/mapforge` | `page.tsx` | Map Forge — AI image generate → edit flow for campaign maps |
| `/wireframe` | `page.tsx` | Dev prototype page — UI component showcase, not linked in production |
| `/api/fal` | `route.ts` | POST → fal.ai gpt-image-2 image generation (server-side proxy) |
| `/api/fal-edit` | `route.ts` | POST → fal.ai gpt-image-2 multi-image edit / inpainting |
| `/api/anthropic` | `route.ts` | POST → Anthropic API proxy (keeps `ANTHROPIC_API_KEY` server-side) |
| `/api/release-session` | `route.ts` | POST → deletes `character_sessions` row on player disconnect |

> **Removed routes** (previously documented, now gone):
> `/campaign/[id]`, `/player/[id]`, `/character/[id]/creator`, `/character/[id]/pdf`,
> `/group/[id]`, `/staging/[id]`, `/gm/combat` — all functionality absorbed into `/gm` and `/create`.

---

## Custom Hooks (`src/hooks/`)

### `useCharacterData(characterId)`
**Owner of all character state.** The most important hook.

- Fetches and owns: character, skills, talents, specializations, force abilities, weapons, armor, gear, critical injuries
- Exposes computed stats: `forceRating`, `encumbranceCurrent`, `encumbranceBonus`
- Exposes HUD transforms: `speciesAbilities`, `hudSkills` (`HudSkill[]`), `hudTalents` (`HudTalent[]`), `hudWeapons` (`WpnDisplay[]`), `hudArmor` (`ArmDisplay[]`), `hudGear` (`GearRow[]`)
- Exposes all mutation handlers: `handleSetEquipState`, `handleUpdateCharacter`, `handleAddWeapon`, etc.
- Realtime: Subscribes to `characters`, `character_weapons`, `character_armor`, `character_gear`, `character_skills`, `character_talents`, `character_critical_injuries`
- HUD display types (`HudSkill`, `HudTalent`, `WpnDisplay`, `ArmDisplay`, `GearRow`) live in `src/lib/types.ts`; panel files re-export them for backward compat

### `useGroupAssets(campaignId)`
- Fetches `group_assets` table — vehicles, starships, safe houses, strategic assets, NPCs, other
- Used by GroupSheet, GM dashboard, and PlayerHUDDesktop (for stow locations)
- Realtime: subscribes to `group_assets` channel

### `useCampaignPlayers(campaignId)`
- Fetches all players and their characters for a campaign
- Used by GM dashboard to populate initiative and combat panels
- Realtime: subscribes to `players` channel

### `useEncounterState(campaignId)`
- Tracks active encounter: `is_active`, `round`, `current_turn`, `tokens`, `initiative_order`
- Reads/writes `encounters` + `encounter_tokens` tables
- Realtime: subscribes to `encounters` channel
- Used by CombatPanel (GM side) and PlayerHUDDesktop (player side for combat status)

### `useDestinyPool(campaignId, characterId, characterName, supabase)`
- Owns all Destiny Pool state extracted from `PlayerHUDDesktop`
- State: `destinyPool`, `pendingSpend`, `destinyPoolRecord`, `destinyRollRequest`, `destinySpendOpen`, `destinyGmFlash`, `destinyConsidering`
- Exposes setters for state that the parent component drives externally: `setDestinyRollRequest`, `setDestinySpendOpen`, `setDestinyGmFlash`, `setDestinyConsidering`
- Exposes `handleSpendDestiny(idx)` — two-tap confirm flow, persists to `campaigns.settings.destiny_pool`
- Realtime: subscribes to `campaigns` (postgres_changes), `campaign-events-*` (broadcast), `destiny-pool-player-*` (postgres_changes), `destiny-*` (broadcast)

### `useGmDestinyPool({ campaignId, campaign, characters, sendToChar })`
- GM-side Destiny Pool state extracted from `gm/page.tsx` to fix Single Responsibility violation
- Creates its own Supabase client internally
- State: `destinyPool`, `destinyPoolRecord`, `destinyGenerateOpen`, `manualAdjustOpen`, `gmSpendConfirm`, `manualLight`, `manualDark`, `manualBusy`
- Exposes all setters including `setDestinyPool` and `setDestinyPoolRecord` (needed by the campaign loader and the DestinyGeneratePanel callback)
- Exposes handlers: `handleGmSpendDark`, `handleApplyManual`, `flipDestinyToken`, `addDestinyToken`, `removeDestinyToken`
- Realtime: subscribes to `destiny-pool-gm-*` (postgres_changes on `destiny_pool` table)

### `useSessionMode(campaignId)`
- Tracks the current session mode (`'exploration' | 'combat'`) and round number for the campaign
- State: `mode`, `round`, `transitionPending`, `prevMode`
- Realtime: subscribes to `campaigns` channel to detect mode transitions

### `useSessionRollState(campaignId)`
- Manages session Duty/Obligation roll state from `session_roll_state` table
- State: `duty_roll`, `duty_triggered`, `obligation_roll`, `obligation_triggered`, etc.
- Provides computed bonus: per-character wound threshold bonus from Duty activation

### `useRollFeed(campaignId)`
- Live feed of dice roll results from `roll_log` table for all characters in a campaign
- State: `entries: RollEntry[]` — each entry has pool composition + result symbols
- Realtime: subscribes to INSERT on `roll_log` filtered by `campaign_id`

### `useDerivedStats(input)`
- Computes derived character stats: soak, encumbrance thresholds, wound/strain thresholds, XP spent, force rating
- Input: character + talents + armor + weapons + ref data
- Extracted computation logic; complements `useCharacterData`

### `useMapTokens(campaignId, mapId)`
- Owns `map_tokens` table state for the active combat map
- State: `tokens: MapToken[]`; each token has position, participant type, label, wound pct, visibility
- Realtime: subscribes to INSERT/UPDATE/DELETE on `map_tokens`

### `useActiveMap(campaignId)`
- Loads and subscribes to the active map (`is_active = true`) for a campaign from `maps` table
- State: `activeMap: ActiveMap | null` — includes grid config, image URL, token scale, `planet_id`
- Realtime: subscribes to `maps` channel filtered by `campaign_id`

### `useMapPlanets(campaignId)`
- Owns `map_planets` table state + realtime for a campaign — used to folder-group maps by planet
- State: `planets: MapPlanet[]`; exposes setter for optimistic mutations
- Realtime: handles INSERT/UPDATE/DELETE

### `useStowLocations(campaignId)`
- Loads stowable `group_assets` (vehicles, starships, safe houses) for item stow location UI
- Returns: `{ stowableAssets, baseOfOperationsName }`

### `useGmData(campaignId)`
- **Primary GM data hook** — owns campaign + characters load and common GM reference data
- Fetches: `campaigns`, `characters` (for campaign), `ref_morality`
- State: `campaign`, `setCampaign`, `characters`, `setCharacters`, `activeChars`, `forceNotifications`, etc.
- Returns the `UseGmDataReturn` interface

### `useGmBroadcast(characters)`
- GM → player Supabase broadcast channel management
- Maintains per-character channels keyed by `character_id` (never destroys on re-render to avoid race)
- Exposes: `notify(charId, type, message)`, `sendToChar(charId, payload)`, `broadcastAll(payload, characters)`

### `useGmAwards(campaignId, characters, sendToChar)`
- Owns XP/credits award flow and loot award management
- Reads/writes `loot_awards` table (replaced the old `useLootAwards`)
- State: XP amount, credits amount, award mode, pending/delivered loot awards

### `useGmLoot(campaignId, ...)`
- Owns loot generation and vendor purchase UI state for GM loot panel
- State: `lootType`, search filters, generated item list, vendor offer state
- Fetches from `ref_weapons`, `ref_armor`, `ref_gear` for loot rolling

### `useGmSession(campaignId, ...)`
- Owns combat session state: session mode transition, staging encounter, adversary/vehicle instances
- State: `sessionMode`, `combatRound`, `sessionBusy`, `stagingEncounter`, `stagingInitRoster`, etc.
- Coordinates mode transitions between exploration and combat; triggers encounter creation in Supabase

### `useGmCharacterActions(campaignId, characters, refMorality, sendToChar)`
- GM-side character action handlers: crit injury request dispatch, morality setup, fall/redemption flow
- State: `critReqOpenFor`, `moralitySetup`, `fallRedemptionOpen`, etc.
- Writes to `critical_injury_requests`, `characters` (morality fields)

### `useEncounterData(campaignId)`
- Owns encounter loading and realtime subscription for `combat_encounters`, extracted from `CombatPanel` to satisfy Single Responsibility
- State: `encounter`, `roster`, `groupSizes`
- Exposes all setters so `CombatPanel` handlers can still mutate state directly
- Realtime: subscribes to `combat_encounters` channel filtered by `campaign_id`
- Returns: `{ encounter, setEncounter, roster, setRoster, groupSizes, setGroupSizes }`

### `useAdversaryLibrary()`
- Loads the full adversary roster from `fetchAdversaries()` (OggDude JSON) + `ref_adversaries` (custom DB rows) on mount
- State: `library`, `libSearch`, `libTypeFilter`, `libSourceFilter`, `libLoading`, `libError`
- Derived: `filteredLib` — filtered by type, source, and search query (hides all ~500 OggDude entries unless a search or custom filter is active)
- Returns all state + setters + `filteredLib`; no parameters required
- Extracted from `CombatPanel` to satisfy Single Responsibility

### `useVehicleLibrary()`
- Eager-loads vehicle list from `fetchVehicles()` (OggDude JSON) + `ref_vehicles` (custom DB rows) on mount
- State: `vehicleLibrary`, `vehicleLibLoaded`, `vehicleSearch`, `silhouetteFilter`
- Derived: `filteredVehicleLib` — memoized, filtered by silhouette and search query
- Returns all state + setters + `filteredVehicleLib`; no parameters required
- Extracted from `CombatPanel` to satisfy Single Responsibility; `libraryTab` UI state remains in CombatPanel

### `useCombatParticipants(campaignId)`
- Owns `combat_participants` table state keyed by `character_id`
- State: `combatParticipants: Record<string, CombatParticipantRow>`
- Realtime: subscribes to `combat_participants` channel filtered by `campaign_id`; handles INSERT/UPDATE/DELETE
- Exports the `CombatParticipantRow` interface (moved from `CombatPanel`)
- Returns: `{ combatParticipants, setCombatParticipants }`

### `useCombatLog(encounterId)`
- Owns `combat_log` table state for a single encounter
- State: `entries: CombatLogEntry[]`
- Realtime: initial load filtered by `encounter_id`, then subscribes to INSERT on `combat_log`
- Exports `CombatLogEntry` and `CombatLogAlignment` types (moved from `CombatLog`)
- Returns: `{ entries }`

### `usePendingDamage(campaignId)`
- Owns pending damage state and realtime subscription for the `pending_damage` table
- State: `pendingDamages: PendingDamage[]`, `editedDamages: Record<string, number>`
- Exposes both setters so `CombatPanel` handlers can manipulate state directly
- Realtime: subscribes to INSERT/UPDATE on `pending_damage` filtered by `campaign_id`

### `useAdversaryTokenImages()`
- Loads `adversary_token_images` table once on mount; returns map + setter for optimistic updates
- Returns: `{ tokenImages: Record<string, string>, setTokenImages }`

### `useVehicleTokenImages()`
- Loads `vehicle_token_images` table once on mount; returns map + setter for optimistic updates
- Returns: `{ tokenImages: Record<string, string>, setTokenImages }`

### `useRefWeapons()`
- Loads all `ref_weapons` once on mount, keyed by lowercased name
- Returns: `Record<string, WeaponRef>` — used for quick damage lookups in combat

### `useCharacterPortraits(characterIds)`
- Fetches `portrait_url` for the given character IDs; re-fetches when the ID set changes
- Returns: `Record<string, string>` (character_id → URL)

### `useCharacterSkills(characterIds)`
- Fetches `character_skills` for multiple character IDs in one query
- Returns: `Record<string, CharacterSkill[]>` keyed by `character_id`

### `useEquippedWeapons(characterIds)`
- Fetches equipped `character_weapons` for multiple character IDs
- Returns: `Record<string, CharacterWeapon[]>` keyed by `character_id`

### `useCriticalInjuryRequest(characterId, supabase)`
- Player-side: subscribes to pending `critical_injury_requests` for a character
- State: `pendingCritRequest: CriticalInjuryRequest | null`
- Drives the crit injury roll modal on the player HUD

### `useCharacterConflicts(characterId, supabase)`
- Loads `character_conflicts` for Force-user morality tracking
- State: `conflicts: ConflictEntry[]` — each entry has description, session label, is_resolved

### `usePlayerBroadcast(options)`
- Player-side: subscribes to GM broadcast channels for this character
- Handles: destiny flash, vendor offer, crit injury request, dialog/toast messages
- Callbacks wired from options: `onDestinyRollRequest`, `onVendorOffer`, `onCritRequest`, etc.

### `useForcePowers(characterId, supabase)`
- Loads and structures force power trees for a character from `character_force_abilities`
- Returns tree data consumed by `ForcePowerTree` component

### `useBonusSkillKeys(skillModifiers, talents, refTalentMap, speciesAbilities)`
- Memoized `Set<string>` of skill keys that have bonus dice (boosts or setback removal)
- Computed from talent modifiers and species ability `affected_skills`

### `useIsMobile(breakpoint?)`
- Responsive breakpoint detection via `matchMedia`; defaults to 768px
- Returns: `boolean`

---

## Data Layer

### Supabase Tables (30+ tables, key ones)

**Characters & Skills**
- `characters` — base stat block, XP, credits, backstory
- `character_skills` — per-character skill rank overrides
- `character_talents` — purchased talents with tree position + xp_cost
- `character_specializations` — purchased specs, in purchase order
- `character_force_abilities` — purchased Force power upgrades
- `character_critical_injuries` — tracked injuries
- `character_conflicts` — Force-user morality conflict log (description, session_label, is_resolved)
- `character_sessions` — active session keys (with player's chosen `ui_theme`: 'binary-sunset'|'operative'|'kyber'); cleared on disconnect via `/api/release-session`
- `critical_injury_requests` — GM-initiated requests for crit injury rolls (status: pending/applied)

**Inventory**
- `character_weapons` — equipped state + stow location
- `character_armor` — equipped state + stow location
- `character_gear` — equipped state + stow location + quantity

**Campaign & Group**
- `campaigns` — name, gm_pin, settings JSONB, base_of_operations_name
- `players` — display_name, is_gm, campaign_id
- `group_assets` — vehicles, starships, safe houses, NPCs, strategic assets
- `encounters` — is_active, round, current_turn, initiative_order JSONB
- `encounter_tokens` — slot_key, character_id, adversary_id, vehicle_id, position
- `loot_awards` — items to be distributed to players
- `destiny_pool` (via campaign_settings) — light/dark pip counts
- `session_roll_state` — per-campaign Duty/Obligation roll results for a session
- `pending_damage` — queued damage applications from combat checks

**Maps**
- `maps` — campaign map tiles: image_url, grid config, token_scale, is_active, is_visible_to_players, planet_id
- `map_tokens` — token positions on the active map: x/y, participant_type, wound_pct, is_visible, token_size
- `map_planets` — planet folder groupings for maps; used to organise map library by location

**Reference Data (read-only)**
- `ref_species`, `ref_careers`, `ref_specializations`, `ref_talents`
- `ref_skills`, `ref_weapons`, `ref_armor`, `ref_gear`
- `ref_force_powers`, `ref_force_abilities`
- `ref_critical_injuries`, `ref_item_attachments`
- `ref_item_descriptors`, `ref_weapon_qualities`
- `ref_obligations`, `ref_duties`, `ref_morality`
- `ref_adversaries`, `ref_vehicles`, `ref_starships`

**Combat Reference**
- `combat_encounters` — encounter roster + status (separate from `encounters` initiative tracker)
- `combat_participants` — per-character combat state (wounds, strain, weapon display)
- `combat_log` — timestamped combat event entries for a single encounter
- `adversary_token_images` — custom portrait/token images for adversary entries
- `vehicle_token_images` — custom portrait/token images for vehicle entries
- `custom_talents` — GM-created talents (migration 049)

### Supabase Realtime
Every hook that manages live data opens its own channel. Pattern:
```
supabase.channel(`channel-name-${id}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table_name', filter: `col=eq.${id}` }, handler)
  .subscribe()
```
Cleanup via `useEffect` return → `supabase.removeChannel(channel)`.

### Storage
- Bucket `portraits` — character portrait images (uploaded via `/api/fal` or direct upload)
- Bucket `maps` — campaign map tiles (referenced from `maps.image_url`)

---

## Component Hierarchy

### Tier 1 — Page Shells (route-level)
```
/character/[id]/page.tsx
  └── PlayerHUDDesktop          (3-row CSS grid: 52px rail · centre · right column)
        ├── HudTopBar           (row 1 — logo, portrait chip, character name, campaign/XP meta)
        ├── HudStatusStrip      (row 2 — wounds ±, strain ±, encumbrance bar, crit pips)
        ├── HudLeftRail         (row 3 left — 52px icon rail; quick action buttons open HudQuickDrawers; nav buttons open HudFullPanels)
        ├── HudRightColumn      (row 3 right — full-height RollFeedPanel)
        ├── HudSessionTab       (row 3 centre — map canvas + initiative strip + quick drawers)
        │     ├── HudQuickDrawer (combat/force/skill — 260px, position:absolute, slide from left)
        │     └── InitiativeStrip (compact mode, position:absolute bottom:0)
        └── HudFullPanel (skills/talents/inventory/lore/group — 82%, position:absolute, slide from left)

/gm/page.tsx                    (~3,000+ lines — GOD COMPONENT)
  ├── CombatPanel               (~3,647 lines — GOD COMPONENT)
  ├── GroupSheet                (~1,852 lines)
  ├── ItemDatabaseTab
  ├── DestinyPoolDisplay
  ├── GmMapView                 (token map + encounter controls)
  └── NPC/Vehicle editors

/create/page.tsx
  └── Character creator wizard (inline — no sub-component shell)

/gm/mapforge/page.tsx
  └── Map Forge (inline — generate → edit flow)
```

### Tier 2 — Feature Panels
Each panel is a self-contained component accepting pre-computed display data from the parent:
- `InventoryPanel` — weapons, armor, gear with equip/stow controls
- `SkillsPanel` — skill list with dice pool popover
- `TalentsPanel` — talent tree grid per specialization
- `ForcePanel` — force power tree grid
- `CriticalInjuriesPanel` — injury tracker
- `CombatPanel` — encounter initiative, token management, dice rolling
- `GroupSheet` — group asset management
- `GmMapView` — interactive token map with stat-block hover tooltips and health bars

### Player HUD Sub-components (`src/components/player-hud/`)
- `HudTopBar` — grid row 1; renders the HOLOCRON logo, a portrait chip (avatar thumbnail), character name, and campaign/XP meta; accent colors use CSS vars (`--hud-accent-*`) rather than rgba literals
- `HudStatusStrip` — grid row 2, `gridColumn: 1 / -1`; full-width strip with Wounds ±, Strain ±, compact `EncumbranceBar`, `CriticalInjuryPips`; combat/force check buttons moved to `HudLeftRail`
- `HudLeftRail` — grid row 3 left (52px fixed); quick action buttons (Combat Check, Force Check [force-sensitive only], Skill Check) open narrow drawers inside the map area; nav buttons (Skills, Talents, Inventory, Lore, Group) open full-width slide-in panels over the centre column; no tab bar needed
- `HudFullPanel` — generic slide-in panel wrapper; `position: absolute; width: 82%` inside the centre column div; used for all five navigation panels; contains a header (symbol + title + close button) and a scrollable body
- `HudRightColumn` — grid row 3 right panel; contains full-height `RollFeedPanel` with a Roll Feed header; action buttons moved to `HudStatusStrip`
- `HudLoreTab` — lore tab content; `CharacterAvatar` at top with portrait upload/delete support; accepts `onPortraitUpload` and `onPortraitDelete` props; portrait was moved here from `HudLeftColumn`

### Tier 3 — Atoms & Utilities
- `ThemeInit` (`src/components/ThemeInit.tsx`) — client component (marked 'use client'); calls `initTheme()` on mount; returns null; rendered as first child of `<body>` in root layout to initialize theme on every page load
- `ThemeSwitcher` (`src/components/player-hud/ThemeSwitcher.tsx`) — HUD theme switcher component; exports `UiTheme` type; renders three theme color swatches (Binary Sunset, Rebel Operative, Kyber Archive); accepts `current` theme and `onChange` callback; fully controlled via props
- `Modal` (`src/components/ui/Modal.tsx`) — shared portal modal: dark backdrop + blur, ESC key, click-outside dismiss, panel with HUD tokens. Props: `open`, `onClose?`, `maxWidth`, `zIndex`, `borderColor`, `shadow`.
- `RichText` — renders OggDude markup with icon font; accepts optional `style` prop
- `EquipStateButtons` — equipped/carrying/stowed toggle
- `DicePoolDisplay` — characteristic + skill rank → die faces
- `DestinyPoolDisplay` — light/dark pip tracker
- `StowPill` — colored badge for stow location
- `StowLocationModal` — portal modal for picking stow destination
- `SpecSelectorList` — specialization selector with talent tree preview

---

## State Management Pattern

Holocron has **no global state manager** (no Zustand, Redux, or Context). State flows as:

```
Hook (owns DB + realtime) → Page shell (owns display transforms) → Panel (pure display)
```

1. Hooks fetch from Supabase and expose raw DB rows + computed stats
2. Page shells (`PlayerHUDDesktop`, `gm/page.tsx`) do **all** the mapping into HUD-friendly display objects (`hudWeapons`, `hudSkills`, `hudGear`, etc.) via `useMemo`
3. Panels receive props and render — they call back up for mutations

**Mutation flow**: Panel calls prop callback → Page shell delegates to hook handler → Hook optimistically updates local state + writes to Supabase → Realtime subscription fires on other clients → All clients re-render

---

## Design Token System

**Source of truth**: `src/lib/tokens.ts`
```typescript
import { COLOR, HUD, FS, SP, RADIUS, Z, SHADOW, EASE, CHAR_COLOR, DICE_META, SYM } from '@/lib/tokens'
```

**CSS custom properties**: `src/app/globals.css` defines `--color-gold`, `--font-rajdhani`, etc. using `clamp()` for fluid scaling.

**Theme-aware semantic CSS variables**: New opacity stops for HUD colors enable theme overrides via `[data-theme]` selectors without component changes:
- `--hud-accent-10`, `--hud-accent-20`, `--hud-accent-25`, `--hud-accent-35`, `--hud-accent-40`, `--hud-accent-45`, `--hud-accent-50`, `--hud-accent-60`, `--hud-accent-border`
- `--hud-gold-subtle`, `--hud-gold-border`, `--hud-gold-40`

**Backward-compat shims**: `src/components/player-hud/design-tokens.ts`, `src/components/wireframe/wf-tokens.ts`, and `src/lib/styles.ts` re-export from `tokens.ts`. New code must import directly from `@/lib/tokens`.

---

## Key Utilities (`src/lib/`)

| File | Purpose |
|---|---|
| `types.ts` | All TypeScript interfaces and type aliases |
| `supabase/client.ts` | Singleton Supabase browser client |
| `tokens.ts` | Design tokens — colors, fonts, spacing, z-index, radius, shadows |
| `theme.ts` | Theme management: `ThemeId` type; `getTheme()`, `setTheme()`, `initTheme()` functions; persists selection in localStorage (key: `holocron_theme`); sets `data-theme` attribute on `<html>` for CSS targeting |
| `parseSymbols.ts` | OggDude shortcode `[su]`, `:colon:` → typed segment array; used by `RichText` |
| `utils.ts` | `cn()` class merge, `stripBBCode()` (plain-text extractor), `randomUUID()` |
| `characterSheetPDF.ts` | jsPDF-based character sheet PDF export |
| `derivedStats.ts` | Stat computation helpers (soak, encumbrance, XP, force rating) |
| `combatCheckUtils.ts` | Dice pool assembly, combat check helpers |
| `adversaries.ts` | OggDude adversary JSON types + `fetchAdversaries()` |
| `vehicles.ts` | OggDude vehicle JSON types + `fetchVehicles()` |
| `combat.ts` | `CombatEncounter`, `InitiativeSlot` types + encounter helpers |
| `damageEngine.ts` | Damage calculation: base + modifiers + qualities → final damage |
| `dice.ts` | Dice pool types and roll result types |
| `forceRoll.ts` | Force die roll utilities |
| `forceUtils.ts` | Force rating, Morality helpers |
| `criticalUtils.ts` | Critical injury roll + severity helpers |
| `buildTalentTree.ts` | Constructs talent tree grid from specialization + purchased talents |
| `adversaryAdapter.ts` | Converts OggDude adversary JSON → `AdversaryInstance` |
| `adversary-abilities.ts` | Parses adversary special ability descriptions |
| `adversary-talents.ts` | Maps adversary talent keys to display names |
| `resolve-weapon.ts` | Resolves a character's weapon key → full weapon display data |
| `weaponHandedness.ts` | Brawn-linked weapon handedness overrides |
| `logRoll.ts` | Writes roll results to `roll_log` table |
| `characters.ts` | Character fetch helpers |
| `equipment-icons.ts` | Maps item categories → icon glyphs |
| `dutyObligationUtils.ts` | Duty/Obligation roll + trigger helpers |
| `lightsaberUtils.ts` | Lightsaber crystal bonuses |
| `gmScreenData.ts` | Static GM screen reference tables |
| `styles.ts` | Backward-compat shim re-exporting `tokens.ts` |

---

## Migration History (highlights)

| Migration | Purpose |
|---|---|
| 001–020 | Initial schema, ref data seeding, OggDude XML imports |
| 025 | Minion groups + pending damage table |
| 028 | Critical injury system |
| 029 | Item management: encumbrance, custom items |
| 030 | Destiny pool |
| 031 | Item attachments |
| 032 | Maps table |
| 033 | Map token slot_key |
| 034 | Custom adversaries (`ref_adversaries`) |
| 035 | Map token scale |
| 036 | Vehicles (`ref_vehicles`, encounter vehicle slots) |
| 039 | Group sheet (`group_assets`) |
| 041 | Combat participants weapon display fields |
| 045 | Combat encounter vehicle slots |
| 046 | Vehicle token images + RLS |
| 049 | Custom GM-created talents (`custom_talents`) |
| 050 | Map planets — planet folder grouping for maps |
| 051 | Stow location columns on character item tables |
| 052 | Pointer token cosmetics |
| 053 | UI theme column on character_sessions (for theme switcher) |
