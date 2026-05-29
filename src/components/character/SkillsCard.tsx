'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { DicePoolDisplay } from '../ui/DiceHex'
import { calculateDicePool } from '@/lib/dice'
import { HUD, FS, FONT_BODY, EASE } from '@/lib/tokens'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface SkillDisplay {
  name: string
  characteristic: string
  characteristicValue: number
  rank: number
  isCareer: boolean
  skillKey?: string
  onBuy?: () => void
  onReduce?: () => void
}

interface SkillsCardProps {
  title: string
  skills: SkillDisplay[]
  animClass?: string
  scrollable?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  xpAvailable?: number
  isGmMode?: boolean
}

export function SkillsCard({ title, skills, animClass = 'ar d1', scrollable = false, collapsible, defaultCollapsed, xpAvailable, isGmMode }: SkillsCardProps) {
  const [confirmSkill, setConfirmSkill] = useState<SkillDisplay | null>(null)
  const [confirmReduce, setConfirmReduce] = useState<SkillDisplay | null>(null)

  // Dynamic layout styles — kept as inline styles because they depend on the `scrollable` prop
  const cardStyle: React.CSSProperties = scrollable
    ? { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
    : {}

  const confirmCost = confirmSkill
    ? (confirmSkill.rank + 1) * 5 + (confirmSkill.isCareer ? 0 : 5)
    : 0

  const refundAmount = confirmReduce
    ? confirmReduce.rank * 5 + (confirmReduce.isCareer ? 0 : 5)
    : 0

  return (
    <HudCard title={title} animClass={animClass} style={cardStyle} collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
      {/* Dynamic overflow — kept as inline style because it depends on the `scrollable` prop */}
      <div style={scrollable ? { overflowY: 'auto', flex: 1 } : undefined}>
        {skills.map((sk, i) => {
          const pool = calculateDicePool(sk.characteristicValue, sk.rank)
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.25rem 0',
              // Dynamic border — depends on position in list
              borderBottom: i < skills.length - 1 ? `1px solid ${HUD.border}` : 'none',
              fontSize: FS.sm,
            }}>
              <span style={{
                flex: 1, fontWeight: sk.isCareer ? 600 : 500,
                // Dynamic color — depends on isCareer runtime value
                color: sk.isCareer ? 'var(--hud-accent)' : HUD.text,
              }}>
                {sk.name}
              </span>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.sm,
                color: HUD.textFaint, width: '1.6rem', textAlign: 'center',
              }}>
                {sk.characteristic}
              </span>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.sm,
                fontWeight: 700, color: HUD.text,
                width: '1.1rem', textAlign: 'center',
              }}>
                {sk.rank}
              </span>
              <DicePoolDisplay proficiency={pool.proficiency} ability={pool.ability} />
              {isGmMode && sk.rank > 0 && sk.onReduce && (
                <button
                  onClick={() => setConfirmReduce(sk)}
                  title={`Reduce rank (refund ${sk.rank * 5 + (sk.isCareer ? 0 : 5)} XP)`}
                  style={{
                    background: 'none', border: '1px solid var(--red)',
                    width: '1.2rem', height: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: FS.sm, color: 'var(--red)', fontWeight: 700,
                    transition: EASE.default, flexShrink: 0,
                  }}
                >
                  −
                </button>
              )}
              {sk.rank < 5 && sk.onBuy && (
                <button
                  onClick={() => setConfirmSkill(sk)}
                  title={`Buy rank ${sk.rank + 1} (${(sk.rank + 1) * 5 + (sk.isCareer ? 0 : 5)} XP)`}
                  style={{
                    background: 'none', border: `1px solid ${HUD.borderHi}`,
                    width: '1.2rem', height: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: FS.sm, color: 'var(--hud-accent)', fontWeight: 700,
                    transition: EASE.default, flexShrink: 0,
                  }}
                >
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Buy confirmation dialog */}
      <AlertDialog open={!!confirmSkill} onOpenChange={(open) => !open && setConfirmSkill(null)}>
        <AlertDialogContent style={{ fontFamily: FONT_BODY }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: FONT_BODY, fontSize: FS.body,
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Buy {confirmSkill?.name} Rank {confirmSkill ? confirmSkill.rank + 1 : 0}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: FS.sm, lineHeight: 1.6, color: HUD.textDim }}>
                <span style={{
                  fontFamily: FONT_BODY, fontWeight: 700,
                  color: 'var(--hud-accent)',
                }}>
                  {confirmCost} XP
                </span>
                {' '}will be spent.
                {xpAvailable !== undefined && (
                  <>
                    {' '}You have{' '}
                    <span style={{
                      fontFamily: FONT_BODY, fontWeight: 700,
                      color: 'var(--blue)',
                    }}>
                      {xpAvailable} XP
                    </span>
                    {' '}available.
                  </>
                )}
                {confirmSkill && !confirmSkill.isCareer && (
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption,
                    color: HUD.textFaint, marginTop: '4px',
                  }}>
                    Non-career skill (+5 XP surcharge)
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{
              fontFamily: FONT_BODY, fontSize: FS.caption,
              fontWeight: 600, letterSpacing: '0.1em',
            }}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { confirmSkill?.onBuy?.(); setConfirmSkill(null) }}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption,
                fontWeight: 700, letterSpacing: '0.1em',
                background: 'var(--hud-accent)', color: 'var(--hud-vital-text)',
              }}
            >
              CONFIRM PURCHASE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reduce confirmation dialog (GM mode) */}
      <AlertDialog open={!!confirmReduce} onOpenChange={(open) => !open && setConfirmReduce(null)}>
        <AlertDialogContent style={{ fontFamily: FONT_BODY }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: FONT_BODY, fontSize: FS.body,
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Reduce {confirmReduce?.name} Rank {confirmReduce?.rank} → {confirmReduce ? confirmReduce.rank - 1 : 0}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: FS.sm, lineHeight: 1.6, color: HUD.textDim }}>
                Refund{' '}
                <span style={{
                  fontFamily: FONT_BODY, fontWeight: 700,
                  color: 'var(--green)',
                }}>
                  {refundAmount} XP
                </span>
                {' '}to the character.
                {confirmReduce && !confirmReduce.isCareer && (
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption,
                    color: HUD.textFaint, marginTop: '4px',
                  }}>
                    Non-career skill (includes +5 XP surcharge refund)
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{
              fontFamily: FONT_BODY, fontSize: FS.caption,
              fontWeight: 600, letterSpacing: '0.1em',
            }}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { confirmReduce?.onReduce?.(); setConfirmReduce(null) }}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.caption,
                fontWeight: 700, letterSpacing: '0.1em',
                background: 'var(--red)', color: '#fff',
              }}
            >
              CONFIRM REFUND
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HudCard>
  )
}
