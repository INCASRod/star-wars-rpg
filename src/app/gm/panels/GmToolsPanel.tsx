'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { DutyObligationTab } from '@/components/gm/DutyObligationTab'
import { ForceNotificationCard } from '@/components/gm/ForceNotificationCard'
import { ItemDatabaseTab } from '@/components/gm/ItemDatabaseTab'
import { TalentDatabaseTab } from '@/components/gm/TalentDatabaseTab'
import { GmLootModal } from '@/components/gm/GmLootModal'
import { LootAwardModal } from '@/components/gm/LootAwardModal'
import { AdversaryEditor } from '@/components/gm/AdversaryEditor'
import { VehicleEditor } from '@/components/gm/VehicleEditor'
import { HUD, COLOR, RADIUS } from '@/lib/tokens'
import type { useGmLoot } from '@/hooks/useGmLoot'
import type { useGmAwards } from '@/hooks/useGmAwards'
import type { useGmCharacterActions } from '@/hooks/useGmCharacterActions'
import { AddConflictModal } from '@/components/gm/AddConflictModal'
import { useGmCampaignConflicts } from '@/hooks/useGmCampaignConflicts'

const FONT = 'var(--font-body)'
const DIM  = 'var(--hud-text-dim)'
const RED  = '#E05050'
const GREEN = '#4EC87A'
const PURPLE = '#9060D0'

const fieldLabel: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'rgba(150,168,180,0.5)',
  marginBottom:  4,
}
const darkInput: React.CSSProperties = {
  background:   'rgba(0,0,0,0.4)',
  border:       '1px solid var(--hud-border-hi)',
  color:        'var(--hud-text)',
  fontFamily:   FONT,
  padding:      '6px 10px',
  borderRadius: 3,
  outline:      'none',
  fontSize:     'var(--text-sm)',
  width:        '100%',
}
const btnPrimary: React.CSSProperties = {
  background:    'rgba(150,168,180,0.12)',
  border:        '1px solid rgba(150,168,180,0.35)',
  color:         HUD.gold,
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding:       '6px 14px',
  borderRadius:  3,
  cursor:        'pointer',
}
const btnSmall: React.CSSProperties = {
  background:   'rgba(150,168,180,0.06)',
  border:       '1px solid rgba(150,168,180,0.2)',
  color:        DIM,
  fontFamily:   FONT,
  fontSize:     'var(--text-caption)',
  padding:      '4px 10px',
  borderRadius: 3,
  cursor:       'pointer',
}

type ToolsTab =
  | 'xp' | 'credits' | 'duty' | 'items'
  | 'talents' | 'new-adversary' | 'new-vehicle' | 'force'

const TABS: { key: ToolsTab; label: string; color?: string }[] = [
  { key: 'xp',            label: 'XP'           },
  { key: 'credits',       label: 'Credits'       },
  { key: 'duty',          label: 'Duty/Obl'      },
  { key: 'items',         label: 'Items'         },
  { key: 'talents',       label: 'Talents'       },
  { key: 'new-adversary', label: 'Adversary' },
  { key: 'new-vehicle',   label: 'Vehicle'   },
  { key: 'force',         label: 'Force', color: PURPLE },
]

export interface GmToolsPanelProps {
  campaignId:         string
  activeChars:        Character[]
  dutyTypes:          RefDutyType[]
  obligationTypes:    RefObligationType[]
  forceNotifications: unknown[]
  setForceNotifications: (fn: (prev: unknown[]) => unknown[]) => void
  handleCharacterUpdated: (id: string, updates: Partial<Character>) => void
  awards:      ReturnType<typeof useGmAwards>
  charActions: ReturnType<typeof useGmCharacterActions>
  loot:        ReturnType<typeof useGmLoot>
  sendToChar:  (charId: string, payload: Record<string, unknown>) => void
}

