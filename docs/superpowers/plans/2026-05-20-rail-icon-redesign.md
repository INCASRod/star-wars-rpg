# Rail Icon Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all emoji/placeholder icons on the player HUD and GM left rails with thematic unicode symbols and faction PNG/WebP images, and re-wire the missing Force tab as a full nav panel.

**Architecture:** Four focused changes: (1) CSS additions in globals.css for faction image sizing and per-theme filter chains; (2) HudLeftRail icon update + image rendering + Force tab nav button; (3) GmLeftRail icon update + empire.png for Combat; (4) PlayerHUDDesktop wires `force-panel` as a full panel backed by the existing HudForceTab component.

**Tech Stack:** Next.js 14, React, TypeScript, CSS custom properties, `data-theme` attribute for theme switching.

---

## File Map

| File | Change |
|---|---|
| `src/app/globals.css` | Add `.hud-fi` base image class, per-theme filter rules, force/combat/adversaries symbol colours |
| `src/components/player-hud/HudLeftRail.tsx` | Update all icons, add `force-panel` RailPanelId, image rendering for Force + Group nav buttons, adversaries gets red class |
| `src/app/gm/GmLeftRail.tsx` | Replace all emoji icons with unicode, empire.png for Combat button |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | Import HudForceTab, extend `activeFullPanel` type, handle `force-panel` in toggle, add HudFullPanel render |

---

### Task 1: CSS — faction image classes, per-theme filters, symbol colours

**Files:**
- Modify: `src/app/globals.css:1245-1246` (insert after the last `.hud-rail-btn-nav` block, before the "Quick drawers" comment)

- [ ] **Step 1: Add the CSS block**

Insert the following directly after line 1245 (`.hud-rail-btn-nav.active .hud-rail-label { color: var(--hud-text); }`):

```css

/* ── Faction image buttons (rebel.png, jedi.webp, empire.png) ── */
.hud-fi {
  width: 18px;
  height: 18px;
  object-fit: contain;
  border-radius: 50%;
  display: block;
}

/* Default theme: Binary Sunset — light parchment background */
.hud-fi-rebel  { filter: saturate(1.3) brightness(0.9); }
.hud-fi-jedi   { filter: brightness(0.82) opacity(0.9); }
.hud-fi-empire { filter: brightness(0) invert(1) sepia(1) saturate(0.4) brightness(0.82); }

/* Rebel Operative — dark warm charcoal */
[data-theme="operative"] .hud-fi-rebel { filter: saturate(1.5) hue-rotate(20deg) brightness(1.8); }
[data-theme="operative"] .hud-fi-jedi  { filter: brightness(1.5) opacity(0.88); }

/* Kyber Archive — midnight indigo */
[data-theme="kyber"] .hud-fi-rebel { filter: saturate(1.8) hue-rotate(25deg) brightness(1.9); }
[data-theme="kyber"] .hud-fi-jedi  { filter: brightness(1.4) opacity(0.88); }

/* ── Rail symbol colours ── */
/* Force Check symbol — blue across all themes */
.hud-rail-btn-force .hud-rail-symbol  { color: var(--die-force); }
/* Combat Check symbol — red */
.hud-rail-btn-combat .hud-rail-symbol { color: rgba(224,80,80,0.80); }

/* Adversaries button — red hover/active, red symbol */
.hud-rail-btn-adversaries:hover,
.hud-rail-btn-adversaries.active { background: rgba(224,80,80,0.12); border-color: rgba(224,80,80,0.35); }
.hud-rail-btn-adversaries.active .hud-rail-label { color: rgba(224,80,80,0.9); }
.hud-rail-btn-adversaries .hud-rail-symbol       { color: rgba(224,80,80,0.75); }
```

- [ ] **Step 2: Verify TypeScript still compiles**

```
cd C:\Projects\Holocron\star-wars-rpg
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(rail): add faction image CSS classes and per-theme filter chains"
```

---

### Task 2: HudLeftRail — icon update + Force tab + image buttons

