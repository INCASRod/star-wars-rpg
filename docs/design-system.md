# Holocron — Design System Reference

> All values are live as of 2026-05-06. Single source of truth is `src/lib/tokens.ts` (TypeScript) and `src/app/globals.css` (CSS custom properties). These two files must stay in sync.

---

## Fonts

Two UI fonts plus one icon font. No others may be added.

| Font | CSS variable | TS constant | Use |
|---|---|---|---|
| **Orbitron** | `var(--font-display)` | `FONT_DISPLAY` | Logos, stat numerics, display headings |
| **Exo 2** | `var(--font-body)` | `FONT_BODY` | All other UI text — labels, body, HUD, buttons |
| **sw-rpg-icons** | `var(--font-sw-rpg-icons)` | `FONT_ICONS` | Star Wars RPG dice/result symbol icon font only |

`FONT` is an alias for `FONT_BODY` — exists for backward compatibility so existing component refs don't break.

**In TypeScript:**
```ts
import { FONT_DISPLAY, FONT_BODY, FONT, FONT_ICONS } from '@/lib/tokens'
```

**In CSS:**
```css
font-family: var(--font-display), 'Orbitron', monospace;  /* headings, stats */
font-family: var(--font-body), 'Exo 2', sans-serif;       /* everything else */
```

**Loading** (`layout.tsx`): Both loaded via `next/font/google`. CSS variable classes applied to `<html>` so they're accessible from `:root` aliases in `globals.css`.

**Global body default** (`globals.css`):
```css
body { font-family: var(--font-body), 'Exo 2', sans-serif; }
```

**Legacy aliases** (`globals.css`) — created for backward compat with components referencing the old Rajdhani vars. Resolve to the new fonts automatically. Do not use in new code:

| CSS var | Resolves to | Font |
|---|---|---|
| `--font-rajdhani` | `var(--font-body)` | Exo 2 |
| `--font-cinzel` | `var(--font-display)` | Orbitron |
| `--font-orbitron` | `var(--font-display)` | Orbitron |
| `--font-mono` | `var(--font-body)` | Exo 2 |

---

## Typography Scale

**Source:** `globals.css:74–89` (CSS vars) · `tokens.ts:25–37` (TS constants)

Root font-size is fluid (`globals.css:14`):
```css
html { font-size: clamp(14px, 1vw + 0.5rem, 18px); }
```
All `rem` values scale proportionally across viewports. Never override with a fixed value.

### Type scale

| Token (TS) | CSS variable | `clamp()` range | Typical use |
|---|---|---|---|
| `FS.display` | `--text-display` | 36 → 80px | Hero / splash text |
| `FS.h1` | `--text-h1` | 28 → 56px | Page titles |
| `FS.h2` | `--text-h2` | 22 → 40px | Section headings |
| `FS.h3` | `--text-h3` | 18 → 28px | Panel titles |
| `FS.h4` | `--text-h4` | 16 → 22px | Sub-section / card titles |
| `FS.bodyLg` | `--text-body-lg` | 16 → 20px | Lead / intro body |
| `FS.body` | `--text-body` | 15 → 18px | Standard body text |
| `FS.sm` | `--text-body-sm` / `--text-sm` | 12 → 14px | Small body / captions |
| `FS.label` | `--text-label` | 11 → 13px | Form labels, stat labels |
| `FS.caption` | `--text-caption` / `--text-xs` | 10 → 12px | Timestamps, metadata |
| `FS.overline` | `--text-overline` | 9 → 11px | ALL CAPS eyebrow labels |
| *(no TS alias)* | `--text-hero` | ~22 → 32px | Dashboard feature values |

**Alias shortcuts** (in CSS, for convenience):
- `--text-sm` → `--text-body-sm`
- `--text-xs` → `--text-caption`

### Typography rules (applied in `globals.css:334–368`)

| Element | Font size | Line height | Letter spacing | Weight |
|---|---|---|---|---|
| `h1` | `--text-h1` | 1.1 | −0.03em | 600 |
| `h2` | `--text-h2` | 1.2 | −0.02em | 600 |
| `h3` | `--text-h3` | 1.3 | −0.01em | 600 |
| `h4` | `--text-h4` | 1.4 | 0em | 500 |
| `p` | `--text-body` | 1.65 | — | — |
| `label`, `caption`, `.text-secondary` | `--text-label` | 1.35 | — | — |
| `.eyebrow` | `--text-label` | 1.15 | 0.2em (widest) | 600 |

