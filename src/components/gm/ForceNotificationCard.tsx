'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, EASE } from '@/lib/tokens'
import { RichText } from '@/components/ui/RichText'

export interface ActivatedUpgrade {
  name:    string
  fp_cost: number
  is_dark: boolean
}

export interface ForceNotification {
  id:                  string
  campaign_id:         string
  character_id:        string
  character_name:      string
  type:                'dark_side_use' | 'conflict_pending' | 'force_use'
  dark_pips_used:      number | null
  power_name:          string | null
  strain_cost:         number | null
  status:              'pending' | 'acknowledged'
  created_at:          string
  activated_upgrades:  ActivatedUpgrade[] | null
}

interface ForceNotificationCardProps {
  notification:   ForceNotification
  onAcknowledged: (id: string) => void
  /** True when the notifying character has is_dark_side_fallen = true */
  isFallen?:      boolean
}

export function ForceNotificationCard({ notification, onAcknowledged, isFallen = false }: ForceNotificationCardProps) {
  const [conflictDesc, setConflictDesc] = useState('')
  const [busy, setBusy] = useState(false)

  const timeLabel      = new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const upgrades       = notification.activated_upgrades ?? []
  const darkCount      = notification.dark_pips_used ?? 0
  const totalFPSpent   = upgrades.reduce((s, u) => s + u.fp_cost, 0)
  const lightCount     = totalFPSpent - darkCount
  // Dathomiri proxy: strain_cost === 0 while dark pips were used means no strain suffered
  const isDathomiriProxy = darkCount > 0 && (notification.strain_cost ?? 0) === 0

  async function handleAddConflict() {
    setBusy(true)
    const supabase = createClient()
    const defaultDesc = isFallen
      ? `Light side temptation — ${notification.power_name}`
      : `Dark side use — ${notification.power_name}`
    await supabase.from('character_conflicts').insert({
      character_id: notification.character_id,
      campaign_id:  notification.campaign_id,
      description:  conflictDesc || defaultDesc,
      is_resolved:  false,
    })
    await supabase.from('force_notifications').update({ status: 'acknowledged' }).eq('id', notification.id)
    onAcknowledged(notification.id)
    setBusy(false)
  }

  async function handleSkip() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('force_notifications').update({ status: 'acknowledged' }).eq('id', notification.id)
    onAcknowledged(notification.id)
    setBusy(false)
  }

  return (
    <div style={{
      padding: `${SP[3]} ${SP[3]}`,
      background: 'color-mix(in srgb, var(--hud-accent-purple) 5%, transparent)',
      border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 28%, transparent)`,
      borderRadius: RADIUS.lg,
      display: 'flex', flexDirection: 'column', gap: SP[2],
    }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: 'var(--hud-accent-purple)', flexShrink: 0,
          }}>✦</span>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
            color: HUD.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {notification.character_name}
          </span>
          {isFallen && (
            <span style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '6px', /* fallen micro-badge — px intentional */
              fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--hud-accent-purple) 70%, black)',
              border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 70%, black)`,
              borderRadius: RADIUS.sm,
              padding: `1px ${SP[1]}`, /* micro-badge inset — px intentional */
              flexShrink: 0,
            }}>Fallen</span>
          )}
        </div>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'color-mix(in srgb, var(--hud-accent-purple) 40%, transparent)',
          flexShrink: 0,
        }}>
          {timeLabel}
        </span>
      </div>

      {/* ── Power name ─────────────────────────────────────────────── */}
      {notification.power_name && (
        <div style={{
          padding: `${SP[1]} ${SP[2]}`,
          background: 'color-mix(in srgb, var(--hud-accent-purple) 5%, transparent)',
          borderLeft: isFallen
            ? `2px solid color-mix(in srgb, var(--hud-accent-purple) 80%, black)`
            : `2px solid var(--hud-accent-purple)`,
          borderRadius: `0 ${RADIUS.sm} ${RADIUS.sm} 0`,
        }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700,
            color: 'var(--hud-accent-purple)',
          }}>
            {notification.power_name}
          </span>
        </div>
      )}

      {/* ── Activated upgrades ──────────────────────────────────────── */}
      {upgrades.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
          {upgrades.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.caption,
                color: 'var(--hud-accent-purple)', opacity: 0.5, flexShrink: 0,
              }}>◇</span>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 600,
                color: HUD.text, flex: 1, lineHeight: 1.3,
              }}>
                {u.name}
              </span>
              {u.fp_cost > 0 && (
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                  background: u.is_dark
                    ? 'color-mix(in srgb, var(--hud-accent-purple) 55%, black)'
                    : 'color-mix(in srgb, var(--hud-accent-purple) 45%, white)',
                  color: 'color-mix(in srgb, black 60%, transparent)',
                  borderRadius: RADIUS.sm,
                  padding: `1px ${SP[1]}`, /* cost badge — px intentional */
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '2px', /* badge gap — px intentional */
                }}>
                  {u.fp_cost}<RichText text="[fp]" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Pip spend summary ───────────────────────────────────────── */}
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.overline,
        color: 'var(--hud-accent-purple)', opacity: 0.7,
        display: 'flex', alignItems: 'center', gap: SP[1], flexWrap: 'wrap',
      }}>
        {lightCount > 0 && (
          <>
            <span>{lightCount}</span>
            <RichText text="[fp]" />
            <span>Light</span>
          </>
        )}
        {lightCount > 0 && darkCount > 0 && (
          <span style={{ opacity: 0.5 }}>·</span>
        )}
        {darkCount > 0 && (
          <>
            <span>{darkCount}</span>
            <RichText text="[fp]" />
            <span>Dark</span>
          </>
        )}
      </div>

      {/* ── Dark side warning — suppressed for Dathomiri proxy ─────── */}
      {darkCount > 0 && !isDathomiriProxy && (
        <div style={{
          padding: `${SP[1]} ${SP[2]}`,
          background: 'color-mix(in srgb, var(--hud-accent-purple) 8%, transparent)',
          border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 30%, transparent)`,
          borderRadius: RADIUS.md,
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'color-mix(in srgb, var(--hud-accent-purple) 80%, white)',
        }}>
          {isFallen
            ? `⚠ Light pips used — ${notification.strain_cost ?? 0} strain suffered`
            : `⚠ ${notification.strain_cost ?? 0} strain suffered · Destiny Point flipped`
          }
        </div>
      )}

      {/* ── Conflict description ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'color-mix(in srgb, var(--hud-accent-purple) 35%, transparent)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          {isFallen ? 'Light Side Conflict (optional)' : 'Conflict description (optional)'}
        </div>
        <input
          type="text"
          placeholder={isFallen
            ? `Light side temptation — ${notification.power_name ?? ''}`
            : `Dark side use — ${notification.power_name ?? ''}`
          }
          value={conflictDesc}
          onChange={e => setConflictDesc(e.target.value)}
          style={{
            background: 'color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)',
            border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 20%, transparent)`,
            borderRadius: RADIUS.md,
            padding: `${SP[1]} ${SP[2]}`,
            fontFamily: FONT_BODY, fontSize: FS.sm,
            color: HUD.text, outline: 'none',
            width: '100%', boxSizing: 'border-box' as const,
          }}
        />
        {isFallen && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.caption,
            color: 'color-mix(in srgb, var(--hud-accent-purple) 50%, transparent)',
            fontStyle: 'italic', lineHeight: 1.4,
          }}>
            Fallen character — conflict represents light side pull.
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: SP[2] }}>
        <button
          onClick={handleAddConflict}
          disabled={busy}
          style={{
            flex: 2,
            height: 36, /* action button — px intentional, fixed tap target */
            borderRadius: RADIUS.lg,
            cursor: busy ? 'not-allowed' : 'pointer',
            background: busy ? 'transparent' : 'color-mix(in srgb, var(--hud-accent-purple) 15%, transparent)',
            border: `1px solid color-mix(in srgb, var(--hud-accent-purple) ${busy ? 15 : 40}%, transparent)`,
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.08em',
            color: busy
              ? 'color-mix(in srgb, var(--hud-accent-purple) 30%, transparent)'
              : 'var(--hud-accent-purple)',
            transition: `all ${EASE.quick}`,
          }}
        >
          + Add Conflict
        </button>
        <button
          onClick={handleSkip}
          disabled={busy}
          style={{
            flex: 1,
            height: 36, /* action button — px intentional, fixed tap target */
            borderRadius: RADIUS.lg,
            cursor: busy ? 'not-allowed' : 'pointer',
            background: 'transparent',
            border: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)`,
            fontFamily: FONT_BODY, fontSize: FS.sm,
            color: 'color-mix(in srgb, var(--hud-text) 40%, transparent)',
            transition: `all ${EASE.quick}`,
          }}
        >
          Skip
        </button>
      </div>

    </div>
  )
}
