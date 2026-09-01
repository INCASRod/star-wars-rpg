'use client'

import { useState, useMemo }            from 'react'
import { createClient }                 from '@/lib/supabase/client'
import { useCharacterData }             from '@/hooks/useCharacterData'
import { useDerivedStats }              from '@/hooks/useDerivedStats'
import { useRollFeed }                  from '@/hooks/useRollFeed'
import { useDestinyPool }               from '@/hooks/useDestinyPool'
import { useCharacterConflicts }        from '@/hooks/useCharacterConflicts'
import { computeEncumbranceStats }      from '@/lib/derivedStats'
import { CharacterLoader }              from '@/components/ui/CharacterLoader'
import { FONT_BODY, FS, SP, HUD }      from '@/lib/tokens'
import { fetchFreshCommitState }        from '@/lib/forceUtils'
import { logPurchaseNotification }      from '@/lib/logRoll'
import type { ForceCommitment }         from '@/lib/types'

import { MobileRunner, type RunnerTab } from './MobileRunner'
import { MobileBottomNav, type NavTab } from './MobileBottomNav'
import { MobileIdentityBar }            from './MobileIdentityBar'
import { MobileVitalsStrip }            from './MobileVitalsStrip'
import { MobileFeedScreen }             from './screens/MobileFeedScreen'
import { MobileSkillsScreen }           from './screens/MobileSkillsScreen'
import { MobileDiceScreen }             from './screens/MobileDiceScreen'
import { MobileTalentsScreen }          from './screens/MobileTalentsScreen'
import { MobileItemsScreen }            from './screens/MobileItemsScreen'
import { MobileGroupScreen }            from './screens/MobileGroupScreen'
import { MobileTalentsBuyScreen }       from './screens/MobileTalentsBuyScreen' /* Added for mobile Talents tab */
import { MobileForceScreen }            from './screens/MobileForceScreen'      /* Added for mobile Force tab */
import { MobileSkillsBuyScreen }        from './screens/MobileSkillsBuyScreen'  /* Added for mobile +Skills runner tab */
import { MobileLoreScreen }             from './screens/MobileLoreScreen'        /* Added for mobile Lore runner tab */
import { MobileDestinySpendSheet }      from './MobileDestinySpendSheet'
import { BottomSheet }                  from '@/components/mobile/shared/BottomSheet'
import { WoundsStrainOverlay }          from '@/components/mobile/overlays/WoundsStrainOverlay'

interface MobileHudLayoutProps {
  characterId: string
  campaignId?: string | null
}

