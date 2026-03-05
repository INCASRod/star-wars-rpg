'use client'

import { useRouter } from 'next/navigation'

interface TopBarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const TABS = ['Character', 'Talents', 'Inventory']

export function TopBar({ activeTab = 'Character', onTabChange }: TopBarProps) {
  const router = useRouter()

  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 var(--sp-xl)`,
      borderBottom: '1px solid var(--bdr-l)',
      background: 'rgba(250,247,242,.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
        {/* Home button */}
        <button
          onClick={() => router.push('/')}
          title="Back to character select"
          style={{
            background: 'none',
            border: '1px solid var(--bdr-l)',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--txt2)',
            transition: '.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span style={{ fontSize: 'var(--font-base)' }}>{'\u2190'}</span>
          HOME
        </button>

        <div style={{
          fontFamily: 'var(--font-orbitron)',
          fontWeight: 800,
          fontSize: 'var(--font-md)',
          letterSpacing: '0.35rem',
          color: 'var(--gold-d)',
        }}>
          HOLOCRON{' '}
          <span style={{
            color: 'var(--txt3)',
            fontWeight: 400,
            fontSize: 'var(--font-sm)',
            letterSpacing: '0.2rem',
            marginLeft: '0.5rem',
          }}>
            // Campaign Manager
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange?.(tab)}
            style={{
              background: activeTab === tab ? 'var(--gold-glow)' : 'none',
              border: `1px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`,
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              letterSpacing: '0.15rem',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              color: activeTab === tab ? 'var(--gold-d)' : 'var(--txt2)',
              textTransform: 'uppercase' as const,
              transition: '.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
