import { createClient } from '@/lib/supabase/client'

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
