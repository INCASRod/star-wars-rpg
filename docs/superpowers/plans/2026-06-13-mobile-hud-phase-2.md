# Mobile HUD Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace four stub screens (Dice, Talents, Items, Group) with fully functional mobile components, add a portal bottom sheet, and apply three Phase 1 visual fixes (portrait image, rectangular Feed tab, 44 px tap targets).

**Architecture:** Each screen is a self-contained component receiving typed props from `MobileHudLayout`. `MobileHudLayout` is patched once (Task 2) to add `hudTalents / hudWeapons / hudArmor / hudGear` to its destructure and wire them to screens. `MobileBottomSheet` is a `createPortal` overlay used only by `MobileItemsScreen`. `MobileGroupScreen` issues its own Supabase fetches for campaign / duty / asset data; it receives `supabase`, `campaignId`, `destinyPool` as props so it does not double-subscribe.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase JS v2, Shinkei design tokens (`@/lib/tokens` — FS, SP, RADIUS, Z, EASE, HUD, COLOR, FONT_BODY, FONT_DISPLAY), dice engine (`src/components/player-hud/dice-engine.ts`), roll logger (`src/lib/logRoll.ts`).

---

## Design-token reminders (enforced in every task)

| Need | Correct |
|---|---|
| Teal / cyan accent substitute | `COLOR.blue` / `var(--blue)` — `HUD.teal` does **not** exist |
| Danger / over-threshold red | `#E85A2A` with `/* wounds — sealed game-mechanic exception */` comment |
| Opacity | `color-mix(in srgb, <token> N%, transparent)` — never `var(--token)HH` suffix |
| Hover states | CSS classes only — never `onMouseEnter`/`onMouseLeave` style mutations |
| Transitions | `EASE.*` tokens — never raw `'150ms'` strings |
| z-index | `Z.*` tokens — never raw numbers |
| Font family | `FONT_BODY` or `FONT_DISPLAY` constants — never string literals |
| Font size | `FS.*` tokens — never `'12px'` or `'0.75rem'` |

**Approved raw hex exceptions in this plan:**
- `#E85A2A` — wounds / over-threshold (existing exception)
- `#0EA5E9` — destiny light pip (existing exception)
- `#A845F5` — destiny dark pip (existing exception)

---

## File Structure

| Action | Path | Purpose |
|---|---|---|
| **Modify** | `src/components/mobile/MobileIdentityBar.tsx` | F1: add `portraitUrl` prop + Next.js `<Image>` with initials fallback |
| **Modify** | `src/components/mobile/MobileRunner.tsx` | F2: Feed tab rectangular (remove `RADIUS.full`), strip height 48 px |
| **Modify** | `src/components/mobile/MobileBottomNav.tsx` | F3: add `minHeight: 44` to every non-FAB button |
| **Create** | `src/components/mobile/MobileBottomSheet.tsx` | Portal slide-up overlay for item detail |
| **Modify** | `src/components/mobile/MobileHudLayout.tsx` | Add `hudTalents/hudWeapons/hudArmor/hudGear` to destructure; pass props to screens |
| **Replace** | `src/components/mobile/screens/MobileDiceScreen.tsx` | Full dice roller (check type bar → skill grid → steppers → pool preview → roll + log) |
| **Replace** | `src/components/mobile/screens/MobileTalentsScreen.tsx` | Talent quick reference (filter strip, type-coloured cards, sort OOT→Active→Incidental→Passive) |
| **Replace** | `src/components/mobile/screens/MobileItemsScreen.tsx` | Inventory (credits+enc header, sectioned list, bottom sheet detail) |
| **Replace** | `src/components/mobile/screens/MobileGroupScreen.tsx` | Group screen (destiny pool, duty table, alliance standing, imperial threat stub, assets) |

---

## Task 0: Phase 1 Fixes

**Files:**
- Modify: `src/components/mobile/MobileIdentityBar.tsx`
- Modify: `src/components/mobile/MobileRunner.tsx`
- Modify: `src/components/mobile/MobileBottomNav.tsx`

### F1 — MobileIdentityBar: portrait image

- [ ] **Read the current file** at `src/components/mobile/MobileIdentityBar.tsx`.

- [ ] **Add `portraitUrl` prop and Next.js Image** — replace the initials-only avatar `<div>` with a conditional:

```tsx
// Add to imports:
import Image from 'next/image'

// Update interface — add one field:
interface MobileIdentityBarProps {
  name: string
  portraitUrl?: string | null   // ← NEW
  careerKey?: string | null
  specKey?: string | null
  speciesKey?: string | null
  xpAvailable: number
  credits: number
  destinyPool: Array<'light' | 'dark'>
}

// Update component signature — add portraitUrl:
export function MobileIdentityBar({
  name, portraitUrl, careerKey, specKey, speciesKey, xpAvailable, credits, destinyPool,
}: MobileIdentityBarProps) {

// Replace the avatar circle div (currently renders initials only) with:
<div style={{
  width: 40, height: 40,            /* fixed avatar geometry */
  borderRadius: RADIUS.full,
  border: `2px solid var(--hud-accent)`,
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative',
  background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
}}>
  {portraitUrl ? (
    <Image
      src={portraitUrl}
      alt={name}
      fill
      style={{ objectFit: 'cover' }}
      sizes="40px"
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
      color: 'var(--hud-accent)', letterSpacing: '0.06em',
    }}>
      {initials(name)}
    </div>
  )}
</div>
```

- [ ] **Wire in MobileHudLayout** — open `src/components/mobile/MobileHudLayout.tsx`, find the `<MobileIdentityBar ...>` call, add `portraitUrl={character.portrait_url ?? null}`.

- [ ] **Build check:** `npm run build` — expect zero errors.

### F2 — MobileRunner: rectangular Feed tab

- [ ] **Read** `src/components/mobile/MobileRunner.tsx`.

- [ ] **Remove pill shape and fix strip height.** The Feed tab currently uses `RADIUS.full` when active. Replace the relevant parts:

