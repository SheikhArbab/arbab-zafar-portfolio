import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-black hover:shadow-[0_0_0_1px_var(--accent),0_0_28px_-4px_var(--accent)] hover:-translate-y-px active:translate-y-0',
  outline:
    'border border-line-strong bg-white/[0.02] text-fg hover:border-accent/60 hover:bg-accent/[0.06] hover:text-white',
  ghost: 'text-muted hover:text-fg hover:bg-white/[0.05]',
  subtle: 'bg-white/[0.06] text-fg hover:bg-white/[0.1]',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[0.95rem]',
  icon: 'h-9 w-9',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
})

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
  to?: string
  children: ReactNode
}

/** Renders a router <Link> for internal paths, otherwise a plain anchor. */
export function LinkButton({ variant = 'primary', size = 'md', className, to, href, children, ...props }: LinkButtonProps) {
  const cls = buttonClass(variant, size, className)
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }
  const external = href ? /^https?:/i.test(href) : false
  return (
    <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
      {children}
    </a>
  )
}
