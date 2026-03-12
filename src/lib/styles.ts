/** Shared style constants used across multiple components */

export const removeBtnStyle: React.CSSProperties = {
  minWidth: 44,
  minHeight: 44,
  fontSize: 'var(--text-overline)',
  fontWeight: 700,
  background: 'rgba(220,60,60,.1)',
  border: '1px solid var(--red)',
  color: 'var(--red)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  lineHeight: 1,
  flexShrink: 0,
}

/** Rarity color using CSS variables (theme-consistent) */
export function rarityColor(r: number): string {
  if (r <= 2) return 'var(--txt3)'
  if (r <= 4) return 'var(--green)'
  if (r <= 6) return 'var(--blue)'
  if (r <= 8) return '#7B3FA0'
  return 'var(--gold)'
}

export function rarityLabel(r: number): string {
  if (r <= 2) return 'Common'
  if (r <= 4) return 'Uncommon'
  if (r <= 6) return 'Rare'
  if (r <= 8) return 'Epic'
  return 'Legendary'
}
