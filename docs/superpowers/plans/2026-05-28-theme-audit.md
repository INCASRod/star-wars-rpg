# Theme & Font Audit — 2026-05-28

Covers: Kyber Archive, Rebel Operative, Binary Sunset default, and all `Rajdhani` / `Share Tech Mono` / `var(--font-rajdhani)` occurrences across `src/`.

---

## 1. How themes are applied

All three themes share the same mechanism:

- **Binary Sunset** — default. No `data-theme` attribute is written. All `--hud-*` and `--bs-*` values come from `:root` in `src/app/globals.css`.
- **Rebel Operative** — `data-theme="operative"` on the root `<div>`.
- **Kyber Archive** — `data-theme="kyber"` on the root `<div>`.

The attribute is set in `src/components/player-hud/PlayerHUDDesktop.tsx:399`:
```tsx
data-theme={uiTheme === 'binary-sunset' ? undefined : uiTheme}
```

Theme type and switcher swatch data live in `src/components/player-hud/ThemeSwitcher.tsx`.
A separate `src/lib/theme.ts` exports the `ThemeId` type and default constant (both reference `'binary-sunset'`).

---

## 2. Binary Sunset — `:root` declarations

**File:** `src/app/globals.css:21–308`

### Project palette

| Property | Value |
|---|---|
| `--sand` | `#F2EDE4` |
| `--sand-warm` | `#E8E0D2` |
| `--parch` | `#FAF7F2` |
| `--white` | `#fff` |
| `--gold` | `#C8A24E` |
| `--gold-l` | `#DCBE6E` |
| `--gold-d` | `#8E6E2A` |
| `--gold-glow` | `rgba(200,162,78,.22)` |
| `--gold-glow-s` | `rgba(200,162,78,.45)` |
| `--blue` | `#2B5DAE` |
| `--blue-l` | `#5B8FE0` |
| `--blue-pale` | `#DCE8F8` |
| `--red` | `#B83A2A` |
| `--red-l` | `#E05842` |
| `--red-pale` | `#F8DAD4` |
| `--amber` | `#C47F17` |
| `--amber-pale` | `#F5E6C8` |
| `--green` | `#2D8F4E` |
| `--green-pale` | `#D0F0DB` |
| `--ink` | `#1A1A1C` |
| `--txt` | `#2C2C2E` |
| `--txt2` | `#6B6B6B` |
| `--txt3` | `#A0A0A0` |
| `--bdr` | `#D8D0C4` |
| `--bdr-l` | `#E8E2D8` |

### Binary Sunset palette (`--bs-*`)

| Property | Value |
|---|---|
| `--bs-sky` | `#E8DDD0` |
| `--bs-panel` | `#DDD0C0` |
| `--bs-surface` | `#D4C5B0` |
| `--bs-card` | `#CBBAA0` |
| `--bs-card-hi` | `#C0AD94` |
| `--bs-red-pale` | `#E86050` |
| `--bs-red-sun` | `#E03A1E` |
| `--bs-red-hi` | `#C82A10` |
| `--bs-red-mid` | `#A82010` |
| `--bs-red-dim` | `#7A1808` |
| `--bs-red-mute` | `#3A0C04` |
| `--bs-ink` | `#2A1008` |
| `--bs-txt` | `#5A2818` |
| `--bs-txt2` | `#8A5040` |
| `--bs-txt3` | `#AA7860` |
| `--bs-on-red` | `#FFF0E8` |
| `--bs-bdr-strong` | `#B09080` |
| `--bs-bdr-mid` | `#C0A890` |
| `--bs-bdr-subtle` | `#CDB8A4` |
| `--bs-red-glow` | `rgba(224,58,30,.12)` |
| `--bs-red-glow-s` | `rgba(224,58,30,.28)` |
| `--bs-wounds` | `var(--bs-red-sun)` |
| `--bs-strain` | `var(--bs-red-dim)` |
| `--bs-career` | `var(--bs-red-pale)` |
| `--bs-success-txt` | `#5A7A3A` |
| `--bs-corner` | `var(--bs-red-mid)` |
| `--bs-topbar-h` | `48px` |
| `--bs-modebar-h` | `36px` |
| `--bs-shell-offset` | `84px` |

