import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardHead, Empty, Field, Input, Modal, Textarea } from './ui'
import { useData } from '../lib/data'
import { fmtDate, today } from '../lib/dates'

export function PlanView() {
  const { tasks, addTask, toggleTask, deleteTask, assessments, addAssessment, deleteAssessment } = useData()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [a, setA] = useState({ name: '', date: today(), score: '', note: '' })

  const sorted = [...tasks].sort((x, y) => Number(x.done) - Number(y.done) || x.createdAt - y.createdAt)
  const exams = [...assessments].sort((x, y) => y.date.localeCompare(x.date))

  async function submitTask(e: React.FormEvent) {
    e.preventDefault()
    const v = text.trim()
    if (!v) return
    setText('')
    await addTask(v)
  }
  async function submitAssessment(e: React.FormEvent) {
    e.preventDefault()
    const score = Number(a.score)
    if (!a.name.trim() || Number.isNaN(score)) return
    await addAssessment({ name: a.name.trim(), date: a.date, score, note: a.note.trim() })
    setA({ name: '', date: today(), score: '', note: '' })
    setOpen(false)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHead title="Short-term goals" hint="What to focus on today and next" />
        <form onSubmit={submitTask} className="flex gap-2 px-5 pt-4">
          <Input aria-label="New reminder" placeholder="e.g. 2 blocks + recap Renal" value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" variant="primary" disabled={!text.trim()}><Plus className="size-4" />Add</Button>
        </form>
        {sorted.length === 0 ? (
          <Empty title="Nothing queued" />
        ) : (
          <ul className="divide-y divide-rule px-5 pb-2 pt-3">
            {sorted.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <input type="checkbox" checked={t.done} onChange={(e) => toggleTask(t.id, e.target.checked)} aria-label={`Done: ${t.text}`} className="size-4 shrink-0 accent-[var(--accent)]" />
                <span className={`min-w-0 flex-1 break-words text-sm ${t.done ? 'text-ink-3 line-through' : 'text-ink'}`}>{t.text}</span>
                <button onClick={() => deleteTask(t.id)} aria-label="Delete reminder" className="inline-flex size-11 items-center justify-center rounded-ctl text-ink-3 hover:bg-bad-soft md:size-9 hover:text-bad"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHead title="Self-assessments" hint="Log scores from UWorld or NBME assessments" action={<Button onClick={() => setOpen(true)}><Plus className="size-4" />Add</Button>} />
        {exams.length === 0 ? (
          <Empty title="No assessments yet">Enter the score exactly as the platform reports it.</Empty>
        ) : (
          <ul className="divide-y divide-rule px-5 pb-2 pt-2">
            {exams.map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">{x.name}</div>
                  <div className="mono-label mt-0.5 truncate">{fmtDate(x.date, { month: 'short', day: 'numeric', year: 'numeric' })}{x.note ? ` · ${x.note}` : ''}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tnum font-display text-xl font-semibold text-ink">{x.score}</span>
                  <button onClick={() => deleteAssessment(x.id)} aria-label="Delete assessment" className="inline-flex size-11 items-center justify-center rounded-ctl text-ink-3 hover:bg-bad-soft md:size-9 hover:text-bad"><Trash2 className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add assessment">
        <form onSubmit={submitAssessment} className="grid gap-4">
          <Field label="Name"><Input required value={a.name} placeholder="e.g. UWorld Self-Assessment 1" onChange={(e) => setA({ ...a, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><Input type="date" required value={a.date} max={today()} onChange={(e) => setA({ ...a, date: e.target.value })} /></Field>
            <Field label="Score"><Input required inputMode="decimal" value={a.score} placeholder="As reported" onChange={(e) => setA({ ...a, score: e.target.value })} /></Field>
          </div>
          <Field label="Note (optional)"><Textarea rows={2} value={a.note} onChange={(e) => setA({ ...a, note: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
