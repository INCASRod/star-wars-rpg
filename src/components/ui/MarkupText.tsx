'use client'

import { RichText } from '@/components/ui/RichText'

/**
 * Renders OggDude markup text as styled inline content.
 * Thin wrapper around <RichText> — preserved for callsite compatibility.
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
  return <RichText text={text} className={className} style={style} />
}
