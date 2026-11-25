import { Link } from 'react-router-dom'
import { ArrowUpRight, Bug, Gamepad2, Keyboard, Layers } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { Reveal } from '@/components/site/Reveal'
import { useLocalePath, useT } from '@/i18n'

export function PlaygroundTeaser() {
  const { data } = usePortfolio()
  const t = useT()
  const lp = useLocalePath()
  const copy = data.settings.content.playground
  const items = [
    { key: 'typing', name: 'Keystroke Sprint', Icon: Keyboard },
    { key: 'bugs', name: 'Bug Hunt', Icon: Bug },
    { key: 'memory', name: 'Stack Match', Icon: Layers },
  ]
  return (
    <section aria-label={t.playgroundTeaser.label} className="relative py-6">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="spotlight relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-accent/[0.04] via-transparent to-accent-2/[0.04] p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/[0.07] text-accent">
                  <Gamepad2 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-xs text-accent">// {copy.eyebrow}</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{copy.heading}</h2>
                  <p className="mt-0.5 text-sm text-muted">{t.playgroundTeaser.tagline}</p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2">
                {items.map(({ key, name, Icon }) => (
                  <li key={key}>
                    <Link
                      to={lp(`/playground?game=${key}`)}
                      className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-black/20 px-3 py-2 text-sm text-fg transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      <Icon className="h-4 w-4" aria-hidden /> {name}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
