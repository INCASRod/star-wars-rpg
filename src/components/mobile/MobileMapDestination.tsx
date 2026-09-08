'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { MapCanvas } from '@/components/map/MapCanvas'
import { OpeningCrawlCanvas } from '@/components/map/OpeningCrawlCanvas'
import { PlayerTokenTooltip, type PlayerTooltipEntity, type PlayerTooltipRole } from '@/components/player/PlayerTokenTooltip'
import { useActiveMap } from '@/hooks/useActiveMap'
import { useMapTokens } from '@/hooks/useMapTokens'
import { fetchAdversaries, adversaryToInstance, type AdversaryInstance } from '@/lib/adversaries'
import { fetchVehicles, type Vehicle } from '@/lib/vehicles'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'

export interface MobileMapDestinationProps {
  open: boolean
  onClose: () => void
  character: Character
  campaignId: string | null
  encounter: CombatEncounter | null
}

function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true)
  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)')
    const update = () => setLandscape(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return landscape
}

/**
 * Pinch-to-zoom, added around the hosted MapCanvas rather than inside it.
 * MapCanvas's own zoom is a `wheel` listener on its internal container div —
 * touch has no `wheel` event, so this translates a 2-finger pinch into
 * synthetic native `WheelEvent`s dispatched at that same element, reusing
 * MapCanvas's own zoom math (clamp, focal-point centring) exactly rather
 * than reimplementing it. MapCanvas itself is never touched — this finds its
 * container by DOM query (the div wrapping the `<canvas>` MapCanvas appends),
 * the only way to reach it without a forwarded ref (none exists).
 */
function usePinchZoom(hostRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let target: HTMLElement | null = null
    let pinching = false
    let lastDist = 0

    function findTarget(): HTMLElement | null {
      const canvas = host!.querySelector('canvas')
      return (canvas?.parentElement as HTMLElement | null) ?? null
    }

    function dist(t: TouchList): number {
      const [a, b] = [t[0], t[1]]
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }
    function mid(t: TouchList): { x: number; y: number } {
      const [a, b] = [t[0], t[1]]
      return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 2) { pinching = false; return }
      target = findTarget()
      if (!target) return
      pinching = true
      lastDist = dist(e.touches)
    }
    function onTouchMove(e: TouchEvent) {
      if (!pinching || e.touches.length !== 2 || !target) return
      e.preventDefault()
      const d = dist(e.touches)
      const delta = d - lastDist
      lastDist = d
      if (Math.abs(delta) < 0.5) return
      const { x, y } = mid(e.touches)
      // Pinch OUT (fingers spreading, delta>0) should zoom IN, matching
      // desktop's wheel convention where deltaY<0 zooms in.
      target.dispatchEvent(new WheelEvent('wheel', {
        deltaY: -delta * 4, clientX: x, clientY: y, bubbles: true, cancelable: true,
      }))
    }
    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinching = false
    }

    host.addEventListener('touchstart', onTouchStart, { passive: true })
    host.addEventListener('touchmove', onTouchMove, { passive: false })
    host.addEventListener('touchend', onTouchEnd, { passive: true })
    host.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      host.removeEventListener('touchstart', onTouchStart)
      host.removeEventListener('touchmove', onTouchMove)
      host.removeEventListener('touchend', onTouchEnd)
      host.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [hostRef])
}

/**
 * Player-facing map, ported to mobile as a full-screen, view-only takeover.
 * Hosts the existing MapCanvas unmodified — Step 0 (Mobile Rebuild 7/7)
 * found it fully self-contained, container-relative, and already
 * touch-compatible for panning via Pixi's Pointer Events. Zero writes:
 * `onTokenMove` is a no-op, `isGM=false`, `currentCharacterId=null` (never
 * matches any token's `character_id`, so `canDrag` is false for every token
 * — see MapCanvas.tsx's own `canDrag` computation).
 *
 * Tooltip data (tooltipEntity derivation, allChars/advStatCache/vehStatCache)
 * is ported from HudSessionTab.tsx (desktop, read-only, not reusable at
 * that granularity — it isn't exported, only the top-level tab component
 * is) rather than duplicated wholesale as a new invention — same shape,
 * same fields, same fallback order, adapted only for tap instead of hover.
 */
