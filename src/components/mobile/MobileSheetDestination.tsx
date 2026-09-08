'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import type { Character, CharacterCriticalInjury, CharacterSpecialization, RefDutyType, RefObligationType, RefSpecialization } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'
import type { MoralitySystem } from '@/lib/moralitySystem'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'
import { RichText } from '@/components/ui/RichText'
import type { BalancePointState } from '@/lib/forceUtils'
import { CHAR_COLOR, type CharKey } from '@/lib/tokens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { MobileForcePresenceEditor } from './MobileForcePresenceEditor'

const CHARACTERISTICS: { key: CharKey; label: string }[] = [
  { key: 'brawn',     label: 'Brawn' },
  { key: 'agility',   label: 'Agility' },
  { key: 'intellect', label: 'Intellect' },
  { key: 'cunning',   label: 'Cunning' },
  { key: 'willpower', label: 'Willpower' },
  { key: 'presence',  label: 'Presence' },
]

/**
 * Entrance count-up — the rendered `value` is ALWAYS the real, final number
 * (this is what a no-JS/first-paint/reduced-motion render shows, unchanged).
 * When motion is allowed, an effect on mount tweens a local display value
 * from 0 up to `value` and snaps to the exact target on completion, so
 * float rounding never leaves a mismatched final digit.
 */
function CountUp({ value, className }: { value: number; className?: string }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)
  const mountedOnce = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion) { setDisplay(value); return }
    if (mountedOnce.current) { setDisplay(value); return } // data changed after entrance — no re-animation, just show it
    mountedOnce.current = true
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: value, duration: 1, ease: 'power2.out', delay: 0.15,
      onUpdate: () => setDisplay(Math.round(obj.v)),
      onComplete: () => setDisplay(value),
    })
    return () => { tween.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])

  return <span className={className}>{display}</span>
}

function CollapsibleSection({ icon, title, sub, text }: { icon: string; title: string; sub?: string; text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="m-lore-card">
      <button type="button" className="m-lore-toggle" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="m-lore-icon" aria-hidden="true">{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <div className="m-lore-toggle-title">{title}</div>
          {sub && <div className="m-lore-toggle-sub">{sub}</div>}
        </span>
        <span className="m-lore-toggle-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="m-lore-body"><RichText text={text} /></div>}
    </div>
  )
}

function CritCard({ crit, onHeal }: { crit: CharacterCriticalInjury; onHeal: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="m-crit-card">
      <div className="m-crit-head">
        <span className="m-crit-severity">{crit.severity}</span>
      </div>
      <div className="m-crit-name">{crit.custom_name ?? 'Critical Injury'}</div>
      {crit.description && <div className="m-crit-desc"><RichText text={crit.description} /></div>}
      <button
        type="button"
        className={`m-crit-heal-btn${confirming ? ' is-confirming' : ''}`}
        onClick={() => {
          if (!confirming) { setConfirming(true); return }
          onHeal(crit.id)
        }}
      >
        {confirming ? 'Tap again to confirm heal' : 'Mark Healed'}
      </button>
    </div>
  )
}

/** Fade+rise entrance for a section — respects reduced motion by simply
 *  never running (the JSX beneath already renders in its final state). */
function useEntranceRef<T extends HTMLElement>(delay: number, prefersReducedMotion: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return
    const el = ref.current
    // Driven via a proxy object + filter:opacity() rather than GSAP's own
    // `opacity` property tween, per the "never gate visibility via the
    // opacity CSS property" rule.
    const state = { y: 14, o: 0 }
    el.style.filter = 'opacity(0%)'
    const tween = gsap.to(state, {
      y: 0, o: 100, duration: 0.5, ease: 'power3.out', delay,
      onUpdate: () => { el.style.transform = `translateY(${state.y}px)`; el.style.filter = `opacity(${state.o}%)` },
      onComplete: () => { el.style.transform = ''; el.style.filter = '' },
    })
    return () => { tween.kill(); el.style.transform = ''; el.style.filter = '' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])
  return ref
}

/** Fill bar from 0 to its real (already-known) target width. */
function useBarFillRef<T extends HTMLElement>(pct: number, delay: number, prefersReducedMotion: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    if (prefersReducedMotion) { el.style.width = `${pct}%`; return }
    const obj = { w: 0 }
    const tween = gsap.to(obj, {
      w: pct, duration: 0.9, ease: 'power2.out', delay,
      onUpdate: () => { el.style.width = `${obj.w}%` },
    })
    return () => { tween.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, pct])
  return ref
}

