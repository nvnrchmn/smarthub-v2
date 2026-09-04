import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeCtx {
  /** 'auto' = ikut OS; toggle memilih light/dark (override) */
  mode: ThemeMode
  /** true saat yang terlihat gelap */
  isDark: boolean
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx | null>(null)
const STORAGE = 'sh-theme'

function systemDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const s = localStorage.getItem(STORAGE)
    return s === 'light' || s === 'dark' || s === 'auto' ? s : 'auto'
  })
  const [sysDark, setSysDark] = useState(systemDark)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const fn = () => setSysDark(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', mode)
    localStorage.setItem(STORAGE, mode)
  }, [mode])

  const isDark = mode === 'dark' || (mode === 'auto' && sysDark)

  const setMode = (m: ThemeMode) => setModeState(m)
  const toggle = () => setModeState(isDark ? 'light' : 'dark')

  return <Ctx.Provider value={{ mode, isDark, setMode, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
