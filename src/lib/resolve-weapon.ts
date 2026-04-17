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
// Format: { dmg: fixed damage } or { brawn: bonus added to brawn stat }, optional crit
const FALLBACK: Record<string, { dmg?: number; brawn?: number; range?: string; crit?: number }> = {
  'brawl':                   { brawn: 0, range: 'Engaged', crit: 5 },
  'fists':                   { brawn: 0, range: 'Engaged', crit: 5 },
  'enhanced fists':          { brawn: 1, range: 'Engaged', crit: 5 },
  'iron-hard fists':         { brawn: 1, range: 'Engaged', crit: 5 },
  'meaty fists':             { brawn: 1, range: 'Engaged', crit: 5 },
  'mechanical fists':        { brawn: 1, range: 'Engaged', crit: 5 },
  'metal fists':             { brawn: 1, range: 'Engaged', crit: 5 },
  'stone fists':             { brawn: 1, range: 'Engaged', crit: 5 },
  'pummeling fists':         { brawn: 1, range: 'Engaged', crit: 5 },
  'unarmed combat':          { brawn: 0, range: 'Engaged', crit: 5 },
  'unarmed martial attack':  { brawn: 0, range: 'Engaged', crit: 5 },
  'claws':                   { brawn: 1, range: 'Engaged', crit: 3 },
  'claws and teeth':         { brawn: 1, range: 'Engaged', crit: 3 },
  'claws and fangs':         { brawn: 1, range: 'Engaged', crit: 3 },
  'teeth and claws':         { brawn: 1, range: 'Engaged', crit: 3 },
  'teeth':                   { brawn: 0, range: 'Engaged', crit: 4 },
  'bite':                    { brawn: 0, range: 'Engaged', crit: 4 },
  'vicious bite':            { brawn: 1, range: 'Engaged', crit: 3 },
  'massive bite':            { brawn: 2, range: 'Engaged', crit: 3 },
  'fangs':                   { brawn: 1, range: 'Engaged', crit: 3 },
  'knife':                   { brawn: 1, range: 'Engaged', crit: 3 },
  'combat knife':            { brawn: 1, range: 'Engaged', crit: 3 },
  'hunting knife':           { brawn: 1, range: 'Engaged', crit: 3 },
  'makeshift knife':         { brawn: 1, range: 'Engaged', crit: 4 },
  'vibroblade':              { brawn: 1, range: 'Engaged', crit: 2 },
  'combat vibroblade':       { brawn: 1, range: 'Engaged', crit: 2 },
  'two vibroblades':         { brawn: 1, range: 'Engaged', crit: 2 },
  'vibrorapier':             { brawn: 1, range: 'Engaged', crit: 2 },
  'vibrosaw':                { brawn: 2, range: 'Engaged', crit: 2 },
  'vibroknucklers':          { brawn: 1, range: 'Engaged', crit: 3 },
  'vibroknuckles':           { brawn: 1, range: 'Engaged', crit: 3 },
  'gaffi stick':             { brawn: 2, range: 'Engaged', crit: 4 },
  'staff':                   { brawn: 1, range: 'Engaged', crit: 4 },
  'security staff':          { brawn: 1, range: 'Engaged', crit: 4 },
  'truncheon':               { brawn: 1, range: 'Engaged', crit: 4 },
  'shock truncheon':         { brawn: 1, range: 'Engaged', crit: 4 },
  'electrostaff':            { brawn: 2, range: 'Engaged', crit: 2 },
  'force pike':              { brawn: 2, range: 'Engaged', crit: 3 },
  'spear':                   { brawn: 1, range: 'Engaged', crit: 3 },
  'lightsaber':              { dmg: 10, range: 'Engaged', crit: 1 },
  'double-bladed lightsaber':{ dmg: 10, range: 'Engaged', crit: 1 },
  'double bladed lightsaber':{ dmg: 10, range: 'Engaged', crit: 1 },
  'training lightsaber':     { dmg: 7,  range: 'Engaged', crit: 2 },
  'frag grenade':            { dmg: 8,  range: 'Short',   crit: 4 },
  'stun grenade':            { dmg: 8,  range: 'Short' },
  'ion grenade':             { dmg: 7,  range: 'Short' },
  'thermal detonator':       { dmg: 20, range: 'Short',   crit: 2 },
  'smoke grenade':           { dmg: 0,  range: 'Short' },
  'bowcaster':               { dmg: 10, range: 'Medium',  crit: 3 },
  'blaster pistol':          { dmg: 6,  range: 'Medium',  crit: 3 },
  'heavy blaster pistol':    { dmg: 7,  range: 'Medium',  crit: 3 },
  'light blaster pistol':    { dmg: 5,  range: 'Medium',  crit: 4 },
  'holdout blaster':         { dmg: 5,  range: 'Short',   crit: 4 },
  'blaster carbine':         { dmg: 9,  range: 'Medium',  crit: 3 },
  'blaster rifle':           { dmg: 9,  range: 'Long',    crit: 3 },
  'heavy blaster rifle':     { dmg: 10, range: 'Long',    crit: 3 },
  'repeating blaster':       { dmg: 11, range: 'Long',    crit: 2 },
  'light repeating blaster': { dmg: 9,  range: 'Medium',  crit: 3 },
  'slugthrower pistol':      { dmg: 4,  range: 'Short',   crit: 5 },
  'slugthrower rifle':       { dmg: 7,  range: 'Medium',  crit: 5 },
  'sniper rifle':            { dmg: 10, range: 'Extreme', crit: 1 },
  'disruptor pistol':        { dmg: 10, range: 'Short',   crit: 2 },
  'disruptor rifle':         { dmg: 10, range: 'Long',    crit: 2 },
  'arc welder':              { dmg: 3,  range: 'Engaged' },
  'stun blaster':            { dmg: 8,  range: 'Short' },
  'stun pistol':             { dmg: 6,  range: 'Short' },
  'ion blaster':             { dmg: 10, range: 'Short',   crit: 5 },
  'flamethrower':            { dmg: 8,  range: 'Short' },
  'flame projector':         { dmg: 7,  range: 'Short' },
  'missile launcher':        { dmg: 20, range: 'Long',    crit: 2 },
  'rocket launcher':         { dmg: 20, range: 'Long',    crit: 2 },
  'throw':                   { brawn: 0, range: 'Short' },
  'tail':                    { brawn: 0, range: 'Engaged', crit: 5 },
  'tail whip':               { brawn: 1, range: 'Engaged', crit: 4 },
  'stomp':                   { brawn: 2, range: 'Engaged', crit: 4 },
  'trample':                 { brawn: 2, range: 'Engaged', crit: 4 },
  'headbutt':                { brawn: 0, range: 'Engaged', crit: 5 },
  'horns':                   { brawn: 1, range: 'Engaged', crit: 4 },
  'tusks':                   { brawn: 2, range: 'Engaged', crit: 3 },
  'stinger':                 { brawn: 0, range: 'Engaged', crit: 4 },
  'spine':                   { brawn: 0, range: 'Engaged', crit: 4 },
  // Adversary utility / exotic weapons
  'grs-1 snare rifle':             { dmg: 4, range: 'Long'    },
  'snare launcher':                { dmg: 0, range: 'Short'   },
  'built-in cleaning spray hose':  { dmg: 0, range: 'Short'   },
  'net gun':                       { dmg: 0, range: 'Short'   },
  'optical flare':                 { dmg: 0, range: 'Engaged' },
  'bag of sleeping powder':        { dmg: 0, range: 'Short'   },
  // Vehicle utility weapons (0 damage — tractor beams, tracers)
  // Keyed as lowercase OggDude weaponKey, matched after turret-suffix stripping below
  'tractlt':                       { dmg: 0, range: 'Close'   },
  'tractmed':                      { dmg: 0, range: 'Short'   },
  'tracthvy':                      { dmg: 0, range: 'Medium'  },
  'lttractcouple':                 { dmg: 0, range: 'Close'   },
  'xx23tracer':                    { dmg: 0, range: 'Medium'  },
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
  crit?: number | null
}

