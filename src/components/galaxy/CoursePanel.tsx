'use client'

import { useId, useMemo, useState } from 'react'
import { CONFIG, type GraphNode } from '@/lib/astrogation'
import type { MapPin } from './GalaxyMap'
import styles from './galaxy.module.css'

/** A chosen end of the trip: a charted planet, or a saved pin. */
export type Pick = { kind: 'sys'; id: string } | { kind: 'pin'; id: string }

interface Option { pick: Pick; name: string; sub: string }

const MAX_MATCHES = 12
const CLASS_LABEL: Record<number, string> = { 0.5: '½' }

function SearchField({ label, dot, value, options, onPick, onClear }: {
  label: string
  dot: string
  value: string
  options: Option[]
  onPick: (p: Pick) => void
  onClear: () => void
}) {
  const listId = useId()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const q = text.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!q) return []
    const starts: Option[] = []
    const inside: Option[] = []
    for (const o of options) {
      const n = o.name.toLowerCase()
      if (n.startsWith(q)) starts.push(o)
      else if (n.includes(q)) inside.push(o)
      if (starts.length >= MAX_MATCHES) break
    }
    return [...starts, ...inside].slice(0, MAX_MATCHES)
  }, [q, options])

  const choose = (o: Option) => { onPick(o.pick); setText(''); setOpen(false) }
  const shown = open ? text : value

  return (
    <div className={styles.field}>
      <label><b className={dot} />{label}</label>
      <input
        className={styles.inp}
        value={shown}
        placeholder="Search planets"
        role="combobox"
        aria-expanded={open && q.length > 0}
        aria-controls={listId}
        aria-label={label}
        autoComplete="off"
        onFocus={() => { setOpen(true); setText('') }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={e => { setText(e.target.value); setCursor(0); setOpen(true) }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, matches.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
          else if (e.key === 'Enter' && matches[cursor]) { e.preventDefault(); choose(matches[cursor]) }
          else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {value && <button type="button" className={styles.clr} aria-label={`Clear ${label}`} onClick={onClear}>✕</button>}
      {open && q.length > 0 && (
        <div id={listId} className={styles.sugg} role="listbox">
          {matches.length === 0 && <div className={styles.noMatch}>No plotted planet. Drop a pin.</div>}
          {matches.map((o, i) => (
            <button
              key={`${o.pick.kind}:${o.pick.id}`}
              type="button"
              role="option"
              aria-selected={i === cursor}
              className={i === cursor ? styles.on : undefined}
              onMouseDown={e => e.preventDefault()}
              onClick={() => choose(o)}
            >
              <span>{o.name}</span><small>{o.sub}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  nodes: GraphNode[]
  pins: MapPin[]
  origin: Pick | null
  dest: Pick | null
  hyperdrive: number
  pinMode: boolean
  canPin: boolean
  nameOf: (p: Pick | null) => string
  onOrigin: (p: Pick | null) => void
  onDest: (p: Pick | null) => void
  onSwap: () => void
  onHyperdrive: (c: number) => void
  onTogglePinMode: () => void
  onRenamePin: (id: string, name: string) => void
  onDeletePin: (id: string) => void
}

export function CoursePanel(p: Props) {
  const [confirm, setConfirm] = useState<string | null>(null)
  const options = useMemo<Option[]>(() => {
    const pinOpts: Option[] = p.pins.map(x => ({ pick: { kind: 'pin', id: x.id }, name: x.name, sub: 'pin' }))
    const sysOpts: Option[] = p.nodes.map(n => ({ pick: { kind: 'sys', id: n.id }, name: n.name, sub: n.region ?? '' }))
    return [...pinOpts, ...sysOpts]
  }, [p.nodes, p.pins])
  const sortedPins = useMemo(() => [...p.pins].sort((a, b) => a.name.localeCompare(b.name)), [p.pins])

  return (
    <>
      <section className={styles.sec} aria-label="Course">
        <h2>Course</h2>
        <SearchField label="Origin" dot={styles.dotOrigin} value={p.nameOf(p.origin)} options={options} onPick={p.onOrigin} onClear={() => p.onOrigin(null)} />
        <div className={styles.swap}>
          <button type="button" className={styles.swapBtn} onClick={p.onSwap} aria-label="Swap origin and destination">⇅</button>
        </div>
        <SearchField label="Destination" dot={styles.dotDest} value={p.nameOf(p.dest)} options={options} onPick={p.onDest} onClear={() => p.onDest(null)} />
        <button type="button" className={styles.pinbtn} aria-pressed={p.pinMode} onClick={p.onTogglePinMode} disabled={!p.canPin}>
          ◇ Drop uncharted pin
        </button>
        <div className={styles.hint}>
          {p.canPin ? 'Click a planet to set origin, then destination. Scroll to zoom, drag to pan.' : 'Open from a campaign to save pins.'}
        </div>
        {sortedPins.length > 0 && (
          <ul className={styles.pinList} aria-label="Saved pins">
            {sortedPins.map(pin => (
              <li key={pin.id} className={styles.pinRow}>
                {confirm === pin.id ? (
                  <>
                    <span className={styles.pinConfirm}>Delete “{pin.name}”?</span>
                    <button type="button" className={styles.danger} onClick={() => { p.onDeletePin(pin.id); setConfirm(null) }}>Delete</button>
                    <button type="button" onClick={() => setConfirm(null)}>Keep</button>
                  </>
                ) : (
                  <>
                    <input
                      defaultValue={pin.name}
                      aria-label={`Pin name ${pin.name}`}
                      onBlur={e => { const v = e.target.value.trim(); if (v && v !== pin.name) p.onRenamePin(pin.id, v); else e.target.value = pin.name }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    />
                    <button type="button" aria-label={`Delete pin ${pin.name}`} onClick={() => setConfirm(pin.id)}>✕</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={styles.sec} aria-label="Hyperdrive class">
        <h2>Hyperdrive class</h2>
        <div className={styles.seg} role="group">
          {CONFIG.hyperdriveClasses.map(c => (
            <button key={c} type="button" aria-pressed={p.hyperdrive === c} onClick={() => p.onHyperdrive(c)}>{CLASS_LABEL[c] ?? c}</button>
          ))}
        </div>
        <div className={styles.hint}>Party ship sets this. Boost and setback stay at the table.</div>
      </section>
    </>
  )
}
