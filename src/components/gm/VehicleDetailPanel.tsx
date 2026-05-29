'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import type { Vehicle } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import { TokenImageLinks } from './TokenImageLinks'
import { RichText } from '@/components/ui/RichText'
import { HUD, FONT_DISPLAY, FONT_BODY, FONT_MONO, RADIUS, EASE } from '@/lib/tokens'

/* ── Design tokens ─────────────────────────────────────────────── */
const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

// Vehicle type identity colours — pre-approved vehicle identity exception
// isStarship uses var(--die-force) (blue) vs HUD.gold for ground vehicles
const STARSHIP_COLOR = 'var(--die-force)'

/* ── Helpers ───────────────────────────────────────────────────── */
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

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md,
      padding: '0.5rem 0.625rem', minWidth: 52,
    }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVERLINE, color: HUD.textDim, letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS_H4, fontWeight: 700, color: color ?? HUD.text }}>
        {value}
      </div>
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────────────── */
export interface VehicleDetailPanelProps {
  vehicle:         Vehicle & { _isCustom?: boolean }
  campaignId:      string
  supabase:        SupabaseClient
  tokenUrl:        string | null
  onClose:         () => void
  onEdit:          () => void
  onAddToCombat:   () => void
  onTokenUploaded: (vehicleKey: string, url: string) => void
  /** When provided, patches existing map_tokens rows with the new image URL after upload. */
  mapId?:          string | null
  /** Overrides the footer button label. Defaults to '⚔ Add to Combat'. */
  addButtonLabel?: string
}

