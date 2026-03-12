'use client'

import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase } from './design-tokens'

interface CharacterAvatarProps {
  avatarUrl:     string | null | undefined
  characterName: string
  career:        string
  spec:          string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 8, height: 8 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1.5px solid ${C.gold}`, borderLeft: `1.5px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1.5px solid ${C.gold}`, borderRight: `1.5px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1.5px solid ${C.gold}`, borderLeft: `1.5px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1.5px solid ${C.gold}`, borderRight: `1.5px solid ${C.gold}` }} />
    </>
  )
}

export function CharacterAvatar({ avatarUrl, characterName, career, spec }: CharacterAvatarProps) {
  return (
    <div style={{ ...panelBase, padding: 12 }}>
      <CornerBrackets />

      {/* Portrait frame */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        border: `1.5px solid rgba(200,170,80,0.4)`,
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={characterName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'rgba(200,170,80,0.06)',
            border: `1.5px dashed rgba(200,170,80,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_CINZEL,
            fontSize: 28, fontWeight: 700,
            color: C.gold,
            letterSpacing: '0.1em',
          }}>
            {getInitials(characterName)}
          </div>
        )}
        {/* Hover glow overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(200,170,80,0.08) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Name + career */}
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 600,
          color: C.gold, letterSpacing: '0.04em', lineHeight: 1.2,
        }}>
          {characterName}
        </div>
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: 10, color: C.textDim,
          marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {career}{spec ? ` · ${spec}` : ''}
        </div>
      </div>
    </div>
  )
}
