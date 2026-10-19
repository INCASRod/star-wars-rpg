'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { inviteErrorMessage, type InviteStatus } from '@/lib/auth/inviteErrors'
import styles from '@/app/login/login.module.css'
import claim from './invite.module.css'

interface Preview {
  status: InviteStatus
  character_name?: string
  role_line?: string
  portrait_url?: string | null
  expires_at?: string
}

const DEAD_MESSAGE = 'This invite has expired or was already used. Ask your GM for a new link.'

export function InviteClaim({ token }: { token: string }) {
  const router = useRouter()
  const sbRef = useRef<SupabaseClient | null>(null)
  const sb = () => (sbRef.current ??= createClient())

  const [preview, setPreview] = useState<Preview | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void (async () => {
      const [{ data: pv }, { data: u }] = await Promise.all([sb().rpc('invite_preview', { p_token: token }), sb().auth.getUser()])
      if (!live) return
      setPreview((pv as Preview) ?? { status: 'not_found' })
      setUser(u.user)
      setReady(true)
    })()
    return () => { live = false }
  }, [token])

  const here = `/invite/${token}`

  async function oauth(provider: 'discord' | 'google') {
    setError(null)
    const { error: err } = await sb().auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(here)}` } })
    if (err) setError(err.message)
  }

  async function doClaim() {
    setBusy(true)
    setError(null)
    const { error: err } = await sb().rpc('claim_invite', { p_token: token })
    setBusy(false)
    if (err) { setError(inviteErrorMessage(err)); return }
    router.replace('/')
  }

  if (!ready) return <main className={styles.page}><section className={styles.card}><div className={styles.brand}>Holocron</div></section></main>

  const valid = preview?.status === 'valid'

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="invite-title">
        <div id="invite-title" className={styles.brand}>Holocron</div>

        {!valid ? (
          <>
            <p className={styles.error} role="alert">{DEAD_MESSAGE}</p>
            <Link className={styles.link} href="/">Back to the Archive</Link>
          </>
        ) : (
          <>
            <p className={styles.lede}>Your GM invited you to play</p>
            <div className={claim.card}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase storage portrait, same as the landing cards */}
              {preview?.portrait_url && <img className={claim.portrait} src={preview.portrait_url} alt="" />}
              <div>
                <div className={claim.name}>{preview?.character_name}</div>
                {preview?.role_line && <div className={claim.role}>{preview.role_line}</div>}
              </div>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            {user ? (
              <>
                <p className={styles.notice} role="status">Signed in as {user.email ?? 'your account'}.</p>
                <button type="button" className={styles.primary} disabled={busy} onClick={() => void doClaim()}>
                  {busy ? 'Working…' : `Claim ${preview?.character_name}`}
                </button>
                <form action="/auth/signout" method="post">
                  <button type="submit" className={styles.link}>Use a different account</button>
                </form>
              </>
            ) : (
              <>
                <button type="button" className={`${styles.provider} ${styles.discord}`} onClick={() => void oauth('discord')}>Claim with Discord</button>
                <button type="button" className={styles.provider} onClick={() => void oauth('google')}>Claim with Google</button>
                <a className={styles.link} href={`/login?next=${encodeURIComponent(here)}`}>Claim with an email link or password</a>
              </>
            )}
            <p className={styles.foot}>One character per player per campaign. This link works once.</p>
          </>
        )}
      </section>
    </main>
  )
}
