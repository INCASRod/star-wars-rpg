'use client'

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { FS, FONT_BODY, SP, RADIUS, MODAL } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { igniteModalOpen, igniteModalClose, IGNITE_EXIT_MS } from '@/lib/utils'
import type { Character } from '@/lib/types'
import type { ForceRollResult } from '@/lib/forceRoll'
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
  /** H7 — "Play Power" shortcut from the hand's Force-power focus view.
      Seeds `selectedPowerKey` on open only; omitted (undefined) reproduces
      today's exact no-preselection behaviour — the normal rail entry point
      passes nothing. Everything after open (pool, allocation, roll) is
      identical to picking the same power by hand. */
  initialPowerKey?: string | null
}

// ── Force Point identity ──────────────────────────────────────────────────────
// One entry per point the roll produced. `kind` + `idx` together are the point's
// stable identity: `idx` is its index WITHIN its own kind, which is exactly what
// `lightSpentIdx` / `darkSpentIdx` have always meant, so those sets can still be
// derived from an allocation map without changing their semantics.
// `dieIndex` is what the flight animation needs — the die that produced it.
interface ForcePoint {
  kind:     'light' | 'dark'
  idx:      number
  dieIndex: number
}

const pointId = (p: ForcePoint) => `${p.kind}-${p.idx}`

// ── Flight tuning ─────────────────────────────────────────────────────────────
const FLY_MS      = 550   /* per-flyer travel — animation timing */
const FLY_STAGGER = 120   /* nominal gap between flyers — animation timing */
const FLY_WINDOW  = 840   /* total stagger budget; the gap compresses past ~7
                             points so a Force rating of 5+ does not drag —
                             the individual flight length never shortens */

// ── Stage header ──────────────────────────────────────────────────────────────
// Module scope: a component declared inside the panel body would be a new type
// on every render.
function StageHead({ n, name, summary, done }: {
  n: number; name: string; summary?: string; done: boolean
}) {
  return (
    <div className="fc-stage-head">
      <span className="fc-stage-num">{done ? '✓' : n}</span>
      <span className="fc-stage-name">{name}</span>
      {summary && <span className="fc-stage-summary">{summary}</span>}
    </div>
  )
}

