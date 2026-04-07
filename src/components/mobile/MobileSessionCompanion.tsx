'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCharacterData } from '@/hooks/useCharacterData'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { MobileHeader } from './MobileHeader'
import { MobileTabBar, type TabId } from './MobileTabBar'
import { BottomSheet } from './shared/BottomSheet'
import { StatusTab } from './tabs/StatusTab'
import { SkillsTab } from './tabs/SkillsTab'
import { GearTab } from './tabs/GearTab'
import { WoundsStrainFab, WoundsStrainOverlay } from './overlays/WoundsStrainOverlay'
import { DiceRollerSheet, type MobilePrePopSkill } from './overlays/DiceRollerSheet'
import { useSessionRollState, getWoundThresholdBonus } from '@/hooks/useSessionRollState'
import { SessionStatusBanner } from '@/components/player/SessionStatusBanner'
import { useDerivedStats } from '@/hooks/useDerivedStats'
import { computeEncumbranceStats } from '@/lib/derivedStats'
import { useRollFeed } from '@/hooks/useRollFeed'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { CombatTracker } from '@/components/player/CombatTracker'
import { ForcePanel, type ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { ForceCheckButton } from '@/components/character/ForceCheckButton'
import { ForceCheckOverlay } from '@/components/force-check/ForceCheckOverlay'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { isDathomiri } from '@/lib/dathomiriUtils'
import { RANGE_LABELS } from '@/lib/types'
import type { ForceTreeNode, ForceTreeConnection } from '@/components/character/ForcePowerTree'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const BG   = '#060D09'
const GOLD = '#C8AA50'
const TEXT = 'rgba(255,255,255,0.85)'
const TEXT_DIM   = 'rgba(255,255,255,0.5)'
const BORDER     = 'rgba(200,170,80,0.1)'
const FONT_C = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

interface MobileSessionCompanionProps {
  characterId: string
  campaignId?: string | null
}

export function MobileSessionCompanion({ characterId, campaignId }: MobileSessionCompanionProps) {
  const {
    character, skills, talents, weapons, armor, gear, crits,
    refSkills, refTalentMap,
    refSkillMap,
    refWeaponMap, refArmorMap, refGearMap, refDescriptorMap, refWeaponQualityMap,
    refAttachmentMap,
    charForceAbilities, refForcePowers,
    refForcePowerMap, refForceAbilityMap,
    forceRating,
    handleVitalChange, handleSetEquipState, handleBuySkill,
    handleRemoveWeapon, handleRemoveEquipment,
    loading, error,
  } = useCharacterData(characterId)

  // ── Derived stats engine (called unconditionally before early returns) ──
  const derivedStats = useDerivedStats({
    character: character ?? null,
    forceRatingBase: forceRating,
    talents,
    refTalentMap,
    armor,
    refArmorMap,
    refAttachmentMap,
    weapons,
    refWeaponMap,
    refWeaponQualityMap,
  })
  const effectiveStats = derivedStats?.effectiveStats
  const skillModifiers = derivedStats?.modifiers.skillModifiers ?? {}

  const encStats = character
    ? computeEncumbranceStats(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap)
    : null

  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null

  const [activeTab, setActiveTab]     = useState<TabId>('status')
  const [woundsOpen, setWoundsOpen]   = useState(false)
  const [diceOpen, setDiceOpen]       = useState(false)
  const [diceSkill, setDiceSkill]     = useState<MobilePrePopSkill | null>(null)
  const [forceCheckOpen, setForceCheckOpen] = useState(false)

  // Must be called unconditionally before any early returns
  const sessionRollState = useSessionRollState(effectiveCampaignId)
  const rolls = useRollFeed(effectiveCampaignId)

  // Wake lock — silent, no UI
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(navigator as any).wakeLock.request('screen').then((l: WakeLockSentinel) => { lock = l }).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [])

  // ── Force powers computation (mirrors desktop) ──────────────────────────
  const allForcePowers = useMemo((): ForcePowerDisplay[] => {
    if (!charForceAbilities || !refForcePowers || !refForceAbilityMap) return []
    const purchaseCount = new Map<string, number>()
    for (const a of charForceAbilities) {
      const k = `${a.force_power_key}:${a.force_ability_key}`
      purchaseCount.set(k, (purchaseCount.get(k) ?? 0) + 1)
    }
    return refForcePowers
      .filter(fp => fp.ability_tree?.rows?.length)
      .map(fp => {
        const abilityMap = new Map<string, ForcePowerDisplay['abilities'][number]>()
        for (const row of (fp.ability_tree?.rows ?? [])) {
          for (let col = 0; col < (row.abilities || []).length; col++) {
            const aKey = row.abilities[col]
            const cost = (row.costs || [])[col] ?? 0
            if (!aKey || cost === 0) continue
            const ref = refForceAbilityMap[aKey]
            if (!ref) continue
            const existing = abilityMap.get(aKey)
            if (existing) { existing.totalRanks++ }
            else {
              const purchased = purchaseCount.get(`${fp.key}:${aKey}`) ?? 0
              abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description, purchasedRanks: purchased, totalRanks: 1, cost })
            }
          }
        }
        // Build tree nodes for ForcePowerCard
        const treeNodes: ForceTreeNode[] = []
        const treeConnections: ForceTreeConnection[] = []
        const purchasedSet = new Set(charForceAbilities.filter(a => a.force_power_key === fp.key).map(a => `${a.tree_row}-${a.tree_col}`))
        const refPower = refForcePowerMap?.[fp.key]
        if (refPower?.ability_tree?.rows) {
          for (const row of refPower.ability_tree.rows) {
            const abils = row.abilities || []
            const dirs = row.directions || []
            const spans = row.spans || []
            const costs = row.costs || []
            for (let col = 0; col < abils.length; col++) {
              const aKey = abils[col]
              const ref = refForceAbilityMap[aKey]
              const span = spans[col] ?? 1
              const cost = costs[col] ?? 0
              const isPurchased = purchasedSet.has(`${row.index}-${col}`)
              const dir = dirs[col] || {}
              let canPurchase = false
              if (!isPurchased && cost > 0) {
                if (row.index === 0) canPurchase = true
                else {
                  if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
                  if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
                  if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
                  if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
                }
              }
              treeNodes.push({ abilityKey: aKey, name: ref?.name || aKey, description: ref?.description, row: row.index, col, span, cost, purchased: isPurchased, canPurchase })
              if (span > 0) {
                if (dir.right && col < 3) treeConnections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
                if (dir.down) treeConnections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
              }
            }
          }
        }
        const abilities = Array.from(abilityMap.values())
        const purchasedCount = abilities.reduce((s, a) => s + Math.min(a.purchasedRanks, a.totalRanks), 0)
        const totalCount = abilities.reduce((s, a) => s + a.totalRanks, 0)
        return {
          powerKey: fp.key, powerName: fp.name, description: fp.description,
          purchasedCount, totalCount, abilities,
          treeNodes, treeConnections,
        }
      })
      .sort((a, b) => {
        if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1
        if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1
        return a.powerName.localeCompare(b.powerName)
      })
  }, [charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap])

  const openSkillDice = (skill: MobilePrePopSkill) => {
    setDiceSkill(skill)
    setDiceOpen(true)
  }

  const openFreeDice = () => {
    setDiceSkill(null)
    setDiceOpen(true)
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100dvh',
        background: BG,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HolocronLoader />
      </div>
    )
  }

  if (error || !character) {
    return (
      <div style={{
        width: '100vw', height: '100dvh',
        background: BG,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: 24,
      }}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <p style={{ fontFamily: FONT_C, color: GOLD, textAlign: 'center', fontSize: 'clamp(0.9rem, 3.5vw, 1rem)' }}>
          {error ?? 'Character not found.'}
        </p>
      </div>
    )
  }

  const woundBonus = getWoundThresholdBonus(character.id, sessionRollState)

  const woundPct = character.wound_threshold > 0
    ? character.wound_current / character.wound_threshold : 0
  const fabBorderColor = woundPct >= 0.8
    ? 'rgba(244,67,54,0.7)'
    : 'rgba(200,170,80,0.4)'

  const isForceUser = isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)
  const hasCampaign = !!effectiveCampaignId

  // Equipped weapons for the Combat tab weapon strip
  const equippedWeapons = weapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <MobileHeader
        characterName={character.name}
        onOpenDiceRoller={openFreeDice}
      />

      {/* ── Session Status Banner ── */}
      <SessionStatusBanner
        sessionRollState={sessionRollState}
        characterId={character.id}
        characterNames={{ [character.id]: character.name }}
        triggeredObligationType={character.obligation_type}
        ownObligationValue={character.obligation_value}
      />

      {/* ── Scrollable tab content ── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', position: 'relative' }}>
        {activeTab === 'status' && (
          <StatusTab
            character={character}
            weapons={weapons}
            crits={crits}
            refWeaponMap={refWeaponMap}
            refSkillMap={refSkillMap}
            effectiveStats={effectiveStats}
          />
        )}
        {activeTab === 'skills' && (
          <SkillsTab
            character={character}
            charSkills={skills}
            refSkills={refSkills}
            onSkillTap={openSkillDice}
            skillModifiers={skillModifiers}
            xpAvailable={character.xp_available}
            onUpgradeSkill={handleBuySkill}
          />
        )}
        {activeTab === 'gear' && (
          <GearTab
            weapons={weapons}
            armor={armor}
            gear={gear}
            brawn={character.brawn}
            refWeaponMap={refWeaponMap}
            refArmorMap={refArmorMap}
            refGearMap={refGearMap}
            refSkillMap={refSkillMap}
            refDescriptorMap={refDescriptorMap}
            refWeaponQualityMap={refWeaponQualityMap}
            onSetWeaponState={(id, s) => handleSetEquipState(id, 'weapon', s)}
            onSetArmorState={(id, s) => handleSetEquipState(id, 'armor', s)}
            onSetGearState={(id, s) => handleSetEquipState(id, 'gear', s)}
            onDiscardWeapon={id => handleRemoveWeapon(id, 'player')}
            onDiscardArmor={id => handleRemoveEquipment(id, 'armor', 'player')}
            onDiscardGear={id => handleRemoveEquipment(id, 'gear', 'player')}
          />
        )}
        {activeTab === 'combat' && hasCampaign && (
          <div style={{ paddingBottom: 16 }}>
            {/* ── Equipped weapons strip ── */}
            {equippedWeapons.length > 0 && (
              <div style={{ padding: '10px 16px 0' }}>
                <div style={{
                  fontFamily: FONT_C,
                  fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                  fontWeight: 700,
                  color: GOLD,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  paddingBottom: 6,
                  borderBottom: `1px solid ${BORDER}`,
                  marginBottom: 8,
                }}>
                  Your Weapons
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {equippedWeapons.map(cw => {
                    const ref = refWeaponMap[cw.weapon_key]
                    if (!ref) return null
                    return (
                      <div key={cw.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(200,170,80,0.04)',
                        border: `1px solid rgba(200,170,80,0.12)`,
                        borderRadius: 6,
                        padding: '7px 10px',
                        minHeight: 44,
                      }}>
                        <span style={{
                          fontFamily: FONT_R,
                          fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
                          fontWeight: 700,
                          color: TEXT,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {cw.custom_name || ref.name}
                        </span>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                          <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)', color: '#E07855' }}>
                            DMG {ref.damage_add != null
                              ? `+${ref.damage_add}`
                              : ref.damage}
                          </span>
                          {ref.crit > 0 && (
                            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)', color: '#E05050' }}>
                              CRIT {ref.crit}
                            </span>
                          )}
                          <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)', color: TEXT_DIM }}>
                            {RANGE_LABELS[ref.range_value] ?? ref.range_value}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Initiative tracker ── */}
            <div style={{ height: 'calc(100dvh - 200px)', marginTop: equippedWeapons.length > 0 ? 12 : 0 }}>
              <CombatTracker
                character={character}
                campaignId={effectiveCampaignId!}
              />
            </div>
          </div>
        )}
        {activeTab === 'feed' && hasCampaign && (
          <div style={{ padding: '12px 16px', paddingBottom: 24 }}>
            <RollFeedPanel
              rolls={rolls}
              ownCharacterId={character.id}
              isGm={false}
            />
          </div>
        )}
        {activeTab === 'force' && isForceUser && (
          <div style={{ padding: '12px 16px', paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ForcePanel
              forceRating={effectiveStats?.forceRating ?? forceRating}
              committedForce={character.force_rating_committed ?? 0}
              moralityValue={character.morality_value ?? 50}
              moralityStrength={character.morality_strength_key || ''}
              moralityWeakness={character.morality_weakness_key || ''}
              moralityConfigured={character.morality_configured}
              forcePowers={allForcePowers.filter(fp => fp.purchasedCount > 0)}
              xpAvailable={character.xp_available}
              onViewPower={() => {}}
              onAdd={() => {}}
              isFallen={character.is_dark_side_fallen === true}
            />
            <ForceCheckButton onOpen={() => setForceCheckOpen(true)} />
          </div>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasCampaign={hasCampaign}
        hasForce={isForceUser}
      />

      {/* ── Wounds/Strain FAB ── */}
      <button
        onClick={() => setWoundsOpen(true)}
        aria-label="Open wounds and strain tracker"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 50,
          background: 'rgba(6,13,9,0.9)',
          border: `1px solid ${fabBorderColor}`,
          borderRadius: 24,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <WoundsStrainFab character={character} woundBonus={woundBonus} />
      </button>

      {/* ── Wounds/Strain Bottom Sheet ── */}
      <BottomSheet
        open={woundsOpen}
        onClose={() => setWoundsOpen(false)}
        maxHeight="60dvh"
      >
        <WoundsStrainOverlay
          character={character}
          onVitalChange={handleVitalChange}
          woundBonus={woundBonus}
          encumbranceCurrent={encStats?.current}
          encumbranceThreshold={encStats?.threshold}
        />
      </BottomSheet>

      {/* ── Dice Roller Bottom Sheet ── */}
      <BottomSheet
        open={diceOpen}
        onClose={() => setDiceOpen(false)}
        maxHeight="85dvh"
      >
        <DiceRollerSheet
          key={diceSkill ? `${diceSkill.name}-${diceSkill.proficiency}` : 'free'}
          prePopSkill={diceSkill}
          characterId={characterId}
          characterName={character.name}
          campaignId={campaignId}
        />
      </BottomSheet>

      {/* ── Force Check Overlay ── */}
      {isForceUser && (
        <ForceCheckOverlay
          open={forceCheckOpen}
          onClose={() => setForceCheckOpen(false)}
          character={character}
          forceRating={effectiveStats?.forceRating ?? forceRating}
          committedForce={character.force_rating_committed ?? 0}
          forcePowers={allForcePowers}
          isDathomiri={isDathomiri(character)}
          isCombat={false}
          campaignId={effectiveCampaignId}
          characterId={character.id}
        />
      )}
    </div>
  )
}
