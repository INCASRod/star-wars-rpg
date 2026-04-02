'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const PURPLE     = '#9060D0'
const PURPLE_BD  = 'rgba(144,96,208,0.28)'
const PURPLE_BG  = 'rgba(144,96,208,0.06)'

// Silver-white palette for fallen characters (light side temptation)
const SILVER     = 'rgba(220,230,240,0.85)'
const SILVER_BD  = 'rgba(200,215,230,0.4)'
const SILVER_BG  = 'rgba(200,215,230,0.05)'

export interface ForceNotification {
  id:             string
  campaign_id:    string
  character_id:   string
  character_name: string
  type:           'dark_side_use' | 'conflict_pending'
  dark_pips_used: number | null
  power_name:     string | null
  strain_cost:    number | null
  status:         'pending' | 'acknowledged'
  created_at:     string
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

  const timeLabel = new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

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

  const cardBg     = isFallen ? SILVER_BG  : PURPLE_BG
  const cardBorder = isFallen ? SILVER_BD  : PURPLE_BD

  return (
    <div style={{
      padding: '14px 16px',
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: FONT_C, fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)',
          fontWeight: 700,
          color: isFallen ? 'rgba(200,215,230,0.85)' : PURPLE,
        }}>
          {isFallen ? '✦ Light Side Temptation' : '⚠ Dark Side Used'}
        </span>
        <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: isFallen ? 'rgba(200,215,230,0.35)' : 'rgba(200,150,255,0.4)' }}>
          {timeLabel}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: 'rgba(232,223,200,0.9)', lineHeight: 1.45 }}>
          <strong>{notification.character_name}</strong>{' '}
          {isFallen ? (
            <>
              used{' '}
              <strong style={{ color: 'rgba(200,215,230,0.85)' }}>
                {notification.dark_pips_used} light pip{(notification.dark_pips_used ?? 0) !== 1 ? 's' : ''}
              </strong>{' '}
              to activate <strong>{notification.power_name}</strong>.
            </>
          ) : (
            <>
              used{' '}
              <strong style={{ color: PURPLE }}>
                {notification.dark_pips_used} dark pip{(notification.dark_pips_used ?? 0) !== 1 ? 's' : ''}
              </strong>{' '}
              to activate <strong>{notification.power_name}</strong>.
            </>
          )}
        </div>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: isFallen ? 'rgba(200,215,230,0.5)' : 'rgba(200,150,255,0.6)' }}>
          {isFallen
            ? `Strain: ${notification.strain_cost} · Destiny: 1 dark → light`
            : `Strain: ${notification.strain_cost} · Destiny: 1 light → dark`
          }
        </div>
      </div>

      {/* Conflict description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(232,223,200,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {isFallen ? 'Light Side Conflict description (optional)' : 'Conflict description (optional)'}
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
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${isFallen ? 'rgba(200,215,230,0.2)' : 'rgba(200,150,255,0.2)'}`,
            borderRadius: 4, padding: '7px 10px',
            fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
            color: 'rgba(232,223,200,0.8)', outline: 'none',
            width: '100%', boxSizing: 'border-box',
          }}
        />
        {isFallen && (
          <div style={{
            fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
            color: 'rgba(220,230,240,0.5)', fontStyle: 'italic', lineHeight: 1.45,
          }}>
            This character has fallen to the Dark Side. Conflict represents light side pull — moments of mercy, compassion, or doubt.
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleAddConflict}
          disabled={busy}
          style={{
            flex: 2, height: 36, borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer',
            background: busy ? 'transparent' : isFallen ? 'rgba(200,215,230,0.08)' : 'rgba(144,96,208,0.15)',
            border: `1px solid ${isFallen ? SILVER_BD : 'rgba(144,96,208,0.4)'}`,
            fontFamily: FONT_R, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)', fontWeight: 700,
            letterSpacing: '0.08em',
            color: busy
              ? isFallen ? 'rgba(200,215,230,0.3)' : 'rgba(200,150,255,0.4)'
              : isFallen ? SILVER : PURPLE,
            transition: 'all .15s',
          }}
        >
          + Add Conflict
        </button>
        <button
          onClick={handleSkip}
          disabled={busy}
          style={{
            flex: 1, height: 36, borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: FONT_R, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
            color: 'rgba(232,223,200,0.4)', transition: 'all .15s',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  )
}
