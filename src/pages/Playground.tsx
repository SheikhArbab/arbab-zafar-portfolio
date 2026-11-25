import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bug, Keyboard, Layers } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { playgroundHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { cn } from '@/lib/utils'
import { PageLoader } from '@/components/site/PageLoader'
import { readBest } from '@/playground/scores'

// Each game is its own small chunk, fetched only when opened.
const games = {
  typing: { name: 'Keystroke Sprint', blurb: 'Type real dev one-liners against the clock.', Icon: Keyboard, Comp: lazy(() => import('@/playground/KeystrokeSprint')) },
  bugs: { name: 'Bug Hunt', blurb: 'Squash bugs before they ship. Spare the features.', Icon: Bug, Comp: lazy(() => import('@/playground/BugHunt')) },
  memory: { name: 'Stack Match', blurb: 'Memory game built from my tech stack.', Icon: Layers, Comp: lazy(() => import('@/playground/StackMatch')) },
} as const

type GameKey = keyof typeof games
const isGame = (v: string | null): v is GameKey => v === 'typing' || v === 'bugs' || v === 'memory'

export default function Playground() {
  const { data } = usePortfolio()
  const copy = data.settings.content.playground
  const [params, setParams] = useSearchParams()
  const [best, setBest] = useState<ReturnType<typeof readBest>>({})
  // Games are client-only (random boards, timers, localStorage): the server and first
  // client render both show the placeholder, so hydration matches and nothing suspends on the server.
  // The ?game= query is also applied after mount, because prerendered HTML has no query string.
  const [mounted, setMounted] = useState(false)
  const fromUrl = params.get('game')
  const current: GameKey = mounted && isGame(fromUrl) ? fromUrl : 'typing'
  useHead(playgroundHead(data))
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    setBest(readBest())
  }, [current])

  const Game = games[current].Comp
  const bestLabel = (k: GameKey) => {
    const v = best[k]
    if (v === undefined) return 'not played yet'
    return k === 'typing' ? `best ${v} wpm` : k === 'bugs' ? `best ${v} pts` : `best ${v} moves`
  }

  return (
    <main id="main" className="pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> ~/home
        </Link>
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">// {copy.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white md:text-6xl">{copy.heading}</h1>
        {copy.description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{copy.description}</p>}

        <div role="tablist" aria-label="Choose a game" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(games) as GameKey[]).map((k) => {
            const { name, blurb, Icon } = games[k]
            const active = k === current
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setParams({ game: k }, { replace: true })}
                className={cn(
                  'group rounded-2xl border p-4 text-left transition-colors',
                  active ? 'border-accent/50 bg-accent/[0.06]' : 'border-line bg-white/[0.015] hover:border-line-strong',
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon className={cn('h-5 w-5', active ? 'text-accent' : 'text-muted group-hover:text-fg')} aria-hidden />
                  <span className="font-mono text-[0.62rem] text-dim">{bestLabel(k)}</span>
                </div>
                <p className="mt-3 font-semibold text-white">{name}</p>
                <p className="mt-1 text-sm text-muted">{blurb}</p>
              </button>
            )
          })}
        </div>

        <section aria-label={games[current].name} className="mt-6">
          {mounted ? (
            <Suspense fallback={<PageLoader label={`loading ${games[current].name.toLowerCase()}`} />}>
              <Game key={current} />
            </Suspense>
          ) : (
            <PageLoader label={`loading ${games[current].name.toLowerCase()}`} />
          )}
        </section>
      </div>
    </main>
  )
}
