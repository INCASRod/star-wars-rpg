'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RichText } from '@/components/ui/RichText'
import { FONT_BODY, HUD, RADIUS, EASE, FS } from '@/lib/tokens'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { ACTIVATION_LABELS, type RefTalent, type RefForcePower, type RefForceAbility } from '@/lib/types'

// ── Local palette ──────────────────────────────────────────────────────────────
const BLUE      = 'var(--die-force)'
const PURPLE    = 'var(--hud-accent-purple)'
const BG        = 'rgba(6,10,8,0.97)'
const PANEL     = 'rgba(10,18,12,0.95)'
const BORDER    = 'var(--hud-border)'
const BORDER_HI = HUD.borderHi
const TEXT      = HUD.text
const DIM       = HUD.textDim
const DIM_LO    = HUD.textFaint

const ACTIVATION_COLOR: Record<string, string> = {
  taPassive:       'rgba(160,160,160,0.85)',
  taAction:        HUD.gold,
  taManeuver:      '#4FC3F7',
  taIncidental:    '#81C784',
  taIncidentalOOT: '#81C784',
}

type LibTab = 'talents' | 'force'

// ── Shared atoms ───────────────────────────────────────────────────────────────

function ActivationBadge({ activation }: { activation: string }) {
  const label = ACTIVATION_LABELS[activation] ?? activation
  const color = ACTIVATION_COLOR[activation] ?? 'rgba(160,160,160,0.85)'
  return (
    <span style={{
      fontFamily:    FONT_BODY,
      fontSize:      FS.overline,
      fontWeight:    700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color,
      background:    `color-mix(in srgb, ${color} 9%, transparent)`,
      border:        `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      borderRadius:  RADIUS.sm,
      padding:       '0.125rem 0.375rem',
      flexShrink:    0,
    }}>
      {label}
    </span>
  )
}

function SearchInput({ value, placeholder, onChange, onClear }: {
  value:       string
  placeholder: string
  onChange:    (v: string) => void
  onClear:     () => void
}) {
  return (
    <div style={{ padding: '0.625rem 0.875rem', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '0.5rem',
        background:   'rgba(0,0,0,0.45)',
        border:       `1px solid ${BORDER_HI}`,
        borderRadius: RADIUS.sm,
        padding:      '0.4375rem 0.625rem',
      }}>
        <span style={{ fontSize: FS.overline, opacity: 0.45, flexShrink: 0 }}>🔍</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex:       1,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            fontFamily: FONT_BODY,
            fontSize:   'var(--text-sm)',
            color:      TEXT,
          }}
        />
        {value && (
          <button
            onClick={onClear}
            aria-label="Clear search"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      DIM_LO,
              fontSize:   FS.overline,
              lineHeight: 1,
              padding:    0,
              flexShrink: 0,
            }}
          >✕</button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      gap:            '0.5rem',
      padding:        '2rem',
      textAlign:      'center',
    }}>
      <div style={{ fontSize: FS.h3, opacity: 0.15 }}>⊟</div>
      <div style={{
        fontFamily:    FONT_BODY,
        fontSize:      'var(--text-label)',
        fontWeight:    700,
        color:         DIM_LO,
        letterSpacing: '0.06em',
      }}>
        {message}
      </div>
      <div style={{
        fontFamily: FONT_BODY,
        fontSize:   'var(--text-caption)',
        color:      DIM_LO,
        lineHeight: 1.5,
        opacity:    0.75,
        whiteSpace: 'pre-line',
      }}>
        {sub}
      </div>
    </div>
  )
}

function ResultCount({ label }: { label: string }) {
  return (
    <div style={{
      padding:       '0.25rem 0.875rem 0.5rem',
      fontFamily:    FONT_BODY,
      fontSize:      FS.overline,
      fontWeight:    700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color:         DIM_LO,
    }}>
      {label}
    </div>
  )
}

// ── Talents tab ────────────────────────────────────────────────────────────────

function TalentCard({ talent }: { talent: RefTalent }) {
  const [expanded, setExpanded] = useState(false)
  const hasDesc = !!talent.description
  return (
    <div
      style={{ padding: '0.5625rem 0.875rem', borderBottom: `1px solid ${BORDER}`, cursor: hasDesc ? 'pointer' : 'default' }}
      onClick={() => hasDesc && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem', marginBottom: hasDesc ? '0.3125rem' : 0 }}>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-sm)',
          fontWeight: 600,
          color:      TEXT,
          flex:       1,
          minWidth:   0,
        }}>
          {talent.name}
        </span>
        <ActivationBadge activation={talent.activation} />
        {talent.is_ranked && (
          <span style={{
            fontFamily: FONT_BODY,
            fontSize:   FS.overline,
            color:      'rgba(200,170,80,0.45)',
            flexShrink: 0,
          }}>
            Ranked
          </span>
        )}
        {hasDesc && (
          <span style={{ fontSize: FS.overline, color: DIM_LO, flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {hasDesc && (
        <div style={expanded ? {
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-caption)',
          color:      DIM,
          lineHeight: 1.45,
        } : {
          fontFamily:        FONT_BODY,
          fontSize:          'var(--text-caption)',
          color:             DIM,
          lineHeight:        1.45,
          overflow:          'hidden',
          display:           '-webkit-box',
          WebkitLineClamp:   2,
          WebkitBoxOrient:   'vertical',
        } as React.CSSProperties}>
          <RichText text={talent.description!} />
        </div>
      )}
    </div>
  )
}

function TalentsBody({ query, results }: { query: string; results: RefTalent[] }) {
  if (!query) {
    return (
      <EmptyState
        message="Search to look up a talent"
        sub={'Type any part of the name.\nResults appear instantly.'}
      />
    )
  }
  if (results.length === 0) {
    return <EmptyState message="No talents found" sub={`No match for "${query}"`} />
  }
  return (
    <>
      <ResultCount label={`${results.length} result${results.length !== 1 ? 's' : ''}`} />
      {results.map(t => <TalentCard key={t.key} talent={t} />)}
    </>
  )
}

// ── Force Powers tab ───────────────────────────────────────────────────────────

function AbilityRow({ ability }: { ability: RefForceAbility }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      style={{
        padding:    '0.4375rem 0.75rem',
        borderTop:  '1px solid rgba(144,96,208,0.1)',
        background: 'rgba(4,8,6,0.5)',
        cursor:     ability.description ? 'pointer' : 'default',
      }}
      onClick={() => ability.description && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-caption)',
          fontWeight: 600,
          color:      'rgba(200,180,240,0.75)',
          flex:       1,
        }}>
          {ability.name}
        </span>
        {ability.description && (
          <span style={{ fontSize: FS.overline, color: 'rgba(144,96,208,0.45)', flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {expanded && ability.description && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-caption)',
          color:      'rgba(90,110,100,0.85)',
          lineHeight: 1.4,
          marginTop:  '0.25rem',
        }}>
          <RichText text={ability.description} />
        </div>
      )}
    </div>
  )
}

function ForcePowerCard({ power, abilities }: { power: RefForcePower; abilities: RefForceAbility[] }) {
  return (
    <div style={{
      margin:       '0.375rem 0.625rem 0.125rem',
      background:   'rgba(144,96,208,0.06)',
      border:       '1px solid rgba(144,96,208,0.2)',
      borderRadius: RADIUS.md,
      overflow:     'hidden',
    }}>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '0.5rem',
        padding:      '0.5625rem 0.75rem',
        borderBottom: '1px solid rgba(144,96,208,0.12)',
        background:   'rgba(144,96,208,0.08)',
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(200,180,240,0.9)', flex: 1 }}>
          {power.name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(144,96,208,0.6)', flexShrink: 0 }}>
          FR {power.min_force_rating}+
        </span>
      </div>
      {power.description && (
        <div style={{
          padding:    '0.4375rem 0.75rem',
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-caption)',
          color:      DIM,
          lineHeight: 1.45,
        }}>
          <RichText text={power.description} />
        </div>
      )}
      {abilities.map(ability => (
        <AbilityRow key={ability.key} ability={ability} />
      ))}
    </div>
  )
}

function StandaloneAbilityCard({ ability, powerName }: { ability: RefForceAbility; powerName: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      style={{
        margin:       '0.25rem 0.625rem',
        padding:      '0.5rem 0.75rem',
        background:   'rgba(144,96,208,0.04)',
        border:       '1px solid rgba(144,96,208,0.14)',
        borderRadius: RADIUS.md,
        cursor:       ability.description ? 'pointer' : 'default',
      }}
      onClick={() => ability.description && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-caption)', fontWeight: 600, color: 'rgba(200,180,240,0.8)', flex: 1 }}>
          {ability.name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'rgba(144,96,208,0.5)', flexShrink: 0 }}>
          {powerName}
        </span>
        {ability.description && (
          <span style={{ fontSize: FS.overline, color: 'rgba(144,96,208,0.45)', flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {expanded && ability.description && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-caption)',
          color:      'rgba(90,110,100,0.85)',
          lineHeight: 1.4,
          marginTop:  '0.375rem',
        }}>
          <RichText text={ability.description} />
        </div>
      )}
    </div>
  )
}

interface ForceResults {
  powerCards:          Array<{ power: RefForcePower; abilities: RefForceAbility[] }>
  standaloneAbilities: RefForceAbility[]
}

function ForceBody({ query, results, powers }: {
  query:   string
  results: ForceResults
  powers:  RefForcePower[]
}) {
  if (!query) {
    return (
      <EmptyState
        message="Search to look up a force power"
        sub={'Type a power or ability name.\nResults appear instantly.'}
      />
    )
  }

  const { powerCards, standaloneAbilities } = results

  if (powerCards.length === 0 && standaloneAbilities.length === 0) {
    return <EmptyState message="No results found" sub={`No match for "${query}"`} />
  }

  const totalAbilities = powerCards.reduce((n, pc) => n + pc.abilities.length, 0) + standaloneAbilities.length
  const powerLabel     = `${powerCards.length} power${powerCards.length !== 1 ? 's' : ''}`
  const abilityLabel   = `${totalAbilities} abilit${totalAbilities !== 1 ? 'ies' : 'y'}`
  const countLabel     =
    powerCards.length > 0 && totalAbilities > 0 ? `${powerLabel} · ${abilityLabel}` :
    powerCards.length > 0 ? powerLabel : abilityLabel

  const powerKeyToName = Object.fromEntries(powers.map(p => [p.key, p.name]))

  return (
    <>
      <ResultCount label={countLabel} />
      {powerCards.map(({ power, abilities }) => (
        <ForcePowerCard key={power.key} power={power} abilities={abilities} />
      ))}
      {standaloneAbilities.map(ability => (
        <StandaloneAbilityCard
          key={ability.key}
          ability={ability}
          powerName={powerKeyToName[ability.power_key] ?? ability.power_key}
        />
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GmReferenceLibraryPanel() {
  const supabase = useMemo(() => createClient(), [])

  const [tab, setTab] = useState<LibTab>('talents')

  // Talents
  const [talents,       setTalents]       = useState<RefTalent[]>([])
  const [talentsLoaded, setTalentsLoaded] = useState(false)
  const talentsLoadingRef                 = useRef(false)
  const [talentQuery,   setTalentQuery]   = useState('')

  // Force
  const [forcePowers,    setForcePowers]    = useState<RefForcePower[]>([])
  const [forceAbilities, setForceAbilities] = useState<RefForceAbility[]>([])
  const [forceLoaded,    setForceLoaded]    = useState(false)
  const forceLoadingRef                     = useRef(false)
  const [forceQuery,     setForceQuery]     = useState('')

  // ── Data loaders ───────────────────────────────────────────────────────────

  const handleTalentSearch = useCallback(async (q: string) => {
    setTalentQuery(q)
    if (q && !talentsLoaded && !talentsLoadingRef.current) {
      talentsLoadingRef.current = true
      const ds = await fetchActiveDataset(supabase)
      const { data } = await supabase
        .from('ref_talents')
        .select('key,name,description,activation,is_ranked')
        .eq('dataset_source', ds)
        .eq('is_retired', false)
        .order('name')
      setTalents((data ?? []) as RefTalent[])
      setTalentsLoaded(true)
      talentsLoadingRef.current = false
    }
  }, [supabase, talentsLoaded])

  const handleForceSearch = useCallback(async (q: string) => {
    setForceQuery(q)
    if (q && !forceLoaded && !forceLoadingRef.current) {
      forceLoadingRef.current = true
      const ds = await fetchActiveDataset(supabase)
      const [powersRes, abilitiesRes] = await Promise.all([
        supabase.from('ref_force_powers').select('key,name,description,min_force_rating').eq('dataset_source', ds).eq('is_retired', false).order('name'),
        supabase.from('ref_force_abilities').select('key,name,description,power_key').eq('dataset_source', ds).eq('is_retired', false).order('name'),
      ])
      setForcePowers((powersRes.data ?? []) as RefForcePower[])
      setForceAbilities((abilitiesRes.data ?? []) as RefForceAbility[])
      setForceLoaded(true)
      forceLoadingRef.current = false
    }
  }, [supabase, forceLoaded])

  // ── Derived results ────────────────────────────────────────────────────────

  const filteredTalents = useMemo(() => {
    if (!talentQuery) return []
    const lc = talentQuery.toLowerCase()
    return talents.filter(t => t.name.toLowerCase().includes(lc))
  }, [talents, talentQuery])

  const forceResults = useMemo((): ForceResults => {
    if (!forceQuery) return { powerCards: [], standaloneAbilities: [] }
    const lc               = forceQuery.toLowerCase()
    const matchedPowers    = forcePowers.filter(p => p.name.toLowerCase().includes(lc))
    const matchedPowerKeys = new Set(matchedPowers.map(p => p.key))
    const matchedAbilities = forceAbilities.filter(a => a.name.toLowerCase().includes(lc))
    return {
      powerCards: matchedPowers.map(power => ({
        power,
        abilities: forceAbilities.filter(a => a.power_key === power.key),
      })),
      standaloneAbilities: matchedAbilities.filter(a => !matchedPowerKeys.has(a.power_key)),
    }
  }, [forcePowers, forceAbilities, forceQuery])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: BG }}>

      {/* Header */}
      <div style={{
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        height:       '3.125rem',
        padding:      '0 1rem',
        borderBottom: `1px solid ${BORDER}`,
        background:   PANEL,
      }}>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      'var(--text-overline)',
          fontWeight:    700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         HUD.gold,
        }}>
          Reference Library
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        flexShrink:   0,
        display:      'flex',
        borderBottom: `1px solid ${BORDER}`,
        background:   PANEL,
      }}>
        {([
          { id: 'talents' as LibTab, label: 'Talents',      accent: BLUE   },
          { id: 'force'   as LibTab, label: 'Force Powers', accent: PURPLE },
        ]).map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex:          1,
                background:    'none',
                border:        'none',
                borderBottom:  `2px solid ${active ? t.accent : 'transparent'}`,
                cursor:        'pointer',
                padding:       '0.625rem 0.25rem',
                fontFamily:    FONT_BODY,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         active ? t.accent : DIM_LO,
                transition:    EASE.quick,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      {tab === 'talents' ? (
        <SearchInput
          value={talentQuery}
          placeholder="Search talent name…"
          onChange={handleTalentSearch}
          onClear={() => setTalentQuery('')}
        />
      ) : (
        <SearchInput
          value={forceQuery}
          placeholder="Search force power or ability…"
          onChange={handleForceSearch}
          onClear={() => setForceQuery('')}
        />
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'talents' && (
          <TalentsBody query={talentQuery} results={filteredTalents} />
        )}
        {tab === 'force' && (
          <ForceBody query={forceQuery} results={forceResults} powers={forcePowers} />
        )}
      </div>

    </div>
  )
}
