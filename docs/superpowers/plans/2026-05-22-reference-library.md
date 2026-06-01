# GM Reference Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a searchable left-rail panel to the GM view for mid-session lookup of any talent or force ability.

**Architecture:** `'library'` is added to `GmPanelId` so the Library rail button reuses the existing left-side panel toggle mechanism in `GmShell`. A new `GmReferenceLibraryPanel` component owns all data fetching internally — three tables loaded on first keystroke per tab, then filtered client-side. No new state in `GmShell`.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Supabase browser client, `@/lib/tokens` design tokens, `ACTIVATION_LABELS` + `RefTalent` / `RefForcePower` / `RefForceAbility` from `@/lib/types`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/gm/GmLeftRail.tsx` | Modify | Add `'library'` to `GmPanelId`; add Library rail button |
| `src/app/gm/GmShell.tsx` | Modify | Import panel; add to conditional render; update panel width |
| `src/components/gm/GmReferenceLibraryPanel.tsx` | **Create** | Full panel: header, tabs, search, Talents tab, Force Powers tab |
| `docs/architecture.md` | Modify | Document new component and updated rail |

---

### Task 1: Extend GmLeftRail — add `'library'` to `GmPanelId` and add the Library button

**Files:**
- Modify: `src/app/gm/GmLeftRail.tsx`

- [ ] **Step 1: Extend `GmPanelId`**

Line 6 currently reads:
```ts
export type GmPanelId = 'map' | 'tools' | 'party' | 'combat'
```
Change to:
```ts
export type GmPanelId = 'map' | 'tools' | 'party' | 'combat' | 'library'
```

- [ ] **Step 2: Add `BLUE` constant and Library button**

Add `const BLUE = '#5AAAE0'` after the existing imports (alongside `HUD` which is already imported).

In the `GmLeftRail` component return, add a Library `RailBtn` immediately after the Screen button:

```tsx
<div style={{ width: 28, height: 1, background: 'var(--hud-border-hi)', margin: '6px 0' }} />

<RailBtn icon="⬡" label="Dice"    active={diceActive}              accent={HUD.gold} onClick={onDiceClick} />
<RailBtn icon="▦" label="Screen"  active={screenActive}            accent={HUD.gold} onClick={onScreenClick} />
<RailBtn icon="⊟" label="Library" active={activePanel === 'library'} accent={BLUE}   onClick={() => onPanelToggle('library')} />
```

No changes to the `Props` interface are needed — `onPanelToggle` already accepts `GmPanelId`, which now includes `'library'`.

- [ ] **Step 3: Verify in dev server**

Run `npm run dev`, open the GM view. Confirm:
- A "Library" button (⊟) appears below Screen on the left rail
- Clicking it activates it (blue tint, blue border)
- Clicking it again deactivates it
- Clicking Map/Tools/Party/Enemies while Library is active closes Library (expected — mutually exclusive)

- [ ] **Step 4: Commit**

```bash
git add src/app/gm/GmLeftRail.tsx
git commit -m "feat(gm): add library to GmPanelId and left rail"
```

---

### Task 2: Wire `GmReferenceLibraryPanel` into `GmShell`

**Files:**
- Modify: `src/app/gm/GmShell.tsx`

- [ ] **Step 1: Add import**

Add to the panel imports block (near `GmCombatPanel`):

```tsx
import { GmReferenceLibraryPanel } from '@/components/gm/GmReferenceLibraryPanel'
```

- [ ] **Step 2: Update panel width condition**

Find the sliding panel overlay `<div>` (search for `transform: activePanel`). Its `width` property currently reads:

```tsx
width: activePanel === 'tools' ? 560 : 360,
```

Change to:

```tsx
width: activePanel === 'tools' ? 560 : activePanel === 'library' ? 420 : 360,
```

- [ ] **Step 3: Add conditional render**

Inside the same sliding panel div, after `{activePanel === 'combat' && <GmCombatPanel ... />}`, add:

```tsx
{activePanel === 'library' && (
  <GmReferenceLibraryPanel />
)}
```

- [ ] **Step 4: Note**

The dev server will show a TypeScript/build error until `GmReferenceLibraryPanel` exists. That is expected — proceed to Task 3 immediately.

---

### Task 3: Create `GmReferenceLibraryPanel` — skeleton, Talents tab, and Force Powers stub

**Files:**
- Create: `src/components/gm/GmReferenceLibraryPanel.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RichText } from '@/components/ui/RichText'
import { FONT_BODY, HUD, RADIUS } from '@/lib/tokens'
import { ACTIVATION_LABELS, type RefTalent, type RefForcePower, type RefForceAbility } from '@/lib/types'

