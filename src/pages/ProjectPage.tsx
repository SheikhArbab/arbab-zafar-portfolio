import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, m } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { projectHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { formatMonth, liveLinkLabel, paragraphs, safeUrl } from '@/lib/utils'
import { intlLocale, useLocale, useLocalePath, useT } from '@/i18n'
import { Reveal } from '@/components/site/Reveal'
import { Tag } from '@/components/ui/Tag'
import { LinkButton } from '@/components/ui/Button'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { ProjectThumb } from '@/components/site/ProjectCard'
import { PageLoader } from '@/components/site/PageLoader'
import NotFound from './NotFound'
import type { ProjectImage } from '@/types/content'

function Lightbox({ images, index, onClose, onNav }: { images: ProjectImage[]; index: number | null; onClose: () => void; onNav: (i: number) => void }) {
  const t = useT()
  const dialog = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const isOpen = index !== null

  // Focus the close button on open, return focus to the thumbnail on close.
  useEffect(() => {
    if (!isOpen) return
    opener.current = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    return () => {
      opener.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onNav((index - 1 + images.length) % images.length)
      if (e.key === 'Tab' && dialog.current) {
        // keep focus inside the viewer
        const items = [...dialog.current.querySelectorAll<HTMLElement>('button')]
        const i = items.indexOf(document.activeElement as HTMLElement)
        e.preventDefault()
        items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, onNav])
  return (
    <AnimatePresence>
      {index !== null && (
        <m.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={t.caseStudy.imageViewer}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.img
            key={images[index].id}
            src={images[index].url}
            alt={images[index].alt}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[85vh] max-w-full rounded-lg border border-line object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button ref={closeBtn} className="absolute top-4 right-4 rounded-lg bg-white/10 p-2 text-white" onClick={onClose} aria-label={t.common.close}>
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button className="absolute left-3 rounded-lg bg-white/10 p-2 text-white" onClick={(e) => (e.stopPropagation(), onNav((index - 1 + images.length) % images.length))} aria-label={t.caseStudy.prevImage}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="absolute right-3 rounded-lg bg-white/10 p-2 text-white" onClick={(e) => (e.stopPropagation(), onNav((index + 1) % images.length))} aria-label={t.caseStudy.nextImage}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}

function Block({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="border-t border-line py-10">
        <h2 className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
          <span className="text-dim">{String(n).padStart(2, '0')}</span> {label}
        </h2>
        {children}
      </section>
    </Reveal>
  )
}

function Prose({ text, large }: { text: string; large?: boolean }) {
  return (
    <div className="space-y-4">
      {paragraphs(text).map((p, k) => (
        <p key={k} className={large ? 'leading-relaxed text-muted md:text-lg' : 'leading-relaxed text-muted'}>
          {p}
        </p>
      ))}
    </div>
  )
}

function Glance({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-3.5 last:border-0">
      <dt className="font-mono text-[0.62rem] tracking-[0.18em] text-dim uppercase">{label}</dt>
      <dd className="mt-1.5 text-sm text-fg">{children}</dd>
    </div>
  )
}

export default function ProjectPage() {
  const { slug } = useParams()
  const { data, ready } = usePortfolio()
  const t = useT()
  const locale = useLocale()
  const lp = useLocalePath()
  const i = data.projects.findIndex((p) => p.slug === slug)
  const project = data.projects[i]
  const [lightbox, setLightbox] = useState<number | null>(null)
  useHead(project ? projectHead(data, project, locale) : null)
  useEffect(() => {
    window.scrollTo(0, 0) // block body: scrollTo returns a Promise in new Chrome; never return it as a cleanup
  }, [slug])

  if (!project) return ready ? <NotFound /> : <PageLoader />

  const prev = data.projects[(i - 1 + data.projects.length) % data.projects.length]
  const next = data.projects[(i + 1) % data.projects.length]
  const linksMode = data.settings.project_links
  const live = linksMode !== 'hidden' ? safeUrl(project.live_url) : undefined
  const repo = linksMode !== 'hidden' ? safeUrl(project.repo_url) : undefined
  const gallery = project.project_images ?? []
  const started = formatMonth(project.started_on, intlLocale(locale))
  const done = formatMonth(project.completed_on, intlLocale(locale))
  const timeline = [started, done].filter(Boolean).join(' — ')

  // Only sections with real content are rendered, numbered in order.
  let n = 0
  const sections = [
    paragraphs(project.description).length > 0 && { key: 'overview', label: t.caseStudy.overview, body: <Prose text={project.description} large /> },
    project.role.trim() && { key: 'role', label: t.caseStudy.role, body: <Prose text={project.role} /> },
    project.challenges.trim() && {
      key: 'challenge',
      label: t.caseStudy.challenge,
      body: (
        <div className="rounded-xl border border-line p-5">
          <Prose text={project.challenges} />
        </div>
      ),
    },
    project.solutions.trim() && {
      key: 'solution',
      label: t.caseStudy.solution,
      body: (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <Prose text={project.solutions} />
        </div>
      ),
    },
    project.key_features.length > 0 && {
      key: 'features',
      label: t.caseStudy.features,
      body: (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {project.key_features.map((f, k) => (
            <li key={k} className="flex gap-3 rounded-xl border border-line bg-white/[0.015] p-4 text-sm text-fg">
              <span className="font-mono text-accent">{String(k + 1).padStart(2, '0')}</span>
              {f}
            </li>
          ))}
        </ul>
      ),
    },
    project.outcome.trim() && { key: 'outcome', label: t.caseStudy.outcome, body: <Prose text={project.outcome} /> },
    gallery.length > 0 && {
      key: 'gallery',
      label: t.caseStudy.gallery,
      body: (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {gallery.map((img, k) => (
            <li key={img.id}>
              <button onClick={() => setLightbox(k)} className="group block w-full overflow-hidden rounded-xl border border-line" aria-label={t.caseStudy.openImage(img.alt || project.title)}>
                <img src={img.url} alt={img.alt || `${project.title} screenshot ${k + 1}`} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </button>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as { key: string; label: string; body: React.ReactNode }[]

  return (
    <main id="main" className="pt-28 pb-20">
      <article className="mx-auto max-w-5xl px-5 sm:px-8">
        <nav aria-label={t.caseStudy.breadcrumb} className="mb-8 font-mono text-xs text-dim">
          <Link to={lp("/#projects")} className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
            <ArrowLeft className="h-3.5 w-3.5" /> ~/projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-fg">{project.slug}</span>
        </nav>

        <m.header initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t.caseStudy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white md:text-6xl">{project.title}</h1>
          {project.short_description && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{project.short_description}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.category && <Tag tone="accent">{project.category}</Tag>}
            {project.status && <Tag tone="cyan">{t.projects.status[project.status] ?? project.status}</Tag>}
            {timeline && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-dim">
                <Calendar className="h-3 w-3" /> {timeline}
              </span>
            )}
          </div>
        </m.header>

        <m.div initial={{ y: 24 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="group hud mt-10 overflow-hidden rounded-2xl border border-line">
          <ProjectThumb project={project} className="aspect-[16/9]" eager />
        </m.div>

        <div className="mt-12 grid grid-cols-1 gap-x-12 md:grid-cols-[1fr_17rem]">
          <div className="order-2 md:order-1">
            {sections.map((sec) => (
              <Block key={sec.key} n={++n} label={sec.label}>
                {sec.body}
              </Block>
            ))}
            {sections.length === 0 && (
              <p className="border-t border-line py-10 font-mono text-sm text-dim">{t.caseStudy.comingSoon}</p>
            )}
          </div>

          <aside className="order-1 md:order-2 md:pt-10">
            <div className="glass rounded-2xl px-5 py-2 md:sticky md:top-28">
              <p className="pt-3 font-mono text-[0.68rem] tracking-[0.2em] text-accent uppercase">{t.caseStudy.glance}</p>
              <dl>
                {project.category && <Glance label={t.caseStudy.type}>{project.category}</Glance>}
                {timeline && <Glance label={t.caseStudy.timeline}>{timeline}</Glance>}
                {project.status && <Glance label={t.caseStudy.status}>{t.projects.status[project.status] ?? project.status}</Glance>}
                {project.technologies.length > 0 && (
                  <Glance label={t.caseStudy.stack}>
                    <ul className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <li key={t}>
                          <Tag>{t}</Tag>
                        </li>
                      ))}
                    </ul>
                  </Glance>
                )}
                {(live || repo) && (
                  <Glance label={t.caseStudy.links}>
                    <div className="flex flex-col gap-2 pt-1">
                      {live && (
                        <LinkButton href={live} size="sm" className="justify-between">
                          {liveLinkLabel(live, t.links)} <ArrowUpRight className="h-3.5 w-3.5" />
                        </LinkButton>
                      )}
                      {repo && (
                        <LinkButton href={repo} variant="outline" size="sm" className="justify-between">
                          <span className="inline-flex items-center gap-2">
                            <GithubIcon className="h-3.5 w-3.5" /> {t.links.sourceCode}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </LinkButton>
                      )}
                    </div>
                  </Glance>
                )}
              </dl>
            </div>
          </aside>
        </div>

        <Reveal>
          <div className="glass hud mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl p-6 md:flex-row md:items-center md:p-8">
            <div>
              <p className="font-mono text-xs text-accent">{t.caseStudy.nextStep}</p>
              <p className="mt-2 text-xl font-semibold text-white">{t.caseStudy.nextStepTitle}</p>
            </div>
            <LinkButton to={lp("/#contact")}>
              {t.caseStudy.getInTouch} <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </Reveal>

        {data.projects.length > 1 && (
          <nav aria-label={t.caseStudy.more} className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to={lp(`/projects/${prev.slug}`)} className="group rounded-xl border border-line p-5 transition-colors hover:border-accent/30">
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] text-dim uppercase">
                <ArrowLeft className="h-3 w-3" /> {t.caseStudy.prev}
              </span>
              <span className="mt-2 block font-medium text-fg group-hover:text-white">{prev.title}</span>
            </Link>
            <Link to={lp(`/projects/${next.slug}`)} className="group rounded-xl border border-line p-5 text-right transition-colors hover:border-accent/30">
              <span className="flex items-center justify-end gap-1.5 font-mono text-[0.65rem] text-dim uppercase">
                {t.caseStudy.next} <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-2 block font-medium text-fg group-hover:text-white">{next.title}</span>
            </Link>
          </nav>
        )}
      </article>
      <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onNav={setLightbox} />
    </main>
  )
}
