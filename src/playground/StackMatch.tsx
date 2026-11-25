import { useEffect, useMemo, useRef, useState } from 'react'
import { usePortfolio } from '@/data/PortfolioContext'
import { cn } from '@/lib/utils'
import { SkillIcon } from '@/components/site/SkillIcon'
import type { Skill } from '@/types/content'
import { GameFrame, ResultPanel, Stat } from './GameFrame'
import { readBest, saveBest } from './scores'

/** Stack Match: a memory game built from the technologies in the portfolio's own skills list. */

const PAIRS = 6
const FALLBACK: Pick<Skill, 'name' | 'icon' | 'icon_url'>[] = [
  { name: 'React', icon: 'react', icon_url: null },
  { name: 'Next.js', icon: 'nextdotjs', icon_url: null },
  { name: 'Angular', icon: 'angular', icon_url: null },
  { name: 'TypeScript', icon: 'typescript', icon_url: null },
  { name: 'Node.js', icon: 'nodedotjs', icon_url: null },
  { name: 'MongoDB', icon: 'mongodb', icon_url: null },
]

interface Card {
  key: number
  pair: number
  skill: Pick<Skill, 'name' | 'icon' | 'icon_url'>
}

function deal(pool: Pick<Skill, 'name' | 'icon' | 'icon_url'>[]): Card[] {
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, PAIRS)
  const cards = picks.flatMap((skill, pair) => [
    { pair, skill },
    { pair, skill },
  ])
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards.map((c, key) => ({ ...c, key }))
}

export default function StackMatch() {
  const { data } = usePortfolio()
  const pool = useMemo(() => {
    // Prefer skills that have an icon and unique names; fall back to a core list.
    const seen = new Set<string>()
    const withIcons = data.skills.filter((s) => (s.icon || s.icon_url) && !seen.has(s.icon || s.name) && seen.add(s.icon || s.name))
    return withIcons.length >= PAIRS ? withIcons : FALLBACK
  }, [data.skills])

  const [cards, setCards] = useState<Card[]>(() => deal(pool))
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [record, setRecord] = useState(false)
  const [best, setBest] = useState<number | undefined>(undefined)
  const lock = useRef(false)

  useEffect(() => setBest(readBest().memory), [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const reset = () => {
    setCards(deal(pool))
    setOpen([])
    setMatched(new Set())
    setMoves(0)
    setSeconds(0)
    setRunning(false)
    setDone(false)
    setRecord(false)
    lock.current = false
  }

  const flip = (idx: number) => {
    if (lock.current || done || open.includes(idx) || matched.has(cards[idx].pair)) return
    if (!running) setRunning(true)
    const next = [...open, idx]
    setOpen(next)
    if (next.length < 2) return

    setMoves((m) => m + 1)
    const [a, b] = next
    if (cards[a].pair === cards[b].pair) {
      const all = new Set(matched).add(cards[a].pair)
      setMatched(all)
      setOpen([])
      if (all.size === PAIRS) {
        setRunning(false)
        setDone(true)
        setRecord(saveBest('memory', moves + 1, true))
        setBest(readBest().memory)
      }
    } else {
      lock.current = true
      setTimeout(() => {
        setOpen([])
        lock.current = false
      }, 750)
    }
  }

  return (
    <GameFrame
      title="stack-match.ts · find the pairs"
      hud={
        <>
          <Stat label="moves" value={moves} accent={running} />
          <Stat label="pairs" value={`${matched.size}/${PAIRS}`} />
          <Stat label="time" value={`${seconds}s`} />
          <Stat label="best" value={best ? `${best} moves` : '—'} />
        </>
      }
      footer="Flip two cards at a time and match the technologies from my stack in as few moves as possible."
    >
      {done ? (
        <ResultPanel
          title={`Stack assembled in ${moves} moves`}
          lines={[
            ['moves', moves],
            ['time', `${seconds}s`],
            ['pairs', PAIRS],
          ]}
          record={record}
          onRetry={reset}
        />
      ) : (
        <ul className="mx-auto grid max-w-lg grid-cols-3 gap-2.5 sm:grid-cols-4" style={{ perspective: '900px' }}>
          {cards.map((c, idx) => {
            const faceUp = open.includes(idx) || matched.has(c.pair)
            const isMatched = matched.has(c.pair)
            return (
              <li key={c.key}>
                <button
                  onClick={() => flip(idx)}
                  aria-label={faceUp ? c.skill.name : `Hidden card ${idx + 1}`}
                  className="relative block aspect-[4/5] w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{ transform: faceUp ? 'rotateY(180deg)' : 'none' }}
                >
                  {/* back */}
                  <span className="bg-grid-fine absolute inset-0 grid place-items-center rounded-xl border border-line-strong bg-black/40 font-mono text-lg text-accent/70 [backface-visibility:hidden]">
                    {'</>'}
                  </span>
                  {/* front */}
                  <span
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border p-2 [backface-visibility:hidden] [transform:rotateY(180deg)]',
                      isMatched ? 'border-accent/50 bg-accent/[0.08]' : 'border-accent-2/40 bg-accent-2/[0.06]',
                    )}
                  >
                    <SkillIcon skill={c.skill} className="h-8 w-8" />
                    <span className="text-center text-[0.7rem] leading-tight font-medium text-fg">{c.skill.name}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </GameFrame>
  )
}
