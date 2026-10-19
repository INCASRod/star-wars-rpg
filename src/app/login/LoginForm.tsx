'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/auth/safeNext'
import styles from './login.module.css'

type Mode = 'signin' | 'signup' | 'magic' | 'forgot' | 'sent'

const SUBMIT_LABEL: Record<Mode, string> = {
  signin: 'Sign in',
  signup: 'Create account',
  magic: 'Email me a link',
  forgot: 'Send reset link',
  sent: '',
}

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get('next'))
  const callbackFailed = params.get('error') === 'callback'
  const signedOut = params.get('signedout') === '1'

  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState('')

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => { setUser(data.user); setChecked(true) })
  }, [supabase])

  const callbackUrl = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`

  async function oauth(provider: 'discord' | 'google') {
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callbackUrl(next) } })
    if (err) setError(err.message)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); return }
        router.replace(next)
        router.refresh()
      } else if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl(next) } })
        if (err) { setError(err.message); return }
        setSentTo(email); setMode('sent')
      } else if (mode === 'magic') {
        const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl(next) } })
        if (err) { setError(err.message); return }
        setSentTo(email); setMode('sent')
      } else if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl('/login/reset') })
        if (err) { setError(err.message); return }
        setSentTo(email); setMode('sent')
      }
    } finally {
      setBusy(false)
    }
  }

  function go(m: Mode) { setMode(m); setError(null) }

  if (checked && user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <div className={styles.brand}>Holocron</div>
          <p className={styles.notice} role="status">Signed in as {user.email ?? 'your account'}.</p>
          <button type="button" className={styles.primary} onClick={() => router.replace(next)}>Continue</button>
          <form action="/auth/signout" method="post">
            <button type="submit" className={styles.provider}>Sign out</button>
          </form>
        </section>
      </main>
    )
  }

  const needsPassword = mode === 'signin' || mode === 'signup'

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <div id="login-title" className={styles.brand}>Holocron</div>
        <p className={styles.lede}>Sign in to the Archive</p>

        {callbackFailed && <p className={styles.error} role="alert">That sign-in link did not work or has expired. Try again.</p>}
        {signedOut && <p className={styles.notice} role="status">You have been signed out.</p>}

        {mode === 'sent' ? (
          <>
            <p className={styles.notice} role="status">Check your email. We sent a link to {sentTo}.</p>
            <button type="button" className={styles.link} onClick={() => go('signin')}>Back to sign in</button>
          </>
        ) : (
          <>
            <button type="button" className={`${styles.provider} ${styles.discord}`} onClick={() => void oauth('discord')}>Continue with Discord</button>
            <button type="button" className={styles.provider} onClick={() => void oauth('google')}>Continue with Google</button>
            <div className={styles.divider}>or use email</div>

            <form className={styles.form} onSubmit={e => void submit(e)}>
              <label className={styles.label} htmlFor="login-email">Email</label>
              <input id="login-email" className={styles.input} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
              {needsPassword && (
                <>
                  <label className={styles.label} htmlFor="login-password">Password</label>
                  <input id="login-password" className={styles.input} type="password" required minLength={mode === 'signup' ? 8 : undefined}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} />
                </>
              )}
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Working…' : SUBMIT_LABEL[mode]}</button>
            </form>

            <div className={styles.links}>
              {mode !== 'signin' && <button type="button" className={styles.link} onClick={() => go('signin')}>Sign in with password</button>}
              {mode !== 'magic' && <button type="button" className={styles.link} onClick={() => go('magic')}>Email me a sign-in link</button>}
              {mode !== 'forgot' && <button type="button" className={styles.link} onClick={() => go('forgot')}>Forgot password</button>}
              {mode !== 'signup' && <button type="button" className={styles.link} onClick={() => go('signup')}>Create account</button>}
            </div>
          </>
        )}
        <p className={styles.foot}>New here? Use the invite link your GM sent you.</p>
      </section>
    </main>
  )
}
