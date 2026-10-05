import { Bar } from './charts'
import { Card, CardHead, Empty } from './ui'
import { useData } from '../lib/data'
import { bySubject, bySystem, fmtPct } from '../lib/stats'
import { SYSTEMS } from '../lib/constants'

type Row = { name: string; attempted: number; correct: number; omitted: number; pct: number | null }

function Breakdown({ title, hint, rows, empty }: { title: string; hint: string; rows: Row[]; empty: string }) {
  // Flag the three lowest, but only once there are enough answered questions to mean something.
  const rankable = rows.filter((r) => r.attempted - r.omitted >= 10)
  const lowest = new Set(rankable.slice(0, 3).map((r) => r.name))
  return (
    <Card>
      <CardHead title={title} hint={hint} />
      {rows.length === 0 ? (
        <Empty title={empty} />
      ) : (
        <ul className="grid gap-4 p-5">
          {rows.map((r) => (
            <li key={r.name}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink">{r.name}</span>
                <span className="tnum shrink-0 text-ink-3">{fmtPct(r.pct)} · {r.correct}/{r.attempted}</span>
              </div>
              <Bar pct={r.pct} tone={lowest.has(r.name) ? 'warn' : 'accent'} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function SystemsView() {
  const { blocks } = useData()
  const sys = bySystem(blocks).map((r) => ({ ...r, name: r.system }))
  const sub = bySubject(blocks).map((r) => ({ ...r, name: r.subject }))
  const untouched = SYSTEMS.filter((s) => !blocks.some((b) => b.system === s))

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Breakdown title="By system" hint="Lowest percent correct first. Amber marks the three lowest once a row has 10+ answered." rows={sys} empty="No blocks logged yet" />
        <Breakdown title="By subject" hint="Same view, sliced by discipline" rows={sub} empty="No blocks logged yet" />
      </div>
      {blocks.length > 0 && untouched.length > 0 && (
        <Card>
          <CardHead title="Not started" hint="Systems with no logged blocks" />
          <ul className="flex flex-wrap gap-2 p-5">
            {untouched.map((s) => <li key={s} className="rounded-ctl border border-rule bg-paper px-2.5 py-1 text-sm text-ink-2">{s}</li>)}
          </ul>
        </Card>
      )}
    </div>
  )
}
