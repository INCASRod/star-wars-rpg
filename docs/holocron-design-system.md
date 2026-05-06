# Holocron Design System
## Light UI — Binary Sunset Palette · v1.0

This document is the single source of truth for all design decisions in Holocron.
CC must import or replicate these tokens in `src/styles/design-tokens.css` (or equivalent globals file).
**Never hardcode a hex value, pixel size, or spacing value directly in a component.**

---

## 1. Colour Tokens

All colour values live as CSS custom properties on `:root`. Reference them by token name only.

### Background Scale
The background scale moves from lightest (sky) to darkest (card-hi). Use them in order — never skip a step for adjacent surfaces.

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-sky` | `#E8DDD0` | Page / outermost background |
| `--color-bg-panel` | `#DDD0C0` | Sidebar, right panel, topbar |
| `--color-bg-surface` | `#D4C5B0` | Section headers, input fields, mode bar |
| `--color-bg-card` | `#CBBAA0` | Cards, alternate rows |
| `--color-bg-card-hi` | `#C0AD94` | Hovered card, active row |

### Red Accent Ramp
All UI accent comes from this single ramp. There is no secondary accent colour.

| Token | Hex | Usage |
|---|---|---|
| `--color-red-pale` | `#E86050` | Soft highlights, tertiary accents, soak vital border |
| `--color-red-sun` | `#E03A1E` | **Primary accent** — logo, active tab, primary buttons, filled skill dots |
| `--color-red-hi` | `#C82A10` | Primary accent hover state |
| `--color-red-mid` | `#A82010` | Secondary accent — trained skills, career markers |
| `--color-red-dim` | `#7A1808` | Deep accent — strain indicator, Force check button |
| `--color-red-mute` | `#3A0C04` | Near-black — shadows, deepest text, portrait silhouettes |

### Text Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#2A1008` | Headings, high-contrast labels, trained skill names |
| `--color-text-secondary` | `#5A2818` | Body text, roll entry names |
| `--color-text-muted` | `#8A5040` | Supporting labels, untrained skill names, disabled |
| `--color-text-faint` | `#AA7860` | Placeholders, timestamps, wash roll results |
| `--color-text-on-red` | `#FFF0E8` | Any text placed on a red background |

### Border Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-border-strong` | `#B09080` | Primary panel borders, topbar border, dividers |
| `--color-border-mid` | `#C0A890` | Card borders, inner separators |
| `--color-border-subtle` | `#CDB8A4` | Row separators, very light dividers |

### Semantic Aliases
```css
--color-wounds:  var(--color-red-sun);
--color-strain:  var(--color-red-dim);
--color-career:  var(--color-red-pale);
--color-success: #5A7A3A;   /* roll result: success green */
--color-wash:    var(--color-text-faint);
--corner-color:  var(--color-red-mid);
```

---

## 2. Typography

### Font Families
```css
--font-display: 'Orbitron', monospace;       /* logo, stat values, section headers */
--font-body:    'Exo 2', sans-serif;          /* all body text, labels, skill names */
--font-mono:    'Share Tech Mono', monospace; /* badges, timestamps, tab labels, readouts */
```

**Rules:**
- `--font-display` is reserved for the wordmark, characteristic numbers, and vital card values only. Do not use it for body text.
- `--font-body` is the default for all other text.
- `--font-mono` is used for all uppercase tracking labels, badge text, and monospaced readouts.

### Type Scale
All font sizes use `clamp(MIN, VW, MAX)`. Never write a hardcoded `px` font size in a component.

```css
/* UI labels and body */
--text-2xs:   clamp(9px,  0.55vw, 11px);   /* micro labels: WOUNDS, SOAK, M.DEF */
--text-xs:    clamp(10px, 0.65vw, 12px);   /* timestamps, legend items, tab labels */
--text-sm:    clamp(11px, 0.75vw, 13px);   /* badges, roll result meta */
--text-base:  clamp(12px, 0.85vw, 14px);   /* skill names, body text */
--text-md:    clamp(13px, 0.95vw, 15px);   /* character name in topbar */
--text-lg:    clamp(14px, 1.05vw, 17px);   /* section subheadings */
--text-xl:    clamp(16px, 1.25vw, 20px);   /* panel headings, action button labels */
--text-2xl:   clamp(20px, 1.6vw,  26px);   /* page-level headings */
--text-3xl:   clamp(26px, 2.2vw,  34px);   /* hero headings */

/* Logo */
--text-logo:  clamp(11px, 0.85vw, 14px);   /* HOLOCRON wordmark */

/* Numeric / stat display */
--text-stat-sm:  clamp(14px, 1.1vw, 18px);  /* characteristic badge (2 BRN) */
--text-stat-md:  clamp(20px, 1.6vw, 26px);  /* vital card values (12, 14, 3) */
--text-stat-lg:  clamp(28px, 2.2vw, 36px);  /* prominent KPIs */
```