### Font weights (`globals.css:143–146`)

| CSS var | Value |
|---|---|
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-bold` | 600 |

### Line heights (`globals.css:103–108`)

| CSS var | Value |
|---|---|
| `--leading-none` | 1 |
| `--leading-tight` | 1.15 |
| `--leading-snug` | 1.35 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.65 |
| `--leading-loose` | 1.8 |

### Letter spacing (`globals.css:111–118`)

| CSS var | Value |
|---|---|
| `--tracking-tighter` | −0.05em |
| `--tracking-tight` | −0.025em |
| `--tracking-snug` | −0.015em |
| `--tracking-normal` | 0em |
| `--tracking-wide` | 0.05em |
| `--tracking-wider` | 0.1em |
| `--tracking-widest` | 0.2em |

### Measure (line length) (`globals.css:120–124`)

| CSS var | Value | Use |
|---|---|---|
| `--measure-narrow` | 45ch | Short labels |
| `--measure-body` | 68ch | Body paragraphs |
| `--measure-wide` | 80ch | Wide columns |
| `--measure-prose` | 72ch | Long-form text |

---

## Color System

### Two themes

The app uses two visual themes side-by-side. Every component belongs to one.

| Theme | Surfaces | Token namespace | CSS prefix |
|---|---|---|---|
| **Light / parchment** | Character sheet, GM page chrome, `/create`, landing page | `COLOR` | `--` |
| **HUD dark terminal** | Player HUD, Combat Panel, token map, combat tracker | `HUD` | `--hud-` |

---

### Light theme — `COLOR` (`tokens.ts:102–133` · `globals.css:27–58`)

**Backgrounds**

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.parch` | `--parch` | `#FAF7F2` | Page background (lightest) |
| `COLOR.sand` | `--sand` | `#F2EDE4` | Default `body` background |
| `COLOR.sandWarm` | `--sand-warm` | `#E8E0D2` | Slightly warmer sand for alternating rows |
| `COLOR.white` | `--white` | `#FFFFFF` | Card / panel fills |

**Text**

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.ink` | `--ink` | `#1A1A1C` | Highest contrast — headlines |
| `COLOR.txt` | `--txt` | `#2C2C2E` | Default body text |
| `COLOR.txt2` | `--txt2` | `#6B6B6B` | Secondary / muted text |
| `COLOR.txt3` | `--txt3` | `#A0A0A0` | Disabled / placeholder |

**Borders**

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.bdr` | `--bdr` | `#D8D0C4` | Standard dividers |
| `COLOR.bdrL` | `--bdr-l` | `#E8E2D8` | Light / subtle dividers |

**Brand — Gold**

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.gold` | `--gold` | `#C8A24E` | Primary brand accent, focus ring |
| `COLOR.goldL` | `--gold-l` | `#DCBE6E` | Hover / lighter gold |
| `COLOR.goldD` | `--gold-d` | `#8E6E2A` | Active / pressed state |
| `COLOR.goldGlow` | `--gold-glow` | `rgba(200,162,78,.22)` | Subtle card hover glow |
| `COLOR.goldGlowS` | `--gold-glow-s` | `rgba(200,162,78,.45)` | Stronger glow (selected, focused) |

**Semantic**

| Token | CSS var | Hex | Light variant | Pale background |
|---|---|---|---|---|
| `COLOR.blue` | `--blue` | `#2B5DAE` | `--blue-l` `#5B8FE0` | `--blue-pale` `#DCE8F8` |
| `COLOR.red` | `--red` | `#B83A2A` | `--red-l` `#E05842` | `--red-pale` `#F8DAD4` |
| `COLOR.amber` | `--amber` | `#C47F17` | — | `--amber-pale` `#F5E6C8` |
| `COLOR.green` | `--green` | `#2D8F4E` | — | `--green-pale` `#D0F0DB` |

---

### HUD dark terminal theme — `HUD` (`tokens.ts:138–148` · `globals.css:185–192`)

