'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import type { Adversary } from '@/lib/adversaries'
import { resolveWeapon } from '@/lib/resolve-weapon'
import { TokenImageLinks } from './TokenImageLinks'
import { RichText } from '@/components/ui/RichText'
import { HUD, FONT_DISPLAY, FONT_BODY, FONT_MONO, RADIUS, EASE } from '@/lib/tokens'

/* ── Design tokens ─────────────────────────────────────────────── */
const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

// Adversary type identity colours — pre-approved NPC identity exception
const TYPE_COLORS: Record<string, string> = {
  minion:  HUD.textDim,
  rival:   'var(--die-force)',
  nemesis: HUD.gold,
}

/* ── Helpers ───────────────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? HUD.textDim
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: FS_CAPTION, fontWeight: 700,
      color, border: `1px solid ${color}`, borderRadius: RADIUS.sm,
      padding: '0.0625rem 0.4375rem', letterSpacing: '0.1em',
      background: `${color}18`,
    }}>
      {type.toUpperCase()}
    </span>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md,
      padding: '0.5rem 0.625rem', minWidth: 48,
    }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: HUD.textDim, letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS_H4, fontWeight: 700, color: HUD.text }}>
        {value}
      </div>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase' as const,
      color: 'var(--hud-gold-40)', borderBottom: `1px solid ${HUD.border}`,
      paddingBottom: '0.25rem', marginBottom: '0.5rem',
    }}>
      {children}
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────────────── */
export interface AdversaryDetailPanelProps {
  adversary:        Adversary & { _isCustom?: boolean }
  campaignId:       string
  supabase:         SupabaseClient
  tokenUrl:         string | null
  onClose:          () => void
  onEdit:           () => void
  onAddToCombat:    () => void
  onTokenUploaded:  (adversaryName: string, url: string) => void
  /** When provided, patches existing map_tokens rows with the new image URL after upload. */
  mapId?:           string | null
  /** Overrides the footer button label. Defaults to '⚔ Add to Combat'. */
  addButtonLabel?:  string
}

