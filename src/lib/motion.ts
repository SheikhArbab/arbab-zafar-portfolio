import { useEffect, useState } from 'react'
import type { AnimationLevel } from '@/types/content'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/** Effective animation level: admin setting, downgraded by the OS reduced-motion preference. */
export function useMotionLevel(setting: AnimationLevel): AnimationLevel {
  const reduced = usePrefersReducedMotion()
  if (setting === 'off') return 'off'
  return reduced ? 'reduced' : setting
}

export type ThreeMode = 'full' | 'lite' | 'none'

/** Decide (client-only) whether the device should run the WebGL hero. */
export function detectThreeMode(): ThreeMode {
  if (typeof window === 'undefined') return 'none'
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (nav.connection?.saveData) return 'none'
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return 'none'
    const cores = nav.hardwareConcurrency ?? 4
    const memory = nav.deviceMemory ?? 4
    const small = window.matchMedia('(max-width: 767px)').matches
    if (small) return 'none' // phones: static visual, never download the ~1 MB 3D bundle
    if (cores <= 2 || memory < 2) return 'lite'
    return 'full'
  } catch {
    return 'none'
  }
}
