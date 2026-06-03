'use client'

import { useState, useRef } from 'react'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { RichText } from '@/components/ui/RichText'
import { FONT_BODY, FONT_MONO, FS, SP, RADIUS, HUD, EASE } from '@/lib/tokens'
import type { Character, RefSpecies } from '@/lib/types'

// ─── Props ───────────────────────────────────────────────────────────────────
interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  specNames: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toTitleCase(s: string | undefined | null): string {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

function useDebounced(init: string, onSave: (v: string) => void) {
  const [val, setVal] = useState(init)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChange = (v: string) => {
    setVal(v)
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => onSave(v), 800)
  }
  return [val, onChange] as const
}

// ─── Zone bar (slim section header) ──────────────────────────────────────────
function ZoneBar({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${SP[1]} ${SP[3]}`,
      borderBottom: `1px solid var(--hud-border)`,
      background: 'var(--hud-panel)', flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.overline,
        fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'var(--hud-text-faint)',
      }}>{label}</span>
      {right}
    </div>
  )
}

// ─── Sidebar fact row ─────────────────────────────────────────────────────────
function FactRow({ label, value, accent }: {
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.125rem',
      padding: `${SP[1]} ${SP[3]}`,
      borderBottom: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)`,
    }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline,
        fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--hud-text-faint)',
      }}>{label}</div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.label,
        color: accent ? 'var(--hud-accent)' : 'var(--hud-text-dim)',
      }}>{value ?? '—'}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HudLoreTab({
  character, careerName, speciesName, specNames,
  refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  const isForceUser = isForceUserSensitive(character)

  // Backstory edit toggle + debounced save
  const [editingBackstory, setEditingBackstory] = useState(false)
  const [localBackstory, handleBackstoryChange] = useDebounced(character.backstory || '', onBackstoryChange)
  const [localNotes, handleNotesChange] = useDebounced(character.notes || '', onNotesChange)

  // Portrait hover / upload state
  const [portraitHovered, setPortraitHovered]     = useState(false)
  const [portraitUploading, setPortraitUploading] = useState(false)
  const [portraitConfirming, setPortraitConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPortraitUploading(true)
    await onPortraitUpload(file)
    setPortraitUploading(false)
    e.target.value = ''
  }

  const handlePortraitDeleteConfirmed = async () => {
    setPortraitConfirming(false)
    setPortraitUploading(true)
    await onPortraitDelete()
    setPortraitUploading(false)
  }

  // Zone 1 — obligation/duty chips
  const chips: { key: string; label: string }[] = []
  if (character.duty_obligation_configured) {
    if (character.obligation_type && character.obligation_value !== undefined) {
      const name = refObligationTypes.find(o => o.key === character.obligation_type)?.name
        || character.obligation_custom_name || toTitleCase(character.obligation_type)
      chips.push({ key: 'obligation', label: `${name} · ${character.obligation_value}` })
    }
    if (character.duty_type && character.duty_value !== undefined) {
      const name = refDutyTypes.find(d => d.key === character.duty_type)?.name
        || character.duty_custom_name || toTitleCase(character.duty_type)
      chips.push({ key: 'duty', label: `${name} · ${character.duty_value}` })
    }
  }

  // Sidebar — resolved display names
  const dutyResolvedName = character.duty_type
    ? refDutyTypes.find(d => d.key === character.duty_type)?.name
      || character.duty_custom_name || toTitleCase(character.duty_type)
    : null
  const obligationResolvedName = character.obligation_type
    ? refObligationTypes.find(o => o.key === character.obligation_type)?.name
      || character.obligation_custom_name || toTitleCase(character.obligation_type)
    : null

  // Motivation description with fallback chain
  const motivationText = character.motivation_description
    || character.obligation_notes
    || character.duty_notes
    || ''

  // Duty / Obligation expanded-card descriptions
  const dutyDescription = character.duty_lore || character.duty_notes || ''
  const obligationDescription = character.obligation_lore || character.obligation_notes || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ══ ZONE 1 — Name strip ══════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: SP[3], padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)', flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
            letterSpacing: '0.06em', color: 'var(--hud-text)', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {character.name}
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: 'var(--hud-text-dim)', letterSpacing: '0.08em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {careerName}{specNames ? ` · ${specNames}` : ''} · {speciesName}
          </div>
        </div>
        {chips.map(chip => (
          <span key={chip.key} style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: `0.0625rem ${SP[2]}`,
            borderRadius: RADIUS.full,
            border: `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`,
            background: `color-mix(in srgb, var(--hud-accent) 8%, transparent)`,
            color: 'var(--hud-text-dim)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {chip.label}
          </span>
        ))}
      </div>

      {/* ══ ZONE 2 — Upper block ═════════════════════════════════════════════ */}
      <div style={{
        height: 'clamp(18rem, 55%, 26rem)', flexShrink: 0,
        display: 'flex', flexDirection: 'row',
        borderBottom: `1px solid var(--hud-border)`,
        overflow: 'hidden',
      }}>

        {/* ── Portrait column ── */}
        <div
          style={{
            width: '7rem', flexShrink: 0,
            borderRight: `1px solid var(--hud-border)`,
            overflow: 'hidden',
            background: 'var(--hud-surface-mid)',
            position: 'relative', cursor: 'pointer',
          }}
          onMouseEnter={() => setPortraitHovered(true)}
          onMouseLeave={() => { setPortraitHovered(false); setPortraitConfirming(false) }}
          onClick={() => { if (!character.portrait_url && !portraitUploading) fileRef.current?.click() }}
        >
          {character.portrait_url ? (
            <img
              src={character.portrait_url}
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center', display: 'block',
                filter: portraitHovered ? 'brightness(0.55)' : 'none',
                transition: `filter ${EASE.default}`,
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: 'var(--hud-text-faint)',
              writingMode: 'vertical-rl', textAlign: 'center',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: portraitHovered
                ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)'
                : 'transparent',
              transition: `background ${EASE.default}`,
            }}>
              {portraitUploading ? '…' : 'No portrait'}
            </div>
          )}

          {/* Upload/delete overlay on hover */}
          {portraitHovered && !portraitUploading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: SP[1], padding: SP[2],
            }}>
              <button
                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                style={{
                  background: 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                  border: `1px solid color-mix(in srgb, var(--hud-accent) 60%, transparent)`,
                  borderRadius: RADIUS.sm, padding: `${SP[1]} 0`,
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: HUD.gold, cursor: 'pointer', width: '100%',
                  transition: EASE.default,
                }}
              >
                ↑ {character.portrait_url ? 'Replace' : 'Upload'}
              </button>
              {character.portrait_url && !portraitConfirming && (
                <button
                  onClick={e => { e.stopPropagation(); setPortraitConfirming(true) }}
                  style={{
                    background: 'color-mix(in srgb, var(--state-failure) 18%, transparent)',
                    border: `1px solid color-mix(in srgb, var(--state-failure) 55%, transparent)`,
                    borderRadius: RADIUS.sm, padding: `${SP[1]} 0`,
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--state-failure)', cursor: 'pointer', width: '100%',
                    transition: EASE.default,
                  }}
                >
                  ✕ Remove
                </button>
              )}
              {portraitConfirming && (
                <div style={{ display: 'flex', gap: SP[1], width: '100%' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handlePortraitDeleteConfirmed() }}
                    style={{
                      flex: 1,
                      background: 'color-mix(in srgb, var(--state-failure) 35%, transparent)',
                      border: `1px solid color-mix(in srgb, var(--state-failure) 80%, transparent)`,
                      borderRadius: RADIUS.sm, padding: `${SP[1]} 0`,
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--state-failure)', cursor: 'pointer',
                    }}
                  >Confirm</button>
                  <button
                    onClick={e => { e.stopPropagation(); setPortraitConfirming(false) }}
                    style={{
                      flex: 1,
                      background: 'var(--hud-surface-mid)',
                      border: `1px solid var(--hud-border)`,
                      borderRadius: RADIUS.sm, padding: `${SP[1]} 0`,
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--hud-text-dim)', cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* Uploading spinner */}
          {portraitUploading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--hud-surface-lo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.gold,
                writingMode: 'vertical-rl',
              }}>Uploading…</div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* ── Centre cards column ── */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          borderRight: `1px solid var(--hud-border)`,
        }}>

          {/* Background card — flex 3 */}
          <div style={{
            flex: 3, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            borderBottom: `1px solid var(--hud-border)`,
            overflow: 'hidden',
          }}>
            <ZoneBar
              label="Background"
              right={
                <button
                  onClick={() => setEditingBackstory(e => !e)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--hud-text-faint)', padding: 0,
                    transition: EASE.default,
                  }}
                >
                  {editingBackstory ? 'Preview' : 'Edit'}
                </button>
              }
            />
            <div style={{ flex: 1, overflowY: 'auto', padding: `${SP[2]} ${SP[3]}` }}>
              {editingBackstory ? (
                <>
                  <textarea
                    value={localBackstory}
                    onChange={e => handleBackstoryChange(e.target.value)}
                    placeholder="Write your character's backstory… (OggDude markup supported)"
                    className="hud-textarea"
                    style={{ minHeight: '8rem' }}
                    autoFocus
                  />
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline,
                    color: 'var(--hud-text-faint)', marginTop: SP[1],
                    textAlign: 'right', letterSpacing: '0.06em',
                  }}>
                    Auto-saves on pause
                  </div>
                </>
              ) : localBackstory ? (
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm,
                  color: 'var(--hud-text)', lineHeight: 1.8,
                }}>
                  {localBackstory.split(/\[P\]/gi).filter(s => s.trim()).map((seg, i) => (
                    <div key={i} style={{ marginTop: i > 0 ? SP[3] : 0 }}>
                      <RichText text={seg.trim()} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm,
                  color: 'var(--hud-text-dim)', fontStyle: 'italic',
                }}>
                  No backstory recorded.
                </div>
              )}
            </div>
          </div>

          {/* Motivation card — flex 2 */}
          <div style={{
            flex: 2, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <ZoneBar
              label="Motivation"
              right={
                (character.motivation_type || character.motivation_specific) ? (
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline,
                    color: 'var(--hud-text-faint)',
                  }}>
                    {[character.motivation_type, character.motivation_specific]
                      .filter(Boolean).join(' · ')}
                  </span>
                ) : undefined
              }
            />
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: `${SP[2]} ${SP[3]}`,
              fontFamily: FONT_BODY, fontSize: FS.sm,
              color: 'var(--hud-text-dim)', lineHeight: 1.6,
            }}>
              {motivationText ? (
                <RichText text={motivationText} />
              ) : (
                <span style={{ fontStyle: 'italic' }}>No motivation recorded.</span>
              )}
            </div>
          </div>

        </div>

        {/* ── Sidebar ── */}
        <div style={{
          width: '11rem', flexShrink: 0,
          overflowY: 'auto',
        }}>
          {/* Quick Facts — Species and Career only */}
          <FactRow label="Species" value={speciesName} />
          <FactRow label="Career" value={careerName} />

          {/* Duty — expanded card */}
          {character.duty_obligation_configured && dutyResolvedName && character.duty_value !== undefined && (
            <div style={{
              padding: `${SP[2]} ${SP[3]}`,
              borderBottom: `1px solid var(--hud-border)`,
              background: 'var(--hud-surface-lo)',
              display: 'flex', flexDirection: 'column',
              gap: SP[1],
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--hud-text-faint)',
              }}>Duty</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.label,
                fontWeight: 700, color: 'var(--hud-text)',
              }}>
                {dutyResolvedName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                <div style={{
                  flex: 1, height: '0.25rem',
                  background: 'var(--hud-border)',
                  borderRadius: '0.125rem', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, character.duty_value ?? 0)}%`,
                    background: 'var(--hud-gold)',
                    borderRadius: '0.125rem',
                  }} />
                </div>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: FS.overline,
                  color: 'var(--hud-gold)', whiteSpace: 'nowrap',
                }}>
                  {character.duty_value ?? 0} / 100
                </span>
              </div>
              {dutyDescription && (
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: 'var(--hud-text-faint)',
                  lineHeight: 1.5, fontStyle: 'italic',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {dutyDescription}
                </div>
              )}
            </div>
          )}

          {/* Obligation — expanded card */}
          {character.duty_obligation_configured && obligationResolvedName && character.obligation_value !== undefined && (
            <div style={{
              padding: `${SP[2]} ${SP[3]}`,
              borderBottom: `1px solid var(--hud-border)`,
              background: 'var(--hud-surface-lo)',
              display: 'flex', flexDirection: 'column',
              gap: SP[1],
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--hud-text-faint)',
              }}>Obligation</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.label,
                fontWeight: 700, color: 'var(--hud-text)',
              }}>
                {obligationResolvedName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                <div style={{
                  flex: 1, height: '0.25rem',
                  background: 'var(--hud-border)',
                  borderRadius: '0.125rem', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, character.obligation_value ?? 0)}%`,
                    background: 'var(--hud-accent)',
                    borderRadius: '0.125rem',
                  }} />
                </div>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: FS.overline,
                  color: 'var(--hud-accent)', whiteSpace: 'nowrap',
                }}>
                  {character.obligation_value ?? 0} / 100
                </span>
              </div>
              {obligationDescription && (
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: 'var(--hud-text-faint)',
                  lineHeight: 1.5, fontStyle: 'italic',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {obligationDescription}
                </div>
              )}
            </div>
          )}

          {/* Morality — Force sensitive only */}
          {isForceUser && character.morality_configured && (
            <div style={{ marginTop: SP[2] }}>
              {character.morality_value !== undefined && (
                <FactRow label="Morality" value={character.morality_value} />
              )}
              {character.morality_strength_key && (
                <FactRow label="Strength" value={toTitleCase(character.morality_strength_key)} />
              )}
              {character.morality_weakness_key && (
                <FactRow label="Weakness" value={toTitleCase(character.morality_weakness_key)} />
              )}
            </div>
          )}
        </div>

      </div>

      {/* ══ ZONE 3 — Notes ═══════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <ZoneBar label="Notes" />
        <div style={{ flex: 1, overflowY: 'auto', padding: `${SP[2]} ${SP[3]}` }}>
          <textarea
            value={localNotes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Session notes, reminders, contacts, safehouses…"
            className="hud-textarea"
            style={{ height: '100%', minHeight: '4rem', resize: 'none' }}
          />
        </div>
      </div>

    </div>
  )
}
