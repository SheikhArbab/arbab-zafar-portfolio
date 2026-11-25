import { usePortfolio } from '@/data/PortfolioContext'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/site/Reveal'

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** Deliberately compact: a personal note, not a headline section. */
export function German() {
  const { data } = usePortfolio()
  const g = data.profile.german
  const cur = CEFR.indexOf(g.level.toUpperCase())
  const goal = CEFR.indexOf(g.goal.toUpperCase())

  return (
    <section aria-label="German language learning" lang="de" className="relative py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-white/[0.02] to-transparent p-5 md:p-6">
            <div aria-hidden className="absolute top-0 left-0 flex h-full w-1 flex-col">
              <span className="flex-1 bg-[#1a1a1a]" />
              <span className="flex-1 bg-[#dd0000]" />
              <span className="flex-1 bg-[#ffce00]" />
            </div>
            <div className="flex flex-col gap-6 pl-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-xs text-accent">{g.badge}</p>
                <h2 className="mt-1.5 text-lg font-semibold text-white">{g.headline}</h2>
                {g.note && <p className="mt-1 max-w-xl text-sm text-muted">{g.note}</p>}
                {g.points.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted" lang="en">
                    {g.points.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-accent-2" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="shrink-0">
                <p className="mb-2 font-mono text-[0.62rem] tracking-widest text-dim uppercase">
                  Niveau {g.level} → Ziel {g.goal}
                </p>
                <ol className="flex gap-1" aria-label={`Current level ${g.level}, goal ${g.goal}`}>
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
        </Reveal>
      </div>
    </section>
  )
}
