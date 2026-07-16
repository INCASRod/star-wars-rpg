'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { toast } from 'sonner'
import type { CombatEncounter } from '@/lib/combat'
import type { MapToken } from '@/hooks/useMapTokens'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import { resolveWeapon } from '@/lib/resolve-weapon'
import { createClient } from '@/lib/supabase/client'
import { buildRoster, type RosterEntry } from '@/components/gm/EncounterDeck'
import { CheckConsole } from '@/components/gm/CheckConsole'
import { RichText } from '@/components/ui/RichText'
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
  /** Optimistic-local-state token rename (src/hooks/useMapTokens.ts) — used instead of a
   *  raw supabase write so a nickname rename shows on the map instantly, not just after
   *  the next Realtime round-trip/reload (mirrors updateTokenWoundPct's own pattern). */
  renameToken:   (id: string, label: string) => Promise<void>
  markPending:   (key: string) => void
  clearPending:  (key: string) => void
  /** Patches existing map_tokens rows after an image upload — same pattern AdversaryDetailPanel/VehicleDetailPanel use. */
  activeMapId:   string | null
  /**
   * Shared with EncounterDeck via their common parent (GmMapView) — see
   * EncounterDeck.tsx's EncounterDeckProps.advImages doc comment for why
   * this can't be a component-local useAdversaryTokenImages()/
   * useVehicleTokenImages() call: dossier and deck are siblings, and an
   * image uploaded here must be visible on the deck's roster card without
   * a page reload.
   */
  advImages:     Record<string, string>
  vehImages:     Record<string, string>
  setAdvImages:  React.Dispatch<React.SetStateAction<Record<string, string>>>
  setVehImages:  React.Dispatch<React.SetStateAction<Record<string, string>>>
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
  supabase, campaignId, tokens, updateTokenWoundPct, renameToken, markPending, clearPending, activeMapId,
  advImages, vehImages, setAdvImages, setVehImages,
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
  const roster = useMemo(
    () => buildRoster(encounter, tokens, advImages, vehImages, activeMapId),
    [encounter, tokens, advImages, vehImages, activeMapId],
  )
  const entry = roster.find(r => r.instanceId === entityId) ?? null

  // ── Nickname (GM-set display override) — purely cosmetic. `entity.name`
  // (the real identity — image keying, roll labels, initiative) is never
  // touched; this only patches `nickname` on the encounter's own instance
  // record, plus `renameToken` (src/hooks/useMapTokens.ts — optimistic local
  // state + supabase write, same shape as `updateTokenWoundPct`) so the
  // on-map token's label updates instantly instead of waiting on a Realtime
  // round-trip/reload.
  const [renaming, setRenaming] = useState(false)
  const [draftNickname, setDraftNickname] = useState('')
  const startRenaming = () => {
    if (!entry) return
    setDraftNickname((entry.entity as { nickname?: string }).nickname ?? '')
    setRenaming(true)
  }
  const handleSaveNickname = async () => {
    if (!entry || !encounter) { setRenaming(false); return }
    const nickname = draftNickname.trim() || undefined
    if (entry.kind === 'adversary') {
      await saveEncounter({
        adversaries: encounter.adversaries.map(a => a.instanceId === entry.instanceId ? { ...a, nickname } : a),
      })
    } else {
      await saveEncounter({
        vehicles: (encounter.vehicles ?? []).map(v => v.instanceId === entry.instanceId ? { ...v, nickname } : v),
      })
    }
    if (entry.tokenId) {
      await renameToken(entry.tokenId, nickname || entry.name)
    }
    setRenaming(false)
  }

  // ── Hero image upload — same storage/write path as AdversaryDetailPanel /
  // VehicleDetailPanel (src/components/gm/AdversaryDetailPanel.tsx:111-152,
  // VehicleDetailPanel.tsx:93-133): upload to the 'tokens' bucket, upsert the
  // name/key-keyed row in adversary_token_images or vehicle_token_images,
  // then patch this instance's own map_tokens row so the token updates live.
  // Adversaries key by display name (matches buildRoster's advImages[a.name]
  // lookup — the same key used to read is used to write, so this exact
  // instance always resolves correctly even though duplicate-suffixed
  // instances, e.g. "Stormtrooper 2", have historically never shared an
  // image with the base name — pre-existing behavior, not changed here).
  // Vehicles key by sourceId (== library vehicle.key), matching buildRoster's
  // vehImages[v.sourceId] lookup, which is stable across instance renames.
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !entry) return
    const kind = entry.kind
    const vehKey = kind === 'vehicle' ? (entry.entity as VehicleInstance).sourceId : null
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const slug = (kind === 'vehicle' ? vehKey! : entry.name).replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const path = kind === 'vehicle' ? `vehicle-${slug}.${ext}` : `${slug}.${ext}`
      const { error: upErr } = await supabase.storage.from('tokens').upload(path, file, { upsert: true })
      if (upErr) throw new Error(upErr.message ?? String(upErr))

      const { data } = supabase.storage.from('tokens').getPublicUrl(path)
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`

      if (kind === 'vehicle') {
        const { error: dbErr } = await supabase.from('vehicle_token_images').upsert({ vehicle_key: vehKey, token_image_url: urlWithBust })
        if (dbErr) throw new Error(dbErr.message ?? String(dbErr))
        setVehImages(prev => ({ ...prev, [vehKey!]: urlWithBust }))
      } else {
        const { error: dbErr } = await supabase.from('adversary_token_images').upsert({ adversary_key: entry.name, token_image_url: urlWithBust })
        if (dbErr) throw new Error(dbErr.message ?? String(dbErr))
        setAdvImages(prev => ({ ...prev, [entry.name]: urlWithBust }))
      }

      if (activeMapId) {
        await supabase.from('map_tokens').update({ token_image_url: urlWithBust }).eq('map_id', activeMapId).eq('label', entry.name)
      }
      toast.success(`Token image updated for ${entry.name}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Token upload failed:', msg)
      toast.error(`Token upload failed: ${msg}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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
    : (adv?.weapons ?? []).map((w, i) => {
        const { dmg, crit } = resolveWeapon(w, adv!.characteristics.brawn, {})
        return { key: i, name: w.name, damage: dmg, crit }
      })

  const abilities = veh ? (veh.abilities ?? []) : (adv?.abilities ?? [])

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
          // % resolves against the map-area div (position:relative, the
          // nearest positioned ancestor — see GmMapView.tsx's MAP AREA,
          // flex:1, overflow:hidden), NOT the viewport. The old `92vw` cap
          // used full-window viewport width, so at narrower windows where
          // the sidebar rail + Roll Feed panel eat proportionally more
          // space, the map-area's real width could be less than 92vw —
          // the dossier then exceeded its actual positioned ancestor and
          // got silently clipped by that ancestor's overflow:hidden (the
          // reported "check-console column clipped" bug). calc(100% - 2rem)
          // bounds against the real container with a small margin instead.
          width: 'min(53.75rem, calc(100% - 2rem))', zIndex: Z.dossier,
          background: PANEL_BG, border: `1px solid ${HUD.borderHi}`,
          boxShadow: SHADOW.dossier,
        }}
      >
        <div style={{ height: 3, background: accent }} />
        <div style={{ display: 'grid', gridTemplateColumns: '14.75rem 1fr 18.75rem', minHeight: '26.875rem' }}>
          <div style={{ position: 'relative', borderRight: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column' }}>
            <div className="dossier-hero-art" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--hud-surface-lo)' }}>
              {entry.imageUrl
                ? <img src={entry.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FD, fontSize: FS.h1, color: 'var(--hud-text-faint)',
                  }}>{entry.displayName.charAt(0)}</div>
              }
              <input
                ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => void handleFileChange(e)}
              />
              <button
                className="dossier-hero-upload"
                style={{ zIndex: Z.raised }}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <span className="dossier-hero-upload-label">{uploading ? 'UPLOADING…' : '↑ UPLOAD IMAGE'}</span>
              </button>
            </div>
            <div style={{ padding: SP[3], borderTop: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              {renaming ? (
                <input
                  autoFocus
                  value={draftNickname}
                  onChange={e => setDraftNickname(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void handleSaveNickname()
                    if (e.key === 'Escape') setRenaming(false)
                  }}
                  onBlur={() => void handleSaveNickname()}
                  placeholder={entry.name}
                  style={{
                    fontFamily: FD, fontSize: FS.h4, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                    lineHeight: 1.15, background: 'var(--hud-surface-hi)', border: `1px solid ${HUD.borderHi}`,
                    borderRadius: RADIUS.sm, color: HUD.text, padding: `2px ${SP[1]}`, width: '100%',
                  }}
                />
              ) : (
                <div style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.15 }}>
                  {entry.displayName}
                </div>
              )}
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
                <button className="dossier-ctl-btn" onClick={startRenaming}>✎ RENAME</button>
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
              {/* Stacked, not side-by-side — VitalStepper's label span is
                  flex:1 with no minWidth:0, so its intrinsic text width
                  ("SYS STRAIN") plus two 26px buttons plus the 4rem number
                  floor doesn't fit a 2-way split of the center column; strain
                  clipped off the right edge. Full-width rows fix it. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], marginTop: SP[1] }}>
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
              <div style={{ display: 'flex', gap: SP[2], marginTop: SP[1], flexWrap: 'wrap' }}>
                {veh ? (
                  <>
                    <Derived label="SIL" value={veh.silhouette} /><Derived label="SPEED" value={veh.speed} />
                    <Derived label="HANDLING" value={`+${veh.handling}`} /><Derived label="ARMOR" value={veh.armor} />
                    <Derived label="SH" value={`${veh.defense.fore}/${veh.defense.aft}`} />
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
                    display: 'flex', flexDirection: 'column', gap: SP[1], background: 'var(--hud-surface-lo)',
                    border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: HUD.text }}>{w.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, flex: 1, minWidth: 0 }}>
                        DMG {w.damage}{w.crit !== undefined ? ` · CRIT ${w.crit}` : ''}
                      </span>
                      <button
                        className="dossier-attack-btn"
                        onClick={() => { setAttackWeaponSignal(w.key); onAttackWeapon?.(w.key) }}
                      >⌖ ATTACK</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities — lives in the center column, below Weapons, filling
                the column's own remaining vertical space (its overflowY:auto
                lets a long list scroll within the column) rather than as a
                full-width region below the whole grid. A prior pass moved
                this to a new full-width bottom panel, which pushed the
                hero/check-console columns' content up and broke the layout —
                reverted per direct user correction. */}
            <div>
              <div className="dossier-sec-label">Abilities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
                {abilities.length > 0 ? abilities.map((a, i) => (
                  <div key={i} style={{
                    fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5,
                    borderLeft: `2px solid ${HUD.borderHi}`, paddingLeft: SP[2],
                  }}>
                    <b style={{ color: HUD.text }}>{a.name}.</b> <RichText text={a.description} />
                  </div>
                )) : (
                  <div style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textFaint }}>No special abilities</div>
                )}
              </div>
            </div>
          </div>
          {/* Check console column — Combat Check rolls inline now (Prompt 9),
              same as Skill Check; no more CombatCheckOverlay hand-off. */}
          <CheckConsole
            entry={entry}
            campaignId={campaignId}
            roster={roster}
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
