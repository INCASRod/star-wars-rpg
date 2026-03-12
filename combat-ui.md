# HOLOCRON — Player HUD: Update Prompt
## Feature: DM-Triggered Combat Mode + Shared Roll Feed + Hover Tooltips

---

## Overview

Three interconnected features:

1. **DM-Triggered Combat Mode** — the DM controls the global session state. When the DM starts combat, every connected player HUD transitions automatically.
2. **Shared Roll Feed** — all dice rolls (player + DM) are broadcast and visible to the whole table, persisted per session.
3. **Hover Tooltips** — every interactive element (skills, weapons, weapon qualities, armor, talents, force powers, stat values, dice symbols) shows a rich contextual tooltip on hover with rules-accurate content.

---

## PART 1 — DM-TRIGGERED COMBAT MODE

### Data Model

Add a `sessions` table (or extend existing campaign sessions):

```sql
-- sessions table (if not exists)
alter table campaigns add column if not exists session_mode text default 'exploration' check (session_mode in ('exploration', 'combat'));
alter table campaigns add column if not exists combat_round integer default 0;
alter table campaigns add column if not exists mode_changed_at timestamptz;
alter table campaigns add column if not exists mode_changed_by uuid references auth.users(id);
```

### Supabase Realtime Subscription

Every Player HUD subscribes to the campaign row on mount:

```ts
// hooks/useSessionMode.ts
export function useSessionMode(campaignId: string) {
  const [mode, setMode] = useState<'exploration' | 'combat'>('exploration');
  const [round, setRound] = useState(0);
  const [transitionPending, setTransitionPending] = useState(false);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('campaigns')
      .select('session_mode, combat_round')
      .eq('id', campaignId)
      .single()
      .then(({ data }) => {
        if (data) { setMode(data.session_mode); setRound(data.combat_round); }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`campaign-mode-${campaignId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'campaigns',
        filter: `id=eq.${campaignId}`,
      }, (payload) => {
        const newMode = payload.new.session_mode;
        const prevMode = payload.old.session_mode;
        if (newMode !== prevMode) {
          setTransitionPending(true);    // triggers cinematic transition (see below)
          setTimeout(() => {
            setMode(newMode);
            setRound(payload.new.combat_round ?? 0);
            setTransitionPending(false);
          }, 1200); // transition animation duration
        } else {
          setRound(payload.new.combat_round ?? 0);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [campaignId]);

  return { mode, round, transitionPending };
}
```

### DM Controls

The DM view has a **Session Control Panel** — a separate component from the Player HUD. It does NOT show the player character sheet. It shows:

```
┌─ SESSION CONTROL ──────────────────────────────────────────────┐
│  Campaign: Legacy of Rebellion                                  │
│  Players online: 4 / 4  ●●●●                                   │
│                                                                 │
│  Current Mode:  [ EXPLORATION ]                                 │
│                                                                 │
│  [ ⚔  BEGIN COMBAT ]                                           │
│                                                                 │
│  ─── When in Combat ──────────────────────────────────────────  │
│  Round: [ − ] 3 [ + ]      [ END ENCOUNTER ]                   │
└────────────────────────────────────────────────────────────────┘
```

DM writes to Supabase:
```ts
// Begin combat
await supabase.from('campaigns').update({
  session_mode: 'combat',
  combat_round: 1,
  mode_changed_at: new Date().toISOString(),
  mode_changed_by: dmUserId,
}).eq('id', campaignId);

// End encounter
await supabase.from('campaigns').update({
  session_mode: 'exploration',
  combat_round: 0,
  mode_changed_at: new Date().toISOString(),
}).eq('id', campaignId);
```

DM can also increment/decrement round:
```ts
await supabase.from('campaigns').update({ combat_round: newRound }).eq('id', campaignId);
```

Round number is shown in every connected Player HUD's top bar while in combat mode.

---

### Combat Transition Animation (Player Side)

When `transitionPending` becomes `true`, overlay the entire HUD with a cinematic transition:

```
Phase 1 (0–400ms):   Red scan-line wipe from top to bottom (::after pseudo-element, height animates 0→100vh)
Phase 2 (400–800ms): "COMBAT INITIATED" text flashes center screen — Cinzel 28px, red, letter-spacing 0.4em, 2 pulses
Phase 3 (800–1200ms): Scan-line retracts, HUD is now in COMBAT mode underneath
```

CSS:
```css
@keyframes combatWipe {
  0%   { transform: scaleY(0); transform-origin: top; }
  50%  { transform: scaleY(1); transform-origin: top; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

@keyframes combatFlash {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 1; }
}

.combat-transition-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(224, 80, 80, 0.15);
  pointer-events: none;
  animation: combatWipe 1.2s ease-in-out forwards;
}

