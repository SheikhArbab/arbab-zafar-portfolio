import { Fragment, useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { ArrowDown, ArrowUpRight, ChevronDown, Download, MapPin } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { useMotionLevel } from '@/lib/motion'
import { useTypewriter } from '@/lib/useTypewriter'
import { safeUrl } from '@/lib/utils'
import { Button, LinkButton } from '@/components/ui/Button'
import { SocialIcon, socialHref } from '@/components/ui/BrandIcons'
import { Terminal } from '@/components/site/Terminal'
import { HeroVisual } from '@/components/three/HeroVisual'

function Heading({ text, highlight }: { text: string; highlight: string }) {
  // Split heading into words; highlight the configured word/phrase. Each word reveals in sequence.
  const words = text.split(' ')
  const hl = highlight.trim().toLowerCase()
  return (
    <h1 className="text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-white sm:text-6xl lg:text-[4.6rem]">
      {words.map((w, i) => {
        const clean = w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '')
        const isHl = hl && hl.split(' ').includes(clean)
        return (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <m.span
                className={`inline-block ${isHl ? 'text-gradient' : ''}`}
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </m.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </h1>
  )
}

function CvMenu({ label }: { label: string }) {
  const { data } = usePortfolio()
  const cvs = data.documents.filter((d) => (d.kind === 'cv_en' || d.kind === 'cv_de') && safeUrl(d.file_url))
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])
  if (!cvs.length) return null
  if (cvs.length === 1)
    return (
      <LinkButton variant="outline" size="lg" href={cvs[0].file_url} download>
        <Download className="h-4 w-4" /> {label}
      </LinkButton>
    )
  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="lg" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <Download className="h-4 w-4" /> {label} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>
      {open && (
        <div role="menu" className="glass absolute top-full left-0 z-20 mt-2 w-56 rounded-lg p-1.5">
          {cvs
            .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'cv_en' ? -1 : 1))
            .map((d) => (
              <a
                key={d.id}
                role="menuitem"
                href={d.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-fg hover:bg-white/5"
              >
                {d.kind === 'cv_de' ? 'Lebenslauf · Deutsch' : 'Resume · English'}
                <span className="font-mono text-[0.65rem] text-accent">{d.kind === 'cv_de' ? 'DE' : 'EN'}</span>
              </a>
            ))}
        </div>
      )}
    </div>
  )
}

export function Hero() {
  const { data } = usePortfolio()
  const { profile, settings } = data
  const level = useMotionLevel(settings.animation_level)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const role = useTypewriter(profile.hero_roles, mounted && level === 'full')
  const socials = profile.socials.filter((s) => s.visible && ['github', 'linkedin'].includes(s.platform) && safeUrl(s.url))
  const c = settings.content.hero

  return (
    <section id="home" aria-label="Introduction" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16 lg:pt-28">
      {/* Background grid + horizon glow */}
      <div aria-hidden className="bg-grid mask-radial absolute inset-0 -z-10 opacity-70" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="mx-auto grid grid-cols-1 w-full max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
        <div className="relative z-10">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 flex flex-wrap items-center gap-3 font-mono text-[0.72rem]"
          >
            {profile.is_available && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1 text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {profile.availability_text}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-muted">
              <MapPin className="h-3 w-3" /> {profile.location}
            </span>
          </m.div>

          <p className="mb-4 font-mono text-sm text-muted">
            <span className="text-accent">~/</span>
            {profile.full_name.toLowerCase().replace(/\s+/g, '-')} <span className="text-dim">·</span> {profile.hero_eyebrow}
          </p>

          <Heading text={profile.hero_heading} highlight={profile.hero_highlight} />

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 flex h-7 items-center font-mono text-base text-accent-2 sm:text-lg"
            aria-label={profile.hero_roles.join(', ')}
          >
            <span className="mr-2 text-dim">&gt;</span>
            <span aria-hidden>{role}</span>
            <span aria-hidden className="ml-0.5 inline-block h-5 w-[2px] animate-blink bg-accent-2" />
          </m.p>

          {/* No opacity fade here: this paragraph is usually the LCP element. */}
          <m.p
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted sm:text-lg"
          >
            {profile.hero_description}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <LinkButton href="#projects" size="lg">
              {c.cta_projects} <ArrowDown className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
            </LinkButton>
            <CvMenu label={c.cta_cv} />
            <LinkButton href="#contact" variant="ghost" size="lg">
              {c.cta_contact} <ArrowUpRight className="h-4 w-4" />
            </LinkButton>
          </m.div>

          {socials.length > 0 && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex items-center gap-4">
              <span className="h-px w-10 bg-line-strong" />
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={safeUrl(socialHref(s.platform, s.url))}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-accent"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                  {s.label}
                </a>
              ))}
            </m.div>
          )}
        </div>

        {/* 3D core + terminal */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[560px] lg:-mr-10 lg:max-w-none">
            <HeroVisual accent={settings.accent_primary} accent2={settings.accent_secondary} enabled={settings.enable_3d} motion={level} />
            <div aria-hidden className="absolute top-6 left-4 font-mono text-[0.62rem] leading-5 text-dim sm:left-8">
              <p>sys.core // online</p>
              <p className="text-accent/70">render: realtime</p>
            </div>
          </div>
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 -mt-24 w-full sm:mx-auto sm:max-w-md lg:absolute lg:right-0 lg:-bottom-8 lg:mt-0 lg:w-[400px]"
          >
            <Terminal animate={level === 'full'} />
          </m.div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to about"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.6rem] tracking-[0.3em] text-dim uppercase md:flex"
      >
        scroll
        <span className="relative h-9 w-px overflow-hidden bg-line-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-accent" />
        </span>
      </a>
    </section>
  )
}
