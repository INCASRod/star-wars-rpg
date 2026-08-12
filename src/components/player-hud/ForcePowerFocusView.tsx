'use client'

import { useEffect } from 'react'
import { RichText } from '@/components/ui/RichText'
import { Z } from '@/lib/tokens'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { buildForceCellKeyMap } from '@/components/character/ForcePowerTree'
import { FORCE_HEADER_BG, FORCE_HEADER_TEXT } from './HandOverlay'
import styles from './ForcePowerFocusView.module.css'

// ── H6 — Force power focus view + upgrade lattice ──────────────────────────
// Opened by clicking a Force card in the hand (talent cards stay inert on
// click, matching H2's original card-click distinction). Read-only: no
// purchase affordance anywhere in this view — purchases still happen only
// via the full-screen talents/tree route. "Play Power" (H7) opens the Force
// Check modal with this power pre-selected, then closes the focus view —
// everything past open (pool, allocation, roll) is identical to picking the
// same power by hand.
//
// Built as its own lattice renderer rather than reusing TalentDossier: that
// component is built for ONE node's full detail at a time (purchase flow,
// focus trap, single confirm action). This view's shape is fundamentally
// different — every node in the tree at once, read-only, no per-node
// interaction — so bending TalentDossier into a multi-node grid would fight
// its own contract instead of reusing it cleanly.
export function ForcePowerFocusView({
  power, onClose, onPlayPower,
}: {
  power: ForcePowerDisplay
  onClose: () => void
  /** H7 — wires "Play Power" to the Force Check modal with this power
      pre-selected. Called with the power's key; the view still closes the
      same way the stub always did (see the button below). */
  onPlayPower: (powerKey: string) => void
}) {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  const baseAbility = power.basicAbilityKey
    ? power.abilities.find(a => a.key === power.basicAbilityKey)
    : undefined

  // Only real, independently-owned positions (span > 0) become lattice
  // cards — a span:0 continuation cell isn't a node in its own right, same
  // filter useForcePowers.ts/ForcePowerTree.tsx already apply. The base
  // power's own node (basicAbilityKey) is excluded — it's already the big
  // card, not an upgrade in the lattice.
  const cellKeyMap = buildForceCellKeyMap(power.treeNodes)
  const upgradeNodes = power.treeNodes.filter(n => n.span > 0 && n.abilityKey !== power.basicAbilityKey)
  // Polish pass — deliberate scope change from H6 (which ghosted unowned
  // nodes at opacity 0.5): show ONLY owned upgrades. This view is "what this
  // power does for me right now," not an aspirational tree — the talent
  // tree route remains where unpurchased upgrades are browsed/bought.
  const ownedUpgradeNodes = upgradeNodes.filter(n => n.ownedRank > 0)

  return (
    <div
      className={styles.backdrop}
      style={{ zIndex: Z.popover }}
      onClick={onClose}
    >
      <div className={styles.stage} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>✕ Close</button>

        <div className={styles.bigCard}>
          <div className={styles.bigCardHeader} style={{ background: FORCE_HEADER_BG, color: FORCE_HEADER_TEXT }}>
            {power.powerName}
          </div>
          <div className={styles.bigCardMeta}>Force Power</div>
          <div className={styles.bigCardBody}>
            {(baseAbility?.description ?? power.description) && (
              <RichText text={baseAbility?.description ?? power.description ?? ''} />
            )}
          </div>
          {/* H7 — opens the Force Check modal with this power pre-selected,
              then closes the focus view (same close behaviour the stub
              always had). */}
          <button type="button" className={styles.playPower} onClick={() => { onPlayPower(power.powerKey); onClose() }}>
            Play Power
          </button>
        </div>

        {ownedUpgradeNodes.length > 0 ? (
          <div className={styles.lattice}>
            {ownedUpgradeNodes.map(n => {
              const key = `${n.row}-${n.col}`
              return (
                <div key={cellKeyMap.get(key) ?? key} className={`${styles.node} ${styles.owned}`}>
                  <div className={styles.nodeName}>{n.name}</div>
                  <div className={styles.nodeDesc}>
                    {n.description && <RichText text={n.description} />}
                  </div>
                  {n.totalRanks > 1 && (
                    <div className={styles.nodePips}>
                      {Array.from({ length: n.ownedRank }, (_, i) => <span key={i} className={styles.pip} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.emptyLattice}>No upgrades purchased yet — see the Talents route to buy more.</div>
        )}
      </div>
    </div>
  )
}
