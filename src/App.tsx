import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth, firebaseEnabled } from './lib/firebase'
import { CloudProvider, LocalProvider, useData } from './lib/data'
import { ThemeProvider, useTheme } from './lib/theme'
import { Header, TABS, type Account, type Tab } from './components/Header'
import { Overview } from './components/Overview'
import { BlocksView } from './components/BlocksView'
import { SystemsView } from './components/SystemsView'
import { PlanView } from './components/PlanView'
import { BlockDialog } from './components/BlockDialog'
import { SettingsDialog } from './components/SettingsDialog'
import { CommandPalette, type Command } from './components/CommandPalette'
import { AuthScreen } from './components/AuthScreen'
import type { Block } from './lib/types'

const LOCAL_FLAG = 's1t:local'
const readFlag = () => { try { return localStorage.getItem(LOCAL_FLAG) === '1' } catch { return false } }
const writeFlag = (on: boolean) => { try { on ? localStorage.setItem(LOCAL_FLAG, '1') : localStorage.removeItem(LOCAL_FLAG) } catch { /* ignore */ } }

export default function App() {
  return (
    <ThemeProvider>
      <Gate />
    </ThemeProvider>
  )
}

function Gate() {
  const [user, setUser] = useState<User | null | undefined>(firebaseEnabled ? undefined : null)
  const [local, setLocal] = useState(readFlag)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  if (!firebaseEnabled) {
    return <LocalProvider><Shell account={{ kind: 'local' }} /></LocalProvider>
  }
  if (user === undefined) return <p className="grid min-h-dvh place-items-center text-sm text-ink-3">Loading…</p>
  if (user) {
    return (
      <CloudProvider uid={user.uid}>
        <Shell account={{ kind: 'cloud', name: user.displayName ?? user.email, photo: user.photoURL, onSignOut: () => { writeFlag(false); void signOut(auth!) } }} />
      </CloudProvider>
    )
  }
  if (local) {
    return <LocalProvider><Shell account={{ kind: 'local', onSignIn: () => { writeFlag(false); setLocal(false) } }} /></LocalProvider>
  }
  return <AuthScreen onLocal={() => { writeFlag(true); setLocal(true) }} />
}

function tabFromHash(): Tab {
  const h = location.hash.replace(/^#\/?/, '') as Tab
  return TABS.some((t) => t.id === h) ? h : 'overview'
}

function Shell({ account }: { account: Account }) {
  const { ready, mode, settings, saveSettings, addBlock, updateBlock } = useData()
  const { setPref } = useTheme()
  const [tab, setTabState] = useState<Tab>(tabFromHash)
  const [blockOpen, setBlockOpen] = useState(false)
  const [editing, setEditing] = useState<Block | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [palette, setPalette] = useState(false)

  const setTab = useCallback((t: Tab) => { location.hash = `/${t}`; setTabState(t); window.scrollTo({ top: 0 }) }, [])
  useEffect(() => {
    const on = () => setTabState(tabFromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const logNew = useCallback(() => { setEditing(null); setBlockOpen(true) }, [])
  const commands = useMemo<Command[]>(() => [
    { id: 'log', label: 'Log a block', run: logNew },
    ...TABS.map((t) => ({ id: `go-${t.id}`, label: `Go to ${t.label}`, run: () => setTab(t.id) })),
    { id: 'goals', label: 'Edit goals & exam date', run: () => setSettingsOpen(true) },
    { id: 'light', label: 'Theme: light', run: () => setPref('light') },
    { id: 'dark', label: 'Theme: dark', run: () => setPref('dark') },
    { id: 'system', label: 'Theme: match system', run: () => setPref('system') },
    ...(account.onSignOut ? [{ id: 'out', label: 'Sign out', run: account.onSignOut }] : []),
  ], [account.onSignOut, logNew, setPref, setTab])

  return (
    <div className="min-h-dvh">
      <Header tab={tab} setTab={setTab} onLog={logNew} onPalette={() => setPalette(true)} account={account} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {mode === 'local' && (
          <p className="mb-5 rounded-ctl border border-rule bg-sunken px-3.5 py-2.5 text-sm text-ink-2">
            {firebaseEnabled
              ? 'Device-only mode: your data stays in this browser and doesn’t sync. Sign in to sync across devices.'
              : 'Device-only mode: Firebase isn’t configured, so your data stays in this browser. See FIREBASE_SETUP.md to turn on sync.'}
          </p>
        )}
        {!ready ? (
          <p className="py-24 text-center text-sm text-ink-3">Loading your data…</p>
        ) : (
          <>
            {tab === 'overview' && <Overview onLog={logNew} onSettings={() => setSettingsOpen(true)} onOpenBlocks={() => setTab('blocks')} />}
            {tab === 'blocks' && <BlocksView onLog={logNew} onEdit={(b) => { setEditing(b); setBlockOpen(true) }} />}
            {tab === 'systems' && <SystemsView />}
            {tab === 'plan' && <PlanView />}
          </>
        )}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-5 text-xs text-ink-3">
          <span>Not affiliated with UWorld. You enter every score by hand.</span>
          <button onClick={() => setSettingsOpen(true)} className="rounded-ctl underline-offset-4 hover:text-ink hover:underline">Goals &amp; exam date</button>
        </footer>
      </main>

      <BlockDialog
        open={blockOpen}
        initial={editing}
        onClose={() => setBlockOpen(false)}
        onSave={(b) => (editing ? updateBlock(editing.id, b) : addBlock(b))}
      />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onSave={saveSettings} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </div>
  )
}
