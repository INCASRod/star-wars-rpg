'use client'

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
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: isCombat ? 'rgba(30,4,4,0.96)' : 'var(--hud-surface-mid)',
      backdropFilter: 'blur(16px)',
      borderBottom: isCombat ? '1px solid rgba(224,80,80,0.35)' : `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', gap: 'var(--space-2)',
      zIndex: 10,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: `0 0 12px ${C.gold}60` }}>
        HOLOCRON
      </div>
      <div style={{ width: 1, height: 28, background: C.border }} />
      {/* Character identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 10px rgba(255,255,255,0.25)' }}>
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
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.xp_available}</span>
        </div>
        {/* Credits pill — click to spend */}
        <button
          onClick={onSpendCreditsOpen}
          title="Click to spend credits"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(78,200,122,0.1)', border: '1px solid rgba(78,200,122,0.3)',
            borderRadius: 4, padding: '3px 10px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,200,122,0.22)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,200,122,0.1)' }}
        >
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4EC87A' }}>Credits</span>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.credits.toLocaleString()}</span>
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
          color: pdfGenerating ? C.textFaint : 'rgba(224,58,30,0.6)',
          background: 'transparent',
          border: '1px solid rgba(224,58,30,0.25)',
          borderRadius: 4,
          padding: '3px 9px',
          cursor: pdfGenerating ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'color .15s, border-color .15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!pdfGenerating) {
            const el = e.currentTarget as HTMLElement
            el.style.color = C.gold
            el.style.borderColor = 'rgba(224,58,30,0.5)'
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'rgba(224,58,30,0.6)'
          el.style.borderColor = 'rgba(224,58,30,0.25)'
        }}
      >
        {pdfGenerating ? 'Generating…' : '⬇ Print Sheet'}
      </button>
      <button
        onClick={onLogout}
        style={{
          fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: C.textDim, background: 'transparent',
          border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
          transition: '.15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E05050'; (e.currentTarget as HTMLElement).style.borderColor = '#E05050' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textDim; (e.currentTarget as HTMLElement).style.borderColor = C.border }}
      >⏻ LOGOUT</button>
      {/* Combat mode badge */}
      {isCombat && (
        <div style={{
          marginLeft: 'auto',
          background: 'rgba(224,80,80,0.18)', border: '1px solid rgba(224,80,80,0.5)',
          borderRadius: 4, padding: '3px 10px',
          fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.18em',
          color: '#E05050', textShadow: '0 0 8px #E05050',
          whiteSpace: 'nowrap',
        }}>
          COMBAT · ROUND {combatRound}
        </div>
      )}
    </div>
  )
}
