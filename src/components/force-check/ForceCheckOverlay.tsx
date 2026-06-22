'use client'

import { useState, useEffect, useMemo } from 'react'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS, Z } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { ForceRollResult } from '@/lib/forceRoll'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { AdversaryInstance } from '@/lib/adversaries'
import { rollForceDice } from '@/components/player-hud/dice-engine'

export interface ForceCheckOverlayProps {
  open:            boolean
  onClose:         () => void
  character:       Character
  forceRating:     number
  committedForce:  number
  forcePowers:     ForcePowerDisplay[]
  isDathomiri:     boolean
  isCombat:        boolean
  campaignId:      string | null
  characterId:     string
  encounterId?:    string | null
  visibleEnemies?: AdversaryInstance[]
}

// ── Section badge ─────────────────────────────────────────────────────────────
function SectionBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: 18, height: 18, /* section badge — px intentional, fixed indicator */
      borderRadius: '50%',
      border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 45%, transparent)`,
      background: `color-mix(in srgb, var(--hud-accent-purple) 10%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT_DISPLAY,
        fontSize: '10px', /* badge number — px intentional */
        fontWeight: 700,
        color: `color-mix(in srgb, var(--hud-accent-purple) 80%, transparent)`,
        lineHeight: 1,
      }}>{n}</span>
    </div>
  )
}

// ── Force pip circle ──────────────────────────────────────────────────────────
function PipCircle({ spent, dark }: { spent: boolean; dark?: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, /* pip circle — px intentional, die-identity display */
      borderRadius: '50%',
      border: `1.5px solid color-mix(in srgb, var(--hud-accent-purple) ${spent ? (dark ? 70 : 80) : 30}%, transparent)`,
      background: spent
        ? dark
          ? 'color-mix(in srgb, var(--hud-accent-purple) 90%, black)'
          : 'color-mix(in srgb, var(--hud-accent-purple) 55%, white)'
        : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {spent && (
        <span style={{
          fontSize: '9px', /* pip checkmark — px intentional */
          fontWeight: 700,
          color: 'color-mix(in srgb, black 75%, transparent)',
          lineHeight: 1,
        }}>✓</span>
      )}
    </div>
  )
}

