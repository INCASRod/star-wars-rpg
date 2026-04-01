'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL } from '@/components/player-hud/design-tokens'

const GOLD         = '#C8AA50'
const BORDER       = 'rgba(200,170,80,0.18)'
const BORDER_MD    = 'rgba(200,170,80,0.32)'
const RAISED_BG    = 'rgba(14,26,18,0.9)'
const INPUT_BG     = 'rgba(6,13,9,0.7)'
const ENEMY_RED    = '#e05252'
const ALLIED_GREEN = '#52e08a'
const PLAYER_BLUE  = '#52a8e0'
const TEXT         = '#E8DFC8'
const TEXT_SEC     = 'rgba(232,223,200,0.6)'
const TEXT_MUTED   = 'rgba(232,223,200,0.35)'
const FC = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"
const FR = "'Rajdhani', sans-serif"

type LogAlignment = 'player' | 'allied_npc' | 'enemy' | 'system'

interface CombatLogEntry {
  id: string
  created_at: string
  participant_name: string
  alignment: LogAlignment
  roll_type: string | null
  weapon_name: string | null
  result_summary: string | null
  is_visible_to_players: boolean
}

interface CombatLogProps {
  campaignId: string
  encounterId: string | null
  isDm: boolean
}

const ALIGNMENT_COLOR: Record<LogAlignment, string> = {
  player:     PLAYER_BLUE,
  allied_npc: ALLIED_GREEN,
  enemy:      ENEMY_RED,
  system:     GOLD,
}

export function CombatLog({ campaignId, encounterId, isDm }: CombatLogProps) {
  const [entries, setEntries]       = useState<CombatLogEntry[]>([])
  const [logInput, setLogInput]     = useState('')
  const [logDmOnly, setLogDmOnly]   = useState(false)
  const [showGmOnly, setShowGmOnly] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load existing entries
  useEffect(() => {
    if (!encounterId) { setEntries([]); return }
    supabase
      .from('combat_log')
      .select('id, created_at, participant_name, alignment, roll_type, weapon_name, result_summary, is_visible_to_players')
      .eq('encounter_id', encounterId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setEntries(data as CombatLogEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId])

  // Realtime: new INSERT entries
  useEffect(() => {
    if (!encounterId) return
    const ch = supabase
      .channel(`combat-log-${encounterId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'combat_log',
        filter: `encounter_id=eq.${encounterId}`,
      }, (payload) => {
        setEntries(prev => [...prev, payload.new as CombatLogEntry])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId])

  // Auto-scroll to bottom when new entries arrive (unless user has scrolled up)
  useEffect(() => {
    if (!userScrolled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, userScrolled])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    setUserScrolled(el.scrollHeight - el.scrollTop - el.clientHeight > 40)
  }

  const scrollToBottom = () => {
    setUserScrolled(false)
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  const handleAddManual = async () => {
    if (!logInput.trim() || !encounterId) return
    await supabase.from('combat_log').insert({
      campaign_id: campaignId,
      encounter_id: encounterId,
      participant_name: 'GM',
      alignment: 'system',
      roll_type: 'manual',
      result_summary: logInput.trim(),
      is_visible_to_players: !logDmOnly,
    })
    setLogInput('')
  }

  const displayEntries = isDm
    ? (showGmOnly ? entries : entries.filter(e => e.is_visible_to_players))
    : entries.filter(e => e.is_visible_to_players)

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <div style={{
      flexShrink: 0, borderTop: `1px solid ${BORDER}`,
      background: RAISED_BG, maxHeight: 160, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Log header */}
      <div style={{
        padding: '5px 14px 0', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 600,
          letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`,
        }}>
          Combat Log
        </div>
        {isDm && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={showGmOnly}
              onChange={e => setShowGmOnly(e.target.checked)}
              style={{ accentColor: ENEMY_RED, width: 11, height: 11 }}
            />
            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>GM-only</span>
          </label>
        )}
        {userScrolled && (
          <button
            onClick={scrollToBottom}
            style={{
              background: `${GOLD}15`, border: `1px solid ${GOLD}50`,
              borderRadius: 3, padding: '1px 6px', cursor: 'pointer',
              fontFamily: FM, fontSize: FS_OVERLINE, color: GOLD,
              marginLeft: isDm ? 0 : 'auto',
            }}
          >↓</button>
        )}
      </div>

      {/* Entry list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 5px', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {displayEntries.length === 0 && (
          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>
            {encounterId ? 'No log entries yet' : 'No active combat'}
          </div>
        )}
        {displayEntries.map(entry => {
          const color = ALIGNMENT_COLOR[entry.alignment] ?? GOLD
          const isGmOnly = !entry.is_visible_to_players
          return (
            <div key={entry.id} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', opacity: isGmOnly ? 0.72 : 1 }}>
              <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, flexShrink: 0, minWidth: 36 }}>
                {formatTime(entry.created_at)}
              </span>
              <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color, flexShrink: 0, minWidth: 64, fontWeight: 600 }}>
                {entry.participant_name}
              </span>
              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC, flex: 1 }}>
                {entry.roll_type && entry.roll_type !== 'manual' && entry.roll_type !== 'system' && (
                  <span style={{ color: TEXT_MUTED, marginRight: 4 }}>[{entry.roll_type}]</span>
                )}
                {entry.weapon_name && (
                  <span style={{ color: `${GOLD}90`, marginRight: 4 }}>{entry.weapon_name}:</span>
                )}
                {entry.result_summary}
              </span>
              {isGmOnly && isDm && (
                <span style={{
                  fontFamily: FM, fontSize: FS_OVERLINE, color: ENEMY_RED,
                  border: `1px solid ${ENEMY_RED}40`, borderRadius: 2, padding: '0 4px', flexShrink: 0,
                }}>GM</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Input (GM only) */}
      {isDm && (
        <div style={{ padding: '5px 14px 6px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 6, flexShrink: 0 }}>
          <input
            value={logInput}
            onChange={e => setLogInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleAddManual() }}
            placeholder="Log an action…"
            style={{
              flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`,
              borderRadius: 3, padding: '4px 8px', color: TEXT,
              fontFamily: FR, fontSize: FS_CAPTION, outline: 'none',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, cursor: 'pointer' }}>
            <input type="checkbox" checked={logDmOnly} onChange={e => setLogDmOnly(e.target.checked)} style={{ accentColor: ENEMY_RED }} />
            GM
          </label>
          <button
            onClick={() => void handleAddManual()}
            style={{
              background: 'transparent', border: `1px solid ${BORDER_MD}`,
              borderRadius: 3, padding: '3px 10px', cursor: 'pointer',
              fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT,
            }}
          >Log</button>
        </div>
      )}
    </div>
  )
}
