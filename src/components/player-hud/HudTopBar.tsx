'use client'

import { useState } from 'react'
import { HUD, FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'
import { DestinyPoolDisplay, type DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { Character } from '@/lib/types'
import { ThemeSwitcher, type UiTheme } from './ThemeSwitcher'

interface HudTopBarProps {
  character: Character
  careerName: string
  specNames: string
  speciesName: string
  isCombat: boolean
  combatRound: number
  pdfGenerating: boolean
  destinyPoolRecord: DestinyPoolRecord | null
  onSpendDestinyOpen: () => void
  onSpendCreditsOpen: () => void
  onDownloadPDF: () => void
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
  pdfGenerating,
  destinyPoolRecord,
  onSpendDestinyOpen,
  onSpendCreditsOpen,
  onDownloadPDF,
  onLogout,
  uiTheme,
  onThemeChange,
}: HudTopBarProps) {
  const [creditsHovered, setCreditsHovered] = useState(false)
  const [printHovered,   setPrintHovered]   = useState(false)
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
      {/* Print Sheet */}
      <button
        onClick={onDownloadPDF}
        disabled={pdfGenerating}
        title="Download printable character sheet PDF"
        style={{
          fontFamily: FONT_BODY,
          fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: pdfGenerating ? HUD.textFaint : printHovered ? HUD.gold : 'color-mix(in srgb, var(--hud-accent) 60%, transparent)',
          background: 'transparent',
          border: printHovered && !pdfGenerating ? '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)' : '1px solid color-mix(in srgb, var(--hud-accent) 25%, transparent)',
          borderRadius: RADIUS.md,
          padding: '3px 9px',
          cursor: pdfGenerating ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          transition: `color ${EASE.default}, border-color ${EASE.default}`,
          flexShrink: 0,
        }}
        onMouseEnter={() => setPrintHovered(true)}
        onMouseLeave={() => setPrintHovered(false)}
      >
        {pdfGenerating ? 'Generating…' : '⬇ Print Sheet'}
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