### Die / symbol colours

| Property | Value |
|---|---|
| `--die-boost` | `#70C8E8` |
| `--die-setback` | `#A0A0A0` |
| `--die-difficulty` | `#B070D8` |
| `--die-challenge` | `#E05050` |
| `--die-force` | `#5AAAE0` |
| `--die-success` | `#4EC87A` |
| `--die-advantage` | `#4EC8C8` |
| `--die-threat` | `#E07855` |
| `--die-triumph` | `#FFD700` |
| `--die-despair` | `#C04040` |
| `--die-forcepip` | `#E8E8FF` |

### Fluid type scale

| Property | Value |
|---|---|
| `--text-display` | `clamp(2.25rem, 5vw + 1rem, 5rem)` |
| `--text-hero` | `clamp(1.375rem, 2vw + 0.5rem, 2rem)` |
| `--text-h1` | `clamp(1.75rem, 3.5vw + 0.75rem, 3.5rem)` |
| `--text-h2` | `clamp(1.375rem, 2.5vw + 0.5rem, 2.5rem)` |
| `--text-h3` | `clamp(1.125rem, 1.5vw + 0.5rem, 1.75rem)` |
| `--text-h4` | `clamp(1rem, 1vw + 0.5rem, 1.375rem)` |
| `--text-body` | `clamp(0.9375rem, 0.5vw + 0.75rem, 1.125rem)` |
| `--text-body-lg` | `clamp(1rem, 0.75vw + 0.75rem, 1.25rem)` |
| `--text-body-sm` | `clamp(0.75rem, 0.25vw + 0.6rem, 0.875rem)` |
| `--text-label` | `clamp(0.6875rem, 0.3vw + 0.55rem, 0.8125rem)` |
| `--text-caption` | `clamp(0.625rem, 0.2vw + 0.5rem, 0.75rem)` |
| `--text-overline` | `clamp(0.5625rem, 0.15vw + 0.45rem, 0.6875rem)` |
| `--text-sm` | `var(--text-body-sm)` |
| `--text-xs` | `var(--text-caption)` |

### Fluid spacing scale

| Property | Value |
|---|---|
| `--space-1` | `clamp(0.25rem, 0.5vw, 0.5rem)` |
| `--space-2` | `clamp(0.5rem, 1vw, 1rem)` |
| `--space-3` | `clamp(0.75rem, 1.5vw, 1.5rem)` |
| `--space-4` | `clamp(1rem, 2vw, 2rem)` |
| `--space-5` | `1.25rem` |
| `--space-6` | `clamp(1.5rem, 3vw, 3rem)` |
| `--space-8` | `clamp(2rem, 4vw, 4rem)` |
| `--space-10` | `2.5rem` |
| `--space-12` | `clamp(3rem, 6vw, 6rem)` |
| `--space-16` | `clamp(4rem, 8vw, 10rem)` |
| `--space-20` | `5rem` |
| `--space-24` | `clamp(6rem, 10vw, 14rem)` |
| `--space-32` | `8rem` |
| `--space-48` | `12rem` |
| `--space-64` | `16rem` |

### Font weight, shadow, transition, container

