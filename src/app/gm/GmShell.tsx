'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import { useGmData } from '@/hooks/useGmData'
import { useGmBroadcast } from '@/hooks/useGmBroadcast'
import { useActiveMap } from '@/hooks/useActiveMap'
import { useMapTokens } from '@/hooks/useMapTokens'
import { useGmSession } from '@/hooks/useGmSession'
import type { CombatEncounter } from '@/lib/combat'
import { useGmAwards } from '@/hooks/useGmAwards'
import { useGmLoot } from '@/hooks/useGmLoot'
import { useGmCharacterActions } from '@/hooks/useGmCharacterActions'
import { useGmDestinyPool } from '@/hooks/useGmDestinyPool'
import { useRollFeed } from '@/hooks/useRollFeed'
import { useGmCampaignConflicts, type GmConflictRow } from '@/hooks/useGmCampaignConflicts'
import { useGmPurchaseRefund } from '@/hooks/useGmPurchaseRefund'

import { GmMapView } from '@/components/gm/GmMapView'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { GmTopBar } from './GmTopBar'
import { GmDiceRollerFAB } from '@/components/gm/GmDiceRollerFAB'
import { GmReferenceDrawer } from '@/components/gm/GmReferenceDrawer'
import { InitiativeSetupModal } from '@/components/dm/InitiativeSetupModal'
import { DestinyGeneratePanel } from '@/components/gm/DestinyGeneratePanel'
import { DestinyPoolDisplay } from '@/components/destiny/DestinyPoolDisplay'
import { CharacterLoader } from '@/components/ui/CharacterLoader'
import { Modal } from '@/components/ui/Modal'

import { GmLeftRail, type GmPanelId } from './GmLeftRail'
import { GmReferenceLibraryPanel } from '@/components/gm/GmReferenceLibraryPanel'
import { GmMapPanel } from './panels/GmMapPanel'
import { GmToolsPanel } from './panels/GmToolsPanel'
import { GmPartyPanel } from './panels/GmPartyPanel'
import { GmCombatPanel } from './panels/GmCombatPanel'
import { GmInitiativeDrawer } from './panels/GmInitiativeDrawer'

import { HUD, FONT_BODY, Z, EASE, RADIUS } from '@/lib/tokens'

const FONT = FONT_BODY
const DIM  = 'var(--hud-text-dim)'

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)', border: '1px solid var(--hud-border-hi)',
  color: 'var(--hud-text)', fontFamily: FONT, padding: '0.375rem 0.625rem',
  borderRadius: RADIUS.sm, outline: 'none', fontSize: 'var(--text-sm)',
}
const btnSmall: React.CSSProperties = {
  background: 'rgba(150,168,180,0.06)', border: '1px solid rgba(150,168,180,0.2)',
  color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)',
  padding: '0.25rem 0.625rem', borderRadius: RADIUS.sm, cursor: 'pointer',
}

