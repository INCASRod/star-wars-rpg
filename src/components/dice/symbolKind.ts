import type { SymbolKey } from '@/lib/tokens'
import type { SymbolKind } from './GameGlyph'

/** Roll-result symbol key (`SYM` in tokens.ts) -> the `Symbol` component's kind. */
export const SYMBOL_KIND: Record<SymbolKey, SymbolKind> = {
  S: 'success', F: 'failure', A: 'advantage', H: 'threat', T: 'triumph', D: 'despair',
}
