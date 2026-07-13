# Holocron — Architecture, Routes & Hooks Reference

> Updated 2026-06-29. Read from codebase; update when structure changes.
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
| `/table` | `page.tsx` | Table Display — full-screen map + initiative strip for in-person sessions; reads `?campaign=` query param; no auth gate; opened from GM Map panel |
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

### `useGroupStorage(assetId)`
- Fetches stowed inventory for a single `group_assets` record marked `is_group_storage = true`
- Queries `character_weapons`, `character_armor`, `character_gear` in parallel filtered by `stow_location_id = assetId + equip_state='stowed' + NOT is_dropped`
- Returns: `{ items: GroupStorageItem[], loading: boolean, taking: Set<string>, takeItem }`
- `taking` is a `Set<string>` of item IDs currently being taken (per-item spinner)
- `takeItem(itemId, itemType, takerId, qty?)` → calls `take_group_storage_item` RPC; throws `Error` on failure
- Realtime: subscribes to INSERT/UPDATE/DELETE on all three item tables filtered by `stow_location_id`
- Pass `null` to disable fetching (used to pause when storage sheet is closed)

### `useCampaignPlayers(campaignId)`
- Fetches all players and their characters for a campaign
- Used by GM dashboard to populate initiative and combat panels
- Realtime: subscribes to `players` channel

### `useEncounterState(campaignId)`
- Tracks active encounter: `is_active`, `round`, `current_turn`, `tokens`, `initiative_order`
- Reads/writes `encounters` + `encounter_tokens` tables
- Realtime: subscribes to `encounters` channel
- Used by CombatPanel (GM side) and PlayerHUDDesktop (player side for combat status)

### `useQuartermaster(supabase, campaignId)`
- Owns all Quartermaster state for a campaign
- State: `qm: Quartermaster | null`, `qmItems: QuartermasterItem[]`, `buyRows: QmBuyRow[]`, `loading`
- Exposes: `toggleOpen`, `upsertItem`, `removeItem`, `getQmEntry`, `buyItem`, `sellItem`
- Realtime: subscribes to `quartermaster` (filtered by `campaign_id`) and `quartermaster_items` channels
- Used by `GroupSheet` (player QM button) and `QuartermasterModal` (full buy/sell UI)

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
- Realtime: subscribes to INSERT/UPDATE/DELETE on `map_tokens` (table has `REPLICA IDENTITY FULL` so DELETE filter on `map_id` works correctly for external deletes by `slot_key`)

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
- Fetches: `campaigns`, `characters` (for campaign), `ref_morality`, `character_critical_injuries` (active, full rows)
- State: `campaign`, `setCampaign`, `characters`, `setCharacters`, `activeChars`, `forceNotifications`, etc.
- Returns the `UseGmDataReturn` interface; includes `charCrits: Record<string, CharacterCriticalInjury[]>` and `charActiveCritCounts: Record<string, number>`

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
- Writes to `critical_injury_requests`, `characters` (morality fields), `character_critical_injuries`
- Params include `charCrits`/`setCharCrits` (from `useGmData`) for optimistic pip updates
- Exposes `healCritInjury(injuryId)` — heals an injury by ID, optimistically removes pip, sends player toast

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

### `useEncounterCombatControls({ encounter, saveEncounter, supabase, campaignId, options? })`
- Shared hook encapsulating the five combat adjustment functions previously inlined in `EncounterAdversaryPanel` and `EncounterVehiclePanel`
- Accepts `encounter: CombatEncounter | null`, `saveEncounter`, a Supabase client, `campaignId`, and optional `onDefeat`/`onDisbandSquad` callbacks
- Exposes: `adjustAdversaryWounds`, `adjustAdversaryStrain`, `adjustGroupSize`, `adjustHullTrauma`, `adjustSystemStrain`
- Each function updates the encounter JSONB adversaries/vehicles array via `saveEncounter`, syncs `wound_pct` on `map_tokens`, and (for wounds/hull trauma) inserts defeat/disabled entries to `combat_log`
- No Supabase realtime subscription — stateless computation only

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
- State: `conflicts: ConflictEntry[]` — each entry has `description` (type label), `narrative?`, `session_label`, `is_resolved`, `player_acknowledged?`, `created_at`
- Derived: `pendingConflicts: ConflictEntry[]` — subset where `player_acknowledged === false`, sorted oldest-first; drives the player notification queue
- Returns: `{ conflicts, setConflicts, pendingConflicts }`

