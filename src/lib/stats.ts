import type { Block, Settings } from './types'
import { addDays, daysBetween, today } from './dates'

export interface Tally {
  attempted: number
  correct: number
  omitted: number
  incorrect: number
  reviewed: number
  blocks: number
  pct: number | null
}

export function tally(blocks: Block[]): Tally {
  let attempted = 0, correct = 0, omitted = 0, reviewed = 0
  for (const b of blocks) {
    attempted += b.total
    correct += b.correct
    omitted += b.omitted
    if (b.reviewed) reviewed += b.total
  }
  const answered = attempted - omitted
  return {
    attempted,
    correct,
    omitted,
    incorrect: attempted - correct - omitted,
    reviewed,
    blocks: blocks.length,
    pct: answered > 0 ? (correct / answered) * 100 : null,
  }
}

export function bySystem(blocks: Block[]) {
  const map = new Map<string, Block[]>()
  for (const b of blocks) {
    const arr = map.get(b.system) ?? []
    arr.push(b)
    map.set(b.system, arr)
  }
  return [...map.entries()]
    .map(([system, list]) => ({ system, ...tally(list) }))
    .sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101))
}

export function bySubject(blocks: Block[]) {
  const map = new Map<string, Block[]>()
  for (const b of blocks) {
    const arr = map.get(b.subject) ?? []
    arr.push(b)
    map.set(b.subject, arr)
  }
  return [...map.entries()]
    .map(([subject, list]) => ({ subject, ...tally(list) }))
    .sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101))
}

export function perDay(blocks: Block[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const b of blocks) m.set(b.date, (m.get(b.date) ?? 0) + b.total)
  return m
}

export function streak(blocks: Block[]): { current: number; best: number } {
  const days = new Set(blocks.map((b) => b.date))
  if (days.size === 0) return { current: 0, best: 0 }
  const t = today()
  let cursor = days.has(t) ? t : addDays(t, -1)
  let current = 0
  while (days.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }
  const sorted = [...days].sort()
  let best = 1, run = 1
  for (let i = 1; i < sorted.length; i++) {
    run = daysBetween(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1
    best = Math.max(best, run)
  }
  return { current, best }
}

export interface Pace {
  daysLeft: number | null
  goalQs: number
  fallbackQs: number
  remainingGoal: number
  remainingFallback: number
  perDayGoal: number | null
  perDayFallback: number | null
  avg7: number
  projected: number | null // attempted by exam day at the last-7-day rate
  status: 'unset' | 'done' | 'ahead' | 'on-track' | 'behind' | 'no-data'
}

export function pace(blocks: Block[], s: Settings): Pace {
  const t = tally(blocks)
  const goalQs = Math.round((s.totalQuestions * s.goalPct) / 100)
  const fallbackQs = Math.round((s.totalQuestions * s.fallbackPct) / 100)
  const remainingGoal = Math.max(0, goalQs - t.attempted)
  const remainingFallback = Math.max(0, fallbackQs - t.attempted)
  const daysLeft = s.examDate ? Math.max(0, daysBetween(today(), s.examDate)) : null

  const from = addDays(today(), -6)
  const last7 = blocks.filter((b) => b.date >= from).reduce((n, b) => n + b.total, 0)
  const avg7 = last7 / 7

  const perDayGoal = daysLeft && daysLeft > 0 ? remainingGoal / daysLeft : null
  const perDayFallback = daysLeft && daysLeft > 0 ? remainingFallback / daysLeft : null
  const projected = daysLeft !== null ? t.attempted + avg7 * daysLeft : null

  let status: Pace['status'] = 'on-track'
  if (!s.totalQuestions || daysLeft === null) status = 'unset'
  else if (remainingGoal === 0) status = 'done'
  else if (blocks.length === 0) status = 'no-data'
  else if (projected !== null && projected >= goalQs * 1.05) status = 'ahead'
  else if (projected !== null && projected >= goalQs * 0.95) status = 'on-track'
  else status = 'behind'

  return { daysLeft, goalQs, fallbackQs, remainingGoal, remainingFallback, perDayGoal, perDayFallback, avg7, projected, status }
}

/** Percent correct for each block in date order, with a trailing moving average. */
export function trend(blocks: Block[], window = 5) {
  const sorted = [...blocks]
    .filter((b) => b.total - b.omitted > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
  return sorted.map((b, i) => {
    const pct = (b.correct / (b.total - b.omitted)) * 100
    const slice = sorted.slice(Math.max(0, i - window + 1), i + 1)
    const sc = slice.reduce((n, x) => n + x.correct, 0)
    const sa = slice.reduce((n, x) => n + (x.total - x.omitted), 0)
    return { id: b.id, date: b.date, name: b.name, pct, avg: (sc / sa) * 100 }
  })
}

export const fmtPct = (n: number | null, digits = 0) => (n === null ? '—' : `${n.toFixed(digits)}%`)
export const fmtNum = (n: number) => n.toLocaleString()
