import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { Button, Meter } from './ui'
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
    <main className="mx-auto grid min-h-dvh max-w-5xl content-center gap-12 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center md:gap-16">
      <div className="rise min-w-0">
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Log blocks. See your pace.</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">
          Sign in so your blocks sync across your devices. You enter each block’s score yourself after finishing it in UWorld; nothing is read from your UWorld account.
        </p>
        <div className="mt-8 grid max-w-sm gap-2.5">
          <Button variant="primary" className="min-h-11" onClick={google} loading={busy}>Continue with Google</Button>
          <Button variant="secondary" className="min-h-11" onClick={onLocal}>Use on this device only</Button>
        </div>
        {err && <p role="alert" className="mt-4 max-w-sm rounded-ctl bg-bad-soft px-3 py-2 text-sm text-bad">{err}</p>}
        <p className="mt-6 max-w-sm text-xs text-ink-3">Device-only data lives in this browser and doesn’t sync. Clearing site data erases it.</p>
      </div>

      <figure className="min-w-0 border-t border-rule pt-5 md:border-l md:border-t-0 md:pl-10 md:pt-0" aria-label="Layout of the pace readout">
        <figcaption className="text-sm text-ink-3">What you’ll see once you log a block</figcaption>
        <div className="tnum mt-4 font-display text-6xl font-semibold tracking-tight text-ink-3">—</div>
        <div className="mt-1 text-sm text-ink-3">days to exam</div>
        <div className="mt-8 grid gap-5">
          {['Attempted', 'Reviewed'].map((l) => (
            <div key={l}>
              <div className="mb-2 flex items-baseline justify-between text-sm"><span className="text-ink">{l}</span><span className="tnum text-ink-3">—</span></div>
              <Meter value={0} />
            </div>
          ))}
        </div>
      </figure>
    </main>
  )
}
