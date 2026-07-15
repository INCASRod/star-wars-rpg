# Holocron — Architecture, Routes & Hooks Reference

> Updated 2026-07-14. Read from codebase; update when structure changes.
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
| `/table` | `page.tsx` | Table Display — full-screen map + initiative strip for in-person sessions; reads `?campaign=` query param; no auth gate; opened from the ⛶ Table Display arc in `MapToolsRadial` |
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

### `useMapTokens(mapId, options?)`
- Owns `map_tokens` table state for the active combat map
- State: `tokens: MapToken[]`; each token has position, participant type, label, wound pct, visibility
- Realtime: subscribes to INSERT/UPDATE/DELETE on `map_tokens` (table has `REPLICA IDENTITY FULL` so DELETE filter on `map_id` works correctly for external deletes by `slot_key`)
- `options.visibleOnly` (Prompt 11) — player-facing callers only (`PlayerHUDDesktop.tsx`, `/table/page.tsx`). Adds `.eq('is_visible', true)` to the initial fetch and drops/excludes hidden rows in the realtime INSERT/UPDATE handler, so hidden-token data no longer sits resident in the player client's React state (the old pattern fetched every row, hidden included, and only hid it via a client-side `.filter()` after the fact — inspectable in React state/devtools the whole time). This does **not** fully close the gap: `map_tokens` RLS is `USING (true)` (`032_maps.sql`), so Realtime itself still evaluates that permissive policy and could broadcast one hidden-row UPDATE payload in transit before this filters it client-side. Closing that needs an RLS policy change (a migration — out of scope for Prompt 11, flagged for follow-up). GM call sites (`GmMapView.tsx`, `GmShell.tsx`, `StagingLeftRail.tsx`) omit the option and keep seeing every token, hidden included, same as before.

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
- State: `sessionMode`, `combatRound`, `sessionBusy`, `stagingEncounter`, `stagingInitRoster`, `stagingVehicleRoster`, etc.
- Coordinates mode transitions between exploration and combat; triggers encounter creation in Supabase
- `stagingEncounter`/`setStagingEncounter` is the sole canonical `combat_encounters` subscription for the whole GM view (the old `useEncounterData` hook it might have overlapped with was dead code and has been deleted)
- Exposes `markEncounterPending`/`clearEncounterPending` — tracked in a `pendingKeysRef` set of `instanceId:stat` keys with an in-flight debounced write from `useEncounterCombatControls`
- Realtime merge is field-aware: incoming `combat_encounters` rows are staleness-checked against the last-applied `updated_at` (rejects out-of-order echoes), then merged per-instance — any adversary/vehicle instance with a pending key keeps its local (optimistic) version instead of the incoming row's, while everything else (initiative slots, other instances) takes the incoming row
- `beginCombat`, `changeRound`, `stagingLibrary`, `stagingLibraryLoaded`, `loadStagingLibrary` were removed (confirmed zero callers)
- `openStagingCombatModal` builds two parallel rosters from `map_tokens` for the "Begin Combat" flow: `stagingInitRoster` (adversary tokens, `participant_type==='adversary' && token_shape!=='rectangle'`) and `stagingVehicleRoster` (vehicle tokens, same `participant_type` but `token_shape==='rectangle'` — vehicles have no distinct `participant_type`). Adversary instances now carry `AdversaryInstance.alignment` (optional field on `src/lib/adversaries.ts`, threaded through `adversaryToInstance()`'s 3rd param), populated from the map token's stored `alignment` here — this is what lets `InitiativeSetupModal` show a genuine "Friendly NPC"/"Enemy" tag instead of defaulting everyone to enemy. `handleStagingCombatStart` wires `map_tokens.slot_key` for both adversary and vehicle tokens that ended up with a slot. `stagingAddVehicleToEncounter` (incremental single-vehicle mid-combat append) was removed as dead code — it had zero call sites and doesn't fit the batch client-side slot-building `InitiativeSetupModal` uses.
- `InitiativeSetupModal` (`src/components/dm/InitiativeSetupModal.tsx`) — 4-step "Begin Combat"/"Recheck Initiative" modal. Steps 1-3 (skill select, PC rolls, adversary+vehicle rolls) are roll-input UI only; Step 4 is a dnd-kit (`@dnd-kit/core`/`sortable`/`utilities` — first use in the codebase) sortable **board**: each participant is a draggable plate with a live position number, Duplicate (⧉, independently-draggable copy sharing the original's live roll values, no re-roll, badged `×N · Nth Action`) and Bench (✕, moves to a collapsed Reserve drawer) hover actions. Reserve is local/transient state, reset on every modal remount, with its own dnd-kit sortable list and a Restore (↥) action. The board auto-mirrors the roll-driven `sortInitiative()` order (`allSlots`) until the GM's first manual drag/duplicate/bench/restore (`boardTouched` flag), after which it's GM-authoritative; `handleStart` builds `finalSlots` from the live board order (not `allSlots` directly), so benched participants never reach `initiative_slots` and duplicates each get their own slot keyed by a local `boardId` (not any DB id). Role colours: gold=active/position-1, `var(--hud-accent-purple)`=PC, `var(--state-failure)`=enemy NPC, `var(--state-advantage)`=friendly NPC, `HUD.gold`+"VEH"=vehicle (matches `CombatFeedPanel`'s `TypeBadge`). Renders inline within the ambient theme (no theme forcing) — matches `InitiativeStrip`/`CombatFeedPanel`, both of which render inside GmShell's forced `gm-imperial` theme.
- `MapToolsRadial` (`src/app/gm/MapToolsRadial.tsx`) has a 4th arc, "Table Display" — a direct action (no popup panel) that opens `/table?campaign=<id>` in a new tab; restores the `⛶ Table Display` entry point lost when `GmMapPanel`'s Map section was gutted to token-only controls.

### `useGmCharacterActions(campaignId, characters, refMorality, sendToChar)`
- GM-side character action handlers: crit injury request dispatch, morality setup, fall/redemption flow
- State: `critReqOpenFor`, `moralitySetup`, `fallRedemptionOpen`, etc.
- Writes to `critical_injury_requests`, `characters` (morality fields), `character_critical_injuries`
- Params include `charCrits`/`setCharCrits` (from `useGmData`) for optimistic pip updates
- Exposes `healCritInjury(injuryId)` — heals an injury by ID, optimistically removes pip, sends player toast

### `useCombatParticipants(campaignId)`
- Owns `combat_participants` table state keyed by `character_id`
- State: `combatParticipants: Record<string, CombatParticipantRow>`
- Realtime: subscribes to `combat_participants` channel filtered by `campaign_id`; handles INSERT/UPDATE/DELETE
- Exports the `CombatParticipantRow` interface (moved from `CombatPanel`)
- Returns: `{ combatParticipants, setCombatParticipants }`

### `useEncounterCombatControls({ encounter, setEncounter, saveEncounter, supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending, options? })`
- Shared write layer for all Encounter Deck card controls (`EncounterDeck.tsx`) — successor to the five combat adjustment functions previously inlined in the now-deleted `EncounterAdversaryPanel`/`EncounterVehiclePanel`
- Exposes: `adjustAdversaryWounds`, `adjustAdversaryStrain`, `adjustGroupSize`, `adjustHullTrauma`, `adjustSystemStrain`
- Optimistic: every adjustment reads the live value via a synchronous `encounterRef` mirror (updated in plain JS on every local optimistic change, kept in sync with externally-driven `setEncounter` calls via an effect) rather than the closed-over instance or a `setEncounter(prev => ...)` read-trick — this is what fixed the original click-lag bug where two rapid clicks sharing the same stale `adv`/`vehicle` reference would both compute from the same pre-click baseline and lose a delta
- Debounces the actual `combat_encounters` write per `instanceId:stat` key (350ms trailing, via `scheduleWrite`) instead of writing on every click; syncs `map_tokens.wound_pct` via `useMapTokens`'s `updateTokenWoundPct` in parallel with (not sequentially after) the encounter write; inserts defeat/disabled entries to `combat_log` for wounds/hull-trauma crossings
- `markPending`/`clearPending` (passed through from `useGmSession`'s `markEncounterPending`/`clearEncounterPending`) flag which `instanceId:stat` keys have an in-flight debounced write, so `useGmSession`'s realtime merge doesn't let a stale echo clobber a fresher optimistic edit
- Reads/writes the encounter via a synchronous `encounterRef` mirror (not a setState read-trick) so a superseded debounced write is always reliably cancelled, even under a rapid click burst that queues multiple React updates before a re-render — this was the root cause of an earlier known transient stale-value-revert bug, now fixed and live-verified (5+ runs including a 10+-click burst).

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
- `ForceCheckOverlay` (`src/components/force-check/ForceCheckOverlay.tsx`) — single monolithic drawer (all logic/markup inline; a `steps/` subfolder of unused step components — `SelectPowerStep`, `RollForceDiceStep`, `DarkSidePipsStep`, `ForceResolveStep`, `ForceTargetStep` — previously sat alongside it unreferenced and was deleted as dead code) for Force power checks. Linear 3-step flow with a step-rail indicator: ① Power (select a purchased power) → ② Channel (Force die orb + roll animation + FP tally) → ③ Spend (upgrade activation, gated/locked via opacity+pointerEvents until a roll completes; shows an empty-state with Re-roll/Close when a roll yields zero spendable FP). CTA reads "Channel the Force" pre-roll and "Activate Power" post-roll (unchanged pip math / roll dispatch / Supabase writes to `force_notifications`, `combat_log`, `roll_log`). Renders `ForceDescriptionPanel` as a child for the ⓘ info affordance on power cards and upgrade rows.
- `ForceDescriptionPanel` (`src/components/force-check/ForceDescriptionPanel.tsx`) — slide-out panel opened by any ⓘ tap in `ForceCheckOverlay`. Rendered via `createPortal(..., document.body)` (the codebase's standard portal convention — no dedicated portal-root node exists) because `PlayerHUDDesktop`'s root shell (`overflow:hidden`) and center-column div (`overflow:hidden`) both clip anything escaping `.hud-quick-drawer`'s box, and `.hud-quick-drawer`'s own `backdropFilter` makes it a containing block for `position:fixed` descendants too, so `position:fixed` alone (without a portal) is still clipped. Desktop: `position:fixed`, 260px wide, anchored via `getBoundingClientRect()` measured off a `drawerRef` passed from `ForceCheckOverlay` (not a static formula — the rows above the drawer, `HudTopBar`/`HudStatusStrip`, are `auto`-sized with no height token). Mobile (`matchMedia('(max-width: 768px)')`): full-cover `inset:0` overlay sheet. Shows the selected power's base description plus one block per currently-activated non-basic upgrade, rebuilding live as upgrades toggle. `zIndex: Z.backdrop` (400 — the only token between the drawer's raw `z-index:102` and `Z.modal`/410).
- `CombatCheckOverlay` (`src/components/combat-check/CombatCheckOverlay.tsx`) — accordion-layout drawer for combat checks. All visual steps render simultaneously with active/done/locked treatment (opacity, borderLeft highlight, background tint). Internal `currentStep` (1–6) drives logic; visual steps 1–4 reflect multiple internal steps simultaneously. Compact `⌖ Combat Check` + `✕` header strip. Visual step 1 (weapon + target): inline target pills. Visual step 2 (range): range band selection. Visual step 3 (dice pool): `DicePoolReviewStep` emits pool via `onPoolChange → setPoolForRoll`. Visual step 4 (roll): `Roll N Dice` button calls `handleRoll(poolForRoll)` — pool count derived from `poolForRoll` state. Done summaries show `"{weapon} → {target}"` and `"✓ {rangeBand}"`. Dot progress indicator (4 dots) at bottom. All flow logic (`goNext`/`goBack`/`handleRoll`) unchanged from pre-rebuild. `StepContainer` is a local layout atom (number, label, active/done/locked props, optional `doneSummary`).
  - `WeaponSelectStep` (`steps/WeaponSelectStep.tsx`) — compact pill-grid layout; equipped weapons and stowed weapons rendered as inline pills. Stowed-weapon click expands an inline `⚠ Equipping costs a Maneuver` confirmation box (color-mix caution colors). Dual-wield available shown as compact gold `⚔ Dual Wield available` pill. No dice preview in pills.
  - `RangeBandStep` (`steps/RangeBandStep.tsx`) — compact `CompactBandPill` layout replacing full BandCard cards. Accepts optional `targets?: AdversaryInstance[]`. Melee view shows opposed roll box: normal path renders target's Melee → difficulty die icons; fallback path (`isDefault === true` from `getMeleeDifficulty`) shows `⚠` warning with `defaultNote`. Ranged view uses `CompactBandPill` with `atMaxRange`/`beyondMax` visual cues. Auto-selects `'engaged'` via `useEffect` for short-range-only melee weapons.
  - `DicePoolReviewStep` (`steps/DicePoolReviewStep.tsx`) — pool builder with upgrade/downgrade check buttons. `ManualAdjustments` interface includes `challengeAdd: number` (controlled only by upgrade/downgrade buttons, not a manual row). `adjFloors` sets minimum deltas so adjustments cannot remove base difficulty dice. Pool emitted via `useEffect` calling `onPoolChange?.(finalPool)` — replaces former `onRoll` prop. Upgrade button converts difficulty→challenge (or adds challenge); downgrade reverses. Roll button removed from this component — roll is triggered from visual step 4 in `CombatCheckOverlay`.

### GM HUD Sub-components (`src/app/gm/`)
- `GmLeftRail` — 52px fixed left rail; navigation buttons (◉ Tokens/gold [id: 'map'], ⊞ Tools/blue, ◉ Party/teal, Combat with empire.png faction image/red); utility buttons (⬡ Dice/gold, ▦ Screen/gold, ⊟ Library/blue) below divider; uses `FONT_BODY`, `RADIUS`, `Z.fab` from tokens; Combat button uses empire.png faction image with CSS filter chain; the 'map' tab (id: 'map') was renamed to **Tokens** (label: 'Tokens', icon: '◉') in the MapToolsRadial feature — its panel now shows only token management via `GmTokenControls`
- `GmTopBar` — (mentioned in git status) top navigation bar for GM dashboard
- `GmShell` — (mentioned in git status) shell layout wrapper for GM interface
- `GmMapView` — interactive token map. Hover tooltip (`TokenTooltip`, PC-only since Prompt 11 — NPC/vehicle tooltips were removed entirely, since the Encounter Deck's cards and the dossier already surface that information; PC content/styling/behavior is unchanged from before Prompt 11: name/type/characteristics/wounds/strain/soak/defense as plain text, `pointerEvents: 'none'`, no click-lock/pin mode, no ± combat controls — `useEncounterCombatControls` is not called from this file). `onTokenClick` fires on a genuine tap (not a drag) for the Encounter Deck to focus the corresponding card. `handleRemoveToken` (right-click context-menu remove) does its own minimal, non-optimistic `combat_encounters` write for the initiative-slot cascade-delete. There is no `onOpenCombatCheck` prop or combat-check state owned here — Prompt 9 replaced the old weapon+target hand-off to `CombatCheckOverlay` with `CheckConsole`'s inline roller (see `CheckConsole` below); `CombatCheckOverlay` itself is untouched and still mounted by `PlayerHUDDesktop.tsx` for PC-side checks.
- `AddConflictModal` (`src/components/gm/AddConflictModal.tsx`) — modal for GM to add morality conflicts to Force-sensitive characters; filters character list to force-sensitive only; inserts to `character_conflicts` table with character_id, campaign_id, description, narrative, session_label, is_resolved, player_acknowledged
- `GmConflictPip` (`src/components/gm/GmConflictPip.tsx`) — read-only 10×10 purple circle pip; wraps `<Tooltip>` with conflict description + session label; used in `GmPartyMiniCard` pip row
- `GmPartyMiniCard` (`src/app/gm/panels/GmPartyMiniCard.tsx`) — compact character card in the GM party panel; pip row between strain bar and soak shows `CriticalInjuryPip` (with heal confirm) and `GmConflictPip` up to 3 each, with `+N` overflow badge
- `ArchivedCharactersModal` (`src/app/gm/panels/ArchivedCharactersModal.tsx`) — portal modal listing archived characters for a campaign; fetches lazily on open; provides **Restore** (calls `restoreCharacter`, invokes `onRestored` so `GmShell` can push the char back into active list) and **Delete permanently** (inline single-click confirm, calls `deleteCharacter`); opened via a "View Archived" footer button in `GmPartyPanel`
- `GmReferenceLibraryPanel` (`src/components/gm/GmReferenceLibraryPanel.tsx`) — searchable read-only reference panel accessed via the ⊟ Library rail button; `'library'` is part of `GmPanelId` and uses the existing left-side slide mechanism at 420px; Talents tab queries `ref_talents` (all rows) on first keystroke and filters client-side by name; Force Powers tab queries `ref_force_powers` + `ref_force_abilities` on first keystroke — matched powers render as purple cards with all their ability rows nested below; abilities matching without a matched parent power render as standalone cards labelled with the parent power name; both tabs show empty state until text is entered
- `MapToolsRadial` (`src/app/gm/MapToolsRadial.tsx`) — floating arc-menu widget rendered in the GM map area when `isStagingTab === true` (injected by `GmMapView`). Four-arc SVG fan (Map Library ◫, Opening Crawl ▶, Token Scale ⊕, Table Display ⛶) fans from puck at 178°–272°. Three.js `WebGLRenderer` renders star field + wireframe terrain + scan-beam animated background. GSAP timelines drive open/close/hover/pick sequences. Map Library/Opening Crawl/Token Scale open floating popup panels as portals (`MapLibraryContent`, `OpeningCrawlContent`, `TokenScaleContent`); Table Display is a direct action — `window.open('/table?campaign=' + campaignId, '_blank')`, no panel — restoring the pre-radial "⛶ Table Display" button that was dropped from `GmMapPanel` when Map Library/Scale/Crawl moved into this widget. Self-contained: manages its own planet state via `useMapPlanets`, crawl row state, and map CRUD. Props: `campaignId`, `allMaps`, `activeMap`, `onDeleteMap`, `tokenScale`, `adjustTokenScale`. Draggable — drag offset snapshotted once on `mousedown` only; default position is bottom-right of the map area.
- `GmMapPanel` (`src/app/gm/panels/GmMapPanel.tsx`) — left-rail 'Tokens' tab panel (id: `'map'`); since the MapToolsRadial feature, shows **only** token management via `GmTokenControls`; Map Library, Token Scale, and Opening Crawl controls have been moved entirely into `MapToolsRadial`. Props: `campaignId`, `characters`, `tokens`, `addToken`, `removeToken`, `toggleVisibility`, `removeAllTokens`.
- `EncounterDeck` (`src/components/gm/EncounterDeck.tsx`) — pull-up card drawer docked to the bottom of the GM map panel; replaces the deleted Enemies tab (`EncounterAdversaryPanel`/`EncounterVehiclePanel`) and the map's former locked-tooltip combat controls. `buildRoster` and the `RosterEntry` interface are exported (previously module-private) so `EncounterDossier.tsx` can re-derive the same roster; `RosterEntry` carries an added `tokenId: string | null` field (the resolved `map_tokens.id` for the entity's slot, or null off-map) populated in `buildRoster`. **Prompt 12 — map-scoped roster**: `buildRoster(encounter, tokens, advImages, vehImages, activeMapId)` gained a required `activeMapId` param and now filters `encounter.adversaries`/`.vehicles` to `a.map_id === activeMapId` before building entries (both call sites — this file's own render and `EncounterDossier.tsx`'s re-derivation — already had `activeMapId` in scope as an existing prop). Previously the roster was campaign/session-scoped (JSONB on one `combat_encounters` row) while `map_tokens` was already map-scoped, so switching maps hid a map's tokens but left its *cards* visible everywhere — this was the mismatch fixed here. `AdversaryInstance`/`VehicleInstance` (`src/lib/adversaries.ts`/`src/lib/vehicles.ts`) each gained an optional `map_id?: string | null` field — the authoritative map association for BOTH on-map and off-map/benched entries (benching only deletes the `map_tokens` row via `removeToken`, never touches this field, so it needed no code change to "survive" benching). `RosterEntry` also gained `mapId: string | null` (mirrors `entity.map_id`), used by `deployEntry` as the redeploy target instead of whatever map happens to be currently active (they should always agree in practice — deploy only happens from within that map's own already-filtered deck view — but this is explicit rather than assumed, with `activeMapId` as a defensive fallback only). Every add path stamps `instance.map_id` at creation time: this file's `handleAddAdversary`/`handleAddVehicle`, `useGmSession.ts`'s `stagingAddToEncounter`/`stagingAddVehicleToEncounter` (the off-map-add strip's path), and `GmTokenControls.tsx`'s own independent `handleAddAdversaryToken`/`handleAddVehicleToken` (the "Tokens" rail tab has a *third*, parallel add-to-roster code path that also writes directly to `combat_encounters.adversaries`/`.vehicles` — found via full audit, not obvious from the deck alone). The collapsed handle's live enemy/friendly count badges (see below) are derived from a *local* `adversaries`/`vehicles` filter by `map_id === activeMapId` too, added for the same reason — without it the badge (sourced from `initiative_slots`, which has no map concept) would show a stale count disagreeing with the actual map-filtered cards once expanded. Migration `087_combat_encounter_roster_map_id.sql` is comment-only/documentation — `adversaries`/`vehicles` are JSONB arrays with no fixed per-element schema, so there is no column to `ALTER`; `map_id` is purely an application-level field. No backfill: confirmed via live DB audit that the only active `combat_encounters` row had an empty roster at the time, and historical (`is_active = false`) rows are never read as "the current roster" by any code path. Live-verified via Playwright + read-only DB checks against campaign "Legacy of Rebellion": add on Map A → switch to Map B (card and count badge both correctly absent) → switch back to A (both reappear) → bench (token gone, `map_id` preserved) → switch away and back (benched card still A-only) → deploy (token lands on the entry's own stored map) → remove (cleanup). `benchEntry`, `deployEntry`, `removeEntry`, `toggleHiddenEntry` are also exported standalone async functions (hoisted out of the component's `handleBench`/`handleDeploy`/`handleRemove`/`handleToggleHidden` closures, parameterized by an `opts` object of whatever they used to close over) — `EncounterDeck`'s own handlers are now thin `useCallback` wrappers around these, and `GmMapView.tsx` calls the same exported functions directly for `EncounterDossier`'s `onBenchDeploy`/`onRemove` props, so the cascade-delete/bench semantics exist in exactly one place. A `position:absolute` (never `fixed`) child rendered as a sibling of `MapToolsRadial` inside `GmMapView`'s map-area div when `isStagingTab === true`, confined by that div's `overflow:hidden`. Feature-complete end-to-end: full roster/library rail plus the add / off-map-add / bench / deploy / remove / hidden lifecycle, all wired to live Supabase writes (no stub state remaining). Collapsed state is a centered handle bar (`Z.deck`) showing live enemy/friendly counts as red/green badges — enemy/friendly split for adversaries is derived from `encounter.initiative_slots[].alignment` (matched by `adversaryInstanceId`; `AdversaryInstance` itself has no `alignment` field), while `VehicleInstance.alignment` is read directly; both counts are first filtered to `map_id === activeMapId` (Prompt 12) so they never disagree with the map-filtered cards. Expanded body (`Z.deckExpanded`) is GSAP height-tweened (0 ↔ 236px, `power3.out`/`power2.in`) rather than `display`-toggled, and calls `onMapAreaResize?.()` in `onComplete`. Body has a search input toggling between two views: when empty, a horizontally-scrolling **roster rail** of `EntityCard`s built by module-level `buildRoster(encounter, tokens, advImages, vehImages, activeMapId)` (also derives adversary alignment via the same `initiative_slots` lookup — not a nonexistent `AdversaryInstance.alignment` — so it works for off-map entities too, which have a slot but no `map_tokens` row); when non-empty, `AdversaryLibrary`/`VehicleLibrary` (each with `onAddToken` wired to `handleAddAdversary`/`handleAddVehicle`, which call `adversaryToInstance(adv, groupSize)`/`vehicleToVehicleInstance(v, alignment, tokenImageUrl)` — 2-arg `adversaryToInstance` only, no alignment param — and auto-number repeat adds via `nextAutoName`; both spawn the new `map_tokens` row at `spawnPosition(tokens.filter(t => t.map_id === activeMapId).length)` rather than a hardcoded `(0.5, 0.5)` — every add used to land exactly on top of whatever was already there, so only the topmost-in-render-order token was ever visible, and since the `map_tokens` SELECT has no `ORDER BY`, GM and player sessions could independently land on a *different* topmost token, looking like "GM can't see it but the player can." `spawnPosition` (module-private, also used by `deployEntry`, which gained a `tokens` param for the same reason) spreads successive spawns via a golden-angle spiral around centre — no fixed pattern table needed), plus a slim **Off-map** strip (`flex: '0 0 6rem'`, visually secondary to the two full library columns; self-fetched via `fetchAdversaries()`, OggDude adversaries only, not custom homebrew — a disclosed scope limitation) — a single shared ⚔/🤝 toggle sets the default alignment for the strip, and each row is one compact `+` button (no per-row alignment split) via `handleAddOffMap` → `stagingAddToEncounter` (adversary-only; that hook has no vehicle overload). `EntityCard` renders a chamfered card with image/initial, OFF-MAP/HIDDEN/GRP badges, an HP/hull bar, a wound-or-hull stepper, a conditional strain stepper (nemesis adversaries and all vehicles), a conditional group-size stepper (minions), and a Bench-or-Deploy / Hidden-toggle / Remove icon row — wired respectively to `handleBench` (removes the token only, card stays with an OFF-MAP badge), `handleDeploy` (re-adds a token for an existing off-map entity's slot), `handleToggleHidden` (thin wrapper over `toggleVisibility`, unchanged), and `handleRemove` (cascade-deletes the adversary/vehicle instance, its `initiative_slots` entry, and its `map_tokens` row). `activeMapId: string | null` is a **required** prop (review fix — a `tokens[0]?.map_id` fallback previously risked writing `map_tokens` rows with `map_id: ''`); `handleAddAdversary`/`handleAddVehicle`/`handleDeploy` all early-return with a `console.warn` if `activeMapId` is null when they fire. **Wiring**: `GmShell.tsx` owns `deckOpen`/`focusedEntityId` state and passes `useGmSession`'s live `setStagingEncounter`/`saveStagingEncounter`/`markEncounterPending`/`clearEncounterPending`/`stagingAddToEncounter` down through `GmMapView` into `EncounterDeck` — all props are real, end-to-end wired Supabase writes (the earlier temporary stub-mount with no-op setters is gone). Clicking a token on the map (`GmMapView`'s `onTokenClick`, fired on a genuine tap and not a drag) opens the deck and sets `focusedEntityId` so the matching `EntityCard` highlights (gold border + glow); clicking an `EntityCard` itself (or a map token) opens `EncounterDossier` — see below. The roster/library rail's scrollable container reserves a static `paddingRight: '19rem'` gutter so cards never render underneath `MapToolsRadial`'s default bottom-right 300px-wide footprint (a fixed reservation, not radial-position-tracking — `MapToolsRadial` itself is untouched). `onMapAreaResize` fires `GmMapView`'s `handleMapAreaResize`, which increments a `recentreSignal` counter state passed to `MapCanvas` — this makes `MapCanvas` re-run `rebuildMap()` (recentring/rescaling the map image and grid to the current canvas size) once the deck's GSAP open/close animation completes, since the existing `ResizeObserver` in `MapCanvas` only resizes the Pixi renderer and never recentres the map content.
- `EncounterDossier` (`src/components/gm/EncounterDossier.tsx`) — expanded "card" view for a single adversary/vehicle instance, opened by clicking an `EncounterDeck` `EntityCard` or a map token (both existing click paths already forward a `DOMRect` of the clicked element). Mounted as a `position:absolute` sibling of `EncounterDeck` inside `GmMapView`'s map-area div (same `overflow:hidden` containment). Re-derives its own roster via the now-exported `buildRoster`/`RosterEntry` from `EncounterDeck.tsx` rather than receiving a `RosterEntry` prop (it's a sibling, not a child of `EncounterDeck`) — `entry = roster.find(r => r.instanceId === entityId)`. Props: `entityId`/`sourceRect` (null = closed, both lifted to `GmShell.tsx` as `dossierEntityId`/`dossierSourceRect`), `encounter`/`setEncounter`/`saveEncounter`/`supabase`/`campaignId`/`tokens`/`updateTokenWoundPct`/`markPending`/`clearPending`/`characters` (threaded through for the stats/check-console columns still to come), `onClose`, `onToggleVisibility`, `onBenchDeploy`, `onRemove` (the latter two dispatch to `EncounterDeck`'s exported `benchEntry`/`deployEntry`/`removeEntry` from `GmMapView.tsx`, not reimplemented). **Open/close animation**: a manual FLIP (not GSAP's `Flip.fit`) — `Flip.fit`'s `toEl` argument is resolved via `ElementState`, which calls `toEl.getBoundingClientRect()`/reads `toEl.parentNode` internally, so it requires a live DOM element or a captured `Flip.FlipState`, not a plain `DOMRect`; passing the click-captured `sourceRect` fails both the TS signature and at runtime. Instead: a `useLayoutEffect` sets `xPercent:-50, yPercent:-50` via `gsap.set` (so GSAP owns the full `transform`, not a raw CSS `translate(-50%,-50%)` string it would otherwise clobber), measures the panel's natural resting `getBoundingClientRect()`, computes the position/scale delta against `sourceRect`, and runs `gsap.fromTo` on `x`/`y`/`scaleX`/`scaleY`/`opacity` — `useLayoutEffect` (not `useEffect`) so the transform is applied before the first paint (no one-frame flash at the resting layout). Close mirrors the same delta math via `gsap.to`, `onComplete` calling `onClose()` + unmounting. Hero column (portrait or initial fallback, name, type badge, reveal/hide via `entry.tokenId` + `onToggleVisibility`, bench/deploy, remove) is complete. Stats column is complete: instantiates its own `useEncounterCombatControls({ encounter, setEncounter, saveEncounter, supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending })` call (a second call site alongside `EncounterDeck.tsx`'s — both share the same lifted `encounter`/`setEncounter` from `useGmSession`, so external sync stays correct; each hook instance owns its own `debounceTimers` map, so the accepted residual risk is two rapid clicks for the *same* instance+stat landing in the same 350ms debounce window across *both* surfaces at once — realistically unreachable since the dossier is a modal overlay in front of the deck rail). Renders: a 6-box Characteristics grid (`adv.characteristics`); a Group Size stepper (minions only) calling `adjustGroupSize`, reading `adv.groupRemaining` directly (already the live alive-count, not re-derived); a Vitals row of two `VitalStepper`s (Wounds/Hull Trauma always; Strain/Sys Strain for nemesis-with-`strainThreshold`/vehicles, else a static "AS WOUNDS" placeholder) calling `adjustAdversaryWounds`/`adjustAdversaryStrain`/`adjustHullTrauma`/`adjustSystemStrain`; a Defenses/Vehicle Profile `Derived`-stat row (Soak/M Def/R Def, or Silhouette/Speed/Handling/Armor); a Weapons/Armament list normalizing `AdversaryWeapon` (`w.name`/`w.damage`/`w.crit` — **not** `w.critical`, confirmed against `src/lib/adversaries.ts`) and `VehicleWeapon` (no direct name/damage/crit fields — resolved via `vehicleWeaponStats(w.weaponKey)`/`vehicleWeaponDisplayName(w.weaponKey)` from `src/lib/vehicles.ts`, the same helpers `VehicleDetailPanel.tsx` uses) into one shared row shape, each with an `⌖ ATTACK` button that now drives `EncounterDossier`'s own `const [attackWeaponSignal, setAttackWeaponSignal] = useState<number | null>(null)` (bumped with the clicked weapon's index) in addition to still calling the optional `onAttackWeapon?: (weaponIndex: number) => void` prop (no-op if unset; Task 6 wires full weapon pre-selection); an Abilities list (`adv.abilities`/`veh.abilities ?? []`). Check-console column mounts `CheckConsole` (see below) in place of the former `#dossier-check-slot` placeholder, passed `entry`/`campaignId`/`roster`/`attackWeaponSignal` — `roster` is the same array this component already builds via `buildRoster` above, threaded down so `CheckConsole`'s vehicle Combat Check tab can populate its crew picker (Prompt 10); `CombatCheckOverlay` is no longer reachable from this file at all (Prompt 9 replaced the weapon+target hand-off entirely with an inline roller — see `CheckConsole` below), so there is no `onOpenCombatCheck` prop or combat-check state owned here anymore. `SHADOW.dossier` (`src/lib/tokens.ts`, backed by `--shadow-dossier` in `src/styles/holo-tokens.css`) and `.dossier-ctl-btn`/`.dossier-ctl-danger`/`.dossier-sec-label`/`.dossier-step-btn`/`.dossier-attack-btn` hover/focus CSS classes (`src/app/globals.css`) were added for the dossier shell in an earlier task.
- `CheckConsole` (`src/components/gm/CheckConsole.tsx`) — the check-console column mounted by `EncounterDossier`. Closes the real functional gap this whole feature exists for: a GM previously had no way to roll a bare skill check for an adversary (only weapon-based combat checks via `CombatCheckOverlay`). Two internal tabs (`'skill' | 'combat'`, local `useState`): **Skill Check** and **Combat Check**, both inline rollers (Prompt 9 replaced the earlier weapon+target-picker-only Combat tab that handed off to `CombatCheckOverlay` — that overlay is now untouched/unused from this file; `GmMapView` no longer mounts it from the dossier, though `PlayerHUDDesktop.tsx` still uses it for PC checks). Props: `CheckConsoleProps { entry: RosterEntry, campaignId: string, roster: RosterEntry[], initialTab?: 'skill' | 'combat', attackWeaponSignal?: number | null, onRollLogged?: () => void }`. Skill tab: fetches `ref_skills` (`key, name, characteristic_key`) once via a local `useRefSkills()` hook, lists every skill with a live-computed pool preview (`computeSkillPool`: `CHAR_FIELD_MAP[skill.characteristic_key]` from `src/lib/combatCheckUtils.ts` → `adv.characteristics[field]`, rank via `getAdversarySkillRank(adv, skill.name)` from `src/lib/adversaryAdapter.ts` → `getSkillPool(charVal, rank)` from `src/components/player-hud/dice-engine.ts`, the single source of pool-math truth). Clicking a skill row pre-fills the freely-adjustable pool tray (6 steppers, one per `DiceType` from `@/lib/tokens` excluding `force`); rolling calls `rollPool` (`dice-engine.ts`) directly and `logRoll` (`src/lib/logRoll.ts`) with `characterId: null`/`isDM: true`/`meta: { rollType: 'skill', alignment: entry.alignment }`. Vehicles have no `characteristics`/`skillRanks`, so the Skill tab doesn't apply to them — button doesn't render and tab state defaults/resets to `'combat'` whenever `entry` has no adversary entity (a `useEffect` keyed on `entry.instanceId`, not during render). A separate `useEffect` on `attackWeaponSignal` force-switches to Combat and pre-selects that weapon index when the dossier's weapons-list ATTACK button fires. `.cc-tab`/`.cc-skill-item`/`.cc-dstep`/`.cc-roll-btn` hover/focus CSS classes live in `src/app/globals.css` alongside the `.dossier-*` classes.

  **Combat tab**: adversaries get every real weapon plus a synthetic `Unarmed` entry (index `-1`, AoE Core p.224: Brawl, damage = Brawn, Engaged, Crit 5, Disorient 1 + Knockdown) appended last; selecting a weapon prefills the pool from the adversary's own rank in that weapon's governing skill (`computeWeaponPool`, keyed by `weaponSkillKey(w)` from `adversaryAdapter.ts` — reads `adv.skillRanks`/`adv.characteristics` directly rather than via `ref_skills.name`, since `AdversaryInstance.skillRanks` is keyed in the colon-separated form `ref_skills.name` doesn't match). No target picker or damage automation — the GM enters difficulty manually and applies wounds by hand; the roll only surfaces reference info (`DMG {d} · CRIT {c} · {range} · {qualities}`) baked into the `roll_label`, via `rollType: 'skill'` (not `'combat'`) so `RollFeedPanel`'s skill card renders that label as-is instead of computing an automated damage total. **Vehicles (Prompt 10)**: no synthetic Unarmed (vehicles have no Brawn/Brawl). A vehicle has no skills of its own, so firing a weapon requires a crew member: selecting a vehicle weapon (governing skill from `vehicleWeaponSkillKey(w.weaponKey)`, `src/lib/vehicles.ts` — defaults to `'GUNN'`, since every current entry and RAW itself route weapon fire through Gunnery, but the field is per-weapon so a future Piloting-governed entry needs no code change) reveals a **Select Crew** list of every non-vehicle `RosterEntry` (`roster.filter(r => r.kind === 'adversary')` — enemy adversaries and friendly NPCs alike, hidden ones included, other vehicles excluded), rendered with the same `.cc-skill-item` row styling as the weapon/skill lists (no new component). Choosing a crew member prefills the pool from that crew's rank in the weapon's skill via the same `computeWeaponPool`, which already handles minion-derived rank (`getAdversarySkillRank`) since crew entries are plain `AdversaryInstance`s. Roll stays disabled until both a weapon and a crew member are chosen; the crew choice is ephemeral — reset on every weapon (re)selection, entity switch, and completed roll — and never appears in the roll feed, only the vehicle + weapon reference info. An empty crew list shows an inline "No crew available — add a crew NPC to the encounter." message instead of a blank list.

### Tier 3 — Atoms & Utilities
- `ThemeInit` (`src/components/ThemeInit.tsx`) — client component (marked 'use client'); calls `initTheme()` on mount; returns null; rendered as first child of `<body>` in root layout to initialize theme on every page load
- `ThemeSwitcher` (`src/components/player-hud/ThemeSwitcher.tsx`) — HUD theme switcher component; exports `UiTheme` type; renders three theme color swatches (Binary Sunset, Rebel Operative, Kyber Archive); accepts `current` theme and `onChange` callback; fully controlled via props
- `RollFeedPanel` (`src/components/player-hud/RollFeedPanel.tsx`) — **Approach A feed layout** with state `expandedIds: Set<string>` for expand/collapse UI. Props: `rolls: RollEntry[]`, `ownCharacterId: string`, `isGm?: boolean`. Layout: top 2 most-recent skill/combat/force rolls render as **Design B cards** (tinted header band with alignment colour at 7% opacity + 15% border, character name, roll type, relative time; card body with large outcome word, result symbols, type-specific extras like damage calc or force pips, and dice pips); older rolls collapse to **compact single-line rows** (4px accent dot, character name, type label, outcome abbr, relative time); clicking a collapsed row expands it as a full card in-place; clicking the header band of an expanded history card collapses it (always-expanded top-2 cards have no collapse affordance). Initiative rolls always render as **compact non-expandable notifications** (one-liner with group count if multiple; grouped within 30-second window). System entries are **compact rows** (gear icon + message or award label); long system messages (>60 chars) get an expand toggle. Players never see hidden rolls; GMs see everything.
- `Modal` (`src/components/ui/Modal.tsx`) — shared portal modal: dark backdrop + blur, ESC key, click-outside dismiss, panel with HUD tokens. Props: `open`, `onClose?`, `maxWidth`, `zIndex`, `borderColor`, `shadow`.
- `PlayerTokenTooltip` (`src/components/player/PlayerTokenTooltip.tsx`, Prompt 11, hover-reliability fixes in Prompts 13-14) — image-first, GSAP holographic-materialization tooltip for every token a player can currently see (PCs, and any revealed enemy/friendly NPC or vehicle); replaces the old Kyber-stat-block `TokenTooltip` copy that used to live in `HudSessionTab.tsx`. Props: `{ entity: PlayerTooltipEntity | null, tokenRect: DOMRect | null }`. Content is React state (drives what renders); position/flip/animation are direct ref writes across **two** `useLayoutEffect`s (split in Prompt 13 — originally one). A "decision" effect keyed on `[entity, tokenRect]` only decides show/hide/same-token and updates `displayEntity`/`sameTokenRef`; a separate "DOM" effect keyed on `[displayEntity, tokenRect]` does all `wrapRef.current` reads/writes (position math + GSAP). This split matters: doing both in one effect meant that on a *fresh* mount (tooltip had fully hidden and unmounted, then a new hover arrived) `setDisplayEntity(entity)` didn't synchronously attach `wrapRef.current` in that same pass — React hadn't committed the render yet — so positioning/animation silently no-op'd on `if (!wrap) return`, and the card never actually appeared. Confirmed live via Playwright (headless Chromium, campaign "Legacy of Rebellion") sampling `getComputedStyle` on the real DOM node over time: before the fix, opacity/clipPath/left/top sat permanently at their untouched JSX/CSS defaults after a cold hover; keying the DOM effect on `displayEntity` itself (which only fires after React commits the render where it went non-null) fixed it — confirmed via the same live sampling, plus 6/6 repeated identical hovers all landing on `opacity:1`. A second, smaller race also existed and is fixed: the same-token ("already shown, just reposition") branch didn't kill an in-flight *hide* timeline, so leaving-and-returning to a token fast enough could let a stale hide animation's later steps stomp the opacity back down after this branch set it — also confirmed via live repeated-hover sampling (alternating visible/invisible before the fix). `tl.kill()` cleanly cuts off an in-flight timeline whenever the pointer moves rapidly between tokens. Portaled to `document.body`, which — since `PlayerHUDDesktop`'s `data-theme` override lives on its own wrapper div, not `<html>`/`<body>` — means the card structurally sits outside any Kyber override the player has personally toggled and always renders `:root`'s Ember Tatooine defaults; no hardcoding needed to enforce "Ember Tatooine, not Kyber cyan." Role edge-line/fallback-initial colour comes from `COLOR.red`/`COLOR.green`/`HUD.accentPurple` — the same enemy/friendly/purple tokens already established by `EncounterDeck`'s `EntityCard` and `GmConflictPip`, not new values. Type tag (MINION/RIVAL/NEMESIS/VEHICLE, omitted for PCs) is positioned top-left with the same safe-inset convention as `EncounterDeck`'s roster-card role tag (Prompt 6). Portrait is `MapToken.token_image_url` directly — the same shared identity image already drawn on the map disc/rectangle, dossier, and roster card, no separate image system. Wired from `HudSessionTab.tsx`'s `tooltipEntity` memo (mirrors the old `tooltipProps` memo's PC/adversary/vehicle/minion branch structure, trimmed to wounds/strain/minionPips only — no soak/defense/characteristics). Positioning needs the hovered token's true screen rect, not just a cursor point (tokens are Pixi sprites, not DOM nodes) — `MapCanvas.tsx`'s `onTokenHover` callback gained a 4th `tokenRect: DOMRect` argument (via the token's Pixi `container.getBounds()` translated into page coordinates), additive and non-breaking for the GM's own `onTokenHover` consumer which ignores it. Each token's Pixi container also gets an explicit `hitArea` (`buildTokenSprite`'s `applyLabelScale`, computed from `container.getLocalBounds()` + a few px of jitter padding, spanning the disc/rect through the label pill below it) — Pixi's default per-child hit-testing left real gaps (the ring graphic is stroke-only, so its own `containsPoint` was a thin band, not the disc interior); a single container-level `hitArea` makes the whole visual footprint one solid hit region, confirmed correct/solid via the `DEV_DEBUG_HOVER` overlay (see below) before the actual Prompt 13 bug (the React ref-timing race above) was found — the hitArea was never actually the problem, but the fix is still correct/warranted and stayed in. `MapCanvas.tsx` has a `DEV_DEBUG_HOVER` const (default `false`) that, when flipped on locally, draws each token's live `hitArea` as a magenta translucent overlay and console.logs a coordinate-mapping bundle on every `pointerover` — kept as permanent (off-by-default) diagnostic tooling for any future hover issues. **Prompt 14**: `MapCanvas.tsx`'s per-token `hoverOutDebounce` (a 60ms `setTimeout` before calling `onHoverEndRef`, absorbing a real Pixi quirk where crossing between a token's own child graphics can fire a spurious pointerout/pointerover pair) is a per-token-container closure — leaving token A starts A's own timer, and nothing cancels it if the pointer lands on a *different* token B within that window (only A's own re-entry cancels A's timer). `onTokenHoverEnd` therefore now carries the leaving token's id, and both consumers (`HudSessionTab.tsx`'s `tooltipEntity`-driving `tokenHoverInfo` state, and `GmMapView.tsx`'s `handleTokenHoverEnd`) only clear their hover state if it still matches that id (`prev?.tokenId === id ? null : prev`) — otherwise the callback is stale (superseded by B's hover already landing) and is a no-op. Without this, hopping quickly between two tokens showed no tooltip at all: B's tooltip would appear, then ~60ms later A's delayed hide fired and unconditionally nulled the shared hover state, wiping B's tooltip a moment after it appeared. Confirmed live via Playwright (rapid A→B `mouse.move`, no lingering pause, sampling `getComputedStyle` well past the 60ms window). New `.ptt-*` CSS classes (static geometry only — clip-path frame, corner brackets, notch, pips, scanline/scrim) live in `src/app/globals.css`; `SHADOW.tooltip`/`--shadow-tooltip` (`src/lib/tokens.ts`/`src/styles/holo-tokens.css`) backs the card's drop-shadow.
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
| `vehicles.ts` | OggDude vehicle JSON types + `fetchVehicles()`; `vehicleWeaponSkillKey(key)` resolves the SWRPG skill key that governs firing a vehicle weapon (per-entry `VehicleWeaponEntry.skillKey`, defaults to `'GUNN'` — used by `CheckConsole.tsx`'s vehicle crew step) |
| `combat.ts` | `CombatEncounter`, `InitiativeSlot` types + encounter helpers |
| `damageEngine.ts` | Damage calculation: base + modifiers + qualities → final damage |
| `dice.ts` | Dice pool types and roll result types |
| `forceRoll.ts` | Force die roll utilities |
| `forceUtils.ts` | Force rating, Morality helpers |
| `criticalUtils.ts` | Critical injury roll + severity helpers |
| `buildTalentTree.ts` | Constructs talent tree grid from specialization + purchased talents |
| `adversaryAdapter.ts` | Converts an `AdversaryInstance` → the Character/CharacterWeapon/CharacterSkill stubs `CombatCheckOverlay` needs (`adaptAdversaryForCombatCheck`); also `charactersToAdversaryStubs` (PCs → `AdversaryInstance` stubs, for use as combat targets), `getAdversarySkillRank`, and `weaponSkillKey` (classifies an `AdversaryWeapon` into a SWRPG skill key from its `skillCategory`/`range`/`name` — the single source of truth for "what skill does this weapon use", reused by `CheckConsole.tsx`'s Combat tab for its melee/ranged preview) |
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
