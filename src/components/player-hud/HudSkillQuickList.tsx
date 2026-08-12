'use client'

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Modal } from '@/components/ui/Modal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { igniteModalOpen, igniteModalClose, IGNITE_EXIT_MS } from '@/lib/utils'
import { rollPool, type RollResult } from './dice-engine'
import { CHAR_FULL, DICE_COLOR, DICE_OUTLINE, DICE_META, MODAL, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z } from '@/lib/tokens'
import type { HudSkill } from '@/lib/types'

// ── Constants ──────────────────────────────────────────────────────────────
const CHAR_ORDER = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
type CharKey = typeof CHAR_ORDER[number]
type FilterMode = 'all' | 'trained' | 'career'
type SkillCheckMode = 'browse' | 'roll'

// die clip-path geometry — not spacing
const CLIP_OCT = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
const CLIP_DIA = 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'

const DIFF_LABELS = ['Simple', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable'] as const

// ── Props ──────────────────────────────────────────────────────────────────
interface HudSkillQuickListProps {
  open:          boolean
  onClose:       () => void
  skills:        HudSkill[]
  onRoll?:       (result: RollResult, label?: string, pool?: Record<string, number>) => void
  /** Fires with the selected skill's key whenever it changes, and null when
      closed or nothing selected (H5 — check-time hand-card glow). */
  onActiveSkillChange?: (skillKey: string | null) => void
}

// ── Shared ─────────────────────────────────────────────────────────────────

function ScanlineOverlay() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: Z.fab,
      backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,color-mix(in srgb,black 3%,transparent) 2px,color-mix(in srgb,black 3%,transparent) 4px)',
    }} />
  )
}

// ── Browse mode sub-components ─────────────────────────────────────────────

