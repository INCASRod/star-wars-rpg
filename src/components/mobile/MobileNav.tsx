'use client'

export type MobileDestination = 'sheet' | 'abilities' | 'gear' | 'party'

const DESTINATIONS: { key: MobileDestination; icon: string; label: string }[] = [
  { key: 'sheet',      icon: '☰', label: 'Sheet' },
  { key: 'abilities',  icon: '✦', label: 'Abilities' },
  { key: 'gear',       icon: '⛨', label: 'Gear' },
  { key: 'party',      icon: '☖', label: 'Party' },
]

export interface MobileNavProps {
  active: MobileDestination
  onSelect: (dest: MobileDestination) => void
  /** Inert this prompt — present, correctly sized/positioned, does nothing. */
  onRollTap: () => void
}

export function MobileNav({ active, onSelect, onRollTap }: MobileNavProps) {
  return (
    <nav className="m-nav" aria-label="Primary">
      {DESTINATIONS.map(d => (
        <button
          key={d.key}
          type="button"
          className={`m-nav-item${active === d.key ? ' is-active' : ''}`}
          aria-current={active === d.key ? 'page' : undefined}
          onClick={() => onSelect(d.key)}
        >
          <span className="m-nav-icon" aria-hidden="true">{d.icon}</span>
          <span className="m-nav-label">{d.label}</span>
        </button>
      ))}

      <button
        type="button"
        className="m-nav-roll-btn"
        onClick={onRollTap}
        aria-label="Roll"
      >
        ⚄
      </button>
    </nav>
  )
}
