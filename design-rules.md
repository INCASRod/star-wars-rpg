# HOLOCRON — Universal Responsive Design Prompt

Copy and paste this at the start of any Claude conversation involving UI work on the HOLOCRON app.

---

## PROMPT

You are building or modifying the **HOLOCRON TTRPG companion app**. This UI must work correctly on **all screen sizes simultaneously** — from a 13" laptop (1280×800) to a 15" FHD (1920×1080), to a 2K/QHD monitor (2560×1440), and ultrawide displays. No screen size is the "default." Every element must scale fluidly.

---

### 1. VIEWPORT — REQUIRED IN EVERY HTML FILE

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without this, browsers on high-resolution monitors render at physical pixel resolution, making the entire UI appear tiny. This is non-negotiable.

---

### 2. ROOT FONT SIZE — FLUID BASE

The browser default of `16px` must not be overridden with a fixed value. If you need to scale the base, use:

```css
html {
  font-size: clamp(14px, 1vw + 0.5rem, 18px);
}
```

This ensures `rem` units scale proportionally across all viewports.

---

### 3. TYPOGRAPHY — NEVER USE FIXED `px` FOR FONT SIZES

All font sizes must use `clamp()`. Define these as CSS custom properties and reference them everywhere:

```css
:root {
  --text-display: clamp(2.25rem, 5vw + 1rem, 5rem);        /* 36px → 80px */
  --text-h1:      clamp(1.75rem, 3.5vw + 0.75rem, 3.5rem); /* 28px → 56px */
  --text-h2:      clamp(1.375rem, 2.5vw + 0.5rem, 2.5rem); /* 22px → 40px */
  --text-h3:      clamp(1.125rem, 1.5vw + 0.5rem, 1.75rem);/* 18px → 28px */
  --text-h4:      clamp(1rem, 1vw + 0.5rem, 1.375rem);     /* 16px → 22px */
  --text-body:    clamp(0.9375rem, 0.5vw + 0.75rem, 1.125rem); /* 15px → 18px */
  --text-body-lg: clamp(1rem, 0.75vw + 0.75rem, 1.25rem);  /* 16px → 20px */
  --text-sm:      clamp(0.75rem, 0.25vw + 0.6rem, 0.875rem);  /* 12px → 14px */
  --text-xs:      clamp(0.625rem, 0.2vw + 0.5rem, 0.75rem);   /* 10px → 12px */
  --text-label:   clamp(0.6875rem, 0.3vw + 0.55rem, 0.8125rem);
}
```

**Always pair font sizes with line-height:**

| Token | Line Height | Letter Spacing |
|---|---|---|
| `--text-display` | `1.05` | `-0.04em` |
| `--text-h1` | `1.1` | `-0.03em` |
| `--text-h2` | `1.2` | `-0.02em` |
| `--text-h3` | `1.3` | `-0.01em` |
| `--text-body` | `1.6` | `0em` |
| `--text-sm` | `1.5` | `0.01em` |
| `--text-label` | `1.2` | `0.1em` |

---

### 4. SPACING — FLUID, NEVER HARDCODED `px`

```css
:root {
  --space-1:  clamp(0.25rem, 0.5vw, 0.5rem);
  --space-2:  clamp(0.5rem,  1vw,   1rem);
  --space-3:  clamp(0.75rem, 1.5vw, 1.5rem);
  --space-4:  clamp(1rem,    2vw,   2rem);
  --space-6:  clamp(1.5rem,  3vw,   3rem);
  --space-8:  clamp(2rem,    4vw,   4rem);
  --space-12: clamp(3rem,    6vw,   6rem);
  --space-16: clamp(4rem,    8vw,   10rem);
}
```

Use these tokens for all `margin`, `padding`, and `gap` values.

---

### 5. LAYOUT — FILL THE VIEWPORT, DON'T CONSTRAIN IT

The app is a **desktop tool**, not a website. It should fill the available screen:

```css
body {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* or auto, depending on panel */
}

/* Panels and sidebars use flex/grid, not fixed widths */
.sidebar {
  width: clamp(240px, 20vw, 400px);
}

.main-content {
  flex: 1; /* fills remaining space */
  min-width: 0;
}
```

Never use `max-width: 1280px` on a full-screen app layout — that creates dead space on large monitors.

---

### 6. BREAKPOINTS FOR REFERENCE

| Name | Range | Device |
|------|-------|--------|
| `xs` | 320px – 479px | Small phones |
| `sm` | 480px – 767px | Large phones |
| `md` | 768px – 1023px | Tablets |
| `lg` | 1024px – 1279px | Small laptops |
| `xl` | 1280px – 1535px | Standard desktops / 15" monitors |
| `2xl` | 1536px+ | 2K, 4K, ultrawide |

The `clamp()` system handles transitions between all these automatically — you should rarely need explicit `@media` queries for font sizes or spacing.

---

### 7. AUDIT CHECKLIST — APPLY TO ALL COMPONENTS

Before submitting any UI code, verify:

- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present
- [ ] Zero hardcoded `px` font sizes — all use `clamp()` tokens
- [ ] Zero hardcoded `px` margins/padding — all use `--space-*` tokens
- [ ] Sidebars and panels use `clamp()` or `flex`/`grid` for width, not fixed values
- [ ] Body text has `max-width: 65ch` where readability matters
- [ ] Layout has been mentally tested at 1280px, 1920px, and 2560px widths

---

### 8. COMMON MISTAKES TO AVOID

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `font-size: 11px` | `font-size: var(--text-sm)` |
| `padding: 8px 16px` | `padding: var(--space-2) var(--space-4)` |
| `width: 280px` (sidebar) | `width: clamp(220px, 18vw, 320px)` |
| `max-width: 1280px` on app shell | `width: 100%` + `flex: 1` |
| No viewport meta tag | Always include it |
| `font-size: 0.7rem` (fixed small) | `font-size: var(--text-xs)` |

---

*This prompt encodes the HOLOCRON Responsive Design System. All UI contributions must comply.*