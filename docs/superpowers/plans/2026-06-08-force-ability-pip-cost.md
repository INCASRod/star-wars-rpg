# Force Ability Pip Cost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a structured `pip_cost` column to `ref_force_abilities`, thread it through the type chain, and replace the hardcoded `1` pip display in Force Check steps with the real per-upgrade cost.

**Architecture:** The migration seeds `pip_cost` by counting `[FP]` tokens in existing descriptions (e.g. `[FP][FP]` → 2). The value flows from Supabase → `useCharacterData` (already `select('*')`) → local `RefForceAbility` interface in `useForcePowers` → `ForceAbilityDisplay` → `RollForceDiceStep` and `SelectPowerStep`. The `parse-oggdude.ts` script is updated so future ReSpecialized Project re-parses carry `pip_cost` in the JSON output.

**Tech Stack:** PostgreSQL (Supabase), TypeScript, React — no new dependencies.

---

## Files

| Action | Path | Change |
|---|---|---|
| Create | `supabase/migrations/060_force_ability_pip_cost.sql` | Add `pip_cost` column + seed from description |
| Modify | `src/lib/types.ts` | Add `pip_cost?: number` to `RefForceAbility` |
| Modify | `src/components/player-hud/ForcePanel.tsx` | Add `pip_cost: number` to `ForceAbilityDisplay` |
| Modify | `src/hooks/useForcePowers.ts` | Thread `pip_cost` through local interface + ability map |
| Modify | `src/components/force-check/steps/RollForceDiceStep.tsx` | Fix `spendPip`, `canLight`/`canDark`, cost display |
| Modify | `src/components/force-check/steps/SelectPowerStep.tsx` | Show pip cost in accordion upgrade rows |
| Modify | `scripts/parse-oggdude.ts` | Extract `pip_cost` in ForceAbilities parser |

`useCharacterData.ts` already uses `select('*')` on `ref_force_abilities` (line 85) — no change needed there; the new column appears automatically after migration.

---

## Task 1: Migration — Add and Seed pip_cost

**Files:**
- Create: `supabase/migrations/060_force_ability_pip_cost.sql`

- [ ] **Step 1.1: Create the migration file**

Create `supabase/migrations/060_force_ability_pip_cost.sql` with exactly this content:

```sql
-- Add pip_cost to ref_force_abilities.
-- Seeded by counting [FP] tokens in existing descriptions.
-- [FP] is 4 chars; dividing the delta length by 4 gives the count.
-- GREATEST(1, ...) ensures activatable abilities without explicit [FP] tokens
-- default to 1 rather than 0.

ALTER TABLE ref_force_abilities
  ADD COLUMN IF NOT EXISTS pip_cost integer NOT NULL DEFAULT 1;

UPDATE ref_force_abilities
SET pip_cost = GREATEST(
  1,
  (
    CHAR_LENGTH(COALESCE(description, ''))
    - CHAR_LENGTH(REPLACE(COALESCE(description, ''), '[FP]', ''))
  ) / 4
);
```

- [ ] **Step 1.2: Apply the migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with:
- `name`: `060_force_ability_pip_cost`
- `query`: the full SQL from Step 1.1

- [ ] **Step 1.3: Verify the column and spot-check values**

Run this query via Supabase MCP (`mcp__supabase__execute_sql`):

```sql
SELECT key, name, pip_cost
FROM ref_force_abilities
WHERE key IN ('HEALHARMMAGNITUDE', 'HEALHARMSUCCEED', 'MOVEBASIC', 'MOVEMAGNITUDE')
ORDER BY key;
```

Expected: `HEALHARMMAGNITUDE` has `pip_cost = 2` (its description contains `[FP][FP]`). Others will vary — confirm the values look reasonable (1 or 2 for most).

- [ ] **Step 1.4: Commit the migration file**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add supabase/migrations/060_force_ability_pip_cost.sql && git commit -m "feat(db): add pip_cost column to ref_force_abilities, seed from description [FP] tokens"
```

---

## Task 2: Update Type Definitions

**Files:**
- Modify: `src/lib/types.ts:312-318`
- Modify: `src/components/player-hud/ForcePanel.tsx:40-47`

- [ ] **Step 2.1: Add pip_cost to RefForceAbility in types.ts**

In `src/lib/types.ts`, find the `RefForceAbility` interface at line 312 and replace it:

```typescript
// Before
export interface RefForceAbility {
  key: string
  name: string
  description?: string
  power_key: string
  sources?: unknown
}

// After
export interface RefForceAbility {
  key: string
  name: string
  description?: string
  power_key: string
  pip_cost?: number
  sources?: unknown
}
```

- [ ] **Step 2.2: Add pip_cost to ForceAbilityDisplay in ForcePanel.tsx**

In `src/components/player-hud/ForcePanel.tsx`, find the `ForceAbilityDisplay` interface at line 40 and replace it:

```typescript
// Before
export interface ForceAbilityDisplay {
  key:            string
  name:           string
  description?:   string
  purchasedRanks: number   // 0 = not purchased; >0 = number of ranks bought
  totalRanks:     number   // how many times this ability appears in the tree
  cost:           number   // XP cost per rank (first occurrence)
}

