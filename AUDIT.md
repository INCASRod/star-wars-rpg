# HOLOCRON — Code Audit & Opportunity Review
_March 2026 — Auto-generated review_

---

## What We Have

HOLOCRON is a **feature-complete Star Wars RPG campaign manager** for the FFG/Genesys system. The core gameplay loop — character management, talent/force trees, equipment, GM tools, realtime sync — is fully operational.

### Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Character list + GM PIN login | ✅ Complete |
| `/character/[id]` | Full HUD with tabs, tree modals, loot reveals | ✅ Complete |
| `/gm` | Bulk XP/credits, combat tracker, crit roller, loot creator | ✅ Complete |
| `/create` | 5-step character creation wizard | ✅ Complete |

### Database (Supabase — peodenvcchftqqtikdhx)
- 4 migrations applied, RLS enabled
- **2,000+ seeded rows:** 36 skills, 119 species, 20 careers, 129 specs, 631 talents, 491 weapons, 112 armor, 610 gear, 21 force powers, 186 force abilities
- Characters: Bylethia (26720f3e), BX-9R (fd4b92d0), Guy Rando (eac7271c), Zid Hag (93be969c)
- Campaign: Legacy of Rebellion (6ba1c2c4)

### Components (27 total)
```
character/   CharacterHud, TalentTree, ForcePowerTree, LoreContent,
             VitalsCard, CharacteristicsCard, SkillsCard, WeaponsCard,
             EquipmentCard, TalentsCard, CriticalInjuriesCard, ForcePowersCard,
             MoralityCard, ObligationDutyCard, CenterHero, InventoryContent,
             Sidebar, Breadcrumb, BottomBar

ui/          HudCard, VitalBar, DiceHex, EquipmentImage, Badge, button, alert-dialog
```

### Standout Strengths
- **Viewport-scaled typography** via `clamp()` — 14px→20px across 1080p–4K automatically
- **Supabase Realtime** with self-mutation detection (no echo toasts), broadcast channels for GM→player loot reveals, proper channel cleanup
- **FFG dice pool math** is correct (`proficiency = min(char, rank)`, `ability = |char - rank|`)
- **OggDude XML pipeline** — parse → seed → import player XMLs — all working including force powers with `Foresee/Forsee` dedup
- **Encumbrance auto-calc** follows FFG rules (equipped armor −3)
- **TalentTree visual** — 5×4 grid with SVG connection lines, tooltip-side detection, smart hover states (purchased=gold, available=green, locked=grey)
- **ForcePowerTree** — variable-span cells, per-cell costs, tab switcher for multiple powers
- Design system — 100+ CSS tokens, glassmorphic cards, gold/sand/blue palette, consistent across all pages

---

## Gaps & Issues

### Critical (Breaks/Limits Functionality)

**1. Duplicate tree logic — TalentTree & ForcePowerTree share ~90% of code**
The two tree components are nearly identical (grid rendering, tooltip positioning, SVG connections, hover state, purchase flow). Any bug fix or enhancement must be done twice. This is the biggest technical debt item.
- **Fix:** Extract `<TreeGrid nodeData rows cols onPurchase />` base component; both trees become thin wrappers.

**2. CharacterHud passes 30+ props**
`CharacterHud.tsx` receives every piece of data and every callback as a prop. It's impossible to add features without threading new props through the entire chain.
- **Fix:** Replace prop drilling with `CharacterContext` for read data; keep callbacks as focused prop objects.

**3. useCharacterData is 400+ lines**
The single hook mixes data loading, Realtime subscription, and 20+ mutation handlers. Split into:
- `useCharacterData` — loads + subscribes, returns state only
- `useCharacterMutations` — handlers, depends on useCharacterData

**4. CRIT_TABLE hardcoded in GM page**
40-entry critical injury table is embedded in the component body. Needs DB-driven or constant file.

**5. Zustand installed but never used**
Dependency weight with no benefit. Either use it for shared state or remove it.

---

### High Priority (UX / Maintainability)

**6. No confirmation on talent/spec purchase**
Buying a talent costs real XP; there's no "Are you sure?" step. Players can fat-finger purchases.
- **Fix:** Wrap purchase handlers in existing `alert-dialog` pattern (already used elsewhere).

**7. No error toasts on mutation failure**
If a tree node purchase, equipment toggle, or loot broadcast fails, nothing is shown to the user.
- **Fix:** Wrap all Supabase calls in try/catch → `toast.error()`.

**8. Inline styles everywhere**
~500 inline style objects (e.g., `style={{ gap: '0.25rem', color: 'rgba(255,255,255,.72)' }}`). This:
- Makes refactoring painful
- Defeats Tailwind's purge/tree-shaking
- Repeats magic values in dozens of places
- **Fix:** Migrate to Tailwind utility classes or named CSS classes; push shared values to existing CSS tokens.

**9. Hard-coded constants scattered across files**
`ROW_COSTS = [5,10,15,20,25]`, `COLS=4`, `ROWS=5`, z-index values, grid column ratios — all duplicated across files.
- **Fix:** Create `src/constants.ts`.

**10. No loading skeletons**
Character list renders "LOADING HOLOCRON DATA" (full-page block) with no skeleton. Tree modals have no loading state while fetching.
- **Fix:** Add `<Suspense>` boundaries with skeleton UIs for lists and modals.

**11. No error boundary on character page**
Any uncaught error in the 813-line character page crashes silently.
- **Fix:** Wrap in `<ErrorBoundary>` with a recovery UI.

---

### Medium Priority (Code Quality)

**12. `any` types in force power tree**
`row.costs` and `row.abilities` are cast as `any` inside tree-building logic. TypeScript can't catch bugs here.
- **Fix:** Add proper types; the shapes are known from `RefForceAbility`.

