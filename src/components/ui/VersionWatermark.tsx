'use client'

import { Z, FS } from '@/lib/tokens'

export function VersionWatermark() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0'
  const commit  = process.env.NEXT_PUBLIC_COMMIT_HASH  ?? 'unknown'

  return (
    <div style={{
      position:      'fixed',
      bottom:        '0.75rem',
      right:         '1rem',
      zIndex:        Z.sticky,
      fontFamily:    'var(--font-body)',
      fontSize:      FS.overline,
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