// After
export interface ForceAbilityDisplay {
  key:            string
  name:           string
  description?:   string
  purchasedRanks: number   // 0 = not purchased; >0 = number of ranks bought
  totalRanks:     number   // how many times this ability appears in the tree
  cost:           number   // XP cost per rank (first occurrence)
  pip_cost:       number   // Force pip activation cost
}
```

- [ ] **Step 2.3: Run build to confirm types are clean so far**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -20
```

Expected: TypeScript errors about `pip_cost` missing where `ForceAbilityDisplay` is constructed — that's `useForcePowers.ts`. Fix in next task.

- [ ] **Step 2.4: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/lib/types.ts src/components/player-hud/ForcePanel.tsx && git commit -m "feat(types): add pip_cost to RefForceAbility and ForceAbilityDisplay"
```

---

## Task 3: Thread pip_cost Through useForcePowers

**Files:**
- Modify: `src/hooks/useForcePowers.ts:13-16` (local interface)
- Modify: `src/hooks/useForcePowers.ts:108` (ability object construction)

- [ ] **Step 3.1: Update the local RefForceAbility interface**

In `src/hooks/useForcePowers.ts`, find the local `RefForceAbility` interface at line 13 and replace:

```typescript
// Before
interface RefForceAbility {
  name: string
  description?: string | null
}

// After
interface RefForceAbility {
  name: string
  description?: string | null
  pip_cost?: number | null
}
```

- [ ] **Step 3.2: Pass pip_cost into the ability display object**

In `src/hooks/useForcePowers.ts`, find line 108 (the `abilityMap.set` call) and replace:

```typescript
// Before
abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description ?? undefined, purchasedRanks: purchased, totalRanks: 1, cost })

// After
abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description ?? undefined, purchasedRanks: purchased, totalRanks: 1, cost, pip_cost: ref.pip_cost ?? 1 })
```

- [ ] **Step 3.3: Run build to confirm no type errors**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -20
```

Expected: exit 0, the `ForceAbilityDisplay` missing `pip_cost` error is resolved. If other type errors appear, fix them before continuing.

- [ ] **Step 3.4: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/hooks/useForcePowers.ts && git commit -m "feat(hook): thread pip_cost through useForcePowers into ForceAbilityDisplay"
```

---

## Task 4: Fix RollForceDiceStep — spendPip + Cost Display

**Files:**
- Modify: `src/components/force-check/steps/RollForceDiceStep.tsx`

This task makes five targeted edits to one file. Make them in order.

- [ ] **Step 4.1: Update spendPip to accept and use pipCost**

Find the `spendPip` function at line 105 and replace it:

```typescript
// Before
function spendPip(upgradeKey: string, upgradeName: string, useDark = false) {
  if (useDark) {
    if (darkPipsLeft <= 0) return
    setDarkPipsLeft(p => p - 1)
  } else {
    if (lightPipsLeft <= 0) return
    setLightPipsLeft(p => p - 1)
  }
  setSpentUpgrades(prev => new Set([...prev, upgradeKey]))
  onUpgradeActivate(upgradeName)
}

// After
function spendPip(upgradeKey: string, upgradeName: string, pipCost: number, useDark = false) {
  if (useDark) {
    if (darkPipsLeft < pipCost) return
    setDarkPipsLeft(p => p - pipCost)
  } else {
    if (lightPipsLeft < pipCost) return
    setLightPipsLeft(p => p - pipCost)
  }
  setSpentUpgrades(prev => new Set([...prev, upgradeKey]))
  onUpgradeActivate(upgradeName)
}
```

- [ ] **Step 4.2: Update canLight and canDark checks to use pip_cost**

Find these two lines inside `purchasedUpgrades.map(upgrade => {` (around line 336):

```typescript
// Before
const canLight = lightPipsLeft > 0
const canDark  = darkPipsLeft > 0 && !isDathomiri

// After
const canLight = lightPipsLeft >= upgrade.pip_cost
const canDark  = darkPipsLeft >= upgrade.pip_cost && !isDathomiri
```

- [ ] **Step 4.3: Replace hardcoded pip count in cost badge**

Find the cost badge span at line 379 and replace `1` with `{upgrade.pip_cost}`:

```tsx
// Before
<span style={{
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  color: 'color-mix(in srgb, var(--die-force) 60%, transparent)',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}}>
  1 <i className="ffi ffi-swrpg-force" aria-hidden="true" />
</span>

// After
<span style={{
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  color: 'color-mix(in srgb, var(--die-force) 60%, transparent)',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}}>
  {upgrade.pip_cost} <i className="ffi ffi-swrpg-force" aria-hidden="true" />
</span>
```

- [ ] **Step 4.4: Update the three spendPip call sites to pass pip_cost**

There are three `onClick` handlers that call `spendPip`. Update each one to pass `upgrade.pip_cost` as the third argument:

```typescript
// Dathomiri button (around line 396) — Before:
onClick={() => spendPip(upgrade.key, upgrade.name, !canLight && canDark)}
// After:
onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, !canLight && canDark)}

