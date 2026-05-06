// Re-exports from the central token source.
// Import from '@/lib/tokens' in new code — this file exists for backward compat only.
export {
  HUD as C,
  CHAR_COLOR,
  CHAR_ABBR3,
  CHAR_REF_MAP,
  DICE_META,
  DICE_COLOR,
  EMPTY_POOL,
  SYM,
  SYM_COLOR,
  FONT  as FONT_RAJDHANI,
  FONT  as FONT_CINZEL,
  FS    as FS_MAP,
  panelBase,
  type CharKey,
  type DiceType,
  type DiceMeta,
  type SymbolKey,
  type SymbolMeta,
} from '@/lib/tokens'

// Named FS_* aliases kept for existing HUD component imports
export { FS } from '@/lib/tokens'
import { FS } from '@/lib/tokens'
export const FS_OVERLINE = FS.overline
export const FS_CAPTION  = FS.caption
export const FS_LABEL    = FS.label
export const FS_SM       = FS.sm
export const FS_H4       = FS.h4
export const FS_H3       = FS.h3
