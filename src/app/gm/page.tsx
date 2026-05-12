'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefCriticalInjury, CriticalInjuryRequest } from '@/lib/types'
import { DutyObligationTab } from '@/components/gm/DutyObligationTab'
import { ForceNotificationCard } from '@/components/gm/ForceNotificationCard'
import { ItemDatabaseTab } from '@/components/gm/ItemDatabaseTab'
import { LootAwardModal } from '@/components/gm/LootAwardModal'
import { DestinyGeneratePanel } from '@/components/gm/DestinyGeneratePanel'
import { GmMapView } from '@/components/gm/GmMapView'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { TalentDatabaseTab } from '@/components/gm/TalentDatabaseTab'
import { StagingTopBar } from '@/components/staging/StagingTopBar'
import { StagingFloatingToolbar } from '@/components/staging/StagingFloatingToolbar'
import { GmCharacterCard } from '@/components/gm/GmCharacterCard'
import { GmLootModal } from '@/components/gm/GmLootModal'
import { useActiveMap } from '@/hooks/useActiveMap'
import { useGmDestinyPool } from '@/hooks/useGmDestinyPool'
import { useMapTokens } from '@/hooks/useMapTokens'
import { useGmData } from '@/hooks/useGmData'
import { useGmBroadcast } from '@/hooks/useGmBroadcast'
import { useGmSession } from '@/hooks/useGmSession'
import { useGmAwards } from '@/hooks/useGmAwards'
import { useGmLoot } from '@/hooks/useGmLoot'
import { useGmCharacterActions } from '@/hooks/useGmCharacterActions'
import { DestinyPoolDisplay } from '@/components/destiny/DestinyPoolDisplay'
import { toast } from 'sonner'
import { useRollFeed } from '@/hooks/useRollFeed'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { GmReferenceDrawer } from '@/components/gm/GmReferenceDrawer'
import { GmDiceRollerFAB } from '@/components/gm/GmDiceRollerFAB'
import { InitiativeSetupModal } from '@/components/dm/InitiativeSetupModal'
import { AddParticipantModal } from '@/components/combat/AddParticipantModal'
import type { Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import { HUD, Z } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'

/* ── Design tokens ── */
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const GOLD_DIM = '#7A6830'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const GREEN = '#4EC87A'
const RED = '#E05050'
const BLUE = '#5AAAE0'
const PURPLE = '#9060D0'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_H4       = 'var(--text-h4)'
const FS_H3       = 'var(--text-h3)'

const panelBase: React.CSSProperties = {
  background: PANEL_BG, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`, borderRadius: 6, position: 'relative',
}
const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(200,170,80,0.25)`,
  color: TEXT, fontFamily: FR, padding: '6px 10px', borderRadius: 3, outline: 'none', fontSize: FS_SM,
}
const darkInputFull: React.CSSProperties  = { ...darkInput, width: '100%' }
const darkInputMd: React.CSSProperties   = { ...darkInput, minWidth: 160 }
const darkInputNarrow: React.CSSProperties = { ...darkInput, width: '5rem', textAlign: 'center' }
const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)', border: `1px solid rgba(200,170,80,0.4)`, color: HUD.gold,
  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
}
const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.15)', border: `1px solid rgba(224,80,80,0.4)`, color: RED,
  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  background: 'rgba(90,170,224,0.15)', border: `1px solid rgba(90,170,224,0.4)`, color: BLUE,
  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
}
const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)', border: `1px solid rgba(200,170,80,0.2)`,
  color: DIM, fontFamily: FR, fontSize: FS_CAPTION, padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
}
const btnSmallSm: React.CSSProperties = { ...btnSmall, padding: '3px 12px', fontSize: FS_SM }
const fieldLabel: React.CSSProperties = {
  fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'rgba(200,170,80,0.5)', marginBottom: 4,
}
const rowFlexWrap: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }
const rowActionEnd: React.CSSProperties = { display: 'flex', gap: 10, justifyContent: 'flex-end' }
const descText: React.CSSProperties = { fontFamily: FR, fontSize: FS_SM, color: TEXT, lineHeight: 1.7, marginBottom: 20 }

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
  return (<>
    <div style={{ ...s, top: 0, left: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, top: 0, right: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, left: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, right: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
  </>)
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.4)', marginBottom: 8 }}>
    {children}
  </div>
)