| Property | Value |
|---|---|
| `--weight-regular` | `400` |
| `--weight-medium` | `500` |
| `--weight-bold` | `600` |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` |
| `--ease-default` | `200ms ease` |
| `--ease-spring` | `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--container-sm` | `40rem` |
| `--container-md` | `56rem` |
| `--container-lg` | `75rem` |
| `--container-xl` | `90rem` |
| `--container-full` | `100%` |
| `--measure-narrow` | `45ch` |
| `--measure-body` | `68ch` |
| `--measure-wide` | `80ch` |
| `--measure-prose` | `72ch` |

### Legacy aliases

| Property | Value |
|---|---|
| `--font-2xs` | `var(--text-overline)` |
| `--font-xs` | `var(--text-caption)` |
| `--font-sm` | `var(--text-label)` |
| `--font-base` | `var(--text-body-sm)` |
| `--font-md` | `var(--text-body)` |
| `--font-lg` | `var(--text-h4)` |
| `--font-xl` | `var(--text-h3)` |
| `--font-2xl` | `var(--text-h1)` |
| `--font-hero` | `var(--text-hero)` |
| `--sp-xs` | `var(--space-1)` |
| `--sp-sm` | `var(--space-2)` |
| `--sp-md` | `var(--space-4)` |
| `--sp-lg` | `var(--space-5)` |
| `--sp-xl` | `var(--space-6)` |
| `--font-rajdhani` | `var(--font-body)` → Palanquin |
| `--font-cinzel` | `var(--font-display)` → Signika |
| `--font-orbitron` | `var(--font-display)` → Signika |
| `--font-mono` | `var(--font-body)` → Palanquin |

### HUD default tokens (Binary Sunset values)

| Property | Value | Resolved |
|---|---|---|
| `--hud-bg` | `var(--bs-sky)` | `#E8DDD0` |
| `--hud-panel` | `var(--bs-panel)` | `#DDD0C0` |
| `--hud-surface-lo` | `var(--bs-surface)` | `#D4C5B0` |
| `--hud-surface-mid` | `#C8B89A` | *(hardcoded — note: "stepped darker than bs-card")* |
| `--hud-surface-hi` | `var(--bs-card-hi)` | `#C0AD94` |
| `--hud-border` | `var(--bs-bdr-subtle)` | `#CDB8A4` |
| `--hud-border-hi` | `var(--bs-bdr-mid)` | `#C0A890` |
| `--hud-border-strong` | `#9A8068` | *(hardcoded)* |
| `--hud-text` | `var(--bs-txt)` | `#5A2818` |
| `--hud-text-dim` | `var(--bs-txt2)` | `#8A5040` |
| `--hud-text-faint` | `var(--bs-txt3)` | `#AA7860` |
| `--hud-gold` | `#E03A1E` | |
| `--hud-accent-10` | `rgba(224,58,30,0.10)` | |
| `--hud-accent-20` | `rgba(224,58,30,0.20)` | |
| `--hud-accent-25` | `rgba(224,58,30,0.25)` | |
| `--hud-accent-35` | `rgba(224,58,30,0.35)` | |
| `--hud-accent-40` | `rgba(224,58,30,0.40)` | |
| `--hud-accent-45` | `rgba(224,58,30,0.45)` | |
| `--hud-accent-50` | `rgba(224,58,30,0.50)` | |
| `--hud-accent-60` | `rgba(224,58,30,0.60)` | |
| `--hud-accent-border` | `rgba(224,58,30,0.30)` | |
| `--hud-accent-purple` | `#9060D0` | |
| `--hud-gold-subtle` | `rgba(200,170,80,0.15)` | |
| `--hud-gold-border` | `rgba(200,170,80,0.25)` | |
| `--hud-gold-40` | `rgba(200,170,80,0.40)` | |
| `--hud-vital-bg` | `#6A1A0A` | |
| `--hud-vital-border` | `#4A1006` | |
| `--hud-vital-text` | `var(--bs-on-red)` | `#FFF0E8` |
| `--hud-vital-text-dim` | `rgba(255,240,232,.65)` | |
| `--hud-vital-sep` | `rgba(255,255,255,.2)` | |
| `--hud-vital-wounds` | `#FF7050` | |
| `--hud-vital-strain` | `#FFB060` | |
| `--hud-sz-overline` | `var(--text-overline)` | |
| `--hud-sz-caption` | `var(--text-caption)` | |
| `--hud-sz-label` | `var(--text-label)` | |
| `--hud-sz-sm` | `var(--text-body-sm)` | |
| `--hud-sz-h4` | `var(--text-h4)` | |
| `--hud-sz-h3` | `var(--text-h3)` | |