function FilterChips({ filter, setFilter }: { filter: FilterMode; setFilter: (f: FilterMode) => void }) {
  const chips: { key: FilterMode; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'trained', label: 'Trained' },
    { key: 'career',  label: 'Career' },
  ]
  return (
    <div style={{
      display: 'flex', gap: SP[1], padding: `${SP[1]} ${SP[2]}`,
      borderBottom: '1px solid var(--hud-border)', flexShrink: 0,
    }}>
      {chips.map(c => {
        const active = filter === c.key
        return (
          <button
            key={c.key}
            className="sc-filter-chip"
            onClick={() => setFilter(c.key)}
            style={{
              clipPath:      'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)',
              padding:       `2px ${SP[2]}`,
              fontFamily:    FONT_DISPLAY,
              fontSize:      FS.overline,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              // Selected-item highlight — an identity surface, so it reads the
              // scoped accent. Resolves to the same gold it always did.
              border:        `1px solid ${active ? 'var(--check-accent, var(--hud-accent))' : 'var(--hud-border)'}`,
              color:         active ? 'var(--check-accent, var(--hud-accent))' : 'var(--hud-text-dim)',
              background:    active ? 'color-mix(in srgb, var(--check-accent, var(--hud-accent)) 10%, transparent)' : 'transparent',
              cursor:        'pointer',
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Roll mode sub-components ───────────────────────────────────────────────

/** Six difficulty levels as a 3x2 grid. Presentation only — `onSelect` is the
 *  existing handler. */
function DifficultySelector({ selected, onSelect }: { selected: number; onSelect: (v: number) => void }) {
  return (
    <div className="fc-diff-grid">
      {DIFF_LABELS.map((label, idx) => (
        <button
          key={idx}
          type="button"
          className={`fc-diff-opt${selected === idx ? ' is-selected' : ''}`}
          onClick={() => onSelect(idx)}
        >
          <span className="fc-diff-name">{label}</span>
          <span className="fc-diff-pips">
            {idx === 0 ? (
              <span className="fc-diff-dash">—</span>
            ) : (
              Array.from({ length: idx }).map((_, pi) => (
                <i key={pi} style={{ background: DICE_COLOR.difficulty /* die-identity hex — sealed namespace */ }} />
              ))
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────


// ── Focus-console atoms ───────────────────────────────────────────────────────
// Module scope: a component declared inside the panel body would be a new type
// every render (React Compiler rejects it).

function SkillTrayDie({ type }: { type: keyof typeof DICE_META }) {
  const meta = DICE_META[type]
  const sz = meta.shape === 'diamond' ? 26 : 30 /* die icon size — geometry */
  return (
    <div className="cc-die" style={{
      width: sz, height: sz, flexShrink: 0,
      background: meta.color, /* die-identity hex — sealed namespace */
      border: meta.shape === 'rounded' && DICE_OUTLINE[type] ? `1px solid ${DICE_OUTLINE[type]}` : undefined,
      boxShadow: meta.shape !== 'rounded' && DICE_OUTLINE[type] ? `0 0 0 1px ${DICE_OUTLINE[type]}` : undefined,
      borderRadius: meta.shape === 'rounded' ? RADIUS.sm : undefined,
      clipPath: meta.shape === 'octagon' ? CLIP_OCT : meta.shape === 'diamond' ? CLIP_DIA : undefined,
    }} />
  )
}

/** One skill in the characteristic grid. Untrained (rank 0) renders quieter but
 *  stays fully selectable — it is a valid check that rolls the characteristic. */
function SkillTile({ skill, dim, onSelect }: {
  skill: HudSkill; dim: boolean; onSelect: (s: HudSkill) => void
}) {
  const trained = skill.rank > 0
  // Pip row: filled for ranks, hollow up to the characteristic. A skill ranked
  // ABOVE its characteristic shows more filled than hollow, so the row length
  // is max(charVal, rank).
  const total = Math.max(skill.charVal, skill.rank)
  return (
    <button
      type="button"
      className={`fc-sk-tile${trained ? ' is-trained' : ''}${dim ? ' is-dim' : ''}`}
      onClick={() => onSelect(skill)}
      title={`${skill.name} — ${CHAR_FULL[skill.charKey as CharKey] ?? skill.charKey} ${skill.charVal} · Rank ${skill.rank}`}
    >
      <span className="fc-sk-name">{skill.name}</span>
      <span className="fc-sk-pips">
        {Array.from({ length: total }).map((_, i) => (
          <i key={i} className={i < skill.rank ? '' : 'is-empty'}
             style={i < skill.rank
               ? { background: DICE_COLOR.proficiency /* die-identity hex — sealed namespace */ }
               : undefined} />
        ))}
      </span>
    </button>
  )
}

/** Adjust-Pool stepper. Mirrors the Combat Check's FcStepper so both consoles
 *  read identically; on the two upgrade rows the minus is an explicit Undo. */
function SkillStepper({
  dieColor, dieShape, name, sub, value, onAdd, onRemove, canRemove,
  isUpgrade = false, downgradeLabel,
}: {
  dieColor: string
  dieShape: 'octagon' | 'diamond' | 'rounded'
  name: string
  sub?: string
  value: number
  onAdd: () => void
  onRemove: () => void
  canRemove: boolean
  isUpgrade?: boolean
  downgradeLabel?: string
}) {
  const sz = dieShape === 'diamond' ? 15 : 16 /* die glyph size — geometry */
  return (
    <div className={`fc-dstep${isUpgrade ? ' is-upgrade' : ''}`}>
      <span style={{
        width: sz, height: sz, flexShrink: 0,
        background: dieColor, /* die-identity hex — sealed namespace */
        borderRadius: dieShape === 'rounded' ? RADIUS.sm : undefined,
        clipPath: dieShape === 'octagon' ? CLIP_OCT : dieShape === 'diamond' ? CLIP_DIA : undefined,
      }} />
      <span className="fc-dstep-meta">
        <span className="fc-dstep-name">{name}</span>
        {sub && <span className="fc-dstep-sub">{sub}</span>}
      </span>
      <button type="button" className={`fc-stepbtn${downgradeLabel ? ' is-downgrade' : ''}`}
        onClick={onRemove} disabled={!canRemove} title={downgradeLabel ?? `Remove ${name}`}>
        {downgradeLabel ? `↓ ${downgradeLabel}` : '−'}
      </button>
      <span className="fc-dstep-count">{value}</span>
      <button type="button" className="fc-stepbtn is-add" onClick={onAdd}
        title={isUpgrade ? `Upgrade — ${name}` : `Add ${name}`}>
        {isUpgrade ? '↑' : '+'}
      </button>
    </div>
  )
}

export function HudSkillQuickList({ open, onClose, skills, onRoll, onActiveSkillChange }: HudSkillQuickListProps) {
  // ── Mode state ──────────────────────────────────────────────────────────
  const [mode,     setMode]     = useState<SkillCheckMode>('browse')
  const [filter,   setFilter]   = useState<FilterMode>('all')
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<HudSkill | null>(null)

  // H5 — surface the active skill (or null when closed/none selected) to the parent.
  useEffect(() => {
    onActiveSkillChange?.(open ? (selected?.key ?? null) : null)
  }, [open, selected, onActiveSkillChange])

  // Roll mode local state
  const [boostAdd,           setBoostAdd]           = useState(0)
  const [setbackAdd,         setSetbackAdd]         = useState(0)
  const [upgradeSkill,       setUpgradeSkill]       = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState(2) // Average
  const [diffUpgrades,       setDiffUpgrades]       = useState(0)
  const [forceAdd,           setForceAdd]           = useState(0)

  // ── Browse: group skills by characteristic ────────────────────────────
  // Grid grouping is deliberately UNFILTERED — every skill stays on screen and
  // the filter only dims (and inerts) the misses, per the design. `matchesFilter`
  // is the dim predicate; the original `filteredSkills`/`skillsByChar` memos are
  // untouched below.
  const matchesFilter = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (s: HudSkill) =>
      (!q || s.name.toLowerCase().includes(q)) &&
      (filter === 'all' ? true : filter === 'trained' ? s.rank > 0 : s.isCareer)
  }, [query, filter])

  const skillsByCharAll = useMemo(() => {
    const map: Partial<Record<CharKey, HudSkill[]>> = {}
    for (const s of skills) (map[s.charKey as CharKey] ??= []).push(s)
    for (const k of CHAR_ORDER) map[k]?.sort((a, b) => a.name.localeCompare(b.name))
    return map
  }, [skills])

  // ── Roll mode: live pool calculation ─────────────────────────────────
  const pool = useMemo(() => {
    if (!selected) return {} as Record<string, number>
    // Total dice is max(characteristic, rank) with min(characteristic, rank)
    // upgraded to proficiency — the shared `getSkillPool` rule. The previous
    // `ability = charVal - proficiency` pinned the total to the characteristic,
    // so a skill ranked ABOVE its characteristic silently lost a die
    // (Discipline 3 / Willpower 2 rolled 2 dice instead of 3). Rank 0 is
    // unaffected: proficiency 0, ability = charVal, i.e. untrained rolls the
    // characteristic, which was always correct.
    const effRank     = selected.rank + upgradeSkill
    const proficiency = Math.min(selected.charVal, effRank)
    const ability     = Math.abs(selected.charVal - effRank)
    const baseDiff    = selectedDifficulty
    const challenge   = Math.min(diffUpgrades, baseDiff)
    const difficulty  = baseDiff - challenge
    return { proficiency, ability, boost: boostAdd, setback: setbackAdd, challenge, difficulty, force: forceAdd }
  }, [selected, boostAdd, setbackAdd, upgradeSkill, selectedDifficulty, diffUpgrades, forceAdd])

  // Upgrades convert ability dice to proficiency, so the cap is however many
  // ability dice the base pool has: max(char, rank) - min(char, rank).
  const upgradeSkillCap = selected ? Math.abs(selected.charVal - selected.rank) : 0
  const playerDiceTotal = (pool.proficiency ?? 0) + (pool.ability ?? 0) + (pool.boost ?? 0)
  const canRoll         = playerDiceTotal > 0

  // ── Handlers ──────────────────────────────────────────────────────────
  const selectSkill = (skill: HudSkill) => {
    setSelected(skill)
    setBoostAdd(0); setSetbackAdd(0); setUpgradeSkill(0)
    setSelectedDifficulty(2); setDiffUpgrades(0); setForceAdd(0)
    setDifficultyChosen(false)
    setMode('roll')
  }

  const goBack = () => {
    setMode('browse')
    setSelected(null)
  }

  const handleDifficultySelect = (v: number) => {
    setSelectedDifficulty(v)
    setDiffUpgrades(0)
  }

  // Presentational: has the player made an explicit difficulty choice yet?
  // `selectedDifficulty` defaults to 2 (Average), so it cannot answer this.
  const [difficultyChosen, setDifficultyChosen] = useState(false)
  const handleDifficultySelectAndAdvance = (v: number) => {
    handleDifficultySelect(v)
    setDifficultyChosen(true)
  }

  const handleRollClick = () => {
    if (!selected || !canRoll) return
    const result = rollPool(pool as Parameters<typeof rollPool>[0])
    onRoll?.(result, `${selected.name} Check`, pool)
    goBack()
  }

  // ── Pool summary ──────────────────────────────────────────────────────
  // ── Presentational state (focus-console redesign) ─────────────────────────
  // `mode` still owns which phase shows — this is a view over it, not a rename.
  const prefersReducedMotion = usePrefersReducedMotion()
  const shellRef  = useRef<HTMLDivElement>(null)
  const scrimRef  = useRef<HTMLDivElement>(null)
  const pulseRef  = useRef<HTMLDivElement>(null)
  const trayRef   = useRef<HTMLDivElement>(null)
  const p1Ref     = useRef<HTMLDivElement>(null)
  const p2Ref     = useRef<HTMLDivElement>(null)
  const phasesRef = useRef<HTMLDivElement>(null)
  const phaseMountedRef = useRef(false)
  const igniteTlRef = useRef<gsap.core.Timeline | null>(null)
  const phaseTlRef  = useRef<gsap.core.Timeline | null>(null)

  // ── Modal ignition ─────────────────────────────────────────────────────────
  // Consumes the documented convention (docs/architecture.md → "Modal
  // ignition"); timings live there and are not re-derived here.
  useEffect(() => {
    igniteTlRef.current?.kill()
    const targets = {
      inner:  shellRef.current,
      scrim:  scrimRef.current,
      pulse:  pulseRef.current,
      origin: typeof document !== 'undefined'
        ? document.querySelector('.hud-rail-btn-skill')
        : null,
      // Per-check accent identity: Skill Check flares gold. Read through the
      // scoped properties rather than naming --hud-gold here, so this console
      // and its CSS can never disagree. Both `inner` (.cc-modal.is-check-skill)
      // and `pulse` (.fc-pulse.is-check-skill) carry the scope.
      accent: 'var(--check-accent)',
      glow:   'var(--check-glow)',
      restShadow: MODAL.shadow,
      reducedMotion: prefersReducedMotion,
    }
    igniteTlRef.current = open ? igniteModalOpen(targets) : igniteModalClose(targets)
    return () => { igniteTlRef.current?.kill() }
  }, [open, prefersReducedMotion])

  // ── Phase crossfade + height spring ────────────────────────────────────────
  // Decorative: `mode` has already flipped, so the pool and the roll never wait
  // on this. Animates the two phase wrappers and their `.fc-phases` height
  // wrapper, never a positioned anchor.
  //
  // The height half follows TalentsPanel's `AnimatedDrawer` (the codebase's
  // height-spring precedent): measure the incoming phase, tween the wrapper to
  // it. It does NOT release to `height: auto` on complete — both phases are
  // absolutely positioned, so `auto` collapses the wrapper to zero; the inline
  // height is the wrapper's only height and stays.
  //
  // `useLayoutEffect`, not `useEffect`: the wrapper has no natural height, so
  // running after paint would flash a collapsed console on first open.
  useLayoutEffect(() => {
    phaseTlRef.current?.kill()
    const inEl  = mode === 'roll' ? p2Ref.current : p1Ref.current
    const outEl = mode === 'roll' ? p1Ref.current : p2Ref.current
    const wrap  = phasesRef.current
    // `Modal` renders its children only while open, so the refs are null until
    // the console is actually on screen — hence `open` in the dependency array.
    // Without it this effect only ever ran on mount (refs null, early return)
    // and the wrapper, which has no natural height, stayed collapsed.
    if (!inEl || !outEl || !wrap) { phaseMountedRef.current = false; return }

    // Measured off the incoming phase itself — it is top-anchored with auto
    // height (see `.fc-phase-abs`), so this is its content height even while it
    // is still faded out.
    const targetH = inEl.offsetHeight

    // First run of a freshly-mounted console has no previous height to spring
    // FROM — tweening 0 -> full height there would be a second motion competing
    // with the ignition — so the height snaps on mount and only springs on a
    // genuine phase change. The cross-fade below is unaffected either way.
    const springHeight = phaseMountedRef.current
    phaseMountedRef.current = true

    if (prefersReducedMotion) {
      gsap.set(outEl, { opacity: 0 })
      gsap.set(inEl,  { opacity: 1 })
      gsap.set(wrap,  { height: targetH })
      return
    }
    if (!springHeight) gsap.set(wrap, { height: targetH })
    const tl = gsap.timeline()
    tl.to(outEl, { opacity: 0, duration: 0.25, ease: 'power2.in' })
      .fromTo(inEl, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    if (mode === 'roll') {
      const panels = inEl.querySelectorAll<HTMLElement>('.fc-panel')
      if (panels.length) {
        tl.fromTo(panels, { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, '<')
      }
    }
    // Added last with an EXPLICIT position so the cross-fade's own relative
    // timings above are untouched. It starts inside the out-fade and finishes
    // under the in-fade, so the two read as one motion rather than two beats.
    if (springHeight) tl.to(wrap, { height: targetH, duration: 0.4, ease: 'power3.out' }, 0.1)
    phaseTlRef.current = tl
    return () => { tl.kill() }
    // prefersReducedMotion is false on first render — must be a dependency.
  }, [mode, open, prefersReducedMotion])

  // Tray pulse on any pool change. The write already happened.
  const poolSig = `${pool.proficiency ?? 0}-${pool.ability ?? 0}-${pool.boost ?? 0}-${pool.force ?? 0}-${pool.difficulty ?? 0}-${pool.challenge ?? 0}-${pool.setback ?? 0}`
  const prevSig = useRef(poolSig)
  useEffect(() => {
    if (prevSig.current === poolSig) return
    prevSig.current = poolSig
    if (prefersReducedMotion) return
    const el = trayRef.current
    if (!el) return
    el.classList.remove('fc-tray-pulse')
    void el.offsetWidth
    el.classList.add('fc-tray-pulse')
  }, [poolSig, prefersReducedMotion])

  const statusText = !selected
    ? 'Choose a skill to arm the roll'
    : !difficultyChosen
      ? 'Set difficulty to arm the roll'
      : !canRoll
        ? 'Pool is empty'
        : 'Pool ready — roll when you are'

  const p = pool.proficiency ?? 0, a = pool.ability ?? 0, bo = pool.boost ?? 0, fo = pool.force ?? 0
  const di = pool.difficulty ?? 0, ch = pool.challenge ?? 0, se = pool.setback ?? 0
  const hasPos = p + a + bo + fo > 0
  const hasNeg = di + ch + se > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="min(1180px, calc(100vw - 48px))"
      panelBackground="var(--hud-surface-hi)"
      scrimRef={scrimRef}
      scrimClassName="fc-scrim-ignite"
      portalExtra={<div ref={pulseRef} className="fc-pulse is-check-skill" aria-hidden />}
      exitMs={IGNITE_EXIT_MS}
    >
    <div className="cc-modal is-check-skill" ref={shellRef}>

      {/* Two-tone top edge. The stops are the scoped pair, so Combat reads
          accent→gold and Skill reads gold→accent — the ramp survives instead of
          collapsing to flat gold. */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, var(--check-accent) 30%, var(--check-accent-alt) 70%, transparent)', flexShrink: 0 }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div data-ignite-stagger style={{
        display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-panel)', flexShrink: 0,
      }}>
        <span style={{ color: 'var(--hud-text-faint)', fontSize: FS.sm, lineHeight: 1 }}>⬠</span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          color: 'var(--hud-text)', flex: 1,
        }}>Skill Check</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--hud-text-faint)', fontSize: FS.sm, padding: `0 ${SP[1]}`, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* ── Tray strip ─────────────────────────────────────────────────────── */}
      <div className="fc-tray fc-tray-strip" data-ignite-stagger ref={trayRef}>
        <div className="fc-tray-label">
          <span>Dice Pool</span>
          <span className="fc-tray-skill">{selected ? selected.name : '—'}</span>
        </div>
        <div className="fc-tray-dice">
          {Array.from({ length: p  }).map((_, i) => <SkillTrayDie key={`pro-${i}`} type="proficiency" />)}
          {Array.from({ length: a  }).map((_, i) => <SkillTrayDie key={`abl-${i}`} type="ability" />)}
          {Array.from({ length: bo }).map((_, i) => <SkillTrayDie key={`bst-${i}`} type="boost" />)}
          {Array.from({ length: fo }).map((_, i) => <SkillTrayDie key={`frc-${i}`} type="force" />)}
          {hasPos && hasNeg && <span className="fc-tray-divider" />}
          {Array.from({ length: di }).map((_, i) => <SkillTrayDie key={`dif-${i}`} type="difficulty" />)}
          {Array.from({ length: ch }).map((_, i) => <SkillTrayDie key={`chl-${i}`} type="challenge" />)}
          {Array.from({ length: se }).map((_, i) => <SkillTrayDie key={`set-${i}`} type="setback" />)}
          {!hasPos && !hasNeg && <span className="fc-tray-empty">Select a skill to begin</span>}
        </div>
      </div>

      {/* ── Body: two phases ───────────────────────────────────────────────── */}
      <div className="fc-console-body" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div className="fc-phases" data-ignite-stagger ref={phasesRef}>

          {/* ── Phase 1 — skill grid ─────────────────────────────────────── */}
          <div
            ref={p1Ref}
            className={`fc-phase fc-phase-abs${mode === 'roll' ? ' fc-phase-hidden' : ''}`}
          >
            <div className="fc-phase-top">
              <span className="fc-phase-name"><span className="fc-stage-num">1</span> Choose Skill</span>
              <input
                className="fc-filter"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to filter skills…"
              />
              <FilterChips filter={filter} setFilter={setFilter} />
            </div>

            <div className="fc-char-grid">
              {CHAR_ORDER.map(charKey => {
                // Every skill for the characteristic, INCLUDING rank 0 — an
                // untrained skill is a valid check that rolls the
                // characteristic. The filter only dims, it never removes.
                const all = skillsByCharAll[charKey] ?? []
                if (!all.length) return null
                const charVal = all[0].charVal
                return (
                  <div className="fc-char-col" key={charKey}>
                    <div className="fc-char-head">
                      <span className="fc-char-name">{CHAR_FULL[charKey] ?? charKey}</span>
                      <span className="fc-char-val">{charVal}</span>
                    </div>
                    {all.map(sk => (
                      <SkillTile
                        key={sk.key}
                        skill={sk}
                        dim={!matchesFilter(sk)}
                        onSelect={selectSkill}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Phase 2 — difficulty + adjust ────────────────────────────── */}
          <div
            ref={p2Ref}
            className={`fc-phase fc-phase-abs${mode === 'roll' ? '' : ' fc-phase-hidden'}`}
          >
            {selected && (
              <>
                <div className="fc-p2-top">
                  <button type="button" className="fc-skill-chip" onClick={goBack}>
                    <span>
                      <span className="fc-skill-chip-n" style={{ display: 'block' }}>{selected.name}</span>
                      <span className="fc-skill-chip-s" style={{ display: 'block' }}>
                        {`${CHAR_FULL[selected.charKey as CharKey] ?? selected.charKey} ${selected.charVal} · Rank ${selected.rank}`}
                      </span>
                    </span>
                    <span className="fc-skill-chip-swap">Change ▾</span>
                  </button>
                </div>

                <div className="fc-p2-cols">
                  {/* Difficulty */}
                  <div className={`fc-panel${difficultyChosen ? '' : ' is-active'}`}>
                    <div className="fc-panel-head">
                      <span className="fc-stage-num">2</span>
                      <span className="fc-stage-name">Difficulty</span>
                      {difficultyChosen && <span className="fc-panel-sum">{DIFF_LABELS[selectedDifficulty]}</span>}
                    </div>
                    <DifficultySelector selected={selectedDifficulty} onSelect={handleDifficultySelectAndAdvance} />
                  </div>

                  {/* Adjust Pool — locked until a difficulty is chosen */}
                  <div className={`fc-panel${difficultyChosen ? ' is-active' : ' is-locked'}`}>
                    <div className="fc-panel-head">
                      <span className="fc-stage-num">3</span>
                      <span className="fc-stage-name">Adjust Pool</span>
                    </div>
                    <div className="fc-dice-grid">
                      <SkillStepper dieColor={DICE_COLOR.boost} dieShape="rounded" name="Boost"
                        value={boostAdd} onAdd={() => setBoostAdd(v => v + 1)}
                        onRemove={() => setBoostAdd(v => Math.max(0, v - 1))} canRemove={boostAdd > 0} />
                      <SkillStepper dieColor={DICE_COLOR.setback} dieShape="rounded" name="Setback"
                        value={setbackAdd} onAdd={() => setSetbackAdd(v => v + 1)}
                        onRemove={() => setSetbackAdd(v => Math.max(0, v - 1))} canRemove={setbackAdd > 0} />
                      <SkillStepper dieColor={DICE_COLOR.difficulty} dieShape="diamond" name="Difficulty"
                        sub="Add / remove"
                        value={selectedDifficulty} onAdd={() => handleDifficultySelect(Math.min(5, selectedDifficulty + 1))}
                        onRemove={() => handleDifficultySelect(Math.max(0, selectedDifficulty - 1))}
                        canRemove={selectedDifficulty > 0} />
                      <SkillStepper dieColor={DICE_COLOR.force} dieShape="octagon" name="Force"
                        value={forceAdd} onAdd={() => setForceAdd(v => v + 1)}
                        onRemove={() => setForceAdd(v => Math.max(0, v - 1))} canRemove={forceAdd > 0} />

                      <SkillStepper dieColor={DICE_COLOR.proficiency} dieShape="octagon"
                        name="Upgrade Skill" sub="Ability → Prof"
                        value={upgradeSkill}
                        onAdd={() => setUpgradeSkill(v => Math.min(upgradeSkillCap, v + 1))}
                        onRemove={() => setUpgradeSkill(v => Math.max(0, v - 1))}
                        canRemove={upgradeSkill > 0} isUpgrade downgradeLabel="Undo" />
                      <SkillStepper dieColor={DICE_COLOR.challenge} dieShape="octagon"
                        name="Upgrade Diff" sub="Diff → Challenge"
                        value={diffUpgrades}
                        onAdd={() => setDiffUpgrades(v => Math.min(selectedDifficulty, v + 1))}
                        onRemove={() => setDiffUpgrades(v => Math.max(0, v - 1))}
                        canRemove={diffUpgrades > 0} isUpgrade downgradeLabel="Undo" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="fc-roll-bar fc-roll-footer" data-ignite-stagger>
        <div className="fc-roll-sub">{statusText}</div>
        <button
          type="button"
          onClick={handleRollClick}
          disabled={!canRoll}
          className={`fc-roll-btn${canRoll ? ' is-armed' : ''}`}
        >
          ⋄ Roll Dice
        </button>
      </div>

      <ScanlineOverlay />
    </div>
    </Modal>
  )
}
