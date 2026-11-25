import { lazy } from 'react'
import { usePortfolio } from '@/data/PortfolioContext'
import { ThreeSlot } from '@/components/three/ThreeSlot'
import { useLocale, useT } from '@/i18n'

const GlobeScene = lazy(() => import('@/components/three/GlobeScene'))

function GlobeFallback() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <circle cx="100" cy="100" r="72" fill="none" stroke="var(--accent-2)" strokeOpacity="0.3" />
      <ellipse cx="100" cy="100" rx="72" ry="26" fill="none" stroke="var(--accent-2)" strokeOpacity="0.18" />
      <ellipse cx="100" cy="100" rx="30" ry="72" fill="none" stroke="var(--accent-2)" strokeOpacity="0.18" />
      <path d="M128 118 Q 104 52 76 82" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="128" cy="118" r="3.5" fill="var(--accent)" />
      <circle cx="76" cy="82" r="3.5" fill="var(--accent-2)" />
    </svg>
  )
}
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/site/Reveal'

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** Deliberately compact: a personal note, not a headline section. */
export function German() {
  const { data } = usePortfolio()
  const t = useT()
  const locale = useLocale()
  const g = data.profile.german
  const cur = CEFR.indexOf(g.level.toUpperCase())
  const goal = CEFR.indexOf(g.goal.toUpperCase())

  return (
    <section aria-label={t.german.sectionLabel} lang="de" className="relative py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-white/[0.02] to-transparent p-5 md:p-6">
            <div aria-hidden className="absolute top-0 left-0 flex h-full w-1 flex-col">
              <span className="flex-1 bg-[#1a1a1a]" />
              <span className="flex-1 bg-[#dd0000]" />
              <span className="flex-1 bg-[#ffce00]" />
            </div>
            <div className="flex flex-col gap-6 pl-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-xs text-accent">{g.badge}</p>
                <h2 className="mt-1.5 text-lg font-semibold text-white">{g.headline}</h2>
                {g.note && <p className="mt-1 max-w-xl text-sm text-muted">{g.note}</p>}
                {g.points.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted" lang={locale}>
                    {g.points.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-accent-2" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-6">
                <div className="hidden h-[210px] w-[250px] md:block" lang="en">
                  <ThreeSlot
                    className="h-full w-full"
                    scene={GlobeScene}
                    props={{
                      from: { lat: 33.6844, lon: 73.0479, label: 'Islamabad, PK' },
                      to: { lat: 51.1657, lon: 10.4515, label: 'Deutschland' },
                      accent: data.settings.accent_primary,
                      accent2: data.settings.accent_secondary,
                    }}
                    fallback={<GlobeFallback />}
                  />
                </div>
                <div>
                <p className="mb-2 font-mono text-[0.62rem] tracking-widest text-dim uppercase">
                  {t.german.level(g.level, g.goal)}
                </p>
                <ol className="flex gap-1" aria-label={t.german.levelAria(g.level, g.goal)}>
                  {CEFR.map((l, i) => (
                    <li
                      key={l}
                      className={cn(
                        'grid h-8 w-10 place-items-center rounded-md border font-mono text-[0.7rem]',
                        i <= cur && 'border-accent/50 bg-accent/15 text-accent',
                        i > cur && i <= goal && 'border-dashed border-accent-2/50 text-accent-2',
                        i > goal && i > cur && 'border-line text-dim',
                      )}
                    >
                      {l}
                    </li>
                  ))}
                </ol>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
