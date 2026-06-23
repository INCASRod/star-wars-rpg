'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS, Z } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { ForceRollResult, ForceDie } from '@/lib/forceRoll'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { AdversaryInstance } from '@/lib/adversaries'
import { rollForceDice } from '@/components/player-hud/dice-engine'
import { RichText } from '@/components/ui/RichText'

type RollPhase = 'idle' | 'tumble' | 'reveal' | 'done'

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
function PipCircle({ spent, dark, index = 0 }: { spent: boolean; dark?: boolean; index?: number }) {
  return (
    <div style={{
      width: 18, height: 18, /* pip circle — px intentional, die-identity display */
      borderRadius: '50%',
      border: spent
        ? `1.5px solid color-mix(in srgb, var(--hud-accent-purple) ${dark ? 45 : 65}%, transparent)`
        : `1.5px solid color-mix(in srgb, var(--hud-accent-purple) 30%, transparent)`,
      background: spent
        ? dark
          ? `color-mix(in srgb, black 90%, var(--hud-accent-purple))` /* dark-side pip */
          : 'white' /* light-side pip — approved game-mechanic colour */
        : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      animationName: spent ? (dark ? 'fco-pip-crackle' : 'fco-pip-pulse') : 'none',
      animationDuration: spent
        ? dark ? '0.75s' : `${1.6 + index * 0.35}s` /* animation timing */
        : '0s',
      animationTimingFunction: spent ? (dark ? 'linear' : 'ease-in-out') : 'linear',
      animationIterationCount: spent ? ('infinite' as const) : 1,
      animationDelay: spent ? `${index * (dark ? 0.18 : 0.25)}s` : '0s', /* stagger — animation timing */
    }}>
      {spent && (
        <span style={{
          fontSize: '9px', /* pip checkmark — px intentional */
          fontWeight: 700,
          color: dark
            ? `color-mix(in srgb, var(--hud-accent-purple) 65%, white)`
            : `color-mix(in srgb, black 70%, var(--hud-accent-purple))`,
          lineHeight: 1,
        }}>✓</span>
      )}
    </div>
  )
}

// ── Force die reveal face ─────────────────────────────────────────────────────
const OCTAGON_CLIP = 'polygon(28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%, 0% 28%)'

