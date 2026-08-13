'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Tuck/peek + discard-pile state for the player hand-of-cards.
 *
 * character_hand_state (migration 118) has three player-writable fields;
 * H2 wired is_tucked read-only, H3 added a real write path for
 * discarded_keys, a later prompt added the twin write path for is_tucked
 * (rail-toggle tuck control). H8 adds the last one: card_order, written once
 * per completed drag-reorder via `reorderCards` — same commit shape as
 * discardCard/returnCard/toggleTucked, reusing queueRef/orderRef exactly as
 * discardedRef/queueRef already do (see that pattern's own comment below).
 *
 * A character with no row is valid default state (tucked=false,
 * discarded=[]), not an error — the SELECT simply returns no rows, treated
 * identically to a row with those defaults.
 *
 * Race safety: two rapid discards must not let the second write's stale
 * closure clobber the first. Uses the same promise-chain-queue pattern as
 * InitiativeRollModal.tsx's resolvePendingAction (queueRef.current =
 * queueRef.current.then(...)) — React state is not a synchronous mutex, so
 * two handlers firing within the same tick could otherwise both read the
 * pre-update array and race an UPDATE. The queue alone isn't sufficient
 * either: it only serializes WHEN writes run, not WHAT they write. The fix is
 * pairing it with a ref (discardedRef) that every handler updates
 * synchronously BEFORE enqueueing, so each queued write reads the ref's
 * CURRENT value at write time — by the time a second rapid discard's write
 * actually executes, the ref already reflects both changes, so even though
 * the first write is superseded, the row lands in the correct final state
 * (proven live: two rapid discards, one reload, both keys present — H3).
 */
export function useHandState(characterId: string | undefined, supabase: SupabaseClient) {
  const [tucked, setTuckedState] = useState(false)
  const [discardedKeys, setDiscardedKeysState] = useState<string[]>([])
  const [cardOrder, setCardOrderState] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  const discardedRef = useRef<string[]>([])
  const orderRef = useRef<string[]>([])
  const [handPlacedKeys, setHandPlacedKeysState] = useState<string[]>([])
  const handPlacedRef = useRef<string[]>([])
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    if (!characterId) return
    let cancelled = false
    supabase
      .from('character_hand_state')
      .select('is_tucked, discarded_keys, card_order, hand_placed_keys')
      .eq('character_id', characterId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setTuckedState(data?.is_tucked ?? false)
        const keys = Array.isArray(data?.discarded_keys) ? (data.discarded_keys as string[]) : []
        discardedRef.current = keys
        setDiscardedKeysState(keys)
        const order = Array.isArray(data?.card_order) ? (data.card_order as string[]) : []
        orderRef.current = order
        setCardOrderState(order)
        const placed = Array.isArray(data?.hand_placed_keys) ? (data.hand_placed_keys as string[]) : []
        handPlacedRef.current = placed
        setHandPlacedKeysState(placed)
        setLoaded(true)
      })
    return () => { cancelled = true }
  }, [characterId, supabase])

  /**
   * Optimistic local update + queued, ref-sourced persist. `mutate` receives
   * the CURRENT array and returns the next one (add/remove a key) — kept as a
   * pure function so the ref-read/write pairing below stays correct
   * regardless of how many calls are already queued.
   */
  function commitDiscardedKeys(mutate: (prev: string[]) => string[]) {
    if (!characterId) return
    const next = mutate(discardedRef.current)
    discardedRef.current = next
    setDiscardedKeysState(next)

    queueRef.current = queueRef.current.then(async () => {
      // Reads discardedRef.current (not `next`, not a closed-over snapshot)
      // so a write queued behind an earlier one still persists the LATEST
      // state, even though it was computed from a `next` value later calls
      // may have already superseded.
      await supabase
        .from('character_hand_state')
        .upsert(
          { character_id: characterId, discarded_keys: discardedRef.current, updated_at: new Date().toISOString() },
          { onConflict: 'character_id' },
        )
    })
  }

  function discardCard(key: string) {
    commitDiscardedKeys(prev => (prev.includes(key) ? prev : [...prev, key]))
  }
  function returnCard(key: string) {
    commitDiscardedKeys(prev => prev.filter(k => k !== key))
  }

  function commitHandPlacedKeys(mutate: (prev: string[]) => string[]) {
    if (!characterId) return
    const next = mutate(handPlacedRef.current)
    handPlacedRef.current = next
    setHandPlacedKeysState(next)

    queueRef.current = queueRef.current.then(async () => {
      await supabase
        .from('character_hand_state')
        .upsert(
          { character_id: characterId, hand_placed_keys: handPlacedRef.current, updated_at: new Date().toISOString() },
          { onConflict: 'character_id' },
        )
    })
  }

  function placeCard(key: string) {
    commitHandPlacedKeys(prev => (prev.includes(key) ? prev : [...prev, key]))
  }
  function unplaceCard(key: string) {
    commitHandPlacedKeys(prev => prev.filter(k => k !== key))
  }

  // Rail-toggle-driven tuck state — deliberate/discoverable now that it lives
  // in the rail (was deferred write-back while it was a corner button local
  // to HandOverlay). Same optimistic-then-persist shape as discardCard.
  function toggleTucked() {
    if (!characterId) return
    const next = !tucked
    setTuckedState(next)
    queueRef.current = queueRef.current.then(async () => {
      await supabase
        .from('character_hand_state')
        .upsert(
          { character_id: characterId, is_tucked: next, updated_at: new Date().toISOString() },
          { onConflict: 'character_id' },
        )
    })
  }

  // H8 — card_order, written once per completed drag-reorder (not per pixel
  // of live-shuffle — the caller only invokes this on drop). Same ref-then-
  // enqueue shape as commitDiscardedKeys: `next` is written to orderRef/state
  // synchronously so a queued write always reads the LATEST order at execute
  // time, so two reorders dropped back-to-back with no settle wait between
  // them still land in the correct final order — proven live, not assumed
  // (see docs/architecture.md's H8 entry for the direct-SQL-read proof).
  function reorderCards(next: string[]) {
    if (!characterId) return
    orderRef.current = next
    setCardOrderState(next)
    queueRef.current = queueRef.current.then(async () => {
      await supabase
        .from('character_hand_state')
        .upsert(
          { character_id: characterId, card_order: orderRef.current, updated_at: new Date().toISOString() },
          { onConflict: 'character_id' },
        )
    })
  }

  return { tucked, discardedKeys, cardOrder, handPlacedKeys, loaded, discardCard, returnCard, toggleTucked, reorderCards, placeCard, unplaceCard }
}
