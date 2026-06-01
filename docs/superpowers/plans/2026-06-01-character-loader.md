# CharacterLoader — Replace HolocronLoader with Focus Card Loading Screen

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the timer-based `HolocronLoader` with a new `CharacterLoader` component that shows the selected character's focus card and dismisses the moment real data is ready.

**Architecture:** A Zustand store (`characterSelectStore`) holds the `Character` object selected on the home screen; it is written before `router.push()` fires so the data is available the instant the character route mounts. `CharacterLoader` reads from that store and renders a three-zone focus card + loading strip. Both the `<Suspense>` fallback and the `if (loading)` guard in `PlayerHUDDesktop` are replaced with `<CharacterLoader />`, making it the single loading screen for the character route.

**Tech Stack:** Next.js 14, React 18, TypeScript, Zustand v5, CSS custom properties

---

## Audit findings (Step 0 — confirmed before writing plan)

| Item | Value |
|---|---|
| Zustand installed | ✅ `^5.0.11` — no store files exist yet |
| `src/app/layout.tsx` | ✅ exists |
| `src/app/character/layout.tsx` | does not exist |
| `PlayerHUDDesktop` line to replace | line **391**: `if (loading) return <HolocronLoader />` |
| Suspense fallback to replace | `src/app/character/[id]/page.tsx` line 12 |
| `DANGER` / `WARN` CSS vars | `'var(--state-wounds)'` / `'var(--state-strain)'` |
| Z-index ceiling | `Z.modal = 410` — use for loader overlay |

---

## File map

| File | Action |
|---|---|
| `src/store/characterSelectStore.ts` | **Create** — Zustand store |
| `src/components/ui/CharacterLoader.tsx` | **Create** — new loader component |
| `src/app/page.tsx` | **Modify** — call `setSelectedCharacter` in `handleCardSelect` |
| `src/app/character/[id]/page.tsx` | **Modify** — swap Suspense fallback |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | **Modify** — swap loading guard + add cleanup |
| `src/components/ui/HolocronLoader.tsx` | **Delete** |

---

## Task 1 — Create characterSelectStore

**Files:**
- Create: `src/store/characterSelectStore.ts`

- [ ] **Step 1: Create the store file**

```typescript
import { create } from 'zustand'
import type { Character } from '@/lib/types'

interface CharacterSelectState {
  selectedCharacter: Character | null
  setSelectedCharacter: (c: Character | null) => void
}

export const useCharacterSelectStore = create<CharacterSelectState>()((set) => ({
  selectedCharacter: null,
  setSelectedCharacter: (c) => set({ selectedCharacter: c }),
}))
```

- [ ] **Step 2: Verify TypeScript**

```
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```
git add src/store/characterSelectStore.ts
git commit -m "feat(store): add characterSelectStore — Zustand slice for selected character data"
```

---

## Task 2 — Create CharacterLoader

**Files:**
- Create: `src/components/ui/CharacterLoader.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState, useEffect }         from 'react'
import { useCharacterSelectStore }     from '@/store/characterSelectStore'
import {
  FONT_BODY, FONT_DISPLAY, HUD, Z, RADIUS,
  BORDER, INPUT_BG, TEXT, TEXT_MUT, CHAR_COLORS,
} from '@/lib/tokens'

// CSS variable aliases — match the values used in page.tsx
const PIP_DANGER = 'var(--state-wounds)'
const PIP_WARN   = 'var(--state-strain)'

const CHAR_KEYS   = ['brawn','agility','intellect','cunning','willpower','presence'] as const
const CHAR_LABELS: Record<typeof CHAR_KEYS[number], string> = {
  brawn: 'BR', agility: 'AG', intellect: 'INT',
  cunning: 'CUN', willpower: 'WIL', presence: 'PR',
}

