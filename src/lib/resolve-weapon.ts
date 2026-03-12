/**
 * Shared weapon display resolver for both GM (CombatPanel) and player (CombatTracker).
 *
 * Problems it solves:
 *  1. Adversaries.json stores weapons as plain name strings — `parseWeaponString` always
 *     produces `damage: 0` for name-only entries.
 *  2. ref_weapons.range_value is stored with a "wr" prefix ("wrMedium", "wrShort", etc.).
 *  3. Some generic weapon names don't exist in ref_weapons at all.
 *  4. Brawn-based damage should resolve to an actual number.
 */

import type { AdversaryWeapon } from './adversaries'

// Static fallback for common generic names not in ref_weapons
// Format: { dmg: fixed damage } or { brawn: bonus added to brawn stat }
const FALLBACK: Record<string, { dmg?: number; brawn?: number; range?: string }> = {
  'brawl':                   { brawn: 0, range: 'Engaged' },
  'fists':                   { brawn: 0, range: 'Engaged' },
  'enhanced fists':          { brawn: 1, range: 'Engaged' },
  'iron-hard fists':         { brawn: 1, range: 'Engaged' },
  'meaty fists':             { brawn: 1, range: 'Engaged' },
  'mechanical fists':        { brawn: 1, range: 'Engaged' },
  'metal fists':             { brawn: 1, range: 'Engaged' },
  'stone fists':             { brawn: 1, range: 'Engaged' },
  'pummeling fists':         { brawn: 1, range: 'Engaged' },
  'unarmed combat':          { brawn: 0, range: 'Engaged' },
  'unarmed martial attack':  { brawn: 0, range: 'Engaged' },
  'claws':                   { brawn: 1, range: 'Engaged' },
  'claws and teeth':         { brawn: 1, range: 'Engaged' },
  'claws and fangs':         { brawn: 1, range: 'Engaged' },
  'teeth and claws':         { brawn: 1, range: 'Engaged' },
  'teeth':                   { brawn: 0, range: 'Engaged' },
  'bite':                    { brawn: 0, range: 'Engaged' },
  'vicious bite':            { brawn: 1, range: 'Engaged' },
  'massive bite':            { brawn: 2, range: 'Engaged' },
  'fangs':                   { brawn: 1, range: 'Engaged' },
  'knife':                   { brawn: 1, range: 'Engaged' },
  'combat knife':            { brawn: 1, range: 'Engaged' },
  'hunting knife':           { brawn: 1, range: 'Engaged' },
  'makeshift knife':         { brawn: 1, range: 'Engaged' },
  'vibroblade':              { brawn: 1, range: 'Engaged' },
  'combat vibroblade':       { brawn: 1, range: 'Engaged' },
  'two vibroblades':         { brawn: 1, range: 'Engaged' },
  'vibrorapier':             { brawn: 1, range: 'Engaged' },
  'vibrosaw':                { brawn: 2, range: 'Engaged' },
  'vibroknucklers':          { brawn: 1, range: 'Engaged' },
  'vibroknuckles':           { brawn: 1, range: 'Engaged' },
  'gaffi stick':             { brawn: 2, range: 'Engaged' },
  'staff':                   { brawn: 1, range: 'Engaged' },
  'security staff':          { brawn: 1, range: 'Engaged' },
  'truncheon':               { brawn: 1, range: 'Engaged' },
  'shock truncheon':         { brawn: 1, range: 'Engaged' },
  'electrostaff':            { brawn: 2, range: 'Engaged' },
  'force pike':              { brawn: 2, range: 'Engaged' },
  'spear':                   { brawn: 1, range: 'Engaged' },
  'lightsaber':              { dmg: 10, range: 'Engaged' },
  'double-bladed lightsaber':{ dmg: 10, range: 'Engaged' },
  'double bladed lightsaber':{ dmg: 10, range: 'Engaged' },
  'training lightsaber':     { dmg: 7, range: 'Engaged' },
  'frag grenade':            { dmg: 8, range: 'Short' },
  'stun grenade':            { dmg: 8, range: 'Short' },
  'ion grenade':             { dmg: 7, range: 'Short' },
  'thermal detonator':       { dmg: 20, range: 'Short' },
  'smoke grenade':           { dmg: 0, range: 'Short' },
  'bowcaster':               { dmg: 10, range: 'Medium' },
  'blaster pistol':          { dmg: 6, range: 'Medium' },
  'heavy blaster pistol':    { dmg: 7, range: 'Medium' },
  'light blaster pistol':    { dmg: 5, range: 'Medium' },
  'holdout blaster':         { dmg: 5, range: 'Short' },
  'blaster carbine':         { dmg: 9, range: 'Medium' },
  'blaster rifle':           { dmg: 9, range: 'Long' },
  'heavy blaster rifle':     { dmg: 10, range: 'Long' },
  'repeating blaster':       { dmg: 11, range: 'Long' },
  'light repeating blaster': { dmg: 9, range: 'Medium' },
  'slugthrower pistol':      { dmg: 4, range: 'Short' },
  'slugthrower rifle':       { dmg: 7, range: 'Medium' },
  'sniper rifle':            { dmg: 10, range: 'Extreme' },
  'disruptor pistol':        { dmg: 10, range: 'Short' },
  'disruptor rifle':         { dmg: 10, range: 'Long' },
  'stun blaster':            { dmg: 8, range: 'Short' },
  'stun pistol':             { dmg: 6, range: 'Short' },
  'ion blaster':             { dmg: 5, range: 'Short' },
  'flamethrower':            { dmg: 8, range: 'Short' },
  'flame projector':         { dmg: 7, range: 'Short' },
  'missile launcher':        { dmg: 20, range: 'Long' },
  'rocket launcher':         { dmg: 20, range: 'Long' },
  'throw':                   { brawn: 0, range: 'Short' },
  'tail':                    { brawn: 0, range: 'Engaged' },
  'tail whip':               { brawn: 1, range: 'Engaged' },
  'stomp':                   { brawn: 2, range: 'Engaged' },
  'trample':                 { brawn: 2, range: 'Engaged' },
  'headbutt':                { brawn: 0, range: 'Engaged' },
  'horns':                   { brawn: 1, range: 'Engaged' },
  'tusks':                   { brawn: 2, range: 'Engaged' },
  'stinger':                 { brawn: 0, range: 'Engaged' },
  'spine':                   { brawn: 0, range: 'Engaged' },
}

