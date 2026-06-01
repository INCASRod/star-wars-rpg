# GM Purchase Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write a GM-only roll feed entry each time a player purchases a skill rank, talent, force power, or specialization — and let the GM click ↺ on any entry to revert the purchase and restore XP.

**Architecture:** A new `logPurchaseNotification` helper writes directly to `roll_log` with `hidden: true` and `roll_type: 'XP Purchase'`. The GM-side `useGmPurchaseRefund` hook reads `roll_meta` from the entry and executes the appropriate DB reversal. `useRollFeed` gains an UPDATE subscription so refunded entries re-render in place.

**Tech Stack:** Next.js 14, React 18, Supabase (postgres_changes realtime), TypeScript

---

### Task 1: Add `PurchaseMeta` type and `logPurchaseNotification` to logRoll.ts

**Files:**
- Modify: `src/lib/logRoll.ts`

- [ ] **Step 1: Add the `PurchaseMeta` interface and `logPurchaseNotification` export**

Open `src/lib/logRoll.ts`. Add the following at the end of the file (after the existing `logRoll` function):

```typescript
export interface PurchaseMeta {
  purchase_type:     'skill' | 'talent' | 'force' | 'specialization'
  xp_cost:           number
  refunded:          boolean
  // skill
  skill_key?:        string
  prev_rank?:        number
  new_rank?:         number
  // talent
  talent_id?:        string   // character_talents row UUID — deleted on refund
  talent_key?:       string
  stat_delta?:       Record<string, number>  // character stat changes to reverse
  // force power
  force_ability_id?: string   // character_force_abilities row UUID — deleted on refund
  force_power_key?:  string
  force_ability_key?: string
  // specialization
  specialization_key?: string
}

/** Fire-and-forget. Writes a GM-only system entry to roll_log for an XP purchase. */
export function logPurchaseNotification({
  campaignId,
  characterId,
  characterName,
  label,
  meta,
}: {
  campaignId:    string
  characterId:   string
  characterName: string
  label:         string
  meta:          PurchaseMeta
}): void {
  const supabase = createClient()
  supabase.from('roll_log').insert({
    campaign_id:    campaignId,
    character_id:   characterId,
    character_name: characterName,
    roll_label:     label,
    roll_type:      'XP Purchase',
    alignment:      'system',
    hidden:         true,
    is_dm:          false,
    pool:           { proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
    result:         { netSuccess: 0, netAdvantage: 0, triumph: 0, despair: 0, succeeded: false },
    roll_meta:      meta,
  }).then(({ error }) => {
    if (error) console.warn('[logPurchaseNotification] failed:', error.message)
  })
}
```

- [ ] **Step 2: Commit**

```
git add src/lib/logRoll.ts
git commit -m "feat(logRoll): add PurchaseMeta type and logPurchaseNotification helper"
```

---

### Task 2: Add UPDATE subscription to useRollFeed

**Files:**
- Modify: `src/hooks/useRollFeed.ts`

- [ ] **Step 1: Chain an UPDATE handler onto the existing channel**

The current channel in `src/hooks/useRollFeed.ts` (lines 53–63) only handles INSERT. Add an UPDATE handler so that when a roll_log row's `roll_meta` changes (e.g. `refunded: true`), the local state is patched in place.

Replace the channel setup block:

```typescript
// Before
const channel = supabase
  .channel(`rolls-${campaignId}`)
  .on('postgres_changes', {
    event:  'INSERT',
    schema: 'public',
    table:  'roll_log',
    filter: `campaign_id=eq.${campaignId}`,
  }, (payload) => {
    setRolls(prev => [...prev.slice(-49), payload.new as RollEntry])
  })
  .subscribe()
```

```typescript
// After
const channel = supabase
  .channel(`rolls-${campaignId}`)
  .on('postgres_changes', {
    event:  'INSERT',
    schema: 'public',
    table:  'roll_log',
    filter: `campaign_id=eq.${campaignId}`,
  }, (payload) => {
    setRolls(prev => [...prev.slice(-49), payload.new as RollEntry])
  })
  .on('postgres_changes', {
    event:  'UPDATE',
    schema: 'public',
    table:  'roll_log',
    filter: `campaign_id=eq.${campaignId}`,
  }, (payload) => {
    setRolls(prev =>
      prev.map(e => e.id === (payload.new as RollEntry).id ? (payload.new as RollEntry) : e)
    )
  })
  .subscribe()
```

- [ ] **Step 2: Commit**

```
git add src/hooks/useRollFeed.ts
git commit -m "feat(useRollFeed): subscribe to roll_log UPDATE for in-place refund rendering"
```

---

