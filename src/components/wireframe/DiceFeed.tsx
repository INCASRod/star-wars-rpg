'use client'

import { useState } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, DICE_META, panelBase, SYM, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import type { RollEntry as LiveRollEntry } from '@/hooks/useRollFeed'

// ── Types ─────────────────────────────────────────────────────────────────────

type DieSymbol = 'Y' | 'G' | 'P' | 'B' | 'K'
type Outcome   = 'success' | 'failure' | 'triumph' | 'despair'

interface DiceCount { symbol: DieSymbol; count: number }

interface RollEntry {
  id:            string
  playerName:    string
  characterName: string
  skill:         string
  dice:          DiceCount[]
  resultText:    string
  outcome:       Outcome
  timestamp:     string
  isSelf:        boolean
  isDm:          boolean
}

// ── Placeholder rolls ─────────────────────────────────────────────────────────

const STATIC_ROLLS: RollEntry[] = [
  { id: '1', playerName: 'Alex',   characterName: 'Kira Voss', isDm: false, skill: 'Ranged (Heavy) · Blaster Rifle · Medium', dice: [{ symbol: 'Y', count: 2 }, { symbol: 'G', count: 1 }, { symbol: 'P', count: 2 }],                   resultText: '2 Success, 1 Advantage', outcome: 'success', timestamp: 'Just now',   isSelf: true },
  { id: '2', playerName: 'Jamie',  characterName: 'Rex Thane', isDm: false, skill: 'Athletics (Brawn 4, Rank 2)',               dice: [{ symbol: 'Y', count: 2 }, { symbol: 'G', count: 2 }, { symbol: 'P', count: 2 }, { symbol: 'K', count: 1 }], resultText: 'Failure, 2 Threat',  outcome: 'failure', timestamp: '1 min ago',  isSelf: false },
  { id: '3', playerName: 'Sam',    characterName: 'C-4PQ',     isDm: false, skill: 'Mechanics (Intellect 4, Rank 3)',           dice: [{ symbol: 'Y', count: 3 }, { symbol: 'G', count: 1 }, { symbol: 'P', count: 3 }],                   resultText: '1 Success, 1 Triumph',   outcome: 'triumph', timestamp: '3 min ago',  isSelf: false },
  { id: '4', playerName: 'GM',     characterName: 'GM',        isDm: true,  skill: 'Deception (Cunning 3, Rank 1)',            dice: [{ symbol: 'Y', count: 1 }, { symbol: 'G', count: 2 }, { symbol: 'P', count: 2 }],                   resultText: '1 Despair',              outcome: 'despair', timestamp: '5 min ago',  isSelf: false },
  { id: '5', playerName: 'Alex',   characterName: 'Kira Voss', isDm: false, skill: 'Vigilance (Willpower 2, Rank 0)',          dice: [{ symbol: 'G', count: 2 }, { symbol: 'P', count: 2 }],                                             resultText: 'Failure',                outcome: 'failure', timestamp: '8 min ago',  isSelf: true },
]

// ── Die symbol → design-token color ──────────────────────────────────────────

const SYM_COLOR: Record<DieSymbol, string> = {
  Y: DICE_META.proficiency.color,
  G: DICE_META.ability.color,
  P: DICE_META.difficulty.color,
  B: DICE_META.boost.color,
  K: DICE_META.setback.color,
}

const OUTCOME_COLOR: Record<Outcome, string> = {
  success: '#4EC87A', failure: '#E05050', triumph: '#D4B840', despair: '#FF6060',
}
const OUTCOME_LABEL: Record<Outcome, string> = {
  success: '✦ SUCCESS', failure: '✗ FAILURE', triumph: '★ TRIUMPH', despair: '☠ DESPAIR',
}

// ── Map live roll entry → internal format ─────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function liveToDiceCount(pool: LiveRollEntry['pool']): DiceCount[] {
  const map: Partial<Record<string, DieSymbol>> = { proficiency: 'Y', ability: 'G', difficulty: 'P', challenge: 'P', boost: 'B', setback: 'K' }
  const acc: Partial<Record<DieSymbol, number>> = {}
  for (const [type, count] of Object.entries(pool)) {
    const sym = map[type]
    if (sym && count > 0) acc[sym] = (acc[sym] ?? 0) + count
  }
  return (Object.entries(acc) as [DieSymbol, number][]).map(([symbol, count]) => ({ symbol, count }))
}

function buildResultText(result: LiveRollEntry['result']): string {
  const parts: string[] = []
  if (result.triumph > 0)      parts.push(`${result.triumph} Triumph`)
  if (result.despair > 0)      parts.push(`${result.despair} Despair`)
  const netS = result.netSuccess
  if (netS > 0)  parts.push(`${netS} Success`)
  else if (netS < 0) parts.push(`${Math.abs(netS)} Failure`)
  const netA = result.netAdvantage
  if (netA > 0)  parts.push(`${netA} Advantage`)
  else if (netA < 0) parts.push(`${Math.abs(netA)} Threat`)
  return parts.join('  ·  ') || (result.succeeded ? 'Success' : 'Failure')
}

