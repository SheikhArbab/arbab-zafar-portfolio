import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Tag({ children, className, tone = 'default' }: { children: ReactNode; className?: string; tone?: 'default' | 'accent' | 'cyan' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[0.68rem] tracking-wide',
        tone === 'default' && 'border-line bg-white/[0.03] text-muted',
        tone === 'accent' && 'border-accent/30 bg-accent/[0.07] text-accent',
        tone === 'cyan' && 'border-accent-2/30 bg-accent-2/[0.07] text-accent-2',
        className,
      )}
    >
      {children}
    </span>
  )
}
