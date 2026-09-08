'use client'

import type { HudSkill } from '@/lib/types'
import { MobileBottomSheet } from './MobileBottomSheet'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/lib/tokens'

// Display-only — the SAME formula handleBuySkill (useCharacterData.ts) uses
// internally to compute and enforce the real cost, duplicated here only to
// preview it before commit. Never used as the purchase decision: the actual
// gate is handleBuySkill's own internal check, called through unmodified.
function nextRankCost(nextRank: number, isCareer: boolean): number {
  return nextRank * 5 + (isCareer ? 0 : 5)
}

function DicePool({ pool }: { pool: Partial<Record<DiceType, number>> }) {
  const order: DiceType[] = ['proficiency', 'ability', 'boost']
  const dice = order.flatMap(type => Array.from({ length: pool[type] ?? 0 }).map((_, i) => (
    <DiceFace key={`${type}-${i}`} type={type} size={22} />
  )))
  if (dice.length === 0) return <span className="m-detail-sub">Untrained</span>
  return <div className="m-feed-dice-row">{dice}</div>
}

export interface MobileSkillDetailSheetProps {
  open: boolean
  onClose: () => void
  skill: HudSkill | null
  xpAvailable: number
  onRequestPurchase: (label: string, cost: number, execute: () => Promise<unknown>) => void
  onBuySkill: (skillKey: string, currentRank: number, isCareer: boolean) => Promise<void>
}

export function MobileSkillDetailSheet({ open, onClose, skill, xpAvailable, onRequestPurchase, onBuySkill }: MobileSkillDetailSheetProps) {
  if (!skill) return null

  const atMax = skill.rank >= 5
  const nextRank = skill.rank + 1
  const cost = nextRankCost(nextRank, skill.isCareer)
  const affordable = xpAvailable >= cost
  const canBuy = !atMax && affordable
  const disabledReason = atMax
    ? 'Already at maximum rank (5).'
    : !affordable
      ? `Not enough XP — need ${cost}, have ${xpAvailable}.`
      : undefined

  const currentPool = getSkillPool(skill.charVal, skill.rank)

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      collapsedHeight="60dvh"
      expandedHeight="75dvh"
      footer={
        <>
          <button type="button" className="m-sheet-btn" onClick={onClose}>Close</button>
          <button
            type="button"
            className="m-sheet-btn is-primary"
            disabled={!canBuy}
            onClick={() => onRequestPurchase(
              `Skill: ${skill.name} — Rank ${nextRank}`,
              cost,
              () => onBuySkill(skill.key, skill.rank, skill.isCareer),
            )}
          >
            Purchase
          </button>
        </>
      }
    >
      <div className="m-detail-eyebrow">{skill.charKey.toUpperCase()} {skill.charVal} · {skill.isCareer ? 'Career' : 'Non-career'}</div>
      <div className="m-detail-name">{skill.name}</div>

      <div className="m-detail-grid">
        <div className="m-detail-grid-item">
          <span className="m-detail-grid-label">Current Rank</span>
          <span className="m-detail-grid-value">{skill.rank}</span>
        </div>
        <div className="m-detail-grid-item">
          <span className="m-detail-grid-label">Next Rank</span>
          <span className="m-detail-grid-value">{atMax ? '—' : nextRank}</span>
        </div>
        <div className="m-detail-grid-item">
          <span className="m-detail-grid-label">Cost</span>
          <span className="m-detail-grid-value">{atMax ? '—' : `${cost} XP`}</span>
        </div>
      </div>

      <div className="m-detail-eyebrow m-detail-eyebrow-spaced">Current Dice Pool</div>
      <DicePool pool={currentPool} />

      {disabledReason && <div className="m-purchase-disabled-reason">{disabledReason}</div>}
    </MobileBottomSheet>
  )
}
