# Character Select: Card Density, Hover Effects & Hyperspace Transition

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce card size so all six characters fit in a 2×3 grid without scrolling, add a five-layer hover system, and play a cinematic hyperspace jump animation when a card is clicked.

**Architecture:** All character card UI lives in a single `CharacterCard` function inline in `src/app/page.tsx`. Hover CSS effects go in `src/styles/animations.css` using the existing `.hov-lift` Shinkei system. The hyperspace transition is a state machine in the parent `Home` component: a `hyper` state drives card transforms, a canvas element for the starfield, and a full-screen loading overlay for Beat 5. The `claimCharacter` DB writes run in parallel with the animation so they don't block the cinematic.

**Tech Stack:** Next.js 14, React 18, TypeScript, CSS custom properties, vanilla `requestAnimationFrame` canvas API — no animation libraries.

---

## Audit findings (Step 0 — confirmed before writing plan)

| Item | Value |
|---|---|
| Build status | ✅ Clean |
| `rebel.png` | ✅ `public/images/factions/rebel.png` |
| Card component | `CharacterCard` function, inline in `src/app/page.tsx` lines 59–334 |
| Grid | `repeat(auto-fill, minmax(340px, 1fr))`, gap `SP[3]` |
| Card padding | `` `${SP[3]} ${SP[3]} ${SP[2]}` `` |
| Avatar | `3.5rem × 3.5rem` |
| Name | `FS.h3` (~18–28px) |
| Existing left-spring | `.hov-lift::before` ✅ |
| Existing sweep shimmer | `.hov-lift::after` ✅ |
| `--hud-accent` | `#E03020` |
| Z.overlay | `100` |
| Z.modal | `410` |
| Z.toast | `800` |
| Click handler | `handleClick()` → `onClaim()` → `claimCharacter()` → `router.push()` |

---

## File map

| File | What changes |
|---|---|
| `src/app/page.tsx` | Card size values, hover class names, watermark JSX, hint JSX, hyperspace state machine, canvas element, loading screen |
| `src/styles/animations.css` | `.char-card`, `.char-card--glow`, `@keyframes charCardGlow`, watermark/hint CSS, loading bar animation, reduced-motion rules |

---

## Task 1 — Card density: shrink CharacterCard to fit 2×3 grid

**Files:**
- Modify: `src/app/page.tsx` (CharacterCard, lines 127–334, and grid container lines 635–640)

- [ ] **Step 1: Update the grid container**

Find lines 635–640 (the `/* Character Grid */` div) and change:

```tsx
{/* Character Grid */}
<div style={{
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
}}>
```

> Changed `minmax(340px, 1fr)` → `repeat(3, 1fr)` (fixed 3 columns), `SP[3]` → `'8px'`.

- [ ] **Step 2: Shrink the card container**

Find the card root `<div` at line 127. Change padding and borderRadius:

```tsx
<div
  style={{
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '7px',
    padding: '8px',
    backdropFilter: 'blur(12px)',
    transition: `all ${EASE.default}`,
    animation: `fadeUp 0.5s ${animDelay}s ease both`,
    border: `1px solid ${cardBorder}`,
    background: cardBg,
    cursor: cardCursor,
  }}
  onClick={handleClick}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
```

> Removed `transform: cardTransform` and `boxShadow: cardShadow` — these move to CSS in Task 2. Reduced padding to `'8px'`, borderRadius to `'7px'`.

- [ ] **Step 3: Shrink the card header section**

Find line 177 (`/* Section 1 — CardHeader */`). Change the header flex container and avatar:

```tsx
{/* Section 1 — CardHeader */}
<div style={{ display: 'flex', gap: '6px', marginBottom: '5px', alignItems: 'flex-start' }}>
  {/* Avatar */}
  <div style={{
    flexShrink: 0,
    width: '22px', height: '22px',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    position: 'relative',
    border: `1px solid ${avatarBorderColor}`,
    boxShadow: avatarShadow,
    background: RAISED,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {char.portrait_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={char.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: state === 'self' ? HUD.gold : TEXT_SEC }}>
        {char.name.charAt(0)}
      </span>
    )}
    {/* Status dot */}
    <div style={{
      position: 'absolute', bottom: '2px', right: '2px',
      width: '5px', height: '5px',
      borderRadius: RADIUS.full,
      border: `1px solid ${BG}`,
      background: dotColor,
      animation: dotPulse,
    }} />
  </div>
```