function OverrideCritSelect({ refCrits, onOverride }: { refCrits: RefCriticalInjury[]; onOverride: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'rgba(224,120,85,0.08)', border: `1px solid rgba(224,120,85,0.3)`, borderRadius: 3, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: '#E07855' }}
      >
        ✎ Override
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: Z.backdrop }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, zIndex: Z.modal, background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 4, maxHeight: 200, overflowY: 'auto' }}>
            {refCrits.map(r => (
              <button
                key={r.id}
                onClick={() => { onOverride(r.id); setOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '5px 8px', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, borderBottom: `1px solid rgba(200,170,80,0.06)` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = RED; (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                [{r.roll_min}–{r.roll_max}] {r.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Page export (Suspense wrapper) ── */
export default function GmDashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: FC, color: HUD.gold, fontSize: FS_H3, letterSpacing: '0.3em' }}>
        LOADING GM DASHBOARD...
      </div>
    }>
      <GmDashboard />
    </Suspense>
  )
}

/* ── Inner component ── */
function GmDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')

  const flash      = useCallback((msg: string) => toast.success(msg), [])
  const flashError = useCallback((msg: string) => toast.error(msg), [])

  // ── Domain hooks ────────────────────────────────────────────────
  const {
    campaign, characters, setCharacters, activeChars, archivedChars,
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

  const { tokens: stagingTokens, moveToken: stagingMoveToken, toggleVisibility: stagingToggleVisibility, removeToken: stagingRemoveToken, removeAllTokens: stagingRemoveAllTokens, addToken: stagingAddToken } = useMapTokens(activeMap?.id ?? null)

  const {
    sessionMode, combatRound, sessionBusy, stagingEncounter,
    stagingInitRoster, stagingGroupSizes, setStagingGroupSizes,
    beginCombat, endEncounter, changeRound,
    openStagingCombatModal, handleStagingCombatStart,
    stagingAddToEncounter, stagingAddVehicleToEncounter,
    syncStagingTokensToEncounter,
  } = useGmSession({ campaignId, campaign, activeChars, characters, stagingTokens, activeMapId: activeMap?.id, sendToChar })

  const {
    xpAmount, setXpAmount, xpReason, setXpReason, xpBusy,
    xpMode, setXpMode, xpTarget, setXpTarget,
    xpConfirm, setXpConfirm, xpHistory, xpHistoryExpanded, setXpHistoryExpanded,
    requestXpConfirm, handleBulkXp, handleIndividualXp,
    creditsAmount, setCreditsAmount, creditsBusy,
    creditsMode, setCreditsMode, creditsTarget, setCreditsTarget,
    creditsHistory, creditsHistoryExpanded, setCreditsHistoryExpanded,
    handleBulkCredits, handleIndividualCredits,
  } = useGmAwards({ campaignId, activeChars, characters, setCharacters, notify, flash, flashError })

  const loot = useGmLoot({ characters, notify, broadcastAll, flash })
  const {
    lootItems, setLootItems, lootSelected, setLootSelected,
    revealItem, setRevealItem, assignTarget, setAssignTarget,
    lootAwardItem, setLootAwardItem,
  } = loot

  const {
    critReqOpenFor, setCritReqOpenFor,
    critReqVicious, setCritReqVicious,
    critReqLethal, setCritReqLethal,
    critReqGm, setCritReqGm,
    critReqBusy, critCustomNames, setCritCustomNames,
    sendCritRequest, confirmCritResult, cancelCritResult, overrideCritResult, healCrit,
    addWound, healWounds, addStrain, healStrain,
    odMode, setOdMode, odType, setOdType, odAmount, setOdAmount, odTarget, setOdTarget, odBusy,
    adjustObligation, adjustDuty, adjustMorality, handleBulkOD, handleIndividualOD,
    moralitySetup, setMoralitySetup, moralityBusy, openMoralitySetup, handleMoralitySave,
    archiveConfirm, setArchiveConfirm, archiveBusy, archiveOpen, setArchiveOpen,
    handleArchive, handleRestore,
    fallenConfirm, setFallenConfirm, fallenBusy, handleFallenToggle,
    releaseAllSessions,
  } = useGmCharacterActions({
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])
  const rolls = useRollFeed(campaignId)

  // ── UI-only state ────────────────────────────────────────────────
  type ActiveModal = 'gm-screen' | 'map-library' | 'loot' | 'staging-init' | 'staging-add'
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null)

  type GmTab = 'xp' | 'credits' | 'duty' | 'do' | 'loot' | 'items' | 'talents' | 'adversaries' | 'vehicles' | 'force' | 'staging'
  const GM_TAB_KEY = 'holocron:gm-tab'
  const GM_TAB_VALID: GmTab[] = ['xp', 'credits', 'duty', 'do', 'loot', 'items', 'talents', 'adversaries', 'vehicles', 'force']
  const [activeTab, setActiveTab] = useState<GmTab>(() => {
    if (typeof window === 'undefined') return 'xp'
    if (new URLSearchParams(window.location.search).get('tab') === 'staging') return 'staging'
    const saved = window.localStorage.getItem(GM_TAB_KEY)
    return GM_TAB_VALID.includes(saved as GmTab) ? (saved as GmTab) : 'xp'
  })
  const prevToolsTab = useRef<GmTab>(activeTab === 'staging' ? 'xp' : activeTab)

  // When entering staging view, sync any adversary tokens that have no encounter slot yet.
  // This repairs tokens placed before an encounter existed (e.g. from a prior session).
  useEffect(() => {
    if (activeTab === 'staging') void syncStagingTokensToEncounter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // wrap openStagingCombatModal to also open the modal
  const handleOpenStagingModal = useCallback(async () => {
    await openStagingCombatModal()
    setActiveModal('staging-init')
  }, [openStagingCombatModal])

  const targetChars = activeChars

  // ── Loading / Error ──────────────────────────────────────────────
  if (loading) return <HolocronLoader />
  if (error || !campaign) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG, gap: 16 }}>
        <div style={{ fontFamily: FR, color: RED, fontSize: FS_H4 }}>{error || 'Campaign not found'}</div>
        <button onClick={() => router.push('/')} style={btnPrimary}>Return Home</button>
      </div>
    )
  }

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: BG, display: 'flex', flexDirection: 'column' }}>

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
      {/* Hex grid */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.04 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="hex" x="0" y="0" width="56" height="64" patternUnits="userSpaceOnUse"><polygon points="28,2 54,16 54,48 28,62 2,48 2,16" fill="none" stroke={HUD.gold} strokeWidth="0.8" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
      </div>

      {/* ── TOP BAR ── */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(4,9,6,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, height: 56, flexShrink: 0 }}>
        <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.15em', textShadow: `0 0 20px rgba(200,170,80,0.5)` }}>HOLOCRON</span>
        <div style={{ width: 1, height: 28, background: BORDER }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: FC, fontSize: FS_SM, color: TEXT }}>{campaign.name}</span>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em' }}>· GM Dashboard</span>
        </div>
        <div style={{ background: 'rgba(200,170,80,0.1)', border: `1px solid rgba(200,170,80,0.35)`, borderRadius: 3, padding: '2px 8px', fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', color: HUD.gold }}>GM</div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.1em' }}>{characters.length} PLAYERS</span>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: `1px solid rgba(200,170,80,0.25)`, padding: '5px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, cursor: 'pointer', borderRadius: 3 }}>← Back to Lobby</button>
      </div>

      {/* ── MODE BAR ── */}
      <div style={{ position: 'relative', zIndex: 9, background: 'rgba(4,9,6,0.88)', backdropFilter: 'blur(8px)', borderBottom: `1px solid rgba(200,170,80,0.1)`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, height: 48, flexShrink: 0 }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', border: `1px solid rgba(200,170,80,0.2)` }}>
          <button onClick={endEncounter} disabled={sessionBusy} style={{ padding: '4px 14px', fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: '.15s', background: sessionMode === 'exploration' ? 'rgba(78,200,122,0.12)' : 'transparent', color: sessionMode === 'exploration' ? GREEN : DIM }}>◈ Exploration</button>
          <button
            onClick={activeTab === 'staging' && sessionMode !== 'combat' ? handleOpenStagingModal : beginCombat}
            disabled={sessionBusy}
            style={{ padding: '4px 14px', fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: '.15s', background: sessionMode === 'combat' ? 'rgba(224,80,80,0.12)' : 'transparent', color: sessionMode === 'combat' ? RED : DIM, boxShadow: sessionMode === 'combat' ? 'inset 0 0 8px rgba(224,80,80,0.15)' : 'none' }}
          >⚔ Combat</button>
        </div>

        {/* Round counter */}
        {sessionMode === 'combat' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => changeRound(-1)} disabled={combatRound <= 1 || sessionBusy} style={{ ...btnSmall, padding: '3px 10px', opacity: combatRound <= 1 ? 0.4 : 1 }}>−</button>
            <span style={{ fontFamily: FC, fontSize: FS_H3, color: RED, minWidth: 60, textAlign: 'center', textShadow: '0 0 12px #E05050' }}>{combatRound}</span>
            <button onClick={() => changeRound(1)} disabled={sessionBusy} style={{ ...btnSmall, padding: '3px 10px' }}>+</button>
            <button onClick={endEncounter} disabled={sessionBusy} style={{ border: '1px solid rgba(224,80,80,0.4)', background: 'rgba(224,80,80,0.1)', color: RED, fontFamily: FR, fontSize: FS_CAPTION, letterSpacing: '0.1em', padding: '4px 10px', cursor: 'pointer', borderRadius: 3 }}>End Encounter</button>
          </div>
        )}

        {/* Staging toggle */}
        <button
          onClick={() => {
            if (activeTab === 'staging') { setActiveTab(prevToolsTab.current); localStorage.setItem(GM_TAB_KEY, prevToolsTab.current) }
            else { prevToolsTab.current = activeTab; setActiveTab('staging') }
          }}
          style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', border: 'none', cursor: 'pointer', borderRadius: 4, transition: '.15s', background: activeTab === 'staging' ? 'rgba(82,200,160,0.15)' : 'transparent', color: activeTab === 'staging' ? '#52C8A0' : DIM, outline: activeTab === 'staging' ? '1px solid rgba(82,200,160,0.4)' : 'none' }}
        >◉ Staging</button>

        {/* Destiny Pool */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', maxHeight: 48, overflow: 'hidden' }}>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Destiny</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {destinyPoolRecord ? (
              <>
                <DestinyPoolDisplay poolRecord={destinyPoolRecord} isGm={true} onClickDark={handleGmSpendDark} compact />
                {gmSpendConfirm && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', background: 'rgba(139,43,226,0.12)', border: '1px solid rgba(139,43,226,0.35)', borderRadius: 4, flexShrink: 0 }}>
                    <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#B070D8' }}>Spend dark?</span>
                    <button onClick={handleGmSpendDark} style={{ ...btnSmall, padding: '1px 6px', fontSize: FS_CAPTION, color: '#B070D8', border: '1px solid rgba(139,43,226,0.4)' }}>Spend</button>
                    <button onClick={() => setGmSpendConfirm(false)} style={{ ...btnSmall, padding: '1px 5px', fontSize: FS_CAPTION }}>✕</button>
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, whiteSpace: 'nowrap' }}>No active pool</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => setDestinyGenerateOpen(true)} style={{ ...btnSmall, height: 32, padding: '0 10px', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: HUD.gold, border: `1px solid rgba(200,170,80,0.35)`, whiteSpace: 'nowrap' }}>◈ Generate</button>
            <button onClick={() => setManualAdjustOpen(true)} style={{ ...btnSmall, height: 32, padding: '0 10px', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: 'rgba(200,170,80,0.5)', border: '1px solid rgba(200,170,80,0.25)', whiteSpace: 'nowrap' }}>✎ Adjust</button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* ── STAGING VIEW ── */}
        {activeTab === 'staging' && (
          <>
            <GmMapView
              campaignId={campaignId} characters={activeChars} allMaps={allMaps} activeMap={activeMap}
              onDeleteMap={removeMap} isStagingTab={true}
              stagingLibraryOpen={activeModal === 'map-library'} onStagingLibraryClose={() => setActiveModal(null)}
              stagingTokens={stagingTokens} onStagingMoveToken={stagingMoveToken}
              onStagingToggleVisibility={stagingToggleVisibility} onStagingRemoveToken={stagingRemoveToken}
              onStagingAddToken={stagingAddToken}
            />
            <StagingTopBar sessionMode={sessionMode} sessionBusy={sessionBusy} combatRound={combatRound} onBeginCombat={handleOpenStagingModal} onEndCombat={endEncounter} />
            <StagingFloatingToolbar
              campaignId={campaignId ?? ''} sessionMode={sessionMode} mapId={activeMap?.id ?? null}
              characters={activeChars} mapsLibraryOpen={activeModal === 'map-library'}
              onMapsClick={() => setActiveModal(m => m === 'map-library' ? null : 'map-library')}
              isMapVisible={activeMap?.is_visible_to_players ?? false} tokenScale={activeMap?.token_scale ?? 1.0}
              tokens={stagingTokens} addToken={stagingAddToken} removeToken={stagingRemoveToken}
              toggleVisibility={stagingToggleVisibility} removeAllTokens={stagingRemoveAllTokens}
              onAddEnemy={sessionMode === 'combat' ? () => setActiveModal('staging-add') : undefined}
            />
            {activeModal === 'staging-init' && (
              <InitiativeSetupModal
                campaignId={campaignId ?? ''} characters={activeChars} roster={stagingInitRoster}
                sendToChar={sendToChar} onClose={() => setActiveModal(null)} onStart={handleStagingCombatStart}
              />
            )}
            {activeModal === 'staging-add' && stagingEncounter && (
              <AddParticipantModal
                searchLibrary={async (term: string) => {
                  const [{ data: global }, { data: custom }] = await Promise.all([
                    supabase.from('ref_adversaries').select('*').ilike('name', `%${term}%`).is('campaign_id', null).order('name').limit(30),
                    supabase.from('ref_adversaries').select('*').ilike('name', `%${term}%`).eq('campaign_id', campaignId ?? '').order('name').limit(30),
                  ])
                  return [...(global ?? []), ...(custom ?? [])] as Adversary[]
                }}
                encounter={stagingEncounter} groupSizes={stagingGroupSizes}
                onAdd={(adv: Adversary, alignment: 'enemy' | 'allied_npc', successes: number, advantages: number, groupSize?: number) => {
                  if (groupSize !== undefined) setStagingGroupSizes(prev => ({ ...prev, [adv.id]: groupSize }))
                  void stagingAddToEncounter(adv, alignment, successes, advantages)
                }}
                onAddVehicle={(vehicle: Vehicle, alignment: 'enemy' | 'allied_npc', successes: number, advantages: number) => {
                  void stagingAddVehicleToEncounter(vehicle, alignment, successes, advantages)
                }}
                onClose={() => setActiveModal(null)}
              />
            )}
          </>
        )}

        {/* ── LEFT / CENTER + RIGHT SIDEBAR ── */}
        {activeTab !== 'staging' && (<>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── CRITICAL INJURY RESULTS ── */}
          {rolledCritRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rolledCritRequests.map(req => {
                const charName = characters.find(c => c.id === req.character_id)?.name ?? 'Unknown'
                const injury = req.injury_key != null ? refCritsDb.find(r => r.id === req.injury_key) : null
                return (
                  <div key={req.id} style={{ ...panelBase, padding: 12, borderLeft: '3px solid rgba(220,20,60,0.6)' }}>
                    <CornerBrackets />
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      ⚡ Crit Injury Result — {charName}
                    </div>
                    <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, marginBottom: 6 }}>
                      Roll: <span style={{ color: HUD.gold, fontFamily: "'Share Tech Mono',monospace" }}>{req.roll_result}</span>
                      {req.total_modifier != null && <> (modifier: +{req.total_modifier})</>}
                    </div>
                    {injury && (
                      <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, marginBottom: 6 }}>
                        Result: <strong style={{ color: RED }}>{injury.name}</strong>
                        {injury.severity && <span style={{ color: DIM }}> — {injury.severity}</span>}
                      </div>
                    )}
                    {injury?.description && (
                      <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginBottom: 8, lineHeight: 1.5 }}>{injury.description}</div>
                    )}
                    <div style={{ marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Custom injury name (optional)"
                        value={critCustomNames[req.id] ?? ''}
                        onChange={e => setCritCustomNames(prev => ({ ...prev, [req.id]: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(8,16,10,0.6)', border: `1px solid rgba(200,170,80,0.2)`, borderRadius: 3, padding: '4px 8px', fontFamily: FR, fontSize: FS_CAPTION, color: TEXT, outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => cancelCritResult(req)} style={{ ...btnSmall, flex: 1, color: RED, borderColor: 'rgba(220,20,60,0.3)' }}>✕ Cancel</button>
                      <button onClick={() => confirmCritResult(req)} style={{ ...btnSmall, flex: 1, color: GREEN, borderColor: 'rgba(78,200,122,0.3)' }}>✓ Confirm</button>
                      <OverrideCritSelect refCrits={refCritsDb} onOverride={(injId) => overrideCritResult(req, injId)} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── PARTY OVERVIEW ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Cinzel','Rajdhani',sans-serif", fontSize: 'clamp(0.7rem, 0.95vw, 0.85rem)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: HUD.gold }}>Player Characters</div>
              {Object.keys(activeSessions).length > 0 && (
                <button onClick={releaseAllSessions} style={{ background: 'transparent', border: `1px solid rgba(224,80,80,0.4)`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.08em', color: RED, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>⏻ Release All Sessions</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {targetChars.map(c => (
                <GmCharacterCard
                  key={c.id}
                  c={c}
                  campaignId={campaignId}
                  players={players}
                  obligationTypes={obligationTypes}
                  dutyTypes={dutyTypes}
                  charActiveCritCounts={charActiveCritCounts}
                  critReqOpenFor={critReqOpenFor}
                  critReqVicious={critReqVicious}
                  critReqLethal={critReqLethal}
                  critReqGm={critReqGm}
                  critReqBusy={critReqBusy}
                  onAddWound={(id) => addWound(id, 1)}
                  onHealWounds={(id) => healWounds(id, 1)}
                  onAddStrain={(id) => addStrain(id, 1)}
                  onHealStrain={(id) => healStrain(id, 1)}
                  onAdjustObligation={adjustObligation}
                  onAdjustDuty={adjustDuty}
                  onAdjustMorality={adjustMorality}
                  onMoralitySetup={openMoralitySetup}
                  onFallenConfirm={setFallenConfirm}
                  onArchiveConfirm={setArchiveConfirm}
                  onCritOpen={setCritReqOpenFor}
                  onCritClose={() => { setCritReqOpenFor(null); setCritReqVicious(0); setCritReqLethal(0); setCritReqGm(0) }}
                  onSetCritVicious={setCritReqVicious}
                  onSetCritLethal={setCritReqLethal}
                  onSetCritGm={setCritReqGm}
                  onSendCritRequest={sendCritRequest}
                />
              ))}
            </div>
          </div>

          {/* ── ARCHIVED CHARACTERS ── */}
          {archivedChars.length > 0 && (
            <div>
              <button onClick={() => setArchiveOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 6 }}>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.3)' }}>Archived Characters ({archivedChars.length})</span>
                <span style={{ color: 'rgba(200,170,80,0.3)', fontSize: 11 }}>{archiveOpen ? '▲' : '▼'}</span>
              </button>
              {archiveOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {archivedChars.map(c => (
                    <div key={c.id} style={{ ...panelBase, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.65 }}>
                      {c.portrait_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.portrait_url} alt={c.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(200,170,80,0.2)', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(200,170,80,0.05)', border: '1px solid rgba(200,170,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: FS_LABEL, color: DIM, flexShrink: 0 }}>{c.name.charAt(0)}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: 'rgba(106,128,112,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.species_key} · {c.career_key}</div>
                      </div>
                      {c.archived_at && <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: 'rgba(106,128,112,0.5)', flexShrink: 0 }}>{new Date(c.archived_at).toLocaleDateString()}</div>}
                      <button onClick={() => handleRestore(c.id, c.name)} style={{ background: 'rgba(78,200,122,0.08)', border: `1px solid rgba(78,200,122,0.25)`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: GREEN, textTransform: 'uppercase', flexShrink: 0 }}>Restore</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TOOLS (tabbed) ── */}
          <div>
            <SectionLabel>Tools</SectionLabel>
            <div style={{ ...panelBase, overflow: 'hidden' }}>
              <CornerBrackets />
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
                {([['xp','XP'],['credits','Credits'],['duty','Duty/Obl'],['do','D&O'],['loot','Loot'],['items','Items'],['talents','✦ Talents'],['adversaries','👾 Adversaries'],['vehicles','🚀 Vehicles']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => { setActiveTab(key); localStorage.setItem(GM_TAB_KEY, key) }} style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 16px', border: 'none', borderBottom: activeTab === key ? `2px solid ${HUD.gold}` : '2px solid transparent', background: activeTab === key ? 'rgba(200,170,80,0.07)' : 'transparent', color: activeTab === key ? HUD.gold : DIM, cursor: 'pointer', marginBottom: -1 }}>{label}</button>
                ))}
                <button onClick={() => { setActiveTab('force'); localStorage.setItem(GM_TAB_KEY, 'force') }} style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 16px', border: 'none', borderBottom: activeTab === 'force' ? `2px solid #9060D0` : '2px solid transparent', background: activeTab === 'force' ? 'rgba(144,96,208,0.08)' : 'transparent', color: activeTab === 'force' ? PURPLE : DIM, cursor: 'pointer', marginBottom: -1 }}>
                  Force{forceNotifications.filter(n => n.status === 'pending').length > 0 ? ` (${forceNotifications.filter(n => n.status === 'pending').length})` : ''}
                </button>
              </div>

              {/* Tab content */}
              <div style={{ padding: 16 }}>

                {/* XP */}
                {activeTab === 'xp' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setXpMode(m); setXpAmount(''); setXpReason('') }} style={{ ...btnPrimary, background: xpMode === m ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: xpMode === m ? HUD.gold : DIM }}>{m === 'group' ? 'Group' : 'Individual'}</button>
                      ))}
                    </div>
                    <div style={rowFlexWrap}>
                      {xpMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={xpTarget} onChange={e => setXpTarget(e.target.value)} style={darkInputMd}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.xp_available} avail)</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>Amount</div>
                        <input type="number" placeholder="0" value={xpAmount} onChange={e => setXpAmount(e.target.value)} style={darkInputNarrow} />
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={fieldLabel}>Reason</div>
                        <input type="text" placeholder="Session reward..." value={xpReason} onChange={e => setXpReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && requestXpConfirm()} style={darkInputFull} />
                      </div>
                      <button onClick={requestXpConfirm} disabled={xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)} style={{ ...btnPrimary, opacity: (xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)) ? 0.4 : 1 }}>
                        {xpBusy ? 'Processing...' : xpMode === 'group' ? `Grant to All (${targetChars.length})` : parseInt(xpAmount, 10) < 0 ? 'Take XP' : 'Grant XP'}
                      </button>
                    </div>
                    {xpHistory.length > 0 && (
                      <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                        <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 8 }}>Award History</div>
                        {(xpHistoryExpanded ? xpHistory : xpHistory.slice(0, 5)).map(e => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', borderBottom: `1px solid ${FAINT}` }}>
                            <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: e.amount >= 0 ? HUD.gold : RED, flexShrink: 0 }}>{e.amount >= 0 ? '+' : ''}{e.amount} XP</span>
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                            {e.reason && <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.reason}</span>}
                            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, flexShrink: 0 }}>{new Date(e.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {xpHistory.length > 5 && <button onClick={() => setXpHistoryExpanded(v => !v)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: GOLD_DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer', padding: 0 }}>{xpHistoryExpanded ? '▲ Show less' : `▼ Show all ${xpHistory.length} entries`}</button>}
                      </div>
                    )}
                  </div>
                )}

                {/* Credits */}
                {activeTab === 'credits' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setCreditsMode(m); setCreditsAmount('') }} style={{ ...btnPrimary, background: creditsMode === m ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: creditsMode === m ? HUD.gold : DIM }}>{m === 'group' ? 'Group' : 'Individual'}</button>
                      ))}
                    </div>
                    <div style={rowFlexWrap}>
                      {creditsMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={creditsTarget} onChange={e => setCreditsTarget(e.target.value)} style={darkInputMd}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.credits} cr)</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>{creditsMode === 'group' ? 'Amount per Character' : 'Amount'}</div>
                        <input type="number" placeholder="0" value={creditsAmount} onChange={e => setCreditsAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && (creditsMode === 'group' ? handleBulkCredits() : handleIndividualCredits())} style={darkInputNarrow} />
                      </div>
                      <button onClick={creditsMode === 'group' ? handleBulkCredits : handleIndividualCredits} disabled={creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)} style={{ ...btnPrimary, opacity: (creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)) ? 0.4 : 1 }}>
                        {creditsBusy ? 'Processing...' : creditsMode === 'group' ? `Distribute to All (${targetChars.length})` : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
                      </button>
                    </div>
                    {creditsHistory.length > 0 && (
                      <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                        <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 8 }}>Award History</div>
                        {(creditsHistoryExpanded ? creditsHistory : creditsHistory.slice(0, 5)).map(e => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', borderBottom: `1px solid ${FAINT}` }}>
                            <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: e.amount >= 0 ? GREEN : RED, flexShrink: 0 }}>{e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} cr</span>
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, flexShrink: 0, marginLeft: 'auto' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {creditsHistory.length > 5 && <button onClick={() => setCreditsHistoryExpanded(v => !v)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: GOLD_DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer', padding: 0 }}>{creditsHistoryExpanded ? '▲ Show less' : `▼ Show all ${creditsHistory.length} entries`}</button>}
                      </div>
                    )}
                  </div>
                )}

                {/* Duty / Obligation */}
                {activeTab === 'duty' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {(['obligation', 'duty'] as const).map(t => (
                        <button key={t} onClick={() => { setOdType(t); setOdAmount(''); setOdTarget('') }} style={{ ...btnPrimary, background: odType === t ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: odType === t ? HUD.gold : DIM }}>{t === 'obligation' ? 'Obligation' : 'Duty'}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setOdMode(m); setOdAmount(''); setOdTarget('') }} style={{ ...btnSmall, background: odMode === m ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.06)', color: odMode === m ? HUD.gold : DIM }}>{m === 'group' ? 'Group' : 'Individual'}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {targetChars.map(c => {
                        const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)
                        const typeStr = odType === 'obligation'
                          ? (c.obligation_custom_name || obligationTypes.find(o => o.key === c.obligation_type)?.name || c.obligation_type || '—')
                          : (c.duty_custom_name || dutyTypes.find(d => d.key === c.duty_type)?.name || c.duty_type || '—')
                        return (
                          <div key={c.id} style={{ padding: '6px 10px', background: 'rgba(200,170,80,0.05)', border: `1px solid ${BORDER}`, borderRadius: 3 }}>
                            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT }}>{c.name}</div>
                            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>{typeStr}: <span style={{ fontWeight: 700, color: val > 0 ? HUD.gold : FAINT }}>{val}</span></div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={rowFlexWrap}>
                      {odMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={odTarget} onChange={e => setOdTarget(e.target.value)} style={darkInputMd}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => { const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0); return <option key={c.id} value={c.id}>{c.name} ({val})</option> })}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>Amount (+/−)</div>
                        <input type="number" placeholder="0" value={odAmount} onChange={e => setOdAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && (odMode === 'group' ? handleBulkOD() : handleIndividualOD())} style={darkInputNarrow} />
                      </div>
                      <button onClick={odMode === 'group' ? handleBulkOD : handleIndividualOD} disabled={odBusy || !odAmount || (odMode === 'individual' && !odTarget)} style={{ ...(parseInt(odAmount, 10) < 0 ? btnDanger : btnPrimary), opacity: (odBusy || !odAmount || (odMode === 'individual' && !odTarget)) ? 0.4 : 1 }}>
                        {odBusy ? 'Processing...' : parseInt(odAmount, 10) < 0
                          ? `Reduce ${odMode === 'group' ? `All (${targetChars.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`
                          : `Add to ${odMode === 'group' ? `All (${targetChars.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'do' && (
                  <DutyObligationTab characters={activeChars} dutyTypes={dutyTypes} obligationTypes={obligationTypes} onCharacterUpdated={handleCharacterUpdated} campaignId={campaignId} />
                )}

                {activeTab === 'loot' && (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, marginBottom: 16 }}>Browse, random-roll, and reveal loot to players with a dramatic card.</p>
                    <button onClick={() => { setActiveModal('loot'); setLootItems([]); setLootSelected(null); setRevealItem(null); setAssignTarget('') }} style={{ ...btnPrimary, fontSize: FS_SM, padding: '10px 28px' }}>GENERATE LOOT</button>
                    {revealItem && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER_HI}`, borderRadius: 3 }}>
                        <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD_DIM, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CURRENTLY REVEALING: </span>
                        <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{revealItem.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'items' && <ItemDatabaseTab campaignId={campaignId} supabase={supabase} characters={targetChars} sendToChar={sendToChar} />}
                {activeTab === 'talents' && <TalentDatabaseTab campaignId={campaignId} supabase={supabase} characters={targetChars} sendToChar={sendToChar} />}
                {activeTab === 'adversaries' && campaignId && <AdversaryLibrary campaignId={campaignId} sessionMode={sessionMode} />}
                {activeTab === 'vehicles' && campaignId && <VehicleLibrary campaignId={campaignId} sessionMode={sessionMode} />}

                {activeTab === 'force' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {forceNotifications.filter(n => n.status === 'pending').length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>No pending Force notifications.</div>
                        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: PURPLE, marginTop: 4, opacity: 0.6 }}>Dark side use will appear here in real time.</div>
                      </div>
                    ) : (
                      forceNotifications.filter(n => n.status === 'pending').map(n => (
                        <ForceNotificationCard
                          key={n.id}
                          notification={n}
                          isFallen={characters.find(c => c.id === n.character_id)?.is_dark_side_fallen === true}
                          onAcknowledged={id => setForceNotifications(prev => prev.filter(x => x.id !== id))}
                        />
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ width: 320, flexShrink: 0, borderLeft: `1px solid rgba(200,170,80,0.1)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD_DIM, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Roll Feed</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}`, animation: 'pulse 2s ease-in-out infinite' }} />
              Live
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <RollFeedPanel rolls={rolls} ownCharacterId="gm" isGm={true} />
          </div>
        </div>
        </>)}
      </div>

      {/* ── LOOT POPUP ── */}
      {activeModal === 'loot' && (
        <GmLootModal {...loot} characters={targetChars} onClose={() => setActiveModal(null)} />
      )}

      {/* ── MORALITY SETUP / EDIT MODAL ── */}
      {moralitySetup && (() => {
        const mv = moralitySetup.score
        const scoreColor = mv >= 70 ? BLUE : mv >= 40 ? HUD.gold : RED
        const selStr = moralityStrengths.find(m => m.key === moralitySetup.strengthKey)
        const selWk  = moralityWeaknesses.find(m => m.key === moralitySetup.weaknessKey)
        return (
          <Modal open zIndex={200} maxWidth="30rem" backdrop="rgba(0,0,0,0.65)" borderColor="rgba(90,170,224,0.3)" shadow="0 8px 40px rgba(90,170,224,0.12)">
            <div style={{ padding: 24 }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: BLUE, letterSpacing: '0.15em', marginBottom: 14 }}>✦ Configure Morality — {moralitySetup.name}</div>
              <div style={{ marginBottom: 14 }}>
                <div style={fieldLabel}>Morality Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" min={1} max={100} value={moralitySetup.score} onChange={e => setMoralitySetup(s => s && ({ ...s, score: parseInt(e.target.value) || 50 }))} style={{ ...darkInput, width: 70 }} />
                  <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: scoreColor }}>{mv}</span>
                  <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: scoreColor, opacity: 0.8 }}>{mv >= 70 ? 'Strong — Light side' : mv >= 40 ? 'Balanced' : 'Weak — Dark side temptation'}</span>
                </div>
                <div style={{ marginTop: 6, height: 6, background: FAINT, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(1, mv))}%`, background: `linear-gradient(90deg, ${RED}, #4EC87A 60%, ${BLUE})`, borderRadius: 3, transition: '.2s' }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={fieldLabel}>Strength</div>
                <select value={moralitySetup.strengthKey} onChange={e => setMoralitySetup(s => s && ({ ...s, strengthKey: e.target.value }))} style={darkInputFull}>
                  <option value="">— Select a Strength —</option>
                  {moralityStrengths.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selStr?.description && <div style={{ marginTop: 5, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>{selStr.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={fieldLabel}>Weakness</div>
                <select value={moralitySetup.weaknessKey} onChange={e => setMoralitySetup(s => s && ({ ...s, weaknessKey: e.target.value }))} style={darkInputFull}>
                  <option value="">— Select a Weakness —</option>
                  {moralityWeaknesses.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selWk?.description && <div style={{ marginTop: 5, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>{selWk.description.replace(/\[.*?\]/g, '').slice(0, 160)}…</div>}
              </div>
              <div style={rowActionEnd}>
                <button onClick={() => setMoralitySetup(null)} style={btnSmall} disabled={moralityBusy}>Cancel</button>
                <button onClick={handleMoralitySave} disabled={moralityBusy} style={{ ...btnSmall, background: 'rgba(90,170,224,0.15)', border: '1px solid rgba(90,170,224,0.5)', color: BLUE, opacity: moralityBusy ? 0.5 : 1 }}>{moralityBusy ? '…' : 'Save Morality'}</button>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* ── DARK SIDE FALL / REDEMPTION ── */}
      {fallenConfirm && (
        <Modal open zIndex={200} maxWidth="28rem" backdrop="rgba(0,0,0,0.65)" borderColor={fallenConfirm.isFallen ? 'rgba(126,200,227,0.3)' : 'rgba(139,43,226,0.35)'} shadow={fallenConfirm.isFallen ? '0 8px 40px rgba(126,200,227,0.15)' : '0 8px 40px rgba(139,43,226,0.2)'}>
          <div style={{ padding: 24 }}>
            <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: fallenConfirm.isFallen ? '#1A78A0' : '#8B2BE2', letterSpacing: '0.15em', marginBottom: 12 }}>
              {fallenConfirm.isFallen ? '✦ Grant Redemption' : '☠ Dark Side Fall'}
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, lineHeight: 1.7, marginBottom: 8 }}>
              {fallenConfirm.isFallen
                ? <><span>Grant Redemption to </span><strong style={{ color: '#1A78A0' }}>{fallenConfirm.name}</strong>? This restores standard light side Force mechanics.</>
                : <><span>Declare </span><strong style={{ color: '#8B2BE2' }}>{fallenConfirm.name}</strong> fallen to the Dark Side? This inverts their Force pip mechanics permanently until Redemption is granted.</>}
            </div>
            {!fallenConfirm.isFallen && fallenConfirm.morality !== undefined && (
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginBottom: 16 }}>Current Morality: <span style={{ color: (fallenConfirm.morality ?? 0) >= 50 ? BLUE : RED, fontWeight: 700 }}>{fallenConfirm.morality}</span></div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setFallenConfirm(null)} style={btnSmall} disabled={fallenBusy}>CANCEL</button>
              <button onClick={handleFallenToggle} disabled={fallenBusy} style={{ ...btnSmall, background: fallenConfirm.isFallen ? 'rgba(126,200,227,0.15)' : 'rgba(139,43,226,0.2)', border: `1px solid ${fallenConfirm.isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(139,43,226,0.6)'}`, color: fallenConfirm.isFallen ? '#1A78A0' : '#8B2BE2', opacity: fallenBusy ? 0.5 : 1 }}>
                {fallenBusy ? '…' : fallenConfirm.isFallen ? 'Confirm — Grant Redemption' : 'Confirm — Fall to Dark Side'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── ARCHIVE CONFIRMATION ── */}
      {archiveConfirm && (
        <Modal open zIndex={200} maxWidth="26rem" backdrop="rgba(0,0,0,0.6)" shadow="0 8px 40px rgba(0,0,0,0.5)">
          <div style={{ padding: 24 }}>
            <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: 'rgba(200,170,80,0.55)', letterSpacing: '0.15em', marginBottom: 12 }}>Archive Character</div>
            <div style={descText}><strong style={{ color: HUD.gold }}>{archiveConfirm.name}</strong> will be hidden from all player views. Their data is preserved and can be restored at any time.</div>
            <div style={rowActionEnd}>
              <button onClick={() => setArchiveConfirm(null)} style={btnSmall} disabled={archiveBusy}>CANCEL</button>
              <button onClick={handleArchive} disabled={archiveBusy} style={{ ...btnDanger, opacity: archiveBusy ? 0.5 : 1 }}>{archiveBusy ? 'ARCHIVING…' : 'ARCHIVE'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── XP CONFIRMATION ── */}
      {xpConfirm && (
        <Modal open zIndex={200} maxWidth="28rem" backdrop="rgba(0,0,0,0.6)" shadow="0 8px 40px rgba(0,0,0,0.5)">
          <div style={{ padding: 24 }}>
            <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: HUD.gold, letterSpacing: '0.15em', marginBottom: 16 }}>Confirm XP {xpConfirm.amount > 0 ? 'Grant' : 'Adjustment'}</div>
            <div style={descText}>
              <div><span style={{ color: DIM }}>Target:</span> {xpConfirm.targetName || `All characters (${activeChars.length})`}</div>
              <div><span style={{ color: DIM }}>Amount:</span> <span style={{ color: xpConfirm.amount > 0 ? GREEN : RED, fontWeight: 700 }}>{xpConfirm.amount > 0 ? '+' : ''}{xpConfirm.amount} XP</span></div>
              <div><span style={{ color: DIM }}>Reason:</span> {xpConfirm.reason}</div>
            </div>
            <div style={rowActionEnd}>
              <button onClick={() => setXpConfirm(null)} style={btnSmall}>CANCEL</button>
              <button onClick={() => xpConfirm.target ? handleIndividualXp() : handleBulkXp()} style={{ ...(xpConfirm.amount < 0 ? btnDanger : btnPrimary) }}>CONFIRM</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LOOT AWARD MODAL ── */}
      {lootAwardItem && (
        <LootAwardModal
          item={lootAwardItem} characters={targetChars} campaignId={campaignId} supabase={supabase}
          onClose={() => setLootAwardItem(null)}
          onAwardComplete={(charNames) => { flash(`${lootAwardItem!.name} awarded to ${charNames.join(', ')}`); setLootAwardItem(null) }}
          sendToChar={sendToChar}
        />
      )}

      {/* ── DESTINY MANUAL ADJUST MODAL ── */}
      {manualAdjustOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div onClick={() => setManualAdjustOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 200, width: 'clamp(320px, 40vw, 440px)', background: 'rgba(6,13,9,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(200,170,80,0.3)', borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>✎ Adjust Destiny Pool</span>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '2px 8px', fontSize: FS_CAPTION }}>✕</button>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: '#1A78A0', marginBottom: 8 }}>Light Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualLight(l => Math.max(0, l - 1))} style={btnSmallSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_H4, color: '#1A78A0', minWidth: 32, textAlign: 'center' }}>{manualLight}</span>
                <button onClick={() => setManualLight(l => l + 1)} style={btnSmallSm}>+</button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: '#B070D8', marginBottom: 8 }}>Dark Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualDark(d => Math.max(0, d - 1))} style={btnSmallSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_H4, color: '#B070D8', minWidth: 32, textAlign: 'center' }}>{manualDark}</span>
                <button onClick={() => setManualDark(d => d + 1)} style={btnSmallSm}>+</button>
              </div>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: 'rgba(232,223,200,0.3)', fontStyle: 'italic', marginBottom: 20 }}>Changes apply immediately to all screens.</div>
            <div style={rowActionEnd}>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '4px 16px', fontSize: FS_SM }}>Cancel</button>
              <button onClick={handleApplyManual} disabled={manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1))} style={{ ...btnSmall, padding: '4px 16px', fontSize: FS_SM, color: HUD.gold, border: `1px solid rgba(200,170,80,0.35)`, opacity: manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1)) ? 0.35 : 1 }}>{manualBusy ? '…' : 'Apply Changes'}</button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── DESTINY GENERATE PANEL ── */}
      {destinyGenerateOpen && campaignId && (
        <DestinyGeneratePanel
          campaignId={campaignId} characters={activeChars} supabase={supabase}
          activePool={destinyPoolRecord} sendToChar={sendToChar}
          onClose={() => setDestinyGenerateOpen(false)}
          onGenerated={(pool) => { setDestinyPoolRecord(pool); setDestinyGenerateOpen(false) }}
        />
      )}

      {/* ── BOTTOM-RIGHT BUTTON BAR ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 8998, display: 'flex', alignItems: 'center', gap: 8 }}>
        <GmDiceRollerFAB isGmScreenOpen={activeModal === 'gm-screen'} campaignId={campaignId ?? null} />
        <button
          onClick={() => setActiveModal(m => m === 'gm-screen' ? null : 'gm-screen')}
          title="GM Reference Screen"
          style={{ background: activeModal === 'gm-screen' ? 'rgba(200,170,80,0.2)' : 'rgba(6,13,9,0.92)', border: `2px solid ${activeModal === 'gm-screen' ? HUD.gold : GOLD_DIM}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "var(--font-share-tech-mono), 'Share Tech Mono', monospace", fontSize: 'var(--text-caption)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: activeModal === 'gm-screen' ? HUD.gold : DIM, boxShadow: activeModal === 'gm-screen' ? '0 0 16px rgba(200,170,80,0.2)' : '0 2px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          className={activeModal !== 'gm-screen' ? 'hov-gold' : ''}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>⬛</span>
          GM Screen
        </button>
      </div>
      <GmReferenceDrawer open={activeModal === 'gm-screen'} onClose={() => setActiveModal(null)} />

    </div>
  )
}
