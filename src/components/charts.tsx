import { useState } from 'react'
import type { Block } from '../lib/types'
import { addDays, fmtDate, parseISO, today } from '../lib/dates'
import { perDay, trend } from '../lib/stats'

/** GitHub-style grid of questions attempted per day, oldest week on the left. */
export function Heatmap({ blocks, weeks = 16 }: { blocks: Block[]; weeks?: number }) {
  const counts = perDay(blocks)
  const t = today()
  const dow = parseISO(t).getDay() // 0 = Sunday
  const start = addDays(t, -(dow + (weeks - 1) * 7))
  const max = Math.max(40, ...counts.values())
  const [hover, setHover] = useState<string | null>(null)

  const cols = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  )
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)))
  const fill = ['bg-sunken', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent']

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1" role="img" aria-label="Questions attempted per day, last 16 weeks">
        {cols.map((col, i) => (
          <div key={i} className="grid shrink-0 grid-rows-7 gap-1">
            {col.map((day) => {
              const n = counts.get(day) ?? 0
              const future = day > t
              return (
                <div
                  key={day}
                  onMouseEnter={() => setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  title={`${fmtDate(day, { month: 'short', day: 'numeric', year: 'numeric' })}: ${n} questions`}
                  className={`size-3.5 rounded-[3px] ${future ? 'opacity-0' : fill[level(n)]} ${day === t ? 'ring-1 ring-ink-3' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-3">
        <span className="tnum min-h-4">
          {hover ? `${fmtDate(hover, { weekday: 'short', month: 'short', day: 'numeric' })} · ${counts.get(hover) ?? 0} Qs` : 'Hover a day for its count'}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          less {fill.map((f) => <i key={f} className={`size-3 rounded-[3px] ${f}`} />)} more
        </span>
      </div>
    </div>
  )
}

/** Percent correct per block with a trailing 5-block average. */
export function TrendChart({ blocks }: { blocks: Block[] }) {
  const pts = trend(blocks)
  const W = 640, H = 220, L = 34, R = 10, T = 12, B = 22
  if (pts.length < 2) {
    return <p className="px-1 py-10 text-center text-sm text-ink-3">Log at least two blocks to see your accuracy trend.</p>
  }
  const x = (i: number) => L + (i / (pts.length - 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / 100) * (H - T - B)
  const line = (key: 'pct' | 'avg') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Accuracy trend across ${pts.length} blocks; latest 5-block average ${last.avg.toFixed(0)} percent`}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="stroke-rule" strokeWidth={1} />
          <text x={L - 8} y={y(g) + 3.5} textAnchor="end" className="fill-ink-3 font-mono" fontSize={12}>{g}</text>
        </g>
      ))}
      {pts.map((p, i) => (
        <circle key={p.id} cx={x(i)} cy={y(p.pct)} r={3} className="fill-ink-3/60">
          <title>{`${fmtDate(p.date)} · ${p.name || 'Block'} · ${p.pct.toFixed(0)}%`}</title>
        </circle>
      ))}
      <path d={line('avg')} fill="none" className="stroke-accent" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(last.avg)} r={4.5} className="fill-accent stroke-surface" strokeWidth={2} />
      <text x={L} y={H - 4} className="fill-ink-3 font-mono" fontSize={12}>{fmtDate(pts[0].date)}</text>
      <text x={W - R} y={H - 4} textAnchor="end" className="fill-ink-3 font-mono" fontSize={12}>{fmtDate(last.date)}</text>
    </svg>
  )
}

export function Bar({ pct, tone = 'accent' }: { pct: number | null; tone?: 'accent' | 'warn' }) {
  const color = tone === 'warn' ? 'bg-warn' : 'bg-accent'
  return (
    <div className="h-1.5 w-full rounded-full bg-sunken">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct ?? 0}%` }} />
    </div>
  )
}