### Line Heights
```css
--leading-tight:   1.1;   /* stat numbers, single-line display text */
--leading-snug:    1.25;  /* card titles */
--leading-normal:  1.5;   /* body text */
--leading-loose:   1.75;  /* long-form content */
```

### Letter Spacing
```css
--tracking-tight:   -0.02em;
--tracking-normal:  0;
--tracking-wide:    0.05em;
--tracking-wider:   0.1em;
--tracking-widest:  0.2em;  /* ALL CAPS labels — always pair with font-mono */
```

**Rules:**
- ALL CAPS labels always use `--font-mono` + `--tracking-widest` + `font-weight: 600`.
- Stat values (`--font-display`) always use `--leading-tight`.
- Never use `--tracking-widest` with `--font-body`.

---

## 3. Spacing

All spacing is derived from a 4px base grid. Every dimension used in padding, margin, or gap must be divisible by 4.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Semantic Spacing Aliases
```css
--padding-row:      var(--space-1) var(--space-2);   /* dense table/skill rows: 4px 8px */
--padding-badge:    var(--space-1) var(--space-2);   /* pill/badge inner: 4px 8px */
--padding-card:     var(--space-2) var(--space-3);   /* card inner: 8px 12px */
--padding-panel:    var(--space-3);                  /* sidebar/panel padding: 12px */
--padding-section:  var(--space-2) var(--space-3);   /* section header: 8px 12px */
--gap-row:          var(--space-1);                  /* gap between rows: 4px */
--gap-card:         var(--space-2);                  /* gap between cards: 8px */
--gap-section:      var(--space-3);                  /* gap between sections: 12px */
--gap-panel:        var(--space-4);                  /* gap between top-level panels: 16px */
```

### Spacing Rules
- **Dense rows (skill rows, table rows):** `padding: var(--padding-row)` — never more than 8px vertical.
- **Cards / panels inner padding:** `var(--padding-card)` = 8px 12px.
- **Gap between sibling cards:** `var(--gap-card)` = 8px.
- **Gap between panel sections:** `var(--gap-section)` = 12px.
- **Use `gap` in flex/grid, not `margin-top` on individual elements.**

---

## 4. Border Radius

Holocron uses a near-flat, angular aesthetic. Radii are deliberately small.

```css
--radius-none:  0px;
--radius-sm:    1px;      /* dots, tags, tracker bars */
--radius-md:    2px;      /* buttons, inputs, cards — PROJECT DEFAULT */
--radius-lg:    4px;      /* modals, drawers only */
--radius-full:  9999px;   /* avatar circles, pip/die indicators */
```

**Rules:**
- **Default to `--radius-md` (2px)** on all interactive components and cards.
- Only use `--radius-lg` inside full-screen modals or drawers.
- Never mix radii within a single component.
- Tracker bars and skill dots use `--radius-sm` (1px).

---

## 5. Elevation / Shadows

The light UI uses warm-tinted shadows that match the palette undertone.

```css
--shadow-sm:  0 1px 2px rgba(42, 16, 8, 0.08);
--shadow-md:  0 2px 8px rgba(42, 16, 8, 0.12);
--shadow-lg:  0 4px 16px rgba(42, 16, 8, 0.16);
```

**Rules:**
- Use `--shadow-sm` on cards at rest.
- Use `--shadow-md` on elevated panels (drawers, dropdowns).
- Never stack more than one shadow level per component.
- Do not use blue-grey (`rgba(0,0,0,...)`) shadows — always use the warm `rgba(42,16,8,...)` base.

---

## 6. Layout Tokens

These are fixed shell dimensions. CC must not change these values without updating all dependent rail/offset calculations.

```css
--topbar-height:     48px;
--modebar-height:    36px;
--shell-offset:      84px;   /* topbar + modebar: use for sticky rail top positioning */

--sidebar-width:     clamp(180px, 14vw, 240px);
--rightpanel-width:  clamp(200px, 16vw, 280px);
```