| Token | CSS var | Value | Use |
|---|---|---|---|
| `HUD.bg` | `--hud-bg` | `#060D09` | Root background — near-black forest |
| `HUD.panel` | `--hud-panel` | `rgba(8,16,10,0.82)` | Panel fill with transparency (enables blur) |
| `HUD.border` | `--hud-border` | `rgba(200,170,80,0.14)` | Default panel border — barely-there gold |
| `HUD.borderHi` | `--hud-border-hi` | `rgba(200,170,80,0.32)` | Highlighted border (hover, active) |
| `HUD.text` | `--hud-text` | `#C8D8C0` | Primary HUD text — pale phosphor green |
| `HUD.textDim` | `--hud-text-dim` | `#6A8070` | Secondary / muted HUD text |
| `HUD.textFaint` | `--hud-text-faint` | `#2A3A2E` | Near-invisible — dividers rendered as text |
| `HUD.gold` | `--hud-gold` | `#C8AA50` | HUD gold accent — warmer than light-theme gold |

**HUD font size aliases** (`globals.css:195–201`) — use instead of hardcoded px in HUD inline styles:

| CSS var | Resolves to | Range |
|---|---|---|
| `--hud-sz-overline` | `--text-overline` | 9–11px |
| `--hud-sz-caption` | `--text-caption` | 10–12px |
| `--hud-sz-label` | `--text-label` | 11–13px |
| `--hud-sz-sm` | `--text-body-sm` | 12–14px |
| `--hud-sz-h4` | `--text-h4` | 16–22px |
| `--hud-sz-h3` | `--text-h3` | 18–28px |

---

### Characteristic colors — `CHAR_COLOR` (`tokens.ts:153–160`)

Hardcoded hex — used in canvas/SVG/icon tinting where CSS vars cannot resolve.

| Token | Hex | Characteristic |
|---|---|---|
| `CHAR_COLOR.brawn` | `#E07855` | Brawn |
| `CHAR_COLOR.agility` | `#4EC87A` | Agility |
| `CHAR_COLOR.intellect` | `#5AAAE0` | Intellect |
| `CHAR_COLOR.cunning` | `#D4B840` | Cunning |
| `CHAR_COLOR.willpower` | `#B070D8` | Willpower |
| `CHAR_COLOR.presence` | `#D87060` | Presence |

---

### Dice pool colors — `DICE_COLOR` (`tokens.ts:177–184`)

Hardcoded hex — used in canvas/SVG rendering where CSS vars cannot resolve.

| Token | Hex | Die type |
|---|---|---|
| `DICE_COLOR.proficiency` | `#F5C518` | Yellow 12-sided |
| `DICE_COLOR.ability` | `#4CAF50` | Green 8-sided |
| `DICE_COLOR.boost` | `#29B6F6` | Light blue 6-sided |
| `DICE_COLOR.challenge` | `#C62828` | Red 12-sided |
| `DICE_COLOR.difficulty` | `#7B1FA2` | Purple 8-sided |
| `DICE_COLOR.setback` | `#455A64` | Black 6-sided |
| `DICE_COLOR.force` | `#FFFFFF` | White 12-sided |

**Die shapes** (from `DICE_META`, `tokens.ts:195–203`):

| Die | Shape |
|---|---|
| Proficiency, Challenge, Force | `octagon` |
| Ability, Difficulty | `diamond` |
| Boost, Setback | `rounded` |

---

### Die chip CSS classes — `globals.css:673–700`

Die and result symbols rendered inline in talent/force-power text use `.die` chips. Colors are separate CSS vars from `DICE_COLOR` (slightly adjusted for readability on light backgrounds):

| Class | CSS var | Hex | Meaning |
|---|---|---|---|
| `.die.boost` | `--die-boost` | `#70C8E8` | Boost die |
| `.die.setback` | `--die-setback` | `#A0A0A0` | Setback die |
| `.die.difficulty` | `--die-difficulty` | `#B070D8` | Difficulty die |
| `.die.challenge` | `--die-challenge` | `#E05050` | Challenge die |
| `.die.force` | `--die-force` | `#5AAAE0` | Force die |
| `.die.success` | `--die-success` | `#4EC87A` | Success result |
| `.die.advantage` | `--die-advantage` | `#4EC8C8` | Advantage result |
| `.die.threat` | `--die-threat` | `#E07855` | Threat result |
| `.die.triumph` | `--die-triumph` | `#FFD700` | Triumph result |
| `.die.despair` | `--die-despair` | `#C04040` | Despair result |
| `.die.forcepip` | `--die-forcepip` | `#E8E8FF` | Force pip |

