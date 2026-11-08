'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isXpSpendingFrozen } from '@/lib/xpSpendingFreeze'
import styles from './settings.module.css'

export function XpSpending() {
  const sbRef = useRef<SupabaseClient | null>(null)
  const sb = () => (sbRef.current ??= createClient())
  const [frozen, setFrozen] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void isXpSpendingFrozen(sb()).then(v => { if (live) setFrozen(v) })
    return () => { live = false }
  }, [])

  async function toggle() {
    if (frozen === null) return
    setBusy(true)
    setError(null)
    const next = !frozen
    // campaign_settings is a single-row table; the GM-only UPDATE policy (migration 160) is the gate.
    const { data, error: err } = await sb().from('campaign_settings').update({ xp_spending_frozen: next }).not('id', 'is', null).select('xp_spending_frozen')
    if (err || !data?.length) setError('Could not change the setting.')
    else setFrozen(next)
    setBusy(false)
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>XP spending</h2>
      <p className={styles.help}>
        While paused, players keep earning XP but cannot spend it on talents, Force abilities, specializations, skill ranks, Force Rating or signature abilities. GM refunds and awards are unaffected.
      </p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {frozen === null && !error ? <p className={styles.help}>Loading…</p> : (
        <p>
          <span className={styles.sub}>Currently: {frozen ? 'paused' : 'open'} </span>
          <button type="button" className={frozen ? styles.primary : styles.danger} disabled={busy || frozen === null} onClick={() => void toggle()}>
            {frozen ? 'Resume XP spending' : 'Pause XP spending'}
          </button>
        </p>
      )}
    </div>
  )
}