/* ── Component ─────────────────────────────────────────────────── */
export function VehicleDetailPanel({
  vehicle, campaignId, supabase, tokenUrl,
  onClose, onEdit, onAddToCombat, onTokenUploaded,
  mapId, addButtonLabel,
}: VehicleDetailPanelProps) {
  const [mounted,      setMounted]      = useState(false)
  const [visible,      setVisible]      = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [showLinks,    setShowLinks]    = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'png'
      // Flat path (no subdirectory) — matches the adversary token pattern and
      // avoids storage policy issues with sub-path writes.
      const path = `vehicle-${vehicle.key.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('tokens')
        .upload(path, file, { upsert: true })
      if (upErr) throw new Error(upErr.message ?? String(upErr))

      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      // Append cache-buster so browsers always show the freshly uploaded image
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`

      const { error: dbErr } = await supabase
        .from('vehicle_token_images')
        .upsert({ vehicle_key: vehicle.key, token_image_url: urlWithBust })
      if (dbErr) throw new Error(dbErr.message ?? String(dbErr))

      // Patch any existing map tokens for this vehicle so the canvas updates live
      if (mapId) {
        await supabase
          .from('map_tokens')
          .update({ token_image_url: urlWithBust })
          .eq('map_id', mapId)
          .eq('label', vehicle.name)
      }

      onTokenUploaded(vehicle.key, urlWithBust)
      toast.success(`Token image updated for ${vehicle.name}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Token upload failed:', msg)
      toast.error(`Token upload failed: ${msg}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const v = vehicle
  const handlingStr = v.handling >= 0 ? `+${v.handling}` : `${v.handling}`
  const arcsLabel = [
    v.defFore       > 0 && `F:${v.defFore}`,
    v.defAft        > 0 && `A:${v.defAft}`,
    v.defPort       > 0 && `P:${v.defPort}`,
    v.defStarboard  > 0 && `S:${v.defStarboard}`,
  ].filter(Boolean).join(' ')

  // Vehicle type accent — starship = force-die blue, ground = hud gold (identity colours)
  const typeAccent = v.isStarship ? STARSHIP_COLOR : HUD.gold

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
        width: 'clamp(340px, 44vw, 580px)',
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
          {/* Token */}
          <div style={{
            width: 64, height: 64, borderRadius: RADIUS.md, flexShrink: 0,
            background: 'var(--hud-surface-lo)', border: `2px solid ${typeAccent}`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tokenUrl ? (
              <img src={tokenUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS_H4, color: typeAccent, fontWeight: 700 }}>
                {v.isStarship ? '🚀' : '🚗'}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS_H4, fontWeight: 700, color: HUD.text, letterSpacing: '0.06em' }}>
                {v._isCustom && <span style={{ color: HUD.gold }}>★ </span>}
                {v.name}
              </div>
              <span style={{
                fontFamily: FONT_MONO, fontSize: FS_CAPTION, fontWeight: 700,
                color: typeAccent,
                border: `1px solid ${typeAccent}`,
                borderRadius: RADIUS.sm, padding: '0.0625rem 0.4375rem', letterSpacing: '0.1em',
                background: `${typeAccent}18`,
              }}>
                {v.isStarship ? 'STARSHIP' : 'GROUND'}
              </span>
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginTop: '0.1875rem' }}>
              {v.type}{v.source ? ` · ${v.source}` : ''}
            </div>
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
          >×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Performance */}
          <div>
            <SectionHead>Performance</SectionHead>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="Sil"   value={v.silhouette} />
              <StatBox label="Speed" value={v.speed}      />
              <StatBox label="Hdl"   value={handlingStr} color={v.handling < 0 ? 'var(--state-failure)' : v.handling > 0 ? 'var(--state-success)' : HUD.text} />
            </div>
          </div>

          {/* Combat Stats */}
          <div>
            <SectionHead>Combat Stats</SectionHead>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="Armor" value={v.armor}       />
              <StatBox label="Hull"  value={v.hullTrauma}  />
              <StatBox label="Sys"   value={v.systemStrain} />
              {v.defFore      > 0 && <StatBox label="Def F" value={v.defFore}      />}
              {v.defAft       > 0 && <StatBox label="Def A" value={v.defAft}       />}
              {v.defPort      > 0 && <StatBox label="Def P" value={v.defPort}      />}
              {v.defStarboard > 0 && <StatBox label="Def S" value={v.defStarboard} />}
            </div>
            {!arcsLabel && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginTop: '0.25rem' }}>No defense</div>
            )}
          </div>

          {/* Crew & Cargo */}
          {(v.crew || v.passengers != null || v.encumbranceCapacity != null) && (
            <div>
              <SectionHead>Crew &amp; Cargo</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: FONT_BODY, fontSize: FS_SM }}>
                {v.crew && (
                  <div><span style={{ color: HUD.textDim }}>Crew: </span><span style={{ color: HUD.text }}>{v.crew}</span></div>
                )}
                {v.passengers != null && (
                  <div><span style={{ color: HUD.textDim }}>Passengers: </span><span style={{ color: HUD.text }}>{v.passengers}</span></div>
                )}
                {v.encumbranceCapacity != null && (
                  <div><span style={{ color: HUD.textDim }}>Cargo: </span><span style={{ color: HUD.text }}>{v.encumbranceCapacity} enc.</span></div>
                )}
                {v.consumables && (
                  <div><span style={{ color: HUD.textDim }}>Consumables: </span><span style={{ color: HUD.text }}>{v.consumables}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Starship extras */}
          {v.isStarship && (v.hyperdrivePrimary != null || v.naviComputer != null) && (
            <div>
              <SectionHead>Hyperdrive</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: FONT_BODY, fontSize: FS_SM }}>
                {v.hyperdrivePrimary != null && v.hyperdrivePrimary > 0 && (
                  <div><span style={{ color: HUD.textDim }}>Primary: </span><span style={{ color: HUD.text }}>Class {v.hyperdrivePrimary}</span></div>
                )}
                {v.hyperdriveBackup != null && v.hyperdriveBackup > 0 && (
                  <div><span style={{ color: HUD.textDim }}>Backup: </span><span style={{ color: HUD.text }}>Class {v.hyperdriveBackup}</span></div>
                )}
                {v.naviComputer != null && (
                  <div><span style={{ color: HUD.textDim }}>Navicomputer: </span><span style={{ color: HUD.text }}>{v.naviComputer ? 'Yes' : 'No'}</span></div>
                )}
                {v.sensorRange && (
                  <div><span style={{ color: HUD.textDim }}>Sensors: </span><span style={{ color: HUD.text }}>{v.sensorRange.replace('sr', '')}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Weapons */}
          {v.weapons && v.weapons.length > 0 && (
            <div>
              <SectionHead>Weapons</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {v.weapons.map((w, i) => {
                  const stats = vehicleWeaponStats(w.weaponKey)
                  const displayName = vehicleWeaponDisplayName(w.weaponKey)
                  const arcParts = [
                    w.firingArcs.fore      && 'Fore',
                    w.firingArcs.aft       && 'Aft',
                    w.firingArcs.port      && 'Port',
                    w.firingArcs.starboard && 'Stbd',
                    w.firingArcs.dorsal    && 'Dorsal',
                    w.firingArcs.ventral   && 'Ventral',
                  ].filter(Boolean).join('/')
                  return (
                    <div key={i} style={{
                      padding: '0.375rem 0.625rem', background: 'var(--hud-surface-lo)',
                      borderRadius: RADIUS.md, border: `1px solid ${HUD.border}`,
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: HUD.text, minWidth: 160 }}>
                          {w.count > 1 ? `${w.count}× ` : ''}{displayName}{w.turret ? ' (Turret)' : ''}
                        </span>
                        {stats && stats.damage > 0 && (
                          <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: 'var(--state-failure)' }}>Dmg {stats.damage}</span>
                        )}
                        {stats?.crit !== undefined && (
                          <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: 'var(--state-failure)' }}>Crit {stats.crit}</span>
                        )}
                        {stats && (
                          <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>{stats.range}</span>
                        )}
                        {arcParts && (
                          <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}>[{arcParts}]</span>
                        )}
                      </div>
                      {w.qualities.length > 0 && (
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim, marginTop: '0.1875rem' }}>
                          {w.qualities.map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`).join(', ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Abilities */}
          {v.abilities && v.abilities.length > 0 && (
            <div>
              <SectionHead>Special Features</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {v.abilities.map((a, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700, color: 'var(--state-success)' }}>{a.name}</span>
                    {a.description && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAPTION, color: HUD.textDim }}> — {a.description}</span>
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
              <div style={{
                width: 64, height: 64, borderRadius: RADIUS.md, flexShrink: 0,
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
                    background: 'var(--hud-gold-subtle)', border: `1px solid var(--hud-gold-40)`,
                    color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_CAPTION,
                    fontWeight: 700, letterSpacing: '0.08em',
                    padding: '0.375rem 0.875rem', borderRadius: RADIUS.sm, cursor: 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading…' : '↑ Upload Image'}
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowLinks(x => !x)}
                    style={{
                      background: 'transparent', border: `1px solid ${HUD.border}`,
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
          {v.description && (
            <div>
              <button
                onClick={() => setDescExpanded(x => !x)}
                style={{
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
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
                  <RichText text={v.description} />
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
              flex: 1, background: 'var(--hud-gold-subtle)', border: `1px solid var(--hud-gold-40)`,
              color: HUD.gold, fontFamily: FONT_BODY, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '0.5625rem 0', borderRadius: RADIUS.sm, cursor: 'pointer',
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
              letterSpacing: '0.1em', padding: '0.5625rem 0', borderRadius: RADIUS.sm, cursor: 'pointer',
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
