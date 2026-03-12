'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { DicePoolDisplay } from '../ui/DiceHex'
import { calculateDicePool } from '@/lib/dice'
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
      <div style={scrollable ? { overflowY: 'auto', flex: 1 } : undefined}>
        {skills.map((sk, i) => {
          const pool = calculateDicePool(sk.characteristicValue, sk.rank)
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.25rem 0',
              borderBottom: i < skills.length - 1 ? '1px solid rgba(216,208,196,.5)' : 'none',
              fontSize: 'var(--font-sm)',
            }}>
              <span style={{
                flex: 1, fontWeight: sk.isCareer ? 600 : 500,
                color: sk.isCareer ? '#9E7E1E' : 'var(--txt)',
              }}>
                {sk.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
                color: 'var(--txt3)', width: '1.6rem', textAlign: 'center',
              }}>
                {sk.characteristic}
              </span>
              <span style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                fontWeight: 700, color: 'var(--ink)',
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
                    fontSize: 'var(--font-sm)', color: 'var(--red)', fontWeight: 700,
                    transition: '.2s', flexShrink: 0,
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
                    background: 'none', border: '1px solid var(--bdr-l)',
                    width: '1.2rem', height: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--font-sm)', color: 'var(--gold-d)', fontWeight: 700,
                    transition: '.2s', flexShrink: 0,
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
        <AlertDialogContent style={{ fontFamily: 'var(--font-chakra)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-body)',
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Buy {confirmSkill?.name} Rank {confirmSkill ? confirmSkill.rank + 1 : 0}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: 1.6, color: 'var(--txt2)' }}>
                <span style={{
                  fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                  color: 'var(--gold-d)',
                }}>
                  {confirmCost} XP
                </span>
                {' '}will be spent.
                {xpAvailable !== undefined && (
                  <>
                    {' '}You have{' '}
                    <span style={{
                      fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                      color: 'var(--blue)',
                    }}>
                      {xpAvailable} XP
                    </span>
                    {' '}available.
                  </>
                )}
                {confirmSkill && !confirmSkill.isCareer && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)',
                    color: 'var(--txt3)', marginTop: '4px',
                  }}>
                    Non-career skill (+5 XP surcharge)
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)',
              fontWeight: 600, letterSpacing: '0.1em',
            }}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { confirmSkill?.onBuy?.(); setConfirmSkill(null) }}
              style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)',
                fontWeight: 700, letterSpacing: '0.1em',
                background: 'var(--gold)', color: '#fff',
              }}
            >
              CONFIRM PURCHASE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reduce confirmation dialog (GM mode) */}
      <AlertDialog open={!!confirmReduce} onOpenChange={(open) => !open && setConfirmReduce(null)}>
        <AlertDialogContent style={{ fontFamily: 'var(--font-chakra)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-body)',
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Reduce {confirmReduce?.name} Rank {confirmReduce?.rank} → {confirmReduce ? confirmReduce.rank - 1 : 0}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: 1.6, color: 'var(--txt2)' }}>
                Refund{' '}
                <span style={{
                  fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                  color: 'var(--green)',
                }}>
                  {refundAmount} XP
                </span>
                {' '}to the character.
                {confirmReduce && !confirmReduce.isCareer && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)',
                    color: 'var(--txt3)', marginTop: '4px',
                  }}>
                    Non-career skill (includes +5 XP surcharge refund)
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)',
              fontWeight: 600, letterSpacing: '0.1em',
            }}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { confirmReduce?.onReduce?.(); setConfirmReduce(null) }}
              style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)',
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
