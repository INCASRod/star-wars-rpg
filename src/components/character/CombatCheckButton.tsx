'use client'

const SWORD_DIM = 'rgba(224,58,30,0.6)'

interface CombatCheckButtonProps {
  onOpen:     () => void
  isInCombat: boolean
}

export function CombatCheckButton({ onOpen, isInCombat }: CombatCheckButtonProps) {
  return (
    <button
      className={`combat-check-btn${isInCombat ? ' combat-check-btn-pulse' : ''}`}
      title="Combat Check"
      onClick={onOpen}
    >
      <svg
        width="12" height="12"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <line x1="3" y1="3" x2="17" y2="17" stroke={SWORD_DIM} strokeWidth="2" strokeLinecap="round" />
        <line x1="17" y1="3" x2="3" y2="17" stroke={SWORD_DIM} strokeWidth="2" strokeLinecap="round" />
        <circle cx="3"  cy="3"  r="1.5" fill={SWORD_DIM} />
        <circle cx="17" cy="3"  r="1.5" fill={SWORD_DIM} />
        <circle cx="3"  cy="17" r="1.5" fill={SWORD_DIM} />
        <circle cx="17" cy="17" r="1.5" fill={SWORD_DIM} />
        <circle cx="10" cy="10" r="1.5" fill={SWORD_DIM} />
      </svg>
    </button>
  )
}
