'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NumberField } from '@/components/ui/NumberField'
import type { MapToken, TokenGeometryPatch } from '@/hooks/useMapTokens'
import { RADIUS } from '@/lib/tokens'

/**
 * GM-only floating inspector for one vehicle token's per-placement geometry
 * (migration 145): width / height in squares (1.0 = one standard token, the
 * same base unit as `token_size`) and rotation in degrees.
 *
 * Preview vs commit: typing previews the token on the canvas locally
 * (`onPreview`, nothing written, so players never see half-typed values).
 * Blur, Enter, a nudge, or Reset commit through `onCommit` — one write. Escape
 * reverts an unsaved preview to the last saved values and closes.
 *
 * Portalled to document.body (the map canvas ancestors carry transforms, which
 * would break `position: fixed`). Placed beside `anchor` (the token's footprint
 * rect from MapCanvas), flipped to the other side if it would leave the screen,
 * and draggable by its header.
 */

const MIN_SQ = 0.25
const MAX_SQ = 20
const NUDGE_DEG = 15
// Placement arithmetic only (screen-edge margin and gap beside the token) —
// not styling, so these are plain pixels rather than layout tokens.
const EDGE_PX = 8
const GAP_PX  = 12

const clampSize = (n: number) => Math.round(Math.min(MAX_SQ, Math.max(MIN_SQ, n)) * 100) / 100
const normRot   = (n: number) => ((Math.round(n) % 360) + 360) % 360
const parse     = (v: string): number | null => { const n = parseFloat(v); return Number.isFinite(n) ? n : null }

type Draft = { w: string; h: string; rot: string }

interface Props {
  token:     MapToken
  anchor:    DOMRect
  onPreview: (id: string, geo: TokenGeometryPatch | null) => void
  onCommit:  (id: string, geo: TokenGeometryPatch) => void | Promise<void>
  onClose:   () => void
}

