import { useEffect, useState } from 'react'
import { Button, Field, Input, Modal, Segmented, Select, Textarea } from './ui'
import { DEFAULT_BLOCK_SIZE, SUBJECTS, SYSTEMS } from '../lib/constants'
import { today } from '../lib/dates'
import type { Block, BlockInput, Mode } from '../lib/types'

const blank = (): BlockInput => ({
  date: today(), name: '', system: SYSTEMS[0], subject: SUBJECTS[0], mode: 'tutor',
  total: DEFAULT_BLOCK_SIZE, correct: 0, omitted: 0, minutes: null, reviewed: false, notes: '',
})

const num = (v: string) => (v === '' ? 0 : Math.max(0, Math.floor(Number(v)) || 0))

export function BlockDialog({
  open, onClose, initial, onSave,
}: { open: boolean; onClose: () => void; initial?: Block | null; onSave: (b: BlockInput) => Promise<void> }) {
  const [f, setF] = useState<BlockInput>(blank)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setErr('')
      setF(initial ? { ...initial } : blank())
    }
  }, [open, initial])

  const set = <K extends keyof BlockInput>(k: K, v: BlockInput[K]) => setF((p) => ({ ...p, [k]: v }))
  const incorrect = f.total - f.correct - f.omitted

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (f.total < 1) return setErr('A block needs at least 1 question.')
    if (incorrect < 0) return setErr('Correct + omitted can’t be more than the total.')
    setBusy(true)
    try {
      await onSave({ ...f, name: f.name.trim(), notes: f.notes.trim() })
      onClose()
    } catch {
      setErr('Couldn’t save. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit block' : 'Log a block'} wide>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date"><Input type="date" required value={f.date} max={today()} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Name (optional)"><Input value={f.name} placeholder="e.g. Renal block 3" onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="System"><Select value={f.system} onChange={(e) => set('system', e.target.value)}>{SYSTEMS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Subject"><Select value={f.subject} onChange={(e) => set('subject', e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        </div>

        <div>
          <span className="mono-label mb-1.5 block">Mode</span>
          <Segmented<Mode> label="Mode" value={f.mode} onChange={(v) => set('mode', v)} options={[{ value: 'tutor', label: 'Tutor' }, { value: 'timed', label: 'Timed' }]} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Questions"><Input inputMode="numeric" value={f.total} onChange={(e) => set('total', num(e.target.value))} /></Field>
          <Field label="Correct"><Input inputMode="numeric" value={f.correct} onChange={(e) => set('correct', num(e.target.value))} /></Field>
          <Field label="Omitted"><Input inputMode="numeric" value={f.omitted} onChange={(e) => set('omitted', num(e.target.value))} /></Field>
          <Field label="Incorrect" hint="Calculated">
            <div className={`tnum rounded-ctl border border-rule bg-sunken px-3 py-2 text-sm ${incorrect < 0 ? 'text-bad' : 'text-ink'}`}>{incorrect}</div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minutes taken (optional)">
            <Input inputMode="numeric" value={f.minutes ?? ''} placeholder="—" onChange={(e) => set('minutes', e.target.value === '' ? null : num(e.target.value))} />
          </Field>
          <label className="flex items-end gap-2.5 pb-2 text-sm text-ink">
            <input type="checkbox" checked={f.reviewed} onChange={(e) => set('reviewed', e.target.checked)} className="size-4 accent-[var(--accent)]" />
            I’ve reviewed this block’s explanations
          </label>
        </div>

        <Field label="Notes (optional)"><Textarea rows={3} value={f.notes} placeholder="Concepts to revisit, patterns you keep missing…" onChange={(e) => set('notes', e.target.value)} /></Field>

        {err && <p role="alert" className="rounded-ctl bg-bad-soft px-3 py-2 text-sm text-bad">{err}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>{initial ? 'Save changes' : 'Log block'}</Button>
        </div>
      </form>
    </Modal>
  )
}
