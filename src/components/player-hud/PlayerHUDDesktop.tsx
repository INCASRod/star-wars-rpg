'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCharacterData } from '@/hooks/useCharacterData'
import { Modal } from '@/components/ui/Modal'
import { HUD, FONT_BODY, FS, RADIUS, Z } from '@/lib/tokens'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'
import { BackgroundEffects } from './HudDecorations'
import { HudTopBar } from './HudTopBar'
import { HudLeftRail, type RailPanelId } from './HudLeftRail'
import { HudFullPanel } from './HudFullPanel'
import { HudTalentsTab } from './HudTalentsTab'
import { HudSessionTab } from './HudSessionTab'
import { HudModalsOverlay } from './HudModalsOverlay'
import { HudForceTab } from './HudForceTab'
import { HudInventoryTab } from './HudInventoryTab'
import { HudLoreTab } from './HudLoreTab'
import { HudSkillsTab } from './HudSkillsTab'
import { HudRightColumn } from './HudRightColumn'
import { HudStatusStrip } from './HudStatusStrip'
import { useCriticalInjuryRequest } from '@/hooks/useCriticalInjuryRequest'
import { usePlayerBroadcast } from '@/hooks/usePlayerBroadcast'
import { useCharacterConflicts } from '@/hooks/useCharacterConflicts'
import { useForcePowers } from '@/hooks/useForcePowers'
import { useBonusSkillKeys } from '@/hooks/useBonusSkillKeys'
import { type RollResult, type ForceRollResult } from './dice-engine'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { HudSkill } from '@/lib/types'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { isEligibleForForceRating } from '@/lib/forceEligibility'
import { CombatCheckOverlay } from '@/components/combat-check/CombatCheckOverlay'
import { ForceCheckOverlay } from '@/components/force-check/ForceCheckOverlay'
import { isDathomiri } from '@/lib/dathomiriUtils'
import { CombatTransition } from './CombatTransition'
import type { Character } from '@/lib/types'
import { CharacterLoader }           from '@/components/ui/CharacterLoader'
import { useCharacterSelectStore }   from '@/store/characterSelectStore'
import { useSessionMode } from '@/hooks/useSessionMode'
import { useDestinyPool } from '@/hooks/useDestinyPool'
import { useStowLocations } from '@/hooks/useStowLocations'
import { useRollFeed } from '@/hooks/useRollFeed'
import { logRoll, type RollMeta } from '@/lib/logRoll'
import { useSessionRollState, getWoundThresholdBonus } from '@/hooks/useSessionRollState'
import { SessionStatusBanner } from '@/components/player/SessionStatusBanner'
import { useDerivedStats } from '@/hooks/useDerivedStats'
import { CriticalInjuryModal } from '@/components/character/CriticalInjuryModal'
import { useActiveMap } from '@/hooks/useActiveMap'
import { useMapTokens } from '@/hooks/useMapTokens'
import { useEncounterState } from '@/hooks/useEncounterState'
import { generateCharacterSheetPDF } from '@/lib/characterSheetPDF'
import { GroupSheet } from '@/components/group/GroupSheet'
import { type UiTheme } from './ThemeSwitcher'

