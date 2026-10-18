'use client'

import { GLYPH_SIZE, SP, type DiceType, type GlyphSize } from '@/lib/tokens'
import { Die, Symbol, type SymbolKind } from './GameGlyph'

/**
 * One rolled die in a result view: the die on top, its result symbols in a row below, centred under the die.
 * The symbol row keeps its height when the die is blank so every die in a pool lines up.
 */
export function RolledDie({ type, symbols, size = 'xl' }: { type: DiceType; symbols: SymbolKind[]; size?: GlyphSize }) {
  return (
    <span className="inline-flex flex-col items-center" style={{ gap: SP[1] }}>
      <Die type={type} size={size} />
      <span className="flex items-center justify-center" style={{ gap: SP[1], minHeight: GLYPH_SIZE.sm }}>
        {symbols.map((kind, i) => <Symbol key={i} kind={kind} size="sm" />)}
      </span>
    </span>
  )
}