### Task 3: Log notification in handleBuySkill

**Files:**
- Modify: `src/hooks/useCharacterData.ts` (line ~205 — `handleBuySkill`)

- [ ] **Step 1: Add import at top of file**

At the top of `src/hooks/useCharacterData.ts`, add to the existing imports:

```typescript
import { logPurchaseNotification } from '@/lib/logRoll'
```

- [ ] **Step 2: Add notification call after the Promise.all in handleBuySkill**

`handleBuySkill` ends at around line 222. After the closing `])` of `Promise.all`, add:

```typescript
  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label:         `Rank ${newRank} of ${refSkillMap[skillKey]?.name ?? skillKey}`,
    meta: {
      purchase_type: 'skill',
      xp_cost:       cost,
      refunded:      false,
      skill_key:     skillKey,
      prev_rank:     currentRank,
      new_rank:      newRank,
    },
  })
```

The full updated handler looks like:

```typescript
const handleBuySkill = async (skillKey: string, currentRank: number, isCareer: boolean) => {
  if (!character) return
  markSelf()
  const newRank = currentRank + 1
  if (newRank > 5) return
  const cost = newRank * 5 + (isCareer ? 0 : 5)
  if (character.xp_available < cost) return

  const newXp = character.xp_available - cost
  setCharacter({ ...character, xp_available: newXp })
  setSkills(prev => prev.map(s => s.skill_key === skillKey ? { ...s, rank: newRank } : s))

  await Promise.all([
    supabase.from('character_skills').update({ rank: newRank }).eq('character_id', character.id).eq('skill_key', skillKey),
    supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought skill rank: ${skillKey} ${newRank}` }),
  ])

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label:         `Rank ${newRank} of ${refSkillMap[skillKey]?.name ?? skillKey}`,
    meta: {
      purchase_type: 'skill',
      xp_cost:       cost,
      refunded:      false,
      skill_key:     skillKey,
      prev_rank:     currentRank,
      new_rank:      newRank,
    },
  })
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no errors on `useCharacterData.ts` or `logRoll.ts`.

- [ ] **Step 4: Commit**

```
git add src/hooks/useCharacterData.ts
git commit -m "feat(useCharacterData): log GM notification on skill rank purchase"
```

---

### Task 4: Log notification in handlePurchaseTalent

**Files:**
- Modify: `src/hooks/useCharacterData.ts` (line ~478 — `handlePurchaseTalent`)

- [ ] **Step 1: Add notification call after the Promise.all**

`handlePurchaseTalent` currently returns `newId` at the end (line ~503). Add the notification just before the `return newId` statement.

`talents` in the handler closure refers to state at the time the handler was invoked (before `setTalents`), so counting existing entries gives the rank being purchased.

```typescript
  // After await Promise.all([...]) and before return newId

  const existingRankCount = talents.filter(t => t.talent_key === talentKey).length
  const talentRank        = existingRankCount + 1
  const talentName        = refTalentMap[talentKey]?.name ?? talentKey
  const label             = talentRank > 1 ? `${talentName} (Rank ${talentRank})` : talentName

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label,
    meta: {
      purchase_type: 'talent',
      xp_cost:       cost,
      refunded:      false,
      talent_id:     newId,
      talent_key:    talentKey,
      stat_delta:    statUpdates as Record<string, number>,
    },
  })

  return newId
```

The full updated handler:

```typescript
const handlePurchaseTalent = async (talentKey: string, row: number, col: number, activeSpecKey: string) => {
  if (!character) return
  markSelf()
  const cost = (row + 1) * 5
  if (character.xp_available < cost) return

  const statUpdates = applyTalentModifiers(talentKey, 1)
  const newXp = character.xp_available - cost
  const newId = randomUUID()
  setCharacter({ ...character, xp_available: newXp, ...statUpdates })
  setTalents(prev => [...prev, {
    id: newId, character_id: character.id, talent_key: talentKey,
    specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
  }])

  await Promise.all([
    supabase.from('character_talents').insert({
      id: newId,
      character_id: character.id, talent_key: talentKey,
      specialization_key: activeSpecKey, tree_row: row, tree_col: col, ranks: 1, xp_cost: cost,
    }),
    supabase.from('characters').update({ xp_available: newXp, ...statUpdates }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought talent: ${talentKey} (row ${row})` }),
  ])

  const existingRankCount = talents.filter(t => t.talent_key === talentKey).length
  const talentRank        = existingRankCount + 1
  const talentName        = refTalentMap[talentKey]?.name ?? talentKey
  const label             = talentRank > 1 ? `${talentName} (Rank ${talentRank})` : talentName

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label,
    meta: {
      purchase_type: 'talent',
      xp_cost:       cost,
      refunded:      false,
      talent_id:     newId,
      talent_key:    talentKey,
      stat_delta:    statUpdates as Record<string, number>,
    },
  })

  return newId
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```
git add src/hooks/useCharacterData.ts
git commit -m "feat(useCharacterData): log GM notification on talent purchase or ranked upgrade"
```

