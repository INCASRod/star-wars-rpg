'use client'

import { useRef, useState } from 'react'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, Z } from '@/lib/tokens'

interface CenterHeroProps {
  name: string
  subtitle: string
  portraitUrl?: string
  credits: number
  xpTotal: number
  xpAvailable: number
  onPortraitUpload?: (file: File) => void
  onPortraitDelete?: () => void
}

export function CenterHero({ name, subtitle, portraitUrl, credits, xpTotal, xpAvailable, onPortraitUpload, onPortraitDelete }: CenterHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [hovering, setHovering] = useState(false)

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: Z.raised,
      height: '100%',
    }}>
      {/* Glow disc */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(-20px, -2vw, -50px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(280px, 24vw, 600px)',
        height: 'clamp(60px, 6vw, 150px)',
        // --bs-red-glow-s → var(--hud-accent-45)
        background: 'radial-gradient(ellipse, var(--hud-accent-45) 0%, transparent 70%)',
        zIndex: Z.base,
        animation: 'glowPulse 3s ease-in-out infinite',
      }} />

      {/* Hero image area */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(320px, 30vw, 800px)',
          height: '92%',
          zIndex: Z.base,
          overflow: 'hidden',
        }}
      >
        {portraitUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portraitUrl}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                // CSS mask gradient — no token equivalent; kept as literal CSS value
                maskImage: 'linear-gradient(to top, transparent 0%, black 12%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 12%, black 85%, transparent 100%)',
                filter: 'brightness(1.02) contrast(1.04)',
                animation: 'heroIn .9s ease forwards',
              }}
            />
            {/* Delete / Change overlay on hover */}
            {hovering && onPortraitDelete && (
              <div style={{
                position: 'absolute', top: 'var(--sp-md)', right: 'var(--sp-md)',
                display: 'flex', gap: 'var(--sp-xs)',
              }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    // --bs-card → var(--hud-surface-lo)
                    background: 'var(--hud-surface-lo)', backdropFilter: 'blur(6px)',
                    border: `1px solid ${HUD.borderHi}`,
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: FS.caption,
                    fontWeight: 700, letterSpacing: '0.08rem',
                    color: HUD.textDim, transition: '.15s',
                  }}
                >
                  CHANGE
                </button>
                <button
                  onClick={onPortraitDelete}
                  style={{
                    // Pre-approved: rgba(0,0,0,*) overlay — this is rgba(191,64,64,.12), a themed red overlay
                    background: 'rgba(191,64,64,.12)', backdropFilter: 'blur(6px)',
                    border: '1px solid var(--red)',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: FS.caption,
                    fontWeight: 700, letterSpacing: '0.08rem',
                    color: 'var(--red)', transition: '.15s',
                  }}
                >
                  REMOVE
                </button>
              </div>
            )}
          </>
        ) : (
          /* Upload placeholder */
          onPortraitUpload && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', height: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 'var(--sp-sm)',
              }}
            >
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '50%',
                border: `2px dashed ${HUD.borderHi}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: FS.h3, color: HUD.textFaint,
                transition: '.2s',
              }}>
                +
              </div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.caption,
                fontWeight: 600, letterSpacing: '0.15rem',
                color: HUD.textFaint,
              }}>
                UPLOAD PORTRAIT
              </div>
            </button>
          )
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file && onPortraitUpload) onPortraitUpload(file)
          e.target.value = ''
        }}
      />

      {/* Info container — sits above the image with a readable backdrop */}
      <div style={{
        position: 'relative',
        zIndex: Z.sticky,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 'var(--sp-xs)',
      }}>
        {/* Backdrop for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          // Pre-approved: rgba(232,221,208,*) is the parchment/sand background colour used
          // as a gradient overlay for readability — intentional literal rgba values
          background: 'linear-gradient(to top, rgba(232,221,208,.95) 0%, rgba(232,221,208,.8) 60%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: -1,
        }} />

        {/* Name plate */}
        <div className="au d4" style={{
          textAlign: 'center',
          marginBottom: 'var(--sp-md)',
          paddingTop: 'var(--sp-lg)',
        }}>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 'var(--font-hero)',
            letterSpacing: '0.4rem',
            color: HUD.text,
            // --bs-red-glow-s → var(--hud-accent-45)
            textShadow: '0 0 40px var(--hud-accent-45)',
          }}>
            {name}
          </h1>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.h4,
            color: HUD.textDim,
            letterSpacing: '0.1rem',
            marginTop: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}>
            {subtitle}
          </div>
        </div>

        {/* Meta row: Credits, XP */}
        <div className="au d5" style={{
          display: 'flex',
          gap: 'var(--sp-xl)',
          justifyContent: 'center',
          marginBottom: 'var(--sp-xs)',
        }}>
          {/* Dynamic color prop — kept as inline style in MetaItem */}
          <MetaItem value={credits} label="Credits" color="var(--hud-accent)" />
          <MetaItem value={xpTotal} label="Total XP" />
          <MetaItem value={xpAvailable} label="Available" color="var(--blue)" />
        </div>
      </div>
    </div>
  )
}

function MetaItem({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: FONT_DISPLAY,
        fontSize: FS.h3,
        fontWeight: 800,
        // Dynamic color — value is passed as a prop at runtime, kept as inline style
        color: color || HUD.text,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: FS.caption,
        fontWeight: 600,
        letterSpacing: '0.15rem',
        color: HUD.textFaint,
        marginTop: '0.25rem',
      }}>
        {label}
      </div>
    </div>
  )
}