---

## 3. Rebel Operative theme

**File:** `src/app/globals.css:909–990`  
**Selector:** `[data-theme="operative"]`  
No font or spacing overrides — colour values only.

### Surfaces / backgrounds

| Property | Value |
|---|---|
| `--hud-bg` | `#141210` |
| `--hud-panel` | `#1E1A16` |
| `--hud-surface-lo` | `#262018` |
| `--hud-surface-mid` | `#2A2218` |
| `--hud-surface-hi` | `#2E281E` |

### Borders

| Property | Value |
|---|---|
| `--hud-border` | `rgba(210,185,150,.13)` |
| `--hud-border-hi` | `rgba(210,185,150,.22)` |
| `--hud-border-strong` | `rgba(210,185,150,.30)` |

### Text

| Property | Value |
|---|---|
| `--hud-text` | `#B0A490` |
| `--hud-text-dim` | `#726050` |
| `--hud-text-faint` | `#4C4038` |

### Accent / gold ramp (rebel orange)

| Property | Value |
|---|---|
| `--hud-gold` | `#D4681A` |
| `--hud-accent-10` | `rgba(212,104,26,.10)` |
| `--hud-accent-20` | `rgba(212,104,26,.20)` |
| `--hud-accent-25` | `rgba(212,104,26,.25)` |
| `--hud-accent-35` | `rgba(212,104,26,.35)` |
| `--hud-accent-40` | `rgba(212,104,26,.40)` |
| `--hud-accent-45` | `rgba(212,104,26,.45)` |
| `--hud-accent-50` | `rgba(212,104,26,.50)` |
| `--hud-accent-60` | `rgba(212,104,26,.60)` |
| `--hud-accent-border` | `rgba(212,104,26,.28)` |
| `--hud-accent-purple` | `#9060D0` |

### Warm gold ramp (retained alongside orange)

| Property | Value |
|---|---|
| `--hud-gold-subtle` | `rgba(200,148,56,.15)` |
| `--hud-gold-border` | `rgba(200,148,56,.25)` |
| `--hud-gold-40` | `rgba(200,148,56,.40)` |

### Vitals strip

| Property | Value |
|---|---|
| `--hud-vital-bg` | `#180C06` |
| `--hud-vital-border` | `#0E0602` |
| `--hud-vital-text` | `#E8C888` |
| `--hud-vital-text-dim` | `rgba(232,200,136,.60)` |
| `--hud-vital-sep` | `rgba(232,200,136,.18)` |
| `--hud-vital-wounds` | `#CC4020` |
| `--hud-vital-strain` | `#C07818` |

### `--bs-*` alias remap

| Property | Value |
|---|---|
| `--bs-sky` | `#141210` |
| `--bs-panel` | `#1E1A16` |
| `--bs-surface` | `#262018` |
| `--bs-card` | `#2E281E` |
| `--bs-card-hi` | `#362E24` |
| `--bs-red-sun` | `#D4681A` |
| `--bs-red-pale` | `#E07840` |
| `--bs-red-hi` | `#B85016` |
| `--bs-red-mid` | `#904010` |
| `--bs-red-dim` | `#602808` |
| `--bs-red-mute` | `#301404` |
| `--bs-ink` | `#E8DED0` |
| `--bs-txt` | `#B0A490` |
| `--bs-txt2` | `#726050` |
| `--bs-txt3` | `#4C4038` |
| `--bs-on-red` | `#FFF0E0` |
| `--bs-bdr-strong` | `rgba(210,185,150,.30)` |
| `--bs-bdr-mid` | `rgba(210,185,150,.20)` |
| `--bs-bdr-subtle` | `rgba(210,185,150,.13)` |
| `--bs-red-glow` | `rgba(212,104,26,.12)` |
| `--bs-red-glow-s` | `rgba(212,104,26,.28)` |

