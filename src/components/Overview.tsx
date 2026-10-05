import { ArrowRight, Settings2 } from 'lucide-react'
import { Bar, Heatmap, TrendChart } from './charts'
import { Button, Card, CardHead, Empty, Meter } from './ui'
import { useData } from '../lib/data'
import { fmtDate } from '../lib/dates'
import { bySystem, fmtNum, fmtPct, pace, streak, tally } from '../lib/stats'
import type { Block } from '../lib/types'

const STATUS: Record<string, { label: string; cls: string }> = {
  ahead: { label: 'Ahead of pace', cls: 'bg-good-soft text-good' },
  'on-track': { label: 'On pace', cls: 'bg-accent-soft text-accent' },
  behind: { label: 'Behind pace', cls: 'bg-warn-soft text-warn' },
  done: { label: 'Goal reached', cls: 'bg-good-soft text-good' },
  'no-data': { label: 'No blocks yet', cls: 'bg-sunken text-ink-3' },
  unset: { label: 'Set up goals', cls: 'bg-sunken text-ink-3' },
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="mono-label">{label}</div>
      <div className="tnum mt-1.5 font-display text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {sub && <div className="tnum mt-1 truncate text-sm text-ink-3">{sub}</div>}
    </div>
  )
}

export function Overview({ onLog, onSettings, onOpenBlocks }: { onLog: () => void; onSettings: () => void; onOpenBlocks: () => void }) {
  const { blocks, settings } = useData()
  const t = tally(blocks)
  const p = pace(blocks, settings)
  const s = streak(blocks)
  const setup = settings.totalQuestions === 0 || !settings.examDate
  const pctOf = (n: number) => (settings.totalQuestions ? (n / settings.totalQuestions) * 100 : 0)
  const weakest = bySystem(blocks).filter((x) => x.attempted - x.omitted >= 1)
  const lowest = new Set(weakest.slice(0, 3).map((x) => x.system))
  const recent = [...blocks].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5)
  const status = STATUS[p.status]

  return (
    <div className="grid gap-5">
      {setup && (
        <Card className="border-accent/40 bg-accent-soft/40">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Set your QBank total and exam date</h2>
              <p className="mt-0.5 text-sm text-ink-2">Pace targets need both. Take the total from your UWorld account; the tracker doesn’t connect to it.</p>
            </div>
            <Button variant="primary" onClick={onSettings}><Settings2 className="size-4" />Set goals</Button>
          </div>
        </Card>
      )}

      <Card className="rise">
        <div className="grid grid-cols-2 divide-rule max-md:[&>*:nth-child(n+3)]:border-t max-md:[&>*]:border-rule md:grid-cols-4 md:divide-x">
          <Stat label="Attempted" value={fmtNum(t.attempted)} sub={settings.totalQuestions ? `of ${fmtNum(settings.totalQuestions)} · ${pctOf(t.attempted).toFixed(1)}%` : 'total not set'} />
          <Stat label="Accuracy" value={fmtPct(t.pct)} sub={t.attempted ? `${fmtNum(t.correct)} correct · ${fmtNum(t.incorrect)} wrong` : 'no answers yet'} />
          <Stat label="Days to exam" value={p.daysLeft === null ? '—' : String(p.daysLeft)} sub={settings.examDate ? fmtDate(settings.examDate, { month: 'short', day: 'numeric', year: 'numeric' }) : 'date not set'} />
          <Stat label="Streak" value={`${s.current}d`} sub={`best ${s.best}d`} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card>
          <CardHead
            title="Progress"
            hint={settings.totalQuestions ? `Goal ${settings.goalPct}% · fallback ${settings.fallbackPct}% of ${fmtNum(settings.totalQuestions)}` : 'Set a QBank total to see goal markers'}
            action={<span className={`mono-label rounded-ctl px-2 py-1 ${status.cls}`}>{status.label}</span>}
          />
          <div className="grid gap-6 px-5 pb-5 pt-5">
            {([['Attempted', t.attempted, 'accent'], ['Reviewed', t.reviewed, 'good']] as const).map(([label, n, tone]) => (
              <div key={label}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink">{label}</span>
                  <span className="tnum text-sm text-ink-3">{fmtNum(n)}{settings.totalQuestions ? ` · ${pctOf(n).toFixed(1)}%` : ''}</span>
                </div>
                <Meter value={pctOf(n)} tone={tone} markers={settings.totalQuestions ? [{ at: settings.fallbackPct, label: `Fallback ${settings.fallbackPct}%` }, { at: settings.goalPct, label: `Goal ${settings.goalPct}%` }] : []} />
              </div>
            ))}
            <dl className="tnum grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule pt-4 text-sm sm:grid-cols-3">
              <div><dt className="mono-label">To goal</dt><dd className="mt-1 text-ink">{settings.totalQuestions ? fmtNum(p.remainingGoal) : '—'}</dd></div>
              <div><dt className="mono-label">Needed / day</dt><dd className="mt-1 text-ink">{p.perDayGoal === null ? '—' : p.perDayGoal.toFixed(1)}</dd></div>
              <div><dt className="mono-label">Last 7 days / day</dt><dd className="mt-1 text-ink">{blocks.length ? p.avg7.toFixed(1) : '—'}</dd></div>
              <div><dt className="mono-label">Fallback / day</dt><dd className="mt-1 text-ink">{p.perDayFallback === null ? '—' : p.perDayFallback.toFixed(1)}</dd></div>
              <div className="col-span-2"><dt className="mono-label">Projected by exam day at your 7-day rate</dt><dd className="mt-1 text-ink">{p.projected === null || !blocks.length ? '—' : `${fmtNum(Math.round(p.projected))} questions`}</dd></div>
            </dl>
          </div>
        </Card>

        <Card>
          <CardHead title="Weakest systems" hint="Lowest percent correct first" />
          {weakest.length === 0 ? (
            <Empty title="Nothing to rank yet">Log a block and its system shows up here.</Empty>
          ) : (
            <ul className="grid gap-4 p-5">
              {weakest.slice(0, 6).map((r) => (
                <li key={r.system}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{r.system}</span>
                    <span className="tnum shrink-0 text-ink-3">{fmtPct(r.pct)} · {r.attempted} Qs</span>
                  </div>
                  <Bar pct={r.pct} tone={lowest.has(r.system) ? 'warn' : 'accent'} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHead title="Accuracy trend" hint="Each dot is a block; the line is a 5-block average" />
          <div className="p-5"><TrendChart blocks={blocks} /></div>
        </Card>
        <Card>
          <CardHead title="Activity" hint="Questions attempted per day · last 16 weeks" />
          <div className="p-5"><Heatmap blocks={blocks} /></div>
        </Card>
      </div>

      <Card>
        <CardHead title="Recent blocks" action={<Button variant="ghost" onClick={onOpenBlocks}>All blocks <ArrowRight className="size-4" /></Button>} />
        {recent.length === 0 ? (
          <Empty title="No blocks logged yet">
            <Button variant="primary" className="mt-3" onClick={onLog}>Log your first block</Button>
          </Empty>
        ) : (
          <ul className="divide-y divide-rule px-5 pb-1 pt-2">
            {recent.map((b) => <RecentRow key={b.id} b={b} />)}
          </ul>
        )}
      </Card>
    </div>
  )
}

function RecentRow({ b }: { b: Block }) {
  const answered = b.total - b.omitted
  const pct = answered > 0 ? (b.correct / answered) * 100 : null
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm text-ink">{b.name || b.system}</div>
        <div className="mono-label mt-0.5 truncate">{fmtDate(b.date)} · {b.system} · {b.mode}</div>
      </div>
      <div className="tnum shrink-0 text-right text-sm">
        <span className="text-ink">{fmtPct(pct)}</span>
        <span className="ml-2 text-ink-3">{b.correct}/{b.total}</span>
      </div>
    </li>
  )
}
