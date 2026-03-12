'use client'

import { parseOggDudeMarkup } from '@/lib/oggdude-markup'

/**
 * Renders OggDude markup text as styled HTML.
 * Bracket codes like [BO], [SE], [FP], [SU] become coloured inline chips.
 * [P] and [BR] become paragraph / line breaks.
 */
export function MarkupText({
  text,
  className,
  style,
}: {
  text?: string | null
  className?: string
  style?: React.CSSProperties
}) {
  if (!text) return null
  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: parseOggDudeMarkup(text) }}
    />
  )
}
