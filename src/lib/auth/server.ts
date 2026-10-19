import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSessionUser, isGmUser } from './gm'

/** Server-side Supabase client bound to the request's session cookies (route handlers, server components). */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          // Server components cannot write cookies; the proxy refreshes the session, so ignoring is safe.
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    },
  )
}

/**
 * Gate for API routes: null when the caller is a signed-in GM, otherwise a 401/403 Response to return as-is.
 */
export async function requireGm(): Promise<Response | null> {
  const supabase = await createServerSupabase()
  const user = await getSessionUser(supabase)
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 })
  if (!(await isGmUser(supabase))) return Response.json({ error: 'GM only' }, { status: 403 })
  return null
}
