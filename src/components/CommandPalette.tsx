import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'

export interface Command { id: string; label: string; hint?: string; run: () => void }

export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useMemo(() => commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())), [commands, q])

  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => input.current?.focus(), 0) } }, [open])
  useEffect(() => setI(0), [q])
  if (!open) return null

  const run = (c?: Command) => { if (c) { onClose(); c.run() } }
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="presentation">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="rise relative w-full max-w-lg overflow-hidden rounded-card border border-rule bg-surface">
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <Search className="size-4 text-ink-3" aria-hidden />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              else if (e.key === 'ArrowDown') { e.preventDefault(); setI((n) => Math.min(list.length - 1, n + 1)) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setI((n) => Math.max(0, n - 1)) }
              else if (e.key === 'Enter') run(list[i])
            }}
            placeholder="Type a command…"
            aria-label="Command"
            className="h-12 w-full bg-transparent font-mono text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-3">No matching command</li>}
          {list.map((c, idx) => (
            <li key={c.id} role="option" aria-selected={idx === i}>
              <button
                onMouseEnter={() => setI(idx)}
                onClick={() => run(c)}
                className={`flex w-full items-center justify-between gap-3 min-h-11 rounded-ctl px-3 py-2 text-left md:min-h-9 text-sm ${idx === i ? 'bg-accent-soft text-ink' : 'text-ink-2'}`}
              >
                <span className="truncate">{c.label}</span>
                {c.hint && <span className="mono-label shrink-0">{c.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