export function GmToolsPanel({
  campaignId, activeChars, dutyTypes, obligationTypes,
  forceNotifications, setForceNotifications, handleCharacterUpdated,
  awards, charActions, loot, sendToChar,
}: GmToolsPanelProps) {
  const supabase = useMemo(() => createClient(), [])
  const [activeTab, setActiveTab] = useState<ToolsTab>('xp')

  const {
    xpAmount, setXpAmount, xpReason, setXpReason, xpBusy,
    xpMode, setXpMode, xpTarget, setXpTarget,
    xpConfirm, setXpConfirm, xpHistory, xpHistoryExpanded, setXpHistoryExpanded,
    requestXpConfirm, handleBulkXp, handleIndividualXp,
    creditsAmount, setCreditsAmount, creditsBusy,
    creditsMode, setCreditsMode, creditsTarget, setCreditsTarget,
    creditsHistory, creditsHistoryExpanded, setCreditsHistoryExpanded,
    handleBulkCredits, handleIndividualCredits,
  } = awards

  const {
    odMode, setOdMode, odType, setOdType, odAmount, setOdAmount, odTarget, setOdTarget, odBusy,
    handleBulkOD, handleIndividualOD,
    adjustMorality,
  } = charActions

  const {
    lootItems, setLootItems, lootSelected, setLootSelected,
    revealItem, setRevealItem, assignTarget, setAssignTarget,
    lootAwardItem, setLootAwardItem,
  } = loot

  const [lootModalOpen, setLootModalOpen] = useState(false)
  const [addConflictOpen, setAddConflictOpen] = useState(false)

  const forceSensitiveCharIds = useMemo(
    () => activeChars.filter(c => (c.force_rating ?? 0) > 0).map(c => c.id),
    [activeChars],
  )

  const { conflicts: campaignConflicts } = useGmCampaignConflicts(campaignId, forceSensitiveCharIds)

  const charNameMap = useMemo(
    () => Object.fromEntries(activeChars.map(c => [c.id, c.name])),
    [activeChars],
  )

  const hasForceSensitive = forceSensitiveCharIds.length > 0

  const pending = (forceNotifications as { status: string }[]).filter(n => n.status === 'pending')

  /* ── Tab bar ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tab bar — horizontally scrollable */}
      <div style={{
        display:      'flex',
        overflowX:    'auto',
        borderBottom: '1px solid var(--hud-border-hi)',
        flexShrink:   0,
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--hud-border-hi) transparent',
      }}>
        {TABS.map(t => {
          const active = activeTab === t.key
          const accent = t.color ?? HUD.gold
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flexShrink:    0,
                padding:       '9px 9px',
                background:    active ? `${accent}12` : 'transparent',
                border:        'none',
                borderBottom:  active ? `2px solid ${accent}` : '2px solid transparent',
                cursor:        'pointer',
                fontFamily:    FONT,
                fontSize:      'var(--text-overline)',
                fontWeight:    700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:         active ? accent : DIM,
                whiteSpace:    'nowrap',
                marginBottom:  -1,
              }}
            >
              {t.label}
              {t.key === 'force' && pending.length > 0 && (
                <span style={{ marginLeft: 4, color: PURPLE }}>({pending.length})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* ── XP ── */}
        {activeTab === 'xp' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setXpMode(m); setXpAmount(''); setXpReason('') }}
                  style={{ ...btnSmall, background: xpMode === m ? 'rgba(150,168,180,0.2)' : undefined, color: xpMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {xpMode === 'individual' && (
                <div>
                  <div style={fieldLabel}>Character</div>
                  <select value={xpTarget} onChange={e => setXpTarget(e.target.value)} style={darkInput}>
                    <option value="">Select character...</option>
                    {activeChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.xp_available} avail)</option>)}
                  </select>
                </div>
              )}
              <div>
                <div style={fieldLabel}>Amount</div>
                <input type="number" placeholder="0" value={xpAmount} onChange={e => setXpAmount(e.target.value)} style={{ ...darkInput, width: 80 }} />
              </div>
              <div>
                <div style={fieldLabel}>Reason</div>
                <input type="text" placeholder="Session reward..." value={xpReason} onChange={e => setXpReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && requestXpConfirm()} style={darkInput} />
              </div>
              <button onClick={requestXpConfirm}
                disabled={xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)}
                style={{ ...btnPrimary, opacity: (xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)) ? 0.4 : 1 }}>
                {xpBusy ? 'Processing...' : xpMode === 'group' ? `Grant to All (${activeChars.length})` : parseInt(xpAmount, 10) < 0 ? 'Take XP' : 'Grant XP'}
              </button>
            </div>
            {xpHistory.length > 0 && (
              <div style={{ borderTop: '1px solid var(--hud-border)', paddingTop: 12 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 6 }}>History</div>
                {(xpHistoryExpanded ? xpHistory : xpHistory.slice(0, 5)).map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--hud-border)' }}>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: e.amount >= 0 ? HUD.gold : RED }}>{e.amount >= 0 ? '+' : ''}{e.amount} XP</span>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                    {e.reason && <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-text)', flex: 1 }}>{e.reason}</span>}
                  </div>
                ))}
                {xpHistory.length > 5 && (
                  <button onClick={() => setXpHistoryExpanded(v => !v)} style={{ marginTop: 6, background: 'transparent', border: 'none', color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)', cursor: 'pointer', padding: 0 }}>
                    {xpHistoryExpanded ? '▲ Show less' : `▼ Show all ${xpHistory.length}`}
                  </button>
                )}
              </div>
            )}

            {/* XP confirm dialog */}
            {xpConfirm && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--hud-surface-mid)', border: '1px solid var(--hud-border-hi)', borderRadius: 4 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', marginBottom: 8 }}>
                  <div>Target: {xpConfirm.targetName || `All (${activeChars.length})`}</div>
                  <div>Amount: <span style={{ color: xpConfirm.amount > 0 ? GREEN : RED, fontWeight: 700 }}>{xpConfirm.amount > 0 ? '+' : ''}{xpConfirm.amount} XP</span></div>
                  <div>Reason: {xpConfirm.reason}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setXpConfirm(null)} style={btnSmall}>Cancel</button>
                  <button onClick={() => xpConfirm.target ? handleIndividualXp() : handleBulkXp()} style={btnPrimary}>Confirm</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Credits ── */}
        {activeTab === 'credits' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setCreditsMode(m); setCreditsAmount('') }}
                  style={{ ...btnSmall, background: creditsMode === m ? 'rgba(150,168,180,0.2)' : undefined, color: creditsMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {creditsMode === 'individual' && (
                <div>
                  <div style={fieldLabel}>Character</div>
                  <select value={creditsTarget} onChange={e => setCreditsTarget(e.target.value)} style={darkInput}>
                    <option value="">Select character...</option>
                    {activeChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.credits} cr)</option>)}
                  </select>
                </div>
              )}
              <div>
                <div style={fieldLabel}>{creditsMode === 'group' ? 'Amount per Character' : 'Amount'}</div>
                <input type="number" placeholder="0" value={creditsAmount} onChange={e => setCreditsAmount(e.target.value)} style={{ ...darkInput, width: 100 }} />
              </div>
              <button onClick={creditsMode === 'group' ? handleBulkCredits : handleIndividualCredits}
                disabled={creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)}
                style={{ ...btnPrimary, opacity: (creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)) ? 0.4 : 1 }}>
                {creditsBusy ? 'Processing...' : creditsMode === 'group' ? `Distribute to All (${activeChars.length})` : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
              </button>
            </div>
            {creditsHistory.length > 0 && (
              <div style={{ borderTop: '1px solid var(--hud-border)', paddingTop: 12 }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 6 }}>History</div>
                {(creditsHistoryExpanded ? creditsHistory : creditsHistory.slice(0, 5)).map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--hud-border)' }}>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: e.amount >= 0 ? GREEN : RED }}>{e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} cr</span>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                  </div>
                ))}
                {creditsHistory.length > 5 && (
                  <button onClick={() => setCreditsHistoryExpanded(v => !v)} style={{ marginTop: 6, background: 'transparent', border: 'none', color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)', cursor: 'pointer', padding: 0 }}>
                    {creditsHistoryExpanded ? '▲ Show less' : `▼ Show all ${creditsHistory.length}`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Duty / Obligation ── */}
        {activeTab === 'duty' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {(['obligation', 'duty'] as const).map(t => (
                <button key={t} onClick={() => { setOdType(t); setOdAmount(''); setOdTarget('') }}
                  style={{ ...btnSmall, background: odType === t ? 'rgba(150,168,180,0.2)' : undefined, color: odType === t ? HUD.gold : DIM }}>
                  {t === 'obligation' ? 'Obligation' : 'Duty'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setOdMode(m); setOdAmount(''); setOdTarget('') }}
                  style={{ ...btnSmall, fontSize: 'var(--text-overline)', background: odMode === m ? 'rgba(150,168,180,0.12)' : undefined, color: odMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {odMode === 'individual' && (
                <div>
                  <div style={fieldLabel}>Character</div>
                  <select value={odTarget} onChange={e => setOdTarget(e.target.value)} style={darkInput}>
                    <option value="">Select character...</option>
                    {activeChars.map(c => {
                      const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)
                      return <option key={c.id} value={c.id}>{c.name} ({val})</option>
                    })}
                  </select>
                </div>
              )}
              <div>
                <div style={fieldLabel}>Amount (+/−)</div>
                <input type="number" placeholder="0" value={odAmount} onChange={e => setOdAmount(e.target.value)} style={{ ...darkInput, width: 80 }} />
              </div>
              <button onClick={odMode === 'group' ? handleBulkOD : handleIndividualOD}
                disabled={odBusy || !odAmount || (odMode === 'individual' && !odTarget)}
                style={{ ...btnPrimary, opacity: (odBusy || !odAmount || (odMode === 'individual' && !odTarget)) ? 0.4 : 1 }}>
                {odBusy ? 'Processing...' : parseInt(odAmount, 10) < 0
                  ? `Reduce ${odMode === 'group' ? `All (${activeChars.length})` : odType}`
                  : `Add to ${odMode === 'group' ? `All (${activeChars.length})` : odType}`}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--hud-border-hi)', margin: '16px 0' }} />

            <DutyObligationTab
              characters={activeChars}
              dutyTypes={dutyTypes}
              obligationTypes={obligationTypes}
              onCharacterUpdated={handleCharacterUpdated}
              campaignId={campaignId}
            />
          </div>
        )}

        {/* ── Loot ── */}
        {/* ── Items (+ Generate Loot) ── */}
        {activeTab === 'items' && (
          <ItemDatabaseTab
            campaignId={campaignId}
            supabase={supabase}
            characters={activeChars}
            sendToChar={sendToChar}
            onGenerateLoot={() => { setLootItems([]); setLootSelected(null); setRevealItem(null); setAssignTarget(''); setLootModalOpen(true) }}
          />
        )}

        {/* ── Talents ── */}
        {activeTab === 'talents' && (
          <TalentDatabaseTab campaignId={campaignId} supabase={supabase} characters={activeChars} sendToChar={sendToChar} />
        )}

        {/* ── New Adversary ── */}
        {activeTab === 'new-adversary' && (
          <AdversaryEditor
            campaignId={campaignId}
            supabase={supabase}
            allAdversaries={[]}
            onClose={() => setActiveTab('items')}
            onSaved={() => setActiveTab('items')}
          />
        )}

        {/* ── New Vehicle ── */}
        {activeTab === 'new-vehicle' && (
          <VehicleEditor
            campaignId={campaignId}
            supabase={supabase}
            onClose={() => setActiveTab('items')}
            onSaved={() => setActiveTab('items')}
          />
        )}

        {/* ── Force ── */}
        {activeTab === 'force' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Morality ── */}
            {hasForceSensitive && (
              <div>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
                  Morality
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeChars
                    .filter(c => (c.force_rating ?? 0) > 0)
                    .map(c => {
                      const val = c.morality_value ?? 50
                      const isLight = val >= 50
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Name */}
                          <span style={{ flex: 1, fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name}
                          </span>
                          {/* Gradient bar */}
                          <div style={{ position: 'relative', width: 64, height: 5, borderRadius: RADIUS.full, background: 'linear-gradient(to right, #E05050, #C8AA50 40%, #4CAF50 60%, #5AAAE0)', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: -4, left: `${val}%`, transform: 'translateX(-50%)', width: 2, height: 13, background: '#fff', borderRadius: 1, boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                          </div>
                          {/* Numeric value */}
                          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', fontWeight: 700, color: isLight ? COLOR.blue : COLOR.red, width: 22, textAlign: 'right', flexShrink: 0 }}>
                            {val}
                          </span>
                          {/* − button */}
                          <button
                            onClick={() => adjustMorality(c.id, -1)}
                            style={{ width: 20, height: 20, borderRadius: RADIUS.sm, border: `1px solid rgba(224,80,80,0.4)`, background: 'rgba(224,80,80,0.10)', color: COLOR.red, fontSize: 15, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >−</button>
                          {/* + button */}
                          <button
                            onClick={() => adjustMorality(c.id, 1)}
                            style={{ width: 20, height: 20, borderRadius: RADIUS.sm, border: `1px solid rgba(90,170,224,0.4)`, background: 'rgba(90,170,224,0.10)', color: COLOR.blue, fontSize: 15, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >+</button>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Add Conflict button */}
            <button
              onClick={() => setAddConflictOpen(true)}
              disabled={!hasForceSensitive}
              title={hasForceSensitive ? undefined : 'No force-sensitive characters in this campaign'}
              style={{
                width:         '100%',
                height:        36,
                borderRadius:  3,
                background:    hasForceSensitive ? 'rgba(144,96,208,0.12)' : 'transparent',
                border:        '1px solid rgba(144,96,208,0.35)',
                fontFamily:    FONT,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         hasForceSensitive ? PURPLE : 'rgba(144,96,208,0.3)',
                cursor:        hasForceSensitive ? 'pointer' : 'not-allowed',
              }}
            >
              + Add Conflict
            </button>

            {/* Force notifications section */}
            <div>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
                Force Notifications
              </div>
              {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No pending Force notifications.</div>
                  <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: PURPLE, marginTop: 4, opacity: 0.6 }}>Dark side use will appear here in real time.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(forceNotifications as { id: string; character_id: string; status: string }[])
                    .filter(n => n.status === 'pending')
                    .map(n => (
                      <ForceNotificationCard
                        key={n.id}
                        notification={n as never}
                        isFallen={false}
                        onAcknowledged={id => setForceNotifications(prev => (prev as { id: string }[]).filter(x => x.id !== id) as never)}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Active conflicts section */}
            <div>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(150,168,180,0.4)', marginBottom: 8 }}>
                Active Conflicts
              </div>
              {campaignConflicts.length === 0 ? (
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No active conflicts.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {campaignConflicts.map(c => (
                    <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(144,96,208,0.06)', border: '1px solid rgba(144,96,208,0.2)', borderRadius: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)' }}>
                          {charNameMap[c.character_id] ?? 'Unknown'}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>
                          {c.created_at.slice(0, 10)}
                        </span>
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: PURPLE }}>
                        {c.description}
                      </div>
                      {c.narrative && (
                        <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.narrative}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Loot modals — rendered outside the tab conditional so they survive tab switches */}
      {lootModalOpen && (
        <GmLootModal
          {...loot}
          characters={activeChars}
          onClose={() => setLootModalOpen(false)}
        />
      )}
      {lootAwardItem && (
        <LootAwardModal
          item={lootAwardItem}
          characters={activeChars}
          campaignId={campaignId}
          supabase={supabase}
          onClose={() => setLootAwardItem(null)}
          onAwardComplete={() => setLootAwardItem(null)}
          sendToChar={sendToChar}
        />
      )}
      <AddConflictModal
        open={addConflictOpen}
        onClose={() => setAddConflictOpen(false)}
        campaignId={campaignId}
        characters={activeChars}
      />
    </div>
  )
}
