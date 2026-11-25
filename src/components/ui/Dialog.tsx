import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  side?: boolean // render as a right-hand sheet
}

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', side }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    // Move focus into the dialog for keyboard/screen-reader users, but never steal it from a
    // field inside the dialog that the user has already focused.
    const t = setTimeout(() => {
      if (!panel.current?.contains(document.activeElement)) panel.current?.focus()
    }, 30)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[100] flex', side ? 'justify-end' : 'items-end justify-center p-0 sm:items-center sm:p-6')}>
          <m.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <m.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={side ? { x: '100%' } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={side ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={side ? { x: '100%' } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={cn(
              'relative flex w-full flex-col border border-line-strong bg-[#0b0f10] shadow-2xl outline-none',
              side ? 'h-full max-w-2xl border-y-0 border-r-0' : cn('max-h-[92vh] rounded-t-2xl sm:rounded-2xl', widths[size]),
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-fg" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
