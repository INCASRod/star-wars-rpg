'use client'

interface StatValueProps {
  value: number | string
  label: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatValue({ value, label, size = 'md' }: StatValueProps) {
  const fontSize = size === 'lg' ? '2rem' : size === 'md' ? '1.3rem' : '1.05rem'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-orbitron)',
        fontSize,
        fontWeight: 800,
        color: 'var(--ink)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-orbitron)',
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        letterSpacing: '0.15rem',
        color: 'var(--txt3)',
        marginTop: '0.25rem',
      }}>
        {label}
      </div>
    </div>
  )
}
