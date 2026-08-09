'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { C, panelBase } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, SP, FS, RADIUS, Z, EASE, HUD } from '@/lib/tokens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { PresenceSmoke, KOTOR_RED_CSS, KOTOR_BLUE_CSS, NEUTRAL_SMOKE_CSS } from './PresenceSmoke'

// ── Force Presence — player-facing Balance Point track (Prompt B) ────────────
//
// Conditional REPLACEMENT for PresenceCard's Morality/Conflict content when
// campaign_settings.morality_system === 'force_presence' — the swap branch
// lives in ForcePanel.tsx at the FUTURE SWAP POINT, not inside this file or
// inside PresenceCard itself.
//
// 10 Balance Points total, stored as light_points/dark_points integers only;
// Neutral is derived (10 - light - dark), never stored — this component never
// writes a "neutral count", only ever increments/decrements the two real
// counters via onFlipBalancePoint.

const LIGHT_IMG = '/images/factions/LightSymbol.png'
const DARK_IMG  = '/images/factions/DarkSymbol.png'

// Destiny/DestinyGMFlash purple family (var(--hud-accent-purple), #9060D0) —
// already the established dark-side/Force-mechanic violet used throughout
// ForceCheckOverlay, GmShell's Dark Side Destiny UI, ForceNotificationCard,
// DiceRoller's dark pip. Deliberately NOT ForcePanel.tsx's own DARK_PURPLE
// (var(--state-activated)), which is vanilla Morality's Fallen glow — a
// different existing token for a different existing "dark side" context. A
// suitable token already existed here; no new token was added.
const DARK_VIOLET = 'var(--hud-accent-purple)'
const LIGHT_CYAN  = 'var(--die-force)'
const GOLD        = 'var(--hud-gold)'

type PipState = 'neutral' | 'light' | 'dark'

function stateWordFor(lightPoints: number, darkPoints: number): string {
  if (darkPoints >= 7) return 'Fallen'
  if (lightPoints >= 7) return 'Paragon'
  const axis = lightPoints - darkPoints
  if (axis >= 3) return 'Drifting Light'
  if (axis <= -3) return 'Drifting Dark'
  return 'Balanced'
}

// Single canonical axis in [-1, 1] — every consumer in this file (accent
// colour, mote drift, and now PresenceSmoke) reads this same value rather
// than each recomputing (light-dark)/10 independently. The clamp is
// defensive only: pipStates' own model (dark pips fill from index 0, light
// pips from the top, neutral fills whatever's left) makes darkPoints +
// lightPoints <= 10 an existing invariant, so axis is already always within
// [-1, 1] in practice — this doesn't change any existing value, only gives
// PresenceSmoke a single source to share instead of a second calculation.
function axisFor(lightPoints: number, darkPoints: number): number {
  return Math.max(-1, Math.min(1, (lightPoints - darkPoints) / 10))
}

// violet ↔ gold ↔ cyan, driven by axis — computed once per render from props
// (not a continuous JS tween: color-mix() strings aren't numerically
// tweenable), assigned to a single CSS custom property so every consumer
// (border, corner ticks, state word) reads the same value and moves
// together, per the spec.
function accentColorFor(axis: number): string {
  const t = Math.abs(axis)
  const toward = axis >= 0 ? LIGHT_CYAN : DARK_VIOLET
  return `color-mix(in srgb, ${GOLD} ${Math.round((1 - t) * 100)}%, ${toward} ${Math.round(t * 100)}%)`
}

// Exact mask-tint technique as DestinyPoolDisplay.tsx's DestinyIcon — reused
// as-is, sourced from token colours here rather than that file's raw hex.
function PoleEmblem({ side, size, color }: { side: 'light' | 'dark'; size: number; color: string }) {
  const src = side === 'light' ? LIGHT_IMG : DARK_IMG
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block', flexShrink: 0, width: size, height: size,
        WebkitMask: `url('${src}') center/contain no-repeat`,
        mask: `url('${src}') center/contain no-repeat`,
        background: color,
      }}
    />
  )
}

