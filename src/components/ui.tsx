import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Loader2, X } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 active:brightness-95 border border-transparent',
  secondary: 'bg-surface text-ink border border-rule-strong hover:border-accent hover:text-ink active:bg-sunken',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:bg-sunken active:bg-rule',
  danger: 'bg-transparent text-bad border border-transparent hover:bg-bad-soft active:brightness-95',
}

export function Button({
  variant = 'secondary', loading, className = '', children, disabled, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-ctl px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`min-w-0 rounded-card border border-rule bg-surface ${className}`}>{children}</section>
}

export function CardHead({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5">
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-ink-3">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

const field =
  'w-full rounded-ctl border border-rule-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mono-label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  )
}
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${field} ${p.className ?? ''}`} />
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${field} ${p.className ?? ''}`} />
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`${field} ${p.className ?? ''}`} />

export function Segmented<T extends string>({
  value, onChange, options, label,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-ctl border border-rule-strong bg-paper p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-8 rounded-[4px] px-3 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-accent text-accent-ink' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('input,select,textarea,button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`rise relative flex max-h-[92dvh] w-full flex-col rounded-t-card border border-rule bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)] sm:rounded-card ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-ctl p-1.5 text-ink-3 hover:bg-sunken hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export function Meter({ value, markers = [], tone = 'accent' }: { value: number; markers?: { at: number; label: string }[]; tone?: 'accent' | 'good' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="relative h-2 w-full rounded-full bg-sunken" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone === 'good' ? 'bg-good' : 'bg-accent'}`}
        style={{ width: `${pct}%` }}
      />
      {markers.map((m) => (
        <span key={m.label} className="absolute -top-1 h-4 w-px bg-ink-3" style={{ left: `${m.at}%` }} title={m.label} />
      ))}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="font-display text-base text-ink">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-3">{children}</p>}
    </div>
  )
}