### Additional scoped rules

`globals.css:974–990, 1262–1263`

- `.combat-check-btn`: `background: rgba(212,104,26,.10)` / `border: 1px solid rgba(212,104,26,.35)` / `color: #E8C888`
- `.combat-check-btn:hover`: `background: rgba(212,104,26,.20)` / `border-color: rgba(212,104,26,.55)` / `box-shadow: 0 0 10px rgba(212,104,26,.12)`
- `@keyframes combatPulseOperative`: `0%/100%` → `border-color: rgba(212,104,26,.25)`, no shadow; `50%` → `border-color: rgba(212,104,26,.55)`, `box-shadow: 0 0 10px rgba(212,104,26,.14)`
- `.combat-check-btn-pulse`: `animation: combatPulseOperative 2s ease-in-out infinite`
- `.hud-fi-rebel`: `filter: saturate(1.5) hue-rotate(20deg) brightness(1.8)`
- `.hud-fi-jedi`: `filter: brightness(1.5) opacity(0.88)`

---

## 4. Kyber Archive theme

**File:** `src/app/globals.css:992–1073`  
**Selector:** `[data-theme="kyber"]`  
No font or spacing overrides — colour values only.

### Surfaces / backgrounds

| Property | Value |
|---|---|
| `--hud-bg` | `#0C0E1A` |
| `--hud-panel` | `#111326` |
| `--hud-surface-lo` | `#161830` |
| `--hud-surface-mid` | `#1A1C34` |
| `--hud-surface-hi` | `#1C1E38` |

### Borders

| Property | Value |
|---|---|
| `--hud-border` | `rgba(91,188,216,.16)` |
| `--hud-border-hi` | `rgba(91,188,216,.28)` |
| `--hud-border-strong` | `rgba(91,188,216,.38)` |

### Text

| Property | Value |
|---|---|
| `--hud-text` | `#B0B8D0` |
| `--hud-text-dim` | `#707898` |
| `--hud-text-faint` | `#485070` |

### Accent / gold ramp (kyber-crystal cyan)

| Property | Value |
|---|---|
| `--hud-gold` | `#5BBCD8` |
| `--hud-accent-10` | `rgba(91,188,216,.10)` |
| `--hud-accent-20` | `rgba(91,188,216,.20)` |
| `--hud-accent-25` | `rgba(91,188,216,.25)` |
| `--hud-accent-35` | `rgba(91,188,216,.35)` |
| `--hud-accent-40` | `rgba(91,188,216,.40)` |
| `--hud-accent-45` | `rgba(91,188,216,.45)` |
| `--hud-accent-50` | `rgba(91,188,216,.50)` |
| `--hud-accent-60` | `rgba(91,188,216,.60)` |
| `--hud-accent-border` | `rgba(91,188,216,.25)` |
| `--hud-accent-purple` | `#9060D0` |

### Warm gold ramp (retained alongside cyan)

| Property | Value |
|---|---|
| `--hud-gold-subtle` | `rgba(200,162,78,.15)` |
| `--hud-gold-border` | `rgba(200,162,78,.25)` |
| `--hud-gold-40` | `rgba(200,162,78,.40)` |

### Vitals strip

| Property | Value |
|---|---|
| `--hud-vital-bg` | `#081220` |
| `--hud-vital-border` | `#050C18` |
| `--hud-vital-text` | `#80CCE8` |
| `--hud-vital-text-dim` | `rgba(128,204,232,.60)` |
| `--hud-vital-sep` | `rgba(128,204,232,.18)` |
| `--hud-vital-wounds` | `#D84030` |
| `--hud-vital-strain` | `#C89830` |

### `--bs-*` alias remap

