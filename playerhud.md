# HOLOCRON — Desktop Player HUD
## Claude Code Implementation Prompt

---

## Project Context

You are building a **desktop Player HUD** for HOLOCRON, a Star Wars FFG/Genesys RPG campaign manager. The stack is **Next.js + Supabase + React + Tailwind**. This component is a full-viewport, always-on character sheet used during live sessions.

The reference implementation is in `PlayerHUDDesktop.jsx` (attached). Port it into the live app, wiring it to real Supabase data and adding the missing avatar feature.

---

## Design System (DO NOT DEVIATE)

```
Fonts:         Rajdhani (headers/labels) + Rajdhani (body/numbers)
Background:    #060D09
Panel bg:      rgba(8,16,10,0.82) + backdrop-filter blur(10px)
Border:        rgba(200,170,80,0.14) default / rgba(200,170,80,0.32) highlight
Text:          #C8D8C0 primary / #6A8070 dim / #2A3A2E faint
Gold accent:   #C8AA50

Characteristic colors (used consistently across ALL UI elements):
  Brawn:      #E07855
  Agility:    #4EC87A
  Intellect:  #5AAAE0
  Cunning:    #D4B840
  Willpower:  #B070D8
  Presence:   #D87060

Dice colors:
  Proficiency d12: #D4B840 (diamond shape)
  Ability d8:      #4EC87A (circle shape)
  Boost d6:        #70C8E8 (rounded rect shape)
  Challenge d12:   #E05050 (diamond shape)
  Difficulty d8:   #9060D0 (circle shape)
  Setback d6:      #707070 (rounded rect shape)

Result symbols:
  ✦ Success   #4EC87A
  ✗ Failure   #E05050
  ◇ Advantage #70C8E8
  ◆ Threat    #B060D0
  ★ Triumph   #D4B840
  ☠ Despair   #FF6060

Background effects (apply to <body> or root wrapper):
  - Repeating scanline overlay: repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.025) 4px)
  - SVG hex grid at 3% opacity using #C8AA50 stroke
  - Radial green glow top-left, radial gold glow bottom-right

Panel decoration: every Panel component gets small gold corner brackets
  (4 absolute-positioned divs, one per corner, 8×8px, border-top+border-left etc.)
```

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR  (full width, sticky, 56px, z-index 50)                │
│  [HOLOCRON logo] | [Character name · Career · Spec · Species]   │
│                  | [Wounds bar] [Strain bar] | [XP][Credits]    │
│                                              | [Soak][Player]   │
├───────────────┬────────────────────────────┬────────────────────┤
│  LEFT COLUMN  │    CENTER COLUMN           │  RIGHT COLUMN      │
│  280px fixed  │    flex: 1 (scrollable)    │  300px fixed       │
│  scrollable   │                            │  scrollable        │
│               │  [Tab bar: Skills /        │                    │
│  [AVATAR]     │   Talents / Inventory /    │  [Dice Pool        │
│               │   Force]                   │   Builder]         │
│  [Char Stats] │                            │                    │
│               │  [Tab content area]        │  [Quick Roll       │
│  [Vitals]     │                            │   (trained         │
│               │                            │   skills only)]    │
│  [Combat      │                            │                    │
│   Stats]      │                            │  [Weapons          │
│               │                            │   Quick-Ref]       │
│  [Morality]   │                            │                    │
│               │                            │  [Symbol           │
│  [Commitment] │                            │   Legend]          │
│               │                            │                    │
│  [Critical    │                            │                    │
│   Injuries]   │                            │                    │
└───────────────┴────────────────────────────┴────────────────────┘
```

**Grid definition:**
```css
display: grid;
grid-template-columns: 280px 1fr 300px;
grid-template-rows: 56px 1fr;
height: 100vh;
```

---

## Component Breakdown

### 1. Top Bar
- `position: sticky`, `z-index: 50`, `height: 56px`
- Left: HOLOCRON logo (Cinzel, gold) → divider → character name (Cinzel 13px) + career/spec/species (Rajdhani 9px uppercase)
- Right cluster: Wounds compact bar + Strain compact bar (100px wide each, 5px tall) with `current/threshold` label → divider → XP Available + Credits + Soak stat blocks → divider → Player name + Book source

### 2. Left Column — Character Identity Panel

#### 2a. Avatar Block *(NEW — currently missing)*
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   character.avatarUrl     │  │
│  │   (object-fit: cover)     │  │
│  │   aspect-ratio: 3/4       │  │
│  │   width: 100%             │  │
│  │                           │  │
│  └───────────────────────────┘  │
│  BX-9R "Bexar"                  │
│  Bounty Hunter · Assassin       │
└─────────────────────────────────┘
```
- If `character.avatarUrl` is null/empty: show a placeholder with the character's initials centered in the frame, gold border dashed, same dimensions
- Image frame: `border: 1.5px solid rgba(200,170,80,0.4)`, `border-radius: 6px`, subtle gold glow on hover
- Below image: character name (Cinzel 14px gold), then career · spec (Rajdhani 10px dim)
- **Supabase field:** `characters.avatar_url` (text, nullable) — fetch alongside other character data

