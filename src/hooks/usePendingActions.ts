'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Pending action row (from DB, migration 117) ──────────────────────────────

export type PendingActionType =
  | 'initiative'
  | 'destiny_generate'
  | 'critical_injury'
  | 'conflict_ack'
  | 'vendor_offer'
  | 'loot_reveal'
  | 'gm_dialog'
  | 'force_rating_offer'

export type PendingActionStatus = 'pending' | 'resolved' | 'cancelled'

export interface PendingAction {
  id:             string
  campaign_id:    string
  character_id:   string
  action_type:    PendingActionType
  status:         PendingActionStatus
  is_blocking:    boolean
  payload:        Record<string, unknown>
  result_payload: Record<string, unknown> | null
  /** Idempotency key + pointer to the originating row (e.g. destiny_pool.id). */
  source_ref:     string | null
  created_at:     string
  resolved_at:    string | null
}

export interface UsePendingActionsResult {
  actions:       PendingAction[]
  count:         number
  blockingCount: number
  /**
   * Marks a row resolved and stores the decision's outcome. `resultPayload`
   * carries the actual result — for initiative that means the roll itself, not
   * merely a resolution flag: today those values exist only in `roll_log`
   * (append-only, display) and in `InitiativeSetupModal`'s transient React
   * state, so a GM reload loses them.
   */
  resolve:       (id: string, resultPayload?: Record<string, unknown>) => Promise<void>
}

/** Blocking first, then oldest first — the order the drawer will present them in. */
function sortActions(rows: PendingAction[]): PendingAction[] {
  return [...rows].sort((a, b) => {
    if (a.is_blocking !== b.is_blocking) return a.is_blocking ? -1 : 1
    return a.created_at.localeCompare(b.created_at)
  })
}

/**
 * Player-side view of this character's unresolved pending actions.
 *
 * Subscription shape follows `useCriticalInjuryRequest.ts`: an initial SELECT
 * for catch-up (the thing broadcast-only delivery cannot do), then a
 * `postgres_changes` subscription filtered by `character_id`, torn down with
 * `removeChannel` on unmount. `pending_actions` is REPLICA IDENTITY FULL, so
 * UPDATE/DELETE payloads carry the full row and that filter holds on every event.
 */
export function usePendingActions(
  characterId: string | undefined,
  supabase:    SupabaseClient,
): UsePendingActionsResult {
  const [actions, setActions] = useState<PendingAction[]>([])

  useEffect(() => {
    if (!characterId) {
      setActions([])
      return
    }

    let cancelled = false

    supabase
      .from('pending_actions')
      .select('*')
      .eq('character_id', characterId)
      .eq('status', 'pending')
      .order('is_blocking', { ascending: false })
      .order('created_at',  { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.warn('[usePendingActions] load failed:', error.message); return }
        if (!cancelled && data) setActions(data as PendingAction[])
      })

    const ch = supabase
      .channel(`pending-actions-${characterId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public',
        table: 'pending_actions',
        filter: `character_id=eq.${characterId}`,
      }, (payload) => {
        const row = payload.new as PendingAction | undefined
        const old = payload.old as { id?: string } | undefined

        if (payload.eventType === 'DELETE') {
          setActions(prev => prev.filter(a => a.id !== old?.id))
          return
        }
        if (!row) return

        setActions(prev => {
          // A row leaving 'pending' (resolved or cancelled) drops out of the list.
          if (row.status !== 'pending') return prev.filter(a => a.id !== row.id)
          const next = prev.some(a => a.id === row.id)
            ? prev.map(a => (a.id === row.id ? row : a))
            : [...prev, row]
          return sortActions(next)
        })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(ch)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  const resolve = useCallback(async (id: string, resultPayload?: Record<string, unknown>) => {
    // Optimistic — realtime will confirm, and the row is filtered out either way.
    setActions(prev => prev.filter(a => a.id !== id))

    const { error } = await supabase
      .from('pending_actions')
      .update({
        status:         'resolved',
        resolved_at:    new Date().toISOString(),
        result_payload: resultPayload ?? null,
      })
      .eq('id', id)
      .eq('status', 'pending')

    if (error) console.warn('[usePendingActions] resolve failed:', error.message)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const blockingCount = useMemo(() => actions.filter(a => a.is_blocking).length, [actions])

  return { actions, count: actions.length, blockingCount, resolve }
}
