'use client'

interface VitalCellProps {
  label:   string
  value:   string
  pct?:    number | null  // null = no fill bar (Soak)
  onClick: () => void
}

// All three vital cells are real, enabled buttons at identical tap size —
// per spec, inert this prompt (no-op onClick) rather than `disabled`, since
// `disabled` dims the cell (see globals.css's `:disabled{opacity:.4}`
// convention) and would wrongly read as "unavailable" rather than "not
// wired up yet."
function VitalCell({ label, value, pct, onClick }: VitalCellProps) {
  return (
    <button
      type="button"
      className="m-vital-cell"
      onClick={onClick}
      aria-label={label}
    >
      <span className="m-vital-label">{label}</span>
      <span className="m-vital-value">{value}</span>
      {pct != null && (
        <span className="m-vital-bar">
          {/* width is a live current/max percentage — no CSS-class equivalent */}
          <span className="m-vital-bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
        </span>
      )}
    </button>
  )
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

export interface MobileHeaderProps {
  name:            string
  portraitUrl?:    string | null
  /** Career/species line — e.g. "Bounty Hunter · Human". Either half may be absent. */
  identityLine:    string
  woundCurrent:    number
  woundThreshold:  number
  strainCurrent:   number
  strainThreshold: number
  soak:            number
  hasUnreadNotifications: boolean
  onMapTap:           () => void
  onNotificationsTap: () => void
  onWoundsTap:  () => void
  onStrainTap:  () => void
}

export function MobileHeader({
  name, portraitUrl, identityLine,
  woundCurrent, woundThreshold, strainCurrent, strainThreshold, soak,
  hasUnreadNotifications,
  onMapTap, onNotificationsTap, onWoundsTap, onStrainTap,
}: MobileHeaderProps) {
  const woundPct  = woundThreshold  > 0 ? Math.min(1, woundCurrent  / woundThreshold)  : 0
  const strainPct = strainThreshold > 0 ? Math.min(1, strainCurrent / strainThreshold) : 0

  return (
    <header className="m-header">
      <div className="m-header-row">
        <div className="m-avatar">
          {portraitUrl
            ? <img src={portraitUrl} alt={name} loading="lazy" />
            : <span>{initials(name)}</span>}
        </div>

        <div className="m-identity">
          <span className="m-identity-name">{name}</span>
          {identityLine && <span className="m-identity-line">{identityLine}</span>}
        </div>

        <div className="m-header-actions">
          <button type="button" className="m-icon-btn" onClick={onMapTap} aria-label="Map">
            ⛶
          </button>
          <button type="button" className="m-icon-btn" onClick={onNotificationsTap} aria-label="Notifications">
            ⚑
            {hasUnreadNotifications && <span className="m-icon-btn-dot" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="m-vitals">
        <VitalCell label="Wounds" value={`${woundCurrent}/${woundThreshold}`} pct={woundPct} onClick={onWoundsTap} />
        <VitalCell label="Strain" value={`${strainCurrent}/${strainThreshold}`} pct={strainPct} onClick={onStrainTap} />
        <VitalCell label="Soak" value={String(soak)} pct={null} onClick={() => {}} />
      </div>
    </header>
  )
}