- [ ] **Step 4: Shrink the identity block (name, subline, badge)**

Find the `{/* Identity block */}` div (line 213). Replace:

```tsx
{/* Identity block */}
<div style={{ flex: 1, minWidth: 0 }}>
  <div style={{ fontFamily: FONT_BODY, fontSize: '7.5px', fontWeight: 700, color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {char.name}
  </div>
  <div style={{ fontFamily: FONT_BODY, fontSize: '6.5px', color: TEXT_MUT, textTransform: 'uppercase', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {char.career_key} // {char.species_key}
  </div>
  {/* Status badge */}
  <div style={{
    marginTop: '2px',
    display: 'inline-flex', alignItems: 'center', gap: '2px',
    border: `1px solid ${state === 'self' ? HUD.gold : TEXT_MUT}`,
    borderRadius: RADIUS.sm,
    padding: '1px 4px',
    background: state === 'self' ? 'var(--hud-surface-lo)' : 'transparent',
  }}>
    {state === 'available' && (
      <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Unselected
      </span>
    )}
    {state === 'self' && (
      <>
        <div style={{ width: '4px', height: '4px', borderRadius: RADIUS.full, background: HUD.gold, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          You · Active
        </span>
      </>
    )}
  </div>
</div>
```

- [ ] **Step 5: Shrink the Characteristics row**

Find lines 246–271 (`/* Section 2 — CharacteristicRow */`). Replace:

