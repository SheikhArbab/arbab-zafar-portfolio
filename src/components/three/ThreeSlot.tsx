import { Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { usePortfolio } from '@/data/PortfolioContext'
import { detectThreeMode, useMotionLevel } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Props<P extends object> {
  /** React.lazy() scene; its chunk is only fetched when the slot is mounted. */
  scene: LazyExoticComponent<ComponentType<P>>
  props: P
  /** Static content for phones, reduced motion, no WebGL, or while loading. */
  fallback: ReactNode
  className?: string
}

/**
 * Mounts a WebGL scene only when (1) 3D is enabled in admin settings, (2) motion is "full" and the
 * visitor doesn't prefer reduced motion, (3) the device can handle it (desktop/tablet with WebGL),
 * and (4) the slot is about to scroll into view. Everyone else gets the lightweight fallback.
 */
export function ThreeSlot<P extends object>({ scene: Scene, props, fallback, className }: Props<P>) {
  const { data } = usePortfolio()
  const level = useMotionLevel(data.settings.animation_level)
  const ref = useRef<HTMLDivElement>(null)
  const [capable, setCapable] = useState(false)
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCapable(data.settings.enable_3d && level === 'full' && detectThreeMode() !== 'none')
  }, [data.settings.enable_3d, level])

  useEffect(() => {
    if (!capable || !ref.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [capable])

  useEffect(() => {
    if (!near) return
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [near])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className={cn('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-0' : 'opacity-100')}>{fallback}</div>
      {capable && near && (
        <Suspense fallback={null}>
          <div className={cn('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}>
            <Scene {...props} />
          </div>
        </Suspense>
      )}
    </div>
  )
}

/** Pauses a canvas when it is off-screen or the tab is hidden. Returns a ref + "visible" flag. */
export function useInViewFrameloop() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && !document.hidden), { threshold: 0.01 })
    io.observe(el)
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < window.innerHeight)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
  return { ref, visible }
}
