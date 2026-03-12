'use client'

export function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-2xs)',
      fontWeight: 600,
      letterSpacing: '0.06rem',
      textTransform: 'uppercase',
      color,
      background: bg,
      border: `1px solid ${color}`,
      padding: '0.08rem 0.25rem',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
