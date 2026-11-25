import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { navSections } from '@/data/sections'
import { cn, pad } from '@/lib/utils'
import { SectionLink } from './SectionLink'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLiquidLens } from '@/lib/liquidGlass'
import { useLocalePath, useT } from '@/i18n'

export function BrandMark({ className }: { className?: string }) {
  const { data } = usePortfolio()
  const lp = useLocalePath()
  const t = useT()
  const initials = data.profile.full_name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toLowerCase()
  return (
    <Link
      to={lp('/')}
      className={cn('group inline-flex items-center gap-2.5 font-mono', className)}
      aria-label={`${data.profile.short_name.toLowerCase()}.dev, ${data.profile.full_name}, ${t.common.home}`}
    >
      <span aria-hidden className="relative grid h-8 w-8 place-items-center rounded-md border border-accent/40 bg-accent/[0.06] text-[0.8rem] font-semibold text-accent transition-shadow group-hover:glow">
        {initials}
        <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="hidden text-sm text-fg sm:inline">
        {data.profile.short_name.toLowerCase()}
        <span className="text-accent">.dev</span>
        <span aria-hidden className="ml-0.5 inline-block w-1.5 animate-blink text-accent">_</span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const { data } = usePortfolio()
  const sections = navSections(data)
  const { pathname } = useLocation()
  const t = useT()
  const lp = useLocalePath()
  const onHome = pathname === lp('/')
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  // Refract only once the bar turns into glass (at the top of the page it is transparent).
  useLiquidLens(bar, { strength: 14, bezel: 16, blur: 8, enabled: scrolled || open })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!onHome) return
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (vis) setActive(vis.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHome, sections.map((s) => s.id).join()])

  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])
  // The mobile menu only exists below md: close it (and release the scroll lock) when the window widens.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 print:hidden">
      <div
        ref={bar}
        className={cn(
          'mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-xl px-3 transition-all duration-300 sm:px-4',
          'mx-3 sm:mx-6 lg:mx-auto',
          scrolled || open ? 'glass [--glass-drop:0_12px_40px_-20px_rgb(0_0_0/0.8)]' : 'border border-transparent',
        )}
      >
        <BrandMark />
        <nav aria-label={t.common.navPrimary} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sections.slice(1).map((s, i) => (
              <li key={s.id}>
                <SectionLink
                  id={s.id}
                  className={cn(
                    'relative rounded-md px-3 py-1.5 text-sm transition-colors',
                    active === s.id && onHome ? 'text-white' : 'text-muted hover:text-fg',
                  )}
                  aria-current={active === s.id && onHome ? 'true' : undefined}
                >
                  <span className="mr-1 font-mono text-[0.62rem] text-dim">{pad(i + 1)}</span>
                  {s.label}
                  {active === s.id && onHome && (
                    <m.span layoutId="nav-active" className="absolute inset-x-2 -bottom-[3px] h-px bg-accent shadow-[0_0_8px_var(--accent)]" />
                  )}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {data.profile.is_available && (
            <span className="hidden items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.06] px-3 py-1 font-mono text-[0.65rem] text-accent lg:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {t.common.available}
            </span>
          )}
          <LanguageSwitcher />
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-fg hover:bg-white/5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-nav"
            aria-label={t.common.navMobile}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-3 mt-2 rounded-xl p-2 sm:mx-6 md:hidden"
          >
            <ul>
              {sections.map((s, i) => (
                <m.li key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <SectionLink
                    id={s.id}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base text-fg hover:bg-white/5"
                  >
                    <span className="font-mono text-xs text-accent">{pad(i)}</span>
                    {s.label}
                  </SectionLink>
                </m.li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
