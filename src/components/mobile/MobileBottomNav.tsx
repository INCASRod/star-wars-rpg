'use client'
import { FONT_BODY, FS, SP, RADIUS, Z, EASE, HUD } from '@/lib/tokens'

const NAV_BAR_HEIGHT = 60 // fixed nav bar height — matches FAB top:-7 raise calculation

export type NavTab = 'skills' | 'talents' | 'dice' | 'items' | 'group'

interface NavItem { id: NavTab; label: string; icon: string; isFab?: boolean }

const NAV_ITEMS: NavItem[] = [
  { id: 'skills',  label: 'Skills',  icon: '⬡' },
  { id: 'talents', label: 'Talents', icon: '★' },
  { id: 'dice',    label: 'Dice',    icon: '⬡', isFab: true },
  { id: 'items',   label: 'Items',   icon: '▣' },
  { id: 'group',   label: 'Group',   icon: '◉' },
]

interface MobileBottomNavProps {
  activeTab: NavTab | null
  onTabChange: (tab: NavTab) => void
  encumbranceWarning?: boolean
}

export function MobileBottomNav({ activeTab, onTabChange, encumbranceWarning }: MobileBottomNavProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--hud-surface-hi)',
      borderTop: `1px solid var(--hud-border)`,
      height: NAV_BAR_HEIGHT,
      flexShrink: 0,
      position: 'relative',
      zIndex: Z.sticky,
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = activeTab === item.id

        if (item.isFab) {
          return (
            <div key={item.id} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => onTabChange(item.id)}
                aria-label="Open dice roller"
                style={{
                  position: 'relative',
                  top: -7,          // raises FAB above bar: (NAV_BAR_HEIGHT - 52) / 2 + 3 ≈ 7px above centre
                  width: 52, height: 52,  // fixed circle dimensions — intentional exception
                  borderRadius: RADIUS.full,
                  background: 'var(--hud-accent)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                  fontFamily: FONT_BODY,
                  fontSize: FS.h4,
                  color: 'var(--hud-bg)',
                  zIndex: Z.fab,
                }}
              >
                {item.icon}
              </button>
            </div>
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2,  // intentional 2px minimum — tighter than SP[1] (4–8px fluid)
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: `${SP[1]} 0`,
              position: 'relative',
            }}
          >
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.sm, lineHeight: 1,
              color: isActive ? 'var(--hud-accent)' : HUD.textFaint,
              transition: `color ${EASE.quick}`,
            }}>
              {item.icon}
            </span>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
              color: isActive ? 'var(--hud-accent)' : HUD.textFaint,
              transition: `color ${EASE.quick}`,
            }}>
              {item.label}
            </span>
            {item.id === 'items' && encumbranceWarning && (
              <span style={{
                position: 'absolute', top: 6, right: 'calc(50% - 14px)',
                width: 6, height: 6,  // fixed pip dimensions — intentional exception
                borderRadius: RADIUS.full,
                background: 'var(--hud-accent)',
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
