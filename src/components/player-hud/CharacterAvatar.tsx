'use client'

import { useRef, useState } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase } from './design-tokens'
import { FS, RADIUS, FONT_BODY } from '@/lib/tokens'

const HUD_RED  = '#E05050'
const HUD_BLUE = '#5AAAE0'

interface CharacterAvatarProps {
  avatarUrl:       string | null | undefined
  characterName:   string
  career:          string
  spec:            string
  gender?:         string
  onUpload?:       (file: File) => Promise<void>
  onDelete?:       () => Promise<void>
  // Optional summary chips — hidden when undefined/falsy
  obligationChip?: string   // e.g. "Obligation · 15" or "Duty · 20"
  conflictTotal?:  number   // shown only when defined and > 0
  motivationChip?: string   // e.g. "Cause · Freedom"
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

export function CharacterAvatar({
  avatarUrl, characterName, career, spec, gender,
  onUpload, onDelete,
  obligationChip, conflictTotal, motivationChip,
}: CharacterAvatarProps) {
  const [hovered,    setHovered]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const canEdit = !!(onUpload || onDelete)

  const chipBase: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontSize: FS.overline,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    padding: '2px 8px',
    borderRadius: RADIUS.sm,
    display: 'inline-block',
  }
  const redChip: React.CSSProperties = {
    ...chipBase,
    background: 'rgba(224,80,80,0.10)',
    border: '1px solid rgba(224,80,80,0.28)',
    color: HUD_RED,
  }
  const blueChip: React.CSSProperties = {
    ...chipBase,
    background: 'rgba(90,170,224,0.10)',
    border: '1px solid rgba(90,170,224,0.28)',
    color: HUD_BLUE,
  }
  const showChips = obligationChip || (conflictTotal !== undefined && conflictTotal > 0) || motivationChip

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

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>

        {/* Portrait frame — fixed 72×96px */}
        <div
          style={{
            width: 72,
            height: 96,
            border: `1.5px solid rgba(224,58,30,${hovered && canEdit ? '0.65' : '0.4'})`,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            position: 'relative',
            cursor: canEdit ? 'pointer' : 'default',
            transition: 'border-color .2s',
            flexShrink: 0,
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
              background: hovered ? 'rgba(224,58,30,0.10)' : 'rgba(224,58,30,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_CINZEL, fontSize: 22, fontWeight: 700,
              color: C.gold, letterSpacing: '0.1em',
              transition: 'background .2s',
            }}>
              {uploading ? '…' : getInitials(characterName)}
            </div>
          )}

          {/* Bottom gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, var(--hud-surface-mid) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Edit overlay — shown on hover */}
          {canEdit && hovered && !uploading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: 6,
            }}>
              <button
                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                className="hov-gold-bg"
                style={{
                  background: 'rgba(224,58,30,0.22)',
                  border: '1px solid rgba(224,58,30,0.7)',
                  borderRadius: RADIUS.sm, padding: '4px 0',
                  fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: C.gold, cursor: 'pointer', width: '100%',
                  transition: '.15s',
                }}
              >
                ↑ {avatarUrl ? 'Replace' : 'Upload'}
              </button>

              {avatarUrl && onDelete && !confirming && (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true) }}
                  className="hov-red-bg"
                  style={{
                    background: 'rgba(224,80,80,0.18)',
                    border: '1px solid rgba(224,80,80,0.55)',
                    borderRadius: RADIUS.sm, padding: '4px 0',
                    fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: HUD_RED, cursor: 'pointer', width: '100%',
                    transition: '.15s',
                  }}
                >
                  ✕ Remove
                </button>
              )}

              {confirming && (
                <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete() }}
                    style={{
                      flex: 1, background: 'rgba(224,80,80,0.35)',
                      border: '1px solid rgba(224,80,80,0.8)',
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: HUD_RED, cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirming(false) }}
                    style={{
                      flex: 1, background: 'var(--hud-surface-mid)',
                      border: `1px solid ${C.border}`,
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
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

          {/* Uploading spinner */}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--hud-surface-lo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gold,
              }}>
                Uploading…
              </div>
            </div>
          )}
        </div>

        {/* Right side: name, subtitle, chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: FS.sm, fontWeight: 600,
            color: C.gold, letterSpacing: '0.04em', lineHeight: 1.2,
          }}>
            {characterName}
          </div>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS.overline, color: C.textDim,
            marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {career}{spec ? ` · ${spec}` : ''}{gender ? ` · ${gender}` : ''}
          </div>
          {canEdit && (
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS.overline, color: C.textFaint, marginTop: 2, letterSpacing: '0.06em' }}>
              hover portrait to edit
            </div>
          )}
          {showChips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {obligationChip && <span style={redChip}>{obligationChip}</span>}
              {conflictTotal !== undefined && conflictTotal > 0 && (
                <span style={redChip}>Conflict · {conflictTotal}</span>
              )}
              {motivationChip && <span style={blueChip}>{motivationChip}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
