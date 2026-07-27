'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, SHADOW } from '@/lib/tokens'

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
}

export interface SpecCeremonyPayload {
  kind: 'spec'
  name: string
  cost: number
  /** Already display names, already the newly-granted diff — caller's job, not this component's. */
  newSkillNames: string[]
}

export interface PurchaseCeremonyProps {
  payload: TalentCeremonyPayload | SpecCeremonyPayload
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

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

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
      if (xpCounterRef.current) xpCounterRef.current.textContent = String(xpAfter)
      const holdMs = payload.kind === 'spec' ? Math.min(4000, 1500 + payload.newSkillNames.length * 250) : 1200
      const t = setTimeout(finish, holdMs)
      return () => clearTimeout(t)
    }

    const tl = gsap.timeline({ onComplete: finish })
    const centerVars = { top: '50%', left: '50%', xPercent: -50, yPercent: -50, width: CARD_CENTER_WIDTH, height: payload.kind === 'spec' ? 'auto' : CARD_CENTER_HEIGHT }

    tl.to(backdrop, { opacity: 1, duration: 0.15 })

    if (payload.kind === 'talent' && payload.sourceRect) {
      tl.set(card, {
        top: payload.sourceRect.top, left: payload.sourceRect.left,
        width: payload.sourceRect.width, height: payload.sourceRect.height,
        xPercent: 0, yPercent: 0, opacity: 1, scale: 1,
      }, '<')
      tl.to(card, { ...centerVars, duration: 0.32, ease: 'power2.out' })
    } else {
      tl.fromTo(card, { opacity: 0, scale: 0.8, ...centerVars }, { opacity: 1, scale: 1, ...centerVars, duration: 0.3, ease: 'back.out(1.6)' }, '<')
    }

    if (payload.kind === 'talent') {
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
      tl.to({}, { duration: payload.sourceRect ? 0.4 : 0.6 }) // hold
      if (payload.sourceRect) {
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
      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          background: payload.kind === 'talent' ? payload.activationBg : 'var(--hud-surface-hi)',
          border: `1px solid ${payload.kind === 'talent' ? payload.activationBg : 'var(--plaque-avail-accent)'}`,
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
