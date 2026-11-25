import { Award, BookOpen, ExternalLink, FileText, GraduationCap, Wrench } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { safeUrl } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { SpotlightCard } from '@/components/site/SpotlightCard'
import type { EducationKind } from '@/types/content'
import { useT } from '@/i18n'

const icons: Record<EducationKind, typeof GraduationCap> = { education: GraduationCap, certification: Award, course: BookOpen, training: Wrench }

export function Education({ index }: { index: number }) {
  const { data } = usePortfolio()
  const copy = data.settings.content.education
  const items = data.education
  const t = useT().education

  return (
    <section id="education" aria-labelledby="education-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="education-title" index={index} eyebrow={copy.eyebrow} heading={copy.heading} description={copy.description} />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((e, i) => {
            const Icon = icons[e.kind] ?? GraduationCap
            const label = t.kinds[e.kind] ?? t.kinds.education
            const cred = safeUrl(e.credential_url)
            const cert = safeUrl(e.certificate_url)
            return (
              <Reveal as="li" key={e.id} delay={(i % 2) * 0.06}>
                <SpotlightCard className="flex h-full gap-4 p-5 md:p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/[0.06] text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.65rem] tracking-wider text-dim uppercase">
                      <span>{label}</span>
                      {e.date_label && <span>{e.date_label}</span>}
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold text-white">{e.title}</h3>
                    {e.institution && <p className="text-sm text-muted">{e.institution}</p>}
                    {e.description && <p className="mt-3 text-sm leading-relaxed text-muted">{e.description}</p>}
                    {(cred || cert) && (
                      <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
                        {cred && (
                          <a href={cred} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" /> {t.verify}
                          </a>
                        )}
                        {cert && (
                          <a href={cert} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent-2 hover:underline">
                            <FileText className="h-3.5 w-3.5" /> {t.certificate}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
