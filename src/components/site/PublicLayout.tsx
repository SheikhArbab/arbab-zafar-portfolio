import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { usePortfolio } from '@/data/PortfolioContext'
import { useMotionLevel } from '@/lib/motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function useAccentVars() {
  const { data } = usePortfolio()
  const { accent_primary, accent_secondary, animation_level } = data.settings
  useEffect(() => {
    const root = document.documentElement
    if (/^#[0-9a-f]{3,8}$/i.test(accent_primary)) root.style.setProperty('--accent', accent_primary)
    if (/^#[0-9a-f]{3,8}$/i.test(accent_secondary)) root.style.setProperty('--accent-2', accent_secondary)
    root.dataset.motion = animation_level
  }, [accent_primary, accent_secondary, animation_level])
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const { data } = usePortfolio()
  useAccentVars()
  const level = useMotionLevel(data.settings.animation_level)

  return (
    <MotionConfig reducedMotion={level === 'full' ? 'never' : 'always'}>
      <a href="#main" className="sr-only z-[200] rounded-md bg-accent px-3 py-2 text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <div className="relative min-h-screen">
        {/* Global ambient backdrop */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,color-mix(in_oklab,var(--accent-2)_7%,transparent),transparent_60%),radial-gradient(900px_500px_at_0%_10%,color-mix(in_oklab,var(--accent)_6%,transparent),transparent_60%)]" />
        </div>
        <Navbar />
        {children}
        <Footer />
      </div>
    </MotionConfig>
  )
}