// ── One Force die ─────────────────────────────────────────────────────────────
// Face-down "?" before the roll, tumbling with cycling faces during it, then
// frozen showing its ACTUAL result — including a visible blank when the die
// produced nothing.
function ForceDieFace({
  light, dark, state, cycleFace, dieRef,
}: {
  light: number
  dark: number
  state: 'facedown' | 'tumbling' | 'settled'
  cycleFace: number
  dieRef?: (el: HTMLDivElement | null) => void
}) {
  const cls = `fc-fdie${state === 'tumbling' ? ' is-tumbling' : ''}${state === 'settled' ? ' is-settled' : ''}`
  let inner: React.ReactNode
  if (state === 'facedown') {
    inner = <span className="fc-fdie-blank">?</span>
  } else if (state === 'tumbling') {
    // Faces cycle while the die is in the air — deliberately NOT the real
    // result, which is only revealed on settle.
    const faces = [
      <span key="b" className="fc-fdie-blank">·</span>,
      <span key="l" className="fc-fdie-face"><span className="fc-fp is-light">✦</span></span>,
      <span key="d" className="fc-fdie-face"><span className="fc-fp is-dark">✧</span></span>,
      <span key="q" className="fc-fdie-blank">?</span>,
    ]
    inner = faces[cycleFace % faces.length]
  } else if (light === 0 && dark === 0) {
    inner = <span className="fc-fdie-blank">—</span>
  } else {
    inner = (
      <span className="fc-fdie-face">
        {Array.from({ length: light }).map((_, i) => (
          <span key={`l${i}`} className="fc-fp is-light" data-fp="light">✦</span>
        ))}
        {Array.from({ length: dark }).map((_, i) => (
          <span key={`d${i}`} className="fc-fp is-dark" data-fp="dark">✧</span>
        ))}
      </span>
    )
  }
  // The glow wrapper is structural, not decorative: `.fc-fdie` is clipped to an
  // octagon and a clip-path clips box-shadow away, so the halo has to be a
  // drop-shadow on a parent. The ref stays on the die itself — the flight
  // measures its origin from the die's own pips.
  return (
    <div className="fc-fdie-glow">
      <div className={cls} ref={dieRef}>{inner}</div>
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
  initialPowerKey,
}: ForceCheckOverlayProps) {
  const [selectedPowerKey, setSelectedPowerKey] = useState<string | null>(null)
  const [forceRoll, setForceRoll] = useState<ForceRollResult | null>(null)
  const [activatedKeys, setActivatedKeys] = useState<Set<string>>(new Set())
  const [busy, setBusy]           = useState(false)
  const [rollPhase, setRollPhase]         = useState<RollPhase>('idle')
  const [pendingRoll, setPendingRoll]     = useState<ForceRollResult | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)

  // ── Allocation model ────────────────────────────────────────────────────────
  // `alloc` is the source of truth: which points sit on which upgrade. An
  // upgrade accepts ANY number of points — there is no per-effect cap, because
  // `pip_cost` is a text-derived heuristic that must never gate or validate.
  const [alloc, setAlloc]   = useState<Record<string, ForcePoint[]>>({})
  const [armed, setArmed]   = useState<ForcePoint | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [powerDescOpen, setPowerDescOpen] = useState(false)
  const [landedIds, setLandedIds] = useState<Set<string>>(new Set())
  const [cycleFace, setCycleFace] = useState(0)

  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()
  const shellRef  = useRef<HTMLDivElement>(null)
  const scrimRef  = useRef<HTMLDivElement>(null)
  const pulseRef  = useRef<HTMLDivElement>(null)
  const bankRef   = useRef<HTMLDivElement>(null)
  const dieRefs   = useRef<(HTMLDivElement | null)[]>([])
  const igniteTlRef = useRef<gsap.core.Timeline | null>(null)
  const flyTlRef    = useRef<gsap.core.Timeline | null>(null)
  const flyNodesRef = useRef<HTMLElement[]>([])

  function clearTimers() {
    timerIds.current.forEach(id => clearTimeout(id))
    timerIds.current = []
  }

  useEffect(() => {
    if (open) {
      clearTimers()
      setSelectedPowerKey(initialPowerKey ?? null)
      setForceRoll(null)
      setActivatedKeys(new Set())
      setAlloc({})
      setArmed(null)
      setExpanded(new Set())
      setPowerDescOpen(false)
      setLandedIds(new Set())
      setBusy(false)
      setRollPhase('idle')
      setPendingRoll(null)
      setRevealedCount(0)
    } else {
      clearTimers()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- initialPowerKey deliberately read only at the open-transition instant, not a re-seed trigger of its own

  const isFallen  = character.is_dark_side_fallen === true
  const available = Math.max(0, forceRating - committedForce)
  const purchased = useMemo(() => forcePowers.filter(p => p.purchasedCount > 0), [forcePowers])
  const selPower  = purchased.find(p => p.powerKey === selectedPowerKey) ?? null

  const upgrades = useMemo(() => {
    if (!selPower) return []
    return selPower.abilities.filter(a => a.purchasedRanks > 0)
  }, [selPower])

  // The base power is identified structurally, by the key the power's own tree
  // puts at row 0 — NOT by a name/key suffix. `basicUpgrade` renders as the
  // non-toggleable base row and is excluded from `activated_upgrades` on
  // commit; Force Points may still be allocated onto it, since allocation is
  // not activation. basicAbilityKey is null for a power with no ability_tree,
  // in which case nothing is treated as basic and every row stays toggleable.
  const basicKey         = selPower?.basicAbilityKey ?? null
  const basicUpgrade     = useMemo(() => (basicKey ? upgrades.find(u => u.key === basicKey) ?? null : null), [upgrades, basicKey])
  const nonBasicUpgrades = useMemo(() => upgrades.filter(u => u.key !== basicKey), [upgrades, basicKey])

  // ── Points produced by the roll, each tagged with its originating die ────────
  const points = useMemo<ForcePoint[]>(() => {
    if (!forceRoll) return []
    const out: ForcePoint[] = []
    let li = 0, di = 0
    forceRoll.dice.forEach((d, dieIndex) => {
      for (let i = 0; i < d.light; i++) out.push({ kind: 'light', idx: li++, dieIndex })
      for (let i = 0; i < d.dark;  i++) out.push({ kind: 'dark',  idx: di++, dieIndex })
    })
    return out
  }, [forceRoll])

  const placedIds = useMemo(() => {
    const s = new Set<string>()
    for (const list of Object.values(alloc)) for (const p of list) s.add(pointId(p))
    return s
  }, [alloc])

  // ── Derived spent-index sets ────────────────────────────────────────────────
  // These preserve the ORIGINAL semantics exactly — a set of per-kind indices
  // marked spent — so `handleChannelForce`'s payload is unchanged. The
  // allocation map is simply a richer store that these are projected from.
  const lightSpentIdx = useMemo(
    () => new Set(Object.values(alloc).flat().filter(p => p.kind === 'light').map(p => p.idx)),
    [alloc]
  )
  const darkSpentIdx = useMemo(
    () => new Set(Object.values(alloc).flat().filter(p => p.kind === 'dark').map(p => p.idx)),
    [alloc]
  )

  const lightTotal = forceRoll?.totalLight ?? 0
  const darkTotal  = forceRoll?.totalDark  ?? 0
  const lightSpent = lightSpentIdx.size
  const darkSpent  = darkSpentIdx.size

  const blankCount = useMemo(
    () => (forceRoll?.dice ?? []).filter(d => d.light === 0 && d.dark === 0).length,
    [forceRoll]
  )

  // ── Roll — 4-phase animation sequence ────────────────────────────────────────
  function handleRollWithAnimation() {
    if (rollPhase === 'tumble' || rollPhase === 'reveal' || available === 0) return
    const result = rollForceDice(available)
    const diceCount = result.dice.length
    const TUMBLE_MS = 1500  /* tumble phase duration — animation timing */
    const PER_DIE_MS = 220  /* per-die reveal interval — animation timing */

    setPendingRoll(result)
    setForceRoll(null)
    setActivatedKeys(new Set())
    setAlloc({})
    setArmed(null)
    setLandedIds(new Set())
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

  // ── Toggle upgrade active (no cost/gating — a plain on/off flag) ──────────
  function toggleUpgradeActive(key: string) {
    setActivatedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // ── Channel the Force ─────────────────────────────────────────────────────
  async function handleChannelForce() {
    if (!selPower || !forceRoll || busy) return
    setBusy(true)
    try {
      const sb = campaignId ? createClient() : null
      const activatedUpgrades = nonBasicUpgrades
        .filter(u => activatedKeys.has(u.key))
        .map(u => ({ name: u.name, fp_cost: u.pip_cost, is_dark: false }))
      if (darkSpent > 0 && sb && campaignId) {
        await sb.from('force_notifications').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          type: isFallen ? 'dark_side_use' : 'force_use',
          dark_pips_used: darkSpent, power_name: selPower.powerName,
          strain_cost: isDathomiri ? 0 : darkSpent,
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
        const totalFP = lightSpent + darkSpent
        await sb.from('combat_log').insert({
          campaign_id: campaignId, encounter_id: encId,
          participant_name: character.name, alignment: 'player',
          roll_type: 'force power', weapon_name: selPower.powerName,
          dice_pool: { force: available },
          result: { totalLight: forceRoll.totalLight, totalDark: forceRoll.totalDark, darkPipsUsed: darkSpent, totalFP },
          result_summary: `Force Power: ${selPower.powerName}. ${totalFP} FP`,
          is_visible_to_players: true,
        })
        await sb.from('roll_log').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          roll_label: selPower.powerName,
          pool: { force: available, proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0 },
          result: { netSuccess: lightSpent, netAdvantage: forceRoll.totalDark, triumph: darkSpent, despair: 0, succeeded: totalFP > 0 },
          is_dm: false, hidden: false, roll_type: 'force',
          weapon_name: selPower.powerName, target_name: null,
          alignment: 'player', is_visible_to_players: true,
          roll_meta: {
            power_name: selPower.powerName,
            activated_upgrades: activatedUpgrades,
            dark_pips_used: darkSpent,
            strain_cost: isDathomiri ? 0 : darkSpent,
            // Per-die results, in roll order — feeds the roll feed's dice
            // results row. Never derive/split this from totalLight/totalDark;
            // it must always come straight from the actual roll.
            dice_results: forceRoll.dice,
          },
        })
      }
    } catch (_e) { /* non-blocking */ }
    setBusy(false)
    timerIds.current.push(setTimeout(onClose, 1500)) /* hold result on screen — animation timing */
  }

  // ── Spend interactions ──────────────────────────────────────────────────────
  // Nothing armed  → tap toggles the effect active. An active effect with NO
  //                  points is valid (passives, condition-only effects).
  // Point armed    → tap places the point there and activates the row.
  function handleRowTap(key: string) {
    if (armed) {
      const id = pointId(armed)
      if (placedIds.has(id)) { setArmed(null); return }   // already placed — no double-count
      setAlloc(prev => ({ ...prev, [key]: [...(prev[key] ?? []), armed] }))
      setActivatedKeys(prev => new Set(prev).add(key))
      setArmed(null)
      return
    }
    // A row holding points cannot be toggled off; return the points first.
    if (activatedKeys.has(key) && (alloc[key]?.length ?? 0) > 0) return
    toggleUpgradeActive(key)
  }

  function handleChipTap(key: string, chipIndex: number) {
    setAlloc(prev => {
      const list = prev[key] ?? []
      return { ...prev, [key]: list.filter((_, i) => i !== chipIndex) }
    })
  }

  function handleTokenTap(p: ForcePoint) {
    const id = pointId(p)
    if (placedIds.has(id)) return
    setArmed(prev => (prev && pointId(prev) === id ? null : p))
  }

  const canChannel = selPower !== null && forceRoll !== null
  const isRolling  = rollPhase === 'tumble' || rollPhase === 'reveal'

  // ── Modal ignition ──────────────────────────────────────────────────────────
  // Consumes the documented convention (docs/architecture.md → "Modal
  // ignition"); timings live there and are not re-derived here.
  useEffect(() => {
    igniteTlRef.current?.kill()
    const targets = {
      inner:  shellRef.current,
      scrim:  scrimRef.current,
      pulse:  pulseRef.current,
      origin: typeof document !== 'undefined'
        ? document.querySelector('.hud-rail-btn-force')
        : null,
      // Per-check accent identity — this console flares purple. Read through
      // the scoped properties so the console and its flare cannot disagree.
      accent: 'var(--check-accent)',
      glow:   'var(--check-glow)',
      restShadow: MODAL.shadow,
      reducedMotion: prefersReducedMotion,
    }
    igniteTlRef.current = open ? igniteModalOpen(targets) : igniteModalClose(targets)
    return () => { igniteTlRef.current?.kill() }
  }, [open, prefersReducedMotion])

  // ── Face cycling during the tumble ──────────────────────────────────────────
  useEffect(() => {
    if (rollPhase !== 'tumble' || prefersReducedMotion) return
    const iv = setInterval(() => setCycleFace(c => c + 1), 80) /* face cycle — animation timing */
    return () => clearInterval(iv)
  }, [rollPhase, prefersReducedMotion])

  // ── The flight ──────────────────────────────────────────────────────────────
  // Each Force Point flies from the die that produced it into the bank at the
  // head of column 3, making the roll → currency causation visible.
  //
  // PURELY DECORATIVE. `points` already exists the moment `forceRoll` is set, so
  // every point is armable and spendable immediately; this only controls when
  // each bank token becomes VISIBLE. Nothing downstream waits on it.
  //
  // `useLayoutEffect` with `open` in the deps: Modal renders its children only
  // while open, so the die and bank refs are null until the console is actually
  // on screen.
  useLayoutEffect(() => {
    flyTlRef.current?.kill()
    flyNodesRef.current.forEach(n => n.remove())
    flyNodesRef.current = []

    if (!open || !forceRoll) return
    if (!points.length) { setLandedIds(new Set()); return }

    // Reduced motion: no flight, points appear in the bank immediately.
    if (prefersReducedMotion) {
      setLandedIds(new Set(points.map(pointId)))
      return
    }

    const bank = bankRef.current
    if (!bank) { setLandedIds(new Set(points.map(pointId))); return }
    const bankRect = bank.getBoundingClientRect()

    // Compress the GAP, never the individual flight, so a Force rating of 5+
    // does not turn into a queue.
    const stagger = Math.min(FLY_STAGGER, FLY_WINDOW / points.length)

    const tl = gsap.timeline()
    points.forEach((p, i) => {
      const die = dieRefs.current[p.dieIndex]
      // Prefer the exact pip on the die face; fall back to the die itself.
      const pips = die?.querySelectorAll<HTMLElement>(`[data-fp="${p.kind}"]`)
      const sameKindBefore = points.slice(0, i).filter(q => q.dieIndex === p.dieIndex && q.kind === p.kind).length
      const src = pips?.[sameKindBefore] ?? die
      const from = (src ?? bank).getBoundingClientRect()

      const fl = document.createElement('div')
      fl.className = `fc-fly fc-fp is-${p.kind}`
      fl.textContent = p.kind === 'light' ? '✦' : '✧'
      document.body.appendChild(fl)
      flyNodesRef.current.push(fl)

      const id = pointId(p)
      tl.fromTo(fl,
        { left: from.left, top: from.top, opacity: 1 },
        {
          left: bankRect.left + bankRect.width * 0.4,
          top:  bankRect.top + bankRect.height / 2 - 14,
          duration: FLY_MS / 1000,
          ease: 'power2.inOut',
          onComplete: () => {
            fl.remove()
            flyNodesRef.current = flyNodesRef.current.filter(n => n !== fl)
            setLandedIds(prev => new Set(prev).add(id))
          },
        },
        i * (stagger / 1000))
    })
    flyTlRef.current = tl

    return () => {
      tl.kill()
      flyNodesRef.current.forEach(n => n.remove())
      flyNodesRef.current = []
    }
    // prefersReducedMotion is false on first render — must be a dependency.
  }, [open, forceRoll, points, prefersReducedMotion])

  // ── Derived copy ────────────────────────────────────────────────────────────
  // Includes the basic power now that it needs real activation too (see the
  // rowsToRender loop below) — a check where the ONLY thing activated is the
  // base power (e.g. spending a pip on Heal/Harm's own heal) must still read
  // "Ready to commit," not stall on "Spend" forever because only
  // nonBasicUpgrades was ever counted.
  const activeCount = useMemo(
    () => upgrades.filter(u => activatedKeys.has(u.key)).length,
    [upgrades, activatedKeys]
  )
  const bankRemaining = points.length - placedIds.size

  const statusText = !selPower
    ? 'Choose the Force power you are using this turn'
    : !forceRoll
      ? `Roll your Force dice to generate Force Points`
      : darkSpent > 0
        ? `Dark side: flip a Destiny token and take ${darkSpent} Conflict — resolve with your GM`
        : activeCount > 0
          ? 'Ready to commit'
          : 'Activate your power\'s effects and place your Force Points'

  const stage1Done = !!selPower
  const stage2Done = !!forceRoll

  const rowsToRender = useMemo(() => {
    const rows: { key: string; name: string; description?: string; basic: boolean }[] = []
    if (basicUpgrade) rows.push({ key: basicUpgrade.key, name: basicUpgrade.name, description: basicUpgrade.description, basic: true })
    for (const u of nonBasicUpgrades) rows.push({ key: u.key, name: u.name, description: u.description, basic: false })
    return rows
  }, [basicUpgrade, nonBasicUpgrades])

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="min(1180px, calc(100vw - 48px))"
      panelBackground="var(--hud-surface-hi)"
      scrimRef={scrimRef}
      scrimClassName="fc-scrim-ignite"
      portalExtra={<div ref={pulseRef} className="fc-pulse is-check-force" aria-hidden />}
      exitMs={IGNITE_EXIT_MS}
    >
    <div className="cc-modal is-check-force" ref={shellRef}>

      {/* Two-tone top edge — this console's own accent LEADS, the theme's trails. */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, var(--check-accent) 30%, var(--check-accent-alt) 70%, transparent)', flexShrink: 0 }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div data-ignite-stagger style={{
        display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-panel)', flexShrink: 0,
      }}>
        <span style={{ color: 'var(--hud-text-faint)', fontSize: FS.sm, lineHeight: 1 }}>≋</span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          color: 'var(--hud-text)', flex: 1,
        }}>Force Check</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--hud-text-faint)', fontSize: FS.sm, padding: `0 ${SP[1]}`, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* ── Body: three columns ────────────────────────────────────────────── */}
      <div className="fc-console-body" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div className="fc-cols is-force">

          {/* ── 1 — Power ──────────────────────────────────────────────────── */}
          <div data-ignite-stagger className={`fc-col${!stage1Done ? ' is-active' : ''}${stage1Done ? ' is-done' : ''}`}>
            <div style={{ padding: `${SP[3]} ${SP[3]} ${SP[2]}` }}>
              <StageHead n={1} name="Power" done={stage1Done} summary={selPower?.powerName} />
            </div>
            <div className="fc-col-body">
              <div className="fc-guide">Choose the Force power you&rsquo;re using this turn.</div>
              {purchased.length === 0 ? (
                <div className="fc-bank-empty">No Force powers purchased yet.</div>
              ) : (
                <div className="fc-pow-list">
                  {purchased.map(p => {
                    const sel = p.powerKey === selectedPowerKey
                    return (
                      <div key={p.powerKey}>
                        <button
                          type="button"
                          className={`fc-pow-row${sel ? ' is-selected' : ''}`}
                          onClick={() => {
                            setSelectedPowerKey(prev => prev === p.powerKey ? null : p.powerKey)
                            setActivatedKeys(new Set())
                            setAlloc({})
                            setArmed(null)
                            setPowerDescOpen(false)
                          }}
                        >
                          <span className="fc-pow-name">{p.powerName}</span>
                          {/* Plain count, not the old unexplained dot row. */}
                          <span className="fc-pow-count">{p.purchasedCount} / {p.totalCount} upgrades</span>
                        </button>
                        {sel && p.description && (
                          <>
                            <div className={`fc-pow-desc${powerDescOpen ? '' : ' is-clamped'}`}>
                              <RichText text={p.description} />
                            </div>
                            <button type="button" className="fc-fx-exp"
                              onClick={() => setPowerDescOpen(v => !v)}>
                              {powerDescOpen ? 'Less' : 'More'}
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── 2 — Roll Force Dice ────────────────────────────────────────── */}
          <div data-ignite-stagger className={`fc-col${stage1Done && !stage2Done ? ' is-active' : ''}${stage2Done ? ' is-done' : ''}${!stage1Done ? ' is-locked' : ''}`}>
            <div style={{ padding: `${SP[3]} ${SP[3]} ${SP[2]}` }}>
              <StageHead
                n={2} name="Roll Force Dice" done={stage2Done}
                summary={forceRoll ? `${lightTotal} Light · ${darkTotal} Dark` : undefined}
              />
            </div>
            <div className="fc-col-body">
              {/* Plain mechanics, in game terms — deliberately not "channel",
                  which is theme and explains nothing. */}
              <div className="fc-guide">
                Your Force Rating gives you <b>{available} Force {available === 1 ? 'die' : 'dice'}</b>.
                {' '}Rolling them generates the <b>Force Points</b> you&rsquo;ll spend on your power&rsquo;s effects.
              </div>
              <div className="fc-dice-zone">
                <div className="fc-fdice">
                  {(forceRoll?.dice ?? pendingRoll?.dice ?? Array.from({ length: available }, () => ({ light: 0, dark: 0 }))).map((d, i) => {
                    const settled = !!forceRoll || (rollPhase === 'reveal' && i < revealedCount)
                    const state: 'facedown' | 'tumbling' | 'settled' =
                      settled ? 'settled' : isRolling ? 'tumbling' : 'facedown'
                    return (
                      <ForceDieFace
                        key={i}
                        light={d.light} dark={d.dark}
                        state={state}
                        cycleFace={cycleFace + i}
                        dieRef={el => { dieRefs.current[i] = el }}
                      />
                    )
                  })}
                </div>
                {!forceRoll && (
                  <button
                    type="button"
                    className="fc-fbtn"
                    onClick={handleRollWithAnimation}
                    disabled={available === 0 || isRolling || !stage1Done}
                  >
                    ◈ {isRolling ? 'Rolling…' : `Roll ${available} Force ${available === 1 ? 'Die' : 'Dice'}`}
                  </button>
                )}
                <div className="fc-dice-sum">
                  {forceRoll ? (
                    <>Rolled <b>{lightTotal} Light</b> · <b>{darkTotal} Dark</b>{blankCount > 0 ? ` · ${blankCount} blank` : ''}</>
                  ) : available === 0 ? 'No Force dice available' : ''}
                </div>
                {committedForce > 0 && (
                  <div className="fc-bank-empty">{committedForce} die committed to ongoing effects</div>
                )}
              </div>
            </div>
          </div>

          {/* ── 3 — Spend ──────────────────────────────────────────────────── */}
          <div data-ignite-stagger className={`fc-col${stage2Done ? ' is-active' : ''}${!stage2Done ? ' is-locked' : ''}`}>
            <div style={{ padding: `${SP[3]} ${SP[3]} ${SP[2]}` }}>
              <StageHead n={3} name="Spend" done={activeCount > 0} />
            </div>
            <div className="fc-col-body">
              {/* The bank sits at the HEAD of this column, directly above the
                  effects it pays for, and stays put while they scroll. */}
              <div className="fc-bank" ref={bankRef}>
                <span className="fc-bank-lbl">Force<br />Points</span>
                <div className="fc-bank-toks">
                  {points.length === 0 ? (
                    <span className="fc-bank-empty">Roll your Force dice first</span>
                  ) : points.map(p => {
                    const id = pointId(p)
                    const used = placedIds.has(id)
                    const landed = landedIds.has(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`fc-fp fc-fptok is-${p.kind}${used ? ' is-used' : ''}${armed && pointId(armed) === id ? ' is-armed' : ''}${landed ? ' is-pop' : ' is-landing'}`}
                        onClick={() => handleTokenTap(p)}
                        title={p.kind === 'light' ? 'Light Force Point' : 'Dark Force Point'}
                      >
                        {p.kind === 'light' ? '✦' : '✧'}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="fc-bank-hint">
                {!forceRoll ? '' : armed
                  ? <><b>Point in hand</b> — tap an effect to place it</>
                  : bankRemaining > 0
                    ? 'Tap a point, then tap an effect to spend it there'
                    : points.length > 0 ? 'All points spent' : 'No Force Points generated'}
              </div>

              {rowsToRender.length === 0 ? (
                <div className="fc-bank-empty">No upgrades purchased for this power.</div>
              ) : (
                <div className="fc-fx-scroll">
                  {rowsToRender.map(row => {
                    // The base power is identity, not a free grant — it still
                    // needs a pip spent (or a manual toggle for a genuinely
                    // free application) to activate, same as any upgrade, and
                    // can be activated more than once by placing more than one
                    // point on it (e.g. Heal/Harm's base ability: each ◐ heals
                    // again). It used to force `on` unconditionally here,
                    // which showed it pre-activated before the roll even
                    // happened — wrong, and reported as such. `row.basic` now
                    // only affects styling/exclusion-from-the-write-payload,
                    // never activation state.
                    const on      = activatedKeys.has(row.key)
                    const chips   = alloc[row.key] ?? []
                    const hasDark = chips.some(c => c.kind === 'dark')
                    const isExp   = expanded.has(row.key)
                    return (
                      <div
                        key={row.key}
                        className={`fc-fx-row${row.basic ? ' is-basic' : ''}${on ? ' is-on' : ''}${hasDark ? ' has-dark' : ''}${armed ? ' is-target' : ''}${isExp ? ' is-expanded' : ''}`}
                      >
                        <div className="fc-fx-head" role="button" tabIndex={0}
                          onClick={() => handleRowTap(row.key)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowTap(row.key) } }}
                        >
                          <span className="fc-fx-check">✓</span>
                          <span className="fc-fx-body">
                            <span className="fc-fx-name">{row.name}</span>
                            {row.description && (
                              <span className="fc-fx-desc"><RichText text={row.description} /></span>
                            )}
                          </span>
                          {row.description && (
                            <button type="button" className="fc-fx-exp"
                              onClick={e => {
                                e.stopPropagation()
                                setExpanded(prev => {
                                  const next = new Set(prev)
                                  next.has(row.key) ? next.delete(row.key) : next.add(row.key)
                                  return next
                                })
                              }}
                            >{isExp ? 'Less' : 'More'}</button>
                          )}
                        </div>
                        {on && (
                          <div className="fc-fx-slots">
                            {chips.length === 0 ? (
                              <span className="fc-fx-free">Active — no points spent</span>
                            ) : chips.map((c, ci) => (
                              <button
                                key={`${pointId(c)}-${ci}`}
                                type="button"
                                className={`fc-fp fc-fx-chip is-${c.kind}`}
                                title="Return this point to the bank"
                                onClick={e => { e.stopPropagation(); handleChipTap(row.key, ci) }}
                              >
                                {c.kind === 'light' ? '✦' : '✧'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="fc-roll-bar fc-roll-footer" data-ignite-stagger>
        <div className={`fc-roll-sub${darkSpent > 0 ? ' is-warn' : ''}`}>{statusText}</div>
        <button
          type="button"
          onClick={handleCta}
          disabled={!canChannel || busy}
          className={`fc-roll-btn${canChannel && !busy ? ' is-armed' : ''}`}
        >
          ✦ Commit — {lightSpent} Light · {darkSpent} Dark
        </button>
      </div>

      {/* Scanline texture overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,color-mix(in srgb,black 3%,transparent) 2px,color-mix(in srgb,black 3%,transparent) 4px)',
        borderRadius: RADIUS.xl,
      }} />
    </div>
    </Modal>
  )
}