```tsx
// In the outer container div, add explicit height:
<div style={{
  display: 'flex', overflowX: 'auto', overflowY: 'hidden',
  scrollbarWidth: 'none',
  background: 'var(--hud-surface-hi)',
  borderBottom: `1px solid var(--hud-border)`,
  padding: `0 ${SP[2]}`,
  gap: SP[1],
  flexShrink: 0,
  height: 48,   /* ← ADD: fixed runner strip height */
  alignItems: 'center',
}}>

// In the button style object — remove the RADIUS.full conditional entirely.
// The Feed tab keeps its accent bg and glow but is now rectangular:
<button
  key={tab.id}
  onClick={() => onTabChange(tab.id)}
  style={{
    flexShrink: 0,
    background: (isFeedTab && isActive) ? 'var(--hud-accent)' : 'transparent',
    border: 'none',
    borderRadius: 0,   /* ← was: (isFeedTab && isActive) ? RADIUS.full : 0 */
    padding: `${SP[1]} ${SP[2]}`,
    height: 40,        /* ← ADD: tap target height */
    cursor: 'pointer',
    fontFamily: FONT_BODY,
    fontSize: FS.overline,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: (isFeedTab && isActive) ? 'var(--hud-bg)' : (isActive ? 'var(--hud-accent)' : HUD.textFaint),
    boxShadow: (isFeedTab && isActive)
      ? '0 0 10px color-mix(in srgb, var(--hud-accent) 60%, transparent)'
      : 'none',
    borderBottom: (!isFeedTab && isActive)
      ? `2px solid var(--hud-accent)`
      : '2px solid transparent',
    transition: `color ${EASE.quick}, background ${EASE.quick}, box-shadow ${EASE.quick}`,
    whiteSpace: 'nowrap',
  }}
>
```

### F3 — MobileBottomNav: 44 px tap targets

- [ ] **Read** `src/components/mobile/MobileBottomNav.tsx`.

- [ ] **Add `minHeight: 44` to non-FAB buttons.** Find the `return (...)` block for non-FAB nav items and add:

```tsx
// In the non-FAB button style object, add:
minHeight: 44,   /* WCAG 2.5.5 minimum touch target */
```

- [ ] **Commit Task 0:**

```bash
git add src/components/mobile/MobileIdentityBar.tsx \
        src/components/mobile/MobileRunner.tsx \
        src/components/mobile/MobileBottomNav.tsx
git commit -m "fix(mobile): Phase 1 visual corrections — portrait image, rectangular Feed tab, 44px tap targets"
```

---

## Task 1: MobileBottomSheet portal component

**Files:**
- Create: `src/components/mobile/MobileBottomSheet.tsx`

- [ ] **Create the file:**

```tsx
'use client'
import { useEffect }    from 'react'
import { createPortal } from 'react-dom'
import { SP, Z, EASE, RADIUS } from '@/lib/tokens'

interface MobileBottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Sheet max height as CSS value. Default: '80dvh' */
  maxHeight?: string
}

export function MobileBottomSheet({ open, onClose, children, maxHeight = '80dvh' }: MobileBottomSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        zIndex: Z.modal,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'color-mix(in srgb, var(--hud-bg) 70%, transparent)',
          cursor: 'pointer',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        zIndex: Z.modal,
        maxHeight,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        background: 'var(--hud-surface-hi)',
        borderTop: `1px solid var(--hud-border)`,
        borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        padding: `${SP[2]} ${SP[3]} ${SP[6]}`,
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, /* fixed handle geometry */
          borderRadius: RADIUS.full,
          background: 'var(--hud-border-hi)',
          margin: `0 auto ${SP[2]}`,
        }} />
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Build check:** `npm run build` — expect zero errors.

- [ ] **Commit:**

```bash
git add src/components/mobile/MobileBottomSheet.tsx
git commit -m "feat(mobile): add MobileBottomSheet portal component"
```

---

## Task 2: Wire MobileHudLayout props to Phase 2 screens

**Files:**
- Modify: `src/components/mobile/MobileHudLayout.tsx`

### What changes

`useCharacterData` returns **both** raw arrays (used by `useDerivedStats` / `computeEncumbranceStats`) and HUD-ready display arrays (needed by screens). The current destructure only pulls raw arrays. Add the hud-prefixed ones and pass them to the screens.

- [ ] **Read** `src/components/mobile/MobileHudLayout.tsx` (the full file).

- [ ] **Expand the `useCharacterData` destructure** — add the four hud-prefixed fields:

```tsx
const {
  character, talents, weapons, armor, gear,
  charSpecs, speciesAbilities,
  refTalentMap, refArmorMap, refWeaponMap, refGearMap,
  refWeaponQualityMap, refAttachmentMap,
  forceRating, hudSkills,
  hudTalents, hudWeapons, hudArmor, hudGear,   // ← NEW
  loading, error,
} = useCharacterData(characterId)
```

- [ ] **Update `renderScreen()` — pass props to every screen:**

```tsx
function renderScreen() {
  const active = navTab ?? (runnerTab === 'feed' ? 'feed' : null)
  switch (active) {
    case 'feed':
      return <MobileFeedScreen rolls={rolls} ownCharacterId={characterId} />
    case 'skills':
      return (
        <MobileSkillsScreen
          hudSkills={hudSkills}
          xpAvailable={char.xp_available ?? 0}
          onRollSkill={handleSkillRoll}
        />
      )
    case 'dice':
      return (
        <MobileDiceScreen
          preSelectedSkill={diceSkill}
          hudSkills={hudSkills}
          characterId={characterId}
          characterName={char.name}
          campaignId={effectiveCampaignId}
          forceRating={forceRating ?? 0}
          supabase={supabase}
        />
      )
    case 'talents':
      return <MobileTalentsScreen hudTalents={hudTalents} />
    case 'items':
      return (
        <MobileItemsScreen
          hudWeapons={hudWeapons}
          hudArmor={hudArmor}
          hudGear={hudGear}
          encCurrent={encStats?.current ?? 0}
          encThreshold={encStats?.threshold ?? 0}
          credits={char.credits ?? 0}
        />
      )
    case 'group':
      return (
        <MobileGroupScreen
          campaignId={effectiveCampaignId}
          characterId={characterId}
          characterName={char.name}
          destinyPool={destinyPool}
          supabase={supabase}
        />
      )
    default:
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[4] }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>
            RUNNER TABS · PHASE 3
          </div>
        </div>
      )
  }
}
```

- [ ] **TypeScript check only** — the stub screens will currently complain about unknown props; that's expected until Tasks 3–6. Just confirm the layout file itself compiles (add `// @ts-expect-error` comments to screen JSX lines temporarily if needed — remove them task by task as screens are replaced).

- [ ] **Commit:**

```bash
git add src/components/mobile/MobileHudLayout.tsx
git commit -m "feat(mobile): wire Phase 2 props to screen slots in MobileHudLayout"
```

---

## Task 3: MobileDiceScreen — Full Dice Roller

