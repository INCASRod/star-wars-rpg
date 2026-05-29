'use client'

import { useRef, useState } from 'react'
import { panelBase } from './design-tokens'
import { HUD, COLOR, FS, SP, RADIUS, EASE, FONT_BODY, FONT_DISPLAY } from '@/lib/tokens'

// HUD_RED: state-failure red (#E05050) — no HUD token; using var(--state-failure)
const HUD_RED  = 'var(--state-failure)'
// HUD_BLUE: project blue (#5AAAE0) — using COLOR.blue = var(--blue)
const HUD_BLUE = COLOR.blue

const chipBase: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  padding: `2px ${SP[2]}`,
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
      <div style={{ ...s, top: 0, left: 0, borderTop: `1.5px solid ${HUD.gold}`, borderLeft: `1.5px solid ${HUD.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1.5px solid ${HUD.gold}`, borderRight: `1.5px solid ${HUD.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1.5px solid ${HUD.gold}`, borderLeft: `1.5px solid ${HUD.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1.5px solid ${HUD.gold}`, borderRight: `1.5px solid ${HUD.gold}` }} />
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
    <div style={{ ...panelBase, padding: SP[3] }}>
      <CornerBrackets />

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>

        {/* Portrait frame — fixed 72×96px */}
        <div
          style={{
            width: 72,
            height: 96,
            border: `1.5px solid ${hovered && canEdit ? 'color-mix(in srgb, var(--hud-accent) 60%, transparent)' : 'var(--hud-accent-border)'}`,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            position: 'relative',
            cursor: canEdit ? 'pointer' : 'default',
            transition: `border-color ${EASE.default}`,
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: `filter ${EASE.default}`, filter: hovered ? 'brightness(0.55)' : 'none' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: hovered ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)' : 'rgba(224,58,30,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700,
              color: HUD.gold, letterSpacing: '0.1em',
              transition: `background ${EASE.default}`,
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
                  background: 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                  border: `1px solid color-mix(in srgb, var(--hud-accent) 60%, transparent)`,
                  borderRadius: RADIUS.sm, padding: '4px 0',
                  fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: HUD.gold, cursor: 'pointer', width: '100%',
                  transition: EASE.default,
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
                    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: HUD_RED, cursor: 'pointer', width: '100%',
                    transition: EASE.default,
                  }}
                >
                  ✕ Remove
                </button>
              )}

              {confirming && (
                <div style={{ display: 'flex', gap: SP[1], width: '100%' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete() }}
                    style={{
                      flex: 1, background: 'rgba(224,80,80,0.35)',
                      border: '1px solid rgba(224,80,80,0.8)',
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
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
                      border: `1px solid ${HUD.border}`,
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: HUD.textDim, cursor: 'pointer',
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
                fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.gold,
              }}>
                Uploading…
              </div>
            </div>
          )}
        </div>

        {/* Right side: name, subtitle, chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 600,
            color: HUD.gold, letterSpacing: '0.04em', lineHeight: 1.2,
          }}>
            {characterName}
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
            marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {career}{spec ? ` · ${spec}` : ''}{gender ? ` · ${gender}` : ''}
          </div>
          {canEdit && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, marginTop: 2, letterSpacing: '0.06em' }}>
              hover portrait to edit
            </div>
          )}
          {showChips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1], marginTop: SP[1] }}>
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