### `useGmCampaignConflicts(campaignId, forceSensitiveCharIds)`
- Loads all unresolved (`is_resolved = false`) `character_conflicts` for a set of force-sensitive character IDs
- State: `conflicts: GmConflictRow[]` — each row has `id`, `character_id`, `description`, `narrative?`, `session_label?`, `created_at`
- Realtime: subscribes to INSERT on `character_conflicts` filtered by `campaign_id`; prepends new rows live
- Returns empty array immediately when `forceSensitiveCharIds` is empty (no query fired)
- Called from `GmShell` (lifted from `GmToolsPanel`); reshaped into `Record<string, GmConflictRow[]>` for `GmPartyPanel`
- Returns: `{ conflicts }`

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
- Used by `src/app/character/[id]/page.tsx` to branch between `PlayerHUDDesktop` (≥768px) and `MobileHudLayout` (<768px)

### `useTicker(text, isOpen, delayMs?)`
- Drives the character-scramble "ticker" animation for panel headers
- Exports `TickerChar` type: `{ key: string; display: string; settled: boolean }`
- When `isOpen` flips true: after `delayMs` (default 60ms), reveals chars left-to-right with 28ms stagger; each scramblable char cycles through 4 random glyphs at 35ms before landing
- Spaces and non-alphanumeric chars are never scrambled — they appear immediately at their stagger position with `settled: true`
- When `isOpen` flips false: immediately resets all chars to their final settled values and cancels all pending timeouts
- All timeouts cleaned up on unmount
- Returns: `{ chars: TickerChar[] }`

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
- `character_conflicts` — Force-user morality conflict log; `description` = type label; `narrative` = optional body; `player_acknowledged` = false until player dismisses notification
- `character_sessions` — active session keys (with player's chosen `ui_theme`: 'binary-sunset'|'operative'|'kyber'); cleared on disconnect via `/api/release-session`
- `critical_injury_requests` — GM-initiated requests for crit injury rolls (status: pending/applied)

**Inventory**
- `character_weapons` — equipped state + stow location
- `character_armor` — equipped state + stow location
- `character_gear` — equipped state + stow location + quantity

**Campaign & Group**
- `campaigns` — name, gm_pin, settings JSONB, base_of_operations_name
- `campaign_settings` — single-row config table. `active_dataset TEXT DEFAULT 'oggdude'` controls which reference dataset (OggDude vs reSpec) is active across the app.
- `players` — display_name, is_gm, campaign_id
- `group_assets` — vehicles, starships, safe houses, NPCs, strategic assets. `is_group_storage BOOLEAN DEFAULT false` (migration 081) flags an asset as a shared storage pool visible to players via "View Storage" UI.
- `quartermaster` — One row per campaign. `is_open` controls player access. `sell_pct` is the buy-back rate (default 25%).
- `quartermaster_items` — Items stocked in the QM. `item_key` + `item_type` identify the ref table row (`ref_weapons`, `ref_armor`, `ref_gear`).
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
- `ref_species` — species definitions
- `ref_careers` — composite PK `(key, dataset_source)`. Added `dataset_source TEXT NOT NULL DEFAULT 'oggdude'` and `is_retired BOOLEAN NOT NULL DEFAULT false` in migration 062.
- `ref_specializations` — composite PK `(key, dataset_source)`. Same additions as `ref_careers` (migration 062).
- `ref_talents` — composite PK `(key, dataset_source)`. Same additions as `ref_careers` (migration 062).
- `ref_skills`, `ref_weapons`, `ref_armor`, `ref_gear`
- `ref_force_powers`
- `ref_force_abilities` — composite PK `(key, dataset_source)`. Same additions as `ref_careers` (migration 062).
- `ref_critical_injuries`, `ref_item_attachments`
- `ref_item_descriptors`, `ref_weapon_qualities`
- `ref_obligations`, `ref_duties`, `ref_morality`
- `ref_adversaries`, `ref_vehicles`, `ref_starships`

> **Dropped FK constraints (migration 062):** The following FK constraints were removed when the four ref tables above changed from `key TEXT PRIMARY KEY` to composite `(key, dataset_source)` PKs:
> `character_talents_talent_key_fkey`, `character_specializations_specialization_key_fkey`, `characters_career_key_fkey`, `ref_specializations_career_key_fkey`.

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
  └── PlayerHUDDesktop          (3-row CSS grid: 64px rail · centre · right column)
        ├── HudTopBar           (row 1 — logo, portrait chip, character name, campaign/XP meta)
        ├── HudStatusStrip      (row 2 — wounds ±, strain ±, encumbrance bar, crit pips)
        ├── HudLeftRail         (row 3 left — 64px icon rail; quick action buttons open HudQuickDrawers; nav buttons open HudFullPanels; utility buttons for dice/adversaries)
        ├── HudRightColumn      (row 3 right — full-height RollFeedPanel)
        ├── HudSessionTab       (row 3 centre — map canvas + initiative strip + quick drawers)
        │     ├── HudQuickDrawer (combat/force/skill — 260px, position:absolute, slide from left)
        │     └── InitiativeStrip (compact mode, position:absolute bottom:0)
        └── HudFullPanel (skills/talents/force-panel/inventory/lore/group — 82%, position:absolute, slide from left)

`/character/[id]/page.tsx` (mobile branch — `useIsMobile` < 768px)
  └── `MobileHudLayout`        (full-height flex column — owns all data hooks)
        ├── `MobileRunner`     (full-width even tab distribution — 5 tabs each `flex:1`, no scroll; Feed tab rectangular with accent fill, others get bottom-border active indicator; strip height 48px fixed)
        ├── `MobileIdentityBar`  (portrait img with lazy-load + initials fallback · name · career key · spec key · XP pill · credits pill · destiny pip row; props: `portraitUrl?`)
        ├── `MobileVitalsStrip`  (4-column grid: Wounds/Strain/Soak/Def M·R with 2px progress bars)
        ├── [screen content — flex:1, overflowY:auto]
        │     ├── `MobileFeedScreen`    — wraps RollFeedPanel; default when runner=feed, no nav override
        │     ├── `MobileSkillsScreen`  — read-only skill list with char badges, pip tracks, die pool, → roll taps
        │     ├── `MobileDiceScreen`    — full dice roller; check type bar (Skill/Combat/Force), skill grid with `getSkillPool` auto-calc, 6 pool steppers, pool preview, roll via `rollPool`/`rollForceDice`, result card, fire-and-forget `logRoll`; Combat mode shows 8 skills (Brawl, Melee, Ranged-Light, Ranged-Heavy, Gunnery, Piloting-Planetary, Piloting-Space, Lightsaber) as full-width chips with CharBadge (22px) + colored name + DiceFace die pool; props: `preSelectedSkill`, `hudSkills`, `characterId`, `characterName`, `campaignId`, `forceRating`
        │     ├── `MobileTalentsScreen` — talent quick reference; filter strip (All/Passive/Active/Incidental/OOT), type-coloured left-border cards, OOT→Action→Maneuver→Incidental→Passive sort, expand-in-place description; props: `hudTalents`
        │     ├── `MobileItemsScreen`   — inventory screen; enc bar (blue→red when over threshold), weapons/armor/gear sections, tap row → `MobileBottomSheet` detail; props: `hudWeapons`, `hudArmor`, `hudGear`, `encCurrent`, `encThreshold`, `credits`
        │     ├── `MobileGroupScreen`   — group screen; destiny pool display, character_duty table, alliance standing (contribution_rank + descriptions), imperial threat Phase 3 stub, group_assets expand-in-place with colored type badges (strategic_asset→purple, starship→accent, vehicle→gold, safe_house→green); is_group_storage assets show "📦 Storage" button when expanded → opens `MobileGroupStorageSheet`; props: `campaignId`, `characterId`, `characterName`, `destinyPool`, `supabase`
        │     └── `MobileGroupStorageSheet` — bottom sheet for group storage assets (`expandedHeight="90dvh"`); consumes `useGroupStorage(assetId)` hook; item rows show TYPE_ICON + name + ownerName + stat summary + TAKE button; single items: TAKE→CONFIRM; stackable gear (qty>1): TAKE→qty stepper→CONFIRM; error state per row; props: `assetId`, `assetName`, `isOpen`, `onClose`, `takerId`
        ├── `MobileBottomSheet` — portal slide-up overlay (`createPortal` to `document.body`), two-height collapse/expand via drag handle+chevron button; props: `open`, `onClose`, `children`, `collapsedHeight?` (default `'40dvh'`), `expandedHeight?` (default `'70dvh'`); used by `MobileItemsScreen` for item detail (with descriptions) and `MobileGroupStorageSheet` at 60/90dvh
        └── `MobileBottomNav`  (Skills · Talents · ⬡ FAB · Items · Group; FAB raised top:-7px with glow; `minHeight: 44` on non-FAB buttons — WCAG 2.5.5)

#### Mobile HUD — Phase 2 (2026-06-13)

**New components:**
- `src/components/mobile/MobileBottomSheet.tsx` — portal slide-up overlay (`createPortal` to `document.body`), used by MobileItemsScreen for item detail; props: `open`, `onClose`, `children`, `maxHeight?`
- `src/components/mobile/screens/MobileDiceScreen.tsx` — full dice roller; check type bar (Skill/Combat/Force), skill grid with `getSkillPool` auto-calc, 6 pool steppers, pool preview, roll via `rollPool`/`rollForceDice`, result card, fire-and-forget `logRoll`; props: `preSelectedSkill`, `hudSkills`, `characterId`, `characterName`, `campaignId`, `forceRating`
- `src/components/mobile/screens/MobileTalentsScreen.tsx` — talent quick reference; filter strip (All/Passive/Active/Incidental/OOT), type-coloured left-border cards (activation colour), OOT→Action→Maneuver→Incidental→Passive sort, expand-in-place description; props: `hudTalents`
- `src/components/mobile/screens/MobileItemsScreen.tsx` — inventory screen; enc bar (blue→red when over threshold), weapons/armor/gear sections, tap row → MobileBottomSheet detail; props: `hudWeapons`, `hudArmor`, `hudGear`, `encCurrent`, `encThreshold`, `credits`
- `src/components/mobile/screens/MobileGroupScreen.tsx` — group screen; destiny pool display, character_duty table, alliance standing (contribution_rank + descriptions), imperial threat Phase 3 stub, group_assets expand-in-place; props: `campaignId`, `characterId`, `characterName`, `destinyPool`, `supabase`

**Phase 1 fixes applied:**
- `MobileIdentityBar` — added `portraitUrl?` prop; uses native `<img>` with `loading="lazy"`, falls back to initials
- `MobileRunner` — Feed tab rectangular (no pill), strip height 48px
- `MobileBottomNav` — `minHeight: 44` on non-FAB buttons (WCAG 2.5.5)
- `MobileHudLayout` — destructures `hudTalents/hudWeapons/hudArmor/hudGear` from `useCharacterData`; passes full props to all Phase 2 screens

/gm/page.tsx                    (~3,000+ lines — GOD COMPONENT)
  ├── GmLeftRail                (52px fixed left rail; buttons for map/tools/party/combat; utilities for dice/screen/library)
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
- `InventoryCardPanel` — master/detail inventory card system (left thumbnail grid + right item detail) for weapons, armor, gear with equip/stow/discard controls; composed of `item-thumb`, `item-thumb-grid`, `item-detail-hero`, `item-condition-track`, `item-quality-list`, `item-detail-panel`, and the shared `stow-location-modal` (exports `StowLocationModal` + `StowPill`); wired via `HudInventoryTab` (replaced the former single-file `InventoryPanel`)
- `QuartermasterModal` (`src/components/QuartermasterModal.tsx`) — Player-facing portal modal for buying and selling equipment with the campaign QM. Two tabs: **Buy** (browse stocked items, filter/search, purchase deducts credits + decrements stock) and **Sell** (inventory list, sell at `sell_pct`% of market value via soft-drop pattern). Loads active character via `character_sessions` → `characters` join. Uses `useQuartermaster` hook for all data and operations.
- `SkillsPanel` — skill list with dice pool popover
- `TalentsPanel` — talent tree grid per specialization
- `HudForceTab` — force power tree grid (moved to full panel in `HudLeftRail` as `force-panel`)
- `CriticalInjuriesPanel` — injury tracker
- `CombatPanel` — encounter initiative, token management, dice rolling
- `GroupSheet` — group asset management
- `GmMapView` — interactive token map with read-only stat-block hover tooltips and health bars (hover-only; no click-lock)

### Player HUD Sub-components (`src/components/player-hud/`)
- `HudTopBar` — grid row 1; renders the HOLOCRON logo, a portrait chip (avatar thumbnail), character name, and campaign/XP meta; accent colors use CSS vars (`--hud-accent-*`) rather than rgba literals
- `HudStatusStrip` — grid row 2, `gridColumn: 1 / -1`; full-width strip with Wounds ±, Strain ±, compact `EncumbranceBar`, `CriticalInjuryPips`; combat/force check buttons moved to `HudLeftRail`
- `HudLeftRail` — grid row 3 left (64px fixed); quick action buttons (⌖ Combat, ≋ Force [force-sensitive only], ⬠ Skill) open narrow drawers inside the map area; nav buttons (⚙ Skills, ★ Talents, ✦ Force Panel [force-sensitive only], ▣ Inventory, ✦ Lore, Group [faction image]) open full-width slide-in panels; utility buttons (⬡ Dice, ⊗ Adversaries [red]) below divider; Force and Group buttons use faction images (jedi.webp, rebel.png) with per-theme CSS filters
- `HudFullPanel` — generic slide-in panel wrapper; `position: absolute; width: 82%` inside the centre column div; used for six navigation panels (skills, talents, force-panel, inventory, lore, group); contains a header (symbol + title + close button) and a scrollable body
- `HudRightColumn` — grid row 3 right panel; contains full-height `RollFeedPanel` (Approach A feed layout with Design B cards for top-2 rolls, compact history rows, initiative notifications, system entries); action buttons moved to `HudStatusStrip`
- `HudLoreTab` — lore tab content; `CharacterAvatar` at top with portrait upload/delete support; accepts `onPortraitUpload` and `onPortraitDelete` props; portrait was moved here from `HudLeftColumn`
- `ForcePanel` / `HudForceTab` — Force powers panel with two tabs: **Powers** (power cards + purchase UI) and **Committed** (shows active force die commitments from `characters.force_commitments`; cancel button decrements `force_rating_committed`). `HudForceTab` owns the `handleCancelCommit` write handler.
- `ForceCheckOverlay` (`src/components/force-check/`) — 4-step drawer for Force power checks. Steps: 1 Select Power → 2 Roll Force Dice (includes pip-spending UI + upgrade activation + "Commit Die" for ongoing effects) → 3 Dark Side Pips (skipped for Dathomiri) → 5 Resolve. Step 4 (Select Target) was removed. Committing a die writes to both `characters.force_rating_committed` and `characters.force_commitments`.
- `CombatCheckOverlay` (`src/components/combat-check/CombatCheckOverlay.tsx`) — accordion-layout drawer for combat checks. All visual steps render simultaneously with active/done/locked treatment (opacity, borderLeft highlight, background tint). Internal `currentStep` (1–6) drives logic; visual steps 1–4 reflect multiple internal steps simultaneously. Compact `⌖ Combat Check` + `✕` header strip. Visual step 1 (weapon + target): inline target pills. Visual step 2 (range): range band selection. Visual step 3 (dice pool): `DicePoolReviewStep` emits pool via `onPoolChange → setPoolForRoll`. Visual step 4 (roll): `Roll N Dice` button calls `handleRoll(poolForRoll)` — pool count derived from `poolForRoll` state. Done summaries show `"{weapon} → {target}"` and `"✓ {rangeBand}"`. Dot progress indicator (4 dots) at bottom. All flow logic (`goNext`/`goBack`/`handleRoll`) unchanged from pre-rebuild. `StepContainer` is a local layout atom (number, label, active/done/locked props, optional `doneSummary`).
  - `WeaponSelectStep` (`steps/WeaponSelectStep.tsx`) — compact pill-grid layout; equipped weapons and stowed weapons rendered as inline pills. Stowed-weapon click expands an inline `⚠ Equipping costs a Maneuver` confirmation box (color-mix caution colors). Dual-wield available shown as compact gold `⚔ Dual Wield available` pill. No dice preview in pills.
  - `RangeBandStep` (`steps/RangeBandStep.tsx`) — compact `CompactBandPill` layout replacing full BandCard cards. Accepts optional `targets?: AdversaryInstance[]`. Melee view shows opposed roll box: normal path renders target's Melee → difficulty die icons; fallback path (`isDefault === true` from `getMeleeDifficulty`) shows `⚠` warning with `defaultNote`. Ranged view uses `CompactBandPill` with `atMaxRange`/`beyondMax` visual cues. Auto-selects `'engaged'` via `useEffect` for short-range-only melee weapons.
  - `DicePoolReviewStep` (`steps/DicePoolReviewStep.tsx`) — pool builder with upgrade/downgrade check buttons. `ManualAdjustments` interface includes `challengeAdd: number` (controlled only by upgrade/downgrade buttons, not a manual row). `adjFloors` sets minimum deltas so adjustments cannot remove base difficulty dice. Pool emitted via `useEffect` calling `onPoolChange?.(finalPool)` — replaces former `onRoll` prop. Upgrade button converts difficulty→challenge (or adds challenge); downgrade reverses. Roll button removed from this component — roll is triggered from visual step 4 in `CombatCheckOverlay`.

### GM HUD Sub-components (`src/app/gm/`)
- `GmLeftRail` — 52px fixed left rail; navigation buttons (◉ Tokens/gold [id: 'map'], ⊞ Tools/blue, ◉ Party/teal, Combat with empire.png faction image/red); utility buttons (⬡ Dice/gold, ▦ Screen/gold, ⊟ Library/blue) below divider; uses `FONT_BODY`, `RADIUS`, `Z.fab` from tokens; Combat button uses empire.png faction image with CSS filter chain; the 'map' tab (id: 'map') was renamed to **Tokens** (label: 'Tokens', icon: '◉') in the MapToolsRadial feature — its panel now shows only token management via `GmTokenControls`
- `GmTopBar` — (mentioned in git status) top navigation bar for GM dashboard
- `GmShell` — (mentioned in git status) shell layout wrapper for GM interface
- `GmMapView` — interactive token map with read-only stat-block hover tooltips and health bars (name/type/characteristics/wounds/strain/soak/defense as plain text; `pointerEvents: 'none'` unconditionally, no click-lock/pin mode, no ± combat controls — `useEncounterCombatControls` is not called from this file). `onTokenClick` fires on a genuine tap (not a drag) for the Encounter Deck to focus the corresponding card. `handleRemoveToken` (right-click context-menu remove) does its own minimal, non-optimistic `combat_encounters` write for the initiative-slot cascade-delete.
- `AddConflictModal` (`src/components/gm/AddConflictModal.tsx`) — modal for GM to add morality conflicts to Force-sensitive characters; filters character list to force-sensitive only; inserts to `character_conflicts` table with character_id, campaign_id, description, narrative, session_label, is_resolved, player_acknowledged
- `GmConflictPip` (`src/components/gm/GmConflictPip.tsx`) — read-only 10×10 purple circle pip; wraps `<Tooltip>` with conflict description + session label; used in `GmPartyMiniCard` pip row
- `GmPartyMiniCard` (`src/app/gm/panels/GmPartyMiniCard.tsx`) — compact character card in the GM party panel; pip row between strain bar and soak shows `CriticalInjuryPip` (with heal confirm) and `GmConflictPip` up to 3 each, with `+N` overflow badge
- `ArchivedCharactersModal` (`src/app/gm/panels/ArchivedCharactersModal.tsx`) — portal modal listing archived characters for a campaign; fetches lazily on open; provides **Restore** (calls `restoreCharacter`, invokes `onRestored` so `GmShell` can push the char back into active list) and **Delete permanently** (inline single-click confirm, calls `deleteCharacter`); opened via a "View Archived" footer button in `GmPartyPanel`
- `GmReferenceLibraryPanel` (`src/components/gm/GmReferenceLibraryPanel.tsx`) — searchable read-only reference panel accessed via the ⊟ Library rail button; `'library'` is part of `GmPanelId` and uses the existing left-side slide mechanism at 420px; Talents tab queries `ref_talents` (all rows) on first keystroke and filters client-side by name; Force Powers tab queries `ref_force_powers` + `ref_force_abilities` on first keystroke — matched powers render as purple cards with all their ability rows nested below; abilities matching without a matched parent power render as standalone cards labelled with the parent power name; both tabs show empty state until text is entered
- `MapToolsRadial` (`src/app/gm/MapToolsRadial.tsx`) — floating arc-menu widget rendered in the GM map area when `isStagingTab === true` (injected by `GmMapView`). Three-arc SVG fan (Map Library ◫, Opening Crawl ▶, Token Scale ⊕) fans from puck at 182°–270°. Three.js `WebGLRenderer` renders star field + wireframe terrain + scan-beam animated background. GSAP timelines drive open/close/hover/pick sequences. Three floating popup panels rendered as portals: `MapLibraryContent`, `OpeningCrawlContent`, `TokenScaleContent`. Self-contained: manages its own planet state via `useMapPlanets`, crawl row state, and map CRUD. Props: `campaignId`, `allMaps`, `activeMap`, `onDeleteMap`, `tokenScale`, `adjustTokenScale`. Draggable — drag offset snapshotted once on `mousedown` only; default position is bottom-right of the map area.
- `GmMapPanel` (`src/app/gm/panels/GmMapPanel.tsx`) — left-rail 'Tokens' tab panel (id: `'map'`); since the MapToolsRadial feature, shows **only** token management via `GmTokenControls`; Map Library, Token Scale, and Opening Crawl controls have been moved entirely into `MapToolsRadial`. Props: `campaignId`, `characters`, `tokens`, `addToken`, `removeToken`, `toggleVisibility`, `removeAllTokens`.

### Tier 3 — Atoms & Utilities
- `ThemeInit` (`src/components/ThemeInit.tsx`) — client component (marked 'use client'); calls `initTheme()` on mount; returns null; rendered as first child of `<body>` in root layout to initialize theme on every page load
- `ThemeSwitcher` (`src/components/player-hud/ThemeSwitcher.tsx`) — HUD theme switcher component; exports `UiTheme` type; renders three theme color swatches (Binary Sunset, Rebel Operative, Kyber Archive); accepts `current` theme and `onChange` callback; fully controlled via props
- `RollFeedPanel` (`src/components/player-hud/RollFeedPanel.tsx`) — **Approach A feed layout** with state `expandedIds: Set<string>` for expand/collapse UI. Props: `rolls: RollEntry[]`, `ownCharacterId: string`, `isGm?: boolean`. Layout: top 2 most-recent skill/combat/force rolls render as **Design B cards** (tinted header band with alignment colour at 7% opacity + 15% border, character name, roll type, relative time; card body with large outcome word, result symbols, type-specific extras like damage calc or force pips, and dice pips); older rolls collapse to **compact single-line rows** (4px accent dot, character name, type label, outcome abbr, relative time); clicking a collapsed row expands it as a full card in-place; clicking the header band of an expanded history card collapses it (always-expanded top-2 cards have no collapse affordance). Initiative rolls always render as **compact non-expandable notifications** (one-liner with group count if multiple; grouped within 30-second window). System entries are **compact rows** (gear icon + message or award label); long system messages (>60 chars) get an expand toggle. Players never see hidden rolls; GMs see everything.
- `Modal` (`src/components/ui/Modal.tsx`) — shared portal modal: dark backdrop + blur, ESC key, click-outside dismiss, panel with HUD tokens. Props: `open`, `onClose?`, `maxWidth`, `zIndex`, `borderColor`, `shadow`.
- `QuartermasterModal` (`src/components/QuartermasterModal.tsx`) — player-facing buy/sell shop modal; two tabs: Buy (type-filter pills, search, item rows with stock badges + price, Buy button) and Sell (character inventory rows with offer at `sell_pct`%, Sell button); loads active character via `character_sessions` → `characters`; uses `useQuartermaster` for data + mutations. Props: `campaignId`, `characterName`, `supabase`, `onClose`. Rendered from `GroupSheet` when `showQm` is true.
- `TickerText` (`src/components/ui/TickerText.tsx`) — renders a scramble-ticker animation for a text string; wraps `useTicker`; outputs `.ticker-ready` span containing one `.ticker-char` span per character (unsettled chars get `opacity: 0.5`, `aria-hidden`); includes a `.sr-only` span with the full text for screen readers. Props: `text`, `isOpen`, `delayMs?`, `className?`.
- `RichText` — renders OggDude markup with icon font; accepts optional `style` prop
- `EquipStateButtons` — equipped/carrying/stowed toggle
- `DicePoolDisplay` — characteristic + skill rank → die faces
- `DestinyPoolDisplay` — light/dark pip tracker
- `StowPill` — colored badge for stow location
- `StowLocationModal` — portal modal for picking stow destination
- `SpecSelectorList` — specialization selector with talent tree preview

---

## Contexts (`src/contexts/`)

| File | Purpose |
|---|---|
| `HudPanelContext.tsx` | Provides `{ isOpen: boolean }` to all children of `HudFullPanel`; consumed via `useHudPanelContext()` so section-header components (TickerText wrappers) know when their panel is open |

---

## Stores (`src/store/`)

| File | Purpose |
|---|---|
| `characterSelectStore.ts` | Zustand v5 store holding the selected character from the home screen; persists selection across route navigation so the character is available when the character route mounts |

---

## State Management Pattern

Holocron uses **minimal global state** — Zustand stores for transient UI selections (e.g., selected character). Primary state flows as:

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

**Faction image styling** (`.hud-fi` base class): 18×18px container with per-faction CSS filter chains applied via `.hud-fi-rebel`, `.hud-fi-jedi`, `.hud-fi-empire` classes; theme-specific overrides via `[data-theme="operative"]` and `[data-theme="kyber"]` selectors

**Rail button styling**: `.hud-rail-btn-*` classes for quick/nav/utility buttons; `.hud-rail-btn-adversaries` for red-tinted adversaries button

**Backward-compat shims**: `src/components/player-hud/design-tokens.ts`, `src/components/wireframe/wf-tokens.ts`, and `src/lib/styles.ts` re-export from `tokens.ts`. New code must import directly from `@/lib/tokens`.

---

## Key Utilities (`src/lib/`)

| File | Purpose |
|---|---|
| `types.ts` | All TypeScript interfaces and type aliases |
| `activeDataset.ts` | Exports `fetchActiveDataset(supabase)` and `resetActiveDatasetCache()`. Reads `campaign_settings.active_dataset` with module-level caching; returns `'respec'` as fallback on failure. |
| `supabase/client.ts` | Singleton Supabase browser client |
| `tokens.ts` | Design tokens — colors, fonts, spacing, z-index, radius, shadows |
| `theme.ts` | Theme management: `ThemeId = 'ember' \| 'kyber' \| 'gm-imperial'`; `getTheme()`, `setTheme()`, `initTheme()` functions; persists selection in localStorage (key: `holocron_theme`); sets `data-theme` attribute on `<html>` for CSS targeting. `gm-imperial` is set directly by `GmShell.tsx` on mount (not via ThemeSwitcher) and removed on unmount. |
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
| `characters.ts` | Character fetch helpers: `archiveCharacter`, `restoreCharacter`, `deleteCharacter` |
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
| 054 | `character_conflicts` — `player_acknowledged` (delivery flag) + `narrative` (body text) |
| 055 | Item condition tracking |
| 056 | Roll log update policy |
| 057 | Delete policies |
| 058 | `ref_species.special_abilities` — seed `skill_rank` entries for all 80 species with OggDude SkillModifiers; `ref_talents.modifiers` — add `career_skills` array for 9 fixed ChooseCareerSkills talents (Insight, Basic/Tactical/Vehicle/Pilot Combat Training, Secrets of the Jedi/Force, Well Traveled) |
| 059 | `characters.force_commitments JSONB DEFAULT '[]'` — tracks which powers have Force dice committed; shape `[{ power_key, power_name, effect_name, dice_count }]` |
| 081 | Group Storage: `group_assets.is_group_storage` boolean column + `take_group_storage_item(p_item_id, p_item_type, p_taker_id, p_take_qty)` SECURITY DEFINER RPC for atomic ownership transfer (full + partial-qty gear split) |
| 062 | reSpec dataset migration: added `campaign_settings` table (`active_dataset TEXT DEFAULT 'oggdude'`); changed PKs on `ref_talents`, `ref_force_abilities`, `ref_specializations`, `ref_careers` from `key TEXT PRIMARY KEY` to composite `(key, dataset_source)` with `dataset_source TEXT NOT NULL DEFAULT 'oggdude'` and `is_retired BOOLEAN NOT NULL DEFAULT false`; dropped FK constraints `character_talents_talent_key_fkey`, `character_specializations_specialization_key_fkey`, `characters_career_key_fkey`, `ref_specializations_career_key_fkey` |