**Files:**
- Replace: `src/components/mobile/screens/MobileDiceScreen.tsx`

### Concepts

- **Check types:** `'skill' | 'combat' | 'force'`
  - **Skill:** Shows all skills in grid. Selecting one auto-fills proficiency + ability.
  - **Combat:** Same as Skill but filters to combat skill keys only.
  - **Force:** Shows only a force dice count stepper (default = `forceRating`).
- **6 regular dice steppers:** proficiency, ability, boost, difficulty, challenge, setback (all clamped ≥ 0).
- **Pool preview:** Renders `DiceFace` for each die in pool.
- **Roll:** `rollPool(pool)` for skill/combat; `rollForceDice(forceDice)` for force.
- **Log:** `logRoll(...)` for skill/combat only (fire-and-forget, skip if campaignId is null).
- **Result:** Slide-in result card at bottom showing net outcome.

### Combat skill keys (filter constant):

```tsx
const COMBAT_SKILL_KEYS = new Set([
  'brawl', 'melee', 'ranged-light', 'ranged-heavy', 'gunnery', 'lightsaber',
])
```

### Complete component:

```tsx
'use client'
import { useState, useMemo }   from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, EASE, HUD, COLOR } from '@/lib/tokens'
import { rollPool, rollForceDice, getSkillPool } from '@/components/player-hud/dice-engine'
import { logRoll }             from '@/lib/logRoll'
import { DiceFace }            from '@/components/dice/DiceFace'
import { createClient }        from '@/lib/supabase/client'
import type { HudSkill }       from '@/lib/types'
import type { RollResult, ForceRollResult } from '@/components/player-hud/dice-engine'
import type { DiceType }       from '@/components/player-hud/design-tokens'

type CheckType = 'skill' | 'combat' | 'force'

const COMBAT_SKILL_KEYS = new Set([
  'brawl', 'melee', 'ranged-light', 'ranged-heavy', 'gunnery', 'lightsaber',
])

interface RegularPool {
  proficiency: number
  ability: number
  boost: number
  difficulty: number
  challenge: number
  setback: number
}

interface MobileDiceScreenProps {
  preSelectedSkill: string | null
  hudSkills: HudSkill[]
  characterId: string
  characterName: string
  campaignId: string | null
  forceRating: number
  supabase: ReturnType<typeof createClient>
}

const STEPPER_LABELS: { key: keyof RegularPool; type: DiceType; label: string }[] = [
  { key: 'proficiency', type: 'proficiency', label: 'Prof' },
  { key: 'ability',     type: 'ability',     label: 'Abil' },
  { key: 'boost',       type: 'boost',       label: 'Boost' },
  { key: 'difficulty',  type: 'difficulty',  label: 'Diff' },
  { key: 'challenge',   type: 'challenge',   label: 'Chal' },
  { key: 'setback',     type: 'setback',     label: 'Setbk' },
]

// Approved exception: force pip colours match MobileIdentityBar / DestinyPoolDisplay
const FORCE_LIGHT_COLOR = '#0EA5E9'
const FORCE_DARK_COLOR  = '#A845F5'
// Approved exception: wounds color for failure/despair (same semantic)
const DANGER_COLOR = '#E85A2A'

export function MobileDiceScreen({
  preSelectedSkill, hudSkills, characterId, characterName, campaignId, forceRating,
}: MobileDiceScreenProps) {
  const [checkType, setCheckType]           = useState<CheckType>('skill')
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(preSelectedSkill)
  const [pool, setPool]                     = useState<RegularPool>(() => {
    const base: RegularPool = { proficiency: 0, ability: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0 }
    if (preSelectedSkill) {
      const skill = hudSkills.find(s => s.key === preSelectedSkill)
      if (skill) {
        const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
        return { ...base, proficiency, ability }
      }
    }
    return base
  })
  const [forceDice, setForceDice]           = useState<number>(Math.max(1, forceRating))
  const [rollResult, setRollResult]         = useState<RollResult | null>(null)
  const [forceResult, setForceResult]       = useState<ForceRollResult | null>(null)
  const [isRolling, setIsRolling]           = useState(false)

  const visibleSkills = useMemo(() => {
    if (checkType === 'combat') return hudSkills.filter(s => COMBAT_SKILL_KEYS.has(s.key))
    return hudSkills
  }, [hudSkills, checkType])

  function selectSkill(skill: HudSkill) {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    setSelectedSkillKey(skill.key)
    setPool(prev => ({ ...prev, proficiency, ability }))
  }

  function stepPool(key: keyof RegularPool, delta: number) {
    setPool(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }))
  }

  function handleRoll() {
    setIsRolling(true)
    setRollResult(null)
    setForceResult(null)

    if (checkType === 'force') {
      const result = rollForceDice(forceDice)
      setForceResult(result)
    } else {
      const fullPool: Record<DiceType, number> = { ...pool, force: 0 }
      const result = rollPool(fullPool)
      setRollResult(result)

      if (campaignId) {
        const selectedSkill = hudSkills.find(s => s.key === selectedSkillKey)
        logRoll({
          campaignId,
          characterId,
          characterName,
          label: selectedSkill ? `${selectedSkill.name} Check` : 'Custom Check',
          pool: fullPool,
          result,
          meta: { rollType: checkType === 'combat' ? 'combat' : 'skill' },
        })
      }
    }
    setIsRolling(false)
  }

  const poolSize = Object.values(pool).reduce((s, n) => s + n, 0)
  const canRoll = checkType === 'force' ? forceDice > 0 : poolSize > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', overscrollBehavior: 'contain' }}>

      {/* ── Check type bar ── */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0,
      }}>
        {(['skill', 'combat', 'force'] as CheckType[]).map(type => (
          <button
            key={type}
            onClick={() => { setCheckType(type); setSelectedSkillKey(null); setRollResult(null); setForceResult(null) }}
            style={{
              flex: 1,
              padding: `${SP[1]} 0`,
              background: checkType === type ? `color-mix(in srgb, var(--hud-accent) 15%, transparent)` : 'transparent',
              border: 'none',
              borderBottom: checkType === type ? `2px solid var(--hud-accent)` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: checkType === type ? 'var(--hud-accent)' : HUD.textFaint,
              transition: `color ${EASE.quick}, background ${EASE.quick}`,
            }}
          >
            {type === 'skill' ? 'Skill' : type === 'combat' ? 'Combat' : 'Force'}
          </button>
        ))}
      </div>

      {/* ── Skill grid (skill / combat modes) ── */}
      {checkType !== 'force' && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '4px', /* compact chip gap */
          padding: SP[2],
          borderBottom: `1px solid var(--hud-border)`,
          flexShrink: 0,
        }}>
          {visibleSkills.map(skill => {
            const isSelected = selectedSkillKey === skill.key
            return (
              <button
                key={skill.key}
                onClick={() => selectSkill(skill)}
                style={{
                  padding: `2px ${SP[2]}`, /* minimum touch size via label, not full height */
                  borderRadius: RADIUS.sm,
                  background: isSelected
                    ? `color-mix(in srgb, var(--hud-accent) 20%, transparent)`
                    : `color-mix(in srgb, var(--hud-border) 30%, transparent)`,
                  border: `1px solid ${isSelected ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
                  cursor: 'pointer',
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: isSelected ? 'var(--hud-accent)' : HUD.textDim,
                  transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {skill.name}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Force mode: single stepper ── */}
      {checkType === 'force' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[3], padding: SP[4] }}>
          <DiceFace type="force" size={32} />
          <button onClick={() => setForceDice(n => Math.max(1, n - 1))} style={stepBtnStyle}>–</button>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, color: HUD.text, minWidth: 24, textAlign: 'center' }}>
            {forceDice}
          </span>
          <button onClick={() => setForceDice(n => n + 1)} style={stepBtnStyle}>+</button>
        </div>
      )}

      {/* ── 6 pool steppers (skill / combat modes) ── */}
      {checkType !== 'force' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: SP[1], padding: SP[2],
          borderBottom: `1px solid var(--hud-border)`,
          flexShrink: 0,
        }}>
          {STEPPER_LABELS.map(({ key, type, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' /* compact */, padding: SP[1] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                <DiceFace type={type} size={16} />
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>
                  {label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                <button onClick={() => stepPool(key, -1)} style={stepBtnStyle}>–</button>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.text, minWidth: 20, textAlign: 'center' }}>
                  {pool[key]}
                </span>
                <button onClick={() => stepPool(key, 1)} style={stepBtnStyle}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pool preview ── */}
      {checkType !== 'force' && poolSize > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '3px', /* compact die gap */
          padding: `${SP[1]} ${SP[2]}`,
          borderBottom: `1px solid var(--hud-border)`,
          flexShrink: 0,
        }}>
          {STEPPER_LABELS.flatMap(({ key, type }) =>
            Array.from({ length: pool[key] }).map((_, i) => (
              <DiceFace key={`${key}-${i}`} type={type} size={22} />
            ))
          )}
        </div>
      )}

      {/* ── Roll button ── */}
      <div style={{ padding: SP[2], flexShrink: 0 }}>
        <button
          onClick={handleRoll}
          disabled={!canRoll || isRolling}
          style={{
            width: '100%',
            padding: `${SP[2]} 0`,
            background: canRoll ? 'var(--hud-accent)' : `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
            border: 'none',
            borderRadius: RADIUS.md,
            cursor: canRoll ? 'pointer' : 'not-allowed',
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: canRoll ? 'var(--hud-bg)' : HUD.textFaint,
            transition: `background ${EASE.quick}`,
          }}
        >
          {isRolling ? 'Rolling…' : 'Roll Dice'}
        </button>
      </div>

      {/* ── Result card (regular roll) ── */}
      {rollResult && (
        <ResultCard result={rollResult} />
      )}

      {/* ── Force result card ── */}
      {forceResult && (
        <ForceResultCard result={forceResult} />
      )}
    </div>
  )
}

// Shared stepper button style object (constant — safe to define outside component)
const stepBtnStyle: React.CSSProperties = {
  width: 28, height: 28, /* fixed tap target */
  borderRadius: RADIUS.sm,
  background: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  border: `1px solid var(--hud-border)`,
  cursor: 'pointer',
  fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
  color: HUD.text,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

function ResultCard({ result }: { result: RollResult }) {
  const { net } = result
  const succeeded = net.success > 0

  return (
    <div style={{
      margin: SP[2],
      background: `color-mix(in srgb, ${succeeded ? 'var(--hud-gold)' : DANGER_COLOR} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${succeeded ? 'var(--hud-gold)' : DANGER_COLOR} 30%, transparent)`,
      borderRadius: RADIUS.md,
      padding: SP[2],
    }}>
      {/* Net success / failure */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: succeeded ? HUD.gold : DANGER_COLOR }}>
        {succeeded
          ? `✓ ${net.success} ${net.success === 1 ? 'Success' : 'Successes'}`
          : net.success < 0
            ? `✗ ${Math.abs(net.success)} ${Math.abs(net.success) === 1 ? 'Failure' : 'Failures'}`
            : 'Wash'}
      </div>

      {/* Advantage / threat */}
      {net.advantage !== 0 && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: net.advantage > 0 ? COLOR.blue : HUD.gold, marginTop: '2px' /* compact */ }}>
          {net.advantage > 0
            ? `+ ${net.advantage} Advantage`
            : `– ${Math.abs(net.advantage)} Threat`}
        </div>
      )}

      {/* Triumph */}
      {net.triumph > 0 && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.gold, marginTop: '2px' }}>
          ⊕ {net.triumph} Triumph
        </div>
      )}

      {/* Despair */}
      {net.despair > 0 && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DANGER_COLOR, marginTop: '2px' /* wounds approved exception */ }}>
          ⊗ {net.despair} Despair
        </div>
      )}
    </div>
  )
}

function ForceResultCard({ result }: { result: ForceRollResult }) {
  return (
    <div style={{
      margin: SP[2],
      background: `color-mix(in srgb, var(--blue) 8%, transparent)`,
      border: `1px solid color-mix(in srgb, var(--blue) 25%, transparent)`,
      borderRadius: RADIUS.md,
      padding: SP[2],
      display: 'flex', gap: SP[3], alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: FORCE_LIGHT_COLOR /* destiny light — sealed exception */ }}>
          {result.light}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>LIGHT</div>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>·</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: FORCE_DARK_COLOR /* destiny dark — sealed exception */ }}>
          {result.dark}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>DARK</div>
      </div>
    </div>
  )
}
```

> **Note on `ForceRollResult` shape:** `rollForceDice` returns `{ light: number, dark: number, dice: ForceDie[] }`. If TypeScript disagrees, check the actual return type in `src/components/player-hud/dice-engine.ts` and adjust field names accordingly.

- [ ] **Build check:** `npm run build` — fix any TypeScript errors before committing.

- [ ] **Commit:**

```bash
git add src/components/mobile/screens/MobileDiceScreen.tsx
git commit -m "feat(mobile): implement MobileDiceScreen — full dice roller with skill grid and roll logging"
```

---

## Task 4: MobileTalentsScreen — Talents Quick Reference

**Files:**
- Replace: `src/components/mobile/screens/MobileTalentsScreen.tsx`

### Data

`HudTalent` (from `@/lib/types`) has at minimum:
- `id: string`
- `name: string`
- `activation: 'taPassive' | 'taAction' | 'taManeuver' | 'taIncidental' | 'taIncidentalOOT'`
- `description?: string`
- `ranked: boolean`
- `rank?: number` — purchased rank count (only for ranked talents)

### Filter tabs

`'all' | 'passive' | 'active' | 'incidental' | 'oot'`

Where "active" shows `taAction` AND `taManeuver`.

### Sort order

OOT (0) → Action (1) → Maneuver (2) → Incidental (3) → Passive (4)

### Card left-border colors (css-var strings — no raw hex)

- Passive: `color-mix(in srgb, var(--blue) 40%, transparent)` border / `COLOR.blue` label
- Action: `color-mix(in srgb, var(--hud-accent) 40%, transparent)` border / `'var(--hud-accent)'` label
- Maneuver: `color-mix(in srgb, var(--hud-gold) 40%, transparent)` border / `HUD.gold` label
- Incidental: `color-mix(in srgb, var(--hud-border-hi) 80%, transparent)` border / `HUD.textFaint` label
- OOT: `color-mix(in srgb, var(--die-difficulty) 40%, transparent)` border / `'var(--die-difficulty)'` label

### Complete component:

```tsx
'use client'
import { useState, useMemo } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, EASE, HUD, COLOR } from '@/lib/tokens'
import type { HudTalent } from '@/lib/types'

type FilterTab = 'all' | 'passive' | 'active' | 'incidental' | 'oot'

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'passive',    label: 'Passive' },
  { id: 'active',     label: 'Active' },
  { id: 'incidental', label: 'Incidental' },
  { id: 'oot',        label: 'OOT' },
]

const SORT_ORDER: Record<string, number> = {
  taIncidentalOOT: 0,
  taAction:        1,
  taManeuver:      2,
  taIncidental:    3,
  taPassive:       4,
}

function getTalentTypeStyle(activation: string): { borderColor: string; labelColor: string; labelText: string } {
  switch (activation) {
    case 'taPassive':       return { borderColor: `color-mix(in srgb, var(--blue) 40%, transparent)`,            labelColor: COLOR.blue,              labelText: 'Passive' }
    case 'taAction':        return { borderColor: `color-mix(in srgb, var(--hud-accent) 40%, transparent)`,       labelColor: 'var(--hud-accent)',      labelText: 'Action' }
    case 'taManeuver':      return { borderColor: `color-mix(in srgb, var(--hud-gold) 40%, transparent)`,         labelColor: HUD.gold,                labelText: 'Maneuver' }
    case 'taIncidental':    return { borderColor: `color-mix(in srgb, var(--hud-border-hi) 80%, transparent)`,   labelColor: HUD.textFaint,           labelText: 'Incidental' }
    case 'taIncidentalOOT': return { borderColor: `color-mix(in srgb, var(--die-difficulty) 40%, transparent)`,  labelColor: 'var(--die-difficulty)', labelText: 'Out of Turn' }
    default:                return { borderColor: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,       labelColor: HUD.textFaint,           labelText: activation }
  }
}

function matchesFilter(talent: HudTalent, filter: FilterTab): boolean {
  if (filter === 'all')        return true
  if (filter === 'passive')    return talent.activation === 'taPassive'
  if (filter === 'active')     return talent.activation === 'taAction' || talent.activation === 'taManeuver'
  if (filter === 'incidental') return talent.activation === 'taIncidental'
  if (filter === 'oot')        return talent.activation === 'taIncidentalOOT'
  return true
}

interface MobileTalentsScreenProps {
  hudTalents: HudTalent[]
}

export function MobileTalentsScreen({ hudTalents }: MobileTalentsScreenProps) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const sorted = useMemo(() => {
    return [...hudTalents]
      .filter(t => matchesFilter(t, filter))
      .sort((a, b) => {
        const ao = SORT_ORDER[a.activation] ?? 99
        const bo = SORT_ORDER[b.activation] ?? 99
        if (ao !== bo) return ao - bo
        return a.name.localeCompare(b.name)
      })
  }, [hudTalents, filter])

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Filter strip ── */}
      <div style={{
        display: 'flex', overflowX: 'auto', scrollbarWidth: 'none',
        gap: SP[1], padding: `${SP[1]} ${SP[2]}`,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0,
      }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              flexShrink: 0,
              padding: `2px ${SP[2]}`, /* compact tap target via row context */
              borderRadius: RADIUS.sm,
              background: filter === tab.id
                ? `color-mix(in srgb, var(--hud-accent) 15%, transparent)`
                : 'transparent',
              border: `1px solid ${filter === tab.id ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
              cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: filter === tab.id ? 700 : 400,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: filter === tab.id ? 'var(--hud-accent)' : HUD.textFaint,
              transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            {tab.label}
          </button>
        ))}
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0, alignSelf: 'center', marginLeft: 'auto' }}>
          {sorted.length}
        </span>
      </div>

      {/* ── Talent list ── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: SP[2], display: 'flex', flexDirection: 'column', gap: SP[1] }}>
        {sorted.length === 0 && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint, textAlign: 'center', paddingTop: SP[4] }}>
            No talents in this category.
          </div>
        )}
        {sorted.map(talent => {
          const { borderColor, labelColor, labelText } = getTalentTypeStyle(talent.activation)
          const isExpanded = expanded.has(talent.id)

          return (
            <button
              key={talent.id}
              onClick={() => toggleExpand(talent.id)}
              style={{
                width: '100%', textAlign: 'left',
                background: `color-mix(in srgb, var(--hud-surface-hi) 60%, transparent)`,
                border: `1px solid var(--hud-border)`,
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: RADIUS.md,
                padding: SP[2],
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '4px', /* compact card stack */
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text, flex: 1 }}>
                  {talent.name}
                  {talent.ranked && talent.rank && talent.rank > 1 && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, marginLeft: SP[1] }}>
                      ×{talent.rank}
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: labelColor, letterSpacing: '0.08em', flexShrink: 0 }}>
                  {labelText}
                </span>
              </div>

              {isExpanded && talent.description && (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.5 }}>
                  {talent.description}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Build check:** `npm run build` — fix any TypeScript errors.

