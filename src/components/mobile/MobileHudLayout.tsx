'use client'

import { useState, useMemo }            from 'react'
import { createClient }                 from '@/lib/supabase/client'
import { useCharacterData }             from '@/hooks/useCharacterData'
import { useDerivedStats }              from '@/hooks/useDerivedStats'
import { useRollFeed }                  from '@/hooks/useRollFeed'
import { useDestinyPool }               from '@/hooks/useDestinyPool'
import { computeEncumbranceStats }      from '@/lib/derivedStats'
import { CharacterLoader }              from '@/components/ui/CharacterLoader'
import { FONT_BODY, FS, SP, HUD }      from '@/lib/tokens'

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
    forceRating, hudSkills,
    hudTalents, hudWeapons, hudArmor, hudGear,   // Phase 2 hud-ready arrays
    loading, error,
  } = useCharacterData(characterId)

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
    speciesAbilities,
  })

  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const rolls = useRollFeed(effectiveCampaignId)

  // Called unconditionally — handles undefined characterName and null campaignId gracefully.
  const { destinyPool } = useDestinyPool(
    effectiveCampaignId,
    characterId,
    character?.name,
    supabase,
  )

  const encStats = character
    ? computeEncumbranceStats(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap)
    : null
  const encumbranceWarning = !!encStats && encStats.current >= encStats.threshold * 0.9

  const [runnerTab, setRunnerTab] = useState<RunnerTab>('feed')
  const [navTab, setNavTab]       = useState<NavTab | null>(null)
  const [diceSkill, setDiceSkill] = useState<string | null>(null)

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
    const active = navTab ?? (runnerTab === 'feed' ? 'feed' : null)
    switch (active) {
      case 'feed':
        return <MobileFeedScreen rolls={rolls} ownCharacterId={characterId} />
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
            supabase={supabase}
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
            encCurrent={encStats?.current ?? 0}
            encThreshold={encStats?.threshold ?? 0}
            credits={char.credits ?? 0}
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
      default:
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[4] }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>
              RUNNER TABS · PHASE 3
            </div>
          </div>
        )
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
    </div>
  )
}
