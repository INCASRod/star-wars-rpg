'use client'

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, Z } from '@/lib/tokens'
import type { ForcePowerDisplay, ForceAbilityDisplay } from '@/components/player-hud/ForcePanel'
import { RichText } from '@/components/ui/RichText'

export interface ForceDescriptionPanelProps {
  open:              boolean
  onClose:           () => void
  power:             ForcePowerDisplay | null
  basicUpgrade:      ForceAbilityDisplay | null
  activatedUpgrades: ForceAbilityDisplay[]
  anchorRef:         RefObject<HTMLDivElement | null>
}

// Rendered via a portal to document.body so it escapes the two
// overflow:hidden ancestors wrapping the drawer (PlayerHUDDesktop's root
// shell and center-column div — see docs/architecture.md). Position is
// measured off the drawer's own DOM node rather than derived from a static
// formula, because the rows above the drawer (HudTopBar / HudStatusStrip)
// are auto-sized with no height token to compute from.
const SLIDE_TRANSITION = 'transform 0.22s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease-out'
/* timing matches .hud-quick-drawer's own slide — animation timing */

function CostIcons({ cost }: { cost: number }) {
  if (cost <= 0) {
    return (
      <span style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--hud-accent-purple)', opacity: 0.75,
      }}>FREE</span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 /* fp icon gap — px intentional, tight symbol spacing */, fontSize: FS.sm }}>
      {Array.from({ length: cost }).map((_, i) => <RichText key={i} text="[fp]" />)}
    </span>
  )
}

export function ForceDescriptionPanel({ open, onClose, power, basicUpgrade, activatedUpgrades, anchorRef }: ForceDescriptionPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number; bottom: number } | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    if (!open || isMobile || !anchorRef.current) return
    const measure = () => {
      const r = anchorRef.current!.getBoundingClientRect()
      setRect({ top: r.top, left: r.right, bottom: window.innerHeight - r.bottom })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [open, isMobile, anchorRef])

  if (!mounted) return null

  const panelStyle = isMobile
    ? {
        position: 'fixed' as const, inset: 0, width: '100%',
        transform: open ? 'translateX(0)' : 'translateX(-8px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' as const : 'none' as const,
        transition: SLIDE_TRANSITION,
      }
    : {
        position: 'fixed' as const,
        top: rect?.top ?? 0, left: rect?.left ?? 0, bottom: rect?.bottom ?? 0,
        width: 260, /* panel width — px intentional, per spec */
        transform: open ? 'translateX(0)' : 'translateX(-8px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' as const : 'none' as const,
        transition: SLIDE_TRANSITION,
      }

  return createPortal(
    <div style={{
      ...panelStyle,
      background: 'var(--hud-surface-hi)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderLeft: `1px solid color-mix(in srgb, var(--hud-accent-purple) 25%, transparent)`,
      display: 'flex', flexDirection: 'column',
      zIndex: Z.backdrop,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)', flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--hud-accent-purple)',
        }}>Description</span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: HUD.textFaint, fontSize: FS.sm, lineHeight: 1,
            padding: `0 ${SP[1]}`,
          }}
        >✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[3] }}>
        {!power ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic', lineHeight: 1.5 }}>
            Select a Force power to view its description.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700,
                color: 'var(--hud-accent-purple)',
              }}>{power.powerName} — Basic Power</span>
              {(basicUpgrade?.description || power.description) ? (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5 }}>
                  <RichText text={basicUpgrade?.description || power.description!} />
                </div>
              ) : (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic' }}>
                  No description available.
                </div>
              )}
            </div>

            {activatedUpgrades.length === 0 ? (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic', lineHeight: 1.5 }}>
                Select upgrades in step ③ to build out what this power can do.
              </div>
            ) : (
              activatedUpgrades.map(u => (
                <div key={u.key} style={{
                  display: 'flex', flexDirection: 'column', gap: SP[1],
                  paddingTop: SP[2],
                  borderTop: `1px dashed color-mix(in srgb, var(--hud-accent-purple) 30%, transparent)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, color: HUD.text }}>
                      {u.name}
                    </span>
                    <CostIcons cost={u.pip_cost} />
                  </div>
                  {u.description && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5 }}>
                      <RichText text={u.description} />
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