- [ ] **Commit:**

```bash
git add src/components/mobile/screens/MobileTalentsScreen.tsx
git commit -m "feat(mobile): implement MobileTalentsScreen — talent quick reference with filter strip and type cards"
```

---

## Task 5: MobileItemsScreen — Inventory

**Files:**
- Replace: `src/components/mobile/screens/MobileItemsScreen.tsx`

### Types used

- `WpnDisplay` from `@/lib/types` — key fields: `id, name, damage, critical, range, encumbrance, rarity, qualities`
- `ArmDisplay` from `@/lib/types` — key fields: `id, name, defense, soak, encumbrance`
- `GearRow` from `@/lib/types` — key fields: `id, name, encumbrance, quantity`

### Encumbrance bar

- If `encCurrent < encThreshold`: bar fills proportionally, color = `COLOR.blue`
- If `encCurrent >= encThreshold`: bar is full red, color = `#E85A2A` with exception comment

### Section structure

Three sections: **Weapons** / **Armor** / **Gear**. Each section has a sticky-ish header row (eyebrow style) and a list of item rows. Tapping an item opens `MobileBottomSheet` with detail.

### Detail sheet content

Show name (large), then key stats as label/value pairs. Keep it simple — no editing.

- [ ] **Write the file:**

```tsx
'use client'
import { useState }    from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, COLOR } from '@/lib/tokens'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'
import type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'

// Approved exception: over-threshold encumbrance uses wounds colour (same danger semantic)
const DANGER_COLOR = '#E85A2A'

type DetailItem =
  | { kind: 'weapon'; data: WpnDisplay }
  | { kind: 'armor';  data: ArmDisplay }
  | { kind: 'gear';   data: GearRow }

interface MobileItemsScreenProps {
  hudWeapons:   WpnDisplay[]
  hudArmor:     ArmDisplay[]
  hudGear:      GearRow[]
  encCurrent:   number
  encThreshold: number
  credits:      number
}

export function MobileItemsScreen({
  hudWeapons, hudArmor, hudGear, encCurrent, encThreshold, credits,
}: MobileItemsScreenProps) {
  const [detail, setDetail] = useState<DetailItem | null>(null)
  const overEnc = encThreshold > 0 && encCurrent >= encThreshold
  const encPct  = encThreshold > 0 ? Math.min(1, encCurrent / encThreshold) : 0
  const barColor = overEnc ? DANGER_COLOR : COLOR.blue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Enc + Credits header ── */}
      <div style={{
        padding: `${SP[1]} ${SP[2]}`,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {/* Row: Enc label + credits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: overEnc ? DANGER_COLOR : HUD.textFaint /* wounds approved exception */, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Enc
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: barColor }}>
            {encCurrent} / {encThreshold}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em' }}>
            ₵{credits.toLocaleString()}
          </span>
        </div>
        {/* Enc bar */}
        <div style={{ height: 4, borderRadius: RADIUS.sm, background: `color-mix(in srgb, ${barColor} 20%, transparent)`, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${encPct * 100}%`, background: barColor, borderRadius: RADIUS.sm, transition: `width ${EASE.standard}` }} />
        </div>
      </div>

      {/* ── Sectioned list ── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        <SectionHeader title="Weapons" count={hudWeapons.length} />
        {hudWeapons.map(w => (
          <ItemRow key={w.id} label={w.name} subLabel={`${w.damage} Dmg · Crit ${w.critical} · ${w.range}`} onClick={() => setDetail({ kind: 'weapon', data: w })} />
        ))}

        <SectionHeader title="Armor" count={hudArmor.length} />
        {hudArmor.map(a => (
          <ItemRow key={a.id} label={a.name} subLabel={`Def ${a.defense} · Soak +${a.soak}`} onClick={() => setDetail({ kind: 'armor', data: a })} />
        ))}

        <SectionHeader title="Gear" count={hudGear.length} />
        {hudGear.map(g => (
          <ItemRow key={g.id} label={g.name} subLabel={`Enc ${g.encumbrance}${g.quantity > 1 ? ` · ×${g.quantity}` : ''}`} onClick={() => setDetail({ kind: 'gear', data: g })} />
        ))}
      </div>

      {/* ── Detail bottom sheet ── */}
      <MobileBottomSheet open={!!detail} onClose={() => setDetail(null)}>
        {detail && <ItemDetail item={detail} />}
      </MobileBottomSheet>
    </div>
  )
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[1]} ${SP[2]}`,
      background: 'var(--hud-surface-lo)',
      borderBottom: `1px solid var(--hud-border)`,
    }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1 }}>
        {title}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
        {count}
      </span>
    </div>
  )
}

function ItemRow({ label, subLabel, onClick }: { label: string; subLabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: '2px',
        width: '100%', textAlign: 'left',
        padding: `${SP[1]} ${SP[2]}`,
        background: 'transparent', border: 'none',
        borderBottom: `1px solid var(--hud-border)`,
        cursor: 'pointer', minHeight: 44,
        justifyContent: 'center',
      }}
    >
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.06em' }}>
        {subLabel}
      </span>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${SP[1]} 0`, borderBottom: `1px solid var(--hud-border)` }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>{value}</span>
    </div>
  )
}

