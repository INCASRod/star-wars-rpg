# HOLOCRON - Star Wars RPG Campaign Manager
## Claude Code Project Brief & Technical Specification

---

## 1. PROJECT OVERVIEW

**HOLOCRON** is a web-based campaign management tool for the FFG/Genesys Star Wars RPG system (Edge of the Empire, Age of Rebellion, Force and Destiny). It replaces the desktop-only OggDude Character Generator with a modern, multiplayer web app where both GMs and players can manage characters in real-time.

### Core Value Proposition
- GM controls everything from a single dashboard, distributing loot, modifying stats, managing encounters
- Players manage their own characters: spend XP, buy talents, track wounds/strain, swap equipment
- Real-time persistence via Supabase so changes sync across devices
- Beautiful Star Wars-themed UI that feels like an in-universe datapad

---

## 2. TECH STACK

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14+ (App Router)** | SSR for SEO, API routes for Supabase, React Server Components |
| Styling | **Tailwind CSS + custom CSS** | Utility-first with custom Star Wars design tokens |
| Visual Effects | **Three.js / WebGL** | Holographic glow effects, particle backgrounds, bloom shaders |
| Database | **Supabase (Postgres + Auth + Storage + Realtime)** | Existing INCAS stack, RLS for permissions, realtime subscriptions |
| Game Data | **OggDude XML Dataset** → parsed to JSON → seeded into Supabase | 119 species, 20 careers, 131 specializations, thousands of items |
| State | **Zustand** or **React Context** | Lightweight client state for UI, Supabase for persistence |
| Image Upload | **Supabase Storage** | Character portrait uploads |
| Deployment | **Vercel** | Zero-config Next.js deployment |
| MCP | https://mcp.supabase.com/mcp?project_ref=peodenvcchftqqtikdhx |
---

## 3. OGGDUDE DATA PIPELINE

### 3.1 Source Data Structure
The OggDude dataset (`https://github.com/Septaris/OggDudes-Custom-Dataset-SW`) contains XML files:

```
DataCustom/
├── Species/           # 119 XML files (Human.xml, Bothan.xml, etc.)
├── Careers/           # 20 XML files (Bounty Hunter.xml, etc.)
├── Specializations/   # 131 XML files (Assassin.xml, etc.)
├── Skills.xml         # All skills with CharKey (BR, AG, INT, CUN, WIL, PR)
├── Talents.xml        # All talents with activation types, descriptions
├── Weapons.xml        # All weapons with damage, crit, range, qualities
├── Armor.xml          # Armor with soak, defense, encumbrance
├── Gear.xml           # General gear/equipment
├── Moralities.xml     # Strength/Weakness pairs
├── Obligations.xml    # Obligation types
├── Duty.xml           # Duty types
├── ItemAttachments.xml # Weapon/armor mods
├── ItemDescriptors.xml # Weapon qualities (Pierce, Stun, etc.)
├── Characteristics.xml # The 6 characteristics
├── Force Abilities.xml # Force powers (for F&D)
└── Force Powers/       # Individual force power trees
```

### 3.2 XML Schema (Key Examples)

**Species XML:**
```xml
<Species>
  <Key>HUMAN</Key>
  <n>Human</n>
  <Description>...</Description>
  <StartingChars>
    <Brawn>2</Brawn><Agility>2</Agility><Intellect>2</Intellect>
    <Cunning>2</Cunning><Willpower>2</Willpower><Presence>2</Presence>
  </StartingChars>
  <StartingAttrs>
    <WoundThreshold>10</WoundThreshold>
    <StrainThreshold>10</StrainThreshold>
    <Experience>110</Experience>
  </StartingAttrs>
  <OptionChoices>...</OptionChoices>  <!-- Species abilities/free skills -->
</Species>
```

**Career XML:**
```xml
<Career>
  <Key>BOUNT</Key>
  <n>Bounty Hunter</n>
  <CareerSkills>
    <Key>ATHL</Key><Key>BRAWL</Key><Key>PERC</Key>...
  </CareerSkills>
  <Specializations>
    <Key>ASSAS</Key><Key>GADG</Key><Key>SURV</Key>...
  </Specializations>
</Career>
```

