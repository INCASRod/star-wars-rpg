'use client'
import React, { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP, EASE } from '@/lib/tokens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ItemThumbGrid } from './item-thumb-grid'
import { ItemDetailPanel, type SelectedItem } from './item-detail-panel'
import type {
  WpnDisplay, ArmDisplay, GearRow,
  EquipState, RefWeaponQuality, StowLocation, StowableAsset,
} from '@/lib/types'
import type { EncumbranceStats, EncumbranceSuppressReason } from '@/lib/derivedStats'

interface InventoryCardPanelProps {
  weapons:               WpnDisplay[]
  armorItems:            ArmDisplay[]
  gearItems:             GearRow[]
  encumbranceCurrent:    number
  encumbranceThreshold:  number
  encumbranceStats:      EncumbranceStats | null
  brawn:                 number
  onSimulate:            (itemId: string, itemType: 'weapon' | 'armor' | 'gear', targetState: EquipState) => EncumbranceStats | null
  refWeaponQualityMap:   Record<string, RefWeaponQuality>
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:        (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:      (id: string, note?: string) => void
  onDiscardArmor?:       (id: string, note?: string) => void
  onDiscardGear?:        (id: string, note?: string) => void
  isGmMode?:             boolean
  characterName?:        string
}

function resolveSelected(
  id: string,
  weapons: WpnDisplay[],
  armorItems: ArmDisplay[],
  gearItems: GearRow[],
): SelectedItem | null {
  const w = weapons.find(x => x.id === id)
  if (w) return { kind: 'weapon', item: w }
  const a = armorItems.find(x => x.id === id)
  if (a) return { kind: 'armor', item: a }
  const g = gearItems.find(x => x.id === id)
  if (g) return { kind: 'gear', item: g }
  return null
}

function defaultId(weapons: WpnDisplay[], armorItems: ArmDisplay[], gearItems: GearRow[]): string | null {
  return weapons[0]?.id ?? armorItems[0]?.id ?? gearItems[0]?.id ?? null
}

// Machine-readable EncumbranceSuppressReason -> display copy. Composed here,
// never stored as text in derivedStats.ts.
function reasonCopy(reason: EncumbranceSuppressReason): string {
  switch (reason) {
    case 'anchor_occupied_armor':    return 'another suit already worn here'
    case 'anchor_occupied_capacity': return 'another item already worn here'
  }
}

function SourceRow({
  source, onHover, active,
}: {
  source: { id: string; label: string; value: number; reason: EncumbranceSuppressReason | null; suppressed: boolean; type: 'weapon' | 'armor' | 'gear' }
  onHover: (id: string | null, type: 'weapon' | 'armor' | 'gear', targetState?: EquipState) => void
  active: boolean
}) {
  return (
    <div
      onMouseEnter={() => onHover(source.id, source.type)}
      onMouseLeave={() => onHover(null, source.type)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: `${SP[1]} ${SP[2]}`,
        background: active ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)' : 'transparent',
        cursor: 'default',
      }}
    >
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.caption,
        color: source.suppressed ? 'var(--hud-text-faint)' : 'var(--hud-text)',
        textDecoration: source.suppressed ? 'line-through' : 'none',
      }}>
        {source.label}
        {source.suppressed && source.reason && (
          <span style={{ color: 'var(--hud-text-faint)', fontStyle: 'italic' }}> — {reasonCopy(source.reason)}</span>
        )}
      </span>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
        color: source.suppressed ? 'var(--hud-text-faint)' : 'var(--green)',
        textDecoration: source.suppressed ? 'line-through' : 'none',
      }}>
        {source.value > 0 ? `+${source.value}` : source.value}
      </span>
    </div>
  )
}

type BandKey = 'base' | 'capacity' | 'load'

