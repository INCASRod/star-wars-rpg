'use client'

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS } from '@/lib/tokens'
import type { PendingAction, PendingActionType } from '@/hooks/usePendingActions'

// ── Per-type presentation ─────────────────────────────────────────────────────
// Every action_type in the migration-117 CHECK constraint has an entry, even
// though initiative is the only one that creates rows today — the others need a
// correct shape for the later prompt that fills their bodies in.
const TYPE_META: Record<PendingActionType, { glyph: string; name: string }> = {
  initiative:         { glyph: '⚡', name: 'Initiative' },
  destiny_generate:   { glyph: '☄', name: 'Destiny Pool — Contribute' },
  critical_injury:    { glyph: '✚', name: 'Critical Injury — Roll Required' },
  conflict_ack:       { glyph: '☯', name: 'Conflict Gained' },
  vendor_offer:       { glyph: '⬡', name: 'Vendor Offer' },
  loot_reveal:        { glyph: '◆', name: 'Loot Awarded' },
  gm_dialog:          { glyph: '✦', name: 'Transmission' },
  force_rating_offer: { glyph: '◈', name: 'Force Sensitivity Awakens' },
}

const INIT_TYPE_LABEL: Record<string, string> = { cool: 'Cool', vigilance: 'Vigilance' }

function describe(action: PendingAction): string {
  const p = action.payload as { initiativeType?: string; skillKey?: string }
  switch (action.action_type) {
    case 'initiative': {
      const t = INIT_TYPE_LABEL[p.initiativeType ?? ''] ?? 'Initiative'
      return `The GM has requested your ${t.toLowerCase()} initiative roll. Combat is waiting on you.`
    }
    case 'destiny_generate':   return 'Roll your Force die to seed the session’s Destiny pool.'
    case 'critical_injury':    return 'Roll to determine the injury you have taken.'
    case 'conflict_ack':       return 'The GM has assigned you Conflict. Acknowledge to continue.'
    case 'vendor_offer':       return 'A vendor has made you an offer.'
    case 'loot_reveal':        return 'Loot has been awarded to you.'
    case 'gm_dialog':          return 'The GM has sent you a message.'
    case 'force_rating_offer': return 'You may purchase Force Rating 1.'
    default:                   return 'Awaiting your decision.'
  }
}

function titleFor(action: PendingAction): string {
  const base = TYPE_META[action.action_type]?.name ?? 'Pending Action'
  if (action.action_type === 'initiative') {
    const p = action.payload as { initiativeType?: string }
    const t = INIT_TYPE_LABEL[p.initiativeType ?? '']
    return t ? `${base} — ${t}` : base
  }
  return base
}

// ── Height-spring wrapper ─────────────────────────────────────────────────────
// Same technique as TalentsPanel.tsx's AnimatedDrawer (the codebase's only
// height-spring precedent): measure scrollHeight, animate 0 → that height, then
// release to `height: auto` so later content changes are not clamped.
// Animates an inner wrapper only — never a positioned anchor.
function SpringBox({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const firstRun = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion) {
      gsap.set(el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 })
      firstRun.current = false
      return
    }

    // No entrance animation for a box that starts closed.
    if (firstRun.current && !open) {
      gsap.set(el, { height: 0, opacity: 0 })
      firstRun.current = false
      return
    }
    firstRun.current = false

    if (open) {
      gsap.set(el, { height: 'auto', opacity: 1 })
      const h = el.offsetHeight
      const tl = gsap.timeline({ onComplete: () => gsap.set(el, { height: 'auto' }) })
      tl.fromTo(el, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.45, ease: 'back.out(1.05)' })
      return () => { tl.kill() }
    }

    const tw = gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.inOut' })
    return () => { tw.kill() }
    // prefersReducedMotion is false on first render and flips in an effect —
    // it has to be a dependency, not captured in a stale closure.
  }, [open, prefersReducedMotion])

  return <div ref={ref} className="pa-drawer-wrap">{children}</div>
}

