'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

const FONT_CINZEL   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_RAJDHANI = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD          = '#C8AA50'
const BG            = 'rgba(4,10,6,0.96)'
const BORDER        = 'rgba(200,170,80,0.32)'

interface TooltipProps {
  content:    React.ReactNode
  children:   React.ReactElement
  placement?: 'top' | 'bottom' | 'right' | 'left'
  maxWidth?:  number
  delay?:     number
}

interface Pos { top: number; left: number; actualPlacement: 'top' | 'bottom' | 'right' | 'left' }

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}` }} />
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
      border: '6px solid transparent',
    }
    if (p.actualPlacement === 'top')    return { ...base, bottom: -12, left: '50%', transform: 'translateX(-50%)', borderTopColor: BORDER }
    if (p.actualPlacement === 'bottom') return { ...base, top: -12, left: '50%', transform: 'translateX(-50%)', borderBottomColor: BORDER }
    if (p.actualPlacement === 'right')  return { ...base, left: -12, top: '50%', transform: 'translateY(-50%)', borderRightColor: BORDER }
    return { ...base, right: -12, top: '50%', transform: 'translateY(-50%)', borderLeftColor: BORDER }
  }

  return (
    <>
      {trigger}
      {visible && pos && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position:             'fixed',
            top:                  pos.top,
            left:                 pos.left,
            transform:            getTransform(pos),
            zIndex:               8000,
            maxWidth,
            background:           BG,
            border:               `1px solid ${BORDER}`,
            borderRadius:         8,
            boxShadow:            `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,170,80,0.08)`,
            padding:              '12px 14px',
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
      fontFamily: FONT_CINZEL, fontSize: 9, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: GOLD, marginBottom: 4,
    }}>
      {children}
    </div>
  )
}

export function TipBody({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: 12,
      color: '#C8D8C0', lineHeight: 1.55,
    }}>
      {children}
    </div>
  )
}

export function TipDivider() {
  return <div style={{ height: 1, background: 'rgba(200,170,80,0.14)', margin: '8px 0' }} />
}