#### 2b. Characteristics
- 6 stat blocks in a row: Brawn / Agility / Intellect / Cunning / Willpower / Presence
- Each: 58×58px rounded square, value in Rajdhani 30px bold, characteristic color, glow shadow
- Label below: abbreviated 3-letter uppercase (BRN / AGI / INT etc.)

#### 2c. Vitals
- Wounds bar: red `#E05050`, shows `current / threshold`, gradient fill, row of individual pips below
- Strain bar: cyan `#60C8E0`, same treatment
- Both bars: label + icon left, fraction right, 5px progress bar middle, pip row bottom

#### 2d. Combat Stats (2×2 grid)
- Soak (green), Ranged Defense (blue), Melee Defense (orange), Force Rating (blue-lavender)
- Each cell: stat value large + label small, colored background tint

#### 2e. Morality Slider
- Dark trait label (red) ← slider → Light trait label (blue)
- Numeric value center-top in gold
- 8px tall gradient track, gold dot indicator at `morality.value%` position

#### 2f. Commitment (side-by-side)
- Duty card: type label + value in gold
- Obligation card: type label + value in orange `#E07855`

#### 2g. Critical Injuries
- Empty state: "No Active Injuries" centered faint text
- Populated: red-tinted cards, injury name + effect text

---

### 3. Center Column — Tabbed Content

#### Tab Bar
- `border-bottom: 1px solid border-color`
- 4 tabs: **Skills · Talents · Inventory · Force**
- Active tab: gold color + 2px gold bottom border
- Inactive: dim color, no border
- Tab switch triggers `tabIn` fade animation (`opacity 0 → 1, translateY 5px → 0`)

#### Tab: Skills
- Filter bar: All / Trained / Career (pill buttons)
- Legend top-right: proficiency square, ability circle, career indicator
- **2-column grid** of characteristic group panels
- Each group panel:
  - Header: characteristic value square (colored) + characteristic name
  - Skill rows: name (left) → 5 rank pips → dice pool preview (proficiency squares + ability circles)
  - Clicking any row fires skill roll → opens DiceModal
  - Career skills get colored left border
  - Hover: gold tinted background

#### Tab: Talents
- Grouped by activation type: Passive / Incidental / Maneuver / Active
- Section label for each group
- Auto-fill grid `repeat(auto-fill, minmax(280px, 1fr))`
- Each talent card: name + rank badge + activation type pill + effect description
- Left border accent colored by activation type

#### Tab: Inventory
- Encumbrance summary bar at top (current / threshold)
- Weapons section: full stat cards (Damage / Crit / Range / Enc / HP), quality badges, equipped indicator
- Armor section: Soak / Defense / Enc / HP / Rarity cards, equipped indicator

#### Tab: Force
- Force Rating (large number, blue)
- Morality detail panel with full slider
- Force Powers list with progress bars (purchased / total upgrades)

---

### 4. Right Column — Combat Tools

#### 4a. Dice Pool Builder
- Section label: "Dice Pool"
- **Positive dice row** (Proficiency / Ability / Boost): square/circle/rounded buttons, click to add, count badge appears top-right when >0, minus button appears below when >0
- Divider line
- **Negative dice row** (Challenge / Difficulty / Setback): same treatment
- **Difficulty preset buttons**: Easy / Average / Hard / Daunting / Formidable (sets difficulty die count)
- **ROLL N DICE** button: gold gradient, Cinzel font, disabled when pool is empty, hover lifts
- **Clear Pool** button: ghost style

#### 4b. Quick Roll
- Shows only trained skills (rank > 0)
- Each row: skill name + dice pool preview (proficiency + ability pips)
- Colored left border matching characteristic color
- Click fires immediate roll → DiceModal

#### 4c. Weapons Quick-Ref
- Equipped weapons only
- Each card: weapon name, DMG / CRIT / RNG stats, Roll Attack button (fires roll using linked skill pool)

#### 4d. Symbol Legend
- 2-column grid: icon + name for all 6 symbols
- Icon colored with glow effect

---

