// ─────────────────────────────────────────────────────────────────────────────
// buildTalentTree — shared talent-tree data builder
//
// Converts a RefSpecialization + a set of purchased (row-col) keys into the
// TalentTreeNode[] + TalentTreeConnection[] arrays that <TalentTree> consumes.
//
// Used by:
//   • PlayerHUDDesktop  (in-play spec tree display & purchase)
//   • XpInvestmentStep  (character creator talent selection)
// ─────────────────────────────────────────────────────────────────────────────

import { ACTIVATION_LABELS } from '@/lib/types'
import type { RefSpecialization, RefTalent } from '@/lib/types'
import type { TalentTreeNode, TalentTreeConnection } from '@/components/character/TalentTree'

export function buildTalentTree(
  spec: RefSpecialization,
  refTalentMap: Record<string, RefTalent>,
  /** Set of "<row>-<col>" strings for already-purchased nodes in this spec */
  purchasedSet: Set<string>,
): { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null {
  if (!spec?.talent_tree?.rows) return null

  const nodes: TalentTreeNode[] = []
  const connections: TalentTreeConnection[] = []

  for (const row of spec.talent_tree.rows) {
    for (let col = 0; col < (row.talents || []).length; col++) {
      const tKey = row.talents[col]
      const ref  = refTalentMap[tKey]
      const isPurchased = purchasedSet.has(`${row.index}-${col}`)
      const dir  = (row.directions || [])[col] || {}

      let canPurchase = false
      if (!isPurchased) {
        if (row.index === 0) {
          canPurchase = true
        } else {
          if (dir.up)              canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
          if (dir.left  && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
          if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
          if (dir.down)            canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
        }
      }

      nodes.push({
        talentKey:   tKey,
        name:        ref?.name || tKey,
        description: ref?.description,
        row:         row.index,
        col,
        purchased:   isPurchased,
        activation:  ref ? (ACTIVATION_LABELS[ref.activation] || ref.activation) : 'Passive',
        isRanked:    ref?.is_ranked || false,
        canPurchase,
      })

      // Horizontal connection (right)
      if (dir.right && col < 3)
        connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
      // Vertical connection (down)
      if (dir.down)
        connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
    }
  }

  return { specName: spec.name, nodes, connections }
}
