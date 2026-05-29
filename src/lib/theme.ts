export type ThemeId = 'ember' | 'kyber' | 'gm-imperial'

const STORAGE_KEY = 'holocron_theme'
const DEFAULT: ThemeId = 'ember'

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