/* ── Component ─────────────────────────────────────────────────── */
export function AdversaryDetailPanel({
  adversary, campaignId, supabase, tokenUrl,
  onClose, onEdit, onAddToCombat, onTokenUploaded,
  mapId, addButtonLabel,
}: AdversaryDetailPanelProps) {
  const [mounted,      setMounted]      = useState(false)
  const [visible,      setVisible]      = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [showLinks,    setShowLinks]    = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Slide-in on mount
  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  // Token upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'png'
      const path = `${adversary.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('tokens')
        .upload(path, file, { upsert: true })
      if (upErr) throw new Error(upErr.message ?? String(upErr))

      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      // Append cache-buster so browsers always show the freshly uploaded image
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`

      const { error: dbErr } = await supabase
        .from('adversary_token_images')
        .upsert({ adversary_key: adversary.name, token_image_url: urlWithBust })
      if (dbErr) throw new Error(dbErr.message ?? String(dbErr))

      // Patch any existing map tokens for this adversary so the canvas updates live
      if (mapId) {
        await supabase
          .from('map_tokens')
          .update({ token_image_url: urlWithBust })
          .eq('map_id', mapId)
          .eq('label', adversary.name)
      }

      onTokenUploaded(adversary.name, urlWithBust)
      toast.success(`Token image updated for ${adversary.name}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Token upload failed:', msg)
      toast.error(`Token upload failed: ${msg}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const adv = adversary
  const defense = Array.isArray(adv.defense) ? adv.defense : [0, 0]

  // Collect skills with ranks
  const skillEntries = Object.entries(adv.skillRanks ?? {}).filter(([, r]) => r > 0)

  if (!mounted) return null
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-hud-overlay)' as unknown as number,
          background: 'rgba(0,0,0,0.5)',   // pre-approved: rgba(0,0,0,*) overlay
          transition: EASE.panel,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 'var(--z-hud-combat)' as unknown as number,
        width: 'clamp(340px, 42vw, 560px)',
        background: HUD.panel,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderLeft: `1px solid ${HUD.borderHi}`,
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: EASE.panel,
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '1rem 1.25rem',
          borderBottom: `1px solid ${HUD.border}`,
          display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
        }}>
          {/* Token circle */}
          <div style={{
            width: 64, height: 64, borderRadius: RADIUS.full, flexShrink: 0,
            background: 'var(--hud-surface-lo)',
            border: `2px solid ${TYPE_COLORS[adv.type] ?? HUD.textDim}`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tokenUrl ? (
              <img src={tokenUrl} alt={adv.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS_H4, color: TYPE_COLORS[adv.type] ?? HUD.textDim, fontWeight: 700 }}>
                {adv.name.charAt(0)}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: FS_H4, fontWeight: 700, color: HUD.text,
                letterSpacing: '0.06em',
              }}>
                {adv._isCustom && <span style={{ color: HUD.gold }}>★ </span>}
                {adv.name}
              </div>
              <TypeBadge type={adv.type} />
            </div>
            {typeof (adv as Record<string, unknown>).faction === 'string' && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginTop: '0.1875rem' }}>
                {String((adv as Record<string, unknown>).faction)}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'transparent', border: 'none',
              color: HUD.textDim, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: FS_H4, lineHeight: 1,
              padding: '0 0.25rem', flexShrink: 0,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Characteristics */}
          <div>
            <SectionHead>Characteristics</SectionHead>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="BR"  value={adv.brawn}     />
              <StatBox label="AG"  value={adv.agility}   />
              <StatBox label="INT" value={adv.intellect}  />
              <StatBox label="CUN" value={adv.cunning}    />
              <StatBox label="WIL" value={adv.willpower}  />
              <StatBox label="PR"  value={adv.presence}   />
            </div>
          </div>

          {/* Derived */}
          <div>
            <SectionHead>Derived Stats</SectionHead>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="Soak"  value={adv.soak}  />
              <StatBox label="WT"    value={adv.wound} />
              {adv.strain != null && <StatBox label="ST" value={adv.strain} />}
              {defense[0] > 0 && <StatBox label="Def M" value={defense[0]} />}
              {defense[1] > 0 && <StatBox label="Def R" value={defense[1]} />}
            </div>
          </div>

          {/* Skills */}
          <div>
            <SectionHead>Skills</SectionHead>
            {skillEntries.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
                {skillEntries.map(([skill, rank]) => {
                  const charOverrideKey = skill === 'Lightsaber'
                    ? adv.characteristicOverrides?.['Lightsaber']
                    : undefined
                  const charOverrideName = charOverrideKey
                    ? { 'BR': 'Brawn', 'AGI': 'Agility', 'INT': 'Intellect', 'CUN': 'Cunning', 'WIL': 'Willpower', 'PR': 'Presence' }[charOverrideKey]
                    : undefined
                  const displayName = skill === 'Lightsaber'
                    ? `Lightsaber (${charOverrideName ?? 'Brawn'})`
                    : skill
                  return (
                  <span key={skill} style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: HUD.text }}>
                    {displayName} <span style={{ color: HUD.gold, fontWeight: 700 }}>{rank}</span>
                  </span>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>None listed</div>
            )}
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, fontStyle: 'italic', marginTop: '0.375rem' }}>
              Any unlisted skill defaults to rank 0 (characteristic only).
            </div>
          </div>

          {/* Weapons */}
          {adv.weapons && adv.weapons.length > 0 && (
            <div>
              <SectionHead>Weapons</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {adv.weapons.map((w, i) => {
                  const { dmg, range, crit } = resolveWeapon(w, adv.brawn, {})
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap',
                      padding: '0.375rem 0.625rem',
                      background: 'var(--hud-surface-lo)', borderRadius: RADIUS.md,
                      border: `1px solid ${HUD.border}`,
                    }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.text, minWidth: 120 }}>
                        {w.name}
                      </span>
                      {w.skillCategory && (
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>{w.skillCategory}</span>
                      )}
                      <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: 'var(--state-failure)' }}>Dmg {dmg}</span>
                      {crit !== undefined && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: 'var(--state-failure)' }}>Crit {crit}</span>
                      )}
                      {range && (
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>{range}</span>
                      )}
                      {w.qualities && w.qualities.length > 0 && (
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>
                          <RichText text={w.qualities.join(', ')} />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Talents & Abilities */}
          {((adv.talents && adv.talents.length > 0) || (adv.abilities && adv.abilities.length > 0)) && (
            <div>
              <SectionHead>Talents &amp; Abilities</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {adv.talents?.map((t, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.gold }}>{t.name}</span>
                    {t.description && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}> — <RichText text={t.description} /></span>
                    )}
                  </div>
                ))}
                {adv.abilities?.map((a, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: 'var(--state-success)' }}>{a.name}</span>
                    {a.description && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}> — <RichText text={a.description} /></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Token Image */}
          <div>
            <SectionHead>Token Image</SectionHead>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              {/* Preview */}
              <div style={{
                width: 64, height: 64, borderRadius: RADIUS.full, flexShrink: 0,
                background: 'var(--hud-surface-lo)', border: `2px solid ${HUD.borderHi}`,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {tokenUrl ? (
                  <img src={tokenUrl} alt="token" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>None</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: 'var(--hud-gold-subtle)',
                    border: `1px solid var(--hud-gold-40)`,
                    color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION,
                    fontWeight: 700, letterSpacing: '0.08em',
                    padding: '0.375rem 0.875rem', borderRadius: RADIUS.sm, cursor: 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading…' : '↑ Upload Image'}
                </button>

                {/* Find Token Images popover trigger */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowLinks(v => !v)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${HUD.border}`,
                      color: HUD.textDim, fontFamily: FONT_BODY, fontSize: FS_CAPTION,
                      padding: '0.3125rem 0.75rem', borderRadius: RADIUS.sm, cursor: 'pointer',
                    }}
                  >
                    🔗 Find Token Images
                  </button>
                  {showLinks && <TokenImageLinks onClose={() => setShowLinks(false)} />}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {adv.description && (
            <div>
              <button
                onClick={() => setDescExpanded(v => !v)}
                style={{
                  background: 'transparent', border: 'none',
                  padding: 0, cursor: 'pointer',
                  fontFamily: FONT_BODY, fontSize: FS_OVERLINE, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                  color: 'var(--hud-gold-40)', display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
              >
                Description {descExpanded ? '▾' : '▸'}
              </button>
              {descExpanded && (
                <div style={{
                  marginTop: '0.5rem', fontFamily: FONT_BODY, fontSize: FS_SM, color: HUD.textDim,
                  lineHeight: 1.6, borderLeft: `2px solid ${HUD.border}`, paddingLeft: '0.75rem',
                }}>
                  <RichText text={adv.description} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          flexShrink: 0, padding: '0.875rem 1.25rem',
          borderTop: `1px solid ${HUD.border}`,
          display: 'flex', gap: '0.625rem',
        }}>
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              background: 'var(--hud-gold-subtle)',
              border: `1px solid var(--hud-gold-40)`,
              color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '0.5625rem 0',
              borderRadius: RADIUS.sm, cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={onAddToCombat}
            style={{
              flex: 1,
              background: 'color-mix(in srgb, var(--state-failure) 10%, transparent)',
              border: `1px solid color-mix(in srgb, var(--state-failure) 45%, transparent)`,
              color: 'var(--state-failure)', fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '0.5625rem 0',
              borderRadius: RADIUS.sm, cursor: 'pointer',
            }}
          >
            {addButtonLabel ?? '⚔ Add to Combat'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