---

### Task 5: Log notification in handlePurchaseForceAbility

**Files:**
- Modify: `src/hooks/useCharacterData.ts` (line ~558 — `handlePurchaseForceAbility`)

- [ ] **Step 1: Extract UUID and pass it to the DB insert**

Currently the optimistic state update creates a local `randomUUID()` but the DB insert does not specify `id` (line ~572). Fix this and capture the ID for the notification.

Full updated handler:

```typescript
const handlePurchaseForceAbility = async (abilityKey: string, row: number, col: number, cost: number, activeForcePowerKey: string) => {
  if (!character) return
  if (character.xp_available < cost) return
  markSelf()

  const newId = randomUUID()
  const newXp = character.xp_available - cost
  setCharacter({ ...character, xp_available: newXp })
  setCharForceAbilities(prev => [...prev, {
    id: newId, character_id: character.id,
    force_power_key: activeForcePowerKey, force_ability_key: abilityKey,
    tree_row: row, tree_col: col, xp_cost: cost,
  }])

  await Promise.all([
    supabase.from('character_force_abilities').insert({
      id:                newId,
      character_id:      character.id,
      force_power_key:   activeForcePowerKey,
      force_ability_key: abilityKey,
      tree_row:          row,
      tree_col:          col,
      xp_cost:           cost,
    }),
    supabase.from('characters').update({ xp_available: newXp }).eq('id', character.id),
    supabase.from('xp_transactions').insert({ character_id: character.id, amount: -cost, reason: `Bought force ability: ${abilityKey}` }),
  ])

  const existingCount = charForceAbilities.filter(
    a => a.force_ability_key === abilityKey && a.force_power_key === activeForcePowerKey
  ).length
  const abilityRank = existingCount + 1
  const powerName   = refForcePowerMap[activeForcePowerKey]?.name ?? activeForcePowerKey
  const abilityName = refForceAbilityMap[abilityKey]?.name ?? abilityKey
  const label       = abilityRank > 1
    ? `${powerName} — ${abilityName} (Rank ${abilityRank})`
    : `${powerName} — ${abilityName}`

  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label,
    meta: {
      purchase_type:     'force',
      xp_cost:           cost,
      refunded:          false,
      force_ability_id:  newId,
      force_power_key:   activeForcePowerKey,
      force_ability_key: abilityKey,
    },
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```
git add src/hooks/useCharacterData.ts
git commit -m "feat(useCharacterData): log GM notification on force power purchase, align force ability UUID"
```

---

### Task 6: Log notification in handleBuySpecialization

**Files:**
- Modify: `src/hooks/useCharacterData.ts` (line ~764 — `handleBuySpecialization`)

- [ ] **Step 1: Add notification call after the Promise.all**

`handleBuySpecialization` ends with `toast.success(...)` at line ~792. Add the notification just before that toast line:

```typescript
  logPurchaseNotification({
    campaignId:    character.campaign_id,
    characterId:   character.id,
    characterName: character.name,
    label:         `${refSpecMap[specKey]?.name ?? specKey} Specialization`,
    meta: {
      purchase_type:      'specialization',
      xp_cost:            cost,
      refunded:           false,
      specialization_key: specKey,
    },
  })
  toast.success(`Purchased ${refSpecMap[specKey]?.name || specKey}!`)
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```
git add src/hooks/useCharacterData.ts
git commit -m "feat(useCharacterData): log GM notification on specialization purchase"
```

---

### Task 7: Create useGmPurchaseRefund hook

**Files:**
- Create: `src/hooks/useGmPurchaseRefund.ts`

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useGmPurchaseRefund.ts` with the following content:

```typescript
'use client'

import { createClient }           from '@/lib/supabase/client'
import type { RollEntry }         from '@/hooks/useRollFeed'
import type { PurchaseMeta }      from '@/lib/logRoll'

