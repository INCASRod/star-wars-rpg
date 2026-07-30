'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { FONT_BODY, FS, Z } from '@/lib/tokens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// ── Force Presence GM-award overlays (Prompt C) ──────────────────────────────
//
// Parameterized single component rather than two files — ConflictFlash and
// TranquilityFlash are near-mirror images (violet-vs-cyan, dark-vs-light
// emblem, identical wash+flare+settle choreography); one timeline definition
// parameterized by variant avoids duplicating that choreography twice.
//
// State-management shape matches DestinyGMFlash.tsx exactly (full-viewport
// position:fixed;inset:0, portaled to document.body, auto-dismissing,
// mounted/unmounted by a callback-driven boolean in the parent — see
// usePlayerBroadcast.ts's onConflictAwarded/onTranquilityAwarded) — only the
// motion technique differs (GSAP wash+flare here vs DestinyGMFlash's plain
// CSS-transition fade, since this needs a richer center-screen flare).
//
// STACKING-CONTEXT LESSON (Prompt B, reproduced live there): a GSAP tween
// animating opacity/scale on a position:fixed-anchored element can silently
// strip that element's positioning once the tween runs. Applied here from
// the start — GSAP only ever touches the inner wrapper below, never the
// fixed root.

const DARK_VIOLET = 'var(--hud-accent-purple)'
const LIGHT_CYAN  = 'var(--die-force)'
const LIGHT_IMG   = '/images/factions/LightSymbol.png'
const DARK_IMG    = '/images/factions/DarkSymbol.png'

const HOLD_MS = 1800
const REDUCED_HOLD_MS = 900

export type PresenceFlashVariant = 'conflict' | 'tranquility'

interface PresenceFlashProps {
  variant: PresenceFlashVariant
  onDismiss: () => void
}

export function PresenceFlash({ variant, onDismiss }: PresenceFlashProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const innerRef = useRef<HTMLDivElement>(null)
  const emblemRef = useRef<HTMLSpanElement>(null)

  const isDark = variant === 'conflict'
  const color = isDark ? DARK_VIOLET : LIGHT_CYAN
  const emblemSrc = isDark ? DARK_IMG : LIGHT_IMG
  const label = isDark ? 'Conflict' : 'Tranquility'

  useEffect(() => {
    const inner = innerRef.current
    const emblem = emblemRef.current
    if (!inner || !emblem) return

    if (prefersReducedMotion) {
      // Reduced motion: a brief static flash, no wash/flare animation, then
      // dismiss on a shortened hold. The notification is never skipped,
      // only its motion is.
      gsap.set(inner, { opacity: 1 })
      gsap.set(emblem, { opacity: 1, scale: 1 })
      const t = setTimeout(onDismiss, REDUCED_HOLD_MS)
      return () => clearTimeout(t)
    }

    const tl = gsap.timeline({ onComplete: onDismiss })
    tl.set(inner, { opacity: 0 })
    tl.set(emblem, { opacity: 0, scale: 0.4 })
    // Wash sweeps in
    tl.to(inner, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    // Emblem flares center-screen
    tl.to(emblem, { opacity: 1, scale: 1.3, duration: 0.35, ease: 'back.out(2)' }, '<0.05')
    tl.to(emblem, { scale: 1, duration: 0.3, ease: 'power2.out' })
    // Hold, then settle/dismiss
    tl.to(inner, { opacity: 0, duration: 0.6, ease: 'power2.in' }, `+=${HOLD_MS / 1000}`)
    tl.to(emblem, { opacity: 0, scale: 0.85, duration: 0.5, ease: 'power2.in' }, '<')

    const skip = () => tl.progress(1)
    inner.addEventListener('click', skip)
    return () => {
      inner.removeEventListener('click', skip)
      tl.kill()
      gsap.set(inner, { clearProps: 'all' })
      gsap.set(emblem, { clearProps: 'all' })
    }
  // usePrefersReducedMotion (src/hooks/usePrefersReducedMotion.ts) returns
  // false on the very first render, before its OWN effect corrects it via
  // matchMedia — a component whose animation effect only runs once on mount
  // (this one) needs prefersReducedMotion in its own deps to react to that
  // correction; an empty [] permanently captures the stale first-render
  // false (confirmed live: under emulated reduced motion, the full ~3.1s
  // timeline ran instead of the ~900ms static hold). The cleanup above
  // (tl.kill()/clearTimeout) makes re-running safe if this fires twice.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z.hudSupreme, pointerEvents: 'none' }}>
      <div
        ref={innerRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'auto', cursor: 'pointer',
          background: isDark
            ? `radial-gradient(circle at 50% 45%, color-mix(in srgb, ${DARK_VIOLET} 22%, transparent) 0%, transparent 70%)`
            : `radial-gradient(circle at 50% 45%, color-mix(in srgb, ${LIGHT_CYAN} 18%, transparent) 0%, transparent 70%)`,
        }}
      >
        <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span
            ref={emblemRef}
            aria-hidden="true"
            style={{
              display: 'inline-block', width: 72, height: 72,
              WebkitMask: `url('${emblemSrc}') center/contain no-repeat`,
              mask: `url('${emblemSrc}') center/contain no-repeat`,
              background: color,
              filter: `drop-shadow(0 0 18px ${color})`,
            }}
          />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color }}>
            {label} Awarded
          </span>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(content, document.body)
}