const LOADING_TEXTS = [
  'CONNECTING TO HOLONET...',
  'DECRYPTING IMPERIAL RECORDS...',
  'LOADING CHARACTER DOSSIER...',
  'SYNCING REBEL ALLIANCE DATABASE...',
  'VERIFYING CLEARANCE CODES...',
  'ACCESSING FIELD OPERATIVE PROFILE...',
] as const

export function CharacterLoader() {
  const selectedCharacter = useCharacterSelectStore(s => s.selectedCharacter)
  const [textIdx,  setTextIdx]  = useState(0)
  const [imgError, setImgError] = useState(false)

  // Cycle status text
  useEffect(() => {
    const id = setInterval(() => setTextIdx(p => (p + 1) % LOADING_TEXTS.length), 1800)
    return () => clearInterval(id)
  }, [])

  // Reset image error when a different character is loaded
  useEffect(() => { setImgError(false) }, [selectedCharacter?.id])

  const char         = selectedCharacter
  const showFallback = !char?.portrait_url || imgError

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      width:          '100vw',
      height:         '100vh',
      background:     '#0A0806',
      zIndex:         Z.modal,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '16px',
    }}>

      {/* ── Focus card (only when selectedCharacter is available) ── */}
      {char && (
        <div style={{
          width:          '220px',
          borderRadius:   '7px',
          border:         '1px solid color-mix(in srgb, var(--hud-accent) 65%, transparent)',
          background:     'var(--hud-surface-hi)',
          backdropFilter: 'blur(12px)',
          boxShadow:      [
            '0 0 0 1px color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            '0 0 14px   color-mix(in srgb, var(--hud-accent) 28%, transparent)',
            '0 0 32px   color-mix(in srgb, var(--hud-accent)  8%, transparent)',
          ].join(', '),
          overflow:       'hidden',
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          animation:      'cl-enter 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>

          {/* Left-spring accent bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '0.125rem', background: 'var(--hud-accent)', zIndex: 2,
          }} />

          {/* Rebel watermark — right edge, full height */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, right: '-20px',
            pointerEvents: 'none', zIndex: 4,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/factions/rebel.png"
              alt=""
              style={{ height: '100%', width: 'auto', filter: 'opacity(0.18)' }}
            />
          </div>

          {/* ── Top section: Zone A (portrait) + Zone B (stats) ── */}
          <div style={{ display: 'flex', flex: 1 }}>

            {/* ZONE A — Portrait panel */}
            <div style={{
              width: '95px', flexShrink: 0,
              position: 'relative', overflow: 'hidden',
              borderRight: `1px solid ${BORDER}`,
            }}>
              {showFallback ? (
                <div style={{
                  width: '100%', height: '100%', minHeight: '90px',
                  background: 'var(--hud-surface-lo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px',
                }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textAlign: 'center', lineHeight: 1.4 }}>
                    No image uploaded
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char.portrait_url!}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  onError={() => setImgError(true)}
                />
              )}

              {/* Identity overlay — bottom gradient */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)',
                padding: '18px 5px 5px', zIndex: 5,
              }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: HUD.gold, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.name}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.career_key} // {char.species_key}
                </div>
              </div>
            </div>

            {/* ZONE B — Stats panel */}
            <div style={{ flex: 1, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>

              {/* Characteristics */}
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Characteristics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '2px' }}>
                  {CHAR_KEYS.map(key => (
                    <div key={key} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 1px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 700, color: CHAR_COLORS[key] }}>
                        {(char as unknown as Record<string, number>)[key]}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {CHAR_LABELS[key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combat */}
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Combat
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
                  {[
                    { label: 'Soak',  value: char.soak           },
                    { label: 'M.Def', value: char.defense_melee  },
                    { label: 'R.Def', value: char.defense_ranged },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: TEXT }}>{value}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Resources
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
                  {[
                    { label: 'W.Thr', value: char.wound_threshold  },
                    { label: 'S.Thr', value: char.strain_threshold },
                    { label: 'XP',    value: char.xp_available     },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: TEXT }}>{value}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ZONE C — Pip tracker */}
          <div style={{ borderTop: `1px solid ${BORDER}`, background: 'var(--hud-surface-lo)', padding: '5px 8px' }}>
            {/* Wounds */}
            <div style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Wounds</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                {Array.from({ length: char.wound_threshold }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < char.wound_current ? PIP_DANGER : 'transparent', border: `1px solid ${i < char.wound_current ? PIP_DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}` }} />
                ))}
              </div>
            </div>
            {/* Strain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Strain</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT }}>{char.strain_current}/{char.strain_threshold}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                {Array.from({ length: char.strain_threshold }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < char.strain_current ? PIP_WARN : 'transparent', border: `1px solid ${i < char.strain_current ? PIP_WARN : 'var(--hud-border)'}` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading strip (always shown) ── */}
      <div style={{
        width:     '220px',
        textAlign: 'center',
        animation: char ? 'cl-strip 0.4s 0.2s ease both' : 'cl-strip 0.4s ease both',
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: '13px', letterSpacing: '0.28em', textTransform: 'uppercase', color: HUD.gold, marginBottom: '8px' }}>
          H O L O C R O N
        </div>
        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden', margin: '0 auto 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, var(--hud-accent), #c8883a, transparent)', animation: 'loadingBarSweep 1.4s ease-in-out infinite' }} />
        </div>
        <div key={textIdx} style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'cl-text 0.3s ease forwards' }}>
          {LOADING_TEXTS[textIdx]}
        </div>
      </div>

      <style>{`
        @keyframes cl-enter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes cl-strip {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cl-text {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  )
}
```

> Note: `loadingBarSweep` is defined in `src/styles/animations.css` (added during the character-select work). The component references it by name — no duplicate definition needed.

- [ ] **Step 2: Verify TypeScript**

```
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```
git add src/components/ui/CharacterLoader.tsx
git commit -m "feat(CharacterLoader): focus card loading screen driven by Zustand store"
```

---

## Task 3 — Wire store in handleCardSelect

**Files:**
- Modify: `src/app/page.tsx`

The `handleCardSelect` function is the orchestrator of the hyperspace animation. It must write to the store before `router.push()` fires so the data is in place when the character route mounts.

- [ ] **Step 1: Add store import**

Near the top of `src/app/page.tsx`, add to the existing imports:

```typescript
import { useCharacterSelectStore } from '@/store/characterSelectStore'
```

- [ ] **Step 2: Call setSelectedCharacter at the start of handleCardSelect**

Find `handleCardSelect` (currently calling `claimCharacterDB` and starting the hyperspace animation). Add the store write as the **first action** in the function body, before `claimCharacterDB` and before the animation state changes:

```typescript
function handleCardSelect(charId: string, rect: DOMRect) {
  if (hyper.phase !== 'idle') return

  // Write selected character to store before navigation fires
  const charForStore = characters.find(c => c.id === charId) ?? null
  useCharacterSelectStore.getState().setSelectedCharacter(charForStore)

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    void claimCharacter(charId)
    return
  }

  // ... rest of the existing function unchanged ...
}
```

> `useCharacterSelectStore.getState()` is a Zustand synchronous accessor — it works correctly outside of React render cycles (in event handlers, timeouts, etc.).

- [ ] **Step 3: Verify TypeScript**

```
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```
git add src/app/page.tsx
git commit -m "feat(page): write selectedCharacter to store in handleCardSelect before navigation"
```

