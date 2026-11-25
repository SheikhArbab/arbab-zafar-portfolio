import { m } from 'framer-motion'
import { usePortfolio } from '@/data/PortfolioContext'
import { cn, pad } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { SpotlightCard } from '@/components/site/SpotlightCard'
import { ProficiencyMeter, SkillIcon } from '@/components/site/SkillIcon'

export function Skills({ index }: { index: number }) {
  const { data } = usePortfolio()
  const { skills, categories } = data
  const copy = data.settings.content.skills
  const featured = skills.filter((s) => s.is_featured)
  const groups = categories
    .map((c) => ({ cat: c, items: skills.filter((s) => s.category_id === c.id) }))
    .filter((g) => g.items.length)
  const uncategorized = skills.filter((s) => !s.category_id)
  if (uncategorized.length) groups.push({ cat: { id: 'other', name: 'Other', slug: 'other', description: '', sort_order: 999, is_visible: true }, items: uncategorized })

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div aria-hidden className="bg-grid-fine mask-radial absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="skills-title" index={index} eyebrow={copy.eyebrow} heading={copy.heading} description={copy.description} />

        {featured.length > 0 && (
          <Reveal className="mb-6">
            <div className="glass hud relative overflow-hidden rounded-2xl p-5 md:p-6">
              <p className="mb-4 font-mono text-[0.68rem] tracking-[0.18em] text-dim uppercase">
                <span className="text-accent">●</span> core stack
              </p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                {featured.map((s, i) => (
                  <m.li
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    whileHover={{ y: -3 }}
                    className="group flex flex-col items-center gap-2.5 rounded-xl border border-line bg-black/20 px-2 py-4 text-center transition-colors hover:border-accent/40"
                  >
                    <SkillIcon skill={s} className="h-7 w-7 opacity-80 transition-opacity group-hover:opacity-100" />
                    <span className="text-xs font-medium text-fg">{s.name}</span>
                    <ProficiencyMeter skill={s} />
                  </m.li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ cat, items }, i) => (
            <Reveal key={cat.id} delay={(i % 3) * 0.06}>
              <SpotlightCard className="h-full p-5 md:p-6">
                <div className="mb-5 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.65rem] text-accent">{pad(i + 1)} /</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{cat.name}</h3>
                    {cat.description && <p className="mt-0.5 text-sm text-dim">{cat.description}</p>}
                  </div>
                  <span className="font-mono text-xs text-dim">{pad(items.length)}</span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                        s.is_featured ? 'border-accent/25 bg-accent/[0.04] text-white' : 'border-line bg-white/[0.02] text-fg hover:border-line-strong',
                      )}
                    >
                      <SkillIcon skill={s} className="h-4 w-4 opacity-75" />
                      {s.name}
                      <ProficiencyMeter skill={s} />
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
