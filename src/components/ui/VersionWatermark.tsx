'use client'

export function VersionWatermark() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0'
  const commit  = process.env.NEXT_PUBLIC_COMMIT_HASH  ?? 'unknown'

  return (
    <div style={{
      position:      'fixed',
      bottom:        12,
      right:         16,
      zIndex:        10,
      fontFamily:    'var(--font-body)',
      fontSize:      'clamp(0.58rem, 0.85vw, 0.68rem)',
      color:         'var(--hud-text-faint)',
      letterSpacing: '0.05em',
      userSelect:    'none',
      pointerEvents: 'none',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.color         = 'var(--hud-text-dim)'
        el.style.pointerEvents = 'auto'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.color         = 'var(--hud-text-faint)'
        el.style.pointerEvents = 'none'
      }}
    >
      v{version} ({commit})
    </div>
  )
}