**13. Tree nodes not memoized**
A 5×4 = 20 node grid re-renders entirely on each state change. With large force power trees this compounds.
- **Fix:** `React.memo` on individual node components; memoize `buildTreeForSpec()` with `useMemo`.

**14. Tooltip positioning is manual pixels**
`tooltipSide` detection is a ~30-line block of arithmetic. Breaks if card layout changes.
- **Fix:** Replace with `@floating-ui/react` or Radix `Tooltip` (already using Radix for alert-dialog).

**15. Missing save indicator in LoreContent**
Notes auto-save after 800ms debounce, but nothing tells the player it saved.
- **Fix:** Brief "Saved ✓" flash after debounce resolves.

**16. No search in talent list or equipment list**
With 631 talents across 129 specs and 1,213 equipment items, there's no filter.
- **Fix:** Add search input + clear button to both list views.

**17. buildTreeForSpec() is 50+ lines with nested loops**
Complex logic lives inside the render scope. Hard to test independently.
- **Fix:** Move to `src/lib/tree-builders.ts` as pure functions.

---

### Low Priority (Polish)

| # | Issue | Fix |
|---|-------|-----|
| 18 | No keyboard navigation in tree modals | Arrow keys move focus between nodes |
| 19 | Tree nodes missing ARIA labels | `aria-label="Sense — cost 10 XP — purchased"` |
| 20 | Equipment images missing `alt` text | Use item name |
| 21 | Legacy CSS aliases are confusing | `--font-base` maps to `text-body-sm`, not `text-body` — document or rename |
| 22 | Dark mode CSS present but unused | Delete or wire up `prefers-color-scheme` |
| 23 | Unused OKLch color tokens | Adopt them or remove them |
| 24 | No undo for purchases | 3-second undo toast after buy; simple optimistic pattern |
| 25 | GM mode undocumented | No visible indicator of which features are GM-only |

---

## Opportunities (New Features)

### Near-Term (Useful Now)

**A. Dice Roller Panel**
`dice.ts` already builds the pool. Add a floating panel that:
- Shows the computed pool for any skill check
- Displays result symbols (success/failure/advantage/threat/triumph/despair)
- Logs results to the session

**B. XP History / Audit Log**
`xp_transactions` table exists but isn't surfaced. Show a timeline: "Bought Sense Rank 2 (-15 XP)", "GM awarded +50 XP". Players love seeing their growth.

**C. Character Export to PDF**
One-page character sheet export. jsPDF or Puppeteer screenshot. Highly requested in RPG tools.

**D. Equipment Quick-Compare**
Side-by-side weapon/armor stat comparison when hovering or selecting an item in the loot creator.

**E. Obligation/Duty Tracker**
`ObligationDutyCard` displays values but doesn't have a session-level tracker. Add a "trigger this session" toggle with history.

**F. Specialization Prerequisite Visualization**
The spec purchase flow has a search but no prerequisite graph. Show which specs unlock which — this is a common FFG planning tool.

### Medium-Term (Next Phase)

**G. Encounter Builder**
The GM combat tracker currently manages HP/strain for PCs. Extend it to:
- Add NPC minion groups with adversary stats
- Track initiative slots
- Auto-apply crit results

**H. Session Notes (Shared)**
Shared notepad visible to all players in the campaign. Simple rich-text or markdown. Supabase Realtime makes this trivial.

**I. Modular Weapon Attachments**
`WeaponsCard` shows weapons but doesn't support attachments. FFG has a full mod system; the ref data may already exist in OggDude XMLs.

**J. Force Commit Tracker**
Committed force dice reduce the pool for checks. Add a "force committed" counter that subtracts from the shown dice pool automatically.

**K. Mobile Layout**
The 3-column grid is desktop-only. A stacked single-column layout for phones/tablets would allow mid-session lookups without a laptop.

### Long-Term (Campaign-Level)

**L. Campaign Timeline / Journal**
Structured campaign log — sessions, locations, NPCs encountered — with player-writable summaries.

**M. NPC Library**
GM can save custom NPCs with stats, motivations, and secrets. Quick-access during encounters.

**N. Multi-Campaign Support**
Currently tied to one campaign. The schema supports multiple; just needs campaign-switching UI.

---

## What the Code Looks Like (Summary)

| Dimension | Assessment |
|-----------|-----------|
| Visual quality | Excellent — best-in-class for an indie RPG tool |
| FFG rules accuracy | Correct throughout |
| TypeScript strictness | Moderate — `any` in a few hot paths |
| Component size | Too large — some files exceed 800 lines |
| Code duplication | High — TalentTree/ForcePowerTree, loot badge logic, GM button styling |
| Error handling | Weak — most failures are silent |
| Accessibility | Poor — no keyboard nav, no ARIA on trees |
| Performance | Acceptable at current scale; would degrade with many tabs open |
| Testing | None — no unit, integration, or e2e tests |
| Documentation | Sparse — no inline JSDoc; CLAUDE.md covers design system only |

---

## Recommended Order of Work

1. **Extract `<TreeGrid>`** — biggest payoff, removes the largest duplicate
2. **Add error toasts to all mutations** — quick wins, immediately improves stability feel
3. **Add purchase confirmation dialogs** — prevents frustrating mistakes
4. **Move to Tailwind classes** — reduce inline style objects systematically
5. **Split useCharacterData hook** — makes future features easier to add
6. **Add XP history view** — high player value, table already exists
7. **Add dice roller panel** — `dice.ts` is ready, just needs UI
8. **Add loading skeletons** — polish pass
9. **Keyboard/ARIA for trees** — accessibility pass
10. **Encounter builder** — next major GM feature
