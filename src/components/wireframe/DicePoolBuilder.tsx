'use client'

import { useState, Fragment } from 'react'
import { WT } from './wf-tokens'
import { C, FONT_CINZEL, FONT_RAJDHANI, DICE_META, panelBase, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import { rollPool, type RollResult } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'

// ── Types ────────────────────────────────────────────────────────────────────

type RangeBand  = 'Engaged' | 'Short' | 'Medium' | 'Long' | 'Extreme'
type WeaponMode = 'Ranged' | 'Melee' | 'Skill'
type DieSymbol  = 'Y' | 'G' | 'P' | 'B' | 'K'

const RANGE_PURPLE: Record<RangeBand, number> = {
  Engaged: 1, Short: 1, Medium: 2, Long: 3, Extreme: 4,
}
const RANGE_BANDS: RangeBand[] = ['Engaged', 'Short', 'Medium', 'Long', 'Extreme']

export interface DiceConfig {
  characteristicName: string
  characteristicVal:  number
  skillName:          string
  skillRank:          number
  weaponMode:         WeaponMode
  weaponName?:        string
}

const PLACEHOLDER: DiceConfig = {
  characteristicName: 'Agility',
  characteristicVal:  3,
  skillName:          'Ranged (Heavy)',
  skillRank:          2,
  weaponMode:         'Ranged',
  weaponName:         'Blaster Rifle',
}

// ── Die symbol → DiceType color mapping ──────────────────────────────────────

const SYM_COLOR: Record<DieSymbol, string> = {
  Y: DICE_META.proficiency.color,
  G: DICE_META.ability.color,
  P: DICE_META.difficulty.color,
  B: DICE_META.boost.color,
  K: DICE_META.setback.color,
}

const SYM_LABEL: Record<DieSymbol, string> = {
  Y: 'PROF', G: 'ABIL', P: 'DIFF', B: 'BOOST', K: 'SETBK',
}

// ── Die icon ─────────────────────────────────────────────────────────────────

function Die({ symbol, source }: { symbol: DieSymbol; source: string }) {
  const color = SYM_COLOR[symbol]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: '3rem' }}>
      <div style={{
        width: 36, height: 36,
        border: `2px solid ${color}`,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_CINZEL, fontWeight: 700, fontSize: FS_SM, color,
        borderRadius: 4,
      }}>
        {symbol}
      </div>
      <span style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.1em', color }}>
        {SYM_LABEL[symbol]}
      </span>
      {source && (
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textAlign: 'center', maxWidth: '3.5rem', lineHeight: 1.2 }}>
          {source}
        </span>
      )}
    </div>
  )
}

// ── Pool calculation ──────────────────────────────────────────────────────────

function calcPool(cfg: DiceConfig, range: RangeBand, boost: number, setback: number) {
  const { characteristicVal: ch, characteristicName, skillRank: sk, weaponMode } = cfg

  const yellow = Math.min(ch, sk)
  const green  = Math.abs(ch - sk)
  const purple =
    weaponMode === 'Melee'  ? 2 :
    weaponMode === 'Ranged' ? RANGE_PURPLE[range] : 2
  const purpleSource =
    weaponMode === 'Melee'  ? 'Melee (fixed)' :
    weaponMode === 'Ranged' ? `Range: ${range}` : 'Difficulty 2'

  const dice: { symbol: DieSymbol; source: string }[] = []
  for (let i = 0; i < yellow; i++) dice.push({ symbol: 'Y', source: i === 0 ? `${characteristicName} ${ch}` : `Rank ${sk}` })
  for (let i = 0; i < green;  i++) dice.push({ symbol: 'G', source: sk > ch ? `Rank ${sk}` : `${characteristicName} ${ch}` })
  for (let i = 0; i < boost;  i++) dice.push({ symbol: 'B', source: i === 0 ? 'Aim/Assist' : 'Talent' })

  const dividerIdx = dice.length

  for (let i = 0; i < purple;  i++) dice.push({ symbol: 'P', source: i === 0 ? purpleSource : '' })
  for (let i = 0; i < setback; i++) dice.push({ symbol: 'K', source: i === 0 ? 'Cover/wounds' : '' })

  const pos = [yellow > 0 ? `${yellow}Y` : '', green > 0 ? `${green}G` : '', boost > 0 ? `${boost}B` : ''].filter(Boolean).join('+') || '—'
  const neg = [`${purple}P`, setback > 0 ? `${setback}K` : ''].filter(Boolean).join('+')

  return { dice, dividerIdx, formulaPos: pos, formulaNeg: neg, yellow, green, purple }
}

function formatResult(result: RollResult): { text: string; succeeded: boolean } {
  const { net } = result
  const parts: string[] = []
  if (net.triumph > 0)  parts.push(`${net.triumph} Triumph`)
  if (net.despair > 0)  parts.push(`${net.despair} Despair`)
  const netS = net.success
  if (netS > 0) parts.push(`${netS} Success`)
  else if (netS < 0) parts.push(`${Math.abs(netS)} Failure`)
  const netA = net.advantage
  if (netA > 0) parts.push(`${netA} Advantage`)
  else if (netA < 0) parts.push(`${Math.abs(netA)} Threat`)
  return { text: parts.join('  ·  ') || (netS >= 0 ? 'Success' : 'Failure'), succeeded: net.success + net.triumph > 0 }
}

// ── Shared label style ────────────────────────────────────────────────────────

const sectionLabel = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: C.textDim, marginBottom: 6, ...extra,
})

// ── Main component ────────────────────────────────────────────────────────────

