import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { fetchMoralitySystem, type MoralitySystem } from '@/lib/moralitySystem'
import { getRefData } from '@/lib/refDataCache'

/**
 * Character-sheet cold-load prefetch (Prompt A) — the exact same query batch
 * useCharacterData.loadCharacter() fires on mount, hoisted so it can be fired
 * the instant a character is clicked on the selection screen (src/app/page.tsx
 * handleCardSelect), instead of waiting ~5.6s for the hyperspace animation to
 * finish and the sheet to mount. That animation window is otherwise dead time.
 *
 * One-shot, characterId-keyed, in-flight-deduped: two near-simultaneous
 * callers for the same characterId share one request (same pattern as
 * refDataCache.ts's getRefData). consumeCharacterDataPrefetch() removes the
 * entry on read so a later realtime-triggered reload (useCharacterData's own
 * loadCharacter(true) path) never accidentally replays stale prefetched data —
 * it always falls through to a fresh fetchCharacterDataBatch() call instead.
 *
 * A prefetch nobody ever consumes (user clicked a different character, or
 * navigated away before the sheet mounted) is swept after 30s so a long GM
 * session clicking through many characters doesn't accumulate orphaned
 * promises. The 30s-orphaned promise's rejection (if any) is pre-handled via
 * `.catch(() => {})` the moment it's stored, so it can never surface as an
 * unhandled promise rejection — only a real *consumer* awaiting the same
 * promise reference sees a genuine failure.
 */

const inFlight = new Map<string, Promise<CharacterDataBatch>>()
const sweepTimers = new Map<string, ReturnType<typeof setTimeout>>()

const ORPHAN_SWEEP_MS = 30_000

async function fetchCharacterDataBatch(characterId: string) {
  const supabase = createClient()

  const [ds, ms] = await Promise.all([
    fetchActiveDataset(supabase),
    (async (): Promise<{ moralitySystem: MoralitySystem | null; moralitySystemError: string | null }> => {
      try {
        const value = await fetchMoralitySystem(supabase)
        return { moralitySystem: value, moralitySystemError: null }
      } catch (err) {
        console.error('[characterDataPrefetch] fetchMoralitySystem failed:', err)
        return { moralitySystem: null, moralitySystemError: err instanceof Error ? err.message : String(err) }
      }
    })(),
  ])

  const [refData, [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
    refWpnRes, refArmRes, refGearRes, refCritRes, refDescRes,
    refSpeciesRes, forceAbilRes, refFpRes, refFaRes, refWqRes, refAttRes,
    refOblTypesRes, refDutyTypesRes]] = await Promise.all([
    getRefData(ds),
    Promise.all([
      supabase.from('characters').select('*').eq('id', characterId).single(),
      supabase.from('character_skills').select('*').eq('character_id', characterId),
      supabase.from('character_talents').select('*').eq('character_id', characterId),
      supabase.from('character_weapons').select('*').eq('character_id', characterId).eq('is_dropped', false),
      supabase.from('character_armor').select('*').eq('character_id', characterId).eq('is_dropped', false),
      supabase.from('character_gear').select('*').eq('character_id', characterId).eq('is_dropped', false),
      supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
      supabase.from('character_specializations').select('*').eq('character_id', characterId),
      supabase.from('ref_weapons').select('*'),
      supabase.from('ref_armor').select('*'),
      supabase.from('ref_gear').select('*'),
      supabase.from('ref_critical_injuries').select('*').order('roll_min'),
      supabase.from('ref_item_descriptors').select('*'),
      supabase.from('ref_species').select('*'),
      supabase.from('character_force_abilities').select('*').eq('character_id', characterId),
      supabase.from('ref_force_powers').select('*').eq('dataset_source', ds).eq('is_retired', false),
      supabase.from('ref_force_abilities').select('*').eq('dataset_source', ds).eq('is_retired', false),
      supabase.from('ref_weapon_qualities').select('*'),
      supabase.from('ref_item_attachments').select('*'),
      supabase.from('ref_obligation_types').select('key, name'),
      supabase.from('ref_duty_types').select('key, name'),
    ]),
  ])

  return {
    ds, refData,
    moralitySystem: ms.moralitySystem, moralitySystemError: ms.moralitySystemError,
    charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes,
    refWpnRes, refArmRes, refGearRes, refCritRes, refDescRes,
    refSpeciesRes, forceAbilRes, refFpRes, refFaRes, refWqRes, refAttRes,
    refOblTypesRes, refDutyTypesRes,
  }
}

export type CharacterDataBatch = Awaited<ReturnType<typeof fetchCharacterDataBatch>>

/**
 * Fire-and-forget: kick off the sheet's full cold-load query batch for
 * `characterId` before the sheet has mounted. Never throws into the caller.
 * Safe to call more than once for the same id (idempotent — joins the
 * existing in-flight request, same contract as refDataCache.getRefData).
 */
export function prefetchCharacterData(characterId: string): void {
  if (inFlight.has(characterId)) return

  const promise = fetchCharacterDataBatch(characterId)
  // Pre-attach a silencing handler so an orphaned (never-consumed) prefetch
  // can't surface as an unhandled rejection — a real consumer awaiting this
  // same `promise` reference below still observes the actual failure.
  promise.catch(() => {})
  inFlight.set(characterId, promise)

  const timer = setTimeout(() => {
    inFlight.delete(characterId)
    sweepTimers.delete(characterId)
  }, ORPHAN_SWEEP_MS)
  sweepTimers.set(characterId, timer)
}

/**
 * One-shot read: returns the in-flight/settled prefetch promise for
 * `characterId` if one exists, and removes it so it can never be consumed
 * twice (a later realtime-triggered reload always re-fetches fresh instead of
 * replaying this). Returns null on a cache miss (direct URL entry, refresh,
 * back-navigation, or any other path that didn't go through the click
 * handler) — callers must fall back to fetchCharacterDataBatch() themselves.
 */
export function consumeCharacterDataPrefetch(characterId: string): Promise<CharacterDataBatch> | null {
  const promise = inFlight.get(characterId)
  if (!promise) return null
  inFlight.delete(characterId)
  const timer = sweepTimers.get(characterId)
  if (timer) { clearTimeout(timer); sweepTimers.delete(characterId) }
  return promise
}

export { fetchCharacterDataBatch }