interface PlayerHUDDesktopProps {
  characterId: string
  isGmMode?:   boolean
  campaignId?: string | null
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function PlayerHUDDesktop({ characterId, isGmMode = false, campaignId }: PlayerHUDDesktopProps) {
  const router = useRouter()

  // ── Data ──
  const {
    character, skills, talents, weapons, armor, gear, crits, charSpecs,
    charForceAbilities, playerName, loading, error,
    moralitySystem, moralitySystemError, handleFlipBalancePoint,
    refSkills, refCrits, refCareers, refSpeciesAll, refForcePowers,
    refObligationTypes, refDutyTypes,
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap,
    refSpecMap, refForcePowerMap, refForceAbilityMap, refWeaponQualityMap,
    refAttachmentMap,
    forceRating, careerForceRatingBase, careerSpecKeys, specKeyToCareerName, pendingForceRatingOffer, setPendingForceRatingOffer, supabase, refSpecs,
    speciesAbilities, hudSkills, hudTalents, hudWeapons, hudArmor, hudGear,
    encumbranceCurrent, encumbranceBonus,
    handleVitalChange, handleVitalAdjust, handleSetEquipState,
    handleHealCrit, handlePortraitUpload, handlePortraitDelete,
    handleRemoveWeapon, handleRemoveEquipment,
    handleCreditSpend, handleBackstoryChange, handleNotesChange,
    handlePurchaseForceAbility, handlePurchaseForceRating, handleBuySpecialization, handleBuySkill,
  } = useCharacterData(characterId)


  // ── Derived stats engine ──
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
    moralitySystem: moralitySystem ?? 'vanilla',
  })
  const effectiveStats = derivedStats?.effectiveStats
  const skillModifiers = derivedStats?.modifiers.skillModifiers ?? {}
  const engineBreakdown = derivedStats?.breakdown

  const bonusSkillKeys = useBonusSkillKeys(skillModifiers, talents, refTalentMap, speciesAbilities)

  // Force-rating cache write-back now lives in useCharacterData (fires for both
  // desktop and mobile, not just this component) — see derivedForceRating there.

  // ── Store cleanup on unmount — clears stale character selection so re-selecting works correctly ──
  useEffect(() => {
    return () => {
      useCharacterSelectStore.getState().setSelectedCharacter(null)
    }
  }, [])

  // ── Session / roll feed ──
  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const { stowableAssets, baseOfOperationsName } = useStowLocations(effectiveCampaignId)
  const sessionRollState = useSessionRollState(effectiveCampaignId)
  const woundBonus = character ? getWoundThresholdBonus(character.id, sessionRollState) : 0
  const effectiveCampaignIdRef = useRef(effectiveCampaignId)
  useEffect(() => { effectiveCampaignIdRef.current = effectiveCampaignId }, [effectiveCampaignId])

  // ── Auto-release session on tab/browser close ──────────────────────────────
  useEffect(() => {
    const handlePageHide = () => {
      const key = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
      const cid = effectiveCampaignIdRef.current
      if (!key || !cid) return
      navigator.sendBeacon('/api/release-session', new Blob(
        [JSON.stringify({ session_key: key, campaign_id: cid })],
        { type: 'application/json' },
      ))
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])
  const { mode: dbMode, round: dbRound, transitionPending: dbTransitionPending, prevMode: dbPrevMode } = useSessionMode(effectiveCampaignId)

  // ── Destiny Pool (declared early — needed by usePlayerBroadcast callbacks) ──
  const {
    destinyPoolRecord, destinyRollRequest, setDestinyRollRequest,
    destinySpendOpen, setDestinySpendOpen, destinyGmFlash, setDestinyGmFlash,
    destinyConsidering, setDestinyConsidering,
  } = useDestinyPool(effectiveCampaignId, characterId, character?.name, supabase)

  // Force Presence GM-award overlays (Prompt C) — plain local booleans,
  // matching the simplest existing precedent for a callback-driven,
  // no-payload "something happened" flash (no dedicated pool-style hook
  // needed, unlike destinyGmFlash which carries pool-count data).
  const [conflictFlash, setConflictFlash] = useState(false)
  const [tranquilityFlash, setTranquilityFlash] = useState(false)

  // Broadcast override — GM pushes combat state directly for instant delivery
  const {
    broadcastSession, broadcastTransition,
    gmDialog, setGmDialog,
    gmCritInjuryDialog, setGmCritInjuryDialog,
    lootReveal, setLootReveal,
    vendorOffer, setVendorOffer,
    initRoll, setInitRoll,
  } = usePlayerBroadcast({
    characterId,
    campaignId: effectiveCampaignId,
    supabase,
    sessionMode: dbMode,
    onDestinyRollRequest: setDestinyRollRequest,
    onDestinyGmFlash:     setDestinyGmFlash,
    onConflictAwarded:    () => setConflictFlash(true),
    onTranquilityAwarded: () => setTranquilityFlash(true),
  })
  const sessionMode = broadcastSession?.mode ?? dbMode
  const combatRound = broadcastSession?.round ?? dbRound
  const transitionPending = broadcastTransition.pending || dbTransitionPending
  const prevMode = broadcastTransition.prevMode ?? dbPrevMode
  const rolls = useRollFeed(effectiveCampaignId)
  const isCombat = sessionMode === 'combat'

  // ── UI State ──
  const [activeQuickPanel, setActiveQuickPanel] = useState<'skill' | null>(null)
  const [activeFullPanel,  setActiveFullPanel]  = useState<'skills' | 'talents' | 'force-panel' | 'inventory' | 'lore' | 'group' | null>(null)
  const [diceOpen,         setDiceOpen]         = useState(false)
  const [adversariesOpen,  setAdversariesOpen]  = useState(false)

  function handlePanelToggle(id: RailPanelId) {
    if (id === 'dice')        { setDiceOpen(o => !o); setCombatCheckOpen(false); setForceCheckOpen(false); return }
    if (id === 'adversaries') { setAdversariesOpen(o => !o); setCombatCheckOpen(false); setForceCheckOpen(false); return }
    if (id === 'combat') { setCombatCheckOpen(true); setForceCheckOpen(false); setActiveFullPanel(null); setActiveQuickPanel(null); return }
    if (id === 'force')  { setForceCheckOpen(true);  setCombatCheckOpen(false); setActiveFullPanel(null); setActiveQuickPanel(null); return }
    if (id === 'skill') {
      setActiveQuickPanel(prev => prev === 'skill' ? null : 'skill')
      setActiveFullPanel(null)
      setCombatCheckOpen(false)
      setForceCheckOpen(false)
      return
    }
    const FULL = ['skills', 'talents', 'force-panel', 'inventory', 'lore', 'group'] as const
    if ((FULL as readonly string[]).includes(id)) {
      const fid = id as typeof FULL[number]
      setActiveFullPanel(prev => prev === fid ? null : fid)
      setActiveQuickPanel(null)
      setCombatCheckOpen(false)
      setForceCheckOpen(false)
    }
  }

  const [uiTheme, setUiTheme] = useState<UiTheme>('ember')

  // ── Session tab — subscribe to active map visibility ──
  const { visibleMap } = useActiveMap(effectiveCampaignId)
  const { encounter }  = useEncounterState(effectiveCampaignId)
  // Gate on sessionMode so a staging encounter (is_active=true, session still exploration)
  // does not show "Combat Active" on player sheets before the GM explicitly starts combat.
  const isCombatActive = isCombat && encounter !== null && encounter.is_active

  // visibleOnly: true — server-side is_visible filter (Prompt 11), not just a
  // client-side hide. See useMapTokens.ts's UseMapTokensOptions doc comment
  // for the residual RLS gap this doesn't close.
  const mapTokens = useMapTokens(visibleMap?.id ?? null, { visibleOnly: true })
  const visibleMapTokens = mapTokens.tokens

  // Build the full enemy list from visible adversary tokens, enriched with encounter data.
  // This is passed to both check overlays so target selection works regardless of combat state.
  const visibleEnemies = useMemo<AdversaryInstance[]>(() => {
    const advTokens = visibleMapTokens.filter(t => t.participant_type === 'adversary')
    if (advTokens.length === 0) return []
    const advMap = new Map<string, AdversaryInstance>(
      (encounter?.adversaries ?? []).map(a => [a.instanceId, a])
    )
    return advTokens.flatMap(t => {
      if (t.slot_key && advMap.has(t.slot_key)) return [advMap.get(t.slot_key)!]
      // Tokens with no encounter match and no label are silently skipped —
      // showing "Unknown" would reveal the existence of a hidden adversary.
      if (!t.label) return []
      // Stub for labelled tokens placed outside any encounter (exploration mode)
      return [{
        instanceId:      t.id,
        sourceId:        '',
        name:            t.label,
        type:            'rival' as const,
        groupSize:       1,
        groupRemaining:  1,
        revealed:        true,
        characteristics: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
        soak:            2,
        woundThreshold:  10,
        strainThreshold: 10,
        defense:         { melee: 0, ranged: 0 },
        skills:          [],
        skillRanks:      {},
        talents:         [],
        abilities:       [],
        weapons:         [],
        gear:            [],
        woundsCurrent:   0,
      } satisfies AdversaryInstance]
    })
  }, [visibleMapTokens, encounter])
  const [rollResult, setRollResult]             = useState<RollResult | null>(null)
  const [rollLabel, setRollLabel]               = useState<string | undefined>()
  const [activeSpecKey, setActiveSpecKey]       = useState<string | null>(null)
  const [forceRollResult, setForceRollResult]   = useState<ForceRollResult | null>(null)
  const [skillPopover, setSkillPopover]         = useState<{ skill: HudSkill; anchor: DOMRect } | null>(null)
  const [combatCheckOpen, setCombatCheckOpen]         = useState(false)
  const [forceCheckOpen,  setForceCheckOpen]          = useState(false)
  const { conflicts, pendingConflicts } = useCharacterConflicts(character?.id, supabase)
  const [conflictQueue, setConflictQueue] = useState<ConflictEntry[]>([])
  const [ackBusy,       setAckBusy]       = useState(false)
  const conflictSeeded                    = useRef(false)
  const { pendingCritRequest, setPendingCritRequest } = useCriticalInjuryRequest(character?.id, supabase)
  const [pdfGenerating,     setPdfGenerating]         = useState(false)
  // Dedication's characteristic-choice prompt (DEDI talent purchase) now lives
  // entirely on the /character/[id]/talents route (Prompt 6b) — that's the
  // only place talents are purchased for a live character now, so this
  // component no longer owns any pendingDedication state.
  const [spendCreditsOpen,  setSpendCreditsOpen]      = useState(false)

  // Seed the conflict queue once on load. Delivery is login-persistent (DB-backed),
  // not realtime — players see new GM-assigned conflicts on their next login.
  useEffect(() => {
    if (conflictSeeded.current || !pendingConflicts.length) return
    conflictSeeded.current = true
    setConflictQueue(pendingConflicts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingConflicts])

  // ── Load persisted theme from character_sessions ──────────────────────────
  useEffect(() => {
    const sessionKey = localStorage.getItem('holocron_session_key')
    if (!sessionKey) return
    supabase
      .from('character_sessions')
      .select('ui_theme')
      .eq('character_id', characterId)
      .eq('session_key', sessionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.ui_theme) return
        // 'binary-sunset' was renamed to 'ember'; all other unrecognised values fall back to 'ember'
        const LEGACY: Record<string, UiTheme> = { 'binary-sunset': 'ember' }
        const VALID_THEMES: UiTheme[] = ['ember', 'kyber']
        const resolved: UiTheme = LEGACY[data.ui_theme] ?? (VALID_THEMES.includes(data.ui_theme as UiTheme) ? data.ui_theme as UiTheme : 'ember')
        setUiTheme(resolved)
      })
  }, [characterId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── PDF download ──
  async function handleDownloadPDF() {
    if (!character) return
    setPdfGenerating(true)
    await generateCharacterSheetPDF({ character, playerName, careerName, speciesName, specNames, skills, refSkills, refSkillMap, talents, refTalentMap, weapons, refWeaponMap, refWeaponQualityMap, armor, refArmorMap, gear, refGearMap, crits, refSpecMap, effectiveStats: effectiveStats ?? null }).catch(err => console.error('[PDF generation failed]', err))
    setPdfGenerating(false)
  }

  // ── Logout ──
  async function handleLogout() {
    const sessionKey = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
    if (sessionKey && effectiveCampaignId) {
      await supabase.from('character_sessions').delete().eq('session_key', sessionKey).eq('campaign_id', effectiveCampaignId)
    }
    router.push('/')
  }

  async function acknowledgeConflict(id: string) {
    setAckBusy(true)
    const { error } = await supabase
      .from('character_conflicts')
      .update({ player_acknowledged: true })
      .eq('id', id)
    if (error) console.error('[acknowledgeConflict] failed:', error.message)
    setAckBusy(false)
    setConflictQueue(prev => prev.filter(c => c.id !== id))
  }

  // ── Theme switching ──
  function handleThemeChange(theme: UiTheme) {
    setUiTheme(theme)
    const sessionKey = localStorage.getItem('holocron_session_key')
    if (!sessionKey) return
    supabase
      .from('character_sessions')
      .update({ ui_theme: theme })
      .eq('character_id', characterId)
      .eq('session_key', sessionKey)
      .then(({ error }) => {
        if (error) console.warn('[theme save] failed:', error.message)
      })
  }

  // ── Derived: career / spec / species names ──
  const careerName = useMemo(() =>
    refCareers.find(c => c.key === character?.career_key)?.name || character?.career_key || ''
  , [refCareers, character])

  const specNames = useMemo(() =>
    charSpecs.map(cs => refSpecMap[cs.specialization_key]?.name || cs.specialization_key).join(' / ')
  , [charSpecs, refSpecMap])

  const speciesName = useMemo(() =>
    refSpeciesAll.find(s => s.key === character?.species_key)?.name || character?.species_key || ''
  , [refSpeciesAll, character])

  // ── Force powers — ForcePanel still renders each owned power's tree inline
  // (unchanged, F1/F2); the browse-full-tree MODAL this used to also feed is
  // retired (Prompt F3) in favour of the /character/[id]/talents rail.
  const { allForcePowers } = useForcePowers({ charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap })

  // ── Roll handler ──
  const handleRoll = (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => {
    // Don't pop the DiceModal when the combat check overlay handles the result inline
    if (!combatCheckOpen) { setRollResult(result); setRollLabel(label) }
    if (character && effectiveCampaignId) {
      logRoll({ campaignId: effectiveCampaignId, characterId: character.id, characterName: character.name, label, pool: (pool || {}) as Parameters<typeof logRoll>[0]['pool'], result, meta })
    }
  }

  // ── Loading / Error ──
  if (loading) return <CharacterLoader />
  if (error || !character) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: HUD.bg }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, color: 'var(--state-failure)' }}>{error || 'Character not found'}</div>
    </div>
  )

  const isForceUser = isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)
  const isEligibleForFR = isEligibleForForceRating(character, charSpecs, refSpecMap)
  const canGainForceRating = isEligibleForFR && forceRating === 0 && !character.force_rating_purchased
  const encThreshold = character.encumbrance_threshold + encumbranceBonus

  return (
    <div
      data-theme={uiTheme === 'ember' ? undefined : uiTheme}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: HUD.bg }}
    >
      <BackgroundEffects />
      <CombatTransition pending={transitionPending} prevMode={prevMode} />

      {/* Critical Injury Roll Modal — shown when GM sends a crit request */}
      {pendingCritRequest && (
        <CriticalInjuryModal
          request={pendingCritRequest}
          characterId={character.id}
          characterName={character.name}
          campaignId={effectiveCampaignId}
          refCrits={refCrits}
          currentCrits={crits}
          sessionLabel={null}
          onDismiss={() => setPendingCritRequest(null)}
        />
      )}

      {/* Conflict notification — shown for unacknowledged GM-assigned conflicts */}
      {conflictQueue.length > 0 && (
        <Modal
          open
          zIndex={Z.modal + 10}
          borderColor="rgba(144,96,208,0.5)"
          shadow="0 0 32px rgba(144,96,208,0.25)"
        >
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: '#9060D0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ⚠ Conflict Gained
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)', lineHeight: 1.3 }}>
              {conflictQueue[0].description}
            </div>
            {conflictQueue[0].narrative && (
              <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', color: 'var(--hud-text-dim)', lineHeight: 1.55 }}>
                {conflictQueue[0].narrative}
              </div>
            )}
            <button
              onClick={() => acknowledgeConflict(conflictQueue[0].id)}
              disabled={ackBusy}
              style={{
                height:        36,
                borderRadius:  RADIUS.sm,
                background:    ackBusy ? 'transparent' : 'rgba(144,96,208,0.12)',
                border:        '1px solid rgba(144,96,208,0.4)',
                fontFamily:    FONT_BODY,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         ackBusy ? 'rgba(144,96,208,0.35)' : '#9060D0',
                cursor:        ackBusy ? 'not-allowed' : 'pointer',
              }}
            >
              {ackBusy ? 'Saving...' : 'Acknowledge'}
            </button>
          </div>
        </Modal>
      )}

      {/* GM mode overlays */}
      {isGmMode && (
        <>
          <button onClick={() => router.push(`/gm?campaign=${campaignId}`)} style={{ position: 'fixed', top: 8, left: 8, zIndex: 200, background: HUD.gold, border: 'none', padding: '6px 14px', fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.1em', color: HUD.bg, cursor: 'pointer' }}>← GM</button>
          <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, border: `2px solid ${HUD.gold}`, padding: '3px 12px', fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, letterSpacing: '0.15em', color: HUD.gold }}>GM MODE</div>
        </>
      )}

      {/* Main 3-column grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '72px 1fr clamp(200px,18%,260px)',
        gridTemplateRows: 'auto auto 1fr',
        height: '100vh',
      }}>

        {/* ══ TOP BAR ══════════════════════════════════════════ */}
        <HudTopBar
          character={character}
          careerName={careerName}
          specNames={specNames}
          speciesName={speciesName}
          isCombat={isCombat}
          combatRound={combatRound}
          pdfGenerating={pdfGenerating}
          destinyPoolRecord={destinyPoolRecord}
          onSpendDestinyOpen={() => setDestinySpendOpen(true)}
          onSpendCreditsOpen={() => setSpendCreditsOpen(true)}
          onDownloadPDF={handleDownloadPDF}
          onLogout={handleLogout}
          uiTheme={uiTheme}
          onThemeChange={handleThemeChange}
        />

        {/* ══ STATUS STRIP ═════════════════════════════════════ */}
        <HudStatusStrip
          character={character}
          effectiveStats={effectiveStats}
          engineBreakdown={engineBreakdown}
          woundBonus={woundBonus}
          encumbranceCurrent={encumbranceCurrent}
          encumbranceBonus={encumbranceBonus}
          crits={crits}
          forceRating={forceRating}
          isCombat={isCombat}
          onVitalAdjust={handleVitalAdjust}
          onHealCrit={handleHealCrit}
        />

        {/* ══ LEFT RAIL ═════════════════════════════════════════════════ */}
        <HudLeftRail
          isForceUser={isForceUser}
          canAccessForceTab={isForceUser || isEligibleForFR}
          activePanel={
            combatCheckOpen ? 'combat' :
            forceCheckOpen  ? 'force'  :
            diceOpen        ? 'dice'   :
            adversariesOpen ? 'adversaries' :
            (activeQuickPanel ?? activeFullPanel)
          }
          onPanelToggle={handlePanelToggle}
          // Player-facing "revealed adversary" rail entry disabled — doesn't
          // belong in the player view. Left as a hardcoded false (rather than
          // ripping out showAdversaries/adversariesOpen/HudAdversaryDrawer)
          // since the underlying reveal mechanic itself is untouched.
          showAdversaries={false}
        />

        {/* ══ CENTER COLUMN ════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${HUD.border}`,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Session Status Banner — always shown */}
          <SessionStatusBanner
            sessionRollState={sessionRollState}
            characterId={character.id}
            characterNames={{ [character.id]: character.name }}
            triggeredObligationType={character.obligation_type}
            ownObligationValue={character.obligation_value}
          />

          {/* Session / map view — always rendered */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <HudSessionTab
              character={character}
              campaignId={effectiveCampaignId}
              visibleMap={visibleMap}
              visibleMapTokens={visibleMapTokens}
              onTokenMove={mapTokens.moveToken}
              isCombatActive={isCombatActive}
              encounter={encounter}
              activeQuickPanel={activeQuickPanel}
              onCloseQuickPanel={() => setActiveQuickPanel(null)}
              hudSkills={hudSkills}
              onOpenSkillPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
              onSkillRoll={handleRoll}
              adversariesOpen={adversariesOpen}
              onAdversariesOpenChange={setAdversariesOpen}
            />
          </div>

          {/* Full panel backdrop — drawers (combatCheck, forceCheck) use their own close button */}
          {activeFullPanel && (
            <div
              onClick={() => { setActiveFullPanel(null); setCombatCheckOpen(false); setForceCheckOpen(false) }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
            />
          )}

          {/* ── Full panels ── */}
          <HudFullPanel open={activeFullPanel === 'skills'} title="Skills" symbol="≋" onClose={() => setActiveFullPanel(null)}>
            <HudSkillsTab
              character={character}
              hudSkills={hudSkills}
              isCombat={isCombat}
              skillModifiers={skillModifiers}
              speciesAbilities={speciesAbilities}
              bonusSkillKeys={bonusSkillKeys}
              onRoll={handleRoll}
              onBuySkill={handleBuySkill}
              onOpenPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'talents'} title="Talents" symbol="★" onClose={() => setActiveFullPanel(null)}>
            <HudTalentsTab
              character={character}
              characterId={characterId}
              careerName={careerName}
              speciesName={speciesName}
              charSpecs={charSpecs}
              refSpecMap={refSpecMap}
              refSpecs={refSpecs}
              refTalentMap={refTalentMap}
              refSkillMap={refSkillMap}
              careerSpecKeys={careerSpecKeys}
              specKeyToCareerName={specKeyToCareerName}
              talents={talents}
              hudTalents={hudTalents}
              speciesAbilities={speciesAbilities}
              activeSpecKey={activeSpecKey}
              setActiveSpecKey={setActiveSpecKey}
              isCombat={isCombat}
              isGmMode={isGmMode}
              onBuySpecialization={handleBuySpecialization}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'force-panel'} title="Force" symbol="✦" iconSrc="/images/factions/jedi.webp" onClose={() => setActiveFullPanel(null)}>
            <HudForceTab
              character={character}
              forceRating={forceRating}
              effectiveStats={effectiveStats}
              allForcePowers={allForcePowers}
              conflicts={conflicts}
              onPurchaseForceAbility={handlePurchaseForceAbility}
              // onViewPower is dead code inside ForcePanel (never invoked —
              // owned powers are viewed via ForcePanel's own inline expand,
              // unchanged); kept as a no-op only because ForcePanel's shared
              // prop interface (used by mobile too) still requires it.
              onViewPower={() => {}}
              // "+ Add" used to open the now-retired HudForcePowerTreeModal
              // (browse-all-powers tab list) — that surface now lives on the
              // /character/[id]/talents rail's own "+ New Force Power" entry
              // (Prompt F3), matching how the Talents nav already redirects
              // there instead of rendering an in-sheet tree.
              onAdd={() => router.push(`/character/${character.id}/talents${isGmMode ? '?gm=1' : ''}`)}
              canGainForceRating={canGainForceRating}
              onPurchaseForceRating={handlePurchaseForceRating}
              moralitySystem={moralitySystem}
              moralitySystemError={moralitySystemError}
              onFlipBalancePoint={handleFlipBalancePoint}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'inventory'} title="Inventory" symbol="▣" onClose={() => setActiveFullPanel(null)}>
            <HudInventoryTab
              hudWeapons={hudWeapons}
              hudArmor={hudArmor}
              hudGear={hudGear}
              encumbranceCurrent={encumbranceCurrent}
              encThreshold={encThreshold}
              refWeaponQualityMap={refWeaponQualityMap}
              isGmMode={isGmMode}
              characterName={character.name}
              characterId={character.id}
              stowableAssets={stowableAssets}
              baseOfOperationsName={baseOfOperationsName}
              effectiveCampaignId={effectiveCampaignId}
              supabase={supabase}
              onSetEquipState={handleSetEquipState}
              onRemoveWeapon={handleRemoveWeapon}
              onRemoveEquipment={handleRemoveEquipment}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'lore'} title="Lore" symbol="✧" onClose={() => setActiveFullPanel(null)}>
            <HudLoreTab
              character={character}
              careerName={careerName}
              speciesName={speciesName}
              specNames={specNames}
              refSpeciesAll={refSpeciesAll}
              refDutyTypes={refDutyTypes}
              refObligationTypes={refObligationTypes}
              onBackstoryChange={handleBackstoryChange}
              onNotesChange={handleNotesChange}
              onPortraitUpload={handlePortraitUpload}
              onPortraitDelete={handlePortraitDelete}
            />
          </HudFullPanel>

          <HudFullPanel open={activeFullPanel === 'group'} title="Group Sheet" symbol="◎" onClose={() => setActiveFullPanel(null)}>
            {effectiveCampaignId
              ? <GroupSheet campaignId={effectiveCampaignId} characterName={character.name} characterId={character.id} />
              : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, padding: 40 }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, color: HUD.textFaint }}>NO CAMPAIGN</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>Join a campaign to access the group sheet</div>
                </div>
              )
            }
          </HudFullPanel>

          {/* ── Combat / Force check overlays (absolute, same footprint as full panels) ── */}
          <CombatCheckOverlay
            open={combatCheckOpen}
            initialAttackType={null}
            onClose={() => setCombatCheckOpen(false)}
            character={character}
            weapons={weapons}
            charSkills={skills}
            refWeaponMap={refWeaponMap}
            refSkillMap={refSkillMap}
            refWeaponQualityMap={refWeaponQualityMap}
            skillModifiers={skillModifiers}
            campaignId={effectiveCampaignId}
            characterId={character.id}
            onRoll={handleRoll}
            speciesAbilities={speciesAbilities}
            speciesName={speciesName}
            encounterId={encounter?.id ?? null}
            encounterEnemies={visibleEnemies}
          />
          <ForceCheckOverlay
            open={forceCheckOpen}
            onClose={() => setForceCheckOpen(false)}
            character={character}
            forceRating={effectiveStats?.forceRating ?? forceRating}
            committedForce={character.force_rating_committed ?? 0}
            forcePowers={allForcePowers}
            isDathomiri={isDathomiri(character)}
            isCombat={isCombat}
            campaignId={effectiveCampaignId}
            characterId={character.id}
            encounterId={encounter?.id ?? null}
            visibleEnemies={visibleEnemies}
          />
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════ */}
        <HudRightColumn
          rolls={rolls}
          ownCharacterId={character.id}
          isGm={isGmMode}
        />
      </div>

      <HudModalsOverlay
        character={character}
        skills={skills}
        talents={talents}
        refTalentMap={refTalentMap}
        speciesAbilities={speciesAbilities}
        forceRating={forceRating}
        effectiveCampaignId={effectiveCampaignId}
        supabase={supabase}
        isGmMode={isGmMode}
        refWeaponQualityMap={refWeaponQualityMap}
        rollResult={rollResult}
        rollLabel={rollLabel}
        setRollResult={setRollResult}
        gmDialog={gmDialog}
        setGmDialog={setGmDialog}
        gmCritInjuryDialog={gmCritInjuryDialog}
        setGmCritInjuryDialog={setGmCritInjuryDialog}
        forceRollResult={forceRollResult}
        setForceRollResult={setForceRollResult}
        initRoll={initRoll}
        setInitRoll={setInitRoll}
        skillPopover={skillPopover}
        setSkillPopover={setSkillPopover}
        onRoll={handleRoll}
        destinyRollRequest={destinyRollRequest}
        setDestinyRollRequest={setDestinyRollRequest}
        destinySpendOpen={destinySpendOpen}
        setDestinySpendOpen={setDestinySpendOpen}
        destinyPoolRecord={destinyPoolRecord}
        destinyGmFlash={destinyGmFlash}
        setDestinyGmFlash={setDestinyGmFlash}
        destinyConsidering={destinyConsidering}
        setDestinyConsidering={setDestinyConsidering}
        conflictFlash={conflictFlash}
        setConflictFlash={setConflictFlash}
        tranquilityFlash={tranquilityFlash}
        setTranquilityFlash={setTranquilityFlash}
        lootReveal={lootReveal}
        setLootReveal={setLootReveal}
        vendorOffer={vendorOffer}
        setVendorOffer={setVendorOffer}
        onCreditSpend={handleCreditSpend}
        spendCreditsOpen={spendCreditsOpen}
        setSpendCreditsOpen={setSpendCreditsOpen}
        pendingForceRatingOffer={pendingForceRatingOffer}
        setPendingForceRatingOffer={setPendingForceRatingOffer}
        onPurchaseForceRating={handlePurchaseForceRating}
        diceOpen={diceOpen}
        onDiceOpenChange={setDiceOpen}
      />
    </div>
  )
}