// ── Local palette ──────────────────────────────────────────────────────────────
const BLUE      = '#5AAAE0'
const PURPLE    = '#9060D0'
const BG        = 'rgba(6,10,8,0.97)'
const PANEL     = 'rgba(10,18,12,0.95)'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.28)'
const TEXT      = 'rgba(232,223,200,0.87)'
const DIM       = 'rgba(106,128,112,0.85)'
const DIM_LO    = 'rgba(100,128,112,0.4)'

const ACTIVATION_COLOR: Record<string, string> = {
  taPassive:       'rgba(160,160,160,0.85)',
  taAction:        HUD.gold,
  taManeuver:      '#4FC3F7',
  taIncidental:    '#81C784',
  taIncidentalOOT: '#81C784',
}

type LibTab = 'talents' | 'force'

// ── Shared atoms ───────────────────────────────────────────────────────────────

function ActivationBadge({ activation }: { activation: string }) {
  const label = ACTIVATION_LABELS[activation] ?? activation
  const color = ACTIVATION_COLOR[activation] ?? 'rgba(160,160,160,0.85)'
  return (
    <span style={{
      fontFamily:    FONT_BODY,
      fontSize:      '8px',
      fontWeight:    700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color,
      background:    `${color}18`,
      border:        `1px solid ${color}40`,
      borderRadius:  RADIUS.sm,
      padding:       '2px 6px',
      flexShrink:    0,
    }}>
      {label}
    </span>
  )
}

function SearchInput({ value, placeholder, onChange, onClear }: {
  value:       string
  placeholder: string
  onChange:    (v: string) => void
  onClear:     () => void
}) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        background:   'rgba(0,0,0,0.45)',
        border:       `1px solid ${BORDER_HI}`,
        borderRadius: RADIUS.sm,
        padding:      '7px 10px',
      }}>
        <span style={{ fontSize: 11, opacity: 0.45, flexShrink: 0 }}>🔍</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex:       1,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            fontFamily: FONT_BODY,
            fontSize:   'var(--text-sm)',
            color:      TEXT,
          }}
        />
        {value && (
          <button
            onClick={onClear}
            aria-label="Clear search"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      DIM_LO,
              fontSize:   11,
              lineHeight: 1,
              padding:    0,
              flexShrink: 0,
            }}
          >✕</button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      gap:            8,
      padding:        32,
      textAlign:      'center',
    }}>
      <div style={{ fontSize: 28, opacity: 0.15 }}>⊟</div>
      <div style={{
        fontFamily:    FONT_BODY,
        fontSize:      'var(--text-label)',
        fontWeight:    700,
        color:         DIM_LO,
        letterSpacing: '0.06em',
      }}>
        {message}
      </div>
      <div style={{
        fontFamily: FONT_BODY,
        fontSize:   'var(--text-caption)',
        color:      DIM_LO,
        lineHeight: 1.5,
        opacity:    0.75,
        whiteSpace: 'pre-line',
      }}>
        {sub}
      </div>
    </div>
  )
}

function ResultCount({ label }: { label: string }) {
  return (
    <div style={{
      padding:       '4px 14px 8px',
      fontFamily:    FONT_BODY,
      fontSize:      '8px',
      fontWeight:    700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color:         DIM_LO,
    }}>
      {label}
    </div>
  )
}

// ── Talents tab ────────────────────────────────────────────────────────────────

function TalentCard({ talent }: { talent: RefTalent }) {
  return (
    <div style={{ padding: '9px 14px', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-sm)',
          fontWeight: 600,
          color:      TEXT,
          flex:       1,
          minWidth:   0,
        }}>
          {talent.name}
        </span>
        <ActivationBadge activation={talent.activation} />
        {talent.is_ranked && (
          <span style={{
            fontFamily: FONT_BODY,
            fontSize:   '8px',
            color:      'rgba(200,170,80,0.45)',
            flexShrink: 0,
          }}>
            Ranked
          </span>
        )}
      </div>
      {talent.description && (
        <div style={{
          fontFamily:        FONT_BODY,
          fontSize:          'var(--text-caption)',
          color:             DIM,
          lineHeight:        1.45,
          overflow:          'hidden',
          display:           '-webkit-box',
          WebkitLineClamp:   2,
          WebkitBoxOrient:   'vertical',
        } as React.CSSProperties}>
          <RichText text={talent.description} />
        </div>
      )}
    </div>
  )
}