function AxisCornerBrackets({ color }: { color: string }) {
  const s = { position: 'absolute' as const, width: 6, height: 6, transition: `border-color ${EASE.smooth}` }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

// Dark pip contrast fix (Step 2): the violet boxShadow glow is the identity
// — unchanged — but a void-black fill against this card's near-black panel
// tone can still read as a hole with no edge at rest, especially during the
// ambient breathing tween's low point (0 0 1px, see the ambient-life effect
// below). A hairline neutral rim gives it a constant legibility floor that
// never depends on the violet glow's current animated intensity.
function pipFill(state: PipState): { background: string; boxShadow: string; border: string } {
  if (state === 'dark')  return { background: 'color-mix(in srgb, black 85%, transparent)', boxShadow: `0 0 4px ${DARK_VIOLET}`, border: `1px solid color-mix(in srgb, ${C.textFaint} 30%, transparent)` }
  if (state === 'light') return { background: 'color-mix(in srgb, white 92%, transparent)', boxShadow: `0 0 5px ${LIGHT_CYAN}`, border: 'none' }
  return { background: 'transparent', boxShadow: 'none', border: 'none' }
}

function Pip({
  index, pipState, onOpenChooser, registerRef,
}: {
  index: number
  pipState: PipState
  onOpenChooser: (index: number, pipState: PipState, rect: DOMRect) => void
  registerRef: (index: number, el: HTMLDivElement | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const fill = pipFill(pipState)
  return (
    <div
      ref={el => { ref.current = el; registerRef(index, el) }}
      onClick={() => { if (ref.current) onOpenChooser(index, pipState, ref.current.getBoundingClientRect()) }}
      role="button"
      tabIndex={0}
      aria-label={`Balance point ${index + 1}: ${pipState}`}
      style={{
        width: 18, height: 18, borderRadius: RADIUS.full, cursor: 'pointer', flexShrink: 0,
        position: 'relative', overflow: 'hidden',
        background: fill.background, boxShadow: fill.boxShadow, border: fill.border,
      }}
    >
      {pipState === 'neutral' && (
        <>
          {/* half-moon: light upper half, dark lower half */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: 'color-mix(in srgb, white 85%, transparent)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '50%', background: 'color-mix(in srgb, black 80%, transparent)' }} />
        </>
      )}
    </div>
  )
}

interface ChooserState { index: number; fromState: PipState; rect: DOMRect }

function optionsFor(fromState: PipState): { toState: PipState; label: string; placement: 'above' | 'below' }[] {
  if (fromState === 'neutral') return [{ toState: 'light', label: 'Light', placement: 'above' }, { toState: 'dark', label: 'Dark', placement: 'below' }]
  if (fromState === 'light')   return [{ toState: 'neutral', label: 'Neutral', placement: 'above' }, { toState: 'dark', label: 'Dark', placement: 'below' }]
  return [{ toState: 'neutral', label: 'Neutral', placement: 'above' }] // dark pip → Neutral only
}

// Portaled to document.body — panelBase's backdropFilter makes every card its
// own containing block for position:fixed descendants (confirmed, Step 0(e)),
// same reason PurchaseCeremony.tsx already portals.
// Scrim + options live in the SAME portal so neither can end up in a lower
// stacking context than the other (the mockup's exact bug).
function BalanceChooser({
  chooser, onChoose, onDismiss, prefersReducedMotion,
}: {
  chooser: ChooserState
  onChoose: (toState: PipState) => void
  onDismiss: () => void
  prefersReducedMotion: boolean
}) {
  const optionsRef = useRef<HTMLDivElement>(null)
  const options = optionsFor(chooser.fromState)
  const dismissedRef = useRef(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = optionsRef.current
    if (!el || prefersReducedMotion) return
    gsap.fromTo(el, { opacity: 0, scale: 0.8, y: -4 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.8)' })
    return () => { gsap.killTweensOf(el); gsap.set(el, { clearProps: 'all' }) }
  }, [prefersReducedMotion])

  const dismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    const el = optionsRef.current
    if (!el || prefersReducedMotion) { onDismiss(); return }
    gsap.to(el, { opacity: 0, scale: 0.9, duration: 0.12, ease: 'power1.in', onComplete: onDismiss })
  }

  return createPortal(
    <>
      <div onClick={dismiss} style={{ position: 'fixed', inset: 0, zIndex: Z.hudSupreme - 1 }} />
      {/* Positioning anchor — GSAP must never touch this element directly:
          animating opacity/scale/y on an element that also carries React's
          position/zIndex/left/top inline styles clobbered those positioning
          styles in practice (confirmed live — the anchor lost position:fixed
          and z-index entirely after the entrance tween ran, leaving the
          scrim on top and eating every option's click). GSAP now only ever
          touches the plain inner wrapper below; this anchor is untouched. */}
      <div style={{ position: 'fixed', left: chooser.rect.left + chooser.rect.width / 2, top: chooser.rect.top + chooser.rect.height / 2, zIndex: Z.hudSupreme }}>
        <div ref={optionsRef}>
          {options.map(opt => {
            const optColor = opt.toState === 'light' ? LIGHT_CYAN : opt.toState === 'dark' ? DARK_VIOLET : C.text
            return (
              <button
                key={opt.toState}
                onClick={() => { dismiss(); onChoose(opt.toState) }}
                style={{
                  position: 'absolute', left: 0, top: opt.placement === 'above' ? -8 : 8,
                  transform: `translate(-50%, ${opt.placement === 'above' ? '-100%' : '0%'})`,
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  padding: `${SP[1]} ${SP[3]}`, borderRadius: RADIUS.md,
                  background: 'var(--hud-panel)',
                  border: `1px solid ${optColor === C.text ? C.border : optColor}`,
                  color: optColor, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </>,
    document.body,
  )
}

function TallyReadout({ label, value, color, emblem }: { label: string; value: number; color: string; emblem: 'light' | 'dark' }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const valueRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value === prevValueRef.current) return
    prevValueRef.current = value
    if (prefersReducedMotion || !valueRef.current) return
    const el = valueRef.current
    gsap.fromTo(
      el,
      { scale: 1 },
      {
        scale: 1.35, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut',
        onComplete: () => gsap.set(el, { clearProps: 'scale' }),
      },
    )
    gsap.fromTo(
      el,
      { textShadow: '0 0 0px transparent' },
      {
        textShadow: `0 0 10px ${color}`, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut',
        onComplete: () => gsap.set(el, { clearProps: 'textShadow' }),
      },
    )
  }, [value, prefersReducedMotion, color])

  return (
    <div className="flex items-center" style={{ gap: SP[1] }}>
      <PoleEmblem side={emblem} size={12} color={color} />
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span ref={valueRef} style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color, display: 'inline-block' }}>
        {value}
      </span>
    </div>
  )
}

export interface ForcePresenceCardProps {
  lightPoints: number
  darkPoints: number
  sessionConflict: number
  sessionTranquility: number
  onFlipBalancePoint?: (fromState: PipState, toState: PipState) => Promise<void>
}

export function ForcePresenceCard({
  lightPoints, darkPoints, sessionConflict, sessionTranquility, onFlipBalancePoint,
}: ForcePresenceCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { isOpen } = useHudPanelContext()
  const pipRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const moteContainerRef = useRef<HTMLDivElement>(null)
  const ceremonyOverlayRef = useRef<HTMLDivElement>(null)
  const [chooser, setChooser] = useState<ChooserState | null>(null)
  const [ceremony, setCeremony] = useState<'light' | 'dark' | null>(null)
  const prevThresholdRef = useRef<'none' | 'light' | 'dark'>(darkPoints >= 7 ? 'dark' : lightPoints >= 7 ? 'light' : 'none')

  const pipStates = useMemo<PipState[]>(
    () => Array.from({ length: 10 }, (_, i) => (i < darkPoints ? 'dark' : i >= 10 - lightPoints ? 'light' : 'neutral')),
    [lightPoints, darkPoints],
  )
  const stateWord = stateWordFor(lightPoints, darkPoints)
  const axis = axisFor(lightPoints, darkPoints)
  const accentColor = accentColorFor(axis)

  // ── Threshold ceremony — fires ONLY on the transition edge, including for
  // GM-driven writes arriving via the existing characters realtime
  // subscription (this effect only watches the two point props, regardless
  // of where their change came from). Never re-fires on remount/refetch
  // while already in-threshold, since prevThresholdRef only updates here.
  useEffect(() => {
    const current = darkPoints >= 7 ? 'dark' : lightPoints >= 7 ? 'light' : 'none'
    const prev = prevThresholdRef.current
    if (current !== prev && current !== 'none' && !prefersReducedMotion) {
      setCeremony(current)
    }
    prevThresholdRef.current = current
  }, [lightPoints, darkPoints, prefersReducedMotion])

  useEffect(() => {
    if (!ceremony) return
    const el = ceremonyOverlayRef.current
    if (!el) { setCeremony(null); return }
    const color = ceremony === 'dark' ? DARK_VIOLET : LIGHT_CYAN
    const originSide = ceremony === 'dark' ? '0%' : '100%'
    const tl = gsap.timeline({ onComplete: () => { gsap.set(el, { clearProps: 'all' }); setCeremony(null) } })
    tl.set(el, { opacity: 0, background: `radial-gradient(circle at ${originSide} 50%, ${color}, transparent 70%)` })
    tl.to(el, { opacity: 1, duration: 0.45, ease: 'power2.out' })
    tl.to(el, { opacity: 0, duration: 1.3, ease: 'power2.in' }, '+=0.25')

    const skip = () => tl.progress(1)
    el.addEventListener('click', skip)
    return () => { el.removeEventListener('click', skip); tl.kill(); gsap.set(el, { clearProps: 'all' }) }
  }, [ceremony])

  // ── Ambient life — breathing light pips, absorbing dark pips, particulate
  // drift toward the dominant pole. Paused entirely when reduced-motion is
  // set OR the Force tab isn't the open panel (HudPanelContext), and killed
  // + clearProps'd on cleanup, same convention as runEnergyTrace/
  // runTreeEntrance/runCommitFlight elsewhere in this codebase.
  useEffect(() => {
    if (prefersReducedMotion || !isOpen) return
    const tweenedEls: HTMLElement[] = []

    pipStates.forEach((state, i) => {
      const el = pipRefs.current.get(i)
      if (!el || state === 'neutral') return
      tweenedEls.push(el)
      if (state === 'light') {
        gsap.to(el, { boxShadow: `0 0 11px ${LIGHT_CYAN}`, duration: 2, delay: i * 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      } else {
        gsap.to(el, { boxShadow: `0 0 1px ${DARK_VIOLET}`, duration: 3, delay: i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      }
    })

    // Sparse particulate drift — low tens of DOM motes (cheaper than canvas
    // for this count), near-imperceptible at Balanced, drifting toward
    // whichever pole currently dominates.
    const container = moteContainerRef.current
    const motes: HTMLElement[] = []
    if (container) {
      const dir = axis >= 0 ? 1 : -1
      const strength = Math.min(1, Math.abs(axis))
      for (let i = 0; i < 10; i++) {
        const mote = document.createElement('span')
        mote.setAttribute('aria-hidden', 'true')
        Object.assign(mote.style, {
          position: 'absolute', width: '2px', height: '2px', borderRadius: '50%',
          background: axis >= 0 ? LIGHT_CYAN : DARK_VIOLET,
          opacity: '0', top: `${20 + Math.random() * 60}%`, left: `${Math.random() * 100}%`,
          pointerEvents: 'none',
        })
        container.appendChild(mote)
        motes.push(mote)
        gsap.to(mote, {
          x: `+=${dir * (18 + Math.random() * 35) * (0.15 + strength)}`,
          opacity: 0.3 * (0.25 + strength),
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }

    return () => {
      tweenedEls.forEach(el => { gsap.killTweensOf(el); gsap.set(el, { clearProps: 'boxShadow' }) })
      motes.forEach(m => { gsap.killTweensOf(m); m.remove() })
    }
  }, [prefersReducedMotion, isOpen, pipStates, lightPoints, darkPoints, axis])

  const handleChoose = (toState: PipState) => {
    if (!chooser || !onFlipBalancePoint) { setChooser(null); return }
    const { fromState, index } = chooser
    setChooser(null)

    // Flip consequence — spin-pop + ripple through neighbours + pole flare.
    // Purely cosmetic: the write below is never gated by or awaited on it.
    if (!prefersReducedMotion) {
      const el = pipRefs.current.get(index)
      if (el) {
        gsap.timeline()
          .fromTo(el, { scale: 1 }, { scale: 1.6, duration: 0.18, ease: 'back.out(2.5)' })
          .to(el, { scale: 1, duration: 0.22, ease: 'power2.out', onComplete: () => gsap.set(el, { clearProps: 'scale' }) })
      }
      ;[index - 1, index + 1].forEach(ni => {
        const neighbor = pipRefs.current.get(ni)
        if (!neighbor) return
        gsap.fromTo(
          neighbor,
          { scale: 1 },
          { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut', onComplete: () => gsap.set(neighbor, { clearProps: 'scale' }) },
        )
      })
      if (toState !== 'neutral') {
        const poleEl = pipRefs.current.get(toState === 'light' ? 9 : 0) // approximate pole-adjacent flare target
        if (poleEl) gsap.fromTo(poleEl, { filter: 'none' }, { filter: `drop-shadow(0 0 8px ${toState === 'light' ? LIGHT_CYAN : DARK_VIOLET})`, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut', onComplete: () => gsap.set(poleEl, { clearProps: 'filter' }) })
      }
    }

    onFlipBalancePoint(fromState, toState).catch(err => console.error('[ForcePresenceCard] flip failed:', err))
  }

  return (
    <div style={{
      ...panelBase, padding: 'var(--space-3) var(--space-4)', position: 'relative', overflow: 'hidden',
      borderColor: accentColor, transition: `border-color ${EASE.smooth}`,
      // Step 2 contrast fix — one surface tone lighter than panelBase's
      // default (HUD.panel, the darkest tier) so void-black Dark pips read
      // against it at rest without relying on the smoke layer for contrast,
      // plus a soft radial lift centred on the pip scale's own band (~62%
      // down the card) so that's where the extra headroom concentrates
      // rather than lightening the whole card evenly. Existing tokens only.
      background: `radial-gradient(ellipse 70% 45% at 50% 62%, color-mix(in srgb, ${HUD.surfaceHi} 55%, transparent) 0%, transparent 75%), ${HUD.surfaceLo}`,
    }}>
      {prefersReducedMotion ? (
        // Reduced motion — no Three canvas at all. A static, extremely
        // subtle axis-tinted wash keeps the alignment colour cue without any
        // animation; same axis value, same KOTOR colours, CSS only.
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 50% at 50% 55%, color-mix(in srgb, ${axis === 0 ? NEUTRAL_SMOKE_CSS : axis > 0 ? KOTOR_BLUE_CSS : KOTOR_RED_CSS} ${Math.round(Math.abs(axis) * 10 + 4)}%, transparent) 0%, transparent 70%)`,
          }}
        />
      ) : isOpen ? (
        // Mount/unmount IS the pause mechanism here — same effect as the
        // mote layer's own `if (prefersReducedMotion || !isOpen) return`
        // early-out: closing the Force tab unmounts this, running its full
        // cleanup (renderer.dispose(), etc.) rather than merely hiding a
        // still-rendering canvas; reopening remounts and recreates it fresh.
        <PresenceSmoke axis={axis} surge={ceremony} />
      ) : null}
      <div ref={moteContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} />
      <div
        ref={ceremonyOverlayRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: ceremony ? 'auto' : 'none', cursor: ceremony ? 'pointer' : 'default' }}
      />
      <AxisCornerBrackets color={accentColor} />

      <div className="flex items-center justify-between" style={{ marginBottom: SP[2], position: 'relative' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim }}>
          Force Presence
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, transition: `color ${EASE.smooth}` }}>
          {stateWord}
        </div>
      </div>

      {(darkPoints >= 7 || lightPoints >= 7) && (
        <div style={{
          marginBottom: SP[2], padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, position: 'relative',
          background: `color-mix(in srgb, ${darkPoints >= 7 ? DARK_VIOLET : LIGHT_CYAN} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${darkPoints >= 7 ? DARK_VIOLET : LIGHT_CYAN} 40%, transparent)`,
          display: 'flex', alignItems: 'center', gap: SP[2],
        }}>
          <PoleEmblem side={darkPoints >= 7 ? 'dark' : 'light'} size={14} color={darkPoints >= 7 ? DARK_VIOLET : LIGHT_CYAN} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: darkPoints >= 7 ? DARK_VIOLET : LIGHT_CYAN }}>
            {darkPoints >= 7
              ? 'FALLEN TO THE DARK SIDE — −2 Strain Threshold · +2 Wound Threshold · Force pips generated from Dark results'
              : 'LIGHT SIDE PARAGON — +2 Strain Threshold'}
          </span>
        </div>
      )}

      <div className="flex items-center" style={{ gap: SP[2], position: 'relative' }}>
        <PoleEmblem side="dark" size={20} color={DARK_VIOLET} />
        <div className="flex items-center" style={{ gap: 3, flex: 1, justifyContent: 'center' }}>
          {pipStates.map((state, i) => (
            <Pip
              key={i}
              index={i}
              pipState={state}
              onOpenChooser={(idx, s, rect) => setChooser({ index: idx, fromState: s, rect })}
              registerRef={(idx, el) => { if (el) pipRefs.current.set(idx, el); else pipRefs.current.delete(idx) }}
            />
          ))}
        </div>
        <PoleEmblem side="light" size={20} color={LIGHT_CYAN} />
      </div>

      <div style={{ marginTop: SP[3], paddingTop: SP[2], borderTop: `1px solid ${C.border}`, position: 'relative' }}>
        <div className="flex items-center justify-center" style={{ gap: SP[2] }}>
          <TallyReadout label="Conflict" value={sessionConflict} color={DARK_VIOLET} emblem="dark" />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint }}>VS</span>
          <TallyReadout label="Tranquility" value={sessionTranquility} color={LIGHT_CYAN} emblem="light" />
        </div>
        <div style={{ marginTop: SP[1], textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.overline, color: C.textFaint, fontStyle: 'italic' }}>
          Session tally — resolved by the GM at session&apos;s end.
        </div>
      </div>

      {chooser && (
        <BalanceChooser chooser={chooser} onChoose={handleChoose} onDismiss={() => setChooser(null)} prefersReducedMotion={prefersReducedMotion} />
      )}
    </div>
  )
}
