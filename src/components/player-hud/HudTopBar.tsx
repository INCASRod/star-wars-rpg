'use client'

import { useState } from 'react'
import { C, FONT_RAJDHANI, FS_OVERLINE, FS_LABEL, FS_CAPTION, FS_H4, FS_SM } from './design-tokens'
import { DestinyPoolDisplay, type DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { Character } from '@/lib/types'

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
}: HudTopBarProps) {
  const [creditsHovered, setCreditsHovered] = useState(false)
  const [printHovered,   setPrintHovered]   = useState(false)
  const [logoutHovered,  setLogoutHovered]  = useState(false)

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: isCombat ? 'var(--hud-surface-hi)' : 'var(--hud-surface-mid)',
      backdropFilter: 'blur(16px)',
      borderBottom: isCombat ? '1px solid rgba(224,58,30,0.35)' : `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', gap: 'var(--space-2)',
      zIndex: 10,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: '0 0 12px rgba(224,58,30,0.4)' }}>
        HOLOCRON
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
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
          background: 'rgba(224,58,30,0.1)', border: '1px solid rgba(224,58,30,0.3)',
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
            background: creditsHovered ? 'rgba(224,58,30,0.2)' : 'rgba(224,58,30,0.1)',
            border: '1px solid rgba(224,58,30,0.3)',
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
          color: pdfGenerating ? C.textFaint : printHovered ? C.gold : 'rgba(224,58,30,0.6)',
          background: 'transparent',
          border: printHovered && !pdfGenerating ? '1px solid rgba(224,58,30,0.5)' : '1px solid rgba(224,58,30,0.25)',
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
          background: 'rgba(224,58,30,0.18)', border: '1px solid rgba(224,58,30,0.5)',
          borderRadius: 4, padding: '3px 10px',
          fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.18em',
          color: '#E03A1E', textShadow: '0 0 8px rgba(224,58,30,0.6)',
          whiteSpace: 'nowrap',
        }}>
          COMBAT · ROUND {combatRound}
        </div>
      )}
    </div>
  )
}
