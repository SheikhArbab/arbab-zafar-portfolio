import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full rounded-lg border border-line-strong bg-black/30 px-3 text-sm text-fg placeholder:text-dim transition-colors focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:opacity-60 aria-[invalid=true]:border-red-400/70'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(control, 'h-10', className)} {...p} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...p },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(control, 'resize-y py-2.5 leading-relaxed', className)} {...p} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <select ref={ref} className={cn(control, 'h-10 appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b9894' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
      {...p}>
      {children}
    </select>
  )
})

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted', className)}>
      {children}
    </label>
  )
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-red-400">{children}</p>
}

export function Switch({ checked, onChange, label, id, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; id?: string; disabled?: boolean }) {
  return (
    <label htmlFor={id} className={cn('inline-flex cursor-pointer items-center gap-3 select-none', disabled && 'opacity-50')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent/60 bg-accent/80' : 'border-line-strong bg-white/[0.06]',
        )}
      >
        <span className={cn('absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  )
}
