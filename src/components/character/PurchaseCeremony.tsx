'use client'

import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, SHADOW } from '@/lib/tokens'
import { FORCE_HEADER_BG, FORCE_HEADER_TEXT, type HandCard } from '@/components/player-hud/HandOverlay'
import { TalentsRouteHandReveal } from './TalentsRouteHandReveal'

// ─────────────────────────────────────────────────────────────────────────────
// PurchaseCeremony — shared portal/backdrop/skip/reduced-motion shell for both
// the talent purchase ceremony and the spec purchase celebration (Prompt 9).
// The two share every piece of infrastructure (portal to document.body — same
// pattern as TalentDossier.tsx, which already works correctly; a dimming
// backdrop; click-anywhere skip; a reduced-motion static fallback) and differ
// only in content and a few beats, so one component renders both rather than
// duplicating that infrastructure twice.
//
// CRITICAL ORDERING: this component is never responsible for the DB write.
// By the time a caller renders <PurchaseCeremony>, the purchase has ALREADY
// completed (the caller awaited the real mutation and only sets ceremony
// state on a truthy/successful result) — this component is pure presentation
// layered on top of a state change that already happened. If the write fails,
// callers never render this at all.
//
// HANDOFF: the talent ceremony's card is a portalled REPLICA, not the real
// plaque — it animates from the real plaque's captured sourceRect out to
// centre stage and back, then fades out. The real plaque underneath already
// re-rendered in its final owned-plate state the instant React state updated
// (before this component even mounted), so when the replica fades away at
// the same position, what's revealed is the real, already-correct plaque —
// no clone persists, nothing is left behind.
// ─────────────────────────────────────────────────────────────────────────────

export interface TalentCeremonyPayload {
  kind: 'talent'
  name: string
  cost: number
  activationBg: string
  activationText: string
  isForceTalent: boolean
  /** The real plaque's rect at the moment of purchase — the replica card animates from and back to this. Null if unavailable (e.g. sig base node with no easily-measured rect) — falls back to centre-only. */
  sourceRect: { top: number; left: number; width: number; height: number } | null
  /** True when this purchase lands in the player's hand (active talent / Force base power) rather than staying on the plaque grid. Card exits into the ephemeral hand-reveal (H4b) instead of reversing back to sourceRect. */
  handBound?: boolean
}

export interface SpecCeremonyPayload {
  kind: 'spec'
  name: string
  cost: number
  /** Already display names, already the newly-granted diff — caller's job, not this component's. */
  newSkillNames: string[]
}

/** Force Prompt F4 — same lift/drain/burst/stamp/return grammar as
 * TalentCeremonyPayload, minus the activation-token colouring (Force
 * abilities have no activation concept). `powerName` is shown under the
 * ability name since a player may own several Force powers at once — the
 * plain ability name alone wouldn't say which tree it belongs to.
 * `rankLabel` is set only for a multi-purchase node's 2nd+ position
 * (e.g. JERINFRANGE, WARFORDURATION) — omitted for single-position abilities. */
export interface ForceCeremonyPayload {
  kind: 'force'
  name: string
  powerName: string
  cost: number
  rankLabel?: string
  /** The real plaque's rect at the moment of purchase — same contract as TalentCeremonyPayload.sourceRect. */
  sourceRect: { top: number; left: number; width: number; height: number } | null
  /** True when this purchase lands in the player's hand (Force base power) rather than staying on the plaque grid. Card exits toward the hand instead of reversing back to sourceRect. */
  handBound?: boolean
}

export interface PurchaseCeremonyProps {
  payload: TalentCeremonyPayload | SpecCeremonyPayload | ForceCeremonyPayload
  xpBefore: number
  xpAfter: number
  reducedMotion: boolean
  onDone: () => void
}

const CARD_CENTER_WIDTH = 320
const CARD_CENTER_HEIGHT = 200