// Light button (around line 411) — Before:
onClick={() => spendPip(upgrade.key, upgrade.name, false)}
// After:
onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, false)}

// Dark button (around line 425) — Before:
onClick={() => spendPip(upgrade.key, upgrade.name, true)}
// After:
onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, true)}
```

- [ ] **Step 4.5: Run build**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -20
```

Expected: exit 0. Fix any TypeScript errors before continuing.

- [ ] **Step 4.6: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/components/force-check/steps/RollForceDiceStep.tsx && git commit -m "fix(force-check): use actual pip_cost per upgrade instead of hardcoded 1"
```

---

## Task 5: Show Pip Cost in SelectPowerStep Accordion

**Files:**
- Modify: `src/components/force-check/steps/SelectPowerStep.tsx`

The upgrade rows currently show `×{upgrade.purchasedRanks}` on the right. Add a pip cost badge to the left of the rank count.

- [ ] **Step 5.1: Add pip cost badge to upgrade rows**

Find the upgrade row content in `SelectPowerStep.tsx`. It looks like this:

```tsx
<span style={{
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  color: 'var(--hud-accent)',
  opacity: 0.6,
  flexShrink: 0,
}}>
  ×{upgrade.purchasedRanks}
</span>
```

Replace it with (add the pip cost badge immediately before the rank count):

```tsx
{upgrade.pip_cost > 0 && (
  <span style={{
    fontFamily: FONT_BODY,
    fontSize: FS.overline,
    color: 'color-mix(in srgb, var(--die-force) 70%, transparent)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }}>
    {upgrade.pip_cost} <i className="ffi ffi-swrpg-force" aria-hidden="true" />
  </span>
)}
<span style={{
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  color: 'var(--hud-accent)',
  opacity: 0.6,
  flexShrink: 0,
}}>
  ×{upgrade.purchasedRanks}
</span>
```

- [ ] **Step 5.2: Run build**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -20
```

Expected: exit 0.

- [ ] **Step 5.3: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/components/force-check/steps/SelectPowerStep.tsx && git commit -m "feat(force-check): show pip cost badge on upgrade rows in power select accordion"
```

---

## Task 6: Update parse-oggdude.ts for Future Re-Parses

**Files:**
- Modify: `scripts/parse-oggdude.ts`

This ensures that when the ReSpecialized Project data is loaded into OggDude XML and re-parsed, `pip_cost` is computed from the new descriptions and lands in the JSON output (which the seeder then picks up automatically).

- [ ] **Step 6.1: Add pip_cost to the ForceAbilities return object**

In `scripts/parse-oggdude.ts`, find the `parseForceAbilities` function (around line 308). Find the `return { key, name, description, power_key, sources }` object inside the `.map()` and add `pip_cost`:

```typescript
// Before
return {
  key: a.Key,
  name: a.Name,
  description: a.Description || null,
  power_key: powerKey,
  sources: sources.length ? sources : null,
}

// After
return {
  key: a.Key,
  name: a.Name,
  description: a.Description || null,
  power_key: powerKey,
  sources: sources.length ? sources : null,
  pip_cost: Math.max(1, ((a.Description ?? '').match(/\[FP\]/g) ?? []).length),
}
```

- [ ] **Step 6.2: Run build (TypeScript check on scripts)**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build 2>&1 | tail -20
```

Expected: exit 0.

- [ ] **Step 6.3: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add scripts/parse-oggdude.ts && git commit -m "feat(parser): extract pip_cost from [FP] tokens when parsing Force Abilities"
```

---

## Task 7: Verify + Final Build

- [ ] **Step 7.1: Confirm all commits landed cleanly**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git log --oneline -7
```

Expected: 6 new commits visible (migration, types, hook, RollForceDiceStep, SelectPowerStep, parser).

- [ ] **Step 7.2: Final build + TypeScript check**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build
```

Expected: exit 0, zero errors.

- [ ] **Step 7.3: Spot-check the DB values**

Run via Supabase MCP (`mcp__supabase__execute_sql`):

```sql
SELECT key, name, pip_cost
FROM ref_force_abilities
WHERE pip_cost != 1
ORDER BY pip_cost DESC
LIMIT 20;
```

Review results: abilities with `pip_cost = 2` should be ones whose descriptions start with "Spend [FP][FP]..." — e.g. Magnitude upgrades for powers like Heal/Harm. If a value looks obviously wrong, note it for the ReSpecialized Project update.

- [ ] **Step 7.4: Manual verification checklist**

Open the app, select Bylethia Ford (or any character with Force powers), open a Force Check:

| Scenario | Expected |
|---|---|
| SelectPowerStep — expand Heal/Harm | Magnitude shows `2 ✦` pip cost badge + `×N` rank count |
| SelectPowerStep — expand Move | Magnitude shows `1 ✦` (or whatever count is in description) |
| RollForceDiceStep — roll dice, see upgrades | Magnitude (Heal/Harm) shows `2 ✦` not `1 ✦` |
| RollForceDiceStep — Spend button | Spend button for a 2-pip upgrade only enables when 2+ light pips available |
| Spend a 2-pip upgrade | Light pip counter decrements by 2, not 1 |
