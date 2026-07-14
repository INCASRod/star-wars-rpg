'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import type { MapToken } from '@/hooks/useMapTokens'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import { createClient } from '@/lib/supabase/client'
import { buildRoster, type RosterEntry } from '@/components/gm/EncounterDeck'
import { CheckConsole } from '@/components/gm/CheckConsole'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
import { HUD, FS, SP, RADIUS, FONT_BODY, FONT_DISPLAY, Z, SHADOW, COLOR } from '@/lib/tokens'

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

const CHAR_ROW: Array<[keyof AdversaryInstance['characteristics'], string]> = [
  ['brawn', 'BR'], ['agility', 'AG'], ['intellect', 'INT'],
  ['cunning', 'CUN'], ['willpower', 'WIL'], ['presence', 'PR'],
]

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
  // Wired up by Task 6: clicking a weapon's ATTACK button switches the
  // check-console column to the Combat tab with that weapon pre-selected.
  // Optional + no-op default so this task doesn't have to touch call sites.
  onAttackWeapon?: (weaponIndex: number) => void
}

export function EncounterDossier({
  entityId, sourceRect, encounter, setEncounter, saveEncounter,
  supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending, characters,
  onClose, onToggleVisibility, onBenchDeploy, onRemove, onAttackWeapon,
}: EncounterDossierProps) {
  const { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain } =
    useEncounterCombatControls({
      encounter, setEncounter, saveEncounter,
      supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending,
    })
  // Bumped by the weapons list's ATTACK button below — CheckConsole reacts
  // via a useEffect to force-switch its own tab to Combat. Full weapon
  // pre-selection logic lands in Task 6; this task only needs the
  // tab-switch to already work end-to-end for verification.
  const [attackWeaponSignal, setAttackWeaponSignal] = useState<number | null>(null)
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
  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null

  // Normalize adversary vs. vehicle weapons into a common display shape.
  // AdversaryWeapon carries name/damage/crit directly; VehicleWeapon only
  // carries a `weaponKey` that must be resolved against the static
  // VEHICLE_WEAPON_STATS table via vehicleWeaponStats/vehicleWeaponDisplayName
  // (confirmed against src/lib/adversaries.ts and src/lib/vehicles.ts —
  // AdversaryWeapon has no `critical` field, it's `crit`; VehicleWeapon has
  // no name/damage/critical fields at all).
  const weaponRows = veh
    ? veh.weapons.map((w, i) => {
        const stats = vehicleWeaponStats(w.weaponKey)
        const name = `${w.count > 1 ? `${w.count}× ` : ''}${vehicleWeaponDisplayName(w.weaponKey)}${w.turret ? ' (Turret)' : ''}`
        return { key: i, name, damage: stats?.damage ?? '—', crit: stats?.crit }
      })
    : (adv?.weapons ?? []).map((w, i) => ({ key: i, name: w.name, damage: w.damage, crit: w.crit }))

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
          {/* Stats column */}
          <div style={{
            padding: SP[4], display: 'flex', flexDirection: 'column', gap: SP[4],
            overflowY: 'auto', maxHeight: '32.5rem', borderRight: `1px solid ${HUD.border}`,
          }}>
            {adv && (
              <div>
                <div className="dossier-sec-label">Characteristics</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: SP[1], marginTop: SP[1] }}>
                  {CHAR_ROW.map(([field, label]) => (
                    <div key={label} style={{
                      aspectRatio: '1 / 1.05', background: 'var(--hud-surface-hi)', border: `1px solid ${HUD.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 1, // below the SP floor — micro-gap between stacked number/label inside a compact stat box
                    }}>
                      <b style={{ fontFamily: FD, fontSize: FS.h4, color: HUD.text }}>{adv.characteristics[field]}</b>
                      <span style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.08em', color: HUD.textFaint, fontWeight: 700 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adv && adv.type === 'minion' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)',
                border: `1px solid color-mix(in srgb, ${HUD.gold} 30%, transparent)`, borderRadius: RADIUS.sm, padding: `${SP[2]} ${SP[3]}`,
              }}>
                <span style={{ flex: 1, fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', color: HUD.gold }}>GROUP SIZE</span>
                <button className="dossier-step-btn" onClick={() => void adjustGroupSize(adv, -1)}>−</button>
                <b style={{ fontFamily: FD, fontSize: FS.h3, minWidth: '1.875rem', textAlign: 'center' }}>{adv.groupSize}</b>
                <button className="dossier-step-btn" onClick={() => void adjustGroupSize(adv, 1)}>+</button>
                <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textFaint }}>
                  ranks {Math.max(0, adv.groupRemaining - 1)} · alive <b style={{ color: HUD.gold }}>{adv.groupRemaining}</b>
                </span>
              </div>
            )}

            <div>
              <div className="dossier-sec-label">Vitals</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP[3], marginTop: SP[1] }}>
                <VitalStepper
                  label={veh ? 'HULL TRAUMA' : 'WOUNDS'}
                  current={entry.woundsCurrent} max={entry.woundsMax} color={RED}
                  onAdjust={d => { if (adv) void adjustAdversaryWounds(adv, d); else if (veh) void adjustHullTrauma(veh, d) }}
                />
                {(adv?.type === 'nemesis' && adv.strainThreshold !== undefined) || veh ? (
                  <VitalStepper
                    label={veh ? 'SYS STRAIN' : 'STRAIN'}
                    current={veh ? veh.systemStrainCurrent : (adv?.strainCurrent ?? 0)}
                    max={veh ? veh.systemStrainThreshold : (adv?.strainThreshold ?? 0)}
                    color="var(--hud-accent)"
                    onAdjust={d => { if (adv) void adjustAdversaryStrain(adv, d); else if (veh) void adjustSystemStrain(veh, d) }}
                  />
                ) : (
                  <div style={{
                    background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
                    padding: `${SP[2]} ${SP[3]}`, display: 'flex', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', color: HUD.textDim, flex: 1 }}>STRAIN</span>
                    <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint }}>AS WOUNDS</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="dossier-sec-label">{veh ? 'Vehicle Profile' : 'Defenses'}</div>
              <div style={{ display: 'flex', gap: SP[2], marginTop: SP[1] }}>
                {veh ? (
                  <>
                    <Derived label="SIL" value={veh.silhouette} /><Derived label="SPEED" value={veh.speed} />
                    <Derived label="HANDLING" value={`+${veh.handling}`} /><Derived label="ARMOR" value={veh.armor} />
                  </>
                ) : adv ? (
                  <>
                    <Derived label="SOAK" value={adv.soak} />
                    <Derived label="M DEF" value={adv.defense.melee} /><Derived label="R DEF" value={adv.defense.ranged} />
                  </>
                ) : null}
              </div>
            </div>

            <div>
              <div className="dossier-sec-label">{veh ? 'Armament' : 'Weapons'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
                {weaponRows.map(w => (
                  <div key={w.key} style={{
                    display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)',
                    border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: HUD.text, flex: 1, minWidth: 0 }}>{w.name}</span>
                    <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, flexShrink: 0 }}>
                      DMG {w.damage}{w.crit !== undefined ? ` · CRIT ${w.crit}` : ''}
                    </span>
                    <button
                      className="dossier-attack-btn"
                      onClick={() => { setAttackWeaponSignal(w.key); onAttackWeapon?.(w.key) }}
                    >⌖ ATTACK</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="dossier-sec-label">Abilities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
                {(veh ? (veh.abilities ?? []) : (adv?.abilities ?? [])).map((a, i) => (
                  <div key={i} style={{
                    fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5,
                    borderLeft: `2px solid ${HUD.borderHi}`, paddingLeft: SP[2],
                  }}>
                    <b style={{ color: HUD.text }}>{a.name}.</b> {a.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Check console column */}
          <CheckConsole
            entry={entry}
            campaignId={campaignId}
            characters={characters}
            encounter={encounter}
            attackWeaponSignal={attackWeaponSignal}
          />
        </div>
      </div>
    </>
  )
}

function VitalStepper({ label, current, max, color, onAdjust }: {
  label: string, current: number, max: number, color: string, onAdjust: (delta: number) => void,
}) {
  return (
    <div style={{
      background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
      padding: `${SP[2]} ${SP[3]}`, display: 'flex', alignItems: 'center', gap: SP[2],
    }}>
      <span style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', color: HUD.textDim, flex: 1 }}>{label}</span>
      <button className="dossier-step-btn" onClick={() => onAdjust(-1)}>−</button>
      <span style={{ fontFamily: FD, fontSize: FS.h3, fontWeight: 700, minWidth: '4rem', textAlign: 'center', color }}>
        {current}<small style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textFaint, fontWeight: 400 }}>/{max}</small>
      </span>
      <button className="dossier-step-btn" onClick={() => onAdjust(1)}>+</button>
    </div>
  )
}

function Derived({ label, value }: { label: string, value: string | number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[1]}` }}>
      <b style={{ fontFamily: FD, fontSize: FS.sm, display: 'block' }}>{value}</b>
      <span style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.1em', color: HUD.textFaint, fontWeight: 700 }}>{label}</span>
    </div>
  )
}