.combat-initiated-text {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 9001;
  font-family: 'Cinzel', serif;
  font-size: 28px; letter-spacing: 0.4em; color: #E05050;
  text-shadow: 0 0 30px #E05050;
  animation: combatFlash 0.8s ease 0.4s 2;
}
```

Exploration-to-combat transition uses red. Combat-to-exploration uses cyan `#60C8E0` — "ENCOUNTER ENDED".

---

### Player HUD Changes in Combat Mode

When `mode === 'combat'`:
- Top bar border flashes from gold `#C8AA50` to red `#E05050` and stays red
- Top bar gains a **"COMBAT · ROUND N"** badge (red, Cinzel, pulsing dot indicator)
- Combat round syncs from Supabase — DM controls it, players see it update in real time
- Player HUD mode toggle becomes **read-only** — players cannot manually switch mode
  - Show the toggle as greyed/locked with a tooltip: "Mode controlled by GM"

---

## PART 2 — SHARED ROLL FEED

### Data Model

```sql
create table if not exists roll_log (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  character_name text not null,
  roll_label text,                     -- e.g. "Ranged (Heavy)", "Attack: E11A", "Manual Roll"
  pool jsonb not null,                 -- { proficiency: 2, ability: 1, difficulty: 2, ... }
  result jsonb not null,               -- { netSuccess, netAdvantage, triumph, despair, rolls, succeeded }
  rolled_at timestamptz default now(),
  is_dm boolean default false
);

-- Index for real-time feed
create index roll_log_campaign_idx on roll_log(campaign_id, rolled_at desc);
```

### Writing a Roll

Every `rollPool()` call in the app — whether from a skill click, weapon attack, or manual dice builder — writes to `roll_log` after resolving:

```ts
// hooks/useRollLog.ts
export async function logRoll({
  campaignId, characterId, characterName,
  label, pool, result, isDM
}: RollLogEntry) {
  await supabase.from('roll_log').insert({
    campaign_id: campaignId,
    character_id: characterId,
    character_name: characterName,
    roll_label: label,
    pool,
    result,
    is_dm: isDM,
  });
}
```

This is fire-and-forget — optimistic UI is fine, no blocking.

### Realtime Subscription

All connected clients subscribe to roll_log for their campaign:

```ts
// hooks/useRollFeed.ts
export function useRollFeed(campaignId: string) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);

  useEffect(() => {
    // Load last 20 rolls
    supabase.from('roll_log')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('rolled_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setRolls(data.reverse()); });

    // Subscribe to new rolls
    const channel = supabase
      .channel(`rolls-${campaignId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'roll_log',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        setRolls(prev => [...prev.slice(-49), payload.new as RollEntry]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [campaignId]);

  return rolls;
}
```

### Roll Feed UI — Player HUD

Add a **"Feed" tab** to the center column tab bar (5th tab, after Force):

```
[ Skills ] [ Talents ] [ Inventory ] [ Force ] [ Feed ]
```

**Feed tab layout:**
```
┌─ ROLL FEED ─────────────────────────────────────────────────────┐
│  Live table roll history                                         │
│  ─────────────────────────────────────────────────────────────  │
│  ● BX-9R "Bexar"  ·  Ranged (Heavy)  ·  2s ago                 │
│    SUCCESS  ✦ 2 Success  ◇ 1 Advantage                          │
│    [🟨][🟨][🟩][🟪][🟪]  (dice glyphs)                          │
│                                                                  │
│  ● Bylethia  ·  Perception  ·  14s ago                          │
│    FAILURE  ✗ 1 Failure  ◆ 2 Threat                             │
│    [🟨][🟩][🟩][🟪][🟪]                                          │
│                                                                  │
│  ◆ GM Roll  ·  [Hidden]  ·  1m ago                              │
│    (DM rolls show character name "GM" and label if not hidden)   │
└─────────────────────────────────────────────────────────────────┘
```

**Roll Feed Card design:**
- Each roll is a card inside a `Panel` component (same corner brackets, same glass bg)
- Header row: colored dot (green = success, red = failure) + character name (gold) + roll label (dim) + relative timestamp
- Net result row: SUCCESS/FAILURE in large Rajdhani bold, then symbol pills
- Dice row: small die shape glyphs (same `DicePip` component) showing each die face with symbol icons
- **Own rolls** get a subtle gold left border
- **DM rolls** get a purple `#9060D0` left border + "GM" label
- New rolls **slide in from bottom** with a brief opacity + translateY animation
- Max 50 entries in state, auto-purge oldest

