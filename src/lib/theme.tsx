import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
const KEY = 's1t:theme'

const Ctx = createContext<{ pref: ThemePref; setPref: (p: ThemePref) => void; resolved: 'light' | 'dark' } | null>(null)

function systemDark() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => {
    try { return (localStorage.getItem(KEY) as ThemePref) || 'system' } catch { return 'system' }
  })
  const [sys, setSys] = useState(systemDark)

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSys(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const resolved = pref === 'system' ? (sys ? 'dark' : 'light') : pref
  useEffect(() => { document.documentElement.dataset.theme = resolved }, [resolved])

  const setPref = (p: ThemePref) => {
    setPrefState(p)
    try { localStorage.setItem(KEY, p) } catch { /* ignore */ }
  }
  return <Ctx.Provider value={{ pref, setPref, resolved }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTheme outside provider')
  return v
}
