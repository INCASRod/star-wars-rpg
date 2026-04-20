'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { WeaponRef } from '@/lib/resolve-weapon'
import { FS_OVERLINE, FS_CAPTION, FS_SM, FS_H3 } from '@/components/player-hud/design-tokens'
import { TalentQuickReference } from './TalentQuickReference'
import { AdversaryCardList } from './AdversaryCardList'
import { InitiativeStrip } from './InitiativeStrip'
import { useEncounterState } from '@/hooks/useEncounterState'

// ── Design Tokens ──
const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const GOLD = '#C8AA50'
const BORDER = 'rgba(200,170,80,0.18)'
const BORDER_MD = 'rgba(200,170,80,0.32)'
const CHAR_BR = '#e05252'
const CHAR_AG = '#52a8e0'
const CHAR_CUN = '#e0a852'
const CHAR_INT = '#a852e0'
const CHAR_WIL = '#52e0a8'
const CHAR_PR = '#e05298'
const TEXT = '#E8DFC8'
const TEXT_SEC = 'rgba(232,223,200,0.6)'
const TEXT_MUTED = 'rgba(232,223,200,0.35)'
const TEXTGR = "#72B421"
const FC = "'Rajdhani', sans-serif"
const FR = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"

const panelBase: React.CSSProperties = {
  background: PANEL_BG,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  position: 'relative',
}
const raisedPanel: React.CSSProperties = {
  background: RAISED_BG,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  position: 'relative',
}

void CHAR_CUN; void CHAR_INT; void CHAR_PR; void CHAR_WIL; void TEXTGR; void TEXT; void panelBase; void raisedPanel

interface Props {
  character: Character
  campaignId: string
  talents?: Array<{ name: string; activation: string; description?: string; statBonus?: { stat: string; value: number } }>
}

export function CombatTracker({ character, campaignId, talents = [] }: Props) {
  const { encounter } = useEncounterState(campaignId)
  const [weaponRef, setWeaponRef] = useState<Record<string, WeaponRef>>({})
  // Collapsed state for adversary cards (true = collapsed; active-turn card overrides)
  const [cardCollapsed, setCardCollapsed] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  // Load weapon reference for stat lookup (weapons in adversaries.json are name-only strings)
  useEffect(() => {
    supabase
      .from('ref_weapons')
      .select('name, damage, damage_add, range_value')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, WeaponRef> = {}
        data.forEach((w: { name: string; damage: number; damage_add: number | null; range_value: string | null }) => {
          map[w.name.toLowerCase()] = w
        })
        setWeaponRef(map)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!encounter || !encounter.is_active) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, background: BG }}>
        <div style={{ fontFamily: FC, fontSize: FS_H3, color: TEXT_MUTED }}>NO ACTIVE COMBAT</div>
        <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT_MUTED }}>Waiting for DM to start combat…</div>
      </div>
    )
  }

  const currentSlot = encounter.initiative_slots[encounter.current_slot_index]

  const revealedAdversaries = encounter.adversaries.filter(a => a.revealed)
  const publicLog = encounter.log_entries.filter(e => !e.dmOnly)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, overflow: 'hidden', position: 'relative' }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 0.015,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%23C8AA50' stroke-width='0.5'/%3E%3C/svg%3E")`,
      }} />

      <InitiativeStrip encounter={encounter} character={character} />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Left: Adversaries + Log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${BORDER}` }}>

          {/* Adversary Reveal Panel */}
          <AdversaryCardList
            revealedAdversaries={revealedAdversaries}
            currentSlot={currentSlot}
            initiativeSlots={encounter.initiative_slots}
            cardCollapsed={cardCollapsed}
            setCardCollapsed={setCardCollapsed}
            weaponRef={weaponRef}
          />

          {/* Combat Log Feed */}
          <div style={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, maxHeight: 180, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 16px 0', flexShrink: 0 }}>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 6 }}>
                Combat Log
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {publicLog.length === 0 && (
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>No entries yet</div>
              )}
              {publicLog.map(entry => {
                const leftColor = entry.text.toLowerCase().includes('fail') || entry.text.toLowerCase().includes('hit') ? CHAR_BR
                  : entry.text.toLowerCase().includes('success') ? CHAR_AG
                    : BORDER_MD
                return (
                  <div key={entry.id} style={{
                    borderLeft: `2px solid ${leftColor}`,
                    paddingLeft: 8, display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, flexShrink: 0 }}>R{entry.round}·S{entry.slot}</span>
                    <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: GOLD, flexShrink: 0, minWidth: 80 }}>{entry.actor}</span>
                    <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC }}>{entry.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Talent Quick Reference */}
        <TalentQuickReference talents={talents} />
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,82,82,0); }
          50% { box-shadow: 0 0 8px 2px rgba(224,82,82,0.25); }
        }
        @keyframes activeTurnPulse {
          0%, 100% { border-color: rgba(200,170,80,0.3); }
          50%       { border-color: rgba(200,170,80,0.7); }
        }
      `}</style>
    </div>
  )
}