export function MobileMapDestination({ open, onClose, character, campaignId, encounter }: MobileMapDestinationProps) {
  const supabase = useMemo(() => createClient(), [])
  const landscape = useIsLandscape()
  const hostRef = useRef<HTMLDivElement>(null)
  usePinchZoom(hostRef)

  const { visibleMap } = useActiveMap(campaignId)
  const { tokens: visibleMapTokens } = useMapTokens(visibleMap?.id ?? null, { visibleOnly: true })

  const [tappedToken, setTappedToken] = useState<{ tokenId: string; rect: DOMRect } | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tap-to-show, auto-dismiss after a few seconds — not tap-elsewhere-to-
  // dismiss: MapCanvas's `<canvas>` is one DOM element, so every tap
  // (whether it hit a token or empty map) fires a single native `click` that
  // bubbles up identically; there's no way to tell "background tap" from
  // "token tap" from outside without touching MapCanvas's own hit-testing.
  // A timer sidesteps that ambiguity entirely and matches the read-only,
  // glanceable purpose of this tooltip (same content/fields as desktop's
  // hover card, just given a lifetime instead of a pointer to track).
  function showTooltip(tokenId: string, rect: DOMRect) {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    setTappedToken({ tokenId, rect })
    dismissTimerRef.current = setTimeout(() => setTappedToken(null), 3500)
  }
  useEffect(() => () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current) }, [])
  const [allChars, setAllChars] = useState<Character[]>([character])
  const [advStatCache, setAdvStatCache] = useState<Map<string, AdversaryInstance>>(new Map())
  const [vehStatCache, setVehStatCache] = useState<Map<string, Vehicle>>(new Map())

  useEffect(() => {
    if (!open || !campaignId) return
    supabase.from('characters').select('*').eq('campaign_id', campaignId).eq('is_archived', false)
      .then(({ data }) => { if (data) setAllChars(data as Character[]) })
  }, [open, campaignId, supabase])

  useEffect(() => {
    if (!open) return
    const names = [...new Set(
      visibleMapTokens.filter(t => t.participant_type === 'adversary' && t.label).map(t => t.label!),
    )]
    if (names.length === 0) return
    ;(async () => {
      const [{ data: globalData }, { data: customData }, staticAdvs] = await Promise.all([
        supabase.from('ref_adversaries').select('*').in('name', names).is('campaign_id', null),
        campaignId
          ? supabase.from('ref_adversaries').select('*').in('name', names).eq('campaign_id', campaignId)
          : Promise.resolve({ data: [] as unknown[] }),
        fetchAdversaries(),
      ])
      type AdvRow = Parameters<typeof adversaryToInstance>[0]
      const advMap = new Map<string, AdvRow>()
      for (const a of staticAdvs) if (names.includes(a.name)) advMap.set(a.name, a as AdvRow)
      for (const row of [...(globalData ?? []), ...(customData ?? [])]) advMap.set((row as AdvRow).name, row as AdvRow)
      const cache = new Map<string, AdversaryInstance>()
      for (const [name, adv] of advMap) cache.set(name, adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1))
      setAdvStatCache(cache)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visibleMapTokens, campaignId])

  useEffect(() => {
    if (!open) return
    const vehicleNames = [...new Set(
      visibleMapTokens.filter(t => t.token_shape === 'rectangle' && t.label).map(t => t.label!),
    )]
    if (vehicleNames.length === 0) { setVehStatCache(new Map()); return }
    fetchVehicles().then(allVehicles => {
      const cache = new Map<string, Vehicle>()
      for (const v of allVehicles) if (vehicleNames.includes(v.name)) cache.set(v.name, v)
      setVehStatCache(cache)
    }).catch(console.warn)
  }, [open, visibleMapTokens])

  const tokensById = useMemo(() => new Map(visibleMapTokens.map(t => [t.id, t])), [visibleMapTokens])

  // Ported verbatim from HudSessionTab.tsx's own tooltipEntity useMemo — same
  // fields, same fallback order (PC → live encounter slot → cached adversary
  // → cached vehicle → name-only). Keyed on `tappedToken` instead of
  // `tokenHoverInfo` (tap, not hover) — the derivation itself is unchanged.
  const tooltipEntity = useMemo((): PlayerTooltipEntity | null => {
    if (!tappedToken) return null
    const token = tokensById.get(tappedToken.tokenId)
    if (!token) return null

    if (token.participant_type === 'pc' && token.character_id) {
      const char = allChars.find(c => c.id === token.character_id)
      if (char) return {
        key: token.id, name: char.name, role: 'pc',
        imageUrl: token.token_image_url ?? null,
        wounds: { current: char.wound_current, max: char.wound_threshold, label: 'WOUNDS' },
        strain: { current: char.strain_current, max: char.strain_threshold, label: 'STRAIN' },
        defeated: false,
      }
    }

    if (token.slot_key && encounter) {
      const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
      if (slot?.adversaryInstanceId) {
        const adv = encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
        if (adv) {
          const role: PlayerTooltipRole = slot.alignment === 'allied_npc' ? 'friendly' : 'enemy'
          const woundsMax = adv.type === 'minion' && adv.groupSize
            ? (adv.woundThreshold ?? 0) * adv.groupSize
            : adv.woundThreshold
          const defeated = adv.type === 'minion'
            ? (adv.groupRemaining ?? 0) === 0
            : (adv.woundsCurrent ?? 0) >= (adv.woundThreshold ?? Infinity)
          return {
            key: token.id, name: adv.nickname || adv.name || token.label || '?', role,
            typeTag: adv.type.toUpperCase(),
            imageUrl: token.token_image_url ?? null,
            wounds: { current: adv.woundsCurrent ?? 0, max: woundsMax ?? 0, label: 'WOUNDS' },
            strain: adv.type !== 'minion' && adv.strainThreshold
              ? { current: adv.strainCurrent ?? 0, max: adv.strainThreshold, label: 'STRAIN' }
              : undefined,
            minionPips: adv.type === 'minion' && adv.groupSize != null
              ? { alive: adv.groupRemaining ?? 0, total: adv.groupSize }
              : undefined,
            defeated,
          }
        }
      }
      if (slot?.vehicleInstanceId) {
        const veh = encounter.vehicles?.find(v => v.instanceId === slot.vehicleInstanceId)
        if (veh) return {
          key: token.id, name: veh.nickname || veh.name,
          role: veh.alignment === 'allied_npc' ? 'friendly' : 'enemy',
          typeTag: 'VEHICLE',
          imageUrl: token.token_image_url ?? null,
          wounds: { current: veh.hullTraumaCurrent, max: veh.hullTraumaThreshold, label: 'HULL TRAUMA' },
          strain: { current: veh.systemStrainCurrent, max: veh.systemStrainThreshold, label: 'SYS STRAIN' },
          defeated: veh.hullTraumaCurrent >= veh.hullTraumaThreshold,
        }
      }
    }

    if (token.participant_type === 'adversary' && token.label) {
      const cached = advStatCache.get(token.label)
      if (cached) {
        const role: PlayerTooltipRole = token.alignment === 'allied_npc' ? 'friendly' : 'enemy'
        return {
          key: token.id, name: token.label, role,
          typeTag: cached.type.toUpperCase(),
          imageUrl: token.token_image_url ?? null,
          wounds: { current: 0, max: cached.woundThreshold ?? 0, label: 'WOUNDS' },
          strain: cached.type !== 'minion' && cached.strainThreshold
            ? { current: 0, max: cached.strainThreshold, label: 'STRAIN' }
            : undefined,
          minionPips: cached.type === 'minion' && cached.groupSize != null
            ? { alive: cached.groupRemaining ?? cached.groupSize, total: cached.groupSize }
            : undefined,
          defeated: false,
        }
      }
    }

    if (token.token_shape === 'rectangle' && token.label) {
      const staticVeh = vehStatCache.get(token.label)
      if (staticVeh) return {
        key: token.id, name: token.label,
        role: token.alignment === 'allied_npc' ? 'friendly' : 'enemy',
        typeTag: 'VEHICLE',
        imageUrl: token.token_image_url ?? null,
        wounds: { current: 0, max: staticVeh.hullTrauma, label: 'HULL TRAUMA' },
        strain: { current: 0, max: staticVeh.systemStrain, label: 'SYS STRAIN' },
        defeated: false,
      }
    }

    return {
      key: token.id, name: token.label ?? '?',
      role: token.alignment === 'allied_npc' ? 'friendly' : 'enemy',
      imageUrl: token.token_image_url ?? null,
      wounds: { current: 0, max: 1, label: 'WOUNDS' },
      defeated: false,
    }
  }, [tappedToken, tokensById, allChars, encounter, advStatCache, vehStatCache])

  if (!open) return null

  return createPortal(
    <div className="m-map-root" data-mobile-shell="">
      <button type="button" className="m-map-exit" onClick={onClose} aria-label="Exit map">
        ✕ Exit Map
      </button>

      {!landscape ? (
        <div className="m-map-rotate">
          <span className="m-map-rotate-glyph" aria-hidden="true">⟳</span>
          <div className="m-map-rotate-title">Rotate your device</div>
          <div className="m-map-rotate-body">The map is built for landscape. Turn your phone sideways to view it.</div>
        </div>
      ) : visibleMap?.map_type === 'crawl' ? (
        <OpeningCrawlCanvas
          heading={visibleMap.crawl_content?.heading ?? ''}
          subheading={visibleMap.crawl_content?.subheading ?? ''}
          body={visibleMap.crawl_content?.body ?? ''}
        />
      ) : visibleMap ? (
        <div ref={hostRef} className="m-map-canvas-host">
          <MapCanvas
            mapImageUrl={visibleMap.image_url}
            tokens={visibleMapTokens}
            isGM={false}
            currentCharacterId={null}
            onTokenMove={() => {}}
            gridEnabled={visibleMap.grid_enabled}
            gridSize={visibleMap.grid_size ?? 50}
            tokenScale={visibleMap.token_scale ?? 1}
            onTokenHover={(id, _x, _y, rect) => showTooltip(id, rect)}
          />
        </div>
      ) : (
        <div className="m-placeholder">
          <div className="m-placeholder-title">No map</div>
          <div className="m-placeholder-body">The GM hasn&rsquo;t shared a map with the party yet.</div>
        </div>
      )}

      <PlayerTokenTooltip entity={tooltipEntity} tokenRect={tappedToken?.rect ?? null} />
    </div>,
    document.body,
  )
}
