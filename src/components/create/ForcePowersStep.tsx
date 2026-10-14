'use client'

import type { CSSProperties } from 'react'
import { HudCard } from '@/components/ui/HudCard'
import { FS, SP, RADIUS, EASE } from '@/lib/tokens'

export interface PowerUpgradeChoice { row: number; col: number; key: string; name: string }
export interface ForcePowerChoice {
  key: string
  name: string
  /** Row 0 / col 0 ability key — the Basic Power node. */
  basicKey: string | null
  /** Accessible (row 1) non-Mastery upgrades — offered only when the same
   * power is picked as both Career Power and Bonus Career Power. */
  upgrades: PowerUpgradeChoice[]
}

interface Props {
  careerName: string
  specName: string
  careerChoices: ForcePowerChoice[]
  bonusChoices: ForcePowerChoice[]
  careerPick: string
  bonusPick: string
  /** `${row}-${col}` of the free upgrade, or ''. */
  upgradePick: string
  onCareerPick: (key: string) => void
  onBonusPick: (key: string) => void
  onUpgradePick: (pos: string) => void
  onConfirm: () => void
  onBack: () => void
}

const label: CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: FS.overline, fontWeight: 600,
  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)',
  marginBottom: SP[1],
}
const hint: CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: FS.sm, color: 'var(--hud-text-dim)', margin: 0, lineHeight: 1.6,
}

function choiceStyle(active: boolean): CSSProperties {
  return {
    flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer',
    padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.md,
    fontFamily: 'var(--font-body)', fontSize: FS.sm, fontWeight: active ? 700 : 500,
    color: active ? 'var(--hud-accent)' : 'var(--hud-text-dim)',
    background: active ? 'color-mix(in srgb, var(--hud-accent) 12%, transparent)' : 'transparent',
    border: `1px solid ${active ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
    transition: EASE.default,
  }
}

function PickGroup({ title, source, choices, pick, onPick }: {
  title: string
  source: string
  choices: ForcePowerChoice[]
  pick: string
  onPick: (key: string) => void
}) {
  return (
    <div>
      <div style={label}>{title} — {source}</div>
      <div style={{ display: 'flex', gap: SP[1] }}>
        {choices.map(c => (
          <button key={c.key} type="button" aria-pressed={pick === c.key} onClick={() => onPick(c.key)} style={choiceStyle(pick === c.key)}>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ForcePowersStep({
  careerName, specName, careerChoices, bonusChoices, careerPick, bonusPick, upgradePick,
  onCareerPick, onBonusPick, onUpgradePick, onConfirm, onBack,
}: Props) {
  const samePower = !!careerPick && careerPick === bonusPick
  const sameChoice = samePower ? careerChoices.find(c => c.key === careerPick) : undefined
  const needsUpgrade = !!sameChoice && sameChoice.upgrades.length > 0
  const hasBonus = bonusChoices.length > 0
  const canContinue = !!careerPick && (!hasBonus || !!bonusPick) && (!needsUpgrade || !!upgradePick)

  const remaining = (careerPick ? 0 : 1) + (hasBonus && !bonusPick ? 1 : 0) + (needsUpgrade && !upgradePick ? 1 : 0)

  return (
    <HudCard title="Force Powers" animClass="au d1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>
        <p style={hint}>
          Your Career and Specialization each grant a Force Power&apos;s Basic Power at no XP cost.
          Every Career Power you have also costs 5 XP less to buy the Basic Power for later.
        </p>

        <PickGroup title="Career Power" source={careerName} choices={careerChoices} pick={careerPick} onPick={onCareerPick} />
        {hasBonus && (
          <PickGroup title="Bonus Career Power" source={specName} choices={bonusChoices} pick={bonusPick} onPick={onBonusPick} />
        )}

        {needsUpgrade && sameChoice && (
          <div>
            <div style={label}>Free upgrade — {sameChoice.name}</div>
            <p style={{ ...hint, marginBottom: SP[1] }}>
              You chose {sameChoice.name} for both, so you also gain one accessible upgrade for free.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
              {sameChoice.upgrades.map(u => {
                const pos = `${u.row}-${u.col}`
                return (
                  <button key={pos} type="button" aria-pressed={upgradePick === pos} onClick={() => onUpgradePick(pos)} style={{ ...choiceStyle(upgradePick === pos), flex: '0 1 auto' }}>
                    {u.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: SP[2], marginTop: SP[1] }}>
          <button type="button" onClick={onBack} style={{ ...choiceStyle(false), flex: 1, textAlign: 'center' }}>← BACK</button>
          <button
            type="button" onClick={onConfirm} disabled={!canContinue}
            style={{ ...choiceStyle(true), flex: 2, textAlign: 'center', opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'default' }}
          >
            {canContinue ? 'CONFIRM FORCE POWERS →' : `PICK ${remaining} MORE`}
          </button>
        </div>
      </div>
    </HudCard>
  )
}
