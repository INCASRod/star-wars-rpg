'use client'

import { FS } from '@/lib/tokens'

interface ForceCheckButtonProps {
  onOpen: () => void
  compact?: boolean
}

export function ForceCheckButton({ onOpen, compact = false }: ForceCheckButtonProps) {
  return (
    <button
      className={[
        'force-check-btn',
        compact ? 'force-check-btn--compact' : 'force-check-btn--full force-check-btn-pulse',
      ].join(' ')}
      onClick={onOpen}
    >
      <span style={{ opacity: 0.85, fontSize: compact ? FS.label : 'clamp(13px, 1.1vw, 16px)' }}>✦</span>
      Force Check
    </button>
  )
}
