import type { Metadata } from 'next'
import { GalaxyTool } from '@/components/galaxy/GalaxyTool'

export const metadata: Metadata = {
  title: 'Galaxy — Astrogation',
}

interface PageProps {
  searchParams: Promise<{ campaign?: string }>
}

// Standalone full-viewport GM tool, opened in its own tab from GmLeftRail. Same shape as /gm/console:
// no /gm layout to inherit from, no Archive chrome. Linked only from that one rail button.
export default async function GalaxyPage({ searchParams }: PageProps) {
  const { campaign } = await searchParams
  return <GalaxyTool campaignId={campaign ?? null} />
}
