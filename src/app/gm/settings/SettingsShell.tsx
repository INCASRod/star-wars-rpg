'use client'

import { useState } from 'react'
import { PlayersAndInvites } from './PlayersAndInvites'
import styles from './settings.module.css'

interface Section { id: string; label: string }

// Future home of account, campaign settings and membership. Only one section exists today.
const SECTIONS: Section[] = [{ id: 'players', label: 'Players and invites' }]

export function SettingsShell({ campaignId }: { campaignId: string | null }) {
  const [active, setActive] = useState(SECTIONS[0].id)
  const back = `/gm${campaignId ? `?campaign=${campaignId}` : ''}`

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.back} href={back}>← Back to GM</a>
        <h1 className={styles.title}>Settings</h1>
      </header>
      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Settings sections">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${active === s.id ? styles.navActive : ''}`}
              aria-current={active === s.id ? 'page' : undefined}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <section className={styles.content}>
          {active === 'players' && <PlayersAndInvites campaignId={campaignId} />}
        </section>
      </div>
    </main>
  )
}
