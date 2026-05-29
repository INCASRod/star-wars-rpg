'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HUD, FONT_BODY, FS, SP, RADIUS, Z } from '@/lib/tokens'

const BG     = 'var(--hud-surface-hi)'
const BORDER = 'var(--hud-border-hi)'

interface TooltipProps {
  content:    React.ReactNode
  children:   React.ReactElement
  placement?: 'top' | 'bottom' | 'right' | 'left'
  maxWidth?:  number
  delay?:     number
}

interface Pos { top: number; left: number; actualPlacement: 'top' | 'bottom' | 'right' | 'left' }

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: '0.375rem', height: '0.375rem' }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${HUD.gold}`, borderLeft: `1px solid ${HUD.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${HUD.gold}`, borderRight: `1px solid ${HUD.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${HUD.gold}`, borderLeft: `1px solid ${HUD.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${HUD.gold}`, borderRight: `1px solid ${HUD.gold}` }} />
    </>
  )
}

export function Tooltip({
  content, children, placement = 'top', maxWidth = 280, delay = 300,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos]         = useState<Pos | null>(null)
  const triggerRef            = useRef<HTMLElement>(null)
  const tooltipRef            = useRef<HTMLDivElement>(null)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r   = triggerRef.current.getBoundingClientRect()
    const gap = 10
    let top   = 0, left = 0
    let actualPlacement = placement

    const tw = maxWidth
    const th = 120 // estimated tooltip height

    if (placement === 'right') {
      if (r.right + gap + tw > window.innerWidth) actualPlacement = 'left'
    } else if (placement === 'left') {
      if (r.left - gap - tw < 0) actualPlacement = 'right'
    } else if (placement === 'top') {
      if (r.top - gap - th < 0) actualPlacement = 'bottom'
    } else {
      if (r.bottom + gap + th > window.innerHeight) actualPlacement = 'top'
    }

    if (actualPlacement === 'top') {
      top  = r.top - gap
      left = r.left + r.width / 2
    } else if (actualPlacement === 'bottom') {
      top  = r.bottom + gap
      left = r.left + r.width / 2
    } else if (actualPlacement === 'right') {
      top  = r.top + r.height / 2
      left = r.right + gap
    } else {
      top  = r.top + r.height / 2
      left = r.left - gap
    }

    setPos({ top, left, actualPlacement })
  }, [placement, maxWidth])

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      calcPos()
      setVisible(true)
    }, delay)
  }, [calcPos, delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  // Clone child to attach ref + handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const child = children as React.ReactElement<any>
  const trigger = React.cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      child.props?.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      child.props?.onMouseLeave?.(e)
    },
  })

  if (!mounted) return child

  const getTransform = (p: Pos) => {
    if (p.actualPlacement === 'top')    return 'translate(-50%, -100%)'
    if (p.actualPlacement === 'bottom') return 'translate(-50%, 0)'
    if (p.actualPlacement === 'right')  return 'translate(0, -50%)'
    return 'translate(-100%, -50%)'
  }

  const arrowStyle = (p: Pos): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute', width: 0, height: 0,
      border: '0.375rem solid transparent',
    }
    if (p.actualPlacement === 'top')    return { ...base, bottom: '-0.75rem', left: '50%', transform: 'translateX(-50%)', borderTopColor: BORDER }
    if (p.actualPlacement === 'bottom') return { ...base, top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', borderBottomColor: BORDER }
    if (p.actualPlacement === 'right')  return { ...base, left: '-0.75rem', top: '50%', transform: 'translateY(-50%)', borderRightColor: BORDER }
    return { ...base, right: '-0.75rem', top: '50%', transform: 'translateY(-50%)', borderLeftColor: BORDER }
  }

  return (
    <>
      {trigger}
      {visible && pos && createPortal(
        <div
          ref={tooltipRef}
          className="holo-tooltip"
          style={{
            position:             'fixed',
            top:                  pos.top,
            left:                 pos.left,
            transform:            getTransform(pos),
            zIndex:               Z.tooltip,
            maxWidth,
            background:           BG,
            border:               `1px solid ${BORDER}`,
            borderRadius:         RADIUS.lg,
            boxShadow:            `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px var(--hud-border)`,
            padding:              `${SP[3]} 0.875rem`,
            pointerEvents:        'none',
            animation:            'tooltipIn 0.15s ease forwards',
          }}
        >
          <CornerBrackets />
          <div style={{ arrow: undefined } as React.CSSProperties}>
            <div style={arrowStyle(pos)} />
          </div>
          {content}
        </div>,
        document.body
      )}
    </>
  )
}

// ── Shared tooltip label helper ─────────────────────────────
export function TipLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: HUD.gold, marginBottom: SP[1],
    }}>
      {children}
    </div>
  )
}

export function TipBody({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.sm,
      color: 'var(--hud-text)', lineHeight: 1.55,
    }}>
      {children}
    </div>
  )
}

export function TipDivider() {
  return <div style={{ height: '1px', background: 'var(--hud-border)', margin: `${SP[2]} 0` }} />
}
