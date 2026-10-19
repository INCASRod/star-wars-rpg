import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/auth/server'
import { safeNext } from '@/lib/auth/safeNext'

/** OAuth / magic-link / email-confirm landing: swaps the one-time `code` for a session cookie, then goes back. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  const fail = new URL('/login', origin)
  fail.searchParams.set('error', 'callback')
  if (next !== '/') fail.searchParams.set('next', next)
  return NextResponse.redirect(fail)
}
