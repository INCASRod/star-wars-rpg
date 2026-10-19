import { InviteClaim } from './InviteClaim'

export const metadata = { title: 'Invite · Holocron' }

// Public on purpose: a player opens this signed out. The token is checked by the database (invite_preview / claim_invite).
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <InviteClaim token={token} />
}
