'use client'

import { useEffect, useRef } from 'react'

const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const PANEL_BG = 'rgba(6,13,9,0.97)'
const GOLD     = '#C8AA50'
const DIM      = '#6A8070'
const BORDER_HI = 'rgba(200,170,80,0.36)'

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
        bottom: 'calc(100% + 8px)',
        left: 0,
        zIndex: 600,
        width: 300,
        background: PANEL_BG,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${BORDER_HI}`,
        borderRadius: 6,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      }}
    >
      <div style={{
        fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700,
        color: GOLD, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
        marginBottom: 10,
      }}>
        🔗 Find Token Images
      </div>

      <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 10 }}>
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
            padding: '8px 0',
            borderBottom: `1px solid rgba(200,170,80,0.07)`,
            textDecoration: 'none',
          }}
        >
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GOLD }}>
            → {r.label}
          </div>
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
            {r.desc}
          </div>
        </a>
      ))}

      <div style={{
        marginTop: 12,
        fontFamily: FR, fontSize: FS_CAPTION,
        color: DIM, fontStyle: 'italic', lineHeight: 1.5,
      }}>
        Tip: Search for the character or species name + &quot;token&quot; or &quot;VTT&quot; for
        best results. Recommended size: 256×256px, PNG with transparent background.
      </div>
    </div>
  )
}
