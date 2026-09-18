# GM Party Panel — Compact Cards + Character Dossier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the GM Party panel's always-expanded PC cards + `GmCharacterModal` with a compact horizontal-strip card and a FLIP-opening Character Dossier (characteristics, vitals, inventory+encumbrance, Skill/Combat check console with Force dice), reusing every existing mutation/data path — no new tables, no new write paths except the explicitly-approved new PC check console.

**Architecture:** `GmCharacterDossier.tsx` (new) calls `useCharacterData(character.id)` directly — this hook already exposes character, weapons/armor/gear, `encumbranceStats`, and every mutation (`handleVitalChange/Adjust`, `handleToggleEquippedById`, `handleRemoveWeapon/Equipment`) the player HUD uses, so the dossier needs **zero new data-fetching or mutation code** for those concerns. `PcCheckConsole.tsx` (new) is the one genuinely new piece: pool math against real character skill ranks/characteristics, reusing `rollPool`/`logRoll` verbatim. `GmPartyMiniCard.tsx` is rewritten to a compact non-editable strip. `GmPartyPanel.tsx` gains bulk token controls and swaps `GmCharacterModal` for the new dossier.

**Tech Stack:** Next.js (App Router, non-standard version — see `node_modules/next/dist/docs/`), React, TypeScript, Supabase (`@supabase/supabase-js`), GSAP (already a project dependency for HUD animation), no unit test runner — verification is `npm run build` (TypeScript check) + live Playwright per project convention.

**Spec:** `docs/superpowers/specs/2026-09-18-gm-party-panel-dossier-design.md`

## Global Constraints