function ItemDetail({ item }: { item: DetailItem }) {
  if (item.kind === 'weapon') {
    const w = item.data
    return (
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text, marginBottom: SP[2] }}>{w.name}</div>
        <Stat label="Damage"       value={w.damage} />
        <Stat label="Critical"     value={w.critical} />
        <Stat label="Range"        value={w.range} />
        <Stat label="Encumbrance"  value={w.encumbrance} />
        {w.qualities && w.qualities.length > 0 && (
          <Stat label="Qualities" value={w.qualities.map((q: { name: string }) => q.name).join(', ')} />
        )}
      </div>
    )
  }
  if (item.kind === 'armor') {
    const a = item.data
    return (
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text, marginBottom: SP[2] }}>{a.name}</div>
        <Stat label="Defense"     value={a.defense} />
        <Stat label="Soak Bonus"  value={`+${a.soak}`} />
        <Stat label="Encumbrance" value={a.encumbrance} />
      </div>
    )
  }
  const g = item.data
  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text, marginBottom: SP[2] }}>{g.name}</div>
      <Stat label="Encumbrance" value={g.encumbrance} />
      <Stat label="Quantity"    value={g.quantity} />
    </div>
  )
}
```

> **Note:** If `WpnDisplay.qualities` has a different shape in `@/lib/types` (e.g. array of strings), adjust the `.map()` in `ItemDetail` accordingly.

- [ ] **Build check:** `npm run build` — fix any TypeScript errors.

- [ ] **Commit:**

```bash
git add src/components/mobile/screens/MobileItemsScreen.tsx
git commit -m "feat(mobile): implement MobileItemsScreen — inventory with enc bar and bottom sheet detail"
```

---

## Task 6: MobileGroupScreen — Group Info

**Files:**
- Replace: `src/components/mobile/screens/MobileGroupScreen.tsx`

### Data fetched inside this component

```ts
const [campaignData, setCampaignData] = useState<CampaignGroupData | null>(null)
const [duties,       setDuties]       = useState<CharacterDutyRow[]>([])
const [assets,       setAssets]       = useState<GroupAsset[]>([])

