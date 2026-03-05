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
]

export function Sidebar({ activeTab = 'Character', onTabChange }: SidebarProps) {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--bdr-l)',
      height: '100%',
      padding: 'var(--sp-md) 0',
      gap: 'var(--sp-xs)',
      zIndex: 2,
      background: 'rgba(250,247,242,.5)',
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
          fontFamily: 'var(--font-orbitron)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          letterSpacing: '0.08rem',
          color: 'var(--txt3)',
          textAlign: 'left',
          transition: '.2s',
        }}
      >
        {'\u2190'} Home
      </button>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--bdr-l)',
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
              background: isActive ? 'var(--gold-glow)' : 'transparent',
              border: 'none',
              borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
              cursor: 'pointer',
              padding: 'var(--sp-xs) var(--sp-sm)',
              textAlign: 'left',
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'var(--font-sm)',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.08rem',
              color: isActive ? 'var(--gold-d)' : 'var(--txt2)',
              transition: '.2s',
            }}
          >
            <span style={{ marginRight: '0.3rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
