'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Adversary } from '@/lib/adversaries'
import { TokenImageLinks } from './TokenImageLinks'
import { RichText } from '@/components/ui/RichText'

/* ── Design tokens ─────────────────────────────────────── */
const FC       = "var(--font-cinzel), 'Cinzel', serif"
const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FM       = "'Share Tech Mono','Courier New',monospace"
const BG       = '#060D09'
const PANEL_BG = 'rgba(6,13,9,0.97)'
const RAISED   = 'rgba(14,26,18,0.9)'
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const TEXT     = '#C8D8C0'
const DIM      = '#6A8070'
const BORDER   = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const GREEN    = '#4EC87A'
const RED      = '#E05050'
const BLUE     = '#5AAAE0'
const ORANGE   = '#E07855'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'
const FS_H3       = 'var(--text-h3)'

const TYPE_COLORS: Record<string, string> = {
  minion:  DIM,
  rival:   BLUE,
  nemesis: GOLD,
}

/* ── Helpers ───────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? DIM
  return (
    <span style={{
      fontFamily: FM, fontSize: FS_CAPTION, fontWeight: 700,
      color, border: `1px solid ${color}`, borderRadius: 3,
      padding: '1px 7px', letterSpacing: '0.1em',
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
      background: RAISED, border: `1px solid ${BORDER}`, borderRadius: 4,
      padding: '8px 10px', minWidth: 48,
    }}>
      <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.12em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT }}>
        {value}
      </div>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase' as const,
      color: GOLD_DIM, borderBottom: `1px solid ${BORDER}`,
      paddingBottom: 4, marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────── */
export interface AdversaryDetailPanelProps {
  adversary:        Adversary & { _isCustom?: boolean }
  campaignId:       string
  supabase:         SupabaseClient
  tokenUrl:         string | null
  onClose:          () => void
  onEdit:           () => void
  onAddToCombat:    () => void
  onTokenUploaded:  (adversaryName: string, url: string) => void
}

/* ── Component ─────────────────────────────────────────── */
export function AdversaryDetailPanel({
  adversary, campaignId, supabase, tokenUrl,
  onClose, onEdit, onAddToCombat, onTokenUploaded,
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
      if (upErr) throw upErr

      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      await supabase
        .from('adversary_token_images')
        .upsert({ adversary_key: adversary.name, token_image_url: data.publicUrl })

      onTokenUploaded(adversary.name, data.publicUrl)
    } catch (err) {
      console.error('Token upload failed', err)
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
          position: 'fixed', inset: 0, zIndex: 700,
          background: 'rgba(0,0,0,0.5)',
          transition: 'opacity 0.26s',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 710,
        width: 'clamp(340px, 42vw, 560px)',
        background: PANEL_BG,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderLeft: `1px solid ${BORDER_HI}`,
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '16px 20px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          {/* Token circle */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: RAISED,
            border: `2px solid ${TYPE_COLORS[adv.type] ?? DIM}`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tokenUrl ? (
              <img src={tokenUrl} alt={adv.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: FC, fontSize: FS_H4, color: TYPE_COLORS[adv.type] ?? DIM, fontWeight: 700 }}>
                {adv.name.charAt(0)}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{
                fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT,
                letterSpacing: '0.06em',
              }}>
                {adv._isCustom && <span style={{ color: GOLD }}>★ </span>}
                {adv.name}
              </div>
              <TypeBadge type={adv.type} />
            </div>
            {typeof (adv as Record<string, unknown>).faction === 'string' && (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 3 }}>
                {String((adv as Record<string, unknown>).faction)}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'transparent', border: 'none',
              color: DIM, cursor: 'pointer',
              fontFamily: FR, fontSize: FS_H4, lineHeight: 1,
              padding: '0 4px', flexShrink: 0,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Characteristics */}
          <div>
            <SectionHead>Characteristics</SectionHead>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                {skillEntries.map(([skill, rank]) => (
                  <span key={skill} style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT }}>
                    {skill} <span style={{ color: GOLD, fontWeight: 700 }}>{rank}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>None listed</div>
            )}
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, fontStyle: 'italic', marginTop: 6 }}>
              Any unlisted skill defaults to rank 0 (characteristic only).
            </div>
          </div>

          {/* Weapons */}
          {adv.weapons && adv.weapons.length > 0 && (
            <div>
              <SectionHead>Weapons</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {adv.weapons.map((w, i) => {
                  const dmg = typeof w.damage === 'number' ? w.damage : w.damage
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
                      padding: '6px 10px',
                      background: RAISED, borderRadius: 4,
                      border: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT, minWidth: 120 }}>
                        {w.name}
                      </span>
                      {w.skillCategory && (
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{w.skillCategory}</span>
                      )}
                      <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: RED }}>Dmg {dmg}</span>
                      {w.range && (
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{w.range}</span>
                      )}
                      {w.qualities && w.qualities.length > 0 && (
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {adv.talents?.map((t, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: GOLD }}>{t.name}</span>
                    {t.description && (
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}> — <RichText text={t.description} /></span>
                    )}
                  </div>
                ))}
                {adv.abilities?.map((a, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: GREEN }}>{a.name}</span>
                    {a.description && (
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}> — <RichText text={a.description} /></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Token Image */}
          <div>
            <SectionHead>Token Image</SectionHead>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Preview */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: RAISED, border: `2px solid ${BORDER_HI}`,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {tokenUrl ? (
                  <img src={tokenUrl} alt="token" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>None</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    background: 'rgba(200,170,80,0.08)',
                    border: `1px solid ${GOLD_DIM}`,
                    color: GOLD, fontFamily: FR, fontSize: FS_CAPTION,
                    fontWeight: 700, letterSpacing: '0.08em',
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
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
                      border: `1px solid ${BORDER}`,
                      color: DIM, fontFamily: FR, fontSize: FS_CAPTION,
                      padding: '5px 12px', borderRadius: 3, cursor: 'pointer',
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
                  fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                  color: GOLD_DIM, display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Description {descExpanded ? '▾' : '▸'}
              </button>
              {descExpanded && (
                <div style={{
                  marginTop: 8, fontFamily: FR, fontSize: FS_SM, color: DIM,
                  lineHeight: 1.6, borderLeft: `2px solid ${BORDER}`, paddingLeft: 12,
                }}>
                  <RichText text={adv.description} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          flexShrink: 0, padding: '14px 20px',
          borderTop: `1px solid ${BORDER}`,
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              background: 'rgba(200,170,80,0.08)',
              border: `1px solid ${GOLD_DIM}`,
              color: GOLD, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '9px 0',
              borderRadius: 3, cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={onAddToCombat}
            style={{
              flex: 1,
              background: 'rgba(224,80,80,0.10)',
              border: `1px solid rgba(224,80,80,0.45)`,
              color: RED, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '9px 0',
              borderRadius: 3, cursor: 'pointer',
            }}
          >
            ⚔ Add to Combat
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