useEffect(() => {
  if (!campaignId) return
  Promise.all([
    supabase.from('campaigns').select('contribution_rank, contribution_rank_descriptions, group_name').eq('id', campaignId).single(),
    supabase.from('character_duty').select('id, name, duty_type, duty_value, is_archived').eq('campaign_id', campaignId).eq('is_archived', false),
    supabase.from('group_assets').select('id, name, asset_type, description, is_archived, is_group_storage').eq('campaign_id', campaignId).eq('is_archived', false),
  ]).then(([camp, duty, asset]) => {
    if (camp.data) setCampaignData(camp.data as CampaignGroupData)
    if (duty.data) setDuties(duty.data as CharacterDutyRow[])
    if (asset.data) setAssets(asset.data as GroupAsset[])
  })
}, [campaignId, supabase])
```

### Alliance Standing

- Current rank: `campaignData.contribution_rank`
- Current description: `campaignData.contribution_rank_descriptions?.[String(campaignData.contribution_rank)] ?? ''`
- Next description: `campaignData.contribution_rank_descriptions?.[String((campaignData.contribution_rank ?? 0) + 1)]`

### Imperial Threat — stub

No backing data exists. Render a red-accent card with "Classified — Phase 3" placeholder.

### Destiny pool display

Uses pips passed from MobileHudLayout — same approach as MobileIdentityBar (mask + color per side).

### Approved hex in this file

- `#0EA5E9` for light pip, `#A845F5` for dark pip (same approved exceptions as MobileIdentityBar)

