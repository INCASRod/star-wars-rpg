'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, FONT_RAJDHANI, FS_SM, FS_CAPTION } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP } from '@/lib/tokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { OpeningCrawlCanvas } from '@/components/map/OpeningCrawlCanvas'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import { PlayerTokenTooltip, type PlayerTooltipEntity, type PlayerTooltipRole } from '@/components/player/PlayerTokenTooltip'
import { HudAdversaryDrawer } from './HudAdversaryDrawer'
import { HudSkillQuickList } from './HudSkillQuickList'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { AdversaryInstance } from '@/lib/adversaries'
import { fetchVehicles } from '@/lib/vehicles'
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
  activeQuickPanel?:        'skill' | null
  onCloseQuickPanel?:       () => void
  hudSkills?:               HudSkill[]
  onOpenSkillPopover?:      (skill: HudSkill, anchor: DOMRect) => void
  onSkillRoll?:             (result: RollResult, label?: string, pool?: Record<string, number>) => void
  // Adversary drawer — externally controlled when rail button is used
  adversariesOpen?:         boolean
  onAdversariesOpenChange?: (open: boolean) => void
}

export function HudSessionTab({
  character,
  campaignId,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  activeQuickPanel         = null,
  onCloseQuickPanel        = () => {},
  hudSkills                = [],
  onOpenSkillPopover       = () => {},
  onSkillRoll,
  adversariesOpen:         externalAdversariesOpen,
  onAdversariesOpenChange,
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
    supabase.from('characters').select('*').eq('campaign_id', campaignId).eq('is_active', true)
      .then(({ data }) => { if (data) setAllChars(data as Character[]) })
  }, [campaignId, supabase])

  // Preload base adversary stats for all adversary tokens — used when no encounter slot exists
  useEffect(() => {
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
  }, [visibleMapTokens, campaignId])

  // Preload static vehicle stats for rectangle tokens that have no encounter slot
  useEffect(() => {
    const vehicleNames = [...new Set(
      visibleMapTokens.filter(t => t.token_shape === 'rectangle' && t.label).map(t => t.label!),
    )]
    if (vehicleNames.length === 0) { setVehStatCache(new Map()); return }
    fetchVehicles().then(allVehicles => {
      const cache = new Map<string, Vehicle>()
      for (const v of allVehicles) {
        if (vehicleNames.includes(v.name)) cache.set(v.name, v)
      }
      setVehStatCache(cache)
    }).catch(console.warn)
  }, [visibleMapTokens])

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
      }
    }

    // Adversary / vehicle linked to an active encounter slot — live vitals
    if (token.slot_key && encounter) {
      const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
      if (slot?.adversaryInstanceId) {
        const adv = encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
        if (adv) {
          const role: PlayerTooltipRole = slot.alignment === 'allied_npc' ? 'friendly' : 'enemy'
          const woundsMax = adv.type === 'minion' && adv.groupSize
            ? (adv.woundThreshold ?? 0) * adv.groupSize
            : adv.woundThreshold
          return {
            key: token.id, name: adv.name ?? token.label ?? '?', role,
            typeTag: adv.type.toUpperCase(),
            imageUrl: token.token_image_url ?? null,
            wounds: { current: adv.woundsCurrent ?? 0, max: woundsMax ?? 0, label: 'WOUNDS' },
            strain: adv.type !== 'minion' && adv.strainThreshold
              ? { current: adv.strainCurrent ?? 0, max: adv.strainThreshold, label: 'STRAIN' }
              : undefined,
            minionPips: adv.type === 'minion' && adv.groupSize != null
              ? { alive: adv.groupRemaining ?? 0, total: adv.groupSize }
              : undefined,
          }
        }
      }
      if (slot?.vehicleInstanceId) {
        const veh = encounter.vehicles?.find(v => v.instanceId === slot.vehicleInstanceId)
        if (veh) return {
          key: token.id, name: veh.name,
          role: veh.alignment === 'allied_npc' ? 'friendly' : 'enemy',
          typeTag: 'VEHICLE',
          imageUrl: token.token_image_url ?? null,
          wounds: { current: veh.hullTraumaCurrent, max: veh.hullTraumaThreshold, label: 'HULL TRAUMA' },
          strain: { current: veh.systemStrainCurrent, max: veh.systemStrainThreshold, label: 'SYS STRAIN' },
        }
      }
    }

    // Adversary with no encounter slot — fall back to base stats from ref_adversaries cache
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
        }
      }
    }

    // Vehicle fallback: rectangle tokens not linked to an encounter slot (pre-combat placement)
    if (token.token_shape === 'rectangle' && token.label) {
      const staticVeh = vehStatCache.get(token.label)
      if (staticVeh) return {
        key: token.id, name: token.label,
        role: token.alignment === 'allied_npc' ? 'friendly' : 'enemy',
        typeTag: 'VEHICLE',
        imageUrl: token.token_image_url ?? null,
        wounds: { current: 0, max: staticVeh.hullTrauma, label: 'HULL TRAUMA' },
        strain: { current: 0, max: staticVeh.systemStrain, label: 'SYS STRAIN' },
      }
    }

    // Last resort — name only
    return {
      key: token.id, name: token.label ?? '?',
      role: token.alignment === 'allied_npc' ? 'friendly' : 'enemy',
      imageUrl: token.token_image_url ?? null,
      wounds: { current: 0, max: 1, label: 'WOUNDS' },
    }
  }, [tokenHoverInfo, tokensById, allChars, encounter, advStatCache, vehStatCache])

  return (
    <div className="relative h-full overflow-hidden">
      {/* ── Quick drawer backdrop ── */}
      {activeQuickPanel && (
        <div
          onClick={onCloseQuickPanel}
          className="absolute inset-0"
          style={{
            background: 'rgba(0,0,0,0.45)',
            zIndex: 'var(--z-panel)',
          }}
        />
      )}

      {/* ── Skill Check quick drawer ── */}
      <div
        className={`hud-quick-drawer${activeQuickPanel === 'skill' ? ' open' : ''}`}
        style={{ background: 'var(--hud-surface-lo)', borderRight: '1px solid var(--hud-border-hi)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex items-center shrink-0" style={{
          padding: `${SP[2]} ${SP[4]}`, borderBottom: '1px solid var(--hud-border)',
          background: 'var(--hud-panel)', gap: 'var(--space-2)',
        }}>
          <span className="flex-1" style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-gold)' }}>
            ◈ Skill Check
          </span>
          <button onClick={onCloseQuickPanel} className="cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--hud-text-dim)', fontSize: FS.sm }}>✕</button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <HudSkillQuickList skills={hudSkills} onOpenPopover={onOpenSkillPopover} onRoll={onSkillRoll} />
        </div>
      </div>

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
        />
      ) : (
        <div className="flex items-center justify-center h-full flex-col" style={{ gap: 'var(--space-3)', background: 'var(--hud-bg)' }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Waiting for GM to set a map</div>
        </div>
      )}

      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <div ref={initiativeBarRef} className="absolute" style={{
          top: 0, left: 0, right: 0,
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