Each `.die.*` chip applies: 12% tinted background, 35% tinted 1px border, colored text, `3px` border-radius, `0.8em` font size.

---

### Result symbol colors — `SYM_COLOR` (`tokens.ts:211–220`)

Used when rendering result symbols in JS (not via CSS classes):

| Token | Hex | Symbol |
|---|---|---|
| `SYM_COLOR.success` | `#4EC87A` | Success |
| `SYM_COLOR.failure` | `#E05050` | Failure |
| `SYM_COLOR.advantage` | `#70C8E8` | Advantage |
| `SYM_COLOR.threat` | `#B060D0` | Threat |
| `SYM_COLOR.triumph` | `#D4B840` | Triumph |
| `SYM_COLOR.despair` | `#FF6060` | Despair |
| `SYM_COLOR.lightPip` | `#FFFFFF` | Light Force pip |
| `SYM_COLOR.darkPip` | `#9966CC` | Dark Force pip |
| `SYM_COLOR.forcePip` | `#C8D8C0` | Force pip (HUD) |

**Symbol metadata** (`SYM`, `tokens.ts:231–238`) — maps `'S' | 'F' | 'A' | 'H' | 'T' | 'D'` to `{ icon, color, label }`.

---

### Asset / stow location colors — `ASSET_COLOR` (`tokens.ts:241–249`)

Used to color-code group asset type badges (`StowPill`):

| Token | Hex | Asset type |
|---|---|---|
| `ASSET_COLOR.vehicle` | `#4EC87A` | Vehicle |
| `ASSET_COLOR.starship` | `#40C4D4` | Starship |
| `ASSET_COLOR.safe_house` | `#D4A84B` | Safe house |
| `ASSET_COLOR.base_of_operations` | `#9B59B6` | Base of operations |
| `ASSET_COLOR.strategic_asset` | `#5AAAE0` | Strategic asset |
| `ASSET_COLOR.npc` | `#A0A0A0` | NPC |
| `ASSET_COLOR.other` | `#6A8070` | Other |

---

### Rarity color function — `rarityColor(r)` (`tokens.ts`)

| Rarity | Color token | Label |
|---|---|---|
| 1–2 | `COLOR.txt3` (`#A0A0A0`) | Common |
| 3–4 | `COLOR.green` (`#2D8F4E`) | Uncommon |
| 5–6 | `COLOR.blue` (`#2B5DAE`) | Rare |
| 7–8 | `#7B3FA0` (hardcoded — no CSS var) | Epic |
| 9+ | `COLOR.gold` | Legendary |

---

### Binary Sunset palette — `COLOR.bs*` (`tokens.ts` · `globals.css`)

The Binary Sunset palette is the target light theme for the app — warm Tatooine parchment with a single red-sun accent family replacing gold. It is **additive** to the existing `COLOR` object. Components are migrated to it progressively; existing `COLOR.*` tokens remain valid.

**Backgrounds** (warm sand → terracotta scale)

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.bsSky` | `--bs-sky` | `#E8DDD0` | Page background |
| `COLOR.bsPanel` | `--bs-panel` | `#DDD0C0` | Sidebar, topbar surfaces |
| `COLOR.bsSurface` | `--bs-surface` | `#D4C5B0` | Section headers, inputs |
| `COLOR.bsCard` | `--bs-card` | `#CBBAA0` | Cards, alternate rows |
| `COLOR.bsCardHi` | `--bs-card-hi` | `#C0AD94` | Hovered card, active row |

