'use client'

import { useState } from 'react'
import { C, FONT_RAJDHANI, FS_OVERLINE, FS_LABEL, FS_CAPTION, FS_H4, FS_SM } from './design-tokens'
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
  ? '2px solid var(--hud-accent-35)'
  : '2px solid var(--hud-border-strong)',
      display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', gap: 'var(--space-2)',
      zIndex: 10,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: '0 0 12px var(--hud-accent-40)' }}>
        HOLOCRON
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Portrait chip */}
      {character.portrait_url ? (
        <img
          src={character.portrait_url}
          alt=""
          style={{
            width: 30, height: 30, borderRadius: '50%',
            objectFit: 'cover', flexShrink: 0,
            border: '1.5px solid var(--hud-gold-40)',
          }}
        />
      ) : (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--hud-surface-hi)',
          border: '1.5px solid var(--hud-gold-40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
          color: C.gold, letterSpacing: '0.05em',
        }}>
          {character.name.split(/\s+/).map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()}
        </div>
      )}
      {/* Character identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: 'var(--hud-text)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {[careerName, specNames, speciesName].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Destiny Pool */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textDim, whiteSpace: 'nowrap' }}>
          Destiny
        </span>
        <DestinyPoolDisplay
          poolRecord={destinyPoolRecord}
          isGm={false}
          onClickLight={onSpendDestinyOpen}
          compact
        />
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Resources */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* XP pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--hud-accent-10)', border: '1px solid var(--hud-accent-border)',
          borderRadius: 4, padding: '3px 10px',
        }}>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold }}>XP</span>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)' }}>{character.xp_available}</span>
        </div>
        {/* Credits pill — click to spend */}
        <button
          onClick={onSpendCreditsOpen}
          title="Click to spend credits"
          onMouseEnter={() => setCreditsHovered(true)}
          onMouseLeave={() => setCreditsHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: creditsHovered ? 'var(--hud-accent-20)' : 'var(--hud-accent-10)',
            border: '1px solid var(--hud-accent-border)',
            borderRadius: 4, padding: '3px 10px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
        >
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold }}>Credits</span>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)' }}>{character.credits.toLocaleString()}</span>
        </button>
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Print Sheet */}
      <button
        onClick={onDownloadPDF}
        disabled={pdfGenerating}
        title="Download printable character sheet PDF"
        style={{
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
          fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: pdfGenerating ? C.textFaint : printHovered ? C.gold : 'var(--hud-accent-60)',
          background: 'transparent',
          border: printHovered && !pdfGenerating ? '1px solid var(--hud-accent-50)' : '1px solid var(--hud-accent-25)',
          borderRadius: 4,
          padding: '3px 9px',
          cursor: pdfGenerating ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'color .15s, border-color .15s',
          flexShrink: 0,
        }}
        onMouseEnter={() => setPrintHovered(true)}
        onMouseLeave={() => setPrintHovered(false)}
      >
        {pdfGenerating ? 'Generating…' : '⬇ Print Sheet'}
      </button>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Theme switcher */}
      <ThemeSwitcher current={uiTheme} onChange={onThemeChange} />
      <div style={{ width: 1, height: 28, background: C.border }} />
      <button
        onClick={onLogout}
        style={{
          fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: logoutHovered ? 'var(--bs-red-sun)' : C.textDim, background: 'transparent',
          border: logoutHovered ? '1px solid var(--bs-red-sun)' : `1px solid ${C.border}`,
          borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
          transition: '.15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
      >⏻ LOGOUT</button>
      {/* Combat mode badge */}
      {isCombat && (
        <div style={{
          marginLeft: 'auto',
          background: 'var(--hud-accent-20)', border: '1px solid var(--hud-accent-50)',
          borderRadius: 4, padding: '3px 10px',
          fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.18em',
          color: 'var(--bs-red-sun)', textShadow: '0 0 8px var(--hud-accent-60)',
          whiteSpace: 'nowrap',
        }}>
          COMBAT · ROUND {combatRound}
        </div>
      )}
    </div>
  )
}
