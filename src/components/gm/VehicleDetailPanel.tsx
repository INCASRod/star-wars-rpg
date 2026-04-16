'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import type { Vehicle } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import { TokenImageLinks } from './TokenImageLinks'
import { RichText } from '@/components/ui/RichText'

/* ── Design tokens ─────────────────────────────────────── */
const FC       = "var(--font-cinzel), 'Cinzel', serif"
const FR       = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FM       = "'Share Tech Mono','Courier New',monospace"
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

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'

/* ── Helpers ───────────────────────────────────────────── */
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

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: RAISED, border: `1px solid ${BORDER}`, borderRadius: 4,
      padding: '8px 10px', minWidth: 52,
    }}>
      <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.12em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: color ?? TEXT }}>
        {value}
      </div>
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────── */
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

/* ── Component ─────────────────────────────────────────── */
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

  if (!mounted) return null
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9050,
          background: 'rgba(0,0,0,0.5)',
          transition: 'opacity 0.26s',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9060,
        width: 'clamp(340px, 44vw, 580px)',
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
          {/* Token */}
          <div style={{
            width: 64, height: 64, borderRadius: 6, flexShrink: 0,
            background: RAISED, border: `2px solid ${v.isStarship ? BLUE : GOLD}`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tokenUrl ? (
              <img src={tokenUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: FC, fontSize: FS_H4, color: v.isStarship ? BLUE : GOLD, fontWeight: 700 }}>
                {v.isStarship ? '🚀' : '🚗'}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT, letterSpacing: '0.06em' }}>
                {v._isCustom && <span style={{ color: GOLD }}>★ </span>}
                {v.name}
              </div>
              <span style={{
                fontFamily: FM, fontSize: FS_CAPTION, fontWeight: 700,
                color: v.isStarship ? BLUE : GOLD,
                border: `1px solid ${v.isStarship ? BLUE : GOLD}`,
                borderRadius: 3, padding: '1px 7px', letterSpacing: '0.1em',
                background: `${v.isStarship ? BLUE : GOLD}18`,
              }}>
                {v.isStarship ? 'STARSHIP' : 'GROUND'}
              </span>
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 3 }}>
              {v.type}{v.source ? ` · ${v.source}` : ''}
            </div>
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
          >×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Performance */}
          <div>
            <SectionHead>Performance</SectionHead>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatBox label="Sil"   value={v.silhouette} />
              <StatBox label="Speed" value={v.speed}      />
              <StatBox label="Hdl"   value={handlingStr} color={v.handling < 0 ? RED : v.handling > 0 ? GREEN : TEXT} />
            </div>
          </div>

          {/* Combat Stats */}
          <div>
            <SectionHead>Combat Stats</SectionHead>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatBox label="Armor" value={v.armor}       />
              <StatBox label="Hull"  value={v.hullTrauma}  />
              <StatBox label="Sys"   value={v.systemStrain} />
              {v.defFore      > 0 && <StatBox label="Def F" value={v.defFore}      />}
              {v.defAft       > 0 && <StatBox label="Def A" value={v.defAft}       />}
              {v.defPort      > 0 && <StatBox label="Def P" value={v.defPort}      />}
              {v.defStarboard > 0 && <StatBox label="Def S" value={v.defStarboard} />}
            </div>
            {!arcsLabel && (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 4 }}>No defense</div>
            )}
          </div>

          {/* Crew & Cargo */}
          {(v.crew || v.passengers != null || v.encumbranceCapacity != null) && (
            <div>
              <SectionHead>Crew &amp; Cargo</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FR, fontSize: FS_SM }}>
                {v.crew && (
                  <div><span style={{ color: DIM }}>Crew: </span><span style={{ color: TEXT }}>{v.crew}</span></div>
                )}
                {v.passengers != null && (
                  <div><span style={{ color: DIM }}>Passengers: </span><span style={{ color: TEXT }}>{v.passengers}</span></div>
                )}
                {v.encumbranceCapacity != null && (
                  <div><span style={{ color: DIM }}>Cargo: </span><span style={{ color: TEXT }}>{v.encumbranceCapacity} enc.</span></div>
                )}
                {v.consumables && (
                  <div><span style={{ color: DIM }}>Consumables: </span><span style={{ color: TEXT }}>{v.consumables}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Starship extras */}
          {v.isStarship && (v.hyperdrivePrimary != null || v.naviComputer != null) && (
            <div>
              <SectionHead>Hyperdrive</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FR, fontSize: FS_SM }}>
                {v.hyperdrivePrimary != null && v.hyperdrivePrimary > 0 && (
                  <div><span style={{ color: DIM }}>Primary: </span><span style={{ color: TEXT }}>Class {v.hyperdrivePrimary}</span></div>
                )}
                {v.hyperdriveBackup != null && v.hyperdriveBackup > 0 && (
                  <div><span style={{ color: DIM }}>Backup: </span><span style={{ color: TEXT }}>Class {v.hyperdriveBackup}</span></div>
                )}
                {v.naviComputer != null && (
                  <div><span style={{ color: DIM }}>Navicomputer: </span><span style={{ color: TEXT }}>{v.naviComputer ? 'Yes' : 'No'}</span></div>
                )}
                {v.sensorRange && (
                  <div><span style={{ color: DIM }}>Sensors: </span><span style={{ color: TEXT }}>{v.sensorRange.replace('sr', '')}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Weapons */}
          {v.weapons && v.weapons.length > 0 && (
            <div>
              <SectionHead>Weapons</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                      padding: '6px 10px', background: RAISED,
                      borderRadius: 4, border: `1px solid ${BORDER}`,
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT, minWidth: 160 }}>
                          {w.count > 1 ? `${w.count}× ` : ''}{displayName}{w.turret ? ' (Turret)' : ''}
                        </span>
                        {stats && stats.damage > 0 && (
                          <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: RED }}>Dmg {stats.damage}</span>
                        )}
                        {stats?.crit !== undefined && (
                          <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: RED }}>Crit {stats.crit}</span>
                        )}
                        {stats && (
                          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{stats.range}</span>
                        )}
                        {arcParts && (
                          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>[{arcParts}]</span>
                        )}
                      </div>
                      {w.qualities.length > 0 && (
                        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 3 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {v.abilities.map((a, i) => (
                  <div key={i}>
                    <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: GREEN }}>{a.name}</span>
                    {a.description && (
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}> — {a.description}</span>
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
              <div style={{
                width: 64, height: 64, borderRadius: 6, flexShrink: 0,
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
                    background: 'rgba(200,170,80,0.08)', border: `1px solid ${GOLD_DIM}`,
                    color: GOLD, fontFamily: FR, fontSize: FS_CAPTION,
                    fontWeight: 700, letterSpacing: '0.08em',
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading…' : '↑ Upload Image'}
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowLinks(v => !v)}
                    style={{
                      background: 'transparent', border: `1px solid ${BORDER}`,
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
          {v.description && (
            <div>
              <button
                onClick={() => setDescExpanded(x => !x)}
                style={{
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
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
                  <RichText text={v.description} />
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
              flex: 1, background: 'rgba(200,170,80,0.08)', border: `1px solid ${GOLD_DIM}`,
              color: GOLD, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '9px 0', borderRadius: 3, cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={onAddToCombat}
            style={{
              flex: 1, background: 'rgba(224,80,80,0.10)', border: `1px solid rgba(224,80,80,0.45)`,
              color: RED, fontFamily: FR, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.1em', padding: '9px 0', borderRadius: 3, cursor: 'pointer',
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