function LedgerHero({
  stats, brawn, simStats, hoverId, onHover,
}: {
  stats: EncumbranceStats
  brawn: number
  // Lifted to InventoryCardPanel (Prompt 3, Task 1). Prompt 6, Task 2 moved
  // the manifest-row trigger to the item detail panel's state segmented
  // control (hovering "Stowed"/"Carried"/"Equipped" previews moving the
  // selected item to THAT state) — the manifest row trigger is gone
  // entirely, it was ambiguous about what it simulated. The Ledger's own
  // band-row hover is kept (unambiguous: "what if I dropped this
  // contributor", always targets 'stowed'). Single source of truth either
  // way: onHover always calls the same onSimulate -> computeEncumbranceStats.
  simStats: EncumbranceStats | null
  hoverId:  string | null
  onHover:  (id: string | null, type: 'weapon' | 'armor' | 'gear', targetState?: EquipState) => void
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [openBands, setOpenBands] = useState<Set<BandKey>>(new Set())
  const ghostRef = useRef<HTMLDivElement>(null)
  const ghostPulseRef = useRef<HTMLDivElement>(null)

  const toggleBand = (b: BandKey) => setOpenBands(prev => {
    const next = new Set(prev)
    next.has(b) ? next.delete(b) : next.add(b)
    return next
  })

  const display = simStats ?? stats
  const over = stats.load > stats.threshold
  const overBy = stats.load - stats.threshold
  const atCliff = overBy >= brawn

  // Scale extent — matches inventory-panel-spec-v3.html's own reference
  // formula (Math.max(cliff+2, load+1)) exactly. The previous multiplicative
  // padding (cliff*1.15, load*1.05) shared this same scaleMax with the fill
  // and both marks -- there was never a denominator mismatch -- but scaling
  // headroom AS A PERCENTAGE of cliff over-allocates space past the
  // threshold once cliff grows past it by even a modest Brawn, visually
  // diluting a numerically tight load/threshold gap (e.g. load 12/threshold
  // 13, cliff 16 -> old formula's 18.4 max left ~30% of the bar as dead
  // space past the threshold). A small FIXED headroom keeps the threshold
  // zone commanding most of the bar regardless of how far out cliff sits.
  const scaleMax = Math.max(stats.cliff + 2, display.load + 1, 1)
  // Solid fill always reflects the TRUE (non-simulated) load — the ghost
  // below is the only thing that moves on hover. loadPct kept as the name
  // Prompt 4 measured against (still the real state's position).
  const loadPct      = Math.min(100, (stats.load / scaleMax) * 100)
  const simLoadPct   = Math.min(100, (display.load / scaleMax) * 100)
  const thresholdPct = Math.min(100, (stats.threshold / scaleMax) * 100)
  const cliffPct      = Math.min(100, (stats.cliff / scaleMax) * 100)

  // Ghost direction: forward (grow) when the simulated state costs more load
  // than the true state, back (shrink) when it costs less. No ghost, no
  // direction when not hovering or when the hovered state IS the current
  // state (simPct === loadPct).
  const ghostDirection: 'grow' | 'shrink' | null =
    !simStats || simLoadPct === loadPct ? null : simLoadPct > loadPct ? 'grow' : 'shrink'
  const ghostLeftPct  = ghostDirection ? Math.min(loadPct, simLoadPct) : loadPct
  const ghostWidthPct = ghostDirection ? Math.abs(simLoadPct - loadPct) : 0

  // A mark "lights up" when the simulated load sits on the opposite side of
  // it from the true load — i.e. the hovered state would cross that line.
  const crossesThreshold = !!simStats && (stats.load <= stats.threshold) !== (display.load <= stats.threshold)
  const crossesCliff     = !!simStats && (stats.load <= stats.cliff)     !== (display.load <= stats.cliff)

  // Ghost fill animates on an inner wrapper only (never the positioned scale
  // track itself). Position/width are set directly from the sim (deterministic,
  // no tween needed there); only the opacity crossfade is GSAP-driven via
  // filter:opacity() so it composites the same way under a lockable transform
  // and so a rapid re-hover across buttons just retargets the same tween
  // instead of stacking one. Reduced motion snaps instead of tweening;
  // usePrefersReducedMotion's value is in the effect's own dependency array
  // since it returns false on first render.
  useEffect(() => {
    const el = ghostRef.current
    if (!el) return
    if (prefersReducedMotion) {
      gsap.set(el, { filter: ghostDirection ? 'opacity(1)' : 'opacity(0)' })
      return
    }
    gsap.to(el, { filter: ghostDirection ? 'opacity(1)' : 'opacity(0)', duration: 0.2, ease: EASE.default, overwrite: true })
  }, [ghostDirection, prefersReducedMotion])

  // Movement (Task 2, Prompt 7) — travelling stripes + a gentle opacity pulse,
  // on a SECOND inner wrapper nested inside ghostRef (never the positioned
  // scale track, never ghostRef itself — that one only ever handles the
  // show/hide crossfade above, so the two tweens can't fight over the same
  // property). Both loops are pure eye-pull, not information — disabled
  // entirely under reduced motion, which the effect depends on directly
  // (usePrefersReducedMotion returns false on first render, so this rerun
  // once the real value lands is required, not optional).
  useEffect(() => {
    const el = ghostPulseRef.current
    if (!el) return
    gsap.killTweensOf(el)
    if (!ghostDirection || prefersReducedMotion) {
      gsap.set(el, { backgroundPositionX: 0, filter: 'opacity(1)' })
      return
    }
    gsap.to(el, { backgroundPositionX: '+=16', duration: 0.7, repeat: -1, ease: 'none' })
    gsap.to(el, { filter: 'opacity(0.55)', duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    return () => { gsap.killTweensOf(el) }
  }, [ghostDirection, prefersReducedMotion])

  const room = stats.threshold - stats.load
  // Task 1b: the reading shows the SIMULATED result while hovering a state
  // button — both numerator (load) AND denominator (threshold) come from
  // `display`, since equipping/stowing a threshold-granting item changes
  // wornCapacity and therefore threshold too, not just load. Same `display`
  // (= simStats ?? stats) the ghost geometry above already reads — no second
  // computation.
  const displayOver = display.load > display.threshold
  const displayRoom  = display.threshold - display.load

  return (
    <div style={{
      padding: SP[2],
      borderBottom: '1px solid var(--hud-border)',
      borderLeft: over ? '2px solid var(--state-threat)' : '2px solid transparent',
      background: over ? 'color-mix(in srgb, var(--state-threat) 6%, transparent)' : 'transparent',
      flexShrink: 0,
    }}>
      {/* Reading — Prompt 7 Task 1: load is the dominant element. Prompt 8
          correction: FS.hero (64->96px) badly overshot the mockup's
          clamp(30px,2.4vw,42px) target — roughly 3x too big, pushed the bar
          down and left dead space above it. FS.h2 (22->40px) is the closest
          existing step to the mockup's own clamp (its own doc comment lists
          22->40px) — reused rather than adding a new clamp step matching the
          mockup's literal 30/42 values. Threshold follows at normal body
          size as "/ N"; "room for N more" stays its existing small size.
          Position unchanged — still the same flex row. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SP[1] }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hud-text-dim)' }}>
          Encumbrance
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: SP[1] }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h2, lineHeight: 1, fontWeight: 700,
            color: displayOver ? 'var(--state-threat)' : 'var(--hud-gold)',
            // Simulated reading is visually distinguished from true (Task 1b)
            // with a dashed underline + italic — no explanatory copy added,
            // both clear on their own and both already-established cues
            // elsewhere in this HUD for "not the real value yet".
            fontStyle: simStats ? 'italic' : 'normal',
            borderBottom: simStats ? '1px dashed currentColor' : '1px solid transparent',
          }}>
            {display.load}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-dim)' }}>
            / {display.threshold}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)' }}>
            {displayRoom >= 0 ? `room for ${displayRoom} more` : `${-displayRoom} over`}
          </span>
        </span>
      </div>

      {/* Scale — bar treatment per inventory-panel-spec-v3.html's .scale
          block (Prompt 6, Task 1). Layout/arithmetic unchanged: same
          loadPct/thresholdPct/cliffPct from the Prompt-4 scaleMax formula,
          just a heavier visual container. No new tokens: fill reuses
          --hud-gold (already the Ledger's own accent) instead of --die-force
          so the normal state reads as a gold ramp matching the mockup, not a
          blue that was never actually part of this component's palette;
          over-state still resolves to --state-threat. Ghost direction colour
          is the one deliberate reuse choice not literally in the mockup's
          CSS (its --led-capacity teal was rejected in Prompt 2 as a sealed-
          namespace collision) — grow ghost reuses --state-threat (bad),
          shrink ghost reuses --green (good, already "capacity gain" in this
          same panel's bands). Cliff mark (Prompt 7, Task 2b): --hud-accent-
          purple, not --state-threat — Prompt 6 gave threshold and cliff the
          SAME colour reasoning correctly about the rejected --led-cliff
          token but landing on an outcome where the two lines were
          indistinguishable without reading their labels. --hud-accent-purple
          is already in use elsewhere in these rebuilt panel files and reads
          as categorically distinct from both the gold fill and the red
          over-threshold state. */}
      <div style={{ position: 'relative', padding: `${SP[3]} 0 1.25rem` }}>
        <div style={{
          position: 'relative', height: '1.375rem',
          border: '1px solid var(--hud-border-hi)', borderRadius: RADIUS.md,
          background: 'var(--hud-bg)', overflow: 'visible',
        }}>
          <div style={{
            position: 'absolute', top: '2px', bottom: '2px', left: '2px',
            width: `calc(${loadPct}% - 2px)`,
            background: over
              ? `linear-gradient(90deg, var(--hud-gold), var(--state-threat) 85%)`
              : `linear-gradient(90deg, color-mix(in srgb, var(--hud-gold) 65%, transparent), var(--hud-gold))`,
            borderRadius: RADIUS.sm,
            transition: `width ${EASE.default}`,
          }} />
          {/* Ghost preview segment (Prompt 7, Task 2 rebuild). Two nested
              wrappers, never the positioned scale track itself:
                ghostRef      — position/width/geometry (deterministic from
                                the sim, set directly in React) + the show/
                                hide opacity crossfade (filter:opacity()).
                ghostPulseRef — the continuous stripe-travel + pulse loop,
                                so it never fights the crossfade tween for
                                the same property.
              Reads as a DISTINCT SEGMENT rather than texture over the fill:
              a solid direction-coloured edge border marks the boundary of
              the change, and the stripe pattern alternates the direction
              colour against --hud-bg (opaque dark, not transparent) instead
              of gold showing through — for a shrink this means the ghost
              visibly CUTS OUT the trailing end of the fill rather than
              tinting it, which is what made it read as texture before. */}
          <div ref={ghostRef} style={{
            position: 'absolute', top: '2px', bottom: '2px',
            left: `${ghostLeftPct}%`,
            width: `${ghostWidthPct}%`,
            borderRadius: RADIUS.sm,
            borderLeft: ghostDirection === 'grow' ? '2px solid var(--state-threat)' : 'none',
            borderRight: ghostDirection === 'shrink' ? '2px solid var(--green)' : 'none',
            overflow: 'hidden',
            filter: 'opacity(0)',
            pointerEvents: 'none',
          }}>
            <div ref={ghostPulseRef} style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'var(--hud-bg)',
              backgroundImage: ghostDirection === 'shrink'
                ? 'repeating-linear-gradient(45deg, var(--green) 0 4px, var(--hud-bg) 4px 8px)'
                : 'repeating-linear-gradient(45deg, var(--state-threat) 0 4px, var(--hud-bg) 4px 8px)',
              backgroundSize: '16px 16px',
            }} />
          </div>
          {/* Threshold tick — full-height, extends above/below the track, labelled */}
          <div style={{
            position: 'absolute', top: '-0.5rem', bottom: '-0.5rem', left: `${thresholdPct}%`, width: '2px',
            background: 'var(--hud-text)',
            filter: crossesThreshold ? 'drop-shadow(0 0 5px var(--hud-text))' : 'none',
            transition: `left ${EASE.default}`,
          }}>
            <span style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', paddingTop: SP[1],
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--hud-text)',
            }}>
              Threshold
            </span>
          </div>
          {/* Cliff tick — --hud-accent-purple (Task 2b), not --state-threat:
              the cliff is a categorically worse consequence than threshold
              (lose free maneuver, 2 strain/maneuver, vs setback dice), and
              sharing threshold's colour made the two lines indistinguishable
              without reading their labels. */}
          <div style={{
            position: 'absolute', top: '-0.5rem', bottom: '-0.5rem', left: `${cliffPct}%`, width: '2px',
            background: 'var(--hud-accent-purple)',
            filter: crossesCliff ? 'drop-shadow(0 0 5px var(--hud-accent-purple))' : 'none',
            transition: `left ${EASE.default}`,
          }}>
            <span style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', paddingTop: SP[1],
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--hud-accent-purple)',
            }}>
              Maneuver Cliff
            </span>
          </div>
        </div>
      </div>

      {/* Over-threshold consequence copy */}
      {over && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--state-threat)', marginBottom: SP[1] }}>
          Add [setback:{overBy}] to Brawn and Agility checks.
          {atCliff && <> No free maneuver — each maneuver costs 2 strain.</>}
        </div>
      )}

      {/* Bands. Load band only (Prompt 6, Task 3): exclude zero-cost
          contributors and sort by effective cost descending, read straight
          from perItem's already-reduced value (e.g. a worn suit's -3 shows
          here) — no recomputation. Worn Capacity keeps every entry,
          including suppressed/zero-grant ones, unchanged. */}
      {([
        { key: 'base' as const,     label: 'Base',           value: display.base,         sources: null as EncumbranceStats['capacitySources'] | null },
        { key: 'capacity' as const, label: 'Worn Capacity',  value: display.wornCapacity, sources: display.capacitySources },
        { key: 'load' as const,     label: 'Load',           value: display.load,
          sources: display.loadSources.filter(s => s.value > 0).sort((a, b) => b.value - a.value) },
      ]).map(band => (
        <div key={band.key} style={{ borderTop: '1px solid var(--hud-border)' }}>
          <button
            onClick={() => band.sources && toggleBand(band.key)}
            disabled={!band.sources || band.sources.length === 0}
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: `${SP[1]} 0`, background: 'transparent', border: 'none',
              cursor: band.sources && band.sources.length > 0 ? 'pointer' : 'default',
              fontFamily: FONT_BODY,
            }}
          >
            <span style={{ fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--hud-text-faint)' }}>
              {band.label} {band.sources && band.sources.length > 0 && (openBands.has(band.key) ? '▾' : '▸')}
            </span>
            <span style={{ fontSize: FS.caption, fontWeight: 700, color: 'var(--hud-text)' }}>{band.value}</span>
          </button>
          {band.key === 'load' && band.sources && band.sources.length === 0 && (
            <div style={{ padding: `${SP[1]} 0`, fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>
              Nothing carried.
            </div>
          )}
          {band.sources && band.sources.length > 0 && openBands.has(band.key) && (
            <div>
              {band.sources.map(s => (
                <SourceRow key={s.id} source={s} onHover={onHover} active={hoverId === s.id} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function InventoryCardPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold, encumbranceStats, brawn, onSimulate,
  refWeaponQualityMap, stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: InventoryCardPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    defaultId(weapons, armorItems, gearItems)
  )

  // Lifted hover-preview state (Prompt 3, Task 1). Prompt 6, Task 2: the
  // manifest-row trigger is gone — the state segmented control in
  // ItemDetailPanel's footer is the only per-item trigger now, alongside the
  // Ledger's own band-row hover (fixed target: 'stowed'). Both funnel
  // through the same onSimulate, which itself calls the one pure function in
  // derivedStats.ts — no parallel maths, one path.
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [simStats, setSimStats] = useState<EncumbranceStats | null>(null)

  const handleHover = (id: string | null, type: 'weapon' | 'armor' | 'gear', targetState: EquipState = 'stowed') => {
    setHoverId(id)
    setSimStats(id ? onSimulate(id, type, targetState) : null)
  }

  const allIds = new Set([...weapons, ...armorItems, ...gearItems].map(x => x.id))
  const activeId = selectedId && allIds.has(selectedId)
    ? selectedId
    : defaultId(weapons, armorItems, gearItems)

  const selected = activeId ? resolveSelected(activeId, weapons, armorItems, gearItems) : null
  const isEmpty  = weapons.length === 0 && armorItems.length === 0 && gearItems.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {encumbranceStats
        ? <LedgerHero stats={encumbranceStats} brawn={brawn} simStats={simStats} hoverId={hoverId} onHover={handleHover} />
        : (
          <div style={{ padding: `${SP[1]} ${SP[2]}`, borderBottom: '1px solid var(--hud-border)', flexShrink: 0 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)' }}>
              {encumbranceCurrent} / {encumbranceThreshold}
            </span>
          </div>
        )
      }
      {/* Split proportions per inventory-panel-spec-v3.html: manifest rail
          gets enough room for names to not truncate, detail panel doesn't
          run overly wide. Both tracks have a floor (minmax) so neither
          collapses if the HUD panel itself is narrow. */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(430px, 1.15fr) minmax(360px, 0.85fr)', overflow: 'hidden', minHeight: 0 }}>
        <ItemThumbGrid
          weapons={weapons} armorItems={armorItems} gearItems={gearItems}
          selectedId={activeId} onSelect={setSelectedId}
          encumbranceStats={encumbranceStats}
        />
        {isEmpty ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)',
            fontStyle: 'italic',
          }}>
            No items in inventory
          </div>
        ) : selected ? (
          <ItemDetailPanel
            selected={selected}
            refWeaponQualityMap={refWeaponQualityMap}
            encumbranceStats={encumbranceStats}
            onHoverState={handleHover}
            stowableAssets={stowableAssets}
            baseOfOperationsName={baseOfOperationsName}
            onSetWeaponState={onSetWeaponState}
            onSetArmorState={onSetArmorState}
            onSetGearState={onSetGearState}
            onDiscardWeapon={onDiscardWeapon}
            onDiscardArmor={onDiscardArmor}
            onDiscardGear={onDiscardGear}
            isGmMode={isGmMode}
            characterName={characterName}
          />
        ) : null}
      </div>
    </div>
  )
}