// Strip OggDude "wr" prefix from range_value (e.g. "wrMedium" → "Medium")
function cleanRange(raw: string | null | undefined): string {
  if (!raw) return 'Engaged'
  return raw.replace(/^wr/i, '')
}

export interface WeaponRef {
  damage: number
  damage_add: number | null
  range_value: string | null
}

export function resolveWeapon(
  w: AdversaryWeapon,
  brawn: number,
  weaponRef: Record<string, WeaponRef>,
): { dmg: string; range: string } {
  const key = w.name.toLowerCase()

  // 1. If weapon already has explicit non-zero numeric damage, use it
  if (typeof w.damage === 'number' && w.damage !== 0) {
    const range = (w.range && w.range !== 'Engaged')
      ? w.range
      : cleanRange((weaponRef[key] ?? FALLBACK[key] as never)?.range_value ?? FALLBACK[key]?.range ?? w.range)
    return { dmg: String(w.damage), range }
  }

  // 2. If weapon has a Brawn-based string (e.g. "Brawn+2"), resolve to number
  if (typeof w.damage === 'string') {
    const m = w.damage.match(/^Brawn([+-]\d+)$/i)
    if (m) {
      const range = (w.range && w.range !== 'Engaged')
        ? w.range
        : cleanRange(weaponRef[key]?.range_value ?? FALLBACK[key]?.range ?? w.range)
      return { dmg: String(brawn + parseInt(m[1])), range }
    }
  }

  // 3. Try ref_weapons lookup (damage = 0 — plain name string from adversaries.json)
  const ref = weaponRef[key]
  if (ref) {
    const dmg = (ref.damage_add != null && ref.damage_add !== 0)
      ? String(brawn + ref.damage_add)
      : String(ref.damage)
    const range = cleanRange(ref.range_value) || (w.range !== 'Engaged' ? w.range : 'Engaged')
    return { dmg, range }
  }

  // 4. Static fallback for common generic names
  const fb = FALLBACK[key]
  if (fb) {
    const dmg = fb.dmg !== undefined ? String(fb.dmg) : String(brawn + (fb.brawn ?? 0))
    const range = fb.range ?? w.range ?? 'Engaged'
    return { dmg, range }
  }

  // 5. Truly unknown
  return { dmg: '?', range: w.range ?? 'Engaged' }
}
