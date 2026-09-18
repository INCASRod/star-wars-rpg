'use client'

import type { Character } from '@/lib/types'
import type { MouseEvent } from 'react'
import { HUD, FONT_BODY as FONT, FS, EASE, RADIUS, SP } from '@/lib/tokens'

interface Props {
  character: Character
  onMap:     boolean
  critCount: number
  onClick:   (e: MouseEvent<HTMLDivElement>) => void
}

export function GmPartyMiniCard({ character: c, onMap, critCount, onClick }: Props) {
  const wPct   = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
  const sPct   = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
  const isDown = c.wound_current >= c.wound_threshold

  return (
    <div
      className="hov-lift"
      onClick={onClick}
      style={{
        display:      'flex',
        alignItems:   'stretch',
        height:       '4.625rem',
        background:   'var(--hud-surface-mid)',
        border:       '1px solid var(--hud-border-hi)',
        borderLeft:   '3px solid var(--hud-accent-purple)',
        borderRadius: RADIUS.md,
        overflow:     'hidden',
        cursor:       'pointer',
        transition:   `border-color ${EASE.quick}`,
        position:     'relative',
      }}
    >
      {/* Portrait */}
      <div style={{ width: '4.625rem', flexShrink: 0, background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
        {c.portrait_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Identity + bars */}
      <div style={{ flex: 1, minWidth: 0, padding: `${SP[2]} ${SP[2]}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: SP[1] }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: FS.sm, color: HUD.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.name}
        </div>
        <div style={{ fontFamily: FONT, fontSize: FS.overline, color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.species_key} · {c.career_key}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem', marginTop: '0.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <span style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, color: 'var(--hud-vital-wounds)', width: '0.5rem' }}>W</span>
            <span style={{ flex: 1, height: '3.5px', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${wPct}%`, background: isDown ? 'var(--hud-vital-wounds)' : HUD.gold, borderRadius: RADIUS.sm }} />
            </span>
            <span style={{ fontFamily: FONT, fontSize: FS.caption, color: HUD.text, minWidth: '2.25rem', textAlign: 'right' }}>
              {c.wound_current}<span style={{ color: HUD.textFaint }}>/{c.wound_threshold}</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <span style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, color: 'var(--die-force)', width: '0.5rem' }}>S</span>
            <span style={{ flex: 1, height: '3.5px', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${sPct}%`, background: sPct >= 100 ? 'var(--hud-vital-wounds)' : 'var(--die-force)', borderRadius: RADIUS.sm }} />
            </span>
            <span style={{ fontFamily: FONT, fontSize: FS.caption, color: HUD.text, minWidth: '2.25rem', textAlign: 'right' }}>
              {c.strain_current}<span style={{ color: HUD.textFaint }}>/{c.strain_threshold}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Crit badge */}
      {critCount > 0 && (
        <span style={{
          position: 'absolute', top: SP[1], right: '1.75rem',
          fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.06em',
          color: HUD.text, background: 'var(--state-failure)', borderRadius: RADIUS.sm,
          padding: '0.09375rem 0.3125rem',
        }}>
          CRIT{critCount > 1 ? ` ×${critCount}` : ''}
        </span>
      )}

      {/* Status rail */}
      <div style={{
        width: '1.625rem', flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: SP[1],
        borderLeft: '1px solid var(--hud-border)', background: 'var(--hud-surface-lo)',
      }}>
        <span
          className={onMap ? 'gm-party-tokdot on' : 'gm-party-tokdot'}
          title={onMap ? 'Token on map' : 'No token on map'}
        />
        {c.is_force_sensitive && (
          <span className="gm-party-forcedot" title="Force-sensitive" />
        )}
      </div>
    </div>
  )
}