**Red-sun accent ramp** (sole accent family — replaces gold in light theme)

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.bsRedPale` | `--bs-red-pale` | `#E86050` | Soft highlights, career markers |
| `COLOR.bsRedSun` | `--bs-red-sun` | `#E03A1E` | Primary: active tab, buttons |
| `COLOR.bsRedHi` | `--bs-red-hi` | `#C82A10` | Primary hover |
| `COLOR.bsRedMid` | `--bs-red-mid` | `#A82010` | Secondary accent, trained skills |
| `COLOR.bsRedDim` | `--bs-red-dim` | `#7A1808` | Deep accent, strain, Force |
| `COLOR.bsRedMute` | `--bs-red-mute` | `#3A0C04` | Near-black shadows |

**Text** (warm brown scale)

| Token | CSS var | Hex | Use |
|---|---|---|---|
| `COLOR.bsInk` | `--bs-ink` | `#2A1008` | Headings, high-contrast |
| `COLOR.bsTxt` | `--bs-txt` | `#5A2818` | Body text |
| `COLOR.bsTxt2` | `--bs-txt2` | `#8A5040` | Muted / supporting |
| `COLOR.bsTxt3` | `--bs-txt3` | `#AA7860` | Faint / placeholder |
| `COLOR.bsOnRed` | `--bs-on-red` | `#FFF0E8` | Text on red backgrounds |

**Borders**

| Token | CSS var | Hex |
|---|---|---|
| `COLOR.bsBdrStrong` | `--bs-bdr-strong` | `#B09080` |
| `COLOR.bsBdrMid` | `--bs-bdr-mid` | `#C0A890` |
| `COLOR.bsBdrSubtle` | `--bs-bdr-subtle` | `#CDB8A4` |

**Semantic aliases** (CSS only — no TS token, reference via `var()` in CSS):

| CSS var | Resolves to | Meaning |
|---|---|---|
| `--bs-wounds` | `--bs-red-sun` | Wound threshold colour |
| `--bs-strain` | `--bs-red-dim` | Strain threshold colour |
| `--bs-career` | `--bs-red-pale` | Career skill marker |
| `--bs-success-txt` | `#5A7A3A` | Success/positive text |
| `--bs-corner` | `--bs-red-mid` | Corner accent |

**Shell layout constants** (CSS only — fixed `px`, structural not spacing):

| CSS var | Value | Use |
|---|---|---|
| `--bs-topbar-h` | `48px` | Top navigation bar height |
| `--bs-modebar-h` | `36px` | Mode switcher bar height |
| `--bs-shell-offset` | `84px` | Combined offset for sticky panel positioning |

All `--bs-*` vars are also in the `@theme inline` block as `--color-bs-*`, making them usable with Tailwind arbitrary values (`bg-[color:var(--bs-red-sun)]`).

---

## Spacing

**Source:** `tokens.ts:41–52` · `globals.css:126–140`

All spacing is fluid via `clamp()`. Use these for every `margin`, `padding`, and `gap`.

| Token (TS) | CSS var | Range | Notes |
|---|---|---|---|
| `SP[1]` | `--space-1` | 4 → 8px | Micro gaps, tight padding |
| `SP[2]` | `--space-2` | 8 → 16px | Icon gaps, small insets |
| `SP[3]` | `--space-3` | 12 → 24px | Compact section spacing |
| `SP[4]` | `--space-4` | 16 → 32px | Default component padding |
| `SP[5]` | `--space-5` | 20px fixed | — |
| `SP[6]` | `--space-6` | 24 → 48px | Panel internal padding |
| `SP[8]` | `--space-8` | 32 → 64px | Section separation |
| `SP[10]` | `--space-10` | 40px fixed | — |
| `SP[12]` | `--space-12` | 48 → 96px | Major layout gaps |
| `SP[16]` | `--space-16` | 64 → 160px | Hero/display spacing |

Additional CSS-only spacing (no TS alias): `--space-20` (5rem), `--space-24` (96–224px), `--space-32` (8rem), `--space-48` (12rem), `--space-64` (16rem).

**Legacy aliases** (CSS only, exist for backward compat):
`--sp-xs` → `--space-1`, `--sp-sm` → `--space-2`, `--sp-md` → `--space-4`, `--sp-lg` → `--space-5`, `--sp-xl` → `--space-6`

---

## Border Radius

**Source:** `tokens.ts:56–62`

