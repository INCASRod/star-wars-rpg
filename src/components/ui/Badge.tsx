'use client'

import { FONT_BODY, FS } from '@/lib/tokens'

export function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: FONT_BODY,
      fontSize: FS.overline,
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
