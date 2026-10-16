'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, FONT_RAJDHANI, FS_SM, FS_CAPTION } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP } from '@/lib/tokens'
import { MapCanvas, type MapCanvasHandle } from '@/components/map/MapCanvas'
import { OpeningCrawlCanvas } from '@/components/map/OpeningCrawlCanvas'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import { PlayerTokenTooltip, type PlayerTooltipEntity, type PlayerTooltipRole } from '@/components/player/PlayerTokenTooltip'
import { HudAdversaryDrawer } from './HudAdversaryDrawer'
import { useMapDeck } from '@/hooks/useMapDeck'
import { loadAdversaryBaseStats, loadVehicleBaseStats, findDeckInstance } from '@/lib/mapTokenBaseStats'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import type { CombatEncounter } from '@/lib/combat'
import type { Character, WpnDisplay, HudSkill } from '@/lib/types'
import type { RollResult } from './dice-engine'
import type { ForcePowerDisplay } from './ForcePanel'

/* ── Component ─────────────────────────────────────────────── */
interface HudSessionTabProps {
  character:          Character
  campaignId:         string | null
  visibleMap:         { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number; map_type?: string; crawl_content?: { heading: string; subheading: string; body: string } | null } | null
  visibleMapTokens:   MapToken[]
  onTokenMove:        (tokenId: string, x: number, y: number) => void
  isCombatActive:     boolean
  encounter:          CombatEncounter | null
  // Quick drawer props
  hudSkills?:               HudSkill[]
  onSkillRoll?:             (result: RollResult, label?: string, pool?: Record<string, number>) => void
  // Adversary drawer — externally controlled when rail button is used
  adversariesOpen?:         boolean
  onAdversariesOpenChange?: (open: boolean) => void
  // Reset/Lock handle + lock-state callback for the vitals bar (the map no longer draws them)
  mapHandleRef?:            React.Ref<MapCanvasHandle>
  onMapLockChange?:         (locked: boolean) => void
}

