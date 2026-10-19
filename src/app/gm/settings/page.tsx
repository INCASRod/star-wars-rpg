import type { Metadata } from 'next'
import { SettingsShell } from './SettingsShell'

export const metadata: Metadata = {
  title: 'Settings · Holocron',
}

interface PageProps {
  searchParams: Promise<{ campaign?: string }>
}

// GM Settings: a shell of sections (one for now: Players and invites). Gated by src/proxy.ts like the rest of /gm.
export default async function SettingsPage({ searchParams }: PageProps) {
  const { campaign } = await searchParams
  return <SettingsShell campaignId={campaign ?? null} />
}
