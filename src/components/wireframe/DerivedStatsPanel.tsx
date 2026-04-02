'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import type { Character } from '@/lib/types'
import type { LiveTalent } from './TalentsPanel'
import type { EffectiveStats, StatSource } from '@/lib/derivedStats'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Source { label: string; value: number; note?: string }

interface DerivedStat {
  key: string
  label: string
  abbrev: string
  total: number
  color: string
  sources: Source[]
  tracked?: boolean
}

// ── Colors ────────────────────────────────────────────────────────────────────

const STAT_COLOR: Record<string, string> = {
  soak: '#4EC87A',
  wounds: '#E05050',
  strain: '#60C8E0',
  mdef: '#E07855',
  rdef: '#5AAAE0',
}

const NOTE_COLOR: Record<string, string> = {
  armor: '#5AAAE0',
  talent: '#C8AA50',
  species: '#B070D8',
}

// ── Static fallback ───────────────────────────────────────────────────────────

const STATIC_STATS: DerivedStat[] = [
  { key: 'soak', label: 'Soak', abbrev: 'SOAK', total: 5, color: STAT_COLOR.soak, sources: [{ label: 'Brawn', value: 3 }, { label: 'Armor', value: 1, note: 'armor' }, { label: 'Enduring ×1', value: 1, note: 'talent' }] },
  { key: 'wounds', label: 'Wound Threshold', abbrev: 'WOUNDS', total: 17, color: STAT_COLOR.wounds, tracked: true, sources: [{ label: 'Species base', value: 10, note: 'species' }, { label: 'Brawn', value: 3 }, { label: 'Toughened ×2', value: 4, note: 'talent' }] },
  { key: 'strain', label: 'Strain Threshold', abbrev: 'STRAIN', total: 13, color: STAT_COLOR.strain, tracked: true, sources: [{ label: 'Species base', value: 10, note: 'species' }, { label: 'Willpower', value: 2 }, { label: 'Grit ×1', value: 1, note: 'talent' }] },
  { key: 'mdef', label: 'Melee Defense', abbrev: 'M.DEF', total: 0, color: STAT_COLOR.mdef, sources: [{ label: 'Base', value: 0 }] },
  { key: 'rdef', label: 'Ranged Defense', abbrev: 'R.DEF', total: 0, color: STAT_COLOR.rdef, sources: [{ label: 'Base', value: 0 }] },
]
const STATIC_SEEDS: Record<string, number> = { wounds: 4, strain: 2 }

// ── Live stat builder ─────────────────────────────────────────────────────────

function buildLiveStats(char: Character, liveTalents: LiveTalent[]): DerivedStat[] {
  const toughened = liveTalents.find(t => t.name === 'Toughened')?.rank ?? 0
  const enduring = liveTalents.find(t => t.name === 'Enduring')?.rank ?? 0
  const grit = liveTalents.find(t => t.name === 'Grit')?.rank ?? 0

  const armorSoak = Math.max(0, char.soak - char.brawn - enduring)
  const speciesWound = Math.max(0, char.wound_threshold - char.brawn - toughened * 2)
  const speciesStrain = Math.max(0, char.strain_threshold - char.willpower - grit)

  return [
    {
      key: 'soak', label: 'Soak', abbrev: 'SOAK', color: STAT_COLOR.soak, total: char.soak,
      sources: [
        { label: 'Brawn', value: char.brawn },
        ...(armorSoak > 0 ? [{ label: 'Armor', value: armorSoak, note: 'armor' }] : []),
        ...(enduring > 0 ? [{ label: `Enduring ×${enduring}`, value: enduring, note: 'talent' }] : []),
      ],
    },
    {
      key: 'wounds', label: 'Wound Threshold', abbrev: 'WOUNDS', color: STAT_COLOR.wounds,
      total: char.wound_threshold, tracked: true,
      sources: [
        { label: 'Species base', value: speciesWound, note: 'species' },
        { label: 'Brawn', value: char.brawn },
        ...(toughened > 0 ? [{ label: `Toughened ×${toughened}`, value: toughened * 2, note: 'talent' }] : []),
      ],
    },
    {
      key: 'strain', label: 'Strain Threshold', abbrev: 'STRAIN', color: STAT_COLOR.strain,
      total: char.strain_threshold, tracked: true,
      sources: [
        { label: 'Species base', value: speciesStrain, note: 'species' },
        { label: 'Willpower', value: char.willpower },
        ...(grit > 0 ? [{ label: `Grit ×${grit}`, value: grit, note: 'talent' }] : []),
      ],
    },
    { key: 'mdef', label: 'Melee Defense', abbrev: 'M.DEF', color: STAT_COLOR.mdef, total: char.defense_melee, sources: [{ label: 'Armor + Talents', value: char.defense_melee }] },
    { key: 'rdef', label: 'Ranged Defense', abbrev: 'R.DEF', color: STAT_COLOR.rdef, total: char.defense_ranged, sources: [{ label: 'Armor + Talents', value: char.defense_ranged }] },
  ]
}

