export type ThemeId = 'binary-sunset'

const STORAGE_KEY = 'holocron_theme'
const DEFAULT: ThemeId = 'binary-sunset'

export function getTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? DEFAULT
}

export function setTheme(id: ThemeId) {
  localStorage.setItem(STORAGE_KEY, id)
  document.documentElement.dataset.theme = id
}

export function initTheme() {
  document.documentElement.dataset.theme = getTheme()
}