| Property | Value |
|---|---|
| `--bs-sky` | `#0C0E1A` |
| `--bs-panel` | `#111326` |
| `--bs-surface` | `#161830` |
| `--bs-card` | `#1C1E38` |
| `--bs-card-hi` | `#202240` |
| `--bs-red-sun` | `#5BBCD8` |
| `--bs-red-pale` | `#80D4EC` |
| `--bs-red-hi` | `#3A9CBD` |
| `--bs-red-mid` | `#2A7898` |
| `--bs-red-dim` | `#1A5070` |
| `--bs-red-mute` | `#0C2840` |
| `--bs-ink` | `#EEF0F8` |
| `--bs-txt` | `#B0B8D0` |
| `--bs-txt2` | `#707898` |
| `--bs-txt3` | `#485070` |
| `--bs-on-red` | `#040814` |
| `--bs-bdr-strong` | `rgba(91,188,216,.38)` |
| `--bs-bdr-mid` | `rgba(91,188,216,.26)` |
| `--bs-bdr-subtle` | `rgba(91,188,216,.16)` |
| `--bs-red-glow` | `rgba(91,188,216,.12)` |
| `--bs-red-glow-s` | `rgba(91,188,216,.28)` |

### Additional scoped rules

`globals.css:1057–1073, 1266–1267`

- `.combat-check-btn`: `background: rgba(91,188,216,.10)` / `border: 1px solid rgba(91,188,216,.35)` / `color: #80CCE8`
- `.combat-check-btn:hover`: `background: rgba(91,188,216,.18)` / `border-color: rgba(91,188,216,.55)` / `box-shadow: 0 0 10px rgba(91,188,216,.12)`
- `@keyframes combatPulseKyber`: `0%/100%` → `border-color: rgba(91,188,216,.25)`, no shadow; `50%` → `border-color: rgba(91,188,216,.55)`, `box-shadow: 0 0 10px rgba(91,188,216,.14)`
- `.combat-check-btn-pulse`: `animation: combatPulseKyber 2s ease-in-out infinite`
- `.hud-fi-rebel`: `filter: saturate(1.8) hue-rotate(25deg) brightness(1.9)`
- `.hud-fi-jedi`: `filter: brightness(1.4) opacity(0.88)`

---

## 5. `'binary-sunset'` and `'operative'` occurrences

| File | Line |
|---|---|
| `src/lib/theme.ts` | 1 |
| `src/lib/theme.ts` | 4 |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | 206 |
| `src/components/player-hud/PlayerHUDDesktop.tsx` | 399 |
| `src/components/player-hud/ThemeSwitcher.tsx` | 3 |
| `src/components/player-hud/ThemeSwitcher.tsx` | 11 |
| `src/components/player-hud/ThemeSwitcher.tsx` | 12 |
| `src/app/globals.css` | 912 |
| `src/app/globals.css` | 974 |
| `src/app/globals.css` | 979 |
| `src/app/globals.css` | 988 |
| `src/app/globals.css` | 1262 |
| `src/app/globals.css` | 1263 |

---

## 6. `'Rajdhani'`, `'Share Tech Mono'`, and `var(--font-rajdhani)` occurrences

### `'Rajdhani'` — literal raw font name (capital R)

These are direct font-name references, bypassing the token system.

