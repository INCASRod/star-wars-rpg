import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSessionUser, isGmUser } from '@/lib/auth/gm'

/**
 * GM gate (Auth B1). Replaces the old PIN: every /gm route, and the `?gm=1` GM edit mode on the character routes,
 * needs a signed-in user for whom public.is_gm() is true. Checked here, server-side, on every request; the client
 * flag alone no longer unlocks anything. Signed out -> /login (back to where they were); signed in but not GM ->
 * the landing page (or the same character page without `gm`).
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isGmRoute = pathname === '/gm' || pathname.startsWith('/gm/')
  const wantsGmMode = pathname.startsWith('/character/') && searchParams.get('gm') === '1'
  if (!isGmRoute && !wantsGmMode) return NextResponse.next()

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const user = await getSessionUser(supabase)
  if (!user) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(login)
  }
  if (await isGmUser(supabase)) return response

  if (wantsGmMode) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('gm')
    return NextResponse.redirect(url)
  }
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/gm/:path*', '/character/:path*'],
}
