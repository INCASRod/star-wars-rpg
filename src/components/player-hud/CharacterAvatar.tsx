'use client'

import { useRef, useState } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase } from './design-tokens'

interface CharacterAvatarProps {
  avatarUrl:      string | null | undefined
  characterName:  string
  career:         string
  spec:           string
  onUpload?:      (file: File) => Promise<void>
  onDelete?:      () => Promise<void>
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

export function CharacterAvatar({ avatarUrl, characterName, career, spec, onUpload, onDelete }: CharacterAvatarProps) {
  const [hovered,    setHovered]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const canEdit = !!(onUpload || onDelete)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUpload) return
    setUploading(true)
    await onUpload(file)
    setUploading(false)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setConfirming(false)
    setUploading(true)
    await onDelete()
    setUploading(false)
  }

  return (
    <div style={{ ...panelBase, padding: 12 }}>
      <CornerBrackets />

      {/* Portrait frame */}
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          border: `1.5px solid rgba(200,170,80,${hovered && canEdit ? '0.65' : '0.4'})`,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
          cursor: canEdit ? 'pointer' : 'default',
          transition: 'border-color .2s',
        }}
        onMouseEnter={() => canEdit && setHovered(true)}
        onMouseLeave={() => { canEdit && setHovered(false); setConfirming(false) }}
        onClick={() => { if (canEdit && !avatarUrl && !uploading) fileRef.current?.click() }}
      >
        {/* Image or initials */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={characterName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'filter .2s', filter: hovered ? 'brightness(0.55)' : 'none' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: hovered ? 'rgba(200,170,80,0.10)' : 'rgba(200,170,80,0.06)',
            border: `1.5px dashed rgba(200,170,80,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_CINZEL, fontSize: 28, fontWeight: 700,
            color: C.gold, letterSpacing: '0.1em',
            transition: 'background .2s',
          }}>
            {uploading ? '…' : getInitials(characterName)}
          </div>
        )}

        {/* Bottom gradient — always present */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(200,170,80,0.08) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Edit overlay — shown on hover */}
        {canEdit && hovered && !uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: 12,
          }}>
            {/* Upload button */}
            <button
              onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
              style={{
                background: 'rgba(200,170,80,0.22)',
                border: `1px solid rgba(200,170,80,0.7)`,
                borderRadius: 4, padding: '6px 14px',
                fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: C.gold, cursor: 'pointer', width: '100%',
                transition: '.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.22)' }}
            >
              ↑ {avatarUrl ? 'Replace' : 'Upload'}
            </button>

            {/* Remove button — only if image exists */}
            {avatarUrl && onDelete && !confirming && (
              <button
                onClick={e => { e.stopPropagation(); setConfirming(true) }}
                style={{
                  background: 'rgba(224,80,80,0.18)',
                  border: '1px solid rgba(224,80,80,0.55)',
                  borderRadius: 4, padding: '6px 14px',
                  fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: '#E05050', cursor: 'pointer', width: '100%',
                  transition: '.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.32)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.18)' }}
              >
                ✕ Remove
              </button>
            )}

            {/* Confirm remove */}
            {confirming && (
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete() }}
                  style={{
                    flex: 1, background: 'rgba(224,80,80,0.35)',
                    border: '1px solid rgba(224,80,80,0.8)',
                    borderRadius: 4, padding: '6px 0',
                    fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#E05050', cursor: 'pointer',
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false) }}
                  style={{
                    flex: 1, background: 'rgba(100,120,100,0.22)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 4, padding: '6px 0',
                    fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: C.textDim, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Uploading spinner overlay */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(6,13,9,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gold,
            }}>
              Uploading…
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Name + career */}
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: '0.04em', lineHeight: 1.2 }}>
          {characterName}
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 10, color: C.textDim, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {career}{spec ? ` · ${spec}` : ''}
        </div>
        {canEdit && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 9, color: C.textFaint, marginTop: 2, letterSpacing: '0.06em' }}>
            hover portrait to edit
          </div>
        )}
      </div>
    </div>
  )
}
