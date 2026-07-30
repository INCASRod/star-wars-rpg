Always read these items before doing any work. 

1. claude.md
2. AoE Core Rulebook.md
3. design-rules.md
4. docs/architecture.md

After reading docs/architecture.md, keep it up to date. If any task adds, removes, or renames a route, hook, table, component, or utility file, update docs/architecture.md to reflect the change before closing the task.

---

## Dataset Architecture

The project runs a dual-dataset architecture. `campaign_settings.active_dataset` is currently `'respec'`.

**reSpecialized Project** (`dataset_source = 'respec'`) — canonical source for:
- Talents
- Force Powers / Force Abilities
- Specializations
- Careers
- Skills

**OggDude** (`dataset_source = 'oggdude'`) — canonical source for:
- Items (weapons, armor, gear, attachments)
- NPCs / adversaries
- Vehicles
- Everything else not listed above

OggDude rows still exist in the database for the domains reSpec now owns (talents, specializations, careers, force powers) — these are kept as an inactive rollback only. OggDude is **not** the active source for those domains and must not be described as such anywhere in this file.

**Canonical XML source paths:**
- `respec project data/` (repo root) — canonical XML source for every respec-owned domain above; read by `scripts/update-respec-snapshot.ts` (standing refresh tool) and, historically, by `scripts/parse-respec.ts` and `scripts/gen-migration-079.ts`
- `oggdude/DataCustom/` — used only for items and NPCs/adversaries/vehicles
- `oggdude/DataCustom/SigAbilities/` was the seed source for Signature Abilities (migrations 088–091); the canonical source going forward is `respec project data/SigAbilities/` (corrected in migration 092)

