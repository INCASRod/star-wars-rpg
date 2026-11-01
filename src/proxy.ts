import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSessionUser, isGmUser } from '@/lib/auth/gm'

/**
 * Auth gate. Login is required everywhere except /login, /auth/*, /invite/* and /table (B5; API routes and files with
 * an extension are outside the matcher, and the API routes check their own caller).
 *   signed out                     -> /login?next=<where they were>
 *   signed in, GM                  -> everything
 *   signed in, bound to a player   -> the player pages; /gm and ?gm=1 are refused; /create is GM only
 *   signed in, not bound to anyone -> /no-character (an invite from the GM is the only way in)
 * Checked server-side on every request; the client flags (useIsGm) are conveniences only.
 */
const PUBLIC_PREFIXES = ['/login', '/auth', '/invite', '/table']

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  if (PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next()

  const isGmRoute = pathname === '/gm' || pathname.startsWith('/gm/')
  const wantsGmMode = pathname.startsWith('/character/') && searchParams.get('gm') === '1'

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
  if (await isGmUser(supabase)) return pathname === '/no-character' ? NextResponse.redirect(new URL('/', request.url)) : response

  const { data: bound } = await supabase.from('players').select('id').eq('user_id', user.id).limit(1)
  const hasPlayer = (bound?.length ?? 0) > 0
  if (!hasPlayer) {
    return pathname === '/no-character' ? response : NextResponse.redirect(new URL('/no-character', request.url))
  }
  if (pathname === '/no-character') return NextResponse.redirect(new URL('/', request.url))

  if (wantsGmMode) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('gm')
    return NextResponse.redirect(url)
  }
  if (isGmRoute || pathname === '/create' || pathname.startsWith('/create/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
}
