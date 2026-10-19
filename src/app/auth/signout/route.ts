import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  // 303 so the browser follows with a GET.
  return NextResponse.redirect(new URL('/login?signedout=1', request.url), 303)
}
