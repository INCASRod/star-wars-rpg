'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ForceRollResult } from '@/lib/forceRoll'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { rollForceDice } from '@/components/player-hud/dice-engine'
import { DiceFace } from '@/components/dice/DiceFace'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'
import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'

// fallen/dark-side Force mechanic colours — pre-approved exception
const LIGHT_COLOR = '#E8E8FF'
const DARK_COLOR  = 'rgba(80,40,120,0.9)'  /* fallen/dark-side Force mechanic colour — pre-approved exception */
const DARK_BORDER = '#6060A0'               /* fallen/dark-side Force mechanic colour — pre-approved exception */

interface RollForceDiceStepProps {
  forceRating:       number
  committedForce:    number
  result:            ForceRollResult | null
  isDathomiri:       boolean
  /** When true, dark pips are free and light pips carry the consequence cost. */
  isFallen?:         boolean
  onRoll:            (result: ForceRollResult) => void
  selectedPower:     ForcePowerDisplay | null
  onCommit:          (powerKey: string, powerName: string, effectName: string) => void
  onUpgradeActivate: (upgradeName: string) => void
}

function ForceDieFace({ die }: { die: { light: number; dark: number } }) {
  const empty = die.light === 0 && die.dark === 0
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 6, /* decorative die geometry — px intentional */
      background: 'color-mix(in srgb, var(--die-force) 6%, transparent)',
      border: `1.5px solid color-mix(in srgb, var(--die-force) 30%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, flexShrink: 0, /* decorative die geometry — px intentional */
    }}>
      {empty && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>—</span>
      )}
      {die.light > 0 && (
        <div style={{ display: 'flex', gap: 2 /* decorative die geometry — px intentional */ }}>
          {Array.from({ length: die.light }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%', /* decorative die geometry — px intentional */
              background: LIGHT_COLOR, /* fallen/dark-side Force mechanic colour — pre-approved exception */
              boxShadow: `0 0 4px ${LIGHT_COLOR}80`,
            }} />
          ))}
        </div>
      )}
      {die.dark > 0 && (
        <div style={{ display: 'flex', gap: 2 /* decorative die geometry — px intentional */ }}>
          {Array.from({ length: die.dark }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%', /* decorative die geometry — px intentional */
              background: DARK_COLOR, /* fallen/dark-side Force mechanic colour — pre-approved exception */
              border: `1px solid ${DARK_BORDER}`, /* fallen/dark-side Force mechanic colour — pre-approved exception */
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

export function RollForceDiceStep({
  forceRating, committedForce, result, isDathomiri, isFallen = false, onRoll,
  selectedPower, onCommit, onUpgradeActivate,
}: RollForceDiceStepProps) {
  const available = Math.max(0, forceRating - committedForce)

  // ── Pip spending state ──────────────────────────────────────────────────────
  const [spentUpgrades, setSpentUpgrades] = useState<Set<string>>(new Set())
  const [lightPipsLeft, setLightPipsLeft] = useState(0)
  const [darkPipsLeft,  setDarkPipsLeft]  = useState(0)

  useEffect(() => {
    if (result) {
      setLightPipsLeft(result.totalLight)
      setDarkPipsLeft(result.totalDark)
      setSpentUpgrades(new Set())
    }
  }, [result])

  // ── Purchased upgrades with ongoing flag ────────────────────────────────────
  const purchasedUpgrades = useMemo(() => {
    if (!selectedPower) return []
    return selectedPower.abilities
      .filter(a => a.purchasedRanks > 0)
      .map(a => ({
        ...a,
        isOngoing: (a.description ?? '').includes('[FO]'),
      }))
  }, [selectedPower])

  const ongoingUpgrades = purchasedUpgrades.filter(a => a.isOngoing)

  function handleRoll() {
    onRoll(rollForceDice(available))
  }

  function spendPip(upgradeKey: string, upgradeName: string, pipCost: number, useDark = false) {
    if (useDark) {
      if (darkPipsLeft < pipCost) return
      setDarkPipsLeft(p => p - pipCost)
    } else {
      if (lightPipsLeft < pipCost) return
      setLightPipsLeft(p => p - pipCost)
    }
    setSpentUpgrades(prev => new Set([...prev, upgradeKey]))
    onUpgradeActivate(upgradeName)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>
      {/* Pool info */}
      <div>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: FS.overline,
          color: HUD.textDim,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          marginBottom: SP[2],
        }}>
          Your Force Dice Pool
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginBottom: SP[3] }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text }}>
            Force Rating: {forceRating}
          </div>
          {committedForce > 0 && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic' }}>
              ({committedForce} committed to ongoing effects)
            </div>
          )}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text }}>
            Available: {available}
          </div>
        </div>

        {/* Die icons */}
        <div style={{ display: 'flex', gap: SP[2], flexWrap: 'wrap' }}>
          {Array.from({ length: available }).map((_, i) => (
            <DiceFace key={i} type="force" size={36} active={false} />
          ))}
          {available === 0 && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic' }}>
              No Force dice available
            </div>
          )}
        </div>
      </div>

      {/* Roll button / result */}
      {result === null ? (
        <button
          onClick={handleRoll}
          disabled={available === 0}
          style={{
            width: '100%',
            padding: `${SP[2]} 0`,
            borderRadius: RADIUS.md,
            background: available > 0
              ? 'color-mix(in srgb, var(--die-force) 14%, transparent)'
              : 'color-mix(in srgb, var(--die-force) 4%, transparent)',
            border: available > 0
              ? `1px solid color-mix(in srgb, var(--die-force) 40%, transparent)`
              : `1px solid color-mix(in srgb, var(--die-force) 18%, transparent)`,
            cursor: available > 0 ? 'pointer' : 'not-allowed',
            fontFamily: FONT_DISPLAY,
            fontSize: FS.sm,
            fontWeight: 700,
            color: available > 0 ? HUD.text : HUD.textFaint,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[2],
            transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
          }}
        >
          <span>✦</span>
          {available === 0
            ? 'No Force Dice Available'
            : `Roll ${available} Force ${available === 1 ? 'Die' : 'Dice'}`}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>
          {/* Section label */}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Result
          </div>

          {/* Individual dice */}
          <div style={{ display: 'flex', gap: SP[2], flexWrap: 'wrap' }}>
            {result.dice.map((die, i) => <ForceDieFace key={i} die={die} />)}
          </div>

          {/* Totals — dark first for fallen characters */}
          <div style={{ display: 'flex', gap: SP[2], flexDirection: isFallen ? 'row-reverse' : 'row' }}>
            {/* Light pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: `${SP[2]} ${SP[2]}`,
              background: 'color-mix(in srgb, var(--die-force) 8%, transparent)',
              border: `1px solid color-mix(in srgb, var(--die-force) 30%, transparent)`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{ display: 'flex', gap: SP[1], justifyContent: 'center', marginBottom: SP[1], flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalLight }).map((_, i) => (
                  <div key={i} style={{
                    width: '0.6875rem', height: '0.6875rem', /* pip dot — rem equivalent of 11px */
                    borderRadius: '50%',
                    background: isFallen
                      ? LIGHT_COLOR /* fallen: light pips are costly — pre-approved exception */
                      : 'color-mix(in srgb, var(--die-force) 80%, transparent)',
                    boxShadow: isFallen
                      ? `0 0 4px ${LIGHT_COLOR}`
                      : `0 0 4px color-mix(in srgb, var(--die-force) 50%, transparent)`,
                  }} />
                ))}
                {result.totalLight === 0 && (
                  <span style={{ fontFamily: FONT_BODY, color: 'color-mix(in srgb, var(--die-force) 20%, transparent)', fontSize: FS.caption }}>—</span>
                )}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: isFallen ? LIGHT_COLOR : 'var(--die-force)', lineHeight: 1 }}>
                {result.totalLight}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `color-mix(in srgb, var(--die-force) 50%, transparent)`, marginTop: SP[1] }}>
                Light ○{isFallen ? ' (cost)' : ''}
              </div>
            </div>

            {/* Dark pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: `${SP[2]} ${SP[2]}`,
              background: isFallen
                ? 'rgba(139,43,226,0.1)' /* fallen/dark-side Force mechanic colour — pre-approved exception */
                : 'color-mix(in srgb, var(--state-activated) 6%, transparent)',
              border: isFallen
                ? `1px solid rgba(139,43,226,0.35)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                : `1px solid color-mix(in srgb, var(--state-activated) 25%, transparent)`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{ display: 'flex', gap: SP[1], justifyContent: 'center', marginBottom: SP[1], flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalDark }).map((_, i) => (
                  <div key={i} style={{
                    width: '0.6875rem', height: '0.6875rem', /* pip dot — rem equivalent of 11px */
                    borderRadius: '50%',
                    background: isFallen
                      ? '#8B2BE2' /* fallen/dark-side Force mechanic colour — pre-approved exception */
                      : 'color-mix(in srgb, var(--state-activated) 80%, transparent)',
                    border: isFallen
                      ? `1px solid rgba(139,43,226,0.8)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                      : `1px solid color-mix(in srgb, var(--state-activated) 50%, transparent)`,
                  }} />
                ))}
                {result.totalDark === 0 && (
                  <span style={{ fontFamily: FONT_BODY, color: isFallen ? 'rgba(139,43,226,0.3)' /* fallen — pre-approved exception */ : 'color-mix(in srgb, var(--state-activated) 20%, transparent)', fontSize: FS.caption }}>—</span>
                )}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: isFallen ? '#8B2BE2' /* fallen — pre-approved exception */ : DARK_BORDER, lineHeight: 1 }}>
                {result.totalDark}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isFallen ? 'rgba(139,43,226,0.7)' /* fallen — pre-approved exception */ : 'color-mix(in srgb, var(--state-activated) 60%, transparent)', marginTop: SP[1] }}>
                Dark ●{isFallen ? ' (free)' : ''}
              </div>
            </div>
          </div>

          {/* ── Available pips ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {/* Light pips row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${SP[1]} ${SP[2]}`,
              background: 'color-mix(in srgb, var(--die-force) 6%, transparent)',
              border: '1px solid color-mix(in srgb, var(--die-force) 20%, transparent)',
              borderRadius: RADIUS.md,
            }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
                Light <i className="ffi ffi-swrpg-force" aria-hidden="true" style={{ color: 'var(--die-force)' }} /> available
              </span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--die-force)' }}>
                {lightPipsLeft}
              </span>
            </div>

            {/* Dark pips row — only if > 0 */}
            {darkPipsLeft > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${SP[1]} ${SP[2]}`,
                background: 'rgba(139,43,226,0.06)', /* Force mechanic colour — pre-approved exception */
                border: '1px solid rgba(139,43,226,0.25)', /* Force mechanic colour — pre-approved exception */
                borderRadius: RADIUS.md,
              }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
                  Dark <i className="ffi ffi-swrpg-force" aria-hidden="true" style={{ color: '#9B6AE8' /* Force mechanic colour — pre-approved exception */ }} /> available
                </span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: '#9B6AE8' /* Force mechanic colour — pre-approved exception */ }}>
                  {darkPipsLeft}
                </span>
              </div>
            )}

            {/* Dark pip warning */}
            {darkPipsLeft > 0 && !isDathomiri && !isFallen && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(139,43,226,0.7)' /* Force mechanic colour — pre-approved exception */, fontStyle: 'italic', lineHeight: 1.4 }}>
                Using dark <i className="ffi ffi-swrpg-force" aria-hidden="true" />: flip a Destiny Point + suffer strain equal to <i className="ffi ffi-swrpg-force" aria-hidden="true" /> used.
              </div>
            )}

            {/* Dathomiri note */}
            {isDathomiri && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'color-mix(in srgb, var(--die-force) 60%, transparent)', fontStyle: 'italic', lineHeight: 1.4 }}>
                Dathomiri: Light and Dark <i className="ffi ffi-swrpg-force" aria-hidden="true" /> used freely — no penalty.
              </div>
            )}
          </div>

          {/* Divider before upgrades */}
          {purchasedUpgrades.length > 0 && (
            <div style={{ height: 1, background: 'color-mix(in srgb, var(--hud-border) 60%, transparent)' }} />
          )}

          {/* ── Spend Pips — Upgrades ──────────────────────────────────────────── */}
          {purchasedUpgrades.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: `calc(${SP[1]} - ${SP[3]})` }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Spend <i className="ffi ffi-swrpg-force" aria-hidden="true" /> — {selectedPower?.powerName} Upgrades
              </div>
              {purchasedUpgrades.map(upgrade => {
                const spent    = spentUpgrades.has(upgrade.key)
                const canLight = lightPipsLeft >= upgrade.pip_cost
                const canDark  = darkPipsLeft >= upgrade.pip_cost && !isDathomiri
                const tipContent = (
                  <>
                    <TipLabel>{upgrade.name}</TipLabel>
                    {upgrade.description
                      ? <TipBody><RichText text={upgrade.description.replace(/\[FO\]/g, '').trim()} /></TipBody>
                      : <TipBody><em>No description available.</em></TipBody>}
                  </>
                )
                return (
                  <Tooltip key={upgrade.key} content={tipContent} placement="top" maxWidth={300}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SP[2],
                    padding: `2px ${SP[2]}`, /* 2px vertical — px intentional, tightest readable row height */
                    border: `1px solid var(--hud-border)`,
                    borderRadius: RADIUS.sm,
                    background: 'transparent',
                    opacity: spent ? 0.7 : 1,
                    transition: `opacity ${EASE.quick}`,
                  }}>
                    <span style={{
                      fontFamily: FONT_BODY,
                      fontSize: FS.caption,
                      fontWeight: 600,
                      color: 'var(--hud-text)',
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
                      color: 'color-mix(in srgb, var(--die-force) 60%, transparent)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}>
                      {upgrade.pip_cost} <i className="ffi ffi-swrpg-force" aria-hidden="true" />
                    </span>

                    {spent ? (
                      <button disabled style={{
                        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                        padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                        background: 'color-mix(in srgb, var(--die-force) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--die-force) 15%, transparent)',
                        color: 'color-mix(in srgb, var(--die-force) 40%, transparent)',
                        cursor: 'not-allowed',
                      }}>
                        Spent ✓
                      </button>
                    ) : isDathomiri ? (
                      (canLight || canDark) ? (
                        <button
                          onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, !canLight && canDark)}
                          style={{
                            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                            padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                            background: 'color-mix(in srgb, var(--die-force) 12%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--die-force) 35%, transparent)',
                            color: 'var(--die-force)', cursor: 'pointer',
                            transition: `background ${EASE.quick}`,
                          }}
                        >
                          Spend ✦
                        </button>
                      ) : null
                    ) : canLight ? (
                      <button
                        onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, false)}
                        style={{
                          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                          padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                          background: 'color-mix(in srgb, var(--die-force) 12%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--die-force) 35%, transparent)',
                          color: 'var(--die-force)', cursor: 'pointer',
                          transition: `background ${EASE.quick}`,
                        }}
                      >
                        Spend ✦
                      </button>
                    ) : canDark ? (
                      <button
                        onClick={() => spendPip(upgrade.key, upgrade.name, upgrade.pip_cost, true)}
                        style={{
                          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                          padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                          background: 'rgba(139,43,226,0.10)', /* Force mechanic colour — pre-approved exception */
                          border: '1px solid rgba(139,43,226,0.30)', /* Force mechanic colour — pre-approved exception */
                          color: '#9B6AE8', /* Force mechanic colour — pre-approved exception */
                          cursor: 'pointer',
                          transition: `background ${EASE.quick}`,
                        }}
                      >
                        Use Dark
                      </button>
                    ) : null}
                  </div>
                  </Tooltip>
                )
              })}
            </div>
          )}

          {/* ── Ongoing Effect / Commit Die ────────────────────────────────────── */}
          {ongoingUpgrades.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Ongoing Effects
              </div>
              {ongoingUpgrades.map(upgrade => (
                <div key={upgrade.key} style={{
                  padding: `${SP[2]} ${SP[3]}`,
                  background: 'rgba(139,43,226,0.04)', /* Force mechanic colour — pre-approved exception */
                  border: '1px solid rgba(139,43,226,0.2)', /* Force mechanic colour — pre-approved exception */
                  borderRadius: RADIUS.md,
                  display: 'flex', flexDirection: 'column', gap: SP[2],
                }}>
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    color: 'rgba(139,43,226,0.7)', /* Force mechanic colour — pre-approved exception */
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    ⊙ Ongoing Effect
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, fontWeight: 600 }}>
                    {upgrade.name}
                  </div>
                  {upgrade.description && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, fontStyle: 'italic', lineHeight: 1.4 }}>
                      {upgrade.description.slice(0, 60)}{upgrade.description.length > 60 ? '…' : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[2] }}>
                    <button
                      onClick={() => selectedPower && onCommit(
                        selectedPower.powerKey,
                        selectedPower.powerName,
                        upgrade.name,
                      )}
                      disabled={available <= 0}
                      style={{
                        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                        padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                        background: available > 0
                          ? 'rgba(139,43,226,0.12)' /* Force mechanic colour — pre-approved exception */
                          : 'rgba(139,43,226,0.04)', /* Force mechanic colour — pre-approved exception */
                        border: available > 0
                          ? '1px solid rgba(139,43,226,0.35)' /* Force mechanic colour — pre-approved exception */
                          : '1px solid rgba(139,43,226,0.12)', /* Force mechanic colour — pre-approved exception */
                        color: available > 0
                          ? 'rgba(139,43,226,0.85)' /* Force mechanic colour — pre-approved exception */
                          : 'rgba(139,43,226,0.3)', /* Force mechanic colour — pre-approved exception */
                        cursor: available > 0 ? 'pointer' : 'not-allowed',
                        transition: `background ${EASE.quick}`,
                      }}
                    >
                      Commit 1 Die
                    </button>
                    {committedForce > 0 && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(139,43,226,0.6)' /* Force mechanic colour — pre-approved exception */ }}>
                        {committedForce} committed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zero warning — inverted for fallen characters */}
          {!isFallen && !isDathomiri && result.totalLight === 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)', lineHeight: 1.45 }}>
                ⚠ No Light Side <i className="ffi ffi-swrpg-force" aria-hidden="true" style={{ color: 'var(--die-force)' }} /> generated. Spend Dark Side <i className="ffi ffi-swrpg-force" aria-hidden="true" style={{ color: '#9B6AE8' /* Force mechanic colour — pre-approved exception */ }} /> to activate — flip a Destiny Point and suffer strain equal to <i className="ffi ffi-swrpg-force" aria-hidden="true" /> used.
              </div>
            </div>
          )}
          {isFallen && result.totalDark === 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)', lineHeight: 1.45 }}>
                ⚠ No dark side Force Points generated. The power activates but has no effect. You may still use light side <i className="ffi ffi-swrpg-force" aria-hidden="true" style={{ color: 'var(--die-force)' }} />.
              </div>
            </div>
          )}

          {/* Consequence warning */}
          {!isFallen && result.totalDark > 0 && !isDathomiri && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'rgba(224,58,30,0.07)', border: '1px solid rgba(224,58,30,0.22)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'rgba(224,58,30,0.85)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ⚠ Dark side Force Points available. Using them has consequences. See next step.
              </div>
            </div>
          )}
          {isFallen && result.totalLight > 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: `color-mix(in srgb, var(--die-force) 5%, transparent)`, border: `1px solid color-mix(in srgb, var(--die-force) 20%, transparent)`, borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'color-mix(in srgb, var(--die-force) 70%, transparent)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ✦ Light side Force Points available. Using them costs Destiny + strain. See next step.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