export function PurchaseCeremony({ payload, xpBefore, xpAfter, reducedMotion, onDone }: PurchaseCeremonyProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const xpCounterRef = useRef<HTMLSpanElement>(null)
  const stampRef = useRef<HTMLDivElement>(null)
  const burstRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)
  // Ephemeral hand-reveal (H4b) — only rendered/measured for handBound
  // payloads. handSlotWrapRef is the reveal/withdraw target (the whole
  // strip); handCardSlotRef is the single card slot whose rect is the
  // ceremony card's real destination.
  const handSlotWrapRef = useRef<HTMLDivElement>(null)
  const handCardSlotRef = useRef<HTMLDivElement>(null)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  const isHandBound = (payload.kind === 'talent' || payload.kind === 'force') && !!payload.handBound
  const handCard: HandCard | null = useMemo(() => {
    if (!isHandBound) return null
    if (payload.kind === 'talent') {
      return {
        key: 'ceremony-hand-preview', kind: 'talent', talentKey: null, name: payload.name,
        activationLabel: '', headerBg: payload.activationBg, headerText: payload.activationText,
        specLabel: null, isForceTalent: payload.isForceTalent, rank: 0, isRanked: false,
      }
    }
    return {
      key: 'ceremony-hand-preview', kind: 'force', talentKey: null, name: payload.name,
      activationLabel: 'Force Power', headerBg: FORCE_HEADER_BG, headerText: FORCE_HEADER_TEXT,
      specLabel: payload.powerName, isForceTalent: true, rank: 0, isRanked: false,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHandBound, payload])

  useEffect(() => {
    doneRef.current = false
    const backdrop = backdropRef.current
    const card = cardRef.current
    if (!backdrop || !card) return

    if (reducedMotion) {
      // Static acknowledgement only — no motion, but the same information
      // stays visible (skippable by click, auto-dismisses) as the animated
      // version. The spec case holds longer, scaled to the skill list length
      // — this is the ONLY place a player sees their newly-granted career
      // skills, so reduced motion must not race it off-screen before it can
      // be read.
      gsap.set(backdrop, { opacity: 1 })
      gsap.set(card, { opacity: 1, x: 0, y: 0, scale: 1, top: '50%', left: '50%', width: CARD_CENTER_WIDTH, height: 'auto', xPercent: -50, yPercent: -50 })
      // No fly — the ephemeral hand (if any) simply shows already holding
      // the card's settled state; it unmounts with the rest of the ceremony.
      if (handSlotWrapRef.current) gsap.set(handSlotWrapRef.current, { opacity: 1, y: 0 })
      if (xpCounterRef.current) xpCounterRef.current.textContent = String(xpAfter)
      const holdMs = payload.kind === 'spec' ? Math.min(4000, 1500 + payload.newSkillNames.length * 250) : 1200
      const t = setTimeout(finish, holdMs)
      return () => clearTimeout(t)
    }

    // Reveal the ephemeral hand BEFORE the timeline starts (a real rect must
    // exist at tween-start, never appearing mid-flight) — measured here,
    // synchronously, off the already-committed DOM from this render.
    const handSlot = handSlotWrapRef.current
    const handCardEl = handCardSlotRef.current
    const handRect = isHandBound && handCardEl ? handCardEl.getBoundingClientRect() : null
    if (handSlot) gsap.set(handSlot, { opacity: 0, y: 60 })

    const tl = gsap.timeline({ onComplete: finish })
    const centerVars = { top: '50%', left: '50%', xPercent: -50, yPercent: -50, width: CARD_CENTER_WIDTH, height: payload.kind === 'spec' ? 'auto' : CARD_CENTER_HEIGHT }

    tl.to(backdrop, { opacity: 1, duration: 0.15 })
    if (handSlot) tl.to(handSlot, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '<')

    if ((payload.kind === 'talent' || payload.kind === 'force') && payload.sourceRect) {
      tl.set(card, {
        top: payload.sourceRect.top, left: payload.sourceRect.left,
        width: payload.sourceRect.width, height: payload.sourceRect.height,
        xPercent: 0, yPercent: 0, opacity: 1, scale: 1,
      }, '<')
      tl.to(card, { ...centerVars, duration: 0.32, ease: 'power2.out' })
    } else {
      tl.fromTo(card, { opacity: 0, scale: 0.8, ...centerVars }, { opacity: 1, scale: 1, ...centerVars, duration: 0.3, ease: 'back.out(1.6)' }, '<')
    }

    if (payload.kind === 'talent' || payload.kind === 'force') {
      // XP drains down to its new value while the burst + stamp land.
      if (xpCounterRef.current) {
        const counter = { val: xpBefore }
        tl.to(counter, {
          val: xpAfter, duration: 0.4, ease: 'power1.out',
          onUpdate: () => { if (xpCounterRef.current) xpCounterRef.current.textContent = String(Math.round(counter.val)) },
        }, '-=0.05')
      }
      if (burstRef.current) {
        tl.fromTo(burstRef.current, { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 2.4, duration: 0.35, ease: 'power1.out' }, '-=0.3')
      }
      if (stampRef.current) {
        tl.fromTo(stampRef.current, { opacity: 0, scale: 1.6, rotate: -6 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.22, ease: 'back.out(2.2)' }, '-=0.15')
        // Impact shake on the card itself.
        tl.to(card, { x: '+=4', duration: 0.05, yoyo: true, repeat: 3, ease: 'power1.inOut' }, '<')
      }
      tl.to({}, { duration: payload.handBound || payload.sourceRect ? 0.4 : 0.6 }) // hold
      if (payload.handBound) {
        // Sent to hand — card shrinks and settles into the ephemeral hand's
        // real card slot (H4b: the destination is now a real, measured
        // rect, not a directional cue toward '96%').
        tl.to(stampRef.current, { opacity: 0, duration: 0.12 })
        if (burstRef.current) tl.set(burstRef.current, { opacity: 0 })
        if (handRect) {
          tl.to(card, {
            top: handRect.top, left: handRect.left,
            width: handRect.width, height: handRect.height,
            xPercent: 0, yPercent: 0, scale: 1, opacity: 0,
            duration: 0.35, ease: 'power2.in',
          })
        } else {
          tl.to(card, {
            top: '96%', left: '50%', xPercent: -50, yPercent: -50,
            width: CARD_CENTER_WIDTH * 0.4, height: 'auto', scale: 0.4, opacity: 0,
            duration: 0.35, ease: 'power2.in',
          })
        }
        // Withdraw the ephemeral hand together with the ceremony's own
        // fade-out beat below — no second, independent timer.
        if (handSlot) tl.to(handSlot, { opacity: 0, y: 60, duration: 0.3, ease: 'power2.in' }, '<')
      } else if (payload.sourceRect) {
        tl.to(stampRef.current, { opacity: 0, duration: 0.12 })
        if (burstRef.current) tl.set(burstRef.current, { opacity: 0 })
        tl.to(card, {
          top: payload.sourceRect.top, left: payload.sourceRect.left,
          width: payload.sourceRect.width, height: payload.sourceRect.height,
          xPercent: 0, yPercent: 0, duration: 0.3, ease: 'power2.in',
        })
        tl.to(card, { opacity: 0, duration: 0.15 }, '-=0.1')
      } else {
        tl.to(card, { opacity: 0, scale: 0.9, duration: 0.2 })
      }
    } else {
      // Spec celebration — simpler: announce, hold long enough to read the
      // skill list, fade out. No lift/burst/stamp beats (Step 3 doesn't ask
      // for them — this is an announcement, not the talent ceremony).
      const holdMs = Math.min(2000, 900 + payload.newSkillNames.length * 150)
      tl.to({}, { duration: holdMs / 1000 })
      tl.to(card, { opacity: 0, scale: 0.92, duration: 0.2 })
    }

    tl.to(backdrop, { opacity: 0, duration: 0.15 }, '-=0.1')

    const skip = () => { tl.kill(); finish() }
    backdrop.addEventListener('click', skip)
    return () => {
      backdrop.removeEventListener('click', skip)
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, reducedMotion, xpBefore, xpAfter])

  return createPortal(
    <div
      ref={backdropRef}
      style={{
        position: 'fixed', inset: 0, zIndex: Z.hudSupreme,
        background: 'color-mix(in srgb, var(--hud-bg) 82%, transparent)',
        backdropFilter: 'blur(3px)',
        opacity: 0,
        cursor: 'pointer',
      }}
    >
      {/* Ephemeral hand reveal (H4b) — mounted only for hand-bound payloads,
          for the duration of this ceremony. Rendered before the flying
          card below so the card visibly settles ON TOP of it (DOM order =
          paint order at equal stacking). */}
      {handCard && (
        <div ref={handSlotWrapRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
          <TalentsRouteHandReveal ref={handCardSlotRef} card={handCard} />
        </div>
      )}

      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          background: payload.kind === 'talent' ? payload.activationBg : payload.kind === 'force' ? 'color-mix(in srgb, var(--die-force) 20%, var(--hud-surface-hi))' : 'var(--hud-surface-hi)',
          border: `1px solid ${payload.kind === 'talent' ? payload.activationBg : payload.kind === 'force' ? 'var(--die-force)' : 'var(--plaque-avail-accent)'}`,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOW.dossier,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: SP[4],
          textAlign: 'center',
          cursor: 'default',
        }}
      >
        {payload.kind === 'talent' ? (
          <>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.06em', color: payload.activationText, textTransform: 'uppercase' }}>
              {payload.name}{payload.isForceTalent ? ' ✦' : ''}
            </div>
            <div style={{ marginTop: SP[2], fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700, color: payload.activationText }}>
              −<span ref={xpCounterRef}>{xpBefore}</span> XP
            </div>
            <div
              ref={burstRef}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--hud-gold) 55%, transparent) 0%, transparent 70%)',
                opacity: 0,
              }}
            />
            <div
              ref={stampRef}
              style={{
                position: 'absolute', bottom: 10, right: 14, opacity: 0,
                fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--hud-gold)', textShadow: '0 0 12px color-mix(in srgb, var(--hud-gold) 70%, transparent)',
              }}
            >
              ACQUIRED
            </div>
          </>
        ) : payload.kind === 'force' ? (
          <>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--die-force)', textTransform: 'uppercase' }}>
              {payload.name}
            </div>
            <div style={{ marginTop: 2, fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.08em', textTransform: 'uppercase', color: HUD.textFaint }}>
              {payload.powerName}{payload.rankLabel ? ` · ${payload.rankLabel}` : ''}
            </div>
            <div style={{ marginTop: SP[2], fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700, color: 'var(--die-force)' }}>
              −<span ref={xpCounterRef}>{xpBefore}</span> XP
            </div>
            <div
              ref={burstRef}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--die-force) 55%, transparent) 0%, transparent 70%)',
                opacity: 0,
              }}
            />
            <div
              ref={stampRef}
              style={{
                position: 'absolute', bottom: 10, right: 14, opacity: 0,
                fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--hud-gold)', textShadow: '0 0 12px color-mix(in srgb, var(--hud-gold) 70%, transparent)',
              }}
            >
              ACQUIRED
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', color: HUD.textFaint }}>
              Specialization Acquired
            </div>
            <div style={{ marginTop: SP[1], fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: HUD.gold }}>
              {payload.name}
            </div>
            {payload.newSkillNames.length > 0 && (
              <div style={{ marginTop: SP[3], width: '100%' }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim }}>
                  You have unlocked the following Career skills:
                </div>
                <div style={{ marginTop: SP[2], display: 'flex', flexWrap: 'wrap', gap: SP[1], justifyContent: 'center' }}>
                  {payload.newSkillNames.map(name => (
                    <span
                      key={name}
                      style={{
                        fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--plaque-avail-accent)',
                        border: '1px solid var(--plaque-avail-accent)', borderRadius: RADIUS.sm,
                        padding: '2px 8px',
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
