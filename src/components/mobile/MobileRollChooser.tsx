'use client'

import { MobileBottomSheet } from './MobileBottomSheet'

export type RollChoice = 'combat' | 'skill' | 'force'

export interface MobileRollChooserProps {
  open: boolean
  onClose: () => void
  onChoose: (choice: RollChoice) => void
  /** Force is only offered to Force-sensitive characters (forceRating >= 1). */
  forceAvailable: boolean
}

export function MobileRollChooser({ open, onClose, onChoose, forceAvailable }: MobileRollChooserProps) {
  return (
    <MobileBottomSheet open={open} onClose={onClose} collapsedHeight="40dvh" expandedHeight="40dvh">
      <div className="m-chooser-row">
        <button type="button" className="m-chooser-btn" onClick={() => onChoose('combat')}>
          <span className="m-chooser-icon" aria-hidden="true">⌖</span> Combat Check
        </button>
        <button type="button" className="m-chooser-btn" onClick={() => onChoose('skill')}>
          <span className="m-chooser-icon" aria-hidden="true">◈</span> Skill Check
        </button>
        <button
          type="button"
          className="m-chooser-btn"
          disabled={!forceAvailable}
          onClick={() => forceAvailable && onChoose('force')}
        >
          <span className="m-chooser-icon" aria-hidden="true">≋</span> Force Check{!forceAvailable ? ' (not Force-sensitive)' : ''}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