### Complete component:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, COLOR } from '@/lib/tokens'
import { createClient }         from '@/lib/supabase/client'

const DESTINY_LIGHT = '#0EA5E9' /* destiny light pip — sealed exception */
const DESTINY_DARK  = '#A845F5' /* destiny dark pip — sealed exception */
const LIGHT_IMG     = '/images/factions/LightSymbol.png'
const DARK_IMG      = '/images/factions/DarkSymbol.png'

interface CampaignGroupData {
  contribution_rank: number
  contribution_rank_descriptions: Record<string, string>
  group_name?: string | null
}

interface CharacterDutyRow {
  id: string
  name: string
  duty_type: string
  duty_value: number
  is_archived: boolean
}

interface GroupAsset {
  id: string
  name: string
  asset_type: string
  description?: string | null
  is_group_storage: boolean
}

interface MobileGroupScreenProps {
  campaignId:    string | null
  characterId:   string
  characterName: string
  destinyPool:   Array<'light' | 'dark'>
  supabase:      ReturnType<typeof createClient>
}

export function MobileGroupScreen({ campaignId, destinyPool, supabase }: MobileGroupScreenProps) {
  const [campaignData, setCampaignData] = useState<CampaignGroupData | null>(null)
  const [duties,       setDuties]       = useState<CharacterDutyRow[]>([])
  const [assets,       setAssets]       = useState<GroupAsset[]>([])
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!campaignId) return
    Promise.all([
      supabase.from('campaigns').select('contribution_rank, contribution_rank_descriptions, group_name').eq('id', campaignId).single(),
      supabase.from('character_duty').select('id, name, duty_type, duty_value, is_archived').eq('campaign_id', campaignId).eq('is_archived', false),
      supabase.from('group_assets').select('id, name, asset_type, description, is_archived, is_group_storage').eq('campaign_id', campaignId).eq('is_archived', false),
    ]).then(([camp, duty, asset]) => {
      if (camp.data)  setCampaignData(camp.data as CampaignGroupData)
      if (duty.data)  setDuties(duty.data as CharacterDutyRow[])
      if (asset.data) setAssets(asset.data as GroupAsset[])
    })
  }, [campaignId, supabase])

  function toggleAsset(id: string) {
    setExpandedAssets(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rank = campaignData?.contribution_rank ?? 0
  const descriptions = campaignData?.contribution_rank_descriptions ?? {}
  const currentDesc = descriptions[String(rank)] ?? null
  const nextDesc    = descriptions[String(rank + 1)] ?? null

  if (!campaignId) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[4] }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No campaign linked.</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: `${SP[2]} ${SP[2]} ${SP[6]}`, display: 'flex', flexDirection: 'column', gap: SP[3] }}>

      {/* ── Section 1: Destiny Pool ── */}
      <Section title="Destiny Pool">
        {destinyPool.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No destiny tokens.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
            {destinyPool.map((side, i) => {
              const color = side === 'light' ? DESTINY_LIGHT : DESTINY_DARK
              const src   = side === 'light' ? LIGHT_IMG     : DARK_IMG
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 16, height: 16,
                    WebkitMask: `url('${src}') center/contain no-repeat`,
                    mask:        `url('${src}') center/contain no-repeat`,
                    background:  color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {side}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* ── Section 2: Group Duty ── */}
      <Section title="Group Duty">
        {duties.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No duty records.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: SP[2], padding: `${SP[1]} 0`, borderBottom: `1px solid var(--hud-border)` }}>
              {['Character', 'Duty Type', 'Value'].map(h => (
                <span key={h} style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {duties.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: SP[2], padding: `${SP[1]} 0`, borderBottom: `1px solid var(--hud-border)` }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim }}>{d.duty_type}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.gold }}>{d.duty_value}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Section 3: Alliance Standing ── */}
      <Section title="Alliance Standing">
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[1] }}>
          <div style={{
            background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)`,
            borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`,
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: 'var(--hud-accent)', letterSpacing: '0.1em',
          }}>
            RANK {rank}
          </div>
          {currentDesc && (
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>{currentDesc}</span>
          )}
        </div>
        {nextDesc && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.06em' }}>
            Next → {nextDesc}
          </div>
        )}
      </Section>

      {/* ── Section 4: Imperial Threat — Phase 3 stub ── */}
      <div style={{
        background: `color-mix(in srgb, ${DANGER_COLOR} 5%, transparent)`,
        border: `1px solid color-mix(in srgb, ${DANGER_COLOR} 22%, transparent)`,
        borderRadius: RADIUS.md, padding: SP[2],
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], marginBottom: SP[1] }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DANGER_COLOR, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ⚠ Imperial Threat
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
          Classified — threat tracking coming in Phase 3.
        </div>
      </div>

      {/* ── Section 5: Group Assets ── */}
      <Section title="Group Assets">
        {assets.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No group assets.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {assets.map(a => {
              const isExpanded = expandedAssets.has(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAsset(a.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: `color-mix(in srgb, var(--hud-surface-hi) 60%, transparent)`,
                    border: `1px solid var(--hud-border)`,
                    borderRadius: RADIUS.md, padding: SP[2],
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text, flex: 1 }}>{a.name}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em' }}>
                      {a.asset_type.replace(/_/g, ' ')}
                    </span>
                    {a.is_group_storage && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: COLOR.blue, letterSpacing: '0.06em' }}>Storage</span>
                    )}
                  </div>
                  {isExpanded && a.description && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.5 }}>
                      {a.description}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        marginBottom: SP[1], paddingBottom: SP[1],
        borderBottom: `1px solid var(--hud-border)`,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// Approved exception for Imperial Threat card — same wounds colour, same danger semantic
