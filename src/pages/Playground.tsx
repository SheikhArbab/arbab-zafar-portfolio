import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bug, Keyboard, Layers } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { playgroundHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { cn } from '@/lib/utils'
import { PageLoader } from '@/components/site/PageLoader'
import { BEST_EVENT, readBest } from '@/playground/scores'
import { useLocale, useLocalePath, useT } from '@/i18n'

// Each game is its own small chunk, fetched only when opened.
const games = {
  typing: { Icon: Keyboard, Comp: lazy(() => import('@/playground/KeystrokeSprint')) },
  bugs: { Icon: Bug, Comp: lazy(() => import('@/playground/BugHunt')) },
  memory: { Icon: Layers, Comp: lazy(() => import('@/playground/StackMatch')) },
} as const

type GameKey = keyof typeof games
const isGame = (v: string | null): v is GameKey => v === 'typing' || v === 'bugs' || v === 'memory'

export default function Playground() {
  const { data } = usePortfolio()
  const copy = data.settings.content.playground
  const t = useT()
  const locale = useLocale()
  const lp = useLocalePath()
  const names = t.playground.games
  const [params, setParams] = useSearchParams()
  const [best, setBest] = useState<ReturnType<typeof readBest>>({})
  // Games are client-only (random boards, timers, localStorage): the server and first
  // client render both show the placeholder, so hydration matches and nothing suspends on the server.
  // The ?game= query is also applied after mount, because prerendered HTML has no query string.
  const [mounted, setMounted] = useState(false)
  const fromUrl = params.get('game')
  const current: GameKey = mounted && isGame(fromUrl) ? fromUrl : 'typing'
  useHead(playgroundHead(data, locale))
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    setBest(readBest())
    const onBest = () => {
      setBest(readBest())
    }
    window.addEventListener(BEST_EVENT, onBest)
    return () => window.removeEventListener(BEST_EVENT, onBest)
  }, [current])

  const Game = games[current].Comp
  const bestLabel = (k: GameKey) => {
    const v = best[k]
    if (v === undefined) return t.playground.notPlayed
    return k === 'typing' ? t.playground.bestWpm(v) : k === 'bugs' ? t.playground.bestPts(v) : t.playground.bestMoves(v)
  }

  return (
    <main id="main" className="pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link to={lp('/')} className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> {t.playground.back}
        </Link>
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">// {copy.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white md:text-6xl">{copy.heading}</h1>
        {copy.description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{copy.description}</p>}

        <div
          role="tablist"
          aria-label={t.playground.choose}
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
          onKeyDown={(e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
            const keys = Object.keys(games) as GameKey[]
            const next = keys[(keys.indexOf(current) + (e.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length]
            setParams({ game: next }, { replace: true })
            setTimeout(() => {
              document.getElementById(`game-tab-${next}`)?.focus()
            }, 0)
          }}
        >
          {(Object.keys(games) as GameKey[]).map((k) => {
            const { Icon } = games[k]
            const { name, blurb } = names[k]
            const active = k === current
            return (
              <button
                key={k}
                id={`game-tab-${k}`}
                role="tab"
                aria-selected={active}
                aria-controls="game-panel"
                tabIndex={active ? 0 : -1}
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

        <section id="game-panel" role="tabpanel" aria-labelledby={`game-tab-${current}`} className="mt-6">
          {mounted ? (
            <Suspense fallback={<PageLoader label={t.playground.loadingGame(names[current].name)} />}>
              <Game key={current} />
            </Suspense>
          ) : (
            <PageLoader label={t.playground.loadingGame(names[current].name)} />
          )}
        </section>
      </div>
    </main>
  )
}