**Migration history** (dates verified against git log, not assumed):
- 2026-06-10 — migrations 062–067 moved talents, specializations, careers, and force powers/abilities to the reSpec dataset and activated it as `campaign_settings.active_dataset`
- 2026-07-17 — Signature Abilities (migrations 088–091) were seeded from the wrong source (`oggdude/DataCustom/SigAbilities/`) the same day they were added; migration 092 corrected this to seed from `respec project data/SigAbilities/`
- 2026-07-27 — migration 100 applied the Jun/Jul 2026 reSpec snapshot drop: new force powers (Commune, Psychometry) and their ability pips, new/updated Consular-career specializations (Sage, Healer, Ascetic, Arbiter, Teacher, Niman Disciple), and wording/value corrections to existing respec talents and force abilities. Purely additive — no rows removed, no `is_retired`/`is_force_sensitive`/`career_key` flags touched, no character data affected.
- 2026-07-30 — migration 108 fixed a `scripts/update-respec-snapshot.ts` bug that silently reverted 55 hand-corrected specialization talent trees (migrations 068/074) back to their OggDude-derived originals: `parseSpecializations()`'s versioned-override filename regex didn't strip a trailing version number (e.g. `"Agitator (reSpecialized) 1.01.xml"`), so the override file was never matched and the tool fell back to the plain/original file every time it ran, including during migration 100. The regex now strips an optional version suffix and, when a concept has multiple versioned files, picks the highest version number numerically (not lexically). All 55 specializations now diverge from their oggdude counterparts as intended.
- 2026-07-30 — migrations 109–110 closed the two remaining gaps flagged by 108's own audit note. (a) `parseSpecializations()` used to iterate only plain files, silently skipping 4 concepts with no plain predecessor (Archeologist, Field Agent, Ground Support, Wingmate) — it now also processes versioned-only concepts, using a shared/oggdude key when one exists (Archeologist -> `ARCHEOLOGIST`) or a sanitized version of the file's own `<Key>` otherwise (`WINGMATE1.0` -> `WINGMATE`). (b) Discovered while checking for references to those dirty keys: nearly every career's `specialization_keys` array (in the canonical Careers XML itself) lists specs by whatever raw `<Key>` their versioned override file happens to carry (e.g. Diplomat.xml's `AGITATORRES` is literally Agitator's override file's internal key) rather than the canonical key — a long-standing issue migration 093 had already partially flagged and deferred (its own comment named DIPLOMAT's `ANALYSTRES` and SPY's keys as unresolvable at the time). `parseSpecializations()` now returns a `keyAliasMap` of every raw `<Key>` seen (plain + every versioned variant) to its canonical key, and `parseCareers()` translates every `specialization_keys` entry through it, warning on anything still unresolved after translation (zero after this run — every career's array now resolves to a real spec). Migration 110 is a small hand-written companion that deletes the two now-orphaned dirty-keyed rows (`GROUNDSUPP1.0`, `WINGMATE1.0`) left behind by the key rename — verified zero `character_specializations` rows referenced either before deleting. Live-verified via Derek (Diplomat): Advocate/Ambassador/Analyst/Propagandist/Quartermaster all now correctly show `★ CAREER · 20 XP` in the buy-new-spec list, not the 30 XP non-career rate they'd silently fall back to with a dangling key.

**reSpec dataset refresh tooling:**
- `scripts/update-respec-snapshot.ts` is the standing tool for all future reSpec dataset drops. Usage: `npx tsx scripts/update-respec-snapshot.ts --migration <N>` — writes `supabase/migrations/<N>_respec_snapshot_update.sql` (refuses to overwrite an existing file at that path; never guess or reuse a migration number, always pick the next free one). Emits `ON CONFLICT ... DO UPDATE` so wording/value corrections land on existing rows, not just new keys, and resolves force-ability `power_key` from the parsed Force Powers XML key set rather than a name-transform. Deliberately does not touch `is_retired`, `is_force_sensitive`, or `career_key` on upsert — those are owned by later, more specific migrations layered on top of the seed.
- `scripts/parse-respec.ts` and `scripts/gen-migration-079.ts` are superseded for refresh work (insert-only, write to fixed already-applied migration filenames) — retained for historical reference only. Do not run them expecting a fresh migration; they will overwrite their original output files in place.

---

## Design System Rules

**These rules apply to all new and modified code. No exceptions.**

### Single source of truth

All design tokens live in `src/lib/tokens.ts`. This is the only place where colors, font sizes, spacing, z-index, border-radius, shadows, and transitions are defined. Never define a color, size, or spacing value in a component file.

### Debugging
For visual/rendering bugs, use the Playwright harness to verify against the running app before proposing a fix; do not fix visual bugs from static analysis alone.

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
style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
| **Space Grotesk** | `var(--font-display)` | `FONT_DISPLAY` | Logos, stat numerics, display headings |
| **JetBrains Mono** | `var(--font-body)` | `FONT_BODY` | All other UI text — labels, body, HUD, buttons |
| **JetBrains Mono** | `var(--font-mono)` | `FONT_MONO` | Numeric/data values — stat blocks, counters, inline code |
| **sw-rpg-icons** | `var(--font-sw-rpg-icons)` | `FONT_ICONS` | Star Wars RPG dice/result icon font only |

In TypeScript: `import { FONT_DISPLAY, FONT_BODY, FONT_MONO, FONT, FONT_ICONS } from '@/lib/tokens'`

`FONT` is an alias for `FONT_BODY` and exists for backward compatibility only.

Legacy CSS aliases (`--font-rajdhani`, `--font-cinzel`, `--font-orbitron`, `--font-mono`) exist in `src/styles/holo-tokens.css` and resolve to the new fonts — do not use them in new code.

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

---

## Shinkei Enforcement

These rules enforce the Shinkei design system contract. Violations block task completion — fix before marking done.

### Typography

- All font sizes must use `FS.*` tokens from `@/lib/tokens`. Never write `'12px'`, `'0.75rem'`, or any size literal in an inline style.
- All font families must use `FONT_BODY`, `FONT_DISPLAY`, or `FONT_ICONS`. Never write a font-family name string inline.
- `FONT_MONO` (`var(--font-mono)`) is JetBrains Mono registered as a distinct semantic variable for numeric/data contexts. Use it for stat values, counters, and inline monospaced figures — not as a general body font.
- `FS.hero` (`var(--text-hero)`, `src/styles/holo-tokens.css`) — display/hero stat numerals only (e.g. ForcePanel's Force Rating number), clamped roughly 64→96px depending on root font-size scaling. Added by redefining a pre-existing `--text-hero` custom property that was defined but had zero consumers anywhere in the app (previously clamped ~22→32px, nowhere near hero-numeral scale) — reused rather than adding a second, differently-named token next to a dead one. If you're about to add another "big number" size token, check whether `FS.hero` already fits before adding a new step.

### Colour discipline

- All colours must come from `HUD.*`, `COLOR.*`, `CHAR_COLOR.*`, or `var(--*)` CSS custom properties. Never write a hex or rgb value inline.
- Approved exception: `ACCENT_HEX` in SVG `stroke`/`fill` attributes where CSS variables are unsupported. The exception must be accompanied by a comment.
- All other uses of raw hex or rgb in component files are violations, including inside `linear-gradient()` or `box-shadow` strings.

### Opacity

- Element opacity: use the `opacity` CSS property or `color-mix(in srgb, <token> N%, transparent)`.
- Background/border opacity: `color-mix(in srgb, var(--hud-accent) 20%, transparent)` is the correct pattern.
- The `var(--token)HH` two-digit hex suffix pattern is banned — it breaks under theme switching.
- `var(--hud-accent-10)`, `var(--hud-accent-20)` etc. are banned. Use `color-mix()` instead.

### Theme system

The project has three themes: **Kyber Archive** (default, cyan accent), **Ember Tatooine** (red accent), **neutral**. All accent colours are delivered via `var(--hud-accent)`.

- Never hardcode a theme accent colour — always use `var(--hud-accent)` or `color-mix()` against it.
- Components must render correctly under all three themes.
- Never reference `--hud-accent-*` variant tokens — they are internal to the theme layer.

### Sealed namespaces

- `DICE_COLOR`, `SYM_COLOR`, `DICE_META`, `SYM` from `@/lib/tokens` — dice and symbol rendering only. Do not use in layout or general UI components.
- `FONT_ICONS` / `var(--font-sw-rpg-icons)` — icon font only. Do not set as `fontFamily` on any non-icon element.
- The sw-rpg-icons font loading in `src/app/layout.tsx` is permanently sealed. Do not add, remove, or reorder font registrations there.

### Transitions and z-index

All transition timing values must use `EASE.*` from `@/lib/tokens` or `var(--ease-*)` from `holo-tokens.css`. Never hardcode `0.2s ease`, `300ms`, or any timing literal in a component.

All z-index values must use `Z.*` from `@/lib/tokens` or `var(--z-*)` from `holo-tokens.css`. Never hardcode a z-index number in a component.

### Audit requirement

Every CC prompt that touches UI must begin with a Step 0 audit phase before any implementation. The audit must:
1. Confirm the build is currently clean (`npm run build`)
2. Report any existing violations in the target files
3. Confirm the exact line numbers and values to be changed

No implementation may begin until Step 0 is reported.

### New component checklist

Before completing any new component or modifying an existing one, verify all of the following. A failing check must be fixed before the task is marked done:

- [ ] Zero hardcoded px/rem/em font sizes in inline styles
- [ ] Zero hardcoded hex/rgb colours outside approved exceptions
- [ ] Zero hardcoded z-index numbers
- [ ] Zero hardcoded transition timing values
- [ ] Zero hardcoded px spacing except `1px` borders
- [ ] Fonts are Space Grotesk and JetBrains Mono only
- [ ] Component works correctly under all three themes
- [ ] No `var(--token)HH` opacity patterns
- [ ] No `--hud-accent-*` variant token references
- [ ] No `onMouseEnter`/`onMouseLeave` style mutations
- [ ] Hover states handled via CSS classes or `hov-lift`
- [ ] `docs/architecture.md` updated if any route, hook, table, component, or utility file was added or changed

---

## UI Implementation Gate — Mandatory

Before marking ANY UI task complete, CC must run through this checklist in full. If any item fails, fix it before reporting done. Do not report partial completion.

### 1. Token compliance — self-audit
After writing any JSX, scan every inline style prop in the changed files for:

  □ Font sizes — all use FS.* tokens.
    Zero raw px, rem, or clamp() values.
    Exception: pre-approved exceptions with
    inline comment.

  □ Spacing — all padding, margin, gap use
    SP[N] or var(--space-*) tokens.
    Zero raw px or rem values.
    Exception: 2px minimum touch targets
    with inline comment.

  □ Colours — all use var(--hud-*),
    color-mix(), or RADIUS/token constants.
    Zero raw hex or rgba values.
    Exception: die-identity and game-mechanic
    colours with inline comment.

  □ Transitions — all use EASE.* tokens.
    Zero raw '150ms', '.15s' strings.

  □ Border radius — all use RADIUS.* tokens.
    Zero raw numbers.

  □ Font family — all use FONT_BODY or
    FONT_DISPLAY constants.
    Zero 'var(--font-*)' string literals.

  □ Z-index — all use Z.* tokens.
    Zero raw numbers.

  □ Hover — no onMouseEnter/onMouseLeave
    style mutations. CSS classes only.

### 2. Layout compliance — visual check
After writing any JSX layout:

  □ Compact rows — padding on interactive
    rows must be SP[1] vertical or 2px
    minimum. Not SP[2] or larger unless
    it is a primary action button.

  □ No redundant wrappers — every div
    must have a clear layout purpose.
    Remove wrappers that only add spacing
    without structural function.

  □ Flex/grid discipline — flex children
    that should truncate have minWidth: 0.
    Flex children that should not stretch
    have flexShrink: 0. No unconstrained
    flex children in tight layouts.

  □ Section labels — FS.overline,
    letterSpacing 0.15–0.2em, uppercase,
    var(--hud-text-faint). Not larger.

  □ Primary action buttons — SP[2] vertical
    padding, FS.sm, full width where
    appropriate.

  □ Secondary/inline buttons — 2px vertical
    padding, FS.overline, fit-content width.

### 3. Mockup fidelity — compare before submitting
If a mockup was provided for this task:

  □ Open the mockup file and the rendered
    component side by side (or compare the
    HTML output).

  □ Check each section of the mockup against
    the implementation:
    - Header structure matches
    - Section order matches
    - Row density matches (not more spacious)
    - Button sizes match (compact vs primary)
    - Colour usage matches
    - Typography hierarchy matches

  □ If any section does not match the mockup,
    fix it before reporting done. Do not
    report "done" and leave visual gaps for
    the next iteration.

### 4. Report format
When reporting completion, include:

  □ Token compliance: PASS or list violations
  □ Layout compliance: PASS or list issues
  □ Mockup fidelity: PASS or list gaps
  □ Build: ✓ clean
  □ TypeScript: ✓ zero errors

If any item is not PASS, do not report the task as complete. Fix first, then report.
