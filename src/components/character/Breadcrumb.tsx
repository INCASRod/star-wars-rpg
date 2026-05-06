'use client'

interface BreadcrumbProps {
  characterName: string
  activeTab?: string
}

export function Breadcrumb({ characterName, activeTab = 'Character' }: BreadcrumbProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--sp-lg)',
      gap: 'var(--sp-sm)',
    }}>
      <span style={{
        fontFamily: 'var(--font-rajdhani)',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        letterSpacing: '0.08rem',
        color: 'var(--bs-txt3)',
      }}>
        {activeTab}
      </span>
      <span style={{ color: 'var(--bs-bdr-strong)', fontSize: 'var(--font-sm)' }}>/</span>
      <span style={{
        fontFamily: 'var(--font-rajdhani)',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        letterSpacing: '0.08rem',
        color: 'var(--bs-txt2)',
      }}>
        {characterName}
      </span>
    </div>
  )
}
