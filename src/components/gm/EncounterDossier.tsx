'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import type { MapToken } from '@/hooks/useMapTokens'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import { createClient } from '@/lib/supabase/client'
import { buildRoster, type RosterEntry } from '@/components/gm/EncounterDeck'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import { HUD, FS, SP, FONT_BODY, FONT_DISPLAY, Z, SHADOW, COLOR } from '@/lib/tokens'

// NOTE on GSAP Flip: the plan called for `Flip.fit(el, sourceRect, {...})`,
// but Flip.fit's `toEl` argument is resolved through `ElementState`, which
// internally calls `toEl.getBoundingClientRect()` / reads `toEl.parentNode`
// etc. — it requires a live DOM element or a previously-captured
// `Flip.FlipState`, not a plain `DOMRect` object (confirmed by reading
// gsap's Flip.js source: `_parseElementState` → `new ElementState(elOrNode)`
// → `element.getBoundingClientRect()`). Passing a raw DOMRect fails both the
// TypeScript signature (`DOMTarget | FlipState`) and at runtime. Since the
// "source" here is an arbitrary rect captured from a click event — not a
// live second element — this uses the same underlying technique the Flip
// plugin itself is built on (a manual FLIP: compute the position/scale
// delta between the source rect and the element's natural resting rect,
// then `gsap.fromTo`/`gsap.to` on `x`/`y`/`scaleX`/`scaleY`) without
// depending on the plugin's live-element requirement.
const FC = FONT_BODY
const FD = FONT_DISPLAY
const RED = COLOR.red
const GREEN = COLOR.green
const PANEL_BG = 'color-mix(in srgb, var(--hud-panel) 92%, transparent)'

export interface EncounterDossierProps {
  entityId:      string | null   // null = closed
  sourceRect:    DOMRect | null
  encounter:     CombatEncounter | null
  setEncounter:  React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  saveEncounter: (partial: Partial<CombatEncounter>) => Promise<void>
  supabase:      ReturnType<typeof createClient>
  campaignId:    string
  tokens:        MapToken[]
  updateTokenWoundPct: (id: string, wound_pct: number) => Promise<void>
  markPending:   (key: string) => void
  clearPending:  (key: string) => void
  characters:    Character[]
  onClose:       () => void
  onToggleVisibility: (id: string, visible: boolean) => Promise<void>
  onBenchDeploy: (entry: RosterEntry) => void   // reuses EncounterDeck's hoisted benchEntry/deployEntry
  onRemove:      (entry: RosterEntry) => void   // reuses EncounterDeck's hoisted removeEntry
}

