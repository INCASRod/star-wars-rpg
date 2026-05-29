export type ThemeId = 'ember' | 'kyber' | 'gm-imperial'

const STORAGE_KEY = 'holocron_theme'
const DEFAULT: ThemeId = 'ember'

const LEGACY_MAP: Record<string, ThemeId> = { 'binary-sunset': 'ember', 'operative': 'ember' }
const VALID = new Set<ThemeId>(['ember', 'kyber', 'gm-imperial'])

export function getTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT
  const stored = localStorage.getItem(STORAGE_KEY) ?? ''
  return VALID.has(stored as ThemeId) ? (stored as ThemeId) : (LEGACY_MAP[stored] ?? DEFAULT)
}

export function setTheme(id: ThemeId) {
  localStorage.setItem(STORAGE_KEY, id)
  document.documentElement.dataset.theme = id
}

export function initTheme() {
  document.documentElement.dataset.theme = getTheme()
}