export function HudSessionTab({
  character,
  campaignId,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  hudSkills                = [],
  onSkillRoll,
  adversariesOpen:         externalAdversariesOpen,
  onAdversariesOpenChange,
  mapHandleRef, onMapLockChange,
}: HudSessionTabProps) {
  const isAdversariesControlled = externalAdversariesOpen !== undefined
  const supabase = useMemo(() => createClient(), [])
  const [internalAdversaryDrawerOpen, setInternalAdversaryDrawerOpen] = useState(false)
  const adversaryDrawerOpen = isAdversariesControlled ? externalAdversariesOpen! : internalAdversaryDrawerOpen
  const setAdversaryDrawerOpen = (v: boolean) => {
    if (isAdversariesControlled) onAdversariesOpenChange?.(v)
    else setInternalAdversaryDrawerOpen(v)
  }
  const [tokenHoverInfo,        setTokenHoverInfo]        = useState<{ tokenId: string; rect: DOMRect } | null>(null)
  const initiativeBarRef = useRef<HTMLDivElement>(null)
  const [sessionCardCollapsed,  setSessionCardCollapsed]  = useState<Record<string, boolean>>({})
  const [advStatCache,          setAdvStatCache]          = useState<Map<string, AdversaryInstance>>(new Map())
  const [vehStatCache,          setVehStatCache]          = useState<Map<string, Vehicle>>(new Map())
  const [allChars,              setAllChars]              = useState<Character[]>([character])

  // Fetch all campaign characters so we can show PC stat blocks on hover
  useEffect(() => {
    if (!campaignId) return
    supabase.from('characters').select('*').eq('campaign_id', campaignId).eq('is_archived', false)
      .then(({ data }) => { if (data) setAllChars(data as Character[]) })
  }, [campaignId, supabase])

  // Preload base adversary stats for all adversary tokens — used when no encounter slot exists
  useEffect(() => {
    const names = [...new Set(
      visibleMapTokens.filter(t => t.participant_type === 'adversary' && t.label).map(t => t.label!),
    )]
    if (names.length === 0) return
    loadAdversaryBaseStats(supabase, campaignId, names).then(setAdvStatCache).catch(console.warn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMapTokens, campaignId])

  // Preload static vehicle stats for rectangle tokens that have no encounter slot
  useEffect(() => {
    const vehicleNames = [...new Set(
      visibleMapTokens.filter(t => t.token_shape === 'rectangle' && t.label).map(t => t.label!),
    )]
    if (vehicleNames.length === 0) { setVehStatCache(new Map()); return }
    loadVehicleBaseStats(supabase, campaignId, vehicleNames).then(setVehStatCache).catch(console.warn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMapTokens, campaignId])

  // Map's own deck, live before combat too - `encounter` is null until Begin Combat.
  const mapDeck = useMapDeck(campaignId, visibleMap?.id ?? null)
  const deck = mapDeck ?? encounter

  const tokensById = useMemo(() => new Map(visibleMapTokens.map(t => [t.id, t])), [visibleMapTokens])

  // Prompt 11 — image-first player tooltip. "No soak, no defenses, no
  // skills, no weapons, no abilities" per the mockup: wounds/strain (or
  // minion pips, or hull/sys strain for vehicles) only. Portrait is the
  // token's own token_image_url — the same shared identity image already
  // drawn on the map disc/rectangle, dossier, and roster card; no separate
  // image system for this card.
  const tooltipEntity = useMemo((): PlayerTooltipEntity | null => {
    if (!tokenHoverInfo) return null
    const token = tokensById.get(tokenHoverInfo.tokenId)
    if (!token) return null

    // PC token — look up live character data
    if (token.participant_type === 'pc' && token.character_id) {
      const char = allChars.find(c => c.id === token.character_id)
      if (char) return {
        key: token.id, name: char.name, role: 'pc',
        imageUrl: token.token_image_url ?? null,
        wounds: { current: char.wound_current, max: char.wound_threshold, label: 'WOUNDS' },
        strain: { current: char.strain_current, max: char.strain_threshold, label: 'STRAIN' },
        defeated: false, // Prompt 19 scope — defeated markers apply to adversaries/vehicles only, never PCs
      }
    }

    // Adversary / vehicle linked to an active deck slot — live vitals
    if (token.slot_key && deck) {
      const slot = deck.initiative_slots.find(s => s.id === token.slot_key)
      if (slot?.adversaryInstanceId) {
        const adv = deck.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
        if (adv) {
          const role: PlayerTooltipRole = slot.alignment === 'allied_npc' ? 'friendly' : 'enemy'
          const woundsMax = adv.type === 'minion' && adv.groupSize
            ? (adv.woundThreshold ?? 0) * adv.groupSize
            : adv.woundThreshold
          // Prompt 19 — minion groups escalate to the full watermark only
          // once every minion is down (groupRemaining === 0); a rival/
          // nemesis is defeated once wounds reach its threshold. Both are
          // purely derived from the same live deck data as `wounds`
          // above — same damageEngine.ts rule as applyDamageToAdversary's
          // `isDefeated`, just re-read here instead of stored separately.
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
        const veh = deck.vehicles?.find(v => v.instanceId === slot.vehicleInstanceId)
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

    // Adversary with no deck slot — fall back to base stats from ref_adversaries cache
    if (token.participant_type === 'adversary' && token.label) {
      const cached = advStatCache.get(token.label)
      if (cached) {
        const role: PlayerTooltipRole = token.alignment === 'allied_npc' ? 'friendly' : 'enemy'
        // Squad size is the deck instance's, not the library default — no match, no pips.
        const squad = findDeckInstance(deck?.adversaries, token.label, token.map_id)
        return {
          key: token.id, name: token.label, role,
          typeTag: cached.type.toUpperCase(),
          imageUrl: token.token_image_url ?? null,
          wounds: { current: squad?.woundsCurrent ?? 0, max: (cached.woundThreshold ?? 0) * (cached.type === 'minion' ? squad?.groupSize ?? 1 : 1), label: 'WOUNDS' },
          strain: cached.type !== 'minion' && cached.strainThreshold
            ? { current: squad?.strainCurrent ?? 0, max: cached.strainThreshold, label: 'STRAIN' }
            : undefined,
          minionPips: squad && cached.type === 'minion'
            ? { alive: squad.groupRemaining, total: squad.groupSize }
            : undefined,
          defeated: false, // no deck slot yet — pre-combat placeholder, always full health
        }
      }
    }

    // Vehicle fallback: rectangle tokens not linked to an deck slot (pre-combat placement)
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

    // Last resort — name only
    return {
      key: token.id, name: token.label ?? '?',
      role: token.alignment === 'allied_npc' ? 'friendly' : 'enemy',
      imageUrl: token.token_image_url ?? null,
      wounds: { current: 0, max: 1, label: 'WOUNDS' },
      defeated: false,
    }
  }, [tokenHoverInfo, tokensById, allChars, deck, advStatCache, vehStatCache])

  return (
    <div className="relative h-full overflow-hidden">
      {/* Skill Check is no longer a drawer — it is a centred modal mounted by
          PlayerHUDDesktop, matching the Combat Check console. The old
          `.hud-quick-drawer` host and its backdrop are gone. */}

      {/* Map or placeholder */}
      {visibleMap?.map_type === 'crawl' ? (
        <OpeningCrawlCanvas
          heading={visibleMap.crawl_content?.heading ?? ''}
          subheading={visibleMap.crawl_content?.subheading ?? ''}
          body={visibleMap.crawl_content?.body ?? ''}
        />
      ) : visibleMap ? (
        <MapCanvas
          mapImageUrl={visibleMap.image_url}
          tokens={visibleMapTokens}
          isGM={false}
          currentCharacterId={character.id}
          onTokenMove={onTokenMove}
          gridEnabled={visibleMap.grid_enabled}
          gridSize={visibleMap.grid_size ?? 50}
          tokenScale={visibleMap.token_scale ?? 1}
          bottomOverlayRef={initiativeBarRef}
          onTokenHover={(id, _x, _y, rect) => setTokenHoverInfo({ tokenId: id, rect })}
          onTokenHoverEnd={(id) => setTokenHoverInfo(prev => (prev?.tokenId === id ? null : prev))}
          handleRef={mapHandleRef}
          onLockChange={onMapLockChange}
        />
      ) : (
        <div className="flex items-center justify-center h-full flex-col" style={{ gap: 'var(--space-3)', background: 'var(--hud-bg)' }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Waiting for GM to set a map</div>
        </div>
      )}

      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <div ref={initiativeBarRef} className="absolute" style={{
          top: 0, left: 0, right: 0, maxHeight: '25%',
          zIndex: 'var(--z-drawer)',
        }}>
          <InitiativeStrip encounter={encounter} character={character} compact />
        </div>
      )}

      {/* ── Session drawer trigger button — shown only when not rail-controlled ── */}
      {!isAdversariesControlled && (
        <div className="absolute flex" style={{ bottom: 'var(--space-3)', left: 'var(--space-3)', gap: '0.375rem', zIndex: 'var(--z-hud-drawer)' }}>
          {encounter && encounter.adversaries.some(a => a.revealed) && visibleMapTokens.some(t => t.participant_type === 'adversary') && (
            <button
              onClick={() => setAdversaryDrawerOpen(!adversaryDrawerOpen)}
              className="cursor-pointer"
              style={{
                fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: adversaryDrawerOpen ? 'var(--hud-vital-text)' : C.gold,
                background: adversaryDrawerOpen ? C.gold : 'var(--hud-surface-mid)',
                border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
                borderRadius: 'var(--radius-md)', padding: 'var(--space-1) 0.625rem',
              }}
            >{(encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</button>
          )}
        </div>
      )}

      {/* ── Drawers ── */}
      {encounter && encounter.adversaries.some(a => a.revealed) && visibleMapTokens.some(t => t.participant_type === 'adversary') && (
        <HudAdversaryDrawer
          open={adversaryDrawerOpen}
          onClose={() => setAdversaryDrawerOpen(false)}
          encounter={encounter}
          sessionCardCollapsed={sessionCardCollapsed}
          setSessionCardCollapsed={setSessionCardCollapsed}
        />
      )}

      {/* ── Token hover tooltip — portal to body, holographic card (Prompt 11) ── */}
      <PlayerTokenTooltip entity={tooltipEntity} tokenRect={tokenHoverInfo?.rect ?? null} />
    </div>
  )
}
