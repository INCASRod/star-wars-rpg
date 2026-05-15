'use client'

import { C, FONT_RAJDHANI, FS_LABEL } from './design-tokens'
import { COLOR } from '@/lib/tokens'

export type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Session' | 'Group'

const FORCE_TAB_BLUE   = '#1A78A0'
const FORCE_TAB_PURPLE = '#8B2BE2'

export function TabBar({ active, onChange, hasCombat, isForceUser, isForceUserFallen, isCombatActive }: { active: TabName; onChange: (t: TabName) => void; hasCombat?: boolean; isForceUser?: boolean; isForceUserFallen?: boolean; isCombatActive?: boolean }) {
  const allTabs: TabName[] = ['Session', 'Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Group']
  const tabs = allTabs.filter(t => {
    if (t === 'Force') return !!isForceUser
    return true
  })
  return (
    <div style={{
      display: 'flex', borderBottom: `1px solid ${C.border}`,
      paddingLeft: 16, gap: 2, flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isForceTab   = tab === 'Force'
        const isSessionTab = tab === 'Session'
        const forceColor   = isForceUserFallen ? FORCE_TAB_PURPLE : FORCE_TAB_BLUE
        // Combat-active → red-sun (vivid); peaceful session → red-pale (soft)
        const sessionColor = isCombatActive ? C.gold : COLOR.bsRedPale
        const sessionDim   = isCombatActive ? 'var(--hud-accent-45)' : 'rgba(232,96,80,0.45)'
        const tabColor     = isForceTab
          ? forceColor
          : isSessionTab ? sessionColor
          : C.gold
        const dimColor     = isForceTab
          ? (isForceUserFallen ? 'rgba(139,43,226,0.45)' : 'rgba(126,200,227,0.45)')
          : isSessionTab ? sessionDim
          : C.textDim
        const sessionIcon  = isCombatActive ? '⚔' : '◉'
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${active === tab ? tabColor : 'transparent'}`,
              padding: '10px 14px', cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.08em',
              color: active === tab ? tabColor : dimColor,
              transition: '.15s', marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 5,
              textShadow: isForceTab && active === tab
                ? (isForceUserFallen ? '0 0 8px rgba(139,43,226,0.6)' : '0 0 10px rgba(126,200,227,0.4)')
                : isSessionTab && active === tab
                  ? (isCombatActive ? '0 0 10px var(--hud-accent-40)' : '0 0 8px rgba(232,96,80,0.3)')
                  : 'none',
            }}
          >
            {tab === 'Group' && (
              <img
                src="/images/factions/rebel.png"
                alt=""
                style={{
                  width: 14, height: 14,
                  opacity: active === tab ? 1 : 0.45,
                  transition: 'opacity .15s',
                }}
              />
            )}
            {isSessionTab ? `${sessionIcon} SESSION` : tab === 'Group' ? 'GROUP' : tab}
          </button>
        )
      })}
    </div>
  )
}
