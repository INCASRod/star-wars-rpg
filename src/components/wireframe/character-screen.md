# HOLOCRON — Character Select Screen Rebuild

## PROJECT CONTEXT
App: HOLOCRON — Star Wars Age of Rebellion campaign manager
Stack: Next.js · Supabase · React · Tailwind CSS
File to replace/rebuild: the existing character select / lobby screen
Campaign in DB: Legacy of Rebellion
Characters seeded: Bylethia Ford (Wrath), BX-9R "Bexar", Guy Rando, Zid Hag, Derek Caobesk

---

## DESIGN SYSTEM — APPLY WITHOUT EXCEPTION
```css
--bg-root:        #060D09;
--bg-panel:       rgba(8,16,10,0.92);
--bg-raised:      rgba(14,26,18,0.85);
--bg-input:       rgba(6,13,9,0.7);

--gold:           #C8AA50;
--gold-light:     #E8CC70;
--gold-dim:       rgba(200,170,80,0.3);

--border:         rgba(200,170,80,0.15);
--border-md:      rgba(200,170,80,0.3);
--border-hi:      rgba(200,170,80,0.55);

--brawn:     #e05252;
--agility:   #52a8e0;
--intellect: #a852e0;
--cunning:   #e0a852;
--willpower: #52e0a8;
--presence:  #e05298;

--success:  #3cb96b;
--danger:   #e05252;
--warn:     #e0a852;

--text-primary:   #E8DFC8;
--text-secondary: rgba(232,223,200,0.58);
--text-muted:     rgba(232,223,200,0.32);

--font-display: 'Cinzel', serif;
--font-body:    'Rajdhani', sans-serif;
--font-mono:    'Share Tech Mono', monospace;
```

Background: #060D09 + radial gold gradient at top + subtle crosshatch SVG pattern at 1.8% opacity
All panels: glassmorphic, backdrop-filter blur(12px), --bg-panel
Section labels: Cinzel 9px, letter-spacing 0.28em, uppercase, --gold at 65% opacity
Body text and UI copy: Rajdhani
Numbers, stats, metadata: Share Tech Mono

---

## COMPONENT: `CharacterSelectPage`
Path: `/app/page.tsx` or `/app/select/page.tsx` depending on existing routing

This is the landing/lobby screen. A player arrives here, sees all characters in the
campaign, picks their character, and is locked in. Other players see the pick in real time.

---

## LAYOUT

Full viewport, centered content column, max-width 960px, padding 48px 20px 60px.
[LOGO + TAGLINE]
[SESSION STATUS BAR]
[SECTION LABEL: Select Your Character]
[CHARACTER GRID — 2 columns on desktop, 1 on mobile]
[BOTTOM ACTIONS: Create New Character · GM Access]
[FOOTER TEXT]

---

## HEADER

Logo: Cinzel 900, ~28px, letter-spacing 0.4em, color --gold, text-shadow gold glow.
Decorative ⬡ hex icons either side of the logo (absolute positioned, muted gold).
Tagline: Share Tech Mono 11px, letter-spacing 0.3em, --text-muted, uppercase.
Thin gradient divider line below: linear-gradient(90deg, transparent, --gold-dim, transparent).
Staggered fade-down entrance animation on load.

---

## SESSION STATUS BAR

Thin horizontal pill below the header. glassmorphic panel, border --border.
Contents (flex row, space-between):
- Left: pulsing green dot + "N players online · N available" (Share Tech Mono 11px)
- Center: thin 1px vertical divider + "Session [status]" text
- Right: campaign name in Cinzel, --text-muted

Supabase Presence powers the online count (see Realtime section below).

---

## CHARACTER GRID

`display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px`

Each character renders as a `CharacterCard` component with THREE possible states:

### STATE 1 — AVAILABLE (default)
- Background: --bg-panel, border: --border
- Hover: border lifts to --border-md, card translates up 2px, subtle gold shadow
- Top gold gradient line appears on hover (opacity transition)
- Cursor: pointer
- Clickable → triggers character selection

### STATE 2 — TAKEN (selected by another player)
- opacity: 0.55, filter: grayscale(0.3), cursor: not-allowed
- Semi-transparent overlay (rgba(6,13,9,0.55)) with blur(1px) covers the card
- Centered overlay text: "● Selected by [playerName]" — Cinzel 10px, letter-spacing 0.2em,
  danger colour, danger border, danger bg tint (the taken-overlay pill)
- Avatar ring: danger colour border
- Status badge: "In Session" with pulsing red dot