---

## Task 4 — Wire CharacterLoader into the character route and PlayerHUDDesktop

**Files:**
- Modify: `src/app/character/[id]/page.tsx`
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx`

### Part A — Character route Suspense fallback

- [ ] **Step 1: Swap the Suspense fallback in character/[id]/page.tsx**

Open `src/app/character/[id]/page.tsx`. Replace `HolocronLoader` with `CharacterLoader` in both the import and the Suspense fallback:

```tsx
'use client'

import { Suspense }                 from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PlayerHUDDesktop }         from '@/components/player-hud/PlayerHUDDesktop'
import { MobileSessionCompanion }   from '@/components/mobile/MobileSessionCompanion'
import { CharacterLoader }          from '@/components/ui/CharacterLoader'
import { useIsMobile }              from '@/hooks/useIsMobile'

export default function CharacterPage() {
  return (
    <Suspense fallback={<CharacterLoader />}>
      <CharacterPageInner />
    </Suspense>
  )
}

function CharacterPageInner() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const characterId  = params.id as string
  const isGmMode     = searchParams.get('gm') === '1'
  const campaignId   = searchParams.get('campaign')
  const isMobile     = useIsMobile()

  if (isMobile) {
    return (
      <MobileSessionCompanion
        characterId={characterId}
        campaignId={campaignId}
      />
    )
  }

  return (
    <PlayerHUDDesktop
      characterId={characterId}
      isGmMode={isGmMode}
      campaignId={campaignId}
    />
  )
}
```

### Part B — PlayerHUDDesktop loading guard + store cleanup

- [ ] **Step 2: Replace loading guard and add cleanup in PlayerHUDDesktop**

Open `src/components/player-hud/PlayerHUDDesktop.tsx`.

**2a. Add imports** near the existing imports block:

```typescript
import { CharacterLoader }          from '@/components/ui/CharacterLoader'
import { useCharacterSelectStore }  from '@/store/characterSelectStore'
```

**2b. Replace line 391** (the loading guard):

```tsx
// Before
if (loading) return <HolocronLoader />