**Specialization XML (with Talent Tree):**
```xml
<Specialization>
  <Key>ASSAS</Key>
  <n>Assassin</n>
  <CareerSkills><Key>MELEE</Key><Key>RANGHVY</Key>...</CareerSkills>
  <TalentRows>
    <TalentRow>
      <Index>0</Index><Cost>5</Cost>
      <Talents><Key>GRIT</Key><Key>LETHALBL</Key><Key>STALK</Key><Key>DODGE</Key></Talents>
      <Directions>
        <Direction><Down>true</Down></Direction>...
      </Directions>
    </TalentRow>
    <!-- Rows 1-4 with Cost 10, 15, 20, 25 -->
  </TalentRows>
</Specialization>
```

**Talent XML:**
```xml
<Talent>
  <Key>GRIT</Key>
  <n>Grit</n>
  <Description>Gain +1 strain threshold.</Description>
  <ActivationValue>taPassive</ActivationValue>
</Talent>
```

**Weapon XML:**
```xml
<Weapon>
  <Key>12DEFEND</Key>
  <n>12 Defender</n>
  <SkillKey>RANGLT</SkillKey>
  <Damage>5</Damage><Crit>5</Crit>
  <RangeValue>wrShort</RangeValue>
  <Encumbrance>1</Encumbrance><HP>0</HP>
  <Price>25</Price><Rarity>4</Rarity>
  <Qualities><Quality><Key>INFERIOR</Key></Quality>...</Qualities>
</Weapon>
```

### 3.3 ETL Script Requirements

Build a Node.js script (`scripts/seed-data.ts`) that:
1. Clones or reads the OggDude repo
2. Parses all XML files using `fast-xml-parser`
3. Transforms into normalized JSON matching Supabase schema
4. Cross-references keys (e.g., Talent Key `GRIT` links to the talent definition)
5. Seeds Supabase tables via the JS client
6. Handles the `[H4]`, `[B]`, `[DI]`, `[SU]`, `[AD]`, `[TH]`, `[TR]`, `[DE]`, `[FO]`, `[FP]`, `[SE]`, `[BO]`, `[CH]`, `[P]`, `[BR]` markup codes in descriptions (convert to HTML or markdown)

---

## 4. DATABASE SCHEMA (SUPABASE)

### 4.1 Reference Data Tables (read-only, seeded from OggDude)