| File | Line |
|---|---|
| `src/app/gm/mapforge/page.tsx` | 10 |
| `src/app/gm/mapforge/page.tsx` | 11 |
| `src/components/character/QualityBadge.tsx` | 27 |
| `src/components/character/WeaponsCard.tsx` | 93 |
| `src/components/gm/AdversaryDetailPanel.tsx` | 15 |
| `src/components/gm/AdversaryEditor.tsx` | 12 |
| `src/components/gm/AdversaryLibrary.tsx` | 18 |
| `src/components/gm/DestinyGeneratePanel.tsx` | 12 |
| `src/components/gm/DutyObligationSetupModal.tsx` | 11 |
| `src/components/gm/DutyObligationTab.tsx` | 12 |
| `src/components/gm/ForceNotificationCard.tsx` | 7 |
| `src/components/gm/GmCharacterCard.tsx` | 8 |
| `src/components/gm/GmCharacterCard.tsx` | 9 |
| `src/components/gm/GmDiceRollerFAB.tsx` | 19 |
| `src/components/gm/GmLootModal.tsx` | 11 |
| `src/components/gm/GmLootModal.tsx` | 12 |
| `src/components/gm/GmMapView.tsx` | 21 |
| `src/components/gm/GmReferenceDrawer.tsx` | 39 |
| `src/components/gm/ItemDatabaseTab.tsx` | 21 |
| `src/components/gm/ItemEditor.tsx` | 29 |
| `src/components/gm/ItemEditor.tsx` | 1342 |
| `src/components/gm/ItemEditor.tsx` | 1353 |
| `src/components/gm/ItemEditor.tsx` | 1367 |
| `src/components/gm/LootAwardModal.tsx` | 24 |
| `src/components/gm/SessionRollSimulator.tsx` | 12 |
| `src/components/gm/TalentDatabaseTab.tsx` | 23 |
| `src/components/gm/TokenImageLinks.tsx` | 6 |
| `src/components/gm/VehicleDetailPanel.tsx` | 15 |
| `src/components/gm/VehicleEditor.tsx` | 13 |
| `src/components/gm/VehicleLibrary.tsx` | 18 |
| `src/components/gm/VendorSellModal.tsx` | 18 |
| `src/components/map/MapCanvas.tsx` | 613 |
| `src/components/player-hud/HudTalentsTab.tsx` | 53 |

### `var(--font-rajdhani)` / `--font-rajdhani` — backward-compat CSS var

Resolves to `--font-body` (Palanquin) at runtime. These are not violations in themselves, but represent code that predates the token migration.

| File | Lines |
|---|---|
| `src/app/globals.css` | 222 |
| `src/app/create/page.tsx` | 132, 139, 145, 151, 158, 163, 178, 485, 492, 520, 535, 561, 601, 618, 628, 631, 660, 686, 716, 735, 736, 756, 782, 1012, 1022, 1030, 1033, 1048, 1051, 1061, 1062, 1084, 1117, 1210, 1231, 1238, 1252, 1253, 1256, 1274, 1277, 1298, 1385, 1387, 1390, 1404, 1416, 1423, 1428, 1443, 1445, 1467, 1558, 1562, 1575, 1594, 1611, 1616, 1621, 1640, 1643, 1677, 1694, 1702, 1714, 1717, 1726, 1730, 1775, 1818, 1874, 1887, 1908, 1917, 1918, 1928, 1932, 1982, 1983, 2007, 2008, 2051, 2052, 2086, 2087, 2097, 2101, 2159, 2168 |
| `src/components/character/BottomBar.tsx` | 22 |
| `src/components/character/Breadcrumb.tsx` | 17, 27 |
| `src/components/character/CenterHero.tsx` | 88, 102, 135, 185, 195, 227, 235 |
| `src/components/character/CharacterHud.tsx` | 149 |
| `src/components/character/CharacteristicsCard.tsx` | 66, 79, 89 |
| `src/components/character/CriticalInjuriesCard.tsx` | 31, 57, 77, 96 |
| `src/components/character/EquipmentCard.tsx` | 92, 120, 131, 147, 166, 170 |
| `src/components/character/ForceCheckButton.tsx` | 5 |
| `src/components/character/ForcePowersCard.tsx` | 30, 36, 57, 63 |
| `src/components/character/InventoryContent.tsx` | 15, 74, 80, 98, 102, 116, 119, 128, 141, 190, 235 |
| `src/components/character/MoralityCard.tsx` | 32, 76 |
| `src/components/character/ObligationDutyCard.tsx` | 32, 47, 73, 79, 98, 104 |
| `src/components/character/QualityBadge.tsx` | 27 |
| `src/components/character/Sidebar.tsx` | 41, 74 |
| `src/components/character/SkillsCard.tsx` | 75, 81, 125, 128, 136, 146, 156, 167, 175, 188, 191, 200, 208, 219, 227 |
| `src/components/character/TalentsCard.tsx` | 46, 56, 85 |
| `src/components/character/VitalsCard.tsx` | 67, 90, 94, 106, 110 |
| `src/components/character/WeaponsCard.tsx` | 92, 217, 218, 221, 222 |
| `src/components/gm/AdversaryDetailPanel.tsx` | 14 |
| `src/components/gm/AdversaryEditor.tsx` | 11 |
| `src/components/gm/AdversaryLibrary.tsx` | 17 |
| `src/components/gm/DestinyGeneratePanel.tsx` | 11 |
| `src/components/gm/ForceNotificationCard.tsx` | 6 |
| `src/components/gm/GmCharacterCard.tsx` | 8 |
| `src/components/gm/GmDiceRollerFAB.tsx` | 18 |
| `src/components/gm/GmLootModal.tsx` | 11 |
| `src/components/gm/GmMapView.tsx` | 22 |
| `src/components/gm/ItemEditor.tsx` | 31 |
| `src/components/gm/VehicleDetailPanel.tsx` | 14 |
| `src/components/gm/VehicleEditor.tsx` | 12 |
| `src/components/gm/VehicleLibrary.tsx` | 17 |
| `src/components/player-hud/HudTalentsTab.tsx` | 60, 96 |
| `src/components/player-hud/SkillsPanel.tsx` | 198 |
| `src/components/player-hud/VendorPurchaseDialog.tsx` | 153, 161, 164, 170, 189, 197, 249, 265, 270, 291, 305, 331, 338 |
| `src/components/ui/Badge.tsx` | 6 |
| `src/components/ui/VitalBar.tsx` | 55, 65 |
| `src/components/ui/sonner.tsx` | 13 |

