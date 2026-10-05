import { useEffect, useState } from 'react'
import { Button, Field, Input, Modal } from './ui'
import type { Settings } from '../lib/types'

export function SettingsDialog({
  open, onClose, settings, onSave,
}: { open: boolean; onClose: () => void; settings: Settings; onSave: (s: Settings) => Promise<void> }) {
  const [f, setF] = useState(settings)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (open) setF(settings) }, [open, settings])

  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n) || 0))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try { await onSave(f); onClose() } finally { setBusy(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Goals & exam date">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Exam date"><Input type="date" value={f.examDate} onChange={(e) => setF({ ...f, examDate: e.target.value })} /></Field>
        <Field label="Total questions in your QBank" hint="Read it from your UWorld account (Performance or Create Test). The tracker can’t fetch it.">
          <Input inputMode="numeric" value={f.totalQuestions || ''} placeholder="e.g. enter your own total" onChange={(e) => setF({ ...f, totalQuestions: Math.max(0, Math.floor(Number(e.target.value)) || 0) })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Goal (% of QBank)"><Input inputMode="numeric" value={f.goalPct} onChange={(e) => setF({ ...f, goalPct: clamp(Number(e.target.value)) })} /></Field>
          <Field label="Fallback (% of QBank)"><Input inputMode="numeric" value={f.fallbackPct} onChange={(e) => setF({ ...f, fallbackPct: clamp(Number(e.target.value)) })} /></Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>Save</Button>
        </div>
      </form>
    </Modal>
  )
}