export function GmShell() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')

  const flash      = useCallback((msg: string) => toast.success(msg), [])
  const flashError = useCallback((msg: string) => toast.error(msg), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  // ── Domain hooks ────────────────────────────────────────────────
  const {
    campaign, characters, setCharacters, activeChars,
    players, loading, error, dutyTypes, obligationTypes,
    moralityStrengths, moralityWeaknesses, refCritsDb,
    charActiveCritCounts, setCharActiveCritCounts,
    charCrits, setCharCrits,
    activeSessions, setActiveSessions,
    rolledCritRequests, setRolledCritRequests,
    forceNotifications, setForceNotifications,
    handleCharacterUpdated,
  } = useGmData(campaignId)

  const { notify, sendToChar, broadcastAll } = useGmBroadcast(characters)

  const forceSensitiveCharIds = useMemo(
    () => activeChars.filter(c => (c.force_rating ?? 0) > 0).map(c => c.id),
    [activeChars],
  )

  const { conflicts, setConflicts } = useGmCampaignConflicts(campaignId ?? '', forceSensitiveCharIds)

  const charConflicts = useMemo(
    () => conflicts.reduce<Record<string, GmConflictRow[]>>((acc, c) => {
      ;(acc[c.character_id] ??= []).push(c)
      return acc
    }, {}),
    [conflicts],
  )

  const { activeMap, allMaps, removeMap } = useActiveMap(campaignId)

  const {
    tokens: stagingTokens,
    moveToken: stagingMoveToken,
    toggleVisibility: stagingToggleVisibility,
    removeToken: stagingRemoveToken,
    removeAllTokens: stagingRemoveAllTokens,
    addToken: stagingAddToken,
  } = useMapTokens(activeMap?.id ?? null)

  const {
    sessionMode, combatRound, sessionBusy,
    stagingEncounter,
    stagingInitRoster,
    openStagingCombatModal, handleStagingCombatStart,
    syncStagingTokensToEncounter,
    endEncounter,
  } = useGmSession({
    campaignId, campaign, activeChars, characters,
    stagingTokens, activeMapId: activeMap?.id,
    sendToChar,
  })

  const awards = useGmAwards({
    campaignId, activeChars, characters, setCharacters,
    notify, flash, flashError,
  })

  const loot = useGmLoot({ characters, notify, broadcastAll, flash })

  const charActions = useGmCharacterActions({
    campaignId, characters, activeChars, setCharacters,
    charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
    charCrits, setCharCrits,
    conflicts, setConflicts,
    activeSessions, setActiveSessions,
    moralityStrengths, moralityWeaknesses,
    notify, sendToChar, flash, flashError,
  })

  const {
    destinyPoolRecord, setDestinyPoolRecord,
    destinyGenerateOpen, setDestinyGenerateOpen,
    manualAdjustOpen, setManualAdjustOpen,
    gmSpendConfirm, setGmSpendConfirm,
    manualLight, setManualLight,
    manualDark, setManualDark,
    manualBusy, handleGmSpendDark, handleApplyManual,
  } = useGmDestinyPool({ campaignId, campaign, characters, sendToChar })

  const rolls = useRollFeed(campaignId)

  const { handleRefundPurchase } = useGmPurchaseRefund()

  // ── UI state ────────────────────────────────────────────────────
  const [activePanel,           setActivePanel]           = useState<GmPanelId | null>(null)
  const [initiativeOpen,        setInitiativeOpen]        = useState(false)

  // Persist the last seen encounter so the Enemies panel stays populated after combat ends
  const [displayEncounter, setDisplayEncounter] = useState<CombatEncounter | null>(null)
  useEffect(() => {
    if (stagingEncounter) setDisplayEncounter(stagingEncounter)
  }, [stagingEncounter])
  const [initiativeSetupOpen,   setInitiativeSetupOpen]   = useState(false)
  const [recheckInitiativeOpen, setRecheckInitiativeOpen] = useState(false)
  const [referenceOpen,         setReferenceOpen]         = useState(false)
  const [diceOpen,              setDiceOpen]              = useState(false)
  const [mapLibraryOpen,        setMapLibraryOpen]        = useState(false)

  // Force GM Imperial Steel theme for the entire GM view, including portals
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'gm-imperial'
    return () => {
      if (prev) {
        document.documentElement.dataset.theme = prev
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }
  }, [])

  // Sync encounter slots from placed tokens (idempotent)
  useEffect(() => {
    void syncStagingTokensToEncounter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagingTokens])

  // ── Handlers ────────────────────────────────────────────────────
  function handlePanelToggle(id: GmPanelId) {
    setActivePanel(p => p === id ? null : id)
    setMapLibraryOpen(false)
  }

  const handleToggleVisibility = useCallback(async (id: string, visible: boolean) => {
    await stagingToggleVisibility(id, visible)
    if (!campaignId) return
    const token = stagingTokens.find(t => t.id === id)
    if (!token?.slot_key) return
    const { data: rows } = await supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
    if (!rows || rows.length === 0) return
    const enc = rows[0]
    const slot = (enc.initiative_slots as { id: string; adversaryInstanceId?: string }[])
      ?.find(s => s.id === token.slot_key)
    if (!slot?.adversaryInstanceId) return
    const updatedAdversaries = (enc.adversaries as { instanceId: string }[])?.map(a =>
      a.instanceId !== slot.adversaryInstanceId ? a : { ...a, revealed: visible }
    )
    await supabase
      .from('combat_encounters')
      .update({ adversaries: updatedAdversaries, updated_at: new Date().toISOString() })
      .eq('id', enc.id)
  }, [stagingToggleVisibility, stagingTokens, campaignId, supabase])

  const handleStartCombat = useCallback(async () => {
    await openStagingCombatModal()
    setInitiativeSetupOpen(true)
  }, [openStagingCombatModal])

  const handleRecheckInitiativeStart = useCallback(async (
    encounterData: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!campaignId || !stagingEncounter) return
    await supabase
      .from('combat_encounters')
      .update({
        initiative_slots:   encounterData.initiative_slots,
        initiative_type:    encounterData.initiative_type,
        round:              1,
        current_slot_index: 0,
        updated_at:         new Date().toISOString(),
      })
      .eq('id', stagingEncounter.id)
    setRecheckInitiativeOpen(false)
    toast.success('Initiative order updated.')
  }, [campaignId, stagingEncounter, supabase])

  const handleAddCritOpen = useCallback((charId: string) => {
    charActions.setCritReqOpenFor(null)
    charActions.setCritReqVicious(0)
    charActions.setCritReqLethal(0)
    charActions.setCritReqGm(0)
    charActions.setAddCritOpenFor(charId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charActions.setCritReqOpenFor, charActions.setCritReqVicious, charActions.setCritReqLethal, charActions.setCritReqGm, charActions.setAddCritOpenFor])

  // ── Loading / Error ──────────────────────────────────────────────
  if (loading) return <CharacterLoader />
  if (error || !campaign) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--hud-bg)', gap: 'var(--space-4)' }}>
        <div style={{ fontFamily: FONT, color: 'var(--state-failure)', fontSize: 'var(--text-h4)' }}>{error || 'Campaign not found'}</div>
        <button onClick={() => router.push('/')} style={{ ...btnSmall, color: HUD.gold, border: '1px solid var(--hud-border-hi)' }}>Return Home</button>
      </div>
    )
  }

  // ── Destructure charActions for GmPartyPanel callbacks ──────────
  const {
    addWound, healWounds, addStrain, healStrain,
    adjustObligation, adjustDuty, adjustMorality,
    openMoralitySetup,
    moralitySetup, setMoralitySetup, moralityBusy, handleMoralitySave,
    fallenConfirm, setFallenConfirm, fallenBusy, handleFallenToggle,
    archiveConfirm, setArchiveConfirm, archiveBusy,
    handleArchive,
    critReqOpenFor, setCritReqOpenFor,
    critReqVicious, setCritReqVicious,
    critReqLethal, setCritReqLethal,
    critReqGm, setCritReqGm,
    critReqBusy,
    sendCritRequest,
    addCritOpenFor,
    addCritRefId, addCritName, setAddCritName,
    addCritDesc, setAddCritDesc,
    addCritSeverity, addCritBusy,
    selectAddCritRef, closeAddCrit, addCriticalInjury,
    healCritInjury,
    resolveConflict,
  } = charActions

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      data-theme="gm-imperial"
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--hud-bg)' }}
    >
      {/* 44px spacer — StagingTopBar is position:fixed at top:0 */}
      <div style={{ height: '2.75rem', flexShrink: 0 }} />

      {/* ── Body row ── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 2.75rem)', overflow: 'hidden' }}>

        {/* Left rail */}
        <GmLeftRail
          activePanel={activePanel}
          onPanelToggle={handlePanelToggle}
          onDiceClick={() => setDiceOpen(d => !d)}
          onScreenClick={() => setReferenceOpen(r => !r)}
          diceActive={diceOpen}
          screenActive={referenceOpen}
        />

        {/* Map area (always rendered as background) */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GmMapView
            campaignId={campaignId}
            encounter={stagingEncounter}
            characters={activeChars}
            allMaps={allMaps}
            activeMap={activeMap}
            onDeleteMap={removeMap}
            isStagingTab={true}
            stagingLibraryOpen={mapLibraryOpen}
            onStagingLibraryClose={() => setMapLibraryOpen(false)}
            stagingTokens={stagingTokens}
            onStagingMoveToken={stagingMoveToken}
            onStagingToggleVisibility={handleToggleVisibility}
            onStagingRemoveToken={stagingRemoveToken}
            onStagingAddToken={stagingAddToken}
          />

          {/* Sliding panel overlay */}
          <div style={{
            position:   'absolute',
            top:        0,
            left:       0,
            bottom:     0,
            width:      activePanel === 'tools' ? '35rem' : activePanel === 'library' ? '26.25rem' : '22.5rem',
            background: 'var(--hud-panel)',
            borderRight:'1px solid var(--hud-border-hi)',
            boxShadow:  '4px 0 24px rgba(0,0,0,0.5)',
            transform:  activePanel ? 'translateX(0)' : 'translateX(-100%)',
            transition: `transform ${EASE.panel}, width ${EASE.panel}`,
            zIndex:     Z.dropdown,
            overflow:   'hidden',
            display:    'flex',
            flexDirection: 'column',
            pointerEvents: activePanel ? 'auto' : 'none',
          }}>
            {activePanel === 'map' && (
              <GmMapPanel
                campaignId={campaignId ?? ''}
                mapId={activeMap?.id ?? null}
                isMapVisible={activeMap?.is_visible_to_players ?? false}
                tokenScale={activeMap?.token_scale ?? 1.0}
                onMapsClick={() => setMapLibraryOpen(m => !m)}
                characters={activeChars}
                tokens={stagingTokens}
                addToken={stagingAddToken}
                removeToken={stagingRemoveToken}
                toggleVisibility={handleToggleVisibility}
                removeAllTokens={stagingRemoveAllTokens}
              />
            )}
            {activePanel === 'tools' && (
              <GmToolsPanel
                campaignId={campaignId ?? ''}
                activeChars={activeChars}
                dutyTypes={dutyTypes}
                obligationTypes={obligationTypes}
                forceNotifications={forceNotifications}
                setForceNotifications={setForceNotifications as (fn: (prev: unknown[]) => unknown[]) => void}
                handleCharacterUpdated={handleCharacterUpdated}
                awards={awards}
                charActions={charActions}
                loot={loot}
                sendToChar={sendToChar}
                conflicts={conflicts}
              />
            )}
            {activePanel === 'party' && (
              <GmPartyPanel
                campaignId={campaignId ?? ''}
                characters={activeChars}
                players={players}
                obligationTypes={obligationTypes}
                dutyTypes={dutyTypes}
                charActiveCritCounts={charActiveCritCounts}
                critReqOpenFor={critReqOpenFor}
                critReqVicious={critReqVicious}
                critReqLethal={critReqLethal}
                critReqGm={critReqGm}
                critReqBusy={critReqBusy}
                onAddWound={id => addWound(id, 1)}
                onHealWounds={id => healWounds(id, 1)}
                onAddStrain={id => addStrain(id, 1)}
                onHealStrain={id => healStrain(id, 1)}
                onAdjustObligation={adjustObligation}
                onAdjustDuty={adjustDuty}
                onAdjustMorality={adjustMorality}
                onMoralitySetup={openMoralitySetup}
                onFallenConfirm={setFallenConfirm}
                onArchiveConfirm={setArchiveConfirm}
                onCritOpen={id => { closeAddCrit(); setCritReqOpenFor(id) }}
                onCritClose={() => { setCritReqOpenFor(null); setCritReqVicious(0); setCritReqLethal(0); setCritReqGm(0) }}
                onSetCritVicious={setCritReqVicious}
                onSetCritLethal={setCritReqLethal}
                onSetCritGm={setCritReqGm}
                onSendCritRequest={sendCritRequest}
                refCritsDb={refCritsDb}
                addCritOpenFor={addCritOpenFor}
                addCritRefId={addCritRefId}
                addCritName={addCritName}
                addCritDesc={addCritDesc}
                addCritSeverity={addCritSeverity}
                addCritBusy={addCritBusy}
                onAddCritOpen={handleAddCritOpen}
                onAddCritClose={closeAddCrit}
                onSelectAddCritRef={selectAddCritRef}
                onSetAddCritName={setAddCritName}
                onSetAddCritDesc={setAddCritDesc}
                onAddCritApply={addCriticalInjury}
                charCrits={charCrits}
                charConflicts={charConflicts}
                onHealCrit={healCritInjury}
                onResolveConflict={resolveConflict}
                onRestored={(char) => setCharacters(prev => [...prev, { ...char, is_archived: false, archived_at: undefined }])}
              />
            )}
            {activePanel === 'combat' && (
              <GmCombatPanel
                campaignId={campaignId ?? ''}
                encounter={displayEncounter}
                characters={activeChars}
                onStartCombat={handleStartCombat}
              />
            )}
            {activePanel === 'library' && (
              <GmReferenceLibraryPanel />
            )}
          </div>
        </div>

        {/* Roll feed rail */}
        <div style={{
          width:        '16.25rem',
          flexShrink:   0,
          borderLeft:   '1px solid var(--hud-border)',
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          background:   'var(--hud-panel)',
        }}>
          <div style={{
            padding:      '0.5rem 0.625rem',
            borderBottom: '1px solid var(--hud-border)',
            flexShrink:   0,
            display:      'flex',
            alignItems:   'center',
            gap:          '0.375rem',
          }}>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1 }}>Roll Feed</span>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--state-success)', display: 'flex', alignItems: 'center', gap: '0.1875rem' }}>
              <span style={{ display: 'inline-block', width: '0.3125rem', height: '0.3125rem', borderRadius: '50%', background: 'var(--state-success)' }} />
              Live
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <RollFeedPanel
              rolls={rolls}
              ownCharacterId="gm"
              isGm={true}
              onRefundPurchase={handleRefundPurchase}
            />
          </div>
        </div>
      </div>

      {/* Top bar — identity + mode + destiny + lobby */}
      <GmTopBar
        campaignName={campaign.name}
        sessionMode={sessionMode}
        sessionBusy={sessionBusy}
        combatRound={combatRound}
        onBeginCombat={handleStartCombat}
        onEndCombat={endEncounter}
        onInitiativeOrder={() => setInitiativeOpen(o => !o)}
        initiativeOpen={initiativeOpen}
        onLobby={() => router.push('/')}
        destinySlot={destinyPoolRecord ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--die-force)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>Destiny</span>
            <DestinyPoolDisplay poolRecord={destinyPoolRecord} isGm={true} onClickDark={handleGmSpendDark} compact />
            {gmSpendConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.375rem', background: 'rgba(139,43,226,0.12)', border: '1px solid rgba(139,43,226,0.35)', borderRadius: RADIUS.md }}>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-accent-purple)' }}>Spend dark?</span>
                <button onClick={handleGmSpendDark} style={{ ...btnSmall, padding: '1px 6px', color: 'var(--hud-accent-purple)', border: '1px solid rgba(139,43,226,0.4)' }}>Spend</button>
                <button onClick={() => setGmSpendConfirm(false)} style={{ ...btnSmall, padding: '1px 4px' }}>✕</button>
              </div>
            )}
            <button onClick={() => setDestinyGenerateOpen(true)} style={{ ...btnSmall, height: '1.625rem', padding: '0 0.5rem', color: HUD.gold, border: '1px solid var(--hud-border-hi)', flexShrink: 0 }}>◈ Generate</button>
            <button onClick={() => setManualAdjustOpen(true)} style={{ ...btnSmall, height: '1.625rem', padding: '0 0.5rem', flexShrink: 0 }}>✎ Adjust</button>
          </div>
        ) : undefined}
      />

      {/* Initiative drawer (portal, slides up from bottom) */}
      <GmInitiativeDrawer
        encounter={stagingEncounter}
        characters={activeChars}
        isOpen={initiativeOpen}
        onClose={() => setInitiativeOpen(false)}
        onRecheckInitiative={() => setRecheckInitiativeOpen(true)}
      />

      {/* Initiative setup modal */}
      {initiativeSetupOpen && (
        <InitiativeSetupModal
          campaignId={campaignId ?? ''}
          characters={activeChars}
          roster={stagingInitRoster}
          sendToChar={sendToChar}
          onClose={() => setInitiativeSetupOpen(false)}
          onStart={handleStagingCombatStart}
        />
      )}

      {/* Recheck initiative modal — reuses the same modal but patches the existing encounter */}
      {recheckInitiativeOpen && stagingEncounter && (
        <InitiativeSetupModal
          campaignId={campaignId ?? ''}
          characters={activeChars}
          roster={stagingEncounter.adversaries}
          sendToChar={sendToChar}
          onClose={() => setRecheckInitiativeOpen(false)}
          onStart={handleRecheckInitiativeStart}
        />
      )}

      {/* ── Morality Setup Modal ── */}
      {moralitySetup && (() => {
        const mv = moralitySetup.score
        const scoreColor = mv >= 70 ? 'var(--die-force)' : mv >= 40 ? HUD.gold : 'var(--state-failure)'
        const selStr = moralityStrengths.find(m => m.key === moralitySetup.strengthKey)
        const selWk  = moralityWeaknesses.find(m => m.key === moralitySetup.weaknessKey)
        return (
          <Modal open zIndex={200} maxWidth="30rem" backdrop="rgba(0,0,0,0.65)" borderColor="rgba(90,170,224,0.3)" shadow="0 8px 40px rgba(90,170,224,0.12)">
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--die-force)', letterSpacing: '0.15em', marginBottom: '0.875rem' }}>✦ Configure Morality — {moralitySetup.name}</div>
              <div style={{ marginBottom: '0.875rem' }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: '0.25rem' }}>Morality Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <input type="number" min={1} max={100} value={moralitySetup.score}
                    onChange={e => setMoralitySetup(s => s && ({ ...s, score: parseInt(e.target.value) || 50 }))}
                    style={{ ...darkInput, width: '4.375rem' }} />
                  <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', fontWeight: 700, color: scoreColor }}>{mv}</span>
                  <span style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: scoreColor, opacity: 0.8 }}>
                    {mv >= 70 ? 'Strong — Light side' : mv >= 40 ? 'Balanced' : 'Weak — Dark side temptation'}
                  </span>
                </div>
                <div style={{ marginTop: '0.375rem', height: '0.375rem', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(1, mv))}%`, background: `linear-gradient(90deg, var(--state-failure), var(--state-success) 60%, var(--die-force))`, borderRadius: RADIUS.sm, transition: '.2s' }} />
                </div>
              </div>
              <div style={{ marginBottom: '0.625rem' }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: '0.25rem' }}>Strength</div>
                <select value={moralitySetup.strengthKey} onChange={e => setMoralitySetup(s => s && ({ ...s, strengthKey: e.target.value }))} style={{ ...darkInput, width: '100%' }}>
                  <option value="">— Select a Strength —</option>
                  {moralityStrengths.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selStr?.description && <div style={{ marginTop: '0.3125rem', fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, lineHeight: 1.5 }}>{selStr.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={{ marginBottom: '1.125rem' }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: '0.25rem' }}>Weakness</div>
                <select value={moralitySetup.weaknessKey} onChange={e => setMoralitySetup(s => s && ({ ...s, weaknessKey: e.target.value }))} style={{ ...darkInput, width: '100%' }}>
                  <option value="">— Select a Weakness —</option>
                  {moralityWeaknesses.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selWk?.description && <div style={{ marginTop: '0.3125rem', fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, lineHeight: 1.5 }}>{selWk.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setMoralitySetup(null)} style={btnSmall} disabled={moralityBusy}>Cancel</button>
                <button onClick={handleMoralitySave} disabled={moralityBusy} style={{ ...btnSmall, background: 'rgba(90,170,224,0.15)', border: '1px solid rgba(90,170,224,0.5)', color: 'var(--die-force)', opacity: moralityBusy ? 0.5 : 1 }}>
                  {moralityBusy ? '…' : 'Save Morality'}
                </button>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* ── Dark Side Fall / Redemption ── */}
      {fallenConfirm && (
        <Modal open zIndex={200} maxWidth="28rem" backdrop="rgba(0,0,0,0.65)"
          borderColor={fallenConfirm.isFallen ? 'rgba(126,200,227,0.3)' : 'rgba(139,43,226,0.35)'}
          shadow={fallenConfirm.isFallen ? '0 8px 40px rgba(126,200,227,0.15)' : '0 8px 40px rgba(139,43,226,0.2)'}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: fallenConfirm.isFallen ? 'var(--die-force)' : 'var(--hud-accent-purple)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
              {fallenConfirm.isFallen ? '✦ Grant Redemption' : '☠ Dark Side Fall'}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              {fallenConfirm.isFallen
                ? <><span>Grant Redemption to </span><strong style={{ color: 'var(--die-force)' }}>{fallenConfirm.name}</strong>? This restores standard light side Force mechanics.</>
                : <><span>Declare </span><strong style={{ color: 'var(--hud-accent-purple)' }}>{fallenConfirm.name}</strong> fallen to the Dark Side? This inverts their Force pip mechanics permanently until Redemption is granted.</>}
            </div>
            {!fallenConfirm.isFallen && fallenConfirm.morality !== undefined && (
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: DIM, marginBottom: '1rem' }}>
                Current Morality: <span style={{ color: (fallenConfirm.morality ?? 0) >= 50 ? 'var(--die-force)' : 'var(--state-failure)', fontWeight: 700 }}>{fallenConfirm.morality}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setFallenConfirm(null)} style={btnSmall} disabled={fallenBusy}>CANCEL</button>
              <button onClick={handleFallenToggle} disabled={fallenBusy} style={{
                ...btnSmall,
                background: fallenConfirm.isFallen ? 'rgba(126,200,227,0.15)' : 'rgba(139,43,226,0.2)',
                border: `1px solid ${fallenConfirm.isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(139,43,226,0.6)'}`,
                color: fallenConfirm.isFallen ? 'var(--die-force)' : 'var(--hud-accent-purple)',
                opacity: fallenBusy ? 0.5 : 1,
              }}>
                {fallenBusy ? '…' : fallenConfirm.isFallen ? 'Confirm — Grant Redemption' : 'Confirm — Fall to Dark Side'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Archive Confirmation ── */}
      {archiveConfirm && (
        <Modal open zIndex={200} maxWidth="26rem" backdrop="rgba(0,0,0,0.6)" shadow="0 8px 40px rgba(0,0,0,0.5)">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(150,168,180,0.55)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Archive Character</div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              <strong style={{ color: HUD.gold }}>{archiveConfirm.name}</strong> will be hidden from all player views. Their data is preserved and can be restored at any time.
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setArchiveConfirm(null)} style={btnSmall} disabled={archiveBusy}>CANCEL</button>
              <button onClick={handleArchive} disabled={archiveBusy} style={{ ...btnSmall, background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.4)', color: 'var(--state-failure)', opacity: archiveBusy ? 0.5 : 1 }}>
                {archiveBusy ? 'ARCHIVING…' : 'ARCHIVE'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Destiny Generate Panel ── */}
      {destinyGenerateOpen && campaignId && (
        <DestinyGeneratePanel
          campaignId={campaignId}
          characters={activeChars}
          supabase={supabase}
          activePool={destinyPoolRecord}
          sendToChar={sendToChar}
          onClose={() => setDestinyGenerateOpen(false)}
          onGenerated={(pool) => { setDestinyPoolRecord(pool); setDestinyGenerateOpen(false) }}
        />
      )}

      {/* ── Destiny Manual Adjust ── */}
      {manualAdjustOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div onClick={() => setManualAdjustOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: Z.backdrop }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: Z.modal, width: 'clamp(320px, 40vw, 440px)', background: 'var(--hud-panel)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--hud-border-hi)', borderRadius: RADIUS.xl, padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', fontWeight: 700, color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>✎ Adjust Destiny Pool</span>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '2px 8px' }}>✕</button>
            </div>
            <div style={{ marginBottom: '1.125rem' }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: 'var(--die-force)', marginBottom: '0.5rem' }}>Light Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <button onClick={() => setManualLight(l => Math.max(0, l - 1))} style={{ ...btnSmall, padding: '3px 12px' }}>−</button>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', color: 'var(--die-force)', minWidth: '2rem', textAlign: 'center' }}>{manualLight}</span>
                <button onClick={() => setManualLight(l => l + 1)} style={{ ...btnSmall, padding: '3px 12px' }}>+</button>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: 'var(--hud-accent-purple)', marginBottom: '0.5rem' }}>Dark Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <button onClick={() => setManualDark(d => Math.max(0, d - 1))} style={{ ...btnSmall, padding: '3px 12px' }}>−</button>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', color: 'var(--hud-accent-purple)', minWidth: '2rem', textAlign: 'center' }}>{manualDark}</span>
                <button onClick={() => setManualDark(d => d + 1)} style={{ ...btnSmall, padding: '3px 12px' }}>+</button>
              </div>
            </div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'rgba(196,205,212,0.3)', fontStyle: 'italic', marginBottom: '1.25rem' }}>Changes apply immediately to all screens.</div>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '4px 16px' }}>Cancel</button>
              <button
                onClick={handleApplyManual}
                disabled={manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1))}
                style={{ ...btnSmall, padding: '4px 16px', color: HUD.gold, border: '1px solid var(--hud-border-hi)', opacity: manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1)) ? 0.35 : 1 }}
              >
                {manualBusy ? '…' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}

      {/* ── Dice roller (portal panel, controlled by rail button) ── */}
      <GmDiceRollerFAB
        isGmScreenOpen={referenceOpen}
        campaignId={campaignId ?? null}
        open={diceOpen}
        onOpenChange={setDiceOpen}
      />
      <GmReferenceDrawer open={referenceOpen} onClose={() => setReferenceOpen(false)} />
    </div>
  )
}