function TalentsBody({ query, results }: { query: string; results: RefTalent[] }) {
  if (!query) {
    return (
      <EmptyState
        message="Search to look up a talent"
        sub={'Type any part of the name.\nResults appear instantly.'}
      />
    )
  }
  if (results.length === 0) {
    return <EmptyState message="No talents found" sub={`No match for "${query}"`} />
  }
  return (
    <>
      <ResultCount label={`${results.length} result${results.length !== 1 ? 's' : ''}`} />
      {results.map(t => <TalentCard key={t.key} talent={t} />)}
    </>
  )
}

// ── Force Powers tab ───────────────────────────────────────────────────────────

function ForcePowerCard({ power, abilities }: { power: RefForcePower; abilities: RefForceAbility[] }) {
  return (
    <div style={{
      margin:       '6px 10px 2px',
      background:   'rgba(144,96,208,0.06)',
      border:       '1px solid rgba(144,96,208,0.2)',
      borderRadius: RADIUS.md,
      overflow:     'hidden',
    }}>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        padding:      '9px 12px',
        borderBottom: '1px solid rgba(144,96,208,0.12)',
        background:   'rgba(144,96,208,0.08)',
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(200,180,240,0.9)', flex: 1 }}>
          {power.name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: 'rgba(144,96,208,0.6)', flexShrink: 0 }}>
          FR {power.min_force_rating}+
        </span>
      </div>
      {power.description && (
        <div style={{
          padding:         '7px 12px',
          fontFamily:      FONT_BODY,
          fontSize:        'var(--text-caption)',
          color:           DIM,
          lineHeight:      1.45,
          overflow:        'hidden',
          display:         '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          <RichText text={power.description} />
        </div>
      )}
      {abilities.map(ability => (
        <div key={ability.key} style={{
          padding:    '7px 12px',
          borderTop:  '1px solid rgba(144,96,208,0.1)',
          background: 'rgba(4,8,6,0.5)',
        }}>
          <div style={{
            fontFamily:  FONT_BODY,
            fontSize:    'var(--text-caption)',
            fontWeight:  600,
            color:       'rgba(200,180,240,0.75)',
            marginBottom: 3,
          }}>
            {ability.name}
          </div>
          {ability.description && (
            <div style={{
              fontFamily:      FONT_BODY,
              fontSize:        'var(--text-caption)',
              color:           'rgba(90,110,100,0.85)',
              lineHeight:      1.4,
              overflow:        'hidden',
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}>
              <RichText text={ability.description} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StandaloneAbilityCard({ ability, powerName }: { ability: RefForceAbility; powerName: string }) {
  return (
    <div style={{
      margin:       '4px 10px',
      padding:      '8px 12px',
      background:   'rgba(144,96,208,0.04)',
      border:       '1px solid rgba(144,96,208,0.14)',
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-caption)', fontWeight: 600, color: 'rgba(200,180,240,0.8)', flex: 1 }}>
          {ability.name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: 'rgba(144,96,208,0.5)', flexShrink: 0 }}>
          {powerName}
        </span>
      </div>
      {ability.description && (
        <div style={{
          fontFamily:      FONT_BODY,
          fontSize:        'var(--text-caption)',
          color:           'rgba(90,110,100,0.85)',
          lineHeight:      1.4,
          overflow:        'hidden',
          display:         '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          <RichText text={ability.description} />
        </div>
      )}
    </div>
  )
}

interface ForceResults {
  powerCards:          Array<{ power: RefForcePower; abilities: RefForceAbility[] }>
  standaloneAbilities: RefForceAbility[]
}

function ForceBody({ query, results, powers }: {
  query:   string
  results: ForceResults
  powers:  RefForcePower[]
}) {
  if (!query) {
    return (
      <EmptyState
        message="Search to look up a force power"
        sub={'Type a power or ability name.\nResults appear instantly.'}
      />
    )
  }

  const { powerCards, standaloneAbilities } = results

  if (powerCards.length === 0 && standaloneAbilities.length === 0) {
    return <EmptyState message="No results found" sub={`No match for "${query}"`} />
  }

  const totalAbilities = powerCards.reduce((n, pc) => n + pc.abilities.length, 0) + standaloneAbilities.length
  const powerLabel    = `${powerCards.length} power${powerCards.length !== 1 ? 's' : ''}`
  const abilityLabel  = `${totalAbilities} abilit${totalAbilities !== 1 ? 'ies' : 'y'}`
  const countLabel    =
    powerCards.length > 0 && totalAbilities > 0 ? `${powerLabel} · ${abilityLabel}` :
    powerCards.length > 0 ? powerLabel : abilityLabel

  const powerKeyToName = Object.fromEntries(powers.map(p => [p.key, p.name]))

  return (
    <>
      <ResultCount label={countLabel} />
      {powerCards.map(({ power, abilities }) => (
        <ForcePowerCard key={power.key} power={power} abilities={abilities} />
      ))}
      {standaloneAbilities.map(ability => (
        <StandaloneAbilityCard
          key={ability.key}
          ability={ability}
          powerName={powerKeyToName[ability.power_key] ?? ability.power_key}
        />
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GmReferenceLibraryPanel() {
  const supabase = useMemo(() => createClient(), [])

  const [tab, setTab] = useState<LibTab>('talents')

  // Talents
  const [talents,       setTalents]       = useState<RefTalent[]>([])
  const [talentsLoaded, setTalentsLoaded] = useState(false)
  const talentsLoadingRef                 = useRef(false)
  const [talentQuery,   setTalentQuery]   = useState('')

  // Force
  const [forcePowers,    setForcePowers]    = useState<RefForcePower[]>([])
  const [forceAbilities, setForceAbilities] = useState<RefForceAbility[]>([])
  const [forceLoaded,    setForceLoaded]    = useState(false)
  const forceLoadingRef                     = useRef(false)
  const [forceQuery,     setForceQuery]     = useState('')

  // ── Data loaders ───────────────────────────────────────────────────────────

  const handleTalentSearch = useCallback(async (q: string) => {
    setTalentQuery(q)
    if (q && !talentsLoaded && !talentsLoadingRef.current) {
      talentsLoadingRef.current = true
      const { data } = await supabase
        .from('ref_talents')
        .select('key,name,description,activation,is_ranked')
        .order('name')
      setTalents((data ?? []) as RefTalent[])
      setTalentsLoaded(true)
      talentsLoadingRef.current = false
    }
  }, [supabase, talentsLoaded])

  const handleForceSearch = useCallback(async (q: string) => {
    setForceQuery(q)
    if (q && !forceLoaded && !forceLoadingRef.current) {
      forceLoadingRef.current = true
      const [powersRes, abilitiesRes] = await Promise.all([
        supabase.from('ref_force_powers').select('key,name,description,min_force_rating').order('name'),
        supabase.from('ref_force_abilities').select('key,name,description,power_key').order('name'),
      ])
      setForcePowers((powersRes.data ?? []) as RefForcePower[])
      setForceAbilities((abilitiesRes.data ?? []) as RefForceAbility[])
      setForceLoaded(true)
      forceLoadingRef.current = false
    }
  }, [supabase, forceLoaded])

  // ── Derived results ────────────────────────────────────────────────────────

  const filteredTalents = useMemo(() => {
    if (!talentQuery) return []
    const lc = talentQuery.toLowerCase()
    return talents.filter(t => t.name.toLowerCase().includes(lc))
  }, [talents, talentQuery])

  const forceResults = useMemo((): ForceResults => {
    if (!forceQuery) return { powerCards: [], standaloneAbilities: [] }
    const lc               = forceQuery.toLowerCase()
    const matchedPowers    = forcePowers.filter(p => p.name.toLowerCase().includes(lc))
    const matchedPowerKeys = new Set(matchedPowers.map(p => p.key))
    const matchedAbilities = forceAbilities.filter(a => a.name.toLowerCase().includes(lc))
    return {
      powerCards: matchedPowers.map(power => ({
        power,
        abilities: forceAbilities.filter(a => a.power_key === power.key),
      })),
      standaloneAbilities: matchedAbilities.filter(a => !matchedPowerKeys.has(a.power_key)),
    }
  }, [forcePowers, forceAbilities, forceQuery])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: BG }}>

      {/* Header */}
      <div style={{
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        height:         50,
        padding:        '0 16px',
        borderBottom:   `1px solid ${BORDER}`,
        background:     PANEL,
      }}>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      'var(--text-overline)',
          fontWeight:    700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         HUD.gold,
        }}>
          Reference Library
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        flexShrink:   0,
        display:      'flex',
        borderBottom: `1px solid ${BORDER}`,
        background:   PANEL,
      }}>
        {([
          { id: 'talents' as LibTab, label: 'Talents',      accent: BLUE   },
          { id: 'force'   as LibTab, label: 'Force Powers', accent: PURPLE },
        ]).map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex:          1,
                background:    'none',
                border:        'none',
                borderBottom:  `2px solid ${active ? t.accent : 'transparent'}`,
                cursor:        'pointer',
                padding:       '10px 4px',
                fontFamily:    FONT_BODY,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         active ? t.accent : DIM_LO,
                transition:    'color 0.15s, border-color 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      {tab === 'talents' ? (
        <SearchInput
          value={talentQuery}
          placeholder="Search talent name…"
          onChange={handleTalentSearch}
          onClear={() => setTalentQuery('')}
        />
      ) : (
        <SearchInput
          value={forceQuery}
          placeholder="Search force power or ability…"
          onChange={handleForceSearch}
          onClear={() => setForceQuery('')}
        />
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'talents' && (
          <TalentsBody query={talentQuery} results={filteredTalents} />
        )}
        {tab === 'force' && (
          <ForceBody query={forceQuery} results={forceResults} powers={forcePowers} />
        )}
      </div>

    </div>
  )
}
```

- [ ] **Step 2: Verify the full panel in dev server**

Open the GM view and click the Library rail button. Check:

**Talents tab:**
- Empty state shows on open: "Search to look up a talent"
- Typing `grit` → Grit card appears with Passive badge and description clamped to 2 lines
- Typing `adv` → Adversary appears
- Typing `zzz` → "No talents found" empty state
- ✕ clear button resets to empty state
- Result count `"N results"` appears above list

**Force Powers tab:**
- Click "Force Powers" tab → empty state shows "Search to look up a force power"
- Typing `bind` → Bind power card (purple header, FR 1+, description, ability rows nested below)
- Typing `control` → standalone ability cards from multiple powers, each labelled with parent power name
- Result count shows `"1 power · 3 abilities"` format
- Talent search state is preserved when switching back to Talents tab

**Rail behaviour:**
- Clicking Map/Tools/Party/Enemies closes Library (correct — mutually exclusive)
- Library panel is 420px wide; Tools panel remains 560px; others remain 360px

- [ ] **Step 3: Commit**

```bash
git add src/components/gm/GmReferenceLibraryPanel.tsx src/app/gm/GmShell.tsx
git commit -m "feat(gm): add reference library panel with talents and force powers tabs"
```

---

### Task 4: Update `architecture.md`

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 1: Update the GmLeftRail entry**

Find:
```
- `GmLeftRail` — 52px fixed left rail; navigation buttons (◎ Map/gold, ⊞ Tools/blue, ◉ Party/teal, Combat with empire.png faction image/red); utility buttons (⬡ Dice/gold, ▦ Screen/gold) below divider; uses `FONT_BODY`, `RADIUS`, `Z.fab` from tokens; Combat button uses empire.png faction image with CSS filter chain
```

Replace `utility buttons (⬡ Dice/gold, ▦ Screen/gold) below divider` with:
```
utility buttons (⬡ Dice/gold, ▦ Screen/gold, ⊟ Library/blue) below divider
```

- [ ] **Step 2: Add GmReferenceLibraryPanel entry**

After the `AddConflictModal` entry in the GM HUD Sub-components section, add:

```markdown
- `GmReferenceLibraryPanel` (`src/components/gm/GmReferenceLibraryPanel.tsx`) — searchable read-only reference panel accessed via the ⊟ Library rail button; `'library'` is part of `GmPanelId` and uses the existing left-side slide mechanism at 420px; Talents tab queries `ref_talents` (all rows) on first keystroke and filters client-side by name; Force Powers tab queries `ref_force_powers` + `ref_force_abilities` on first keystroke — matched powers render as purple cards with all their ability rows nested below; abilities matching without a matched parent power render as standalone cards labelled with the parent power name; both tabs show empty state until text is entered
```

- [ ] **Step 3: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: document GmReferenceLibraryPanel and updated GmLeftRail"
```
