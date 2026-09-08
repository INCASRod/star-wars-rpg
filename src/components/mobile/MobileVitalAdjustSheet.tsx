'use client'

import { useEffect, useRef } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Character } from '@/lib/types'
import { MobileBottomSheet } from './MobileBottomSheet'

type VitalField = 'wound_current' | 'strain_current'

export interface MobileVitalAdjustSheetProps {
  field: VitalField | null
  onClose: () => void
  character: Character
  threshold: number
  supabase: SupabaseClient
  /**
   * Desktop's own mutator (`handleVitalAdjust`, useCharacterData.ts) — same
   * table (`characters`), same columns (`wound_current`/`strain_current`),
   * same `.eq('id', character.id)` condition, same `Math.max(0, ...)` floor,
   * same synchronous `setCharacter` for the instant header-cell update. Not
   * reimplemented — called through, with a read-fresh correction and a
   * promise-chain queue layered on top (Step 0, 3.1.1: desktop's own
   * version has neither, which this prompt's own instructions call out as a
   * gap to close for mobile specifically, given rapid tapping is the
   * expected combat-time usage here, not an edge case).
   */
  onVitalAdjust: (field: VitalField, delta: number) => Promise<void>
}

const FIELD_LABEL: Record<VitalField, string> = { wound_current: 'Wounds', strain_current: 'Strain' }

export function MobileVitalAdjustSheet({ field, onClose, character, threshold, supabase, onVitalAdjust }: MobileVitalAdjustSheetProps) {
  // Queue + latest-state refs — see the read-fresh-then-write note below.
  const queueRef = useRef<Promise<void>>(Promise.resolve())
  const characterRef = useRef(character)
  const onVitalAdjustRef = useRef(onVitalAdjust)
  useEffect(() => { characterRef.current = character }, [character])
  useEffect(() => { onVitalAdjustRef.current = onVitalAdjust }, [onVitalAdjust])

  if (!field) return null

  const current = character[field] ?? 0
  const over = current > threshold

  function enqueue(delta: number) {
    queueRef.current = queueRef.current.then(async () => {
      const f = field as VitalField
      // Read-fresh-then-write: re-select the row immediately before this
      // increment lands, so two near-simultaneous editors (the GM adjusting
      // the same character, or a second rapid tap outrunning the previous
      // one's own round trip) can't clobber each other — same fresh-read-
      // before-persist convention as purchaseTalent/handleBuySkill
      // (useCharacterData.ts). desktop's handleVitalAdjust computes its own
      // newValue from in-memory `character` alone; that gap is closed here
      // by adjusting the delta passed through to it so its internal
      // `Math.max(0, character[field] + delta)` lands on
      // `Math.max(0, freshValue + delta)` instead.
      const { data } = await supabase.from('characters').select(f).eq('id', characterRef.current.id).single()
      const freshValue = (data as Record<string, number> | null)?.[f] ?? characterRef.current[f] ?? 0
      const localValue = characterRef.current[f] ?? 0
      const correctingDelta = delta + (freshValue - localValue)
      await onVitalAdjustRef.current(f, correctingDelta)
    })
  }

  return (
    <MobileBottomSheet open={!!field} onClose={onClose} collapsedHeight="46dvh" expandedHeight="46dvh">
      <div className="m-vital-reading">
        <div className={`m-vital-reading-value${over ? ' is-over' : ''}`}>{Math.max(0, current)}</div>
        <div className="m-vital-reading-threshold">/ {threshold} {FIELD_LABEL[field]}</div>
      </div>

      {over && (
        <div className="m-vital-over-note">
          {Math.max(0, current) - threshold} over threshold.
        </div>
      )}

      <div className="m-vital-btn-row">
        <button type="button" className="m-vital-btn is-decrement" onClick={() => enqueue(-5)} aria-label={`${FIELD_LABEL[field]} minus 5`}>−5</button>
        <button type="button" className="m-vital-btn is-decrement" onClick={() => enqueue(-1)} aria-label={`${FIELD_LABEL[field]} minus 1`}>−1</button>
        <button type="button" className="m-vital-btn is-increment" onClick={() => enqueue(1)} aria-label={`${FIELD_LABEL[field]} plus 1`}>+1</button>
        <button type="button" className="m-vital-btn is-increment" onClick={() => enqueue(5)} aria-label={`${FIELD_LABEL[field]} plus 5`}>+5</button>
      </div>
    </MobileBottomSheet>
  )
}
