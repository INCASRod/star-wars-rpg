'use client'

// ═══════════════════════════════════════════════════════════════════════════
// PlayerTokenTooltip — Prompt 11: image-first, holographic-materialization
// tooltip for every token a player can currently see (PCs, and any revealed
// enemy/friendly NPC or vehicle). Replaces the old Kyber-stat-block copy that
// used to live in HudSessionTab.tsx. Built against player-tooltip-mockup.html
// — formation/dissolution timelines and positioning math are ported as
// closely as possible (direct DOM/ref writes for position + GSAP state,
// exactly like the mockup and like EncounterDossier's own FLIP animation —
// React state only drives WHAT renders, never the transient animation
// values, so there's no double-render flicker).
//
// Portaled to document.body — this also happens to be why the card is
// guaranteed Ember Tatooine regardless of whatever HUD theme the player has
// personally toggled: PlayerHUDDesktop's data-theme override lives on its
// own wrapper div, not <html>/<body>, so a body-level portal structurally
// sits outside that override and only ever sees :root's Ember defaults.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Z, COLOR, HUD } from '@/lib/tokens'

const CARD_W       = 168 // px intentional — fixed floating-card width, matches mockup exactly
const TOP_MARGIN   = 54  // px intentional — top-bar clearance for the above/below room check
const SIDE_MARGIN  = 8   // px intentional — viewport edge clamp margin

export type PlayerTooltipRole = 'pc' | 'enemy' | 'friendly'

export interface PlayerTooltipEntity {
  /** Stable per hovered instance — lets the effect below tell "same token, re-fired" apart from "different token". */
  key:        string
  name:       string
  role:       PlayerTooltipRole
  /** MINION / RIVAL / NEMESIS / vehicle-type label — omitted for PCs (no such classification). */
  typeTag?:   string
  imageUrl:   string | null
  wounds:     { current: number; max: number; label: string }
  /** Mutually exclusive with minionPips — non-minion entities get a strain row instead of pips. */
  strain?:    { current: number; max: number; label: string }
  /** Mutually exclusive with strain — minion groups show alive/dead pips instead. */
  minionPips?: { alive: number; total: number }
}

const ROLE_COLOR: Record<PlayerTooltipRole, string> = {
  enemy:    COLOR.red,
  friendly: COLOR.green,
  pc:       HUD.accentPurple,
}

export interface PlayerTokenTooltipProps {
  /** null when nothing is currently hovered. */
  entity:    PlayerTooltipEntity | null
  /** The hovered token's true screen-space rect (see MapCanvas's onTokenHover). null alongside entity=null. */
  tokenRect: DOMRect | null
}