export function resolveWeapon(
  w: AdversaryWeapon,
  brawn: number,
  weaponRef: Record<string, WeaponRef>,
): { dmg: string; range: string; crit?: number } {
  // Normalise lookup key:
  //  • lowercase
  //  • strip vehicle count prefix   e.g. "2× LASERMED"  → "lasermed"
  //  • strip turret suffix           e.g. "TRACTLT (Turret)" → "tractlt"
  const key = w.name.toLowerCase()
    .replace(/^\d+×\s*/i, '')
    .replace(/\s*\(turret\)$/i, '')

  // Crit resolution: parsed value > ref_weapons > FALLBACK > undefined
  const resolvedCrit: number | undefined =
    w.crit !== undefined         ? w.crit
    : weaponRef[key]?.crit != null ? (weaponRef[key].crit as number)
    : FALLBACK[key]?.crit

  // 1. If weapon already has explicit non-zero numeric damage, use it
  if (typeof w.damage === 'number' && w.damage !== 0) {
    const range = (w.range && w.range !== 'Engaged')
      ? w.range
      : cleanRange((weaponRef[key] ?? FALLBACK[key] as never)?.range_value ?? FALLBACK[key]?.range ?? w.range)
    return { dmg: String(w.damage), range, ...(resolvedCrit !== undefined ? { crit: resolvedCrit } : {}) }
  }

  // 2. If weapon has a Brawn-based string (e.g. "Brawn+2"), resolve to number
  if (typeof w.damage === 'string') {
    const m = w.damage.match(/^Brawn([+-]\d+)$/i)
    if (m) {
      const range = (w.range && w.range !== 'Engaged')
        ? w.range
        : cleanRange(weaponRef[key]?.range_value ?? FALLBACK[key]?.range ?? w.range)
      return { dmg: String(brawn + parseInt(m[1])), range, ...(resolvedCrit !== undefined ? { crit: resolvedCrit } : {}) }
    }
  }

  // 3. Try ref_weapons lookup (damage = 0 — plain name string from adversaries.json)
  const ref = weaponRef[key]
  if (ref) {
    const dmg = (ref.damage_add != null && ref.damage_add !== 0)
      ? String(brawn + ref.damage_add)
      : String(ref.damage)
    const range = cleanRange(ref.range_value) || (w.range !== 'Engaged' ? w.range : 'Engaged')
    return { dmg, range, ...(resolvedCrit !== undefined ? { crit: resolvedCrit } : {}) }
  }

  // 4. Static fallback for common generic names
  const fb = FALLBACK[key]
  if (fb) {
    const dmg = fb.dmg !== undefined ? String(fb.dmg) : String(brawn + (fb.brawn ?? 0))
    const range = fb.range ?? w.range ?? 'Engaged'
    return { dmg, range, ...(resolvedCrit !== undefined ? { crit: resolvedCrit } : {}) }
  }

  // 5. Truly unknown — null/undefined damage means a utility weapon with no hull damage
  if (w.damage == null) {
    return { dmg: '—', range: w.range ?? 'Engaged' }
  }
  return { dmg: '?', range: w.range ?? 'Engaged' }
}