```tsx
{/* Section 2 — CharacteristicRow */}
<div style={{
  borderTop: `1px solid ${BORDER}`,
  paddingTop: '3px',
  marginTop: '3px',
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '2px',
}}>
  {characteristics.map(({ key, label }) => (
    <div key={key} style={{
      background: INPUT_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: RADIUS.sm,
      padding: '2px 1px',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: '9px', fontWeight: 700, color: CHAR_COLORS[key] }}>
        {(char as unknown as Record<string, number>)[key]}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 6: Shrink the DerivedStats row**

Find lines 273–292 (`/* Section 3 — DerivedStatsRow */`). Replace:

```tsx
{/* Section 3 — DerivedStatsRow */}
<div style={{ marginTop: '3px', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
  {derived.map(({ label, value }) => (
    <div key={label} style={{
      background: INPUT_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: RADIUS.sm,
      padding: '2px 4px',
      minWidth: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: '8px', fontWeight: 700, color: TEXT }}>
        {value}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: '5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 7: Shrink the Vitals pip rows**

Find lines 294–330 (`/* Section 4 — VitalsPips */`). Replace:

```tsx
{/* Section 4 — VitalsPips */}
<div style={{ marginTop: '3px' }}>
  {/* Wounds */}
  <div style={{ marginBottom: '3px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.08em', width: '28px' }}>Wounds</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
      {Array.from({ length: char.wound_threshold }).map((_, i) => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '1px',
          background: i < char.wound_current ? DANGER : 'transparent',
          border: `1px solid ${i < char.wound_current ? DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}`,
        }} />
      ))}
    </div>
  </div>
  {/* Strain */}
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.08em', width: '28px' }}>Strain</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT }}>{char.strain_current}/{char.strain_threshold}</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
      {Array.from({ length: char.strain_threshold }).map((_, i) => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '1px',
          background: i < char.strain_current ? WARN : 'transparent',
          border: `1px solid ${i < char.strain_current ? WARN : 'var(--hud-border)'}`,
        }} />
      ))}
    </div>
  </div>
</div>
```

- [ ] **Step 8: Verify build and check visual at 100% zoom**

```
npx tsc --noEmit
npm run build
```

Expected: clean build. Open `localhost:3000` at 100% zoom — all six cards should be visible in 3 columns without vertical scrolling.

- [ ] **Step 9: Commit**

```
git add src/app/page.tsx
git commit -m "feat(character-select): reduce card density — 2×3 grid fits viewport without scrolling"
```

---

## Task 2 — Hover interaction system: CSS effects

**Files:**
- Modify: `src/styles/animations.css`
- Modify: `src/app/page.tsx` (CharacterCard — add className, update cardBorder hover color)

### Part A — CSS in animations.css

- [ ] **Step 1: Add charCardGlow keyframe and .char-card class**

Append after the existing `.hov-lift` section (after line ~238) in `src/styles/animations.css`:

```css
/* ═══════════════════════════════════════════════════════════
   CHARACTER CARD HOVER SYSTEM
   .char-card — scale lift + glow.
   .char-card--glow — pulsing border animation (toggled by JS).
   Watermark + hint included here to co-locate card concerns.
   ═══════════════════════════════════════════════════════════ */

@keyframes charCardGlow {
  0%, 100% { border-color: rgba(224, 48, 32, 0.30); }
  50%       { border-color: rgba(224, 48, 32, 0.65); }
}

.char-card {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
}

.char-card:hover {
  transform:  scale(1.04) translateY(-4px);
  box-shadow:
    0 0 0 1px rgba(224, 48, 32, 0.10),
    0 0 14px rgba(224, 48, 32, 0.28),
    0 0 32px rgba(224, 48, 32, 0.08),
    0 8px 20px rgba(0, 0, 0, 0.60);
}

.char-card--glow {
  animation: charCardGlow 2s ease-in-out infinite;
}

/* ── Rebel watermark ─────────────────────────────────── */
.char-card-watermark {
  position: absolute;
  top: -8px; left: -18px;
  width: 88px; height: 88px;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease 0.08s;
}

.char-card:hover .char-card-watermark {
  opacity: 1;
}

/* ── Interactable hint (↗ arrow circle, bottom-right) ─ */
.char-card-hint {
  position: absolute;
  bottom: 6px; right: 6px;
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: border-color 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}

.char-card:hover .char-card-hint {
  border-color: rgba(224, 48, 32, 0.55);
  opacity: 1;
}

.char-card-hint-arrow {
  width: 4px; height: 4px;
  border-right: 1px solid rgba(224, 48, 32, 0.80);
  border-top:   1px solid rgba(224, 48, 32, 0.80);
  transform: rotate(45deg) translate(-1px, 1px);
}

/* ── Loading bar sweep ───────────────────────────────── */
@keyframes loadingBarSweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* ── Reduced motion overrides ────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .char-card             { transition: none; }
  .char-card:hover       { transform: none; box-shadow: none; }
  .char-card--glow       { animation: none; }
  .char-card-watermark   { transition: none; }
  .char-card-hint        { transition: none; }
}
```

### Part B — Wire className and adjust hover border in page.tsx

- [ ] **Step 2: Add className and update cardBorder hover colour**

In `CharacterCard`, change the `cardBorder` computation (currently line 75–79) to use the accent colour on hover:

```tsx
const cardBorder = state === 'self'
  ? BORDER_HI
  : hovered
    ? 'rgba(224,48,32,0.65)'
    : BORDER
```

Then add `className` to the card root div (the `<div` with `position: 'relative'`). The div should now read:

```tsx
<div
  className={`char-card hov-lift${hovered && state !== 'self' ? ' char-card--glow' : ''}`}
  style={{
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '7px',
    padding: '8px',
    backdropFilter: 'blur(12px)',
    transition: `all ${EASE.default}`,
    animation: `fadeUp 0.5s ${animDelay}s ease both`,
    border: `1px solid ${cardBorder}`,
    background: cardBg,
    cursor: cardCursor,
  }}
  onClick={handleClick}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
```

> Note: `transform` and `boxShadow` are intentionally absent from inline styles — CSS `.char-card` handles them. The `border` inline style coexists with the CSS glow animation; the CSS rule animates `border-color` while the inline style provides the base value (JS-driven). Both work because the glow animation overrides border-color via animation keyframes at higher effective priority when `.char-card--glow` is active.

- [ ] **Step 3: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```

Expected: clean. Hover a card at `localhost:3000` — scale lift + left-spring + sweep shimmer + glow pulse should all fire simultaneously.

- [ ] **Step 4: Commit**

```
git add src/styles/animations.css src/app/page.tsx
git commit -m "feat(character-select): five-layer hover system — scale lift, glow pulse, left-spring, sweep shimmer"
```

---

## Task 3 — Rebel watermark + interactable hint

**Files:**
- Modify: `src/app/page.tsx` (CharacterCard body — add two new absolutely-positioned elements)

- [ ] **Step 1: Add Rebel watermark inside the card**

In `CharacterCard`, immediately after the `{/* Delete button */}` block (around line 174) and before `{/* Section 1 — CardHeader */}`, add:

```tsx
{/* Rebel Alliance watermark — fades in on hover via .char-card-watermark CSS */}
<div className="char-card-watermark">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/factions/rebel.png"
    alt=""
    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', filter: 'opacity(0.2)' }}
  />
</div>
```

- [ ] **Step 2: Add the interactable hint arrow**

At the very end of the card body (just before the closing `</div>` of the root card div, after the VitalsPips section), add:

```tsx
{/* Interactable hint — arrow circle, bottom-right, appears on hover */}
<div className="char-card-hint">
  <div className="char-card-hint-arrow" />
</div>
```

- [ ] **Step 3: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```

Expected: clean. Hover a card — Rebel watermark fades in at top-left (partially clipped by `overflow:hidden` which is intentional), arrow hint appears bottom-right.

- [ ] **Step 4: Commit**

```
git add src/app/page.tsx
git commit -m "feat(character-select): add Rebel watermark fade-in and interactable hint on card hover"
```

---

## Task 4 — Hyperspace transition: Beats 1–4 (press, stretch, starfield, darkening)

**Files:**
- Modify: `src/app/page.tsx` (Home component state, CharacterCard props, canvas element, starfield function)

This task is the most complex. Read the full current `CharacterCard` props interface and `Home` component before editing.

### Part A — CharacterCard changes

- [ ] **Step 1: Add `useRef` and new props to CharacterCard**

Update `CharacterCardProps` interface (line 60):

```tsx
interface CharacterCardProps {
  char:       Character
  state:      CardState
  online:     boolean
  animDelay:  number
  onSelect:   (rect: DOMRect) => void   // replaces onClaim
  onDelete:   () => void
  hyperTransform?: string               // externally set transform during hyperspace
  hyperOpacity?:   number               // externally set opacity during hyperspace
}
```

Update the function signature:

```tsx
function CharacterCard({
  char, state, online,
  animDelay, onSelect, onDelete,
  hyperTransform, hyperOpacity,
}: CharacterCardProps) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
```

Add `import { useRef } from 'react'` to the existing React imports at the top of the file (they're likely `import { useState, useEffect, ... } from 'react'` — add `useRef` to that list).

Update `handleClick`:

```tsx
function handleClick() {
  if (!cardRef.current) return
  onSelect(cardRef.current.getBoundingClientRect())
}
```

Attach the ref and merge `hyperTransform`/`hyperOpacity` into the card's inline style. Find the card root `<div` and add `ref={cardRef}`, plus override transform/opacity when provided:

```tsx
<div
  ref={cardRef}
  className={`char-card hov-lift${hovered && state !== 'self' ? ' char-card--glow' : ''}`}
  style={{
    position:  'relative',
    overflow:  'hidden',
    borderRadius: '7px',
    padding:   '8px',
    backdropFilter: 'blur(12px)',
    transition: hyperTransform !== undefined
      ? 'transform 0.35s cubic-bezier(0.4,0,1,1), opacity 0.3s ease 0.1s'
      : `all ${EASE.default}`,
    animation: `fadeUp 0.5s ${animDelay}s ease both`,
    border:    `1px solid ${cardBorder}`,
    background: cardBg,
    cursor:    cardCursor,
    transform: hyperTransform,          // undefined = CSS handles it
    opacity:   hyperOpacity,            // undefined = CSS handles it
  }}
  onClick={handleClick}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
```

### Part B — Hyperspace state machine in Home

- [ ] **Step 2: Add HyperspaceState type and state variables**

Just before `export default function Home()` (line ~337), add the type:

```tsx
type HyperspacePhase =
  | 'idle'
  | 'beat1'       // 0–120ms: card press
  | 'beat24'      // 120ms+: stretch + starfield + darkening
  | 'loading'     // Beat 5: loading screen

interface HyperspaceState {
  phase:    HyperspacePhase
  charId:   string
  cardRect: DOMRect | null
}
```

Inside `Home`, add these state/ref declarations near the top of the function (after the existing `useState` calls):

```tsx
const [hyper, setHyper] = useState<HyperspaceState>({ phase: 'idle', charId: '', cardRect: null })
const canvasRef = useRef<HTMLCanvasElement>(null)
const [loadingTextIdx, setLoadingTextIdx] = useState(0)

const LOADING_TEXTS = [
  'Accessing rebel alliance records...',
  'Syncing holonet profile data...',
  'Decrypting imperial wanted list...',
  'Establishing secure channel...',
  'Verifying rebel clearance codes...',
  'Loading character dossier...',
]
```

- [ ] **Step 3: Add the starfield canvas function**

Place this function OUTSIDE the `Home` function (after the `CharacterCard` function definition, before `export default function Home()`):

```tsx
function runHyperspaceCanvas(
  canvas: HTMLCanvasElement,
  originX: number,
  originY: number,
  onComplete: () => void,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) { onComplete(); return }
  const W = canvas.width
  const H = canvas.height
  const TOTAL_MS = 900

  const stars = Array.from({ length: 120 }, () => ({
    angle:   Math.random() * Math.PI * 2,
    speed:   0.3 + Math.random() * 0.7,
    offX:    (Math.random() - 0.5) * 120,
    offY:    (Math.random() - 0.5) * 120,
    color:   Math.random() < 0.5
               ? '#e8dcc0'
               : Math.random() < 0.6
                 ? '#c8883a'
                 : '#E03020',
  }))

  let startTime: number | null = null

  function frame(timestamp: number) {
    if (!startTime) startTime = timestamp
    const t = Math.min((timestamp - startTime) / TOTAL_MS, 1)
    ctx.clearRect(0, 0, W, H)

    const alpha = t < 0.15
      ? t / 0.15
      : t > 0.75
        ? 1 - (t - 0.75) / 0.25
        : 1

    ctx.globalAlpha = alpha * 0.85
    stars.forEach(star => {
      const len = Math.pow(t, 0.6) * star.speed * 300
      const sx  = originX + star.offX
      const sy  = originY + star.offY
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(sx + Math.cos(star.angle) * len, sy + Math.sin(star.angle) * len)
      ctx.strokeStyle = star.color
      ctx.lineWidth   = 0.8 + t * 0.8
      ctx.stroke()
    })

    if (t >= 0.45 && t <= 0.72) {
      const ft     = (t - 0.45) / 0.27
      const fAlpha = Math.sin(ft * Math.PI) * 0.6
      const fRad   = 60 + ft * 200
      const grad   = ctx.createRadialGradient(originX, originY, 0, originX, originY, fRad)
      grad.addColorStop(0,   `rgba(255,240,200,${fAlpha})`)
      grad.addColorStop(0.3, `rgba(224,48,32,${fAlpha * 0.6})`)
      grad.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.globalAlpha = 1
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      ctx.clearRect(0, 0, W, H)
      onComplete()
    }
  }

  requestAnimationFrame(frame)
}
```

- [ ] **Step 4: Add claimCharacterDB (DB-only, no navigation)**

Inside `Home`, add a new function alongside `claimCharacter`. Split the existing function into DB-write part and navigation:

```tsx
// ── claimCharacterDB — DB writes only, no router.push ─────────────
async function claimCharacterDB(characterId: string) {
  if (!campaignId) return
  const supabase = createClient()
  await supabase.from('character_sessions')
    .delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)
  await supabase.from('character_sessions')
    .delete().eq('character_id', characterId).eq('campaign_id', campaignId)
  await supabase.from('character_sessions').insert({
    campaign_id:  campaignId,
    character_id: characterId,
    session_key:  sessionKey,
    is_active:    true,
  })
}
```

Keep the original `claimCharacter` function for non-reduced-motion fallback (it still calls `router.push()`).

- [ ] **Step 5: Add handleCardSelect — the hyperspace orchestrator**

Inside `Home`, add:

```tsx
function handleCardSelect(charId: string, rect: DOMRect) {
  if (hyper.phase !== 'idle') return

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    void claimCharacter(charId)
    return
  }

  // Start DB writes in parallel with animation
  void claimCharacterDB(charId)

  // Beat 1: card press (0–120ms)
  setHyper({ phase: 'beat1', charId, cardRect: rect })

  setTimeout(() => {
    // Beat 2-4: stretch, starfield, darkening
    setHyper({ phase: 'beat24', charId, cardRect: rect })

    const canvas = canvasRef.current
    if (!canvas) return

    // Size canvas to viewport
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    // Origin = centre of clicked card in viewport coords
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2

    runHyperspaceCanvas(canvas, cx, cy, () => {
      // Beat 5: show loading screen
      setHyper({ phase: 'loading', charId, cardRect: rect })
    })
  }, 120)
}
```

- [ ] **Step 6: Add loading text cycling effect**

Inside `Home`, add a `useEffect` that cycles loading text:

```tsx
useEffect(() => {
  if (hyper.phase !== 'loading') return
  setLoadingTextIdx(0)
  const id = setInterval(() => {
    setLoadingTextIdx(prev => (prev + 1) % LOADING_TEXTS.length)
  }, 1800)
  return () => clearInterval(id)
}, [hyper.phase]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 7: Add the canvas and dark overlay elements to the JSX**

Find the outermost container div in `Home` (the page root, which wraps the status bar, grid, bottom actions etc.). It needs `position: 'relative'`. Confirm it already has this; if not, add it.

Then, just before the closing tag of that root container div, add:

```tsx
{/* ── Hyperspace canvas ── */}
<canvas
  ref={canvasRef}
  style={{
    position:      'fixed',
    inset:         0,
    zIndex:        20,
    pointerEvents: 'none',
    display:       hyper.phase === 'beat24' || hyper.phase === 'loading' ? 'block' : 'none',
  }}
/>

{/* ── Hyperspace dark overlay ── */}
{(hyper.phase === 'beat24' || hyper.phase === 'loading') && (
  <div style={{
    position:   'fixed',
    inset:      0,
    zIndex:     12,
    background: 'rgba(10,8,6,0)',
    animation:  'hyperspaceOverlay 0.7s ease forwards',
    pointerEvents: 'none',
  }} />
)}
```

Add the `@keyframes hyperspaceOverlay` keyframe to `src/styles/animations.css`:

```css
@keyframes hyperspaceOverlay {
  from { background: rgba(10, 8, 6, 0);    }
  to   { background: rgba(10, 8, 6, 0.94); }
}
```

- [ ] **Step 8: Wire card transform/opacity props from hyper state**

Update the `CharacterCard` render in the grid (lines 641–655). Each card now receives `onSelect` and conditional hyperspace props:

```tsx
{characters.map((char, index) => {
  const cardState = getCardState(char.id)
  const online    = isPlayerOnline(char.id)
  const isSelected = hyper.phase !== 'idle' && hyper.charId === char.id
  const isOther    = hyper.phase !== 'idle' && hyper.charId !== char.id

  let hyperTransform: string | undefined
  let hyperOpacity:   number | undefined

  if (isSelected) {
    if (hyper.phase === 'beat1') {
      hyperTransform = 'scale(0.94)'
    } else if (hyper.phase === 'beat24') {
      hyperTransform = 'scaleX(6) scaleY(0.15) translateX(60px)'
      hyperOpacity   = 0
    }
  } else if (isOther && (hyper.phase === 'beat24' || hyper.phase === 'loading')) {
    hyperOpacity = 0.08
  }

  return (
    <CharacterCard
      key={char.id}
      char={char}
      state={cardState}
      online={online}
      animDelay={0.15 + index * 0.08}
      onSelect={(rect) => handleCardSelect(char.id, rect)}
      onDelete={() => void deleteCharacter(char.id, char.name)}
      hyperTransform={hyperTransform}
      hyperOpacity={hyperOpacity}
    />
  )
})}
```

Also update the `onClaim` call on the existing `CharacterCard` in the grid — `onClaim` prop no longer exists, it's now `onSelect`. (The `claimCharacter` function is called inside `handleCardSelect`.)

- [ ] **Step 9: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```

Expected: clean. Click a card — it presses (beat1), then stretches and vanishes with starfield (beat24), screen darkens.

- [ ] **Step 10: Commit**

```
git add src/app/page.tsx src/styles/animations.css
git commit -m "feat(character-select): hyperspace beats 1-4 — card press, stretch, canvas starfield, screen darkening"
```

---

## Task 5 — Hyperspace Beat 5: loading screen + cleanup

**Files:**
- Modify: `src/app/page.tsx` (Home — add loading screen JSX, add navigation trigger)

- [ ] **Step 1: Add the Beat 5 loading screen overlay**

In `Home`'s JSX, add the loading screen immediately after the dark overlay element added in Task 4. It conditionally renders when `hyper.phase === 'loading'`:

```tsx
{hyper.phase === 'loading' && (() => {
  const char = characters.find(c => c.id === hyper.charId)
  if (!char) return null
  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      zIndex:         22,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '16px',
      animation:      'fadeUp 0.4s ease both',
    }}>
      {/* Mini character card */}
      <div style={{
        width:        '175px',
        borderRadius: '7px',
        border:       '1px solid rgba(224,48,32,0.65)',
        background:   'var(--hud-surface-hi)',
        backdropFilter: 'blur(12px)',
        padding:      '10px',
        boxShadow:
          '0 0 0 1px rgba(224,48,32,0.10), 0 0 14px rgba(224,48,32,0.28), 0 0 32px rgba(224,48,32,0.08)',
        animation:    'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', alignItems: 'center' }}>
          <div style={{
            flexShrink: 0, width: '28px', height: '28px',
            borderRadius: '50%', overflow: 'hidden',
            border: `1px solid ${HUD.gold}`,
            background: 'var(--hud-surface-hi)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {char.portrait_url
              ? <img src={char.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: FONT_BODY, fontSize: '10px', color: HUD.gold }}>{char.name.charAt(0)}</span>
            }
          </div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '9px', fontWeight: 700, color: HUD.gold }}>{char.name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '7px', color: 'var(--hud-text-faint)', textTransform: 'uppercase' }}>{char.career_key}</div>
          </div>
        </div>
        {/* Rebel watermark at full opacity */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-4px', left: '-10px',
            width: '60px', height: '60px', pointerEvents: 'none',
            zIndex: 3,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/factions/rebel.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'opacity(0.25)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '2px' }}>
            {(['brawn','agility','intellect','cunning','willpower','presence'] as const).map(key => (
              <div key={key} style={{ background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: '2px', padding: '2px 1px', textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: '9px', fontWeight: 700, color: CHAR_COLORS[key] }}>
                  {(char as unknown as Record<string, number>)[key]}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: 'var(--hud-text-faint)', textTransform: 'uppercase' }}>
                  {key.slice(0, 2).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOLOCRON wordmark + loading bar */}
      <div style={{ animation: 'fadeUp 0.45s 0.2s cubic-bezier(0.34,1.56,0.64,1) both', textAlign: 'center' }}>
        <div style={{
          fontFamily:    FONT_BODY,
          fontSize:      '13px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color:         HUD.gold,
          marginBottom:  '8px',
        }}>
          H O L O C R O N
        </div>

        {/* Loading bar */}
        <div style={{
          width:        '200px',
          height:       '2px',
          background:   'rgba(255,255,255,0.08)',
          borderRadius: '1px',
          overflow:     'hidden',
          margin:       '0 auto 8px',
          position:     'relative',
        }}>
          <div style={{
            position:   'absolute',
            top: 0, left: 0,
            width:      '40%',
            height:     '100%',
            background: 'linear-gradient(90deg, transparent, #E03020, #c8883a, transparent)',
            animation:  'loadingBarSweep 1.4s ease-in-out infinite',
          }} />
        </div>

        {/* Flavour text */}
        <div style={{
          fontFamily:    FONT_BODY,
          fontSize:      '7px',
          color:         'var(--hud-text-faint)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {LOADING_TEXTS[loadingTextIdx]}
        </div>
      </div>
    </div>
  )
})()}
```

- [ ] **Step 2: Add navigation after loading screen minimum display**

In `Home`, add a `useEffect` that navigates after the loading screen has shown for at least 1500ms:

```tsx
useEffect(() => {
  if (hyper.phase !== 'loading') return
  const { charId } = hyper
  const timer = setTimeout(() => {
    router.push(`/character/${charId}${campaignId ? `?campaign=${campaignId}` : ''}`)
  }, 1500)
  return () => clearTimeout(timer)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [hyper.phase])
```

- [ ] **Step 3: Reset hyper state on route change / unmount**

Add cleanup to prevent stuck overlays if the user navigates back:

```tsx
useEffect(() => {
  return () => {
    setHyper({ phase: 'idle', charId: '', cardRect: null })
  }
}, [])
```

- [ ] **Step 4: Verify TypeScript and build**

```
npx tsc --noEmit
npm run build
```

Expected: clean.

- [ ] **Step 5: Full acceptance test**

Start the dev server:
```
npm run dev
```

Check each acceptance criterion:
1. Open `localhost:3000` at 100% zoom — all 6 cards visible without scrolling in a 3×2 grid ✅
2. Hover a card — scale lift + left-spring accent + sweep shimmer + border glow pulse + Rebel watermark ✅
3. Arrow hint appears bottom-right on hover ✅
4. Click a card — card presses (beat1), stretches and vanishes (beat24), starfield erupts from card centre, screen darkens, other cards fade ✅
5. Beat 5 loading screen appears with mini card, wordmark, loading bar sweep, cycling flavour text ✅
6. Navigation to `/character/[id]` fires after ~1.5s ✅
7. No lingering canvas or dark overlay after navigation ✅
8. Test with `prefers-reduced-motion: reduce` in browser devtools — hyperspace skips, direct navigation ✅
9. GM PIN entry, session bar, HOLOCRON header all unaffected ✅
10. `npm run build` passes clean ✅

- [ ] **Step 6: Commit**

```
git add src/app/page.tsx
git commit -m "feat(character-select): hyperspace beat 5 — loading screen with mini card, wordmark, bar, flavour text"
```

---

## Self-review checklist

**Spec coverage:**
- ✅ Card density — all six fields reduced, 3-column fixed grid, 8px gap
- ✅ Effect 1 — left-spring: `.hov-lift::before` via `hov-lift` className
- ✅ Effect 2 — border glow pulse: `charCardGlow` + `.char-card--glow` class
- ✅ Effect 3 — scale lift: `.char-card:hover { transform: scale(1.04) translateY(-4px) }`
- ✅ Effect 4 — sweep shimmer: `.hov-lift::after` via `hov-lift` className
- ✅ Effect 5 — Rebel watermark: `.char-card-watermark` CSS, JSX img element
- ✅ Interactable hint: `.char-card-hint` CSS, JSX div
- ✅ Beat 1 — card press: `hyperTransform: 'scale(0.94)'` in 0–120ms
- ✅ Beat 2 — hyperspace stretch: `scaleX(6) scaleY(0.15) translateX(60px)` + opacity 0
- ✅ Beat 3 — starfield canvas: `runHyperspaceCanvas` with 120 stars, flash at 45–72%
- ✅ Beat 4 — screen darkens: fixed overlay with `hyperspaceOverlay` animation; other cards → opacity 0.08
- ✅ Beat 5 — loading screen: mini card + wordmark + loading bar + cycling flavour text + navigation
- ✅ prefers-reduced-motion: skip beats 1–4, direct `claimCharacter()` call
- ✅ Canvas origin: `rect.left + rect.width/2, rect.top + rect.height/2` from `getBoundingClientRect()`
- ✅ No stale DOM: canvas fixed-positioned (not a lingering child), cleanup on unmount
- ✅ Z-index: overlay 12, canvas 20, loading screen 22 — all above card grid (z 1), below Z.modal (410)
- ✅ CSS custom properties used for accent colours; hardcoded only for amber (#c8883a) and white (#e8dcc0) as specified