// After
if (loading) return <CharacterLoader />
```

**2c. Add store-clearing cleanup useEffect** inside the `PlayerHUDDesktop` component, alongside the other `useEffect` calls near the top of the component body:

```tsx
// Clear selected character from store on unmount so stale data
// doesn't show if the user navigates back and picks a different character.
useEffect(() => {
  return () => {
    useCharacterSelectStore.getState().setSelectedCharacter(null)
  }
}, [])
```

- [ ] **Step 3: Verify TypeScript**

```
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```
git add src/app/character/[id]/page.tsx src/components/player-hud/PlayerHUDDesktop.tsx
git commit -m "feat: wire CharacterLoader into character route and PlayerHUDDesktop — dismiss on data ready"
```

---

## Task 5 — Delete HolocronLoader and clean up all references

**Files:**
- Modify: `src/components/player-hud/PlayerHUDDesktop.tsx` (remove import)
- Delete: `src/components/ui/HolocronLoader.tsx`

- [ ] **Step 1: Remove the HolocronLoader import from PlayerHUDDesktop**

In `src/components/player-hud/PlayerHUDDesktop.tsx`, find and delete line 36:

```typescript
import { HolocronLoader } from '@/components/ui/HolocronLoader'
```

- [ ] **Step 2: Verify no remaining references to HolocronLoader**

```
grep -rn "HolocronLoader" src/
```

Expected: zero results. If any remain, remove them before proceeding.

- [ ] **Step 3: Delete the file**

```
del src\components\ui\HolocronLoader.tsx
```

On bash/PowerShell equivalent:
```powershell
Remove-Item src\components\ui\HolocronLoader.tsx
```

- [ ] **Step 4: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```

Expected: zero errors, clean production build.

- [ ] **Step 5: Smoke-test the full flow**

Start the dev server (`npm run dev`) and verify:
1. Click a character card → hyperspace animation plays (~900ms) → navigates to `/character/[id]`
2. `CharacterLoader` appears immediately with the selected character's portrait, name, stats, pips, and the loading strip
3. The loader dismisses and the character sheet appears when data is ready (not on a timer)
4. Navigate directly to `/character/[id]` in the URL bar (no store data) → loading strip shows, no crash, no blank screen
5. Navigate back to character select → pick a different character → `CharacterLoader` shows the new character's focus card
6. `HolocronLoader.tsx` no longer exists, no 404s or import errors

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "feat(CharacterLoader): retire HolocronLoader — data-driven dismiss, focus card on route entry"
```
