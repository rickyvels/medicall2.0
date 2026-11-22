import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
const KEY = 'medicall.theme'

const read = (): Theme => {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* noop */ }
  return 'light' // claro por defecto
}

export const applyTheme = (t: Theme) => {
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1514' : '#8fcfc0')
}

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const useTheme = create<ThemeState>((set) => ({
  theme: read(),
  setTheme: (theme) => {
    try { localStorage.setItem(KEY, theme) } catch { /* noop */ }
    applyTheme(theme)
    set({ theme })
  },
}))
