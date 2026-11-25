import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[0.6rem] tracking-[0.18em] text-dim uppercase">{label}</p>
      <p className={cn('mt-0.5 font-mono text-lg font-semibold tabular-nums', accent ? 'text-accent' : 'text-white')}>{value}</p>
    </div>
  )
}

export function GameFrame({ title, hud, children, footer }: { title: string; hud: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="glass hud overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.02] px-4 py-2.5 font-mono text-[0.7rem] text-dim">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-2 truncate">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-4 border-b border-line px-5 py-4 sm:grid-cols-4">{hud}</div>
      <div className="p-5 md:p-6">{children}</div>
      {footer && <div className="border-t border-line px-5 py-3 font-mono text-[0.68rem] text-dim">{footer}</div>}
    </div>
  )
}

export function ResultPanel({ title, lines, record, onRetry }: { title: string; lines: [string, ReactNode][]; record: boolean; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center" role="status">
      <p className="font-mono text-xs text-accent">{record ? '★ new personal best' : 'process exited with code 0'}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{title}</p>
      <dl className="mt-6 grid w-full max-w-md grid-cols-3 gap-3">
        {lines.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line p-3">
            <dt className="font-mono text-[0.6rem] tracking-widest text-dim uppercase">{k}</dt>
            <dd className="mt-1 font-mono text-lg text-white tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <button onClick={onRetry} className="mt-7 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black transition hover:shadow-[0_0_24px_-4px_var(--accent)]">
        Play again
      </button>
    </div>
  )
}
