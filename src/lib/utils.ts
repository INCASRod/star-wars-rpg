import gsap from 'gsap'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * UUID v4 generator that works in both secure (HTTPS/localhost) and
 * non-secure (HTTP over local network) contexts.
 * crypto.randomUUID() requires a secure context — fall back to Math.random()
 * when unavailable (e.g. accessed via 192.168.x.x over HTTP).
 */
const DICE_TAGS_RE = /\[(BO|BST|SE|SET|BL|DI|DIF|CH|CHL|PR|PRO|AB|ABL)\]/gi

/**
 * Strips OggDude BBCode markup while preserving known dice tags ([BO], [SE],
 * [DI], [CH], etc.) while stripping all other BBCode formatting.
 */
export function stripBBCode(text: string): string {
  // Stash dice tags behind NUL placeholders so the catch-all strip misses them
  const stash: string[] = []
  let held = text.replace(DICE_TAGS_RE, (match) => {
    stash.push(match.toUpperCase())
    return `\x00${stash.length - 1}\x00`
  })
  // Strip [H3]/[H4] headings entirely including their content (item name shown in card header)
  held = held.replace(/\[H[34]\][^\[]*\[[Hh][34]\]/gi, '')
  // Convert [P] paragraph markers to double newline for spacing
  held = held.replace(/\[P\]/gi, '\n\n')
  // Strip all remaining BBCode tags
  const stripped = held.replace(/\[[^\]]*\]/g, '')
  // Collapse horizontal whitespace only (preserve newlines), cap at 2 consecutive newlines
  const normalized = stripped.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return normalized.replace(/\x00(\d+)\x00/g, (_, i) => stash[parseInt(i, 10)])
}

/**
 * UUID v4 generator that works in both secure (HTTPS/localhost) and
 * non-secure (HTTP over local network) contexts.
 * crypto.randomUUID() requires a secure context — fall back to Math.random()
 * when unavailable (e.g. accessed via 192.168.x.x over HTTP).
 */
export function randomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── Modal ignition ───────────────────────────────────────────────────────────
// Shared open/close choreography for the check panels: the modal visibly
// emanates from the button that launched it. Combat Check uses it first; Skill
// Check and Force Check adopt the same helper with their own accent.
//
// Deliberately a pair of functions, not a component or a hook — the caller owns
// its refs, its `usePrefersReducedMotion()` value and its effect lifecycle, and
// simply hands the elements over. See the "modal ignition" convention in
// docs/architecture.md.
//
// Nothing Combat-Check-specific lives in here: the origin element and the
// accent/glow tokens are both parameters.

export interface IgniteTargets {
  /** The element that scales. MUST be an inner wrapper — never the positioned
   *  anchor, whose `position: fixed` and centring transform GSAP would clobber. */
  inner:  HTMLElement | null
  /** The scrim/backdrop. Opacity only. */
  scrim:  HTMLElement | null
  /** The radial ripple. Lives inside the portal, not appended to the body. */
  pulse:  HTMLElement | null
  /** The button the modal emanates from. A missing element (or null) falls back
   *  to the viewport centre — the animation still plays, just with no spatial link. */
  origin: Element | null
  /** Accent colour for the pulse border and the hot-border flare, e.g.
   *  `'var(--hud-accent)'`. Passed in so each panel can supply its own. */
  accent: string
  /** Glow colour for the flare, e.g. `'var(--hud-glow)'`. */
  glow:   string
  /** Resting shadow the hot border cools to. */
  restShadow: string
  /** Skip the pulse, the scale and the stagger — a plain opacity fade instead. */
  reducedMotion: boolean
}

/** Centre of the origin element in viewport coords, or the viewport centre. */
function originCentre(origin: Element | null): { x: number; y: number } {
  if (origin) {
    const r = origin.getBoundingClientRect()
    if (r.width > 0 || r.height > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

/**
 * `transform-origin` for a centred modal, expressed relative to the modal's own
 * box, so the panel appears to grow out of the button wherever that button is.
 */
function transformOriginFor(inner: HTMLElement, centre: { x: number; y: number }): string {
  const r = inner.getBoundingClientRect()
  return `${centre.x - r.left}px ${centre.y - r.top}px`
}

/** Open: scrim snap → radial pulse → ignition scale with border flare → content stagger. */
export function igniteModalOpen(t: IgniteTargets): gsap.core.Timeline | null {
  const { inner, scrim, pulse, origin, accent, glow, restShadow, reducedMotion } = t
  if (!inner) return null
  if (reducedMotion) {
    if (scrim) gsap.set(scrim, { opacity: 1 })
    if (pulse) gsap.set(pulse, { opacity: 0 })
    gsap.set(inner, { scale: 1, clearProps: 'transformOrigin,boxShadow' })
    return gsap.timeline().fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.12 })
  }

  const centre = originCentre(origin)
  const tOrigin = transformOriginFor(inner, centre)
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1 — scrim snap, 120ms from t=0
  if (scrim) tl.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0)

  // 2 — single radial ripple from the button's centre, 420ms from t=0
  if (pulse) {
    tl.set(pulse, { left: centre.x - 10, top: centre.y - 10, scale: 0.4, opacity: 0.9, borderColor: accent }, 0)
      .to(pulse, { scale: 16, opacity: 0, duration: 0.42, ease: 'power2.out' }, 0)
  }

  // 3 — ignition from t=40ms: scale out of the button with a hot border that
  //     cools to rest, overlapping the tail of the scale by 80ms.
  tl.fromTo(inner,
    { scale: 0.08, transformOrigin: tOrigin, boxShadow: `0 0 60px ${glow}, 0 0 0 2px ${accent}` },
    { scale: 1, duration: 0.34, ease: 'back.out(1.4)' }, 0.04)
    .to(inner, { boxShadow: restShadow, duration: 0.28, ease: 'power2.out' }, '>-.08')

  // 4 — content stagger from t=160ms. Any depth: the caller tags whichever
  //     blocks should stagger. DOM order is tray-first, which is correct.
  const kids = inner.querySelectorAll<HTMLElement>('[data-ignite-stagger]')
  if (kids.length) {
    tl.fromTo(kids, { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.16)
  }
  return tl
}

/**
 * Close: content out → collapse back toward the same button → scrim out.
 * Purely decorative — the caller has already committed the state change, and
 * `Modal`'s `exitMs` is what holds the DOM long enough for this to be seen.
 */
export function igniteModalClose(t: IgniteTargets): gsap.core.Timeline | null {
  const { inner, scrim, origin, reducedMotion } = t
  if (!inner) return null
  if (reducedMotion) {
    const tl = gsap.timeline()
    tl.to(inner, { opacity: 0, duration: 0.1 }, 0)
    if (scrim) tl.to(scrim, { opacity: 0, duration: 0.1 }, 0)
    return tl
  }

  const tOrigin = transformOriginFor(inner, originCentre(origin))
  const tl = gsap.timeline()

  const kids = inner.querySelectorAll<HTMLElement>('[data-ignite-stagger]')
  if (kids.length) {
    tl.to(kids, { opacity: 0, y: 8, duration: 0.12, stagger: 0.02, ease: 'power2.in' })
  }
  tl.to(inner, { scale: 0.08, transformOrigin: tOrigin, opacity: 0, duration: 0.24, ease: 'power3.in' },
    kids.length ? '>-.04' : 0)
  if (scrim) tl.to(scrim, { opacity: 0, duration: 0.16 }, '>-.06')
  return tl
}

/** Total close duration in ms — feed this to `Modal`'s `exitMs`. */
export const IGNITE_EXIT_MS = 300
