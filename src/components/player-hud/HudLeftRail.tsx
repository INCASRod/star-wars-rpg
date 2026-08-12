'use client'

import { memo } from 'react'
import { FONT_BODY, RADIUS, EASE, FS } from '@/lib/tokens'

export type RailPanelId =
  | 'combat' | 'force' | 'skill'
  | 'skills' | 'talents' | 'force-panel' | 'inventory' | 'lore' | 'group'
  | 'dice' | 'adversaries'

interface HudLeftRailProps {
  isForceUser:      boolean
  /** Force Rating >= 1 OR eligible-but-unpurchased (see isEligibleForForceRating) — gates the Force nav tab, distinct from isForceUser which gates the Force Check quick action. */
  canAccessForceTab: boolean
  activePanel:      RailPanelId | null
  onPanelToggle:    (id: RailPanelId) => void
  showAdversaries?: boolean
  /** Hand-of-cards tuck toggle — bottom-most rail entry. Omit entirely (both
      props) to hide it, e.g. GM mode, where the hand overlay itself never
      renders. */
  handTucked?:      boolean
  onToggleHand?:    () => void
}

const BTN_STYLE: React.CSSProperties = {
  width: 60, minHeight: 48,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 3, border: '1px solid transparent', borderRadius: RADIUS.md,
  cursor: 'pointer', background: 'transparent',
  transition: `background ${EASE.default}, border-color ${EASE.default}`,
  flexShrink: 0,
}

const SYMBOL_STYLE: React.CSSProperties = {
  fontSize: 16, lineHeight: 1,
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--hud-text-dim)',
  textAlign: 'center',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  wordBreak: 'normal',
  maxWidth: 58,
}

const QUICK_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'combat', symbol: '⌖', label: 'Combat Check', cls: 'hud-rail-btn-combat' },
  { id: 'force',  symbol: '≋', label: 'Force Check',  cls: 'hud-rail-btn-force'  },
  { id: 'skill',  symbol: '⬠', label: 'Skill Check',  cls: 'hud-rail-btn-skill'  },
]

interface NavButton {
  id:         RailPanelId
  symbol?:    string
  imgSrc?:    string
  imgClass?:  string
  label:      string
  gateForce?: boolean
}

const NAV_BUTTONS: NavButton[] = [
  { id: 'skills',      symbol: '⚙',                                                                   label: 'Skills'    },
  { id: 'talents',     symbol: '★',                                                                   label: 'Talents'   },
  { id: 'force-panel', imgSrc: '/images/factions/jedi.webp', imgClass: 'hud-fi-jedi', label: 'Force', gateForce: true },
  { id: 'inventory',   symbol: '▣',                                                                   label: 'Inventory' },
  { id: 'lore',        symbol: '✦',                                                                   label: 'Lore'      },
  { id: 'group',       imgSrc: '/images/factions/rebel.png', imgClass: 'hud-fi-rebel', label: 'Group' },
]

const UTILITY_BUTTONS: { id: RailPanelId; symbol: string; label: string; cls: string }[] = [
  { id: 'dice',        symbol: '⬡', label: 'Dice',        cls: 'hud-rail-btn-nav'          },
  { id: 'adversaries', symbol: '⊗', label: 'Adversaries', cls: 'hud-rail-btn-adversaries'  },
]

export const HudLeftRail = memo(function HudLeftRail({
  isForceUser, canAccessForceTab, activePanel, onPanelToggle, showAdversaries = false,
  handTucked, onToggleHand,
}: HudLeftRailProps) {
  return (
    <div style={{
      width: 72, flexShrink: 0,
      background: 'var(--hud-panel)',
      borderRight: '1px solid var(--hud-border-hi)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, padding: '8px 0', overflowY: 'auto',
    }}>
      {QUICK_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'force' && !isForceUser) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {NAV_BUTTONS.map(({ id, symbol, imgSrc, imgClass, label, gateForce }) => {
        if (gateForce && !canAccessForceTab) return null
        return (
          <button
            key={id}
            className={`hud-rail-btn-nav${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            {imgSrc
              ? <img src={imgSrc} className={`hud-fi ${imgClass ?? ''}`} alt="" aria-hidden />
              : <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            }
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />

      {UTILITY_BUTTONS.map(({ id, symbol, label, cls }) => {
        if (id === 'adversaries' && !showAdversaries) return null
        return (
          <button
            key={id}
            className={`${cls}${activePanel === id ? ' active' : ''}`}
            style={BTN_STYLE}
            onClick={() => onPanelToggle(id)}
            title={label}
          >
            <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{symbol}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>{label}</span>
          </button>
        )
      })}

      {onToggleHand && (
        // Pinned flush to the rail's bottom edge regardless of how many
        // items render above it — `marginTop: 'auto'` on this wrapper
        // (first item after it in the flex column, divider included) pushes
        // it and everything after down to fill the remaining column space,
        // same technique as any "footer stuck to bottom of a flex column".
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: 30, height: 1, background: 'var(--hud-border-hi)', margin: '4px 0', flexShrink: 0 }} />
          <button
            className="hud-rail-btn-nav"
            style={BTN_STYLE}
            onClick={onToggleHand}
            title={handTucked ? 'Raise hand' : 'Tuck hand'}
          >
            {/* Solid triangle, matching the rail's existing glyph weight
                (★⬡⊗ etc — filled geometric symbols, not thin line icons):
                ▲ (raise) when tucked, ▼ (tuck) when raised — same
                semantic mapping the previous ⌃/⌄ carets used, just legible
                at rail size. No new icon source introduced. */}
            <span className="hud-rail-symbol" style={SYMBOL_STYLE}>{handTucked ? '▲' : '▼'}</span>
            <span className="hud-rail-label" style={LABEL_STYLE}>Hand</span>
          </button>
        </div>
      )}
    </div>
  )
})
