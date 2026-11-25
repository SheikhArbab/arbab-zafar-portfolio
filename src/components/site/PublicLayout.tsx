import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { usePortfolio } from '@/data/PortfolioContext'
import { useMotionLevel } from '@/lib/motion'
import { useT } from '@/i18n'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppChat } from './WhatsAppChat'
import { CustomCursor } from './CustomCursor'
import { useGlassSheen } from '@/lib/liquidGlass'

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
  useGlassSheen()
  const level = useMotionLevel(data.settings.animation_level)
  const { pathname, hash } = useLocation()
  const t = useT()
  // New page without a section hash: start at the top (otherwise the old scroll offset carries over).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <MotionConfig reducedMotion={level === 'full' ? 'never' : 'always'}>
      <a href="#main" className="sr-only z-[200] rounded-md bg-accent px-3 py-2 text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t.common.skipToContent}
      </a>
      <div className="relative min-h-screen">
        {/* Global ambient backdrop */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 print:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,color-mix(in_oklab,var(--accent-2)_7%,transparent),transparent_60%),radial-gradient(900px_500px_at_0%_10%,color-mix(in_oklab,var(--accent)_6%,transparent),transparent_60%)]" />
        </div>
        <Navbar />
        {children}
        <Footer />
        <WhatsAppChat />
        <CustomCursor />
        <div aria-hidden className="scroll-progress" />
      </div>
    </MotionConfig>
  )
}