// ── Breakdown tooltip (portal, position:fixed) ────────────────────────────────

function BreakdownTooltip({ stat, anchor }: { stat: DerivedStat; anchor: DOMRect | null }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!anchor || !mounted) return null

  // Render ABOVE the pill so it doesn't overlap skills below
  const top = anchor.top - 6   // translateY(-100%) will push it fully above this point
  const left = anchor.left + anchor.width / 2

  return createPortal(
    <div style={{
      ...panelBase,
      position: 'fixed',
      top,
      left,
      transform: 'translateX(-50%) translateY(-100%)',
      zIndex: 9999,
      border: `1px solid ${stat.color}40`,
      background: 'rgba(4,9,6,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '10px 12px',
      minWidth: 160,
      pointerEvents: 'none',
      boxShadow: `0 8px 24px rgba(0,0,0,.6), 0 0 0 1px ${stat.color}20`,
      animation: 'tooltipIn 0.15s ease forwards',
    }}>
      {/* Arrow pointing DOWN (tooltip is above the pill) */}
      <div style={{
        position: 'absolute', bottom: -5, left: '50%',
        width: 8, height: 8, background: 'rgba(4,9,6,0.97)',
        border: `1px solid ${stat.color}40`, borderTop: 'none', borderLeft: 'none',
        transform: 'translateX(-50%) rotate(45deg)',
      }} />

      <div style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_LABEL, letterSpacing: '0.18em', textTransform: 'uppercase', color: stat.color, marginBottom: 6 }}>
        {stat.label}
      </div>

      <div style={{ borderLeft: `2px solid ${stat.color}30`, paddingLeft: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {stat.sources.map((src, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'nowrap' }}>
              {src.label}
              {src.note && (
                <span style={{
                  fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_LABEL, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: NOTE_COLOR[src.note] ?? C.textDim,
                  border: `1px solid ${(NOTE_COLOR[src.note] ?? C.textDim)}40`,
                  borderRadius: 2, padding: '0 3px',
                }}>
                  {src.note}
                </span>
              )}
            </span>
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, color: src.value > 0 ? stat.color : C.textFaint, flexShrink: 0 }}>
              +{src.value}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: 3, gap: 8 }}>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, color: stat.color }}>{stat.total}</span>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Single stat pill ──────────────────────────────────────────────────────────

