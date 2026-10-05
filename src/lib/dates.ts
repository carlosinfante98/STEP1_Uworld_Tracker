const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export function today(): string {
  return toISO(new Date())
}
export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function addDays(s: string, n: number): string {
  const d = parseISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export function daysBetween(from: string, to: string): number {
  const ms = parseISO(to).getTime() - parseISO(from).getTime()
  return Math.round(ms / 86_400_000)
}
export function fmtDate(s: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return parseISO(s).toLocaleDateString(undefined, opts)
}
