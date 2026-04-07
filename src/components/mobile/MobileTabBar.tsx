'use client'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL  = 'rgba(6,13,9,0.95)'
const BORDER = 'rgba(200,170,80,0.2)'
const GOLD   = '#C8AA50'
const GOLD_I = 'rgba(200,170,80,0.4)'
const FORCE_BLUE = '#7EC8E3'
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

export type TabId = 'status' | 'skills' | 'gear' | 'feed' | 'combat' | 'force'

interface TabDef { id: TabId; label: string; icon: string }

const BASE_TABS: TabDef[] = [
  { id: 'status',  label: 'Vitals',  icon: '⚔️' },
  { id: 'skills',  label: 'Skills',  icon: '🎯' },
  { id: 'gear',    label: 'Gear',    icon: '🎒' },
]

interface MobileTabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  hasCampaign?: boolean
  hasForce?: boolean
}

export function MobileTabBar({ activeTab, onTabChange, hasCampaign, hasForce }: MobileTabBarProps) {
  const tabs: TabDef[] = [
    ...BASE_TABS,
    ...(hasCampaign ? [
      { id: 'combat' as TabId, label: 'Combat', icon: '⚡' },
      { id: 'feed'   as TabId, label: 'Feed',   icon: '📡' },
    ] : []),
    ...(hasForce ? [{ id: 'force' as TabId, label: 'Force', icon: '✦' }] : []),
  ]

  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 40,
      height: 64,
      background: PANEL,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${BORDER}`,
      display: 'flex',
      flexShrink: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {tabs.map(tab => {
        const active = tab.id === activeTab
        const isForceTab = tab.id === 'force'
        const accentColor = isForceTab ? FORCE_BLUE : GOLD
        const inactiveColor = isForceTab ? 'rgba(126,200,227,0.4)' : GOLD_I
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            style={{
              flex: '1 0 64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Active underline */}
            {active && (
              <div style={{
                position: 'absolute',
                top: 0, left: '10%', right: '10%',
                height: 2,
                background: accentColor,
                borderRadius: '0 0 2px 2px',
              }} />
            )}

            <span style={{ fontSize: 16, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.52rem, 2vw, 0.67rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: active ? accentColor : inactiveColor,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
