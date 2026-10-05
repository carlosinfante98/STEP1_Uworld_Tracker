import { ArrowRight, Settings2 } from 'lucide-react'
import { Bar, Heatmap, TrendChart } from './charts'
import { Button, Card, Empty, Meter } from './ui'
import { useData } from '../lib/data'
import { fmtDate } from '../lib/dates'
import { bySystem, fmtNum, fmtPct, pace, streak, tally } from '../lib/stats'
import type { Block } from '../lib/types'
import type { ReactNode } from 'react'

const TONE: Record<string, string> = {
  ahead: 'text-good',
  'on-track': 'text-accent',
  behind: 'text-warn',
  done: 'text-good',
  'no-data': 'text-ink-3',
  unset: 'text-ink-3',
}

function headline(p: ReturnType<typeof pace>): { lead: string; detail: string } {
  const need = p.perDayGoal === null ? null : Math.ceil(p.perDayGoal)
  switch (p.status) {
    case 'done': return { lead: 'Goal reached', detail: 'You have hit your question target. Keep reviewing.' }
    case 'ahead': return { lead: 'Ahead of pace', detail: `At your 7-day rate you finish early. Needed: ${need ?? '—'} a day.` }
    case 'on-track': return { lead: 'On pace', detail: `Keep about ${need ?? '—'} questions a day to hit your goal.` }
    case 'behind': return { lead: 'Behind pace', detail: `You need ${need ?? '—'} questions a day; your last 7 days average ${p.avg7.toFixed(1)}.` }
    case 'no-data': return { lead: 'No blocks yet', detail: 'Log your first block to see where you stand.' }
    default: return { lead: 'Set your goals', detail: 'Add your QBank total and exam date to see pace.' }
  }
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-sm text-ink-3">{label}</div>
      <div className="tnum mt-0.5 font-display text-2xl font-semibold tracking-tight text-ink">{value}</div>
      {sub && <div className="tnum mt-0.5 truncate text-sm text-ink-3">{sub}</div>}
    </div>
  )
}

function Panel({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 border-t border-rule pt-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-ink-3">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
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
  const head = headline(p)

  return (
    <div className="grid gap-8">
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

      <section className="rise grid gap-6 border-b border-rule pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <h1 className={`text-4xl font-semibold tracking-tight md:text-5xl ${TONE[p.status]}`}>{head.lead}</h1>
          <p className="mt-2 max-w-xl text-base text-ink-2">{head.detail}</p>
        </div>
        <div className="tnum md:text-right">
          <div className="font-display text-5xl font-semibold tracking-tight text-ink md:text-6xl">{p.daysLeft === null ? '—' : p.daysLeft}</div>
          <div className="mt-1 text-sm text-ink-3">{settings.examDate ? `days to exam · ${fmtDate(settings.examDate, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'days to exam · date not set'}</div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-rule pb-6 sm:grid-cols-3 sm:divide-x sm:divide-rule [&>*+*]:sm:pl-6">
        <Stat label="Attempted" value={fmtNum(t.attempted)} sub={settings.totalQuestions ? `of ${fmtNum(settings.totalQuestions)} · ${pctOf(t.attempted).toFixed(1)}%` : 'total not set'} />
        <Stat label="Accuracy" value={fmtPct(t.pct)} sub={t.attempted ? `${fmtNum(t.correct)} correct · ${fmtNum(t.incorrect)} wrong` : 'no answers yet'} />
        <Stat label="Streak" value={`${s.current}d`} sub={`best ${s.best}d`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        <Panel
          title="Progress"
          hint={settings.totalQuestions ? `Goal ${settings.goalPct}% · fallback ${settings.fallbackPct}% of ${fmtNum(settings.totalQuestions)}` : 'Set a QBank total to see goal markers'}
        >
          <div className="grid gap-6 pt-5">
            {([['Attempted', t.attempted, 'accent'], ['Reviewed', t.reviewed, 'good']] as const).map(([label, n, tone]) => (
              <div key={label}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink">{label}</span>
                  <span className="tnum text-sm text-ink-3">{fmtNum(n)}{settings.totalQuestions ? ` · ${pctOf(n).toFixed(1)}%` : ''}</span>
                </div>
                <Meter value={pctOf(n)} tone={tone} markers={settings.totalQuestions ? [{ at: settings.fallbackPct, label: `Fallback ${settings.fallbackPct}%` }, { at: settings.goalPct, label: `Goal ${settings.goalPct}%` }] : []} />
              </div>
            ))}
            <dl className="tnum grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <div><dt className="text-sm text-ink-3">To goal</dt><dd className="mt-1 text-ink">{settings.totalQuestions ? fmtNum(p.remainingGoal) : '—'}</dd></div>
              <div><dt className="text-sm text-ink-3">Needed / day</dt><dd className="mt-1 text-ink">{p.perDayGoal === null ? '—' : p.perDayGoal.toFixed(1)}</dd></div>
              <div><dt className="text-sm text-ink-3">Last 7 days / day</dt><dd className="mt-1 text-ink">{blocks.length ? p.avg7.toFixed(1) : '—'}</dd></div>
              <div><dt className="text-sm text-ink-3">Fallback / day</dt><dd className="mt-1 text-ink">{p.perDayFallback === null ? '—' : p.perDayFallback.toFixed(1)}</dd></div>
              <div className="col-span-2"><dt className="text-sm text-ink-3">Projected by exam day at your 7-day rate</dt><dd className="mt-1 text-ink">{p.projected === null || !blocks.length ? '—' : `${fmtNum(Math.round(p.projected))} questions`}</dd></div>
            </dl>
          </div>
        </Panel>

        <Panel title="Weakest systems" hint="Lowest percent correct first">
          {weakest.length === 0 ? (
            <Empty title="Nothing to rank yet">Log a block and its system shows up here.</Empty>
          ) : (
            <ul className="grid gap-4 pt-5">
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
        </Panel>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Panel title="Accuracy trend" hint="Each dot is a block; the line is a 5-block average">
          <div className="pt-5"><TrendChart blocks={blocks} /></div>
        </Panel>
        <Panel title="Activity" hint="Questions attempted per day · last 16 weeks">
          <div className="pt-5"><Heatmap blocks={blocks} /></div>
        </Panel>
      </div>

      <Panel title="Recent blocks" action={<Button variant="ghost" onClick={onOpenBlocks}>All blocks <ArrowRight className="size-4" /></Button>}>
        {recent.length === 0 ? (
          <Empty title="No blocks logged yet">
            <Button variant="primary" className="mt-3" onClick={onLog}>Log your first block</Button>
          </Empty>
        ) : (
          <ul className="divide-y divide-rule pt-2">
            {recent.map((b) => <RecentRow key={b.id} b={b} />)}
          </ul>
        )}
      </Panel>
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
        <div className="mt-0.5 truncate text-sm text-ink-3">{fmtDate(b.date)} · {b.system} · {b.mode}</div>
      </div>
      <div className="tnum shrink-0 text-right text-sm">
        <span className="text-ink">{fmtPct(pct)}</span>
        <span className="ml-2 text-ink-3">{b.correct}/{b.total}</span>
      </div>
    </li>
  )
}