**Layout grid:**
```
[sidebar: --sidebar-width] [main: 1fr] [right panel: --rightpanel-width]
```
All panels sit below `--shell-offset` (84px). Any sticky or fixed element inside a panel must account for this with `top: var(--shell-offset)`.

---

## 7. Component-Level Tokens

These are assembled from primitives. CC uses these in components — not the raw primitives.

```css
/* Topbar */
--topbar-bg:            var(--color-bg-panel);
--topbar-border:        var(--color-border-strong);
--topbar-logo-color:    var(--color-red-sun);

/* Tabs */
--tab-bg:               var(--color-bg-surface);
--tab-color:            var(--color-text-faint);
--tab-active-color:     var(--color-red-sun);
--tab-active-border:    var(--color-red-sun);
--tab-session-color:    var(--color-red-mid);

/* Cards */
--card-bg:              var(--color-bg-panel);
--card-border:          var(--color-border-mid);
--card-bg-trained:      var(--color-bg-card);

/* Vital card top-accent borders */
--vital-accent-wounds:  var(--color-wounds);
--vital-accent-strain:  var(--color-strain);
--vital-accent-soak:    var(--color-red-pale);
--vital-accent-def:     var(--color-border-strong);

/* Primary button */
--btn-primary-bg:       var(--color-red-sun);
--btn-primary-border:   var(--color-red-hi);
--btn-primary-text:     var(--color-text-on-red);
--btn-primary-hover:    var(--color-red-hi);

/* Ghost button */
--btn-ghost-border:     var(--color-border-strong);
--btn-ghost-text:       var(--color-text-muted);
--btn-ghost-hover-bg:   var(--color-bg-card);

/* Tracker bars */
--tracker-bg:           var(--color-bg-card);
--tracker-border:       var(--color-border-strong);

/* Corner bracket decoration */
--corner-color:         var(--color-red-mid);
```

---

## 8. Anti-Patterns

| ❌ Never do this | ✅ Do this instead |
|---|---|
| `font-size: 12px` | `font-size: var(--text-sm)` |
| `color: #E03A1E` | `color: var(--color-red-sun)` |
| `padding: 8px 12px` hardcoded | `padding: var(--padding-card)` |
| `margin-top: 8px` on each child | `gap: var(--gap-card)` on the parent flex/grid |
| `border-radius: 4px` directly | `border-radius: var(--radius-md)` |
| `box-shadow: 0 2px 8px rgba(0,0,0,0.15)` | `box-shadow: var(--shadow-md)` |
| Two different red hex values in one component | Always reference the same `--color-red-*` token |
| `font-family: 'Orbitron'` on body text | `--font-display` is for logos and stat numerics only |

---

## 9. Colour Usage Rules

1. **Only one accent family.** The red ramp is the only accent. There is no blue, green, or purple in the base palette (except `--color-success` for roll results).
2. **Wounds = `--color-wounds` (`--color-red-sun`).** Always. Never use a different red.
3. **Strain = `--color-strain` (`--color-red-dim`).** Always. It is darker than wounds to establish clear hierarchy.
4. **Force checks share the strain colour** — both are deep/spiritual in nature.
5. **Career markers** use `--color-red-pale` (lightest) — they are information, not alerts.
6. **Text on red backgrounds** always uses `--color-text-on-red` (`#FFF0E8`). Never plain white.
7. **Corner bracket decoration** uses `--corner-color` (`--color-red-mid`). It is decorative only — never functional.

---

## 10. CC Implementation Checklist

Before committing any component, verify:

- [ ] All font sizes use `var(--text-*)` tokens — no hardcoded px
- [ ] All colours reference `var(--color-*)` tokens — no hardcoded hex
- [ ] All spacing uses `var(--space-*)` or semantic aliases — no ad-hoc px values
- [ ] Border radius is `var(--radius-md)` unless a specific exception applies
- [ ] Shadows use `var(--shadow-*)` with warm rgba base
- [ ] ALL CAPS labels use `--font-mono` + `--tracking-widest`
- [ ] Stat numerics use `--font-display` + `--leading-tight`
- [ ] No `margin-top` on siblings — use `gap` on the parent
- [ ] Sticky/fixed elements inside panels account for `--shell-offset: 84px`
