'use client'

import { useState } from 'react'
import { HUD, FONT_DISPLAY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'
import { DestinyPoolDisplay, type DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { Character } from '@/lib/types'
import { ThemeSwitcher, type UiTheme } from './ThemeSwitcher'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface HudTopBarProps {
  character: Character
  careerName: string
  specNames: string
  speciesName: string
  isCombat: boolean
  combatRound: number
  destinyPoolRecord: DestinyPoolRecord | null
  onSpendDestinyOpen: () => void
  onSpendCreditsOpen: () => void
  /** Unresolved pending_actions for this character (migration 117). */
  alertCount: number
  alertBlockingCount: number
  alertsOpen: boolean
  onToggleAlerts: () => void
  onLogout: () => void
  uiTheme: UiTheme
  onThemeChange: (theme: UiTheme) => void
}

export function HudTopBar({
  character,
  careerName,
  specNames,
  speciesName,
  isCombat,
  combatRound,
  destinyPoolRecord,
  onSpendDestinyOpen,
  onSpendCreditsOpen,
  alertCount,
  alertBlockingCount,
  alertsOpen,
  onToggleAlerts,
  onLogout,
  uiTheme,
  onThemeChange,
}: HudTopBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [creditsHovered, setCreditsHovered] = useState(false)
  const [logoutHovered,  setLogoutHovered]  = useState(false)

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: isCombat ? 'var(--hud-surface-hi)' : 'var(--hud-surface-mid)',
      backdropFilter: 'blur(16px)',
      borderBottom: isCombat
  ? '2px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)'
  : '2px solid var(--hud-border-strong)',
      display: 'flex', alignItems: 'center', padding: `0 ${SP[3]}`, gap: SP[2],
      zIndex: Z.sticky,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: '0 0 12px color-mix(in srgb, var(--hud-accent) 40%, transparent)' }}>
        HOLOCRON
      </div>
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      {/* Portrait chip */}
      {character.portrait_url ? (
        <img
          src={character.portrait_url}
          alt=""
          style={{
            width: 30, height: 30, borderRadius: RADIUS.full,
            objectFit: 'cover', flexShrink: 0,
            border: '1.5px solid var(--hud-gold-40)',
          }}
        />
      ) : (
        <div style={{
          width: 30, height: 30, borderRadius: RADIUS.full,
          background: 'var(--hud-surface-hi)',
          border: '1.5px solid var(--hud-gold-40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: FONT_DISPLAY, fontSize: FS.caption, fontWeight: 700,
          color: HUD.gold, letterSpacing: '0.05em',
        }}>
          {character.name.split(/\s+/).map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()}
        </div>
      )}
      {/* Character identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.text, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {[careerName, specNames, speciesName].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      {/* Destiny Pool */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: HUD.textDim, whiteSpace: 'nowrap' }}>
          Destiny
        </span>
        <DestinyPoolDisplay
          poolRecord={destinyPoolRecord}
          isGm={false}
          onClickLight={onSpendDestinyOpen}
          compact
        />
      </div>
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      {/* Resources */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* XP pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)', border: '1px solid var(--hud-accent-border)',
          borderRadius: RADIUS.md, padding: '3px 10px',
        }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: HUD.gold }}>XP</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>{character.xp_available}</span>
        </div>
        {/* Credits pill — click to spend */}
        <button
          onClick={onSpendCreditsOpen}
          title="Click to spend credits"
          onMouseEnter={() => setCreditsHovered(true)}
          onMouseLeave={() => setCreditsHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: creditsHovered ? 'color-mix(in srgb, var(--hud-accent) 20%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border: '1px solid var(--hud-accent-border)',
            borderRadius: RADIUS.md, padding: '3px 10px',
            cursor: 'pointer', transition: `background ${EASE.default}`,
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: HUD.gold }}>Credits</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>{character.credits.toLocaleString()}</span>
        </button>
      </div>
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      {/* Alerts — pending player decisions (fills the slot Print Sheet vacated) */}
      <button
        onClick={alertCount > 0 ? onToggleAlerts : undefined}
        disabled={alertCount === 0}
        aria-label="Pending actions"
        aria-expanded={alertsOpen}
        className={`notif-btn${alertCount === 0 ? '' : alertBlockingCount > 0 ? ' is-blocking' : ' is-active'}${alertBlockingCount > 0 && !prefersReducedMotion ? ' is-pulsing' : ''}`}
        title={alertCount === 0 ? 'Nothing awaiting your decision' : `${alertCount} awaiting · ${alertBlockingCount} blocking`}
      >
        <svg className="notif-icon" viewBox="0 0 24 24" aria-hidden>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <span>Alerts</span>
        {alertCount > 0 && <span className="notif-badge">{alertCount}</span>}
      </button>
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      {/* Theme switcher */}
      <ThemeSwitcher current={uiTheme} onChange={onThemeChange} />
      <div style={{ width: 1, height: 28, background: HUD.border }} />
      <button
        onClick={onLogout}
        style={{
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: FS.caption,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: logoutHovered ? HUD.gold : HUD.textDim, background: 'transparent',
          border: logoutHovered ? `1px solid ${HUD.gold}` : `1px solid ${HUD.border}`,
          borderRadius: RADIUS.md, padding: '3px 10px', cursor: 'pointer',
          transition: EASE.default, whiteSpace: 'nowrap',
        }}
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
      >⏻ LOGOUT</button>
      {/* Combat mode badge */}
      {isCombat && (
        <div style={{
          marginLeft: 'auto',
          background: 'color-mix(in srgb, var(--hud-accent) 20%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)',
          borderRadius: RADIUS.md, padding: '3px 10px',
          fontFamily: FONT_DISPLAY, fontSize: FS.caption, fontWeight: 700, letterSpacing: '0.18em',
          color: HUD.gold, textShadow: '0 0 8px color-mix(in srgb, var(--hud-accent) 60%, transparent)',
          whiteSpace: 'nowrap',
        }}>
          COMBAT · ROUND {combatRound}
        </div>
      )}
    </div>
  )
}