### 5. Dice Result Modal
- Full-screen backdrop (blur + dark overlay), click outside to dismiss, Escape key to dismiss
- SUCCESS (green) or FAILURE (red) headline — Cinzel 34px, glow
- Net result pills: Success/Failure count, Advantage/Threat count, Triumph, Despair
- Individual die results grid: each die rendered as colored shape showing its face symbols
- Blank faces shown as "—"
- Advantage spending hints panel (if net advantage > 0): blue tint, bullet suggestions
- Threat hints panel (if net threat > 0): purple tint, GM spending hints
- Dismiss button at bottom

---

## Dice Engine (port exactly as-is)

```js
const DICE_FACES = {
  proficiency: [[], ["S"], ["S"], ["SS"], ["SS"], ["A"], ["SA"], ["SA"], ["SA"], ["AA"], ["AA"], ["T"]],
  ability:     [[], ["S"], ["S"], ["SS"], ["A"], ["A"], ["SA"], ["AA"]],
  boost:       [[], [], ["S"], ["SA"], ["AA"], ["A"]],
  challenge:   [[], ["F"], ["F"], ["FF"], ["FF"], ["H"], ["H"], ["FH"], ["FH"], ["HH"], ["HH"], ["D"]],
  difficulty:  [[], ["F"], ["FF"], ["H"], ["H"], ["H"], ["HH"], ["FH"]],
  setback:     [[], [], ["F"], ["F"], ["H"], ["H"]],
};
// S=success F=failure A=advantage H=threat T=triumph D=despair
// Triumph counts as 1 success + special. Despair counts as 1 failure + special.
// Net result: (success - failure), (advantage - threat). Both resolve independently.
```

Skill pool formula:
```js
const charVal = character.characteristics[skill.characteristic];
const proficiency = Math.min(charVal, skill.rank);
const ability = Math.abs(charVal - skill.rank);
// Default difficulty for quick rolls: 2 difficulty dice (Average)
```

---

## Supabase Integration

### Data fetching
Wire to the existing `useCharacterData` hook. The hook should expose:

```ts
{
  character: Character,       // base stats, name, career, species, etc.
  skills: Skill[],            // with rank + career flag
  talents: Talent[],          // purchased only, with activation type
  weapons: Weapon[],          // with equipped flag
  armor: Armor[],
  forcePowers: ForcePower[],  // with purchased count
}
```

### Avatar field (NEW)
- Table: `characters`
- Column: `avatar_url` (text, nullable)
- Storage bucket: `character-avatars` (Supabase Storage)
- The HUD reads `character.avatar_url` — if null, show placeholder initials block
- Upload is handled elsewhere (character edit screen), not in this HUD
- **Do not implement upload UI in this component** — read-only display only

### Character ID
Passed as a prop: `<PlayerHUDDesktop characterId="..." />`

---

## File Structure

```
components/
  player-hud/
    PlayerHUDDesktop.tsx       ← main component (port from .jsx reference)
    DiceModal.tsx              ← extracted modal
    DiceRoller.tsx             ← extracted right-panel roller
    SkillsPanel.tsx            ← center tab
    TalentsPanel.tsx           ← center tab
    InventoryPanel.tsx         ← center tab
    ForcePanel.tsx             ← center tab
    CharacterAvatar.tsx        ← NEW component (see spec above)
    dice-engine.ts             ← pure functions, no React
    design-tokens.ts           ← C object + DICE_META + SYM_* constants
```

---

## CharacterAvatar Component Spec (NEW)

```tsx
// props
interface CharacterAvatarProps {
  avatarUrl: string | null;
  characterName: string;
  career: string;
  spec: string;
}
```

**Render logic:**
1. If `avatarUrl` is a valid string → render `<img>` with `object-fit: cover`, `aspect-ratio: 3/4`, `width: 100%`, gold border, border-radius 6px
2. If null/empty → render placeholder div, same dimensions, dark background `rgba(200,170,80,0.06)`, dashed gold border `rgba(200,170,80,0.3)`, centered initials in Cinzel 28px gold (first letter of each word in name, max 2 chars)
3. Below the frame in both cases: character name (Cinzel 13px #C8AA50) + `career · spec` (Rajdhani 10px #6A8070)
4. Entire block wrapped in a `Panel` component matching the rest of the left column

---

## Notes for Claude Code

- Use the attached `PlayerHUDDesktop.jsx` as the exact visual and behavioral reference
- Do not introduce new UI patterns — match what's there precisely
- All inline styles from the reference should be migrated to Tailwind where possible, but retain inline styles for dynamic values (colors from tokens, widths, transforms)
- `Cinzel` and `Rajdhani` are loaded via Google Fonts — ensure they're in `_document.tsx` or `layout.tsx`
- The scanline and hex grid background effects must be preserved — they're part of the brand
- TypeScript strict mode — type all props and data shapes
- No new dependencies required beyond what's already in the project