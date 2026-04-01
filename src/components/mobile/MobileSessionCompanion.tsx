'use client'

import { useState, useEffect } from 'react'
import { useCharacterData } from '@/hooks/useCharacterData'
import { CHAR_REF_MAP } from '@/components/player-hud/design-tokens'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { MobileHeader } from './MobileHeader'
import { MobileTabBar, type TabId } from './MobileTabBar'
import { BottomSheet } from './shared/BottomSheet'
import { StatusTab } from './tabs/StatusTab'
import { SkillsTab } from './tabs/SkillsTab'
import { TalentsTab } from './tabs/TalentsTab'
import { GearTab } from './tabs/GearTab'
import { NotesTab } from './tabs/NotesTab'
import { WoundsStrainFab, WoundsStrainOverlay } from './overlays/WoundsStrainOverlay'
import { DiceRollerSheet, type MobilePrePopSkill } from './overlays/DiceRollerSheet'
import { useSessionRollState, getWoundThresholdBonus } from '@/hooks/useSessionRollState'
import { SessionStatusBanner } from '@/components/player/SessionStatusBanner'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const BG   = '#060D09'
const GOLD = '#C8AA50'
const GOLD_BD = 'rgba(200,170,80,0.4)'
const FONT_C  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M  = "'Courier New', monospace"

interface MobileSessionCompanionProps {
  characterId: string
  campaignId?: string | null
}

export function MobileSessionCompanion({ characterId, campaignId }: MobileSessionCompanionProps) {
  const {
    character, skills, talents, weapons, armor, gear, crits,
    refSkills, refTalents,
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap, refDescriptorMap, refWeaponQualityMap,
    handleVitalChange,
    loading, error,
  } = useCharacterData(characterId)

  const [activeTab, setActiveTab]       = useState<TabId>('status')
  const [woundsOpen, setWoundsOpen]     = useState(false)
  const [diceOpen, setDiceOpen]         = useState(false)
  const [diceSkill, setDiceSkill]       = useState<MobilePrePopSkill | null>(null)

  // Must be called unconditionally before any early returns
  const sessionRollState = useSessionRollState(campaignId ?? character?.campaign_id ?? null)

  // Wake lock — silent, no UI
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(navigator as any).wakeLock.request('screen').then((l: WakeLockSentinel) => { lock = l }).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [])

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
  const strainPct = character.strain_threshold > 0
    ? character.strain_current / character.strain_threshold : 0
  const fabBorderColor = woundPct >= 0.8
    ? 'rgba(244,67,54,0.7)'
    : 'rgba(200,170,80,0.4)'

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
          />
        )}
        {activeTab === 'skills' && (
          <SkillsTab
            character={character}
            charSkills={skills}
            refSkills={refSkills}
            onSkillTap={openSkillDice}
          />
        )}
        {activeTab === 'talents' && (
          <TalentsTab
            charTalents={talents}
            refTalentMap={refTalentMap}
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
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab character={character} />
        )}
      </div>

      {/* ── Tab Bar ── */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

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
    </div>
  )
}