/**
 * Optional decorative ember layer — first thing to cut if it costs frame
 * rate. Renders nothing at all under reduced motion (no particles is the
 * requirement, not slower particles). A small, fixed particle count driven
 * by GSAP's own ticker (not a custom rAF loop) — measured live at a mobile
 * viewport, see the redesign report for the frame-rate figure and keep/cut
 * decision.
 */
function EmberLayer() {
  const hostRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const embers: HTMLSpanElement[] = []
    const tweens: gsap.core.Tween[] = []
    for (let i = 0; i < 10; i++) {
      const e = document.createElement('span')
      e.className = 'm-sheet-ember'
      e.style.left = `${Math.random() * 100}%`
      host.appendChild(e)
      embers.push(e)
      gsap.set(e, { y: 800 + Math.random() * 200 })
      const state = { y: 800, o: 0 }
      const tween = gsap.to(state, {
        y: -40, o: 50, duration: 14 + Math.random() * 12, repeat: -1, delay: Math.random() * 14, ease: 'none',
        onUpdate: () => { e.style.transform = `translateY(${state.y}px)`; e.style.filter = `opacity(${state.o}%)` },
      })
      tweens.push(tween)
    }
    return () => { tweens.forEach(t => t.kill()); embers.forEach(e => e.remove()) }
  }, [])
  return <div className="m-sheet-embers" ref={hostRef} aria-hidden="true" />
}

export interface MobileSheetDestinationProps {
  character: Character
  effectiveStats: EffectiveStats | null
  forceRating: number
  careerName: string | null
  speciesName: string | null
  speciesDescription: string | null
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refObligationTypes: RefObligationType[]
  refDutyTypes: RefDutyType[]
  crits: CharacterCriticalInjury[]
  onHealCrit: (id: string) => void
  moralitySystem: MoralitySystem | null
  moralitySystemError: string | null
  conflicts: ConflictEntry[]
  onFlipBalancePoint: (fromState: BalancePointState, toState: BalancePointState) => Promise<void>
  /** Same opener the header Wounds/Strain cells already use (MobileShell's
   *  `setVitalField`) — wired here too so the meters below are tappable, per
   *  the redesign's own requirement. Not a new write path: it opens the
   *  existing, unmodified MobileVitalAdjustSheet. */
  onOpenVitalAdjust: (field: 'wound_current' | 'strain_current') => void
}

/**
 * Sheet destination — Identity, Characteristics, Derived Stats, Critical
 * Injuries, Morality/Force Presence, Lore. Everything here is read-only
 * except the crit-injury heal action and Force Presence editing (both
 * pre-existing, unchanged write paths — this is a visual redesign only).
 */
