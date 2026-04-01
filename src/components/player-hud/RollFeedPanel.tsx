'use client'

import { C, SYM, FONT_CINZEL, FONT_RAJDHANI, panelBase, type DiceType } from './design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import type { RollEntry } from '@/hooks/useRollFeed'

interface RollFeedPanelProps {
  rolls: RollEntry[]
  ownCharacterId: string
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
    </>
  )
}

function DiePip({ type }: { type: DiceType }) {
  return <DiceFace type={type} size={14} />
}

function RollCard({ roll, isOwn }: { roll: RollEntry; isOwn: boolean }) {
  const succeeded = roll.result.succeeded
  const isHidden = roll.hidden && roll.is_dm && !isOwn

  const leftBorder = isOwn
    ? `2px solid ${C.gold}`
    : roll.is_dm
      ? '2px solid #9060D0'
      : `2px solid ${C.border}`

  // Build die list from pool
  const dieList: DiceType[] = []
  for (const [type, count] of Object.entries(roll.pool) as [DiceType, number][]) {
    for (let i = 0; i < count; i++) dieList.push(type)
  }

  return (
    <div style={{
      ...panelBase,
      padding: '10px 12px',
      borderLeft: leftBorder,
      animation: 'hudTabIn 0.25s ease forwards',
    }}>
      <CornerBrackets />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: isHidden ? C.textFaint : succeeded ? '#4EC87A' : '#E05050',
          boxShadow: isHidden ? 'none' : `0 0 6px ${succeeded ? '#4EC87A' : '#E05050'}60`,
        }} />
        <span style={{ fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 600, color: C.gold, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {roll.is_dm ? 'GM' : roll.character_name}
        </span>
        {roll.roll_label && (
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: C.textDim, whiteSpace: 'nowrap' }}>
            {roll.roll_label}
          </span>
        )}
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>

      {isHidden ? (
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: C.textFaint, fontStyle: 'italic' }}>
          [Hidden from players]
        </div>
      ) : (
        <>
          {/* Net result */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 700,
              color: succeeded ? '#4EC87A' : '#E05050',
            }}>
              {succeeded ? 'SUCCESS' : 'FAILURE'}
            </span>
            {roll.result.netSuccess !== 0 && (
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, color: roll.result.netSuccess > 0 ? SYM.S.color : SYM.F.color }}>
                {roll.result.netSuccess > 0 ? SYM.S.icon : SYM.F.icon} {Math.abs(roll.result.netSuccess)}
              </span>
            )}
            {roll.result.netAdvantage !== 0 && (
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, color: roll.result.netAdvantage > 0 ? SYM.A.color : SYM.H.color }}>
                {roll.result.netAdvantage > 0 ? SYM.A.icon : SYM.H.icon} {Math.abs(roll.result.netAdvantage)}
              </span>
            )}
            {roll.result.triumph > 0 && (
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, color: SYM.T.color }}>{SYM.T.icon} {roll.result.triumph}</span>
            )}
            {roll.result.despair > 0 && (
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, color: SYM.D.color }}>{SYM.D.icon} {roll.result.despair}</span>
            )}
          </div>

          {/* Dice pip row */}
          {dieList.length > 0 && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {dieList.map((type, i) => <DiePip key={i} type={type} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function RollFeedPanel({ rolls, ownCharacterId }: RollFeedPanelProps) {
  if (rolls.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 48, fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textFaint,
      }}>
        No rolls yet this session.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: C.textDim, marginBottom: 4,
      }}>
        Live Table Roll History
      </div>
      {[...rolls].reverse().map(roll => (
        <RollCard
          key={roll.id}
          roll={roll}
          isOwn={roll.character_id === ownCharacterId}
        />
      ))}
    </div>
  )
}

/** Compact 3-roll mini feed for the right column */
export function RollFeedMini({ rolls, ownCharacterId, onExpand }: {
  rolls: RollEntry[]
  ownCharacterId: string
  onExpand: () => void
}) {
  const last3 = [...rolls].slice(-3).reverse()
  if (last3.length === 0) return null

  return (
    <div style={{ ...panelBase, padding: '10px 12px' }}>
      <CornerBrackets />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim }}>
          Latest Rolls
        </div>
        <button
          onClick={onExpand}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: '0.08em' }}
        >
          All →
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {last3.map(roll => {
          const isOwn = roll.character_id === ownCharacterId
          const succeeded = roll.result.succeeded
          const isHidden = roll.hidden && roll.is_dm && !isOwn
          const leftColor = isOwn ? C.gold : roll.is_dm ? '#9060D0' : C.border
          return (
            <div
              key={roll.id}
              onClick={onExpand}
              style={{
                padding: '5px 8px', borderRadius: 3, cursor: 'pointer',
                borderLeft: `2px solid ${leftColor}`,
                background: 'transparent', transition: '.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}08` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_CINZEL, fontSize: 12, color: C.gold }}>
                  {roll.is_dm ? 'GM' : roll.character_name}
                </span>
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, color: C.textFaint }}>
                  {relativeTime(roll.rolled_at)}
                </span>
              </div>
              {isHidden ? (
                <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textFaint }}>[Hidden]</div>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: succeeded ? '#4EC87A' : '#E05050' }}>
                    {succeeded ? 'SUCCESS' : 'FAILURE'}
                  </span>
                  {roll.result.netSuccess !== 0 && (
                    <span style={{ fontSize: 12, color: roll.result.netSuccess > 0 ? SYM.S.color : SYM.F.color }}>
                      {roll.result.netSuccess > 0 ? SYM.S.icon : SYM.F.icon}{Math.abs(roll.result.netSuccess)}
                    </span>
                  )}
                  {roll.result.netAdvantage !== 0 && (
                    <span style={{ fontSize: 12, color: roll.result.netAdvantage > 0 ? SYM.A.color : SYM.H.color }}>
                      {roll.result.netAdvantage > 0 ? SYM.A.icon : SYM.H.icon}{Math.abs(roll.result.netAdvantage)}
                    </span>
                  )}
                  {roll.result.triumph > 0 && <span style={{ fontSize: 13, color: SYM.T.color }}>{SYM.T.icon}</span>}
                  {roll.result.despair > 0 && <span style={{ fontSize: 13, color: SYM.D.color }}>{SYM.D.icon}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
