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
      setExpandedKey(null)                  // selected+expanded → collapse only
    } else if (powerKey === selectedPowerKey) {
      setExpandedKey(powerKey)              // selected+collapsed → re-expand, no onSelect
    } else {
      onSelect(powerKey)                    // unselected → select + expand
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
            const basicAbility = p.abilities.find(a => a.name.toLowerCase().includes('basic power'))
            const desc         = basicAbility?.description ? stripBBCode(basicAbility.description) : ''
            const upgrades     = p.abilities.filter(a => a.purchasedRanks > 0 && !a.name.toLowerCase().includes('basic power'))

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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
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
                                width: '5px', height: '5px', /* decorative dot — px intentional */
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
                              {upgrade.pip_cost > 0 && (
                                <span style={{
                                  fontFamily: FONT_BODY,
                                  fontSize: FS.overline,
                                  color: 'color-mix(in srgb, var(--die-force) 70%, transparent)',
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap',
                                }}>
                                  {upgrade.pip_cost} <i className="ffi ffi-swrpg-force" aria-hidden="true" />
                                </span>
                              )}
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
