# GM Party Panel — Compact Cards + Character Dossier

Date: 2026-09-18

## Goal

Replace the GM Party panel's always-expanded PC cards + `GmCharacterModal` with a
compact horizontal-strip card + a full Character Dossier (FLIP-open), mirroring the
adversary dossier's hero/stats/check-console layout, adapted for PCs: characteristics,
inventory management with encumbrance, and a Skill/Combat check console with Force die
support. Brings the GM side of gear management up to parity with the overhauled
player-side inventory system (equip_state cycling, `computeEncumbranceStats`).

Authoritative visual reference: `party-dossier-mockup.html` (dossier), `party-panel-mockup.html`
(panel/card/bulk controls) — supplied directly by the user, not committed to the repo.
Where they disagree, the dossier mockup wins (characteristics row, Force die row,
encumbrance readout, chip layout).

## Step 0 audit findings (binding — reuse targets)

| Concern | Reuse target |
|---|---|
| Wound/Strain mutation | `handleVitalChange`/`handleVitalAdjust` (`useCharacterData.ts:691,701`) via `onAddWound/onHealWounds/onAddStrain/onHealStrain` props already threaded through `GmPartyPanel`/`useGmCharacterActions.ts` |
| Token add/remove | `addToken`/`removeToken` from `useMapTokens.ts` (signatures: `addToken(token: Omit<MapToken,'id'|'updated_at'>): Promise<MapToken|null>`, `removeToken(id): Promise<void>`). Pattern for per-character add: `addCharacterToken(character)` in `GmShell.tsx:151` (builds full `MapToken` payload, `participant_type:'pc'`, `alignment:'pc'`) |
| Archive | `handleArchive` (`useGmCharacterActions.ts:553`) → `archiveCharacter(id)` |
| Crit count / badge | `charActiveCritCounts` prop + `CriticalInjuryPip` component — already used by `GmPartyMiniCard` |
| Item state cycle | `cycleEquipState()` + `.update({equip_state, is_equipped})` on `character_weapons`/`character_armor`/`character_gear` (`useCharacterData.ts` ~755/808/814/820) |
| Item drop/trash | `handleRemoveWeapon(id, droppedBy, droppedNote)` / `handleRemoveEquipment(id, type, droppedBy, droppedNote)` — soft delete (`is_dropped:true`), never hard delete |
| Encumbrance | `computeEncumbranceStats(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap): EncumbranceStats` (`derivedStats.ts:499`), pure. Returns `{base, wornCapacity, load, threshold, cliff, perItem, capacitySources, loadSources}`. `cliff = threshold + Brawn` (RAW "encumbered ≥ Brawn" rule). States counting toward `load`: `'carrying'` and `'equipped'`; `'stowed'` costs 0; dropped items excluded. |
| Roll + public feed | `rollPool()` (`src/components/player-hud/dice-engine.ts`) + `logRoll({campaignId, characterId, characterName, label, pool, result, isDM, hidden, meta})` (`src/lib/logRoll.ts`) — both generic, not adversary-specific |
| Adversary dossier pattern | `EncounterDossier.tsx` (hero/mid/check-console 3-col grid, purple edge, FLIP open) + `CheckConsole.tsx` (tab switch, pool preview, 3×2 stepper grid, roll button). `computeSkillPool`/`computeWeaponPool` in `CheckConsole.tsx` are hard-typed to `AdversaryInstance` — **not reusable as-is for PCs**, new pool math needed (same formula: `proficiency = min(rank, characteristic)`, `ability = max(rank, characteristic) - min(rank, characteristic)`) |
| Characteristics hex display | **No extracted reusable component exists** in `EncounterDossier.tsx` — characteristics render inline. New dossier replicates the same visual/token treatment (hex clip-path, `FONT_DISPLAY` numeral) rather than importing a nonexistent shared component. |

**Confirmed new roll authority**: there is currently no GM-side path to roll on a PC's
behalf. `PcCheckConsole` is new code (approved). No DB migration needed — all fields used
already exist.

**Confirmed encumbrance tiers**: use real RAW `cliff` (`threshold + Brawn`), not the
mockup's flat "+5" placeholder, for amber/red pen tiers (approved).

## Architecture

```
GmShell.tsx
  └─ GmPartyPanel.tsx           (bulk controls + card list; now threads tokens/addToken/removeToken/mapId)
       ├─ GmPartyMiniCard.tsx   (rewritten: compact strip, no editable controls)
       └─ GmCharacterDossier.tsx (NEW — replaces GmCharacterModal.tsx, deleted)
            ├─ hero column (portrait, id, token toggle, archive)
            ├─ centre column (characteristics hexes, vitals, defense chips, inventory+ENC)
            └─ PcCheckConsole.tsx (NEW — Skill/Combat tabs, 3×2 grid, Force row, roll+log)
```

### Part A — `GmPartyMiniCard.tsx` (compact card)

Horizontal strip (~74px tall, fits existing ~400px panel width): portrait canvas/img
left, name + species·career + live wound/strain bars centre, status rail right (token-
on-map dot, Force-sensitive dot, crit badge). No steppers, no click targets except the
whole card → opens dossier. GSAP stagger-in on mount (`x:-18,opacity:0` per mockup),
restrained hover lift (`y:-2`).

