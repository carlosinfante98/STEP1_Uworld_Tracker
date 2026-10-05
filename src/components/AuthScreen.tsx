import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { Button } from './ui'
import { auth, googleProvider } from '../lib/firebase'

export function AuthScreen({ onLocal }: { onLocal: () => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function google() {
    if (!auth) return
    setBusy(true); setErr('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      if (code === 'auth/unauthorized-domain') setErr('This domain isn’t authorized in Firebase yet. Add it under Authentication → Settings → Authorized domains.')
      else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') setErr('')
      else setErr(`Sign-in failed${code ? ` (${code})` : ''}.`)
    } finally { setBusy(false) }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="rise w-full max-w-md rounded-card border border-rule bg-surface p-7">
        <p className="mono-label flex items-center gap-2"><span className="size-1.5 bg-accent" />Step 1 · QBank tracker</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">Log blocks. See your pace.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Sign in so your blocks sync across your devices. You enter each block’s score yourself after finishing it in UWorld; nothing is read from your UWorld account.
        </p>
        <div className="mt-6 grid gap-2.5">
          <Button variant="primary" className="min-h-11" onClick={google} loading={busy}>Continue with Google</Button>
          <Button variant="secondary" className="min-h-11" onClick={onLocal}>Use on this device only</Button>
        </div>
        {err && <p role="alert" className="mt-4 rounded-ctl bg-bad-soft px-3 py-2 text-sm text-bad">{err}</p>}
        <p className="mt-5 text-xs text-ink-3">Device-only data lives in this browser and doesn’t sync. Clearing site data erases it.</p>
      </div>
    </main>
  )
}