**Roll Feed — Right Column (always visible)**

Additionally, the **right column** in both desktop and laptop breakpoints gets a mini live feed BELOW the symbol legend:

```
┌─ LATEST ROLLS ────────────────────┐
│  BX-9R · Ranged (Heavy)  · 2s     │
│  ✦✦ ◇  SUCCESS                    │
│                                   │
│  Bylethia · Perception  · 14s     │
│  ✗ ◆◆  FAILURE                    │
└───────────────────────────────────┘
```

Shows last 3 rolls. Compact — just the character name, label, symbols, outcome. Click a mini card to expand it in the Feed tab.

### DM View — Roll Feed

The DM's session panel shows the **full roll feed** prominently. DM can see every roll from every character. The DM can make their own rolls (labelled "GM Roll") with optional label and optional **"Hidden"** toggle — when hidden, players see "GM Roll · [Hidden]" with no result, but the DM sees the full result.

```sql
alter table roll_log add column if not exists hidden boolean default false;
```

Player clients: if `hidden === true` and `is_dm === true` → render the card greyed out with "[Hidden from players]" placeholder for result.

---

## PART 3 — HOVER TOOLTIPS

### Tooltip Component

Build a reusable `Tooltip` component using a portal (renders at `document.body`) to avoid z-index and overflow issues:

```tsx
// components/ui/Tooltip.tsx
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'right' | 'left';
  maxWidth?: number;
  delay?: number; // ms before showing, default 300
}
```

**Visual design:**
- Background: `rgba(4, 10, 6, 0.96)`
- Border: `1px solid rgba(200,170,80,0.32)` (gold border-hi)
- Box shadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,170,80,0.08)`
- Border radius: 8px
- Padding: 12px 14px
- Max width: 280px default
- Font: Rajdhani 12px for body, Cinzel 9px uppercase for labels
- Subtle fade-in: `opacity 0→1, translateY 4px→0` over 150ms
- Corner brackets (same as Panel component, but 6px size)
- Arrow pointer: small 6px triangle in matching border color

### Tooltip Content Map

#### Skills

```tsx
<Tooltip content={
  <SkillTooltip
    name="Ranged (Heavy)"
    characteristic="Agility"
    charValue={3}
    rank={2}
    career={true}
    description="Used for operating large, two-handed ranged weapons: blaster rifles, missile tubes, heavy repeating blasters."
    dicePool={{ proficiency: 2, ability: 1 }}
    upgradeCost={15}       // 5 × next rank (3)
    xpAvailable={30}
  />
} placement="right">
  <SkillRow ... />
</Tooltip>
```

**SkillTooltip layout:**
```
Ranged (Heavy)                        [Career]
────────────────────────────────────
CHARACTERISTIC    Agility  ●●●  (3)
CURRENT RANK      ██░░░    2 / 5
DICE POOL         🟨🟨 🟩   2 Prof + 1 Ability

Large ranged weapons: blaster rifles, missile tubes,
heavy repeating blasters.

