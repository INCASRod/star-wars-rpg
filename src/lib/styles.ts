// Re-exports from the central token source.
// Import from '@/lib/tokens' in new code — this file exists for backward compat only.
export { rarityColor, rarityLabel } from '@/lib/tokens'

import { COLOR, FS } from '@/lib/tokens'
import type React from 'react'

export const removeBtnStyle: React.CSSProperties = {
  minWidth:       44,
  minHeight:      44,
  fontSize:       FS.overline,
  fontWeight:     700,
  background:     'rgba(220,60,60,.1)',
  border:         `1px solid ${COLOR.red}`,
  color:          COLOR.red,
  cursor:         'pointer',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        0,
  lineHeight:     1,
  flexShrink:     0,
}
