'use client'

import { useMemo, useState } from 'react'
import { createClient }            from '@/lib/supabase/client'
import { useCharacterData }        from '@/hooks/useCharacterData'
import { useDerivedStats }         from '@/hooks/useDerivedStats'
import { usePendingActions }       from '@/hooks/usePendingActions'
import { useForcePowers }          from '@/hooks/useForcePowers'
import { useEncounterState }       from '@/hooks/useEncounterState'
import { useRollFeed }             from '@/hooks/useRollFeed'
import { useDestinyPool }          from '@/hooks/useDestinyPool'
import { useCharacterConflicts }   from '@/hooks/useCharacterConflicts'
import { isForceUserSensitive }    from '@/lib/forceUtils'
import { CharacterLoader }         from '@/components/ui/CharacterLoader'
import { MobileHeader }            from './MobileHeader'
import { MobileNav, type MobileDestination } from './MobileNav'
import { MobileAbilitiesDestination } from './MobileAbilitiesDestination'
import { MobileCombatCheck }       from './MobileCombatCheck'
import { MobileSkillCheck }        from './MobileSkillCheck'
import { MobileForceCheck }        from './MobileForceCheck'
import { MobileRollChooser, type RollChoice } from './MobileRollChooser'
import { MobileGearDestination } from './MobileGearDestination'
import { MobilePartyDestination } from './MobilePartyDestination'
import { MobileSheetDestination } from './MobileSheetDestination'
import { MobileVitalAdjustSheet } from './MobileVitalAdjustSheet'
import { MobileNotificationsSheet } from './MobileNotificationsSheet'
import { MobileMarketStorefront } from './MobileMarketStorefront'
import { MobileMapDestination } from './MobileMapDestination'

interface MobileShellProps {
  characterId: string
  campaignId?: string | null
}

const DESTINATION_LABEL: Record<MobileDestination, string> = {
  sheet:     'Sheet',
  abilities: 'Abilities',
  gear:      'Gear',
  party:     'Party',
}

/** Placeholder body — replaced with real content in Prompts 2-7. */
function DestinationPlaceholder({ destination }: { destination: MobileDestination }) {
  return (
    <div className="m-placeholder">
      <div className="m-placeholder-title">{DESTINATION_LABEL[destination]}</div>
      <div className="m-placeholder-body">This destination is built in a later prompt.</div>
    </div>
  )
}