### STATE 3 — SELF (this player's character)
- Border: --border-hi with gold box-shadow glow
- Top border line: solid gold gradient, always visible
- Avatar ring: gold border + gold glow
- Status badge: "You · Active" in gold with pulsing gold dot
- Cursor: default (already selected, non-interactive)

---

## CHARACTER CARD ANATOMY
┌─────────────────────────────────────────┐
│ [AVATAR 56px] [NAME]                    │
│               [career // species // player] │
│               [STATUS BADGE]            │
├─────────────────────────────────────────┤
│ CHARACTERISTICS ROW (6 cells)           │
│  BR  AG  INT  CUN  WIL  PR              │
│  [3] [4] [2]  [3]  [2]  [2]            │
├─────────────────────────────────────────┤
│ DERIVED STATS ROW                       │
│  Soak  Wounds  Strain  M.Def  R.Def  XP │
├─────────────────────────────────────────┤
│ VITALS (wound pip row + strain pip row) │
│  Wounds  ████░░░░░░░░  4/13             │
│  Strain  ██░░░░░░░░░░  2/12             │
└─────────────────────────────────────────┘

### Avatar
- 56px circle, border 2px
- Border colour: available=--border-md, taken=danger, self=--gold
- Small 14px status dot bottom-right of avatar:
  - online + not self: green pulse
  - online + self: gold pulse
  - offline: --text-muted grey, no pulse

### Identity block
- Name: Cinzel 15px bold, --text-primary (self → --gold-light)
- Career // Species // PlayerName: Share Tech Mono 10px, --text-muted, uppercase
- Status badge (see badge specs below)

### Characteristic cells
- 6-column grid, equal width
- Each cell: --bg-input bg, --border border, border-radius 3px, padding 5px 2px
- Value: Cinzel 16px bold in characteristic colour (BR=--brawn, AG=--agility etc.)
- Label: Share Tech Mono 7px, --text-muted, uppercase, letter-spacing 0.06em

### Derived stats
- Flex row of stat pills: Soak · Wounds · Strain · M.Def · R.Def · XP
- Each pill: --bg-input, --border, border-radius 3px, padding 4px 8px, min-width 42px
- Value: Cinzel 14px bold, --text-primary
- Label: Share Tech Mono 7px, --text-muted

### Vitals pip rows
- Two rows: Wounds (red pips) and Strain (amber pips)
- Each row has a header: label left, "current/max" right (Share Tech Mono 9px, --text-muted)
- Pip: 8×8px, border-radius 1px
  - Wound filled: --danger bg + border
  - Wound empty: transparent + rgba(--danger, 0.3) border
  - Strain filled: --warn bg + border
  - Strain empty: transparent + rgba(--warn, 0.3) border
- Pip count = character's wound/strain threshold from DB

### Status badges
Available  → muted border/text: "Unselected"
Taken      → danger: pulsing dot + "In Session" + player name inline below
Self       → gold: pulsing dot + "You · Active"

---

## SUPABASE — DATA & REALTIME

### Tables needed
```sql
-- character_sessions: tracks which player has claimed which character
CREATE TABLE character_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  player_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name  text NOT NULL,
  is_active    boolean DEFAULT true,
  claimed_at   timestamptz DEFAULT now(),
  UNIQUE(campaign_id, character_id)  -- one player per character
);

ALTER PUBLICATION supabase_realtime ADD TABLE character_sessions;
```

Characters table should already have these fields (add if missing):
```sql
-- On the existing characters table
-- brawn, agility, intellect, cunning, willpower, presence (int)
-- soak, wound_threshold, strain_threshold (int, derived or stored)
-- melee_defense, ranged_defense (int, default 0)
-- current_wounds, current_strain (int, default 0)
-- xp_total (int)
-- career (text), species (text), player_name (text)
-- avatar_url (text, nullable)
```

### Supabase Presence (online indicator)

Use Supabase Realtime Presence to track which players have the page open:
```typescript
// In CharacterSelectPage — on mount
const presenceChannel = supabase.channel('lobby-presence')

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    const onlinePlayerIds = Object.values(state).flat().map((p: any) => p.userId)
    setOnlinePlayers(onlinePlayerIds)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        userId: currentUser.id,
        playerName: currentUser.email, // or display name
        joinedAt: new Date().toISOString()
      })
    }
  })

// Cleanup on unmount
return () => supabase.removeChannel(presenceChannel)
```

### Realtime subscription for character_sessions
```typescript
// Subscribe to changes so all players see selections update live
const sessionsChannel = supabase
  .channel('character-sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'character_sessions',
    filter: `campaign_id=eq.${campaignId}`
  }, (payload) => {
    // Refetch or update local sessions state
    fetchSessions()
  })
  .subscribe()
```

### Selecting a character
```typescript
async function claimCharacter(characterId: string) {
  // Optimistic lock: use upsert with conflict on (campaign_id, character_id)
  const { error } = await supabase
    .from('character_sessions')
    .upsert({
      campaign_id: campaignId,
      character_id: characterId,
      player_id: currentUser.id,
      player_name: displayName,
      is_active: true
    }, {
      onConflict: 'campaign_id,character_id',
      ignoreDuplicates: true  // fails silently if already taken
    })

  if (error) {
    // Character was taken in the moment between render and click
    // Show toast: "This character was just selected by another player"
    return
  }

  // Release previously held character if any
  await supabase
    .from('character_sessions')
    .delete()
    .eq('player_id', currentUser.id)
    .eq('campaign_id', campaignId)
    .neq('character_id', characterId)

  setSelectedCharacterId(characterId)
}
```

---

## COMPONENT STRUCTURE
CharacterSelectPage (page.tsx)
├── PageHeader              — logo, tagline, divider
├── SessionStatusBar        — online count, session status, campaign name
├── CharacterGrid           — 2-col responsive grid
│   └── CharacterCard × N   — per character
│       ├── CardHeader      — avatar + identity + status badge
│       ├── CharacteristicRow — 6 cells, colour coded
│       ├── DerivedStatsRow   — soak/wounds/strain/def/xp pills
│       ├── VitalsPips        — wound + strain pip rows
│       └── TakenOverlay      — conditionally rendered if taken
└── BottomActions           — Create New Character + GM Access buttons

All components are client components (`'use client'`).
`CharacterSelectPage` fetches characters + sessions on mount, then keeps both in sync via the two Realtime subscriptions above.

---

## STATE LOGIC
```typescript
// Derive card state from data
function getCardState(
  character: Character,
  sessions: CharacterSession[],
  currentUserId: string
): 'available' | 'taken' | 'self' {
  const session = sessions.find(s => s.character_id === character.id && s.is_active)
  if (!session) return 'available'
  if (session.player_id === currentUserId) return 'self'
  return 'taken'
}

// Derive online status
function isOnline(character: Character, sessions: CharacterSession[], onlinePlayers: string[]): boolean {
  const session = sessions.find(s => s.character_id === character.id && s.is_active)
  if (!session) return false
  return onlinePlayers.includes(session.player_id)
}
```

---

## ANIMATIONS

All entrance animations use CSS (no JS animation libraries needed here):
- Header: fadeDown 0.6s ease
- Session bar: fadeDown 0.6s 0.1s ease  
- Cards: fadeUp with staggered animation-delay — card N gets delay of (0.15 + N * 0.08)s
- Bottom actions: fadeUp 0.5s 0.3s ease
```css
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## RESPONSIVE BEHAVIOUR

Desktop (≥ 768px): 2-column character grid
Mobile (< 768px):  1-column character grid, cards full width
Session bar collapses to 2 lines on mobile
Avatar stays 56px at all sizes
Characteristic cells stay 6-across (shrink gracefully, min font-size via clamp)

---

## BOTTOM ACTIONS

Two buttons, stacked, centered, max-width 360px:

1. `+ Create New Character` — gold ghost style
   - bg: rgba(200,170,80,0.12), border: --border-md, color: --gold
   - hover: bg lifts, gold glow shadow
   - onClick: navigate to /characters/new

2. `GM Access` — ghost muted style
   - bg: transparent, border: --border, color: --text-muted
   - hover: border lifts to --border-md
   - onClick: navigate to /gm or open GM auth modal

Footer: Share Tech Mono 10px, --text-muted, centered
"Edge of the Empire // Age of Rebellion // Force and Destiny"

---

## NOTES FOR IMPLEMENTATION

- Character data comes from the existing `characters` Supabase table
  filtered by `campaign_id` for the active campaign
- If `avatar_url` is null, render a species-appropriate emoji as fallback
- `current_wounds` and `current_strain` are stored values — do NOT calculate from threshold
  (players may have taken damage in a previous session)
- The `character_sessions` row should be cleaned up (is_active = false) when the
  player navigates away — use the `beforeunload` event and Supabase presence leave
- Do not allow a player to select a taken character even on double-click race conditions —
  the upsert with `ignoreDuplicates: true` handles this at the DB level
- Pip row renders exactly `wound_threshold` pips total, filling `current_wounds` of them
- After selecting a character, the "Enter Session" / continue button is NOT on this screen —
  this screen is purely the lobby. Navigation happens automatically or via a separate
  "Enter" CTA that appears once selected (optional enhancement)