'use client'

import { ReactNode, useState } from 'react'

interface HudCardProps {
  title: string
  children: ReactNode
  className?: string
  animClass?: string // 'al d1', 'ar d2', etc.
  style?: React.CSSProperties
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function HudCard({ title, children, className = '', animClass = '', style, collapsible = false, defaultCollapsed = false }: HudCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div
      className={`hud-card ${animClass} ${className}`}
      style={style}
    >
      <div
        className="card-hdr"
        style={collapsible ? { cursor: 'pointer', userSelect: 'none' } : undefined}
        onClick={collapsible ? () => setCollapsed(c => !c) : undefined}
      >
        {collapsible && (
          <span style={{
            display: 'inline-block',
            transition: 'transform .2s',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            fontSize: 'var(--font-xs)',
            color: 'var(--txt3)',
          }}>
            ▼
          </span>
        )}
        {title}
      </div>
      {(!collapsible || !collapsed) && children}
    </div>
  )
}