function ForceDieRevealFace({
  die, revealed, index,
}: {
  die: ForceDie
  revealed: boolean
  index: number
}) {
  const empty = die.light === 0 && die.dark === 0
  return (
    // Glow wrapper — no clip-path; filter:drop-shadow follows the octagon child's painted pixels
    <div style={{
      display: 'inline-flex', flexShrink: 0,
      filter: revealed
        ? `drop-shadow(0 0 7px color-mix(in srgb, var(--hud-accent-purple) 55%, transparent))`
        : 'none',
    }}>
      {/* Animation + border layer — clipped to octagon; corners are cleanly cut */}
      <div style={{
        width: 44, height: 44, /* die cell — px intentional, die-identity display */
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        clipPath: OCTAGON_CLIP,
        background: revealed
          ? `color-mix(in srgb, var(--hud-accent-purple) 40%, transparent)`
          : `color-mix(in srgb, var(--hud-accent-purple) 22%, transparent)`,
        animationName: revealed ? 'fco-die-bounce' : 'fco-tumble',
        animationDuration: revealed ? '0.4s' : '0.7s', /* animation timing */
        animationTimingFunction: revealed ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'linear',
        animationIterationCount: revealed ? 1 : 'infinite' as const,
        animationFillMode: revealed ? 'both' : 'none',
        animationDelay: revealed ? '0s' : `${index * 0.09}s`, /* stagger tumble start — animation timing */
      }}>
        {/* Fill layer — inset octagon with radial gradient */}
        <div style={{
          width: 41, height: 41, /* inset 1.5px — px intentional, die geometry */
          clipPath: OCTAGON_CLIP,
          background: revealed
            ? `radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--hud-accent-purple) 18%, transparent), color-mix(in srgb, var(--hud-accent-purple) 6%, transparent) 70%)`
            : `color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 3, /* pip gap — px intentional, die geometry */
        }}>
          {revealed && (
            <>
              {empty && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>—</span>
              )}
              {die.light > 0 && (
                <div style={{ display: 'flex', gap: 2 /* pip gap — px intentional */ }}>
                  {Array.from({ length: die.light }).map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, /* light pip — px intentional, die-identity display */
                      borderRadius: RADIUS.full,
                      background: 'white', /* light-side pip — approved game-mechanic colour */
                      animationName: 'fco-pip-pulse',
                      animationDuration: `${1.6 + i * 0.35}s`, /* staggered pulse — animation timing */
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite' as const,
                      animationDelay: `${i * 0.25}s`, /* stagger — animation timing */
                    }} />
                  ))}
                </div>
              )}
              {die.dark > 0 && (
                <div style={{ display: 'flex', gap: 2 /* pip gap — px intentional */ }}>
                  {Array.from({ length: die.dark }).map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, /* dark pip — px intentional, die-identity display */
                      borderRadius: RADIUS.full,
                      background: `color-mix(in srgb, black 90%, var(--hud-accent-purple))`, /* dark-side pip */
                      animationName: 'fco-pip-crackle',
                      animationDuration: '0.75s', /* crackle interval — animation timing */
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite' as const,
                      animationDelay: `${i * 0.18}s`, /* stagger — animation timing */
                    }} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
  const [expandedDetailKey, setExpandedDetailKey]     = useState<string | null>(null)
  const [expandedUpgradeKey, setExpandedUpgradeKey]   = useState<string | null>(null)
  const [rollPhase, setRollPhase]         = useState<RollPhase>('idle')
  const [pendingRoll, setPendingRoll]     = useState<ForceRollResult | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)

  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    timerIds.current.forEach(id => clearTimeout(id))
    timerIds.current = []
  }

  useEffect(() => {
    if (open) {
      clearTimers()
      setSelectedPowerKey(null)
      setForceRoll(null)
      setSpentMap(new Map())
      setBusy(false)
      setExpandedDetailKey(null)
      setExpandedUpgradeKey(null)
      setRollPhase('idle')
      setPendingRoll(null)
      setRevealedCount(0)
    } else {
      clearTimers()
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

  const basicUpgrade     = useMemo(() => upgrades.find(u => u.key.toUpperCase().endsWith('BASIC')) ?? null, [upgrades])
  const nonBasicUpgrades = useMemo(() => upgrades.filter(u => !u.key.toUpperCase().endsWith('BASIC')), [upgrades])

  // Auto-select basic power when roll result arrives or selected power changes
  useEffect(() => {
    if (!forceRoll || !basicUpgrade) return
    const cost = basicUpgrade.pip_cost
    if (cost === 0) {
      setSpentMap(prev => {
        if (prev.has(basicUpgrade.key)) return prev
        const next = new Map(prev)
        next.set(basicUpgrade.key, false)
        return next
      })
      return
    }
    const canAfford = isDathomiri
      ? (forceRoll.totalLight + forceRoll.totalDark) >= cost
      : (forceRoll.totalLight >= cost || forceRoll.totalDark >= cost)
    if (!canAfford) return
    setSpentMap(prev => {
      if (prev.has(basicUpgrade.key)) return prev
      const useDark = !isDathomiri && forceRoll.totalLight < cost
      const next = new Map(prev)
      next.set(basicUpgrade.key, useDark)
      return next
    })
  }, [forceRoll, basicUpgrade, isDathomiri])

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

  const basicIsActivated = basicUpgrade !== null && spentMap.has(basicUpgrade.key)
  const basicUseDark     = basicUpgrade !== null ? (spentMap.get(basicUpgrade.key) ?? false) : false

  // ── Roll — 4-phase animation sequence ────────────────────────────────────────
  function handleRollWithAnimation() {
    if (rollPhase === 'tumble' || rollPhase === 'reveal' || available === 0) return
    const result = rollForceDice(available)
    const diceCount = result.dice.length
    const TUMBLE_MS = 1500  /* tumble phase duration — animation timing */
    const PER_DIE_MS = 220  /* per-die reveal interval — animation timing */

    setPendingRoll(result)
    setForceRoll(null)
    setSpentMap(new Map())
    setRevealedCount(0)
    setRollPhase('tumble')

    // Phase 2: switch to reveal mode, start staggered die reveal
    timerIds.current.push(setTimeout(() => { setRollPhase('reveal') }, TUMBLE_MS))
    for (let i = 0; i < diceCount; i++) {
      timerIds.current.push(setTimeout(() => { setRevealedCount(i + 1) }, TUMBLE_MS + (i + 1) * PER_DIE_MS))
    }
    // Phase 3 + 4: set result, unlock spend section
    timerIds.current.push(setTimeout(() => {
      setForceRoll(result)
      setPendingRoll(null)
      setRollPhase('done')
    }, TUMBLE_MS + diceCount * PER_DIE_MS + 300)) /* +300ms for totals fade — animation timing */
  }

  // ── CTA — rolls if no result yet, commits if roll complete ───────────────────
  function handleCta() {
    if (rollPhase === 'tumble' || rollPhase === 'reveal') return
    if (!forceRoll) {
      handleRollWithAnimation()
    } else {
      handleChannelForce()
    }
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
        const activatedUpgrades = upgrades
          .filter(u => spentMap.has(u.key))
          .map(u => ({ name: u.name, fp_cost: u.pip_cost, is_dark: spentMap.get(u.key) ?? false }))
        await sb.from('force_notifications').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          type: isFallen ? 'dark_side_use' : 'force_use',
          dark_pips_used: darkUsed, power_name: selPower.powerName,
          strain_cost: isDathomiri ? 0 : darkUsed,
          activated_upgrades: activatedUpgrades,
          status: 'pending',
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
    timerIds.current.push(setTimeout(onClose, 1500)) /* hold result on screen — animation timing */
  }

  const canChannel = selPower !== null && forceRoll !== null && spentMap.size > 0
  const isRolling  = rollPhase === 'tumble' || rollPhase === 'reveal'
  const ctaLabel   = isRolling ? 'Channelling…' : 'Channel the Force'
  const ctaActive  = !isRolling && !busy && (forceRoll ? canChannel : available > 0)

  const FCO_STYLES = `
    @keyframes fco-tumble {
      0%   { transform: rotate(0deg)   scale(1.05); }
      25%  { transform: rotate(90deg)  scale(0.92); }
      50%  { transform: rotate(180deg) scale(1.05); }
      75%  { transform: rotate(270deg) scale(0.92); }
      100% { transform: rotate(360deg) scale(1.05); }
    }
    @keyframes fco-die-bounce {
      0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
      55%  { transform: scale(1.15) rotate(4deg);  opacity: 1; }
      75%  { transform: scale(0.92) rotate(-2deg); opacity: 1; }
      100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
    }
    @keyframes fco-totals-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes fco-orb-pulse {
      0%,100% { box-shadow: 0 0 14px color-mix(in srgb, var(--hud-accent-purple) 30%, transparent); }
      50%     { box-shadow: 0 0 32px color-mix(in srgb, var(--hud-accent-purple) 65%, transparent),
                             inset 0 0 14px color-mix(in srgb, var(--hud-accent-purple) 20%, transparent); }
    }
    @keyframes fco-pip-pulse {
      0%, 100% { opacity: 0.85;
                 box-shadow: 0 0 3px 1px white,
                             0 0 8px color-mix(in srgb, var(--hud-accent-purple) 60%, white); }
      50%      { opacity: 1;
                 box-shadow: 0 0 6px 2px white,
                             0 0 16px white,
                             0 0 26px color-mix(in srgb, var(--hud-accent-purple) 70%, white); }
    }
    @keyframes fco-pip-crackle {
      0%, 100% { box-shadow: 0 0 1px color-mix(in srgb, var(--hud-accent-purple) 50%, transparent); }
      20%      { box-shadow:  1px -2px 5px color-mix(in srgb, var(--hud-accent-purple) 95%, white),
                              0   0   3px color-mix(in srgb, var(--hud-accent-purple) 40%, transparent); }
      40%      { box-shadow: 0 0 1px color-mix(in srgb, var(--hud-accent-purple) 25%, transparent); }
      60%      { box-shadow: -2px  1px 5px color-mix(in srgb, var(--hud-accent-purple) 90%, white),
                              1px  0   3px color-mix(in srgb, var(--hud-accent-purple) 55%, transparent); }
      80%      { box-shadow: 0 0 1px color-mix(in srgb, var(--hud-accent-purple) 20%, transparent); }
    }
    @keyframes fco-basic-glow {
      0%, 100% { box-shadow: 0 0 6px color-mix(in srgb, var(--hud-accent-purple) 30%, transparent); }
      50%      { box-shadow: 0 0 18px color-mix(in srgb, var(--hud-accent-purple) 65%, transparent),
                             inset 0 0 8px color-mix(in srgb, var(--hud-accent-purple) 10%, transparent); }
    }
  `

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
      {/* Scoped animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: FCO_STYLES }} />
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
              onClick={handleRollWithAnimation}
              disabled={available === 0 || isRolling}
              style={{
                width: 76, height: 76, /* Force Die Orb — px intentional, die-identity display */
                borderRadius: '50%',
                background: `color-mix(in srgb, black 55%, transparent)`,
                border: isRolling
                  ? `2px solid color-mix(in srgb, var(--hud-accent-purple) 80%, transparent)`
                  : `2px solid color-mix(in srgb, var(--hud-accent-purple) ${available > 0 ? 50 : 20}%, transparent)`,
                boxShadow: forceRoll
                  ? `0 0 24px color-mix(in srgb, var(--hud-accent-purple) 35%, transparent), inset 0 0 12px color-mix(in srgb, var(--hud-accent-purple) 10%, transparent)`
                  : `0 0 14px color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)`,
                animation: isRolling ? `fco-orb-pulse 0.9s ease-in-out infinite` : 'none', /* orb pulse — animation timing */
                cursor: available > 0 && !isRolling ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: `border-color ${EASE.default}`,
              }}
            >
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '30px', /* orb count — px intentional, die-identity display size */
                fontWeight: 900, color: 'white', lineHeight: 1,
                opacity: isRolling ? 0.25 : 1,
                transition: `opacity ${EASE.default}`,
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

          {/* Pip result / animation area */}
          {isRolling && pendingRoll ? (
            /* Phase 1 + 2: tumbling silhouettes → staggered reveal */
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: SP[1], flexWrap: 'wrap', padding: `${SP[1]} 0`,
            }}>
              {pendingRoll.dice.map((die, idx) => (
                <ForceDieRevealFace
                  key={idx}
                  die={die}
                  revealed={rollPhase === 'reveal' && idx < revealedCount}
                  index={idx}
                />
              ))}
            </div>
          ) : forceRoll ? (
            /* Phase 3 + 4: dice faces (all revealed) + pip totals */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[2] }}>
              {/* Dice faces — persist after reveal */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: SP[1], flexWrap: 'wrap',
              }}>
                {forceRoll.dice.map((die, idx) => (
                  <ForceDieRevealFace key={idx} die={die} revealed={true} index={idx} />
                ))}
              </div>
              {/* Pip totals */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[3],
                animation: `fco-totals-in 0.3s ease both`, /* totals appear — animation timing */
              }}>
                {/* Light side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1] }}>
                  <div style={{ display: 'flex', gap: SP[1] }}>
                    {Array.from({ length: lightTotal }).map((_, i) => (
                      <PipCircle key={i} spent={i < lightUsed} dark={false} index={i} />
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
                      <PipCircle key={i} spent={i < darkUsed} dark={true} index={i} />
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
            </div>
          ) : (
            /* Phase 0: pre-roll hint */
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
                const sel             = p.powerKey === selectedPowerKey
                const allUpgrades     = p.abilities.filter(a => a.purchasedRanks > 0)
                const activatedCount  = sel ? allUpgrades.filter(u => spentMap.has(u.key)).length : 0
                const totalCount      = allUpgrades.length
                const detailOpen      = expandedDetailKey === p.powerKey
                const powerDesc       = p.description
                const upgradeDescs    = allUpgrades.filter(a => a.description)
                const hasDetail       = !!(powerDesc || upgradeDescs.length > 0)

                return (
                  <div key={p.powerKey} style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Row: selection button + ⓘ info button */}
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: SP[1] }}>
                      {/* Selection button */}
                      <button
                        onClick={() => {
                          setSelectedPowerKey(prev => prev === p.powerKey ? null : p.powerKey)
                          setSpentMap(new Map())
                        }}
                        style={{
                          flex: 1, minWidth: 0,
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
                          color: HUD.text, flex: 1, minWidth: 0,
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

                      {/* ⓘ Info button — only shown when there is description content */}
                      {hasDetail && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setExpandedDetailKey(prev => prev === p.powerKey ? null : p.powerKey)
                          }}
                          style={{
                            flexShrink: 0,
                            background: detailOpen
                              ? 'color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)'
                              : 'transparent',
                            border: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)`,
                            borderRadius: RADIUS.md,
                            cursor: 'pointer',
                            padding: `0 ${SP[1]}`,
                            fontFamily: FONT_BODY, fontSize: FS.sm,
                            color: detailOpen ? 'var(--hud-accent-purple)' : HUD.textFaint,
                            transition: `all ${EASE.quick}`,
                            lineHeight: 1,
                          }}
                        >
                          ⓘ
                        </button>
                      )}
                    </div>

                    {/* Detail panel */}
                    {detailOpen && (
                      <div style={{
                        padding: `${SP[2]} ${SP[3]}`,
                        background: 'color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)',
                        border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 20%, transparent)`,
                        borderTop: 'none',
                        borderRadius: `0 0 ${RADIUS.md}px ${RADIUS.md}px`,
                        display: 'flex', flexDirection: 'column', gap: SP[2],
                      }}>
                        {powerDesc && (
                          <div style={{
                            fontFamily: FONT_BODY, fontSize: FS.caption,
                            color: HUD.textDim, lineHeight: 1.5,
                          }}>
                            <RichText text={powerDesc} />
                          </div>
                        )}
                        {upgradeDescs.map(a => (
                          <div key={a.key} style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                            <span style={{
                              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                              color: 'color-mix(in srgb, var(--hud-accent-purple) 65%, transparent)',
                              textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                              {a.name}
                            </span>
                            <div style={{
                              fontFamily: FONT_BODY, fontSize: FS.caption,
                              color: HUD.textFaint, lineHeight: 1.45,
                            }}>
                              <RichText text={a.description!} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
            }}>Spend <RichText text="[fp]" /></span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
              {/* ── Basic power — auto-activated card ───────────────────────── */}
              {basicUpgrade && (
                <button
                  onClick={() => toggleUpgrade(basicUpgrade.key, basicUpgrade.pip_cost)}
                  style={{
                    width: '100%',
                    padding: `${SP[2]} ${SP[2]}`,
                    background: basicIsActivated
                      ? 'color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)'
                      : 'color-mix(in srgb, var(--hud-accent-purple) 3%, transparent)',
                    border: `1px solid color-mix(in srgb, var(--hud-accent-purple) ${basicIsActivated ? 45 : 15}%, transparent)`,
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: SP[2],
                    textAlign: 'left',
                    animationName: basicIsActivated ? 'fco-basic-glow' : 'none',
                    animationDuration: basicIsActivated ? '2.5s' : '0s', /* basic power glow — animation timing */
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite' as const,
                    transition: `all ${EASE.default}`,
                  }}
                >
                  {basicUpgrade.pip_cost > 0 && (
                    <div style={{
                      width: 22, height: 22, /* pip badge — px intentional, fixed indicator */
                      borderRadius: RADIUS.sm,
                      background: basicIsActivated
                        ? (basicUseDark
                          ? 'color-mix(in srgb, var(--hud-accent-purple) 60%, black)'
                          : 'color-mix(in srgb, var(--hud-accent-purple) 50%, white)')
                        : 'color-mix(in srgb, var(--hud-accent-purple) 25%, transparent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: FONT_DISPLAY, fontSize: '9px', /* badge — px intentional */
                        fontWeight: 700, color: 'color-mix(in srgb, black 70%, transparent)', lineHeight: 1,
                      }}>
                        {basicUpgrade.pip_cost}◑
                      </span>
                    </div>
                  )}
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption,
                    color: basicIsActivated ? HUD.text : HUD.textDim,
                    flex: 1, lineHeight: 1.3,
                  }}>
                    {basicUpgrade.name}
                  </span>
                  <span style={{
                    fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                    color: basicIsActivated ? 'var(--hud-accent-purple)' : HUD.textFaint,
                    flexShrink: 0,
                  }}>
                    {basicIsActivated ? 'Active ✓' : 'Inactive'}
                  </span>
                </button>
              )}

              {/* ── Additional upgrades ─────────────────────────────────────── */}
              {nonBasicUpgrades.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                  {nonBasicUpgrades.map(upgrade => {
                    const spent = spentMap.has(upgrade.key)
                    const useDark = spentMap.get(upgrade.key) ?? false
                    const canAfford = isDathomiri
                      ? (lightAvail + darkAvail) >= upgrade.pip_cost
                      : (lightAvail >= upgrade.pip_cost || darkAvail >= upgrade.pip_cost)
                    const isDisabled = !spent && !canAfford
                    // Badge color: show which pool will be used
                    const willUseDark = !spent && lightAvail < upgrade.pip_cost && darkAvail >= upgrade.pip_cost

                    const upgradeDetailOpen = expandedUpgradeKey === upgrade.key

                    return (
                      <div key={upgrade.key} style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Row: selection button + optional ⓘ button */}
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: SP[1] }}>
                          {/* Selection button */}
                          <button
                            onClick={() => toggleUpgrade(upgrade.key, upgrade.pip_cost)}
                            disabled={isDisabled}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', gap: SP[2],
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
                            {/* Pip cost badge — hidden for free upgrades */}
                            {upgrade.pip_cost > 0 && (
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
                            )}
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
                          {/* ⓘ button — only if upgrade has a description */}
                          {upgrade.description && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setExpandedUpgradeKey(upgradeDetailOpen ? null : upgrade.key)
                              }}
                              style={{
                                width: 28, /* ⓘ button — px intentional, fixed tap target */
                                flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: upgradeDetailOpen
                                  ? 'color-mix(in srgb, var(--hud-accent-purple) 15%, transparent)'
                                  : 'transparent',
                                border: `1px solid color-mix(in srgb, var(--hud-accent-purple) ${upgradeDetailOpen ? 35 : 14}%, transparent)`,
                                borderRadius: RADIUS.md,
                                cursor: 'pointer',
                                transition: `all ${EASE.quick}`,
                              }}
                            >
                              <span style={{
                                fontFamily: FONT_BODY, fontSize: FS.overline,
                                color: upgradeDetailOpen
                                  ? 'var(--hud-accent-purple)'
                                  : HUD.textFaint,
                              }}>ⓘ</span>
                            </button>
                          )}
                        </div>
                        {/* Expandable detail panel */}
                        {upgradeDetailOpen && upgrade.description && (
                          <div style={{
                            padding: `${SP[2]} ${SP[2]}`,
                            marginTop: SP[1],
                            background: 'color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)',
                            border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)`,
                            borderRadius: RADIUS.md,
                            fontFamily: FONT_BODY, fontSize: FS.caption,
                            color: HUD.textDim, lineHeight: 1.5,
                          }}>
                            <RichText text={upgrade.description} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
          onClick={handleCta}
          disabled={!ctaActive}
          style={{
            width: '100%',
            padding: `${SP[3]} 0`,
            clipPath: `polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)`, /* decorative clip-path — px intentional */
            border: ctaActive
              ? `1px solid color-mix(in srgb, var(--hud-accent-purple) 70%, transparent)`
              : `1px solid color-mix(in srgb, var(--hud-accent-purple) 20%, transparent)`,
            background: ctaActive
              ? 'color-mix(in srgb, var(--hud-accent-purple) 15%, transparent)'
              : 'color-mix(in srgb, var(--hud-accent-purple) 5%, transparent)',
            cursor: ctaActive ? 'pointer' : 'not-allowed',
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: ctaActive ? 'var(--hud-accent-purple)' : HUD.textFaint,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[2],
            transition: `all ${EASE.default}`,
          }}
        >
          {isRolling || busy ? ctaLabel : (
            <>
              <span style={{ opacity: 0.7 }}>✦</span>
              {ctaLabel}
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