// ── Main overlay ──────────────────────────────────────────────────────────────
export function ForceCheckOverlay({
  open, onClose,
  character, forceRating, committedForce,
  forcePowers, isDathomiri, isCombat,
  campaignId, characterId,
  encounterId: propEncounterId,
}: ForceCheckOverlayProps) {
  const [selectedPowerKey, setSelectedPowerKey] = useState<string | null>(null)
  const [forceRoll, setForceRoll] = useState<ForceRollResult | null>(null)
  // Map<upgradeKey, useDark: boolean>
  const [spentMap, setSpentMap]   = useState<Map<string, boolean>>(new Map())
  const [busy, setBusy]           = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedPowerKey(null)
      setForceRoll(null)
      setSpentMap(new Map())
      setBusy(false)
    }
  }, [open])

  const isFallen  = character.is_dark_side_fallen === true
  const available = Math.max(0, forceRating - committedForce)
  const purchased = useMemo(() => forcePowers.filter(p => p.purchasedCount > 0), [forcePowers])
  const selPower  = purchased.find(p => p.powerKey === selectedPowerKey) ?? null

  const upgrades = useMemo(() => {
    if (!selPower) return []
    return selPower.abilities.filter(a => a.purchasedRanks > 0)
  }, [selPower])

  // ── Pip accounting ────────────────────────────────────────────────────────
  const { lightUsed, darkUsed } = useMemo(() => {
    let lU = 0, dU = 0
    for (const [key, useDark] of spentMap) {
      const u = upgrades.find(u => u.key === key)
      if (u) { useDark ? (dU += u.pip_cost) : (lU += u.pip_cost) }
    }
    return { lightUsed: lU, darkUsed: dU }
  }, [spentMap, upgrades])

  const lightTotal = forceRoll?.totalLight ?? 0
  const darkTotal  = forceRoll?.totalDark  ?? 0
  const lightAvail = lightTotal - lightUsed
  const darkAvail  = darkTotal  - darkUsed

  // ── Roll ──────────────────────────────────────────────────────────────────
  function handleRoll() {
    setForceRoll(rollForceDice(available))
    setSpentMap(new Map())
  }

  // ── Toggle upgrade spend ──────────────────────────────────────────────────
  function toggleUpgrade(key: string, cost: number) {
    const currentUpgrades = upgrades
    const currentRoll     = forceRoll
    setSpentMap(prev => {
      const next = new Map(prev)
      if (next.has(key)) { next.delete(key); return next }
      // Recalculate availability from prev (stable reference)
      let lU = 0, dU = 0
      for (const [k, useDark] of prev) {
        const u = currentUpgrades.find(u => u.key === k)
        if (u) { useDark ? (dU += u.pip_cost) : (lU += u.pip_cost) }
      }
      const lAvail = (currentRoll?.totalLight ?? 0) - lU
      const dAvail = (currentRoll?.totalDark  ?? 0) - dU
      if (lAvail >= cost)                                          { next.set(key, false) }
      else if (!isDathomiri && dAvail >= cost)                     { next.set(key, true) }
      else if (isDathomiri && lAvail + dAvail >= cost)             { next.set(key, false) }
      else                                                          { return prev }
      return next
    })
  }

  // ── Channel the Force ─────────────────────────────────────────────────────
  async function handleChannelForce() {
    if (!selPower || !forceRoll || busy) return
    setBusy(true)
    try {
      const sb = campaignId ? createClient() : null
      if (darkUsed > 0 && sb && campaignId) {
        await sb.from('force_notifications').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name, type: 'dark_side_use',
          dark_pips_used: darkUsed, power_name: selPower.powerName,
          strain_cost: darkUsed, status: 'pending',
        })
      }
      if (sb && campaignId) {
        let encId: string | null = propEncounterId ?? null
        if (!encId && isCombat) {
          const { data } = await sb.from('combat_encounters')
            .select('id').eq('campaign_id', campaignId)
            .eq('is_active', true).limit(1).single()
          encId = data?.id ?? null
        }
        const freeFP  = isFallen ? forceRoll.totalDark : forceRoll.totalLight
        const totalFP = freeFP + darkUsed
        await sb.from('combat_log').insert({
          campaign_id: campaignId, encounter_id: encId,
          participant_name: character.name, alignment: 'player',
          roll_type: 'force power', weapon_name: selPower.powerName,
          dice_pool: { force: available },
          result: { totalLight: forceRoll.totalLight, totalDark: forceRoll.totalDark, darkPipsUsed: darkUsed, totalFP },
          result_summary: `Force Power: ${selPower.powerName}. ${totalFP} FP`,
          is_visible_to_players: true,
        })
        await sb.from('roll_log').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          roll_label: selPower.powerName,
          pool: { force: available, proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0 },
          result: { netSuccess: forceRoll.totalLight, netAdvantage: forceRoll.totalDark, triumph: darkUsed, despair: 0, succeeded: totalFP > 0 },
          is_dm: false, hidden: false, roll_type: 'force',
          weapon_name: selPower.powerName, target_name: null,
          alignment: 'player', is_visible_to_players: true,
        })
      }
    } catch (_e) { /* non-blocking */ }
    setBusy(false)
    onClose()
  }

  const canChannel = selPower !== null && forceRoll !== null

  return (
    <div
      className={`hud-quick-drawer${open ? ' open' : ''}`}
      style={{
        background: 'var(--hud-surface-hi)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid color-mix(in srgb, var(--hud-accent-purple) 25%, transparent)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        height: 3, /* decorative stripe — px intentional */
        flexShrink: 0,
        background: `linear-gradient(90deg, transparent, var(--hud-accent-purple) 30%, color-mix(in srgb, var(--hud-accent-purple) 60%, white) 70%, transparent)`,
      }} />

      {/* ── Header — centered title ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)', flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--hud-accent-purple)',
          display: 'flex', alignItems: 'center', gap: SP[2],
        }}>
          <span style={{ opacity: 0.7 }}>✦</span>
          Force Check
        </span>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', right: SP[2],
            background: 'none', border: 'none', cursor: 'pointer',
            color: HUD.textFaint, fontSize: FS.sm,
            padding: `0 ${SP[1]}`, lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* ── Body — scrollable ────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        overscrollBehavior: 'contain',
      }}>

        {/* ── Force Pool ─────────────────────────────────────────────────────── */}
        <div style={{ padding: `${SP[3]} ${SP[3]} ${SP[2]}`, display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.18em',
          }}>
            Force Pool
          </div>

          {/* Orb — clickable to roll */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1] }}>
            <button
              onClick={handleRoll}
              disabled={available === 0}
              style={{
                width: 76, height: 76, /* Force Die Orb — px intentional, die-identity display */
                borderRadius: '50%',
                background: `color-mix(in srgb, black 55%, transparent)`,
                border: `2px solid color-mix(in srgb, var(--hud-accent-purple) ${available > 0 ? 50 : 20}%, transparent)`,
                boxShadow: forceRoll
                  ? `0 0 24px color-mix(in srgb, var(--hud-accent-purple) 35%, transparent), inset 0 0 12px color-mix(in srgb, var(--hud-accent-purple) 10%, transparent)`
                  : `0 0 14px color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)`,
                cursor: available > 0 ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: `box-shadow ${EASE.default}, border-color ${EASE.default}`,
              }}
            >
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '30px', /* orb count — px intentional, die-identity display size */
                fontWeight: 900, color: 'white', lineHeight: 1,
              }}>
                {available}
              </span>
            </button>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              color: 'var(--hud-accent-purple)', opacity: 0.55,
              textTransform: 'uppercase', letterSpacing: '0.15em',
            }}>
              Force Dice
            </div>
          </div>

          {/* Pip result row — shown after rolling */}
          {forceRoll && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[3] }}>
              {/* Light side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1] }}>
                <div style={{ display: 'flex', gap: SP[1] }}>
                  {Array.from({ length: lightTotal }).map((_, i) => (
                    <PipCircle key={i} spent={i < lightUsed} dark={false} />
                  ))}
                  {lightTotal === 0 && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>—</span>
                  )}
                </div>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: 'color-mix(in srgb, var(--hud-accent-purple) 55%, transparent)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>Light</span>
              </div>

              <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, opacity: 0.4 }}>→</span>

              {/* Dark side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1] }}>
                <div style={{ display: 'flex', gap: SP[1] }}>
                  {Array.from({ length: darkTotal }).map((_, i) => (
                    <PipCircle key={i} spent={i < darkUsed} dark={true} />
                  ))}
                  {darkTotal === 0 && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>—</span>
                  )}
                </div>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: 'color-mix(in srgb, var(--hud-accent-purple) 40%, transparent)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>Dark</span>
              </div>
            </div>
          )}

          {/* Pre-roll hint */}
          {!forceRoll && (
            <div style={{
              textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint, fontStyle: 'italic',
            }}>
              {available > 0 ? 'Tap the orb to roll' : 'No Force dice available'}
            </div>
          )}

          {committedForce > 0 && (
            <div style={{
              textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint, fontStyle: 'italic',
            }}>
              {committedForce} die committed to ongoing effects
            </div>
          )}
        </div>

        {/* ── Section divider ───────────────────────────────────────────────── */}
        <div style={{ height: 1, background: 'color-mix(in srgb, var(--hud-border) 70%, transparent)', margin: `0 ${SP[3]}` }} />

        {/* ── ① Force Power ────────────────────────────────────────────────── */}
        <div style={{ padding: `${SP[3]} ${SP[3]} ${SP[2]}`, display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <SectionBadge n={1} />
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em',
            }}>Force Power</span>
          </div>

          {purchased.length === 0 ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic', padding: `${SP[2]} 0` }}>
              No Force powers purchased yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {purchased.map(p => {
                const sel = p.powerKey === selectedPowerKey
                const allUpgrades     = p.abilities.filter(a => a.purchasedRanks > 0)
                const activatedCount  = sel ? allUpgrades.filter(u => spentMap.has(u.key)).length : 0
                const totalCount      = allUpgrades.length

                return (
                  <button
                    key={p.powerKey}
                    onClick={() => {
                      setSelectedPowerKey(prev => prev === p.powerKey ? null : p.powerKey)
                      setSpentMap(new Map())
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: SP[2],
                      padding: `${SP[2]} ${SP[3]}`,
                      background: sel
                        ? 'color-mix(in srgb, var(--hud-accent-purple) 8%, transparent)'
                        : 'color-mix(in srgb, var(--hud-accent-purple) 2%, transparent)',
                      border: sel
                        ? `1px solid color-mix(in srgb, var(--hud-accent-purple) 38%, transparent)`
                        : `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)`,
                      borderLeft: sel
                        ? `2px solid var(--hud-accent-purple)`
                        : `2px solid transparent`,
                      borderRadius: RADIUS.md,
                      cursor: 'pointer', textAlign: 'left',
                      transition: `all ${EASE.quick}`,
                    }}
                  >
                    <span style={{
                      color: sel ? 'var(--hud-accent-purple)' : HUD.textDim,
                      fontSize: FS.label, flexShrink: 0,
                      transition: `color ${EASE.quick}`,
                    }}>◇</span>
                    <span style={{
                      fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
                      color: HUD.text, flex: 1,
                    }}>
                      {p.powerName}
                    </span>
                    {/* Upgrade dot indicators */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}> {/* 4px — px intentional, tight dot gap */}
                      {Array.from({ length: totalCount }).map((_, i) => (
                        <div key={i} style={{
                          width: 8, height: 8, /* upgrade dot — px intentional, small indicator */
                          borderRadius: '50%',
                          background: i < activatedCount
                            ? 'var(--hud-accent-purple)'
                            : 'transparent',
                          border: `1px solid color-mix(in srgb, var(--hud-accent-purple) ${sel ? 55 : 30}%, transparent)`,
                        }} />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Section divider ───────────────────────────────────────────────── */}
        <div style={{ height: 1, background: 'color-mix(in srgb, var(--hud-border) 70%, transparent)', margin: `0 ${SP[3]}` }} />

        {/* ── ② Spend Pips ─────────────────────────────────────────────────── */}
        <div style={{ padding: `${SP[3]} ${SP[3]}`, display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <SectionBadge n={2} />
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em',
            }}>Spend Pips</span>
          </div>

          {!selPower && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic', padding: `${SP[1]} 0` }}>
              Select a Force power above.
            </div>
          )}
          {selPower && !forceRoll && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic', padding: `${SP[1]} 0` }}>
              Roll Force dice first.
            </div>
          )}

          {selPower && forceRoll && upgrades.length === 0 && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic', padding: `${SP[1]} 0` }}>
              No upgrades purchased for this power.
            </div>
          )}

          {selPower && forceRoll && upgrades.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {upgrades.map(upgrade => {
                const spent = spentMap.has(upgrade.key)
                const useDark = spentMap.get(upgrade.key) ?? false
                const canAfford = lightAvail >= upgrade.pip_cost || (!isDathomiri && darkAvail >= upgrade.pip_cost)
                const isDisabled = !spent && !canAfford
                // Badge color: show which pool will be used
                const willUseDark = !spent && lightAvail < upgrade.pip_cost && !isDathomiri

                return (
                  <button
                    key={upgrade.key}
                    onClick={() => toggleUpgrade(upgrade.key, upgrade.pip_cost)}
                    disabled={isDisabled}
                    style={{
                      display: 'flex', alignItems: 'center', gap: SP[2],
                      padding: `${SP[2]} ${SP[2]}`,
                      background: spent
                        ? 'color-mix(in srgb, var(--hud-accent-purple) 7%, transparent)'
                        : 'color-mix(in srgb, var(--hud-accent-purple) 2%, transparent)',
                      border: `1px solid color-mix(in srgb, var(--hud-accent-purple) ${spent ? 30 : isDisabled ? 8 : 14}%, transparent)`,
                      borderRadius: RADIUS.md,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.4 : 1,
                      textAlign: 'left',
                      transition: `all ${EASE.quick}`,
                    }}
                  >
                    {/* Pip cost badge */}
                    <div style={{
                      width: 24, height: 24, /* pip badge — px intentional, fixed indicator */
                      borderRadius: RADIUS.sm,
                      background: spent
                        ? (useDark
                          ? 'color-mix(in srgb, var(--hud-accent-purple) 60%, black)'
                          : 'color-mix(in srgb, var(--hud-accent-purple) 50%, white)')
                        : willUseDark
                          ? 'color-mix(in srgb, var(--hud-accent-purple) 35%, black)'
                          : 'color-mix(in srgb, var(--hud-accent-purple) 35%, white)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: '9px', /* badge label — px intentional */
                        fontWeight: 700,
                        color: 'color-mix(in srgb, black 70%, transparent)',
                        lineHeight: 1,
                      }}>
                        {upgrade.pip_cost}{(spent ? useDark : willUseDark) ? 'D' : 'L'}
                      </span>
                    </div>
                    {/* Upgrade name */}
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.caption,
                      color: spent ? HUD.text : isDisabled ? HUD.textFaint : HUD.textDim,
                      flex: 1, lineHeight: 1.35,
                      overflow: 'hidden',
                      display: '-webkit-box' as React.CSSProperties['display'],
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
                    }}>
                      {upgrade.name}
                    </span>
                    {/* Checkmark */}
                    {spent && (
                      <span style={{
                        fontFamily: FONT_BODY, fontSize: FS.label,
                        color: 'var(--hud-accent-purple)', flexShrink: 0,
                      }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Dark side consequence notice */}
          {darkUsed > 0 && (
            <div style={{
              padding: `${SP[1]} ${SP[2]}`,
              background: 'color-mix(in srgb, var(--hud-accent-purple) 5%, transparent)',
              border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 20%, transparent)`,
              borderLeft: `2px solid var(--hud-accent-purple)`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: 'color-mix(in srgb, var(--hud-accent-purple) 70%, transparent)',
                lineHeight: 1.4,
              }}>
                Using {darkUsed} dark pip{darkUsed !== 1 ? 's' : ''}: flip 1 Destiny Point + suffer {darkUsed} strain.
              </div>
            </div>
          )}
        </div>

      </div>{/* end body */}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{
        padding: `${SP[2]} ${SP[3]} ${SP[3]}`,
        borderTop: `1px solid color-mix(in srgb, var(--hud-accent-purple) 18%, transparent)`,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: SP[1],
      }}>
        <button
          onClick={handleChannelForce}
          disabled={!canChannel || busy}
          style={{
            width: '100%',
            padding: `${SP[3]} 0`,
            clipPath: `polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)`, /* decorative clip-path corners — px intentional */
            border: canChannel && !busy
              ? `1px solid color-mix(in srgb, var(--hud-accent-purple) 70%, transparent)`
              : `1px solid color-mix(in srgb, var(--hud-accent-purple) 20%, transparent)`,
            background: canChannel && !busy
              ? 'color-mix(in srgb, var(--hud-accent-purple) 15%, transparent)'
              : 'color-mix(in srgb, var(--hud-accent-purple) 5%, transparent)',
            cursor: canChannel && !busy ? 'pointer' : 'not-allowed',
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: canChannel && !busy ? 'var(--hud-accent-purple)' : HUD.textFaint,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[2],
            transition: `all ${EASE.default}`,
          }}
        >
          {busy ? '…' : (
            <>
              <span style={{ opacity: 0.7 }}>✦</span>
              Channel the Force
            </>
          )}
        </button>
        <div style={{
          textAlign: 'center',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em',
        }}>
          Spending {lightUsed} Light{darkUsed > 0 ? ` · ${darkUsed} Dark` : ' · 0 Dark'}
        </div>
      </div>

      {/* Scanline texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, black 3%, transparent) 2px, color-mix(in srgb, black 3%, transparent) 4px)`,
        zIndex: Z.raised,
      }} />
    </div>
  )
}
