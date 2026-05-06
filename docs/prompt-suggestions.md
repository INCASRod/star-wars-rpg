# Holocron — Claude Prompt Suggestions

> How to work with Claude on this codebase efficiently: reduce token spend, improve context, get better answers faster.

---

## Why This Matters

`PlayerHUDDesktop.tsx` is 2,700 lines. `CombatPanel.tsx` is 3,647 lines. `gm/page.tsx` exceeds 3,000 lines. Loading these files into context costs a large chunk of the 200k token window — and Claude has to re-read them every session unless it can rely on memory or targeted reads.

The suggestions below help Claude stay focused, read less, and produce more accurate answers.

---

## 1. Always Name the File and Approximate Location

**Instead of:** "Fix the stow button behavior in the inventory"  
**Say:** "In `src/components/player-hud/InventoryPanel.tsx`, the `handleEquipChange` function around line 180 — when state is 'stowed' it should open the modal but it's not firing. Fix it."

**Why it helps:** Claude reads the whole file looking for context if you don't give a location. A line number cuts that search to a 50-line window.

---

## 2. Load `docs/architecture.md` at Session Start

When starting a new task, paste this at the top of your first message:

```
Please read docs/architecture.md first for project structure context.
```

Or reference it in CLAUDE.md so it auto-loads. This eliminates the "explore the codebase" phase that costs 5–10k tokens of tool calls per session.

---

## 3. Distinguish "Read-Only" from "Make Changes"

Claude will read supporting files speculatively when it doesn't know if changes are needed. Be explicit:

- **Research task:** "Read `src/hooks/useCharacterData.ts` and explain how stow location is persisted. Read-only, no changes."
- **Change task:** "In `src/hooks/useCharacterData.ts`, update `handleSetEquipState` to also clear `stow_location_name` when state is 'equipped'. Here is the current signature: [paste it]."

**Why it helps:** Saves the round-trip where Claude reads, summarizes, asks "should I change it?", then reads again.

---

## 4. Paste the Relevant Type When Asking About Data Shapes

Most questions about inventory, characters, or group assets involve types from `src/lib/types.ts`. Instead of asking Claude to go find the type, paste it:

```
Here is the CharacterWeapon interface:
export interface CharacterWeapon {
  id: string
  equip_state: EquipState
  stow_location_id?: string | null
  stow_location_name?: string | null
  stow_location_type?: StowLocationType | null
  ...
}
```

This alone can save 2–4k tokens on questions about data flow.

---

## 5. Reference Migrations by Number, Not by "the database"

When asking about schema, say:

> "Migration 051 added stow location columns to `character_weapons`, `character_armor`, `character_gear`. Given that schema..."

Rather than asking Claude to find the migration. Claude can verify with a quick read, but the number tells it exactly where to look.

---

## 6. Use Memory for Patterns You Repeat

Tell Claude to save patterns you use often as memory entries. Good candidates for this project:

- "When adding a new DB column, always create a migration file in `supabase/migrations/` with the next number, apply it via the Supabase MCP, then update `src/lib/types.ts`."
- "The OggDude icon font uses `ffi ffi-swrpg-*` CSS classes. Icon color is always set inline. See `src/lib/oggdude-markup.ts` for the full map."
- "Mutations go through `useCharacterData.ts` handler functions — never write to Supabase directly from a component."

Once in memory, Claude will follow these patterns automatically without re-reading the code.

---

## 7. Tell Claude Which Agent to Use for Big Explorations

For questions that span 5+ files, prefix with:

> "Use a subagent to explore the codebase for this. Do not read files yourself."

This keeps your main context window clean. The agent returns a focused summary rather than dumping 3,000 lines of component code into context.

---

## 8. Scope Refactor Requests Explicitly

"Refactor the inventory panel" will cause Claude to read the entire 820-line file, all its types, the parent component, and supporting hooks. Instead:

> "In `InventoryPanel.tsx`, extract the `StowLocationModal` component (roughly lines 50–180) into its own file at `src/components/player-hud/StowLocationModal.tsx`. Keep the props interface identical. Do not change any logic."

Narrow scope = fewer speculative reads = lower token cost.

---

## 9. Provide the OggDude Shortcode Map When Touching Rich Text

The three overlapping parsers are a source of confusion. When asking Claude to add or fix a symbol:

```
The shortcode map lives in src/lib/oggdude-markup.ts (for HTML tooltips) 
and src/lib/parseSymbols.ts (OGGDUDE_ALIASES, for RichText).
Both must be updated together. Current mappings: [SU]=success, [FA]=failure, 
[AD]=advantage, [TH]=threat, [TR]=triumph, [DE]=despair, [FP]=force pip,
[LI]=light pip (white), [DA]=dark pip (purple), [DP]=dark pip spend (purple).
```

Paste this and Claude won't need to re-read both files from scratch.

---

## 10. Use the CLAUDE.md "Always Read" List Strategically

`CLAUDE.md` currently says to always read:
1. `claude.md`
2. `AoE Core Rulebook.md`
3. `design-rules.md`

Consider adding:
- `docs/architecture.md` — routes, hooks, data layer (this file)
- `src/lib/types.ts` — all TypeScript interfaces

This auto-loads critical context without manual prompting, at the cost of ~3–4k tokens per session. For sessions that touch data types or routing, it pays for itself immediately.

---

## 11. Batch Related Changes in One Prompt

Asking Claude to "also update the types" as a follow-up causes it to re-read files it just closed. Instead:

> "Make these three changes in one pass:  
> 1. Add `foo?: string` to `CharacterWeapon` in `types.ts`  
> 2. Update `handleSetEquipState` in `useCharacterData.ts` to set `foo`  
> 3. Display `foo` in `InventoryPanel.tsx` next to the item name"

One compound prompt = one read pass = much lower token cost than three sequential prompts.

---

## 12. Don't Ask Claude to Summarize What It Just Did

After Claude makes a change, it tends to add a closing summary ("Here's what I changed..."). This costs 200–500 tokens per task and you can read the diff yourself. You can suppress it:

> "No trailing summary — I can read the diff."

Or add this to CLAUDE.md as a persistent instruction.
