import type { Metadata } from 'next'
import { ConsoleHost } from '@/components/gm/ConsoleHost'

export const metadata: Metadata = {
  title: 'Console — Legacy of Rebellion',
}

interface PageProps {
  searchParams: Promise<{ campaign?: string; doc?: string }>
}

// Standalone full-viewport page — deliberately outside the /gm layout's
// chrome (there is no src/app/gm/layout.tsx to inherit from, so this needs
// no escape hatch). No Archive header, no rail, no "back to GM" control: this
// opens in its own browser tab and stays there for the session.
//
// `?doc=` is accepted and ignored — deep-linking into a specific document
// requires a change inside the vendored console and is out of scope here.
export default async function ConsolePage({ searchParams }: PageProps) {
  const params = await searchParams
  const campaignId = params.campaign ?? null

  return <ConsoleHost campaignId={campaignId} />
}