export function useGmPurchaseRefund() {
  const supabase = createClient()

  async function handleRefundPurchase(entry: RollEntry): Promise<void> {
    const meta = entry.roll_meta as PurchaseMeta | null
    if (!meta || meta.refunded || !entry.character_id) return

    // Fetch current character stats needed for reversal
    const { data: char } = await supabase
      .from('characters')
      .select('*')
      .eq('id', entry.character_id)
      .single()
    if (!char) return

    // Reverse any stat changes stored in stat_delta (talent purchases only)
    const statReversal: Record<string, number> = {}
    if (meta.stat_delta) {
      for (const [key, delta] of Object.entries(meta.stat_delta)) {
        const current = (char as Record<string, unknown>)[key]
        if (typeof current === 'number') {
          statReversal[key] = current - delta
        }
      }
    }

    const ops: Promise<unknown>[] = [
      // Restore XP (and reverse any stat changes)
      supabase.from('characters')
        .update({ xp_available: (char.xp_available as number) + meta.xp_cost, ...statReversal })
        .eq('id', entry.character_id),
      // Record the refund in xp_transactions for audit trail
      supabase.from('xp_transactions').insert({
        character_id: entry.character_id,
        amount:       meta.xp_cost,
        reason:       `GM refund: ${entry.roll_label ?? 'purchase'}`,
      }),
      // Mark the roll_log entry as refunded (triggers UPDATE realtime event)
      supabase.from('roll_log')
        .update({ roll_meta: { ...meta, refunded: true } })
        .eq('id', entry.id),
    ]

    // Remove the purchased item from its table
    if (meta.purchase_type === 'skill' && meta.skill_key != null && meta.prev_rank != null) {
      ops.push(
        supabase.from('character_skills')
          .update({ rank: meta.prev_rank })
          .eq('character_id', entry.character_id)
          .eq('skill_key', meta.skill_key)
      )
    } else if (meta.purchase_type === 'talent' && meta.talent_id) {
      ops.push(
        supabase.from('character_talents').delete().eq('id', meta.talent_id)
      )
    } else if (meta.purchase_type === 'force' && meta.force_ability_id) {
      ops.push(
        supabase.from('character_force_abilities').delete().eq('id', meta.force_ability_id)
      )
    } else if (meta.purchase_type === 'specialization' && meta.specialization_key) {
      ops.push(
        supabase.from('character_specializations')
          .delete()
          .eq('character_id', entry.character_id)
          .eq('specialization_key', meta.specialization_key)
      )
    }

    await Promise.all(ops)
  }

  return { handleRefundPurchase }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Check roll_log UPDATE RLS**

The refund writes `supabase.from('roll_log').update(...)`. Supabase RLS may restrict updates to this table. Open the Supabase dashboard → Authentication → Policies → `roll_log` table and confirm there is an UPDATE policy that allows the authenticated user. If one is missing, add:

```sql
CREATE POLICY "Allow update on own campaign roll_log"
ON roll_log FOR UPDATE
USING (true)  -- adjust to your auth pattern, e.g. auth.uid() = ...
WITH CHECK (true);
```

If the app uses service-role key for mutations, this step may not be needed.

- [ ] **Step 4: Commit**

```
git add src/hooks/useGmPurchaseRefund.ts
git commit -m "feat(useGmPurchaseRefund): hook to revert XP purchases and mark roll_log entry as refunded"
```

---

### Task 8: Add XP Purchase rendering to RollFeedPanel

**Files:**
- Modify: `src/components/player-hud/RollFeedPanel.tsx`

- [ ] **Step 1: Add the `PurchaseMeta` import**

At the top of `RollFeedPanel.tsx`, add to the existing imports:

```typescript
import type { PurchaseMeta } from '@/lib/logRoll'
```

- [ ] **Step 2: Add `onRefundPurchase` to the component's props**

The `RollFeedPanel` export currently starts at line ~545. Update the props type:

```typescript
export function RollFeedPanel({
  rolls,
  ownCharacterId,
  isGm = false,
  onRefundPurchase,
}: {
  rolls:              RollEntry[]
  ownCharacterId:     string
  isGm?:             boolean
  onRefundPurchase?: (entry: RollEntry) => void
}) {
```

- [ ] **Step 3: Update `SystemRow` signature to accept the new props**

`SystemRow` is defined at around line 444. Change its signature and add the XP Purchase branch:

```typescript
function SystemRow({
  roll,
  isGm,
  onRefundPurchase,
}: {
  roll:              RollEntry
  isGm:             boolean
  onRefundPurchase?: (entry: RollEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const label   = roll.roll_label ?? 'System Message'
  const isLong  = label.length > SYSTEM_LONG_THRESHOLD

  // ── XP Purchase ───────────────────────────────────────────────────
  if (roll.roll_type === 'XP Purchase') {
    const meta       = roll.roll_meta as PurchaseMeta | null
    const isRefunded = meta?.refunded === true
    return (
      <div
        className="flex items-center"
        style={{
          padding:  '3px var(--space-1)',
          gap:      4,
          opacity:  isRefunded ? 0.45 : 1,
          fontFamily: FONT_BODY,
          fontSize: FS.overline,
        }}
      >
        <span style={{ color: HUD.textFaint }}>⬆</span>
        <span style={{ color: HUD.text }}>{roll.character_name}</span>
        <span style={{ color: HUD.textFaint }}>purchased</span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: HUD.text }}>
          {roll.roll_label}
        </span>
        {meta?.xp_cost != null && !isRefunded && (
          <span style={{ color: HUD.textFaint, whiteSpace: 'nowrap' }}>· {meta.xp_cost}xp</span>
        )}
        {isRefunded ? (
          <span style={{ color: HUD.textFaint, fontStyle: 'italic', whiteSpace: 'nowrap' }}>[REFUNDED]</span>
        ) : isGm && onRefundPurchase ? (
          <button
            onClick={() => onRefundPurchase(roll)}
            title={
              meta?.purchase_type === 'talent'
                ? 'Revert purchase and restore XP — note: may affect adjacent talents in tree'
                : 'Revert purchase and restore XP'
            }
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              color:       HUD.textFaint,
              fontFamily:  FONT_BODY,
              fontSize:    FS.sm,
              padding:     '0 2px',
              lineHeight:  1,
              flexShrink:  0,
            }}
          >
            ↺
          </button>
        ) : null}
      </div>
    )
  }

  // ── Item Award ────────────────────────────────────────────────────
  if (roll.roll_type === 'Item Award') {
    // ... existing Item Award branch unchanged ...
  }

  // ── Generic system message ────────────────────────────────────────
  return (
    // ... existing generic branch unchanged ...
  )
}
```

**Important:** keep the existing `Item Award` and generic branches exactly as they are — only the function signature and the new `XP Purchase` branch at the top change.

- [ ] **Step 4: Update the `SystemRow` call sites in the render loop**

`SystemRow` is called at approximately line 592 inside the render loop. It currently passes only `roll`. Update it to pass the new props:

Find:
```typescript
nodes.push(<SystemRow key={roll.id} roll={roll} />)
```

Replace with:
```typescript
nodes.push(
  <SystemRow
    key={roll.id}
    roll={roll}
    isGm={isGm}
    onRefundPurchase={onRefundPurchase}
  />
)
```

- [ ] **Step 5: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```
git add src/components/player-hud/RollFeedPanel.tsx
git commit -m "feat(RollFeedPanel): render XP Purchase entries with revert button for GM"
```

---

### Task 9: Wire refund handler in GmShell

**Files:**
- Modify: `src/app/gm/GmShell.tsx`

- [ ] **Step 1: Import the hook**

At the top of `src/app/gm/GmShell.tsx`, add:

```typescript
import { useGmPurchaseRefund } from '@/hooks/useGmPurchaseRefund'
```

- [ ] **Step 2: Instantiate the hook inside the component**

Inside the `GmShell` component body (near where other hooks are called), add:

```typescript
const { handleRefundPurchase } = useGmPurchaseRefund()
```

- [ ] **Step 3: Pass the handler to RollFeedPanel**

Line 460 currently reads:

```typescript
<RollFeedPanel rolls={rolls} ownCharacterId="gm" isGm={true} />
```

Update to:

```typescript
<RollFeedPanel
  rolls={rolls}
  ownCharacterId="gm"
  isGm={true}
  onRefundPurchase={handleRefundPurchase}
/>
```

- [ ] **Step 4: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 5: Smoke-test the full flow**

Start the dev server (`npm run dev`) and:

1. Open a player's character sheet. Navigate to the Skills panel and purchase a skill rank. Switch to the GM view and confirm a new `⬆ {name} purchased Rank N of {skill} · {xp}xp` entry appears in the Roll Feed with a ↺ button.
2. Click ↺. Confirm the entry changes to `[REFUNDED]` and the player's XP is restored on their sheet.
3. Purchase a talent. Confirm the entry reads the talent display name (e.g. `Toughened`). Purchase it again and confirm `Toughened (Rank 2)`. Revert — confirm the second talent row is deleted and XP is restored.
4. Purchase a force power upgrade. Confirm the entry reads `{Power Name} — {Ability Name}`.
5. Purchase a new specialization. Confirm the entry reads `{Spec Name} Specialization`.
6. Open a player's character sheet (not the GM view) and confirm **none** of these entries appear in the player's roll feed.

- [ ] **Step 6: Commit**

```
git add src/app/gm/GmShell.tsx
git commit -m "feat(GmShell): wire useGmPurchaseRefund to RollFeedPanel"
```