function StatPill({
  stat, current, onTrack,
}: {
  stat: DerivedStat
  current: number
  onTrack: (d: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const pct = stat.total > 0 ? Math.min((current / stat.total) * 100, 100) : 0
  const atThreshold = !!stat.tracked && current >= stat.total
  const color = stat.color

  const btn: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    width: 18, height: 18,
    cursor: 'pointer',
    fontFamily: FONT_CINZEL,
    fontSize: FS_SM,
    color: C.textDim,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
    flexShrink: 0,
    transition: 'border-color 0.15s, color 0.15s',
  }

  const handleMouseEnter = () => {
    setHover(true)
    if (ref.current) setAnchorRect(ref.current.getBoundingClientRect())
  }

  const handleMouseLeave = () => {
    setHover(false)
    setAnchorRect(null)
  }

  return (
    <div
      ref={ref}
      style={{
        ...panelBase,
        flex: 1,
        border: atThreshold
          ? `1px solid ${color}60`
          : hover ? `1px solid ${color}40` : `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        padding: 0,
        position: 'relative',
        transition: 'border-color 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Abbrev header */}
      <div style={{
        padding: '4px 8px',
        borderBottom: `1px solid ${C.border}`,
        background: hover ? `${color}10` : `${color}06`,
        transition: 'background 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
      }}>
        <span style={{
          fontFamily: FONT_RAJDHANI, fontWeight: 700,
          fontSize: FS_OVERLINE, letterSpacing: '0.15em',
          textTransform: 'uppercase', color,
        }}>
          {stat.abbrev}
        </span>
        <span style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          color: `${color}60`, letterSpacing: '0.05em',
        }}>?</span>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>

        {/* Big number */}
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color, lineHeight: 1, textAlign: 'center' }}>
          {stat.total}
        </div>

        {/* Full stat label */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700, color: C.textDim,
          textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center',
        }}>
          {stat.label}
        </div>

        {/* Source breakdown */}
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
          {stat.sources.map((src, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 600, color: C.textDim, flex: 1 }}>
                {src.label}
              </span>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: C.gold, textAlign: 'right' }}>
                +{src.value}
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 8,
            borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4,
          }}>
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 600, color: C.text }}>Total</span>
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, color: C.text, textAlign: 'right' }}>
              {stat.total}
            </span>
          </div>
        </div>

        {/* Tracker controls (wounds/strain only) */}
        <div style={{ marginTop: 'auto' }}>
          {stat.tracked && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <button
                  onClick={e => { e.stopPropagation(); onTrack(-1) }}
                  style={{ ...btn, color: atThreshold ? '#E05050' : C.textDim }}
                >−</button>
                <span style={{
                  fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700,
                  color: atThreshold ? '#E05050' : C.text,
                  minWidth: 28, textAlign: 'center',
                }}>
                  {current}
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 600, color: C.textFaint }}>
                    /{stat.total}
                  </span>
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onTrack(1) }}
                  style={btn}
                >+</button>
              </div>

              {/* Progress bar */}
              <div style={{ height: 10, background: `${color}20`, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: atThreshold ? '#E05050' : `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }} />
              </div>

              {atThreshold && (
                <div style={{
                  fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: '#E05050', textAlign: 'center',
                }}>
                  ■ CRITICAL
                </div>
              )}
            </>
          )}
        </div></div>

      {/* Breakdown tooltip — rendered via portal to escape overflow clipping */}
      <BreakdownTooltip stat={stat} anchor={hover ? anchorRect : null} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface EngineBreakdown {
  soak: StatSource[]
  defenseMelee: StatSource[]
  defenseRanged: StatSource[]
  woundThreshold: StatSource[]
  strainThreshold: StatSource[]
  forceRating: StatSource[]
}

interface DerivedStatsPanelProps {
  character?: Character
  liveTalents?: LiveTalent[]
  onVitalChange?: (field: 'wound_current' | 'strain_current', delta: number) => void
  characterName?: string
  /** When provided, totals and tooltips come from the derived stats engine */
  effectiveStats?: EffectiveStats
  /** Breakdown sources per stat — required when effectiveStats is provided */
  engineBreakdown?: EngineBreakdown
}

function buildStatsFromEngine(char: Character, es: EffectiveStats, bd: EngineBreakdown): DerivedStat[] {
  const makeSources = (arr: StatSource[]) =>
    arr.map(s => ({ label: s.label, value: s.value }))

  return [
    {
      key: 'soak', label: 'Soak', abbrev: 'SOAK', color: STAT_COLOR.soak,
      total: es.soak,
      sources: makeSources(bd.soak),
    },
    {
      key: 'wounds', label: 'Wound Threshold', abbrev: 'WOUNDS', color: STAT_COLOR.wounds,
      total: es.woundThreshold, tracked: true,
      sources: makeSources(bd.woundThreshold),
    },
    {
      key: 'strain', label: 'Strain Threshold', abbrev: 'STRAIN', color: STAT_COLOR.strain,
      total: es.strainThreshold, tracked: true,
      sources: makeSources(bd.strainThreshold),
    },
    {
      key: 'mdef', label: 'Melee Defense', abbrev: 'M.DEF', color: STAT_COLOR.mdef,
      total: es.defenseMelee,
      sources: bd.defenseMelee.length > 0 ? makeSources(bd.defenseMelee) : [{ label: 'Base', value: 0 }],
    },
    {
      key: 'rdef', label: 'Ranged Defense', abbrev: 'R.DEF', color: STAT_COLOR.rdef,
      total: es.defenseRanged,
      sources: bd.defenseRanged.length > 0 ? makeSources(bd.defenseRanged) : [{ label: 'Base', value: 0 }],
    },
  ]
  void char
}

export function DerivedStatsPanel({ character, liveTalents = [], onVitalChange, characterName, effectiveStats, engineBreakdown }: DerivedStatsPanelProps) {
  const STATS = effectiveStats && engineBreakdown && character
    ? buildStatsFromEngine(character, effectiveStats, engineBreakdown)
    : character
      ? buildLiveStats(character, liveTalents)
      : STATIC_STATS

  const initTrackers = () => character
    ? { wounds: character.wound_current, strain: character.strain_current }
    : Object.fromEntries(STATIC_STATS.filter(s => s.tracked).map(s => [s.key, STATIC_SEEDS[s.key] ?? 0]))

  const [trackers, setTrackers] = useState<Record<string, number>>(initTrackers)

  useEffect(() => {
    if (character) setTrackers({ wounds: character.wound_current, strain: character.strain_current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.wound_current, character?.strain_current])

  const onTrack = (key: string, delta: number) => {
    const stat = STATS.find(s => s.key === key)!
    setTrackers(prev => ({ ...prev, [key]: Math.max(0, Math.min((prev[key] ?? 0) + delta, stat.total)) }))
    if (character && onVitalChange) {
      if (key === 'wounds') onVitalChange('wound_current', delta)
      if (key === 'strain') onVitalChange('strain_current', delta)
    }
  }

  return (
    <div style={{
      ...panelBase,
      overflow: 'visible',
      padding: 0,
    }}>
      <div style={{ display: 'flex', gap: 1 }}>
        {STATS.map(stat => (
          <StatPill
            key={stat.key}
            stat={stat}
            current={trackers[stat.key] ?? 0}
            onTrack={d => onTrack(stat.key, d)}
          />
        ))}
      </div>
    </div>
  )
}
