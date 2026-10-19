/** Human text for the invite RPC error codes (migration 149). The RPCs raise the code as the error message. */
const MESSAGES: Record<string, string> = {
  not_signed_in: 'Sign in first.',
  not_gm: 'Only the GM can do that.',
  player_not_found: 'That player no longer exists.',
  player_not_invitable: 'This player cannot be invited (no live character, or a GM row).',
  player_already_bound: 'This character is already linked to an account. Ask your GM to unbind it first.',
  invite_not_found: 'This invite does not exist. Ask your GM for a new link.',
  invite_expired: 'This invite has expired or was already used. Ask your GM for a new link.',
  invite_used: 'This invite has expired or was already used. Ask your GM for a new link.',
  invite_revoked: 'This invite has expired or was already used. Ask your GM for a new link.',
}

export function inviteErrorMessage(err: { message?: string; details?: string | null } | null | undefined): string {
  const code = err?.message ?? ''
  if (code === 'already_has_character') {
    const name = err?.details?.trim()
    return name
      ? `You already play ${name} in this campaign. One character per player per campaign. Ask your GM to unbind ${name} first.`
      : 'You already play a character in this campaign. One character per player per campaign. Ask your GM to unbind it first.'
  }
  return MESSAGES[code] ?? 'Something went wrong. Try again.'
}

/** The state an invite link's preview reports, as the claim page needs it. */
export type InviteStatus = 'valid' | 'expired' | 'used' | 'revoked' | 'not_found'
