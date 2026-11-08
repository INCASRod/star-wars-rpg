import { useSyncExternalStore } from 'react'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

/**
 * XP hold (migrations 160 + 161). One module-level store backs every consumer: the player banners and pop-up,
 * the purchase guards, and the GM control. It reads `campaign_settings` once and follows it over realtime.
 *
 * The database is the real gate (trigger `characters_enforce_xp_hold`, migration 161). The client check below is the
 * fast path that avoids a doomed optimistic update. If the DB still rejects a debit, `persistXpDebit` reports it.
 */

export const XP_FROZEN_MESSAGE = 'XP spending is temporarily paused by the GM'
export const XP_HOLD_DB_MARKER = 'XP_HOLD'

export interface XpHoldState {
  /** campaign_settings row id, null until the first read succeeds. */
  id: string | null
  frozen: boolean
  reason: string | null
  startedAt: string | null
  loading: boolean
  /** True when the read failed and no earlier value exists: `frozen` is then true (fail closed) but UI notices stay hidden. */
  unknown: boolean
}

const INITIAL: XpHoldState = { id: null, frozen: false, reason: null, startedAt: null, loading: true, unknown: false }
const COLUMNS = 'id, xp_spending_frozen, xp_hold_reason, xp_hold_started_at'

let state: XpHoldState = INITIAL
let loaded = false
const listeners = new Set<() => void>()
let channel: RealtimeChannel | null = null
let channelClient: SupabaseClient | null = null

function set(next: XpHoldState) {
  state = next
  listeners.forEach(l => l())
}

interface HoldRow { id?: string; xp_spending_frozen?: boolean | null; xp_hold_reason?: string | null; xp_hold_started_at?: string | null }

function fromRow(row: HoldRow): XpHoldState {
  return {
    id: row.id ?? state.id,
    frozen: row.xp_spending_frozen === true,
    reason: row.xp_hold_reason?.trim() || null,
    startedAt: row.xp_hold_started_at ?? null,
    loading: false,
    unknown: false,
  }
}

async function readHold(supabase: SupabaseClient): Promise<XpHoldState> {
  const { data, error } = await supabase.from('campaign_settings').select(COLUMNS).limit(1).single()
  if (error || !data) {
    // Fail closed: keep the last known value, otherwise treat as frozen.
    return loaded ? { ...state, loading: false } : { ...INITIAL, frozen: true, loading: false, unknown: true }
  }
  return fromRow(data as HoldRow)
}

async function refresh(supabase: SupabaseClient) {
  const next = await readHold(supabase)
  loaded = !next.unknown
  set(next)
}

function start() {
  const supabase = createClient()
  channelClient = supabase
  void refresh(supabase)
  channel = supabase
    .channel('xp-hold')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_settings' }, payload => {
      const row = payload.new as HoldRow | undefined
      if (row && 'xp_spending_frozen' in row) { loaded = true; set(fromRow(row)) }
    })
    // Re-read on (re)subscribe so a change made while disconnected is never missed.
    .subscribe(status => { if (status === 'SUBSCRIBED') void refresh(supabase) })
}

function stop() {
  if (channel && channelClient) void channelClient.removeChannel(channel)
  channel = null
  channelClient = null
  loaded = false
  state = INITIAL
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) start()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}

/** Live hold state. Mount it wherever the hold has to show; all callers share one read and one channel. */
export function useXpHold(): XpHoldState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL)
}

/**
 * Purchase guard: true (and toasts) when spending is paused. Uses the live store when a consumer is mounted,
 * otherwise a fresh read. Fails closed on a read error. Call before any optimistic update.
 */
export async function xpSpendingBlocked(supabase: SupabaseClient): Promise<boolean> {
  const hold = loaded && listeners.size > 0 ? state : await readHold(supabase)
  if (!hold.frozen) return false
  toast.error(XP_FROZEN_MESSAGE)
  return true
}

/**
 * Persist the XP debit FIRST, before any acquisition row is written, so a rejected debit never leaves a free item behind.
 * Returns false (and toasts) when the database refuses: the hold (`XP_HOLD`), RLS, or any error. The caller then rolls back
 * its optimistic update and skips the inserts.
 */
export async function persistXpDebit(
  supabase: SupabaseClient, characterId: string, patch: Record<string, unknown>,
): Promise<boolean> {
  const { data, error } = await supabase.from('characters').update(patch).eq('id', characterId).select('id')
  if (!error && data && data.length > 0) return true
  toast.error(error?.message?.includes(XP_HOLD_DB_MARKER) ? XP_FROZEN_MESSAGE : 'Purchase failed, nothing was spent')
  return false
}

/** GM control: flip the hold. Returns an error message, or null on success. Targets the single row by id. */
export async function setXpHold(
  supabase: SupabaseClient, id: string, frozen: boolean, reason: string,
): Promise<string | null> {
  const trimmed = reason.trim()
  const patch = frozen
    ? { xp_spending_frozen: true, xp_hold_reason: trimmed || null, xp_hold_started_at: new Date().toISOString() }
    : { xp_spending_frozen: false, xp_hold_started_at: null } // keep the reason text for reuse
  const { data, error } = await supabase.from('campaign_settings').update(patch).eq('id', id).select(COLUMNS)
  if (error || !data?.length) return 'Could not change the XP hold.'
  loaded = true
  set(fromRow(data[0] as HoldRow))
  return null
}
