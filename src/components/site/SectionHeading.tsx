import { m } from 'framer-motion'
import { cn, pad } from '@/lib/utils'

interface Props {
  index?: number
  eyebrow: string
  heading: string
  description?: string
  className?: string
  align?: 'left' | 'center'
  id?: string
}

export function SectionHeading({ index, eyebrow, heading, description, className, align = 'left', id }: Props) {
  return (
    <div className={cn('mb-12 md:mb-16', align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      <m.p
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn('mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase', align === 'center' && 'justify-center')}
      >
        {typeof index === 'number' && <span className="text-dim">{pad(index)}</span>}
        <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
        <span>{eyebrow}</span>
      </m.p>
      <m.h2
        id={id}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl md:text-5xl"
      >
        {heading}
      </m.h2>
      {description && (
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={cn('mt-4 max-w-2xl text-base leading-relaxed text-pretty text-muted md:text-lg', align === 'center' && 'mx-auto')}
        >
          {description}
        </m.p>
      )}
    </div>
  )
}