// ── Card body ─────────────────────────────────────────────────────────────────
// Initiative renders the SAME `InitiativeRollBody` the popup does, inline. The
// host supplies it via `renderInitiativeBody` so this file stays presentation-
// only and does not need the character/skills/forceRating bundle threaded
// through it. Every other type is an honest placeholder — no fake controls,
// no simulated resolve.
function CardBody({ action, renderInitiativeBody }: {
  action: PendingAction
  renderInitiativeBody: (a: PendingAction) => React.ReactNode
}) {
  if (action.action_type === 'initiative') {
    return <>{renderInitiativeBody(action)}</>
  }

  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.caption, lineHeight: 1.6,
      color: 'var(--hud-text-faint)',
      border: '1px dashed var(--hud-border-hi)',
      borderRadius: RADIUS.md, padding: SP[3],
    }}>
      This surface is not wired to the queue yet — resolve it from its own popup.
    </div>
  )
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({ action, renderInitiativeBody }: {
  action: PendingAction
  renderInitiativeBody: (a: PendingAction) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const meta = TYPE_META[action.action_type]

  return (
    <div className={`pa-card${action.is_blocking ? ' is-blocking' : ''}${open ? ' is-open' : ''}`}>
      <button className="pa-card-row" onClick={() => setOpen(o => !o)} style={{ padding: `${SP[2]} ${SP[3]}` }}>
        <span style={{
          width: 34, height: 34, flex: 'none',
          borderRadius: RADIUS.md,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--hud-border-hi)',
          background: 'var(--hud-panel)',
          fontSize: FS.body,
        }}>{meta?.glyph ?? '◈'}</span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-text)',
          }}>{titleFor(action)}</span>
          <span style={{
            display: 'block', marginTop: 2,
            fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)',
          }}>{describe(action)}</span>
        </span>

        <span style={{
          flex: 'none',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          padding: `3px ${SP[2]}`, borderRadius: RADIUS.sm,
          border: action.is_blocking
            ? '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)'
            : '1px solid var(--hud-border-hi)',
          background: action.is_blocking
            ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)'
            : 'transparent',
          color: action.is_blocking ? 'var(--hud-accent)' : 'var(--hud-text-faint)',
        }}>{action.is_blocking ? 'Blocking' : 'Pending'}</span>

        <span className="pa-card-chev" style={{ fontSize: FS.caption }}>▶</span>
      </button>

      <SpringBox open={open}>
        <div className="pa-card-body">
          <div style={{ borderTop: '1px solid var(--hud-border)', padding: SP[3] }}>
            <CardBody action={action} renderInitiativeBody={renderInitiativeBody} />
          </div>
        </div>
      </SpringBox>
    </div>
  )
}

// ── Drawer ────────────────────────────────────────────────────────────────────
interface HudNotificationsDrawerProps {
  open:             boolean
  actions:          PendingAction[]
  blockingCount:    number
  onClose:          () => void
  /** Supplied by the host so the card can render the shared InitiativeRollBody inline. */
  renderInitiativeBody: (a: PendingAction) => React.ReactNode
}

export function HudNotificationsDrawer({
  open, actions, blockingCount, onClose, renderInitiativeBody,
}: HudNotificationsDrawerProps) {
  const count = actions.length

  // Auto-close shortly after the last item resolves while the drawer is open.
  // Resolution itself never waits on this — the row is already gone from the
  // list by the time the timer starts.
  useEffect(() => {
    if (!open || count > 0) return
    const t = setTimeout(onClose, 600)
    return () => clearTimeout(t)
  }, [open, count, onClose])

  return (
    <SpringBox open={open}>
      <div className="pa-drawer" style={{ padding: `${SP[4]} ${SP[6]} ${SP[5]}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: SP[3], marginBottom: SP[3] }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--hud-text)',
          }}>
            Pending Actions
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)' }}>
            {count === 0 ? '0 awaiting' : `${count} awaiting · ${blockingCount} blocking`}
          </span>
          <button className="pa-drawer-close" onClick={onClose} style={{ padding: `${SP[1]} ${SP[3]}` }}>
            Close ✕
          </button>
        </div>

        {count === 0 ? (
          <div style={{
            textAlign: 'center', padding: `${SP[8]} 0`,
            fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--hud-text-faint)',
          }}>
            <div style={{ fontSize: FS.h3, opacity: 0.4, marginBottom: SP[2] }}>◈</div>
            Nothing awaiting your decision.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
            {actions.map(a => (
              <ActionCard key={a.id} action={a} renderInitiativeBody={renderInitiativeBody} />
            ))}
          </div>
        )}
      </div>
    </SpringBox>
  )
}

/** Blocking-arrival auto-open: fires once per action id, never re-opens after a
 *  deliberate close, never re-fires on re-render. Lives here so the drawer and
 *  its trigger rule stay in one file. */
export function useBlockingAutoOpen(
  actions: PendingAction[],
  openDrawer: () => void,
): void {
  const seenRef = useRef<Set<string>>(new Set())
  // Kept in a ref so an unstable callback identity can't re-trigger the effect —
  // the once-per-id guard below is the only thing that decides re-opening.
  const openRef = useRef(openDrawer)
  useEffect(() => { openRef.current = openDrawer }, [openDrawer])

  useEffect(() => {
    let fresh = false
    for (const a of actions) {
      if (!a.is_blocking) continue
      if (seenRef.current.has(a.id)) continue
      seenRef.current.add(a.id)
      fresh = true
    }
    if (fresh) openRef.current()
  }, [actions])
}
