'use client'

import { useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { PendingAction, PendingActionType } from './usePendingActions'

export interface UseGmBroadcastReturn {
  notify:     (charId: string, type: 'toast' | 'dialog', message: string) => void
  sendToChar: (charId: string, payload: Record<string, unknown>) => void
  broadcastAll: (payload: Record<string, unknown>, characters: Character[]) => void
}

export function useGmBroadcast(characters: Character[]): UseGmBroadcastReturn {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])
  const gmChannelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map())

  // Add channels for new characters only — never destroy on re-render to avoid
  // the race where channels are unsubscribed when a broadcast is sent.
  useEffect(() => {
    const map = gmChannelsRef.current
    for (const c of characters) {
      if (!map.has(c.id)) {
        const ch = supabase.channel(`gm-notify-${c.id}`)
        ch.subscribe()
        map.set(c.id, ch)
      }
    }
  }, [characters, supabase])

  // Destroy channels only on unmount
  useEffect(() => {
    const map = gmChannelsRef.current
    return () => {
      for (const [, ch] of map) supabase.removeChannel(ch)
      map.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notify = useCallback((charId: string, type: 'toast' | 'dialog', message: string) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload: { type, message } })
  }, [])

  const sendToChar = useCallback((charId: string, payload: Record<string, unknown>) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
  }, [])

  const broadcastAll = useCallback((payload: Record<string, unknown>, chars: Character[]) => {
    for (const c of chars) {
      const ch = gmChannelsRef.current.get(c.id)
      if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
    }
  }, [])

  return { notify, sendToChar, broadcastAll }
}

// ── Pending-action queue writer (migration 117) ───────────────────────────────

export interface CreatePendingActionInput {
  campaignId:  string
  characterId: string
  actionType:  PendingActionType
  payload?:    Record<string, unknown>
  /**
   * Idempotency key — usually the originating row's id (destiny_pool.id,
   * critical_injury_requests.id) or an encounter/round identifier. Two requests
   * sharing one source_ref cannot both be outstanding at once. Omit it and no
   * deduplication happens: the partial unique index treats NULLs as distinct,
   * matching Postgres semantics.
   */
  sourceRef?:  string | null
  isBlocking?: boolean
}

export interface CreatePendingActionResult {
  /** The live pending row — freshly created, or the one that already existed. */
  action:    PendingAction | null
  /** True when an outstanding row already covered this request. */
  duplicate: boolean
  error:     string | null
}

/**
 * Creates a durable pending action for a player decision.
 *
 * Sits alongside `sendToChar` deliberately: the broadcast stays as the instant
 * delivery path, this is the durable one. A GM action fires both — the popup
 * appears immediately for a connected player, and the row survives a dropped
 * socket, a reload, or a browser that suspended its WebSocket.
 *
 * Re-firing a request that is still outstanding is a no-op, not an error. The
 * GM pressing "Request Rolls" twice, or a per-card retry after a global
 * request, must not queue the same decision twice — the DB's partial unique
 * index (`uq_pending_actions_open`) enforces that and the 23505 it raises is
 * absorbed here.
 */
export async function createPendingAction({
  campaignId,
  characterId,
  actionType,
  payload    = {},
  sourceRef  = null,
  isBlocking = false,
}: CreatePendingActionInput): Promise<CreatePendingActionResult> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pending_actions')
    .insert({
      campaign_id:  campaignId,
      character_id: characterId,
      action_type:  actionType,
      payload,
      source_ref:   sourceRef,
      is_blocking:  isBlocking,
    })
    .select()
    .single()

  if (!error) return { action: data as PendingAction, duplicate: false, error: null }

  // 23505 = unique_violation. One is already outstanding; hand that row back so
  // the caller can still reference it (e.g. to re-broadcast against the same id).
  if (error.code === '23505') {
    const { data: existing } = await supabase
      .from('pending_actions')
      .select('*')
      .eq('character_id', characterId)
      .eq('action_type',  actionType)
      .eq('status',       'pending')
      .eq('source_ref',   sourceRef as string)
      .maybeSingle()
    return { action: (existing as PendingAction) ?? null, duplicate: true, error: null }
  }

  console.warn('[createPendingAction] failed:', error.message)
  return { action: null, duplicate: false, error: error.message }
}

/**
 * Cancels an outstanding action — the GM aborting a request (the durable
 * counterpart to the existing `destiny-roll-cancel` broadcast, which only
 * clears client state today). Releases the partial unique index so the same
 * `source_ref` can be requested again.
 */
export async function cancelPendingAction(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pending_actions')
    .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
  if (error) console.warn('[cancelPendingAction] failed:', error.message)
}

/**
 * Campaign-wide sweep — cancels every outstanding row of one action type,
 * optionally narrowed to a single setup session via `sourceRef`.
 *
 * Exists for the invalidation paths that have no row ids in scope. `endEncounter`
 * is the motivating case: it runs in `useGmSession`, long after the setup modal
 * (and its session id) is gone, so the only available scope is the campaign.
 */
export async function cancelPendingActionsByType(
  campaignId: string,
  actionType: PendingActionType,
  sourceRef?: string,
): Promise<void> {
  const supabase = createClient()
  let q = supabase
    .from('pending_actions')
    .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('action_type', actionType)
    .eq('status', 'pending')
  if (sourceRef) q = q.eq('source_ref', sourceRef)
  const { error } = await q
  if (error) console.warn('[cancelPendingActionsByType] failed:', error.message)
}
