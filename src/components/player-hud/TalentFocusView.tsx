'use client'

import { useEffect } from 'react'
import { RichText } from '@/components/ui/RichText'
import { Z } from '@/lib/tokens'
import type { HandCard } from './HandOverlay'
import styles from './TalentFocusView.module.css'

// ── Talent card focus view — opened by clicking a TALENT card in the hand,
// matching H6's ForcePowerFocusView big-card treatment (same backdrop,
// scale-in, close, reduced-motion, Z.popover). No lattice: a talent has no
// child upgrade nodes, so this is a thin sibling of H6's big card rather than
// a parameterized "lattice: null" variant of that component — the two shapes
// (single card vs. card + node grid) don't share enough besides the big-card
// shell to justify one component bending to fit both. Read-only, same as H6:
// no purchase affordance, purchases stay on the talents/tree route.
export function TalentFocusView({
  card, onClose,
}: {
  card: HandCard
  onClose: () => void
}) {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  return (
    <div
      className={styles.backdrop}
      style={{ zIndex: Z.popover }}
      onClick={onClose}
    >
      <div className={styles.stage} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>✕ Close</button>

        <div className={styles.bigCard}>
          <div className={styles.bigCardHeader} style={{ background: card.headerBg, color: card.headerText }}>
            {card.name}
          </div>
          <div className={styles.bigCardMeta}>
            {card.activationLabel}
            {card.specLabel && ` · ${card.specLabel}`}
          </div>
          <div className={styles.bigCardBody}>
            {card.description && <RichText text={card.description} />}
          </div>
          {card.isRanked && card.rank > 0 && (
            <div className={styles.ranks}>
              {Array.from({ length: card.rank }, (_, i) => <span key={i} className={styles.pip} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