### `'Share Tech Mono'` — hardcoded third font (banned by design rules)

| File | Line |
|---|---|
| `src/components/character/WeaponDamageDisplay.tsx` | 28 |
| `src/components/character/WeaponsCard.tsx` | 94 |
| `src/components/gm/AdversaryDetailPanel.tsx` | 16 |
| `src/components/gm/AdversaryLibrary.tsx` | 19, 635 |
| `src/components/gm/DestinyGeneratePanel.tsx` | 13 |
| `src/components/gm/ForceNotificationCard.tsx` | 8 |
| `src/components/gm/GmCharacterCard.tsx` | 196, 405, 413, 421, 425 |
| `src/components/gm/GmDiceRollerFAB.tsx` | 20 |
| `src/components/gm/GmMapView.tsx` | 807, 811, 817 |
| `src/components/gm/GmReferenceDrawer.tsx` | 40 |
| `src/components/gm/ItemDatabaseTab.tsx` | 22 |
| `src/components/gm/ItemEditor.tsx` | 30 |
| `src/components/gm/LootAwardModal.tsx` | 25 |
| `src/components/gm/SessionRollSimulator.tsx` | 13 |
| `src/components/gm/TalentDatabaseTab.tsx` | 24 |
| `src/components/gm/VehicleDetailPanel.tsx` | 16 |
| `src/components/gm/VehicleEditor.tsx` | 687, 691 |
| `src/components/gm/VehicleLibrary.tsx` | 19 |
| `src/components/gm/VendorSellModal.tsx` | 19 |
| `src/components/player-hud/ForcePanel.tsx` | 153 |
| `src/components/player-hud/HudTopBar.tsx` | 146 |
| `src/components/player-hud/HudVitalBar.tsx` | 14, 38 |
| `src/components/player-hud/InventoryPanel.tsx` | 156 |
| `src/components/player-hud/SkillsPanel.tsx` | 123, 197, 349 |