**Files:**
- Modify: `src/components/player-hud/HudLeftRail.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
'use client'

import { memo } from 'react'
import { FONT_BODY, RADIUS } from '@/lib/tokens'

export type RailPanelId =
  | 'combat' | 'force' | 'skill'
  | 'skills' | 'talents' | 'force-panel' | 'inventory' | 'lore' | 'group'
  | 'dice' | 'adversaries'

interface HudLeftRailProps {
  isForceUser:      boolean
  activePanel:      RailPanelId | null
  onPanelToggle:    (id: RailPanelId) => void
  showAdversaries?: boolean
}

const BTN_STYLE: React.CSSProperties = {
  width: 52, minHeight: 48,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 3, border: '1px solid transparent', borderRadius: RADIUS.md,
  cursor: 'pointer', background: 'transparent',
  transition: 'background 0.15s, border-color 0.15s',
  flexShrink: 0,
}

const SYMBOL_STYLE: React.CSSProperties = {
  fontSize: 16, lineHeight: 1,
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: '7px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--hud-text-dim)',
  textAlign: 'center',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  wordBreak: 'normal',
  maxWidth: 50,
}

const QUICK_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'combat', symbol: '⌖', label: 'Combat Check', cls: 'hud-rail-btn-combat' },
  { id: 'force',  symbol: '≋', label: 'Force Check',  cls: 'hud-rail-btn-force'  },
  { id: 'skill',  symbol: '⬠', label: 'Skill Check',  cls: 'hud-rail-btn-skill'  },
]

interface NavButton {
  id:         RailPanelId
  symbol?:    string
  imgSrc?:    string
  imgClass?:  string
  label:      string
  gateForce?: boolean
}

const NAV_BUTTONS: NavButton[] = [
  { id: 'skills',      symbol: '⚙',                                                                  label: 'Skills'    },
  { id: 'talents',     symbol: '★',                                                                  label: 'Talents'   },
  { id: 'force-panel', imgSrc: '/images/factions/jedi.webp', imgClass: 'hud-fi-jedi', label: 'Force',     gateForce: true },
  { id: 'inventory',   symbol: '▣',                                                                  label: 'Inventory' },
  { id: 'lore',        symbol: '✦',                                                                  label: 'Lore'      },
  { id: 'group',       imgSrc: '/images/factions/rebel.png', imgClass: 'hud-fi-rebel', label: 'Group'     },
]

const UTILITY_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'dice',        symbol: '⬡', label: 'Dice',        cls: 'hud-rail-btn-nav'          },
  { id: 'adversaries', symbol: '⊗', label: 'Adversaries', cls: 'hud-rail-btn-adversaries'  },
]

export const HudLeftRail = memo(function HudLeftRail({
  isForceUser, activePanel, onPanelToggle, showAdversaries = false,
}: HudLeftRailProps) {
  return (
    <div style={{
      width: 64, flexShrink: 0,
      background: 'var(--hud-panel)',
      borderRight: '1px solid var(--hud-border-hi)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, padding: '8px 0', overflowY: 'auto',
    }}>
      {QUICK_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'force' && !isForceUser) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {NAV_BUTTONS.map(({ id, symbol, imgSrc, imgClass, label, gateForce }) => {
        if (gateForce && !isForceUser) return null
        return (
          <button
            key={id}
            className={`hud-rail-btn-nav${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            {imgSrc
              ? <img src={imgSrc} className={`hud-fi ${imgClass ?? ''}`} alt="" aria-hidden />
              : <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            }
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {UTILITY_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'adversaries' && !showAdversaries) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}
    </div>
  )
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no errors. (Note: `PlayerHUDDesktop` will have a type error on `activeFullPanel` until Task 4 is complete — that is expected at this stage.)

- [ ] **Step 3: Commit**

```bash
git add src/components/player-hud/HudLeftRail.tsx
git commit -m "feat(rail): update player HUD icons — unicode + faction images, add force-panel id"
```

---

### Task 3: GmLeftRail — unicode icons + empire.png for Combat

**Files:**
- Modify: `src/app/gm/GmLeftRail.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
'use client'

import { memo } from 'react'
import { HUD, FONT_BODY, RADIUS } from '@/lib/tokens'

export type GmPanelId = 'map' | 'tools' | 'party' | 'combat'

interface RailButton {
  id:       GmPanelId
  icon:     string
  label:    string
  accent:   string
  imgSrc?:  string
  imgClass?: string
}

const BUTTONS: RailButton[] = [
  { id: 'map',    icon: '◎', label: 'Map',    accent: HUD.gold },
  { id: 'tools',  icon: '⊞', label: 'Tools',  accent: '#5AAAE0' },
  { id: 'party',  icon: '◉', label: 'Party',  accent: '#4EC8A8' },
  { id: 'combat', icon: '',  label: 'Combat', accent: '#E05050',
    imgSrc: '/images/factions/empire.png', imgClass: 'hud-fi hud-fi-empire' },
]

interface Props {
  activePanel:   GmPanelId | null
  onPanelToggle: (id: GmPanelId) => void
  onDiceClick:   () => void
  onScreenClick: () => void
  diceActive:    boolean
  screenActive:  boolean
}

export const GmLeftRail = memo(function GmLeftRail({
  activePanel, onPanelToggle, onDiceClick, onScreenClick, diceActive, screenActive,
}: Props) {
  return (
    <div style={{
      width:         52,
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           2,
      paddingTop:    8,
      paddingBottom: 8,
      background:    'var(--hud-panel)',
      borderRight:   '1px solid var(--hud-border-hi)',
      zIndex:        9001,
    }}>
      {BUTTONS.map(btn => (
        <RailBtn
          key={btn.id}
          icon={btn.icon}
          label={btn.label}
          active={activePanel === btn.id}
          accent={btn.accent}
          imgSrc={btn.imgSrc}
          imgClass={btn.imgClass}
          onClick={() => onPanelToggle(btn.id)}
        />
      ))}

      <div style={{ width: 28, height: 1, background: 'var(--hud-border-hi)', margin: '6px 0' }} />

      <RailBtn icon="⬡" label="Dice"   active={diceActive}   accent={HUD.gold} onClick={onDiceClick} />
      <RailBtn icon="▦" label="Screen" active={screenActive} accent={HUD.gold} onClick={onScreenClick} />
    </div>
  )
})

function RailBtn({ icon, label, active, accent, onClick, imgSrc, imgClass }: {
  icon: string; label: string; active: boolean; accent: string; onClick: () => void;
  imgSrc?: string; imgClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width:          40,
        height:         44,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            3,
        background:     active ? `${accent}18` : 'transparent',
        border:         active ? `1px solid ${accent}55` : '1px solid transparent',
        borderRadius:   RADIUS.md,
        cursor:         'pointer',
        transition:     'background 0.15s, border-color 0.15s',
      }}
    >
      {imgSrc
        ? <img src={imgSrc} className={imgClass} alt="" aria-hidden />
        : <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      }
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      '8px',
        fontWeight:    700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color:         active ? accent : 'var(--hud-text-dim)',
        lineHeight:    1,
      }}>{label}</span>
    </button>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/gm/GmLeftRail.tsx
git commit -m "feat(gm-rail): replace emoji icons with unicode symbols, empire.png for Combat"
```

