'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RichText } from '@/components/ui/RichText'
import plaqueStyles from './TalentTree.module.css'
import styles from './TalentDossier.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// TalentDossier — shared full-detail purchase overlay for BOTH the
// specialization tree (TalentTree.tsx) and the signature ability tree
// (TalentSurface.tsx / SigNodeGrid).
//
// This component is intentionally dumb: every eligibility decision
// (canPurchase, hasUnlockedTier5, locked-in status, affordability) is
// computed by the CALLER from data Prompts 2-4 and useCharacterSigAbilities
// already produce, then handed in as a single `action` value. The dossier
// never re-derives an owned/purchasable/locked state itself.
// ─────────────────────────────────────────────────────────────────────────────

export type DossierActionKind = 'purchase' | 'lockIn' | 'locked' | 'owned'

export interface DossierAction {
  kind: DossierActionKind
  /** Overrides the default "Purchase — {cost} XP" / "Lock In — {cost} XP" button text. */
  buttonLabel?: string
  /** Present → button disabled, reason shown underneath. Absent → affordable/enabled. */
  disabledReason?: string
  /** 'locked' kind only — banner icon (🔒 / 👁), title, and body text. */
  reasonIcon?: string
  reasonTitle?: string
  reasonText?: string
  /** 'owned' kind, ranked nodes only — "Ranks owned: N", already derived by the caller. */
  rankLabel?: string
  /** 'owned' kind, ranked nodes only — same numeric rank rankLabel is built from, for rendering pips alongside it (owned-plate treatment). */
  rank?: number
  /** 'purchase' | 'lockIn' only — runs the transaction. Dossier awaits it, then closes. */
  onConfirm?: () => void | Promise<void>
}

export interface DossierNode {
  key: string
  name: string
  description?: string
  /** Omitted for sig nodes — no activation concept exists there. */
  activation?: string
  isForceTalent?: boolean
  /** Omitted for sig nodes — no ranked concept exists there. */
  isRanked?: boolean
  cost: number
  /** e.g. "Tier 3" or "Base Ability" — precomputed by the caller. */
  tierLabel?: string
}

const HEADER_CLASS: Record<string, string> = {
  Passive:            plaqueStyles.headerPassive,
  Action:             plaqueStyles.headerActive,
  Maneuver:           plaqueStyles.headerManeuver,
  Incidental:         plaqueStyles.headerIncidental,
  'Incidental (OOT)': plaqueStyles.headerIncidental,
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function TalentDossier({
  node,
  action,
  onClose,
}: {
  node: DossierNode | null
  action: DossierAction | null
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [pending, setPending] = useState(false)

  // Basic a11y: remember the triggering element, focus the panel on open,
  // trap Tab within it, restore focus to the trigger on close.
  useEffect(() => {
    if (!node) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      previouslyFocused.current?.focus?.()
    }
  }, [node, onClose])

  if (!node || !action) return null

  const headerClass = node.activation ? (HEADER_CLASS[node.activation] ?? plaqueStyles.headerPassive) : styles.headerNeutral

  const handleConfirm = async () => {
    if (pending || action.disabledReason || !action.onConfirm) return
    setPending(true)
    try {
      await action.onConfirm()
    } finally {
      setPending(false)
    }
    onClose()
  }

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={node.name}
        onClick={e => e.stopPropagation()}
      >
        <div className={`${styles.header} ${headerClass}`}>
          <span className={styles.name}>{node.name}</span>
          {node.isForceTalent && <span className={styles.forceGlyph}>✦</span>}
        </div>

        <div className={styles.tags}>
          {node.activation && <span className={styles.tag}>{node.activation}</span>}
          {node.isRanked !== undefined && (
            <span className={styles.tag}>{node.isRanked ? 'Ranked' : 'Not Ranked'}</span>
          )}
          {node.isForceTalent && <span className={`${styles.tag} ${styles.tagForce}`}>Force Talent</span>}
          {node.tierLabel && <span className={styles.tag}>{node.tierLabel}</span>}
        </div>

        {node.description && (
          <div className={styles.body}>
            <RichText text={node.description} />
          </div>
        )}

        {action.kind === 'owned' && action.rankLabel && (
          <div className={styles.rankRow}>
            {action.rankLabel}
            {!!action.rank && action.rank > 0 && (
              <div className={styles.pips}>
                {Array.from({ length: action.rank }, (_, i) => <span key={i} className={styles.pip} />)}
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {action.kind === 'owned' && (
            <div className={styles.ownedBadge}>✓ Purchased</div>
          )}

          {action.kind === 'locked' && (
            <div className={styles.lockedBanner}>
              {action.reasonIcon && <span className={styles.lockedIcon}>{action.reasonIcon}</span>}
              <div>
                {action.reasonTitle && <div className={styles.lockedTitle}>{action.reasonTitle}</div>}
                {action.reasonText && <div className={styles.lockedText}>{action.reasonText}</div>}
              </div>
            </div>
          )}

          {(action.kind === 'purchase' || action.kind === 'lockIn') && (
            <>
              <button
                className={styles.purchaseBtn}
                disabled={!!action.disabledReason || pending}
                onClick={handleConfirm}
              >
                {action.buttonLabel ?? (action.kind === 'lockIn' ? `Lock In — ${node.cost} XP` : `Purchase — ${node.cost} XP`)}
              </button>
              {action.disabledReason && <div className={styles.disabledReason}>{action.disabledReason}</div>}
            </>
          )}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  )
}
