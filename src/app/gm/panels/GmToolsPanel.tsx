'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { fetchAdversaries, dbRowToAdversary, type Adversary } from '@/lib/adversaries'
import { fetchVehicles, dbRowToVehicle, type Vehicle } from '@/lib/vehicles'
import { HUD, COLOR, RADIUS, FONT_BODY as FONT, FS } from '@/lib/tokens'
import type { useGmLoot } from '@/hooks/useGmLoot'
import type { useGmAwards } from '@/hooks/useGmAwards'
import type { useGmCharacterActions } from '@/hooks/useGmCharacterActions'
import { AddConflictModal } from '@/components/gm/AddConflictModal'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'

const DIM  = 'var(--hud-text-dim)'

// `Adversary` itself carries no `_isCustom`/`_dbId` fields (unlike `Vehicle`,
// which declares them optionally) — `dbRowToAdversary` attaches them at
// runtime, so this local alias is needed to read them back off `allAdversaries`
// without a cast at every call site.
type CustomAdversary = Adversary & { _isCustom?: boolean; _dbId?: string }

const fieldLabel: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'var(--hud-text-faint)',
  marginBottom:  '0.25rem',
}
const darkInput: React.CSSProperties = {
  background:   'rgba(0,0,0,0.4)',
  border:       '1px solid var(--hud-border-hi)',
  color:        'var(--hud-text)',
  fontFamily:   FONT,
  padding:      '0.375rem 0.625rem',
  borderRadius: RADIUS.sm,
  outline:      'none',
  fontSize:     'var(--text-sm)',
  width:        '100%',
}
const btnPrimary: React.CSSProperties = {
  background:    'var(--hud-surface-hi)',
  border:        '1px solid rgba(150,168,180,0.35)',
  color:         HUD.gold,
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding:       '0.375rem 0.875rem',
  borderRadius:  RADIUS.sm,
  cursor:        'pointer',
}
const btnSmall: React.CSSProperties = {
  background:   'rgba(150,168,180,0.06)',
  border:       '1px solid rgba(150,168,180,0.2)',
  color:        DIM,
  fontFamily:   FONT,
  fontSize:     'var(--text-caption)',
  padding:      '0.25rem 0.625rem',
  borderRadius: RADIUS.sm,
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
  { key: 'force',         label: 'Force', color: 'var(--hud-accent-purple)' },
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
  conflicts:   GmConflictRow[]
}

