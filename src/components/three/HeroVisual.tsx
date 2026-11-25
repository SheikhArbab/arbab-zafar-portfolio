import { lazy, Suspense, useEffect, useState } from 'react'
import { detectThreeMode, type ThreeMode } from '@/lib/motion'
import type { AnimationLevel } from '@/types/content'
import { HeroFallback } from './HeroFallback'

const HeroScene = lazy(() => import('./HeroScene'))

interface Props {
  accent: string
  accent2: string
  enabled: boolean
  motion: AnimationLevel
}

/** Decides at runtime whether to mount WebGL. The 3D bundle is code-split and fetched only when used. */
export function HeroVisual({ accent, accent2, enabled, motion }: Props) {
  const [mode, setMode] = useState<ThreeMode>('none')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!enabled || motion !== 'full') {
      setMode('none')
      return
    }
    // Defer until the browser is idle so 3D never competes with first paint / LCP.
    const run = () => setMode(detectThreeMode())
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 1500 })
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id)
    }
    const t = setTimeout(run, 400)
    return () => clearTimeout(t)
  }, [enabled, motion])

  useEffect(() => {
    if (mode === 'none') return
    const t = setTimeout(() => setLoaded(true), 250)
    return () => clearTimeout(t)
  }, [mode])

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${loaded ? 'opacity-0' : 'opacity-100'}`}>
        <HeroFallback animate={motion !== 'off'} />
      </div>
      {mode !== 'none' && (
        <Suspense fallback={null}>
          <div className={`absolute inset-0 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            <HeroScene accent={accent} accent2={accent2} lite={mode === 'lite'} />
          </div>
        </Suspense>
      )}
    </div>
  )
}