export function MobileHudLayout({ characterId, campaignId }: MobileHudLayoutProps) {
  const supabase = useMemo(() => createClient(), [])

  const {
    character, talents, weapons, armor, gear,
    charSpecs, speciesAbilities,
    refTalentMap, refArmorMap, refWeaponMap, refGearMap,
    refWeaponQualityMap, refAttachmentMap,
    forceRating, careerForceRatingBase, hudSkills,
    hudTalents, hudWeapons, hudArmor, hudGear,   // Phase 2 hud-ready arrays
    loading, error,
    /* Added for mobile Force tab */
    charForceAbilities,
    refForcePowers,
    refForceAbilities,
    refForcePowerMap,
    refForceAbilityMap,
    /* Added for mobile Talents tab */
    refSpecs,
    refSpecMap,
    /* Added for mobile Talents/Force purchase handlers */
    handlePurchaseTalent,
    handlePurchaseForceAbility,
    /* Added for mobile +Skills runner tab */
    handleBuySkill,
    /* Added for mobile Lore runner tab */
    refSpeciesAll,
    refCareers,
    refObligationTypes,
    refDutyTypes,
    handleSetEquipState,
    handleVitalChange,
  } = useCharacterData(characterId)

  const derivedStats = useDerivedStats({
    character: character ?? null,
    forceRatingBase: forceRating,
    careerForceRatingBase,
    talents,
    refTalentMap,
    armor,
    refArmorMap,
    refAttachmentMap,
    weapons,
    refWeaponMap,
    refWeaponQualityMap,
    speciesAbilities,
  })

  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const rolls = useRollFeed(effectiveCampaignId)

  /* Added for mobile Force tab — conflict pip display */
  const { conflicts } = useCharacterConflicts(character?.id, supabase)

  /* Added for mobile Force tab — cancel commit handler (mirrors HudForceTab.handleCancelCommit).
   * Fresh-fetch + GM notification brought to parity with desktop — previously
   * wrote straight from the local character prop with no re-read and no
   * notification, which let a released die go invisible to the GM. */
  const handleCancelCommit = async (powerKey: string, effectName: string) => {
    if (!character) return
    const { committed, commitments } = await fetchFreshCommitState(supabase, character.id, {
      committed: character.force_rating_committed ?? 0,
      commitments: character.force_commitments ?? [],
    })
    const target = commitments.find(c => c.power_key === powerKey && c.effect_name === effectName)
    if (!target) return
    const updated: ForceCommitment[] = target.dice_count <= 1
      ? commitments.filter(c => !(c.power_key === powerKey && c.effect_name === effectName))
      : commitments.map(c =>
          c.power_key === powerKey && c.effect_name === effectName
            ? { ...c, dice_count: c.dice_count - 1 }
            : c
        )
    const newCommitted = Math.max(0, committed - 1)
    await supabase
      .from('characters')
      .update({ force_rating_committed: newCommitted, force_commitments: updated })
      .eq('id', character.id)

    if (character.campaign_id) {
      logPurchaseNotification({
        campaignId: character.campaign_id,
        characterId: character.id,
        characterName: character.name,
        label: `${character.name} released 1 Force die from ${target.power_name} — ${target.effect_name}`,
        meta: { purchase_type: 'force', xp_cost: 0, refunded: false, force_power_key: powerKey, force_ability_key: target.ability_key },
      })
    }
  }

  // Called unconditionally — handles undefined characterName and null campaignId gracefully.
  const { destinyPool, destinyPoolRecord } = useDestinyPool(
    effectiveCampaignId,
    characterId,
    character?.name,
    supabase,
  )

  const encStats = character
    ? computeEncumbranceStats(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap)
    : null
  const encumbranceWarning = !!encStats && encStats.load >= encStats.threshold * 0.9

  const [runnerTab, setRunnerTab] = useState<RunnerTab>('feed')
  const [navTab, setNavTab]       = useState<NavTab | null>(null)
  const [diceSkill, setDiceSkill] = useState<string | null>(null)
  const [destinySheetOpen, setDestinySheetOpen] = useState(false)
  const [vitalsOverlayOpen, setVitalsOverlayOpen] = useState(false)

  function handleNavChange(tab: NavTab) {
    setNavTab(prev => (prev === tab ? null : tab))
    if (tab === 'dice') setDiceSkill(null)
  }

  function handleRunnerChange(tab: RunnerTab) {
    setRunnerTab(tab)
    setNavTab(null)
  }

  function handleSkillRoll(skillKey: string) {
    setDiceSkill(skillKey)
    setNavTab('dice')
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100dvh', background: 'var(--hud-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CharacterLoader />
      </div>
    )
  }

  if (error || !character) {
    return (
      <div style={{
        width: '100vw', height: '100dvh', background: 'var(--hud-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: SP[2], padding: SP[4],
      }}>
        <span style={{ fontSize: FS.h2 }}>⚠️</span>
        <p style={{ fontFamily: FONT_BODY, color: HUD.gold, textAlign: 'center', fontSize: FS.sm }}>
          {error ?? 'Character not found.'}
        </p>
      </div>
    )
  }

  // character is guaranteed non-null past the early-return guard above
  const char = character! // safe: returned early if character was null
  const es = derivedStats?.effectiveStats
  const woundThreshold  = es?.woundThreshold  ?? character.wound_threshold
  const strainThreshold = es?.strainThreshold ?? character.strain_threshold
  const soakValue       = es?.soak            ?? character.soak
  const defMelee        = es?.defenseMelee    ?? character.defense_melee
  const defRanged       = es?.defenseRanged   ?? character.defense_ranged

  function renderScreen() {
    // Nav tab takes priority over runner tab
    if (navTab) {
      switch (navTab) {
        case 'skills':
          return (
            <MobileSkillsScreen
              hudSkills={hudSkills}
              xpAvailable={char.xp_available ?? 0}
              onRollSkill={handleSkillRoll}
            />
          )
        case 'dice':
          return (
            <MobileDiceScreen
              preSelectedSkill={diceSkill}
              hudSkills={hudSkills}
              characterId={characterId}
              characterName={char.name}
              campaignId={effectiveCampaignId}
              forceRating={forceRating ?? 0}
            />
          )
        case 'talents':
          return <MobileTalentsScreen hudTalents={hudTalents} />
        case 'items':
          return (
            <MobileItemsScreen
              hudWeapons={hudWeapons}
              hudArmor={hudArmor}
              hudGear={hudGear}
              encCurrent={encStats?.load ?? 0}
              encThreshold={encStats?.threshold ?? 0}
              credits={char.credits ?? 0}
              campaignId={effectiveCampaignId ?? ''}
              handleSetEquipState={handleSetEquipState}
            />
          )
        case 'group':
          return (
            <MobileGroupScreen
              campaignId={effectiveCampaignId}
              characterId={characterId}
              characterName={char.name}
              destinyPool={destinyPool}
              supabase={supabase}
            />
          )
      }
    }

    // Runner tab (no nav overlay active)
    switch (runnerTab) {
      case 'feed':
        return <MobileFeedScreen rolls={rolls} ownCharacterId={characterId} />
      case 'talents-buy':
        return (
          <MobileTalentsBuyScreen
            charSpecs={charSpecs}
            refSpecMap={refSpecMap}
            talents={talents}
            refTalentMap={refTalentMap}
            xpAvailable={char.xp_available ?? 0}
            onPurchaseTalent={handlePurchaseTalent}
          />
        )
      case 'force':
        return (
          <MobileForceScreen
            forceRating={forceRating ?? 0}
            forceRatingCommitted={char.force_rating_committed ?? 0}
            moralityValue={char.morality_value}
            moralityConfigured={char.morality_configured}
            moralityStrengthKey={char.morality_strength_key ?? null}
            moralityWeaknessKey={char.morality_weakness_key ?? null}
            isFallen={char.is_dark_side_fallen === true}
            commitments={char.force_commitments ?? []}
            charForceAbilities={charForceAbilities}
            refForcePowers={refForcePowers}
            refForceAbilityMap={refForceAbilityMap}
            refForcePowerMap={refForcePowerMap}
            conflicts={conflicts}
            xpAvailable={char.xp_available ?? 0}
            onPurchaseForceAbility={handlePurchaseForceAbility}
            onCancelCommit={handleCancelCommit}
          />
        )
      case 'skills-buy':
        return (
          <MobileSkillsBuyScreen
            hudSkills={hudSkills}
            xpAvailable={char.xp_available ?? 0}
            onBuySkill={handleBuySkill}
          />
        )
      case 'lore':
        return (
          <MobileLoreScreen
            character={char}
            speciesAbilities={speciesAbilities}
            refSpeciesAll={refSpeciesAll}
            refCareers={refCareers}
            refSpecs={refSpecs}
            charSpecs={charSpecs}
            refObligationTypes={refObligationTypes}
            refDutyTypes={refDutyTypes}
            forceRating={forceRating ?? 0}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      background: 'var(--hud-bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <MobileRunner activeTab={runnerTab} onTabChange={handleRunnerChange} />

      <MobileIdentityBar
        name={character.name}
        careerKey={character.career_key ?? null}
        specKey={charSpecs?.[0]?.specialization_key ?? null}
        speciesKey={character.species_key ?? null}
        xpAvailable={character.xp_available ?? 0}
        credits={character.credits ?? 0}
        destinyPool={destinyPool}
        destinyPoolRecord={destinyPoolRecord}
        onSpendDestiny={() => setDestinySheetOpen(true)}
        portraitUrl={character.portrait_url ?? null}
      />

      <MobileVitalsStrip
        woundCurrent={character.wound_current ?? 0}
        woundThreshold={woundThreshold}
        strainCurrent={character.strain_current ?? 0}
        strainThreshold={strainThreshold}
        soak={soakValue}
        defMelee={defMelee}
        defRanged={defRanged}
        onWoundsTap={() => setVitalsOverlayOpen(true)}
        onStrainTap={() => setVitalsOverlayOpen(true)}
      />

      <div style={{
        flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
        position: 'relative', display: 'flex', flexDirection: 'column',
      }}>
        {renderScreen()}
      </div>

      <MobileBottomNav
        activeTab={navTab}
        onTabChange={handleNavChange}
        encumbranceWarning={encumbranceWarning}
      />

      {destinyPoolRecord && effectiveCampaignId && (
        <MobileDestinySpendSheet
          isOpen={destinySheetOpen}
          onClose={() => setDestinySheetOpen(false)}
          destinyPoolRecord={destinyPoolRecord}
          characterName={character?.name ?? ''}
          characterId={characterId}
          campaignId={effectiveCampaignId}
          supabase={supabase}
        />
      )}

      {char && (
        <BottomSheet
          open={vitalsOverlayOpen}
          onClose={() => setVitalsOverlayOpen(false)}
          maxHeight="60dvh"
        >
          <WoundsStrainOverlay
            character={char}
            onVitalChange={handleVitalChange}
            encumbranceCurrent={encStats?.load}
            encumbranceThreshold={encStats?.threshold}
          />
        </BottomSheet>
      )}
    </div>
  )
}
