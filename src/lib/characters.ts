import { createClient } from '@/lib/supabase/client'

/**
 * Career-skill union across owned specializations — the rulebook invariant:
 * a character's career skills are career_skill_keys of their career, unioned
 * with career_skill_keys of EVERY owned specialization (not just the starting
 * one). Pure/no DB access so callers with data already in memory (e.g.
 * useCharacterData) don't need a round trip. Deliberately ignores is_starting
 * (no first-spec-only carve-out) and never folds in talent-granted career
 * flags — those are a separate overlay applied at read time in hudSkills.
 */
export function computeCareerSkillKeys(
  careerSkillKeys: string[] | null | undefined,
  ownedSpecs: { career_skill_keys?: string[] | null }[],
): Set<string> {
  const keys = new Set<string>()
  careerSkillKeys?.forEach(k => keys.add(k))
  ownedSpecs.forEach(s => s.career_skill_keys?.forEach(k => keys.add(k)))
  return keys
}

/**
 * Writes character_skills.is_career to match computeCareerSkillKeys' union —
 * true for skills in it, false for skills not in it. Assumes every skill_key
 * already has a character_skills row (true for every character today: both
 * the creation flow and the XML importer insert one row per ref_skills
 * entry) — an update against a missing row is a silent no-op, not an insert.
 */
export async function persistCareerSkills(
  characterId: string,
  careerSkillKeys: string[] | null | undefined,
  ownedSpecs: { career_skill_keys?: string[] | null }[],
  allSkillKeys: string[],
): Promise<Set<string>> {
  const supabase = createClient()
  const union = computeCareerSkillKeys(careerSkillKeys, ownedSpecs)
  const unionKeys = [...union]
  const nonUnionKeys = allSkillKeys.filter(k => !union.has(k))

  await Promise.all([
    unionKeys.length
      ? supabase.from('character_skills').update({ is_career: true }).eq('character_id', characterId).in('skill_key', unionKeys)
      : Promise.resolve(),
    nonUnionKeys.length
      ? supabase.from('character_skills').update({ is_career: false }).eq('character_id', characterId).in('skill_key', nonUnionKeys)
      : Promise.resolve(),
  ])

  return union
}

/** Soft-delete a character and remove any active sessions. */
export async function archiveCharacter(characterId: string): Promise<void> {
  const supabase = createClient()
  // Remove active sessions so the player is immediately logged out
  await supabase.from('character_sessions').delete().eq('character_id', characterId)
  const { error } = await supabase
    .from('characters')
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq('id', characterId)
  if (error) throw new Error(error.message)
}

/** Restore an archived character (clears is_archived and archived_at). */
export async function restoreCharacter(characterId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('characters')
    .update({ is_archived: false, archived_at: null })
    .eq('id', characterId)
  if (error) throw new Error(error.message)
}

/** Permanently delete a character and all related sessions. */
export async function deleteCharacter(characterId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('character_sessions').delete().eq('character_id', characterId)
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId)
  if (error) throw new Error(error.message)
}
