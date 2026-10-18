import type { SymbolKey } from '@/lib/tokens'
import type { SymbolKind } from './GameGlyph'

/** Roll-result symbol key (`SYM` in tokens.ts) -> the `Symbol` component's kind. */
export const SYMBOL_KIND: Record<SymbolKey, SymbolKind> = {
  S: 'success', F: 'failure', A: 'advantage', H: 'threat', T: 'triumph', D: 'despair',
}

/** `die.symbols` from a roll result (SYM keys, plus whatever else the engine emits) -> renderable kinds. */
export const symbolKinds = (keys: readonly string[]): SymbolKind[] =>
  keys.filter((k): k is SymbolKey => k in SYMBOL_KIND).map(k => SYMBOL_KIND[k])