UPGRADE TO RANK 3  →  15 XP
```

#### Weapon Stats

Wrap each stat block cell with a tooltip:

```
DAM 9
─────────────────
Base Damage
This weapon deals 9 damage on a hit, before soak.
Each net Success adds +1 damage.
Target's Soak (currently 6 for this character)
reduces incoming damage by that amount.
```

```
CRIT 3
─────────────────
Critical Rating
Spend 3 Advantage (◇◇◇) on a successful hit
to trigger a Critical Injury.
Roll d100 on the Critical Injury table.
Each existing Critical Injury on the target
adds +10 to the roll.
```

```
RANGE: Medium
─────────────────
Range Band: Medium
Engaged → Short → Medium → Long → Extreme
• Engaged: hand-to-hand distance
• Short: same room / nearby
• Medium: across a large room / courtyard
• Long: across a field / down a corridor
• Extreme: maximum effective range
Ranged (Heavy) defaults to Short range on Stun setting.
```

#### Weapon Qualities

Each quality badge gets its own tooltip. Pull from the rulebook definitions:

```
STUN SETTING
─────────────────────────────────
Active Quality
As an incidental, switch this weapon to Stun mode.
In Stun mode:
• Damage dealt as Strain, not Wounds
• Reduced by Soak normally
• Range reduced to Short (cannot be extended)
Switch back to normal mode as an incidental.
```

```
PIERCE 2
─────────────────────────────────
Passive Quality
This weapon ignores 2 points of the target's Soak.
If Pierce exceeds total Soak, Soak is fully bypassed.
Example: Pierce 2 vs Soak 2 → deals full base damage.
```

```
CUMBERSOME 3
─────────────────────────────────
Passive Quality
Requires Brawn 3 or higher to wield properly.
Your Brawn: 3  ✓ (no penalty)
For each point of Brawn below the rating,
add 1 Difficulty die (🟪) to all checks with this weapon.
```

```
SLOW-FIRING 1
─────────────────────────────────
Passive Quality
After firing, must wait 1 round before firing again.
This round: if already fired, cannot fire again.
```

```
AUTO-FIRE
─────────────────────────────────
Active Quality — costs ◇◇◇ to activate
On a successful attack, deal one additional hit.
Each additional ◇◇◇ spent = one more hit.
Each hit deals base damage + net Successes.
All hits must target the original target.
Increases difficulty by 1 when used.
```

```
VICIOUS 2
─────────────────────────────────
Passive Quality
On a Critical Injury, add +20 to the d100 roll.
Higher Critical rolls = worse injuries.
(Vicious rating × 10 added to crit roll)
```

#### Armor Stats

```
SOAK +2
─────────────────────────────────
Armor Soak Bonus
Adds 2 to your total Soak value.
Total Soak = Brawn (3) + Armor Soak (2) + other = 6
Soak reduces all incoming damage.
Wounds taken = (Damage - Soak), minimum 1 if hit.
```

```
DEF 1
─────────────────────────────────
Defense Rating
Adds 1 Defense die (🟪 upgraded to 🔴) against
attacks from ranged or melee (depending on type).
Defense = upgrade difficulty of attacks against you.
Each point upgrades 1 Difficulty to 1 Challenge.
```

#### Talents

```
LETHAL BLOWS  Rank 2  [Passive]
─────────────────────────────────────
Add +20 to any Critical Injury rolls inflicted on
opponents (Rank 2 = +10 per rank).

Stacks with Vicious weapon quality.
Always active — no activation required.
```

```
TARGETED STRIKE  Rank 1  [Maneuver]
─────────────────────────────────────
Spend 1 Advantage (◇) on a successful hit
to add +1 damage (equal to your rank in this talent).

How to activate:
1. Declare use before rolling
2. If attack hits and generates ◇: apply bonus damage
Cost: 1 Advantage per activation
```

```
STALKER  Rank 2  [Passive]
─────────────────────────────────────
Add 2 Boost dice (🔵🔵) to all Stealth and
Coordination checks (1 per rank).

Always active on those skills.
```

#### Force Powers

```
MOVE  (2/12 upgrades purchased)
─────────────────────────────────────
Basic Power: Move one silhouette 0 object within
Short range to your maximum range.
Spend 1 Force Point (○) per activation.

Roll: [Force dice equal to Force Rating]
○ = Light Side point (usable freely)
● = Dark Side point (usable, but flip Destiny Point
    and suffer Strain equal to points used)

Purchased upgrades: Strength ×1, Range ×1
→ Can move silhouette 1 objects
→ Maximum range extended by 1 band