| Token | Value | Use |
|---|---|---|
| `RADIUS.sm` | `2px` | Badges, chips, tiny pill corners |
| `RADIUS.md` | `4px` | Inputs, buttons, row highlights |
| `RADIUS.lg` | `8px` | Cards, panels, modals |
| `RADIUS.xl` | `12px` | Large panels, sheets |
| `RADIUS.full` | `'50%'` | Circular: avatars, pips, dot indicators |

Note: shadcn components use a separate `--radius: 0.625rem` token (`globals.css:204`) via its own scale (`--radius-sm` through `--radius-full`). Do not mix with `RADIUS.*`.

---

## Z-Index Scale

**Source:** `tokens.ts:66–77`

| Token | Value | Use |
|---|---|---|
| `Z.base` | 0 | Normal document flow |
| `Z.raised` | 1 | Slightly elevated (hover cards, active rows) |
| `Z.sticky` | 10 | Sticky headers, breadcrumbs |
| `Z.dropdown` | 20 | Dropdowns, popovers |
| `Z.overlay` | 100 | Non-blocking overlays |
| `Z.backdrop` | 400 | Modal backdrops |
| `Z.modal` | 410 | Modal panels (above backdrop) |
| `Z.fab` | 500 | Floating action buttons |
| `Z.toast` | 800 | Toast notifications |
| `Z.tooltip` | 9999 | Tooltips (always on top) |

---

## Shadows

**Source:** `tokens.ts:80–84` · `globals.css:148–150`

