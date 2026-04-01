'use client'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL  = 'rgba(6,13,9,0.95)'
const BORDER = 'rgba(200,170,80,0.2)'
const GOLD   = '#C8AA50'
const GOLD_I = 'rgba(200,170,80,0.4)'
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

export type TabId = 'status' | 'skills' | 'talents' | 'gear' | 'notes'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'status',  label: 'Status',  icon: '⚔️' },
  { id: 'skills',  label: 'Skills',  icon: '🎯' },
  { id: 'talents', label: 'Talents', icon: '⚡' },
  { id: 'gear',    label: 'Gear',    icon: '🎒' },
  { id: 'notes',   label: 'Notes',   icon: '📋' },
]

interface MobileTabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
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
    }}>
      {TABS.map(tab => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
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
                background: GOLD,
                borderRadius: '0 0 2px 2px',
              }} />
            )}

            <span style={{ fontSize: 16, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: active ? GOLD : GOLD_I,
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
