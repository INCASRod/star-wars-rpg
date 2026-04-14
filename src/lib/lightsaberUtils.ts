/**
 * Holocron — Lightsaber Characteristic Resolution
 *
 * Single source of truth for determining which characteristic drives a Lightsaber
 * combat check for a given attacker (adversary or PC).
 *
 * FFG Rule: Lightsaber is linked to Brawn by default. Several Form talents allow
 * a character to substitute a different characteristic:
 *   Soresu Technique  → Intellect
 *   Makashi Technique → Presence
 *   Shien Technique   → Cunning
 *   Niman Technique   → Willpower
 *   Saber Swarm       → Agility (only when the Saber Swarm maneuver is active)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE B BRIEF — Combat Check Overlay Changes (NOT YET IMPLEMENTED)
 *
 * When Phase B is implemented, the following changes are needed in
 * src/components/combat-check/steps/DicePoolReviewStep.tsx and the surrounding
 * orchestration in CombatCheckOverlay.tsx:
 *
 * 1. ATTACKER CHARACTERISTIC OVERRIDE
 *    Currently: `refSkill.characteristic_key` is used as-is (always BR for LTSABER).
 *    Change: Before building the dice pool, call `getEffectiveLightsaberCharacteristic(attacker)`.
 *    If it returns a key other than 'BR', substitute that characteristic value
 *    instead of `character.brawn` when computing the proficiency/ability split.
 *    Dependency: attacker must be typed as AdversaryInstance | Character so the
 *    function can read `characteristicOverrides` (adversary) or `talents` (PC).
 *
 * 2. DEFENDER IS WIELDING A LIGHTSABER — OPPOSED MELEE
 *    Currently: The opposed Melee check difficulty is built from the defender's
 *    Melee skill rank + Brawn (via getMeleeDifficulty).
 *    Change: When the defender's active/equipped weapon is a Lightsaber-category
 *    weapon, switch from getMeleeDifficulty to a new getLightsaberDefenseDifficulty
 *    function that reads the defender's effective Lightsaber characteristic via
 *    getEffectiveLightsaberCharacteristic and uses that characteristic + Lightsaber rank.
 *    Risk: "active weapon" state for adversaries is not currently tracked — only
 *    for PCs. The defender's weapon type must be inferred from their equipped weapon
 *    or from their skills (does their skillRanks include 'Lightsaber'?).
 *
 * 3. LIGHTSABER vs. LIGHTSABER (both attacker and defender wield lightsabers)
 *    Change: The RangeBandStep already shows "vs. Melee Skill" for engaged melee.
 *    The difficulty pool must use the defender's Lightsaber skill (not Melee) and
 *    the defender's effective characteristic from getEffectiveLightsaberCharacteristic.
 *    This is an extension of point 2 — detect Lightsaber attacker + Lightsaber defender
 *    and route through the Lightsaber-vs-Lightsaber path.
 *
 * DEFENDER STATE NEEDED:
 *   - `target.skillRanks['Lightsaber']` — rank
 *   - `target.characteristicOverrides?.['Lightsaber']` — adversary override
 *   - `target.talents` — for PC technique talent detection
 *   - `target.weapons` / equipped weapon category — to detect "is wielding lightsaber"
 *
 * DEPENDENCY CHAIN:
 *   CombatCheckOverlay (top-level state)
 *     → target (AdversaryInstance | pc-stub) — already passed as prop
 *     → attacker weapon / skill (already available via `weapon.skillKey`)
 *     → getEffectiveLightsaberCharacteristic(attacker) — new call
 *     → getEffectiveLightsaberCharacteristic(target) — new call for defense pool
 *     → DicePoolReviewStep receives `effectiveCharKey` override prop
 *
 * RISKS:
 *   - Saber Swarm is turn-based (maneuver must have been taken this turn). There is
 *     no current per-turn action tracking for PCs in the overlay. Simplest approach:
 *     treat Saber Swarm as always-on for Phase B and revisit when action tracking lands.
 *   - Custom adversaries that were saved before this change have no `characteristic_overrides`
 *     in the DB — they will default to Brawn (correct default, no data loss).
 *   - The PC talents SORESUTECH etc. are not yet seeded in the `character_talents` table
 *     with the exact key strings. Phase B must verify keys before reading them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AdversaryInstance } from './adversaries'

/** Short characteristic key type used throughout the app. */
export type CharKey = 'BR' | 'AGI' | 'INT' | 'CUN' | 'WIL' | 'PR'

/**
 * Talent key → characteristic substitution for Lightsaber.
 * Priority order: Soresu > Makashi > Shien > Niman > (Saber Swarm treated as Agility).
 * Saber Swarm is included for completeness; Phase B may add an `activeTalents` param
 * to handle the "maneuver must be active" requirement.
 */
const LIGHTSABER_TECHNIQUE_MAP: Record<string, CharKey> = {
  'SORESUTECH': 'INT',  // Form III — Soresu: Intellect
  'MAKTECH':    'PR',   // Form II — Makashi: Presence
  'SHIENTECH':  'CUN',  // Form V (Shien variant): Cunning
  'NIMTECH':    'WIL',  // Form VI — Niman: Willpower
  'SABERSW':    'AGI',  // Saber Swarm: Agility (maneuver-activated; treated as always-on here)
}

/** Priority order for technique talent resolution. */
const TECHNIQUE_PRIORITY: (keyof typeof LIGHTSABER_TECHNIQUE_MAP)[] = [
  'SORESUTECH', 'MAKTECH', 'SHIENTECH', 'NIMTECH', 'SABERSW',
]

/** Minimal shape required from a PC character for Lightsaber resolution. */
interface PCLike {
  /** Character talent keys as stored in character_talents.skill_key */
  talentKeys?: string[]
}

/**
 * Returns the effective characteristic key to use when a character makes a
 * Lightsaber check. This is the single source of truth — no other component
 * should independently determine which characteristic drives Lightsaber.
 *
 * @param subject - An AdversaryInstance or a PC-like object
 * @param skillKey - Optional; if provided and not 'Lightsaber' / 'LTSABER',
 *                   returns 'BR' immediately (only Lightsaber is overridable)
 * @returns A CharKey ('BR' | 'AGI' | 'INT' | 'CUN' | 'WIL' | 'PR')
 */
export function getEffectiveLightsaberCharacteristic(
  subject: AdversaryInstance | PCLike,
  skillKey?: string,
): CharKey {
  // Only LTSABER is overridable — guard against accidental calls for other skills
  if (skillKey && skillKey !== 'LTSABER' && skillKey !== 'Lightsaber') {
    return 'BR'
  }

  // ── Adversary path ────────────────────────────────────────────────────────
  if ('instanceId' in subject) {
    const override = subject.characteristicOverrides?.['Lightsaber']
    if (override && override !== 'BR') {
      return override as CharKey
    }
    return 'BR'
  }

  // ── PC path ───────────────────────────────────────────────────────────────
  const talents = subject.talentKeys ?? []
  for (const key of TECHNIQUE_PRIORITY) {
    if (talents.includes(key)) {
      return LIGHTSABER_TECHNIQUE_MAP[key]
    }
  }
  return 'BR'
}