export function MobileShell({ characterId, campaignId }: MobileShellProps) {
  const supabase = useMemo(() => createClient(), [])

  const {
    character, talents, weapons, armor, gear, speciesAbilities,
    skills, refSkillMap,
    refTalentMap, refArmorMap, refGearMap, refWeaponMap, refWeaponQualityMap, refAttachmentMap,
    forceRating, careerForceRatingBase,
    refCareers, refSpeciesAll, charSpecs, refSpecMap,
    hudSkills, hudTalents, hudWeapons, hudArmor, hudGear,
    charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap,
    sigAbilities, lockedSigAbilities, purchasedSigNodes, hasUnlockedTier5,
    encumbranceStats,
    crits, refObligationTypes, refDutyTypes,
    moralitySystem, moralitySystemError,
    handleSetEquipState, handleRemoveWeapon, handleRemoveEquipment,
    handleVitalAdjust, handleHealCrit, handleFlipBalancePoint,
    handlePurchaseTalent, handleBuySkill, handlePurchaseForceAbility,
    lockInAbility, purchaseSigNode,
    loading, error,
  } = useCharacterData(characterId)

  const { allForcePowers } = useForcePowers({ charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap })

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

  // Single instance, passed down — a second usePendingActions on the same
  // characterId would open a second Realtime channel on the same topic
  // (`pending-actions-<id>`) and the two would collide (see
  // InitiativeRollModal.tsx's own doc comment on this exact rule).
  const { count: pendingCount, actions: pendingActionsList, resolve: resolvePendingAction } = usePendingActions(character?.id, supabase)

  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const { encounter } = useEncounterState(effectiveCampaignId)
  const rolls = useRollFeed(effectiveCampaignId)
  const { destinyPool, pendingSpend, handleSpendDestiny } = useDestinyPool(effectiveCampaignId, characterId, character?.name, supabase)
  const { conflicts } = useCharacterConflicts(character?.id, supabase)

  const [chooserOpen, setChooserOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [storefrontOpen, setStorefrontOpen] = useState(false)
  const [vitalField, setVitalField] = useState<'wound_current' | 'strain_current' | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [combatCheckOpen, setCombatCheckOpen] = useState(false)
  const [skillCheck, setSkillCheck] = useState<{ open: boolean; initialKey: string | null }>({ open: false, initialKey: null })
  const [forceCheck, setForceCheck] = useState<{ open: boolean; initialKey: string | null }>({ open: false, initialKey: null })

  function handleRollChoice(choice: RollChoice) {
    setChooserOpen(false)
    if (choice === 'combat') setCombatCheckOpen(true)
    else if (choice === 'skill') setSkillCheck({ open: true, initialKey: null })
    else setForceCheck({ open: true, initialKey: null })
  }

  // Destination state persists for the life of the mount — a `useState`
  // above the placeholder swap, not per-page state — so switching and
  // returning always lands back on the same destination. Scroll position
  // per destination is handled separately: see .m-body-page in
  // mobile-shell.css (each destination page keeps its own scroll container
  // and is only toggled via `hidden`, never unmounted).
  const [destination, setDestination] = useState<MobileDestination>('sheet')

  if (loading) {
    return (
      <div className="m-shell m-shell-center" data-mobile-shell="">
        <CharacterLoader />
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="m-shell m-shell-center" data-mobile-shell="">
        <span className="m-error-icon">⚠️</span>
        <p className="m-error-text">{error ?? 'Character not found.'}</p>
      </div>
    )
  }

  const es              = derivedStats?.effectiveStats
  const woundThreshold  = es?.woundThreshold  ?? character.wound_threshold
  const strainThreshold = es?.strainThreshold ?? character.strain_threshold
  const soakValue       = es?.soak            ?? character.soak

  const careerName = refCareers.find(c => c.key === character.career_key)?.name ?? null
  const speciesRef = refSpeciesAll.find(s => s.key === character.species_key)
  const speciesName = speciesRef?.name ?? null
  const speciesDescription = speciesRef?.description ?? null
  const specName = charSpecs[0] ? (refSpecMap[charSpecs[0].specialization_key]?.name ?? null) : null
  // "Epithet" reads as the character's in-fiction identity, closest to their
  // specialization (or career, if no specialization is owned yet) rather
  // than a literal `epithet` field — the schema has none. Species always
  // follows. Neither half renders if unknown; there's no "rank" field on
  // Character to show a third segment.
  const identityLine = [specName ?? careerName, speciesName].filter(Boolean).join(' · ')

  // Icon URLs are already resolved per-item by useCharacterData's own
  // hudWeapons/hudArmor/hudGear (itemIconResolver.ts under the hood) — reused
  // here by id rather than calling the resolver a second time.
  const iconUrlByItemId: Record<string, string | null> = {}
  const itemImageUrlByItemId: Record<string, string | null> = {}
  for (const list of [hudWeapons, hudArmor, hudGear]) {
    for (const it of list) {
      iconUrlByItemId[it.id] = it.iconUrl ?? null
      itemImageUrlByItemId[it.id] = it.item_image_url ?? null
    }
  }

  return (
    <div className="m-shell" data-mobile-shell="">
      <MobileHeader
        name={character.name}
        portraitUrl={character.portrait_url ?? null}
        identityLine={identityLine}
        woundCurrent={character.wound_current ?? 0}
        woundThreshold={woundThreshold}
        strainCurrent={character.strain_current ?? 0}
        strainThreshold={strainThreshold}
        soak={soakValue}
        hasUnreadNotifications={pendingCount > 0}
        onMapTap={() => setMapOpen(true)}
        onNotificationsTap={() => setNotificationsOpen(true)}
        onWoundsTap={() => setVitalField('wound_current')}
        onStrainTap={() => setVitalField('strain_current')}
      />

      <div className="m-body">
        {(Object.keys(DESTINATION_LABEL) as MobileDestination[]).map(dest => (
          <div key={dest} className="m-body-page" hidden={dest !== destination}>
            {dest === 'gear' ? (
              <MobileGearDestination
                weapons={weapons}
                armor={armor}
                gear={gear}
                refWeaponMap={refWeaponMap}
                refArmorMap={refArmorMap}
                refGearMap={refGearMap}
                refWeaponQualityMap={refWeaponQualityMap}
                refSkillMap={refSkillMap}
                iconUrlByItemId={iconUrlByItemId}
                itemImageUrlByItemId={itemImageUrlByItemId}
                encumbranceStats={encumbranceStats}
                credits={character.credits ?? 0}
                brawn={character.brawn}
                campaignId={effectiveCampaignId}
                onSetEquipState={handleSetEquipState}
                onDropWeapon={id => void handleRemoveWeapon(id)}
                onDropEquipment={(id, type) => void handleRemoveEquipment(id, type)}
              />
            ) : dest === 'party' ? (
              <MobilePartyDestination
                characterId={characterId}
                destinyPool={destinyPool}
                pendingSpend={pendingSpend}
                onSpendDestiny={handleSpendDestiny}
                rolls={rolls}
              />
            ) : dest === 'abilities' ? (
              <MobileAbilitiesDestination
                character={character}
                hudSkills={hudSkills}
                talents={talents}
                hudTalentsSearchable={hudTalents}
                refTalentMap={refTalentMap}
                refSpecMap={refSpecMap}
                charSpecs={charSpecs}
                allForcePowers={allForcePowers}
                forceRating={forceRating ?? 0}
                sigAbilities={sigAbilities}
                lockedSigAbilities={lockedSigAbilities}
                purchasedSigNodes={purchasedSigNodes}
                hasUnlockedTier5={hasUnlockedTier5}
                onOpenSkillCheck={key => setSkillCheck({ open: true, initialKey: key })}
                onOpenForceCheck={key => setForceCheck({ open: true, initialKey: key })}
                supabase={supabase}
                onPurchaseTalent={handlePurchaseTalent}
                onBuySkill={handleBuySkill}
                onPurchaseForceAbility={handlePurchaseForceAbility}
                onLockInSigAbility={lockInAbility}
                onPurchaseSigNode={purchaseSigNode}
              />
            ) : dest === 'sheet' ? (
              <MobileSheetDestination
                character={character}
                effectiveStats={derivedStats?.effectiveStats ?? null}
                forceRating={forceRating ?? 0}
                careerName={careerName}
                speciesName={speciesName}
                speciesDescription={speciesDescription}
                charSpecs={charSpecs}
                refSpecMap={refSpecMap}
                refObligationTypes={refObligationTypes}
                refDutyTypes={refDutyTypes}
                crits={crits}
                onHealCrit={id => void handleHealCrit(id)}
                moralitySystem={moralitySystem}
                moralitySystemError={moralitySystemError}
                conflicts={conflicts}
                onFlipBalancePoint={handleFlipBalancePoint}
                onOpenVitalAdjust={setVitalField}
              />
            ) : (
              <DestinationPlaceholder destination={dest} />
            )}
          </div>
        ))}
      </div>

      <MobileNav active={destination} onSelect={setDestination} onRollTap={() => setChooserOpen(true)} />

      <MobileRollChooser
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onChoose={handleRollChoice}
        forceAvailable={isForceUserSensitive(character, forceRating)}
      />

      <MobileCombatCheck
        open={combatCheckOpen}
        onClose={() => setCombatCheckOpen(false)}
        character={character}
        weapons={weapons}
        charSkills={skills}
        refWeaponMap={refWeaponMap}
        refSkillMap={refSkillMap}
        refWeaponQualityMap={refWeaponQualityMap}
        skillModifiers={derivedStats?.modifiers.skillModifiers ?? {}}
        campaignId={effectiveCampaignId}
        characterId={characterId}
        encounterId={encounter?.id ?? null}
      />

      <MobileSkillCheck
        open={skillCheck.open}
        onClose={() => setSkillCheck({ open: false, initialKey: null })}
        hudSkills={hudSkills}
        skillModifiers={derivedStats?.modifiers.skillModifiers ?? {}}
        campaignId={effectiveCampaignId}
        characterId={characterId}
        characterName={character.name}
        initialSkillKey={skillCheck.initialKey}
      />

      <MobileForceCheck
        open={forceCheck.open}
        onClose={() => setForceCheck({ open: false, initialKey: null })}
        character={character}
        forceRating={forceRating ?? 0}
        committedForce={character.force_rating_committed ?? 0}
        allForcePowers={allForcePowers}
        isCombat={!!encounter}
        campaignId={effectiveCampaignId}
        characterId={characterId}
        encounterId={encounter?.id ?? null}
        initialPowerKey={forceCheck.initialKey}
      />

      <MobileNotificationsSheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        actions={pendingActionsList}
        resolve={resolvePendingAction}
        character={character}
        charSkills={skills}
        hudSkills={hudSkills}
        forceRating={forceRating ?? 0}
        campaignId={effectiveCampaignId}
        onOpenStorefront={() => { setNotificationsOpen(false); setStorefrontOpen(true) }}
      />

      <MobileMarketStorefront
        open={storefrontOpen}
        onClose={() => setStorefrontOpen(false)}
        campaignId={effectiveCampaignId}
        credits={character.credits ?? 0}
        refWeaponQualityMap={refWeaponQualityMap}
      />

      <MobileVitalAdjustSheet
        field={vitalField}
        onClose={() => setVitalField(null)}
        character={character}
        threshold={vitalField === 'strain_current' ? strainThreshold : woundThreshold}
        supabase={supabase}
        onVitalAdjust={handleVitalAdjust}
      />

      <MobileMapDestination
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        character={character}
        campaignId={effectiveCampaignId}
        encounter={encounter}
      />
    </div>
  )
}