```sql
-- Species reference data
CREATE TABLE ref_species (
  key TEXT PRIMARY KEY,          -- 'HUMAN', 'DROID', etc.
  name TEXT NOT NULL,
  description TEXT,
  brawn INT, agility INT, intellect INT,
  cunning INT, willpower INT, presence INT,
  wound_threshold INT, strain_threshold INT,
  starting_xp INT,
  abilities JSONB,               -- species special abilities
  option_choices JSONB,          -- free skill choices etc.
  source_book TEXT, source_page INT
);

-- Skills reference
CREATE TABLE ref_skills (
  key TEXT PRIMARY KEY,          -- 'ASTRO', 'BRAWL', etc.
  name TEXT NOT NULL,
  description TEXT,
  characteristic_key TEXT,       -- 'INT', 'BR', 'AG', etc.
  type TEXT                      -- 'stGeneral', 'stCombat', 'stKnowledge'
);

-- Careers reference
CREATE TABLE ref_careers (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  career_skill_keys TEXT[],      -- array of skill keys
  specialization_keys TEXT[]     -- array of spec keys
);

-- Specializations reference
CREATE TABLE ref_specializations (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  career_key TEXT REFERENCES ref_careers(key),
  career_skill_keys TEXT[],
  talent_tree JSONB              -- 5 rows x 4 columns talent grid with connections
);

-- Talents reference
CREATE TABLE ref_talents (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  activation TEXT,               -- 'taPassive', 'taAction', 'taManeuver', 'taIncidental'
  is_force_talent BOOLEAN DEFAULT FALSE,
  is_ranked BOOLEAN DEFAULT FALSE
);

-- Weapons reference
CREATE TABLE ref_weapons (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  skill_key TEXT,
  damage INT, damage_add INT,
  crit INT,
  range_value TEXT,              -- 'wrShort', 'wrMedium', 'wrLong', 'wrExtreme', 'wrEngaged'
  encumbrance INT, hard_points INT,
  price INT, rarity INT, restricted BOOLEAN,
  qualities JSONB,               -- [{key, count}]
  categories TEXT[]
);

-- Armor reference
CREATE TABLE ref_armor (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  defense INT, soak INT,
  encumbrance INT, hard_points INT,
  price INT, rarity INT
);

-- Gear reference
CREATE TABLE ref_gear (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  encumbrance INT,
  price INT, rarity INT
);

-- Morality strengths/weaknesses
CREATE TABLE ref_moralities (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,                     -- 'Strength' or 'Weakness'
  paired_key TEXT
);

-- Obligations
CREATE TABLE ref_obligations (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Duties
CREATE TABLE ref_duties (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Item qualities/descriptors (Pierce, Stun, Blast, etc.)
CREATE TABLE ref_item_descriptors (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_passive BOOLEAN
);

-- Critical Injuries table (d100)
CREATE TABLE ref_critical_injuries (
  id SERIAL PRIMARY KEY,
  roll_min INT,
  roll_max INT,
  severity TEXT,                 -- 'Easy', 'Average', 'Hard', 'Daunting'
  name TEXT NOT NULL,
  description TEXT
);
```

### 4.2 Campaign & Character Tables (read/write)

```sql
-- Campaigns
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gm_pin TEXT NOT NULL,          -- hashed 4-digit pin
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Player profiles (linked to Supabase Auth)
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  is_gm BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Characters (the core entity)
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  name TEXT NOT NULL,
  species_key TEXT REFERENCES ref_species(key),
  career_key TEXT REFERENCES ref_careers(key),
  gender TEXT,
  portrait_url TEXT,             -- Supabase Storage URL

  -- Characteristics (mutable by GM)
  brawn INT NOT NULL DEFAULT 2,
  agility INT NOT NULL DEFAULT 2,
  intellect INT NOT NULL DEFAULT 2,
  cunning INT NOT NULL DEFAULT 2,
  willpower INT NOT NULL DEFAULT 2,
  presence INT NOT NULL DEFAULT 2,

  -- Derived attributes (wound/strain thresholds calculated, current tracked)
  wound_threshold INT NOT NULL DEFAULT 10,
  wound_current INT NOT NULL DEFAULT 0,
  strain_threshold INT NOT NULL DEFAULT 10,
  strain_current INT NOT NULL DEFAULT 0,
  soak INT NOT NULL DEFAULT 2,
  defense_ranged INT NOT NULL DEFAULT 0,
  defense_melee INT NOT NULL DEFAULT 0,

  -- XP tracking
  xp_total INT NOT NULL DEFAULT 0,
  xp_available INT NOT NULL DEFAULT 0,

  -- Credits
  credits INT NOT NULL DEFAULT 500,

  -- Encumbrance
  encumbrance_threshold INT NOT NULL DEFAULT 5,

  -- Morality
  morality_value INT DEFAULT 50,
  morality_strength_key TEXT,
  morality_weakness_key TEXT,

  -- Obligation & Duty
  obligation_type TEXT,
  obligation_value INT DEFAULT 10,
  obligation_notes TEXT,
  duty_type TEXT,
  duty_value INT DEFAULT 0,
  duty_notes TEXT,

  -- Backstory
  backstory TEXT DEFAULT '',
  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Character specializations (many-to-many, characters can buy additional specs)
CREATE TABLE character_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  specialization_key TEXT REFERENCES ref_specializations(key),
  is_starting BOOLEAN DEFAULT FALSE,
  purchase_order INT DEFAULT 0    -- 0 = starting, 1+ = purchased (cost increases)
);

-- Character skills (rank per skill)
CREATE TABLE character_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  skill_key TEXT REFERENCES ref_skills(key),
  rank INT NOT NULL DEFAULT 0,
  is_career BOOLEAN DEFAULT FALSE,
  UNIQUE(character_id, skill_key)
);

-- Character talents (purchased from talent trees)
CREATE TABLE character_talents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  talent_key TEXT REFERENCES ref_talents(key),
  specialization_key TEXT,        -- which tree it was bought from
  tree_row INT,                   -- row index (0-4)
  tree_col INT,                   -- column index (0-3)
  ranks INT DEFAULT 1,           -- for ranked talents
  xp_cost INT                    -- what was paid
);

-- Character weapons (inventory)
CREATE TABLE character_weapons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  weapon_key TEXT REFERENCES ref_weapons(key),
  custom_name TEXT,              -- player can rename
  is_equipped BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  notes TEXT
);

-- Character armor
CREATE TABLE character_armor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  armor_key TEXT REFERENCES ref_armor(key),
  custom_name TEXT,
  is_equipped BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  notes TEXT
);

-- Character gear
CREATE TABLE character_gear (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  gear_key TEXT REFERENCES ref_gear(key),
  custom_name TEXT,
  quantity INT DEFAULT 1,
  is_equipped BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Critical injuries (active on character)
CREATE TABLE character_critical_injuries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  injury_id INT REFERENCES ref_critical_injuries(id),
  custom_name TEXT,              -- for custom/GM-assigned injuries
  severity TEXT,
  description TEXT,
  is_healed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- XP transaction log (audit trail)
CREATE TABLE xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT,                   -- 'Session reward', 'Bought Talent: Grit', etc.
  created_by UUID,               -- player or GM
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Row Level Security (RLS)

```sql
-- Players can read all characters in their campaign
-- Players can only EDIT their own characters
-- GMs can edit ALL characters in their campaign

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view campaign characters"
  ON characters FOR SELECT
  USING (campaign_id IN (
    SELECT campaign_id FROM players WHERE user_id = auth.uid()
  ));

