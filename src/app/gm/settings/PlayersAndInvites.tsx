'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { inviteErrorMessage } from '@/lib/auth/inviteErrors'
import styles from './settings.module.css'

interface Row {
  player_id: string
  player_name: string
  character_id: string
  character_name: string
  bound: boolean
  account_name: string | null
  account_provider: string | null
  invite_id: string | null
  invite_expires_at: string | null
  invite_state: 'open' | 'expired' | null
}

const EXPIRY_OPTIONS = [
  { hours: 24, label: '24 hours' },
  { hours: 168, label: '7 days' },
  { hours: 720, label: '30 days' },
]

type Confirm = { kind: 'unbind' | 'revoke'; row: Row } | null

const providerLabel = (p: string | null) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : 'email')
const formatExpiry = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function PlayersAndInvites({ campaignId: campaignProp }: { campaignId: string | null }) {
  const sbRef = useRef<SupabaseClient | null>(null)
  const sb = () => (sbRef.current ??= createClient())

  const [campaignId, setCampaignId] = useState<string | null>(campaignProp)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null) // player id with the expiry picker open
  const [hours, setHours] = useState(168)
  // Plain tokens exist only here, in this tab, from the moment of creation: the database keeps a hash.
  const [links, setLinks] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Confirm>(null)

  const load = useCallback(async (cid: string) => {
    const { data, error: err } = await sb().rpc('list_player_invites', { p_campaign_id: cid })
    if (err) { setError(inviteErrorMessage(err)); return }
    setRows((data ?? []) as Row[])
  }, [])

  useEffect(() => {
    let live = true
    void (async () => {
      let cid = campaignProp
      if (!cid) {
        const { data } = await sb().from('campaigns').select('id').limit(1)
        cid = data?.[0]?.id ?? null
      }
      if (!live) return
      setCampaignId(cid)
      if (cid) await load(cid)
      else setError('No campaign found.')
    })()
    return () => { live = false }
  }, [campaignProp, load])

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key)
    setError(null)
    try { await fn() } finally { setBusy(null) }
    if (campaignId) await load(campaignId)
  }

  const createInvite = (row: Row) => run(row.player_id, async () => {
    const { data, error: err } = await sb().rpc('create_invite', { p_player_id: row.player_id, p_expires_hours: hours })
    if (err) { setError(inviteErrorMessage(err)); return }
    setLinks(prev => ({ ...prev, [row.player_id]: `${window.location.origin}/invite/${data as string}` }))
    setCreating(null)
  })

  const revoke = (row: Row) => run(row.player_id, async () => {
    const { error: err } = await sb().rpc('revoke_invite', { p_invite_id: row.invite_id })
    if (err) setError(inviteErrorMessage(err))
    setLinks(prev => { const next = { ...prev }; delete next[row.player_id]; return next })
    setConfirm(null)
  })

  const unbind = (row: Row) => run(row.player_id, async () => {
    const { error: err } = await sb().rpc('unbind_player', { p_player_id: row.player_id })
    if (err) setError(inviteErrorMessage(err))
    setConfirm(null)
  })

  async function copy(playerId: string) {
    try { await navigator.clipboard.writeText(links[playerId]); setCopied(playerId); setTimeout(() => setCopied(c => (c === playerId ? null : c)), 2000) } catch { setError('Could not copy. Select the link and copy it by hand.') }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Players and invites</h2>
      <p className={styles.help}>
        Create a one-time link for a character and send it to the player (for example in a Discord message). They sign in with any method and the character links to their account. A link works once and cannot be forwarded.
      </p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!rows && !error && <p className={styles.help}>Loading…</p>}

      {rows && (
        <table className={styles.table}>
          <thead>
            <tr><th scope="col">Character</th><th scope="col">Status</th><th scope="col">Account</th><th scope="col" className={styles.actionsCol}>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const pill = row.bound ? 'bound' : row.invite_state === 'open' ? 'sent' : 'none'
              const link = links[row.player_id]
              const isBusy = busy === row.player_id
              return (
                <tr key={row.player_id}>
                  <td>
                    <div className={styles.charName}>{row.character_name}</div>
                    <div className={styles.sub}>{row.player_name}</div>
                  </td>
                  <td>
                    <span className={`${styles.pill} ${styles[`pill_${pill}`]}`}>
                      {pill === 'bound' ? 'Bound' : pill === 'sent' ? 'Invite sent' : row.invite_state === 'expired' ? 'Invite expired' : 'No invite'}
                    </span>
                  </td>
                  <td className={styles.sub}>
                    {row.bound
                      ? `${row.account_name ?? 'Account'} (${providerLabel(row.account_provider)})`
                      : row.invite_state === 'open' && row.invite_expires_at ? `Expires ${formatExpiry(row.invite_expires_at)}` : '—'}
                  </td>
                  <td className={styles.actionsCol}>
                    {confirm?.row.player_id === row.player_id ? (
                      <span className={styles.confirm}>
                        {confirm.kind === 'unbind' ? `Unbind ${row.character_name} from this account?` : 'Revoke this link?'}
                        <button type="button" className={styles.danger} disabled={isBusy} onClick={() => void (confirm.kind === 'unbind' ? unbind(row) : revoke(row))}>
                          {confirm.kind === 'unbind' ? 'Unbind' : 'Revoke'}
                        </button>
                        <button type="button" className={styles.btn} onClick={() => setConfirm(null)}>Cancel</button>
                      </span>
                    ) : row.bound ? (
                      <button type="button" className={styles.btn} onClick={() => setConfirm({ kind: 'unbind', row })}>Unbind</button>
                    ) : (
                      <span className={styles.btnRow}>
                        {pill === 'sent' && link && <button type="button" className={styles.btn} onClick={() => void copy(row.player_id)}>{copied === row.player_id ? 'Copied' : 'Copy link'}</button>}
                        <button type="button" className={pill === 'none' ? styles.primary : styles.btn} onClick={() => { setCreating(row.player_id); setHours(168) }}>
                          {pill === 'sent' ? 'Reissue' : 'Create invite'}
                        </button>
                        {pill === 'sent' && <button type="button" className={styles.btn} onClick={() => setConfirm({ kind: 'revoke', row })}>Revoke</button>}
                      </span>
                    )}
                    {creating === row.player_id && (
                      <div className={styles.picker}>
                        <label htmlFor={`exp-${row.player_id}`} className={styles.sub}>Link expires in</label>
                        <select id={`exp-${row.player_id}`} className={styles.select} value={hours} onChange={e => setHours(Number(e.target.value))}>
                          {EXPIRY_OPTIONS.map(o => <option key={o.hours} value={o.hours}>{o.label}</option>)}
                        </select>
                        <button type="button" className={styles.primary} disabled={isBusy} onClick={() => void createInvite(row)}>Create</button>
                        <button type="button" className={styles.btn} onClick={() => setCreating(null)}>Cancel</button>
                      </div>
                    )}
                    {link && pill === 'sent' && creating !== row.player_id && (
                      <div className={styles.linkBox}>
                        <span className={styles.sub}>Shown once. Copy it now; it cannot be shown again after you leave this page.</span>
                        <input className={styles.linkInput} readOnly value={link} aria-label={`Invite link for ${row.character_name}`} onFocus={e => e.currentTarget.select()} />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