- All design tokens from `src/lib/tokens.ts` — never inline hex/px/z-index/timing literals (see CLAUDE.md Design System Rules / Shinkei Enforcement). Use `COLOR`, `HUD`, `FS`, `SP`, `RADIUS`, `Z`, `EASE`, `FONT_BODY`, `FONT_DISPLAY`.
- No `style={{ }}` raw literals for color/size/spacing/z-index/radius/transition — CSS custom properties or token constants only. `panelBase` from tokens is the only shared inline-style spread allowed.
- No `onMouseEnter`/`onMouseLeave` style mutation — CSS classes/`:hover` only.
- Two fonts only: Space Grotesk (`FONT_DISPLAY`) for numerals/headings, JetBrains Mono (`FONT_BODY`/`FONT_MONO`) for everything else.
- Every task that adds/removes/renames a route, hook, table, component, or utility file must update `docs/architecture.md` before that task is considered done (CLAUDE.md root rule).
- Encumbrance amber/red tiers use the real RAW `cliff` (`threshold + Brawn`), not a flat "+5" (confirmed during brainstorming — overrides the mockup's placeholder).
- Rolls from the PC check console are always public (`logRoll({ isDM: true, hidden: false, ... })`) — no hidden-roll option.
- Live verification uses an **unarchived-then-rearchived** existing character (user-approved method) — never mutate a live in-session PC's data as a side effect of testing.
- Never write `character_weapons.attachments` / `character_armor.attachments` directly — that's the mod-install RPC's job, untouched by this plan.
- Adversary dossier / `CheckConsole.tsx` / Encounter Deck / MapToolsRadial / player-side inventory UI are **out of scope** — do not modify.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/app/gm/panels/GmPartyMiniCard.tsx` | Rewrite | Compact horizontal-strip card, status rail, no editable controls |
| `src/app/gm/panels/GmPartyPanel.tsx` | Modify | Bulk token controls header, threads token props, opens `GmCharacterDossier` instead of `GmCharacterModal` |
| `src/app/gm/panels/GmCharacterModal.tsx` | Delete | Fully superseded by `GmCharacterDossier.tsx` |
| `src/components/gm/GmCharacterDossier.tsx` | Create | 3-column FLIP dossier: hero / characteristics+vitals+chips+inventory / check console |
| `src/components/gm/PcCheckConsole.tsx` | Create | Skill/Combat check tabs, 3×2 stepper grid, Force die row, roll+log |
| `src/app/gm/GmShell.tsx` | Modify | Passes `tokens`, `addToken`, `removeToken`, `mapId`, `onMapCharIds` into `GmPartyPanel` |
| `docs/architecture.md` | Modify | Document new/removed components |

---

## Task 1: Thread token data into `GmPartyPanel`

**Files:**
- Modify: `src/app/gm/GmShell.tsx` (the `<GmPartyPanel ...>` call found near line 531, and wherever `stagingTokens`/`stagingAddToken`/`stagingRemoveToken`/`activeMap?.id` are already defined — same values already passed to `GmMapPanel` at lines 501-510)
- Modify: `src/app/gm/panels/GmPartyPanel.tsx`

**Interfaces:**
- Consumes: `useMapTokens` types — `MapToken` (`src/hooks/useMapTokens.ts:6-25`), `addToken(token: Omit<MapToken,'id'|'updated_at'>): Promise<MapToken|null>`, `removeToken(id: string): Promise<void>` — already instantiated in `GmShell.tsx` as `stagingTokens`/`stagingAddToken`/`stagingRemoveToken`.
- Produces: `GmPartyPanelProps` gains `mapId: string | null`, `tokens: MapToken[]`, `addToken: GmPartyPanel's addToken prop`, `removeToken: GmPartyPanel's removeToken prop` — consumed by Task 5/6.

- [ ] **Step 1: Add new props to `GmPartyPanelProps` in `GmPartyPanel.tsx`**

```tsx
// src/app/gm/panels/GmPartyPanel.tsx
import type { MapToken } from '@/hooks/useMapTokens'

export interface GmPartyPanelProps extends CardCallbacks {
  campaignId:        string
  characters:        Character[]
  charCrits:         Record<string, CharacterCriticalInjury[]>
  charConflicts:     Record<string, GmConflictRow[]>
  onHealCrit:        (id: string) => void
  onResolveConflict: (id: string) => void
  onRestored:        (char: Character) => void
  mapId:             string | null
  tokens:            MapToken[]
  addToken:          (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:       (id: string) => Promise<void>
}
```

- [ ] **Step 2: Destructure the new props in `GmPartyPanel`'s function signature**

```tsx
export function GmPartyPanel({
  campaignId, characters, charCrits, charConflicts, onHealCrit, onResolveConflict, onRestored,
  mapId, tokens, addToken, removeToken,
  ...cardCallbacks
}: GmPartyPanelProps) {
```

- [ ] **Step 3: Pass the new values from `GmShell.tsx`'s `<GmPartyPanel>` call**

Find the existing `<GmPartyPanel campaignId={...} characters={...} ... />` block in `GmShell.tsx` (around line 531) and add:

```tsx
              <GmPartyPanel
                campaignId={campaignId ?? ''}
                characters={activeChars}
                mapId={activeMap?.id ?? null}
                tokens={stagingTokens}
                addToken={stagingAddToken}
                removeToken={stagingRemoveToken}
                // ...existing props unchanged below
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: TypeScript compiles clean — no unused-prop or missing-prop errors on `GmPartyPanel`/`GmShell`.

- [ ] **Step 5: Commit**

```bash
git add src/app/gm/GmShell.tsx src/app/gm/panels/GmPartyPanel.tsx
git commit -m "feat(gm-party): thread map token data into GmPartyPanel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Rewrite `GmPartyMiniCard` as a compact horizontal strip

**Files:**
- Modify: `src/app/gm/panels/GmPartyMiniCard.tsx`
- Modify: `src/app/gm/panels/GmPartyPanel.tsx` (update the `<GmPartyMiniCard>` call site)

**Interfaces:**
- Consumes: `Character` (`src/lib/types.ts:439`), `CharacterCriticalInjury`, `CriticalInjuryPip`/`CritPip` (`src/components/character/CriticalInjuryPip.tsx` — unchanged import), `HUD`/`FONT_BODY`/`FS`/`EASE`/`RADIUS` from `@/lib/tokens`.
- Produces: `GmPartyMiniCardProps` — `character: Character`, `onMap: boolean`, `critCount: number`, `onClick: () => void`. No mutation callbacks (steppers removed).

- [ ] **Step 1: Replace `GmPartyMiniCard.tsx`'s props and JSX with the compact strip**

```tsx
// src/app/gm/panels/GmPartyMiniCard.tsx
'use client'

import type { Character } from '@/lib/types'
import { HUD, FONT_BODY as FONT, FS, EASE, RADIUS } from '@/lib/tokens'

interface Props {
  character: Character
  onMap:     boolean
  critCount: number
  onClick:   () => void
}

export function GmPartyMiniCard({ character: c, onMap, critCount, onClick }: Props) {
  const wPct   = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
  const sPct   = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
  const isDown = c.wound_current >= c.wound_threshold

  return (
    <div
      className="hov-lift"
      onClick={onClick}
      style={{
        display:      'flex',
        alignItems:   'stretch',
        height:       '4.625rem',
        background:   'var(--hud-surface-mid)',
        border:       '1px solid var(--hud-border-hi)',
        borderLeft:   '3px solid var(--hud-accent-purple)',
        borderRadius: RADIUS.md,
        overflow:     'hidden',
        cursor:       'pointer',
        transition:   `border-color ${EASE.quick}`,
        position:     'relative',
      }}
    >
      {/* Portrait */}
      <div style={{ width: '4.625rem', flexShrink: 0, background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
        {c.portrait_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Identity + bars */}
      <div style={{ flex: 1, minWidth: 0, padding: `${SP[2]} ${SP[2]}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: SP[1] }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: FS.sm, color: HUD.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.name}
        </div>
        <div style={{ fontFamily: FONT, fontSize: FS.overline, color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.species_key} · {c.career_key}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem', marginTop: '0.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <span style={{ fontFamily: FONT, fontSize: '7px', fontWeight: 700, color: 'var(--hud-vital-wounds)', width: '0.5rem' }}>W</span>
            <span style={{ flex: 1, height: '3.5px', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${wPct}%`, background: isDown ? 'var(--hud-vital-wounds)' : HUD.gold, borderRadius: RADIUS.sm }} />
            </span>
            <span style={{ fontFamily: FONT, fontSize: FS.caption, color: HUD.text, minWidth: '2.25rem', textAlign: 'right' }}>
              {c.wound_current}<span style={{ color: HUD.textFaint }}>/{c.wound_threshold}</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <span style={{ fontFamily: FONT, fontSize: '7px', fontWeight: 700, color: 'var(--die-force)', width: '0.5rem' }}>S</span>
            <span style={{ flex: 1, height: '3.5px', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${sPct}%`, background: sPct >= 100 ? 'var(--hud-vital-wounds)' : 'var(--die-force)', borderRadius: RADIUS.sm }} />
            </span>
            <span style={{ fontFamily: FONT, fontSize: FS.caption, color: HUD.text, minWidth: '2.25rem', textAlign: 'right' }}>
              {c.strain_current}<span style={{ color: HUD.textFaint }}>/{c.strain_threshold}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Crit badge */}
      {critCount > 0 && (
        <span style={{
          position: 'absolute', top: SP[1], right: '1.75rem',
          fontFamily: FONT, fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.06em',
          color: '#fff', background: 'var(--state-failure)', borderRadius: RADIUS.sm,
          padding: '0.09375rem 0.3125rem',
        }}>
          CRIT{critCount > 1 ? ` ×${critCount}` : ''}
        </span>
      )}

      {/* Status rail */}
      <div style={{
        width: '1.625rem', flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: SP[1],
        borderLeft: '1px solid var(--hud-border)', background: 'var(--hud-surface-lo)',
      }}>
        <span
          className={onMap ? 'gm-party-tokdot on' : 'gm-party-tokdot'}
          title={onMap ? 'Token on map' : 'No token on map'}
        />
        {c.is_force_sensitive && (
          <span className="gm-party-forcedot" title="Force-sensitive" />
        )}
      </div>
    </div>
  )
}
```

Note: import `SP` alongside the other token imports (`HUD, FONT_BODY as FONT, FS, EASE, RADIUS, SP`).

- [ ] **Step 2: Add the two status-dot CSS classes to `globals.css`** (hover/state classes belong in CSS per Design System Rules, not inline)

```css
/* Party panel status rail dots */
.gm-party-tokdot {
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: var(--radius-full, 50%);
  border: 1.5px solid var(--hud-text-faint);
  display: block;
}
.gm-party-tokdot.on {
  background: var(--state-success);
  border-color: var(--state-success);
  box-shadow: 0 0 6px color-mix(in srgb, var(--state-success) 60%, transparent);
}
.gm-party-forcedot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full, 50%);
  background: var(--hud-accent-purple);
  box-shadow: 0 0 6px color-mix(in srgb, var(--hud-accent-purple) 55%, transparent);
  display: block;
}
```

(Confirm `--radius-full` exists in `holo-tokens.css`; if not, use `50%` literal directly since border-radius on a circular dot is not a design-scale value covered by `RADIUS.*` — flag if `--state-success` / `--hud-accent-purple` custom properties don't already exist and substitute the correct existing token names found in `globals.css`/`holo-tokens.css` during implementation.)

- [ ] **Step 3: Update the call site in `GmPartyPanel.tsx`**

Replace the existing `<GmPartyMiniCard ... />` block (currently passing `onAddWound`/`onHealWound`/etc.) with:

```tsx
          {characters.map(c => (
            <GmPartyMiniCard
              key={c.id}
              character={c}
              onMap={tokens.some(t => t.character_id === c.id)}
              critCount={cardCallbacks.charActiveCritCounts?.[c.id] ?? 0}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
```

(Confirm the exact prop name for the crit-count map — Step 0 audit named it `charActiveCritCounts`; verify its value shape is `Record<string, number>` by reading its type where `GmCharacterCardProps` declares it, and adjust the property access if it's shaped differently, e.g. an array needing `.length`.)

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: clean compile.

- [ ] **Step 5: Commit**

```bash
git add src/app/gm/panels/GmPartyMiniCard.tsx src/app/gm/panels/GmPartyPanel.tsx src/app/globals.css
git commit -m "feat(gm-party): rewrite party card as compact non-editable strip

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `GmCharacterDossier` — hero column + characteristics + vitals + defense chips

**Files:**
- Create: `src/components/gm/GmCharacterDossier.tsx`
- Modify: `src/app/gm/panels/GmPartyPanel.tsx` (swap `GmCharacterModal` for `GmCharacterDossier`)

**Interfaces:**
- Consumes: `useCharacterData(characterId: string)` (`src/hooks/useCharacterData.ts:439`) — returns (relevant subset) `{ character, weapons, armor, gear, loading, encumbranceCurrent, encumbranceThreshold, encumbranceStats, forceRating, skillRankMap, refSkillMap, hudWeapons, hudGear, handleVitalChange, handleVitalAdjust, handleToggleEquippedById, handleRemoveWeapon, handleRemoveEquipment }`. `handleArchive` from `useGmCharacterActions.ts:553`. `addToken`/`removeToken` (Task 1's threaded props). `MapToken` type.
- Produces: `GmCharacterDossierProps` — `character: Character`, `campaignId: string`, `mapId: string | null`, `tokens: MapToken[]`, `addToken`, `removeToken`, `onArchive: (id: string) => void`, `onClose: () => void`, `originRect: DOMRect | null` (for FLIP — populated by the card's click handler in Task 6). Inventory/check-console pieces added in Tasks 4-5 read from the same `useCharacterData` call — do not call the hook twice.

- [ ] **Step 1: Create the dossier shell with hero + characteristics + vitals + chips (no inventory/check-console yet — those render as placeholders)**

```tsx
// src/components/gm/GmCharacterDossier.tsx
'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useCharacterData } from '@/hooks/useCharacterData'
import type { Character } from '@/lib/types'
import type { MapToken } from '@/hooks/useMapTokens'
import { HUD, FONT_BODY as FONT, FONT_DISPLAY, FS, SP, RADIUS, Z } from '@/lib/tokens'

export interface GmCharacterDossierProps {
  character:   Character
  campaignId:  string
  mapId:       string | null
  tokens:      MapToken[]
  addToken:    (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken: (id: string) => Promise<void>
  onArchive:   (id: string) => void
  onClose:     () => void
}

const CHAR_ROW: Array<[keyof Character, string]> = [
  ['brawn', 'BR'], ['agility', 'AG'], ['intellect', 'INT'],
  ['cunning', 'CUN'], ['willpower', 'WIL'], ['presence', 'PR'],
]

export function GmCharacterDossier({ character, campaignId, mapId, tokens, addToken, removeToken, onArchive, onClose }: GmCharacterDossierProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const {
    character: liveChar, loading,
    handleVitalChange, handleVitalAdjust,
    forceRating,
  } = useCharacterData(character.id)

  if (!mounted) return null
  const c = liveChar ?? character
  const existingToken = tokens.find(t => t.character_id === c.id)
  const onMap = !!existingToken

  async function toggleToken() {
    if (onMap && existingToken) {
      await removeToken(existingToken.id)
    } else if (mapId) {
      await addToken({
        map_id: mapId, campaign_id: campaignId, participant_type: 'pc',
        character_id: c.id, participant_id: null, slot_key: null,
        label: c.name, alignment: 'pc', x: 0.5, y: 0.5,
        is_visible: true, token_size: 1.0, wound_pct: null,
        token_image_url: c.portrait_url ?? null, token_shape: 'circle',
      })
    }
  }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,9,0.72)', backdropFilter: 'blur(3px)', zIndex: Z.backdrop }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        zIndex: Z.modal, width: 'min(58.75rem, 96vw)',
        background: 'var(--hud-panel)', border: '1px solid var(--hud-border-hi)',
        boxShadow: '0 26px 90px rgba(0,0,0,0.75)',
      }}>
        <div style={{ height: '3px', background: 'var(--hud-accent-purple)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '14rem 1fr 18.75rem', minHeight: '32.5rem' }}>

          {/* Hero */}
          <div style={{ borderRight: '1px solid var(--hud-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: '15rem', background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
              {c.portrait_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ padding: SP[3], borderTop: '1px solid var(--hud-border)', display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: FS.lg, textTransform: 'uppercase', color: HUD.text }}>
                {c.name}
              </div>
              <div style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', color: HUD.textFaint, textTransform: 'uppercase' }}>
                {c.species_key} · {c.career_key}
                {c.is_force_sensitive && <span style={{ color: 'var(--die-force)' }}> · ◆ FORCE FR {forceRating}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
                <button className="gm-dossier-ctlbtn" onClick={toggleToken}>
                  {onMap ? '⌖ REMOVE FROM MAP' : '◈ ADD TO MAP'}
                </button>
                <button className="gm-dossier-ctlbtn" onClick={() => onArchive(c.id)}>
                  ▤ ARCHIVE CHARACTER
                </button>
              </div>
            </div>
          </div>

          {/* Centre column */}
          <div style={{ padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[4], overflowY: 'auto', maxHeight: '40rem' }}>
            <div>
              <span className="gm-dossier-slabel">Characteristics</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: SP[2], marginTop: SP[2] }}>
                {CHAR_ROW.map(([field, label]) => (
                  <div key={label} className="gm-dossier-hex">
                    <b>{c[field] as number}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="gm-dossier-slabel">Vitals</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], marginTop: SP[2] }}>
                <VitalRow label="WOUNDS" color="var(--hud-vital-wounds)" current={c.wound_current} max={c.wound_threshold}
                  onDec={() => handleVitalAdjust('wound', -1)} onInc={() => handleVitalAdjust('wound', 1)} />
                <VitalRow label="STRAIN" color="var(--die-force)" current={c.strain_current} max={c.strain_threshold}
                  onDec={() => handleVitalAdjust('strain', -1)} onInc={() => handleVitalAdjust('strain', 1)} />
              </div>
            </div>

            <div>
              <span className="gm-dossier-slabel">Defense</span>
              <div style={{ display: 'flex', gap: SP[2], marginTop: SP[2] }}>
                <Chip value={c.soak} label="SOAK" />
                <Chip value={c.defense_melee} label="M DEF" />
                <Chip value={c.defense_ranged} label="R DEF" />
                {c.is_force_sensitive && <Chip value={forceRating ?? 0} label="FORCE" force />}
              </div>
            </div>

            {/* Inventory section — added in Task 4 */}
          </div>

          {/* Check console — added in Task 5 */}
          <div style={{ borderLeft: '1px solid var(--hud-border)', background: 'rgba(0,0,0,0.25)' }} />
        </div>
      </div>
    </>,
    document.body,
  )
}

function VitalRow({ label, color, current, max, onDec, onInc }: { label: string; color: string; current: number; max: number; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: `${SP[2]} ${SP[3]}` }}>
      <span style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', color, flex: 1 }}>{label}</span>
      <button className="gm-dossier-stepbtn" onClick={onDec}>−</button>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: FS.xl, minWidth: '3.75rem', textAlign: 'center', color: HUD.text }}>
        {current}<small style={{ fontSize: FS.overline, color: HUD.textFaint, fontWeight: 400 }}>/{max}</small>
      </span>
      <button className="gm-dossier-stepbtn" onClick={onInc}>＋</button>
    </div>
  )
}

function Chip({ value, label, force }: { value: number; label: string; force?: boolean }) {
  return (
    <div className={force ? 'gm-dossier-chip force' : 'gm-dossier-chip'}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}
```

Note: `handleVitalAdjust`'s exact signature must be confirmed against `useCharacterData.ts:701` before finalizing this file — if it takes `(field: 'wound'|'strain', delta: number)` as assumed above, this is correct; if it takes different argument names/order, adjust to match exactly (do not guess a second time — read the function before writing this step for real).

- [ ] **Step 2: Add the dossier's static CSS classes to `globals.css`**

```css
.gm-dossier-ctlbtn {
  display: flex; align-items: center; justify-content: center; gap: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-overline);
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: var(--space-2) 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--hud-border-hi);
  color: var(--hud-text-dim);
  background: none;
  cursor: pointer;
  transition: color var(--ease-quick), border-color var(--ease-quick);
}
.gm-dossier-ctlbtn:hover { color: var(--hud-gold); border-color: var(--hud-gold); }

.gm-dossier-slabel {
  font-family: var(--font-body);
  font-size: var(--text-overline);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--hud-gold);
}

.gm-dossier-hex {
  position: relative;
  aspect-ratio: 1 / 1.1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1px;
  background: var(--hud-surface-lo);
  border: 1px solid var(--hud-border);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}
.gm-dossier-hex b { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; color: #fff; line-height: 1; }
.gm-dossier-hex span { font-size: 7.5px; font-weight: 700; letter-spacing: 0.08em; color: var(--hud-text-faint); }

.gm-dossier-stepbtn {
  width: 1.5rem; height: 1.5rem;
  border: 1px solid var(--hud-border-hi);
  border-radius: var(--radius-sm);
  color: var(--hud-text-dim);
  background: none;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color var(--ease-quick), border-color var(--ease-quick);
}
.gm-dossier-stepbtn:hover { color: var(--hud-gold); border-color: var(--hud-gold); }

.gm-dossier-chip {
  flex: 1; text-align: center;
  background: var(--hud-surface-lo);
  border: 1px solid var(--hud-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-1);
}
.gm-dossier-chip b { font-family: var(--font-display); font-size: var(--text-lg); display: block; line-height: 1.1; color: var(--hud-text); }
.gm-dossier-chip span { font-size: 7.5px; letter-spacing: 0.1em; color: var(--hud-text-faint); font-weight: 700; }
.gm-dossier-chip.force { border-color: color-mix(in srgb, var(--die-force) 30%, transparent); }
.gm-dossier-chip.force b { color: var(--die-force); }
```

Confirm `--ease-quick` and `--text-overline`/`--text-lg`/`--text-xl`/`--text-sm` custom properties exist in `holo-tokens.css` before using them verbatim; if the project uses different names for the same scale, use those instead (do not invent new tokens).

- [ ] **Step 3: Wire `GmPartyPanel.tsx` to render `GmCharacterDossier` instead of `GmCharacterModal`**

```tsx
// GmPartyPanel.tsx — replace the GmCharacterModal import and usage
import { GmCharacterDossier } from '@/components/gm/GmCharacterDossier'
// ...
      {selected && (
        <GmCharacterDossier
          character={selected}
          campaignId={campaignId}
          mapId={mapId}
          tokens={tokens}
          addToken={addToken}
          removeToken={removeToken}
          onArchive={id => { cardCallbacks.onArchiveConfirm?.(id); setSelectedId(null) }}
          onClose={() => setSelectedId(null)}
        />
      )}
```

Confirm the exact archive callback name/signature from `CardCallbacks` (`onArchiveConfirm` was named in the Step 0 audit as reached through `handleArchive` — verify the prop actually threaded into `GmPartyPanel` today calls that function, and use its real name/signature here, not a guessed one).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: clean compile — no leftover references to `GmCharacterModal` from `GmPartyPanel.tsx`. (Keep `GmCharacterModal.tsx` on disk until Task 6 confirms nothing else imports it, then delete.)

- [ ] **Step 5: Live-verify hero/characteristics/vitals/chips**

Using an unarchived test character (per user-approved method): open the GM Party panel, click a card, confirm the dossier opens showing correct portrait/name/species·career, six characteristic hexes with real values, wound/strain steppers that move the numbers and persist on reload, and Soak/M Def/R Def (+Force chip if force-sensitive) chips. Re-archive the character when done. Use the Playwright harness per CLAUDE.md's Browser Verification section (`NODE_PATH` pointing at the npx-cached `playwright` package) to screenshot and confirm.

- [ ] **Step 6: Commit**

```bash
git add src/components/gm/GmCharacterDossier.tsx src/app/gm/panels/GmPartyPanel.tsx src/app/globals.css
git commit -m "feat(gm-party): add character dossier hero/characteristics/vitals/chips

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Dossier — inventory section with encumbrance readout

**Files:**
- Modify: `src/components/gm/GmCharacterDossier.tsx`

**Interfaces:**
- Consumes: `useCharacterData`'s `weapons: CharacterWeapon[]`, `armor: CharacterArmor[]`, `gear: CharacterGear[]`, `hudWeapons: WpnDisplay[]`, `hudArmor: ArmDisplay[]`, `hudGear: GearRow[]` (each row has `.id`, `.name`, `.enc`, `.equipState`), `encumbranceCurrent: number`, `encumbranceThreshold: number`, `encumbranceStats: EncumbranceStats` (has `.cliff`), `handleToggleEquippedById(id: string, type: 'weapon'|'armor'|'gear'): void`, `handleRemoveWeapon(id: string, droppedBy?: string, droppedNote?: string): void`, `handleRemoveEquipment(id: string, type: 'armor'|'gear', droppedBy?: string, droppedNote?: string): void`.
- Produces: nothing new consumed elsewhere — self-contained section of the dossier.

- [ ] **Step 1: Add the inventory section to the centre column, after the Defense chips block**

```tsx
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: SP[2] }}>
                <span className="gm-dossier-slabel">Inventory</span>
                <EncReadout current={encumbranceCurrent} threshold={encumbranceThreshold} cliff={encumbranceStats?.cliff ?? encumbranceThreshold} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[2] }}>
                {hudWeapons.map(w => (
                  <InvRow key={w.id} name={w.name} enc={w.enc} equipState={w.equipState}
                    onCycle={() => handleToggleEquippedById(w.id, 'weapon')}
                    onDrop={() => handleRemoveWeapon(w.id)} />
                ))}
                {hudArmor.map(a => (
                  <InvRow key={a.id} name={a.name} enc={a.enc} equipState={a.equipState}
                    onCycle={() => handleToggleEquippedById(a.id, 'armor')}
                    onDrop={() => handleRemoveEquipment(a.id, 'armor')} />
                ))}
                {hudGear.map(g => (
                  <InvRow key={g.id} name={g.name} enc={g.enc} equipState={g.equipState}
                    onCycle={() => handleToggleEquippedById(g.id, 'gear')}
                    onDrop={() => handleRemoveEquipment(g.id, 'gear')} />
                ))}
                {hudWeapons.length + hudArmor.length + hudGear.length === 0 && (
                  <div style={{ fontFamily: FONT, fontSize: '9px', color: HUD.textFaint, letterSpacing: '0.1em', padding: `${SP[1]} 0.125rem` }}>
                    INVENTORY EMPTY
                  </div>
                )}
              </div>
            </div>
```

Destructure `weapons... /* unused directly */, armor, gear, hudWeapons, hudArmor, hudGear, encumbranceCurrent, encumbranceThreshold, encumbranceStats, handleToggleEquippedById, handleRemoveWeapon, handleRemoveEquipment` from the existing `useCharacterData(character.id)` call in Step 1 of Task 3 (add them to the same destructure, don't call the hook twice).

- [ ] **Step 2: Add the `EncReadout` and `InvRow` helper components to the same file**

```tsx
const EQUIP_LABEL: Record<string, string> = { equipped: 'EQUIPPED', carrying: 'CARRIED', stowed: 'STOWED' }

function EncReadout({ current, threshold, cliff }: { current: number; threshold: number; cliff: number }) {
  const over = current - threshold
  const tone = current >= cliff ? 'immobile' : over > 0 ? 'over' : 'plain'
  const color = tone === 'immobile' ? 'var(--hud-vital-wounds)' : tone === 'over' ? 'var(--state-warning)' : 'var(--hud-text-dim)'
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: '5px', whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: FONT, fontSize: '7.5px', color: HUD.textFaint }}>ENC</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color }}>{current} / {threshold}</span>
      {tone === 'over' && (
        <span style={{ fontFamily: FONT, fontSize: '7.5px', letterSpacing: '0.08em', padding: '1px 5px', borderRadius: RADIUS.sm, border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`, color }}>
          −{over} PENALTY
        </span>
      )}
      {tone === 'immobile' && (
        <span style={{ fontFamily: FONT, fontSize: '7.5px', letterSpacing: '0.08em', padding: '1px 5px', borderRadius: RADIUS.sm, border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`, color }}>
          IMMOBILE
        </span>
      )}
    </span>
  )
}

function InvRow({ name, enc, equipState, onCycle, onDrop }: { name: string; enc: number; equipState: string; onCycle: () => void; onDrop: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: `6px ${SP[2]}` }}>
      <span style={{ fontFamily: FONT, fontSize: '9px', color: HUD.text, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <span style={{ fontFamily: FONT, fontSize: '7.5px', color: HUD.textFaint, fontWeight: 700, minWidth: '1.875rem', textAlign: 'right' }}>{enc}</span>
      <button className={`gm-dossier-statepill ${equipState}`} onClick={onCycle}>{EQUIP_LABEL[equipState] ?? equipState.toUpperCase()}</button>
      <button className="gm-dossier-dropbtn" onClick={onDrop} title="Drop / trash">✕</button>
    </div>
  )
}
```

- [ ] **Step 3: Add the state-pill and drop-button CSS classes to `globals.css`**

```css
.gm-dossier-statepill {
  font-family: var(--font-body);
  font-size: 7.5px; font-weight: 700; letter-spacing: 0.08em;
  padding: 3px 7px; border-radius: 2px;
  cursor: pointer; border: 1px solid; min-width: 4.125rem; text-align: center;
  background: none;
  transition: filter var(--ease-quick);
}
.gm-dossier-statepill:hover { filter: brightness(1.35); }
.gm-dossier-statepill.equipped { color: var(--state-success); border-color: color-mix(in srgb, var(--state-success) 50%, transparent); background: color-mix(in srgb, var(--state-success) 7%, transparent); }
.gm-dossier-statepill.carrying { color: var(--hud-accent); border-color: color-mix(in srgb, var(--hud-accent) 45%, transparent); }
.gm-dossier-statepill.stowed { color: var(--hud-text-faint); border-color: var(--hud-border-hi); }

.gm-dossier-dropbtn {
  width: 1.25rem; height: 1.25rem; border-radius: 2px;
  border: 1px solid transparent; background: none;
  color: var(--hud-text-faint); font-size: var(--text-xs);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color var(--ease-quick), border-color var(--ease-quick);
}
.gm-dossier-dropbtn:hover { color: var(--hud-vital-wounds); border-color: color-mix(in srgb, var(--hud-vital-wounds) 50%, transparent); }
```

Confirm `--state-warning`/`--state-success`/`--hud-accent` custom properties exist under those exact names in `holo-tokens.css`/`globals.css`; substitute the project's real names if different (e.g. `--warn` vs `--state-warning`) rather than introducing new ones.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: clean compile.

- [ ] **Step 5: Live-verify inventory + encumbrance**

Unarchive a test character with mixed equip states. Open dossier, confirm ENC readout matches the value shown on that same character's player HUD inventory tab exactly. Cycle an item's state pill and confirm the readout updates live and the change persists after reload. Push the character over threshold (equip more gear) and confirm amber+penalty-tag appears; push past `cliff` and confirm red+IMMOBILE. Drop an item and confirm it disappears from both the dossier and the player-side inventory after reload (proving the real `handleRemoveWeapon`/`handleRemoveEquipment` path ran, not a local-only removal). Re-archive when done.

- [ ] **Step 6: Commit**

```bash
git add src/components/gm/GmCharacterDossier.tsx src/app/globals.css
git commit -m "feat(gm-party): add inventory section with live encumbrance readout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `PcCheckConsole` — Skill Check tab + 3×2 grid + roll

**Files:**
- Create: `src/components/gm/PcCheckConsole.tsx`
- Modify: `src/components/gm/GmCharacterDossier.tsx` (mount the console in the right column)

**Interfaces:**
- Consumes: `getSkillPool`/`rollPool` from `src/components/player-hud/dice-engine.ts`, `logRoll` from `src/lib/logRoll.ts` (signature: `logRoll({ campaignId, characterId, characterName, label, pool, result, isDM, hidden, meta })`), `RefSkill` (`{ key, name, characteristic_key }`), `useCharacterData`'s `refSkills: RefSkill[]`, `skillRankMap: Record<string, number>`, `character` characteristics fields.
- Produces: `PcCheckConsoleProps` — `character: Character`, `campaignId: string`, `refSkills: RefSkill[]`, `skillRankMap: Record<string, number>`. Task 6 extends this same file/props for the Combat tab and Force row — do not finalize the prop list as closed.

- [ ] **Step 1: Confirm `getSkillPool`'s exact signature before writing pool math**

Run: `grep -n "export function getSkillPool" src/components/player-hud/dice-engine.ts` and read the surrounding ~15 lines. If `getSkillPool(rank: number, characteristic: number): { ability: number; proficiency: number }` (or equivalently named fields) matches the formula used everywhere else in this codebase (`proficiency = min(rank,char)`, `ability = max(rank,char)-min`), reuse it directly instead of re-deriving the formula inline in this new file.

- [ ] **Step 2: Create `PcCheckConsole.tsx` with the Skill Check tab and 3×2 stepper grid**

```tsx
// src/components/gm/PcCheckConsole.tsx
'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSkillPool, rollPool, type DicePool } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import type { Character, RefSkill } from '@/lib/types'
import { HUD, FONT_BODY as FONT, FS, SP, RADIUS } from '@/lib/tokens'

const CHAR_FIELD: Record<string, keyof Character> = {
  BR: 'brawn', AG: 'agility', INT: 'intellect', CUN: 'cunning', WIL: 'willpower', PR: 'presence',
}

export interface PcCheckConsoleProps {
  character:    Character
  campaignId:   string
  refSkills:    RefSkill[]
  skillRankMap: Record<string, number>
  forceRating:  number
}

type Tab = 'skill' | 'combat'

export function PcCheckConsole({ character, campaignId, refSkills, skillRankMap, forceRating }: PcCheckConsoleProps) {
  const [tab, setTab] = useState<Tab>('skill')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [pool, setPool] = useState<DicePool>({ ability: 0, proficiency: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })

  function poolForSkill(skill: RefSkill) {
    const field = CHAR_FIELD[skill.characteristic_key]
    const charVal = field ? (character[field] as number) : 0
    const rank = skillRankMap[skill.key] ?? 0
    return getSkillPool(rank, charVal)
  }

  function selectSkill(skill: RefSkill) {
    setSelectedSkill(skill.key)
    const { ability, proficiency } = poolForSkill(skill)
    setPool({ ability, proficiency, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: character.is_force_sensitive ? pool.force : 0 })
  }

  function adjustDie(key: keyof DicePool, delta: number) {
    setPool(p => ({ ...p, [key]: Math.max(0, p[key] + delta) }))
  }

  async function roll() {
    const skill = refSkills.find(s => s.key === selectedSkill)
    if (!skill) return
    const result = rollPool(pool)
    await logRoll({
      campaignId, characterId: character.id, characterName: character.name,
      label: `${skill.name} Check`, pool, result, isDM: true, hidden: false,
      meta: { rollType: 'skill' },
    })
  }

  const totalDice = Object.values(pool).reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: SP[1], padding: SP[2], borderBottom: '1px solid var(--hud-border)' }}>
        <button className={tab === 'skill' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('skill')}>⬠ SKILL CHECK</button>
        <button className={tab === 'combat' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('combat')}>⌖ COMBAT CHECK</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: SP[2], display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {tab === 'skill' && refSkills.map(skill => {
          const { ability, proficiency } = poolForSkill(skill)
          return (
            <div key={skill.key} className={selectedSkill === skill.key ? 'gm-cc-row sel' : 'gm-cc-row'} onClick={() => selectSkill(skill)}>
              <span className="n">{skill.name}</span>
              <span className="c">{skill.characteristic_key}</span>
              <span className="pool">{proficiency + ability}</span>
            </div>
          )
        })}
        {/* Combat tab rendered in Task 6 */}
      </div>

      <div style={{ borderTop: '1px solid var(--hud-border)', padding: SP[2], display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SP[1] }}>
          {(['ability', 'proficiency', 'boost', 'difficulty', 'challenge', 'setback'] as const).map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: '2px 3px' }}>
              <button className="gm-dossier-stepbtn" onClick={() => adjustDie(k, -1)}>−</button>
              <b style={{ fontFamily: FONT, fontSize: FS.overline, minWidth: '11px', textAlign: 'center' }}>{pool[k]}</b>
              <button className="gm-dossier-stepbtn" onClick={() => adjustDie(k, 1)}>＋</button>
            </div>
          ))}
        </div>
        {/* Force row rendered in Task 6 */}
        <button className="gm-cc-rollbtn" disabled={totalDice === 0} onClick={roll}>ROLL — PUBLIC</button>
      </div>
    </div>
  )
}
```

Confirm `DicePool`'s exact field names by reading `dice-engine.ts`'s type export before finalizing — if the real field names differ from `ability/proficiency/boost/difficulty/challenge/setback/force` (e.g. abbreviated `abil/prof/diff/chal/set`), use the real names throughout this file and Task 6's additions.

- [ ] **Step 3: Mount `PcCheckConsole` in `GmCharacterDossier`'s right column**

```tsx
// GmCharacterDossier.tsx — replace the empty right-column div from Task 3
          <div style={{ borderLeft: '1px solid var(--hud-border)', background: 'rgba(0,0,0,0.25)' }}>
            <PcCheckConsole
              character={c}
              campaignId={campaignId}
              refSkills={refSkills}
              skillRankMap={skillRankMap}
              forceRating={forceRating ?? 0}
            />
          </div>
