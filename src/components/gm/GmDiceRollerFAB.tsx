'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { DiceFace } from '@/components/dice/DiceFace'
import {
  rollPool, rollForceDice,
  type RollResult, type ForceRollResult,
} from '@/components/player-hud/dice-engine'
import {
  DICE_META, EMPTY_POOL, SYM,
  type DiceType, type SymbolKey,
} from '@/components/player-hud/design-tokens'

/* ── Design tokens ────────────────────────────────────────── */
const FC        = "var(--font-cinzel), 'Cinzel', serif"
const FR        = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FST       = "var(--font-share-tech-mono), 'Share Tech Mono', monospace"
const GOLD      = '#C8AA50'
const GOLD_DIM  = '#5A4A20'
const DIM       = '#6A8070'
const TEXT      = '#C8D8C0'
const GREEN     = '#4EC87A'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const PANEL_BG  = 'rgba(6,13,9,0.97)'
const LIGHT_COL = '#E8E870'
const DARK_COL  = '#8070D8'

const POSITIVE: DiceType[] = ['proficiency', 'ability', 'boost']
const NEGATIVE: DiceType[] = ['challenge', 'difficulty', 'setback']

function poolSize(pool: Record<DiceType, number>) {
  return Object.values(pool).reduce((a, b) => a + b, 0)
}

/* ── Pentagon icon ────────────────────────────────────────── */
function DiceIcon({ size = 16 }: { size?: number }) {
  const r = size * 0.46, cx = size / 2, cy = size / 2
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180)
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
      <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}

/* ── Section label ────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FR, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase' as const,
      color: DIM, marginBottom: 10, paddingBottom: 4,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {text}
    </div>
  )
}

/* ── Reveal / hide control ────────────────────────────────── */
function RevealControl({
  revealed, busy, onReveal, onHide,
}: { revealed: boolean; busy: boolean; onReveal: () => void; onHide: () => void }) {
  const [dot, setDot] = useState(true)
  useEffect(() => {
    if (!revealed) return
    const id = setInterval(() => setDot(d => !d), 700)
    return () => clearInterval(id)
  }, [revealed])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
      {revealed ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
              background: dot ? GREEN : `${GREEN}80`, transition: 'background .4s',
            }} />
            <span style={{ fontFamily: FST, fontSize: 9, color: 'rgba(200,216,192,0.45)' }}>
              Visible to players
            </span>
          </div>
          <button
            disabled={busy}
            onClick={onHide}
            style={{
              fontFamily: FR, fontSize: 10, fontWeight: 700,
              border: '1px solid rgba(200,216,192,0.2)', borderRadius: 4, padding: '3px 10px',
              background: 'transparent', color: 'rgba(200,216,192,0.45)',
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
            }}
          >
            🔒 Hide
          </button>
        </>
      ) : (
        <>
          <span style={{ fontFamily: FST, fontSize: 9, color: 'rgba(200,216,192,0.35)' }}>
            Hidden from players
          </span>
          <button
            disabled={busy}
            onClick={onReveal}
            style={{
              fontFamily: FR, fontSize: 10, fontWeight: 700,
              border: `1px solid rgba(200,170,80,0.35)`, borderRadius: 4, padding: '3px 10px',
              background: 'rgba(200,170,80,0.08)', color: GOLD,
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
            }}
          >
            📢 Reveal
          </button>
        </>
      )}
    </div>
  )
}

/* ── Dice builder button ──────────────────────────────────── */
function DiceBtn({
  type, count, onAdd, onRemove,
}: { type: DiceType; count: number; onAdd: () => void; onRemove: () => void }) {
  const meta = DICE_META[type]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onAdd} title={`Add ${meta.label}`}>
        <DiceFace type={type} size={36} active={count > 0} />
        {count > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4, width: 14, height: 14,
            background: meta.color, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FR, fontSize: 11, fontWeight: 700, color: '#060D09',
          }}>
            {count}
          </div>
        )}
      </div>
      {count > 0 && (
        <button onClick={onRemove} style={{
          background: 'transparent', border: `1px solid ${BORDER}`,
          borderRadius: 3, padding: '1px 8px', cursor: 'pointer',
          fontFamily: FR, fontSize: 10, color: DIM,
        }}>−</button>
      )}
      <div style={{ fontFamily: FR, fontSize: 10, color: DIM, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
        {meta.label}
      </div>
    </div>
  )
}

