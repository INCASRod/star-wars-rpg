'use client'

import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { RichText } from '@/components/ui/RichText'
import { MobileBottomSheet } from './MobileBottomSheet'

export interface MobileForceUpgradeSheetProps {
  open: boolean
  onClose: () => void
  power: ForcePowerDisplay | null
  xpAvailable: number
  forceRating: number
  onRequestPurchase: (label: string, cost: number, execute: () => Promise<unknown>) => void
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => Promise<string | undefined>
}

/**
 * Force power detail view — upgrade nodes list with cost/state, reached from
 * a Force power's own row (not from the row's tap-to-open-check-panel
 * behaviour, same "detail view, not the row tap" rule as skills). Node
 * data (cost, purchased, canPurchase) comes straight from
 * `ForcePowerDisplay.treeNodes` (`useForcePowers.ts`'s `buildForcePowerTree`,
 * pure, already computed for `allForcePowers` — not recomputed here).
 */
export function MobileForceUpgradeSheet({
  open, onClose, power, xpAvailable, forceRating, onRequestPurchase, onPurchaseForceAbility,
}: MobileForceUpgradeSheetProps) {
  if (!power) return null

  const nodes = power.treeNodes
    .filter(n => n.cost > 0)
    .sort((a, b) => a.row - b.row || a.col - b.col)

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      collapsedHeight="70dvh"
      expandedHeight="85dvh"
      footer={<button type="button" className="m-sheet-btn" onClick={onClose}>Close</button>}
    >
      <div className="m-detail-eyebrow">Force Power · {power.purchasedCount}/{power.totalCount} abilities</div>
      <div className="m-detail-name">{power.powerName}</div>
      {power.description && (
        <div className="m-detail-desc"><RichText text={power.description} /></div>
      )}

      <div className="m-detail-eyebrow m-detail-eyebrow-spaced">Upgrades</div>
      {nodes.length === 0 ? (
        <div className="m-detail-sub">No upgrade nodes.</div>
      ) : (
        nodes.map(node => {
          const atMax = node.purchased
          const affordable = xpAvailable >= node.cost
          const forceOk = forceRating >= 1
          const canBuy = !atMax && node.canPurchase && affordable && forceOk
          const disabledReason = atMax
            ? undefined
            : !node.canPurchase
              ? 'Prerequisite not owned.'
              : !forceOk
                ? 'Force Rating 1 required.'
                : !affordable
                  ? `Not enough XP — need ${node.cost}, have ${xpAvailable}.`
                  : undefined
          return (
            <div key={`${node.row}-${node.col}`} className="m-crit-card">
              <div className="m-crit-head">
                <span className="m-crit-name">{node.name}</span>
                <span className="m-xp-value">{node.cost} XP</span>
              </div>
              {node.description && <div className="m-crit-desc"><RichText text={node.description} /></div>}
              {atMax ? (
                <div className="m-item-state-tag">Owned</div>
              ) : (
                <>
                  <button
                    type="button"
                    className="m-crit-heal-btn"
                    disabled={!canBuy}
                    onClick={() => onRequestPurchase(
                      `Force: ${power.powerName} — ${node.name}`,
                      node.cost,
                      () => onPurchaseForceAbility(node.abilityKey, node.row, node.col, node.cost, power.powerKey),
                    )}
                  >
                    Purchase
                  </button>
                  {disabledReason && <div className="m-purchase-disabled-reason">{disabledReason}</div>}
                </>
              )}
            </div>
          )
        })
      )}
    </MobileBottomSheet>
  )
}
