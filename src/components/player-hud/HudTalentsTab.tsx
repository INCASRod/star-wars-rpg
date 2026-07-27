'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BuySpecButton } from './BuySpecButton'
import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { warmRefDataCache } from '@/lib/refDataCache'
import { FS, SP, RADIUS, EASE, FONT_BODY, HUD, Z } from '@/lib/tokens'
import type { Character, CharacterSpecialization, CharacterTalent, RefSpecialization, RefTalent } from '@/lib/types'
import type { HudTalent } from './TalentsPanel'

interface HudTalentsTabProps {
  character: Character
  characterId: string
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refSpecs: RefSpecialization[]
  refTalentMap: Record<string, RefTalent>
  careerSpecKeys: Set<string>
  specKeyToCareerName: Record<string, string>
  talents: CharacterTalent[]
  hudTalents: HudTalent[]
  activeSpecKey: string | null
  setActiveSpecKey: (k: string) => void
  isCombat: boolean
  isGmMode?: boolean
  onBuySpecialization: (specKey: string, setSpecKey: (k: string) => void) => void
}

export function HudTalentsTab({
  character, characterId, charSpecs, refSpecMap, refSpecs, refTalentMap,
  careerSpecKeys, specKeyToCareerName,
  talents, hudTalents, activeSpecKey, setActiveSpecKey,
  isCombat, isGmMode, onBuySpecialization,
}: HudTalentsTabProps) {
  const router = useRouter()
  const [tooltipVisible, setTooltipVisibleState] = useState<Record<string, boolean>>({})

  function setTooltipVisible(key: string, visible: boolean) {
    setTooltipVisibleState(prev => ({ ...prev, [key]: visible }))
  }

  // Warms the shared ref-data cache (Prompt 7c) on hover/focus intent, before
  // the user actually clicks through to /character/[id]/talents. In practice
  // this route is only reachable via this exact button, and by the time it's
  // visible/hoverable useCharacterData has already loaded (and cached) the
  // same ref tables — so this is belt-and-braces, not the primary fix; it
  // matters only if that entry-point assumption ever changes. Fire-and-forget:
  // never throws into the UI, never blocks the hover/focus interaction.
  // Idempotent via a local guard (skips even constructing a client on repeat
  // hovers) on top of fetchActiveDataset's and the ref cache's own dedup.
  const prefetchedRef = useRef(false)
  function prefetchTalentSurfaceRefData() {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    const supabase = createClient()
    fetchActiveDataset(supabase).then(warmRefDataCache).catch(() => {})
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>

      {/* ── Compact spec + XP bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: SP[2], flexWrap: 'wrap',
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
        flexShrink: 0,
      }}>
        {charSpecs.map(cs => {
          const ref = refSpecMap[cs.specialization_key]
          const purchased = talents.filter(t => t.specialization_key === cs.specialization_key).length
          const total = ref?.talent_tree?.rows?.reduce((s: number, r: any) => s + (r.talents?.length || 0), 0) || 0
          const isActive = (activeSpecKey || charSpecs[0]?.specialization_key) === cs.specialization_key
          return (
            <button
              key={cs.id}
              onClick={() => setActiveSpecKey(cs.specialization_key)}
              style={{
                background: isActive ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--hud-accent-border)' : 'var(--hud-border)'}`,
                borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: SP[1],
                fontFamily: FONT_BODY,
                fontSize: FS.overline, fontWeight: 600, letterSpacing: '0.06em',
                color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-dim)',
                transition: EASE.default,
              }}
            >
              {ref?.name || cs.specialization_key}
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-faint)',
                background: 'var(--hud-surface-lo)', borderRadius: RADIUS.lg, padding: `0 ${SP[1]}`,
              }}>
                {purchased}/{total}
              </span>
            </button>
          )
        })}
        <BuySpecButton
          character={character}
          charSpecs={charSpecs}
          refSpecs={refSpecs}
          refSpecMap={refSpecMap}
          refTalentMap={refTalentMap}
          careerSpecKeys={careerSpecKeys}
          specKeyToCareerName={specKeyToCareerName}
          onBuy={specKey => onBuySpecialization(specKey, setActiveSpecKey)}
        />
        <div style={{ flex: 1 }} />
        {character.xp_available != null && (
          <div style={{
            background: 'var(--hud-surface-lo)',
            border: `1px solid var(--hud-border)`,
            borderRadius: RADIUS.sm,
            padding: `${SP[1]} ${SP[2]}`,
            fontFamily: FONT_BODY,
            fontSize: FS.overline, fontWeight: 700,
            color: HUD.gold,
            flexShrink: 0,
          }}>
            {character.xp_available} XP
          </div>
        )}
      </div>

      {/* ── Talent cards quick-reference ── */}
      <WfTalentsPanel liveTalents={hudTalents} characterName={character.name} characterId={characterId} />

      {/* ── Per-spec upgrade blocks ── */}
      {charSpecs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: `${SP[10]} 0`,
          fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--hud-text-faint)',
        }}>
          No specializations purchased yet.
        </div>
      ) : (
        charSpecs.map(cs => {
          const ref = refSpecMap[cs.specialization_key]
          const specName = ref?.name || cs.specialization_key
          const totalTalents = ref?.talent_tree?.rows?.reduce(
            (s: number, r: any) => s + (r.talents?.length || 0), 0
          ) || 0
          const purchasedCount = talents.filter(t => t.specialization_key === cs.specialization_key).length
          const specKey = cs.specialization_key

          return (
            <div
              key={cs.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${SP[2]} ${SP[3]}`,
                borderTop: `1px solid var(--hud-border)`,
                background: 'var(--hud-surface-lo)',
              }}
            >
              {/* Left — spec info */}
              <div>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm,
                  fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--hud-gold)',
                }}>
                  {specName}
                </div>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline,
                  color: 'var(--hud-text-faint)', marginTop: SP[1],
                }}>
                  Specialization Tree · {totalTalents} Talents · {purchasedCount} purchased
                </div>
              </div>

              {/* Right — Upgrade Talents button + combat tooltip */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={isCombat ? () => setTooltipVisible(specKey, true) : undefined}
                onMouseLeave={isCombat ? () => setTooltipVisible(specKey, false) : undefined}
              >
                <button
                  onClick={!isCombat
                    ? () => {
                        setActiveSpecKey(specKey)
                        const qs = new URLSearchParams({ spec: specKey })
                        if (isGmMode) qs.set('gm', '1')
                        router.push(`/character/${characterId}/talents?${qs.toString()}`)
                      }
                    : undefined}
                  onMouseEnter={!isCombat ? prefetchTalentSurfaceRefData : undefined}
                  onFocus={!isCombat ? prefetchTalentSurfaceRefData : undefined}
                  disabled={isCombat}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: `${SP[1]} ${SP[3]}`,
                    borderRadius: RADIUS.sm,
                    border: isCombat
                      ? `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)`
                      : `1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`,
                    background: isCombat
                      ? 'transparent'
                      : `color-mix(in srgb, var(--hud-gold) 10%, transparent)`,
                    color: isCombat ? 'var(--hud-text-faint)' : 'var(--hud-gold)',
                    cursor: isCombat ? 'not-allowed' : 'pointer',
                    opacity: isCombat ? 0.5 : 1,
                    transition: `background ${EASE.quick}, border-color ${EASE.quick}, color ${EASE.quick}`,
                  }}
                >
                  Upgrade Talents
                </button>

                {isCombat && tooltipVisible[specKey] && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 6px)',
                    right: 0,
                    background: 'var(--hud-surface-hi)',
                    border: `1px solid var(--hud-border-hi)`,
                    borderRadius: RADIUS.sm,
                    padding: `${SP[1]} ${SP[2]}`,
                    fontFamily: FONT_BODY,
                    fontSize: FS.overline,
                    color: 'var(--hud-text-dim)',
                    whiteSpace: 'nowrap',
                    zIndex: Z.tooltip,
                    pointerEvents: 'none',
                  }}>
                    Talents cannot be purchased during Combat
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}

    </div>
  )
}