export function TokenGeometryInspector({ token, anchor, onPreview, onCommit, onClose }: Props) {
  const base = token.token_size ?? 1
  const savedRef = useRef<TokenGeometryPatch>({
    token_w: token.token_w ?? null,
    token_h: token.token_h ?? null,
    token_rot: token.token_rot ?? 0,
  })
  const initialDraft: Draft = { w: String(token.token_w ?? base), h: String(token.token_h ?? base), rot: String(token.token_rot ?? 0) }
  const [w, setW]     = useState(initialDraft.w)
  const [h, setH]     = useState(initialDraft.h)
  const [rot, setRot] = useState(initialDraft.rot)
  const [isDefault, setIsDefault] = useState(token.token_w == null && token.token_h == null)
  // Latest drafts for handlers that must not read a stale closure (rapid nudges, outside-click commit).
  const draft = useRef<Draft>(initialDraft)
  const cancelled = useRef(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  // Resolve drafts (falling back to the saved effective value for anything unparsable).
  const resolve = useCallback((d: Draft): TokenGeometryPatch => {
    const s = savedRef.current
    return {
      token_w:   clampSize(parse(d.w) ?? s.token_w ?? base),
      token_h:   clampSize(parse(d.h) ?? s.token_h ?? base),
      token_rot: normRot(parse(d.rot) ?? s.token_rot),
    }
  }, [base])

  const setDraft = (next: Partial<Draft>) => {
    draft.current = { ...draft.current, ...next }
    if (next.w !== undefined) setW(next.w)
    if (next.h !== undefined) setH(next.h)
    if (next.rot !== undefined) setRot(next.rot)
  }

  const preview = (next: Partial<Draft>) => {
    setDraft(next)
    onPreview(token.id, resolve(draft.current))
  }

  const sameEffective = useCallback((a: TokenGeometryPatch, b: TokenGeometryPatch) =>
    (a.token_w ?? base) === (b.token_w ?? base) && (a.token_h ?? base) === (b.token_h ?? base) && a.token_rot === b.token_rot,
  [base])

  /** Normalises the drafts, and writes once if they differ from the last saved values. Idempotent. */
  const commit = useCallback((override?: Partial<Draft>) => {
    if (cancelled.current) return
    if (override) draft.current = { ...draft.current, ...override }
    const g = resolve(draft.current)
    draft.current = { w: String(g.token_w), h: String(g.token_h), rot: String(g.token_rot) }
    setW(draft.current.w); setH(draft.current.h); setRot(draft.current.rot)
    if (sameEffective(savedRef.current, g)) return
    savedRef.current = g
    setIsDefault(false)
    void onCommit(token.id, g)
  }, [resolve, sameEffective, onCommit, token.id])

  const cancel = useCallback(() => {
    cancelled.current = true
    onPreview(token.id, savedRef.current)
    onPreview(token.id, null)
    onClose()
  }, [onPreview, onClose, token.id])

  const reset = () => {
    const g: TokenGeometryPatch = { token_w: null, token_h: null, token_rot: 0 }
    savedRef.current = g
    setIsDefault(true)
    draft.current = { w: String(base), h: String(base), rot: '0' }
    setW(draft.current.w); setH(draft.current.h); setRot('0')
    void onCommit(token.id, g)
  }

  // Escape reverts + closes; a press outside commits pending drafts then closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      cancel()
    }
    const onDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      commit()
      cancelled.current = true
      onPreview(token.id, null)
      onClose()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [cancel, commit, onClose, onPreview, token.id])

  // Initial placement: beside the token, flipped if it would run off screen.
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    const pw = el.offsetWidth, ph = el.offsetHeight
    let x = anchor.right + GAP_PX
    if (x + pw > window.innerWidth - EDGE_PX) x = anchor.left - GAP_PX - pw
    x = Math.max(EDGE_PX, Math.min(x, window.innerWidth - pw - EDGE_PX))
    const y = Math.max(EDGE_PX, Math.min(anchor.top, window.innerHeight - ph - EDGE_PX))
    setPos({ x, y })
  }, [anchor])

  // Header drag.
  const startDrag = (e: React.PointerEvent) => {
    if (!pos) return
    const startX = e.clientX, startY = e.clientY, origin = pos
    const move = (ev: PointerEvent) => setPos({ x: origin.x + ev.clientX - startX, y: origin.y + ev.clientY - startY })
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); commit() } }
  const nudge = (delta: number) => {
    const cur = parse(draft.current.rot) ?? savedRef.current.token_rot
    const next = String(normRot(cur + delta))
    setDraft({ rot: next })
    onPreview(token.id, resolve(draft.current))
    commit({ rot: next })
  }

  return createPortal(
    <div
      ref={panelRef}
      className="tgi"
      role="dialog"
      aria-label="Resize and rotate token"
      // left/top are runtime values (anchor placement + header drag); hidden until first measured so it never flashes at 0,0.
      style={{ left: pos?.x ?? 0, top: pos?.y ?? 0, visibility: pos ? 'visible' : 'hidden', borderRadius: RADIUS.lg }}
    >
      <div className="tgi-hdr" onPointerDown={startDrag}>
        <span className="eyebrow">Resize / rotate</span>
        <span className="tgi-name">{token.label}</span>
      </div>
      <div className="tgi-body">
        <label className="tgi-row">
          <span className="tgi-lbl">Width (squares)</span>
          <NumberField
            className="tgi-input" value={w} min={MIN_SQ} max={MAX_SQ} step={0.25}
            onChange={e => preview({ w: e.target.value })} onBlur={() => commit()} onKeyDown={onEnter}
          />
        </label>
        <label className="tgi-row">
          <span className="tgi-lbl">Height (squares)</span>
          <NumberField
            className="tgi-input" value={h} min={MIN_SQ} max={MAX_SQ} step={0.25}
            onChange={e => preview({ h: e.target.value })} onBlur={() => commit()} onKeyDown={onEnter}
          />
        </label>
        <div className="tgi-row">
          <label className="tgi-lbl" htmlFor="tgi-rot">Rotation (°)</label>
          <div className="tgi-rot">
            <button type="button" className="tgi-btn" onClick={() => nudge(-NUDGE_DEG)} aria-label="Rotate 15 degrees counter-clockwise">−{NUDGE_DEG}</button>
            <NumberField
              id="tgi-rot" className="tgi-input" value={rot} step={1}
              onChange={e => preview({ rot: e.target.value })} onBlur={() => commit()} onKeyDown={onEnter}
            />
            <button type="button" className="tgi-btn" onClick={() => nudge(NUDGE_DEG)} aria-label="Rotate 15 degrees clockwise">+{NUDGE_DEG}</button>
          </div>
        </div>
        <div className="tgi-foot">
          <span className="tgi-hint">{isDefault ? 'default size' : ''}</span>
          <button type="button" className="tgi-btn" onClick={reset} disabled={isDefault && parse(rot) === 0}>Reset</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
