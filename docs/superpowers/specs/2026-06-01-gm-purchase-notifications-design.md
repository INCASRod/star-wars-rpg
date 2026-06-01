# GM Purchase Notifications — Design Spec

**Date:** 2026-06-01
**Status:** Approved
**Feature:** GM-only roll feed notifications when players purchase skill ranks, talents, force powers, or specializations, with a GM revert action per entry.

---

## Overview

When a player purchases any of the following, a **GM-only** entry appears in the roll feed:
- A skill rank increase (any rank, 1–5)
- A talent (new purchase or ranked upgrade)
- A force power / force ability upgrade (new or ranked)
- A new specialization

The GM can click a **↺ revert button** on any purchase entry to undo the purchase: the talent/skill/force ability/spec is removed, XP is restored, and the entry renders as `[REFUNDED]`.

Players never see any of these entries.

---

## Data Model

No new tables or migrations required. All purchase notifications reuse the existing `roll_log` table with the `roll_meta` JSONB column.

### roll_log row shape

```
roll_type:        'XP Purchase'
hidden:           true           ← filtered out from player feeds
alignment:        'system'
is_dm:            false
character_id:     <buyer character UUID>
character_name:   <buyer display name>
campaign_id:      <campaign UUID>
roll_label:       <human-readable purchase label — see examples below>
roll_meta:        { ...see below }
pool:             { proficiency:0, ability:0, boost:0, challenge:0, difficulty:0, setback:0, force:0 }
result:           { netSuccess:0, netAdvantage:0, triumph:0, despair:0, succeeded:false }
```

### roll_label examples

| Purchase type | Example roll_label |
|---|---|
| Skill rank | `Rank 2 of Discipline` |
| New talent | `Toughened` |
| Ranked talent | `Toughened (Rank 2)` |
| Force power | `Enhance — Control` |
| Ranked force power | `Move — Strength (Rank 2)` |
| Specialization | `Medic Specialization` |

### roll_meta shape

```ts
{
  purchase_type: 'skill' | 'talent' | 'force' | 'specialization'
  xp_cost:       number      // XP deducted — restored on refund
  refunded:      boolean     // false initially; set to true on GM refund

  // skill only
  skill_key?:  string        // e.g. 'discipline'
  prev_rank?:  number        // rank before purchase — revert target
  new_rank?:   number        // rank after purchase

  // talent only
  talent_id?:  string        // character_talents row UUID — deleted on refund
  talent_key?: string

  // force power only
  force_ability_id?: string  // character_force_abilities row UUID — deleted on refund

  // specialization only
  specialization_key?: string // character_specializations row key — deleted on refund
}
```

---

## Writing Notifications

### Location
`src/hooks/useCharacterData.ts` — after successful Supabase writes in each of the four purchase handlers.

### Handler signature changes
Each handler gains a `displayName: string` parameter (the human-readable label the caller already has for rendering). This is used to build `roll_label` and avoids any key-to-name derivation logic.

```ts
// Before
handleBuySkill(skillKey: string, currentRank: number, isCareer: boolean)
handlePurchaseTalent(talentKey: string, row: number, col: number, activeSpecKey: string)

// After
handleBuySkill(skillKey: string, currentRank: number, isCareer: boolean, displayName: string)
handlePurchaseTalent(talentKey: string, row: number, col: number, activeSpecKey: string, displayName: string)
// same pattern for the force power and specialization handlers
```

Callers (`SkillsPanel`, `TalentsPanel`, etc.) already have the display name and pass it through.

### logRoll call

After the existing Supabase `Promise.all([...])` resolves, call `logRoll()` with the shape above. The call is fire-and-forget (same pattern used for all other roll log entries).

---

## Refund Handler

### Location
New function `handleRefundPurchase(entry: RollEntry)` — extracted to a dedicated handler and wired from `gm/page.tsx`, then passed as a prop down to wherever `RollFeedPanel` is rendered for the GM.

### Logic

```
1. Read entry.roll_meta
2. Restore XP:
     UPDATE characters SET xp_available = xp_available + roll_meta.xp_cost
     WHERE id = roll_meta.character_id  (use entry.character_id)
3. Reverse the purchase:
     skill        → UPDATE character_skills SET rank = prev_rank WHERE character_id = ... AND skill_key = ...
     talent       → DELETE FROM character_talents WHERE id = talent_id
     force        → DELETE FROM character_force_abilities WHERE id = force_ability_id
     specialization → DELETE FROM character_specializations WHERE character_id = ... AND specialization_key = ...
4. Mark as refunded:
     UPDATE roll_log SET roll_meta = roll_meta || '{"refunded":true}' WHERE id = entry.id
```

All four DB operations can be issued in a `Promise.all` for efficiency. Optimistic UI update is not needed — the `useRollFeed` UPDATE subscription (see below) handles the live refresh.

### Edge case — prerequisite talent refund
If the refunded talent was a prerequisite for other talents already purchased in the same tree, the talent tree will be in an inconsistent state after refund. The refund is **not blocked** — the GM is responsible for resolving tree consistency. A tooltip on the ↺ button reads: _"Refunding this talent may affect other talents in the tree."_ (This tooltip is always shown for talent entries; detecting actual prerequisites is out of scope.)

---

## useRollFeed Changes

Currently subscribes to `INSERT` only on `roll_log`. Add `UPDATE` handling so that when a row is marked refunded, all subscribers (including GM feed) reflect the change in place.

```ts
.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'roll_log', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
  setEntries(prev => prev.map(e => e.id === payload.new.id ? { ...e, ...payload.new } : e))
})
```

RLS must permit UPDATE on `roll_log` for the GM's session. Check existing RLS policies and add if needed.

---

## RollFeedPanel Changes

### New prop
```ts
onRefundPurchase?: (entry: RollEntry) => void
```

Only rendered when `isGm === true` and `onRefundPurchase` is provided.

### SystemRow — XP Purchase branch

`roll_type === 'XP Purchase'` gets its own rendering branch inside `SystemRow`:

**Active (not refunded):**
```
⬆ {character_name} purchased {roll_label} · {xp_cost}xp    [↺]
```
- `⬆` in `HUD.textFaint`
- character_name in `HUD.text`
- roll_label in `HUD.text`
- `· {xp_cost}xp` in `HUD.textFaint`
- `[↺]` button: small, `HUD.textFaint` color, `cursor-pointer`, no background/border; on hover goes to `HUD.gold`; shows talent-prerequisite tooltip for talent entries

**Refunded:**
```
⬆ {character_name} purchased {roll_label}    [REFUNDED]
```
- Entire line at reduced opacity (0.45)
- `[REFUNDED]` label in `HUD.textFaint`, italic, no button

The ↺ button calls `onRefundPurchase(roll)` on click.

---

## Wiring — GM Side

`gm/page.tsx` (or its extracted shell) instantiates `handleRefundPurchase` and passes it to the component that renders `<RollFeedPanel isGm onRefundPurchase={handleRefundPurchase} />`.

`useRollFeed` is already called somewhere in the GM context — confirm the exact call site during implementation and ensure `isGm={true}` is set on the panel.

---

## Out of Scope

- Cascading talent refunds (remove all dependent talents when a prerequisite is refunded)
- Player-facing "purchase pending GM approval" flow
- Bundling multiple purchases into one notification
- 24-hour window / accumulated XP summary
