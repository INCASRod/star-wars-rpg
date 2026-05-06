// Re-exports from the central token source.
// Import from '@/lib/tokens' in new code — this file exists for backward compat only.
import { FS, SP } from '@/lib/tokens'

export const WT = {
  overline: FS.overline,
  caption:  FS.caption,
  label:    FS.label,
  sm:       FS.sm,
  body:     FS.body,
  bodyLg:   FS.bodyLg,
  h4:       FS.h4,
  h3:       FS.h3,
  sp1:      SP[1],
  sp2:      SP[2],
  sp3:      SP[3],
  sp4:      SP[4],
  sp6:      SP[6],
} as const
