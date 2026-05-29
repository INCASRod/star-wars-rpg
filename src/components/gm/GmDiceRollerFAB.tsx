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
import { HUD, FONT_BODY, EASE, FS, RADIUS, Z } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const FC        = FONT_BODY
const FR        = FONT_BODY
const FST       = FONT_BODY
const GOLD_DIM  = HUD.gold
const DIM       = HUD.textDim
const TEXT      = HUD.text
const GREEN     = 'var(--state-success)'
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const PANEL_BG  = HUD.bg
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
      fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase' as const,
      color: DIM, marginBottom: '0.625rem', paddingBottom: '0.25rem',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
      {revealed ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem' }}>
            <span style={{
              width: '0.375rem', height: '0.375rem', borderRadius: RADIUS.full, display: 'inline-block',
              background: dot ? GREEN : `${GREEN}80`, transition: `background ${EASE.smooth}`,
            }} />
            <span style={{ fontFamily: FST, fontSize: FS.overline, color: HUD.textFaint }}>
              Visible to players
            </span>
          </div>
          <button
            disabled={busy}
            onClick={onHide}
            style={{
              fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md, padding: '0.1875rem 0.625rem',
              background: 'transparent', color: HUD.textFaint,
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
            }}
          >
            🔒 Hide
          </button>
        </>
      ) : (
        <>
          <span style={{ fontFamily: FST, fontSize: FS.overline, color: HUD.textFaint }}>
            Hidden from players
          </span>
          <button
            disabled={busy}
            onClick={onReveal}
            style={{
              fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
              border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.md, padding: '0.1875rem 0.625rem',
              background: 'var(--hud-gold-subtle)', color: HUD.gold,
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onAdd} title={`Add ${meta.label}`}>
        <DiceFace type={type} size={36} active={count > 0} />
        {count > 0 && (
          <div style={{
            position: 'absolute', top: '-0.25rem', right: '-0.25rem', width: '0.875rem', height: '0.875rem',
            background: meta.color, borderRadius: RADIUS.full,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FR, fontSize: FS.overline, fontWeight: 700, color: HUD.bg,
          }}>
            {count}
          </div>
        )}
      </div>
      {count > 0 && (
        <button onClick={onRemove} style={{
          background: 'transparent', border: `1px solid ${BORDER}`,
          borderRadius: RADIUS.sm, padding: '0.0625rem 0.5rem', cursor: 'pointer',
          fontFamily: FR, fontSize: FS.caption, color: DIM,
        }}>−</button>
      )}
      <div style={{ fontFamily: FR, fontSize: FS.caption, color: DIM, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
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
  const headlineColor = isSuccess ? GREEN : isFailure ? 'var(--state-failure)' : HUD.gold
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
      padding: '0.625rem 0.625rem 0.5rem', marginTop: '0.5rem',
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.lg,
    }}>
      <div style={{
        fontFamily: FC, fontSize: FS.h4, color: headlineColor,
        textAlign: 'center', letterSpacing: '0.08em', marginBottom: '0.375rem',
      }}>
        {headlineText}
      </div>
      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {pills.map(({ count, symKey, label }) => {
            const { icon, color } = SYM[symKey]
            return (
              <div key={symKey} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.125rem 0.5rem', borderRadius: RADIUS.md,
                background: `${color}18`, border: `1px solid ${color}50`,
                fontFamily: FR, fontSize: FS.sm, fontWeight: 700, color,
              }}>
                <i className={`ffi ffi-${icon}`} style={{ fontSize: FS.sm }} />
                {count} {label}
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem', justifyContent: 'center' }}>
        {dice.map((die, i) => {
          const symKeys = die.symbols.filter(s => s in SYM) as SymbolKey[]
          return (
            <div key={i} style={{ position: 'relative' }}>
              <DiceFace type={die.type} size={30} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.0625rem',
              }}>
                {symKeys.length === 0
                  ? <span style={{ color: DIM, fontSize: FS.overline }}>—</span>
                  : symKeys.map((s, j) => (
                      <i key={j} className={`ffi ffi-${SYM[s].icon}`} style={{ color: SYM[s].color, fontSize: FS.overline }} />
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
      padding: '0.625rem 0.625rem 0.5rem', marginTop: '0.5rem',
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.lg,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: FS.h4, color: LIGHT_COL }}>{totalLight}</div>
          <div style={{ fontFamily: FR, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Light</div>
        </div>
        <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: FS.h4, color: DARK_COL }}>{totalDark}</div>
          <div style={{ fontFamily: FR, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dark</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {dice.map((die, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1875rem' }}>
            <DiceFace type="force" size={28} />
            <div style={{ display: 'flex', gap: '0.125rem', minHeight: '0.5rem' }}>
              {Array.from({ length: die.light }).map((_, j) => (
                <div key={`l${j}`} style={{ width: '0.375rem', height: '0.375rem', borderRadius: RADIUS.full, background: LIGHT_COL }} />
              ))}
              {Array.from({ length: die.dark }).map((_, j) => (
                <div key={`k${j}`} style={{ width: '0.375rem', height: '0.375rem', borderRadius: RADIUS.full, background: DARK_COL }} />
              ))}
              {die.light === 0 && die.dark === 0 && (
                <span style={{ fontFamily: FR, fontSize: FS.overline, color: DIM }}>—</span>
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
      padding: '0.625rem 0.625rem 0.5rem', marginTop: '0.5rem',
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.lg,
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: FC, fontSize: FS.h3, color: HUD.gold, letterSpacing: '0.06em', lineHeight: 1 }}>
        {display}
      </div>
      {isDoubles && (
        <div style={{
          display: 'inline-block', marginTop: '0.375rem',
          padding: '0.125rem 0.625rem', borderRadius: RADIUS.md,
          background: 'var(--hud-gold-subtle)', border: `1px solid ${BORDER_HI}`,
          fontFamily: FR, fontSize: FS.caption, fontWeight: 700, color: HUD.gold,
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
  open: controlledOpen,
  onOpenChange,
}: {
  isGmScreenOpen: boolean
  campaignId:     string | null
  open?:          boolean
  onOpenChange?:  (open: boolean) => void
}) {
  const supabase = useMemo(() => createClient(), [])

  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open    = isControlled ? controlledOpen! : internalOpen
  const setOpen = (v: boolean) => { if (isControlled) onOpenChange?.(v); else setInternalOpen(v) }

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
        (!btnRef.current  || !btnRef.current.contains(e.target as Node))
      ) setOpen(false)
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onClick={() => setOpen(!open)}
      title="GM Dice Roller"
      style={{
        background:   open ? 'var(--hud-gold-subtle)' : HUD.bg,
        border:       `2px solid ${open ? HUD.gold : GOLD_DIM}`,
        borderRadius: RADIUS.lg, padding: '0.625rem 1rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontFamily:    FST,
        fontSize:      FS.caption,
        letterSpacing: '0.14em', textTransform: 'uppercase' as const,
        color:         open ? HUD.gold : DIM,
        boxShadow:     open ? '0 0 16px rgba(200,170,80,0.2)' : '0 2px 12px rgba(0,0,0,0.5)',
        transition:    EASE.default,
        whiteSpace:    'nowrap' as const,
      }}
      className={!open ? 'hov-gold' : ''}
    >
      <DiceIcon size={16} />
      Dice
    </button>
  )

  if (!mounted) return isControlled ? null : button

  /* ── Panel ────────────────────────────────────────────── */
  const panel = open ? createPortal(
    <div
      ref={panelRef}
      style={{
        position:             'fixed',
        bottom:               '4.75rem',
        right:                '1.5rem',
        width:                '20rem',
        zIndex:               'var(--z-hud-combat)' as unknown as number,
        background:           PANEL_BG,
        border:               `1px solid ${BORDER_HI}`,
        borderRadius:         RADIUS.xl,
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow:            '0 8px 40px rgba(0,0,0,0.7)',
        maxHeight:            'calc(100vh - 7.5rem)',
        overflowY:            'auto',
        animation:            'gmDicePanelIn 150ms ease-out',
      }}
    >
      {/* ── Header ──────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem 0.625rem',
        borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0,
        background: PANEL_BG, zIndex: Z.raised,
      }}>
        <span style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: HUD.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          GM Dice Roller
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.md,
            width: '1.625rem', height: '1.625rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: DIM, fontSize: FS.h4, lineHeight: 1,
          }}
        >×</button>
      </div>

      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── ROLL LABEL ──────────────────────────── */}
        <div>
          <div style={{
            fontFamily: FR, fontSize: FS.caption, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            color: DIM, marginBottom: '0.375rem',
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
              padding: '0.4375rem 0.625rem',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER_HI}`,
              borderRadius: RADIUS.md,
              color: TEXT, fontFamily: FR, fontSize: FS.sm,
              outline: 'none',
            }}
          />
          {campaignId && (
            <div style={{ fontFamily: FR, fontSize: FS.overline, color: HUD.textFaint, marginTop: '0.25rem' }}>
              Rolls are logged hidden — reveal to players after rolling
            </div>
          )}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* ── NARRATIVE DICE ──────────────────────── */}
        <div>
          <SectionLabel text="Narrative Dice" />

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '0.5rem' }}>
            {POSITIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          <div style={{ height: 1, background: BORDER, margin: '0.25rem 0 0.5rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '0.625rem' }}>
            {NEGATIVE.map(type => (
              <DiceBtn key={type} type={type} count={pool[type]} onAdd={() => addDie(type)} onRemove={() => removeDie(type)} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={() => void handleRollNarrative()}
              disabled={isEmpty}
              style={{
                flex: 1, padding: '0.5rem 0',
                background: isEmpty ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, var(--hud-gold), color-mix(in srgb, var(--hud-gold) 60%, transparent))',
                border: 'none', borderRadius: RADIUS.md, cursor: isEmpty ? 'not-allowed' : 'pointer',
                fontFamily: FC, fontSize: FS.caption, fontWeight: 700,
                letterSpacing: '0.1em', color: isEmpty ? DIM : HUD.bg,
              }}
            >
              {isEmpty ? 'ADD DICE TO ROLL' : `ROLL ${poolSize(pool)} DICE`}
            </button>
            {!isEmpty && (
              <button
                onClick={clearPool}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.md, cursor: 'pointer',
                  fontFamily: FR, fontSize: FS.sm, color: DIM,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
            <DiceFace type="force" size={36} active />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                onClick={() => setForceCount(c => Math.max(1, c - 1))}
                style={{
                  width: '1.5rem', height: '1.5rem', background: 'transparent',
                  border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm,
                  cursor: 'pointer', color: DIM, fontFamily: FR, fontSize: FS.label,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <span style={{ fontFamily: FC, fontSize: FS.h4, color: TEXT, minWidth: '1.25rem', textAlign: 'center' }}>
                {forceCount}
              </span>
              <button
                onClick={() => setForceCount(c => Math.min(8, c + 1))}
                style={{
                  width: '1.5rem', height: '1.5rem', background: 'transparent',
                  border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm,
                  cursor: 'pointer', color: DIM, fontFamily: FR, fontSize: FS.label,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>

            <span style={{ fontFamily: FR, fontSize: FS.caption, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {forceCount === 1 ? '1 die' : `${forceCount} dice`}
            </span>
          </div>

          <button
            onClick={() => void handleRollForce()}
            style={{
              width: '100%', padding: '0.5rem 0',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FC, fontSize: FS.caption, fontWeight: 700,
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
              width: '100%', padding: '0.5rem 0',
              background: 'var(--hud-gold-subtle)', border: `1px solid ${BORDER_HI}`,
              borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FC, fontSize: FS.caption, fontWeight: 700,
              letterSpacing: '0.1em', color: HUD.gold,
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
      {!isControlled && button}
      {panel}
    </>
  )
}
