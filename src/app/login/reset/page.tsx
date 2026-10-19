'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from '../login.module.css'

/** Landing for the password-reset email: /auth/callback has already signed the user in, this sets the new password. */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) { setError(err.message); return }
    router.replace('/')
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-title">
        <div id="reset-title" className={styles.brand}>New password</div>
        <form className={styles.form} onSubmit={e => void submit(e)}>
          <label className={styles.label} htmlFor="reset-password">New password</label>
          <input id="reset-password" className={styles.input} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Working…' : 'Set password'}</button>
        </form>
      </section>
    </main>
  )
}
