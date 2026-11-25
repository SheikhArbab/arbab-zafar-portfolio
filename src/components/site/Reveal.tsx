import { m, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'article' | 'section'
}

/** Scroll-triggered fade/slide. Framer's MotionConfig(reducedMotion) disables the transform automatically. */
export function Reveal({ children, delay = 0, y = 24, as = 'div', ...rest }: RevealProps) {
  const Comp = m[as] as typeof m.div
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
