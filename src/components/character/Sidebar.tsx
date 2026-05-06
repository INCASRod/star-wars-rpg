'use client'

import { useRouter } from 'next/navigation'

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const TABS = [
  { key: 'Character', icon: '\u2726', label: 'Character' },
  { key: 'Talents', icon: '\u2605', label: 'Talents' },
  { key: 'Inventory', icon: '\u2692', label: 'Inventory' },
  { key: 'Lore', icon: '\u270E', label: 'Lore' },
  { key: 'Force', icon: '\u25C6', label: 'Force' },
]

export function Sidebar({ activeTab = 'Character', onTabChange }: SidebarProps) {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--bs-bdr-mid)',
      height: '100%',
      padding: 'var(--sp-md) 0',
      gap: 'var(--sp-xs)',
      zIndex: 2,
      background: 'var(--bs-panel)',
    }}>
      {/* Home link */}
      <button
        onClick={() => router.push('/')}
        title="Back to character select"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--sp-xs) var(--sp-sm)',
          fontFamily: 'var(--font-rajdhani)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          letterSpacing: '0.08rem',
          color: 'var(--bs-txt3)',
          textAlign: 'left',
          transition: '.2s',
        }}
      >
        {'\u2190'} Home
      </button>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--bs-bdr-mid)',
        margin: '0 var(--sp-sm)',
      }} />

      {/* Nav tabs */}
      {TABS.map(tab => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            style={{
              background: isActive ? 'var(--bs-red-glow)' : 'transparent',
              border: 'none',
              borderLeft: isActive ? '3px solid var(--bs-red-sun)' : '3px solid transparent',
              cursor: 'pointer',
              padding: 'var(--sp-xs) var(--sp-sm)',
              textAlign: 'left',
              fontFamily: 'var(--font-rajdhani)',
              fontSize: 'var(--font-sm)',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.08rem',
              color: isActive ? 'var(--bs-red-mid)' : 'var(--bs-txt2)',
              transition: '.2s',
            }}
          >
            <span style={{ marginRight: '0.25rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
