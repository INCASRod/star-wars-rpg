import type { SupabaseClient, User } from '@supabase/supabase-js'

// No next/headers import here: the proxy (edge-style runtime) shares these two checks with route handlers.

/** The signed-in user, verified against Supabase Auth (never trusts the cookie alone), or null. */
export async function getSessionUser(supabase: SupabaseClient): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  return error ? null : data.user
}

/** True when the signed-in user is bound to a GM `players` row (public.is_gm(), migration 148). */
export async function isGmUser(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_gm')
  return !error && data === true
}
