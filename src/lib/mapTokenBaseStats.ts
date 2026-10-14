import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchAdversaries, adversaryToInstance, dbRowToAdversary, type Adversary, type AdversaryInstance } from '@/lib/adversaries'
import { fetchVehicles, dbRowToVehicle, type Vehicle } from '@/lib/vehicles'

/**
 * Pre-combat base stats for the player map tooltip (desktop HudSessionTab and
 * mobile MobileMapDestination) — used when a token has no live encounter slot.
 *
 * Both maps are keyed by the TOKEN's label, not the library name. Two things
 * make those differ, and both used to leave a token on the "0/1, no pips"
 * last-resort tooltip:
 *   - Duplicate groups are auto-numbered ("Formos Few Hood 2"), which is not a
 *     library entry. Exact name wins; otherwise a trailing " <n>" is stripped.
 *   - GM-created custom entries live in ref_adversaries / ref_vehicles rows
 *     (snake_case columns), not the static JSON. They must go through
 *     dbRowToAdversary / dbRowToVehicle — casting the raw row leaves `wound`
 *     undefined.
 * Precedence is static JSON < global DB rows < this campaign's custom rows.
 */

const NUMBER_SUFFIX = /\s+\d+$/

/** Candidate library names for a token label: the label itself, then without a trailing " <n>". */
function candidateNames(label: string): string[] {
  const stripped = label.replace(NUMBER_SUFFIX, '')
  return stripped !== label && stripped ? [label, stripped] : [label]
}

/** Pick the entry for a label: exact name first, then the number-stripped name. */
function resolve<T>(byName: Map<string, T>, label: string): T | undefined {
  for (const n of candidateNames(label)) {
    const hit = byName.get(n)
    if (hit) return hit
  }
  return undefined
}

/**
 * Encounter instance behind a map token with no usable slot link, so pips and
 * wounds show the real `groupSize`/`woundsCurrent` (the library fallback's 4 is only an add-default).
 * Exact name/nickname wins over the number-stripped name ("Formos Few Hood 2"
 * is its own instance, not a copy of "Formos Few Hood"); instances on the
 * token's own map win ties. Slot ownership is deliberately NOT a filter: by
 * initiative every instance has a slot, and that excluded every real match.
 * Undefined when nothing matches - callers then show no pips, never a guess.
 */
export function findDeckInstance(
  adversaries: AdversaryInstance[] | undefined,
  label: string,
  mapId?: string | null,
): AdversaryInstance | undefined {
  const pool = adversaries ?? []
  for (const n of candidateNames(label)) {
    const hits = pool.filter(a => a.name === n || a.nickname === n)
    if (hits.length) return hits.find(a => a.map_id && a.map_id === mapId) ?? hits[0]
  }
  return undefined
}

export async function loadAdversaryBaseStats(
  supabase: SupabaseClient,
  campaignId: string | null | undefined,
  labels: string[],
): Promise<Map<string, AdversaryInstance>> {
  const names = [...new Set(labels.flatMap(candidateNames))]
  const [{ data: globalData }, { data: customData }, staticAdvs] = await Promise.all([
    supabase.from('ref_adversaries').select('*').in('name', names).is('campaign_id', null),
    campaignId
      ? supabase.from('ref_adversaries').select('*').in('name', names).eq('campaign_id', campaignId)
      : Promise.resolve({ data: [] as unknown[] }),
    fetchAdversaries(),
  ])
  const byName = new Map<string, Adversary>()
  for (const a of staticAdvs) if (names.includes(a.name)) byName.set(a.name, a)
  for (const row of [...(globalData ?? []), ...(customData ?? [])]) {
    const adv = dbRowToAdversary(row as Record<string, unknown>)
    byName.set(adv.name, adv)
  }
  const out = new Map<string, AdversaryInstance>()
  for (const label of labels) {
    const adv = resolve(byName, label)
    if (adv) out.set(label, adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1))
  }
  return out
}

export async function loadVehicleBaseStats(
  supabase: SupabaseClient,
  campaignId: string | null | undefined,
  labels: string[],
): Promise<Map<string, Vehicle>> {
  const names = [...new Set(labels.flatMap(candidateNames))]
  const [{ data: globalData }, { data: customData }, staticVehs] = await Promise.all([
    supabase.from('ref_vehicles').select('*').in('name', names).is('campaign_id', null),
    campaignId
      ? supabase.from('ref_vehicles').select('*').in('name', names).eq('campaign_id', campaignId)
      : Promise.resolve({ data: [] as unknown[] }),
    fetchVehicles(),
  ])
  const byName = new Map<string, Vehicle>()
  for (const v of staticVehs) if (names.includes(v.name)) byName.set(v.name, v)
  for (const row of [...(globalData ?? []), ...(customData ?? [])]) {
    const veh = dbRowToVehicle(row as Record<string, unknown>)
    byName.set(veh.name, veh)
  }
  const out = new Map<string, Vehicle>()
  for (const label of labels) {
    const veh = resolve(byName, label)
    if (veh) out.set(label, veh)
  }
  return out
}