export function PlayerTokenTooltip({ entity, tokenRect }: PlayerTokenTooltipProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const wrapRef  = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const sweepRef = useRef<HTMLDivElement>(null)
  const notchRef = useRef<HTMLDivElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  // Content is React state (drives JSX); position/flip/animation are direct
  // DOM writes in a layout effect (mirrors the mockup's own showTip/hideTip,
  // and EncounterDossier's established FLIP pattern).
  const [displayEntity, setDisplayEntity] = useState<PlayerTooltipEntity | null>(null)
  const [flip, setFlip] = useState<'above' | 'below'>('above')
  // Set by the decision effect below, read by the DOM effect — see its comment.
  const sameTokenRef = useRef(false)

  // Decision effect — the ONLY place that reads `entity`/`tokenRect` to decide
  // show vs. hide vs. "still the same token." Deliberately does NOT touch
  // `wrapRef.current` on the show path: calling `setDisplayEntity(entity)`
  // here does not synchronously attach the DOM node this same pass — on a
  // fresh mount (tooltip was fully hidden a moment ago, `displayEntity` was
  // null) `wrapRef.current` is still null right after this call, since
  // React hasn't committed the render that the state update triggers yet.
  // Confirmed live via Playwright: on a "cold" hover the card's opacity/
  // clipPath/left/top were permanently stuck at their untouched JSX/CSS
  // defaults — the positioning/animation code below was silently no-op'ing
  // on `if (!wrap) return`. All DOM work now lives in the second effect,
  // keyed on `displayEntity` itself, which only fires after that commit.
  useLayoutEffect(() => {
    if (!entity || !tokenRect) {
      const wrap = wrapRef.current
      tlRef.current?.kill()
      if (!wrap || !displayEntity) return
      const frame = frameRef.current
      const tl = gsap.timeline({ onComplete: () => setDisplayEntity(null) })
      tl.to(wrap, { opacity: 0.5, duration: 0.03 })
      if (frame) tl.to(frame, { clipPath: 'inset(0 0 100% 0)', duration: 0.1, ease: 'power2.in' }, 0.03)
      tl.to(wrap, { opacity: 0, scale: 0.75, duration: 0.11, ease: 'power2.in' }, 0.03)
      tlRef.current = tl
      return
    }

    // `entity` is a fresh object every single pointerover — including harmless
    // re-fires for the SAME token (cursor jitter right at the hit-area edge,
    // or the map canvas re-emitting pointerover without a genuine exit in
    // between). Comparing by `entity.key` against what's already displayed
    // (the PREVIOUS render's value, read before this update applies) tells a
    // real "just started hovering a token" apart from that noise.
    sameTokenRef.current = displayEntity?.key === entity.key
    setDisplayEntity(entity)
  }, [entity, tokenRect])

  // DOM effect — positions the card and drives GSAP. Keyed on `displayEntity`
  // (not `entity`): this guarantees `wrapRef.current` is attached, because
  // React only runs this effect after committing whichever render made
  // `displayEntity` (and therefore the conditional JSX below) non-null.
  useLayoutEffect(() => {
    if (!displayEntity || !tokenRect) return
    const wrap = wrapRef.current
    if (!wrap) return
    const frame = frameRef.current
    const sweep = sweepRef.current
    const notch = notchRef.current

    const cardH = wrap.offsetHeight || 200
    const vw = window.innerWidth
    const cx = tokenRect.left + tokenRect.width / 2
    const left = Math.min(Math.max(SIDE_MARGIN, cx - CARD_W / 2), vw - CARD_W - SIDE_MARGIN)
    const roomAbove = tokenRect.top - cardH - 14 > TOP_MARGIN
    const top = roomAbove ? tokenRect.top - cardH - 12 : tokenRect.bottom + 12

    setFlip(roomAbove ? 'above' : 'below')
    wrap.style.left = `${left}px`
    wrap.style.top  = `${top}px`
    if (notch) notch.style.left = `${Math.min(Math.max(14, cx - left), CARD_W - 14)}px`

    if (sameTokenRef.current) {
      // Already shown for this exact token — reposition only (handles camera
      // pan/zoom while hovering), skip re-triggering the entrance animation.
      // Must still kill any in-flight timeline: if the pointer left and came
      // back quickly enough that the ~140ms hide animation (started by the
      // decision effect above) hasn't finished, that timeline is still
      // running and its later steps (opacity back toward 0, clipPath back
      // toward collapsed) would fire AFTER this and undo it — confirmed live
      // via Playwright. Resetting every property either timeline touches
      // (not just opacity) avoids a killed hide leaving clipPath/scale stuck
      // mid-collapse.
      tlRef.current?.kill()
      gsap.set(wrap, { opacity: 1, scale: 1, y: 0 })
      if (frame) gsap.set(frame, { clipPath: 'inset(0 0 0% 0)' })
      if (sweep) gsap.set(sweep, { opacity: 0 })
      return
    }

    tlRef.current?.kill() // never let a rapid re-hover onto a DIFFERENT token stack on an in-flight timeline
    // FORMATION: scale-up from token + vertical clip reveal + scan sweep + settle flicker
    const tl = gsap.timeline()
    tl.set(wrap, { opacity: 1, transformOrigin: roomAbove ? '50% 100%' : '50% 0%' })
      .fromTo(wrap, { scale: 0.6, y: roomAbove ? 10 : -10 }, { scale: 1, y: 0, duration: 0.16, ease: 'power3.out' }, 0)
    if (frame) tl.fromTo(frame, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.18, ease: 'power2.out' }, 0)
    if (sweep) {
      tl.fromTo(sweep, { top: '-18%', opacity: 1 }, { top: '104%', opacity: 0.9, duration: 0.2, ease: 'none' }, 0.02)
        .set(sweep, { opacity: 0 })
    }
    tl.to(wrap, { opacity: 0.55, duration: 0.03 }, 0.18)   // settle flicker
      .to(wrap, { opacity: 1, duration: 0.05 }, 0.21)
    tlRef.current = tl
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayEntity, tokenRect])

  if (!mounted || !displayEntity) return null
  const e = displayEntity
  const roleColor = ROLE_COLOR[e.role]

  return createPortal(
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', width: CARD_W, zIndex: Z.tooltip,
        pointerEvents: 'none', opacity: 0,
        filter: 'drop-shadow(var(--shadow-tooltip))',
      }}
    >
      <span className="ptt-br ptt-br-tl" />
      <span className="ptt-br ptt-br-tr" />
      <span className="ptt-br ptt-br-bl" />
      <span className="ptt-br ptt-br-br" />
      <div ref={frameRef} className="ptt-frame">
        <div className="ptt-roleline" style={{ background: roleColor }} />
        <div className="ptt-art">
          {e.imageUrl
            ? <img src={e.imageUrl} alt="" className="ptt-art-img" />
            : (
              <div
                className="ptt-art-fallback"
                style={{ background: `color-mix(in srgb, ${roleColor} 20%, var(--hud-bg))`, color: roleColor }}
              >
                {e.name.charAt(0).toUpperCase()}
              </div>
            )
          }
          <div className="ptt-scan" />
          <div ref={sweepRef} className="ptt-sweep" />
          {e.typeTag && <span className="ptt-tag" style={{ color: roleColor }}>{e.typeTag}</span>}
          <div className="ptt-ident">
            <div className="ptt-name">{e.name}</div>
          </div>
        </div>
        <div className="ptt-body">
          <VitalRow label={e.wounds.label} current={e.wounds.current} max={e.wounds.max} kind="wound" />
          {e.minionPips ? (
            <div className="ptt-pips">
              <span className="ptt-pips-lbl">SQUAD</span>
              {Array.from({ length: e.minionPips.total }, (_, i) => (
                <span key={i} className={`ptt-pip${i < e.minionPips!.alive ? '' : ' dead'}`} />
              ))}
            </div>
          ) : e.strain ? (
            <VitalRow label={e.strain.label} current={e.strain.current} max={e.strain.max} kind="strain" />
          ) : null}
        </div>
      </div>
      <div ref={notchRef} className={`ptt-notch ptt-notch-${flip}`}>
        <svg width="12" height="7" viewBox="0 0 12 7">
          {/* SVG fill/stroke exception (CLAUDE.md) — CSS vars/color-mix() are
              unsupported here; these mirror --hud-panel @94% / --hud-border-hi
              (ember :root values) as static rgba literals. */}
          <path d="M0 0 L6 7 L12 0 Z" fill="rgba(13,10,7,0.94)" stroke="rgba(176,48,32,0.30)" strokeWidth={1} />
        </svg>
      </div>
    </div>,
    document.body,
  )
}

function VitalRow({ label, current, max, kind }: { label: string; current: number; max: number; kind: 'wound' | 'strain' }) {
  const pct = Math.min(100, (current / Math.max(max, 1)) * 100)
  return (
    <div className="ptt-vrow">
      <div className="ptt-vrow-top">
        <span className="ptt-vrow-lbl">{label}</span>
        <span className="ptt-vrow-num">{current}<small>/{max}</small></span>
      </div>
      <div className="ptt-vbar"><i className={`ptt-vbar-${kind}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