```

Add `refSkills` to the existing `useCharacterData(character.id)` destructure in `GmCharacterDossier.tsx`.

- [ ] **Step 4: Add the check-console CSS classes to `globals.css`**

```css
.gm-cc-tab {
  flex: 1; font-family: var(--font-body); font-size: var(--text-overline); font-weight: 700;
  letter-spacing: 0.1em; padding: var(--space-2) 0; border-radius: var(--radius-sm);
  border: 1px solid var(--hud-border); color: var(--hud-text-dim); background: none; cursor: pointer;
  transition: color var(--ease-quick), border-color var(--ease-quick), background var(--ease-quick);
}
.gm-cc-tab.on { color: var(--hud-gold); border-color: var(--hud-gold); background: color-mix(in srgb, var(--hud-gold) 7%, transparent); }

.gm-cc-row {
  display: flex; align-items: center; gap: 6px; padding: 5px 6px;
  border: 1px solid transparent; border-radius: var(--radius-sm); cursor: pointer;
  transition: border-color var(--ease-quick), background var(--ease-quick);
}
.gm-cc-row:hover { border-color: var(--hud-border-hi); background: var(--hud-surface-lo); }
.gm-cc-row.sel { border-color: var(--hud-gold); background: color-mix(in srgb, var(--hud-gold) 7%, transparent); }
.gm-cc-row .n { font-size: var(--text-overline); color: var(--hud-text); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gm-cc-row .c { font-size: 7.5px; color: var(--hud-text-faint); letter-spacing: 0.05em; }
.gm-cc-row .pool { font-size: 7.5px; color: var(--hud-text-faint); }

.gm-cc-rollbtn {
  font-family: var(--font-display); font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.2em;
  color: var(--hud-bg); background: var(--hud-gold); border: none; border-radius: var(--radius-sm);
  padding: var(--space-2) 0; cursor: pointer; transition: box-shadow var(--ease-quick);
}
.gm-cc-rollbtn:hover { box-shadow: 0 0 18px color-mix(in srgb, var(--hud-gold) 50%, transparent); }
.gm-cc-rollbtn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: clean compile.

- [ ] **Step 6: Live-verify Skill Check tab**

Unarchive a test character. Open dossier, select a 0-rank skill and confirm the pool shown matches `ability`/`proficiency` computed by hand from that character's real characteristic; select a ranked skill and confirm the same. Adjust the 3×2 grid steppers and confirm the totals update. Click ROLL — PUBLIC and confirm the roll appears in the existing public roll feed with the correct character name and skill label. Re-archive when done.

- [ ] **Step 7: Commit**

```bash
git add src/components/gm/PcCheckConsole.tsx src/components/gm/GmCharacterDossier.tsx src/app/globals.css
git commit -m "feat(gm-party): add PC skill check console with public roll+log

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: `PcCheckConsole` — Combat Check tab + Force die row

**Files:**
- Modify: `src/components/gm/PcCheckConsole.tsx`

**Interfaces:**
- Consumes: `useCharacterData`'s `hudWeapons: WpnDisplay[]` (has `.equipState`, `.skillKey`/`.skillName`, `.damage`, `.crit`), passed as a new `hudWeapons` prop. Confirm during implementation whether `CheckConsole.tsx`/`combatCheckUtils.ts` already defines a shared Unarmed profile constant (`Brawl, damage=Brawn, Crit 5, Engaged, Disorient 1, Knockdown`) — if found, import and reuse it; if not, define it once in `src/lib/combatCheckUtils.ts` exported for both consoles, not duplicated inline here.
- Produces: no new external interface — this completes `PcCheckConsole`'s full prop surface: adds `hudWeapons: WpnDisplay[]` to `PcCheckConsoleProps`.

- [ ] **Step 1: Check for an existing shared Unarmed profile**

Run: `grep -rn "Unarmed" src/lib/combatCheckUtils.ts src/components/gm/CheckConsole.tsx`

If a constant/function already exists (e.g. `UNARMED_PROFILE` or `resolveUnarmedWeapon()`), note its exact export name and shape for Step 3. If nothing exists, Step 2 adds one.

- [ ] **Step 2 (only if Step 1 found nothing): add a shared Unarmed profile to `combatCheckUtils.ts`**

```ts
// src/lib/combatCheckUtils.ts — add near the other shared combat-check helpers
export const UNARMED_PROFILE = {
  name: 'Unarmed',
  skillKey: 'BRAWL' as const,
  skillName: 'Brawl',
  crit: 5,
  range: 'Engaged',
  qualities: [{ key: 'DISORIENT', count: 1 }, { key: 'KNOCKDOWN', count: null }],
}
```

Confirm the real skill-key casing/value used elsewhere in this file (e.g. `'BRAWL'` vs `'Brawl'`) and match it exactly rather than guessing.

- [ ] **Step 3: Add the Combat Check tab body and `hudWeapons` prop to `PcCheckConsole.tsx`**

```tsx
// PcCheckConsoleProps gains:
  hudWeapons: WpnDisplay[]

// Inside the component, add a combat pool helper:
  function poolForCombatSkill(skillKey: string, skillName: string) {
    const skill = refSkills.find(s => s.name === skillName || s.key === skillKey)
    if (!skill) return { ability: 0, proficiency: 0 }
    return poolForSkill(skill)
  }

  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null)

  function selectWeapon(id: string, skillName: string) {
    setSelectedWeaponId(id)
    const { ability, proficiency } = poolForCombatSkill('', skillName)
    setPool({ ability, proficiency, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: character.is_force_sensitive ? pool.force : 0 })
  }

  async function rollCombat(weaponLabel: string) {
    const result = rollPool(pool)
    await logRoll({
      campaignId, characterId: character.id, characterName: character.name,
      label: `${weaponLabel} Check`, pool, result, isDM: true, hidden: false,
      meta: { rollType: 'combat' },
    })
  }