export function EncounterDossier({
  entityId, sourceRect, encounter, tokens,
  onClose, onToggleVisibility, onBenchDeploy, onRemove,
}: EncounterDossierProps) {
  // Derived from `encounter` directly — EncounterDossier is a sibling of
  // EncounterDeck, not a child, so it re-derives the roster the same way
  // rather than depending on EncounterDeck to hand it a RosterEntry prop.
  const { tokenImages: advImages } = useAdversaryTokenImages()
  const { tokenImages: vehImages } = useVehicleTokenImages()
  const roster = useMemo(
    () => buildRoster(encounter, tokens, advImages, vehImages),
    [encounter, tokens, advImages, vehImages],
  )
  const entry = roster.find(r => r.instanceId === entityId) ?? null

  // ── FLIP open/close ──────────────────────────────────────────────────
  const dossierRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)   // controls mount/unmount timing around the exit tween

  useEffect(() => {
    if (entityId && sourceRect) setRendered(true)
  }, [entityId, sourceRect])

  // useLayoutEffect (not useEffect) — runs synchronously after the DOM
  // mutation but before the browser paints, so the very first painted frame
  // already shows the element transformed to sourceRect's position/size
  // (no one-frame flash at its natural resting layout first).
  useLayoutEffect(() => {
    if (!rendered || !entityId || !sourceRect || !dossierRef.current) return
    const el = dossierRef.current
    // Lock in the element's natural centered position first. xPercent/yPercent
    // are separate GSAP transform components from x/y, so they compose
    // correctly with the pixel-based x/y tween below instead of being
    // clobbered by it — unlike a raw CSS `transform: translate(-50%,-50%)`
    // string would be once GSAP starts writing its own `transform` value.
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const finalRect = el.getBoundingClientRect()
    const scaleX = sourceRect.width / finalRect.width
    const scaleY = sourceRect.height / finalRect.height
    const dx = (sourceRect.left + sourceRect.width / 2) - (finalRect.left + finalRect.width / 2)
    const dy = (sourceRect.top + sourceRect.height / 2) - (finalRect.top + finalRect.height / 2)
    gsap.fromTo(el,
      { x: dx, y: dy, scaleX, scaleY, opacity: 0.85 },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: 'power3.out' },
    )
  }, [rendered, entityId, sourceRect])

  const handleClose = () => {
    const el = dossierRef.current
    if (!el || !sourceRect) { onClose(); setRendered(false); return }
    const finalRect = el.getBoundingClientRect()
    const scaleX = sourceRect.width / finalRect.width
    const scaleY = sourceRect.height / finalRect.height
    const dx = (sourceRect.left + sourceRect.width / 2) - (finalRect.left + finalRect.width / 2)
    const dy = (sourceRect.top + sourceRect.height / 2) - (finalRect.top + finalRect.height / 2)
    gsap.to(el, {
      x: dx, y: dy, scaleX, scaleY, opacity: 0, duration: 0.28, ease: 'power2.in',
      onComplete: () => { onClose(); setRendered(false) },
    })
  }

  if (!rendered || !entry) return null

  const accent = entry.alignment === 'allied_npc' ? GREEN : RED

  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: 'absolute', inset: 0, zIndex: Z.dossier - 1,
          background: 'color-mix(in srgb, var(--hud-bg) 68%, transparent)',
          backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        }}
      />
      <div
        ref={dossierRef}
        style={{
          // No `transform: translate(-50%,-50%)` here — the useLayoutEffect
          // above sets xPercent/yPercent via GSAP instead, since GSAP owns
          // the `transform` property for the open/close tween and a raw CSS
          // transform string would be overwritten by it.
          position: 'absolute', left: '50%', top: '46%',
          width: 'min(53.75rem, 92vw)', zIndex: Z.dossier,
          background: PANEL_BG, border: `1px solid ${HUD.borderHi}`,
          boxShadow: SHADOW.dossier,
        }}
      >
        <div style={{ height: 3, background: accent }} />
        <div style={{ display: 'grid', gridTemplateColumns: '14.75rem 1fr 18.75rem', minHeight: '26.875rem' }}>
          <div style={{ position: 'relative', borderRight: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--hud-surface-lo)' }}>
              {entry.imageUrl
                ? <img src={entry.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FD, fontSize: FS.h1, color: 'var(--hud-text-faint)',
                  }}>{entry.name.charAt(0)}</div>
              }
            </div>
            <div style={{ padding: SP[3], borderTop: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              <div style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.15 }}>
                {entry.name}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--hud-text-faint)' }}>
                {entry.kind === 'vehicle'
                  ? `VEHICLE · SILHOUETTE ${(entry.entity as VehicleInstance).silhouette}`
                  : (entry.entity as AdversaryInstance).type.toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: SP[1], flexWrap: 'wrap', marginTop: SP[1] }}>
                <button className="dossier-ctl-btn" onClick={() => void onToggleVisibility(entry.tokenId ?? '', entry.isHidden)}>
                  {entry.isHidden ? '👁 REVEAL' : '◌ HIDE'}
                </button>
                <button className="dossier-ctl-btn" onClick={() => onBenchDeploy(entry)}>
                  {entry.isOnMap ? '⌖ BENCH' : '⌖ DEPLOY'}
                </button>
                <button className="dossier-ctl-btn dossier-ctl-danger" onClick={() => onRemove(entry)}>✕ REMOVE</button>
              </div>
            </div>
          </div>
          {/* Stats column — Task 4 */}
          <div id="dossier-stats-slot" />
          {/* Check console column — Tasks 5-6 */}
          <div id="dossier-check-slot" />
        </div>
      </div>
    </>
  )
}