/* ── Narrative result ─────────────────────────────────────── */
function NarrativeResult({ result }: { result: RollResult }) {
  const { net, dice } = result
  const isSuccess = net.success > 0
  const isFailure = net.success < 0
  const headlineColor = isSuccess ? GREEN : isFailure ? '#E05050' : GOLD
  const headlineText  = isSuccess ? 'SUCCESS' : isFailure ? 'FAILURE' : 'WASH'

  type Pill = { count: number; symKey: SymbolKey; label: string }
  const pills: Pill[] = []
  if (net.success   > 0) pills.push({ count: net.success,    symKey: 'S', label: net.success   === 1 ? 'Success'   : 'Successes'  })
  if (net.success   < 0) pills.push({ count: -net.success,   symKey: 'F', label: -net.success  === 1 ? 'Failure'   : 'Failures'   })
  if (net.advantage > 0) pills.push({ count: net.advantage,  symKey: 'A', label: net.advantage === 1 ? 'Advantage' : 'Advantages' })
  if (net.advantage < 0) pills.push({ count: -net.advantage, symKey: 'H', label: -net.advantage === 1 ? 'Threat'    : 'Threats'    })
  if (net.triumph   > 0) pills.push({ count: net.triumph,    symKey: 'T', label: net.triumph   === 1 ? 'Triumph'   : 'Triumphs'   })
  if (net.despair   > 0) pills.push({ count: net.despair,    symKey: 'D', label: net.despair   === 1 ? 'Despair'   : 'Despairs'   })

  return (
    <div style={{
      padding: '10px 10px 8px', marginTop: 8,
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: 6,
    }}>
      <div style={{
        fontFamily: FC, fontSize: 'var(--text-h4)', color: headlineColor,
        textAlign: 'center', letterSpacing: '0.08em', marginBottom: 6,
      }}>
        {headlineText}
      </div>
      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
          {pills.map(({ count, symKey, label }) => {
            const { icon, color } = SYM[symKey]
            return (
              <div key={symKey} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 4,
                background: `${color}18`, border: `1px solid ${color}50`,
                fontFamily: FR, fontSize: 12, fontWeight: 700, color,
              }}>
                <i className={`ffi ffi-${icon}`} style={{ fontSize: 12 }} />
                {count} {label}
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
        {dice.map((die, i) => {
          const symKeys = die.symbols.filter(s => s in SYM) as SymbolKey[]
          return (
            <div key={i} style={{ position: 'relative' }}>
              <DiceFace type={die.type} size={30} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              }}>
                {symKeys.length === 0
                  ? <span style={{ color: DIM, fontSize: 9 }}>—</span>
                  : symKeys.map((s, j) => (
                      <i key={j} className={`ffi ffi-${SYM[s].icon}`} style={{ color: SYM[s].color, fontSize: 9 }} />
                    ))
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Force result ─────────────────────────────────────────── */
function ForceResult({ result }: { result: ForceRollResult }) {
  const { dice, totalLight, totalDark } = result
  return (
    <div style={{
      padding: '10px 10px 8px', marginTop: 8,
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: 'var(--text-h4)', color: LIGHT_COL }}>{totalLight}</div>
          <div style={{ fontFamily: FR, fontSize: 9, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Light</div>
        </div>
        <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: 'var(--text-h4)', color: DARK_COL }}>{totalDark}</div>
          <div style={{ fontFamily: FR, fontSize: 9, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dark</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {dice.map((die, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <DiceFace type="force" size={28} />
            <div style={{ display: 'flex', gap: 2, minHeight: 8 }}>
              {Array.from({ length: die.light }).map((_, j) => (
                <div key={`l${j}`} style={{ width: 6, height: 6, borderRadius: '50%', background: LIGHT_COL }} />
              ))}
              {Array.from({ length: die.dark }).map((_, j) => (
                <div key={`k${j}`} style={{ width: 6, height: 6, borderRadius: '50%', background: DARK_COL }} />
              ))}
              {die.light === 0 && die.dark === 0 && (
                <span style={{ fontFamily: FR, fontSize: 8, color: DIM }}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── d100 result ──────────────────────────────────────────── */
function D100Result({ value }: { value: number }) {
  const tensDigit = value === 100 ? 0 : Math.floor(value / 10)
  const onesDigit = value === 100 ? 0 : value % 10
  const isDoubles = tensDigit === onesDigit
  const display   = value === 100 ? '00' : String(value).padStart(2, '0')
  return (
    <div style={{
      padding: '10px 10px 8px', marginTop: 8,
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: 6,
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: FC, fontSize: 'var(--text-h3)', color: GOLD, letterSpacing: '0.06em', lineHeight: 1 }}>
        {display}
      </div>
      {isDoubles && (
        <div style={{
          display: 'inline-block', marginTop: 6,
          padding: '2px 10px', borderRadius: 4,
          background: 'rgba(200,170,80,0.12)', border: `1px solid ${BORDER_HI}`,
          fontFamily: FR, fontSize: 10, fontWeight: 700, color: GOLD,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        }}>
          Doubles
        </div>
      )}
    </div>
  )
}

/* ── Main export ──────────────────────────────────────────── */
export function GmDiceRollerFAB({
  isGmScreenOpen,
  campaignId,
}: {
  isGmScreenOpen: boolean
  campaignId:     string | null
}) {
  const supabase = useMemo(() => createClient(), [])

  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler) }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  /* ── Shared roll label ────────────────────────────────── */
  const [rollLabel, setRollLabel] = useState('')

  /* ── Narrative dice state ─────────────────────────────── */
  const [pool,            setPool]            = useState<Record<DiceType, number>>({ ...EMPTY_POOL })
  const [narrativeResult, setNarrativeResult] = useState<RollResult | null>(null)
  const [narrativeRowId,  setNarrativeRowId]  = useState<string | null>(null)
  const [narrativeReveal, setNarrativeReveal] = useState(false)
  const [narrativeBusy,   setNarrativeBusy]   = useState(false)

  const addDie    = (type: DiceType) => setPool(p => ({ ...p, [type]: p[type] + 1 }))
  const removeDie = (type: DiceType) => setPool(p => ({ ...p, [type]: Math.max(0, p[type] - 1) }))
  const clearPool = () => { setPool({ ...EMPTY_POOL }); setNarrativeResult(null); setNarrativeRowId(null) }
  const isEmpty   = poolSize(pool) === 0

  /* ── Force dice state ─────────────────────────────────── */
  const [forceCount,  setForceCount]  = useState(1)
  const [forceResult, setForceResult] = useState<ForceRollResult | null>(null)
  const [forceRowId,  setForceRowId]  = useState<string | null>(null)
  const [forceReveal, setForceReveal] = useState(false)
  const [forceBusy,   setForceBusy]   = useState(false)

  /* ── d100 state ───────────────────────────────────────── */
  const [d100Result, setD100Result] = useState<number | null>(null)
  const [d100RowId,  setD100RowId]  = useState<string | null>(null)
  const [d100Reveal, setD100Reveal] = useState(false)
  const [d100Busy,   setD100Busy]   = useState(false)

  /* ── Roll handlers ────────────────────────────────────── */
  const handleRollNarrative = async () => {
    if (isEmpty) return
    const result = rollPool(pool)
    setNarrativeResult(result)
    setNarrativeRowId(null)
    setNarrativeReveal(false)

    if (!campaignId) return
    const { data } = await supabase.from('roll_log').insert({
      campaign_id:    campaignId,
      character_id:   null,
      character_name: 'GM',
      roll_label:     rollLabel.trim() || null,
      pool,
      result: {
        netSuccess:   result.net.success,
        netAdvantage: result.net.advantage,
        triumph:      result.net.triumph,
        despair:      result.net.despair,
        succeeded:    result.net.success > 0,
      },
      is_dm:  true,
      hidden: true,
    }).select('id').single()
    if (data) setNarrativeRowId((data as { id: string }).id)
  }

  const handleRollForce = async () => {
    const fr = rollForceDice(forceCount)
    setForceResult(fr)
    setForceRowId(null)
    setForceReveal(false)

    if (!campaignId) return
    const { data } = await supabase.from('roll_log').insert({
      campaign_id:    campaignId,
      character_id:   null,
      character_name: 'GM',
      roll_label:     rollLabel.trim() || 'Force Roll',
      pool:           { ...EMPTY_POOL, force: forceCount },
      result: {
        netSuccess:   fr.totalLight,
        netAdvantage: fr.totalDark,
        triumph:      0,
        despair:      0,
        succeeded:    fr.totalLight > 0,
      },
      is_dm:     true,
      hidden:    true,
      roll_type: 'force',
    }).select('id').single()
    if (data) setForceRowId((data as { id: string }).id)
  }

  const handleRollD100 = async () => {
    const value     = Math.floor(Math.random() * 100) + 1
    const tensDigit = value === 100 ? 0 : Math.floor(value / 10)
    const onesDigit = value === 100 ? 0 : value % 10
    const isDoubles = tensDigit === onesDigit
    const display   = value === 100 ? '00' : String(value).padStart(2, '0')
    setD100Result(value)
    setD100RowId(null)
    setD100Reveal(false)

    if (!campaignId) return
    const base     = rollLabel.trim() || 'd100'
    const fullLabel = `${base}: ${display}${isDoubles ? ' (Doubles)' : ''}`
    const { data } = await supabase.from('roll_log').insert({
      campaign_id:    campaignId,
      character_id:   null,
      character_name: 'GM',
      roll_label:     fullLabel,
      pool:           { ...EMPTY_POOL },
      result: {
        netSuccess:   0,
        netAdvantage: 0,
        triumph:      0,
        despair:      0,
        succeeded:    false,
      },
      is_dm:     true,
      hidden:    true,
      roll_type: 'system',
    }).select('id').single()
    if (data) setD100RowId((data as { id: string }).id)
  }

  /* ── Reveal / hide helpers ────────────────────────────── */
  const toggleReveal = async (
    rowId:      string,
    newRevealed: boolean,
    setRevealed: (v: boolean) => void,
    setBusy:    (v: boolean) => void,
  ) => {
    setBusy(true)
    await supabase.from('roll_log').update({ hidden: !newRevealed }).eq('id', rowId)
    setRevealed(newRevealed)
    setBusy(false)
  }

  /* ── Trigger button (inline in parent flex row) ────────── */
  const button = (
    <button
      ref={btnRef}
      onClick={() => setOpen(o => !o)}
      title="GM Dice Roller"
      style={{
        background:   open ? 'rgba(200,170,80,0.2)' : 'rgba(6,13,9,0.92)',
        border:       `2px solid ${open ? GOLD : GOLD_DIM}`,
        borderRadius: 8, padding: '10px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        fontFamily:    FST,
        fontSize:      'var(--text-caption)',
        letterSpacing: '0.14em', textTransform: 'uppercase' as const,
        color:         open ? GOLD : DIM,
        boxShadow:     open ? '0 0 16px rgba(200,170,80,0.2)' : '0 2px 12px rgba(0,0,0,0.5)',
        transition:    'all 0.2s',
        whiteSpace:    'nowrap' as const,
      }}
      onMouseEnter={e => {
        if (!open) {
          const el = e.currentTarget as HTMLElement
          el.style.color = GOLD
          el.style.borderColor = GOLD
        }
      }}
      onMouseLeave={e => {
        if (!open) {
          const el = e.currentTarget as HTMLElement
          el.style.color = DIM
          el.style.borderColor = GOLD_DIM
        }
      }}
    >
      <DiceIcon size={16} />
      Dice
    </button>
  )

  if (!mounted) return button

  /* ── Panel ────────────────────────────────────────────── */
  const panel = open ? createPortal(
    <div
      ref={panelRef}
      style={{
        position:             'fixed',
        bottom:               76,
        right:                24,
        width:                320,
        zIndex:               9001,
        background:           PANEL_BG,
        border:               `1px solid ${BORDER_HI}`,
        borderRadius:         12,
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow:            '0 8px 40px rgba(0,0,0,0.7)',
        maxHeight:            'calc(100vh - 120px)',
        overflowY:            'auto',
        animation:            'gmDicePanelIn 150ms ease-out',
      }}
    >
      {/* ── Header ──────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 10px',
        borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0,
        background: PANEL_BG, zIndex: 1,
      }}>
        <span style={{ fontFamily: FC, fontSize: 'var(--text-label)', fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          GM Dice Roller
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 4,
            width: 26, height: 26, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: DIM, fontSize: 16, lineHeight: 1,
          }}
        >×</button>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── ROLL LABEL ──────────────────────────── */}
        <div>
          <div style={{
            fontFamily: FR, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            color: DIM, marginBottom: 6,
          }}>
            Roll Name
          </div>
          <input
            type="text"
            value={rollLabel}
            onChange={e => setRollLabel(e.target.value)}
            placeholder="e.g. Stealth Check, Perception…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '7px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER_HI}`,
              borderRadius: 4,
              color: TEXT, fontFamily: FR, fontSize: 12,
              outline: 'none',
            }}
          />
          {campaignId && (
            <div style={{ fontFamily: FR, fontSize: 9, color: 'rgba(106,128,112,0.6)', marginTop: 4 }}>
              Rolls are logged hidden — reveal to players after rolling
            </div>
          )}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* ── NARRATIVE DICE ──────────────────────── */}
        <div>
          <SectionLabel text="Narrative Dice" />

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
            {POSITIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          <div style={{ height: 1, background: BORDER, margin: '4px 0 8px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
            {NEGATIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => void handleRollNarrative()}
              disabled={isEmpty}
              style={{
                flex: 1, padding: '8px 0',
                background: isEmpty ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #C8AA50, #8E6E2A)',
                border: 'none', borderRadius: 4, cursor: isEmpty ? 'not-allowed' : 'pointer',
                fontFamily: FC, fontSize: 'var(--text-caption)', fontWeight: 700,
                letterSpacing: '0.1em', color: isEmpty ? DIM : '#060D09',
              }}
            >
              {isEmpty ? 'ADD DICE TO ROLL' : `ROLL ${poolSize(pool)} DICE`}
            </button>
            {!isEmpty && (
              <button
                onClick={clearPool}
                style={{
                  padding: '8px 12px',
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  borderRadius: 4, cursor: 'pointer',
                  fontFamily: FR, fontSize: 12, color: DIM,
                }}
              >✕</button>
            )}
          </div>

          {narrativeResult && (
            <>
              <NarrativeResult result={narrativeResult} />
              {campaignId && narrativeRowId && (
                <RevealControl
                  revealed={narrativeReveal}
                  busy={narrativeBusy}
                  onReveal={() => void toggleReveal(narrativeRowId, true,  setNarrativeReveal, setNarrativeBusy)}
                  onHide={()   => void toggleReveal(narrativeRowId, false, setNarrativeReveal, setNarrativeBusy)}
                />
              )}
            </>
          )}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* ── FORCE DICE ──────────────────────────── */}
        <div>
          <SectionLabel text="Force Dice" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <DiceFace type="force" size={36} active />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setForceCount(c => Math.max(1, c - 1))}
                style={{
                  width: 24, height: 24, background: 'transparent',
                  border: `1px solid ${BORDER}`, borderRadius: 3,
                  cursor: 'pointer', color: DIM, fontFamily: FR, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <span style={{ fontFamily: FC, fontSize: 'var(--text-h4)', color: TEXT, minWidth: 20, textAlign: 'center' }}>
                {forceCount}
              </span>
              <button
                onClick={() => setForceCount(c => Math.min(8, c + 1))}
                style={{
                  width: 24, height: 24, background: 'transparent',
                  border: `1px solid ${BORDER}`, borderRadius: 3,
                  cursor: 'pointer', color: DIM, fontFamily: FR, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>

            <span style={{ fontFamily: FR, fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {forceCount === 1 ? '1 die' : `${forceCount} dice`}
            </span>
          </div>

          <button
            onClick={() => void handleRollForce()}
            style={{
              width: '100%', padding: '8px 0',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 4, cursor: 'pointer',
              fontFamily: FC, fontSize: 'var(--text-caption)', fontWeight: 700,
              letterSpacing: '0.1em', color: TEXT,
            }}
          >
            ROLL FORCE
          </button>

          {forceResult && (
            <>
              <ForceResult result={forceResult} />
              {campaignId && forceRowId && (
                <RevealControl
                  revealed={forceReveal}
                  busy={forceBusy}
                  onReveal={() => void toggleReveal(forceRowId, true,  setForceReveal, setForceBusy)}
                  onHide={()   => void toggleReveal(forceRowId, false, setForceReveal, setForceBusy)}
                />
              )}
            </>
          )}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* ── d100 ────────────────────────────────── */}
        <div>
          <SectionLabel text="d100" />

          <button
            onClick={() => void handleRollD100()}
            style={{
              width: '100%', padding: '8px 0',
              background: 'rgba(200,170,80,0.06)', border: `1px solid ${BORDER_HI}`,
              borderRadius: 4, cursor: 'pointer',
              fontFamily: FC, fontSize: 'var(--text-caption)', fontWeight: 700,
              letterSpacing: '0.1em', color: GOLD,
            }}
          >
            ROLL d100
          </button>

          {d100Result !== null && (
            <>
              <D100Result value={d100Result} />
              {campaignId && d100RowId && (
                <RevealControl
                  revealed={d100Reveal}
                  busy={d100Busy}
                  onReveal={() => void toggleReveal(d100RowId, true,  setD100Reveal, setD100Busy)}
                  onHide={()   => void toggleReveal(d100RowId, false, setD100Reveal, setD100Busy)}
                />
              )}
            </>
          )}
        </div>

      </div>

      <style>{`
        @keyframes gmDicePanelIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  ) : null

  return (
    <>
      {button}
      {panel}
    </>
  )
}