const DANGER_COLOR = '#E85A2A'
```

> **Note:** If the `character_duty` table has additional columns (like `duty_custom_name`), the TypeScript type above is a minimal subset — add fields as needed. The `campaigns` select query may need to be extended if `contribution_rank_descriptions` is nested under `settings` (check GroupSheet.tsx for the exact column path).

- [ ] **Build check:** `npm run build` — fix any TypeScript errors.

- [ ] **Commit:**

```bash
git add src/components/mobile/screens/MobileGroupScreen.tsx
git commit -m "feat(mobile): implement MobileGroupScreen — destiny pool, duty table, alliance standing, assets"
```

---

## Task 7: Final Build Verification + Architecture Update

**Files:**
- Read/check: all modified files
- Modify: `docs/architecture.md`

- [ ] **Full build:**

```bash
npm run build
```

Expected output: zero errors, zero TypeScript complaints. If there are any remaining `// @ts-expect-error` comments added in Task 2, they should now be removable — remove them and rebuild.

- [ ] **Token compliance self-audit** — for every file touched in this plan, scan inline `style={}` for:
  - [ ] Zero raw hex values (except the four approved ones: `#E85A2A`, `#0EA5E9`, `#A845F5`, `#4A7A30`)
  - [ ] Zero raw `px` font sizes — all use `FS.*`
  - [ ] Zero raw transition timing strings — all use `EASE.*`
  - [ ] Zero raw z-index numbers — all use `Z.*`
  - [ ] Zero `onMouseEnter`/`onMouseLeave` style mutations
  - [ ] Zero `var(--token)HH` opacity patterns

- [ ] **Update `docs/architecture.md`** — add these entries to the Mobile section:

```
### New in Phase 2
- src/components/mobile/MobileBottomSheet.tsx — portal slide-up overlay (createPortal to document.body), used by MobileItemsScreen
- src/components/mobile/screens/MobileDiceScreen.tsx — full dice roller (check type bar, skill grid, 6 steppers, pool preview, rollPool / rollForceDice, logRoll)
- src/components/mobile/screens/MobileTalentsScreen.tsx — talent quick reference (filter by activation, OOT→Action→Maneuver→Incidental→Passive sort, expand-in-place description)
- src/components/mobile/screens/MobileItemsScreen.tsx — inventory (enc bar, weapons/armor/gear sections, MobileBottomSheet detail)
- src/components/mobile/screens/MobileGroupScreen.tsx — group screen (destiny pool display, character_duty table, alliance standing from contribution_rank, group_assets expand-in-place; imperial threat Phase 3 stub)

### Phase 1 fixes applied in Phase 2
- MobileIdentityBar — portraitUrl prop + Next.js Image with initials fallback
- MobileRunner — Feed tab rectangular (borderRadius: 0), strip height: 48px
- MobileBottomNav — minHeight: 44 on all non-FAB nav buttons
- MobileHudLayout — destructures hudTalents/hudWeapons/hudArmor/hudGear; passes them to screens; passes supabase to MobileDiceScreen and MobileGroupScreen
```

- [ ] **Final commit:**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture.md for Mobile HUD Phase 2 screens and fixes"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] F1 portrait image → Task 0
- [x] F2 rectangular Feed tab → Task 0
- [x] F3 44 px tap targets → Task 0
- [x] MobileBottomSheet portal → Task 1
- [x] MobileHudLayout prop wiring → Task 2
- [x] Dice: check type bar, skill grid, combat skill filter, force mode, 6 steppers, pool preview, roll button, logRoll, result display → Task 3
- [x] Talents: filter strip (All/Passive/Active/Incidental/OOT), type cards with left border, OOT→Active→Maneuver→Incidental→Passive sort, expand description → Task 4
- [x] Items: credits+enc header, enc bar (over-threshold red), weapons/armor/gear sections, bottom sheet detail → Task 5
- [x] Group: destiny pool, duty table, alliance standing (rank+desc+next), imperial threat stub, group assets expand-in-place → Task 6
- [x] Architecture doc updated → Task 7

**Type consistency across tasks:**
- `HudSkill` — used in Task 2 (MobileHudLayout) and Task 3 (MobileDiceScreen) — same type from `@/lib/types`
- `HudTalent.activation` values: `taPassive | taAction | taManeuver | taIncidental | taIncidentalOOT` — used in Task 4
- `WpnDisplay / ArmDisplay / GearRow` — used in Task 2 and Task 5
- `CharacterDutyRow` — defined locally in Task 6 (no shared type needed; fields are a subset of the DB row)

**Token violations in plan:**
- All raw hex values documented with approved-exception comments
- `EASE.*` used throughout (no raw timing strings)
- `SP[N]` used throughout (no raw px spacing except geometry minimums with comments)
- No `RADIUS.full` pill shapes on interactive elements (only on circular geometry)
