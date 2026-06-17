'use client'

import { useState } from 'react'
import type { Character } from '@/lib/types'
import type { WeaponRef } from '@/lib/resolve-weapon'
import { FS, SP, RADIUS, Z, HUD, FONT_BODY } from '@/lib/tokens'
import { TalentQuickReference } from './TalentQuickReference'
import { AdversaryCardList } from './AdversaryCardList'
import { InitiativeStrip } from './InitiativeStrip'
import { useEncounterState } from '@/hooks/useEncounterState'
import { useRefWeapons } from '@/hooks/useRefWeapons'

// ── Outcome colors (not characteristic stats — no clean CHAR_COLOR mapping) ──
const OUTCOME_FAIL  = 'var(--state-wounds)'   // red: fail/hit entries
const OUTCOME_SUCC  = 'var(--state-success)'  // green: success entries

interface Props {
  character: Character
  campaignId: string
  talents?: Array<{ name: string; activation: string; description?: string; statBonus?: { stat: string; value: number } }>
}

export function CombatTracker({ character, campaignId, talents = [] }: Props) {
  const { encounter } = useEncounterState(campaignId)
  const weaponRef = useRefWeapons()
  // Collapsed state for adversary cards (true = collapsed; active-turn card overrides)
  const [cardCollapsed, setCardCollapsed] = useState<Record<string, boolean>>({})

  if (!encounter || !encounter.is_active) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: SP[3], background: HUD.bg }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.h3, color: HUD.textFaint }}>NO ACTIVE COMBAT</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>Waiting for DM to start combat…</div>
      </div>
    )
  }

  const currentSlot = encounter.initiative_slots[encounter.current_slot_index]

  const revealedAdversaries = encounter.adversaries.filter(a => a.revealed)
  const publicLog = encounter.log_entries.filter(e => !e.dmOnly)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: HUD.bg, overflowX: 'hidden', overflowY: 'visible', position: 'relative' }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: Z.base,
        opacity: 0.015,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%23C8AA50' stroke-width='0.5'/%3E%3C/svg%3E")`,
      }} />

      <InitiativeStrip encounter={encounter} character={character} />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: Z.raised }}>

        {/* Left: Adversaries + Log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${HUD.border}` }}>

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
          <div style={{ flexShrink: 0, borderTop: `1px solid ${HUD.border}`, maxHeight: '11.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: `0.375rem ${SP[4]} 0`, flexShrink: 0 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)`, marginBottom: '0.375rem' }}>
                Combat Log
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${SP[4]} 0.625rem`, display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {publicLog.length === 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic' }}>No entries yet</div>
              )}
              {publicLog.map(entry => {
                const leftColor = entry.text.toLowerCase().includes('fail') || entry.text.toLowerCase().includes('hit') ? OUTCOME_FAIL
                  : entry.text.toLowerCase().includes('success') ? OUTCOME_SUCC
                    : HUD.borderHi
                return (
                  <div key={entry.id} style={{
                    borderLeft: `2px solid ${leftColor}`,
                    paddingLeft: SP[2], display: 'flex', gap: SP[2], alignItems: 'flex-start',
                  }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0 }}>R{entry.round}·S{entry.slot}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.gold, flexShrink: 0, minWidth: '5rem' }}>{entry.actor}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>{entry.text}</span>
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
          0%, 100% { border-color: var(--hud-border); }
          50%       { border-color: var(--hud-border-hi); }
        }
      `}</style>
    </div>
  )
}