CREATE POLICY "Players can update own characters"
  ON characters FOR UPDATE
  USING (player_id IN (
    SELECT id FROM players WHERE user_id = auth.uid()
  ));

CREATE POLICY "GMs can update all campaign characters"
  ON characters FOR UPDATE
  USING (campaign_id IN (
    SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = TRUE
  ));

-- Similar policies for all character_* tables
```

---

## 5. FEATURE REQUIREMENTS

### 5.1 Player Capabilities

| Feature | Details |
|---------|---------|
| **Edit Wound/Strain** | +/- buttons on wound_current and strain_current, cannot exceed threshold |
| **Critical Injuries** | Add/remove from d100 table, toggle healed status, severity displayed |
| **Skills** | View all skills with dice pool visualization. Buy new ranks (costs XP). Rank capped at 5. |
| **Dice Pool Display** | Show green (Ability) and yellow (Proficiency) dice per skill. Ability = max(characteristic, rank) - min(characteristic, rank). Proficiency = min(characteristic, rank) |
| **Equipment Management** | Dropdown to select equipped weapon/armor. Toggle equipped/stowed. View encumbrance total vs threshold |
| **Morality** | Edit morality value (0-100). Display light/dark side status (>=50 = light). Show strength/weakness |
| **Talent Trees** | Visual 5x4 grid per specialization. Click to purchase (validates prerequisites: must own connected talent above). Costs XP (row cost: 5/10/15/20/25). Show purchased vs available |
| **Buy Specializations** | Purchase additional specialization trees. Cost: 10 XP (in-career) or 20 XP (out-of-career) for first non-starting, increasing by 10 for each additional |
| **Character Portrait** | Upload image via Supabase Storage. Display in header |
| **Backstory** | Rich text editor for backstory, notes |
| **Encumbrance** | Auto-calculated from equipped items. Show current vs threshold |
| **Credits** | View balance. (GM controls additions, player can track spending) |

### 5.2 GM Capabilities

Everything players can do, PLUS:

| Feature | Details |
|---------|---------|
| **Edit ALL stats** | Modify any character's characteristics, thresholds, soak, defense |
| **Award XP** | Grant XP to individual characters or all at once |
| **Distribute Credits** | Add/remove credits from any character |
| **Create Loot** | Search weapons/armor/gear database, assign to character inventory |
| **Modify Skills** | Override any skill rank, toggle career skills |
| **Campaign Settings** | Set campaign name, change GM pin, manage players |
| **Apply Wounds/Strain** | Quickly apply damage to characters during encounters |
| **Apply Critical Injuries** | Roll or manually assign critical injuries |

### 5.3 Authentication Flow

- **GM**: Enter 4-digit PIN (stored hashed in campaign settings)
- **Player**: Select their name from campaign roster (simple, no password needed for initial version; upgrade to Supabase Auth later)
- PIN-based auth for GM is essential for quick access during tabletop sessions

---

## 6. DICE POOL SYSTEM

The FFG Star Wars system uses a narrative dice pool. Each skill check builds a pool from:

```
Ability Dice (green d8) = max(characteristic, rank) - min(characteristic, rank)
Proficiency Dice (yellow d12) = min(characteristic, rank)
```

**Example: Bexar using Ranged - Heavy (Ag 3, Rank 2)**
- Proficiency (yellow) = min(3, 2) = 2
- Ability (green) = max(3, 2) - min(3, 2) = 1
- Pool: 2 yellow + 1 green

Display these as colored symbols/icons in the skill list. Use SVG or Unicode symbols for the dice:
- Green octagon (Ability)
- Yellow octagon (Proficiency)
- Purple octagon (Difficulty) -- for reference
- Red dodecagon (Challenge) -- for reference

---

## 7. UI/UX DESIGN DIRECTION

### 7.1 Visual Theme: "Republic Datapad"

**LIGHT THEME** - not dark. Think of the clean, bright interfaces seen on Republic cruiser terminals, Jedi temple datapads, and the Coruscant Senate holodisplays.

**Color Palette:**
- **Background**: Warm off-white (#F4F1EC) with subtle noise texture
- **Surface**: White (#FFFFFF) with very subtle blue-tinted shadows
- **Primary accent**: Republic gold (#C8A94E) for headers, buttons, active states
- **Secondary accent**: Hyperspace blue (#2B5DAE) for links, interactive elements
- **Danger/Wounds**: Imperial red (#C0392B)
- **Strain/Warning**: Amber (#D4830E)
- **Success**: Rebellion green (#27AE60)
- **Text**: Deep charcoal (#1C1C1E) primary, (#6B6B6B) secondary
- **Borders**: Soft blue-grey (#D1D5DB)

**Typography:**
- Headers: `Orbitron` or `Exo 2` -- geometric, sci-fi feel
- Body: `Rajdhani` or `Barlow` -- clean, readable, slightly futuristic
- Mono/Data: `Share Tech Mono` -- for stats, dice pools, XP values

### 7.2 WebGL/Visual Effects

Use Three.js sparingly for high-impact moments:

- **Background particle field**: Slow-drifting star particles behind the main UI (subtle, not distracting)
- **Holographic glow**: Bloom/glow shader on key stats (wound threshold, XP, morality gauge)
- **Talent tree connections**: Animated lines between connected talents, pulsing when purchasable
- **Hyperspace transition**: Quick streak effect when switching between characters
- **Holocron loading animation**: Rotating holocron cube during data loads

Keep these performant and optional (progressive enhancement, graceful degradation on mobile).

### 7.3 Viewport Scaling (Critical)

> **REFERENCE**: See `holocron-hud-v2.html` for the working implementation of this system.

The UI must scale proportionally across all PC monitor resolutions (1080p through 4K) like a video game HUD. Do NOT use fixed pixel values for sizing. Use a root-level `clamp()` on `html` font-size, then express all measurements in `rem`.

**Root scaling formula:**
```css
html {
  font-size: clamp(14px, 0.9vw, 28px);
}
```

This produces:

| Resolution | Viewport Width | Root Size | Effect |
|------------|---------------|-----------|--------|
| 1080p      | 1920px        | ~17px     | Compact, everything fits |
| 1440p      | 2560px        | ~23px     | Comfortable, well-proportioned |
| 4K         | 3840px        | 28px (cap)| Large, readable from distance |

**Spacing tokens (rem-based):**
```css
:root {
  --sp-xs: 0.25rem;
  --sp-sm: 0.5rem;
  --sp-md: 0.85rem;
  --sp-lg: 1.15rem;
  --sp-xl: 1.7rem;
}
```

**Layout columns use clamp for proportional panels:**
```css
grid-template-columns: clamp(240px, 17vw, 460px) 1fr clamp(240px, 17vw, 460px);
```

**All text sizes in rem (examples):**
- Card headers: `0.5rem`
- Body/skill text: `0.78rem`
- Stat numbers (characteristics): `2rem`
- Vital numbers: `1.3rem`
- Micro labels: `0.45rem`
- Character name: `clamp(16px, 1.6rem, 42px)`

**Hero image scales with viewport:**
```css
width: clamp(320px, 30vw, 800px);
```

**Rules:**
- NEVER use fixed `px` for font sizes, padding, margins, gaps, or element dimensions inside the HUD
- ALWAYS use `rem` (which inherits the scaled root) or `clamp()` with viewport units
- Grid columns, rows, and the top/bottom bars use `clamp()` directly
- The only `px` values allowed are borders (1px) and box-shadows
- Test at 1920x1080, 2560x1440, and 3840x2160 to verify proportional scaling

### 7.4 Component Patterns

- **Stat cards**: Beveled edges, subtle inner shadow, gold accent line on top border
- **Skill rows**: Alternating subtle tinted rows, dice pool icons inline
- **Talent tree**: Visual grid with hexagonal or diamond nodes, glowing connections
- **Equipment cards**: Flip-card style showing front (name, icon) and back (full stats)
- **Character portrait**: Circular frame with animated border glow matching faction alignment
- **Morality gauge**: Horizontal gradient bar (red to blue) with animated marker

---

## 8. PROJECT STRUCTURE

```
holocron/
├── .env.local                    # Supabase keys
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── scripts/
│   ├── parse-oggdude.ts          # XML → JSON parser
│   ├── seed-supabase.ts          # Seed ref_ tables
│   └── generate-critical-injuries.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_ref_tables.sql
│   │   ├── 002_campaign_tables.sql
│   │   └── 003_rls_policies.sql
│   └── seed.sql
│
├── public/
│   ├── fonts/
│   ├── dice/                     # Dice SVG icons
│   └── effects/                  # WebGL textures/shaders
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing / role selection
│   │   ├── gm/
│   │   │   ├── page.tsx          # GM dashboard
│   │   │   ├── characters/[id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── player/
│   │       ├── page.tsx          # Character select
│   │       └── character/[id]/
│   │           ├── page.tsx      # Character sheet
│   │           ├── talents/page.tsx
│   │           └── equipment/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   ├── character/
│   │   │   ├── CharacterHeader.tsx
│   │   │   ├── CharacteristicsGrid.tsx
│   │   │   ├── AttributeCards.tsx
│   │   │   ├── SkillsList.tsx
│   │   │   ├── DicePool.tsx
│   │   │   ├── TalentTree.tsx
│   │   │   ├── WeaponsTable.tsx
│   │   │   ├── EquipmentPanel.tsx
│   │   │   ├── CriticalInjuries.tsx
│   │   │   ├── MoralityGauge.tsx
│   │   │   ├── BackstoryEditor.tsx
│   │   │   └── PortraitUpload.tsx
│   │   ├── gm/
│   │   │   ├── LootCreator.tsx
│   │   │   ├── XPDistributor.tsx
│   │   │   └── CombatTracker.tsx
│   │   ├── wizard/
│   │   │   └── CharacterCreationWizard.tsx
│   │   └── effects/
│   │       ├── StarField.tsx      # WebGL background
│   │       ├── HologramGlow.tsx
│   │       └── HyperspaceTransition.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts          # Generated from schema
│   │   ├── dice.ts               # Dice pool calculator
│   │   ├── xp-costs.ts           # XP cost calculations
│   │   └── oggdude-markup.ts     # [H4][B][DI] parser
│   │
│   └── hooks/
│       ├── useCharacter.ts
│       ├── useCampaign.ts
│       ├── useRealtime.ts        # Supabase realtime subscriptions
│       └── useGameData.ts        # Ref table queries
│
└── oggdude/                      # Cloned OggDude dataset (gitignored)
    └── DataCustom/
```

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
1. `npx create-next-app@latest holocron --typescript --tailwind --app`
2. Set up Supabase project, create all migrations
3. Build OggDude XML parser script, seed all reference tables
4. Create base UI component library (stat cards, buttons, inputs)
5. Implement landing page with role selection and GM pin auth
6. Build character list sidebar

### Phase 2: Character Sheet (Week 2)
1. Character detail view with all sections
2. Characteristics display with +/- (GM only)
3. Attributes (wound/strain/soak/defense) with current value editing
4. Skills list with dice pool visualization
5. Weapons table, armor, gear displays
6. Equipment toggle (equipped/stowed) with encumbrance calc
7. Morality gauge component
8. Backstory text editor
9. Portrait upload via Supabase Storage

### Phase 3: Player Agency (Week 3)
1. Skill rank purchasing (XP cost validation)
2. Talent tree visual component with purchase flow
3. Specialization purchasing
4. Critical injuries management (add/remove/heal)
5. XP transaction logging
6. Player-side wound/strain/soak editing

### Phase 4: GM Tools (Week 4)
1. GM dashboard with all-character overview
2. Bulk XP distribution
3. Loot creation (search ref tables, assign to character)
4. Credit management
5. Quick wound/strain/crit application during combat

### Phase 5: Polish (Week 5)
1. WebGL star field background
2. Holographic glow effects on key stats
3. Talent tree animated connections
4. Responsive mobile layout
5. Supabase realtime for live sync between GM and players
6. Character creation wizard (full version)

---

## 10. REFERENCE: CHARACTER SHEET DATA MODEL (from Bexar)

This is the complete data model mapped from the uploaded character PDF:

```json
{
  "name": "BX-9R \"Bexar\"",
  "player": "Natalia",
  "species": "Droid (Other Model)",
  "career": "Bounty Hunter",
  "specialization": "Assassin",
  "gender": "Female",
  "characteristics": {
    "brawn": 3, "agility": 3, "intellect": 2,
    "cunning": 2, "willpower": 1, "presence": 1
  },
  "attributes": {
    "wound_threshold": 13, "wound_current": 0,
    "strain_threshold": 12, "strain_current": 0,
    "soak": 6,
    "defense_ranged": 1, "defense_melee": 1
  },
  "xp": { "total": 200, "earned": 25, "used": 185, "available": 15 },
  "credits": 500,
  "morality": { "value": 30, "strength": "Empathy", "weakness": "Obstinence" },
  "obligation": { "type": "Collateral Accountability", "value": 12 },
  "duty": { "type": "Loss Prevention", "value": 12 },
  "talents": [
    { "name": "Enduring", "rank": 1, "activation": "Passive", "source": "Droid" },
    { "name": "Grit", "rank": 1, "activation": "Passive", "source": "Assassin" },
    { "name": "Precise Aim", "rank": 1, "activation": "Maneuver", "source": "Assassin" }
  ],
  "weapons": [
    { "name": "PB08 Heavy Blaster Pistol", "skill": "Ranged - Light", "range": "Medium", "damage": 6, "crit": 3, "special": ["Stun Setting"] },
    { "name": "BX E11A Experimental Pulse Cannon", "skill": "Ranged - Heavy", "range": "Extreme", "damage": 9, "crit": 3, "special": ["Cumbersome 3", "Pierce 2", "Slow Firing 1"] }
  ],
  "armor": [
    { "name": "BX Droid Armor Plating", "soak": 2, "defense": "1/1", "encumbrance": 1, "equipped": true }
  ],
  "gear": [
    { "name": "BX Droid Modular Storage Unit", "encumbrance": 0, "equipped": true, "notes": "+3 Encumbrance, Self-Destruct" }
  ]
}
```

---

## 11. KEY OGGDUDE MARKUP CODES

The XML descriptions use custom markup. Parse these to HTML:

| Code | Meaning | HTML |
|------|---------|------|
| `[H4]...[h4]` | Heading | `<h4>...</h4>` |
| `[H3]...[h3]` | Heading | `<h3>...</h3>` |
| `[B]...[b]` | Bold | `<strong>...</strong>` |
| `[P]` | Paragraph break | `<p>` |
| `[BR]` | Line break | `<br>` |
| `[DI]` | Difficulty die | `<span class="die difficulty">d</span>` |
| `[SU]` | Success | `<span class="die success">s</span>` |
| `[AD]` | Advantage | `<span class="die advantage">a</span>` |
| `[TH]` | Threat | `<span class="die threat">t</span>` |
| `[TR]` | Triumph | `<span class="die triumph">x</span>` |
| `[DE]` | Despair | `<span class="die despair">y</span>` |
| `[FO]` | Force die | `<span class="die force">f</span>` |
| `[FP]` | Force pip | `<span class="die forcepip">p</span>` |
| `[SE]` | Setback die | `<span class="die setback">b</span>` |
| `[BO]` | Boost die | `<span class="die boost">b</span>` |
| `[CH]` | Challenge die | `<span class="die challenge">c</span>` |

---

## 12. CLAUDE CODE INIT COMMANDS

```bash
# 1. Init the project
npx create-next-app@latest holocron --typescript --tailwind --app --src-dir
cd holocron

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/ssr zustand three @react-three/fiber @react-three/drei fast-xml-parser

# 3. Install dev dependencies
npm install -D supabase @types/three

# 4. Clone OggDude data (for seeding)
git clone --depth 1 https://github.com/Septaris/OggDudes-Custom-Dataset-SW.git oggdude

# 5. Init Supabase
npx supabase init
npx supabase start

# 6. Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local
```

---

## 13. EXISTING PROTOTYPES

### holocron-rpg-manager.html (Interaction Reference)
An interactive HTML prototype that demonstrates:
- Role selection (GM/Player) with PIN authentication
- Character list sidebar navigation
- Full character sheet layout with all FFG data sections
- +/- stat controls for GM
- 5-step character creation wizard
- Equipment toggle switches
- Morality gauge visualization
- Star Wars theming (dark version, to be converted to light)

This prototype should be used as the **interaction and feature** reference when building React components.

### holocron-hud-v2.html (Visual & Layout Reference)
The definitive UI target. A video game HUD-style character sheet with:
- **Central character portrait** as the hero element (full-height, faded edges, glow disc underneath)
- **Three-column layout**: left panel (characteristics, vitals, morality, equipment, weapons), center (portrait + name + credits/XP), right panel (combat skills, general skills, knowledge, talents, critical injuries)
- **Glassmorphic cards** (translucent white, backdrop blur) so the character image bleeds through
- **Viewport-proportional scaling** via `clamp()` root font-size (see Section 7.3) -- scales from 1080p to 4K
- **Light "Republic Datapad" theme** with gold accents, warm cream backgrounds
- **Dice pool visualization** with hexagonal green (Ability) and gold (Proficiency) icons
- **Career skills highlighted** in gold text
- **Staggered entrance animations** (left panel slides from left, right from right, center fades up)
- Top bar with navigation tabs, bottom bar with Obligation/Duty badges

**This file is the primary visual target. Match this layout, color palette, typography, and scaling behavior in the React implementation.**

---

*Document prepared for Claude Code initialization. Feed this entire document as context when starting the project build.*