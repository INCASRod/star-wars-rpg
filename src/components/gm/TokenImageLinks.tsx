'use client'

import { useEffect, useRef } from 'react'
import { HUD, FONT_BODY, RADIUS, Z } from '@/lib/tokens'

// Map token colours — pre-approved identity exceptions
const PANEL_BG  = 'rgba(6,13,9,0.97)'

const FS_CAPTION = 'var(--text-caption)'
const FS_LABEL   = 'var(--text-label)'

interface TokenImageLinksProps {
  onClose: () => void
}

const RESOURCES = [
  {
    label: 'Star Wars Adversaries Database',
    url:   'https://swa.stoogoff.com',
    desc:  'swa.stoogoff.com',
  },
  {
    label: 'SWRPG Community Graphics & Tokens',
    url:   'https://swrpgcommunity.com/gm-resources/graphics-tokens',
    desc:  'swrpgcommunity.com/gm-resources/graphics-tokens',
  },
  {
    label: 'Roll20 Star Wars Token Collection',
    url:   'https://marketplace.roll20.net',
    desc:  'Search "Star Wars FFG tokens" on marketplace — many are free',
  },
]

export function TokenImageLinks({ onClose }: TokenImageLinksProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 0.5rem)',
        left: 0,
        zIndex: Z.fab,
        width: '18.75rem',
        background: PANEL_BG,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${HUD.borderHi}`,
        borderRadius: RADIUS.lg,
        padding: '0.875rem 1rem',
        boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.7)',
      }}
    >
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS_LABEL, fontWeight: 700,
        color: HUD.gold, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
        marginBottom: '0.625rem',
      }}>
        🔗 Find Token Images
      </div>

      <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginBottom: '0.625rem' }}>
        Community resources for free token art:
      </div>

      {RESOURCES.map(r => (
        <a
          key={r.url}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '0.5rem 0',
            borderBottom: `1px solid rgba(200,170,80,0.07)`,
            textDecoration: 'none',
          }}
        >
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, fontWeight: 700, color: HUD.gold }}>
            → {r.label}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginTop: '0.125rem' }}>
            {r.desc}
          </div>
        </a>
      ))}

      <div style={{
        marginTop: '0.75rem',
        fontFamily: FONT_BODY, fontSize: FS_CAPTION,
        color: HUD.textDim, fontStyle: 'italic', lineHeight: 1.5,
      }}>
        Tip: Search for the character or species name + &quot;token&quot; or &quot;VTT&quot; for
        best results. Recommended size: 256×256px, PNG with transparent background.
      </div>
    </div>
  )
}
