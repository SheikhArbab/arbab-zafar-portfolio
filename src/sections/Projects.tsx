import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { ProjectCard } from '@/components/site/ProjectCard'
import { Tilt } from '@/components/site/Tilt'
import { useT } from '@/i18n'

/** Bento spans that always fill complete rows, whatever the number of featured projects. */
function bento(n: number, i: number): { className: string; large?: boolean; horizontal?: boolean } {
  if (n === 1) return { className: 'lg:col-span-6', horizontal: true }
  if (n === 2) return { className: 'lg:col-span-3' }
  if (i === 0) return { className: 'lg:col-span-4 lg:row-span-2', large: true }
  if (i < 3) return { className: 'lg:col-span-2' }
  const rest = n - 3
  return rest === 1 ? { className: 'lg:col-span-6', horizontal: true } : { className: 'lg:col-span-3' }
}

const ALL = '__all'

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass rounded-2xl p-10 text-center font-mono text-sm">
      <p className="text-accent">$ ls ./projects</p>
      <p className="mt-2 text-muted">{message}</p>
    </div>
  )
}

export function Projects({ index }: { index: number }) {
  const { data } = usePortfolio()
  const t = useT()
  const { projects, settings } = data
  const featured = projects.filter((p) => p.is_featured).slice(0, 5)
  const fCopy = settings.content.featured
  const aCopy = settings.content.projects
  const showLinks = settings.project_links === 'cards'

  const categories = useMemo(() => [ALL, ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))], [projects])
  const [cat, setCat] = useState(ALL)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (cat !== ALL && p.category !== cat) return false
      if (!q) return true
      return [p.title, p.short_description, p.category, ...p.technologies].join(' ').toLowerCase().includes(q)
    })
  }, [projects, cat, query])

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="projects-title" index={index} eyebrow={fCopy.eyebrow} heading={fCopy.heading} description={fCopy.description} />

        {projects.length === 0 && <EmptyState message={t.projects.empty} />}

        {featured.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            {featured.map((p, i) => {
              const layout = bento(featured.length, i)
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.06} className={cn('h-full', layout.className)}>
                  <Tilt max={layout.large || layout.horizontal ? 3.5 : 6}>
                    <ProjectCard project={p} index={i} large={layout.large} horizontal={layout.horizontal} showLinks={showLinks} />
                  </Tilt>
                </Reveal>
              )
            })}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-24">
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">// {aCopy.eyebrow}</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{aCopy.heading}</h2>
                {aCopy.description && <p className="mt-2 text-muted">{aCopy.description}</p>}
              </div>
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
                <label htmlFor="project-search" className="sr-only">
                  {t.projects.search}
                </label>
                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.projects.searchPlaceholder}
                  className="h-10 w-full rounded-lg border border-line-strong bg-black/30 pr-9 pl-9 font-mono text-sm text-fg placeholder:text-dim focus:border-accent/60 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label={t.projects.clearSearch} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-dim hover:text-fg">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {categories.length > 2 && (
              <div role="tablist" aria-label={t.projects.filter} className="mb-8 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    onClick={() => setCat(c)}
                    className={cn(
                      'relative rounded-lg px-3.5 py-1.5 font-mono text-xs transition-colors',
                      cat === c ? 'text-black' : 'border border-line text-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    {cat === c && <m.span layoutId="proj-cat" className="absolute inset-0 rounded-lg bg-accent" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />}
                    <span className="relative">
                      {c === ALL ? t.projects.all : c} <span className="opacity-60">{c === ALL ? projects.length : projects.filter((p) => p.category === c).length}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState message={t.projects.noMatches(query)} />
            ) : (
              <m.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((p) => (
                    <m.li
                      key={p.id}
                      layout
                      className="h-full"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Tilt>
                        <ProjectCard project={p} index={projects.indexOf(p)} showLinks={showLinks} />
                      </Tilt>
                    </m.li>
                  ))}
                </AnimatePresence>
              </m.ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
