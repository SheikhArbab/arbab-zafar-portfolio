import type { HTMLAttributes, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

/** Card with a cursor-following glow. Pure CSS vars, no re-renders. */
export function SpotlightCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div onMouseMove={onMove} className={cn('spotlight rounded-2xl border border-line bg-white/[0.015] transition-colors hover:border-line-strong', className)} {...rest}>
      {children}
    </div>
  )
}