```

```tsx
{/* Combat tab body — replace the "Combat tab rendered in Task 6" placeholder from Task 5 */}
{tab === 'combat' && (() => {
  const equipped = hudWeapons.filter(w => w.equipState === 'equipped')
  const combatList = [
    ...equipped.map(w => ({ id: w.id, name: w.name, skillName: w.skillName, damage: w.damage.baseDamage, crit: w.crit })),
    { id: '__unarmed', name: UNARMED_PROFILE.name, skillName: UNARMED_PROFILE.skillName, damage: character.brawn, crit: UNARMED_PROFILE.crit },
  ]
  return combatList.map(w => {
    const { ability, proficiency } = poolForCombatSkill('', w.skillName)
    return (
      <div key={w.id} className={selectedWeaponId === w.id ? 'gm-cc-row sel' : 'gm-cc-row'} onClick={() => selectWeapon(w.id, w.skillName)}>
        <span className="n">{w.name}</span>
        <span className="c">DMG {w.damage} · C{w.crit}</span>
        <span className="pool">{proficiency + ability}</span>
      </div>
    )
  })
})()}
```

Update the roll button's `onClick` to branch by tab (`tab === 'skill' ? roll() : rollCombat(selectedWeaponLabel)`), tracking the selected weapon's display name alongside `selectedWeaponId` for the log label.

- [ ] **Step 4: Add the Force die row**

```tsx
{/* Force row — replace the "Force row rendered in Task 6" placeholder from Task 5 */}
{character.is_force_sensitive && (
  <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'color-mix(in srgb, var(--die-force) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--die-force) 28%, transparent)', borderRadius: RADIUS.sm, padding: `5px ${SP[2]}` }}>
    <span style={{ fontFamily: FONT, fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--die-force)', flex: 1 }}>
      FORCE DICE <span style={{ fontSize: '7px', color: HUD.textFaint }}>(FR {forceRating})</span>
    </span>
    <button className="gm-dossier-stepbtn" onClick={() => adjustDie('force', -1)}>−</button>
    <b style={{ fontFamily: FONT_DISPLAY, fontSize: FS.xs, color: 'var(--die-force)', minWidth: '12px', textAlign: 'center' }}>{pool.force}</b>
    <button className="gm-dossier-stepbtn" onClick={() => adjustDie('force', 1)}>＋</button>
  </div>
)}
```

This row must render below the 3×2 grid on **both** tabs and must not add a 7th cell to the grid — confirm visually in Step 6.

- [ ] **Step 5: Pass `hudWeapons` from `GmCharacterDossier` into `PcCheckConsole`**

```tsx
// GmCharacterDossier.tsx — add hudWeapons to the <PcCheckConsole> call
            <PcCheckConsole
              character={c}
              campaignId={campaignId}
              refSkills={refSkills}
              skillRankMap={skillRankMap}
              forceRating={forceRating ?? 0}
              hudWeapons={hudWeapons}
            />
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: clean compile.