export function GmToolsPanel({
  campaignId, activeChars, dutyTypes, obligationTypes,
  forceNotifications, setForceNotifications, handleCharacterUpdated,
  awards, charActions, loot, sendToChar, conflicts,
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

  // Template-search candidates for the New Adversary/Vehicle editors — same
  // oggdude + ref_adversaries/ref_vehicles merge EncounterDeck uses, so the
  // "Search" field there finds both static and campaign-custom entries.
  const [allAdversaries, setAllAdversaries] = useState<CustomAdversary[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])

  // Add-new vs. edit-existing sub-mode for the Adversary/Vehicle tabs — the
  // editors already fully support edit mode (`editId`/`template` props), this
  // just picks a target and feeds them in instead of always mounting blank.
  const [adversaryMode, setAdversaryMode] = useState<'new' | 'edit'>('new')
  const [adversaryEditTarget, setAdversaryEditTarget] = useState<CustomAdversary | null>(null)
  const [adversaryEditSearch, setAdversaryEditSearch] = useState('')
  const [vehicleMode, setVehicleMode] = useState<'new' | 'edit'>('new')
  const [vehicleEditTarget, setVehicleEditTarget] = useState<Vehicle | null>(null)
  const [vehicleEditSearch, setVehicleEditSearch] = useState('')
  const customAdversaries = useMemo(() => allAdversaries.filter(a => a._isCustom), [allAdversaries])
  const customVehicles = useMemo(() => allVehicles.filter(v => v._isCustom), [allVehicles])
  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAdversaries(), supabase.from('ref_adversaries').select('*').order('name')])
      .then(([oggdude, custom]) => {
        if (cancelled) return
        const customAdvs = (custom.data ?? []).map(r => dbRowToAdversary(r as Record<string, unknown>))
        setAllAdversaries([...oggdude, ...customAdvs])
      }).catch(() => {})
    Promise.all([fetchVehicles(), supabase.from('ref_vehicles').select('*').order('name')])
      .then(([oggdude, custom]) => {
        if (cancelled) return
        const customVehs = (custom.data ?? []).map(r => dbRowToVehicle(r as Record<string, unknown>))
        setAllVehicles([...oggdude, ...customVehs])
      }).catch(() => {})
    return () => { cancelled = true }
  }, [supabase])

  const forceSensitiveCharIds = useMemo(
    () => activeChars.filter(c => (c.force_rating ?? 0) > 0).map(c => c.id),
    [activeChars],
  )

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
                padding:       '0.5625rem',
                background:    active ? `color-mix(in srgb, ${accent} 7%, transparent)` : 'transparent',
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
                <span style={{ marginLeft: '0.25rem', color: 'var(--hud-accent-purple)' }}>({pending.length})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>

        {/* ── XP ── */}
        {activeTab === 'xp' && (
          <div>
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setXpMode(m); setXpAmount(''); setXpReason('') }}
                  style={{ ...btnSmall, background: xpMode === m ? 'var(--hud-surface-hi)' : undefined, color: xpMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                <input type="number" placeholder="0" value={xpAmount} onChange={e => setXpAmount(e.target.value)} style={{ ...darkInput, width: '5rem' }} />
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
              <div style={{ borderTop: '1px solid var(--hud-border)', paddingTop: '0.75rem' }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)', marginBottom: '0.375rem' }}>History</div>
                {(xpHistoryExpanded ? xpHistory : xpHistory.slice(0, 5)).map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0', borderBottom: '1px solid var(--hud-border)' }}>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: e.amount >= 0 ? HUD.gold : 'var(--state-failure)' }}>{e.amount >= 0 ? '+' : ''}{e.amount} XP</span>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                    {e.reason && <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-text)', flex: 1 }}>{e.reason}</span>}
                  </div>
                ))}
                {xpHistory.length > 5 && (
                  <button onClick={() => setXpHistoryExpanded(v => !v)} style={{ marginTop: '0.375rem', background: 'transparent', border: 'none', color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)', cursor: 'pointer', padding: 0 }}>
                    {xpHistoryExpanded ? '▲ Show less' : `▼ Show all ${xpHistory.length}`}
                  </button>
                )}
              </div>
            )}

            {/* XP confirm dialog */}
            {xpConfirm && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--hud-surface-mid)', border: '1px solid var(--hud-border-hi)', borderRadius: RADIUS.md }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', marginBottom: '0.5rem' }}>
                  <div>Target: {xpConfirm.targetName || `All (${activeChars.length})`}</div>
                  <div>Amount: <span style={{ color: xpConfirm.amount > 0 ? 'var(--state-success)' : 'var(--state-failure)', fontWeight: 700 }}>{xpConfirm.amount > 0 ? '+' : ''}{xpConfirm.amount} XP</span></div>
                  <div>Reason: {xpConfirm.reason}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setCreditsMode(m); setCreditsAmount('') }}
                  style={{ ...btnSmall, background: creditsMode === m ? 'var(--hud-surface-hi)' : undefined, color: creditsMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                <input type="number" placeholder="0" value={creditsAmount} onChange={e => setCreditsAmount(e.target.value)} style={{ ...darkInput, width: '6.25rem' }} />
              </div>
              <button onClick={creditsMode === 'group' ? handleBulkCredits : handleIndividualCredits}
                disabled={creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)}
                style={{ ...btnPrimary, opacity: (creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)) ? 0.4 : 1 }}>
                {creditsBusy ? 'Processing...' : creditsMode === 'group' ? `Distribute to All (${activeChars.length})` : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
              </button>
            </div>
            {creditsHistory.length > 0 && (
              <div style={{ borderTop: '1px solid var(--hud-border)', paddingTop: '0.75rem' }}>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)', marginBottom: '0.375rem' }}>History</div>
                {(creditsHistoryExpanded ? creditsHistory : creditsHistory.slice(0, 5)).map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0', borderBottom: '1px solid var(--hud-border)' }}>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: e.amount >= 0 ? 'var(--state-success)' : 'var(--state-failure)' }}>{e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} cr</span>
                    <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>{e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}</span>
                  </div>
                ))}
                {creditsHistory.length > 5 && (
                  <button onClick={() => setCreditsHistoryExpanded(v => !v)} style={{ marginTop: '0.375rem', background: 'transparent', border: 'none', color: DIM, fontFamily: FONT, fontSize: 'var(--text-caption)', cursor: 'pointer', padding: 0 }}>
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
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {(['obligation', 'duty'] as const).map(t => (
                <button key={t} onClick={() => { setOdType(t); setOdAmount(''); setOdTarget('') }}
                  style={{ ...btnSmall, background: odType === t ? 'var(--hud-surface-hi)' : undefined, color: odType === t ? HUD.gold : DIM }}>
                  {t === 'obligation' ? 'Obligation' : 'Duty'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {(['group', 'individual'] as const).map(m => (
                <button key={m} onClick={() => { setOdMode(m); setOdAmount(''); setOdTarget('') }}
                  style={{ ...btnSmall, fontSize: 'var(--text-overline)', background: odMode === m ? 'var(--hud-surface-hi)' : undefined, color: odMode === m ? HUD.gold : DIM }}>
                  {m === 'group' ? 'Group' : 'Individual'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                <input type="number" placeholder="0" value={odAmount} onChange={e => setOdAmount(e.target.value)} style={{ ...darkInput, width: '5rem' }} />
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

        {/* ── Adversary (Add New / Edit Existing) ── */}
        {activeTab === 'new-adversary' && (
          <div>
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {(['new', 'edit'] as const).map(m => (
                <button key={m} onClick={() => { setAdversaryMode(m); setAdversaryEditTarget(null); setAdversaryEditSearch('') }}
                  style={{ ...btnSmall, background: adversaryMode === m ? 'var(--hud-surface-hi)' : undefined, color: adversaryMode === m ? HUD.gold : DIM }}>
                  {m === 'new' ? '+ Add New' : '✎ Edit Existing'}
                </button>
              ))}
            </div>

            {adversaryMode === 'edit' && !adversaryEditTarget && (
              <div>
                <input
                  style={darkInput}
                  placeholder="Search custom adversaries..."
                  value={adversaryEditSearch}
                  onChange={e => setAdversaryEditSearch(e.target.value)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
                  {customAdversaries.length === 0 && (
                    <div style={{ ...fieldLabel, textTransform: 'none', letterSpacing: 'normal' }}>No custom adversaries yet.</div>
                  )}
                  {customAdversaries
                    .filter(a => a.name.toLowerCase().includes(adversaryEditSearch.toLowerCase()))
                    .map(a => (
                      <button key={a._dbId} onClick={() => setAdversaryEditTarget(a)} className="hov-gold"
                        style={{ ...btnSmall, textAlign: 'left' }}>
                        {a.name} <span style={{ color: DIM }}>({a.type})</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {(adversaryMode === 'new' || adversaryEditTarget) && (
              <AdversaryEditor
                key={adversaryEditTarget?._dbId ?? 'new'}
                editId={adversaryEditTarget?._dbId}
                template={adversaryEditTarget ?? undefined}
                campaignId={campaignId}
                supabase={supabase}
                allAdversaries={allAdversaries}
                presentation="inline"
                onClose={() => { setAdversaryMode('new'); setAdversaryEditTarget(null) }}
                onSaved={() => { setAdversaryMode('new'); setAdversaryEditTarget(null) }}
              />
            )}
          </div>
        )}

        {/* ── Vehicle (Add New / Edit Existing) ── */}
        {activeTab === 'new-vehicle' && (
          <div>
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {(['new', 'edit'] as const).map(m => (
                <button key={m} onClick={() => { setVehicleMode(m); setVehicleEditTarget(null); setVehicleEditSearch('') }}
                  style={{ ...btnSmall, background: vehicleMode === m ? 'var(--hud-surface-hi)' : undefined, color: vehicleMode === m ? HUD.gold : DIM }}>
                  {m === 'new' ? '+ Add New' : '✎ Edit Existing'}
                </button>
              ))}
            </div>

            {vehicleMode === 'edit' && !vehicleEditTarget && (
              <div>
                <input
                  style={darkInput}
                  placeholder="Search custom vehicles..."
                  value={vehicleEditSearch}
                  onChange={e => setVehicleEditSearch(e.target.value)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
                  {customVehicles.length === 0 && (
                    <div style={{ ...fieldLabel, textTransform: 'none', letterSpacing: 'normal' }}>No custom vehicles yet.</div>
                  )}
                  {customVehicles
                    .filter(v => v.name.toLowerCase().includes(vehicleEditSearch.toLowerCase()))
                    .map(v => (
                      <button key={v._dbId} onClick={() => setVehicleEditTarget(v)} className="hov-gold"
                        style={{ ...btnSmall, textAlign: 'left' }}>
                        {v.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {(vehicleMode === 'new' || vehicleEditTarget) && (
              <VehicleEditor
                key={vehicleEditTarget?._dbId ?? 'new'}
                editId={vehicleEditTarget?._dbId}
                template={vehicleEditTarget ?? undefined}
                campaignId={campaignId}
                supabase={supabase}
                allVehicles={allVehicles}
                presentation="inline"
                onClose={() => { setVehicleMode('new'); setVehicleEditTarget(null) }}
                onSaved={() => { setVehicleMode('new'); setVehicleEditTarget(null) }}
              />
            )}
          </div>
        )}

        {/* ── Force ── */}
        {activeTab === 'force' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* ── Morality ── */}
            {hasForceSensitive && (
              <div>
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)', marginBottom: '0.5rem' }}>
                  Morality
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeChars
                    .filter(c => (c.force_rating ?? 0) > 0)
                    .map(c => {
                      const val = c.morality_value ?? 50
                      const isLight = val >= 50
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Name */}
                          <span style={{ flex: 1, fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name}
                          </span>
                          {/* Gradient bar */}
                          <div style={{ position: 'relative', width: '4rem', height: '0.3125rem', borderRadius: RADIUS.full, background: 'linear-gradient(to right, #E05050, #C8AA50 40%, #4CAF50 60%, #5AAAE0)', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: '-0.25rem', left: `${val}%`, transform: 'translateX(-50%)', width: '0.125rem', height: '0.8125rem', background: '#fff', borderRadius: RADIUS.sm, boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                          </div>
                          {/* Numeric value */}
                          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', fontWeight: 700, color: isLight ? COLOR.blue : COLOR.red, width: '1.375rem', textAlign: 'right', flexShrink: 0 }}>
                            {val}
                          </span>
                          {/* − button */}
                          <button
                            onClick={() => adjustMorality(c.id, -1)}
                            style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, border: `1px solid rgba(224,80,80,0.4)`, background: 'rgba(224,80,80,0.10)', color: COLOR.red, fontSize: FS.h4, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >−</button>
                          {/* + button */}
                          <button
                            onClick={() => adjustMorality(c.id, 1)}
                            style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, border: `1px solid rgba(90,170,224,0.4)`, background: 'rgba(90,170,224,0.10)', color: COLOR.blue, fontSize: FS.h4, cursor: 'pointer', padding: 0, lineHeight: 1 }}
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
                height:        '2.25rem',
                borderRadius:  RADIUS.sm,
                background:    hasForceSensitive ? 'rgba(144,96,208,0.12)' : 'transparent',
                border:        '1px solid rgba(144,96,208,0.35)',
                fontFamily:    FONT,
                fontSize:      'var(--text-caption)',
                fontWeight:    700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         hasForceSensitive ? 'var(--hud-accent-purple)' : 'rgba(144,96,208,0.3)',
                cursor:        hasForceSensitive ? 'pointer' : 'not-allowed',
              }}
            >
              + Add Conflict
            </button>

            {/* Force notifications section */}
            <div>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)', marginBottom: '0.5rem' }}>
                Force Notifications
              </div>
              {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No pending Force notifications.</div>
                  <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-accent-purple)', marginTop: '0.25rem', opacity: 0.6 }}>Dark side use will appear here in real time.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(forceNotifications as { id: string; character_id: string; status: string }[])
                    .filter(n => n.status === 'pending')
                    .map(n => (
                      <ForceNotificationCard
                        key={n.id}
                        notification={n as never}
                        isFallen={activeChars.find(c => c.id === n.character_id)?.is_dark_side_fallen ?? false}
                        onAcknowledged={id => setForceNotifications(prev => (prev as { id: string }[]).filter(x => x.id !== id) as never)}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Active conflicts section */}
            <div>
              <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--hud-text-faint)', marginBottom: '0.5rem' }}>
                Active Conflicts
              </div>
              {conflicts.length === 0 ? (
                <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>No active conflicts.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {conflicts.map(c => (
                    <div key={c.id} style={{ padding: '0.625rem 0.75rem', background: 'rgba(144,96,208,0.06)', border: '1px solid rgba(144,96,208,0.2)', borderRadius: RADIUS.lg }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)' }}>
                          {charNameMap[c.character_id] ?? 'Unknown'}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM }}>
                          {c.created_at.slice(0, 10)}
                        </span>
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-accent-purple)' }}>
                        {c.description}
                      </div>
                      {c.narrative && (
                        <div style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: DIM, marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
