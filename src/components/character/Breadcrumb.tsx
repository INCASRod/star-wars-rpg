'use client'

import { HUD, SP, FS, FONT_BODY } from '@/lib/tokens'

interface BreadcrumbProps {
  characterName: string
  activeTab?: string
}

export function Breadcrumb({ characterName, activeTab = 'Character' }: BreadcrumbProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${SP[5]}`,
      gap: SP[2],
    }}>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.label,
        fontWeight: 600,
        letterSpacing: '0.08rem',
        color: HUD.textFaint,
      }}>
        {activeTab}
      </span>
      <span style={{ color: 'var(--hud-border-strong)', fontSize: FS.label }}>/</span>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.label,
        fontWeight: 600,
        letterSpacing: '0.08rem',
        color: HUD.textDim,
      }}>
        {characterName}
      </span>
    </div>
  )
}
