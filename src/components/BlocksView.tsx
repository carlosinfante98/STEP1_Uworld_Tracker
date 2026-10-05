import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Empty, Input, Select } from './ui'
import { useData } from '../lib/data'
import { fmtDate } from '../lib/dates'
import { fmtPct } from '../lib/stats'
import { SYSTEMS } from '../lib/constants'
import type { Block } from '../lib/types'

export function BlocksView({ onLog, onEdit }: { onLog: () => void; onEdit: (b: Block) => void }) {
  const { blocks, updateBlock, deleteBlock } = useData()
  const [q, setQ] = useState('')
  const [system, setSystem] = useState('')
  const [mode, setMode] = useState('')
  const [rev, setRev] = useState('')

  const rows = useMemo(
    () =>
      [...blocks]
        .filter((b) => (!system || b.system === system) && (!mode || b.mode === mode) && (!rev || String(b.reviewed) === rev))
        .filter((b) => !q || `${b.name} ${b.notes} ${b.system} ${b.subject}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [blocks, q, system, mode, rev],
  )

  return (
    <Card>
      <div className="grid gap-3 border-b border-rule p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
        <Input type="search" aria-label="Search blocks" placeholder="Search name or notes" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select aria-label="System" value={system} onChange={(e) => setSystem(e.target.value)}>
          <option value="">All systems</option>{SYSTEMS.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">Tutor + timed</option><option value="tutor">Tutor</option><option value="timed">Timed</option>
        </Select>
        <Select aria-label="Review status" value={rev} onChange={(e) => setRev(e.target.value)}>
          <option value="">Any review status</option><option value="true">Reviewed</option><option value="false">Not reviewed</option>
        </Select>
        <Button variant="primary" onClick={onLog}><Plus className="size-4" />Log block</Button>
      </div>

      {rows.length === 0 ? (
        <Empty title={blocks.length ? 'No blocks match these filters' : 'No blocks yet'}>
          {blocks.length ? 'Clear a filter to see more.' : 'After you finish a block in UWorld, log its score here.'}
        </Empty>
      ) : (
        <ul className="divide-y divide-rule">
          {rows.map((b) => {
            const answered = b.total - b.omitted
            const pct = answered > 0 ? (b.correct / answered) * 100 : null
            return (
              <li key={b.id} className="grid gap-x-4 gap-y-2 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="truncate text-sm font-medium text-ink">{b.name || b.system}</span>
                    <span className="mono-label">{b.mode}</span>
                  </div>
                  <div className="mono-label mt-0.5 truncate">{fmtDate(b.date, { month: 'short', day: 'numeric', year: 'numeric' })} · {b.system} · {b.subject}{b.minutes ? ` · ${b.minutes} min` : ''}</div>
                  {b.notes && <p className="mt-1.5 line-clamp-2 text-sm text-ink-3">{b.notes}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="tnum text-right text-sm"><span className="font-medium text-ink">{fmtPct(pct)}</span><span className="ml-2 text-ink-3">{b.correct}/{b.total}</span></div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateBlock(b.id, { reviewed: !b.reviewed })}
                      aria-pressed={b.reviewed}
                      title={b.reviewed ? 'Reviewed — click to undo' : 'Mark reviewed'}
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-ctl px-2 md:min-h-9 text-sm transition-colors hover:bg-sunken ${b.reviewed ? 'text-good' : 'text-ink-3'}`}
                    >
                      {b.reviewed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                      <span className="hidden sm:inline">{b.reviewed ? 'Reviewed' : 'Review'}</span>
                    </button>
                    <button onClick={() => onEdit(b)} aria-label="Edit block" className="inline-flex size-11 items-center justify-center rounded-ctl text-ink-3 hover:bg-sunken md:size-9 hover:text-ink"><Pencil className="size-4" /></button>
                    <button
                      onClick={() => { if (confirm('Delete this block?')) void deleteBlock(b.id) }}
                      aria-label="Delete block"
                      className="inline-flex size-11 items-center justify-center rounded-ctl text-ink-3 hover:bg-bad-soft md:size-9 hover:text-bad"
                    ><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