- [ ] **Step 7: Live-verify Combat tab + Force row**

Using an unarchived test character with at least one equipped weapon and a non-force-sensitive character for comparison: confirm the Combat tab lists only equipped weapons plus Unarmed last, prefilled from the correct governing skill. Confirm the Force die row appears only for the force-sensitive character, on both tabs, doesn't add a 7th grid cell, and its dice count is included in the pool sent to `logRoll` (check the feed entry's die counts). Confirm the non-force-sensitive character shows no row and the grid layout is identical otherwise. Re-archive when done.

- [ ] **Step 8: Commit**

```bash
git add src/components/gm/PcCheckConsole.tsx src/components/gm/GmCharacterDossier.tsx src/lib/combatCheckUtils.ts
git commit -m "feat(gm-party): add combat check tab and force die row to PC console

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Bulk token controls + FLIP animation + card stagger

**Files:**
- Modify: `src/app/gm/panels/GmPartyPanel.tsx`
- Modify: `src/components/gm/GmCharacterDossier.tsx` (FLIP open/close)
- Modify: `src/app/gm/panels/GmPartyMiniCard.tsx` (hover class already added in Task 2 — confirm `hov-lift` exists as an established class in `globals.css`; if not, add it scoped to this card only, consistent with the Encounter Deck's card treatment but toned down)

**Interfaces:**
- Consumes: GSAP (already a project dependency — confirm via `grep -rn "from 'gsap'" src/components/gm/EncounterDeck.tsx` or similar for the established import pattern), `addToken`/`removeToken`/`tokens` (Task 1).
- Produces: no new exported interface — this task is behavior + polish on existing files.

- [ ] **Step 1: Confirm GSAP's existing import pattern in this codebase**

Run: `grep -rn "^import.*gsap" src/components/gm/*.tsx src/components/player-hud/*.tsx | head -5`

Use the exact same import style (e.g. `import { gsap } from 'gsap'` vs default import) found there.

- [ ] **Step 2: Add Place All / Remove All buttons to `GmPartyPanel`'s header**

```tsx
// GmPartyPanel.tsx — add above the card list, inside the existing header block or a new one directly below it
        <div style={{ display: 'flex', gap: SP[2], padding: `${SP[2]} 0.875rem`, borderBottom: '1px solid var(--hud-border)', background: 'var(--hud-surface-lo)' }}>
          <button className="gm-party-bulkbtn" onClick={placeAllPCs}>◈ PLACE ALL PCs</button>
          <button className="gm-party-bulkbtn danger" onClick={removeAllPCs}>✕ REMOVE ALL PCs</button>
        </div>
```

```tsx
// GmPartyPanel.tsx — add functions inside the component body
  async function placeAllPCs() {
    if (!mapId) return
    for (const c of characters) {
      if (tokens.some(t => t.character_id === c.id)) continue
      await addToken({
        map_id: mapId, campaign_id: campaignId, participant_type: 'pc',
        character_id: c.id, participant_id: null, slot_key: null,
        label: c.name, alignment: 'pc', x: 0.5, y: 0.5,
        is_visible: true, token_size: 1.0, wound_pct: null,
        token_image_url: c.portrait_url ?? null, token_shape: 'circle',
      })
    }
    pulseTokenDots()
  }

  async function removeAllPCs() {
    const pcTokens = tokens.filter(t => t.participant_type === 'pc' && characters.some(c => c.id === t.character_id))
    for (const t of pcTokens) {
      await removeToken(t.id)
    }
    pulseTokenDots()
  }

  function pulseTokenDots() {
    gsap.utils.toArray<HTMLElement>('.gm-party-tokdot').forEach((dot, i) => {
      gsap.fromTo(dot, { scale: 1.9 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', delay: i * 0.06, clearProps: 'scale' })
    })
  }
```

Add `import { gsap } from 'gsap'` (or whatever import style Step 1 confirmed) to the top of `GmPartyPanel.tsx`.

- [ ] **Step 3: Add the bulk-button CSS to `globals.css`**

```css
.gm-party-bulkbtn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: var(--space-1);
  font-family: var(--font-body); font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
  padding: var(--space-2) 0; border-radius: var(--radius-sm);
  border: 1px solid var(--hud-border-hi); color: var(--hud-text-dim); background: none; cursor: pointer;
  transition: color var(--ease-quick), border-color var(--ease-quick), background var(--ease-quick);
}
.gm-party-bulkbtn:hover { color: var(--hud-gold); border-color: var(--hud-gold); background: color-mix(in srgb, var(--hud-gold) 7%, transparent); }
.gm-party-bulkbtn.danger:hover { color: var(--hud-vital-wounds); border-color: var(--hud-vital-wounds); background: color-mix(in srgb, var(--hud-vital-wounds) 7%, transparent); }
```

- [ ] **Step 4: FLIP-open the dossier from the clicked card's bounding rect**

```tsx
// GmPartyPanel.tsx — capture the click origin and pass it down
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)

  // in the card map:
          {characters.map(c => (
            <GmPartyMiniCard
              key={c.id}
              character={c}
              onMap={tokens.some(t => t.character_id === c.id)}
              critCount={cardCallbacks.charActiveCritCounts?.[c.id] ?? 0}
              onClick={e => { setOriginRect(e.currentTarget.getBoundingClientRect()); setSelectedId(c.id) }}
            />
          ))}
```

This requires `GmPartyMiniCard`'s `onClick` prop to receive the click event (change its signature from `onClick: () => void` to `onClick: (e: React.MouseEvent<HTMLDivElement>) => void` and wire `onClick={onClick}` directly on the card's root `div` — update Task 2's file accordingly).

```tsx
// GmCharacterDossier.tsx — accept originRect and FLIP on mount
export interface GmCharacterDossierProps {
  // ...existing fields
  originRect: DOMRect | null
}

// inside the component, after the portal's root div ref is available:
  const dossierRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!dossierRef.current || !originRect) return
    const dr = dossierRef.current.getBoundingClientRect()
    gsap.fromTo(dossierRef.current,
      { x: originRect.left + originRect.width / 2 - (dr.left + dr.width / 2), y: originRect.top + originRect.height / 2 - (dr.top + dr.height / 2), scale: 0.16, opacity: 0.35 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' })
  }, [originRect])
```

Attach `ref={dossierRef}` to the dossier's outer bordered `div` (the one currently holding `position: fixed; ...`). Pass `originRect={originRect}` from `GmPartyPanel.tsx`'s `<GmCharacterDossier>` call.

- [ ] **Step 5: Card stagger-in on panel mount/refresh**

```tsx
// GmPartyPanel.tsx — stagger cards in when the character list changes
  const cardListRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!cardListRef.current) return
    gsap.from(cardListRef.current.querySelectorAll('.gm-party-tokdot')[0] ? cardListRef.current.children : [], {
      x: -18, opacity: 0, stagger: 0.055, duration: 0.4, ease: 'power3.out',
    })
  }, [characters.length])
```

Attach `ref={cardListRef}` to the existing card-list `div` (the one currently doing `characters.map(...)`).

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: clean compile.

- [ ] **Step 7: Live-verify bulk controls + animation**

With the whole active party (no unarchiving needed here — this only touches map tokens, not character data): click Place All PCs, confirm every party member's token appears on the active map and every card's token dot lights up with a staggered pulse; confirm characters already on the map aren't duplicated. Click Remove All PCs, confirm all PC tokens clear from the active map only (other maps' tokens untouched — check by switching maps). Confirm the dossier visibly FLIPs open from the clicked card and closes cleanly. Confirm cards stagger in when the panel first renders.

- [ ] **Step 8: Commit**

```bash
git add src/app/gm/panels/GmPartyPanel.tsx src/app/gm/panels/GmPartyMiniCard.tsx src/components/gm/GmCharacterDossier.tsx src/app/globals.css
git commit -m "feat(gm-party): add bulk token controls and FLIP dossier animation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Delete `GmCharacterModal`, update `docs/architecture.md`

**Files:**
- Delete: `src/app/gm/panels/GmCharacterModal.tsx`
- Modify: `docs/architecture.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing — cleanup task.

- [ ] **Step 1: Confirm nothing else imports `GmCharacterModal`**

Run: `grep -rn "GmCharacterModal" src/` — expected: no matches once `GmPartyPanel.tsx` was updated in Task 3. If any other file still imports it, stop and report rather than deleting out from under a live consumer.

- [ ] **Step 2: Delete the file**

```bash
git rm src/app/gm/panels/GmCharacterModal.tsx
```

- [ ] **Step 3: Update `docs/architecture.md`**

Read the file's existing component-listing conventions (find the current entries for `GmPartyPanel.tsx`/`GmPartyMiniCard.tsx`/`GmCharacterModal.tsx` — likely in a components or GM-panels table) and:
- Remove the `GmCharacterModal.tsx` entry.
- Add entries for `src/components/gm/GmCharacterDossier.tsx` and `src/components/gm/PcCheckConsole.tsx`, describing them the same way neighboring entries (e.g. `EncounterDossier.tsx`/`CheckConsole.tsx`) are documented in that file.
- Update the `GmPartyMiniCard.tsx`/`GmPartyPanel.tsx` entries' descriptions to reflect the compact-card/bulk-controls rebuild, matching this file's existing prose style rather than copy-pasting from this plan.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: clean compile with `GmCharacterModal.tsx` gone.

- [ ] **Step 5: Final full-flow live verification (self-audit checklist)**

Walk the spec's acceptance criteria end to end on one unarchived test character, then re-archive:
1. Party panel shows compact cards; click opens the full 3-column dossier.
2. Place All / Remove All PCs work on the active map, no confirmation dialog.
3. Characteristics, live wound/strain, defense chips (+Force chip if applicable), inventory cycling and real drop all work and persist on reload.
4. Encumbrance readout matches the player HUD's number for the same character and both RAW tiers (amber/red) trigger correctly.
5. Both check tabs work on real data; Force row appears only for force-sensitive characters on both tabs without disturbing the 3×2 grid; a non-force character's dossier is otherwise identical.
6. Rolls land in the public feed.
7. No regression: open the Encounter Deck, an adversary dossier, the player-side inventory tab, and MapToolsRadial (if present) and confirm each still behaves as before this change.

- [ ] **Step 6: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture.md for GM party dossier rebuild; remove GmCharacterModal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
