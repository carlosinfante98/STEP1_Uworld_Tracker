import { BarChart3, ClipboardList, Command, LayoutDashboard, ListChecks, LogOut, Monitor, Moon, Plus, Sun, type LucideIcon } from 'lucide-react'
import { Button } from './ui'
import { useTheme, type ThemePref } from '../lib/theme'

export type Tab = 'overview' | 'blocks' | 'systems' | 'plan'
export const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'blocks', label: 'Blocks', icon: ListChecks },
  { id: 'systems', label: 'Systems', icon: BarChart3 },
  { id: 'plan', label: 'Plan', icon: ClipboardList },
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
      className="inline-flex size-11 items-center justify-center rounded-ctl border md:size-9 border-rule-strong text-ink-2 transition-colors hover:border-accent hover:text-ink"
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

function Mark() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-ctl bg-accent text-accent-ink">
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><rect x="4" y="13" width="4" height="7" rx="1" /><rect x="10" y="9" width="4" height="11" rx="1" /><rect x="16" y="4" width="4" height="16" rx="1" /></svg>
    </span>
  )
}

function UserChip({ account }: { account: Account }) {
  const initial = (account.name ?? '?').trim().charAt(0).toUpperCase()
  if (account.kind === 'cloud') {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-rule-strong bg-sunken text-sm font-medium text-ink" title={account.name ?? ''}>
          {account.photo ? <img src={account.photo} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : initial}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{account.name}</span>
        <button onClick={account.onSignOut} aria-label="Sign out" title="Sign out" className="inline-flex size-11 shrink-0 items-center justify-center rounded-ctl text-ink-3 transition-colors hover:bg-sunken hover:text-ink md:size-9"><LogOut className="size-4" /></button>
      </div>
    )
  }
  return account.onSignIn ? <Button variant="ghost" onClick={account.onSignIn} className="w-full justify-start">Sign in to sync</Button> : null
}

export function Header({
  tab, setTab, onLog, onPalette, account,
}: { tab: Tab; setTab: (t: Tab) => void; onLog: () => void; onPalette: () => void; account: Account }) {
  return (
    <>
      {/* Desktop: side rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col gap-6 border-r border-rule bg-paper p-4 md:flex">
        <a href="#/" className="flex items-center gap-2.5 rounded-ctl" aria-label="Step 1 QBank tracker, home">
          <Mark />
          <span className="font-display text-base font-semibold text-ink">Step 1 tracker</span>
        </a>
        <Button variant="primary" onClick={onLog} className="w-full"><Plus className="size-4" />Log block</Button>
        <nav aria-label="Sections" className="grid gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex min-h-9 items-center gap-2.5 rounded-ctl px-2.5 text-sm font-medium transition-colors ${tab === t.id ? 'bg-accent-soft text-ink' : 'text-ink-3 hover:bg-sunken hover:text-ink'}`}
            ><t.icon className="size-4" aria-hidden />{t.label}</button>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onPalette}
              aria-label="Open command palette"
              className="inline-flex h-9 flex-1 items-center gap-2 rounded-ctl border border-rule-strong px-2.5 font-mono text-xs text-ink-3 transition-colors hover:border-accent hover:text-ink"
            ><Command className="size-3.5" />K</button>
            <ThemeToggle />
          </div>
          <UserChip account={account} />
        </div>
      </aside>

      {/* Mobile: top bar + bottom nav */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-rule bg-paper px-4 py-2 md:hidden">
        <a href="#/" className="flex min-w-0 items-center gap-2.5" aria-label="Step 1 QBank tracker, home"><Mark /><span className="truncate font-display text-base font-semibold text-ink">Step 1 tracker</span></a>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="primary" onClick={onLog}><Plus className="size-4" />Log</Button>
        </div>
      </header>
      <nav aria-label="Sections" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-rule bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${tab === t.id ? 'text-accent' : 'text-ink-3'}`}
          ><t.icon className="size-5" aria-hidden />{t.label}</button>
        ))}
      </nav>
    </>
  )
}