Cost to activate: Action
```

#### Dice Symbols (symbol legend + result modal)

```
✦ SUCCESS
─────────────────
Net Successes determine whether a check passes.
Positive pool generates Successes.
Cancelled 1-for-1 by Failures (✗).
Each net Success on an attack adds +1 damage.
Need at least 1 net Success to succeed.
```

```
◇ ADVANTAGE
─────────────────
Advantages generate beneficial side effects,
independent of whether the check succeeded.
Cancelled 1-for-1 by Threats (◆).
Common spends (1 Advantage):
• Notice an important detail
• Recover 1 Strain (2 Adv)
• Give ally a Boost die
• Activate a weapon quality (varies)
```

```
★ TRIUMPH
─────────────────
Triumph = 1 Success + powerful bonus effect.
Cannot be cancelled by Failures.
Common spends:
• Ignore a Critical Injury for this check
• Introduce a story element
• Activate a powerful weapon quality
• Restore 1 used per-encounter ability
```

```
◆ THREAT
─────────────────
Threats generate negative side effects.
Cancelled 1-for-1 by Advantages (◇).
Common GM spends (1 Threat):
• Suffer 1 Strain
• Lose cover / prior maneuver benefit
• Add Setback die to next ally's check
```

```
☠ DESPAIR
─────────────────
Despair = 1 Failure + powerful negative effect.
Cannot be cancelled by Successes.
Common effects:
• Weapon runs out of ammo
• Critical hit on yourself
• Drop your weapon
• Enemy gains free attack
```

#### Characteristic Stats

```
AGILITY  3
─────────────────────────────────────
Your raw physical quickness and coordination.
Linked skills: Ranged (Heavy), Ranged (Light),
  Gunnery, Piloting (Space/Planetary), Stealth,
  Coordination, Athletics (also Brawn)

Dice formula for Agility-linked skills:
  Ability dice (🟩) = Agility value
  Some converted to Proficiency (🟨) = skill rank
  (whichever is lower becomes Proficiency)

Cannot be increased with XP after character creation
except via Dedication talent (max 6).
```

#### Wounds / Strain bars

```
WOUNDS  0 / 13
─────────────────────────────────────
Physical damage threshold.
When Wounds exceed threshold → Knocked Out
  + roll Critical Injury on d100 table.
Soak (6) reduces each hit before Wounds are taken.
Wounds minimum per hit: 1 (if attack penetrates soak).

Recovery: Medicine check at end of encounter,
  or rest (1 Wound per full rest period).
Stimpacks: recover 1-5 Wounds instantly.
```

```
STRAIN  2 / 12
─────────────────────────────────────
Mental stress and physical exertion.
When Strain exceeds threshold → Incapacitated.

Sources:
• Taking a 2nd Maneuver costs 2 Strain
• Some talents/powers cost Strain
• Threat (◆◆) from any check

Recovery: Recover all Strain at end of encounter
  (Resilience or Cool check, or automatically).
During encounter: some abilities recover Strain.
```

---

## Implementation Notes for Claude Code

### Tooltip Positioning
Use `getBoundingClientRect()` on the trigger element + `window.scrollY` to position the tooltip portal absolutely. Handle viewport edge cases — if tooltip would overflow right edge, flip to left placement.

### Performance
- Tooltips are lazy — content only renders when `visible === true`
- Use `onMouseEnter` with a `setTimeout(delay)` and `onMouseLeave` with `clearTimeout` to prevent flicker on fast cursor passes
- Do not use a tooltip on mobile (touch devices) — `useBreakpoint()` check, skip tooltip wrapper below tablet

### Tooltip Content is Static Reference Data
Weapon quality descriptions, characteristic descriptions, dice symbol explanations — these do NOT come from Supabase. Store them in:

```ts
// lib/tooltips/weaponQualities.ts
// lib/tooltips/characteristics.ts
// lib/tooltips/diceSymbols.ts
// lib/tooltips/skillDescriptions.ts
```

Dynamic data (current rank, XP cost, dice pool preview) is computed at render time from the character data already in scope.

### Wrapping existing components
Do NOT rewrite skill rows, weapon cards, or talent cards. Wrap them:

```tsx
// Before
<SkillRow skill={s} onClick={handleClick} />

// After
<Tooltip content={<SkillTooltip skill={s} char={char} />} placement="right">
  <SkillRow skill={s} onClick={handleClick} />
</Tooltip>
```

### DM Route vs Player Route
```
/campaign/[id]/dm      → DM session control panel + roll feed + all characters overview
/campaign/[id]/player  → Player HUD (existing PlayerHUDDesktop, mode read-only from subscription)
```

Both share the `useSessionMode` and `useRollFeed` hooks — same Supabase channel, same data.