function buildOutcome(result: LiveRollEntry['result']): Outcome {
  if (result.triumph > 0 && result.succeeded)  return 'triumph'
  if (result.despair > 0 && !result.succeeded) return 'despair'
  return result.succeeded ? 'success' : 'failure'
}

function liveToEntry(live: LiveRollEntry, ownId?: string): RollEntry {
  return {
    id: live.id, isDm: live.is_dm,
    playerName:    live.is_dm ? 'GM' : live.character_name,
    characterName: live.character_name,
    skill:         live.roll_label || 'Unknown check',
    dice:          liveToDiceCount(live.pool),
    resultText:    buildResultText(live.result),
    outcome:       buildOutcome(live.result),
    timestamp:     relativeTime(live.rolled_at),
    isSelf:        !live.is_dm && live.character_id === ownId,
  }
}

// ── Mini die pip ──────────────────────────────────────────────────────────────

function DiePip({ symbol, count }: DiceCount) {
  const color = SYM_COLOR[symbol]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginRight: 4 }}>
      <span style={{
        width: 16, height: 16, border: `1px solid ${color}`,
        background: `${color}15`, borderRadius: 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_CINZEL, fontWeight: 700, fontSize: FS_OVERLINE, color,
      }}>
        {symbol}
      </span>
      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim }}>{count}</span>
    </span>
  )
}

// ── Roll card ─────────────────────────────────────────────────────────────────

function RollCard({ roll }: { roll: RollEntry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text =
      `${roll.characterName} (${roll.playerName}) — ${roll.skill}\n` +
      `Pool: ${roll.dice.map(d => `${d.count}${d.symbol}`).join(' ')}\n` +
      `Result: ${roll.resultText}`
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* noop */ }
  }

  const outcomeColor = OUTCOME_COLOR[roll.outcome]
  const leftColor    = roll.isSelf ? C.gold : roll.isDm ? '#9060D0' : C.border

  return (
    <div style={{
      ...panelBase,
      padding: '10px 12px',
      borderLeft: `2px solid ${leftColor}`,
      animation: 'hudTabIn 0.2s ease forwards',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: outcomeColor,
          boxShadow: `0 0 5px ${outcomeColor}80`,
        }} />
        <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 600, color: roll.isSelf ? C.gold : C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {roll.isDm ? 'GM' : roll.characterName}
        </span>
        {roll.isSelf && (
          <span style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, border: `1px solid ${C.gold}50`, borderRadius: 2, padding: '0 4px' }}>
            YOU
          </span>
        )}
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, whiteSpace: 'nowrap', marginLeft: 2 }}>
          {roll.skill}
        </span>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textFaint, whiteSpace: 'nowrap' }}>
          {roll.timestamp}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3,
            padding: '1px 6px', cursor: 'pointer',
            fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: copied ? '#4EC87A' : C.textDim,
            transition: '.15s', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      {/* Dice pips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
        {roll.dice.map(d => <DiePip key={d.symbol} {...d} />)}
      </div>

      {/* Result */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700, color: outcomeColor, letterSpacing: '0.08em' }}>
          {OUTCOME_LABEL[roll.outcome]}
        </span>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim }}>
          {roll.resultText}
        </span>
      </div>
    </div>
  )
}

// ── Result symbols legend ─────────────────────────────────────────────────────

function SymLegend() {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {(Object.entries(SYM) as [string, typeof SYM[keyof typeof SYM]][]).map(([key, s]) => (
        <span key={key} style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <i className={`ffi ffi-${s.icon}`} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DiceFeedProps {
  liveRolls?:      LiveRollEntry[]
  ownCharacterId?: string
  campaignName?:   string
}

export function DiceFeed({ liveRolls, ownCharacterId, campaignName }: DiceFeedProps) {
  const [filter, setFilter] = useState<'All' | 'Mine'>('All')

  const ROLLS: RollEntry[] = liveRolls
    ? [...liveRolls].reverse().map(r => liveToEntry(r, ownCharacterId))
    : STATIC_ROLLS

  const visible = filter === 'Mine' ? ROLLS.filter(r => r.isSelf) : ROLLS

  const filterBtn = (f: 'All' | 'Mine') => ({
    background: filter === f ? `${C.gold}20` : 'transparent',
    border: `1px solid ${filter === f ? C.gold : C.border}`,
    borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
    fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: filter === f ? C.gold : C.textDim, transition: '.15s',
  })

  return (
    <div style={{ ...panelBase, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDim, marginBottom: 2 }}>
            SHARED ROLL FEED
          </div>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: C.gold }}>
            {campaignName ?? 'Legacy of Rebellion'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => setFilter('All')}  style={filterBtn('All')}>All</button>
          <button onClick={() => setFilter('Mine')} style={filterBtn('Mine')}>Mine</button>
        </div>
      </div>

      {/* ── Roll list ── */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '32rem', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint, fontStyle: 'italic' }}>
            No rolls to show
          </div>
        ) : visible.map(roll => (
          <RollCard key={roll.id} roll={roll} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <SymLegend />
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textFaint, flexShrink: 0 }}>
          {ROLLS.length} total
        </span>
      </div>

    </div>
  )
}
