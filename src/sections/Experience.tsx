import { useRef } from 'react'
import { m, useScroll, useSpring } from 'framer-motion'
import { Briefcase, MapPin } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { cn, dateRange, pad } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { Tag } from '@/components/ui/Tag'

export function Experience({ index }: { index: number }) {
  const { data } = usePortfolio()
  const items = data.experiences
  const copy = data.settings.content.experience
  const track = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="experience-title" index={index} eyebrow={copy.eyebrow} heading={copy.heading} description={copy.description} />

        <ol ref={track} className="relative ml-2 md:ml-0">
          {/* rail */}
          <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line md:left-[calc(11rem+7px)]" />
          <m.div
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-accent/0 shadow-[0_0_12px_var(--accent)] md:left-[calc(11rem+7px)]"
          />
          {items.map((job, i) => {
            const range = dateRange(job.start_date, job.end_date, job.is_current)
            return (
              <Reveal as="li" key={job.id} className="relative grid grid-cols-1 gap-3 pb-12 pl-9 last:pb-0 md:grid-cols-[11rem_1fr] md:gap-10 md:pl-0">
                <div className="font-mono text-xs md:pt-5 md:text-right md:pr-10">
                  <p className="text-accent">[{pad(items.length - i)}]</p>
                  {range && <p className="mt-1 text-muted">{range}</p>}
                </div>
                {/* node */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-1 left-0 grid h-[15px] w-[15px] place-items-center rounded-full border bg-bg md:top-6 md:left-[11rem]',
                    job.is_current ? 'border-accent' : 'border-line-strong',
                  )}
                >
                  <span className={cn('h-[5px] w-[5px] rounded-full', job.is_current ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : 'bg-muted')} />
                </span>

                <article className="group rounded-2xl border border-line bg-white/[0.015] p-5 transition-colors hover:border-line-strong md:p-6">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {job.logo_url && <img src={job.logo_url} alt={`${job.company} logo`} loading="lazy" className="h-10 w-10 rounded-lg border border-line object-contain p-1" />}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <p className="mt-0.5 text-sm text-muted">
                          <span className="text-fg">{job.company}</span>
                          {job.employment_type && <span> · {job.employment_type}</span>}
                        </p>
                      </div>
                    </div>
                    {job.is_current && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.07] px-2.5 py-0.5 font-mono text-[0.65rem] text-accent">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> current
                      </span>
                    )}
                  </header>
                  {job.location && (
                    <p className="mt-3 flex items-center gap-1.5 font-mono text-[0.7rem] text-dim">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </p>
                  )}
                  {job.description && <p className="mt-4 leading-relaxed text-muted">{job.description}</p>}
                  {job.responsibilities.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {job.responsibilities.map((r, k) => (
                        <li key={k} className="flex gap-3 text-sm leading-relaxed text-muted">
                          <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {job.achievements.length > 0 && (
                    <div className="mt-4 rounded-lg border border-accent/15 bg-accent/[0.03] p-3">
                      <p className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] tracking-widest text-accent uppercase">
                        <Briefcase className="h-3 w-3" /> highlights
                      </p>
                      <ul className="space-y-1.5 text-sm text-fg">
                        {job.achievements.map((a, k) => (
                          <li key={k}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {job.technologies.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
