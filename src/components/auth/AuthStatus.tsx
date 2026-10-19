'use client'

import type { User } from '@supabase/supabase-js'
import { FONT_BODY, FS, SP, RADIUS } from '@/lib/tokens'

const providerName = (p: unknown) => (typeof p === 'string' && p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Email')

/** Landing header: who is signed in (name and provider) with a Sign out, or a small Sign in link. Sign out is a POST to /auth/signout. */
export function AuthStatus({ user }: { user: User | null }) {
  const small = { fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase' as const }
  if (!user) {
    return <a href="/login" style={{ ...small, color: 'var(--hud-text-dim)', textDecoration: 'underline', padding: `${SP[2]} ${SP[1]}` }}>Sign in</a>
  }
  const meta = user.user_metadata ?? {}
  const name = (meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'Account') as string
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[3] }}>
      <span style={{ ...small, color: 'var(--hud-text-dim)' }}>
        Signed in as <strong style={{ color: 'var(--hud-text)' }}>{name}</strong> ({providerName(user.app_metadata?.provider)})
      </span>
      <form action="/auth/signout" method="post">
        <button type="submit" style={{ ...small, fontWeight: 700, background: 'transparent', color: 'var(--hud-text-dim)', border: '1px solid var(--hud-border-hi)', borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[3]}`, cursor: 'pointer' }}>
          Sign out
        </button>
      </form>
    </div>
  )
}