Props change: drops `onAddWound/onHealWound/onAddStrain/onHealStrain` (no longer
editable on the card); adds `onMap: boolean` (from new `onMapCharIds` set) and keeps
`crits`/`conflicts→crit-badge-only` — conflict pips move fully into the dossier or are
dropped from the card (mockup only shows crit badge on the card, not conflict pips;
confirming: card drops conflict pips, dossier doesn't show them either — out of this
prompt's mockup scope, unchanged elsewhere).

### Part B — Bulk token controls (`GmPartyPanel.tsx` header)

Two buttons, active-map-scoped: **Place All PCs** loops `addToken(...)` (same payload
shape as `addCharacterToken` in `GmShell.tsx`) once per character not already on the
map; **Remove All PCs** loops `removeToken(id)` for each PC token on the active map.
No confirmation dialogs (matches Encounter Deck's existing roster bulk-action pattern).
GSAP staggers a pulse across each card's token dot on completion.

`GmPartyPanel` needs new props: `tokens: MapToken[]`, `addToken`, `removeToken`,
`mapId: string | null` — threaded from `GmShell.tsx` (`activeMap?.id`, `stagingTokens`,
`stagingAddToken`, `stagingRemoveToken` — same values already passed to `GmMapPanel`).

### Part C — `GmCharacterDossier.tsx` (new file, mirrors `EncounterDossier.tsx`)

3-column grid (hero 224px / mid 1fr / check-console 300px), purple `.edge` bar, FLIP
open from the clicked card's bounding rect (same technique as the panel mockup's
`openDossier` — GSAP `fromTo` using `getBoundingClientRect()` delta).

- **Hero**: portrait, name, `species · career` (+`◆ FORCE FR n` suffix if
  `is_force_sensitive`), Add/Remove-from-Map toggle (`addToken`/`removeToken`, reflecting
  `onMapCharIds.has(character.id)`), Archive button → `handleArchive`.
- **Characteristics**: 6-hex row, BR/AG/INT/CUN/WIL/PR, styled to match
  `EncounterDossier`'s existing characteristic display (no shared component exists to
  import — replicate the token/visual treatment).
- **Vitals**: Wounds/Strain steppers → `handleVitalChange`/`handleVitalAdjust`, same
  props already flowing through `GmPartyPanel`.
- **Defense chips**: Soak, M Def, R Def, +cyan Force chip (FR) if force-sensitive.
  Read-only.
- **Inventory**: header row with right-aligned `ENC <load> / <threshold>` readout from
  `computeEncumbranceStats()` — plain by default, amber + penalty tag when
  `load > threshold`, red + `IMMOBILE` tag when `load >= cliff`. Recomputed on every
  local state change (optimistic) so it updates live as the GM cycles items. Each row:
  item name, dim per-item encumbrance number (`perItem` from the same stats call), state
  pill (cycles EQUIPPED→CARRIED→STOWED via `cycleEquipState`+existing `.update()`), drop
  `✕` (`handleRemoveWeapon`/`handleRemoveEquipment`). No thematic treatment — bare rows.

### `PcCheckConsole.tsx` (new file, mirrors `CheckConsole.tsx`)

- Skill Check tab: all skills from `character_skills`/rank map, pool = `{proficiency:
  min(rank,char), ability: max(rank,char)-min(rank,char)}` — same formula
  `CheckConsole.tsx` uses, computed fresh against the `Character` shape (no adapter
  exists for PCs, this is genuinely new small pure functions, not reuse-in-disguise).
- Combat Check tab: weapons filtered from `character_weapons` where
  `itemState(w) === 'equipped' && !is_dropped`, plus a synthetic Unarmed entry
  (Brawl, dmg=Brawn, Crit 5, Engaged, Disorient 1, Knockdown) appended last — this profile
  constant should live once (check if `CheckConsole.tsx`/`combatCheckUtils.ts` already
  defines an Unarmed profile for adversaries; if so import it, else define once in
  `combatCheckUtils.ts` and import from both consoles — decided during implementation,
  not duplicated per-file).
- Standard 3×2 stepper grid, unchanged structure. Force die row: separate full-width row
  below the grid, cyan, shown only when `is_force_sensitive`, on both tabs, FR shown as
  non-blocking hint text. Force dice append to the end of `pool` sent to `rollPool`/
  `logRoll`.
- Roll button always public: `logRoll({..., isDM: true, hidden: false, meta:{rollType:
  'skill'|'combat', characterId}})`.

## Data flow

Dossier mounts with the selected `Character` + its `character_weapons`/`character_armor`/
`character_gear` rows (already available in `GmPartyPanel`'s parent scope via existing GM
data hooks — confirm exact prop path during implementation, likely same shape
`useCharacterData` exposes per-character on the player side, sourced GM-side through
whatever hook currently backs `GmCharacterCard`'s inventory tab, if any — **flag during
implementation if GM-side per-character gear isn't already loaded anywhere**, since
Step 0 didn't explicitly confirm a GM-side gear-loading hook exists yet).

State changes (item cycle, drop, vitals) call the real mutation, then re-derive
`computeEncumbranceStats` from the updated local arrays — no second calculation path.

## Testing

Per user: unarchive one existing character for live verification (vitals, item cycle,
drop, encumbrance tiers, token add/remove, both check tabs, Force row on/off), then
re-archive when done. No new/synthetic test character needed. Reload-and-recheck for
persistence per the original prompt's self-audit checklist.

## Explicitly out of scope (unchanged)

Encounter Deck, adversary dossier/`CheckConsole.tsx` (no Force row added there),
MapToolsRadial / map markers, initiative strip, player tooltip, player-side inventory UI,
any DB migration, character creation/leveling/XP, encumbrance penalties applied to dice
pools (informational only).

## Open item to confirm during implementation

GM-side per-character gear loading path (whether one already exists or needs adding
purely as a data-fetch, not a new mutation path) — flag immediately if missing rather
than guessing a shape.
