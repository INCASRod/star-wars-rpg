'use client'

import { C, FONT_RAJDHANI, FS_LABEL } from './design-tokens'

export type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Feed' | 'Session' | 'Group'

const FORCE_TAB_BLUE   = '#7EC8E3'
const FORCE_TAB_PURPLE = '#8B2BE2'
const GROUP_TAB_COLOR  = '#8EC8F0'

export function TabBar({ active, onChange, hasCombat, isForceUser, isForceUserFallen, isCombatActive }: { active: TabName; onChange: (t: TabName) => void; hasCombat?: boolean; isForceUser?: boolean; isForceUserFallen?: boolean; isCombatActive?: boolean }) {
  const allTabs: TabName[] = ['Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Session', 'Group']
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
        const isFeed       = tab === 'Feed'
        const isForceTab   = tab === 'Force'
        const isSessionTab = tab === 'Session'
        const isGroupTab   = tab === 'Group'
        const forceColor   = isForceUserFallen ? FORCE_TAB_PURPLE : FORCE_TAB_BLUE
        const sessionColor = isCombatActive ? '#E53E3E' : '#52C8A0'
        const tabColor     = isForceTab
          ? forceColor
          : isSessionTab ? sessionColor
          : isGroupTab   ? GROUP_TAB_COLOR
          : (isFeed && hasCombat) ? '#E05050' : C.gold
        const dimColor     = isForceTab
          ? (isForceUserFallen ? 'rgba(139,43,226,0.45)' : 'rgba(126,200,227,0.45)')
          : isSessionTab ? (isCombatActive ? 'rgba(229,62,62,0.45)' : 'rgba(82,200,160,0.45)')
          : isGroupTab   ? 'rgba(142,200,240,0.45)'
          : isFeed && hasCombat ? '#E0505088' : C.textDim
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
                : isSessionTab && active === tab && !isCombatActive ? '0 0 10px rgba(82,200,160,0.4)'
                : isSessionTab && active === tab && isCombatActive ? '0 0 10px rgba(229,62,62,0.4)'
                : 'none',
            }}
          >
            {isGroupTab && (
              <img
                src="/images/factions/rebel.png"
                alt=""
                style={{
                  width: 14, height: 14,
                  filter: `invert(1) hue-rotate(20deg) opacity(${active === tab ? 1 : 0.45})`,
                  mixBlendMode: 'screen',
                  transition: 'filter .15s',
                }}
              />
            )}
            {isSessionTab ? `${sessionIcon} SESSION` : isGroupTab ? 'GROUP' : tab}
          </button>
        )
      })}
    </div>
  )
}
