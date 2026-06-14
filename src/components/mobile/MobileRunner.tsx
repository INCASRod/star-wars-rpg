'use client'
import { FONT_BODY, FS, SP, RADIUS, EASE, HUD } from '@/lib/tokens'

export type RunnerTab = 'feed' | 'skills-buy' | 'talents-buy' | 'force' | 'lore'

const RUNNER_TABS: { id: RunnerTab; label: string }[] = [
  { id: 'feed',        label: 'Feed' },
  { id: 'skills-buy',  label: '+Skills' },
  { id: 'talents-buy', label: '+Talents' },
  { id: 'force',       label: 'Force' },
  { id: 'lore',        label: 'Lore' },
]

interface MobileRunnerProps {
  activeTab: RunnerTab
  onTabChange: (tab: RunnerTab) => void
}

export function MobileRunner({ activeTab, onTabChange }: MobileRunnerProps) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      background: 'var(--hud-surface-hi)',
      borderBottom: `1px solid var(--hud-border)`,
      flexShrink: 0,
      height: 48,   /* fixed runner strip height — intentional geometry constant */
      alignItems: 'center',
    }}>
      {RUNNER_TABS.map(tab => {
        const isActive  = tab.id === activeTab
        const isFeedTab = tab.id === 'feed'

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (isFeedTab && isActive) ? 'var(--hud-accent)' : 'transparent',
              border: 'none',
              height: 40,   /* fixed tab button height within 48px strip */
              padding: `${SP[1]} ${SP[2]}`,
              cursor: 'pointer',
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: (isFeedTab && isActive) ? 'var(--hud-bg)' : (isActive ? 'var(--hud-accent)' : HUD.textFaint),
              boxShadow: (isFeedTab && isActive)
                ? '0 0 10px color-mix(in srgb, var(--hud-accent) 60%, transparent)'
                : 'none',
              borderBottom: (!isFeedTab && isActive)
                ? `2px solid var(--hud-accent)`
                : '2px solid transparent',
              transition: `color ${EASE.quick}, background ${EASE.quick}, box-shadow ${EASE.quick}`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              borderRadius: 0,
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