export function MobileSheetDestination({
  character, effectiveStats, forceRating, careerName, speciesName, speciesDescription,
  charSpecs, refSpecMap, refObligationTypes, refDutyTypes, crits, onHealCrit,
  moralitySystem, moralitySystemError, conflicts, onFlipBalancePoint, onOpenVitalAdjust,
}: MobileSheetDestinationProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const dutyResolvedName = character.duty_type ? resolveDutyName(character, refDutyTypes) : null
  const obligationResolvedName = character.obligation_type ? resolveObligationName(character, refObligationTypes) : null
  const dutyDescription = character.duty_lore || character.duty_notes || ''
  const obligationDescription = character.obligation_lore || character.obligation_notes || ''
  const motivationText = character.motivation_description || character.obligation_notes || character.duty_notes || ''
  const motivationLabel = [character.motivation_type, character.motivation_specific].filter(Boolean).join(' · ')

  const es = effectiveStats
  const woundThreshold  = es?.woundThreshold  ?? character.wound_threshold
  const strainThreshold = es?.strainThreshold ?? character.strain_threshold
  const woundCurrent  = character.wound_current ?? 0
  const strainCurrent = character.strain_current ?? 0
  const woundPct  = woundThreshold  > 0 ? Math.min(100, (woundCurrent  / woundThreshold)  * 100) : 0
  const strainPct = strainThreshold > 0 ? Math.min(100, (strainCurrent / strainThreshold) * 100) : 0

  const activeConflicts = conflicts.filter(c => !c.is_resolved)

  const hasAnyLore = !!speciesName
    || (character.duty_obligation_configured && !!obligationResolvedName)
    || (character.duty_obligation_configured && !!dutyResolvedName)
    || !!(character.motivation_type || character.motivation_specific)

  const bannerRef = useEntranceRef<HTMLDivElement>(0, prefersReducedMotion)
  const charsRef  = useEntranceRef<HTMLDivElement>(0.15, prefersReducedMotion)
  const defRef    = useEntranceRef<HTMLDivElement>(0.25, prefersReducedMotion)
  const metersRef = useEntranceRef<HTMLDivElement>(0.3, prefersReducedMotion)
  const fpRef     = useEntranceRef<HTMLDivElement>(0.35, prefersReducedMotion)
  const woundBarRef  = useBarFillRef<HTMLSpanElement>(woundPct, 0.45, prefersReducedMotion)
  const strainBarRef = useBarFillRef<HTMLSpanElement>(strainPct, 0.45, prefersReducedMotion)

  return (
    <div className="m-sheet-page">
      {!prefersReducedMotion && <EmberLayer />}

      {/* ── Context strip — the shell header already shows portrait, name,
          and spec-or-career · species (MobileHeader.tsx's identityLine); this
          only adds what the header does NOT: a Force-rating tag. Keeps the
          glow + base rule so the section still reads as designed even when
          there's nothing else to show (a non-Force-sensitive character). ── */}
      <div className="m-sheet-banner" ref={bannerRef}>
        <div className="m-sheet-banner-glow" aria-hidden="true" />
        {character.is_force_sensitive && (
          <div className="m-sheet-tags">
            <span className="m-sheet-tag is-force">Force {forceRating}</span>
          </div>
        )}
      </div>

      {/* ── XP — available only, per this redesign's own instruction (no total/spent/track) ── */}
      <div className="m-sheet-xp">
        <CountUp value={character.xp_available ?? 0} className="m-sheet-xp-value" />
        <span className="m-sheet-xp-label">Available XP</span>
      </div>

      {/* ── Characteristics ── */}
      <div className="m-sheet-section-label">Characteristics</div>
      <div className="m-char-grid" ref={charsRef}>
        {CHARACTERISTICS.map(c => (
          <div
            key={c.key}
            className="m-hex"
            // CHAR_COLOR — approved raw-hex exception (tokens.ts) — threaded
            // in as a CSS custom property so the CSS rules (border/glow/
            // label-tint) can reference it without hardcoding hex in the
            // stylesheet; single source of truth stays tokens.ts.
            style={{ '--char': CHAR_COLOR[c.key] } as CSSProperties}
          >
            <span className="m-hex-shape" aria-hidden="true" />
            <span className="m-hex-glow" aria-hidden="true" />
            <CountUp value={character[c.key] as number} className="m-hex-value" />
            <span className="m-hex-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* ── Defences ── */}
      <div className="m-sheet-section-label">Defences</div>
      <div className="m-derived-grid" ref={defRef}>
        <div className="m-char-box is-soak">
          <CountUp value={es?.soak ?? character.soak} className="m-char-value" />
          <span className="m-char-label">Soak</span>
        </div>
        <div className="m-char-box">
          <CountUp value={es?.defenseMelee ?? character.defense_melee} className="m-char-value" />
          <span className="m-char-label">Melee</span>
        </div>
        <div className="m-char-box">
          <CountUp value={es?.defenseRanged ?? character.defense_ranged} className="m-char-value" />
          <span className="m-char-label">Ranged</span>
        </div>
      </div>

      {/* ── Wounds / Strain meters — tap opens the existing adjuster ── */}
      <div className="m-vital-meters" ref={metersRef}>
        <button type="button" className="m-vital-meter is-wound" onClick={() => onOpenVitalAdjust('wound_current')}>
          <span className="m-vital-meter-chevron" aria-hidden="true">›</span>
          <div className="m-vital-meter-top">
            <CountUp value={woundCurrent} className="m-vital-meter-cur" />
            <span className="m-vital-meter-max">/ {woundThreshold}</span>
          </div>
          <div className="m-vital-meter-label">Wounds</div>
          <div className="m-vital-meter-bar"><span className="m-vital-meter-bar-fill" ref={woundBarRef} /></div>
        </button>
        <button type="button" className="m-vital-meter is-strain" onClick={() => onOpenVitalAdjust('strain_current')}>
          <span className="m-vital-meter-chevron" aria-hidden="true">›</span>
          <div className="m-vital-meter-top">
            <CountUp value={strainCurrent} className="m-vital-meter-cur" />
            <span className="m-vital-meter-max">/ {strainThreshold}</span>
          </div>
          <div className="m-vital-meter-label">Strain</div>
          <div className="m-vital-meter-bar"><span className="m-vital-meter-bar-fill" ref={strainBarRef} /></div>
        </button>
      </div>

      {/* ── Critical injuries ── */}
      {crits.length > 0 && (
        <>
          <div className="m-sheet-section-label">Critical Injuries</div>
          {crits.map(c => <CritCard key={c.id} crit={c} onHeal={onHealCrit} />)}
        </>
      )}

      {/* ── Morality / Force Presence ── */}
      <div className="m-sheet-section-label">{moralitySystem === 'force_presence' ? 'Force Presence' : 'Morality'}</div>
      <div ref={fpRef}>
        {moralitySystemError ? (
          <div className="m-morality-not-configured">{moralitySystemError}</div>
        ) : moralitySystem === 'force_presence' ? (
          // Editable — desktop's ForcePresenceCard is not reused for the
          // interactive path (its pips/popup are too small for touch); see
          // MobileForcePresenceEditor.tsx's own doc comment. Restyled here
          // (lead counts, balance bar, aura) with its interaction, queue and
          // write path completely unchanged.
          <MobileForcePresenceEditor
            lightPoints={character.light_points ?? 0}
            darkPoints={character.dark_points ?? 0}
            sessionConflict={character.session_conflict ?? 0}
            sessionTranquility={character.session_tranquility ?? 0}
            onFlipBalancePoint={onFlipBalancePoint}
          />
        ) : character.morality_configured === false || character.morality_value === undefined ? (
          <div className="m-morality-not-configured">Morality not configured — GM setup required.</div>
        ) : (
          <div className="m-morality-card">
            <div className="m-morality-head">
              <span className="m-morality-value">{character.morality_value}</span>
              {activeConflicts.length > 0 && <span className="m-crit-severity">{activeConflicts.length} unresolved</span>}
            </div>
            <div className="m-morality-track">
              <div className="m-morality-track-fill" style={{ width: `${Math.min(100, Math.max(0, character.morality_value))}%` }} />
            </div>
            <div className="m-morality-poles">
              <span>{character.morality_weakness_key || 'Weakness'}</span>
              <span>{character.morality_strength_key || 'Strength'}</span>
            </div>
            {conflicts.length > 0 && (
              <div className="m-morality-conflict">{conflicts.length} conflict{conflicts.length === 1 ? '' : 's'} recorded this campaign.</div>
            )}
          </div>
        )}
      </div>

      {/* ── Lore ── */}
      <div className="m-sheet-section-label">Lore</div>
      {hasAnyLore ? (
        <>
          {speciesName && (
            <CollapsibleSection icon="◈" title="Species" sub={speciesName} text={speciesDescription || 'No description recorded.'} />
          )}
          {character.duty_obligation_configured && obligationResolvedName && (
            <CollapsibleSection
              icon="◆"
              title="Obligation"
              sub={`${obligationResolvedName} · ${character.obligation_value ?? 0}`}
              text={obligationDescription || 'No description recorded.'}
            />
          )}
          {character.duty_obligation_configured && dutyResolvedName && (
            <CollapsibleSection
              icon="◆"
              title="Duty"
              sub={`${dutyResolvedName} · ${character.duty_value ?? 0}`}
              text={dutyDescription || 'No description recorded.'}
            />
          )}
          {(character.motivation_type || character.motivation_specific) && (
            <CollapsibleSection icon="◇" title="Motivation" sub={motivationLabel} text={motivationText || 'No description recorded.'} />
          )}
        </>
      ) : (
        // A heading with nothing beneath it is the one outcome that's not
        // acceptable (FIX prompt, D.3) — every other section here already
        // guarantees something renders under its heading (Force Presence's
        // ternary always has a branch; Critical Injuries omits its own
        // heading entirely when there are none, see below). Lore was the
        // one gap: all four items are independently gated and none of them
        // guaranteed a fallback when every condition is false at once.
        <div className="m-morality-not-configured">Nothing recorded.</div>
      )}
    </div>
  )
}
