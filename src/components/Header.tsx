import { Command, LogOut, Monitor, Moon, Plus, Sun } from 'lucide-react'
import { Button } from './ui'
import { useTheme, type ThemePref } from '../lib/theme'

export type Tab = 'overview' | 'blocks' | 'systems' | 'plan'
export const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'systems', label: 'Systems' },
  { id: 'plan', label: 'Plan' },
]

const NEXT: Record<ThemePref, ThemePref> = { light: 'dark', dark: 'system', system: 'light' }

export function ThemeToggle() {
  const { pref, setPref } = useTheme()
  const Icon = pref === 'light' ? Sun : pref === 'dark' ? Moon : Monitor
  return (
    <button
      onClick={() => setPref(NEXT[pref])}
      aria-label={`Theme: ${pref}. Click to switch.`}
      title={`Theme: ${pref}`}
      className="inline-flex size-9 items-center justify-center rounded-ctl border border-rule-strong text-ink-2 transition-colors hover:border-accent hover:text-ink"
    >
      <Icon className="size-4" />
    </button>
  )
}

export interface Account {
  kind: 'cloud' | 'local'
  name?: string | null
  photo?: string | null
  onSignOut?: () => void
  onSignIn?: () => void
}

export function Header({
  tab, setTab, onLog, onPalette, account,
}: { tab: Tab; setTab: (t: Tab) => void; onLog: () => void; onPalette: () => void; account: Account }) {
  const initial = (account.name ?? '?').trim().charAt(0).toUpperCase()
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <a href="#/" className="flex min-w-0 items-center gap-2.5" aria-label="Step 1 QBank tracker, home">
          <span className="grid size-8 shrink-0 place-items-center rounded-ctl bg-ink text-paper">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
          </span>
          <span className="hidden truncate font-display text-base font-semibold text-ink sm:block">Step 1 tracker</span>
        </a>

        <nav aria-label="Sections" className="ml-2 hidden items-center gap-1 md:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`rounded-ctl px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? 'bg-sunken text-ink' : 'text-ink-3 hover:text-ink'}`}
            >{t.label}</button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onPalette}
            aria-label="Open command palette"
            className="hidden h-9 items-center gap-2 rounded-ctl border border-rule-strong px-2.5 font-mono text-xs text-ink-3 transition-colors hover:border-accent hover:text-ink sm:inline-flex"
          >
            <Command className="size-3.5" />K
          </button>
          <ThemeToggle />
          <Button variant="primary" onClick={onLog}><Plus className="size-4" /><span className="max-sm:sr-only">Log block</span></Button>
          {account.kind === 'cloud' ? (
            <>
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-rule-strong bg-sunken text-sm font-medium text-ink" title={account.name ?? ''}>
                {account.photo ? <img src={account.photo} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : initial}
              </span>
              <button onClick={account.onSignOut} aria-label="Sign out" title="Sign out" className="inline-flex size-9 items-center justify-center rounded-ctl text-ink-3 transition-colors hover:bg-sunken hover:text-ink"><LogOut className="size-4" /></button>
            </>
          ) : account.onSignIn ? (
            <Button variant="ghost" onClick={account.onSignIn} className="max-sm:hidden">Sign in</Button>
          ) : null}
        </div>
      </div>
      <nav aria-label="Sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`shrink-0 rounded-ctl px-3 py-1.5 text-sm font-medium ${tab === t.id ? 'bg-sunken text-ink' : 'text-ink-3'}`}
          >{t.label}</button>
        ))}
      </nav>
    </header>
  )
}