export function DicePoolBuilder({ config = PLACEHOLDER, onRoll }: {
  config?:  DiceConfig
  onRoll?:  (result: RollResult, label: string, pool: Record<DiceType, number>) => void
}) {
  const [range,      setRange]      = useState<RangeBand>('Medium')
  const [boost,      setBoost]      = useState(0)
  const [setback,    setSetback]    = useState(0)
  const [weaponMode, setWeaponMode] = useState<WeaponMode>(config.weaponMode)
  const [lastResult, setLastResult] = useState<{ text: string; succeeded: boolean } | null>(null)

  const cfg = { ...config, weaponMode }
  const { dice, dividerIdx, formulaPos, formulaNeg, yellow, green, purple } = calcPool(cfg, range, boost, setback)
  const fullFormula = `${cfg.skillName} (${cfg.characteristicName} ${cfg.characteristicVal} + Rank ${cfg.skillRank}) = ${formulaPos} vs ${formulaNeg}`

  const handleRoll = () => {
    const pool: Record<DiceType, number> = { proficiency: yellow, ability: green, boost, challenge: 0, difficulty: purple, setback }
    const result = rollPool(pool)
    const label  = cfg.weaponName ? `${cfg.weaponName} — ${cfg.skillName}` : cfg.skillName
    setLastResult(formatResult(result))
    onRoll?.(result, label, pool)
  }

  const modeBtn = (mode: WeaponMode) => ({
    background: weaponMode === mode ? `${C.gold}20` : 'transparent',
    border: `1px solid ${weaponMode === mode ? C.gold : C.border}`,
    borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
    fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: weaponMode === mode ? C.gold : C.textDim,
    transition: '.15s',
  })

  const rangeBtn = (band: RangeBand) => ({
    background: range === band ? `${C.gold}20` : 'transparent',
    border: `1px solid ${range === band ? C.gold : C.border}`,
    borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
    fontFamily: FONT_RAJDHANI, fontWeight: 600, fontSize: FS_OVERLINE,
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    color: range === band ? C.gold : C.textDim,
    transition: '.15s',
  })

  const counterBtn: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: 3, width: 20, height: 20, cursor: 'pointer',
    fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim,
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  }

  return (
    <div style={{ ...panelBase, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDim, marginBottom: 3 }}>
          DICE POOL BUILDER
        </div>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.gold }}>
          {cfg.weaponName ? `${cfg.weaponName} — ` : ''}{cfg.skillName}
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, marginTop: 2 }}>
          {cfg.characteristicName} {cfg.characteristicVal} · Rank {cfg.skillRank}
        </div>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Mode toggle ── */}
        <div>
          <div style={sectionLabel()}>Check Type</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Ranged', 'Melee', 'Skill'] as WeaponMode[]).map(m => (
              <button key={m} onClick={() => setWeaponMode(m)} style={modeBtn(m)}>{m}</button>
            ))}
          </div>
        </div>

        {/* ── Range band ── */}
        {weaponMode === 'Ranged' && (
          <div>
            <div style={sectionLabel()}>Range Band</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {RANGE_BANDS.map(band => (
                <button key={band} onClick={() => setRange(band)} style={rangeBtn(band)}>
                  {band} <span style={{ opacity: 0.5 }}>{RANGE_PURPLE[band]}P</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Formula ── */}
        <div style={{ background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 10px' }}>
          <div style={sectionLabel({ marginBottom: 3 })}>Formula</div>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, lineHeight: 1.4 }}>
            {fullFormula}
          </div>
        </div>

        {/* ── Dice pool ── */}
        <div>
          <div style={sectionLabel()}>Dice Pool</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '10px 8px', minHeight: 80, background: `${C.gold}04` }}>
            {dice.length === 0 ? (
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint, fontStyle: 'italic' }}>Pool is empty</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
                {dice.map((d, i) => (
                  <Fragment key={i}>
                    {i === dividerIdx && dividerIdx > 0 && (
                      <div style={{ alignSelf: 'center', fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, fontWeight: 700, paddingTop: 4 }}>vs</div>
                    )}
                    <Die symbol={d.symbol} source={d.source} />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Boost / Setback ── */}
        <div>
          <div style={sectionLabel()}>Modifier Dice</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Boost [B]',   value: boost,   set: setBoost,   color: DICE_META.boost.color },
              { label: 'Setback [K]', value: setback, set: setSetback, color: DICE_META.setback.color },
            ].map(({ label, value, set, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.08em', textTransform: 'uppercase', color, width: 80, flexShrink: 0 }}>
                  {label}
                </span>
                <button onClick={() => set(v => Math.max(0, v - 1))} style={counterBtn}>−</button>
                <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color, width: 18, textAlign: 'center' }}>{value}</span>
                <button onClick={() => set(v => v + 1)} style={counterBtn}>+</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Last result ── */}
        {lastResult && (
          <div style={{
            background: lastResult.succeeded ? 'rgba(78,200,122,0.08)' : 'rgba(224,80,80,0.08)',
            border: `1px solid ${lastResult.succeeded ? 'rgba(78,200,122,0.3)' : 'rgba(224,80,80,0.3)'}`,
            borderRadius: 4, padding: '6px 10px',
          }}>
            <div style={sectionLabel({ marginBottom: 3 })}>Last Result</div>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: lastResult.succeeded ? '#4EC87A' : '#E05050' }}>
              {lastResult.text}
            </div>
          </div>
        )}

        {/* ── Roll button ── */}
        <button
          onClick={handleRoll}
          style={{
            width: '100%', padding: '8px 0',
            background: `${C.gold}18`, border: `1px solid ${C.borderHi}`,
            borderRadius: 4, cursor: 'pointer',
            fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase',
            transition: '.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}30` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}18` }}
        >
          ▶ ROLL DICE
        </button>

      </div>
    </div>
  )
}