| Token | CSS var | Value | Use |
|---|---|---|---|
| `SHADOW.sm` | `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle lift (cards, chips) |
| `SHADOW.md` | `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Medium elevation (panels) |
| `SHADOW.lg` | `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | High elevation (drawers, dropdowns) |

**Modal shadow** (`MODAL.shadow`, `tokens.ts:91`): `0 16px 48px rgba(0,0,0,0.64)` — deeper, no glow.

---

## Transitions

**Source:** `tokens.ts:94–97` · `globals.css:152–154`

| Token | CSS var | Value | Use |
|---|---|---|---|
| `EASE.default` | `--ease-default` | `200ms ease` | Standard state changes (hover, focus) |
| `EASE.spring` | `--ease-spring` | `300ms cubic-bezier(0.34,1.56,0.64,1)` | Bouncy entrances (modals, popovers) |

---

## Containers

**Source:** `globals.css:156–161`

| CSS var | Value | Use |
|---|---|---|
| `--container-sm` | 40rem | Narrow modals, forms |
| `--container-md` | 56rem | Medium modals |
| `--container-lg` | 75rem | Standard page width |
| `--container-xl` | 90rem | Wide page width |
| `--container-full` | 100% | Full-bleed |

**Utility classes** (`globals.css:380–407`):
- `.container` — `min(100% - 2rem, 1280px)`, centered
- `.container-wide` — `min(100% - 2rem, 1536px)`
- `.container-prose` — `min(100% - 2rem, 720px)`
- `.grid-auto` — `repeat(auto-fit, minmax(280px, 1fr))` with `--space-4` gap
- `.grid-12` — 12-column grid with `--space-4` gap

---

## Component Patterns

### `.hud-card` — light theme interactive card (`globals.css:467–490`)

Used on the character sheet and GM page for stat blocks and panel cards.

```css
background:     rgba(255,255,255,.72);
backdrop-filter: blur(8px);
border:         1px solid var(--bdr-l);
padding:        var(--space-4);
transition:     .25s;
box-shadow:     0 1px 4px rgba(0,0,0,.04);
```

On `:hover`: border becomes `--gold-l`, box-shadow becomes `0 2px 16px var(--gold-glow)`, and a `0.2rem` gold left-border accent fades in via `::before`.

---

### `.card-hdr` — card section header (`globals.css:492–509`)

All-caps overline label with auto-extending right divider line.

```css
font-size:      var(--text-caption);
font-weight:    700;
letter-spacing: var(--tracking-widest);
color:          var(--txt3);
text-transform: uppercase;
```

The `::after` pseudo-element is a 1px `var(--bdr-l)` line that fills remaining width.

---

### `.eyebrow` — overline label class (`globals.css:369–375`)

```css
font-size:      var(--text-label);
letter-spacing: var(--tracking-widest);
text-transform: uppercase;
font-weight:    600;
```

---

### `panelBase` — HUD panel style spread (`tokens.ts:273–280`)

The **only** permitted `style={{ }}` spread in components. For dark terminal panels that require `backdrop-filter`.

```ts
export const panelBase: React.CSSProperties = {
  background:           HUD.panel,           // rgba(8,16,10,0.82)
  backdropFilter:       'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border:               `1px solid ${HUD.border}`,
  borderRadius:         RADIUS.lg,           // 8
  position:             'relative',
}
```

In new code prefer the CSS class `.hud-panel` (`globals.css:599–606`) which does the same thing:
```css
.hud-panel {
  background:       var(--hud-panel);
  backdrop-filter:  blur(12px);
  border:           1px solid var(--hud-border);
  border-radius:    8px;
}
.hud-panel--hi { border-color: var(--hud-border-hi); }
```

---

### `.modal-backdrop` — modal overlay (`globals.css:577–592`)

Replaces hand-rolled `position:fixed` backdrop patterns.

```css
position: fixed; inset: 0; z-index: 400;
background:      rgba(0,0,0,0.72);
backdrop-filter: blur(8px);
display: flex; align-items: center; justify-content: center;
```

Modifier `.modal-backdrop--light`: `rgba(0,0,0,0.45)`, `blur(4px)` — for less-obstructive overlays.

`MODAL` constants (`tokens.ts:88–91`):
- `MODAL.backdrop`: `rgba(0,0,0,0.78)` — JS usage
- `MODAL.shadow`: `0 16px 48px rgba(0,0,0,0.64)` — modal panel depth shadow

---

### Hover utilities (`globals.css:516–552`)

Replace all `onMouseEnter`/`onMouseLeave` JS handlers:

| Class | Effect |
|---|---|
| `.hov-gold-bg` | Background fades to `rgba(200,162,78,.06)` on hover |
| `.hov-red-bg` | Red-tinted background, deepens on hover |
| `.hov-gold-text` | Text color transitions to `--hud-gold` |
| `.hov-gold-border` | Border transitions to `--hud-border-hi` |
| `.hov-gold` | **Combined** text + border gold — most common HUD interactive pattern |

---

### Interactive states (`globals.css:557–569`)

Focus ring (global):
```css
:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
```

Disabled state (global):
```css
button:disabled, input:disabled, [aria-disabled="true"] {
  opacity: 0.4; cursor: not-allowed; pointer-events: none;
}
```

---

## Animation

**Source:** `globals.css:411–461`

### Keyframes

| Name | Effect | Use |
|---|---|---|
| `slideL` | Fade in from left | Panel entrance, left-side elements |
| `slideR` | Fade in from right | Right-side entrances |
| `slideU` | Fade in from below | Bottom-up reveals |
| `heroIn` | Scale 0.96→1 + brightness shimmer | Hero image entrance |
| `glowPulse` | Opacity 0.5↔0.9 loop | Ambient glow on active elements |
| `hudTabIn` | Fade + 5px upward nudge | HUD tab panel switching |
| `tooltipIn` | Fade + 4px nudge | Tooltip appearance |
| `combatWipe` | Clip-path vertical wipe in/out | Combat mode transition |
| `combatFlash` | Opacity flash 0→1→0 | Hit / damage flash |

### Utility classes

| Class | Animation |
|---|---|
| `.al` | `slideL 0.5s ease forwards` |
| `.ar` | `slideR 0.5s ease forwards` |
| `.au` | `slideU 0.5s ease forwards` |

**Stagger delay classes** (used with `.al`/`.ar`/`.au`):
`.d1` through `.d7` → `animation-delay: 0.1s` through `0.7s`, initial `opacity: 0`.

---

## Icon Font — sw-rpg-icons

**Source:** `globals.css:651–699`

Used exclusively for Star Wars RPG dice and result symbols. Rendered via `<i class="ffi ffi-*">`.

```css
i.ffi {
  font-family: var(--font-sw-rpg-icons) !important;
  font-style: normal;
  line-height: 1;
}
```

### Symbol classes and unicode codepoints

| Class | Codepoint | Symbol |
|---|---|---|
| `.ffi-swrpg-advantage` | `\e900` | Advantage |
| `.ffi-swrpg-despair` | `\e904` | Despair |
| `.ffi-swrpg-failure` | `\e905` | Failure |
| `.ffi-swrpg-force` | `\e908` | Force |
| `.ffi-swrpg-success` | `\e90b` | Success |
| `.ffi-swrpg-threat` | `\e90d` | Threat |
| `.ffi-swrpg-triumph` | `\e90f` | Triumph |

In TypeScript, icons are referenced by name in `SYM` (`tokens.ts:231–238`) — e.g. `SYM.S.icon === 'swrpg-success'`.

---

## Responsive Design Rules

**Source:** `design-rules.md` · `globals.css:9–16`

The app targets all desktop viewports simultaneously (13" → 4K). The `clamp()` system handles transitions automatically — explicit `@media` queries are rarely needed for font or spacing.

### Breakpoints

| Name | Range | Device |
|---|---|---|
| `xs` | 320–479px | Small phones |
| `sm` | 480–767px | Large phones |
| `md` | 768–1023px | Tablets |
| `lg` | 1024–1279px | Small laptops |
| `xl` | 1280–1535px | Standard desktops / 15" monitors |
| `2xl` | 1536px+ | 2K, 4K, ultrawide |

### Layout philosophy

The app is a **desktop tool**, not a website. Panels fill the viewport:
- Sidebars: `clamp(240px, 20vw, 400px)` — never fixed `280px`
- Main content: `flex: 1; min-width: 0` — fills remaining space
- Never use `max-width: 1280px` on a full-screen app shell

---

## shadcn/Radix Tokens

**Source:** `globals.css:203–236` (light) · `globals.css:614–646` (dark)

shadcn components (`Dialog`, `Popover`, `Select`, etc.) use their own `--background`, `--foreground`, `--primary`, `--border`, `--ring`, etc. tokens in `oklch()` color space. These are separate from the Holocron design system and must not be mixed with `COLOR.*` or `HUD.*` tokens.

The shadcn `--radius: 0.625rem` token is also distinct from `RADIUS.*`.

---

## Enforcement Rules

These rules are defined in `CLAUDE.md` and apply to all new and modified code without exception.

1. **Single source of truth** — All design tokens live in `src/lib/tokens.ts`. Never define a color, size, or spacing value in a component file.

2. **No inline styles** — `style={{ }}` objects are banned in components except for `panelBase` spread. Use Tailwind utilities, CSS custom properties, or `globals.css` classes.

3. **Two fonts only** — Orbitron (`FONT_DISPLAY`) for logos, stat numerics, display headings. Exo 2 (`FONT_BODY`) for all other UI text. `sw-rpg-icons` (`FONT_ICONS`) for dice symbols only. No other fonts may be added. `FONT` is an alias for `FONT_BODY` and exists for backward compatibility only.

4. **No JS hover handlers** — Use `.hov-*` CSS classes or `globals.css` rules instead of `onMouseEnter`/`onMouseLeave` mutating `e.currentTarget.style.*`.

5. **Z-index** — Always `Z.*` from tokens. Never a hardcoded number.

6. **Border radius** — Always `RADIUS.*` from tokens. Never `borderRadius: 4`.

7. **Backward-compat shims** — `src/lib/styles.ts`, `src/components/player-hud/design-tokens.ts`, `src/components/wireframe/wf-tokens.ts` re-export from `tokens.ts`. New code imports directly from `@/lib/tokens`.

---

## Import Reference

```ts
import {
  // Fonts
  FONT_DISPLAY, FONT_BODY, FONT, FONT_ICONS,
  // Typography
  FS,
  // Spacing
  SP,
  // Structure
  RADIUS, Z, SHADOW, EASE, MODAL,
  // Colors (light theme)
  COLOR,
  // Colors (HUD dark theme)
  HUD,
  // Colors (hardcoded — JS/canvas only)
  CHAR_COLOR, DICE_COLOR, SYM_COLOR, ASSET_COLOR,
  // Dice system
  DICE_META, EMPTY_POOL,
  // Result symbols
  SYM,
  // Rarity
  rarityColor, rarityLabel,
  // HUD panel style spread (only permitted style object)
  panelBase,
  // Type aliases
  type CharKey, type DiceType, type SymbolKey, type DiceMeta, type SymbolMeta,
} from '@/lib/tokens'
```
