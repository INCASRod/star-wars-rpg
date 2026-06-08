# Force Power Select — Accordion Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the truncated-description power list in `SelectPowerStep` with an accordion: cards show name-only by default; clicking expands to show the full description and purchased upgrades with hover tooltips.

**Architecture:** Single-file change to `SelectPowerStep.tsx`. A local `expandedKey` state (separate from the parent's `selectedPowerKey`) drives show/hide of the card body. The expanded body reuses the `Tooltip`/`TipLabel`/`TipBody`/`RichText` pattern already in `RollForceDiceStep`. Existing token violations in the file are fixed in the same change.

**Tech Stack:** React (`useState`), TypeScript, inline styles via `@/lib/tokens`, `@/components/ui/Tooltip`, `@/components/ui/RichText`

---

## Files

| Action | Path |
|---|---|
| Modify | `src/components/force-check/steps/SelectPowerStep.tsx` |

No new files. No parent component changes.

---

## Task 1: Step 0 Audit

**Files:**
- Read: `src/components/force-check/steps/SelectPowerStep.tsx`

- [ ] **Step 1.1: Confirm build is currently clean**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build
```

Expected: exit 0, no type errors.

- [ ] **Step 1.2: Record existing violations**

Open `src/components/force-check/steps/SelectPowerStep.tsx` and confirm these violations exist before touching any code:

| Line | Violation | Fix |
|---|---|---|
| 7 | `const FORCE_BLUE = '#7EC8E3'` | `color-mix(in srgb, var(--hud-accent) ...)` |
| 8 | `const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'` | `color-mix(in srgb, var(--hud-accent) 15%, transparent)` |
| 9 | `const FORCE_BLUE_SEL = 'rgba(126,200,227,0.1)'` | `color-mix(in srgb, var(--hud-accent) 10%, transparent)` |
| 10 | `const TEXT = 'var(--hud-text)'` | `HUD.text` directly |
| 11 | `const TEXT_DIM = 'var(--hud-text-dim)'` | `HUD.textDim` directly |
| 25 | `fontFamily: "var(--font-body)"` | `fontFamily: FONT_BODY` |
| 66 | `fontSize: 11` | `fontSize: FS.overline` |
| 62 | `transition: 'all .15s'` | `` transition: `all ${EASE.default}` `` |
| 59 | `borderRadius: 10` | `borderRadius: RADIUS.lg` |
| 56 | `padding: '12px 14px'` | `` padding: `${SP[3]} ${SP[4]}` `` |

Report complete → proceed to Task 2.

---

## Task 2: Rewrite SelectPowerStep

**Files:**
- Modify: `src/components/force-check/steps/SelectPowerStep.tsx`

- [ ] **Step 2.1: Replace the entire file with the implementation below**

Replace the full contents of `src/components/force-check/steps/SelectPowerStep.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { stripBBCode } from '@/lib/utils'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'
import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'

interface SelectPowerStepProps {
  powers:           ForcePowerDisplay[]
  selectedPowerKey: string | null
  onSelect:         (key: string) => void
}

export function SelectPowerStep({ powers, selectedPowerKey, onSelect }: SelectPowerStepProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const purchased = powers.filter(p => p.purchasedCount > 0)

  function handleCardClick(powerKey: string) {
    if (expandedKey === powerKey) {
      setExpandedKey(null)           // collapse only — selection stays
    } else {
      onSelect(powerKey)             // select + expand
      setExpandedKey(powerKey)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[4] }}>
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: FS.overline,
        color: HUD.textDim,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}>
        Which power will you use?
      </div>

      {purchased.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: `${SP[8]} ${SP[4]}`,
          display: 'flex',
          flexDirection: 'column',
          gap: SP[2],
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim }}>
            No Force powers purchased yet.
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>
            Visit the Force tab to purchase powers.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          {purchased.map(p => {
            const selected = p.powerKey === selectedPowerKey
            const expanded = p.powerKey === expandedKey
            const desc     = p.description ? stripBBCode(p.description) : ''
            const upgrades = p.abilities.filter(a => a.purchasedRanks > 0)

            return (
              <button
                key={p.powerKey}
                onClick={() => handleCardClick(p.powerKey)}
                style={{
                  textAlign: 'left',
                  padding: 0,
                  background: selected
                    ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)'
                    : 'color-mix(in srgb, var(--hud-accent) 4%, transparent)',
                  border: selected
                    ? `2px solid var(--hud-accent)`
                    : `1px solid color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
                  borderRadius: RADIUS.lg,
                  cursor: 'pointer',
                  transition: `all ${EASE.default}`,
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                {/* ── Header row — always visible ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: SP[2],
                  padding: `${SP[3]} ${SP[4]}`,
                }}>
                  <span style={{
                    color: 'var(--hud-accent)',
                    opacity: 0.8,
                    fontSize: FS.overline,
                    flexShrink: 0,
                  }}>✦</span>
                  <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: FS.sm,
                    fontWeight: 700,
                    color: HUD.text,
                    flex: 1,
                  }}>
                    {p.powerName}
                  </span>
                  <span style={{
                    fontSize: FS.overline,
                    color: 'var(--hud-accent)',
                    opacity: 0.5,
                    flexShrink: 0,
                    display: 'inline-block',
                    transition: `transform ${EASE.default}`,
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                </div>

                {/* ── Expanded body ── */}
                {expanded && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      borderTop: `1px solid color-mix(in srgb, var(--hud-accent) 12%, transparent)`,
                      padding: `${SP[2]} ${SP[4]} ${SP[3]}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: SP[2],
                    }}
                  >
                    {/* Description */}
                    {desc && (
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: FS.label,
                        color: HUD.textDim,
                        lineHeight: 1.5,
                      }}>
                        {desc}
                      </div>
                    )}

                    {/* Upgrades label */}
                    <div style={{
                      fontFamily: FONT_BODY,
                      fontSize: FS.overline,
                      color: 'var(--hud-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      opacity: 0.7,
                    }}>
                      Purchased Upgrades
                    </div>

                    {/* Upgrade rows */}
                    {upgrades.length === 0 ? (
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: FS.label,
                        color: HUD.textFaint,
                        fontStyle: 'italic',
                      }}>
                        No upgrades purchased yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' /* minimum row gap — px intentional */ }}>
                        {upgrades.map(upgrade => (
                          <Tooltip
                            key={upgrade.key}
                            content={
                              <>
                                <TipLabel>{upgrade.name}</TipLabel>
                                {upgrade.description
                                  ? <TipBody><RichText text={upgrade.description.replace(/\[FO\]/g, '').trim()} /></TipBody>
                                  : <TipBody><em>No description available.</em></TipBody>}
                              </>
                            }
                            placement="top"
                            maxWidth={300}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: SP[2],
                              padding: `2px ${SP[2]}`, /* 2px minimum touch target — intentional */
                              borderRadius: RADIUS.md,
                              background: 'color-mix(in srgb, var(--hud-accent) 6%, transparent)',
                              border: `1px solid color-mix(in srgb, var(--hud-accent) 10%, transparent)`,
                            }}>
                              <div style={{
                                width: 5, height: 5, /* decorative dot — px intentional */
                                borderRadius: RADIUS.full,
                                background: 'var(--hud-accent)',
                                opacity: 0.7,
                                flexShrink: 0,
                              }} />
                              <span style={{
                                fontFamily: FONT_BODY,
                                fontSize: FS.label,
                                color: HUD.text,
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {upgrade.name}
                              </span>
                              <span style={{
                                fontFamily: FONT_BODY,
                                fontSize: FS.overline,
                                color: 'var(--hud-accent)',
                                opacity: 0.6,
                                flexShrink: 0,
                              }}>
                                ×{upgrade.purchasedRanks}
                              </span>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2.2: Run build to verify no type errors**

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run build
```

Expected: exit 0. If type errors appear, fix before continuing — do not skip.

---

## Task 3: Token Compliance Self-Audit

**Files:**
- Read: `src/components/force-check/steps/SelectPowerStep.tsx`

- [ ] **Step 3.1: Scan every inline style prop in the new file**

Check each item in this checklist against the new file:

- [ ] Font sizes — all use `FS.*` tokens. Zero raw px/rem. (Exception: none)
- [ ] Spacing — all padding/margin/gap use `SP[N]` tokens or approved px exceptions with comments
- [ ] Colours — all use `var(--hud-*)` or `color-mix()`. Zero raw hex or rgba
- [ ] Transitions — all use `` `... ${EASE.*}` ``. Zero raw `'200ms'` strings
- [ ] Border radius — all use `RADIUS.*`. Zero raw numbers (except `RADIUS.full` which is `'50%'`)
- [ ] Font family — all use `FONT_BODY` or `FONT_DISPLAY` constants. Zero `'var(--font-*)'` string literals
- [ ] No `onMouseEnter`/`onMouseLeave` style mutations

Fix any failures before proceeding.

---

## Task 4: Visual Verification + Commit

- [ ] **Step 4.1: Open the app and navigate to a Force Check**

Start the dev server if not already running:

```bash
cd C:/Projects/Holocron/star-wars-rpg && npm run dev
```

Open the app in the browser. Select a character with Force powers and open a Force Check.

- [ ] **Step 4.2: Verify accordion behavior**

Work through each scenario manually:

| Scenario | Expected |
|---|---|
| Open Force Check — Step 1 | All power cards show name only. No descriptions visible. |
| Click an unselected card | Card expands (full description + "Purchased Upgrades" section visible). Chevron rotates 180°. Card gets 2px cyan border. |
| Click the expanded card again | Card collapses. Chevron rotates back. Border stays cyan (still selected). |
| Click a different card | Previous card collapses. New card expands and gets cyan border. |
| Hover an upgrade row | Tooltip appears with upgrade name (bold) and description text. `[FO]` tags are not visible. |
| Power with no upgrades | "No upgrades purchased yet." shown in italics. |
| Power with no description | No description block rendered (no blank gap). |

- [ ] **Step 4.3: Verify under all three themes**

Cycle through Kyber Archive (cyan), Ember Tatooine (red), and neutral themes. The accordion border, background tints, and upgrade dots should all shift with the theme accent — no hardcoded cyan visible in the other themes.

- [ ] **Step 4.4: Commit**

```bash
cd C:/Projects/Holocron/star-wars-rpg && git add src/components/force-check/steps/SelectPowerStep.tsx && git commit -m "feat(force-check): accordion expand/collapse for power selection with upgrade tooltips"
```