---

### Task 4: PlayerHUDDesktop — wire force-panel as a full nav panel

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

The Force tab component (`HudForceTab`) already exists and has all the data it needs — it just needs to be imported and connected.

- [ ] **Step 1: Add the HudForceTab import**

In `PlayerHUDDesktop.tsx`, add this line alongside the other tab imports (around line 16):

```tsx
import { HudForceTab } from './HudForceTab'
```

- [ ] **Step 2: Extend activeFullPanel state type**

Find line 174:
```tsx
const [activeFullPanel,  setActiveFullPanel]  = useState<'skills' | 'talents' | 'inventory' | 'lore' | 'group' | null>(null)
```

Replace with:
```tsx
const [activeFullPanel,  setActiveFullPanel]  = useState<'skills' | 'talents' | 'force-panel' | 'inventory' | 'lore' | 'group' | null>(null)
```

- [ ] **Step 3: Add force-panel to the FULL array in handlePanelToggle**

Find (around line 190):
```tsx
    const FULL = ['skills', 'talents', 'inventory', 'lore', 'group'] as const
```

Replace with:
```tsx
    const FULL = ['skills', 'talents', 'force-panel', 'inventory', 'lore', 'group'] as const
```

- [ ] **Step 4: Add the HudFullPanel render for force-panel**

Find the Talents full panel block (around line 477):
```tsx
          <HudFullPanel open={activeFullPanel === 'talents'} title="Talents" symbol="◆" onClose={() => setActiveFullPanel(null)}>
            <HudTalentsTab
              ...
            />
          </HudFullPanel>
```

Insert the following block immediately after the closing `</HudFullPanel>` of the Talents panel:

```tsx
          <HudFullPanel open={activeFullPanel === 'force-panel'} title="Force" symbol="✦" onClose={() => setActiveFullPanel(null)}>
            <HudForceTab
              character={character}
              forceRating={forceRating}
              effectiveStats={effectiveStats}
              allForcePowers={allForcePowers}
              conflicts={conflicts}
              onPurchaseForceAbility={handlePurchaseForceAbility}
              onViewPower={(pk) => { setActivePowerKey(pk); setShowForceTree(true) }}
              onAdd={() => { setActivePowerKey(null); setShowForceTree(true) }}
            />
          </HudFullPanel>
```

- [ ] **Step 5: Verify TypeScript compiles with no errors**

```
npx tsc --noEmit
```

Expected: clean compile. The `activeFullPanel` type now includes `'force-panel'` which satisfies the `RailPanelId` union in the `activePanel` chain passed to `HudLeftRail`.

- [ ] **Step 6: Commit**

```bash
git add src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat(hud): wire force-panel as full nav panel backed by HudForceTab"
```

---

### Task 5: Update architecture.md

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 1: Update the HudLeftRail entry**

Find the section describing `HudLeftRail` and update it to note that `RailPanelId` now includes `'force-panel'`, and that the Force tab nav button gates on `isForceUser` and uses `jedi.webp` as its icon.

- [ ] **Step 2: Commit**

```bash
git add docs/architecture.md
git commit -m "docs(arch): update HudLeftRail — force-panel id, faction image buttons"
```
