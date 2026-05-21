Always read these items before doing any work. 

1. claude.md
2. AoE Core Rulebook.md
3. design-rules.md
4. docs/architecture.md

After reading docs/architecture.md, keep it up to date. If any task adds, removes, or renames a route, hook, table, component, or utility file, update docs/architecture.md to reflect the change before closing the task.

---

## Design System Rules

**These rules apply to all new and modified code. No exceptions.**

### Single source of truth

All design tokens live in `src/lib/tokens.ts`. This is the only place where colors, font sizes, spacing, z-index, border-radius, shadows, and transitions are defined. Never define a color, size, or spacing value in a component file.

```ts
import { COLOR, HUD, FS, SP, RADIUS, Z, SHADOW, EASE, CHAR_COLOR, DICE_META, SYM } from '@/lib/tokens'
```

### No inline styles

Do not write `style={{ }}` objects in components. Use:
- **Tailwind utility classes** for layout, spacing, and standard styling
- **CSS custom properties** via `globals.css` classes (`.hud-card`, `.card-hdr`, `.eyebrow`, etc.)
- **`panelBase`** from `tokens.ts` is the only permitted shared style spread — only for HUD panels that require `backdrop-filter`

The following are banned in component files:
```ts
// ❌ banned
style={{ color: '#C8AA50' }}
style={{ fontFamily: "'Palanquin', sans-serif" }}
style={{ fontSize: '11px' }}
style={{ padding: '8px 16px' }}
style={{ zIndex: 9999 }}
style={{ borderRadius: 4 }}

// ✅ correct
className="text-[color:var(--gold)]"          // Tailwind arbitrary
style={{ color: COLOR.gold }}                  // from tokens.ts
style={{ fontSize: FS.label }}                 // from tokens.ts
style={{ padding: `${SP[2]} ${SP[4]}` }}       // from tokens.ts
style={{ zIndex: Z.tooltip }}                  // from tokens.ts
style={{ borderRadius: RADIUS.md }}            // from tokens.ts
```

### Two fonts only

The project uses exactly two UI fonts plus the icon font. Do not add more.

| Font | CSS variable | TS constant | Use |
|---|---|---|---|
| **Signika** | `var(--font-display)` | `FONT_DISPLAY` | Logos, stat numerics, display headings |
| **Palanquin** | `var(--font-body)` | `FONT_BODY` | All other UI text — labels, body, HUD, buttons |
| **sw-rpg-icons** | `var(--font-sw-rpg-icons)` | `FONT_ICONS` | Star Wars RPG dice/result icon font only |

In TypeScript: `import { FONT_DISPLAY, FONT_BODY, FONT, FONT_ICONS } from '@/lib/tokens'`

`FONT` is an alias for `FONT_BODY` and exists for backward compatibility only — existing references to `FONT` continue to work and resolve to Exo 2.

Legacy CSS aliases (`--font-rajdhani`, `--font-cinzel`, `--font-orbitron`, `--font-mono`) exist in `globals.css` and resolve to the new fonts — do not use them in new code.

### Hover and focus states

Do not use `onMouseEnter`/`onMouseLeave` to mutate `e.currentTarget.style.*`. Use CSS:
```css
/* In globals.css or a component's CSS class */
.my-button:hover { border-color: var(--gold-l); }
.my-button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.my-button:disabled { opacity: 0.4; cursor: not-allowed; }
```

### Z-index

All z-index values must use `Z` from tokens:
```ts
import { Z } from '@/lib/tokens'
// Z.base=0  Z.raised=1  Z.sticky=10  Z.dropdown=20
// Z.overlay=100  Z.backdrop=400  Z.modal=410
// Z.fab=500  Z.toast=800  Z.tooltip=9999
```

### Border radius

All border-radius values must use `RADIUS` from tokens:
```ts
import { RADIUS } from '@/lib/tokens'
// RADIUS.sm=2  RADIUS.md=4  RADIUS.lg=8  RADIUS.xl=12  RADIUS.full='50%'
```

### Backward-compat imports

`src/components/player-hud/design-tokens.ts`, `src/components/wireframe/wf-tokens.ts`, and `src/lib/styles.ts` are shims that re-export from `tokens.ts`. Existing imports still work. New code must import directly from `@/lib/tokens`.
