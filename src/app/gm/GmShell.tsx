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

import { GmMapView } from '@/components/gm/GmMapView'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { GmTopBar } from './GmTopBar'
import { GmDiceRollerFAB } from '@/components/gm/GmDiceRollerFAB'
import { GmReferenceDrawer } from '@/components/gm/GmReferenceDrawer'
import { InitiativeSetupModal } from '@/components/dm/InitiativeSetupModal'
import { DestinyGeneratePanel } from '@/components/gm/DestinyGeneratePanel'
import { DestinyPoolDisplay } from '@/components/destiny/DestinyPoolDisplay'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { Modal } from '@/components/ui/Modal'

import { GmLeftRail, type GmPanelId } from './GmLeftRail'
import { GmReferenceLibraryPanel } from '@/components/gm/GmReferenceLibraryPanel'
import { GmMapPanel } from './panels/GmMapPanel'
import { GmToolsPanel } from './panels/GmToolsPanel'
import { GmPartyPanel } from './panels/GmPartyPanel'
import { GmCombatPanel } from './panels/GmCombatPanel'
import { GmInitiativeDrawer } from './panels/GmInitiativeDrawer'

import { HUD } from '@/lib/tokens'

const FONT   = 'var(--font-body)'
const DIM    = 'var(--hud-text-dim)'
const RED    = '#E05050'
const BLUE   = '#5AAAE0'
const GREEN  = '#4EC87A'

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)', border: '1px solid var(--hud-border-hi)',
  color: 'var(--hud-text)', fontFamily: FONT, padding: '6px 10px',
  borderRadius: 3, outline: 'none', fontSize: 'var(--text-sm)',
}
const btnSmall: React.CSSProperties = {
  background: 'rgba(150,168,180,0.06)', border: '1px solid rgba(150,168,180,0.2)',
  color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)',
  padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
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
    activeSessions, setActiveSessions,
    rolledCritRequests, setRolledCritRequests,
    forceNotifications, setForceNotifications,
    handleCharacterUpdated,
  } = useGmData(campaignId)

  const { notify, sendToChar, broadcastAll } = useGmBroadcast(characters)

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

  // Force Star Destroyer Slate theme for the entire GM view, including portals
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'star-destroyer-slate'
    return () => { document.documentElement.dataset.theme = prev ?? '' }
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

  // ── Loading / Error ──────────────────────────────────────────────
  if (loading) return <HolocronLoader />
  if (error || !campaign) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--hud-bg)', gap: 16 }}>
        <div style={{ fontFamily: FONT, color: RED, fontSize: 'var(--text-h4)' }}>{error || 'Campaign not found'}</div>
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
    addCritOpenFor, setAddCritOpenFor,
    addCritRefId, addCritName, setAddCritName,
    addCritDesc, setAddCritDesc,
    addCritSeverity, addCritBusy,
    selectAddCritRef, closeAddCrit, addCriticalInjury,
  } = charActions

  const handleAddCritOpen = useCallback((charId: string) => {
    setCritReqOpenFor(null)
    setCritReqVicious(0)
    setCritReqLethal(0)
    setCritReqGm(0)
    setAddCritOpenFor(charId)
  }, [setCritReqOpenFor, setCritReqVicious, setCritReqLethal, setCritReqGm, setAddCritOpenFor])

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      data-theme="star-destroyer-slate"
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--hud-bg)' }}
    >
      {/* 44px spacer — StagingTopBar is position:fixed at top:0 */}
      <div style={{ height: 44, flexShrink: 0 }} />

      {/* ── Body row ── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 44px)', overflow: 'hidden' }}>

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
            width:      activePanel === 'tools' ? 560 : activePanel === 'library' ? 420 : 360,
            background: 'var(--hud-panel)',
            borderRight:'1px solid var(--hud-border-hi)',
            boxShadow:  '4px 0 24px rgba(0,0,0,0.5)',
            transform:  activePanel ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), width 0.26s cubic-bezier(0.22,1,0.36,1)',
            zIndex:     20,
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
          width:        260,
          flexShrink:   0,
          borderLeft:   '1px solid var(--hud-border)',
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          background:   'var(--hud-panel)',
        }}>
          <div style={{
            padding:      '8px 10px',
            borderBottom: '1px solid var(--hud-border)',
            flexShrink:   0,
            display:      'flex',
            alignItems:   'center',
            gap:          6,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1 }}>Roll Feed</span>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: GREEN, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
              Live
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <RollFeedPanel rolls={rolls} ownCharacterId="gm" isGm={true} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>Destiny</span>
            <DestinyPoolDisplay poolRecord={destinyPoolRecord} isGm={true} onClickDark={handleGmSpendDark} compact />
            {gmSpendConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', background: 'rgba(139,43,226,0.12)', border: '1px solid rgba(139,43,226,0.35)', borderRadius: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: '#B070D8' }}>Spend dark?</span>
                <button onClick={handleGmSpendDark} style={{ ...btnSmall, padding: '1px 6px', color: '#B070D8', border: '1px solid rgba(139,43,226,0.4)' }}>Spend</button>
                <button onClick={() => setGmSpendConfirm(false)} style={{ ...btnSmall, padding: '1px 4px' }}>✕</button>
              </div>
            )}
            <button onClick={() => setDestinyGenerateOpen(true)} style={{ ...btnSmall, height: 26, padding: '0 8px', color: HUD.gold, border: '1px solid var(--hud-border-hi)', flexShrink: 0 }}>◈ Generate</button>
            <button onClick={() => setManualAdjustOpen(true)} style={{ ...btnSmall, height: 26, padding: '0 8px', flexShrink: 0 }}>✎ Adjust</button>
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
        const scoreColor = mv >= 70 ? BLUE : mv >= 40 ? HUD.gold : RED
        const selStr = moralityStrengths.find(m => m.key === moralitySetup.strengthKey)
        const selWk  = moralityWeaknesses.find(m => m.key === moralitySetup.weaknessKey)
        return (
          <Modal open zIndex={200} maxWidth="30rem" backdrop="rgba(0,0,0,0.65)" borderColor="rgba(90,170,224,0.3)" shadow="0 8px 40px rgba(90,170,224,0.12)">
            <div style={{ padding: 24 }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: BLUE, letterSpacing: '0.15em', marginBottom: 14 }}>✦ Configure Morality — {moralitySetup.name}</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: 4 }}>Morality Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" min={1} max={100} value={moralitySetup.score}
                    onChange={e => setMoralitySetup(s => s && ({ ...s, score: parseInt(e.target.value) || 50 }))}
                    style={{ ...darkInput, width: 70 }} />
                  <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', fontWeight: 700, color: scoreColor }}>{mv}</span>
                  <span style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: scoreColor, opacity: 0.8 }}>
                    {mv >= 70 ? 'Strong — Light side' : mv >= 40 ? 'Balanced' : 'Weak — Dark side temptation'}
                  </span>
                </div>
                <div style={{ marginTop: 6, height: 6, background: 'var(--hud-surface-lo)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(1, mv))}%`, background: `linear-gradient(90deg, ${RED}, #4EC87A 60%, ${BLUE})`, borderRadius: 3, transition: '.2s' }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: 4 }}>Strength</div>
                <select value={moralitySetup.strengthKey} onChange={e => setMoralitySetup(s => s && ({ ...s, strengthKey: e.target.value }))} style={{ ...darkInput, width: '100%' }}>
                  <option value="">— Select a Strength —</option>
                  {moralityStrengths.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selStr?.description && <div style={{ marginTop: 5, fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, lineHeight: 1.5 }}>{selStr.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.5)', marginBottom: 4 }}>Weakness</div>
                <select value={moralitySetup.weaknessKey} onChange={e => setMoralitySetup(s => s && ({ ...s, weaknessKey: e.target.value }))} style={{ ...darkInput, width: '100%' }}>
                  <option value="">— Select a Weakness —</option>
                  {moralityWeaknesses.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selWk?.description && <div style={{ marginTop: 5, fontFamily: FONT, fontSize: 'var(--text-overline)', color: DIM, lineHeight: 1.5 }}>{selWk.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setMoralitySetup(null)} style={btnSmall} disabled={moralityBusy}>Cancel</button>
                <button onClick={handleMoralitySave} disabled={moralityBusy} style={{ ...btnSmall, background: 'rgba(90,170,224,0.15)', border: '1px solid rgba(90,170,224,0.5)', color: BLUE, opacity: moralityBusy ? 0.5 : 1 }}>
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
          <div style={{ padding: 24 }}>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: fallenConfirm.isFallen ? '#1A78A0' : '#8B2BE2', letterSpacing: '0.15em', marginBottom: 12 }}>
              {fallenConfirm.isFallen ? '✦ Grant Redemption' : '☠ Dark Side Fall'}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', lineHeight: 1.7, marginBottom: 8 }}>
              {fallenConfirm.isFallen
                ? <><span>Grant Redemption to </span><strong style={{ color: '#1A78A0' }}>{fallenConfirm.name}</strong>? This restores standard light side Force mechanics.</>
                : <><span>Declare </span><strong style={{ color: '#8B2BE2' }}>{fallenConfirm.name}</strong> fallen to the Dark Side? This inverts their Force pip mechanics permanently until Redemption is granted.</>}
            </div>
            {!fallenConfirm.isFallen && fallenConfirm.morality !== undefined && (
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: DIM, marginBottom: 16 }}>
                Current Morality: <span style={{ color: (fallenConfirm.morality ?? 0) >= 50 ? BLUE : RED, fontWeight: 700 }}>{fallenConfirm.morality}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setFallenConfirm(null)} style={btnSmall} disabled={fallenBusy}>CANCEL</button>
              <button onClick={handleFallenToggle} disabled={fallenBusy} style={{
                ...btnSmall,
                background: fallenConfirm.isFallen ? 'rgba(126,200,227,0.15)' : 'rgba(139,43,226,0.2)',
                border: `1px solid ${fallenConfirm.isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(139,43,226,0.6)'}`,
                color: fallenConfirm.isFallen ? '#1A78A0' : '#8B2BE2',
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
          <div style={{ padding: 24 }}>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(150,168,180,0.55)', letterSpacing: '0.15em', marginBottom: 12 }}>Archive Character</div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', lineHeight: 1.7, marginBottom: 20 }}>
              <strong style={{ color: HUD.gold }}>{archiveConfirm.name}</strong> will be hidden from all player views. Their data is preserved and can be restored at any time.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setArchiveConfirm(null)} style={btnSmall} disabled={archiveBusy}>CANCEL</button>
              <button onClick={handleArchive} disabled={archiveBusy} style={{ ...btnSmall, background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.4)', color: RED, opacity: archiveBusy ? 0.5 : 1 }}>
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
          <div onClick={() => setManualAdjustOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9101, width: 'clamp(320px, 40vw, 440px)', background: 'var(--hud-panel)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--hud-border-hi)', borderRadius: 12, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', fontWeight: 700, color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>✎ Adjust Destiny Pool</span>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '2px 8px' }}>✕</button>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: '#1A78A0', marginBottom: 8 }}>Light Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualLight(l => Math.max(0, l - 1))} style={{ ...btnSmall, padding: '3px 12px' }}>−</button>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', color: '#1A78A0', minWidth: 32, textAlign: 'center' }}>{manualLight}</span>
                <button onClick={() => setManualLight(l => l + 1)} style={{ ...btnSmall, padding: '3px 12px' }}>+</button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-label)', color: '#B070D8', marginBottom: 8 }}>Dark Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualDark(d => Math.max(0, d - 1))} style={{ ...btnSmall, padding: '3px 12px' }}>−</button>
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-h4)', color: '#B070D8', minWidth: 32, textAlign: 'center' }}>{manualDark}</span>
                <button onClick={() => setManualDark(d => d + 1)} style={{ ...btnSmall, padding: '3px 12px' }}>+</button>
              </div>
            </div>
            <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'rgba(196,205,212,0.3)', fontStyle: 'italic', marginBottom: 20 }}>Changes apply immediately to all screens.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
