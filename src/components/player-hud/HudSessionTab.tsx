'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { C, FONT_RAJDHANI, FS_SM, FS_CAPTION } from './design-tokens'
import { HUD } from '@/lib/tokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import { HudTalentDrawer } from './HudTalentDrawer'
import { HudAdversaryDrawer } from './HudAdversaryDrawer'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { HudTalent } from './TalentsPanel'
import type { MapToken } from '@/hooks/useMapTokens'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'

/* ── Tooltip constants ──────────────────────────────────────── */
const TOOLTIP_W  = 230
const FS_OL      = 'var(--text-overline)'
const CHAR_ABBRS = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR'] as const
const CHAR_KEYS  = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const

interface TooltipData {
  x: number; y: number
  name: string; typeLabel: string; typeColor: string
  characteristics?: { brawn: number; agility: number; intellect: number; cunning: number; willpower: number; presence: number }
  soak?: number | null
  defMelee?: number | null
  defRanged?: number | null
  wounds?: { current: number; max: number }
  strain?: { current: number; max: number }
  minionGroup?: { alive: number; total: number }
}

const TokenTooltip = memo(function TokenTooltip(p: TooltipData) {
  const vw   = typeof window !== 'undefined' ? window.innerWidth  : 1200
  const vh   = typeof window !== 'undefined' ? window.innerHeight : 800
  const left = Math.max(8, Math.min(p.x + 14, vw - TOOLTIP_W - 8))
  const top  = Math.max(8, Math.min(p.y - 12, vh - 300))

  return createPortal(
    <div style={{
      position: 'fixed', left, top, width: TOOLTIP_W, zIndex: 9999,
      background: 'rgba(6,13,9,0.97)',
      border: `1px solid ${p.typeColor}44`,
      borderRadius: 6,
      boxShadow: `0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px ${p.typeColor}18`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      padding: '10px 12px', pointerEvents: 'none',
      fontFamily: FONT_RAJDHANI,
    }}>
      {/* Name + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1, fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontSize: FS_OL, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.typeColor, background: `${p.typeColor}18`, border: `1px solid ${p.typeColor}35`, borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>{p.typeLabel}</div>
      </div>

      {/* Characteristics grid */}
      {p.characteristics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, marginBottom: 8 }}>
          {CHAR_ABBRS.map((abbr, i) => (
            <div key={abbr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 2px' }}>
              <div style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.04em' }}>{abbr}</div>
              <div style={{ fontSize: FS_SM, fontWeight: 700, color: HUD.gold }}>{p.characteristics![CHAR_KEYS[i]]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Soak + Defense */}
      {(p.soak != null || p.defMelee != null || p.defRanged != null) && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {p.soak != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.04em' }}>SOAK</div>
              <div style={{ fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)' }}>{p.soak}</div>
            </div>
          )}
          {p.defMelee != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.04em' }}>DEF M</div>
              <div style={{ fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)' }}>{p.defMelee}</div>
            </div>
          )}
          {p.defRanged != null && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '4px 4px' }}>
              <div style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.04em' }}>DEF R</div>
              <div style={{ fontSize: FS_SM, fontWeight: 700, color: 'var(--hud-text)' }}>{p.defRanged}</div>
            </div>
          )}
        </div>
      )}

      {/* Minion group count */}
      {p.minionGroup && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Group</span>
            <span style={{ fontSize: FS_OL, fontWeight: 700, color: p.minionGroup.alive === 0 ? '#E05050' : 'var(--hud-text)' }}>
              {p.minionGroup.alive}/{p.minionGroup.total} alive
            </span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: p.minionGroup.total }).map((_, i) => (
              <span key={i} style={{ fontSize: 9, color: i < p.minionGroup!.alive ? '#E05252' : 'rgba(255,255,255,0.15)' }}>
                {i < p.minionGroup!.alive ? '■' : '□'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wounds bar */}
      {p.wounds && (
        <div style={{ marginBottom: p.strain ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wounds</span>
            <span style={{ fontSize: FS_OL, fontWeight: 700, color: p.wounds.current >= p.wounds.max ? '#E05050' : 'var(--hud-text)' }}>{p.wounds.current}/{p.wounds.max}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.wounds.current / Math.max(p.wounds.max, 1)) * 100)}%`, background: p.wounds.current >= p.wounds.max ? '#E05050' : 'var(--hud-gold)', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Strain bar */}
      {p.strain && (
        <div style={{ marginTop: p.wounds ? 6 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: FS_OL, color: 'var(--hud-text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Strain</span>
            <span style={{ fontSize: FS_OL, fontWeight: 700, color: p.strain.current >= p.strain.max ? '#E05050' : 'var(--hud-text)' }}>{p.strain.current}/{p.strain.max}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (p.strain.current / Math.max(p.strain.max, 1)) * 100)}%`, background: p.strain.current >= p.strain.max ? '#E05050' : '#4EC87A', borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
})

/* ── Component ─────────────────────────────────────────────── */
interface HudSessionTabProps {
  character: Character
  campaignId: string | null
  visibleMap: { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number } | null
  visibleMapTokens: MapToken[]
  onTokenMove: (tokenId: string, x: number, y: number) => void
  isCombatActive: boolean
  encounter: CombatEncounter | null
  hudTalents: HudTalent[]
}

export function HudSessionTab({
  character,
  campaignId,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  hudTalents,
}: HudSessionTabProps) {
  const supabase = useMemo(() => createClient(), [])
  const [talentDrawerOpen,      setTalentDrawerOpen]      = useState(false)
  const [adversaryDrawerOpen,   setAdversaryDrawerOpen]   = useState(false)
  const [tokenHoverInfo,        setTokenHoverInfo]        = useState<{ tokenId: string; x: number; y: number } | null>(null)
  const [sessionCardCollapsed,  setSessionCardCollapsed]  = useState<Record<string, boolean>>({})
  const [advStatCache,          setAdvStatCache]          = useState<Map<string, AdversaryInstance>>(new Map())
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

  const tokensById = useMemo(() => new Map(visibleMapTokens.map(t => [t.id, t])), [visibleMapTokens])

  const tooltipProps = useMemo((): TooltipData | null => {
    if (!tokenHoverInfo) return null
    const token = tokensById.get(tokenHoverInfo.tokenId)
    if (!token) return null

    // PC token — look up live character data
    if (token.participant_type === 'pc' && token.character_id) {
      const char = allChars.find(c => c.id === token.character_id)
      if (char) return {
        x: tokenHoverInfo.x, y: tokenHoverInfo.y,
        name: char.name, typeLabel: 'PC', typeColor: HUD.gold,
        characteristics: { brawn: char.brawn, agility: char.agility, intellect: char.intellect, cunning: char.cunning, willpower: char.willpower, presence: char.presence },
        soak: char.soak,
        defMelee: char.defense_melee,
        defRanged: char.defense_ranged,
        wounds: { current: char.wound_current, max: char.wound_threshold },
        strain: { current: char.strain_current, max: char.strain_threshold },
      }
    }

    // Adversary / vehicle linked to an active encounter slot — show live vitals
    if (token.slot_key && encounter) {
      const slot = encounter.initiative_slots.find(s => s.id === token.slot_key)
      if (slot?.adversaryInstanceId) {
        const adv = encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
        if (adv) {
          const color    = adv.type === 'minion' ? '#E05252' : adv.type === 'nemesis' ? '#9060D0' : '#FF9800'
          const woundsMax = adv.type === 'minion' && adv.groupSize
            ? (adv.woundThreshold ?? 0) * adv.groupSize
            : adv.woundThreshold
          return {
            x: tokenHoverInfo.x, y: tokenHoverInfo.y,
            name: adv.name ?? token.label ?? '?',
            typeLabel: adv.type.charAt(0).toUpperCase() + adv.type.slice(1),
            typeColor: color,
            characteristics: adv.characteristics,
            soak: adv.soak,
            defMelee: adv.defense?.melee,
            defRanged: adv.defense?.ranged,
            wounds: (adv.woundThreshold && woundsMax) ? { current: adv.woundsCurrent ?? 0, max: woundsMax } : undefined,
            strain: adv.type !== 'minion' && adv.strainThreshold ? { current: adv.strainCurrent ?? 0, max: adv.strainThreshold } : undefined,
            minionGroup: adv.type === 'minion' && adv.groupSize != null
              ? { alive: adv.groupRemaining ?? 0, total: adv.groupSize }
              : undefined,
          }
        }
      }
      if (slot?.vehicleInstanceId) {
        const veh = encounter.vehicles?.find(v => v.instanceId === slot.vehicleInstanceId)
        if (veh) return {
          x: tokenHoverInfo.x, y: tokenHoverInfo.y,
          name: veh.name, typeLabel: 'Vehicle',
          typeColor: veh.alignment === 'allied_npc' ? '#4EC87A' : '#E05252',
        }
      }
    }

    // Adversary with no encounter slot — fall back to base stats from ref_adversaries cache
    if (token.participant_type === 'adversary' && token.label) {
      const cached = advStatCache.get(token.label)
      if (cached) {
        const color = cached.type === 'minion' ? '#E05252' : cached.type === 'nemesis' ? '#9060D0' : '#FF9800'
        return {
          x: tokenHoverInfo.x, y: tokenHoverInfo.y,
          name: token.label,
          typeLabel: cached.type.charAt(0).toUpperCase() + cached.type.slice(1),
          typeColor: color,
          characteristics: cached.characteristics,
          soak: cached.soak,
          defMelee: cached.defense?.melee,
          defRanged: cached.defense?.ranged,
          wounds: cached.woundThreshold ? { current: 0, max: cached.woundThreshold } : undefined,
          strain: cached.type !== 'minion' && cached.strainThreshold ? { current: 0, max: cached.strainThreshold } : undefined,
        }
      }
    }

    // Last resort — name + alignment only
    return { x: tokenHoverInfo.x, y: tokenHoverInfo.y, name: token.label ?? '?', typeLabel: token.alignment ?? 'token', typeColor: HUD.gold }
  }, [tokenHoverInfo, tokensById, allChars, encounter, advStatCache])

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Map or placeholder */}
      {visibleMap
        ? (
          <MapCanvas
            mapImageUrl={visibleMap.image_url}
            tokens={visibleMapTokens}
            isGM={false}
            currentCharacterId={character.id}
            onTokenMove={onTokenMove}
            gridEnabled={visibleMap.grid_enabled}
            gridSize={visibleMap.grid_size ?? 50}
            tokenScale={visibleMap.token_scale ?? 1}
            onTokenHover={(id, x, y) => setTokenHoverInfo({ tokenId: id, x, y })}
            onTokenHoverEnd={() => setTokenHoverInfo(null)}
          />
        )
        : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, background: 'var(--hud-bg)' }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Waiting for GM to set a map</div>
          </div>
        )
      }

      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'var(--hud-surface-hi)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)', zIndex: 30,
          }}>
            <InitiativeStrip encounter={encounter} character={character} />
          </div>
        </>
      )}

      {/* ── Session drawer trigger buttons ── */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, zIndex: 31 }}>
        <button
          onClick={() => setTalentDrawerOpen(o => !o)}
          style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: talentDrawerOpen ? 'var(--bs-on-red)' : C.gold,
            background: talentDrawerOpen ? C.gold : 'var(--hud-surface-mid)',
            border: `1px solid rgba(224,58,30,0.5)`,
            borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
          }}
        >Talents</button>
        {encounter && encounter.adversaries.some(a => a.revealed) && visibleMapTokens.some(t => t.participant_type === 'adversary') && (
          <button
            onClick={() => setAdversaryDrawerOpen(o => !o)}
            style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: adversaryDrawerOpen ? 'var(--bs-on-red)' : C.gold,
              background: adversaryDrawerOpen ? C.gold : 'var(--hud-surface-mid)',
              border: `1px solid rgba(224,58,30,0.5)`,
              borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
            }}
          >{(encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</button>
        )}
      </div>

      {/* ── Drawers ── */}
      <HudTalentDrawer
        open={talentDrawerOpen}
        onClose={() => setTalentDrawerOpen(false)}
        hudTalents={hudTalents}
      />
      {encounter && encounter.adversaries.some(a => a.revealed) && visibleMapTokens.some(t => t.participant_type === 'adversary') && (
        <HudAdversaryDrawer
          open={adversaryDrawerOpen}
          onClose={() => setAdversaryDrawerOpen(false)}
          encounter={encounter}
          sessionCardCollapsed={sessionCardCollapsed}
          setSessionCardCollapsed={setSessionCardCollapsed}
        />
      )}

      {/* ── Token hover tooltip — portal to body, always shown for visible tokens ── */}
      {tooltipProps && <TokenTooltip {...tooltipProps} />}
    </div>
  )
}
