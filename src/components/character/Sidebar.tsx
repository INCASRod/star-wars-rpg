'use client'

import { useRouter } from 'next/navigation'
import { HUD, SP, Z, EASE, FONT_BODY } from '@/lib/tokens'

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const TABS = [
  { key: 'Character', icon: '✦', label: 'Character' },
  { key: 'Talents', icon: '★', label: 'Talents' },
  { key: 'Inventory', icon: '⚒', label: 'Inventory' },
  { key: 'Lore', icon: '✎', label: 'Lore' },
  { key: 'Force', icon: '◆', label: 'Force' },
]

export function Sidebar({ activeTab = 'Character', onTabChange }: SidebarProps) {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${HUD.borderHi}`,
      height: '100%',
      padding: `${SP[4]} 0`,
      gap: SP[1],
      zIndex: Z.raised,
      background: HUD.panel,
    }}>
      {/* Home link */}
      <button
        onClick={() => router.push('/')}
        title="Back to character select"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: `${SP[1]} ${SP[2]}`,
          fontFamily: FONT_BODY,
          fontSize: 'var(--text-label)',
          fontWeight: 600,
          letterSpacing: '0.08rem',
          color: HUD.textFaint,
          textAlign: 'left',
          transition: EASE.default,
        }}
      >
        {'←'} Home
      </button>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: HUD.borderHi,
        margin: `0 ${SP[2]}`,
      }} />

      {/* Nav tabs */}
      {TABS.map(tab => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            style={{
              background: isActive ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)' : 'transparent',
              border: 'none',
              borderLeft: isActive ? `3px solid ${HUD.gold}` : '3px solid transparent',
              cursor: 'pointer',
              padding: `${SP[1]} ${SP[2]}`,
              textAlign: 'left',
              fontFamily: FONT_BODY,
              fontSize: 'var(--text-label)',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.08rem',
              color: isActive ? 'var(--hud-accent)' : HUD.textDim,
              transition: EASE.default,
            }}
          >
            <span style={{ marginRight: SP[1] }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
